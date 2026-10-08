import { useEffect, useState } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'

/** Small ring that becomes a bubble over interactive elements. Fine pointers only. */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = fine && !reduced
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 })
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const html = document.documentElement
    html.classList.add('has-cursor')
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      const target = e.target as Element | null
      setHover(!!target?.closest('a, button, [data-cursor], [role="button"]'))
    }
    const leave = () => setVisible(false)
    const d = () => setDown(true)
    const u = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', d)
    window.addEventListener('pointerup', u)
    return () => {
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', d)
      window.removeEventListener('pointerup', u)
    }
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <m.div
        className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
        animate={{
          width: hover ? 56 : 18,
          height: hover ? 56 : 18,
          opacity: visible ? 1 : 0,
          scale: down ? 0.8 : 1,
          backgroundColor: hover ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0)',
          boxShadow: hover ? 'inset -6px -8px 14px rgba(255,255,255,0.25), inset 4px 4px 8px rgba(255,255,255,0.5)' : 'none',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      />
    </m.div>
  )
}
