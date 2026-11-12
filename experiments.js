/* CircuitVision — guided lab experiments, one per Circuits 1 lesson (lab.html#exp-<lessonId>).
   Each experiment loads a circuit and walks the student through steps:
     do  — an action the lab checks automatically (place a meter, change a value, add a part)
     ask — read a meter and type the value; it is compared with the engine's solution of the circuit as it is now
     rec — record points (x, y) from the live circuit and see them plotted
   Experiments the lab cannot run honestly yet (dependent sources, distributed effects) are listed in UNAVAILABLE. */
(function () {
  "use strict";
  var CV = (typeof window !== "undefined" ? window : globalThis).CV, Cx = CV.ac.C, si = function (v, u) { return CV.ac.si(v, u); };
  var V = [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }], A = [{ l: "µA", f: 1e-6 }, { l: "mA", f: 1e-3 }, { l: "A", f: 1 }], W = [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }];
  var OHM = [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }], DEG = [{ l: "°", f: 1 }], MS = [{ l: "ms", f: 1e-3 }, { l: "s", f: 1 }], VAR = [{ l: "mVAR", f: 1e-3 }, { l: "VAR", f: 1 }], NONE = [{ l: "—", f: 1 }], S_ = [{ l: "mS", f: 1e-3 }, { l: "S", f: 1 }];

  function lab(edges, o) {
    o = o || {}; var id = 0;
    return { rows: 7, cols: 7, arduino: false, ground: o.ground || [2, 0], env: { light: 50, temp: 25 }, probes: Object.assign({ vp: null, vn: null, ch1: null, ch2: null }, o.probes || {}),
      edges: (function () { var out = edges.map(function (e) { var x = { id: "x" + (++id), k: e[0], a: e[1], b: e[2] }; for (var k in (e[3] || {})) x[k] = e[3][k]; return x; });
        out.forEach(function (x) { if (x.ctrl) { var t = out.filter(function (y) { return y.tag === x.ctrl; })[0]; x.ctrl = t ? t.id : null; } }); return out; })() };
  }
  /* helpers available to checks */
  function H(L, res) {
    var parent = {};
    function f(p) { var k = p.join(","); if (L.alias && L.alias[k]) k = L.alias[k]; if (parent[k] === undefined) parent[k] = k; while (parent[k] !== k) k = parent[k] = parent[parent[k]]; return k; }
    L.edges.forEach(function (e) { if (e.k === "W" || (e.k === "SW" && e.closed)) parent[f(e.a)] = f(e.b); });
    var h = {
      L: L, res: res,
      e: function (tag) { return L.edges.filter(function (x) { return x.tag === tag; })[0]; },
      el: function (tag) { var e = h.e(tag); return e && res && res.ok ? res.el[e.id] : null; },
      same: function (p, q) { return !!p && !!q && f(p) === f(q); },
      across: function (tag) { var e = h.e(tag), pr = L.probes; return !!e && ((h.same(pr.vp, e.a) && h.same(pr.vn, e.b)) || (h.same(pr.vp, e.b) && h.same(pr.vn, e.a))); },
      vm: function () { var pr = L.probes; return res && res.ok && pr.vp && pr.vn ? res.dcV(pr.vp) - res.dcV(pr.vn) : NaN; },
      vmAC: function () { var pr = L.probes; return res && res.ok && res.ac && pr.vp && pr.vn ? Cx.sub(res.acV(pr.vp), res.acV(pr.vn)) : Cx.c(NaN); },
      count: function (k, pred) { return L.edges.filter(function (e) { return e.k === k && (!pred || pred(e)); }).length; },
      between: function (p, q, k) { return L.edges.filter(function (e) { return (!k || e.k === k) && ((h.same(e.a, p) && h.same(e.b, q)) || (h.same(e.a, q) && h.same(e.b, p))); }); },
      ok: !!(res && res.ok)
    };
    return h;
  }
  var mag = function (z) { return Cx.abs(z); }, ph = function (z) { return Cx.arg(z); };
  var wrap = function (d) { while (d > 180) d -= 360; while (d <= -180) d += 360; return d; };
  var Sab = function (x) { return Cx.scale(Cx.mul(x.vac, Cx.conj(x.iac)), 0.5); };

  var EXP = {};

  /* ===== Chapter 1 ===== */
  EXP["c1-variables-2"] = { title: "قياس التيار والجهد", intro: "أميتر على التوالي وفولتميتر على التوازي، ومعنى التيار السالب.",
    lab: lab([["V", [1, 0], [2, 0], { value: 9, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [2, 1], { value: 1000, tag: "R" }], ["W", [2, 0], [2, 1]]]),
    steps: [
      { t: "صِل الملتيميتر 1 على طرفي المقاومة R: سلك VΩ بالرجل القريبة من الموجب، وسلك COM بالرجل الأخرى (الوضع V⎓).", check: function (h) { return h.across("R"); } },
      { t: "كم يقرأ الملتيميتر 1؟", ask: function (h) { return h.vm(); }, units: V },
      { t: "كم يقرأ أميتر اللوحة {A1}؟ (يقرأ التيار الداخل من رجله الأولى)", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "اعكس قطبية المصدر: بدّل مكاني سلكي {Vs} (الأحمر مكان الأسود). بأداة التحديد اضغط السلك واسحب طرفه المضيء.", check: function (h) { return h.e("Vs") && h.same(h.e("Vs").a, [2, 0]); } },
      { t: "كم يقرأ الأميتر الآن؟ الإشارة السالبة تعني أن التيار الفعلي عكس اتجاه القياس.", ask: function (h) { return h.el("A1").i; }, units: A }
    ] };
  EXP["c1-variables-3"] = { title: "اتجاه التيار وإشارة القدرة", intro: "القدرة الممتصة موجبة للمقاومة وسالبة للمصدر الذي يسلّم الطاقة، مهما عكست الاتجاهات.",
    lab: lab([["V", [1, 0], [2, 0], { value: 6, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 2000, tag: "R" }], ["W", [1, 1], [2, 1]], ["W", [2, 0], [2, 1]]]),
    steps: [
      { t: "حدد المقاومة واقرأ القدرة الممتصة فيها.", ask: function (h) { return h.el("R").p; }, units: W },
      { t: "القدرة «الممتصة» في المصدر {Vs} = −(الجهد × التيار) كما يعرضهما مزود الجهد. كم هي؟ ولماذا سالبة؟", ask: function (h) { return h.el("Vs").p; }, units: W },
      { t: "اعكس قطبية المصدر: بدّل مكاني سلكي {Vs} الأحمر والأسود.", check: function (h) { return h.e("Vs") && h.same(h.e("Vs").a, [2, 0]); } },
      { t: "اقرأ قدرة المصدر مرة أخرى: انعكس التيار والجهد معًا، والنتيجة الفيزيائية نفسها.", ask: function (h) { return h.el("Vs").p; }, units: W }
    ] };
  EXP["c1-variables-4"] = { title: "توازن القدرة", intro: "مجموع القدرات الممتصة في أي دائرة = صفر.",
    lab: lab([["V", [1, 0], [2, 0], { value: 12, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "R1" }], ["R", [1, 1], [2, 1], { value: 2000, tag: "R2" }], ["W", [2, 0], [2, 1]]]),
    steps: [
      { t: "قدرة R1:", ask: function (h) { return h.el("R1").p; }, units: W },
      { t: "قدرة R2:", ask: function (h) { return h.el("R2").p; }, units: W },
      { t: "قدرة المصدر (ممتصة):", ask: function (h) { return h.el("Vs").p; }, units: W },
      { t: "اجمع القدرات الثلاث:", ask: function (h) { return h.el("R1").p + h.el("R2").p + h.el("Vs").p; }, units: W, abs: 1e-4 }
    ] };

  /* ===== Chapter 2 ===== */
  EXP["c1-elements-1"] = { title: "توصيل المصادر", intro: "مصدرا جهد مثاليان مختلفان على التوازي يخالفان KVL، فلا حل للدائرة.",
    lab: lab([["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "V1" }], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 1000, tag: "R" }], ["W", [2, 0], [2, 1]], ["W", [1, 1], [1, 2]], ["W", [2, 1], [2, 2]]]),
    steps: [
      { t: "اقرأ التيار في المقاومة R.", ask: function (h) { return h.el("R").i; }, units: A },
      { t: "وصّل قناة ثانية من مزود الجهد (CH2 بجهد 9 V وشغّلها) على نفس النقطتين اللتين عليهما {V1}، أي على التوازي معها. لاحظ رسالة «حالة الدائرة».", check: function (h) { return h.count("V", function (e) { return e.tag !== "V1" && Math.abs(e.value - 5) > 1e-9; }) > 0 && !h.ok; } },
      { t: "أطفئ القناة الجديدة (OFF) أو احذف سلكيها. (حتى لو تساوى المصدران، لا يمكن تحديد تيار كل منهما، لذلك لا يُوصل مصدرا جهد مثاليان على التوازي.)", check: function (h) { return h.ok && h.count("V") === 1; } }
    ] };
  EXP["c1-elements-2"] = { title: "قياس قانون أوم", intro: "غيّر جهد المصدر وسجّل التيار؛ العلاقة خط مستقيم ميله مقلوب المقاومة.",
    lab: lab([["V", [1, 0], [2, 0], { value: 2, plus: "a", tag: "Vs" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [2, 1], { value: 470, tag: "R" }], ["W", [2, 0], [2, 1]]]),
    steps: [
      { t: "سجّل نقطة، ثم غيّر جهد {Vs} من لوحة مزود الجهد وسجّل نقطة أخرى. سجّل 4 نقاط بجهود مختلفة على الأقل.", rec: { x: ["جهد المصدر", "V", function (h) { return h.e("Vs").value; }], y: ["التيار", "A", function (h) { return h.el("A1").i; }], min: 4 } },
      { t: "ما ميل الخط (التيار ÷ الجهد)؟", ask: function (h) { return 1 / h.e("R").value; }, units: S_ },
      { t: "وما المقاومة؟", ask: function (h) { return h.e("R").value; }, units: OHM }
    ] };
  EXP["c1-elements-3"] = { title: "التحقق من KCL و KVL بالقياس", intro: "ثلاثة أميترات حول عقدة، وجهود حول حلقة.",
    lab: lab([["V", [1, 0], [2, 0], { value: 12, plus: "a" }], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R1" }], ["R", [1, 2], [2, 2], { value: 2000, tag: "R2" }], ["AM", [2, 2], [3, 2], { tag: "A2" }],
      ["W", [1, 2], [1, 3]], ["AM", [1, 3], [1, 4], { tag: "A3" }], ["R", [1, 4], [2, 4], { value: 3000, tag: "R3" }], ["W", [2, 4], [3, 4]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]], ["W", [3, 3], [3, 4]]], { ground: [3, 0] }),
    steps: [
      { t: "التيار الداخل إلى العقدة (A1):", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "التيار الخارج لأسفل (A2):", ask: function (h) { return h.el("A2").i; }, units: A },
      { t: "التيار الخارج لليمين (A3):", ask: function (h) { return h.el("A3").i; }, units: A },
      { t: "احسب A1 − A2 − A3 (KCL):", ask: function (h) { return h.el("A1").i - h.el("A2").i - h.el("A3").i; }, units: A, abs: 1e-7 },
      { t: "صِل الملتيميتر 1 على طرفي R1 واقرأه:", check: function (h) { return h.across("R1"); } },
      { t: "جهد R1:", ask: function (h) { return Math.abs(h.vm()); }, units: V },
      { t: "جهد R2 (حدد R2 واقرأ جهده). مجموع جهدي R1 و R2 يساوي جهد المصدر 12 V (KVL):", ask: function (h) { return h.el("R2").v; }, units: V }
    ] };

  /* ===== Chapter 3 ===== */
  EXP["c1-resistive-1"] = { title: "المقاومات على التوالي", intro: "كلما أضفت مقاومة على التوالي يقل التيار، ويتوزع الجهد بنسبة المقاومات.",
    lab: lab([["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R1" }], ["R", [1, 2], [2, 2], { value: 2200, tag: "R2" }], ["W", [2, 0], [2, 1], { tag: "slot" }], ["W", [2, 1], [2, 2]]]),
    steps: [
      { t: "التيار الآن:", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "استبدل السلك البرتقالي بمقاومة 4.7 kΩ: احذف السلك بالممحاة، وركّب مقاومة بين نفس الثقبين (أو نفس العمودين)، ثم غيّر قيمتها.", check: function (h) { return h.ok && h.count("R", function (e) { return Math.abs(e.value - 4700) < 1; }) > 0 && h.count("R") >= 3; } },
      { t: "التيار الجديد:", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "جهد المقاومة 4.7 kΩ:", ask: function (h) { var e = h.L.edges.filter(function (x) { return x.k === "R" && Math.abs(x.value - 4700) < 1; })[0]; return Math.abs(h.res.el[e.id].v); }, units: V }
    ] };
  EXP["c1-resistive-2"] = { title: "قياس المقاومة المكافئة", intro: "مصدر 1 V وأميتر: المقاومة المكافئة = الجهد ÷ التيار (هذه فكرة الأوميتر).",
    lab: lab([["V", [1, 0], [2, 0], { value: 1, plus: "a" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 1000 }], ["R", [1, 2], [2, 2], { value: 2000 }], ["W", [1, 2], [1, 3]], ["R", [1, 3], [2, 3], { value: 3000 }], ["W", [2, 2], [2, 3]], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]]),
    steps: [
      { t: "اقرأ التيار:", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "المقاومة المكافئة التي تراها البطارية = 1 V ÷ التيار:", ask: function (h) { return 1 / h.el("A1").i; }, units: OHM },
      { t: "احسبها بنفسك: 1k + (2k ∥ 3k). هل تطابق؟ غيّر 3 kΩ إلى 6 kΩ.", check: function (h) { return h.count("R", function (e) { return Math.abs(e.value - 6000) < 1; }) > 0; } },
      { t: "المقاومة المكافئة الجديدة:", ask: function (h) { return 1 / h.el("A1").i; }, units: OHM }
    ] };
  EXP["c1-resistive-3"] = { title: "مقسّم جهد تحت الحمل", intro: "الحمل على التوازي مع R2 يخفض جهد الخرج، وكلما صغر الحمل زاد الانخفاض.",
    lab: lab([["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["W", [2, 0], [3, 0]], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 10000, tag: "R1" }], ["R", [2, 1], [3, 1], { value: 10000, tag: "R2" }], ["W", [3, 0], [3, 1]], ["W", [2, 1], [2, 2]], ["W", [3, 1], [3, 2]]], { ground: [3, 0] }),
    steps: [
      { t: "صِل الملتيميتر 1 على طرفي R2 (الخرج).", check: function (h) { return h.across("R2"); } },
      { t: "جهد الخرج بدون حمل:", ask: function (h) { return Math.abs(h.vm()); }, units: V },
      { t: "ركّب مقاومة حمل 10 kΩ على التوازي مع R2: رجل في عمود الخرج {@2,1} والأخرى في الأرضي {@3,0}.", check: function (h) { return h.ok && h.count("R", function (e) { return !e.tag && Math.abs(e.value - 10000) < 1; }) > 0 && Math.abs(h.vm()) < 4; } },
      { t: "جهد الخرج مع 10 kΩ:", ask: function (h) { return Math.abs(h.vm()); }, units: V },
      { t: "غيّر الحمل إلى 1 kΩ.", check: function (h) { return h.count("R", function (e) { return !e.tag && Math.abs(e.value - 1000) < 1; }) > 0; } },
      { t: "جهد الخرج مع 1 kΩ:", ask: function (h) { return Math.abs(h.vm()); }, units: V }
    ] };
  EXP["c1-resistive-4"] = { title: "قسمة التيار بالقياس", intro: "في الفروع المتوازية يتناسب التيار مع مقلوب المقاومة.",
    lab: lab([["V", [1, 0], [2, 0], { value: 6, plus: "a" }], ["W", [2, 0], [3, 0]], ["W", [1, 0], [1, 1]], ["W", [1, 1], [1, 2]], ["W", [1, 2], [1, 3]],
      ["AM", [1, 1], [2, 1], { tag: "A1" }], ["R", [2, 1], [3, 1], { value: 1000 }], ["AM", [1, 2], [2, 2], { tag: "A2" }], ["R", [2, 2], [3, 2], { value: 2000 }], ["AM", [1, 3], [2, 3], { tag: "A3" }], ["R", [2, 3], [3, 3], { value: 3000 }],
      ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]]], { ground: [3, 0] }),
    steps: [
      { t: "تيار الفرع 1 kΩ:", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "تيار الفرع 2 kΩ:", ask: function (h) { return h.el("A2").i; }, units: A },
      { t: "تيار الفرع 3 kΩ:", ask: function (h) { return h.el("A3").i; }, units: A },
      { t: "نسبة تيار الفرع الأول إلى الثاني:", ask: function (h) { return h.el("A1").i / h.el("A2").i; }, units: NONE }
    ] };
  EXP["c1-resistive-5"] = { title: "جسر ويتستون", intro: "عندما R1/R2 = R3/R4 يتزن الجسر ولا يمر تيار في فرعه الأوسط.",
    lab: lab([["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["W", [2, 0], [3, 0]], ["W", [1, 0], [1, 1]], ["W", [1, 1], [1, 2]], ["W", [1, 2], [1, 3]], ["R", [1, 1], [2, 1], { value: 1000, tag: "R1" }], ["R", [2, 1], [3, 1], { value: 2000, tag: "R2" }],
      ["R", [1, 3], [2, 3], { value: 1000, tag: "R3" }], ["R", [2, 3], [3, 3], { value: 1000, tag: "R4" }], ["R", [2, 1], [2, 2], { value: 500, tag: "R5" }], ["AM", [2, 2], [2, 3], { tag: "AB" }], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]]], { ground: [3, 0] }),
    steps: [
      { t: "تيار فرع الجسر الآن:", ask: function (h) { return h.el("AB").i; }, units: A },
      { t: "غيّر R4 (أسفل اليمين) حتى يصبح تيار الجسر صفرًا.", check: function (h) { return h.ok && Math.abs(h.el("AB").i) < 1e-7; } },
      { t: "ما قيمة R4 التي اتزن عندها الجسر؟", ask: function (h) { return h.e("R4").value; }, units: OHM }
    ] };

  /* ===== Chapter 4 ===== */
  var NODE_NET = [["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["R", [1, 0], [1, 1], { value: 1000 }], ["R", [1, 1], [2, 1], { value: 2000 }], ["R", [1, 1], [1, 2], { value: 1000 }], ["R", [1, 2], [2, 2], { value: 1000 }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]];
  EXP["c1-techniques-1"] = { title: "قياس جهود العقد", intro: "جهد العقدة = قراءة الملتيميتر وسلك COM على الأرضي.",
    lab: lab(NODE_NET),
    steps: [
      { t: "صِل VΩ للملتيميتر 1 بالعقدة بين R1 و R3 ({@1,1})، و COM بالأرضي ({@2,0}).", check: function (h) { return h.same(h.L.probes.vp, [1, 1]) && h.same(h.L.probes.vn, [2, 0]); } },
      { t: "جهد العقدة الأولى:", ask: function (h) { return h.vm(); }, units: V },
      { t: "انقل طرف سلك VΩ إلى العقدة الثانية ({@1,2}).", check: function (h) { return h.same(h.L.probes.vp, [1, 2]) && h.same(h.L.probes.vn, [2, 0]); } },
      { t: "جهد العقدة الثانية:", ask: function (h) { return h.vm(); }, units: V }
    ] };
  EXP["c1-techniques-3"] = { title: "العقدة العظمى", intro: "مصدر الجهد بين عقدتين يثبت فرق جهدهما مهما تغيرت الأحمال.",
    lab: lab([["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["R", [1, 0], [1, 1], { value: 1000 }], ["V", [1, 1], [1, 2], { value: 4, plus: "a", tag: "V2" }], ["R", [1, 1], [2, 1], { value: 2000 }], ["R", [1, 2], [2, 2], { value: 3000, tag: "RL" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]]),
    steps: [
      { t: "صِل الملتيميتر 1 على طرفي المصدر {V2} (بين العقدتين).", check: function (h) { return h.across("V2"); } },
      { t: "فرق الجهد:", ask: function (h) { return Math.abs(h.vm()); }, units: V },
      { t: "غيّر RL (أقصى اليمين) إلى أي قيمة أخرى.", check: function (h) { return h.e("RL") && Math.abs(h.e("RL").value - 3000) > 1; } },
      { t: "فرق الجهد الآن:", ask: function (h) { return Math.abs(h.vm()); }, units: V }
    ] };
  var TWO_MESH = function (shared) { return [["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 1000, tag: "R1" }]].concat(shared).concat([
    ["R", [1, 2], [1, 3], { value: 2000, tag: "R2" }], ["AM", [1, 3], [1, 4], { tag: "A2" }], ["V", [1, 4], [2, 4], { value: 5, plus: "a" }], ["W", [2, 4], [3, 4]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]], ["W", [3, 3], [3, 4]]]); };
  EXP["c1-techniques-4"] = { title: "تيار الفرع المشترك", intro: "تيار الفرع المشترك = فرق تياري الحلقتين (مع عقارب الساعة).",
    lab: lab(TWO_MESH([["R", [1, 2], [2, 2], { value: 3000, tag: "R3" }], ["AM", [2, 2], [3, 2], { tag: "AS" }]]), { ground: [3, 0] }),
    steps: [
      { t: "تيار الحلقة الأولى I₁ (أميتر اللوحة {A1}):", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "تيار الحلقة الثانية I₂ (أميتر اللوحة {A2}):", ask: function (h) { return h.el("A2").i; }, units: A },
      { t: "تيار الفرع المشترك لأسفل I_shared:", ask: function (h) { return h.el("AS").i; }, units: A },
      { t: "احسب: I₁ − I₂ − I_shared =", ask: function (h) { return h.el("A1").i - h.el("A2").i - h.el("AS").i; }, units: A, abs: 1e-7 }
    ] };
  EXP["c1-techniques-6"] = { title: "الحلقة العظمى", intro: "مصدر تيار في الفرع المشترك: جهده يأخذ أي قيمة تحقق KVL.",
    lab: lab(TWO_MESH([["I", [1, 2], [2, 2], { value: 2e-3, dir: "ab", tag: "Is" }], ["R", [2, 2], [3, 2], { value: 1000, tag: "R3" }]]), { ground: [3, 0] }),
    steps: [
      { t: "الفرق بين I₁ و I₂ (اقرأ الأميترين):", ask: function (h) { return h.el("A1").i - h.el("A2").i; }, units: A },
      { t: "جهد {Is} كما يعرضه مزود الجهد (الأحمر ناقص الأسود):", ask: function (h) { return h.el("Is").v; }, units: V },
      { t: "تحقق من KVL في الحلقة اليسرى: 10 V مطروحًا منها جهد {R1} وجهد مصدر التيار (من {@1,2} إلى {@2,2}، أي سالب قراءة المزود) وجهد {R3}:", ask: function (h) { return 10 - h.el("R1").v - (h.res.dcV([1, 2]) - h.res.dcV([2, 2])) - h.el("R3").v; }, units: V, abs: 1e-4 }
    ] };
  EXP["c1-techniques-7"] = { title: "حل بطريقتين", intro: "حل الدائرة بالعقد أو بالحلقات يعطي القياسات نفسها.",
    lab: lab(NODE_NET.concat([])),
    steps: [
      { t: "قس بالملتيميتر 1 جهد العقدة {@1,1} بالنسبة للأرضي {@2,0}.", check: function (h) { return h.same(h.L.probes.vp, [1, 1]) && h.same(h.L.probes.vn, [2, 0]); } },
      { t: "القراءة (قارنها بحلك بالعقد):", ask: function (h) { return h.vm(); }, units: V },
      { t: "حدد المقاومة بين {@1,2} والأرضي واقرأ تيارها (قارنه بتيار الحلقة اليمنى في حلك):", ask: function (h) { var e = h.L.edges.filter(function (x) { return x.k === "R" && h.same(x.a, [1, 2]); })[0]; return h.res.el[e.id].i; }, units: A }
    ] };
  EXP["c1-techniques-8"] = { title: "مكافئ البطارية", intro: "البطارية = مصدر مثالي + مقاومة داخلية. القياس بدون حمل ومع حمل يكشفها.",
    lab: lab([["V", [1, 0], [2, 0], { value: 9, plus: "a", bat: true, tag: "E" }], ["R", [1, 0], [1, 1], { value: 50, tag: "Rint" }], ["W", [2, 0], [2, 1]], ["W", [1, 1], [1, 2]], ["W", [2, 1], [2, 2]]], { probes: { vp: [1, 1], vn: [2, 1] } }),
    steps: [
      { t: "R = 50 Ω هنا هي المقاومة الداخلية لبطارية مستهلكة (داخل البطارية)، والملتيميتر 1 على طرفي البطارية الخارجيين. اقرأ الجهد بدون حمل:", ask: function (h) { return h.vm(); }, units: V },
      { t: "ركّب مقاومة حمل 220 Ω على الطرفين الخارجيين: رجل في {@1,1} والأخرى في {@2,1}.", check: function (h) { return h.ok && h.count("R", function (e) { return !e.tag && Math.abs(e.value - 220) < 1e-6; }) > 0; } },
      { t: "الجهد مع الحمل:", ask: function (h) { return h.vm(); }, units: V },
      { t: "استنتج المقاومة الداخلية: R_int = R_L (V_oc / V_L − 1)", ask: function (h) { return h.e("Rint").value; }, units: OHM }
    ] };
  var TH_NET = [["V", [1, 0], [2, 0], { value: 12, plus: "a", tag: "Vs" }], ["R", [1, 0], [1, 1], { value: 4000 }], ["R", [1, 1], [2, 1], { value: 12000 }], ["R", [1, 1], [1, 2], { value: 1000 }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]];
  EXP["c1-techniques-9"] = { title: "قياس مكافئ ثيفنن", intro: "V_Th من جهد الدائرة المفتوحة، و I_N من تيار القصر، و R_Th = V_Th / I_N.",
    lab: lab(TH_NET, { probes: { vp: [1, 2], vn: [2, 2] } }),
    steps: [
      { t: "الملتيميتر 1 على الطرفين a و b ({@1,2} و {@2,2}). جهد الدائرة المفتوحة:", ask: function (h) { return h.vm(); }, units: V },
      { t: "ركّب أميتر لوحة بين الطرفين ({@1,2} و {@2,2}) ليقصرهما.", check: function (h) { return h.between([1, 2], [2, 2], "AM").length > 0; } },
      { t: "تيار القصر:", ask: function (h) { return h.res.el[h.between([1, 2], [2, 2], "AM")[0].id].i; }, units: A },
      { t: "استنتج R_Th:", ask: function () { return 4000; }, units: OHM },
      { t: "استبدل الأميتر بمقاومة تساوي R_Th بين نفس الطرفين.", check: function (h) { return h.between([1, 2], [2, 2], "R").some(function (e) { return Math.abs(e.value - 4000) < 1; }); } },
      { t: "جهد الحمل الآن (يجب أن يكون نصف V_Th):", ask: function (h) { return h.vm(); }, units: V }
    ] };
  EXP["c1-techniques-10"] = { title: "مصدر اختبار", intro: "أطفئ المصادر المستقلة، واحقن تيار اختبار، و R_Th = v / i.",
    lab: lab(TH_NET, { probes: { vp: [1, 2], vn: [2, 2] } }),
    steps: [
      { t: "أطفئ مصدر الجهد: اجعل جهد {Vs} في مزود الجهد 0 V (تصير القناة قصرًا).", check: function (h) { return h.count("V", function (e) { return Math.abs(e.value) > 1e-12; }) === 0; } },
      { t: "استخدم CH2 لمزود الجهد مصدرَ تيار 1 mA: اضبط حد التيار 1 mA والجهد 30 V وشغّلها، ثم وصّل الأحمر بالطرف {@1,2} والأسود بالطرف {@2,2}.", check: function (h) { return h.ok && h.between([1, 2], [2, 2], "I").length > 0 && h.vm() > 0; } },
      { t: "جهد الطرفين:", ask: function (h) { return h.vm(); }, units: V },
      { t: "R_Th = v ÷ i_test:", ask: function (h) { return h.vm() / Math.abs(h.between([1, 2], [2, 2], "I")[0].value); }, units: OHM }
    ] };
  EXP["c1-techniques-11"] = { title: "منحنى القدرة", intro: "غيّر الحمل وسجّل قدرته؛ القمة عند R_L = R_Th.",
    lab: lab(TH_NET.concat([["R", [1, 2], [2, 2], { value: 1000, tag: "RL" }]])),
    steps: [
      { t: "حدد R_L، وسجّل نقطة لكل قيمة. جرّب 5 قيم على الأقل بين 500 Ω و 20 kΩ.", rec: { x: ["R_L", "Ω", function (h) { return h.e("RL").value; }], y: ["قدرة الحمل", "W", function (h) { return h.el("RL").p; }], min: 5 } },
      { t: "عند أي قيمة لـ R_L كانت القدرة أكبر ما يمكن؟ (احسبها: R_Th)", ask: function () { return 4000; }, units: OHM },
      { t: "اضبط R_L على هذه القيمة. ما أقصى قدرة؟", ask: function (h) { return Math.abs(h.e("RL").value - 4000) < 1 ? h.el("RL").p : 9 * 9 / (4 * 4000); }, units: W }
    ] };
  EXP["c1-techniques-12"] = { title: "التراكب بالقياس", intro: "تيار الحمل = مجموع ما يعطيه كل مصدر وحده.",
    lab: lab([["V", [1, 0], [2, 0], { value: 10, plus: "a", tag: "V1" }], ["R", [1, 0], [1, 1], { value: 2000 }], ["AM", [1, 1], [2, 1], { tag: "AL" }], ["R", [2, 1], [3, 1], { value: 1000 }], ["R", [1, 1], [1, 2], { value: 2000 }], ["V", [1, 2], [2, 2], { value: 4, plus: "a", tag: "V2" }],
      ["W", [2, 0], [3, 0]], ["W", [2, 2], [3, 2]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]]], { ground: [3, 0] }),
    steps: [
      { t: "تيار الحمل بالمصدرين:", ask: function (h) { return h.el("AL").i; }, units: A },
      { t: "أطفئ {V2}: أطفئ قناته (OFF) وضع سلكًا مكانه، بين الثقبين اللذين فيهما سلكاه.", check: function (h) { return h.ok && !h.e("V2") && !!h.e("V1"); } },
      { t: "تيار الحمل مع V1 وحده:", ask: function (h) { return h.el("AL").i; }, units: A },
      { t: "أعد V2: احذف السلك وشغّل قناته (4 V، الأحمر في {@1,2})، ثم أطفئ {V1} بنفس الطريقة (OFF وسلك مكانه).", check: function (h) { return h.ok && !h.e("V1") && h.count("V", function (e) { return Math.abs(e.value - 4) < 1e-9 && h.same(e.plus === "b" ? e.b : e.a, [1, 2]); }) === 1; } },
      { t: "تيار الحمل مع V2 وحده:", ask: function (h) { return h.el("AL").i; }, units: A },
      { t: "مجموع القراءتين الجزئيتين (قارنه بالقراءة الأولى):", ask: function () { var a = 10 / (2000 + 2000 * 1000 / 3000) * (2000 / 3000), b = 4 / (2000 + 2000 * 1000 / 3000) * (2000 / 3000); return a + b; }, units: A }
    ] };

  /* ===== Chapter 5 ===== */
  EXP["c1-sinusoidal-1"] = { title: "الأوسيلوسكوب", intro: "اقرأ القيمة العظمى والزمن الدوري من الشاشة.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 3, freq: 500, rs: 50, plus: "a", tag: "G" }], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 10000 }], ["W", [2, 0], [2, 1]]], { probes: { ch1: [1, 1] } }),
    steps: [
      { t: "القيمة العظمى على CH1 (عدّ المربعات × الجهد لكل مربع):", ask: function (h) { return mag(h.res.acV([1, 1])); }, units: V },
      { t: "الزمن الدوري (الشاشة تعرض دورتين):", ask: function (h) { return 1 / h.e("G").freq; }, units: MS },
      { t: "غيّر تردد {G} من لوحة مولد الإشارة إلى 2 kHz.", check: function (h) { return Math.abs(h.e("G").freq - 2000) < 1e-6; } },
      { t: "الزمن الدوري الجديد:", ask: function (h) { return 1 / h.e("G").freq; }, units: MS }
    ] };
  EXP["c1-sinusoidal-2"] = { title: "جمع موجتين", intro: "مولدان على التوالي: الناتج مجموع فيزوريهما وليس مجموع قيمتيهما العظميين.",
    lab: lab([["GEN", [2, 0], [3, 0], { amp: 3, freq: 1000, rs: 0.01, plus: "a", phase: 0, tag: "G1" }], ["GEN", [1, 0], [2, 0], { amp: 4, freq: 1000, rs: 0.01, plus: "a", phase: 90, tag: "G2" }]], { ground: [3, 0], probes: { ch1: [2, 0], ch2: [1, 0] } }),
    steps: [
      { t: "CH1 للأوسيلوسكوب يعرض {G1} وحده، و CH2 يعرض المجموع. القيمة العظمى للمجموع:", ask: function (h) { return mag(h.res.acV([1, 0])); }, units: V },
      { t: "هل تساوي 3 + 4؟ احسب |3∠0° + 4∠90°| بنفسك. ثم: طور المجموع بالنسبة لـ CH1:", ask: function (h) { return wrap(ph(h.res.acV([1, 0])) - ph(h.res.acV([2, 0]))); }, units: DEG, abs: 0.5 },
      { t: "اجعل طور {G2} 0° من لوحة مولد الإشارة.", check: function (h) { return Math.abs((h.e("G2").phase || 0)) < 1e-9; } },
      { t: "القيمة العظمى للمجموع الآن (الموجتان في طور واحد):", ask: function (h) { return mag(h.res.acV([1, 0])); }, units: V }
    ] };
  var RL = function (k, v) { return lab([["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 0.01, plus: "a", tag: "G" }], [k, [1, 0], [1, 1], { value: v, tag: "X" }], ["R", [1, 1], [2, 1], { value: 100, tag: "R" }], ["W", [2, 0], [2, 1]]], { probes: { ch1: [1, 0], ch2: [1, 1] } }); };
  EXP["c1-sinusoidal-3"] = { title: "فرق الطور بالقياس", intro: "جهد الملف يسبق تياره 90°، وجهد المكثف يتأخر عنه 90°.",
    lab: RL("L", 10e-3),
    steps: [
      { t: "حدد الملف L واقرأ طور جهده وطور تياره. فرق الطور (جهد − تيار):", ask: function (h) { var x = h.el("X"); return wrap(ph(x.vac) - ph(x.iac)); }, units: DEG, abs: 0.5 },
      { t: "على الأوسيلوسكوب: CH2 (جهد R) يتبع التيار. احذف الملف وركّب مكثفًا 1 µF مكانه.", check: function (h) { return h.count("C", function (e) { return Math.abs(e.value - 1e-6) < 1e-12; }) > 0 && h.count("L") === 0; } },
      { t: "فرق الطور (جهد المكثف − تياره):", ask: function (h) { var e = h.L.edges.filter(function (x) { return x.k === "C"; })[0], x = h.res.el[e.id]; return wrap(ph(x.vac) - ph(x.iac)); }, units: DEG, abs: 0.5 }
    ] };
  EXP["c1-sinusoidal-4"] = { title: "KVL بالملتيميتر", intro: "في AC: مجموع قراءات الملتيميتر (rms) أكبر من جهد المصدر، لأن الجهود فيزورات بأطوار مختلفة.",
    lab: RL("L", 20e-3),
    steps: [
      { t: "الملتيميتر 1 على R (الوضع V~). القراءة rms:", check: function (h) { return h.across("R"); } },
      { t: "V_R (rms):", ask: function (h) { return mag(h.vmAC()) / Math.SQRT2; }, units: V },
      { t: "انقل سلكي الملتيميتر 1 إلى طرفي الملف L.", check: function (h) { return h.across("X"); } },
      { t: "V_L (rms):", ask: function (h) { return mag(h.vmAC()) / Math.SQRT2; }, units: V },
      { t: "جهد المصدر rms = 5/√2. اجمع V_R و V_L جمعًا فيزوريًا: √(V_R² + V_L²) =", ask: function (h) { return 5 / Math.SQRT2; }, units: V }
    ] };
  EXP["c1-sinusoidal-5"] = { title: "قياس الممانعة", intro: "|Z| = |V| / |I|، وتتغير مع التردد.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 0.01, plus: "a", tag: "G" }], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 100 }], ["L", [1, 2], [2, 2], { value: 20e-3 }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]]),
    steps: [
      { t: "القيمة العظمى للتيار (على الأميتر):", ask: function (h) { return mag(h.el("A1").iac); }, units: A },
      { t: "|Z| = 5 V ÷ التيار:", ask: function (h) { return 5 / mag(h.el("A1").iac); }, units: OHM },
      { t: "غيّر التردد إلى 5 kHz.", check: function (h) { return Math.abs(h.e("G").freq - 5000) < 1e-6; } },
      { t: "|Z| الجديدة:", ask: function (h) { return 5 / mag(h.el("A1").iac); }, units: OHM }
    ] };
  var ACTH = [["GEN", [1, 0], [2, 0], { amp: 10, freq: 1000, rs: 0.01, plus: "a" }], ["R", [1, 0], [1, 1], { value: 100 }], ["C", [1, 1], [2, 1], { value: 1.5e-6 }], ["W", [1, 1], [1, 2]], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]];
  EXP["c1-sinusoidal-6"] = { title: "مكافئ ثيفنن بالقياس", intro: "V_Th من الدائرة المفتوحة، و Z_Th = V_Th / I_sc (فيزورات).",
    lab: lab(ACTH, { probes: { vp: [1, 2], vn: [2, 2] } }),
    steps: [
      { t: "مقدار V_Th (القيمة العظمى = قراءة الملتيميتر V~ × √2):", ask: function (h) { return mag(h.vmAC()); }, units: V },
      { t: "طور V_Th:", ask: function (h) { return ph(h.vmAC()); }, units: DEG, abs: 0.5 },
      { t: "ركّب أميتر لوحة بين الطرفين ({@1,2} و {@2,2}) ليقصرهما.", check: function (h) { return h.between([1, 2], [2, 2], "AM").length > 0; } },
      { t: "مقدار تيار القصر:", ask: function (h) { return mag(h.res.el[h.between([1, 2], [2, 2], "AM")[0].id].iac); }, units: A },
      { t: "|Z_Th| = |V_Th| / |I_sc|:", ask: function () { var w = 2 * Math.PI * 1000, zc = Cx.c(0, -1 / (w * 1.5e-6)), z = Cx.div(Cx.mul(Cx.c(100.01), zc), Cx.add(Cx.c(100.01), zc)); return Cx.abs(z); }, units: OHM }
    ] };
  EXP["c1-sinusoidal-7"] = { title: "جهود العقد بالأوسيلوسكوب", intro: "مقدار وطور جهد كل عقدة بالنسبة للمصدر.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 0.01, plus: "a" }], ["R", [1, 0], [1, 1], { value: 100 }], ["C", [1, 1], [2, 1], { value: 2e-6 }], ["L", [1, 1], [1, 2], { value: 10e-3 }], ["R", [1, 2], [2, 2], { value: 100 }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], { probes: { ch1: [1, 0], ch2: [1, 1] } }),
    steps: [
      { t: "CH2 على العقدة الأولى. مقدار جهدها (قيمة عظمى):", ask: function (h) { return mag(h.res.acV([1, 1])); }, units: V },
      { t: "طورها بالنسبة للمصدر (CH1):", ask: function (h) { return wrap(ph(h.res.acV([1, 1])) - ph(h.res.acV([1, 0]))); }, units: DEG, abs: 0.5 },
      { t: "انقل مجس CH2 للأوسيلوسكوب إلى العقدة الثانية ({@1,2}).", check: function (h) { return h.same(h.L.probes.ch2, [1, 2]); } },
      { t: "مقدار جهد العقدة الثانية:", ask: function (h) { return mag(h.res.acV([1, 2])); }, units: V }
    ] };
  EXP["c1-sinusoidal-8"] = { title: "تيارات الحلقات", intro: "تيار الفرع المشترك = I₁ − I₂ فيزوريًا (المقادير لا تُطرح مباشرة).",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 10, freq: 1000, rs: 0.01, plus: "a" }], ["W", [2, 0], [3, 0]], ["AM", [1, 0], [1, 1], { tag: "A1" }], ["R", [1, 1], [1, 2], { value: 100 }], ["C", [1, 2], [2, 2], { value: 2e-6 }], ["AM", [2, 2], [3, 2], { tag: "AS" }],
      ["L", [1, 2], [1, 3], { value: 15e-3 }], ["AM", [1, 3], [1, 4], { tag: "A2" }], ["R", [1, 4], [2, 4], { value: 100 }], ["W", [2, 4], [3, 4]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]], ["W", [3, 3], [3, 4]]], { ground: [3, 0] }),
    steps: [
      { t: "مقدار I₁ (أميتر اللوحة {A1}، اضغطه لترى القيمة العظمى):", ask: function (h) { return mag(h.el("A1").iac); }, units: A },
      { t: "مقدار I₂:", ask: function (h) { return mag(h.el("A2").iac); }, units: A },
      { t: "مقدار تيار الفرع المشترك:", ask: function (h) { return mag(h.el("AS").iac); }, units: A },
      { t: "احسب |I₁ − I₂| من الفيزورين (بأطوارهما):", ask: function (h) { return mag(Cx.sub(h.el("A1").iac, h.el("A2").iac)); }, units: A }
    ] };
  EXP["c1-sinusoidal-9"] = { title: "المخطط الفيزوري من القياس", intro: "في RC على التوالي: V_R و V_C متعامدان ومجموعهما الفيزوري = V_s.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 0.01, plus: "a" }], ["R", [1, 0], [1, 1], { value: 1000, tag: "R" }], ["C", [1, 1], [2, 1], { value: 150e-9, tag: "C" }], ["W", [2, 0], [2, 1]]]),
    steps: [
      { t: "مقدار V_R (حدد R):", ask: function (h) { return mag(h.el("R").vac); }, units: V },
      { t: "مقدار V_C:", ask: function (h) { return mag(h.el("C").vac); }, units: V },
      { t: "الزاوية بين V_R و V_C:", ask: function (h) { return Math.abs(wrap(ph(h.el("R").vac) - ph(h.el("C").vac))); }, units: DEG, abs: 0.5 },
      { t: "√(V_R² + V_C²) يجب أن يساوي 5 V:", ask: function (h) { return Math.hypot(mag(h.el("R").vac), mag(h.el("C").vac)); }, units: V }
    ], diagram: function (h) { return [["V_R", h.el("R").vac, "#3b8bff"], ["V_C", h.el("C").vac, "#ff9f43"], ["V_s", Cx.add(h.el("R").vac, h.el("C").vac), "#9aa3b2"]]; } };

  /* ===== Chapter 6 ===== */
  var LOAD = function (extra) { return lab([["GEN", [1, 0], [2, 0], { amp: 10, freq: 1000, rs: 0.01, plus: "a", tag: "G" }], ["W", [1, 0], [1, 1]], ["R", [1, 1], [1, 2], { value: 100, tag: "R" }], ["L", [1, 2], [2, 2], { value: 15e-3, tag: "X" }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]].concat(extra || [])); };
  EXP["c1-power-1"] = { title: "القدرة المتوسطة", intro: "P = ½VmIm cos(θv − θi). المعمل يعطيك الفيزورات وقراءة الواطميتر.",
    lab: LOAD(),
    steps: [
      { t: "حدد المقاومة R واقرأ مقدار تيارها (قيمة عظمى):", ask: function (h) { return mag(h.el("R").iac); }, units: A },
      { t: "احسب قدرتها المتوسطة ½I²R ثم قارنها بقراءة الواطميتر في المعمل:", ask: function (h) { return Sab(h.el("R")).re; }, units: W },
      { t: "القدرة المتوسطة في الملف (من المعمل):", ask: function (h) { return Sab(h.el("X")).re; }, units: W, abs: 1e-6 },
      { t: "القدرة اللحظية تتذبذب بأي تردد إذا كان تردد المصدر 1 kHz؟", ask: function () { return 2000; }, units: [{ l: "Hz", f: 1 }, { l: "kHz", f: 1e3 }] }
    ] };
  EXP["c1-power-2"] = { title: "واطميتر وعداد VAR", intro: "P للمقاومة فقط، و Q للملف فقط.",
    lab: LOAD(),
    steps: [
      { t: "P للمقاومة:", ask: function (h) { return Sab(h.el("R")).re; }, units: W },
      { t: "Q للملف:", ask: function (h) { return Sab(h.el("X")).im; }, units: VAR },
      { t: "القدرة المتوسطة التي يسلّمها المولد P:", ask: function (h) { return -Sab(h.el("G")).re; }, units: W }
    ] };
  EXP["c1-power-3"] = { title: "القيمة الفعالة", intro: "فولتميتر AC يقرأ القيمة الفعالة: للموجة الجيبية Vm/√2.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 10, freq: 1000, rs: 0.01, plus: "a", tag: "G" }], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 100, tag: "R" }], ["W", [2, 0], [2, 1]]], { probes: { vp: [1, 1], vn: [2, 1], ch1: [1, 1] } }),
    steps: [
      { t: "القيمة العظمى على الأوسيلوسكوب:", ask: function (h) { return mag(h.res.acV([1, 1])); }, units: V },
      { t: "قراءة الملتيميتر 1 (V~، rms):", ask: function (h) { return mag(h.vmAC()) / Math.SQRT2; }, units: V },
      { t: "قدرة المقاومة = V_rms² / R:", ask: function (h) { return Sab(h.el("R")).re; }, units: W }
    ] };
  EXP["c1-power-4"] = { title: "مثلث القدرة", intro: "غيّر الملف وراقب P و Q و |S|.",
    lab: LOAD(),
    steps: [
      { t: "|S| التي يسلّمها المولد = √(P² + Q²):", ask: function (h) { return mag(Sab(h.el("G"))); }, units: [{ l: "VA", f: 1 }] },
      { t: "معامل القدرة = P / |S|:", ask: function (h) { var s = Sab(h.el("G")); return Math.abs(s.re) / mag(s); }, units: NONE },
      { t: "ضاعف الملف إلى 30 mH.", check: function (h) { return h.e("X") && Math.abs(h.e("X").value - 30e-3) < 1e-9; } },
      { t: "معامل القدرة الجديد:", ask: function (h) { var s = Sab(h.el("G")); return Math.abs(s.re) / mag(s); }, units: NONE }
    ] };
  EXP["c1-power-5"] = { title: "حفظ القدرة", intro: "P و Q للأحمال تُجمع، والمجموع = ما يسلّمه المصدر.",
    lab: LOAD([["W", [1, 2], [1, 3]], ["R", [1, 3], [1, 4], { value: 200, tag: "R2" }], ["C", [1, 4], [2, 4], { value: 2e-6, tag: "C2" }], ["W", [2, 2], [2, 3]], ["W", [2, 3], [2, 4]]]),
    steps: [
      { t: "Q للملف:", ask: function (h) { return Sab(h.el("X")).im; }, units: VAR },
      { t: "Q للمكثف (سالبة):", ask: function (h) { return Sab(h.el("C2")).im; }, units: VAR },
      { t: "P الكلية للمقاومتين:", ask: function (h) { return Sab(h.el("R")).re + Sab(h.el("R2")).re; }, units: W },
      { t: "Q التي يسلّمها المولد (= مجموع Q للأحمال):", ask: function (h) { return -Sab(h.el("G")).im; }, units: VAR }
    ] };
  var Pm = function () { var v = 5, r = 50; return v * v / (8 * r); };
  EXP["c1-power-6"] = { title: "دائرة المطابقة", intro: "مصدر Z_Th = 50 + j50.27 Ω (مولد 50 Ω مع ملف 8 mH). أقصى قدرة عندما الحمل = المرافق.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 50, plus: "a", tag: "G" }], ["L", [1, 0], [1, 1], { value: 8e-3, tag: "Ls" }], ["R", [1, 1], [2, 1], { value: 50, tag: "RL" }], ["W", [2, 0], [2, 1]], ["W", [1, 1], [1, 2]], ["W", [2, 1], [2, 2]]]),
    steps: [
      { t: "قدرة الحمل 50 Ω وحده:", ask: function (h) { return Sab(h.el("RL")).re; }, units: W },
      { t: "أضف مكثفًا على التوالي مع الحمل يلغي مفاعلة الملف (X_C = 50.27 Ω عند 1 kHz): انقل سلك أرضي المولد إلى عمود فارغ، وركّب المكثف بين ذلك العمود والخط الأزرق، ثم اضبط قيمته.", check: function (h) { return h.ok && h.count("C") > 0 && Sab(h.el("RL")).re > 0.98 * Pm(); } },
      { t: "قدرة الحمل الآن (قارنها بأقصى قدرة نظرية):", ask: function (h) { return Sab(h.el("RL")).re; }, units: W }
    ] };
  EXP["c1-power-7"] = { title: "بنك المكثفات", intro: "محرك (R + L) على 220 V rms، 60 Hz — محاكاة فقط. مكثف على التوازي يخفض تيار الخط.",
    lab: lab([["GEN", [1, 0], [2, 0], { amp: 311.13, freq: 60, rs: 0.01, plus: "a", tag: "G" }], ["AM", [1, 0], [1, 1], { tag: "AL" }], ["W", [1, 1], [1, 2]], ["R", [1, 2], [2, 2], { value: 8, tag: "M" }], ["L", [2, 2], [3, 2], { value: 15.9e-3, tag: "ML" }], ["W", [1, 2], [1, 3]], ["W", [2, 0], [3, 0]], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]], ["W", [3, 2], [3, 3]], ["W", [2, 3], [3, 3]]], { ground: [3, 0] }),
    steps: [
      { t: "تيار الخط (القيمة العظمى على الأميتر):", ask: function (h) { return mag(h.el("AL").iac); }, units: A },
      { t: "معامل القدرة للمولد:", ask: function (h) { var s = Sab(h.el("G")); return Math.abs(s.re) / mag(s); }, units: NONE },
      { t: "ركّب مكثفًا على التوازي مع المحرك (على طرفيه نفسهما) حتى يصبح معامل القدرة 0.95 أو أكثر.", check: function (h) { var s = h.ok && Sab(h.el("G")); return s && h.count("C") > 0 && Math.abs(s.re) / mag(s) >= 0.95; } },
      { t: "تيار الخط بعد التصحيح:", ask: function (h) { return mag(h.el("AL").iac); }, units: A }
    ] };

  EXP["c1-elements-4"] = { title: "نموذج الترانزستور", intro: "نموذج مبسط لترانزستور NPN: V_BE = 0.7 V بين القاعدة والباعث، ومصدر تيار تابع i_C = β i_B بين المجمّع والباعث.",
    lab: lab([["V", [1, 0], [2, 0], { value: 5, plus: "a", tag: "VBB" }], ["R", [1, 0], [1, 1], { value: 100000, tag: "RB" }], ["V", [1, 1], [2, 1], { value: 0.7, plus: "a", tag: "VBE" }],
      ["DEP", [1, 2], [2, 2], { dk: "CCCS", gain: 100, ctrl: "RB", dir: "ab", tag: "Q" }], ["R", [1, 2], [1, 3], { value: 1000, tag: "RC" }], ["V", [1, 3], [2, 3], { value: 12, plus: "a" }],
      ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], { probes: { vp: [1, 2], vn: [2, 2] } }),
    steps: [
      { t: "حدد {RB} (مقاومة القاعدة R_B) واقرأ تيار القاعدة i_B:", ask: function (h) { return h.el("RB").i; }, units: A },
      { t: "حدد المصدر التابع واقرأ تيار المجمّع i_C:", ask: function (h) { return h.el("Q").i; }, units: A },
      { t: "جهد المجمّع v_CE (على الملتيميتر 1):", ask: function (h) { return h.vm(); }, units: V },
      { t: "خفّض {RB} إلى 50 kΩ لتزيد تيار القاعدة.", check: function (h) { return Math.abs(h.e("RB").value - 50000) < 1; } },
      { t: "تيار المجمّع الجديد:", ask: function (h) { return h.el("Q").i; }, units: A },
      { t: "جهد المجمّع الجديد (ينخفض كلما زاد i_C). تنبيه: هذا النموذج الخطي لا يُظهر التشبع؛ الترانزستور الحقيقي يتوقف عند v_CE ≈ 0.2 V:", ask: function (h) { return h.vm(); }, units: V },
      { t: "النسبة i_C ÷ i_B:", ask: function (h) { return h.el("Q").i / h.el("RB").i; }, units: NONE }
    ] };
  EXP["c1-techniques-2"] = { title: "مكبر بمصدر تابع", intro: "مصدر تيار تابع يحقن في العقدة 2 تيارًا يتحكم به جهد العقدة 1 (جهد R2).",
    lab: lab([["V", [1, 0], [2, 0], { value: 10, plus: "a" }], ["R", [1, 0], [1, 1], { value: 1000 }], ["R", [1, 1], [2, 1], { value: 2000, tag: "R2" }], ["R", [1, 1], [1, 2], { value: 1000 }],
      ["DEP", [1, 2], [2, 2], { dk: "VCCS", gain: 0.5e-3, ctrl: "R2", dir: "ba", tag: "G" }], ["W", [1, 2], [1, 3]], ["R", [1, 3], [2, 3], { value: 2000 }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], { probes: { vp: [1, 1], vn: [2, 1] } }),
    steps: [
      { t: "الملتيميتر 1 على العقدة 1 والأرضي. جهدها v₁:", ask: function (h) { return h.vm(); }, units: V },
      { t: "انقل طرف سلك VΩ إلى العقدة 2 ({@1,2}).", check: function (h) { return h.same(h.L.probes.vp, [1, 2]) && h.same(h.L.probes.vn, [2, 0]); } },
      { t: "جهد العقدة 2:", ask: function (h) { return h.vm(); }, units: V },
      { t: "حدد المصدر التابع واقرأ تياره (من رجله الثانية إلى الأولى داخله، أي التيار الداخل إلى العقدة 2 = 0.0005 × v₁):", ask: function (h) { return -h.el("G").i; }, units: A },
      { t: "ضاعف ثابت المصدر التابع إلى 1 mS (اكتب 1m).", check: function (h) { return Math.abs(h.e("G").gain - 1e-3) < 1e-9; } },
      { t: "جهد العقدة 2 الآن:", ask: function (h) { return h.vm(); }, units: V },
      { t: "وجهد العقدة 1 الآن (هل تغيّر؟ لماذا؟):", ask: function (h) { return h.res.dcV([1, 1]); }, units: V }
    ] };
  EXP["c1-techniques-5"] = { title: "مصدر جهد تابع", intro: "مصدر جهد تابع في الحلقة اليمنى قيمته r × تيار الفرع المشترك.",
    lab: lab(TWO_MESH([["R", [1, 2], [2, 2], { value: 2000, tag: "R3" }], ["W", [2, 2], [3, 2]]]).map(function (e) { return e[0] === "V" && e[1][1] === 4 ? ["DEP", [1, 4], [2, 4], { dk: "CCVS", gain: 500, ctrl: "R3", plus: "a", tag: "H" }] : e; }), { ground: [3, 0] }),
    steps: [
      { t: "تيار الحلقة اليسرى I₁:", ask: function (h) { return h.el("A1").i; }, units: A },
      { t: "تيار الحلقة اليمنى I₂:", ask: function (h) { return h.el("A2").i; }, units: A },
      { t: "حدد المصدر التابع واقرأ جهده (يساوي 500 × تيار {R3} من رجله الأولى إلى الثانية):", ask: function (h) { return h.el("H").v; }, units: V },
      { t: "غيّر ثابت المصدر التابع إلى 1500 Ω.", check: function (h) { return Math.abs(h.e("H").gain - 1500) < 1e-6; } },
      { t: "تيار الحلقة اليمنى الآن:", ask: function (h) { return h.el("A2").i; }, units: A },
      { t: "تيار {R3} الآن (= I₁ − I₂):", ask: function (h) { return h.el("R3").i; }, units: A }
    ] };

  var UNAVAILABLE = {
    "c1-variables-1": "المعمل يستخدم نموذج العناصر المجمّعة (Lumped)، فلا يستطيع إظهار متى يفشل هذا النموذج عند الترددات العالية."
  };

  /* ===================== panel (lab.html only) ===================== */
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function baseUnit(units) { var u = units.filter(function (x) { return x.f === 1; })[0] || units[0]; return u.l === "—" ? "" : u.l; }
  function fmt(v, units) { var u = baseUnit(units); if (u === "°") return CV.num(v) + "°"; if (!u) return CV.num(v); if (u === "s") return si(v, "s"); return si(v, u); }
  function lessonTitle(id) { return CV.lessons && CV.lessons[id] ? CV.lessons[id].ar : ""; }
  var QTY = /(−?-?\d+(?:\.\d+)?(?:\s?[–-]\s?\d+(?:\.\d+)?)?\s?(?:°C|°|%|[GMkmµn]?(?:VAR|VA|Hz|Ω|A|V|W|F|H|S|s))(?![A-Za-z]))/g;
  var FORM = /(?:[|√]\s?)?[A-Za-zθ][A-Za-z0-9_θ₁₂|√()∠°.,+\-−×÷*\/=²Ωµ∥ ]*[A-Za-z0-9_)|°²Ω]/g;
  QTY = new RegExp(FORM.source + "|" + QTY.source, "g");
  function fixBidi(el) {
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: function (t) {
      for (var p = t.parentNode; p && p !== el; p = p.parentNode) { if (p.nodeName === "svg" || p.nodeName === "SELECT" || p.nodeName === "OPTION" || (p.classList && p.classList.contains("ltr"))) return NodeFilter.FILTER_REJECT; }
      QTY.lastIndex = 0; return QTY.test(t.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
    var list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(function (t) {
      var frag = document.createDocumentFragment(), s = t.nodeValue, last = 0, m; QTY.lastIndex = 0;
      while ((m = QTY.exec(s))) {
        var tok = m[0], cnt = function (c) { return tok.split(c).length - 1; };
        while (/[)\s.,]$/.test(tok) && (tok.slice(-1) !== ")" || cnt("(") < cnt(")"))) tok = tok.slice(0, -1);
        if (!tok) { QTY.lastIndex = m.index + 1; continue; }
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index))); var sp = document.createElement("span"); sp.className = "ltr"; sp.textContent = tok; frag.appendChild(sp); last = m.index + tok.length; QTY.lastIndex = last;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  function initPanel() {
    var card = document.getElementById("exp-card"), pick = document.getElementById("exp-pick");
    if (!card || !CV.lab) return;
    var KEY = "cv.exp", cur = null, st = null, msg = {}, last = { lab: null, res: null };
    var order = []; (CV.courses ? CV.courses[0].chapters : []).forEach(function (ch) { ch.lessons.forEach(function (l) { if (EXP[l.id]) order.push([l.id, ch.ar]); }); });
    if (pick) {
      var g = {}, html = '<option value="">تجارب الدروس الموجّهة…</option>';
      order.forEach(function (o) { (g[o[1]] = g[o[1]] || []).push(o[0]); });
      Object.keys(g).forEach(function (ch) { html += '<optgroup label="' + esc(ch) + '">' + g[ch].map(function (id) { var done = CV.store.labExp(id); return '<option value="' + id + '">' + (done && done.completedAt ? "✓ " : "") + esc(EXP[id].title) + '</option>'; }).join("") + '</optgroup>'; });
      pick.innerHTML = html;
      pick.addEventListener("change", function () { if (this.value) { if (location.hash === "#exp-" + this.value) start(this.value, true); else location.hash = "exp-" + this.value; } this.value = ""; });
    }
    function persist() { try { sessionStorage.setItem(KEY, JSON.stringify({ id: cur, st: st })); } catch (e) {} }
    function start(id, fresh) {
      var x = EXP[id]; if (!x) return;
      cur = id; msg = {};
      var saved = null; try { saved = JSON.parse(sessionStorage.getItem(KEY)); } catch (e) {}
      if (!fresh && saved && saved.id === id && saved.st) st = saved.st;
      else { st = { steps: {}, answers: {}, tries: {}, pts: {} }; CV.lab.load(x.lab, "تجربة: " + x.title); }
      persist(); card.hidden = false; draw(); evalDo();
    }
    function close() { cur = null; st = null; try { sessionStorage.removeItem(KEY); } catch (e) {} card.hidden = true; if (/^#exp-/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search); }
    function curIdx() { var x = EXP[cur]; for (var i = 0; i < x.steps.length; i++) if (!st.steps[i]) return i; return x.steps.length; }
    function helpers() { var L = CV.lab.state(), r = CV.lab.result(); return H(L, r); }
    function finish(i) {
      st.steps[i] = true; persist();
      var x = EXP[cur], done = curIdx() >= x.steps.length;
      CV.store.saveLabExp(cur, { steps: st.steps, answers: st.answers, done: done }, "تجربة: " + x.title);
    }
    function evalDo() {
      if (!cur) return; var x = EXP[cur], i = curIdx(), changed = false;
      while (i < x.steps.length && x.steps[i].check) {
        var ok = false; try { ok = !!x.steps[i].check(helpers()); } catch (e) { ok = false; }
        if (!ok) break; finish(i); changed = true; i = curIdx();
      }
      if (changed) draw(); else liveBits();
    }
    function tol(t, s) { return Math.max(0.02 * Math.abs(t), s.abs || 1e-12); }
    function check(i) {
      var s = EXP[cur].steps[i], box = card.querySelector('[data-step="' + i + '"]'), raw = box.querySelector("input").value.trim().replace(/,/g, ".").replace(/−/g, "-");
      var f = +box.querySelector("select").value, v = parseFloat(raw);
      if (!raw || !isFinite(v) || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(raw)) { msg[i] = ["bad", "اكتب رقمًا فقط، واختر الوحدة من القائمة."]; draw(); return; }
      var h = helpers(), t;
      if (!h.ok) { msg[i] = ["bad", "الدائرة الآن لا تُحل (انظر «حالة الدائرة»). أصلحها أو اضغط «أعد الدائرة»."]; draw(); return; }
      try { t = s.ask(h); } catch (e) { t = NaN; }
      if (!isFinite(t)) { msg[i] = ["bad", "لا أجد العنصر المطلوب في الدائرة الآن. هل حذفته أو استبدلته؟ اضغط «أعد الدائرة» إذا احتجت."]; draw(); return; }
      var a = v * f;
      if (Math.abs(a - t) <= tol(t, s)) { st.answers[i] = { v: a, t: t }; msg[i] = ["ok", "صحيح ✓ — قيمة المحاكاة " + fmt(t, s.units)]; finish(i); draw(); evalDo(); return; }
      st.tries[i] = (st.tries[i] || 0) + 1;
      var hint = Math.abs(a + t) <= tol(t, s) && Math.abs(t) > (s.abs || 1e-12) ? "المقدار صحيح لكن الإشارة معكوسة. راجع اتجاه القياس."
        : [1e-3, 1e3, 1e-6, 1e6].some(function (k) { return Math.abs(a * k - t) <= tol(t, s); }) ? "الرقم قريب لكن الوحدة أو البادئة خطأ (m، µ، k)."
        : "ليست القيمة الصحيحة. اقرأ القياس مرة أخرى من اللوحة.";
      if (st.tries[i] >= 3) { st.answers[i] = { v: null, t: t, shown: true }; msg[i] = ["bad", hint + " القيمة من المحاكاة: " + fmt(t, s.units) + ". انتقل للخطوة التالية."]; finish(i); draw(); evalDo(); persist(); return; }
      msg[i] = ["bad", hint + (st.tries[i] === 2 ? " (محاولة أخيرة قبل عرض القيمة)" : "")]; persist(); draw();
    }
    function record(i) {
      var s = EXP[cur].steps[i], h = helpers(), x, y;
      if (!h.ok) { msg[i] = ["bad", "الدائرة الآن لا تُحل."]; draw(); return; }
      try { x = s.rec.x[2](h); y = s.rec.y[2](h); } catch (e) { x = NaN; }
      if (!isFinite(x) || !isFinite(y)) { msg[i] = ["bad", "لا أستطيع القراءة: هل حذفت عنصرًا من التجربة؟"]; draw(); return; }
      var pts = st.pts[i] = (st.pts[i] || []).filter(function (p) { return Math.abs(p[0] - x) > 1e-9 * Math.max(1, Math.abs(x)); });
      pts.push([x, y]); pts.sort(function (p, q) { return p[0] - q[0]; });
      msg[i] = pts.length < s.rec.min ? ["", "سُجّلت " + pts.length + " من " + s.rec.min + ". غيّر " + s.rec.x[0] + " وسجّل مرة أخرى."] : ["ok", "اكتمل التسجيل ✓"];
      if (pts.length >= s.rec.min) { st.answers[i] = { pts: pts }; finish(i); }
      persist(); draw(); evalDo();
    }
    function plot(s, pts) {
      if (!pts || !pts.length) return "";
      var W = 320, Hh = 176, P = 46, xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(0, xs.concat([0])), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys.concat([0])), y1 = Math.max.apply(0, ys);
      if (x1 === x0) x1 = x0 + 1; if (y1 === y0) y1 = y0 + 1;
      var X = function (v) { return P + (v - x0) / (x1 - x0) * (W - P - 10); }, Y = function (v) { return Hh - 34 - (v - y0) / (y1 - y0) * (Hh - 48); };
      var line = pts.map(function (p, k) { return (k ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ");
      return '<svg class="exp-plot" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="منحنى ' + esc(s.rec.y[0]) + ' مقابل ' + esc(s.rec.x[0]) + '"><line class="ax" x1="' + P + '" y1="' + Y(y0) + '" x2="' + (W - 8) + '" y2="' + Y(y0) + '"/><line class="ax" x1="' + P + '" y1="14" x2="' + P + '" y2="' + (Hh - 34) + '"/>' +
        (pts.length > 1 ? '<path class="ln" d="' + line + '"/>' : "") + pts.map(function (p) { return '<circle class="pt" cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="4"/>'; }).join("") +
        '<text class="tx" x="' + ((P + W) / 2) + '" y="' + (Hh - 4) + '" text-anchor="middle">' + esc(s.rec.x[0]) + ' (' + s.rec.x[1] + ')</text><text class="tx" x="' + (P + 4) + '" y="10">' + esc(s.rec.y[0]) + ' (' + s.rec.y[1] + ')</text>' +
        '<text class="tx" x="' + X(x1).toFixed(1) + '" y="' + (Y(y0) + 12) + '" text-anchor="middle">' + si(x1, s.rec.x[1]) + '</text><text class="tx" x="' + (P - 3) + '" y="' + (Y(y1) + 3).toFixed(1) + '" text-anchor="end">' + si(y1, s.rec.y[1]).replace(" ", "") + '</text></svg>' +
        '<div class="exp-tbl"><table><thead><tr><th>' + esc(s.rec.x[0]) + '</th><th>' + esc(s.rec.y[0]) + '</th></tr></thead><tbody>' + pts.map(function (p) { return '<tr><td class="ltr">' + si(p[0], s.rec.x[1]) + '</td><td class="ltr">' + si(p[1], s.rec.y[1]) + '</td></tr>'; }).join("") + '</tbody></table></div>';
    }
    function phasors(list) {
      var m = Math.max.apply(0, list.map(function (z) { return Cx.abs(z[1]); })) || 1, R = 70, c = 90;
      return '<svg class="exp-plot" viewBox="0 0 180 180" role="img" aria-label="المخطط الفيزوري من قياسات المعمل"><line class="ax" x1="10" y1="90" x2="170" y2="90"/><line class="ax" x1="90" y1="10" x2="90" y2="170"/>' +
        list.map(function (z) { var x = c + z[1].re / m * R, y = c - z[1].im / m * R; return '<line x1="90" y1="90" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + z[2] + '" stroke-width="2.5" stroke-linecap="round"/><text class="tx" x="' + (x + (x > 90 ? 4 : -4)).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="' + (x > 90 ? "start" : "end") + '" fill="' + z[2] + '">' + z[0] + '</text>'; }).join("") + '</svg>';
    }
    function liveBits() {
      if (!cur) return; var x = EXP[cur], d = card.querySelector(".exp-dia");
      if (d && x.diagram) { var h = helpers(); try { d.innerHTML = h.ok ? phasors(x.diagram(h)) : ""; } catch (e) { d.innerHTML = ""; } }
    }
    function label(t) { var L = CV.lab.state(), nm = CV.lab.names(); t = t.replace(/\{@(\d+),(\d+)\}/g, function (m, r, c) { return CV.lab.where ? CV.lab.where(r + "," + c) : m; }); return t.replace(/\{(\w+)\}/g, function (m, tag) { var e = L.edges.filter(function (x) { return x.tag === tag; })[0]; return e && nm[e.id] ? nm[e.id] : tag; }); }
    function draw() {
      if (!cur) return; var x = EXP[cur], n = x.steps.length, i = curIdx(), done = i >= n, lt = lessonTitle(cur);
      var h = '<header class="exp-hd"><div><span class="eyebrow">تجربة موجّهة' + (lt ? ' · <a href="lesson.html#' + cur + '">' + esc(lt) + '</a>' : "") + '</span><h2>' + esc(x.title) + '</h2><p>' + esc(x.intro) + '</p></div>' +
        '<div class="exp-act"><span class="exp-prog">' + Math.min(i, n) + ' من ' + n + '</span><button type="button" class="btn btn-ghost btn-sm" data-x="reload">أعد الدائرة</button><button type="button" class="btn btn-ghost btn-sm" data-x="restart">ابدأ من جديد</button><button type="button" class="btn btn-ghost btn-sm" data-x="close">أغلق</button></div></header>' +
        '<div class="exp-bar"><i style="width:' + (100 * Math.min(i, n) / n) + '%"></i></div><ol class="exp-steps">';
      x.steps.forEach(function (s, k) {
        var cls = st.steps[k] ? "done" : k === i ? "now" : "later", m = msg[k], a = st.answers[k];
        h += '<li class="' + cls + '" data-step="' + k + '"><span class="n">' + (st.steps[k] ? "✓" : k + 1) + '</span><div class="b"><p>' + esc(label(s.t)) + '</p>';
        if (s.check && k === i) h += '<p class="exp-wait">' + '⟳ أنفّذها في اللوحة وسأتحقق تلقائيًا.' + '</p>';
        if (s.ask && st.steps[k] && a) h += '<p class="exp-ans">' + (a.shown ? "قيمة المحاكاة: " : "إجابتك: ") + '<span class="ltr">' + fmt(a.shown ? a.t : a.v, s.units) + '</span></p>';
        if (s.ask && k === i) h += '<div class="exp-in"><input class="input ltr" inputmode="decimal" aria-label="قيمتك" autocomplete="off"><select class="select" aria-label="الوحدة">' + s.units.map(function (u) { return '<option value="' + u.f + '"' + (u.f === 1 ? " selected" : "") + '>' + u.l + '</option>'; }).join("") + '</select><button type="button" class="btn btn-primary btn-sm" data-x="check">تحقق</button></div>';
        if (s.rec && (k === i || st.steps[k])) h += (k === i ? '<div class="exp-in"><button type="button" class="btn btn-primary btn-sm" data-x="rec">سجّل نقطة</button><span class="muted">' + (st.pts[k] || []).length + ' / ' + s.rec.min + '</span></div>' : "") + plot(s, st.pts[k] || (a && a.pts));
        if (m && (k === i || st.steps[k])) h += '<p class="exp-fb ' + m[0] + '" role="status">' + esc(m[1]) + '</p>';
        h += '</div></li>';
      });
      h += '</ol>' + (x.diagram ? '<div class="exp-dia"></div>' : "");
      if (done) h += '<div class="exp-done"><b>اكتملت التجربة ✓</b><span>سُجّلت في تقدمك.</span>' + (lt ? '<a class="btn btn-ghost btn-sm" href="lesson.html#' + cur + '">ارجع إلى الدرس</a>' : "") + '</div>';
      card.innerHTML = h; fixBidi(card); liveBits();
      var inp = card.querySelector(".exp-in input"); if (inp) inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); check(i); } });
    }
    card.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-x]"); if (!b || !cur) return;
      var a = b.dataset.x, i = curIdx();
      if (a === "check") check(i); else if (a === "rec") record(i); else if (a === "close") close();
      else if (a === "reload") { CV.lab.load(EXP[cur].lab, "دائرة التجربة"); }
      else if (a === "restart") { CV.store.resetLabExp(cur); start(cur, true); }
    });
    CV.lab.onUpdate(function () { if (cur) evalDo(); });
    function route() { var m = /^#exp-(.+)$/.exec(location.hash); if (m && EXP[m[1]]) { if (m[1] !== cur) start(m[1], false); return true; } return false; }
    window.addEventListener("hashchange", route);
    if (!route()) { try { var sv = JSON.parse(sessionStorage.getItem(KEY)); if (sv && EXP[sv.id]) start(sv.id, false); } catch (e) {} }
    CV.labExperiments.current = function () { return cur ? { id: cur, steps: st.steps, idx: curIdx(), n: EXP[cur].steps.length } : null; };
  }
  CV.labExperiments = { list: EXP, unavailable: UNAVAILABLE, H: H };
  if (typeof document !== "undefined") { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPanel); else initPanel(); }
})();
