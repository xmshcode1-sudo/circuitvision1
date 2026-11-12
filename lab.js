/* CircuitVision — Smart Lab page: breadboard bench, real instruments, environment and the Arduino Uno simulator.
   State: a bench (js/lab/bench.js). It is compiled to the solver's circuit (js/lab/labsim.js) on every change.
   CV.lab keeps the same API the guided experiments use: state() (the compiled circuit), result(), load(gridCircuit). */
(function () {
  "use strict";
  var B = CV.bench, V = CV.benchView, I = CV.instruments, S = CV.labsim, Cx = CV.ac.C, si = CV.ac.si;
  var ROWS = 7, COLS = 7, KEY = "circuitvision.lab.v2", OLD = "circuitvision.lab.v1";
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- state ---------- */
  var bench, code, pins = {}, runner = null, nextId = 1, undo = null, serialBuf = "", solved = null, dirty = true, showFlow = true, tool = "select";
  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.bench) { bench = B.fixup(d.bench); code = d.code || ""; } } catch (e) {}
    if (!bench) { try { var o = JSON.parse(localStorage.getItem(OLD)); if (o && o.lab) { bench = B.convert(o.lab); code = o.code || ""; } } catch (e) {} }
    if (!bench) { bench = starter(); code = EX.blink.code; }
    bench.parts.forEach(function (p) { var n = +String(p.id).replace(/\D/g, ""); if (n >= nextId) nextId = n + 1; });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ bench: bench, code: code })); } catch (e) {} }
  function starter() { // a first circuit: CH1 of the supply, a resistor and an LED
    var b = B.blank();
    b.parts.push({ id: "e1", k: "R", legs: ["b10", "b14"], value: 220 }, { id: "e2", k: "LED", legs: ["c14", "T-14"], color: "red" },
      { id: "e3", k: "W", legs: ["PS1+", "a10"], color: "red", lead: true }, { id: "e4", k: "W", legs: ["PS1-", "T-4"], color: "black", lead: true });
    b.inst.ps[0].v = 5; b.inst.ps[0].on = true; b.inst.ps[0].ilim = 0.1;
    return b;
  }

  /* ---------- examples (grid circuits, laid out on the breadboard when loaded) ---------- */

  function ex(name, arduino, ground, edges, probes, sketch, env) {
    var id = 0; return { name: name, lab: { rows: ROWS, cols: COLS, arduino: arduino, ground: ground || [ROWS - 1, 0], env: env || { light: 50, temp: 25 }, edges: edges.map(function (e) { var o = { id: "x" + (++id), k: e[0], a: e[1], b: e[2] }; for (var k in (e[3] || {})) o[k] = e[3][k]; return o; }), probes: Object.assign({ vp: null, vn: null, ch1: null, ch2: null }, probes || {}) }, code: sketch };
  }
  var GND_BUS = [["W", [2, 1], [3, 1]], ["W", [3, 1], [4, 1]], ["W", [4, 1], [5, 1]], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]]];
  var EX = {
    "light-sensor": ex("Arduino: حساس ضوء LDR", true, null, [["W", [0, 0], [0, 1]], ["R", [0, 1], [1, 1], { value: 6800 }], ["W", [1, 1], [2, 1]], ["W", [2, 1], [3, 1]], ["W", [3, 1], [4, 1]], ["LDR", [4, 1], [5, 1], { rdark: 50000, rlight: 1000 }], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]], ["W", [4, 0], [4, 1]]], { vp: [4, 1], vn: [6, 1] },
      "// يقرأ جهد مجزّئ الـ LDR على A0\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int value = analogRead(A0);\n  float volts = value * 5.0 / 1023;\n  Serial.print(\"A0 = \");\n  Serial.print(value);\n  Serial.print(\"  (\");\n  Serial.print(volts);\n  Serial.println(\" V)\");\n  delay(500);\n}\n"),
    blink: ex("Arduino: Blink", true, null, [["R", [1, 0], [1, 1], { value: 220 }], ["LED", [1, 1], [2, 1], { color: "red", plus: "a" }]].concat(GND_BUS), { ch1: [1, 0] },
      "// Blink: LED على المنفذ 13 عبر مقاومة 220 Ω\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(500);\n  digitalWrite(13, LOW);\n  delay(500);\n}\n"),
    fade: ex("Arduino: Fade بـ PWM", true, null, [["R", [2, 0], [2, 1], { value: 220 }], ["LED", [2, 1], [3, 1], { color: "blue", plus: "a" }], ["W", [3, 1], [4, 1]], ["W", [4, 1], [5, 1]], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]]], { vp: [2, 0], vn: [6, 0] },
      "// Fade: سطوع LED يتغير بـ PWM على المنفذ 9\nint duty = 0;\nint step = 5;\n\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(9, duty);\n  duty = duty + step;\n  if (duty <= 0 || duty >= 255) step = -step;\n  delay(30);\n}\n"),
    lamp: ex("لمبة ومفتاح (شاهد حركة التيار)", false, [2, 1], [["V", [1, 1], [2, 1], { value: 6, plus: "a", bat: true }], ["W", [1, 1], [1, 2]], ["SW", [1, 2], [1, 3], { closed: false }], ["LAMP", [1, 3], [2, 3], { vr: 6, pr: 0.5 }], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], {}),
    pir: ex("Arduino: إنارة بحساس الحركة", true, null, [["R", [1, 0], [1, 1], { value: 220 }], ["LED", [1, 1], [1, 2], { color: "white", plus: "a" }], ["W", [1, 2], [2, 2]], ["W", [2, 2], [3, 2]], ["W", [3, 2], [4, 2]], ["W", [4, 2], [5, 2]], ["W", [5, 2], [6, 2]], ["W", [6, 2], [6, 1]], ["W", [3, 0], [3, 1]], ["PIR", [3, 1], [4, 1], { plus: "a" }], ["W", [4, 1], [5, 1]], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]]], { ch1: [3, 0], ch2: [1, 0] },
      "// إنارة تعمل بالحركة: الحساس PIR على المنفذ 2، والإضاءة على 13\n// حرّك الشخص في المشهد أسفل اللوحة (اسحبه أو اضغط مشي تلقائي)\nunsigned long lastMotion = 0;\nbool wasOn = false;\n\nvoid setup() {\n  pinMode(2, INPUT);\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(2) == HIGH) lastMotion = millis();\n  bool on = lastMotion > 0 && millis() - lastMotion < 3000;\n  digitalWrite(13, on ? HIGH : LOW);\n  if (on && !wasOn) Serial.println(\"حركة! تشغيل الإضاءة\");\n  if (!on && wasOn) Serial.println(\"لا حركة: إطفاء\");\n  wasOn = on;\n  delay(50);\n}\n"),
    button: ex("Arduino: زر ضغط (INPUT_PULLUP)", true, null, [["R", [1, 0], [1, 1], { value: 220 }], ["LED", [1, 1], [1, 2], { color: "yellow", plus: "a" }], ["W", [1, 2], [2, 2]], ["W", [2, 2], [3, 2]], ["W", [3, 2], [4, 2]], ["W", [4, 2], [5, 2]], ["W", [5, 2], [6, 2]], ["W", [6, 2], [6, 1]], ["SW", [3, 0], [3, 1], { closed: false }], ["W", [3, 1], [4, 1]], ["W", [4, 1], [5, 1]], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]]], {},
      "// اضغط المفتاح (انقر عليه بأداة التحديد) ليضيء الـ LED\nvoid setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if (digitalRead(2) == LOW) {\n    digitalWrite(13, HIGH);\n  } else {\n    digitalWrite(13, LOW);\n  }\n  delay(20);\n}\n")
  };


  /* ---------- solve & render ---------- */
  function solveNow() {
    if (!dirty && solved) return solved;
    solved = B.solve(bench, bench.inst.ard ? pins : null); dirty = false;
    // wiring check: its parts are drawn in red on the board, its messages lead the status card
    solved.check = CV.wireCheck ? CV.wireCheck.check(bench, solved, V.names(bench)) : [];
    solved.check.forEach(function (x) { x.parts.forEach(function (id) { solved.c.warn.push({ part: id, t: "wire" }); }); });
    return solved;
  }
  var hooks = [], rafId = 0, needInst = false;
  function changed(rebuild) { dirty = true; save(); needInst = needInst || !!rebuild; schedule(); }
  function schedule() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = 0; solveNow();
      V.set(bench, solved); I.set(bench, solved, needInst); needInst = false;
      renderInspector(); renderStatus();
      hooks.forEach(function (f) { try { f(CV.lab.state(), CV.lab.result()); } catch (e) { if (window.console) console.error(e); } });
    });
  }
  function flash(msg) { var el = $("lab-flash"); el.textContent = msg; el.hidden = false; clearTimeout(flash.t); flash.t = setTimeout(function () { el.hidden = true; }, 3800); }

  /* ---------- inspector ---------- */
  var PREF = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6 };
  function parseSI(s) { s = String(s).trim().replace(/,/g, ".").replace(/[ΩVAFHzh\s]/g, ""); var m = /^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKM]?)$/.exec(s); return m ? parseFloat(m[1]) * (PREF[m[2]] || 1) : NaN; }
  function field(id, label, val, unit) { return '<div class="field"><label for="' + id + '">' + label + '</label><div class="pb-row"><input class="input" id="' + id + '" value="' + (val === undefined ? "" : si(val, "").trim()) + '" dir="ltr" inputmode="decimal" autocomplete="off"><span class="unit">' + unit + '</span></div></div>'; }
  var DEPK = { CCCS: ["مصدر تيار يتحكم به تيار", "CCCS", "A/A", "i"], VCCS: ["مصدر تيار يتحكم به جهد", "VCCS", "A/V", "v"], CCVS: ["مصدر جهد يتحكم به تيار", "CCVS", "V/A = Ω", "i"], VCVS: ["مصدر جهد يتحكم به جهد", "VCVS", "V/V", "v"] };
  var CTRL_K = { R: 1, LDR: 1, NTC: 1, LAMP: 1 };
  var LEDC = { red: "أحمر", yellow: "أصفر", blue: "أزرق", white: "أبيض", green: "أخضر" };
  var WIREC = { red: "أحمر", black: "أسود", yellow: "أصفر", green: "أخضر", blue: "أزرق", orange: "برتقالي", white: "أبيض", cyan: "سماوي" };
  function rows(list) { return list.map(function (x) { return '<div class="rw"><dt>' + x[0] + '</dt><dd class="ltr mono">' + x[1] + '</dd></div>'; }).join(""); }
  function clean(v) { return Math.abs(v) < 1e-9 ? 0 : v; }
  var inspFor = null;
  function renderInspector() {
    var box = $("lab-insp"), id = V.selected(), e = bench.parts.filter(function (x) { return x.id === id; })[0];
    if (!e) { inspFor = null; box.innerHTML = '<p class="muted">بأداة <b>التحديد</b> اضغط قطعة أو سلكًا لتعديله. اسحب طرفها المضيء لنقل رجل واحدة، أو اسحب القطعة نفسها لنقلها كاملة.</p>'; return; }
    if (inspFor === e.id + ":" + e.k) { readings(e); return; }
    inspFor = e.id + ":" + e.k;
    var nm = V.names(bench)[e.id] || "", h = '<div class="insp-h"><b>' + B.KIND[e.k].ar + '</b><span class="ltr mono">' + nm + '</span></div>' +
      '<p class="muted insp-pos">' + B.holeName(e.legs[0]) + ' ↔ ' + B.holeName(e.legs[1]) + '</p><div class="insp-f">';
    if (e.k === "R") { var bd = B.bands(e.value); h += field("f-value", "القيمة", e.value, "Ω") + (bd ? '<p class="muted bands">الألوان: ' + bd.list.map(function (c) { return '<i style="background:' + c[1] + '"></i>' + B.BAND_AR[c[0]]; }).join(" · ") + ' (' + bd.tol + ')' + (bd.exact ? "" : " — قيمة غير قياسية، الألوان لأقرب قيمة " + si(bd.value, "Ω")) + '</p>' : ""); }
    if (e.k === "C" || e.k === "L") h += field("f-value", "القيمة", e.value, e.k === "C" ? "F" : "H");
    if (e.k === "BAT") h += field("f-value", "الجهد", e.value, "V");
    if (e.k === "LDR") h += field("f-rlight", "في الضوء الكامل", e.rlight, "Ω") + field("f-rdark", "في الظلام", e.rdark, "Ω");
    if (e.k === "NTC") h += field("f-r25", "R عند 25°C", e.r25, "Ω") + field("f-beta", "B", e.beta, "K");
    if (e.k === "LAMP") h += field("f-vr", "الجهد المقنن", e.vr, "V") + field("f-pr", "القدرة المقننة", e.pr, "W") + '<p class="muted" style="margin:0;font-size:13px">نمثّلها بمقاومة ثابتة <span class="ltr">R = V²/P = ' + si(e.vr * e.vr / e.pr, "Ω") + '</span>.</p>';
    if (e.k === "PIR") h += '<p class="muted" style="margin:0;font-size:13px">الرجل الأولى OUT والثانية GND. يعطي 3.3 V عند الحركة في المشهد أسفل الصفحة ويبقى ثانيتين بعدها. التغذية مفترضة.</p>';
    if (e.k === "LED") h += '<div class="field"><label for="f-color">اللون</label><select class="select" id="f-color">' + Object.keys(LEDC).map(function (c) { return '<option value="' + c + '"' + (c === e.color ? " selected" : "") + '>' + LEDC[c] + ' (V<sub>f</sub> ≈ ' + (S.LED_VF[c] || 2.1) + ' V)</option>'; }).join("") + '</select></div><p class="muted" style="margin:0;font-size:13px">الرجل الطويلة (+) هي الأنود.</p>';
    if (e.k === "AM") h += '<p class="muted" style="margin:0;font-size:13px">أميتر لوحة مثالي: يقرأ التيار الداخل من رجله الأولى إلى الثانية. يوضع على التوالي.</p>';
    if (e.k === "DEP") {
      var ctl = bench.parts.filter(function (x) { return CTRL_K[x.k]; }), nmd = V.names(bench);
      h += '<div class="field"><label for="f-dk">النوع</label><select class="select" id="f-dk">' + Object.keys(DEPK).map(function (k) { return '<option value="' + k + '"' + (k === e.dk ? " selected" : "") + '>' + DEPK[k][1] + ' — ' + DEPK[k][0] + '</option>'; }).join("") + '</select></div>' +
        '<div class="field"><label for="f-ctrl">عنصر التحكم</label><select class="select" id="f-ctrl"><option value="">— اختر مقاومة —</option>' + ctl.map(function (x) { return '<option value="' + x.id + '"' + (x.id === e.ctrl ? " selected" : "") + '>' + nmd[x.id] + '</option>'; }).join("") + '</select></div>' +
        '<div class="field"><label for="f-gain">الثابت</label><div class="pb-row"><input class="input" id="f-gain" value="' + CV.num(e.gain) + '" dir="ltr" inputmode="decimal" autocomplete="off"><span class="unit">' + DEPK[e.dk][2] + '</span></div></div>' +
        '<p class="muted" style="margin:0;font-size:13px">وحدة مثالية تمثّل نموذج الكتاب. ' + (DEPK[e.dk][3] === "i" ? "التحكم = تيار عنصر التحكم من رجله الأولى إلى الثانية." : "التحكم = جهد رجل عنصر التحكم الأولى ناقص الثانية.") + ' خرجها بين رجليها: ' + (/VS$/.test(e.dk) ? "الأولى (+)." : "التيار من الأولى إلى الثانية داخلها.") + '</p>';
    }
    if (e.k === "W") h += '<div class="field"><label for="f-wc">اللون</label><select class="select" id="f-wc">' + Object.keys(WIREC).map(function (c) { return '<option value="' + c + '"' + (c === e.color ? " selected" : "") + '>' + WIREC[c] + '</option>'; }).join("") + '</select></div>';
    h += '</div><div class="insp-b">';
    if (e.k === "BAT" || e.k === "LED" || e.k === "PIR" || e.k === "DEP" || e.k === "AM" || e.k === "C") h += '<button type="button" class="btn btn-ghost btn-sm" data-act="flip">اقلب القطعة</button>';
    if (e.k === "SW") h += '<button type="button" class="btn btn-ghost btn-sm" data-act="toggle">' + (e.closed ? "اترك المفتاح" : "اضغط المفتاح") + '</button>';
    h += '<button type="button" class="btn btn-ghost btn-sm danger" data-act="del">احذف</button></div><dl class="rd" id="insp-rd"></dl>';
    box.innerHTML = h;
    box.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var v = parseSI(inp.value), k = inp.id.slice(2);
        if (k === "gain") { if (!isFinite(v) || v === 0) { inp.classList.add("bad"); return; } inp.classList.remove("bad"); e.gain = v; changed(); return; }
        if (!(v > 0)) { inp.classList.add("bad"); return; }
        inp.classList.remove("bad"); e[k] = v; inspFor = null; changed();
      });
    });
    [["f-color", "color"], ["f-dk", "dk"], ["f-ctrl", "ctrl"], ["f-wc", "color"]].forEach(function (x) { var el = $(x[0]); if (el) el.addEventListener("change", function () { e[x[1]] = el.value || null; inspFor = null; changed(); }); });
    box.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.dataset.act;
        if (a === "flip") e.legs = [e.legs[1], e.legs[0]];
        if (a === "toggle") e.closed = !e.closed;
        if (a === "del") { bench.parts = bench.parts.filter(function (x) { return x !== e; }); V.select(null); }
        inspFor = null; changed();
      });
    });
    readings(e);
  }
  function readings(e) {
    var rd = $("insp-rd"); if (!rd) return;
    var res = solved && solved.res;
    if (!res || !res.ok || e.k === "W") { rd.innerHTML = ""; return; }
    var x = res.el[e.id]; if (!x) { rd.innerHTML = rows([["الحالة", "غير موصولة"]]); return; }
    var L = [["الجهد بين رجليها (DC)", si(clean(x.v), "V")], ["التيار من الرجل 1 إلى 2 (DC)", si(clean(x.i), "A")], ["القدرة الممتصة", si(clean(x.p), "W")]];
    if (x.r) L.push(["المقاومة الآن", si(x.r, "Ω")]);
    if (e.k === "LED") L.push(["الحالة", x.on && x.i > 1e-6 ? "مضيء" : "مطفأ"]);
    if (res.ac && x.vac) {
      var Sx = Cx.scale(Cx.mul(x.vac, Cx.conj(x.iac)), 0.5);
      L.push(["الإشارة: V (قيمة عظمى)", CV.ac.polar(x.vac, "V")], ["الإشارة: I (قيمة عظمى)", CV.ac.polar(x.iac, "A")]);
      if (e.k !== "AM" && e.k !== "SW") L.push(["P المتوسطة الممتصة", si(clean(Sx.re), "W")], ["Q الردية الممتصة", si(clean(Sx.im), "VAR")]);
    }
    rd.innerHTML = rows(L);
  }

  /* ---------- status ---------- */
  function renderStatus() {
    var st = $("lab-status"), res = solved.res, w = [], nm = V.names(bench);
    if (CV.bi) (solved.check || []).forEach(function (x) { if (x.en) { var o = {}; o[x.t] = x.en; CV.bi.add(o); } });
    var nChk = (solved.check || []).length, badge = $("wc-badge");
    if (badge) { badge.hidden = !nChk; badge.textContent = "⚠ تنبيهات التشبيك: " + nChk + " · اعرضها ←"; }
    var chk = (solved.check || []).length ? '<div class="wc" role="alert"><b class="wc-h">تنبيهات التشبيك</b><ul>' + solved.check.map(function (x) { return '<li class="wc-' + x.sev + '">' + x.t + '</li>'; }).join("") + '</ul></div>' : "";
    solved.c.warn.forEach(function (x) { if (x.t === "short") w.push("رجلا " + (nm[x.part] || "القطعة") + " في نفس الشريط الموصّل (أو موصولان بسلك)، فهي مقصورة ولا يمر فيها تيار. انقل إحدى رجليها إلى عمود آخر."); });
    bench.inst.ps.forEach(function (c, i) { if (c.on && !solved.c.info.ps[i].plugged && bench.parts.some(function (p) { return p.legs.indexOf("PS" + (i + 1) + "+") > -1 || p.legs.indexOf("PS" + (i + 1) + "-") > -1; })) w.push("CH" + (i + 1) + " لمزود الجهد موصولة من طرف واحد فقط."); });
    bench.inst.fg.forEach(function (c, i) { if (c.on && !solved.c.info.fg[i].plugged && bench.parts.some(function (p) { return p.legs.indexOf("FG" + (i + 1)) > -1 || p.legs.indexOf("FG" + (i + 1) + "g") > -1; })) w.push("CH" + (i + 1) + " لمولد الإشارة يحتاج سلكين: الإشارة والأرضي."); });
    bench.inst.ps.forEach(function (c, i) { if (!c.on && solved.c.info.ps[i].plugged) w.push("CH" + (i + 1) + " لمزود الجهد موصولة لكنها مطفأة (OFF)."); });
    bench.inst.fg.forEach(function (c, i) { if (!c.on && solved.c.info.fg[i].plugged) w.push("CH" + (i + 1) + " لمولد الإشارة موصولة لكنها مطفأة (OFF)."); });
    if (!res.ok) {
      st.innerHTML = chk + '<p class="lab-err">' + (res.error === "short" ? "قصر كهربائي: طرفا مصدر جهد (بطارية أو قناة مزود) موصولان ببعض مباشرة. في الواقع يسحب تيارًا كبيرًا جدًا." : res.error === "ctrl" ? "وحدة مصدر تابع بلا عنصر تحكم: حددها واختر مقاومة التحكم." : "لا يمكن حل الدائرة بهذا الشكل: غالبًا مصدرا جهد على التوازي بقيمتين مختلفتين، أو حلقة من مصادر الجهد.") + '</p>' + (w.length ? '<ul class="lab-warn">' + w.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>' : "");
      return;
    }
    // overloads are named by the wiring check (with the part marked on the board), so the solver's short notes are not repeated
    w = w.concat(res.warn.filter(function (t) { return !CV.wireCheck || !/^⚠ (تيار الـ LED|اللمبة تأخذ|المقاومة )/.test(t); }));
    bench.inst.ps.forEach(function (c, i) { var x = res.el["ps" + (i + 1)]; if (x && x.p > 1e-6) w.push("CH" + (i + 1) + " لمزود الجهد تمتص قدرة (" + si(x.p, "W") + "): التيار يدخل من طرفها الموجب. المزود الحقيقي لا يستطيع امتصاص قدرة؛ المحاكاة تعامله كمصدر مثالي كما في الكتاب."); });
    if (Object.keys(solved.cc).some(function (k) { return solved.cc[k]; })) w.push("مزود الجهد في وضع CC: الحمل يطلب تيارًا أكبر من حد التيار، فالقناة تثبّت التيار وتنزل الجهد.");
    var hv = solved.c.lab.edges.some(function (e) { return Math.abs(res.dcV(e.a)) > 1000; });
    if (hv) w.push("⚠ جهد كبير جدًا في الدائرة: غالبًا مصدر تيار بلا مسار مغلق.");
    st.innerHTML = chk + (w.length ? '<ul class="lab-warn">' + w.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>' : chk ? "" : '<p class="muted">✓ الدائرة محلولة' + (res.ac ? " (تيار مستمر + إشارة " + si(res.ac.f, "Hz") + ")" : "") + '.</p>');
    if (bench.inst.ard) {
      var pl = [];
      [[13, "D13"], [9, "D9"], [2, "D2"]].forEach(function (q) {
        var s = pins[q[0]], v = res.dcV(S.PINS[q[1]]), t;
        if (!s) t = "غير مهيأ"; else if (s.mode === "OUTPUT") t = s.pwm != null ? "PWM " + s.pwm + " (" + Math.round(s.pwm / 2.55) + "%)" : s.out ? "HIGH" : "LOW"; else t = s.mode + " ← " + (v >= 2.5 ? "HIGH" : "LOW");
        pl.push([q[1], t + " · " + si(clean(v), "V")]);
      });
      ["A0", "A1"].forEach(function (n) { var v = res.dcV(S.PINS[n]); pl.push([n, Math.max(0, Math.min(1023, Math.round(v / 5 * 1023))) + " · " + si(clean(v), "V")]); });
      $("ard-pins").innerHTML = rows(pl);
    }
  }

  /* ---------- animation: current flow, scope, PIR scene ---------- */
  var lastT = performance.now();
  function flowFrame(now) {
    var dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    document.querySelectorAll("#lab-canvas .flow-dot").forEach(function (pth) {
      var dc = +pth.dataset.dc, amp = +pth.dataset.amp, ph = +pth.dataset.ph, t = now / 1000;
      var i = dc + (amp ? amp * Math.cos(2 * Math.PI * 0.5 * t + ph * Math.PI / 180) : 0);
      var mag = Math.abs(i), sp = mag < 1e-7 ? 0 : Math.max(12, Math.min(140, 30 + 22 * Math.log10(mag / 1e-6)));
      var off = (+pth.dataset.off || 0) - Math.sign(i) * sp * dt;
      pth.dataset.off = off; pth.style.strokeDashoffset = off; pth.style.opacity = mag < 1e-7 ? 0.15 : 0.9;
    });
  }
  function animate(now) { now = now || performance.now(); I.frame(now); if (showFlow) flowFrame(now); sceneFrame(now); requestAnimationFrame(animate); }
  var scene = { x: 60, auto: false, dir: 1, drag: false, hist: [], last: -1e9, hold: 2000, range: [230, 620] };
  function hasPIR() { return bench.parts.some(function (e) { return e.k === "PIR"; }); }
  function sceneFrame(now) {
    var card = $("scene-card"), want = hasPIR(); if (card.hidden === want) card.hidden = !want;
    if (!want) { if (bench.env.motion) { bench.env.motion = false; changed(); } return; }
    var cv = $("lab-scene"), ctx = cv.getContext("2d"), Wc = cv.width, Hc = cv.height;
    if (scene.auto && !scene.drag) { scene.x += scene.dir * 140 / 60; if (scene.x > 590) scene.dir = -1; if (scene.x < 40) scene.dir = 1; }
    scene.hist.push([now, scene.x]); while (scene.hist.length && scene.hist[0][0] < now - 150) scene.hist.shift();
    var moved = Math.abs(scene.hist[scene.hist.length - 1][1] - scene.hist[0][1]) > 3, inZone = scene.x >= scene.range[0] && scene.x <= scene.range[1];
    if (moved && inZone) scene.last = now;
    var out = now - scene.last < scene.hold;
    if (out !== !!bench.env.motion) { bench.env.motion = out; dirty = true; schedule(); }
    ctx.clearRect(0, 0, Wc, Hc); ctx.fillStyle = "#101a2c"; ctx.fillRect(0, 0, Wc, Hc); ctx.fillStyle = "#1b2840"; ctx.fillRect(0, Hc - 30, Wc, 30);
    ctx.fillStyle = out ? "rgba(255,90,90,.16)" : "rgba(120,170,255,.08)"; ctx.beginPath(); ctx.moveTo(Wc - 18, 40); ctx.lineTo(scene.range[0], Hc - 30); ctx.lineTo(Wc - 18, Hc - 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = out ? "rgba(255,110,110,.6)" : "rgba(120,170,255,.35)"; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(Wc - 18, 40); ctx.lineTo(scene.range[0], Hc - 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#dfe6f2"; ctx.fillRect(Wc - 16, 26, 12, 28); ctx.beginPath(); ctx.arc(Wc - 16, 40, 9, Math.PI / 2, Math.PI * 1.5); ctx.fillStyle = out ? "#ff6b6b" : "#f3f5f8"; ctx.fill();
    ctx.fillStyle = "#9fb0cc"; ctx.font = "12px system-ui"; ctx.textAlign = "right"; ctx.fillText("PIR", Wc - 24, 22);
    var x = scene.x, y = Hc - 30, sw = moved ? Math.sin(now / 90) * 9 : 0;
    ctx.strokeStyle = "#ffb347"; ctx.fillStyle = "#ffb347"; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(x, y - 78, 10, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y - 66); ctx.lineTo(x, y - 34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + sw, y); ctx.moveTo(x, y - 34); ctx.lineTo(x - sw, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 58); ctx.lineTo(x - sw, y - 40); ctx.moveTo(x, y - 58); ctx.lineTo(x + sw, y - 40); ctx.stroke();
    $("scene-st").textContent = out ? "الحساس كشف حركة: OUT = 3.3 V" + (moved && inZone ? "" : " (يبقى ثانيتين)") : (inZone ? "الجسم داخل المدى لكنه ساكن: لا كشف (PIR يكشف الحركة فقط)" : "خارج مدى الحساس: OUT = 0 V");
  }
  function sceneInit() {
    var cv = $("lab-scene");
    function px(ev) { var r = cv.getBoundingClientRect(); return (ev.clientX - r.left) / r.width * cv.width; }
    cv.addEventListener("pointerdown", function (ev) { scene.drag = true; scene.auto = false; $("scene-auto").setAttribute("aria-pressed", false); scene.x = Math.max(20, Math.min(600, px(ev))); cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener("pointermove", function (ev) { if (scene.drag) scene.x = Math.max(20, Math.min(600, px(ev))); });
    cv.addEventListener("pointerup", function () { scene.drag = false; });
    $("scene-auto").addEventListener("click", function () { scene.auto = !scene.auto; this.setAttribute("aria-pressed", scene.auto); });
  }

  /* ---------- Arduino ---------- */
  function serial(t, note) { serialBuf += (t || "") + (note || ""); if (serialBuf.length > 20000) serialBuf = serialBuf.slice(-15000); var el = $("ard-serial"); el.textContent = serialBuf; el.scrollTop = el.scrollHeight; }
  function setRun(on) { $("ard-run").hidden = on; $("ard-stop").hidden = !on; $("ard-state").textContent = on ? "يعمل…" : "متوقف"; $("ard-state").className = "chip " + (on ? "chip-ok" : "chip-plan"); }
  function startSketch() {
    if (runner) stopSketch();
    code = $("ard-code").value; save(); pins = {}; dirty = true; $("ard-err").hidden = true;
    try {
      runner = CV.arduino.run(code, {
        onPins: function (p) { pins = p; dirty = true; schedule(); },
        onSerial: serial,
        readV: function (n) { solveNow(); return solved.res.ok ? solved.res.dcV(S.PINS[n]) : 0; }
      });
    } catch (e) { showErr(e.message); return; }
    setRun(true);
    var me = runner;
    runner.done.then(function (r) { if (runner !== me) return; runner = null; setRun(false); if (r && r.error) showErr(r.error); });
  }
  function stopSketch() { if (runner) { var r = runner; runner = null; r.stop(); } pins = {}; dirty = true; setRun(false); schedule(); }
  function showErr(m) { var el = $("ard-err"); el.textContent = m; el.hidden = false; }
  function setArduino(on) {
    if (on === !!bench.inst.ard) return;
    if (!on) { stopSketch(); bench.parts = bench.parts.filter(function (p) { return !p.legs.some(function (l) { return /^ARD/.test(l || ""); }); }); }
    bench.inst.ard = on; syncUI(); changed(); if (on) flash("ظهرت منافذ Arduino على شريط الأجهزة. وصّلها باللوحة بأسلاك.");
  }

  /* ---------- loading ---------- */
  function reid(b) { var m = {}; b.parts.forEach(function (p) { var n = "e" + (nextId++); m[p.id] = n; p.id = n; }); b.parts.forEach(function (p) { if (p.ctrl) p.ctrl = m[p.ctrl] || null; }); b.inst.ps.concat(b.inst.fg).forEach(function (c) { if (c.src) c.src = m[c.src] || c.src; }); }
  function remember() { undo = { bench: JSON.parse(JSON.stringify(bench)), code: code }; $("lab-undo").hidden = false; }
  function setBench(b, name) { if (runner) stopSketch(); remember(); bench = B.fixup(b); reid(bench); V.select(null); syncUI(); changed(true); if (name) flash(name); }
  function loadExample(id) { var x = EX[id]; if (!x) return; if (x.code) code = x.code; setBench(B.convert(JSON.parse(JSON.stringify(x.lab))), "حُمّل: " + x.name + (x.code ? " — اضغط تشغيل لتشغيل الكود." : "")); }
  function loadLab(obj, name) { setBench(B.convert(JSON.parse(JSON.stringify(obj))), name ? "حُمّلت: " + name : ""); }
  function aliasP(p) { var a = solved && solved.c.lab.alias, k = p && p.join ? p.join(",") : p; return a && a[k] ? [a[k]] : p; }
  CV.lab = {
    state: function () { solveNow(); return solved.c.lab; },
    result: function () {
      solveNow(); var r = solved.res; if (!r.ok) return r;
      return Object.assign({}, r, { dcV: function (p) { return r.dcV(aliasP(p)); }, acV: function (p) { return r.acV(aliasP(p)); } });
    },
    where: function (k) { var h = bench.alias && bench.alias[k]; if (!h) return "؟"; var q = B.parse(h); return q.kind === "rail" ? "الخط الأزرق العلوي" : "العمود " + q.col; },
    load: loadLab, onUpdate: function (f) { hooks.push(f); }, changed: changed, names: function () { return V.names(bench); }, bench: function () { return bench; }
  };
  function syncUI() {
    $("ard-panel").hidden = !bench.inst.ard; $("ard-toggle").setAttribute("aria-pressed", !!bench.inst.ard);
    $("ard-code").value = code; $("env-light").value = bench.env.light; $("env-temp").value = bench.env.temp;
    $("env-light-o").textContent = bench.env.light + "%"; $("env-temp-o").textContent = bench.env.temp + "°C";
  }

  /* ---------- tools ---------- */
  var TOOLS = [["select", "تحديد"], ["W", "سلك"], ["R", "مقاومة"], ["LED", "LED"], ["C", "مكثف"], ["L", "ملف"], ["LDR", "LDR"], ["NTC", "NTC"], ["BAT", "بطارية"], ["SW", "مفتاح ضغط"], ["LAMP", "لمبة"], ["PIR", "حساس حركة"], ["AM", "أميتر لوحة"], ["DEP", "مصدر تابع"], ["DEL", "ممحاة"]];
  var HINT = {
    select: "اضغط قطعة لتعديلها. اسحب طرفها المضيء لنقل رجل، أو اسحب القطعة لنقلها. اضغط المفتاح المحدد لتضغطه.",
    W: "اضغط الثقب الأول ثم الثاني. لتوصيل جهاز ابدأ من مقبسه على شريط الأجهزة. أول ما تضغط ثقبًا تضيء كل الثقوب الموصولة به.",
    DEL: "اضغط قطعة أو سلكًا لحذفه."
  };
  var KEYOF = { select: "V", W: "W", R: "R", LED: "E", C: "C", L: "L", BAT: "B", SW: "S", LAMP: "A", PIR: "P", AM: "M", DEP: "D", DEL: "X" }, TOOLKEY = {};
  Object.keys(KEYOF).forEach(function (k) { TOOLKEY[KEYOF[k]] = k; });
  function hintFor(t) { return HINT[t] || "اضغط ثقب الرجل الأولى ثم ثقب الرجل الثانية لتركيب " + B.KIND[t].ar + ". الثقوب الخمسة في نفس العمود (a–e أو f–j) موصولة ببعض داخل اللوحة."; }
  function init() {
    load();
    V.init($("lab-canvas"), { changed: function () { changed(); }, select: function () { renderInspector(); }, flash: flash, newId: function () { return "e" + (nextId++); } });
    I.init($("lab-inst"), { changed: function () { changed(); }, save: save });
    $("lab-tools").innerHTML = TOOLS.map(function (t) {
      var k = KEYOF[t[0]];
      return '<button type="button" class="tl tl-part' + (t[0] === tool ? " on" : "") + '" data-tool="' + t[0] + '" aria-pressed="' + (t[0] === tool) + '"' + (k ? ' aria-keyshortcuts="' + k + '" title="' + t[1] + ' (' + k + ')"' : '') + '>' +
        (CV.partIcon ? CV.partIcon(t[0]) : "") + '<span class="tl-n">' + t[1] + '</span>' + (k ? '<kbd class="tl-k">' + k + '</kbd>' : '') + '</button>';
    }).join("");
    function pick(t) {
      var b = $("lab-tools").querySelector('[data-tool="' + t + '"]'); if (!b) return; tool = t;
      $("lab-tools").querySelectorAll(".tl").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      $("lab-hint").textContent = hintFor(tool); V.tool(tool); renderInspector();
    }
    $("lab-tools").addEventListener("click", function (ev) { var b = ev.target.closest("[data-tool]"); if (b) pick(b.dataset.tool); });
    /* keyboard shortcuts (iPad keyboard or computer); ignored while typing in a field */
    document.addEventListener("keydown", function (e) {
      var t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === "z" || e.key === "Z")) { var u = $("lab-undo"); if (u && !u.hidden) { e.preventDefault(); u.click(); } return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var key = e.key.length === 1 ? e.key.toUpperCase() : e.key, act = null;
      if (TOOLKEY[key]) { pick(TOOLKEY[key]); act = 1; }
      else if (key === "Delete" || key === "Backspace") {
        var d = document.querySelector('[data-act="del"]'), sid = V.selected();
        if (d) { d.click(); act = 1; }
        else if (sid) { bench.parts = bench.parts.filter(function (x) { return x.id !== sid; }); V.select(null); inspFor = null; changed(); act = 1; }
      }
      else if (key === "F") { var fl = document.querySelector('[data-act="flip"]'); if (fl) { fl.click(); act = 1; } }
      else if (key === "T") { var sw = document.querySelector('[data-act="toggle"]'); if (sw) { sw.click(); act = 1; } }
      else if (key === "+" || key === "=") { zoom(0.2); act = 1; }
      else if (key === "-" || key === "_") { zoom(-0.2); act = 1; }
      else if (key === "N") { $("labels-t").click(); act = 1; }
      else if (key === "Escape") { pick("select"); act = 1; }
      if (act) e.preventDefault();
    });
    $("wc-badge").addEventListener("click", function () { $("status-card").scrollIntoView({ behavior: "smooth", block: "center" }); });
    $("wire-c").addEventListener("change", function () { V.color(this.value); });
    var z = 1; function zoom(d) { z = Math.max(0.8, Math.min(2.4, Math.round((z + d) * 10) / 10)); $("zoom-v").textContent = Math.round(z * 100) + "%"; V.zoom(z); }
    $("zoom-in").addEventListener("click", function () { zoom(0.2); }); $("zoom-out").addEventListener("click", function () { zoom(-0.2); });
    $("labels-t").addEventListener("click", function () { var on = this.getAttribute("aria-pressed") !== "true"; this.setAttribute("aria-pressed", on); V.labels(on); });
    $("lab-ex").innerHTML = '<option value="">أمثلة جاهزة…</option>' + Object.keys(EX).map(function (k) { return '<option value="' + k + '">' + EX[k].name + '</option>'; }).join("");
    $("lab-ex").addEventListener("change", function () { loadExample(this.value); this.value = ""; });
    $("lab-clear").addEventListener("click", function () { var a = bench.inst.ard; setBench(Object.assign(B.blank(), { inst: Object.assign(B.blank().inst, { ard: a }) }), ""); });
    $("lab-undo").addEventListener("click", function () { if (!undo) return; if (runner) stopSketch(); bench = undo.bench; code = undo.code; undo = null; V.select(null); syncUI(); changed(true); this.hidden = true; });
    $("ard-toggle").addEventListener("click", function () { setArduino(!bench.inst.ard); });
    $("flow-toggle").setAttribute("aria-pressed", showFlow);
    $("flow-toggle").addEventListener("click", function () { showFlow = !showFlow; this.setAttribute("aria-pressed", showFlow); V.flow(showFlow); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") V.cancel(); });
    var rw = 0; window.addEventListener("resize", function () { clearTimeout(rw); rw = setTimeout(function () { V.render(); }, 150); });
    bench.env.motion = false; sceneInit();
    $("env-light").addEventListener("input", function () { bench.env.light = +this.value; $("env-light-o").textContent = this.value + "%"; changed(); });
    $("env-temp").addEventListener("input", function () { bench.env.temp = +this.value; $("env-temp-o").textContent = this.value + "°C"; changed(); });
    $("ard-run").addEventListener("click", startSketch);
    $("ard-stop").addEventListener("click", stopSketch);
    $("ard-code").addEventListener("input", function () { code = this.value; save(); });
    $("ard-code").addEventListener("keydown", function (e) { if (e.key === "Tab") { e.preventDefault(); var s = this.selectionStart; this.setRangeText("  ", s, this.selectionEnd, "end"); } });
    $("ard-clear").addEventListener("click", function () { serialBuf = ""; serial(""); });
    syncUI();
    function fromProject() { try { var d = JSON.parse(sessionStorage.getItem("cv.projlab")); if (d && d.lab) { sessionStorage.removeItem("cv.projlab"); loadLab(d.lab, d.name); } } catch (x) {} }
    var h = location.hash.replace("#", "").replace(/^ex-/, ""); if (EX[h]) loadExample(h); else if (h === "proj") fromProject();
    window.addEventListener("hashchange", function () { var k = location.hash.replace("#", "").replace(/^ex-/, ""); if (EX[k]) loadExample(k); else if (k === "proj") fromProject(); });
    $("lab-hint").textContent = hintFor(tool);
    changed(true); requestAnimationFrame(animate);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
