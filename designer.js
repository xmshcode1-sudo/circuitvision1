/* CircuitVision — «صمّم دائرتك»: the student builds a circuit, picks what to find, and solves it.
   Start from an empty grid, from one of the generator shapes, or from the current generated exercise.
   Pick a tool (wire, resistor, voltage source, current source, terminals a–b, eraser) and tap branches.
   Every design is checked by the MNA solver before it becomes an exercise; when it cannot be solved,
   the student is told why (no source, a dangling element, a shorted element, separate parts, two voltage
   sources in parallel…). The exercise then runs in the same practice widget as generated ones: answer
   checking with Smart Feedback, hints, the step-by-step workspace checked against this circuit, and the
   full solution. Nothing is computed outside the solver. Needs mna, draw, gen, analysis, shapes, practice. */
(function () {
  "use strict";
  var CV = window.CV;
  var TOOLS = [
    { t: "W", ar: "سلك", en: "Wire" }, { t: "R", ar: "مقاومة", en: "Resistor" }, { t: "V", ar: "مصدر جهد", en: "Voltage source" },
    { t: "I", ar: "مصدر تيار", en: "Current source" }, { t: "T", ar: "طرفا a و b", en: "Terminals a–b" }, { t: "X", ar: "ممحاة", en: "Eraser" }
  ];
  var DEF = { R: 10, V: 12, I: 2 }, UNIT = { R: "Ω", V: "V", I: "A" };
  var KEY = "cv-designer-v1";
  function K(p) { return p[0] + "," + p[1]; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- templates ---------- */
  function gridSlots(rows, cols) {
    var e = [], r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < cols - 1; c++) e.push({ a: [r, c], b: [r, c + 1] });
    for (r = 0; r < rows - 1; r++) for (c = 0; c < cols; c++) e.push({ a: [r, c], b: [r + 1, c] });
    return e;
  }
  function template(id) {
    var m = /^grid(\d)x(\d)$/.exec(id);
    if (m) return { id: id, rows: +m[1], cols: +m[2], slots: gridSlots(+m[1], +m[2]).map(function (s) { s.el = null; return s; }) };
    var G = CV.shapes.geometry(id);
    return { id: id, shape: id, rows: G.rows, cols: G.cols, center: G.center, embed: G.embed,
      slots: G.edges.map(function (e) { var s = { a: e.a, b: e.b, el: { type: "W" } }; if (e.arc) { s.arc = e.arc; s.fixed = true; } return s; }) };
  }
  /* the exercise currently shown by the generator, as an editable design (dependent sources become resistors) */
  function fromCircuit(c) {
    var d = c.shape ? template(c.shape) : { id: "gen", rows: c.rows, cols: c.cols, slots: gridSlots(c.rows, c.cols).map(function (s) { s.el = null; return s; }) };
    var by = {}; c.edges.forEach(function (e) { by[K(e.a) + "|" + K(e.b)] = e; });
    d.slots.forEach(function (s) {
      var e = by[K(s.a) + "|" + K(s.b)];
      if (!e) { if (!s.fixed) s.el = null; return; }
      var t = e.type;
      if (t === "R" || t === "V" || t === "I" || t === "W" || t === "T") s.el = { type: t, value: e.value, plus: e.plus, dir: e.dir };
      else s.el = { type: "R", value: 10 };
      if (s.el.type === "V" && !s.el.plus) s.el.plus = "a";
      if (s.el.type === "I" && !s.el.dir) s.el.dir = "ab";
    });
    d.id = "gen";
    return d;
  }

  /* ---------- design → circuit ---------- */
  function circuitOf(d) {
    var c = { rows: d.rows, cols: d.cols, edges: [] };
    if (d.shape) { c.shape = d.shape; c.center = d.center; c.embed = d.embed; c.family = "custom"; }
    d.slots.forEach(function (s, i) {
      if (!s.el) return;
      var e = { a: s.a, b: s.b, type: s.el.type, slot: i };
      if (s.arc) e.arc = s.arc;
      if (s.el.value !== undefined && s.el.type !== "W" && s.el.type !== "T") e.value = s.el.value;
      if (s.el.type === "V") e.plus = s.el.plus || "a";
      if (s.el.type === "I") e.dir = s.el.dir || "ab";
      if (s.a[0] === s.b[0] && !d.shape) e.h = true;
      c.edges.push(e);
    });
    CV.gen._internal.nameAll(c);
    return c;
  }

  /* connected parts of the drawing (T = open terminals, not a connection) */
  function parts(edges) {
    var par = {}, f = function (k) { if (par[k] === undefined) par[k] = k; while (par[k] !== k) k = par[k] = par[par[k]]; return k; };
    edges.forEach(function (e) { var x = f(K(e.a)), y = f(K(e.b)); if (x !== y) par[x] = y; });
    return f;
  }

  /* Is the design an exercise? → { ok, msg, sol, loops, c, open } */
  function check(d) {
    var c = circuitOf(d), open = c.edges.filter(function (e) { return e.type !== "T"; });
    var els = open.filter(function (e) { return e.type !== "W"; });
    var src = els.filter(function (e) { return e.type === "V" || e.type === "I"; });
    var res = els.filter(function (e) { return e.type === "R"; });
    var port = c.edges.filter(function (e) { return e.type === "T"; });
    var out = { ok: false, c: c, port: port[0] || null };
    if (!c.edges.length) { out.msg = "ابدأ برسم دائرتك: اختر أداة من الأعلى ثم اضغط على الخطوط المنقطة."; out.idle = true; return out; }
    if (port.length > 1) { out.msg = "ضع طرفي a و b مرة واحدة فقط."; return out; }
    if (!res.length) { out.msg = "أضف مقاومة واحدة على الأقل."; return out; }
    if (!src.length && !port.length) { out.msg = "أضف مصدر جهد أو مصدر تيار، أو ضع طرفي a و b لتسأل عن المقاومة المكافئة."; return out; }
    // dangling ends: an element whose end touches nothing else carries no current
    var deg = {}; c.edges.forEach(function (e) { [e.a, e.b].forEach(function (p) { deg[K(p)] = (deg[K(p)] || 0) + 1; }); });
    if (!port.length) {
      var dang = els.filter(function (e) { return deg[K(e.a)] < 2 || deg[K(e.b)] < 2; })[0];
      if (dang) { out.msg = "<span class='ltr'>" + dang.name + "</span> طرفه معلّق: لا يمر فيه تيار. صِل طرفه بباقي الدائرة أو احذفه."; out.bad = dang.slot; return out; }
    }
    // separate parts
    var f = parts(c.edges), groups = {};
    c.edges.forEach(function (e) { if (e.type !== "W") groups[f(K(e.a))] = 1; });
    if (Object.keys(groups).length > 1) { out.msg = "دائرتك فيها أجزاء منفصلة لا يصل بينها أي سلك. صِلها ببعض أو احذف الجزء الزائد."; return out; }
    // ground: the lowest, then leftmost point of the circuit
    var pts = {}; open.forEach(function (e) { pts[K(e.a)] = e.a; pts[K(e.b)] = e.b; });
    var gl = Object.keys(pts).map(function (k) { return pts[k]; }).sort(function (p, q) { return q[0] - p[0] || p[1] - q[1]; });
    c.ground = gl[0];
    out.loops = CV.shapes.electricalLoops(c);
    c.meshes = out.loops;
    out.open = { rows: c.rows, cols: c.cols, ground: c.ground, shape: c.shape, center: c.center, embed: c.embed, edges: open };
    if (src.length) {
      var sol;
      try { sol = CV.mna.solve(out.open); } catch (err) { sol = { ok: false, reason: "singular" }; }
      if (!sol.ok) {
        if (sol.reason === "shorted") { out.msg = "<span class='ltr'>" + sol.edge.name + "</span> مقصور: طرفاه على نفس العقدة لأن سلكًا يصل بينهما، فلا جهد عليه. احذف السلك أو انقل العنصر."; out.bad = sol.edge.slot; }
        else out.msg = "لا يمكن حل هذه الدائرة. الأسباب الشائعة: مصدرا جهد على التوازي أو حلقة من مصادر جهد وأسلاك فقط، أو مصدر تيار في فرع لا يكمل دائرة، أو مصدرا تيار على التوالي.";
        return out;
      }
      if (Math.abs(sol.powerSum) > 1e-6 * (1 + sol.elements.reduce(function (s, it) { return s + Math.abs(it.p); }, 0))) { out.msg = "توازن القدرة لم يتحقق في هذه الدائرة، فلن أعرضها كتمرين."; return out; }
      out.sol = sol;
    }
    out.ok = true;
    return out;
  }

  /* equivalent resistance between a and b with the independent sources turned off */
  function reqOf(chk) {
    var c = chk.c, edges = [];
    c.edges.forEach(function (e) {
      if (e.type === "I") return;                                   // current source → open
      var x = {}; for (var k in e) x[k] = e[k];
      if (e.type === "V") { x.type = "W"; delete x.value; delete x.plus; } // voltage source → wire
      edges.push(x);
    });
    var cR = { rows: c.rows, cols: c.cols, ground: c.ground, shape: c.shape, edges: edges };
    var v = null; try { v = CV.gen.reqValue(cR); } catch (e) { v = null; }
    if (v === null || !isFinite(v) || !(v > 1e-9)) return null;
    var red = CV.gen.reduce(cR);
    if (!red.ok || Math.abs(red.value - v) > 1e-6 * Math.max(1, v)) red = { ok: false, steps: [] };
    var allR = edges.filter(function (e) { return e.type === "R"; });
    return { value: v, red: red, sumAll: allR.reduce(function (s, e) { return s + e.value; }, 0), parAll: 1 / allR.reduce(function (s, e) { return s + 1 / e.value; }, 0) };
  }

  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 900000 + 100000; }

  /* ---------- UI ---------- */
  function mount(root, opts) {
    opts = opts || {};
    var uid = "dz" + Math.random().toString(36).slice(2, 7);
    var tool = "R", sel = -1, d = null, chk = null;
    var shapeOpts = CV.shapes.LIST.map(function (id) { return '<option value="' + id + '">' + esc(CV.shapes.name(id)) + '</option>'; }).join("");
    root.classList.add("dz");
    root.innerHTML =
      '<div class="dz-top"><div class="field"><label for="' + uid + '-base">ابدأ من</label><select class="select" id="' + uid + '-base">' +
        '<option value="grid3x3">شبكة فارغة 3×3</option><option value="grid3x4">شبكة فارغة 3×4</option><option value="grid4x4">شبكة فارغة 4×4</option>' +
        '<optgroup label="أشكال">' + shapeOpts + '</optgroup>' + (opts.fromGen ? '<option value="gen">تمرين المولّد الحالي</option>' : '') + '</select></div>' +
        '<button type="button" class="btn btn-ghost btn-sm dz-reset">ابدأ من جديد</button></div>' +
      '<div class="dz-tools" role="toolbar" aria-label="أدوات الرسم">' + TOOLS.map(function (t) { return '<button type="button" class="dz-tool" data-t="' + t.t + '" aria-pressed="' + (t.t === tool) + '">' + t.ar + '</button>'; }).join("") + '</div>' +
      '<p class="dz-help muted">اختر أداة ثم اضغط على أي فرع في الرسم (الخطوط المنقطة فروع فارغة). اضغط على عنصر موجود لتعديل قيمته أو قلب اتجاهه.</p>' +
      '<div class="dz-fig"></div>' +
      '<div class="dz-edit" hidden></div>' +
      '<p class="dz-status" aria-live="polite"></p>' +
      '<div class="dz-ask" hidden><div class="field"><label for="' + uid + '-q">ماذا تريد أن تحسب؟</label><select class="select" id="' + uid + '-q"></select></div>' +
        '<button type="button" class="btn btn-primary btn-sm dz-go">أنشئ التمرين</button></div>' +
      '<div class="dz-ex" hidden></div>';
    var $ = function (s) { return root.querySelector(s); };
    var ex = CV.practice.mount($(".dz-ex"), { custom: true, hideNew: true, lessonId: "designer" });

    function save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
    function load() { try { var x = JSON.parse(localStorage.getItem(KEY) || "null"); if (x && x.slots && x.rows) return x; } catch (e) {} return null; }

    function start(id) {
      if (id === "gen") { var g = opts.fromGen && opts.fromGen(); if (!g || !g.circuit || g.circuit.omega) { status("لا يوجد تمرين تيار مستمر في المولّد الآن لأنسخه.", "warn"); $("#" + uid + "-base").value = d ? d.id : "grid3x3"; return; } d = fromCircuit(g.circuit); }
      else d = template(id);
      sel = -1; changed();
    }
    function status(html, cls) { var p = $(".dz-status"); p.className = "dz-status " + (cls || ""); p.innerHTML = html; }

    function draw() {
      var c = chk ? chk.c : circuitOf(d), svg = CV.draw.render(c, { aria: "الدائرة التي تصممها" }), P = CV.draw.pt, add = [];
      d.slots.forEach(function (s, i) {
        if (s.fixed) return;
        var A = P(s.a), B = P(s.b), xy = 'x1="' + A[0] + '" y1="' + A[1] + '" x2="' + B[0] + '" y2="' + B[1] + '"';
        if (!s.el) add.push('<line class="dz-empty" ' + xy + '/>');
        if (i === sel || (chk && chk.bad === i)) add.push('<line class="dz-sel' + (i === sel ? "" : " dz-badl") + '" ' + xy + '/>');
        add.push('<line class="dz-hit" data-i="' + i + '" ' + xy + '><title>فرع ' + (i + 1) + '</title></line>');
      });
      var dots = {}; d.slots.forEach(function (s) { if (!s.fixed) { dots[K(s.a)] = s.a; dots[K(s.b)] = s.b; } });
      Object.keys(dots).forEach(function (k) { var p = P(dots[k]); add.unshift('<circle class="dz-pt" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'); });
      svg = svg.replace(/<\/svg>$/, add.join("") + "</svg>").replace('<svg class="sc"', '<svg class="sc dz-svg"');
      $(".dz-fig").innerHTML = svg;
    }

    function editPanel() {
      var box = $(".dz-edit"), s = d.slots[sel];
      if (sel < 0 || !s || !s.el || !(s.el.type in UNIT)) { box.hidden = true; return; }
      var e = chk && chk.c.edges.filter(function (x) { return x.slot === sel; })[0], nm = e ? e.name : "";
      box.hidden = false;
      box.innerHTML = '<b class="ltr">' + esc(nm) + '</b><label class="dz-val">القيمة <input class="input" id="' + uid + '-v" type="number" inputmode="decimal" min="0" step="any" dir="ltr" value="' + s.el.value + '"> <span class="ltr">' + UNIT[s.el.type] + '</span></label>' +
        (s.el.type === "R" ? "" : '<button type="button" class="btn btn-ghost btn-sm dz-flip">' + (s.el.type === "V" ? "اقلب القطبية (+ −)" : "اقلب اتجاه السهم") + '</button>') +
        '<button type="button" class="btn btn-ghost btn-sm dz-del">احذف</button>';
      var inp = box.querySelector("input");
      inp.addEventListener("change", function () {
        var v = parseFloat(inp.value);
        if (!(v > 0) || v > 1e6) { inp.value = s.el.value; status("اكتب قيمة موجبة (حتى مليون).", "warn"); return; }
        s.el.value = v; changed(true);
      });
      var fl = box.querySelector(".dz-flip");
      if (fl) fl.addEventListener("click", function () { if (s.el.type === "V") s.el.plus = s.el.plus === "a" ? "b" : "a"; else s.el.dir = s.el.dir === "ab" ? "ba" : "ab"; changed(true); });
      box.querySelector(".dz-del").addEventListener("click", function () { s.el = d.shape ? { type: "W" } : null; sel = -1; changed(); });
    }

    function askList() {
      var o = [], c = chk.c;
      if (chk.sol) c.edges.forEach(function (e) {
        if (e.type === "R") { o.push(["iR|" + e.name, "التيار في " + e.name]); o.push(["vR|" + e.name, "الجهد على " + e.name]); o.push(["pR|" + e.name, "القدرة في " + e.name]); }
      });
      if (chk.sol) c.edges.forEach(function (e) { if (e.type === "V" || e.type === "I") o.push(["pSrc|" + e.name, "القدرة التي يمتصها المصدر " + e.name]); });
      if (chk.port) o.unshift(["Req|ab", "المقاومة المكافئة بين a و b"]);
      $("#" + uid + "-q").innerHTML = o.map(function (x) { return '<option value="' + x[0] + '">' + esc(x[1]) + '</option>'; }).join("");
    }

    function changed(keepSel) {
      chk = check(d);
      if (!keepSel && sel >= 0 && (!d.slots[sel] || !d.slots[sel].el)) sel = -1;
      draw(); editPanel(); save();
      $(".dz-ex").hidden = true;
      if (chk.ok) {
        var nR = chk.c.edges.filter(function (e) { return e.type === "R"; }).length;
        status("✓ الدائرة صحيحة ويمكن حلها: " + (chk.loops === 1 ? "حلقة واحدة" : chk.loops === 2 ? "حلقتان" : chk.loops + " حلقات") + "، " + (nR === 1 ? "مقاومة واحدة" : nR === 2 ? "مقاومتان" : nR + " مقاومات") + ". اختر المطلوب وأنشئ التمرين.", "ok");
        askList(); $(".dz-ask").hidden = false;
      } else { status(chk.msg, chk.idle ? "" : "warn"); $(".dz-ask").hidden = true; }
    }

    function build() {
      if (!chk || !chk.ok) return;
      var v = $("#" + uid + "-q").value.split("|"), kind = v[0], el = v[1], c = chk.c, g;
      c.edges.forEach(function (e) { delete e.asked; });
      var seed = hash(JSON.stringify(d.slots.map(function (s) { return s.el; })) + d.id + kind + el);
      if (kind === "Req") {
        var r = reqOf(chk);
        if (!r) { status("لا توجد مقاومة مكافئة محددة بين a و b في هذا الرسم (الطرفان غير متصلين بمقاومات، أو مقصوران).", "warn"); return; }
        var pre = c.edges.some(function (e) { return e.type === "V" || e.type === "I"; }) ? ["<b>أطفئ المصادر المستقلة:</b> مصدر الجهد يصبح سلكًا، ومصدر التيار يصبح دائرة مفتوحة."] : [];
        var red = r.red.ok ? { ok: true, steps: pre.concat(r.red.steps), usedDY: r.red.usedDY } : { ok: false, steps: pre.concat(["هذه الدائرة لا تُختزل بالتوالي والتوازي وتحويل Δ-Y وحدها خطوة بخطوة هنا، فالقيمة من محرك الحل باختبار مصدر 1 A بين a و b: <span class='eq-i'>R<sub>ab</sub> = v<sub>ab</sub> / 1 A</span>."]) };
        g = { circuit: c, family: "custom", seed: seed, custom: true, loops: chk.loops, reduction: red,
          question: { kind: "Req", value: r.value, unit: "Ω", el: "ab" }, solution: { elements: [], byName: {}, powerSum: 0 }, sumAll: r.sumAll, parAll: r.parAll };
      } else {
        var it = chk.sol.byName[el], val = kind === "iR" ? it.i : kind === "vR" ? it.v : it.p;
        c.edges.forEach(function (e) { if (e.name === el) e.asked = kind; });
        g = { circuit: c, family: "custom", seed: seed, custom: true, loops: chk.loops, solution: chk.sol,
          question: { kind: kind, el: el, value: Math.abs(val) < 1e-12 ? 0 : val, unit: kind === "iR" ? "A" : kind === "vR" ? "V" : "W" } };
      }
      $(".dz-ex").hidden = false;
      ex.show(g);
      if (Math.abs(g.question.value) < 1e-9) status("ملاحظة: الناتج في دائرتك صفر. هذا صحيح فيزيائيًا (مثل قنطرة متزنة أو فرع لا يمر فيه تيار)، لكن قد ترغب بتغيير القيم.", "warn");
      $(".dz-ex").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $(".dz-tools").addEventListener("click", function (ev) {
      var b = ev.target.closest(".dz-tool"); if (!b) return;
      tool = b.dataset.t;
      root.querySelectorAll(".dz-tool").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    });
    $(".dz-fig").addEventListener("click", function (ev) {
      var h = ev.target.closest(".dz-hit"); if (!h) return;
      var i = +h.getAttribute("data-i"), s = d.slots[i];
      if (tool === "X") { s.el = null; sel = -1; changed(); return; }
      if (s.el && s.el.type === tool) { sel = i; draw(); editPanel(); return; }
      if (tool === "T") d.slots.forEach(function (x) { if (x.el && x.el.type === "T") x.el = d.shape ? { type: "W" } : null; });
      s.el = { type: tool };
      if (tool in DEF) { s.el.value = DEF[tool]; if (tool === "V") s.el.plus = "a"; if (tool === "I") s.el.dir = "ab"; sel = i; } else sel = -1;
      changed(true);
    });
    $(".dz-go").addEventListener("click", build);
    $(".dz-reset").addEventListener("click", function () { start($("#" + uid + "-base").value); });
    $("#" + uid + "-base").addEventListener("change", function () { start(this.value); });

    var saved = load();
    if (saved) { d = saved; var bs = $("#" + uid + "-base"); if (bs.querySelector('option[value="' + d.id + '"]')) bs.value = d.id; changed(); }
    else start("grid3x3");
    return { design: function () { return d; }, check: function () { return chk; }, start: start, build: build, ex: ex };
  }

  CV.designer = { mount: mount, check: check, circuitOf: circuitOf, template: template, fromCircuit: fromCircuit, reqOf: reqOf };
})();
