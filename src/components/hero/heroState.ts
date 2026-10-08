/** Shared, mutable hero state. GSAP writes `progress` from the pinned scrub; R3F reads it each frame. */
export const heroState = {
  /** 0 = at the surface, 1 = fully below and the surface has drifted away */
  progress: 0,
  pointer: { x: 0, y: 0, moved: false },
}

export const INTRO_DONE = 'bahr:intro-done'
let introDone = false
export const markIntroDone = () => {
  if (introDone) return
  introDone = true
  window.dispatchEvent(new Event(INTRO_DONE))
}
export const isIntroDone = () => introDone
