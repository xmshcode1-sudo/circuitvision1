/* CircuitVision — Smart Lab page: circuit editor, instruments, environment and Arduino Uno simulator. */
(function () {
  "use strict";
  var S = CV.labsim, D = CV.draw, Cx = CV.ac.C, si = CV.ac.si, num = CV.num;
  var ROWS = 7, COLS = 7, KEY = "circuitvision.lab.v1";
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- tools ---------- */
  var KIND = {
    W: { ar: "سلك" }, R: { ar: "مقاومة", def: { value: 1000 } }, LED: { ar: "LED", def: { color: "red", plus: "a" } },
    LDR: { ar: "مقاومة ضوئية LDR", def: { rdark: 50000, rlight: 1000 } }, NTC: { ar: "ثرمستور NTC", def: { r25: 10000, beta: 3950 } },
    C: { ar: "مكثف", def: { value: 100e-9 } }, L: { ar: "ملف", def: { value: 10e-3 } },
    V: { ar: "مصدر جهد مستمر", def: { value: 5, plus: "a" } }, BAT: { ar: "بطارية", base: "V", def: { value: 3, plus: "a", bat: true } },
    I: { ar: "مصدر تيار", def: { value: 1e-3, dir: "ab" } }, DEP: { ar: "مصدر تابع", def: { dk: "CCCS", gain: 100, ctrl: null, dir: "ab", plus: "a" } }, GEN: { ar: "مولد إشارة", def: { amp: 5, freq: 1000, rs: 50, plus: "a" } },
    SW: { ar: "مفتاح ضغط", def: { closed: false } }, AM: { ar: "أميتر", def: {} },
    LAMP: { ar: "لمبة", def: { vr: 6, pr: 0.5 } }, PIR: { ar: "حساس حركة PIR", def: { plus: "a" } }
  };
  var TOOLS = [["select", "تحديد"], ["W", "سلك"], ["R", "مقاومة"], ["LED", "LED"], ["LDR", "LDR"], ["NTC", "NTC"], ["C", "مكثف"], ["L", "ملف"], ["V", "مصدر DC"], ["BAT", "بطارية"], ["I", "مصدر تيار"], ["DEP", "مصدر تابع"], ["GEN", "مولد إشارة"], ["SW", "مفتاح"], ["LAMP", "لمبة"], ["PIR", "حساس حركة"], ["AM", "أميتر"], ["VM", "فولتميتر"], ["SC", "أوسيلوسكوب"], ["GND", "أرضي"], ["DEL", "ممحاة"]];
  var LEDC = { red: ["أحمر", "#ff4b4b"], yellow: ["أصفر", "#ffd23b"], blue: ["أزرق", "#3b8bff"], white: ["أبيض", "#f2f2ff"] };

  /* ---------- state ---------- */
  var showFlow = true, lab, code, tool = "select", sel = null, res = null, pins = {}, runner = null, nextId = 1, undo = null, serialBuf = "";
  function blank() { return { rows: ROWS, cols: COLS, arduino: false, ground: [ROWS - 1, 0], env: { light: 50, temp: 25 }, edges: [], probes: { vp: null, vn: null, ch1: null, ch2: null } }; }
  function load() { try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.lab) { lab = d.lab; code = d.code || ""; } } catch (e) {} if (!lab) { lab = blank(); code = EX.blink.code; } lab.edges.forEach(function (e) { nextId = Math.max(nextId, +String(e.id).replace(/\D/g, "") + 1); }); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ lab: lab, code: code })); } catch (e) {} }

  /* ---------- examples (the project circuits + Arduino sketches) ---------- */
  function ex(name, arduino, ground, edges, probes, sketch, env) {
    var id = 0; return { name: name, lab: { rows: ROWS, cols: COLS, arduino: arduino, ground: ground || [ROWS - 1, 0], env: env || { light: 50, temp: 25 }, edges: edges.map(function (e) { var o = { id: "x" + (++id), k: e[0], a: e[1], b: e[2] }; for (var k in (e[3] || {})) o[k] = e[3][k]; return o; }), probes: Object.assign({ vp: null, vn: null, ch1: null, ch2: null }, probes || {}) }, code: sketch };
  }
  var GND_BUS = [["W", [2, 1], [3, 1]], ["W", [3, 1], [4, 1]], ["W", [4, 1], [5, 1]], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]]];
  var EX = {
    "led-indicator": ex("مشروع: مؤشر LED", false, [2, 1], [["V", [1, 1], [2, 1], { value: 5, plus: "a" }], ["R", [1, 1], [1, 2], { value: 220 }], ["AM", [1, 2], [1, 3]], ["LED", [1, 3], [2, 3], { color: "red", plus: "a" }], ["W", [2, 1], [2, 2]], ["W", [2, 2], [2, 3]]], { vp: [1, 1], vn: [1, 2] }),
    "light-sensor": ex("مشروع: حساس ضوء + Arduino", true, null, [["W", [0, 0], [0, 1]], ["R", [0, 1], [1, 1], { value: 6800 }], ["W", [1, 1], [2, 1]], ["W", [2, 1], [3, 1]], ["W", [3, 1], [4, 1]], ["LDR", [4, 1], [5, 1], { rdark: 50000, rlight: 1000 }], ["W", [5, 1], [6, 1]], ["W", [6, 1], [6, 0]], ["W", [4, 0], [4, 1]]], { vp: [4, 1], vn: [6, 1] },
      "// يقرأ جهد مجزّئ الـ LDR على A0\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int value = analogRead(A0);\n  float volts = value * 5.0 / 1023;\n  Serial.print(\"A0 = \");\n  Serial.print(value);\n  Serial.print(\"  (\");\n  Serial.print(volts);\n  Serial.println(\" V)\");\n  delay(500);\n}\n"),
    "temp-alarm": ex("مشروع: جسر ويتستون مع NTC", false, [3, 0], [["V", [1, 0], [2, 0], { value: 5, plus: "a" }], ["W", [2, 0], [3, 0]], ["W", [1, 0], [1, 1]], ["W", [1, 1], [1, 2]], ["R", [1, 1], [2, 1], { value: 10000 }], ["R", [2, 1], [3, 1], { value: 10000 }], ["R", [1, 2], [2, 2], { value: 8200 }], ["NTC", [2, 2], [3, 2], { r25: 10000, beta: 3950 }], ["W", [3, 0], [3, 1]], ["W", [3, 1], [3, 2]]], { vp: [2, 1], vn: [2, 2] }, null, { light: 50, temp: 30 }),
    "rc-filter": ex("مشروع: مرشح RC", false, [2, 0], [["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 50, plus: "a" }], ["R", [1, 0], [1, 1], { value: 1000 }], ["C", [1, 1], [2, 1], { value: 150e-9 }], ["W", [2, 0], [2, 1]]], { ch1: [1, 0], ch2: [1, 1], vp: [1, 1], vn: [2, 1] }),
    "mixer": ex("مشروع: مجمّع جهدين (تراكب)", false, [2, 0], [["V", [1, 0], [2, 0], { value: 5, plus: "a" }], ["R", [1, 0], [1, 1], { value: 10000 }], ["R", [1, 1], [2, 1], { value: 10000 }], ["R", [1, 1], [1, 2], { value: 10000 }], ["V", [1, 2], [2, 2], { value: 3, plus: "a", bat: true }], ["W", [2, 0], [2, 1]], ["W", [2, 1], [2, 2]]], { vp: [1, 1], vn: [2, 1] }),
    "max-power": ex("مشروع: أقصى قدرة من المولد", false, [2, 0], [["GEN", [1, 0], [2, 0], { amp: 5, freq: 1000, rs: 50, plus: "a" }], ["W", [1, 0], [1, 1]], ["R", [1, 1], [2, 1], { value: 47 }], ["W", [2, 0], [2, 1]]], { vp: [1, 1], vn: [2, 1], ch1: [1, 1] }),
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

  /* ---------- labels ---------- */
  function names() {
    var cnt = {}, out = {};
    lab.edges.forEach(function (e) { if (e.k === "W") return; var b = e.k === "V" && e.bat ? "B" : { R: "R", LED: "LED", LDR: "LDR", NTC: "NTC", C: "C", L: "L", V: "V", I: "I", GEN: "G", SW: "S", AM: "A", LAMP: "X", PIR: "PIR", DEP: "D" }[e.k]; cnt[b] = (cnt[b] || 0) + 1; out[e.id] = b + cnt[b]; });
    return out;
  }
  var DEPK = { CCCS: ["مصدر تيار يتحكم به تيار", "CCCS", "A/A", "i"], VCCS: ["مصدر تيار يتحكم به جهد", "VCCS", "A/V", "v"], CCVS: ["مصدر جهد يتحكم به تيار", "CCVS", "V/A = Ω", "i"], VCVS: ["مصدر جهد يتحكم به جهد", "VCVS", "V/V", "v"] };
  var CTRL_K = { R: 1, LDR: 1, NTC: 1, LAMP: 1 };
  function kindName(e) { return e.k === "V" && e.bat ? "بطارية" : e.k === "DEP" ? "مصدر تابع " + DEPK[e.dk][1] : KIND[e.k].ar; }
  function depText(e, nm) { var c = nm[e.ctrl]; return CV.num(e.gain) + " " + DEPK[e.dk][3] + "(" + (c || "؟") + ")"; }

  /* ---------- display circuit for the schematic renderer ---------- */
  function display() {
    var nm = names(), edges = lab.edges.map(function (e) {
      var o = { a: e.a, b: e.b, name: nm[e.id] };
      switch (e.k) {
        case "W": o.type = "W"; delete o.name; break;
        case "R": o.type = "R"; o.value = e.value; break;
        case "LDR": o.type = "R"; o.variable = true; o.vtext = si(S.ldrR(e, lab.env.light), "Ω"); break;
        case "NTC": o.type = "R"; o.variable = true; o.vtext = si(S.ntcR(e, lab.env.temp), "Ω"); break;
        case "C": case "L": o.type = e.k; o.value = e.value; o.vtext = si(e.value, e.k === "C" ? "F" : "H"); break;
        case "V": o.type = "V"; o.value = e.value; o.plus = e.plus; o.vtext = (e.bat ? "🔋 " : "") + si(e.value, "V"); break;
        case "I": o.type = "I"; o.value = e.value; o.dir = e.dir; o.vtext = si(e.value, "A"); break;
        case "GEN": o.type = "V"; o.gen = true; o.plus = e.plus; o.vtext = si(e.amp, "V") + " · " + si(e.freq, "Hz"); break;
        case "LED": o.type = "V"; o.led = true; o.plus = e.plus; o.value = S.LED_VF[e.color]; o.vtext = LEDC[e.color][0]; break;
        case "LAMP": o.type = "R"; o.lamp = true; o.value = e.vr * e.vr / e.pr; o.vtext = si(e.vr, "V") + " · " + si(e.pr, "W"); break;
        case "PIR": o.type = "V"; o.plus = e.plus; o.value = 3.3; o.vtext = lab.env.motion ? "حركة ← 3.3 V" : "ساكن ← 0 V"; break;
        case "DEP": o.type = e.dk; o.value = e.gain; o.plus = e.plus; o.dir = e.dir; o.vtext = depText(e, nm); break;
        case "SW": o.type = "W"; o.sw = true; o.closed = e.closed; o.label = nm[e.id]; break;
        case "AM": o.type = "W"; o.am = true; o.label = res && res.ok ? (res.ac && Math.abs(res.el[e.id].i) < 1e-9 ? "~" + si(Cx.abs(res.el[e.id].iac), "A") + " (عظمى)" : si(Math.abs(res.el[e.id].i) < 1e-9 ? 0 : res.el[e.id].i, "A")) : ""; break;
      }
      return o;
    });
    return { rows: ROWS, cols: COLS, edges: edges, showGround: true, ground: lab.arduino ? S.PINS.GND : lab.ground };
  }

  /* ---------- solve ---------- */
  var dirty = true;
  function solveNow() { if (!dirty) return res; res = S.solve(lab, lab.arduino ? pins : null); dirty = false; return res; }
  function changed(full) { dirty = true; save(); schedule(full !== false); }
  var rafId = 0, needFull = false;
  function schedule(full) { needFull = needFull || full; if (!rafId) rafId = requestAnimationFrame(function () { rafId = 0; solveNow(); if (needFull) { renderCanvas(); renderInspector(); } else renderCanvas(); needFull = false; renderReadouts(); }); }

  /* ---------- canvas ---------- */
  var W = D.PAD_X * 2 + (COLS - 1) * D.GAP_X, H = D.PAD_Y * 2 + (ROWS - 1) * D.GAP_Y + 8;
  function P(p) { return D.pt(p); }
  function f(n) { return Math.round(n * 10) / 10; }
  function edgeAt(a, b) { return lab.edges.filter(function (e) { return (sameP(e.a, a) && sameP(e.b, b)) || (sameP(e.a, b) && sameP(e.b, a)); })[0]; }
  function sameP(x, y) { return x && y && x[0] === y[0] && x[1] === y[1]; }
  function renderCanvas() {
    var sc = D.render(display(), { aria: "الدائرة في المعمل" }), inner = sc.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    var o = '<svg class="lab-svg" viewBox="0 0 ' + W + ' ' + H + '" role="application" aria-label="لوحة بناء الدائرة">';
    if (lab.arduino) {
      o += '<rect class="ard-board" x="6" y="' + (P([0, 0])[1] - 40) + '" width="70" height="' + ((ROWS - 1) * D.GAP_Y + 80) + '" rx="10"/><text class="ard-title" x="41" y="' + (P([0, 0])[1] - 22) + '" text-anchor="middle">UNO</text>';
      var on13 = pins[13] && pins[13].mode === "OUTPUT" && (pins[13].pwm != null ? pins[13].pwm > 0 : pins[13].out);
      o += '<circle cx="24" cy="' + (P([ROWS - 1, 0])[1] + 26) + '" r="5" class="ard-l' + (on13 ? " on" : "") + '"/><text class="ard-pin" x="34" y="' + (P([ROWS - 1, 0])[1] + 30) + '">L</text>';
      Object.keys(S.PINS).forEach(function (nm) { var p = P(S.PINS[nm]); o += '<line class="ard-lead" x1="76" y1="' + p[1] + '" x2="' + p[0] + '" y2="' + p[1] + '"/><text class="ard-pin" x="70" y="' + (p[1] - 6) + '" text-anchor="end">' + nm + (nm === "D9" ? "~" : "") + '</text>'; });
    }
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) { var q = P([r, c]); o += '<circle class="lab-dot" cx="' + q[0] + '" cy="' + q[1] + '" r="3"/>'; }
    o += inner;
    // LED glow
    if (res && res.ok) lab.edges.forEach(function (e) {
      if (e.k === "LAMP") { var xl = res.el[e.id], Al = P(e.a), Bl = P(e.b), ml = [(Al[0] + Bl[0]) / 2, (Al[1] + Bl[1]) / 2], kl = Math.max(0, Math.min(1.2, xl.p / e.pr)); if (kl > 0.02) o += '<circle cx="' + f(ml[0]) + '" cy="' + f(ml[1]) + '" r="' + f(18 + 30 * kl) + '" fill="#ffc94a" opacity="' + Math.min(0.75, 0.15 + 0.55 * kl).toFixed(2) + '" class="lab-glow"/>'; return; }
      if (e.k !== "LED") return; var x = res.el[e.id], A = P(e.a), B = P(e.b), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
      var k = Math.max(0, Math.min(1, x.i / 0.015));
      if (x.on && k > 0.01) o += '<circle cx="' + f(m[0]) + '" cy="' + f(m[1]) + '" r="' + f(16 + 22 * k) + '" fill="' + LEDC[e.color][1] + '" opacity="' + (0.18 + 0.5 * k).toFixed(2) + '" class="lab-glow"/>';
      if (x.i > 0.03) o += '<text class="lab-burn" x="' + f(m[0] + 26) + '" y="' + f(m[1] - 22) + '">⚠</text>';
    });
    // current flow (conventional direction), animated in flowFrame()
    if (showFlow && res && res.ok) {
      o += '<g class="flow">';
      lab.edges.forEach(function (e) {
        var x = res.el[e.id]; if (!x) return;
        var dcI = x.i || 0, acI = res.ac && x.iac ? x.iac : null, amp = acI ? Cx.abs(acI) : 0;
        if (Math.abs(dcI) < 1e-6 && amp < 1e-6) return;
        var A = P(e.a), B = P(e.b);
        o += '<path class="flow-dot" d="M' + A[0] + ' ' + A[1] + ' L' + B[0] + ' ' + B[1] + '" data-dc="' + dcI + '" data-amp="' + amp + '" data-ph="' + (acI ? Cx.arg(acI) : 0) + '"/>';
      });
      o += '</g>';
    }
    // hotspots
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) {
      [[r, c + 1], [r + 1, c]].forEach(function (b) {
        if (b[0] >= ROWS || b[1] >= COLS) return;
        if (lab.arduino && c === 0 && b[1] === 0) return; // no parts between Arduino pins
        var A = P([r, c]), B = P(b), hz = b[0] === r, e = edgeAt([r, c], b), isSel = e && sel === e.id;
        var x = hz ? A[0] + 18 : A[0] - 26, y = hz ? A[1] - 26 : A[1] + 18, w = hz ? B[0] - A[0] - 36 : 52, h = hz ? 52 : B[1] - A[1] - 36;
        o += '<rect class="lab-hit' + (e ? " has" : "") + (isSel ? " sel" : "") + '" data-a="' + r + ',' + c + '" data-b="' + b[0] + ',' + b[1] + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10"/>';
      });
    }
    var nodeTool = tool === "VM" || tool === "SC" || tool === "GND";
    for (r = 0; r < ROWS; r++) for (c = 0; c < COLS; c++) { var q2 = P([r, c]); o += '<circle class="lab-node' + (nodeTool ? " on" : "") + '" data-p="' + r + ',' + c + '" cx="' + q2[0] + '" cy="' + q2[1] + '" r="15"/>'; }
    // probes
    var pr = lab.probes;
    [["vp", "V+", "#e0312f"], ["vn", "V−", "#9aa3b2"], ["ch1", "CH1", "#e8b400"], ["ch2", "CH2", "#3b8bff"]].forEach(function (x, i) {
      var p = pr[x[0]]; if (!p) return; var q3 = P(p), dx = i % 2 ? 16 : -16, dy = i < 2 ? -22 : 26;
      o += '<g class="lab-probe"><circle cx="' + q3[0] + '" cy="' + q3[1] + '" r="7" fill="' + x[2] + '"/><text x="' + (q3[0] + dx) + '" y="' + (q3[1] + dy) + '" text-anchor="middle" fill="' + x[2] + '">' + x[1] + '</text></g>';
    });
    o += "</svg>";
    $("lab-canvas").innerHTML = o;
  }

  /* ---------- canvas interaction ---------- */
  function parseP(s) { return s.split(",").map(Number); }
  function onCanvas(ev) {
    var t = ev.target;
    var hit = t.closest && t.closest(".lab-hit"), node = t.closest && t.closest(".lab-node");
    if ((tool === "VM" || tool === "SC" || tool === "GND") && node) { probeClick(parseP(node.dataset.p)); return; }
    if (!hit) { if (tool === "select") { sel = null; schedule(true); } return; }
    var a = parseP(hit.dataset.a), b = parseP(hit.dataset.b), e = edgeAt(a, b);
    if (tool === "select") {
      if (!e) { sel = null; schedule(true); return; }
      sel = e.id; if (e.k === "SW") { e.closed = !e.closed; changed(); return; } schedule(true); return;
    }
    if (tool === "DEL") { if (e) { lab.edges = lab.edges.filter(function (x) { return x !== e; }); if (sel === e.id) sel = null; changed(); } return; }
    if (KIND[tool]) {
      var spec = KIND[tool], k = spec.base || tool, ne = { id: "e" + (nextId++), k: k, a: a, b: b }, d = spec.def || {};
      for (var q in d) ne[q] = d[q];
      if (e) lab.edges = lab.edges.filter(function (x) { return x !== e; });
      lab.edges.push(ne); sel = ne.id; changed();
    }
  }
  function probeClick(p) {
    var pr = lab.probes;
    if (tool === "GND") { if (lab.arduino) { flash("مع تشغيل Arduino يكون الأرضي هو منفذ GND."); return; } lab.ground = p; changed(); return; }
    if (tool === "VM") { if (!pr.vp || pr.vn) { pr.vp = p; pr.vn = null; } else pr.vn = p; }
    if (tool === "SC") { if (!pr.ch1 || pr.ch2) { pr.ch1 = p; pr.ch2 = null; } else pr.ch2 = p; scopeBuf = []; }
    changed();
  }
  function flash(msg) { var el = $("lab-flash"); el.textContent = msg; el.hidden = false; clearTimeout(flash.t); flash.t = setTimeout(function () { el.hidden = true; }, 3500); }

  /* ---------- inspector ---------- */
  var PREF = { p: 1e-12, n: 1e-9, u: 1e-6, "µ": 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6 };
  function parseSI(s) {
    s = String(s).trim().replace(/,/g, ".").replace(/[ΩVAFHzh\s]/g, "");
    var m = /^(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKM]?)$/.exec(s); if (!m) return NaN;
    return parseFloat(m[1]) * (PREF[m[2]] || 1);
  }
  function field(id, label, val, unit) { return '<div class="field"><label for="' + id + '">' + label + '</label><div class="pb-row"><input class="input" id="' + id + '" value="' + (val === undefined ? "" : si(val, "").trim()) + '" dir="ltr" inputmode="decimal" autocomplete="off"><span class="unit">' + unit + '</span></div></div>'; }
  function renderInspector() {
    var box = $("lab-insp"), e = lab.edges.filter(function (x) { return x.id === sel; })[0];
    if (!e) { box.innerHTML = '<p class="muted">اختر أداة ثم انقر بين نقطتين لوضع عنصر. بأداة <b>التحديد</b> انقر عنصرًا لتعديل قيمته وقراءة جهده وتياره.</p>'; return; }
    var nm = names()[e.id] || "", h = '<div class="insp-h"><b>' + kindName(e) + '</b><span class="ltr mono">' + nm + '</span></div><div class="insp-f">';
    if (e.k === "R" || e.k === "C" || e.k === "L") h += field("f-value", "القيمة", e.value, { R: "Ω", C: "F", L: "H" }[e.k]);
    if (e.k === "V") h += field("f-value", "الجهد", e.value, "V");
    if (e.k === "I") h += field("f-value", "التيار", e.value, "A");
    if (e.k === "GEN") h += field("f-amp", "القيمة العظمى", e.amp, "V") + field("f-freq", "التردد", e.freq, "Hz") + field("f-rs", "المقاومة الداخلية", e.rs, "Ω") + '<div class="field"><label for="f-phase">الطور (درجات)</label><div class="pb-row"><input class="input" id="f-phase" value="' + (e.phase || 0) + '" dir="ltr" inputmode="decimal"><span class="unit">°</span></div></div>';
    if (e.k === "LDR") h += field("f-rlight", "في الضوء الكامل", e.rlight, "Ω") + field("f-rdark", "في الظلام", e.rdark, "Ω");
    if (e.k === "LAMP") h += field("f-vr", "الجهد المقنن", e.vr, "V") + field("f-pr", "القدرة المقننة", e.pr, "W") + '<p class="muted" style="margin:0;font-size:13px">نمثّلها بمقاومة ثابتة <span class="ltr">R = V²/P = ' + si(e.vr * e.vr / e.pr, "Ω") + '</span> (مقاومة الفتيل الحقيقية أقل وهي باردة).</p>';
    if (e.k === "PIR") h += '<p class="muted" style="margin:0;font-size:13px">يكشف الحركة في المشهد أسفل اللوحة: يعطي 3.3 V على طرفه الموجب (OUT) عند الحركة ويبقى 2 ثانية بعدها، وإلا 0 V. التغذية مفترضة.</p>';
    if (e.k === "NTC") h += field("f-r25", "R عند 25°C", e.r25, "Ω") + field("f-beta", "B", e.beta, "K");
    if (e.k === "DEP") {
      var nmd = names(), ctl = lab.edges.filter(function (x) { return CTRL_K[x.k]; });
      h += '<div class="field"><label for="f-dk">النوع</label><select class="select" id="f-dk">' + Object.keys(DEPK).map(function (k) { return '<option value="' + k + '"' + (k === e.dk ? " selected" : "") + '>' + DEPK[k][1] + ' — ' + DEPK[k][0] + '</option>'; }).join("") + '</select></div>' +
        '<div class="field"><label for="f-ctrl">عنصر التحكم</label><select class="select" id="f-ctrl"><option value="">— اختر مقاومة —</option>' + ctl.map(function (x) { return '<option value="' + x.id + '"' + (x.id === e.ctrl ? " selected" : "") + '>' + nmd[x.id] + ' (' + KIND[x.k].ar + ')</option>'; }).join("") + '</select></div>' +
        '<div class="field"><label for="f-gain">الثابت</label><div class="pb-row"><input class="input" id="f-gain" value="' + CV.num(e.gain) + '" dir="ltr" inputmode="decimal" autocomplete="off"><span class="unit">' + DEPK[e.dk][2] + '</span></div></div>' +
        '<p class="muted" style="margin:0;font-size:13px">' + (DEPK[e.dk][3] === "i" ? "التحكم = تيار عنصر التحكم من طرفه a إلى b (أعلى/يسار ← أسفل/يمين)." : "التحكم = جهد عنصر التحكم v<sub>ab</sub> (طرفه a ناقص طرفه b).") + ' القيمة الآن: <span class="ltr">' + depText(e, nmd) + '</span></p>';
    }
    if (e.k === "LED") h += '<div class="field"><label for="f-color">اللون</label><select class="select" id="f-color">' + Object.keys(LEDC).map(function (c) { return '<option value="' + c + '"' + (c === e.color ? " selected" : "") + '>' + LEDC[c][0] + ' (V<sub>f</sub> ≈ ' + S.LED_VF[c] + ' V)</option>'; }).join("") + '</select></div>';
    h += '</div><div class="insp-b">';
    if (e.k === "V" || e.k === "LED" || e.k === "GEN" || e.k === "PIR") h += '<button type="button" class="btn btn-ghost btn-sm" data-act="flip">اعكس القطبية</button>';
    if (e.k === "I" || (e.k === "DEP" && /CS$/.test(e.dk))) h += '<button type="button" class="btn btn-ghost btn-sm" data-act="flip">اعكس الاتجاه</button>';
    if (e.k === "DEP" && /VS$/.test(e.dk)) h += '<button type="button" class="btn btn-ghost btn-sm" data-act="flip">اعكس القطبية</button>';
    if (e.k === "SW") h += '<button type="button" class="btn btn-ghost btn-sm" data-act="toggle">' + (e.closed ? "افتح المفتاح" : "اضغط المفتاح") + '</button>';
    h += '<button type="button" class="btn btn-ghost btn-sm danger" data-act="del">احذف</button></div><dl class="rd" id="insp-rd"></dl>';
    box.innerHTML = h;
    box.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("change", function () {
        var v = parseSI(inp.value), k = inp.id.slice(2);
        if (k === "gain") { v = parseSI(inp.value); if (!isFinite(v) || v === 0) { inp.classList.add("bad"); return; } inp.classList.remove("bad"); e.gain = v; changed(); return; }
        if (k === "phase") { v = parseFloat(inp.value); if (!isFinite(v)) { inp.classList.add("bad"); return; } inp.classList.remove("bad"); e.phase = v; changed(); return; }
        if (!(v > 0) && !(k === "value" && (e.k === "V" || e.k === "I") && v === 0)) { inp.classList.add("bad"); return; }
        inp.classList.remove("bad"); e[k] = v; changed();
      });
    });
    var cs = $("f-color"); if (cs) cs.addEventListener("change", function () { e.color = cs.value; changed(); });
    var dk = $("f-dk"); if (dk) dk.addEventListener("change", function () { e.dk = dk.value; changed(); });
    var ct = $("f-ctrl"); if (ct) ct.addEventListener("change", function () { e.ctrl = ct.value || null; changed(); });
    box.querySelectorAll("[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.dataset.act;
        if (a === "flip") { if (e.k === "I" || (e.k === "DEP" && /CS$/.test(e.dk))) e.dir = e.dir === "ab" ? "ba" : "ab"; else e.plus = e.plus === "b" ? "a" : "b"; }
        if (a === "toggle") e.closed = !e.closed;
        if (a === "del") { lab.edges = lab.edges.filter(function (x) { return x !== e; }); sel = null; }
        changed();
      });
    });
  }
  function rows(list) { return list.map(function (x) { return '<div class="rw"><dt>' + x[0] + '</dt><dd class="ltr mono">' + x[1] + '</dd></div>'; }).join(""); }
  function clean(v) { return Math.abs(v) < 1e-9 ? 0 : v; }
  var hooks = [];
  function renderReadouts() {
    try { _renderReadouts(); } finally { hooks.forEach(function (f) { try { f(lab, res); } catch (e) { if (window.console) console.error(e); } }); }
  }
  function _renderReadouts() {
    // status / warnings
    var st = $("lab-status");
    if (!res || !res.ok) {
      st.innerHTML = '<p class="lab-err">' + (res && res.error === "short" ? "قصر كهربائي: طرفا مصدر جهد موصولان مباشرة بسلك. في الواقع يسحب تيارًا كبيرًا جدًا." : res && res.error === "ctrl" ? "مصدر تابع بلا عنصر تحكم: حدده بأداة التحديد واختر مقاومة التحكم من القائمة (ولا تكون مقصورة بسلك أو محذوفة)." : "لا يمكن حل الدائرة بهذا الشكل: غالبًا مصدرا جهد على التوازي بقيمتين مختلفتين، أو حلقة من مصادر الجهد.") + '</p>';
    } else {
      var w = res.warn.slice(), hv = false;
      for (var r = 0; r < ROWS && !hv; r++) for (var c = 0; c < COLS; c++) if (Math.abs(res.dcV([r, c])) > 1000) { hv = true; break; }
      if (hv) w.push("⚠ جهد كبير جدًا في الدائرة: غالبًا مصدر تيار بلا مسار مغلق.");
      st.innerHTML = w.length ? '<ul class="lab-warn">' + w.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>' : '<p class="muted">✓ الدائرة محلولة' + (res.ac ? " (تيار مستمر + إشارة " + si(res.ac.f, "Hz") + ")" : "") + '.</p>';
    }
    // inspector readings
    var e = lab.edges.filter(function (x) { return x.id === sel; })[0], rd = $("insp-rd");
    if (rd) {
      if (!e || !res || !res.ok) rd.innerHTML = "";
      else {
        var x = res.el[e.id], L = [];
        if (e.k !== "W") {
          L.push(["الجهد v<sub>ab</sub> (DC)", si(clean(x.v), "V")], ["التيار a→b (DC)", si(clean(x.i), "A")], ["القدرة الممتصة", si(clean(x.p), "W")]);
          if (x.r) L.push(["المقاومة الآن", si(x.r, "Ω")]);
          if (e.k === "LED") L.push(["الحالة", x.on && x.i > 1e-6 ? "مضيء" : "مطفأ"]);
          if (res.ac) {
            var Sx = Cx.scale(Cx.mul(x.vac, Cx.conj(x.iac)), 0.5);
            L.push(["الإشارة: V (قيمة عظمى)", CV.ac.polar(x.vac, "V")], ["الإشارة: I (قيمة عظمى)", CV.ac.polar(x.iac, "A")]);
            if (e.k !== "W" && e.k !== "AM" && e.k !== "SW") L.push(["P المتوسطة الممتصة (واطميتر)", si(clean(Sx.re), "W")], ["Q الردية الممتصة", si(clean(Sx.im), "VAR")]);
          }
        }
        rd.innerHTML = rows(L);
      }
    }
    // voltmeter
    var pr = lab.probes, vm = $("lab-vm");
    if (!pr.vp || !pr.vn) vm.innerHTML = '<p class="muted">اختر <b>فولتميتر</b> ثم انقر نقطة المجس الأحمر ثم الأسود.</p>';
    else if (res && res.ok) {
      var vdc = res.dcV(pr.vp) - res.dcV(pr.vn), L2 = [["V DC", si(clean(vdc), "V")]];
      if (res.ac) { var va = Cx.sub(res.acV(pr.vp), res.acV(pr.vn)); L2.push(["V AC (rms)", si(Cx.abs(va) / Math.SQRT2, "V")], ["V AC (قيمة عظمى، طور)", CV.ac.polar(va, "V")]); }
      vm.innerHTML = '<dl class="rd">' + rows(L2) + '</dl>';
    }
    // pins
    if (lab.arduino && res && res.ok) {
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

  /* ---------- oscilloscope ---------- */
  var scopeBuf = [], scopeT0 = performance.now();
  function scopeFrame() {
    var cv = $("lab-scope"); if (!cv) return;
    var ctx = cv.getContext("2d"), Wc = cv.width, Hc = cv.height, pr = lab.probes, css = getComputedStyle(document.documentElement);
    ctx.clearRect(0, 0, Wc, Hc);
    ctx.fillStyle = "#0b1220"; ctx.fillRect(0, 0, Wc, Hc);
    ctx.strokeStyle = "rgba(140,170,220,.18)"; ctx.lineWidth = 1;
    for (var i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * Wc / 10, 0); ctx.lineTo(i * Wc / 10, Hc); ctx.stroke(); }
    for (i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, i * Hc / 8); ctx.lineTo(Wc, i * Hc / 8); ctx.stroke(); }
    ctx.strokeStyle = "rgba(140,170,220,.45)"; ctx.beginPath(); ctx.moveTo(0, Hc / 2); ctx.lineTo(Wc, Hc / 2); ctx.stroke();
    var info = $("scope-info"), chans = [["ch1", "#e8b400"], ["ch2", "#3b8bff"]].filter(function (c) { return pr[c[0]]; });
    if (!chans.length || !res || !res.ok) { info.textContent = chans.length ? "" : "اختر أوسيلوسكوب ثم انقر نقطة CH1 (ونقطة CH2 اختياريًا). القياس بالنسبة للأرضي."; return; }
    var series = [], span, unit;
    if (res.ac) {
      span = 2 / res.ac.f;
      chans.forEach(function (c) { var pts = []; for (var j = 0; j <= 300; j++) { var t = j / 300 * span; pts.push(S.vAt(res, pr[c[0]], t)); } series.push([c, pts]); });
      unit = "الزمن: " + si(span / 10, "s") + "/div";
    } else {
      var now = (performance.now() - scopeT0) / 1000, sample = chans.map(function (c) { return res.dcV(pr[c[0]]); });
      scopeBuf.push([now, sample]); span = 4; while (scopeBuf.length && scopeBuf[0][0] < now - span) scopeBuf.shift();
      chans.forEach(function (c, k) { series.push([c, scopeBuf.map(function (s) { return [s[0] - (now - span), s[1][k]]; })]); });
      unit = "الزمن: " + si(span / 10, "s") + "/div (عرض مستمر)";
    }
    var mx = 0; series.forEach(function (s) { s[1].forEach(function (v) { mx = Math.max(mx, Math.abs(Array.isArray(v) ? v[1] : v)); }); });
    var steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50], vdiv = steps.filter(function (s) { return s * 4 >= mx * 1.05; })[0] || 50;
    series.forEach(function (s) {
      ctx.strokeStyle = s[0][1]; ctx.lineWidth = 2; ctx.beginPath();
      s[1].forEach(function (v, j) {
        var x = Array.isArray(v) ? v[0] / span * Wc : j / (s[1].length - 1) * Wc, y = Hc / 2 - (Array.isArray(v) ? v[1] : v) / (vdiv * 4) * (Hc / 2);
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    info.textContent = unit + " · الجهد: " + si(vdiv, "V") + "/div";
  }
  var flowOff = 0, lastT = performance.now();
  function flowFrame(now) {
    var dt = Math.min(0.1, (now - lastT) / 1000); lastT = now;
    var paths = document.querySelectorAll("#lab-canvas .flow-dot");
    paths.forEach(function (pth) {
      var dc = +pth.dataset.dc, amp = +pth.dataset.amp, ph = +pth.dataset.ph, t = now / 1000;
      var i = dc + (amp ? amp * Math.cos(2 * Math.PI * 0.5 * t + ph * Math.PI / 180) : 0); // AC slowed to 0.5 Hz so the eye can follow it
      var mag = Math.abs(i), sp = mag < 1e-7 ? 0 : Math.max(12, Math.min(140, 30 + 22 * Math.log10(mag / 1e-6)));
      var off = (+pth.dataset.off || 0) - Math.sign(i) * sp * dt;
      pth.dataset.off = off; pth.style.strokeDashoffset = off;
      pth.style.opacity = mag < 1e-7 ? 0.15 : 0.9;
    });
  }
  function animate(now) { if (lab.probes.ch1 || lab.probes.ch2) scopeFrame(); if (showFlow) flowFrame(now || performance.now()); sceneFrame(now || performance.now()); requestAnimationFrame(animate); }

  /* ---------- motion scene for the PIR sensor ---------- */
  var scene = { x: 60, auto: false, dir: 1, drag: false, hist: [], last: -1e9, hold: 2000, range: [230, 620] };
  function hasPIR() { return lab.edges.some(function (e) { return e.k === "PIR"; }); }
  function sceneFrame(now) {
    var card = $("scene-card"), want = hasPIR(); if (card.hidden === want) card.hidden = !want;
    if (!want) { if (lab.env.motion) { lab.env.motion = false; dirty = true; schedule(true); } return; }
    var cv = $("lab-scene"), ctx = cv.getContext("2d"), Wc = cv.width, Hc = cv.height;
    if (scene.auto && !scene.drag) { scene.x += scene.dir * 140 / 60; if (scene.x > 590) scene.dir = -1; if (scene.x < 40) scene.dir = 1; }
    scene.hist.push([now, scene.x]); while (scene.hist.length && scene.hist[0][0] < now - 150) scene.hist.shift();
    var moved = Math.abs(scene.hist[scene.hist.length - 1][1] - scene.hist[0][1]) > 3, inZone = scene.x >= scene.range[0] && scene.x <= scene.range[1];
    if (moved && inZone) scene.last = now;
    var out = now - scene.last < scene.hold;
    if (out !== !!lab.env.motion) { lab.env.motion = out; dirty = true; schedule(true); }
    // draw
    ctx.clearRect(0, 0, Wc, Hc);
    ctx.fillStyle = "#101a2c"; ctx.fillRect(0, 0, Wc, Hc);
    ctx.fillStyle = "#1b2840"; ctx.fillRect(0, Hc - 30, Wc, 30);
    ctx.fillStyle = out ? "rgba(255,90,90,.16)" : "rgba(120,170,255,.08)";
    ctx.beginPath(); ctx.moveTo(Wc - 18, 40); ctx.lineTo(scene.range[0], Hc - 30); ctx.lineTo(Wc - 18, Hc - 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = out ? "rgba(255,110,110,.6)" : "rgba(120,170,255,.35)"; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(Wc - 18, 40); ctx.lineTo(scene.range[0], Hc - 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#dfe6f2"; ctx.fillRect(Wc - 16, 26, 12, 28);
    ctx.beginPath(); ctx.arc(Wc - 16, 40, 9, Math.PI / 2, Math.PI * 1.5); ctx.fillStyle = out ? "#ff6b6b" : "#f3f5f8"; ctx.fill();
    if (out) { ctx.shadowColor = "#ff6b6b"; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0; }
    ctx.fillStyle = "#9fb0cc"; ctx.font = "12px system-ui"; ctx.textAlign = "right"; ctx.fillText("PIR", Wc - 24, 22);
    // person
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
        onPins: function (p) { pins = p; dirty = true; schedule(false); },
        onSerial: serial,
        readV: function (n) { solveNow(); return res && res.ok ? res.dcV(S.PINS[n]) : 0; }
      });
    } catch (e) { showErr(e.message); return; }
    setRun(true);
    var me = runner;
    runner.done.then(function (r) { if (runner !== me) return; runner = null; setRun(false); if (r && r.error) showErr(r.error); });
  }
  function stopSketch() { if (runner) { var r = runner; runner = null; r.stop(); } pins = {}; dirty = true; setRun(false); schedule(true); }
  function showErr(m) { var el = $("ard-err"); el.textContent = m; el.hidden = false; }

  /* ---------- page ---------- */
  function setArduino(on) {
    if (on === lab.arduino) return;
    if (on) {
      var clash = lab.edges.filter(function (e) { return e.a[1] === 0 && e.b[1] === 0; });
      if (clash.length) { lab.edges = lab.edges.filter(function (e) { return clash.indexOf(e) < 0; }); flash("حُذفت عناصر كانت بين منافذ Arduino في العمود الأول."); }
    } else stopSketch();
    lab.arduino = on; $("ard-panel").hidden = !on; $("ard-toggle").setAttribute("aria-pressed", on); changed();
  }
  function reid(L) { var m = {}; L.edges.forEach(function (e) { var n = "e" + (nextId++); m[e.id] = n; e.id = n; }); L.edges.forEach(function (e) { if (e.ctrl) e.ctrl = m[e.ctrl] || null; }); }
  function loadExample(id) {
    var x = EX[id]; if (!x) return;
    if (runner) stopSketch();
    undo = { lab: JSON.parse(JSON.stringify(lab)), code: code };
    lab = JSON.parse(JSON.stringify(x.lab)); if (x.code) code = x.code;
    reid(lab);
    sel = null; scopeBuf = []; syncUI(); changed();
    flash("حُمّل: " + x.name + (x.code ? " — اضغط تشغيل لتشغيل الكود." : ""));
    $("lab-undo").hidden = false;
  }
  function loadLab(obj, name) {
    if (runner) stopSketch();
    undo = { lab: JSON.parse(JSON.stringify(lab)), code: code };
    lab = JSON.parse(JSON.stringify(obj)); reid(lab);
    sel = null; scopeBuf = []; syncUI(); changed(); $("lab-undo").hidden = false; if (name) flash("حُمّلت: " + name);
  }
  CV.lab = { state: function () { return lab; }, result: function () { solveNow(); return res; }, load: loadLab, onUpdate: function (f) { hooks.push(f); }, changed: changed,
    names: function () { return names(); } };
  function syncUI() {
    $("ard-panel").hidden = !lab.arduino; $("ard-toggle").setAttribute("aria-pressed", lab.arduino);
    $("ard-code").value = code; $("env-light").value = lab.env.light; $("env-temp").value = lab.env.temp;
    $("env-light-o").textContent = lab.env.light + "%"; $("env-temp-o").textContent = lab.env.temp + "°C";
  }
  function init() {
    load();
    $("lab-tools").innerHTML = TOOLS.map(function (t) { return '<button type="button" class="tl' + (t[0] === tool ? " on" : "") + '" data-tool="' + t[0] + '" aria-pressed="' + (t[0] === tool) + '">' + t[1] + '</button>'; }).join("");
    $("lab-tools").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-tool]"); if (!b) return; tool = b.dataset.tool;
      $("lab-tools").querySelectorAll(".tl").forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
      $("lab-hint").innerHTML = HINT[tool] || ""; schedule(true);
    });
    $("lab-ex").innerHTML = '<option value="">أمثلة جاهزة…</option>' + Object.keys(EX).map(function (k) { return '<option value="' + k + '">' + EX[k].name + '</option>'; }).join("");
    $("lab-ex").addEventListener("change", function () { loadExample(this.value); this.value = ""; });
    $("lab-clear").addEventListener("click", function () { if (runner) stopSketch(); undo = { lab: JSON.parse(JSON.stringify(lab)), code: code }; var a = lab.arduino; lab = blank(); lab.arduino = a; sel = null; syncUI(); changed(); $("lab-undo").hidden = false; });
    $("lab-undo").addEventListener("click", function () { if (!undo) return; if (runner) stopSketch(); lab = undo.lab; code = undo.code; undo = null; sel = null; syncUI(); changed(); this.hidden = true; });
    $("ard-toggle").addEventListener("click", function () { setArduino(!lab.arduino); });
    $("flow-toggle").setAttribute("aria-pressed", showFlow);
    $("flow-toggle").addEventListener("click", function () { showFlow = !showFlow; this.setAttribute("aria-pressed", showFlow); schedule(true); });
    lab.env.motion = false; sceneInit();
    $("lab-canvas").addEventListener("click", onCanvas);
    $("env-light").addEventListener("input", function () { lab.env.light = +this.value; $("env-light-o").textContent = this.value + "%"; changed(false); });
    $("env-temp").addEventListener("input", function () { lab.env.temp = +this.value; $("env-temp-o").textContent = this.value + "°C"; changed(false); });
    $("ard-run").addEventListener("click", startSketch);
    $("ard-stop").addEventListener("click", stopSketch);
    $("ard-code").addEventListener("input", function () { code = this.value; save(); });
    $("ard-code").addEventListener("keydown", function (e) { if (e.key === "Tab") { e.preventDefault(); var s = this.selectionStart; this.setRangeText("  ", s, this.selectionEnd, "end"); } });
    $("ard-clear").addEventListener("click", function () { serialBuf = ""; serial(""); });
    syncUI();
    var h = location.hash.replace("#", "").replace(/^ex-/, ""); if (EX[h]) loadExample(h);
    window.addEventListener("hashchange", function () { var k = location.hash.replace("#", "").replace(/^ex-/, ""); if (EX[k]) loadExample(k); });
    $("lab-hint").innerHTML = HINT[tool];
    changed(); requestAnimationFrame(animate);
  }
  var HINT = {
    select: "انقر عنصرًا لتعديله وقراءة قيمه. النقر على المفتاح يضغطه أو يفتحه.",
    W: "انقر بين نقطتين متجاورتين لوضع سلك.", DEL: "انقر عنصرًا لحذفه.",
    VM: "انقر نقطة المجس الأحمر (V+)، ثم نقطة المجس الأسود (V−).", SC: "انقر نقطة CH1، ثم CH2 (اختياري). القناتان بالنسبة للأرضي.",
    GND: "انقر نقطة لتصبح الأرضي (0 V).", AM: "ضع الأميتر على التوالي مكان سلك؛ يقرأ التيار من a (أعلى/يسار) إلى b."
  };
  Object.keys(KIND).forEach(function (k) { if (!HINT[k]) HINT[k] = "انقر بين نقطتين متجاورتين لوضع " + KIND[k].ar + "."; });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
