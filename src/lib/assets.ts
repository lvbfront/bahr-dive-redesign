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
