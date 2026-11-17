/* Signals and Systems — Chapter 6: Z-Transform (lecture 11). */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss, P = CV.sp, PI = Math.PI;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var CH = "الفصل 6: تحويل Z";
  function zplane(rIn, rOut, poles, zeros) {
    var it = [{ circle: [0, 0, 1], dash: true, c: 4 }];
    if (rOut) it.push({ circle: [0, 0, rOut], c: 1 });
    if (rIn) it.push({ circle: [0, 0, rIn], c: 1 });
    it.push({ pz: { poles: poles || [], zeros: zeros || [] }, c: 2 });
    return { w: 300, h: 280, x: [-1.8, 1.8], y: [-1.6, 1.6], xl: "Re(z)", yl: "Im(z)", grid: false, items: it };
  }

  /* ================= 1. Z-transform and ROC ================= */
  S.lesson({
    id: "ss-ch6-1", chapter: CH, ar: "تحويل Z ومنطقة التقارب", en: "The Z-Transform and the Region of Convergence", min: 30,
    obj: ["تعرّف تحويل Z وتحسبه لإشارات بسيطة.", "تحدد ROC لإشارة سببية ولا سببية وثنائية الجانب.", "تحسب تحويل الإشارات محدودة الطول."],
    idea: [
      "تحويل Z للإشارة المتقطعة " + m("X(z) = Σx[n]z<sup>−n</sup>") + "، وهو المقابل المتقطع للابلاس. و<b>منطقة التقارب</b> ROC قيم z التي تكون X عندها محدودة.",
      "للإشارة السببية " + m("α<sup>n</sup>u[n]") + ": " + m("X = Σ(αz<sup>−1</sup>)<sup>n</sup> = 1/(1 − αz<sup>−1</sup>)") + " بشرط " + m("|z| > |α|") + " (<b>خارج دائرة</b>). وللّاسببية " + m("−α<sup>n</sup>u[−n−1]") + " نفس X لكن " + m("|z| < |α|") + " (<b>داخل دائرة</b>). وللثنائية " + m("a<sup>n</sup>u[n] − b<sup>n</sup>u[−n−1]") + " حلقة " + m("|a| < |z| < |b|") + ".",
      "الإشارة محدودة الطول تحويلها كثيرة حدود في z<sup>−1</sup>، والـ ROC كل المستوى إلا ربما z = 0 (إذا وُجدت قيم عند n > 0) أو z = ∞ (إذا وُجدت قيم عند n < 0)."
    ],
    figs: [
      { plot: zplane(0.6, null, [[0.6, 0]], [[0, 0]]), cap: "α^n u[n]: الـ ROC خارج الدائرة |z| = |α|." },
      { plot: zplane(0.5, 1.3, [[0.5, 0], [1.3, 0]]), cap: "ثنائية الجانب: حلقة بين |a| و |b|." }
    ],
    laws: [{ eq: "X(z) = Σ<sub>n=−∞</sub><sup>∞</sup> x[n] z<sup>−n</sup>" }, { eq: "α<sup>n</sup>u[n] ↔ 1/(1 − αz<sup>−1</sup>),  |z| > |α|" }, { eq: "−α<sup>n</sup>u[−n−1] ↔ 1/(1 − αz<sup>−1</sup>),  |z| < |α|" }, { eq: "δ[n] ↔ 1 (كل z)    δ[n − k] ↔ z<sup>−k</sup> (z ≠ 0)    δ[n + k] ↔ z<sup>k</sup> (z ≠ ∞)" }],
    when: ["إشارة قصيرة: اكتب كل قيمة مضروبة في z<sup>−n</sup>.", "إشارة أسّية: مجموع هندسي، وشرط تقاربه يعطي الـ ROC."],
    ex: [
      { q: "أوجد تحويل " + m("x = {1, 2, 5, 7, 0, 1}") + " حيث 5 عند n = 0.",
        s: [m("x = δ[n + 2] + 2δ[n + 1] + 5δ[n] + 7δ[n − 1] + δ[n − 3]") + ".", m("X = z² + 2z + 5 + 7z<sup>−1</sup> + z<sup>−3</sup>") + ".", "الـ ROC كل المستوى إلا z = 0 و z = ∞."] },
      { q: "أوجد تحويل " + m("x = a<sup>n</sup>u[n] − b<sup>n</sup>u[−n−1]") + " مع |a| < |b|.",
        s: ["الحد الأول: " + m("1/(1 − az<sup>−1</sup>), |z| > |a|") + ".", "الثاني: " + m("1/(1 − bz<sup>−1</sup>), |z| < |b|") + ".", m("X = 1/(1 − az<sup>−1</sup>) + 1/(1 − bz<sup>−1</sup>)") + "، والـ ROC " + m("|a| < |z| < |b|") + "."] }
    ],
    real: "كل مرشح رقمي في جوالك أو سماعتك يُصمم بتحويل Z؛ وموقع الأقطاب بالنسبة لدائرة الوحدة يحدد استقراره.",
    quiz: [
      S.q("<span class='ltr'>(0.9)<sup>n</sup>u[n]</span>. الـ ROC:", [["<span class='ltr'>|z| > 0.9</span>", true, "سببية ⇒ خارج الدائرة."], ["<span class='ltr'>|z| < 0.9</span>", "conceptual", "هذا للّاسببية."], ["كل المستوى", "conceptual", "طولها لا نهائي."]]),
      S.q("<span class='ltr'>δ[n − 3]</span> ↔", [["<span class='ltr'>z<sup>−3</sup></span>", true, "تأخير 3."], ["<span class='ltr'>z<sup>3</sup></span>", "sign", "التأخير قوة سالبة."], ["3", "conceptual", "الدفعة المزاحة تحويلها قوة لـ z."]]),
      S.q("إشارة سببية ولا سببية لهما نفس X(z). يختلفان في:", [["الـ ROC", true, "خارج أو داخل الدائرة."], ["الأقطاب", "conceptual", "الأقطاب نفسها."], ["لا شيء", "conceptual", "الـ ROC مختلفة."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x[n] = 2δ[n] − δ[n − 1] + 3δ[n − 2]") + ".",
      steps: [
        S.step("s1", "معامل " + m("z<sup>−2</sup>") + ".", "=", 3, { hints: ["قيمة x[2]."], sol: "3." }),
        S.step("s2", "قيمة X(z) عند z = 1.", "X(1) =", 4, { hints: ["2 − 1 + 3."], sol: "4." }),
        S.step("s3", "قيمة X(z) عند z = −1.", "X(−1) =", 2 + 1 + 3, { hints: ["z<sup>−1</sup> = −1، z<sup>−2</sup> = 1."], sol: "2 + 1 + 3 = 6.", diag: [{ value: 4, type: "sign", why: "عند z = −1: −(−1) = +1." }] })
      ]
    }
  });

  /* ================= 2. Properties ================= */
  S.lesson({
    id: "ss-ch6-2", chapter: CH, ar: "خواص تحويل Z", en: "Properties of the Z-Transform", min: 35,
    obj: ["تطبق الخطية والتأخير والتحجيم في z.", "تحسب الالتفاف بضرب التحويلات.", "تطبق الانعكاس والاشتقاق في z والارتباط ونظرية القيمة الابتدائية."],
    idea: [
      "<b>الخطية</b> مع ROC التقاطع. <b>التأخير</b> " + m("x[n − k] ↔ z<sup>−k</sup>X(z)") + ". <b>التحجيم في z</b> " + m("a<sup>n</sup>x[n] ↔ X(a<sup>−1</sup>z)") + " وتتحجّم الـ ROC بـ |a|. <b>الالتفاف</b> " + m("x<sub>1</sub> * x<sub>2</sub> ↔ X<sub>1</sub>X<sub>2</sub>") + ".",
      "<b>الانعكاس</b> " + m("x[−n] ↔ X(z<sup>−1</sup>)") + "، و<b>الاشتقاق في z</b> " + m("nx[n] ↔ −z dX/dz") + "، و<b>الارتباط</b> " + m("r<sub>x1x2</sub> ↔ X<sub>1</sub>(z)X<sub>2</sub>(z<sup>−1</sup>)") + "، و<b>القيمة الابتدائية</b> لإشارة سببية " + m("x[0] = lim<sub>z→∞</sub> X(z)") + "."
    ],
    laws: [{ eq: "a<sub>1</sub>x<sub>1</sub> + a<sub>2</sub>x<sub>2</sub> ↔ a<sub>1</sub>X<sub>1</sub> + a<sub>2</sub>X<sub>2</sub>,  ROC ⊇ ROC<sub>1</sub> ∩ ROC<sub>2</sub>" }, { eq: "x[n − k] ↔ z<sup>−k</sup>X(z)" }, { eq: "a<sup>n</sup>x[n] ↔ X(a<sup>−1</sup>z),  |a|r<sub>1</sub> < |z| < |a|r<sub>2</sub>" }, { eq: "x<sub>1</sub> * x<sub>2</sub> ↔ X<sub>1</sub>(z)X<sub>2</sub>(z)" }, { eq: "x[−n] ↔ X(z<sup>−1</sup>)      n x[n] ↔ −z dX/dz" }, { eq: "r<sub>x1x2</sub>[l] ↔ X<sub>1</sub>(z)X<sub>2</sub>(z<sup>−1</sup>)      x[0] = lim<sub>z→∞</sub> X(z)" }],
    when: ["التفاف إشارتين قصيرتين: اضرب كثيرتي الحدود في z<sup>−1</sup> واقرأ المعاملات.", "a<sup>n</sup> مضروبة في إشارة معروفة: استبدل z بـ z/a."],
    ex: [
      { q: "أوجد تحويل " + m("x = cos(ω<sub>0</sub>n)u[n]") + ".",
        s: [m("x = 0.5e<sup>jω0n</sup>u[n] + 0.5e<sup>−jω0n</sup>u[n]") + ".", m("X = 0.5/(1 − e<sup>jω0</sup>z<sup>−1</sup>) + 0.5/(1 − e<sup>−jω0</sup>z<sup>−1</sup>)") + ".", m("X = (1 − z<sup>−1</sup>cos ω<sub>0</sub>)/(1 − 2z<sup>−1</sup>cos ω<sub>0</sub> + z<sup>−2</sup>),  |z| > 1") + "."] },
      { q: "من النتيجة السابقة أوجد تحويل " + m("a<sup>n</sup>cos(ω<sub>0</sub>n)u[n]") + ".",
        s: ["بالتحجيم: نستبدل z<sup>−1</sup> بـ az<sup>−1</sup>.", m("X = (1 − az<sup>−1</sup>cos ω<sub>0</sub>)/(1 − 2az<sup>−1</sup>cos ω<sub>0</sub> + a²z<sup>−2</sup>),  |z| > |a|") + "."] },
      { q: "احسب التفاف " + m("x<sub>1</sub> = δ[n] − 2δ[n − 1] + δ[n − 2]") + " مع " + m("x<sub>2</sub> = 1") + " عند 0 ≤ n ≤ 5.",
        s: [m("X<sub>1</sub> = 1 − 2z<sup>−1</sup> + z<sup>−2</sup>") + " و " + m("X<sub>2</sub> = 1 + z<sup>−1</sup> + … + z<sup>−5</sup>") + ".", m("X = X<sub>1</sub>X<sub>2</sub> = 1 − z<sup>−1</sup> − z<sup>−6</sup> + z<sup>−7</sup>") + ".", m("x = {1, −1, 0, 0, 0, 0, −1, 1}") + "."],
        after: { x: [-1, 9], y: [-1.4, 1.4], xl: "n", yl: "x1 * x2", items: [{ dt: { 0: 1, 1: -1, 2: 0, 3: 0, 4: 0, 5: 0, 6: -1, 7: 1 }, c: 3 }] } },
      { q: "أوجد تحويل الارتباط الذاتي لـ " + m("x = a<sup>n</sup>u[n]") + ".",
        s: [m("X(z) = 1/(1 − az<sup>−1</sup>), |z| > |a|") + " و " + m("X(z<sup>−1</sup>) = 1/(1 − az), |z| < 1/|a|") + ".", m("R<sub>xx</sub>(z) = 1/((1 − az<sup>−1</sup>)(1 − az))") + "، والـ ROC " + m("|a| < |z| < 1/|a|") + "."] }
    ],
    real: "ضرب كثيرات الحدود في z هو بالضبط ما يفعله معالج DSP عند تمرير الصوت على مرشح FIR.",
    quiz: [
      S.q("<span class='ltr'>x[n − 4]</span> ↔", [["<span class='ltr'>z<sup>−4</sup>X(z)</span>", true, "التأخير."], ["<span class='ltr'>X(z − 4)</span>", "conceptual", "ليست إزاحة في z."], ["<span class='ltr'>z<sup>4</sup>X(z)</span>", "sign", "التأخير قوة سالبة."]]),
      S.q("<span class='ltr'>X(z) = (2 + z<sup>−1</sup>)/(1 − 0.5z<sup>−1</sup>)</span> لإشارة سببية. <span class='ltr'>x[0]</span>:", [["2", true, "z → ∞ يجعل z<sup>−1</sup> → 0."], ["4", "substitution", "عوّضت z = 1."], ["0", "conceptual", "الحد يعطي 2."]]),
      S.q("<span class='ltr'>n x[n]</span> ↔", [["<span class='ltr'>−z dX/dz</span>", true, "الاشتقاق في z."], ["<span class='ltr'>z dX/dz</span>", "sign", "بإشارة سالبة."], ["<span class='ltr'>dX/dz</span>", "formula", "نسيت −z."]])
    ],
    practice: {
      prompt: m("x<sub>1</sub>[n] = {1, 2}") + " (من n = 0) و " + m("x<sub>2</sub>[n] = {3, −1, 2}") + " (من n = 0).",
      steps: [
        S.step("s1", "معامل " + m("z<sup>−1</sup>") + " في الناتج.", "=", 1 * -1 + 2 * 3, { hints: ["(1 + 2z<sup>−1</sup>)(3 − z<sup>−1</sup> + 2z<sup>−2</sup>)."], sol: "−1 + 6 = 5." }),
        S.step("s2", "معامل " + m("z<sup>−2</sup>") + ".", "=", 2 + 2 * -1, { hints: ["1·2 + 2·(−1)."], sol: "0." }),
        S.step("s3", "معامل " + m("z<sup>−3</sup>") + ".", "=", 4, { hints: ["2·2."], sol: "4." })
      ]
    }
  });

  /* ================= 3. Poles, zeros, system function, stability ================= */
  S.lesson({
    id: "ss-ch6-3", chapter: CH, ar: "الأقطاب والأصفار ودالة النظام والاستقرار", en: "Poles, Zeros, System Function and Stability", min: 30,
    obj: ["تجد أقطاب وأصفار X(z) بما فيها عند الصفر واللانهاية.", "تربط موقع الأقطاب بسلوك الإشارة السببية.", "تجد H(z) من معادلة فرقية وتختبر الاستقرار."],
    idea: [
      "الأصفار قيم z التي تجعل X = 0، والأقطاب قيمها التي تجعل X = ∞. لـ X نسبية بـ M صفر و N قطب: إذا N > M يوجد N − M صفر عند z = 0، وإذا N < M يوجد M − N قطب عند z = 0. نرسمها في مستوى z: × للقطب و o للصفر.",
      "لإشارة سببية: إذا كانت كل الأقطاب <b>داخل دائرة الوحدة</b> فالإشارة محدودة (تتلاشى)، وكلما اقتربت الأقطاب من المركز كان التلاشي أسرع.",
      "للنظام: " + m("Y(z) = X(z)H(z)") + "، و " + m("H(z)") + " دالة النظام. ونظام <b>سببي ومستقر</b> ⇔ كل أقطاب H(z) داخل دائرة الوحدة."
    ],
    figs: [{ plot: zplane(null, null, [[0.6, 0.2], [0.6, -0.2], [-0.4, 0]]), cap: "مستقر: كل الأقطاب داخل دائرة الوحدة (الخط المتقطع)." }],
    laws: [{ eq: "X(z) = (b<sub>0</sub>/a<sub>0</sub>) z<sup>N−M</sup> (z − z<sub>1</sub>)…(z − z<sub>M</sub>) / ((z − p<sub>1</sub>)…(z − p<sub>N</sub>))" }, { eq: "Y(z) = X(z)H(z)" }, { eq: "سببي ومستقر ⇔ |p<sub>k</sub>| < 1 لكل الأقطاب" }],
    when: ["لاختبار الاستقرار: احسب |p| لكل قطب وقارنه بـ 1.", "معادلة فرقية: خذ تحويل Z (كل تأخير z<sup>−1</sup>) ثم H = Y/X."],
    ex: [
      { q: "ارسم الأقطاب والأصفار لـ " + m("x = a<sup>n</sup>u[n]") + ".",
        s: [m("X = 1/(1 − az<sup>−1</sup>) = z/(z − a)") + ".", "صفر عند z = 0 وقطب عند z = a."],
        after: zplane(null, null, [[0.7, 0]], [[0, 0]]) },
      { q: "حل " + m("y[n] = 0.5y[n − 1] + 2x[n]") + " بتحويل Z (h سببي).",
        s: [m("Y = 0.5z<sup>−1</sup>Y + 2X") + ".", m("H = 2/(1 − 0.5z<sup>−1</sup>)") + ".", m("h[n] = 2(0.5)<sup>n</sup>u[n]") + "، والقطب 0.5 داخل الدائرة ⇐ مستقر."] }
    ],
    real: "مرشح رقمي أقطابه قريبة جدًا من دائرة الوحدة يرن طويلًا (صدى)، وإذا خرجت عنها بسبب أخطاء التقريب ينفجر الخرج.",
    quiz: [
      S.q("نظام سببي أقطابه <span class='ltr'>0.5</span> و <span class='ltr'>1.2</span>:", [["غير مستقر", true, "1.2 خارج الدائرة."], ["مستقر", "conceptual", "قطب واحد خارج يكفي لعدم الاستقرار."], ["حدّي", "conceptual", "الحدّي على الدائرة."]]),
      S.q("<span class='ltr'>X = z/(z − 0.3)</span>. أصفارها:", [["<span class='ltr'>z = 0</span>", true, "البسط z."], ["<span class='ltr'>z = 0.3</span>", "conceptual", "هذا قطب."], ["لا يوجد", "conceptual", "يوجد صفر عند المركز."]]),
      S.q("أي الإشارتين تتلاشى أسرع: قطب عند 0.2 أو عند 0.9؟", [["0.2", true, "أقرب للمركز."], ["0.9", "conceptual", "القريب من الدائرة يتلاشى ببطء."], ["متساويتان", "conceptual", "السرعة تعتمد على |p|."]])
    ],
    practice: {
      prompt: "نظام سببي " + m("y[n] − 0.8y[n − 1] = x[n] + x[n − 1]") + ".",
      steps: [
        S.step("s1", "القطب.", "p =", 0.8, { hints: ["المقام 1 − 0.8z<sup>−1</sup>."], sol: "0.8." }),
        S.step("s2", "الصفر.", "z0 =", -1, { hints: ["البسط 1 + z<sup>−1</sup> = 0."], sol: "−1." }),
        S.step("s3", m("H(z)") + " عند z = 1.", "H(1) =", 2 / 0.2, { hints: ["2/(1 − 0.8)."], sol: "10." })
      ]
    }
  });

  /* ================= 4. Inverse Z ================= */
  S.lesson({
    id: "ss-ch6-4", chapter: CH, ar: "تحويل Z العكسي", en: "The Inverse Z-Transform", min: 40,
    obj: ["تطبق الكسور الجزئية على X(z)/z.", "تعكس حدودًا بأقطاب حقيقية ومركّبة ومكررة، سببية ولا سببية.", "تفهم إلغاء القطب بالصفر."],
    idea: [
      "خطوات الكسور الجزئية: (1) تأكد أن درجة البسط أقل (وإلا قسمة طويلة)، (2) تخلص من قوى z السالبة، (3) فكك " + m("X(z)/z = A<sub>1</sub>/(z − p<sub>1</sub>) + …") + " مع " + m("A = (z − p)X(z)/z|<sub>z=p</sub>") + ". ثم نكتب " + m("X = Σ A<sub>k</sub>/(1 − p<sub>k</sub>z<sup>−1</sup>)") + ".",
      "العكس حسب الـ ROC: <b>سببي</b> " + m("1/(1 − pz<sup>−1</sup>) → p<sup>n</sup>u[n]") + "، و " + m("pz<sup>−1</sup>/(1 − pz<sup>−1</sup>)² → np<sup>n</sup>u[n]") + "، وللزوج المركّب " + m("2|A||p|<sup>n</sup>cos(βn + α)u[n]") + ". <b>لا سببي</b>: " + m("−p<sup>n</sup>u[−n−1]") + " بنفس الصيغ.",
      "<b>إلغاء القطب بالصفر</b>: إذا وقع صفر على قطب ألغاه. في دالة النظام يقل ترتيب النظام بواحد، وفي حاصل H·X نقول إن صفر الدخل كبت القطب."
    ],
    laws: [{ eq: "X(z)/z = A<sub>1</sub>/(z − p<sub>1</sub>) + … ,   A<sub>k</sub> = (z − p<sub>k</sub>) X(z)/z |<sub>z = p<sub>k</sub></sub>" }, { eq: "سببي: 1/(1 − pz<sup>−1</sup>) → p<sup>n</sup>u[n]      pz<sup>−1</sup>/(1 − pz<sup>−1</sup>)² → n p<sup>n</sup>u[n]" }, { eq: "A/(1 − pz<sup>−1</sup>) + A*/(1 − p*z<sup>−1</sup>) → 2|A||p|<sup>n</sup>cos(βn + α)u[n],  A = |A|e<sup>jα</sup>, p = |p|e<sup>jβ</sup>" }, { eq: "لا سببي: 1/(1 − pz<sup>−1</sup>) → −p<sup>n</sup>u[−n−1]" }, { eq: "قطب مكرر m: A<sub>k</sub> = (1/(m − k)!) d<sup>m−k</sup>/dz<sup>m−k</sup> [(z − p)<sup>m</sup>X(z)/z]<sub>z=p</sub>" }],
    when: ["حدد لكل قطب: هل الـ ROC خارجه (سببي) أم داخله (لا سببي)؟", "تحقق دائمًا بحساب أول عيّنات x[n] بالقسمة الطويلة أو التكرار."],
    ex: [
      { q: "أوجد عكس " + m("X = 1/(1 − 1.5z<sup>−1</sup> + 0.5z<sup>−2</sup>)") + "، " + m("0.5 < |z| < 1") + ".",
        s: [m("X/z = z/((z − 1)(z − 0.5)) = A<sub>1</sub>/(z − 1) + A<sub>2</sub>/(z − 0.5)") + ".", m("A<sub>1</sub> = 2") + " و " + m("A<sub>2</sub> = −1") + ".", m("X = 2/(1 − z<sup>−1</sup>) − 1/(1 − 0.5z<sup>−1</sup>)") + ". القطب 1 خارج الـ ROC من الداخل ⇐ لا سببي، و 0.5 سببي.", m("x[n] = −2u[−n−1] − (0.5)<sup>n</sup>u[n]") + "."] },
      { q: "أوجد عكس السببية " + m("X = (1 + z<sup>−1</sup>)/(1 − z<sup>−1</sup> + 0.5z<sup>−2</sup>)") + ".",
        s: ["الأقطاب " + m("0.5 ± j0.5 = (1/√2)e<sup>±jπ/4</sup>") + ".", m("A<sub>1</sub> = (z + 1)/(z − 0.5 + j0.5)|<sub>0.5+j0.5</sub> = 0.5 − j1.5 = (√10/2)e<sup>−j71.56°</sup>") + ".", m("x[n] = √10(1/√2)<sup>n</sup>cos(πn/4 − 71.565°)u[n]") + ". (تحققنا: x[0] = 1، x[1] = 2، x[2] = 1.5.)"],
        after: { x: [-1, 12], y: [-0.7, 2.3], xl: "n", yl: "x[n]", items: [{ dt: function (n) { return n < 0 ? 0 : Math.sqrt(10) * Math.pow(2, -n / 2) * Math.cos(PI * n / 4 - 71.565 * PI / 180); }, c: 3 }] } },
      { q: "أوجد عكس السببية " + m("X = 1/((1 + z<sup>−1</sup>)(1 − z<sup>−1</sup>)²)") + ".",
        s: [m("X/z = z²/((z + 1)(z − 1)²) = A<sub>1</sub>/(z + 1) + A<sub>2</sub>/(z − 1) + A<sub>3</sub>/(z − 1)²") + ".", m("A<sub>1</sub> = 1/4") + "، " + m("A<sub>3</sub> = 1/2") + "، " + m("A<sub>2</sub> = d/dz[z²/(z + 1)]<sub>z=1</sub> = 3/4") + ".", m("x[n] = (0.25(−1)<sup>n</sup> + 0.75 + 0.5n)u[n]") + ": أول القيم 1, 1, 2, 2, 3, 3."] }
    ],
    real: "عندما يصمم مهندس مرشحًا رقميًا، يتحقق من استجابته النبضية بهذا العكس قبل أن يبرمجه في الشريحة.",
    quiz: [
      S.q("<span class='ltr'>1/(1 − 0.5z<sup>−1</sup>)</span> مع <span class='ltr'>|z| < 0.5</span>:", [["<span class='ltr'>−(0.5)<sup>n</sup>u[−n−1]</span>", true, "داخل الدائرة ⇒ لا سببي."], ["<span class='ltr'>(0.5)<sup>n</sup>u[n]</span>", "conceptual", "هذا لـ |z| > 0.5."], ["<span class='ltr'>(2)<sup>n</sup>u[n]</span>", "substitution", "القطب 0.5."]]),
      S.q("لماذا نفكك X(z)/z وليس X(z)؟", [["لتظهر الحدود بشكل z/(z − p) المعروف", true, "بعد الضرب في z."], ["لأنه أسهل حسابيًا فقط", "conceptual", "السبب الشكل."], ["لا فرق", "conceptual", "يختلف الشكل الناتج."]]),
      S.q("قطب يُلغى بصفر في H(z):", [["يقل ترتيب النظام بواحد", true, "تعريف الإلغاء."], ["يصير النظام غير مستقر", "conceptual", "الإلغاء لا يضيف أقطابًا."], ["يتضاعف القطب", "conceptual", "يختفي."]])
    ],
    practice: {
      prompt: m("X(z) = 1/((1 − 0.5z<sup>−1</sup>)(1 − 0.25z<sup>−1</sup>))") + "، سببية.",
      steps: [
        S.step("s1", "معامل " + m("1/(1 − 0.5z<sup>−1</sup>)") + ".", "A =", 2, { hints: ["1/(1 − 0.25/0.5)."], sol: "1/(1 − 0.5) = 2." }),
        S.step("s2", "معامل " + m("1/(1 − 0.25z<sup>−1</sup>)") + ".", "B =", -1, { hints: ["1/(1 − 0.5/0.25)."], sol: "1/(1 − 2) = −1." }),
        S.step("s3", "قيمة " + m("x[2]") + ".", "x[2] =", 2 * 0.25 - 0.0625, { hints: ["2(0.5)² − (0.25)²."], sol: "0.5 − 0.0625 = 0.4375." })
      ]
    }
  });
})();
