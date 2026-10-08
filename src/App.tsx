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
import { Hero } from './components/hero/Hero'
import { Agency } from './components/sections/Agency'
import { Clients } from './components/sections/Clients'
import { Expertise } from './components/sections/Expertise'
import { Work } from './components/sections/Work'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'

const loadMotionFeatures = () => import('./lib/motion-features').then((r) => r.default)

export default function App() {
  const { t, lang } = useLang()
  const reduced = useReducedMotion()

  // Re-measure every trigger after a language/direction swap and once fonts have loaded.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <LazyMotion features={loadMotionFeatures} strict>
    <SmoothScroll>
      <a href="#main" className="skip-link">
        {t.a11y.skip}
      </a>
      <Intro />
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
      <Cursor />
    </SmoothScroll>
    </LazyMotion>
  )
}
