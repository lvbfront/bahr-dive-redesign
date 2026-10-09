import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { MARK_D, MARK_H, MARK_MASK, MARK_W } from './geometry'
import { Liquid } from './liquid'
import { isLowEnd, isTouch, useInView, usePageVisible, useReducedMotion } from '../../lib/hooks'

type Props = {
  /** flowing WebGL liquid inside the letters (falls back to the SVG gradient when not possible) */
  live?: boolean
  /** liquid speed multiplier */
  speed?: number
  /** keep the WebGL context but stop drawing and show the static SVG gradient (e.g. once docked in the nav) */
  paused?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Bahr's «بحر» mark. The SVG path (src/assets/bahr-mark.svg) is always rendered: it's the accessible image, the
 * pointer hit-test, and the fallback (a slowly turning gradient). When `live`, a small WebGL canvas clipped by the same
 * path paints a liquid gradient that drifts on its own and is stirred by the pointer/touch inside the letters.
 * Reduced motion, low-end touch devices or no WebGL → SVG only. Paused off-screen and in hidden tabs.
 */
export function BahrMark({ live = false, speed = 1, paused = false, className = '', style }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const path = useRef<SVGPathElement>(null)
  const liquid = useRef<Liquid | null>(null)
  const reduced = useReducedMotion()
  const gid = `bm${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [glReady, setGlReady] = useState(false)
  const inView = useInView(wrap, '80px')
  const visible = usePageVisible()
  const canLive = live && !reduced && !(isTouch() && isLowEnd())

  // create / destroy the liquid
  useEffect(() => {
    const c = canvas.current
    if (!canLive || !c) return
    let l: Liquid
    try {
      l = new Liquid(c, isTouch() ? 1.25 : 1.5)
    } catch {
      return // no WebGL → the SVG gradient stays
    }
    liquid.current = l
    setGlReady(true)
    const ro = new ResizeObserver(() => l.resize())
    ro.observe(c)
    const el = wrap.current!
    const onPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      let inside = false
      try {
        inside = !!path.current?.isPointInFill(new DOMPoint(x * MARK_W, y * MARK_H))
      } catch {
        inside = true
      }
      l.point(x, 1 - y, inside)
    }
    el.addEventListener('pointermove', onPointer, { passive: true })
    el.addEventListener('pointerdown', onPointer, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('pointermove', onPointer)
      el.removeEventListener('pointerdown', onPointer)
      l.destroy()
      liquid.current = null
      setGlReady(false)
    }
  }, [canLive])

  useEffect(() => {
    const l = liquid.current
    if (!l) return
    l.speed = speed
  }, [speed, glReady])

  // run only while visible
  useEffect(() => {
    const l = liquid.current
    if (!l) return
    if (inView && visible && !paused) l.start()
    else l.stop()
  }, [inView, visible, glReady, paused])
  const showGl = glReady && !paused

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="Bahr"
      className={`relative ${className}`}
      style={{ aspectRatio: `${MARK_W} / ${MARK_H}`, ...style }}
    >
      <svg
        viewBox={`0 0 ${MARK_W} ${MARK_H}`}
        aria-hidden
        className="absolute inset-0 h-full w-full overflow-visible transition-opacity duration-700"
        style={{ opacity: showGl ? 0 : 1 }}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#1a6cbd" />
            <stop offset="0.5" stopColor="#0b46a6" />
            <stop offset="1" stopColor="#0a2a6e" />
            {!reduced && (
              <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="28s" repeatCount="indefinite" />
            )}
          </linearGradient>
        </defs>
        <path ref={path} d={MARK_D} fill={`url(#${gid})`} />
      </svg>
      {canLive && (
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 h-full w-full transition-opacity duration-700"
          style={{
            opacity: showGl ? 1 : 0,
            maskImage: MARK_MASK,
            WebkitMaskImage: MARK_MASK,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
      )}
    </div>
  )
}
