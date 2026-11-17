/* CircuitVision — Circuits 1 lab: practical exam, troubleshooting practice, lab report, and keeping the student's answers.
   Uses the manual's circuits (clab-exps.js), the simulator (clab-sim.js), the corrector (clab-check.js) and the bench.
   Routes handled here: #exam, #exam-<exp>, #fault, #fault-<exp>. */
(function () {
  "use strict";
  var CV = window.CV, S = CV.clabSim, K = CV.clabCheck, X = CV.clabExps, EXP = X.list;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function bd(s) { return String(s).replace(/([A-Za-z0-9][A-Za-z0-9 .,=+−\-–/×·()′'∥ΩµθπωΔ²√]*[A-Za-z0-9)Ω²′'])/g, '<span class="ltr">$1</span>'); }
  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var si = S.si, bench = null, timer = 0;

  /* what the student must set on the instruments for a circuit (written from the layout, never invented) */
  function settingsText(e, L, rows) {
    var st = L.set || {}, out = [], used = function (k) { return (L.leads || []).some(function (l) { return l.some(function (p) { return p.indexOf(k + ".") === 0; }); }); };
    var varies = (rows || []).some(function (r) { return r.set && r.set.ps; });
    if (st.ps && st.ps.on) {
      var two = used("ps.s");
      out.push(varies ? "شغّل المصدر، والجهد يتغيّر حسب كل سطر في الجدول." : "المصدر: MASTER على " + st.ps.m.v + " V" + (two && st.ps.s ? "، و SLAVE على " + st.ps.s.v + " V" : "") + ".");
    }
    if (st.fg && st.fg.on) out.push("المولّد: موجة جيبية بتردد " + si(st.fg.f, "Hz") + "، و" + (st.fgTerm ? "الجهد على طرفيه " + st.fgTerm + " Vpp وهو موصول بالدائرة." : "السعة " + st.fg.vpp + " Vpp."));
    if (st.rb && used("rb")) out.push("صندوق المقاومات على " + si(S.rbValue({ rb: st.rb }), "Ω") + ".");
    if (st.lb && used("lb")) out.push("صندوق الملفات على " + si(S.lbValue({ lb: st.lb }), "H") + ".");
    if (st.cb && used("cb")) out.push("صندوق المكثفات على " + si(S.cbValue({ cb: st.cb }), "F") + ".");
    return out;
  }
  function rowsOf(e, p, L) {
    var out = [];
    (p.tables || []).forEach(function (t) {
      if (t.kind === "pf") return;
      t.rows.forEach(function (r) { if (!r.sum && (r.q || r.qa) && K.layoutOf(e, r.L, p) === L) out.push({ t: t, r: r }); });
    });
    return out;
  }
  function mountBench(host, key, e, state, fullEl) {
    try { if (state === "fresh") localStorage.removeItem("cv-clab2-" + key); else if (state) localStorage.setItem("cv-clab2-" + key, JSON.stringify(state)); } catch (x) {}
    if (bench) bench.destroy();
    bench = CV.clabBench.mount(host, { key: key, inst: e.inst, kit: e.kit, fullEl: fullEl });
    return bench;
  }
  function leave() { if (bench) { bench.destroy(); bench = null; } clearInterval(timer); timer = 0; var r = document.getElementById("lg-ref"); if (r) r.remove(); }

  /* ======================= practical exam ======================= */
  var EXAM = "cv-clab-exam", EXAM_LOG = "cv-clab-exam-log";
  function examPool(only) {
    var pool = [];
    EXP.forEach(function (e) {
      if (e.inst.indexOf("mn") > -1 || (only && e.id !== only)) return;
      e.procs.forEach(function (p) { (p.layouts || []).forEach(function (L) { if (rowsOf(e, p, L).length && (p.fig || e.procs.some(function (q) { return q.fig; }))) pool.push([e.id, p.id, L.id]); }); });
    });
    return pool;
  }
  function figFor(e, p) { var k = e.procs.indexOf(p); for (var i = k; i >= 0; i--) if (e.procs[i].fig) return e.procs[i]; return null; }
  function showExam(root, only) {
    var cur = ls(EXAM);
    if (!cur || cur.done || (only && cur.only !== only) || (!only && cur.only)) {
      var pool = examPool(only); if (!pool.length) { root.innerHTML = '<p>لا توجد دائرة مناسبة للاختبار في هذه التجربة.</p>'; return; }
      cur = { only: only || "", pick: pick(pool), start: Date.now(), mins: +(ls("cv-clab-exam-mins") || 20), answers: {}, done: false, fresh: true };
      ls(EXAM, cur);
    }
    var e = EXP.filter(function (x) { return x.id === cur.pick[0]; })[0], p = e.procs.filter(function (x) { return x.id === cur.pick[1]; })[0], L = K.layoutOf(e, cur.pick[2], p);
    var rows = rowsOf(e, p, L).slice(0, 5), fp = figFor(e, p);
    document.title = "اختبار عملي — CircuitVision";
    root.innerHTML = '<nav class="lg-tabs"><a href="#">← معمل الدوائر</a></nav>' +
      '<div class="lg-head"><span class="code">EE · Electric Circuits I Lab · Practical exam</span><h1>اختبار عملي</h1><span class="lg-ar">التجربة ' + e.n + ': ' + esc(e.title) + '</span></div>' +
      '<section class="card lg-sec md-bar"><div class="md-timer" id="md-timer" aria-live="off"></div><p class="muted small">ركّب الدائرة واضبط الأجهزة وخذ القراءات، ثم «سلّم». ما فيه «اعرض الحل» ولا «تحقق من توصيلي» في الاختبار. التصحيح بعد التسليم.</p></section>' +
      '<section class="card lg-sec"><h2>المهمة</h2><b>' + bd(esc(p.title)) + (p.layouts.length > 1 ? " · " + bd(esc(L.name)) : "") + '</b>' +
      (fp ? '<div class="cl-fig md-fig">' + CV.draw.render(fp.fig, { aria: "مخطط " + fp.title }) + '</div>' : "") +
      '<ul>' + settingsText(e, L, rows.map(function (x) { return x.r; })).map(function (t) { return "<li>" + bd(esc(t)) + "</li>"; }).join("") + '<li>وصّل الأجهزة اللي تحتاجها لكل قراءة في مكانها الصحيح.</li></ul>' +
      '<div class="lg-tw"><table class="lg-t cl-t md-t"><tr><th></th><th>القراءة</th></tr>' + rows.map(function (x, i) {
        var r = x.r;
        if (x.t.kind === "pair") return '<tr><td class="l">' + bd(esc(r.label)) + '</td><td><span class="md-pair"><label>' + esc(x.t.a) + ' <input class="input ltr" inputmode="decimal" data-ex="' + i + 'a"></label><label>' + esc(x.t.b) + ' <input class="input ltr" inputmode="decimal" data-ex="' + i + 'b"></label></span></td></tr>';
        return '<tr><td class="l">' + bd(esc(r.label)) + ' <span class="u ltr">' + esc(r.unit || "") + '</span></td><td><input class="input ltr" inputmode="decimal" data-ex="' + i + '"></td></tr>';
      }).join("") + '</table></div>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-submit">سلّم</button><button type="button" class="btn btn-ghost" id="md-new">دائرة ثانية</button></div><div class="lg-res" id="md-res" aria-live="polite"></div></section>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2><div id="cl-bench"></div></section>';
    mountBench($("#cl-bench", root), "exam", e, cur.fresh ? "fresh" : null, $("#bench", root));
    if (cur.fresh) { cur.fresh = false; ls(EXAM, cur); }
    root.querySelectorAll("[data-ex]").forEach(function (inp) {
      if (cur.answers[inp.dataset.ex] !== undefined) inp.value = cur.answers[inp.dataset.ex];
      inp.addEventListener("input", function () { cur.answers[inp.dataset.ex] = inp.value; ls(EXAM, cur); });
    });
    function tick() {
      var left = cur.start + cur.mins * 60000 - Date.now(), el = $("#md-timer"); if (!el) return;
      if (left <= 0) { el.textContent = "انتهى الوقت"; clearInterval(timer); submit(true); return; }
      var m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
      el.innerHTML = '<span>الوقت المتبقي</span><b class="ltr">' + m + ":" + (s < 10 ? "0" : "") + s + '</b>';
      el.classList.toggle("low", left < 120000);
    }
    clearInterval(timer); timer = setInterval(tick, 1000); tick();
    function submit(auto) {
      if (cur.done && !auto) return;
      clearInterval(timer);
      var st = bench.state(), msgs = [], score = { w: 0, s: 0, r: 0 };
      /* wiring: the circuit with meters as wires (ammeters) or removed (voltmeters) must be the manual's */
      var rep = K.wiringReport(e, L, st);
      var circOk = K.iso(K.core(K.stateFor(L, {}, false), e.inst), K.core(st, e.inst));
      score.w = circOk ? 40 : 0;
      msgs.push(circOk ? "✓ الدائرة مركّبة صح." : "✗ الدائرة ما تطابق الرسمة:" + '<ul class="cl-fix">' + rep.msgs.filter(function (m) { return m.lvl === "bad"; }).map(function (m) { return "<li>" + m.t + "</li>"; }).join("") + "</ul>");
      /* settings */
      var want = L.set || {}, I = st.inst, sOk = 0, sN = 0, varies = rows.some(function (x) { return x.r.set && x.r.set.ps; });
      if (want.ps && want.ps.on) { sN++; if (I.ps.on && (varies || Math.abs(I.ps.m.v - want.ps.m.v) <= 0.15)) sOk++; else msgs.push("✗ المصدر: المطلوب " + (varies ? "تشغيله" : want.ps.m.v + " V") + "، وعندك " + (I.ps.on ? I.ps.m.v + " V" : "مطفي") + "."); }
      if (want.fg && want.fg.on) { sN++; if (I.fg.on && Math.abs(I.fg.f - want.fg.f) <= 0.03 * want.fg.f) sOk++; else msgs.push("✗ المولّد: المطلوب " + si(want.fg.f, "Hz") + "، وعندك " + (I.fg.on ? si(I.fg.f, "Hz") : "مطفي") + "."); }
      ["rb", "lb", "cb"].forEach(function (k) { if (!want[k] || !(L.leads || []).some(function (l) { return l.some(function (q) { return q.indexOf(k + ".") === 0; }); })) return; sN++;
        var f = k === "rb" ? S.rbValue : k === "lb" ? S.lbValue : S.cbValue, a = f(I), b = f({ rb: want.rb, lb: want.lb, cb: want.cb });
        if (Math.abs(a - b) <= 0.005 * b) sOk++; else msgs.push("✗ " + { rb: "صندوق المقاومات", lb: "صندوق الملفات", cb: "صندوق المكثفات" }[k] + ": المطلوب " + si(b, k === "rb" ? "Ω" : k === "lb" ? "H" : "F") + "، وعندك " + si(a, k === "rb" ? "Ω" : k === "lb" ? "H" : "F") + "."); });
      score.s = sN ? Math.round(20 * sOk / sN) : 20;
      /* readings */
      var rOk = 0, rN = 0, tbl = [];
      rows.forEach(function (x, i) {
        var r = x.r, parts = x.t.kind === "pair" ? [[i + "a", r.qa, r.ua], [i + "b", r.qb, r.ub]] : [[String(i), r.q, r.unit]];
        parts.forEach(function (z) {
          rN++; var got = K.num(cur.answers[z[0]]), want2 = K.scaled(K.evalQ(e, L, z[1], r.set, false), z[2]);
          var ok = !isNaN(got) && (x.t.signed ? K.close(got, want2, z[2], r.tol) : K.close(Math.abs(got), Math.abs(want2), z[2], r.tol));
          if (ok) rOk++;
          var inp = $('[data-ex="' + z[0] + '"]', root); if (inp) { inp.classList.remove("good", "bad"); inp.classList.add(ok ? "good" : "bad"); }
          tbl.push('<tr><td class="l">' + bd(esc(r.label)) + '</td><td class="ltr">' + (isNaN(got) ? "—" : got) + '</td><td class="ltr">' + (+want2.toPrecision(4)) + " " + esc(z[2] || "") + '</td><td>' + (ok ? "✓" : "✗") + "</td></tr>");
        });
      });
      score.r = rN ? Math.round(40 * rOk / rN) : 40;
      var total = score.w + score.s + score.r;
      cur.done = true; cur.score = total; ls(EXAM, cur);
      var log = ls(EXAM_LOG) || []; log.unshift({ e: e.id, p: p.id, L: L.id, score: total, at: Date.now() }); ls(EXAM_LOG, log.slice(0, 30));
      var res = $("#md-res"); res.className = "lg-res " + (total >= 60 ? "ok" : "bad");
      res.innerHTML = '<div class="md-score"><b class="ltr">' + total + ' / 100</b>' + (auto ? '<span>(انتهى الوقت وسُلّم تلقائيًا)</span>' : "") + '</div>' +
        '<ul class="md-break"><li>التوصيل: <b class="ltr">' + score.w + '/40</b></li><li>ضبط الأجهزة: <b class="ltr">' + score.s + '/20</b></li><li>القراءات: <b class="ltr">' + score.r + '/40</b> (' + rOk + " من " + rN + ')</li></ul>' +
        msgs.map(function (m) { return "<div>" + m + "</div>"; }).join("") +
        '<div class="lg-tw"><table class="lg-t md-t"><tr><th></th><th>قراءتك</th><th>قراءة الطاولة</th><th></th></tr>' + tbl.join("") + "</table></div>" +
        '<p class="muted small">«قراءة الطاولة» هي اللي تعطيها الأجهزة على هذي الدائرة بقطعها الحقيقية، والقراءة القريبة منها تنحسب صح.</p>';
      $("#md-submit").disabled = true;
    }
    $("#md-submit").addEventListener("click", function () { submit(false); });
    $("#md-new").addEventListener("click", function () { var c = ls(EXAM); if (c) { c.done = true; ls(EXAM, c); } leave(); showExam(root, only); window.scrollTo(0, 0); });
    if (cur.done) { $("#md-submit").disabled = true; $("#md-res").className = "lg-res"; $("#md-res").textContent = "سلّمت هذا الاختبار ودرجتك " + cur.score + " / 100. اضغط «دائرة ثانية» لاختبار جديد."; clearInterval(timer); $("#md-timer").textContent = "انتهى"; }
  }

  /* ======================= troubleshooting practice ======================= */
  var FAULT = "cv-clab-fault", FAULT_LOG = "cv-clab-fault-log";
  var KIND = { value: "قيمتها غير المكتوب عليها", open: "مفتوحة من الداخل", short: "مقصورة من الداخل" };
  function partsOf(L) { return Object.keys(L.parts || {}).filter(function (s) { return L.parts[s].t === "R" && L.parts[s].lb; }); }
  function vAcross(e, st) {
    var sol = S.solve(st, { only: e.inst }), out = {};
    Object.keys(st.parts).forEach(function (s) { var pc = st.parts[s], m = /^([hv]):(\d+):(\d+)/.exec(s); if (!pc.lb || !m) return;
      var a = "t:" + m[2] + ":" + m[3], b = m[1] === "h" ? "t:" + m[2] + ":" + (+m[3] + 1) : "t:" + (+m[2] + 1) + ":" + m[3];
      out[pc.lb] = S.vBetween(sol, a, b).dc; });
    return out;
  }
  function faultPool(only) {
    var pool = [];
    EXP.forEach(function (e) {
      if (e.inst.indexOf("mn") > -1 || e.inst.indexOf("fg") > -1 || (only && e.id !== only)) return;
      e.procs.forEach(function (p) { (p.layouts || []).forEach(function (L) { if (partsOf(L).length >= 2 && L.set && L.set.ps && L.set.ps.on) pool.push([e.id, p.id, L.id]); }); });
    });
    return pool;
  }
  function makeFault(e, L) {
    var base = K.stateFor(L, {}, false), v0 = vAcross(e, base), vs = Math.max(1, (L.set.ps.m || {}).v || 1);
    for (var k = 0; k < 40; k++) {
      var slot = pick(partsOf(L)), kind = pick(["value", "value", "open", "short"]), st = JSON.parse(JSON.stringify(base)), pc = st.parts[slot];
      pc.fault = kind === "value" ? { k: "value", v: pc.v * pick([0.1, 0.22, 4.7, 10]) } : { k: kind };
      var v1 = vAcross(e, st), d = 0; Object.keys(v0).forEach(function (n) { d = Math.max(d, Math.abs((v1[n] || 0) - v0[n])); });
      if (d >= Math.max(0.3, 0.06 * vs)) return { slot: slot, lb: pc.lb, kind: kind, v: pc.fault.v || null, state: st };
    }
    return null;
  }
  function showFault(root, only) {
    var cur = ls(FAULT);
    if (!cur || cur.done || (only && cur.only !== only) || (!only && cur.only)) {
      var pool = faultPool(only), f = null, pk = null;
      for (var i = 0; i < 20 && !f && pool.length; i++) { pk = pick(pool); var e0 = EXP.filter(function (x) { return x.id === pk[0]; })[0], p0 = e0.procs.filter(function (x) { return x.id === pk[1]; })[0]; f = makeFault(e0, K.layoutOf(e0, pk[2], p0)); }
      if (!f) { root.innerHTML = '<p>لا توجد دائرة مناسبة لتدريب الأعطال في هذه التجربة.</p>'; return; }
      cur = { only: only || "", pick: pk, slot: f.slot, lb: f.lb, kind: f.kind, v: f.v, state: f.state, tries: 0, done: false, fresh: true };
      ls(FAULT, cur);
    }
    var e = EXP.filter(function (x) { return x.id === cur.pick[0]; })[0], p = e.procs.filter(function (x) { return x.id === cur.pick[1]; })[0], L = K.layoutOf(e, cur.pick[2], p), fp = figFor(e, p);
    var labels = partsOf(L).map(function (s) { return L.parts[s].lb; }).sort();
    var expect = vAcross(e, K.stateFor(L, {}, true));
    document.title = "تدريب الأعطال — CircuitVision";
    root.innerHTML = '<nav class="lg-tabs"><a href="#">← معمل الدوائر</a></nav>' +
      '<div class="lg-head"><span class="code">EE · Electric Circuits I Lab · Troubleshooting</span><h1>تدريب الأعطال</h1><span class="lg-ar">التجربة ' + e.n + ': ' + esc(e.title) + '</span></div>' +
      '<section class="card lg-sec"><h2>المهمة</h2><p>الدائرة اللي على الطاولة مركّبة صح ومشغّلة، لكن <b>قطعة وحدة فيها عطل</b>: إمّا قيمتها غير المكتوب عليها، أو مفتوحة من الداخل، أو مقصورة. شكلها من برا طبيعي. قِس بالأجهزة ولقى العطل.</p>' +
      '<b>' + bd(esc(p.title)) + (p.layouts.length > 1 ? " · " + bd(esc(L.name)) : "") + '</b>' +
      (fp ? '<div class="cl-fig md-fig">' + CV.draw.render(fp.fig, { aria: "مخطط " + fp.title }) + '</div>' : "") +
      '<ul>' + settingsText(e, L).map(function (t) { return "<li>" + bd(esc(t)) + "</li>"; }).join("") + '</ul>' +
      '<details class="md-exp"><summary>الجهد المتوقع على كل قطعة لو الدائرة سليمة</summary><div class="lg-tw"><table class="lg-t md-t"><tr><th>القطعة</th><th>V (قيم اسمية)</th></tr>' +
      labels.map(function (n) { return '<tr><td>' + esc(n) + '</td><td class="ltr">' + Math.abs(expect[n] || 0).toFixed(2) + ' V</td></tr>'; }).join("") + '</table></div></details>' +
      '<div class="md-ans"><label>القطعة <select class="select" id="md-part"><option value="">اختر</option>' + labels.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join("") + '</select></label>' +
      '<label>العطل <select class="select" id="md-kind"><option value="">اختر</option>' + Object.keys(KIND).map(function (k) { return '<option value="' + k + '">' + KIND[k] + '</option>'; }).join("") + '</select></label></div>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-check">تحقق</button><button type="button" class="btn btn-ghost" id="md-reset">أرجع الدائرة مثل البداية</button><button type="button" class="btn btn-ghost" id="md-new">عطل جديد</button></div><div class="lg-res" id="md-res" aria-live="polite"></div>' +
      '<p class="muted small">تلميح: قِس الجهد على كل قطعة وقارنه بالمتوقع. وللتأكد، افصل المصدر وقِس القطعة بالأوميتر.</p></section>' +
      '<section class="card lg-sec lg-bench" id="bench"><h2>طاولة المعمل</h2><div id="cl-bench"></div></section>';
    mountBench($("#cl-bench", root), "fault", e, cur.fresh ? cur.state : null, $("#bench", root));
    if (cur.fresh) { cur.fresh = false; ls(FAULT, cur); }
    function reveal(ok) {
      var why = cur.kind === "open" ? "الأوميتر يقرأ OL عليها لحالها، وما يمر تيار في فرعها، وجهد المصدر كله تقريبًا يطلع على طرفيها لو كانت على التوالي."
        : cur.kind === "short" ? "جهدها صفر تقريبًا، والأوميتر يقرأ عليها لحالها 0 Ω، فباقي القطع ياخذ جهد أكبر من المتوقع."
        : "الأوميتر يقرأ عليها " + si(cur.v, "Ω") + " بدل " + si(L.parts[cur.slot].v, "Ω") + "، فتتغيّر الجهود في الدائرة.";
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
    $("#md-reset").addEventListener("click", function () { mountBench($("#cl-bench", root), "fault", e, cur.state, $("#bench", root)); });
    $("#md-new").addEventListener("click", function () { var c = ls(FAULT); if (c) { c.done = true; ls(FAULT, c); } try { localStorage.removeItem("cv-clab2-fault"); } catch (x) {} leave(); showFault(root, only); window.scrollTo(0, 0); });
    if (cur.done) { var r0 = $("#md-res"); r0.className = "lg-res"; r0.innerHTML = reveal(false) + ' <span class="muted">اضغط «عطل جديد» لتدريب ثاني.</span>'; }
  }

  /* ======================= index cards ======================= */
  var INST_VIDEOS = [
    ["ps", "مزوّد الجهد Leybold", "MASTER و SLAVE، حد التيار CC و CV، و NORMAL · SERIES · PARALLEL"],
    ["dmm-fluke", "الملتيميتر Fluke 115", "الجهد والتيار والمقاومة، ومدخل A وفيوزه"],
    ["dmm-peak", "الملتيميتر PeakTech", "مدخل mA و 10A، ومتى تستخدم كل واحد"],
    ["fg", "مولّد الإشارة PINTEK FG-32", "التردد والمدى والسعة، والمقاومة الداخلية 50 Ω"],
    ["scope", "راسم الإشارة PeakTech 1240", "VOLTS/DIV و SEC/DIV، المؤشرات، Measure، وأرضي المجس"],
    ["boxes", "صناديق المقاومات والملفات والمكثفات", "كيف تقرأ القيمة من المقابض"]
  ];
  var VID_DUR = { "ps": "0:58", "dmm-fluke": "0:46", "dmm-peak": "0:46", "fg": "0:41", "scope": "0:41", "boxes": "0:36" };   // filled when the videos are made (clab-inst-<key>.mp4)
  function indexHtml() {
    var opts = EXP.filter(function (e) { return e.inst.indexOf("mn") < 0; }).map(function (e) { return '<option value="' + e.id + '">التجربة ' + e.n + ": " + esc(e.title) + "</option>"; }).join("");
    var fopts = EXP.filter(function (e) { return faultPool(e.id).length; }).map(function (e) { return '<option value="' + e.id + '">التجربة ' + e.n + ": " + esc(e.title) + "</option>"; }).join("");
    var log = ls(EXAM_LOG) || [], flog = ls(FAULT_LOG) || [];
    var vids = INST_VIDEOS.filter(function (v) { return VID_DUR[v[0]]; });
    return '<div class="md-grid">' +
      '<section class="card lg-sec md-card"><h2>⏱ اختبار عملي</h2><p>دائرة عشوائية من الكتيب، ووقت محدد، وبدون «اعرض الحل». تركّب وتضبط الأجهزة وتقيس، والتصحيح والدرجة بعد التسليم.</p>' +
      '<label class="md-f">التجربة <select class="select" id="md-exp"><option value="">أي تجربة (عشوائي)</option>' + opts + '</select></label>' +
      '<label class="md-f">الوقت <select class="select" id="md-mins">' + [10, 15, 20, 30].map(function (m) { return '<option value="' + m + '"' + (+(ls("cv-clab-exam-mins") || 20) === m ? " selected" : "") + '>' + m + ' دقيقة</option>'; }).join("") + '</select></label>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-go-exam">ابدأ الاختبار</button></div>' +
      (log.length ? '<p class="muted small">آخر درجاتك: <span class="ltr">' + log.slice(0, 5).map(function (x) { return x.score; }).join(" · ") + "</span></p>" : "") + '</section>' +
      '<section class="card lg-sec md-card"><h2>🔧 تدريب الأعطال</h2><p>دائرة مركّبة فيها عطل مخفي واحد: قطعة قيمتها غلط، أو مفتوحة، أو مقصورة. تقيس وتحدد العطل، وعندك 3 محاولات.</p>' +
      '<label class="md-f">التجربة <select class="select" id="md-fexp"><option value="">أي تجربة (عشوائي)</option>' + fopts + '</select></label>' +
      '<div class="lg-act"><button type="button" class="btn btn-primary" id="md-go-fault">ابدأ التدريب</button></div>' +
      (flog.length ? '<p class="muted small">حلّيت ' + flog.filter(function (x) { return x.ok; }).length + " من " + flog.length + " أعطال.</p>" : "") + '</section>' +
      '</div>' +
      '<section class="card lg-sec"><h2>🎬 تعرّف على أجهزة المعمل</h2>' +
      (vids.length ? '<div class="md-vids">' + vids.map(function (v) { return '<figure class="md-vid"><video controls playsinline preload="none" poster="clab-inst-' + v[0] + '.jpg" src="clab-inst-' + v[0] + '.mp4"></video><figcaption><b>' + esc(v[1]) + '</b> <span class="muted small ltr">' + VID_DUR[v[0]] + '</span><span class="muted small">' + bd(esc(v[2])) + "</span></figcaption></figure>"; }).join("") + "</div>"
        : '<p class="muted">قيد الإعداد</p>') + '</section>';
  }
  function wireIndex(root) {
    var go = $("#md-go-exam", root); if (!go) return;
    go.addEventListener("click", function () { ls("cv-clab-exam-mins", +$("#md-mins", root).value); var c = ls(EXAM); if (c) { c.done = true; ls(EXAM, c); } var v = $("#md-exp", root).value; location.hash = v ? "exam-" + v : "exam"; });
    $("#md-go-fault", root).addEventListener("click", function () { var c = ls(FAULT); if (c) { c.done = true; ls(FAULT, c); } try { localStorage.removeItem("cv-clab2-fault"); } catch (x) {} var v = $("#md-fexp", root).value; location.hash = v ? "fault-" + v : "fault"; });
  }

  /* ======================= the student's answers, kept between visits ======================= */
  function keepAnswers(e, root) {
    var KEY = "cv-clab-ans-" + e.id, saved = ls(KEY) || {};
    function idOf(inp) {
      var pre = inp.closest("[data-pre]"), tb = inp.closest(".cl-tbl"), tr = inp.closest("tr[data-r]");
      if (pre) return "pre" + pre.dataset.pre + ":" + inp.dataset.f;
      if (tb && tr) return tb.dataset.t + ":" + tr.dataset.r + ":" + (inp.hasAttribute("data-m") ? "m" : inp.hasAttribute("data-c") ? "c" : inp.hasAttribute("data-a") ? "a" : inp.hasAttribute("data-b") ? "b" : inp.dataset.k);
      return null;
    }
    root.querySelectorAll(".cl-fields input, .cl-tbl input").forEach(function (inp) {
      var k = idOf(inp); if (!k) return;
      if (saved[k] !== undefined) { inp.value = saved[k]; inp.dispatchEvent(new Event("input", { bubbles: true })); }
      inp.addEventListener("input", function () { saved[k] = inp.value; ls(KEY, saved); });
    });
  }

  /* ======================= lab report (print → PDF) ======================= */
  function report(e, root) {
    var st = ls("cv-clab-student") || {}, ans = ls("cv-clab-ans-" + e.id) || {};
    var name = st.name || (CV.cloud && CV.cloud.name && CV.cloud.name()) || "";
    var h = '<div class="rp-bar no-print"><button type="button" class="btn btn-primary" id="rp-print">اطبع / احفظ PDF</button><button type="button" class="btn btn-ghost" id="rp-close">إغلاق</button><span class="muted small">الحقول بالأزرق تقدر تعدّلها قبل الطباعة.</span></div>' +
      '<article class="rp-page"><header class="rp-head"><div><div class="rp-code">EE · Electric Circuits I Lab</div><h1 dir="ltr">Experiment #' + e.n + ": " + esc(e.en) + '</h1><div class="rp-ar">' + esc(e.title) + '</div></div>' +
      '<table class="rp-who"><tr><th>الاسم</th><td><input class="rp-in" id="rp-name" value="' + esc(name) + '"></td></tr><tr><th>الرقم الجامعي</th><td><input class="rp-in" id="rp-id" value="' + esc(st.id || "") + '"></td></tr><tr><th>الشعبة</th><td><input class="rp-in" id="rp-sec" value="' + esc(st.sec || "") + '"></td></tr><tr><th>التاريخ</th><td>' + new Date().toLocaleDateString("ar-SA-u-ca-gregory-nu-latn") + "</td></tr></table></header>" +
      "<h2>الأهداف</h2><ul>" + e.objective.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + "</ul>" +
      "<h2>الأدوات</h2><ul>" + e.equipment.map(function (o) { return "<li>" + bd(esc(o)) + "</li>"; }).join("") + "</ul>";
    if (e.prelab.length) {
      h += "<h2>التحضير (Pre-Lab)</h2>";
      e.prelab.forEach(function (t, k) {
        h += '<div class="rp-q"><p><b>' + (k + 1) + ".</b> " + bd(esc(t.q)) + '</p><table class="rp-t"><tr>' + t.fields.map(function (f, j) {
          var v = ans["pre" + k + ":" + j], got = K.num(v), want = f.ans !== undefined ? f.ans : K.scaled(K.evalQ(e, K.layoutOf(e, f.L), f.q, null, true), f.unit);
          var ok = !isNaN(got) && (f.q ? K.close(Math.abs(got), Math.abs(want), f.unit, 0.012) : K.close(got, want, f.unit, 0.012));
          return "<td>" + bd(esc(f.label)) + ': <b class="ltr">' + (v === undefined || v === "" ? "—" : esc(v) + " " + esc(f.unit)) + "</b>" + (isNaN(got) ? "" : ok ? ' <span class="rp-ok">✓</span>' : ' <span class="rp-bad">✗</span>') + "</td>";
        }).join("") + "</tr></table></div>";
      });
    }
    e.procs.forEach(function (p) {
      h += "<h2>" + bd(esc(p.title)) + "</h2>";
      if (p.fig) h += '<div class="rp-fig">' + CV.draw.render(p.fig, { aria: p.title }) + "</div>";
      (p.tables || []).forEach(function (t, j) {
        var id = p.id + "t" + j, live = root.querySelector('.cl-tbl[data-t="' + id + '"]');
        h += "<h3>" + bd(esc(t.title)) + "</h3>";
        if (live) {
          var tb = live.querySelector("table").cloneNode(true);
          tb.querySelectorAll(".bi-s").forEach(function (x) { x.remove(); });
          tb.querySelectorAll("input").forEach(function (inp) { var s = document.createElement("span"); s.className = "ltr" + (inp.classList.contains("good") ? " rp-good" : inp.classList.contains("bad") ? " rp-badc" : ""); s.textContent = inp.value || "—"; inp.replaceWith(s); });
          tb.className = "rp-t"; h += tb.outerHTML;
          var pl = live.querySelector(".cl-plot svg"); if (pl) h += '<div class="rp-fig">' + pl.outerHTML + "</div>";
        }
      });
    });
    h += '<h2>الاستنتاج</h2><textarea class="rp-in rp-con" id="rp-con" rows="5" placeholder="اكتب استنتاجك هنا">' + esc(ls("cv-clab-con-" + e.id) || "") + "</textarea>" +
      '<p class="rp-foot">القيم المقاسة أُخذت من طاولة المعمل في CircuitVision (محاكاة بقطع لها تفاوت مثل الحقيقية). ✓ و ✗ من تصحيح المنصة.</p></article>';
    var box = document.getElementById("cl-report"); if (box) box.remove();
    box = document.createElement("div"); box.id = "cl-report"; box.className = "rp no-bi"; box.innerHTML = h; document.body.appendChild(box);
    document.documentElement.classList.add("rp-open"); window.scrollTo(0, 0);
    function saveWho() { ls("cv-clab-student", { name: $("#rp-name").value, id: $("#rp-id").value, sec: $("#rp-sec").value }); ls("cv-clab-con-" + e.id, $("#rp-con").value); }
    box.addEventListener("input", saveWho);
    $("#rp-print").addEventListener("click", function () { saveWho(); window.print(); });
    $("#rp-close").addEventListener("click", function () { box.remove(); document.documentElement.classList.remove("rp-open"); });
  }

  /* ======================= routing ======================= */
  function route(id, root) {
    var m = /^(exam|fault)(?:-(exp\d+))?$/.exec(id || ""); if (!m) return false;
    if (m[1] === "exam") showExam(root, m[2]); else showFault(root, m[2]);
    return true;
  }
  CV.clabModes = { route: route, leave: leave, indexHtml: indexHtml, wireIndex: wireIndex, keepAnswers: keepAnswers, report: report, settingsText: settingsText, faultPool: faultPool, examPool: examPool, makeFault: makeFault, VID_DUR: VID_DUR };
})();
