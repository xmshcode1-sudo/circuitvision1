/* CircuitVision — line-by-line arithmetic checker for a student's written solution.
   Reads lines like  "i = 30 / (5 + 10) = 2 A"  and checks that every pair of neighbouring
   purely numeric parts agrees. Parts with variables (i, R1, vₓ…) are skipped, never guessed.
   Understands: + − × ÷ * / ^ ² ³ √ π ( ), the parallel operator ∥ (a∥b = ab/(a+b)),
   ×10^n, Arabic digits and decimal comma, and SI units with prefixes after a number
   (4.5 mA, 2 kΩ, 12 V) — values are compared in base units. */
(function (root) {
  "use strict";
  var PREFIX = { p: 1e-12, n: 1e-9, "µ": 1e-6, "μ": 1e-6, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  var UNIT_RE = /^(p|n|µ|μ|u|m|k|K|M|G)?(Ω|ohm|V|A|W|S|J|C|F|H|Hz)(?![A-Za-zΩ])/;

  function normalize(s) {
    return String(s)
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/(\d)٫(\d)/g, "$1.$2").replace(/(\d),(\d)/g, "$1.$2")
      .replace(/[×·⋅]/g, "*").replace(/÷/g, "/").replace(/[−–—]/g, "-")
      .replace(/²/g, "^2").replace(/³/g, "^3").replace(/π/g, "pi")
      .replace(/∥|\|\|/g, "|").trim();
  }

  function tokenize(s) {
    var t = [], i = 0, m;
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)(e[-+]?\d+)?/i.exec(s.slice(i)))) {
        var v = parseFloat(m[0]); i += m[0].length;
        var rest = s.slice(i).replace(/^\s+/, ""), skipped = s.slice(i).length - rest.length;
        var u = UNIT_RE.exec(rest);
        if (u) { v *= u[1] ? PREFIX[u[1]] : 1; i += skipped + u[0].length; }
        t.push({ k: "n", v: v }); continue;
      }
      if (s.slice(i, i + 2) === "pi") { t.push({ k: "n", v: Math.PI }); i += 2; continue; }
      if (s.slice(i, i + 4) === "sqrt") { t.push({ k: "√" }); i += 4; continue; }
      if ("+-*/^()|√".indexOf(ch) > -1) { t.push({ k: ch }); i++; continue; }
      // A bare unit right after ")" e.g. "(2+3) Ω" — skip it; anything else is a variable.
      if ((m = UNIT_RE.exec(s.slice(i))) && t.length && (t[t.length - 1].k === ")" || t[t.length - 1].k === "n")) { i += m[0].length; continue; }
      return null;
    }
    // implicit multiplication: 2(3)  )(  2√4
    var out = [];
    t.forEach(function (tok, j) {
      var prev = out[out.length - 1];
      if (prev && (prev.k === "n" || prev.k === ")") && (tok.k === "(" || tok.k === "√" || (tok.k === "n" && prev.k === ")"))) out.push({ k: "*" });
      out.push(tok);
    });
    return out;
  }

  function evaluate(seg) {
    var toks = tokenize(normalize(seg));
    if (!toks || !toks.length) return null;
    var p = 0;
    function peek() { return toks[p] && toks[p].k; }
    function expr() { var v = term(); while (peek() === "+" || peek() === "-") { var o = toks[p++].k, r = term(); v = o === "+" ? v + r : v - r; } return v; }
    function term() {
      var v = power();
      while (peek() === "*" || peek() === "/" || peek() === "|") {
        var o = toks[p++].k, r = power();
        v = o === "*" ? v * r : o === "/" ? v / r : (v * r) / (v + r);
      }
      return v;
    }
    function power() { var v = unary(); if (peek() === "^") { p++; v = Math.pow(v, power()); } return v; }
    function unary() { if (peek() === "-") { p++; return -unary(); } if (peek() === "+") { p++; return unary(); } return primary(); }
    function primary() {
      var tk = toks[p++];
      if (!tk) throw 0;
      if (tk.k === "n") return tk.v;
      if (tk.k === "(") { var v = expr(); if (peek() !== ")") throw 0; p++; return v; }
      if (tk.k === "√") return Math.sqrt(power());
      throw 0;
    }
    try { var v = expr(); if (p !== toks.length || !isFinite(v)) return null; return v; } catch (e) { return null; }
  }

  function close(a, b) { var s = Math.max(Math.abs(a), Math.abs(b)); return Math.abs(a - b) <= Math.max(0.015 * s, 1e-12); }

  /* → [{ n, text, status: "ok"|"err"|"skip", expected?, left?, right? }] */
  function checkLines(text) {
    return String(text || "").split(/\n/).map(function (raw, idx) {
      var line = raw.trim();
      if (!line) return null;
      var segs = line.split(/=|≈/), vals = segs.map(evaluate), lastI = -1, res = { n: idx + 1, text: line, status: "skip" };
      for (var i = 0; i < segs.length; i++) {
        if (vals[i] === null) continue;
        if (lastI > -1) {
          if (!close(vals[lastI], vals[i])) { res.status = "err"; res.left = segs[lastI].trim(); res.right = segs[i].trim(); res.expected = vals[lastI]; return res; }
          res.status = "ok";
        }
        lastI = i;
      }
      return res;
    }).filter(Boolean);
  }

  /* The final numeric answer: last numeric part of the last line that has one. */
  function lastValue(text) {
    var lines = String(text || "").split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    for (var i = lines.length - 1; i >= 0; i--) {
      var segs = lines[i].split(/=|≈/);
      for (var j = segs.length - 1; j >= 0; j--) {
        var v = evaluate(segs[j]);
        if (v === null) continue;
        var m = /(-?[\d.]+(?:e[-+]?\d+)?)\s*(p|n|µ|μ|u|m|k|K|M|G)?(Ω|ohm|V|A|W|S)?\s*$/i.exec(normalize(segs[j]));
        return { value: v, unit: m && m[3] ? ((m[2] || "").replace("u", "µ").replace("μ", "µ").replace("K", "k") + (m[3] === "ohm" ? "Ω" : m[3])) : "" };
      }
    }
    return null;
  }

  /* Typing helpers: ^2 → ², _1 → ₁, ohm → Ω, || → ∥, sqrt → √, pi → π, -> → →, * → × */
  var SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", x: "ₓ" };
  var SUP = { 2: "²", 3: "³" };
  function prettify(s) {
    return s.replace(/\^([23])(?![0-9])/g, function (_, d) { return SUP[d]; })
      .replace(/_([0-9x])/g, function (_, d) { return SUB[d]; })
      .replace(/\bohm\b/gi, "Ω").replace(/\|\|/g, "∥").replace(/\bsqrt\b/g, "√").replace(/\bpi\b/g, "π")
      .replace(/->/g, "→").replace(/\*/g, "×");
  }

  root.CV = root.CV || {};
  root.CV.mathcheck = { evaluate: evaluate, checkLines: checkLines, lastValue: lastValue, prettify: prettify };
})(typeof window !== "undefined" ? window : globalThis);
