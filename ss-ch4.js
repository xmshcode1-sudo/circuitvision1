/* Signals and Systems — Chapter 4: Fourier Transform (lectures 07, 08, 09). */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss, P = CV.sp, PI = Math.PI;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var CH = "الفصل 4: تحويل فورييه";

  /* ================= 1. CTFT ================= */
  S.lesson({
    id: "ss-ch4-1", chapter: CH, ar: "تحويل فورييه المستمر", en: "The Continuous-Time Fourier Transform", min: 40,
    obj: ["تشتق تحويل فورييه من المتسلسلة عندما T0 → ∞.", "تحسب تحويل δ(t) و e^(−at)u(t) و e^(−a|t|) والنبضة المستطيلة.", "ترسم طيف السعة والطور وتفهم الثنائية."],
    idea: [
      "لإشارة غير دورية x(t): نكوّن منها إشارة دورية تكون x دورة واحدة منها، ونكتب متسلسلتها. معاملاتها " + m("a<sub>k</sub> = (1/T<sub>0</sub>)X(jkω<sub>0</sub>)") + " حيث " + m("X(jω) = ∫x(t)e<sup>−jωt</sup>dt") + " «غلاف» المعاملات. وكلما كبر T0 تقاربت الخطوط، وعندما " + m("T<sub>0</sub> → ∞") + " يصير المجموع تكاملًا: هذا <b>تحويل فورييه</b> أو <b>الطيف</b>.",
      "المتسلسلة تعطي محتوى الإشارة عند ترددات منفصلة kω0، والتحويل يعطيه عند <b>كل</b> الترددات؛ والمتسلسلة هي عيّنات من الطيف عند kω0. وشروط وجوده نفس شروط ديريشليه.",
      "X(jω) مركّب عادةً: " + m("X = |X|e<sup>jθ(ω)</sup>") + "، فنرسم <b>طيف السعة</b> |X| و<b>طيف الطور</b> θ. ومثال النبضة المستطيلة وعكسه (مرشح مثالي) يوضحان <b>الثنائية</b>: شكل sinc يظهر في الزمن أو في التردد."
    ],
    figs: [
      { plot: { x: [-8, 8], y: [-0.1, 1.15], xl: "ω", yl: "|X(jω)| = 1/√(a² + ω²)  (a = 1)", items: [{ ct: function (w) { return 1 / Math.sqrt(1 + w * w); } }, { vline: 1, c: 3, label: "ω = a" }] }, cap: "طيف سعة e^(−at)u(t): قيمته 1/a عند الصفر، و 1/(a√2) عند ω = a." },
      { plot: { x: [-8, 8], y: [-1.8, 1.8], xl: "ω", yl: "θ(ω) = −tan⁻¹(ω/a)", items: [{ ct: function (w) { return -Math.atan(w); }, c: 2 }, { hline: PI / 2, c: 4 }, { hline: -PI / 2, c: 4 }] }, cap: "طيف الطور: من +π/2 إلى −π/2، و ∓π/4 عند ω = ±a." }
    ],
    laws: [{ eq: "X(jω) = ∫<sub>−∞</sub><sup>∞</sup> x(t) e<sup>−jωt</sup> dt", n: "التحويل" }, { eq: "x(t) = (1/2π) ∫<sub>−∞</sub><sup>∞</sup> X(jω) e<sup>jωt</sup> dω", n: "العكسي" }, { eq: "δ(t) ↔ 1      e<sup>−at</sup>u(t) ↔ 1/(a + jω), a > 0      e<sup>−a|t|</sup> ↔ 2a/(a² + ω²)" }, { eq: "نبضة |t| < T<sub>1</sub> ↔ 2 sin(ωT<sub>1</sub>)/ω = 2T<sub>1</sub> sinc(ωT<sub>1</sub>/π)" }, { eq: "X = 1 على |ω| < B ↔ sin(Bt)/(πt) = (B/π) sinc(Bt/π)" }, { eq: "sinc(x) = sin(πx)/(πx)" }],
    when: ["للإشارات الأسّية: التكامل مباشر وينتهي بـ 1/(a + jω).", "e<sup>−at</sup>u(t) مع a < 0 لا تحويل لها: التكامل لا يتقارب.", "الإشارة الحقيقية الزوجية (مثل e<sup>−a|t|</sup>) تحويلها حقيقي."],
    ex: [
      { q: "أوجد تحويل " + m("x(t) = e<sup>−at</sup>u(t)") + " وطيفي سعته وطوره.",
        s: [m("X = ∫<sub>0</sub><sup>∞</sup> e<sup>−at</sup>e<sup>−jωt</sup>dt = 1/(a + jω)") + "، a > 0.", m("|X| = 1/√(a² + ω²)") + ".", m("θ(ω) = −tan<sup>−1</sup>(ω/a)") + ": صفر عند ω = 0، و ∓π/4 عند ±a، و ∓π/2 عند ±∞."] },
      { q: "أوجد تحويل " + m("x(t) = e<sup>−a|t|</sup>") + ".",
        s: [m("X = ∫<sub>−∞</sub><sup>0</sup> e<sup>at</sup>e<sup>−jωt</sup>dt + ∫<sub>0</sub><sup>∞</sup> e<sup>−at</sup>e<sup>−jωt</sup>dt") + ".", m("= 1/(a − jω) + 1/(a + jω) = 2a/(a² + ω²)") + "، حقيقي."] },
      { q: "أوجد تحويل النبضة " + m("x(t) = 1") + " عند " + m("|t| < T<sub>1</sub>") + ".",
        s: [m("X = ∫<sub>−T1</sub><sup>T1</sup> e<sup>−jωt</sup>dt = 2 sin(ωT<sub>1</sub>)/ω") + ".", m("= 2T<sub>1</sub> sinc(ωT<sub>1</sub>/π)") + "، قمته 2T1 عند الصفر، وأصفاره عند " + m("ω = kπ/T<sub>1</sub>") + "."],
        after: { x: [-12, 12], y: [-0.5, 2.3], xl: "ω", yl: "X(jω), T1 = 1", items: [{ ct: function (w) { return w === 0 ? 2 : 2 * Math.sin(w) / w; }, c: 2 }] } },
      { q: "أوجد x(t) التي تحويلها " + m("X = 1") + " عند " + m("|ω| < B") + " وصفر غير ذلك.",
        s: [m("x = (1/2π)∫<sub>−B</sub><sup>B</sup> e<sup>jωt</sup>dω = sin(Bt)/(πt)") + ".", m("= (B/π)sinc(Bt/π)") + "، وقمتها B/π. هذا والمثال السابق يوضحان الثنائية."] }
    ],
    real: "محلل الطيف (spectrum analyzer) في المختبر يعرض |X(jω)| لإشارة: نرى مثلًا أن نبضة رقمية أقصر تحتاج عرض نطاق أكبر.",
    quiz: [
      S.q("<span class='ltr'>FT{δ(t)}</span> =", [["1", true, "كل الترددات بنفس المقدار."], ["<span class='ltr'>δ(ω)</span>", "conceptual", "هذا (بعامل 2π) تحويل الثابت."], ["0", "conceptual", "الدفعة تحوي كل الترددات."]]),
      S.q("تحويل <span class='ltr'>e<sup>−3t</sup>u(t)</span>:", [["<span class='ltr'>1/(3 + jω)</span>", true, "a = 3."], ["<span class='ltr'>1/(3 − jω)</span>", "sign", "e<sup>−jωt</sup> مع e<sup>−3t</sup> يعطي (3 + jω)."], ["<span class='ltr'>6/(9 + ω²)</span>", "formula", "هذا لـ e<sup>−3|t|</sup>."]]),
      S.q("نبضة عرضها أكبر (T1 أكبر). طيفها:", [["أضيق (أصفاره أقرب للصفر)", true, "الأصفار عند kπ/T1."], ["أعرض", "conceptual", "التمدد في الزمن انضغاط في التردد."], ["لا يتغيّر", "conceptual", "يتغيّر عكسيًا."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x(t) = e<sup>−2t</sup>u(t)") + ".",
      steps: [
        S.step("s1", m("|X(j0)|") + " =", "|X(0)| =", 0.5, { hints: ["1/√(a² + ω²) عند ω = 0."], sol: "1/2 = 0.5." }),
        S.step("s2", m("|X(j2)|") + " =", "|X(j2)| =", 1 / Math.sqrt(8), { hints: ["1/√(4 + 4)."], sol: "1/√8 ≈ 0.354.", diag: [{ value: 0.25, type: "formula", why: "السعة 1/√(a²+ω²) وليست 1/(a+ω)." }] }),
        S.step("s3", "الطور عند ω = 2 بالراديان.", "θ =", -PI / 4, { units: S.RAD, hints: ["−tan<sup>−1</sup>(ω/a)."], sol: "−tan<sup>−1</sup>(1) = −π/4 ≈ −0.785.", diag: [{ value: PI / 4, type: "sign", why: "الطور سالب: −tan<sup>−1</sup>(ω/a)." }] })
      ]
    }
  });

  /* ================= 2. FT of periodic signals ================= */
  S.lesson({
    id: "ss-ch4-2", chapter: CH, ar: "تحويل فورييه للإشارات الدورية", en: "Fourier Transform of Periodic Signals", min: 25,
    obj: ["تحسب تحويل e^(jω0t) والثابت و cos ω0t.", "تكتب تحويل أي إشارة دورية من معاملات متسلسلتها.", "تحسب تحويل قطار الدفعات."],
    idea: [
      "من عكس " + m("2πδ(ω − ω<sub>0</sub>)") + " نحصل على " + m("e<sup>jω0t</sup> ↔ 2πδ(ω − ω<sub>0</sub>)") + "، وبوضع ω0 = 0: الثابت " + m("1 ↔ 2πδ(ω)") + ".",
      "وبما أن الإشارة الدورية مجموع أسّيات " + m("x = Σa<sub>k</sub>e<sup>jkω0t</sup>") + " فتحويلها خطوط (دفعات) عند التوافقيات: " + m("X(jω) = Σ2πa<sub>k</sub>δ(ω − kω<sub>0</sub>)") + ". مثلًا " + m("cos ω<sub>0</sub>t ↔ π[δ(ω − ω<sub>0</sub>) + δ(ω + ω<sub>0</sub>)]") + ".",
      "قطار الدفعات " + m("Σδ(t − kT<sub>0</sub>)") + " معاملاته كلها " + m("1/T<sub>0</sub>") + "، فتحويله قطار دفعات أيضًا " + m("(2π/T<sub>0</sub>)Σδ(ω − 2πk/T<sub>0</sub>)") + ". وكلما تباعدت الدفعات في الزمن تقاربت في التردد."
    ],
    figs: [{ plot: { x: [-6, 6], y: [-0.2, 3.8], xl: "ω", yl: "FT{cos ω0 t}", ytl: false, items: [{ imp: [[-3, 3.14, "π"], [3, 3.14, "π"]], c: 2 }, { text: [-3, -0.15, ""] }] }, cap: "cos ω0t: دفعتان مساحة كل منهما π عند ±ω0." }],
    laws: [{ eq: "e<sup>jω0t</sup> ↔ 2πδ(ω − ω<sub>0</sub>)      1 ↔ 2πδ(ω)" }, { eq: "x دورية ↔ Σ<sub>k</sub> 2πa<sub>k</sub> δ(ω − kω<sub>0</sub>)" }, { eq: "cos ω<sub>0</sub>t ↔ π[δ(ω − ω<sub>0</sub>) + δ(ω + ω<sub>0</sub>)]" }, { eq: "Σ<sub>k</sub> δ(t − kT<sub>0</sub>) ↔ (2π/T<sub>0</sub>) Σ<sub>k</sub> δ(ω − 2πk/T<sub>0</sub>)" }],
    when: ["لإشارة دورية: أوجد a_k أولًا ثم اضرب كل واحد في 2π وضعه دفعة عند kω0.", "قطار الدفعات أساس نظرية أخذ العيّنات (الفصل 7)."],
    ex: [
      { q: "أوجد تحويل " + m("x(t) = cos ω<sub>0</sub>t") + ".",
        s: [m("cos ω<sub>0</sub>t = ½(e<sup>jω0t</sup> + e<sup>−jω0t</sup>)") + ".", m("X = ½[2πδ(ω − ω<sub>0</sub>) + 2πδ(ω + ω<sub>0</sub>)] = π[δ(ω − ω<sub>0</sub>) + δ(ω + ω<sub>0</sub>)]") + ". الطور صفر."] },
      { q: "أوجد تحويل قطار الدفعات " + m("x(t) = Σδ(t − kT<sub>0</sub>)") + ".",
        s: [m("a<sub>k</sub> = (1/T<sub>0</sub>)∫<sub>−T0/2</sub><sup>T0/2</sup> δ(t)e<sup>−jkω0t</sup>dt = 1/T<sub>0</sub>") + ".", m("X = Σ2πa<sub>k</sub>δ(ω − kω<sub>0</sub>) = (2π/T<sub>0</sub>)Σδ(ω − 2πk/T<sub>0</sub>)") + "."],
        after: { x: [-4.5, 4.5], y: [-0.2, 1.4], xl: "ω (بوحدات 2π/T0)", yl: "X(jω)", ytl: false, items: [{ imp: [[-4, 1], [-3, 1], [-2, 1], [-1, 1], [0, 1, "2π/T0"], [1, 1], [2, 1], [3, 1], [4, 1]], c: 2 }] } }
    ],
    real: "إشارة الساعة (clock) في المعالج دورية؛ طيفها خطوط عند التردد الأساسي ومضاعفاته، ولهذا قد تسبب تداخلًا لاسلكيًا عند تلك الترددات بالذات.",
    quiz: [
      S.q("تحويل الثابت <span class='ltr'>x(t) = 5</span>:", [["<span class='ltr'>10πδ(ω)</span>", true, "5 × 2πδ(ω)."], ["<span class='ltr'>5δ(ω)</span>", "formula", "نسيت 2π."], ["5", "conceptual", "هذا تحويل 5δ(t)."]]),
      S.q("تحويل الإشارة الدورية يتكون من:", [["دفعات عند kω0", true, "Σ2πa<sub>k</sub>δ(ω − kω<sub>0</sub>)."], ["منحنى متصل", "conceptual", "هذا لغير الدورية."], ["صفر", "conceptual", "له طيف خطي."]]),
      S.q("قطار دفعات بزمن T0 = 2 ms. المسافة بين دفعات طيفه:", [["<span class='ltr'>1000π rad/s</span>", true, "2π/T0."], ["<span class='ltr'>2 ms</span>", "unit", "المسافة في التردد بالـ rad/s."], ["<span class='ltr'>500 rad/s</span>", "formula", "2π/T0 وليس 1/T0."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x(t) = 4cos(10t)") + ".",
      steps: [
        S.step("s1", "مساحة الدفعة عند ω = 10.", "=", 4 * PI, { hints: ["4 × π."], sol: "4π ≈ 12.57.", diag: [{ value: 2 * PI, type: "formula", why: "كل دفعة لـ cos مساحتها π مضروبة في السعة." }] }),
        S.step("s2", "عند أي تردد سالب توجد الدفعة الأخرى؟", "ω =", -10, { units: S.RADS, hints: ["±ω0."], sol: "ω = −10 rad/s." }),
        S.step("s3", "معامل المتسلسلة " + m("a<sub>1</sub>") + " (ω0 = 10).", "a1 =", 2, { hints: ["المساحة = 2πa_k."], sol: "4π/(2π) = 2." })
      ]
    }
  });

  /* ================= 3. DTFT ================= */
  S.lesson({
    id: "ss-ch4-3", chapter: CH, ar: "تحويل فورييه المتقطع (DTFT)", en: "The Discrete-Time Fourier Transform", min: 35,
    obj: ["تكتب معادلتي DTFT وتعرف أنه دوري بزمن 2π.", "تحسب تحويل a^n u[n] و a^|n| والمرشح المثالي.", "تحسب تحويل الإشارات المتقطعة الدورية."],
    idea: [
      "بنفس فكرة المستمر: نكرر x[n] دوريًا ونكتب DTFS، ثم نجعل N → ∞ فيصير المجموع تكاملًا على 2π: " + m("X(e<sup>jω</sup>) = Σx[n]e<sup>−jωn</sup>") + " و " + m("x[n] = (1/2π)∫<sub>2π</sub>X(e<sup>jω</sup>)e<sup>jωn</sup>dω") + ".",
      "الفرق المهم: " + m("X(e<sup>jω</sup>)") + " <b>دوري في ω بزمن 2π</b> دائمًا. و " + m("Na<sub>k</sub>") + " عيّنات منه في دورة. ويتقارب إذا كانت x قابلة للجمع المطلق " + m("Σ|x[n]| < ∞") + " أو طاقتها محدودة " + m("Σ|x[n]|² < ∞") + ".",
      "للدورية: " + m("e<sup>jω0n</sup> ↔ Σ<sub>l</sub> 2πδ(ω − ω<sub>0</sub> − 2πl)") + "، وعمومًا " + m("X = Σ2πa<sub>k</sub>δ(ω − 2πk/N)") + "."
    ],
    figs: [{ plot: { x: [-7, 7], y: [-0.2, 5.5], xl: "ω", yl: "|X(e^jω)| لـ a^n u[n], a = 0.8", items: [{ ct: function (w) { return 1 / Math.sqrt(1 - 1.6 * Math.cos(w) + 0.64); } }, { vline: -2 * PI, c: 4 }, { vline: 2 * PI, c: 4 }], xt: [-2 * PI, -PI, 0, PI, 2 * PI], xf: function (v) { return ["−2π", "−π", "0", "π", "2π"][Math.round(v / PI) + 2]; } }, cap: "DTFT دوري بزمن 2π: الشكل يتكرر عند كل 2π." }],
    laws: [{ eq: "X(e<sup>jω</sup>) = Σ<sub>n=−∞</sub><sup>∞</sup> x[n] e<sup>−jωn</sup>", n: "التحليل" }, { eq: "x[n] = (1/2π) ∫<sub>2π</sub> X(e<sup>jω</sup>) e<sup>jωn</sup> dω", n: "التركيب" }, { eq: "a<sup>n</sup>u[n] ↔ 1/(1 − ae<sup>−jω</sup>),  |a| < 1" }, { eq: "a<sup>|n|</sup> ↔ (1 − a²)/(1 − 2a cos ω + a²)" }, { eq: "X = 1, |ω| ≤ B ↔ sin(Bn)/(πn)  (و B/π عند n = 0)" }, { eq: "Σ<sub>k</sub> δ[n − kN] ↔ (2π/N) Σ<sub>k</sub> δ(ω − 2πk/N)" }],
    when: ["DTFT لإشارات أسّية: مجموع هندسي.", "يكفي رسم ω من −π إلى π؛ الباقي تكرار.", "عند n = 0 في المرشح المثالي استخدم الحد (B/π) بدل 0/0."],
    ex: [
      { q: "أوجد DTFT لـ " + m("x[n] = a<sup>n</sup>u[n]") + "، |a| < 1.",
        s: [m("X = Σ<sub>n=0</sub><sup>∞</sup> (ae<sup>−jω</sup>)<sup>n</sup>") + ".", "مجموع هندسي نسبته أقل من 1: " + m("X = 1/(1 − ae<sup>−jω</sup>)") + "."] },
      { q: "أوجد DTFT لـ " + m("x[n] = a<sup>|n|</sup>") + "، |a| < 1.",
        s: ["نقسم المجموع: n < 0 و n ≥ 0، ونضع m = −n في الأول.", m("X = Σ<sub>m=1</sub><sup>∞</sup> a<sup>m</sup>e<sup>jωm</sup> + Σ<sub>n=0</sub><sup>∞</sup> a<sup>n</sup>e<sup>−jωn</sup> = 1/(1 − ae<sup>jω</sup>) − 1 + 1/(1 − ae<sup>−jω</sup>)") + ".", m("= (1 − a²)/(1 − 2a cos ω + a²)") + "."] },
      { q: "أوجد x[n] التي " + m("X(e<sup>jω</sup>) = 1") + " عند " + m("|ω| ≤ B") + " وصفر حتى π.",
        s: [m("x = (1/2π)∫<sub>−B</sub><sup>B</sup> e<sup>jωn</sup>dω = sin(Bn)/(πn)") + ".", "عند n = 0: " + m("x[0] = (1/2π)·2B = B/π") + "."],
        after: { x: [-15, 15], y: [-0.12, 0.32], xl: "n", yl: "sin(Bn)/(πn), B = π/4", items: [{ dt: function (n) { return n === 0 ? 0.25 : Math.sin(PI / 4 * n) / (PI * n); }, c: 2 }] } },
      { q: "أوجد DTFT لـ " + m("x[n] = Σδ[n − kN]") + ".",
        s: ["دورية بزمن N، و " + m("a<sub>k</sub> = (1/N)Σ<sub>n=0</sub><sup>N−1</sup> x[n]e<sup>−jk(2π/N)n</sup> = 1/N") + " (فقط n = 0 غير صفر).", m("X = (2π/N)Σδ(ω − 2πk/N)") + "."] }
    ],
    real: "عندما يعرض برنامج تحرير الصوت الطيف من 0 إلى نصف تردد العيّنات، فهو يعرض |X(e^jω)| على الفترة 0 ≤ ω ≤ π فقط لأن الباقي تكرار وانعكاس.",
    quiz: [
      S.q("DTFT دائمًا:", [["دوري في ω بزمن 2π", true, "e<sup>−j(ω+2π)n</sup> = e<sup>−jωn</sup>."], ["غير دوري", "conceptual", "هذا للـ CTFT."], ["حقيقي", "conceptual", "مركّب عادةً."]]),
      S.q("DTFT لـ <span class='ltr'>(0.5)<sup>n</sup>u[n]</span>:", [["<span class='ltr'>1/(1 − 0.5e<sup>−jω</sup>)</span>", true, "a = 0.5."], ["<span class='ltr'>1/(0.5 + jω)</span>", "conceptual", "هذا شكل المستمر."], ["<span class='ltr'>1/(1 + 0.5e<sup>−jω</sup>)</span>", "sign", "a موجبة."]]),
      S.q("DTFT لـ <span class='ltr'>δ[n]</span>:", [["1", true, "حد واحد عند n = 0."], ["<span class='ltr'>2πδ(ω)</span>", "conceptual", "هذا للثابت."], ["<span class='ltr'>e<sup>−jω</sup></span>", "substitution", "هذا لـ δ[n − 1]."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x[n] = (0.5)<sup>n</sup>u[n]") + ".",
      steps: [
        S.step("s1", m("X(e<sup>j0</sup>)") + " =", "X(0) =", 2, { hints: ["1/(1 − 0.5)."], sol: "2." }),
        S.step("s2", m("X(e<sup>jπ</sup>)") + " =", "X(π) =", 1 / 1.5, { hints: ["e<sup>−jπ</sup> = −1."], sol: "1/(1 + 0.5) ≈ 0.667.", diag: [{ value: 2, type: "substitution", why: "e<sup>−jπ</sup> = −1 وليس 1." }] }),
        S.step("s3", m("X(e<sup>j2π</sup>)") + " =", "X(2π) =", 2, { hints: ["الدورية 2π."], sol: "= X(e<sup>j0</sup>) = 2." })
      ]
    }
  });

  /* ================= 4. Linearity and symmetry ================= */
  S.lesson({
    id: "ss-ch4-4", chapter: CH, ar: "الخواص: الخطية والتماثل", en: "Properties: Linearity and Symmetry", min: 35,
    obj: ["تستخدم الخطية لتحويل مجموع إشارات.", "تطبق تماثل المرافق لإشارة حقيقية.", "تربط الجزء الزوجي بـ Re{X} والفردي بـ jIm{X}."],
    idea: [
      "التمثيلات الأربعة (CTFS و DTFS و CTFT و DTFT) تشترك في خواص متشابهة. أولها <b>الخطية</b>: " + m("ax<sub>1</sub> + bx<sub>2</sub> ↔ aX<sub>1</sub> + bX<sub>2</sub>") + "، تُثبت مباشرة من خطية التكامل.",
      "<b>التماثل</b>: لإشارة حقيقية " + m("X*(jω) = X(−jω)") + "، أي الجزء الحقيقي زوجي والتخيلي فردي، و " + m("|X|") + " زوجي والطور فردي. وللـ DTFS: " + m("c<sub>−k</sub> = c<sub>k</sub>* = c<sub>N−k</sub>") + ".",
      "وإذا كانت x حقيقية وزوجية فـ X حقيقي وزوجي، وإذا كانت حقيقية وفردية فـ X تخيلي بحت وفردي. وعمومًا " + m("Ev{x} ↔ Re{X}") + " و " + m("Od{x} ↔ jIm{X}") + "."
    ],
    laws: [{ eq: "ax<sub>1</sub>(t) + bx<sub>2</sub>(t) ↔ aX<sub>1</sub>(jω) + bX<sub>2</sub>(jω)" }, { eq: "x حقيقية: X*(jω) = X(−jω),  |X(−jω)| = |X(jω)|,  θ(−ω) = −θ(ω)" }, { eq: "Ev{x(t)} ↔ Re{X(jω)}      Od{x(t)} ↔ j Im{X(jω)}" }],
    when: ["إشارة مجموع إشارات معروفة: حوّل كل واحدة واجمع.", "لاختبار نتيجة: لإشارة حقيقية يجب أن يكون |X| زوجيًا؛ إن لم يكن ففي الحل خطأ."],
    ex: [
      { q: "أوجد تحويل " + m("x(t) = −e<sup>−2t</sup>u(t) + 2e<sup>−3t</sup>u(t)") + ".",
        s: ["بالخطية: " + m("X = −1/(2 + jω) + 2/(3 + jω)") + "."] },
      { q: "أوجد DTFT لـ " + m("x[n] = 4(−½)<sup>n</sup>u[n] + (⅓)<sup>n</sup>u[n]") + ".",
        s: [m("X = 4/(1 + ½e<sup>−jω</sup>) + 1/(1 − ⅓e<sup>−jω</sup>)") + ".", "بتوحيد المقام: " + m("X = (5 − (5/6)e<sup>−jω</sup>)/(1 + (1/6)e<sup>−jω</sup> − (1/6)e<sup>−j2ω</sup>)") + "."] },
      { q: "لـ " + m("x[n] = a<sup>n</sup>u[n]") + ": أوجد الجزأين الحقيقي والتخيلي والسعة والطور، وتحويل الجزأين الزوجي والفردي.",
        s: ["نضرب البسط والمقام في المرافق: " + m("X = (1 − ae<sup>jω</sup>)/(1 − 2a cos ω + a²)") + ".", m("Re{X} = (1 − a cos ω)/(1 − 2a cos ω + a²)") + " (زوجي)، و " + m("Im{X} = −a sin ω/(1 − 2a cos ω + a²)") + " (فردي).", m("|X| = 1/√(1 − 2a cos ω + a²)") + " و " + m("∠X = −tan<sup>−1</sup>(a sin ω/(1 − a cos ω))") + ".", "إذن " + m("FT{x<sub>e</sub>} = Re{X}") + " و " + m("FT{x<sub>o</sub>} = jIm{X}") + "."] },
      { q: "استخدم التماثل ونتيجة " + m("e<sup>−at</sup>u(t) ↔ 1/(a + jω)") + " لتحويل " + m("e<sup>−a|t|</sup>") + ".",
        s: [m("e<sup>−a|t|</sup> = e<sup>−at</sup>u(t) + e<sup>at</sup>u(−t) = 2Ev{e<sup>−at</sup>u(t)}") + ".", m("X = 2Re{1/(a + jω)} = 2a/(a² + ω²)") + "."] }
    ],
    real: "لأن طيف أي إشارة حقيقية متماثل، تعرض الأجهزة والبرامج الترددات الموجبة فقط: نصف الطيف يكفي.",
    quiz: [
      S.q("إشارة حقيقية وزوجية. تحويلها:", [["حقيقي وزوجي", true, "خاصية التماثل."], ["تخيلي وفردي", "conceptual", "هذا للحقيقية الفردية."], ["مركّب عام", "conceptual", "التماثل يجعله حقيقيًا."]]),
      S.q("لإشارة حقيقية <span class='ltr'>|X(j5)| = 3</span>. فإن <span class='ltr'>|X(−j5)|</span>:", [["3", true, "السعة زوجية."], ["−3", "sign", "السعة لا تكون سالبة."], ["غير معروف", "conceptual", "التماثل يحدده."]]),
      S.q("<span class='ltr'>Od{x(t)}</span> ↔", [["<span class='ltr'>j Im{X(jω)}</span>", true, "الجزء الفردي ↔ التخيلي."], ["<span class='ltr'>Re{X(jω)}</span>", "conceptual", "هذا للزوجي."], ["<span class='ltr'>Im{X(jω)}</span>", "formula", "نسيت j."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x(t) = 3e<sup>−t</sup>u(t) + e<sup>−4t</sup>u(t)") + ".",
      steps: [
        S.step("s1", m("X(j0)") + " =", "X(0) =", 3 + 0.25, { hints: ["3/(1 + jω) + 1/(4 + jω) عند ω = 0."], sol: "3 + 1/4 = 3.25." }),
        S.step("s2", m("Re{X(j1)}") + " =", "Re =", 3 / 2 + 4 / 17, { hints: ["Re{1/(a + jω)} = a/(a² + ω²)."], sol: "3·1/2 + 4/17 ≈ 1.735." }),
        S.step("s3", m("Im{X(j1)}") + " =", "Im =", -3 / 2 - 1 / 17, { hints: ["Im{1/(a + jω)} = −ω/(a² + ω²)."], sol: "−3/2 − 1/17 ≈ −1.559.", diag: [{ value: 3 / 2 + 1 / 17, type: "sign", why: "الجزء التخيلي −ω/(a² + ω²)، سالب للترددات الموجبة." }] })
      ]
    }
  });

  /* ================= 5. Shift, scaling, Parseval, differentiation, convolution ================= */
  S.lesson({
    id: "ss-ch4-5", chapter: CH, ar: "الخواص: الإزاحة، التحجيم، بارسفال، الاشتقاق، الالتفاف", en: "Properties: Shifts, Scaling, Parseval, Differentiation, Convolution", min: 40,
    obj: ["تطبق إزاحة الزمن والتردد والتحجيم.", "تحسب الطاقة بعلاقة بارسفال.", "تستخدم خاصية الاشتقاق والتكامل والالتفاف."],
    idea: [
      "<b>إزاحة الزمن</b> " + m("x(t − t<sub>0</sub>) ↔ e<sup>−jωt0</sup>X(jω)") + ": تضيف طورًا " + m("−ωt<sub>0</sub>") + " فقط ولا تغيّر السعة. و<b>إزاحة التردد</b> " + m("e<sup>jω0t</sup>x(t) ↔ X(j(ω − ω<sub>0</sub>))") + ". وللمتسلسلة: " + m("a<sub>k</sub>e<sup>−jkω0t0</sup>") + " و " + m("a<sub>k−k0</sub>") + ".",
      "<b>التحجيم</b> " + m("x(at) ↔ (1/|a|)X(jω/a)") + ": التمدد في الزمن انضغاط في التردد، والانعكاس " + m("x(−t) ↔ X(−jω)") + ". و<b>بارسفال</b>: الطاقة نفسها في المجالين " + m("∫|x|²dt = (1/2π)∫|X|²dω") + "، و " + m("|X|²") + " طيف الطاقة.",
      "<b>الاشتقاق</b> " + m("dx/dt ↔ jωX") + "، و<b>التكامل</b> " + m("∫x ↔ X/(jω) + πX(0)δ(ω)") + " (ومنه " + m("u(t) ↔ 1/(jω) + πδ(ω)") + "). وأهمها <b>الالتفاف</b>: " + m("x * h ↔ X·H") + "؛ الالتفاف في الزمن ضرب في التردد."
    ],
    laws: [{ eq: "x(t − t<sub>0</sub>) ↔ e<sup>−jωt0</sup>X(jω)      e<sup>jω0t</sup>x(t) ↔ X(j(ω − ω<sub>0</sub>))" }, { eq: "x(at) ↔ (1/|a|) X(jω/a)      x(−t) ↔ X(−jω)      x[−n] ↔ X(e<sup>−jω</sup>)" }, { eq: "∫|x(t)|²dt = (1/2π) ∫|X(jω)|²dω", n: "بارسفال" }, { eq: "dx/dt ↔ jωX      ∫<sub>−∞</sub><sup>t</sup>x dτ ↔ X/(jω) + πX(0)δ(ω)" }, { eq: "x(t) * h(t) ↔ X(jω)H(jω)      x(t)y(t) ↔ (1/2π) X * Y" }, { eq: "t·x(t) ↔ j dX/dω      x*(t) ↔ X*(−jω)" }],
    when: ["إشارة مكوّنة من نبضات مزاحة: اكتبها بنبضات متمركزة ثم أضف e<sup>−jωt0</sup>.", "x مضروبة في e<sup>jω0t</sup> أو cos: إزاحة تردد (تعديل).", "خرج نظام: احسب Y = XH ثم ارجع للزمن بدل حساب الالتفاف."],
    ex: [
      { q: "تحويل " + m("x = 1") + " عند |t| < T هو " + m("(2/ω)sin ωT") + ". أوجد تحويل " + m("y = 1") + " عند " + m("0 ≤ t ≤ 2T") + ".",
        s: [m("y(t) = x(t − T)") + ".", m("Y = e<sup>−jωT</sup>(2/ω)sin(ωT)") + "."] },
      { q: "إشارة سلّمية: 1 على (1, 4) ويرتفع إلى 1.5 على (2, 3). أوجد تحويلها.",
        s: ["نكتبها " + m("x(t) = ½x<sub>1</sub>(t − 2.5) + x<sub>2</sub>(t − 2.5)") + "، حيث x1 نبضة عرضها 1 و x2 عرضها 3 متمركزتان.", m("X<sub>1</sub> = 2sin(ω/2)/ω") + " و " + m("X<sub>2</sub> = 2sin(3ω/2)/ω") + ".", "بالخطية والإزاحة: " + m("X = e<sup>−j5ω/2</sup>[sin(ω/2) + 2sin(3ω/2)]/ω") + "."],
        fig: { x: [0, 5], y: [-0.2, 1.8], xl: "t", yl: "x(t)", items: [{ ct: function (t) { return t > 2 && t < 3 ? 1.5 : t > 1 && t < 4 ? 1 : 0; } }] } },
      { q: "أوجد تحويل " + m("z(t) = e<sup>j10t</sup>") + " عند " + m("|t| ≤ π") + ".",
        s: [m("z = e<sup>j10t</sup>x(t)") + " مع x نبضة على |t| < π.", m("X = 2sin(πω)/ω") + "، وبإزاحة التردد " + m("Z = 2sin((ω − 10)π)/(ω − 10)") + "."] },
      { q: "تحويل النبضة |t| < 1 هو " + m("(2/ω)sin ω") + ". أوجد تحويل النبضة |t| < 2.",
        s: [m("y(t) = x(t/2) = x(0.5t)") + ".", m("Y = (1/0.5)X(jω/0.5) = (2/ω)sin 2ω") + "؛ تمددت في الزمن فانضغط الطيف."] },
      { q: "أوجد تحويل " + m("d/dt(e<sup>−at</sup>u(t))") + " وتحويل " + m("u(t)") + ".",
        s: ["بالاشتقاق: " + m("jω/(a + jω)") + ".", m("u(t) = ∫<sub>−∞</sub><sup>t</sup>δ(τ)dτ") + " و " + m("δ ↔ 1") + "، فبالتكامل " + m("U = 1/(jω) + πδ(ω)") + "."] }
    ],
    real: "الراديو AM يضرب الصوت في cos(ω_c t)، فيُزاح طيفه إلى حول تردد المحطة (إزاحة التردد)، ولهذا تتعايش محطات كثيرة دون تداخل.",
    quiz: [
      S.q("إزاحة إشارة في الزمن تغيّر في طيفها:", [["الطور فقط", true, "e<sup>−jωt0</sup> سعته 1."], ["السعة فقط", "conceptual", "السعة لا تتغيّر."], ["الاثنين", "conceptual", "السعة تبقى."]]),
      S.q("<span class='ltr'>x(3t)</span> ↔", [["<span class='ltr'>(1/3)X(jω/3)</span>", true, "1/|a| X(jω/a)."], ["<span class='ltr'>3X(j3ω)</span>", "formula", "العكس."], ["<span class='ltr'>X(jω/3)</span>", "formula", "نسيت 1/|a|."]]),
      S.q("الالتفاف في الزمن يقابله في التردد:", [["الضرب", true, "Y = XH."], ["الجمع", "conceptual", "الجمع يقابل الجمع."], ["الالتفاف", "conceptual", "الالتفاف في التردد يقابل الضرب في الزمن."]])
    ],
    practice: {
      prompt: "نظام " + m("H(jω) = 1/(2 + jω)") + " ودخله " + m("x(t) = e<sup>−t</sup>u(t)") + ".",
      steps: [
        S.step("s1", "اكتب Y = XH؛ ما قيمة " + m("Y(j0)") + "؟", "Y(0) =", 0.5, { hints: ["X(0) = 1، H(0) = 1/2."], sol: "1 × 1/2 = 0.5." }),
        S.step("s2", "بالكسور الجزئية " + m("Y = A/(1 + jω) + B/(2 + jω)") + ". ما A؟", "A =", 1, { hints: ["A = 1/(2 + jω) عند jω = −1."], sol: "A = 1/(2 − 1) = 1." }),
        S.step("s3", "قيمة " + m("y(t)") + " عند t = 1.", "y(1) =", Math.exp(-1) - Math.exp(-2), { hints: ["B = −1 ⇒ y = (e<sup>−t</sup> − e<sup>−2t</sup>)u(t)."], sol: "e<sup>−1</sup> − e<sup>−2</sup> ≈ 0.233." })
      ]
    }
  });

  /* ================= 6. Frequency response of LCCDE systems ================= */
  S.lesson({
    id: "ss-ch4-6", chapter: CH, ar: "الاستجابة الترددية لنظم المعادلات التفاضلية والفرقية", en: "Frequency Response of Systems Described by Differential and Difference Equations", min: 35,
    obj: ["تحسب H(jω) من معادلة تفاضلية بأخذ تحويل الطرفين.", "تحسب H(e^jω) من معادلة فرقية.", "تجد h والخرج بالكسور الجزئية."],
    idea: [
      "لنظام " + m("Σa<sub>k</sub>d<sup>k</sup>y/dt<sup>k</sup> = Σb<sub>k</sub>d<sup>k</sup>x/dt<sup>k</sup>") + " نأخذ تحويل فورييه للطرفين، وبخاصية الاشتقاق كل مشتقة تصير ضربًا في jω: " + m("H(jω) = Y/X = Σb<sub>k</sub>(jω)<sup>k</sup> / Σa<sub>k</sub>(jω)<sup>k</sup>") + ".",
      "وللمعادلة الفرقية " + m("Σa<sub>k</sub>y[n − k] = Σb<sub>k</sub>x[n − k]") + " كل تأخير يصير ضربًا في " + m("e<sup>−jω</sup>") + ": " + m("H(e<sup>jω</sup>) = Σb<sub>k</sub>e<sup>−jkω</sup> / Σa<sub>k</sub>e<sup>−jkω</sup>") + ". ثم نفكك بالكسور الجزئية ونرجع للزمن بجدول التحويلات."
    ],
    laws: [{ eq: "H(jω) = Σ<sub>k=0</sub><sup>M</sup> b<sub>k</sub>(jω)<sup>k</sup> / Σ<sub>k=0</sub><sup>N</sup> a<sub>k</sub>(jω)<sup>k</sup>" }, { eq: "H(e<sup>jω</sup>) = Σ<sub>k=0</sub><sup>M</sup> b<sub>k</sub>e<sup>−jkω</sup> / Σ<sub>k=0</sub><sup>N</sup> a<sub>k</sub>e<sup>−jkω</sup>" }],
    when: ["حلّل المقام لعوامل (jω + a) أو (1 − ae<sup>−jω</sup>)، ثم كسور جزئية.", "كل حد A/(jω + a) يرجع A e<sup>−at</sup>u(t)، وكل A/(1 − ae<sup>−jω</sup>) يرجع A a<sup>n</sup>u[n]."],
    ex: [
      { q: "أوجد الاستجابة الترددية والنبضية لـ " + m("y'' + 4y' + 3y = x' + 2x") + ".",
        s: [m("((jω)² + 4jω + 3)Y = (jω + 2)X") + ".", m("H = (jω + 2)/((jω + 1)(jω + 3))") + ".", "كسور جزئية: " + m("H = (½)/(jω + 1) + (½)/(jω + 3)") + ".", m("h(t) = ½e<sup>−t</sup>u(t) + ½e<sup>−3t</sup>u(t)") + "."] },
      { q: "نظام سببي " + m("y[n] − ¾y[n − 1] + ⅛y[n − 2] = 2x[n]") + ". أوجد h[n]، ثم الخرج لـ " + m("x[n] = (¼)<sup>n</sup>u[n]") + ".",
        s: [m("H = 2/(1 − ¾e<sup>−jω</sup> + ⅛e<sup>−j2ω</sup>) = 2/((1 − ½e<sup>−jω</sup>)(1 − ¼e<sup>−jω</sup>))") + ".", m("H = 4/(1 − ½e<sup>−jω</sup>) − 2/(1 − ¼e<sup>−jω</sup>)") + " ⇐ " + m("h[n] = 4(½)<sup>n</sup>u[n] − 2(¼)<sup>n</sup>u[n]") + ".", m("Y = HX = 2/((1 − ½e<sup>−jω</sup>)(1 − ¼e<sup>−jω</sup>)²)") + ".", "بالكسور الجزئية والعكس: " + m("y[n] = [8(½)<sup>n</sup> − 4(¼)<sup>n</sup> − 2(n + 1)(¼)<sup>n</sup>]u[n]") + ". (تحققنا منها بالتكرار عدديًا.)"],
        after: { x: [-1, 10], y: [-0.2, 2.6], xl: "n", yl: "y[n]", items: [{ dt: function (n) { return n < 0 ? 0 : 8 * Math.pow(0.5, n) - 4 * Math.pow(0.25, n) - 2 * (n + 1) * Math.pow(0.25, n); }, c: 3 }] } }
    ],
    real: "مرشح الصوت (equalizer) في الجوال معادلة فرقية؛ H(e^jω) تبيّن كم يكبّر أو يخفّض كل تردد.",
    quiz: [
      S.q("في تحويل فورييه، المشتقة <span class='ltr'>d²y/dt²</span> تصير:", [["<span class='ltr'>(jω)²Y</span>", true, "jω لكل اشتقاق."], ["<span class='ltr'>2jωY</span>", "formula", "تُرفع للقوة لا تُضرب في 2."], ["<span class='ltr'>ω²Y</span>", "sign", "(jω)² = −ω²."]]),
      S.q("التأخير <span class='ltr'>y[n − 2]</span> يصير:", [["<span class='ltr'>e<sup>−j2ω</sup>Y</span>", true, "إزاحة الزمن."], ["<span class='ltr'>e<sup>j2ω</sup>Y</span>", "sign", "التأخير إشارة سالبة."], ["<span class='ltr'>2Y</span>", "conceptual", "الإزاحة طور وليس ضربًا."]]),
      S.q("<span class='ltr'>H = 3/(jω + 2)</span>. فإن h(t):", [["<span class='ltr'>3e<sup>−2t</sup>u(t)</span>", true, "من e<sup>−at</sup>u ↔ 1/(a + jω)."], ["<span class='ltr'>3e<sup>2t</sup>u(t)</span>", "sign", "القطب عند −2."], ["<span class='ltr'>2e<sup>−3t</sup>u(t)</span>", "substitution", "خلطت بين البسط والقطب."]])
    ],
    practice: {
      prompt: "نظام " + m("dy/dt + 5y = 10x") + ".",
      steps: [
        S.step("s1", m("|H(j0)|") + " =", "|H(0)| =", 2, { hints: ["H = 10/(jω + 5)."], sol: "10/5 = 2." }),
        S.step("s2", m("|H(j5)|") + " =", "|H(j5)| =", 10 / Math.sqrt(50), { hints: ["10/√(25 + 25)."], sol: "≈ 1.414." }),
        S.step("s3", "قيمة " + m("h(0<sup>+</sup>)") + ".", "h(0+) =", 10, { hints: ["h = 10e<sup>−5t</sup>u(t)."], sol: "10." })
      ]
    }
  });
})();
