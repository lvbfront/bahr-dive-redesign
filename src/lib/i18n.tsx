import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import en, { type Content } from '../content/en'
import ar from '../content/ar'
import { safeStorage } from './hooks'

export type Lang = 'en' | 'ar'
const KEY = 'bahr-lang'

type Ctx = { lang: Lang; t: Content; dir: 'ltr' | 'rtl'; isRTL: boolean; toggle: () => void }
const LangContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  if (typeof document !== 'undefined' && document.documentElement.lang === 'ar') return 'ar'
  return safeStorage.get(KEY) === 'ar' ? 'ar' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
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
    setLang((l) => {
      const next = l === 'en' ? 'ar' : 'en'
      safeStorage.set(KEY, next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ lang, t, dir, isRTL: lang === 'ar', toggle }) as Ctx, [lang, t, dir, toggle])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang outside LangProvider')
  return ctx
}
