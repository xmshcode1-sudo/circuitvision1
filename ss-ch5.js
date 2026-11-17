/* Signals and Systems — Chapter 5: Laplace Transform (lecture 10). */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss, P = CV.sp, PI = Math.PI;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var CH = "الفصل 5: تحويل لابلاس";
  var splane = function (band, poles, zeros, c) { return { w: 380, h: 260, x: [-4, 3], y: [-3, 3], xl: "σ", yl: "jω", grid: false, items: [band ? { band: band, c: 1 } : {}, { pz: { poles: poles || [], zeros: zeros || [] }, c: c || 2 }] }; };

  /* ================= 1. Laplace transform and ROC ================= */
  S.lesson({
    id: "ss-ch5-1", chapter: CH, ar: "تحويل لابلاس ومنطقة التقارب", en: "The Laplace Transform and the Region of Convergence", min: 30,
    obj: ["تعرّف تحويل لابلاس والمتغير s = σ + jω.", "تحدد منطقة التقارب ROC لإشارة يمينية ويسارية.", "تفهم لماذا X(s) وحده لا يكفي بدون ROC."],
    idea: [
      "رأينا أن " + m("e<sup>st</sup> → H(s)e<sup>st</sup>") + " حيث " + m("H(s) = ∫h(t)e<sup>−st</sup>dt") + ". ولأي إشارة: " + m("X(s) = ∫x(t)e<sup>−st</sup>dt") + "، و s مركّب " + m("s = σ + jω") + ". تحويل فورييه حالة خاصة عند σ = 0.",
      "قيم s التي يتقارب عندها التكامل تسمى <b>منطقة التقارب</b> (ROC). مثلًا " + m("e<sup>−at</sup>u(t) ↔ 1/(s + a)") + " مع " + m("Re{s} > −a") + "، لأن " + m("e<sup>−(s+a)t</sup> → 0") + " فقط إذا كان " + m("Re{s + a} > 0") + ".",
      "و " + m("−e<sup>−at</sup>u(−t)") + " تعطي <b>نفس</b> " + m("1/(s + a)") + " لكن مع " + m("Re{s} < −a") + ". إذن نفس الصيغة لإشارتين مختلفتين، والفرق في ROC فقط؛ لذلك يجب ذكر ROC دائمًا."
    ],
    figs: [
      { plot: splane([-1, 3], [[-1, 0]]), cap: "e^(−at)u(t), a = 1: الـ ROC يمين الخط Re{s} = −a." },
      { plot: splane([-4, -1], [[-1, 0]]), cap: "−e^(−at)u(−t): نفس X(s) لكن الـ ROC يسار الخط." }
    ],
    laws: [{ eq: "X(s) = ∫<sub>−∞</sub><sup>∞</sup> x(t) e<sup>−st</sup> dt,   s = σ + jω" }, { eq: "e<sup>−at</sup>u(t) ↔ 1/(s + a),   Re{s} > −a" }, { eq: "−e<sup>−at</sup>u(−t) ↔ 1/(s + a),   Re{s} < −a" }],
    when: ["إشارة يمينية (تبدأ عند زمن ما وتستمر) ⇐ ROC يمين خط.", "إشارة يسارية ⇐ ROC يسار خط.", "لمجموع إشارات: ROC تقاطع مناطقها."],
    ex: [
      { q: "أوجد تحويل لابلاس لـ " + m("x(t) = 3e<sup>−2t</sup>u(t) − 2e<sup>−t</sup>u(t)") + ".",
        s: [m("e<sup>−t</sup>u(t) ↔ 1/(s + 1),  Re{s} > −1") + " و " + m("e<sup>−2t</sup>u(t) ↔ 1/(s + 2),  Re{s} > −2") + ".", m("X = 3/(s + 2) − 2/(s + 1) = (s − 1)/(s² + 3s + 2)") + ".", "ROC تقاطع المنطقتين: " + m("Re{s} > −1") + "."],
        after: splane([-1, 3], [[-1, 0], [-2, 0]], [[1, 0]]) }
    ],
    real: "مهندس التحكم يقرأ استقرار نظام طائرة أو روبوت من موقع أقطاب H(s) في مستوى s، وهو ما يبنيه هذا الفصل.",
    quiz: [
      S.q("تحويل فورييه هو تحويل لابلاس عند:", [["<span class='ltr'>σ = 0</span> (s = jω)", true, "على المحور التخيلي."], ["<span class='ltr'>ω = 0</span>", "conceptual", "هذا على المحور الحقيقي."], ["<span class='ltr'>s = 1</span>", "conceptual", "ليس عند نقطة."]]),
      S.q("<span class='ltr'>e<sup>−4t</sup>u(t)</span>. الـ ROC:", [["<span class='ltr'>Re{s} > −4</span>", true, "يمين −a."], ["<span class='ltr'>Re{s} < −4</span>", "sign", "هذا لليسارية."], ["<span class='ltr'>Re{s} > 4</span>", "sign", "الخط عند −a = −4."]]),
      S.q("إشارتان مختلفتان لهما نفس <span class='ltr'>X(s)</span>. يميّز بينهما:", [["منطقة التقارب", true, "ROC."], ["لا شيء", "conceptual", "الـ ROC يميزهما."], ["قيمة X(0)", "conceptual", "X نفسها متطابقة."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x(t) = e<sup>−3t</sup>u(t) + e<sup>−5t</sup>u(t)") + ".",
      steps: [
        S.step("s1", m("X(0)") + " =", "X(0) =", 1 / 3 + 1 / 5, { hints: ["1/(s + 3) + 1/(s + 5) عند s = 0."], sol: "1/3 + 1/5 ≈ 0.533." }),
        S.step("s2", "حد الـ ROC: " + m("Re{s} > σ") + "، ما σ؟", "σ =", -3, { hints: ["تقاطع Re > −3 و Re > −5."], sol: "−3.", diag: [{ value: -5, type: "conceptual", why: "التقاطع هو الأضيق: Re{s} > −3." }] }),
        S.step("s3", "بسط X(s) بعد التوحيد: " + m("2s + b") + ". ما b؟", "b =", 8, { hints: ["(s + 5) + (s + 3)."], sol: "2s + 8 ⇒ b = 8." })
      ]
    }
  });

  /* ================= 2. Poles, zeros, ROC properties, pairs ================= */
  S.lesson({
    id: "ss-ch5-2", chapter: CH, ar: "الأقطاب والأصفار وخواص ROC والأزواج الشائعة", en: "Poles, Zeros, ROC Properties and Common Pairs", min: 35,
    obj: ["تجد الأقطاب والأصفار وترسمها في مستوى s.", "تطبق خواص ROC الخمس.", "تجد كل الإشارات الممكنة لنفس X(s)."],
    idea: [
      "X(s) غالبًا نسبة كثيرتي حدود. جذور البسط <b>أصفار</b> (o) و جذور المقام <b>أقطاب</b> (×). تكون X <b>صحيحة</b> (proper) إذا درجة المقام أكبر من البسط. الأقطاب دائمًا <b>خارج</b> ROC لأن X لا نهائية عندها، أما الأصفار فقد تكون داخلها أو خارجها.",
      "خواص ROC: (1) لا تحوي أقطابًا. (2) إشارة محدودة المدة ⇐ كل المستوى (إلا ربما 0 أو ∞). (3) يمينية ⇐ " + m("Re{s} > σ<sub>max</sub>") + " (يمين أقصى قطب). (4) يسارية ⇐ " + m("Re{s} < σ<sub>min</sub>") + ". (5) ثنائية الجانب ⇐ شريط " + m("σ<sub>1</sub> < Re{s} < σ<sub>2</sub>") + " بين قطبين."
    ],
    widget: { type: "roc" },
    laws: [{ eq: "X(s) = (a<sub>0</sub>/b<sub>0</sub>)(s − z<sub>1</sub>)…(s − z<sub>m</sub>) / ((s − p<sub>1</sub>)…(s − p<sub>n</sub>))" }, { eq: "δ(t) ↔ 1 (كل s)   u(t) ↔ 1/s   t u(t) ↔ 1/s²   t<sup>k</sup>u(t) ↔ k!/s<sup>k+1</sup>   (Re s > 0)" }, { eq: "t e<sup>−at</sup>u(t) ↔ 1/(s + a)²   (Re s > −a)" }, { eq: "cos ω<sub>0</sub>t u(t) ↔ s/(s² + ω<sub>0</sub>²)      sin ω<sub>0</sub>t u(t) ↔ ω<sub>0</sub>/(s² + ω<sub>0</sub>²)" }, { eq: "e<sup>−at</sup>cos ω<sub>0</sub>t u(t) ↔ (s + a)/((s + a)² + ω<sub>0</sub>²)      e<sup>−at</sup>sin ω<sub>0</sub>t u(t) ↔ ω<sub>0</sub>/((s + a)² + ω<sub>0</sub>²)" }],
    when: ["n قطب على المحور الحقيقي ⇐ n + 1 منطقة تقارب ممكنة، ولكل منها إشارة.", "حدّد نوع الإشارة من الـ ROC: يمين كل الأقطاب يمينية، يسارها يسارية، بينها ثنائية."],
    ex: [
      { q: "أوجد الأصفار والأقطاب لـ " + m("X = (2s + 4)/(s² + 4s + 3)") + "، Re{s} > −1.",
        s: [m("X = 2(s + 2)/((s + 1)(s + 3))") + ".", "صفر عند −2، وقطبان عند −1 و −3، ومعامل 2. والـ ROC يمين −1 (أقصى قطب)."],
        after: splane([-1, 3], [[-1, 0], [-3, 0]], [[-2, 0]]) },
      { q: "لـ " + m("X = 1/((s + 1)(s + 2))") + " أوجد كل الإشارات الممكنة.",
        s: [m("X = 1/(s + 1) − 1/(s + 2)") + ".", m("Re{s} > −1") + ": " + m("x = e<sup>−t</sup>u(t) − e<sup>−2t</sup>u(t)") + " (يمينية).", m("−2 < Re{s} < −1") + ": " + m("x = −e<sup>−t</sup>u(−t) − e<sup>−2t</sup>u(t)") + " (ثنائية).", m("Re{s} < −2") + ": " + m("x = −e<sup>−t</sup>u(−t) + e<sup>−2t</sup>u(−t)") + " (يسارية)."] }
    ],
    real: "عند تصميم مرشح تناظري، نضع أصفاره عند الترددات التي نريد حذفها (مثل 60 Hz) وأقطابه حيث نريد الاستجابة.",
    quiz: [
      S.q("الأقطاب بالنسبة للـ ROC:", [["دائمًا خارجها", true, "X لا نهائية عند القطب."], ["دائمًا داخلها", "conceptual", "مستحيل."], ["قد تكون داخلها", "conceptual", "هذا للأصفار."]]),
      S.q("إشارة محدودة المدة. الـ ROC:", [["كل المستوى تقريبًا", true, "خاصية 2."], ["يمين خط", "conceptual", "هذا لليمينية اللانهائية."], ["شريط", "conceptual", "هذا للثنائية."]]),
      S.q("<span class='ltr'>sin(3t)u(t)</span> ↔", [["<span class='ltr'>3/(s² + 9)</span>", true, "ω0/(s² + ω0²)."], ["<span class='ltr'>s/(s² + 9)</span>", "formula", "هذا لـ cos."], ["<span class='ltr'>3/(s² + 3)</span>", "substitution", "ω0² = 9."]])
    ],
    practice: {
      prompt: m("X(s) = (s + 4)/(s² + 6s + 5)") + "، وإشارتها يمينية.",
      steps: [
        S.step("s1", "القطب الأقرب لليمين (الأكبر).", "p =", -1, { hints: ["s² + 6s + 5 = (s + 1)(s + 5)."], sol: "−1." }),
        S.step("s2", "الصفر.", "z =", -4, { hints: ["s + 4 = 0."], sol: "−4." }),
        S.step("s3", "الـ ROC: " + m("Re{s} > σ") + "؛ σ =", "σ =", -1, { hints: ["يمين أقصى قطب."], sol: "−1.", diag: [{ value: -5, type: "conceptual", why: "اليمينية يمين أقصى قطب (−1)." }] })
      ]
    }
  });

  /* ================= 3. Properties ================= */
  S.lesson({
    id: "ss-ch5-3", chapter: CH, ar: "خواص تحويل لابلاس", en: "Properties of the Laplace Transform", min: 30,
    obj: ["تطبق الخطية والإزاحة في الزمن وفي s.", "تطبق التحجيم والانعكاس والاشتقاق والتكامل.", "تعرف كيف تتغيّر الـ ROC مع كل خاصية."],
    idea: [
      "الخواص تشبه خواص فورييه مع متابعة الـ ROC: <b>الخطية</b> ROC تحوي التقاطع على الأقل. <b>إزاحة الزمن</b> " + m("x(t − t<sub>0</sub>) ↔ e<sup>−st0</sup>X(s)") + " بنفس ROC. <b>الإزاحة في s</b> " + m("e<sup>s0t</sup>x(t) ↔ X(s − s<sub>0</sub>)") + " وتنزاح الـ ROC بـ Re{s0}.",
      "<b>التحجيم</b> " + m("x(at) ↔ (1/|a|)X(s/a)") + " والـ ROC aR. <b>الانعكاس</b> " + m("x(−t) ↔ X(−s)") + " والـ ROC −R. <b>الاشتقاق</b> " + m("dx/dt ↔ sX") + "، و " + m("−t x(t) ↔ dX/ds") + ". <b>التكامل</b> " + m("∫<sub>−∞</sub><sup>t</sup>x ↔ X/s") + " مع ROC ∩ {Re s > 0}. <b>الالتفاف</b> " + m("x<sub>1</sub> * x<sub>2</sub> ↔ X<sub>1</sub>X<sub>2</sub>") + "."
    ],
    laws: [{ eq: "a<sub>1</sub>x<sub>1</sub> + a<sub>2</sub>x<sub>2</sub> ↔ a<sub>1</sub>X<sub>1</sub> + a<sub>2</sub>X<sub>2</sub>,  R' ⊇ R<sub>1</sub> ∩ R<sub>2</sub>" }, { eq: "x(t − t<sub>0</sub>) ↔ e<sup>−st0</sup>X(s),  R" }, { eq: "e<sup>s0t</sup>x(t) ↔ X(s − s<sub>0</sub>),  R + Re{s<sub>0</sub>}" }, { eq: "x(at) ↔ (1/|a|)X(s/a),  aR      x(−t) ↔ X(−s),  −R" }, { eq: "dx/dt ↔ sX(s)      −t x(t) ↔ dX/ds      ∫<sub>−∞</sub><sup>t</sup>x(τ)dτ ↔ X(s)/s" }, { eq: "x<sub>1</sub> * x<sub>2</sub> ↔ X<sub>1</sub>(s)X<sub>2</sub>(s),  R' ⊇ R<sub>1</sub> ∩ R<sub>2</sub>" }],
    when: ["e<sup>−at</sup> مضروبة في إشارة معروفة ⇐ إزاحة في s: استبدل s بـ s + a.", "t مضروبة في إشارة ⇐ اشتق X بالنسبة لـ s مع إشارة سالبة."],
    ex: [
      { q: "استخدم خاصية الاشتقاق في s لإثبات " + m("te<sup>−at</sup>u(t) ↔ 1/(s + a)²") + ".",
        s: [m("e<sup>−at</sup>u(t) ↔ 1/(s + a)") + ".", m("−t x(t) ↔ dX/ds = −1/(s + a)²") + ".", "بالضرب في −1: " + m("t e<sup>−at</sup>u(t) ↔ 1/(s + a)²") + "، Re{s} > −a."] },
      { q: "من " + m("cos ω<sub>0</sub>t u(t) ↔ s/(s² + ω<sub>0</sub>²)") + " أوجد تحويل " + m("e<sup>−at</sup>cos ω<sub>0</sub>t u(t)") + ".",
        s: ["إزاحة في s بـ " + m("s<sub>0</sub> = −a") + ": نستبدل s بـ s + a.", m("(s + a)/((s + a)² + ω<sub>0</sub>²)") + "، Re{s} > −a."] }
    ],
    real: "خاصية الاشتقاق تجعل المعادلات التفاضلية للدوائر معادلات جبرية في s؛ هذا ما يجعل تحليل دوائر RLC أسهل بكثير.",
    quiz: [
      S.q("<span class='ltr'>x(t − 2)</span> ↔", [["<span class='ltr'>e<sup>−2s</sup>X(s)</span>", true, "إزاحة الزمن."], ["<span class='ltr'>X(s − 2)</span>", "conceptual", "هذا لـ e<sup>2t</sup>x(t)."], ["<span class='ltr'>e<sup>2s</sup>X(s)</span>", "sign", "التأخير إشارة سالبة."]]),
      S.q("<span class='ltr'>dx/dt</span> ↔", [["<span class='ltr'>sX(s)</span>", true, "خاصية الاشتقاق."], ["<span class='ltr'>X(s)/s</span>", "formula", "هذا للتكامل."], ["<span class='ltr'>dX/ds</span>", "formula", "هذا لـ −t x(t)."]]),
      S.q("التحويل عبر الالتفاف:", [["حاصل ضرب التحويلين", true, "X1·X2."], ["مجموعهما", "conceptual", "المجموع للخطية."], ["التفافهما", "conceptual", "الضرب في s."]])
    ],
    practice: {
      prompt: "أوجد تحويل " + m("x(t) = e<sup>−2t</sup>sin(3t)u(t)") + ".",
      steps: [
        S.step("s1", "بسط التحويل (ثابت).", "=", 3, { hints: ["ω0/((s + a)² + ω0²)."], sol: "3." }),
        S.step("s2", "قيمة التحويل عند s = 0.", "X(0) =", 3 / 13, { hints: ["3/(4 + 9)."], sol: "3/13 ≈ 0.231." }),
        S.step("s3", "حد الـ ROC: Re{s} > σ؛ σ =", "σ =", -2, { hints: ["الإزاحة في s بـ −2."], sol: "−2." })
      ]
    }
  });

  /* ================= 4. Inverse Laplace ================= */
  S.lesson({
    id: "ss-ch5-4", chapter: CH, ar: "تحويل لابلاس العكسي", en: "The Inverse Laplace Transform", min: 40,
    obj: ["تجد معاملات الكسور الجزئية لأقطاب بسيطة.", "تتعامل مع الأقطاب المركّبة والمكررة.", "تستخدم القسمة الطويلة لدالة غير صحيحة."],
    idea: [
      "العكس رسميًا تكامل في المستوى المركّب، لكن لـ X نسبية نتجنبه بـ<b>الكسور الجزئية</b>: لأقطاب بسيطة " + m("X = c<sub>1</sub>/(s − p<sub>1</sub>) + … ") + " مع " + m("c<sub>k</sub> = (s − p<sub>k</sub>)X(s)|<sub>s=pk</sub>") + "، ثم كل حد يعود أسّية حسب الـ ROC.",
      "للقطب المكرر r مرات: حدود " + m("λ<sub>1</sub>/(s − p) + … + λ<sub>r</sub>/(s − p)<sup>r</sup>") + " مع " + m("λ<sub>r−k</sub> = (1/k!)d<sup>k</sup>/ds<sup>k</sup>[(s − p)<sup>r</sup>X]<sub>s=p</sub>") + ". وإذا كانت X غير صحيحة (m ≥ n) نقسم قسمة طويلة " + m("X = Q(s) + R(s)/D(s)") + " و " + m("s<sup>k</sup> ↔ d<sup>k</sup>δ/dt<sup>k</sup>") + "."
    ],
    laws: [{ eq: "c<sub>k</sub> = (s − p<sub>k</sub>) X(s) |<sub>s = p<sub>k</sub></sub>" }, { eq: "λ<sub>r−k</sub> = (1/k!) d<sup>k</sup>/ds<sup>k</sup> [(s − p<sub>i</sub>)<sup>r</sup> X(s)] |<sub>s = p<sub>i</sub></sub>" }, { eq: "d<sup>k</sup>δ(t)/dt<sup>k</sup> ↔ s<sup>k</sup>" }],
    when: ["تحقق أولًا: هل X صحيحة؟ إن لم تكن، اقسم.", "القطبان المركّبان مترافقان، ومعاملاهما مترافقان: احسب واحدًا فقط."],
    ex: [
      { q: "أوجد x(t) لـ " + m("X = (s + 2)/(s³ + 4s² + 3s)") + "، Re{s} > 0.",
        s: [m("X = (s + 2)/(s(s + 1)(s + 3)) = c<sub>1</sub>/s + c<sub>2</sub>/(s + 1) + c<sub>3</sub>/(s + 3)") + ".", m("c<sub>1</sub> = sX|<sub>0</sub> = 2/3") + "، " + m("c<sub>2</sub> = (s + 1)X|<sub>−1</sub> = −½") + "، " + m("c<sub>3</sub> = (s + 3)X|<sub>−3</sub> = −1/6") + ".", m("x(t) = (2/3)u(t) − ½e<sup>−t</sup>u(t) − (1/6)e<sup>−3t</sup>u(t)") + "."] },
      { q: "أوجد x(t) لـ " + m("X = (s² − 2s + 1)/(s³ + 3s² + 4s + 2)") + "، Re{s} > −1.",
        s: ["المقام " + m("(s + 1 − j)(s + 1 + j)(s + 1)") + ".", m("c<sub>1</sub> = −3/2 + j2") + " عند " + m("−1 + j") + "، و " + m("c<sub>2</sub> = c<sub>1</sub>* = −3/2 − j2") + "، و " + m("c<sub>3</sub> = 4") + " عند −1.", m("x = (−3/2 + j2)e<sup>(−1+j)t</sup>u + (−3/2 − j2)e<sup>(−1−j)t</sup>u + 4e<sup>−t</sup>u") + ".", "وبجمع المترافقين: " + m("x = e<sup>−t</sup>(4 − 3cos t − 4sin t)u(t)") + "."] },
      { q: "أوجد عكس " + m("X = (s³ + 2s² + 6)/(s² + 3s)") + "، Re{s} > 0.",
        s: ["قسمة طويلة: " + m("X = s − 1 + (3s + 6)/(s(s + 3))") + ".", m("c<sub>1</sub> = (3s + 6)/(s + 3)|<sub>0</sub> = 2") + "، " + m("c<sub>2</sub> = (3s + 6)/s|<sub>−3</sub> = 1") + ".", m("x(t) = δ'(t) − δ(t) + (2 + e<sup>−3t</sup>)u(t)") + "."] }
    ],
    real: "برامج تحليل الدوائر (مثل SPICE) والأنظمة الرمزية تقوم بالضبط بهذه الكسور الجزئية لتعطيك الاستجابة الزمنية.",
    quiz: [
      S.q("<span class='ltr'>X = 5/(s + 2)</span>, Re{s} > −2. فإن x:", [["<span class='ltr'>5e<sup>−2t</sup>u(t)</span>", true, "يمينية."], ["<span class='ltr'>−5e<sup>−2t</sup>u(−t)</span>", "conceptual", "هذا لـ Re{s} < −2."], ["<span class='ltr'>5e<sup>2t</sup>u(t)</span>", "sign", "القطب −2."]]),
      S.q("<span class='ltr'>X = (s + 1)/(s(s + 2))</span>. معامل <span class='ltr'>1/s</span>:", [["<span class='ltr'>1/2</span>", true, "(s + 1)/(s + 2) عند 0."], ["1", "substitution", "عوّض في كل الباقي."], ["<span class='ltr'>−1/2</span>", "sign", "هذا معامل 1/(s + 2)."]]),
      S.q("X غير صحيحة (درجة البسط ≥ المقام). أول خطوة:", [["القسمة الطويلة", true, "ثم كسور جزئية للباقي."], ["الكسور الجزئية مباشرة", "formula", "تحتاج دالة صحيحة."], ["لا يوجد عكس", "conceptual", "يوجد مع دفعات ومشتقاتها."]])
    ],
    practice: {
      prompt: m("X(s) = (3s + 7)/((s + 1)(s + 3))") + "، Re{s} > −1.",
      steps: [
        S.step("s1", "معامل " + m("1/(s + 1)") + ".", "c1 =", 2, { hints: ["(3s + 7)/(s + 3) عند s = −1."], sol: "4/2 = 2." }),
        S.step("s2", "معامل " + m("1/(s + 3)") + ".", "c2 =", 1, { hints: ["(3s + 7)/(s + 1) عند s = −3."], sol: "(−2)/(−2) = 1.", diag: [{ value: -1, type: "sign", why: "−9 + 7 = −2 و −3 + 1 = −2، والقسمة موجبة." }] }),
        S.step("s3", "قيمة x(t) عند t = 0⁺.", "x(0+) =", 3, { hints: ["2 + 1."], sol: "x = 2e<sup>−t</sup> + e<sup>−3t</sup> ⇒ 3." })
      ]
    }
  });

  /* ================= 5. System function ================= */
  S.lesson({
    id: "ss-ch5-5", chapter: CH, ar: "دالة النظام: السببية والاستقرار والمعادلات التفاضلية", en: "The System Function: Causality, Stability, LCCDE", min: 40,
    obj: ["تعرّف دالة النظام H(s) = Y/X.", "تحكم على السببية والاستقرار من الأقطاب والـ ROC.", "تجد H(s) من معادلة تفاضلية وتحكم على النظام العكسي."],
    idea: [
      "خرج نظام LTI " + m("y = x * h") + "، وبخاصية الالتفاف " + m("Y(s) = X(s)H(s)") + ". التحويل " + m("H(s)") + " يسمى <b>دالة النظام</b> أو <b>دالة النقل</b>. ونظامان على التوالي " + m("H<sub>1</sub>H<sub>2</sub>") + " وعلى التوازي " + m("H<sub>1</sub> + H<sub>2</sub>") + ".",
      "<b>السببية</b>: h يمينية ⇐ ROC يمين أقصى قطب. <b>الاستقرار</b>: " + m("∫|h| < ∞") + " ⇐ ROC تحوي المحور jω. إذن نظام <b>سببي ومستقر</b> ⇐ كل الأقطاب في النصف الأيسر من مستوى s.",
      "لمعادلة تفاضلية " + m("H(s) = Σb<sub>k</sub>s<sup>k</sup> / Σa<sub>k</sub>s<sup>k</sup>") + "، والـ ROC يحددها السياق (سببي، مستقر…)."
    ],
    laws: [{ eq: "Y(s) = X(s) H(s)" }, { eq: "سببي: ROC يمين أقصى قطب      مستقر: ROC تحوي المحور jω" }, { eq: "سببي ومستقر ⇔ كل الأقطاب في Re{s} < 0" }, { eq: "H(s) = Σ<sub>k=0</sub><sup>M</sup> b<sub>k</sub>s<sup>k</sup> / Σ<sub>k=0</sub><sup>N</sup> a<sub>k</sub>s<sup>k</sup>" }, { eq: "توالي: H<sub>1</sub>H<sub>2</sub>      توازي: H<sub>1</sub> + H<sub>2</sub>" }],
    when: ["لاختبار الاستقرار: هل المحور jω داخل الـ ROC؟", "النظام العكسي H<sup>−1</sup> = 1/H: أصفار H تصير أقطابه. إذا كان لـ H صفر في النصف الأيمن فالعكس لا يكون سببيًا ومستقرًا معًا."],
    ex: [
      { q: "نظام " + m("H = (s − 1)/((s + 1)(s − 2))") + ". أوجد h إذا كان: سببيًا، مستقرًا، لا سببيًا ولا مستقرًا.",
        s: [m("H = (2/3)/(s + 1) + (1/3)/(s − 2)") + ".", "سببي (Re{s} > 2): " + m("h = (2/3)e<sup>−t</sup>u(t) + (1/3)e<sup>2t</sup>u(t)") + " — غير مستقر.", "مستقر (−1 < Re{s} < 2): " + m("h = (2/3)e<sup>−t</sup>u(t) − (1/3)e<sup>2t</sup>u(−t)") + " — غير سببي.", "لا هذا ولا ذاك (Re{s} < −1): " + m("h = −(2/3)e<sup>−t</sup>u(−t) − (1/3)e<sup>2t</sup>u(−t)") + "."],
        after: splane([-1, 2], [[-1, 0], [2, 0]], [[1, 0]]) },
      { q: "نظام " + m("y' + 2y = x'' + 2x' − 3x") + ". هل يوجد له نظام عكسي سببي ومستقر؟",
        s: [m("H = (s² + 2s − 3)/(s + 2)") + ".", m("H<sup>−1</sup> = (s + 2)/(s² + 2s − 3) = (s + 2)/((s − 1)(s + 3))") + ".", "قطب العكس عند s = +1 في النصف الأيمن: السببي يمين 1 (لا يحوي jω) ⇐ <b>لا يمكن</b> أن يكون سببيًا ومستقرًا معًا."] }
    ],
    real: "مخمّد السيارة: إذا أصبح أحد أقطاب نظامه في النصف الأيمن (مثلًا بإعدادات خاطئة) تتذبذب السيارة وتزداد بدل أن تهدأ.",
    quiz: [
      S.q("نظام سببي ومستقر. أقطابه:", [["كلها في النصف الأيسر", true, "Re{p} < 0."], ["كلها في النصف الأيمن", "sign", "هذا غير مستقر سببيًا."], ["على المحور jω", "conceptual", "هذا حد الاستقرار."]]),
      S.q("شرط الاستقرار على الـ ROC:", [["تحوي المحور jω", true, "حتى يوجد تحويل فورييه لـ h."], ["يمين أقصى قطب", "conceptual", "هذا للسببية."], ["كل المستوى", "conceptual", "أوسع مما يلزم."]]),
      S.q("نظامان على التوالي H1 و H2:", [["<span class='ltr'>H1·H2</span>", true, "الالتفاف ضرب."], ["<span class='ltr'>H1 + H2</span>", "formula", "هذا للتوازي."], ["<span class='ltr'>H1/H2</span>", "formula", "لا قسمة."]])
    ],
    practice: {
      prompt: "نظام سببي " + m("H(s) = 4/((s + 2)(s − 1))") + ".",
      steps: [
        S.choice("s1", "هل هو مستقر؟", [{ t: "لا", correct: true, why: "قطب عند +1 والـ ROC السببي Re > 1 لا يحوي jω." }, { t: "نعم", type: "conceptual", why: "قطب في النصف الأيمن." }], { sol: "غير مستقر." }),
        S.step("s2", "معامل " + m("1/(s − 1)") + ".", "=", 4 / 3, { hints: ["4/(s + 2) عند s = 1."], sol: "4/3 ≈ 1.333." }),
        S.step("s3", "معامل " + m("1/(s + 2)") + ".", "=", -4 / 3, { hints: ["4/(s − 1) عند s = −2."], sol: "−4/3." })
      ]
    }
  });

  /* ================= 6. Unilateral Laplace and transform circuits ================= */
  S.lesson({
    id: "ss-ch5-6", chapter: CH, ar: "تحويل لابلاس الأحادي ودوائر مجال s", en: "The Unilateral Laplace Transform and Transform Circuits", min: 40,
    obj: ["تعرّف التحويل الأحادي من 0⁻.", "تطبق خاصية الاشتقاق مع الشروط الابتدائية.", "تحسب استجابة الدخل الصفري والحالة الصفرية وتنمذج R و L و C في مجال s."],
    idea: [
      "التحويل الأحادي " + m("X<sub>I</sub>(s) = ∫<sub>0<sup>−</sup></sub><sup>∞</sup> x(t)e<sup>−st</sup>dt") + " يتجاهل t < 0، ونبدأ من " + m("0<sup>−</sup>") + " لنشمل δ(t) عند الصفر. الـ ROC دائمًا نصف مستوى أيمن. فائدته: حل نظم سببية بمعادلات تفاضلية لها <b>شروط ابتدائية غير صفرية</b>.",
      "خاصية الاشتقاق هنا تحمل الشروط: " + m("dx/dt ↔ sX<sub>I</sub> − x(0<sup>−</sup>)") + " و " + m("d²x/dt² ↔ s²X<sub>I</sub> − sx(0<sup>−</sup>) − x'(0<sup>−</sup>)") + ". والخرج = <b>استجابة الحالة الصفرية</b> (الشروط صفر) + <b>استجابة الدخل الصفري</b> (الدخل صفر).",
      "في الدوائر: " + m("V = RI") + "؛ للملف " + m("V = sLI − Li(0<sup>−</sup>)") + " (مصدر جهد متوالٍ)؛ وللمكثف " + m("I = sCV − Cv(0<sup>−</sup>)") + " أو " + m("V = I/(sC) + v(0<sup>−</sup>)/s") + ". فنحل الدائرة جبريًا بدون معادلات تكاملية تفاضلية."
    ],
    laws: [{ eq: "X<sub>I</sub>(s) = ∫<sub>0<sup>−</sup></sub><sup>∞</sup> x(t) e<sup>−st</sup> dt" }, { eq: "dx/dt ↔ sX<sub>I</sub> − x(0<sup>−</sup>)      d²x/dt² ↔ s²X<sub>I</sub> − sx(0<sup>−</sup>) − x'(0<sup>−</sup>)" }, { eq: "∫<sub>0<sup>−</sup></sub><sup>t</sup> x dτ ↔ X<sub>I</sub>/s" }, { eq: "R: V = RI     L: V = sLI − Li(0<sup>−</sup>)     C: V = I/(sC) + v(0<sup>−</sup>)/s" }],
    when: ["معادلة تفاضلية مع y(0⁻) أو y'(0⁻) معطاة ⇐ التحويل الأحادي.", "H(s) = Y/X تُعرّف دائمًا والنظام ساكن (الشروط صفر)."],
    ex: [
      { q: "حل " + m("y'' + 3y' + 2y = x") + " مع " + m("y(0<sup>−</sup>) = β, y'(0<sup>−</sup>) = γ") + " والدخل " + m("x = αu(t)") + "، ثم عوّض " + m("β = 3, γ = −5, α = 2") + ".",
        s: [m("s²Y − βs − γ + 3sY − 3β + 2Y = α/s") + ".", m("Y = α/(s(s + 1)(s + 2)) + β(s + 3)/((s + 1)(s + 2)) + γ/((s + 1)(s + 2))") + ". الحد الأول حالة صفرية، والباقي دخل صفري.", "الدخل الصفري: " + m("(3(s + 3) − 5)/((s + 1)(s + 2)) = 1/(s + 1) + 2/(s + 2)") + " ⇐ " + m("e<sup>−t</sup> + 2e<sup>−2t</sup>") + ".", "الحالة الصفرية: " + m("2/(s(s + 1)(s + 2)) = 1/s − 2/(s + 1) + 1/(s + 2)") + " ⇐ " + m("u − 2e<sup>−t</sup> + e<sup>−2t</sup>") + ".", m("y(t) = u(t) − e<sup>−t</sup>u(t) + 3e<sup>−2t</sup>u(t)") + ": u(t) حالة مستقرة والباقي عابر."],
        after: { x: [-0.5, 6], y: [-0.2, 3.3], xl: "t", yl: "y(t)", items: [{ ct: function (t) { return t < 0 ? NaN : 1 - Math.exp(-t) + 3 * Math.exp(-2 * t); }, c: 3 }, { hline: 1, c: 4, label: "الحالة المستقرة" }] } }
    ],
    real: "عند تشغيل دائرة فيها مكثف مشحون مسبقًا، الجهد الابتدائي يظهر كمصدر v(0⁻)/s متوالٍ في دائرة مجال s.",
    quiz: [
      S.q("التحويل الأحادي لـ <span class='ltr'>dy/dt</span>:", [["<span class='ltr'>sY − y(0<sup>−</sup>)</span>", true, "الشرط الابتدائي يظهر."], ["<span class='ltr'>sY</span>", "conceptual", "هذا الثنائي."], ["<span class='ltr'>sY + y(0<sup>−</sup>)</span>", "sign", "إشارة الشرط سالبة."]]),
      S.q("استجابة الدخل الصفري تعتمد على:", [["الشروط الابتدائية فقط", true, "الدخل صفر."], ["الدخل فقط", "conceptual", "هذا الحالة الصفرية."], ["لا شيء", "conceptual", "تعتمد على الشروط."]]),
      S.q("مكثف عليه <span class='ltr'>v(0<sup>−</sup>)</span>. في مجال s:", [["<span class='ltr'>1/(sC)</span> متوالية مع مصدر <span class='ltr'>v(0<sup>−</sup>)/s</span>", true, "V = I/(sC) + v(0⁻)/s."], ["<span class='ltr'>sC</span> فقط", "conceptual", "نسيت الشحنة الابتدائية."], ["<span class='ltr'>sL</span>", "conceptual", "هذا للملف."]])
    ],
    practice: {
      prompt: "النظام " + m("y' + 3y = 0") + " مع " + m("y(0<sup>−</sup>) = 4") + ".",
      steps: [
        S.step("s1", "بعد التحويل " + m("Y = A/(s + 3)") + ". ما A؟", "A =", 4, { hints: ["sY − 4 + 3Y = 0."], sol: "Y = 4/(s + 3)." }),
        S.step("s2", "قيمة y عند t = 1.", "y(1) =", 4 * Math.exp(-3), { hints: ["y = 4e<sup>−3t</sup>."], sol: "4e<sup>−3</sup> ≈ 0.199." }),
        S.choice("s3", "هذه الاستجابة:", [{ t: "استجابة دخل صفري", correct: true, why: "لا يوجد دخل." }, { t: "استجابة حالة صفرية", type: "conceptual", why: "الشرط الابتدائي غير صفري والدخل صفر." }], { sol: "دخل صفري." })
      ]
    }
  });
})();
