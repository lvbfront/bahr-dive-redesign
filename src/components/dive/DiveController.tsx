import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { DEPTH_COLORS, SECTIONS, diveStore } from '../../lib/dive'
import { useLang } from '../../lib/i18n'
import { getLenis } from '../../providers/SmoothScroll'

function luminance(color: string) {
  // splitColor handles both "#hex" and "rgba()" (gsap.utils.interpolate returns either)
  const [r, g, b] = (gsap.utils.splitColor(color) as number[]).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * The page-wide dive: one ScrollTrigger maps scroll → background colour, --depth (0→1), metres and tone.
 * Anchors are each section's "top hits viewport top" position, so the mapping is piecewise per section.
 * Renders nothing; must be mounted AFTER the sections so their pins exist first.
 */
export function DiveController() {
  const { lang } = useLang()

  useGSAP(
    () => {
      const root = document.documentElement
      const body = document.body
      const themeMeta = document.querySelector('meta[name="theme-color"]')
      const anchorTriggers = SECTIONS.map((s) =>
        ScrollTrigger.create({ trigger: `#${s.id}`, start: 'top top', refreshPriority: -10 }),
      )
      let depthTargets: HTMLElement[] = []
      let tone = ''
      const lerpColor = DEPTH_COLORS.slice(0, -1).map((c, i) => gsap.utils.interpolate(c, DEPTH_COLORS[i + 1]))

      const update = (y: number) => {
        const max = ScrollTrigger.maxScroll(window)
        const anchors = anchorTriggers.map((st, i) => (i === 0 ? 0 : Math.min(st.start, max)))
        let i = 0
        while (i < anchors.length - 2 && y >= anchors[i + 1]) i++
        const span = Math.max(1, anchors[i + 1] - anchors[i])
        const f = gsap.utils.clamp(0, 1, (y - anchors[i]) / span)
        const metres = SECTIONS[i].depth + (SECTIONS[i + 1].depth - SECTIONS[i].depth) * f
        const color = lerpColor[i](f) as string
        const depth01 = (i + f) / (SECTIONS.length - 1)

        body.style.backgroundColor = color
        themeMeta?.setAttribute('content', color)
        for (const el of depthTargets) el.style.setProperty('--depth', depth01.toFixed(4))

        const nextTone = luminance(color) < 0.2 ? 'light' : 'dark'
        if (nextTone !== tone) {
          tone = nextTone
          root.dataset.tone = tone
        }

        const live = diveStore.live
        live.metres = metres
        live.depth01 = depth01
        live.progress = max > 0 ? y / max : 0

        // label: the section occupying the middle of the viewport
        const mid = y + window.innerHeight * 0.45
        let s = 0
        for (let k = 0; k < anchors.length; k++) if (mid >= anchors[k] || (k === anchors.length - 1 && y >= max - 2)) s = k
        diveStore.setSection(s)
      }

      const master = ScrollTrigger.create({
        start: 0,
        end: 'max',
        refreshPriority: -20,
        onUpdate: (self) => {
          // native (touch) scrolling: derive a Lenis-like velocity for the snow and the client currents
          if (!getLenis()) diveStore.live.velocity = self.getVelocity() / 60
          update(self.scroll())
        },
        onRefresh: (self) => {
          depthTargets = Array.from(document.querySelectorAll<HTMLElement>('[data-depth-var]'))
          update(self.scroll())
        },
      })
      update(window.scrollY)
      const decay = () => {
        if (!getLenis()) diveStore.live.velocity *= 0.9
      }
      gsap.ticker.add(decay)

      return () => {
        gsap.ticker.remove(decay)
        master.kill()
        anchorTriggers.forEach((t) => t.kill())
      }
    },
    { dependencies: [lang], revertOnUpdate: true },
  )

  return null
}
