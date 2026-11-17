/* CircuitVision — interactive plots for the Signals and Systems lessons (lesson.html). A lesson places
   <div class="sigw" data-sigw='{"type": …}'>; CV.sigWidgets.mountAll(root) fills them. Types:
   transform  x(αt + β) of the lecture's signal, with sliders for α and β
   conv       the convolution sum drawn step by step: x[k], h[n − k] and the running y[n]
   fs         Fourier-series partial sums of a square wave / triangle / sawtooth with N harmonics
   alias      a sinusoid sampled at ωs and the sinusoid recovered by an ideal low-pass filter
   roc        the ROC of 1/((s+1)(s+2)) (or z-domain) for each choice, and the matching signal */
(function () {
  "use strict";
  var CV = window.CV, P = CV.sp, PI = Math.PI;
  function el(h) { var d = document.createElement("div"); d.innerHTML = h; return d.firstChild; }
  function slider(id, label, min, max, step, val) { return '<label class="sw-s"><span>' + label + ' <b class="ltr" data-v="' + id + '"></b></span><input type="range" data-k="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></label>'; }
  function mount(box, cfg) {
    var T = W[cfg.type]; if (!T) return;
    box.innerHTML = '<div class="sw"><div class="sw-plot"></div><div class="sw-ctl">' + T.ctl(cfg) + '</div><p class="sw-note muted small"></p></div>';
    var plot = box.querySelector(".sw-plot"), note = box.querySelector(".sw-note");
    function val() { var v = {}; box.querySelectorAll("[data-k]").forEach(function (i) { v[i.dataset.k] = i.type === "range" ? +i.value : i.value; }); return v; }
    function draw() {
      var v = val(); box.querySelectorAll("[data-v]").forEach(function (b) { b.textContent = T.fmt ? T.fmt(b.dataset.v, v[b.dataset.v]) : v[b.dataset.v]; });
      var r = T.draw(v, cfg); plot.innerHTML = r.svg; note.innerHTML = r.note || "";
    }
    box.addEventListener("input", draw); box.addEventListener("change", draw); draw();
  }
  var x5 = function (t) { return t > -1 && t < 0 ? 1 : t >= 0 && t < 2 ? 1 - 0.5 * t : 0; };
  var W = {
    transform: {
      ctl: function () { return slider("a", "α", -3, 3, 0.5, -3) + slider("b", "β", -4, 4, 0.5, -4); },
      draw: function (v) {
        var a = v.a || 0.5, b = v.b;
        if (a === 0) a = 0.5;
        var svg = P.plot({ h: 240, x: [-4, 4], y: [-0.2, 1.3], xl: "t", yl: "x(αt + β)", items: [{ ct: x5, c: 4, dash: true }, { ct: function (t) { return x5(a * t + b); }, c: 2 }] });
        var lo = (-1 - b) / a, hi = (2 - b) / a; if (lo > hi) { var s = lo; lo = hi; hi = s; }
        return { svg: svg, note: "الإشارة الأصلية متقطعة الخط، والنتيجة باللون البرتقالي. الإشارة غير صفرية على <span class='ltr'>" + (+lo.toFixed(2)) + " < t < " + (+hi.toFixed(2)) + "</span>" + (a < 0 ? "، ومعكوسة لأن α سالبة." : ".") };
      }
    },
    conv: {
      ctl: function () { return slider("n", "n", -2, 6, 1, 0); },
      draw: function (v, cfg) {
        var x = cfg.x || { 0: 1, 1: 2, 2: 1, 3: 2 }, h = cfg.h || { 0: 1, 1: 1 }, n = v.n, y = {}, terms = [];
        var ks = Object.keys(x).map(Number), hs = Object.keys(h).map(Number);
        for (var m = -4; m <= 10; m++) { var s = 0; ks.forEach(function (k) { if (h[m - k] !== undefined) s += x[k] * h[m - k]; }); y[m] = s; }
        ks.forEach(function (k) { if (h[n - k] !== undefined) terms.push(x[k] + "×" + h[n - k]); });
        var hk = function (k) { return h[n - k]; };
        var svg = P.plot({ h: 170, x: [-3, 7], y: [-0.3, 2.6], xl: "k", yl: "x[k] (أزرق)  h[n − k] (برتقالي)", items: [{ dt: function (k) { return x[k]; }, zeros: false }, { dt: function (k) { var w = hk(k); return w === undefined ? undefined : w * 0.92; }, c: 2, zeros: false }] }) +
          P.plot({ h: 170, x: [-3, 7], y: [-0.3, 4.5], xl: "n", yl: "y[n]", items: [{ dt: function (m) { return m <= n ? y[m] : undefined; }, c: 3 }, { vline: n, c: 2 }] });
        return { svg: svg, note: "عند n = " + n + ": نضرب القيم المتداخلة ونجمع: <span class='ltr'>y[" + n + "] = " + (terms.length ? terms.join(" + ") : "0") + " = " + y[n] + "</span>" };
      }
    },
    fs: {
      ctl: function (cfg) { return slider("N", "عدد التوافقيات N", 1, 41, 2, 3) + '<label class="sw-s"><span>الإشارة</span><select class="select" data-k="w"><option value="sq">موجة مربعة</option><option value="tri">مثلثية (من المحاضرة)</option><option value="saw">x(t) = t على (−1, 1)</option></select></label>'; },
      draw: function (v) {
        var N = v.N, w = v.w, T0 = 2, w0 = PI, f, s;
        if (w === "tri") { f = function (t) { var u = ((t % 2) + 2) % 2; return u <= 1 ? u : 2 - u; }; s = function (t) { var y = 0.5; for (var k = 1; k <= N; k += 1) { var c = ((k % 2 ? -1 : 1) - 1) / (PI * PI * k * k); y += 2 * c * Math.cos(k * w0 * t); } return y; }; }
        else if (w === "saw") { f = function (t) { var u = ((t + 1) % 2 + 2) % 2 - 1; return u; }; s = function (t) { var y = 0; for (var k = 1; k <= N; k++) y += 2 * (k % 2 ? 1 : -1) * Math.sin(k * w0 * t) / (k * PI); return y; }; }
        else { f = function (t) { var u = ((t % 2) + 2) % 2; return u < 0.5 || u >= 1.5 ? 1 : 0; }; s = function (t) { var y = 0.5; for (var k = 1; k <= N; k++) y += 2 * Math.sin(k * PI / 2) / (k * PI) * Math.cos(k * w0 * t); return y; }; }
        var svg = P.plot({ h: 240, x: [-2.5, 2.5], y: w === "saw" ? [-1.4, 1.4] : [-0.3, 1.3], xl: "t", yl: "x(t) و مجموع N توافقيات", items: [{ ct: f, c: 4, dash: true, n: 800 }, { ct: s, c: 2, n: 800 }] });
        return { svg: svg, note: "كلما زاد N اقترب المجموع من الإشارة. عند القفزات يبقى تجاوز صغير (ظاهرة جبس) مهما زاد N." };
      }
    },
    alias: {
      ctl: function () { return slider("r", "ω0 / ωs", 0.05, 0.95, 0.05, 0.15); },
      fmt: function (k, v) { return (+v).toFixed(2); },
      draw: function (v) {
        var ws = 2 * PI, w0 = v.r * ws, T = 1, wr = w0 < ws / 2 ? w0 : ws - w0;
        var svg = P.plot({ h: 250, x: [0, 8], y: [-1.3, 1.3], xl: "t (بوحدات T)", yl: "cos(ω0 t) والعيّنات والمسترجع", items: [{ ct: function (t) { return Math.cos(w0 * t); }, c: 4, dash: w0 >= ws / 2, n: 900 }, { dt: function (n) { return Math.cos(w0 * n * T); }, c: 1 }, { ct: function (t) { return Math.cos(wr * t); }, c: 2, n: 900 }] });
        return { svg: svg, note: w0 < ws / 2 ? "ω0 < ωs/2: لا تداخل، والمرشح يسترجع نفس الإشارة (الخط البرتقالي فوق الأصل)." : "ω0 > ωs/2: تداخل (aliasing). نفس العيّنات تعطي بعد الترشيح cos((ωs − ω0)t) بتردد أقل = " + (wr / ws).toFixed(2) + " ωs." };
      }
    },
    roc: {
      ctl: function () { return '<label class="sw-s"><span>منطقة التقارب</span><select class="select" data-k="r"><option value="R">Re{s} > −1</option><option value="M">−2 < Re{s} < −1</option><option value="L">Re{s} < −2</option></select></label>'; },
      draw: function (v) {
        var band = v.r === "R" ? [-1, 4] : v.r === "M" ? [-2, -1] : [-4, -2];
        var sig = v.r === "R" ? function (t) { return t >= 0 ? Math.exp(-t) - Math.exp(-2 * t) : 0; } : v.r === "M" ? function (t) { return t < 0 ? -Math.exp(-t) : -Math.exp(-2 * t); } : function (t) { return t < 0 ? -Math.exp(-t) + Math.exp(-2 * t) : 0; };
        var svg = P.plot({ w: 300, h: 240, x: [-4, 2], y: [-3, 3], xl: "σ", yl: "jω", grid: false, items: [{ band: band, c: 1 }, { pz: { poles: [[-1, 0], [-2, 0]] }, c: 2 }] }) +
          P.plot({ w: 360, h: 240, x: { R: [-1, 5], M: [-2, 4], L: [-1.5, 1] }[v.r], y: { R: [-0.05, 0.3], M: [-7.6, 0.4], L: [-1, 17] }[v.r], xl: "t", yl: "x(t)", items: [{ ct: sig, c: 2 }] });
        var txt = { R: "يمين القطبين: إشارة يمينية (سببية) <span class='ltr'>x = e<sup>−t</sup>u(t) − e<sup>−2t</sup>u(t)</span>.", M: "شريط بين القطبين: إشارة ثنائية الجانب <span class='ltr'>x = −e<sup>−t</sup>u(−t) − e<sup>−2t</sup>u(t)</span>.", L: "يسار القطبين: إشارة يسارية <span class='ltr'>x = −e<sup>−t</sup>u(−t) + e<sup>−2t</sup>u(−t)</span>." }[v.r];
        return { svg: svg, note: "نفس <span class='ltr'>X(s) = 1/((s+1)(s+2))</span> ولكل منطقة تقارب إشارة مختلفة. " + txt };
      }
    }
  };
  CV.sigWidgets = { mountAll: function (root) { (root || document).querySelectorAll("[data-sigw]").forEach(function (b) { try { mount(b, JSON.parse(b.dataset.sigw)); } catch (e) {} }); }, W: W };
})();
