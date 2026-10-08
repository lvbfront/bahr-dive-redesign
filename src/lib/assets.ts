// Optional, owner-provided assets. Paths are resolved from the build-time listing in vite.config.ts.

const PREFERRED = ['webp', 'avif', 'png', 'jpg', 'jpeg']

/** Public URL of a project's website screenshot, or null → render the named placeholder frame. */
export function workShot(slug?: string): string | null {
  if (!slug) return null
  for (const ext of PREFERRED) {
    const file = `${slug}.${ext}`
    if (__WORK_SHOTS__.includes(file)) return `/work/${file}`
  }
  return null
}

/** Bahr's "بحر" mark, only when a clean extraction exists. */
export const brandMark: string | null = __BRAND_MARK__ ? `/brand/${__BRAND_MARK__}` : null
