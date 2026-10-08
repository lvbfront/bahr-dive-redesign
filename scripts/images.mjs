// Convert website screenshots in public/work/ to optimised WebP (max 1280 px wide, q80) and remove the originals.
// Usage: drop alageely.png / riyadh-retina.jpg / sycleague.png / lineup.png into public/work/, then `npm run images`.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.resolve('public/work')
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|avif|webp)$/i.test(f)) : []
if (!files.length) console.log('No images in public/work/ — nothing to do.')
for (const f of files) {
  const src = path.join(dir, f)
  const slug = path.basename(f, path.extname(f)).toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const out = path.join(dir, `${slug}.webp`)
  const tmp = `${out}.tmp`
  const info = await sharp(src).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 80 }).toFile(tmp)
  fs.renameSync(tmp, out)
  if (path.resolve(src) !== path.resolve(out)) fs.rmSync(src)
  console.log(`${f} → ${path.relative(process.cwd(), out)} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`)
}
