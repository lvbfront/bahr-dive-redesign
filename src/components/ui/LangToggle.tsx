import { AnimatePresence, motion } from 'motion/react'
import { useLang } from '../../lib/i18n'

export function LangToggle() {
  const { t, lang, toggle } = useLang()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.a11y.langSwitch}
      className="relative flex h-11 min-w-11 items-center justify-center overflow-hidden rounded-full border border-current px-3 text-sm font-semibold"
      data-cursor
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={lang}
          lang={lang === 'en' ? 'ar' : 'en'}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-110%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {t.nav.lang === 'AR' ? 'ع' : 'EN'}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
