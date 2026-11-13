/* Circuits 1 — Chapter 6: Sinusoidal Steady-State Power Calculations (7 lessons, following the course description).
   Phasors in circuit problems are AMPLITUDE (peak) phasors, so powers carry the ½ factor; rms problems are stated as rms.
   Every numeric answer below is computed here from the given data (or by engine/ac.js from the drawn circuit). */
(function () {
  "use strict";
  var CV = window.CV, L = CV.lessons = CV.lessons || {}, AC = CV.ac, Cx = AC.C;
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var fig = function (c, aria) { return "<div class='lfig'>" + CV.draw.render(c, { aria: aria }) + "</div>"; };
  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };
  var P = Cx.polar, Z = Cx.c, D = Math.PI / 180;
  var W = [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }, { l: "kW", f: 1e3 }], VAR = [{ l: "VAR", f: 1 }, { l: "kVAR", f: 1e3 }], VA = [{ l: "VA", f: 1 }, { l: "kVA", f: 1e3 }];
  var A = [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }], OHM = [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }], NONE = [{ l: "—", f: 1 }], RADS = [{ l: "rad/s", f: 1 }];
  var UF = [{ l: "µF", f: 1e-6 }, { l: "mF", f: 1e-3 }, { l: "F", f: 1 }];
  var eqi = function (s) { return "<span class='eq-i'>" + s + "</span>"; };
  var n = function (v) { return CV.num(v); };
  var b3 = function () { return [E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")]; };

  /* v(t), i(t), p(t) over two periods of v */
  function wave(Vm, thv, Im, thi, aria) {
    var Wd = 500, H = 220, x0 = 30, y0 = H / 2, N = 240, pk = Vm * Im, kv = 80 / Math.max(Vm, 1), ki = 80 / Math.max(Im, 1), kp = 80 / pk;
    function path(fn, k) { var s = ""; for (var j = 0; j <= N; j++) { var t = j / N * 4 * Math.PI, x = x0 + j / N * (Wd - x0 - 10), y = y0 - fn(t) * k; s += (j ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); } return s; }
    var v = function (t) { return Vm * Math.cos(t + thv * D); }, i = function (t) { return Im * Math.cos(t + thi * D); };
    var avg = Vm * Im / 2 * Math.cos((thv - thi) * D), ya = y0 - avg * kp;
    return "<div class='pd-wrap'><svg class='pw' viewBox='0 0 " + Wd + " " + H + "' role='img' aria-label='" + aria + "'>" +
      "<line class='pd-ax' x1='" + x0 + "' y1='" + y0 + "' x2='" + (Wd - 6) + "' y2='" + y0 + "'/><line class='pd-ax' x1='" + x0 + "' y1='12' x2='" + x0 + "' y2='" + (H - 12) + "'/>" +
      "<text class='pd-t' x='" + (Wd - 8) + "' y='" + (y0 + 16) + "' text-anchor='end'>ωt</text>" +
      "<path class='pw-c' d='" + path(v, kv) + "'/><path class='pw-c pw-i' d='" + path(i, ki) + "'/><path class='pw-c pw-p' d='" + path(function (t) { return v(t) * i(t); }, kp) + "'/>" +
      "<line class='pw-avg' x1='" + x0 + "' y1='" + ya.toFixed(1) + "' x2='" + (Wd - 10) + "' y2='" + ya.toFixed(1) + "'/></svg>" +
      "<div class='pw-key'><span><i></i>v(t)</span><span><i class='k-i'></i>i(t)</span><span><i class='k-p'></i>p(t) = v·i</span><span><i class='k-a'></i>P (المتوسط)</span></div></div>";
  }

  /* Power triangle: P along Re, Q along Im, S as hypotenuse */
  function triangle(Pv, Qv, aria) {
    var S = 260, H = 180, k = 170 / Math.max(Pv, Math.abs(Qv)), x0 = 40, y0 = Qv >= 0 ? H - 26 : 26, x1 = x0 + Pv * k, y1 = y0 - Qv * k;
    return "<div class='pd-wrap'><svg class='pd' viewBox='0 0 " + S + " " + H + "' role='img' aria-label='" + aria + "'>" +
      "<line class='pd-v pd-g' x1='" + x0 + "' y1='" + y0 + "' x2='" + x1.toFixed(1) + "' y2='" + y0 + "'/>" +
      "<line class='pd-v pd-o' x1='" + x1.toFixed(1) + "' y1='" + y0 + "' x2='" + x1.toFixed(1) + "' y2='" + y1.toFixed(1) + "'/>" +
      "<line class='pd-v pd-i' x1='" + x0 + "' y1='" + y0 + "' x2='" + x1.toFixed(1) + "' y2='" + y1.toFixed(1) + "'/>" +
      "<text class='pd-l pd-g' x='" + ((x0 + x1) / 2).toFixed(1) + "' y='" + (y0 + (Qv >= 0 ? 18 : -8)) + "' text-anchor='middle'>P</text>" +
      "<text class='pd-l pd-o' x='" + (x1 + 8).toFixed(1) + "' y='" + ((y0 + y1) / 2 + 4).toFixed(1) + "'>Q</text>" +
      "<text class='pd-l pd-i' x='" + ((x0 + x1) / 2 - 14).toFixed(1) + "' y='" + ((y0 + y1) / 2 + (Qv >= 0 ? -6 : 14)).toFixed(1) + "' text-anchor='end'>|S|</text>" +
      "<text class='pd-t' x='" + (x0 + 30) + "' y='" + (y0 + (Qv >= 0 ? -6 : 14)) + "'>θ</text></svg></div>";
  }

  /* ================= 1. Instantaneous power ================= */
  var p1 = { Vm: 100, Im: 10, thv: 0, thi: -60, w: 377 };
  p1.P = p1.Vm * p1.Im / 2 * Math.cos((p1.thv - p1.thi) * D);
  p1.amp = p1.Vm * p1.Im / 2;
  L["c1-power-1"] = {
    id: "c1-power-1", ar: "القدرة اللحظية", en: "Instantaneous Power", minutes: 20,
    objectives: ["تكتب p(t) = v(t)·i(t) لعنصر في حالة الاستقرار الجيبي.", "ترى أن p(t) تتذبذب بضعف التردد حول قيمة متوسطة.", "تفسّر القيم السالبة للقدرة اللحظية."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>القدرة اللحظية هي حاصل ضرب الجهد والتيار في كل لحظة: <span class='eq-i'>p(t) = v(t) i(t)</span>، باصطلاح الإشارة السالب (التيار يدخل من الطرف +). إذا كان <span class='ltr'>v = V<sub>m</sub>cos(ωt + θ<sub>v</sub>)</span> و <span class='ltr'>i = I<sub>m</sub>cos(ωt + θ<sub>i</sub>)</span>، فباستخدام متطابقة ضرب جيبي التمام:</p>" + wave(p1.Vm, p1.thv, p1.Im, p1.thi, "منحنيات الجهد والتيار والقدرة اللحظية") + "<p class='muted'>المنحنى البرتقالي p(t) يتذبذب بضعف تردد الجهد، ويصبح سالبًا لفترات قصيرة: في تلك اللحظات يعيد العنصر طاقة مخزنة إلى المصدر.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq'>p(t) = (V<sub>m</sub>I<sub>m</sub>/2) cos(θ<sub>v</sub> − θ<sub>i</sub>) + (V<sub>m</sub>I<sub>m</sub>/2) cos(2ωt + θ<sub>v</sub> + θ<sub>i</sub>)</div><ul class='ticks'><li>الحد الأول ثابت: هو القدرة المتوسطة P.</li><li>الحد الثاني يتذبذب بتردد <span class='ltr'>2ω</span> ومتوسطه صفر.</li><li>أكبر قيمة <span class='ltr'>P + V<sub>m</sub>I<sub>m</sub>/2</span> وأصغر قيمة <span class='ltr'>P − V<sub>m</sub>I<sub>m</sub>/2</span>.</li></ul>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>لفهم ما يحدث داخل الدورة: متى يأخذ العنصر طاقة ومتى يعيدها.</li><li>في التصميم العملي نهتم غالبًا بالمتوسط P (الدرس التالي)، لكن القمم تهم في تحمّل العناصر للإجهاد.</li><li>مقاومة: <span class='ltr'>θ<sub>v</sub> = θ<sub>i</sub></span> فلا تصبح p سالبة أبدًا. ملف أو مكثف مثالي: الفرق 90° فالمتوسط صفر.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>" + eqi("v = 100 cos(377t) V") + " و " + eqi("i = 10 cos(377t − 60°) A") + ". اكتب p(t).</p><ol class='steps'><li>" + eqi("V<sub>m</sub>I<sub>m</sub>/2 = 100 × 10 / 2 = 500") + "</li><li>" + eqi("θ<sub>v</sub> − θ<sub>i</sub> = 0 − (−60°) = 60°") + " ← " + eqi("500 cos 60° = 250 W") + "</li><li>" + eqi("p(t) = 250 + 500 cos(754t − 60°) W") + "</li><li>القيمة العظمى 750 W، والصغرى −250 W.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>القدرة اللحظية في المحرك أحادي الطور تتذبذب بضعف تردد الشبكة (120 Hz في السعودية)، ولهذا تسمع طنينًا من بعض المحولات والمحركات بهذا التردد. أما الأنظمة ثلاثية الطور فمجموع قدراتها اللحظية ثابت، وهذا من أسباب استخدامها في الصناعة.</p>" }
    ],
    quiz: [
      { q: "تردد تذبذب القدرة اللحظية مقارنة بتردد الجهد:", options: [{ t: "الضعف (2ω)", correct: true, why: "حاصل ضرب جيبي تمام بنفس التردد يعطي حدًا بتردد 2ω." }, { t: "نفس التردد ω", type: "conceptual", why: "الضرب cos·cos ينتج cos(2ωt + …) وليس cos(ωt)." }, { t: "النصف ω/2", type: "conceptual", why: "لا يظهر تردد أقل من ω عند الضرب." }] },
      { q: "ملف مثالي في حالة الاستقرار الجيبي. القدرة اللحظية فيه:", options: [{ t: "تتذبذب ومتوسطها صفر", correct: true, why: "θ<sub>v</sub> − θ<sub>i</sub> = 90° فالحد الثابت cos 90° = 0. الملف يخزن الطاقة ويعيدها." }, { t: "ثابتة وموجبة", type: "conceptual", why: "الملف المثالي لا يستهلك طاقة في المتوسط." }, { t: "صفر في كل لحظة", type: "conceptual", why: "p(t) لا تساوي صفرًا لحظيًا؛ متوسطها فقط صفر." }] }
    ],
    practice: {
      prompt: "عنصر جهده <span class='ltr'>v = 100 cos(377t) V</span> وتياره <span class='ltr'>i = 10 cos(377t − 60°) A</span> (باصطلاح الإشارة السالب).",
      steps: [
        { id: "s1", label: "احسب الحد الثابت في p(t) (القدرة المتوسطة).", symbol: "P =", answer: p1.P, units: W, unitDefault: 1,
          diagnose: [{ value: p1.amp, type: "formula", why: "هذا <span class='ltr'>V<sub>m</sub>I<sub>m</sub>/2</span> بدون <span class='ltr'>cos(θ<sub>v</sub> − θ<sub>i</sub>)</span> (أو حاصل <span class='ltr'>V<sub>m</sub>I<sub>m</sub>cos60°</span> بدون ½). الحد الثابت يحتاج الاثنين.", review: R("c1-power-1", "laws", "صيغة p(t)") },
            { value: p1.amp * Math.sin(60 * D), type: "formula", why: "استخدمت sin 60° بدل cos 60°. الحد الثابت فيه جيب التمام." }],
          hints: [eqi("(V<sub>m</sub>I<sub>m</sub>/2) cos(θ<sub>v</sub> − θ<sub>i</sub>)")], solution: eqi("500 cos 60° = 250 W") },
        { id: "s2", label: "احسب أكبر قيمة تصلها p(t).", symbol: "p<sub>max</sub> =", answer: p1.P + p1.amp, units: W, unitDefault: 1,
          diagnose: [{ value: p1.Vm * p1.Im, type: "conceptual", why: "<span class='ltr'>V<sub>m</sub>I<sub>m</sub></span> تتحقق فقط لو بلغ الجهد والتيار قمتيهما في نفس اللحظة، وهذا لا يحدث مع فرق طور 60°." }],
          hints: ["الحد المتذبذب سعته <span class='ltr'>V<sub>m</sub>I<sub>m</sub>/2</span> ويُضاف إلى الحد الثابت."], solution: eqi("250 + 500 = 750 W") },
        { id: "s3", label: "احسب أصغر قيمة تصلها p(t).", symbol: "p<sub>min</sub> =", answer: p1.P - p1.amp, units: W, unitDefault: 1,
          diagnose: [{ value: 0, type: "conceptual", why: "القدرة اللحظية يمكن أن تكون سالبة عندما يعيد العنصر طاقة مخزنة إلى المصدر." }],
          hints: [eqi("P − V<sub>m</sub>I<sub>m</sub>/2")], solution: eqi("250 − 500 = −250 W") + " (العنصر يعيد طاقة للمصدر في هذه اللحظات)" },
        { id: "s4", label: "ما التردد الزاوي لتذبذب p(t)؟", symbol: "ω<sub>p</sub> =", answer: 2 * p1.w, units: RADS,
          diagnose: [{ value: p1.w, type: "conceptual", why: "حاصل ضرب جيبي تمام بتردد ω يعطي حدًا بتردد 2ω.", review: R("c1-power-1", "laws", "الحد المتذبذب") }],
          hints: ["انظر إلى الحد <span class='ltr'>cos(2ωt + …)</span>."], solution: eqi("2 × 377 = 754 rad/s") }
      ]
    },
    generator: { title: "تمارين مولّدة: القدرة المتوسطة في دوائر مختلفة", ackinds: ["acP"], families: ["loop", "ladder"] },
    lab: { title: "القدرة اللحظية على الأوسيلوسكوب", desc: "في المعمل الذكي ستعرض v(t) و i(t) وحاصل ضربهما لحمل RL، وترى تذبذب القدرة بضعف التردد ومتى تصبح سالبة." }
  };

  /* ================= 2. Average and reactive power ================= */
  var p2 = { Vm: 200, Im: 5, thv: 30, thi: -15 };
  p2.th = p2.thv - p2.thi; p2.P = p2.Vm * p2.Im / 2 * Math.cos(p2.th * D); p2.Q = p2.Vm * p2.Im / 2 * Math.sin(p2.th * D);
  L["c1-power-2"] = {
    id: "c1-power-2", ar: "القدرة المتوسطة والقدرة الردية", en: "Average and Reactive Power", minutes: 25,
    objectives: ["تحسب القدرة المتوسطة P والقدرة الردية Q من القيم العظمى والزوايا.", "تحدد إشارة Q للحمل الحثي والسعوي.", "تعرف قدرة R و L و C كل على حدة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>بفك الحد المتذبذب في p(t) نحصل على جزأين: جزء يتذبذب حول P ولا ينزل تحت الصفر (طاقة تُستهلك فعلًا)، وجزء متوسطه صفر سعته Q (طاقة تتبادل ذهابًا وإيابًا بين المصدر وعناصر التخزين).</p><ul class='ticks'><li><b>P</b> القدرة المتوسطة (الفعلية) بوحدة W: تتحول إلى حرارة أو شغل.</li><li><b>Q</b> القدرة الردية (Reactive) بوحدة VAR: لا تنجز شغلًا، لكنها تُحمّل الأسلاك تيارًا.</li></ul>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>P = (V<sub>m</sub>I<sub>m</sub>/2) cos(θ<sub>v</sub> − θ<sub>i</sub>)</div><div class='eq'>Q = (V<sub>m</sub>I<sub>m</sub>/2) sin(θ<sub>v</sub> − θ<sub>i</sub>)</div></div><div class='tbl-wrap'><table class='tbl'><thead><tr><th>العنصر</th><th class='ltr'>θ<sub>v</sub> − θ<sub>i</sub></th><th>P</th><th>Q</th></tr></thead><tbody><tr><td>مقاومة</td><td class='ltr'>0°</td><td class='ltr'>½ I<sub>m</sub>² R</td><td class='ltr'>0</td></tr><tr><td>ملف</td><td class='ltr'>+90°</td><td class='ltr'>0</td><td class='ltr'>+½ I<sub>m</sub>² ωL</td></tr><tr><td>مكثف</td><td class='ltr'>−90°</td><td class='ltr'>0</td><td class='ltr'>−½ I<sub>m</sub>² /(ωC)</td></tr></tbody></table></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>الزاوية دائمًا <b>جهد ناقص تيار</b>: <span class='ltr'>θ<sub>v</sub> − θ<sub>i</sub></span>. عكسها يعكس إشارة Q.</li><li>Q موجبة ← الحمل حثي (يمتص قدرة ردية). Q سالبة ← سعوي (يولّدها).</li><li>مع القيم العظمى يوجد ½ دائمًا. مع القيم الفعالة (الدرس القادم) يختفي.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>" + eqi("v = 200 cos(ωt + 30°) V") + "، " + eqi("i = 5 cos(ωt − 15°) A") + ".</p><ol class='steps'><li>" + eqi("θ = 30° − (−15°) = 45°") + "، " + eqi("V<sub>m</sub>I<sub>m</sub>/2 = 500") + "</li><li>" + eqi("P = 500 cos 45° = 353.6 W") + "</li><li>" + eqi("Q = 500 sin 45° = 353.6 VAR") + " (موجبة: حمل حثي)</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>عدّاد الكهرباء المنزلي يحسب الطاقة الفعلية (kWh) من P فقط، فالمستهلك المنزلي لا يدفع مقابل Q. لكن المصانع الكبيرة قد تُحاسب على القدرة الردية أو على انخفاض معامل القدرة، لأن Q تزيد التيار في شبكة التوزيع وتزيد الفقد فيها.</p>" }
    ],
    quiz: [
      { q: "مكثف مثالي يمتص قدرة ردية:", options: [{ t: "سالبة", correct: true, why: "التيار يسبق الجهد بـ 90° فـ sin(−90°) = −1." }, { t: "موجبة", type: "sign", why: "الموجبة للملف. في المكثف θ<sub>v</sub> − θ<sub>i</sub> = −90°." }, { t: "صفر", type: "conceptual", why: "P للمكثف صفر، لكن Q ليست صفرًا." }] },
      { q: "مقاومة 10 Ω يمر فيها <span class='ltr'>i = 2 cos(ωt) A</span>. القدرة المتوسطة:", options: [{ t: "<span class='ltr'>20 W</span>", correct: true, why: "½ × 2² × 10 = 20 W." }, { t: "<span class='ltr'>40 W</span>", type: "formula", why: "نسيت ½ مع القيمة العظمى." }, { t: "<span class='ltr'>10 W</span>", type: "formula", why: "التيار يُربّع: ½ × 4 × 10." }] }
    ],
    practice: {
      prompt: "حمل جهده <span class='ltr'>v = 200 cos(ωt + 30°) V</span> وتياره <span class='ltr'>i = 5 cos(ωt − 15°) A</span>.",
      steps: [
        { id: "s1", label: "احسب القدرة المتوسطة.", symbol: "P =", answer: p2.P, units: W, unitDefault: 1,
          diagnose: [{ value: 2 * p2.P, type: "formula", why: "نسيت ½. مع القيم العظمى <span class='ltr'>P = ½V<sub>m</sub>I<sub>m</sub>cos θ</span>.", review: R("c1-power-2", "laws", "قانون P") },
            { value: p2.Vm * p2.Im / 2 * Math.cos(15 * D), type: "substitution", why: "استخدمت θ = 30° − 15° = 15°. زاوية التيار −15°، فالفرق 30° − (−15°) = 45°." },
            { value: p2.Vm * p2.Im / 2, type: "formula", why: "هذا <span class='ltr'>½V<sub>m</sub>I<sub>m</sub></span> بدون cos θ (القدرة الظاهرية)." }],
          hints: ["أوجد <span class='ltr'>θ = θ<sub>v</sub> − θ<sub>i</sub></span> أولًا."], solution: eqi("P = 500 cos 45° = 353.6 W") },
        { id: "s2", label: "احسب القدرة الردية.", symbol: "Q =", answer: p2.Q, units: VAR,
          diagnose: [{ value: -p2.Q, type: "sign", why: "حسبت <span class='ltr'>θ<sub>i</sub> − θ<sub>v</sub></span>. الزاوية جهد ناقص تيار.", review: R("c1-power-2", "when", "ترتيب الزاوية") }, { value: 2 * p2.Q, type: "formula", why: "نسيت ½." }],
          hints: [eqi("Q = (V<sub>m</sub>I<sub>m</sub>/2) sin θ")], solution: eqi("Q = 500 sin 45° = 353.6 VAR") },
        { id: "s3", kind: "choice", label: "طبيعة هذا الحمل:", options: [
          { t: "حثي (يمتص قدرة ردية)", correct: true }, { t: "سعوي (يولّد قدرة ردية)", type: "sign", why: "Q موجبة والتيار يتأخر عن الجهد، فالحمل حثي." }, { t: "مقاومي بحت", type: "conceptual", why: "المقاومة البحتة يكون فيها التيار والجهد في طور واحد و Q = 0." } ],
          hints: ["انظر إلى إشارة Q."], solution: "حثي: التيار يتأخر 45° عن الجهد." }
      ]
    },
    generator: { title: "تمارين مولّدة: P و Q لعناصر دائرة", ackinds: ["acP", "acQ"], families: ["loop", "ladder", "grid"] },
    lab: { title: "واطميتر وعداد VAR", desc: "في المعمل الذكي ستقيس P و Q لحمل RL بالواطميتر، وتقارن قراءته بحسابك من الجهد والتيار وفرق الطور." }
  };

  /* ================= 3. The rms value and power calculations ================= */
  var p3 = { V: 220, I: 5, pf: 0.8 };
  p3.S = p3.V * p3.I; p3.P = p3.S * p3.pf; p3.Q = p3.S * Math.sqrt(1 - p3.pf * p3.pf);
  var p3R = { Im: 10, R: 5 }; p3R.P = (p3R.Im / Math.SQRT2) * (p3R.Im / Math.SQRT2) * p3R.R;
  L["c1-power-3"] = {
    id: "c1-power-3", ar: "القيمة الفعالة وحسابات القدرة", en: "The rms Value and Power Calculations", minutes: 20,
    objectives: ["تعرف القيمة الفعالة (rms) لموجة دورية.", "تكتب P و Q بالقيم الفعالة بدون ½.", "تتجنب الخلط بين القيم العظمى والفعالة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>القيمة الفعالة لتيار دوري هي قيمة التيار المستمر الذي يعطي <b>نفس القدرة المتوسطة</b> في مقاومة. رياضيًا هي الجذر التربيعي لمتوسط المربع (root-mean-square):</p><div class='eq'>I<sub>rms</sub> = √( (1/T) ∫<sub>0</sub><sup>T</sup> i² dt )</div><p>للموجة الجيبية فقط: <span class='eq-i'>I<sub>rms</sub> = I<sub>m</sub>/√2</span>. وبالتعويض <span class='ltr'>V<sub>m</sub>I<sub>m</sub>/2 = V<sub>rms</sub>I<sub>rms</sub></span>، فيختفي ½ من قوانين القدرة.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>P = V<sub>rms</sub>I<sub>rms</sub> cos θ</div><div class='eq'>Q = V<sub>rms</sub>I<sub>rms</sub> sin θ</div></div><div class='eq-row'><div class='eq'>P<sub>R</sub> = I<sub>rms</sub>² R = V<sub>rms</sub>²/R</div><div class='eq'>pf = cos θ</div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>قراءات أجهزة القياس ولوحات الأجهزة (220 V، 5 A) قيم <b>فعالة</b> دائمًا ما لم يُذكر غير ذلك.</li><li>اختر نظامًا واحدًا: إما قيم عظمى مع ½، أو قيم فعالة بدون ½. الخلط بينهما يعطي ضعف أو نصف الجواب.</li><li><b>معامل القدرة</b> <span class='ltr'>pf = cos θ</span>: «متأخر» (lagging) للحمل الحثي و Q موجبة، «متقدم» (leading) للسعوي و Q سالبة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>محرك على 220 V (rms) يسحب 5 A (rms) بمعامل قدرة 0.8 متأخر.</p><ol class='steps'><li>" + eqi("|S| = V<sub>rms</sub>I<sub>rms</sub> = 1100 VA") + "</li><li>" + eqi("P = 1100 × 0.8 = 880 W") + "</li><li>" + eqi("sin θ = √(1 − 0.8²) = 0.6") + " ← " + eqi("Q = 660 VAR") + " (موجبة لأنه متأخر)</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>الملتيميتر الرخيص يحسب rms بافتراض موجة جيبية (يقيس القمة أو المتوسط ويضرب في معامل ثابت). مع موجات غير جيبية، مثل تيار شاحن جوال أو جهاز تحكم بسرعة محرك، تخطئ قراءته؛ لذلك تُكتب على الأجهزة الأدق عبارة <span class='ltr'>True RMS</span>.</p>" }
    ],
    quiz: [
      { q: "جهد مقبس 220 V (rms). قيمته العظمى تقريبًا:", options: [{ t: "<span class='ltr'>311 V</span>", correct: true, why: "220 × √2 ≈ 311 V." }, { t: "<span class='ltr'>156 V</span>", type: "formula", why: "قسمت على √2 بدل الضرب. القيمة العظمى أكبر من الفعالة." }, { t: "<span class='ltr'>440 V</span>", type: "formula", why: "العامل √2 وليس 2." }] },
      { q: "مع القيم الفعالة، قانون القدرة المتوسطة:", options: [{ t: "<span class='ltr'>V<sub>rms</sub>I<sub>rms</sub> cos θ</span>", correct: true, why: "½ اختفى لأن V<sub>m</sub>I<sub>m</sub>/2 = V<sub>rms</sub>I<sub>rms</sub>." }, { t: "<span class='ltr'>½ V<sub>rms</sub>I<sub>rms</sub> cos θ</span>", type: "formula", why: "½ تُستخدم مع القيم العظمى فقط." }] }
    ],
    practice: {
      prompt: "محرك على <span class='ltr'>220 V</span> (rms) يسحب <span class='ltr'>5 A</span> (rms) بمعامل قدرة <span class='ltr'>0.8</span> متأخر.",
      steps: [
        { id: "s1", label: "احسب القدرة الظاهرية |S|.", symbol: "|S| =", answer: p3.S, units: VA,
          diagnose: [{ value: p3.S / 2, type: "formula", why: "قسمت على 2. القيم المعطاة فعالة، فلا يوجد ½.", review: R("c1-power-3", "when", "عظمى أم فعالة؟") }, { value: p3.S * 2, type: "unit", why: "ضربت كل قيمة في √2 (حوّلتها إلى قيم عظمى) بدون إضافة ½." }],
          hints: [eqi("|S| = V<sub>rms</sub>I<sub>rms</sub>")], solution: eqi("220 × 5 = 1100 VA") },
        { id: "s2", label: "احسب القدرة المتوسطة.", symbol: "P =", answer: p3.P, units: W, unitDefault: 1,
          diagnose: [{ value: p3.P / 2, type: "formula", why: "استخدمت ½ مع قيم فعالة." }, { value: p3.Q, type: "conceptual", why: "هذه Q. القدرة المتوسطة تُضرب في cos θ = pf = 0.8." }],
          hints: [eqi("P = |S| × pf")], solution: eqi("1100 × 0.8 = 880 W") },
        { id: "s3", label: "احسب القدرة الردية (بإشارتها).", symbol: "Q =", answer: p3.Q, units: VAR,
          diagnose: [{ value: -p3.Q, type: "sign", why: "معامل القدرة <b>متأخر</b> (حثي)، فالقدرة الردية الممتصة موجبة.", review: R("c1-power-3", "when", "متأخر ومتقدم") }, { value: p3.S * 0.2, type: "formula", why: "sin θ ليست 1 − cos θ. استخدم <span class='ltr'>sin θ = √(1 − cos²θ)</span> = 0.6." }],
          hints: [eqi("sin θ = √(1 − 0.8²)")], solution: eqi("Q = 1100 × 0.6 = 660 VAR") },
        { id: "s4", label: "سخّان مقاومته <span class='ltr'>5 Ω</span> يمر فيه تيار قيمته العظمى <span class='ltr'>10 A</span>. احسب قدرته المتوسطة.", symbol: "P =", answer: p3R.P, units: W, unitDefault: 1,
          diagnose: [{ value: p3R.Im * p3R.Im * p3R.R, type: "formula", why: "استخدمت <span class='ltr'>I<sub>m</sub>²R</span>. القيمة المعطاة عظمى: إما <span class='ltr'>½I<sub>m</sub>²R</span> أو <span class='ltr'>I<sub>rms</sub>²R</span>." }, { value: p3R.Im / Math.SQRT2 * p3R.R, type: "formula", why: "نسيت تربيع التيار." }],
          hints: [eqi("I<sub>rms</sub> = 10/√2")], solution: eqi("P = (10/√2)² × 5 = 50 × 5 = 250 W") }
      ]
    },
    generator: { title: "تمارين مولّدة: القدرة المتوسطة", ackinds: ["acP"], families: ["loop", "ladder", "grid"] },
    lab: { title: "True RMS", desc: "في المعمل الذكي ستقيس موجة جيبية وموجة مربعة بقيمتين عظميين متساويتين، وتقارن قيمتيهما الفعالتين." }
  };

  /* ================= 4. Complex power ================= */
  var V4 = P(100, 36.87), I4 = Z(4, 0), S4 = Cx.scale(Cx.mul(V4, Cx.conj(I4)), 0.5);
  L["c1-power-4"] = {
    id: "c1-power-4", ar: "القدرة المركبة", en: "Complex Power", minutes: 25,
    objectives: ["تجمع P و Q في عدد مركب واحد S = P + jQ.", "تحسب S من فيزوري الجهد والتيار: S = ½VI*.", "ترسم مثلث القدرة وتقرأ منه معامل القدرة."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>القدرة المركبة تجمع القدرتين في عدد واحد: <span class='eq-i'>S = P + jQ</span>. مقدارها <span class='ltr'>|S|</span> هو القدرة الظاهرية (VA)، وزاويتها هي <span class='ltr'>θ = θ<sub>v</sub> − θ<sub>i</sub></span> نفسها.</p>" + triangle(160, 120, "مثلث القدرة: P أفقي و Q رأسي و |S| الوتر") + "<p class='muted'>مثلث القدرة لحمل حثي: S في الربع الأول. للحمل السعوي ينقلب Q إلى الأسفل.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>S = ½ V I*</div><div class='eq'>S = V<sub>rms</sub> I<sub>rms</sub>*</div></div><div class='eq-row'><div class='eq'>S = ½ |I|² Z</div><div class='eq'>|S| = √(P² + Q²)</div><div class='eq'>pf = P / |S|</div></div><p class='muted'>النجمة * تعني المرافق المركب: نعكس إشارة زاوية التيار، فتصبح زاوية الناتج θ<sub>v</sub> − θ<sub>i</sub>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>المرافق على <b>التيار</b> وليس الجهد. <span class='ltr'>V*I</span> يعطي Q بإشارة معكوسة.</li><li>S أسهل للجمع: قدرات الأحمال المركبة تُجمع مباشرة (الدرس القادم)، أما |S| فلا تُجمع.</li><li>الفيزورات في دوائر الفصل الخامس قيم عظمى، فاستخدم ½.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>" + eqi("V = 100∠36.87° V") + "، " + eqi("I = 4∠0° A") + " (قيم عظمى).</p><ol class='steps'><li>" + eqi("I* = 4∠0°") + "</li><li>" + eqi("S = ½ × 100∠36.87° × 4∠0° = 200∠36.87° VA") + "</li><li>" + eqi("S = 160 + j120 VA") + " ← " + eqi("P = 160 W") + "، " + eqi("Q = 120 VAR") + "</li><li>" + eqi("pf = cos 36.87° = 0.8") + " متأخر.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>المولدات والمحولات تُصنَّف بالـ kVA وليس بالـ kW، لأن ما يحدد تسخين ملفاتها هو التيار الكلي، أي |S|، بغض النظر عن معامل القدرة. محول 100 kVA يغذي حملًا بمعامل 0.8 يعطي 80 kW فقط.</p>" }
    ],
    quiz: [
      { q: "<span class='ltr'>S = 300 − j400 VA</span>. الحمل:", options: [{ t: "سعوي ومعامل قدرته 0.6 متقدم", correct: true, why: "Q سالبة ← سعوي، و pf = 300/500 = 0.6." }, { t: "حثي ومعامل قدرته 0.6 متأخر", type: "sign", why: "Q سالبة تعني سعوي (متقدم)." }, { t: "سعوي ومعامل قدرته 0.8", type: "formula", why: "pf = P/|S| = 300/500 = 0.6. الـ 0.8 هي sin θ." }] },
      { q: "القدرة المركبة بالقيم العظمى:", options: [{ t: "<span class='ltr'>½ V I*</span>", correct: true, why: "المرافق على التيار، ومع ½." }, { t: "<span class='ltr'>½ V* I</span>", type: "formula", why: "هذا يعكس إشارة Q." }, { t: "<span class='ltr'>V I</span>", type: "formula", why: "بدون مرافق تجمع الزوايا بدل طرحها، وبدون ½." }] }
    ],
    practice: {
      prompt: "حمل فيزور جهده <span class='ltr'>V = 100∠36.87° V</span> وفيزور تياره <span class='ltr'>I = 4∠0° A</span> (قيم عظمى).",
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "احسب القدرة المركبة S.", answer: S4, units: VA,
          diagnose: [{ value: Cx.scale(S4, 2), type: "formula", why: "نسيت ½. الفيزورات قيم عظمى.", review: R("c1-power-4", "laws", "S = ½VI*") },
            { value: Cx.conj(S4), type: "formula", why: "استخدمت <span class='ltr'>V*I</span>، فانعكست إشارة Q. المرافق على التيار.", review: R("c1-power-4", "when", "المرافق على التيار") }],
          hints: [eqi("S = ½ V I*")], solution: eqi("S = 200∠36.87° = 160 + j120 VA") },
        { id: "s2", label: "احسب القدرة الظاهرية.", symbol: "|S| =", answer: Cx.abs(S4), units: VA,
          diagnose: [{ value: S4.re + S4.im, type: "math", why: "جمعت P + Q مباشرة. المقدار <span class='ltr'>√(P² + Q²)</span>." }],
          hints: [eqi("|S| = √(P² + Q²)")], solution: eqi("√(160² + 120²) = 200 VA") },
        { id: "s3", label: "احسب معامل القدرة.", symbol: "pf =", answer: S4.re / Cx.abs(S4), units: NONE,
          diagnose: [{ value: S4.im / Cx.abs(S4), type: "formula", why: "هذا sin θ = Q/|S|. معامل القدرة cos θ = P/|S|." }],
          hints: [eqi("pf = P / |S|")], solution: eqi("160 / 200 = 0.8") },
        { id: "s4", kind: "choice", label: "معامل القدرة:", options: [
          { t: "متأخر (التيار يتأخر عن الجهد)", correct: true }, { t: "متقدم (التيار يسبق الجهد)", type: "sign", why: "زاوية الجهد 36.87° وزاوية التيار 0°: التيار متأخر، و Q موجبة." } ],
          hints: ["قارن زاويتي V و I."], solution: "متأخر: الحمل حثي." }
      ]
    },
    generator: { title: "تمارين مولّدة: القدرة المركبة للمصدر", ackinds: ["acS"], families: ["loop", "ladder", "grid"] },
    lab: { title: "مثلث القدرة", desc: "في المعمل الذكي ستغيّر الملف في حمل RL وترى مثلث القدرة يتغير، مع قراءة P و Q و |S| من أجهزة القياس." }
  };

  /* ================= 5. Power calculations ================= */
  var p5 = { V: 200, P1: 4000, pf1: 0.8, P2: 2000 };
  p5.Q1 = p5.P1 / p5.pf1 * Math.sqrt(1 - p5.pf1 * p5.pf1);
  p5.S = Z(p5.P1 + p5.P2, p5.Q1); p5.I = Cx.abs(p5.S) / p5.V; p5.pf = p5.S.re / Cx.abs(p5.S);
  /* small circuit for the conservation example */
  var c5 = { rows: 2, cols: 3, omega: 1000, edges: [E([0, 0], [1, 0], "V", 20, { phase: 0, plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 3, { name: "R1" }), E([0, 1], [0, 2], "L", 4 / 1000, { name: "L1" }), E([0, 2], [1, 2], "W")].concat(b3()) };
  var s5 = AC.solve(c5), S5src = Cx.scale(s5.byName.Vs.s, -0.5), S5R = Cx.scale(s5.byName.R1.s, 0.5), S5L = Cx.scale(s5.byName.L1.s, 0.5);
  L["c1-power-5"] = {
    id: "c1-power-5", ar: "حسابات القدرة", en: "Power Calculations", minutes: 25,
    objectives: ["تطبق مبدأ حفظ القدرة المركبة: مجموع ما تسلّمه المصادر = مجموع ما تمتصه العناصر.", "تجمع أحمالًا متوازية بقدراتها المركبة.", "تحسب تيار الخط ومعامل القدرة الكلي."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>القدرة المركبة محفوظة في أي دائرة: <span class='eq-i'>Σ S<sub>مسلَّمة</sub> = Σ S<sub>ممتصة</sub></span>، أي أن P تُحفظ و Q تُحفظ كل على حدة. لذلك نجمع قدرات الأحمال المركبة مباشرة بدون حساب ممانعاتها.</p>" + fig(c5, "مصدر جهد يغذي مقاومة وملفًا على التوالي") + "<p class='muted'>هنا (قيم عظمى، <span class='ltr'>ω = 1000 rad/s</span>): المصدر يسلّم " + eqi(AC.rect(S5src, "VA")) + "، والمقاومة تمتص " + eqi(AC.rect(S5R, "VA")) + "، والملف " + eqi(AC.rect(S5L, "VA")) + ". المجموع متطابق.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>S<sub>total</sub> = S<sub>1</sub> + S<sub>2</sub> + …</div><div class='eq'>Q = P tan θ = P · √(1 − pf²) / pf</div></div><div class='eq-row'><div class='eq'>I<sub>rms</sub> = |S<sub>total</sub>| / V<sub>rms</sub></div><div class='eq'>pf<sub>total</sub> = P<sub>total</sub> / |S<sub>total</sub>|</div></div>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>اجمع P مع P و Q مع Q. لا تجمع |S| ولا معاملات القدرة.</li><li>من P و pf: احسب Q بالإشارة الصحيحة (متأخر +، متقدم −).</li><li>مفيد جدًا في أنظمة القوى حيث تُعطى الأحمال بـ kW و pf بدل ممانعاتها.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>حملان على التوازي على 200 V (rms): الأول 4 kW بمعامل 0.8 متأخر، والثاني 2 kW بمعامل 1.</p><ol class='steps'><li>" + eqi("Q<sub>1</sub> = 4000 × 0.6/0.8 = 3000 VAR") + "، " + eqi("Q<sub>2</sub> = 0") + "</li><li>" + eqi("S = 6000 + j3000 VA") + "، " + eqi("|S| = " + n(Cx.abs(p5.S)) + " VA") + "</li><li>" + eqi("I = " + n(Cx.abs(p5.S)) + " / 200 = " + n(p5.I) + " A") + "</li><li>" + eqi("pf = 6000 / " + n(Cx.abs(p5.S)) + " = " + n(p5.pf)) + " متأخر.</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>مهندس التصميم الكهربائي لمبنى يجمع أحمال الإضاءة والتكييف والمصاعد بهذه الطريقة (P و Q لكل حمل)، ومن |S| الكلية يختار سعة المحول ومقطع الكابل الرئيسي.</p>" }
    ],
    quiz: [
      { q: "حملان: <span class='ltr'>S<sub>1</sub> = 3 + j4 kVA</span> و <span class='ltr'>S<sub>2</sub> = 3 − j4 kVA</span>. القدرة الظاهرية الكلية:", options: [{ t: "<span class='ltr'>6 kVA</span>", correct: true, why: "S = 6 + j0، فـ |S| = 6 kVA." }, { t: "<span class='ltr'>10 kVA</span>", type: "conceptual", why: "جمعت 5 + 5. القدرات الظاهرية لا تُجمع؛ اجمع S المركبة." }] },
      { q: "حمل 10 kW بمعامل قدرة 1. قدرته الردية:", options: [{ t: "صفر", correct: true, why: "pf = 1 ← θ = 0 ← Q = 0." }, { t: "<span class='ltr'>10 kVAR</span>", type: "conceptual", why: "معامل القدرة 1 يعني حملًا مقاوميًا بحتًا." }] }
    ],
    practice: {
      prompt: "حملان على التوازي يغذيهما <span class='ltr'>200 V</span> (rms): الأول <span class='ltr'>4 kW</span> بمعامل قدرة <span class='ltr'>0.8</span> متأخر، والثاني <span class='ltr'>2 kW</span> بمعامل قدرة <span class='ltr'>1</span>.",
      steps: [
        { id: "s1", label: "احسب القدرة الردية للحمل الأول.", symbol: "Q<sub>1</sub> =", answer: p5.Q1, units: VAR, unitDefault: 1,
          diagnose: [{ value: p5.P1 * 0.6, type: "formula", why: "ضربت P في sin θ. القدرة الردية <span class='ltr'>|S| sin θ</span> و <span class='ltr'>|S| = P/pf = 5 kVA</span>." }, { value: -p5.Q1, type: "sign", why: "المعامل متأخر، فـ Q موجبة." }],
          hints: [eqi("|S<sub>1</sub>| = P<sub>1</sub>/pf<sub>1</sub>"), eqi("Q<sub>1</sub> = |S<sub>1</sub>| sin θ<sub>1</sub>")], solution: eqi("|S<sub>1</sub>| = 5 kVA ← Q<sub>1</sub> = 5 × 0.6 = 3 kVAR") },
        { id: "s2", kind: "phasor", form: "rect", label: "احسب القدرة المركبة الكلية.", answer: p5.S, units: VA,
          diagnose: [{ value: Z(p5.P1 + p5.P2, -p5.Q1), type: "sign", why: "Q الكلية موجبة (الحمل الأول متأخر)." }],
          hints: ["اجمع P مع P و Q مع Q."], solution: eqi("S = (4000 + 2000) + j(3000 + 0) = 6000 + j3000 VA") },
        { id: "s3", label: "احسب تيار المصدر (rms).", symbol: "I =", answer: p5.I, units: A, unitDefault: 1,
          diagnose: [{ value: (5000 + 2000) / p5.V, type: "conceptual", why: "جمعت القدرتين الظاهريتين 5 + 2 kVA. القدرة الظاهرية الكلية من S المركبة: <span class='ltr'>|6000 + j3000|</span>.", review: R("c1-power-5", "when", "لا تجمع |S|") }, { value: (p5.P1 + p5.P2) / p5.V, type: "conceptual", why: "قسمت P على V. التيار يحدده |S| وليس P." }],
          hints: [eqi("I = |S| / V")], solution: eqi("I = " + n(Cx.abs(p5.S)) + " / 200 = " + n(p5.I) + " A") },
        { id: "s4", label: "احسب معامل القدرة الكلي.", symbol: "pf =", answer: p5.pf, units: NONE,
          diagnose: [{ value: 0.8, type: "conceptual", why: "هذا معامل الحمل الأول وحده. الحمل الثاني يرفع P الكلية بدون Q، فيتحسن المعامل: <span class='ltr'>P<sub>total</sub>/|S<sub>total</sub>|</span>." }],
          hints: [eqi("pf = P / |S|")], solution: eqi("6000 / " + n(Cx.abs(p5.S)) + " = " + n(p5.pf)) + " متأخر" }
      ]
    },
    generator: { title: "تمارين مولّدة: حفظ القدرة في الدائرة", ackinds: ["acS", "acP", "acQ"], families: ["ladder", "grid"] },
    lab: { title: "حفظ القدرة", desc: "في المعمل الذكي ستقيس P و Q لكل حمل في لوحة توزيع صغيرة، وتتحقق أن مجموعها يساوي قراءة المصدر." }
  };

  /* ================= 6. Maximum power transfer ================= */
  var t6 = { rows: 2, cols: 3, omega: 1000, edges: [E([0, 0], [1, 0], "V", 10, { phase: 0, plus: "a", name: "Vs" }), E([0, 0], [0, 1], "R", 4, { name: "R1" }), E([0, 1], [1, 1], "C", 1 / 4000, { name: "C1" }), E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "T", 0, { name: "ab" })].concat(b3()) };
  var pr6 = AC.port(t6), Vth6 = Cx.abs(pr6.voc), Zth6 = pr6.zth;
  var Pmax6 = Vth6 * Vth6 / (8 * Zth6.re);
  var RL6 = Cx.abs(Zth6), I6r = Vth6 / Cx.abs(Cx.add(Zth6, Z(RL6))), P6r = 0.5 * I6r * I6r * RL6;
  var Pzth6 = 0.5 * Math.pow(Vth6 / Cx.abs(Cx.add(Zth6, Zth6)), 2) * Zth6.re;
  L["c1-power-6"] = {
    id: "c1-power-6", ar: "أقصى نقل للقدرة", en: "Maximum Power Transfer", minutes: 25,
    objectives: ["تثبت أن أقصى قدرة متوسطة تُنقل عندما Z<sub>L</sub> = Z<sub>Th</sub>*.", "تحسب P<sub>max</sub> بالقيم العظمى والفعالة.", "تحل حالة الحمل المقاومي البحت: R<sub>L</sub> = |Z<sub>Th</sub>|."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>نستبدل الشبكة بمكافئ ثيفنن <span class='ltr'>V<sub>Th</sub></span> و <span class='ltr'>Z<sub>Th</sub> = R<sub>Th</sub> + jX<sub>Th</sub></span>. القدرة في حمل <span class='ltr'>Z<sub>L</sub> = R<sub>L</sub> + jX<sub>L</sub></span>:</p><div class='eq'>P = ½ |V<sub>Th</sub>|² R<sub>L</sub> / [ (R<sub>Th</sub> + R<sub>L</sub>)² + (X<sub>Th</sub> + X<sub>L</sub>)² ]</div><p>لتكبير P: نختار <span class='ltr'>X<sub>L</sub> = −X<sub>Th</sub></span> لتلغي المفاعلتان بعضهما (المقام يصغر)، ثم <span class='ltr'>R<sub>L</sub> = R<sub>Th</sub></span> كما في التيار المستمر. أي أن الحمل الأمثل هو <b>المرافق</b>.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>Z<sub>L</sub> = Z<sub>Th</sub>*</div><div class='eq'>P<sub>max</sub> = |V<sub>Th</sub>|² / (8 R<sub>Th</sub>)</div><div class='eq'>P<sub>max</sub> = |V<sub>Th,rms</sub>|² / (4 R<sub>Th</sub>)</div></div><p class='muted'>إذا كان الحمل مقاومة فقط (لا يمكن ضبط X<sub>L</sub>): أقصى قدرة عند <span class='ltr'>R<sub>L</sub> = |Z<sub>Th</sub>|</span>، وتكون أقل من P<sub>max</sub> السابقة.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>المرافق وليس المساوي: <span class='ltr'>Z<sub>L</sub> = Z<sub>Th</sub></span> يضاعف المفاعلة بدل إلغائها.</li><li>8 مع القيمة العظمى، و 4 مع rms.</li><li>عند التطابق تكون الكفاءة 50% فقط، لذلك لا نستخدمه في نقل الطاقة الكهربائية، بل في الإشارات الضعيفة.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>الدائرة أدناه (من درس ثيفنن في الفصل السابق): " + eqi("V<sub>Th</sub> = " + AC.polar(pr6.voc, "V")) + "، " + eqi("Z<sub>Th</sub> = " + AC.rect(Zth6) + " Ω") + ".</p>" + fig(t6, "مصدر جهد ومقاومة ومكثف بين الطرفين a و b") + "<ol class='steps'><li>" + eqi("Z<sub>L</sub> = Z<sub>Th</sub>* = " + AC.rect(Cx.conj(Zth6)) + " Ω") + "</li><li>" + eqi("P<sub>max</sub> = " + n(Vth6) + "² / (8 × " + n(Zth6.re) + ") = " + n(Pmax6) + " W") + "</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>في أنظمة الراديو والهوائيات (ممانعة 50 Ω أو 75 Ω) تُصمم دوائر مطابقة (matching networks) من ملفات ومكثفات لتجعل الحمل يبدو مرافقًا لممانعة المصدر، فتصل أكبر قدرة ممكنة من إشارة ضعيفة إلى المستقبل.</p>" }
    ],
    quiz: [
      { q: "<span class='ltr'>Z<sub>Th</sub> = 6 + j8 Ω</span>. الحمل الذي يستقبل أقصى قدرة:", options: [{ t: "<span class='ltr'>6 − j8 Ω</span>", correct: true, why: "المرافق: تلغي −j8 المفاعلة +j8." }, { t: "<span class='ltr'>6 + j8 Ω</span>", type: "conceptual", why: "المساوي يضاعف المفاعلة إلى j16 فيقل التيار." }, { t: "<span class='ltr'>10 Ω</span>", type: "conceptual", why: "|Z<sub>Th</sub>| = 10 هو الأمثل فقط إذا كان الحمل مقاومة بحتة." }] },
      { q: "<span class='ltr'>V<sub>Th</sub> = 20 V</span> (عظمى) و <span class='ltr'>R<sub>Th</sub> = 5 Ω</span>. أقصى قدرة:", options: [{ t: "<span class='ltr'>10 W</span>", correct: true, why: "400 / (8 × 5) = 10 W." }, { t: "<span class='ltr'>20 W</span>", type: "formula", why: "استخدمت 4 R<sub>Th</sub> مع قيمة عظمى." }] }
    ],
    practice: {
      prompt: "للدائرة في المثال: <span class='ltr'>V<sub>Th</sub> = " + AC.polar(pr6.voc, "V") + "</span> (قيمة عظمى)، <span class='ltr'>Z<sub>Th</sub> = " + AC.rect(Zth6) + " Ω</span>.",
      circuit: t6, figure: fig(t6, "مصدر جهد ومقاومة ومكثف بين الطرفين a و b"),
      steps: [
        { id: "s1", kind: "phasor", form: "rect", label: "ما الحمل <span class='ltr'>Z<sub>L</sub></span> الذي يستقبل أقصى قدرة؟", answer: Cx.conj(Zth6), units: OHM,
          diagnose: [{ value: Zth6, type: "conceptual", why: "الحمل يساوي Z<sub>Th</sub> نفسها. المطلوب المرافق ليُلغي المفاعلة.", review: R("c1-power-6", "when", "المرافق وليس المساوي") }],
          hints: [eqi("Z<sub>L</sub> = Z<sub>Th</sub>*")], solution: eqi("Z<sub>L</sub> = " + AC.rect(Cx.conj(Zth6)) + " Ω") + " (مقاومة 2 Ω وملف مفاعلته 2 Ω)" },
        { id: "s2", label: "احسب أقصى قدرة متوسطة.", symbol: "P<sub>max</sub> =", answer: Pmax6, units: W, unitDefault: 1,
          diagnose: [{ value: 2 * Pmax6, type: "formula", why: "استخدمت <span class='ltr'>|V<sub>Th</sub>|²/(4R<sub>Th</sub>)</span> مع قيمة عظمى. مع القيمة العظمى المقام 8R<sub>Th</sub>.", review: R("c1-power-6", "laws", "8 أم 4؟") },
            { value: Pzth6, type: "conceptual", why: "هذه قدرة حمل يساوي Z<sub>Th</sub> (وليس مرافقها)." }],
          hints: [eqi("|V<sub>Th</sub>|² / (8R<sub>Th</sub>)")], solution: eqi(n(Vth6) + "² / (8 × " + n(Zth6.re) + ") = " + n(Pmax6) + " W") },
        { id: "s3", label: "لو كان الحمل مقاومة فقط: ما قيمة R<sub>L</sub> المثلى؟", symbol: "R<sub>L</sub> =", answer: RL6, units: OHM,
          diagnose: [{ value: Zth6.re, type: "conceptual", why: "R<sub>L</sub> = R<sub>Th</sub> صحيحة فقط إذا أمكن إلغاء المفاعلة. مع حمل مقاومي بحت <span class='ltr'>R<sub>L</sub> = |Z<sub>Th</sub>|</span>.", review: R("c1-power-6", "laws", "الحمل المقاومي") }],
          hints: [eqi("R<sub>L</sub> = |Z<sub>Th</sub>| = √(R<sub>Th</sub>² + X<sub>Th</sub>²)")], solution: eqi("√(2² + 2²) = " + n(RL6) + " Ω") },
        { id: "s4", label: "احسب القدرة في هذه المقاومة.", symbol: "P =", answer: P6r, units: W, unitDefault: 1,
          diagnose: [{ value: Pmax6, type: "conceptual", why: "هذه P<sub>max</sub> مع الحمل المرافق. المقاومة البحتة لا تلغي المفاعلة، فالقدرة أقل." }, { value: 2 * P6r, type: "formula", why: "نسيت ½ مع القيمة العظمى." }],
          hints: [eqi("|I| = |V<sub>Th</sub>| / |Z<sub>Th</sub> + R<sub>L</sub>|"), eqi("P = ½ |I|² R<sub>L</sub>")], solution: eqi("|I| = " + n(Vth6) + " / |" + AC.rect(Cx.add(Zth6, Z(RL6))) + "| = " + n(I6r) + " A ← P = ½ × " + n(I6r) + "² × " + n(RL6) + " = " + n(P6r) + " W") }
      ]
    },
    generator: { title: "تمارين مولّدة: أقصى نقل للقدرة في التيار المتردد", ackinds: ["acPmax"], families: ["ladder", "grid"] },
    lab: { title: "دائرة المطابقة", desc: "في المعمل الذكي ستغيّر مقاومة الحمل ومفاعلته وتراقب القدرة المقاسة حتى تصل للقمة عند المرافق." }
  };

  /* ================= 7. Power factor correction ================= */
  var p7 = { P: 10000, pf1: 0.8, pf2: 0.95, V: 220, f: 60 };
  p7.w = 2 * Math.PI * p7.f;
  p7.Q1 = p7.P * Math.tan(Math.acos(p7.pf1)); p7.Q2 = p7.P * Math.tan(Math.acos(p7.pf2)); p7.Qc = p7.Q1 - p7.Q2;
  p7.C = p7.Qc / (p7.w * p7.V * p7.V);
  p7.I1 = p7.P / (p7.V * p7.pf1); p7.I2 = p7.P / (p7.V * p7.pf2);
  L["c1-power-7"] = {
    id: "c1-power-7", ar: "تصحيح معامل القدرة", en: "Power Factor Correction", minutes: 25,
    objectives: ["تفهم لماذا يُرفع معامل القدرة للأحمال الحثية.", "تحسب القدرة الردية المطلوب تعويضها.", "تحسب سعة المكثف الموصول على التوازي."],
    sections: [
      { id: "concept", title: "الفكرة", en: "Concept", html: "<p>معظم الأحمال الصناعية (المحركات) حثية، فتسحب قدرة ردية موجبة. هذه Q لا تنجز شغلًا لكنها تزيد التيار في الخط. نوصل مكثفًا <b>على التوازي</b> مع الحمل: المكثف يولّد قدرة ردية (Q سالبة) تعوّض جزءًا من Q الحمل، فيقل |S| والتيار، بينما تبقى P والجهد على الحمل كما هي.</p>" + triangle(p7.P, p7.Q1, "مثلث القدرة قبل التصحيح") + "<p class='muted'>قبل التصحيح: <span class='ltr'>Q = 7.5 kVAR</span>. المكثف يُنزل الضلع الرأسي إلى " + eqi(n(p7.Q2 / 1000) + " kVAR") + " مع بقاء P = 10 kW.</p>" },
      { id: "laws", title: "القوانين", en: "Equations", html: "<div class='eq-row'><div class='eq'>Q<sub>C</sub> = P (tan θ<sub>old</sub> − tan θ<sub>new</sub>)</div><div class='eq'>C = Q<sub>C</sub> / (ω V<sub>rms</sub>²)</div></div><p class='muted'>من <span class='ltr'>|Q<sub>C</sub>| = V<sub>rms</sub>² / X<sub>C</sub> = ω C V<sub>rms</sub>²</span>. ω بالراديان/ثانية: <span class='ltr'>ω = 2πf</span>.</p>" },
      { id: "when", title: "متى ولماذا نستخدمه؟", en: "When & Why", html: "<ul class='ticks'><li>المكثف على التوازي (لا على التوالي) حتى يبقى جهد الحمل كما هو.</li><li>لا نصحح عادة إلى 1 تمامًا: المكثف يصبح كبيرًا ومكلفًا، والمكسب الإضافي صغير. القيم الشائعة 0.9 إلى 0.95.</li><li>انتبه: V<sub>rms</sub> وليس القيمة العظمى، و ω وليس f.</li></ul>" },
      { id: "example", title: "مثال محلول", en: "Worked Example", html: "<p class='q'>حمل 10 kW بمعامل 0.8 متأخر على 220 V (rms)، 60 Hz. المطلوب رفع المعامل إلى 0.95 متأخر.</p><ol class='steps'><li>" + eqi("Q<sub>old</sub> = 10000 × tan(cos⁻¹0.8) = 10000 × 0.75 = 7500 VAR") + "</li><li>" + eqi("Q<sub>new</sub> = 10000 × tan(cos⁻¹0.95) = " + n(p7.Q2) + " VAR") + "</li><li>" + eqi("Q<sub>C</sub> = 7500 − " + n(p7.Q2) + " = " + n(p7.Qc) + " VAR") + "</li><li>" + eqi("C = " + n(p7.Qc) + " / (377 × 220²) = " + n(p7.C * 1e6) + " µF") + "</li><li>التيار ينخفض من " + eqi(n(p7.I1) + " A") + " إلى " + eqi(n(p7.I2) + " A") + ".</li></ol>" },
      { id: "realworld", title: "في الواقع", en: "Real-World", html: "<p>في لوحات التوزيع بالمصانع توجد «بنوك مكثفات» تُفصل وتوصل تلقائيًا حسب الحمل للحفاظ على معامل القدرة فوق حد معين تشترطه شركة الكهرباء. انخفاض المعامل يعني تيارًا أكبر في الكابلات والمحولات، أي فقدًا حراريًا أكبر وسعة أقل متاحة لأحمال جديدة.</p>" }
    ],
    quiz: [
      { q: "بعد إضافة مكثف التصحيح على التوازي، القدرة المتوسطة للحمل:", options: [{ t: "لا تتغير", correct: true, why: "جهد الحمل نفسه، فالحمل يسحب نفس P. المكثف المثالي لا يستهلك قدرة متوسطة." }, { t: "تزداد", type: "conceptual", why: "المكثف لا يضيف قدرة فعلية؛ يقلل Q فقط." }, { t: "تقل", type: "conceptual", why: "P ثابتة؛ ما يقل هو |S| وتيار الخط." }] },
      { q: "لماذا يوصل مكثف التصحيح على التوازي وليس التوالي؟", options: [{ t: "حتى يبقى جهد الحمل كما هو", correct: true, why: "على التوازي يبقى الحمل على جهد المصدر نفسه." }, { t: "لأن المكثف على التوالي يولّد قدرة ردية موجبة", type: "sign", why: "المكثف يولّد قدرة ردية (Q سالبة) في الحالتين. المشكلة في التوالي أنه يغير جهد الحمل." }] }
    ],
    practice: {
      prompt: "حمل <span class='ltr'>10 kW</span> بمعامل قدرة <span class='ltr'>0.8</span> متأخر على <span class='ltr'>220 V</span> (rms)، <span class='ltr'>60 Hz</span>. نريد رفع معامل القدرة إلى <span class='ltr'>0.95</span> متأخر بمكثف على التوازي.",
      steps: [
        { id: "s1", label: "احسب القدرة الردية قبل التصحيح.", symbol: "Q<sub>old</sub> =", answer: p7.Q1, units: VAR, unitDefault: 1,
          diagnose: [{ value: p7.P * 0.6, type: "formula", why: "ضربت P في sin θ. <span class='ltr'>Q = P tan θ</span> (أو <span class='ltr'>|S| sin θ</span> مع <span class='ltr'>|S| = P/pf</span>)." }],
          hints: [eqi("Q = P tan(cos⁻¹ pf)")], solution: eqi("10000 × 0.75 = 7500 VAR") },
        { id: "s2", label: "احسب القدرة الردية المطلوبة بعد التصحيح.", symbol: "Q<sub>new</sub> =", answer: p7.Q2, units: VAR, unitDefault: 1,
          diagnose: [{ value: p7.P * Math.sqrt(1 - p7.pf2 * p7.pf2), type: "formula", why: "ضربت P في sin θ. استخدم tan θ<sub>new</sub>." }],
          hints: [eqi("Q<sub>new</sub> = P tan(cos⁻¹ 0.95)")], solution: eqi("10000 × " + n(Math.tan(Math.acos(0.95))) + " = " + n(p7.Q2) + " VAR") },
        { id: "s3", label: "احسب القدرة الردية التي يجب أن يولّدها المكثف.", symbol: "Q<sub>C</sub> =", answer: p7.Qc, units: VAR, unitDefault: 1,
          diagnose: [{ value: p7.Q1, type: "conceptual", why: "هذا تصحيح إلى pf = 1 (إلغاء Q كلها). المطلوب 0.95 فقط." }],
          hints: [eqi("Q<sub>C</sub> = Q<sub>old</sub> − Q<sub>new</sub>")], solution: eqi("7500 − " + n(p7.Q2) + " = " + n(p7.Qc) + " VAR") },
        { id: "s4", label: "احسب سعة المكثف.", symbol: "C =", answer: p7.C, units: UF,
          diagnose: [{ value: p7.Qc / (p7.f * p7.V * p7.V), type: "unit", why: "استخدمت f = 60 بدل ω = 2π × 60 = 377 rad/s.", review: R("c1-power-7", "laws", "القانون مع ω") },
            { value: p7.Qc / (p7.w * 2 * p7.V * p7.V), type: "substitution", why: "استخدمت القيمة العظمى 311 V. القانون بالقيمة الفعالة: <span class='ltr'>C = Q<sub>C</sub>/(ωV<sub>rms</sub>²)</span>." },
            { value: p7.Q1 / (p7.w * p7.V * p7.V), type: "conceptual", why: "استخدمت Q<sub>old</sub> كاملة (تصحيح إلى 1)." }],
          hints: [eqi("C = Q<sub>C</sub> / (ω V<sub>rms</sub>²)"), eqi("ω = 2π × 60 ≈ 377 rad/s")], solution: eqi("C = " + n(p7.Qc) + " / (377 × 220²) = " + n(p7.C * 1e6) + " µF") },
        { id: "s5", label: "احسب تيار الخط بعد التصحيح (rms).", symbol: "I =", answer: p7.I2, units: A, unitDefault: 1,
          diagnose: [{ value: p7.I1, type: "conceptual", why: "هذا التيار قبل التصحيح: <span class='ltr'>10000/(220 × 0.8)</span>." }, { value: p7.P / p7.V, type: "conceptual", why: "قسمت P على V. هذا التيار فقط عند pf = 1." }],
          hints: [eqi("I = P / (V pf<sub>new</sub>)")], solution: eqi("10000 / (220 × 0.95) = " + n(p7.I2) + " A") + " (كان " + n(p7.I1) + " A)" }
      ]
    },
    generator: { title: "تمارين مولّدة: القدرة الردية في ملفات ومكثفات الدائرة", ackinds: ["acQ"], families: ["loop", "ladder", "grid"] },
    lab: { title: "بنك المكثفات", desc: "في المعمل الذكي ستوصل مكثفات بقيم مختلفة على التوازي مع محرك، وتراقب انخفاض تيار الخط وارتفاع معامل القدرة." }
  };
})();
