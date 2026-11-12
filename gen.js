/* CircuitVision — circuit problem generator.
   Builds circuits with different TOPOLOGIES, not just different values:
     loop    one closed loop (series elements)              → KVL
     pair    all elements between one pair of nodes         → KCL
     ladder  2-row ladder with 2–3 windows                  → KCL + KVL
     grid    3×3 junction grid with 2–4 meshes, edges removed at random (bridges, L-shapes…)
   Dependent sources can replace an independent source at higher difficulty.
   Every candidate is solved with the MNA engine and rejected if it is invalid
   (singular, shorted element, dangling branch) or gives an unusable answer. */
(function (root) {
  "use strict";
  var MNA = root.CV.mna;

  function rng(seed) { // mulberry32
    var s = seed >>> 0;
    var f = function () { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    f.int = function (a, b) { return a + Math.floor(f() * (b - a + 1)); };
    f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
    f.shuffle = function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(f() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    return f;
  }

  var RV = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40];
  var VV = [5, 6, 8, 10, 12, 15, 18, 20, 24, 30, 36, 40, 48, 50, 60];
  var IV = [0.5, 1, 1.5, 2, 3, 4, 5, 6];

  function gridEdges(rows, cols) {
    var e = [], r, c;
    for (r = 0; r < rows; r++) for (c = 0; c < cols - 1; c++) e.push({ a: [r, c], b: [r, c + 1], h: true });
    for (r = 0; r < rows - 1; r++) for (c = 0; c < cols; c++) e.push({ a: [r, c], b: [r + 1, c], h: false });
    return e;
  }
  function isPerimeter(e, rows, cols) {
    if (e.h) return e.a[0] === 0 || e.a[0] === rows - 1;
    return e.a[1] === 0 || e.a[1] === cols - 1;
  }
  function key(p) { return p[0] + "," + p[1]; }

  /* Every edge must lie on a cycle (no bridges), and the graph must be connected. */
  function bridgeless(edges) {
    function connected(list) {
      if (!list.length) return false;
      var adj = {}; list.forEach(function (e) { (adj[key(e.a)] = adj[key(e.a)] || []).push(key(e.b)); (adj[key(e.b)] = adj[key(e.b)] || []).push(key(e.a)); });
      var start = key(list[0].a), seen = {}, st = [start]; seen[start] = 1;
      while (st.length) { var k = st.pop(); (adj[k] || []).forEach(function (n) { if (!seen[n]) { seen[n] = 1; st.push(n); } }); }
      return Object.keys(adj).every(function (k) { return seen[k]; });
    }
    if (!connected(edges)) return false;
    for (var i = 0; i < edges.length; i++) {
      var rest = edges.slice(0, i).concat(edges.slice(i + 1));
      var ends = [key(edges[i].a), key(edges[i].b)];
      var touched = {}; rest.forEach(function (e) { touched[key(e.a)] = 1; touched[key(e.b)] = 1; });
      if (!touched[ends[0]] || !touched[ends[1]] || !connected(rest)) return false;
    }
    return true;
  }

  function addSource(e, R, kind) {
    e.type = kind;
    if (kind === "V") { e.value = R.pick(VV); e.plus = R() < 0.5 ? "a" : "b"; }
    else { e.value = R.pick(IV); e.dir = R() < 0.5 ? "ab" : "ba"; }
  }
  function addRes(e, R) { e.type = "R"; e.value = R.pick(RV); }

  var FAMILIES = {
    loop: function (R, o) {
      var cols = R.int(2, 3), rows = 2, edges = gridEdges(rows, cols).filter(function (e) { return isPerimeter(e, rows, cols); });
      var order = R.shuffle(edges.map(function (_, i) { return i; }));
      var nSrc = o.single ? 1 : o.allowI ? 1 + (R() < 0.5 ? 1 : 0) : R.int(1, 2);
      order.forEach(function (idx, k) {
        var e = edges[idx];
        if (k < nSrc) addSource(e, R, o.allowI && k === 1 ? "I" : "V");
        else if (k < nSrc + 2 || R() < 0.65) addRes(e, R);
        else e.type = "W";
      });
      return { rows: rows, cols: cols, edges: edges, family: "loop" };
    },
    pair: function (R, o) {
      var cols = R.int(3, 4), rows = 2;
      var edges = gridEdges(rows, cols);
      var verts = edges.filter(function (e) { return !e.h; });
      edges.filter(function (e) { return e.h; }).forEach(function (e) { e.type = "W"; });
      var order = R.shuffle(verts);
      var nI = !o.single && cols === 4 && R() < 0.5 ? 2 : 1;
      order.forEach(function (e, k) { if (k < nI) addSource(e, R, "I"); else addRes(e, R); });
      return { rows: rows, cols: cols, edges: edges, family: "pair" };
    },
    ladder: function (R) {
      var cols = R.int(3, 4), rows = 2, edges = gridEdges(rows, cols);
      edges.forEach(function (e) {
        if (e.h && e.a[0] === 1) { if (R() < 0.8) e.type = "W"; else addRes(e, R); }
        else addRes(e, R);
      });
      var srcCount = R() < 0.6 ? 1 : 2;
      var candidates = R.shuffle(edges);
      for (var k = 0; k < srcCount; k++) addSource(candidates[k], R, R() < 0.7 ? "V" : "I");
      return { rows: rows, cols: cols, edges: edges, family: "ladder" };
    },
    grid: function (R) {
      var rows = 3, cols = 3, all = gridEdges(rows, cols), edges;
      for (var tries = 0; tries < 20; tries++) {
        var inner = R.shuffle(all.filter(function (e) { return !isPerimeter(e, rows, cols); }));
        var drop = R.int(0, 2), dropped = inner.slice(0, drop);
        edges = all.filter(function (e) { return dropped.indexOf(e) === -1; }).map(function (e) { return { a: e.a, b: e.b, h: e.h }; });
        if (bridgeless(edges)) break;
      }
      edges.forEach(function (e) { if (R() < 0.72) addRes(e, R); else e.type = "W"; });
      var srcCount = R() < 0.55 ? 1 : 2;
      var cand = R.shuffle(edges);
      for (var k = 0; k < srcCount; k++) addSource(cand[k], R, R() < 0.7 ? "V" : "I");
      return { rows: rows, cols: cols, edges: edges, family: "grid" };
    }
  };

  function makeDependent(c, R) {
    var srcs = c.edges.filter(function (e) { return e.type === "V" || e.type === "I"; });
    var res = c.edges.filter(function (e) { return e.type === "R"; });
    if (srcs.length < 2 && res.length < 2) return false;
    // keep at least one independent source
    var indep = srcs.length;
    var target = indep >= 2 ? R.pick(srcs) : R.pick(res);
    var ctrl = R.pick(res.filter(function (r) { return r !== target; }));
    if (!ctrl) return false;
    var kinds = ["CCCS", "CCVS", "VCVS", "VCCS"];
    var kind = R.pick(kinds);
    target.type = kind; delete target.plus; delete target.dir;
    if (kind === "CCCS") { target.value = R.pick([0.5, 2, 3, 4]); target.dir = R() < 0.5 ? "ab" : "ba"; }
    if (kind === "VCCS") { target.value = R.pick([0.1, 0.2, 0.25, 0.5]); target.dir = R() < 0.5 ? "ab" : "ba"; }
    if (kind === "VCVS") { target.value = R.pick([2, 3, 4, 5]); target.plus = R() < 0.5 ? "a" : "b"; }
    if (kind === "CCVS") { target.value = R.pick([2, 4, 5, 6, 8, 10]); target.plus = R() < 0.5 ? "a" : "b"; }
    target.ctrlRef = ctrl;
    return true;
  }

  function nameAll(c) {
    var rn = 0, vn = 0, inn = 0;
    var nonW = c.edges.filter(function (e) { return e.type !== "W"; });
    var vCount = nonW.filter(function (e) { return e.type === "V"; }).length;
    var iCount = nonW.filter(function (e) { return e.type === "I"; }).length;
    // reading order: top-to-bottom, then left-to-right
    nonW.slice().sort(function (x, y) { return (x.a[0] + x.b[0]) - (y.a[0] + y.b[0]) || (x.a[1] + x.b[1]) - (y.a[1] + y.b[1]); }).forEach(function (e) {
      if (e.type === "R") e.name = "R" + (++rn);
      else if (e.type === "V") e.name = vCount > 1 ? "V" + (++vn) : "Vs";
      else if (e.type === "I") e.name = iCount > 1 ? "I" + (++inn) : "Is";
      else if (e.type === "T") e.name = "ab";
      else e.name = "D";
    });
    nonW.forEach(function (e) { if (e.ctrlRef) { e.ctrl = e.ctrlRef.name; e.ctrlRef.isCtrl = true; delete e.ctrlRef; } });
  }

  function clean(v) { var s = Math.abs(v) < 1 ? v * 1000 : v; return Math.abs(s * 10 - Math.round(s * 10)) < 1e-6; }
  var nice = function (v) { return Math.abs(v) >= 0.01 && Math.abs(v) <= 2000; };

  /* Main entry. opts: { seed, families:[...], dependent:boolean, types:[...] } */
  function generate(opts) {
    if (opts.req) return generateReq(opts);
    if (opts.ac && root.CV.ac) return root.CV.ac.generate(opts);
    if (opts.kind && root.CV.analysis) return root.CV.analysis.generate(opts);
    var seed = opts.seed >>> 0, attempt = 0;
    while (attempt < 400) {
      var R = rng(seed + attempt * 7919);
      attempt++;
      var fam = R.pick(opts.families || ["loop", "pair", "ladder", "grid"]);
      var c = FAMILIES[fam](R, { allowI: !!opts.allowI, single: !!opts.single });
      if (opts.dependent && !makeDependent(c, R)) continue;
      nameAll(c);
      var nRes = c.edges.filter(function (e) { return e.type === "R"; }).length;
      if (nRes < 2) continue;
      var sol;
      try { sol = MNA.solve(c); } catch (err) { continue; }
      if (!sol.ok) continue;
      if (Math.abs(sol.powerSum) > 1e-6) continue;
      if (opts.dependent) {
        var dep = sol.byName.D, ctl = dep && sol.byName[dep.edge.ctrl];
        if (!dep || Math.abs(dep.i) < 1e-3 || Math.abs(ctl.i) < 1e-3) continue;
      }
      var q = pickQuestion(c, sol, R, opts.types || ["iR", "vR", "pR", "pSrc"]);
      if (!q) continue;
      // Students solve by hand: prefer answers that come out clean (one decimal in the display unit).
      if (attempt < 250 && !clean(q.value)) { c.edges.forEach(function (e) { delete e.asked; delete e.isCtrl; }); continue; }
      c.seed = seed; c.attempt = attempt;
      return { circuit: c, solution: sol, question: q, family: fam, seed: seed };
    }
    return null;
  }

  function pickQuestion(c, sol, R, types) {
    var opts = [];
    sol.elements.forEach(function (it) {
      var e = it.edge;
      if (e.type === "R") {
        if (types.indexOf("iR") > -1 && nice(it.i)) opts.push({ kind: "iR", el: e.name, value: it.i, unit: "A" });
        if (types.indexOf("vR") > -1 && nice(it.v)) opts.push({ kind: "vR", el: e.name, value: it.v, unit: "V" });
        if (types.indexOf("pR") > -1 && nice(it.p)) opts.push({ kind: "pR", el: e.name, value: it.p, unit: "W" });
      } else if (types.indexOf("pSrc") > -1 && nice(it.p)) {
        opts.push({ kind: "pSrc", el: e.name, value: it.p, unit: "W" });
      }
      if (e.type !== "R" && e.type !== "V" && e.type !== "I" && types.indexOf("ctrl") > -1) {
        var ctl = sol.byName[e.ctrl];
        var isCurr = e.type === "CCCS" || e.type === "CCVS";
        var val = isCurr ? ctl.i : ctl.v;
        if (nice(val)) opts.push({ kind: isCurr ? "iR" : "vR", el: e.ctrl, value: val, unit: isCurr ? "A" : "V", isCtrl: true });
      }
    });
    if (!opts.length) return null;
    var ctrlFirst = opts.filter(function (o) { return o.isCtrl; });
    var q = ctrlFirst.length && R() < 0.6 ? R.pick(ctrlFirst) : R.pick(opts);
    // annotate the asked element so the drawing shows its reference arrow/polarity
    c.edges.forEach(function (e) { if (e.name === q.el) e.asked = q.kind; });
    return q;
  }

  /* Wrong-but-plausible values for this question, each with a classified explanation.
     Values are checked by the feedback engine before its automatic patterns. */
  function distractors(gen) {
    var q = gen.question, sol = gen.solution, out = [];
    var el = sol.byName[q.el], e = el.edge;
    function add(value, type, why, hint) {
      if (!isFinite(value)) return;
      var a = Math.abs(q.value), d = Math.abs(Math.abs(value) - a);
      // A value equal to ±answer is either correct or a sign error; never blame another element for it.
      if (d <= 0.01 * Math.max(a, 1e-9) && type !== "sign") return;
      if (Math.abs(value - q.value) <= 0.01 * Math.max(a, 1e-9)) return;
      if (out.some(function (o) { return Math.abs(o.value - value) <= 0.01 * Math.max(Math.abs(value), 1e-9); })) return;
      out.push({ value: value, type: type, why: why, hint: hint });
    }
    sol.elements.forEach(function (it) {
      if (it.edge.name === q.el || it.edge.type === "W") return;
      var same = q.kind === "iR" ? it.i : q.kind === "vR" ? it.v : it.p;
      var label = q.kind === "iR" ? "التيار" : q.kind === "vR" ? "الجهد" : "القدرة";
      add(same, "substitution", "هذه قيمة " + label + " في <span class='ltr'>" + it.edge.name + "</span> وليس في <span class='ltr'>" + q.el + "</span>. حلّك للدائرة قد يكون صحيحًا، لكنك أخذت العنصر الخطأ.", "تأكد من العنصر المطلوب في السؤال.");
      if (q.kind !== "iR") add(-same, "substitution", "هذه قيمة " + label + " في <span class='ltr'>" + it.edge.name + "</span> بإشارة معكوسة، وليست للعنصر <span class='ltr'>" + q.el + "</span>.");
    });
    if (e.type === "R") {
      if (q.kind === "iR") { add(el.v * e.value, "formula", "ضربت الجهد في المقاومة. قانون أوم: <span class='ltr'>i = v / R</span>."); }
      if (q.kind === "vR") { add(el.i / e.value, "formula", "قسمت التيار على المقاومة. قانون أوم: <span class='ltr'>v = iR</span>."); }
      if (q.kind === "pR") {
        add(el.i * e.value, "formula", "حسبت <span class='ltr'>iR</span>، وهذا جهد المقاومة. القدرة <span class='ltr'>p = i²R</span>.");
        add(el.i * el.i / e.value, "formula", "قسمت على R. القدرة <span class='ltr'>p = i²R</span> أو <span class='ltr'>v²/R</span>.");
        add(-el.p, "sign", "المقاومة تمتص القدرة دائمًا، فقدرتها الممتصة موجبة.");
      }
    }
    if (q.kind === "pSrc") add(-q.value, "sign", "مقدار القدرة صحيح لكن إشارتها معكوسة. طبّق اصطلاح الإشارة: إذا دخل التيار من الطرف + فالقدرة الممتصة <span class='ltr'>p = vi</span>، وإذا خرج منه فهي <span class='ltr'>p = −vi</span>.", "حدد اتجاه التيار الفعلي في المصدر أولًا.");
    return out;
  }

  /* Step-by-step text for the families that have a direct method at this point of the course. */
  function steps(gen) {
    var c = gen.circuit, sol = gen.solution, f = gen.family, q = gen.question;
    var fmt = root.CV.fmt;
    if (f === "loop" && !c.edges.some(function (e) { return /^(CC|VC)/.test(e.type); })) {
      var hasI = c.edges.filter(function (e) { return e.type === "I"; });
      // clockwise traversal of the perimeter: top row →, right column ↓, bottom row ←, left column ↑
      var rows = c.rows, cols = c.cols, cw = [];
      c.edges.forEach(function (e) {
        if (e.type === "W") return;
        var along = (e.h && e.a[0] === 0) || (!e.h && e.a[1] === cols - 1); // a→b is clockwise
        cw.push({ e: e, along: along });
      });
      var iCW = cw.filter(function (x) { return x.e.type === "R"; }).map(function (x) { return x.along ? sol.byName[x.e.name].i : -sol.byName[x.e.name].i; })[0];
      var lines = ["الدائرة حلقة واحدة، فكل العناصر يمر بها <b>نفس التيار</b>. نفرض تيار الحلقة <span class='eq-i'>i</span> مع عقارب الساعة."];
      if (hasI.length) {
        lines.push("مصدر التيار <span class='ltr'>" + hasI[0].name + "</span> يفرض تيار الحلقة مباشرة: <span class='eq-i'>i = " + fmt(iCW, "A") + "</span> (بإشارة حسب اتجاه سهمه مقارنة بعقارب الساعة).");
      } else {
        var rise = 0, rs = 0, terms = [];
        cw.forEach(function (x) {
          if (x.e.type === "V") { var plusAhead = (x.e.plus === "b") === x.along; rise += plusAhead ? x.e.value : -x.e.value; terms.push((plusAhead ? "+" : "−") + x.e.value); }
          if (x.e.type === "R") rs += x.e.value;
        });
        lines.push("KVL حول الحلقة: مجموع ارتفاعات الجهد في المصادر = مجموع الهبوط في المقاومات: <span class='eq-i'>" + terms.join(" ").replace(/^\+/, "") + " = i × " + rs + "</span>");
        lines.push("<span class='eq-i'>i = " + root.CV.num(rise) + " / " + rs + " = " + fmt(iCW, "A") + "</span>");
      }
      var askedCw = cw.filter(function (x) { return x.e.name === q.el; })[0];
      if (askedCw && askedCw.e.type === "R" && q.kind !== "pR") {
        lines.push(askedCw.along ? "اتجاه المرجع في <span class='ltr'>" + q.el + "</span> مع عقارب الساعة، فتياره <span class='eq-i'>+i</span>."
          : "اتجاه المرجع في <span class='ltr'>" + q.el + "</span> <b>عكس</b> عقارب الساعة، فتياره بالنسبة لسهمه <span class='eq-i'>−i</span>.");
      }
      lines.push(finalLine(gen));
      return lines;
    }
    if (f === "pair") {
      var Gs = 0, inj = 0, injT = [];
      c.edges.forEach(function (e) {
        if (e.type === "R") Gs += 1 / e.value;
        if (e.type === "I") { var up = e.dir === "ba"; inj += up ? e.value : -e.value; injT.push((up ? "+" : "−") + root.CV.num(e.value)); }
      });
      var vTop = sol.volt([0, 0]) - sol.volt([1, 0]);
      return [
        "كل العناصر موصلة بين نفس العقدتين، فلها <b>نفس الجهد</b> <span class='eq-i'>v</span> (العقدة العليا موجبة).",
        "KCL عند العقدة العليا: التيار الداخل من المصادر = التيار الخارج في المقاومات: <span class='eq-i'>" + injT.join(" ").replace(/^\+/, "") + " = v × (" + c.edges.filter(function (e) { return e.type === "R"; }).map(function (e) { return "1/" + e.value; }).join(" + ") + ")</span>",
        "<span class='eq-i'>v = " + root.CV.num(inj) + " / " + root.CV.num(Gs) + " = " + fmt(vTop, "V") + "</span>",
        finalLine(gen)
      ];
    }
    return null;
  }

  function finalLine(gen) {
    var q = gen.question, it = gen.solution.byName[q.el], e = it.edge, fmt = root.CV.fmt;
    if (q.kind === "iR") return "تيار <span class='ltr'>" + q.el + "</span> باتجاه السهم: <span class='eq-i'>" + (gen.family === "pair" ? "i = v / R = " + fmt(it.v, "V") + " / " + e.value + " = " : "") + fmt(q.value, "A") + "</span>";
    if (q.kind === "vR") return "جهد <span class='ltr'>" + q.el + "</span> بالقطبية المرسومة (+ عند بداية سهم التيار): <span class='eq-i'>v = iR = " + (gen.family === "pair" ? "" : "(" + fmt(it.i, "A") + ") × " + e.value + " = ") + fmt(q.value, "V") + "</span>";
    if (q.kind === "pR") return "قدرة <span class='ltr'>" + q.el + "</span>: <span class='eq-i'>p = i²R = (" + fmt(it.i, "A") + ")² × " + e.value + " = " + fmt(q.value, "W") + "</span>";
    return "القدرة الممتصة في <span class='ltr'>" + q.el + "</span> باصطلاح الإشارة: <span class='eq-i'>" + fmt(q.value, "W") + "</span>" + (q.value < 0 ? " (سالبة، أي أن المصدر يولّد القدرة)" : "");
  }


  /* ================= Equivalent resistance ================= */
  /* Port element "T": two open terminals a (the edge's a-end) and b. */
  function reqValue(c) {
    var copy = { rows: c.rows, cols: c.cols, edges: c.edges.map(function (e) {
      if (e.type !== "T") return e;
      return { a: e.a, b: e.b, type: "I", value: 1, dir: "ba", name: "__port" }; // 1 A into terminal a
    }) };
    var s = MNA.solve(copy);
    if (!s.ok) return null;
    return s.byName.__port.v; // v_ab with 1 A test current = Rab
  }

  /* Series/parallel reduction with Δ→Y (and Y→Δ) when stuck. Produces readable steps. */
  function reduce(c) {
    var nodes = MNA.buildNodes(c), port = c.edges.filter(function (e) { return e.type === "T"; })[0];
    var ta = nodes.of(port.a), tb = nodes.of(port.b);
    var edges = c.edges.filter(function (e) { return e.type === "R"; }).map(function (e) { return { u: nodes.of(e.a), v: nodes.of(e.b), r: e.value, n: e.name }; });
    var steps = [], xi = 0, newNode = 1000, usedDY = false, n = CV.num;
    function nm() { return "X" + (++xi); }
    function lbl(x) { return "<span class='ltr'>" + x.n + "</span>"; }
    function deg(k) { return edges.filter(function (e) { return e.u === k || e.v === k; }); }
    for (var guard = 0; guard < 80; guard++) {
      if (edges.length === 1 && ((edges[0].u === ta && edges[0].v === tb) || (edges[0].u === tb && edges[0].v === ta))) {
        return { ok: true, value: edges[0].r, steps: steps, usedDY: usedDY };
      }
      var done = false, i, j;
      // parallel
      for (i = 0; i < edges.length && !done; i++) for (j = i + 1; j < edges.length && !done; j++) {
        var x = edges[i], y = edges[j];
        if ((x.u === y.u && x.v === y.v) || (x.u === y.v && x.v === y.u)) {
          var rp = x.r * y.r / (x.r + y.r), z = { u: x.u, v: x.v, r: rp, n: nm() };
          steps.push("<b>توازي:</b> " + lbl(x) + " ∥ " + lbl(y) + " = <span class='eq-i'>(" + n(x.r) + " × " + n(y.r) + ") / (" + n(x.r) + " + " + n(y.r) + ") = " + n(rp) + " Ω</span> ← نسميها " + lbl(z));
          edges = edges.filter(function (e) { return e !== x && e !== y; }).concat([z]); done = true;
        }
      }
      if (done) continue;
      // series / dangling
      var ids = {}; edges.forEach(function (e) { ids[e.u] = 1; ids[e.v] = 1; });
      var keys = Object.keys(ids).map(Number);
      for (i = 0; i < keys.length && !done; i++) {
        var k = keys[i]; if (k === ta || k === tb) continue;
        var d = deg(k);
        if (d.length === 1) { steps.push(lbl(d[0]) + " طرفها معلّق، فلا يمر فيها تيار ونحذفها."); edges = edges.filter(function (e) { return e !== d[0]; }); done = true; }
        else if (d.length === 2) {
          var p = d[0], q = d[1], o1 = p.u === k ? p.v : p.u, o2 = q.u === k ? q.v : q.u, zs = { u: o1, v: o2, r: p.r + q.r, n: nm() };
          steps.push("<b>توالي:</b> " + lbl(p) + " + " + lbl(q) + " = <span class='eq-i'>" + n(p.r) + " + " + n(q.r) + " = " + n(zs.r) + " Ω</span> ← نسميها " + lbl(zs));
          edges = edges.filter(function (e) { return e !== p && e !== q; }).concat([zs]); done = true;
        }
      }
      if (done) continue;
      // Δ → Y
      for (i = 0; i < edges.length && !done; i++) for (j = i + 1; j < edges.length && !done; j++) {
        var e1 = edges[i], e2 = edges[j], shared = e1.u === e2.u || e1.u === e2.v ? e1.u : (e1.v === e2.u || e1.v === e2.v ? e1.v : null);
        if (shared === null) continue;
        var A1 = e1.u === shared ? e1.v : e1.u, B1 = e2.u === shared ? e2.v : e2.u;
        if (A1 === B1) continue;
        var e3 = edges.filter(function (e) { return e !== e1 && e !== e2 && ((e.u === A1 && e.v === B1) || (e.u === B1 && e.v === A1)); })[0];
        if (!e3) continue;
        // triangle: shared–A1 (e1), shared–B1 (e2), A1–B1 (e3)
        var S = e1.r + e2.r + e3.r, cN = newNode++;
        var y1 = { u: shared, v: cN, r: e1.r * e2.r / S, n: nm() }, y2 = { u: A1, v: cN, r: e1.r * e3.r / S, n: nm() }, y3 = { u: B1, v: cN, r: e2.r * e3.r / S, n: nm() };
        steps.push("<b>تحويل Δ → Y:</b> المقاومات " + lbl(e1) + " و " + lbl(e2) + " و " + lbl(e3) + " تشكّل مثلثًا. مجموعها <span class='eq-i'>" + n(S) + " Ω</span>. كل مقاومة في الـ Y = حاصل ضرب الضلعين المجاورين ÷ المجموع: " +
          lbl(y1) + " = <span class='eq-i'>" + n(e1.r) + "×" + n(e2.r) + "/" + n(S) + " = " + n(y1.r) + "</span>، " + lbl(y2) + " = <span class='eq-i'>" + n(e1.r) + "×" + n(e3.r) + "/" + n(S) + " = " + n(y2.r) + "</span>، " + lbl(y3) + " = <span class='eq-i'>" + n(e2.r) + "×" + n(e3.r) + "/" + n(S) + " = " + n(y3.r) + " Ω</span>");
        edges = edges.filter(function (e) { return e !== e1 && e !== e2 && e !== e3; }).concat([y1, y2, y3]); usedDY = true; done = true;
      }
      if (!done) return { ok: false, steps: steps };
    }
    return { ok: false, steps: steps };
  }

  function generateReq(opts) {
    var seed = opts.seed >>> 0;
    for (var attempt = 1; attempt < 600; attempt++) {
      var R = rng(seed + attempt * 7919);
      var fam = R.pick(opts.families || ["ladder", "grid"]);
      var c = FAMILIES[fam](R, {});
      c.edges.forEach(function (e) { if (e.type !== "R" && e.type !== "W") { e.type = "R"; e.value = R.pick(RV); delete e.plus; delete e.dir; } });
      var lefts = c.edges.filter(function (e) { return !e.h && e.a[1] === 0; });
      var port = R.pick(lefts); port.type = "T"; delete port.value;
      nameAll(c);
      var nRes = c.edges.filter(function (e) { return e.type === "R"; }).length;
      if (nRes < (opts.minR || 3)) continue;
      var v = reqValue(c);
      if (v === null || !(v > 0.01) || v > 5000) continue;
      var red = reduce(c);
      if (!red.ok || Math.abs(red.value - v) > 1e-6 * Math.max(1, v)) continue; // reducer must agree with MNA
      if (opts.sp === true && red.usedDY) continue;
      if (opts.sp === false && !red.usedDY) continue;
      if (attempt < 400 && Math.abs(v * 100 - Math.round(v * 100)) > 1e-6) continue; // prefer clean answers
      c.seed = seed; c.attempt = attempt; c.family = fam;
      var allR = c.edges.filter(function (e) { return e.type === "R"; });
      return { circuit: c, family: fam, seed: seed, reduction: red,
        question: { kind: "Req", value: v, unit: "Ω", el: "ab" },
        solution: { elements: [], byName: {}, powerSum: 0 },
        sumAll: allR.reduce(function (s, e) { return s + e.value; }, 0),
        parAll: 1 / allR.reduce(function (s, e) { return s + 1 / e.value; }, 0) };
    }
    return null;
  }

  function reqDistractors(g) {
    var out = [], ans = g.question.value;
    function add(v, type, why) { if (Math.abs(v - ans) > 0.01 * ans && !out.some(function (o) { return Math.abs(o.value - v) < 1e-9; })) out.push({ value: v, type: type, why: why }); }
    add(g.sumAll, "conceptual", "جمعت كل المقاومات كأنها على التوالي. المقاومات على التوالي فقط إذا مر فيها <b>نفس التيار</b>، أي لا يوجد عنصر ثالث عند العقدة بينها.");
    add(g.parAll, "conceptual", "عاملت كل المقاومات كأنها على التوازي. المقاومات على التوازي فقط إذا كانت بين <b>نفس العقدتين</b>.");
    add(1 / ans, "formula", "هذه الموصلية المكافئة <span class='ltr'>(1/R)</span>. عند جمع مقاومات على التوازي، اقلب الناتج في النهاية.");
    return out;
  }

  root.CV.gen = { generate: generate, distractors: function (g) {
      if (g.acq) return root.CV.ac.distractors(g);
      if (g.analysis) return root.CV.analysis.distractors(g);
      return g.question.kind === "Req" ? reqDistractors(g) : distractors(g);
    }, steps: function (g) {
      if (g.acq) return root.CV.ac.steps(g);
      if (g.analysis) return root.CV.analysis.steps(g);
      if (g.question.kind === "Req") return g.reduction.steps.concat(["<b>النتيجة:</b> <span class='eq-i'>R<sub>ab</sub> = " + CV.num(g.question.value) + " Ω</span>"]);
      return steps(g);
    }, reduce: reduce, reqValue: reqValue, rng: rng, FAMILIES: Object.keys(FAMILIES),
    _internal: { FAMILIES: FAMILIES, nameAll: nameAll, makeDependent: makeDependent, clean: clean, nice: nice, addSource: addSource, RV: RV } };
})(typeof window !== "undefined" ? window : globalThis);
