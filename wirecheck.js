/* CircuitVision — wiring check for the lab bench.
   Looks at how the parts and the instrument leads sit on the breadboard and at the solved circuit, and names the
   mistakes students make on a real bench: a leg left in an empty column, a part shorted by its own column,
   an ammeter across an element, a voltmeter in series, a lead in the wrong meter jack, a scope probe without
   its ground clip or with its clip on a different point from the generator's ground, and parts pushed past what
   real ones take. Every message comes from the board and the solver's numbers; nothing is guessed.
   check(bench, solved, names) → [{ sev: "err"|"warn", parts: [ids], t: Arabic text }] */
(function (root) {
  "use strict";
  var CV = root.CV;
  var R_MAX_W = 0.25, LED_MAX_A = 0.03;
  function si(v, u) { return CV.num ? CV.num(v) + " " + u : (+v.toPrecision(3)) + " " + u; }
  function check(b, solved, names) {
    var B = CV.bench, c = solved.c, res = solved.res, out = [], nm = names || {};
    function name(p) { return nm[p.id] || p.tag || B.KIND[p.k].ar; }
    function hole(l) { return B.holeName(l); }
    var KEN = { R: "resistor", LED: "LED", C: "capacitor", L: "inductor", LDR: "LDR", NTC: "NTC", BAT: "battery", SW: "push button", LAMP: "lamp", PIR: "PIR sensor", AM: "panel ammeter", DEP: "dependent-source module", W: "wire" };
    function nameEn(p) { var t = nm[p.id] || p.tag; return t && !/[\u0600-\u06FF]/.test(t) ? t : "the " + (KEN[p.k] || p.k); }
    function holeEn(l) { var q = B.parse(l); if (q.kind === "hole") return q.row + q.col; if (q.kind === "rail") return "the " + (q.side === "T" ? "top " : "bottom ") + (q.pol === "+" ? "red" : "blue") + " rail " + q.col; return l; }
    function nameXEn(x) { return x.src ? (x.src.dev === "ps" ? "supply CH" + x.src.ch : x.src.dev === "fg" ? "the function generator" : "the Arduino") : nameEn(x.p); }
    function nameX(x) { return x.src ? (x.src.dev === "ps" ? "CH" + x.src.ch + " لمزود الجهد" : x.src.dev === "fg" ? "مولد الإشارة" : "Arduino") : name(x.p); }
    var u = B.connectivity(b, false);
    function netOf(l) { return u.find(B.strip(l)); }
    /* who touches each conductor (wires only join conductors, so they are not counted) */
    var at = {}, stripLegs = {};
    b.parts.forEach(function (p) {
      p.legs.forEach(function (l, i) {
        if (!l) return;
        var s = B.strip(l); (stripLegs[s] = stripLegs[s] || []).push({ p: p, i: i });
        if (p.k === "W") { if (B.parse(l).kind === "jack") { var n0 = netOf(l); (at[n0] = at[n0] || []).push({ jack: l }); } return; }
        var n = netOf(l); (at[n] = at[n] || []).push({ p: p, i: i });
      });
    });
    var usedPS = b.inst.ps.some(function (ch, i) { return ch.on && c.info.ps[i].plugged; }) || b.parts.some(function (p) { return p.k === "BAT"; }) || b.inst.fg.some(function (ch, i) { return ch.on && c.info.fg[i].plugged; }) || !!b.inst.ard;

    /* 1 · a leg (or a wire end) alone in its column */
    b.parts.forEach(function (p) {
      if (!p.legs[0] || !p.legs[1]) return;
      p.legs.forEach(function (l, i) {
        if (B.parse(l).kind === "jack") return;
        if (p.k === "W") {
          var mates = (stripLegs[B.strip(l)] || []).filter(function (x) { return x.p !== p; });
          if (!mates.length) out.push({ sev: "warn", parts: [p.id], t: "طرف السلك في " + hole(l) + " غير موصول بأي شيء: لا توجد رجل قطعة في نفس العمود.", en: "The wire end at " + holeEn(l) + " isn’t connected to anything: no part leg is in the same column." });
          return;
        }
        var list = at[netOf(l)] || [];
        var alone = function (q) { return (at[netOf(q)] || []).length === 1; };
        if (i === 0 && alone(p.legs[0]) && alone(p.legs[1]) && B.parse(p.legs[1]).kind !== "jack" && usedPS) {
          out.push({ sev: "warn", parts: [p.id], t: name(p) + " في " + hole(p.legs[0]) + " و " + hole(p.legs[1]) + " غير موصولة بشيء من الجهتين. صِل رجليها بالدائرة.", en: nameEn(p) + " at " + holeEn(p.legs[0]) + " and " + holeEn(p.legs[1]) + " isn’t connected to anything on either side. Connect its legs to the circuit." });
          return;
        }
        if (i === 1 && alone(p.legs[0]) && alone(p.legs[1]) && B.parse(p.legs[0]).kind !== "jack") return;
        if (list.length === 1 && usedPS) out.push({ sev: "warn", parts: [p.id], t: "الرجل " + (i + 1) + " لـ " + name(p) + " في " + hole(l) + " وحدها: لا شيء آخر موصول بهذا العمود، فلا يمر فيها تيار. صِلها بسلك أو انقلها إلى عمود فيه رجل قطعة أخرى.", en: "Leg " + (i + 1) + " of " + nameEn(p) + " at " + holeEn(l) + " is on its own: nothing else is connected to that column, so no current flows. Join it with a wire or move it to a column with another part’s leg." });
      });
    });

    /* 2 · the multimeters */
    b.inst.dmm.forEach(function (m, k) {
      var n = k + 1, st = c.info.dmm[k], A = /^A/.test(m.mode), Vm = /^V/.test(m.mode);
      if (st.a && st.c && !A) out.push({ sev: "warn", parts: [], t: "الملتيميتر " + n + ": السلك الأحمر في مقبس A والجهاز على وضع " + (m.mode === "OHM" ? "المقاومة" : "الجهد") + ". لقياس الجهد انقل الأحمر إلى مقبس VΩ، أو غيّر الوضع إلى A.", en: "Multimeter " + n + ": the red lead is in the A jack while the meter is set to " + (m.mode === "OHM" ? "resistance" : "voltage") + ". To measure voltage move red to the VΩ jack, or switch the mode to A." });
      if (st.v && st.c && A) out.push({ sev: "warn", parts: [], t: "الملتيميتر " + n + " على وضع التيار لكن السلك الأحمر في مقبس VΩ، فيقرأ صفرًا. لقياس التيار انقل الأحمر إلى مقبس A.", en: "Multimeter " + n + " is set to current but the red lead is in the VΩ jack, so it reads zero. To measure current move red to the A jack." });
      if ((st.v || st.a) && !st.c) out.push({ sev: "warn", parts: [], t: "الملتيميتر " + n + ": السلك الأسود غير موصول بمقبس COM. الجهاز يقيس بين طرفين.", en: "Multimeter " + n + ": the black lead isn’t in the COM jack. The meter measures between two points." });
      if (m.blown) out.push({ sev: "err", parts: [], t: "الملتيميتر " + n + ": احترق فيوز مقبس A لأن تيارًا أكبر من 10 A مرّ فيه. غالبًا الأميتر موصول على التوازي مع مصدر. صحّح التوصيل ثم ركّب فيوزًا جديدًا من الجهاز.", en: "Multimeter " + n + ": the A-jack fuse blew because more than 10 A went through it, usually an ammeter across a source. Fix the wiring, then fit a new fuse from the meter." });
      var ea = c.lab.edges.filter(function (e) { return e.id === "dmm" + n + "a"; })[0];
      if (ea) {
        var par = c.lab.edges.filter(function (e) { return e !== ea && e.k !== "W" && !/^dmm|^sc/.test(e.inst || "") && ((e.a[0] === ea.a[0] && e.b[0] === ea.b[0]) || (e.a[0] === ea.b[0] && e.b[0] === ea.a[0])); });
        if (par.length) {
          var who = par.map(function (e) { var p = b.parts.filter(function (q) { return q.id === e.id; })[0]; return p ? name(p) : e.inst === "ps" ? "CH" + e.ch + " لمزود الجهد" : e.inst === "fg" ? "مولد الإشارة" : e.id; });
          var whoEn = par.map(function (e) { var p = b.parts.filter(function (q) { return q.id === e.id; })[0]; return p ? nameEn(p) : e.inst === "ps" ? "supply CH" + e.ch : e.inst === "fg" ? "the function generator" : e.id; });
          var src = par.some(function (e) { return e.inst === "ps" || e.bat || e.k === "GEN"; });
          out.push({ sev: "err", parts: par.map(function (e) { return e.id; }), t: "الملتيميتر " + n + " موصول من مقبس A (مقاومته شبه صفر) على التوازي مع " + who.join(" و ") + "، فهو يقصّره" + (src ? " (مع مصدر: تيار كبير جدًا وقد يحترق الفيوز)" : "") + ". الأميتر يُوصل على التوالي: افصل الدائرة عند نقطة، وأدخل الأميتر في الفتحة.", en: "Multimeter " + n + " is connected through its A jack (almost zero resistance) across " + whoEn.join(" and ") + ", so it shorts it" + (src ? " (with a source: a very large current that can blow the fuse)" : "") + ". An ammeter goes in series: open the circuit at one point and put the meter in the gap." });
        }
      }
      var ev = c.lab.edges.filter(function (e) { return e.id === "dmm" + n + "v"; })[0];
      if (ev && Vm) {
        var others = function (net) { // parts, and the outputs of the supplies, generators and Arduino
          return (at[net] || []).filter(function (x) { if (x.p) return true; var j = B.JACKS[x.jack]; return j && (j.dev === "ps" || j.dev === "fg" || j.dev === "ard"); })
            .map(function (x) { if (x.p) return x; var j = B.JACKS[x.jack]; return { p: { id: j.dev + (j.ch || j.pin), k: "SRC" }, src: j }; });
        };
        var oa = others(ev.a[0]), ob = others(ev.b[0]);
        // electrically this is the same as measuring an open-circuit source, so it is named only when the loop it closes
        // holds a part that needs current to work (a LED or a lamp): then the student clearly meant a working circuit
        var load = function (x) { return x.p.k === "LED" || x.p.k === "LAMP"; };
        if (oa.length === 1 && ob.length === 1 && oa[0].p.id !== ob[0].p.id && usedPS && (load(oa[0]) || load(ob[0])))
          out.push({ sev: "warn", parts: [oa[0].p.id, ob[0].p.id], t: "الملتيميتر " + n + " على وضع الجهد موصول على التوالي بين " + nameX(oa[0]) + " و " + nameX(ob[0]) + "، فمقاومته الكبيرة (10 MΩ) توقف التيار تقريبًا. الفولتميتر يُوصل على التوازي: ضع طرفيه على طرفي العنصر الذي تقيس جهده.", en: "Multimeter " + n + " on voltage is in series between " + nameXEn(oa[0]) + " and " + nameXEn(ob[0]) + ", so its large resistance (10 MΩ) almost stops the current. A voltmeter goes in parallel: put its leads across the element whose voltage you want." });
      }
    });

    /* 3 · the oscilloscope */
    var fgOn = b.inst.fg.map(function (ch, i) { return ch.on && c.info.fg[i].plugged; });
    [1, 2].forEach(function (n) {
      var st = c.info.sc[n - 1];
      if (st.tip && !st.clip) out.push({ sev: "warn", parts: [], t: "مجس CH" + n + " للأوسيلوسكوب بدون مشبك أرضي. صِل المشبك بأرضي الدائرة (نفس نقطة أرضي المولد).", en: "Oscilloscope probe CH" + n + " has no ground clip. Clip it to the circuit ground (the same point as the generator ground)." });
      var gens = fgOn.map(function (on, i) { return on ? netOf("FG" + (i + 1) + "g") : null; }).filter(Boolean);
      if (st.clip && gens.length && gens.indexOf(netOf("S" + n + "g")) === -1)
        out.push({ sev: "warn", parts: [], t: "مشبك أرضي مجس CH" + n + " على نقطة غير أرضي مولد الإشارة. في الأجهزة الحقيقية الأرضيان موصولان ببعض داخل الأجهزة، فهذا التوصيل يعمل قصرًا بين النقطتين. ضع المشبك على نفس نقطة أرضي المولد.", en: "The ground clip of probe CH" + n + " is on a different point from the generator ground. On real instruments both grounds are tied together inside, so this shorts the two points. Put the clip on the generator’s ground point." });
    });

    /* 4 · parts pushed past what real ones take (from the solved values) */
    if (res && res.ok) b.parts.forEach(function (p) {
      var x = res.el[p.id]; if (!x) return;
      if ((p.k === "R" || p.k === "LDR" || p.k === "NTC") && Math.abs(x.p) > R_MAX_W) out.push({ sev: "warn", parts: [p.id], t: name(p) + " تمتص " + si(Math.abs(x.p), "W") + "، أكبر من " + R_MAX_W + " W (قدرة المقاومة العادية في المعمل). في الواقع تسخن وقد تحترق: استخدم مقاومة أكبر أو جهدًا أقل.", en: nameEn(p) + " absorbs " + si(Math.abs(x.p), "W") + ", more than " + R_MAX_W + " W (a standard lab resistor). A real one heats up and may burn: use a larger resistor or a lower voltage." });
      if (p.k === "LED" && x.on && Math.abs(x.i) > LED_MAX_A) out.push({ sev: "warn", parts: [p.id], t: "التيار في " + name(p) + " = " + si(Math.abs(x.i), "A")+ "، أكبر من 30 mA فيحترق الـ LED الحقيقي. أضف مقاومة على التوالي معه.", en: "The current in " + nameEn(p) + " is " + si(Math.abs(x.i), "A") + ", more than 30 mA, which burns a real LED. Add a resistor in series with it." });
      if (p.k === "LED" && !x.on && x.v < -0.5) out.push({ sev: "warn", parts: [p.id], t: name(p) + " معكوس: الجهد على طرفه الموجب أقل من السالب، فلا يضيء. الرجل الطويلة (الموجب) تكون جهة الجهد الأعلى؛ حدده واضغط «اقلب القطعة».", en: nameEn(p) + " is reversed: its + leg is at a lower voltage than its − leg, so it doesn’t light. The long leg (+) goes toward the higher voltage; select it and press “Flip the part”." });
      if (p.k === "LAMP" && x.p > 1.3 * (p.pr || 0.5)) out.push({ sev: "warn", parts: [p.id], t: name(p) + " تأخذ " + si(x.p, "W") + " وتصنيفها " + si(p.pr || 0.5, "W") + " عند " + (p.vr || 6) + " V، فقد تحترق في الواقع.", en: nameEn(p) + " takes " + si(x.p, "W") + " but is rated " + si(p.pr || 0.5, "W") + " at " + (p.vr || 6) + " V, so a real one may burn out." });
    });
    return out;
  }
  CV.wireCheck = { check: check };
})(typeof window !== "undefined" ? window : globalThis);
