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

  L["c1-elements-1"] = {
    id: "c1-elements-1", ar: "مصادر الجهد والتيار", en: "Voltage and Current Sources", minutes: 20,
    objectives: ["تميّز بين المصدر المستقل والمصدر التابع وأنواعه الأربعة.", "تحكم على صحة توصيل المصادر المثالية ببعضها.", "تحسب قدرة المصدر وتعرف أنه قد يمتص القدرة لا أن يولّدها فقط."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>مصدر الجهد المثالي</b> يحافظ على جهد محدد بين طرفيه مهما كان التيار المار فيه. <b>مصدر التيار المثالي</b> يحافظ على تيار محدد مهما كان الجهد بين طرفيه. التيار في مصدر الجهد والجهد على مصدر التيار تحددهما <b>بقية الدائرة</b>.</p>" +
        "<p>المصدر <b>المستقل</b> قيمته ثابتة لا تعتمد على شيء في الدائرة (دائرة في الرسم). المصدر <b>التابع</b> (معيّن في الرسم) قيمته تعتمد على جهد أو تيار في مكان آخر من الدائرة، ويستخدم لنمذجة الترانزستورات ومكبرات العمليات.</p>" +
        depKinds },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Ideal voltage source</dt><dd>يحافظ على جهد ثابت بين طرفيه مهما كان تياره.</dd><dt>Ideal current source</dt><dd>يحافظ على تيار ثابت مهما كان جهده.</dd>" +
        "<dt>Independent source</dt><dd>قيمته محددة ولا تتأثر ببقية الدائرة.</dd><dt>Dependent (controlled) source</dt><dd>قيمته دالة في جهد أو تيار آخر في الدائرة <span class='ltr'>(vₓ أو iₓ)</span>.</dd></dl>" },
      { id: "laws", title: "قواعد التوصيل الصحيح", en: "Valid Interconnections", html:
        "<ul class='ticks'><li>مصدرا جهد مثاليان <b>على التوازي</b> يجب أن يكون جهداهما متساويين، وإلا خالفت الدائرة KVL.</li>" +
        "<li>مصدرا تيار مثاليان <b>على التوالي</b> يجب أن يكون تياراهما متساويين، وإلا خالفت الدائرة KCL.</li>" +
        "<li>لا يُقصر مصدر جهد بسلك (جهده لن يكون صفرًا)، ولا يُترك مصدر تيار بدون مسار مغلق (تياره لن يكون صفرًا).</li>" +
        "<li>مصدر جهد على التوالي مع مصدر تيار توصيل <b>صحيح</b>: مصدر التيار يحدد التيار، ومصدر الجهد يحدد الجهد.</li></ul>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>قبل حل أي دائرة فيها مصادر مثالية، تحقق أن توصيلها صحيح. الدائرة غير الصحيحة ليس لها حل.</li>" +
        "<li>لا تفترض أن المصدر يولّد القدرة دائمًا. احسب قدرته باصطلاح الإشارة، فقد تخرج موجبة (يمتص)، مثل بطارية أثناء الشحن.</li>" +
        "<li>مع المصدر التابع، حدد الكمية المتحكِّمة <span class='ltr'>(vₓ أو iₓ)</span> على الرسم أولًا، فقيمة المصدر لا تُعرف بدونها.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>حدد هل كل توصيل من التوصيلات التالية صحيح:</p>" +
        "<ol class='steps'><li>مصدر <span class='ltr'>10 V</span> على التوازي مع مصدر <span class='ltr'>10 V</span> بنفس القطبية: <b>صحيح</b>، الجهدان متساويان.</li>" +
        "<li>مصدر <span class='ltr'>10 V</span> على التوازي مع مصدر <span class='ltr'>5 V</span>: <b>غير صحيح</b>، الجهد بين العقدتين لا يمكن أن يكون 10 و 5 معًا.</li>" +
        "<li>مصدر <span class='ltr'>2 A</span> على التوالي مع مصدر <span class='ltr'>3 A</span>: <b>غير صحيح</b>، التيار في الفرع الواحد لا يمكن أن يكون 2 و 3 معًا.</li>" +
        "<li>مصدر <span class='ltr'>2 A</span> على التوالي مع مصدر <span class='ltr'>12 V</span>: <b>صحيح</b>، التيار 2 A والجهد على مصدر الجهد 12 V.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>بطارية السيارة تولّد القدرة عند تشغيل المحرك، لكنها <b>تمتص</b> القدرة أثناء القيادة لأن الدينامو (Alternator) يشحنها. الدينامو يعمل تقريبًا كمصدر يدفع التيار داخلًا من الطرف الموجب للبطارية. ونماذج الترانزستور في مقرر الإلكترونيات تعتمد على المصادر التابعة، مثل <span class='ltr'>i<sub>C</sub> = β i<sub>B</sub></span>.</p>" }
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
      figure: fig(c1, "مصدر جهد 20 فولت ومصدر تيار 4 أمبير في حلقة واحدة"),
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
  L["c1-elements-2"] = {
    id: "c1-elements-2", ar: "قانون أوم", en: "Ohm’s Law", minutes: 20,
    objectives: ["تطبق قانون أوم مع اصطلاح الإشارة.", "تحسب الموصلية والقدرة في المقاومة بالصيغ المختلفة.", "تعرف أن المقاومة تمتص القدرة دائمًا."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>المقاومة <span class='ltr'>(resistance)</span> هي قدرة المادة على إعاقة مرور التيار، ووحدتها الأوم <span class='ltr'>(Ω)</span>. قانون أوم يربط الجهد والتيار في المقاومة.</p>" +
        "<div class='callout'>إذا كان مرجع التيار يدخل الطرف + للمقاومة: <span class='eq-i'>v = iR</span>. وإذا دخل من الطرف −: <span class='eq-i'>v = −iR</span>.</div>" +
        "<p>مقلوب المقاومة هو <b>الموصلية</b> <span class='ltr'>(conductance) G = 1/R</span>، ووحدتها السيمنز <span class='ltr'>(S)</span>. والمقاومة <b>تمتص القدرة دائمًا</b>، وتحوّلها إلى حرارة.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Resistance (R)</dt><dd>بالأوم Ω.</dd><dt>Conductance (G)</dt><dd><span class='ltr'>G = 1/R</span>، بالسيمنز S.</dd>" +
        "<dt>Short circuit</dt><dd>مقاومة صفر: الجهد صفر مهما كان التيار.</dd><dt>Open circuit</dt><dd>مقاومة لا نهائية: التيار صفر مهما كان الجهد.</dd></dl>" },
      { id: "laws", title: "القوانين والوحدات", en: "Equations & Units", html:
        "<div class='eq-row'><div class='eq'>v = iR</div><div class='eq'>G = 1 / R</div></div>" +
        "<div class='eq'>p = i²R = v² / R = v²G</div>" +
        "<p class='muted'>صيغ القدرة الثلاث كلها موجبة دائمًا، لأن i² و v² موجبان. لذلك لا تحتاج اصطلاح الإشارة لحساب قدرة المقاومة.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>استخدم <span class='eq-i'>v = iR</span> أو <span class='eq-i'>v = −iR</span> حسب اتجاه مرجع التيار بالنسبة لقطبية الجهد، وليس حسب ما تتوقعه.</li>" +
        "<li>إذا عرفت التيار استخدم <span class='eq-i'>p = i²R</span>، وإذا عرفت الجهد استخدم <span class='eq-i'>p = v²/R</span>. الصيغتان تعطيان نفس النتيجة.</li>" +
        "<li>عند جمع مقاومات على التوازي (الفصل القادم) يكون العمل بالموصلية أسهل.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<div class='ex-split'><div>" + CV.elemDiagram({ plusTop: true, arrow: "down", v: "v", i: "2 A", name: "5 Ω", aria: "مقاومة 5 أوم والتيار 2 أمبير يدخل الطرف الموجب" }) + "</div><div>" +
        "<p class='q'>مقاومة <span class='ltr'>5 Ω</span> يدخل تيار المرجع <span class='ltr'>2 A</span> طرفها الموجب. احسب الجهد والقدرة والموصلية.</p>" +
        "<ol class='steps'><li><b>الجهد:</b> التيار يدخل الطرف +، إذن <span class='eq-i'>v = iR = (2)(5) = 10 V</span>.</li>" +
        "<li><b>القدرة:</b> <span class='eq-i'>p = i²R = (2)²(5) = 20 W</span>، وللتحقق <span class='eq-i'>v²/R = 100/5 = 20 W</span>.</li>" +
        "<li><b>الموصلية:</b> <span class='eq-i'>G = 1/5 = 0.2 S</span>.</li>" +
        "<li><b>لو عكسنا سهم التيار:</b> يصبح <span class='eq-i'>i = −2 A</span> و <span class='eq-i'>v = −iR = 10 V</span>. نفس الجهد الفعلي، لأن الفيزياء لم تتغير، تغيّر فقط ما رسمناه.</li></ol></div></div>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>سخان الماء والمكواة والغلاية كلها مقاومات تحوّل القدرة إلى حرارة بالعلاقة <span class='ltr'>p = v²/R</span>. ولهذا السبب سلك التمديد الرفيع خطر: مقاومته أكبر، فيسخن أكثر عند نفس التيار <span class='ltr'>(p = i²R)</span>.</p>" }
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

  L["c1-elements-3"] = {
    id: "c1-elements-3", ar: "قانونا كيرشوف", en: "Kirchhoff’s Laws", minutes: 30,
    objectives: ["تكتب معادلة KCL عند أي عقدة بإشارات صحيحة.", "تكتب معادلة KVL حول أي مسار مغلق.", "تجمع KCL و KVL وقانون أوم لحل دائرة بأكثر من حلقة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>العقدة</b> <span class='ltr'>(node)</span> نقطة يلتقي فيها عنصران أو أكثر، و<b>المسار المغلق</b> <span class='ltr'>(closed path / loop)</span> مسار يبدأ من عقدة ويعود إليها دون المرور بأي عقدة مرتين.</p>" +
        "<div class='callout'><b>KCL:</b> المجموع الجبري للتيارات عند أي عقدة يساوي صفرًا. أي أن ما يدخل العقدة = ما يخرج منها.<br><b>KVL:</b> المجموع الجبري للجهود حول أي مسار مغلق يساوي صفرًا.</div>" +
        "<p>KCL نتيجة لحفظ الشحنة (الشحنة لا تتراكم في العقدة)، و KVL نتيجة لحفظ الطاقة. مع قانون أوم، هذان القانونان يكفيان لحل أي دائرة مقاومات.</p>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Node</dt><dd>نقطة التقاء عنصرين أو أكثر. كل الأسلاك المتصلة ببعضها تمثل عقدة واحدة.</dd><dt>Closed path (loop)</dt><dd>مسار يعود لنقطة البداية.</dd>" +
        "<dt>KCL</dt><dd>Kirchhoff’s Current Law.</dd><dt>KVL</dt><dd>Kirchhoff’s Voltage Law.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq-row'><div class='eq'>Σ i<sub>in</sub> = Σ i<sub>out</sub></div><div class='eq'>Σ v = 0  (around a loop)</div></div>" +
        "<ul class='ticks'><li><b>في KCL:</b> اختر قاعدة واحدة والتزم بها، مثلًا التيار الخارج موجب والداخل سالب.</li>" +
        "<li><b>في KVL:</b> امشِ حول الحلقة في اتجاه واحد. إذا دخلت العنصر من طرفه + فهذا هبوط (موجب)، وإذا دخلته من طرفه − فهذا ارتفاع (سالب).</li></ul>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>اكتب KCL عند العقد التي يلتقي فيها <b>ثلاثة عناصر أو أكثر</b>. العقدة بين عنصرين فقط تعطي معادلة بديهية (التيار نفسه).</li>" +
        "<li>اكتب KVL حول الحلقات <b>التي لا تمر بمصدر تيار</b>، لأن جهد مصدر التيار مجهول ويضيف مجهولًا جديدًا.</li>" +
        "<li>عدد المعادلات المستقلة يجب أن يساوي عدد المجاهيل. عدد عقد الدائرة n يعطي <span class='ltr'>n − 1</span> معادلة KCL مستقلة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        fig(c3ex, "دائرة سلم: مصدر 24 فولت وأربع مقاومات") +
        "<p class='q'>أوجد التيارات <span class='ltr'>i₁</span> و <span class='ltr'>i₂</span> و <span class='ltr'>i₃</span> باتجاهات الأسهم.</p>" +
        "<ol class='steps'><li><b>KCL عند العقدة العليا الوسطى:</b> <span class='eq-i'>i₁ = i₂ + i₃</span></li>" +
        "<li><b>KVL في الحلقة اليسرى</b> (مع عقارب الساعة): <span class='eq-i'>−24 + 4i₁ + 12i₂ = 0</span></li>" +
        "<li><b>KVL في الحلقة اليمنى:</b> <span class='eq-i'>−12i₂ + 2i₃ + 4i₃ = 0 → i₂ = 0.5 i₃</span></li>" +
        "<li><b>التعويض:</b> <span class='eq-i'>i₁ = 1.5 i₃</span>، إذن <span class='eq-i'>24 = 6i₃ + 6i₃ → i₃ = 2 A</span></li>" +
        "<li><b>النتيجة:</b> <span class='eq-i'>i₂ = 1 A</span> و <span class='eq-i'>i₁ = 3 A</span>. وللتحقق: <span class='ltr'>3 = 1 + 2</span> ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>لوحة توزيع الكهرباء في المنزل تطبيق مباشر لـ KCL: التيار الداخل من القاطع الرئيسي يساوي مجموع تيارات القواطع الفرعية. ولهذا يفصل القاطع الرئيسي إذا شغّلت أجهزة كثيرة معًا حتى لو لم يتجاوز أي قاطع فرعي حدّه.</p>" }
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
      figure: fig(c3, "مصدر 30 فولت ومقاومتان ومصدر تيار 1.5 أمبير"),
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

  L["c1-elements-4"] = {
    id: "c1-elements-4", ar: "تحليل دائرة فيها مصادر تابعة", en: "Analysis of a Circuit Containing Dependent Sources", minutes: 30,
    objectives: ["تكتب معادلة القيد للمصدر التابع بدلالة الكمية المتحكِّمة.", "تحل دائرة فيها مصدر تابع بـ KCL و KVL.", "تحسب قدرة المصدر التابع وتتحقق من توازن القدرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>المصدر التابع يُعامل في معادلات KCL و KVL مثل أي مصدر، مع فرق واحد: قيمته مجهولة لأنها تعتمد على الكمية المتحكِّمة <span class='ltr'>(iₓ أو vₓ)</span>. لذلك نضيف معادلة إضافية تسمى <b>معادلة القيد</b> <span class='ltr'>(constraint equation)</span> تعبّر عن الكمية المتحكِّمة بدلالة مجاهيل الدائرة.</p>" +
        "<div class='callout'>الطريقة: (1) حدد الكمية المتحكِّمة على الرسم. (2) اكتب KCL و KVL كالمعتاد. (3) اكتب معادلة القيد. (4) حل المعادلات معًا.</div>" },
      { id: "terms", title: "المصطلحات", en: "Terminology", html:
        "<dl class='terms'><dt>Controlling variable</dt><dd>الجهد vₓ أو التيار iₓ الذي تعتمد عليه قيمة المصدر التابع.</dd><dt>Constraint equation</dt><dd>معادلة تربط الكمية المتحكِّمة بمجاهيل الدائرة.</dd></dl>" },
      { id: "laws", title: "القوانين", en: "Equations", html: depKinds +
        "<p class='muted'>في الرسوم: المعيّن رمز المصدر التابع. السهم داخله يعني مصدر تيار، و + و − يعنيان مصدر جهد.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>لا تعامل المصدر التابع كقيمة ثابتة. قيمته تتغير إذا تغيّرت الكمية المتحكِّمة.</li>" +
        "<li>انتبه لاتجاه وقطبية الكمية المتحكِّمة كما هي مرسومة. عكسها يعكس إشارة المصدر كله.</li>" +
        "<li>لا تحذف المصدر التابع عند حساب المكافئات (في فصول لاحقة)، فهو ليس مستقلًا.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        fig(c4ex, "مصدر 20 فولت ومقاومتان ومصدر تيار تابع قيمته نصف iₓ") +
        "<p class='q'>المصدر التابع تيار قيمته <span class='ltr'>0.5 iₓ</span>، حيث <span class='ltr'>iₓ</span> تيار <span class='ltr'>R1</span>. أوجد <span class='ltr'>iₓ</span> وجهد العقدة العليا الوسطى <span class='ltr'>v</span>.</p>" +
        "<ol class='steps'><li><b>معادلة القيد:</b> <span class='eq-i'>iₓ = (20 − v) / 4</span></li>" +
        "<li><b>KCL عند العقدة الوسطى:</b> <span class='eq-i'>iₓ = v/8 + 0.5 iₓ</span></li>" +
        "<li><b>التبسيط:</b> <span class='eq-i'>0.5 iₓ = v/8 → (20 − v)/8 = v/8 → v = 10 V</span></li>" +
        "<li><b>النتيجة:</b> <span class='eq-i'>iₓ = (20 − 10)/4 = 2.5 A</span>، وتيار المصدر التابع <span class='eq-i'>0.5 × 2.5 = 1.25 A</span>.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>الترانزستور في دوائر التكبير يُمثَّل بمصدر تيار تابع <span class='ltr'>i<sub>C</sub> = β i<sub>B</sub></span>، حيث β قد تكون 100 أو أكثر: تيار صغير في القاعدة يتحكم في تيار أكبر بكثير في المجمّع. هذا أساس كل مكبر صوت ومعالج رقمي.</p>" }
    ],
    quiz: [
      { q: "في المثال المحلول، لو تضاعف جهد المصدر المستقل إلى <span class='ltr'>40 V</span>، فإن تيار المصدر التابع:", options: [
        { t: "يبقى 1.25 A لأنه مصدر", type: "conceptual", why: "قيمة المصدر التابع تعتمد على iₓ، و iₓ يتغير مع المصدر المستقل." },
        { t: "يتضاعف إلى 2.5 A", correct: true, why: "الدائرة خطية: كل التيارات تتضاعف، ومنها iₓ، فيتضاعف 0.5 iₓ." },
        { t: "يصبح صفرًا", type: "conceptual", why: "لا يوجد سبب لذلك؛ iₓ يزيد ولا يختفي." }
      ]},
      { q: "معادلة القيد للمصدر التابع تعبّر عن:", options: [
        { t: "الكمية المتحكِّمة بدلالة مجاهيل الدائرة", correct: true, why: "هذا ما يجعل عدد المعادلات يساوي عدد المجاهيل." },
        { t: "قدرة المصدر التابع", type: "conceptual", why: "القدرة تُحسب بعد الحل، وليست معادلة القيد." },
        { t: "KVL حول المصدر التابع فقط", type: "conceptual", why: "معادلة القيد تربط iₓ أو vₓ بالمجاهيل، وليست KVL." }
      ]},
      { q: "مصدر جهد تابع قيمته <span class='ltr'>5 iₓ</span>. وحدة الثابت 5 هي:", options: [
        { t: "بدون وحدة", type: "unit", why: "الناتج جهد (V) والمتحكم تيار (A)، فالثابت وحدته V/A." },
        { t: "<span class='ltr'>Ω</span>", correct: true, why: "V/A = Ω، وهذا مصدر CCVS." },
        { t: "<span class='ltr'>S</span>", type: "unit", why: "S = A/V، وهي وحدة ثابت VCCS." }
      ]}
    ],
    practice: {
      prompt: "حلقة واحدة فيها مصدر <span class='ltr'>12 V</span>، و <span class='ltr'>R1 = 2 Ω</span>، و <span class='ltr'>R2 = 4 Ω</span>، ومصدر جهد تابع قيمته <span class='ltr'>0.5 vₓ</span> حيث <span class='ltr'>vₓ</span> جهد <span class='ltr'>R2</span> بالقطبية المرسومة.",
      figure: fig(c4, "حلقة فيها مصدر 12 فولت ومقاومتان ومصدر جهد تابع قيمته نصف vₓ"),
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
