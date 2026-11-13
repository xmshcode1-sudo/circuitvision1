/* CircuitVision — checking a written solution against the circuit itself, line by line.
   The arithmetic checker (mathcheck.js) can only say whether numbers agree. This module knows the circuit:
   every symbol the student writes (node voltages v1…, mesh currents i1…, R2, Vs, i_R2, v_R2, vx…) is given its
   true value from the solver, so a written equation can be judged as physics, not just as arithmetic:
     · an equation that holds for this circuit is right, whatever form it is written in (it may be scaled,
       rearranged, or a combination of laws);
     · an equation that does not hold is compared with the correct KCL row of every node and KVL row of every
       mesh, and with the same rows after one typical slip (a branch left out, a sign flipped, the wrong
       resistor, a shared branch with the neighbour's current forgotten), to say exactly what went wrong;
     · a value written for a variable is compared with the circuit's, and a later line that is right with the
       student's own earlier values is reported as an error carried from that line, not a new one.
   Nothing here is guessed: every verdict comes from substituting the solver's values.
   check(text, ctx) → { lines: [...], summary: {...} }   ctx = { c, sol, nodes (nodeLabels), meshes } */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  var PREFIX = { p: 1e-12, n: 1e-9, "µ": 1e-6, "μ": 1e-6, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  var UNIT_RE = /^(p|n|µ|μ|u|m|k|K|M|G)?(Ω|ohm|V|A|W|S)(?![A-Za-z0-9Ω])/;
  var SUBD = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9", "ₓ": "x" };
  var SUBS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  function sub(name) { return name.replace(/(\d)/g, function (d) { return SUBS[+d]; }); }
  function fmt(v) { return CV.num ? CV.num(v) : String(+v.toPrecision(4)); }

  function normalize(s) {
    return String(s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/(\d)٫(\d)/g, "$1.$2").replace(/(\d),(\d)/g, "$1.$2")
      .replace(/[₀-₉ₓ]/g, function (c) { return SUBD[c]; })
      .replace(/[×·⋅]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/∥|\|\|/g, "|").trim();
  }

  /* ---------- the circuit's symbols ---------- */
  function context(ctx) {
    var c = ctx.c, sol = ctx.sol, MNA = CV.mna, nodes = MNA.buildNodes(c);
    var S = {}, idOf = {};
    (ctx.nodes || []).forEach(function (nl) { S["v" + nl.name.slice(1)] = { key: "n:" + nl.name, kind: "node", name: nl.name, val: sol.volt(nl.at), id: nl.id }; idOf[nl.id] = nl.name; });
    (ctx.meshes || []).forEach(function (m) { S["i" + m.name.slice(1)] = { key: "m:" + m.name, kind: "mesh", name: m.name, val: m.value }; });
    sol.elements.forEach(function (it) {
      var e = it.edge; if (!e.name || e.type === "W") return;
      var nm = e.name === "D" ? null : e.name;
      if (nm) {
        if (e.type === "R" || e.type === "V" || e.type === "I") S[nm] = { key: "e:" + nm, kind: "value", name: nm, val: e.value };
        S["v" + nm] = S["v_" + nm] = S["V(" + nm + ")"] = { key: "ev:" + nm, kind: "elv", name: nm, val: it.v };
        S["i" + nm] = S["i_" + nm] = S["I(" + nm + ")"] = { key: "ei:" + nm, kind: "eli", name: nm, val: it.i };
        S["p" + nm] = S["P" + nm] = S["p_" + nm] = S["P_" + nm] = { key: "ep:" + nm, kind: "elp", name: "p_" + nm, val: it.p };
      }
    });
    var D = sol.byName.D;
    if (D) { var ce = sol.byName[D.edge.ctrl]; if (ce) { S.vx = { key: "x:v", kind: "ctrl", name: "vₓ", val: ce.v }; S.ix = { key: "x:i", kind: "ctrl", name: "iₓ", val: ce.i }; } }
    return { S: S, nodes: nodes, idOf: idOf, c: c, sol: sol, meshes: ctx.meshes || [], labels: ctx.nodes || [] };
  }
  function lookup(K, raw) {
    var S = K.S, t = raw.replace(/_/g, "");
    if (S[raw]) return S[raw];
    if (S[t]) return S[t];
    var m = /^([vViI])\(?([A-Za-z]+\d*)\)?$/.exec(raw.replace(/_/g, ""));
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
        if (u) { v *= u[1] ? PREFIX[u[1]] : 1; i += sk + u[0].length; }
        t.push({ k: "n", v: v }); continue;
      }
      if ((m = /^[A-Za-z][A-Za-z0-9_]*(\([A-Za-z]+\d*\))?/.exec(s.slice(i)))) {
        var id = m[0]; i += id.length;
        if (UNIT_RE.test(id) && t.length && (t[t.length - 1].k === ")" || t[t.length - 1].k === "n") && !lookup(K, id)) continue; // a unit after a bracket
        var sym = lookup(K, id);
        if (!sym) { unknown = unknown || id; t.push({ k: "s", sym: null }); continue; }
        t.push({ k: "s", sym: sym }); continue;
      }
      if ("+-*/^()|".indexOf(ch) > -1) { t.push({ k: ch }); i++; continue; }
      return { bad: true };
    }
    var out = [];
    t.forEach(function (tok) {
      var prev = out[out.length - 1];
      if (prev && (prev.k === "n" || prev.k === ")" || prev.k === "s") && (tok.k === "(" || tok.k === "s" || (tok.k === "n" && prev.k !== "n"))) out.push({ k: "*" });
      out.push(tok);
    });
    if (unknown) return { unknown: unknown };
    var syms = {}; out.forEach(function (x) { if (x.k === "s") syms[x.sym.key] = x.sym; });
    function ev(env) {
      var p = 0;
      function peek() { return out[p] && out[p].k; }
      function expr() { var v = term(); while (peek() === "+" || peek() === "-") { var o = out[p++].k, r = term(); v = o === "+" ? v + r : v - r; } return v; }
      function term() { var v = pw(); while (peek() === "*" || peek() === "/" || peek() === "|") { var o = out[p++].k, r = pw(); v = o === "*" ? v * r : o === "/" ? v / r : v * r / (v + r); } return v; }
      function pw() { var v = un(); if (peek() === "^") { p++; v = Math.pow(v, pw()); } return v; }
      function un() { if (peek() === "-") { p++; return -un(); } if (peek() === "+") { p++; return un(); } return pr(); }
      function pr() {
        var tk = out[p++]; if (!tk) throw 0;
        if (tk.k === "n") return tk.v;
        if (tk.k === "s") return env(tk.sym);
        if (tk.k === "(") { var v = expr(); if (peek() !== ")") throw 0; p++; return v; }
        throw 0;
      }
      try { var v = expr(); return p === out.length && isFinite(v) ? v : null; } catch (e) { return null; }
    }
    return { ev: ev, syms: syms, n: Object.keys(syms).length };
  }
  function close(a, b, scale) { var s = Math.max(Math.abs(a), Math.abs(b), scale || 0); return Math.abs(a - b) <= Math.max(0.012 * s, 1e-12); }

  /* ---------- correct rows: KCL per essential node (in node voltages), KVL per mesh (in mesh currents) ---------- */
  function nodeRows(K) {
    var c = K.c, nodes = K.nodes, ess = {}, rows = {};
    K.labels.forEach(function (nl) { ess[nl.id] = nl.name; });
    ess[-1] = "gnd";
    var els = c.edges.filter(function (e) { return e.type !== "W"; }), at = {};
    els.forEach(function (e, i) { [nodes.of(e.a), nodes.of(e.b)].forEach(function (n) { (at[n] = at[n] || []).push(i); }); });
    var seen = {}, chains = [];
    els.forEach(function (e0, i0) {
      if (seen[i0]) return;
      // walk both ways from this element through non-essential nodes
      function walk(from, idx) { // returns [list of {i, u, w}] going outward from node `from` starting with element idx
        var path = [], cur = from, i = idx;
        for (var g = 0; g < 50; g++) {
          var e = els[i], na = nodes.of(e.a), nb = nodes.of(e.b), next = na === cur ? nb : na;
          path.push({ i: i, u: cur, w: next }); seen[i] = 1;
          if (ess[next] !== undefined) return { path: path, end: next };
          var nx = (at[next] || []).filter(function (j) { return j !== i; });
          if (nx.length !== 1) return { path: path, end: next, open: true };
          cur = next; i = nx[0];
        }
        return { path: path, end: cur, open: true };
      }
      var na0 = nodes.of(e0.a), nb0 = nodes.of(e0.b);
      // find one essential end: go from b-side backwards first
      var left = ess[na0] !== undefined ? { path: [], end: na0 } : (function () { var nx = (at[na0] || []).filter(function (j) { return j !== i0; }); if (nx.length !== 1) return { path: [], end: na0, open: true }; var r = walk(na0, nx[0]); return r; })();
      var right = walk(na0, i0);
      if (left.open || right.open) return;
      // chain from A = left.end to B = right.end: reverse the left part
      var lp = left.path.slice().reverse().map(function (x) { return { i: x.i, u: x.w, w: x.u }; });
      var path = lp.concat(right.path), A = left.end, B = right.end;
      if (A === B) return;
      var R = 0, E = 0, I = null, dep = false, names = [];
      path.forEach(function (x) {
        var e = els[x.i], fwd = nodes.of(e.a) === x.u; names.push(e.name === "D" ? "المصدر التابع" : e.name);
        if (e.type === "R") R += e.value;
        else if (e.type === "V") E += (e.plus === "a") === fwd ? e.value : -e.value;
        else if (e.type === "I") { var iab = e.dir === "ab" ? e.value : -e.value; I = fwd ? iab : -iab; }
        else dep = true;
      });
      chains.push({ A: A, B: B, R: R, E: E, I: I, dep: dep, names: names, rs: path.filter(function (x) { return els[x.i].type === "R"; }).map(function (x) { return els[x.i]; }) });
    });
    var V = function (n) { return ess[n] && ess[n] !== "gnd" ? ess[n] : null; };
    function term(ch, from, R, E, sgn) { // current leaving `from` along chain, as {coef:{}, k}
      var to = from === ch.A ? ch.B : ch.A, s = from === ch.A ? 1 : -1, o = { coef: {}, k: 0 };
      if (ch.I !== null) { o.k = s * ch.I * (sgn || 1); return o; }
      var r = R === undefined ? ch.R : R, e = E === undefined ? ch.E : E;
      if (V(from)) o.coef[V(from)] = (o.coef[V(from)] || 0) + 1 / r;
      if (V(to)) o.coef[V(to)] = (o.coef[V(to)] || 0) - 1 / r;
      o.k = -s * e / r;
      if (sgn) { for (var q in o.coef) o.coef[q] *= sgn; o.k *= sgn; }
      return o;
    }
    K.labels.forEach(function (nl) {
      var mine = chains.filter(function (ch) { return ch.A === nl.id || ch.B === nl.id; });
      var bad = mine.some(function (ch) { return ch.dep || (ch.I === null && ch.R === 0); });
      rows[nl.name] = { name: nl.name, bad: bad, super: mine.some(function (ch) { return ch.I === null && ch.R === 0 && !ch.dep; }), dep: mine.some(function (ch) { return ch.dep; }),
        terms: mine.map(function (ch) { return { ch: ch, t: bad ? null : term(ch, nl.id) }; }), node: nl.id };
    });
    return { rows: rows, chains: chains, term: term, V: V };
  }
  function meshRows(K) {
    var rows = {};
    if (!K.meshes.length || !K.meshes.edgeFaces) return rows;
    K.meshes.forEach(function (m) { rows[m.name] = { name: m.name, bad: false, terms: [] }; });
    K.meshes.edgeFaces.forEach(function (x) {
      var e = x.e; if (e.type === "W") return;
      [["p", 1], ["m", -1]].forEach(function (side) {
        var F = x[side[0]]; if (!F || !rows[F]) return;
        var s = side[1], o = { coef: {}, k: 0 };
        if (e.type === "R") { if (x.p) o.coef[x.p] = (o.coef[x.p] || 0) + s * e.value; if (x.m) o.coef[x.m] = (o.coef[x.m] || 0) - s * e.value; }
        else if (e.type === "V") o.k = s * (e.plus === "a" ? e.value : -e.value);
        else { rows[F].bad = true; rows[F][e.type === "I" ? "super" : "dep"] = true; return; }
        rows[F].terms.push({ e: e, t: o, other: side[0] === "p" ? x.m : x.p, s: s });
      });
    });
    return rows;
  }
  function sum(terms) { var o = { coef: {}, k: 0 }; terms.forEach(function (x) { if (!x) return; for (var q in x.coef) o.coef[q] = (o.coef[q] || 0) + x.coef[q]; o.k += x.k; }); return o; }
  var W = 1; // typical size of the unknowns, so coefficients and constants weigh alike when forms are compared
  function vecMatch(s, r, vars) { // s ≈ λ r ?
    var keys = vars.concat(["__k"]), sv = keys.map(function (q) { return q === "__k" ? s.k : (s.coef[q] || 0) * W; }), rv = keys.map(function (q) { return q === "__k" ? r.k : (r.coef[q] || 0) * W; });
    var rr = rv.reduce(function (a, x) { return a + x * x; }, 0), ss = sv.reduce(function (a, x) { return a + x * x; }, 0);
    if (rr < 1e-20 || ss < 1e-20) return false;
    var lam = sv.reduce(function (a, x, i) { return a + x * rv[i]; }, 0) / rr;
    if (Math.abs(lam) < 1e-12) return false;
    var err = sv.reduce(function (a, x, i) { var d = x - lam * rv[i]; return a + d * d; }, 0);
    return err <= 1e-4 * ss ? { lam: lam } : false;
  }
  /* the student's equation as a linear form in the given variables (null if it is not linear in them) */
  function linear(f, keys) {
    var z = {}; keys.forEach(function (k) { z[k] = 0; });
    var f0 = f(z); if (f0 === null) return null;
    var o = { coef: {}, k: f0 };
    for (var j = 0; j < keys.length; j++) {
      var e1 = Object.assign({}, z), e2 = Object.assign({}, z); e1[keys[j]] = 1; e2[keys[j]] = 3.7;
      var a = f(e1), b = f(e2); if (a === null || b === null) return null;
      var cj = a - f0; if (Math.abs((b - f0) - 3.7 * cj) > 1e-6 * (1 + Math.abs(b - f0))) return null;
      o.coef[keys[j]] = cj;
    }
    var mix = Object.assign({}, z); keys.forEach(function (k, i) { mix[k] = 1 + i * 0.7; });
    var pred = f0 + keys.reduce(function (s, k) { return s + o.coef[k] * mix[k]; }, 0), act = f(mix);
    if (act === null || Math.abs(pred - act) > 1e-6 * (1 + Math.abs(act))) return null;
    return o;
  }
  function chainName(ch, NR, en) {
    var a = NR.V(ch.A), b = NR.V(ch.B), at = function (n) { return n ? sub(n) : en ? "ground" : "الأرضي"; };
    return (en ? "the branch " : "الفرع ") + ch.names.join(" + ") + (en ? " between " : " بين ") + at(a) + (en ? " and " : " و ") + at(b);
  }

  /* ---------- the check ---------- */
  function check(text, ctx) {
    var K = context(ctx), NR = nodeRows(K), MR = meshRows(K), mine = {}, lines = [], usedRows = {};
    W = Math.max(1, Math.max.apply(null, Object.keys(K.S).map(function (k) { var o = K.S[k]; return o.kind === "node" || o.kind === "mesh" ? Math.abs(o.val) : 0; }).concat([0])));
    var nodeVars = K.labels.map(function (n) { return n.name; }), meshVars = K.meshes.map(function (m) { return m.name; });
    var Rvals = K.c.edges.filter(function (e) { return e.type === "R"; });
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
        res.msg = "لا أعرف الرمز «" + unk.unknown + "» في هذه الدائرة." + (have ? " المجاهيل في الرسم: " + have + "." : "") + " وللعناصر: R2 و Vs و i_R2 و v_R2 و p_R2 (بأسماء الرسم).";
        res.en = "I don’t know the symbol “" + unk.unknown + "” in this circuit." + (haveEn ? " The unknowns on the drawing are " + haveEn + "." : "") + " For elements: R2, Vs, i_R2, v_R2, p_R2 (with the drawing’s names).";
        lines.push(res); return;
      }
      if (P.some(function (p) { return p.bad || !p.ev; })) { res.status = "skip"; res.msg = "لم أفهم صيغة هذا السطر."; res.en = "I couldn’t read this line."; lines.push(res); return; }
      var hasSym = P.some(function (p) { return p.n; });
      // a value for one variable:  v1 = 8 V
      if (P.length >= 2 && P[0].n === 1 && P.slice(1).every(function (p) { return !p.n; })) {
        var sym = P[0].syms[Object.keys(P[0].syms)[0]], lhsIsSym = /^\s*[-+]?\s*[A-Za-z_][\w()]*\s*$/.test(normalize(segs[0]));
        if (lhsIsSym) {
          var val = P[P.length - 1].ev(trueEnv), neg = /^\s*-/.test(normalize(segs[0])) ? -1 : 1, t = sym.val * neg;
          // arithmetic inside the numeric parts first
          for (var j = 1; j + 1 < P.length; j++) { var a1 = P[j].ev(trueEnv), a2 = P[j + 1].ev(trueEnv); if (!close(a1, a2)) { res.status = "err"; res.kind = "arith"; res.msg = "خطأ حسابي: " + segs[j].trim() + " يساوي " + fmt(a1) + " وليس " + fmt(a2) + "."; res.en = "Arithmetic slip: " + segs[j].trim() + " is " + fmt(a1) + ", not " + fmt(a2) + "."; lines.push(res); mine[sym.key] = { v: val * neg, n: res.n }; return; } }
          mine[sym.key] = { v: val * neg, n: res.n };
          if (close(val, t)) { res.status = "ok"; res.kind = "value"; res.msg = "قيمة " + sub(sym.name) + " صحيحة لهذه الدائرة ✓"; res.en = "The value of " + sub(sym.name) + " is right for this circuit ✓"; }
          else {
            res.status = "err"; res.kind = "value";
            if (close(val, -t)) { res.msg = "قيمة " + sub(sym.name) + " صحيحة لكن إشارتها معكوسة. راجع اتجاه المرجع أو القطبية في الرسم."; res.en = "The value of " + sub(sym.name) + " has the right size but the wrong sign. Check the drawn reference direction or polarity."; }
            else if (close(val, t * 1000) || close(val, t / 1000)) { res.msg = "رقم " + sub(sym.name) + " صحيح لكن البادئة خطأ (فرق ×1000)."; res.en = "The number for " + sub(sym.name) + " is right but the prefix is wrong (off by ×1000)."; }
            else {
              var other = Object.keys(K.S).map(function (k) { return K.S[k]; }).filter(function (o) { return o.key !== sym.key && o.kind === sym.kind && close(val, o.val); })[0];
              res.msg = "قيمة " + sub(sym.name) + " لا تطابق الدائرة." + (other ? " هذه قيمة " + sub(other.name) + "، فربما خلطت بينهما." : " راجع المعادلات التي أوصلتك لها.");
              res.en = "The value of " + sub(sym.name) + " doesn’t match the circuit." + (other ? " That is the value of " + sub(other.name) + "; you may have mixed them up." : " Check the equations that led to it.");
            }
          }
          lines.push(res); return;
        }
      }
      if (!hasSym) { // plain arithmetic
        for (var q = 0; q + 1 < P.length; q++) { var x1 = P[q].ev(trueEnv), x2 = P[q + 1].ev(trueEnv); if (x1 === null || x2 === null) continue; if (!close(x1, x2)) { res.status = "err"; res.kind = "arith"; res.msg = "خطأ حسابي: " + segs[q].trim() + " يساوي " + fmt(x1) + " وليس " + fmt(x2) + "."; res.en = "Arithmetic slip: " + segs[q].trim() + " is " + fmt(x1) + ", not " + fmt(x2) + "."; lines.push(res); return; } }
        res.status = "ok"; res.kind = "arith"; res.msg = "الحساب صحيح ✓"; res.en = "The arithmetic is right ✓"; lines.push(res); return;
      }
      // an equation with symbols: does it hold for this circuit?
      for (var k = 0; k + 1 < P.length; k++) {
        var L = P[k], R = P[k + 1], lv = L.ev(trueEnv), rv = R.ev(trueEnv);
        if (lv === null || rv === null) { res.status = "skip"; res.msg = "لم أستطع حساب هذا السطر (قسمة على صفر؟)."; res.en = "I couldn’t evaluate this line (division by zero?)."; lines.push(res); return; }
        var scale = Math.max.apply(null, Object.keys(L.syms).concat(Object.keys(R.syms)).map(function (kk) { var sy = L.syms[kk] || R.syms[kk]; return Math.abs(sy.val); }).concat([Math.abs(lv), Math.abs(rv)])) * 0.05;
        if (close(lv, rv, scale)) continue;
        res.status = "err";
        // right with the student's own earlier values → the error comes from an earlier line
        var lm = L.ev(mineEnv), rm = R.ev(mineEnv), from = Object.keys(L.syms).concat(Object.keys(R.syms)).map(function (kk) { return mine[kk]; }).filter(function (x) { return x; });
        if (from.length && lm !== null && rm !== null && close(lm, rm, scale)) {
          var ln = from.map(function (x) { return x.n; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
          res.kind = "carried"; res.status = "warn";
          res.msg = "هذه الخطوة صحيحة بالقيم التي كتبتها، لكن قيمة سابقة فيها خطأ (السطر " + ln.join("، ") + ")، فانتقل الخطأ إلى هنا.";
          res.en = "This step is right with the values you wrote, but an earlier value is wrong (line " + ln.join(", ") + "), so the error carried into it.";
          lines.push(res); return;
        }
        if ((!L.n || !R.n) && P.length > 2) {
          // one side is plain numbers: a substitution step
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
    function formOf(L, R, vars) {
      return linear(function (env) { var e = function (sym) { return env[sym.name] !== undefined ? env[sym.name] : sym.val; }; var a = L.ev(e), b = R.ev(e); return a === null || b === null ? null : a - b; }, vars);
    }
    function onlyOf(L, R, kind) { var all = Object.assign({}, L.syms, R.syms); return Object.keys(all).every(function (k) { var s = all[k]; return s.kind === kind || s.kind === "value"; }) && Object.keys(all).some(function (k) { return all[k].kind === kind; }); }
    function identify(L, R) {
      if (onlyOf(L, R, "node")) {
        var s = formOf(L, R, nodeVars); if (!s) return null;
        for (var n in NR.rows) { var r = NR.rows[n]; if (!r.bad && vecMatch(s, sum(r.terms.map(function (x) { return x.t; })), nodeVars)) return { kind: "kcl", row: "n:" + n, ar: "KCL عند " + sub(n), en: "KCL at " + sub(n) }; }
        return { kind: "eq", ar: "تجمع أكثر من قانون أو فيها قيد", en: "it combines laws or a constraint" };
      }
      if (onlyOf(L, R, "mesh")) {
        var sm = formOf(L, R, meshVars); if (!sm) return null;
        for (var m in MR) { var rm = MR[m]; if (!rm.bad && vecMatch(sm, sum(rm.terms.map(function (x) { return x.t; })), meshVars)) return { kind: "kvl", row: "m:" + m, ar: "KVL في الحلقة " + sub(m), en: "KVL around mesh " + sub(m) }; }
        return { kind: "eq", ar: "تجمع أكثر من قانون أو فيها قيد", en: "it combines laws or a constraint" };
      }
      return null;
    }
    function diagnose(res, L, R) {
      res.kind = "law";
      if (onlyOf(L, R, "node")) {
        var s = formOf(L, R, nodeVars);
        if (s) {
          var best = null, cands = [];
          function add(m, o) { if (m) cands.push({ o: o, d: Math.abs(Math.log(Math.abs(m.lam))) + (m.lam < 0 ? 0.01 : 0) }); }
          Object.keys(NR.rows).forEach(function (n) {
            var r = NR.rows[n]; if (r.bad) return;
            var all = r.terms.map(function (x) { return x.t; });
            r.terms.forEach(function (x, i) {
              var others = all.filter(function (_, j) { return j !== i; }), ch = x.ch;
              add(vecMatch(s, sum(others), nodeVars), { ar: "معادلة KCL عند " + sub(n) + " ناقصة: نسيت تيار " + chainName(ch, NR) + ".", en: "Your KCL at " + sub(n) + " is missing a term: the current in " + chainName(ch, NR, true) + "." });
              add(vecMatch(s, sum(others.concat([NR.term(ch, r.node, undefined, undefined, -1)])), nodeVars), { ar: "في KCL عند " + sub(n) + " إشارة تيار " + chainName(ch, NR) + " معكوسة: كل التيارات الخارجة من العقدة بنفس الإشارة.", en: "In KCL at " + sub(n) + " the current in " + chainName(ch, NR, true) + " has the wrong sign: all currents leaving the node take the same sign." });
              if (ch.I === null && ch.E) add(vecMatch(s, sum(others.concat([NR.term(ch, r.node, undefined, -ch.E)])), nodeVars), { ar: "في KCL عند " + sub(n) + " إشارة جهد المصدر في " + chainName(ch, NR) + " معكوسة. انتبه أي طرف من المصدر هو +.", en: "In KCL at " + sub(n) + " the source voltage in " + chainName(ch, NR, true) + " has the wrong sign. Check which end of the source is +." });
              if (ch.I === null) Rvals.forEach(function (re) {
                if (ch.rs.length !== 1 || re === ch.rs[0] || re.value === ch.rs[0].value) return;
                add(vecMatch(s, sum(others.concat([NR.term(ch, r.node, re.value)])), nodeVars), { ar: "في KCL عند " + sub(n) + " قسمت تيار " + chainName(ch, NR) + " على " + re.name + " بدل " + ch.rs[0].name + ".", en: "In KCL at " + sub(n) + " you divided the current in " + chainName(ch, NR, true) + " by " + re.name + " instead of " + ch.rs[0].name + "." });
              });
            });
          });
          cands.sort(function (a, b) { return a.d - b.d; }); best = cands.length ? cands[0].o : null;
          if (best) { res.msg = best.ar; res.en = best.en; return; }
          var sup = Object.keys(NR.rows).filter(function (n) { return NR.rows[n].super; });
          res.msg = "المعادلة لا تتحقق في هذه الدائرة: ليست KCL صحيحة عند أي عقدة." + (sup.length ? " تنبيه: " + sup.map(sub).join(" و ") + " متصلة بمصدر جهد مباشرة، فاستخدم العقدة العظمى (KCL للعقدتين معًا + معادلة فرق الجهد)." : " اكتب لكل فرع تياره الخارج من العقدة: (جهد العقدة − جهد الطرف الآخر − جهد المصادر) ÷ المقاومة.");
          res.en = "The equation doesn’t hold in this circuit: it isn’t a correct KCL at any node." + (sup.length ? " Note: " + sup.map(sub).join(" and ") + " connects straight to a voltage source, so use a supernode (KCL for both nodes together + the voltage-difference equation)." : " For each branch write the current leaving the node: (node voltage − other end − source voltages) ÷ resistance.");
          return;
        }
      }
      if (onlyOf(L, R, "mesh")) {
        var sm = formOf(L, R, meshVars);
        if (sm) {
          var bm = null, mc = [];
          function addm(m, o) { if (m) mc.push({ o: o, d: Math.abs(Math.log(Math.abs(m.lam))) + (m.lam < 0 ? 0.01 : 0) }); }
          Object.keys(MR).forEach(function (m) {
            var r = MR[m]; if (r.bad) return;
            var all = r.terms.map(function (x) { return x.t; });
            r.terms.forEach(function (x, i) {
              var others = all.filter(function (_, j) { return j !== i; }), e = x.e, nm = e.name;
              var flip = { coef: {}, k: -x.t.k }; for (var q in x.t.coef) flip.coef[q] = -x.t.coef[q];
              addm(vecMatch(sm, sum(others), meshVars), { ar: "معادلة KVL في الحلقة " + sub(m) + " ناقصة: نسيت " + (e.type === "R" ? "هبوط الجهد على " + nm : "جهد المصدر " + nm) + ".", en: "Your KVL around mesh " + sub(m) + " is missing " + (e.type === "R" ? "the voltage drop across " + nm : "the source voltage " + nm) + "." });
              addm(vecMatch(sm, sum(others.concat([flip])), meshVars), { ar: "في KVL للحلقة " + sub(m) + " إشارة " + (e.type === "R" ? "هبوط الجهد على " + nm : "المصدر " + nm) + " معكوسة. امشِ مع اتجاه الحلقة وطبّق الإشارة عند كل عنصر.", en: "In KVL around mesh " + sub(m) + " the sign of " + (e.type === "R" ? "the drop across " + nm : "source " + nm) + " is wrong. Walk with the mesh direction and apply the sign at each element." });
              if (e.type === "R" && x.other) {
                var own = { coef: {}, k: 0 }; own.coef[m] = x.t.coef[m];
                addm(vecMatch(sm, sum(others.concat([own])), meshVars), { ar: "في KVL للحلقة " + sub(m) + ": المقاومة " + nm + " مشتركة مع الحلقة " + sub(x.other) + "، فتيارها " + sub(m) + " − " + sub(x.other) + " وليس " + sub(m) + " وحده.", en: "In KVL around mesh " + sub(m) + ": " + nm + " is shared with mesh " + sub(x.other) + ", so its current is " + sub(m) + " − " + sub(x.other) + ", not " + sub(m) + " alone." });
              }
            });
          });
          mc.sort(function (a, b) { return a.d - b.d; }); bm = mc.length ? mc[0].o : null;
          if (bm) { res.msg = bm.ar; res.en = bm.en; return; }
          var sp = Object.keys(MR).filter(function (m) { return MR[m].super; });
          res.msg = "المعادلة لا تتحقق في هذه الدائرة: ليست KVL صحيحة لأي حلقة." + (sp.length ? " تنبيه: في الحلقة " + sp.map(sub).join(" و ") + " مصدر تيار، فاستخدم الحلقة العظمى أو معادلة القيد." : "");
          res.en = "The equation doesn’t hold in this circuit: it isn’t a correct KVL for any mesh." + (sp.length ? " Note: mesh " + sp.map(sub).join(" and ") + " has a current source, so use a supermesh or the constraint equation." : "");
          return;
        }
      }
      res.msg = "المعادلة لا تتحقق بالقيم الحقيقية لهذه الدائرة. راجع القانون الذي استخدمته والإشارات."; res.en = "The equation doesn’t hold with this circuit’s real values. Check the law you used and the signs.";
    }
    /* the method as a whole */
    var summary = { ok: lines.filter(function (l) { return l.status === "ok"; }).length, err: lines.filter(function (l) { return l.status === "err"; }).length, notes: [] };
    var kcl = Object.keys(usedRows).filter(function (k) { return k[0] === "n"; }), kvl = Object.keys(usedRows).filter(function (k) { return k[0] === "m"; });
    var hasVal = function (pfx) { return Object.keys(mine).some(function (k) { return k.indexOf(pfx) === 0; }); };
    if (kcl.length && kcl.length < nodeVars.length && !hasVal("n:")) {
      var miss = nodeVars.filter(function (n) { return !usedRows["n:" + n]; });
      summary.notes.push({ t: "طريقة جهود العقد تحتاج معادلة لكل عقدة غير مرجعية (" + nodeVars.length + "). ينقصك معادلة عند " + miss.map(sub).join(" و ") + ".", en: "The node-voltage method needs one equation per non-reference node (" + nodeVars.length + "). You still need one at " + miss.map(sub).join(" and ") + "." });
    }
    if (kvl.length && kvl.length < meshVars.length && !hasVal("m:")) {
      var mm = meshVars.filter(function (m) { return !usedRows["m:" + m]; });
      summary.notes.push({ t: "طريقة تيارات الحلقات تحتاج معادلة لكل حلقة (" + meshVars.length + "). ينقصك معادلة للحلقة " + mm.map(sub).join(" و ") + ".", en: "The mesh-current method needs one equation per mesh (" + meshVars.length + "). You still need one for mesh " + mm.map(sub).join(" and ") + "." });
    }
    return { lines: lines, summary: summary };
  }
  CV.stepcheck = { check: check, context: context, _rows: function (ctx) { var K = context(ctx); return { K: K, NR: nodeRows(K), MR: meshRows(K) }; } };
})(typeof window !== "undefined" ? window : globalThis);
