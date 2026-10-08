import { useEffect } from 'react'
import { LazyMotion } from 'motion/react'
import { ScrollTrigger } from './lib/gsap'
import { useLang } from './lib/i18n'
import { useReducedMotion } from './lib/hooks'
import { SmoothScroll } from './providers/SmoothScroll'
import { DiveController } from './components/dive/DiveController'
import { DepthMeter } from './components/dive/DepthMeter'
import { LightRays } from './components/dive/LightRays'
import { MarineSnow } from './components/dive/MarineSnow'
import { Nav } from './components/ui/Nav'
import { Cursor } from './components/ui/Cursor'
import { Intro } from './components/ui/Intro'
import { LangVeil } from './components/ui/LangVeil'
import { ErrorBoundary, StaticFallback } from './components/ui/ErrorBoundary'
import { Hero } from './components/hero/Hero'
import { Agency } from './components/sections/Agency'
import { Clients } from './components/sections/Clients'
import { Expertise } from './components/sections/Expertise'
import { Work } from './components/sections/Work'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'

const loadMotionFeatures = () => import('./lib/motion-features').then((r) => r.default)

/**
 * Everything GSAP touches (SplitText, pins, ScrollTriggers) lives in here. It is keyed by language, so a switch
 * unmounts it — every useGSAP context reverts its splits and pin-spacers with its component — and mounts a fresh
 * tree for the new direction. React never has to diff DOM that GSAP rewrote.
 */
function Page() {
  const { t, phase, onPageReady } = useLang()
  const reduced = useReducedMotion()

  // After a language switch: children have created their triggers → measure, restore position, reveal.
  useEffect(() => {
    if (phase !== 'covered') return
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(onPageReady)
    })
    return () => cancelAnimationFrame(id)
    // runs once per freshly keyed tree
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <LightRays />
      {!reduced && <MarineSnow />}
      <Nav />
      <DepthMeter />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <Agency />
        <Clients />
        <Expertise />
        <Work />
        <Contact />
      </main>
      <Footer />
      <DiveController />
    </>
  )
}

export default function App() {
  const { t, lang } = useLang()

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <SmoothScroll>
        <Intro />
        <ErrorBoundary
          key={lang}
          fallback={<StaticFallback title={t.hero.lines.join(' ')} line={t.contact.line} cta={t.a11y.reload} />}
          onError={() => ScrollTrigger.getAll().forEach((st) => st.kill(true))}
        >
          <Page />
        </ErrorBoundary>
        <LangVeil />
        <Cursor />
      </SmoothScroll>
    </LazyMotion>
  )
}
