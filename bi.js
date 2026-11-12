/* CircuitVision — the site in two languages at once.
   Every Arabic text block that has a translation gets the other language under it, smaller and lighter.
   The student chooses which language comes first (cv.lang = "ar" | "en"); English first turns the page left-to-right.
   Translations live in dictionaries (js/i18n/*.js) keyed by the Arabic text exactly as the page shows it
   (whitespace collapsed). The engine works on the rendered page, so the pages' own code does not change:
   a MutationObserver translates whatever the page renders later (lessons, the lab inspector, feedback…). */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  var mode = "ar";
  try { mode = localStorage.getItem("cv.lang") === "en" ? "en" : "ar"; } catch (e) {}
  var html = document.documentElement;
  if (mode === "en") { html.setAttribute("dir", "ltr"); html.setAttribute("lang", "en"); }
  html.classList.add("bi-" + mode);

  var dict = {}, pats = [];
  var AR = /[؀-ۿ]/;
  var SKIP = { SCRIPT: 1, STYLE: 1, SVG: 1, svg: 1, TEXTAREA: 1, INPUT: 1, CANVAS: 1, CODE: 1, PRE: 1, NOSCRIPT: 1, TEMPLATE: 1, TITLE: 1 };
  var INLINE = { A: 1, B: 1, STRONG: 1, I: 1, EM: 1, SPAN: 1, SUB: 1, SUP: 1, SMALL: 1, BR: 1, ABBR: 1, MARK: 1, BDI: 1, BDO: 1, Q: 1, S: 1, U: 1, KBD: 1, VAR: 1, IMG: 1, svg: 1, SVG: 1, WBR: 1, TIME: 1, OUTPUT: 1 };
  var BLOCKISH = { P: 1, LI: 1, DD: 1, DT: 1, H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, TD: 1, TH: 1, DIV: 1, SECTION: 1, HEADER: 1, FOOTER: 1, ARTICLE: 1, ASIDE: 1, BLOCKQUOTE: 1, FIGCAPTION: 1, LEGEND: 1, CAPTION: 1, DL: 1, UL: 1, OL: 1, FIELDSET: 1, FORM: 1, NAV: 1, MAIN: 1, TABLE: 1, TBODY: 1, THEAD: 1, TR: 1, FIGURE: 1, DETAILS: 1 };
  function norm(s) { return String(s).replace(/[‎‏]/g, "").replace(/\s+/g, " ").trim(); }
  function look(t) {
    if (!t || !AR.test(t)) return null;
    if (dict[t] !== undefined) return dict[t];
    var nums = [], tk = t.replace(/\d+(?:[.,]\d+)?/g, function (n) { nums.push(n); return "#"; });
    if (nums.length && dict[tk] !== undefined) { var i0 = 0; return String(dict[tk]).replace(/#/g, function () { return nums[i0++] || "#"; }); }
    if (/…$/.test(t)) { // a shortened preview of a longer text: translate the full text and shorten the English the same way
      var pre = t.slice(0, -1).trim(), full = null;
      for (var key in dict) if (key.length > pre.length && key.indexOf(pre) === 0) { full = dict[key]; break; }
      if (full !== null) { var plain = String(full).replace(/<[^>]+>/g, ""), n = Math.round(plain.length * pre.length / (pre.length + 40)); return plain.length > n + 8 ? plain.slice(0, n).replace(/\s+\S*$/, "") + "…" : plain; }
    }
    for (var i = 0; i < pats.length; i++) { var m = pats[i][0].exec(t); if (m) { var r = pats[i][1], out = typeof r === "function" ? r.apply(null, m) : t.replace(pats[i][0], r); if (out !== null && out !== undefined) return out; } }
    return null;
  }
  var PHRASE_SPAN = /(^|\s)(ltr|mono|eq-i|nowrap|sym|unit|k|hl|lk)(\s|$)/;
  function phrasing(el) { // inline content that belongs to the sentence around it (a formula, a number, a bold word)
    var t = el.tagName;
    if (t === "SPAN") return !el.className || PHRASE_SPAN.test(el.className) || !AR.test(el.textContent);
    return !!INLINE[t] || !!INLINE[t.toUpperCase()];
  }
  function runs(el) { // a sentence split across inline pieces next to other blocks: try it as one unit
    var kids = Array.prototype.slice.call(el.childNodes), cur = [], all = [];
    kids.forEach(function (k) {
      var ok = k.nodeType === 3 || (k.nodeType === 1 && phrasing(k) && !k.querySelector("input,select,textarea,button,canvas") && !(k.classList && (k.classList.contains("bi-w") || k.classList.contains("bi-s"))) && k.getAttribute("data-bi") !== "1");
      if (ok) cur.push(k); else { if (cur.length) all.push(cur); cur = []; }
    });
    if (cur.length) all.push(cur);
    function txt(r) { return norm(r.map(function (n) { return n.nodeType === 3 ? n.nodeValue : textOf(n); }).join("")); }
    function wrap(r, en) { var w = document.createElement("span"); r[0].parentNode.insertBefore(w, r[0]); r.forEach(function (n) { w.appendChild(n); }); pair(w, en); }
    function best(r) { // the longest stretch of pieces that reads as one known sentence (a list number or a bold label beside it may be separate)
      if (r.length < 2 || r.length > 12) return;
      for (var len = r.length; len >= 2; len--) for (var i = 0; i + len <= r.length; i++) {
        var part = r.slice(i, i + len), t = txt(part);
        if (!AR.test(t)) continue;
        var en = look(t); if (en === null) continue;
        wrap(part, en); best(r.slice(0, i)); best(r.slice(i + len)); return;
      }
    }
    all.forEach(best);
  }
  function textOf(el) { // text without the labels drawn inside SVG pictures
    if (!el.querySelector || !el.querySelector("svg, .bi-s")) return el.textContent;
    var c = el.cloneNode(true); c.querySelectorAll("svg, .bi-s").forEach(function (x) { x.remove(); }); return c.textContent;
  }
  function hasControl(el) { return !!el.querySelector("input,select,textarea,button,canvas"); }
  function isLeaf(el) { // only inline content inside
    var all = el.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) { var x = all[i]; if (x.closest("svg")) continue; if (!phrasing(x)) return false; }
    return true;
  }
  function sec(lang, cls) { var s = document.createElement("span"); s.className = cls; s.setAttribute("lang", lang); s.setAttribute("dir", lang === "ar" ? "rtl" : "ltr"); return s; }
  function pair(el, en) { // el's own nodes stay (listeners intact); the translation goes before or after them
    var block = BLOCKISH[el.tagName], tr = sec(mode === "ar" ? "en" : "ar", "bi-s"), keep;
    if (mode === "ar") { tr.innerHTML = en; }
    if (block) {
      if (mode === "ar") el.appendChild(tr);
      else { var p = sec("en", "bi-p"); p.innerHTML = en; keep = sec("ar", "bi-s"); while (el.firstChild) keep.appendChild(el.firstChild); el.appendChild(p); el.appendChild(keep); }
    } else {
      var w = document.createElement("span"); w.className = "bi-w";
      var a = mode === "ar" ? sec("ar", "bi-p") : sec("en", "bi-p");
      if (mode === "ar") { while (el.firstChild) a.appendChild(el.firstChild); w.appendChild(a); w.appendChild(tr); }
      else { a.innerHTML = en; keep = sec("ar", "bi-s"); while (el.firstChild) keep.appendChild(el.firstChild); w.appendChild(a); w.appendChild(keep); }
      el.appendChild(w);
    }
    el.setAttribute("data-bi", "1");
  }
  function pairText(node, en) {
    var w = document.createElement("span"); w.className = "bi-w";
    var a = sec(mode === "ar" ? "ar" : "en", "bi-p"), b = sec(mode === "ar" ? "en" : "ar", "bi-s");
    node.parentNode.insertBefore(w, node);
    if (mode === "ar") { a.appendChild(node); b.innerHTML = en; } else { a.innerHTML = en; b.appendChild(node); }
    w.appendChild(a); w.appendChild(b); w.setAttribute("data-bi", "1");
  }
  function svgText(svg) { // drawings have no room for two lines: in English-first their labels switch to English
    if (mode !== "en") return;
    var ts = svg.querySelectorAll("text, tspan");
    for (var i = 0; i < ts.length; i++) {
      var t = ts[i]; if (t.querySelector("tspan") || t.getAttribute("data-bi-src")) continue;
      var raw = norm(t.textContent); if (!AR.test(raw)) continue;
      var en = look(raw); if (en === null) continue;
      t.setAttribute("data-bi-src", raw); t.textContent = String(en).replace(/<[^>]+>/g, "");
    }
  }
  function walk(el) {
    if (el.nodeType === 1 && (el.tagName === "svg" || el.tagName === "SVG")) { svgText(el); return; }
    if (el.nodeType === 1 && el.closest && el.closest("svg")) { svgText(el.closest("svg")); return; }
    if (SKIP[el.tagName] || el.nodeType !== 1) return;
    if (el.classList && (el.classList.contains("bi-s") || el.classList.contains("bi-p") || el.classList.contains("no-bi"))) return;
    if (el.getAttribute("data-bi") === "1") {
      if (el.querySelector(":scope > .bi-s, :scope > .bi-w")) return; // still paired
      el.removeAttribute("data-bi");
    }
    if (el.tagName === "OPTION") { var ot = norm(el.textContent), oe = el.getAttribute("data-bi-src") ? null : look(ot); if (oe) { el.setAttribute("data-bi-src", ot); var plain = oe.replace(/<[^>]+>/g, ""); el.textContent = mode === "ar" ? ot + " · " + plain : plain + " · " + ot; } return; }
    if (el.tagName === "OPTGROUP") { var lt = norm(el.label), le = look(lt); if (le && !el.getAttribute("data-bi-src")) { el.setAttribute("data-bi-src", lt); el.label = mode === "ar" ? lt + " · " + le.replace(/<[^>]+>/g, "") : le.replace(/<[^>]+>/g, "") + " · " + lt; } }
    var raw = textOf(el), t = AR.test(raw) ? norm(raw) : "";
    if (!t) return;
    var en = look(t);
    if (en !== null && !hasControl(el) && el.tagName !== "SELECT" && isLeaf(el)) { pair(el, en); return; }
    runs(el);
    var kids = Array.prototype.slice.call(el.childNodes);
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.nodeType === 1) walk(k);
      else if (k.nodeType === 3 && AR.test(k.nodeValue)) { var tt = norm(k.nodeValue), te = look(tt); if (te !== null && k.parentNode && !k.parentNode.closest(".bi-p,.bi-s")) pairText(k, te); }
    }
  }
  /* ---------- live page ---------- */
  var obs = null, queue = [], pending = false;
  function flush() {
    pending = false; var list = queue; queue = [];
    if (obs) obs.disconnect();
    list.forEach(function (n) { if (n.isConnected) walk(n); });
    if (obs) obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function enqueue(n) { if (n.nodeType === 3) n = n.parentNode; if (!n || n.nodeType !== 1) return; var t = n.closest && n.closest("[data-bi]"); if (t) { t.removeAttribute("data-bi"); n = t; } queue.push(n); }
  function start() {
    walk(document.body);
    // observer callbacks run before the browser paints, so new text never shows a frame without its translation
    obs = new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === "characterData") enqueue(m.target); else m.addedNodes.forEach(function (x) { if (x.nodeType === 1 || x.nodeType === 3) enqueue(x); }); }); flush(); });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else setTimeout(start, 0);

  /* ---------- collecting the Arabic text a page shows (used to build the dictionaries) ---------- */
  function collect(root, out) {
    out = out || {};
    (function go(el) {
      if (SKIP[el.tagName] || (el.classList && (el.classList.contains("bi-s") || el.classList.contains("bi-p") || el.classList.contains("no-bi")))) return;
      if (el.tagName === "OPTION") { var o = norm(el.getAttribute("data-bi-src") || el.textContent); if (AR.test(o)) out[o] = 1; return; }
      var raw = textOf(el); if (!AR.test(raw)) return;
      if (isLeaf(el) && !hasControl(el)) { out[norm(raw)] = 1; return; }
      Array.prototype.forEach.call(el.childNodes, function (k) { if (k.nodeType === 1) go(k); else if (k.nodeType === 3 && AR.test(k.nodeValue)) out[norm(k.nodeValue)] = 1; });
    })(root || document.body);
    return out;
  }

  CV.bi = {
    mode: function () { return mode; },
    set: function (m) { try { localStorage.setItem("cv.lang", m); } catch (e) {} location.reload(); },
    add: function (o) { for (var k in o) dict[norm(k)] = o[k]; },
    pattern: function (re, rep) { pats.push([re, rep]); },
    tr: function (t) { return look(norm(t)); },
    collect: collect, apply: walk, norm: norm,
    missing: function () { var c = collect(document.body), m = []; Object.keys(c).forEach(function (k) { if (look(k) === null) m.push(k); }); return m; }
  };
})();
