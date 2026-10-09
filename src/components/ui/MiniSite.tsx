import type { Project } from '../../content/en'
import { workShot } from '../../lib/assets'

/** url() for this card's own gradient (several cards share a page, so ids are scoped per card) */
type L = { u: (name: 'royal' | 'radial') => string }

/*
 * A designed, abstract "mini website" for a project: a stylised wireframe (nav bar, hero block, content lines) in
 * Bahr's palette, with a different layout per project. It is deliberately NOT a fake screenshot of their real sites.
 * If a real screenshot exists in public/work/<slug>.webp it is shown instead.
 */

const NAVY = '#0b1630'
const DEEP = '#0f2a7a'
const ROYAL = '#1e40a8'
const BRIGHT = '#3d6cf0'
const TINT = '#8aa4ff'
const SURF = '#e6e6df'

function Nav({ dark = true }: { dark?: boolean }) {
  const ink = dark ? 'rgba(230,230,223,0.55)' : 'rgba(11,15,20,0.45)'
  return (
    <g>
      <rect x="8" y="7" width="16" height="4" rx="1" fill={dark ? SURF : NAVY} />
      <rect x="96" y="8" width="10" height="2" rx="1" fill={ink} />
      <rect x="110" y="8" width="10" height="2" rx="1" fill={ink} />
      <rect x="124" y="8" width="10" height="2" rx="1" fill={ink} />
      <rect x="138" y="6" width="14" height="6" rx="3" fill={BRIGHT} />
    </g>
  )
}

const lines = (x: number, y: number, ws: number[], fill: string, h = 2, gap = 5) =>
  ws.map((w, i) => <rect key={i} x={x} y={y + i * gap} width={w} height={h} rx={h / 2} fill={fill} />)

/** 0 — split hero (text left, image block right) + three service cards */
function Split({ u }: L) {
  return (
    <>
      <rect width="160" height="100" fill={NAVY} />
      <Nav />
      {lines(8, 24, [62, 48], SURF, 6, 9)}
      {lines(8, 46, [56, 50, 40], 'rgba(230,230,223,0.35)')}
      <rect x="8" y="62" width="22" height="6" rx="3" fill={BRIGHT} />
      <rect x="88" y="20" width="64" height="50" rx="4" fill={u('royal')} />
      <circle cx="132" cy="36" r="9" fill={TINT} opacity="0.5" />
      {[8, 58, 108].map((x) => (
        <rect key={x} x={x} y="78" width="44" height="16" rx="3" fill="rgba(138,164,255,0.14)" />
      ))}
    </>
  )
}

/** 1 — centred hero around a lens/circle, centred copy */
function Lens({ u }: L) {
  return (
    <>
      <rect width="160" height="100" fill={SURF} />
      <Nav dark={false} />
      <circle cx="80" cy="44" r="21" fill={u('radial')} />
      <circle cx="80" cy="44" r="9" fill={NAVY} />
      <circle cx="84" cy="40" r="3" fill={SURF} opacity="0.85" />
      {lines(46, 72, [68], NAVY, 5)}
      {lines(56, 81, [48, 36], 'rgba(11,15,20,0.35)')}
      <rect x="70" y="91" width="20" height="5" rx="2.5" fill={ROYAL} />
    </>
  )
}

/** 2 — bold diagonal hero band + a stats row */
function Band({ u }: L) {
  return (
    <>
      <rect width="160" height="100" fill={NAVY} />
      <path d="M0 18 L160 18 L160 52 L0 70 Z" fill={u('royal')} />
      <Nav />
      {lines(10, 28, [84], SURF, 9)}
      {lines(10, 42, [60], 'rgba(230,230,223,0.6)', 3)}
      {[10, 58, 106].map((x, i) => (
        <g key={x}>
          <rect x={x} y="76" width={18 + i * 4} height="7" rx="1.5" fill={TINT} />
          <rect x={x} y="87" width="34" height="2" rx="1" fill="rgba(230,230,223,0.35)" />
        </g>
      ))}
    </>
  )
}

/** 3 — poster grid (events) with date chips */
function Posters({ u }: L) {
  return (
    <>
      <rect width="160" height="100" fill={DEEP} />
      <Nav />
      {lines(8, 20, [70], SURF, 5)}
      {[8, 58, 108].map((x, i) => (
        <g key={x}>
          <rect x={x} y="32" width="44" height="60" rx="4" fill={i === 1 ? u('royal') : 'rgba(5,11,18,0.55)'} />
          <rect x={x + 4} y="36" width="14" height="8" rx="2" fill={i === 1 ? SURF : BRIGHT} />
          {lines(x + 4, 76, [30, 22], 'rgba(230,230,223,0.55)')}
        </g>
      ))}
    </>
  )
}

const LAYOUTS = [Split, Lens, Band, Posters]

export function MiniSite({ project, index, className = '' }: { project: Project; index: number; className?: string }) {
  const src = workShot(project.slug)
  if (src)
    return (
      <img
        src={src}
        alt={`${project.name} — website`}
        loading="lazy"
        decoding="async"
        width={640}
        height={400}
        className={`block aspect-[16/10] w-full object-cover object-top ${className}`}
      />
    )
  const Layout = LAYOUTS[index % LAYOUTS.length]
  const id = `${project.slug ?? project.name}-${index}`.replace(/\W+/g, '-')
  return (
    <svg
      viewBox="0 0 160 100"
      role="img"
      aria-label={`${project.name} — ${project.sector}`}
      className={`block aspect-[16/10] w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-royal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={DEEP} />
          <stop offset="0.55" stopColor={ROYAL} />
          <stop offset="1" stopColor={BRIGHT} />
        </linearGradient>
        <radialGradient id={`${id}-radial`}>
          <stop offset="0" stopColor={TINT} />
          <stop offset="0.6" stopColor={BRIGHT} />
          <stop offset="1" stopColor={ROYAL} />
        </radialGradient>
      </defs>
      <Layout u={(n) => `url(#${id}-${n})`} />
    </svg>
  )
}
