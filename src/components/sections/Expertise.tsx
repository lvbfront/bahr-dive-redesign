import { useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, m } from 'motion/react'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { useDesktop, useReducedMotion } from '../../lib/hooks'
import { ServiceVisual } from './ExpertiseVisuals'

const EXPO = [0.16, 1, 0.3, 1] as const

function Header() {
  const { t, isRTL } = useLang()
  return (
    <div data-head className="flex flex-col gap-6">
      <p className="kicker">
        <span dir="ltr">{t.expertise.index}</span> / {t.expertise.kicker}
      </p>
      <h2
        id="expertise-title"
        data-title
        className={`font-display max-w-[12ch] font-bold ${
          isRTL ? 'text-[clamp(2.6rem,6vw,5.6rem)] leading-[1.2]' : 'text-[clamp(2.6rem,6.4vw,6.4rem)] leading-[0.92] tracking-[-0.03em]'
        }`}
      >
        {t.expertise.title}
      </h2>
      <p className="max-w-[24ch] text-lg text-muted">{t.expertise.statement}</p>
    </div>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-[var(--line)] px-3 py-1 text-xs">
          {tag}
        </li>
      ))}
    </ul>
  )
}

/** Desktop: pinned horizontal travel through three large panels (GSAP). */
function HorizontalExpertise() {
  const { t, lang, isRTL } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = track.current
      if (!el) return
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth)
      const title = SplitText.create(root.current!.querySelector('[data-title]')!, {
        type: 'lines,words',
        mask: 'lines',
        linesClass: 'split-mask',
      })
      gsap.from(title.words, {
        yPercent: 110,
        stagger: 0.08,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
      const tween = gsap.to(el, {
        x: () => (isRTL ? distance() : -distance()),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      gsap.fromTo(
        root.current!.querySelector('[data-progress]'),
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } },
      )
      // Project-frame drift, computed from where each panel actually is on screen.
      // Panel TEXT is never animated by scroll: it is plain, always-visible content (a stuck reveal used to leave
      // panel 03 empty on short laptop viewports).
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]', root.current)
      const drifts = panels.map((panel) =>
        gsap.utils.toArray<HTMLElement>('[data-drift]', panel).map((d) => ({
          x: gsap.quickSetter(d, 'x', 'px') as (v: number) => void,
          r: gsap.quickSetter(d, 'rotate', 'deg') as (v: number) => void,
          amp: Number(d.dataset.amp) || 0,
          rot: Number(d.dataset.rot) || 0,
        })),
      )
      const sync = () => {
        const vw = window.innerWidth
        panels.forEach((panel, i) => {
          const r = panel.getBoundingClientRect()
          const travel = (r.left + r.width / 2 - vw / 2) / vw
          for (const d of drifts[i]) {
            d.x(travel * d.amp)
            d.r(travel * d.rot)
          }
        })
      }
      tween.eventCallback('onUpdate', sync)
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: () => `+=${distance() + window.innerHeight}`,
        onRefresh: sync,
      })
      sync()
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  return (
    <div ref={root} className="relative h-[100svh] overflow-hidden">
      <div ref={track} className="flex h-full w-max items-center gap-[4vw] ps-[calc(var(--gutter)+var(--rail))] pe-[8vw]">
        <div className="w-[34vw] shrink-0">
          <Header />
        </div>
        {t.expertise.services.map((s, i) => (
          <article
            key={s.key}
            data-panel
            className="relative grid h-[74svh] w-[72vw] max-w-[1200px] shrink-0 grid-cols-2 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[28px] border border-[var(--line)] bg-white/[0.03] backdrop-blur-[2px]"
          >
            <div className="flex min-h-0 flex-col justify-between p-[clamp(1.5rem,3vw,3rem)]">
              <span data-in dir="ltr" className="font-display text-sm text-muted rtl:text-end">
                0{i + 1} / 03
              </span>
              <div className="flex flex-col gap-[clamp(0.75rem,2.6svh,1.5rem)]">
                <h3 data-in className="font-display text-[clamp(2rem,min(4vw,7.5svh),4.2rem)] leading-[1] font-bold tracking-[-0.02em] rtl:leading-[1.3] rtl:tracking-normal">
                  {s.title}
                </h3>
                <p data-in className="max-w-[34ch] text-[clamp(1rem,2.4svh,1.125rem)] text-muted">
                  {s.body}
                </p>
                <div data-in>
                  <Tags tags={s.tags} />
                </div>
              </div>
            </div>
            <div className="relative min-h-0 overflow-hidden border-s border-[var(--line)]">
              <ServiceVisual kind={s.key} />
            </div>
          </article>
        ))}
      </div>
      <div className="absolute inset-x-[calc(var(--gutter)+var(--rail))] bottom-8 h-px bg-[var(--line)]">
        <div data-progress className="h-full origin-left bg-glow-bright rtl:origin-right" />
      </div>
    </div>
  )
}

/** Mobile / reduced motion: stacked accordion cards (Framer Motion layout). */
function StackedExpertise() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(gsap.utils.toArray('[data-card]', root.current), {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="py-[14svh] mob:py-[9svh] ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)]">
      <Header />
      <LayoutGroup>
        <ul className="mt-12 flex flex-col gap-4">
          {t.expertise.services.map((s, i) => {
            const isOpen = open === i
            return (
              <m.li
                layout
                key={s.key}
                data-card
                className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white/[0.03]"
                transition={{ layout: { duration: 0.6, ease: EXPO } }}
              >
                <m.button
                  layout="position"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`svc-${s.key}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-start"
                >
                  <span className="flex items-baseline gap-4">
                    <span dir="ltr" className="font-display text-sm text-muted">
                      0{i + 1}
                    </span>
                    <span className="font-display text-2xl font-bold sm:text-3xl">{s.title}</span>
                  </span>
                  <m.span
                    aria-hidden
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.5, ease: EXPO }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-current text-lg"
                  >
                    +
                  </m.span>
                </m.button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`svc-${s.key}`}
                      key="body"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.6, ease: EXPO }}
                    >
                      <div className="flex flex-col gap-5 px-6 pb-6">
                        <div className={`relative overflow-hidden rounded-2xl border border-[var(--line)] ${s.key === 'web' ? 'h-[10.5rem]' : 'h-44'}`}>
                          <ServiceVisual kind={s.key} variant="card" />
                        </div>
                        <p className="text-muted">{s.body}</p>
                        <Tags tags={s.tags} />
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.li>
            )
          })}
        </ul>
      </LayoutGroup>
    </div>
  )
}

export function Expertise() {
  const desktop = useDesktop()
  const reduced = useReducedMotion()
  return (
    <section id="expertise" aria-labelledby="expertise-title" className="relative z-10">
      {desktop && !reduced ? <HorizontalExpertise /> : <StackedExpertise />}
    </section>
  )
}
