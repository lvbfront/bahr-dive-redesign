import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import en, { type Content } from '../content/en'
import ar from '../content/ar'
import { safeStorage } from './hooks'
import { SECTIONS, diveStore } from './dive'
import { ScrollTrigger } from './gsap'
import { getLenis } from '../providers/SmoothScroll'

export type Lang = 'en' | 'ar'
const KEY = 'bahr-lang'

/**
 * Language switch lifecycle (see CLAUDE.md → Decisions → "Language switch"):
 * idle → covering (veil fades in) → covered (lang committed, page subtree remounts) → revealing (veil fades out) → idle
 */
export type SwitchPhase = 'idle' | 'covering' | 'covered' | 'revealing'

type Ctx = {
  lang: Lang
  t: Content
  dir: 'ltr' | 'rtl'
  isRTL: boolean
  toggle: () => void
  phase: SwitchPhase
  /** veil finished covering → commit the language */
  onCovered: () => void
  /** remounted page has measured itself → restore scroll and reveal */
  onPageReady: () => void
  /** veil finished fading out */
  onRevealed: () => void
}
const LangContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  if (typeof document !== 'undefined' && document.documentElement.lang === 'ar') return 'ar'
  return safeStorage.get(KEY) === 'ar' ? 'ar' : 'en'
}

type Anchor = { index: number; within: number }

/** Where we are, expressed per section so it survives the layout change (pins, text length, direction). */
function captureAnchor(): Anchor {
  const index = diveStore.getSection()
  const el = document.getElementById(SECTIONS[index].id)
  if (!el) return { index: 0, within: 0 }
  const top = el.getBoundingClientRect().top + window.scrollY
  return { index, within: Math.max(0, Math.min(1, (window.scrollY - top) / Math.max(1, el.offsetHeight))) }
}

function restoreAnchor(a: Anchor) {
  const el = document.getElementById(SECTIONS[a.index].id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY
  const y = Math.round(top + a.within * el.offsetHeight)
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo(0, y)
  ScrollTrigger.update()
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [phase, setPhase] = useState<SwitchPhase>('idle')
  const anchor = useRef<Anchor | null>(null)
  const t = lang === 'ar' ? ar : en
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useLayoutEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, dir, t])

  const toggle = useCallback(() => {
    setPhase((p) => (p === 'idle' ? 'covering' : p))
  }, [])

  const onCovered = useCallback(() => {
    anchor.current = captureAnchor()
    getLenis()?.stop()
    setLang((l) => {
      const next = l === 'en' ? 'ar' : 'en'
      safeStorage.set(KEY, next)
      return next
    })
    setPhase('covered')
  }, [])

  const onPageReady = useCallback(() => {
    ScrollTrigger.refresh()
    if (anchor.current) restoreAnchor(anchor.current)
    anchor.current = null
    getLenis()?.start()
    setPhase('revealing')
  }, [])

  const onRevealed = useCallback(() => setPhase('idle'), [])

  const value = useMemo(
    () => ({ lang, t, dir, isRTL: lang === 'ar', toggle, phase, onCovered, onPageReady, onRevealed }) as Ctx,
    [lang, t, dir, toggle, phase, onCovered, onPageReady, onRevealed],
  )
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang outside LangProvider')
  return ctx
}
