# CLAUDE.md — Bahr "The Dive"

## Goal
Award-level redesign of the homepage of https://bybahr.com (Bahr, an independent digital agency in Jeddah) for the
GDG on Campus UJ × Bahr "best homepage redesign" challenge. Deliverables: live deployed link (Vercel), public GitHub
repo, short write-up (`SUBMISSION.md`).

## Concept — "The Dive"
Bahr's brand is built on depth ("A Deeper Creative Approach", "Beyond the surface", "Let's dive deeper", "Made of depth").
Scrolling = diving. The page starts at a bright water surface and every section sits deeper:

| Section   | Depth    | Meter label     |
|-----------|----------|-----------------|
| Hero      | 0 m      | Surface         |
| Agency    | −40 m    | The agency      |
| Clients   | −200 m   | In good company |
| Expertise | −600 m   | Expertise       |
| Work      | −1,200 m | Selected work   |
| Contact   | −3,000 m | Seabed          |

Light fades, the background shifts to deep navy/black, a depth meter counts down, the CTA waits on the seabed.
Inspiration (techniques only, nothing copied): Convex Seascape Survey (Unseen Studio), Unseen Studio, Ghost Network (Noise Studio).

## Stack
Vite + React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`, tokens in `src/styles/index.css` `@theme`),
Framer Motion (`motion` package, `motion/react`), GSAP + ScrollTrigger + SplitText (`@gsap/react` `useGSAP`),
Lenis (driven by the GSAP ticker), React Three Fiber + drei (lazy-loaded hero water, CSS fallback). Deployed on Vercel.

## Animation rule (hard)
- **GSAP owns everything linked to scroll** (background/depth, meter, pins, scrubs, reveals on scroll, marquee drift, count-ups).
- **Framer Motion owns hover / menu / toggle / mount animations** (mobile menu, accordion, cursor, magnetic, preview card, portal wipe, intro).
- Never animate the same property of the same element with both. When both are needed, GSAP animates a wrapper and
  Motion animates an inner element.
- Easing: `expo.out` for reveals, `power2.inOut` for scrubs.

## Design tokens
- surface `#e6e6df`, ink `#0b0f14`
- depth gradient `#e6e6df → #9fb7c4 → #2c5d73 → #0e2a3a → #050b12`
- accent: Bahr royal blue `#1e40a8` (fills, buttons, the wordmark dot on light water) + bright tint `#8aa4ff`
  (`glow-bright`, text/glows on deep water for contrast); brand gradient `.bg-brand` `#0f2a7a → #1e40a8 → #3d6cf0 → #6b8cff`
- logo: Bahr's **"BAHR."** wordmark (Syne 800, accent-coloured dot via `--accent-ink`, which follows the depth tone)
- Fonts: **Syne** (display, EN headlines), **IBM Plex Sans Arabic** (Arabic + body). Self-hosted in `public/fonts`, preloaded.

## Folder structure
```
src/
  content/        en.ts, ar.ts (ALL user-facing strings; ar typed against en)
  lib/            gsap.ts (plugin registration), i18n.tsx, dive.ts (depth store), hooks.ts
  providers/      SmoothScroll.tsx (Lenis → gsap.ticker → ScrollTrigger.update)
  components/
    dive/         DiveController, DepthMeter, LightRays, MarineSnow
    hero/         Hero, WaterCanvas (R3F, lazy), heroState
    sections/     Agency, Clients, Expertise, Work, Contact, Footer
    ui/           Nav, Cursor, Intro, Magnetic, SkipLink …
  styles/index.css
```

## Conventions
- All strings live in `src/content/*.ts`; components never hard-code copy.
- Logical CSS properties only (`ms-`, `me-`, `ps-`, `start-`, `end-`, `inset-inline-*`) so RTL mirrors for free.
- Every GSAP effect lives inside `useGSAP` (auto cleanup) and responsive/motion branches use `gsap.matchMedia()`.
- Arabic SplitText splits by **words**, never chars.
- `prefers-reduced-motion`: no Lenis, no WebGL, no pins, simple fades — but the full content and the depth colours remain.
- `localStorage` always wrapped in try/catch.

## Commands
- `npm run dev` — dev server
- `npm run build` — typecheck + production build (`dist/`)
- `npm run preview` — serve the build
- Vercel defaults: framework Vite, build `npm run build`, output `dist`.

