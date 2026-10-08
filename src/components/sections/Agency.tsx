import { useRef } from 'react'
import { gsap, SplitText, useGSAP } from '../../lib/gsap'
import { useLang } from '../../lib/i18n'
import { Magnetic } from '../ui/Magnetic'
import { scrollToTarget } from '../../providers/SmoothScroll'

export function Agency() {
  const { t, lang, isRTL } = useLang()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(root)
      const mm = gsap.matchMedia()
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          if (ctx.conditions?.reduce) {
            gsap.from(q('[data-fade]'), {
              opacity: 0,
              duration: 0.8,
              ease: 'power1.out',
              scrollTrigger: { trigger: root.current, start: 'top 70%' },
            })
            return
          }
          // title rises
          const title = SplitText.create(q('[data-title]'), { type: 'lines,words', mask: 'lines', linesClass: 'split-mask' })
          gsap.from(title.words, {
            yPercent: 110,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: { trigger: q('[data-title]')[0], start: 'top 85%' },
          })
          // statement: word by word, scrubbed with scroll
          const st = SplitText.create(q('[data-statement]'), { type: 'words' })
          gsap.fromTo(
            st.words,
            { opacity: 0.12, filter: 'blur(4px)' },
            {
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'power2.inOut',
              stagger: 0.12,
              scrollTrigger: { trigger: q('[data-statement]')[0], start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
            },
          )
          // supporting paragraphs: line by line
          q('[data-para]').forEach((p) => {
            const s = SplitText.create(p, { type: 'lines', mask: 'lines', linesClass: 'split-mask' })
            gsap.from(s.lines, {
              yPercent: 100,
              opacity: 0,
              duration: 1.2,
              ease: 'expo.out',
              stagger: 0.09,
              scrollTrigger: { trigger: p, start: 'top 88%' },
            })
          })
          gsap.from(q('[data-cta]'), {
            y: 30,
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: q('[data-cta]')[0], start: 'top 92%' },
          })
        },
      )
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  )

  return (
    <section
      id="agency"
      ref={root}
      aria-labelledby="agency-title"
      className="relative z-10 -mt-[70svh] pt-[18vh] pb-[16vh] ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)]"
    >
      <p className="kicker" data-fade>
        <span dir="ltr">{t.agency.index}</span> / {t.agency.kicker}
      </p>
      <h2
        id="agency-title"
        data-title
        className={`font-display mt-8 max-w-[14ch] font-bold ${
          isRTL ? 'text-[clamp(2.8rem,8vw,7rem)] leading-[1.2]' : 'text-[clamp(2.8rem,8.5vw,8.5rem)] leading-[0.92] tracking-[-0.03em]'
        }`}
      >
        {t.agency.title}
      </h2>

      <div className="mt-[12vh] grid gap-12 lg:grid-cols-12">
        <p
          data-statement
          className={`font-display font-semibold lg:col-span-7 ${
            isRTL ? 'text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.45]' : 'text-[clamp(2rem,4.4vw,4rem)] leading-[1.05] tracking-[-0.02em]'
          }`}
        >
          {t.agency.statement}
        </p>
        <div className="flex flex-col gap-6 text-[1.06rem] text-muted lg:col-span-4 lg:col-start-9 lg:pt-3" data-fade>
          {t.agency.paragraphs.map((p, i) => (
            <p key={i} data-para className="max-w-[38ch]">
              {p}
            </p>
          ))}
          <div data-cta className="mt-4">
            <Magnetic>
              <a
                href="#expertise"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTarget('#expertise')
                }}
                className="group inline-flex items-center gap-3 rounded-full border border-current px-6 py-3.5 font-medium text-[var(--fg)] transition-colors duration-300 hover:bg-[var(--fg)] hover:text-[var(--fg-inverse)]"
                data-cursor
              >
                {t.agency.cta}
                <span aria-hidden className="inline-block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">
                  ↗
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
