const RAYS = [
  { left: '8%', w: '9vw', r: '14deg', d: '11s', o: 0.7 },
  { left: '22%', w: '4vw', r: '9deg', d: '9s', o: 0.5 },
  { left: '38%', w: '12vw', r: '4deg', d: '13s', o: 0.8 },
  { left: '57%', w: '5vw', r: '-3deg', d: '10s', o: 0.55 },
  { left: '70%', w: '10vw', r: '-8deg', d: '14s', o: 0.7 },
  { left: '88%', w: '6vw', r: '-13deg', d: '12s', o: 0.45 },
]

/** Sunlight shafts from the surface; fade out with --depth (written by DiveController). */
export function LightRays() {
  return (
    <div
      aria-hidden
      data-depth-var
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden mix-blend-soft-light"
      style={{ opacity: 'clamp(0, calc(1 - var(--depth, 0) * 3.2), 1)' }}
    >
      {RAYS.map((r, i) => (
        <span
          key={i}
          className="ray"
          style={
            {
              left: r.left,
              width: r.w,
              opacity: r.o,
              '--r': r.r,
              '--d': r.d,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
