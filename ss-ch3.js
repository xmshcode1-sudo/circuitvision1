/* Signals and Systems — Chapter 3: Fourier Series (lecture 06). */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss, P = CV.sp, PI = Math.PI;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var CH = "الفصل 3: متسلسلة فورييه";
  var pulse = function (T, T0) { return function (t) { var u = ((t % T0) + T0) % T0; return u <= T || u >= T0 - T ? 1 : 0; }; };

  /* ================= 1. Eigenfunctions and the CTFS ================= */
  S.lesson({
    id: "ss-ch3-1", chapter: CH, ar: "استجابة LTI للأسّية المركّبة ومتسلسلة فورييه المستمرة", en: "LTI Response to Complex Exponentials and the CT Fourier Series", min: 35,
    obj: ["تفسر لماذا الأسّية المركّبة دالة ذاتية لنظم LTI.", "تكتب معادلتي التركيب والتحليل لمتسلسلة فورييه.", "تحسب معاملات c_k لقطار نبضات مستطيلة."],
    idea: [
      "نريد إشارات أساسية تحقق شرطين: استجابة النظام لها بسيطة، ونقدر نبني منها إشارات كثيرة. الأسّية المركّبة تحقق الشرطين: " + m("e<sup>st</sup> → H(s)e<sup>st</sup>") + " حيث " + m("H(s) = ∫h(τ)e<sup>−sτ</sup>dτ") + " (تحويل لابلاس لـ h). أي الخرج نفس الدخل مضروبًا في ثابت: " + m("e<sup>st</sup>") + " <b>دالة ذاتية</b> و H(s) <b>قيمة ذاتية</b>. وفي المتقطع " + m("z<sup>n</sup> → H(z)z<sup>n</sup>") + ".",
      "إذن إذا كتبنا الدخل " + m("x = Σ a<sub>k</sub>e<sup>s<sub>k</sub>t</sup>") + " فالخرج " + m("y = Σ a<sub>k</sub>H(s<sub>k</sub>)e<sup>s<sub>k</sub>t</sup>") + ". هذا تمثيل فورييه، وله أربعة أشكال: CTFS و DTFS و CTFT و DTFT.",
      "أي إشارة دورية x(t) بزمن T0 تُكتب " + m("x(t) = Σ c<sub>k</sub>e<sup>jkω0t</sup>") + " (التركيب)، و " + m("c<sub>k</sub> = (1/T<sub>0</sub>)∫<sub>T0</sub> x(t)e<sup>−jkω0t</sup>dt") + " (التحليل). " + m("c<sub>0</sub>") + " القيمة المتوسطة (DC)، و " + m("c<sub>±1</sub>") + " التوافقية الأولى، و " + m("c<sub>±M</sub>") + " التوافقية رقم M. ولإشارة حقيقية " + m("c<sub>−k</sub> = c<sub>k</sub>*") + "."
    ],
    widget: { type: "fs" },
    laws: [{ eq: "e<sup>st</sup> → H(s)e<sup>st</sup>,   H(s) = ∫ h(τ)e<sup>−sτ</sup>dτ" }, { eq: "z<sup>n</sup> → H(z)z<sup>n</sup>,   H(z) = Σ h[k]z<sup>−k</sup>" }, { eq: "x(t) = Σ<sub>k=−∞</sub><sup>∞</sup> c<sub>k</sub> e<sup>jkω0t</sup>", n: "التركيب" }, { eq: "c<sub>k</sub> = (1/T<sub>0</sub>) ∫<sub>T0</sub> x(t) e<sup>−jkω0t</sup> dt", n: "التحليل" }, { eq: "x حقيقية ⇒ c<sub>−k</sub> = c<sub>k</sub>*" }],
    when: ["احسب c0 أولًا كمتوسط (غالبًا يحتاج معاملة منفصلة لأن صيغة c_k فيها قسمة على k).", "اختر فترة التكامل الأسهل: من 0 إلى T0 أو من −T0/2 إلى T0/2."],
    ex: [
      { q: "قطار نبضات مستطيلة سعتها 1 وعرضها 2T (من −T إلى T) وزمنها T0. أوجد متسلسلة فورييه.",
        s: [m("c<sub>0</sub> = (1/T<sub>0</sub>)∫<sub>−T</sub><sup>T</sup> 1 dt = 2T/T<sub>0</sub>") + ".", m("c<sub>k</sub> = (1/T<sub>0</sub>)∫<sub>−T</sub><sup>T</sup> e<sup>−jkω0t</sup>dt = (−1/(jkω<sub>0</sub>T<sub>0</sub>))[e<sup>−jkω0T</sup> − e<sup>jkω0T</sup>]") + ".", "بأويلر والتعويض " + m("ω<sub>0</sub>T<sub>0</sub> = 2π") + ": " + m("c<sub>k</sub> = sin(kω<sub>0</sub>T)/(kπ),  k ≠ 0") + ".", m("x(t) = 2T/T<sub>0</sub> + Σ<sub>k≠0</sub> [sin(kω<sub>0</sub>T)/(kπ)]e<sup>jkω0t</sup>") + "."],
        fig: { x: [-2.5, 2.5], y: [-0.2, 1.3], xl: "t", yl: "x(t), T = 0.25, T0 = 1", items: [{ ct: pulse(0.25, 1), n: 900 }] },
        after: { x: [-10.5, 10.5], y: [-0.25, 0.6], xl: "k", yl: "c_k = sin(kπ/2)/(kπ)", items: [{ dt: function (k) { return k === 0 ? 0.5 : Math.sin(k * PI / 2) / (k * PI); }, c: 2 }] } }
    ],
    real: "صوت آلة موسيقية نغمته الأساسية f0 وتوافقياته 2f0 و 3f0…؛ اختلاف قيم c_k بين البيانو والكمان هو ما يجعل لكل منهما «لونًا» مختلفًا للصوت.",
    quiz: [
      S.q("معامل فورييه <span class='ltr'>c<sub>0</sub></span> يمثل:", [["القيمة المتوسطة للإشارة", true, "(1/T0)∫x dt."], ["أعلى قيمة", "conceptual", "هو متوسط وليس قيمة عظمى."], ["التوافقية الأولى", "conceptual", "الأولى c<sub>±1</sub>."]]),
      S.q("إذا كان الدخل <span class='ltr'>e<sup>j3t</sup></span> لنظام LTI فالخرج:", [["<span class='ltr'>H(j3)e<sup>j3t</sup></span>", true, "الأسّية دالة ذاتية."], ["<span class='ltr'>e<sup>j6t</sup></span>", "conceptual", "نظام LTI لا يغيّر التردد."], ["<span class='ltr'>h(t)e<sup>j3t</sup></span>", "formula", "نضرب في ثابت H(j3)."]]),
      S.q("لإشارة حقيقية <span class='ltr'>c<sub>2</sub> = 1 − j</span>. إذن <span class='ltr'>c<sub>−2</sub></span> =", [["<span class='ltr'>1 + j</span>", true, "المرافق."], ["<span class='ltr'>−1 + j</span>", "sign", "المرافق يعكس إشارة الجزء التخيلي فقط."], ["<span class='ltr'>1 − j</span>", "conceptual", "c<sub>−k</sub> = c<sub>k</sub>*."]])
    ],
    practice: {
      prompt: "قطار نبضات مستطيلة سعتها 1، تمتد من " + m("−T") + " إلى " + m("T") + " مع " + m("T = 0.5 ms") + "، وزمنها الدوري " + m("T<sub>0</sub> = 2 ms") + ".",
      steps: [
        S.step("s1", "القيمة المتوسطة " + m("c<sub>0</sub>") + ".", "c0 =", 0.5, { hints: ["c0 = 2T/T0."], sol: "1/2 = 0.5.", diag: [{ value: 0.25, type: "formula", why: "عرض النبضة 2T وليس T." }] }),
        S.step("s2", "التردد الأساسي " + m("ω<sub>0</sub>") + ".", "ω0 =", 2 * PI / 0.002, { units: S.RADS, hints: ["2π/T0 بالثواني."], sol: "2π/0.002 = 1000π ≈ 3141.6 rad/s." }),
        S.step("s3", m("c<sub>1</sub>") + " = sin(ω0T)/π.", "c1 =", Math.sin(PI / 2) / PI, { hints: ["ω0T = 1000π × 0.0005 = π/2."], sol: "sin(π/2)/π = 1/π ≈ 0.318." })
      ]
    }
  });

  /* ================= 2. Trigonometric form, Dirichlet, examples ================= */
  S.lesson({
    id: "ss-ch3-2", chapter: CH, ar: "الصيغة المثلثية وشروط ديريشليه وأمثلة", en: "Trigonometric Form, Dirichlet Conditions and Examples", min: 40,
    obj: ["تحوّل بين الصيغة الأسّية والمثلثية والتوافقية.", "تستخدم التماثل (زوجية/فردية) لتقليل الحساب.", "تحسب متسلسلة |cos t| والموجة المثلثية و x(t) = t وترسم طيف السعة والطور."],
    idea: [
      "الصيغة المثلثية " + m("x = a<sub>0</sub>/2 + Σ(a<sub>k</sub>cos kω<sub>0</sub>t + b<sub>k</sub>sin kω<sub>0</sub>t)") + " مع " + m("a<sub>k</sub> = (2/T<sub>0</sub>)∫x cos kω<sub>0</sub>t dt") + " و " + m("b<sub>k</sub> = (2/T<sub>0</sub>)∫x sin kω<sub>0</sub>t dt") + ". والربط: " + m("a<sub>0</sub>/2 = c<sub>0</sub>") + "، " + m("c<sub>k</sub> = ½(a<sub>k</sub> − jb<sub>k</sub>)") + "، ولإشارة حقيقية " + m("a<sub>k</sub> = 2Re c<sub>k</sub>") + " و " + m("b<sub>k</sub> = −2Im c<sub>k</sub>") + ".",
      "التماثل يختصر: الإشارة <b>الزوجية</b> b_k = 0 فتحوي جيوب تمام فقط، و<b>الفردية</b> a_k = 0 فتحوي جيوبًا فقط. والصيغة التوافقية " + m("x = C<sub>0</sub> + ΣC<sub>k</sub>cos(kω<sub>0</sub>t − θ<sub>k</sub>)") + " مع " + m("C<sub>k</sub> = √(a<sub>k</sub>² + b<sub>k</sub>²)") + " و " + m("θ<sub>k</sub> = tan<sup>−1</sup>(b<sub>k</sub>/a<sub>k</sub>)") + ".",
      "متى توجد المتسلسلة؟ <b>شروط ديريشليه</b>: (1) x قابلة للتكامل المطلق على الدورة، (2) عدد محدود من القمم والقيعان في أي فترة محدودة، (3) عدد محدود من الانقطاعات المحدودة."
    ],
    laws: [{ eq: "x(t) = a<sub>0</sub>/2 + Σ<sub>k=1</sub><sup>∞</sup> (a<sub>k</sub> cos kω<sub>0</sub>t + b<sub>k</sub> sin kω<sub>0</sub>t)" }, { eq: "a<sub>k</sub> = (2/T<sub>0</sub>)∫<sub>T0</sub> x cos kω<sub>0</sub>t dt      b<sub>k</sub> = (2/T<sub>0</sub>)∫<sub>T0</sub> x sin kω<sub>0</sub>t dt" }, { eq: "a<sub>k</sub> = c<sub>k</sub> + c<sub>−k</sub>,  b<sub>k</sub> = j(c<sub>k</sub> − c<sub>−k</sub>),  c<sub>k</sub> = ½(a<sub>k</sub> − jb<sub>k</sub>)" }, { eq: "C<sub>0</sub> = a<sub>0</sub>/2,  C<sub>k</sub> = √(a<sub>k</sub>² + b<sub>k</sub>²),  θ<sub>k</sub> = tan<sup>−1</sup>(b<sub>k</sub>/a<sub>k</sub>)" }],
    when: ["إذا كانت x مجموع جيوب وجيوب تمام: لا تكامل، اكتبها بأويلر واقرأ c_k مباشرة.", "طيف السعة |c_k| زوجي وطيف الطور فردي لإشارة حقيقية."],
    ex: [
      { q: "أوجد متسلسلة فورييه لـ " + m("x(t) = |cos t|") + ".",
        s: [m("T<sub>0</sub> = π") + " و " + m("ω<sub>0</sub> = 2") + ".", m("c<sub>0</sub> = (1/π)∫<sub>−π/2</sub><sup>π/2</sup> cos t dt = 2/π") + ".", m("c<sub>k</sub> = (1/π)∫<sub>−π/2</sub><sup>π/2</sup> ½(e<sup>jt</sup> + e<sup>−jt</sup>)e<sup>−j2kt</sup>dt") + "، وبالتكامل وقيم cos(π/2) = 0 و cos(πk) = (−1)<sup>k</sup>:", m("c<sub>k</sub> = 2(−1)<sup>k</sup>/(π(1 − 4k²))") + "."],
        fig: { x: [-6, 6], y: [-0.2, 1.2], xl: "t", yl: "|cos t|", items: [{ ct: function (t) { return Math.abs(Math.cos(t)); } }] },
        after: { x: [-5.5, 5.5], y: [-0.25, 0.75], xl: "k", yl: "c_k", items: [{ dt: function (k) { return 2 * Math.pow(-1, k) / (PI * (1 - 4 * k * k)); }, c: 2 }] } },
      { q: "الموجة المثلثية: " + m("x = t") + " على (0, 1) و " + m("2 − t") + " على (1, 2)، وزمنها 2.",
        s: [m("T<sub>0</sub> = 2, ω<sub>0</sub> = π") + ".", m("c<sub>0</sub> = ½{∫<sub>0</sub><sup>1</sup>t dt + ∫<sub>1</sub><sup>2</sup>(2 − t)dt} = ½") + ".", m("c<sub>k</sub> = ½{∫<sub>0</sub><sup>1</sup> te<sup>−jkπt</sup>dt + ∫<sub>1</sub><sup>2</sup>(2 − t)e<sup>−jkπt</sup>dt} = ((−1)<sup>k</sup> − 1)/(π²k²)") + ".", "الزوجيّة غير صفرية: k فردي يعطي " + m("−2/(π²k²)") + "، و k زوجي (غير صفر) يعطي صفرًا."] },
      { q: "أوجد متسلسلة " + m("x(t) = cos 4t + sin 6t") + ".",
        s: ["القاسم المشترك للترددين 4 و 6 هو 2، إذن " + m("ω<sub>0</sub> = 2") + ".", "بأويلر: " + m("x = ½(e<sup>j2ω0t</sup> + e<sup>−j2ω0t</sup>) + (1/2j)(e<sup>j3ω0t</sup> − e<sup>−j3ω0t</sup>)") + ".", m("c<sub>±2</sub> = ½") + "، " + m("c<sub>3</sub> = 1/(2j)") + "، " + m("c<sub>−3</sub> = −1/(2j)") + "، والباقي صفر."] },
      { q: "أوجد المتسلسلة الأسّية لـ " + m("x(t) = t") + " على (−1, 1) و T0 = 2، وارسم طيفي السعة والطور.",
        s: [m("ω<sub>0</sub> = π") + "، و " + m("c<sub>n</sub> = ½∫<sub>−1</sub><sup>1</sup> te<sup>−jnπt</sup>dt") + " بالتجزئة.", m("c<sub>n</sub> = j(−1)<sup>n</sup>/(nπ)") + " عند n ≠ 0، و " + m("c<sub>0</sub> = 0") + ".", m("|c<sub>±1</sub>| = 0.3183,  |c<sub>±2</sub>| = 0.1592,  |c<sub>±3</sub>| = 0.1061") + "، والطور ±90°."],
        after: { x: [-3.5, 3.5], y: [-0.02, 0.36], xl: "n", yl: "|c_n|", items: [{ dt: function (n) { return n === 0 ? 0 : 1 / (Math.abs(n) * PI); }, c: 2 }] } }
    ],
    real: "مزوّد طاقة يحوّل AC إلى DC بمقوّم موجة كاملة يعطي |cos t|: c0 = 2/π هي الجهد المستمر، والتوافقيات الباقية «تموّج» يُزال بمرشح.",
    quiz: [
      S.q("إشارة دورية زوجية حقيقية. متسلسلتها المثلثية تحوي:", [["جيوب تمام فقط (و a0)", true, "b_k = 0."], ["جيوبًا فقط", "conceptual", "هذا للفردية."], ["الاثنين دائمًا", "conceptual", "التماثل يلغي أحدهما."]]),
      S.q("<span class='ltr'>a<sub>k</sub> = 4, b<sub>k</sub> = 3</span>. السعة التوافقية <span class='ltr'>C<sub>k</sub></span>:", [["5", true, "√(16 + 9)."], ["7", "formula", "لا نجمع مباشرة."], ["1", "formula", "الجذر لمجموع المربعات."]]),
      S.q("أي مما يلي ليس من شروط ديريشليه؟", [["أن تكون الإشارة متصلة", true, "يسمح بعدد محدود من الانقطاعات."], ["قابلية التكامل المطلق على دورة", "conceptual", "هذا شرط."], ["عدد محدود من القمم في فترة محدودة", "conceptual", "هذا شرط."]])
    ],
    practice: {
      prompt: "الإشارة " + m("x(t) = 3 + 4cos(2t) + 2sin(6t)") + ".",
      steps: [
        S.step("s1", "التردد الأساسي " + m("ω<sub>0</sub>") + ".", "ω0 =", 2, { units: S.RADS, hints: ["القاسم المشترك الأكبر لـ 2 و 6."], sol: "ω0 = 2 rad/s." }),
        S.step("s2", "المعامل " + m("c<sub>1</sub>") + " (حقيقي).", "c1 =", 2, { hints: ["4cos(2t) = 2e<sup>j2t</sup> + 2e<sup>−j2t</sup>."], sol: "c1 = 2.", diag: [{ value: 4, type: "formula", why: "نصف السعة لكل أسّية." }] }),
        S.step("s3", "مقدار " + m("|c<sub>3</sub>|") + ".", "|c3| =", 1, { hints: ["2sin(6t) = (2/2j)(e<sup>j6t</sup> − e<sup>−j6t</sup>)."], sol: "|1/j| = 1." })
      ]
    }
  });

  /* ================= 3. DTFS ================= */
  S.lesson({
    id: "ss-ch3-3", chapter: CH, ar: "متسلسلة فورييه المتقطعة", en: "Discrete-Time Fourier Series", min: 30,
    obj: ["تفسر لماذا يوجد N أسّية مختلفة فقط في المتقطع.", "تكتب معادلتي DTFS بمجموع على دورة واحدة.", "تحسب a_k لإشارات من المحاضرة."],
    idea: [
      "الأسّيات المتقطعة " + m("φ<sub>k</sub>[n] = e<sup>jk(2π/N)n</sup>") + " كلها دورية بزمن N، و " + m("φ<sub>k+N</sub> = φ<sub>k</sub>") + "، فلا يوجد إلا <b>N أسّية مختلفة</b>. لذلك المجموع على N حدًا متتاليًا فقط: " + m("k = ⟨N⟩") + ".",
      "التركيب " + m("x[n] = Σ<sub>k=⟨N⟩</sub> a<sub>k</sub>e<sup>jk(2π/N)n</sup>") + " والتحليل " + m("a<sub>k</sub> = (1/N)Σ<sub>n=⟨N⟩</sub> x[n]e<sup>−jk(2π/N)n</sup>") + "، والمعاملات دورية " + m("a<sub>k</sub> = a<sub>k+N</sub>") + ". وبما أن المجموعين محدودان، فالـ DTFS تُحسب عدديًا على الحاسب بدقة."
    ],
    laws: [{ eq: "x[n] = Σ<sub>k=⟨N⟩</sub> a<sub>k</sub> e<sup>jk(2π/N)n</sup>", n: "التركيب" }, { eq: "a<sub>k</sub> = (1/N) Σ<sub>n=⟨N⟩</sub> x[n] e<sup>−jk(2π/N)n</sup>", n: "التحليل" }, { eq: "a<sub>k</sub> = a<sub>k+N</sub>" }],
    when: ["إذا كانت x مجموع جيوب: اكتبها بأويلر واقرأ a_k.", "إذا أُعطيت قيم x على دورة: طبّق مجموع التحليل مباشرة."],
    ex: [
      { q: "إشارة دورية N = 6: " + m("x[−1] = 2, x[0] = 1, x[1] = 2") + " وصفر عند n = 2, 3, 4. أوجد a_k.",
        s: [m("a<sub>k</sub> = (1/6)Σ<sub>n=−1</sub><sup>1</sup> x[n]e<sup>−jk(π/3)n</sup>") + ".", m("= (1/6){2e<sup>jkπ/3</sup> + 1 + 2e<sup>−jkπ/3</sup>}") + ".", m("a<sub>k</sub> = (1/6)(1 + 4cos(kπ/3)) = 1/6 + (2/3)cos(kπ/3)") + "."],
        after: { x: [-6.5, 6.5], y: [-0.4, 0.95], xl: "k", yl: "a_k", items: [{ dt: function (k) { return 1 / 6 + 2 / 3 * Math.cos(k * PI / 3); }, c: 2 }] } },
      { q: "أوجد a_k لـ " + m("x[n] = sin(6πn/5)") + ".",
        s: [m("N = 2πk/ω<sub>0</sub> = 2πk/(6π/5) = 5k/3") + " ⇐ N = 5 عند k = 3.", m("x = (1/2j)e<sup>j3(2π/5)n</sup> − (1/2j)e<sup>−j3(2π/5)n</sup>") + ".", m("a<sub>3</sub> = 1/(2j),  a<sub>−3</sub> = −1/(2j)") + "، وتتكرر كل 5: " + m("a<sub>k</sub> = a<sub>k+5</sub>") + "."] },
      { q: "أوجد a_k لـ " + m("x[n] = 1 + sin(2πn/N) + 3cos(2πn/N) + cos(4πn/N + π/2)") + ".",
        s: ["بأويلر لكل حد.", m("a<sub>0</sub> = 1") + "، " + m("a<sub>1</sub> = 3/2 + 1/(2j) = 3/2 − j/2") + "، " + m("a<sub>−1</sub> = 3/2 + j/2") + ".", m("a<sub>2</sub> = ½e<sup>jπ/2</sup> = j/2") + "، " + m("a<sub>−2</sub> = −j/2") + "."] }
    ],
    real: "في معالجة الصوت الرقمي نأخذ N عيّنة ونحسب معاملاتها بخوارزمية FFT، وهي حساب سريع للـ DTFS، لنعرض طيف الصوت مباشرة على الشاشة.",
    quiz: [
      S.q("عدد الأسّيات المتقطعة المختلفة بزمن N:", [["N", true, "φ<sub>k+N</sub> = φ<sub>k</sub>."], ["لا نهائي", "conceptual", "هذا في المستمر."], ["2N", "conceptual", "كل N تتكرر."]]),
      S.q("<span class='ltr'>a<sub>2</sub> = 0.3</span> لإشارة N = 8. فإن <span class='ltr'>a<sub>10</sub></span>:", [["0.3", true, "a<sub>k</sub> = a<sub>k+N</sub>."], ["0", "conceptual", "المعاملات دورية."], ["<span class='ltr'>0.3/5</span>", "formula", "لا قسمة."]]),
      S.q("<span class='ltr'>a<sub>0</sub></span> في DTFS هي:", [["متوسط x على دورة", true, "(1/N)Σx[n]."], ["مجموع x", "formula", "نقسم على N."], ["x[0]", "conceptual", "متوسط وليس قيمة واحدة."]])
    ],
    practice: {
      prompt: "إشارة دورية N = 4 قيمها على دورة: " + m("x[0] = 1, x[1] = 2, x[2] = 0, x[3] = 1") + ".",
      steps: [
        S.step("s1", m("a<sub>0</sub>") + " =", "a0 =", 1, { hints: ["(1/4)(1 + 2 + 0 + 1)."], sol: "4/4 = 1." }),
        S.step("s2", m("a<sub>2</sub>") + " (حقيقي).", "a2 =", 0.25 * (1 - 2 + 0 - 1), { hints: ["e<sup>−j2(2π/4)n</sup> = (−1)<sup>n</sup>."], sol: "(1/4)(1 − 2 + 0 − 1) = −0.5." }),
        S.step("s3", m("a<sub>6</sub>") + " =", "a6 =", -0.5, { hints: ["a<sub>k+N</sub> = a<sub>k</sub>."], sol: "a6 = a2 = −0.5." })
      ]
    }
  });
})();
