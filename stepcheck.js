/* CircuitVision — checking a written solution against the circuit itself, line by line.
   The arithmetic checker (mathcheck.js) can only say whether numbers agree. This module knows the circuit:
   every symbol the student writes (node voltages v1…, mesh currents i1…, R2, Vs, i_R2, v_R2, vx…, and in AC
   circuits phasors, impedances Z_L1, j and ∠) is given its true value from the solver, so a written equation can be
   judged as physics, not just as arithmetic:
     · an equation that holds for this circuit is right, whatever form it is written in (scaled, rearranged, or a
       combination of laws);
     · an equation that does not hold is compared with the correct KCL row of every node, KVL row of every mesh,
       supernode/supermesh rows and source constraints, and with the same rows after one typical slip (a branch left
       out, a sign flipped, the wrong resistor, a shared branch with the neighbour's current forgotten, a capacitor's
       impedance with the wrong sign, ω forgotten…), to say exactly what went wrong;
     · a value written for a variable is compared with the circuit's, and a later line that is right with the
       student's own earlier values is reported as an error carried from that line, not a new one.
   All arithmetic is complex (a DC circuit is the case with no imaginary parts). Nothing here is guessed: every
   verdict comes from substituting the solver's values.
   check(text, ctx) → { lines, summary }   ctx from contextFor(circuit) */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  var PREFIX = { p: 1e-12, n: 1e-9, "µ": 1e-6, "μ": 1e-6, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  var UNIT_RE = /^(p|n|µ|μ|u|m|k|K|M|G)?(Ω|ohm|V|A|W|S|VA|VAR|var|Hz|H|F)(?![A-Za-z0-9Ω])/;
  var SUBD = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "ₓ": "x" };
  var SUBS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  function sub(name) { return String(name).replace(/(\d)/g, function (d) { return SUBS[+d]; }); }

  /* ---------- complex numbers ---------- */
  function Z(re, im) { return { re: re, im: im || 0 }; }
  function zadd(a, b) { return Z(a.re + b.re, a.im + b.im); }
  function zsub(a, b) { return Z(a.re - b.re, a.im - b.im); }
  function zmul(a, b) { return Z(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function zdiv(a, b) { var d = b.re * b.re + b.im * b.im; return Z((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); }
  function zneg(a) { return Z(-a.re, -a.im); }
  function zsc(a, k) { return Z(a.re * k, a.im * k); }
  function zabs(a) { return Math.hypot(a.re, a.im); }
  function zconj(a) { return Z(a.re, -a.im); }
  function zarg(a) { return Math.atan2(a.im, a.re) * 180 / Math.PI; }
  function zpolar(m, deg) { var r = deg * Math.PI / 180; return Z(m * Math.cos(r), m * Math.sin(r)); }
  function zok(a) { return a && isFinite(a.re) && isFinite(a.im); }
  function real(z) { return Math.abs(z.im) <= 1e-9 * (1 + Math.abs(z.re)); }
  function num(v) { return CV.num ? CV.num(v) : String(+v.toPrecision(4)); }
  function fmt(z, like) {
    if (real(z)) return num(z.re);
    if (like !== undefined && String(like).indexOf("∠") < 0) { var re = Math.abs(z.re) < 1e-12 * zabs(z) ? 0 : z.re, im = z.im; return (re ? num(re) + (im < 0 ? " − j" : " + j") : (im < 0 ? "−j" : "j")) + num(Math.abs(im)); }
    return num(zabs(z)) + "∠" + num(zarg(z)) + "°";
  }
  function close(a, b, scale) { var s = Math.max(zabs(a), zabs(b), scale || 0); return zabs(zsub(a, b)) <= Math.max(0.012 * s, 1e-12); }

  function normalize(s) {
    return String(s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/(\d)٫(\d)/g, "$1.$2").replace(/(\d),(\d)/g, "$1.$2")
      .replace(/[₀-₉ₓ]/g, function (c) { return SUBD[c]; })
      .replace(/[×·⋅]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-").replace(/ω/g, " omega ").replace(/°/g, "")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/∥|\|\|/g, "|").trim();
  }

  var PH = {
    "p:rth": ["مقاومة ثيفنن: أطفئ المصادر المستقلة (مصدر الجهد يصبح قصرًا، ومصدر التيار يصبح فتحًا)، ثم احسب المقاومة المكافئة بين a و b. إذا في الدائرة مصدر تابع فاتركه وادفع مصدر اختبار عند الطرفين.", "Thévenin resistance: turn the independent sources off (a voltage source becomes a short, a current source an open), then find the equivalent resistance between a and b. With a dependent source, keep it and drive the terminals with a test source."],
    "p:zth": ["ممانعة ثيفنن: أطفئ المصادر المستقلة ثم اجمع الممانعات بين a و b بالتوالي والتوازي كأعداد مركبة (Z_L = jωL و Z_C = −j/(ωC)).", "Thévenin impedance: turn the independent sources off, then combine the impedances between a and b in series and parallel as complex numbers (Z_L = jωL, Z_C = −j/(ωC))."],
    "p:rab": ["المقاومة المكافئة بين a و b: ابدأ من أبعد نقطة عن الطرفين، واجمع التوالي (نفس التيار) والتوازي (نفس الجهد) خطوة خطوة.", "Equivalent resistance between a and b: start from the point farthest from the terminals and combine series (same current) and parallel (same voltage) step by step."],
    "p:vth": ["جهد ثيفنن هو جهد الدائرة المفتوحة بين a و b (الطرف a موجب)، بدون أي حمل على الطرفين.", "The Thévenin voltage is the open-circuit voltage between a and b (a positive), with nothing connected to the terminals."],
    "p:in": ["تيار نورتن هو تيار القصر من a إلى b عبر سلك يصل الطرفين، ويساوي V_Th ÷ Z_Th.", "The Norton current is the short-circuit current from a to b through a wire joining the terminals; it equals V_Th ÷ Z_Th."],
    "p:rl": ["الحمل الذي يأخذ أقصى قدرة: R_L = R_Th في التيار المستمر، و Z_L = Z_Th* (المرافق) في التيار المتردد.", "The load that takes the most power: R_L = R_Th in DC, and Z_L = Z_Th* (the conjugate) in AC."],
    "p:pmax": ["أقصى قدرة: V_Th² ÷ (4 R_Th) في التيار المستمر، و |V_Th|² ÷ (8 R_Th) في التيار المتردد (الفيزور بالقيمة العظمى).", "Maximum power: V_Th² ÷ (4 R_Th) in DC, and |V_Th|² ÷ (8 R_Th) in AC (phasors as peak values)."]
  };
  function portHint(k) { k = { "p:req": "p:rab", "p:voc": "p:vth", "p:isc": "p:in", "p:zl": "p:rl", "p:zab": "p:zth", "p:zeq": "p:zth" }[k] || k; return PH[k] || null; }

  /* ---------- the circuit's symbols ---------- */
  function imp(e, w) { // element impedance (DC: R only)
    if (e.type === "R") return Z(e.value);
    if (!w) return null;
    if (e.type === "L") return Z(0, w * e.value);
    if (e.type === "C") return Z(0, -1 / (w * e.value));
    return null;
  }
  function srcVal(e, ac) { return ac ? zpolar(e.value, e.phase || 0) : Z(e.value); }
  function context(ctx) {
    var c = ctx.c, MNA = CV.mna, nodes = MNA.buildNodes(c), ac = !!c.omega, w = c.omega;
    var sol = ctx.sol || { elements: [], byName: {}, volt: function () { return Z(0); } };
    var zv = function (v) { return typeof v === "number" ? Z(v) : v; };
    var S = {}, idOf = {};
    function put(names, o) { names.forEach(function (n) { S[n] = o; }); }
    c.edges.forEach(function (e) {
      if (!e.name || e.name === "D") return;
      if (e.type === "R" || e.type === "L" || e.type === "C") S[e.name] = { key: "e:" + e.name, kind: "value", name: e.name, val: Z(e.value) };
      if (e.type === "V" || e.type === "I") S[e.name] = { key: "e:" + e.name, kind: "value", name: e.name, val: srcVal(e, ac) };
      var zi = imp(e, w); if (zi && ac) put(["Z" + e.name, "Z_" + e.name, "Z(" + e.name + ")"], { key: "z:" + e.name, kind: "value", name: "Z_" + e.name, val: zi });
    });
    if (ac) put(["omega", "w"], { key: "w", kind: "value", name: "ω", val: Z(w) });
    var P = ctx.port || {}, PORT = ac ?
      { zab: ["Zab", P.zth], zeq: ["Zeq", P.zth], zth: ["ZTh", P.zth], rth: ["RTh", P.zth], vth: ["VTh", P.voc], voc: ["voc", P.voc], isc: ["isc", P.isc], in: ["IN", P.isc], pmax: ["pmax", P.pmax], zl: ["ZL", P.zl] } :
      { rab: ["Rab", P.rth], req: ["Req", P.rth], rth: ["RTh", P.rth], vth: ["VTh", P.voc], voc: ["voc", P.voc], isc: ["isc", P.isc], in: ["IN", P.isc], pmax: ["pmax", P.pmax], rl: ["RL", P.rth] }; // RL with no RL drawn: the load that takes the most power
    Object.keys(PORT).forEach(function (k) { var v = PORT[k][1]; if (v !== undefined && v !== null && zok(zv(v))) S["port:" + k] = { key: "p:" + k, kind: "port", name: PORT[k][0], val: zv(v) }; });
    (ctx.nodes || []).forEach(function (nl) { S["v" + nl.name.slice(1)] = { key: "n:" + nl.name, kind: "node", name: nl.name, val: zv(sol.volt(nl.at)), id: nl.id }; idOf[nl.id] = nl.name; });
    (ctx.meshes || []).forEach(function (m) { S["i" + m.name.slice(1)] = { key: "m:" + m.name, kind: "mesh", name: m.name, val: zv(m.value) }; });
    sol.elements.forEach(function (it) {
      var e = it.edge; if (!e.name || e.type === "W" || e.name === "D") return;
      var nm = e.name;
      put(["v" + nm, "v_" + nm, "V(" + nm + ")", "V" + nm, "V_" + nm], { key: "ev:" + nm, kind: "elv", name: "v_" + nm, val: zv(it.v) });
      put(["i" + nm, "i_" + nm, "I(" + nm + ")", "I" + nm, "I_" + nm], { key: "ei:" + nm, kind: "eli", name: "i_" + nm, val: zv(it.i) });
      if (!ac) put(["p" + nm, "P" + nm, "p_" + nm, "P_" + nm], { key: "ep:" + nm, kind: "elp", name: "p_" + nm, val: Z(it.p) });
      else if (it.s) { var sh = zsc(it.s, 0.5); put(["P" + nm, "P_" + nm, "p_" + nm], { key: "ep:" + nm, kind: "elp", name: "P_" + nm, val: Z(sh.re) }); put(["Q" + nm, "Q_" + nm], { key: "eq:" + nm, kind: "elp", name: "Q_" + nm, val: Z(sh.im) }); put(["S" + nm, "S_" + nm], { key: "es:" + nm, kind: "elp", name: "S_" + nm, val: sh }); }
    });
    // a source named like a node or mesh unknown (V1, I1) stays the source: only lower-case v1/i1 are the unknowns then
    var D = sol.byName.D;
    if (D) { var ce = sol.byName[D.edge.ctrl]; if (ce) { S.vx = { key: "x:v", kind: "ctrl", name: "vₓ", val: zv(ce.v) }; S.ix = { key: "x:i", kind: "ctrl", name: "iₓ", val: zv(ce.i) }; } }
    return { S: S, nodes: nodes, idOf: idOf, c: c, sol: sol, meshes: ctx.meshes || [], labels: ctx.nodes || [], ac: ac, w: w };
  }
  function lookup(K, raw) {
    var S = K.S, t = raw.replace(/_/g, "");
    if (S[raw]) return S[raw];
    if (S["port:" + t.toLowerCase()]) return S["port:" + t.toLowerCase()];
    if (S[t]) return S[t];
    var m = /^([vViI])\(?([A-Za-z]+\d*)\)?$/.exec(t);
    if (m && S[(m[1].toLowerCase()) + m[2]]) return S[m[1].toLowerCase() + m[2]];
    if (/^[vV]\d+$/.test(t) && S["v" + t.slice(1)]) return S["v" + t.slice(1)];
    if (/^[iI]\d+$/.test(t) && S["i" + t.slice(1)]) return S["i" + t.slice(1)];
    if (/^[vViI]x$/i.test(t)) return S[t[0].toLowerCase() + "x"] || null;
    return null;
  }

  /* ---------- expressions with symbols ---------- */
  function parse(seg, K) {
    var s = normalize(seg), t = [], i = 0, m, unknown = null;
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i)))) {
        var v = parseFloat(m[0]); i += m[0].length;
        var rest = s.slice(i).replace(/^\s+/, ""), sk = s.slice(i).length - rest.length, u = UNIT_RE.exec(rest);
        if (u && !(u[0] === "j")) { v *= u[1] ? PREFIX[u[1]] : 1; i += sk + u[0].length; }
        t.push({ k: "n", v: Z(v) }); continue;
      }
      if (/^j(?![A-Za-z_(])/.test(s.slice(i))) { t.push({ k: "n", v: Z(0, 1), j: true }); i++; continue; } // the imaginary unit: j, j5, 3j
      if ((m = /^[A-Za-z][A-Za-z0-9_]*(\([A-Za-z]+\d*\))?/.exec(s.slice(i)))) {
        var id = m[0]; i += id.length;
        if (UNIT_RE.test(id) && t.length && (t[t.length - 1].k === ")" || t[t.length - 1].k === "n") && !lookup(K, id)) continue; // a unit after a bracket
        var sym = lookup(K, id);
        if (!sym) { unknown = unknown || id; t.push({ k: "s", sym: null }); continue; }
        t.push({ k: "s", sym: sym }); continue;
      }
      if ("+-*/^()|∠".indexOf(ch) > -1) { t.push({ k: ch }); i++; continue; }
      return { bad: true };
    }
    var out = [];
    t.forEach(function (tok) {
      var prev = out[out.length - 1];
      if (prev && (prev.k === "n" || prev.k === ")" || prev.k === "s") && (tok.k === "(" || tok.k === "s" || (tok.k === "n" && (prev.k !== "n" || prev.j || tok.j)))) out.push({ k: "*" });
      out.push(tok);
    });
    if (unknown) return { unknown: unknown };
    var syms = {}; out.forEach(function (x) { if (x.k === "s") syms[x.sym.key] = x.sym; });
    function ev(env) {
      var p = 0;
      function peek() { return out[p] && out[p].k; }
      function expr() { var v = term(); while (peek() === "+" || peek() === "-") { var o = out[p++].k, r = term(); v = o === "+" ? zadd(v, r) : zsub(v, r); } return v; }
      function term() { var v = ang(); while (peek() === "*" || peek() === "/" || peek() === "|") { var o = out[p++].k, r = ang(); v = o === "*" ? zmul(v, r) : o === "/" ? zdiv(v, r) : zdiv(zmul(v, r), zadd(v, r)); } return v; }
      function ang() { var v = pw(); if (peek() === "∠") { p++; var d = un(); if (!real(d)) throw 0; v = zmul(v, zpolar(1, d.re)); } return v; } // 10∠30 = 10 e^{j30°}
      function pw() {
        var v = un();
        if (peek() === "^") { p++; var e = pw(); if (!real(e)) throw 0; if (real(v) && v.re >= 0) v = Z(Math.pow(v.re, e.re)); else { var mg = Math.pow(zabs(v), e.re); v = zpolar(mg, zarg(v) * e.re); } }
        return v;
      }
      function un() { if (peek() === "-") { p++; return zneg(un()); } if (peek() === "+") { p++; return un(); } return pr(); }
      function pr() {
        var tk = out[p++]; if (!tk) throw 0;
        if (tk.k === "n") return tk.v;
        if (tk.k === "s") return env(tk.sym);
        if (tk.k === "(") { var v = expr(); if (peek() !== ")") throw 0; p++; return v; }
        throw 0;
      }
      try { var v = expr(); return p === out.length && zok(v) ? v : null; } catch (e) { return null; }
    }
    return { ev: ev, syms: syms, n: Object.keys(syms).length };
  }

  /* ---------- the correct equations of this circuit ----------
     Every row is a linear form (complex coef over unknown names + constant k) that is zero for the true solution:
       node side: KCL at a node (currents leaving), KCL for a supernode, the voltage constraint of a source between nodes;
       mesh side: KVL around a mesh, KVL around a supermesh, the current constraint of a current source.
     Each row is made of terms (one per branch or element), and each term knows the typical slips a student makes with it,
     so a wrong equation can be matched against "the right row with one slip". Dependent sources are written through
     their controlling quantity, expressed in the same unknowns. */
  function lf(k) { return { coef: {}, k: k || Z(0) }; }
  function add(a, b, s) { s = s === undefined ? Z(1) : typeof s === "number" ? Z(s) : s; var o = { coef: Object.assign({}, a.coef), k: zadd(a.k, zmul(s, b.k)) }; for (var q in b.coef) o.coef[q] = zadd(o.coef[q] || Z(0), zmul(s, b.coef[q])); return o; }
  function scale(a, s) { return add(lf(), a, s); }
  function isZero(a) { if (zabs(a.k) > 1e-12) return false; for (var q in a.coef) if (zabs(a.coef[q]) > 1e-12) return false; return true; }
  function sum(terms) { var o = lf(); terms.forEach(function (x) { if (x) o = add(o, x); }); return o; }
  var T = { // wording shared by the rows
    kcl: function (n) { return ["KCL عند " + sub(n), "KCL at " + sub(n)]; },
    kcls: function (g) { return ["KCL للعقدة العظمى (" + g.map(sub).join(" و ") + ")", "KCL for the supernode (" + g.map(sub).join(", ") + ")"]; },
    vcons: function (a, b, nm) { return ["قيد المصدر " + nm + " بين " + a + " و " + b, "the constraint of source " + nm + " between " + a + " and " + b]; },
    kvl: function (m) { return ["KVL في الحلقة " + sub(m), "KVL around mesh " + sub(m)]; },
    kvls: function (g) { return ["KVL للحلقة العظمى (" + g.map(sub).join(" و ") + ")", "KVL around the supermesh (" + g.map(sub).join(", ") + ")"]; },
    icons: function (nm, dep) { return dep ? ["قيد المصدر التابع", "the dependent source’s constraint"] : ["قيد مصدر التيار " + nm, "the constraint of current source " + nm]; }
  };
  /* the impedance slips of one element (AC): +j for a capacitor, ω forgotten, the reactance without j */
  function zSlips(e, w, ar, en) {
    var out = [];
    if (!w) return out;
    if (e.type === "C") {
      out.push({ z: Z(0, 1 / (w * e.value)), ar: "ممانعة المكثف " + e.name + " سالبة: Z_C = −j/(ωC)، وكتبتها بإشارة موجبة.", en: "the capacitor " + e.name + " has a negative impedance: Z_C = −j/(ωC); you wrote it with a + sign." });
      out.push({ z: Z(0, -1 / e.value), ar: "في ممانعة المكثف " + e.name + " نسيت ω: Z_C = −j/(ωC).", en: "in the impedance of capacitor " + e.name + " you forgot ω: Z_C = −j/(ωC)." });
      out.push({ z: Z(1 / (w * e.value)), ar: "ممانعة المكثف " + e.name + " تخيلية: −j/(ωC)، لا رقم حقيقي.", en: "the impedance of capacitor " + e.name + " is imaginary, −j/(ωC), not a real number." });
    }
    if (e.type === "L") {
      out.push({ z: Z(0, e.value), ar: "في ممانعة الملف " + e.name + " نسيت ω: Z_L = jωL.", en: "in the impedance of inductor " + e.name + " you forgot ω: Z_L = jωL." });
      out.push({ z: Z(w * e.value), ar: "ممانعة الملف " + e.name + " تخيلية: jωL، لا رقم حقيقي.", en: "the impedance of inductor " + e.name + " is imaginary, jωL, not a real number." });
      out.push({ z: Z(0, -w * e.value), ar: "ممانعة الملف " + e.name + " موجبة: Z_L = +jωL.", en: "the inductor " + e.name + " has a positive impedance: Z_L = +jωL." });
    }
    return out;
  }
  function buildRows(K) {
    var c = K.c, nodes = K.nodes, ess = {}, out = { node: [], mesh: [], notes: {} }, byName = {}, w = K.w, ac = K.ac;
    c.edges.forEach(function (e) { if (e.name) byName[e.name] = e; });
    K.labels.forEach(function (nl) { ess[nl.id] = nl.name; });
    ess[-1] = "gnd";
    var V = function (n) { return ess[n] && ess[n] !== "gnd" ? ess[n] : null; };
    var at = function (n, en) { return V(n) ? sub(V(n)) : en ? "ground" : "الأرضي"; };
    var nm = function (e, en) { return e.name === "D" ? (en ? "the dependent source" : "المصدر التابع") : e.name; };
    var isZ = function (e) { return e.type === "R" || (ac && (e.type === "L" || e.type === "C")); };
    function nodeLf(n) { // a node's voltage in the unknowns: a labelled node, ground, or reached from one through voltage sources
      var seenN = {}, q = [[n, Z(0)]];
      while (q.length) {
        var it = q.shift(), m = it[0]; if (seenN[m]) continue; seenN[m] = 1;
        if (ess[m] !== undefined) { var o = lf(it[1]); if (V(m)) o.coef[V(m)] = Z(1); return o; }
        c.edges.forEach(function (e) {
          if (e.type !== "V") return;
          var a2 = nodes.of(e.a), b2 = nodes.of(e.b), sv = srcVal(e, ac), vab = e.plus === "a" ? sv : zneg(sv); // v(a) − v(b)
          if (a2 === m) q.push([b2, zadd(it[1], vab)]); else if (b2 === m) q.push([a2, zsub(it[1], vab)]);
        });
      }
      return null;
    }
    /* the controlling quantity of the dependent source, in node voltages and in mesh currents */
    var D = c.edges.filter(function (e) { return /^(VC|CC)(VS|CS)$/.test(e.type); })[0], ce = D && byName[D.ctrl];
    var vcNode = null, vcMesh = null, zce = ce ? imp(ce, w) || Z(ce.value) : Z(1);
    if (ce) {
      var la = nodeLf(nodes.of(ce.a)), lb = nodeLf(nodes.of(ce.b));
      if (la && lb) vcNode = add(la, lb, -1);
      var ef = (K.meshes.edgeFaces || []).filter(function (x) { return x.e === ce || (x.e.name && x.e.name === ce.name); })[0];
      if (ef) { vcMesh = lf(); if (ef.p) vcMesh.coef[ef.p] = zce; if (ef.m) vcMesh.coef[ef.m] = zadd(vcMesh.coef[ef.m] || Z(0), zneg(zce)); }
    }
    out.ctrl = { node: vcNode, mesh: vcMesh, Z: zce, on: ce ? ce.name : "", isI: D ? /^CC/.test(D.type) : false, name: D ? (/^CC/.test(D.type) ? "iₓ" : "vₓ") : "" };
    function depGain(e) { return /^VC/.test(e.type) ? Z(e.value) : zdiv(Z(e.value), zce); } // per volt of v_ctrl
    /* ----- node side: branches between labelled nodes ----- */
    var els = c.edges.filter(function (e) { return e.type !== "W" && e.type !== "T"; }), inc = {};
    els.forEach(function (e, i) { [nodes.of(e.a), nodes.of(e.b)].forEach(function (n) { (inc[n] = inc[n] || []).push(i); }); });
    var seen = {}, chains = [];
    function walk(from, idx) {
      var path = [], cur = from, i = idx;
      for (var g = 0; g < 60; g++) {
        var e = els[i], na = nodes.of(e.a), nb = nodes.of(e.b), next = na === cur ? nb : na;
        path.push({ i: i, u: cur, w: next }); seen[i] = 1;
        if (ess[next] !== undefined) return { path: path, end: next };
        var nx = (inc[next] || []).filter(function (j) { return j !== i; });
        if (nx.length !== 1) return { path: path, end: next, open: true };
        cur = next; i = nx[0];
      }
      return { path: path, end: cur, open: true };
    }
    els.forEach(function (e0, i0) {
      if (seen[i0]) return;
      var na0 = nodes.of(e0.a), left;
      if (ess[na0] !== undefined) left = { path: [], end: na0 };
      else { var nx = (inc[na0] || []).filter(function (j) { return j !== i0; }); left = nx.length === 1 ? walk(na0, nx[0]) : { open: true }; }
      var right = walk(na0, i0);
      if (left.open || right.open) return;
      var path = left.path.slice().reverse().map(function (x) { return { i: x.i, u: x.w, w: x.u }; }).concat(right.path), A = left.end, B = right.end;
      if (A === B) return;
      var ch = { A: A, B: B, Z: Z(0), E: lf(), I: null, ok: true, els: [], zs: [] };
      path.forEach(function (x) {
        var e = els[x.i], fwd = nodes.of(e.a) === x.u; ch.els.push(e);
        if (isZ(e)) { ch.Z = zadd(ch.Z, imp(e, w)); ch.zs.push(e); }
        else if (e.type === "V") { var sv = srcVal(e, ac); ch.E.k = zadd(ch.E.k, (e.plus === "a") === fwd ? sv : zneg(sv)); }
        else if (e.type === "I") { var si = srcVal(e, ac), iab = e.dir === "ab" ? si : zneg(si); ch.I = lf(fwd ? iab : zneg(iab)); }
        else if (e.type === "VCCS" || e.type === "CCCS") { if (!vcNode) { ch.ok = false; return; } var g = zsc(depGain(e), e.dir === "ab" ? 1 : -1); ch.I = scale(vcNode, fwd ? g : zneg(g)); }
        else if (e.type === "VCVS" || e.type === "CCVS") { if (!vcNode) { ch.ok = false; return; } var k = zsc(depGain(e), (e.plus === "a") === fwd ? 1 : -1); ch.E = add(ch.E, vcNode, k); }
        else ch.ok = false;
      });
      ch.name = ch.els.map(function (e) { return nm(e); }).join(" + "); ch.nameEn = ch.els.map(function (e) { return nm(e, true); }).join(" + ");
      chains.push(ch);
    });
    function cur(ch, from, Zb, E) { // current leaving `from` along the branch
      var s = from === ch.A ? 1 : -1, to = from === ch.A ? ch.B : ch.A;
      if (ch.I) return scale(ch.I, s);
      var y = zdiv(Z(1), Zb || ch.Z), o = lf(); if (V(from)) o.coef[V(from)] = y; if (V(to)) o.coef[V(to)] = zadd(o.coef[V(to)] || Z(0), zneg(y));
      return add(o, E || ch.E, zsc(y, -s));
    }
    function branch(ch, from) {
      var d = ["تيار الفرع " + ch.name + " بين " + at(ch.A) + " و " + at(ch.B), "the current in the branch " + ch.nameEn + " between " + at(ch.A, true) + " and " + at(ch.B, true)];
      var slips = [];
      if (!ch.I && !isZero(ch.E)) slips.push({ t: cur(ch, from, null, scale(ch.E, -1)), ar: "إشارة جهد المصدر في الفرع " + ch.name + " معكوسة. انتبه أي طرف من المصدر هو +.", en: "the source voltage in the branch " + ch.nameEn + " has the wrong sign. Check which end of the source is +." });
      if (!ch.I && ch.zs.length === 1 && ch.zs[0].type === "R") c.edges.forEach(function (re) {
        if (re.type !== "R" || re === ch.zs[0] || re.value === ch.zs[0].value) return;
        slips.push({ t: cur(ch, from, Z(re.value)), ar: "قسمت تيار الفرع " + ch.name + " على " + re.name + " بدل " + ch.zs[0].name + ".", en: "you divided the current in the branch " + ch.nameEn + " by " + re.name + " instead of " + ch.zs[0].name + "." });
      });
      if (!ch.I && ch.zs.length > 1) slips.push({ t: cur(ch, from, imp(ch.zs[0], w)), ar: (ac ? "ممانعة" : "مقاومة") + " الفرع " + ch.name + " هي مجموع عناصره المتتالية، لا " + ch.zs[0].name + " وحده.", en: "the " + (ac ? "impedance" : "resistance") + " of the branch " + ch.nameEn + " is the sum of its series elements, not " + ch.zs[0].name + " alone." });
      if (!ch.I) ch.zs.forEach(function (e) {
        zSlips(e, w).forEach(function (zs) { slips.push({ t: cur(ch, from, zadd(zsub(ch.Z, imp(e, w)), zs.z)), ar: zs.ar, en: zs.en, z: 1 }); });
      });
      return { ar: d[0], en: d[1], t: cur(ch, from), slips: slips };
    }
    var vOnly = chains.filter(function (ch) { return ch.ok && !ch.I && zabs(ch.Z) === 0; });
    // supernodes: labelled nodes joined by a branch of voltage sources only
    var grp = {}; function gf(n) { while (grp[n] !== undefined && grp[n] !== n) n = grp[n]; return n; }
    K.labels.forEach(function (nl) { grp[nl.id] = nl.id; }); grp[-1] = -1;
    vOnly.forEach(function (ch) { var a = gf(ch.A), b = gf(ch.B); if (a !== b) { if (a === -1) grp[b] = a; else grp[a] = b; } });
    var groups = {};
    K.labels.forEach(function (nl) { var g = gf(nl.id); (groups[g] = groups[g] || []).push(nl.id); });
    Object.keys(groups).forEach(function (g) {
      var mem = groups[g], set = {}; mem.forEach(function (n) { set[n] = 1; });
      var names = mem.map(V);
      if (+g === -1) { out.notes.known = (out.notes.known || []).concat(names); return; } // these voltages are set by sources from ground
      var terms = [], bad = false;
      chains.forEach(function (ch) {
        var inA = set[ch.A], inB = set[ch.B];
        if (!!inA === !!inB) return;
        if (!ch.ok) { bad = true; return; }
        terms.push(branch(ch, inA ? ch.A : ch.B));
      });
      if (bad || !terms.length) return;
      var lab = mem.length > 1 ? T.kcls(names) : T.kcl(names[0]);
      out.node.push({ id: "n:" + names.join("+"), kind: mem.length > 1 ? "kcls" : "kcl", ar: lab[0], en: lab[1], terms: terms, covers: names, flipHint: ["كل التيارات الخارجة من العقدة بنفس الإشارة.", "all currents leaving the node take the same sign."] });
      if (mem.length > 1) out.notes.super = (out.notes.super || []).concat([names]);
    });
    vOnly.forEach(function (ch) { // vA − vB − E = 0
      var o = lf(); if (V(ch.A)) o.coef[V(ch.A)] = Z(1); if (V(ch.B)) o.coef[V(ch.B)] = zadd(o.coef[V(ch.B)] || Z(0), Z(-1));
      var lab = T.vcons(at(ch.A), at(ch.B), ch.name), labEn = T.vcons(at(ch.A, true), at(ch.B, true), ch.nameEn);
      out.node.push({ id: "c:" + ch.name, kind: "vcons", ar: lab[0], en: labEn[1], whole: add(o, ch.E, -1),
        wholeSlips: [{ t: add(o, ch.E, 1), ar: "في " + lab[0] + " الإشارة معكوسة: فرق الجهد = جهد الطرف + ناقص جهد الطرف −.", en: "in " + labEn[1] + " the sign is reversed: the voltage difference is the + end minus the − end." }] });
    });
    /* ----- mesh side ----- */
    if (K.meshes.length && K.meshes.edgeFaces) {
      var terms = {}, mg = {}, bad = {}, icons = [];
      K.meshes.forEach(function (m) { terms[m.name] = []; mg[m.name] = m.name; });
      var mf = function (m) { while (mg[m] !== m) m = mg[m]; return m; };
      K.meshes.edgeFaces.forEach(function (x) {
        var e = x.e; if (e.type === "W" || e.type === "T") return;
        if (e.type === "I" || e.type === "CCCS" || e.type === "VCCS") {
          var iab = e.type === "I" ? lf(e.dir === "ab" ? srcVal(e, ac) : zneg(srcVal(e, ac))) : (vcMesh ? scale(vcMesh, zsc(depGain(e), e.dir === "ab" ? 1 : -1)) : null);
          if (!iab) { if (x.p) bad[x.p] = 1; if (x.m) bad[x.m] = 1; return; }
          var o = lf(); if (x.p) o.coef[x.p] = Z(1); if (x.m) o.coef[x.m] = zadd(o.coef[x.m] || Z(0), Z(-1)); // I(p) − I(m) = i_ab
          var lab = T.icons(nm(e), e.name === "D"), labEn = T.icons(nm(e, true), e.name === "D");
          icons.push({ id: "c:" + e.name, kind: "icons", ar: lab[0], en: labEn[1], whole: add(o, iab, -1),
            wholeSlips: [{ t: add(o, iab, 1), ar: "في " + lab[0] + " الإشارة معكوسة: قارن اتجاه سهم المصدر باتجاه تيار كل حلقة.", en: "in " + labEn[1] + " the sign is reversed: compare the source arrow with each mesh current’s direction." }] });
          if (x.p && x.m) { var a = mf(x.p), b = mf(x.m); if (a !== b) mg[a] = b; }
          else out.notes.knownMesh = (out.notes.knownMesh || []).concat([x.p || x.m]);
          return;
        }
        [["p", 1], ["m", -1]].forEach(function (side) {
          var F = x[side[0]]; if (!F || !terms[F]) return;
          var s = side[1], other = side[0] === "p" ? x.m : x.p, o = lf(), d, slips = [];
          if (isZ(e)) {
            var ze = imp(e, w), mk = function (zz) { var r = lf(); if (x.p) r.coef[x.p] = zsc(zz, s); if (x.m) r.coef[x.m] = zadd(r.coef[x.m] || Z(0), zsc(zz, -s)); return r; };
            o = mk(ze);
            d = ["هبوط الجهد على " + e.name, "the voltage drop across " + e.name];
            if (other) { var own = lf(); own.coef[F] = o.coef[F]; slips.push({ t: own, ar: e.name + " مشتركة مع الحلقة " + sub(other) + "، فتيارها " + sub(F) + " − " + sub(other) + " وليس " + sub(F) + " وحده.", en: e.name + " is shared with mesh " + sub(other) + ", so its current is " + sub(F) + " − " + sub(other) + ", not " + sub(F) + " alone." }); }
            zSlips(e, w).forEach(function (zs) { slips.push({ t: mk(zs.z), ar: zs.ar, en: zs.en, z: 1 }); });
          } else if (e.type === "V") { var sv = srcVal(e, ac); o.k = zsc(e.plus === "a" ? sv : zneg(sv), s); d = ["جهد المصدر " + e.name, "the source voltage " + e.name]; }
          else if (e.type === "VCVS" || e.type === "CCVS") { if (!vcMesh) { bad[F] = 1; return; } o = scale(vcMesh, zsc(depGain(e), s * (e.plus === "a" ? 1 : -1))); d = ["جهد المصدر التابع", "the dependent source’s voltage"]; }
          else { bad[F] = 1; return; }
          terms[F].push({ ar: d[0], en: d[1], t: o, slips: slips });
        });
      });
      var mgroups = {};
      K.meshes.forEach(function (m) { var g = mf(m.name); (mgroups[g] = mgroups[g] || []).push(m.name); });
      Object.keys(mgroups).forEach(function (g) {
        var mem = mgroups[g];
        if (mem.some(function (m) { return bad[m] || (out.notes.knownMesh || []).indexOf(m) > -1; })) return;
        var all = []; mem.forEach(function (m) { all = all.concat(terms[m]); });
        var lab = mem.length > 1 ? T.kvls(mem) : T.kvl(mem[0]);
        out.mesh.push({ id: "m:" + mem.join("+"), kind: mem.length > 1 ? "kvls" : "kvl", ar: lab[0], en: lab[1], terms: all.filter(function (x) { return !isZero(x.t); }), covers: mem, flipHint: ["امشِ مع اتجاه الحلقة وطبّق الإشارة عند كل عنصر.", "walk with the mesh direction and apply the sign at each element."] });
        if (mem.length > 1) out.notes.superMesh = (out.notes.superMesh || []).concat([mem]);
      });
      out.mesh = out.mesh.concat(icons);
    }
    return out;
  }
  function rowForm(r) { return r.whole || sum(r.terms.map(function (x) { return x.t; })); }
  var W = 1; // typical size of the unknowns, so coefficients and constants weigh alike when forms are compared
  function vecMatch(s, r) { // s ≈ λ r, λ complex?
    var keys = {}; Object.keys(s.coef).concat(Object.keys(r.coef)).forEach(function (q) { keys[q] = 1; });
    keys = Object.keys(keys);
    var sv = keys.map(function (q) { return zsc(s.coef[q] || Z(0), W); }).concat([s.k]), rv = keys.map(function (q) { return zsc(r.coef[q] || Z(0), W); }).concat([r.k]);
    var rr = rv.reduce(function (a, x) { return a + x.re * x.re + x.im * x.im; }, 0), ss = sv.reduce(function (a, x) { return a + x.re * x.re + x.im * x.im; }, 0);
    if (rr < 1e-20 || ss < 1e-20) return false;
    var lam = zsc(sv.reduce(function (a, x, i) { return zadd(a, zmul(x, zconj(rv[i]))); }, Z(0)), 1 / rr);
    if (zabs(lam) < 1e-12) return false;
    var err = sv.reduce(function (a, x, i) { var d = zsub(x, zmul(lam, rv[i])); return a + d.re * d.re + d.im * d.im; }, 0);
    return err <= 1e-4 * ss ? { lam: lam } : false;
  }
  function lamCost(m) { return Math.abs(Math.log(zabs(m.lam))) + (Math.abs(zarg(m.lam)) > 1 ? 0.01 + Math.abs(zarg(m.lam)) / 1800 : 0); }
  /* the student's equation as a (complex) linear form in the given variables, null if it is not linear in them */
  function linear(f, keys) {
    var z = {}; keys.forEach(function (k) { z[k] = Z(0); });
    var f0 = f(z); if (f0 === null) return null;
    var o = { coef: {}, k: f0 };
    for (var j = 0; j < keys.length; j++) {
      var e1 = Object.assign({}, z), e2 = Object.assign({}, z), e3 = Object.assign({}, z); e1[keys[j]] = Z(1); e2[keys[j]] = Z(3.7); e3[keys[j]] = Z(0, 2.3);
      var a = f(e1), b = f(e2), c3 = f(e3); if (a === null || b === null || c3 === null) return null;
      var cj = zsub(a, f0), tol = 1e-6 * (1 + zabs(zsub(b, f0)));
      if (zabs(zsub(zsub(b, f0), zsc(cj, 3.7))) > tol || zabs(zsub(zsub(c3, f0), zmul(cj, Z(0, 2.3)))) > tol) return null;
      o.coef[keys[j]] = cj;
    }
    var mix = Object.assign({}, z); keys.forEach(function (k, i) { mix[k] = Z(1 + i * 0.7, 0.3 * i); });
    var pred = keys.reduce(function (s, k) { return zadd(s, zmul(o.coef[k], mix[k])); }, f0), act = f(mix);
    if (act === null || zabs(zsub(pred, act)) > 1e-6 * (1 + zabs(act))) return null;
    return o;
  }

  /* ---------- the check ---------- */
  function check(text, ctx) {
    var K = context(ctx), RW = buildRows(K), mine = {}, lines = [], usedRows = {};
    W = Math.max(1, Math.max.apply(null, Object.keys(K.S).map(function (k) { var o = K.S[k]; return o.kind === "node" || o.kind === "mesh" ? zabs(o.val) : 0; }).concat([0])));
    var nodeVars = K.labels.map(function (n) { return n.name; }), meshVars = K.meshes.map(function (m) { return m.name; });
    function trueEnv(sym) { return sym.val; }
    function mineEnv(sym) { return mine[sym.key] !== undefined ? mine[sym.key].v : sym.val; }
    String(text || "").split(/\n|⇒|=>/).forEach(function (raw, idx) {
      var line = raw.trim(); if (!line) return;
      var body = line.replace(/^[^=]*?[:：]\s*(?=.*=)/, ""); // "KCL عند العقدة 1:" labels
      if (!/=|≈/.test(body)) return;
      var segs = body.split(/=|≈/), P = segs.map(function (sg) { return parse(sg, K); }), res = { n: idx + 1, text: line };
      var unk = P.filter(function (p) { return p.unknown; })[0];
      if (unk) {
        var have = nodeVars.concat(meshVars).map(sub).join(" و "), haveEn = nodeVars.concat(meshVars).map(sub).join(", ");
        res.status = "skip";
        res.msg = "لا أعرف الرمز «" + unk.unknown + "» في هذه الدائرة." + (have ? " المجاهيل في الرسم: " + have + "." : "") + " وللعناصر: R2 و Vs و i_R2 و v_R2" + (K.ac ? " و Z_L1 و ω و j" : " و p_R2") + " (بأسماء الرسم).";
        res.en = "I don’t know the symbol “" + unk.unknown + "” in this circuit." + (haveEn ? " The unknowns on the drawing are " + haveEn + "." : "") + " For elements: R2, Vs, i_R2, v_R2" + (K.ac ? ", Z_L1, ω, j" : ", p_R2") + " (with the drawing’s names).";
        lines.push(res); return;
      }
      if (P.some(function (p) { return p.bad || !p.ev; })) { res.status = "skip"; res.msg = "لم أفهم صيغة هذا السطر."; res.en = "I couldn’t read this line."; lines.push(res); return; }
      var hasSym = P.some(function (p) { return p.n; });
      // a value for one variable:  v1 = 8 V,  V1 = 10∠30
      var onlyVals = function (p) { return Object.keys(p.syms).every(function (k) { return p.syms[k].kind === "value"; }); };
      if (P.length >= 2 && P[0].n === 1 && /^z:/.test(Object.keys(P[0].syms)[0]) && P.slice(1).every(onlyVals) && P.slice(1).some(function (p) { return p.n; })) {
        P = [P[0], { ev: P[P.length - 1].ev, syms: {}, n: 0 }]; // Z_C1 = −j/(ω C1): judged by its value
      }
      if (P.length >= 2 && P[0].n === 1 && P.slice(1).every(function (p) { return !p.n; })) {
        var sym = P[0].syms[Object.keys(P[0].syms)[0]], lhsIsSym = /^\s*[-+]?\s*[A-Za-z_][\w()]*\s*$/.test(normalize(segs[0]));
        if (lhsIsSym && sym.kind === "value" && /^z:/.test(sym.key)) { // an element impedance: Z_C1 = −j5
          var zw = P[P.length - 1].ev(trueEnv), en0 = sym.key.slice(2), ze0 = K.c.edges.filter(function (e) { return e.name === en0; })[0];
          if (close(zw, sym.val)) { res.status = "ok"; res.kind = "value"; res.msg = "ممانعة " + en0 + " صحيحة ✓"; res.en = "The impedance of " + en0 + " is right ✓"; }
          else {
            res.status = "err"; res.kind = "value";
            var zs0 = ze0 ? zSlips(ze0, K.w).filter(function (x) { return close(zw, x.z); })[0] : null;
            if (zs0) { res.msg = zs0.ar; res.en = zs0.en; }
            else { res.msg = "ممانعة " + en0 + " لا تطابق: " + (ze0 && ze0.type === "C" ? "Z_C = −j/(ωC)" : "Z_L = jωL") + " = " + fmt(sym.val, "") + " Ω."; res.en = "The impedance of " + en0 + " doesn’t match: " + (ze0 && ze0.type === "C" ? "Z_C = −j/(ωC)" : "Z_L = jωL") + " = " + fmt(sym.val, "") + " Ω."; }
          }
          lines.push(res); return;
        }
        if (lhsIsSym && sym.kind !== "value") {
          var val = P[P.length - 1].ev(trueEnv), neg = /^\s*-/.test(normalize(segs[0])) ? -1 : 1, t = zsc(sym.val, neg);
          for (var j = 1; j + 1 < P.length; j++) { var a1 = P[j].ev(trueEnv), a2 = P[j + 1].ev(trueEnv); if (!close(a1, a2)) { res.status = "err"; res.kind = "arith"; res.msg = "خطأ حسابي: " + segs[j].trim() + " يساوي " + fmt(a1, body) + " وليس " + fmt(a2, body) + "."; res.en = "Arithmetic slip: " + segs[j].trim() + " is " + fmt(a1, body) + ", not " + fmt(a2, body) + "."; lines.push(res); mine[sym.key] = { v: zsc(val, neg), n: res.n }; return; } }
          mine[sym.key] = { v: zsc(val, neg), n: res.n };
          var nm = sub(sym.name);
          if (close(val, t)) { res.status = "ok"; res.kind = "value"; res.msg = "قيمة " + nm + " صحيحة لهذه الدائرة ✓"; res.en = "The value of " + nm + " is right for this circuit ✓"; }
          else {
            res.status = "err"; res.kind = "value";
            var mag = Math.abs(zabs(val) - zabs(t)) <= 0.012 * zabs(t);
            if (close(val, zneg(t))) { res.msg = "قيمة " + nm + " صحيحة لكن إشارتها معكوسة" + (K.ac ? " (الزاوية مزاحة 180°)" : "") + ". راجع اتجاه المرجع أو القطبية في الرسم."; res.en = "The value of " + nm + " has the right size but the wrong sign" + (K.ac ? " (the angle is off by 180°)" : "") + ". Check the drawn reference direction or polarity."; }
            else if (K.ac && !real(t) && close(val, zconj(t))) { res.msg = "مقدار " + nm + " صحيح لكن إشارة الزاوية معكوسة. راجع إشارة الجزء التخيلي (−j للمكثف و +j للملف)."; res.en = "The magnitude of " + nm + " is right but the angle has the wrong sign. Check the sign of the imaginary part (−j for a capacitor, +j for an inductor)."; }
            else if (close(val, zsc(t, 1000)) || close(val, zsc(t, 1 / 1000))) { res.msg = "رقم " + nm + " صحيح لكن البادئة خطأ (فرق ×1000)."; res.en = "The number for " + nm + " is right but the prefix is wrong (off by ×1000)."; }
            else if (K.ac && sym.kind === "elp" && close(val, zsc(t, 2))) { res.msg = "قيمة " + nm + " ضعف الصحيحة: الفيزورات هنا بالقيمة العظمى، فالقدرة ½·|V|·|I|·cos θ (أو ½·|I|²·R)."; res.en = "The value of " + nm + " is twice the right one: phasors here are peak values, so the power is ½·|V|·|I|·cos θ (or ½·|I|²·R)."; }
            else if (K.ac && (close(val, zsc(t, Math.SQRT2)) || close(val, zsc(t, Math.SQRT1_2)))) { res.msg = "قيمة " + nm + " مضروبة أو مقسومة على √2: خلطت بين القيمة العظمى والفعالة. الفيزورات هنا بالقيمة العظمى."; res.en = "The value of " + nm + " is off by √2: you mixed up peak and rms. Phasors here are peak values."; }
            else if (K.ac && mag) { res.msg = "مقدار " + nm + " صحيح لكن الزاوية خطأ. راجع زاوية كل حد قبل الجمع: اجمع الأعداد المركبة بالصيغة الجبرية (a + jb)."; res.en = "The magnitude of " + nm + " is right but the angle is wrong. Check each term’s angle before adding: add complex numbers in rectangular form (a + jb)."; }
            else {
              var other = Object.keys(K.S).map(function (k) { return K.S[k]; }).filter(function (o) { return o.key !== sym.key && o.kind === sym.kind && close(val, o.val); })[0];
              res.msg = "قيمة " + nm + " لا تطابق الدائرة." + (other ? " هذه قيمة " + sub(other.name) + "، فربما خلطت بينهما." : " راجع المعادلات التي أوصلتك لها.");
              res.en = "The value of " + nm + " doesn’t match the circuit." + (other ? " That is the value of " + sub(other.name) + "; you may have mixed them up." : " Check the equations that led to it.");
              var ph2 = sym.kind === "port" && !other && portHint(sym.key); if (ph2) { res.msg = "قيمة " + sym.name + " لا تطابق الدائرة. " + ph2[0]; res.en = "The value of " + sym.name + " doesn’t match the circuit. " + ph2[1]; }
            }
          }
          lines.push(res); return;
        }
      }
      if (!hasSym) { // plain arithmetic
        for (var q = 0; q + 1 < P.length; q++) { var x1 = P[q].ev(trueEnv), x2 = P[q + 1].ev(trueEnv); if (x1 === null || x2 === null) continue; if (!close(x1, x2)) { res.status = "err"; res.kind = "arith"; res.msg = "خطأ حسابي: " + segs[q].trim() + " يساوي " + fmt(x1, body) + " وليس " + fmt(x2, body) + "."; res.en = "Arithmetic slip: " + segs[q].trim() + " is " + fmt(x1, body) + ", not " + fmt(x2, body) + "."; lines.push(res); return; } }
        res.status = "ok"; res.kind = "arith"; res.msg = "الحساب صحيح ✓"; res.en = "The arithmetic is right ✓"; lines.push(res); return;
      }
      // an equation with symbols: does it hold for this circuit?
      for (var k = 0; k + 1 < P.length; k++) {
        var L = P[k], R = P[k + 1], lv = L.ev(trueEnv), rv = R.ev(trueEnv);
        if (lv === null || rv === null) { res.status = "skip"; res.msg = "لم أستطع حساب هذا السطر (قسمة على صفر؟)."; res.en = "I couldn’t evaluate this line (division by zero?)."; lines.push(res); return; }
        var scl = Math.max.apply(null, Object.keys(L.syms).concat(Object.keys(R.syms)).map(function (kk) { var sy = L.syms[kk] || R.syms[kk]; return zabs(sy.val); }).concat([zabs(lv), zabs(rv)])) * 0.05;
        if (close(lv, rv, scl)) continue;
        res.status = "err";
        // right with the student's own earlier values → the error comes from an earlier line
        var lm = L.ev(mineEnv), rm = R.ev(mineEnv), from = Object.keys(L.syms).concat(Object.keys(R.syms)).map(function (kk) { return mine[kk]; }).filter(function (x) { return x; });
        if (from.length && lm !== null && rm !== null && close(lm, rm, scl)) {
          var ln = from.map(function (x) { return x.n; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
          res.kind = "carried"; res.status = "warn";
          res.msg = "هذه الخطوة صحيحة بالقيم التي كتبتها، لكن قيمة سابقة فيها خطأ (السطر " + ln.join("، ") + ")، فانتقل الخطأ إلى هنا.";
          res.en = "This step is right with the values you wrote, but an earlier value is wrong (line " + ln.join(", ") + "), so the error carried into it.";
          lines.push(res); return;
        }
        if ((!L.n || !R.n) && P.length > 2) {
          res.kind = "sub"; res.msg = "التعويض لا يطابق: الطرف الذي فيه الرموز لا يساوي الأرقام التي كتبتها بالقيم الحقيقية للدائرة. راجع القيم التي عوّضتها."; res.en = "The substitution doesn’t match: the side with symbols doesn’t equal the numbers you wrote, with this circuit’s real values. Check the values you put in.";
          lines.push(res); return;
        }
        diagnose(res, L, R);
        lines.push(res); return;
      }
      res.status = "ok";
      var kind = identify(P[0], P[P.length - 1]);
      res.kind = kind ? kind.kind : "eq";
      res.msg = "المعادلة صحيحة لهذه الدائرة ✓" + (kind ? " (" + kind.ar + ")" : ""); res.en = "The equation holds for this circuit ✓" + (kind ? " (" + kind.en + ")" : "");
      if (kind && kind.row) usedRows[kind.row] = 1;
      lines.push(res);
    });
    function formOf(L, R, mode) { // the equation L − R as a linear form in this mode's unknowns (the controlling quantity written out)
      var all = Object.assign({}, L.syms, R.syms), keys = [], usesCtrl = false;
      for (var k in all) {
        var sy = all[k];
        if (sy.kind === "value") continue;
        if (sy.kind === mode) keys.push(k);
        else if (sy.kind === "ctrl") { keys.push(k); usesCtrl = true; }
        else return null;
      }
      if (!keys.some(function (k) { return all[k].kind === mode; }) && !usesCtrl) return null;
      var f = function (env) { var e = function (sym) { return env[sym.key] !== undefined ? env[sym.key] : sym.val; }; var a = L.ev(e), b = R.ev(e); return a === null || b === null ? null : zsub(a, b); };
      var raw = linear(f, keys); if (!raw) return null;
      var o = lf(raw.k);
      for (var q in raw.coef) {
        var s2 = all[q], c2 = raw.coef[q];
        if (s2.kind === mode) o.coef[s2.name] = zadd(o.coef[s2.name] || Z(0), c2);
        else { var ex = RW.ctrl[mode]; if (!ex) return null; o = add(o, ex, q === "x:i" ? zdiv(c2, RW.ctrl.Z) : c2); }
      }
      return { form: o, raw: raw, usesCtrl: usesCtrl };
    }
    function small(f) { var m = zabs(f.raw.k); for (var q in f.raw.coef) m = Math.max(m, zabs(f.raw.coef[q]) * W); return zabs(f.form.k) <= 1e-6 * (1 + m) && Object.keys(f.form.coef).every(function (q) { return zabs(f.form.coef[q]) * W <= 1e-6 * (1 + m); }); }
    function identify(L, R) {
      var modes = ["node", "mesh"];
      for (var i = 0; i < modes.length; i++) {
        var f = formOf(L, R, modes[i]); if (!f) continue;
        if (f.usesCtrl && small(f)) return { kind: "ctrl", ar: "قيد الكمية المتحكِّمة", en: "the controlling quantity’s constraint" };
        var rows = RW[modes[i]];
        for (var j = 0; j < rows.length; j++) if (vecMatch(f.form, rowForm(rows[j]))) return { kind: rows[j].kind, row: rows[j].id, ar: rows[j].ar, en: rows[j].en };
        return { kind: "eq", ar: "تجمع أكثر من قانون أو فيها قيد", en: "it combines laws or a constraint" };
      }
      return null;
    }
    function diagnose(res, L, R) {
      res.kind = "law";
      var modes = ["node", "mesh"];
      for (var i = 0; i < modes.length; i++) {
        var mode = modes[i], f = formOf(L, R, mode); if (!f) continue;
        var cands = [], s = f.form;
        if (f.usesCtrl && RW.ctrl[mode] && vecMatch(s, RW.ctrl[mode])) { // ix = −(…): the constraint written against the drawn arrow
          res.msg = "قيد الكمية المتحكِّمة إشارته معكوسة: " + (RW.ctrl.name || "الكمية المتحكِّمة") + " تؤخذ باتجاه السهم (أو القطبية) المرسوم على " + RW.ctrl.on + "، أي (جهد بداية السهم − جهد نهايته)" + (RW.ctrl.isI ? " ÷ " + RW.ctrl.on : "") + ".";
          res.en = "The controlling quantity’s constraint has the wrong sign: " + (RW.ctrl.name || "it") + " follows the arrow (or polarity) drawn on " + RW.ctrl.on + ", i.e. (voltage at the arrow’s start − at its end)" + (RW.ctrl.isI ? " ÷ " + RW.ctrl.on : "") + ".";
          return;
        }
        var addC = function (m, ar, en, z, flip) { if (m) cands.push({ ar: ar, en: en, d: lamCost(m), z: z, flip: flip }); };
        RW[mode].forEach(function (r) {
          if (r.whole) { r.wholeSlips.forEach(function (sl) { addC(vecMatch(s, sl.t), sl.ar, sl.en); }); return; }
          var ts = r.terms.map(function (x) { return x.t; });
          r.terms.forEach(function (x, j) {
            var others = sum(ts.filter(function (_, q) { return q !== j; }));
            if (r.terms.length > 1) addC(vecMatch(s, others), "معادلة " + r.ar + " ناقصة: نسيت " + x.ar + ".", "Your " + r.en + " is missing " + x.en + ".");
            addC(vecMatch(s, add(others, x.t, -1)), "في " + r.ar + " إشارة " + x.ar + " معكوسة: " + r.flipHint[0], "In " + r.en + " " + x.en + " has the wrong sign: " + r.flipHint[1], 0, 1);
            x.slips.forEach(function (sl) { addC(vecMatch(s, add(others, sl.t)), "في " + r.ar + ": " + sl.ar, "In " + r.en + ": " + sl.en, sl.z); });
          });
        });
        cands.sort(function (a, b) { return a.d - b.d; });
        if (cands.length) {
          var tie = cands.filter(function (x) { return Math.abs(x.d - cands[0].d) < 1e-6; }), zt = tie.filter(function (x) { return x.z; })[0], ft = tie.filter(function (x) { return x.flip; })[0];
          if (zt && ft) { res.msg = zt.ar + " (أو أنك عكست إشارة هذا الحد: النتيجة نفسها.)"; res.en = zt.en + " (Or you reversed this term’s sign: it gives the same equation.)"; return; } // a lone L or C: both slips give this equation
          res.msg = cands[0].ar; res.en = cands[0].en; return;
        }
        var N = RW.notes, hintAr = "", hintEn = "";
        if (mode === "node") {
          if (N.super) { hintAr = " تنبيه: " + N.super.map(function (g) { return g.map(sub).join(" و "); }).join("، ") + " بينها مصدر جهد، وتياره مجهول؛ فاكتب KCL للعقدة العظمى (كل الفروع الخارجة منها معًا) ومعادلة قيد المصدر."; hintEn = " Note: " + N.super.map(function (g) { return g.map(sub).join(", "); }).join("; ") + " are joined by a voltage source whose current is unknown; write KCL for the supernode (all branches leaving it together) and the source’s constraint."; }
          else if (N.known) { hintAr = " تنبيه: جهد " + N.known.map(sub).join(" و ") + " يحدده مصدر جهد من الأرضي مباشرة، فلا تكتب له KCL."; hintEn = " Note: the voltage of " + N.known.map(sub).join(", ") + " is set by a voltage source from ground, so it needs no KCL."; }
          else { hintAr = " اكتب لكل فرع تياره الخارج من العقدة: (جهد العقدة − جهد الطرف الآخر − جهد المصادر) ÷ " + (K.ac ? "الممانعة." : "المقاومة."); hintEn = " For each branch write the current leaving the node: (node voltage − other end − source voltages) ÷ " + (K.ac ? "impedance." : "resistance."); }
          res.msg = "المعادلة لا تتحقق في هذه الدائرة: ليست KCL صحيحة عند أي عقدة ولا قيدًا صحيحًا." + hintAr; res.en = "The equation doesn’t hold in this circuit: it isn’t a correct KCL at any node, nor a correct constraint." + hintEn; return;
        }
        if (N.superMesh) { hintAr = " تنبيه: الحلقات " + N.superMesh.map(function (g) { return g.map(sub).join(" و "); }).join("، ") + " بينها مصدر تيار، فاكتب KVL للحلقة العظمى (حولها كلها) ومعادلة قيد المصدر."; hintEn = " Note: meshes " + N.superMesh.map(function (g) { return g.map(sub).join(", "); }).join("; ") + " share a current source, so write KVL around the supermesh (around all of them) and the source’s constraint."; }
        else if (N.knownMesh) { hintAr = " تنبيه: تيار الحلقة " + N.knownMesh.map(sub).join(" و ") + " يحدده مصدر تيار على حافتها، فلا تكتب لها KVL."; hintEn = " Note: the current of mesh " + N.knownMesh.map(sub).join(", ") + " is set by a current source on its edge, so it needs no KVL."; }
        res.msg = "المعادلة لا تتحقق في هذه الدائرة: ليست KVL صحيحة لأي حلقة ولا قيدًا صحيحًا." + hintAr; res.en = "The equation doesn’t hold in this circuit: it isn’t a correct KVL for any mesh, nor a correct constraint." + hintEn; return;
      }
      var ps = Object.keys(Object.assign({}, L.syms, R.syms)).filter(function (k) { return /^p:/.test(k); })[0];
      var hh = ps && portHint(ps);
      if (hh) { res.msg = "المعادلة لا تتحقق بالقيم الحقيقية لهذه الدائرة. " + hh[0]; res.en = "The equation doesn’t hold with this circuit’s real values. " + hh[1]; return; }
      res.msg = "المعادلة لا تتحقق بالقيم الحقيقية لهذه الدائرة. راجع القانون الذي استخدمته والإشارات" + (K.ac ? " والزوايا." : "."); res.en = "The equation doesn’t hold with this circuit’s real values. Check the law you used and the signs" + (K.ac ? " and angles." : ".");
    }
    /* the method as a whole: is a set of equations missing? */
    var summary = { ok: lines.filter(function (l) { return l.status === "ok"; }).length, err: lines.filter(function (l) { return l.status === "err"; }).length, notes: [] };
    var hasVal = function (pfx) { return Object.keys(mine).some(function (k) { return k.indexOf(pfx) === 0; }); };
    [["node", "n:", "طريقة جهود العقد تحتاج ", "The node-voltage method needs "], ["mesh", "m:", "طريقة تيارات الحلقات تحتاج ", "The mesh-current method needs "]].forEach(function (m) {
      var rows = RW[m[0]], used = rows.filter(function (r) { return usedRows[r.id]; });
      if (!used.length || used.length >= rows.length || hasVal(m[1])) return;
      var miss = rows.filter(function (r) { return !usedRows[r.id]; });
      summary.notes.push({ t: m[2] + rows.length + " معادلات مستقلة في هذه الدائرة. ينقصك: " + miss.map(function (r) { return r.ar; }).join("، ") + ".", en: m[3] + rows.length + " independent equations in this circuit. Still missing: " + miss.map(function (r) { return r.en; }).join("; ") + "." });
    });
    return { lines: lines, summary: summary };
  }

  /* a ready context from a circuit (DC or AC). An open port (type T) of a Thévenin or equivalent circuit is left open
     for the node and mesh unknowns; the port quantities come from the same solver with the port open, shorted, and
     driven by a test source. */
  function contextFor(c) {
    if (!c) return null;
    var MNA = CV.mna, A = CV.analysis, ac = !!c.omega, AC = CV.ac;
    if (ac && !AC) return null;
    var copy = function (keep) { return { rows: c.rows, cols: c.cols, ground: c.ground, omega: c.omega, shape: c.shape, center: c.center, embed: c.embed, meshes: c.meshes, edges: c.edges.filter(keep).map(function (e) { return Object.assign({}, e); }) }; };
    var port = c.edges.filter(function (e) { return e.type === "T"; })[0], open = port ? copy(function (e) { return e.type !== "T"; }) : c;
    var sol = null; try { var so = ac ? AC.solve(open) : MNA.solve(open); if (so.ok) sol = so; } catch (e) { sol = null; }
    var P = {};
    if (port) {
      try {
        if (ac) {
          var pr = AC.port(c);
          if (pr) { P.voc = pr.voc; P.isc = pr.isc; P.zth = pr.zth; if (pr.zth.re > 0) { P.pmax = Z(zabs(pr.voc) * zabs(pr.voc) / (8 * pr.zth.re)); P.zl = zconj(pr.zth); } }
        } else {
          if (sol) P.voc = sol.volt(port.a) - sol.volt(port.b);
          var sh = copy(function () { return true; }); sh.edges.forEach(function (e) { if (e.type === "T") { e.type = "V"; e.value = 0; e.plus = "a"; e.name = "__sc"; } });
          var ss = MNA.solve(sh); if (ss.ok) P.isc = ss.byName.__sc.i;
          var t = copy(function () { return true; }); t.edges.forEach(function (e) { if (e.type === "V" || e.type === "I") e.value = 0; if (e.type === "T") { e.type = "I"; e.value = 1; e.dir = "ba"; e.name = "__test"; } });
          var st = MNA.solve(t); if (st.ok) P.rth = st.volt(port.a) - st.volt(port.b);
          if (P.voc !== undefined && P.rth > 0) P.pmax = P.voc * P.voc / (4 * P.rth);
        }
      } catch (e) {}
    }
    var nodes = [], meshes = [];
    if (sol) {
      nodes = c.nodeLabels && c.nodeLabels.length ? c.nodeLabels : A.nodeLabels(open);
      if (ac) {
        meshes = AC.meshes(open, sol) || [];
        var shape = A.meshes(open, { elements: sol.elements.map(function (it) { return { edge: it.edge, i: it.i.re }; }) }); // the mesh-edge relations
        if (shape && shape.edgeFaces) meshes.edgeFaces = shape.edgeFaces;
      } else meshes = A.meshes(open, sol) || [];
    }
    return { c: open, sol: sol, nodes: nodes, meshes: meshes, port: P, drawn: c };
  }
  CV.stepcheck = { check: check, context: context, contextFor: contextFor, _rows: function (ctx) { var K = context(ctx); W = 1; return { K: K, RW: buildRows(K) }; } };
})(typeof window !== "undefined" ? window : globalThis);
