import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const list = (dir: string) => {
  try {
    return fs.readdirSync(dir)
  } catch {
    return []
  }
}
// Optional assets the owner drops in later — only what exists is referenced, so a missing file never 404s.
// (Restart the dev server after adding files.)
const workShots = list('public/work').filter((f) => /\.(webp|avif|png|jpe?g)$/i.test(f))
const brandMark = ['bahr-mark.webp', 'bahr-mark.png'].find((f) => list('public/brand').includes(f)) ?? null

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __WORK_SHOTS__: JSON.stringify(workShots),
    __BRAND_MARK__: JSON.stringify(brandMark),
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 1200,
  },
})
