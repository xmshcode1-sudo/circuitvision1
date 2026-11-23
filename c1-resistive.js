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

  /* Lecture circuits (Dr. Abdullah Noman, Ch. 3) and tutorial problems. Worked-example numbers are checked when the file loads. */
  var chk = function (got, want, what) { if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error("lesson number mismatch: " + what + " = " + got + ", expected " + want); };

  L["c1-resistive-1"] = {
    id: "c1-resistive-1", ar: "المقاومات على التوالي", en: "Resistors in Series", minutes: 15,
    objectives: ["تتعرف على المقاومات الموصلة على التوالي في أي رسم.", "تحسب المقاومة المكافئة لمقاومات على التوالي.", "تعرف أن التيار واحد في كل عناصر التوالي."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>في هذا الفصل نستخدم قانون أوم وقانوني كيرشوف لدوائر أكثر تعقيدًا، والهدف <b>تبسيط</b> الدائرة إلى دائرة مكافئة أسهل.</p>" +
        "<p>عندما يتصل عنصران عند عقدة واحدة لا يتصل بها غيرهما، نقول إنهما على <b>التوالي</b> <span class='ltr'>(series)</span>. والعناصر على التوالي <b>يمر فيها نفس التيار</b>.</p>" +
        "<p>في دائرة المحاضرة: مصدر <span class='ltr'>v<sub>s</sub></span> مع سبع مقاومات R₁ إلى R₇ في حلقة واحدة، كلها يمر فيها نفس التيار <span class='ltr'>i<sub>s</sub></span>. بتطبيق KVL حول الحلقة:</p>" +
        "<div class='eq'>−v<sub>s</sub> + i<sub>s</sub>R₁ + i<sub>s</sub>R₂ + … + i<sub>s</sub>R₇ = 0</div>" +
        "<div class='eq'>v<sub>s</sub> = i<sub>s</sub>(R₁ + R₂ + … + R₇) = i<sub>s</sub>R<sub>eq</sub></div>" +
        "<p>إذن نستبدل المقاومات السبع بمقاومة واحدة <span class='ltr'>R<sub>eq</sub></span> دون أن يتغير التيار في المصدر.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Series connection</dt><dd>عنصران يتصلان عند عقدة واحدة لا يتصل بها غيرهما، فيمر فيهما نفس التيار.</dd><dt>Equivalent resistance (R<sub>eq</sub>)</dt><dd>مقاومة واحدة لها نفس تأثير المجموعة على بقية الدائرة.</dd></dl>" },
      { id: "laws", title: "القانون", en: "Equation", html:
        "<div class='eq'>R<sub>eq</sub> = Σ R<sub>i</sub> = R₁ + R₂ + … + R<sub>k</sub></div><div class='eq'>v<sub>s</sub> = i<sub>s</sub>R<sub>eq</sub></div><p class='muted'>المقاومة المكافئة للتوالي أكبر دائمًا من أكبر مقاومة فيها.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>شكل الرسم لا يحدد التوالي. مقاومتان في خط واحد ليستا على التوالي إذا اتصل بالعقدة بينهما عنصر ثالث.</li>" +
        "<li>عند وجود مصدر في الحلقة: اجمع المقاومات أولًا ثم احسب التيار من <span class='eq-i'>i<sub>s</sub> = v<sub>s</sub> / R<sub>eq</sub></span>.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>نعوّض أرقامًا في دائرة المحاضرة: <span class='ltr'>v<sub>s</sub> = 140 V</span> و R₁ إلى R₇ قيمها <span class='ltr'>2, 3, 5, 10, 4, 6, 5 Ω</span>. أوجد <span class='ltr'>R<sub>eq</sub></span> والتيار <span class='ltr'>i<sub>s</sub></span> وجهد R₄.</p>" +
        "<ol class='steps'><li><span class='eq-i'>R<sub>eq</sub> = 2 + 3 + 5 + 10 + 4 + 6 + 5 = 35 Ω</span></li><li><span class='eq-i'>i<sub>s</sub> = 140 / 35 = 4 A</span>، نفس التيار في كل المقاومات.</li><li><span class='eq-i'>v₄ = i<sub>s</sub>R₄ = 4 × 10 = 40 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>أضواء الزينة القديمة كانت موصلة على التوالي: إذا احترق مصباح واحد انقطع التيار عن السلسلة كلها، لأن كل المصابيح يمر فيها نفس التيار.</p>" }
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

  var x31 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 120, { plus: "a", name: "V120" }), E([0, 0], [0, 1], "R", 4, { name: "R4", ilabel: "iₛ" }), E([0, 1], [1, 1], "R", 18, { name: "R18", ilabel: "i₁", vlabel: "v₁" }), E([0, 1], [0, 2], "R", 3, { name: "R3" }), E([0, 2], [1, 2], "R", 6, { name: "R6", ilabel: "i₂" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var s31 = solve(x31); chk(s31.R4.i, 12, "3.1 is"); chk(s31.R18.v, 72, "3.1 v1"); chk(s31.R18.i, 4, "3.1 i1"); chk(s31.R6.i, 8, "3.1 i2");

  L["c1-resistive-2"] = {
    id: "c1-resistive-2", ar: "المقاومات على التوازي", en: "Resistors in Parallel", minutes: 20,
    objectives: ["تتعرف على المقاومات الموصلة على التوازي.", "تحسب المقاومة المكافئة للتوازي، والحالة الخاصة لمقاومتين.", "تختزل شبكة فيها توالي وتوازي معًا."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>عندما يتصل عنصران عند <b>نفس زوج العقد</b> نقول إنهما على <b>التوازي</b> <span class='ltr'>(parallel)</span>، والعناصر على التوازي <b>لها نفس الجهد</b> بين أطرافها.</p>" +
        "<p>في دائرة المحاضرة: مصدر <span class='ltr'>v<sub>s</sub></span> مع أربع مقاومات على التوازي بين العقدتين a و b. من KCL: <span class='eq-i'>i<sub>s</sub> = i₁ + i₂ + i₃ + i₄</span>. ولأن الجهد واحد: <span class='eq-i'>i₁R₁ = i₂R₂ = i₃R₃ = i₄R₄ = v<sub>s</sub></span>، أي <span class='eq-i'>i<sub>k</sub> = v<sub>s</sub>/R<sub>k</sub></span>.</p>" +
        "<p>بالتعويض: <span class='eq-i'>i<sub>s</sub> = v<sub>s</sub>(1/R₁ + 1/R₂ + 1/R₃ + 1/R₄)</span>، ومنها <span class='eq-i'>i<sub>s</sub>/v<sub>s</sub> = 1/R<sub>eq</sub></span>.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Parallel connection</dt><dd>عناصر بين نفس زوج العقد، فلها نفس الجهد.</dd><dt>Conductance (G)</dt><dd><span class='ltr'>G = 1/R</span> بالسيمنز؛ الموصليات على التوازي تُجمع.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>1/R<sub>eq</sub> = Σ 1/R<sub>i</sub> = 1/R₁ + 1/R₂ + … + 1/R<sub>k</sub></div>" +
        "<div class='eq'>G<sub>eq</sub> = Σ G<sub>i</sub> = G₁ + G₂ + … + G<sub>k</sub></div>" +
        "<p>وكثيرًا ما تكون مقاومتان فقط على التوازي:</p><div class='eq'>R<sub>eq</sub> = R₁R₂ / (R₁ + R₂)</div><p class='muted'>المقاومة المكافئة للتوازي أصغر دائمًا من أصغر مقاومة فيها.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>المعيار: هل العنصران بين نفس العقدتين؟ وليس: هل هما مرسومان متجاورين.</li>" +
        "<li>في دائرة توالي-توازي: اختزل من الطرف البعيد عن المصدر نحو المصدر، ثم ارجع لتوزيع التيارات والجهود.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 3.1: أوجد <span class='ltr'>i<sub>s</sub></span> و <span class='ltr'>i₁</span> و <span class='ltr'>i₂</span> في الدائرة.</p>" + fig(x31, "مصدر 120 V مع 4 Ω و 18 Ω و 3 Ω و 6 Ω") +
        "<ol class='steps'><li>3 Ω و 6 Ω على التوالي: <span class='eq-i'>3 + 6 = 9 Ω</span>.</li>" +
        "<li>9 Ω على التوازي مع 18 Ω: <span class='eq-i'>(18 × 9)/(18 + 9) = 6 Ω</span>.</li>" +
        "<li>مع 4 Ω على التوالي: <span class='eq-i'>R<sub>eq</sub> = 4 + 6 = 10 Ω ← i<sub>s</sub> = 120/10 = 12 A</span></li>" +
        "<li><span class='eq-i'>v₁ = (12)(6) = 72 V</span></li>" +
        "<li><span class='eq-i'>i₁ = 72/18 = 4 A</span> و <span class='eq-i'>i₂ = 72/9 = 8 A</span>، وتحقق: <span class='ltr'>4 + 8 = 12 A</span>.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>أجهزة البيت كلها على التوازي مع خط الكهرباء: كل جهاز يأخذ نفس الجهد 220 V، وكلما شغّلت جهازًا إضافيًا قلّت المقاومة المكافئة وزاد التيار الكلي من العداد.</p>" }
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

  var x32 = { rows: 3, cols: 2, edges: [E([0, 0], [1, 0], "V", 100, { plus: "a", name: "V100" }), E([1, 0], [2, 0], "W"), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 25000, { name: "R1", vtext: "25 kΩ" }), E([1, 1], [2, 1], "R", 100000, { name: "R2", vtext: "100 kΩ", vlabel: "vₒ" }), E([2, 0], [2, 1], "W")] };
  var s32 = solve(x32); chk(s32.R2.v, 80, "3.2 vo");
  var x33 = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "I", 10, { dir: "ba", name: "I10" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 16, { name: "R16" }), E([0, 1], [0, 2], "R", 1.6, { name: "R1.6", ilabel: "iₒ" }), E([0, 2], [1, 2], "R", 4, { name: "R4" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "R", 6, { name: "R6", ilabel: "i₆" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W"), E([1, 2], [1, 3], "W")] };
  var s33 = solve(x33); chk(s33["R1.6"].i, 8, "3.3 io"); chk(s33.R6.i, 3.2, "3.3 i6"); chk(s33.R6.p, 61.44, "3.3 p6");
  var x313 = { rows: 3, cols: 3, edges: [E([0, 0], [1, 0], "V", 20, { plus: "a", name: "V20" }), E([1, 0], [2, 0], "W"), E([0, 0], [0, 1], "R", 40, { name: "R40" }), E([0, 1], [2, 1], "R", 10, { name: "R2", vtext: "", vlabel: "vₒ" }), E([0, 1], [0, 2], "W"), E([0, 2], [2, 2], "R", 24, { name: "RL", vtext: "" }), E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W")] };
  var s313 = solve(x313); chk(s313.R2.v, 3, "P3.13 loaded vo");

  L["c1-resistive-3"] = {
    id: "c1-resistive-3", ar: "دائرة مقسّم الجهد ومقسّم التيار", en: "The Voltage-Divider and Current-Divider Circuits", minutes: 25,
    objectives: ["تحسب جهد الخرج لمقسّم الجهد بدون حمل ومع حمل.", "تحسب تيار فرع في مقسّم التيار.", "تفهم لماذا يغيّر الحمل جهد الخرج."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>مقسّم الجهد</b> <span class='ltr'>(voltage divider)</span>: في الدوائر الإلكترونية نحتاج أكثر من مستوى جهد من مصدر واحد. مقاومتان R₁ و R₂ على التوالي مع <span class='ltr'>v<sub>s</sub></span>: <span class='eq-i'>i = v<sub>s</sub>/(R₁ + R₂)</span>، ثم بقانون أوم نحسب جهد كل مقاومة.</p>" +
        "<p><b>مقسّم الجهد المحمَّل:</b> إذا وصلنا حملًا <span class='ltr'>R<sub>L</sub></span> على التوازي مع R₂ (الشكل 3.13)، نستبدل R₂ بـ <span class='ltr'>R<sub>eq</sub> = R₂R<sub>L</sub>/(R₂ + R<sub>L</sub>)</span>، فينخفض جهد الخرج.</p>" +
        "<p><b>مقسّم التيار</b> <span class='ltr'>(current divider)</span>: مقاومتان على التوازي مع مصدر تيار <span class='ltr'>i<sub>s</sub></span> (الشكل 3.15). جهدهما واحد: <span class='eq-i'>v = i₁R₁ = i₂R₂ = (R₁R₂/(R₁ + R₂)) i<sub>s</sub></span>.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Voltage divider</dt><dd>مقاومات على التوالي تقسم جهد المصدر.</dd><dt>Load (R<sub>L</sub>)</dt><dd>المقاومة التي نوصلها على خرج المقسّم.</dd><dt>Current divider</dt><dd>مقاومات على التوازي تقسم تيار المصدر.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>v₁ = v<sub>s</sub> R₁/(R₁ + R₂)   ،   v₂ = v<sub>s</sub> R₂/(R₁ + R₂)</div>" +
        "<div class='eq'>vₒ = v<sub>s</sub> R<sub>eq</sub>/(R₁ + R<sub>eq</sub>)  ،  R<sub>eq</sub> = R₂R<sub>L</sub>/(R₂ + R<sub>L</sub>)</div>" +
        "<div class='eq'>vₒ = R₂ v<sub>s</sub> / (R₁[1 + R₂/R<sub>L</sub>] + R₂)</div>" +
        "<div class='eq'>i₁ = i<sub>s</sub> R₂/(R₁ + R₂)   ،   i₂ = i<sub>s</sub> R₁/(R₁ + R₂)</div>" +
        "<p class='muted'>انتبه: في قسمة التيار يكون في البسط المقاومة <b>الأخرى</b>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>مقسّم الجهد: المقاومات على التوالي ولا يُسحب تيار من نقطة الخرج، أو نضم الحمل إلى R₂ أولًا.</li>" +
        "<li>مقسّم التيار: مقاومتان على التوازي يغذيهما تيار معروف. إذا كانت المقاومات أكثر، اختزل أولًا ثم قسّم على مراحل.</li>" +
        "<li>عندما <span class='ltr'>R<sub>L</sub> → ∞</span> (بدون حمل) نرجع لقانون المقسّم العادي.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Examples", html:
        "<p class='q'>مثال 3.2: أوجد جهد الخرج <span class='ltr'>vₒ</span>.</p>" + fig(x32, "مقسم جهد 100 V مع 25 kΩ و 100 kΩ") +
        "<ol class='steps'><li><span class='eq-i'>vₒ = 100 × 100000/(100000 + 25000) = 100 × 100/125 = 80 V</span></li></ol>" +
        "<p class='q'>مثال 3.3: أوجد القدرة المستهلكة في المقاومة <span class='ltr'>6 Ω</span>.</p>" + fig(x33, "مصدر تيار 10 A مع 16 Ω و 1.6 Ω و 4 Ω و 6 Ω") +
        "<ol class='steps'><li>بسّط: <span class='eq-i'>(4 × 6)/(4 + 6) + 1.6 = 2.4 + 1.6 = 4 Ω</span></li>" +
        "<li>قسمة التيار بين 16 Ω و 4 Ω: <span class='eq-i'>iₒ = (16/(16 + 4))(10) = 8 A</span>، وهو تيار 1.6 Ω.</li>" +
        "<li>قسّم iₒ بين 4 Ω و 6 Ω: <span class='eq-i'>i₆ = (4/(6 + 4))(8) = 3.2 A</span></li>" +
        "<li><span class='eq-i'>p = (3.2)²(6) = 61.44 W</span></li></ol>" +
        "<p class='q'>مسألة 3.13 (التيوتوريال): في مقسّم الجهد، قيمة <span class='ltr'>vₒ</span> بدون حمل <span class='ltr'>4 V</span>. عند توصيل الحمل <span class='ltr'>R<sub>L</sub></span> بين a و b تنخفض إلى <span class='ltr'>3 V</span>. أوجد <span class='ltr'>R<sub>L</sub></span>.</p>" + fig(x313, "مقسم جهد 20 V مع 40 Ω و R2 والحمل RL") +
        "<ol class='steps'><li>بدون حمل: <span class='eq-i'>4 = 20 R₂/(40 + R₂) ← R₂ = 10 Ω</span></li>" +
        "<li>مع الحمل: <span class='eq-i'>3 = 20 R<sub>eq</sub>/(40 + R<sub>eq</sub>) ← R<sub>eq</sub> = 120/17 ≈ 7.06 Ω</span></li>" +
        "<li><span class='eq-i'>1/R<sub>L</sub> = 17/120 − 1/10 ← R<sub>L</sub> = 24 Ω</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مقبض الصوت (potentiometer) مقسّم جهد متغير. ومسألة 3.13 تشرح لماذا يتغير جهد المقسّم عند توصيل حمل: الحمل يقلل المقاومة السفلية فينخفض الخرج.</p>" }
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

  var x34 = { rows: 4, cols: 5, edges: [E([0, 0], [1, 0], "I", 8, { dir: "ba", name: "I8" }), E([1, 0], [3, 0], "W"), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 36, { name: "R36" }), E([1, 1], [2, 1], "R", 44, { name: "R44" }), E([2, 1], [3, 1], "W"), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 10, { name: "R10" }), E([1, 2], [3, 2], "W"), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "R", 40, { name: "R40" }), E([1, 3], [2, 3], "R", 10, { name: "R10’" }), E([2, 3], [3, 3], "R", 30, { name: "R30", vlabel: "vₒ" }), E([0, 3], [0, 4], "W"), E([0, 4], [3, 4], "R", 24, { name: "R24", ilabel: "iₒ" }), E([3, 0], [3, 1], "W"), E([3, 1], [3, 2], "W"), E([3, 2], [3, 3], "W"), E([3, 3], [3, 4], "W")] };
  var s34 = solve(x34); chk(s34.R24.i, 2, "3.4 io"); chk(s34.R24.v, 48, "3.4 v"); chk(s34.R30.v, 18, "3.4 vo");

  L["c1-resistive-4"] = {
    id: "c1-resistive-4", ar: "قسمة الجهد وقسمة التيار", en: "Voltage Division and Current Division", minutes: 25,
    objectives: ["تطبق قسمة الجهد على أي عدد من المقاومات على التوالي.", "تطبق قسمة التيار على أي عدد من الفروع على التوازي.", "تستخدمهما داخل دائرة أكبر بعد إيجاد المقاومة المكافئة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>نعمّم المقسّمين على أي عدد من المقاومات.</p>" +
        "<p><b>قسمة الجهد:</b> مقاومات على التوالي <span class='ltr'>R₁ … R<sub>n</sub></span> مع جهد v. <span class='ltr'>R<sub>eq</sub></span> هي مجموعها، والتيار <span class='ltr'>i = v/R<sub>eq</sub></span>، فجهد أي مقاومة <span class='ltr'>R<sub>j</sub></span>: <span class='eq-i'>v<sub>j</sub> = iR<sub>j</sub> = (R<sub>j</sub>/R<sub>eq</sub>) v</span>.</p>" +
        "<p><b>قسمة التيار:</b> مقاومات على التوازي يغذيها تيار i. نحسب <span class='ltr'>R<sub>eq</sub></span> للتوازي، فالجهد المشترك <span class='ltr'>v = iR<sub>eq</sub></span>، ثم بقانون أوم: <span class='eq-i'>i<sub>j</sub> = v/R<sub>j</sub> = (R<sub>eq</sub>/R<sub>j</sub>) i</span>.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Voltage division</dt><dd>نصيب كل مقاومة من الجهد يتناسب مع قيمتها.</dd><dt>Current division</dt><dd>نصيب كل فرع من التيار يتناسب عكسيًا مع مقاومته.</dd><dt>R₁ ∥ R₂</dt><dd>رمز التوازي بين مقاومتين.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>v<sub>j</sub> = (R<sub>j</sub> / R<sub>eq</sub>) v   (توالي)</div>" +
        "<div class='eq'>v = i(R₁ ∥ R₂ ∥ … ∥ R<sub>n</sub>) = iR<sub>eq</sub></div>" +
        "<div class='eq'>i<sub>j</sub> = v / R<sub>j</sub> = (R<sub>eq</sub> / R<sub>j</sub>) i   (توازي)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>استخدم القسمة لتصل إلى المطلوب مباشرة دون حل كل الدائرة.</li>" +
        "<li>كما في مثال 3.4: استخدم قسمة التيار لإيجاد تيار فرع، ثم قانون أوم للجهد، ثم قسمة الجهد داخل الفرع.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 3.4: استخدم قسمة التيار لإيجاد <span class='ltr'>iₒ</span>، وقسمة الجهد لإيجاد <span class='ltr'>vₒ</span>.</p>" + fig(x34, "مصدر تيار 8 A مع أربعة فروع على التوازي") +
        "<ol class='steps'><li><span class='eq-i'>R<sub>eq</sub> = (36 + 44) ∥ 10 ∥ (40 + 10 + 30) ∥ 24 = 80 ∥ 10 ∥ 80 ∥ 24</span></li>" +
        "<li><span class='eq-i'>R<sub>eq</sub> = 1/(1/80 + 1/10 + 1/80 + 1/24) = 6 Ω</span></li>" +
        "<li>قسمة التيار: <span class='eq-i'>iₒ = (6/24)(8) = 2 A</span></li>" +
        "<li>قانون أوم: <span class='eq-i'>v = (24)(2) = 48 V</span></li>" +
        "<li>قسمة الجهد في فرع 40 + 10 + 30: <span class='eq-i'>vₒ = (30/80)(48) = 18 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>الأميتر يقيس تيارات كبيرة بمقاومة صغيرة جدًا (shunt) على التوازي مع ملفه: معظم التيار يمر في المقاومة الصغيرة، وجزء صغير معروف يمر في الجهاز. هذه قسمة تيار.</p>" }
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

  var x37 = bridge(100, 125, 25, 40, 37.5);
  x37.edges[0] = E([1, 0], [2, 0], "V", 40, { plus: "a", name: "V40" }); x37.edges[2] = E([0, 0], [0, 1], "R", 5, { name: "5Ω" });
  x37.edges.forEach(function (e) { if (e.type === "R") e.vtext = ""; if (e.name === "R1") e.name = "100Ω"; if (e.name === "R2") e.name = "125Ω"; if (e.name === "R5") e.name = "25Ω"; if (e.name === "R3") e.name = "40Ω"; if (e.name === "R4") e.name = "37.5Ω"; });
  var s37 = solve(x37); chk(Math.abs(s37.V40.i), 0.5, "3.7 i"); chk(Math.abs(s37.V40.p), 20, "3.7 p");

  L["c1-resistive-5"] = {
    id: "c1-resistive-5", ar: "تحويل دلتا إلى واي", en: "Delta-to-Wye (Pi-to-Tee) Equivalent Circuits", minutes: 30,
    objectives: ["تتعرف على شبكة لا يمكن اختزالها بالتوالي والتوازي.", "تحوّل بين Δ و Y في الاتجاهين.", "تحسب المقاومة المكافئة لدائرة جسر."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>أحيانًا نجد مقاومات <b>ليست على التوالي ولا على التوازي</b>. في هذه الحالة (إذا لم نستخدم طريقة العقد أو الحلقات) نحوّل جزءًا من الدائرة من شكل إلى آخر.</p>" +
        "<p>الشكلان اللذان يسببان هذه الصعوبة هما <b>الواي</b> <span class='ltr'>(Y)</span> و<b>الدلتا</b> <span class='ltr'>(Δ)</span>، ويسميان أيضًا <b>تي</b> <span class='ltr'>(T)</span> و<b>باي</b> <span class='ltr'>(π)</span>.</p>" +
        fig(b1, "دائرة جسر بين الطرفين a و b") +
        "<p>بعد التحويل تبقى المقاومة بين كل زوج من الأطراف a و b و c كما هي، فلا تتغير بقية الدائرة، ويصبح الاختزال بالتوالي والتوازي ممكنًا.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html: "<dl class='terms'><dt>Delta (Δ) / Pi (π)</dt><dd>ثلاث مقاومات R<sub>a</sub> و R<sub>b</sub> و R<sub>c</sub> بين ثلاث عقد.</dd><dt>Wye (Y) / Tee (T)</dt><dd>ثلاث مقاومات R₁ و R₂ و R₃ تخرج من نقطة مركزية إلى العقد الثلاث.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<p><b>من Δ إلى Y:</b> كل مقاومة في Y = حاصل ضرب مقاومتي Δ في الفرعين الأقرب إليها ÷ مجموع مقاومات Δ.</p>" +
        "<div class='eq'>R₁ = R<sub>b</sub>R<sub>c</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div><div class='eq'>R₂ = R<sub>c</sub>R<sub>a</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div><div class='eq'>R₃ = R<sub>a</sub>R<sub>b</sub> / (R<sub>a</sub> + R<sub>b</sub> + R<sub>c</sub>)</div>" +
        "<p><b>من Y إلى Δ:</b> كل مقاومة في Δ = مجموع حواصل الضرب الممكنة لمقاومات Y ÷ مقاومة Y الأبعد عنها.</p>" +
        "<div class='eq'>R<sub>a</sub> = (R₁R₂ + R₂R₃ + R₃R₁) / R₁</div><div class='eq'>R<sub>b</sub> = (R₁R₂ + R₂R₃ + R₃R₁) / R₂</div><div class='eq'>R<sub>c</sub> = (R₁R₂ + R₂R₃ + R₃R₁) / R₃</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>جرّب التوالي والتوازي أولًا. استخدم التحويل فقط إذا لم تجد أيًا منهما.</li>" +
        "<li>إذا كان المطلوب تيار المصدر وقدرته فقط، يكفي إيجاد المقاومة المكافئة بين طرفيه.</li>" +
        "<li>يمكن تحويل الدلتا العلوية أو السفلية؛ اختر ما يجعل الاختزال أسهل.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 3.7: أوجد التيار والقدرة التي يعطيها مصدر <span class='ltr'>40 V</span>.</p>" + fig(x37, "مصدر 40 V مع 5 Ω وشبكة جسر 100 و 125 و 25 و 40 و 37.5 Ω") +
        "<ol class='steps'><li>المطلوب فقط تيار المصدر، فنحتاج المقاومة المكافئة بين طرفيه.</li>" +
        "<li>نحوّل الدلتا العلوية (100 و 125 و 25 Ω، مجموعها 250 Ω) إلى Y: <span class='eq-i'>R₁ = (100 × 125)/250 = 50 Ω</span>، <span class='eq-i'>R₂ = (125 × 25)/250 = 12.5 Ω</span>، <span class='eq-i'>R₃ = (100 × 25)/250 = 10 Ω</span></li>" +
        "<li>الآن: 10 + 40 = 50 Ω على التوازي مع 12.5 + 37.5 = 50 Ω، أي 25 Ω.</li>" +
        "<li><span class='eq-i'>R<sub>eq</sub> = 5 + 50 + (50)(50)/100 = 80 Ω</span></li>" +
        "<li><span class='eq-i'>i = 40/80 = 0.5 A</span>، والقدرة <span class='eq-i'>p = −iv = −0.5 × 40 = −20 W</span>، أي المصدر يعطي 20 W.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>محركات المصانع ومحولات التوزيع توصّل ملفاتها إما Y أو Δ، والتحويل بين الشكلين هو نفس الفكرة التي تستخدمها لاحقًا في الدوائر ثلاثية الطور في سيركت 2.</p>" }
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
