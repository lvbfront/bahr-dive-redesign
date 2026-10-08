import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 1.2 })
ScrollTrigger.config({ ignoreMobileResize: true })

/** Shared easing names (see CLAUDE.md). */
export const EASE_REVEAL = 'expo.out'
export const EASE_SCRUB = 'power2.inOut'

export { gsap, ScrollTrigger, SplitText, useGSAP }
