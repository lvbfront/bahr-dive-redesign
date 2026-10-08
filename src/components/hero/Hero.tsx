import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { m } from 'motion/react'
import { gsap, ScrollTrigger, SplitText, useGSAP, EASE_SCRUB } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { useInView, usePageVisible, useReducedMotion } from '../../lib/hooks'
import { heroState, INTRO_DONE, isIntroDone } from './heroState'
import { scrollToTarget } from '../../providers/SmoothScroll'

const WaterCanvas = lazy(() => import('./WaterCanvas'))
/** survives the page remount on a language switch: once loaded, load again immediately */
let glRequested = false

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!gl
  } catch {
    return false
  }
}

export function Hero() {
  const { t, lang, isRTL } = useLang()
  const reduced = useReducedMotion()
  const section = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const headline = useRef<HTMLHeadingElement>(null)
  const inView = useInView(section, '0px')
  const visible = usePageVisible()
  const [loadGL, setLoadGL] = useState(false)
  const [glReady, setGlReady] = useState(false)

  // Lazy-load the WebGL water after the page (and headline) has painted: on the first interaction, or ~4.5 s after
  // load when idle. WebGL support is only probed at that moment (creating a context is not free).
  useEffect(() => {
    if (reduced) return
    if (glRequested) {
      // remount after a language switch: bring the water back once the page has settled
      const id = window.setTimeout(() => webglAvailable() && setLoadGL(true), 900)
      return () => clearTimeout(id)
    }
    let cancelled = false
    let timer = 0
    const events = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'] as const
    const go = () => {
      if (cancelled) return
      cancelled = true
      cleanup()
      glRequested = true
      if (webglAvailable()) setLoadGL(true)
    }
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, go))
      window.removeEventListener('load', arm)
      clearTimeout(timer)
    }
    const arm = () => {
      timer = window.setTimeout(() => (window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 1500 }) : go()), 4500)
    }
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })
    return () => {
      cancelled = true
      cleanup()
    }
  }, [reduced])

  // Cursor → ripple input (normalised device coords)
  useEffect(() => {
    const el = section.current
    if (!el || reduced) return
    const onMove = (e: PointerEvent) => {
      heroState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      heroState.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
      heroState.pointer.moved = true
    }
    el.addEventListener('pointermove', onMove)
    return () => el.removeEventListener('pointermove', onMove)
  }, [reduced])

  // Headline reveal: rising like surfacing. EN splits to chars, AR to words (never chars).
  useGSAP(
    () => {
      const h = headline.current
      if (!h) return
      if (reduced) {
        gsap.fromTo(h, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power1.out' })
        return
      }
      const split = SplitText.create(h, {
        type: isRTL ? 'lines,words' : 'lines,words,chars',
        mask: 'lines',
        linesClass: 'split-mask',
      })
      const targets = isRTL ? split.words : split.chars
      gsap.set(targets, { yPercent: 115, rotate: isRTL ? 0 : 6 })
      const play = () =>
        gsap.to(targets, {
          yPercent: 0,
          rotate: 0,
          duration: 1.5,
          ease: 'expo.out',
          stagger: isRTL ? 0.12 : 0.028,
        })
      if (isIntroDone()) play()
      else {
        const onDone = () => play()
        window.addEventListener(INTRO_DONE, onDone, { once: true })
        const fallback = window.setTimeout(onDone, 1800)
        return () => {
          window.removeEventListener(INTRO_DONE, onDone)
          clearTimeout(fallback)
        }
      }
    },
    { scope: section, dependencies: [lang, reduced], revertOnUpdate: true },
  )

  // Pinned, scrubbed "breaking the surface" (~100vh)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(section)
        const tl = gsap.timeline({
          defaults: { ease: EASE_SCRUB },
          scrollTrigger: {
            trigger: pin.current,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: 0.9,
            onUpdate: (self) => (heroState.progress = self.progress),
            onLeave: () => (heroState.progress = 1),
            onLeaveBack: () => (heroState.progress = 0),
          },
        })
        tl.to(q('[data-headline]'), { yPercent: 38, filter: 'blur(14px)', opacity: 0, duration: 1 }, 0)
          .to(q('[data-meta]'), { y: -24, opacity: 0, duration: 0.4 }, 0)
          .to(q('[data-cue]'), { opacity: 0, duration: 0.2 }, 0)
          // the waterline sweeps up across the viewport as we go under
          .fromTo(q('[data-waterline]'), { yPercent: 0, opacity: 0 }, { yPercent: -125, opacity: 1, duration: 0.45 }, 0.18)
          .to(q('[data-waterline]'), { opacity: 0, duration: 0.15 }, 0.55)
          .fromTo(q('[data-under]'), { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.25)
          // CSS surface (fallback / pre-WebGL) rises away; WebGL handles its own camera
          .to(q('[data-css-surface]'), { yPercent: -60, scaleY: 0.6, opacity: 0, duration: 0.6 }, 0.2)
          .to(q('[data-water]'), { opacity: 0, duration: 0.3 }, 0.7)
          .to(q('[data-under]'), { opacity: 0, duration: 0.3 }, 0.7)
        return () => {
          heroState.progress = 0
        }
      })
      // fonts / language changes alter layout
      ScrollTrigger.refresh()
    },
    { scope: section, dependencies: [lang], revertOnUpdate: true },
  )

  return (
    <section id="top" ref={section} aria-labelledby="hero-title" className="relative">
      <div ref={pin} className="relative h-[100svh] min-h-[560px] overflow-hidden">
        {/* water */}
        <div data-water className="absolute inset-0" aria-hidden>
          <div data-css-surface className="water-fallback absolute inset-0 origin-top overflow-hidden" />
          <div data-under className="absolute inset-0 bg-[linear-gradient(180deg,#d9e6e7_0%,#9fb7c4_45%,#6f93a5_100%)] opacity-0" />
          {loadGL && (
            <m.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: glReady ? 1 : 0 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            >
              <Suspense fallback={null}>
                <WaterCanvas active={inView && visible} onReady={() => setGlReady(true)} />
              </Suspense>
            </m.div>
          )}
          {/* meniscus: the bright line of the surface sweeping past the lens */}
          <div
            data-waterline
            className="absolute inset-x-[-5%] top-full h-[38vh] opacity-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 46%, rgba(230,240,240,0.95) 50%, rgba(159,183,196,0.5) 62%, rgba(159,183,196,0) 100%)',
              filter: 'blur(6px)',
            }}
          />
        </div>

        {/* content */}
        <div className="relative z-10 flex h-full flex-col justify-between pt-28 pb-10 ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)] text-ink">
          <div data-meta className="flex flex-wrap items-start justify-between gap-4 text-sm">
            <p className="max-w-[22rem] font-medium">{t.hero.meta}</p>
            <p dir="ltr" className="hidden tabular-nums text-ink/60 sm:block">
              {t.hero.coords}
            </p>
          </div>

          <div data-headline className="will-change-transform">
            <h1
              id="hero-title"
              ref={headline}
              className={`font-display font-bold ${
                isRTL
                  ? 'text-[clamp(3.4rem,12vw,10.5rem)] leading-[1.15]'
                  : 'text-[clamp(2.6rem,10.2vw,10rem)] leading-[0.92] tracking-[-0.035em] [&_.word]:whitespace-nowrap'
              }`}
            >
              {t.hero.lines.map((line, i) => (
                <span key={`${lang}-${i}`} data-line className={`block ${i === 1 ? 'ps-[0.9em]' : ''}`}>
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <div data-cue className="flex items-end justify-between gap-6">
            <span className="hidden text-xs uppercase tracking-[0.25em] text-ink/55 sm:block rtl:tracking-normal">
              0 m — {t.depth.labels[0]}
            </span>
            <div>
              <a
                href="#agency"
                className="bob flex items-center gap-3 text-sm font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTarget('#agency', { duration: 2.4 })
                }}
                data-cursor
              >
                {t.hero.scroll}
                <span aria-hidden className="flex size-9 items-center justify-center rounded-full border border-current">
                  ↓
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
