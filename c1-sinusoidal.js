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
  /* Lecture circuits (Dr. Abdullah Noman, Ch. 9). Numbers are checked when the file loads (and recomputed in Python when written). */
  var chkC = function (got, mag, ang, what) { if (Math.abs(Cx.abs(got) - mag) > 0.002 * Math.max(1, mag) || (mag > 1e-9 && Math.abs(((Cx.arg(got) - ang + 540) % 360) - 180) > 0.02)) throw new Error("lesson number mismatch: " + what + " = " + Cx.abs(got) + "∠" + Cx.arg(got)); };

  L["c1-sinusoidal-1"] = {
    id: "c1-sinusoidal-1", ar: "المصدر الجيبي", en: "The Sinusoidal Source", minutes: 20,
    objectives: ["تقرأ من دالة الجهد الجيبي: القيمة العظمى، والتردد، والزاوية.", "تحوّل بين ω و f والدورة T.", "تحسب القيمة الفعالة (rms)."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>ندرس الآن دوائر تغذيها مصادر <b>متغيرة جيبيًا</b> مع الزمن. ولهذا أهمية كبيرة: (1) توليد الطاقة الكهربائية ونقلها وتوزيعها واستهلاكها يتم كله في حالة جيبية مستقرة. (2) فهم السلوك الجيبي يمكّننا من التنبؤ بسلوك الدوائر. (3) الحالة الجيبية المستقرة تبسّط تصميم الأنظمة الكهربائية.</p>" +
        "<p>والجميل أن كل طرق التحليل من الفصول السابقة تصلح هنا أيضًا.</p>" +
        "<p>المصدر الجيبي (مستقل أو تابع) يعطي جهدًا أو تيارًا يتغير جيبيًا مع الزمن. نستخدم دالة <b>جيب التمام</b> دائمًا:</p>" +
        "<div class='eq'>v = V<sub>m</sub> cos(ωt + φ)</div>" +
        "<p>V<sub>m</sub> القيمة العظمى (V)، و ω التردد الزاوي (rad/s)، و T الدورة (s)، و f التردد بالهيرتز (دورة في الثانية)، و φ زاوية الطور بالدرجات.</p>" +
        "<p>القيمة الفعالة <span class='ltr'>(rms)</span>: الجذر التربيعي لمتوسط مربع الدالة خلال دورة. للجهد الجيبي تعتمد فقط على القيمة العظمى، ولا تعتمد على التردد ولا على الزاوية. وأهميتها كبيرة في حسابات القدرة.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>ω = 2πf</div><div class='eq'>f = 1 / T</div><div class='eq'>V<sub>rms</sub> = √( (1/T) ∫ V<sub>m</sub>² cos²(ωt + φ) dt ) = V<sub>m</sub> / √2</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>ωt بالراديان و φ بالدرجات: انتبه لوضع الآلة الحاسبة.</li><li>إذا أعطيت قيمة الدالة عند t = 0 فهي تحدد φ: <span class='eq-i'>v(0) = V<sub>m</sub> cos φ</span>.</li><li>الجهد المكتوب على الأجهزة (220 V) قيمة فعالة، لا عظمى.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 9.1: تيار جيبي قيمته العظمى 20 A، يكمل دورة كاملة في 1 ms، وقيمته عند t = 0 تساوي 10 A. (a) ما التردد بالهيرتز؟ (b) ما التردد بالراديان لكل ثانية؟ (c) اكتب i(t) بدالة cos و φ بالدرجات. (d) ما القيمة الفعالة؟</p>" +
        "<ol class='steps'><li><span class='eq-i'>T = 1 ms ← f = 1/T = 1000 Hz</span></li><li><span class='eq-i'>ω = 2πf = 2000π rad/s</span></li><li><span class='eq-i'>i(0) = 20 cos φ = 10 ← φ = 60°</span>، إذن <span class='eq-i'>i(t) = 20 cos(2000πt + 60°) A</span></li><li><span class='eq-i'>I<sub>rms</sub> = 20/√2 = 14.14 A</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>شبكة الكهرباء في السعودية تعمل بتردد 60 Hz، والمقبس المنزلي 220 V فعالة، أي أن قيمته العظمى حوالي 311 V.</p>" }
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
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>الطور</b> <span class='ltr'>(phasor)</span> عدد مركّب يحمل معلومتي القيمة العظمى وزاوية الطور للدالة الجيبية. أساسه متطابقة أويلر:</p>" +
        "<div class='eq'>e<sup>±jθ</sup> = cos θ ± j sin θ</div>" +
        "<p>إذن <span class='eq-i'>v = V<sub>m</sub> cos(ωt + φ) = ℜ{V<sub>m</sub>e<sup>jφ</sup>e<sup>jωt</sup>}</span>، وتمثيل الطور هو <span class='eq-i'>V = 𝒫{V<sub>m</sub> cos(ωt + φ)} = V<sub>m</sub>e<sup>jφ</sup> = V<sub>m</sub>∠φ</span>.</p>" +
        "<p>تحويل الطور ينقل الدالة من <b>المجال الزمني</b> إلى مجال الأعداد المركّبة، ويسمى <b>المجال الترددي</b> لأن الاستجابة تعتمد على ω.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<p>تذكير بالأعداد المركّبة: الشكل القطبي والمستطيل.</p>" +
        "<div class='eq'>Z = a + jb = r∠θ</div><div class='eq'>r = |Z| = √(a² + b²) ، θ = tan⁻¹(b/a)</div><div class='eq'>a = r cos θ ، b = r sin θ</div><div class='eq'>cos θ = sin(θ + 90°) ، sin θ = cos(θ − 90°)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>الجمع والطرح بالشكل المستطيل، والضرب والقسمة بالشكل القطبي.</li><li>حوّل الدالة إلى cos قبل أخذ الطور: sin تُكتب cos(… − 90°).</li><li>الطور لا يحمل ω؛ ω نفسها لكل دوال الدائرة.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>مثال 9.5: إذا كان <span class='eq-i'>y₁ = 20 cos(ωt − 30°)</span> و <span class='eq-i'>y₂ = 40 cos(ωt + 60°)</span>، اكتب <span class='eq-i'>y = y₁ + y₂</span> كدالة جيبية واحدة بطريقة الأطوار.</p>" +
        "<ol class='steps'><li><span class='eq-i'>Y = Y₁ + Y₂ = 20∠−30° + 40∠60°</span></li><li><span class='eq-i'>20∠−30° = 20 cos(−30°) + j20 sin(−30°) = 17.32 − j10</span></li><li><span class='eq-i'>40∠60° = 40 cos 60° + j40 sin 60° = 20 + j34.64</span></li><li><span class='eq-i'>Y = 37.32 + j24.64 = 44.72∠33.43°</span></li><li>التحويل العكسي: <span class='eq-i'>y = 44.72 cos(ωt + 33.43°)</span></li></ol>" +
        "<p class='q'>تمرين 9.1 و 9.2: أوجد الطور، ثم الدالة الزمنية.</p>" +
        "<ol class='steps'><li><span class='eq-i'>v = 170 cos(377t − 40°) V ← V = 170∠−40° V</span></li><li><span class='eq-i'>i = 10 sin(1000t + 20°) A = 10 cos(1000t − 70°) ← I = 10∠−70° A</span></li><li><span class='eq-i'>V = 18.6∠−54° V ← v = 18.6 cos(ωt − 54°) V</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>الآلات الحاسبة العلمية فيها وضع للأعداد المركّبة (CMPLX) يحوّل بين القطبي والمستطيل مباشرة، وهو أسرع طريقة في الاختبار لجمع الأطوار.</p>" }
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
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>العناصر الخاملة R و L و C. نوجد العلاقة بين طور الجهد وطور التيار عند أطراف كل عنصر.</p>" +
        "<p><b>المقاومة:</b> من قانون أوم <span class='eq-i'>V = RI</span>، والجهد والتيار <b>في نفس الطور</b>.</p>" +
        "<p><b>الملف:</b> من <span class='eq-i'>v = L di/dt</span> نحصل على <span class='eq-i'>V = jωL I = ωL I<sub>m</sub>∠(θ<sub>i</sub> + 90°)</span>، أي التيار <b>متأخر</b> عن الجهد بـ 90°.</p>" +
        "<p><b>المكثف:</b> من <span class='eq-i'>i = C dv/dt</span> نحصل على <span class='eq-i'>V = I/(jωC)</span>، أي الجهد متأخر عن التيار بـ 90°: التيار <b>متقدم</b> على الجهد بـ 90°.</p>" +
        "<p><b>المعاوقة</b> Z: <span class='eq-i'>V = ZI</span>. جزؤها التخيلي يسمى <b>المفاعلة</b> (reactance).</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<table class='tbl'><thead><tr><th>العنصر</th><th>المجال الزمني</th><th>المجال الترددي</th><th>المعاوقة Z</th><th>المسامحة Y</th></tr></thead><tbody><tr><td>R</td><td class='ltr'>v = Ri</td><td class='ltr'>V = RI</td><td class='ltr'>R</td><td class='ltr'>1/R</td></tr><tr><td>L</td><td class='ltr'>v = L di/dt</td><td class='ltr'>V = jωL I</td><td class='ltr'>jωL</td><td class='ltr'>1/(jωL)</td></tr><tr><td>C</td><td class='ltr'>i = C dv/dt</td><td class='ltr'>V = I/(jωC)</td><td class='ltr'>1/(jωC)</td><td class='ltr'>jωC</td></tr></tbody></table>" +
        "<div class='eq'>X<sub>L</sub> = ωL</div><div class='eq'>X<sub>C</sub> = −1/(ωC)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>قبل التحليل حوّل كل ملف إلى jωL وكل مكثف إلى −j/(ωC) بقيمة ω من المصدر.</li><li>انتبه للوحدات: mH و µF.</li><li>المفاعلة تتغير مع التردد، أما المقاومة فلا.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>تمرين 9.3: التيار في ملف 20 mH هو <span class='eq-i'>10 cos(10000t + 30°) mA</span>. احسب (a) المفاعلة (b) المعاوقة (c) طور الجهد (d) v(t).</p>" +
        "<ol class='steps'><li><span class='eq-i'>X<sub>L</sub> = ωL = (10⁴)(20 × 10⁻³) = 200 Ω</span></li><li><span class='eq-i'>Z<sub>L</sub> = j200 Ω</span></li><li><span class='eq-i'>V<sub>L</sub> = IZ<sub>L</sub> = (10∠30°)(200∠90°) × 10⁻³ = 2∠120° V</span></li><li><span class='eq-i'>v<sub>L</sub> = 2 cos(10000t + 120°) V</span></li></ol>" +
        "<p class='q'>تمرين 9.4: الجهد على مكثف 5 µF هو <span class='eq-i'>30 cos(4000t + 25°) V</span>. احسب المفاعلة والمعاوقة وطور التيار و i(t).</p>" +
        "<ol class='steps'><li><span class='eq-i'>X<sub>C</sub> = −1/(ωC) = −1/(4000 × 5 × 10⁻⁶) = −50 Ω</span></li><li><span class='eq-i'>Z<sub>C</sub> = −j50 Ω</span></li><li><span class='eq-i'>I = V/Z<sub>C</sub> = 30∠25° / 50∠−90° = 0.6∠115° A</span></li><li><span class='eq-i'>i = 0.6 cos(4000t + 115°) A</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>المكثف يمرر الترددات العالية بسهولة (مفاعلته صغيرة)، والملف يعيقها. لهذا تستخدم سماعات الصوت مكثفًا لتوجيه الترددات العالية إلى السماعة الصغيرة (tweeter).</p>" }
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
  var x96 = { rows: 2, cols: 3, omega: 5000, edges: [E([0, 0], [1, 0], "V", 750, { phase: 30, plus: "a", name: "Vs", vtext: "750∠30° V" }), E([0, 0], [0, 1], "R", 90, { name: "R90" }), E([0, 1], [0, 2], "L", 0.032, { name: "L", vtext: "j160 Ω" }), E([0, 2], [1, 2], "C", 5e-6, { name: "C", vtext: "−j40 Ω" })].concat(b3()) };
  var s96 = acs(x96); chkC(s96.byName.R90.i, 5, -23.13, "9.6 I");

  L["c1-sinusoidal-4"] = {
    id: "c1-sinusoidal-4", ar: "قانونا كيرشوف في المجال الترددي", en: "Kirchhoff’s Laws in the Frequency Domain", minutes: 20,
    objectives: ["تطبق KCL و KVL على الفيزورات.", "تفهم لماذا لا تُجمع المقادير مباشرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>KVL في المجال الترددي:</b> إذا كانت <span class='eq-i'>v₁ + v₂ + … + v<sub>n</sub> = 0</span> حول مسار مغلق في الحالة الجيبية المستقرة، فهي تصبح <span class='eq-i'>V<sub>m1</sub> cos(ωt + θ₁) + … + V<sub>mn</sub> cos(ωt + θ<sub>n</sub>) = 0</span>، وبما أن ω واحدة للجميع: <span class='eq-i'>V₁ + V₂ + … + V<sub>n</sub> = 0</span>.</p>" +
        "<p>وبنفس الطريقة <b>KCL</b>: مجموع أطوار التيارات عند أي عقدة = صفر.</p>" +
        "<p><b>المعاوقات على التوالي:</b> <span class='eq-i'>V<sub>ab</sub> = Z₁I + Z₂I + … + Z<sub>n</sub>I</span>، إذن <span class='eq-i'>Z<sub>ab</sub> = Z₁ + Z₂ + … + Z<sub>n</sub></span>.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>ΣV = 0 حول أي مسار مغلق</div><div class='eq'>ΣI = 0 عند أي عقدة</div><div class='eq'>Z<sub>ab</sub> = Z₁ + Z₂ + … + Z<sub>n</sub> (توالي)</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>القوانين نفسها بأعداد مركّبة: اجمع الأطوار كأعداد مركّبة، لا القيم العظمى.</li><li>مجموع القيم العظمى للجهود لا يساوي جهد المصدر عادة، لأن الزوايا مختلفة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 9.6: مقاومة 90 Ω وملف 32 mH ومكثف 5 µF على التوالي مع <span class='eq-i'>v<sub>s</sub> = 750 cos(5000t + 30°) V</span>. (a) ارسم الدائرة في المجال الترددي. (b) أوجد التيار i بطريقة الأطوار.</p>" +
        fig(x96, "مثال 9.6 في المجال الترددي: 750∠30° V و 90 Ω و j160 Ω و −j40 Ω") +
        "<ol class='steps'><li>من v<sub>s</sub>: ω = 5000 rad/s. <span class='eq-i'>Z<sub>L</sub> = j(5000)(32 × 10⁻³) = j160 Ω</span> ، <span class='eq-i'>Z<sub>C</sub> = −j10⁶/((5000)(5)) = −j40 Ω</span> ، <span class='eq-i'>V<sub>s</sub> = 750∠30° V</span></li><li><span class='eq-i'>Z<sub>ab</sub> = 90 + j160 − j40 = 90 + j120 = 150∠53.13° Ω</span></li><li><span class='eq-i'>I = 750∠30° / 150∠53.13° = 5∠−23.13° A</span></li><li><span class='eq-i'>i = 5 cos(5000t − 23.13°) A</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>المهندس الذي يقيس الجهود في دائرة تيار متردد بالفولتميتر قد يجد أن مجموعها أكبر من جهد المصدر! السبب أن الجهاز يقيس المقدار فقط، بينما KVL يتحقق للأطوار المركّبة.</p>" }
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
  var x97 = { rows: 3, cols: 4, omega: 200000, edges: [E([0, 0], [1, 0], "I", 8, { phase: 0, dir: "ba", name: "Is", vtext: "8∠0° A" }), E([1, 0], [2, 0], "W"), E([0, 0], [0, 1], "W"), E([0, 1], [2, 1], "R", 10, { name: "R10" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "R", 6, { name: "R6" }), E([1, 2], [2, 2], "L", 40e-6, { name: "L", vtext: "j8 Ω" }), E([0, 2], [0, 3], "W"), E([0, 3], [2, 3], "C", 1e-6, { name: "C", vtext: "−j5 Ω" }), E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W"), E([2, 2], [2, 3], "W")] };
  var s97 = acs(x97); chkC(s97.byName.R10.v, 40, -36.87, "9.7 V"); chkC(s97.byName.C.i, 8, 53.13, "9.7 I3");

  L["c1-sinusoidal-5"] = {
    id: "c1-sinusoidal-5", ar: "التبسيط بالتوالي والتوازي و Δ-Y", en: "Series, Parallel, and Delta-to-Wye Simplifications", minutes: 25,
    objectives: ["تجمع الممانعات على التوالي والتوازي.", "تطبق تحويل Δ-Y على الممانعات.", "تحسب الممانعة المكافئة لشبكة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>كل قواعد التبسيط من الفصل الثالث تصلح بالمعاوقات.</p>" +
        "<p><b>التوازي:</b> <span class='eq-i'>1/Z<sub>ab</sub> = 1/Z₁ + 1/Z₂ + … + 1/Z<sub>n</sub></span>، ولمعاوقتين <span class='eq-i'>Z<sub>ab</sub> = Z₁Z₂/(Z₁ + Z₂)</span>. ونستخدم <b>المسامحة</b> <span class='eq-i'>Y = 1/Z = G + jB</span>: جزؤها الحقيقي G الموصلية، والتخيلي B السماحية (susceptance)، وتقاس بالسيمنز.</p>" +
        "<p><b>Δ إلى Y وبالعكس:</b> نفس قوانين المقاومات بالمعاوقات.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>Y = 1/Z = G + jB</div><div class='eq'>Y<sub>ab</sub> = Y₁ + Y₂ + … + Y<sub>n</sub> (توازي)</div><div class='eq'>Z₁ = Z<sub>b</sub>Z<sub>c</sub>/(Z<sub>a</sub> + Z<sub>b</sub> + Z<sub>c</sub>)</div><div class='eq'>Z<sub>a</sub> = (Z₁Z₂ + Z₂Z₃ + Z₃Z₁)/Z₁</div>" +
        "<table class='tbl'><thead><tr><th>العنصر</th><th>المسامحة Y</th><th>السماحية</th></tr></thead><tbody><tr><td>R</td><td>G</td><td>—</td></tr><tr><td>L</td><td class='ltr'>j(−1/ωL)</td><td class='ltr'>−1/ωL</td></tr><tr><td>C</td><td class='ltr'>jωC</td><td class='ltr'>ωC</td></tr></tbody></table>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>مع فروع كثيرة على التوازي اجمع المسامحات، فهو أسهل من قانون التوازي.</li><li>عند Δ و Y انتبه أن الضرب والقسمة لأعداد مركّبة.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>مثال 9.7: مصدر تيار <span class='eq-i'>i<sub>s</sub> = 8 cos 200000t A</span> يغذي ثلاثة فروع على التوازي: 10 Ω، و (6 Ω مع 40 µH)، و 1 µF. أوجد v و i₁ و i₂ و i₃.</p>" +
        fig(x97, "مثال 9.7 في المجال الترددي: 8∠0° A مع 10 Ω و 6 + j8 Ω و −j5 Ω") +
        "<ol class='steps'><li><span class='eq-i'>Z<sub>L</sub> = j(200000)(40 × 10⁻⁶) = j8 Ω</span> ، <span class='eq-i'>Z<sub>C</sub> = −j/((200000)(10⁻⁶)) = −j5 Ω</span></li><li><span class='eq-i'>Y₁ = 1/10 = 0.1 S</span> ، <span class='eq-i'>Y₂ = 1/(6 + j8) = 0.06 − j0.08 S</span> ، <span class='eq-i'>Y₃ = 1/(−j5) = j0.2 S</span></li><li><span class='eq-i'>Y = 0.16 + j0.12 = 0.2∠36.87° S ← Z = 5∠−36.87° Ω</span></li><li><span class='eq-i'>V = ZI = (5∠−36.87°)(8∠0°) = 40∠−36.87° V</span></li><li><span class='eq-i'>I₁ = 4∠−36.87° A ، I₂ = 4∠−90° A ، I₃ = 8∠53.13° A</span></li><li><span class='eq-i'>v = 40 cos(200000t − 36.87°) V</span> ، <span class='eq-i'>i₃ = 8 cos(200000t + 53.13°) A</span></li></ol>" +
        "<p class='q'>مثال 9.8: استخدم تحويل Δ إلى Y لإيجاد I<sub>o</sub> من مصدر 120∠0° V.</p>" +
        "<ol class='steps'><li>نحوّل الدلتا b-c-d (10 Ω، و 20 + j60 Ω، و −j20 Ω، مجموعها 30 + j40 Ω) إلى Y.</li><li>المتصلة بـ b: <span class='eq-i'>Z₁ = (20 + j60)(10)/(30 + j40) = 12 + j4 Ω</span>، وبـ c: <span class='eq-i'>Z₂ = 10(−j20)/(30 + j40) = −3.2 − j2.4 Ω</span>، وبـ d: <span class='eq-i'>Z₃ = (20 + j60)(−j20)/(30 + j40) = 8 − j24 Ω</span></li><li>فرع abn: <span class='eq-i'>−j4 + 12 + j4 = 12 Ω</span>، وفرع acn: <span class='eq-i'>63.2 + j2.4 − 3.2 − j2.4 = 60 Ω</span></li><li><span class='eq-i'>Z = 12 ∥ 60 + 8 − j24 = 10 + 8 − j24 = 18 − j24 Ω</span></li><li><span class='eq-i'>I<sub>o</sub> = 120∠0° / (18 − j24) = 4∠53.13° = 2.4 + j3.2 A</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>شبكات الكهرباء ثلاثية الطور توصّل أحمالها Δ أو Y، والتحويل بينهما بالمعاوقات هو أساس تحليلها في سيركت 2.</p>" }
    ],
    quiz: [{ q: "ممانعتان <span class='ltr'>3 + j4</span> و <span class='ltr'>3 − j4</span> على التوالي:", options: [{ t: "<span class='ltr'>6 Ω</span>", correct: true, why: "الجزءان التخيليان يلغي أحدهما الآخر." }, { t: "<span class='ltr'>10 Ω</span>", type: "conceptual", why: "جمعت المقادير 5 + 5." }] }],
    practice: {
      prompt: "احسب الممانعة المكافئة بين a و b.",
      circuit: z5, figure: fig(z5, "مقاومة على التوالي مع ملف ومكثف على التوازي"),
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
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p><b>تحويل المصادر</b> في المجال الترددي: مصدر جهد V<sub>s</sub> على التوالي مع معاوقة Z<sub>s</sub> يكافئ مصدر تيار I<sub>s</sub> على التوازي مع نفس المعاوقة، حيث <span class='eq-i'>V<sub>s</sub> = Z<sub>s</sub>I<sub>s</sub></span>.</p>" +
        "<p><b>ثيفنن ونورتن:</b> أي دائرة خطية في المجال الترددي (فيها مصادر مستقلة وتابعة) تكافئ بالنسبة للطرفين a و b مصدر جهد V<sub>Th</sub> مع معاوقة Z<sub>Th</sub>، أو مصدر تيار I<sub>N</sub> مع Z<sub>N</sub>. وطرق حساب Z<sub>Th</sub> هي نفسها من الفصل السابق (i<sub>sc</sub>، أو مصدر الاختبار).</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>V<sub>s</sub> = Z<sub>s</sub>I<sub>s</sub> ، I<sub>s</sub> = V<sub>s</sub>/Z<sub>s</sub></div><div class='eq'>Z<sub>Th</sub> = V<sub>Th</sub>/I<sub>sc</sub></div><div class='eq'>Z<sub>N</sub> = Z<sub>Th</sub> ، I<sub>N</sub> = I<sub>sc</sub></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>نفس خطوات الفصل الرابع، لكن بالأعداد المركّبة.</li><li>مع المصادر التابعة استخدم i<sub>sc</sub> أو مصدر الاختبار.</li></ul>" },
      { id: "example", title: "أمثلة محلولة", en: "Worked Example", html:
        "<p class='q'>مثال 9.9: استخدم تحويل المصادر لإيجاد الطور V<sub>o</sub> (مصدر 40∠0° V).</p>" +
        "<ol class='steps'><li>40∠0° V مع (1 + j3) Ω ← مصدر تيار <span class='eq-i'>I = 40/(1 + j3) = 4 − j12 A</span> على التوازي مع (1 + j3) Ω.</li><li>فرعان على التوازي: <span class='eq-i'>Z = (1 + j3)(9 − j3)/10 = 1.8 + j2.4 Ω</span></li><li>نعيد التحويل إلى مصدر جهد: <span class='eq-i'>(4 − j12)(1.8 + j2.4) = 36 − j12 V</span> على التوالي مع 1.8 + j2.4 Ω، ثم مع 0.2 + j0.6 Ω: المجموع 2 + j3 Ω.</li><li>قسمة الجهد على فرع الخرج (10 − j19) Ω: <span class='eq-i'>V<sub>o</sub> = (36 − j12)(10 − j19)/(12 − j16) = 36.12 − j18.84 V</span></li></ol>" +
        "<p class='q'>مثال 9.10: أوجد مكافئ ثيفنن بالنسبة للطرفين a و b (مصدر 120∠0° V، و 12 Ω و 60 Ω، و −j40 Ω، و 120 Ω، ومصدر جهد تابع 10V<sub>x</sub>).</p>" +
        "<ol class='steps'><li>تحويل 120 V مع 12 Ω إلى 10 A مع 12 Ω، ثم <span class='eq-i'>12 ∥ 60 = 10 Ω</span>، ونعيده مصدر 100 V مع 10 Ω.</li><li>KVL: <span class='eq-i'>100 = 10I − j40I + 120I + 10V<sub>x</sub></span> مع <span class='eq-i'>V<sub>x</sub> = 100 − 10I</span> ← <span class='eq-i'>I = −900/(30 − j40) = 18∠−126.87° A</span></li><li><span class='eq-i'>V<sub>x</sub> = 100 − 180∠−126.87° = 208 + j144 V</span></li><li><span class='eq-i'>V<sub>Th</sub> = 10V<sub>x</sub> + 120I = 784 − j288 = 835.22∠−20.17° V</span></li><li>بمصدر اختبار بين a و b (بعد تعطيل 120 V): <span class='eq-i'>Z<sub>Th</sub> = V<sub>T</sub>/I<sub>T</sub> = 91.2 − j38.4 Ω</span></li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>عند تحليل مشكلة في شبكة كهرباء عند نقطة معينة، يمثل المهندسون كل الشبكة خلفها بمكافئ ثيفنن (جهد ومعاوقة)، ومنه يحسبون تيار القصر عند تلك النقطة لاختيار القواطع.</p>" }
    ],
    quiz: [{ q: "V<sub>Th</sub> = 10∠0° و Z<sub>Th</sub> = 2∠−30°. تيار نورتن:", options: [{ t: "<span class='ltr'>5∠30° A</span>", correct: true, why: "قسمة المقادير وطرح الزوايا." }, { t: "<span class='ltr'>5∠−30° A</span>", type: "sign", why: "عند القسمة نطرح زاوية المقام: 0 − (−30) = +30." }] }],
    practice: {
      prompt: "أوجد مكافئ ثيفنن ونورتن بين a و b.",
      circuit: t6, figure: fig(t6, "مصدر جهد ومقاومة ومكثف بين الطرفين a و b"),
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
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>طريقة جهود العقد في المجال الترددي هي نفسها: نختار مرجعًا، ونكتب KCL عند كل عقدة أساسية بالأطوار والمعاوقات، ومع المصدر التابع نضيف معادلة القيد.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>Σ (V<sub>k</sub> − V<sub>j</sub>)/Z = 0 عند كل عقدة</div><div class='eq'>+ معادلة القيد للمصدر التابع</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>حوّل الدائرة أولًا إلى المجال الترددي.</li><li>رتّب المعادلات بالشكل القياسي ثم حلها كأعداد مركّبة (الآلة الحاسبة في وضع CMPLX).</li><li>تحقق بـ KCL بعد الحل.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 9.11: استخدم طريقة جهود العقد لإيجاد I<sub>a</sub> و I<sub>b</sub> و I<sub>c</sub> (مصدر 10.6∠0° A، و 10 Ω، و 1 + j2 Ω، و −j5 Ω، و 5 Ω، ومصدر جهد تابع 20I<sub>x</sub>).</p>" +
        "<ol class='steps'><li>عقدتان أساسيتان غير مرجعيتين V₁ و V₂.</li><li>العقدة 1: <span class='eq-i'>−10.6 + V₁/10 + (V₁ − V₂)/(1 + j2) = 0 ← V₁(1.1 + j0.2) − V₂ = 10.6 + j21.2</span></li><li>العقدة 2: <span class='eq-i'>(V₂ − V₁)/(1 + j2) + V₂/(−j5) + (V₂ − 20I<sub>x</sub>)/5 = 0</span> مع القيد <span class='eq-i'>I<sub>x</sub> = (V₁ − V₂)/(1 + j2)</span> ← <span class='eq-i'>−5V₁ + (4.8 + j0.6)V₂ = 0</span></li><li><span class='eq-i'>V₁ = 68.40 − j16.80 V ، V₂ = 68 − j26 V</span></li><li><span class='eq-i'>I<sub>a</sub> = V₁/10 = 6.84 − j1.68 A</span> ، <span class='eq-i'>I<sub>x</sub> = 3.76 + j1.68 A</span></li><li><span class='eq-i'>I<sub>b</sub> = (V₂ − 20I<sub>x</sub>)/5 = −1.44 − j11.92 A</span> ، <span class='eq-i'>I<sub>c</sub> = V₂/(−j5) = 5.2 + j13.6 A</span></li><li>التحقق: <span class='eq-i'>I<sub>a</sub> + I<sub>x</sub> = 10.6 A</span> ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>برامج تحليل شبكات القدرة (load flow) تحل معادلات العقد بالأطوار لآلاف العقد في نفس الوقت، وهي نفس الطريقة التي في هذا الدرس.</p>" }
    ],
    quiz: [{ q: "موصلية ملف ممانعته j4 Ω:", options: [{ t: "<span class='ltr'>−j0.25 S</span>", correct: true, why: "1/(j4) = −j/4." }, { t: "<span class='ltr'>j0.25 S</span>", type: "sign", why: "1/j = −j." }] }],
    practice: {
      prompt: "Vs = 10∠0° V، R1 = 2 Ω، L1 بممانعة j2 Ω، C1 بممانعة −j3 Ω، R2 = 3 Ω (عند ω = 1000 rad/s).",
      circuit: n7, figure: fig(n7, "دائرة تيار متردد بعقدتين V1 و V2"),
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
      { id: "concept", title: "الفكرة", en: "Concept", html:
        "<p>طريقة تيارات الحلقات في المجال الترددي: تيار لكل حلقة في اتجاه عقارب الساعة، و KVL حول كل حلقة بالمعاوقات، ومع المصدر التابع نضيف معادلة القيد بدلالة تيارات الحلقات.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html:
        "<div class='eq'>Σ Z·I = Σ V<sub>s</sub> حول كل حلقة</div><div class='eq'>+ القيد: مثل I<sub>x</sub> = I₁ − I₂</div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html:
        "<ul class='ticks'><li>الطريقة مناسبة عندما تكون الحلقات أقل من العقد.</li><li>بعد إيجاد تيارات الحلقات، احسب الجهود المطلوبة بـ V = ZI.</li><li>تحقق بجمع الجهود حول مسار مغلق.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html:
        "<p class='q'>مثال 9.12: استخدم طريقة تيارات الحلقات لإيجاد V₁ و V₂ و V₃ (مصدر 150∠0° V، ومصدر جهد تابع 39I<sub>x</sub>).</p>" +
        "<ol class='steps'><li>حلقتان ومصدر تابع: معادلتان ومعادلة قيد.</li><li>الحلقة 1: <span class='eq-i'>150 = (1 + j2)I₁ + (12 − j16)(I₁ − I₂) ← 150 = (13 − j14)I₁ − (12 − j16)I₂</span></li><li>الحلقة 2: <span class='eq-i'>0 = (12 − j16)(I₂ − I₁) + (1 + j3)I₂ + 39I<sub>x</sub></span> مع <span class='eq-i'>I<sub>x</sub> = I₁ − I₂</span> ← <span class='eq-i'>0 = (27 + j16)I₁ − (26 + j13)I₂</span></li><li><span class='eq-i'>I₁ = −26 − j52 A ، I₂ = −24 − j58 A ، I<sub>x</sub> = −2 + j6 A</span></li><li><span class='eq-i'>V₁ = (1 + j2)I₁ = 78 − j104 V</span> ، <span class='eq-i'>V₂ = (12 − j16)I<sub>x</sub> = 72 + j104 V</span> ، <span class='eq-i'>V₃ = (1 + j3)I₂ = 150 − j130 V</span></li><li>التحقق: <span class='eq-i'>−150 + V₁ + V₂ = −150 + 78 − j104 + 72 + j104 = 0</span> ✓</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html:
        "<p>في دوائر المرشحات (filters) والأجهزة الصوتية يحسب المصممون التيارات بالحلقات عند كل تردد، ليعرفوا كيف تتغير الاستجابة مع التردد.</p>" }
    ],
    quiz: [{ q: "الفرع المشترك بين حلقتين فيه ملف j5. حدّه في معادلة الحلقة الأولى:", options: [{ t: "<span class='ltr'>j5(I₁ − I₂)</span>", correct: true, why: "تيار الفرع المشترك في اتجاه I₁ هو I₁ − I₂." }, { t: "<span class='ltr'>j5 I₁</span>", type: "conceptual", why: "الفرع مشترك." }] }],
    practice: {
      prompt: "Vs = 10∠0° V، R1 = 2 Ω، L1 بممانعة j2 Ω (مشتركة)، R2 = 3 Ω، C1 بممانعة −j3 Ω.",
      circuit: m8, figure: fig(m8, "دائرة تيار متردد بحلقتين I1 و I2"),
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
