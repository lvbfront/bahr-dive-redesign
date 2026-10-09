import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useLang } from '../../lib/i18n'
import { scrollToTarget, getLenis } from '../../providers/SmoothScroll'
import { LangToggle } from './LangToggle'

const EXPO = [0.16, 1, 0.3, 1] as const

function MenuIcon({ open }: { open: boolean }) {
  return (
    <>
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
    </>
  )
}

/**
 * Desktop: top bar with links, language and "Let's talk".
 * Phones: the wordmark stays on top; language + menu live in a floating dock at the bottom (thumb zone), and the menu
 * opens as a bottom sheet that closes from the same button.
 */
export function Nav() {
  const { t, isRTL } = useLang()
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const [dockAway, setDockAway] = useState(false)

  // Phones: the dock steps aside while you read (scrolling down) and returns as soon as you scroll up, stop near the
  // end, or open the menu — so it never parks on top of content.
  useEffect(() => {
    let last = window.scrollY
    let idle = 0
    const onScroll = () => {
      const y = window.scrollY
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 80
      if (y < 120 || atEnd || y < last - 6) setDockAway(false)
      else if (y > last + 6) setDockAway(true)
      last = y
      clearTimeout(idle)
      idle = window.setTimeout(() => setDockAway(false), 1400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(idle)
    }
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (open) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open) requestAnimationFrame(() => sheet.current?.querySelector<HTMLElement>('a')?.focus())
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // let the sheet release the scroll lock first
    requestAnimationFrame(() => scrollToTarget(`#${id}`))
    const el = document.getElementById(id)
    el?.setAttribute('tabindex', '-1')
    el?.focus({ preventScroll: true })
  }

  const arrow = isRTL ? '←' : '→'
  const menuButton = (extra: string) => (
    <button
      type="button"
      className={`relative flex items-center justify-center rounded-full border border-current ${extra}`}
      aria-expanded={open}
      aria-controls="site-menu"
      aria-label={open ? t.a11y.menuClose : t.a11y.menuOpen}
      onClick={() => setOpen((o) => !o)}
    >
      <MenuIcon open={open} />
    </button>
  )

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[140%] backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
        />
        <nav
          aria-label="Primary"
          className="flex items-center justify-between gap-6 pt-[max(1.25rem,var(--safe-top))] pb-5 ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)] mob:pt-[max(0.625rem,var(--safe-top))] mob:pb-2"
        >
          <a href="#top" onClick={go('top')} aria-label={t.a11y.home} className="group -my-2 flex min-h-11 items-center" data-cursor>
            <span dir="ltr" lang="en" className="font-display text-[1.35rem] leading-none font-extrabold tracking-[0.02em]">
              {t.brand.word}
              <span className="text-accent inline-block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-[-0.12em]">
                {t.brand.dot}
              </span>
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

          <div className="flex items-center gap-3 mob:hidden">
            <LangToggle />
            <a
              href="#contact"
              onClick={go('contact')}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-current px-5 text-sm font-medium transition-colors duration-300 hover:bg-[var(--fg)] hover:text-[var(--fg-inverse)]"
              data-cursor
            >
              {t.nav.cta} <span aria-hidden>{arrow}</span>
            </a>
            {menuButton('size-11 lg:hidden')}
          </div>
        </nav>
      </header>

      {/* phones: thumb dock */}
      <m.div
        animate={{ y: dockAway && !open ? 'calc(100% + 2rem)' : '0%' }}
        transition={{ duration: 0.45, ease: EXPO }}
        className="fixed z-[46] hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--fg-inverse)_72%,transparent)] p-1.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md mob:flex"
        style={{ bottom: 'calc(0.875rem + var(--safe-bottom))', insetInlineEnd: 'var(--gutter)' }}
      >
        <LangToggle className="!h-12 !min-w-12 border-transparent" />
        {menuButton('size-12 border-transparent bg-[var(--fg)] text-[var(--fg-inverse)]')}
      </m.div>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              key="scrim"
              aria-hidden
              className="fixed inset-0 z-[44] bg-[#050b12]/55"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <m.div
              key="sheet"
              ref={sheet}
              id="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t.a11y.menuOpen}
              className="fixed inset-x-0 bottom-0 z-[45] max-h-[88svh] overflow-y-auto rounded-t-[28px] bg-[#050b12] px-[var(--gutter)] pt-8 text-[#e9ede9] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]"
              style={{ paddingBottom: 'calc(var(--dock) + 2rem)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.55, ease: EXPO }}
            >
              <span aria-hidden className="mx-auto mb-6 block h-1 w-10 rounded-full bg-white/25" />
              <ul className="flex flex-col">
                {[...t.nav.links, { id: 'contact', label: t.nav.cta }].map((l, i) => (
                  <m.li
                    key={l.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.08 + i * 0.05, ease: EXPO }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={go(l.id)}
                      className={`font-display flex min-h-14 items-center justify-between border-b border-white/10 py-2 text-[clamp(1.9rem,8vw,2.6rem)] font-bold ${
                        l.id === 'contact' ? 'text-glow-bright' : ''
                      }`}
                    >
                      {l.label}
                      <span aria-hidden className="text-base font-normal text-white/40">
                        {arrow}
                      </span>
                    </a>
                  </m.li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-white/55">{t.hero.meta}</p>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
