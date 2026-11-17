/* CircuitVision — plots for the Signals and Systems course (lessons, interactive widgets and the explainer videos).
   CV.sp.plot(spec) → an SVG string. Colours come from CSS classes (sp-c1 … sp-c4) so the plots follow the light and dark themes.
   spec = { w, h, x: [x0, x1], y: [y0, y1], xl: "t", yl: "x(t)", xt: [ticks] | auto, yt: [ticks] | auto, grid: true,
            items: [ { ct: fn, c: 1 }                    continuous curve y = fn(t)
                     { dt: fn | {n: value}, c: 2 }       stems at integer n inside x range
                     { imp: [[x, area, "label"]], c: 3 }  impulses (arrows)
                     { pts: [[x, y], …], c: 1, dash }    polyline
                     { vline: x, c, dash, label } { hline: y, c, dash, label }
                     { band: [xa, xb], c }                 shaded strip (ROC, passband)
                     { text: [x, y, "label"], c, anchor }
                     { pz: { poles: [[re, im]], zeros: [[re, im]] } }  pole-zero marks (× and o)
                     { circle: [cx, cy, r], dash }          circle (unit circle)
            ] } */
(function (root) {
  "use strict";
  var CV = root.CV = root.CV || {};
  function r(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function nice(a, b, n) {
    var span = b - a, raw = span / (n || 6), p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p, out = [];
    for (var v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Math.abs(v) < 1e-12 ? 0 : +v.toPrecision(6));
    return out;
  }
  function fmt(v) { if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(0); return String(+v.toPrecision(4)); }
  function plot(s) {
    var W = s.w || 520, H = s.h || 220, L = s.left || 40, R = 14, T = 14, B = s.bottom || 30;
    var x0 = s.x[0], x1 = s.x[1], y0 = s.y[0], y1 = s.y[1];
    function X(v) { return L + (v - x0) / (x1 - x0) * (W - L - R); }
    function Y(v) { return T + (y1 - v) / (y1 - y0) * (H - T - B); }
    function cl(v) { return Math.max(T - 4, Math.min(H - B + 4, v)); }
    var o = ['<svg class="sp" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(s.aria || s.yl || "plot") + '">'];
    var xt = s.xt || nice(x0, x1, s.nx || 8), yt = s.yt || nice(y0, y1, s.ny || 4);
    if (s.grid !== false) {
      xt.forEach(function (v) { o.push('<line class="sp-g" x1="' + r(X(v)) + '" y1="' + T + '" x2="' + r(X(v)) + '" y2="' + (H - B) + '"/>'); });
      yt.forEach(function (v) { o.push('<line class="sp-g" x1="' + L + '" y1="' + r(Y(v)) + '" x2="' + (W - R) + '" y2="' + r(Y(v)) + '"/>'); });
    }
    (s.items || []).forEach(function (it) {
      if (it.band) o.push('<rect class="sp-band sp-c' + (it.c || 1) + '" x="' + r(X(Math.max(x0, it.band[0]))) + '" y="' + T + '" width="' + r(X(Math.min(x1, it.band[1])) - X(Math.max(x0, it.band[0]))) + '" height="' + (H - T - B) + '"/>');
    });
    var ya = y0 <= 0 && y1 >= 0 ? Y(0) : H - B, xa = x0 <= 0 && x1 >= 0 ? X(0) : L;
    o.push('<line class="sp-ax" x1="' + L + '" y1="' + r(ya) + '" x2="' + (W - R + 6) + '" y2="' + r(ya) + '"/><path class="sp-axh" d="M' + (W - R + 8) + ' ' + r(ya) + 'l-7 -3.5v7z"/>');
    o.push('<line class="sp-ax" x1="' + r(xa) + '" y1="' + (H - B) + '" x2="' + r(xa) + '" y2="' + (T - 6) + '"/><path class="sp-axh" d="M' + r(xa) + ' ' + (T - 8) + 'l-3.5 7h7z"/>');
    xt.forEach(function (v) { if (s.xtl === false) return; o.push('<text class="sp-t" x="' + r(X(v)) + '" y="' + r(Math.min(H - 6, ya + 15)) + '" text-anchor="middle">' + esc(s.xf ? s.xf(v) : fmt(v)) + '</text>'); });
    yt.forEach(function (v) { if (v === 0 || s.ytl === false) return; o.push('<text class="sp-t" x="' + r(xa - 5) + '" y="' + r(Y(v) + 4) + '" text-anchor="end">' + esc(s.yf ? s.yf(v) : fmt(v)) + '</text>'); });
    if (s.xl) o.push('<text class="sp-l" x="' + (W - R) + '" y="' + r(Math.min(H - 4, ya - 6)) + '" text-anchor="end">' + esc(s.xl) + '</text>');
    if (s.yl) o.push('<text class="sp-l" x="' + r(xa + 7) + '" y="' + (T + 4) + '">' + esc(s.yl) + '</text>');
    (s.items || []).forEach(function (it) {
      var c = " sp-c" + (it.c || 1), d;
      if (it.ct) {
        var N = it.n || 400, pts = [], prev = null;
        d = "";
        for (var k = 0; k <= N; k++) {
          var t = x0 + (x1 - x0) * k / N, v = it.ct(t);
          if (!isFinite(v)) { prev = null; continue; }
          var px = r(X(t)), py = r(cl(Y(v)));
          d += (prev === null ? "M" : "L") + px + " " + py; prev = 1;
        }
        o.push('<path class="sp-ln' + c + (it.dash ? " sp-dash" : "") + '" d="' + d + '"/>');
      }
      if (it.pts) o.push('<polyline class="sp-ln' + c + (it.dash ? " sp-dash" : "") + '" points="' + it.pts.map(function (p) { return r(X(p[0])) + "," + r(cl(Y(p[1]))); }).join(" ") + '"/>');
      if (it.dt) {
        var a = Math.ceil(x0), b = Math.floor(x1);
        for (var n = a; n <= b; n++) {
          var v2 = typeof it.dt === "function" ? it.dt(n) : it.dt[n];
          if (v2 === undefined || v2 === null || !isFinite(v2)) continue;
          if (v2 === 0 && it.zeros === false) continue;
          o.push('<line class="sp-st' + c + '" x1="' + r(X(n)) + '" y1="' + r(ya) + '" x2="' + r(X(n)) + '" y2="' + r(cl(Y(v2))) + '"/><circle class="sp-dot' + c + '" cx="' + r(X(n)) + '" cy="' + r(cl(Y(v2))) + '" r="3.6"/>');
        }
      }
      if (it.imp) it.imp.forEach(function (p) {
        var yy = cl(Y(p[1])), up = p[1] >= 0;
        o.push('<line class="sp-imp' + c + '" x1="' + r(X(p[0])) + '" y1="' + r(ya) + '" x2="' + r(X(p[0])) + '" y2="' + r(yy + (up ? 6 : -6)) + '"/><path class="sp-imph' + c + '" d="M' + r(X(p[0])) + ' ' + r(yy) + 'l-4.5 ' + (up ? 9 : -9) + 'h9z"/>');
        if (p[2]) o.push('<text class="sp-t' + c + '" x="' + r(X(p[0]) + 6) + '" y="' + r(yy + (up ? 4 : 12)) + '">' + esc(p[2]) + '</text>');
      });
      if (it.vline !== undefined) { o.push('<line class="sp-ref' + c + (it.dash === false ? "" : " sp-dash") + '" x1="' + r(X(it.vline)) + '" y1="' + T + '" x2="' + r(X(it.vline)) + '" y2="' + (H - B) + '"/>'); if (it.label) o.push('<text class="sp-t' + c + '" x="' + r(X(it.vline) + 4) + '" y="' + (T + 12) + '">' + esc(it.label) + '</text>'); }
      if (it.hline !== undefined) { o.push('<line class="sp-ref' + c + (it.dash === false ? "" : " sp-dash") + '" x1="' + L + '" y1="' + r(Y(it.hline)) + '" x2="' + (W - R) + '" y2="' + r(Y(it.hline)) + '"/>'); if (it.label) o.push('<text class="sp-t' + c + '" x="' + (W - R - 2) + '" y="' + r(Y(it.hline) - 5) + '" text-anchor="end">' + esc(it.label) + '</text>'); }
      if (it.text) o.push('<text class="sp-t' + c + '" x="' + r(X(it.text[0])) + '" y="' + r(Y(it.text[1])) + '" text-anchor="' + (it.anchor || "middle") + '">' + esc(it.text[2]) + '</text>');
      if (it.circle) o.push('<ellipse class="sp-ref' + c + (it.dash ? " sp-dash" : "") + '" cx="' + r(X(it.circle[0])) + '" cy="' + r(Y(it.circle[1])) + '" rx="' + r(Math.abs(X(it.circle[2]) - X(0))) + '" ry="' + r(Math.abs(Y(it.circle[2]) - Y(0))) + '" fill="none"/>');
      if (it.pz) {
        (it.pz.zeros || []).forEach(function (z) { o.push('<circle class="sp-z' + c + '" cx="' + r(X(z[0])) + '" cy="' + r(Y(z[1])) + '" r="6"/>'); });
        (it.pz.poles || []).forEach(function (p) { var px = X(p[0]), py = Y(p[1]); o.push('<path class="sp-p' + c + '" d="M' + r(px - 6) + ' ' + r(py - 6) + 'l12 12M' + r(px + 6) + ' ' + r(py - 6) + 'l-12 12"/>'); });
      }
    });
    o.push("</svg>");
    return o.join("");
  }
  /* rectangular pulse, triangle, step helpers used by many plots */
  var F = {
    u: function (t) { return t >= 0 ? 1 : 0; },
    rect: function (a, b, h) { return function (t) { return t >= a && t <= b ? (h === undefined ? 1 : h) : 0; }; },
    sinc: function (x) { return x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x); }
  };
  CV.sp = { plot: plot, F: F, nice: nice };
})(typeof window !== "undefined" ? window : globalThis);
