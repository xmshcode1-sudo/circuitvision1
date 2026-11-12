/* CircuitVision — shared app shell: sidebar navigation and mobile menu.
   Pages provide the markup (#side, #nav, #scrim, #menu-btn) and call CV.shell.init(). */
(function () {
  "use strict";
  var icons = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    dashboard: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>',
    courses: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    lab: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    generator: '<path d="M4 7h4l2-3 2 6 2-3h6"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    tutor: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01"/>',
    challenges: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/>',
    bank: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    academy: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M7 10.5V16c3 2 7 2 10 0v-5.5"/>',
    realworld: '<path d="M4 12h3M17 12h3"/><rect x="7" y="9" width="10" height="6" rx="3"/><path d="M10 9v6M14 9v6"/>',
    club: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-3.5 3-5 6-5s5.5 1.5 6 5M15 15c3 0 5 1.5 5.5 4.5"/>',
    portfolio: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    notebook: '<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M10 8h5M10 12h5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
  };
  // Order follows the main navigation in the project brief.
  var order = ["home", "dashboard", "courses", "generator", "lab", "tutor", "challenges", "bank", "academy", "realworld", "club", "portfolio", "notebook"];

  function svg(id) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[id] + '</svg>'; }

  function init(opts) {
    opts = opts || {};
    var byId = {}; CV.modules.forEach(function (m) { byId[m.id] = m; });
    var html = "";
    order.forEach(function (id) {
      var m = byId[id], label = id === "club" ? "Beyond Theory" : m.ar;
      if (m.href) html += '<a class="nv' + (id === opts.active ? ' active" aria-current="page' : '') + '" href="' + m.href + '">' + svg(id) + '<span class="lbl">' + label + '</span></a>';
      else html += '<span class="nv off" aria-disabled="true" title="يُفتح في الخطوة ' + m.step + '">' + svg(id) + '<span class="lbl">' + label + '</span><span class="soon">الخطوة ' + m.step + '</span></span>';
    });
    if (opts.onSettings) html += '<button class="nv" type="button" id="open-settings">' + svg("settings") + '<span class="lbl">الإعدادات</span></button>';
    else html += '<a class="nv" href="dashboard.html#prefs">' + svg("settings") + '<span class="lbl">الإعدادات</span></a>';
    var lang = CV.bi ? CV.bi.mode() : "ar";
    html += '<div class="lang-sw no-bi" role="group" aria-label="اللغة الأولى · First language"><button type="button" data-lang="ar" aria-pressed="' + (lang === "ar") + '">العربية أولًا</button><button type="button" data-lang="en" aria-pressed="' + (lang === "en") + '" lang="en">English first</button></div>';
    html += '<button type="button" class="kb-open" id="kb-open"><kbd>?</kbd> اختصارات لوحة المفاتيح</button>';
    document.getElementById("nav").innerHTML = html;
    document.getElementById("kb-open").addEventListener("click", function () { help(byId); });
    document.querySelectorAll("#nav [data-lang]").forEach(function (b) { b.addEventListener("click", function () { if (CV.bi && b.dataset.lang !== CV.bi.mode()) CV.bi.set(b.dataset.lang); }); });
    if (opts.onSettings) document.getElementById("open-settings").addEventListener("click", opts.onSettings);

    var foot = document.getElementById("side-foot");
    if (foot) foot.remove();

    var side = document.getElementById("side"), scrim = document.getElementById("scrim"), btn = document.getElementById("menu-btn");
    function setMenu(open) { side.classList.toggle("open", open); scrim.hidden = !open; btn.setAttribute("aria-expanded", open ? "true" : "false"); }
    btn.addEventListener("click", function () { setMenu(!side.classList.contains("open")); });
    scrim.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    keys(byId);
    return { setMenu: setMenu };
  }

  /* ---------- keyboard shortcuts: "?" shows them, G then a letter moves between sections ---------- */
  var NAV = { H: "home", D: "dashboard", C: "courses", P: "generator", L: "lab", T: "tutor", E: "challenges", B: "bank", A: "academy", R: "realworld", K: "club", F: "portfolio", N: "notebook" };
  var LAB_KEYS = [["V", "تحديد"], ["W", "سلك"], ["R", "مقاومة"], ["E", "LED"], ["C", "مكثف"], ["L", "ملف"], ["B", "بطارية"], ["S", "مفتاح ضغط"], ["A", "لمبة"], ["P", "حساس حركة"], ["M", "أميتر لوحة"], ["D", "مصدر تابع"], ["X", "ممحاة"],
    ["Delete", "احذف القطعة المحددة"], ["F", "اقلب القطعة المحددة"], ["T", "اضغط المفتاح المحدد أو اتركه"], ["+ / −", "تكبير وتصغير اللوحة"], ["N", "إظهار الأسماء والقيم"], ["Esc", "ارجع لأداة التحديد"], ["⌘Z / Ctrl+Z", "تراجع عن تحميل مثال"]];
  function typing(t) { var g = t && t.tagName; return g === "INPUT" || g === "TEXTAREA" || g === "SELECT" || (t && t.isContentEditable); }
  function help(byId) {
    var box = document.getElementById("kb-help");
    if (box) { box.hidden = !box.hidden; if (!box.hidden) box.querySelector("button").focus(); return; }
    var row = function (k, v) { return '<li><kbd>' + k + '</kbd><span>' + v + '</span></li>'; };
    var nav = Object.keys(NAV).filter(function (k) { return byId[NAV[k]] && byId[NAV[k]].href; }).map(function (k) { return row("G " + k, byId[NAV[k]].ar); }).join("");
    var lab = /lab\.html/.test(location.pathname) ? '<h3>المعمل</h3><ul>' + LAB_KEYS.map(function (x) { return row(x[0], x[1]); }).join("") + '</ul>' : "";
    box = document.createElement("div"); box.id = "kb-help"; box.className = "kb-help"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "اختصارات لوحة المفاتيح");
    box.innerHTML = '<div class="kb-card card"><div class="kb-top"><h2>اختصارات لوحة المفاتيح</h2><button type="button" class="btn btn-ghost btn-sm">أغلق</button></div>' +
      '<p class="kb-note">تعمل مع كيبورد الآيباد أو الكمبيوتر، ولا تعمل وأنت تكتب داخل خانة.</p>' +
      '<h3>عام</h3><ul>' + row("?", "إظهار هذه القائمة") + row("Esc", "إغلاق القوائم") + '</ul><h3>التنقل: اضغط G ثم الحرف</h3><ul>' + nav + '</ul>' + lab + '</div>';
    document.body.appendChild(box);
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".kb-top button")) box.hidden = true; });
    box.querySelector("button").focus();
  }
  function keys(byId) {
    var g = 0;
    document.addEventListener("keydown", function (e) {
      if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      var box = document.getElementById("kb-help");
      if (e.key === "Escape" && box && !box.hidden) { box.hidden = true; return; }
      if (e.key === "?") { e.preventDefault(); help(byId); return; }
      var k = e.key.length === 1 ? e.key.toUpperCase() : "";
      if (k === "G") { g = Date.now(); e.stopImmediatePropagation(); return; }
      if (g && Date.now() - g < 1500 && NAV[k]) { var m = byId[NAV[k]]; g = 0; if (m && m.href) { e.preventDefault(); e.stopImmediatePropagation(); location.href = m.href; } return; }
      g = 0;
    }, true);
  }

  window.CV = window.CV || {};
  window.CV.shell = { init: init, icon: svg };
})();
