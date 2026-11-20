/* Electric Circuits 2 (EE 2020) — Chapter 7: Two-Port Networks (lecture 11, Dr. Abdullah Noman, from Alexander & Sadiku ch. 19):
   impedance (z), admittance (y), hybrid (h) and inverse hybrid (g) parameters, with the lecture's solved examples.
   Every number is from the lecture or computed here; tests recompute them. */
(function () {
  "use strict";
  var CV = window.CV, S = CV.ss;
  var m = function (x) { return "<span class='eq-i'>" + x + "</span>"; };
  var C = "circuits-2", CH = "الفصل 7: شبكات المنفذين (Two-Port)";
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var W = function (a, b) { return E(a, b, "W"); };
  function cir(rows, cols, edges, o) { var c = { rows: rows, cols: cols, edges: edges }; for (var k in (o || {})) c[k] = o[k]; return { html: CV.draw.render(c, { aria: "مخطط الدائرة" }) }; }
  var U = S.U, OHM = U([["Ω", 1], ["kΩ", 1e3]]), SIE = U([["S", 1], ["mS", 1e-3]]), NONE = U([["—", 1]]);
  var ports = { nodeLabels: [{ at: [0, 0], text: "1" }, { at: [1, 0], text: "1'" }, { at: [0, 2], text: "2" }, { at: [1, 2], text: "2'" }] };
  // the T network: series a (port 1 side), series b (port 2 side), shunt c
  function tee(a, b, c, t) { t = t || ["R", "R", "R"]; return cir(2, 3, [E([0, 0], [0, 1], t[0], a.v, { name: a.n, vtext: a.t }), E([0, 1], [0, 2], t[1], b.v, { name: b.n, vtext: b.t }), E([0, 1], [1, 1], t[2], c.v, { name: c.n, vtext: c.t }), W([1, 0], [1, 1]), W([1, 1], [1, 2])], ports); }
  // the π network: shunt a at port 1, series b, shunt c at port 2
  function pi(a, b, c) { return cir(2, 3, [E([0, 0], [1, 0], "R", a.v, { name: a.n, vtext: a.t }), E([0, 0], [0, 2], "R", b.v, { name: b.n, vtext: b.t }), E([0, 2], [1, 2], "R", c.v, { name: c.n, vtext: c.t }), W([1, 0], [1, 2])], ports); }
  var r = function (v, n) { return { v: v, n: n, t: v + " Ω" }; };
  var par = function (a, b) { return a * b / (a + b); };

  /* ---------- 1. z parameters ---------- */
  var fz = tee(r(20, "R1"), r(30, "R2"), r(40, "R3"));
  S.lesson({
    id: "c2-two-port-1", course: C, chapter: CH, ar: "شبكة المنفذين ومعاملات المعاوقة z", en: "Two-Port Networks and Impedance (z) Parameters", min: 35,
    obj: ["تعرّف المنفذ وشبكة المنفذين ولماذا ندرسها.", "تكتب معادلات z وتعرف كل معامل بفتح المنفذ الآخر.", "تميّز الشبكة المتماثلة والمتبادلة ومكافئ T."],
    idea: [
      "<b>المنفذ</b> زوج أطراف يدخل التيار من أحدهما ويخرج من الآخر. المقاومة والملف والمكثف شبكات منفذ واحد. <b>شبكة المنفذين</b> لها منفذ دخل (1–1') ومنفذ خرج (2–2')، ولا تحتوي مصادر مستقلة، مثل المحولات والترانزستورات ومكبرات العمليات. إذا عرفنا معاملاتها نعاملها كـ<b>صندوق أسود</b> داخل أي دائرة أكبر.",
      "معادلات المعاوقة تكتب الجهدين بدلالة التيارين: " + m("V<sub>1</sub> = z<sub>11</sub>I<sub>1</sub> + z<sub>12</sub>I<sub>2</sub>") + " و " + m("V<sub>2</sub> = z<sub>21</sub>I<sub>1</sub> + z<sub>22</sub>I<sub>2</sub>") + "، ووحدتها أوم. كل معامل نجده بجعل أحد التيارين صفرًا، أي <b>بفتح</b> المنفذ الآخر: " + m("z<sub>11</sub> = V<sub>1</sub>/I<sub>1</sub>|<sub>I2=0</sub>") + " معاوقة الدخل، و " + m("z<sub>21</sub> = V<sub>2</sub>/I<sub>1</sub>|<sub>I2=0</sub>") + " معاوقة النقل.",
      "إذا " + m("z<sub>11</sub> = z<sub>22</sub>") + " فالشبكة <b>متماثلة</b>. وإذا كانت خطية بدون مصادر تابعة (مقاومات وملفات ومكثفات فقط) فهي <b>متبادلة</b>: " + m("z<sub>12</sub> = z<sub>21</sub>") + "، وتُستبدل بمكافئ T: " + m("z<sub>11</sub> − z<sub>12</sub>") + " و " + m("z<sub>22</sub> − z<sub>12</sub>") + " على التوالي و " + m("z<sub>12</sub>") + " على التوازي. وبعض الشبكات ليس لها معاملات z، مثل المحول المثالي."
    ],
    figs: [{ plot: fz, cap: "شبكة T من المثال 1: المنفذ 1 يسار والمنفذ 2 يمين." }],
    laws: ["V<sub>1</sub> = z<sub>11</sub>I<sub>1</sub> + z<sub>12</sub>I<sub>2</sub>      V<sub>2</sub> = z<sub>21</sub>I<sub>1</sub> + z<sub>22</sub>I<sub>2</sub>", "z<sub>11</sub> = V<sub>1</sub>/I<sub>1</sub> |<sub>I2=0</sub>      z<sub>21</sub> = V<sub>2</sub>/I<sub>1</sub> |<sub>I2=0</sub>", "z<sub>12</sub> = V<sub>1</sub>/I<sub>2</sub> |<sub>I1=0</sub>      z<sub>22</sub> = V<sub>2</sub>/I<sub>2</sub> |<sub>I1=0</sub>", "متماثلة: z<sub>11</sub> = z<sub>22</sub>      متبادلة: z<sub>12</sub> = z<sub>21</sub>"],
    when: ["لما يكون فتح المنفذ (I = 0) سهلًا، مثل شبكات T.", "لربط شبكات على التوالي: معاملات z تُجمع."],
    ex: [
      { q: "مثال 1 (المحاضرة): أوجد معاملات z لشبكة T: 20 Ω و 30 Ω على التوالي و 40 Ω على التوازي.", fig: fz,
        s: ["افتح المنفذ 2 (I<sub>2</sub> = 0) وطبّق V<sub>1</sub>: " + m("z<sub>11</sub> = (20 + 40)I<sub>1</sub>/I<sub>1</sub> = 60 Ω") + ".", "الجهد على 40 Ω هو V<sub>2</sub> لأن 30 Ω لا يمر فيها تيار: " + m("z<sub>21</sub> = 40I<sub>1</sub>/I<sub>1</sub> = 40 Ω") + ".", "افتح المنفذ 1 وطبّق V<sub>2</sub>: " + m("z<sub>12</sub> = 40 Ω") + " و " + m("z<sub>22</sub> = 30 + 40 = 70 Ω") + ".", "الطريقة 2: الشبكة متبادلة فـ " + m("z<sub>12</sub> = z<sub>21</sub> = 40") + "، ومن مكافئ T: " + m("z<sub>11</sub> = 20 + 40 = 60, z<sub>22</sub> = 30 + 40 = 70 Ω") + "."] }
    ],
    real: "المحولات وخطوط النقل والفلاتر تُوصف بمعاملات المنفذين؛ المصمم يركّب أجزاء معروفة المعاملات دون أن يعيد تحليل ما بداخلها.",
    quiz: [
      S.q("لإيجاد z<sub>11</sub> و z<sub>21</sub> نجعل:", [["I<sub>2</sub> = 0 (نفتح المنفذ 2)", true, "معاملات z بالفتح."], ["V<sub>2</sub> = 0", "conceptual", "القصر لمعاملات y."], ["I<sub>1</sub> = 0", "conceptual", "هذا لـ z<sub>12</sub> و z<sub>22</sub>."]]),
      S.q("شبكة مقاومات فقط تكون دائمًا:", [["متبادلة: z<sub>12</sub> = z<sub>21</sub>", true, "لا مصادر تابعة."], ["متماثلة", "conceptual", "التماثل يحتاج z<sub>11</sub> = z<sub>22</sub>."], ["بدون معاملات z", "conceptual", "المحول المثالي هو المثال."]]),
      S.q("وحدة معاملات z:", [["Ω", true, "جهد/تيار."], ["S", "conceptual", "هذه y."], ["بدون وحدة", "conceptual", "لا."]])
    ],
    practice: {
      prompt: "شبكة T: 10 Ω على التوالي من جهة المنفذ 1، و 20 Ω على التوالي من جهة المنفذ 2، و 30 Ω على التوازي.",
      steps: [
        S.step("s1", "z<sub>11</sub>", "z11 =", 10 + 30, { units: OHM, hints: ["افتح المنفذ 2: 10 + 30."], sol: "40 Ω." }),
        S.step("s2", "z<sub>12</sub> = z<sub>21</sub>", "z12 =", 30, { units: OHM, hints: ["المقاومة المشتركة."], sol: "30 Ω." }),
        S.step("s3", "z<sub>22</sub>", "z22 =", 20 + 30, { units: OHM, hints: ["افتح المنفذ 1: 20 + 30."], sol: "50 Ω." })
      ]
    }
  });

  /* ---------- 2. y parameters ---------- */
  var fy = pi(r(4, "R1"), r(2, "R2"), r(8, "R3"));
  var y11 = 1 / par(4, 2), y12 = -0.5, y22 = 1 / par(8, 2);
  S.lesson({
    id: "c2-two-port-2", course: C, chapter: CH, ar: "معاملات المسامحة y", en: "Admittance (y) Parameters", min: 30,
    obj: ["تكتب معادلات y وتعرف كل معامل بقصر المنفذ الآخر.", "تحسب y لشبكة π.", "تعرف مكافئ π للشبكة المتبادلة."],
    idea: [
      "معادلات المسامحة تكتب التيارين بدلالة الجهدين: " + m("I<sub>1</sub> = y<sub>11</sub>V<sub>1</sub> + y<sub>12</sub>V<sub>2</sub>") + " و " + m("I<sub>2</sub> = y<sub>21</sub>V<sub>1</sub> + y<sub>22</sub>V<sub>2</sub>") + "، ووحدتها سيمنز. كل معامل نجده بجعل أحد الجهدين صفرًا، أي <b>بقصر</b> المنفذ الآخر.",
      "للشبكة الخطية بدون مصادر تابعة: " + m("y<sub>12</sub> = y<sub>21</sub>") + "، وتُمثَّل بمكافئ π: " + m("y<sub>11</sub> + y<sub>12</sub>") + " على المنفذ 1، و " + m("−y<sub>12</sub>") + " بين المنفذين، و " + m("y<sub>22</sub> + y<sub>21</sub>") + " على المنفذ 2. لذلك معاملات y طبيعية لشبكات π، كما z طبيعية لشبكات T."
    ],
    figs: [{ plot: fy, cap: "شبكة π من المثال: 4 Ω و 8 Ω على التوازي و 2 Ω بينهما." }],
    laws: ["I<sub>1</sub> = y<sub>11</sub>V<sub>1</sub> + y<sub>12</sub>V<sub>2</sub>      I<sub>2</sub> = y<sub>21</sub>V<sub>1</sub> + y<sub>22</sub>V<sub>2</sub>", "y<sub>11</sub> = I<sub>1</sub>/V<sub>1</sub> |<sub>V2=0</sub>      y<sub>21</sub> = I<sub>2</sub>/V<sub>1</sub> |<sub>V2=0</sub>", "y<sub>12</sub> = I<sub>1</sub>/V<sub>2</sub> |<sub>V1=0</sub>      y<sub>22</sub> = I<sub>2</sub>/V<sub>2</sub> |<sub>V1=0</sub>", "متبادلة: y<sub>12</sub> = y<sub>21</sub>"],
    when: ["لما يكون قصر المنفذ (V = 0) سهلًا، مثل شبكات π.", "لربط شبكات على التوازي: معاملات y تُجمع."],
    ex: [
      { q: "مثال (المحاضرة): أوجد معاملات y لشبكة π: 4 Ω عند المنفذ 1، و 2 Ω بين المنفذين، و 8 Ω عند المنفذ 2.", fig: fy,
        s: ["اقصر المنفذ 2 (V<sub>2</sub> = 0): الـ 8 Ω تنقصر، و 2 Ω توازي 4 Ω: " + m("V<sub>1</sub> = I<sub>1</sub>(4∥2) = (4/3)I<sub>1</sub>") + "، إذن " + m("y<sub>11</sub> = 0.75 S") + ".", "بتقسيم التيار: " + m("−I<sub>2</sub> = 4/(4 + 2) I<sub>1</sub> = (2/3)I<sub>1</sub> = 0.5V<sub>1</sub>") + "، إذن " + m("y<sub>21</sub> = −0.5 S") + ".", "اقصر المنفذ 1: الـ 4 Ω تنقصر، و 2 Ω توازي 8 Ω: " + m("V<sub>2</sub> = I<sub>2</sub>(8∥2) = 1.6I<sub>2</sub>") + "، إذن " + m("y<sub>22</sub> = 0.625 S") + ".", m("−I<sub>1</sub> = 8/(8 + 2) I<sub>2</sub> = 0.5V<sub>2</sub>") + "، إذن " + m("y<sub>12</sub> = −0.5 S = y<sub>21</sub>") + ": الشبكة متبادلة."] }
    ],
    real: "في الإلكترونيات عالية التردد يُقاس الترانزستور بمعاملات y لأن قصر المنفذ بمكثف كبير أسهل من فتحه.",
    quiz: [
      S.q("لإيجاد y<sub>11</sub> نجعل:", [["V<sub>2</sub> = 0 (نقصر المنفذ 2)", true, "معاملات y بالقصر."], ["I<sub>2</sub> = 0", "conceptual", "الفتح لمعاملات z."], ["V<sub>1</sub> = 0", "conceptual", "هذا لـ y<sub>12</sub> و y<sub>22</sub>."]]),
      S.q("الشبكة المتبادلة تُمثَّل بمعاملات y بمكافئ:", [["π", true, "ثلاث مسامحات."], ["T", "conceptual", "T لمعاملات z."], ["نورتن", "conceptual", "لا."]]),
      S.q("في المثال، إشارة y<sub>12</sub>:", [["سالبة", true, "التيار I<sub>1</sub> يخرج من الطرف."], ["موجبة", "sign", "−0.5 S."], ["صفر", "conceptual", "الـ 2 Ω تربط المنفذين."]])
    ],
    practice: {
      prompt: "شبكة π: 10 Ω عند المنفذ 1، و 5 Ω بين المنفذين، و 10 Ω عند المنفذ 2.",
      steps: [
        S.step("s1", "y<sub>11</sub>", "y11 =", 1 / 10 + 1 / 5, { units: SIE, hints: ["اقصر المنفذ 2: 1/10 + 1/5."], sol: "0.3 S." }),
        S.step("s2", "y<sub>12</sub>", "y12 =", -1 / 5, { units: SIE, hints: ["−1/(المقاومة بين المنفذين)."], sol: "−0.2 S.", diag: [{ value: 0.2, type: "sign", why: "y12 سالبة في شبكة π." }] }),
        S.step("s3", "y<sub>22</sub>", "y22 =", 1 / 10 + 1 / 5, { units: SIE, hints: ["متماثلة."], sol: "0.3 S." })
      ]
    }
  });

  /* ---------- 3. h parameters ---------- */
  var fh = tee(r(2, "R1"), r(3, "R2"), r(6, "R3"));
  S.lesson({
    id: "c2-two-port-3", course: C, chapter: CH, ar: "المعاملات الهجينة h", en: "Hybrid (h) Parameters", min: 30,
    obj: ["تكتب معادلات h ووحدة كل معامل.", "تحسب h بقصر المنفذ 2 ثم فتح المنفذ 1.", "تعرف لماذا تُستخدم h للترانزستورات."],
    idea: [
      "المعاملات الهجينة تكتب " + m("V<sub>1</sub>") + " و " + m("I<sub>2</sub>") + " بدلالة " + m("I<sub>1</sub>") + " و " + m("V<sub>2</sub>") + ": " + m("V<sub>1</sub> = h<sub>11</sub>I<sub>1</sub> + h<sub>12</sub>V<sub>2</sub>") + " و " + m("I<sub>2</sub> = h<sub>21</sub>I<sub>1</sub> + h<sub>22</sub>V<sub>2</sub>") + ". كل معامل له وحدة مختلفة: h<sub>11</sub> معاوقة (Ω)، و h<sub>12</sub> نسبة جهود، و h<sub>21</sub> نسبة تيارات، و h<sub>22</sub> مسامحة (S).",
      "نجد h<sub>11</sub> و h<sub>21</sub> بقصر المنفذ 2 (V<sub>2</sub> = 0)، و h<sub>12</sub> و h<sub>22</sub> بفتح المنفذ 1 (I<sub>1</sub> = 0). وهي مفيدة جدًا لوصف الترانزستورات: h<sub>21</sub> هو كسب التيار."
    ],
    figs: [{ plot: fh, cap: "شبكة المثال 19.5: 2 Ω و 3 Ω على التوالي و 6 Ω على التوازي." }],
    laws: ["V<sub>1</sub> = h<sub>11</sub>I<sub>1</sub> + h<sub>12</sub>V<sub>2</sub>      I<sub>2</sub> = h<sub>21</sub>I<sub>1</sub> + h<sub>22</sub>V<sub>2</sub>", "h<sub>11</sub> = V<sub>1</sub>/I<sub>1</sub> |<sub>V2=0</sub>      h<sub>21</sub> = I<sub>2</sub>/I<sub>1</sub> |<sub>V2=0</sub>", "h<sub>12</sub> = V<sub>1</sub>/V<sub>2</sub> |<sub>I1=0</sub>      h<sub>22</sub> = I<sub>2</sub>/V<sub>2</sub> |<sub>I1=0</sub>", "متبادلة: h<sub>12</sub> = −h<sub>21</sub>"],
    when: ["لوصف الترانزستور: دخل تياري وخرج جهدي.", "لما لا توجد معاملات z أو y للشبكة."],
    ex: [
      { q: "مثال 19.5 (المحاضرة): أوجد المعاملات الهجينة لشبكة T: 2 Ω و 3 Ω على التوالي و 6 Ω على التوازي.", fig: fh,
        s: ["اقصر المنفذ 2 وطبّق I<sub>1</sub>: " + m("V<sub>1</sub> = I<sub>1</sub>(2 + 3∥6) = 4I<sub>1</sub>") + "، إذن " + m("h<sub>11</sub> = 4 Ω") + ".", "بتقسيم التيار: " + m("−I<sub>2</sub> = 6/(6 + 3) I<sub>1</sub> = (2/3)I<sub>1</sub>") + "، إذن " + m("h<sub>21</sub> = −2/3") + ".", "افتح المنفذ 1 وطبّق V<sub>2</sub>: بتقسيم الجهد " + m("V<sub>1</sub> = 6/(6 + 3) V<sub>2</sub> = (2/3)V<sub>2</sub>") + "، إذن " + m("h<sub>12</sub> = 2/3") + ".", m("V<sub>2</sub> = (3 + 6)I<sub>2</sub> = 9I<sub>2</sub>") + "، إذن " + m("h<sub>22</sub> = 1/9 S") + ". ولاحظ " + m("h<sub>12</sub> = −h<sub>21</sub>") + ": متبادلة."] }
    ],
    real: "كتيبات بيانات الترانزستورات القديمة (مثل 2N3904) تعطي h<sub>fe</sub> و h<sub>ie</sub>، وهي h<sub>21</sub> و h<sub>11</sub> في توصيل الباعث المشترك.",
    quiz: [
      S.q("وحدة h<sub>11</sub>:", [["Ω", true, "V1/I1."], ["S", "conceptual", "هذه h22."], ["بدون وحدة", "conceptual", "h12 و h21 بدون وحدة."]]),
      S.q("لإيجاد h<sub>12</sub> نجعل:", [["I<sub>1</sub> = 0", true, "نفتح المنفذ 1."], ["V<sub>2</sub> = 0", "conceptual", "هذا لـ h11 و h21."], ["V<sub>1</sub> = 0", "conceptual", "لا."]]),
      S.q("في الشبكة المتبادلة:", [["h<sub>12</sub> = −h<sub>21</sub>", true, "2/3 و −2/3 في المثال."], ["h<sub>12</sub> = h<sub>21</sub>", "sign", "بإشارة سالبة."], ["h<sub>11</sub> = h<sub>22</sub>", "conceptual", "لا."]])
    ],
    practice: {
      prompt: "شبكة T: 4 Ω على التوالي من جهة المنفذ 1، و 6 Ω على التوالي من جهة المنفذ 2، و 12 Ω على التوازي.",
      steps: [
        S.step("s1", "h<sub>11</sub>", "h11 =", 4 + par(6, 12), { units: OHM, hints: ["اقصر المنفذ 2: 4 + 6∥12."], sol: "8 Ω." }),
        S.step("s2", "h<sub>21</sub>", "h21 =", -12 / 18, { units: NONE, hints: ["−12/(6 + 12)."], sol: "−2/3 ≈ −0.667.", diag: [{ value: 12 / 18, type: "sign", why: "I2 يخرج من المنفذ: سالبة." }] }),
        S.step("s3", "h<sub>22</sub>", "h22 =", 1 / 18, { units: SIE, hints: ["افتح المنفذ 1: 1/(6 + 12)."], sol: "1/18 ≈ 0.0556 S." })
      ]
    }
  });

  /* ---------- 4. g parameters ---------- */
  var fg = tee({ v: 1, n: "L", t: "1 H" }, { v: 1, n: "C", t: "1 F" }, r(1, "R"), ["L", "C", "R"]);
  var g22at1 = (1 + 1 + 1) / (1 * 2);
  S.lesson({
    id: "c2-two-port-4", course: C, chapter: CH, ar: "المعاملات الهجينة العكسية g", en: "Inverse Hybrid (g) Parameters", min: 30,
    obj: ["تكتب معادلات g وعلاقتها بـ h.", "تحسب g بفتح المنفذ 2 ثم قصر المنفذ 1.", "تحسب المعاملات في مجال s."],
    idea: [
      "معاملات g (الهجينة العكسية) قريبة من h لكنها معكوسة: " + m("I<sub>1</sub> = g<sub>11</sub>V<sub>1</sub> + g<sub>12</sub>I<sub>2</sub>") + " و " + m("V<sub>2</sub> = g<sub>21</sub>V<sub>1</sub> + g<sub>22</sub>I<sub>2</sub>") + ". نجد g<sub>11</sub> و g<sub>21</sub> بفتح المنفذ 2 (I<sub>2</sub> = 0)، و g<sub>12</sub> و g<sub>22</sub> بقصر المنفذ 1 (V<sub>1</sub> = 0).",
      "إذا فيها ملفات ومكثفات نحسب في مجال s: الملف " + m("sL") + " والمكثف " + m("1/(sC)") + "، فتطلع المعاملات دوال في s."
    ],
    figs: [{ plot: fg, cap: "شبكة المثال 19.7: 1 H و 1 F على التوالي و 1 Ω على التوازي." }],
    laws: ["I<sub>1</sub> = g<sub>11</sub>V<sub>1</sub> + g<sub>12</sub>I<sub>2</sub>      V<sub>2</sub> = g<sub>21</sub>V<sub>1</sub> + g<sub>22</sub>I<sub>2</sub>", "g<sub>11</sub> = I<sub>1</sub>/V<sub>1</sub> |<sub>I2=0</sub>      g<sub>21</sub> = V<sub>2</sub>/V<sub>1</sub> |<sub>I2=0</sub>", "g<sub>12</sub> = I<sub>1</sub>/I<sub>2</sub> |<sub>V1=0</sub>      g<sub>22</sub> = V<sub>2</sub>/I<sub>2</sub> |<sub>V1=0</sub>", "L → sL      C → 1/(sC)"],
    when: ["لوصف مكبر جهد: دخل جهدي وخرج جهدي.", "لما لا توجد معاملات h للشبكة."],
    ex: [
      { q: "مثال 19.7 (المحاضرة): أوجد معاملات g كدوال في s لشبكة T: 1 H و 1 F على التوالي و 1 Ω على التوازي.", fig: fg,
        s: ["في مجال s: " + m("1 H → s") + " و " + m("1 F → 1/s") + ".", "افتح المنفذ 2 وطبّق V<sub>1</sub>: " + m("I<sub>1</sub> = V<sub>1</sub>/(s + 1)") + "، إذن " + m("g<sub>11</sub> = 1/(s + 1)") + ". وبتقسيم الجهد " + m("g<sub>21</sub> = V<sub>2</sub>/V<sub>1</sub> = 1/(s + 1)") + ".", "اقصر المنفذ 1 وطبّق I<sub>2</sub>: " + m("I<sub>1</sub> = −I<sub>2</sub>/(s + 1)") + "، إذن " + m("g<sub>12</sub> = −1/(s + 1)") + ".", m("V<sub>2</sub> = I<sub>2</sub>(1/s + s∥1)") + "، إذن " + m("g<sub>22</sub> = 1/s + s/(s + 1) = (s² + s + 1)/(s(s + 1))") + "."] }
    ],
    real: "مكبر الجهد المثالي يوصف بـ g<sub>21</sub> (كسب الجهد) مع g<sub>11</sub> = 0 (معاوقة دخل لا نهائية) و g<sub>22</sub> = 0.",
    quiz: [
      S.q("لإيجاد g<sub>11</sub> نجعل:", [["I<sub>2</sub> = 0", true, "نفتح المنفذ 2."], ["V<sub>2</sub> = 0", "conceptual", "هذا لـ h11."], ["V<sub>1</sub> = 0", "conceptual", "هذا لـ g12 و g22."]]),
      S.q("الملف 1 H في مجال s:", [["s", true, "sL."], ["1/s", "conceptual", "هذا المكثف 1 F."], ["1", "conceptual", "لا."]]),
      S.q("في المثال، قيمة g<sub>22</sub> عند s = 1:", [["1.5 Ω", true, "3/2."], ["1 Ω", "formula", "(1+1+1)/(1·2)."], ["3 Ω", "formula", "اقسم على s(s + 1) = 2."]])
    ],
    practice: {
      prompt: "شبكة T مقاومات: 2 Ω على التوالي من جهة المنفذ 1، و 3 Ω على التوالي من جهة المنفذ 2، و 6 Ω على التوازي.",
      steps: [
        S.step("s1", "g<sub>11</sub>", "g11 =", 1 / (2 + 6), { units: SIE, hints: ["افتح المنفذ 2: 1/(2 + 6)."], sol: "0.125 S." }),
        S.step("s2", "g<sub>21</sub>", "g21 =", 6 / 8, { units: NONE, hints: ["تقسيم جهد: 6/(2 + 6)."], sol: "0.75." }),
        S.step("s3", "g<sub>22</sub>", "g22 =", 3 + par(2, 6), { units: OHM, hints: ["اقصر المنفذ 1: 3 + 2∥6."], sol: "4.5 Ω." })
      ]
    }
  });
  CV.c2tp = { y11: y11, y12: y12, y22: y22, g22at1: g22at1 };
})();
