/* Electric Circuits 2 (EE 2020) — Chapter 3: Response of First-Order RL and RC Circuits (lecture 4) and
   Chapter 4: Natural and Step Responses of RLC Circuits (lecture 5 and the chapter-8 tutorial). */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var C = "circuits-2", ex = Math.exp;
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var W = function (a, b) { return E(a, b, "W"); };
  function cir(rows, cols, edges, o) { var c = { rows: rows, cols: cols, edges: edges }; for (var k in (o || {})) c[k] = o[k]; return { html: CV.draw.render(c, { aria: "مخطط الدائرة" }) }; }
  var U = S.U, A = U([["mA", 1e-3], ["A", 1]]), V = U([["mV", 1e-3], ["V", 1]]), SEC = U([["ms", 1e-3], ["s", 1]]), RADS = U([["rad/s", 1], ["krad/s", 1e3]]), OHM = U([["Ω", 1], ["kΩ", 1e3]]), FF = U([["µF", 1e-6], ["mF", 1e-3]]), HH = U([["mH", 1e-3], ["H", 1]]);
  var pos = function (f) { return function (t) { return t < 0 ? NaN : f(t); }; };

  /* ======================= Chapter 3: First-order circuits ======================= */
  var CH3 = "الفصل 3: استجابة دوائر RL و RC من الرتبة الأولى";
  S.lesson({
    id: "c2-first-order-1", course: C, chapter: CH3, ar: "الاستجابة الطبيعية لدائرة RL", en: "The Natural Response of an RL Circuit", min: 35,
    obj: ["تشتق i(t) = I₀e^(−t/τ) لدائرة RL بلا مصدر.", "تحسب ثابت الزمن τ = L/R باستخدام R المكافئة.", "تحسب القيم عند 0⁻ و 0⁺ والطاقة المبددة."],
    idea: [
      "دوائر RL و RC <b>من الرتبة الأولى</b> لأن جهودها وتياراتها توصف بمعادلة تفاضلية من الرتبة الأولى. <b>الاستجابة الطبيعية</b> تحدث عندما تُفصل المصادر فجأة، فتُفرغ الطاقة المخزنة في المقاومات.",
      "قبل التبديل (t < 0) يكون الملف قصرًا في DC، فنجد " + m("i(0<sup>−</sup>) = I<sub>0</sub>") + ". وبعده KVL: " + m("L di/dt + Ri = 0") + " وحلها " + m("i(t) = I<sub>0</sub>e<sup>−t/τ</sup>") + " حيث " + m("τ = L/R") + " <b>ثابت الزمن</b>. والتيار لا يقفز: " + m("i(0<sup>+</sup>) = i(0<sup>−</sup>)") + "، أما جهد الملف فيقفز.",
      "جهد المقاومة " + m("v = RI<sub>0</sub>e<sup>−t/τ</sup>") + "، والقدرة " + m("p = RI<sub>0</sub>²e<sup>−2t/τ</sup>") + "، والطاقة المبددة حتى ∞ تساوي ما كان مخزنًا: " + m("w = ½LI<sub>0</sub>²") + ". وفي دائرة أكبر نستخدم " + m("R<sub>eq</sub>") + " المرئية من طرفي الملف."
    ],
    figs: [{ plot: { x: [-0.2, 5], y: [-0.05, 1.15], xl: "t / τ", yl: "i / I₀ = e^(−t/τ)", items: [{ ct: pos(function (t) { return ex(-t); }) }, { hline: Math.exp(-1), c: 3, label: "0.368 عند t = τ" }, { vline: 1, c: 3 }] }, cap: "بعد τ يبقى 36.8% من التيار، وبعد 5τ أقل من 1%." }],
    laws: ["i(t) = I<sub>0</sub> e<sup>−t/τ</sup>,  t ≥ 0", "τ = L/R<sub>eq</sub>", "v(t) = R I<sub>0</sub> e<sup>−t/τ</sup>", "w(∞) = ½ L I<sub>0</sub>²"],
    when: ["الخطوات: (1) I₀ من الدائرة قبل التبديل (الملف قصر). (2) R<sub>eq</sub> بعد التبديل من طرفي الملف. (3) τ = L/R<sub>eq</sub>. (4) i = I₀e<sup>−t/τ</sup>، ثم باقي الكميات منه."],
    ex: [
      { q: "ملف 50 mH و " + m("i<sub>L</sub>(0<sup>−</sup>) = 2 A") + "، وقبل التبديل كان على التوازي مع 10 Ω (v<sub>1</sub>)، وبعده يرى 10 Ω ∥ 10 Ω. أوجد القيم و v<sub>L</sub>(t).",
        s: [m("i<sub>L</sub>(0<sup>+</sup>) = i<sub>L</sub>(0<sup>−</sup>) = 2 A") + " (لا يتغير لحظيًا).", m("v<sub>1</sub>(0<sup>−</sup>) = 2 × 10 = 20 V = v<sub>L</sub>(0<sup>−</sup>)") + ".", m("R<sub>eq</sub> = 10 ∥ 10 = 5 Ω") + " ⇐ " + m("v<sub>L</sub>(0<sup>+</sup>) = 5 × 2 = 10 V") + ": جهد الملف قفز من 20 إلى 10 V.", m("τ = 0.05/5 = 0.01 s") + " ⇐ " + m("v<sub>L</sub>(t) = 10e<sup>−100t</sup> V") + "، t > 0."] },
      { q: "مثال 7.4 (Alexander): 40 V و 2 Ω و 4 Ω و 12 Ω و 16 Ω وملف 2 H. المفتاح مغلق طويلًا ثم يُفتح عند t = 0. أوجد i(t).",
        s: ["t < 0: الملف قصر فيقصر 16 Ω، و " + m("4 ∥ 12 = 3 Ω") + " ⇐ " + m("i<sub>1</sub> = 40/(2 + 3) = 8 A") + ".", "بمقسم التيار: " + m("i(0<sup>−</sup>) = (12/16) × 8 = 6 A") + ".", "t > 0: " + m("R<sub>eq</sub> = (12 + 4) ∥ 16 = 8 Ω") + "، " + m("τ = 2/8 = 1/4 s") + ".", m("i(t) = 6e<sup>−4t</sup> A") + "."],
        fig: cir(2, 5, [E([1, 0], [0, 0], "V", 40, { name: "", vtext: "40 V", plus: "b" }), E([0, 0], [0, 1], "R", 2, { name: "", vtext: "2 Ω" }), E([0, 1], [0, 2], "W", 0, { sw: true, label: "t = 0" }), E([0, 1], [1, 1], "R", 12, { name: "", vtext: "12 Ω" }), E([0, 2], [0, 3], "R", 4, { name: "", vtext: "4 Ω" }), E([0, 3], [1, 3], "R", 16, { name: "", vtext: "16 Ω" }), W([0, 3], [0, 4]), E([0, 4], [1, 4], "L", 2, { name: "", vtext: "2 H" }), W([1, 0], [1, 1]), W([1, 1], [1, 3]), W([1, 3], [1, 4])]),
        after: { x: [-0.1, 1.5], y: [-0.2, 6.6], xl: "t (s)", yl: "i(t) = 6e^(−4t) A", items: [{ ct: function (t) { return t < 0 ? 6 : 6 * ex(-4 * t); } }] } },
      { q: "مثال 7.5 (Alexander): 10 V و 2 Ω و 3 Ω و 6 Ω وملف 2 H؛ المفتاح كان مفتوحًا ثم يُغلق عند t = 0 فيقصر المصدر. أوجد i و v<sub>o</sub> و i<sub>o</sub>.",
        s: ["t < 0: " + m("i(0) = 10/(2 + 3) = 2 A") + "، و " + m("v<sub>o</sub> = 3i = 6 V") + ".", "t > 0: " + m("R<sub>Th</sub> = 3 ∥ 6 = 2 Ω") + "، " + m("τ = 2/2 = 1 s") + " ⇐ " + m("i = 2e<sup>−t</sup> A") + ".", m("v<sub>o</sub> = −L di/dt = 4e<sup>−t</sup> V") + " و " + m("i<sub>o</sub> = −v<sub>o</sub>/6 = −(2/3)e<sup>−t</sup> A") + ".", "لاحظ أن i<sub>o</sub> قفز من 0 إلى −2/3 A، أما i فلم يقفز."] }
    ],
    real: "مرحّل (relay) عند قطع تياره يبقى ملفه يحمل تيارًا يتلاشى بثابت زمن L/R؛ ولذلك يُوضع ديود موازٍ له لتصريف الطاقة بأمان.",
    quiz: [
      S.q("ثابت زمن RL:", [["<span class='ltr'>L/R</span>", true, "τ = L/R."], ["<span class='ltr'>RL</span>", "formula", "هذا لا يعطي ثواني."], ["<span class='ltr'>R/L</span>", "formula", "هذا 1/τ."]]),
      S.q("بعد زمن τ، التيار في الاستجابة الطبيعية يساوي:", [["36.8% من قيمته الابتدائية", true, "e⁻¹."], ["63.2%", "conceptual", "هذا للنمو في الاستجابة الدرجية."], ["صفر", "conceptual", "بعد 5τ تقريبًا."]]),
      S.q("عند t = 0⁺ في دائرة RL:", [["تيار الملف = قيمته عند 0⁻", true, "لا يقفز."], ["جهد الملف = قيمته عند 0⁻", "conceptual", "الجهد قد يقفز."], ["تيار الملف صفر", "conceptual", "يبقى I₀."]])
    ],
    practice: {
      prompt: "ملف " + m("L = 0.4 H") + " يحمل " + m("I<sub>0</sub> = 5 A") + "، ثم يُوصل بـ " + m("R = 20 Ω") + " عند t = 0.",
      steps: [
        S.step("s1", "ثابت الزمن.", "τ =", 0.02, { units: SEC, ud: 0, hints: ["L/R."], sol: "20 ms.", diag: [{ value: 8, type: "formula", why: "τ = L/R وليس R·L." }] }),
        S.step("s2", "التيار عند t = 20 ms.", "i =", 5 * ex(-1), { units: A, ud: 1, hints: ["5e⁻¹."], sol: "1.84 A." }),
        S.step("s3", "الطاقة الكلية المبددة في R.", "w =", 0.5 * 0.4 * 25, { units: U([["J", 1]]), hints: ["½LI₀²."], sol: "5 J." })
      ]
    }
  });

  S.lesson({
    id: "c2-first-order-2", course: C, chapter: CH3, ar: "الاستجابة الطبيعية لدائرة RC", en: "The Natural Response of an RC Circuit", min: 35,
    obj: ["تشتق v(t) = V₀e^(−t/τ) لدائرة RC بلا مصدر.", "تحسب τ = R_eq C والجهد الابتدائي من الدائرة قبل التبديل.", "تحسب التيارات والجهود والطاقة."],
    idea: [
      "المكثف في DC دائرة مفتوحة، وجهده لا يتغير لحظيًا. عند فصل المصدر: " + m("C dv/dt + v/R = 0") + " وحلها " + m("v(t) = V<sub>0</sub>e<sup>−t/τ</sup>") + " حيث " + m("τ = RC") + "؛ نفس شكل كل دوائر الرتبة الأولى.",
      "الخطوات: (1) أوجد الجهد الابتدائي " + m("V<sub>0</sub>") + " على المكثف (من الدائرة قبل التبديل، المكثف مفتوح). (2) أوجد ثابت الزمن " + m("τ = R<sub>eq</sub>C") + ". (3) استخدم " + m("v = V<sub>0</sub>e<sup>−t/τ</sup>") + " ثم استنتج الباقي. والطاقة الكلية المبددة " + m("½CV<sub>0</sub>²") + "."
    ],
    figs: [{ plot: { x: [-0.2, 5], y: [-0.05, 1.15], xl: "t / τ", yl: "v / V₀", items: [{ ct: pos(function (t) { return ex(-t); }) }, { hline: Math.exp(-1), c: 3, label: "0.368" }] }, cap: "تفريغ المكثف: نفس المنحنى الأسي." }],
    laws: ["v(t) = V<sub>0</sub> e<sup>−t/τ</sup>,  t ≥ 0", "τ = R<sub>eq</sub> C", "i(t) = (V<sub>0</sub>/R) e<sup>−t/τ</sup>", "w(∞) = ½ C V<sub>0</sub>²"],
    when: ["المكثف مفتوح في DC: استخدم مقسم الجهد لإيجاد V₀.", "بعد التبديل: R<sub>eq</sub> من طرفي المكثف."],
    ex: [
      { q: "مثال 7.3 (Nilsson): 100 V و 10 kΩ ومكثف 0.5 µF؛ ينتقل المفتاح إلى 32 kΩ ثم (240 kΩ ∥ 60 kΩ). أوجد v<sub>C</sub> و v<sub>o</sub> و i<sub>o</sub> والطاقة في 60 kΩ.",
        s: ["قبل التبديل المكثف مشحون إلى 100 V.", m("R<sub>eq</sub> = 32 + 240 ∥ 60 = 32 + 48 = 80 kΩ") + "، " + m("τ = 80k × 0.5µ = 40 ms") + " ⇐ " + m("v<sub>C</sub> = 100e<sup>−25t</sup> V") + ".", "بمقسم الجهد: " + m("v<sub>o</sub> = (48/80)v<sub>C</sub> = 60e<sup>−25t</sup> V") + "، و " + m("i<sub>o</sub> = v<sub>o</sub>/60k = e<sup>−25t</sup> mA") + ".", m("p<sub>60k</sub> = 60e<sup>−50t</sup> mW") + "، و " + m("w = ∫<sub>0</sub><sup>∞</sup> p dt = 1.2 mJ") + "."] },
      { q: "مثال 7.1 (Alexander): " + m("v<sub>C</sub>(0) = 15 V") + "، و C = 0.1 F، و 5 Ω ∥ (8 Ω + 12 Ω). أوجد v<sub>C</sub> و v<sub>x</sub> (على 12 Ω) و i<sub>x</sub>.",
        s: [m("R<sub>eq</sub> = 5 ∥ 20 = 4 Ω") + "، " + m("τ = 4 × 0.1 = 0.4 s") + ".", m("v<sub>C</sub> = 15e<sup>−2.5t</sup> V") + ".", m("v<sub>x</sub> = (12/20)v<sub>C</sub> = 9e<sup>−2.5t</sup> V") + "، و " + m("i<sub>x</sub> = v<sub>x</sub>/12 = 0.75e<sup>−2.5t</sup> A") + "."],
        after: { x: [-0.2, 2], y: [-0.5, 16], xl: "t (s)", yl: "vC (أزرق) و vx (برتقالي)", items: [{ ct: pos(function (t) { return 15 * ex(-2.5 * t); }) }, { ct: pos(function (t) { return 9 * ex(-2.5 * t); }), c: 2 }] } },
      { q: "مثال 7.2 (Alexander): 20 V و 3 Ω و 9 Ω و 1 Ω ومكثف 20 mF؛ يُفتح المفتاح عند t = 0. أوجد v(t) والطاقة الابتدائية.",
        s: ["t < 0: المكثف مفتوح، و " + m("v<sub>C</sub>(0) = (9/12)(20) = 15 V") + ".", "t > 0: " + m("R<sub>eq</sub> = 1 + 9 = 10 Ω") + "، " + m("τ = 10 × 0.02 = 0.2 s") + ".", m("v(t) = 15e<sup>−5t</sup> V") + "، و " + m("w(0) = ½ × 0.02 × 15² = 2.25 J") + "."] }
    ],
    real: "فلاش الكاميرا: مكثف يُشحن ثم يُفرغ في المصباح بثابت زمن صغير جدًا، فيعطي ومضة قوية قصيرة.",
    quiz: [
      S.q("τ لدائرة 10 kΩ و 100 µF:", [["1 s", true, "10⁴ × 10⁻⁴."], ["0.1 s", "math", "10⁴ × 10⁻⁴ = 1."], ["100 s", "formula", "RC."]]),
      S.q("V₀ = 12 V، بعد 2τ:", [["1.62 V", true, "12e⁻²."], ["4.42 V", "formula", "هذا بعد τ."], ["0 V", "conceptual", "لم يصل الصفر."]]),
      S.q("قبل التبديل بزمن طويل، المكثف:", [["مفتوح", true, "DC."], ["قصر", "conceptual", "هذا الملف."], ["جهده صفر دائمًا", "conceptual", "له جهد."]])
    ],
    practice: {
      prompt: "مكثف " + m("C = 4 µF") + " مشحون إلى " + m("V<sub>0</sub> = 50 V") + "، يُفرغ في " + m("R = 5 kΩ") + ".",
      steps: [
        S.step("s1", "τ =", "τ =", 0.02, { units: SEC, ud: 0, hints: ["RC."], sol: "20 ms." }),
        S.step("s2", "التيار عند t = 0⁺.", "i =", 0.01, { units: A, ud: 0, hints: ["V₀/R."], sol: "10 mA." }),
        S.step("s3", "الزمن حتى يصل الجهد 25 V.", "t =", 0.02 * Math.log(2), { units: SEC, ud: 0, hints: ["τ ln2."], sol: "13.86 ms." })
      ]
    }
  });

  S.lesson({
    id: "c2-first-order-3", course: C, chapter: CH3, ar: "الاستجابة الدرجية لدائرة RL", en: "The Step Response of an RL Circuit", min: 35,
    obj: ["تشتق i(t) عند تطبيق مصدر DC فجأة على دائرة RL.", "تستخدم الصيغة العامة i = i∞ + (i₀ − i∞)e^(−t/τ).", "تحسب جهد الملف ولحظة وصوله قيمة معينة."],
    idea: [
      "<b>الاستجابة الدرجية</b>: تطبيق مصدر DC فجأة. KVL: " + m("V<sub>s</sub> = Ri + L di/dt") + "، وبالتكامل: " + m("i(t) = V<sub>s</sub>/R + (I<sub>0</sub> − V<sub>s</sub>/R)e<sup>−t/τ</sup>") + "، τ = L/R.",
      "إذا كانت الطاقة الابتدائية صفرًا: " + m("i = (V<sub>s</sub>/R)(1 − e<sup>−t/τ</sup>)") + " و " + m("v<sub>L</sub> = V<sub>s</sub>e<sup>−t/τ</sup>") + ". بعد τ واحد يصل التيار ≈ 63% من قيمته النهائية. وإذا لم تكن صفرًا: " + m("v<sub>L</sub> = (V<sub>s</sub> − I<sub>0</sub>R)e<sup>−t/τ</sup>") + ".",
      "<b>الصيغة العامة</b>: " + m("i(t) = i<sub>∞</sub> + (i<sub>0</sub> − i<sub>∞</sub>)e<sup>−t/τ</sup>") + ": نحتاج فقط القيمة الابتدائية، والقيمة النهائية (الملف قصر)، وثابت الزمن."
    ],
    figs: [{ plot: { x: [-0.3, 5], y: [-0.05, 1.15], xl: "t / τ", yl: "i / (Vs/R) و vL / Vs", items: [{ ct: function (t) { return t < 0 ? 0 : 1 - ex(-t); } }, { ct: pos(function (t) { return ex(-t); }), c: 2 }, { hline: 0.632, c: 3, label: "0.632" }] }, cap: "التيار ينمو (أزرق) وجهد الملف يتلاشى (برتقالي)." }],
    laws: ["i(t) = i<sub>∞</sub> + (i<sub>0</sub> − i<sub>∞</sub>) e<sup>−t/τ</sup>", "τ = L/R<sub>Th</sub>", "I<sub>0</sub> = 0: i = (V<sub>s</sub>/R)(1 − e<sup>−t/τ</sup>),  v<sub>L</sub> = V<sub>s</sub>e<sup>−t/τ</sup>", "v<sub>L</sub> = L di/dt = (V<sub>s</sub> − I<sub>0</sub>R) e<sup>−t/τ</sup>"],
    when: ["i₀ من الدائرة قبل التبديل، و i∞ من الدائرة بعده (الملف قصر)، و R<sub>Th</sub> من طرفي الملف بعد التبديل."],
    ex: [
      { q: "مثال 7.5 (Nilsson): المفتاح في a طويلًا (مصدر 8 A يعطي الملف 8 A معاكس)، ثم ينتقل إلى b: 24 V و 2 Ω وملف 200 mH. أوجد i(t) و v(t) ومتى يصير v = 24 V.",
        s: [m("i<sub>0</sub> = −8 A") + "، و " + m("i<sub>∞</sub> = 24/2 = 12 A") + "، و " + m("τ = 0.2/2 = 0.1 s") + ".", m("i = 12 + (−8 − 12)e<sup>−10t</sup> = 12 − 20e<sup>−10t</sup> A") + ".", m("v = L di/dt = 0.2 × 200e<sup>−10t</sup> = 40e<sup>−10t</sup> V") + ": عند 0⁺ قفز إلى 40 V.", m("24 = 40e<sup>−10t</sup>") + " ⇐ " + m("t = 0.1 ln(40/24) = 51.08 ms") + "."],
        after: { x: [-0.05, 0.5], y: [-9, 41], xl: "t (s)", yl: "i (أزرق) و v (برتقالي)", items: [{ ct: function (t) { return t < 0 ? -8 : 12 - 20 * ex(-10 * t); } }, { ct: pos(function (t) { return 40 * ex(-10 * t); }), c: 2 }, { hline: 24, c: 3 }] } },
      { q: "مثال 7.12 (Alexander): 10 V و 2 Ω و 3 Ω وملف 1/3 H؛ المفتاح يقصر 3 Ω طويلًا ثم يُفتح عند t = 0. أوجد i(t).",
        s: ["t < 0: " + m("i(0<sup>−</sup>) = 10/2 = 5 A") + "، ولا يقفز.", "t → ∞: " + m("i(∞) = 10/(2 + 3) = 2 A") + ".", m("R<sub>Th</sub> = 2 + 3 = 5 Ω") + "، " + m("τ = (1/3)/5 = 1/15 s") + ".", m("i(t) = 2 + (5 − 2)e<sup>−15t</sup> = 2 + 3e<sup>−15t</sup> A") + "."] }
    ],
    real: "عند تشغيل محرك كهربائي يتأخر وصول تياره إلى قيمته النهائية بسبب محاثة ملفاته، بنفس منحنى (1 − e^(−t/τ)).",
    quiz: [
      S.q("I₀ = 0، τ = 2 ms، Vs/R = 5 A. التيار بعد 2 ms:", [["3.16 A", true, "5(1 − e⁻¹)."], ["1.84 A", "formula", "هذا للتلاشي."], ["5 A", "conceptual", "بعد 5τ تقريبًا."]]),
      S.q("في الحالة المستقرة النهائية الملف:", [["قصر", true, "i∞ تحسب بالملف قصرًا."], ["مفتوح", "conceptual", "هذا المكثف."], ["مصدر تيار ثابت صفر", "conceptual", "يمر فيه i∞."]]),
      S.q("i₀ = 2، i∞ = 10، τ = 1 s. i(t) =", [["<span class='ltr'>10 − 8e<sup>−t</sup></span>", true, "i∞ + (i₀ − i∞)e^(−t/τ)."], ["<span class='ltr'>2 + 8e<sup>−t</sup></span>", "sign", "عند t → ∞ يجب أن يصل 10."], ["<span class='ltr'>10e<sup>−t</sup></span>", "formula", "هذا تلاشٍ."]])
    ],
    practice: {
      prompt: "دائرة RL: " + m("V<sub>s</sub> = 12 V") + "، " + m("R = 4 Ω") + "، " + m("L = 0.2 H") + "، وتيار ابتدائي " + m("I<sub>0</sub> = 1 A") + ".",
      steps: [
        S.step("s1", "i∞ =", "i∞ =", 3, { units: A, ud: 1, hints: ["Vs/R."], sol: "3 A." }),
        S.step("s2", "τ =", "τ =", 0.05, { units: SEC, ud: 0, hints: ["L/R."], sol: "50 ms." }),
        S.step("s3", "جهد الملف عند t = 0⁺.", "vL =", 12 - 1 * 4, { units: V, ud: 1, hints: ["Vs − I₀R."], sol: "8 V.", diag: [{ value: 12, type: "conceptual", why: "يوجد تيار ابتدائي: Vs − I₀R." }] })
      ]
    }
  });

  S.lesson({
    id: "c2-first-order-4", course: C, chapter: CH3, ar: "الاستجابة الدرجية لدائرة RC والحل العام", en: "The Step Response of an RC Circuit and the General Solution", min: 40,
    obj: ["تحل دائرة RC مع مصدر DC بمكافئ ثيفنن أو نورتن.", "تطبق v = v∞ + (v₀ − v∞)e^(−t/τ) لأي دائرة رتبة أولى.", "تجد الزمن اللازم للوصول إلى قيمة معينة."],
    idea: [
      "أي دائرة رتبة أولى = ملف أو مكثف موصول بمكافئ ثيفنن أو نورتن. للمكثف مع مصدر تيار " + m("I<sub>s</sub>") + " على التوازي مع R: " + m("C dv/dt + v/R = I<sub>s</sub>") + " وحلها " + m("v<sub>C</sub> = I<sub>s</sub>R + (V<sub>0</sub> − I<sub>s</sub>R)e<sup>−t/RC</sup>") + "، وبدلالة " + m("V<sub>s</sub> = I<sub>s</sub>R") + ": " + m("v<sub>C</sub> = V<sub>s</sub> + (V<sub>0</sub> − V<sub>s</sub>)e<sup>−t/τ</sup>") + ".",
      "و " + m("i<sub>C</sub> = C dv/dt = (V<sub>s</sub>/R − V<sub>0</sub>/R)e<sup>−t/τ</sup>") + "؛ وإذا V<sub>0</sub> = 0: " + m("v<sub>C</sub> = V<sub>s</sub>(1 − e<sup>−t/τ</sup>)") + ". إذن <b>الحل العام</b> لأي متغير x: " + m("x(t) = x<sub>∞</sub> + (x<sub>0</sub> − x<sub>∞</sub>)e<sup>−t/τ</sup>") + ": القيمة النهائية + (الابتدائية − النهائية) × الأسية."
    ],
    laws: ["v<sub>C</sub>(t) = v<sub>∞</sub> + (v<sub>0</sub> − v<sub>∞</sub>) e<sup>−t/τ</sup>", "τ = R<sub>Th</sub> C", "i<sub>C</sub> = C dv<sub>C</sub>/dt = ((v<sub>∞</sub> − v<sub>0</sub>)/R<sub>Th</sub>) e<sup>−t/τ</sup>", "t = τ ln[(x<sub>0</sub> − x<sub>∞</sub>)/(x(t) − x<sub>∞</sub>)]"],
    when: ["v₀ قبل التبديل (المكثف مفتوح)، و v∞ بعده (المكثف مفتوح)، و R<sub>Th</sub> من طرفي المكثف بعد التبديل.", "أوجد جهد المكثف أولًا دائمًا، ثم استنتج التيار وباقي الكميات."],
    ex: [
      { q: "مثال 7.6 (Nilsson): المفتاح في 1 طويلًا (40 V، 20 kΩ و 60 kΩ)، ثم ينتقل إلى 2 (−75 V عبر 40 kΩ و 160 kΩ، و 8 kΩ). C = 0.25 µF. أوجد v<sub>o</sub> و i<sub>o</sub>.",
        s: [m("v<sub>0</sub> = 40 × 60/80 = 30 V") + ".", "مكافئ ثيفنن بعد التبديل: " + m("V<sub>oc</sub> = (160/200)(−75) = −60 V") + "، و " + m("R<sub>Th</sub> = 8 + 40 ∥ 160 = 40 kΩ") + ".", m("τ = 40k × 0.25µ = 10 ms") + " ⇐ " + m("v<sub>o</sub> = −60 + 90e<sup>−100t</sup> V") + ".", m("i<sub>o</sub> = C dv/dt = 0.25µ × (−9000)e<sup>−100t</sup> = −2.25e<sup>−100t</sup> mA") + "."],
        after: { x: [-0.005, 0.05], y: [-65, 35], xl: "t (s)", yl: "vo(t) V", items: [{ ct: function (t) { return t < 0 ? 30 : -60 + 90 * ex(-100 * t); } }, { hline: -60, c: 4 }] } },
      { q: "مثال 7.7 (Nilsson): المفتاح في a (40 V، 20 Ω و 60 Ω) ثم ينتقل إلى b (90 V عبر 400 kΩ)، C = 0.5 µF. أوجد v<sub>C</sub> و i، ومتى يصير v<sub>C</sub> = 0.",
        s: [m("v<sub>0</sub> = −40 × 60/80 = −30 V") + " (القطبية معكوسة في الشكل)، و " + m("v<sub>∞</sub> = 90 V") + ".", m("τ = 400k × 0.5µ = 0.2 s") + " ⇐ " + m("v<sub>C</sub> = 90 − 120e<sup>−5t</sup> V") + ".", m("i = C dv/dt = 300e<sup>−5t</sup> µA") + ".", m("0 = 90 − 120e<sup>−5t</sup>") + " ⇐ " + m("t = (1/5)ln(4/3) = 57.54 ms") + "."],
        after: { x: [-0.1, 1.2], y: [-35, 95], xl: "t (s)", yl: "vC(t) V", items: [{ ct: function (t) { return t < 0 ? -30 : 90 - 120 * ex(-5 * t); } }, { hline: 0, c: 3 }, { vline: 0.05754, c: 3, label: "57.54 ms" }] } },
      { q: "مثال 7.8 (Nilsson): مصدر 7.5 mA و 20 kΩ و 30 kΩ ومكثف 0.1 µF بلا شحنة؛ يُغلق المفتاح عند t = 0. أوجد i(t) و v(t).",
        s: ["المكثف بلا شحنة فهو لحظيًا قصر: " + m("i(0<sup>+</sup>) = 7.5 × 20/50 = 3 mA") + "، و " + m("i(∞) = 0") + ".", m("τ = (20 + 30)k × 0.1µ = 5 ms") + " ⇐ " + m("i = 3e<sup>−200t</sup> mA") + ".", "جهد المكثف: " + m("v<sub>C</sub> = 150(1 − e<sup>−200t</sup>) V") + " (قيمته النهائية 7.5 mA × 20 kΩ).", m("v = v<sub>C</sub> + 30k·i = 150 − 60e<sup>−200t</sup> V") + "."] }
    ],
    real: "مؤقت 555 في الدوائر الإلكترونية يعتمد على شحن مكثف عبر مقاومة: الزمن حتى يصل الجهد عتبة معينة يحسب بـ t = τ ln(…).",
    quiz: [
      S.q("v₀ = 0، v∞ = 10 V، بعد τ واحد:", [["6.32 V", true, "10(1 − e⁻¹)."], ["3.68 V", "formula", "هذا الباقي."], ["10 V", "conceptual", "بعد 5τ."]]),
      S.q("لإيجاد τ في دائرة RC معقدة نستخدم:", [["R<sub>Th</sub> من طرفي المكثف", true, "τ = R_Th C."], ["مجموع كل المقاومات", "conceptual", "فقط المرئية من المكثف."], ["أصغر مقاومة", "conceptual", "لا."]]),
      S.q("تيار المكثف في الحالة المستقرة DC:", [["صفر", true, "مفتوح."], ["أقصى", "conceptual", "الأقصى عند 0⁺."], ["V/R", "conceptual", "هذا عند 0⁺ إذا v₀ = 0."]])
    ],
    practice: {
      prompt: "مكثف " + m("C = 10 µF") + " جهده الابتدائي " + m("−5 V") + "، يُشحن عبر " + m("R<sub>Th</sub> = 2 kΩ") + " نحو " + m("V<sub>Th</sub> = 15 V") + ".",
      steps: [
        S.step("s1", "τ =", "τ =", 0.02, { units: SEC, ud: 0, hints: ["RC."], sol: "20 ms." }),
        S.step("s2", "التيار عند t = 0⁺.", "i =", 20 / 2000, { units: A, ud: 0, hints: ["(15 − (−5))/2k."], sol: "10 mA.", diag: [{ value: 0.005, type: "sign", why: "الفرق 15 − (−5) = 20 V." }] }),
        S.step("s3", "الزمن حتى يصير الجهد صفرًا.", "t =", 0.02 * Math.log(20 / 15), { units: SEC, ud: 0, hints: ["0 = 15 − 20e^(−t/τ)."], sol: "τ ln(4/3) ≈ 5.75 ms." })
      ]
    }
  });

  /* ======================= Chapter 4: RLC circuits ======================= */
  var CH4 = "الفصل 4: الاستجابة الطبيعية والدرجية لدوائر RLC";
  S.lesson({
    id: "c2-rlc-1", course: C, chapter: CH4, ar: "المعادلة المميزة لدائرة RLC المتوازية", en: "Introduction to the Natural Response of a Parallel RLC Circuit", min: 35,
    obj: ["تشتق المعادلة التفاضلية من الرتبة الثانية لدائرة RLC متوازية.", "تحسب α و ω₀ والجذرين s₁ و s₂.", "تحدد نوع الاستجابة: فوق، تحت، أو حرج التخميد."],
    idea: [
      "KCL على العقدة العليا: " + m("v/R + (1/L)∫v dt + i<sub>L</sub>(0) + C dv/dt = 0") + "، وبالاشتقاق: " + m("d²v/dt² + (1/RC)dv/dt + v/(LC) = 0") + ". نجرب " + m("v = Ae<sup>st</sup>") + " فنحصل على <b>المعادلة المميزة</b> " + m("s² + s/(RC) + 1/(LC) = 0") + ".",
      "جذراها " + m("s<sub>1,2</sub> = −α ± √(α² − ω<sub>0</sub>²)") + " حيث " + m("α = 1/(2RC)") + " (معامل التخميد أو تردد نيبر) و " + m("ω<sub>0</sub> = 1/√(LC)") + " (تردد الرنين). والحل " + m("v = A<sub>1</sub>e<sup>s1t</sup> + A<sub>2</sub>e<sup>s2t</sup>") + "؛ s₁ و s₂ من R و L و C، و A₁ و A₂ من الشروط الابتدائية.",
      "ثلاث حالات: " + m("ω<sub>0</sub> < α") + " <b>فوق التخميد</b> (جذران حقيقيان مختلفان)، " + m("ω<sub>0</sub> > α") + " <b>تحت التخميد</b> (جذران مركّبان مترافقان)، " + m("ω<sub>0</sub> = α") + " <b>تخميد حرج</b> (جذر مكرر)."
    ],
    figs: [cir(2, 4, [E([0, 0], [1, 0], "C", 0.2e-6, { name: "C", vtext: "" }), W([0, 0], [0, 1]), E([0, 1], [1, 1], "L", 0.05, { name: "L", vtext: "" }), W([0, 1], [0, 2]), E([0, 2], [1, 2], "R", 200, { name: "R", vtext: "" }), W([1, 0], [1, 1]), W([1, 1], [1, 2])])],
    laws: ["d²v/dt² + (1/RC) dv/dt + v/(LC) = 0", "s² + s/(RC) + 1/(LC) = 0", "α = 1/(2RC),   ω<sub>0</sub> = 1/√(LC)", "s<sub>1,2</sub> = −α ± √(α² − ω<sub>0</sub>²)"],
    when: ["قارن α² بـ ω₀²: هذا يحدد شكل الحل كله.", "للتخميد الحرج: α = ω₀ ⇒ R = ½√(L/C)."],
    ex: [
      { q: "مثال 8.1 (Nilsson): R = 200 Ω، L = 50 mH، C = 0.2 µF. أوجد الجذرين ونوع الاستجابة، ثم كرر لـ R = 312.5 Ω، وأوجد R للتخميد الحرج.",
        s: [m("α = 10<sup>6</sup>/(2 × 200 × 0.2) = 1.25 × 10<sup>4</sup> rad/s") + "، و " + m("ω<sub>0</sub>² = 10<sup>8</sup> rad²/s²") + ".", m("s<sub>1</sub> = −12500 + 7500 = −5000") + "، " + m("s<sub>2</sub> = −20000 rad/s") + " ⇐ <b>فوق التخميد</b> (ω₀² < α²).", "R = 312.5 Ω: " + m("α = 8000") + "، " + m("α² = 0.64 × 10<sup>8</sup> < ω<sub>0</sub>²") + " ⇐ " + m("s<sub>1,2</sub> = −8000 ± j6000") + "، <b>تحت التخميد</b>.", "حرج: " + m("1/(2RC) = 10<sup>4</sup>") + " ⇐ " + m("R = 250 Ω") + "."] }
    ],
    real: "نظام تعليق السيارة يشبه RLC: المصمم يختاره قريبًا من التخميد الحرج حتى لا تتأرجح السيارة طويلًا ولا تكون قاسية.",
    quiz: [
      S.q("α = 500، ω₀ = 400:", [["فوق التخميد", true, "ω₀ < α."], ["تحت التخميد", "conceptual", "العكس."], ["حرج", "conceptual", "غير متساويين."]]),
      S.q("α في دائرة RLC متوازية:", [["<span class='ltr'>1/(2RC)</span>", true, "للمتوازية."], ["<span class='ltr'>R/(2L)</span>", "conceptual", "هذا للتوالي."], ["<span class='ltr'>1/√(LC)</span>", "formula", "هذا ω₀."]]),
      S.q("زيادة R في الدائرة المتوازية:", [["تقلل α فتقترب من تحت التخميد", true, "α = 1/2RC."], ["تزيد α", "sign", "R في المقام."], ["لا تؤثر", "conceptual", "تؤثر."]])
    ],
    practice: {
      prompt: "دائرة RLC متوازية: " + m("R = 1 kΩ") + "، " + m("L = 10 mH") + "، " + m("C = 1 µF") + ".",
      steps: [
        S.step("s1", "α =", "α =", 1 / (2 * 1000 * 1e-6), { units: RADS, hints: ["1/(2RC)."], sol: "500 rad/s." }),
        S.step("s2", "ω₀ =", "ω₀ =", 1 / Math.sqrt(0.01 * 1e-6), { units: RADS, hints: ["1/√(LC)."], sol: "10 000 rad/s." }),
        S.choice("s3", "نوع الاستجابة:", [{ t: "تحت التخميد", correct: true, why: "ω₀ > α." }, { t: "فوق التخميد", type: "conceptual", why: "ω₀ أكبر." }, { t: "حرج", type: "conceptual", why: "غير متساويين." }], { sol: "تحت التخميد." })
      ]
    }
  });

  var v82 = function (t) { return -14 * ex(-5000 * t) + 26 * ex(-20000 * t); };
  var v84 = function (t) { return 100 * ex(-200 * t) * Math.sin(979.8 * t); };
  var v85 = function (t) { return 98000 * t * ex(-1000 * t); };
  S.lesson({
    id: "c2-rlc-2", course: C, chapter: CH4, ar: "أشكال الاستجابة الطبيعية: فوق وتحت وحرج التخميد", en: "The Forms of the Natural Response of a Parallel RLC Circuit", min: 40,
    obj: ["تحسب الثوابت من v(0⁺) و dv(0⁺)/dt.", "تكتب الحل لكل حالة تخميد.", "تفسر ω_d و α في الاستجابة المتذبذبة."],
    idea: [
      "الشروط الابتدائية دائمًا: " + m("v(0<sup>+</sup>) = V<sub>0</sub>") + " (جهد المكثف)، و " + m("dv(0<sup>+</sup>)/dt = i<sub>C</sub>(0<sup>+</sup>)/C") + " حيث " + m("i<sub>C</sub>(0<sup>+</sup>) = −V<sub>0</sub>/R − I<sub>0</sub>") + " (KCL).",
      "<b>فوق التخميد</b>: " + m("v = A<sub>1</sub>e<sup>s1t</sup> + A<sub>2</sub>e<sup>s2t</sup>") + " مع " + m("V<sub>0</sub> = A<sub>1</sub> + A<sub>2</sub>") + " و " + m("dv/dt = s<sub>1</sub>A<sub>1</sub> + s<sub>2</sub>A<sub>2</sub>") + ". <b>تحت التخميد</b>: " + m("s = −α ± jω<sub>d</sub>") + "، " + m("ω<sub>d</sub> = √(ω<sub>0</sub>² − α²)") + " (التردد المخمَّد)، و " + m("v = B<sub>1</sub>e<sup>−αt</sup>cos ω<sub>d</sub>t + B<sub>2</sub>e<sup>−αt</sup>sin ω<sub>d</sub>t") + " مع " + m("B<sub>1</sub> = V<sub>0</sub>") + " و " + m("dv/dt = −αB<sub>1</sub> + ω<sub>d</sub>B<sub>2</sub>") + ".",
      "<b>الحرج</b>: " + m("v = D<sub>1</sub>te<sup>−αt</sup> + D<sub>2</sub>e<sup>−αt</sup>") + " مع " + m("D<sub>2</sub> = V<sub>0</sub>") + " و " + m("dv/dt = D<sub>1</sub> − αD<sub>2</sub>") + ". في تحت التخميد يتذبذب الجهد بتردد ω_d وتتناقص سعته بمعدل α؛ وإذا R → ∞ صار α = 0 فيستمر التذبذب."
    ],
    figs: [{ plot: { x: [0, 0.011], y: [-45, 100], xl: "t (s)", yl: "v(t) لأمثلة 8.4 (تحت) و 8.5 (حرج)", items: [{ ct: v84 }, { ct: v85, c: 2 }], xf: function (v) { return +(v * 1000).toFixed(1) + "ms"; } }, cap: "نفس L و C: R = 20 kΩ يعطي تذبذبًا مخمدًا (أزرق)، و R = 4 kΩ يعطي تخميدًا حرجًا (برتقالي)." }],
    laws: ["v(0<sup>+</sup>) = V<sub>0</sub>,   dv(0<sup>+</sup>)/dt = i<sub>C</sub>(0<sup>+</sup>)/C,   i<sub>C</sub>(0<sup>+</sup>) = −V<sub>0</sub>/R − I<sub>0</sub>", "فوق: v = A<sub>1</sub>e<sup>s1t</sup> + A<sub>2</sub>e<sup>s2t</sup>", "تحت: v = e<sup>−αt</sup>(B<sub>1</sub>cos ω<sub>d</sub>t + B<sub>2</sub>sin ω<sub>d</sub>t),  ω<sub>d</sub> = √(ω<sub>0</sub>² − α²)", "حرج: v = (D<sub>1</sub>t + D<sub>2</sub>)e<sup>−αt</sup>"],
    when: ["رتّب العمل: α و ω₀ ⇒ النوع ⇒ v(0⁺) و dv(0⁺)/dt ⇒ الثابتين ⇒ v(t)."],
    ex: [
      { q: "مثال 8.2: R = 200 Ω، L = 50 mH، C = 0.2 µF، " + m("V<sub>0</sub> = 12 V") + "، " + m("I<sub>0</sub> = 30 mA") + ". أوجد v(t).",
        s: [m("i<sub>R</sub>(0<sup>+</sup>) = 12/200 = 60 mA") + "، و " + m("i<sub>C</sub>(0<sup>+</sup>) = −60 − 30 = −90 mA") + ".", m("dv(0<sup>+</sup>)/dt = −0.09/0.2µ = −450 kV/s") + "، والجذران " + m("−5000") + " و " + m("−20000") + " (مثال 8.1).", m("12 = A<sub>1</sub> + A<sub>2</sub>") + " و " + m("−450000 = −5000A<sub>1</sub> − 20000A<sub>2</sub>") + " ⇐ " + m("A<sub>1</sub> = −14, A<sub>2</sub> = 26") + ".", m("v = −14e<sup>−5000t</sup> + 26e<sup>−20000t</sup> V") + "."],
        after: { x: [0, 0.001], y: [-3, 13], xl: "t", yl: "v(t) V", items: [{ ct: v82 }], xf: function (v) { return +(v * 1000).toFixed(2) + "ms"; } } },
      { q: "مثال 8.4: C = 0.125 µF، L = 8 H، R = 20 kΩ، " + m("V<sub>0</sub> = 0") + "، " + m("I<sub>0</sub> = −12.25 mA") + ". أوجد v(t).",
        s: [m("α = 10<sup>6</sup>/(2 × 20000 × 0.125) = 200 rad/s") + "، " + m("ω<sub>0</sub> = 1000 rad/s") + " ⇐ تحت التخميد.", m("ω<sub>d</sub> = √(10<sup>6</sup> − 4×10<sup>4</sup>) = 979.80 rad/s") + ".", m("B<sub>1</sub> = 0") + "، و " + m("i<sub>C</sub>(0<sup>+</sup>) = 12.25 mA") + " ⇐ " + m("dv/dt = 98 000 V/s = ω<sub>d</sub>B<sub>2</sub>") + " ⇐ " + m("B<sub>2</sub> = 100") + ".", m("v = 100e<sup>−200t</sup> sin(979.80t) V") + "."] },
      { q: "مثال 8.5: لنفس L و C، ما R للتخميد الحرج؟ وما v(t)؟",
        s: [m("α = ω<sub>0</sub> = 1000") + " ⇐ " + m("R = 1/(2αC) = 4000 Ω") + ".", m("D<sub>2</sub> = v(0) = 0") + "، و " + m("D<sub>1</sub> − αD<sub>2</sub> = 98000") + " ⇐ " + m("D<sub>1</sub> = 98000") + ".", m("v = 98000te<sup>−1000t</sup> V") + "."] }
    ],
    real: "دوائر الراديو القديمة تعتمد على الاستجابة تحت التخميد: دائرة LC صغيرة الفقد تتذبذب بترددها الطبيعي.",
    quiz: [
      S.q("ω₀ = 500، α = 300. ω_d =", [["400", true, "√(250000 − 90000)."], ["200", "formula", "ω₀ − α خطأ."], ["583", "sign", "نطرح المربعات."]]),
      S.q("في تحت التخميد B₁ يساوي:", [["V₀", true, "v(0⁺) = B₁."], ["I₀", "conceptual", "الجهد."], ["صفر دائمًا", "conceptual", "إلا إذا V₀ = 0."]]),
      S.q("V₀ = 10 V، R = 100 Ω، I₀ = 0.2 A. i<sub>C</sub>(0⁺) =", [["−0.3 A", true, "−0.1 − 0.2."], ["0.3 A", "sign", "i_C = −V₀/R − I₀."], ["−0.1 A", "formula", "نسيت I₀."]])
    ],
    practice: {
      prompt: "دائرة RLC متوازية: " + m("α = 400") + "، " + m("ω<sub>d</sub> = 300 rad/s") + "، " + m("V<sub>0</sub> = 5 V") + "، " + m("dv(0<sup>+</sup>)/dt = 1000 V/s") + ".",
      steps: [
        S.step("s1", "B₁ =", "B1 =", 5, { hints: ["= V₀."], sol: "5." }),
        S.step("s2", "B₂ =", "B2 =", (1000 + 400 * 5) / 300, { hints: ["1000 = −400(5) + 300B₂."], sol: "3000/300 = 10.", diag: [{ value: (1000 - 2000) / 300, type: "sign", why: "dv/dt = −αB₁ + ω_dB₂ ⇒ B₂ = (1000 + 2000)/300." }] }),
        S.step("s3", "ω₀ =", "ω₀ =", 500, { units: RADS, hints: ["√(α² + ω_d²)."], sol: "500 rad/s." })
      ]
    }
  });

  var i86 = function (t) { return 24 - 32 * ex(-20000 * t) + 8 * ex(-80000 * t); };
  var i87 = function (t) { return 24 - 24 * ex(-32000 * t) * Math.cos(24000 * t) - 32 * ex(-32000 * t) * Math.sin(24000 * t); };
  var i88 = function (t) { return 24 - 960000 * t * ex(-40000 * t) - 24 * ex(-40000 * t); };
  S.lesson({
    id: "c2-rlc-3", course: C, chapter: CH4, ar: "الاستجابة الدرجية لدائرة RLC المتوازية", en: "The Step Response of a Parallel RLC Circuit", min: 45,
    obj: ["تشتق معادلة تيار الملف عند تطبيق مصدر تيار DC.", "تكتب الحل = قيمة نهائية + شكل الاستجابة الطبيعية.", "تحسب الثوابت من i_L(0) و di_L(0)/dt بما فيها الطاقة الابتدائية."],
    idea: [
      "عند تطبيق مصدر تيار DC فجأة نهتم بتيار الملف لأنه لا يتلاشى بل يصل إلى I. KCL: " + m("C dv/dt + v/R + i<sub>L</sub> = I") + " ومع " + m("v = L di<sub>L</sub>/dt") + ": " + m("d²i<sub>L</sub>/dt² + (1/RC)di<sub>L</sub>/dt + i<sub>L</sub>/(LC) = I/(LC)") + ".",
      "الحل = <b>حالة مستقرة</b> " + m("I<sub>f</sub>") + " + <b>عابر</b> بنفس شكل الاستجابة الطبيعية: فوق " + m("I<sub>f</sub> + A'<sub>1</sub>e<sup>s1t</sup> + A'<sub>2</sub>e<sup>s2t</sup>") + "، تحت " + m("I<sub>f</sub> + B'<sub>1</sub>e<sup>−αt</sup>cos ω<sub>d</sub>t + B'<sub>2</sub>e<sup>−αt</sup>sin ω<sub>d</sub>t") + "، حرج " + m("I<sub>f</sub> + D'<sub>1</sub>te<sup>−αt</sup> + D'<sub>2</sub>e<sup>−αt</sup>") + ".",
      "الشروط الابتدائية: " + m("i<sub>L</sub>(0)") + " (لا يقفز) و " + m("di<sub>L</sub>(0)/dt = v(0)/L") + " (جهد المكثف لا يقفز). بلا طاقة ابتدائية كلاهما صفر."
    ],
    figs: [{ plot: { x: [0, 0.0002], y: [-1, 30], xl: "t", yl: "iL (mA)", items: [{ ct: i86 }, { ct: i87, c: 2 }, { ct: i88, c: 3 }, { hline: 24, c: 4 }], xf: function (v) { return Math.round(v * 1e6) + "µs"; } }, cap: "أمثلة 8.6 (فوق، أزرق)، 8.7 (تحت، برتقالي)، 8.8 (حرج، أخضر): كلها تصل إلى 24 mA." }],
    laws: ["d²i<sub>L</sub>/dt² + (1/RC) di<sub>L</sub>/dt + i<sub>L</sub>/(LC) = I/(LC)", "i<sub>L</sub>(t) = I<sub>f</sub> + (شكل الاستجابة الطبيعية)", "i<sub>L</sub>(0<sup>+</sup>) = I<sub>0</sub>,   di<sub>L</sub>(0<sup>+</sup>)/dt = V<sub>0</sub>/L"],
    when: ["I<sub>f</sub> = تيار المصدر (في النهاية الملف قصر يأخذ كل التيار).", "الثوابت من: i(0) = I_f + (مجموع المعاملات) و di/dt(0)."],
    ex: [
      { q: "مثال 8.6: I = 24 mA، C = 25 nF، L = 25 mH، R = 400 Ω، بلا طاقة ابتدائية. أوجد i<sub>L</sub>(t).",
        s: [m("ω<sub>0</sub>² = 10<sup>12</sup>/(25 × 25) = 16 × 10<sup>8</sup>") + "، و " + m("α = 10<sup>9</sup>/(2 × 400 × 25) = 5 × 10<sup>4</sup> rad/s") + " ⇐ فوق التخميد.", m("s<sub>1</sub> = −20 000") + "، " + m("s<sub>2</sub> = −80 000 rad/s") + ".", m("i<sub>L</sub>(0) = 24 + A'<sub>1</sub> + A'<sub>2</sub> = 0") + " و " + m("di/dt(0) = s<sub>1</sub>A'<sub>1</sub> + s<sub>2</sub>A'<sub>2</sub> = 0") + " ⇐ " + m("A'<sub>1</sub> = −32, A'<sub>2</sub> = 8 mA") + ".", m("i<sub>L</sub> = 24 − 32e<sup>−20000t</sup> + 8e<sup>−80000t</sup> mA") + "."] },
      { q: "مثال 8.7: نفس الدائرة مع R = 625 Ω. أوجد i<sub>L</sub>(t).",
        s: [m("α = 3.2 × 10<sup>4</sup>") + "، " + m("ω<sub>d</sub> = 2.4 × 10<sup>4</sup> rad/s") + " ⇐ تحت التخميد.", m("i<sub>L</sub>(0) = 24 + B'<sub>1</sub> = 0") + " ⇐ " + m("B'<sub>1</sub> = −24 mA") + ".", m("di/dt(0) = ω<sub>d</sub>B'<sub>2</sub> − αB'<sub>1</sub> = 0") + " ⇐ " + m("B'<sub>2</sub> = −32 mA") + ".", m("i<sub>L</sub> = 24 − 24e<sup>−32000t</sup>cos 24000t − 32e<sup>−32000t</sup>sin 24000t mA") + "."] },
      { q: "مثال 8.10: R = 500 Ω (تخميد حرج α = 40 000)، وطاقة ابتدائية: " + m("i<sub>L</sub>(0) = 29 mA") + " و " + m("v(0) = 50 V") + ". أوجد i<sub>L</sub>(t) و v(t).",
        s: [m("i<sub>L</sub>(0) = I<sub>f</sub> + D'<sub>2</sub> = 29") + " ⇐ " + m("D'<sub>2</sub> = 5 mA") + ".", m("di/dt(0) = v(0)/L = 50/0.025 = 2000 A/s = D'<sub>1</sub> − αD'<sub>2</sub>") + " ⇐ " + m("D'<sub>1</sub> = 2000 + 200 = 2200 A/s") + ".", m("i<sub>L</sub> = 24 + 2.2×10<sup>6</sup>te<sup>−40000t</sup> + 5e<sup>−40000t</sup> mA") + ".", m("v = L di/dt = −2.2×10<sup>6</sup>te<sup>−40000t</sup> + 50e<sup>−40000t</sup> V") + "، وتحقق: v(0) = 50 V."] },
      { q: "تمرين 8.5 (Nilsson): " + m("v = 40e<sup>−1000t</sup> − 90e<sup>−4000t</sup> V") + " لدائرة RLC متوازية و L = 10 mH. أوجد ω₀ و α و C و R والتيارات.",
        s: ["الجذران −1000 و −4000 ⇐ " + m("2α = 5000, α = 2500") + " و " + m("ω<sub>0</sub>² = 1000 × 4000") + " ⇐ " + m("ω<sub>0</sub> = 2000 rad/s") + ".", m("C = 1/(Lω<sub>0</sub>²) = 25 µF") + " و " + m("R = 1/(2αC) = 8 Ω") + ".", m("i<sub>R</sub> = v/R = 5e<sup>−1000t</sup> − 11.25e<sup>−4000t</sup> A") + "، و " + m("i<sub>C</sub> = C dv/dt = −e<sup>−1000t</sup> + 9e<sup>−4000t</sup> A") + ".", m("i<sub>L</sub> = −(i<sub>R</sub> + i<sub>C</sub>) = −4e<sup>−1000t</sup> + 2.25e<sup>−4000t</sup> A") + "."] }
    ],
    real: "عند تشغيل مزود طاقة فيه ملف ومكثف (مرشح LC) قد يتجاوز الجهد قيمته النهائية لحظيًا إذا كانت الدائرة تحت التخميد؛ لذلك تُختار القيم لتجنب ذلك.",
    quiz: [
      S.q("القيمة النهائية لتيار الملف عند تطبيق مصدر تيار I:", [["I", true, "الملف قصر في النهاية."], ["صفر", "conceptual", "المكثف هو الذي يصير مفتوحًا."], ["I/2", "conceptual", "كل التيار للملف."]]),
      S.q("بلا طاقة ابتدائية، di<sub>L</sub>(0⁺)/dt =", [["0", true, "v(0) = 0."], ["I/L", "formula", "di/dt = v/L."], ["I/C", "formula", "لا."]]),
      S.q("v(0) = 25 V و L = 5 mH. di<sub>L</sub>(0⁺)/dt =", [["5000 A/s", true, "25/0.005."], ["125 A/s", "formula", "نقسم على L."], ["0", "conceptual", "يوجد جهد ابتدائي."]])
    ],
    practice: {
      prompt: "مصدر " + m("I = 2 A") + " يُطبق على RLC متوازية: " + m("R = 12.5 Ω") + "، " + m("L = 25 mH") + "، " + m("C = 62.5 µF") + "، وتيار الملف الابتدائي 1 A وجهد المكثف 50 V (تمرين 8.27).",
      steps: [
        S.step("s1", "α =", "α =", 1 / (2 * 12.5 * 62.5e-6), { units: RADS, hints: ["1/(2RC)."], sol: "640 rad/s." }),
        S.step("s2", "ω₀ =", "ω₀ =", 1 / Math.sqrt(0.025 * 62.5e-6), { units: RADS, hints: ["1/√(LC)."], sol: "800 rad/s ⇒ تحت التخميد." }),
        S.step("s3", "di<sub>L</sub>(0⁺)/dt بالـ A/s.", "=", 50 / 0.025, { units: U([["A/s", 1]]), hints: ["v(0)/L."], sol: "2000 A/s." })
      ]
    }
  });
})();
