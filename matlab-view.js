/* CircuitVision — show a lesson's MATLAB script: sections with the Arabic explanation, the code (highlighted),
   what it prints (Command Window) and what it draws (Figure). Data: matlab-data.js (CV.matlab), built by tools/matlab/build.py. */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  var KW = /^(function|end|for|while|if|elseif|else|return|break|continue|switch|case|otherwise|try|catch)$/;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  /* MATLAB syntax colouring: comments, strings (a quote after a value is the transpose), keywords, numbers */
  function hl(code) {
    return code.split("\n").map(function (ln) {
      var out = "", i = 0, prev = "";
      while (i < ln.length) {
        var c = ln[i], rest = ln.slice(i), m;
        if (c === "%") { out += '<span class="ml-c">' + esc(rest) + "</span>"; break; }
        if (c === "'" && !/[A-Za-z0-9_)\].'}]/.test(prev)) {
          var j = i + 1; while (j < ln.length && !(ln[j] === "'" && ln[j + 1] !== "'")) j += ln[j] === "'" ? 2 : 1;
          out += '<span class="ml-s">' + esc(ln.slice(i, j + 1)) + "</span>"; prev = "'"; i = j + 1; continue;
        }
        if ((m = /^[A-Za-z_]\w*/.exec(rest))) { out += KW.test(m[0]) ? '<span class="ml-k">' + m[0] + "</span>" : esc(m[0]); prev = m[0].slice(-1); i += m[0].length; continue; }
        if ((m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?[ij]?/i.exec(rest))) { out += '<span class="ml-n">' + m[0] + "</span>"; prev = "0"; i += m[0].length; continue; }
        out += esc(c); if (c !== " ") prev = c; i++;
      }
      return out;
    }).join("\n");
  }
  var LTR = /([A-Za-z0-9%\\δωπτΩµΣ∫θφα][A-Za-z0-9 .,=+−\-–/×·()'^∠°|ωπτΩµΣ∫θφαδε²³√∥*\[\]{}<>%]*[A-Za-z0-9)\]°²³'>%δωπτΩµθφα])/g;
  function ar(lines) { return lines.map(function (l) { return "<p>" + String(l).split(LTR).map(function (x, i) { return i % 2 ? '<span class="ltr">' + esc(x) + "</span>" : esc(x); }).join("") + "</p>"; }).join(""); }
  function section(s, k) {
    return '<div class="ml-sec' + (s.project ? " ml-proj" : "") + '"><div class="ml-sh"><span class="ml-k2" dir="ltr">' + (s.project ? "مشروع" : "%% " + (k + 1)) + '</span> <b class="ltr">' + esc(s.t) + "</b></div>" +
      '<div class="ml-ar">' + ar(s.ar) + "</div>" +
      '<pre class="ml-code" dir="ltr"><code>' + hl(s.code) + "</code></pre>" +
      (s.out ? '<div class="ml-cw" dir="ltr"><span class="ml-cwh">Command Window</span><pre>' + esc(s.out) + "</pre></div>" : "") +
      (s.fig ? '<figure class="ml-fig"><img loading="lazy" src="' + s.fig + '" alt="Figure: ' + esc(s.t) + '"></figure>' : "") + "</div>";
  }
  function render(M, o) {
    o = o || {}; if (!M) return null;
    var id = M.id, vd = CV.videoDur && CV.videoDur[id];
    return '<div class="ml-box">' +
      (vd || o.video ? '<div class="ss-vid"><video controls playsinline preload="none" poster="' + id + '.jpg" src="' + id + '.mp4"></video>' + (vd ? '<span class="muted small">المدة ' + vd + "</span>" : "") + "</div>" : "") +
      '<div class="ml-head"><div><b>' + esc(M.ar) + '</b><span class="muted small ltr">' + esc(M.title) + '</span></div><a class="btn btn-ghost btn-sm" href="' + M.file + '" download>تحميل السكربت ' + id + '.m</a></div>' +
      '<p class="muted small">كل قسم يبدأ بـ %% في MATLAB: شغّله وحده بـ Ctrl+Enter (أو Run Section). المخرجات والرسوم هنا من تشغيل السكربت فعلًا' + (M.checks ? "، وفيه " + M.checks + " اختبارًا يتأكد من أرقام الدرس" : "") + '. أول مرة مع MATLAB؟ ابدأ بسلسلة <a href="matlab.html">MATLAB من الصفر</a>.</p>' +
      M.sections.map(section).join("") + "</div>";
  }
  /* fetch one script's data (matlab/data/<id>.json) and render it into el */
  function load(id, el, o) {
    el.innerHTML = '<p class="muted">جاري تحميل السكربت…</p>';
    return fetch("matlab/data/" + id + ".json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (M) { el.innerHTML = render(M, o); return M; })
      .catch(function () { el.innerHTML = '<p class="muted">تعذّر تحميل السكربت. حدّث الصفحة.</p>'; });
  }
  CV.mlView = { hl: hl, render: render, load: load, esc: esc, ar: ar };
})();
