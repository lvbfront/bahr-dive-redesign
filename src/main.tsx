import './styles/index.css'

// Tiny entry: index.html already paints a static hero shell; the app (React, GSAP, Motion) is fetched right after
// the page has loaded and painted, so it never competes with that first paint.
let started = false
const boot = () => {
  if (started) return
  started = true
  import('./boot')
}
const schedule = () => requestAnimationFrame(() => setTimeout(boot, 0))
// wait for the shell's first contentful paint (fallback: 2.5 s)
const afterFirstPaint = (cb: () => void) => {
  const timer = window.setTimeout(cb, 2500)
  try {
    const po = new PerformanceObserver((list) => {
      if (list.getEntriesByName('first-contentful-paint').length) {
        po.disconnect()
        clearTimeout(timer)
        cb()
      }
    })
    po.observe({ type: 'paint', buffered: true })
  } catch {
    clearTimeout(timer)
    cb()
  }
}
const onLoad = () => afterFirstPaint(schedule)
if (document.readyState === 'complete') onLoad()
else window.addEventListener('load', onLoad, { once: true })
// any early interaction starts the app immediately
;['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((e) => window.addEventListener(e, boot, { once: true, passive: true }))
