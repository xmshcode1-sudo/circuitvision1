/* CircuitVision — Arduino Uno sketch simulator (a supported subset of Arduino C++).
   The sketch is translated to JavaScript and run in the page, with delay() as real waiting time.
   Supported: setup()/loop(), your own functions, int/long/float/bool/byte/String variables, arrays with { … },
   if/else, for, while, do-while, switch, #define, and the Arduino calls listed in API_NAMES.
   Pins in this lab: 2, 9 (PWM), 13 (LED_BUILTIN), A0, A1. Integer variables truncate on assignment like C.
   Not supported: pointers, classes/structs, libraries (#include), interrupts, Serial input. */
(function (root) {
  "use strict";
  var TYPES = "unsigned\\s+long|unsigned\\s+int|unsigned\\s+char|long\\s+long|int|long|float|double|bool|boolean|byte|char|word|short|String|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|size_t|void";
  var INT_TYPES = /^(unsigned\s+long|unsigned\s+int|unsigned\s+char|long\s+long|int|long|byte|char|word|short|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|size_t)$/;
  var API_NAMES = ["pinMode", "digitalWrite", "digitalRead", "analogRead", "analogWrite", "millis", "micros", "map", "constrain", "abs", "min", "max", "pow", "sqrt", "sin", "cos", "tan", "random", "randomSeed", "__delay", "__delayUs", "__tick", "__int", "Serial", "HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP", "LED_BUILTIN", "A0", "A1", "PI", "DEC", "HEX", "BIN", "round", "floor", "ceil", "sq", "isnan"];

  function SketchError(msg, line) { this.message = msg; this.line = line; }

  function translate(src) {
    var strs = [], out = src.replace(/\r/g, "");
    // protect string and char literals
    out = out.replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])'/g, function (m) { strs.push(m); return "__S" + (strs.length - 1) + "__"; });
    out = out.replace(/\/\*[\s\S]*?\*\//g, function (m) { return m.replace(/[^\n]/g, " "); }).replace(/\/\/[^\n]*/g, "");
    if (/#include/.test(out)) throw new SketchError("المكتبات (#include) غير مدعومة في هذا المحاكي.");
    if (/\b(class|struct|template|new|delete|attachInterrupt)\b/.test(out)) throw new SketchError("هذا الكود يستخدم ميزات غير مدعومة (class / struct / المؤشرات / المقاطعات).");
    if (/\bSerial\s*\.\s*(read|available|parseInt|readString)\b/.test(out)) throw new SketchError("قراءة Serial غير مدعومة؛ الطباعة فقط (Serial.print / println).");
    out = out.replace(/^[ \t]*#define\s+(\w+)\s+([^\n]+)$/gm, "const $1 = $2;");
    var fnames = [], intVars = {}, intFns = [];
    // prototypes
    out = out.replace(new RegExp("\\b(?:static\\s+)?(?:" + TYPES + ")\\s+[A-Za-z_]\\w*\\s*\\([^)]*\\)\\s*;", "g"), "");
    // function definitions
    out = out.replace(new RegExp("\\b(?:static\\s+|inline\\s+)?(" + TYPES + ")\\s+([A-Za-z_]\\w*)\\s*\\(([^)]*)\\)\\s*\\{", "g"), function (m, rty, name, params) {
      fnames.push(name); if (INT_TYPES.test(rty.replace(/\s+/g, " "))) intFns.push(name);
      var ps = params.trim() === "" || params.trim() === "void" ? [] : params.split(",").map(function (p) {
        var t = p.trim().replace(/\[\s*\]/g, "").replace(/&/g, " "), mm = /(\w+)\s*(?:=.*)?$/.exec(t);
        var ty = t.replace(/\s*\w+\s*$/, "").replace(/\bconst\b/g, "").trim();
        if (mm && INT_TYPES.test(ty)) intVars[mm[1]] = true;
        return mm ? mm[1] : "_";
      });
      return "async function " + name + "(" + ps.join(", ") + ") {";
    });
    // arrays
    out = out.replace(new RegExp("\\b(?:const\\s+|static\\s+)*(?:" + TYPES + ")\\s+([A-Za-z_]\\w*)\\s*\\[[^\\]]*\\]\\s*=\\s*\\{([^}]*)\\}", "g"), "let $1 = [$2]");
    out = out.replace(new RegExp("\\b(?:const\\s+|static\\s+)*(?:" + TYPES + ")\\s+([A-Za-z_]\\w*)\\s*\\[\\s*(\\w+)\\s*\\]\\s*;", "g"), "let $1 = new Array($2).fill(0);");
    // variable declarations (record integer ones)
    out = out.replace(new RegExp("\\b(?:const\\s+|static\\s+|volatile\\s+)*(" + TYPES + ")\\s+(?=[A-Za-z_])([A-Za-z_]\\w*)", "g"), function (m, ty, name) {
      if (ty === "void") return m;
      if (INT_TYPES.test(ty.replace(/\s+/g, " "))) intVars[name] = true;
      return "let " + name;
    });
    // casts
    out = out.replace(/\(\s*(?:int|long|byte|unsigned\s+int|unsigned\s+long)\s*\)\s*(\((?:[^()]|\([^()]*\))*\)|[A-Za-z_]\w*(?:\([^()]*\))?|\d+(?:\.\d+)?)/g, "__int($1)");
    out = out.replace(/\(\s*(?:float|double)\s*\)\s*/g, "");
    out = out.replace(/\bint\s*\(/g, "__int(").replace(/\b(?:float|double)\s*\(/g, "Number(");
    // integer assignments truncate (C semantics)
    Object.keys(intVars).forEach(function (v) {
      out = out.replace(new RegExp("\\b" + v + "\\s*([+\\-*/%]?)=(?!=)\\s*([^;\\s][^;]*);", "g"), function (m, op, ex) { return op ? v + " = __int(" + v + " " + op + " (" + ex + "));" : v + " = __int(" + ex + ");"; });
    });
    // awaits
    fnames.forEach(function (n) { out = out.replace(new RegExp("(?<!function\\s)\\b" + n + "\\s*\\(", "g"), "await " + n + "("); });
    out = out.replace(/\bdelayMicroseconds\s*\(/g, "await __delayUs(").replace(/\bdelay\s*\(/g, "await __delay(");
    out = out.replace(/\bfor\s*\(([^;]*);([^;]*);/g, function (m, a, b) { return "for (" + a + "; (await __tick(), " + (b.trim() ? "(" + b + ")" : "true") + ");"; });
    out = out.replace(/\bwhile\s*\(/g, "while (await __tick(), ");
    out = out.replace(/__S(\d+)__/g, function (m, i) { return strs[+i]; });
    if (fnames.indexOf("setup") < 0 || fnames.indexOf("loop") < 0) throw new SketchError("الكود يحتاج الدالتين void setup() و void loop().");
    var wrap = intFns.map(function (n) { return n + " = (function (f) { return async function () { return __int(await f.apply(null, arguments)); }; })(" + n + ");"; }).join("\n");
    return { js: out + "\n" + wrap + "\nreturn { setup: setup, loop: loop };", fnames: fnames };
  }

  function Stop() {}

  /* hooks: { onPins(pins), onSerial(text), readV(pinName) -> volts } */
  function run(src, hooks) {
    var tr = translate(src), running = true, t0 = Date.now(), ticks = 0, timers = [];
    var pins = {}, seed = 12345;
    function pinName(p) {
      p = +p; if (p === 0 || p === 1) throw new SketchError("المنفذان 0 و 1 مخصصان للاتصال التسلسلي (Serial) في Uno.");
      var n = CV.labsim.PIN_NUM[p]; if (!n) throw new SketchError("المنفذ " + p + " غير متاح في هذا المعمل. المتاح: 2، 9، 13، A0، A1.");
      return p;
    }
    function changed() { hooks.onPins(JSON.parse(JSON.stringify(pins))); }
    function sleep(ms) { return new Promise(function (res, rej) { if (!running) return rej(new Stop()); var rec = { rej: rej }; rec.t = setTimeout(function () { timers.splice(timers.indexOf(rec), 1); running ? res() : rej(new Stop()); }, ms); timers.push(rec); }); }
    function fmt(v, f) {
      if (typeof v === "boolean") return v ? "1" : "0";
      if (typeof v !== "number") return String(v);
      if (f === 16) return Math.trunc(v).toString(16).toUpperCase();
      if (f === 2) return Math.trunc(v).toString(2);
      if (typeof f === "number" && f !== 10) return v.toFixed(f);
      return Number.isInteger(v) ? String(v) : v.toFixed(2);
    }
    var api = {
      HIGH: 1, LOW: 0, INPUT: "INPUT", OUTPUT: "OUTPUT", INPUT_PULLUP: "INPUT_PULLUP", LED_BUILTIN: 13, A0: 14, A1: 15, PI: Math.PI, DEC: 10, HEX: 16, BIN: 2,
      pinMode: function (p, m) { p = pinName(p); if (["INPUT", "OUTPUT", "INPUT_PULLUP"].indexOf(m) < 0) throw new SketchError("pinMode يقبل INPUT أو OUTPUT أو INPUT_PULLUP."); pins[p] = { mode: m, out: 0, pwm: null }; changed(); },
      digitalWrite: function (p, v) { p = pinName(p); var s = pins[p] || (pins[p] = { mode: "INPUT", out: 0, pwm: null }); s.out = v ? 1 : 0; s.pwm = null; changed(); },
      digitalRead: function (p) { p = pinName(p); return hooks.readV(CV.labsim.PIN_NUM[p]) >= 2.5 ? 1 : 0; },
      analogRead: function (p) { p = +p; if (p === 0 || p === 1) p += 14; if (p !== 14 && p !== 15) throw new SketchError("analogRead يعمل على A0 و A1 في هذا المعمل."); var v = hooks.readV(CV.labsim.PIN_NUM[p]); return Math.max(0, Math.min(1023, Math.round(v / 5 * 1023))); },
      analogWrite: function (p, v) {
        p = pinName(p); var s = pins[p] || (pins[p] = { mode: "OUTPUT", out: 0, pwm: null }); s.mode = "OUTPUT"; v = Math.max(0, Math.min(255, Math.round(v)));
        if (p === 9) s.pwm = v; else { s.pwm = null; s.out = v >= 128 ? 1 : 0; hooks.onSerial("", "ملاحظة: المنفذ " + p + " ليس PWM في Uno، فـ analogWrite يجعله HIGH أو LOW فقط.\n"); }
        changed();
      },
      millis: function () { return Date.now() - t0; }, micros: function () { return (Date.now() - t0) * 1000; },
      map: function (x, a, b, c, d) { return Math.trunc((x - a) * (d - c) / (b - a)) + c; },
      constrain: function (x, a, b) { return Math.max(a, Math.min(b, x)); },
      abs: Math.abs, min: Math.min, max: Math.max, pow: Math.pow, sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, round: Math.round, floor: Math.floor, ceil: Math.ceil, sq: function (x) { return x * x; }, isnan: isNaN,
      random: function (a, b) { if (b === undefined) { b = a; a = 0; } seed = (seed * 1103515245 + 12345) % 2147483648; return a + Math.floor(seed / 2147483648 * (b - a)); },
      randomSeed: function (s) { seed = Math.abs(Math.trunc(s)) || 1; },
      __int: function (x) { return Math.trunc(x); },
      __delay: function (ms) { return sleep(Math.max(0, +ms || 0)); },
      __delayUs: function (us) { return sleep(Math.max(0, us / 1000)); },
      __tick: function () { if (!running) return Promise.reject(new Stop()); if (++ticks % 5000 === 0) return sleep(0); return null; },
      Serial: {
        begin: function () {}, print: function (v, f) { hooks.onSerial(fmt(v, f)); }, println: function (v, f) { hooks.onSerial((v === undefined ? "" : fmt(v, f)) + "\n"); }
      }
    };
    var fn;
    try { fn = new Function(API_NAMES.join(","), '"use strict";\n' + tr.js); }
    catch (e) { throw new SketchError("خطأ في كتابة الكود: " + e.message); }
    var prog = fn.apply(null, API_NAMES.map(function (n) { return api[n]; }));
    var done = (async function () {
      try {
        await prog.setup();
        while (running) { await prog.loop(); await sleep(0); }
      } catch (e) {
        if (e instanceof Stop) return { stopped: true };
        return { error: e instanceof SketchError ? e.message : "خطأ أثناء التشغيل: " + (e && e.message || e) };
      }
      return { stopped: true };
    })();
    return { done: done, stop: function () { running = false; timers.forEach(function (r) { clearTimeout(r.t); r.rej(new Stop()); }); timers = []; }, pins: function () { return pins; } };
  }

  root.CV = root.CV || {};
  root.CV.arduino = { translate: translate, run: run, SketchError: SketchError };
})(typeof window !== "undefined" ? window : globalThis);
