// All user-facing English copy. Sourced from https://bybahr.com/en/ (see CLAUDE.md → Decisions).

export const SITE_URL = 'https://bybahr.com/en/'
/** Bahr's own work index ("All eight projects") */
export const WORK_URL = 'https://bybahr.com/work/index.html'
const work = (slug: string) => `https://bybahr.com/work/${slug}/index.html`
export const EMAIL = 'dive@b7r.agency'
export const LINKEDIN = 'https://www.linkedin.com/company/bybahr'

export type Project = {
  name: string
  sector: string
  /** extra status shown after the sector (only when the real site lists one) */
  note?: string
  year: string
  href: string
  /** shown as a large row in Selected work (only projects with a verified case-study page) */
  featured?: boolean
  /** two colours for the abstract preview gradient */
  hue: [string, string]
}

const en = {
  meta: {
    title: 'Bahr — A deeper creative approach',
    description:
      'Bahr is an independent digital agency in Jeddah, Saudi Arabia. Web platforms, AI systems and mobile apps — made of depth.',
  },
  a11y: {
    skip: 'Skip to content',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    langSwitch: 'التبديل إلى العربية',
    depthMeter: 'Dive depth',
    introSkip: 'Skip intro',
    opensNewTab: '(opens in a new tab)',
    home: 'Bahr — back to the surface',
  },
  /** Bahr's wordmark: "BAHR." */
  brand: { word: 'BAHR', dot: '.' },
  nav: {
    links: [
      { id: 'top', label: 'Home' },
      { id: 'agency', label: 'The agency' },
      { id: 'expertise', label: 'Expertise' },
      { id: 'work', label: 'Our work' },
    ],
    cta: 'Let’s talk',
    lang: 'AR',
    langFull: 'العربية',
  },
  depth: {
    unit: 'm',
    labels: ['Surface', 'The agency', 'In good company', 'Expertise', 'Selected work', 'Seabed'],
  },
  intro: 'BAHR.',
  hero: {
    lines: ['A deeper', 'creative', 'approach'],
    meta: 'Independent digital agency — Jeddah, Saudi Arabia',
    coords: '21.4858° N, 39.1925° E',
    scroll: 'Scroll to dive',
  },
  agency: {
    index: '01',
    kicker: 'The agency',
    title: 'Beyond the surface',
    statement: 'Design with depth. Technology with purpose.',
    paragraphs: [
      'Bahr is an independent digital agency in Jeddah. We design and engineer web platforms, mobile apps and AI systems for ambitious companies across Saudi Arabia and the GCC.',
      'We blend aesthetic mastery with engineering precision — so what we build doesn’t just look different. It works, and it lasts.',
    ],
    cta: 'Explore our expertise',
  },
  clients: {
    kicker: 'In good company',
    rows: [
      ['Alageely', 'Riyadh Retina', 'Sycleague', 'QVS'],
      ['Parkinly', 'Secure Steps', 'MASS', 'LineUp'],
    ],
    stats: [
      { value: 8, suffix: '', label: 'Selected projects' },
      { value: 3, suffix: '', label: 'Disciplines — web, AI, mobile' },
      { value: null, text: 'KSA + GCC', label: 'Saudi Arabia & the Gulf' },
    ] as { value: number | null; suffix?: string; text?: string; label: string }[],
  },
  expertise: {
    index: '02',
    kicker: 'Our expertise',
    title: 'From idea to impact',
    statement: 'Built to work. Made to feel different.',
    services: [
      {
        key: 'web',
        title: 'Web experiences',
        body: 'Web platforms engineered for speed, SEO and scale — immersive when it matters, effortless everywhere else.',
        tags: ['React', 'Next.js', 'WebGL', 'SEO'],
      },
      {
        key: 'ai',
        title: 'AI & automation',
        body: 'AI agents and custom software shaped around how your business actually works — fewer manual steps, smarter decisions.',
        tags: ['AI agents', 'Automation', 'Custom software'],
      },
      {
        key: 'mobile',
        title: 'Mobile apps',
        body: 'Mobile apps taken from first sketch to launch — with deployment, analytics and ongoing support after release.',
        tags: ['iOS', 'Android', 'Product design', 'Launch'],
      },
    ] as { key: 'web' | 'ai' | 'mobile'; title: string; body: string; tags: string[] }[],
  },
  work: {
    index: '03',
    kicker: 'Selected work',
    title: 'Selected work',
    hint: 'Hover to surface a project',
    all: 'All eight projects',
    open: 'Open project',
    projects: [
      { name: 'Alageely', sector: 'Legal authority', year: '2025', href: work('alageely'), featured: true, hue: ['#0f2a7a', '#5b82f5'] },
      { name: 'Riyadh Retina', sector: 'Elite healthcare', year: '2025', href: work('riyadh-retina'), featured: true, hue: ['#0e2a3a', '#3d6cf0'] },
      { name: 'Sycleague', sector: 'Sports tech', year: '2025', href: work('sycleague'), featured: true, hue: ['#1e40a8', '#8aa4ff'] },
      { name: 'QVS', sector: 'SaaS platform', year: '2025', href: WORK_URL, hue: ['#08202e', '#3d6cf0'] },
      { name: 'Parkinly', sector: 'Mobile app', note: 'Unreleased', year: '2025', href: WORK_URL, hue: ['#1b2f6e', '#9fb7c4'] },
      { name: 'Secure Steps', sector: 'Corporate', year: '2025', href: WORK_URL, hue: ['#0b2230', '#1e40a8'] },
      { name: 'MASS', sector: 'Private security', year: '2026', href: WORK_URL, hue: ['#050b12', '#1e40a8'] },
      { name: 'LineUp', sector: 'Live entertainment', year: '2026', href: work('lineup'), featured: true, hue: ['#14246a', '#7f9dff'] },
    ] as Project[],
  },
  contact: {
    kicker: 'Seabed',
    title: ['Let’s dive', 'deeper.'],
    button: 'Start a project',
    line: 'Websites, mobile apps and AI systems for ambitious companies across Saudi Arabia and the GCC. Tell us where you want to go.',
    emailLabel: 'Email',
    linkedinLabel: 'LinkedIn',
  },
  footer: {
    place: 'Jeddah, Saudi Arabia — Working across the region. Thinking beyond it.',
    copy: '© 2026 Bahr Agency — Made of depth.',
    back: 'Back to surface',
  },
}

export default en
export type Content = typeof en
