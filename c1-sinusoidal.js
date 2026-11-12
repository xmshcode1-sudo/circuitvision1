/* Circuits 1 — Chapter 5: Sinusoidal Steady-State Analysis (9 lessons, following the course description).
   Phasors are AMPLITUDE (peak) phasors. Practice answers are computed by engine/ac.js from the drawn circuit. */
(function () {
  "use strict";
  var CV = window.CV, L = CV.lessons = CV.lessons || {}, AC = CV.ac, Cx = AC.C, AN = CV.analysis;
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var fig = function (c, aria) { return "<div class='lfig'>" + CV.draw.render(c, { aria: aria }) + "</div>"; };
  var acs = function (c) { var s = AC.solve(c); if (!s.ok) throw new Error("lesson AC circuit invalid"); return s; };
  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };
  var P = Cx.polar, Z = Cx.c;
  var A = [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }], V = [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }, { l: "kV", f: 1e3 }], OHM = [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }];
  var eqi = function (s) { return "<span class='eq-i'>" + s + "</span>"; };
  var b3 = function () { return [E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")]; };
  var W0 = 1000;

  /* Phasor diagram: arrows from the origin, scaled to the largest magnitude */
  function diagram(items, aria) {
    var S = 230, cx = S / 2, cy = S / 2, max = Math.max.apply(null, items.map(function (it) { return Cx.abs(it.z); })), k = 90 / max;
    var o = '<svg class="pd" viewBox="0 0 ' + S + ' ' + S + '" role="img" aria-label="' + aria + '">' +
      '<line class="pd-ax" x1="10" y1="' + cy + '" x2="' + (S - 10) + '" y2="' + cy + '"/><line class="pd-ax" x1="' + cx + '" y1="10" x2="' + cx + '" y2="' + (S - 10) + '"/>' +
      '<text class="pd-t" x="' + (S - 12) + '" y="' + (cy + 16) + '" text-anchor="end">Re</text><text class="pd-t" x="' + (cx + 6) + '" y="20">Im</text>';
    items.forEach(function (it) {
      var x = cx + it.z.re * k, y = cy - it.z.im * k, ang = Math.atan2(cy - y, x - cx), hx = Math.cos(ang), hy = -Math.sin(ang);
      o += '<line class="pd-v ' + (it.cls || "") + '" x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '"/>' +
        '<polygon class="pd-h ' + (it.cls || "") + '" points="' + [[x, y], [x - 9 * hx + 4 * hy, y - 9 * hy - 4 * hx], [x - 9 * hx - 4 * hy, y - 9 * hy + 4 * hx]].map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '"/>' +
        '<text class="pd-l ' + (it.cls || "") + '" x="' + (x + 8 * Math.cos(ang) + (it.dx || 0)).toFixed(1) + '" y="' + (y - 8 * Math.sin(ang) + 4 + (it.dy || 0)).toFixed(1) + '" text-anchor="' + (x >= cx ? "start" : "end") + '">' + it.label + '</text>';
    });
    return "<div class='pd-wrap'>" + o + "</svg></div>";
  }

  /* ================= 1. The sinusoidal source ================= */
  L["c1-sinusoidal-1"] = {
    id: "c1-sinusoidal-1", ar: "المصدر الجيبي", en: "The Sinusoidal Source", minutes: 20,
    objectives: ["تقرأ من دالة الجهد الجيبي: القيمة العظمى، والتردد، والزاوية.", "تحوّل بين ω و f والدورة T.", "تحسب القيمة الفعالة (rms)."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>المصدر الجيبي يعطي جهدًا يتغير مع الزمن على شكل جيب تمام: <span class='eq-i'>v(t) = V<sub>m</sub> cos(ωt + φ)</span>.</p><ul class='ticks'><li><b>V<sub>m</sub></b>: القيمة العظمى (السعة).</li><li><b>ω</b>: التردد الزاوي بالراديان/ثانية، و <span class='ltr'>ω = 2πf</span>.</li><li><b>φ</b>: زاوية الطور، وتحدد قيمة الجهد عند <span class='ltr'>t = 0</span>.</li></ul>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>ω = 2πf</div><div class='eq'>T = 1/f</div><div class='eq'>V<sub>rms</sub> = V<sub>m</sub>/√2</div></div><p class='muted'>القيمة الفعالة هي قيمة الجهد المستمر الذي يعطي نفس القدرة في مقاومة. علاقة √2 صحيحة للموجة الجيبية فقط.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>احسب cos(ωt + φ) والآلة الحاسبة على الدرجات إذا كانت φ بالدرجات، وانتبه أن ωt بالراديان: حوّل أحدهما ليتطابقا.</li><li>جهد المقبس المكتوب (220 V) قيمة فعالة، والقيمة العظمى أكبر بـ √2.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>جهد مقبس 220 V (rms) بتردد 60 Hz. اكتب v(t).</p><ol class='steps'><li>" + eqi("V<sub>m</sub> = 220√2 ≈ 311 V") + "</li><li>" + eqi("ω = 2π × 60 ≈ 377 rad/s") + "</li><li>" + eqi("v(t) = 311 cos(377t) V") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>شبكة الكهرباء في السعودية تعمل بتردد 60 Hz. المقابس المنزلية 220 V أو 127 V بالقيمة الفعالة، أي أن الجهد يصل لحظيًا إلى حوالي 311 V أو 180 V. ولهذا تُصمم العوازل لتتحمل القيمة العظمى وليس الفعالة.</p>" }
    ],
    quiz: [
      { q: "<span class='ltr'>v(t) = 100 cos(500t + 20°)</span>. التردد الزاوي:", options: [{ t: "<span class='ltr'>500 rad/s</span>", correct: true, why: "المعامل أمام t." }, { t: "<span class='ltr'>500 Hz</span>", type: "unit", why: "500 هي ω بالراديان/ثانية، و f = 500/2π ≈ 79.6 Hz." }, { t: "<span class='ltr'>20°</span>", type: "conceptual", why: "20° هي زاوية الطور." }] },
      { q: "القيمة الفعالة لجهد قيمته العظمى 100 V:", options: [{ t: "<span class='ltr'>70.7 V</span>", correct: true, why: "100/√2." }, { t: "<span class='ltr'>141.4 V</span>", type: "formula", why: "ضربت في √2 بدل القسمة." }, { t: "<span class='ltr'>50 V</span>", type: "formula", why: "قسمت على 2. القسمة على √2." }] }
    ],
    practice: {
      prompt: "جهد مصدر: <span class='eq-i'>v(t) = 170 cos(377t − 30°) V</span>",
      steps: [
        { id: "s1", label: "احسب التردد f.", symbol: "f =", answer: 377 / (2 * Math.PI), units: [{ l: "Hz", f: 1 }, { l: "kHz", f: 1e3 }],
          diagnose: [{ value: 377, type: "unit", why: "377 هي ω بالراديان/ثانية. التردد " + eqi("f = ω/2π") + "." }, { value: 377 * 2 * Math.PI, type: "formula", why: "ضربت في 2π. " + eqi("f = ω/(2π)") + "." }], hints: [eqi("f = ω / 2π")], solution: eqi("f = 377/2π ≈ 60 Hz") },
        { id: "s2", label: "احسب الدورة T.", symbol: "T =", answer: 2 * Math.PI / 377, units: [{ l: "ms", f: 1e-3 }, { l: "s", f: 1 }], unitDefault: 0,
          diagnose: [{ value: 1 / 377, type: "unit", why: "قسمت 1 على ω. الدورة " + eqi("T = 1/f = 2π/ω") + "." }], hints: [eqi("T = 1/f")], solution: eqi("T = 1/60 ≈ 16.67 ms") },
        { id: "s3", label: "احسب القيمة الفعالة.", symbol: "Vrms =", answer: 170 / Math.SQRT2, units: V, unitDefault: 1,
          diagnose: [{ value: 170 * Math.SQRT2, type: "formula", why: "ضربت في √2. القيمة الفعالة أصغر من العظمى." }, { value: 85, type: "formula", why: "قسمت على 2. " + eqi("V<sub>rms</sub> = V<sub>m</sub>/√2") + "." }], hints: [eqi("170/√2")], solution: eqi("V<sub>rms</sub> = 170/1.414 ≈ 120.2 V") },
        { id: "s4", label: "احسب قيمة الجهد عند <span class='ltr'>t = 0</span>.", symbol: "v(0) =", answer: 170 * Math.cos(-Math.PI / 6), units: V, unitDefault: 1,
          diagnose: [{ value: 170 * Math.cos(-30), type: "unit", why: "الآلة الحاسبة على الراديان، فحسبت cos(−30 rad). الزاوية بالدرجات." }, { value: -85, type: "formula", why: "استخدمت sin بدل cos." }, { value: 170, type: "conceptual", why: "نسيت زاوية الطور. عند t = 0 يبقى cos(−30°)." }],
          hints: [eqi("v(0) = 170 cos(−30°)")], solution: eqi("v(0) = 170 × 0.866 = 147.2 V") }
      ]
    },
    lab: { title: "الأوسيلوسكوب", desc: "في المعمل الذكي ستعرض موجة جيبية على الأوسيلوسكوب، وتقيس منها الدورة والقيمة العظمى، وتقارنها بالدالة." }
  };

  /* ================= 2. The phasor ================= */
  L["c1-sinusoidal-2"] = {
    id: "c1-sinusoidal-2", ar: "الفيزور", en: "The Phasor", minutes: 25,
    objectives: ["تحوّل دالة جيبية إلى فيزور والعكس.", "تحوّل الفيزور بين الشكلين القطبي والديكارتي.", "تجمع موجتين جيبيتين بجمع فيزوريهما."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>في الحالة المستقرة، كل الجهود والتيارات في الدائرة لها نفس التردد ω. الذي يختلف بينها فقط: <b>المقدار</b> و<b>الزاوية</b>. الفيزور عدد مركّب يحمل هاتين المعلومتين:</p><div class='eq'>V<sub>m</sub> cos(ωt + φ)  ⟷  V = V<sub>m</sub>∠φ</div><p>بهذا تتحول المعادلات التفاضلية إلى معادلات جبرية بالأعداد المركبة.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>a + jb = √(a² + b²) ∠ tan⁻¹(b/a)</div><div class='eq'>M∠θ = M cos θ + j M sin θ</div></div><p class='muted'>عند حساب الزاوية تحقق من الربع: إذا كان a سالبًا أضف 180° لناتج tan⁻¹.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>الجمع والطرح أسهل بالشكل الديكارتي، والضرب والقسمة أسهل بالشكل القطبي.</li><li>إذا أُعطيت دالة بـ sin، حوّلها أولًا: <span class='ltr'>sin(x) = cos(x − 90°)</span>.</li><li>لا تجمع المقادير مباشرة؛ اجمع الأعداد المركبة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>اجمع <span class='ltr'>v₁ = 20 cos(ωt + 30°)</span> و <span class='ltr'>v₂ = 40 cos(ωt − 60°)</span>.</p><ol class='steps'><li>" + eqi("V₁ = 20∠30° = 17.32 + j10") + "</li><li>" + eqi("V₂ = 40∠−60° = 20 − j34.64") + "</li><li>" + eqi("V = 37.32 − j24.64 = 44.72∠−33.43°") + "</li><li>" + eqi("v(t) = 44.72 cos(ωt − 33.43°)") + ". لاحظ أن 44.72 ≠ 20 + 40.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مهندسو الشبكات يقيسون فيزورات الجهد في محطات بعيدة بأجهزة متزامنة بالأقمار الصناعية (PMU)، ومنها يعرفون حالة الشبكة واستقرارها لحظة بلحظة.</p>" }
    ],
    quiz: [
      { q: "فيزور <span class='ltr'>i(t) = 5 cos(ωt − 45°)</span>:", options: [{ t: "<span class='ltr'>5∠−45°</span>", correct: true, why: "المقدار والزاوية مباشرة." }, { t: "<span class='ltr'>5∠45°</span>", type: "sign", why: "الزاوية −45°." }, { t: "<span class='ltr'>5∠(ω − 45°)</span>", type: "conceptual", why: "الفيزور لا يحمل ω؛ التردد معروف ومشترك." }] }
    ],
    practice: {
      prompt: "حوّل واجمع الفيزورات. أدخل الإجابة بالشكل الذي تفضله: قطبي (مقدار∠زاوية) أو ديكارتي (a + jb).",
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "اكتب فيزور <span class='ltr'>v(t) = 50 cos(ωt + 36.87°)</span> بالشكل الديكارتي.", answer: P(50, 36.87), units: V,
          diagnose: [{ value: Z(30, 40), type: "formula", why: "بدّلت بين cos و sin: الجزء الحقيقي = M cos θ = 40، والتخيلي = M sin θ = 30." }], hints: [eqi("50 cos 36.87° + j 50 sin 36.87°")], solution: eqi("V = 40 + j30 V") },
        { id: "s2", kind: "phasor", form: "polar", label: "حوّل <span class='ltr'>−10 + j10</span> إلى الشكل القطبي.", answer: Z(-10, 10), units: [{ l: "(بدون وحدة)", f: 1 }],
          diagnose: [{ value: P(14.142, -45), type: "math", why: "استخدمت tan⁻¹(10/−10) = −45° مباشرة. العدد في الربع الثاني (a سالب، b موجب)، فأضف 180°: الزاوية 135°.", review: R("c1-sinusoidal-2", "laws", "الزاوية والربع") }],
          hints: ["المقدار " + eqi("√(100 + 100)") + ". في أي ربع يقع العدد؟"], solution: eqi("14.14∠135°") },
        { id: "s3", kind: "phasor", form: "polar", label: "اجمع <span class='ltr'>10 cos(ωt + 30°) + 10 cos(ωt − 30°)</span> واكتب فيزور الناتج.", answer: Cx.add(P(10, 30), P(10, -30)), units: V,
          diagnose: [{ value: Z(20, 0), type: "conceptual", why: "جمعت المقادير 10 + 10. الفيزورات تُجمع كأعداد مركبة: الجزءان التخيليان يلغي أحدهما الآخر، والحقيقيان 8.66 + 8.66.", review: R("c1-sinusoidal-2", "when", "لا تجمع المقادير") }],
          hints: ["حوّل كل فيزور للشكل الديكارتي ثم اجمع."], solution: eqi("(8.66 + j5) + (8.66 − j5) = 17.32∠0° V") },
        { id: "s4", label: "تيار فيزوره <span class='ltr'>I = 5∠−120° A</span>. احسب قيمته اللحظية عند <span class='ltr'>t = 0</span>.", symbol: "i(0) =", answer: 5 * Math.cos(-2 * Math.PI / 3), units: A, unitDefault: 1,
          diagnose: [{ value: 5 * Math.sin(-2 * Math.PI / 3), type: "formula", why: "استخدمت sin. الفيزور مأخوذ من cos." }, { value: 5 * Math.cos(-120), type: "unit", why: "الآلة الحاسبة على الراديان." }], hints: [eqi("i(t) = 5 cos(ωt − 120°)")], solution: eqi("i(0) = 5 cos(−120°) = −2.5 A") }
      ]
    },
    lab: { title: "جمع موجتين", desc: "في المعمل الذكي ستعرض موجتين وحاصل جمعهما على الأوسيلوسكوب، وتقارن مقدار الناتج بحسابك بالفيزورات." }
  };

  /* ================= 3. Passive elements in the frequency domain ================= */
  L["c1-sinusoidal-3"] = {
    id: "c1-sinusoidal-3", ar: "العناصر السلبية في المجال الترددي", en: "The Passive Circuit Elements in the Frequency Domain", minutes: 25,
    objectives: ["تحسب ممانعة المقاومة والملف والمكثف.", "تعرف علاقة الطور بين الجهد والتيار في كل عنصر.", "تطبق قانون أوم بالفيزورات."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>في المجال الترددي، كل عنصر يُوصف بممانعته <span class='ltr'>Z</span>، ويصبح قانون أوم <span class='eq-i'>V = Z I</span> بالأعداد المركبة.</p><table class='tbl'><thead><tr><th>العنصر</th><th>الممانعة</th><th>الطور</th></tr></thead><tbody><tr><td>مقاومة</td><td class='ltr'>Z = R</td><td>الجهد والتيار في نفس الطور</td></tr><tr><td>ملف</td><td class='ltr'>Z = jωL</td><td>الجهد يسبق التيار بـ 90°</td></tr><tr><td>مكثف</td><td class='ltr'>Z = 1/(jωC) = −j/(ωC)</td><td>التيار يسبق الجهد بـ 90°</td></tr></tbody></table>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>Z<sub>L</sub> = jωL</div><div class='eq'>Z<sub>C</sub> = −j / (ωC)</div><div class='eq'>V = Z I</div></div><p class='muted'>X<sub>L</sub> = ωL و X<sub>C</sub> = 1/(ωC) تسميان المفاعلة (reactance)، وكلاهما بالأوم.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>إذا أُعطيت f فاحسب ω = 2πf أولًا، وإذا أُعطيت ω فاضرب فيها مباشرة.</li><li>ممانعة المكثف سالبة الجزء التخيلي. خطأ الإشارة هنا أكثر خطأ شائع في الفصل كله.</li><li>عند التردد العالي: الملف يقترب من دائرة مفتوحة، والمكثف من القصر.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>ω = 500 rad/s. ملف 40 mH ومكثف 100 µF.</p><ol class='steps'><li>" + eqi("Z<sub>L</sub> = j × 500 × 0.04 = j20 Ω") + "</li><li>" + eqi("Z<sub>C</sub> = −j / (500 × 100×10⁻⁶) = −j20 Ω") + "</li><li>على التوالي: " + eqi("j20 − j20 = 0") + ". هذا الرنين، وستدرسه في Circuits 2.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>شاحن الجوال اللاسلكي يعتمد على ملفين يتبادلان الطاقة عند تردد محدد، ومكثفات تُختار لتلغي مفاعلة الملفات عند هذا التردد بالضبط.</p>" }
    ],
    quiz: [
      { q: "في الملف، الجهد بالنسبة للتيار:", options: [{ t: "يسبقه بـ 90°", correct: true, why: "V = jωL I، و j = 1∠90°." }, { t: "يتأخر عنه بـ 90°", type: "sign", why: "هذا في المكثف." }, { t: "في نفس الطور", type: "conceptual", why: "هذا في المقاومة." }] },
      { q: "ممانعة مكثف <span class='ltr'>10 µF</span> عند <span class='ltr'>ω = 1000 rad/s</span>:", options: [{ t: "<span class='ltr'>−j100 Ω</span>", correct: true, why: "1/(1000 × 10⁻⁵) = 100." }, { t: "<span class='ltr'>+j100 Ω</span>", type: "sign", why: "ممانعة المكثف سالبة التخيلي." }, { t: "<span class='ltr'>−j0.01 Ω</span>", type: "formula", why: "هذا ωC. الممانعة مقلوبها." }] }
    ],
    practice: {
      prompt: "عند <span class='ltr'>ω = 1000 rad/s</span>: ملف <span class='ltr'>L = 20 mH</span> ومكثف <span class='ltr'>C = 50 µF</span>.",
      steps: [
        { id: "s1", label: "احسب مفاعلة الملف <span class='ltr'>X<sub>L</sub></span>.", symbol: "XL =", answer: 20, units: OHM, unitDefault: 0,
          diagnose: [{ value: 0.02, type: "formula", why: "نسيت ضرب L في ω." }, { value: 2 * Math.PI * 20, type: "unit", why: "ضربت في 2π. ω معطاة مباشرة (1000 rad/s)، فلا تحتاج 2π." }], hints: [eqi("X<sub>L</sub> = ωL")], solution: eqi("X<sub>L</sub> = 1000 × 0.02 = 20 Ω") },
        { id: "s2", kind: "phasor", form: "rect", label: "اكتب ممانعة المكثف <span class='ltr'>Z<sub>C</sub></span>.", answer: Z(0, -20), units: OHM,
          diagnose: [{ value: Z(0, -0.05), type: "formula", why: "حسبت ωC. الممانعة " + eqi("−j/(ωC)") + "." }], hints: [eqi("Z<sub>C</sub> = −j / (ωC)")], solution: eqi("Z<sub>C</sub> = −j / (1000 × 50×10⁻⁶) = −j20 Ω") },
        { id: "s3", kind: "phasor", form: "polar", label: "يُطبَّق على الملف جهد <span class='ltr'>V = 100∠0° V</span>. احسب فيزور تياره.", answer: Cx.div(Z(100), Z(0, 20)), units: A,
          diagnose: [{ value: Z(5, 0), type: "conceptual", why: "قسمت على 20 ونسيت j. تيار الملف يتأخر عن جهده بـ 90°." }], hints: [eqi("I = V / (j20)")], solution: eqi("I = 100∠0° / 20∠90° = 5∠−90° A") },
        { id: "s4", kind: "choice", label: "في المكثف، أيهما يسبق؟", options: [
          { t: "التيار يسبق الجهد بـ 90°", correct: true }, { t: "الجهد يسبق التيار بـ 90°", type: "sign", why: "هذا في الملف. في المكثف " + eqi("I = V / Z<sub>C</sub> = jωC V") + "، أي التيار يسبق.", review: R("c1-sinusoidal-3", "concept", "جدول الطور") } ],
          hints: ["Z<sub>C</sub> زاويتها −90°."], solution: "التيار يسبق الجهد بـ 90°." }
      ]
    },
    lab: { title: "فرق الطور بالقياس", desc: "في المعمل الذكي ستعرض جهد وتيار ملف ومكثف على قناتي الأوسيلوسكوب، وتقيس فرق الطور بينهما." }
  };

  /* ================= 4. Kirchhoff's laws in the frequency domain ================= */
  L["c1-sinusoidal-4"] = {
    id: "c1-sinusoidal-4", ar: "قانونا كيرشوف في المجال الترددي", en: "Kirchhoff’s Laws in the Frequency Domain", minutes: 20,
    objectives: ["تطبق KCL و KVL على الفيزورات.", "تفهم لماذا لا تُجمع المقادير مباشرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>KCL و KVL ينطبقان على الفيزورات كما ينطبقان على القيم اللحظية: مجموع فيزورات التيارات عند عقدة صفر، ومجموع فيزورات الجهود حول حلقة صفر. لكن الجمع جمع أعداد مركبة.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>Σ I = 0  (node)</div><div class='eq'>Σ V = 0  (loop)</div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>الفولتميتر يقيس المقدار فقط (الفعال). مجموع قراءات الفولتميتر على عناصر حلقة <b>لا يساوي</b> جهد المصدر عادة، وهذا لا يخالف KVL.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>دائرة توالي: جهد المقاومة <span class='ltr'>60∠0°</span> وجهد الملف <span class='ltr'>80∠90°</span>. جهد المصدر:</p><ol class='steps'><li>" + eqi("V = 60 + j80 = 100∠53.13° V") + "</li><li>المقدار 100 وليس 140.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>فني يقيس 120 V على المقاومة و 160 V على الملف في دائرة مصدرها 200 V قد يظن أن الجهاز معطل، بينما القياس صحيح تمامًا: الجهدان متعامدان.</p>" }
    ],
    quiz: [{ q: "تياران يدخلان عقدة: 3∠0° و 4∠90°. التيار الخارج:", options: [{ t: "<span class='ltr'>5∠53.13°</span>", correct: true, why: "3 + j4." }, { t: "<span class='ltr'>7∠45°</span>", type: "conceptual", why: "جمعت المقادير." }] }],
    practice: {
      prompt: "طبّق قانوني كيرشوف على الفيزورات.",
      steps: [
        { id: "s1", kind: "phasor", form: "polar", label: "تياران يدخلان عقدة: <span class='ltr'>10∠0° A</span> و <span class='ltr'>10∠90° A</span>. احسب التيار الخارج.", answer: Z(10, 10), units: A,
          diagnose: [{ value: P(20, 45), type: "conceptual", why: "جمعت المقادير. اجمع الأعداد المركبة: 10 + j10.", review: R("c1-sinusoidal-4", "concept", "الجمع المركب") }], hints: ["10∠0° = 10، و 10∠90° = j10."], solution: eqi("I = 10 + j10 = 14.14∠45° A") },
        { id: "s2", kind: "phasor", form: "polar", label: "دائرة توالي: جهد المقاومة <span class='ltr'>30∠0° V</span>، وجهد الملف <span class='ltr'>40∠90° V</span>. احسب فيزور جهد المصدر.", answer: Z(30, 40), units: V,
          diagnose: [{ value: P(70, 53.13), type: "conceptual", why: "جمعت المقادير 30 + 40. الجهدان متعامدان." }, { value: Z(30, -40), type: "sign", why: "جهد الملف " + eqi("+j40") + " لأن زاويته +90°." }], hints: [eqi("30 + j40")], solution: eqi("V = 30 + j40 = 50∠53.13° V") },
        { id: "s3", kind: "choice", label: "فولتميتر يقرأ 30 على المقاومة و 40 على الملف. لماذا لا يقرأ 70 على المصدر؟", options: [
          { t: "لأن الجهدين غير متطابقين في الطور، فيُجمعان كمتجهين", correct: true }, { t: "لأن الفولتميتر معطل", type: "conceptual", why: "القراءات صحيحة. KVL ينطبق على الفيزورات وليس على المقادير." } ], hints: ["فكّر في الزاوية بين الجهدين."], solution: "الجهدان متعامدان، فالمجموع √(30² + 40²) = 50." }
      ]
    },
    lab: { title: "KVL بالفولتميتر", desc: "في المعمل الذكي ستقيس جهود عناصر دائرة RL، وترى أن مجموعها أكبر من جهد المصدر، ثم تتحقق بالفيزورات." }
  };

  /* ================= 5. Series, parallel, Δ-Y ================= */
  var z5 = { rows: 2, cols: 3, omega: W0, edges: [E([0, 0], [1, 0], "T", 0, { name: "ab" }), E([0, 0], [0, 1], "R", 6, { name: "R1" }), E([0, 1], [1, 1], "L", 0.004, { name: "L1" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "C", 1 / 8000, { name: "C1" })].concat(b3()) };
  var zp5 = AC.port(z5).zth;
  L["c1-sinusoidal-5"] = {
    id: "c1-sinusoidal-5", ar: "التبسيط بالتوالي والتوازي و Δ-Y", en: "Series, Parallel, and Delta-to-Wye Simplifications", minutes: 25,
    objectives: ["تجمع الممانعات على التوالي والتوازي.", "تطبق تحويل Δ-Y على الممانعات.", "تحسب الممانعة المكافئة لشبكة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>كل قواعد الفصل الثالث تنطبق على الممانعات كما هي، مع حساب مركّب: التوالي جمع، والتوازي <span class='ltr'>Z₁Z₂/(Z₁ + Z₂)</span>، وتحويل Δ-Y بنفس القوانين.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>Z = Z₁ + Z₂</div><div class='eq'>Z = Z₁Z₂ / (Z₁ + Z₂)</div></div><p class='muted'>الممانعة المكافئة <span class='ltr'>Z = R + jX</span>: X موجبة تعني سلوكًا حثيًا، وسالبة تعني سلوكًا سعويًا.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>اجمع على التوالي بالشكل الديكارتي. وفي التوازي، اضرب واقسم بالشكل القطبي أو استخدم المرافق.</li><li>ملف ومكثف على التوازي قد يعطيان ممانعة أكبر من كليهما، وهذا مختلف عن المقاومات.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>مقاومة 4 Ω على التوالي مع (j6 ∥ −j3).</p><ol class='steps'><li>" + eqi("(j6)(−j3)/(j6 − j3) = 18/(j3) = −j6 Ω") + "</li><li>" + eqi("Z = 4 − j6 = 7.21∠−56.31° Ω") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مصممو مرشحات الصوت في السماعات (crossover) يجمعون ممانعات الملفات والمكثفات ليوجّهوا الترددات المنخفضة للسماعة الكبيرة والعالية للصغيرة.</p>" }
    ],
    quiz: [{ q: "ممانعتان <span class='ltr'>3 + j4</span> و <span class='ltr'>3 − j4</span> على التوالي:", options: [{ t: "<span class='ltr'>6 Ω</span>", correct: true, why: "الجزءان التخيليان يلغي أحدهما الآخر." }, { t: "<span class='ltr'>10 Ω</span>", type: "conceptual", why: "جمعت المقادير 5 + 5." }] }],
    practice: {
      prompt: "احسب الممانعة المكافئة بين a و b.",
      figure: fig(z5, "مقاومة على التوالي مع ملف ومكثف على التوازي"),
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "احسب ممانعتي L1 و C1، ثم ممانعتهما على التوازي.", answer: Cx.div(Cx.mul(Z(0, 4), Z(0, -8)), Cx.add(Z(0, 4), Z(0, -8))), units: OHM,
          diagnose: [{ value: Z(0, -4), type: "conceptual", why: "جمعت الممانعتين (j4 − j8) كأنهما على التوالي. هما على التوازي." }, { value: Z(0, -8 / 3), type: "sign", why: "استخدمت +j8 للمكثف في المقام. ممانعة المكثف −j8." }],
          hints: [eqi("Z<sub>L</sub> = j4") + "، " + eqi("Z<sub>C</sub> = −j8") + ".", eqi("(j4)(−j8) / (j4 − j8)")], solution: eqi("32 / (−j4) = j8 Ω") },
        { id: "s2", kind: "phasor", form: "rect", label: "احسب <span class='ltr'>Z<sub>ab</sub></span>.", answer: zp5, units: OHM,
          diagnose: [{ value: Z(6, -4), type: "conceptual", why: "أضفت مجموع الممانعتين j4 − j8 بدل مكافئهما على التوازي." }], hints: ["R1 على التوالي مع مجموعة التوازي."], solution: eqi("Z<sub>ab</sub> = 6 + j8 Ω") },
        { id: "s3", kind: "phasor", form: "polar", label: "اكتب <span class='ltr'>Z<sub>ab</sub></span> بالشكل القطبي.", answer: zp5, units: OHM, diagnose: [], hints: [eqi("√(36 + 64) ∠ tan⁻¹(8/6)")], solution: eqi("Z<sub>ab</sub> = 10∠53.13° Ω") }
      ]
    },
    generator: { title: "تمارين مولّدة: الممانعة المكافئة", ackinds: ["acZ"], families: ["ladder", "grid"] },
    lab: { title: "قياس الممانعة", desc: "في المعمل الذكي ستقيس مقدار الممانعة بقسمة جهد المصدر على التيار عند ترددات مختلفة." }
  };

  /* ================= 6. Source transformations, Thévenin–Norton ================= */
  var t6 = { rows: 2, cols: 3, omega: W0, edges: [E([0, 0], [1, 0], "V", 10, { phase: 0, plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 4, { name: "R1" }), E([0, 1], [1, 1], "C", 1 / 4000, { name: "C1" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "T", 0, { name: "ab" })].concat(b3()) };
  var pr6 = AC.port(t6);
  L["c1-sinusoidal-6"] = {
    id: "c1-sinusoidal-6", ar: "تحويل المصادر ومكافئ ثيفنن-نورتن", en: "Source Transformations and Thévenin-Norton Equivalent Circuits", minutes: 25,
    objectives: ["تطبق تحويل المصادر بالفيزورات.", "تحسب V<sub>Th</sub> و Z<sub>Th</sub> لشبكة تيار متردد.", "تحسب I<sub>N</sub>."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>نفس قواعد الفصل الرابع: مصدر جهد V<sub>s</sub> مع ممانعة Z على التوالي يكافئ مصدر تيار <span class='ltr'>V<sub>s</sub>/Z</span> مع Z على التوازي. ومكافئ ثيفنن: <span class='ltr'>V<sub>Th</sub></span> فيزور جهد الدائرة المفتوحة، و <span class='ltr'>Z<sub>Th</sub></span> الممانعة المكافئة بعد إطفاء المصادر المستقلة.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>I<sub>s</sub> = V<sub>s</sub> / Z</div><div class='eq'>I<sub>N</sub> = V<sub>Th</sub> / Z<sub>Th</sub></div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>Z<sub>Th</sub> عدد مركب: احتفظ بجزئيه، فهما يحددان الحمل المناسب لاحقًا.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>حوّل <span class='ltr'>20∠0° V</span> مع <span class='ltr'>4 + j4 Ω</span>.</p><ol class='steps'><li>" + eqi("I<sub>s</sub> = 20 / (5.657∠45°) = 3.536∠−45° A") + " على التوازي مع 4 + j4 Ω.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مكافئ ثيفنن لشبكة الكهرباء عند نقطة ما يحدد تيار القصر المتوقع، ومنه تُختار سعة القواطع الكهربائية.</p>" }
    ],
    quiz: [{ q: "V<sub>Th</sub> = 10∠0° و Z<sub>Th</sub> = 2∠−30°. تيار نورتن:", options: [{ t: "<span class='ltr'>5∠30° A</span>", correct: true, why: "قسمة المقادير وطرح الزوايا." }, { t: "<span class='ltr'>5∠−30° A</span>", type: "sign", why: "عند القسمة نطرح زاوية المقام: 0 − (−30) = +30." }] }],
    practice: {
      prompt: "أوجد مكافئ ثيفنن ونورتن بين a و b.",
      figure: fig(t6, "مصدر جهد ومقاومة ومكثف بين الطرفين a و b"),
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "احسب ممانعة المكثف.", answer: Z(0, -4), units: OHM, diagnose: [], hints: [eqi("−j/(ωC)") + " مع " + eqi("C = 250 µF")], solution: eqi("Z<sub>C</sub> = −j4 Ω") },
        { id: "s2", kind: "phasor", form: "polar", label: "احسب <span class='ltr'>V<sub>Th</sub></span> (الطرف a موجب).", answer: pr6.voc, units: V,
          diagnose: [{ value: Z(10, 0), type: "conceptual", why: "V<sub>Th</sub> ليس جهد المصدر؛ هو جهد المكثف بقسمة الجهد." }, { value: Cx.div(Cx.mul(Z(10), Z(4)), Z(4, -4)), type: "substitution", why: "هذا جهد R1. الطرفان على المكثف، فضع Z<sub>C</sub> في البسط." }],
          hints: [eqi("V<sub>Th</sub> = 10 × (−j4) / (4 − j4)")], solution: eqi("V<sub>Th</sub> = 7.071∠−45° V") },
        { id: "s3", kind: "phasor", form: "rect", label: "احسب <span class='ltr'>Z<sub>Th</sub></span>.", answer: pr6.zth, units: OHM,
          diagnose: [{ value: Z(4, -4), type: "conceptual", why: "جمعت R1 و Z<sub>C</sub> على التوالي. بعد إطفاء المصدر (قصر) يصبحان على التوازي بالنسبة للطرفين." }],
          hints: [eqi("4 ∥ (−j4)")], solution: eqi("Z<sub>Th</sub> = 4(−j4)/(4 − j4) = 2 − j2 Ω") },
        { id: "s4", kind: "phasor", form: "polar", label: "احسب <span class='ltr'>I<sub>N</sub></span>.", answer: Cx.div(pr6.voc, pr6.zth), units: A, diagnose: [], hints: [eqi("V<sub>Th</sub>/Z<sub>Th</sub>")], solution: eqi("I<sub>N</sub> = 7.071∠−45° / 2.828∠−45° = 2.5∠0° A") }
      ]
    },
    generator: { title: "تمارين مولّدة: ثيفنن في التيار المتردد", ackinds: ["acVth", "acZth"], families: ["ladder", "grid"] },
    lab: { title: "مكافئ ثيفنن بالقياس", desc: "في المعمل الذكي ستقيس جهد الدائرة المفتوحة والتيار مع حمل معلوم، وتستنتج Z<sub>Th</sub>." }
  };

  /* ================= 7. Node-voltage method ================= */
  function nodeCkt(Vs, r1, x1, x2, r2) { return { rows: 2, cols: 3, omega: W0, edges: [E([0, 0], [1, 0], "V", Vs, { phase: 0, plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", r1, { name: "R1" }), E([0, 1], [1, 1], "L", x1 / W0, { name: "L1" }), E([0, 1], [0, 2], "C", 1 / (W0 * x2), { name: "C1" }), E([0, 2], [1, 2], "R", r2, { name: "R2" })].concat(b3()) }; }
  var n7ex = nodeCkt(10, 2, 2, 6, 4), n7 = nodeCkt(10, 2, 2, 3, 3);
  [n7ex, n7].forEach(function (c) { c.nodeLabels = AN.nodeLabels(c, { only: [[0, 1], [0, 2]] }); c.showGround = true; });
  var s7 = acs(n7);
  L["c1-sinusoidal-7"] = {
    id: "c1-sinusoidal-7", ar: "طريقة جهود العقد", en: "The Node-Voltage Method", minutes: 30,
    objectives: ["تكتب معادلات العقد بالممانعات.", "تحل نظام معادلات مركّب.", "تحسب تيارات الفروع من جهود العقد."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>نفس طريقة الفصل الرابع، مع استبدال R بـ Z وكل القيم بفيزورات: <span class='eq-i'>Σ (Vₖ − Vⱼ)/Z = 0</span>. الحل يحتاج حساب أعداد مركبة، فرتّب المعادلات في مصفوفة إن أمكن.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>Σ (Vₖ − Vⱼ) / Zₖⱼ + Σ I<sub>out</sub> = 0</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>استخدم الموصلية Y = 1/Z لتسهيل المعادلات: 1/(jX) = −j/X.</li><li>تحقق من الحل بالتعويض في معادلة واحدة على الأقل.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(n7ex, "دائرة تيار متردد بعقدتين") + "<p class='q'>Vs = 10∠0° V، R1 = 2 Ω، Z<sub>L</sub> = j2، Z<sub>C</sub> = −j6، R2 = 4 Ω.</p><ol class='steps'><li>" + eqi("(V₁ − 10)/2 + V₁/(j2) + (V₁ − V₂)/(−j6) = 0") + "</li><li>" + eqi("(V₂ − V₁)/(−j6) + V₂/4 = 0") + "</li><li>" + eqi("V₁ = 6 + j4 V , V₂ = j4 V") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>دراسات تدفق الأحمال في شبكات الكهرباء الكبيرة (Load flow) هي معادلات عقد بفيزورات لآلاف العقد، تحلها برامج متخصصة كل بضع دقائق.</p>" }
    ],
    quiz: [{ q: "موصلية ملف ممانعته j4 Ω:", options: [{ t: "<span class='ltr'>−j0.25 S</span>", correct: true, why: "1/(j4) = −j/4." }, { t: "<span class='ltr'>j0.25 S</span>", type: "sign", why: "1/j = −j." }] }],
    practice: {
      prompt: "Vs = 10∠0° V، R1 = 2 Ω، L1 بممانعة j2 Ω، C1 بممانعة −j3 Ω، R2 = 3 Ω (عند ω = 1000 rad/s).",
      figure: fig(n7, "دائرة تيار متردد بعقدتين V1 و V2"),
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "احسب <span class='ltr'>V₁</span>.", answer: s7.volt([0, 1]), units: V,
          diagnose: [{ value: AC.solve(n7, { capSign: true }).volt([0, 1]), type: "sign", why: "استخدمت +j3 لممانعة المكثف. الصحيح −j3." }],
          hints: ["عند V₂: " + eqi("(V₂ − V₁)/(−j3) + V₂/3 = 0") + " → " + eqi("V₂ = V₁ / (1 − j)") + ".", "عوّض في معادلة V₁: " + eqi("(V₁ − 10)/2 + V₁/(j2) + (V₁ − V₂)/(−j3) = 0") + "."], solution: eqi("V₁ = " + AC.rect(s7.volt([0, 1])) + " V") },
        { id: "s2", kind: "phasor", form: "rect", label: "احسب <span class='ltr'>V₂</span>.", answer: s7.volt([0, 2]), units: V, diagnose: [{ value: s7.volt([0, 1]), type: "substitution", why: "هذه قيمة V₁." }], hints: ["من معادلة العقدة الثانية."], solution: eqi("V₂ = " + AC.rect(s7.volt([0, 2])) + " V") },
        { id: "s3", kind: "phasor", form: "polar", label: "احسب فيزور تيار R2 (للأسفل).", answer: s7.byName.R2.i, units: A, diagnose: [], hints: [eqi("I = V₂ / 3")], solution: eqi("I = " + AC.polar(s7.byName.R2.i, "A")) }
      ]
    },
    generator: { title: "تمارين مولّدة: جهود العقد في التيار المتردد", ackinds: ["acVN"], families: ["ladder", "grid"] },
    lab: { title: "جهود العقد بالأوسيلوسكوب", desc: "في المعمل الذكي ستقيس مقدار وطور جهد كل عقدة بالنسبة لجهد المصدر." }
  };

  /* ================= 8. Mesh-current method ================= */
  function meshCkt(Vs, r1, x1, r2, x2) { return { rows: 2, cols: 3, omega: W0, edges: [E([0, 0], [1, 0], "V", Vs, { phase: 0, plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", r1, { name: "R1" }), E([0, 1], [1, 1], "L", x1 / W0, { name: "L1" }), E([0, 1], [0, 2], "R", r2, { name: "R2" }), E([0, 2], [1, 2], "C", 1 / (W0 * x2), { name: "C1" })].concat(b3()) }; }
  var m8ex = meshCkt(10, 3, 2, 4, 2), m8 = meshCkt(10, 2, 2, 3, 3);
  m8ex.meshLabels = AC.meshes(m8ex, acs(m8ex)); var mm8 = AC.meshes(m8, acs(m8)); m8.meshLabels = mm8;
  L["c1-sinusoidal-8"] = {
    id: "c1-sinusoidal-8", ar: "طريقة تيارات الحلقات", en: "The Mesh-Current Method", minutes: 30,
    objectives: ["تكتب KVL لكل حلقة بالممانعات.", "تحل المعادلات المركبة.", "تحسب تيار الفرع المشترك."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>نفس طريقة الحلقات في الفصل الرابع: لكل حلقة تيار فيزور مع عقارب الساعة، و KVL بالممانعات: <span class='eq-i'>Σ Z(Iₖ − Iⱼ) = Σ V<sub>s</sub></span>.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>[Z][I] = [V]</div><p class='muted'>العنصر القطري في مصفوفة Z = مجموع ممانعات الحلقة، والعنصر خارج القطر = سالب الممانعة المشتركة.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>اكتب المعادلات بصيغة المصفوفة؛ تقل أخطاء الإشارة.</li><li>للحل اليدوي: طريقة كرامر مع محددات 2×2 مركّبة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: fig(m8ex, "دائرة تيار متردد بحلقتين") + "<p class='q'>Vs = 10∠0°، R1 = 3، Z<sub>L</sub> = j2، R2 = 4، Z<sub>C</sub> = −j2.</p><ol class='steps'><li>" + eqi("(3 + j2)I₁ − j2 I₂ = 10") + "</li><li>" + eqi("−j2 I₁ + (j2 + 4 − j2)I₂ = 0 → I₂ = j0.5 I₁") + "</li><li>" + eqi("I₁ = 2 − j1 A , I₂ = 0.5 + j1 A") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>دوائر المرشحات في أجهزة الراديو تُحلل بالحلقات لحساب التيار في الهوائي أو في مرحلة التكبير عند كل تردد.</p>" }
    ],
    quiz: [{ q: "الفرع المشترك بين حلقتين فيه ملف j5. حدّه في معادلة الحلقة الأولى:", options: [{ t: "<span class='ltr'>j5(I₁ − I₂)</span>", correct: true, why: "تيار الفرع المشترك في اتجاه I₁ هو I₁ − I₂." }, { t: "<span class='ltr'>j5 I₁</span>", type: "conceptual", why: "الفرع مشترك." }] }],
    practice: {
      prompt: "Vs = 10∠0° V، R1 = 2 Ω، L1 بممانعة j2 Ω (مشتركة)، R2 = 3 Ω، C1 بممانعة −j3 Ω.",
      figure: fig(m8, "دائرة تيار متردد بحلقتين I1 و I2"),
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "احسب <span class='ltr'>I₁</span>.", answer: mm8[0].value, units: A,
          diagnose: [{ value: AC.meshes(m8, AC.solve(m8, { capSign: true }))[0].value, type: "sign", why: "استخدمت +j3 لممانعة المكثف. الصحيح −j3." }],
          hints: ["الحلقة 1: " + eqi("(2 + j2)I₁ − j2 I₂ = 10") + ".", "الحلقة 2: " + eqi("−j2 I₁ + (j2 + 3 − j3)I₂ = 0") + "."], solution: eqi("I₁ = " + AC.rect(mm8[0].value) + " A") },
        { id: "s2", kind: "phasor", form: "rect", label: "احسب <span class='ltr'>I₂</span>.", answer: mm8[1].value, units: A, diagnose: [], hints: [eqi("I₂ = j2 I₁ / (3 − j1)")], solution: eqi("I₂ = " + AC.rect(mm8[1].value) + " A") },
        { id: "s3", kind: "phasor", form: "polar", label: "احسب فيزور تيار الملف L1 (للأسفل).", answer: Cx.sub(mm8[0].value, mm8[1].value), units: A,
          diagnose: [{ value: Cx.add(mm8[0].value, mm8[1].value), type: "sign", why: "جمعت تياري الحلقتين. في الفرع المشترك: I₁ − I₂." }], hints: [eqi("I₁ − I₂")], solution: eqi("I = " + AC.polar(Cx.sub(mm8[0].value, mm8[1].value), "A")) }
      ]
    },
    generator: { title: "تمارين مولّدة: تيارات الحلقات في التيار المتردد", ackinds: ["acIM"], families: ["ladder", "grid"] },
    lab: { title: "تيارات الحلقات", desc: "في المعمل الذكي ستقيس تيار الفرع المشترك ومقداره وطوره، وتقارنه بـ I₁ − I₂." }
  };

  /* ================= 9. Phasor diagrams ================= */
  var Iex = Cx.div(Z(100), Z(6, 8)), VRex = Cx.scale(Iex, 6), VLex = Cx.mul(Iex, Z(0, 8));
  var I9 = Cx.div(Z(50), Z(3, -4)), VR9 = Cx.scale(I9, 3), VC9 = Cx.mul(I9, Z(0, -4));
  L["c1-sinusoidal-9"] = {
    id: "c1-sinusoidal-9", ar: "المخططات الفيزورية", en: "Phasor Diagrams", minutes: 20,
    objectives: ["ترسم الفيزورات كمتجهات في المستوى المركب.", "تقرأ من المخطط هل الدائرة حثية أم سعوية.", "تتحقق من KVL هندسيًا."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>المخطط الفيزوري يرسم كل فيزور كسهم من نقطة الأصل، طوله المقدار وزاويته الطور. يعطيك صورة فورية: من يسبق من، وكيف تجمع الجهود.</p>" + diagram([{ z: Cx.scale(Iex, 3), label: "I (×3)", cls: "pd-i", dx: -58, dy: -8 }, { z: VRex, label: "V_R", cls: "" }, { z: VLex, label: "V_L", cls: "pd-o" }, { z: Z(100), label: "V", cls: "pd-g" }], "مخطط فيزوري لدائرة RL") + "<p class='muted'>دائرة RL على التوالي: V<sub>R</sub> في طور التيار، و V<sub>L</sub> تسبقه بـ 90°، ومجموعهما V. (سهم التيار مكبّر للتوضيح.)</p>" },
      { id: "laws", title: "القواعد", en: "Rules", html: "<ul class='ticks'><li>في التوالي: ارسم التيار مرجعًا، ثم الجهود.</li><li>في التوازي: ارسم الجهد مرجعًا، ثم التيارات.</li><li>التيار يتأخر عن جهد المصدر ← دائرة حثية. يسبقه ← سعوية.</li></ul>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>للتحقق السريع من الحل: هل اتجاه الأسهم منطقي؟</li><li>لتصحيح معامل القدرة في الفصل القادم.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>RL توالي: V = 100∠0° V، R = 6 Ω، X<sub>L</sub> = 8 Ω.</p><ol class='steps'><li>" + eqi("I = 100 / (6 + j8) = 10∠−53.13° A") + "</li><li>" + eqi("V<sub>R</sub> = 60∠−53.13° V") + "، " + eqi("V<sub>L</sub> = 80∠36.87° V") + "</li><li>التيار يتأخر 53.13° عن المصدر: دائرة حثية.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>أجهزة تحليل جودة الطاقة في المصانع تعرض مخططًا فيزوريًا مباشرًا للجهود والتيارات الثلاثة، فيرى المهندس فورًا إن كان الحمل حثيًا ويحتاج مكثفات تصحيح.</p>" }
    ],
    quiz: [{ q: "في مخطط فيزوري، التيار يسبق جهد المصدر بـ 30°. الدائرة:", options: [{ t: "سعوية", correct: true, why: "التيار يسبق في الدوائر السعوية." }, { t: "حثية", type: "sign", why: "في الحثية يتأخر التيار." }] }],
    practice: {
      prompt: "دائرة RC على التوالي: <span class='ltr'>V = 50∠0° V</span>، <span class='ltr'>R = 3 Ω</span>، <span class='ltr'>X<sub>C</sub> = 4 Ω</span>.",
      steps: [
        { id: "s1", kind: "phasor", form: "polar", label: "احسب فيزور التيار.", answer: I9, units: A, diagnose: [], hints: [eqi("I = 50 / (3 − j4)")], solution: eqi("I = 50 / 5∠−53.13° = 10∠53.13° A") },
        { id: "s2", kind: "phasor", form: "polar", label: "احسب فيزور جهد المكثف.", answer: VC9, units: V,
          diagnose: [{ value: Cx.scale(I9, 4), type: "conceptual", why: "ضربت في 4 بدون −j. جهد المكثف يتأخر 90° عن تياره." }], hints: [eqi("V<sub>C</sub> = (−j4) I")], solution: eqi("V<sub>C</sub> = 4∠−90° × 10∠53.13° = 40∠−36.87° V") },
        { id: "s3", kind: "choice", label: "في المخطط الفيزوري لهذه الدائرة:", options: [
          { t: "التيار يسبق جهد المصدر بـ 53.13°", correct: true }, { t: "التيار يتأخر عن جهد المصدر بـ 53.13°", type: "sign", why: "زاوية التيار +53.13° وجهد المصدر 0°، فالتيار يسبق: دائرة سعوية." } ],
          hints: ["قارن زاوية التيار بزاوية المصدر."], solution: "التيار يسبق: الدائرة سعوية." }
      ]
    },
    generator: { title: "تمارين مولّدة: فيزورات العناصر", ackinds: ["acI", "acV"], families: ["loop", "ladder"] },
    lab: { title: "رسم المخطط من القياس", desc: "في المعمل الذكي ستقيس مقادير وأطوار الجهود في دائرة RC وترسم مخططها الفيزوري." }
  };
})();
