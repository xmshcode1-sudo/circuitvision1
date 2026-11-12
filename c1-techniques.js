/* Circuits 1 — Chapter 4: Techniques of Circuit Analysis (12 lessons, following the course description).
   Every practice answer below is computed from the drawn circuit by the engine (mna.js, analysis.js).
   Numbers written inside example text were checked against the engine by the test suite. */
(function () {
  "use strict";
  var CV = window.CV, L = CV.lessons = CV.lessons || {}, AN = CV.analysis;
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var fig = function (c, aria) { return "<div class='lfig'>" + CV.draw.render(c, { aria: aria }) + "</div>"; };
  var solve = function (c) { var s = CV.mna.solve(c); if (!s.ok) throw new Error("lesson circuit invalid: " + s.reason); return s; };
  var nodes = function (c, pts) { c.nodeLabels = AN.nodeLabels(c, { only: pts }); c.showGround = true; return c; };
  var meshes = function (c) { var m = AN.meshes(c, solve(c)); c.meshLabels = m; return m; };
  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };
  var A = [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }], V = [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }, { l: "kV", f: 1e3 }], W = [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }, { l: "kW", f: 1e3 }], OHM = [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }], CNT = [{ l: "معادلة", f: 1 }];
  var eqi = function (s) { return "<span class='eq-i'>" + s + "</span>"; };
  var bottom3 = [E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")];

  /* Two-node circuit: Vs | R1 top | R2 middle | R3 top-right | element on the right */
  function twoNode(Vs, r1, r2, r3, right, extra) {
    return { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", Vs, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", r1, Object.assign({ name: "R1" }, extra && extra.r1)), E([0, 1], [1, 1], "R", r2, Object.assign({ name: "R2" }, extra && extra.r2)), E([0, 1], [0, 2], extra && extra.topType || "R", r3, Object.assign({ name: extra && extra.topName || "R3" }, extra && extra.top)), right].concat(bottom3) };
  }

  /* ================= 1. Node-voltage method ================= */
  var n1ex = nodes(twoNode(30, 5, 3, 6, E([0, 2], [1, 2], "I", 2, { dir: "ba", name: "Is" })), [[0, 1], [0, 2]]);
  var n1 = nodes(twoNode(30, 10, 8, 3, E([0, 2], [1, 2], "I", 6, { dir: "ba", name: "Is" }), { r1: { ilabel: "i" } }), [[0, 1], [0, 2]]), s1 = solve(n1);
  L["c1-techniques-1"] = {
    id: "c1-techniques-1", ar: "مدخل إلى طريقة جهود العقد", en: "Introduction to the Node-Voltage Method", minutes: 30,
    objectives: ["تختار عقدة مرجعية وتسمّي جهود العقد.", "تكتب معادلة KCL عند كل عقدة بدلالة جهود العقد.", "تحل المعادلات وتحسب أي تيار من جهود العقد."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>بدل أن نجعل تيار كل فرع مجهولًا، نجعل المجاهيل <b>جهود العقد</b> فقط. نختار عقدة <b>مرجعية</b> (الأرضي) جهدها صفر، ونقيس جهد كل عقدة أخرى بالنسبة لها.</p>" +
        "<p>تيار أي مقاومة بين عقدتين يُكتب مباشرة بدلالة الجهدين: <span class='eq-i'>i = (vₖ − vⱼ) / R</span>. ثم نكتب KCL عند كل عقدة غير مرجعية، فنحصل على معادلة لكل مجهول.</p>" +
        "<div class='callout'>عدد المعادلات = عدد العقد − 1 (العقدة المرجعية لا نكتب لها معادلة). والعقدة المتصلة بالمرجع عبر مصدر جهد يكون جهدها معروفًا.</div>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>Σ (vₖ − vⱼ) / R + Σ i<sub>out</sub> = 0   (at node k)</div>" +
        "<p class='muted'>قاعدة عملية: اكتب كل التيارات <b>خارجة</b> من العقدة. تيار المقاومة الخارج = (جهد هذه العقدة − جهد العقدة الأخرى) / R. ومصدر التيار الذي يدخل العقدة يُكتب بإشارة سالبة.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>مناسبة للدوائر التي فيها عقد قليلة وفروع كثيرة على التوازي.</li><li>اختر المرجع عند العقدة التي يتصل بها أكبر عدد من العناصر، فتبسّط المعادلات.</li><li>بعد إيجاد جهود العقد، أي تيار أو جهد في الدائرة يُحسب بقانون أوم مباشرة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(n1ex, "دائرة بعقدتين مجهولتين ومصدر جهد ومصدر تيار") +
        "<p class='q'>أوجد <span class='ltr'>v₁</span> و <span class='ltr'>v₂</span>. المرجع هو الضلع السفلي.</p>" +
        "<ol class='steps'><li><b>العقدة v₁:</b> " + eqi("(v₁ − 30)/5 + v₁/3 + (v₁ − v₂)/6 = 0") + "</li>" +
        "<li><b>العقدة v₂:</b> مصدر التيار يدخلها 2 A: " + eqi("(v₂ − v₁)/6 − 2 = 0 → v₂ = v₁ + 12") + "</li>" +
        "<li><b>بالتعويض:</b> " + eqi("(v₁ − 30)/5 + v₁/3 − 2 = 0") + "، وبالضرب في 15: " + eqi("3v₁ − 90 + 5v₁ − 30 = 0 → v₁ = 15 V") + "</li>" +
        "<li>" + eqi("v₂ = 27 V") + ". للتحقق عند v₁: " + eqi("−3 + 5 − 2 = 0") + " ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>برامج المحاكاة مثل SPICE تحل كل الدوائر بنسخة من طريقة جهود العقد (Modified Nodal Analysis)، لأنها تصلح لأي دائرة مهما كبرت. ومحرك CircuitVision الذي يحل التمارين يعمل بنفس الطريقة.</p>" }
    ],
    quiz: [
      { q: "دائرة فيها 5 عقد. كم معادلة نحتاج في طريقة جهود العقد (بدون مصادر جهد)؟", options: [
        { t: "<span class='ltr'>4</span>", correct: true, why: "عدد العقد − 1، لأن جهد المرجع صفر." }, { t: "<span class='ltr'>5</span>", type: "conceptual", why: "العقدة المرجعية جهدها معروف (صفر)، فلا نكتب لها معادلة." }, { t: "<span class='ltr'>عدد الفروع</span>", type: "conceptual", why: "عدد الفروع يحدد معادلات طريقة الفروع، وليس جهود العقد." } ]},
      { q: "تيار المقاومة R الخارج من العقدة v₁ نحو العقدة v₂:", options: [
        { t: "<span class='ltr'>(v₁ − v₂)/R</span>", correct: true, why: "التيار يتجه من الجهد الأعلى للأقل، والقاعدة: جهد هذه العقدة − الأخرى." }, { t: "<span class='ltr'>(v₂ − v₁)/R</span>", type: "sign", why: "هذا التيار الداخل إلى v₁." }, { t: "<span class='ltr'>v₁/R</span>", type: "conceptual", why: "هذا فقط إذا كانت v₂ هي المرجع (صفر)." } ]}
    ],
    practice: {
      prompt: "أوجد جهدي العقدتين في الدائرة: <span class='ltr'>Vs = 30 V</span>، <span class='ltr'>R1 = 10 Ω</span>، <span class='ltr'>R2 = 8 Ω</span>، <span class='ltr'>R3 = 3 Ω</span>، <span class='ltr'>Is = 6 A</span>.",
      figure: fig(n1, "دائرة بعقدتين v1 و v2 ومصدر جهد 30 فولت ومصدر تيار 6 أمبير"),
      steps: [
        { id: "s1", label: "كم معادلة KCL مستقلة نحتاج؟", symbol: "N =", answer: 2, units: CNT,
          diagnose: [{ value: 3, type: "conceptual", why: "العقدة العليا اليسرى جهدها معروف (30 V) لأن مصدر الجهد يصلها بالمرجع. المجاهيل v₁ و v₂ فقط." }, { value: 4, type: "conceptual", why: "لا نكتب معادلة للعقدة المرجعية، ولا للعقدة المعروف جهدها." }],
          hints: ["عدّ العقد التي جهدها مجهول."], solution: "المجهولان v₁ و v₂، فنحتاج معادلتين." },
        { id: "s2", label: "احسب <span class='ltr'>v₁</span>.", symbol: "v₁ =", answer: s1.volt([0, 1]), units: V, unitDefault: 1,
          diagnose: [{ value: -40 / 3, type: "sign", why: "عكست إشارة مصدر التيار. سهمه للأعلى، فهو <b>يدخل</b> العقدة v₂: " + eqi("(v₂ − v₁)/3 − 6 = 0") + ".", review: R("c1-techniques-1", "laws", "إشارات التيارات في KCL") }, { value: 30 * 8 / 18, type: "conceptual", why: "عاملت الدائرة كمقسّم جهد وتجاهلت مصدر التيار. مصدر التيار يدفع 6 A إلى العقدة فيرفع الجهود." }],
          hints: ["من معادلة v₂: " + eqi("v₂ = v₁ + 18") + ".", "عوّض في معادلة v₁: " + eqi("(v₁ − 30)/10 + v₁/8 + (v₁ − v₂)/3 = 0") + "."], solution: eqi("(v₁ − 30)/10 + v₁/8 − 6 = 0 → 4v₁ − 120 + 5v₁ − 240 = 0 → v₁ = 40 V") },
        { id: "s3", label: "احسب <span class='ltr'>v₂</span>.", symbol: "v₂ =", answer: s1.volt([0, 2]), units: V, unitDefault: 1,
          diagnose: [{ value: 22, type: "sign", why: "حسبت v₁ − 18. مصدر التيار يدخل v₂ فيرفع جهدها: " + eqi("v₂ = v₁ + 18") + "." }], hints: [eqi("v₂ = v₁ + 3 × 6") + "."], solution: eqi("v₂ = 40 + 18 = 58 V") },
        { id: "s4", label: "احسب تيار <span class='ltr'>R1</span> باتجاه السهم (من اليسار لليمين).", symbol: "i =", answer: s1.byName.R1.i, units: A, unitDefault: 1,
          diagnose: [{ value: 7, type: "conceptual", why: "استخدمت v₁ − 0. تيار R1 يعتمد على جهدي طرفيها: 30 V يسارًا و v₁ يمينًا." }],
          hints: ["تيار السهم = (جهد بداية السهم − جهد نهايته) / R."], solution: eqi("i = (30 − 40)/10 = −1 A") + ": التيار الفعلي 1 A يدخل مصدر الجهد من طرفه الموجب، لأن مصدر التيار رفع v₁ فوق 30 V." }
      ]
    },
    generator: { title: "تمارين مولّدة: جهود العقد", kinds: ["vN"], families: ["ladder", "grid"] },
    lab: { title: "قياس جهود العقد", desc: "في المعمل الذكي ستضع طرف الفولتميتر السالب على الأرضي، وتقيس جهد كل عقدة، وتقارنه بحلك." }
  };

  /* ================= 2. Node-voltage with dependent sources ================= */
  var n2ex = nodes(twoNode(24, 6, 2, 10, E([0, 2], [1, 2], "CCCS", 4, { dir: "ba", ctrl: "R1", name: "D" }), { r1: { isCtrl: true } }), [[0, 1], [0, 2]]);
  var n2 = nodes(twoNode(60, 12, 24, 8, E([0, 2], [1, 2], "CCCS", 0.5, { dir: "ab", ctrl: "R1", name: "D" }), { r1: { isCtrl: true } }), [[0, 1], [0, 2]]), s2 = solve(n2);
  L["c1-techniques-2"] = {
    id: "c1-techniques-2", ar: "طريقة جهود العقد والمصادر التابعة", en: "The Node-Voltage Method and Dependent Sources", minutes: 30,
    objectives: ["تعبّر عن الكمية المتحكِّمة بدلالة جهود العقد.", "تكتب معادلات العقد مع المصدر التابع.", "تحل النظام وتتحقق من النتيجة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>المصدر التابع يُعامل في KCL كأي مصدر، لكن قيمته مجهولة. نضيف <b>معادلة قيد</b> تعبّر عن الكمية المتحكِّمة (مثل <span class='ltr'>iₓ</span>) بدلالة جهود العقد، فيبقى عدد المجاهيل كما هو.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>iₓ = (vₐ − v_b) / Rₓ</div><p class='muted'>عوّض هذا التعبير مكان iₓ في كل معادلات KCL، فتصبح المعادلات في جهود العقد فقط.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>اكتب معادلة القيد قبل معادلات العقد، حتى لا تنسى تعويضها.</li><li>انتبه لاتجاه iₓ المرسوم: يحدد إشارة التعبير.</li><li>المصدر التابع قد يجعل جهد عقدة أعلى من جهد المصدر المستقل؛ هذا طبيعي لأنه يضيف طاقة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(n2ex, "دائرة عقد فيها مصدر تيار تابع قيمته 4 iₓ") +
        "<ol class='steps'><li><b>القيد:</b> " + eqi("iₓ = (24 − v₁)/6") + "</li><li><b>العقدة v₁:</b> " + eqi("(v₁ − 24)/6 + v₁/2 + (v₁ − v₂)/10 = 0") + "</li><li><b>العقدة v₂:</b> المصدر التابع يدخلها: " + eqi("(v₂ − v₁)/10 − 4iₓ = 0") + "</li>" +
        "<li><b>الحل:</b> " + eqi("v₁ = 15 V, v₂ = 75 V, iₓ = 1.5 A") + ". لاحظ أن v₂ أكبر بكثير من 24 V.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>دوائر مكبرات الترانزستور تُحل بهذه الطريقة: الترانزستور يُستبدل بمصدر تيار تابع، ثم تُكتب معادلات العقد لحساب كسب المكبر.</p>" }
    ],
    quiz: [
      { q: "في وجود مصدر تابع، عدد المعادلات اللازمة:", options: [
        { t: "معادلات العقد + معادلة قيد لكل مصدر تابع", correct: true, why: "معادلة القيد تعوّض المجهول الإضافي (الكمية المتحكِّمة)." }, { t: "معادلات العقد فقط ونعامل المصدر التابع كثابت", type: "conceptual", why: "قيمته مجهولة لأنها تعتمد على iₓ أو vₓ." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 12 Ω</span> (تيارها iₓ)، <span class='ltr'>R2 = 24 Ω</span>، <span class='ltr'>R3 = 8 Ω</span>، ومصدر تيار تابع <span class='ltr'>0.5 iₓ</span> للأسفل.",
      figure: fig(n2, "دائرة عقد مع مصدر تيار تابع قيمته نصف iₓ"),
      steps: [
        { id: "s1", kind: "choice", label: "ما معادلة القيد؟", options: [
          { t: eqi("iₓ = (60 − v₁)/12"), correct: true },
          { t: eqi("iₓ = (v₁ − 60)/12"), type: "sign", why: "سهم iₓ من اليسار (60 V) إلى اليمين (v₁)، فالتيار = جهد البداية − جهد النهاية.", review: R("c1-techniques-1", "laws", "تيار المقاومة بدلالة جهود العقد") },
          { t: eqi("iₓ = 60/12"), type: "conceptual", why: "جهد R1 ليس 60 V؛ هو الفرق بين 60 V و v₁." } ],
          hints: ["تيار السهم = (جهد بدايته − جهد نهايته)/R."], solution: eqi("iₓ = (60 − v₁)/12") },
        { id: "s2", label: "احسب <span class='ltr'>v₁</span>.", symbol: "v₁ =", answer: s2.volt([0, 1]), units: V, unitDefault: 1,
          diagnose: [{ value: 40, type: "conceptual", why: "تجاهلت المصدر التابع، فصارت R3 بلا تيار والدائرة مقسّم جهد. المصدر التابع يسحب 0.5 iₓ من العقدة v₂ عبر R3.", review: R("c1-techniques-2", "concept", "المصدر التابع في KCL") }],
          hints: ["عند v₂: " + eqi("(v₂ − v₁)/8 + 0.5iₓ = 0") + "، أي أن تيار R3 = 0.5iₓ من v₁ إلى v₂.", "عند v₁: " + eqi("iₓ = v₁/24 + 0.5iₓ") + " → " + eqi("0.5(60 − v₁)/12 = v₁/24") + "."], solution: eqi("(60 − v₁)/24 = v₁/24 → v₁ = 30 V") },
        { id: "s3", label: "احسب <span class='ltr'>v₂</span>.", symbol: "v₂ =", answer: s2.volt([0, 2]), units: V, unitDefault: 1,
          diagnose: [{ value: 40, type: "sign", why: "المصدر التابع يسحب التيار من v₂ للأسفل، فيمر في R3 تيار من v₁ إلى v₂، فيكون v₂ أقل من v₁." }],
          hints: [eqi("v₂ = v₁ − 8 × 0.5 iₓ") + "، و " + eqi("iₓ = 2.5 A") + "."], solution: eqi("v₂ = 30 − 8 × 1.25 = 20 V") },
        { id: "s4", label: "احسب <span class='ltr'>iₓ</span>.", symbol: "iₓ =", answer: s2.byName.R1.i, units: A, unitDefault: 1, diagnose: [], hints: ["من معادلة القيد."], solution: eqi("iₓ = (60 − 30)/12 = 2.5 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: جهود العقد مع مصادر تابعة", kinds: ["vN"], families: ["ladder", "grid"], dependent: true },
    lab: { title: "مكبر بمصدر تابع", desc: "في المعمل الذكي ستغيّر ثابت المصدر التابع وتلاحظ تغيّر جهود العقد." }
  };

  /* ================= 3. Node-voltage special cases ================= */
  var n3ex = nodes(twoNode(50, 5, 15, 10, E([0, 2], [1, 2], "R", 20, { name: "R3" }), { topType: "V", topName: "V2", top: { plus: "b" } }), [[0, 0], [0, 1], [0, 2]]);
  var n3 = nodes(twoNode(60, 3, 6, 20, E([0, 2], [1, 2], "R", 10, { name: "R3" }), { topType: "V", topName: "V2", top: { plus: "b" } }), [[0, 0], [0, 1], [0, 2]]), s3 = solve(n3);
  L["c1-techniques-3"] = {
    id: "c1-techniques-3", ar: "جهود العقد: حالات خاصة", en: "The Node-Voltage Method: Some Special Cases", minutes: 30,
    objectives: ["تتعامل مع مصدر جهد بين عقدة والمرجع.", "تستخدم العقدة العظمى (Supernode) لمصدر جهد بين عقدتين.", "تكتب معادلة القيد للعقدة العظمى."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>الحالة 1:</b> مصدر جهد بين عقدة والمرجع: جهد العقدة معروف مباشرة، فلا نكتب لها معادلة.</p>" +
        "<p><b>الحالة 2:</b> مصدر جهد بين عقدتين غير مرجعيتين: تيار المصدر مجهول ولا يمكن كتابته بقانون أوم. الحل: نعامل العقدتين ومعهما المصدر كعقدة واحدة كبيرة تسمى <b>العقدة العظمى</b> <span class='ltr'>(supernode)</span>، ونكتب KCL لها كلها، ثم نضيف معادلة القيد: فرق جهد العقدتين = جهد المصدر.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>Σ i<sub>out</sub> (supernode) = 0 ,   v_b − vₐ = V<sub>s</sub></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>لا تكتب تيار مصدر الجهد بقانون أوم؛ ليس له مقاومة.</li><li>في معادلة القيد خذ قطبية المصدر من الرسم: الطرف + جهده أعلى بمقدار V<sub>s</sub>.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(n3ex, "دائرة فيها مصدر جهد بين عقدتين") +
        "<ol class='steps'><li><span class='ltr'>v₁ = 50 V</span> مباشرة.</li><li><b>القيد:</b> الطرف + للمصدر V2 جهة v₃: " + eqi("v₃ = v₂ + 10") + "</li>" +
        "<li><b>KCL للعقدة العظمى (v₂ و v₃ معًا):</b> " + eqi("(v₂ − 50)/5 + v₂/15 + v₃/20 = 0") + "</li><li>" + eqi("v₂ = 30 V, v₃ = 40 V") + ". للتحقق: " + eqi("−4 + 2 + 2 = 0") + " ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>منظمات الجهد في الدوائر الإلكترونية تتصرف كمصادر جهد بين عقدتين غير مرجعيتين، ولهذا تظهر العقدة العظمى كثيرًا عند تحليل دوائر التغذية.</p>" }
    ],
    quiz: [
      { q: "مصدر جهد مثالي بين عقدتين غير مرجعيتين. لماذا لا نكتب KCL لكل عقدة على حدة؟", options: [
        { t: "لأن تيار مصدر الجهد مجهول ولا يُعبَّر عنه بجهود العقد", correct: true, why: "لذلك ندمج العقدتين في عقدة عظمى ونضيف معادلة القيد." }, { t: "لأن KCL لا ينطبق على مصادر الجهد", type: "conceptual", why: "KCL ينطبق دائمًا. المشكلة في المجهول الإضافي." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 3 Ω</span>، <span class='ltr'>R2 = 6 Ω</span>، <span class='ltr'>R3 = 10 Ω</span>، ومصدر <span class='ltr'>V2 = 20 V</span> بين v₂ و v₃.",
      figure: fig(n3, "دائرة فيها مصدر جهد 20 فولت بين عقدتين"),
      steps: [
        { id: "s1", kind: "choice", label: "كيف نتعامل مع المصدر V2؟", options: [
          { t: "ندمج v₂ و v₃ في عقدة عظمى، ونضيف " + eqi("v₃ = v₂ + 20"), correct: true },
          { t: "نكتب تيار V2 كأنه " + eqi("20 / R"), type: "conceptual", why: "مصدر الجهد المثالي ليست له مقاومة، وتياره مجهول.", review: R("c1-techniques-3", "concept", "العقدة العظمى") },
          { t: "ندمج العقدتين مع " + eqi("v₂ = v₃ + 20"), type: "sign", why: "الطرف + لـ V2 جهة v₃، فجهد v₃ هو الأعلى." } ],
          hints: ["أين الطرف + للمصدر V2؟"], solution: "عقدة عظمى مع " + eqi("v₃ = v₂ + 20") },
        { id: "s2", label: "احسب <span class='ltr'>v₂</span>.", symbol: "v₂ =", answer: s3.volt([0, 1]), units: V, unitDefault: 1,
          diagnose: [{ value: 110 / 3, type: "sign", why: "استخدمت " + eqi("v₃ = v₂ − 20") + ". الطرف + للمصدر جهة v₃." }],
          hints: ["KCL للعقدة العظمى: " + eqi("(v₂ − 60)/3 + v₂/6 + v₃/10 = 0") + "."], solution: eqi("(v₂ − 60)/3 + v₂/6 + (v₂ + 20)/10 = 0 → v₂ = 30 V") },
        { id: "s3", label: "احسب <span class='ltr'>v₃</span>.", symbol: "v₃ =", answer: s3.volt([0, 2]), units: V, unitDefault: 1, diagnose: [{ value: 10, type: "sign", why: "حسبت v₂ − 20. الطرف + جهة v₃." }], hints: ["من القيد."], solution: eqi("v₃ = 30 + 20 = 50 V") },
        { id: "s4", label: "احسب تيار <span class='ltr'>R3</span> (من الأعلى للأسفل).", symbol: "i =", answer: s3.byName.R3.i, units: A, unitDefault: 1, diagnose: [{ value: 3, type: "substitution", why: "قسمت v₂ على R3. R3 متصلة بالعقدة v₃." }], hints: [eqi("i = v₃ / 10")], solution: eqi("i = 50/10 = 5 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: جهود العقد مع مصادر جهد", kinds: ["vN"], families: ["ladder", "grid"] },
    lab: { title: "العقدة العظمى", desc: "في المعمل الذكي ستقيس فرق الجهد بين عقدتين يفصلهما مصدر جهد، وتتحقق أنه يساوي قيمة المصدر مهما تغيرت الأحمال." }
  };

  /* ================= 4. Mesh-current method ================= */
  var m4ex = twoNode(40, 3, 10, 2, E([0, 2], [1, 2], "V", 20, { plus: "a", name: "V2" })); meshes(m4ex);
  var m4 = twoNode(50, 2, 4, 12, E([0, 2], [1, 2], "V", 20, { plus: "a", name: "V2" }), { r2: { ilabel: "i" } }), ms4 = meshes(m4);
  L["c1-techniques-4"] = {
    id: "c1-techniques-4", ar: "مدخل إلى طريقة تيارات الحلقات", en: "Introduction to the Mesh-Current Method", minutes: 30,
    objectives: ["تعرّف تيار الحلقة لكل شبكة (mesh).", "تكتب KVL لكل حلقة بدلالة تيارات الحلقات.", "تحسب تيار الفرع المشترك من تياري الحلقتين."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>الحلقة الصغرى <span class='ltr'>(mesh)</span> حلقة لا تحتوي داخلها على حلقات أخرى. نعطي كل حلقة تيارًا افتراضيًا يدور فيها (عادة مع عقارب الساعة)، ونكتب KVL حولها.</p><p>الفرع الذي تشترك فيه حلقتان يمر فيه <b>الفرق</b> بين تياريهما. بهذا تصبح المجاهيل تيارات الحلقات فقط.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>Σ R·(iₖ − iⱼ) + Σ (voltage drops of sources) = 0   (around mesh k)</div><p class='muted'>في الفرع المشترك بين الحلقة k والحلقة j، التيار في اتجاه دوران k هو <span class='ltr'>iₖ − iⱼ</span>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>تصلح للدوائر المستوية (يمكن رسمها بلا تقاطع أسلاك).</li><li>مناسبة عندما تكون الحلقات أقل من العقد، أو عند وجود مصادر جهد كثيرة.</li><li>عدد المعادلات = عدد الحلقات الصغرى.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(m4ex, "دائرة بحلقتين i1 و i2") +
        "<ol class='steps'><li><b>الحلقة 1:</b> " + eqi("−40 + 3i₁ + 10(i₁ − i₂) = 0") + "</li><li><b>الحلقة 2:</b> " + eqi("10(i₂ − i₁) + 2i₂ + 20 = 0") + " (ندخل V2 من طرفه +، فهو هبوط)</li>" +
        "<li>" + eqi("13i₁ − 10i₂ = 40 , −10i₁ + 12i₂ = −20") + "</li><li>" + eqi("i₁ = 5 A , i₂ = 2.5 A") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>في شبكات توزيع الكهرباء داخل المباني، تحليل الحلقات يساعد على حساب التيارات في الأسلاك المشتركة بين دوائر الإنارة والمقابس، واختيار مقاطع الأسلاك المناسبة.</p>" }
    ],
    quiz: [
      { q: "تيار الفرع المشترك بين حلقتين تياراهما i₁ و i₂ (كلاهما مع عقارب الساعة):", options: [
        { t: "<span class='ltr'>i₁ − i₂</span> (في اتجاه i₁)", correct: true, why: "التياران يمران في الفرع المشترك في اتجاهين متعاكسين." }, { t: "<span class='ltr'>i₁ + i₂</span>", type: "sign", why: "التياران متعاكسان في الفرع المشترك، فنطرح." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 50 V</span>، <span class='ltr'>R1 = 2 Ω</span>، <span class='ltr'>R2 = 4 Ω</span>، <span class='ltr'>R3 = 12 Ω</span>، <span class='ltr'>V2 = 20 V</span>.",
      figure: fig(m4, "دائرة بحلقتين ومصدري جهد"),
      steps: [
        { id: "s1", kind: "choice", label: "ما معادلة KVL الصحيحة للحلقة الثانية؟", options: [
          { t: eqi("4(i₂ − i₁) + 12i₂ + 20 = 0"), correct: true },
          { t: eqi("4(i₂ − i₁) + 12i₂ − 20 = 0"), type: "sign", why: "أثناء الدوران مع عقارب الساعة ندخل V2 من طرفه + (الأعلى)، فهو هبوط يُكتب موجبًا.", review: R("c1-elements-3", "laws", "إشارات KVL") },
          { t: eqi("4i₂ + 12i₂ + 20 = 0"), type: "conceptual", why: "R2 مشتركة، فتيارها في اتجاه i₂ هو i₂ − i₁.", review: R("c1-techniques-4", "concept", "الفرع المشترك") } ],
          hints: ["R2 مشتركة. وما إشارة V2 عند دخولك من طرفه العلوي؟"], solution: eqi("4(i₂ − i₁) + 12i₂ + 20 = 0") },
        { id: "s2", label: "احسب <span class='ltr'>i₁</span>.", symbol: "i₁ =", answer: ms4[0].value, units: A, unitDefault: 1, diagnose: [],
          hints: ["الحلقة 1: " + eqi("−50 + 2i₁ + 4(i₁ − i₂) = 0 → 6i₁ − 4i₂ = 50") + ".", "الحلقة 2: " + eqi("−4i₁ + 16i₂ = −20") + "."], solution: eqi("i₁ = 9 A") },
        { id: "s3", label: "احسب <span class='ltr'>i₂</span>.", symbol: "i₂ =", answer: ms4[1].value, units: A, unitDefault: 1, diagnose: [], hints: [eqi("16i₂ = −20 + 4 × 9")], solution: eqi("i₂ = 16/16 = 1 A") },
        { id: "s4", label: "احسب تيار <span class='ltr'>R2</span> باتجاه السهم (للأسفل).", symbol: "i =", answer: solve(m4).byName.R2.i, units: A, unitDefault: 1,
          diagnose: [{ value: ms4[0].value + ms4[1].value, type: "sign", why: "جمعت تياري الحلقتين. في R2 يمر i₁ للأسفل و i₂ للأعلى، فالتيار للأسفل = i₁ − i₂." }],
          hints: ["i₁ يمر في R2 للأسفل، و i₂ يمر فيها للأعلى."], solution: eqi("i = i₁ − i₂ = 9 − 1 = 8 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: تيارات الحلقات", kinds: ["iM"], families: ["ladder", "grid"] },
    lab: { title: "تيار الفرع المشترك", desc: "في المعمل الذكي ستقيس تيار الفرع المشترك، وتتحقق أنه يساوي فرق تياري الحلقتين." }
  };

  /* ================= 5. Mesh-current with dependent sources ================= */
  var m5ex = twoNode(40, 8, 20, 10, E([0, 2], [1, 2], "CCVS", 5, { plus: "a", ctrl: "R2", name: "D" }), { r2: { isCtrl: true } }); meshes(m5ex);
  var m5 = twoNode(20, 6, 2, 5, E([0, 2], [1, 2], "CCVS", 8, { plus: "b", ctrl: "R2", name: "D" }), { r2: { isCtrl: true } }), ms5 = meshes(m5), s5 = solve(m5);
  L["c1-techniques-5"] = {
    id: "c1-techniques-5", ar: "طريقة تيارات الحلقات والمصادر التابعة", en: "The Mesh-Current Method and Dependent Sources", minutes: 30,
    objectives: ["تعبّر عن الكمية المتحكِّمة بدلالة تيارات الحلقات.", "تكتب KVL مع مصدر جهد تابع.", "تحسب قدرة المصدر التابع."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>نفس الفكرة في طريقة العقد: المصدر التابع يدخل KVL كمصدر عادي، ونضيف <b>معادلة قيد</b> تعبّر عن iₓ أو vₓ بدلالة تيارات الحلقات. إذا كانت iₓ في فرع مشترك، فهي فرق تياري الحلقتين.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>iₓ = i₁ − i₂   (if iₓ flows in the shared branch in the direction of i₁)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>حدد اتجاه iₓ المرسوم وقارنه باتجاه تيارات الحلقات.</li><li>بعد التعويض، رتّب المعادلات وحلها كالمعتاد.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(m5ex, "دائرة حلقتين مع مصدر جهد تابع قيمته 5 iₓ") +
        "<ol class='steps'><li><b>القيد:</b> iₓ في R2 للأسفل، فـ " + eqi("iₓ = i₁ − i₂") + "</li><li><b>الحلقة 1:</b> " + eqi("−40 + 8i₁ + 20(i₁ − i₂) = 0") + "</li><li><b>الحلقة 2:</b> ندخل المصدر التابع من طرفه +: " + eqi("20(i₂ − i₁) + 10i₂ + 5iₓ = 0") + "</li><li>" + eqi("i₁ = 2.5 A , i₂ = 1.5 A , iₓ = 1 A") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مكبرات العمليات في نماذجها المبسطة تحتوي مصدر جهد تابعًا (VCVS) بكسب كبير جدًا، وتُحل دوائرها بالحلقات أو العقد بنفس الأسلوب.</p>" }
    ],
    quiz: [
      { q: "مصدر جهد تابع قيمته <span class='ltr'>8iₓ</span> في حلقة. عند كتابة KVL:", options: [
        { t: "نكتب 8iₓ بالإشارة حسب قطبيته، ثم نعوّض iₓ بدلالة تيارات الحلقات", correct: true, why: "هكذا تبقى المجاهيل تيارات الحلقات فقط." }, { t: "نحذفه لأنه ليس مصدرًا مستقلًا", type: "conceptual", why: "المصدر التابع يؤثر في الدائرة ولا يُحذف." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 20 V</span>، <span class='ltr'>R1 = 6 Ω</span>، <span class='ltr'>R2 = 2 Ω</span> (تيارها iₓ)، <span class='ltr'>R3 = 5 Ω</span>، ومصدر جهد تابع <span class='ltr'>8iₓ</span> طرفه الموجب في الأسفل.",
      figure: fig(m5, "دائرة حلقتين مع مصدر جهد تابع قيمته 8 iₓ"),
      steps: [
        { id: "s1", kind: "choice", label: "ما معادلة القيد؟", options: [
          { t: eqi("iₓ = i₁ − i₂"), correct: true }, { t: eqi("iₓ = i₂ − i₁"), type: "sign", why: "سهم iₓ للأسفل في R2، وهو اتجاه i₁ في الفرع المشترك." }, { t: eqi("iₓ = i₁"), type: "conceptual", why: "R2 مشتركة بين الحلقتين، فتيارها فرق التيارين." } ],
          hints: ["في R2: i₁ للأسفل و i₂ للأعلى."], solution: eqi("iₓ = i₁ − i₂") },
        { id: "s2", label: "احسب <span class='ltr'>i₁</span>.", symbol: "i₁ =", answer: ms5[0].value, units: A, unitDefault: 1,
          diagnose: [{ value: 20 / (8 - 4 / 7), type: "conceptual", why: "تجاهلت المصدر التابع (اعتبرته سلكًا). جهده 8iₓ يدخل في KVL للحلقة الثانية.", review: R("c1-techniques-5", "concept", "المصدر التابع في KVL") }],
          hints: ["الحلقة 2: ندخل المصدر التابع من طرفه − (العلوي)، فهو ارتفاع: " + eqi("2(i₂ − i₁) + 5i₂ − 8(i₁ − i₂) = 0") + ".", "الحلقة 1: " + eqi("−20 + 6i₁ + 2(i₁ − i₂) = 0") + "."], solution: eqi("15i₂ = 10i₁ → i₂ = (2/3)i₁ ; 8i₁ − (4/3)i₁ = 20 → i₁ = 3 A") },
        { id: "s3", label: "احسب <span class='ltr'>i₂</span>.", symbol: "i₂ =", answer: ms5[1].value, units: A, unitDefault: 1, diagnose: [], hints: [eqi("i₂ = (2/3)i₁")], solution: eqi("i₂ = 2 A") },
        { id: "s4", label: "احسب القدرة التي يمتصها المصدر التابع.", symbol: "p =", answer: s5.byName.D.p, units: W, unitDefault: 1,
          diagnose: [{ value: -s5.byName.D.p, type: "sign", why: "تيار i₂ يدخل المصدر التابع من طرفه العلوي، وهو الطرف السالب، فالقدرة الممتصة " + eqi("p = −vi") + ".", review: R("c1-variables-3", "diagram", "الحالات الأربع") }],
          hints: ["جهد المصدر " + eqi("8iₓ = 8 V") + "، وتياره i₂ = 2 A للأسفل، أي يدخل من الطرف −."], solution: eqi("p = −(8)(2) = −16 W") + ": المصدر التابع يولّد 16 W." }
      ]
    },
    generator: { title: "تمارين مولّدة: تيارات الحلقات مع مصادر تابعة", kinds: ["iM"], families: ["ladder", "grid"], dependent: true },
    lab: { title: "مصدر جهد تابع", desc: "في المعمل الذكي ستغيّر ثابت المصدر التابع وتقيس تيارات الحلقتين." }
  };

  /* ================= 6. Mesh special cases ================= */
  function supermesh(Vs, r1, I, r2, r3) {
    return { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", Vs, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", r1, { name: "R1" }), E([0, 1], [1, 1], "I", I, { dir: "ab", name: "Is" }), E([0, 1], [0, 2], "R", r2, { name: "R2" }), E([0, 2], [1, 2], "R", r3, { name: "R3" })].concat(bottom3) };
  }
  var m6ex = supermesh(40, 8, 2.5, 12, 20); meshes(m6ex);
  var m6 = supermesh(30, 4, 3, 12, 2), ms6 = meshes(m6), s6 = solve(m6);
  L["c1-techniques-6"] = {
    id: "c1-techniques-6", ar: "تيارات الحلقات: حالات خاصة", en: "The Mesh-Current Method: Some Special Cases", minutes: 30,
    objectives: ["تتعامل مع مصدر تيار في فرع خارجي.", "تستخدم الحلقة العظمى (Supermesh) لمصدر تيار في فرع مشترك.", "تكتب معادلة القيد للحلقة العظمى."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p><b>الحالة 1:</b> مصدر تيار في فرع لا تمر به إلا حلقة واحدة: تيار هذه الحلقة يساوي قيمة المصدر مباشرة.</p><p><b>الحالة 2:</b> مصدر تيار في فرع مشترك بين حلقتين: جهده مجهول، فلا نكتب KVL لكل حلقة. نتجاهل هذا الفرع ونكتب KVL حول المسار الخارجي للحلقتين معًا، وتسمى <b>الحلقة العظمى</b> <span class='ltr'>(supermesh)</span>، ثم نضيف القيد: فرق تياري الحلقتين = قيمة المصدر.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>i₁ − i₂ = Iₛ   (Iₛ in the direction of i₁ in the shared branch)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>لا تكتب جهد مصدر التيار كأنه صفر؛ هو مجهول.</li><li>اتجاه سهم المصدر يحدد إشارة القيد.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(m6ex, "دائرة حلقتين بينهما مصدر تيار") +
        "<ol class='steps'><li><b>القيد:</b> السهم للأسفل وهو اتجاه i₁: " + eqi("i₁ − i₂ = 2.5") + "</li><li><b>KVL للحلقة العظمى (المسار الخارجي):</b> " + eqi("−40 + 8i₁ + 12i₂ + 20i₂ = 0") + "</li><li>" + eqi("8(i₂ + 2.5) + 32i₂ = 40 → i₂ = 0.5 A , i₁ = 3 A") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مصادر التيار تظهر في نماذج الحساسات ودوائر شحن البطاريات بتيار ثابت، والحلقة العظمى هي الطريقة المباشرة لتحليل هذه الدوائر بالحلقات.</p>" }
    ],
    quiz: [
      { q: "مصدر تيار في الفرع الخارجي لحلقة واحدة قيمته 2 A مع اتجاه الحلقة:", options: [
        { t: "تيار هذه الحلقة = 2 A مباشرة", correct: true, why: "لا يمر في هذا الفرع غير تيار هذه الحلقة." }, { t: "نحتاج حلقة عظمى", type: "conceptual", why: "الحلقة العظمى للمصدر في فرع مشترك فقط." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 30 V</span>، <span class='ltr'>R1 = 4 Ω</span>، مصدر تيار <span class='ltr'>3 A</span> في الفرع الأوسط، <span class='ltr'>R2 = 12 Ω</span>، <span class='ltr'>R3 = 2 Ω</span>.",
      figure: fig(m6, "دائرة حلقتين مع مصدر تيار 3 أمبير في الفرع المشترك"),
      steps: [
        { id: "s1", kind: "choice", label: "كيف نتعامل مع مصدر التيار في الفرع المشترك؟", options: [
          { t: "حلقة عظمى حول المسار الخارجي، مع " + eqi("i₁ − i₂ = 3"), correct: true },
          { t: "KVL لكل حلقة مع اعتبار جهد مصدر التيار صفرًا", type: "conceptual", why: "جهد مصدر التيار مجهول وليس صفرًا.", review: R("c1-techniques-6", "concept", "الحلقة العظمى") },
          { t: "حلقة عظمى مع " + eqi("i₂ − i₁ = 3"), type: "sign", why: "سهم المصدر للأسفل، وهو اتجاه i₁ في الفرع المشترك." } ],
          hints: ["هل جهد مصدر التيار معروف؟"], solution: "حلقة عظمى مع " + eqi("i₁ − i₂ = 3") },
        { id: "s2", label: "احسب <span class='ltr'>i₂</span>.", symbol: "i₂ =", answer: ms6[1].value, units: A, unitDefault: 1,
          diagnose: [{ value: 42 / 18, type: "sign", why: "استخدمت " + eqi("i₁ = i₂ − 3") + ". سهم المصدر في اتجاه i₁." }],
          hints: ["المسار الخارجي: " + eqi("−30 + 4i₁ + 12i₂ + 2i₂ = 0") + "، و " + eqi("i₁ = i₂ + 3") + "."], solution: eqi("4(i₂ + 3) + 14i₂ = 30 → 18i₂ = 18 → i₂ = 1 A") },
        { id: "s3", label: "احسب <span class='ltr'>i₁</span>.", symbol: "i₁ =", answer: ms6[0].value, units: A, unitDefault: 1, diagnose: [], hints: [eqi("i₁ = i₂ + 3")], solution: eqi("i₁ = 4 A") },
        { id: "s4", label: "احسب جهد مصدر التيار (الطرف العلوي موجب).", symbol: "v =", answer: s6.byName.Is.v, units: V, unitDefault: 1,
          diagnose: [{ value: 0, type: "conceptual", why: "جهد مصدر التيار ليس صفرًا. احسبه من KVL حول الحلقة الأولى أو الثانية." }],
          hints: ["الحلقة 2: الجهد على المصدر = جهد R2 + جهد R3 = " + eqi("14 × 1") + "."], solution: eqi("v = 12(1) + 2(1) = 14 V") + "، وللتحقق من الحلقة 1: " + eqi("30 − 4 × 4 = 14 V") + " ✓" }
      ]
    },
    generator: { title: "تمارين مولّدة: تيارات الحلقات مع مصادر تيار", kinds: ["iM"], families: ["ladder", "grid"] },
    lab: { title: "الحلقة العظمى", desc: "في المعمل الذكي ستقيس الجهد على مصدر تيار في فرع مشترك، وتتحقق أنه يوازن KVL في الحلقتين." }
  };

  /* ================= 7. Node vs mesh ================= */
  var c7 = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 24, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 2, { name: "R1" }), E([0, 1], [0, 2], "R", 5, { name: "R2" }), E([0, 2], [0, 3], "R", 2, { name: "R3" }), E([0, 1], [1, 1], "R", 8, { name: "R4" }), E([0, 2], [1, 2], "R", 6, { name: "R5", vlabel: "v" }), E([0, 3], [1, 3], "R", 4, { name: "R6" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W"), E([1, 2], [1, 3], "W")] }, s7 = solve(c7);
  L["c1-techniques-7"] = {
    id: "c1-techniques-7", ar: "جهود العقد أم تيارات الحلقات؟", en: "The Node-Voltage Method Versus the Mesh-Current Method", minutes: 20,
    objectives: ["تعدّ المعادلات اللازمة لكل طريقة.", "تختار الطريقة الأقل معادلات والأنسب لنوع المصادر.", "تحل بالطريقة المختارة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>الطريقتان تعطيان نفس النتيجة دائمًا. الفرق في <b>عدد المعادلات</b> وصعوبتها. قبل الحل، عُدّ:</p><ul class='ticks'><li><b>جهود العقد:</b> عدد العقد الأساسية − 1، مطروحًا منه مصادر الجهد (كل مصدر جهد يحذف مجهولًا).</li><li><b>تيارات الحلقات:</b> عدد الحلقات الصغرى، مطروحًا منه مصادر التيار.</li></ul>" },
      { id: "laws", title: "القوانين", en: "Counting", html: "<div class='eq-row'><div class='eq'>N<sub>node</sub> = nₑ − 1 − (voltage sources)</div><div class='eq'>N<sub>mesh</sub> = meshes − (current sources)</div></div><p class='muted'>العقدة الأساسية: عقدة يلتقي فيها ثلاثة عناصر أو أكثر.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>دوائر بفروع كثيرة على التوازي ← غالبًا العقد أسهل.</li><li>دوائر بحلقات قليلة ومصادر جهد ← غالبًا الحلقات أسهل.</li><li>المطلوب نفسه يرجّح: إذا كان المطلوب جهدًا فالعقد أقرب، وإذا كان تيارًا في فرع خارجي فالحلقات أقرب.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>دائرة فيها 4 عقد أساسية، و 5 حلقات صغرى، ومصدر جهد واحد بين عقدة والمرجع، ومصدر تيار في فرع خارجي.</p><ol class='steps'><li><b>العقد:</b> " + eqi("4 − 1 − 1 = 2") + " معادلتان.</li><li><b>الحلقات:</b> " + eqi("5 − 1 = 4") + " معادلات.</li><li>الأفضل: جهود العقد.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>المهندس الذي يحل دائرة بيده يختار الطريقة الأقصر، أما برامج المحاكاة فتستخدم جهود العقد دائمًا لأنها تعمل على أي دائرة، حتى غير المستوية.</p>" }
    ],
    quiz: [
      { q: "دائرة فيها 3 عقد أساسية و 4 حلقات صغرى، بدون مصادر خاصة. أي طريقة أقل معادلات؟", options: [
        { t: "جهود العقد (معادلتان)", correct: true, why: "3 − 1 = 2 مقابل 4." }, { t: "تيارات الحلقات (3 معادلات)", type: "conceptual", why: "الحلقات الصغرى 4، فهي 4 معادلات." } ]}
    ],
    practice: {
      prompt: "دائرة سلم: <span class='ltr'>Vs = 24 V</span> مع ست مقاومات. قارن بين الطريقتين ثم احسب جهد <span class='ltr'>R5</span>.",
      figure: fig(c7, "دائرة سلم بثلاث حلقات"),
      steps: [
        { id: "s1", label: "كم معادلة نحتاج بطريقة جهود العقد؟", symbol: "N =", answer: 2, units: CNT,
          diagnose: [{ value: 3, type: "conceptual", why: "العقدة العليا اليسرى جهدها معروف (24 V) من مصدر الجهد، والعقدة العليا اليمنى ليست أساسية (عنصران فقط: R3 و R6)." }, { value: 4, type: "conceptual", why: "لا نحسب العقدة المرجعية، ولا العقدة المعروف جهدها." }],
          hints: ["العقد الأساسية: نقطتا التقاء العليا (بين R1-R2-R4 وبين R2-R3-R5) والضلع السفلي."], solution: "العقدتان العلويتان الوسطيتان فقط: معادلتان." },
        { id: "s2", label: "كم معادلة نحتاج بطريقة تيارات الحلقات؟", symbol: "N =", answer: 3, units: CNT,
          diagnose: [{ value: 4, type: "conceptual", why: "عددت الحلقة الخارجية. نعدّ الحلقات الصغرى فقط (النوافذ)." }], hints: ["عدّ النوافذ."], solution: "3 حلقات صغرى: 3 معادلات." },
        { id: "s3", label: "احسب جهد <span class='ltr'>R5</span> (الطرف العلوي موجب) بالطريقة الأنسب.", symbol: "v =", answer: s7.byName.R5.v, units: V, unitDefault: 1,
          diagnose: [{ value: s7.byName.R4.v, type: "substitution", why: "هذا جهد R4 (العقدة الأولى). R5 متصلة بالعقدة الثانية." }],
          hints: ["العقدة 1: " + eqi("(v₁ − 24)/2 + v₁/8 + (v₁ − v₂)/5 = 0") + ".", "العقدة 2: " + eqi("(v₂ − v₁)/5 + v₂/6 + v₂/(2 + 4) = 0") + "."], solution: eqi("v₁ = 16 V , v₂ = 6 V") + "، فجهد R5 = 6 V." }
      ]
    },
    generator: { title: "تمارين مولّدة: عقد أو حلقات", kinds: ["vN", "iM"], families: ["ladder", "grid"] },
    lab: { title: "حل بطريقتين", desc: "في المعمل الذكي ستقيس نفس الدائرة، وتقارن القياس بحلّك بالعقد وحلّك بالحلقات." }
  };

  /* ================= 8. Source transformations ================= */
  var c8 = twoNode(36, 6, 3, 2, E([0, 2], [1, 2], "R", 8, { name: "R4", ilabel: "i" })), s8 = solve(c8);
  L["c1-techniques-8"] = {
    id: "c1-techniques-8", ar: "تحويل المصادر", en: "Source Transformations", minutes: 25,
    objectives: ["تحوّل مصدر جهد مع مقاومة على التوالي إلى مصدر تيار مع مقاومة على التوازي، والعكس.", "تستخدم التحويلات المتتالية لاختزال دائرة.", "تعرف حدود التحويل."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>مصدر جهد <span class='ltr'>vₛ</span> على التوالي مع مقاومة R يكافئ تمامًا (بالنسبة لبقية الدائرة) مصدر تيار <span class='ltr'>iₛ = vₛ/R</span> على التوازي مع نفس المقاومة R. سهم مصدر التيار يتجه نحو الطرف الذي كان عنده الموجب.</p><p>بالتبديل بين الشكلين نستطيع جمع المقاومات على التوالي أو التوازي خطوة خطوة حتى تبسط الدائرة.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>iₛ = vₛ / R</div><div class='eq'>vₛ = iₛ R</div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>التحويل يحتاج مقاومة على التوالي مع مصدر الجهد، أو على التوازي مع مصدر التيار.</li><li>المقاومة نفسها تبقى، وتتغير طريقة توصيلها فقط.</li><li>لا تحوّل المقاومة التي تريد تيارها أو جهدها، فهي تختفي داخل المكافئ.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>حوّل <span class='ltr'>48 V</span> على التوالي مع <span class='ltr'>8 Ω</span>.</p><ol class='steps'><li>" + eqi("iₛ = 48/8 = 6 A") + " على التوازي مع 8 Ω، والسهم نحو طرف الموجب السابق.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>البطارية الحقيقية مصدر جهد مع مقاومة داخلية صغيرة. تحويلها لمصدر تيار يبين لماذا يكون تيار القصر كبيرًا جدًا وخطيرًا: <span class='ltr'>12 V / 0.02 Ω = 600 A</span>.</p>" }
    ],
    quiz: [
      { q: "مصدر تيار <span class='ltr'>5 A</span> على التوازي مع <span class='ltr'>4 Ω</span> يكافئ:", options: [
        { t: "<span class='ltr'>20 V</span> على التوالي مع 4 Ω", correct: true, why: "vₛ = iₛR." }, { t: "<span class='ltr'>1.25 V</span> مع 4 Ω", type: "formula", why: "قسمت. vₛ = iₛ × R." }, { t: "<span class='ltr'>20 V</span> مع 0.25 Ω", type: "conceptual", why: "المقاومة نفسها تبقى 4 Ω." } ]}
    ],
    practice: {
      prompt: "استخدم تحويل المصادر لحساب التيار في <span class='ltr'>R4</span>. القيم: <span class='ltr'>Vs = 36 V</span>، <span class='ltr'>R1 = 6 Ω</span>، <span class='ltr'>R2 = 3 Ω</span>، <span class='ltr'>R3 = 2 Ω</span>، <span class='ltr'>R4 = 8 Ω</span>.",
      figure: fig(c8, "مصدر 36 فولت ومقاومات بعضها على التوالي وبعضها على التوازي"),
      steps: [
        { id: "s1", label: "حوّل Vs مع R1 إلى مصدر تيار. ما قيمته؟", symbol: "iₛ =", answer: 6, units: A, unitDefault: 1,
          diagnose: [{ value: 216, type: "formula", why: "ضربت. " + eqi("iₛ = vₛ / R") + "." }, { value: 1 / 6, type: "formula", why: "قسمت R على vₛ. " + eqi("iₛ = vₛ / R") + "." }], hints: [eqi("36 / 6")], solution: eqi("iₛ = 36/6 = 6 A") + " مع 6 Ω على التوازي." },
        { id: "s2", label: "اجمع مقاومة المصدر الجديد مع R2 (على التوازي).", symbol: "R =", answer: 2, units: OHM, unitDefault: 0,
          diagnose: [{ value: 9, type: "conceptual", why: "بعد التحويل صارت 6 Ω على التوازي مع R2، وليس على التوالي." }], hints: [eqi("6 ∥ 3")], solution: eqi("6 ∥ 3 = 2 Ω") },
        { id: "s3", label: "حوّل مصدر التيار (6 A مع 2 Ω) إلى مصدر جهد. ما قيمته؟", symbol: "vₛ =", answer: 12, units: V, unitDefault: 1, diagnose: [{ value: 3, type: "formula", why: "قسمت. " + eqi("vₛ = iₛR") + "." }], hints: [eqi("6 × 2")], solution: eqi("vₛ = 6 × 2 = 12 V") + " على التوالي مع 2 Ω." },
        { id: "s4", label: "احسب تيار <span class='ltr'>R4</span>.", symbol: "i =", answer: s8.byName.R4.i, units: A, unitDefault: 1,
          diagnose: [{ value: 1.5, type: "conceptual", why: "قسمت 12 على 8 فقط. صارت الدائرة حلقة واحدة: 2 Ω و R3 و R4 على التوالي." }], hints: ["حلقة واحدة: " + eqi("12 / (2 + 2 + 8)")], solution: eqi("i = 12/12 = 1 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: جهد ثيفنن بتحويل المصادر", kinds: ["Vth"], families: ["ladder"] },
    lab: { title: "مكافئ البطارية", desc: "في المعمل الذكي ستقيس جهد بطارية بدون حمل ومع أحمال مختلفة لتستنتج مقاومتها الداخلية." }
  };

  /* ================= 9. Thévenin and Norton ================= */
  function port3(Vs, r1, r2, r3) { return { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", Vs, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", r1, { name: "R1" }), E([0, 1], [1, 1], "R", r2, { name: "R2" }), E([0, 1], [0, 2], "R", r3, { name: "R3" }), E([0, 2], [1, 2], "T", 0, { name: "ab" })].concat(bottom3) }; }
  var t9ex = port3(12, 4, 12, 1), t9 = port3(60, 6, 12, 4), th9 = AN.thevenin(t9);
  L["c1-techniques-9"] = {
    id: "c1-techniques-9", ar: "مكافئا ثيفنن ونورتن", en: "Thévenin and Norton Equivalents", minutes: 30,
    objectives: ["تحسب جهد ثيفنن من جهد الدائرة المفتوحة.", "تحسب مقاومة ثيفنن بإطفاء المصادر المستقلة.", "تحسب تيار نورتن وتربط بين المكافئين."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>أي شبكة خطية بين طرفين a و b يمكن استبدالها بـ <b>مصدر جهد V<sub>Th</sub> على التوالي مع مقاومة R<sub>Th</sub></b> (مكافئ ثيفنن)، أو <b>مصدر تيار I<sub>N</sub> على التوازي مع R<sub>Th</sub></b> (مكافئ نورتن). أي حمل يوصل بين a و b يتصرف تمامًا كأنه موصول بالشبكة الأصلية.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>V<sub>Th</sub> = v<sub>oc</sub></div><div class='eq'>I<sub>N</sub> = i<sub>sc</sub></div><div class='eq'>R<sub>Th</sub> = V<sub>Th</sub> / I<sub>N</sub></div></div><p class='muted'>بدون مصادر تابعة: R<sub>Th</sub> = المقاومة المكافئة بين a و b بعد إطفاء المصادر المستقلة (مصدر الجهد ← سلك، مصدر التيار ← دائرة مفتوحة).</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>عندما تريد دراسة حمل يتغير (مثل مقاومة متغيرة) دون إعادة حل الدائرة كلها في كل مرة.</li><li>V<sub>Th</sub> يُحسب بدون أي حمل بين الطرفين.</li><li>I<sub>N</sub> يُحسب بوصل الطرفين بسلك.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(t9ex, "شبكة بين الطرفين a و b") +
        "<ol class='steps'><li><b>V<sub>Th</sub>:</b> لا تيار في R3 والطرفان مفتوحان، فـ V<sub>Th</sub> = جهد R2 بقسمة الجهد: " + eqi("12 × 12/(4 + 12) = 9 V") + "</li><li><b>R<sub>Th</sub>:</b> أطفئ المصدر (سلك): " + eqi("R3 + R1 ∥ R2 = 1 + 3 = 4 Ω") + "</li><li><b>I<sub>N</sub>:</b> " + eqi("9 / 4 = 2.25 A") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مخرج الصوت في الهاتف ومخرج مقسّم الحساسات يُوصفان بمكافئ ثيفنن: جهد ومقاومة خرج. وهذا ما يحدد هل الحمل (سماعة أو متحكم) سيُحمّل المخرج ويخفض جهده أم لا.</p>" }
    ],
    quiz: [
      { q: "لحساب R<sub>Th</sub> في دائرة بمصادر مستقلة فقط، مصدر الجهد يُستبدل بـ:", options: [
        { t: "سلك (قصر)", correct: true, why: "إطفاء مصدر الجهد يعني جعل جهده صفرًا." }, { t: "دائرة مفتوحة", type: "conceptual", why: "هذا لمصدر التيار." }, { t: "يبقى كما هو", type: "conceptual", why: "عند حساب R<sub>Th</sub> نطفئ المصادر المستقلة." } ]},
      { q: "V<sub>Th</sub> = 20 V و I<sub>N</sub> = 4 A. مقاومة ثيفنن:", options: [
        { t: "<span class='ltr'>5 Ω</span>", correct: true, why: "20/4." }, { t: "<span class='ltr'>80 Ω</span>", type: "formula", why: "R<sub>Th</sub> = V<sub>Th</sub>/I<sub>N</sub>." } ]}
    ],
    practice: {
      prompt: "أوجد مكافئ ثيفنن ونورتن بين a و b. القيم: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 6 Ω</span>، <span class='ltr'>R2 = 12 Ω</span>، <span class='ltr'>R3 = 4 Ω</span>.",
      figure: fig(t9, "شبكة بين الطرفين a و b بمصدر 60 فولت"),
      steps: [
        { id: "s1", label: "احسب <span class='ltr'>V<sub>Th</sub></span>.", symbol: "VTh =", answer: th9.voc, units: V, unitDefault: 1,
          diagnose: [{ value: 60, type: "conceptual", why: "الجهد بين a و b ليس جهد المصدر؛ هو جهد R2 لأن R3 لا يمر فيها تيار." }, { value: 20, type: "substitution", why: "هذا جهد R1. الطرفان a و b على R2 (عبر R3)." }],
          hints: ["بدون حمل لا يمر تيار في R3، فجهد a-b = جهد R2."], solution: eqi("V<sub>Th</sub> = 60 × 12/18 = 40 V") },
        { id: "s2", label: "احسب <span class='ltr'>R<sub>Th</sub></span>.", symbol: "RTh =", answer: th9.rth, units: OHM, unitDefault: 0,
          diagnose: [{ value: 4, type: "conceptual", why: "حسبت R1 ∥ R2 ونسيت R3 على التوالي معها." }, { value: 22, type: "conceptual", why: "جمعت كل المقاومات. بعد إطفاء المصدر صارت R1 و R2 على التوازي." }],
          hints: ["أطفئ Vs (سلك)، ثم انظر من الطرفين."], solution: eqi("R<sub>Th</sub> = 4 + 6 ∥ 12 = 4 + 4 = 8 Ω") },
        { id: "s3", label: "احسب <span class='ltr'>I<sub>N</sub></span>.", symbol: "IN =", answer: th9.isc, units: A, unitDefault: 1,
          diagnose: [{ value: 320, type: "formula", why: "ضربت V<sub>Th</sub> في R<sub>Th</sub>. " + eqi("I<sub>N</sub> = V<sub>Th</sub> / R<sub>Th</sub>") + "." }, { value: 10, type: "conceptual", why: "قسمت 60 V على 6 Ω. هذا تيار R1 عند قصر طرفي R2 فقط، أما القصر هنا فبين a و b." }], hints: [eqi("40 / 8")], solution: eqi("I<sub>N</sub> = 40/8 = 5 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: ثيفنن ونورتن", kinds: ["Vth", "Rth", "In"], families: ["ladder", "grid"] },
    lab: { title: "قياس مكافئ ثيفنن", desc: "في المعمل الذكي ستقيس جهد الدائرة المفتوحة وتيار القصر لشبكة، وتستنتج مكافئها، ثم تتحقق بحمل." }
  };

  /* ================= 10. More on deriving Thévenin ================= */
  function port4(Vs, r1, beta, dir, r3, r2) { return { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", Vs, { plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", r1, { name: "R1", isCtrl: true }), E([0, 1], [1, 1], "R", r2, { name: "R2" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "CCCS", beta, { dir: dir, ctrl: "R1", name: "D" }), E([0, 2], [0, 3], "R", r3, { name: "R3" }), E([0, 3], [1, 3], "T", 0, { name: "ab" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W"), E([1, 2], [1, 3], "W")] }; }
  var t10ex = port4(24, 4, 2, "ab", 12, 8), t10 = port4(36, 30, 0.5, "ab", 2, 12), th10 = AN.thevenin(t10);
  L["c1-techniques-10"] = {
    id: "c1-techniques-10", ar: "المزيد عن إيجاد مكافئ ثيفنن", en: "More on Deriving a Thévenin Equivalent", minutes: 30,
    objectives: ["تحسب R<sub>Th</sub> بقسمة جهد الدائرة المفتوحة على تيار القصر.", "تستخدم مصدر اختبار لحساب R<sub>Th</sub>.", "تعرف لماذا لا تُطفأ المصادر التابعة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>إذا كانت الدائرة تحتوي مصادر تابعة، لا يصح إطفاؤها، لأن قيمتها تعتمد على الدائرة نفسها. لحساب R<sub>Th</sub> طريقتان:</p><ol class='steps'><li><b>v<sub>oc</sub> / i<sub>sc</sub>:</b> احسب جهد الدائرة المفتوحة وتيار القصر، والنسبة بينهما R<sub>Th</sub>.</li><li><b>مصدر اختبار:</b> أطفئ المصادر <b>المستقلة</b> فقط، وصل مصدر اختبار (مثلًا 1 A) بين a و b، واحسب الجهد الناتج: <span class='ltr'>R<sub>Th</sub> = v<sub>T</sub> / i<sub>T</sub></span>.</li></ol>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>R<sub>Th</sub> = v<sub>oc</sub> / i<sub>sc</sub></div><div class='eq'>R<sub>Th</sub> = v<sub>T</sub> / i<sub>T</sub></div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>مع المصادر التابعة: لا تطفئها أبدًا.</li><li>إذا لم توجد مصادر مستقلة، فإن v<sub>oc</sub> = 0 ونحتاج مصدر الاختبار.</li><li>المصادر التابعة قد تجعل V<sub>Th</sub> أكبر من جهد المصدر المستقل.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(t10ex, "شبكة بمصدر تيار تابع بين الطرفين a و b") +
        "<p class='q'>المصدر التابع <span class='ltr'>2iₓ</span> للأسفل، و iₓ تيار R1.</p><ol class='steps'><li><b>v<sub>oc</sub>:</b> " + eqi("iₓ = (24 − v)/4") + "، و KCL: " + eqi("iₓ = v/8 + 2iₓ") + " → " + eqi("v = 48 V") + " (أكبر من 24 V!).</li><li><b>i<sub>sc</sub>:</b> بقصر a-b: " + eqi("i<sub>sc</sub> = 12 A") + ".</li><li>" + eqi("R<sub>Th</sub> = 48/12 = 4 Ω") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مقاومة الخرج لمكبر الترانزستور تُحسب بهذه الطريقة، لأن الترانزستور مصدر تابع. ولهذا قد تكون مقاومة خرج المكبر مختلفة جدًا عن أي مقاومة فيزيائية في الدائرة.</p>" }
    ],
    quiz: [
      { q: "دائرة فيها مصدر تابع فقط بدون مصادر مستقلة. جهد ثيفنن:", options: [
        { t: "صفر، ونحتاج مصدر اختبار لـ R<sub>Th</sub>", correct: true, why: "بدون مصدر مستقل لا شيء يولّد جهدًا أو تيارًا." }, { t: "لا يمكن حسابه", type: "conceptual", why: "V<sub>Th</sub> = 0، و R<sub>Th</sub> بمصدر اختبار." } ]}
    ],
    practice: {
      prompt: "أوجد مكافئ ثيفنن. القيم: <span class='ltr'>Vs = 36 V</span>، <span class='ltr'>R1 = 30 Ω</span> (تيارها iₓ)، <span class='ltr'>R2 = 12 Ω</span>، مصدر تابع <span class='ltr'>0.5iₓ</span> للأسفل، <span class='ltr'>R3 = 2 Ω</span>.",
      figure: fig(t10, "شبكة بمصدر تيار تابع قيمته نصف iₓ"),
      steps: [
        { id: "s1", kind: "choice", label: "كيف نحسب R<sub>Th</sub> هنا؟", options: [
          { t: "v<sub>oc</sub> / i<sub>sc</sub> (أو مصدر اختبار) مع إبقاء المصدر التابع", correct: true },
          { t: "نطفئ كل المصادر ثم نجمع المقاومات", type: "conceptual", why: "المصدر التابع لا يُطفأ؛ قيمته تعتمد على iₓ.", review: R("c1-techniques-10", "concept", "لماذا لا نطفئ المصادر التابعة") } ],
          hints: ["هل يوجد مصدر تابع؟"], solution: "v<sub>oc</sub> / i<sub>sc</sub>، والمصدر التابع يبقى." },
        { id: "s2", label: "احسب <span class='ltr'>V<sub>Th</sub></span>.", symbol: "VTh =", answer: th10.voc, units: V, unitDefault: 1,
          diagnose: [{ value: 36 * 12 / 42, type: "conceptual", why: "تجاهلت المصدر التابع وحسبت مقسّم جهد. المصدر يسحب 0.5iₓ من العقدة.", review: R("c1-techniques-2", "concept", "المصدر التابع في KCL") }],
          hints: [eqi("iₓ = (36 − v)/30") + "، و KCL: " + eqi("iₓ = v/12 + 0.5iₓ") + "."], solution: eqi("(36 − v)/60 = v/12 → v = 6 V") + "، و R3 بلا تيار، فـ " + eqi("V<sub>Th</sub> = 6 V") },
        { id: "s3", label: "احسب تيار القصر <span class='ltr'>i<sub>sc</sub></span> من a إلى b.", symbol: "isc =", answer: th10.isc, units: A, unitDefault: 1, diagnose: [],
          hints: ["بقصر a-b يصبح R3 بين العقدة والمرجع: " + eqi("iₓ = v/12 + 0.5iₓ + v/2") + "."], solution: eqi("(36 − v)/60 = 7v/12 → v = 1 V → i<sub>sc</sub> = 1/2 = 0.5 A") },
        { id: "s4", label: "احسب <span class='ltr'>R<sub>Th</sub></span>.", symbol: "RTh =", answer: th10.rth, units: OHM, unitDefault: 0,
          diagnose: [{ value: 2 + 30 * 12 / 42, type: "conceptual", why: "أطفأت المصدر التابع (حسبت R3 + R1 ∥ R2). مع المصادر التابعة استخدم v<sub>oc</sub>/i<sub>sc</sub>.", review: R("c1-techniques-10", "concept", "المصادر التابعة") }], hints: [eqi("6 / 0.5")], solution: eqi("R<sub>Th</sub> = 6/0.5 = 12 Ω") }
      ]
    },
    generator: { title: "تمارين مولّدة: ثيفنن مع مصادر تابعة", kinds: ["Vth", "Rth", "In"], families: ["ladder", "grid"], dependent: true },
    lab: { title: "مصدر اختبار", desc: "في المعمل الذكي ستطفئ المصادر المستقلة وتحقن تيار اختبار بين الطرفين لقياس R<sub>Th</sub> مباشرة." }
  };

  /* ================= 11. Maximum power transfer ================= */
  var t11 = port3(60, 10, 40, 8), th11 = AN.thevenin(t11);
  L["c1-techniques-11"] = {
    id: "c1-techniques-11", ar: "أقصى نقل للقدرة", en: "Maximum Power Transfer", minutes: 20,
    objectives: ["تحدد مقاومة الحمل التي تستقبل أقصى قدرة.", "تحسب أقصى قدرة من مكافئ ثيفنن.", "تعرف أن الكفاءة عند أقصى نقل 50% فقط."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>إذا وصلنا حملًا R<sub>L</sub> بشبكة مكافئها (V<sub>Th</sub>, R<sub>Th</sub>)، فإن القدرة في الحمل <span class='ltr'>p = V<sub>Th</sub>² R<sub>L</sub> / (R<sub>Th</sub> + R<sub>L</sub>)²</span>. هذه القدرة تكون أكبر ما يمكن عندما <b>R<sub>L</sub> = R<sub>Th</sub></b>.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>R<sub>L</sub> = R<sub>Th</sub></div><div class='eq'>p<sub>max</sub> = V<sub>Th</sub>² / (4R<sub>Th</sub>)</div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>في الاتصالات ومكبرات الصوت حيث الإشارة ضعيفة ونريد أكبر قدرة.</li><li>ليس في شبكات الكهرباء: عند أقصى نقل يضيع نصف القدرة في R<sub>Th</sub>، فالكفاءة 50%.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>مكافئ ثيفنن: <span class='ltr'>V<sub>Th</sub> = 40 V</span>، <span class='ltr'>R<sub>Th</sub> = 8 Ω</span>.</p><ol class='steps'><li>" + eqi("R<sub>L</sub> = 8 Ω") + "</li><li>" + eqi("p<sub>max</sub> = 40²/(4 × 8) = 50 W") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مكبرات الصوت تحدد مقاومة السماعة المناسبة (4 Ω أو 8 Ω) لهذا السبب. وفي الهوائيات تصمم دوائر الموائمة (matching) لتحقيق هذا الشرط.</p>" }
    ],
    quiz: [
      { q: "شبكة R<sub>Th</sub> = 50 Ω. لأقصى قدرة في الحمل، R<sub>L</sub> =", options: [
        { t: "<span class='ltr'>50 Ω</span>", correct: true, why: "R<sub>L</sub> = R<sub>Th</sub>." }, { t: "أكبر قيمة ممكنة", type: "conceptual", why: "الحمل الكبير جدًا يقلل التيار فتقل القدرة." }, { t: "صفر", type: "conceptual", why: "الحمل الصفري جهده صفر فقدرته صفر." } ]}
    ],
    practice: {
      prompt: "حمل R<sub>L</sub> يوصل بين a و b. القيم: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 10 Ω</span>، <span class='ltr'>R2 = 40 Ω</span>، <span class='ltr'>R3 = 8 Ω</span>.",
      figure: fig(t11, "شبكة بين الطرفين a و b يوصل بها حمل"),
      steps: [
        { id: "s1", label: "ما قيمة R<sub>L</sub> التي تستقبل أقصى قدرة؟", symbol: "RL =", answer: th11.rth, units: OHM, unitDefault: 0,
          diagnose: [{ value: 58, type: "conceptual", why: "جمعت كل المقاومات. R<sub>L</sub> = R<sub>Th</sub>، و R<sub>Th</sub> = R3 + R1 ∥ R2." }, { value: 8, type: "conceptual", why: "أخذت R3 فقط. R<sub>Th</sub> = R3 + R1 ∥ R2." }],
          hints: ["احسب R<sub>Th</sub>: أطفئ Vs."], solution: eqi("R<sub>L</sub> = R<sub>Th</sub> = 8 + 10 ∥ 40 = 16 Ω") },
        { id: "s2", label: "احسب <span class='ltr'>p<sub>max</sub></span>.", symbol: "pmax =", answer: th11.voc * th11.voc / (4 * th11.rth), units: W, unitDefault: 1,
          diagnose: [{ value: th11.voc * th11.voc / th11.rth, type: "formula", why: "نسيت القسمة على 4." }, { value: th11.voc * th11.voc / (2 * th11.rth), type: "formula", why: "المقام 4R<sub>Th</sub> وليس 2R<sub>Th</sub>." }, { value: 3600 / 64, type: "conceptual", why: "استخدمت جهد المصدر 60 V بدل V<sub>Th</sub>." }],
          hints: [eqi("V<sub>Th</sub> = 60 × 40/50 = 48 V") + "."], solution: eqi("p<sub>max</sub> = 48²/(4 × 16) = 36 W") },
        { id: "s3", label: "احسب تيار الحمل عند أقصى نقل.", symbol: "i =", answer: th11.voc / (2 * th11.rth), units: A, unitDefault: 1, diagnose: [{ value: th11.isc, type: "conceptual", why: "هذا تيار القصر. مع R<sub>L</sub> = R<sub>Th</sub> يصبح التيار نصفه." }], hints: [eqi("V<sub>Th</sub> / (R<sub>Th</sub> + R<sub>L</sub>)")], solution: eqi("i = 48/32 = 1.5 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: أقصى نقل للقدرة", kinds: ["Pmax"], families: ["ladder", "grid"] },
    lab: { title: "منحنى القدرة", desc: "في المعمل الذكي ستغيّر مقاومة الحمل وترسم القدرة، وترى القمة عند R<sub>L</sub> = R<sub>Th</sub>." }
  };

  /* ================= 12. Superposition ================= */
  function sup(Vs, r1, r2, r3, I, dir) { return twoNode(Vs, r1, r2, r3, E([0, 2], [1, 2], "I", I, { dir: dir, name: "Is" }), { r2: { ilabel: "i" } }); }
  var u12ex = sup(60, 12, 8, 6, 5, "ba"), u12 = sup(40, 5, 3, 10, 4, "ab"), p12 = AN.superpose(u12, { el: "R2", q: "i" });
  L["c1-techniques-12"] = {
    id: "c1-techniques-12", ar: "مبدأ التراكب", en: "Superposition", minutes: 25,
    objectives: ["تطبق التراكب على دائرة فيها أكثر من مصدر مستقل.", "تطفئ المصادر بالطريقة الصحيحة.", "تعرف أن التراكب لا ينطبق على القدرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>في الدائرة الخطية، الاستجابة (تيار أو جهد) لعدة مصادر مستقلة = مجموع الاستجابات لكل مصدر وحده. نشغّل مصدرًا واحدًا ونطفئ الباقي، ونكرر، ثم نجمع.</p><div class='callout'>إطفاء مصدر الجهد = استبداله بسلك. إطفاء مصدر التيار = استبداله بدائرة مفتوحة. المصادر التابعة لا تُطفأ.</div>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>i = i′ + i″ + …</div><p class='muted'>القدرة لا تُجمع بالتراكب، لأنها تتناسب مع مربع التيار: احسب التيار الكلي أولًا ثم القدرة.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>عندما يجعل كل مصدر وحده الدائرة بسيطة (توالي وتوازي).</li><li>حافظ على نفس اتجاه السهم في كل الحالات، واجمع بالإشارات.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(u12ex, "دائرة بمصدر جهد ومصدر تيار") +
        "<ol class='steps'><li><b>Vs وحده</b> (Is مفتوح): R3 بلا تيار، " + eqi("i′ = 60/(12 + 8) = 3 A") + "</li><li><b>Is وحده</b> (Vs سلك): 5 A تدخل العقدة العليا اليمنى عبر R3 وتتوزع على R1 و R2: " + eqi("i″ = 5 × 12/(12 + 8) = 3 A") + "</li><li>" + eqi("i = 3 + 3 = 6 A") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>في دوائر الإلكترونيات، نحلل جهود الانحياز (DC) والإشارة (AC) كل على حدة ثم نجمعها. هذا تطبيق مباشر لمبدأ التراكب، وستستخدمه كثيرًا في مقرر الإلكترونيات.</p>" }
    ],
    quiz: [
      { q: "عند حساب مساهمة مصدر الجهد، مصدر التيار الآخر يُستبدل بـ:", options: [
        { t: "دائرة مفتوحة", correct: true, why: "إطفاء مصدر التيار يعني جعل تياره صفرًا." }, { t: "سلك", type: "conceptual", why: "السلك لإطفاء مصدر الجهد." } ]},
      { q: "مساهمتان في تيار مقاومة 2 Ω: 1 A و 2 A. قدرة المقاومة:", options: [
        { t: "<span class='ltr'>18 W</span>", correct: true, why: "التيار الكلي 3 A، و 3² × 2 = 18 W." }, { t: "<span class='ltr'>10 W</span>", type: "conceptual", why: "جمعت القدرتين (2 + 8). القدرة لا تُجمع بالتراكب." } ]}
    ],
    practice: {
      prompt: "استخدم التراكب لحساب التيار <span class='ltr'>i</span> في <span class='ltr'>R2</span>. القيم: <span class='ltr'>Vs = 40 V</span>، <span class='ltr'>R1 = 5 Ω</span>، <span class='ltr'>R2 = 3 Ω</span>، <span class='ltr'>R3 = 10 Ω</span>، <span class='ltr'>Is = 4 A</span> للأسفل.",
      figure: fig(u12, "دائرة بمصدر جهد 40 فولت ومصدر تيار 4 أمبير"),
      steps: [
        { id: "s1", label: "احسب مساهمة Vs وحده <span class='ltr'>i′</span>.", symbol: "i′ =", answer: p12[0].value, units: A, unitDefault: 1,
          diagnose: [{ value: 40 * (30 / 13) / (5 + 30 / 13) / 3, type: "conceptual", why: "استبدلت مصدر التيار بسلك. إطفاء مصدر التيار يعني دائرة مفتوحة، فلا يمر تيار في R3.", review: R("c1-techniques-12", "concept", "إطفاء المصادر") }],
          hints: ["Is مفتوح، فـ R3 معلقة بلا تيار."], solution: eqi("i′ = 40/(5 + 3) = 5 A") },
        { id: "s2", label: "احسب مساهمة Is وحده <span class='ltr'>i″</span>.", symbol: "i″ =", answer: p12[1].value, units: A, unitDefault: 1,
          diagnose: [{ value: -4 * 3 / 8, type: "substitution", why: "وضعت R2 في البسط. في قسمة التيار ضع المقاومة الأخرى (R1) في البسط." }, { value: 2.5, type: "sign", why: "Is يسحب التيار للأسفل في فرعه، فيمر تيار R2 للأعلى، عكس السهم." }],
          hints: ["Vs سلك، فـ R1 و R2 على التوازي. Is يسحب 4 A من العقدة العليا اليمنى.", "تيار R2 للأعلى: " + eqi("4 × 5/(5 + 3)") + "."], solution: eqi("i″ = −4 × 5/8 = −2.5 A") },
        { id: "s3", label: "احسب التيار الكلي <span class='ltr'>i</span>.", symbol: "i =", answer: p12[0].value + p12[1].value, units: A, unitDefault: 1, diagnose: [{ value: 7.5, type: "sign", why: "جمعت المقدارين دون الإشارة. i″ سالب." }], hints: [eqi("i′ + i″")], solution: eqi("i = 5 + (−2.5) = 2.5 A") }
      ]
    },
    generator: { title: "تمارين مولّدة: التراكب", kinds: ["sup"], families: ["ladder", "grid"] },
    lab: { title: "التراكب بالقياس", desc: "في المعمل الذكي ستقيس تيارًا مع كل مصدر وحده ثم معًا، وتتحقق أن المجموع يساوي القياس الكلي." }
  };
})();
