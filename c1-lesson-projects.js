/* CircuitVision — Project Academy: one project for every Circuits 1 lesson.
   Each project is exactly the idea of its lesson, built on the breadboard with lab instruments.
   Numbers (design answers, simulation readings, expected measurements) come from the lab solver at run time.
   Generators are set as ideal sources (0 Ω output) unless the lesson is about the source's own impedance;
   on a real generator the student sets the amplitude while watching CH1 on its terminals. */
(function () {
  "use strict";
  var CV = window.CV, K = CV.projectKitDef, U = K.U, e12 = K.e12, Cx = CV.ac.C;
  var si = function (v, u) { return CV.ac.si(v, u); }, n = function (v) { return CV.num(v); };
  var eq = function (s) { return "<span class='eq-i'>" + s + "</span>"; }, L = function (s) { return "<span class='ltr'>" + s + "</span>"; };
  var mag = function (z) { return Cx.abs(z); }, ph = function (z) { return Cx.arg(z); };
  var wrap = function (d) { while (d > 180) d -= 360; while (d <= -180) d += 360; return d; };
  var COUL = [{ l: "mC", f: 1e-3 }, { l: "C", f: 1 }], WH = [{ l: "mWh", f: 1e-3 }, { l: "Wh", f: 1 }];
  function ctl(id, label, opts, unit, def, labels) { return { id: id, label: label, opts: opts, unit: unit, def: def, labels: labels }; }
  function q(label, symbol, f, units, sol, o) { var s = { label: label, symbol: symbol, f: f, units: units, sol: sol }; for (var k in (o || {})) s[k] = o[k]; return s; }
  function choice(label, options, sol, hints) { return { kind: "choice", label: label, options: options, sol: sol, hints: hints || [] }; }
  function D(o) { K.define(o); }
  var G = function (amp, freq, o) { var x = { amp: amp, freq: freq, rs: 0.01, plus: "a", phase: 0 }; for (var k in (o || {})) x[k] = o[k]; return x; };
  var rms = function (z) { return mag(z) / Math.SQRT2; };

  /* ================= الفصل 1: متغيرات الدائرة ================= */
  D({ lesson: "c1-variables-1", chapter: "variables", ar: "كشاف LED: من الدائرة الحقيقية إلى النموذج", en: "LED Flashlight: from Circuit to Model", level: "مبتدئ",
    summary: "تبني كشافًا صغيرًا، تكتب نموذجه المجمّع، تتنبأ بتياره ثم تقيس وتقارن: دورة تحليل الدوائر كاملة.",
    idea: "<p>تحليل الدوائر يبدأ بنموذج: نستبدل القطع الحقيقية بعناصر مثالية (بطارية = مصدر جهد، LED المضيء = هبوط جهد ثابت مع مقاومة صغيرة، الأسلاك = مثالية) ونحسب، ثم نقارن بالقياس. الكشاف يعمل بتيار مستمر وأبعاده سنتيمترات، فالنموذج المجمّع صالح تمامًا.</p>",
    specs: ["بطارية 9 V ومفتاح ضغط ومقاومة و LED أحمر.", "نموذج الـ LED المضيء: " + L("2.0 V") + " مع " + L("10 Ω") + " على التوالي.", "التيار بين 5 و 20 mA."],
    controls: [ctl("r", "المقاومة", e12(220, 2200), "Ω", 560)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 9, plus: "a", bat: true, tag: "B" }], ["SW", [1, 0], [1, 1], { closed: true, tag: "S" }], ["R", [1, 1], [1, 2], { value: v.r, tag: "R" }], ["LED", [1, 2], [2, 2], { color: "red", plus: "a", tag: "D" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { vp: [1, 1], vn: [1, 2] } }; },
    design: { prompt: "الكشاف: بطارية " + L("9 V") + "، مقاومة " + L("560 Ω") + "، LED أحمر نموذجه " + L("2.0 V + 10 Ω") + ". المفتاح مضغوط.",
      steps: [
        q("بـ KVL حول الحلقة، اكتب تيار النموذج.", "i =", function (h) { return h.el("R").i; }, U.A, function (h) { return eq("i = (9 − 2.0) / (560 + 10) = " + si(h.el("R").i, "A")); }, { unitDefault: 1, hints: [eq("9 = i·R + 2.0 + i·10")] }),
        q("جهد المقاومة في النموذج.", "v<sub>R</sub> =", function (h) { return h.el("R").v; }, U.V, function (h) { return eq("v<sub>R</sub> = i × 560 = " + si(h.el("R").v, "V")); }, { unitDefault: 1 }),
        q("القدرة التي يأخذها الـ LED (الجهد الثابت والمقاومة الصغيرة معًا).", "p<sub>LED</sub> =", function (h) { return h.el("D").p; }, U.W, function (h) { return eq("p = 2.0·i + 10·i² = " + si(h.el("D").p, "W")); }),
        choice("الكشاف يعمل بتيار مستمر وأطول سلك فيه 20 cm. هل النموذج المجمّع صالح؟", [{ t: "نعم: الإشارة لا تتغير مع الزمن، فطول موجتها لا نهائي وكل أبعاد الدائرة أصغر منها بكثير", correct: true }, { t: "لا: الأسلاك أطول من 1 cm", type: "conceptual", why: "الشرط مقارنة الأبعاد بطول الموجة، وفي التيار المستمر طول الموجة لا نهائي." }, { t: "لا يمكن الحكم بدون معرفة التيار", type: "conceptual", why: "صلاحية النموذج المجمّع تعتمد على تردد الإشارة وأبعاد الدائرة، لا على قيمة التيار." }], "نعم. شرط النموذج المجمّع: أبعاد الدائرة أصغر بكثير من طول الموجة.")
      ] },
    readings: [["التيار", function (h) { return si(h.el("R").i, "A"); }], ["جهد المقاومة", function (h) { return si(h.el("R").v, "V"); }], ["جهد الـ LED", function (h) { return si(h.el("D").v, "V"); }], ["قدرة المقاومة", function (h) { return si(h.el("R").p, "W"); }]],
    checks: [["الـ LED مضيء", function (h) { return h.el("D").on && h.el("D").i > 1e-4; }], ["التيار بين 5 و 20 mA", function (h) { var i = h.el("R").i; return i >= 0.005 && i <= 0.02; }], ["قدرة المقاومة أقل من 125 mW", function (h) { return h.el("R").p < 0.125; }]],
    measure: [{ id: "vR", label: "جهد المقاومة", units: U.V, def: 1, f: function (h) { return h.el("R").v; } }, { id: "vD", label: "جهد الـ LED", units: U.V, def: 1, f: function (h) { return h.el("D").v; } }, { id: "vB", label: "جهد البطارية والمفتاح مضغوط", units: U.V, def: 1, f: function () { return 9; } }],
    analyze: function (m, v) { var o = []; if (m.vR != null) o.push("التيار الحقيقي من قياسك = " + L("v<sub>R</sub>/R = " + si(m.vR / v.r, "A")) + "."); if (m.vB != null && m.vB < 9) o.push("بطارية 9 V تحت الحمل تعطي أقل من 9 V بسبب مقاومتها الداخلية: هذا عنصر لم يكن في النموذج."); if (m.vD != null) o.push("الفرق بين جهد الـ LED المقاس و 2.0 V يوضح أن النموذج تقريب للقطعة الحقيقية."); return o; },
    causes: ["البطارية الحقيقية لها مقاومة داخلية وجهدها ينخفض مع الاستهلاك.", "V<sub>f</sub> الحقيقي للـ LED يختلف حسب القطعة واللون.", "سماحية المقاومة ±5%."] });

  D({ lesson: "c1-variables-2", chapter: "variables", ar: "قياس التيار والجهد واتجاهات المرجع", en: "Measuring Current and Voltage, Reference Directions", level: "مبتدئ",
    summary: "تقيس التيار بأميتر على التوالي والجهد بملتيميتر على التوازي، وتعرف معنى القراءة السالبة عند عكس اتجاه المرجع.",
    idea: "<p>التيار يُعرَّف بمعدل مرور الشحنة <span class='ltr'>i = dq/dt</span>، والجهد بالطاقة لكل وحدة شحنة. لكل منهما <b>اتجاه مرجعي</b> نختاره: إذا جاء الحساب أو القياس سالبًا فالاتجاه الحقيقي عكس المرجع. في المشروع تختار المراجع بنفسك على اللوحة: طرف VΩ هو + المرجع، والتيار يُقرأ موجبًا إذا دخل من الرجل الأولى للأميتر.</p>",
    specs: ["مقاومتان على التوالي على قناة من مزود الجهد.", "أميتر لوحة في الحلقة وملتيميتر على المقاومة الثانية.", "تقيس مرة بالمرجع الطبيعي ومرة بعد عكس سلكي الملتيميتر."],
    controls: [ctl("vs", "جهد المزود", [3, 5, 6, 9, 12], "V", 6), ctl("r1", "R1", e12(100, 10000), "Ω", 1000), ctl("r2", "R2", e12(100, 10000), "Ω", 2200)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: v.vs, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: v.r1, tag: "R1" }], ["R", [1, 2], [2, 2], { value: v.r2, tag: "R2" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { vp: [1, 2], vn: [2, 2] } }; },
    design: { prompt: "مزود " + L("6 V") + "، و " + L("R1 = 1 kΩ") + " و " + L("R2 = 2.2 kΩ") + " على التوالي. مرجع التيار: من + المزود عبر R1 ثم R2. مرجع جهد R2: + في طرفها المتصل بـ R1.",
      steps: [
        q("التيار في الحلقة.", "i =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i = 6 / (1000 + 2200) = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("جهد R2 بالمرجع المحدد.", "v<sub>2</sub> =", function (h) { return h.v([1, 2], [2, 2]); }, U.V, function (h) { return eq("v<sub>2</sub> = i × 2200 = " + si(h.v([1, 2], [2, 2]), "V")); }, { unitDefault: 1 }),
        q("لو عكست سلكي الملتيميتر (COM على الطرف العلوي)، ماذا يقرأ؟", "v =", function (h) { return -h.v([1, 2], [2, 2]); }, U.V, function (h) { return "نفس المقدار بإشارة سالبة: " + L(si(-h.v([1, 2], [2, 2]), "V")) + ". الجهد الحقيقي لم يتغير، تغيّر المرجع فقط."; }, { unitDefault: 1 }),
        q("كم شحنة تمر في المقاومة خلال دقيقة واحدة؟", "q =", function (h) { return h.el("A1").i * 60; }, COUL, function (h) { return eq("q = i·t = " + si(h.el("A1").i, "A") + " × 60 s = " + si(h.el("A1").i * 60, "C")); })
      ] },
    readings: [["التيار", function (h) { return si(h.el("A1").i, "A"); }], ["جهد R1", function (h) { return si(h.el("R1").v, "V"); }], ["جهد R2", function (h) { return si(h.el("R2").v, "V"); }]],
    checks: [["التيار أقل من 20 mA", function (h) { return h.el("A1").i <= 0.02; }], ["كل مقاومة تبدد أقل من 125 mW", function (h) { return h.el("R1").p < 0.125 && h.el("R2").p < 0.125; }]],
    measure: [{ id: "i", label: "قراءة الأميتر", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "v2", label: "جهد R2 (VΩ على الطرف العلوي)", units: U.V, def: 1, f: function (h) { return h.v([1, 2], [2, 2]); } }, { id: "v2r", label: "جهد R2 بعد عكس السلكين", units: U.V, def: 1, f: function (h) { return -h.v([1, 2], [2, 2]); } }],
    analyze: function (m) { var o = []; if (m.v2 != null && m.v2r != null) o.push(Math.abs(m.v2 + m.v2r) < 0.02 * Math.abs(m.v2) + 1e-3 ? "✓ القراءتان متساويتان مقدارًا ومتعاكستان إشارة: عكس المرجع يعكس الإشارة فقط." : "⚠ القراءتان يفترض أن تكونا متعاكستين تمامًا. تأكد أن السلكين على نفس النقطتين."); return o; } });

  D({ lesson: "c1-variables-3", chapter: "variables", ar: "اصطلاح الإشارة: من يعطي القدرة ومن يمتصها؟", en: "Passive Sign Convention: Who Delivers, Who Absorbs?", level: "مبتدئ",
    summary: "تشحن بطارية NiMH من مزود الجهد عبر مقاومة، وتحدد بالقياس واصطلاح الإشارة أي عنصر يعطي القدرة وأيها يمتصها.",
    idea: "<p>العنصر الأساسي المثالي له طرفان، وجهد وتيار. باصطلاح الإشارة السالبة: إذا دخل التيار المرجعي من طرف + المرجعي فالقدرة الممتصة <span class='ltr'>p = vi</span>، وإلا <span class='ltr'>p = −vi</span>. إذا جاءت p سالبة فالعنصر يعطي قدرة. البطارية التي تُشحن تمتص قدرة، والمزود الذي يشحنها يعطي، ومجموع القدرات صفر.</p>",
    specs: ["قناة من مزود الجهد ومقاومة تحديد وبطارية NiMH (4 خلايا ≈ 4.8 V).", "تيار الشحن أقل من 100 mA (شحن بطيء آمن).", "قدرة المقاومة أقل من ¼ W."],
    controls: [ctl("vs", "جهد المزود", [6, 7.5, 9], "V", 9), ctl("r", "مقاومة التحديد", [47, 68, 100, 150, 220], "Ω", 150), ctl("vb", "جهد البطارية", [2.4, 3.6, 4.8], "V", 4.8)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: v.vs, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: v.r, tag: "R" }], ["V", [1, 1], [2, 1], { value: v.vb, plus: "a", bat: true, tag: "B" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 0], vn: [1, 1] } }; },
    design: { prompt: "مزود " + L("9 V") + " يشحن بطارية " + L("4.8 V") + " عبر " + L("150 Ω") + ". التيار المرجعي يدور من + المزود إلى المقاومة ثم يدخل + البطارية.",
      steps: [
        q("تيار الشحن.", "i =", function (h) { return h.el("R").i; }, U.A, function (h) { return eq("i = (9 − 4.8) / 150 = " + si(h.el("R").i, "A")); }, { unitDefault: 1 }),
        q("القدرة الممتصة في المقاومة.", "p<sub>R</sub> =", function (h) { return h.el("R").p; }, U.W, function (h) { return eq("p<sub>R</sub> = i²R = " + si(h.el("R").p, "W")); }),
        q("القدرة الممتصة في البطارية (التيار يدخل من طرفها +).", "p<sub>B</sub> =", function (h) { return h.el("B").p; }, U.W, function (h) { return eq("p<sub>B</sub> = +4.8 × i = " + si(h.el("B").p, "W")) + " (موجبة: تمتص، أي تُشحن)"; }),
        q("القدرة الممتصة في المزود (التيار يخرج من طرفه +).", "p<sub>S</sub> =", function (h) { return h.el("Vs").p; }, U.W, function (h) { return eq("p<sub>S</sub> = −9 × i = " + si(h.el("Vs").p, "W")) + " (سالبة: يعطي قدرة)"; }),
        choice("مجموع القدرات الثلاث الممتصة:", [{ t: "صفر", correct: true }, { t: "يساوي قدرة المزود", type: "conceptual", why: "قدرة المزود سالبة وتلغي مجموع قدرتي المقاومة والبطارية." }, { t: "موجب دائمًا", type: "conceptual", why: "حفظ الطاقة: ما يعطيه المزود يمتصه الباقي تمامًا." }], "صفر: حفظ الطاقة في الدائرة.")
      ] },
    readings: [["تيار الشحن", function (h) { return si(h.el("R").i, "A"); }], ["p المقاومة", function (h) { return si(h.el("R").p, "W"); }], ["p البطارية", function (h) { return si(h.el("B").p, "W"); }], ["p المزود", function (h) { return si(h.el("Vs").p, "W"); }]],
    checks: [["البطارية تُشحن (تمتص قدرة)", function (h) { return h.el("B").p > 0; }], ["تيار الشحن أقل من 100 mA", function (h) { return h.el("R").i < 0.1; }], ["قدرة المقاومة أقل من 250 mW", function (h) { return h.el("R").p < 0.25; }]],
    measure: [{ id: "vR", label: "جهد المقاومة", units: U.V, def: 1, f: function (h) { return h.el("R").v; } }, { id: "vB", label: "جهد البطارية أثناء الشحن", units: U.V, def: 1, f: function (h) { return h.el("B").v; } }],
    analyze: function (m, v) { var o = []; if (m.vR != null) { var i = m.vR / v.r; o.push("من قياسك: " + L("i = " + si(i, "A")) + "، " + L("p<sub>R</sub> = " + si(m.vR * i, "W"))); if (m.vB != null) o.push(L("p<sub>B</sub> = " + si(m.vB * i, "W")) + " ممتصة، و " + L("p<sub>S</sub> = −" + si(v.vs * i, "W")) + ". المجموع ≈ " + L(si(m.vR * i + m.vB * i - v.vs * i, "W")) + "."); } return o; },
    safety: ["استخدم بطارية NiMH فقط. لا تشحن بطاريات الليثيوم أو القلوية بهذه الطريقة.", "افصل الشحن بعد التجربة."],
    causes: ["جهد البطارية الحقيقي يرتفع أثناء الشحن.", "للبطارية مقاومة داخلية."] });

  D({ lesson: "c1-variables-4", chapter: "variables", ar: "القدرة والطاقة: كم تستهلك لمبة؟", en: "Power and Energy of a Lamp", level: "مبتدئ",
    summary: "تقيس جهد لمبة وتيارها، فتحسب قدرتها والطاقة التي تستهلكها في ساعة، وتعرف كيف تتغير القدرة مع الجهد.",
    idea: "<p>القدرة <span class='ltr'>p = vi</span> هي معدل استهلاك الطاقة، والطاقة <span class='ltr'>w = ∫p dt</span>، أي <span class='ltr'>w = p·t</span> إذا كانت القدرة ثابتة. لمبة " + L("6 V / 0.5 W") + " نمثلها بمقاومة ثابتة " + L("R = V²/P = 72 Ω") + "، فإذا نزل الجهد للنصف تنزل القدرة للربع.</p>",
    specs: ["لمبة 6 V / 0.5 W على قناة من مزود الجهد.", "أميتر لوحة على التوالي وملتيميتر على اللمبة.", "لا تتجاوز قدرة اللمبة المقننة."],
    controls: [ctl("vs", "جهد المزود", [3, 4.5, 6], "V", 6), ctl("pr", "قدرة اللمبة المقننة", [0.3, 0.5, 1], "W", 0.5)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: v.vs, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["LAMP", [1, 1], [2, 1], { vr: 6, pr: v.pr, tag: "X1" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: "لمبة " + L("6 V / 0.5 W") + " (نموذجها مقاومة ثابتة V²/P) على مزود " + L("6 V") + ".",
      steps: [
        q("مقاومة اللمبة في النموذج.", "R =", function () { return 72; }, U.OHM, eq("R = 6² / 0.5 = 72 Ω")),
        q("تيار اللمبة.", "i =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i = 6 / 72 = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("الطاقة التي تستهلكها في ساعة واحدة.", "w =", function (h) { return h.el("X1").p * 3600; }, U.J, function (h) { return eq("w = p·t = 0.5 × 3600 = " + si(h.el("X1").p * 3600, "J")) + " = 0.5 Wh"; }),
        q("لو شغّلتها على 3 V، كم قدرتها؟", "p =", function () { return 9 / 72; }, U.W, eq("p = 3² / 72 = 0.125 W ← ربع القدرة"))
      ] },
    readings: [["التيار", function (h) { return si(h.el("A1").i, "A"); }], ["قدرة اللمبة", function (h) { return si(h.el("X1").p, "W"); }], ["الطاقة في ساعة", function (h) { return si(h.el("X1").p * 3600, "J"); }]],
    checks: [["اللمبة ضمن قدرتها المقننة", function (h, v) { return h.el("X1").p <= v.pr * 1.01; }], ["اللمبة تضيء (أكثر من 20% من قدرتها)", function (h, v) { return h.el("X1").p >= 0.2 * v.pr; }]],
    measure: [{ id: "v", label: "جهد اللمبة", units: U.V, def: 1, f: function (h) { return h.el("X1").v; } }, { id: "i", label: "تيار اللمبة", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }],
    analyze: function (m) { var o = []; if (m.v != null && m.i != null) { o.push("القدرة من قياسك " + L("p = vi = " + si(m.v * m.i, "W")) + " والطاقة في ساعة " + L(si(m.v * m.i * 3600, "J")) + "."); o.push("مقاومة الفتيل الحقيقية " + L(si(m.v / m.i, "Ω")) + ": الفتيل البارد مقاومته أقل، فتيار اللمبة لحظة التشغيل أكبر من تيارها وهي مضيئة."); } return o; },
    causes: ["مقاومة الفتيل تتغير مع حرارته (النموذج يفترضها ثابتة).", "مقاومة الأميتر الداخلية."] });

  /* ================= الفصل 2: عناصر الدائرة ================= */
  D({ lesson: "c1-elements-1", chapter: "elements", ar: "مصدر الجهد ومصدر التيار: مزود الجهد في CV و CC", en: "Voltage and Current Sources: the Supply in CV and CC", level: "مبتدئ",
    summary: "تستخدم قناة من مزود الجهد مصدرَ جهد وأخرى مصدرَ تيار، وتتأكد بالقياس أن الأول يثبّت الجهد والثاني يثبّت التيار مهما تغير الحمل.",
    idea: "<p>مصدر الجهد المثالي يثبت الجهد بين طرفيه ويعطي أي تيار يطلبه الحمل. مصدر التيار المثالي يثبت التيار ويأخذ جهده أي قيمة. مزود الجهد المختبري يعمل بالطريقتين: في CV يثبت الجهد، وإذا وصل التيار لحده ينتقل إلى CC ويثبت التيار.</p>",
    specs: ["CH1 مصدر جهد 5 V مع حمل R<sub>L1</sub>.", "CH2 مصدر تيار 10 mA (حد التيار 10 mA والجهد 30 V) مع حمل R<sub>L2</sub>.", "جهد CH2 لا يتجاوز 30 V (حد المزود)."],
    controls: [ctl("rl1", "R<sub>L1</sub>", e12(220, 4700), "Ω", 1000), ctl("rl2", "R<sub>L2</sub>", e12(100, 2700), "Ω", 1000)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "V1" }], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: v.rl1, tag: "RL1" }], ["W", [2, 0], [2, 1]],
      ["I", [1, 3], [2, 3], { value: 0.01, dir: "ba", tag: "I1" }], ["W", [1, 3], [1, 4]], ["R", [1, 4], [2, 4], { value: v.rl2, tag: "RL2" }], ["W", [2, 3], [2, 4]]], probes: { vp: [1, 4], vn: [2, 4] } }; },
    design: { prompt: "CH1 مصدر جهد " + L("5 V") + " على " + L("R<sub>L1</sub> = 1 kΩ") + ". CH2 مصدر تيار " + L("10 mA") + " على " + L("R<sub>L2</sub> = 1 kΩ") + ".",
      steps: [
        q("تيار R<sub>L1</sub>.", "i<sub>1</sub> =", function (h) { return h.el("RL1").i; }, U.A, function (h) { return eq("i = 5 / 1000 = " + si(h.el("RL1").i, "A")); }, { unitDefault: 1 }),
        choice("لو استبدلت R<sub>L1</sub> بـ 500 Ω، جهدها:", [{ t: "يبقى 5 V ويتضاعف التيار", correct: true }, { t: "ينخفض إلى 2.5 V", type: "conceptual", why: "مصدر الجهد يثبت جهده مهما كان الحمل؛ التيار هو الذي يتغير." }], "يبقى 5 V: هذا تعريف مصدر الجهد. التيار يصبح 10 mA."),
        q("جهد R<sub>L2</sub> (يحدده مصدر التيار).", "v<sub>2</sub> =", function (h) { return h.el("RL2").v; }, U.V, function (h) { return eq("v = 10 mA × 1000 = " + si(h.el("RL2").v, "V")); }, { unitDefault: 1 }),
        q("لو أصبحت R<sub>L2</sub> = 2.2 kΩ، كم جهد CH2؟", "v<sub>2</sub> =", function () { return 22; }, U.V, eq("v = 10 mA × 2200 = 22 V ← التيار ثابت والجهد هو الذي يتغير"), { unitDefault: 1 })
      ] },
    readings: [["جهد CH1 وتيارها", function (h) { return si(h.el("RL1").v, "V") + " · " + si(h.el("RL1").i, "A"); }], ["جهد CH2 وتيارها", function (h) { return si(h.el("RL2").v, "V") + " · " + si(h.el("RL2").i, "A"); }]],
    checks: [["CH2 داخل حدها: الجهد أقل من 30 V", function (h) { return h.el("RL2").v < 30; }], ["تيار CH1 أقل من 100 mA", function (h) { return h.el("RL1").i < 0.1; }]],
    measure: [{ id: "v1", label: "جهد R<sub>L1</sub>", units: U.V, def: 1, f: function (h) { return h.el("RL1").v; } }, { id: "v2", label: "جهد R<sub>L2</sub>", units: U.V, def: 1, f: function (h) { return h.el("RL2").v; } }],
    analyze: function (m, v) { var o = []; if (m.v2 != null) o.push("تيار CH2 من قياسك " + L("v<sub>2</sub>/R<sub>L2</sub> = " + si(m.v2 / v.rl2, "A")) + ". غيّر R<sub>L2</sub> وقس مرة أخرى: التيار يبقى 10 mA ما دام الجهد أقل من 30 V."); return o; },
    causes: ["دقة ضبط حد التيار في المزود.", "سماحية المقاومات."] });

  D({ lesson: "c1-elements-2", chapter: "elements", ar: "قانون أوم: منحنى الجهد والتيار لمقاومة", en: "Ohm's Law: the v–i Line of a Resistor", level: "مبتدئ",
    summary: "تغيّر جهد المزود وتقيس التيار، فتحصل على خط مستقيم ميله 1/R، وتتحقق من حد قدرة المقاومة.",
    idea: "<p>قانون أوم <span class='ltr'>v = iR</span>: الجهد يتناسب طرديًا مع التيار، فمنحنى i مقابل v خط مستقيم يمر بالأصل ميله <span class='ltr'>1/R</span>. القدرة <span class='ltr'>p = v²/R</span> تكبر مع مربع الجهد، فلا بد أن تبقى تحت تصنيف المقاومة (¼ W).</p>",
    specs: ["مقاومة على قناة من المزود مع أميتر لوحة.", "قس عند ثلاثة جهود على الأقل.", "القدرة أقل من 125 mW عند أعلى جهد."],
    controls: [ctl("r", "المقاومة", e12(220, 4700), "Ω", 470), ctl("vs", "جهد المزود", [1, 2, 3, 5, 7.5], "V", 5)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: v.vs, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [2, 1], { value: v.r, tag: "R" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: "مقاومة " + L("470 Ω") + " على مزود " + L("5 V") + ".",
      steps: [
        q("التيار.", "i =", function (h) { return h.el("R").i; }, U.A, function (h) { return eq("i = 5 / 470 = " + si(h.el("R").i, "A")); }, { unitDefault: 1 }),
        q("ميل خط i مقابل v.", "1/R =", function () { return 1 / 470; }, [{ l: "mS", f: 1e-3 }, { l: "S", f: 1 }], eq("1/470 = 2.128 mS")),
        q("أعلى جهد يمكن وضعه حتى لا تتجاوز القدرة 125 mW.", "v<sub>max</sub> =", function () { return Math.sqrt(0.125 * 470); }, U.V, eq("v = √(0.125 × 470) = " + si(Math.sqrt(0.125 * 470), "V")), { unitDefault: 1 })
      ] },
    readings: [["التيار", function (h) { return si(h.el("R").i, "A"); }], ["القدرة", function (h) { return si(h.el("R").p, "W"); }]],
    checks: [["القدرة أقل من 125 mW", function (h) { return h.el("R").p < 0.125; }]],
    measure: [{ id: "v", label: "جهد المقاومة", units: U.V, def: 1, f: function (h) { return h.el("R").v; } }, { id: "i", label: "التيار", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }],
    analyze: function (m, v) { var o = []; if (m.v != null && m.i) { var r = m.v / m.i; o.push("المقاومة من قياسك " + L("v/i = " + si(r, "Ω")) + (Math.abs(r - v.r) / v.r < 0.06 ? " ✓ ضمن سماحية ±5%." : " ⚠ خارج السماحية: تأكد من ألوان المقاومة.")); o.push("كرر القياس على جهدين آخرين وارسم النقاط: إذا وقعت على خط مستقيم يمر بالأصل فالمقاومة خطية."); } return o; } });

  D({ lesson: "c1-elements-3", chapter: "elements", ar: "التحقق من قانوني كيرشوف", en: "Verifying Kirchhoff's Laws", level: "مبتدئ",
    summary: "تبني دائرة توالي-توازي بثلاثة أميترات، وتتحقق بالأرقام أن التيار الداخل للعقدة يساوي الخارج وأن مجموع الجهود حول الحلقة صفر.",
    idea: "<p>KCL: مجموع التيارات الخارجة من أي عقدة صفر (الشحنة لا تتجمع). KVL: مجموع الجهود حول أي حلقة مغلقة صفر (الطاقة محفوظة). في المشروع ثلاثة أميترات حول العقدة الوسطى، وملتيميتر تقيس به جهود الحلقة.</p>",
    specs: ["مزود 12 V، R1 على التوالي ثم فرعان R2 و R3 على التوازي.", "أميتر في كل فرع."],
    controls: [ctl("r1", "R1", e12(470, 4700), "Ω", 1000), ctl("r2", "R2", e12(470, 4700), "Ω", 2200), ctl("r3", "R3", e12(470, 4700), "Ω", 3300)],
    circuit: function (v) { return { ground: [3, 0], edges: [["V", [1, 0], [2, 0], { value: 12, plus: "a", tag: "Vs" }], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: v.r1, tag: "R1" }], ["AM", [1, 2], [2, 2], { tag: "A2" }], ["R", [2, 2], [3, 2], { value: v.r2, tag: "R2" }], ["W", [1, 2], [1, 3]], ["AM", [1, 3], [2, 3], { tag: "A3" }], ["R", [2, 3], [3, 3], { value: v.r3, tag: "R3" }], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]]], probes: { vp: [1, 2], vn: [3, 0] } }; },
    design: { prompt: "مزود " + L("12 V") + "، " + L("R1 = 1 kΩ") + " على التوالي مع " + L("R2 = 2.2 kΩ ∥ R3 = 3.3 kΩ") + ".",
      steps: [
        q("التيار الكلي (أميتر A1).", "i<sub>1</sub> =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i<sub>1</sub> = 12 / (1000 + 2200∥3300) = 12 / 2320 = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("جهد العقدة الوسطى.", "v<sub>N</sub> =", function (h) { return h.v([1, 2], [3, 0]); }, U.V, function (h) { return eq("v<sub>N</sub> = i<sub>1</sub> × 1320 = " + si(h.v([1, 2], [3, 0]), "V")); }, { unitDefault: 1 }),
        q("تيار R2 (أميتر A2).", "i<sub>2</sub> =", function (h) { return h.el("A2").i; }, U.A, function (h) { return eq("i<sub>2</sub> = v<sub>N</sub> / 2200 = " + si(h.el("A2").i, "A")); }, { unitDefault: 1 }),
        q("تيار R3 (أميتر A3).", "i<sub>3</sub> =", function (h) { return h.el("A3").i; }, U.A, function (h) { return eq("i<sub>3</sub> = v<sub>N</sub> / 3300 = " + si(h.el("A3").i, "A")) + " ← و " + eq("i<sub>2</sub> + i<sub>3</sub> = i<sub>1</sub>"); }, { unitDefault: 1 })
      ] },
    readings: [["A1", function (h) { return si(h.el("A1").i, "A"); }], ["A2 + A3", function (h) { return si(h.el("A2").i + h.el("A3").i, "A"); }], ["v(R1) + v(R2)", function (h) { return si(h.el("R1").v + h.el("R2").v, "V"); }]],
    checks: [["KCL: A1 = A2 + A3", function (h) { return Math.abs(h.el("A1").i - h.el("A2").i - h.el("A3").i) < 1e-4 * h.el("A1").i; }], ["KVL: v(R1) + v(R2) = 12 V", function (h) { return Math.abs(h.el("R1").v + h.el("R2").v - 12) < 1e-6; }], ["كل التيارات أقل من 20 mA", function (h) { return h.el("A1").i < 0.02; }]],
    measure: [{ id: "i1", label: "A1", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "i2", label: "A2", units: U.A, def: 1, f: function (h) { return h.el("A2").i; } }, { id: "i3", label: "A3", units: U.A, def: 1, f: function (h) { return h.el("A3").i; } }, { id: "vN", label: "جهد العقدة الوسطى", units: U.V, def: 1, f: function (h) { return h.v([1, 2], [3, 0]); } }],
    analyze: function (m) { var o = []; if (m.i1 != null && m.i2 != null && m.i3 != null) o.push("KCL من قياسك: " + L("A1 − (A2 + A3) = " + si(m.i1 - m.i2 - m.i3, "A")) + ". الفرق الصغير من دقة الأجهزة، والقانون نفسه دقيق."); return o; } });

  D({ lesson: "c1-elements-4", chapter: "elements", ar: "مضخم بنموذج الترانزستور (مصدر تيار تابع)", en: "Transistor-Model Amplifier (Dependent Current Source)", level: "متوسط",
    summary: "تبني نموذج الكتاب للترانزستور: تيار القاعدة يتحكم بتيار المجمّع i<sub>C</sub> = βi<sub>B</sub>، وتحسب نقطة التشغيل وتقيسها.",
    idea: "<p>المصدر التابع قيمته تعتمد على جهد أو تيار في مكان آخر من الدائرة. نموذج الترانزستور في نيلسون: بين القاعدة والباعث جهد ثابت " + L("V<sub>BE</sub> = 0.7 V") + "، وبين المجمّع والباعث مصدر تيار " + L("i<sub>C</sub> = β i<sub>B</sub>") + ". نحل دائرة القاعدة أولًا لنجد i<sub>B</sub>، ثم دائرة المجمّع.</p>",
    specs: ["دائرة القاعدة: V<sub>BB</sub> = 5 V و R<sub>B</sub> و V<sub>BE</sub> = 0.7 V (قناة من المزود).", "المصدر التابع CCCS بـ β = 100 تتحكم به R<sub>B</sub>، و R<sub>C</sub> من V<sub>CC</sub> = 12 V.", "الترانزستور في المنطقة الفعالة: v<sub>CE</sub> بين 1 و 11 V."],
    controls: [ctl("rb", "R<sub>B</sub>", [47000, 68000, 100000, 150000, 220000], "Ω", 100000), ctl("rc", "R<sub>C</sub>", e12(470, 2200), "Ω", 1000), ctl("beta", "β", [50, 100, 150, 200], "", 100, ["50", "100", "150", "200"])],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "VBB" }], ["R", [1, 0], [1, 1], { value: v.rb, tag: "RB" }], ["V", [1, 1], [2, 1], { value: 0.7, plus: "a", tag: "VBE" }], ["DEP", [1, 2], [2, 2], { dk: "CCCS", gain: v.beta, ctrl: "RB", dir: "ab", tag: "Q" }], ["R", [1, 2], [1, 3], { value: v.rc, tag: "RC" }], ["V", [1, 3], [2, 3], { value: 12, plus: "a", tag: "VCC" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], probes: { vp: [1, 2], vn: [2, 2] } }; },
    design: { prompt: L("V<sub>BB</sub> = 5 V") + "، " + L("R<sub>B</sub> = 100 kΩ") + "، " + L("V<sub>BE</sub> = 0.7 V") + "، " + L("β = 100") + "، " + L("R<sub>C</sub> = 1 kΩ") + "، " + L("V<sub>CC</sub> = 12 V") + ".",
      steps: [
        q("تيار القاعدة.", "i<sub>B</sub> =", function (h) { return h.el("RB").i; }, U.A, function (h) { return eq("i<sub>B</sub> = (5 − 0.7) / 100 kΩ = " + si(h.el("RB").i, "A")); }),
        q("تيار المجمّع.", "i<sub>C</sub> =", function (h) { return h.el("RB").i * 100; }, U.A, function (h) { return eq("i<sub>C</sub> = 100 × i<sub>B</sub> = " + si(h.el("RB").i * 100, "A")); }, { unitDefault: 1 }),
        q("جهد المجمّع-الباعث.", "v<sub>CE</sub> =", function (h) { return h.v([1, 2], [2, 2]); }, U.V, function (h) { return eq("v<sub>CE</sub> = 12 − i<sub>C</sub> × 1000 = " + si(h.v([1, 2], [2, 2]), "V")); }, { unitDefault: 1 }),
        choice("لو نصّفت R<sub>B</sub> إلى 50 kΩ:", [{ t: "يتضاعف i<sub>C</sub> فينخفض v<sub>CE</sub>", correct: true }, { t: "لا يتغير i<sub>C</sub> لأن R<sub>C</sub> لم تتغير", type: "conceptual", why: "i<sub>C</sub> يتبع i<sub>B</sub>: المصدر التابع لا تحدده R<sub>C</sub>." }], "i<sub>B</sub> يتضاعف، و i<sub>C</sub> = βi<sub>B</sub> يتضاعف، فيزيد هبوط R<sub>C</sub> وينخفض v<sub>CE</sub>.")
      ] },
    readings: [["i<sub>B</sub>", function (h) { return si(h.el("RB").i, "A"); }], ["i<sub>C</sub>", function (h) { return si(h.el("Q").i, "A"); }], ["v<sub>CE</sub>", function (h) { return si(h.v([1, 2], [2, 2]), "V"); }]],
    checks: [["المنطقة الفعالة: 1 V ≤ v<sub>CE</sub> ≤ 11 V", function (h) { var x = h.v([1, 2], [2, 2]); return x >= 1 && x <= 11; }]],
    measure: [{ id: "vrb", label: "جهد R<sub>B</sub>", units: U.V, def: 1, f: function (h) { return h.el("RB").v; } }, { id: "vce", label: "v<sub>CE</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 2], [2, 2]); } }],
    analyze: function (m, v) { var o = []; if (m.vrb != null && m.vce != null) { var ib = m.vrb / v.rb, ic = (12 - m.vce) / v.rc; o.push("من قياسك: " + L("i<sub>B</sub> = " + si(ib, "A")) + "، " + L("i<sub>C</sub> = " + si(ic, "A")) + "، فـ " + L("β = i<sub>C</sub>/i<sub>B</sub> = " + n(ic / ib)) + "."); } return o; },
    causes: ["الوحدة نموذج مثالي. مع ترانزستور حقيقي (مثل 2N2222) تختلف β من قطعة لأخرى وتتغير مع الحرارة، و V<sub>BE</sub> ليست 0.7 V بالضبط."],
    safety: ["إذا بنيتها بترانزستور حقيقي: تأكد من ترتيب أرجله (E-B-C) من ورقة البيانات."] });

  /* ================= الفصل 3: دوائر المقاومات البسيطة ================= */
  D({ lesson: "c1-resistive-1", chapter: "resistive", ar: "مقاومات على التوالي: تحديد التيار وتوزيع الجهد", en: "Resistors in Series", level: "مبتدئ",
    summary: "ثلاث مقاومات على التوالي من مزود 9 V: تحسب المقاومة المكافئة والتيار، وتتأكد أن الجهد يتوزع بنسبة المقاومات.",
    idea: "<p>المقاومات على التوالي يمر فيها التيار نفسه، فمقاومتها المكافئة مجموعها " + L("R<sub>eq</sub> = R1 + R2 + R3") + "، وجهد كل مقاومة يتناسب مع قيمتها: الأكبر تأخذ جهدًا أكبر.</p>",
    specs: ["مزود 9 V وثلاث مقاومات على التوالي وأميتر لوحة.", "التيار أقل من 10 mA.", "قدرة كل مقاومة أقل من 125 mW."],
    controls: [ctl("r1", "R1", e12(470, 10000), "Ω", 1000), ctl("r2", "R2", e12(470, 10000), "Ω", 2200), ctl("r3", "R3", e12(470, 10000), "Ω", 4700)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 9, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: v.r1, tag: "R1" }], ["R", [1, 2], [1, 3], { value: v.r2, tag: "R2" }], ["R", [1, 3], [2, 3], { value: v.r3, tag: "R3" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], probes: { vp: [1, 3], vn: [2, 3] } }; },
    design: { prompt: "مزود " + L("9 V") + " و " + L("R1 = 1 kΩ") + " و " + L("R2 = 2.2 kΩ") + " و " + L("R3 = 4.7 kΩ") + " على التوالي.",
      steps: [
        q("المقاومة المكافئة.", "R<sub>eq</sub> =", function (h, v) { return v.r1 + v.r2 + v.r3; }, U.OHM, eq("R<sub>eq</sub> = 1000 + 2200 + 4700 = 7.9 kΩ"), { unitDefault: 1 }),
        q("التيار.", "i =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i = 9 / 7900 = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("جهد R3.", "v<sub>3</sub> =", function (h) { return h.el("R3").v; }, U.V, function (h) { return eq("v<sub>3</sub> = 9 × 4700/7900 = " + si(h.el("R3").v, "V")); }, { unitDefault: 1 }),
        choice("أي مقاومة تأخذ أكبر جهد؟", [{ t: "R3 (الأكبر قيمة)", correct: true }, { t: "R1 (الأقرب للمصدر)", type: "conceptual", why: "الترتيب لا يهم في التوالي: التيار واحد، والجهد = iR." }], "R3: التيار واحد في الجميع، فالجهد يتناسب مع R.")
      ] },
    readings: [["التيار", function (h) { return si(h.el("A1").i, "A"); }], ["v1 · v2 · v3", function (h) { return si(h.el("R1").v, "V") + " · " + si(h.el("R2").v, "V") + " · " + si(h.el("R3").v, "V"); }]],
    checks: [["التيار أقل من 10 mA", function (h) { return h.el("A1").i < 0.01; }], ["قدرة كل مقاومة أقل من 125 mW", function (h) { return ["R1", "R2", "R3"].every(function (t) { return h.el(t).p < 0.125; }); }]],
    measure: [{ id: "i", label: "التيار", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "v1", label: "جهد R1", units: U.V, def: 1, f: function (h) { return h.el("R1").v; } }, { id: "v2", label: "جهد R2", units: U.V, def: 1, f: function (h) { return h.el("R2").v; } }, { id: "v3", label: "جهد R3", units: U.V, def: 1, f: function (h) { return h.el("R3").v; } }],
    analyze: function (m) { var o = []; if (m.v1 != null && m.v2 != null && m.v3 != null) o.push("مجموع جهودك " + L(si(m.v1 + m.v2 + m.v3, "V")) + " ويفترض أن يساوي جهد المزود (KVL)."); return o; } });

  D({ lesson: "c1-resistive-2", chapter: "resistive", ar: "أحمال على التوازي: كل فرع يأخذ تيارًا", en: "Loads in Parallel", level: "مبتدئ",
    summary: "ثلاث مقاومات على التوازي مثل أجهزة البيت على نفس الخط: الجهد واحد، وكل فرع جديد يزيد التيار الكلي ويقلل المقاومة المكافئة.",
    idea: "<p>العناصر على التوازي لها نفس الجهد، والتيار الكلي مجموع تيارات الفروع. لذلك " + L("1/R<sub>eq</sub> = 1/R1 + 1/R2 + 1/R3") + "، والمقاومة المكافئة أصغر من أصغر مقاومة.</p>",
    specs: ["مزود 5 V وثلاثة فروع على التوازي وأميتر على الخط.", "التيار الكلي أقل من 30 mA."],
    controls: [ctl("r1", "R1", e12(470, 10000), "Ω", 1000), ctl("r2", "R2", e12(470, 10000), "Ω", 2200), ctl("r3", "R3", e12(470, 10000), "Ω", 4700)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [2, 1], { value: v.r1, tag: "R1" }], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: v.r2, tag: "R2" }], ["W", [1, 2], [1, 3]], ["R", [1, 3], [2, 3], { value: v.r3, tag: "R3" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], probes: { vp: [1, 3], vn: [2, 3] } }; },
    design: { prompt: "مزود " + L("5 V") + " و " + L("1 kΩ ∥ 2.2 kΩ ∥ 4.7 kΩ") + ".",
      steps: [
        q("المقاومة المكافئة.", "R<sub>eq</sub> =", function (h, v) { return 1 / (1 / v.r1 + 1 / v.r2 + 1 / v.r3); }, U.OHM, function (h, v) { return eq("R<sub>eq</sub> = 1 / (1/1000 + 1/2200 + 1/4700) = " + si(1 / (1 / v.r1 + 1 / v.r2 + 1 / v.r3), "Ω")); }),
        q("التيار الكلي.", "i =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i = 5 / R<sub>eq</sub> = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("تيار R2.", "i<sub>2</sub> =", function (h) { return h.el("R2").i; }, U.A, function (h) { return eq("i<sub>2</sub> = 5 / 2200 = " + si(h.el("R2").i, "A")); }, { unitDefault: 1 }),
        choice("لو أضفت فرعًا رابعًا 1 kΩ:", [{ t: "يزيد التيار الكلي وتقل R<sub>eq</sub>، وتيارات الفروع القديمة لا تتغير", correct: true }, { t: "يقل التيار في الفروع القديمة", type: "conceptual", why: "جهد الفروع يبقى 5 V (المزود مثالي)، فتياراتها لا تتغير." }], "مسار جديد للتيار: R<sub>eq</sub> تقل والتيار الكلي يزيد.")
      ] },
    readings: [["التيار الكلي", function (h) { return si(h.el("A1").i, "A"); }], ["i1 · i2 · i3", function (h) { return si(h.el("R1").i, "A") + " · " + si(h.el("R2").i, "A") + " · " + si(h.el("R3").i, "A"); }]],
    checks: [["التيار الكلي أقل من 30 mA", function (h) { return h.el("A1").i < 0.03; }], ["قدرة كل مقاومة أقل من 125 mW", function (h) { return ["R1", "R2", "R3"].every(function (t) { return h.el(t).p < 0.125; }); }]],
    measure: [{ id: "i", label: "التيار الكلي", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "v", label: "جهد الفروع", units: U.V, def: 1, f: function (h) { return h.el("R3").v; } }],
    analyze: function (m) { var o = []; if (m.i != null && m.v != null) o.push("المقاومة المكافئة من قياسك " + L("v/i = " + si(m.v / m.i, "Ω")) + ". افصل فرعًا وقس مرة أخرى: التيار الكلي يقل بقدر تيار ذلك الفرع."); return o; } });

  D({ lesson: "c1-resistive-3", chapter: "resistive", ar: "مقسّم جهد: مرجع 3.3 V من 5 V وتأثير الحمل", en: "A 3.3 V Reference from 5 V (Voltage Divider)", level: "مبتدئ",
    summary: "تصمم مقسّم جهد يعطي حوالي 3.3 V من 5 V، ثم تتحقق كيف ينخفض الخرج عند توصيل حمل، ومتى يبقى التأثير صغيرًا.",
    idea: "<p>مقسّم الجهد: " + L("v<sub>out</sub> = V<sub>s</sub> · R2/(R1 + R2)") + " بدون حمل. الحمل R<sub>L</sub> يصبح على التوازي مع R2 فينخفض الخرج. القاعدة العملية: R<sub>L</sub> أكبر من R2 بعشر مرات على الأقل. ومقسّم التيار هو الوجه الآخر: التيار يتوزع على R2 و R<sub>L</sub> بعكس نسبة مقاومتيهما.</p>",
    specs: ["الخرج تحت الحمل بين 3.135 و 3.465 V (3.3 V ± 5%).", "تيار المقسّم من المزود أقل من 2 mA."],
    controls: [ctl("r1", "R1", e12(1000, 22000), "Ω", 1800), ctl("r2", "R2", e12(1000, 22000), "Ω", 3300), ctl("rl", "الحمل R<sub>L</sub>", [1000, 4700, 10000, 47000, 100000, 1000000], "Ω", 100000)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: v.r1, tag: "R1" }], ["R", [1, 1], [2, 1], { value: v.r2, tag: "R2" }], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: v.rl, tag: "RL" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: "من " + L("5 V") + " بـ " + L("R1 = 1.8 kΩ") + " و " + L("R2 = 3.3 kΩ") + "، والحمل " + L("100 kΩ") + ".",
      steps: [
        q("الخرج بدون حمل.", "v<sub>out</sub> =", function (h, v) { return 5 * v.r2 / (v.r1 + v.r2); }, U.V, eq("v = 5 × 3300/5100 = " + si(5 * 3300 / 5100, "V")), { unitDefault: 1 }),
        q("الخرج مع الحمل 100 kΩ.", "v<sub>out</sub> =", function (h) { return h.v([1, 1], [2, 1]); }, U.V, function (h) { return eq("R2∥R<sub>L</sub> = 3194.6 Ω ← v = 5 × 3194.6/(1800 + 3194.6) = " + si(h.v([1, 1], [2, 1]), "V")); }, { unitDefault: 1 }),
        q("تيار الحمل كنسبة من تيار R1 (مقسّم تيار بين R2 و R<sub>L</sub>).", "i<sub>L</sub>/i<sub>1</sub> =", function (h) { return h.el("RL").i / h.el("R1").i; }, U.NONE, function (h) { return eq("R2/(R2 + R<sub>L</sub>) = 3300/103300 = " + n(h.el("RL").i / h.el("R1").i)); }),
        choice("لو كان الحمل 1 kΩ:", [{ t: "ينهار الخرج لأن R<sub>L</sub> أصغر من R2", correct: true }, { t: "يبقى الخرج 3.3 V", type: "conceptual", why: "R<sub>L</sub> على التوازي مع R2 تخفض المقاومة السفلية بشدة." }], "R2∥1k = 767 Ω فينخفض الخرج إلى حوالي 1.5 V.")
      ] },
    readings: [["الخرج تحت الحمل", function (h) { return si(h.v([1, 1], [2, 1]), "V"); }], ["تيار المزود", function (h) { return si(h.el("R1").i, "A"); }], ["تيار الحمل", function (h) { return si(h.el("RL").i, "A"); }]],
    checks: [["الخرج تحت الحمل 3.3 V ± 5%", function (h) { var x = h.v([1, 1], [2, 1]); return x >= 3.135 && x <= 3.465; }], ["تيار المقسّم أقل من 2 mA", function (h) { return h.el("R1").i < 0.002; }]],
    measure: [{ id: "vl", label: "الخرج مع الحمل", units: U.V, def: 1, f: function (h) { return h.v([1, 1], [2, 1]); } }, { id: "vo", label: "الخرج بعد فصل الحمل", units: U.V, def: 1, f: function (h, v) { return 5 * v.r2 / (v.r1 + v.r2) * 1e7 / (1e7 + v.r1 * v.r2 / (v.r1 + v.r2)); } }],
    analyze: function (m) { var o = []; if (m.vl != null && m.vo != null) o.push("الحمل خفّض الخرج بـ " + L(si(m.vo - m.vl, "V")) + " (" + n(100 * (m.vo - m.vl) / m.vo) + "%)."); return o; },
    causes: ["الملتيميتر نفسه حمل بمقاومة 10 MΩ.", "سماحية المقاومتين ±5%."] });

  D({ lesson: "c1-resistive-4", chapter: "resistive", ar: "مقسّم التيار: توزيع تيار ثابت على فرعين", en: "Current Division", level: "مبتدئ",
    summary: "تحقن تيارًا ثابتًا من مزود الجهد في وضع CC في فرعين على التوازي، وتتنبأ بتيار كل فرع بقاعدة مقسّم التيار.",
    idea: "<p>التيار الداخل لمقاومتين على التوازي يتوزع بعكس نسبتهما: " + L("i<sub>1</sub> = i · R2/(R1 + R2)") + ". الفرع الأصغر مقاومة يأخذ التيار الأكبر. وقسمة الجهد في التوالي هي الصورة المقابلة: " + L("v<sub>1</sub> = v · R1/(R1 + R2)") + ".</p>",
    specs: ["CH1 لمزود الجهد مصدر تيار (CC) بقيمة 10 mA.", "فرعان على التوازي في كل منهما أميتر لوحة.", "جهد المزود أقل من 30 V."],
    controls: [ctl("i", "تيار المصدر", [0.005, 0.01, 0.015], "A", 0.01), ctl("r1", "R1", e12(470, 4700), "Ω", 1000), ctl("r2", "R2", e12(470, 4700), "Ω", 2200)],
    circuit: function (v) { return { ground: [3, 0], edges: [["I", [1, 0], [2, 0], { value: v.i, dir: "ba", tag: "Is" }], ["W", [2, 0], [3, 0]], ["W", [1, 0], [1, 1]], ["AM", [1, 1], [2, 1], { tag: "A1" }], ["R", [2, 1], [3, 1], { value: v.r1, tag: "R1" }], ["W", [1, 1], [1, 2]], ["AM", [1, 2], [2, 2], { tag: "A2" }], ["R", [2, 2], [3, 2], { value: v.r2, tag: "R2" }], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]]], probes: { vp: [1, 1], vn: [3, 0] } }; },
    design: { prompt: "مصدر تيار " + L("10 mA") + " يغذي " + L("R1 = 1 kΩ") + " و " + L("R2 = 2.2 kΩ") + " على التوازي.",
      steps: [
        q("تيار R1.", "i<sub>1</sub> =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i<sub>1</sub> = 10 mA × 2200/3200 = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("تيار R2.", "i<sub>2</sub> =", function (h) { return h.el("A2").i; }, U.A, function (h) { return eq("i<sub>2</sub> = 10 mA × 1000/3200 = " + si(h.el("A2").i, "A")); }, { unitDefault: 1 }),
        q("جهد المزود (يأخذ ما يلزم ليدفع 10 mA).", "v =", function (h) { return h.v([1, 1], [3, 0]); }, U.V, function (h) { return eq("v = 10 mA × (1000∥2200) = " + si(h.v([1, 1], [3, 0]), "V")); }, { unitDefault: 1 })
      ] },
    readings: [["i1 · i2", function (h) { return si(h.el("A1").i, "A") + " · " + si(h.el("A2").i, "A"); }], ["جهد المزود", function (h) { return si(h.v([1, 1], [3, 0]), "V"); }]],
    checks: [["جهد المزود أقل من 30 V", function (h) { return h.v([1, 1], [3, 0]) < 30; }], ["قدرة كل مقاومة أقل من 125 mW", function (h) { return h.el("R1").p < 0.125 && h.el("R2").p < 0.125; }]],
    measure: [{ id: "i1", label: "A1", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "i2", label: "A2", units: U.A, def: 1, f: function (h) { return h.el("A2").i; } }],
    analyze: function (m, v) { var o = []; if (m.i1 != null && m.i2 != null) o.push("نسبة تياريك " + L("i<sub>1</sub>/i<sub>2</sub> = " + n(m.i1 / m.i2)) + " والمتوقع " + L("R2/R1 = " + n(v.r2 / v.r1)) + "."); return o; } });

  D({ lesson: "c1-resistive-5", chapter: "resistive", ar: "جسر غير متزن: تحويل دلتا إلى واي", en: "An Unbalanced Bridge: Delta-to-Wye", level: "متوسط",
    summary: "خمس مقاومات في جسر لا تُبسَّط بالتوالي والتوازي. تحوّل المثلث العلوي إلى نجمة لتحسب المقاومة المكافئة، ثم تقيسها بالأوميتر والدائرة مفصولة.",
    idea: "<p>بعض الشبكات ليس فيها مقاومات على التوالي أو التوازي. تحويل Δ→Y يستبدل ثلاث مقاومات بين ثلاث عقد بنجمة مكافئة: " + L("R<sub>a</sub> = R<sub>b</sub>R<sub>c</sub>/(R<sub>a</sub>+R<sub>b</sub>+R<sub>c</sub>)") + " لكل ذراع، فتصبح الشبكة توالي وتوازي.</p>",
    specs: ["جسر: R1 و R3 من الأعلى، R2 و R4 للأسفل، و R5 بين منتصفيه.", "مزود 5 V وأميتر على الخط.", "قياس R<sub>eq</sub> بالأوميتر بعد فصل المزود."],
    controls: [ctl("r4", "R4", e12(470, 4700), "Ω", 1000), ctl("r5", "R5 (الذراع الوسطى)", e12(470, 4700), "Ω", 1000)],
    circuit: function (v) { return { ground: [3, 0], edges: [["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "Vs" }], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [2, 1], { value: 1000, tag: "R1" }], ["R", [2, 1], [3, 1], { value: 2200, tag: "R2" }], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: 2200, tag: "R3" }], ["R", [2, 2], [3, 2], { value: v.r4, tag: "R4" }], ["R", [2, 1], [2, 2], { value: v.r5, tag: "R5" }], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]]] }; },
    design: { prompt: L("R1 = 1 kΩ") + "، " + L("R2 = 2.2 kΩ") + "، " + L("R3 = 2.2 kΩ") + "، " + L("R4 = 1 kΩ") + "، " + L("R5 = 1 kΩ") + ". المثلث العلوي: R1 و R3 و R5.",
      steps: [
        q("ذراع النجمة عند العقدة العلوية (بين R1 و R3).", "R<sub>a</sub> =", function () { return 1000 * 2200 / 4200; }, U.OHM, eq("R<sub>a</sub> = (1000 × 2200)/(1000 + 2200 + 1000) = 523.8 Ω")),
        q("المقاومة المكافئة بين طرفي المزود.", "R<sub>eq</sub> =", function (h) { return 5 / h.el("A1").i; }, U.OHM, function (h) { return "النجمة: 523.8 و 238.1 و 523.8 Ω ← " + eq("R<sub>eq</sub> = 523.8 + (238.1 + 2200)∥(523.8 + 1000) = " + si(5 / h.el("A1").i, "Ω")); }, { unitDefault: 1, tol: 0.01 }),
        q("التيار من المزود.", "i =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i = 5 / R<sub>eq</sub> = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        choice("متى يصبح تيار R5 صفرًا؟", [{ t: "عندما R1/R2 = R3/R4 (الجسر متزن)", correct: true }, { t: "عندما R5 = 0", type: "conceptual", why: "R5 = 0 تقصر العقدتين، وغالبًا يمر فيها تيار." }], "الجسر يتزن عندما R1/R2 = R3/R4، فتتساوى جهود طرفي R5.")
      ] },
    readings: [["R<sub>eq</sub>", function (h) { return si(5 / h.el("A1").i, "Ω"); }], ["تيار R5", function (h) { return si(h.el("R5").i, "A"); }]],
    checks: [["التيار من المزود أقل من 20 mA", function (h) { return h.el("A1").i < 0.02; }]],
    measure: [{ id: "req", label: "R<sub>eq</sub> بالأوميتر (المزود مفصول)", units: U.OHM, def: 1, f: function (h) { return 5 / h.el("A1").i; } }, { id: "i", label: "تيار المزود", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }],
    safety: ["قس المقاومة والمزود مفصول وسلكاه خارج اللوحة، وإلا تكون قراءة الأوميتر بلا معنى."] });

  /* ================= الفصل 4: طرق تحليل الدوائر ================= */
  var NN = function (v) { return [["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: v.ra, tag: "Ra" }], ["R", [1, 1], [2, 1], { value: v.rb, tag: "Rb" }], ["R", [1, 1], [1, 2], { value: v.rc, tag: "Rc" }], ["R", [1, 2], [2, 2], { value: v.rd, tag: "Rd" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]]; };
  var NNc = [ctl("ra", "R<sub>a</sub>", e12(470, 4700), "Ω", 1000), ctl("rb", "R<sub>b</sub>", e12(470, 4700), "Ω", 2200), ctl("rc", "R<sub>c</sub>", e12(470, 4700), "Ω", 1000), ctl("rd", "R<sub>d</sub>", e12(470, 4700), "Ω", 1000)];
  D({ lesson: "c1-techniques-1", chapter: "techniques", ar: "قياس جهود العقد لشبكة مقاومات", en: "Node Voltages of a Resistor Network", level: "متوسط",
    summary: "تختار عقدة مرجعية (الخط الأزرق)، تكتب معادلات KCL لعقدتين، وتقيس جهد كل عقدة بالملتيميتر وسلك COM على المرجع.",
    idea: "<p>في طريقة جهود العقد نختار عقدة مرجعية (0 V)، ونكتب KCL لكل عقدة أساسية أخرى بدلالة جهود العقد: التيار في مقاومة بين عقدتين = فرق جهديهما / R. عدد المعادلات = عدد العقد الأساسية − 1.</p>",
    specs: ["مزود 10 V وأربع مقاومات تكوّن عقدتين أساسيتين v<sub>1</sub> و v<sub>2</sub>.", "القياس بالملتيميتر وسلك COM على الخط الأزرق (المرجع)."],
    controls: NNc,
    circuit: function (v) { return { edges: NN(v), probes: { vp: [1, 1], vn: [2, 0] } }; },
    design: { prompt: "مزود " + L("10 V") + "، " + L("R<sub>a</sub> = 1 kΩ") + " من المزود إلى العقدة 1، " + L("R<sub>b</sub> = 2.2 kΩ") + " من العقدة 1 للمرجع، " + L("R<sub>c</sub> = 1 kΩ") + " بين العقدتين، " + L("R<sub>d</sub> = 1 kΩ") + " من العقدة 2 للمرجع.",
      steps: [
        q("جهد العقدة 1.", "v<sub>1</sub> =", function (h) { return h.v([1, 1]); }, U.V, function (h) { return eq("(v<sub>1</sub> − 10)/1k + v<sub>1</sub>/2.2k + (v<sub>1</sub> − v<sub>2</sub>)/1k = 0") + "، " + eq("(v<sub>2</sub> − v<sub>1</sub>)/1k + v<sub>2</sub>/1k = 0") + " ← " + eq("v<sub>1</sub> = " + si(h.v([1, 1]), "V")); }, { unitDefault: 1 }),
        q("جهد العقدة 2.", "v<sub>2</sub> =", function (h) { return h.v([1, 2]); }, U.V, function (h) { return eq("v<sub>2</sub> = v<sub>1</sub>/2 = " + si(h.v([1, 2]), "V")); }, { unitDefault: 1 }),
        q("التيار في R<sub>c</sub> من العقدة 1 إلى 2.", "i<sub>c</sub> =", function (h) { return h.el("Rc").i; }, U.A, function (h) { return eq("i = (v<sub>1</sub> − v<sub>2</sub>)/1000 = " + si(h.el("Rc").i, "A")); }, { unitDefault: 1 })
      ] },
    readings: [["v1", function (h) { return si(h.v([1, 1]), "V"); }], ["v2", function (h) { return si(h.v([1, 2]), "V"); }]],
    checks: [["التيار من المزود أقل من 20 mA", function (h) { return h.el("Ra").i < 0.02; }]],
    measure: [{ id: "v1", label: "v<sub>1</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 1]); } }, { id: "v2", label: "v<sub>2</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 2]); } }] });

  D({ lesson: "c1-techniques-2", chapter: "techniques", ar: "جهود العقد مع مصدر تيار تابع", en: "Node Voltages with a Dependent Source", level: "متقدم",
    summary: "وحدة مصدر تيار يتحكم به جهد (VCCS) تحقن في العقدة 2 تيارًا يتبع جهد العقدة 1. تكتب معادلة القيد مع معادلات العقد وتقيس.",
    idea: "<p>مع مصدر تابع نكتب معادلات العقد كالعادة، ونضيف <b>معادلة قيد</b> تعبّر عن متغير التحكم بدلالة جهود العقد. هنا " + L("i<sub>G</sub> = g · v<sub>1</sub>") + " حيث v<sub>1</sub> جهد R2.</p>",
    specs: ["مزود 10 V، R1 = 1 kΩ، R2 = 2 kΩ (التحكم)، R3 = 1 kΩ، R4 = 2 kΩ.", "VCCS بـ g = 0.5 mS تحقن تيارًا في العقدة 2.", "الجهود أقل من 20 V."],
    controls: [ctl("g", "g", [0.25e-3, 0.5e-3, 0.75e-3], "S", 0.5e-3)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "R1" }], ["R", [1, 1], [2, 1], { value: 2000, tag: "R2" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R3" }], ["DEP", [1, 2], [2, 2], { dk: "VCCS", gain: v.g, ctrl: "R2", dir: "ba", tag: "G" }], ["W", [1, 2], [1, 3]], ["R", [1, 3], [2, 3], { value: 2000, tag: "R4" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: "المصدر التابع يحقن في العقدة 2 تيارًا " + L("0.5 mS × v<sub>1</sub>") + ". اكتب KCL للعقدتين.",
      steps: [
        q("جهد العقدة 1.", "v<sub>1</sub> =", function (h) { return h.v([1, 1]); }, U.V, function (h) { return eq("(v<sub>1</sub>−10)/1k + v<sub>1</sub>/2k + (v<sub>1</sub>−v<sub>2</sub>)/1k = 0") + "، " + eq("(v<sub>2</sub>−v<sub>1</sub>)/1k + v<sub>2</sub>/2k − 0.0005 v<sub>1</sub> = 0") + " ← " + eq("v<sub>1</sub> = " + si(h.v([1, 1]), "V")); }, { unitDefault: 1 }),
        q("جهد العقدة 2.", "v<sub>2</sub> =", function (h) { return h.v([1, 2]); }, U.V, function (h) { return eq("v<sub>2</sub> = " + si(h.v([1, 2]), "V")); }, { unitDefault: 1 }),
        q("تيار المصدر التابع.", "i<sub>G</sub> =", function (h) { return 0.5e-3 * h.v([1, 1]); }, U.A, function (h) { return eq("i<sub>G</sub> = 0.0005 × v<sub>1</sub> = " + si(0.5e-3 * h.v([1, 1]), "A")); }, { unitDefault: 1 })
      ] },
    readings: [["v1", function (h) { return si(h.v([1, 1]), "V"); }], ["v2", function (h) { return si(h.v([1, 2]), "V"); }], ["i<sub>G</sub>", function (h, v) { return si(v.g * h.v([1, 1]), "A"); }]],
    checks: [["كل الجهود أقل من 20 V", function (h) { return Math.abs(h.v([1, 2])) < 20 && Math.abs(h.v([1, 1])) < 20; }]],
    measure: [{ id: "v1", label: "v<sub>1</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 1]); } }, { id: "v2", label: "v<sub>2</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 2]); } }],
    causes: ["الوحدة نموذج مثالي؛ في المعمل تُبنى VCCS بمضخم عمليات ومقاومة، وكسبها الحقيقي يختلف قليلًا."] });

  D({ lesson: "c1-techniques-3", chapter: "techniques", ar: "العقدة العظمى: قناة مزود عائمة بين عقدتين", en: "Supernode: a Floating Supply Channel", level: "متوسط",
    summary: "قناة CH2 لمزود الجهد معزولة، فتوصلها بين عقدتين لا تتصل أي منهما بالمرجع. تكتب معادلة العقدة العظمى ومعادلة القيد وتقيس.",
    idea: "<p>مصدر جهد بين عقدتين غير مرجعيتين لا نعرف تياره، فنحيطه بعقدة عظمى: نكتب KCL للعقدتين معًا، ونضيف القيد " + L("v<sub>2</sub> − v<sub>1</sub> = V<sub>2</sub>") + ". قنوات المزود المختبري معزولة عن بعض، فهذا ممكن عمليًا.</p>",
    specs: ["CH1 = 10 V من المرجع، R1 = 1 kΩ إلى العقدة 1، R2 = 2.2 kΩ من العقدة 1 للمرجع.", "CH2 = 4 V بين العقدتين: سالبها في العقدة 1 وموجبها في العقدة 2، و R<sub>L</sub> من العقدة 2 للمرجع."],
    controls: [ctl("v2", "جهد CH2", [2, 3, 4, 5], "V", 4), ctl("rl", "R<sub>L</sub>", e12(1000, 10000), "Ω", 3300)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "V1" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "R1" }], ["V", [1, 1], [1, 2], { value: v.v2, plus: "b", tag: "V2" }], ["R", [1, 1], [2, 1], { value: 2200, tag: "R2" }], ["R", [1, 2], [2, 2], { value: v.rl, tag: "RL" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { vp: [1, 1], vn: [2, 0] } }; },
    design: { prompt: L("V1 = 10 V") + "، " + L("R1 = 1 kΩ") + "، " + L("R2 = 2.2 kΩ") + "، " + L("V2 = 4 V") + " (+ عند العقدة 2)، " + L("R<sub>L</sub> = 3.3 kΩ") + ".",
      steps: [
        q("جهد العقدة 1.", "v<sub>1</sub> =", function (h) { return h.v([1, 1]); }, U.V, function (h) { return eq("(v<sub>1</sub>−10)/1k + v<sub>1</sub>/2.2k + v<sub>2</sub>/3.3k = 0") + " و " + eq("v<sub>2</sub> = v<sub>1</sub> + 4") + " ← " + eq("v<sub>1</sub> = " + si(h.v([1, 1]), "V")); }, { unitDefault: 1 }),
        q("جهد العقدة 2.", "v<sub>2</sub> =", function (h) { return h.v([1, 2]); }, U.V, function (h) { return eq("v<sub>2</sub> = v<sub>1</sub> + 4 = " + si(h.v([1, 2]), "V")); }, { unitDefault: 1 }),
        q("التيار الذي تعطيه CH2.", "i =", function (h) { return h.el("RL").i; }, U.A, function (h) { return eq("i = v<sub>2</sub>/3300 = " + si(h.el("RL").i, "A")); }, { unitDefault: 1 })
      ] },
    readings: [["v1", function (h) { return si(h.v([1, 1]), "V"); }], ["v2", function (h) { return si(h.v([1, 2]), "V"); }], ["v2 − v1", function (h) { return si(h.v([1, 2], [1, 1]), "V"); }]],
    checks: [["CH2 تعطي قدرة (لا تمتص)", function (h) { return h.el("V2").p <= 0; }], ["العقدة 2 فوق المرجع", function (h) { return h.v([1, 2]) > 0; }]],
    measure: [{ id: "v1", label: "v<sub>1</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 1]); } }, { id: "v2", label: "v<sub>2</sub>", units: U.V, def: 1, f: function (h) { return h.v([1, 2]); } }],
    analyze: function (m, v) { var o = []; if (m.v1 != null && m.v2 != null) o.push("الفرق من قياسك " + L(si(m.v2 - m.v1, "V")) + " ويفترض أن يساوي جهد CH2 (" + L(si(v.v2, "V")) + ") مهما كانت الأحمال."); return o; } });

  var MESH = function (shared, v2) { return [["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "V1" }], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R1" }]].concat(shared).concat([["R", [1, 2], [1, 3], { value: 2000, tag: "R2" }], ["AM", [1, 3], [1, 4], { tag: "A2" }]]).concat(v2 || [["V", [1, 4], [2, 4], { value: 5, plus: "b", tag: "V2" }]]).concat([["W", [2, 4], [3, 4]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]], ["W", [3, 3], [3, 4]]]); };
  D({ lesson: "c1-techniques-4", chapter: "techniques", ar: "تيارات الحلقات بأميترين", en: "Mesh Currents with Two Ammeters", level: "متوسط",
    summary: "دائرة بحلقتين ومصدرين: تكتب معادلتي KVL بدلالة تياري الحلقتين، وكل أميتر في الدائرة يقرأ تيار حلقة مباشرة.",
    idea: "<p>تيار الحلقة يدور في حلقة بسيطة (mesh). العنصر الخارجي يمر فيه تيار حلقة واحدة، والعنصر المشترك يمر فيه الفرق بينهما. نكتب KVL لكل حلقة: عدد المعادلات = عدد الحلقات.</p>",
    specs: ["CH1 = 10 V يسار و CH2 = 5 V يمين، R1 = 1 kΩ، R2 = 2 kΩ، R3 مشتركة.", "أميتر A1 في الحلقة اليسرى و A2 في اليمنى (اتجاه عقارب الساعة)."],
    controls: [ctl("r3", "R3 المشتركة", e12(1000, 4700), "Ω", 3300)],
    circuit: function (v) { return { ground: [3, 0], edges: MESH([["R", [1, 2], [2, 2], { value: v.r3, tag: "R3" }], ["W", [2, 2], [3, 2]]]) }; },
    design: { prompt: L("V1 = 10 V") + "، " + L("V2 = 5 V") + " (+ في الأسفل)، " + L("R1 = 1 kΩ") + "، " + L("R2 = 2 kΩ") + "، " + L("R3 = 3.3 kΩ") + ". تيارا الحلقتين مع عقارب الساعة.",
      steps: [
        q("تيار الحلقة اليسرى.", "i<sub>1</sub> =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("10 = 1000 i<sub>1</sub> + 3300 (i<sub>1</sub> − i<sub>2</sub>)") + "، " + eq("0 = 3300 (i<sub>2</sub> − i<sub>1</sub>) + 2000 i<sub>2</sub> − 5") + " ← " + eq("i<sub>1</sub> = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("تيار الحلقة اليمنى.", "i<sub>2</sub> =", function (h) { return h.el("A2").i; }, U.A, function (h) { return eq("i<sub>2</sub> = " + si(h.el("A2").i, "A")); }, { unitDefault: 1 }),
        q("تيار R3 المشتركة (للأسفل).", "i<sub>3</sub> =", function (h) { return h.el("A1").i - h.el("A2").i; }, U.A, function (h) { return eq("i<sub>3</sub> = i<sub>1</sub> − i<sub>2</sub> = " + si(h.el("A1").i - h.el("A2").i, "A")); }, { unitDefault: 1 })
      ] },
    readings: [["i1 · i2", function (h) { return si(h.el("A1").i, "A") + " · " + si(h.el("A2").i, "A"); }], ["تيار R3", function (h) { return si(h.el("R3").i, "A"); }]],
    checks: [["القناتان تعطيان قدرة", function (h) { return h.el("V1").p <= 0 && h.el("V2").p <= 0; }]],
    measure: [{ id: "i1", label: "A1", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "i2", label: "A2", units: U.A, def: 1, f: function (h) { return h.el("A2").i; } }, { id: "v3", label: "جهد R3", units: U.V, def: 1, f: function (h) { return h.el("R3").v; } }] });

  D({ lesson: "c1-techniques-5", chapter: "techniques", ar: "تيارات الحلقات مع مصدر جهد تابع", en: "Mesh Currents with a Dependent Voltage Source", level: "متقدم",
    summary: "في الحلقة اليمنى وحدة CCVS قيمتها تتبع تيار الفرع المشترك. تكتب معادلتي الحلقتين مع القيد وتقيس بالأميترين.",
    idea: "<p>مع مصدر جهد تابع في طريقة الحلقات: نكتب KVL كالعادة ونعامل المصدر التابع كمصدر جهد، ثم نعبّر عن متغير التحكم بتيارات الحلقات. هنا " + L("v<sub>H</sub> = r · i<sub>3</sub>") + " و " + L("i<sub>3</sub> = i<sub>1</sub> − i<sub>2</sub>") + ".</p>",
    specs: ["CH1 = 10 V، R1 = 1 kΩ، R3 = 2 kΩ مشتركة، R2 = 2 kΩ.", "CCVS بـ r = 500 Ω تتحكم بها R3، في الحلقة اليمنى."],
    controls: [ctl("r", "r", [250, 500, 1000, 1500], "Ω", 500)],
    circuit: function (v) { return { ground: [3, 0], edges: MESH([["R", [1, 2], [2, 2], { value: 2000, tag: "R3" }], ["W", [2, 2], [3, 2]]], [["DEP", [1, 4], [2, 4], { dk: "CCVS", gain: v.r, ctrl: "R3", plus: "a", tag: "H" }]]) }; },
    design: { prompt: L("V1 = 10 V") + "، " + L("R1 = 1 kΩ") + "، " + L("R3 = 2 kΩ") + " مشتركة، " + L("R2 = 2 kΩ") + "، والمصدر التابع " + L("500 i<sub>3</sub>") + " (+ في الأعلى) حيث i<sub>3</sub> تيار R3 للأسفل.",
      steps: [
        q("تيار الحلقة اليسرى.", "i<sub>1</sub> =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("10 = 1000 i<sub>1</sub> + 2000 (i<sub>1</sub> − i<sub>2</sub>)") + "، " + eq("0 = 2000 (i<sub>2</sub> − i<sub>1</sub>) + 2000 i<sub>2</sub> + 500 (i<sub>1</sub> − i<sub>2</sub>)") + " ← " + eq("i<sub>1</sub> = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("تيار الحلقة اليمنى.", "i<sub>2</sub> =", function (h) { return h.el("A2").i; }, U.A, function (h) { return eq("i<sub>2</sub> = " + si(h.el("A2").i, "A")); }, { unitDefault: 1 }),
        q("جهد المصدر التابع.", "v<sub>H</sub> =", function (h) { return h.el("H").v; }, U.V, function (h) { return eq("v<sub>H</sub> = 500 (i<sub>1</sub> − i<sub>2</sub>) = " + si(h.el("H").v, "V")); }, { unitDefault: 1 })
      ] },
    readings: [["i1 · i2", function (h) { return si(h.el("A1").i, "A") + " · " + si(h.el("A2").i, "A"); }], ["v<sub>H</sub>", function (h) { return si(h.el("H").v, "V"); }]],
    checks: [["التيارات أقل من 20 mA", function (h) { return Math.abs(h.el("A1").i) < 0.02 && Math.abs(h.el("A2").i) < 0.02; }]],
    measure: [{ id: "i1", label: "A1", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "i2", label: "A2", units: U.A, def: 1, f: function (h) { return h.el("A2").i; } }],
    causes: ["الوحدة نموذج مثالي؛ في المعمل تُبنى CCVS بمضخم عمليات (محوّل تيار إلى جهد)."] });

  D({ lesson: "c1-techniques-6", chapter: "techniques", ar: "الحلقة العظمى: مصدر تيار في الفرع المشترك", en: "Supermesh: a Current Source in the Shared Branch", level: "متقدم",
    summary: "قناة من مزود الجهد في وضع CC في الفرع المشترك تفرض فرق تياري الحلقتين. تكتب KVL للحلقة العظمى مع القيد وتقيس.",
    idea: "<p>مصدر تيار بين حلقتين لا نعرف جهده، فنتجنبه بحلقة عظمى حول الحلقتين معًا، ونضيف القيد " + L("i<sub>2</sub> − i<sub>1</sub> = I") + " (المصدر للأعلى في الفرع المشترك).</p>",
    specs: ["CH1 = 10 V يسار، CH2 = 5 V يمين، CH3 مصدر تيار 2 mA في الفرع المشترك مع R3 = 1 kΩ.", "جهد CH3 موجب (تعطي قدرة) وأقل من 30 V."],
    controls: [ctl("i", "تيار CH3", [0.001, 0.002, 0.003], "A", 0.002)],
    circuit: function (v) { return { ground: [3, 0], edges: MESH([["I", [1, 2], [2, 2], { value: v.i, dir: "ba", tag: "Is" }], ["R", [2, 2], [3, 2], { value: 1000, tag: "R3" }]]) }; },
    design: { prompt: L("V1 = 10 V") + "، " + L("R1 = 1 kΩ") + "، " + L("R2 = 2 kΩ") + "، " + L("V2 = 5 V") + " (+ في الأسفل)، وفي الفرع المشترك مصدر تيار " + L("2 mA") + " للأعلى مع " + L("R3 = 1 kΩ") + ".",
      steps: [
        q("تيار الحلقة اليسرى.", "i<sub>1</sub> =", function (h) { return h.el("A1").i; }, U.A, function (h) { return eq("i<sub>2</sub> − i<sub>1</sub> = 2 mA") + "، الحلقة العظمى: " + eq("10 + 5 = 1000 i<sub>1</sub> + 2000 i<sub>2</sub>") + " ← " + eq("i<sub>1</sub> = " + si(h.el("A1").i, "A")); }, { unitDefault: 1 }),
        q("تيار الحلقة اليمنى.", "i<sub>2</sub> =", function (h) { return h.el("A2").i; }, U.A, function (h) { return eq("i<sub>2</sub> = i<sub>1</sub> + 2 mA = " + si(h.el("A2").i, "A")); }, { unitDefault: 1 }),
        q("جهد CH3 كما يعرضه المزود (الأحمر ناقص الأسود).", "v =", function (h) { return h.el("Is").v; }, U.V, function (h) { return "KVL في الحلقة اليسرى: " + eq("10 = 1000 i<sub>1</sub> + v + 1000 (i<sub>1</sub> − i<sub>2</sub>)") + " ← " + eq("v = " + si(h.el("Is").v, "V")); }, { unitDefault: 1 })
      ] },
    readings: [["i1 · i2", function (h) { return si(h.el("A1").i, "A") + " · " + si(h.el("A2").i, "A"); }], ["جهد CH3", function (h) { return si(h.el("Is").v, "V"); }]],
    checks: [["CH3 تعطي قدرة (جهدها موجب)", function (h) { return h.el("Is").p < 0; }], ["جهد CH3 أقل من 30 V", function (h) { return Math.abs(h.el("Is").v) < 30; }]],
    measure: [{ id: "i1", label: "A1", units: U.A, def: 1, f: function (h) { return h.el("A1").i; } }, { id: "i2", label: "A2", units: U.A, def: 1, f: function (h) { return h.el("A2").i; } }, { id: "vs", label: "جهد CH3 على شاشة المزود", units: U.V, def: 1, f: function (h) { return h.el("Is").v; } }],
    analyze: function (m, v) { var o = []; if (m.i1 != null && m.i2 != null) o.push("من قياسك " + L("i<sub>2</sub> − i<sub>1</sub> = " + si(m.i2 - m.i1, "A")) + " ويفترض أن يساوي حد تيار CH3 (" + L(si(v.i, "A")) + ")."); return o; } });

  D({ lesson: "c1-techniques-7", chapter: "techniques", ar: "العقد أم الحلقات؟ اختيار الطريقة الأقصر", en: "Node Voltages or Mesh Currents?", level: "متوسط",
    summary: "ثلاثة أحمال على التوازي خلف مقاومة: طريقة العقد تحتاج معادلة واحدة والحلقات ثلاثًا. تختار الأقصر، تحل، وتقيس.",
    idea: "<p>نقارن عدد المعادلات: العقد تحتاج (عدد العقد الأساسية − 1)، والحلقات تحتاج عدد الحلقات البسيطة. في دائرة فيها فروع كثيرة على التوازي تكون العقد أقصر، وفي سلسلة طويلة من الحلقات قد تكون الحلقات أقصر.</p>",
    specs: ["مزود 12 V، R1 = 1 kΩ، ثم R2 و R3 و R4 على التوازي."],
    controls: [ctl("r2", "R2", e12(1000, 10000), "Ω", 2200), ctl("r3", "R3", e12(1000, 10000), "Ω", 3300), ctl("r4", "R4", e12(1000, 10000), "Ω", 4700)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 12, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "R1" }], ["R", [1, 1], [2, 1], { value: v.r2, tag: "R2" }], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: v.r3, tag: "R3" }], ["W", [1, 2], [1, 3]], ["R", [1, 3], [2, 3], { value: v.r4, tag: "R4" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], probes: { vp: [1, 1], vn: [2, 0] } }; },
    design: { prompt: "مزود " + L("12 V") + "، " + L("R1 = 1 kΩ") + " ثم " + L("2.2 kΩ ∥ 3.3 kΩ ∥ 4.7 kΩ") + ".",
      steps: [
        choice("كم معادلة تحتاج كل طريقة؟", [{ t: "العقد: 1، الحلقات: 3", correct: true }, { t: "العقد: 3، الحلقات: 1", type: "conceptual", why: "فيها عقدتان أساسيتان (إحداهما مرجع) فمعادلة عقد واحدة، وثلاث حلقات بسيطة." }, { t: "العقد: 2، الحلقات: 2", type: "conceptual", why: "عد العقد الأساسية (التي يلتقي فيها 3 فروع أو أكثر) والحلقات البسيطة." }], "عقدة واحدة غير مرجعية ← معادلة واحدة، مقابل ثلاث حلقات."),
        q("جهد العقدة العلوية.", "v =", function (h) { return h.v([1, 1]); }, U.V, function (h) { return eq("(v − 12)/1000 + v/2200 + v/3300 + v/4700 = 0") + " ← " + eq("v = " + si(h.v([1, 1]), "V")); }, { unitDefault: 1 }),
        q("تيار R4.", "i<sub>4</sub> =", function (h) { return h.el("R4").i; }, U.A, function (h) { return eq("i<sub>4</sub> = v/4700 = " + si(h.el("R4").i, "A")); }, { unitDefault: 1 })
      ] },
    readings: [["جهد العقدة", function (h) { return si(h.v([1, 1]), "V"); }], ["التيار الكلي", function (h) { return si(h.el("R1").i, "A"); }]],
    checks: [["التيار الكلي أقل من 20 mA", function (h) { return h.el("R1").i < 0.02; }]],
    measure: [{ id: "v", label: "جهد العقدة", units: U.V, def: 1, f: function (h) { return h.v([1, 1]); } }, { id: "vr1", label: "جهد R1", units: U.V, def: 1, f: function (h) { return h.el("R1").v; } }] });

  D({ lesson: "c1-techniques-8", chapter: "techniques", ar: "تحويل المصدر: نفس الحمل بمصدرين مختلفين", en: "Source Transformation on the Bench", level: "متوسط",
    summary: "تبني مصدر جهد مع مقاومة على التوالي (CH1) ومصدر تيار مع نفس المقاومة على التوازي (CH2 في CC)، وتقيس أن الحمل يرى نفس الجهد.",
    idea: "<p>مصدر جهد " + L("V<sub>s</sub>") + " مع " + L("R") + " على التوالي يكافئ مصدر تيار " + L("I = V<sub>s</sub>/R") + " مع نفس " + L("R") + " على التوازي: أي حمل يأخذ نفس الجهد والتيار. التكافؤ عند الطرفين فقط؛ القدرة داخل المصدرين ليست نفسها.</p>",
    specs: ["الدائرة أ: CH1 = 10 V مع R<sub>s</sub> على التوالي وحمل R<sub>L</sub>.", "الدائرة ب: CH2 مصدر تيار 10/R<sub>s</sub> مع R<sub>s</sub> على التوازي ونفس R<sub>L</sub>."],
    controls: [ctl("rs", "R<sub>s</sub>", [1000, 2200, 4700], "Ω", 1000), ctl("rl", "R<sub>L</sub>", e12(470, 4700), "Ω", 2200)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "V1" }], ["R", [1, 0], [1, 1], { value: v.rs, tag: "Rs" }], ["R", [1, 1], [2, 1], { value: v.rl, tag: "RLa" }], ["W", [2, 0], [2, 1]],
      ["I", [1, 3], [2, 3], { value: 10 / v.rs, dir: "ba", tag: "I2" }], ["W", [1, 3], [1, 4]], ["R", [1, 4], [2, 4], { value: v.rs, tag: "Rp" }], ["W", [1, 4], [1, 5]], ["R", [1, 5], [2, 5], { value: v.rl, tag: "RLb" }], ["W", [2, 3], [2, 4]], ["W", [2, 4], [2, 5]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: L("V<sub>s</sub> = 10 V") + "، " + L("R<sub>s</sub> = 1 kΩ") + "، " + L("R<sub>L</sub> = 2.2 kΩ") + ".",
      steps: [
        q("تيار المصدر المكافئ.", "I =", function (h, v) { return 10 / v.rs; }, U.A, eq("I = 10 / 1000 = 10 mA"), { unitDefault: 1 }),
        q("جهد الحمل في الدائرة أ.", "v<sub>La</sub> =", function (h) { return h.el("RLa").v; }, U.V, function (h) { return eq("v = 10 × 2200/3200 = " + si(h.el("RLa").v, "V")); }, { unitDefault: 1 }),
        q("جهد الحمل في الدائرة ب.", "v<sub>Lb</sub> =", function (h) { return h.el("RLb").v; }, U.V, function (h) { return eq("v = 10 mA × (1000∥2200) = " + si(h.el("RLb").v, "V")) + " ← نفس الجهد"; }, { unitDefault: 1 }),
        choice("هل القدرة المبددة في R<sub>s</sub> هي نفسها في الدائرتين؟", [{ t: "لا: التكافؤ عند طرفي الحمل فقط", correct: true }, { t: "نعم لأن الدائرتين متكافئتان", type: "conceptual", why: "التكافؤ يعني أن الحمل لا يفرق بينهما، أما ما يحدث داخل المصدر فيختلف." }], "في أ يمر في R<sub>s</sub> تيار الحمل، وفي ب يمر فيها الجزء الباقي من 10 mA.")
      ] },
    readings: [["جهد الحمل أ · ب", function (h) { return si(h.el("RLa").v, "V") + " · " + si(h.el("RLb").v, "V"); }], ["قدرة R<sub>s</sub> أ · ب", function (h) { return si(h.el("Rs").p, "W") + " · " + si(h.el("Rp").p, "W"); }]],
    checks: [["الحمل يرى نفس الجهد في الدائرتين", function (h) { return Math.abs(h.el("RLa").v - h.el("RLb").v) < 1e-4; }], ["جهد CH2 أقل من 30 V", function (h) { return h.el("RLb").v < 30; }]],
    measure: [{ id: "va", label: "جهد الحمل في الدائرة أ", units: U.V, def: 1, f: function (h) { return h.el("RLa").v; } }, { id: "vb", label: "جهد الحمل في الدائرة ب", units: U.V, def: 1, f: function (h) { return h.el("RLb").v; } }] });

  var TH = function (v, load) { return [["V", [1, 0], [2, 0], { value: 12, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 3900, tag: "R1" }], ["R", [1, 1], [2, 1], { value: 12000, tag: "R2" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R3" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]].concat(load || []); };
  var thV = 12 * 12000 / 15900, thR = 3900 * 12000 / 15900 + 1000;
  D({ lesson: "c1-techniques-9", chapter: "techniques", ar: "مكافئ ثيفنن ونورتن لصندوق أسود", en: "Thévenin and Norton of a Black Box", level: "متوسط",
    summary: "تعامل الشبكة كصندوق أسود له طرفان: تقيس جهد الدائرة المفتوحة وتيار القصر، فتحصل على مكافئ ثيفنن ونورتن، ثم تتنبأ بجهد أي حمل وتتحقق.",
    idea: "<p>أي شبكة خطية بين طرفين تكافئ مصدرًا " + L("V<sub>Th</sub>") + " مع " + L("R<sub>Th</sub>") + " على التوالي (ثيفنن)، أو " + L("I<sub>N</sub> = V<sub>Th</sub>/R<sub>Th</sub>") + " مع " + L("R<sub>Th</sub>") + " على التوازي (نورتن). في المعمل: " + L("V<sub>Th</sub>") + " = قراءة الفولتميتر بدون حمل، و " + L("I<sub>N</sub>") + " = قراءة الأميتر بين الطرفين.</p>",
    specs: ["الصندوق: مزود 12 V، R1 = 3.9 kΩ، R2 = 12 kΩ، R3 = 1 kΩ إلى الطرف a.", "قياس V<sub>oc</sub> و I<sub>sc</sub> ثم حمل R<sub>L</sub>."],
    controls: [ctl("rl", "R<sub>L</sub>", e12(470, 22000), "Ω", 2200)],
    circuit: function (v) { return { edges: TH(v, [["R", [1, 2], [2, 2], { value: v.rl, tag: "RL" }]]), probes: { vp: [1, 2], vn: [2, 2] } }; },
    design: { prompt: "الصندوق الأسود بين الطرفين a (بعد R3) و b (المرجع)، والحمل " + L("R<sub>L</sub> = 2.2 kΩ") + ".",
      steps: [
        q("جهد ثيفنن (بدون حمل).", "V<sub>Th</sub> =", function () { return thV; }, U.V, eq("V<sub>Th</sub> = 12 × 12000/15900 = " + si(thV, "V")), { unitDefault: 1 }),
        q("مقاومة ثيفنن (المصدر مقصور).", "R<sub>Th</sub> =", function () { return thR; }, U.OHM, eq("R<sub>Th</sub> = 3.9k∥12k + 1k = " + si(thR, "Ω")), { unitDefault: 1 }),
        q("تيار نورتن (تيار القصر).", "I<sub>N</sub> =", function () { return thV / thR; }, U.A, eq("I<sub>N</sub> = V<sub>Th</sub>/R<sub>Th</sub> = " + si(thV / thR, "A")), { unitDefault: 1 }),
        q("جهد الحمل 2.2 kΩ من المكافئ.", "v<sub>L</sub> =", function (h) { return h.el("RL").v; }, U.V, function (h) { return eq("v<sub>L</sub> = V<sub>Th</sub> × 2200/(R<sub>Th</sub> + 2200) = " + si(h.el("RL").v, "V")); }, { unitDefault: 1 })
      ] },
    readings: [["V<sub>Th</sub> · R<sub>Th</sub>", function () { return si(thV, "V") + " · " + si(thR, "Ω"); }], ["جهد الحمل", function (h) { return si(h.el("RL").v, "V"); }]],
    checks: [["المكافئ يعطي نفس جهد الحمل", function (h, v) { return Math.abs(h.el("RL").v - thV * v.rl / (thR + v.rl)) < 1e-3; }]],
    measure: [{ id: "voc", label: "V<sub>oc</sub> (الحمل مفصول)", units: U.V, def: 1, f: function () { return thV * 1e7 / (1e7 + thR); } }, { id: "isc", label: "I<sub>sc</sub> (أميتر بين a و b)", units: U.A, def: 1, f: function () { return thV / (thR + 0.05); } }, { id: "vl", label: "جهد الحمل", units: U.V, def: 1, f: function (h) { return h.el("RL").v; } }],
    analyze: function (m, v) { var o = []; if (m.voc != null && m.isc) { var rth = m.voc / m.isc; o.push("من قياسك " + L("R<sub>Th</sub> = V<sub>oc</sub>/I<sub>sc</sub> = " + si(rth, "Ω")) + "، فجهد الحمل المتوقع " + L(si(m.voc * v.rl / (rth + v.rl), "V")) + (m.vl != null ? " مقابل قياسك " + L(si(m.vl, "V")) : "") + "."); } return o; },
    safety: ["قياس I<sub>sc</sub> آمن هنا لأن R3 تحد التيار، لكن لا تضع الأميتر مباشرة على مصدر بدون مقاومة."] });

  D({ lesson: "c1-techniques-10", chapter: "techniques", ar: "مقاومة ثيفنن بمصدر اختبار", en: "Thévenin Resistance with a Test Source", level: "متوسط",
    summary: "تُطفئ مصدر الشبكة (تستبدله بسلك)، وتحقن تيار اختبار 1 mA من قناة CC، فتكون R<sub>Th</sub> = جهد الاختبار ÷ 1 mA، وتؤكدها بالأوميتر.",
    idea: "<p>طريقة ثانية لإيجاد " + L("R<sub>Th</sub>") + ": نطفئ المصادر المستقلة (الجهد يصبح قصرًا والتيار فتحًا)، ثم نضع مصدر اختبار بين الطرفين: " + L("R<sub>Th</sub> = v<sub>T</sub>/i<sub>T</sub>") + ". هذه الطريقة ضرورية عندما تحتوي الشبكة مصادر تابعة.</p>",
    specs: ["نفس الصندوق الأسود، والمزود الأصلي مستبدل بسلك.", "CH2 مصدر تيار اختبار 1 mA بين a و b."],
    controls: [ctl("it", "تيار الاختبار", [0.0005, 0.001, 0.002], "A", 0.001)],
    circuit: function (v) { return { edges: [["W", [1, 0], [2, 0]], ["R", [1, 0], [1, 1], { value: 3900, tag: "R1" }], ["R", [1, 1], [2, 1], { value: 12000, tag: "R2" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R3" }], ["W", [2, 1], [2, 2]], ["W", [2, 0], [2, 1]], ["W", [1, 2], [1, 3]], ["I", [1, 3], [2, 3], { value: v.it, dir: "ba", tag: "It" }], ["W", [2, 2], [2, 3]]], probes: { vp: [1, 2], vn: [2, 2] } }; },
    design: { prompt: "المصدر الأصلي (12 V) مُطفأ: سلك مكانه. تيار اختبار " + L("1 mA") + " يدخل من الطرف a.",
      steps: [
        q("مقاومة ثيفنن.", "R<sub>Th</sub> =", function () { return thR; }, U.OHM, eq("R<sub>Th</sub> = (3.9k ∥ 12k) + 1k = " + si(thR, "Ω")), { unitDefault: 1 }),
        q("جهد الاختبار بين a و b.", "v<sub>T</sub> =", function (h) { return h.v([1, 2], [2, 2]); }, U.V, function (h) { return eq("v<sub>T</sub> = 1 mA × R<sub>Th</sub> = " + si(h.v([1, 2], [2, 2]), "V")); }, { unitDefault: 1 }),
        choice("كيف نطفئ مصدر تيار مستقل؟", [{ t: "نفتحه (نزيله ونترك مكانه مفتوحًا)", correct: true }, { t: "نقصره بسلك", type: "conceptual", why: "مصدر التيار المطفأ تياره صفر، أي دائرة مفتوحة. القصر لمصدر الجهد." }], "تيار صفر = دائرة مفتوحة.")
      ] },
    readings: [["v<sub>T</sub>", function (h) { return si(h.v([1, 2], [2, 2]), "V"); }], ["v<sub>T</sub>/i<sub>T</sub>", function (h, v) { return si(h.v([1, 2], [2, 2]) / v.it, "Ω"); }]],
    checks: [["v<sub>T</sub>/i<sub>T</sub> = R<sub>Th</sub>", function (h, v) { return Math.abs(h.v([1, 2], [2, 2]) / v.it - thR) / thR < 0.002; }]],
    measure: [{ id: "vt", label: "جهد الاختبار", units: U.V, def: 1, f: function (h) { return h.v([1, 2], [2, 2]); } }, { id: "r", label: "قراءة الأوميتر بين a و b (CH2 مفصولة)", units: U.OHM, def: 1, f: function () { return thR; } }] });

  D({ lesson: "c1-techniques-11", chapter: "techniques", ar: "أقصى نقل للقدرة: الحمل الذي يأخذ أكبر قدرة", en: "Maximum Power Transfer", level: "متوسط",
    summary: "مصدر بمقاومة داخلية 1 kΩ يغذي حملًا متغيرًا. تجرب قيمًا للحمل وتجد أن القدرة تبلغ أقصاها عندما R<sub>L</sub> = R<sub>Th</sub>.",
    idea: "<p>القدرة في الحمل " + L("p = V<sub>Th</sub>² R<sub>L</sub>/(R<sub>Th</sub> + R<sub>L</sub>)²") + " أعظم ما تكون عند " + L("R<sub>L</sub> = R<sub>Th</sub>") + "، وقيمتها " + L("V<sub>Th</sub>²/(4R<sub>Th</sub>)") + ". عندها الكفاءة 50% فقط: نصف القدرة يضيع في المصدر.</p>",
    specs: ["CH1 = 10 V مع R<sub>Th</sub> = 1 kΩ على التوالي (مصدر حقيقي).", "اختر R<sub>L</sub> التي تعطي أكثر من 99% من القدرة العظمى."],
    controls: [ctl("rl", "R<sub>L</sub>", e12(100, 10000), "Ω", 1000)],
    circuit: function (v) { return { edges: [["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "Rth" }], ["R", [1, 1], [2, 1], { value: v.rl, tag: "RL" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: L("V<sub>Th</sub> = 10 V") + "، " + L("R<sub>Th</sub> = 1 kΩ") + ".",
      steps: [
        q("قيمة الحمل التي تعطي أقصى قدرة.", "R<sub>L</sub> =", function () { return 1000; }, U.OHM, eq("R<sub>L</sub> = R<sub>Th</sub> = 1 kΩ"), { unitDefault: 1 }),
        q("القدرة العظمى.", "p<sub>max</sub> =", function () { return 0.025; }, U.W, eq("p = 10²/(4 × 1000) = 25 mW")),
        q("القدرة لو كان R<sub>L</sub> = 470 Ω.", "p =", function () { return 100 * 470 / Math.pow(1470, 2); }, U.W, eq("p = 100 × 470/1470² = " + si(100 * 470 / Math.pow(1470, 2), "W"))),
        q("الكفاءة عند أقصى قدرة.", "η =", function () { return 0.5; }, [{ l: "%", f: 0.01 }, { l: "—", f: 1 }], eq("η = R<sub>L</sub>/(R<sub>Th</sub> + R<sub>L</sub>) = 50%"))
      ] },
    readings: [["قدرة الحمل", function (h) { return si(h.el("RL").p, "W"); }], ["نسبتها من 25 mW", function (h) { return Math.round(h.el("RL").p / 0.025 * 1000) / 10 + "%"; }], ["الكفاءة", function (h) { return Math.round(h.el("RL").p / -h.el("Vs").p * 100) + "%"; }]],
    checks: [["القدرة أكثر من 99% من القدرة العظمى", function (h) { return h.el("RL").p >= 0.99 * 0.025; }]],
    measure: [{ id: "vl", label: "جهد الحمل", units: U.V, def: 1, f: function (h) { return h.el("RL").v; } }],
    analyze: function (m, v) { return m.vl != null ? ["القدرة من قياسك " + L("v²/R<sub>L</sub> = " + si(m.vl * m.vl / v.rl, "W")) + ". جرّب حملًا أصغر وأكبر: القدرة تقل في الحالتين."] : []; } });

  var SUP = function (v1, v2) { return [["V", [1, 0], [2, 0], { value: v1, plus: "a", tag: "V1" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "R1" }], ["R", [1, 1], [2, 1], { value: 2200, tag: "RL" }], ["R", [1, 1], [1, 2], { value: 2200, tag: "R2" }], ["V", [1, 2], [2, 2], { value: v2, plus: "a", tag: "V2" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]]; };
  function supV(a, b) { var L0 = K.lab({ edges: SUP(a, b) }), r = CV.labsim.solve(L0, null); return r.dcV([1, 1]); }
  D({ lesson: "c1-techniques-12", chapter: "techniques", ar: "التراكب: كل مصدر وحده ثم معًا", en: "Superposition on the Bench", level: "متوسط",
    summary: "حمل يغذيه مصدران. تقيس جهده مع كل مصدر وحده (والآخر مستبدل بسلك) ثم معًا، وتتحقق أن الاستجابة الكلية مجموع الاستجابتين.",
    idea: "<p>في الدائرة الخطية الاستجابة لعدة مصادر = مجموع الاستجابات لكل مصدر وحده، مع إطفاء الباقي (مصدر الجهد قصر، والتيار فتح). القدرة ليست خطية، فلا تُجمع بالتراكب.</p>",
    specs: ["CH1 = 10 V عبر R1 = 1 kΩ، CH2 = 5 V عبر R2 = 2.2 kΩ، والحمل R<sub>L</sub> = 2.2 kΩ.", "ثلاثة قياسات: CH1 وحدها، CH2 وحدها، الاثنتان."],
    controls: [ctl("v2", "جهد CH2", [3, 5, 9], "V", 5)],
    circuit: function (v) { return { edges: SUP(10, v.v2), probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: L("V1 = 10 V") + " و " + L("R1 = 1 kΩ") + "، " + L("V2 = 5 V") + " و " + L("R2 = 2.2 kΩ") + "، " + L("R<sub>L</sub> = 2.2 kΩ") + ".",
      steps: [
        q("جهد الحمل من V1 وحدها (V2 قصر).", "v′ =", function () { return supV(10, 0); }, U.V, eq("v′ = 10 × (2.2k∥2.2k)/(1k + 1.1k) = " + si(supV(10, 0), "V")), { unitDefault: 1 }),
        q("جهد الحمل من V2 وحدها (V1 قصر).", "v″ =", function () { return supV(0, 5); }, U.V, eq("v″ = 5 × (1k∥2.2k)/(2.2k + 687.5) = " + si(supV(0, 5), "V")), { unitDefault: 1 }),
        q("جهد الحمل بالمصدرين.", "v =", function (h) { return h.el("RL").v; }, U.V, function (h) { return eq("v = v′ + v″ = " + si(h.el("RL").v, "V")); }, { unitDefault: 1 }),
        choice("هل قدرة الحمل = مجموع قدرتيه من كل مصدر وحده؟", [{ t: "لا: القدرة تتناسب مع مربع الجهد", correct: true }, { t: "نعم: التراكب ينطبق على كل شيء", type: "conceptual", why: "التراكب للكميات الخطية (الجهد والتيار) فقط." }], L("(v′ + v″)² ≠ v′² + v″²"))
      ] },
    readings: [["v′ · v″", function (h, v) { return si(supV(10, 0), "V") + " · " + si(supV(0, v.v2), "V"); }], ["v الكلي", function (h) { return si(h.el("RL").v, "V"); }]],
    checks: [["v = v′ + v″", function (h, v) { return Math.abs(h.el("RL").v - supV(10, 0) - supV(0, v.v2)) < 1e-6; }]],
    measure: [{ id: "va", label: "CH1 وحدها", units: U.V, def: 1, f: function () { return supV(10, 0); } }, { id: "vb", label: "CH2 وحدها", units: U.V, def: 1, f: function (h, v) { return supV(0, v.v2); } }, { id: "vt", label: "الاثنتان", units: U.V, def: 1, f: function (h) { return h.el("RL").v; } }],
    analyze: function (m) { return m.va != null && m.vb != null && m.vt != null ? ["من قياسك " + L("v′ + v″ = " + si(m.va + m.vb, "V")) + " مقابل " + L(si(m.vt, "V")) + "."] : []; },
    safety: ["لإطفاء قناة: اضغط OFF، ثم ضع سلكًا بين الثقبين اللذين كان فيهما سلكاها (المصدر المطفأ = قصر)."] });

  /* ================= الفصل 5: الحالة المستقرة الجيبية ================= */
  var FGc = function (def) { return ctl("f", "التردد", [500, 1000, 2000, 5000], "Hz", def || 1000); };
  var amp = function (h, p, q) { return mag(h.vac(p, q)); }, phs = function (h, p, ref) { return wrap(ph(h.vac(p)) - ph(h.vac(ref || [1, 0]))); };
  D({ lesson: "c1-sinusoidal-1", chapter: "sinusoidal", ar: "قراءة إشارة جيبية بالأوسيلوسكوب والملتيميتر", en: "Reading a Sine Wave: Scope and Meter", level: "مبتدئ",
    summary: "تضبط مولد الإشارة، وتقرأ على الأوسيلوسكوب القيمة العظمى والزمن الدوري، وعلى الملتيميتر القيمة الفعالة، وتربط بينها.",
    idea: "<p>المصدر الجيبي " + L("v = V<sub>m</sub> cos(ωt + φ)") + ": V<sub>m</sub> القيمة العظمى، " + L("T = 1/f") + " الزمن الدوري، " + L("ω = 2πf") + ". الأوسيلوسكوب يعرض الشكل فتقرأ V<sub>pp</sub> = 2V<sub>m</sub> و T، والملتيميتر على V~ يقرأ القيمة الفعالة " + L("V<sub>m</sub>/√2") + ".</p>",
    specs: ["CH1 لمولد الإشارة على مقاومة 1 kΩ.", "مجس CH1 للأوسيلوسكوب على خرج المولد، والملتيميتر على المقاومة (V~)."],
    controls: [ctl("a", "القيمة العظمى", [1, 2, 3, 5], "V", 2), FGc()],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(v.a, v.f, { tag: "G" })], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 1000, tag: "R" }], ["W", [2, 0], [2, 1]]], probes: { ch1: [1, 0], vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: "المولد مضبوط على قيمة عظمى " + L("2 V") + " وتردد " + L("1 kHz") + ".",
      steps: [
        q("V<sub>pp</sub> على الشاشة.", "V<sub>pp</sub> =", function (h, v) { return 2 * v.a; }, U.V, eq("V<sub>pp</sub> = 2V<sub>m</sub> = 4 V"), { unitDefault: 1 }),
        q("الزمن الدوري.", "T =", function (h, v) { return 1 / v.f; }, U.S, eq("T = 1/1000 = 1 ms"), { unitDefault: 1 }),
        q("كم قسمًا أفقيًا تأخذ دورة كاملة إذا كان TIME/DIV = 200 µs؟", "", function (h, v) { return 1 / v.f / 200e-6; }, U.NONE, eq("1 ms / 200 µs = 5 أقسام")),
        q("قراءة الملتيميتر على V~.", "V<sub>rms</sub> =", function (h, v) { return v.a / Math.SQRT2; }, U.V, eq("V<sub>rms</sub> = 2/√2 = 1.414 V"), { unitDefault: 1 }),
        q("التردد الزاوي.", "ω =", function (h, v) { return 2 * Math.PI * v.f; }, [{ l: "rad/s", f: 1 }, { l: "krad/s", f: 1e3 }], eq("ω = 2π × 1000 = 6283 rad/s"))
      ] },
    readings: [["V<sub>pp</sub> · T", function (h, v) { return si(2 * v.a, "V") + " · " + si(1 / v.f, "s"); }], ["V<sub>rms</sub>", function (h, v) { return si(v.a / Math.SQRT2, "V"); }]],
    checks: [["تيار المقاومة أقل من 10 mA (قيمة عظمى)", function (h) { return mag(h.el("R").iac) < 0.01; }]],
    measure: [{ id: "vpp", label: "V<sub>pp</sub> من الأوسيلوسكوب", units: U.V, def: 1, f: function (h, v) { return 2 * v.a; } }, { id: "T", label: "الزمن الدوري", units: U.S, def: 1, f: function (h, v) { return 1 / v.f; } }, { id: "vr", label: "قراءة الملتيميتر V~", units: U.V, def: 1, f: function (h, v) { return v.a / Math.SQRT2; } }],
    analyze: function (m) { var o = []; if (m.vpp != null && m.vr != null) o.push("من قياسك " + L("V<sub>pp</sub>/(2√2) = " + si(m.vpp / 2 / Math.SQRT2, "V")) + " ويفترض أن يساوي قراءة الملتيميتر."); return o; },
    causes: ["الملتيميترات الرخيصة دقيقة عند 50–60 Hz فقط؛ عند 1 kHz قد تقرأ أقل. استخدم True RMS.", "دقة قراءة الأقسام على الشاشة."] });

  D({ lesson: "c1-sinusoidal-2", chapter: "sinusoidal", ar: "جمع موجتين بالفيزورات", en: "Adding Two Sine Waves with Phasors", level: "متوسط",
    summary: "قناتا المولد بنفس التردد وطورين مختلفين، تجمعهما بمقاومتين متساويتين، وتتنبأ بالفيزورات بسعة وطور الناتج ثم تقيسهما.",
    idea: "<p>الفيزور عدد مركب يحمل القيمة العظمى والطور: " + L("V<sub>m</sub>∠φ") + ". جمع موجتين بنفس التردد = جمع فيزوريهما، لا جمع قيمتيهما العظميين. بمقاومتين متساويتين إلى نقطة واحدة (بدون حمل) يكون جهد النقطة " + L("(v<sub>1</sub> + v<sub>2</sub>)/2") + ".</p>",
    specs: ["CH1 للمولد: 3 V عظمى، 0°. CH2: 4 V عظمى، 90°، نفس التردد 1 kHz.", "مقاومتان 1 kΩ من القناتين إلى نقطة الجمع.", "أرضيا القناتين على الخط الأزرق."],
    controls: [ctl("a2", "القيمة العظمى لـ CH2", [2, 3, 4], "V", 4), ctl("p2", "طور CH2", [0, 45, 90, 180], "°", 90, ["0°", "45°", "90°", "180°"])],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(3, 1000, { tag: "G1" })], ["R", [1, 0], [1, 1], { value: 1000, tag: "R1" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R2" }], ["GEN", [1, 2], [2, 2], G(v.a2, 1000, { phase: v.p2, tag: "G2" })], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { ch1: [1, 0], ch2: [1, 1] } }; },
    design: { prompt: L("v<sub>1</sub> = 3∠0°") + " و " + L("v<sub>2</sub> = 4∠90°") + " V، وجهد نقطة الجمع " + L("(v<sub>1</sub> + v<sub>2</sub>)/2") + ".",
      steps: [
        q("مقدار v<sub>1</sub> + v<sub>2</sub>.", "|v<sub>1</sub> + v<sub>2</sub>| =", function () { return 5; }, U.V, eq("3 + j4 ← √(3² + 4²) = 5 V"), { unitDefault: 1 }),
        q("القيمة العظمى عند نقطة الجمع.", "|v<sub>S</sub>| =", function (h) { return amp(h, [1, 1]); }, U.V, function (h) { return eq("5/2 = " + si(amp(h, [1, 1]), "V")); }, { unitDefault: 1 }),
        q("طور نقطة الجمع بالنسبة لـ CH1.", "φ =", function (h) { return phs(h, [1, 1]); }, U.DEG, function (h) { return eq("φ = tan⁻¹(4/3) = " + n(phs(h, [1, 1])) + "°"); }),
        choice("لماذا ليست القيمة العظمى (3 + 4)/2 = 3.5 V؟", [{ t: "لأن القمتين لا تحدثان في نفس اللحظة: بينهما 90°", correct: true }, { t: "لأن المقاومتين تستهلكان جزءًا من الجهد", type: "conceptual", why: "لا يمر تيار في الحمل (لا يوجد)؛ الفرق من الطور فقط." }], "الجمع فيزوري: القمتان متباعدتان ربع دورة.")
      ] },
    readings: [["نقطة الجمع", function (h) { return si(amp(h, [1, 1]), "V") + " ∠ " + n(phs(h, [1, 1])) + "°"; }]],
    checks: [["التيار في المقاومتين أقل من 10 mA", function (h) { return mag(h.el("R1").iac) < 0.01; }]],
    measure: [{ id: "a", label: "القيمة العظمى على CH2", units: U.V, def: 1, f: function (h) { return amp(h, [1, 1]); } }, { id: "p", label: "الطور CH2 − CH1", units: U.DEG, f: function (h) { return phs(h, [1, 1]); } }],
    causes: ["مولدات كثيرة تحتاج «محاذاة الطور» (Align Phase) بعد تغيير طور قناة.", "سماحية المقاومتين تجعل الوزنين غير متساويين تمامًا."] });

  D({ lesson: "c1-sinusoidal-3", chapter: "sinusoidal", ar: "معاوقة المكثف والملف عند 1 kHz", en: "Impedance of a Capacitor and an Inductor", level: "متوسط",
    summary: "تقيس تيار المكثف أو الملف بمقاومة استشعار 100 Ω على الأوسيلوسكوب، فتجد مفاعلته وطور تياره بالنسبة لجهده.",
    idea: "<p>في مجال التردد: " + L("Z<sub>R</sub> = R") + "، " + L("Z<sub>L</sub> = jωL") + " (التيار يتأخر 90° عن الجهد)، " + L("Z<sub>C</sub> = 1/(jωC)") + " (التيار يتقدم 90°). المفاعلة تتغير مع التردد: الملف يزيد والمكثف يقل.</p>",
    specs: ["المولد 5 V عظمى، العنصر، ثم مقاومة استشعار 100 Ω إلى الأرضي.", "CH1 على خرج المولد و CH2 على مقاومة الاستشعار (= 100 × التيار)."],
    controls: [ctl("el", "العنصر", [1, 2], "", 1, ["مكثف 1 µF", "ملف 10 mH"]), FGc()],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, v.f, { tag: "G" })], [v.el === 2 ? "L" : "C", [1, 0], [1, 1], { value: v.el === 2 ? 10e-3 : 1e-6, tag: "L1" }], ["R", [1, 1], [2, 1], { value: 100, tag: "Rs" }], ["W", [2, 0], [2, 1]]], probes: { ch1: [1, 0], ch2: [1, 1] } }; },
    design: { prompt: "مكثف " + L("1 µF") + " مع " + L("100 Ω") + " على مولد " + L("5 V") + " عظمى، " + L("1 kHz") + ".",
      steps: [
        q("مفاعلة المكثف.", "|X<sub>C</sub>| =", function () { return 1 / (2 * Math.PI * 1000 * 1e-6); }, U.OHM, eq("1/(2π × 1000 × 10⁻⁶) = 159.2 Ω")),
        q("القيمة العظمى للتيار.", "I<sub>m</sub> =", function (h) { return mag(h.el("Rs").iac); }, U.A, function (h) { return eq("I<sub>m</sub> = 5/|100 − j159.2| = 5/188 = " + si(mag(h.el("Rs").iac), "A")); }, { unitDefault: 1 }),
        q("طور CH2 (التيار) بالنسبة لـ CH1.", "φ =", function (h) { return phs(h, [1, 1]); }, U.DEG, function (h) { return eq("φ = tan⁻¹(159.2/100) = +" + n(phs(h, [1, 1])) + "°") + " (يتقدم)"; }),
        choice("لو ضاعفت التردد، مفاعلة المكثف:", [{ t: "تقل للنصف", correct: true }, { t: "تتضاعف", type: "conceptual", why: "هذا سلوك الملف: X<sub>L</sub> = ωL. للمكثف X<sub>C</sub> = 1/(ωC)." }], L("X<sub>C</sub> = 1/(ωC)"))
      ] },
    readings: [["I<sub>m</sub>", function (h) { return si(mag(h.el("Rs").iac), "A"); }], ["طور التيار", function (h) { return n(phs(h, [1, 1])) + "°"; }], ["|Z| للعنصر", function (h) { return si(mag(h.vac([1, 0], [1, 1])) / mag(h.el("Rs").iac), "Ω"); }]],
    checks: [["التيار أقل من 50 mA عظمى", function (h) { return mag(h.el("Rs").iac) < 0.05; }]],
    measure: [{ id: "a", label: "القيمة العظمى على CH2", units: U.V, def: 1, f: function (h) { return amp(h, [1, 1]); } }, { id: "p", label: "الطور CH2 − CH1", units: U.DEG, f: function (h) { return phs(h, [1, 1]); } }],
    analyze: function (m) { return m.a != null ? ["التيار من قياسك " + L("I<sub>m</sub> = " + si(m.a / 100, "A")) + "."] : []; },
    causes: ["الملف الحقيقي له مقاومة سلك (عشرات الأوم) فطوره أقل من 90°.", "المكثف الإلكتروليتي لا يصلح لإشارة متناوبة؛ استخدم مكثفًا غير قطبي."] });

  D({ lesson: "c1-sinusoidal-4", chapter: "sinusoidal", ar: "KVL في AC: لماذا لا تُجمع القراءات؟", en: "KVL with Phasors: Why Meter Readings Don't Add", level: "متوسط",
    summary: "مقاومة وملف على التوالي من مولد 5 V فعالة: الملتيميتر يقرأ على كل منهما، ومجموع القراءتين أكبر من 5 V. تفسرها بجمع الفيزورات.",
    idea: "<p>KVL صحيح في مجال التردد لكن للفيزورات: " + L("V<sub>s</sub> = V<sub>R</sub> + V<sub>L</sub>") + " عدديًا مركبًا. جهد الملف يتقدم 90° عن جهد المقاومة، فالمقادير تُجمع كأضلاع مثلث قائم: " + L("|V<sub>s</sub>|² = |V<sub>R</sub>|² + |V<sub>L</sub>|²") + ".</p>",
    specs: ["المولد 5 V rms (7.07 V عظمى)، 1 kHz.", "R = 100 Ω و L = 15 mH على التوالي، والملتيميتر على V~."],
    controls: [ctl("l", "L", [10e-3, 15e-3, 22e-3], "H", 15e-3), FGc()],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5 * Math.SQRT2, v.f, { tag: "G" })], ["R", [1, 0], [1, 1], { value: 100, tag: "R" }], ["L", [1, 1], [2, 1], { value: v.l, tag: "L1" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 0], vn: [1, 1] } }; },
    design: { prompt: "مولد " + L("5 V rms") + "، " + L("R = 100 Ω") + "، " + L("L = 15 mH") + "، " + L("f = 1 kHz") + ".",
      steps: [
        q("مفاعلة الملف.", "X<sub>L</sub> =", function () { return 2 * Math.PI * 1000 * 15e-3; }, U.OHM, eq("X<sub>L</sub> = 2π × 1000 × 0.015 = 94.25 Ω")),
        q("قراءة الملتيميتر على R.", "V<sub>R</sub> =", function (h) { return rms(h.el("R").vac); }, U.V, function (h) { return eq("V<sub>R</sub> = 5 × 100/|100 + j94.25| = " + si(rms(h.el("R").vac), "V")); }, { unitDefault: 1 }),
        q("قراءة الملتيميتر على L.", "V<sub>L</sub> =", function (h) { return rms(h.el("L1").vac); }, U.V, function (h) { return eq("V<sub>L</sub> = 5 × 94.25/137.4 = " + si(rms(h.el("L1").vac), "V")); }, { unitDefault: 1 }),
        q("مجموع القراءتين.", "V<sub>R</sub> + V<sub>L</sub> =", function (h) { return rms(h.el("R").vac) + rms(h.el("L1").vac); }, U.V, function (h) { return eq(si(rms(h.el("R").vac) + rms(h.el("L1").vac), "V")) + " > 5 V، لكن " + eq("√(V<sub>R</sub>² + V<sub>L</sub>²) = 5 V"); }, { unitDefault: 1 })
      ] },
    readings: [["V<sub>R</sub> · V<sub>L</sub> (rms)", function (h) { return si(rms(h.el("R").vac), "V") + " · " + si(rms(h.el("L1").vac), "V"); }], ["√(V<sub>R</sub>² + V<sub>L</sub>²)", function (h) { return si(Math.hypot(rms(h.el("R").vac), rms(h.el("L1").vac)), "V"); }]],
    checks: [["KVL الفيزوري يتحقق", function (h) { return Math.abs(Math.hypot(rms(h.el("R").vac), rms(h.el("L1").vac)) - 5) < 1e-3; }], ["التيار أقل من 60 mA rms", function (h) { return rms(h.el("R").iac) < 0.06; }]],
    measure: [{ id: "vr", label: "V<sub>R</sub> (rms)", units: U.V, def: 1, f: function (h) { return rms(h.el("R").vac); } }, { id: "vl", label: "V<sub>L</sub> (rms)", units: U.V, def: 1, f: function (h) { return rms(h.el("L1").vac); } }],
    analyze: function (m) { return m.vr != null && m.vl != null ? ["من قياسك " + L("√(V<sub>R</sub>² + V<sub>L</sub>²) = " + si(Math.hypot(m.vr, m.vl), "V")) + "، والمجموع العادي " + L(si(m.vr + m.vl, "V")) + "."] : []; },
    causes: ["مقاومة سلك الملف تجعل الزاوية بين الجهدين أقل من 90°."] });

  D({ lesson: "c1-sinusoidal-5", chapter: "sinusoidal", ar: "تبسيط معاوقات على التوالي والتوازي", en: "Series–Parallel Impedance", level: "متوسط",
    summary: "مقاومة على التوالي مع ملف ∥ مكثف. تبسط الشبكة إلى معاوقة واحدة، وتتحقق من قيمتها بقياس الجهد والتيار الفعالين.",
    idea: "<p>المعاوقات تُجمع مثل المقاومات لكن بأعداد مركبة: على التوالي " + L("Z = Z<sub>1</sub> + Z<sub>2</sub>") + "، وعلى التوازي " + L("Z = Z<sub>1</sub>Z<sub>2</sub>/(Z<sub>1</sub> + Z<sub>2</sub>)") + ". ملف ∥ مكثف قد يعطي معاوقة حثية أو سعوية حسب التردد.</p>",
    specs: ["المولد 5 V عظمى، أميتر لوحة، R = 100 Ω، ثم L = 10 mH ∥ C = 1 µF."],
    controls: [FGc()],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, v.f, { tag: "G" })], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 100, tag: "R" }], ["L", [1, 2], [2, 2], { value: 10e-3, tag: "L1" }], ["W", [1, 2], [1, 3]], ["C", [1, 3], [2, 3], { value: 1e-6, tag: "C" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]] }; },
    design: { prompt: "عند " + L("1 kHz") + ": " + L("R = 100 Ω") + " ثم " + L("10 mH ∥ 1 µF") + ".",
      steps: [
        q("مفاعلة الملف.", "X<sub>L</sub> =", function () { return 2 * Math.PI * 10; }, U.OHM, eq("2π × 1000 × 0.01 = 62.83 Ω")),
        q("مفاعلة المكثف (مقدارًا).", "|X<sub>C</sub>| =", function () { return 1 / (2 * Math.PI * 1e-3); }, U.OHM, eq("1/(2π × 1000 × 10⁻⁶) = 159.2 Ω")),
        q("الجزء التخيلي لمعاوقة التوازي.", "X<sub>p</sub> =", function () { var xl = 2 * Math.PI * 10, xc = 1 / (2 * Math.PI * 1e-3); return xl * xc / (xc - xl); }, U.OHM, eq("(j62.83)(−j159.2)/(j62.83 − j159.2) = +j103.8 Ω (حثية)")),
        q("مقدار المعاوقة الكلية.", "|Z| =", function (h) { return 5 / mag(h.el("A1").iac); }, U.OHM, function (h) { return eq("|100 + j103.8| = " + si(5 / mag(h.el("A1").iac), "Ω")); }),
        q("القيمة العظمى للتيار.", "I<sub>m</sub> =", function (h) { return mag(h.el("A1").iac); }, U.A, function (h) { return eq("5/|Z| = " + si(mag(h.el("A1").iac), "A")); }, { unitDefault: 1 })
      ] },
    readings: [["|Z|", function (h) { return si(5 / mag(h.el("A1").iac), "Ω"); }], ["زاوية Z", function (h) { return n(-ph(h.el("A1").iac)) + "°"; }], ["I rms", function (h) { return si(rms(h.el("A1").iac), "A"); }]],
    checks: [["التيار أقل من 50 mA عظمى", function (h) { return mag(h.el("A1").iac) < 0.05; }]],
    measure: [{ id: "i", label: "قراءة الأميتر (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("A1").iac); } }],
    analyze: function (m) { return m.i ? ["المعاوقة من قياسك " + L("|Z| = 3.536 V / I = " + si(5 / Math.SQRT2 / m.i, "Ω")) + "."] : []; } });

  D({ lesson: "c1-sinusoidal-6", chapter: "sinusoidal", ar: "مكافئ ثيفنن لشبكة RC", en: "AC Thévenin Equivalent of an RC Network", level: "متقدم",
    summary: "مولد ومقاومة ومكثف: تحسب V<sub>Th</sub> و Z<sub>Th</sub> مركبين عند طرفي المكثف، ثم تتنبأ بجهد حمل 1 kΩ وتقيسه بالأوسيلوسكوب.",
    idea: "<p>ثيفنن ونورتن وتحويل المصدر تنطبق في AC بالمعاوقات: " + L("V<sub>Th</sub> = V<sub>s</sub> Z<sub>C</sub>/(R + Z<sub>C</sub>)") + " و " + L("Z<sub>Th</sub> = R ∥ Z<sub>C</sub>") + ".</p>",
    specs: ["المولد 5 V عظمى 1 kHz، R = 1 kΩ، C = 100 nF، والحمل R<sub>L</sub> على المكثف."],
    controls: [ctl("rl", "R<sub>L</sub>", [470, 1000, 2200, 4700], "Ω", 1000)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["R", [1, 0], [1, 1], { value: 1000, tag: "R" }], ["C", [1, 1], [2, 1], { value: 100e-9, tag: "C" }], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: v.rl, tag: "RL" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { ch1: [1, 0], ch2: [1, 1] } }; },
    design: (function () { var w = 2 * Math.PI * 1000, Zc = Cx.c(0, -1 / (w * 100e-9)), Zr = Cx.c(1000, 0), Vth = Cx.div(Cx.scale(Zc, 5), Cx.add(Zr, Zc)), Zth = Cx.div(Cx.mul(Zr, Zc), Cx.add(Zr, Zc));
      return { prompt: L("V<sub>s</sub> = 5∠0° V") + "، " + L("R = 1 kΩ") + "، " + L("C = 100 nF") + "، " + L("f = 1 kHz") + "، الحمل " + L("1 kΩ") + ".",
      steps: [
        q("مقدار V<sub>Th</sub>.", "|V<sub>Th</sub>| =", function () { return mag(Vth); }, U.V, eq("Z<sub>C</sub> = −j1591.5 Ω ← |V<sub>Th</sub>| = 5 × 1591.5/|1000 − j1591.5| = " + si(mag(Vth), "V")), { unitDefault: 1 }),
        q("طور V<sub>Th</sub>.", "φ =", function () { return ph(Vth); }, U.DEG, eq("∠V<sub>Th</sub> = " + n(ph(Vth)) + "°")),
        q("مقدار Z<sub>Th</sub>.", "|Z<sub>Th</sub>| =", function () { return mag(Zth); }, U.OHM, eq("|1000 ∥ (−j1591.5)| = " + si(mag(Zth), "Ω"))),
        q("القيمة العظمى لجهد الحمل.", "|V<sub>L</sub>| =", function (h) { return amp(h, [1, 1]); }, U.V, function (h) { return eq("|V<sub>Th</sub> × 1000/(Z<sub>Th</sub> + 1000)| = " + si(amp(h, [1, 1]), "V")); }, { unitDefault: 1 })
      ] }; })(),
    readings: [["جهد الحمل", function (h) { return si(amp(h, [1, 1]), "V") + " ∠ " + n(phs(h, [1, 1])) + "°"; }]],
    checks: [["تيار المقاومة أقل من 10 mA عظمى", function (h) { return mag(h.el("R").iac) < 0.01; }]],
    measure: [{ id: "voc", label: "القيمة العظمى على CH2 بدون حمل", units: U.V, def: 1, f: function () { var w = 2 * Math.PI * 1000, Zc = Cx.c(0, -1 / (w * 100e-9)); return mag(Cx.div(Cx.scale(Zc, 5), Cx.add(Cx.c(1000, 0), Zc))); } }, { id: "vl", label: "القيمة العظمى على CH2 مع الحمل", units: U.V, def: 1, f: function (h) { return amp(h, [1, 1]); } }] });

  D({ lesson: "c1-sinusoidal-7", chapter: "sinusoidal", ar: "جهود العقد الفيزورية بالأوسيلوسكوب", en: "Phasor Node Voltages on the Scope", level: "متقدم",
    summary: "شبكة RLC بعقدتين: تحل معادلات العقد بالأعداد المركبة، ثم تقيس مقدار وطور كل عقدة بالنسبة للمولد على CH2.",
    idea: "<p>طريقة العقد في مجال التردد هي نفسها في DC، لكن المقاومات تصبح معاوقات والجهود فيزورات. الأوسيلوسكوب يعطيك الفيزور مباشرة: القيمة العظمى والطور بالنسبة لـ CH1.</p>",
    specs: ["المولد 5 V عظمى 1 kHz، R1 = 100 Ω إلى العقدة 1، C = 2.2 µF منها للأرضي، L = 10 mH بين العقدتين، R2 = 100 Ω من العقدة 2 للأرضي."],
    controls: [FGc()],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, v.f, { tag: "G" })], ["R", [1, 0], [1, 1], { value: 100, tag: "R1" }], ["C", [1, 1], [2, 1], { value: 2.2e-6, tag: "C" }], ["L", [1, 1], [1, 2], { value: 10e-3, tag: "L1" }], ["R", [1, 2], [2, 2], { value: 100, tag: "R2" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { ch1: [1, 0], ch2: [1, 1] } }; },
    design: { prompt: "عند " + L("1 kHz") + ": " + L("Z<sub>C</sub> = −j72.3 Ω") + "، " + L("Z<sub>L</sub> = j62.8 Ω") + ". اكتب KCL للعقدتين بالفيزورات.",
      steps: [
        q("مقدار V<sub>1</sub>.", "|V<sub>1</sub>| =", function (h) { return amp(h, [1, 1]); }, U.V, function (h) { return eq("(V<sub>1</sub> − 5)/100 + V<sub>1</sub>/(−j72.3) + (V<sub>1</sub> − V<sub>2</sub>)/(j62.8) = 0") + " ← " + eq("|V<sub>1</sub>| = " + si(amp(h, [1, 1]), "V")); }, { unitDefault: 1 }),
        q("طور V<sub>1</sub>.", "∠V<sub>1</sub> =", function (h) { return phs(h, [1, 1]); }, U.DEG, function (h) { return eq(n(phs(h, [1, 1])) + "°"); }),
        q("مقدار V<sub>2</sub>.", "|V<sub>2</sub>| =", function (h) { return amp(h, [1, 2]); }, U.V, function (h) { return eq("(V<sub>2</sub> − V<sub>1</sub>)/(j62.8) + V<sub>2</sub>/100 = 0") + " ← " + eq("|V<sub>2</sub>| = " + si(amp(h, [1, 2]), "V")); }, { unitDefault: 1 }),
        q("طور V<sub>2</sub>.", "∠V<sub>2</sub> =", function (h) { return phs(h, [1, 2]); }, U.DEG, function (h) { return eq(n(phs(h, [1, 2])) + "°"); })
      ] },
    readings: [["V<sub>1</sub>", function (h) { return si(amp(h, [1, 1]), "V") + " ∠ " + n(phs(h, [1, 1])) + "°"; }], ["V<sub>2</sub>", function (h) { return si(amp(h, [1, 2]), "V") + " ∠ " + n(phs(h, [1, 2])) + "°"; }]],
    checks: [["تيار المولد أقل من 50 mA عظمى", function (h) { return mag(h.el("R1").iac) < 0.05; }]],
    measure: [{ id: "a1", label: "|V<sub>1</sub>| (CH2 على العقدة 1)", units: U.V, def: 1, f: function (h) { return amp(h, [1, 1]); } }, { id: "p1", label: "طور V<sub>1</sub>", units: U.DEG, f: function (h) { return phs(h, [1, 1]); } }, { id: "a2", label: "|V<sub>2</sub>| (CH2 على العقدة 2)", units: U.V, def: 1, f: function (h) { return amp(h, [1, 2]); } }, { id: "p2", label: "طور V<sub>2</sub>", units: U.DEG, f: function (h) { return phs(h, [1, 2]); } }] });

  D({ lesson: "c1-sinusoidal-8", chapter: "sinusoidal", ar: "تيارات الحلقات الفيزورية", en: "Phasor Mesh Currents", level: "متقدم",
    summary: "حلقتان فيهما R و C و L: تحل معادلتي الحلقتين بالأعداد المركبة، وتقرأ تيار كل حلقة وتيار الفرع المشترك على أميترات اللوحة.",
    idea: "<p>في AC تيار الفرع المشترك = الفرق الفيزوري " + L("I<sub>1</sub> − I<sub>2</sub>") + "، لذلك قراءة أميتره لا تساوي فرق قراءتي الأميترين الآخرين. المقادير لا تُطرح؛ الفيزورات تُطرح.</p>",
    specs: ["المولد 10 V عظمى 1 kHz، R1 = 100 Ω، C = 2.2 µF مشترك، L = 10 mH و R2 = 100 Ω في الحلقة الثانية.", "ثلاثة أميترات لوحة (تقرأ rms)."],
    controls: [FGc()],
    circuit: function (v) { return { ground: [3, 0], edges: [["GEN", [1, 0], [2, 0], G(10, v.f, { tag: "G" })], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 100, tag: "R1" }], ["C", [1, 2], [2, 2], { value: 2.2e-6, tag: "C" }], ["AM", [2, 2], [3, 2], { tag: "AS" }], ["L", [1, 2], [1, 3], { value: 10e-3, tag: "L1" }], ["AM", [1, 3], [1, 4], { tag: "A2" }], ["R", [1, 4], [2, 4], { value: 100, tag: "R2" }], ["W", [2, 4], [3, 4]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]], ["W", [3, 3], [3, 4]]] }; },
    design: { prompt: "عند " + L("1 kHz") + ": " + L("Z<sub>C</sub> = −j72.3 Ω") + "، " + L("Z<sub>L</sub> = j62.8 Ω") + ". التياران مع عقارب الساعة.",
      steps: [
        q("القيمة الفعالة لـ I<sub>1</sub>.", "|I<sub>1</sub>| =", function (h) { return rms(h.el("A1").iac); }, U.A, function (h) { return eq("10 = (100 − j72.3) I<sub>1</sub> + j72.3 I<sub>2</sub>") + "، " + eq("0 = j72.3 I<sub>1</sub> + (100 + j62.8 − j72.3) I<sub>2</sub>") + " ← " + eq("|I<sub>1</sub>| = " + si(rms(h.el("A1").iac), "A") + " rms"); }, { unitDefault: 1 }),
        q("القيمة الفعالة لـ I<sub>2</sub>.", "|I<sub>2</sub>| =", function (h) { return rms(h.el("A2").iac); }, U.A, function (h) { return eq("|I<sub>2</sub>| = " + si(rms(h.el("A2").iac), "A") + " rms"); }, { unitDefault: 1 }),
        q("القيمة الفعالة لتيار الفرع المشترك.", "|I<sub>1</sub> − I<sub>2</sub>| =", function (h) { return rms(h.el("AS").iac); }, U.A, function (h) { return eq("|I<sub>1</sub> − I<sub>2</sub>| = " + si(rms(h.el("AS").iac), "A")) + " ≠ " + eq("|I<sub>1</sub>| − |I<sub>2</sub>|"); }, { unitDefault: 1 })
      ] },
    readings: [["A1 · A2 · المشترك (rms)", function (h) { return si(rms(h.el("A1").iac), "A") + " · " + si(rms(h.el("A2").iac), "A") + " · " + si(rms(h.el("AS").iac), "A"); }]],
    checks: [["التيارات أقل من 100 mA عظمى", function (h) { return mag(h.el("A1").iac) < 0.1; }]],
    measure: [{ id: "i1", label: "A1 (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("A1").iac); } }, { id: "i2", label: "A2 (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("A2").iac); } }, { id: "is", label: "أميتر الفرع المشترك (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("AS").iac); } }] });

  D({ lesson: "c1-sinusoidal-9", chapter: "sinusoidal", ar: "مخطط الفيزورات لدائرة RC", en: "Phasor Diagram of an RC Circuit", level: "متوسط",
    summary: "تقيس جهدي المقاومة والمكثف بالأوسيلوسكوب، وترسم مخطط الفيزورات: الجهدان متعامدان ومجموعهما الفيزوري جهد المولد.",
    idea: "<p>مخطط الفيزورات يرسم الجهود والتيارات كأسهم في المستوى المركب. في RC على التوالي: جهد المقاومة مع التيار، وجهد المكثف يتأخر 90° عنه، والمجموع الفيزوري = جهد المصدر.</p>",
    specs: ["المولد 5 V عظمى 1 kHz، R = 1 kΩ و C = 220 nF على التوالي.", "CH1 على المولد، CH2 على المكثف."],
    controls: [ctl("c", "C", [100e-9, 220e-9, 470e-9], "F", 220e-9)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["R", [1, 0], [1, 1], { value: 1000, tag: "R" }], ["C", [1, 1], [2, 1], { value: v.c, tag: "C" }], ["W", [2, 0], [2, 1]]], probes: { ch1: [1, 0], ch2: [1, 1] } }; },
    design: { prompt: L("R = 1 kΩ") + "، " + L("C = 220 nF") + "، " + L("f = 1 kHz") + "، " + L("V<sub>s</sub> = 5∠0° V") + ".",
      steps: [
        q("القيمة العظمى لجهد R.", "|V<sub>R</sub>| =", function (h) { return mag(h.el("R").vac); }, U.V, function (h) { return eq("X<sub>C</sub> = 723.4 Ω ← |V<sub>R</sub>| = 5 × 1000/|1000 − j723.4| = " + si(mag(h.el("R").vac), "V")); }, { unitDefault: 1 }),
        q("القيمة العظمى لجهد C.", "|V<sub>C</sub>| =", function (h) { return mag(h.el("C").vac); }, U.V, function (h) { return eq("|V<sub>C</sub>| = 5 × 723.4/1234.2 = " + si(mag(h.el("C").vac), "V")); }, { unitDefault: 1 }),
        q("طور V<sub>C</sub> بالنسبة للمولد.", "∠V<sub>C</sub> =", function (h) { return phs(h, [1, 1]); }, U.DEG, function (h) { return eq(n(phs(h, [1, 1])) + "°"); }),
        q("الزاوية بين V<sub>R</sub> و V<sub>C</sub>.", "Δφ =", function (h) { return wrap(ph(h.el("R").vac) - ph(h.el("C").vac)); }, U.DEG, eq("90°: جهد المكثف يتأخر ربع دورة عن تياره، وجهد المقاومة مع التيار"))
      ] },
    readings: [["V<sub>R</sub> · V<sub>C</sub>", function (h) { return si(mag(h.el("R").vac), "V") + " · " + si(mag(h.el("C").vac), "V"); }], ["√(V<sub>R</sub>² + V<sub>C</sub>²)", function (h) { return si(Math.hypot(mag(h.el("R").vac), mag(h.el("C").vac)), "V"); }]],
    checks: [["المجموع الفيزوري = 5 V", function (h) { return Math.abs(Math.hypot(mag(h.el("R").vac), mag(h.el("C").vac)) - 5) < 1e-3; }]],
    measure: [{ id: "vc", label: "|V<sub>C</sub>| على CH2", units: U.V, def: 1, f: function (h) { return mag(h.el("C").vac); } }, { id: "pc", label: "طور V<sub>C</sub>", units: U.DEG, f: function (h) { return phs(h, [1, 1]); } }],
    analyze: function (m) { return m.vc != null ? ["ارسم سهم V<sub>s</sub> أفقيًا بطول 5، وسهم V<sub>C</sub> بطول " + L(si(m.vc, "V")) + " وزاويته المقاسة. الفرق بينهما سهم V<sub>R</sub>، ويفترض أن يكون عموديًا على V<sub>C</sub>."] : []; } });

  /* ================= الفصل 6: القدرة في الحالة المستقرة الجيبية ================= */
  var Sof = function (x) { return Cx.scale(Cx.mul(x.vac, Cx.conj(x.iac)), 0.5); };
  D({ lesson: "c1-power-1", chapter: "power", ar: "القدرة اللحظية لحمل حثي", en: "Instantaneous Power of an RL Load", level: "متوسط",
    summary: "تعرض جهد الحمل وتياره على الأوسيلوسكوب، وتحسب القدرة اللحظية p(t) = v(t)i(t): تتذبذب بضعف التردد وتصبح سالبة لحظات، أي أن الملف يعيد طاقة للمولد.",
    idea: "<p>مع " + L("v = V<sub>m</sub>cos ωt") + " و " + L("i = I<sub>m</sub>cos(ωt − θ)") + ": " + L("p(t) = (V<sub>m</sub>I<sub>m</sub>/2)cos θ + (V<sub>m</sub>I<sub>m</sub>/2)cos(2ωt − θ)") + ". القيمة المتوسطة ثابتة، والجزء المتغير بتردد " + L("2f") + ". مع ملف تنزل p تحت الصفر: الطاقة المخزنة في المجال المغناطيسي ترجع للمصدر.</p>",
    specs: ["المولد 5 V عظمى 1 kHz على L = 15 mH و R = 100 Ω على التوالي.", "CH1 على المولد (جهد الحمل)، CH2 على R (= 100 × التيار)."],
    controls: [ctl("l", "L", [10e-3, 15e-3, 22e-3], "H", 15e-3)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["L", [1, 0], [1, 1], { value: v.l, tag: "L1" }], ["R", [1, 1], [2, 1], { value: 100, tag: "R" }], ["W", [2, 0], [2, 1]]], probes: { ch1: [1, 0], ch2: [1, 1] } }; },
    design: (function () { var Z = Cx.c(100, 2 * Math.PI * 1000 * 15e-3), Im = 5 / mag(Z), th = ph(Z) * Math.PI / 180;
      return { prompt: L("V<sub>m</sub> = 5 V") + "، " + L("R = 100 Ω") + "، " + L("L = 15 mH") + "، " + L("f = 1 kHz") + ".",
      steps: [
        q("القيمة العظمى للتيار.", "I<sub>m</sub> =", function () { return Im; }, U.A, eq("I<sub>m</sub> = 5/|100 + j94.25| = " + si(Im, "A")), { unitDefault: 1 }),
        q("زاوية الحمل θ.", "θ =", function () { return th * 180 / Math.PI; }, U.DEG, eq("θ = tan⁻¹(94.25/100) = " + n(th * 180 / Math.PI) + "°")),
        q("القدرة المتوسطة.", "P =", function () { return 5 * Im / 2 * Math.cos(th); }, U.W, eq("P = (5 × I<sub>m</sub>/2) cos θ = " + si(5 * Im / 2 * Math.cos(th), "W"))),
        q("أصغر قيمة للقدرة اللحظية.", "p<sub>min</sub> =", function () { return 5 * Im / 2 * (Math.cos(th) - 1); }, U.W, eq("p<sub>min</sub> = (V<sub>m</sub>I<sub>m</sub>/2)(cos θ − 1) = " + si(5 * Im / 2 * (Math.cos(th) - 1), "W")) + " (سالبة)"),
        q("تردد تذبذب القدرة اللحظية.", "f<sub>p</sub> =", function () { return 2000; }, U.HZ, eq("2f = 2 kHz"), { unitDefault: 1 })
      ] }; })(),
    readings: [["I<sub>m</sub>", function (h) { return si(mag(h.el("R").iac), "A"); }], ["P", function (h) { return si(Sof(h.el("R")).re, "W"); }], ["p<sub>min</sub>", function (h) { var Im = mag(h.el("R").iac), th = -phs(h, [1, 1]) * Math.PI / 180; return si(5 * Im / 2 * (Math.cos(th) - 1), "W"); }]],
    checks: [["التيار أقل من 50 mA عظمى", function (h) { return mag(h.el("R").iac) < 0.05; }]],
    measure: [{ id: "a2", label: "القيمة العظمى على CH2", units: U.V, def: 1, f: function (h) { return amp(h, [1, 1]); } }, { id: "p", label: "الطور CH2 − CH1", units: U.DEG, f: function (h) { return phs(h, [1, 1]); } }],
    analyze: function (m) { if (m.a2 == null || m.p == null) return []; var Im = m.a2 / 100, th = -m.p * Math.PI / 180; return ["من قياسك: " + L("P = " + si(5 * Im / 2 * Math.cos(th), "W")) + " و " + L("p<sub>min</sub> = " + si(5 * Im / 2 * (Math.cos(th) - 1), "W")) + ". في أوسيلوسكوب حقيقي جرّب وضع MATH (CH1 × CH2) لترى p(t)."]; } });

  D({ lesson: "c1-power-2", chapter: "power", ar: "القدرة المتوسطة والردية لمحرك صغير", en: "Average and Reactive Power of a Small Motor Model", level: "متوسط",
    summary: "نموذج محرك صغير (مقاومة وملف): تحسب P التي تتحول لشغل وحرارة، و Q التي تتردد بين المولد والملف، وتتحقق منهما بالقياس.",
    idea: "<p>" + L("P = ½V<sub>m</sub>I<sub>m</sub>cos(θ<sub>v</sub> − θ<sub>i</sub>)") + " تستهلكها المقاومة فقط، و " + L("Q = ½V<sub>m</sub>I<sub>m</sub>sin(θ<sub>v</sub> − θ<sub>i</sub>)") + " يتبادلها الملف. بالقيم الفعالة: " + L("P = I<sub>rms</sub>²R") + " و " + L("Q = I<sub>rms</sub>²X<sub>L</sub>") + ".</p>",
    specs: ["المولد 5 V عظمى 1 kHz على R = 68 Ω و L = 10 mH.", "الملتيميتر على R (V~) لقياس التيار الفعال."],
    controls: [ctl("r", "R", [47, 68, 100], "Ω", 68), ctl("l", "L", [10e-3, 15e-3], "H", 10e-3)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["L", [1, 0], [1, 1], { value: v.l, tag: "L1" }], ["R", [1, 1], [2, 1], { value: v.r, tag: "R" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 1], vn: [2, 1] } }; },
    design: { prompt: L("V<sub>m</sub> = 5 V") + "، " + L("R = 68 Ω") + "، " + L("L = 10 mH") + "، " + L("f = 1 kHz") + ".",
      steps: [
        q("التيار الفعال.", "I<sub>rms</sub> =", function (h) { return rms(h.el("R").iac); }, U.A, function (h) { return eq("I<sub>rms</sub> = (5/√2)/|68 + j62.83| = " + si(rms(h.el("R").iac), "A")); }, { unitDefault: 1 }),
        q("القدرة المتوسطة.", "P =", function (h) { return Sof(h.el("R")).re; }, U.W, function (h) { return eq("P = I<sub>rms</sub>² × 68 = " + si(Sof(h.el("R")).re, "W")); }),
        q("القدرة الردية.", "Q =", function (h) { return Sof(h.el("L1")).im; }, U.VAR, function (h) { return eq("Q = I<sub>rms</sub>² × 62.83 = " + si(Sof(h.el("L1")).im, "VAR")); })
      ] },
    readings: [["P", function (h) { return si(Sof(h.el("R")).re, "W"); }], ["Q", function (h) { return si(Sof(h.el("L1")).im, "VAR"); }], ["معامل القدرة", function (h) { var s = Sof(h.el("G")); return n(Math.abs(s.re) / mag(s)); }]],
    checks: [["قدرة المقاومة أقل من 125 mW", function (h) { return Sof(h.el("R")).re < 0.125; }]],
    measure: [{ id: "vr", label: "V<sub>R</sub> (rms)", units: U.V, def: 1, f: function (h) { return rms(h.el("R").vac); } }],
    analyze: function (m, v) { if (m.vr == null) return []; var I = m.vr / v.r, X = 2 * Math.PI * 1000 * v.l; return ["من قياسك " + L("I = " + si(I, "A")) + "، " + L("P = " + si(I * I * v.r, "W")) + "، " + L("Q = " + si(I * I * X, "VAR")) + "."]; } });

  var WAVES = { 1: ["جيبية", 1 / Math.SQRT2], 2: ["مربعة", 1], 3: ["مثلثية", 1 / Math.sqrt(3)] };
  D({ lesson: "c1-power-3", chapter: "power", ar: "القيمة الفعالة لأشكال موجية مختلفة", en: "RMS of Different Waveforms", level: "متوسط",
    summary: "تغذي مقاومة 100 Ω بموجة جيبية ثم مربعة ثم مثلثية بنفس القيمة العظمى، وتقيس القيمة الفعالة بملتيميتر True RMS وتحسب القدرة المتوسطة لكل منها.",
    idea: "<p>القيمة الفعالة " + L("V<sub>rms</sub> = √(1/T ∫v²dt)") + " هي الجهد المستمر الذي يعطي نفس الحرارة في مقاومة: " + L("P = V<sub>rms</sub>²/R") + ". للجيبية " + L("V<sub>m</sub>/√2") + "، للمربعة " + L("V<sub>m</sub>") + "، للمثلثية " + L("V<sub>m</sub>/√3") + ".</p>",
    specs: ["المولد بقيمة عظمى 3 V، 1 kHz، على مقاومة 100 Ω.", "الملتيميتر True RMS على V~، والأوسيلوسكوب على المقاومة."],
    controls: [ctl("w", "شكل الموجة", [1, 2, 3], "", 1, ["جيبية", "مربعة", "مثلثية"]), ctl("a", "القيمة العظمى", [1, 2, 3, 4], "V", 3)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(v.a, 1000, { tag: "G", wave: { 1: "sine", 2: "square", 3: "triangle" }[v.w] })], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 100, tag: "R" }], ["W", [2, 0], [2, 1]]], probes: { vp: [1, 1], vn: [2, 1], ch1: [1, 1] } }; },
    design: { prompt: "قيمة عظمى " + L("3 V") + " على " + L("100 Ω") + ".",
      steps: [
        q("V<sub>rms</sub> للجيبية.", "", function () { return 3 / Math.SQRT2; }, U.V, eq("3/√2 = 2.121 V"), { unitDefault: 1 }),
        q("V<sub>rms</sub> للمربعة.", "", function () { return 3; }, U.V, eq("v² = 9 طوال الوقت ← V<sub>rms</sub> = 3 V"), { unitDefault: 1 }),
        q("V<sub>rms</sub> للمثلثية.", "", function () { return 3 / Math.sqrt(3); }, U.V, eq("3/√3 = 1.732 V"), { unitDefault: 1 }),
        q("القدرة المتوسطة في المقاومة مع المربعة.", "P =", function () { return 0.09; }, U.W, eq("P = 3²/100 = 90 mW (ضعف الجيبية)"))
      ] },
    readings: [["V<sub>rms</sub>", function (h, v) { return si(v.a * WAVES[v.w][1], "V") + " (" + WAVES[v.w][0] + ")"; }], ["P", function (h, v) { return si(Math.pow(v.a * WAVES[v.w][1], 2) / 100, "W"); }]],
    checks: [["قدرة المقاومة أقل من 125 mW", function (h, v) { return Math.pow(v.a * WAVES[v.w][1], 2) / 100 < 0.125; }]],
    measure: [{ id: "vr", label: "قراءة الملتيميتر (True RMS)", units: U.V, def: 1, f: function (h, v) { return v.a * WAVES[v.w][1]; } }, { id: "vpp", label: "V<sub>pp</sub> على الأوسيلوسكوب", units: U.V, def: 1, f: function (h, v) { return 2 * v.a; } }],
    analyze: function (m) { return m.vr != null && m.vpp ? ["معامل القمة من قياسك " + L("V<sub>m</sub>/V<sub>rms</sub> = " + n(m.vpp / 2 / m.vr)) + " (جيبية √2 ≈ 1.414، مربعة 1، مثلثية √3 ≈ 1.732)."] : []; },
    causes: ["ملتيميتر ليس True RMS يفترض موجة جيبية، فيخطئ مع المربعة والمثلثية.", "الموجة المربعة الحقيقية لها زمن صعود محدود."] });

  D({ lesson: "c1-power-4", chapter: "power", ar: "القدرة المركبة ومثلث القدرة", en: "Complex Power and the Power Triangle", level: "متوسط",
    summary: "لحمل RL تحسب القدرة المركبة S = P + jQ ومقدارها ومعامل القدرة، وترسم مثلث القدرة من قياسات الجهد والتيار.",
    idea: "<p>القدرة المركبة " + L("S = ½ V I* = P + jQ") + "، ومقدارها القدرة الظاهرية " + L("|S| = V<sub>rms</sub>I<sub>rms</sub>") + " (VA). معامل القدرة " + L("pf = P/|S| = cos θ") + ". الأضلاع P و Q و |S| تكوّن مثلثًا قائمًا.</p>",
    specs: ["المولد 5 V عظمى 1 kHz على R = 100 Ω و L = 15 mH.", "أميتر لوحة على الخط، والملتيميتر على الحمل كله (V~)."],
    controls: [ctl("l", "L", [10e-3, 15e-3, 22e-3], "H", 15e-3)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 100, tag: "R" }], ["L", [1, 2], [2, 2], { value: v.l, tag: "L1" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { vp: [1, 1], vn: [2, 2] } }; },
    design: { prompt: L("V<sub>m</sub> = 5 V") + "، " + L("R = 100 Ω") + "، " + L("L = 15 mH (X = 94.25 Ω)") + ".",
      steps: [
        q("القدرة المتوسطة P.", "P =", function (h) { return -Sof(h.el("G")).re; }, U.W, function (h) { return eq("I<sub>rms</sub> = 3.536/137.4 = 25.73 mA ← P = I² × 100 = " + si(-Sof(h.el("G")).re, "W")); }),
        q("القدرة الردية Q.", "Q =", function (h) { return -Sof(h.el("G")).im; }, U.VAR, function (h) { return eq("Q = I² × 94.25 = " + si(-Sof(h.el("G")).im, "VAR")); }),
        q("القدرة الظاهرية.", "|S| =", function (h) { return mag(Sof(h.el("G"))); }, U.VA, function (h) { return eq("|S| = √(P² + Q²) = V<sub>rms</sub>I<sub>rms</sub> = " + si(mag(Sof(h.el("G"))), "VA")); }),
        q("معامل القدرة.", "pf =", function (h) { var s = Sof(h.el("G")); return Math.abs(s.re) / mag(s); }, U.NONE, function (h) { var s = Sof(h.el("G")); return eq("pf = P/|S| = " + n(Math.abs(s.re) / mag(s)) + " (متأخر)"); })
      ] },
    readings: [["S = P + jQ", function (h) { var s = Sof(h.el("G")); return si(-s.re, "W") + " + j" + si(-s.im, "VAR"); }], ["|S|", function (h) { return si(mag(Sof(h.el("G"))), "VA"); }]],
    checks: [["قدرة المقاومة أقل من 125 mW", function (h) { return Sof(h.el("R")).re < 0.125; }]],
    measure: [{ id: "v", label: "جهد الحمل (rms)", units: U.V, def: 1, f: function () { return 5 / Math.SQRT2; } }, { id: "i", label: "تيار الخط (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("A1").iac); } }],
    analyze: function (m) { return m.v != null && m.i != null ? ["القدرة الظاهرية من قياسك " + L("|S| = V × I = " + si(m.v * m.i, "VA")) + ". الملتيميتر لا يعطي P مباشرة؛ تحتاج الزاوية من الأوسيلوسكوب أو واطميتر."] : []; } });

  D({ lesson: "c1-power-5", chapter: "power", ar: "حسابات القدرة لحملين على التوازي", en: "Power in Two Parallel Loads", level: "متوسط",
    summary: "حمل مقاومي وحمل حثي على نفس الخط: تحسب P و Q لكل حمل، وتتحقق أن القدرة الكلية مجموعهما (حفظ القدرة المركبة)، مع أن التيارات الفعالة لا تُجمع.",
    idea: "<p>القدرة المركبة محفوظة: " + L("S<sub>total</sub> = S<sub>1</sub> + S<sub>2</sub>") + "، أي P تُجمع و Q تُجمع. أما القيم الفعالة للتيارات فلا تُجمع مباشرة لأن التيارات فيزورات بأطوار مختلفة.</p>",
    specs: ["المولد 5 V عظمى 1 kHz، أميتر على الخط.", "الحمل 1: R1 = 220 Ω. الحمل 2: R2 = 100 Ω مع L = 15 mH."],
    controls: [ctl("r1", "R1", [150, 220, 330], "Ω", 220)],
    circuit: function (v) { return { ground: [3, 0], edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "AL" }], ["R", [1, 1], [2, 1], { value: v.r1, tag: "R1" }], ["W", [2, 1], [3, 1]], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: 100, tag: "R2" }], ["L", [2, 2], [3, 2], { value: 15e-3, tag: "L1" }], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]]] }; },
    design: { prompt: L("V<sub>m</sub> = 5 V") + " (3.536 V rms)، " + L("R1 = 220 Ω") + " ∥ " + L("(100 + j94.25) Ω") + ".",
      steps: [
        q("P للحمل 1.", "P<sub>1</sub> =", function (h) { return Sof(h.el("R1")).re; }, U.W, function (h) { return eq("P<sub>1</sub> = 3.536²/220 = " + si(Sof(h.el("R1")).re, "W")); }),
        q("P للحمل 2.", "P<sub>2</sub> =", function (h) { return Sof(h.el("R2")).re; }, U.W, function (h) { return eq("I<sub>2</sub> = 3.536/137.4 ← P<sub>2</sub> = I<sub>2</sub>² × 100 = " + si(Sof(h.el("R2")).re, "W")); }),
        q("Q الكلية.", "Q =", function (h) { return Sof(h.el("L1")).im; }, U.VAR, function (h) { return eq("Q = I<sub>2</sub>² × 94.25 = " + si(Sof(h.el("L1")).im, "VAR")); }),
        q("تيار الخط الفعال.", "I<sub>L</sub> =", function (h) { return rms(h.el("AL").iac); }, U.A, function (h) { return eq("|S|/V<sub>rms</sub> = √(P² + Q²)/3.536 = " + si(rms(h.el("AL").iac), "A")); }, { unitDefault: 1 })
      ] },
    readings: [["P<sub>1</sub> + P<sub>2</sub>", function (h) { return si(Sof(h.el("R1")).re + Sof(h.el("R2")).re, "W"); }], ["P من المولد", function (h) { return si(-Sof(h.el("G")).re, "W"); }], ["تيار الخط", function (h) { return si(rms(h.el("AL").iac), "A"); }]],
    checks: [["حفظ القدرة: P المولد = P<sub>1</sub> + P<sub>2</sub>", function (h) { return Math.abs(-Sof(h.el("G")).re - Sof(h.el("R1")).re - Sof(h.el("R2")).re) < 1e-6; }]],
    measure: [{ id: "il", label: "تيار الخط (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("AL").iac); } }, { id: "v1", label: "جهد R1 (rms)", units: U.V, def: 1, f: function () { return 5 / Math.SQRT2; } }, { id: "v2", label: "جهد R2 (rms)", units: U.V, def: 1, f: function (h) { return rms(h.el("R2").vac); } }],
    analyze: function (m, v) { if (m.v1 == null || m.v2 == null || m.il == null) return []; var i1 = m.v1 / v.r1, i2 = m.v2 / 100; return ["من قياسك " + L("I<sub>1</sub> + I<sub>2</sub> = " + si(i1 + i2, "A")) + " (جمع عادي) مقابل تيار الخط " + L(si(m.il, "A")) + ": التيارات فيزورات."]; } });

  D({ lesson: "c1-power-6", chapter: "power", ar: "مطابقة حمل لمولد حقيقي (أقصى قدرة في AC)", en: "Conjugate Matching to a Real Generator", level: "متقدم",
    summary: "مولد الإشارة له مقاومة خرج 50 Ω حقيقية، ومعه ملف 8 mH: تصمم حملًا (مقاومة + مكثف) يساوي المرافق المركب لمعاوقة المصدر فيأخذ أقصى قدرة.",
    idea: "<p>في AC يأخذ الحمل أقصى قدرة عندما " + L("Z<sub>L</sub> = Z<sub>Th</sub>*") + ": الجزء الحقيقي نفسه والتخيلي معكوس الإشارة، فتُلغى المفاعلتان. القدرة العظمى " + L("|V<sub>Th</sub>|²/(8R<sub>Th</sub>)") + " بالقيم العظمى.</p>",
    specs: ["المولد 5 V عظمى (دون حمل) بمقاومة خرجه الحقيقية 50 Ω، 1 kHz، ومعه L = 8 mH على التوالي.", "الحمل: R<sub>L</sub> مع C على التوالي.", "القدرة أكثر من 95% من القدرة العظمى."],
    controls: [ctl("rl", "R<sub>L</sub>", [33, 39, 47, 56, 68], "Ω", 47), ctl("c", "C", [1e-6, 2.2e-6, 3.3e-6, 4.7e-6], "F", 3.3e-6)],
    circuit: function (v) { return { edges: [["GEN", [1, 0], [2, 0], G(5, 1000, { rs: 50, tag: "G" })], ["L", [1, 0], [1, 1], { value: 8e-3, tag: "Ls" }], ["C", [1, 1], [1, 2], { value: v.c, tag: "C" }], ["R", [1, 2], [2, 2], { value: v.rl, tag: "RL" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], probes: { ch1: [1, 0], ch2: [1, 2] } }; },
    design: (function () { var X = 2 * Math.PI * 1000 * 8e-3, C = 1 / (2 * Math.PI * 1000 * X);
      return { prompt: L("Z<sub>Th</sub> = 50 + j2π(1000)(0.008) Ω") + "، " + L("V<sub>Th</sub> = 5 V") + " عظمى.",
      steps: [
        q("مفاعلة المصدر.", "X<sub>Th</sub> =", function () { return X; }, U.OHM, eq("X = 2π × 1000 × 0.008 = 50.27 Ω")),
        q("المكثف الذي يلغيها.", "C =", function () { return C; }, U.F, eq("C = 1/(ωX) = " + si(C, "F")), { unitDefault: 1 }),
        q("مقاومة الحمل المثالية.", "R<sub>L</sub> =", function () { return 50; }, U.OHM, eq("R<sub>L</sub> = R<sub>Th</sub> = 50 Ω")),
        q("القدرة العظمى في الحمل.", "P<sub>max</sub> =", function () { return 25 / 400; }, U.W, eq("P = 5²/(8 × 50) = 62.5 mW"))
      ] }; })(),
    readings: [["قدرة الحمل", function (h) { return si(Sof(h.el("RL")).re, "W"); }], ["نسبتها من 62.5 mW", function (h) { return Math.round(Sof(h.el("RL")).re / 0.0625 * 1000) / 10 + "%"; }]],
    checks: [["القدرة أكثر من 95% من القدرة العظمى", function (h) { return Sof(h.el("RL")).re >= 0.95 * 0.0625; }]],
    measure: [{ id: "a", label: "القيمة العظمى على R<sub>L</sub> (CH2)", units: U.V, def: 1, f: function (h) { return mag(h.el("RL").vac); } }],
    analyze: function (m, v) { return m.a != null ? ["القدرة من قياسك " + L("V<sub>m</sub>²/(2R<sub>L</sub>) = " + si(m.a * m.a / 2 / v.rl, "W")) + "."] : []; },
    causes: ["مقاومة سلك الملف تُضاف لـ R<sub>Th</sub>.", "مقاومة خرج المولد 50 Ω اسمية."] });

  D({ lesson: "c1-power-7", chapter: "power", ar: "تصحيح معامل القدرة لنموذج محرك", en: "Power-Factor Correction of a Motor Model", level: "متقدم",
    summary: "نموذج محرك (47 Ω + 10 mH) معامل قدرته منخفض. تختار مكثفًا على التوازي يرفعه إلى 0.95 أو أكثر، فينخفض تيار الخط وتبقى القدرة المتوسطة نفسها.",
    idea: "<p>الأحمال الحثية تسحب قدرة ردية تكبّر تيار الخط بدون شغل مفيد. مكثف على التوازي يعطي قدرة ردية معاكسة " + L("Q<sub>C</sub> = −V<sub>rms</sub>²ωC") + "، فتقل Q الكلية ويقترب معامل القدرة من 1. هذا ما تفعله بنوك المكثفات في المصانع على 220/380 V، وهنا نجربه مصغرًا وبأمان على مولد إشارة.</p>",
    specs: ["المولد 5 V عظمى 1 kHz، أميتر على الخط.", "المحرك: R = 47 Ω و L = 10 mH على التوالي.", "مكثف على التوازي مع المحرك: معامل القدرة ≥ 0.95."],
    controls: [ctl("c", "مكثف التصحيح", [0, 0.47e-6, 1e-6, 1.5e-6, 2.2e-6], "F", 1.5e-6, ["بدون مكثف", "0.47 µF", "1 µF", "1.5 µF", "2.2 µF"])],
    circuit: function (v) { var e = [["GEN", [1, 0], [2, 0], G(5, 1000, { tag: "G" })], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "AL" }], ["R", [1, 1], [2, 1], { value: 47, tag: "M" }], ["L", [2, 1], [3, 1], { value: 10e-3, tag: "L1" }], ["W", [3, 0], [3, 1]]]; if (v.c > 0) e.push(["W", [1, 1], [1, 2]], ["C", [1, 2], [2, 2], { value: v.c, tag: "C" }], ["W", [2, 2], [3, 2]], ["W", [3, 1], [3, 2]]); return { ground: [3, 0], edges: e }; },
    design: (function () { var w = 2 * Math.PI * 1000, Z = Cx.c(47, w * 0.01), Y = Cx.div(Cx.c(1, 0), Z), pf0 = Math.cos(ph(Z) * Math.PI / 180), C1 = -Y.im / w, C95 = (-Y.im - Y.re * Math.tan(Math.acos(0.95))) / w;
      return { prompt: "المحرك " + L("47 + j62.83 Ω") + " عند " + L("1 kHz") + ".",
      steps: [
        q("معامل القدرة بدون مكثف.", "pf =", function () { return pf0; }, U.NONE, eq("pf = cos(tan⁻¹(62.83/47)) = " + n(pf0))),
        q("المكثف الذي يجعل pf = 1.", "C =", function () { return C1; }, U.F, eq("B<sub>C</sub> = −Im(1/Z) = " + si(-Y.im, "S") + " ← C = B<sub>C</sub>/ω = " + si(C1, "F")), { unitDefault: 1 }),
        q("أصغر مكثف يعطي pf = 0.95.", "C =", function () { return C95; }, U.F, eq("C = (B − G tan(cos⁻¹0.95))/ω = " + si(C95, "F")), { unitDefault: 1 }),
        choice("بعد التصحيح، القدرة المتوسطة التي يأخذها المحرك:", [{ t: "لا تتغير، ويقل تيار الخط", correct: true }, { t: "تزيد لأن المكثف يعطي قدرة", type: "conceptual", why: "المكثف لا يستهلك ولا يعطي قدرة متوسطة؛ يغير Q فقط." }], "جهد المحرك لم يتغير فقدرته نفسها؛ الذي قل هو تيار الخط.")
      ] }; })(),
    readings: [["معامل القدرة", function (h) { var s = Sof(h.el("G")); return n(Math.round(Math.abs(s.re) / mag(s) * 1000) / 1000); }], ["تيار الخط (rms)", function (h) { return si(rms(h.el("AL").iac), "A"); }], ["P المحرك", function (h) { return si(Sof(h.el("M")).re, "W"); }]],
    checks: [["معامل القدرة 0.95 أو أكثر", function (h) { var s = Sof(h.el("G")); return Math.abs(s.re) / mag(s) >= 0.95; }]],
    measure: [{ id: "il", label: "تيار الخط (rms)", units: U.A, def: 1, f: function (h) { return rms(h.el("AL").iac); } }, { id: "vm", label: "جهد R المحرك (rms)", units: U.V, def: 1, f: function (h) { return rms(h.el("M").vac); } }],
    analyze: function (m) { return m.il != null && m.vm != null ? ["P المحرك من قياسك " + L(si(m.vm * m.vm / 47, "W")) + "، وعامل القدرة " + L("P/(V × I) = " + n(m.vm * m.vm / 47 / (5 / Math.SQRT2 * m.il))) + "."] : []; },
    safety: ["هذه نسخة مصغرة آمنة على مولد إشارة. لا تجرّب تصحيح معامل القدرة على كهرباء المنزل."] });
})();
