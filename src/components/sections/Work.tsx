import { useRef, useState } from 'react'
import { AnimatePresence, m, useMotionValue, useSpring } from 'motion/react'
import { gsap, useGSAP } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'
import { WORK_URL, type Project } from '../../content/en'

const EXPO = [0.16, 1, 0.3, 1] as const
type Portal = { x: number; y: number; project: Project; phase: 'in' | 'out' }

function openProject(href: string) {
  const w = window.open(href, '_blank')
  if (w) w.opener = null
  else window.location.href = href // popup blocked → same tab
}

export function Work() {
  const { t, lang, isRTL } = useLang()
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const [portal, setPortal] = useState<Portal | null>(null)

  // cursor-follow glow (relative to list) + floating preview card (viewport)
  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const glowX = useSpring(gx, { stiffness: 220, damping: 30 })
  const glowY = useSpring(gy, { stiffness: 220, damping: 30 })
  const cx = useMotionValue(0)
  const cy = useMotionValue(0)
  const cardX = useSpring(cx, { stiffness: 160, damping: 22, mass: 0.6 })
  const cardY = useSpring(cy, { stiffness: 160, damping: 22, mass: 0.6 })

  const projects = t.work.projects.filter((p) => p.featured)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.utils.toArray<HTMLElement>('[data-row]', root.current).forEach((row) => {
        gsap.from(row.querySelectorAll('[data-rin]'), {
          yPercent: 60,
          opacity: 0,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.06,
          scrollTrigger: { trigger: row, start: 'top 90%' },
        })
        gsap.from(row.querySelector('[data-rule]'), {
          scaleX: 0,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: row, start: 'top 92%' },
        })
      })
      gsap.from('[data-work-title]', {
        yPercent: 40,
        opacity: 0,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-work-title]', start: 'top 85%' },
      })
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  const onMove = (e: React.PointerEvent) => {
    const r = list.current?.getBoundingClientRect()
    if (r) {
      gx.set(e.clientX - r.left)
      gy.set(e.clientY - r.top)
    }
    cx.set(e.clientX)
    cy.set(e.clientY)
  }

  const onOpen = (p: Project) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduced || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const x = e.clientX || window.innerWidth / 2
    const y = e.clientY || window.innerHeight / 2
    setPortal({ x, y, project: p, phase: 'in' })
  }

  return (
    <section
      id="work"
      ref={root}
      aria-labelledby="work-title"
      className="relative z-10 py-[18vh] ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-6">
          <p className="kicker">
            <span dir="ltr">{t.work.index}</span> / {t.work.kicker}
          </p>
          <h2
            id="work-title"
            data-work-title
            className={`font-display font-bold ${
              isRTL ? 'text-[clamp(2.8rem,7vw,6.5rem)] leading-[1.2]' : 'text-[clamp(2.8rem,8vw,8rem)] leading-[0.92] tracking-[-0.03em]'
            }`}
          >
            {t.work.title}
          </h2>
        </div>
        {fine && <p className="text-sm text-muted">{t.work.hint}</p>}
      </div>

      <ul
        ref={list}
        className="relative mt-[10vh]"
        onPointerMove={fine ? onMove : undefined}
        onPointerLeave={() => setActive(null)}
      >
        {/* bioluminescent glow following the cursor */}
        {fine && !reduced && (
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <m.span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 -z-0 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              x: glowX,
              y: glowY,
              background: 'radial-gradient(circle, rgba(61,108,240,0.38) 0%, rgba(30,64,168,0.12) 35%, transparent 68%)',
            }}
            animate={{ opacity: active === null ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          />
          </span>
        )}
        {projects.map((p, i) => (
          <li key={p.name} data-row className="relative">
            <span data-rule className="absolute inset-x-0 top-0 h-px origin-left bg-[var(--line)] rtl:origin-right" />
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onOpen(p)}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-[clamp(1.4rem,3.4vw,2.8rem)] sm:grid-cols-[4rem_1fr_auto_auto] sm:gap-x-8"
              data-cursor
              aria-label={`${p.name} — ${p.sector}${p.note ? `, ${p.note}` : ''}, ${p.year} ${t.a11y.opensNewTab}`}
            >
              <span data-rin dir="ltr" className="font-display col-start-1 row-start-1 text-sm text-muted rtl:text-end">
                0{i + 1}
              </span>
              <span data-rin className="col-start-2 row-start-1 block min-w-0">
                <span
                  className={`font-display block text-[clamp(2.1rem,6.5vw,6rem)] leading-[1] font-bold tracking-[-0.03em] transition-[color,translate,text-shadow,opacity] duration-500 ease-[var(--ease-expo)] group-hover:translate-x-3 group-hover:text-glow-bright group-hover:[text-shadow:0_0_40px_rgba(61,108,240,0.7)] rtl:group-hover:-translate-x-3 ${
                    active !== null && active !== i ? 'opacity-35' : ''
                  }`}
                >
                  {p.name}
                </span>
              </span>
              <span data-rin className="col-start-2 row-start-2 text-sm text-muted sm:col-start-3 sm:row-start-1 sm:text-base">
                {p.sector}
                {p.note && <span className="ms-2 rounded-full border border-[var(--line)] px-2 py-0.5 text-xs">{p.note}</span>}
              </span>
              <span data-rin className="col-start-3 row-start-1 flex items-center gap-4 text-sm tabular-nums sm:col-start-4">
                <span className="hidden sm:inline">{p.year}</span>
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-current transition-colors duration-300 group-hover:border-glow group-hover:bg-glow group-hover:text-white rtl:-scale-x-100"
                >
                  ↗
                </span>
              </span>
            </a>
          </li>
        ))}
        <li aria-hidden className="h-px bg-[var(--line)]" />
      </ul>

      <div className="mt-12 flex justify-end">
        <a
          href={WORK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 border-b border-current pb-1 text-lg font-medium"
          data-cursor
        >
          {t.work.all}
          <span aria-hidden className="transition-transform duration-500 group-hover:-translate-y-1 rtl:-scale-x-100">
            ↗
          </span>
          <span className="sr-only">{t.a11y.opensNewTab}</span>
        </a>
      </div>

      {/* floating preview card */}
      {fine && !reduced && (
        <m.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-50 hidden md:block"
          style={{ x: cardX, y: cardY }}
        >
          <AnimatePresence>
            {active !== null && (
              <m.div
                key={projects[active].name}
                className="absolute -top-[140px] left-8 flex h-[280px] w-[380px] items-end overflow-hidden rounded-2xl p-6"
                style={{
                  background: `radial-gradient(120% 90% at 20% 10%, ${projects[active].hue[1]} 0%, transparent 55%), radial-gradient(90% 90% at 90% 100%, ${projects[active].hue[1]}55 0%, transparent 60%), ${projects[active].hue[0]}`,
                  boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(138,164,255,0.3)',
                }}
                initial={{ opacity: 0, scale: 0.85, rotate: -4, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, rotate: 3, filter: 'blur(6px)' }}
                transition={{ duration: 0.5, ease: EXPO }}
              >
                <span className="absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.05)_0_2px,transparent_2px_14px)]" />
                <span className="font-display relative text-5xl leading-[0.95] font-extrabold tracking-[-0.03em] text-white">
                  {projects[active].name}
                </span>
                <span dir="ltr" className="absolute top-5 right-6 text-xs text-white/70 tabular-nums">
                  {projects[active].year}
                </span>
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      )}

      {/* portal: circle wipe, then the real project opens in a new tab */}
      <AnimatePresence>
        {portal && (
          <m.div
            key="portal"
            aria-hidden
            className="fixed inset-0 z-[90] flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at ${portal.x}px ${portal.y}px, ${portal.project.hue[1]} 0%, ${portal.project.hue[0]} 45%, #050b12 100%)`,
            }}
            initial={{ clipPath: `circle(0px at ${portal.x}px ${portal.y}px)` }}
            animate={{
              clipPath:
                portal.phase === 'in'
                  ? `circle(150vmax at ${portal.x}px ${portal.y}px)`
                  : `circle(0px at ${portal.x}px ${portal.y}px)`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: portal.phase === 'in' ? 0.6 : 0.8, ease: EXPO }}
            onAnimationComplete={() => {
              if (portal.phase === 'in') {
                openProject(portal.project.href)
                setPortal({ ...portal, phase: 'out' })
              } else setPortal(null)
            }}
          >
            <span className="font-display text-[clamp(3rem,10vw,9rem)] font-extrabold tracking-[-0.03em] text-white">
              {portal.project.name}
            </span>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
