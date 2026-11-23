/* Circuits 1 — Chapter 2: Circuit Elements
   Voltage and Current Sources · Ohm's Law · Kirchhoff's Laws · Circuits Containing Dependent Sources
   Figures are drawn by engine/draw.js and every answer is computed by engine/mna.js from the
   same circuit object, so the drawing and the numbers cannot disagree. */
(function () {
  "use strict";
  var CV = window.CV, L = CV.lessons = CV.lessons || {};
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var fig = function (c, aria) { return "<div class='lfig'>" + CV.draw.render(c, { aria: aria }) + "</div>"; };
  var solve = function (c) { var s = CV.mna.solve(c); if (!s.ok) throw new Error("lesson circuit invalid: " + s.reason); return s.byName; };
  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };
  var A = [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }], V = [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }, { l: "kV", f: 1e3 }], W = [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }, { l: "kW", f: 1e3 }];

  /* ------------------------------------------------------------------ */
  var c1 = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "V", 20, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "I", 4, { dir: "ab", name: "Is" }), E([1, 0], [1, 1], "W")] };
  var s1 = solve(c1);
  var depKinds =
    "<table class='tbl'><thead><tr><th>النوع</th><th>العلاقة</th><th>وحدة الثابت</th></tr></thead><tbody>" +
    "<tr><td>مصدر جهد يتحكم فيه جهد <span class='ltr'>(VCVS)</span></td><td class='ltr'>vₛ = μ vₓ</td><td>بدون وحدة</td></tr>" +
    "<tr><td>مصدر جهد يتحكم فيه تيار <span class='ltr'>(CCVS)</span></td><td class='ltr'>vₛ = ρ iₓ</td><td class='ltr'>V/A = Ω</td></tr>" +
    "<tr><td>مصدر تيار يتحكم فيه جهد <span class='ltr'>(VCCS)</span></td><td class='ltr'>iₛ = α vₓ</td><td class='ltr'>A/V = S</td></tr>" +
    "<tr><td>مصدر تيار يتحكم فيه تيار <span class='ltr'>(CCCS)</span></td><td class='ltr'>iₛ = β iₓ</td><td>بدون وحدة</td></tr></tbody></table>";

  /* Lecture circuits (Dr. Abdullah Noman, Part 2). Numbers in the worked examples are checked here when the file loads. */
  var chk = function (got, want, what) { if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error("lesson number mismatch: " + what + " = " + got + ", expected " + want); };
  var x21a = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "V", 10, { plus: "a", name: "V1" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "V", 10, { plus: "a", name: "V2" }), E([1, 0], [1, 1], "W")] };
  var x21c = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "V", 10, { plus: "a", name: "V1" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "V", 5, { plus: "a", name: "V2" }), E([1, 0], [1, 1], "W")] };
  var x3 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "CCVS", 0.25, { plus: "a", ctrl: "I8", vtext: "ib / 4", name: "D" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "V", 0, { plus: "a", vtext: "", name: "vg" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "I", 8, { dir: "ab", name: "I8" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };

  L["c1-elements-1"] = {
    id: "c1-elements-1", ar: "مصادر الجهد والتيار", en: "Voltage and Current Sources", minutes: 20,
    objectives: ["تميّز بين المصدر المستقل والمصدر التابع وأنواعه الأربعة.", "تحكم على صحة توصيل المصادر المثالية ببعضها.", "تحسب قدرة المصدر وتعرف أنه قد يمتص القدرة لا أن يولّدها فقط."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>عناصر الدائرة نوعان: <b>عنصر نشط</b> <span class='ltr'>(active)</span> يقدر يولّد طاقة، مثل البطاريات والمولدات ومكبرات العمليات، و<b>عنصر خامل</b> <span class='ltr'>(passive)</span> لا يولّد طاقة، مثل المقاومة والملف والمكثف.</p>" +
        "<p>أهم العناصر النشطة هي <b>مصادر الجهد والتيار</b>، وهي نوعان: مستقلة وتابعة.</p>" +
        "<p><b>مصدر الجهد المستقل المثالي</b> يحافظ على جهد محدد بين طرفيه <b>مهما كان التيار</b> المار فيه. و<b>مصدر التيار المستقل المثالي</b> يحافظ على تيار محدد <b>مهما كان الجهد</b> بين طرفيه.</p>" +
        "<p><b>المصدر التابع</b> (أو المتحكَّم فيه) يعطي جهدًا أو تيارًا تعتمد قيمته على جهد أو تيار في مكان آخر من الدائرة. نرسمه على شكل معيّن (diamond).</p>" + depKinds },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Active / Passive element</dt><dd>عنصر يولّد طاقة / عنصر لا يولّدها.</dd>" +
        "<dt>Independent source</dt><dd>مصدر قيمته ثابتة لا تعتمد على بقية الدائرة.</dd>" +
        "<dt>Dependent (controlled) source</dt><dd>مصدر قيمته تعتمد على جهد أو تيار آخر في الدائرة.</dd>" +
        "<dt>μ, α, ρ, β</dt><dd>ثوابت الضرب: μ و β بدون وحدة، α بوحدة A/V، و ρ بوحدة V/A.</dd></dl>" },
      { id: "laws", title: "قواعد التوصيل الصحيح", en: "Valid Connections", html:
        "<ul class='ticks'><li>مصدرا جهد على التوازي يجب أن يكون لهما <b>نفس الجهد ونفس القطبية</b>، وإلا فالتوصيل غير مسموح.</li>" +
        "<li>مصدرا تيار على التوالي يجب أن يكون لهما <b>نفس التيار ونفس الاتجاه</b>، وإلا فالتوصيل غير مسموح.</li>" +
        "<li>مصدر جهد مع مصدر تيار (على التوالي أو التوازي) توصيل <b>صحيح</b> دائمًا: كل منهما يفرض كميته فقط.</li>" +
        "<li>نفس القواعد للمصادر التابعة: قيمة المصدر التابع يجب أن تساوي ما يفرضه المصدر الآخر.</li></ul>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>قبل حل أي دائرة فيها مصادر متصلة ببعضها مباشرة: تحقق أن التوصيل صحيح.</li>" +
        "<li>مع المصدر التابع: حدّد أولًا الكمية المتحكِّمة (vₓ أو iₓ) وأين هي في الدائرة.</li>" +
        "<li>عندما يفرض مصدر مستقل كمية ما، نستخدمها لإيجاد الثابت أو الكمية المتحكمة للمصدر التابع.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 2.1: هل التوصيلات التالية صحيحة؟ (a) مصدرا <span class='ltr'>10 V</span> على التوازي بنفس القطبية. (c) مصدر <span class='ltr'>10 V</span> على التوازي مع مصدر <span class='ltr'>5 V</span>. (b) مصدر <span class='ltr'>5 A</span> على التوالي مع مصدر <span class='ltr'>5 A</span> بنفس الاتجاه. (d) مصدر <span class='ltr'>2 A</span> على التوالي مع مصدر <span class='ltr'>5 A</span>. (e) مصدر <span class='ltr'>5 A</span> على التوالي مع مصدر <span class='ltr'>10 V</span>.</p>" +
        fig(x21a, "مصدرا جهد 10 V على التوازي") + fig(x21c, "مصدر 10 V على التوازي مع مصدر 5 V") +
        "<ol class='steps'><li>(a) صحيح: المصدران يفرضان نفس الجهد 10 V بنفس القطبية.</li>" +
        "<li>(c) غير مسموح: نفس الطرفين لا يمكن أن يكون جهدهما 10 V و 5 V في نفس الوقت.</li>" +
        "<li>(b) صحيح، و (d) غير مسموح: التيار في التوالي واحد، فلا يكون 2 A و 5 A معًا.</li>" +
        "<li>(e) صحيح: مصدر التيار يفرض التيار، ومصدر الجهد يفرض الجهد.</li></ol>" +
        "<p class='q'>مثال 3 (Assessment): في الدائرة، مصدر جهد تابع قيمته <span class='ltr'>i<sub>b</sub> / 4</span> على التوازي مع مصدر جهد مستقل <span class='ltr'>v<sub>g</sub></span> ومصدر تيار <span class='ltr'>8 A</span>، و <span class='ltr'>i<sub>b</sub></span> مرجعه عكس اتجاه مصدر 8 A. (a) ما قيمة <span class='ltr'>v<sub>g</sub></span> ليكون التوصيل صحيحًا؟ (b) ما قدرة مصدر 8 A؟</p>" +
        fig(x3, "مصدر جهد تابع ومصدر جهد مستقل ومصدر تيار 8 A على التوازي") +
        "<ol class='steps'><li>مرجع <span class='ltr'>i<sub>b</sub></span> عكس اتجاه مصدر التيار، إذن <span class='eq-i'>i<sub>b</sub> = −8 A</span>.</li>" +
        "<li>المصدران على التوازي يجب أن يتساويا: <span class='eq-i'>v<sub>g</sub> = i<sub>b</sub> / 4 = −8 / 4 = −2 V</span></li>" +
        "<li><span class='eq-i'>P<sub>8A</sub> = v<sub>g</sub> × 8 = −2 × 8 = −16 W</span>، أي المصدر <b>يعطي</b> 16 W.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>لا توصل بطاريتين مختلفتي الجهد على التوازي (مثل بطارية جديدة وأخرى فارغة): الفرق بينهما يسبب تيارًا كبيرًا جدًا يسخّنهما. هذا هو التوصيل غير المسموح في الواقع. أما المصدر التابع فهو النموذج الذي نمثل به الترانزستور ومكبر العمليات.</p>" }
    ],
    quiz: [
      { q: "مصدر الجهد المثالي يحافظ على:", options: [
        { t: "تيار ثابت مهما كان الجهد", type: "conceptual", why: "هذا تعريف مصدر التيار المثالي." },
        { t: "جهد ثابت بين طرفيه مهما كان التيار", correct: true, why: "التيار المار فيه تحدده بقية الدائرة." },
        { t: "قدرة ثابتة", type: "conceptual", why: "القدرة = جهد × تيار، والتيار يتغير حسب الدائرة." }
      ]},
      { q: "مصدر تيار قيمته <span class='ltr'>βiₓ</span> هو:", options: [
        { t: "<span class='ltr'>CCCS</span>", correct: true, why: "مصدر تيار يتحكم فيه تيار." },
        { t: "<span class='ltr'>VCCS</span>", type: "conceptual", why: "VCCS يتحكم فيه جهد vₓ وليس تيار iₓ." },
        { t: "<span class='ltr'>CCVS</span>", type: "conceptual", why: "CCVS مصدر جهد، أما هنا فالمصدر مصدر تيار." }
      ]},
      { q: "مصدرا تيار مثاليان <span class='ltr'>3 A</span> و <span class='ltr'>3 A</span> على التوالي في نفس الاتجاه:", options: [
        { t: "توصيل صحيح", correct: true, why: "التياران متساويان، فلا تعارض مع KCL." },
        { t: "توصيل غير صحيح دائمًا", type: "conceptual", why: "مصدرا التيار على التوالي يصحّان إذا تساوى التياران." },
        { t: "التيار في الفرع 6 A", type: "conceptual", why: "التيار في الفرع الواحد واحد. المصادر على التوالي لا تجمع تياراتها." }
      ]}
    ],
    practice: {
      prompt: "في الدائرة، مصدر جهد <span class='ltr'>20 V</span> في حلقة واحدة مع مصدر تيار <span class='ltr'>4 A</span>.",
      circuit: c1, figure: fig(c1, "مصدر جهد 20 فولت ومصدر تيار 4 أمبير في حلقة واحدة"),
      steps: [
        { id: "s1", kind: "choice", label: "ما الذي يحدد التيار في هذه الحلقة؟",
          options: [
            { t: "مصدر التيار: التيار <span class='ltr'>4 A</span>", correct: true },
            { t: "مصدر الجهد، والتيار لا يمكن حسابه لعدم وجود مقاومة", type: "conceptual", why: "مصدر الجهد لا يحدد تياره، بل بقية الدائرة. وهنا مصدر التيار على التوالي يفرض 4 A على الحلقة كلها.", review: R("c1-elements-1", "concept", "تعريف المصدرين") },
            { t: "التوصيل غير صحيح ولا يوجد حل", type: "conceptual", why: "مصدر جهد على التوالي مع مصدر تيار توصيل صحيح.", review: R("c1-elements-1", "laws", "قواعد التوصيل الصحيح") }
          ], hints: ["في الحلقة الواحدة، كل العناصر لها نفس التيار. أي عنصر يفرض قيمة التيار؟"], solution: "مصدر التيار يفرض <span class='ltr'>4 A</span> على الحلقة كلها." },
        { id: "s2", label: "احسب القدرة التي <b>يمتصها</b> مصدر الجهد <span class='ltr'>Vs</span>.", symbol: "p =", answer: s1.Vs.p, units: W, unitDefault: 1,
          diagnose: [{ value: -s1.Vs.p, type: "sign", why: "التيار (4 A باتجاه السهم في مصدر التيار) يدور مع عقارب الساعة، فيخرج من الطرف + لمصدر الجهد. حسب اصطلاح الإشارة <span class='ltr'>p = −vi</span>.", review: R("c1-variables-3", "diagram", "الحالات الأربع لاصطلاح الإشارة"), hint: "تتبع التيار: هل يدخل الطرف + لمصدر الجهد أم يخرج منه؟" },
            { value: 5, type: "formula", why: "قسمت الجهد على التيار. القدرة حاصل الضرب <span class='ltr'>p = vi</span>." }],
          hints: ["اتجاه التيار في الحلقة مع عقارب الساعة. في مصدر الجهد (اليسار) يتحرك للأعلى.", "التيار يخرج من الطرف +، إذن <span class='ltr'>p = −vi = −(20)(4)</span>."],
          solution: "<span class='eq-i'>p = −vi = −(20)(4) = −80 W</span>، أي أن مصدر الجهد يولّد 80 W." },
        { id: "s3", label: "احسب القدرة التي يمتصها مصدر التيار <span class='ltr'>Is</span>.", symbol: "p =", answer: s1.Is.p, units: W, unitDefault: 1,
          diagnose: [{ value: -s1.Is.p, type: "sign", why: "مجموع القدرات في الدائرة صفر. مصدر الجهد يولّد 80 W، فلا بد أن يمتصها مصدر التيار. المصدر ليس مولّدًا دائمًا.", review: R("c1-elements-1", "when", "المصدر قد يمتص القدرة") }],
          hints: ["استخدم توازن القدرة: مجموع القدرات = 0."], solution: "<span class='eq-i'>p = +80 W</span>: مصدر التيار يمتص القدرة، و <span class='ltr'>−80 + 80 = 0</span> ✓" },
        { id: "s4", kind: "choice", label: "لو استبدلنا مصدر التيار بمصدر جهد <span class='ltr'>12 V</span>، هل تبقى الدائرة صحيحة؟",
          options: [
            { t: "نعم", type: "conceptual", why: "سيصبح مصدرا الجهد 20 V و 12 V على التوازي بين نفس العقدتين، وهذا يخالف KVL.", review: R("c1-elements-1", "laws", "قواعد التوصيل الصحيح") },
            { t: "لا، لأن مصدري جهد مختلفين سيكونان على التوازي", correct: true },
            { t: "نعم، ويمر تيار كبير جدًا لعدم وجود مقاومة", type: "conceptual", why: "المشكلة ليست في التيار، بل في الجهد: الجهد بين العقدتين لا يمكن أن يكون 20 و 12 معًا، فلا يوجد حل أصلًا." }
          ], hints: ["عنصران فقط بين عقدتين: هل هما على التوالي أم التوازي؟"], solution: "لا. مصدرا جهد مختلفان على التوازي توصيل غير صحيح." }
      ]
    },
    lab: { title: "توصيل المصادر", desc: "في المعمل الذكي ستحاول توصيل مصادر بطرق مختلفة، ويخبرك المعمل متى يكون التوصيل غير صحيح ولماذا." }
  };

  /* ------------------------------------------------------------------ */
  var x23a = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "I", 1, { dir: "ba", name: "Ia" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 8, { name: "R8", vlabel: "va" }), E([1, 0], [1, 1], "W")] };
  var x23b = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "V", 50, { plus: "a", name: "Vb" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 5, { name: "G", vtext: "0.2 S", ilabel: "ib" }), E([1, 0], [1, 1], "W")] };
  var x23c = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "I", 1, { dir: "ab", name: "Ic" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 20, { name: "R20", vlabel: "vc" }), E([1, 0], [1, 1], "W")] };
  var x23d = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "V", 50, { plus: "b", name: "Vd" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 25, { name: "R25", ilabel: "id" }), E([1, 0], [1, 1], "W")] };
  var s23a = solve(x23a), s23b = solve(x23b), s23c = solve(x23c), s23d = solve(x23d);
  chk(s23a.R8.v, 8, "2.3a va"); chk(s23a.R8.p, 8, "2.3a p"); chk(s23b.G.i, 10, "2.3b ib"); chk(s23b.G.p, 500, "2.3b p"); chk(s23c.R20.v, -20, "2.3c vc"); chk(s23c.R20.p, 20, "2.3c p"); chk(s23d.R25.i, -2, "2.3d id"); chk(s23d.R25.p, 100, "2.3d p");

  L["c1-elements-2"] = {
    id: "c1-elements-2", ar: "قانون أوم", en: "Ohm’s Law", minutes: 20,
    objectives: ["تطبق قانون أوم مع اصطلاح الإشارة.", "تحسب الموصلية والقدرة في المقاومة بالصيغ المختلفة.", "تعرف أن المقاومة تمتص القدرة دائمًا."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>المقاومة</b> <span class='ltr'>(resistance)</span> هي قدرة المادة على إعاقة سريان التيار، أي سريان الشحنة. والعنصر الذي يمثل هذا السلوك هو <b>المقاوم</b> <span class='ltr'>(resistor)</span>.</p>" +
        "<p>في التحليل نربط مرجع تيار المقاومة بجهدها بطريقتين: إما في اتجاه <b>هبوط</b> الجهد فيكون <span class='eq-i'>v = iR</span>، أو في اتجاه <b>ارتفاع</b> الجهد فيكون <span class='eq-i'>v = −iR</span>.</p>" +
        "<p>مقلوب المقاومة يسمى <b>الموصلية</b> <span class='ltr'>(conductance)</span>: <span class='eq-i'>G = 1/R</span> وتقاس بالسيمنز <span class='ltr'>(S)</span>.</p>" +
        "<p>المقاومة تمتص القدرة دائمًا، والقدرة عليها موجبة مهما كانت اتجاهات المراجع: <span class='eq-i'>p = i²R = v²/R</span>.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Resistance (R)</dt><dd>إعاقة سريان الشحنة، بالأوم (Ω).</dd><dt>Resistor</dt><dd>العنصر الذي يمثل المقاومة في نموذج الدائرة.</dd>" +
        "<dt>Conductance (G)</dt><dd>مقلوب المقاومة، بالسيمنز (S).</dd></dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq'>v = iR   ←   i = v / R</div><div class='eq'>v = −iR   (مرجع التيار في اتجاه ارتفاع الجهد)</div><div class='eq'>G = 1 / R  (S)</div>" +
        "<p>قدرة المقاومة بثلاث طرق كما في المحاضرة:</p>" +
        "<div class='eq'>p = vi  أو  p = −vi</div><div class='eq'>p = (iR)i = i²R = i² / G</div><div class='eq'>p = v·(v/R) = v² / R = v²G</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>انظر لاتجاه التيار بالنسبة لقطبية الجهد قبل كتابة v = iR أو v = −iR.</li>" +
        "<li>إذا عندك التيار فقط استخدم <span class='ltr'>p = i²R</span>، وإذا عندك الجهد فقط استخدم <span class='ltr'>p = v²/R</span>.</li>" +
        "<li>إذا أعطيت الموصلية G بالسيمنز: <span class='ltr'>i = vG</span> و <span class='ltr'>p = v²G</span>.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 2.3: في كل دائرة، إحدى القيمتين v أو i مجهولة. (a) أوجد الجهد والتيار. (b) أوجد القدرة المستهلكة في كل مقاومة.</p>" +
        "<div class='lfig'>" + CV.draw.render(x23a, { aria: "مصدر 1 A مع مقاومة 8 Ω" }) + CV.draw.render(x23b, { aria: "مصدر 50 V مع موصلية 0.2 S" }) + "</div>" +
        "<div class='lfig'>" + CV.draw.render(x23c, { aria: "مصدر 1 A مع مقاومة 20 Ω" }) + CV.draw.render(x23d, { aria: "مصدر 50 V مع مقاومة 25 Ω" }) + "</div>" +
        "<ol class='steps'><li>(a) <span class='ltr'>v<sub>a</sub></span> هبوط في اتجاه التيار: <span class='eq-i'>v<sub>a</sub> = (1)(8) = 8 V</span>، و <span class='eq-i'>p = (8)²/8 = (1)²(8) = 8 W</span></li>" +
        "<li>(b) <span class='ltr'>i<sub>b</sub></span> في اتجاه هبوط الجهد: <span class='eq-i'>i<sub>b</sub> = (50)(0.2) = 10 A</span>، و <span class='eq-i'>p = (50)²(0.2) = 500 W</span></li>" +
        "<li>(c) <span class='ltr'>v<sub>c</sub></span> ارتفاع في اتجاه التيار: <span class='eq-i'>v<sub>c</sub> = −(1)(20) = −20 V</span>، و <span class='eq-i'>p = (−20)²/20 = (1)²(20) = 20 W</span></li>" +
        "<li>(d) <span class='ltr'>i<sub>d</sub></span> في اتجاه ارتفاع الجهد: <span class='eq-i'>i<sub>d</sub> = −50/25 = −2 A</span>، و <span class='eq-i'>p = (50)²/25 = (−2)²(25) = 100 W</span></li></ol>" +
        "<p class='muted'>لاحظ: الإشارة السالبة في (c) و (d) جاءت من اتجاه المراجع فقط، والقدرة في كل الحالات موجبة لأن المقاومة تمتص دائمًا.</p>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>سخان الماء الكهربائي مقاومة تحول القدرة <span class='ltr'>v²/R</span> إلى حرارة. سخان مقاومته <span class='ltr'>24.2 Ω</span> على <span class='ltr'>220 V</span> يستهلك <span class='ltr'>2000 W</span>.</p>" }
    ],
    quiz: [
      { q: "مرجع التيار يدخل الطرف <b>السالب</b> لمقاومة. قانون أوم يصبح:", options: [
        { t: "<span class='ltr'>v = iR</span>", type: "sign", why: "v = iR عندما يدخل التيار الطرف الموجب." },
        { t: "<span class='ltr'>v = −iR</span>", correct: true, why: "دخول التيار من الطرف السالب يعكس الإشارة." },
        { t: "<span class='ltr'>v = i / R</span>", type: "formula", why: "الجهد حاصل ضرب التيار في المقاومة." }
      ]},
      { q: "مقاومة <span class='ltr'>250 Ω</span>. موصليتها:", options: [
        { t: "<span class='ltr'>4 mS</span>", correct: true, why: "G = 1/250 = 0.004 S = 4 mS." },
        { t: "<span class='ltr'>250 S</span>", type: "formula", why: "الموصلية مقلوب المقاومة." },
        { t: "<span class='ltr'>0.4 S</span>", type: "unit", why: "1/250 = 0.004 وليس 0.4." }
      ]},
      { q: "حسبت قدرة مقاومة فخرجت <span class='ltr'>−12 W</span>. ماذا يعني ذلك؟", options: [
        { t: "المقاومة تولّد 12 W", type: "conceptual", why: "المقاومة عنصر سلبي لا يولّد القدرة أبدًا." },
        { t: "يوجد خطأ في الإشارة في حلّك", correct: true, why: "قدرة المقاومة موجبة دائمًا. راجع اصطلاح الإشارة أو إشارة التيار." },
        { t: "التيار في عكس اتجاه السهم", type: "sign", why: "حتى لو كان التيار سالبًا، p = i²R تبقى موجبة." }
      ]}
    ],
    practice: {
      prompt: "مقاومة <span class='ltr'>12 Ω</span> عليها جهد <span class='ltr'>v = 18 V</span> (الطرف + في الأعلى)، ومرجع التيار يدخل من طرفها <b>السالب</b> (يخرج من الأعلى).",
      figure: CV.elemDiagram({ plusTop: true, arrow: "up", v: "18 V", i: "i", name: "12 Ω", aria: "مقاومة 12 أوم وجهدها 18 فولت والتيار يخرج من الطرف الموجب" }),
      steps: [
        { id: "s1", label: "احسب التيار i باتجاه المرجع المرسوم.", symbol: "i =", answer: -1.5, units: A, unitDefault: 1,
          diagnose: [{ value: 1.5, type: "sign", why: "مرجع التيار يدخل الطرف السالب، فالقانون <span class='ltr'>v = −iR</span>، أي <span class='ltr'>i = −v/R</span>.", review: R("c1-elements-2", "concept", "قانون أوم مع اصطلاح الإشارة"), hint: "انظر: هل السهم يدخل الطرف + أم −؟" },
            { value: 216, type: "formula", why: "ضربت الجهد في المقاومة. التيار = الجهد ÷ المقاومة." },
            { value: 0.6667, type: "formula", why: "قسمت المقاومة على الجهد. التيار = الجهد ÷ المقاومة." }],
          hints: ["السهم يخرج من الطرف +، أي يدخل من −.", "<span class='ltr'>18 = −i × 12</span>."], solution: "<span class='eq-i'>v = −iR → i = −18/12 = −1.5 A</span>: التيار الفعلي 1.5 A عكس السهم." },
        { id: "s2", label: "احسب القدرة التي تمتصها المقاومة.", symbol: "p =", answer: 27, units: W, unitDefault: 1,
          diagnose: [{ value: -27, type: "sign", why: "المقاومة تمتص القدرة دائمًا. صيغة <span class='ltr'>v²/R</span> أو <span class='ltr'>i²R</span> لا تعطي قيمة سالبة.", review: R("c1-elements-2", "laws", "صيغ قدرة المقاومة") },
            { value: 324, type: "formula", why: "حسبت v² ونسيت القسمة على R." }, { value: 1.5, type: "formula", why: "حسبت v/R، وهذا التيار وليس القدرة." }, { value: 216, type: "formula", why: "ضربت v في R. القدرة <span class='ltr'>v²/R</span>." }],
          hints: ["<span class='ltr'>p = v²/R</span>."], solution: "<span class='eq-i'>p = v²/R = 18²/12 = 27 W</span>" },
        { id: "s3", label: "احسب موصلية المقاومة G.", symbol: "G =", answer: 1 / 12, units: [{ l: "mS", f: 1e-3 }, { l: "S", f: 1 }], unitDefault: 1,
          diagnose: [{ value: 12, type: "formula", why: "الموصلية <b>مقلوب</b> المقاومة: <span class='ltr'>G = 1/R</span>." }],
          hints: ["<span class='ltr'>G = 1/R</span>."], solution: "<span class='eq-i'>G = 1/12 ≈ 0.0833 S = 83.3 mS</span>" }
      ]
    },
    lab: { title: "قياس قانون أوم", desc: "في المعمل الذكي ستغيّر جهد المصدر على مقاومة وتقيس التيار، وترسم العلاقة بينهما لتتحقق أنها خط مستقيم ميله 1/R." }
  };

  /* ------------------------------------------------------------------ */
  var c3ex = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 24, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 4, { name: "R1", ilabel: "i₁" }), E([0, 1], [1, 1], "R", 12, { name: "R2", ilabel: "i₂" }), E([0, 1], [0, 2], "R", 2, { name: "R3", ilabel: "i₃" }), E([0, 2], [1, 2], "R", 4, { name: "R4" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var c3 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 30, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 5, { name: "R1", ilabel: "i₁" }), E([0, 1], [1, 1], "R", 10, { name: "R2", ilabel: "i₂" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "I", 1.5, { dir: "ab", name: "Is" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var s3 = solve(c3);

  var x28 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 120, { plus: "a", name: "V120" }), E([0, 0], [0, 1], "R", 10, { name: "R10", ilabel: "i₀" }), E([0, 1], [1, 1], "R", 50, { name: "R50", ilabel: "i₁" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "I", 6, { dir: "ba", name: "I6" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var s28 = solve(x28);
  chk(s28.R10.i, -3, "2.8 io"); chk(s28.R50.i, 3, "2.8 i1"); chk(s28.R50.p, 450, "2.8 p50"); chk(s28.R10.p, 90, "2.8 p10"); chk(s28.I6.p, -900, "2.8 p6A");
  var xKL = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "R", 1, { name: "X1", vtext: "" }), E([0, 0], [0, 1], "R", 1, { name: "X2", vtext: "" }), E([0, 1], [1, 1], "R", 1, { name: "X3", vtext: "" }), E([0, 1], [0, 2], "R", 1, { name: "X4", vtext: "" }), E([0, 2], [1, 2], "R", 1, { name: "X5", vtext: "" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "R", 1, { name: "X6", vtext: "" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W"), E([1, 2], [1, 3], "W")] };

  L["c1-elements-3"] = {
    id: "c1-elements-3", ar: "قانونا كيرشوف", en: "Kirchhoff’s Laws", minutes: 30,
    objectives: ["تكتب معادلة KCL عند أي عقدة بإشارات صحيحة.", "تكتب معادلة KVL حول أي مسار مغلق.", "تجمع KCL و KVL وقانون أوم لحل دائرة بأكثر من حلقة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>قبل قوانين كيرشوف نحتاج ثلاثة تعريفات من الرسم:</p>" +
        "<ul><li><b>العقدة</b> <span class='ltr'>(node)</span>: نقطة يلتقي عندها عنصران أو أكثر. نحتاج تحديدها لنطبق KCL.</li>" +
        "<li><b>الفرع</b> <span class='ltr'>(branch)</span>: كل عنصر في الدائرة يمثل فرعًا.</li>" +
        "<li><b>الحلقة</b> <span class='ltr'>(loop)</span>: مسار مغلق نبدأ فيه من عقدة ونمر بعناصر ونرجع لنفس العقدة دون أن نمر بأي عقدة وسطى أكثر من مرة.</li></ul>" +
        fig(xKL, "شبكة فيها ستة فروع X1 إلى X6") +
        "<p>في هذه الشبكة 4 عقد (A في أعلى X1، و B فوق X3، و C فوق X5 و X6، و D العقدة السفلية)، و 6 فروع، و 6 حلقات: (X1 X2 X3)، (X3 X4 X5)، (X5 X6)، (X1 X2 X4 X5)، (X1 X2 X4 X6)، (X3 X4 X6).</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Node</dt><dd>نقطة التقاء عنصرين أو أكثر.</dd><dt>Branch</dt><dd>كل عنصر في الشبكة.</dd><dt>Loop (closed path)</dt><dd>مسار مغلق لا يمر بعقدة وسطى مرتين.</dd>" +
        "<dt>KCL</dt><dd>قانون كيرشوف للتيار، يطبق عند العقد.</dd><dt>KVL</dt><dd>قانون كيرشوف للجهد، يطبق حول الحلقات.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Laws", html:
        "<p><b>KCL:</b> المجموع الجبري لكل التيارات عند أي عقدة يساوي صفرًا.</p>" +
        "<div class='eq'>Σ i<sub>out</sub> − Σ i<sub>in</sub> = 0   ←   Σ i<sub>in</sub> = Σ i<sub>out</sub></div>" +
        "<p><b>KVL:</b> المجموع الجبري لكل الجهود حول أي مسار مغلق يساوي صفرًا.</p>" +
        "<div class='eq'>Σ v<sub>rise</sub> − Σ v<sub>drop</sub> = 0   ←   Σ v<sub>rise</sub> = Σ v<sub>drop</sub></div>" +
        "<p class='muted'>في الشبكة أعلاه: عند A <span class='ltr'>i₁ = i₂</span>، وعند B <span class='ltr'>i₂ = i₃ + i₄</span>، وعند C <span class='ltr'>i₄ = i₅ + i₆</span>، وعند D <span class='ltr'>i₁ = i₃ + i₅ + i₆</span>. وحول الحلقة (X1 X2 X3): <span class='ltr'>v₁ + v₂ = v₃</span>، وحول (X5 X6): <span class='ltr'>v₅ = v₆</span>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>عدّ المجاهيل أولًا، ثم اكتب معادلات مستقلة بعددها: KCL عند العقد و KVL حول الحلقات.</li>" +
        "<li>مع n عقدة تكفي n − 1 معادلة KCL مستقلة؛ معادلة العقدة الأخيرة تتكرر.</li>" +
        "<li>تجنب حلقة تمر بمصدر تيار لأن جهده مجهول.</li>" +
        "<li>بعد الحل تحقق: القدرة المعطاة = القدرة الممتصة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 2.8: مصدر <span class='ltr'>120 V</span>، ومقاومة <span class='ltr'>10 Ω</span> يمر فيها <span class='ltr'>i₀</span>، ومقاومة <span class='ltr'>50 Ω</span> يمر فيها <span class='ltr'>i₁</span>، ومصدر تيار <span class='ltr'>6 A</span> يدخل العقدة b. (a) أوجد i₀ و i₁. (b) تحقق من توازن القدرة.</p>" +
        fig(x28, "مصدر 120 V ومقاومتان 10 Ω و 50 Ω ومصدر تيار 6 A") +
        "<ol class='steps'><li>مجهولان: i₀ و i₁، نحتاج معادلتين.</li>" +
        "<li>KCL عند العقدة b: <span class='eq-i'>i₁ − i₀ − 6 = 0</span></li>" +
        "<li>KVL حول المسار الأيسر: <span class='eq-i'>−120 + 10i₀ + 50i₁ = 0</span></li>" +
        "<li>بالتعويض: <span class='eq-i'>−120 + 10i₀ + 50(i₀ + 6) = 0 ← i₀ = −3 A, i₁ = 3 A</span></li>" +
        "<li>القدرات: <span class='eq-i'>p<sub>50Ω</sub> = (3)²(50) = 450 W</span>، <span class='eq-i'>p<sub>10Ω</sub> = (−3)²(10) = 90 W</span>، <span class='eq-i'>p<sub>120V</sub> = −120 i₀ = 360 W</span> (يمتص)، <span class='eq-i'>p<sub>6A</sub> = −(50 i₁)(6) = −900 W</span> (يعطي).</li>" +
        "<li>التحقق: <span class='eq-i'>360 + 450 + 90 = 900 W</span> = القدرة المعطاة.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>لوحة التوزيع في البيت عقدة كبيرة: التيار الداخل من العداد = مجموع تيارات القواطع الخارجة لكل غرفة. هذا KCL، وعليه يُختار حجم القاطع الرئيسي.</p>" }
    ],
    quiz: [
      { q: "ثلاثة تيارات تدخل عقدة: <span class='ltr'>2 A</span> و <span class='ltr'>5 A</span>، وتيار <span class='ltr'>i</span> يخرج منها. قيمة i:", options: [
        { t: "<span class='ltr'>7 A</span>", correct: true, why: "الداخل = الخارج: 2 + 5 = i." },
        { t: "<span class='ltr'>3 A</span>", type: "sign", why: "طرحت بدل الجمع. التياران يدخلان العقدة، وi يخرج، فالداخل = الخارج." },
        { t: "<span class='ltr'>−7 A</span>", type: "sign", why: "i معرّف خارجًا، والتيارات الداخلة موجبة، فـ i موجبة." }
      ]},
      { q: "KVL مبني على مبدأ حفظ:", options: [
        { t: "الطاقة", correct: true, why: "الشحنة التي تدور حول حلقة وتعود لنقطة البداية لا تكسب ولا تفقد طاقة." },
        { t: "الشحنة", type: "conceptual", why: "حفظ الشحنة هو أساس KCL." },
        { t: "التيار", type: "conceptual", why: "KVL قانون للجهود، وهو مبني على حفظ الطاقة." }
      ]},
      { q: "لماذا نتجنب كتابة KVL حول حلقة تمر بمصدر تيار؟", options: [
        { t: "لأن KVL لا ينطبق عليها", type: "conceptual", why: "KVL ينطبق على كل حلقة. المشكلة أن جهد مصدر التيار مجهول." },
        { t: "لأن جهد مصدر التيار مجهول ويضيف مجهولًا جديدًا", correct: true, why: "يمكن كتابتها، لكنها تضيف مجهولًا بدل أن تساعد في الحل." },
        { t: "لأن التيار فيها صفر", type: "conceptual", why: "التيار في فرع مصدر التيار يساوي قيمة المصدر وليس صفرًا." }
      ]}
    ],
    practice: {
      prompt: "في الدائرة: مصدر <span class='ltr'>30 V</span>، و <span class='ltr'>R1 = 5 Ω</span>، و <span class='ltr'>R2 = 10 Ω</span>، ومصدر تيار <span class='ltr'>1.5 A</span>. أوجد التيارات وقدرة مصدر التيار.",
      circuit: c3, figure: fig(c3, "مصدر 30 فولت ومقاومتان ومصدر تيار 1.5 أمبير"),
      steps: [
        { id: "s1", kind: "choice", label: "ما معادلة KCL الصحيحة عند العقدة العليا الوسطى؟",
          options: [
            { t: "<span class='ltr'>i₁ = i₂ + 1.5</span>", correct: true },
            { t: "<span class='ltr'>i₁ + i₂ = 1.5</span>", type: "sign", why: "i₁ يدخل العقدة، أما i₂ والتيار 1.5 A فيخرجان منها. الداخل = الخارج.", review: R("c1-elements-3", "laws", "قواعد إشارات KCL") },
            { t: "<span class='ltr'>i₁ = i₂ − 1.5</span>", type: "sign", why: "سهم مصدر التيار يتجه للأسفل، أي أن 1.5 A <b>تخرج</b> من العقدة العليا عبر فرع المصدر.", review: R("c1-elements-3", "laws", "قواعد إشارات KCL") }
          ], hints: ["حدد لكل تيار: هل سهمه داخل إلى العقدة أم خارج منها؟"], solution: "<span class='eq-i'>i₁ = i₂ + 1.5</span>" },
        { id: "s2", label: "استخدم KVL في الحلقة اليسرى مع معادلة KCL لحساب <span class='ltr'>i₂</span>.", symbol: "i₂ =", answer: s3.R2.i, units: A, unitDefault: 1,
          diagnose: [{ value: 2, type: "conceptual", why: "حسبت <span class='ltr'>30 / (5 + 10)</span> كأن R1 و R2 على التوالي. لكن مصدر التيار يسحب 1.5 A من العقدة، فتيار R1 لا يساوي تيار R2.", review: R("c1-elements-3", "when", "متى نكتب KCL"), hint: "عوّض <span class='ltr'>i₁ = i₂ + 1.5</span> في معادلة KVL." },
            { value: s3.R1.i, type: "substitution", why: "هذه قيمة <span class='ltr'>i₁</span> وليس <span class='ltr'>i₂</span>." },
            { value: 2.5, type: "sign", why: "عوّضت <span class='ltr'>i₁ = i₂ − 1.5</span>. راجع اتجاه مصدر التيار في معادلة KCL." }],
          hints: ["KVL في الحلقة اليسرى: <span class='ltr'>−30 + 5i₁ + 10i₂ = 0</span>.", "عوّض <span class='ltr'>i₁ = i₂ + 1.5</span>: <span class='ltr'>30 = 5i₂ + 7.5 + 10i₂</span>."],
          solution: "<span class='eq-i'>30 = 5(i₂ + 1.5) + 10i₂ → 15i₂ = 22.5 → i₂ = 1.5 A</span>" },
        { id: "s3", label: "احسب <span class='ltr'>i₁</span>.", symbol: "i₁ =", answer: s3.R1.i, units: A, unitDefault: 1,
          diagnose: [{ value: 0, type: "sign", why: "طرحت 1.5 بدل الجمع. من KCL: <span class='ltr'>i₁ = i₂ + 1.5</span>." }],
          hints: ["من KCL: <span class='ltr'>i₁ = i₂ + 1.5</span>."], solution: "<span class='eq-i'>i₁ = 1.5 + 1.5 = 3 A</span>" },
        { id: "s4", label: "احسب القدرة التي يمتصها مصدر التيار.", symbol: "p =", answer: s3.Is.p, units: W, unitDefault: 1,
          diagnose: [{ value: -s3.Is.p, type: "sign", why: "سهم مصدر التيار يدخل طرفه العلوي، والطرف العلوي هو الموجب لأن جهده يساوي جهد R2. حسب اصطلاح الإشارة <span class='ltr'>p = vi</span> موجبة: المصدر يمتص.", review: R("c1-variables-3", "concept", "اصطلاح الإشارة") },
            { value: 45, type: "substitution", why: "استخدمت جهد المصدر 30 V. الجهد على مصدر التيار يساوي جهد R2 لأنهما على التوازي: <span class='ltr'>v = 10 × 1.5 = 15 V</span>.", hint: "مصدر التيار على التوازي مع R2." }],
          hints: ["الجهد على مصدر التيار = جهد R2.", "<span class='ltr'>v = i₂ R2 = 15 V</span>، والتيار يدخل الطرف الموجب."],
          solution: "<span class='eq-i'>v = 10 × 1.5 = 15 V</span>، <span class='eq-i'>p = vi = 15 × 1.5 = 22.5 W</span> ممتصة." }
      ]
    },
    generator: { title: "تمارين مولّدة على KCL و KVL", families: ["loop", "pair", "ladder"], types: ["iR", "vR", "pSrc"] },
    lab: { title: "التحقق من KCL و KVL بالقياس", desc: "في المعمل الذكي ستبني دائرة سلم، وتقيس التيارات عند عقدة والجهود حول حلقة، وتتحقق أن مجموعها صفر." }
  };

  /* ------------------------------------------------------------------ */
  var c4ex = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 20, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 4, { name: "R1", isCtrl: true }), E([0, 1], [1, 1], "R", 8, { name: "R2" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "CCCS", 0.5, { dir: "ab", ctrl: "R1", name: "D" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var c4 = { rows: 2, cols: 2, edges: [E([0, 0], [1, 0], "V", 12, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 2, { name: "R1", ilabel: "i" }), E([0, 1], [1, 1], "R", 4, { name: "R2", isCtrl: true }), E([1, 0], [1, 1], "VCVS", 0.5, { plus: "a", ctrl: "R2", name: "D" })] };
  var s4 = solve(c4);

  var x222 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 500, { plus: "a", name: "V500" }), E([0, 0], [0, 1], "R", 5, { name: "R5", ilabel: "iΔ" }), E([0, 1], [1, 1], "R", 20, { name: "R20", ilabel: "i₀", vlabel: "v₀" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "CCCS", 5, { dir: "ba", ctrl: "R5", vtext: "5 iΔ", name: "D" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  var s222 = solve(x222); chk(s222.R5.i, 4, "2.22 iΔ"); chk(s222.R20.i, 24, "2.22 io"); chk(s222.R20.v, 480, "2.22 vo");
  var x210 = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 10, { plus: "a", name: "V10" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 6, { name: "R6", ilabel: "iₛ" }), E([0, 2], [1, 2], "CCVS", 3, { plus: "a", ctrl: "R6", vtext: "3 iₛ", name: "D" }), E([0, 2], [0, 3], "R", 2, { name: "R2", ilabel: "i₀" }), E([0, 3], [1, 3], "R", 3, { name: "R3", vlabel: "v₀" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W"), E([1, 2], [1, 3], "W")] };
  var s210 = solve(x210); chk(s210.R6.i, 10 / 6, "2.10 is"); chk(s210.R2.i, 1, "2.10 io"); chk(s210.R3.v, 3, "2.10 vo"); chk(s210.D.p, -5, "2.10 p dep");

  L["c1-elements-4"] = {
    id: "c1-elements-4", ar: "تحليل دائرة فيها مصادر تابعة", en: "Analysis of a Circuit Containing Dependent Sources", minutes: 30,
    objectives: ["تكتب معادلة القيد للمصدر التابع بدلالة الكمية المتحكِّمة.", "تحل دائرة فيها مصدر تابع بـ KCL و KVL.", "تحسب قدرة المصدر التابع وتتحقق من توازن القدرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>نحلل الدائرة التي فيها مصدر تابع بنفس الأدوات: <b>KVL و KCL وقانون أوم</b>. الفرق الوحيد أن المصدر التابع يضيف <b>معادلة قيد</b> تربط قيمته بالكمية المتحكِّمة.</p>" +
        "<p>الخطوات كما في المحاضرة: (1) حدّد المجاهيل. (2) إذا عرفنا الكمية المتحكِّمة عرفنا قيمة المصدر التابع. (3) اكتب معادلات بعدد المجاهيل من KVL و KCL. (4) احسب المطلوب بقانون أوم، وتحقق من توازن القدرة.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Controlling variable</dt><dd>الجهد أو التيار الذي تعتمد عليه قيمة المصدر التابع (vₓ أو iₓ أو i<sub>Δ</sub>).</dd>" +
        "<dt>Constraint equation</dt><dd>المعادلة التي تعبّر عن المصدر التابع بدلالة الكمية المتحكِّمة.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>KVL: Σ v = 0 حول كل حلقة</div><div class='eq'>KCL: Σ i = 0 عند كل عقدة</div><div class='eq'>المصدر التابع: v = μvₓ, ρiₓ  أو  i = αvₓ, βiₓ</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>اكتب الكمية المتحكِّمة بدلالة المجاهيل التي اخترتها، ولا تعاملها كمجهول جديد بلا معادلة.</li>" +
        "<li>المصدر التابع قد يعطي قدرة أو يمتصها؛ احسب قدرته بنفس اصطلاح الإشارة.</li>" +
        "<li>في النهاية: مجموع القدرة المعطاة من المصادر (المستقلة والتابعة) = مجموع القدرة الممتصة.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Examples", html:
        "<p class='q'>مثال (الشكل 2.22): مصدر <span class='ltr'>500 V</span>، ومقاومة <span class='ltr'>5 Ω</span> يمر فيها <span class='ltr'>i<sub>Δ</sub></span>، ومقاومة <span class='ltr'>20 Ω</span> جهدها <span class='ltr'>v₀</span>، ومصدر تيار تابع <span class='ltr'>5 i<sub>Δ</sub></span>. أوجد <span class='ltr'>v₀</span>.</p>" +
        fig(x222, "مصدر 500 V ومقاومتان 5 Ω و 20 Ω ومصدر تيار تابع 5 iΔ") +
        "<ol class='steps'><li>تيار مصدر 500 V هو i<sub>Δ</sub>، وإذا عرفنا i₀ نحسب v₀ بقانون أوم.</li>" +
        "<li>KVL حول الحلقة اليسرى: <span class='eq-i'>500 = 5 i<sub>Δ</sub> + 20 i₀</span></li>" +
        "<li>KCL عند العقدة b: <span class='eq-i'>i₀ = i<sub>Δ</sub> + 5 i<sub>Δ</sub> = 6 i<sub>Δ</sub></span></li>" +
        "<li><span class='eq-i'>500 = 5 i<sub>Δ</sub> + 120 i<sub>Δ</sub> ← i<sub>Δ</sub> = 4 A, i₀ = 24 A</span></li>" +
        "<li><span class='eq-i'>v₀ = 20 i₀ = 20 × 24 = 480 V</span></li></ol>" +
        "<p class='q'>مثال 2.10: مصدر <span class='ltr'>10 V</span> مع مقاومة <span class='ltr'>6 Ω</span> يمر فيها <span class='ltr'>i<sub>s</sub></span> في الحلقة اليسرى، ومصدر جهد تابع <span class='ltr'>3 i<sub>s</sub></span> مع <span class='ltr'>2 Ω</span> و <span class='ltr'>3 Ω</span> في الحلقة اليمنى. (a) أوجد <span class='ltr'>v₀</span>. (b) تحقق أن القدرة المعطاة = القدرة المستهلكة.</p>" +
        fig(x210, "حلقتان: مصدر 10 V مع 6 Ω، ومصدر تابع 3 is مع 2 Ω و 3 Ω") +
        "<ol class='steps'><li>KVL يسار: <span class='eq-i'>10 = 6 i<sub>s</sub> ← i<sub>s</sub> = 1.67 A</span></li>" +
        "<li>KVL يمين: <span class='eq-i'>3 i<sub>s</sub> = 2 i₀ + 3 i₀ ← i₀ = 1 A</span>، و <span class='eq-i'>v₀ = 3 i₀ = 3 V</span></li>" +
        "<li>قدرة المصدر المستقل: <span class='eq-i'>p = (10)(−1.67) = −16.7 W</span>، وقدرة المصدر التابع: <span class='eq-i'>p = (3 i<sub>s</sub>)(−i₀) = (5)(−1) = −5 W</span>. المصدران يعطيان معًا <span class='ltr'>21.7 W</span>.</li>" +
        "<li>المقاومات: <span class='eq-i'>(1.67)²(6) + (1)²(2) + (1)²(3) = 16.7 + 2 + 3 = 21.7 W</span> ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>الترانزستور في المكبرات نمثله بمصدر تيار تابع <span class='ltr'>βi_B</span>: تيار صغير في القاعدة يتحكم في تيار أكبر بكثير في المجمّع. هذا مثال 2.11 في المحاضرة (دائرة المكبر).</p>" }
    ],
    quiz: [
      { q: "في مثال الشكل 2.22، لماذا <span class='ltr'>i₀ = 6 i<sub>Δ</sub></span>؟", options: [
        { t: "من KCL عند العقدة b: يدخلها i<sub>Δ</sub> و 5i<sub>Δ</sub> ويخرج i₀", correct: true, why: "مجموع الداخل = مجموع الخارج: i₀ = i<sub>Δ</sub> + 5i<sub>Δ</sub>." },
        { t: "من KVL حول الحلقة اليسرى", type: "conceptual", why: "KVL يعطي 500 = 5i<sub>Δ</sub> + 20i₀. العلاقة بين التيارين جاءت من KCL." },
        { t: "لأن 20 Ω أكبر من 5 Ω بأربع مرات", type: "conceptual", why: "النسبة بين التيارين لا تأتي من نسبة المقاومات هنا، بل من المصدر التابع و KCL." }
      ]},
      { q: "معادلة القيد للمصدر التابع تعبّر عن:", options: [
        { t: "قيمة المصدر بدلالة الكمية المتحكِّمة", correct: true, why: "مثل i = 5 i<sub>Δ</sub> أو v = 3 i<sub>s</sub>." },
        { t: "قيمة ثابتة لا تتغير", type: "conceptual", why: "هذه صفة المصدر المستقل." },
        { t: "قانون KCL عند عقدة المصدر", type: "conceptual", why: "KCL معادلة منفصلة. القيد يربط المصدر بالكمية التي تتحكم فيه." }
      ]},
      { q: "مصدر جهد تابع قيمته <span class='ltr'>3 i<sub>s</sub></span>. وحدة الثابت 3 هي:", options: [
        { t: "<span class='ltr'>V/A</span> (أوم)", correct: true, why: "جهد ÷ تيار = V/A، وهو الثابت ρ لمصدر الجهد المتحكَّم فيه بتيار." },
        { t: "بدون وحدة", type: "unit", why: "الثابت بدون وحدة يكون عندما تكون الكميتان من نفس النوع (μ و β)." },
        { t: "<span class='ltr'>A/V</span>", type: "unit", why: "A/V وحدة α لمصدر تيار يتحكم فيه جهد." }
      ]},
      { q: "في مثال 2.10، المصدر التابع قدرته <span class='ltr'>−5 W</span>. ماذا يعني ذلك؟", options: [
        { t: "يعطي 5 W للدائرة", correct: true, why: "القدرة السالبة تعني أن العنصر يعطي القدرة." },
        { t: "يمتص 5 W", type: "sign", why: "مع اصطلاح الإشارة الخاملة، القدرة الموجبة امتصاص والسالبة إعطاء." },
        { t: "المصدر التابع لا يمكن أن يعطي قدرة", type: "conceptual", why: "المصدر التابع عنصر نشط، وقد يعطي قدرة كما هنا." }
      ]}
    ],
    practice: {
      prompt: "حلقة واحدة فيها مصدر <span class='ltr'>12 V</span>، و <span class='ltr'>R1 = 2 Ω</span>، و <span class='ltr'>R2 = 4 Ω</span>، ومصدر جهد تابع قيمته <span class='ltr'>0.5 vₓ</span> حيث <span class='ltr'>vₓ</span> جهد <span class='ltr'>R2</span> بالقطبية المرسومة.",
      circuit: c4, figure: fig(c4, "حلقة فيها مصدر 12 فولت ومقاومتان ومصدر جهد تابع قيمته نصف vₓ"),
      steps: [
        { id: "s1", kind: "choice", label: "ما معادلة القيد التي تربط <span class='ltr'>vₓ</span> بتيار الحلقة <span class='ltr'>i</span>؟",
          options: [
            { t: "<span class='ltr'>vₓ = 4i</span>", correct: true },
            { t: "<span class='ltr'>vₓ = −4i</span>", type: "sign", why: "تيار الحلقة i (مع عقارب الساعة) يدخل R2 من طرفها العلوي، وهو الطرف + لـ vₓ. إذن <span class='ltr'>vₓ = +iR2</span>.", review: R("c1-elements-2", "concept", "قانون أوم مع اصطلاح الإشارة") },
            { t: "<span class='ltr'>vₓ = 12</span>", type: "conceptual", why: "vₓ هو الجهد على R2 وليس جهد المصدر. المصدر يتوزع جهده على كل عناصر الحلقة.", review: R("c1-elements-4", "concept", "معادلة القيد") }
          ], hints: ["vₓ جهد R2 فقط. استخدم قانون أوم عليها."], solution: "<span class='eq-i'>vₓ = 4i</span>" },
        { id: "s2", label: "اكتب KVL حول الحلقة واحسب تيار الحلقة <span class='ltr'>i</span>.", symbol: "i =", answer: s4.R1.i, units: A, unitDefault: 1,
          diagnose: [{ value: 2, type: "conceptual", why: "تجاهلت المصدر التابع: <span class='ltr'>12 / 6 = 2</span>. المصدر التابع جزء من الحلقة ويجب إضافة جهده في KVL.", review: R("c1-elements-4", "when", "لا تتجاهل المصدر التابع"), hint: "جهد المصدر التابع <span class='ltr'>0.5vₓ = 2i</span>." },
            { value: 1.5, type: "sign", why: "أخذت جهد المصدر التابع بإشارة معكوسة. أثناء الدوران مع عقارب الساعة تدخله من طرفه السالب (اليمين)، فهو <b>ارتفاع</b> في الجهد مثل المصدر المستقل.", review: R("c1-elements-3", "laws", "إشارات KVL"), hint: "قارن قطبية المصدر التابع باتجاه دورانك." }],
          hints: ["مع عقارب الساعة: <span class='ltr'>−12 + 2i + 4i − 0.5vₓ = 0</span>.", "عوّض <span class='ltr'>vₓ = 4i</span>: <span class='ltr'>12 = 6i − 2i</span>."],
          solution: "<span class='eq-i'>−12 + 2i + 4i − 0.5(4i) = 0 → 4i = 12 → i = 3 A</span>" },
        { id: "s3", label: "احسب <span class='ltr'>vₓ</span>.", symbol: "vₓ =", answer: s4.R2.v, units: V, unitDefault: 1,
          diagnose: [{ value: 6, type: "substitution", why: "هذا جهد المصدر التابع <span class='ltr'>(0.5vₓ)</span> وليس vₓ." }],
          hints: ["<span class='ltr'>vₓ = 4i</span>."], solution: "<span class='eq-i'>vₓ = 4 × 3 = 12 V</span>" },
        { id: "s4", label: "احسب القدرة التي يمتصها المصدر التابع.", symbol: "p =", answer: s4.D.p, units: W, unitDefault: 1,
          diagnose: [{ value: -s4.D.p, type: "sign", why: "جهد المصدر التابع <span class='ltr'>6 V</span> والطرف + على اليسار. تيار الحلقة يتحرك في الضلع السفلي من اليمين لليسار، أي يخرج من الطرف +، فالقدرة الممتصة <span class='ltr'>p = −vi</span>.", review: R("c1-variables-3", "diagram", "الحالات الأربع") },
            { value: 36, type: "substitution", why: "استخدمت جهد المصدر المستقل. جهد المصدر التابع <span class='ltr'>0.5vₓ = 6 V</span>." }],
          hints: ["جهد المصدر التابع = <span class='ltr'>0.5 × 12 = 6 V</span>.", "هل التيار يدخل الطرف + للمصدر التابع أم يخرج منه؟"],
          solution: "<span class='eq-i'>p = −(6)(3) = −18 W</span>: المصدر التابع يولّد 18 W. للتحقق: <span class='ltr'>−36 − 18 + 18 + 36 = 0</span> ✓" }
      ]
    },
    generator: { title: "تمارين مولّدة بمصادر تابعة", families: ["ladder", "grid"], dependent: true, types: ["iR", "vR", "ctrl", "pSrc"] },
    lab: { title: "نموذج الترانزستور", desc: "في المعمل الذكي ستضع مصدر تيار تابع كنموذج مبسط للترانزستور، وتغيّر تيار التحكم وتلاحظ تيار الخرج." }
  };
})();
