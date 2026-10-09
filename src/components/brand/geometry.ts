// Single source of truth for Bahr's «بحر» mark: src/assets/bahr-mark.svg (vectorised from bybahr.com screenshots).
import svg from '../../assets/bahr-mark.svg?raw'

const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!
export const MARK_W = Number(vb[1])
export const MARK_H = Number(vb[2])
export const MARK_ASPECT = MARK_W / MARK_H
/** the mark's outline (three sub-paths: calligraphy, diamond, vertical stroke) */
export const MARK_D = svg.match(/ d="([^"]+)"/)![1]

/** CSS mask for the liquid canvas: the same path, black on transparent */
export const MARK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_W} ${MARK_H}" preserveAspectRatio="none"><path d="${MARK_D}"/></svg>`,
)}")`

/** Bahr's blues, sampled from the two screenshots (deep navy → royal → lighter blue) */
export const MARK_BLUES = {
  navy: '#0a1d4f',
  deep: '#0a2f80',
  royal: '#0b46a6',
  mid: '#1062b3',
  light: '#2a86d6',
}
