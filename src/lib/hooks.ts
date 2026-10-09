import { useEffect, useState, useSyncExternalStore } from 'react'

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const REDUCED = '(prefers-reduced-motion: reduce)'
/** Phones: narrow screens, or short touch screens (landscape phones). Mirrors the `mob:` CSS variant. */
export const MOBILE = '(max-width: 767px), (pointer: coarse) and (max-height: 540px), (hover: none) and (max-height: 540px)'
export const TOUCH = '(hover: none), (pointer: coarse)'
export const useMobile = () => useMediaQuery(MOBILE)
export const useTouch = () => useMediaQuery(TOUCH)
export const isTouch = () => typeof window !== 'undefined' && window.matchMedia(TOUCH).matches
export const isMobile = () => typeof window !== 'undefined' && window.matchMedia(MOBILE).matches
/** Rough low-end check (memory / cores / data saver) → CSS water instead of WebGL. */
export function isLowEnd() {
  const n = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  return (n.deviceMemory !== undefined && n.deviceMemory <= 4) || (navigator.hardwareConcurrency || 8) <= 4 || !!n.connection?.saveData
}
export const useReducedMotion = () => useMediaQuery(REDUCED)
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')
export const useDesktop = () => useMediaQuery('(min-width: 1024px) and (min-height: 541px)')

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED).matches
}

/** true while the element is (near) the viewport */
export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '100px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}

/** Becomes true the first time the element comes near the viewport, then stays true (lazy rendering). */
export function useSeenOnce<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '400px') {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin, seen])
  return seen
}

export function usePageVisible() {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener('visibilitychange', cb)
      return () => document.removeEventListener('visibilitychange', cb)
    },
    () => document.visibilityState === 'visible',
    () => true,
  )
}

export const safeStorage = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* storage unavailable (private mode, blocked) — ignore */
    }
  },
}
