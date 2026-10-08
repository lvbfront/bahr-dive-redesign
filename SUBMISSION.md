# Bahr — The Dive · GDG on Campus UJ × Bahr

**Live:** _(Vercel URL — see README)_ · **Code:** https://github.com/lvbfront/bahr-dive-redesign

---

## English

**The idea.** Bahr's brand is made of depth: *"A deeper creative approach"*, *"Beyond the surface"*, *"Let's dive
deeper"*. Today's bybahr.com shows that depth as a static map. Our redesign turns it into a journey you live through
scrolling. The page starts on a bright water surface. As you scroll, you break through it and sink: the agency at
−40 m, clients at −200 m, expertise at −600 m, work at −1,200 m. The light fades, the water turns deep navy, a live depth
meter counts down, and the contact call to action waits on the seabed at −3,000 m.

**What we built.**

- A WebGL water surface that ripples under the cursor, followed by a pinned "breaking the surface" moment where the
  camera dips below the waterline.
- One scroll-driven dive system that controls colour, light rays, marine snow, text contrast and the depth meter.
- Client names that drift like currents and react to scroll speed.
- A pinned horizontal expertise journey with hand-made animated visuals.
- Project rows with a royal-blue glow on hover, a floating preview and a circle-wipe portal to each case study.
- A seabed contact section with a bubbling, magnetic email button.
- Full Arabic/RTL with mirrored layout and motion.
- A complete reduced-motion version, keyboard and screen-reader support.
- Lighthouse scores: Accessibility, Best practices and SEO 100; Performance 85+ on mobile.

**Tools.** Claude Code, React, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP + ScrollTrigger (+ SplitText),
Lenis, React Three Fiber (+ drei, three.js), Vercel.

---

## العربية

**الفكرة.** هوية «بحر» مبنية على العمق: «عمق إبداعي مختلف»، «أبعد من السطح»، «لنغُص أعمق». يعرض موقع بحر الحالي هذا العمق
كخريطة ثابتة، أما تصميمنا فيحوّله إلى رحلة تعيشها وأنت تمرّر الصفحة. تبدأ الصفحة على سطح ماء مضيء، ومع التمرير تخترق
السطح وتغوص:

- الوكالة على عمق −٤٠ م
- العملاء على −٢٠٠ م
- الخبرات على −٦٠٠ م
- الأعمال على −١٢٠٠ م

يخفت الضوء ويتحوّل الماء إلى أزرق داكن، ويعدّ مقياس العمق الأمتار لحظة بلحظة، حتى تصل إلى القاع على −٣٠٠٠ م حيث
تنتظرك دعوة التواصل.

**ما الذي بنيناه.**

- سطح ماء ثلاثي الأبعاد (WebGL) تتموّج صفحته مع حركة المؤشر، تليه لحظة مثبّتة لـ«اختراق السطح» تنزل فيها الكاميرا تحت
  خط الماء.
- نظام غوص واحد مرتبط بالتمرير يتحكم في اللون وأشعة الضوء و«ثلج البحر» وتباين النص ومقياس العمق.
- أسماء عملاء تنساب كالتيارات وتتأثر بسرعة التمرير.
- رحلة أفقية مثبّتة عبر الخبرات، مع رسوم متحركة مصمّمة خصيصًا لكل خدمة.
- صفوف مشاريع يتوهّج حولها ضوء حيوي عند التمرير فوقها، مع بطاقة معاينة عائمة وانتقال دائري يفتح صفحة المشروع.
- قسم تواصل في القاع مع زر بريد مغناطيسي تتصاعد منه الفقاعات.
- نسخة عربية كاملة من اليمين إلى اليسار، يُعكس فيها التخطيط والحركة.
- نسخة كاملة لمن يفضّلون تقليل الحركة، ودعم للوحة المفاتيح وقارئات الشاشة.
- نتائج Lighthouse: ‏100 في إمكانية الوصول وأفضل الممارسات وتحسين محركات البحث، وأكثر من 85 في الأداء على الجوال.

**الأدوات.** Claude Code، ‏React، ‏Vite، ‏TypeScript، ‏Tailwind CSS، ‏Framer Motion، ‏GSAP + ScrollTrigger، ‏Lenis، ‏React
Three Fiber، ‏Vercel.
