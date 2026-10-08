import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from '../../lib/hooks'

/** Web — flowing current lines */
export function CurrentLines({ active }: { active: boolean }) {
  const paths = Array.from({ length: 9 }, (_, i) => {
    const y = 30 + i * 30
    const a = 14 + (i % 3) * 8
    return `M -20 ${y} C 80 ${y - a}, 160 ${y + a}, 240 ${y} S 400 ${y - a}, 480 ${y} S 640 ${y + a}, 720 ${y}`
  })
  return (
    <svg viewBox="0 0 700 300" className={`h-full w-full ${active ? '' : 'paused'}`} aria-hidden preserveAspectRatio="xMidYMid slice">
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i === 4 ? '#6b8cff' : 'currentColor'}
          strokeOpacity={i === 4 ? 0.9 : 0.18 + (i % 3) * 0.08}
          strokeWidth={i === 4 ? 1.6 : 1}
          strokeDasharray={i % 2 ? '60 340' : '140 260'}
          style={{ animation: `current-flow ${7 + (i % 4) * 2.5}s linear infinite`, animationDelay: `${-i * 0.9}s` }}
        />
      ))}
    </svg>
  )
}

/** AI — glowing connected nodes, like plankton */
export function PlanktonNodes({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const rect = c.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    c.width = w * dpr
    c.height = h * dpr
    ctx.scale(dpr, dpr)
    const rnd = (s: number) => {
      const x = Math.sin(s * 999) * 10000
      return x - Math.floor(x)
    }
    const nodes = Array.from({ length: 28 }, (_, i) => ({
      x: rnd(i + 1) * w,
      y: rnd(i + 50) * h,
      vx: (rnd(i + 100) - 0.5) * 0.25,
      vy: (rnd(i + 150) - 0.5) * 0.25,
      glow: i % 6 === 0,
    }))
    const color = getComputedStyle(c).color
    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > w) n.vx *= -1
          if (n.y < 0 || n.y > h) n.vy *= -1
        }
      }
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 110) {
            ctx.strokeStyle = a.glow || b.glow ? `rgba(107,140,255,${(1 - d / 110) * 0.6})` : color
            ctx.globalAlpha = a.glow || b.glow ? 1 : (1 - d / 110) * 0.35
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      ctx.globalAlpha = 1
      for (const n of nodes) {
        if (n.glow) {
          ctx.shadowColor = '#6b8cff'
          ctx.shadowBlur = 14
          ctx.fillStyle = '#6b8cff'
        } else {
          ctx.shadowBlur = 0
          ctx.fillStyle = color
        }
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.glow ? 3.2 : 1.8, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0
      if (active && !reduced) raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [active, reduced])
  return <canvas ref={ref} aria-hidden className="h-full w-full" />
}

/** Mobile — phone outline with sonar rings */
export function SonarPhone({ active }: { active: boolean }) {
  return (
    <div className={`relative flex h-full w-full items-center justify-center ${active ? '' : 'paused'}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute aspect-square w-[34%] rounded-full border"
          style={{
            borderColor: i === 0 ? 'rgba(107,140,255,0.8)' : 'currentColor',
            opacity: 0.5,
            animation: 'sonar 4.2s cubic-bezier(0.16,1,0.3,1) infinite',
            animationDelay: `${i * 1.05}s`,
          }}
        />
      ))}
      <svg viewBox="0 0 120 230" className="relative h-[62%] w-auto">
        <rect x="4" y="4" width="112" height="222" rx="22" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="42" y="14" width="36" height="7" rx="3.5" fill="currentColor" opacity="0.6" />
        <circle cx="60" cy="118" r="5" fill="#6b8cff" style={{ animation: 'node-pulse 2.1s ease-in-out infinite' }} />
        <line x1="44" y1="210" x2="76" y2="210" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  )
}

export function ServiceVisual({ kind }: { kind: 'web' | 'ai' | 'mobile' }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, '0px')
  return (
    <div ref={ref} className="h-full w-full">
      {kind === 'web' && <CurrentLines active={inView} />}
      {kind === 'ai' && <PlanktonNodes active={inView} />}
      {kind === 'mobile' && <SonarPhone active={inView} />}
    </div>
  )
}
