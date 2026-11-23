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
  /* Lecture circuits (Dr. Abdullah Noman, Ch. 4) and tutorial problems. Worked-example numbers are checked when the file loads. */
  var chk = function (got, want, what) { if (Math.abs(got - want) > 1e-6 * Math.max(1, Math.abs(want))) throw new Error("lesson number mismatch: " + what + " = " + got + ", expected " + want); };
  var BOT = function (n) { var o = []; for (var k = 0; k < n; k++) o.push(E([1, k], [1, k + 1], "W")); return o; };
  var x45 = nodes({ rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 10, { plus: "a", name: "V10" }), E([0, 0], [0, 1], "R", 1, { name: "R1" }), E([0, 1], [1, 1], "R", 5, { name: "R5" }), E([0, 1], [0, 2], "R", 2, { name: "R2" }), E([0, 2], [1, 2], "R", 10, { name: "R10" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "I", 2, { dir: "ba", name: "I2" })].concat(BOT(3)) }, [[0, 1], [0, 2]]);
  var s45 = solve(x45); chk(s45.byName.R5.v, 100 / 11, "4.5 v1"); chk(s45.byName.R10.v, 120 / 11, "4.5 v2");
  var x42 = nodes({ rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 50, { plus: "a", name: "V50" }), E([0, 0], [0, 1], "R", 5, { name: "R5", ilabel: "iₐ" }), E([0, 1], [1, 1], "R", 10, { name: "R10", ilabel: "ib" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 40, { name: "R40", ilabel: "ic" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "I", 3, { dir: "ba", name: "I3" })].concat(BOT(3)) }, [[0, 1]]);
  var s42 = solve(x42); chk(s42.byName.R10.v, 40, "4.2 v1"); chk(s42.byName.R5.i, 2, "4.2 ia"); chk(s42.byName.V50.p, -100, "4.2 p50"); chk(s42.byName.I3.p, -120, "4.2 p3");
  var xp46 = { rows: 3, cols: 3, edges: [E([0, 0], [1, 0], "R", 20, { name: "R20" }), E([1, 0], [2, 0], "V", 24, { plus: "a", name: "V24" }), E([0, 0], [0, 1], "R", 80, { name: "R80" }), E([0, 1], [2, 1], "R", 25, { name: "R25", vlabel: "vₒ" }), E([0, 1], [0, 2], "W"), E([0, 2], [2, 2], "I", 0.04, { dir: "ab", name: "I40", vtext: "40 mA" }), E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W")] };
  var sp46 = solve(xp46); chk(sp46.byName.R25.v, 4, "P4.6 vo");

  L["c1-techniques-1"] = {
    id: "c1-techniques-1", ar: "مدخل إلى طريقة جهود العقد", en: "Introduction to the Node-Voltage Method", minutes: 30,
    objectives: ["تختار عقدة مرجعية وتسمّي جهود العقد.", "تكتب معادلة KCL عند كل عقدة بدلالة جهود العقد.", "تحل المعادلات وتحسب أي تيار من جهود العقد."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>طريقة جهود العقد تجد كل جهود العقد المجهولة بثلاث خطوات: (1) اختر <b>عقدة مرجعية</b> وأرّضها. (2) عند كل عقدة: مجموع التيارات <b>الخارجة</b> = صفر. (3) حل المعادلات.</p>" +
        "<p>نعمل على <b>العقد الأساسية</b> <span class='ltr'>(essential nodes)</span>: العقدة التي يلتقي عندها ثلاثة عناصر أو أكثر. إذا كان في الدائرة n عقدة أساسية نحتاج <span class='ltr'>n − 1</span> معادلة.</p>" +
        "<p>نختار المرجع غالبًا العقدة السفلية لأنها تتصل بأكثر الفروع، ونرمز لها ▼. <b>جهد العقدة</b> هو ارتفاع الجهد من المرجع إلى العقدة. والتيار الخارج من العقدة 1 عبر مقاومة 1 Ω إلى مصدر 10 V هو هبوط الجهد على المقاومة مقسومًا على قيمتها: <span class='eq-i'>(v₁ − 10)/1</span>.</p>" +
        fig(x45, "دائرة الشكل 4.5: مصدر 10 V ومقاومات 1 و 5 و 2 و 10 Ω ومصدر 2 A") +
        "<p>في الشكل 4.5: ثلاث عقد أساسية، إذن معادلتان لـ v₁ و v₂.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>Σ i<sub>out</sub> = 0   عند كل عقدة غير مرجعية</div><div class='eq'>i = (v<sub>عقدة</sub> − v<sub>الطرف الآخر</sub>) / R</div><div class='eq'>عدد المعادلات = n − 1</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>الطريقة مناسبة عندما تكون العقد أقل من الحلقات، أو فيها مصادر تيار.</li><li>اكتب كل التيارات <b>خارجة</b> من العقدة، ومصدر التيار الداخل للعقدة يُكتب بإشارة سالبة.</li><li>بعد إيجاد الجهود: احسب أي تيار بقانون أوم، وأي قدرة بـ p = vi.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>الشكل 4.5: أوجد v₁ و v₂.</p>" +
        "<ol class='steps'><li>عند العقدة 1: <span class='eq-i'>(v₁ − 10)/1 + v₁/5 + (v₁ − v₂)/2 = 0</span></li><li>عند العقدة 2: <span class='eq-i'>(v₂ − v₁)/2 + v₂/10 − 2 = 0</span></li><li>الحل: <span class='eq-i'>v₁ = 100/11 = 9.09 V ، v₂ = 120/11 = 10.91 V</span></li></ol>" +
        "<p class='q'>مثال 4.2: (a) أوجد i<sub>a</sub> و i<sub>b</sub> و i<sub>c</sub>. (b) أوجد قدرة كل مصدر.</p>" +
        fig(x42, "مصدر 50 V ومقاومات 5 و 10 و 40 Ω ومصدر 3 A") +
        "<ol class='steps'><li>عقدة واحدة أساسية غير مرجعية: <span class='eq-i'>(v₁ − 50)/5 + v₁/10 + v₁/40 − 3 = 0 ← v₁ = 40 V</span></li><li><span class='eq-i'>i<sub>a</sub> = (50 − 40)/5 = 2 A ، i<sub>b</sub> = 40/10 = 4 A ، i<sub>c</sub> = 40/40 = 1 A</span></li><li><span class='eq-i'>p<sub>50V</sub> = −50 i<sub>a</sub> = −100 W</span> (يعطي)، <span class='eq-i'>p<sub>3A</sub> = −3v₁ = −120 W</span> (يعطي).</li></ol>" +
        "<p class='q'>مسألة 4.6 (التيوتوريال): استخدم طريقة جهود العقد لإيجاد v<sub>o</sub>.</p>" +
        fig(xp46, "مصدر 24 V مع 20 Ω و 80 Ω و 25 Ω ومصدر 40 mA") +
        "<ol class='steps'><li>20 Ω و 80 Ω على التوالي مع المصدر: <span class='eq-i'>(v₁ − 24)/(20 + 80) + v₁/25 + 0.04 = 0</span></li><li><span class='eq-i'>v₁(1/100 + 1/25) = 24/100 − 0.04 ← v₁(0.05) = 0.2</span></li><li><span class='eq-i'>v<sub>o</sub> = v₁ = 4 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>برامج محاكاة الدوائر مثل SPICE تستخدم طريقة جهود العقد نفسها: تكتب معادلة KCL لكل عقدة وتحلها كمصفوفة.</p>" }
    ],
    quiz: [
      { q: "دائرة فيها 5 عقد. كم معادلة نحتاج في طريقة جهود العقد (بدون مصادر جهد)؟", options: [
        { t: "<span class='ltr'>4</span>", correct: true, why: "عدد العقد − 1، لأن جهد المرجع صفر." }, { t: "<span class='ltr'>5</span>", type: "conceptual", why: "العقدة المرجعية جهدها معروف (صفر)، فلا نكتب لها معادلة." }, { t: "<span class='ltr'>عدد الفروع</span>", type: "conceptual", why: "عدد الفروع يحدد معادلات طريقة الفروع، وليس جهود العقد." } ]},
      { q: "تيار المقاومة R الخارج من العقدة v₁ نحو العقدة v₂:", options: [
        { t: "<span class='ltr'>(v₁ − v₂)/R</span>", correct: true, why: "التيار يتجه من الجهد الأعلى للأقل، والقاعدة: جهد هذه العقدة − الأخرى." }, { t: "<span class='ltr'>(v₂ − v₁)/R</span>", type: "sign", why: "هذا التيار الداخل إلى v₁." }, { t: "<span class='ltr'>v₁/R</span>", type: "conceptual", why: "هذا فقط إذا كانت v₂ هي المرجع (صفر)." } ]}
    ],
    practice: {
      prompt: "أوجد جهدي العقدتين في الدائرة: <span class='ltr'>Vs = 30 V</span>، <span class='ltr'>R1 = 10 Ω</span>، <span class='ltr'>R2 = 8 Ω</span>، <span class='ltr'>R3 = 3 Ω</span>، <span class='ltr'>Is = 6 A</span>.",
      circuit: n1, figure: fig(n1, "دائرة بعقدتين v1 و v2 ومصدر جهد 30 فولت ومصدر تيار 6 أمبير"),
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
  var x43 = nodes({ rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 20, { plus: "a", name: "V20" }), E([0, 0], [0, 1], "R", 2, { name: "R2a", vtext: "2 Ω" }), E([0, 1], [1, 1], "R", 20, { name: "R20" }), E([0, 1], [0, 2], "R", 5, { name: "R5", ilabel: "iφ" }), E([0, 2], [1, 2], "R", 10, { name: "R10" }), E([0, 2], [0, 3], "R", 2, { name: "R2b", vtext: "2 Ω" }), E([0, 3], [1, 3], "CCVS", 8, { plus: "a", ctrl: "R5", vtext: "8 iφ", name: "D" })].concat(BOT(3)) }, [[0, 1], [0, 2]]);
  var s43 = solve(x43); chk(s43.byName.R20.v, 16, "4.3 v1"); chk(s43.byName.R10.v, 10, "4.3 v2"); chk(s43.byName.R5.i, 1.2, "4.3 iphi"); chk(s43.byName.R5.p, 7.2, "4.3 p5");

  L["c1-techniques-2"] = {
    id: "c1-techniques-2", ar: "طريقة جهود العقد والمصادر التابعة", en: "The Node-Voltage Method and Dependent Sources", minutes: 30,
    objectives: ["تعبّر عن الكمية المتحكِّمة بدلالة جهود العقد.", "تكتب معادلات العقد مع المصدر التابع.", "تحل النظام وتتحقق من النتيجة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>إذا كان في الدائرة مصدر تابع، نكتب معادلات العقد كالمعتاد، ثم نضيف إليها <b>معادلة القيد</b> التي يفرضها المصدر التابع: نكتب الكمية المتحكِّمة بدلالة جهود العقد.</p>" +
        fig(x43, "مثال 4.3: مصدر 20 V ومقاومات ومصدر جهد تابع 8 iφ") },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>معادلات KCL للعقد</div><div class='eq'>+ معادلة القيد: الكمية المتحكِّمة بدلالة جهود العقد</div><div class='eq'>مثال: i<sub>φ</sub> = (v₁ − v₂)/5</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>لا تضف مجهولًا جديدًا دون معادلة: كل كمية متحكِّمة تُكتب بدلالة جهود العقد.</li><li>تيار فرع فيه مصدر جهد تابع ومقاومة يُكتب مثل أي فرع: (v<sub>عقدة</sub> − 8i<sub>φ</sub>)/R.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 4.3: استخدم طريقة جهود العقد لإيجاد القدرة المستهلكة في المقاومة 5 Ω.</p>" +
        "<ol class='steps'><li>العقدة 1: <span class='eq-i'>(v₁ − 20)/2 + v₁/20 + (v₁ − v₂)/5 = 0 ← 15v₁ − 4v₂ = 200   (1)</span></li><li>العقدة 2: <span class='eq-i'>(v₂ − v₁)/5 + v₂/10 + (v₂ − 8i<sub>φ</sub>)/2 = 0 ← 8v₂ − 2v₁ − 40i<sub>φ</sub> = 0   (2)</span></li><li>القيد: <span class='eq-i'>i<sub>φ</sub> = (v₁ − v₂)/5</span>، وبالتعويض في (2): <span class='eq-i'>16v₂ − 10v₁ = 0</span></li><li>الحل: <span class='eq-i'>v₁ = 16 V ، v₂ = 10 V</span></li><li><span class='eq-i'>i<sub>φ</sub> = (16 − 10)/5 = 1.2 A ، p<sub>5Ω</sub> = 5 × 1.2² = 7.2 W</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>دوائر الترانزستور والمكبرات تُحلل بهذه الطريقة: الترانزستور يُستبدل بنموذج فيه مصدر تابع، ثم نكتب معادلات العقد مع معادلة القيد.</p>" }
    ],
    quiz: [
      { q: "في وجود مصدر تابع، عدد المعادلات اللازمة:", options: [
        { t: "معادلات العقد + معادلة قيد لكل مصدر تابع", correct: true, why: "معادلة القيد تعوّض المجهول الإضافي (الكمية المتحكِّمة)." }, { t: "معادلات العقد فقط ونعامل المصدر التابع كثابت", type: "conceptual", why: "قيمته مجهولة لأنها تعتمد على iₓ أو vₓ." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 12 Ω</span> (تيارها iₓ)، <span class='ltr'>R2 = 24 Ω</span>، <span class='ltr'>R3 = 8 Ω</span>، ومصدر تيار تابع <span class='ltr'>0.5 iₓ</span> للأسفل.",
      circuit: n2, figure: fig(n2, "دائرة عقد مع مصدر تيار تابع قيمته نصف iₓ"),
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
  var xsn = nodes({ rows: 2, cols: 5, edges: [E([0, 0], [1, 0], "V", 50, { plus: "a", name: "V50" }), E([0, 0], [0, 1], "W"), E([0, 1], [1, 1], "R", 40, { name: "R40" }), E([0, 2], [0, 1], "R", 5, { name: "R5" }), E([0, 2], [1, 2], "R", 50, { name: "R50" }), E([0, 2], [0, 3], "CCVS", 10, { plus: "b", ctrl: "R5", vtext: "10 iφ", name: "D" }), E([0, 3], [1, 3], "R", 100, { name: "R100" }), E([0, 3], [0, 4], "W"), E([0, 4], [1, 4], "I", 4, { dir: "ba", name: "I4" })].concat(BOT(4)) }, [[0, 1], [0, 2], [0, 3]]);
  var ssn = solve(xsn); chk(ssn.byName.R50.v, 60, "supernode v2"); chk(ssn.byName.R100.v, 80, "supernode v3"); chk(ssn.byName.R5.i, 2, "supernode iphi");

  L["c1-techniques-3"] = {
    id: "c1-techniques-3", ar: "جهود العقد: حالات خاصة", en: "The Node-Voltage Method: Some Special Cases", minutes: 30,
    objectives: ["تتعامل مع مصدر جهد بين عقدة والمرجع.", "تستخدم العقدة العظمى (Supernode) لمصدر جهد بين عقدتين.", "تكتب معادلة القيد للعقدة العظمى."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>الحالة الأولى:</b> إذا كان مصدر جهد هو العنصر الوحيد بين عقدة أساسية والمرجع، فجهد هذه العقدة معروف مباشرة، فيقل عدد المجاهيل.</p>" +
        "<p><b>الحالة الثانية — العقدة الفائقة</b> <span class='ltr'>(supernode)</span>: إذا كان مصدر جهد بين عقدتين أساسيتين (غير المرجع)، فتيار المصدر مجهول. نضم العقدتين في عقدة فائقة ونكتب لها <b>معادلتين</b>: KCL لكل التيارات الخارجة من العقدة الفائقة، ومعادلة المصدر نفسه (فرق جهد العقدتين = قيمة المصدر).</p>" +
        fig(xsn, "دائرة العقدة الفائقة: مصدر 50 V ومصدر جهد تابع 10 iφ بين العقدتين 2 و 3") },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>مصدر بين عقدة والمرجع: v<sub>عقدة</sub> = v<sub>s</sub></div><div class='eq'>عقدة فائقة: Σ i<sub>out</sub> = 0 للعقدتين معًا</div><div class='eq'>+ v<sub>b</sub> − v<sub>a</sub> = قيمة المصدر بين العقدتين</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>لا تكتب تيار مصدر الجهد المثالي بقانون أوم: ليست له مقاومة وتياره مجهول.</li><li>مع العقدة الفائقة: التيارات بين العقدتين داخلها لا تظهر في معادلة KCL.</li><li>إذا كان المصدر تابعًا، أضف أيضًا معادلة القيد.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال المحاضرة: أوجد v₁ و v₂ و v₃ و i<sub>φ</sub>.</p>" +
        "<ol class='steps'><li>i<sub>φ</sub> هو تيار المقاومة 5 Ω من العقدة 2 إلى العقدة 1.</li><li>المصدر 50 V وحده بين العقدة 1 والمرجع: <span class='eq-i'>v₁ = 50 V</span></li><li>العقدتان 2 و 3 بينهما المصدر التابع، فنكوّن عقدة فائقة. KCL: <span class='eq-i'>(v₂ − v₁)/5 + v₂/50 + v₃/100 − 4 = 0</span></li><li>بالضرب في 100 ومع v₁ = 50: <span class='eq-i'>22v₂ + v₃ = 1400   (1)</span></li><li>معادلة المصدر: <span class='eq-i'>v₃ = v₂ + 10i<sub>φ</sub></span> مع <span class='eq-i'>i<sub>φ</sub> = (v₂ − v₁)/5</span> ← <span class='eq-i'>v₂ + 2(v₂ − 50) − v₃ = 0   (2)</span></li><li>الحل: <span class='eq-i'>v₂ = 60 V ، v₃ = 80 V ، i<sub>φ</sub> = 2 A</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>في دوائر الإلكترونيات يوجد غالبًا مصدر تغذية بين خطين ليس أحدهما الأرضي، والعقدة الفائقة هي الطريقة المباشرة لحلها.</p>" }
    ],
    quiz: [
      { q: "مصدر جهد مثالي بين عقدتين غير مرجعيتين. لماذا لا نكتب KCL لكل عقدة على حدة؟", options: [
        { t: "لأن تيار مصدر الجهد مجهول ولا يُعبَّر عنه بجهود العقد", correct: true, why: "لذلك ندمج العقدتين في عقدة عظمى ونضيف معادلة القيد." }, { t: "لأن KCL لا ينطبق على مصادر الجهد", type: "conceptual", why: "KCL ينطبق دائمًا. المشكلة في المجهول الإضافي." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 3 Ω</span>، <span class='ltr'>R2 = 6 Ω</span>، <span class='ltr'>R3 = 10 Ω</span>، ومصدر <span class='ltr'>V2 = 20 V</span> بين v₂ و v₃.",
      circuit: n3, figure: fig(n3, "دائرة فيها مصدر جهد 20 فولت بين عقدتين"),
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
  var x44 = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 40, { plus: "a", name: "V40" }), E([0, 0], [0, 1], "R", 2, { name: "R2" }), E([0, 1], [1, 1], "R", 8, { name: "R8", vlabel: "vₒ" }), E([0, 1], [0, 2], "R", 6, { name: "R6a", vtext: "6 Ω" }), E([0, 2], [1, 2], "R", 6, { name: "R6b", vtext: "6 Ω" }), E([0, 2], [0, 3], "R", 4, { name: "R4" }), E([0, 3], [1, 3], "V", 20, { plus: "a", name: "V20" })].concat(BOT(3)) };
  var s44 = solve(x44); meshes(x44); chk(s44.byName.R2.i, 5.6, "4.4 ia"); chk(s44.byName.R6a.i, 2, "4.4 ib"); chk(s44.byName.R4.i, -0.8, "4.4 ic"); chk(s44.byName.R8.v, 28.8, "4.4 vo"); chk(s44.byName.V40.p, -224, "4.4 p40"); chk(s44.byName.V20.p, -16, "4.4 p20");

  L["c1-techniques-4"] = {
    id: "c1-techniques-4", ar: "مدخل إلى طريقة تيارات الحلقات", en: "Introduction to the Mesh-Current Method", minutes: 30,
    objectives: ["تعرّف تيار الحلقة لكل شبكة (mesh).", "تكتب KVL لكل حلقة بدلالة تيارات الحلقات.", "تحسب تيار الفرع المشترك من تياري الحلقتين."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>طريقة تيارات الحلقات تجد تيار كل حلقة (mesh) بثلاث خطوات: (1) اختر مجموعة حلقات بحيث تمر حلقة واحدة على الأقل بكل فرع. (2) طبّق KVL حول كل حلقة. (3) حل المعادلات لإيجاد تيارات الحلقات.</p>" +
        "<p>تيار الحلقة يدور في اتجاه عقارب الساعة. والمقاومة المشتركة بين حلقتين يمر فيها الفرق بين تياريهما. مثال المحاضرة بمصدرين v₁ و v₂ ومقاومات R₁ و R₂ و R₃:</p>" +
        "<div class='eq'>v₁ = i<sub>a</sub>R₁ + (i<sub>a</sub> − i<sub>b</sub>)R₃</div><div class='eq'>−v₂ = (i<sub>b</sub> − i<sub>a</sub>)R₃ + i<sub>b</sub>R₂</div>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>KVL حول كل حلقة: Σ v = 0</div><div class='eq'>المقاومة المشتركة: R(i<sub>الحلقة</sub> − i<sub>المجاورة</sub>)</div><div class='eq'>عدد المعادلات = عدد الحلقات</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>الطريقة مناسبة عندما تكون الحلقات أقل من العقد، أو فيها مصادر جهد.</li><li>تيار أي فرع = تيار حلقته، أو فرق تياري الحلقتين إذا كان مشتركًا.</li><li>الحلقة <b>mesh</b> حلقة لا تحيط بأي حلقة أخرى، والطريقة للدوائر المستوية.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 4.4: (a) أوجد قدرة كل مصدر جهد. (b) أوجد الجهد v<sub>o</sub> على المقاومة 8 Ω.</p>" +
        fig(x44, "مثال 4.4: مصدر 40 V ومقاومات 2 و 8 و 6 و 6 و 4 Ω ومصدر 20 V") +
        "<ol class='steps'><li><span class='eq-i'>−40 + 2i<sub>a</sub> + 8(i<sub>a</sub> − i<sub>b</sub>) = 0</span></li><li><span class='eq-i'>8(i<sub>b</sub> − i<sub>a</sub>) + 6i<sub>b</sub> + 6(i<sub>b</sub> − i<sub>c</sub>) = 0</span></li><li><span class='eq-i'>6(i<sub>c</sub> − i<sub>b</sub>) + 4i<sub>c</sub> + 20 = 0</span></li><li>الحل: <span class='eq-i'>i<sub>a</sub> = 5.6 A ، i<sub>b</sub> = 2 A ، i<sub>c</sub> = −0.8 A</span></li><li><span class='eq-i'>p<sub>40V</sub> = −40i<sub>a</sub> = −224 W</span>، و <span class='eq-i'>p<sub>20V</sub> = 20i<sub>c</sub> = −16 W</span>: المصدران يعطيان قدرة.</li><li><span class='eq-i'>v<sub>o</sub> = 8(i<sub>a</sub> − i<sub>b</sub>) = 8(3.6) = 28.8 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>في تمديدات الإنارة والدوائر ذات المصادر الكثيرة على التوالي (مثل بطاريات السيارة الكهربائية) تكون الحلقات قليلة، فتكون طريقة الحلقات أسرع.</p>" }
    ],
    quiz: [
      { q: "تيار الفرع المشترك بين حلقتين تياراهما i₁ و i₂ (كلاهما مع عقارب الساعة):", options: [
        { t: "<span class='ltr'>i₁ − i₂</span> (في اتجاه i₁)", correct: true, why: "التياران يمران في الفرع المشترك في اتجاهين متعاكسين." }, { t: "<span class='ltr'>i₁ + i₂</span>", type: "sign", why: "التياران متعاكسان في الفرع المشترك، فنطرح." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 50 V</span>، <span class='ltr'>R1 = 2 Ω</span>، <span class='ltr'>R2 = 4 Ω</span>، <span class='ltr'>R3 = 12 Ω</span>، <span class='ltr'>V2 = 20 V</span>.",
      circuit: m4, figure: fig(m4, "دائرة بحلقتين ومصدري جهد"),
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
  var x45m = { rows: 3, cols: 3, edges: [E([0, 0], [1, 0], "W"), E([1, 0], [2, 0], "V", 50, { plus: "a", name: "V50" }), E([0, 0], [0, 2], "R", 1, { name: "R1" }), E([1, 0], [1, 1], "R", 5, { name: "R5" }), E([1, 1], [2, 1], "R", 20, { name: "R20", ilabel: "iφ" }), E([1, 1], [1, 2], "R", 4, { name: "R4" }), E([0, 2], [1, 2], "W"), E([1, 2], [2, 2], "CCVS", 15, { plus: "a", ctrl: "R20", vtext: "15 iφ", name: "D" }), E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W")] };
  var s45m = solve(x45m); chk(s45m.byName.R4.i, 2, "4.5 i4"); chk(s45m.byName.R4.p, 16, "4.5 p4"); chk(s45m.byName.R20.i, 1.6, "4.5 iphi");

  L["c1-techniques-5"] = {
    id: "c1-techniques-5", ar: "طريقة تيارات الحلقات والمصادر التابعة", en: "The Mesh-Current Method and Dependent Sources", minutes: 30,
    objectives: ["تعبّر عن الكمية المتحكِّمة بدلالة تيارات الحلقات.", "تكتب KVL مع مصدر جهد تابع.", "تحسب قدرة المصدر التابع."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>مع المصدر التابع نكتب معادلات KVL للحلقات كالمعتاد، ثم نعبّر عن الكمية المتحكِّمة <b>بدلالة تيارات الحلقات</b> (معادلة القيد) ونعوّضها.</p>" +
        fig(x45m, "مثال 4.5: مصدر 50 V ومقاومات 1 و 5 و 4 و 20 Ω ومصدر جهد تابع 15 iφ") },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>KVL لكل حلقة</div><div class='eq'>+ القيد: i<sub>φ</sub> = i₁ − i₃ (تيار فرع مشترك بدلالة تيارات الحلقات)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>إذا كان التيار المتحكِّم في فرع مشترك فهو فرق تياري حلقتين، مع الانتباه لاتجاهه.</li><li>بعد التعويض رتّب المعادلات في الشكل القياسي قبل الحل.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 4.5: استخدم طريقة تيارات الحلقات لإيجاد القدرة المستهلكة في المقاومة 4 Ω.</p>" +
        "<ol class='steps'><li>نحتاج ثلاث حلقات: i₁ (اليسرى)، i₂ (العلوية مع 1 Ω)، i₃ (اليمنى).</li><li><span class='eq-i'>50 = 5(i₁ − i₂) + 20(i₁ − i₃)</span></li><li><span class='eq-i'>0 = 5(i₂ − i₁) + 1i₂ + 4(i₂ − i₃)</span></li><li><span class='eq-i'>0 = 20(i₃ − i₁) + 4(i₃ − i₂) + 15i<sub>φ</sub></span></li><li>القيد: <span class='eq-i'>i<sub>φ</sub> = i₁ − i₃</span>، وبعد الترتيب: <span class='eq-i'>50 = 25i₁ − 5i₂ − 20i₃ ، 0 = −5i₁ + 10i₂ − 4i₃ ، 0 = −5i₁ − 4i₂ + 9i₃</span></li><li>الحل: <span class='eq-i'>i₂ = 26 A ، i₃ = 28 A</span>، وتيار 4 Ω من اليسار لليمين <span class='eq-i'>i₃ − i₂ = 2 A</span></li><li><span class='eq-i'>p<sub>4Ω</sub> = (2)²(4) = 16 W</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>نموذج مكبر العمليات فيه مصدر جهد تابع بكسب كبير، وتحليل دوائره بالحلقات أو العقد يحتاج معادلة القيد نفسها.</p>" }
    ],
    quiz: [
      { q: "مصدر جهد تابع قيمته <span class='ltr'>8iₓ</span> في حلقة. عند كتابة KVL:", options: [
        { t: "نكتب 8iₓ بالإشارة حسب قطبيته، ثم نعوّض iₓ بدلالة تيارات الحلقات", correct: true, why: "هكذا تبقى المجاهيل تيارات الحلقات فقط." }, { t: "نحذفه لأنه ليس مصدرًا مستقلًا", type: "conceptual", why: "المصدر التابع يؤثر في الدائرة ولا يُحذف." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 20 V</span>، <span class='ltr'>R1 = 6 Ω</span>، <span class='ltr'>R2 = 2 Ω</span> (تيارها iₓ)، <span class='ltr'>R3 = 5 Ω</span>، ومصدر جهد تابع <span class='ltr'>8iₓ</span> طرفه الموجب في الأسفل.",
      circuit: m5, figure: fig(m5, "دائرة حلقتين مع مصدر جهد تابع قيمته 8 iₓ"),
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
  var xsm = { rows: 3, cols: 3, edges: [E([0, 0], [0, 1], "R", 10, { name: "R10" }), E([0, 1], [0, 2], "W"), E([0, 0], [1, 0], "W"), E([1, 0], [2, 0], "V", 100, { plus: "a", name: "V100" }), E([1, 0], [1, 1], "R", 3, { name: "R3" }), E([1, 1], [1, 2], "R", 2, { name: "R2" }), E([0, 2], [1, 2], "W"), E([1, 1], [2, 1], "I", 5, { dir: "ba", name: "I5" }), E([1, 2], [2, 2], "V", 50, { plus: "a", name: "V50" }), E([2, 0], [2, 1], "R", 6, { name: "R6" }), E([2, 1], [2, 2], "R", 4, { name: "R4" })] };
  var ssm = solve(xsm); chk(ssm.byName.R3.i, 0.5, "supermesh ia-ib"); chk(ssm.byName.R10.i, 1.25, "supermesh ib"); chk(ssm.byName.R6.i, -1.75, "supermesh ia"); chk(ssm.byName.R4.i, -6.75, "supermesh ic");

  L["c1-techniques-6"] = {
    id: "c1-techniques-6", ar: "تيارات الحلقات: حالات خاصة", en: "The Mesh-Current Method: Some Special Cases", minutes: 30,
    objectives: ["تتعامل مع مصدر تيار في فرع خارجي.", "تستخدم الحلقة العظمى (Supermesh) لمصدر تيار في فرع مشترك.", "تكتب معادلة القيد للحلقة العظمى."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>الحالة الأولى: فرع فيه مصدر تيار.</b> جهد مصدر التيار مجهول، فنعرّف له متغيرًا v ونكتبه في معادلتي الحلقتين المشتركتين فيه، ثم نجمع المعادلتين لنحذف v، ونضيف معادلة المصدر: الفرق بين تياري الحلقتين = تيار المصدر.</p>" +
        "<p><b>الحالة الثانية — الحلقة الفائقة</b> <span class='ltr'>(supermesh)</span>: نتجنب تعريف v من البداية، فنكتب KVL حول المسار الذي يحيط بالحلقتين معًا متجاهلين الفرع المشترك الذي فيه المصدر. والنتيجة نفسها.</p>" +
        fig(xsm, "دائرة الحلقة الفائقة: 100 V و 50 V ومصدر تيار 5 A") },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>KVL حول الحلقة الفائقة (بدون الفرع المشترك)</div><div class='eq'>+ i<sub>c</sub> − i<sub>a</sub> = تيار المصدر</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>إذا كان مصدر التيار على الحافة الخارجية لحلقة واحدة، فتيار هذه الحلقة معروف مباشرة.</li><li>إذا كان مشتركًا بين حلقتين: حلقة فائقة.</li><li>لا تكتب KVL حول حلقة تمر بمصدر تيار دون أن تعرّف جهده.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال المحاضرة: أوجد تيارات الحلقات i<sub>a</sub> و i<sub>b</sub> و i<sub>c</sub>.</p>" +
        "<ol class='steps'><li>الحلقة a مع جهد المصدر v: <span class='eq-i'>100 = 3(i<sub>a</sub> − i<sub>b</sub>) + v + 6i<sub>a</sub>   (1)</span></li><li>الحلقة c: <span class='eq-i'>−50 = 4i<sub>c</sub> − v + 2(i<sub>c</sub> − i<sub>b</sub>)   (2)</span></li><li>بجمع (1) و (2) يختفي v (وهي نفسها معادلة الحلقة الفائقة): <span class='eq-i'>50 = 9i<sub>a</sub> − 5i<sub>b</sub> + 6i<sub>c</sub></span></li><li>الحلقة b: <span class='eq-i'>0 = 3(i<sub>b</sub> − i<sub>a</sub>) + 10i<sub>b</sub> + 2(i<sub>b</sub> − i<sub>c</sub>)</span></li><li>معادلة المصدر: <span class='eq-i'>i<sub>c</sub> − i<sub>a</sub> = 5</span></li><li>الحل: <span class='eq-i'>i<sub>a</sub> = 1.75 A ، i<sub>b</sub> = 1.25 A ، i<sub>c</sub> = 6.75 A</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مصادر التيار في الدوائر الحقيقية تمثل أجهزة مثل شواحن البطاريات بتيار ثابت والخلايا الشمسية، ووجودها بين حلقتين حالة شائعة.</p>" }
    ],
    quiz: [
      { q: "مصدر تيار في الفرع الخارجي لحلقة واحدة قيمته 2 A مع اتجاه الحلقة:", options: [
        { t: "تيار هذه الحلقة = 2 A مباشرة", correct: true, why: "لا يمر في هذا الفرع غير تيار هذه الحلقة." }, { t: "نحتاج حلقة عظمى", type: "conceptual", why: "الحلقة العظمى للمصدر في فرع مشترك فقط." } ]}
    ],
    practice: {
      prompt: "الدائرة: <span class='ltr'>Vs = 30 V</span>، <span class='ltr'>R1 = 4 Ω</span>، مصدر تيار <span class='ltr'>3 A</span> في الفرع الأوسط، <span class='ltr'>R2 = 12 Ω</span>، <span class='ltr'>R3 = 2 Ω</span>.",
      circuit: m6, figure: fig(m6, "دائرة حلقتين مع مصدر تيار 3 أمبير في الفرع المشترك"),
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
  var x413 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 20, { plus: "a", name: "V20" }), E([0, 0], [0, 1], "R", 15, { name: "R15" }), E([0, 1], [1, 1], "I", 2, { dir: "ba", name: "I2" }), E([0, 1], [0, 2], "R", 10, { name: "R10" }), E([0, 2], [1, 2], "V", 25, { plus: "a", name: "V25" })].concat(BOT(2)) };
  var s413 = solve(x413); chk(s413.byName.I2.v, 35, "4.13 v1"); chk(s413.byName.I2.p, -70, "4.13 p2A");

  L["c1-techniques-7"] = {
    id: "c1-techniques-7", ar: "جهود العقد أم تيارات الحلقات؟", en: "The Node-Voltage Method Versus the Mesh-Current Method", minutes: 20,
    objectives: ["تعدّ المعادلات اللازمة لكل طريقة.", "تختار الطريقة الأقل معادلات والأنسب لنوع المصادر.", "تحل بالطريقة المختارة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>أكبر ميزة للطريقتين أنهما تقللان عدد المعادلات التي نحلها معًا. وقبل البدء نسأل:</p>" +
        "<ul><li>أي الطريقتين تعطي <b>معادلات أقل</b>؟ قارن (عدد العقد الأساسية − 1) بعدد الحلقات.</li><li>هل في الدائرة <b>عقد فائقة</b>؟ إذن طريقة العقد تقلل المعادلات.</li><li>هل فيها <b>حلقات فائقة</b>؟ إذن طريقة الحلقات تقلل المعادلات.</li></ul>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>معادلات العقد = n<sub>e</sub> − 1 − (عدد مصادر الجهد)</div><div class='eq'>معادلات الحلقات = عدد الحلقات − (عدد مصادر التيار)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>مصادر التيار تسهّل طريقة العقد، ومصادر الجهد تسهّل طريقة الحلقات.</li><li>إذا كان المطلوب جهدًا فطريقة العقد غالبًا أقرب، وإذا كان تيارًا فطريقة الحلقات.</li><li>يمكنك حل المسألة بالطريقتين للتحقق من النتيجة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مسألة 4.13: أوجد القدرة التي يعطيها مصدر التيار 2 A.</p>" +
        fig(x413, "مصدر 20 V و 15 Ω ومصدر 2 A و 10 Ω ومصدر 25 V") +
        "<ol class='steps'><li><b>بطريقة العقد</b> (معادلة واحدة): <span class='eq-i'>(v₁ − 20)/15 − 2 + (v₁ − 25)/10 = 0 ← v₁ = 35 V</span></li><li><span class='eq-i'>p<sub>2A</sub> = −35 × 2 = −70 W</span>، أي المصدر يعطي 70 W.</li><li><b>بطريقة الحلقات</b>: مصدر التيار مشترك بين الحلقتين، فحلقة فائقة: <span class='eq-i'>−20 + 15i<sub>a</sub> + 10i<sub>b</sub> + 25 = 0</span> مع <span class='eq-i'>i<sub>b</sub> − i<sub>a</sub> = 2</span></li><li><span class='eq-i'>i<sub>a</sub> = −1 A ، i<sub>b</sub> = 1 A ← v₁ = 20 − 15(−1) = 35 V</span>، نفس النتيجة.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>المهندس يختار الطريقة قبل أن يبدأ، كما تختار أقصر طريق قبل أن تقود. معادلة واحدة بدل اثنتين توفر الوقت وتقلل الأخطاء في الاختبار.</p>" }
    ],
    quiz: [
      { q: "دائرة فيها 3 عقد أساسية و 4 حلقات صغرى، بدون مصادر خاصة. أي طريقة أقل معادلات؟", options: [
        { t: "جهود العقد (معادلتان)", correct: true, why: "3 − 1 = 2 مقابل 4." }, { t: "تيارات الحلقات (3 معادلات)", type: "conceptual", why: "الحلقات الصغرى 4، فهي 4 معادلات." } ]}
    ],
    practice: {
      prompt: "دائرة سلم: <span class='ltr'>Vs = 24 V</span> مع ست مقاومات. قارن بين الطريقتين ثم احسب جهد <span class='ltr'>R5</span>.",
      circuit: c7, figure: fig(c7, "دائرة سلم بثلاث حلقات"),
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
  var x48 = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 6, { plus: "a", name: "V6" }), E([0, 0], [0, 1], "R", 4, { name: "R4" }), E([0, 1], [1, 1], "R", 30, { name: "R30" }), E([0, 1], [0, 2], "R", 6, { name: "R6" }), E([0, 2], [1, 2], "R", 20, { name: "R20" }), E([0, 2], [0, 3], "R", 5, { name: "R5" }), E([0, 3], [1, 3], "V", 40, { plus: "a", name: "V40" }), E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "R", 10, { name: "R10" }), E([1, 2], [1, 3], "W")] };
  var s48 = solve(x48); chk(s48.byName.V6.i, 0.825, "4.8 i"); chk(s48.byName.V6.p, 4.95, "4.8 p6");
  var x49 = { rows: 3, cols: 5, edges: [E([0, 0], [1, 0], "V", 250, { plus: "a", name: "V250" }), E([1, 0], [2, 0], "W"), E([0, 0], [0, 1], "W"), E([0, 1], [2, 1], "R", 125, { name: "R125" }), E([0, 1], [0, 2], "R", 25, { name: "R25" }), E([0, 2], [1, 2], "I", 8, { dir: "ab", name: "I8" }), E([1, 2], [2, 2], "R", 10, { name: "R10" }), E([0, 2], [0, 3], "W"), E([0, 3], [2, 3], "R", 100, { name: "R100", vlabel: "vₒ" }), E([0, 3], [0, 4], "R", 5, { name: "R5" }), E([0, 4], [2, 4], "R", 15, { name: "R15" }), E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W"), E([2, 2], [2, 3], "W"), E([2, 3], [2, 4], "W")] };
  var s49 = solve(x49); chk(s49.byName.R100.v, 20, "4.9 vo");

  L["c1-techniques-8"] = {
    id: "c1-techniques-8", ar: "تحويل المصادر", en: "Source Transformations", minutes: 25,
    objectives: ["تحوّل مصدر جهد مع مقاومة على التوالي إلى مصدر تيار مع مقاومة على التوازي، والعكس.", "تستخدم التحويلات المتتالية لاختزال دائرة.", "تعرف حدود التحويل."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>تحويل المصادر</b> يسمح باستبدال مصدر جهد <span class='ltr'>v<sub>s</sub></span> على التوالي مع مقاومة R بمصدر تيار <span class='ltr'>i<sub>s</sub></span> على التوازي مع <b>نفس المقاومة</b>، والعكس. الدائرتان متكافئتان بالنسبة للطرفين a و b.</p>" +
        "<p><b>حالة خاصة:</b> مقاومة على التوازي مع مصدر جهد، أو على التوالي مع مصدر تيار، <b>لا تؤثر</b> على ما يحدث عند الطرفين a و b، فيمكن حذفها عند حساب الجهود والتيارات خارجها. لكنها تؤثر على حساب قدرة المصدر نفسه.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>v<sub>s</sub> = i<sub>s</sub>R</div><div class='eq'>i<sub>s</sub> = v<sub>s</sub> / R</div>" +
        "<p class='muted'>اتجاه سهم مصدر التيار يشير نحو الطرف الموجب لمصدر الجهد.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>استخدم التحويل لتجميع المصادر: مصادر الجهد على التوالي تُجمع، ومصادر التيار على التوازي تُجمع.</li><li>بعد كل تحويل ابحث عن مقاومات صارت على التوالي أو التوازي.</li><li>لا تحوّل العنصر الذي تريد جهده أو تياره.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>مثال 4.8: (a) أوجد قدرة مصدر 6 V. (b) هل يمتصها أم يعطيها؟</p>" +
        fig(x48, "مثال 4.8: مصدر 6 V ومقاومات 4 و 6 و 30 و 10 و 20 و 5 Ω ومصدر 40 V") +
        "<ol class='steps'><li>40 V مع 5 Ω ← مصدر <span class='eq-i'>40/5 = 8 A</span> على التوازي مع 5 Ω، ثم <span class='eq-i'>20 ∥ 5 = 4 Ω</span></li><li>8 A مع 4 Ω ← <span class='eq-i'>32 V</span> على التوالي مع 4 Ω، ثم مع 6 Ω و 10 Ω: <span class='eq-i'>4 + 6 + 10 = 20 Ω</span></li><li>32 V مع 20 Ω ← <span class='eq-i'>1.6 A</span> مع 20 Ω، ثم <span class='eq-i'>20 ∥ 30 = 12 Ω</span></li><li>1.6 A مع 12 Ω ← <span class='eq-i'>19.2 V</span> على التوالي مع 12 Ω.</li><li><span class='eq-i'>i = (19.2 − 6)/(4 + 12) = 0.825 A</span>، و <span class='eq-i'>p<sub>6V</sub> = 6 × 0.825 = 4.95 W</span>: المصدر <b>يمتص</b>.</li></ol>" +
        "<p class='q'>مثال 4.9: استخدم تحويل المصادر لإيجاد v<sub>o</sub>.</p>" +
        fig(x49, "مثال 4.9: مصدر 250 V ومصدر 8 A ومقاومات") +
        "<ol class='steps'><li>125 Ω على التوازي مع مصدر الجهد، و 10 Ω على التوالي مع مصدر التيار: نحذفهما (الحالة الخاصة). و 5 + 15 = 20 Ω.</li><li>250 V مع 25 Ω ← <span class='eq-i'>10 A</span> مع 25 Ω، ونجمع مصادر التيار: <span class='eq-i'>10 − 8 = 2 A</span></li><li><span class='eq-i'>25 ∥ 100 ∥ 20 = 10 Ω ← v<sub>o</sub> = 2 × 10 = 20 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>ورقة بيانات البطارية تعطي جهدها ومقاومتها الداخلية (مصدر جهد مع مقاومة)، بينما الخلية الشمسية تُوصف عادة كمصدر تيار مع مقاومة. التحويل يسمح بمقارنتهما بنفس النموذج.</p>" }
    ],
    quiz: [
      { q: "مصدر تيار <span class='ltr'>5 A</span> على التوازي مع <span class='ltr'>4 Ω</span> يكافئ:", options: [
        { t: "<span class='ltr'>20 V</span> على التوالي مع 4 Ω", correct: true, why: "vₛ = iₛR." }, { t: "<span class='ltr'>1.25 V</span> مع 4 Ω", type: "formula", why: "قسمت. vₛ = iₛ × R." }, { t: "<span class='ltr'>20 V</span> مع 0.25 Ω", type: "conceptual", why: "المقاومة نفسها تبقى 4 Ω." } ]}
    ],
    practice: {
      prompt: "استخدم تحويل المصادر لحساب التيار في <span class='ltr'>R4</span>. القيم: <span class='ltr'>Vs = 36 V</span>، <span class='ltr'>R1 = 6 Ω</span>، <span class='ltr'>R2 = 3 Ω</span>، <span class='ltr'>R3 = 2 Ω</span>، <span class='ltr'>R4 = 8 Ω</span>.",
      circuit: c8, figure: fig(c8, "مصدر 36 فولت ومقاومات بعضها على التوالي وبعضها على التوازي"),
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
  var xth = ({ rows: 2, cols: 5, edges: [E([0, 0], [1, 0], "V", 25, { plus: "a", name: "V25" }), E([0, 0], [0, 1], "R", 5, { name: "R5" }), E([0, 1], [1, 1], "R", 20, { name: "R20" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "I", 3, { dir: "ba", name: "I3" }), E([0, 2], [0, 3], "R", 4, { name: "R4" }), E([0, 3], [0, 4], "W"), E([0, 4], [1, 4], "T", 0, { name: "ab" })].concat(BOT(4)) });
  var sth = AN.thevenin(xth); chk(sth.voc, 32, "Th voc"); chk(Math.abs(sth.isc), 4, "Th isc"); chk(Math.abs(sth.rth), 8, "Th rth");
  var x410 = { rows: 2, cols: 5, edges: [E([0, 0], [1, 0], "V", 5, { plus: "a", name: "V5" }), E([0, 0], [0, 1], "R", 2000, { name: "R2k", vtext: "2 kΩ", ilabel: "i" }), E([0, 1], [1, 1], "VCVS", 3, { plus: "a", ctrl: "R25", vtext: "3 v", name: "D1" }), E([0, 2], [1, 2], "CCCS", 20, { dir: "ab", ctrl: "R2k", vtext: "20 i", name: "D2" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "R", 25, { name: "R25", vlabel: "v" }), E([0, 3], [0, 4], "W"), E([0, 4], [1, 4], "T", 0, { name: "ab" })].concat(BOT(4)) };
  var s410 = AN.thevenin(x410); chk(s410.voc, -5, "4.10 VTh"); chk(Math.abs(s410.isc), 0.05, "4.10 isc"); chk(s410.rth, 100, "4.10 RTh");

  L["c1-techniques-9"] = {
    id: "c1-techniques-9", ar: "مكافئا ثيفنن ونورتن", en: "Thévenin and Norton Equivalents", minutes: 30,
    objectives: ["تحسب جهد ثيفنن من جهد الدائرة المفتوحة.", "تحسب مقاومة ثيفنن بإطفاء المصادر المستقلة.", "تحسب تيار نورتن وتربط بين المكافئين."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>نظرية ثيفنن:</b> أي شبكة من المصادر والمقاومات يمكن استبدالها، بالنسبة لطرفين a و b، بمصدر جهد مستقل <span class='ltr'>V<sub>Th</sub></span> على التوالي مع مقاومة <span class='ltr'>R<sub>Th</sub></span>. إذا وصلنا نفس الحمل بالدائرتين نحصل على نفس الجهد والتيار في الحمل.</p>" +
        "<p><b>الخطوات:</b> (1) أزل الحمل R<sub>L</sub> مؤقتًا. (2) احسب جهد الدائرة المفتوحة <span class='ltr'>V<sub>ab</sub> = V<sub>Th</sub></span>. (3) اجعل الحمل صفرًا (قصر) واحسب <span class='ltr'>i<sub>sc</sub></span> من a إلى b، ثم <span class='ltr'>R<sub>Th</sub> = V<sub>Th</sub>/i<sub>sc</sub></span>.</p>" +
        "<p><b>مكافئ نورتن:</b> مصدر تيار مستقل على التوازي مع مقاومة نورتن. نحصل عليه من ثيفنن بتحويل المصادر: <span class='ltr'>I<sub>N</sub> = i<sub>sc</sub></span> و <span class='ltr'>R<sub>N</sub> = R<sub>Th</sub></span>.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>V<sub>Th</sub> = v<sub>ab</sub> (دائرة مفتوحة)</div><div class='eq'>i<sub>sc</sub> = V<sub>Th</sub> / R<sub>Th</sub>  ←  R<sub>Th</sub> = V<sub>Th</sub> / i<sub>sc</sub></div><div class='eq'>I<sub>N</sub> = i<sub>sc</sub> ، R<sub>N</sub> = R<sub>Th</sub></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>عندما تريد تيار أو قدرة حمل متغير: احسب المكافئ مرة واحدة ثم جرّب أي حمل.</li><li>طريقة i<sub>sc</sub> تصلح دائمًا، حتى مع المصادر التابعة.</li><li>انتبه لاتجاه i<sub>sc</sub>: من a إلى b عبر القصر.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>مثال المحاضرة: أوجد مكافئ ثيفنن (ونورتن) للدائرة بالنسبة للطرفين a و b.</p>" +
        fig(xth, "مصدر 25 V ومقاومات 5 و 20 و 4 Ω ومصدر 3 A والطرفان a و b") +
        "<ol class='steps'><li>الدائرة المفتوحة: لا تيار في 4 Ω، فـ <span class='eq-i'>v<sub>ab</sub> = v₁</span>: <span class='eq-i'>(v₁ − 25)/5 + v₁/20 − 3 = 0 ← v₁ = 32 V = V<sub>Th</sub></span></li><li>بعد قصر a و b: <span class='eq-i'>(v₂ − 25)/5 + v₂/20 − 3 + v₂/4 = 0 ← v₂ = 16 V</span>، و <span class='eq-i'>i<sub>sc</sub> = 16/4 = 4 A</span></li><li><span class='eq-i'>R<sub>Th</sub> = 32/4 = 8 Ω</span>، فمكافئ ثيفنن: 32 V مع 8 Ω، ومكافئ نورتن: 4 A مع 8 Ω.</li></ol>" +
        "<p class='q'>مثال 4.10: أوجد مكافئ ثيفنن لدائرة فيها مصادر تابعة.</p>" +
        fig(x410, "مثال 4.10: مصدر 5 V و 2 kΩ ومصدر جهد تابع 3v ومصدر تيار تابع 20i و 25 Ω") +
        "<ol class='steps'><li>i<sub>x</sub> يجب أن يساوي صفرًا لعدم وجود مسار عودة، فجهد الدائرة المفتوحة جهد 25 Ω: <span class='eq-i'>V<sub>Th</sub> = v = −20i(25) = −500i</span></li><li><span class='eq-i'>i = (5 − 3v)/2000 = (5 − 3V<sub>Th</sub>)/2000</span> ← <span class='eq-i'>V<sub>Th</sub> = −5 V</span></li><li>مع القصر بين a و b: v = 0، فـ <span class='eq-i'>i = 5/2000 = 2.5 mA</span> و <span class='eq-i'>i<sub>sc</sub> = −20i = −50 mA</span></li><li><span class='eq-i'>R<sub>Th</sub> = −5/(−0.05) = 100 Ω</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مقبس الشحن في الجوال يرى الشاحن كمصدر جهد مع مقاومة داخلية، أي مكافئ ثيفنن، وهذا يفسر لماذا ينخفض جهد الشاحن قليلًا عندما يسحب الجوال تيارًا أكبر.</p>" }
    ],
    quiz: [
      { q: "لحساب R<sub>Th</sub> في دائرة بمصادر مستقلة فقط، مصدر الجهد يُستبدل بـ:", options: [
        { t: "سلك (قصر)", correct: true, why: "إطفاء مصدر الجهد يعني جعل جهده صفرًا." }, { t: "دائرة مفتوحة", type: "conceptual", why: "هذا لمصدر التيار." }, { t: "يبقى كما هو", type: "conceptual", why: "عند حساب R<sub>Th</sub> نطفئ المصادر المستقلة." } ]},
      { q: "V<sub>Th</sub> = 20 V و I<sub>N</sub> = 4 A. مقاومة ثيفنن:", options: [
        { t: "<span class='ltr'>5 Ω</span>", correct: true, why: "20/4." }, { t: "<span class='ltr'>80 Ω</span>", type: "formula", why: "R<sub>Th</sub> = V<sub>Th</sub>/I<sub>N</sub>." } ]}
    ],
    practice: {
      prompt: "أوجد مكافئ ثيفنن ونورتن بين a و b. القيم: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 6 Ω</span>، <span class='ltr'>R2 = 12 Ω</span>، <span class='ltr'>R3 = 4 Ω</span>.",
      circuit: t9, figure: fig(t9, "شبكة بين الطرفين a و b بمصدر 60 فولت"),
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
  var xthd = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "W"), E([0, 0], [0, 1], "R", 5, { name: "R5" }), E([0, 1], [1, 1], "R", 20, { name: "R20" }), E([0, 1], [0, 2], "R", 4, { name: "R4" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "T", 0, { name: "ab" })].concat(BOT(3)) };
  chk(CV.gen.reqValue(xthd), 8, "Th deactivated Rab");

  L["c1-techniques-10"] = {
    id: "c1-techniques-10", ar: "المزيد عن إيجاد مكافئ ثيفنن", en: "More on Deriving a Thévenin Equivalent", minutes: 30,
    objectives: ["تحسب R<sub>Th</sub> بقسمة جهد الدائرة المفتوحة على تيار القصر.", "تستخدم مصدر اختبار لحساب R<sub>Th</sub>.", "تعرف لماذا لا تُطفأ المصادر التابعة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>طريقة <span class='ltr'>V<sub>Th</sub>/i<sub>sc</sub></span> ليست دائمًا الأسهل. هناك طريقتان أبسط غالبًا لإيجاد R<sub>Th</sub>:</p>" +
        "<p><b>الأولى (المصادر كلها مستقلة):</b> عطّل كل المصادر المستقلة: مصدر الجهد يصبح <b>قصرًا</b>، ومصدر التيار يصبح <b>مفتوحًا</b>. ثم احسب المقاومة التي تراها بين a و b. (إذا كانت للمصدر مقاومة داخلية فتبقى.)</p>" +
        "<p><b>الثانية (فيها مصادر تابعة):</b> عطّل المصادر المستقلة فقط، وضع <b>مصدر اختبار</b> v<sub>T</sub> (أو i<sub>T</sub>) بين a و b، ثم <span class='ltr'>R<sub>Th</sub> = v<sub>T</sub>/i<sub>T</sub></span>. المصادر التابعة <b>لا تُعطَّل</b> أبدًا.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>R<sub>Th</sub> = R<sub>ab</sub> بعد تعطيل المصادر المستقلة</div><div class='eq'>R<sub>Th</sub> = v<sub>T</sub> / i<sub>T</sub>   (مع المصادر التابعة)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>مصادر مستقلة فقط: الطريقة الأولى أسرع.</li><li>مصادر تابعة: مصدر الاختبار، لأن المقاومة لا تُحسب بالتوالي والتوازي.</li><li>اختر قيمة اختبار سهلة مثل v<sub>T</sub> = 1 V إن أردت.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>الطريقة الأولى على مثال الدرس السابق (25 V و 5 و 20 و 4 Ω و 3 A):</p>" +
        fig(xthd, "الدائرة بعد تعطيل المصادر: 5 Ω و 20 Ω و 4 Ω") +
        "<ol class='steps'><li>مصدر 25 V ← قصر، ومصدر 3 A ← مفتوح.</li><li><span class='eq-i'>R<sub>ab</sub> = R<sub>Th</sub> = 4 + (5 × 20)/25 = 8 Ω</span>، نفس نتيجة V<sub>Th</sub>/i<sub>sc</sub>.</li></ol>" +
        "<p class='q'>مثال 4.11: أوجد R<sub>Th</sub> لدائرة مثال 4.10 بمصدر اختبار.</p>" +
        "<ol class='steps'><li>عطّل مصدر 5 V (قصر) وضع v<sub>T</sub> بين a و b، و i<sub>T</sub> التيار الذي يعطيه.</li><li>KCL عند a: <span class='eq-i'>i<sub>T</sub> = v<sub>T</sub>/25 + 20i</span></li><li>الحلقة اليسرى: <span class='eq-i'>i = −3v<sub>T</sub>/2000</span></li><li><span class='eq-i'>i<sub>T</sub> = v<sub>T</sub>/25 − 60v<sub>T</sub>/2000 ← i<sub>T</sub>/v<sub>T</sub> = 1/25 − 6/200 = 1/100</span></li><li><span class='eq-i'>R<sub>Th</sub> = v<sub>T</sub>/i<sub>T</sub> = 100 Ω</span>، نفس نتيجة مثال 4.10.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>مهندسو الصوت يقيسون <b>مقاومة الخرج</b> للمكبر بنفس فكرة مصدر الاختبار: يطبقون إشارة على الخرج ويقيسون التيار، لأن المكبر مليء بالمصادر التابعة.</p>" }
    ],
    quiz: [
      { q: "دائرة فيها مصدر تابع فقط بدون مصادر مستقلة. جهد ثيفنن:", options: [
        { t: "صفر، ونحتاج مصدر اختبار لـ R<sub>Th</sub>", correct: true, why: "بدون مصدر مستقل لا شيء يولّد جهدًا أو تيارًا." }, { t: "لا يمكن حسابه", type: "conceptual", why: "V<sub>Th</sub> = 0، و R<sub>Th</sub> بمصدر اختبار." } ]}
    ],
    practice: {
      prompt: "أوجد مكافئ ثيفنن. القيم: <span class='ltr'>Vs = 36 V</span>، <span class='ltr'>R1 = 30 Ω</span> (تيارها iₓ)، <span class='ltr'>R2 = 12 Ω</span>، مصدر تابع <span class='ltr'>0.5iₓ</span> للأسفل، <span class='ltr'>R3 = 2 Ω</span>.",
      circuit: t10, figure: fig(t10, "شبكة بمصدر تيار تابع قيمته نصف iₓ"),
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
  var x412 = { rows: 2, cols: 3, edges: [E([0, 0], [1, 0], "V", 360, { plus: "a", name: "V360" }), E([0, 0], [0, 1], "R", 30, { name: "R30" }), E([0, 1], [1, 1], "R", 150, { name: "R150" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 25, { name: "RL", vtext: "R_L" })].concat(BOT(2)) };
  var s412 = solve(x412); chk(s412.byName.RL.p, 900, "4.12 pmax"); chk(s412.byName.RL.v, 150, "4.12 vab"); chk(s412.byName.V360.p, -2520, "4.12 ps");

  L["c1-techniques-11"] = {
    id: "c1-techniques-11", ar: "أقصى نقل للقدرة", en: "Maximum Power Transfer", minutes: 20,
    objectives: ["تحدد مقاومة الحمل التي تستقبل أقصى قدرة.", "تحسب أقصى قدرة من مكافئ ثيفنن.", "تعرف أن الكفاءة عند أقصى نقل 50% فقط."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>نظرية نقل القدرة القصوى:</b> الحمل يأخذ أكبر قدرة من شبكة خطية عندما تساوي مقاومته مقاومة ثيفنن للشبكة كما يراها الحمل: <span class='ltr'>R<sub>L</sub> = R<sub>Th</sub></span>.</p>" +
        "<p>الاشتقاق: <span class='eq-i'>p = i²R<sub>L</sub> = (V<sub>Th</sub>/(R<sub>Th</sub> + R<sub>L</sub>))² R<sub>L</sub></span>. نشتق بالنسبة لـ R<sub>L</sub> ونساوي بالصفر: <span class='eq-i'>(R<sub>Th</sub> + R<sub>L</sub>)² = 2R<sub>L</sub>(R<sub>Th</sub> + R<sub>L</sub>)</span> ← <span class='eq-i'>R<sub>L</sub> = R<sub>Th</sub></span>.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>R<sub>L</sub> = R<sub>Th</sub></div><div class='eq'>p<sub>max</sub> = V<sub>Th</sub>²R<sub>L</sub>/(2R<sub>L</sub>)² = V<sub>Th</sub>² / (4R<sub>L</sub>)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>أوجد مكافئ ثيفنن أولًا، ثم ضع R<sub>L</sub> = R<sub>Th</sub>.</li><li>عند القدرة القصوى يكون نصف جهد ثيفنن على الحمل.</li><li>القدرة القصوى ليست كفاءة عالية: جزء كبير من قدرة المصدر يضيع داخل الشبكة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 4.12: (a) أوجد R<sub>L</sub> لأكبر قدرة. (b) أوجد القدرة القصوى. (c) ما نسبة قدرة مصدر 360 V التي تصل للحمل؟</p>" +
        fig(x412, "مثال 4.12: مصدر 360 V و 30 Ω و 150 Ω والحمل RL") +
        "<ol class='steps'><li><span class='eq-i'>V<sub>Th</sub> = (150/180)(360) = 300 V</span> ، <span class='eq-i'>R<sub>Th</sub> = (150)(30)/180 = 25 Ω ← R<sub>L</sub> = 25 Ω</span></li><li><span class='eq-i'>p<sub>max</sub> = (300/50)²(25) = 900 W</span></li><li><span class='eq-i'>v<sub>ab</sub> = (300/50)(25) = 150 V</span> ، <span class='eq-i'>i<sub>s</sub> = (360 − 150)/30 = 7 A</span> ، <span class='eq-i'>p<sub>s</sub> = −7 × 360 = −2520 W</span></li><li>النسبة: <span class='eq-i'>900/2520 × 100 = 35.71 %</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>في الهوائيات ومكبرات الصوت نطابق مقاومة الحمل مع مقاومة المصدر للحصول على أكبر قدرة. أما في شبكة الكهرباء فنريد كفاءة عالية، فنجعل مقاومة الحمل أكبر بكثير من مقاومة الشبكة.</p>" }
    ],
    quiz: [
      { q: "شبكة R<sub>Th</sub> = 50 Ω. لأقصى قدرة في الحمل، R<sub>L</sub> =", options: [
        { t: "<span class='ltr'>50 Ω</span>", correct: true, why: "R<sub>L</sub> = R<sub>Th</sub>." }, { t: "أكبر قيمة ممكنة", type: "conceptual", why: "الحمل الكبير جدًا يقلل التيار فتقل القدرة." }, { t: "صفر", type: "conceptual", why: "الحمل الصفري جهده صفر فقدرته صفر." } ]}
    ],
    practice: {
      prompt: "حمل R<sub>L</sub> يوصل بين a و b. القيم: <span class='ltr'>Vs = 60 V</span>، <span class='ltr'>R1 = 10 Ω</span>، <span class='ltr'>R2 = 40 Ω</span>، <span class='ltr'>R3 = 8 Ω</span>.",
      circuit: t11, figure: fig(t11, "شبكة بين الطرفين a و b يوصل بها حمل"),
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
  var xsp = { rows: 2, cols: 4, edges: [E([0, 0], [1, 0], "V", 120, { plus: "a", name: "V120" }), E([0, 0], [0, 1], "R", 6, { name: "R6", ilabel: "i₁" }), E([0, 1], [1, 1], "R", 3, { name: "R3", ilabel: "i₂" }), E([0, 1], [0, 2], "R", 2, { name: "R2", ilabel: "i₃" }), E([0, 2], [1, 2], "R", 4, { name: "R4", ilabel: "i₄" }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "I", 12, { dir: "ab", name: "I12" })].concat(BOT(3)) };
  var ssp = solve(xsp); chk(ssp.byName.R6.i, 17, "sp i1"); chk(ssp.byName.R3.i, 6, "sp i2"); chk(ssp.byName.R2.i, 11, "sp i3"); chk(ssp.byName.R4.i, -1, "sp i4");

  L["c1-techniques-12"] = {
    id: "c1-techniques-12", ar: "مبدأ التراكب", en: "Superposition", minutes: 25,
    objectives: ["تطبق التراكب على دائرة فيها أكثر من مصدر مستقل.", "تطفئ المصادر بالطريقة الصحيحة.", "تعرف أن التراكب لا ينطبق على القدرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>مبدأ التراكب</b> <span class='ltr'>(superposition)</span>: إذا كان النظام خطيًا وفيه أكثر من مصدر مستقل، فالاستجابة الكلية = مجموع الاستجابات لكل مصدر وحده.</p>" +
        "<p>نشغّل مصدرًا واحدًا في كل مرة ونعطّل الباقي (مصدر الجهد قصر، ومصدر التيار مفتوح)، ثم نجمع الجهود والتيارات. <b>المصادر التابعة لا تُعطَّل أبدًا</b> عند تطبيق التراكب.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>x = x′ + x″ + …</div><div class='eq'>مصدر جهد معطل ← قصر ، مصدر تيار معطل ← مفتوح</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>مفيد عندما تكون المصادر من أنواع مختلفة، أو تريد أثر كل مصدر وحده.</li><li>يصلح للجهود والتيارات فقط، <b>لا للقدرة</b> (القدرة ليست خطية).</li><li>انتبه لاتجاهات المراجع عند الجمع.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>مثال المحاضرة: احسب تيارات الفروع بالتراكب.</p>" +
        fig(xsp, "مصدر 120 V ومقاومات 6 و 3 و 2 و 4 Ω ومصدر 12 A") +
        "<ol class='steps'><li><b>مصدر 120 V وحده</b> (12 A مفتوح): <span class='eq-i'>(v₁ − 120)/6 + v₁/3 + v₁/(2 + 4) = 0 ← v₁ = 30 V</span></li><li><span class='eq-i'>i₁′ = (120 − 30)/6 = 15 A ، i₂′ = 30/3 = 10 A ، i₃′ = i₄′ = 30/6 = 5 A</span></li><li><b>مصدر 12 A وحده</b> (120 V قصر): <span class='eq-i'>v₃/3 + v₃/6 + (v₃ − v₄)/2 = 0 ، (v₄ − v₃)/2 + v₄/4 + 12 = 0</span> ← <span class='eq-i'>v₃ = −12 V ، v₄ = −24 V</span></li><li><span class='eq-i'>i₁″ = −v₃/6 = 2 A ، i₂″ = v₃/3 = −4 A ، i₃″ = (v₃ − v₄)/2 = 6 A ، i₄″ = v₄/4 = −6 A</span></li><li><b>الجمع:</b> <span class='eq-i'>i₁ = 17 A ، i₂ = 6 A ، i₃ = 11 A ، i₄ = −1 A</span></li></ol>" +
        "<p class='q'>مثال 4.13: استخدم التراكب لإيجاد v<sub>o</sub> في دائرة فيها مصدر 10 V ومصدر 5 A ومصدران تابعان.</p>" +
        "<ol class='steps'><li>مع 10 V وحده: المصدران التابعان يبقيان، والنتيجة <span class='eq-i'>v<sub>o</sub>′ = (20/25)(10) = 8 V</span></li><li>مع 5 A وحده: معادلتا عقد تعطيان <span class='eq-i'>v<sub>o</sub>″ = 16 V</span></li><li><span class='eq-i'>v<sub>o</sub> = 8 + 16 = 24 V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>في دوائر الصوت توجد إشارة متغيرة فوق جهد تغذية ثابت. المهندس يحلل أثر كل منهما وحده (تحليل DC ثم تحليل الإشارة) ويجمعهما، وهذا تطبيق مباشر للتراكب.</p>" }
    ],
    quiz: [
      { q: "عند حساب مساهمة مصدر الجهد، مصدر التيار الآخر يُستبدل بـ:", options: [
        { t: "دائرة مفتوحة", correct: true, why: "إطفاء مصدر التيار يعني جعل تياره صفرًا." }, { t: "سلك", type: "conceptual", why: "السلك لإطفاء مصدر الجهد." } ]},
      { q: "مساهمتان في تيار مقاومة 2 Ω: 1 A و 2 A. قدرة المقاومة:", options: [
        { t: "<span class='ltr'>18 W</span>", correct: true, why: "التيار الكلي 3 A، و 3² × 2 = 18 W." }, { t: "<span class='ltr'>10 W</span>", type: "conceptual", why: "جمعت القدرتين (2 + 8). القدرة لا تُجمع بالتراكب." } ]}
    ],
    practice: {
      prompt: "استخدم التراكب لحساب التيار <span class='ltr'>i</span> في <span class='ltr'>R2</span>. القيم: <span class='ltr'>Vs = 40 V</span>، <span class='ltr'>R1 = 5 Ω</span>، <span class='ltr'>R2 = 3 Ω</span>، <span class='ltr'>R3 = 10 Ω</span>، <span class='ltr'>Is = 4 A</span> للأسفل.",
      circuit: u12, figure: fig(u12, "دائرة بمصدر جهد 40 فولت ومصدر تيار 4 أمبير"),
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
