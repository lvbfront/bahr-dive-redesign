import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { EMAIL, LINKEDIN } from '../../content/en'
import { Magnetic } from '../ui/Magnetic'
import { BahrMark } from '../brand/BahrMark'

const BUBBLES = [
  { l: '18%', s: 10, t: '3.2s', d: '0s', dx: '-6px' },
  { l: '32%', s: 6, t: '2.6s', d: '0.8s', dx: '4px' },
  { l: '48%', s: 14, t: '3.8s', d: '0.3s', dx: '-3px' },
  { l: '62%', s: 7, t: '2.9s', d: '1.4s', dx: '8px' },
  { l: '74%', s: 11, t: '3.5s', d: '0.6s', dx: '-8px' },
  { l: '40%', s: 5, t: '2.4s', d: '1.9s', dx: '5px' },
]

export function Contact() {
  const { t, lang, isRTL } = useLang()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // Bahr's mark: the treasure at the bottom of the dive — glows into view as we reach −3,000 m
      const mark = root.current!.querySelector('[data-mark]')
      if (mark)
        gsap.fromTo(
          mark,
          { opacity: 0, y: 28, filter: 'drop-shadow(0 0 0px rgba(61,108,240,0))' },
          {
            opacity: 1,
            y: 0,
            filter: 'drop-shadow(0 0 26px rgba(61,108,240,0.55))',
            ease: 'power2.inOut',
            scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top 10%', scrub: 0.8 },
          },
        )
      const title = root.current!.querySelector('[data-title]')!
      const split = SplitText.create(title, {
        type: isRTL ? 'lines,words' : 'lines,words,chars',
        mask: 'lines',
        linesClass: 'split-mask',
      })
      gsap.from(isRTL ? split.words : split.chars, {
        yPercent: 120,
        duration: 1.6,
        ease: 'expo.out',
        stagger: isRTL ? 0.1 : 0.025,
        scrollTrigger: { trigger: title, start: 'top 80%' },
      })
      gsap.from('[data-cin]', {
        y: 40,
        opacity: 0,
        duration: 1.3,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-cin]', start: 'top 92%' },
      })
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  return (
    <section
      id="contact"
      ref={root}
      aria-labelledby="contact-title"
      className="relative z-10 flex min-h-[100svh] flex-col justify-center overflow-hidden pt-32 pb-16 mob:min-h-0 mob:justify-start mob:pt-[12svh] mob:pb-12 ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)]"
    >
      {/* faint bioluminescence on the seabed */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            'radial-gradient(60% 50% at 70% 100%, rgba(61,108,240,0.16), transparent 70%), radial-gradient(40% 40% at 15% 100%, rgba(44,93,115,0.35), transparent 70%)',
        }}
      />
      <p className="kicker relative">{t.contact.kicker} — <span dir="ltr">−3,000 {t.depth.unit}</span></p>

      {/* Bahr's mark: the treasure at the bottom of the dive */}
      <div data-mark className="relative mt-10 w-[clamp(120px,15vw,210px)]">
        <BahrMark live className="w-full" />
      </div>

      <div className="relative mt-10 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
        <h2
          id="contact-title"
          data-title
          className={`font-display font-bold ${
            isRTL ? 'text-[clamp(3.2rem,10vw,9.5rem)] leading-[1.2]' : 'text-[clamp(2.8rem,8.6vw,9rem)] leading-[0.92] tracking-[-0.04em] [&_.word]:whitespace-nowrap'
          }`}
        >
          {t.contact.title.map((l, i) => (
            <span key={`${lang}-${i}`} data-line className={`block ${i === 1 ? 'text-glow-bright' : ''}`}>
              {l}
            </span>
          ))}
        </h2>

        <div data-cin className="justify-self-start lg:justify-self-end">
          <Magnetic strength={0.4}>
            <a
              href={`mailto:${EMAIL}`}
              className="group relative flex size-[clamp(11rem,22vw,17rem)] items-center justify-center overflow-hidden rounded-full bg-brand text-white shadow-[0_0_80px_-10px_rgba(61,108,240,0.75)] transition-[box-shadow] duration-500 hover:shadow-[0_0_120px_0px_rgba(61,108,240,0.85)]"
              data-cursor
            >
              <span aria-hidden className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                {BUBBLES.map((b, i) => (
                  <span
                    key={i}
                    className="bubble"
                    style={
                      {
                        left: b.l,
                        width: b.s,
                        height: b.s,
                        '--t': b.t,
                        '--delay': b.d,
                        '--dx': b.dx,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
              <span className="relative flex flex-col items-center gap-1 text-center">
                <span className="font-display text-xl font-bold">{t.contact.button}</span>
                <span aria-hidden className="text-2xl transition-transform duration-500 group-hover:-translate-y-1 rtl:-scale-x-100">
                  ↗
                </span>
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="relative mt-[10svh] grid gap-10 mob:mt-12 border-t border-[var(--line)] pt-10 md:grid-cols-12">
        <p data-cin className="max-w-[44ch] text-lg text-muted md:col-span-6">
          {t.contact.line}
        </p>
        <dl data-cin className="flex flex-col gap-5 md:col-span-5 md:col-start-8">
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-[0.2em] text-muted rtl:tracking-normal">{t.contact.emailLabel}</dt>
            <dd>
              <a href={`mailto:${EMAIL}`} dir="ltr" className="font-display inline-flex min-h-11 items-center text-[clamp(1.4rem,2.6vw,2.2rem)] font-semibold break-all hover:text-glow-bright" data-cursor>
                {EMAIL}
              </a>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-[0.2em] text-muted rtl:tracking-normal">{t.contact.linkedinLabel}</dt>
            <dd>
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-lg underline-offset-4 hover:text-glow-bright hover:underline" data-cursor>
                linkedin.com/company/bybahr <span className="sr-only">{t.a11y.opensNewTab}</span>
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
