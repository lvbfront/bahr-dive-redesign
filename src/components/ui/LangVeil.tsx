import { useRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { useLang } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/hooks'

/** Short fade that hides the page while it is rebuilt in the other language/direction. */
export function LangVeil() {
  const { phase, onCovered, onRevealed } = useLang()
  const reduced = useReducedMotion()
  const color = useRef('#050b12')
  const show = phase === 'covering' || phase === 'covered'
  if (phase === 'covering') color.current = document.body.style.backgroundColor || '#e6e6df'

  return (
    <AnimatePresence onExitComplete={onRevealed}>
      {show && (
        <m.div
          key="veil"
          aria-hidden
          className="fixed inset-0 z-[97]"
          style={{ backgroundColor: color.current }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0.01 : 0.45, ease: 'easeOut' } }}
          transition={{ duration: reduced ? 0.01 : 0.28, ease: 'easeIn' }}
          onAnimationComplete={() => {
            if (phase === 'covering') onCovered()
          }}
        />
      )}
    </AnimatePresence>
  )
}
