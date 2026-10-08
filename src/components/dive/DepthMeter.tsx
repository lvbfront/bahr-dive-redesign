import { useEffect, useRef } from 'react'
import { m, useAnimationControls } from 'motion/react'
import { gsap } from '../../lib/gsap'
import { MAX_DEPTH, diveStore, useSectionIndex } from '../../lib/dive'
import { useLang } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/hooks'

const fmt = new Intl.NumberFormat('en-US')

/** Fixed depth gauge — inline-start side (left in EN, right in AR). Values are written imperatively each tick. */
export function DepthMeter() {
  const { t } = useLang()
  const index = useSectionIndex()
  const reduced = useReducedMotion()
  const numRefs = useRef<HTMLSpanElement[]>([])
  const markerRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const pulse = useAnimationControls()
  const seabed = index === 5

  useEffect(() => {
    let shown = 0
    let lastText = ''
    const tick = () => {
      const target = diveStore.live.metres
      shown = reduced ? target : shown + (target - shown) * 0.12
      if (Math.abs(target - shown) < 0.5) shown = target
      const value = Math.round(shown)
      const text = value === 0 ? '0' : `−${fmt.format(value)}`
      if (text !== lastText) {
        lastText = text
        for (const el of numRefs.current) if (el) el.textContent = text
      }
      const p = Math.min(1, shown / MAX_DEPTH)
      // ease the marker so the shallow sections get room on the gauge
      const visual = Math.pow(p, 0.42)
      if (markerRef.current) markerRef.current.style.transform = `translateY(${(visual * 100).toFixed(2)}%)`
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${visual.toFixed(4)})`
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [reduced])

  useEffect(() => {
    if (seabed && !reduced) {
      pulse.start({ scale: [1, 2.6, 1], opacity: [1, 0.4, 1], transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } })
    }
  }, [seabed, reduced, pulse])

  const label = t.depth.labels[index]
  const unit = t.depth.unit

  return (
    <aside aria-label={t.a11y.depthMeter} className="pointer-events-none fixed z-30 select-none" data-meter>
      {/* desktop: vertical gauge on the inline-start rail */}
      <div className="fixed inset-y-0 start-0 hidden w-[var(--rail)] flex-col items-center justify-center gap-5 md:flex">
        <span className="text-[0.62rem] uppercase tracking-[0.3em] text-muted [writing-mode:vertical-rl] rtl:tracking-normal rtl:text-[0.8rem]">
          {t.a11y.depthMeter}
        </span>
        <div className="relative h-[38vh] w-px bg-[var(--line)]">
          <div ref={fillRef} className="absolute inset-0 origin-top bg-current opacity-60" />
          <div ref={markerRef} className="absolute inset-0">
            <m.span
              animate={pulse}
              className="absolute -start-[5px] -top-[5px] block size-[11px] rounded-full border border-current bg-[var(--fg-inverse)]"
              style={{ boxShadow: seabed ? '0 0 18px 2px #5ff2e6' : 'none', borderColor: seabed ? '#5ff2e6' : undefined }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span dir="ltr" className="font-display text-sm tabular-nums font-semibold" aria-live="off">
            <span ref={(el) => void (el && (numRefs.current[0] = el))}>0</span>
            <span className="ms-1 text-muted">{unit}</span>
          </span>
          <span className="max-w-[5.5rem] text-[0.65rem] leading-tight text-muted">{label}</span>
        </div>
      </div>

      {/* mobile: compact pill bottom inline-start */}
      <div className="fixed bottom-4 start-4 flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs backdrop-blur-md md:hidden">
        <span className="relative flex size-2">
          <span className={`absolute inset-0 rounded-full ${seabed ? 'bg-glow' : 'bg-current'}`} />
        </span>
        <span dir="ltr" className="font-display tabular-nums font-semibold">
          <span ref={(el) => void (el && (numRefs.current[1] = el))}>0</span> {unit}
        </span>
        <span className="text-muted">· {label}</span>
      </div>
      <span className="sr-only" aria-live="polite">{label}</span>
    </aside>
  )
}