## Decisions
- **Content source.** bybahr.com, b7r.agency and web.archive.org are unreachable from the build container (DNS/egress
  policy). Real content was gathered from search-engine snapshots of https://bybahr.com/en/ plus the brand lines quoted in
  the brief. Verified facts used: 8 projects — Alageely (Legal Authority, 2025), Riyadh Retina (Elite Healthcare, 2025),
  Sycleague (Sports Tech, 2025), QVS (SaaS Platform, 2025), Parkinly (Mobile App, 2025, unreleased), Secure Steps
  (Corporate, 2025), MASS (Private Security, 2026), LineUp (Live Entertainment, 2026); email `dive@b7r.agency`;
  LinkedIn `linkedin.com/company/bybahr`; positioning "web platforms, mobile apps, and AI systems for ambitious companies
  across Saudi Arabia and the GCC"; "aesthetic mastery with engineering precision"; web stack React / Next.js / WebGL.
- **Client names.** The run-together text "QVSParkinly" is two projects: **QVS** and **Parkinly** (not "QVSpark"/"Inly").
  The "In good company" marquee uses these eight names (the site presents its client work as these projects).
- **Project links** (provided by the owner): Alageely, Riyadh Retina, Sycleague and LineUp link to their case studies at
  `https://bybahr.com/work/<slug>/index.html` and are the four `featured` rows in Selected work; "All eight projects"
  (and the four non-featured projects' `href`) → `https://bybahr.com/work/index.html`.
- **Brand recognition.** Per the owner: the logo is Bahr's "BAHR." wordmark and the accent is Bahr's royal blue
  (≈ `#1e40a8`, from their hero gradient), replacing the earlier cyan. On deep water the blue is used as a lighter tint
  (`#8aa4ff`) wherever it carries text, so contrast stays ≥ 3:1 for large text.
- **Supporting copy** (agency paragraphs, service descriptions, contact line) is composed only from the verified facts
  above, lightly edited for flow. No invented clients, numbers or awards.
- **Stats:** 8 selected projects · 3 disciplines · Saudi Arabia & the Gulf.
- **Work rows** show the four featured projects; "All eight projects ↗" links to Bahr's work index.
- **Depth mapping.** Meter depth and background colour are piecewise-linear between section anchors (section top hits
  viewport top), not linear in pixels, so each section "is" its depth.
- **Text colour** flips ink → light based on the luminance of the current background (threshold keeps ≥4.5:1 contrast).
- **Project tab opening.** The portal wipe plays (~550 ms) then `window.open` runs while transient user activation is still
  valid; if a popup blocker returns `null` we navigate the current tab instead.
- **Display font** Syne (variable, self-hosted) — strong, wide agency display face; Arabic display uses IBM Plex Sans Arabic 700.
- **Arabic copy.** The live site already has a full Arabic version; the brief asks to use its official strings verbatim.
  Its HTML/JS bundles could not be fetched from this container (bybahr.com blocked by egress policy, no archive access),
  so only these official Arabic strings are used verbatim: hero «عمق إبداعي مختلف», title «وكالة بحر — تصميم مواقع وتطوير
  وهوية رقمية», the name «بحر» (and «لنغُص أعمق.» as given in the brief). **All other Arabic strings in `src/content/ar.ts`
  are our own translation** in the agency's tone — to be swapped for the official copy when it's available (one file).
- **Visual differentiation from the current site.** The current bybahr.com draws depth as a static topographic contour map
  with a gradient «بحر» calligraphy hero and a light/dark toggle. We deliberately use **none** of that: no contour lines, no
  calligraphy, no theme toggle — depth is felt through the scroll dive itself (water surface → light falloff → seabed).
  The Arabic hero is set in IBM Plex Sans Arabic Bold, plain and typographic.
- **Performance architecture.** `index.html` holds a static, styled copy of the hero (first paint); `src/main.tsx` is a
  tiny entry that imports the app (`src/boot.tsx`) after the first contentful paint. Motion features load through
  `LazyMotion`; WebGL loads on first interaction or ~4.5 s after load (idle).
- **Agency overlap.** Under normal motion the agency section is pulled up 45svh so it rises over the end of the hero pin
  (no empty "dead water" screen); in reduced motion there is no pin and no overlap.
- **Language switch** (fixes a blank page after EN↔AR).
  - Root cause: SplitText rewrites the DOM inside React-managed headings, and pins wrap their elements in pin-spacers.
    When the language changed, React tried to `removeChild` nodes GSAP had moved, threw, and unmounted the app.
  - Fix: the toggle now runs `idle → covering → covered → revealing`. A short veil fades in, the language is committed,
    and everything GSAP touches (`<Page>`, keyed by `lang` inside an `ErrorBoundary`) unmounts. Every `useGSAP` context
    reverts its splits and pins. A fresh tree then mounts, `ScrollTrigger.refresh()` runs, and the scroll position is
    restored per section (index plus fraction).
  - The ErrorBoundary retries once and then shows a static fallback, so a crash never shows a blank page.
  - The Intro, Cursor, Lenis and the veil live outside the keyed tree.
- **Expertise reveal.** Panel text (and the drifting project frames) is driven by each panel's on-screen rect, read in
  the horizontal tween's `onUpdate`. It no longer uses per-panel `containerAnimation` triggers, which the last panel
  could fail to reach. A revealed panel stays revealed, and leaving the pin reveals everything.
- **Owner images** (optional; `vite.config.ts` lists what exists into `__WORK_SHOTS__` and `__BRAND_MARK__`, so missing
  files never 404).
  - The website screenshots for the four featured projects drift in panel 01 (`public/work/<slug>.webp`, via
    `npm run images`). Until a file exists, that project shows a framed, named placeholder.
  - Bahr's «بحر» mark (`public/brand/bahr-mark.webp`, via `npm run mark`) appears only at the seabed and in the intro,
    never in the hero, and is never upscaled.
  - The owner's attachments did not reach the build container, so neither the screenshots nor the mark are committed
    yet. The code paths were verified with placeholders and with a synthetic test mark, which was not shipped.
- **Phones are their own design** (see README → Mobile): native scroll, short pin, bottom thumb dock + bottom-sheet menu,
  slim gutter gauge, in-view equivalents for every hover. "Phone" = `MOBILE` in `src/lib/hooks.ts` = the `mob:` variant.
- **Project frames** in Expertise are designed abstract mini-sites (`src/components/ui/MiniSite.tsx`), never fake
  screenshots; a real file in `public/work/<slug>.webp` replaces one automatically. Also used as the work-row previews.
- Default language EN; choice persisted in `localStorage` and applied by an inline script before first paint (no flash).

## Mobile audit (2026-10-09, before fixes)
Emulated with touch + mobile UA: iPhone SE 375×667, iPhone 15 393×852, Pixel 7 412×915, landscape 852×393 — EN + AR,
stepped scroll (0.85 screen per step) + fast flicks, screenshots of every step (88 shots), plus automated checks for
overflow, meter overlap and tap-target size.

1. **Scroll feel** — Lenis is instantiated on touch devices too (native touch, but it still owns wheel/keys, sets
   `html.lenis` and runs every frame). Should be plain native scrolling on touch.
2. **Hero pin** — 100vh pin on phones (200% of the viewport in pin-spacer, 242% in landscape) and the 45svh agency
   overlap → a near-empty "dead water" screen after the hero on every phone.
3. **Dead space** — half-empty screens after "Explore our expertise" (before the clients) and after "All eight projects"
   (contact is `min-h-[100svh]` + centred).
4. **Hero type** — headline only ~42 px on SE with a large empty area; in landscape it overflows the bottom of the
   viewport ("approach" clipped).
5. **Viewport units** — section paddings and heights in `vh` (iOS address bar resizes them); no safe-area handling
   (notch / home bar) for nav, bottom UI or footer.
6. **Depth meter** — the bottom-left pill covers content on every phone ("Scroll to dive", "Beyond the surface",
   paragraphs, project rows, "Back to surface", footer). In landscape the desktop vertical meter shows and its numbers
   overflow the 393 px height.
7. **Tap targets < 44 px** — wordmark link (22 px tall), "Scroll to dive" (36), "All eight projects" (33), email (27),
   LinkedIn (27), work-row arrows (40), landscape "Let's talk" (42).
8. **Thumb reach** — menu + language buttons sit in the top corner; the menu closes from the top.
9. **Hover-only features** — work-row preview card and glow never appear on touch; client-name highlight is hover-only.
10. **Expertise card (web)** — drifting frames are tiny (112 px) placeholders, cut at the card edges, names only.
11. **Landscape is treated as desktop** (≥ 768 px wide): desktop meter, rail padding, "Let's talk" pill, long pin.
12. **Gutters** — `--rail` adds ~22 px extra start padding on phones (content not centred, 20 + 22 px start vs 20 px end).
13. **Performance** — WebGL water at DPR 1.5 / 140² grid on phones, 34 snow particles, nav `backdrop-blur` over a
    moving page; no low-end fallback.
14. **Arabic** — body copy same size as EN (Plex Arabic reads small at 16 px), kicker/labels small.
15. No horizontal scroll found (EN + AR, all four sizes) and no console errors — keep it that way.

## Mobile pass — resolution (re-audited after fixes, same devices/steps)
| # | Audit item | Fix | Verified |
|---|---|---|---|
| 1 | Lenis on touch | `SmoothScroll` skips Lenis on `(hover: none), (pointer: coarse)`; velocity for snow/currents comes from ScrollTrigger | audit: `lenis=false` on all phones |
| 2 | Long hero pin + dead screen | phones: pin `+=65%`, scrub 0.4, agency overlap 24svh (desk 45svh); `desk:min-h-[560px]` only | pin-spacer 165% (was 200–242%) |
| 3 | Dead space | phone rhythm: section padding 9–14svh, contact `mob:min-h-0` top-aligned, tighter gaps | screenshots: no half-empty screens |
| 4 | Hero type | `mob:text-[min(12.2vw,15.5svh)]` (AR `min(16vw,17svh)`), mobile paddings; static shell mirrors it | SE / 15 / Pixel / landscape fit |
| 5 | vh / safe areas | every `vh` → `svh`; `--safe-top/bottom`, gutter `max(clamp(…), env(safe-area-inset-*))` | grep: no `vh` left |
| 6 | Meter covering content | phones: slim vertical gauge inside the inline-start gutter (number rotated, 7 px dot, glow at seabed) | audit: 0 overlaps |
| 7 | Small tap targets | wordmark, cue, links, email/LinkedIn, row arrows, footer → ≥ 44 px | audit: 0 targets < 44 px |
| 8 | Thumb reach | bottom dock (lang + menu, 48 px) + bottom-sheet menu closing from the same button; dock hides on scroll-down | menu/sheet/link/lang tested by tap, EN + AR |
| 9 | Hover-only | touch: work row at screen centre lights + in-row mini-site preview; client name at centre lights, tap pauses a row; cursor off | screenshots |
| 10 | Expertise frames | designed abstract mini-sites (4 layouts, Bahr palette) with "Name — sector", 152 px strip below the current lines, lazy | screenshots |
| 11 | Landscape = desktop | `mob`/`desk` variants (block-form `@custom-variant`; the one-line form silently kept only the first query) + `MOBILE` query in JS | landscape gets dock, slim meter, short pin |
| 12 | Rail on phones | `--rail: 0` on phones | content symmetric |
| 13 | Performance | DPR ≤ 1.25 on touch, 96² water grid, CSS water on low-end/data-saver, 18 snow particles, lazy strip/thumbs, phone paragraphs fade whole (no line measuring), one post-mount refresh | Lighthouse mobile 84–87 |
| 14 | Arabic size | phones: AR body 17 px / 1.85 | screenshots |
| 15 | H-scroll / errors | — | 0 px overflow, 0 errors (8 device/lang combos) |

## Status
**Shipped.** (all phases complete — see git history)

- Repo: https://github.com/lvbfront/bahr-dive-redesign (`main`; work branch `claude/nice-faraday-nzc3xg`)
- Live: deploys on push once the repo is imported in Vercel (defaults: Vite / `npm run build` / `dist`). The Vercel CLI
  was not available in the build container, so the first deploy is a one-time manual import.
- Lighthouse (local prod build, simulated throttling): mobile Performance 84–87, desktop 94–97; Accessibility,
  Best practices and SEO 100 on both.
- 3rd pass (mobile): full phone audit + fixes, see "Mobile audit" and "Mobile pass — resolution" above; language switch
  re-verified 10× from the phone dock, desktop panels / language switch / reduced motion re-checked.
- 2nd pass: language switch verified 10× in a row at every section (incl. inside both pins), desktop + mobile, no errors;
  expertise panel 03 text verified at 1024/1440/1920 in EN + AR; Lighthouse mobile 87–89.
- Verified with Playwright screenshots: EN + AR, 1440 / 1024 / 390 / 375 widths, reduced motion, menu, language toggle,
  hover states, portal click, keyboard focus. No horizontal scroll at any width. Only remaining console message is
  a three.js `THREE.Clock` deprecation *warning* emitted from inside React Three Fiber (not our code).

Phase log: Step 0 setup ✅ · Phase 1 dive system ✅ · Phase 2 hero ✅ · Phase 3 agency + clients ✅ · Phase 4 expertise ✅ ·
Phase 5 work + contact + footer ✅ · Phase 6 Arabic/RTL ✅ · Phase 7 polish (perf, a11y, reduced motion, cursor, intro,
meta/OG) ✅ · Verify ✅ · Ship ✅
