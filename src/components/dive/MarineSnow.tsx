import { useEffect, useRef } from 'react'
import { diveStore } from '../../lib/dive'

/**
 * Sparse "marine snow" drifting upward past the diver once deeper than ~−200 m.
 * Canvas 2D, DPR ≤ 1.5, starts lazily, pauses when the tab is hidden or we're shallow. Not mounted in reduced motion.
 */
export function MarineSnow() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, window.matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5)
    let w = 0
    let h = 0
    type P = { x: number; y: number; r: number; v: number; a: number; s: number }
    let ps: P[] = []
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = w < 768 ? 18 : window.matchMedia('(pointer: coarse)').matches ? 30 : 70
      ps = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        v: Math.random() * 0.25 + 0.08,
        a: Math.random() * 0.5 + 0.2,
        s: Math.random() * Math.PI * 2,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let running = false
    let t = 0
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const d = diveStore.live.depth01
      // −200 m ≈ 0.4 on the piecewise scale; ramp in over the clients section
      const vis = Math.max(0, Math.min(1, (d - 0.36) / 0.2))
      canvas.style.opacity = String(vis)
      if (vis === 0) return
      t += 0.016
      const boost = Math.max(-6, Math.min(6, diveStore.live.velocity * 0.35))
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#d8f3f0'
      for (const p of ps) {
        p.y -= p.v + Math.max(0, boost) * p.v * 2
        p.x += Math.sin(t * 0.6 + p.s) * 0.15
        if (p.y < -4) {
          p.y = h + 4
          p.x = Math.random() * w
        }
        ctx.globalAlpha = p.a
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    const start = () => {
      if (running || document.hidden) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const onVis = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVis)
    // lazy: wait until the browser is idle after load
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))
    const id = idle(start)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
      if (window.cancelIdleCallback && typeof id === 'number') window.cancelIdleCallback(id)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[2] h-full w-full opacity-0" />
}
