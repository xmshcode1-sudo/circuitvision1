/* Circuits 1 — Chapter 3: Simple Resistive Circuits
   Resistors in Series · Resistors in Parallel · The Voltage-Divider and Current-Divider Circuits ·
   Voltage Division and Current Division · Delta-to-Wye (Pi-to-Tee) Equivalent Circuits
   Figures and answers both come from the engine (draw.js, mna.js, gen.reqValue). */
(function () {
  "use strict";
  var CV = window.CV, L = CV.lessons = CV.lessons || {};
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var fig = function (c, aria) { return "<div class='lfig'>" + CV.draw.render(c, { aria: aria }) + "</div>"; };
  var solve = function (c) { var s = CV.mna.solve(c); if (!s.ok) throw new Error("lesson circuit invalid: " + s.reason); return s.byName; };
  var req = function (c) { var v = CV.gen.reqValue(c); if (v === null) throw new Error("lesson port network invalid"); return v; };
  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };
  var A = [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }], V = [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }, { l: "kV", f: 1e3 }], OHM = [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }];

  /* ------------------------------------------------------------------ */
  var n1 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "T", 0, { name: "ab" }), E([0, 0], [0, 1], "R", 3, { name: "R1" }), E([0, 1], [0, 2], "R", 7, { name: "R2" }), E([0, 2], [1, 2], "R", 10, { name: "R3" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var r1 = req(n1);

  L["c1-resistive-1"] = {
    id: "c1-resistive-1", ar: "المقاومات على التوالي", en: "Resistors in Series", minutes: 15,
    objectives: ["تتعرف على المقاومات الموصلة على التوالي في أي رسم.", "تحسب المقاومة المكافئة لمقاومات على التوالي.", "تعرف أن التيار واحد في كل عناصر التوالي."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>تكون العناصر على <b>التوالي</b> <span class='ltr'>(series)</span> إذا مر فيها <b>نفس التيار</b>. ويحدث ذلك عندما تتصل ببعضها عند عقد لا يتصل بها إلا هذان العنصران فقط.</p>" +
        "<p>بتطبيق KVL على مقاومات على التوالي يمر فيها تيار i: <span class='eq-i'>v = iR₁ + iR₂ + … + iRₙ = i(R₁ + R₂ + … + Rₙ)</span>. إذن يمكن استبدالها كلها بمقاومة واحدة تساوي مجموعها، دون أن يتغير شيء في بقية الدائرة.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Series connection</dt><dd>عناصر يمر فيها نفس التيار.</dd><dt>Equivalent resistance (R<sub>eq</sub>)</dt><dd>مقاومة واحدة لها نفس تأثير المجموعة على بقية الدائرة.</dd></dl>" },
      { id: "laws", title: "القانون", en: "Equation", html: "<div class='eq'>R<sub>eq</sub> = R₁ + R₂ + … + Rₙ</div><p class='muted'>المقاومة المكافئة للتوالي أكبر دائمًا من أكبر مقاومة فيها.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>شكل الرسم لا يحدد التوالي. مقاومتان في خط واحد قد لا تكونان على التوالي إذا اتصل بالعقدة بينهما عنصر ثالث.</li>" +
        "<li>عند وجود مصدر في الحلقة، اجمع المقاومات أولًا ثم احسب التيار من <span class='eq-i'>i = v / R<sub>eq</sub></span>.</li>" +
        "<li>كل الأسلاك المتصلة ببعضها عقدة واحدة. انتبه لها عند تحديد العقد.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>أربع مقاومات <span class='ltr'>2 Ω</span> و <span class='ltr'>3 Ω</span> و <span class='ltr'>5 Ω</span> و <span class='ltr'>10 Ω</span> على التوالي مع مصدر <span class='ltr'>40 V</span>. أوجد التيار وجهد المقاومة الكبرى.</p>" +
        "<ol class='steps'><li><span class='eq-i'>R<sub>eq</sub> = 2 + 3 + 5 + 10 = 20 Ω</span></li><li><span class='eq-i'>i = 40 / 20 = 2 A</span>، وهو نفسه في كل المقاومات.</li><li><span class='eq-i'>v₁₀ = 2 × 10 = 20 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>أضواء الزينة القديمة كانت موصلة على التوالي: إذا احترق مصباح واحد انقطع التيار عن السلسلة كلها. ولهذا صارت أغلب السلاسل الحديثة على التوازي، أو فيها عنصر يوصل التيار حول المصباح المحترق.</p>" }
    ],
    quiz: [
      { q: "مقاومتان <span class='ltr'>4 Ω</span> و <span class='ltr'>6 Ω</span> على التوالي. المقاومة المكافئة:", options: [
        { t: "<span class='ltr'>10 Ω</span>", correct: true, why: "التوالي: مجموع المقاومات." },
        { t: "<span class='ltr'>2.4 Ω</span>", type: "formula", why: "هذا قانون التوازي (4×6)/(4+6)." },
        { t: "<span class='ltr'>24 Ω</span>", type: "formula", why: "ضربت المقاومتين. في التوالي نجمع." }
      ]},
      { q: "في مقاومات على التوالي، أي كمية متساوية في كل المقاومات؟", options: [
        { t: "الجهد", type: "conceptual", why: "الجهد يتوزع حسب قيمة كل مقاومة. الجهد المتساوي صفة التوازي." },
        { t: "التيار", correct: true, why: "تعريف التوالي: نفس التيار يمر في كل العناصر." },
        { t: "القدرة", type: "conceptual", why: "القدرة p = i²R تختلف حسب R." }
      ]},
      { q: "مقاومتان مرسومتان في خط واحد، لكن عند العقدة بينهما يتصل فرع ثالث. هل هما على التوالي؟", options: [
        { t: "نعم، لأنهما في خط واحد", type: "conceptual", why: "شكل الرسم لا يحدد التوالي. الفرع الثالث يأخذ جزءًا من التيار." },
        { t: "لا، لأن التيار فيهما قد يختلف", correct: true, why: "الفرع الثالث يجعل تيار الأولى = تيار الثانية + تيار الفرع." }
      ]}
    ],
    practice: {
      prompt: "الشبكة بين الطرفين <span class='ltr'>a</span> و <span class='ltr'>b</span> فيها ثلاث مقاومات.",
      circuit: n1, figure: fig(n1, "ثلاث مقاومات بين الطرفين a و b"),
      steps: [
        { id: "s1", kind: "choice", label: "لماذا المقاومات الثلاث على التوالي؟",
          options: [
            { t: "لأن كل عقدة بينها لا يتصل بها إلا عنصران، فيمر فيها نفس التيار", correct: true },
            { t: "لأنها مرسومة متتالية حول المستطيل", type: "conceptual", why: "طريقة الرسم لا تحدد التوالي. المعيار هو التيار: لا يوجد فرع ثالث عند أي عقدة بينها.", review: R("c1-resistive-1", "when", "متى تكون المقاومات على التوالي") },
            { t: "لأن لها نفس الجهد", type: "conceptual", why: "الجهد المتساوي صفة التوازي. المقاومات هنا لها جهود مختلفة.", review: R("c1-resistive-1", "concept", "الفكرة") }
          ], hints: ["انظر إلى العقدة بين R1 و R2: كم عنصرًا يتصل بها؟"], solution: "كل عقدة بينها يتصل بها عنصران فقط، فالتيار نفسه في الثلاث." },
        { id: "s2", label: "احسب المقاومة المكافئة <span class='ltr'>R<sub>ab</sub></span>.", symbol: "Rab =", answer: r1, units: OHM, unitDefault: 0,
          diagnose: [{ value: 1 / (1 / 3 + 1 / 7 + 1 / 10), type: "formula", why: "استخدمت قانون التوازي. المقاومات على التوالي نجمعها مباشرة.", review: R("c1-resistive-1", "laws", "قانون التوالي") }],
          hints: ["التوالي: اجمع."], solution: "<span class='eq-i'>R<sub>ab</sub> = 3 + 7 + 10 = 20 Ω</span>" },
        { id: "s3", label: "إذا وُصل مصدر <span class='ltr'>40 V</span> بين a و b، احسب التيار.", symbol: "i =", answer: 40 / r1, units: A, unitDefault: 1,
          diagnose: [{ value: 800, type: "formula", why: "ضربت الجهد في المقاومة. التيار = الجهد ÷ المقاومة." }, { value: 0.5, type: "formula", why: "قسمت المقاومة على الجهد. <span class='ltr'>i = v / R</span>." }],
          hints: ["<span class='ltr'>i = v / R<sub>eq</sub></span>."], solution: "<span class='eq-i'>i = 40 / 20 = 2 A</span>" },
        { id: "s4", label: "احسب جهد <span class='ltr'>R2</span>.", symbol: "v =", answer: 2 * 7, units: V, unitDefault: 1,
          diagnose: [{ value: 20, type: "substitution", why: "هذا جهد R3 (10 Ω). المطلوب R2 = 7 Ω." }, { value: 6, type: "substitution", why: "هذا جهد R1 (3 Ω). المطلوب R2 = 7 Ω." }, { value: 3.5, type: "formula", why: "قسمت المقاومة على التيار. <span class='ltr'>v = iR</span>." }],
          hints: ["نفس التيار 2 A يمر في R2."], solution: "<span class='eq-i'>v = 2 × 7 = 14 V</span>" }
      ]
    },
    generator: { title: "تمارين مولّدة: دوائر توالي", families: ["loop"], single: true, types: ["iR", "vR"] },
    lab: { title: "توصيل المقاومات على التوالي", desc: "في المعمل الذكي ستضيف مقاومات على التوالي واحدة بعد الأخرى، وتقيس التيار الكلي وجهد كل مقاومة." }
  };

  /* ------------------------------------------------------------------ */
  var n2 = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "T", 0, { name: "ab" }), E([0, 0], [0, 1], "R", 8, { name: "R1" }), E([0, 1], [1, 1], "R", 12, { name: "R2" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 6, { name: "R3" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "R", 4, { name: "R4" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W"), E([1, 2], [1, 3], "W")] };
  var r2 = req(n2), par2 = 1 / (1 / 12 + 1 / 6 + 1 / 4), i2 = 50 / r2;

  L["c1-resistive-2"] = {
    id: "c1-resistive-2", ar: "المقاومات على التوازي", en: "Resistors in Parallel", minutes: 20,
    objectives: ["تتعرف على المقاومات الموصلة على التوازي.", "تحسب المقاومة المكافئة للتوازي، والحالة الخاصة لمقاومتين.", "تختزل شبكة فيها توالي وتوازي معًا."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>تكون العناصر على <b>التوازي</b> <span class='ltr'>(parallel)</span> إذا كانت متصلة بين <b>نفس العقدتين</b>، فيكون لها <b>نفس الجهد</b>.</p>" +
        "<p>بتطبيق KCL: التيار الكلي = مجموع تيارات الفروع <span class='eq-i'>i = v/R₁ + v/R₂ + … = v(1/R₁ + 1/R₂ + …)</span>. إذن مقلوب المقاومة المكافئة يساوي مجموع مقلوبات المقاومات، أي أن الموصليات تُجمع مباشرة.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Parallel connection</dt><dd>عناصر بين نفس العقدتين، لها نفس الجهد.</dd><dt>Equivalent conductance</dt><dd><span class='ltr'>G<sub>eq</sub> = G₁ + G₂ + …</span></dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>1 / R<sub>eq</sub> = 1/R₁ + 1/R₂ + … + 1/Rₙ</div><div class='eq-row'><div class='eq'>R<sub>eq</sub> = R₁R₂ / (R₁ + R₂)</div><div class='eq'>n × R → R / n</div></div>" +
        "<p class='muted'>الصيغة الثانية لمقاومتين فقط، والثالثة لعدد n من المقاومات المتساوية. المقاومة المكافئة للتوازي أصغر دائمًا من أصغر مقاومة فيها.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>تتبع الأسلاك: كل نقاط السلك الواحد عقدة واحدة. مقاومتان بعيدتان في الرسم قد تكونان على التوازي لأن طرفيهما متصلان بنفس العقدتين.</li>" +
        "<li>لا تنسَ قلب الناتج في النهاية عند استخدام <span class='ltr'>1/R<sub>eq</sub></span>.</li>" +
        "<li>لاختزال شبكة كاملة: ابدأ من الجهة البعيدة عن الطرفين، واختزل التوالي والتوازي خطوة خطوة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>أوجد المقاومة المكافئة لـ <span class='ltr'>10 Ω ∥ 40 Ω</span>، ثم لـ <span class='ltr'>6 Ω ∥ 12 Ω ∥ 4 Ω</span>.</p>" +
        "<ol class='steps'><li><span class='eq-i'>(10 × 40) / (10 + 40) = 400 / 50 = 8 Ω</span></li><li><span class='eq-i'>1/R = 1/6 + 1/12 + 1/4 = 2/12 + 1/12 + 3/12 = 6/12</span></li><li><span class='eq-i'>R = 12 / 6 = 2 Ω</span>، وهي أصغر من 4 Ω كما توقعنا.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>كل أجهزة المنزل موصلة على التوازي مع الشبكة، فلكل جهاز نفس الجهد (220 V أو 127 V حسب المأخذ) ويعمل باستقلال عن الآخر. وكل جهاز تشغّله يقلل المقاومة المكافئة للمنزل، فيزيد التيار الكلي من القاطع الرئيسي.</p>" }
    ],
    quiz: [
      { q: "مقاومتان <span class='ltr'>30 Ω</span> و <span class='ltr'>60 Ω</span> على التوازي:", options: [
        { t: "<span class='ltr'>20 Ω</span>", correct: true, why: "(30×60)/(30+60) = 1800/90 = 20 Ω." },
        { t: "<span class='ltr'>90 Ω</span>", type: "formula", why: "هذا قانون التوالي." },
        { t: "<span class='ltr'>0.05 Ω</span>", type: "formula", why: "هذا 1/R<sub>eq</sub>. اقلب الناتج." }
      ]},
      { q: "خمس مقاومات متساوية <span class='ltr'>100 Ω</span> على التوازي:", options: [
        { t: "<span class='ltr'>500 Ω</span>", type: "formula", why: "هذا للتوالي. للتوازي: R/n." },
        { t: "<span class='ltr'>20 Ω</span>", correct: true, why: "100/5 = 20 Ω." },
        { t: "<span class='ltr'>100 Ω</span>", type: "conceptual", why: "إضافة مقاومات على التوازي تقلل المقاومة المكافئة." }
      ]},
      { q: "أضفت مقاومة جديدة على التوازي مع مجموعة. المقاومة المكافئة:", options: [
        { t: "تزيد", type: "conceptual", why: "فرع جديد = مسار إضافي للتيار، فتقل المقاومة." },
        { t: "تقل", correct: true, why: "الموصليات تُجمع، فالموصلية تزيد والمقاومة تقل." },
        { t: "لا تتغير", type: "conceptual", why: "إلا إذا كانت المقاومة الجديدة لا نهائية (دائرة مفتوحة)." }
      ]}
    ],
    practice: {
      prompt: "أوجد المقاومة المكافئة بين a و b، ثم التيارات عند توصيل مصدر <span class='ltr'>50 V</span> بين الطرفين.",
      circuit: n2, figure: fig(n2, "مقاومة على التوالي مع ثلاث مقاومات على التوازي بين a و b"),
      steps: [
        { id: "s1", label: "احسب المقاومة المكافئة لـ <span class='ltr'>R2 ∥ R3 ∥ R4</span>.", symbol: "R =", answer: par2, units: OHM, unitDefault: 0,
          diagnose: [{ value: 22, type: "formula", why: "جمعت المقاومات. هذه الثلاث على التوازي، فنجمع مقلوباتها.", review: R("c1-resistive-2", "laws", "قانون التوازي") },
            { value: 0.5, type: "formula", why: "هذا مجموع المقلوبات <span class='ltr'>1/R<sub>eq</sub></span>. اقلب الناتج.", hint: "<span class='ltr'>R = 1 / 0.5</span>." }],
          hints: ["الثلاث بين نفس العقدتين (السلك العلوي والسلك السفلي).", "<span class='ltr'>1/R = 1/12 + 1/6 + 1/4</span>."], solution: "<span class='eq-i'>1/R = 1/12 + 2/12 + 3/12 = 6/12 → R = 2 Ω</span>" },
        { id: "s2", label: "احسب <span class='ltr'>R<sub>ab</sub></span>.", symbol: "Rab =", answer: r2, units: OHM, unitDefault: 0,
          diagnose: [{ value: par2, type: "conceptual", why: "نسيت R1. يمر فيها التيار الكلي ثم يتفرع، فهي على التوالي مع مجموعة التوازي.", review: R("c1-resistive-2", "when", "اختزال الشبكة خطوة خطوة") },
            { value: 30, type: "conceptual", why: "جمعت كل المقاومات كأنها على التوالي." }],
          hints: ["R1 على التوالي مع المجموعة."], solution: "<span class='eq-i'>R<sub>ab</sub> = 8 + 2 = 10 Ω</span>" },
        { id: "s3", label: "مع مصدر <span class='ltr'>50 V</span> بين a و b: احسب تيار <span class='ltr'>R1</span>.", symbol: "i =", answer: i2, units: A, unitDefault: 1,
          diagnose: [{ value: 50 / 8, type: "conceptual", why: "قسمت على R1 وحدها. التيار الكلي يحدده <span class='ltr'>R<sub>ab</sub></span> كاملة." }],
          hints: ["<span class='ltr'>i = 50 / R<sub>ab</sub></span>."], solution: "<span class='eq-i'>i = 50 / 10 = 5 A</span>" },
        { id: "s4", label: "احسب تيار <span class='ltr'>R4</span>.", symbol: "i₄ =", answer: i2 * par2 / 4, units: A, unitDefault: 1,
          diagnose: [{ value: 12.5, type: "conceptual", why: "استخدمت جهد المصدر 50 V. جهد مجموعة التوازي أقل لأن جزءًا من الجهد يهبط على R1.", hint: "<span class='ltr'>v = 5 × 2 = 10 V</span>." },
            { value: i2 * par2 / 12, type: "substitution", why: "هذا تيار R2 (12 Ω)." }, { value: i2 * par2 / 6, type: "substitution", why: "هذا تيار R3 (6 Ω)." }],
          hints: ["جهد مجموعة التوازي = التيار الكلي × مقاومتها المكافئة.", "<span class='ltr'>v = 5 × 2 = 10 V</span>، ثم <span class='ltr'>i₄ = v / 4</span>."], solution: "<span class='eq-i'>v = 5 × 2 = 10 V → i₄ = 10 / 4 = 2.5 A</span>" }
      ]
    },
    generator: { title: "تمارين مولّدة: المقاومة المكافئة (توالي وتوازي)", req: true, families: ["ladder", "grid"], sp: true },
    lab: { title: "قياس المقاومة المكافئة", desc: "في المعمل الذكي ستبني شبكة مقاومات وتقيس مقاومتها المكافئة بالملتيميتر، ثم تقارنها بحسابك." }
  };

  /* ------------------------------------------------------------------ */
  var c3 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 30, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 10, { name: "R1" }), E([0, 1], [1, 1], "R", 40, { name: "R2", vlabel: "vₒ" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 40, { name: "RL" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var s3 = solve(c3);

  L["c1-resistive-3"] = {
    id: "c1-resistive-3", ar: "دائرة مقسّم الجهد ومقسّم التيار", en: "The Voltage-Divider and Current-Divider Circuits", minutes: 25,
    objectives: ["تحسب جهد الخرج لمقسّم الجهد بدون حمل ومع حمل.", "تحسب تيار فرع في مقسّم التيار.", "تفهم لماذا يغيّر الحمل جهد الخرج."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>مقسّم الجهد</b> <span class='ltr'>(voltage divider)</span> مقاومتان على التوالي مع مصدر، ونأخذ الخرج من إحداهما. يُستخدم للحصول على جهد أقل من جهد المصدر.</p>" +
        "<p><b>مقسّم التيار</b> <span class='ltr'>(current divider)</span> مقاومتان على التوازي مع مصدر تيار، ويتوزع التيار بينهما. الفرع ذو المقاومة الأصغر يأخذ تيارًا أكبر.</p>" +
        "<p>عند توصيل <b>حمل</b> <span class='ltr'>R<sub>L</sub></span> على خرج مقسّم الجهد، يصبح الحمل على التوازي مع <span class='ltr'>R₂</span>، فتقل المقاومة السفلية وينخفض جهد الخرج.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html: "<dl class='terms'><dt>Voltage divider</dt><dd>مقاومات على التوالي تقسم جهد المصدر.</dd><dt>Current divider</dt><dd>مقاومات على التوازي تقسم تيار المصدر.</dd><dt>Load (R<sub>L</sub>)</dt><dd>العنصر الذي نوصله على الخرج ليستخدم الجهد.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq-row'><div class='eq'>vₒ = vₛ · R₂ / (R₁ + R₂)</div><div class='eq'>i₁ = iₛ · R₂ / (R₁ + R₂)</div></div>" +
        "<p class='muted'>لاحظ الفرق: في مقسّم الجهد نضع في البسط <b>نفس</b> المقاومة التي نريد جهدها. في مقسّم التيار نضع في البسط المقاومة <b>الأخرى</b>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>استخدم قانون مقسّم الجهد فقط إذا كان <b>نفس التيار</b> يمر في المقاومتين. إذا وُصل حمل على الخرج، اجمع <span class='ltr'>R₂ ∥ R<sub>L</sub></span> أولًا.</li>" +
        "<li>لكي لا يتأثر الخرج كثيرًا بالحمل، اجعل <span class='ltr'>R<sub>L</sub></span> أكبر بكثير من <span class='ltr'>R₂</span>.</li>" +
        "<li>صيغة مقسّم التيار بمقاومتين فقط. لأكثر من فرعين استخدم الصيغة العامة في الدرس التالي.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مصدر <span class='ltr'>12 V</span> مع <span class='ltr'>R₁ = 6 kΩ</span> و <span class='ltr'>R₂ = 3 kΩ</span>. أوجد جهد الخرج، ثم جهد الخرج بعد توصيل حمل <span class='ltr'>3 kΩ</span>.</p>" +
        "<ol class='steps'><li><b>بدون حمل:</b> <span class='eq-i'>vₒ = 12 × 3 / (6 + 3) = 4 V</span></li><li><b>مع الحمل:</b> <span class='eq-i'>R₂ ∥ R<sub>L</sub> = 3 ∥ 3 = 1.5 kΩ</span></li><li><span class='eq-i'>vₒ = 12 × 1.5 / (6 + 1.5) = 2.4 V</span>. انخفض الخرج من 4 V إلى 2.4 V بسبب الحمل.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مقسّم الجهد موجود في كل مكان: مقبض الصوت (Potentiometer) مقسّم جهد قابل للتعديل، وحساسات الضوء والحرارة (LDR و Thermistor) توصل مع مقاومة ثابتة كمقسّم جهد ليقرأ المتحكم الدقيق جهدًا يتغير مع الضوء أو الحرارة.</p>" }
    ],
    quiz: [
      { q: "مقسّم جهد: <span class='ltr'>vₛ = 10 V</span>، <span class='ltr'>R₁ = 4 Ω</span>، <span class='ltr'>R₂ = 1 Ω</span>. جهد R₂:", options: [
        { t: "<span class='ltr'>2 V</span>", correct: true, why: "10 × 1/(4+1) = 2 V." },
        { t: "<span class='ltr'>8 V</span>", type: "substitution", why: "هذا جهد R₁. في البسط ضع المقاومة التي تريد جهدها." },
        { t: "<span class='ltr'>2.5 V</span>", type: "formula", why: "قسمت على R₁ بدل مجموع المقاومتين." }
      ]},
      { q: "مصدر تيار <span class='ltr'>6 A</span> على مقاومتين على التوازي <span class='ltr'>2 Ω</span> و <span class='ltr'>4 Ω</span>. تيار المقاومة 2 Ω:", options: [
        { t: "<span class='ltr'>2 A</span>", type: "substitution", why: "هذا تيار المقاومة 4 Ω. في مقسّم التيار ضع في البسط المقاومة الأخرى." },
        { t: "<span class='ltr'>4 A</span>", correct: true, why: "6 × 4/(2+4) = 4 A. المقاومة الأصغر تأخذ تيارًا أكبر." },
        { t: "<span class='ltr'>3 A</span>", type: "conceptual", why: "التيار يتقسم بالتساوي فقط إذا تساوت المقاومتان." }
      ]},
      { q: "وصلنا حملًا على خرج مقسّم جهد. جهد الخرج:", options: [
        { t: "يزيد", type: "conceptual", why: "الحمل على التوازي مع R₂ يقلل المقاومة السفلية، فيقل نصيبها من الجهد." },
        { t: "يقل", correct: true, why: "R₂ ∥ R<sub>L</sub> أصغر من R₂." },
        { t: "لا يتغير", type: "conceptual", why: "يتغير، إلا إذا كانت R<sub>L</sub> لا نهائية تقريبًا." }
      ]}
    ],
    practice: {
      prompt: "مقسّم جهد من مصدر <span class='ltr'>30 V</span> و <span class='ltr'>R1 = 10 Ω</span> و <span class='ltr'>R2 = 40 Ω</span>، وعلى خرجه حمل <span class='ltr'>RL = 40 Ω</span>.",
      circuit: c3, figure: fig(c3, "مقسم جهد بمصدر 30 فولت ومقاومتين وحمل على الخرج"),
      steps: [
        { id: "s1", label: "احسب جهد الخرج <span class='ltr'>vₒ</span> <b>قبل</b> توصيل الحمل.", symbol: "vₒ =", answer: 30 * 40 / 50, units: V, unitDefault: 1,
          diagnose: [{ value: 6, type: "substitution", why: "وضعت R1 في البسط، فحسبت جهد R1. الخرج على R2، فهي في البسط.", review: R("c1-resistive-3", "laws", "قانون مقسّم الجهد") },
            { value: 120, type: "formula", why: "قسمت على R1 فقط. المقام هو مجموع المقاومتين." }],
          hints: ["<span class='ltr'>vₒ = vₛ · R2 / (R1 + R2)</span>."], solution: "<span class='eq-i'>vₒ = 30 × 40 / 50 = 24 V</span>" },
        { id: "s2", label: "احسب <span class='ltr'>vₒ</span> <b>بعد</b> توصيل الحمل.", symbol: "vₒ =", answer: s3.R2.v, units: V, unitDefault: 1,
          diagnose: [{ value: 24, type: "conceptual", why: "تجاهلت الحمل. بعد توصيله صار على التوازي مع R2، فتغيرت المقاومة السفلية.", review: R("c1-resistive-3", "when", "تأثير الحمل"), hint: "احسب <span class='ltr'>R2 ∥ RL</span> أولًا." },
            { value: 10, type: "substitution", why: "هذا جهد R1. الخرج على مجموعة <span class='ltr'>R2 ∥ RL</span>." }],
          hints: ["<span class='ltr'>R2 ∥ RL = 40 ∥ 40 = 20 Ω</span>.", "<span class='ltr'>vₒ = 30 × 20 / (10 + 20)</span>."], solution: "<span class='eq-i'>R2 ∥ RL = 20 Ω → vₒ = 30 × 20 / 30 = 20 V</span>" },
        { id: "s3", label: "احسب التيار في الحمل <span class='ltr'>RL</span>.", symbol: "i =", answer: s3.RL.i, units: A, unitDefault: 1,
          diagnose: [{ value: 0.6, type: "conceptual", why: "استخدمت جهد الخرج قبل الحمل (24 V). بعد التوصيل صار 20 V." }, { value: 1, type: "substitution", why: "هذا التيار الكلي من المصدر. يتقسم بالتساوي بين R2 و RL لأنهما متساويتان." }],
          hints: ["<span class='ltr'>i = vₒ / RL</span>."], solution: "<span class='eq-i'>i = 20 / 40 = 0.5 A</span>" }
      ]
    },
    generator: { title: "تمارين مولّدة: مقسّمات الجهد والتيار", families: ["loop", "pair"], single: true, types: ["iR", "vR"] },
    lab: { title: "مقسّم جهد تحت الحمل", desc: "في المعمل الذكي ستقيس جهد خرج مقسّم، ثم توصل أحمالًا مختلفة وترى كيف ينخفض الجهد كلما صغرت مقاومة الحمل." }
  };

  /* ------------------------------------------------------------------ */
  var c4 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 36, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 4, { name: "R1" }), E([0, 1], [1, 1], "R", 6, { name: "R2" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 12, { name: "R3", ilabel: "i₃" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var s4 = solve(c4);

  L["c1-resistive-4"] = {
    id: "c1-resistive-4", ar: "قسمة الجهد وقسمة التيار", en: "Voltage Division and Current Division", minutes: 25,
    objectives: ["تطبق قسمة الجهد على أي عدد من المقاومات على التوالي.", "تطبق قسمة التيار على أي عدد من الفروع على التوازي.", "تستخدمهما داخل دائرة أكبر بعد إيجاد المقاومة المكافئة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>قانونا المقسّم في الدرس السابق حالتان خاصتان من قاعدتين عامتين:</p>" +
        "<p><b>قسمة الجهد:</b> جهد أي مقاومة في مجموعة توالي = نسبة مقاومتها إلى المقاومة الكلية × الجهد الكلي على المجموعة.</p>" +
        "<p><b>قسمة التيار:</b> تيار أي فرع في مجموعة توازي = نسبة المقاومة المكافئة للمجموعة إلى مقاومة هذا الفرع × التيار الكلي الداخل إليها.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html: "<dl class='terms'><dt>Voltage division</dt><dd>توزيع جهد مجموعة توالي على عناصرها.</dd><dt>Current division</dt><dd>توزيع تيار مجموعة توازي على فروعها.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq-row'><div class='eq'>vⱼ = (Rⱼ / R<sub>eq</sub>) · v</div><div class='eq'>iⱼ = (R<sub>eq</sub> / Rⱼ) · i</div></div>" +
        "<p class='muted'>في قسمة الجهد R<sub>eq</sub> مقاومة مجموعة <b>التوالي</b>. في قسمة التيار R<sub>eq</sub> مقاومة مجموعة <b>التوازي</b>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>في دائرة أكبر: احسب المقاومة المكافئة التي يراها المصدر، ثم التيار الكلي، ثم ارجع خطوة خطوة بقسمة الجهد والتيار.</li>" +
        "<li>قسمة التيار تحتاج التيار الداخل إلى مجموعة التوازي بالضبط، وقسمة الجهد تحتاج الجهد على مجموعة التوالي بالضبط.</li>" +
        "<li>تحقق من نتيجتك: مجموع تيارات الفروع = التيار الكلي، ومجموع الجهود = الجهد الكلي.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'><b>قسمة جهد:</b> <span class='ltr'>20 V</span> على مقاومات <span class='ltr'>2 Ω</span> و <span class='ltr'>3 Ω</span> و <span class='ltr'>5 Ω</span> على التوالي. جهد المقاومة 5 Ω:</p>" +
        "<ol class='steps'><li><span class='eq-i'>v₅ = (5 / 10) × 20 = 10 V</span></li></ol>" +
        "<p class='q'><b>قسمة تيار:</b> <span class='ltr'>6 A</span> تدخل مجموعة <span class='ltr'>3 Ω ∥ 6 Ω ∥ 2 Ω</span>. تيار المقاومة 2 Ω:</p>" +
        "<ol class='steps'><li><span class='eq-i'>R<sub>eq</sub> = 1 / (1/3 + 1/6 + 1/2) = 1 Ω</span></li><li><span class='eq-i'>i₂ = (1 / 2) × 6 = 3 A</span>. وللتحقق: تيار 3 Ω = 2 A، وتيار 6 Ω = 1 A، والمجموع 6 A ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مقاومة الشنت (Shunt) في أجهزة قياس التيار تطبيق مباشر لقسمة التيار: مقاومة صغيرة جدًا على التوازي مع ملف الجهاز، فيمر فيها أغلب التيار ويمر في الجهاز جزء صغير معروف النسبة، فيقيس تيارات أكبر بكثير من قدرته.</p>" }
    ],
    quiz: [
      { q: "في قسمة التيار <span class='ltr'>iⱼ = (R<sub>eq</sub>/Rⱼ) i</span>، المقدار R<sub>eq</sub> هو:", options: [
        { t: "مقاومة مجموعة التوازي", correct: true, why: "المجموعة التي يتقسم فيها التيار." },
        { t: "مقاومة الدائرة كلها", type: "conceptual", why: "فقط إذا كانت الدائرة كلها هي مجموعة التوازي." },
        { t: "مجموع مقاومات الفروع", type: "formula", why: "مجموع المقاومات للتوالي. للتوازي نجمع المقلوبات." }
      ]},
      { q: "مقاومتان على التوالي، الأولى ضعف الثانية، على جهد <span class='ltr'>30 V</span>. جهد الكبرى:", options: [
        { t: "<span class='ltr'>20 V</span>", correct: true, why: "نسبتها 2/3 من المجموع: 2/3 × 30 = 20 V." },
        { t: "<span class='ltr'>10 V</span>", type: "substitution", why: "هذا جهد الصغرى." },
        { t: "<span class='ltr'>15 V</span>", type: "conceptual", why: "الجهد يتوزع بنسبة المقاومات، وليس بالتساوي." }
      ]}
    ],
    practice: {
      prompt: "في الدائرة: <span class='ltr'>Vs = 36 V</span>، و <span class='ltr'>R1 = 4 Ω</span>، و <span class='ltr'>R2 = 6 Ω</span>، و <span class='ltr'>R3 = 12 Ω</span>. أوجد <span class='ltr'>i₃</span> باستخدام قسمة التيار.",
      circuit: c4, figure: fig(c4, "مصدر 36 فولت ومقاومة على التوالي مع مقاومتين على التوازي"),
      steps: [
        { id: "s1", label: "احسب المقاومة المكافئة التي يراها المصدر.", symbol: "R =", answer: 8, units: OHM, unitDefault: 0,
          diagnose: [{ value: 22, type: "conceptual", why: "جمعت كل المقاومات. R2 و R3 على التوازي (بين نفس العقدتين)." }, { value: 4, type: "conceptual", why: "حسبت <span class='ltr'>R2 ∥ R3</span> فقط ونسيت R1 على التوالي معها." }],
          hints: ["<span class='ltr'>R2 ∥ R3 = 6 × 12 / 18</span>، ثم أضف R1."], solution: "<span class='eq-i'>R = 4 + (6 ∥ 12) = 4 + 4 = 8 Ω</span>" },
        { id: "s2", label: "احسب التيار الكلي من المصدر.", symbol: "i =", answer: s4.R1.i, units: A, unitDefault: 1,
          diagnose: [{ value: 36 / 22, type: "conceptual", why: "استخدمت مجموع المقاومات 22 Ω. المقاومة المكافئة 8 Ω." }],
          hints: ["<span class='ltr'>i = 36 / 8</span>."], solution: "<span class='eq-i'>i = 36 / 8 = 4.5 A</span>" },
        { id: "s3", label: "استخدم قسمة التيار لحساب <span class='ltr'>i₃</span>.", symbol: "i₃ =", answer: s4.R3.i, units: A, unitDefault: 1,
          diagnose: [{ value: 3, type: "substitution", why: "وضعت R3 في البسط. في قسمة التيار بفرعين: <span class='ltr'>i₃ = i · R2 / (R2 + R3)</span>، أي المقاومة <b>الأخرى</b> في البسط. وهذه قيمة تيار R2.", review: R("c1-resistive-3", "laws", "الفرق بين قانوني المقسّم") },
            { value: 9, type: "conceptual", why: "قسمت 36 V على 4 Ω (المقاومة المكافئة للتوازي). جهد مجموعة التوازي ليس 36 V، فجزء منه يهبط على R1." }],
          hints: ["<span class='ltr'>i₃ = (R<sub>eq</sub> / R3) · i</span> حيث <span class='ltr'>R<sub>eq</sub> = 4 Ω</span>."], solution: "<span class='eq-i'>i₃ = (4 / 12) × 4.5 = 1.5 A</span>" },
        { id: "s4", label: "تحقق بقسمة الجهد: احسب جهد <span class='ltr'>R1</span>.", symbol: "v =", answer: s4.R1.v, units: V, unitDefault: 1,
          diagnose: [{ value: 36 * 4 / 22, type: "conceptual", why: "قسمت على 22 Ω. المجموعة المتوالية مع R1 مقاومتها 4 Ω، فالمجموع 8 Ω." }],
          hints: ["<span class='ltr'>v₁ = (4 / 8) × 36</span>."], solution: "<span class='eq-i'>v₁ = (4 / 8) × 36 = 18 V</span>، و <span class='ltr'>4.5 × 4 = 18</span> ✓" }
      ]
    },
    generator: { title: "تمارين مولّدة: قسمة الجهد والتيار في سلالم", families: ["ladder"], single: true, types: ["iR", "vR"] },
    lab: { title: "قسمة التيار بالقياس", desc: "في المعمل الذكي ستقيس تيارات ثلاثة فروع على التوازي، وتتحقق أن نسبها تتبع مقلوب مقاوماتها." }
  };

  /* ------------------------------------------------------------------ */
  function bridge(rac, rad, rcd, rcb, rdb) {
    return { rows: 3, cols: 3, edges: [E([1, 0], [2, 0], "T", 0, { name: "ab" }), E([0, 0], [1, 0], "W"), E([0, 0], [0, 1], "W"), E([0, 1], [0, 2], "R", rac, { name: "R1" }), E([0, 1], [1, 1], "R", rad, { name: "R2" }), E([0, 2], [1, 2], "W"), E([1, 1], [1, 2], "R", rcd, { name: "R5" }), E([1, 2], [2, 2], "R", rcb, { name: "R3" }), E([1, 1], [2, 1], "R", rdb, { name: "R4" }), E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W")] };
  }
  var b1 = bridge(20, 30, 50, 14, 9), b2 = bridge(40, 40, 20, 4, 16), rb2 = req(b2);

  L["c1-resistive-5"] = {
    id: "c1-resistive-5", ar: "تحويل دلتا إلى واي", en: "Delta-to-Wye (Pi-to-Tee) Equivalent Circuits", minutes: 30,
    objectives: ["تتعرف على شبكة لا يمكن اختزالها بالتوالي والتوازي.", "تحوّل بين Δ و Y في الاتجاهين.", "تحسب المقاومة المكافئة لدائرة جسر."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>بعض الشبكات لا يوجد فيها أي مقاومتين على التوالي أو التوازي، مثل <b>دائرة الجسر</b> <span class='ltr'>(bridge)</span>: المقاومة R5 في الرسم تصل بين فرعين فتمنع الاختزال المباشر.</p>" +
        fig(b1, "دائرة جسر بين الطرفين a و b") +
        "<p>الحل: نستبدل ثلاث مقاومات تشكّل مثلثًا <span class='ltr'>(Δ أو Pi)</span> بثلاث مقاومات تلتقي في نقطة واحدة <span class='ltr'>(Y أو Tee)</span>، بحيث تبقى المقاومة بين كل زوج من الأطراف كما هي. بعد التحويل يصبح الاختزال بالتوالي والتوازي ممكنًا.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html: "<dl class='terms'><dt>Delta (Δ) / Pi (π)</dt><dd>ثلاث مقاومات بين ثلاث عقد، كل مقاومة بين عقدتين.</dd><dt>Wye (Y) / Tee (T)</dt><dd>ثلاث مقاومات تخرج من نقطة مركزية إلى ثلاث عقد.</dd><dt>Bridge circuit</dt><dd>شبكة فيها فرع يصل بين مسارين، فلا تُختزل بالتوالي والتوازي.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<p><b>من Δ إلى Y:</b> مقاومة Y عند أي عقدة = حاصل ضرب ضلعي Δ المتصلين بهذه العقدة ÷ مجموع أضلاع Δ الثلاثة.</p>" +
        "<div class='eq'>R₁ = R<sub>b</sub>R<sub>c</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div>" +
        "<p><b>من Y إلى Δ:</b> ضلع Δ المقابل لأي عقدة = مجموع حواصل ضرب مقاومات Y مثنى مثنى ÷ مقاومة Y عند تلك العقدة.</p>" +
        "<div class='eq'>R<sub>a</sub> = (R₁R₂ + R₂R₃ + R₃R₁) / R₁</div>" +
        "<p class='muted'>إذا كانت أضلاع Δ متساوية <span class='ltr'>(R<sub>Δ</sub>)</span> فإن مقاومات Y متساوية أيضًا: <span class='ltr'>R<sub>Y</sub> = R<sub>Δ</sub> / 3</span>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>استخدم التحويل فقط عندما لا تجد أي توالي أو توازي. جرّب الاختزال العادي أولًا.</li>" +
        "<li>اختر مثلثًا تتصل عقده الثلاث ببقية الدائرة. بعد التحويل تظهر عقدة مركزية جديدة.</li>" +
        "<li>إذا كان الجسر <b>متزنًا</b> <span class='ltr'>(R1/R3 = R2/R4)</span>، فلا يمر تيار في R5 ويمكن حذفها مباشرة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>في الجسر أعلاه: <span class='ltr'>R1 = 20 Ω</span>، <span class='ltr'>R2 = 30 Ω</span>، <span class='ltr'>R5 = 50 Ω</span>، <span class='ltr'>R3 = 14 Ω</span>، <span class='ltr'>R4 = 9 Ω</span>. أوجد <span class='ltr'>R<sub>ab</sub></span>.</p>" +
        "<ol class='steps'><li><b>المثلث:</b> R1 و R2 و R5 تشكّل Δ بين العقدة العليا (a) والعقدتين الوسطيين. المجموع <span class='eq-i'>20 + 30 + 50 = 100 Ω</span>.</li>" +
        "<li><b>مقاومات Y:</b> عند a: <span class='eq-i'>20×30/100 = 6 Ω</span>. عند عقدة R1-R5: <span class='eq-i'>20×50/100 = 10 Ω</span>. عند عقدة R2-R5: <span class='eq-i'>30×50/100 = 15 Ω</span>.</li>" +
        "<li><b>توالي:</b> <span class='eq-i'>10 + R3 = 10 + 14 = 24 Ω</span> و <span class='eq-i'>15 + R4 = 15 + 9 = 24 Ω</span>.</li>" +
        "<li><b>توازي:</b> <span class='eq-i'>24 ∥ 24 = 12 Ω</span>.</li><li><b>توالي مع مقاومة Y عند a:</b> <span class='eq-i'>R<sub>ab</sub> = 6 + 12 = " + CV.num(req(b1)) + " Ω</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>جسر ويتستون <span class='ltr'>(Wheatstone bridge)</span> يُستخدم لقياس مقاومة مجهولة بدقة عالية، وفي حساسات الوزن والضغط (Strain gauges): تغيّر صغير جدًا في مقاومة أحد الأضلاع يخل باتزان الجسر فيظهر جهد يمكن قياسه. وتحويل Δ-Y أساسي أيضًا في أنظمة الثلاثة أطوار التي ستدرسها في Circuits 2.</p>" }
    ],
    quiz: [
      { q: "Δ متساوي الأضلاع، كل ضلع <span class='ltr'>30 Ω</span>. مقاومة كل فرع في Y المكافئ:", options: [
        { t: "<span class='ltr'>10 Ω</span>", correct: true, why: "R<sub>Y</sub> = R<sub>Δ</sub>/3." },
        { t: "<span class='ltr'>90 Ω</span>", type: "formula", why: "هذا عكس التحويل. من Y إلى Δ نضرب في 3." },
        { t: "<span class='ltr'>30 Ω</span>", type: "conceptual", why: "المقاومات تتغير عند التحويل لتبقى المقاومة بين الأطراف كما هي." }
      ]},
      { q: "متى نحتاج تحويل Δ-Y لحساب المقاومة المكافئة؟", options: [
        { t: "في كل شبكة فيها أكثر من 3 مقاومات", type: "conceptual", why: "كثير من الشبكات الكبيرة تُختزل بالتوالي والتوازي فقط." },
        { t: "عندما لا يوجد أي توالي أو توازي يمكن اختزاله", correct: true, why: "مثل دائرة الجسر غير المتزن." },
        { t: "عندما توجد مصادر تابعة", type: "conceptual", why: "هذا لا علاقة له بالتحويل." }
      ]},
      { q: "جسر متزن <span class='ltr'>(R1/R3 = R2/R4)</span>. التيار في مقاومة الجسر R5:", options: [
        { t: "صفر", correct: true, why: "طرفا R5 لهما نفس الجهد، فلا يمر فيها تيار." },
        { t: "أكبر تيار في الدائرة", type: "conceptual", why: "في الاتزان جهدا طرفيها متساويان." },
        { t: "يساوي تيار R1", type: "conceptual", why: "لا يمر فيها تيار في حالة الاتزان." }
      ]}
    ],
    practice: {
      prompt: "جسر بنفس الشكل بقيم <span class='ltr'>R1 = 40 Ω</span>، <span class='ltr'>R2 = 40 Ω</span>، <span class='ltr'>R5 = 20 Ω</span>، <span class='ltr'>R3 = 4 Ω</span>، <span class='ltr'>R4 = 16 Ω</span>.",
      circuit: b2, figure: fig(b2, "دائرة جسر بقيم جديدة بين الطرفين a و b"),
      steps: [
        { id: "s1", kind: "choice", label: "لماذا لا نستطيع اختزال هذه الشبكة بالتوالي والتوازي مباشرة؟",
          options: [
            { t: "لأن R5 تصل بين الفرعين، فلا توجد مقاومتان يمر فيهما نفس التيار أو بين نفس العقدتين", correct: true },
            { t: "لأن عدد المقاومات خمسة", type: "conceptual", why: "العدد ليس المشكلة. المشكلة في طريقة التوصيل: R5 تكسر التوالي والتوازي.", review: R("c1-resistive-5", "concept", "دائرة الجسر") },
            { t: "لأن الجسر متزن", type: "conceptual", why: "R1/R3 = 10 و R2/R4 = 2.5، فالجسر غير متزن. ولو كان متزنًا لأمكن حذف R5 والاختزال مباشرة.", review: R("c1-resistive-5", "when", "الجسر المتزن") }
          ], hints: ["هل يوجد عقدة لا يتصل بها إلا مقاومتان؟"], solution: "R5 تصل بين الفرعين، فلا يوجد توالي ولا توازي. نحتاج تحويل Δ-Y." },
        { id: "s2", label: "حوّل المثلث (R1 و R2 و R5) إلى Y. احسب مقاومة Y المتصلة بالعقدة a.", symbol: "R =", answer: 40 * 40 / 100, units: OHM, unitDefault: 0,
          diagnose: [{ value: 80, type: "formula", why: "قسمت على الضلع المقابل R5. في التحويل من Δ إلى Y نقسم على <b>مجموع</b> الأضلاع الثلاثة.", review: R("c1-resistive-5", "laws", "قانون Δ إلى Y") },
            { value: 8, type: "substitution", why: "هذه مقاومة Y عند عقدة أخرى (حاصل ضرب R1 أو R2 في R5). عند العقدة a نضرب الضلعين المتصلين بها: R1 و R2." }],
          hints: ["الضلعان المتصلان بالعقدة a هما R1 و R2، والمجموع <span class='ltr'>40 + 40 + 20 = 100</span>."], solution: "<span class='eq-i'>R<sub>a</sub> = 40 × 40 / 100 = 16 Ω</span>، والمقاومتان الأخريان <span class='eq-i'>40 × 20 / 100 = 8 Ω</span> لكل منهما." },
        { id: "s3", label: "أكمل الاختزال واحسب <span class='ltr'>R<sub>ab</sub></span>.", symbol: "Rab =", answer: rb2, units: OHM, unitDefault: 0,
          diagnose: [{ value: 1 / (1 / 44 + 1 / 56), type: "conceptual", why: "حذفت R5 كأن الجسر متزن. الجسر هنا غير متزن، فيمر في R5 تيار ولا يجوز حذفها.", review: R("c1-resistive-5", "when", "متى يجوز حذف مقاومة الجسر") },
            { value: 1 / (1 / 4 + 1 / 16) + 1 / (1 / 40 + 1 / 40), type: "conceptual", why: "عاملت R5 كأنها سلك (قصر). استبدلها بالتحويل إلى Y." }],
          hints: ["بعد التحويل: <span class='ltr'>8 + R3 = 12</span> و <span class='ltr'>8 + R4 = 24</span> على التوازي.", "<span class='ltr'>12 ∥ 24 = 8 Ω</span>، ثم أضف 16 Ω."], solution: "<span class='eq-i'>(8 + 4) ∥ (8 + 16) = 12 ∥ 24 = 8 Ω → R<sub>ab</sub> = 16 + 8 = 24 Ω</span>" }
      ]
    },
    generator: { title: "تمارين مولّدة: شبكات تحتاج Δ-Y", req: true, families: ["grid"], sp: false },
    lab: { title: "جسر ويتستون", desc: "في المعمل الذكي ستبني جسرًا وتغيّر إحدى مقاوماته حتى يتزن، وتلاحظ أن تيار مقاومة الجسر يصبح صفرًا." }
  };
})();
