/* CircuitVision — Electric Circuits 2 Lab (EE 2020): the ten experiments of the department's lab manual (Dr. Abdullah M. Noman).
   Every reading on the virtual instruments comes from a circuit model below (exact formulas, or numerical integration for transients),
   never typed by hand. Component values follow the manual; where the manual is silent or inconsistent this file says so in `note`.
   For each procedure:
     inst:   the instruments (controls the student sets, and read(p) → meters + oscilloscope picture)
     tables: rows → model(row) gives every column; "meas" columns are what the instruments show (rounded like a meter),
             "calc" columns are what the student computes from theory; "%" columns are worked out from the student's own entries. */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  var PI = Math.PI, exp = Math.exp, sqrt = Math.sqrt, D = 180 / PI;
  function w(f) { return 2 * PI * f; }
  function sig(v, n) { if (!isFinite(v) || v === 0) return v; var d = Math.ceil(Math.log10(Math.abs(v))), p = Math.pow(10, (n || 3) - d); return Math.round(v * p) / p; }
  /* complex numbers */
  function c(re, im) { return { re: re, im: im || 0 }; }
  function add(a, b) { return c(a.re + b.re, a.im + b.im); }
  function mul(a, b) { return c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function dv(a, b) { var d = b.re * b.re + b.im * b.im; return c((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
  function par(a, b) { return dv(mul(a, b), add(a, b)); }
  function mag(a) { return Math.hypot(a.re, a.im); }
  function ang(a) { return Math.atan2(a.im, a.re) * D; }
  var Cx = { c: c, add: add, mul: mul, dv: dv, par: par, mag: mag, ang: ang };

  /* ---------- schematics (CV.draw grid format) ---------- */
  function E(a, b, type, name, extra) { var e = { a: a, b: b, type: type, name: name || "", value: 1, vtext: "" }; for (var k in (extra || {})) e[k] = extra[k]; return e; }
  function Wr(a, b) { return { a: a, b: b, type: "W" }; }
  function Gen(a, b, text) { return { a: a, b: b, type: "V", gen: true, name: "vs", value: 0, vtext: text || "" }; }
  function Dc(a, b, text) { return { a: a, b: b, type: "V", name: "Vs", value: 0, vtext: text || "", plus: "a" }; }
  function Am(a, b, label) { return { a: a, b: b, type: "W", am: true, label: label || "" }; }
  function fig(rows, cols, edges, extra) { var o = { rows: rows, cols: cols, edges: edges }; for (var k in (extra || {})) o[k] = extra[k]; return o; }
  // generator – R – C loop; CH1 across C, CH2 across the generator
  function rcFig(src, out) {
    return fig(2, 3, [Gen([1, 0], [0, 0], src), E([0, 0], [0, 1], "R", "R", { vtext: "10 kΩ" }), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "C", "C", { vtext: "0.047 µF" }), Wr([1, 0], [1, 2])],
      { notes: [{ at: [0.5, 2], text: out || "CH1: vC", dx: -44 }, { at: [0.5, 0], text: "CH2", dx: 40 }] });
  }

  /* ---------- transients: periodic steady state of a first-order RC under a square wave ---------- */
  function rcSquare(lo, hi, f, tau) {
    var T = 1 / f, a = exp(-T / 2 / tau);
    // V0 = start of the high half, V1 = start of the low half (periodic: they repeat every period)
    var V1 = (hi * (1 - a) + lo * (1 - a) * a) / (1 - a * a), V0 = lo + (V1 - lo) * a;
    return { V0: V0, V1: V1, T: T, at: function (t) { t = ((t % T) + T) % T; return t < T / 2 ? hi + (V0 - hi) * exp(-t / tau) : lo + (V1 - lo) * exp(-(t - T / 2) / tau); },
      src: function (t) { t = ((t % T) + T) % T; return t < T / 2 ? hi : lo; } };
  }
  /* series RLC driven by a square wave (vC and i), integrated with RK4 until the waveform repeats */
  function rlcSquare(R, L, Cc, Vpp, f) {
    var T = 1 / f, n = 4000, h = T / n, v = 0, i = 0, out = [];
    function src(t) { t = ((t % T) + T) % T; return t < T / 2 ? Vpp / 2 : -Vpp / 2; }
    function d(t, v, i) { return [i / Cc, (src(t) - R * i - v) / L]; }
    for (var p = 0; p < 6; p++) {
      for (var k = 0; k < n; k++) {
        var t = k * h, a = d(t, v, i), b = d(t + h / 2, v + h * a[0] / 2, i + h * a[1] / 2), cc = d(t + h / 2, v + h * b[0] / 2, i + h * b[1] / 2), e = d(t + h, v + h * cc[0], i + h * cc[1]);
        if (p === 5) out.push([t, v]);
        v += h * (a[0] + 2 * b[0] + 2 * cc[0] + e[0]) / 6; i += h * (a[1] + 2 * b[1] + 2 * cc[1] + e[1]) / 6;
      }
    }
    return { T: T, pts: out, src: src };
  }

  /* ---------- the virtual coils of Experiment 3 (values chosen for the virtual bench; the manual measures them, it does not give them) ---------- */
  var COIL = { R1dc: 11.6, R2dc: 3.1, L1: 0.42, L2: 0.105, k: 0.92, f: 60, dot2: "B" };
  COIL.M = COIL.k * sqrt(COIL.L1 * COIL.L2); COIL.R1 = COIL.R1dc * 1.15; COIL.R2 = COIL.R2dc * 1.15;

  /* ---------- the bench (clab-bench.js): component blocks, and ready circuits for «اعرض الحل» and the wiring check ---------- */
  var PIECES = {
    C47n: { t: "C", v: 0.047e-6, name: "0.047 µF" }, C1n: { t: "C", v: 1e-9, name: "1 nF" }, C10n: { t: "C", v: 10e-9, name: "10 nF" }, C10nb: { t: "C", v: 10e-9, name: "10 nF", n: "2" }, C100n: { t: "C", v: 0.1e-6, name: "0.1 µF" },
    L10m: { t: "L", v: 10e-3, name: "10 mH" }, L17m: { t: "L", v: 17.5e-3, name: "17.5 mH" },
    R10: { t: "R", v: 10 }, R50: { t: "R", v: 50 }, R100: { t: "R", v: 100 }, R1k: { t: "R", v: 1000 }, R1k5: { t: "R", v: 1500 }, R2k: { t: "R", v: 2000 }, R2k2: { t: "R", v: 2200 }, R3k: { t: "R", v: 3000 },
    RA: { t: "R", v: 100, pmax: 400, name: "100 Ω 400 W", n: "A" }, RB: { t: "R", v: 100, pmax: 400, name: "100 Ω 400 W", n: "B" }, RC: { t: "R", v: 100, pmax: 400, name: "100 Ω 400 W", n: "C" }
  };
  function kit(ids) { return ids.map(function (id) { var q = JSON.parse(JSON.stringify(PIECES[id])); q.id = id; return q; }); }
  function P(id, lb) { var q = JSON.parse(JSON.stringify(PIECES[id])); q.id = id; if (lb) q.lb = lb; return q; }
  var BR = { t: "W", id: "W" };
  var SQ = function (f, vpp, off) { return { fg: { on: true, w: "sq", f: f, vpp: vpp, off: off || 0 } }; };
  function mix() { var o = {}; Array.prototype.forEach.call(arguments, function (x) { (function cp(t, s) { Object.keys(s).forEach(function (k) { if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) { t[k] = t[k] || {}; cp(t[k], s[k]); } else t[k] = s[k]; }); })(o, x || {}); }); return o; }

  var EXPS = [];
  /* ================= Experiment 1 ================= */
  (function () {
    var R = 10e3, Cc = 0.047e-6, tau = R * Cc, f = 200, W1 = rcSquare(0, 10, f, tau);
    function tMeas() { var target = W1.V0 + 0.632 * (10 - W1.V0); return -tau * Math.log((10 - target) / (10 - W1.V0)); }
    EXPS.push({ id: "c2e1", n: 1, en: "Transient in DC Circuits: Charging Mode of the Capacitor", title: "الاستجابة العابرة: شحن المكثف",
      objective: ["دراسة الاستجابة الدرجية لدائرة RC من الرتبة الأولى (شحن المكثف).", "قياس ثابت الزمن τ على الأوسيلوسكوب ومقارنته بـ RC."],
      equipment: ["صندوق مقاومات عشري (10 kΩ)", "مكثف 0.047 µF", "مصدر جهد مستمر، مولد إشارة، أوسيلوسكوب"],
      theory: [
        "عند غلق المفتاح على مكثف فارغ عبر R: " + "<span class='ltr'>vC(t) = Vs(1 − e<sup>−t/τ</sup>)</span>" + " و " + "<span class='ltr'>i(t) = (Vs/R)e<sup>−t/τ</sup></span>" + "، حيث " + "<span class='ltr'>τ = RC</span>" + ".",
        "بعد τ يصل الجهد إلى 63% من قيمته النهائية، والتيار ينزل إلى 37% من قيمته الأولى. وبعد 5τ تقريبًا يكتمل الشحن.",
        "الموجة المربعة تكرر الشحن والتفريغ: إذا كان نصف الدورة أطول من 5τ يكتمل الشحن (T = 15τ مثلًا)، وإذا قصر (T = 4τ) لا يكتمل.",
        "هنا: " + "<span class='ltr'>τ = 10 kΩ × 0.047 µF = 0.47 ms</span>" + " ونصف الدورة عند 200 Hz هو 2.5 ms ≈ 5.3τ، فيكتمل الشحن تقريبًا."
      ],
      note: "الكتيب يترك أزمنة الجدول 1.1 فارغة بين 0 و 2.5 ms؛ اخترنا أزمنة تشمل τ نفسها. والقيمة «المقاسة» هي ما يعرضه الأوسيلوسكوب للموجة الدورية: المكثف لا يبدأ من الصفر تمامًا لأن التفريغ في النصف السابق لم يكتمل 100%.",
      prelab: [
        { q: "مع Vs = 10 V و R = 10 kΩ: التيار الابتدائي i(0) عند غلق المفتاح (المكثف فارغ).", a: 10 / R, u: [["mA", 1e-3], ["A", 1]], sol: "i(0) = Vs/R = 10/10k = 1 mA، و vC(0) = 0." },
        { q: "ثابت الزمن τ = RC.", a: tau, u: [["ms", 1e-3], ["µs", 1e-6]], sol: "10 kΩ × 0.047 µF = 0.47 ms." },
        { q: "الزمن t₁ الذي يصل فيه vC إلى 63% من قيمته النهائية.", a: -tau * Math.log(0.37), u: [["ms", 1e-3]], tol: 0.02, sol: "1 − e<sup>−t/τ</sup> = 0.63 ⇐ t = −τ ln 0.37 ≈ 0.467 ms ≈ τ." },
        { q: "دورة الموجة المربعة T عند 200 Hz.", a: 1 / f, u: [["ms", 1e-3]], sol: "T = 1/200 = 5 ms." },
        { q: "(الفقرة 3.2) إذا كان vC(0) = −10 V والدخل +10 V خلال [0, T/2]: احسب vC(T/2).", a: 10 - 20 * exp(-2.5e-3 / tau), u: [["V", 1]], tol: 0.005, sol: "vC = 10 − 20e<sup>−t/τ</sup> ⇐ vC(2.5 ms) = 10 − 20e<sup>−5.32</sup> = 9.90 V." },
        { q: "وفي نفس الحالة: i(T/2) بالـ µA.", a: 20 / R * exp(-2.5e-3 / tau), u: [["µA", 1e-6], ["mA", 1e-3]], tol: 0.01, sol: "i = (20/10k)e<sup>−t/τ</sup> ⇐ i(2.5 ms) = 2 mA × 0.0049 = 9.8 µA." }
      ],
      procs: [{
        id: "p1", title: "الإجراء 1 و 2: شحن المكثف بموجة مربعة 0 → 10 V، 200 Hz",
        steps: ["وصّل الدائرة: المولد ← صندوق المقاومات (10 kΩ) ← المكثف 0.047 µF.", "اضبط المولد على موجة مربعة بين 0 V و +10 V بتردد 200 Hz.", "CH1 على المكثف و CH2 على المولد. حرّك مؤشر الزمن واقرأ vC في الجدول 1.1.", "قِس τ: الزمن الذي يصل فيه vC إلى 63.2% من مداه."],
        fig: rcFig("0–10 V ⊓ 200 Hz"),
        inst: { controls: [{ k: "t", label: "مؤشر الزمن t (ms)", min: 0, max: 2.5, step: 0.01, def: 0.47 }],
          read: function (p) { var t = p.t * 1e-3; return { meters: [["vC عند المؤشر", sig(W1.at(t), 3), "V"], ["vR = vs − vC", sig(10 - W1.at(t), 3), "V"]],
            scope: { x: [0, 5], y: [-1, 11], xl: "t (ms)", yl: "V", items: [{ ct: function (x) { return W1.src(x * 1e-3); }, c: 2, n: 800 }, { ct: function (x) { return W1.at(x * 1e-3); }, c: 1, n: 800 }, { vline: p.t, c: 3, dash: true }] } }; } },
        tables: [{ title: "الجدول 1.1: جهد المكثف أثناء الشحن", rows: [0, 0.25, 0.47, 0.5, 0.75, 1, 1.5, 2, 2.5],
          cols: [{ h: "t (ms)", k: "t", src: "row" }, { h: "vC محسوب (V)", k: "cal", src: "calc" }, { h: "vC مقاس (V)", k: "meas", src: "meas" }, { h: "% Error", src: "%", of: ["cal", "meas"] }],
          model: function (t) { return { t: t, cal: 10 * (1 - exp(-t * 1e-3 / tau)), meas: sig(W1.at(t * 1e-3), 3) }; } },
          { title: "ثابت الزمن", rows: ["τ"], cols: [{ h: "", k: "n", src: "row" }, { h: "محسوب RC (ms)", k: "cal", src: "calc" }, { h: "من الشاشة (ms)", k: "meas", src: "meas" }, { h: "% Error", src: "%", of: ["cal", "meas"] }],
            model: function () { return { n: "τ", cal: tau * 1e3, meas: sig(tMeas() * 1e3, 3) }; } }],
        plot: { table: 0, x: "t", ys: ["cal", "meas"], xl: "t (ms)", yl: "vC (V)", names: ["محسوب", "مقاس"] }
      }]
    });
  })();

  /* ================= Experiment 2 ================= */
  (function () {
    var R = 10e3, Cc = 0.047e-6, tau = R * Cc, f = 200, W2 = rcSquare(-10, 10, f, tau), V1cal = 10 - 20 * exp(-2.5e-3 / tau);
    function tMeas() { var target = W2.V1 - 0.632 * (W2.V1 + 10); return -tau * Math.log((target + 10) / (W2.V1 + 10)); }
    EXPS.push({ id: "c2e2", n: 2, en: "Transient in DC Circuits: Discharging Mode of the Capacitor", title: "الاستجابة العابرة: تفريغ المكثف",
      objective: ["دراسة الاستجابة الطبيعية لدائرة RC (تفريغ المكثف).", "قياس τ من منحنى التفريغ ومقارنته بـ RC."],
      equipment: ["صندوق مقاومات عشري (10 kΩ)", "مكثف 0.047 µF", "مصدر جهد مستمر، مولد إشارة، أوسيلوسكوب"],
      theory: [
        "مكثف مشحون إلى V0 يتفرغ عبر R: " + "<span class='ltr'>vC(t) = V0 e<sup>−t/τ</sup></span>" + " و " + "<span class='ltr'>i(t) = −(V0/R)e<sup>−t/τ</sup></span>" + " (التيار يعكس اتجاهه).",
        "بعد τ ينزل الجهد والتيار إلى 37% من قيمتيهما الأوليين.",
        "مع موجة ±10 V: في النصف [T/2, T] يكون الدخل −10 V، فالمكثف لا يذهب إلى الصفر بل إلى −10 V: " + "<span class='ltr'>vC = −10 + (vC(T/2) + 10)e<sup>−(t−T/2)/τ</sup></span>" + "."
      ],
      note: "الجدول 2.1 يبدأ من 2.5 ms (بداية التفريغ) وينتهي عند 5 ms، والأزمنة بينهما فارغة في الكتيب فاخترناها. «المحسوب» من الفقرة 3.2 (vC(T/2) = 9.90 V)، و«المقاس» من الموجة الدورية على الشاشة.",
      prelab: [
        { q: "(3.1) مكثف مشحون إلى 10 V يتفرغ في R = 10 kΩ: مقدار التيار الابتدائي |i(0)|.", a: 1e-3, u: [["mA", 1e-3]], sol: "10/10k = 1 mA (بعكس اتجاه الشحن)." },
        { q: "الزمن t₁ الذي ينزل فيه vC إلى 37% من 10 V.", a: -tau * Math.log(0.37), u: [["ms", 1e-3]], tol: 0.02, sol: "e<sup>−t/τ</sup> = 0.37 ⇐ t ≈ τ = 0.47 ms." },
        { q: "(3.2) في [T/2, T] مع الدخل −10 V و vC(T/2) = 9.90 V: احسب vC(T/2 + τ).", a: -10 + (V1cal + 10) * exp(-1), u: [["V", 1]], tol: 0.01, sol: "−10 + 19.90 × e<sup>−1</sup> = −2.68 V." },
        { q: "وكذلك i(T/2 + τ) بالـ mA (الاتجاه السالب = تفريغ).", a: -(V1cal + 10) / R * exp(-1), u: [["mA", 1e-3]], tol: 0.01, sol: "i = −(19.90/10k)e<sup>−1</sup> = −0.732 mA." }
      ],
      procs: [{
        id: "p1", title: "الإجراء 1 و 2: موجة مربعة ±10 V، 200 Hz",
        steps: ["نفس الدائرة، والمولد على موجة مربعة بين −10 V و +10 V بتردد 200 Hz.", "اعرض جزء التفريغ كاملًا على الشاشة، واقرأ vC عند الأزمنة في الجدول 2.1.", "قِس τ: زمن نزول vC بمقدار 63.2% من مداه (من +9.9 V نحو −10 V)."],
        fig: rcFig("±10 V ⊓ 200 Hz"),
        inst: { controls: [{ k: "t", label: "مؤشر الزمن t (ms)", min: 2.5, max: 5, step: 0.01, def: 2.97 }],
          read: function (p) { var t = p.t * 1e-3; return { meters: [["vC عند المؤشر", sig(W2.at(t), 3), "V"], ["vR = vs − vC", sig(W2.src(t) - W2.at(t), 3), "V"]],
            scope: { x: [0, 5], y: [-11, 11], xl: "t (ms)", yl: "V", items: [{ ct: function (x) { return W2.src(x * 1e-3); }, c: 2, n: 800 }, { ct: function (x) { return W2.at(x * 1e-3); }, c: 1, n: 800 }, { vline: p.t, c: 3, dash: true }] } }; } },
        tables: [{ title: "الجدول 2.1: جهد المكثف أثناء التفريغ", rows: [2.5, 2.75, 2.97, 3, 3.25, 3.5, 4, 4.5, 5],
          cols: [{ h: "t (ms)", k: "t", src: "row" }, { h: "vC محسوب (V)", k: "cal", src: "calc" }, { h: "vC مقاس (V)", k: "meas", src: "meas" }, { h: "% Error", src: "%", of: ["cal", "meas"] }],
          model: function (t) { return { t: t, cal: -10 + (V1cal + 10) * exp(-(t - 2.5) * 1e-3 / tau), meas: sig(W2.at(t * 1e-3), 3) }; } },
          { title: "ثابت الزمن", rows: ["τ"], cols: [{ h: "", k: "n", src: "row" }, { h: "محسوب RC (ms)", k: "cal", src: "calc" }, { h: "من الشاشة (ms)", k: "meas", src: "meas" }, { h: "% Error", src: "%", of: ["cal", "meas"] }],
            model: function () { return { n: "τ", cal: tau * 1e3, meas: sig(tMeas() * 1e3, 3) }; } }],
        plot: { table: 0, x: "t", ys: ["cal", "meas"], xl: "t (ms)", yl: "vC (V)", names: ["محسوب", "مقاس"] }
      }]
    });
  })();

  /* ================= Experiment 3 ================= */
  (function () {
    var K = COIL, om = w(K.f), V = 5;
    var X1 = om * K.L1, X2 = om * K.L2, XM = om * K.M;
    var I1ac = V / Math.hypot(K.R1, X1), I2ac = V / Math.hypot(K.R2, X2);
    var Ra = K.R1 + K.R2, Xa = om * (K.L1 + K.L2 + 2 * K.M), Xo = om * (K.L1 + K.L2 - 2 * K.M);
    var Ia = V / Math.hypot(Ra, Xa), Io = V / Math.hypot(Ra, Xo);
    var V2oc = XM * I1ac;
    var coilFig = function (src, dots, extra) {
      return fig(2, 4, [src, Wr([0, 0], [0, 1]), E([0, 1], [1, 1], "L", "N1 = 1000", { dot: dots[0] }), Wr([1, 0], [1, 1]), E([0, 2], [1, 2], "L", "N2 = 500", { dot: dots[1] }), E([0, 2], [0, 3], "W"), E([0, 3], [1, 3], "T"), Wr([1, 2], [1, 3])],
        { notes: (extra || []).concat([{ at: [0.5, 1.5], text: "قلب حديدي", dy: -46 }]), arcs: [{ from: [0.18, 1.18], to: [0.18, 1.82], h: 20 }] });
    };
    EXPS.push({ id: "c2e3", n: 3, en: "Magnetically Coupled Circuits", title: "الدوائر المقترنة مغناطيسيًا",
      objective: ["التعرف على الاقتران المغناطيسي: المحاثة الذاتية والمتبادلة، وقاعدة النقطة، ومعامل الاقتران.", "حساب مقاومة الملف."],
      equipment: ["ملفان مقترنان (1000 و 500 لفة) على قلب حديدي", "أميتران وثلاثة فولتميترات", "مصدر جهد متناوب متغير (Variac) 60 Hz"],
      theory: [
        "<span class='ltr'>v = L di/dt</span>" + " ووحدة L الهنري (H). وإذا مر i₁ في الملف 1 والملف 2 مفتوح: " + "<span class='ltr'>v₂ = M di₁/dt</span>" + "، وبالعكس " + "<span class='ltr'>v₁ = M di₂/dt</span>" + "، و M بالهنري أيضًا.",
        "توالي: " + "<span class='ltr'>Leq = L1 + L2 + 2M</span>" + " إذا دخل التيار من النقطتين (aiding)، و " + "<span class='ltr'>L1 + L2 − 2M</span>" + " إذا تعاكسا.",
        "معامل الاقتران: " + "<span class='ltr'>k = M/√(L1L2)</span>" + " بين 0 و 1؛ الفيض المتسرب يجعله أقل من 1.",
        "مقاومة الملف تقاس بالتيار المستمر، ثم يضيف الكتيب 15% لأثر السطح (skin effect) عند التيار المتناوب: " + "<span class='ltr'>R = 1.15 RDC</span>" + "."
      ],
      note: "الكتيب لا يذكر قيم الملفين لأنها تُقاس. ملفا الطاولة الافتراضية: RDC = 11.6 Ω و 3.1 Ω، L1 = 0.42 H، L2 = 0.105 H، k = 0.92، والنقطة الثانية عند B. هذه قيم المحاكاة وليست من الكتيب؛ نسبة L1/L2 = 4 تطابق نسبة اللفات² (1000/500)².",
      prelab: [
        { q: "ملفان L1 = 0.4 H و L2 = 0.1 H و M = 0.15 H على التوالي aiding: Leq.", a: 0.8, u: [["H", 1], ["mH", 1e-3]], sol: "0.4 + 0.1 + 2(0.15) = 0.8 H." },
        { q: "ونفس الملفين opposing: Leq.", a: 0.2, u: [["H", 1], ["mH", 1e-3]], sol: "0.4 + 0.1 − 0.3 = 0.2 H." },
        { q: "ومعامل الاقتران k.", a: 0.15 / sqrt(0.04), u: [["—", 1]], sol: "k = 0.15/√(0.4 × 0.1) = 0.75." }
      ],
      procs: [
        { id: "p1", title: "الإجراء 1: مقاومة الملفين (5 V مستمر)", steps: ["طبّق 5 V مستمر على الملف 1 والملف 2 مفتوح، واقرأ الأميتر والفولتميتر.", "RDC = V/I، ثم R = 1.15 RDC.", "كرر للملف 2 والملف 1 مفتوح."],
          fig: coilFig(Dc([1, 0], [0, 0], "5 V"), ["", ""]),
          inst: { controls: [{ k: "coil", label: "المصدر موصل على", opts: [["1", "الملف 1"], ["2", "الملف 2"]], def: "1" }],
            read: function (p) { var r = p.coil === "2" ? K.R2dc : K.R1dc; return { meters: [["V (DC)", 5, "V"], ["I (DC)", sig(5 / r, 3), "A"]] }; } },
          tables: [{ title: "مقاومة الملفين", rows: ["1", "2"], cols: [{ h: "الملف", k: "n", src: "row" }, { h: "V DC (V)", k: "V", src: "meas" }, { h: "I DC (A)", k: "I", src: "meas" }, { h: "R DC (Ω)", k: "Rdc", src: "calc" }, { h: "R = 1.15 RDC (Ω)", k: "R", src: "calc" }],
            model: function (n) { var r = n === "2" ? K.R2dc : K.R1dc, I = sig(5 / r, 3); return { n: n, V: 5, I: I, Rdc: 5 / I, R: 1.15 * 5 / I }; } }] },
        { id: "p2", title: "الإجراء 1 (تابع): المحاثة الذاتية (5 V rms، 60 Hz)", steps: ["وصّل الملف 1 على مصدر 60 Hz واضبطه على 5 V rms والملف 2 مفتوح.", "Z = V/I، ثم X = √(Z² − R²)، ثم L = X/(2πf).", "كرر للملف 2."],
          fig: coilFig(Gen([1, 0], [0, 0], "5 V rms 60 Hz"), ["", ""]),
          inst: { controls: [{ k: "coil", label: "المصدر موصل على", opts: [["1", "الملف 1"], ["2", "الملف 2"]], def: "1" }],
            read: function (p) { return { meters: [["V (rms)", 5, "V"], ["I (rms)", sig(p.coil === "2" ? I2ac : I1ac, 3), "A"]] }; } },
          tables: [{ title: "المحاثة الذاتية", rows: ["1", "2"], cols: [{ h: "الملف", k: "n", src: "row" }, { h: "I (A)", k: "I", src: "meas" }, { h: "Z (Ω)", k: "Z", src: "calc" }, { h: "X (Ω)", k: "X", src: "calc" }, { h: "L (H)", k: "L", src: "calc" }],
            model: function (n) { var I = sig(n === "2" ? I2ac : I1ac, 3), Z = 5 / I, R = n === "2" ? K.R2 : K.R1, X = sqrt(Z * Z - R * R); return { n: n, I: I, Z: Z, X: X, L: X / om }; } }] },
        { id: "p3", title: "الإجراء 2: المحاثة المتبادلة M", steps: ["المصدر على الملف 1 (5 V rms) والملف 2 مفتوح، والفولتميتر V2 على الملف 2.", "XM = V2/I1، ثم M = XM/(2πf)."],
          fig: coilFig(Gen([1, 0], [0, 0], "5 V rms 60 Hz"), ["", ""], [{ at: [0.5, 3], text: "V2", dx: -34 }]),
          inst: { read: function () { return { meters: [["I1", sig(I1ac, 3), "A"], ["V1", 5, "V"], ["V2", sig(V2oc, 3), "V"]] }; } },
          tables: [{ title: "المحاثة المتبادلة", rows: ["M"], cols: [{ h: "", k: "n", src: "row" }, { h: "I1 (A)", k: "I1", src: "meas" }, { h: "V2 (V)", k: "V2", src: "meas" }, { h: "XM (Ω)", k: "XM", src: "calc" }, { h: "M (H)", k: "M", src: "calc" }],
            model: function () { var I = sig(I1ac, 3), v2 = sig(V2oc, 3); return { n: "M", I1: I, V2: v2, XM: v2 / I, M: v2 / I / om }; } }] },
        { id: "p4", title: "الإجراء 3: تحديد النقطة (القطبية)", steps: ["صِل طرفًا من الملف 1 بطرف من الملف 2، والمصدر على الملف 1.", "اقرأ V1 و V2 و VT بين الطرفين الحرّين.", "إذا كانت VT = V1 − V2 فالنقطة الثانية عند A، وإذا كانت V1 + V2 فعند B."],
          fig: coilFig(Gen([1, 0], [0, 0], "5 V rms 60 Hz"), ["a", ""], [{ at: [0, 2], text: "A", dy: -8 }, { at: [1, 2], text: "B", dy: 18 }]),
          inst: { read: function () { return { meters: [["V1", 5, "V"], ["V2", sig(V2oc, 3), "V"], ["VT", sig(K.dot2 === "B" ? 5 + V2oc : 5 - V2oc, 3), "V"]] }; } },
          tables: [{ title: "القطبية", rows: ["—"], cols: [{ h: "", k: "n", src: "row" }, { h: "V1 − V2", k: "d", src: "calc" }, { h: "V1 + V2", k: "s", src: "calc" }, { h: "VT (V)", k: "VT", src: "meas" }, { h: "النقطة عند", k: "dot", src: "choice", opts: ["A", "B"] }],
            model: function () { var v2 = sig(V2oc, 3); return { n: "—", d: 5 - v2, s: 5 + v2, VT: sig(K.dot2 === "B" ? 5 + V2oc : 5 - V2oc, 3), dot: K.dot2 }; } }] },
        { id: "p5", title: "الإجراء 4: معامل الاقتران k", steps: ["وصّل الملفين على التوالي aiding (حسب النقطة)، والمصدر 5 V rms. اقرأ I.", "اعكس طرفي الملف 2 (opposing) واقرأ I.", "Xeq = √(Z² − (R1 + R2)²)، ثم M = (Xeq1 − Xeq2)/(4ω)، ثم k = M/√(L1L2) (L1 و L2 من الإجراء 1)."],
          fig: fig(2, 3, [Gen([1, 0], [0, 0], "5 V rms 60 Hz"), E([0, 0], [0, 1], "L", "L1", { dot: "a" }), E([0, 1], [0, 2], "L", "L2", { dot: "a" }), Wr([0, 2], [1, 2]), Am([1, 2], [1, 0], "I")]),
          inst: { controls: [{ k: "c", label: "التوصيل", opts: [["a", "aiding"], ["o", "opposing (طرفا L2 معكوسان)"]], def: "a" }],
            read: function (p) { return { meters: [["V", 5, "V"], ["I", sig(p.c === "o" ? Io : Ia, 3), "A"]] }; } },
          tables: [{ title: "التوالي", rows: ["aiding", "opposing"], cols: [{ h: "", k: "n", src: "row" }, { h: "I (A)", k: "I", src: "meas" }, { h: "Z (Ω)", k: "Z", src: "calc" }, { h: "Xeq (Ω)", k: "X", src: "calc" }],
            model: function (n) { var I = sig(n === "opposing" ? Io : Ia, 3), Z = 5 / I; return { n: n, I: I, Z: Z, X: sqrt(Z * Z - Ra * Ra) }; } },
          { title: "النتيجة", rows: ["—"], cols: [{ h: "", k: "n", src: "row" }, { h: "M (H)", k: "M", src: "calc" }, { h: "k", k: "k", src: "calc" }],
            model: function () { var x1 = sqrt(Math.pow(5 / sig(Ia, 3), 2) - Ra * Ra), x2 = sqrt(Math.pow(5 / sig(Io, 3), 2) - Ra * Ra), M = (x1 - x2) / (4 * om);
              var L1 = sqrt(Math.pow(5 / sig(I1ac, 3), 2) - K.R1 * K.R1) / om, L2 = sqrt(Math.pow(5 / sig(I2ac, 3), 2) - K.R2 * K.R2) / om; return { n: "—", M: M, k: M / sqrt(L1 * L2) }; }, tol: 0.03 }] }
      ]
    });
  })();

  /* ================= Experiment 4 ================= */
  (function () {
    var L = 10e-3, Cc = 1e-9, w0 = 1 / sqrt(L * Cc), Rc = 2 * sqrt(L / Cc);
    var cache = {};
    function run(R, f) { var key = R + "/" + f; if (!cache[key]) cache[key] = rlcSquare(R, L, Cc, 6, f); return cache[key]; }
    function over(R) { var r = run(R, R < 1000 ? 1000 : 3000), max = -1e9; r.pts.forEach(function (p) { if (p[0] < r.T / 2) max = Math.max(max, p[1]); }); return max; }
    var wd = sqrt(w0 * w0 - Math.pow(200 / (2 * L), 2));
    EXPS.push({ id: "c2e4", n: 4, en: "Step Response of an RLC Series Circuit", title: "الاستجابة الدرجية لدائرة RLC على التوالي",
      objective: ["فهم الاستجابة العابرة لدائرة RLC من الرتبة الثانية لدخل درجي: فوق التخميد، والحرج، وتحت التخميد."],
      equipment: ["ملف 10 mH", "مكثف 1 nF", "مقاومات 200 Ω و 6.3 kΩ و 6.9 kΩ (صندوق عشري)", "مولد إشارة وأوسيلوسكوب"],
      theory: [
        "KVL: " + "<span class='ltr'>LC d²vC/dt² + RC dvC/dt + vC = vs</span>" + "، وبالصيغة القياسية: " + "<span class='ltr'>d²vC/dt² + 2α dvC/dt + ω0² vC = ω0² vs</span>" + " مع " + "<span class='ltr'>α = R/2L</span>" + " و " + "<span class='ltr'>ω0 = 1/√(LC)</span>" + ".",
        "α > ω0: فوق التخميد (جذران حقيقيان " + "<span class='ltr'>s = −α ± √(α² − ω0²)</span>" + ")؛ α = ω0: حرج؛ α < ω0: تحت التخميد يتذبذب بتردد " + "<span class='ltr'>ωd = √(ω0² − α²)</span>" + ".",
        "التخميد الحرج عند " + "<span class='ltr'>R = 2√(L/C)</span>" + ". والموجة المربعة تكرر الخطوة كل نصف دورة، فنرى الاستجابة على الشاشة."
      ],
      note: "تعارض في الكتيب: قائمة الأدوات والتحضير تستخدم L = 10 mH و C = 1 nF، وخطوة التجربة 1 تذكر C = 47 nF و L = 17.5 mH. المقاومات 6.3 kΩ و 6.9 kΩ تناسب 10 mH و 1 nF (R الحرجة = 6.32 kΩ)، بينما مع 47 nF و 17.5 mH تكون R الحرجة 1.22 kΩ. الطاولة الافتراضية تستخدم 10 mH و 1 nF. والمولد هنا مثالي (بلا مقاومة داخلية).",
      prelab: [
        { q: "مع L = 10 mH و C = 1 nF: تردد الرنين ω0.", a: w0, u: [["rad/s", 1], ["krad/s", 1e3]], sol: "1/√(10⁻² × 10⁻⁹) = 316 228 rad/s (f0 = 50.3 kHz)." },
        { q: "المقاومة التي تعطي تخميدًا حرجًا.", a: Rc, u: [["Ω", 1], ["kΩ", 1e3]], sol: "R = 2√(L/C) = 2√(10⁷) = 6325 Ω." },
        { q: "α عند هذه المقاومة.", a: Rc / (2 * L), u: [["rad/s", 1], ["krad/s", 1e3]], sol: "α = R/2L = 316 228 rad/s = ω0 (هذا معنى الحرج)." },
        { q: "مع R = 200 Ω: تردد التذبذب ωd.", a: wd, u: [["rad/s", 1], ["krad/s", 1e3]], tol: 0.002, sol: "α = 10⁴، ωd = √(ω0² − α²) = 316 070 rad/s." }
      ],
      procs: [{
        id: "p1", title: "الإجراءات 1–7: موجة مربعة 6 Vpp، والمكثف على CH1",
        steps: ["وصّل المولد ← R (صندوق عشري) ← L ← C، و CH1 على المكثف.", "R = 200 Ω و 1 kHz: تذبذب مخمد (underdamped). قِس زمن دورة التذبذب Δt بالمؤشرين.", "زِد R تدريجيًا حتى يختفي التجاوز (overshoot): هذه R الحرجة. استخدم 3 kHz.", "زِد R أكثر (6.9 kΩ) للتخميد الزائد."],
        fig: fig(2, 4, [Gen([1, 0], [0, 0], "6 Vpp ⊓"), E([0, 0], [0, 1], "R", "R", { variable: true, vtext: "0–10 kΩ" }), E([0, 1], [0, 2], "L", "L", { vtext: "10 mH" }), Wr([0, 2], [0, 3]), E([0, 3], [1, 3], "C", "C", { vtext: "1 nF" }), Wr([1, 0], [1, 3])],
          { notes: [{ at: [0.5, 3], text: "CH1", dx: -38 }] }),
        inst: { controls: [{ k: "R", label: "R (Ω) من الصندوق العشري", min: 0, max: 10000, step: 1, def: 200 }, { k: "f", label: "تردد المولد", opts: [["1000", "1 kHz"], ["3000", "3 kHz"]], def: "1000" }],
          read: function (p) { var R = +p.R, f = +p.f, r = rlcSquare(R, L, Cc, 6, f), a = R / (2 * L), kind = a < w0 * 0.9999 ? "تحت التخميد" : a > w0 * 1.0001 ? "فوق التخميد" : "حرج";
            var max = -1e9; r.pts.forEach(function (q) { if (q[0] < r.T / 2) max = Math.max(max, q[1]); });
            var span = Math.min(r.T / 2, 120e-6) * 1e6;
            return { meters: [["α = R/2L", sig(a, 4), "rad/s"], ["نوع الاستجابة", kind, ""], ["أقصى vC بعد الخطوة", sig(max, 4), "V"]],
              scope: { x: [0, span], y: [-4, 10], xl: "t (µs) بعد الحافة الصاعدة", yl: "V", items: [{ ct: function () { return 3; }, c: 2 }, { pts: r.pts.filter(function (q) { return q[0] * 1e6 <= span; }).filter(function (q, i) { return i % 2 === 0; }).map(function (q) { return [q[0] * 1e6, q[1]]; }), c: 1 }] } }; } },
        tables: [{ title: "تحت التخميد (R = 200 Ω)", rows: ["200 Ω"], cols: [{ h: "R", k: "n", src: "row" }, { h: "Δt دورة (µs)", k: "dt", src: "meas" }, { h: "f = 1/Δt (kHz)", k: "f", src: "calc" }, { h: "ω مقاس (rad/s)", k: "w", src: "calc" }, { h: "ωd نظري (rad/s)", k: "wd", src: "calc" }],
          model: function () { var dt = sig(2 * PI / wd * 1e6, 3); return { n: "200 Ω", dt: dt, f: 1e3 / dt, w: 2 * PI * 1e6 / dt, wd: wd }; } },
          { title: "التخميد الحرج والزائد", rows: ["حرج", "زائد (6.9 kΩ)"], cols: [{ h: "", k: "n", src: "row" }, { h: "R (Ω)", k: "R", src: "meas" }, { h: "α (rad/s)", k: "a", src: "calc" }, { h: "s₁ (rad/s)", k: "s1", src: "calc" }, { h: "s₂ (rad/s)", k: "s2", src: "calc" }],
            model: function (n) { var R = n === "حرج" ? Math.round(Rc) : 6900, a = R / (2 * L), d = sqrt(Math.max(0, a * a - w0 * w0)); return { n: n, R: R, a: a, s1: -a + d, s2: -a - d }; }, tol: 0.03 }]
      }]
    });
  })();

  /* ================= Experiment 5 ================= */
  (function () {
    var L = 17.5e-3, Cc = 10e-9, E0 = 5, w0 = 1 / sqrt(L * Cc);
    var F = []; for (var f = 7.5; f <= 15.0001; f += 0.3) F.push(Math.round(f * 10) / 10);
    function rd(R, fk) { var om = w(fk * 1e3), X = om * L - 1 / (om * Cc), Z = Math.hypot(R, X), I = E0 / Z; return { VR: I * R, VL: I * om * L, VC: I / (om * Cc), I: I, pf: R / Z, P: I * I * R }; }
    function tab(R) {
      return { title: "R = " + R + " Ω", rows: F, R: R,
        cols: [{ h: "f (kHz)", k: "f", src: "row" }, { h: "VR (V)", k: "VR", src: "meas" }, { h: "VL (V)", k: "VL", src: "meas" }, { h: "VC (V)", k: "VC", src: "meas" }, { h: "P.F.", k: "pf", src: "calc" }, { h: "I (mA)", k: "I", src: "calc" }, { h: "P (mW)", k: "P", src: "calc" }],
        model: function (fk) { var r = rd(R, fk), VR = sig(r.VR, 3), VL = sig(r.VL, 3), VC = sig(r.VC, 3); return { f: fk, VR: VR, VL: VL, VC: VC, pf: Math.cos(Math.atan((VL - VC) / VR)), I: VR / R * 1e3, P: VR * VR / R * 1e3 }; } };
    }
    function sum(R) {
      return { title: "النتائج النظرية، R = " + R + " Ω", rows: ["—"], cols: [{ h: "", k: "n", src: "row" }, { h: "f0 (Hz)", k: "f0", src: "calc" }, { h: "f1 (Hz)", k: "f1", src: "calc" }, { h: "f2 (Hz)", k: "f2", src: "calc" }, { h: "Q0", k: "Q", src: "calc" }],
        model: function () { var a = R / (2 * L), s = sqrt(a * a + w0 * w0); return { n: "—", f0: w0 / (2 * PI), f1: (s - a) / (2 * PI), f2: (s + a) / (2 * PI), Q: w0 * L / R }; } };
    }
    EXPS.push({ id: "c2e5", n: 5, en: "Resonance in Series RLC Circuits", title: "الرنين في دائرة RLC على التوالي",
      objective: ["دراسة الاستجابة الترددية لدائرة RLC على التوالي.", "التعرف على الرنين ومعامل الجودة وعرض النطاق."],
      equipment: ["مقاومات 100 Ω و 50 Ω و 10 Ω", "ملف 17.5 mH (1000 لفة، قلب هوائي)", "مكثف 10 nF", "ملتيميتران ومولد إشارة"],
      theory: [
        "<span class='ltr'>Z = R + j(ωL − 1/ωC)</span>" + "، " + "<span class='ltr'>|Z| = √(R² + (ωL − 1/ωC)²)</span>" + "، " + "<span class='ltr'>θ = tan⁻¹((ωL − 1/ωC)/R)</span>" + ".",
        "الرنين حين X = 0: " + "<span class='ltr'>f0 = 1/(2π√(LC))</span>" + "؛ |Z| = R أصغر قيمة، ومعامل القدرة 1. تحت f0 المعاوقة سعوية وفوقه حثية.",
        "عند f1 و f2: X = ∓R و |Z| = 1.41R، وهما ترددا نصف القدرة؛ " + "<span class='ltr'>B = f2 − f1</span>" + " و " + "<span class='ltr'>Q0 = ω0L/R = f0/B</span>" + ". تقليل R يرفع Q ويضيّق النطاق."
      ],
      note: "الحسابات بعناصر مثالية (بلا مقاومة للملف ولا للمولد) والجهد 5 V rms ثابت على الدائرة. لذلك VL و VC عند الرنين تساويان Q0 × 5 V (66 V مع 100 Ω و 661 V مع 10 Ω)؛ في المعمل الحقيقي تحدّها مقاومة الملف وقدرة المولد. وخطوة 300 Hz أوسع من نطاق R = 10 Ω (B ≈ 91 Hz)، فلا يُرى f1 و f2 من المنحنى؛ لذلك جدول النتائج من القوانين.",
      prelab: [
        { q: "f0 مع L = 17.5 mH و C = 10 nF.", a: w0 / (2 * PI), u: [["Hz", 1], ["kHz", 1e3]], sol: "1/(2π√(17.5m × 10n)) = 12.03 kHz." },
        { q: "Q0 مع R = 100 Ω.", a: w0 * L / 100, u: [["—", 1]], sol: "ω0L/R = 75 593 × 0.0175/100 = 13.23." },
        { q: "عرض النطاق B بالـ Hz مع R = 100 Ω.", a: 100 / L / (2 * PI), u: [["Hz", 1]], sol: "B = R/(2πL) = 909.5 Hz." },
        { q: "عند f = 7.5 kHz و R = 100 Ω و E = 5 V: التيار.", a: rd(100, 7.5).I, u: [["mA", 1e-3]], tol: 0.01, sol: "X = 824.7 − 2122.1 = −1297.4 Ω، |Z| = 1301.3 Ω ⇐ I = 3.84 mA." }
      ],
      procs: [100, 50, 10].map(function (R, k) {
        return { id: "p" + (k + 1), title: "الإجراء " + (k + 1) + ": R = " + R + " Ω، من 7.5 إلى 15 kHz بخطوة 300 Hz",
          steps: ["اضبط المولد على 5 V rms (تحقق بالملتيميتر عند كل تردد).", "اقرأ VR و VL و VC عند كل تردد، ثم احسب P.F. = cos(tan⁻¹((VL − VC)/VR)) و I = VR/R و P = I²R.", "ارسم P و I و P.F. مع التردد، وحدد f0 و f1 و f2."],
          fig: fig(2, 4, [Gen([1, 0], [0, 0], "5 V rms"), E([0, 0], [0, 1], "R", "R", { vtext: R + " Ω" }), E([0, 1], [0, 2], "L", "L", { vtext: "17.5 mH" }), Wr([0, 2], [0, 3]), E([0, 3], [1, 3], "C", "C", { vtext: "10 nF" }), Wr([1, 0], [1, 3])]),
          inst: { controls: [{ k: "f", label: "تردد المولد (kHz)", opts: F.map(function (x) { return [String(x), x.toFixed(1)]; }), def: "12" }],
            read: function (p) { var r = rd(R, +p.f); return { meters: [["VR", sig(r.VR, 3), "V"], ["VL", sig(r.VL, 3), "V"], ["VC", sig(r.VC, 3), "V"]] }; } },
          tables: [tab(R), sum(R)], plot: { table: 0, x: "f", ys: ["I"], xl: "f (kHz)", yl: "I (mA)" } };
      })
    });
  })();

  /* ================= Experiment 6 ================= */
  (function () {
    var L = 17.5e-3, Cc = 0.1e-6, R = 1000, V = 2, w0 = 1 / sqrt(L * Cc);
    function rd(fk) { var om = w(fk * 1e3), IR = V / R, IC = V * om * Cc, IL = V / (om * L), I = Math.hypot(IR, IC - IL); return { I: I, IR: IR, IC: IC, IL: IL }; }
    var Fm = [], Fx = []; for (var f = 6; f <= 9.0001; f += 0.2) Fm.push(Math.round(f * 10) / 10); for (f = 2; f <= 5.9; f += 0.2) Fx.push(Math.round(f * 10) / 10);
    function tab(rows, title) { return { title: title, rows: rows, cols: [{ h: "f (kHz)", k: "f", src: "row" }, { h: "I (mA)", k: "I", src: "meas" }, { h: "Z = V/I (Ω)", k: "Z", src: "calc" }],
      model: function (fk) { var I = sig(rd(fk).I * 1e3, 3); return { f: fk, I: I, Z: V / I * 1e3 }; } }; }
    var al = 1 / (2 * R * Cc), s = sqrt(al * al + w0 * w0);
    EXPS.push({ id: "c2e6", n: 6, en: "Resonance in Parallel RLC Circuits", title: "الرنين في دائرة RLC على التوازي",
      objective: ["دراسة الاستجابة الترددية لدائرة RLC على التوازي.", "الرنين ومعامل الجودة وعرض النطاق في دائرة التوازي."],
      equipment: ["مقاومة 1 kΩ", "ملف 17.5 mH (1000 لفة، قلب هوائي)", "مكثف 0.1 µF", "ملتيميتران ومولد إشارة"],
      theory: [
        "<span class='ltr'>Y = 1/R + j(ωC − 1/ωL)</span>" + "؛ الرنين حين ωC = 1/ωL: " + "<span class='ltr'>f0 = 1/(2π√(LC))</span>" + "، وعنده Y = 1/R أصغر قيمة، أي |Z| = R أكبر قيمة والتيار أصغر قيمة.",
        "ترددا نصف القدرة: " + "<span class='ltr'>ω1,2 = ∓1/(2RC) + √((1/2RC)² + 1/LC)</span>" + "، و " + "<span class='ltr'>B = 1/(RC)</span>" + " rad/s، و " + "<span class='ltr'>Q0 = ω0RC</span>" + "."
      ],
      note: "تعارض في الكتيب: مع L = 17.5 mH و C = 0.1 µF يكون f0 = 3.80 kHz، بينما الجدول 6.2 من 6 إلى 9 kHz فقط، أي كله فوق الرنين (المعاوقة تنقص). أبقينا جدول الكتيب كما هو، وأضفنا جدولًا من 2.0 إلى 5.8 kHz لرؤية القمة. والعناصر مثالية.",
      prelab: [
        { q: "f0 مع L = 17.5 mH و C = 0.1 µF.", a: w0 / (2 * PI), u: [["Hz", 1], ["kHz", 1e3]], sol: "1/(2π√(1.75 × 10⁻⁹)) = 3.80 kHz." },
        { q: "عرض النطاق B (Hz) مع R = 1 kΩ.", a: 1 / (2 * PI * R * Cc), u: [["Hz", 1]], sol: "1/(2πRC) = 1591.5 Hz." },
        { q: "Q0.", a: w0 * R * Cc, u: [["—", 1]], sol: "ω0RC = 23 905 × 10⁻⁴ = 2.39." },
        { q: "f1 (Hz).", a: (s - al) / (2 * PI), u: [["Hz", 1]], tol: 0.005, sol: "ω1 = −5000 + √(5000² + 23 905²) = 19 422 rad/s ⇐ 3091 Hz." },
        { q: "عند 1 kHz و V = 2 V rms: تيار المصدر.", a: rd(1).I, u: [["mA", 1e-3]], tol: 0.01, sol: "IR = 2 mA، IC = 1.26 mA، IL = 18.19 mA ⇐ I = √(2² + (1.26 − 18.19)²) = 17.05 mA." }
      ],
      procs: [
        { id: "p1", title: "الإجراء 1: القيم عند 1 kHz", steps: ["وصّل R و C و L على التوازي مع المولد، واضبطه على 2 V rms و 1 kHz.", "اقرأ تيار المصدر وتيارات الفروع، ثم احسب Z = V/I و ZR و ZC و ZL."],
          fig: fig(2, 5, [Gen([1, 0], [0, 0], "2 V rms"), Am([0, 0], [0, 1], "I"), E([0, 2], [1, 2], "R", "R", { vtext: "1 kΩ" }), E([0, 3], [1, 3], "C", "C", { vtext: "0.1 µF" }), E([0, 4], [1, 4], "L", "L", { vtext: "17.5 mH" }), Wr([0, 1], [0, 4]), Wr([1, 0], [1, 4])]),
          inst: { read: function () { var r = rd(1); return { meters: [["E", 2, "V"], ["I", sig(r.I * 1e3, 3), "mA"], ["IR", sig(r.IR * 1e3, 3), "mA"], ["IC", sig(r.IC * 1e3, 3), "mA"], ["IL", sig(r.IL * 1e3, 3), "mA"]] }; } },
          tables: [{ title: "عند 1 kHz", rows: ["R", "C", "L", "الكلي"], cols: [{ h: "", k: "n", src: "row" }, { h: "I (mA)", k: "I", src: "meas" }, { h: "Z = V/I (Ω)", k: "Z", src: "calc" }],
            model: function (n) { var r = rd(1), I = sig((n === "R" ? r.IR : n === "C" ? r.IC : n === "L" ? r.IL : r.I) * 1e3, 3); return { n: n, I: I, Z: 2 / I * 1e3 }; } }] },
        { id: "p2", title: "الإجراء 2: Z مع التردد (V = 2 V rms ثابت)", steps: ["غيّر التردد، وأعد ضبط المولد على 2 V rms عند كل تردد، واقرأ I.", "Z = V/I. ارسم Z مع التردد وحدد f0 و f1 و f2 و B و Q0."],
          fig: fig(2, 5, [Gen([1, 0], [0, 0], "2 V rms"), Am([0, 0], [0, 1], "I"), E([0, 2], [1, 2], "R", "R", { vtext: "1 kΩ" }), E([0, 3], [1, 3], "C", "C", { vtext: "0.1 µF" }), E([0, 4], [1, 4], "L", "L", { vtext: "17.5 mH" }), Wr([0, 1], [0, 4]), Wr([1, 0], [1, 4])]),
          inst: { controls: [{ k: "f", label: "تردد المولد (kHz)", opts: Fx.concat(Fm).map(function (x) { return [String(x), x.toFixed(1)]; }), def: "3.8" }],
            read: function (p) { var r = rd(+p.f); return { meters: [["V", 2, "V"], ["I", sig(r.I * 1e3, 3), "mA"]] }; } },
          tables: [tab(Fm, "الجدول 6.2 (6–9 kHz كما في الكتيب)"), tab(Fx, "جدول إضافي من المنصة: 2.0–5.8 kHz (حول الرنين)"),
            { title: "النتائج النظرية", rows: ["—"], cols: [{ h: "", k: "n", src: "row" }, { h: "f0 (Hz)", k: "f0", src: "calc" }, { h: "f1 (Hz)", k: "f1", src: "calc" }, { h: "f2 (Hz)", k: "f2", src: "calc" }, { h: "B (Hz)", k: "B", src: "calc" }, { h: "Q0", k: "Q", src: "calc" }],
              model: function () { return { n: "—", f0: w0 / (2 * PI), f1: (s - al) / (2 * PI), f2: (s + al) / (2 * PI), B: 2 * al / (2 * PI), Q: w0 * R * Cc }; } }],
          plot: { table: 1, x: "f", ys: ["Z"], xl: "f (kHz)", yl: "Z (Ω)", also: 0 } }
      ]
    });
  })();

  /* ================= Experiment 7 ================= */
  (function () {
    var F = [0.5, 2, 3, 4, 6, 12, 20];
    function filt(kind, R, Cc, Vrms) {
      var fc = 1 / (2 * PI * R * Cc);
      function H(fk) { var x = fk * 1e3 / fc; return kind === "lp" ? { m: 1 / sqrt(1 + x * x), th: -Math.atan(x) * D } : { m: x / sqrt(1 + x * x), th: 90 - Math.atan(x) * D }; }
      return { fc: fc, H: H, model: function (row) { var fk = row === "cut" ? fc / 1e3 : row, h = H(fk), Vo = sig(Vrms * h.m, 3), dt = sig(Math.abs(h.th) / 360 / fk * 1e3, 3);
        return { f: row === "cut" ? "fc = " + sig(fc / 1e3, 4) : fk, Vs: sig(Vrms, 3), Vspp: sig(Vrms * 2 * Math.SQRT2, 3), Vo: Vo, Vopp: sig(Vo * 2 * Math.SQRT2, 3), dt: dt, th: (h.th < 0 ? -1 : 1) * dt * 360 * fk / 1e3, g: 20 * Math.log10(Vo / sig(Vrms, 3)) }; } };
    }
    var LP = filt("lp", 5e3, 10e-9, 5), HP = filt("hp", 10e3, 10e-9, 5 / (2 * Math.SQRT2));
    var cols = [{ h: "f (kHz)", k: "f", src: "row" }, { h: "Vs rms (V)", k: "Vs", src: "meas" }, { h: "Vs pp (V)", k: "Vspp", src: "meas" }, { h: "Vo rms (V)", k: "Vo", src: "meas" }, { h: "Vo pp (V)", k: "Vopp", src: "meas" }, { h: "Δt (µs)", k: "dt", src: "meas" }, { h: "θ (°)", k: "th", src: "calc" }, { h: "Gain (dB)", k: "g", src: "calc" }];
    function inst(Fl, Vrms) { return { controls: [{ k: "f", label: "تردد المولد (kHz)", opts: F.map(function (x) { return [String(x), String(x)]; }).concat([["cut", "تردد القطع"]]), def: "cut" }],
      read: function (p) { var r = Fl.model(p.f === "cut" ? "cut" : +p.f), fk = p.f === "cut" ? Fl.fc / 1e3 : +p.f, h = Fl.H(fk), A = Vrms * Math.SQRT2;
        return { meters: [["Vs rms", r.Vs, "V"], ["Vo rms", r.Vo, "V"], ["Δt بين القمتين", r.dt, "µs"]],
          scope: { x: [0, 2 / fk * 1e3], y: [-A * 1.15, A * 1.15], xl: "t (µs)", yl: "V", items: [{ ct: function (t) { return A * Math.sin(2 * PI * fk * 1e3 * t * 1e-6); }, c: 2, n: 600 }, { ct: function (t) { return A * h.m * Math.sin(2 * PI * fk * 1e3 * t * 1e-6 + h.th / D); }, c: 1, n: 600 }] } }; } }; }
    EXPS.push({ id: "c2e7", n: 7, en: "Low-pass and High-pass Filters", title: "مرشحا التمرير المنخفض والعالي",
      objective: ["حساب وقياس تردد القطع لمرشحات RC.", "تصميم مرشح تمرير منخفض ومرشح تمرير عالٍ بسيطين.", "رسم مخطط بود وقراءته."],
      equipment: ["ملتيميتر رقمي وأوسيلوسكوب", "مقاومات 5 kΩ و 10 kΩ (صندوق عشري)", "مكثف 10 nF"],
      theory: [
        "عند تردد القطع تتساوى المفاعلة مع المقاومة: " + "<span class='ltr'>fo = 1/(2πRC)</span>" + " (و R/(2πL) لدائرة RL)، ويكون الخرج 0.707 من الدخل، أي −3 dB.",
        "منخفض (الخرج على C): " + "<span class='ltr'>|H| = 1/√(1 + (f/fo)²)</span>" + " والطور يتأخر حتى −90°. عالٍ (الخرج على R): " + "<span class='ltr'>|H| = (f/fo)/√(1 + (f/fo)²)</span>" + " والطور يتقدم من +90°.",
        "<span class='ltr'>Gain = 20 log(Vo/Vs) dB</span>" + "، والطور من فرق الزمن على الشاشة: " + "<span class='ltr'>θ = 360° × f × Δt</span>" + "."
      ],
      note: "الكتيب يكتب صيغة الديسيبل للقدرة 20 log خطأً؛ الصحيح 10 log(Pout/Pin)، و 20 log للجهد والتيار. ونص الخطوات يقول من 500 Hz إلى 10 kHz بينما الجدول يصل 20 kHz؛ اتبعنا الجدول. ورسمة المرشح العالي معنونة «Low-pass» في الكتيب، وهي CR أي عالٍ.",
      prelab: [
        { q: "مرشح RC منخفض: R = 5 kΩ و C = 10 nF. تردد القطع.", a: LP.fc, u: [["Hz", 1], ["kHz", 1e3]], sol: "1/(2π × 5k × 10n) = 3183 Hz." },
        { q: "Vo عند تردد القطع (Vs = 5 V rms).", a: 5 / Math.SQRT2, u: [["V", 1]], sol: "0.707 × 5 = 3.54 V rms." },
        { q: "مرشح CR عالٍ: R = 10 kΩ و C = 10 nF. تردد القطع.", a: HP.fc, u: [["Hz", 1], ["kHz", 1e3]], sol: "1/(2π × 10k × 10n) = 1592 Hz." },
        { q: "الكسب (dB) للمنخفض عند 12 kHz.", a: 20 * Math.log10(LP.H(12).m), u: [["dB", 1]], tol: 0.01, sol: "|H| = 1/√(1 + (12/3.183)²) = 0.256 ⇐ −11.8 dB." }
      ],
      procs: [
        { id: "p1", title: "الإجراء 1: مرشح التمرير المنخفض (R = 5 kΩ، C = 10 nF، Vs = 5 V rms)", steps: ["CH1 على المولد و CH2 على المكثف (الخرج).", "غيّر التردد حسب الجدول، واقرأ الجهدين و Δt بين القمتين.", "θ = −360 f Δt (الخرج متأخر)، و Gain = 20 log(Vo/Vs)."],
          fig: fig(2, 3, [Gen([1, 0], [0, 0], "5 V rms"), E([0, 0], [0, 1], "R", "R", { vtext: "5 kΩ" }), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "C", "C", { vtext: "10 nF" }), Wr([1, 0], [1, 2])], { notes: [{ at: [0.5, 2], text: "Vo", dx: -36 }] }),
          inst: inst(LP, 5), tables: [{ title: "الجدول 7.1", rows: F.concat(["cut"]), cols: cols, model: LP.model }], plot: { table: 0, x: "f", ys: ["g"], xl: "f (kHz)", yl: "Gain (dB)", logx: true } },
        { id: "p2", title: "الإجراء 2: مرشح التمرير العالي (C = 10 nF، R = 10 kΩ، Vs = 5 Vpp)", steps: ["بدّل موضعي R و C: الخرج على المقاومة.", "نفس القياسات؛ هنا الخرج متقدم: θ = +360 f Δt."],
          fig: fig(2, 3, [Gen([1, 0], [0, 0], "5 Vpp"), E([0, 0], [0, 1], "C", "C", { vtext: "10 nF" }), Wr([0, 1], [0, 2]), E([0, 2], [1, 2], "R", "R", { vtext: "10 kΩ" }), Wr([1, 0], [1, 2])], { notes: [{ at: [0.5, 2], text: "Vo", dx: -36 }] }),
          inst: inst(HP, 5 / (2 * Math.SQRT2)), tables: [{ title: "الجدول 7.2", rows: F.concat(["cut"]), cols: cols, model: HP.model }], plot: { table: 0, x: "f", ys: ["g"], xl: "f (kHz)", yl: "Gain (dB)", logx: true } }
      ]
    });
  })();

  /* ================= Experiment 8 ================= */
  (function () {
    var R1 = 1.5e3, C1 = 10e-9, R2 = 2.2e3, C2 = 1e-9, Vrms = 5 / (2 * Math.SQRT2);
    var fL = 1 / (2 * PI * R1 * C1), fH = 1 / (2 * PI * R2 * C2), fr = sqrt(fL * fH);
    function H(fk) { var s = c(0, w(fk * 1e3)), Zc1 = dv(c(1), mul(s, c(C1))), Zc2 = dv(c(1), mul(s, c(C2))), Zb = par(c(R1), add(c(R2), Zc2)), va = dv(Zb, add(Zc1, Zb)), h = mul(va, dv(Zc2, add(c(R2), Zc2))); return { m: mag(h), th: ang(h) }; }
    // the actual (loaded) circuit: peak and its −3 dB points, found numerically
    var pk = (function () { var best = { f: 0, m: 0 }; for (var x = 2; x <= 6; x += 0.0005) { var fk = Math.pow(10, x) / 1e3, h = H(fk); if (h.m > best.m) best = { f: fk, m: h.m }; } return best; })();
    function edge(dir) { var lo = dir < 0 ? 0.01 : pk.f, hi = dir < 0 ? pk.f : 1e4, t = pk.m / Math.SQRT2; for (var i = 0; i < 200; i++) { var mid = sqrt(lo * hi), m = H(mid).m; if ((m < t) === (dir < 0)) lo = mid; else hi = mid; } return sqrt(lo * hi); }
    var aL = edge(-1), aH = edge(1);
    var F = [2, 4, 6, 8, 10, 11, 12, 13, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 72, 75, 80, 100, 150, 200, 300, 400];
    EXPS.push({ id: "c2e8", n: 8, en: "Pass Band Filter", title: "مرشح تمرير النطاق",
      objective: ["تصميم مرشح تمرير نطاق من مرشح عالٍ يليه مرشح منخفض.", "رسم مخطط بود واستخراج ترددي القطع وعرض النطاق والتردد المركزي."],
      equipment: ["ملتيميتر رقمي وأوسيلوسكوب", "مقاومات 1.5 kΩ و 2.2 kΩ (صندوق عشري)", "مكثفات 10 nF و 1 nF"],
      theory: [
        "مرشح تمرير النطاق = عالٍ (C1، R1) ثم منخفض (R2، C2). كل تردد قطع بنفس القانون: " + "<span class='ltr'>fL = 1/(2πR1C1)</span>" + " و " + "<span class='ltr'>fH = 1/(2πR2C2)</span>" + ".",
        "عرض النطاق " + "<span class='ltr'>BW = fH − fL</span>" + "، والتردد المركزي هو المتوسط الهندسي: " + "<span class='ltr'>fr = √(fL fH)</span>" + ".",
        "هذه القوانين تفترض أن المرحلة الثانية لا تحمّل الأولى. وعمليًا R2 + C2 تحمّل R1، فيتسع النطاق المقاس قليلًا وتنخفض القمة عن 0 dB، وهذا ما ستراه في المقارنة."
      ],
      note: "المقاس هنا من الدائرة الفعلية (المرحلتان موصولتان معًا): القمة −1.92 dB عند 27.7 kHz، وحدود −3 dB تحت القمة عند 7.83 kHz و 98.0 kHz، بينما القوانين البسيطة تعطي 10.6 و 72.3 kHz. والكتيب يذكر مرشح إيقاف النطاق في الأهداف دون خطوات له.",
      prelab: [
        { q: "fL (R1 = 1.5 kΩ، C1 = 10 nF).", a: fL, u: [["Hz", 1], ["kHz", 1e3]], sol: "1/(2π × 1.5k × 10n) = 10.61 kHz." },
        { q: "fH (R2 = 2.2 kΩ، C2 = 1 nF).", a: fH, u: [["Hz", 1], ["kHz", 1e3]], sol: "1/(2π × 2.2k × 1n) = 72.34 kHz." },
        { q: "عرض النطاق.", a: fH - fL, u: [["Hz", 1], ["kHz", 1e3]], sol: "72.34 − 10.61 = 61.73 kHz." },
        { q: "التردد المركزي fr.", a: fr, u: [["Hz", 1], ["kHz", 1e3]], sol: "√(10.61k × 72.34k) = 27.71 kHz." }
      ],
      procs: [{ id: "p1", title: "الخطوات 1–6: Vs = 5 Vpp", steps: ["ركّب: المولد ← C1 ← (R1 إلى الأرضي) ← R2 ← (C2 إلى الأرضي) = Vo.", "غيّر التردد حسب الجدول 8.1 واقرأ Vo و Δt.", "Gain = 20 log(Vo/Vs). ارسم بود واستخرج fL و fH و BW و fr وقارنها بالمحسوبة."],
        fig: fig(2, 4, [Gen([1, 0], [0, 0], "5 Vpp"), E([0, 0], [0, 1], "C", "C1", { vtext: "10 nF" }), E([0, 1], [1, 1], "R", "R1", { vtext: "1.5 kΩ" }), E([0, 1], [0, 2], "R", "R2", { vtext: "2.2 kΩ" }), Wr([0, 2], [0, 3]), E([0, 3], [1, 3], "C", "C2", { vtext: "1 nF" }), Wr([1, 0], [1, 3])], { notes: [{ at: [0.5, 3], text: "Vo", dx: -36 }] }),
        inst: { controls: [{ k: "f", label: "تردد المولد (kHz)", opts: F.map(function (x) { return [String(x), String(x)]; }), def: "25" }],
          read: function (p) { var fk = +p.f, h = H(fk), A = Vrms * Math.SQRT2; return { meters: [["Vs rms", sig(Vrms, 3), "V"], ["Vo rms", sig(Vrms * h.m, 3), "V"], ["Δt", sig(Math.abs(h.th) / 360 / fk * 1e3, 3), "µs"], ["الخرج", h.th >= 0 ? "متقدم" : "متأخر", ""]],
            scope: { x: [0, 2 / fk * 1e3], y: [-A * 1.15, A * 1.15], xl: "t (µs)", yl: "V", items: [{ ct: function (t) { return A * Math.sin(2 * PI * fk * t * 1e-3); }, c: 2, n: 600 }, { ct: function (t) { return A * h.m * Math.sin(2 * PI * fk * t * 1e-3 + h.th / D); }, c: 1, n: 600 }] } }; } },
        tables: [{ title: "الجدول 8.1", rows: F, cols: [{ h: "f (kHz)", k: "f", src: "row" }, { h: "Vs rms (V)", k: "Vs", src: "meas" }, { h: "Vo rms (V)", k: "Vo", src: "meas" }, { h: "Δt (µs)", k: "dt", src: "meas" }, { h: "θ (°)", k: "th", src: "calc" }, { h: "Gain (dB)", k: "g", src: "calc" }],
          model: function (fk) { var h = H(fk), Vs = sig(Vrms, 3), Vo = sig(Vrms * h.m, 3), dt = sig(Math.abs(h.th) / 360 / fk * 1e3, 3); return { f: fk, Vs: Vs, Vo: Vo, dt: dt, th: (h.th < 0 ? -1 : 1) * dt * 360 * fk / 1e3, g: 20 * Math.log10(Vo / Vs) }; } },
          { title: "المقارنة", rows: ["محسوب (القوانين)", "من بود (الدائرة الفعلية)"], cols: [{ h: "", k: "n", src: "row" }, { h: "fL (kHz)", k: "fL", src: "calc" }, { h: "fH (kHz)", k: "fH", src: "calc" }, { h: "BW (kHz)", k: "bw", src: "calc" }, { h: "fr (kHz)", k: "fr", src: "calc" }],
            model: function (n) { return n === "محسوب (القوانين)" ? { n: n, fL: fL / 1e3, fH: fH / 1e3, bw: (fH - fL) / 1e3, fr: fr / 1e3 } : { n: n, fL: aL, fH: aH, bw: aH - aL, fr: pk.f }; }, tol: 0.06 }],
        plot: { table: 0, x: "f", ys: ["g"], xl: "f (kHz)", yl: "Gain (dB)", logx: true } }]
    });
    EXPS[EXPS.length - 1].H = H; EXPS[EXPS.length - 1].peak = pk; EXPS[EXPS.length - 1].edges = [aL, aH];
  })();

  /* ================= Experiment 9 ================= */
  (function () {
    var R1 = 2e3, R2 = 3e3, L = 17.5e-3, f = 1e3, Rs = 10, Vs = 10 / (2 * Math.SQRT2), ZL = c(0, w(f) * L);
    var Z = { z11: add(c(R1), ZL), z12: ZL, z21: ZL, z22: add(c(R2), ZL) };
    var det = add(mul(Z.z11, Z.z22), mul(c(-1), mul(Z.z12, Z.z21)));
    var Y = { y11: dv(Z.z22, det), y12: dv(mul(c(-1), Z.z12), det), y21: dv(mul(c(-1), Z.z21), det), y22: dv(Z.z11, det) };
    // port quantities (I1, I2 entering the network) for each test; the source with its 10 Ω sense resistor on one port
    function test(k) {
      var V1, I1, V2, I2;
      if (k === 1) { I1 = dv(c(Vs), add(c(Rs), Z.z11)); V1 = mul(I1, Z.z11); V2 = mul(I1, Z.z21); I2 = c(0); }
      if (k === 2) { var zin = add(c(R1), par(ZL, c(R2))); I1 = dv(c(Vs), add(c(Rs), zin)); V1 = mul(I1, zin); V2 = c(0); I2 = mul(c(-1), mul(I1, dv(ZL, add(ZL, c(R2))))); }
      if (k === 3) { I2 = dv(c(Vs), add(c(Rs), Z.z22)); V2 = mul(I2, Z.z22); V1 = mul(I2, Z.z12); I1 = c(0); }
      if (k === 4) { var zo = add(c(R2), par(ZL, c(R1))); I2 = dv(c(Vs), add(c(Rs), zo)); V2 = mul(I2, zo); V1 = c(0); I1 = mul(c(-1), mul(I2, dv(ZL, add(ZL, c(R1))))); }
      return { V1: V1, I1: I1, V2: V2, I2: I2 };
    }
    var PN = { 1: ["z11", "z21", "V1/I1", "V2/I1"], 2: ["y11", "y21", "I1/V1", "I2/V1"], 3: ["z12", "z22", "V1/I2", "V2/I2"], 4: ["y12", "y22", "I1/V2", "I2/V2"] };
    var TT = { 1: "منفذ 2 مفتوح (I2 = 0)", 2: "منفذ 2 مقصور (V2 = 0)", 3: "منفذ 1 مفتوح (I1 = 0)", 4: "منفذ 1 مقصور (V1 = 0)" };
    function tfig(k) {
      var src = k <= 2 ? "left" : "right", ed = [E([0, 1], [0, 2], "R", "R1", { vtext: "2 kΩ" }), E([0, 2], [1, 2], "L", "L", { vtext: "17.5 mH" }), E([0, 2], [0, 3], "R", "R2", { vtext: "3 kΩ" }), Wr([1, 1], [1, 3])];
      var gen = function (a, b) { return Gen(a, b, "10 Vpp 1 kHz"); };
      if (src === "left") { ed.push(gen([1, 0], [0, 0]), Wr([0, 0], [0, 1]), E([1, 0], [1, 1], "R", "10 Ω")); ed.push(k === 1 ? E([0, 4], [1, 4], "T") : E([0, 4], [1, 4], "W")); ed.push(Wr([0, 3], [0, 4]), Wr([1, 3], [1, 4])); }
      else { ed.push(gen([1, 4], [0, 4]), Wr([0, 3], [0, 4]), E([1, 3], [1, 4], "R", "10 Ω")); ed.push(k === 3 ? E([0, 0], [1, 0], "T") : E([0, 0], [1, 0], "W")); ed.push(Wr([0, 0], [0, 1]), Wr([1, 0], [1, 1])); }
      return fig(2, 5, ed);
    }
    var procs = [1, 2, 3, 4].map(function (k) {
      var q = PN[k];
      return { id: "p" + k, title: "الإجراء " + k + ": " + TT[k] + " ⇐ " + q[0] + " و " + q[1],
        steps: [k <= 2 ? "المولد (10 Vpp، 1 kHz) على المنفذ 1 عبر مقاومة الحس 10 Ω." : "المولد على المنفذ 2 عبر مقاومة الحس 10 Ω.", "CH1 على المولد، و CH2 على مقاومة 10 Ω: جهدها ÷ 10 = التيار، وطوره نفس طور التيار.", "اقرأ مقادير الجهود والتيارات rms وزواياها بالنسبة لجهد المولد، ثم احسب " + q[0] + " = " + q[2] + " و " + q[1] + " = " + q[3] + "."],
        fig: tfig(k),
        inst: { read: function () { var t = test(k); return { meters: ["V1", "I1", "V2", "I2"].map(function (n) { var isI = n[0] === "I", m = mag(t[n]) * (isI ? 1e3 : 1); return [n, (m < 1e-9 ? "0" : sig(m, 3) + " ∠ " + sig(ang(t[n]), 3) + "°"), isI ? "mA" : "V"]; }) }; } },
        tables: [{ title: "الجدول 9." + k + ": القياسات", rows: ["V1", "I1", "V2", "I2"], cols: [{ h: "", k: "n", src: "row" }, { h: "المقدار rms (V أو mA)", k: "m", src: "meas" }, { h: "الزاوية (°)", k: "a", src: "meas" }],
          model: function (n) { var t = test(k), isI = n[0] === "I", m = mag(t[n]) * (isI ? 1e3 : 1); return { n: n, m: m < 1e-9 ? 0 : sig(m, 3), a: m < 1e-9 ? 0 : sig(ang(t[n]), 3) }; }, angAbs: 1.5 },
          { title: "المعاملات", rows: [q[0], q[1]], cols: [{ h: "", k: "n", src: "row" }, { h: "المقدار (Ω أو mS)", k: "m", src: "calc" }, { h: "الزاوية (°)", k: "a", src: "calc" }],
            model: function (n) { var v = Z[n] || Y[n], isY = n[0] === "y"; return { n: n, m: mag(v) * (isY ? 1e3 : 1), a: ang(v) }; }, angAbs: 1.5 }] };
    });
    EXPS.push({ id: "c2e9", n: 9, en: "Two-Port Network Characterization", title: "توصيف شبكة ذات منفذين",
      objective: ["تحديد معاملات المعاوقة Z والمسامحة Y لشبكة ذات منفذين مجهولة."],
      equipment: ["ملتيميترات رقمية وأوسيلوسكوب", "مقاومات 2 kΩ و 3 kΩ (و 4 kΩ في قائمة الأدوات)، وملف 17.5 mH", "مقاومة حس 10 Ω"],
      theory: [
        "معادلات المعاوقة: " + "<span class='ltr'>V1 = z11I1 + z12I2</span>" + " و " + "<span class='ltr'>V2 = z21I1 + z22I2</span>" + ". بفتح المنفذ 2 (I2 = 0): " + "<span class='ltr'>z11 = V1/I1</span>" + " و " + "<span class='ltr'>z21 = V2/I1</span>" + "، وبفتح المنفذ 1 نحصل على z12 و z22.",
        "معادلات المسامحة: " + "<span class='ltr'>I1 = y11V1 + y12V2</span>" + " و " + "<span class='ltr'>I2 = y21V1 + y22V2</span>" + ". بقصر المنفذ 2 (V2 = 0): " + "<span class='ltr'>y11 = I1/V1</span>" + " و " + "<span class='ltr'>y21 = I2/V1</span>" + ".",
        "لشبكة T (R1 ثم L على التوازي ثم R2): " + "<span class='ltr'>z11 = R1 + jωL</span>" + "، " + "<span class='ltr'>z12 = z21 = jωL</span>" + "، " + "<span class='ltr'>z22 = R2 + jωL</span>" + "، و Y = Z⁻¹.",
        "التيار المقاس I2 موجب إذا دخل الشبكة من الطرف العلوي للمنفذ 2."
      ],
      note: "التحضير في الكتيب يكتب R1 = 2 kΩ و R1 = 3 kΩ و R1 = 4 kΩ (خطأ مطبعي)، والخطوات تستخدم R1 = 2 kΩ و R2 = 3 kΩ و L = 17.5 mH؛ اتبعنا الخطوات. ودرس شبكات المنفذين النظري قيد الإعداد حتى تصل محاضرته.",
      prelab: [
        { q: "ωL عند 1 kHz و L = 17.5 mH.", a: w(f) * L, u: [["Ω", 1]], sol: "2π × 1000 × 0.0175 = 109.96 Ω." },
        { q: "|z11|.", a: mag(Z.z11), u: [["Ω", 1], ["kΩ", 1e3]], sol: "|2000 + j109.96| = 2003.0 Ω." },
        { q: "|z21|.", a: mag(Z.z21), u: [["Ω", 1]], sol: "|j109.96| = 109.96 Ω (∠90°)." },
        { q: "|y11| بالـ mS.", a: mag(Y.y11) * 1e3, u: [["mS", 1]], tol: 0.005, sol: "y11 = z22/Δz = (3000 + j110)/(6×10⁶ − 12 091 + j549 800) ⇐ |y11| = 0.4995 mS." }
      ],
      procs: procs
    });
    EXPS[EXPS.length - 1].Z = Z; EXPS[EXPS.length - 1].Y = Y;
  })();

  /* ================= Experiment 10 ================= */
  (function () {
    var R = 100, VP = 23, VL = VP * sqrt(3), I = VP / R, VPm = 127, VLm = VPm * sqrt(3), Im = VPm / R;   // VP: the bench transformer (23 V star); VPm: the manual's prelab (127 V)
    // Y load: lines A, B, C end on three 100 Ω resistors that meet at the star point N (bottom row)
    function yFig(watt) {
      var ed = [Wr([3, 2], [3, 4]), Wr([3, 1], [3, 2])];
      [["A", 0, 4], ["B", 1, 3], ["C", 2, 2]].forEach(function (l) {
        var r = l[1], cEnd = l[2];
        if (watt && r === 0) ed.push(Wr([0, 0], [0, 1]), Am([0, 1], [0, 2], "لوحة القياس"), Wr([0, 2], [0, cEnd]));
        else if (watt) ed.push(Wr([r, 0], [r, cEnd]));
        else ed.push(Wr([r, 0], [r, 1]), Am([r, 1], [r, 2], "I" + l[0]), Wr([r, 2], [r, cEnd]));
        ed.push(E([r, cEnd], [3, cEnd], "R", "R" + l[0], { vtext: "100 Ω" }));
      });
      return fig(4, 5, ed, { nodeLabels: [{ at: [0, 0], text: "A" }, { at: [1, 0], text: "B" }, { at: [2, 0], text: "C" }, { at: [3, 1], text: "N" }],
        notes: watt ? [{ at: [1.5, 1], text: "اللوحة تقيس جهد كل طور إلى N", dx: 0 }] : [] });
    }
    EXPS.push({ id: "c2e10", n: 10, en: "Three Phase AC Circuits", title: "الدوائر ثلاثية الطور",
      objective: ["التعرف على توصيلات ثلاثي الطور والعلاقات بين الجهود والتيارات.", "دراسة الدوائر ثلاثية الطور المتزنة.", "قياس القدرة ثلاثية الطور."],
      equipment: ["محول ثلاثي الطور منخفض الجهد (LD): نجمة 23 V / 40 V ونجمة 6 V / 10 V، أقصى تيار 4 A في Y", "ثلاث مقاومات متغيرة 1000 Ω، 0.57 A (الحمل)", "لوحة قياس القدرة MFA-2001: P و Q و cos φ لكل طور وللمجموع", "ملتيميتران (أميتر وفولتميتر)"],
      theory: [
        "المولد ثلاثي الطور: ثلاثة ملفات بينها 120°. " + "<span class='ltr'>van = √2 V sin ωt</span>" + "، " + "<span class='ltr'>vbn = √2 V sin(ωt − 120°)</span>" + "، " + "<span class='ltr'>vcn = √2 V sin(ωt − 240°)</span>" + ".",
        "حمل Y متزن: " + "<span class='ltr'>IL = IP</span>" + " و " + "<span class='ltr'>VL = √3 VP</span>" + ". حمل Δ متزن: " + "<span class='ltr'>VL = VP</span>" + " و " + "<span class='ltr'>IL = √3 IP</span>" + ".",
        "في الحالتين: " + "<span class='ltr'>P = √3 VL IL cos θ = 3 VP IP cos θ</span>" + "، و θ الزاوية بين جهد الطور وتياره (صفر للمقاومات).",
        "لوحة القياس فيها محول تيار في كل خط وتقيس جهد كل طور إلى N، فتعرض P و Q و cos φ لكل طور وللمجموع. للحمل المتزن: الكلية = 3 × قدرة الطور."
      ],
      note: "الكتيب يذكر واتميترين ومحولًا بدون جهد محدد، وأسئلة التحضير فيه على 127 V للطور (220 V للخط) و 100 Ω. طاولة المعمل في الجامعة، وهذه الطاولة الافتراضية مثلها، فيها محول LD منخفض الجهد بنجمتين (23 V / 40 V و 6 V / 10 V)، وثلاث مقاومات متغيرة 1000 Ω (0.57 A) تُضبط على 100 Ω، ولوحة قياس القدرة MFA-2001 بدل الواتميتر. لذلك الجداول على 23 V للطور: التيار 0.23 A وقدرة الطور 5.29 W، والتحضير يبقى على أرقام الكتيب. ومعادلات جهود الخط في الكتيب تكتب VBC و VCA باسم Vbn و Vcn (خطأ مطبعي)، والصحيح أن جهود الخط تتقدم جهود الطور بـ 30° في التتابع abc.",
      prelab: [
        { q: "(4.1) حمل Δ، 100 Ω لكل طور، VAB = 220∠0° V: مقدار IAB.", a: 2.2, u: [["A", 1]], sol: "220/100 = 2.2 A (∠0°)، و IBC = 2.2∠−120°، و ICA = 2.2∠120°." },
        { q: "تيار الخط في نفس الحمل.", a: 2.2 * sqrt(3), u: [["A", 1]], sol: "√3 × 2.2 = 3.81 A." },
        { q: "القدرة الكلية لحمل Δ.", a: 3 * 220 * 220 / 100, u: [["W", 1], ["kW", 1e3]], sol: "3 × 220²/100 = 1452 W." },
        { q: "(4.2) حمل Y، 100 Ω، VAN = 127∠0° V: مقدار VAB.", a: VLm, u: [["V", 1]], tol: 0.002, sol: "√3 × 127 = 219.97 V، و VAB = 219.97∠30° V." },
        { q: "IAN.", a: Im, u: [["A", 1]], sol: "127/100 = 1.27 A ∠0°." },
        { q: "القدرة الكلية لحمل Y.", a: 3 * VPm * VPm / R, u: [["W", 1]], tol: 0.002, sol: "3 × 127²/100 = 483.9 W." }
      ],
      procs: [
        { id: "p1", title: "الإجراء 1: حمل Y متزن (100 Ω لكل طور)", steps: ["قبل التوصيل: اضبط كل مقاومة متغيرة على 100 Ω بين a و w (حرّك المنزلق)، وتأكد بالأوميتر.", "وصّل نجمة 23 V / 40 V في المحول (L1 L2 L3 N) إلى مداخل لوحة القياس، ومخارج اللوحة إلى طرف a في كل مقاومة، واجمع أطراف w الثلاثة على N.", "الأميتر على التوالي في الخط L1، والفولتميتر بين L1 و L2 (جهد الخط) ثم بين L1 و N (جهد الطور). صفحة I في اللوحة تعرض تيارات الخطوط الثلاثة. سجّل القراءات."],
          fig: yFig(false),
          inst: { read: function () { return { meters: [["IA", sig(I, 3), "A"], ["IB", sig(I, 3), "A"], ["IC", sig(I, 3), "A"], ["VL (AB)", sig(VL, 3), "V"], ["VP (AN)", VP, "V"]] }; } },
          tables: [{ title: "الحمل المتزن", rows: ["—"], cols: [{ h: "", k: "n", src: "row" }, { h: "IA (A)", k: "IA", src: "meas" }, { h: "IB (A)", k: "IB", src: "meas" }, { h: "IC (A)", k: "IC", src: "meas" }, { h: "VL (V)", k: "VL", src: "meas" }, { h: "VP (V)", k: "VP", src: "meas" }, { h: "VL/VP", k: "r", src: "calc" }],
            model: function () { return { n: "—", IA: sig(I, 3), IB: sig(I, 3), IC: sig(I, 3), VL: sig(VL, 3), VP: VP, r: sig(VL, 3) / VP }; } }] },
        { id: "p2", title: "الإجراء 2 و 3: القدرة من لوحة القياس", steps: ["بنفس التوصيل، اضغط ▲ أو ▼ في اللوحة لين تظهر صفحة L1: الأسطر الثلاثة P و Q و cos φ للطور الأول.", "اضرب P<sub>L1</sub> في 3، وقارنها بـ 3IA²RA.", "انتقل لصفحة Σ: القدرة الكلية للأطوار الثلاثة. قارنها بما حسبت."],
          fig: yFig(true),
          inst: { read: function () { return { meters: [["P L1 (اللوحة)", sig(VP * I, 4), "W"], ["P Σ (اللوحة)", sig(3 * VP * I, 4), "W"], ["cos φ", 1, ""], ["IA", sig(I, 3), "A"]] }; } },
          tables: [{ title: "القدرة", rows: ["—"], cols: [{ h: "", k: "n", src: "row" }, { h: "PA (W)", k: "PA", src: "meas" }, { h: "3 PA (W)", k: "P3", src: "calc" }, { h: "3 IA² RA (W)", k: "Pi", src: "calc" }, { h: "الكلية من اللوحة Σ (W)", k: "PT", src: "meas" }],
            model: function () { var PA = sig(VP * I, 4), Ia = sig(I, 3); return { n: "—", PA: PA, P3: 3 * PA, Pi: 3 * Ia * Ia * R, PT: sig(3 * VP * I, 4) }; } }] }
      ]
    });
  })();


  /* ================= the bench for each experiment ================= */
  function lay(id, name, parts, leads, set, lbl) { return { id: id, name: name, parts: parts || {}, leads: leads, set: set || {}, lbl: lbl || {} }; }
  var SC = function (vd1, vd2, td) { return { sc: { c1: { vd: vd1, cp: "DC", on: true }, c2: { vd: vd2, cp: "DC", on: true }, td: td, meas: true } }; };
  function B(e, inst, kitIds, layouts) { var x = EXPS[e - 1]; x.inst = inst; x.kit = kit(kitIds); x.procs.forEach(function (p, k) { p.layouts = layouts[k] || []; }); }
  // Lab 1 and 2: generator → decade box R → C (v:1:2) → back; CH1 on C, CH2 on the generator
  var rcLeads = [["fg.out", "rb.a"], ["rb.b", "t:1:2:3"], ["t:2:2:5", "fg.com"], ["sc.1", "t:1:2:1"], ["sc.1g", "t:2:2:3"], ["sc.2", "fg.out"], ["sc.2g", "t:2:2:7"]];
  B(1, ["fg", "sc", "rb", "d1"], ["C47n", "C1n", "C10n"], [[lay("L1", "RC بموجة 0 → 10 V", { "v:1:2": P("C47n", "C") }, rcLeads, mix(SQ(200, 10, 5), { rb: { d: [1, 0, 0, 0, 0] } }, SC(2, 2, 5e-4)), { rb: "R" })]]);
  B(2, ["fg", "sc", "rb", "d1"], ["C47n", "C1n", "C10n"], [[lay("L1", "RC بموجة ±10 V", { "v:1:2": P("C47n", "C") }, rcLeads, mix(SQ(200, 20, 0), { rb: { d: [1, 0, 0, 0, 0] } }, SC(5, 5, 5e-4)), { rb: "R" })]]);
  // Lab 3: the coupled-coil unit (terminals 1 ● and 1' of coil 1, A and B of coil 2)
  var dcSet = function () { return { ps: { on: true, mode: "normal", m: { v: 5, i: 2 } }, d1: { mode: "adc" }, d2: { mode: "vdc" } }; };
  var acSet = { va: { on: true, v: 5 }, d1: { mode: "aac" }, d2: { mode: "vac" } };
  B(3, ["ps", "va", "d1", "d2", "cc"], [], [
    [lay("L1", "الملف 1", {}, [["ps.m+", "d1.A"], ["d1.COM", "cc.1"], ["cc.1'", "ps.m-"], ["d2.V", "cc.1"], ["d2.COM", "cc.1'"]], dcSet()),
     lay("L2", "الملف 2", {}, [["ps.m+", "d1.A"], ["d1.COM", "cc.A"], ["cc.B", "ps.m-"], ["d2.V", "cc.A"], ["d2.COM", "cc.B"]], dcSet())],
    [lay("L3", "الملف 1", {}, [["va.L", "d1.A"], ["d1.COM", "cc.1"], ["cc.1'", "va.N"], ["d2.V", "cc.1"], ["d2.COM", "cc.1'"]], acSet),
     lay("L4", "الملف 2", {}, [["va.L", "d1.A"], ["d1.COM", "cc.A"], ["cc.B", "va.N"], ["d2.V", "cc.A"], ["d2.COM", "cc.B"]], acSet)],
    [lay("L5", "V2 على الملف 2 المفتوح", {}, [["va.L", "d1.A"], ["d1.COM", "cc.1"], ["cc.1'", "va.N"], ["d2.V", "cc.A"], ["d2.COM", "cc.B"]], acSet)],
    [lay("L6", "1' موصول بـ B، و VT بين 1 و A", {}, [["va.L", "cc.1"], ["cc.1'", "va.N"], ["cc.1'", "cc.B"], ["d1.V", "cc.1"], ["d1.COM", "cc.A"], ["d2.V", "cc.A"], ["d2.COM", "cc.B"]], { va: { on: true, v: 5 }, d1: { mode: "vac" }, d2: { mode: "vac" } })],
    [lay("L7", "توالي aiding (1' ← B)", {}, [["va.L", "d1.A"], ["d1.COM", "cc.1"], ["cc.1'", "cc.B"], ["cc.A", "va.N"], ["d2.V", "cc.1"], ["d2.COM", "cc.A"]], acSet),
     lay("L8", "توالي opposing (1' ← A)", {}, [["va.L", "d1.A"], ["d1.COM", "cc.1"], ["cc.1'", "cc.A"], ["cc.B", "va.N"], ["d2.V", "cc.1"], ["d2.COM", "cc.B"]], acSet)]]);
  // Lab 4: generator → decade box R → L (h:1:2) → C (v:1:3); CH1 on C. The generator's own 50 Ω adds to the box.
  var rlcLeads = [["fg.out", "rb.a"], ["rb.b", "t:1:2:3"], ["t:2:3:5", "fg.com"], ["sc.1", "t:1:3:1"], ["sc.1g", "t:2:3:3"], ["sc.2", "fg.out"], ["sc.2g", "t:2:3:7"]], rlcParts = { "h:1:2": P("L10m", "L"), "v:1:3": P("C1n", "C") };
  B(4, ["fg", "sc", "rb", "d1"], ["L10m", "C1n", "C10n"], [[
    lay("L1", "R = 200 Ω، 1 kHz", rlcParts, rlcLeads, mix(SQ(1000, 6), { rb: { d: [0, 0, 2, 0, 0] } }, SC(1, 1, 2e-5)), { rb: "R" }),
    lay("L2", "حرج: صندوق 6275 Ω + 50 Ω المولد", rlcParts, rlcLeads, mix(SQ(3000, 6), { rb: { d: [0, 6, 2, 7, 5] } }, SC(1, 1, 2e-5)), { rb: "R" }),
    lay("L3", "R = 6.9 kΩ، 3 kHz", rlcParts, rlcLeads, mix(SQ(3000, 6), { rb: { d: [0, 6, 9, 0, 0] } }, SC(1, 1, 2e-5)), { rb: "R" })]]);
  // Lab 5: R (h:1:1) → L (h:1:2) → C (v:1:3), 5 V rms on the circuit; d1 on R, d2 on C
  function ser(Rid) { return lay("L" + Rid, "R = " + PIECES[Rid].v + " Ω", { "h:1:1": P(Rid, "R"), "h:1:2": P("L17m", "L"), "v:1:3": P("C10n", "C") },
    [["fg.out", "t:1:1:3"], ["t:2:3:5", "fg.com"], ["d1.V", "t:1:1:1"], ["d1.COM", "t:1:2:1"], ["d2.V", "t:1:3:1"], ["d2.COM", "t:2:3:1"]], { fg: { on: true, w: "sin", f: 12000 }, fgTerm: 5 * 2 * Math.SQRT2, d1: { mode: "vac" }, d2: { mode: "vac" } }); }
  B(5, ["fg", "d1", "d2"], ["R100", "R50", "R10", "L17m", "C10n"], [[ser("R100")], [ser("R50")], [ser("R10")]]);
  // Lab 6: R, C, L in parallel (v:1:2, v:1:3, v:1:4), source current through the mA input of d2
  var parP = { "v:1:2": P("R1k", "R"), "v:1:3": P("C100n", "C"), "v:1:4": P("L17m", "L"), "h:1:2": BR, "h:1:3": BR, "h:2:2": BR, "h:2:3": BR },
    parL = [["fg.out", "d2.mA"], ["d2.COM", "t:1:2:3"], ["t:2:2:5", "fg.com"], ["d1.V", "t:1:2:1"], ["d1.COM", "t:2:2:1"]];
  B(6, ["fg", "d1", "d2"], ["R1k", "C100n", "L17m"], [[lay("L1", "1 kHz", parP, parL, { fg: { on: true, w: "sin", f: 1000 }, fgTerm: 2 * 2 * Math.SQRT2, d1: { mode: "vac" }, d2: { mode: "maac" } })],
    [lay("L2", "قرب الرنين 3.8 kHz", parP, parL, { fg: { on: true, w: "sin", f: 3800 }, fgTerm: 2 * 2 * Math.SQRT2, d1: { mode: "vac" }, d2: { mode: "maac" } })]]);
  // Lab 7: low-pass (box R then C) and high-pass (C then box R); CH1 on the generator, CH2 on the output
  B(7, ["fg", "sc", "rb", "d1"], ["C10n", "C1n"], [
    [lay("L1", "منخفض RC", { "v:1:2": P("C10n", "C") }, [["fg.out", "rb.a"], ["rb.b", "t:1:2:3"], ["t:2:2:5", "fg.com"], ["sc.1", "fg.out"], ["sc.1g", "t:2:2:3"], ["sc.2", "t:1:2:1"], ["sc.2g", "t:2:2:7"]],
      mix({ fg: { on: true, w: "sin", f: 3183 }, fgTerm: 5 * 2 * Math.SQRT2, rb: { d: [0, 5, 0, 0, 0] } }, SC(5, 5, 1e-4)), { rb: "R" })],
    [lay("L2", "عالٍ CR", { "h:1:1": P("C10n", "C") }, [["fg.out", "t:1:1:3"], ["t:1:2:5", "rb.a"], ["rb.b", "t:2:2:3"], ["t:2:2:5", "fg.com"], ["sc.1", "fg.out"], ["sc.1g", "t:2:2:1"], ["sc.2", "t:1:2:1"], ["sc.2g", "t:2:2:7"]],
      mix({ fg: { on: true, w: "sin", f: 1592 }, fgTerm: 5, rb: { d: [1, 0, 0, 0, 0] } }, SC(1, 1, 2e-4)), { rb: "R" })]]);
  // Lab 8: C1 (h:1:1), R1 (v:1:2), R2 (h:1:2), C2 (v:1:3), bottom bridge h:2:2
  B(8, ["fg", "sc", "d1"], ["C10n", "C1n", "R1k5", "R2k2"], [[lay("L1", "تمرير النطاق", { "h:1:1": P("C10n", "C1"), "v:1:2": P("R1k5", "R1"), "h:1:2": P("R2k2", "R2"), "v:1:3": P("C1n", "C2"), "h:2:2": BR },
    [["fg.out", "t:1:1:3"], ["t:2:2:5", "fg.com"], ["sc.1", "fg.out"], ["sc.1g", "t:2:2:3"], ["sc.2", "t:1:3:1"], ["sc.2g", "t:2:2:7"]], mix({ fg: { on: true, w: "sin", f: 25000 }, fgTerm: 5 }, SC(0.5, 0.5, 1e-5)))]]);
  // Lab 9: the T network R1 (h:1:1), L (v:1:2), R2 (h:1:2), bottom bridges; 10 Ω sense resistor under the driven port
  var tParts = function (extra) { var o = { "h:1:1": P("R2k", "R1"), "v:1:2": P("L17m", "L"), "h:1:2": P("R3k", "R2"), "h:2:1": BR, "h:2:2": BR }; Object.keys(extra).forEach(function (k) { o[k] = extra[k]; }); return o; };
  var drive1 = [["fg.out", "t:1:1:3"], ["fg.com", "t:3:1:5"], ["sc.1", "fg.out"], ["sc.1g", "t:3:1:3"], ["sc.2", "t:2:1:3"], ["sc.2g", "t:3:1:7"], ["d1.V", "t:1:1:1"], ["d1.COM", "t:2:1:1"], ["d2.V", "t:1:3:1"], ["d2.COM", "t:2:3:1"]];
  var drive2 = [["fg.out", "t:1:3:3"], ["fg.com", "t:3:3:5"], ["sc.1", "fg.out"], ["sc.1g", "t:3:3:3"], ["sc.2", "t:2:3:3"], ["sc.2g", "t:3:3:7"], ["d1.V", "t:1:1:1"], ["d1.COM", "t:2:1:1"], ["d2.V", "t:1:3:1"], ["d2.COM", "t:2:3:1"]];
  var tSet = mix({ fg: { on: true, w: "sin", f: 1000 }, fgTerm: 10, d1: { mode: "vac" }, d2: { mode: "vac" } }, SC(2, 0.02, 2e-4));
  B(9, ["fg", "sc", "d1", "d2"], ["R2k", "R3k", "L17m", "R10"], [
    [lay("L1", "المنفذ 2 مفتوح", tParts({ "v:2:1": P("R10", "Rs") }), drive1, tSet)],
    [lay("L2", "المنفذ 2 مقصور", tParts({ "v:2:1": P("R10", "Rs"), "v:1:3": BR }), drive1, tSet)],
    [lay("L3", "المنفذ 1 مفتوح", tParts({ "v:2:3": P("R10", "Rs") }), drive2, tSet)],
    [lay("L4", "المنفذ 1 مقصور", tParts({ "v:2:3": P("R10", "Rs"), "v:1:1": BR }), drive2, tSet)]]);
  // Lab 10: the real bench: the 23 V star of the LD transformer → the power meter panel → the three rheostats (a–w = 100 Ω), sliders joined on N
  var rh100 = { tp: { on: true }, r1: { x: 100 }, r2: { x: 100 }, r3: { x: 100 } };
  var yLeads = [["tp.B", "pm.2"], ["tp.C", "pm.3"], ["tp.N", "pm.N"], ["pm.1'", "r1.a"], ["pm.2'", "r2.a"], ["pm.3'", "r3.a"], ["r1.w", "pm.N'"], ["r2.w", "pm.N'"], ["r3.w", "pm.N'"]];
  B(10, ["tp", "pm", "d1", "d2", "r1", "r2", "r3"], [], [
    [lay("L1", "IA و VAB", {}, [["tp.A", "d1.A"], ["d1.COM", "pm.1"]].concat(yLeads, [["d2.V", "pm.1'"], ["d2.COM", "pm.2'"]]), mix(rh100, { d1: { mode: "aac" }, d2: { mode: "vac" }, pm: { pg: 5 } })),
     lay("L1b", "IA و VAN", {}, [["tp.A", "d1.A"], ["d1.COM", "pm.1"]].concat(yLeads, [["d2.V", "pm.1'"], ["d2.COM", "pm.N'"]]), mix(rh100, { d1: { mode: "aac" }, d2: { mode: "vac" }, pm: { pg: 4 } }))],
    [lay("L2", "صفحة L1 في اللوحة", {}, [["tp.A", "pm.1"]].concat(yLeads), mix(rh100, { pm: { pg: 0 } })),
     lay("L3", "صفحة Σ في اللوحة", {}, [["tp.A", "pm.1"]].concat(yLeads), mix(rh100, { pm: { pg: 3 } }))]]);
  CV.c2lab = { PIECES: PIECES, list: EXPS, sig: sig, Cx: Cx, rcSquare: rcSquare, rlcSquare: rlcSquare, coil: COIL };
})(typeof window !== "undefined" ? window : globalThis);
