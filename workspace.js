/* CircuitVision — solution workspace ("مساحة الحل").
   Three ways to write a solution:
     • Pen / finger on a canvas (Apple Pencil pressure; once a pen is used, finger touches scroll instead of drawing)
     • Keyboard, with typing helpers (^2 → ², _1 → ₁, ohm → Ω, || → ∥) and a symbol palette
     • Photo of a paper notebook (opens the phone camera)
   Handwriting and photos are transcribed by /api/recognize (Gemini, key kept on the server).
   The transcription lands in the keyboard tab for the student to review; the arithmetic in every
   line is then checked by mathcheck.js, and the final value can be sent to the answer box. */
(function () {
  "use strict";
  var API = (window.CV_API_BASE || "") + "/api/recognize";
  var SYMBOLS = ["Ω", "µ", "²", "√", "π", "∥", "×", "÷", "≈", "→", "Δ", "ₓ", "₁", "₂", "₃", "∠", "°"];
  var INK = { ink: "--fg", blue: "--glow", orange: "--orange" };

  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
  function load(key) { try { return JSON.parse(localStorage.getItem("cv.ws." + key) || "null") || {}; } catch (e) { return {}; } }
  function save(key, data) { try { localStorage.setItem("cv.ws." + key, JSON.stringify(data)); return true; } catch (e) { return false; } }
  var icon = function (p) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var I = {
    pen: icon('<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M14 6l3 3"/>'),
    kb: icon('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
    cam: icon('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
    eraser: icon('<path d="M16 3l5 5-11 11H5l-2-2z"/><path d="M9 21h12"/>'),
    undo: icon('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>')
  };

  function mount(root, opts) {
    opts = opts || {};
    var key = opts.key, data = load(key);
    data.strokes = data.strokes || []; data.text = data.text || "";
    var uid = "ws" + Math.random().toString(36).slice(2, 7);

    root.classList.add("ws");
    root.innerHTML =
      '<button type="button" class="btn btn-ghost btn-sm ws-toggle" aria-expanded="false">' + I.pen + ' مساحة الحل: اكتب أو صوّر حلّك</button>' +
      '<div class="ws-panel" hidden>' +
        '<div class="ws-tabs" role="tablist">' +
          '<button type="button" role="tab" class="ws-tab" data-t="draw" aria-selected="true">' + I.pen + ' قلم أو إصبع</button>' +
          '<button type="button" role="tab" class="ws-tab" data-t="type" aria-selected="false">' + I.kb + ' كيبورد</button>' +
          '<button type="button" role="tab" class="ws-tab" data-t="photo" aria-selected="false">' + I.cam + ' صورة من الدفتر</button>' +
        '</div>' +
        // Draw
        '<div class="ws-pane" data-p="draw">' +
          '<div class="ws-tools">' +
            '<div class="ws-group"><button type="button" class="ws-tool on" data-tool="pen" aria-label="قلم" title="قلم">' + I.pen + '</button><button type="button" class="ws-tool" data-tool="eraser" aria-label="ممحاة" title="ممحاة">' + I.eraser + '</button></div>' +
            '<div class="ws-group">' + Object.keys(INK).map(function (c, i) { return '<button type="button" class="ws-color' + (i === 0 ? " on" : "") + '" data-c="' + c + '" aria-label="لون ' + (i + 1) + '" style="--sw: var(' + INK[c] + ')"></button>'; }).join("") + '</div>' +
            '<div class="ws-group"><button type="button" class="ws-tool" data-act="undo" aria-label="تراجع" title="تراجع">' + I.undo + '</button><button type="button" class="btn btn-ghost btn-sm" data-act="more">مساحة أكبر</button><button type="button" class="btn btn-ghost btn-sm" data-act="clear">مسح</button></div>' +
          '</div>' +
          '<div class="ws-canvas-wrap"><canvas class="ws-canvas" aria-label="لوحة الكتابة بالقلم أو الإصبع"></canvas></div>' +
          '<p class="ws-note">مع القلم (مثل Apple Pencil) يمكنك إسناد يدك على الشاشة: بعد أول لمسة بالقلم تصبح لمسات الإصبع للتمرير فقط.</p>' +
          '<div class="pb-actions"><button type="button" class="btn btn-primary btn-sm" data-act="recog-draw">تعرّف على الكتابة</button></div>' +
        '</div>' +
        // Type
        '<div class="ws-pane" data-p="type" hidden>' +
          '<div class="ws-syms" aria-label="رموز">' + SYMBOLS.map(function (s) { return '<button type="button" class="ws-sym" data-s="' + s + '">' + s + '</button>'; }).join("") + '</div>' +
          '<label class="ws-label" for="' + uid + '-txt">اكتب كل خطوة في سطر. اختصارات: <span class="ltr">^2 → ²</span> ، <span class="ltr">_1 → ₁</span> ، <span class="ltr">ohm → Ω</span> ، <span class="ltr">|| → ∥</span></label>' +
          '<textarea class="input ws-text" id="' + uid + '-txt" dir="ltr" rows="7" spellcheck="false" placeholder="i₁ = 30 / (5 + 10) = 2 A"></textarea>' +
          '<div class="pb-actions"><button type="button" class="btn btn-primary btn-sm" data-act="check">دقّق الحساب</button><button type="button" class="btn btn-ghost btn-sm" data-act="use">استخدم الناتج الأخير كإجابة</button></div>' +
          '<div class="ws-check" aria-live="polite"></div>' +
        '</div>' +
        // Photo
        '<div class="ws-pane" data-p="photo" hidden>' +
          '<label class="ws-drop" for="' + uid + '-file"><input type="file" id="' + uid + '-file" accept="image/*" capture="environment"><span>' + I.cam + ' صوّر صفحة الحل من دفترك أو اختر صورة</span><span class="ws-note">صوّر الصفحة من الأعلى بإضاءة جيدة.</span></label>' +
          '<img class="ws-preview" alt="صورة الحل" hidden>' +
          '<div class="pb-actions"><button type="button" class="btn btn-primary btn-sm" data-act="recog-photo" disabled>تعرّف على المكتوب</button></div>' +
        '</div>' +
        '<div class="ws-status" aria-live="polite" hidden></div>' +
      '</div>';

    var $ = function (s) { return root.querySelector(s); };
    var panel = $(".ws-panel"), canvas = $(".ws-canvas"), ctx = canvas.getContext("2d"), txt = $(".ws-text");
    var tool = "pen", color = "ink", height = data.h || 360, penSeen = false, photoData = null;
    txt.value = data.text;

    /* ---------- toggle & tabs ---------- */
    $(".ws-toggle").addEventListener("click", function () {
      var open = panel.hidden; panel.hidden = !open; this.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { sizeCanvas(); }
    });
    function showTab(t) {
      root.querySelectorAll(".ws-tab").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.t === t ? "true" : "false"); });
      root.querySelectorAll(".ws-pane").forEach(function (p) { p.hidden = p.dataset.p !== t; });
      if (t === "draw") sizeCanvas();
    }
    root.querySelectorAll(".ws-tab").forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.t); }); });

    /* ---------- canvas ---------- */
    function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888"; }
    function sizeCanvas() {
      var w = canvas.parentElement.clientWidth; if (!w) return;
      var dpr = window.devicePixelRatio || 1;
      canvas.style.height = height + "px"; canvas.width = Math.round(w * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw();
    }
    function strokePath(c, s, inkFor) {
      var pts = s.p; if (!pts.length) return;
      c.save();
      c.globalCompositeOperation = s.e ? "destination-out" : "source-over";
      c.strokeStyle = s.e ? "#000" : inkFor(s.c); c.lineCap = "round"; c.lineJoin = "round";
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        c.lineWidth = s.e ? 22 : 1.2 + 2.8 * ((a[2] + b[2]) / 2);
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      }
      if (pts.length === 1) { c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(pts[0][0], pts[0][1], s.e ? 11 : 1.8, 0, 7); c.fill(); }
      c.restore();
    }
    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      data.strokes.forEach(function (s) { strokePath(ctx, s, function (c) { return css(INK[c] || "--fg"); }); });
    }
    var cur = null;
    function pos(e) { var r = canvas.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10, e.pointerType === "pen" ? (e.pressure || 0.5) : 0.5]; }
    canvas.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "pen" && !penSeen) { penSeen = true; canvas.style.touchAction = "pan-y"; }
      if (penSeen && e.pointerType === "touch") return; // palm rejection: fingers scroll once a pen is in use
      e.preventDefault(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      if (e.pointerType === "pen") penDown = true;
      cur = { c: color, e: tool === "eraser", p: [pos(e)] }; data.strokes.push(cur); redraw();
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!cur) return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach(function (ev) { cur.p.push(pos(ev)); });
      redraw();
    });
    var penDown = false;
    function end(e) { if (e && e.pointerType === "pen") penDown = false; if (cur) { cur = null; persist(); } }
    canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);
    /* iPad: touch-action alone does not stop Safari from scrolling while the Apple Pencil writes (after a pen is seen
       the canvas allows pan-y so fingers can scroll). Cancelling the stylus touches themselves keeps the page still,
       and fingers stay free to scroll. Before any pen is seen, a finger draws, so its touches are cancelled too. */
    function stopScroll(e) {
      var ts = e.changedTouches || [], stylus = false;
      for (var i = 0; i < ts.length; i++) if (ts[i].touchType === "stylus") stylus = true;
      if (stylus || penDown || !penSeen) e.preventDefault();
    }
    canvas.addEventListener("touchstart", stopScroll, { passive: false });
    canvas.addEventListener("touchmove", stopScroll, { passive: false });
    window.addEventListener("resize", function () { if (!panel.hidden) sizeCanvas(); });

    root.querySelectorAll("[data-tool]").forEach(function (b) { b.addEventListener("click", function () { tool = b.dataset.tool; root.querySelectorAll("[data-tool]").forEach(function (x) { x.classList.toggle("on", x === b); }); }); });
    root.querySelectorAll(".ws-color").forEach(function (b) { b.addEventListener("click", function () { color = b.dataset.c; tool = "pen"; root.querySelectorAll(".ws-color").forEach(function (x) { x.classList.toggle("on", x === b); }); root.querySelectorAll("[data-tool]").forEach(function (x) { x.classList.toggle("on", x.dataset.tool === "pen"); }); }); });
    root.querySelector('[data-act="undo"]').addEventListener("click", function () { data.strokes.pop(); redraw(); persist(); });
    root.querySelector('[data-act="more"]').addEventListener("click", function () { height += 240; data.h = height; sizeCanvas(); persist(); });
    var clearBtn = root.querySelector('[data-act="clear"]'), armed = false;
    clearBtn.addEventListener("click", function () {
      if (!armed) { armed = true; clearBtn.textContent = "اضغط مرة ثانية للمسح"; setTimeout(function () { armed = false; clearBtn.textContent = "مسح"; }, 2500); return; }
      armed = false; clearBtn.textContent = "مسح"; data.strokes = []; redraw(); persist();
    });

    function persist() {
      // keep storage small: round points, cap total
      var ok = save(key, { strokes: data.strokes.slice(-600), text: data.text, h: data.h });
      if (!ok) status("لم يتسع التخزين لحفظ الرسم في هذا المتصفح. الكتابة تبقى ظاهرة حتى تغلق الصفحة.", "warn");
    }

    /* ---------- keyboard ---------- */
    txt.addEventListener("input", function () {
      var pos0 = txt.selectionStart, before = txt.value, after = CV.mathcheck.prettify(before);
      if (after !== before) { var diff = before.length - after.length; txt.value = after; txt.selectionStart = txt.selectionEnd = Math.max(0, pos0 - diff); }
      data.text = txt.value; persist();
    });
    root.querySelectorAll(".ws-sym").forEach(function (b) { b.addEventListener("click", function () {
      var s = txt.selectionStart, e = txt.selectionEnd; txt.value = txt.value.slice(0, s) + b.dataset.s + txt.value.slice(e);
      txt.selectionStart = txt.selectionEnd = s + b.dataset.s.length; txt.focus(); data.text = txt.value; persist();
    }); });
    root.querySelector('[data-act="check"]').addEventListener("click", function () { renderCheck(); });
    root.querySelector('[data-act="use"]').addEventListener("click", function () {
      var v = CV.mathcheck.lastValue(txt.value);
      if (!v) { status("لم أجد رقمًا في آخر سطر. اكتب الناتج في آخر سطر مثل: i = 2 A", "warn"); return; }
      if (opts.onAnswer && opts.onAnswer(v)) status("وضعت " + CV.num(v.value) + " (بالوحدة الأساسية) في خانة الإجابة. اضغط «تحقق».", "ok");
      else status("لا توجد خطوة مفتوحة الآن لوضع الإجابة فيها.", "warn");
    });
    function renderCheck() {
      var res = CV.mathcheck.checkLines(txt.value), box = $(".ws-check");
      if (!res.length) { box.innerHTML = "<p class='ws-note'>اكتب حلّك أولًا.</p>"; return; }
      var errs = res.filter(function (r) { return r.status === "err"; }).length, oks = res.filter(function (r) { return r.status === "ok"; }).length;
      box.innerHTML = "<ul class='ws-lines'>" + res.map(function (r) {
        var t = r.text.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
        if (r.status === "err") return "<li class='bad'><span class='ln'>" + r.n + "</span><span class='ltr lt'>" + t + "</span><span class='why'>خطأ حسابي: <span class='ltr'>" + r.left.replace(/</g, "&lt;") + "</span> يساوي <span class='ltr'>" + CV.num(r.expected) + "</span> بالوحدات الأساسية، وليس <span class='ltr'>" + r.right.replace(/</g, "&lt;") + "</span>.</span></li>";
        if (r.status === "ok") return "<li class='good'><span class='ln'>" + r.n + "</span><span class='ltr lt'>" + t + "</span><span class='why'>الحساب صحيح ✓</span></li>";
        return "<li class='skip'><span class='ln'>" + r.n + "</span><span class='ltr lt'>" + t + "</span><span class='why'>فيه رموز، لا يوجد حساب عددي أدققه</span></li>";
      }).join("") + "</ul><p class='ws-note'>" + (errs ? "وجدت " + errs + " خطأ حسابي." : oks ? "كل الحسابات العددية صحيحة." : "") + " أدقق العمليات الحسابية فقط. صحة الطريقة يحكم عليها تصحيح الإجابة.</p>";
      if (errs && CV.store) CV.store.recordAttempt(opts.lessonId || "workspace", "ws-" + key, false, "math");
    }

    /* ---------- photo ---------- */
    var fileIn = root.querySelector('input[type="file"]');
    fileIn.addEventListener("change", function () {
      var f = fileIn.files && fileIn.files[0]; if (!f) return;
      downscale(f, 1600).then(function (url) { photoData = url; var img = $(".ws-preview"); img.src = url; img.hidden = false; root.querySelector('[data-act="recog-photo"]').disabled = false; })
        .catch(function () { status("تعذّر فتح الصورة. جرّب صورة JPG أو PNG.", "warn"); });
    });
    function downscale(file, max) {
      return new Promise(function (res, rej) {
        var url = URL.createObjectURL(file), img = new Image();
        img.onload = function () {
          var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = rej; img.src = url;
      });
    }

    /* ---------- recognition ---------- */
    function exportDrawing() {
      if (!data.strokes.length) return null;
      var w = canvas.clientWidth, h = height, c = document.createElement("canvas"); c.width = w * 2; c.height = h * 2;
      var x = c.getContext("2d"); x.setTransform(2, 0, 0, 2, 0, 0);
      x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
      var layer = document.createElement("canvas"); layer.width = w * 2; layer.height = h * 2; var lx = layer.getContext("2d"); lx.setTransform(2, 0, 0, 2, 0, 0);
      var map = { ink: "#111", blue: "#1f63e6", orange: "#d9600f" };
      data.strokes.forEach(function (s) { strokePath(lx, s, function (k) { return map[k] || "#111"; }); });
      x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(layer, 0, 0);
      return c.toDataURL("image/jpeg", 0.9);
    }
    root.querySelector('[data-act="recog-draw"]').addEventListener("click", function () { var d = exportDrawing(); if (!d) { status("اكتب حلّك على اللوحة أولًا.", "warn"); return; } recognize(d); });
    root.querySelector('[data-act="recog-photo"]').addEventListener("click", function () { if (photoData) recognize(photoData); });

    function recognize(dataUrl) {
      var m = /^data:(image\/[a-z]+);base64,(.*)$/.exec(dataUrl);
      status("جارٍ التعرف على المكتوب…", "busy");
      var ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 40000);
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mime: m[1], image: m[2], context: opts.context || "" }), signal: ctrl && ctrl.signal })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { r: r, j: j }; }); })
        .then(function (o) {
          clearTimeout(timer);
          if (!o.r.ok) { status(o.j.error || messageFor(o.r.status), "warn"); return; }
          var lines = (o.j.lines || []).filter(function (l) { return String(l).trim(); });
          if (!lines.length || o.j.unreadable) { status("لم أستطع قراءة الكتابة بوضوح. اكتب بخط أكبر أو صوّر بإضاءة أفضل.", "warn"); return; }
          txt.value = (txt.value.trim() ? txt.value.trim() + "\n" : "") + lines.map(CV.mathcheck.prettify).join("\n");
          data.text = txt.value; persist(); showTab("type"); renderCheck();
          status("نقلت ما كتبته إلى تبويب الكيبورد. راجعه وعدّل أي حرف قُرئ خطأ، ثم استخدم الناتج كإجابة.", "ok");
        })
        .catch(function (err) { clearTimeout(timer); status(err && err.name === "AbortError" ? "استغرق التعرف وقتًا طويلًا. حاول مرة أخرى." : messageFor(0), "warn"); });
    }
    function messageFor(code) {
      if (code === 429) return "وصلت خدمة التعرف لحدها المجاني مؤقتًا. حاول بعد دقيقة.";
      if (code === 413) return "الصورة كبيرة جدًا. صوّر جزءًا أصغر من الصفحة.";
      return "خدمة التعرف على الكتابة غير متاحة هنا. تعمل بعد نشر الموقع على Vercel مع مفتاح Gemini. يمكنك الآن كتابة حلّك في تبويب الكيبورد ليُدقَّق حسابه.";
    }
    function status(msg, kind) { var s = $(".ws-status"); s.hidden = false; s.className = "ws-status ws-" + kind; s.textContent = msg; }

    return { open: function () { if (panel.hidden) $(".ws-toggle").click(); }, showTab: showTab };
  }

  window.CV = window.CV || {};
  /* Put a value (SI) into an answer input + unit select, using the unit the student wrote when it is listed. */
  function fillAnswer(input, select, v) {
    if (!input || !select || input.disabled) return false;
    var idx = -1, f = 1;
    Array.prototype.forEach.call(select.options, function (o, i) { if (o.textContent.trim() === v.unit) idx = i; });
    if (idx === -1) Array.prototype.forEach.call(select.options, function (o, i) { if (idx === -1 && /^(A|V|W|Ω|S|\(بدون وحدة\))$/.test(o.textContent.trim())) idx = i; });
    if (idx === -1) idx = 0;
    select.selectedIndex = idx;
    var lbl = select.options[idx].textContent.trim(), pre = lbl.length > 1 && /^[pnµmkMG]/.test(lbl) ? lbl[0] : "";
    f = { p: 1e-12, n: 1e-9, "µ": 1e-6, m: 1e-3, k: 1e3, M: 1e6, G: 1e9 }[pre] || 1;
    input.value = Number((v.value / f).toPrecision(6)).toString();
    input.focus();
    return true;
  }
  window.CV.workspace = { mount: mount, fillAnswer: fillAnswer };
})();
