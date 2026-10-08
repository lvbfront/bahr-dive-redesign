import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useLang } from '../../lib/i18n'
import { markIntroDone } from '../hero/heroState'
import { useReducedMotion } from '../../lib/hooks'

const EXPO = [0.16, 1, 0.3, 1] as const

/**
 * ~1.3 s intro: a drop falls and hits the water, rings spread, then the hero surfaces.
 * Never blocks content: it sits over an already-rendered page, any input skips it, and it's skipped entirely in reduced motion.
 */
export function Intro() {
  const { t } = useLang()
  const reduced = useReducedMotion()
  const [show, setShow] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (!show) {
      markIntroDone()
      return
    }
    const done = () => setShow(false)
    const timer = window.setTimeout(done, 1350)
    const skip = () => done()
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })
    window.addEventListener('touchstart', skip, { once: true, passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchstart', skip)
    }
  }, [show])

  if (reduced) return null
  return (
    <AnimatePresence onExitComplete={markIntroDone}>
      {show && (
        <m.div
          key="intro"
          className="fixed inset-0 z-[95] flex items-center justify-center bg-surface text-ink"
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeOut' } }}
          onClick={() => setShow(false)}
        >
          <button
            type="button"
            onClick={() => setShow(false)}
            className="absolute end-6 bottom-6 rounded-full border border-current px-4 py-2 text-xs"
          >
            {t.a11y.introSkip}
          </button>
          <div className="relative flex size-64 items-center justify-center" aria-hidden>
            {/* drop */}
            <m.span
              className="absolute top-0 left-1/2 block h-5 w-3.5 -translate-x-1/2 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-glow"
              initial={{ y: -220, opacity: 0, scaleY: 1.3 }}
              animate={{ y: 120, opacity: [0, 1, 1, 0], scaleY: [1.3, 1.3, 1, 0.4] }}
              transition={{ duration: 0.6, ease: [0.55, 0, 1, 0.45], times: [0, 0.1, 0.9, 1] }}
            />
            {/* rings */}
            {[0, 1, 2].map((i) => (
              <m.span
                key={i}
                className="absolute top-[132px] left-1/2 block h-6 w-16 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-glow"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 4.5], opacity: [0.9, 0] }}
                transition={{ duration: 1.1, delay: 0.55 + i * 0.13, ease: EXPO }}
              />
            ))}
            <m.span
              dir="ltr"
              lang="en"
              className="font-display absolute top-[150px] text-2xl font-extrabold tracking-[0.02em] text-ink"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6, ease: EXPO }}
            >
              {t.intro.slice(0, -1)}
              <span className="text-glow">{t.intro.slice(-1)}</span>
            </m.span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
