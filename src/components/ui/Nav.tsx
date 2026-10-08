import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useLang } from '../../lib/i18n'
import { scrollToTarget, getLenis } from '../../providers/SmoothScroll'
import { LangToggle } from './LangToggle'

const EXPO = [0.16, 1, 0.3, 1] as const

export function Nav() {
  const { t, isRTL } = useLang()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(`#${id}`)
    // move focus for keyboard users without jumping
    const el = document.getElementById(id)
    el?.setAttribute('tabindex', '-1')
    el?.focus({ preventScroll: true })
  }

  const arrow = isRTL ? '←' : '→'
  const origin = isRTL ? '8% 4%' : '92% 4%'

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[140%] backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
      />
      <nav
        aria-label="Primary"
        className="flex items-center justify-between gap-6 py-5 ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)]"
      >
        <a href="#top" onClick={go('top')} aria-label={t.a11y.home} className="group flex items-baseline gap-2" data-cursor>
          <span className="font-display text-lg font-extrabold tracking-[0.12em]" lang="en">
            {t.brand.en}
          </span>
          <span className="text-muted">/</span>
          <span className="text-lg font-bold" lang="ar">
            {t.brand.ar}
          </span>
        </a>

        <ul className="hidden items-center gap-8 text-sm lg:flex">
          {t.nav.links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} className="group relative py-1" data-cursor>
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-[var(--o)] scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-expo)] [--o:left] group-hover:scale-x-100 rtl:[--o:right]" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <LangToggle />
          <a
            href="#contact"
            onClick={go('contact')}
            className="hidden items-center gap-2 rounded-full border border-current px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:bg-[var(--fg)] hover:text-[var(--fg-inverse)] sm:inline-flex"
            data-cursor
          >
            {t.nav.cta} <span aria-hidden>{arrow}</span>
          </a>
          <button
            type="button"
            className="relative flex size-11 items-center justify-center rounded-full border border-current lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.a11y.menuClose : t.a11y.menuOpen}
            onClick={() => setOpen((o) => !o)}
          >
            <m.span
              className="absolute h-px w-4 bg-current"
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }}
              transition={{ duration: 0.4, ease: EXPO }}
            />
            <m.span
              className="absolute h-px w-4 bg-current"
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }}
              transition={{ duration: 0.4, ease: EXPO }}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.a11y.menuOpen}
            className="fixed inset-0 -z-10 flex flex-col justify-between bg-[#050b12] px-[var(--gutter)] pt-28 pb-10 text-[#e9ede9] lg:hidden"
            initial={{ clipPath: `circle(0% at ${origin})` }}
            animate={{ clipPath: `circle(150% at ${origin})` }}
            exit={{ clipPath: `circle(0% at ${origin})` }}
            transition={{ duration: 0.8, ease: EXPO }}
          >
            <ul className="flex flex-col gap-2">
              {[...t.nav.links, { id: 'contact', label: t.nav.cta }].map((l, i) => (
                <m.li
                  key={l.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, delay: 0.12 + i * 0.06, ease: EXPO }}
                >
                  <a href={`#${l.id}`} onClick={go(l.id)} className="font-display block py-1 text-5xl font-bold">
                    {l.label}
                  </a>
                </m.li>
              ))}
            </ul>
            <m.p
              className="text-sm text-[#e9ede9]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              {t.hero.meta}
            </m.p>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
