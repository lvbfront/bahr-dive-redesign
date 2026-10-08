// Extract Bahr's blue "بحر" mark from a screenshot into a clean, tightly cropped transparent image.
//
//   npm run mark -- path/to/screenshot.png [--out public/brand]
//
// How: keep only saturated blue pixels (the mark's royal-blue → navy gradient). The light background, the grey contour
// lines and the black words are all low-saturation, so they drop out. Edge pixels get a soft alpha ramp, and their colour
// is un-mixed from the estimated background colour so there's no light fringe. Specks are removed, the result is
// cropped tightly, and written as bahr-mark.webp + bahr-mark.png.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const input = args.find((a) => !a.startsWith('--'))
const outDir = path.resolve(args.includes('--out') ? args[args.indexOf('--out') + 1] : 'public/brand')
if (!input || !fs.existsSync(input)) {
  console.error('Usage: npm run mark -- path/to/screenshot.png [--out public/brand]')
  process.exit(1)
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const px = (x, y) => (y * W + x) * 4

// Background colour: median of the image border.
const border = []
for (let x = 0; x < W; x += 3) border.push(px(x, 0), px(x, H - 1))
for (let y = 0; y < H; y += 3) border.push(px(0, y), px(W - 1, y))
const median = (c) => border.map((i) => data[i + c]).sort((a, b) => a - b)[border.length >> 1]
const bg = [median(0), median(1), median(2)]

const smooth = (e0, e1, v) => {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

// 1) blue score → alpha
const alpha = new Float32Array(W * H)
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = px(x, y)
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const sat = max === 0 ? 0 : (max - min) / max
    const blueLead = b - Math.max(r, g)
    alpha[y * W + x] = smooth(0.16, 0.34, sat) * smooth(8, 34, blueLead)
  }

// 2) drop specks: keep connected components (alpha > .5) of meaningful size
const label = new Int32Array(W * H).fill(-1)
const sizes = []
for (let s = 0; s < W * H; s++) {
  if (alpha[s] <= 0.5 || label[s] !== -1) continue
  const id = sizes.length
  let n = 0
  const stack = [s]
  label[s] = id
  while (stack.length) {
    const p = stack.pop()
    n++
    const x = p % W, y = (p / W) | 0
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const q = ny * W + nx
      if (alpha[q] > 0.5 && label[q] === -1) {
        label[q] = id
        stack.push(q)
      }
    }
  }
  sizes.push(n)
}
const largest = Math.max(0, ...sizes)
if (!largest) {
  console.error('No blue mark found in this image.')
  process.exit(2)
}
const keep = sizes.map((n) => n >= largest * 0.004)
// soft edge pixels (alpha ≤ .5) survive only next to a kept component
const kept = (x, y) => {
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
      const l = label[ny * W + nx]
      if (l !== -1 && keep[l]) return true
    }
  return false
}

// 3) un-mix colour from the background, build the output + bounding box
const out = Buffer.alloc(W * H * 4)
let x0 = W, y0 = H, x1 = -1, y1 = -1
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const s = y * W + x
    let a = alpha[s]
    if (a < 0.02 || !kept(x, y)) a = 0
    const i = s * 4
    if (a > 0) {
      for (let c = 0; c < 3; c++) {
        const v = (data[i + c] - (1 - a) * bg[c]) / a
        out[i + c] = Math.max(0, Math.min(255, Math.round(v)))
      }
      out[i + 3] = Math.round(a * 255)
      if (a > 0.1) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y)
      }
    }
  }

const pad = 4
const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad)
const w = Math.min(W, x1 + pad + 1) - left, h = Math.min(H, y1 + pad + 1) - top
fs.mkdirSync(outDir, { recursive: true })
const img = sharp(out, { raw: { width: W, height: H, channels: 4 } }).extract({ left, top, width: w, height: h })
await img.clone().png({ compressionLevel: 9 }).toFile(path.join(outDir, 'bahr-mark.png'))
await img.clone().webp({ quality: 92, alphaQuality: 100, smartSubsample: true }).toFile(path.join(outDir, 'bahr-mark.webp'))
console.log(`Mark extracted: ${w}×${h}px (background ≈ rgb(${bg.join(', ')})) → ${path.relative(process.cwd(), outDir)}/bahr-mark.{webp,png}`)
if (w < 240) console.warn('⚠ The mark is small in this screenshot; it will be shown at native size at most. Use a larger screenshot for a crisper result.')
