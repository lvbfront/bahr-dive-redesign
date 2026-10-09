import { useLang } from '../../lib/i18n'
import { scrollToTarget } from '../../providers/SmoothScroll'

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="relative z-10 border-t border-[var(--line)] pt-10 pb-[calc(2.5rem+var(--dock))] ps-[calc(var(--gutter)+var(--rail))] pe-[var(--gutter)] text-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-muted">{t.footer.place}</p>
          <p>{t.footer.copy}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            scrollToTarget(0, { duration: 3.2 })
            document.getElementById('top')?.focus({ preventScroll: true })
          }}
          className="group inline-flex min-h-12 items-center gap-3 self-start rounded-full border border-current px-5 py-3 font-medium transition-colors duration-300 hover:bg-[var(--fg)] hover:text-[var(--fg-inverse)] md:self-auto"
          data-cursor
        >
          {t.footer.back}
          <span aria-hidden className="transition-transform duration-500 group-hover:-translate-y-1">
            ↑
          </span>
        </button>
      </div>
    </footer>
  )
}
