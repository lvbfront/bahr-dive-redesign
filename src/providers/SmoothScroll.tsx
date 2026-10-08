import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../lib/hooks'
import { diveStore } from '../lib/dive'

let lenis: Lenis | null = null
export const getLenis = () => lenis

/** Scroll to an element / offset. Smooth via Lenis when available, native otherwise. */
export function scrollToTarget(target: string | number | HTMLElement, opts: { duration?: number } = {}) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (el === null) return
  if (lenis) {
    lenis.scrollTo(el, {
      duration: opts.duration ?? 1.6,
      easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    })
  } else {
    const top = typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'auto' })
  }
}

/** Lenis → GSAP ticker → ScrollTrigger.update. Disabled under prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    lenis = instance
    ;(window as unknown as { __lenis?: Lenis }).__lenis = instance
    instance.on('scroll', (l: Lenis) => {
      diveStore.live.velocity = l.velocity
      ScrollTrigger.update()
    })
    const raf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(raf)
      instance.destroy()
      lenis = null
    }
  }, [reduced])

  return <>{children}</>
}
