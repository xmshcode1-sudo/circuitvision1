/* CircuitVision — Project Academy: Circuits 1 projects.
   Every number a student sees (design answers, simulation readings, expected measurements) is computed
   here from the circuit by the same engines the lessons use (engine/mna.js for DC, engine/ac.js for AC).
   Component values called "typical" are stated as such: students are told to check their own part's datasheet. */
(function () {
  "use strict";
  var CV = window.CV, P = CV.projects = CV.projects || {}, order = CV.projectOrder = CV.projectOrder || [];
  var E = function (a, b, type, value, o) { var e = { a: a, b: b, type: type, value: value }; for (var k in (o || {})) e[k] = o[k]; return e; };
  var si = function (v, u) { return CV.ac.si(v, u); };
  var n = function (v) { return CV.num(v); };
  var eqi = function (s) { return "<span class='eq-i'>" + s + "</span>"; };
  var R = function (lesson, section, label) { return { lesson: lesson, section: section, label: label }; };
  var par = function (a, b) { return a * b / (a + b); };
  var fig = function (c, aria) { return "<div class='lfig'>" + CV.draw.render(c, { aria: aria }) + "</div>"; };
  function solve(c) { var s = CV.mna.solve({ rows: c.rows, cols: c.cols, edges: c.edges.filter(function (e) { return e.type !== "T"; }) }); if (!s.ok) throw new Error("project circuit invalid"); return s; }
  function opts(list, unit) { return list.map(function (v) { return { v: v, l: si(v, unit) }; }); }
  var E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  function e12(from, to) { var out = []; for (var d = 1e-12; d <= to; d *= 10) E12.forEach(function (m) { var v = Number((m * d).toPrecision(3)); if (v >= from * 0.999 && v <= to * 1.001) out.push(v); }); return out; }
  var A = [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }], V = [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }], W = [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }];
  var OHM = [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }], NF = [{ l: "nF", f: 1e-9 }, { l: "µF", f: 1e-6 }], NONE = [{ l: "—", f: 1 }];

  /* ===================================================================
     1. LED indicator with a current-limiting resistor
     =================================================================== */
  function ledCircuit(Vs, Rv, Vf) {
    return { rows: 2, cols: 2, edges: [
      E([0, 0], [1, 0], "V", Vs, { plus: "a", name: "Vs" }),
      E([0, 0], [0, 1], "R", Rv, { name: "R" }),
      E([0, 1], [1, 1], "V", Vf, { plus: "a", name: "LED", led: true, vtext: "Vf ≈ " + n(Vf) + " V" }),
      E([1, 0], [1, 1], "W")] };
  }
  function ledSolve(Vs, Rv, Vf) {
    var c = ledCircuit(Vs, Rv, Vf), s = solve(c), i = s.byName.LED.i;
    if (i <= 0) return { c: c, on: false, i: 0, vR: 0, pR: 0, pLED: 0, pS: 0, vLED: Vs };
    return { c: c, on: true, i: i, vR: s.byName.R.v, pR: s.byName.R.p, pLED: s.byName.LED.p, pS: -s.byName.Vs.p, vLED: Vf };
  }
  var L1 = ledSolve(5, 220, 2.0);
  var LEDS = [{ v: "red", l: "أحمر (Vf ≈ 2.0 V)", vf: 2.0 }, { v: "yellow", l: "أصفر (Vf ≈ 2.1 V)", vf: 2.1 }, { v: "blue", l: "أزرق (Vf ≈ 3.0 V)", vf: 3.0 }, { v: "white", l: "أبيض (Vf ≈ 3.0 V)", vf: 3.0 }];
  P["led-indicator"] = {
    id: "led-indicator", ar: "مؤشر LED بمقاومة تحديد التيار", en: "LED Indicator with a Current-Limiting Resistor", level: "مبتدئ",
    lessons: ["c1-elements-2", "c1-elements-3", "c1-variables-4"],
    summary: "أول دائرة حقيقية: تختار المقاومة التي تحمي الـ LED من التيار الزائد، وتتحقق من القدرة على المقاومة.",
    idea: {
      html: "<p>الـ LED يحترق إذا وُصل بالمصدر مباشرة. نضع مقاومة على التوالي تأخذ فرق الجهد وتحدد التيار بقانون أوم. نمثّل الـ LED المضيء بهبوط جهد ثابت <span class='ltr'>V<sub>f</sub></span>.</p>",
      specs: ["مصدر 5 V و LED أحمر (<span class='ltr'>V<sub>f</sub> ≈ 2 V</span> نموذجي).", "التيار حوالي 15 mA ولا يتجاوز 20 mA.", "قدرة المقاومة أقل من 125 mW (نصف تصنيف 1/4 W)."]
    },
    design: {
      prompt: "صمّم المقاومة لـ LED أحمر <span class='ltr'>(V<sub>f</sub> ≈ 2.0 V)</span> على مصدر <span class='ltr'>5 V</span> بتيار مستهدف <span class='ltr'>15 mA</span>.",
      figure: fig(ledCircuit(5, 220, 2.0), "مصدر 5 فولت ومقاومة و LED على التوالي"),
      steps: [
        { id: "s1", label: "كم جهدًا يجب أن تأخذه المقاومة؟", symbol: "v<sub>R</sub> =", answer: 3, units: V, unitDefault: 1,
          diagnose: [{ value: 5, type: "conceptual", why: "نسيت هبوط الجهد على الـ LED. بـ KVL: <span class='ltr'>v<sub>R</sub> = V<sub>s</sub> − V<sub>f</sub></span>.", review: R("c1-elements-3", "laws", "KVL") }, { value: 2, type: "substitution", why: "هذا جهد الـ LED نفسه. المقاومة تأخذ الباقي من 5 V." }],
          hints: [eqi("V<sub>s</sub> = v<sub>R</sub> + V<sub>f</sub>")], solution: eqi("v<sub>R</sub> = 5 − 2 = 3 V") },
        { id: "s2", label: "احسب قيمة المقاومة المثالية للتيار المستهدف.", symbol: "R =", answer: 200, units: OHM,
          diagnose: [{ value: 5 / 0.015, type: "conceptual", why: "قسمت جهد المصدر كاملًا على التيار. المقاومة تأخذ 3 V فقط.", review: R("c1-elements-2", "laws", "قانون أوم") }, { value: 2 / 0.015, type: "substitution", why: "قسمت جهد الـ LED بدل جهد المقاومة." }, { value: 3 / 15, type: "unit", why: "التيار 15 mA = 0.015 A. حوّل إلى A قبل القسمة." }],
          hints: [eqi("R = v<sub>R</sub> / i")], solution: eqi("R = 3 / 0.015 = 200 Ω") },
        { id: "s3", kind: "choice", label: "200 Ω ليست قيمة قياسية. أي قيمة من سلسلة E12 تختار؟", options: [
          { t: "<span class='ltr'>220 Ω</span>", correct: true },
          { t: "<span class='ltr'>180 Ω</span>", type: "conceptual", why: "مقاومة أصغر ترفع التيار فوق 15 mA (≈ 16.7 mA). نختار القيمة القياسية الأكبر حتى لا يتجاوز التيار الهدف." },
          { t: "<span class='ltr'>2.2 kΩ</span>", type: "unit", why: "هذه أكبر بعشر مرات: التيار يصبح ≈ 1.4 mA والـ LED خافت جدًا." } ],
          hints: ["القيم القياسية القريبة: 180 Ω و 220 Ω. أيهما يبقي التيار تحت الهدف؟"], solution: "220 Ω: أقرب قيمة قياسية أكبر من 200 Ω." },
        { id: "s4", label: "احسب التيار الفعلي مع 220 Ω.", symbol: "i =", answer: L1.i, units: A, unitDefault: 0,
          diagnose: [{ value: 5 / 220, type: "conceptual", why: "نسيت جهد الـ LED: <span class='ltr'>i = (V<sub>s</sub> − V<sub>f</sub>)/R</span>." }],
          hints: [eqi("i = (5 − 2) / 220")], solution: eqi("i = 3 / 220 = " + si(L1.i, "A")) },
        { id: "s5", label: "احسب القدرة التي تبددها المقاومة.", symbol: "p<sub>R</sub> =", answer: L1.pR, units: W, unitDefault: 0,
          diagnose: [{ value: 5 * L1.i, type: "substitution", why: "استخدمت جهد المصدر. قدرة المقاومة = جهدها × تيارها = <span class='ltr'>3 V × i</span>.", review: R("c1-variables-4", "laws", "p = vi") }, { value: L1.i * 220, type: "formula", why: "هذا <span class='ltr'>iR</span> = جهد المقاومة، وليس قدرتها. القدرة <span class='ltr'>i²R</span>." }],
          hints: [eqi("p = i²R = v<sub>R</sub> i")], solution: eqi("p<sub>R</sub> = (" + si(L1.i, "A") + ")² × 220 = " + si(L1.pR, "W")) + " ← أقل بكثير من 125 mW ✓" }
      ]
    },
    sim: {
      intro: "غيّر القيم، والمحرك يحل الدائرة ويفحص الشروط.",
      controls: [
        { id: "vs", label: "جهد المصدر", type: "select", options: opts([3.3, 5, 9, 12], "V"), def: 5 },
        { id: "led", label: "لون الـ LED", type: "select", options: LEDS.map(function (x) { return { v: x.v, l: x.l }; }), def: "red" },
        { id: "r", label: "المقاومة (E12)", type: "select", options: opts(e12(47, 2200), "Ω"), def: 220 }
      ],
      compute: function (v) {
        var vf = LEDS.filter(function (x) { return x.v === v.led; })[0].vf, s = ledSolve(+v.vs, +v.r, vf);
        return {
          circuit: s.c,
          readings: [["تيار الدائرة", si(s.i, "A")], ["جهد المقاومة", si(s.vR, "V")], ["قدرة المقاومة", si(s.pR, "W")], ["قدرة الـ LED", si(s.pLED, "W")], ["القدرة من المصدر", si(s.pS, "W")], ["نسبة القدرة التي تصل الـ LED", s.on ? Math.round(s.pLED / s.pS * 100) + "%" : "—"]],
          checks: [
            { t: "الـ LED يضيء: جهد المصدر أكبر من <span class='ltr'>V<sub>f</sub></span>", ok: s.on },
            { t: "التيار لا يتجاوز 20 mA", ok: s.on && s.i <= 0.020 + 1e-9 },
            { t: "التيار 5 mA على الأقل (إضاءة واضحة)", ok: s.i >= 0.005 },
            { t: "قدرة المقاومة أقل من 125 mW", ok: s.pR <= 0.125 }
          ],
          expected: { vR: s.vR, vLED: s.vLED, i: s.i },
          design: ["المصدر " + si(+v.vs, "V"), "LED " + LEDS.filter(function (x) { return x.v === v.led; })[0].l, "R = " + si(+v.r, "Ω")]
        };
      }
    },
    parts: [["لوحة تجارب", "1"], ["LED أحمر 5 mm", "1"], ["مقاومة 220 Ω", "1"], ["مصدر 5 V (USB أو Arduino)", "1"], ["أسلاك وملتيميتر", "—"]],
    safety: ["افصل المصدر قبل أي تعديل.", "لا توصل الـ LED بدون المقاومة."],
    build: [
      { t: "المقاومة 220 Ω (أحمر-أحمر-بني) من c3 إلى c8، وسلك أحمر من خط + إلى a3.", add: [{ k: "res", id: "r", a: "c3", b: "c8", ohm: 220 }, { k: "wire", id: "w1", a: "T+3", b: "a3", c: "red" }] },
      { t: "الـ LED: الطرف الطويل في d8 والقصير في d11، وسلك أسود من a11 إلى خط −.", add: [{ k: "led", id: "led", a: "d8", b: "d11", color: "red" }, { k: "wire", id: "w2", a: "a11", b: "T-11", c: "black" }] },
      { t: "صل المصدر: الأحمر على خط + والأسود على خط −. يجب أن يضيء الـ LED.", add: [{ k: "src", id: "s", label: "USB 5 V", power: true, pins: [{ name: "+5V", to: "T+1", c: "red" }, { name: "GND", to: "T-1", c: "black" }] }] },
      { t: "قس جهد المقاومة: الملتيميتر على V، والمجسان في b3 و b8.", add: [{ k: "meter", id: "m1", a: "b3", b: "b8", mode: "V DC" }] },
      { t: "قس التيار: انزع السلك الأحمر، وضع الملتيميتر (mA) بين خط + و a3.", remove: ["w1", "m1"], add: [{ k: "meter", id: "m2", a: "T+3", b: "a3", mode: "mA" }] }
    ],
    test: {
      intro: "المتوقع محسوب من تصميمك في المحاكاة.",
      quantities: [{ id: "vR", label: "جهد المقاومة", units: V, def: 1 }, { id: "vLED", label: "جهد الـ LED", units: V, def: 1 }, { id: "i", label: "التيار", units: A, def: 0 }],
      tol: 0.1,
      analyze: function (m, v) {
        var out = [];
        if (m.vR != null && m.i != null && m.i > 0) {
          var rr = m.vR / m.i, ok = Math.abs(rr - v.r) / v.r <= 0.1;
          out.push((ok ? "✓ " : "⚠ ") + "من قياسك: <span class='ltr'>v<sub>R</sub>/i = " + si(rr, "Ω") + "</span>" + (ok ? "، يطابق قيمة المقاومة " + si(+v.r, "Ω") + " (قانون أوم يتحقق على دائرتك)." : "، بعيد عن " + si(+v.r, "Ω") + ". تأكد من قيمة المقاومة المركبة، ومن أن الأميتر على التوالي."));
        }
        if (m.vLED != null) out.push("جهد التشغيل الحقيقي لقطعتك ≈ <span class='ltr'>" + si(m.vLED, "V") + "</span>. إذا اختلف عن القيمة النموذجية فهذا طبيعي؛ أعد حساب R به إن احتجت دقة أعلى.");
        if (m.vR != null && m.vLED != null) out.push("جهد المصدر الفعلي من KVL: <span class='ltr'>v<sub>R</sub> + v<sub>LED</sub> = " + si(m.vR + m.vLED, "V") + "</span> (منفذ USB يكون عادة بين 4.75 و 5.25 V).");
        return out;
      },
      causes: ["سماحية المقاومة ±5%.", "V<sub>f</sub> الحقيقي يختلف حسب القطعة.", "منفذ USB ليس 5 V بالضبط."]
    }
  };
  order.push("led-indicator");

  /* ===================================================================
     2. Light sensor: LDR voltage divider read by an ADC
     =================================================================== */
  function ldrCircuit(Vs, Rf, Rldr) {
    var c = { rows: 3, cols: 2, showGround: true, edges: [
      E([0, 0], [2, 0], "V", Vs, { plus: "a", name: "Vs" }),
      E([0, 0], [0, 1], "W"),
      E([0, 1], [1, 1], "R", Rf, { name: "R" }),
      E([1, 1], [2, 1], "R", Rldr, { name: "LDR", variable: true }),
      E([2, 0], [2, 1], "W")] };
    c.nodeLabels = [{ at: [1, 1], text: "v<tspan font-size='0.7em' dy='3'>out</tspan>", name: "out" }];
    return c;
  }
  function vout(Vs, Rf, Rl) { var c = ldrCircuit(Vs, Rf, Rl), s = solve(c); return { c: c, v: s.volt([1, 1]), i: s.byName.R.i }; }
  var L2 = { light: 1000, dark: 50000 }; L2.ropt = Math.sqrt(L2.light * L2.dark);
  L2.vl = vout(5, 6800, L2.light).v; L2.vd = vout(5, 6800, L2.dark).v; L2.adc = L2.vd / 5 * 1023;
  P["light-sensor"] = {
    id: "light-sensor", ar: "حساس ضوء بمجزّئ جهد", en: "Light Sensor with a Voltage Divider", level: "مبتدئ",
    lessons: ["c1-resistive-3", "c1-resistive-1", "c1-elements-2"],
    summary: "تحوّل تغيّر مقاومة LDR مع الضوء إلى جهد يقرؤه Arduino، وتختار المقاومة الثابتة التي تعطي أوضح فرق بين الضوء والظلام.",
    idea: {
      html: "<p>مقاومة الـ LDR تقل مع الضوء، والـ Arduino يقرأ جهدًا. نضعها في مجزّئ جهد مع مقاومة ثابتة R. أكبر فرق بين الضوء والظلام عند <span class='ltr'>R = √(R<sub>light</sub> · R<sub>dark</sub>)</span>.</p>",
      specs: ["مصدر 5 V ومدخل A0 في Arduino Uno (يقرأ 0 إلى 1023).", "قس الـ LDR بنفسك؛ المثال: 1 kΩ في الضوء و 50 kΩ في الظلام.", "الفرق بين الجهدين 2 V على الأقل، والتيار أقل من 1 mA."]
    },
    design: {
      prompt: "LDR مقاومته <span class='ltr'>1 kΩ</span> في ضوء الغرفة و <span class='ltr'>50 kΩ</span> في الظلام (قيم هذا المثال)، والمصدر <span class='ltr'>5 V</span>.",
      figure: fig(ldrCircuit(5, 6800, 1000), "مجزئ جهد من مقاومة ثابتة ومقاومة ضوئية"),
      steps: [
        { id: "s1", label: "احسب قيمة R المثلى لأكبر فرق بين الضوء والظلام.", symbol: "R =", answer: L2.ropt, units: OHM, unitDefault: 1,
          diagnose: [{ value: (L2.light + L2.dark) / 2, type: "formula", why: "أخذت المتوسط الحسابي. القيمة المثلى هي المتوسط الهندسي <span class='ltr'>√(R<sub>light</sub> R<sub>dark</sub>)</span>." }, { value: L2.light * L2.dark, type: "formula", why: "نسيت الجذر التربيعي." }],
          hints: [eqi("R = √(R<sub>light</sub> · R<sub>dark</sub>)")], solution: eqi("√(1000 × 50000) = " + si(L2.ropt, "Ω")) },
        { id: "s2", kind: "choice", label: "أقرب قيمة قياسية (E12):", options: [
          { t: "<span class='ltr'>6.8 kΩ</span>", correct: true },
          { t: "<span class='ltr'>8.2 kΩ</span>", type: "math", why: "7.07 kΩ أقرب إلى 6.8 kΩ (فرق 0.27) منها إلى 8.2 kΩ (فرق 1.13). كلاهما يعمل، لكن الأقرب يعطي فرقًا أكبر." },
          { t: "<span class='ltr'>68 kΩ</span>", type: "unit", why: "هذه أكبر بعشر مرات." } ],
          hints: ["القيم القياسية حول 7 kΩ في E12: 6.8 kΩ و 8.2 kΩ."], solution: "6.8 kΩ." },
        { id: "s3", label: "احسب جهد الخرج في الضوء (مع 6.8 kΩ).", symbol: "v<sub>out</sub> =", answer: L2.vl, units: V, unitDefault: 1,
          diagnose: [{ value: 5 * 6800 / 7800, type: "substitution", why: "وضعت R في البسط. الخرج مأخوذ على الـ LDR (الأسفل)، فبسط قاعدة المجزّئ هو R<sub>LDR</sub>.", review: R("c1-resistive-3", "laws", "قاعدة مجزّئ الجهد") }],
          hints: [eqi("v<sub>out</sub> = 5 × 1000 / (6800 + 1000)")], solution: eqi("5 × 1 / 7.8 = " + si(L2.vl, "V")) },
        { id: "s4", label: "احسب جهد الخرج في الظلام.", symbol: "v<sub>out</sub> =", answer: L2.vd, units: V, unitDefault: 1,
          diagnose: [{ value: 5 * 6800 / 56800, type: "substitution", why: "وضعت R في البسط. الخرج على الـ LDR." }],
          hints: [eqi("v<sub>out</sub> = 5 × 50 / (6.8 + 50)")], solution: eqi("5 × 50 / 56.8 = " + si(L2.vd, "V")) + " ← الفرق " + si(L2.vd - L2.vl, "V") + " ✓" },
        { id: "s5", label: "ما قراءة <span class='ltr'>analogRead</span> في الظلام؟", symbol: "ADC =", answer: L2.adc, units: NONE,
          diagnose: [{ value: L2.vd / 5 * 255, type: "unit", why: "محوّل Arduino Uno دقته 10 bits (0 إلى 1023)، وليس 8 bits (0 إلى 255)." }, { value: L2.vd * 1023, type: "formula", why: "نسيت القسمة على جهد المرجع 5 V." }],
          hints: [eqi("ADC = v<sub>out</sub> / 5 × 1023")], solution: eqi(n(L2.vd) + " / 5 × 1023 ≈ " + Math.round(L2.adc)) }
      ]
    },
    sim: {
      intro: "أدخل قيم الـ LDR التي قستها، وجرّب مقاومات مختلفة.",
      controls: [
        { id: "vs", label: "جهد المصدر", type: "select", options: opts([3.3, 5], "V"), def: 5 },
        { id: "rl", label: "LDR في الضوء (kΩ)", type: "number", min: 0.05, max: 1000, step: "any", def: 1 },
        { id: "rd", label: "LDR في الظلام (kΩ)", type: "number", min: 0.05, max: 10000, step: "any", def: 50 },
        { id: "r", label: "المقاومة الثابتة (E12)", type: "select", options: opts(e12(1000, 100000), "Ω"), def: 6800 }
      ],
      compute: function (v) {
        var Vs = +v.vs, rl = +v.rl * 1e3, rd = +v.rd * 1e3, Rf = +v.r;
        if (!(rl > 0 && rd > 0)) return { error: "أدخل مقاومتين موجبتين للـ LDR." };
        var a = vout(Vs, Rf, rl), b = vout(Vs, Rf, rd), sw = Math.abs(b.v - a.v), imax = Math.max(a.i, b.i), ropt = Math.sqrt(rl * rd);
        return {
          circuit: a.c,
          readings: [["v<sub>out</sub> في الضوء", si(a.v, "V")], ["v<sub>out</sub> في الظلام", si(b.v, "V")], ["الفرق", si(sw, "V")], ["قراءة ADC (ضوء ← ظلام)", Math.round(a.v / Vs * 1023) + " ← " + Math.round(b.v / Vs * 1023)], ["أكبر تيار في المجزّئ", si(imax, "A")], ["R المثلى لقيمك", si(ropt, "Ω")]],
          checks: [
            { t: "الفرق بين الضوء والظلام 2 V على الأقل", ok: sw >= 2 },
            { t: "تيار المجزّئ لا يتجاوز 1 mA", ok: imax <= 1e-3 + 1e-12 },
            { t: "مقاومة الظلام أكبر من مقاومة الضوء (قيم منطقية)", ok: rd > rl }
          ],
          expected: { vl: a.v, vd: b.v },
          design: ["المصدر " + si(Vs, "V"), "LDR: " + si(rl, "Ω") + " (ضوء)، " + si(rd, "Ω") + " (ظلام)", "R = " + si(Rf, "Ω")]
        };
      }
    },
    parts: [["لوحة تجارب", "1"], ["LDR", "1"], ["مقاومة 6.8 kΩ", "1"], ["Arduino Uno", "1"], ["أسلاك", "—"]],
    safety: ["استخدم 5 V من الـ Arduino فقط."],
    build: [
      { t: "صل 5V من الـ Arduino بخط + و GND بخط −.", add: [{ k: "src", id: "s", label: "Arduino Uno", power: true, pins: [{ name: "5V", to: "T+1", c: "red" }, { name: "GND", to: "T-1", c: "black" }] }] },
      { t: "R = 6.8 kΩ (أزرق-رمادي-أحمر) من c4 إلى c9، وسلك أحمر من + إلى a4.", add: [{ k: "res", id: "r", a: "c4", b: "c9", ohm: 6800 }, { k: "wire", id: "w1", a: "T+4", b: "a4", c: "red" }] },
      { t: "الـ LDR من d9 إلى d12، وسلك أسود من a12 إلى −.", add: [{ k: "ldr", id: "ldr", a: "d9", b: "d12" }, { k: "wire", id: "w2", a: "a12", b: "T-13", c: "black" }] },
      { t: "سلك من e9 (نقطة v<sub>out</sub>) إلى A0، ثم اطبع <span class='ltr'>analogRead(A0)</span> وغطِّ الـ LDR لتقارن.", remove: ["s"], add: [{ k: "src", id: "s2", label: "Arduino Uno", power: true, pins: [{ name: "5V", to: "T+1", c: "red" }, { name: "GND", to: "T-1", c: "black" }, { name: "A0", to: "e9", c: "yellow" }] }] }
    ],
    test: {
      intro: "أدخل v<sub>out</sub> المقاس، أو احسبه من القراءة: <span class='ltr'>ADC × 5 / 1023</span>.",
      quantities: [{ id: "vl", label: "v<sub>out</sub> في الضوء", units: V, def: 1 }, { id: "vd", label: "v<sub>out</sub> في الظلام", units: V, def: 1 }],
      tol: 0.1,
      analyze: function (m, v) {
        var out = [], Rf = +v.r;
        [["vl", "الضوء"], ["vd", "الظلام"]].forEach(function (k) {
          var vv = m[k[0]], Vs = +v.vs;
          if (vv != null && vv > 0 && vv < Vs) out.push("من قياسك في " + k[1] + ": مقاومة الـ LDR الفعلية <span class='ltr'>R<sub>LDR</sub> = R · v<sub>out</sub> / (V<sub>s</sub> − v<sub>out</sub>) = " + si(Rf * vv / (Vs - vv), "Ω") + "</span>.");
        });
        if (m.vl != null && m.vd != null && m.vl > m.vd) out.push("⚠ الجهد في الضوء أكبر منه في الظلام: على الأغلب الـ LDR في الأعلى و R في الأسفل. هذا يعمل أيضًا لكن الاتجاه معكوس.");
        return out;
      },
      causes: ["الإضاءة تغيّرت منذ قياس الـ LDR.", "سماحية R ±5%."]
    }
  };
  order.push("light-sensor");

  /* ===================================================================
     3. Temperature alarm: NTC thermistor in a Wheatstone bridge
     =================================================================== */
  var T0 = 273.15;
  function ntc(Tc, R25, B) { return R25 * Math.exp(B * (1 / (Tc + T0) - 1 / (25 + T0))); }
  function bridge(Vs, R1, R2, R3, Rt) {
    return { rows: 3, cols: 3, edges: [
      E([0, 0], [2, 0], "V", Vs, { plus: "a", name: "Vs" }),
      E([0, 0], [0, 1], "W"), E([0, 1], [0, 2], "W"),
      E([0, 1], [1, 1], "R", R1, { name: "R1" }), E([1, 1], [2, 1], "R", R2, { name: "R2" }),
      E([0, 2], [1, 2], "R", R3, { name: "R3" }), E([1, 2], [2, 2], "R", Rt, { name: "NTC", variable: true, vtext: si(Rt, "Ω") }),
      E([2, 0], [2, 1], "W"), E([2, 1], [2, 2], "W"),
      E([1, 1], [1, 2], "T", 0, { name: "ab" })] };
  }
  function bsolve(Vs, R1, R2, R3, Rt) {
    var c = bridge(Vs, R1, R2, R3, Rt), s = solve(c);
    return { c: c, va: s.volt([1, 1]), vb: s.volt([1, 2]), vab: s.volt([1, 1]) - s.volt([1, 2]), rth: par(R1, R2) + par(R3, Rt), is: -s.byName.Vs.i, pt: s.byName.NTC.p };
  }
  var L3 = { R25: 10000, B: 3950 };
  L3.r40 = ntc(40, L3.R25, L3.B); L3.r30 = ntc(30, L3.R25, L3.B);
  L3.b40 = bsolve(5, 10000, 10000, 10000, L3.r40);
  P["temp-alarm"] = {
    id: "temp-alarm", ar: "إنذار حرارة بجسر ويتستون", en: "Temperature Alarm with a Wheatstone Bridge", level: "متوسط",
    lessons: ["c1-resistive-3", "c1-techniques-9", "c1-techniques-1"],
    summary: "ثرمستور NTC في جسر ويتستون: الجسر متزن عند درجة الضبط، وإشارة خرجه تخبرك هل الحرارة أعلى منها أم أقل.",
    idea: {
      html: "<p>مقاومة الثرمستور NTC تقل مع الحرارة. خرج جسر ويتستون <span class='ltr'>v<sub>ab</sub> = 0</span> عندما <span class='ltr'>R1/R2 = R3/R<sub>NTC</sub></span>، فنختار R3 ليتزن عند درجة الضبط: فوقها الخرج موجب، وتحتها سالب.</p>",
      specs: ["NTC: 10 kΩ عند 25°C و B = 3950 K (تحقق من ورقة البيانات).", "R1 = R2 = 10 kΩ، والمصدر 5 V.", "الاتزان عند 30°C (±1°C)، وقدرة الثرمستور أقل من 1 mW."]
    },
    design: {
      prompt: "الجسر بـ <span class='ltr'>R1 = R2 = R3 = 10 kΩ</span> وثرمستور <span class='ltr'>10 kΩ @ 25°C، B = 3950 K</span>، والمصدر <span class='ltr'>5 V</span>.",
      figure: fig(bridge(5, 10000, 10000, 10000, L3.r40), "جسر ويتستون بأربع مقاومات أحدها ثرمستور، والخرج بين a و b"),
      steps: [
        { id: "s1", label: "احسب مقاومة الثرمستور عند 40°C.", symbol: "R<sub>NTC</sub> =", answer: L3.r40, units: OHM, unitDefault: 1,
          diagnose: [{ value: L3.R25 * Math.exp(L3.B * (1 / 40 - 1 / 25)), type: "unit", why: "استخدمت درجات مئوية في الصيغة. حوّل إلى كلفن: <span class='ltr'>T = 40 + 273.15 = 313.15 K</span>." }, { value: L3.R25 * Math.exp(-L3.B * (1 / (40 + T0) - 1 / (25 + T0))), type: "sign", why: "عكست ترتيب الطرح في الأس. الصحيح <span class='ltr'>1/T − 1/T<sub>25</sub></span>، ومع T أكبر يكون سالبًا فتقل المقاومة (NTC)." }],
          hints: ["حوّل الحرارتين إلى كلفن أولًا.", eqi("R = 10000 · exp[3950 (1/313.15 − 1/298.15)]")], solution: eqi("R<sub>NTC</sub>(40°C) = " + si(L3.r40, "Ω")) },
        { id: "s2", label: "احسب جهد النقطة a (منتصف R1 و R2) بالنسبة للأرضي.", symbol: "v<sub>a</sub> =", answer: L3.b40.va, units: V, unitDefault: 1,
          diagnose: [{ value: 5, type: "conceptual", why: "الفرع R1–R2 مجزّئ جهد؛ النقطة a في منتصفه." }],
          hints: [eqi("v<sub>a</sub> = 5 × R2 / (R1 + R2)")], solution: eqi("5 × 10/20 = 2.5 V") },
        { id: "s3", label: "احسب جهد النقطة b عند 40°C.", symbol: "v<sub>b</sub> =", answer: L3.b40.vb, units: V, unitDefault: 1,
          diagnose: [{ value: 5 * 10000 / (10000 + L3.r40), type: "substitution", why: "وضعت R3 في البسط. النقطة b فوق الثرمستور، فالجهد عليها = جهد الثرمستور.", review: R("c1-resistive-3", "laws", "قاعدة المجزّئ") }],
          hints: [eqi("v<sub>b</sub> = 5 × R<sub>NTC</sub> / (R3 + R<sub>NTC</sub>)")], solution: eqi("5 × " + n(L3.r40) + " / " + n(10000 + L3.r40) + " = " + si(L3.b40.vb, "V")) },
        { id: "s4", label: "احسب خرج الجسر <span class='ltr'>v<sub>ab</sub> = v<sub>a</sub> − v<sub>b</sub></span>.", symbol: "v<sub>ab</sub> =", answer: L3.b40.vab, units: V, unitDefault: 1,
          diagnose: [],
          hints: [eqi("v<sub>ab</sub> = v<sub>a</sub> − v<sub>b</sub>")], solution: eqi("2.5 − " + n(L3.b40.vb) + " = " + si(L3.b40.vab, "V")) + " (موجب: الحرارة أعلى من نقطة الاتزان 25°C)" },
        { id: "s5", label: "احسب مقاومة ثيفنن بين a و b عند 40°C (ما يراه جهاز القياس).", symbol: "R<sub>Th</sub> =", answer: L3.b40.rth, units: OHM, unitDefault: 1,
          diagnose: [{ value: 10000 + 10000 + 10000 + L3.r40, type: "conceptual", why: "جمعت كل المقاومات على التوالي. بعد قصر المصدر يصبح R1 ∥ R2 على التوالي مع R3 ∥ R<sub>NTC</sub>.", review: R("c1-techniques-9", "laws", "مقاومة ثيفنن") }, { value: par(20000, 10000 + L3.r40), type: "conceptual", why: "هذه المقاومة بين طرفي المصدر. بين a و b: <span class='ltr'>(R1 ∥ R2) + (R3 ∥ R<sub>NTC</sub>)</span>." }],
          hints: ["أطفئ المصدر (قصر): R1 و R2 يصبحان على التوازي، وكذلك R3 و R<sub>NTC</sub>."], solution: eqi("5 kΩ + (10k ∥ " + n(L3.r40 / 1000) + "k) = " + si(L3.b40.rth, "Ω")) + " ← ملتيميتر مقاومته الداخلية 10 MΩ لا يؤثر تقريبًا." },
        { id: "s6", label: "ما قيمة R3 التي تجعل الجسر يتزن عند 30°C؟", symbol: "R3 =", answer: L3.r30, units: OHM, unitDefault: 1,
          diagnose: [{ value: L3.R25, type: "conceptual", why: "10 kΩ تجعله متزنًا عند 25°C. المطلوب 30°C: R3 = R<sub>NTC</sub>(30°C)." }],
          hints: [eqi("R1/R2 = R3/R<sub>NTC</sub>") + " ومع R1 = R2: " + eqi("R3 = R<sub>NTC</sub>(30°C)")], solution: eqi("R3 = " + si(L3.r30, "Ω")) + " ← أقرب قيمة E12: 8.2 kΩ" }
      ]
    },
    sim: {
      intro: "حرّك الحرارة، واختر R3 ليتزن الجسر عند 30°C.",
      controls: [
        { id: "t", label: "الحرارة (°C)", type: "range", min: 0, max: 80, step: 1, def: 40 },
        { id: "r3", label: "R3 (E12)", type: "select", options: opts(e12(3300, 33000), "Ω"), def: 10000 },
        { id: "b", label: "B (K) من ورقة البيانات", type: "number", min: 2000, max: 6000, step: 1, def: 3950 },
        { id: "r25", label: "R<sub>25</sub> (kΩ)", type: "number", min: 1, max: 100, step: "any", def: 10 }
      ],
      compute: function (v) {
        var B = +v.b, R25 = +v.r25 * 1e3, R3 = +v.r3, Tc = +v.t;
        if (!(B > 0 && R25 > 0)) return { error: "أدخل قيمًا موجبة لـ B و R<sub>25</sub>." };
        var Rt = ntc(Tc, R25, B), s = bsolve(5, 10000, 10000, R3, Rt);
        var Tbal = 1 / (1 / (25 + T0) + Math.log(R3 / R25) / B) - T0; // R_NTC(Tbal) = R3 · R2/R1 = R3
        var sens = Math.abs(bsolve(5, 10000, 10000, R3, ntc(31, R25, B)).vab - bsolve(5, 10000, 10000, R3, ntc(29, R25, B)).vab) / 2;
        var worst = Math.max(bsolve(5, 10000, 10000, R3, ntc(0, R25, B)).pt, bsolve(5, 10000, 10000, R3, ntc(80, R25, B)).pt, bsolve(5, 10000, 10000, R3, R3).pt);
        return {
          circuit: s.c,
          readings: [["R<sub>NTC</sub> عند " + Tc + "°C", si(Rt, "Ω")], ["v<sub>a</sub>", si(s.va, "V")], ["v<sub>b</sub>", si(s.vb, "V")], ["خرج الجسر v<sub>ab</sub>", si(s.vab, "V")], ["قراءة الإنذار", Math.abs(s.vab) < 1e-3 ? "متزن" : s.vab > 0 ? "أعلى من نقطة الاتزان" : "أقل من نقطة الاتزان"], ["درجة الاتزان مع R3 الحالية", n(Tbal) + " °C"], ["R<sub>Th</sub> بين a و b", si(s.rth, "Ω")], ["الحساسية حول 30°C", si(sens, "V") + "/°C"], ["قدرة الثرمستور الآن", si(s.pt, "W")]],
          checks: [
            { t: "الجسر يتزن بين 29°C و 31°C", ok: Math.abs(Tbal - 30) <= 1 },
            { t: "قدرة الثرمستور أقل من 1 mW في كل المدى 0–80°C", ok: worst < 1e-3 },
            { t: "حساسية الخرج حول 30°C لا تقل عن 20 mV لكل درجة", ok: sens >= 0.020 }
          ],
          expected: { vab: s.vab, vb: s.vb },
          design: ["R1 = R2 = 10 kΩ، R3 = " + si(R3, "Ω"), "NTC: R<sub>25</sub> = " + si(R25, "Ω") + "، B = " + B + " K", "الحرارة في المحاكاة " + Tc + "°C، درجة الاتزان " + n(Tbal) + "°C"]
        };
      }
    },
    parts: [["لوحة تجارب", "1"], ["NTC 10 kΩ", "1"], ["مقاومات 10 kΩ", "2"], ["مقاومة 8.2 kΩ", "1"], ["مصدر 5 V وملتيميتر", "—"]],
    safety: ["سخّن الثرمستور بيدك فقط؛ لا لهب ولا ماء."],
    build: [
      { t: "صل المصدر بالخطين العلويين، ثم وصّلهما بالخطين السفليين.", add: [{ k: "src", id: "s", label: "USB 5 V", power: true, pins: [{ name: "+5V", to: "T+1", c: "red" }, { name: "GND", to: "T-1", c: "black" }] }, { k: "wire", id: "wp", a: "T+2", b: "B+2", c: "red" }, { k: "wire", id: "wn", a: "T-3", b: "B-3", c: "black" }] },
      { t: "الفرع الأول: R1 من c5 إلى c9 و R2 من d9 إلى d14 (بني-أسود-برتقالي)، وسلكان: + إلى a5، و a14 إلى −.", add: [{ k: "res", id: "r1", a: "c5", b: "c9", ohm: 10000 }, { k: "res", id: "r2", a: "d9", b: "d14", ohm: 10000 }, { k: "wire", id: "w1", a: "T+5", b: "a5", c: "red" }, { k: "wire", id: "w2", a: "a14", b: "T-14", c: "black" }] },
      { t: "الفرع الثاني: R3 = 8.2 kΩ (رمادي-أحمر-أحمر) من h5 إلى h9، والثرمستور من g9 إلى g14، وسلكان: j5 إلى B+، و j14 إلى B−.", add: [{ k: "res", id: "r3", a: "h5", b: "h9", ohm: 8200 }, { k: "ntc", id: "ntc", a: "g9", b: "g14" }, { k: "wire", id: "w3", a: "j5", b: "B+5", c: "red" }, { k: "wire", id: "w4", a: "j14", b: "B-14", c: "black" }] },
      { t: "الملتيميتر (V): الأحمر في e9 (النقطة a) والأسود في f9 (النقطة b). سجّل v<sub>ab</sub>، ثم أمسك الثرمستور دقيقة وسجّل مرة أخرى.", add: [{ k: "meter", id: "m", a: "e9", b: "f9", mode: "V DC", y: 150 }] }
    ],
    test: {
      intro: "اضبط حرارة المحاكاة على حرارة غرفتك ثم أدخل القياس.",
      quantities: [{ id: "vab", label: "خرج الجسر v<sub>ab</sub>", units: V, def: 0 }, { id: "vb", label: "جهد النقطة b", units: V, def: 1 }],
      tol: 0.15,
      analyze: function (m, v) {
        var out = [], R25 = +v.r25 * 1e3, B = +v.b, R3 = +v.r3;
        if (m.vb != null && m.vb > 0 && m.vb < 5) {
          var Rt = R3 * m.vb / (5 - m.vb), Tm = 1 / (1 / (25 + T0) + Math.log(Rt / R25) / B) - T0;
          out.push("من v<sub>b</sub> المقاسة: <span class='ltr'>R<sub>NTC</sub> = " + si(Rt, "Ω") + "</span>، أي أن الحرارة عند الثرمستور ≈ <span class='ltr'>" + n(Tm) + " °C</span>. قارنها بميزان الحرارة.");
        }
        if (m.vab != null && m.vb != null) { var va = m.vab + m.vb; out.push("جهد a المستنتج <span class='ltr'>v<sub>ab</sub> + v<sub>b</sub> = " + si(va, "V") + "</span>" + (Math.abs(va - 2.5) < 0.15 ? " ✓ قريب من 2.5 V." : " ⚠ بعيد عن 2.5 V: تأكد من R1 و R2 ومن جهد المصدر.")); }
        return out;
      },
      causes: ["R<sub>25</sub> و B لقطعتك تختلف عن النموذجية.", "حرارة الثرمستور تتأخر عن الهواء."]
    }
  };
  order.push("temp-alarm");

  /* ===================================================================
     4. RC low-pass filter measured with a signal generator and scope
     =================================================================== */
  function rcCircuit(Vm, Rv, Cv, f) {
    return { rows: 2, cols: 3, omega: Math.round(2 * Math.PI * f), edges: [
      E([0, 0], [1, 0], "V", Vm, { phase: 0, plus: "a", name: "Vin" }),
      E([0, 0], [0, 1], "R", Rv, { name: "R" }),
      E([0, 1], [1, 1], "C", Cv, { name: "C" }),
      E([0, 1], [0, 2], "W"), E([0, 2], [1, 2], "T", 0, { name: "out" }),
      E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
  }
  function rcSolve(Vm, Rv, Cv, f) {
    var c = rcCircuit(Vm, Rv, Cv, f), w = 2 * Math.PI * f;
    var s = CV.ac.solve({ rows: 2, cols: 3, omega: w, edges: c.edges.filter(function (e) { return e.type !== "T"; }) });
    var vo = s.byName.C.v;
    return { c: c, vo: vo, zc: CV.ac.impedance(s.byName.C.edge, w), mag: CV.ac.C.abs(vo), ph: CV.ac.C.arg(vo), h: CV.ac.C.abs(vo) / Vm };
  }
  var L4 = { R: 1000, f: 1000, Vm: 5 }; L4.copt = 1 / (2 * Math.PI * L4.f * L4.R);
  L4.s1k = rcSolve(5, 1000, 150e-9, 1000); L4.s10k = rcSolve(5, 1000, 150e-9, 10000);
  P["rc-filter"] = {
    id: "rc-filter", ar: "مرشح RC تمرير منخفض", en: "RC Low-Pass Filter", level: "متوسط",
    lessons: ["c1-sinusoidal-3", "c1-sinusoidal-5", "c1-sinusoidal-9"],
    summary: "تصمم مرشحًا يمرر الترددات المنخفضة ويضعف العالية، وتقيس مقدار الخرج وطوره بالأوسيلوسكوب وتقارنه بتحليل الفيزورات.",
    idea: {
      html: "<p>ممانعة المكثف <span class='ltr'>−j/(ωC)</span> كبيرة في الترددات المنخفضة وصغيرة في العالية، فالخرج على المكثف يمرر المنخفض. عند <span class='ltr'>f<sub>c</sub> = 1/(2πRC)</span> يصبح الخرج <span class='ltr'>V<sub>in</sub>/√2</span> ويتأخر 45°.</p>",
      specs: ["دخل جيبي 5 V قيمة عظمى، و R = 1 kΩ.", "عند 1 kHz: الخرج بين 0.65 و 0.75 من الدخل.", "عند 100 Hz يمر 95% على الأقل، وعند 10 kHz لا يتجاوز 15%."]
    },
    design: {
      prompt: "مرشح RC بـ <span class='ltr'>R = 1 kΩ</span> والدخل <span class='ltr'>5∠0° V</span> (قيمة عظمى)، والمطلوب تردد قطع <span class='ltr'>1 kHz</span>.",
      figure: fig(rcCircuit(5, 1000, 150e-9, 1000), "مصدر جيبي ومقاومة ومكثف، والخرج على المكثف"),
      steps: [
        { id: "s1", label: "احسب سعة المكثف المثالية لتردد القطع.", symbol: "C =", answer: L4.copt, units: NF,
          diagnose: [{ value: 1 / (L4.f * L4.R), type: "unit", why: "استخدمت f بدل ω = 2πf. <span class='ltr'>C = 1/(2π f<sub>c</sub> R)</span>.", review: R("c1-sinusoidal-1", "laws", "ω = 2πf") }],
          hints: [eqi("|Z<sub>C</sub>| = R ⇒ 1/(2πf C) = R")], solution: eqi("C = 1/(2π × 1000 × 1000) = " + si(L4.copt, "F")) },
        { id: "s2", kind: "choice", label: "أقرب قيمة قياسية (E12):", options: [
          { t: "<span class='ltr'>150 nF</span>", correct: true },
          { t: "<span class='ltr'>180 nF</span>", type: "math", why: "159 nF أقرب إلى 150 nF (فرق 9) منها إلى 180 nF (فرق 21)." },
          { t: "<span class='ltr'>1.5 µF</span>", type: "unit", why: "أكبر بعشر مرات: تردد القطع يصبح ≈ 106 Hz." } ],
          hints: ["القيم حول 159 nF: 150 nF و 180 nF."], solution: "150 nF ← تردد القطع الفعلي " + si(1 / (2 * Math.PI * 1000 * 150e-9), "Hz") },
        { id: "s3", kind: "phasor", form: "rect", label: "احسب ممانعة المكثف (150 nF) عند 1 kHz.", answer: L4.s1k.zc, units: OHM,
          diagnose: [{ value: CV.ac.C.conj(L4.s1k.zc), type: "sign", why: "ممانعة المكثف سالبة التخيلي: <span class='ltr'>−j/(ωC)</span>.", review: R("c1-sinusoidal-3", "laws", "ممانعة المكثف") }],
          hints: [eqi("Z<sub>C</sub> = −j / (2π × 1000 × 150×10⁻⁹)")], solution: eqi("Z<sub>C</sub> = " + CV.ac.rect(L4.s1k.zc) + " Ω") },
        { id: "s4", kind: "phasor", form: "polar", label: "احسب فيزور جهد الخرج عند 1 kHz.", answer: L4.s1k.vo, units: V,
          diagnose: [{ value: CV.ac.C.div(CV.ac.C.scale(CV.ac.C.c(1000), 5), CV.ac.C.add(CV.ac.C.c(1000), L4.s1k.zc)), type: "substitution", why: "هذا الجهد على المقاومة. الخرج على المكثف، فـ Z<sub>C</sub> في البسط.", review: R("c1-sinusoidal-5", "laws", "مجزّئ الجهد بالممانعات") }],
          hints: [eqi("V<sub>out</sub> = 5 × Z<sub>C</sub> / (1000 + Z<sub>C</sub>)")], solution: eqi("V<sub>out</sub> = " + CV.ac.polar(L4.s1k.vo, "V")) + " (يتأخر عن الدخل)" },
        { id: "s5", label: "احسب مقدار الخرج عند 10 kHz.", symbol: "|V<sub>out</sub>| =", answer: L4.s10k.mag, units: V, unitDefault: 1,
          diagnose: [{ value: rcSolve(5, 1000, 150e-9, 10000 / (2 * Math.PI)).mag, type: "unit", why: "استخدمت ω = 10000 بدل ω = 2π × 10000." }, { value: L4.s1k.mag / 10, type: "conceptual", why: "قسمت خرج 1 kHz على 10. العلاقة ليست خطية؛ احسب Z<sub>C</sub> الجديدة ثم قاعدة المجزّئ." }],
          hints: ["احسب Z<sub>C</sub> عند 10 kHz أولًا، ثم المقدار."], solution: eqi("|V<sub>out</sub>| = " + si(L4.s10k.mag, "V")) + " ← " + Math.round(L4.s10k.h * 100) + "% من الدخل" }
      ]
    },
    sim: {
      intro: "اختر R و C والتردد؛ المحرك يحل بالفيزورات.",
      controls: [
        { id: "f", label: "تردد الدخل", type: "select", options: [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map(function (x) { return { v: x, l: si(x, "Hz") }; }), def: 1000 },
        { id: "r", label: "R (E12)", type: "select", options: opts(e12(100, 10000), "Ω"), def: 1000 },
        { id: "c", label: "C (E12)", type: "select", options: opts(e12(1e-9, 1e-6), "F"), def: 150e-9 },
        { id: "vm", label: "القيمة العظمى للدخل (V)", type: "number", min: 0.1, max: 10, step: "any", def: 5 }
      ],
      compute: function (v) {
        var Vm = +v.vm, Rv = +v.r, Cv = +v.c, f = +v.f;
        if (!(Vm > 0)) return { error: "أدخل قيمة عظمى موجبة." };
        var s = rcSolve(Vm, Rv, Cv, f), h100 = rcSolve(1, Rv, Cv, 100).h, h1k = rcSolve(1, Rv, Cv, 1000).h, h10k = rcSolve(1, Rv, Cv, 10000).h, fc = 1 / (2 * Math.PI * Rv * Cv);
        return {
          circuit: s.c,
          readings: [["Z<sub>C</sub> عند " + si(f, "Hz"), CV.ac.rect(s.zc, "Ω")], ["V<sub>out</sub>", CV.ac.polar(s.vo, "V")], ["نسبة الخرج إلى الدخل", n(s.h) + " (" + n(20 * Math.log10(s.h)) + " dB)"], ["فرق الطور (الخرج − الدخل)", n(s.ph) + "°"], ["تأخر زمني يقابله على الشاشة", si(-s.ph / 360 / f, "s")], ["تردد القطع f<sub>c</sub> = 1/(2πRC)", si(fc, "Hz")], ["النسبة عند 100 Hz / 1 kHz / 10 kHz", n(h100) + " / " + n(h1k) + " / " + n(h10k)]],
          checks: [
            { t: "عند 1 kHz الخرج بين 0.65 و 0.75 من الدخل", ok: h1k >= 0.65 && h1k <= 0.75 },
            { t: "عند 100 Hz يمر 95% على الأقل", ok: h100 >= 0.95 },
            { t: "عند 10 kHz لا يتجاوز 15%", ok: h10k <= 0.15 }
          ],
          expected: { mag: s.mag, ph: s.ph },
          design: ["R = " + si(Rv, "Ω") + "، C = " + si(Cv, "F"), "f<sub>c</sub> = " + si(fc, "Hz"), "الدخل " + si(Vm, "V") + " قيمة عظمى عند " + si(f, "Hz")]
        };
      }
    },
    parts: [["مولد إشارة وأوسيلوسكوب", "1"], ["مقاومة 1 kΩ", "1"], ["مكثف 150 nF (مكتوب عليه 154)", "1"], ["لوحة تجارب ومجسات", "—"]],
    safety: ["اتبع تعليمات معمل الجامعة.", "كل الأرضيات في نقطة واحدة."],
    build: [
      { t: "R = 1 kΩ (بني-أسود-أحمر) من c4 إلى c9.", add: [{ k: "res", id: "r", a: "c4", b: "c9", ohm: 1000 }] },
      { t: "المكثف 150 nF (154) من d9 إلى d13، وسلك أسود من a13 إلى خط −.", add: [{ k: "cap", id: "c", a: "d9", b: "d13", code: "154" }, { k: "wire", id: "w", a: "a13", b: "T-13", c: "black" }] },
      { t: "المولد: الأحمر في a4 والأسود في خط −. اضبطه على 5 V قيمة عظمى و 1 kHz.", add: [{ k: "src", id: "g", label: "مولد إشارة", pins: [{ name: "OUT", to: "a4", c: "red" }, { name: "COM", to: "T-2", c: "black" }] }] },
      { t: "الأوسيلوسكوب: CH1 في b4، و CH2 في b9، والأرضي في خط −. قس القيمة العظمى والفرق الزمني بين القمتين؛ الطور = <span class='ltr'>−360° × f × Δt</span>.", add: [{ k: "meter", id: "o", mode: "CH1 CH2", label: "أوسيلوسكوب", leads: [{ to: "b4", c: "yellow" }, { to: "b9", c: "blue" }, { to: "T-16", c: "black" }] }] }
    ],
    test: {
      intro: "اضبط تردد المحاكاة على تردد القياس، وأدخل قراءة CH2.",
      quantities: [{ id: "mag", label: "القيمة العظمى للخرج", units: V, def: 1 }, { id: "ph", label: "فرق الطور (بالدرجات، سالب إذا تأخر)", units: [{ l: "°", f: 1 }], def: 0 }],
      tol: 0.1,
      analyze: function (m, v) {
        var out = [], Rv = +v.r, f = +v.f, Vm = +v.vm;
        if (m.mag != null && m.mag > 0 && m.mag < Vm) {
          var h = m.mag / Vm, wRC = Math.sqrt(1 / (h * h) - 1), Cm = wRC / (2 * Math.PI * f * Rv);
          out.push("من المقدار المقاس: <span class='ltr'>ωRC = √(1/h² − 1) = " + n(wRC) + "</span>، أي أن السعة الفعلية ≈ <span class='ltr'>" + si(Cm, "F") + "</span> (المصممة " + si(+v.c, "F") + ").");
        }
        if (m.ph != null && m.ph > 0) out.push("⚠ أدخلت طورًا موجبًا: الخرج على المكثف يتأخر دائمًا عن الدخل في هذه الدائرة، فالطور سالب. تحقق من أي القناتين تسبق.");
        return out;
      },
      causes: ["سماحية المكثف ±10% أو أكثر.", "مقاومة خرج المولد (50 Ω) تضاف إلى R."]
    }
  };
  order.push("rc-filter");
  /* ===================================================================
     5. Two-source mixer: superposition on a real circuit
     =================================================================== */
  function mixCircuit(V1, V2, R1, R2, RL) {
    var c = { rows: 2, cols: 3, showGround: true, edges: [
      E([0, 0], [1, 0], "V", V1, { plus: "a", name: "V1" }),
      E([0, 0], [0, 1], "R", R1, { name: "R1" }),
      E([0, 1], [1, 1], "R", RL, { name: "RL" }),
      E([0, 1], [0, 2], "R", R2, { name: "R2" }),
      E([0, 2], [1, 2], "V", V2, { plus: "a", name: "V2" }),
      E([1, 0], [1, 1], "W"), E([1, 1], [1, 2], "W")] };
    c.nodeLabels = [{ at: [0, 1], text: "v<tspan font-size='0.7em' dy='3'>out</tspan>", name: "out" }];
    return c;
  }
  function mix(V1, V2, R1, R2, RL) { var c = mixCircuit(V1, V2, R1, R2, RL), s = solve(c); return { c: c, v: s.volt([0, 1]), i1: -s.byName.V1.i, i2: -s.byName.V2.i }; }
  var L5 = { V1: 5, V2: 3, R: 10000 };
  L5.a = mix(5, 0, 1e4, 1e4, 1e4).v; L5.b = mix(0, 3, 1e4, 1e4, 1e4).v; L5.all = mix(5, 3, 1e4, 1e4, 1e4);
  L5.openA = 5 * 1e4 / 2e4; L5.openB = 3 * 1e4 / 2e4;
  P["mixer"] = {
    id: "mixer", ar: "مجمّع جهدين بالتراكب", en: "Two-Source Mixer (Superposition)", level: "مبتدئ",
    lessons: ["c1-techniques-12", "c1-techniques-1", "c1-resistive-3"],
    summary: "مصدران يغذيان نقطة واحدة عبر مقاومات، كفكرة خلاط الصوت البسيط. تحسب مساهمة كل مصدر وحده، ثم تتحقق من التراكب بالقياس.",
    idea: {
      html: "<p>في دائرة خطية، الخرج = مجموع ما يعطيه كل مصدر <b>وحده</b> مع إطفاء الباقي. مصدر الجهد المُطفأ يصبح <b>قصرًا</b> (سلكًا)، وليس دائرة مفتوحة. هذا نفس مبدأ خلاط الصوت البسيط بالمقاومات.</p>",
      specs: ["V1 = 5 V (USB)، و V2 = 3 V (بطاريتا AA).", "R1 = R2 = RL = 10 kΩ.", "لا يدخل تيار في البطارية من طرفها الموجب، وتيار كل مصدر أقل من 1 mA."]
    },
    design: {
      prompt: "<span class='ltr'>V1 = 5 V</span>، <span class='ltr'>V2 = 3 V</span>، و <span class='ltr'>R1 = R2 = RL = 10 kΩ</span>.",
      figure: fig(mixCircuit(5, 3, 1e4, 1e4, 1e4), "مصدرا جهد يغذيان مقاومة حمل عبر مقاومتين"),
      steps: [
        { id: "s1", label: "مساهمة V1 وحده (أطفئ V2).", symbol: "v<sub>out</sub>′ =", answer: L5.a, units: V, unitDefault: 1,
          diagnose: [{ value: L5.openA, type: "conceptual", why: "أطفأت V2 بفتح الدائرة. مصدر الجهد المطفأ = قصر، فتصبح R2 على التوازي مع RL.", review: R("c1-techniques-12", "laws", "إطفاء المصادر") }],
          hints: ["بعد قصر V2: RL ∥ R2 = 5 kΩ، ثم مجزّئ جهد مع R1."], solution: eqi("5 × 5k / (10k + 5k) = " + si(L5.a, "V")) },
        { id: "s2", label: "مساهمة V2 وحده (أطفئ V1).", symbol: "v<sub>out</sub>″ =", answer: L5.b, units: V, unitDefault: 1,
          diagnose: [{ value: L5.openB, type: "conceptual", why: "V1 المطفأ قصر، فتصبح R1 على التوازي مع RL." }],
          hints: ["بعد قصر V1: RL ∥ R1 = 5 kΩ."], solution: eqi("3 × 5k / (10k + 5k) = " + si(L5.b, "V")) },
        { id: "s3", label: "الخرج مع المصدرين معًا.", symbol: "v<sub>out</sub> =", answer: L5.all.v, units: V, unitDefault: 1,
          diagnose: [{ value: L5.openA + L5.openB, type: "conceptual", why: "جمعت مساهمتين محسوبتين بفتح المصدر الآخر. أعد الحساب مع القصر." }, { value: 8, type: "conceptual", why: "جمعت جهدي المصدرين مباشرة. كل مصدر يمر عبر مجزّئ جهد." }],
          hints: [eqi("v<sub>out</sub> = v<sub>out</sub>′ + v<sub>out</sub>″")], solution: eqi(n(L5.a) + " + " + n(L5.b) + " = " + si(L5.all.v, "V")) },
        { id: "s4", label: "تيار البطارية V2 (الخارج من طرفها الموجب).", symbol: "i<sub>2</sub> =", answer: L5.all.i2, units: [{ l: "µA", f: 1e-6 }, { l: "mA", f: 1e-3 }], unitDefault: 0,
          diagnose: [],
          hints: [eqi("i<sub>2</sub> = (V2 − v<sub>out</sub>) / R2")], solution: eqi("(3 − " + n(L5.all.v) + ") / 10k = " + si(L5.all.i2, "A")) + " ← موجب: البطارية تُسلّم تيارًا ولا تُشحن ✓" }
      ]
    },
    sim: {
      intro: "جرّب مصادر ومقاومات مختلفة؛ المحرك يحل كل مصدر وحده ثم معًا.",
      controls: [
        { id: "v1", label: "V1", type: "select", options: opts([3.3, 5, 9], "V"), def: 5 },
        { id: "v2", label: "V2 (بطاريات AA)", type: "select", options: [{ v: 1.5, l: "1.5 V (1×AA)" }, { v: 3, l: "3 V (2×AA)" }, { v: 4.5, l: "4.5 V (3×AA)" }], def: 3 },
        { id: "r1", label: "R1", type: "select", options: opts(e12(1000, 100000), "Ω"), def: 10000 },
        { id: "r2", label: "R2", type: "select", options: opts(e12(1000, 100000), "Ω"), def: 10000 },
        { id: "rl", label: "RL", type: "select", options: opts(e12(1000, 100000), "Ω"), def: 10000 }
      ],
      compute: function (v) {
        var V1 = +v.v1, V2 = +v.v2, R1 = +v.r1, R2 = +v.r2, RL = +v.rl, all = mix(V1, V2, R1, R2, RL), a = mix(V1, 0, R1, R2, RL).v, b = mix(0, V2, R1, R2, RL).v;
        return {
          circuit: all.c,
          readings: [["مساهمة V1 وحده", si(a, "V")], ["مساهمة V2 وحده", si(b, "V")], ["مجموع المساهمتين", si(a + b, "V")], ["v<sub>out</sub> بالمصدرين (حل مباشر)", si(all.v, "V")], ["تيار V1", si(all.i1, "A")], ["تيار V2", si(all.i2, "A")]],
          checks: [
            { t: "لا يدخل تيار في البطارية V2 من طرفها الموجب", ok: all.i2 >= -1e-12 },
            { t: "تيار كل مصدر أقل من 1 mA", ok: Math.abs(all.i1) < 1e-3 && Math.abs(all.i2) < 1e-3 }
          ],
          expected: { vall: all.v, va: a, vb: b },
          design: ["V1 = " + si(V1, "V") + "، V2 = " + si(V2, "V"), "R1 = " + si(R1, "Ω") + "، R2 = " + si(R2, "Ω") + "، RL = " + si(RL, "Ω")]
        };
      }
    },
    parts: [["لوحة تجارب", "1"], ["مقاومات 10 kΩ", "3"], ["حامل بطاريتين AA", "1"], ["مصدر 5 V (USB)", "1"], ["ملتيميتر وأسلاك", "—"]],
    safety: ["لا تستخدم إلا بطاريات AA عادية ومصدر 5 V.", "لا تقصر طرفي البطارية: الإطفاء يكون بإخراجها ووضع سلك مكانها."],
    build: [
      { t: "صل USB بالخطين + و −.", add: [{ k: "src", id: "u", label: "USB 5 V", power: true, pins: [{ name: "+5V", to: "T+1", c: "red" }, { name: "GND", to: "T-1", c: "black" }] }] },
      { t: "R1 من c4 إلى c9 (بني-أسود-برتقالي)، وسلك أحمر من + إلى a4.", add: [{ k: "res", id: "r1", a: "c4", b: "c9", ohm: 10000 }, { k: "wire", id: "w1", a: "T+4", b: "a4", c: "red" }] },
      { t: "RL من d9 إلى d13، وسلك أسود من a13 إلى −.", add: [{ k: "res", id: "rl", a: "d9", b: "d13", ohm: 10000 }, { k: "wire", id: "w2", a: "a13", b: "T-13", c: "black" }] },
      { t: "R2 من e9 إلى e15، والبطارية: الموجب في a15 والسالب في خط −.", add: [{ k: "res", id: "r2", a: "e9", b: "e15", ohm: 10000 }, { k: "src", id: "bat", label: "2×AA 3 V", side: "right", y: 118, pins: [{ name: "+", to: "a15", c: "red" }, { name: "−", to: "T-16", c: "black" }] }] },
      { t: "قس v<sub>out</sub> بين b9 وخط − (المصدران معًا).", add: [{ k: "meter", id: "m", a: "b9", b: "T-11", mode: "V DC", y: 24 }] },
      { t: "أطفئ V2: أخرج البطارية وضع سلكًا من a15 إلى خط −، وقس. ثم أعدها، وافصل USB وضع سلكًا من a4 إلى خط − بدل السلك الأحمر، وقس.", remove: ["bat"], add: [{ k: "wire", id: "w3", a: "a15", b: "T-17", c: "black" }] }
    ],
    test: {
      intro: "أدخل القراءات الثلاث؛ التراكب يُختبر على دائرتك.",
      quantities: [{ id: "vall", label: "v<sub>out</sub> بالمصدرين", units: V, def: 1 }, { id: "va", label: "v<sub>out</sub> مع V1 فقط", units: V, def: 1 }, { id: "vb", label: "v<sub>out</sub> مع V2 فقط", units: V, def: 1 }],
      tol: 0.1,
      analyze: function (m) {
        var out = [];
        if (m.vall != null && m.va != null && m.vb != null) {
          var sum = m.va + m.vb, d = Math.abs(sum - m.vall) / Math.abs(m.vall || 1);
          out.push((d <= 0.03 ? "✓ " : "⚠ ") + "مجموع قراءتيك الجزئيتين <span class='ltr'>" + si(sum, "V") + "</span> مقابل القراءة الكلية <span class='ltr'>" + si(m.vall, "V") + "</span> (فرق " + (d * 100).toFixed(1) + "%)." + (d <= 0.03 ? " التراكب تحقق على دائرتك." : " تأكد أن المصدر المُطفأ استُبدل بسلك، لا تُرك مفتوحًا."));
        }
        return out;
      },
      causes: ["جهد البطاريات الجديدة أعلى قليلًا من 1.5 V لكل خلية.", "سماحية المقاومات ±5%."]
    }
  };
  order.push("mixer");

  /* ===================================================================
     6. Maximum power from a signal generator (rms power, internal 50 Ω)
     =================================================================== */
  var GW = 2 * Math.PI * 1000;
  function mptCircuit(Vm, Rs, RL) {
    return { rows: 2, cols: 2, omega: Math.round(GW), edges: [
      E([0, 0], [1, 0], "V", Vm, { phase: 0, plus: "a", name: "Vg" }),
      E([0, 0], [0, 1], "R", Rs, { name: "Rs" }),
      E([0, 1], [1, 1], "R", RL, { name: "RL" }),
      E([1, 0], [1, 1], "W")] };
  }
  function mpt(Vm, Rs, RL) {
    var c = mptCircuit(Vm, Rs, RL), s = CV.ac.solve({ rows: 2, cols: 2, omega: GW, edges: c.edges }), it = s.byName.RL;
    var vrms = CV.ac.C.abs(it.v) / Math.SQRT2;
    return { c: c, vrms: vrms, irms: CV.ac.C.abs(it.i) / Math.SQRT2, p: it.s.re / 2, ps: -s.byName.Vg.s.re / 2 };
  }
  var L6 = { Vm: 5, Rs: 50 }; L6.voc = L6.Vm / Math.SQRT2; L6.r47 = mpt(5, 50, 47); L6.pmax = L6.voc * L6.voc / (4 * L6.Rs);
  P["max-power"] = {
    id: "max-power", ar: "أقصى قدرة من مولد الإشارة", en: "Maximum Power from a Signal Generator", level: "متوسط",
    lessons: ["c1-power-3", "c1-power-6", "c1-techniques-11"],
    summary: "مولد الإشارة له مقاومة داخلية (غالبًا 50 Ω). تقيسها بنفسك من جهدين، ثم تجد الحمل الذي يأخذ أكبر قدرة.",
    idea: {
      html: "<p>أي مصدر حقيقي = مصدر مثالي + مقاومة داخلية. قراءة بدون حمل تعطي <span class='ltr'>V<sub>oc</sub></span>، وقراءة مع حمل معروف تكشف المقاومة الداخلية. أكبر قدرة تصل الحمل عندما <span class='ltr'>R<sub>L</sub> = R<sub>s</sub></span>، وهي <span class='ltr'>V<sub>oc,rms</sub>² / (4R<sub>s</sub>)</span>.</p>",
      specs: ["مولد جيبي 5 V قيمة عظمى (بدون حمل) عند 1 kHz.", "مقاومة خرج المولد 50 Ω (المعتاد؛ تحقق بالقياس).", "قدرة الحمل أقل من 125 mW."]
    },
    design: {
      prompt: "مولد بقيمة عظمى <span class='ltr'>5 V</span> بدون حمل، ومقاومته الداخلية <span class='ltr'>50 Ω</span>.",
      figure: fig(mptCircuit(5, 50, 47), "مولد بمقاومة داخلية يغذي مقاومة حمل"),
      steps: [
        { id: "s1", label: "ماذا يقرأ ملتيميتر AC (rms) بدون حمل؟", symbol: "V<sub>oc,rms</sub> =", answer: L6.voc, units: V, unitDefault: 1,
          diagnose: [{ value: 5, type: "conceptual", why: "الملتيميتر يقرأ rms وليس القيمة العظمى: <span class='ltr'>5/√2</span>.", review: R("c1-power-3", "concept", "القيمة الفعالة") }, { value: 5 * Math.SQRT2, type: "formula", why: "ضربت في √2. القيمة الفعالة أصغر من العظمى." }],
          hints: [eqi("V<sub>rms</sub> = V<sub>m</sub> / √2")], solution: eqi("5 / √2 = " + si(L6.voc, "V")) },
        { id: "s2", label: "جهد الحمل (rms) مع <span class='ltr'>R<sub>L</sub> = 47 Ω</span>.", symbol: "V<sub>L</sub> =", answer: L6.r47.vrms, units: V, unitDefault: 1,
          diagnose: [{ value: L6.voc, type: "conceptual", why: "نسيت المقاومة الداخلية: جزء من الجهد يهبط داخل المولد." }],
          hints: [eqi("V<sub>L</sub> = V<sub>oc</sub> · R<sub>L</sub> / (R<sub>s</sub> + R<sub>L</sub>)")], solution: eqi(n(L6.voc) + " × 47 / 97 = " + si(L6.r47.vrms, "V")) },
        { id: "s3", label: "القدرة المتوسطة في 47 Ω.", symbol: "P =", answer: L6.r47.p, units: W, unitDefault: 0,
          diagnose: [{ value: 2 * L6.r47.p, type: "formula", why: "استخدمت القيمة العظمى في <span class='ltr'>V²/R</span> بدون ½. مع rms: <span class='ltr'>P = V<sub>rms</sub>²/R</span>.", review: R("c1-power-3", "laws", "القدرة بالقيمة الفعالة") }],
          hints: [eqi("P = V<sub>L,rms</sub>² / R<sub>L</sub>")], solution: eqi(n(L6.r47.vrms) + "² / 47 = " + si(L6.r47.p, "W")) },
        { id: "s4", label: "أقصى قدرة ممكنة (عند <span class='ltr'>R<sub>L</sub> = 50 Ω</span>).", symbol: "P<sub>max</sub> =", answer: L6.pmax, units: W, unitDefault: 0,
          diagnose: [{ value: L6.voc * L6.voc / L6.Rs, type: "conceptual", why: "افترضت أن كل V<sub>oc</sub> على الحمل. عند التطابق يأخذ الحمل نصف الجهد فقط." }, { value: L6.pmax / 2, type: "formula", why: "استخدمت 8R<sub>s</sub> مع قيمة rms. 8 للقيمة العظمى، و 4 للفعالة.", review: R("c1-power-6", "laws", "8 أم 4؟") }],
          hints: [eqi("P<sub>max</sub> = V<sub>oc,rms</sub>² / (4R<sub>s</sub>)")], solution: eqi(n(L6.voc) + "² / 200 = " + si(L6.pmax, "W")) + " ← 47 Ω تعطي " + Math.round(L6.r47.p / L6.pmax * 1000) / 10 + "% منها" }
      ]
    },
    sim: {
      intro: "غيّر الحمل وشاهد القدرة؛ القمة عند الحمل المساوي للمقاومة الداخلية.",
      controls: [
        { id: "rl", label: "R<sub>L</sub> (E12)", type: "select", options: opts(e12(10, 470), "Ω"), def: 47 },
        { id: "rs", label: "R<sub>s</sub> الداخلية (Ω)", type: "number", min: 1, max: 600, step: "any", def: 50 },
        { id: "vm", label: "القيمة العظمى بدون حمل (V)", type: "number", min: 0.1, max: 10, step: "any", def: 5 }
      ],
      compute: function (v) {
        var Vm = +v.vm, Rs = +v.rs, RL = +v.rl;
        if (!(Vm > 0 && Rs > 0)) return { error: "أدخل قيمًا موجبة." };
        var s = mpt(Vm, Rs, RL), pm = Vm * Vm / 2 / (4 * Rs);
        return {
          circuit: s.c,
          readings: [["V<sub>L</sub> (rms)", si(s.vrms, "V")], ["I<sub>L</sub> (rms)", si(s.irms, "A")], ["P في الحمل", si(s.p, "W")], ["P<sub>max</sub> (عند R<sub>L</sub> = R<sub>s</sub>)", si(pm, "W")], ["نسبة P إلى P<sub>max</sub>", Math.round(s.p / pm * 100) + "%"], ["الكفاءة (حمل ÷ كلية)", Math.round(s.p / s.ps * 100) + "%"]],
          checks: [
            { t: "قدرة الحمل 95% من P<sub>max</sub> على الأقل", ok: s.p >= 0.95 * pm },
            { t: "قدرة الحمل أقل من 125 mW", ok: s.p < 0.125 }
          ],
          expected: { voc: Vm / Math.SQRT2, vl: s.vrms },
          design: ["V<sub>m</sub> = " + si(Vm, "V") + " بدون حمل، R<sub>s</sub> = " + si(Rs, "Ω"), "R<sub>L</sub> = " + si(RL, "Ω")]
        };
      }
    },
    parts: [["مولد إشارة", "1"], ["مقاومات 22، 47، 100 Ω", "1 لكل"], ["ملتيميتر يقيس V AC", "1"], ["لوحة تجارب وأسلاك", "—"]],
    safety: ["اتبع تعليمات معمل الجامعة.", "ملتيميترات كثيرة دقيقة في AC حتى بضع مئات Hz فقط؛ إن لم يكن دقيقًا عند 1 kHz فاستخدم الأوسيلوسكوب أو 100 Hz."],
    build: [
      { t: "صل المولد: OUT في a4 و COM في خط −. اضبطه على 1 kHz.", add: [{ k: "src", id: "g", label: "مولد إشارة", pins: [{ name: "OUT", to: "a4", c: "red" }, { name: "COM", to: "T-2", c: "black" }] }] },
      { t: "بدون حمل: الملتيميتر (V AC) بين b4 وخط −. هذه V<sub>oc</sub>.", add: [{ k: "meter", id: "m", a: "b4", b: "T-8", mode: "V AC" }] },
      { t: "ركّب R<sub>L</sub> = 47 Ω (أصفر-بنفسجي-أسود) من c4 إلى c9، وسلك من a9 إلى خط −. اقرأ V<sub>L</sub>.", add: [{ k: "res", id: "rl", a: "c4", b: "c9", ohm: 47 }, { k: "wire", id: "w", a: "a9", b: "T-9", c: "black" }] }
    ],
    test: {
      intro: "أدخل القراءتين بالـ rms؛ المحاكاة تستخدم R<sub>L</sub> التي اخترتها.",
      quantities: [{ id: "voc", label: "V<sub>oc</sub> بدون حمل (rms)", units: V, def: 1 }, { id: "vl", label: "V<sub>L</sub> مع الحمل (rms)", units: V, def: 1 }],
      tol: 0.1,
      analyze: function (m, v) {
        var out = [], RL = +v.rl;
        if (m.voc != null && m.vl != null && m.vl > 0 && m.vl < m.voc) {
          var rs = RL * (m.voc / m.vl - 1);
          out.push("المقاومة الداخلية من قياسك: <span class='ltr'>R<sub>s</sub> = R<sub>L</sub>(V<sub>oc</sub>/V<sub>L</sub> − 1) = " + si(rs, "Ω") + "</span>. أقصى قدرة من هذا المولد ≈ <span class='ltr'>" + si(m.voc * m.voc / (4 * rs), "W") + "</span>.");
        } else if (m.voc != null && m.vl != null) out.push("⚠ V<sub>L</sub> يجب أن يكون أقل من V<sub>oc</sub>. تأكد من القراءتين.");
        return out;
      },
      causes: ["دقة الملتيميتر في AC تقل مع التردد.", "بعض المولدات تعرض القيمة مفترضة حمل 50 Ω."]
    }
  };
  order.push("max-power");
})();
