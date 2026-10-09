import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { MOBILE, useReducedMotion } from '../../lib/hooks'
import { BahrMark } from '../brand/BahrMark'
import { scrollToTarget } from '../../providers/SmoothScroll'

/**
 * Bahr's mark floating at the water surface, then — scrubbed with the first part of the scroll — shrinking and flying
 * up into the nav's logo slot, where it stays (lighter: static gradient). Scrolling back to the top reverses it.
 *
 * It's a fixed element laid over the hero's `[data-hero-mark-slot]` (inside the pinned hero, so its viewport position
 * is stable during the flight) and tweened to `[data-nav-mark-slot]`. Lives in the language-keyed page tree, so a
 * language switch reverts the tween/trigger with everything else.
 */
export function HeroMark() {
  const { lang } = useLang()
  const reduced = useReducedMotion()
  const fly = useRef<HTMLDivElement>(null)
  const [docked, setDocked] = useState(false)

  useGSAP(
    () => {
      const el = fly.current
      const slot = document.querySelector<HTMLElement>('[data-hero-mark-slot]')
      const nav = document.querySelector<HTMLElement>('[data-nav-mark-slot]')
      if (!el || !slot || !nav) return
      const phone = window.matchMedia(MOBILE).matches

      // hero box: the slot's offset inside the pinned hero, which sits at the very top of the page
      const geom = () => {
        const hero = { x: slot.offsetLeft, y: slot.offsetTop, w: slot.offsetWidth, h: slot.offsetHeight }
        const n = nav.getBoundingClientRect()
        gsap.set(el, { left: hero.x, top: hero.y, width: hero.w, height: hero.h })
        return { dx: n.left - hero.x, dy: n.top - hero.y, s: n.height / Math.max(1, hero.h) }
      }
      geom()
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '#top',
          start: 'top top',
          end: () => `+=${window.innerHeight * (phone ? 0.3 : 0.42)}`,
          scrub: phone ? 0.3 : 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => setDocked(self.progress > 0.97),
          onRefresh: (self) => {
            geom()
            setDocked(self.progress > 0.97)
          },
        },
      })
      tl.fromTo(el, { x: 0, y: 0, scale: 1 }, { x: () => geom().dx, y: () => geom().dy, scale: () => geom().s, duration: 1 }, 0)
      tl.to('[data-mark-shadow]', { opacity: 0, scaleX: 0.4, duration: 0.5 }, 0)
      const onResize = () => geom()
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    },
    { dependencies: [lang, reduced], revertOnUpdate: true },
  )

  if (reduced) return null
  return (
    <div
      ref={fly}
      data-docked={docked || undefined}
      className={`hero-mark fixed top-0 left-0 z-[41] origin-top-left ${docked ? 'cursor-pointer' : ''}`}
      onClick={() => docked && scrollToTarget(0, { duration: 1.8 })}
    >
      <div className={docked ? '' : 'mark-bob'}>
        <BahrMark live paused={docked} className="h-full" />
      </div>
    </div>
  )
}
