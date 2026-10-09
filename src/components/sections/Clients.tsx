import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { diveStore } from '../../lib/dive'

const REPEAT = 4

export function Clients() {
  const { t, lang, isRTL } = useLang()
  const root = useRef<HTMLElement>(null)

  // Currents: two rows drifting in opposite directions, nudged by scroll velocity. GSAP owns x.
  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>('[data-row]', root.current)
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
      // touch has no hover: the name drifting through the middle of the screen lights up instead
      const names = rows.map((row) => Array.from(row.querySelectorAll<HTMLElement>('[data-name]')))
      let litFrame = 0
      const light = () => {
        const mid = window.innerWidth / 2
        names.forEach((list) => {
          let best: HTMLElement | null = null
          let bestD = Infinity
          for (const el of list) {
            const r = el.getBoundingClientRect()
            const d = Math.abs(r.left + r.width / 2 - mid)
            if (d < bestD) {
              bestD = d
              best = el
            }
          }
          for (const el of list) el.toggleAttribute('data-lit', el === best)
        })
      }
      const states = rows.map((row, i) => {
        const dir = (i === 0 ? -1 : 1) * (isRTL ? -1 : 1)
        const state = { x: 0, speed: 1, half: row.scrollWidth / 2, dir }
        if (dir > 0) state.x = -state.half / 2
        const pause = () => gsap.to(state, { speed: 0, duration: 0.7, ease: 'power2.out', overwrite: true })
        const resume = () => gsap.to(state, { speed: 1, duration: 0.9, ease: 'power2.inOut', overwrite: true })
        if (touch) {
          // touch: tap a current to hold it still, tap again to let it drift
          row.addEventListener('click', () => (state.speed > 0.5 ? pause() : resume()))
        } else {
          row.addEventListener('mouseenter', pause)
          row.addEventListener('mouseleave', resume)
        }
        return { row, state }
      })
      const setters = states.map(({ row }) => gsap.quickSetter(row, 'x', 'px'))
      const onResize = () => states.forEach(({ row, state }) => (state.half = row.scrollWidth / 2))
      window.addEventListener('resize', onResize)

      let inView = false
      const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { rootMargin: '120px' })
      if (root.current) io.observe(root.current)

      const tick = (_time: number, delta: number) => {
        if (!inView) return
        const boost = Math.min(5, Math.abs(diveStore.live.velocity) * 0.12)
        states.forEach(({ state }, i) => {
          const base = reduced ? 0 : 0.045
          state.x += state.dir * delta * base * state.speed * (1 + boost)
          state.x = gsap.utils.wrap(-state.half, 0, state.x)
          setters[i](state.x)
        })
        if (touch && ++litFrame % 8 === 0) light()
      }
      gsap.ticker.add(tick)

      // stats count-up
      gsap.utils.toArray<HTMLElement>('[data-count]', root.current).forEach((el) => {
        const end = Number(el.dataset.count)
        const obj = { v: 0 }
        if (reduced) {
          el.textContent = String(end)
          return
        }
        el.textContent = '0'
        gsap.to(obj, {
          v: end,
          duration: 1.8,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        })
      })
      gsap.from(gsap.utils.toArray('[data-stat]', root.current), {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-stats]', start: 'top 88%' },
      })

      return () => {
        gsap.ticker.remove(tick)
        window.removeEventListener('resize', onResize)
        io.disconnect()
      }
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  return (
    <section id="clients" ref={root} aria-labelledby="clients-title" className="relative z-10 overflow-hidden py-[16svh] mob:py-[9svh]">
      <div className="ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)]">
        <h2 id="clients-title" className="kicker">
          {t.clients.kicker}
        </h2>
      </div>

      <ul className="sr-only">
        {t.clients.rows.flat().map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      <div aria-hidden className="mt-14 flex flex-col gap-4 md:gap-6" dir="ltr">
        {t.clients.rows.map((row, r) => (
          <div key={r} className="overflow-hidden">
            <div data-row className="marquee-row py-2">
              {Array.from({ length: REPEAT }).flatMap((_, k) =>
                row.map((name) => (
                  <span
                    key={`${k}-${name}`}
                    className={`group flex shrink-0 items-center gap-[clamp(1.5rem,4vw,4rem)] pe-[clamp(1.5rem,4vw,4rem)] ${r === 1 ? 'text-muted' : ''}`}
                  >
                    <span data-name className="font-display cursor-default text-[clamp(2.6rem,7.5vw,7.5rem)] leading-none font-bold tracking-[-0.03em] transition-[color,text-shadow] duration-700 hover:text-glow-bright hover:[text-shadow:0_0_32px_rgba(61,108,240,0.8)] data-[lit]:text-glow-bright data-[lit]:[text-shadow:0_0_32px_rgba(61,108,240,0.8)]">
                      {name}
                    </span>
                    <span className="size-2.5 rounded-full border border-current opacity-50" />
                  </span>
                )),
              )}
            </div>
          </div>
        ))}
      </div>

      <dl
        data-stats
        className="mt-[14svh] grid gap-10 mob:mt-12 mob:grid-cols-2 mob:gap-x-4 mob:gap-y-8 border-t border-[var(--line)] pt-10 ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)] sm:grid-cols-3"
      >
        {t.clients.stats.map((s, i) => (
          <div key={i} data-stat className={`flex flex-col gap-2 ${i === 2 ? 'mob:col-span-2' : ''}`}>
            <dt className="order-2 max-w-[22ch] text-sm text-muted">{s.label}</dt>
            <dd className="font-display order-1 text-[clamp(3rem,6vw,5.5rem)] leading-none font-bold tracking-[-0.03em]">
              {s.value !== null ? (
                <span data-count={s.value} dir="ltr">
                  {s.value}
                </span>
              ) : (
                <span className="text-[0.62em] whitespace-nowrap rtl:text-[0.5em]">{s.text}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
