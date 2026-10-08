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
- bioluminescent accent `#5ff2e6` (sparingly)
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
- **Project links.** Individual case-study URLs could not be verified, so every project links to
  `https://bybahr.com/en/` (each has its own `href` field in `src/content/en.ts` — swap in the case-study URL when known).
- **Supporting copy** (agency paragraphs, service descriptions, contact line) is composed only from the verified facts
  above, lightly edited for flow. No invented clients, numbers or awards.
- **Stats:** 8 selected projects · 3 disciplines · Saudi Arabia & the Gulf.
- **Work rows** show the first four projects; "All eight projects ↗" links to the site.
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
- Default language EN; choice persisted in `localStorage` and applied by an inline script before first paint (no flash).

## Status
**Shipped.** (all phases complete — see git history)

- Repo: https://github.com/lvbfront/bahr-dive-redesign (`main`; work branch `claude/nice-faraday-nzc3xg`)
- Live: deploys on push once the repo is imported in Vercel (defaults: Vite / `npm run build` / `dist`). The Vercel CLI
  was not available in the build container, so the first deploy is a one-time manual import.
- Lighthouse (local prod build, simulated throttling): mobile Performance 85–88, desktop 97; Accessibility,
  Best practices and SEO 100 on both.
- Verified with Playwright screenshots: EN + AR, 1440 / 1024 / 390 / 375 widths, reduced motion, menu, language toggle,
  hover states, portal click, keyboard focus. No horizontal scroll at any width. Only remaining console message is
  a three.js `THREE.Clock` deprecation *warning* emitted from inside React Three Fiber (not our code).

Phase log: Step 0 setup ✅ · Phase 1 dive system ✅ · Phase 2 hero ✅ · Phase 3 agency + clients ✅ · Phase 4 expertise ✅ ·
Phase 5 work + contact + footer ✅ · Phase 6 Arabic/RTL ✅ · Phase 7 polish (perf, a11y, reduced motion, cursor, intro,
meta/OG) ✅ · Verify ✅ · Ship ✅
