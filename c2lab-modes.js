/* CircuitVision — Circuits 2 lab: practical exam and troubleshooting practice (lab2.html#exam, #exam-<exp>, #fault, #fault-<exp>).
   Same idea as the Circuits 1 lab (clab-modes.js), on the Circuits 2 manual (c2lab.js):
   - exam: a random circuit of the manual, a timer, no «show solution». Wiring and instrument settings are checked on the bench
     (clab-check.js), and the readings are graded against the experiment's own model (the same values its tables are checked with).
   - fault: the circuit is on the bench with one hidden fault (a block open inside, shorted inside, or not its labelled value),
     computed by the bench simulator (clab-sim.js). Nothing here is invented: every number comes from the manual's model or the simulator. */
(function () {
  "use strict";
  var CV = window.CV, S = CV.clabSim, K = CV.clabCheck, EXP = CV.c2lab.list;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bd(s) { return String(s).split(/(<[^>]*>)/).map(function (part) { return part.charAt(0) === "<" ? part : part.replace(/(\(?[−-]?[A-Za-z0-9τ][A-Za-z0-9τ .,=+−\-–/×·()′'∥ΩµθπωΔ²√₀₁₂]*[A-Za-z0-9τ)Ω²′'₀₁₂])/g, '<span class="ltr">$1</span>'); }).join(""); }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function num(s) { s = String(s == null ? "" : s).trim().replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace("٫", ".").replace(",", ".").replace("−", "-"); if (s === "") return NaN; return Number(s); }
  function close(x, v, tol, abs) { return Math.abs(x - v) <= Math.max(tol * Math.abs(v), abs == null ? 0.01 : abs); }
  function fmt(v) { if (typeof v !== "number") return String(v); if (v === 0) return "0"; var a = Math.abs(v); return String(a >= 1e5 ? Math.round(v) : +v.toPrecision(a >= 1000 ? 5 : 4)); }
  var si = S.si, bench = null, timer = 0, UI = null;
  var BACK = '<nav class="lg-tabs"><a href="#">← معمل الدوائر 2</a></nav>';
  function byId(id) { return EXP.filter(function (x) { return x.id === id; })[0]; }
  function procOf(e, id) { return e.procs.filter(function (x) { return x.id === id; })[0]; }
  function figFor(e, p) { var k = e.procs.indexOf(p); for (var i = k; i >= 0; i--) if (e.procs[i].fig) return e.procs[i]; return null; }
  function used(L, k) { return (L.leads || []).some(function (l) { return l.some(function (q) { return q.indexOf(k + ".") === 0; }); }); }

  /* what the student must set, written from the layout of the manual's circuit */
  function settingsText(e, L) {
    var st = L.set || {}, out = [];
    if (st.ps && st.ps.on) out.push("المصدر المستمر: MASTER على " + st.ps.m.v + " V.");
    if (st.va && st.va.on) out.push("الـ Variac على " + st.va.v + " V (RMS).");
    if (st.fg && st.fg.on) out.push("المولّد: موجة " + (st.fg.w === "sq" ? "مربعة" : "جيبية") + " بتردد " + si(st.fg.f, "Hz") + "، و" + (st.fgTerm ? "الجهد على طرفيه " + (+st.fgTerm.toPrecision(3)) + " Vpp وهو موصول بالدائرة" : "السعة " + st.fg.vpp + " Vpp" + (st.fg.off ? " والإزاحة " + st.fg.off + " V" : "")) + ".");
    if (st.tp && st.tp.on) out.push("شغّل المصدر ثلاثي الطور.");
    if (st.rb && used(L, "rb")) out.push("صندوق المقاومات على " + si(S.rbValue({ rb: st.rb }), "Ω") + ".");
    if (st.lb && used(L, "lb")) out.push("صندوق المحاثة على " + si(S.lbValue({ lb: st.lb }), "H") + ".");
    if (st.cb && used(L, "cb")) out.push("صندوق المكثفات على " + si(S.cbValue({ cb: st.cb }), "F") + ".");
    return out;
  }
  function settingsCheck(L, I, msgs) {
    var want = L.set || {}, ok = 0, n = 0;
    if (want.ps && want.ps.on) { n++; if (I.ps.on && Math.abs(I.ps.m.v - want.ps.m.v) <= 0.15) ok++; else msgs.push("✗ المصدر المستمر: المطلوب " + want.ps.m.v + " V، وعندك " + (I.ps.on ? I.ps.m.v + " V" : "مطفي") + "."); }
    if (want.va && want.va.on) { n++; if (I.va && I.va.on && Math.abs(I.va.v - want.va.v) <= 0.15) ok++; else msgs.push("✗ الـ Variac: المطلوب " + want.va.v + " V، وعندك " + (I.va && I.va.on ? I.va.v + " V" : "مطفي") + "."); }
    if (want.fg && want.fg.on) { n++; if (I.fg.on && I.fg.w === want.fg.w && Math.abs(I.fg.f - want.fg.f) <= 0.03 * want.fg.f) ok++; else msgs.push("✗ المولّد: المطلوب موجة " + (want.fg.w === "sq" ? "مربعة" : "جيبية") + " بتردد " + si(want.fg.f, "Hz") + "، وعندك " + (I.fg.on ? si(I.fg.f, "Hz") : "مطفي") + "."); }
    if (want.tp && want.tp.on) { n++; if (I.tp && I.tp.on) ok++; else msgs.push("✗ المصدر ثلاثي الطور مطفي."); }
    ["rb", "lb", "cb"].forEach(function (k) {
      if (!want[k] || !used(L, k)) return; n++;
      var f = k === "rb" ? S.rbValue : k === "lb" ? S.lbValue : S.cbValue, a = f(I), b = f({ rb: want.rb, lb: want.lb, cb: want.cb });
      if (Math.abs(a - b) <= 0.005 * b) ok++; else msgs.push("✗ " + { rb: "صندوق المقاومات", lb: "صندوق المحاثة", cb: "صندوق المكثفات" }[k] + ": المطلوب " + si(b, k === "rb" ? "Ω" : k === "lb" ? "H" : "F") + "، وعندك " + si(a, k === "rb" ? "Ω" : k === "lb" ? "H" : "F") + ".");
    });
    return n ? ok / n : 1;
  }
  function mountBench(host, key, e, state, fullEl) {
    try { if (state === "fresh") localStorage.removeItem("cv-clab2-" + key); else if (state) localStorage.setItem("cv-clab2-" + key, JSON.stringify(state)); } catch (x) {}
    if (bench) bench.destroy();
    bench = CV.clabBench.mount(host, Object.assign({ key: key, inst: e.inst, kit: e.kit, fullEl: fullEl }, CV.clabFree ? CV.clabFree.benchOpts(e) : {}));
    if (CV.clabFree) CV.clabFree.meterBar(host, bench);
    if (state === "fresh" && e.inst.indexOf("rb") > -1 && bench.state().inst.rb.d.length !== 5) bench.set({ rb: { d: [0, 0, 0, 0, 0] } });
    return bench;
  }
  function leave() { if (bench) { bench.destroy(); bench = null; } clearInterval(timer); timer = 0; }

  /* ======================= practical exam ======================= */
  var EXAM = "cv-c2lab-exam", EXAM_LOG = "cv-c2lab-exam-log";
  function examTable(p) { return (p.tables || []).filter(function (T) { return T.cols.some(function (c) { return c.src === "meas" || c.src === "choice"; }); })[0]; }
  function examPool(only) {
    var pool = [];
    EXP.forEach(function (e) {
      if (only && e.id !== only) return;
      e.procs.forEach(function (p) { if ((p.layouts || []).length === 1 && p.inst && examTable(p) && figFor(e, p)) pool.push([e.id, p.id, p.layouts[0].id]); });
    });
    return pool;
  }
  function showExam(root, only) {
    var cur = ls(EXAM);
    if (!cur || cur.done || (only && cur.only !== only) || (!only && cur.only)) {
      var pool = examPool(only); if (!pool.length) { root.innerHTML = BACK + '<p>لا توجد دائرة مناسبة للاختبار في هذه التجربة.</p>'; return; }
      cur = { only: only || "", pick: pick(pool), start: Date.now(), mins: +(ls("cv-c2lab-exam-mins") || 20), answers: {}, done: false, fresh: true };
      ls(EXAM, cur);
    }
    var e = byId(cur.pick[0]), p = procOf(e, cur.pick[1]), L = p.layouts[0], T = examTable(p), fp = figFor(e, p);
    var rows = T.rows.slice(0, 5), cols = T.cols.filter(function (c) { return c.src === "meas" || c.src === "choice"; }), rcol = T.cols.filter(function (c) { return c.src === "row"; })[0];
    document.title = "اختبار عملي — معمل الدوائر 2 — CircuitVision";
    root.innerHTML = BACK +
      '<div class="lg-head"><span class="code">EE 2020 · Electric Circuits II Lab · Practical exam</span><h1>اختبار عملي</h1><span class="lg-ar">التجربة ' + e.n + ': ' + esc(e.title) + '</span></div>' +
      '<section class="card lg-sec md-bar"><div class="md-timer" id="md-timer" aria-live="off"></div><p class="muted small">ركّب الدائرة على الطاولة واضبط الأجهزة، ثم خذ القراءات من الأجهزة واكتبها، واضغط «سلّم». ما فيه «اعرض الحل» ولا تحقق قبل التسليم.</p></section>' +
      '<section class="card lg-sec"><h2>المهمة</h2><b>' + bd(esc(p.title)) + '</b>' +
      '<div class="cl-fig md-fig">' + CV.draw.render(fp.fig, { aria: "مخطط " + fp.title }) + '</div>' +
      '<ul>' + settingsText(e, L).map(function (t) { return "<li>" + bd(esc(t)) + "</li>"; }).join("") + '<li>وصّل الأجهزة اللي تحتاجها في مكانها الصحيح.</li></ul>' +
      '<h3 class="c2-h3">الأجهزة</h3><div class="md-inst">' + UI.instView(p) + '</div>' +
      '<h3 class="c2-h3">' + bd(esc(T.title)) + '</h3>' +
      '<div class="lg-tw"><table class="lg-t cl-t md-t"><tr>' + (rcol ? '<th>' + bd(esc(rcol.h)) + '</th>' : '<th></th>') + cols.map(function (c) { return '<th>' + bd(esc(c.h)) + '</th>'; }).join("") + '</tr>' +
      rows.map(function (r, i) {
        var m = T.model(r), lab = rcol ? (typeof m[rcol.k] === "number" ? fmt(m[rcol.k]) : m[rcol.k] === undefined ? r : m[rcol.k]) : r;
        return '<tr><td class="l ltr">' + esc(lab) + '</td>' + cols.map(function (c) {
          var id = i + ":" + c.k;
          if (c.src === "choice") return '<td><select class="select" data-ex="' + id + '"><option value=""></option>' + c.opts.map(function (o) { return '<option>' + esc(o) + '</option>'; }).join("") + '</select></td>';
          return '<td><input class="input ltr" inputmode="decimal" data-ex="' + id + '" aria-label="' + esc(c.h) + '"></td>';
        }).join("") + '</tr>';
      }).join("") + '</table></div>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-submit">سلّم</button><button type="button" class="btn btn-ghost" id="md-new">دائرة ثانية</button></div><div class="lg-res" id="md-res" aria-live="polite"></div></section>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2><div id="cl-bench"></div></section>';
    UI.wireInst(p, $(".md-inst .c2-inst", root) || $(".md-inst", root));
    mountBench($("#cl-bench", root), "c2-exam", e, cur.fresh ? "fresh" : null, $("#bench", root));
    if (cur.fresh) { cur.fresh = false; ls(EXAM, cur); }
    root.querySelectorAll("[data-ex]").forEach(function (inp) {
      if (cur.answers[inp.dataset.ex] !== undefined) inp.value = cur.answers[inp.dataset.ex];
      inp.addEventListener("input", function () { cur.answers[inp.dataset.ex] = inp.value; ls(EXAM, cur); });
      inp.addEventListener("change", function () { cur.answers[inp.dataset.ex] = inp.value; ls(EXAM, cur); });
    });
    function tick() {
      var left = cur.start + cur.mins * 60000 - Date.now(), el = $("#md-timer"); if (!el) return;
      if (left <= 0) { el.textContent = "انتهى الوقت"; clearInterval(timer); submit(true); return; }
      var m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
      el.innerHTML = '<span>الوقت المتبقي</span><b class="ltr">' + m + ":" + (s < 10 ? "0" : "") + s + '</b>';
      el.classList.toggle("low", left < 120000);
    }
    function submit(auto) {
      if (cur.done && !auto) return;
      clearInterval(timer);
      var st = bench.state(), msgs = [], score = { w: 0, s: 0, r: 0 };
      var circOk = K.iso(K.core(K.stateFor(L, {}, false), e.inst), K.core(st, e.inst));
      var rep = K.wiringReport(e, L, st);
      score.w = circOk ? 40 : 0;
      msgs.push(circOk ? "✓ الدائرة مركّبة صح." : "✗ الدائرة ما تطابق الرسمة:" + '<ul class="cl-fix">' + rep.msgs.filter(function (m) { return m.lvl === "bad"; }).map(function (m) { return "<li>" + m.t + "</li>"; }).join("") + "</ul>");
      score.s = Math.round(20 * settingsCheck(L, st.inst, msgs));
      var rOk = 0, rN = 0, tbl = [];
      rows.forEach(function (r, i) {
        var m = T.model(r), lab = rcol ? (typeof m[rcol.k] === "number" ? fmt(m[rcol.k]) : m[rcol.k] === undefined ? r : m[rcol.k]) : r;
        cols.forEach(function (c) {
          rN++; var id = i + ":" + c.k, a = cur.answers[id], v = m[c.k], ok;
          if (c.src === "choice") ok = a === v;
          else { var x = num(a); ok = isFinite(x) && (T.angAbs && c.k === "a" ? Math.abs(x - v) <= T.angAbs : close(x, v, T.tol || 0.02)); }
          if (ok) rOk++;
          var inp = $('[data-ex="' + id + '"]', root); if (inp) { inp.classList.remove("good", "bad"); inp.classList.add(ok ? "good" : "bad"); }
          tbl.push('<tr><td class="l">' + bd(esc(lab + " · " + c.h)) + '</td><td class="ltr">' + (a === undefined || a === "" ? "—" : esc(a)) + '</td><td class="ltr">' + esc(fmt(v)) + '</td><td>' + (ok ? "✓" : "✗") + "</td></tr>");
        });
      });
      score.r = rN ? Math.round(40 * rOk / rN) : 40;
      var total = score.w + score.s + score.r;
      cur.done = true; cur.score = total; ls(EXAM, cur);
      var log = ls(EXAM_LOG) || []; log.unshift({ e: e.id, p: p.id, score: total, at: Date.now() }); ls(EXAM_LOG, log.slice(0, 30));
      var res = $("#md-res"); res.className = "lg-res " + (total >= 60 ? "ok" : "bad");
      res.innerHTML = '<div class="md-score"><b class="ltr">' + total + ' / 100</b>' + (auto ? '<span>(انتهى الوقت وسُلّم تلقائيًا)</span>' : "") + '</div>' +
        '<ul class="md-break"><li>التوصيل: <b class="ltr">' + score.w + '/40</b></li><li>ضبط الأجهزة: <b class="ltr">' + score.s + '/20</b></li><li>القراءات: <b class="ltr">' + score.r + '/40</b> (' + rOk + " من " + rN + ')</li></ul>' +
        msgs.map(function (m) { return "<div>" + m + "</div>"; }).join("") +
        '<div class="lg-tw"><table class="lg-t md-t"><tr><th></th><th>قراءتك</th><th>قراءة الأجهزة</th><th></th></tr>' + tbl.join("") + "</table></div>";
      $("#md-submit").disabled = true;
    }
    $("#md-submit").addEventListener("click", function () { submit(false); });
    $("#md-new").addEventListener("click", function () { var c = ls(EXAM); if (c) { c.done = true; ls(EXAM, c); } leave(); showExam(root, only); window.scrollTo(0, 0); });
    if (cur.done) { $("#md-submit").disabled = true; $("#md-res").className = "lg-res"; $("#md-res").textContent = "سلّمت هذا الاختبار ودرجتك " + cur.score + " / 100. اضغط «دائرة ثانية» لاختبار جديد."; }
    else { clearInterval(timer); timer = setInterval(tick, 1000); tick(); }
  }

  /* ======================= troubleshooting practice ======================= */
  var FAULT = "cv-c2lab-fault", FAULT_LOG = "cv-c2lab-fault-log";
  var KIND = { value: "قيمتها غير المكتوب عليها", open: "مفتوحة من الداخل", short: "مقصورة من الداخل" };
  function partsOf(L) { return Object.keys(L.parts || {}).filter(function (s) { var t = L.parts[s].t; return (t === "R" || t === "L" || t === "C") && L.parts[s].lb; }); }
  function srcOn(L) { var s = L.set || {}; return (s.ps && s.ps.on) || (s.va && s.va.on) || (s.fg && s.fg.on && s.fg.w === "sin"); }
  function vAcross(e, st) {
    var sol = S.solve(st, { only: e.inst }), out = {};
    Object.keys(st.parts).forEach(function (s) {
      var pc = st.parts[s], m = /^([hv]):(\d+):(\d+)/.exec(s); if (!pc.lb || !m) return;
      var a = "t:" + m[2] + ":" + m[3], b = m[1] === "h" ? "t:" + m[2] + ":" + (+m[3] + 1) : "t:" + (+m[2] + 1) + ":" + m[3];
      var v = S.vBetween(sol, a, b), r = S.acRms(v);
      out[pc.lb] = Math.sqrt(v.dc * v.dc + r * r);
    });
    return out;
  }
  function baseState(e, L) { return K.solveL(e, L, {}, false).state; }
  function faultPool(only) {
    var pool = [];
    EXP.forEach(function (e) {
      if (only && e.id !== only) return;
      e.procs.forEach(function (p) { (p.layouts || []).forEach(function (L) { var lb = {}; partsOf(L).forEach(function (s) { lb[L.parts[s].lb] = 1; }); if (Object.keys(lb).length >= 2 && Object.keys(lb).length === partsOf(L).length && srcOn(L) && figFor(e, p)) pool.push([e.id, p.id, L.id]); }); });
    });
    return pool;
  }
  function makeFault(e, L) {
    var base = baseState(e, L), v0 = vAcross(e, base), ref = 0;
    Object.keys(v0).forEach(function (n) { ref = Math.max(ref, v0[n]); });
    for (var k = 0; k < 40; k++) {
      var slot = pick(partsOf(L)), kind = pick(["value", "value", "open", "short"]), st = JSON.parse(JSON.stringify(base)), pc = st.parts[slot];
      pc.fault = kind === "value" ? { k: "value", v: pc.v * pick([0.1, 0.22, 4.7, 10]) } : { k: kind };
      var v1 = vAcross(e, st), d = 0; Object.keys(v0).forEach(function (n) { d = Math.max(d, Math.abs((v1[n] || 0) - v0[n])); });
      if (d >= Math.max(0.05, 0.08 * ref)) return { slot: slot, lb: pc.lb, kind: kind, v: pc.fault.v || null, state: st };
    }
    return null;
  }
  function unitOf(t) { return t === "R" ? "Ω" : t === "L" ? "H" : "F"; }
  function showFault(root, only) {
    var cur = ls(FAULT);
    if (!cur || cur.done || (only && cur.only !== only) || (!only && cur.only)) {
      var pool = faultPool(only), f = null, pk = null;
      for (var i = 0; i < 20 && !f && pool.length; i++) { pk = pick(pool); var e0 = byId(pk[0]), p0 = procOf(e0, pk[1]); f = makeFault(e0, p0.layouts.filter(function (x) { return x.id === pk[2]; })[0]); }
      if (!f) { root.innerHTML = BACK + '<p>لا توجد دائرة مناسبة لتدريب الأعطال في هذه التجربة.</p>'; return; }
      cur = { only: only || "", pick: pk, slot: f.slot, lb: f.lb, kind: f.kind, v: f.v, state: f.state, tries: 0, done: false, fresh: true };
      ls(FAULT, cur);
    }
    var e = byId(cur.pick[0]), p = procOf(e, cur.pick[1]), L = p.layouts.filter(function (x) { return x.id === cur.pick[2]; })[0], fp = figFor(e, p);
    var labels = partsOf(L).map(function (s) { return L.parts[s].lb; }).sort();
    var expect = vAcross(e, baseState(e, L)), ac = !(L.set.ps && L.set.ps.on);
    document.title = "تدريب الأعطال — معمل الدوائر 2 — CircuitVision";
    root.innerHTML = BACK +
      '<div class="lg-head"><span class="code">EE 2020 · Electric Circuits II Lab · Troubleshooting</span><h1>تدريب الأعطال</h1><span class="lg-ar">التجربة ' + e.n + ': ' + esc(e.title) + '</span></div>' +
      '<section class="card lg-sec"><h2>المهمة</h2><p>الدائرة اللي على الطاولة مركّبة صح ومشغّلة، لكن <b>قطعة وحدة فيها عطل</b>: إمّا قيمتها غير المكتوب عليها، أو مفتوحة من الداخل، أو مقصورة من الداخل. قِس بالأجهزة واكتشفها.</p>' +
      '<b>' + bd(esc(p.title)) + (p.layouts.length > 1 ? " · " + bd(esc(L.name)) : "") + '</b>' +
      '<div class="cl-fig md-fig">' + CV.draw.render(fp.fig, { aria: "مخطط " + fp.title }) + '</div>' +
      '<ul>' + settingsText(e, L).map(function (t) { return "<li>" + bd(esc(t)) + "</li>"; }).join("") + '</ul>' +
      '<details class="md-exp"><summary>الجهد المتوقع على كل قطعة لو الدائرة سليمة</summary><div class="lg-tw"><table class="lg-t md-t"><tr><th>القطعة</th><th>' + (ac ? "V (RMS)" : "V") + '</th></tr>' +
      labels.map(function (n) { return '<tr><td>' + esc(n) + '</td><td class="ltr">' + (expect[n] || 0).toFixed(3) + ' V</td></tr>'; }).join("") + '</table></div></details>' +
      '<div class="md-ans"><label>القطعة <select class="select" id="md-part"><option value="">اختر</option>' + labels.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join("") + '</select></label>' +
      '<label>العطل <select class="select" id="md-kind"><option value="">اختر</option>' + Object.keys(KIND).map(function (k) { return '<option value="' + k + '">' + KIND[k] + '</option>'; }).join("") + '</select></label></div>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-check">تحقق</button><button type="button" class="btn btn-ghost" id="md-reset">أرجع الدائرة مثل البداية</button><button type="button" class="btn btn-ghost" id="md-new">عطل جديد</button></div><div class="lg-res" id="md-res" aria-live="polite"></div>' +
      '<p class="muted small">تلميح: قِس الجهد على كل قطعة ' + (ac ? "(الملتيميتر على V~)" : "") + ' وقارنه بالمتوقع.</p></section>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2><div id="cl-bench"></div></section>';
    mountBench($("#cl-bench", root), "c2-fault", e, cur.fresh ? cur.state : null, $("#bench", root));
    if (cur.fresh) { cur.fresh = false; ls(FAULT, cur); }
    function reveal(ok) {
      var pc = L.parts[cur.slot], why = cur.kind === "open" ? "ما يمر تيار في فرعها، فيتغيّر توزيع الجهد في الدائرة."
        : cur.kind === "short" ? "جهدها صفر تقريبًا، فباقي القطع ياخذ جهد غير المتوقع."
        : "قيمتها الحقيقية " + si(cur.v, unitOf(pc.t)) + " بدل " + si(pc.v, unitOf(pc.t)) + "، فتتغيّر الجهود في الدائرة.";
      return (ok ? "✓ صح! " : "") + "العطل: <b>" + esc(cur.lb) + "</b> " + KIND[cur.kind] + ". " + why;
    }
    $("#md-check").addEventListener("click", function () {
      var pa = $("#md-part").value, kd = $("#md-kind").value, res = $("#md-res");
      if (!pa || !kd) { res.className = "lg-res bad"; res.textContent = "اختر القطعة ونوع العطل."; return; }
      if (cur.done) return;
      cur.tries++;
      var ok = pa === cur.lb && kd === cur.kind;
      if (ok || cur.tries >= 3) {
        cur.done = true; ls(FAULT, cur);
        var log = ls(FAULT_LOG) || []; log.unshift({ e: e.id, ok: ok, tries: cur.tries, at: Date.now() }); ls(FAULT_LOG, log.slice(0, 50));
        res.className = "lg-res " + (ok ? "ok" : "bad"); res.innerHTML = (ok ? "" : "ما ضبطت بعد 3 محاولات. ") + reveal(ok);
      } else {
        ls(FAULT, cur); res.className = "lg-res bad";
        res.textContent = (pa === cur.lb ? "القطعة صح، لكن نوع العطل غير. " : "مو هذي القطعة. ") + "باقي لك " + (3 - cur.tries) + (3 - cur.tries === 1 ? " محاولة." : " محاولات.");
      }
    });
    $("#md-reset").addEventListener("click", function () { mountBench($("#cl-bench", root), "c2-fault", e, cur.state, $("#bench", root)); });
    $("#md-new").addEventListener("click", function () { var c = ls(FAULT); if (c) { c.done = true; ls(FAULT, c); } leave(); showFault(root, only); window.scrollTo(0, 0); });
    if (cur.done) { var r0 = $("#md-res"); r0.className = "lg-res"; r0.innerHTML = reveal(false) + ' <span class="muted">اضغط «عطل جديد» لتدريب ثاني.</span>'; }
  }

  /* ======================= index cards ======================= */
  function indexHtml() {
    var opts = EXP.filter(function (e) { return examPool(e.id).length; }).map(function (e) { return '<option value="' + e.id + '">التجربة ' + e.n + ": " + esc(e.title) + "</option>"; }).join("");
    var fopts = EXP.filter(function (e) { return faultPool(e.id).length; }).map(function (e) { return '<option value="' + e.id + '">التجربة ' + e.n + ": " + esc(e.title) + "</option>"; }).join("");
    var log = ls(EXAM_LOG) || [], flog = ls(FAULT_LOG) || [];
    return '<div class="md-grid">' +
      '<section class="card lg-sec md-card"><h2>⏱ اختبار عملي</h2><p>دائرة عشوائية من الكتيب، ووقت محدد، وبدون «اعرض الحل». تركّب وتضبط الأجهزة وتاخذ القراءات، وتطلع لك درجة من 100.</p>' +
      '<label class="md-f">التجربة <select class="select" id="md-exp"><option value="">أي تجربة (عشوائي)</option>' + opts + '</select></label>' +
      '<label class="md-f">الوقت <select class="select" id="md-mins">' + [10, 15, 20, 30].map(function (m) { return '<option value="' + m + '"' + (+(ls("cv-c2lab-exam-mins") || 20) === m ? " selected" : "") + '>' + m + ' دقيقة</option>'; }).join("") + '</select></label>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-go-exam">ابدأ الاختبار</button></div>' +
      (log.length ? '<p class="muted small">آخر درجاتك: <span class="ltr">' + log.slice(0, 5).map(function (x) { return x.score; }).join(" · ") + "</span></p>" : "") + '</section>' +
      '<section class="card lg-sec md-card"><h2>🔧 تدريب الأعطال</h2><p>دائرة مركّبة فيها عطل مخفي واحد: قطعة قيمتها غلط، أو مفتوحة، أو مقصورة. تقيس بالأجهزة وتكتشفها.</p>' +
      '<label class="md-f">التجربة <select class="select" id="md-fexp"><option value="">أي تجربة (عشوائي)</option>' + fopts + '</select></label>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-go-fault">ابدأ التدريب</button></div>' +
      (flog.length ? '<p class="muted small">حلّيت ' + flog.filter(function (x) { return x.ok; }).length + " من " + flog.length + " أعطال.</p>" : "") + '</section></div>';
  }
  function wireIndex(root) {
    var go = $("#md-go-exam", root); if (!go) return;
    go.addEventListener("click", function () { ls("cv-c2lab-exam-mins", +$("#md-mins", root).value); var c = ls(EXAM); if (c) { c.done = true; ls(EXAM, c); } var v = $("#md-exp", root).value; location.hash = v ? "exam-" + v : "exam"; });
    $("#md-go-fault", root).addEventListener("click", function () { var c = ls(FAULT); if (c) { c.done = true; ls(FAULT, c); } var v = $("#md-fexp", root).value; location.hash = v ? "fault-" + v : "fault"; });
  }
  function route(id, root, ui) {
    UI = ui || UI;
    var m = /^(exam|fault)(?:-(c2e\d+))?$/.exec(id || ""); if (!m) return false;
    if (m[1] === "exam") showExam(root, m[2]); else showFault(root, m[2]);
    return true;
  }
  CV.c2labModes = { route: route, leave: leave, indexHtml: indexHtml, wireIndex: wireIndex, examPool: examPool, faultPool: faultPool, makeFault: makeFault, vAcross: vAcross, settingsText: settingsText };
})();
