// النسخة العربية.
// OFFICIAL strings from bybahr.com (verbatim): hero line «عمق إبداعي مختلف», page title «وكالة بحر — تصميم مواقع وتطوير وهوية رقمية», the name «بحر».
// Everything else could not be retrieved (site unreachable from the build container) and is our own translation in the agency's
// tone — see CLAUDE.md → Decisions → "Arabic copy". Replace with the official strings whenever available.
import en, { EMAIL, type Content } from './en'

const ar: Content = {
  meta: {
    title: 'وكالة بحر — تصميم مواقع وتطوير وهوية رقمية',
    description:
      'بحر وكالة رقمية مستقلة في جدة. نصمّم ونبني منصات الويب وأنظمة الذكاء الاصطناعي وتطبيقات الجوال — بعمقٍ لا يُرى على السطح.',
  },
  a11y: {
    skip: 'تخطَّ إلى المحتوى',
    menuOpen: 'فتح القائمة',
    menuClose: 'إغلاق القائمة',
    langSwitch: 'Switch to English',
    depthMeter: 'عمق الغوص',
    introSkip: 'تخطَّ المقدّمة',
    opensNewTab: '(يُفتح في تبويب جديد)',
    home: 'بحر — العودة إلى السطح',
  },
  brand: en.brand,
  nav: {
    links: [
      { id: 'top', label: 'الرئيسية' },
      { id: 'agency', label: 'الوكالة' },
      { id: 'expertise', label: 'خبراتنا' },
      { id: 'work', label: 'أعمالنا' },
    ],
    cta: 'لنتحدّث',
    lang: 'EN',
    langFull: 'English',
  },
  depth: {
    unit: 'م',
    labels: ['السطح', 'الوكالة', 'في صحبةٍ طيّبة', 'خبراتنا', 'أعمال مختارة', 'القاع'],
  },
  intro: en.intro,
  hero: {
    lines: ['عمق', 'إبداعي', 'مختلف'],
    meta: 'وكالة رقمية مستقلة — جدة، المملكة العربية السعودية',
    coords: '21.4858° ش، 39.1925° ق',
    scroll: 'مرّر لتغوص',
  },
  agency: {
    index: '01',
    kicker: 'الوكالة',
    title: 'أبعد من السطح',
    statement: 'تصميمٌ بعمق. وتقنيةٌ بغاية.',
    paragraphs: [
      'بحر وكالة رقمية مستقلة من جدة. نصمّم ونهندس منصات الويب وتطبيقات الجوال وأنظمة الذكاء الاصطناعي للشركات الطموحة في المملكة ودول الخليج.',
      'نمزج إتقان الجمال بدقّة الهندسة؛ فما نبنيه لا يبدو مختلفًا فحسب، بل يعمل كما ينبغي، ويدوم.',
    ],
    cta: 'اكتشف خبراتنا',
  },
  clients: {
    kicker: 'في صحبةٍ طيّبة',
    rows: en.clients.rows,
    stats: [
      { value: 8, suffix: '', label: 'مشاريع مختارة' },
      { value: 3, suffix: '', label: 'تخصّصات — ويب، ذكاء اصطناعي، جوال' },
      { value: null, text: 'السعودية + الخليج', label: 'المملكة العربية السعودية ودول الخليج' },
    ],
  },
  expertise: {
    index: '02',
    kicker: 'خبراتنا',
    title: 'من الفكرة إلى الأثر',
    statement: 'صُنع ليعمل. وصُمّم ليُحَسّ مختلفًا.',
    services: [
      {
        key: 'web',
        title: 'تجارب الويب',
        body: 'منصات ويب مهندَسة للسرعة ومحركات البحث والتوسّع — غامرة حين يلزم، وسلسة في كل ما عدا ذلك.',
        tags: ['React', 'Next.js', 'WebGL', 'SEO'],
      },
      {
        key: 'ai',
        title: 'الذكاء الاصطناعي والأتمتة',
        body: 'وكلاء ذكاء اصطناعي وبرمجيات مخصّصة تُبنى حول طريقة عمل مؤسستك فعلًا — خطوات يدوية أقل، وقرارات أذكى.',
        tags: ['وكلاء ذكاء اصطناعي', 'أتمتة', 'برمجيات مخصّصة'],
      },
      {
        key: 'mobile',
        title: 'تطبيقات الجوال',
        body: 'تطبيقات جوال نأخذها من أول رسمة حتى الإطلاق — مع النشر والتحليلات والدعم المستمر بعد الإطلاق.',
        tags: ['iOS', 'Android', 'تصميم المنتج', 'الإطلاق'],
      },
    ],
  },
  work: {
    index: '03',
    kicker: 'أعمال مختارة',
    title: 'أعمال مختارة',
    hint: 'مرّر المؤشر ليطفو المشروع',
    all: 'المشاريع الثمانية كلها',
    open: 'افتح المشروع',
    projects: en.work.projects.map((p, i) => ({
      ...p,
      ...[
        { sector: 'جهة قانونية' },
        { sector: 'رعاية صحية متخصّصة' },
        { sector: 'تقنية رياضية' },
        { sector: 'منصة SaaS' },
        { sector: 'تطبيق جوال', note: 'لم يُطلق بعد' },
        { sector: 'شركات' },
        { sector: 'أمن خاص' },
        { sector: 'ترفيه حي' },
      ][i],
    })),
  },
  contact: {
    kicker: 'القاع',
    title: ['لنغُص', 'أعمق.'],
    button: 'ابدأ مشروعك',
    line: 'مواقع وتطبيقات جوال وأنظمة ذكاء اصطناعي للشركات الطموحة في المملكة ودول الخليج. أخبرنا إلى أين تريد أن تصل.',
    emailLabel: 'البريد',
    linkedinLabel: 'لينكدإن',
  },
  footer: {
    place: 'جدة، المملكة العربية السعودية — نعمل في المنطقة، ونفكّر أبعد منها.',
    copy: '© 2026 وكالة بحر — مصنوعة من العمق.',
    back: 'عُد إلى السطح',
  },
}

export { EMAIL }
export default ar
