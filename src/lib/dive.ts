// Tiny external store for the dive state that React needs to *render* (section index only).
// Continuous values (depth metres, progress) are written straight to the DOM / CSS vars — no re-renders.
import { useSyncExternalStore } from 'react'

export const SECTIONS = [
  { id: 'top', depth: 0 },
  { id: 'agency', depth: 40 },
  { id: 'clients', depth: 200 },
  { id: 'expertise', depth: 600 },
  { id: 'work', depth: 1200 },
  { id: 'contact', depth: 3000 },
] as const

export const MAX_DEPTH = 3000

/** Background colour at each section anchor (index-aligned with SECTIONS). */
export const DEPTH_COLORS = ['#e6e6df', '#9fb7c4', '#2c5d73', '#0e2a3a', '#08141d', '#050b12']

let sectionIndex = 0
const listeners = new Set<() => void>()

export const diveStore = {
  setSection(i: number) {
    if (i === sectionIndex) return
    sectionIndex = i
    listeners.forEach((l) => l())
  },
  getSection: () => sectionIndex,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  /** live values for imperative readers (marine snow, meter) */
  live: { metres: 0, progress: 0, depth01: 0, velocity: 0 },
}

export function useSectionIndex() {
  return useSyncExternalStore(diveStore.subscribe, diveStore.getSection, () => 0)
}
