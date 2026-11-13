/* CircuitVision — generated practice widget.
   Generates a circuit (engine/gen.js), draws it (engine/draw.js), asks one question,
   and checks the answer with Smart Feedback (feedback.js) using circuit-aware distractors:
   another element's value, the wrong form of Ohm's law, reversed sign, unit factors. */
(function () {
  "use strict";
  var FAM_AR = { loop: "حلقة واحدة", pair: "عناصر على التوازي", ladder: "سُلّم", grid: "شبكة متعددة الحلقات" };
  var UNITS = {
    A: [{ l: "mA", f: 1e-3 }, { l: "A", f: 1 }],
    V: [{ l: "mV", f: 1e-3 }, { l: "V", f: 1 }, { l: "kV", f: 1e3 }],
    W: [{ l: "mW", f: 1e-3 }, { l: "W", f: 1 }, { l: "kW", f: 1e3 }],
    "Ω": [{ l: "Ω", f: 1 }, { l: "kΩ", f: 1e3 }],
    VA: [{ l: "mVA", f: 1e-3 }, { l: "VA", f: 1 }, { l: "kVA", f: 1e3 }],
    VAR: [{ l: "mVAR", f: 1e-3 }, { l: "VAR", f: 1 }, { l: "kVAR", f: 1e3 }]
  };
  var HINTS = {
    loop: ["الدائرة حلقة واحدة: نفس التيار يمر في كل العناصر. طبّق KVL حول الحلقة.", "اجمع جهود المصادر مع مراعاة قطبيتها، ثم اقسم على مجموع المقاومات لتحصل على تيار الحلقة."],
    pair: ["كل العناصر موصلة بين نفس العقدتين، فلها نفس الجهد. طبّق KCL على العقدة العليا.", "الجهد المشترك = مجموع تيارات المصادر الداخلة إلى العقدة العليا ÷ مجموع <span class='ltr'>1/R</span>."],
    multi: ["اكتب KCL عند كل عقدة يلتقي فيها ثلاثة عناصر أو أكثر، وKVL حول الحلقات المستقلة.", "عبّر عن تيار كل مقاومة بقانون أوم، ثم حل المعادلات. ستتعلم في فصل «طرق تحليل الدوائر» طريقة منهجية لهذا (Node-Voltage)."],
    req: ["ابدأ من الجهة البعيدة عن الطرفين a و b، واختزل مقاومات التوالي والتوازي خطوة خطوة.", "مقاومتان على <b>التوالي</b> إذا لم يتصل بالعقدة بينهما عنصر ثالث، وعلى <b>التوازي</b> إذا كانتا بين نفس العقدتين. الأسلاك تجعل النقاط المتصلة بها عقدة واحدة."],
    dy: "إذا لم تجد توالي أو توازي، ابحث عن ثلاث مقاومات تشكّل مثلثًا (Δ) وحوّلها إلى Y.",
    dep: "ابدأ بالتعبير عن الكمية المتحكِّمة (<span class='ltr'>iₓ</span> أو <span class='ltr'>vₓ</span>) بدلالة المجاهيل، ثم عامل المصدر التابع كمصدر عادي في معادلات KCL و KVL."
  };

  function h(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }

  function questionText(q, gen) {
    var el = "<span class='ltr'><b>" + q.el + "</b></span>";
    var sb = gen.solution && gen.solution.byName && gen.solution.byName[q.el], isDep = !!(sb && sb.edge && /^(CC|VC)/.test(sb.edge.type));
    var KQ = {
      vN: "أوجد جهد العقدة <span class='ltr'><b>" + q.label + "</b></span> بالنسبة للأرضي (العقدة المرجعية).",
      iM: "أوجد تيار الحلقة <span class='ltr'><b>" + q.label + "</b></span> (مع عقارب الساعة).",
      Vth: "أوجد جهد ثيفنن <span class='ltr'>V<sub>Th</sub></span> بين الطرفين a و b (الطرف a موجب).",
      Rth: "أوجد مقاومة ثيفنن <span class='ltr'>R<sub>Th</sub></span> بين الطرفين a و b.",
      In: "أوجد تيار نورتن <span class='ltr'>I<sub>N</sub></span>: تيار القصر من a إلى b عبر سلك يصل الطرفين.",
      Pmax: "أوجد أقصى قدرة يمكن نقلها إلى حمل يوصل بين الطرفين a و b.",
      sup: "باستخدام التراكب: أوجد مساهمة المصدر <span class='ltr'><b>" + q.src + "</b></span> وحده في " + (q.q === "i" ? "التيار <span class='ltr'>i</span> عبر " : "الجهد <span class='ltr'>v</span> عبر ") + "<span class='ltr'><b>" + q.el + "</b></span> " + (q.q === "i" ? "باتجاه السهم." : "بالقطبية المرسومة.")
    };
    var unitWord = q.unit === "A" ? "التيار" : "الجهد";
    var KAC = {
      acI: "أوجد فيزور التيار في <span class='ltr'><b>" + q.el + "</b></span> باتجاه السهم.",
      acV: "أوجد فيزور الجهد على <span class='ltr'><b>" + q.el + "</b></span> بالقطبية المرسومة.",
      acVN: "أوجد فيزور جهد العقدة <span class='ltr'><b>" + q.label + "</b></span> بالنسبة للأرضي.",
      acIM: "أوجد فيزور تيار الحلقة <span class='ltr'><b>" + q.label + "</b></span> (مع عقارب الساعة).",
      acZ: "أوجد الممانعة المكافئة <span class='ltr'>Z<sub>ab</sub></span> بين الطرفين a و b.",
      acVth: "أوجد فيزور جهد ثيفنن <span class='ltr'>V<sub>Th</sub></span> بين a و b (الطرف a موجب).",
      acZth: "أوجد ممانعة ثيفنن <span class='ltr'>Z<sub>Th</sub></span> بين a و b.",
      acP: q.src ? "أوجد القدرة المتوسطة <span class='ltr'>P</span> التي يُسلّمها المصدر " + el + " للدائرة (اكتبها سالبة إذا كان يمتص قدرة)." : "أوجد القدرة المتوسطة <span class='ltr'>P</span> التي تمتصها " + el + ".",
      acQ: "أوجد القدرة الردية <span class='ltr'>Q</span> التي يمتصها " + el + " (بإشارتها).",
      acS: "أوجد القدرة المركبة <span class='ltr'>S = P + jQ</span> التي يُسلّمها المصدر " + el + " للدائرة.",
      acPmax: "أوجد أقصى قدرة متوسطة يمكن نقلها إلى حمل <span class='ltr'>Z<sub>L</sub></span> يوصل بين a و b."
    };
    if (KAC[q.kind]) return KAC[q.kind] + " <span class='muted'>(الفيزورات بالقيمة العظمى)</span>";
    if (KQ[q.kind]) return KQ[q.kind];
    if (q.kind === "Req") return "أوجد المقاومة المكافئة <span class='ltr'>R<sub>ab</sub></span> بين الطرفين <span class='ltr'>a</span> و <span class='ltr'>b</span>.";
    if (q.isCtrl) return q.kind === "iR" ? "أوجد التيار المتحكِّم <span class='ltr'>iₓ</span> في " + el + " باتجاه السهم المرسوم." : "أوجد الجهد المتحكِّم <span class='ltr'>vₓ</span> عبر " + el + " بالقطبية المرسومة.";
    if (q.kind === "iR") return "أوجد التيار <span class='ltr'>i</span> في " + el + " باتجاه السهم المرسوم.";
    if (q.kind === "vR") return "أوجد الجهد <span class='ltr'>v</span> عبر " + el + " بالقطبية المرسومة.";
    if (q.kind === "pR") return "أوجد القدرة التي تمتصها المقاومة " + el + ".";
    return "أوجد القدرة التي يمتصها " + (isDep ? "المصدر التابع" : "المصدر " + el) + " (اكتبها سالبة إذا كان يولّد القدرة).";
  }

  function solutionTable(gen) {
    var n = CV.num, rows = gen.solution.elements.map(function (it) {
      var e = it.edge, nm = e.name === "D" ? "المصدر التابع" : e.name;
      return "<tr><td class='ltr'>" + nm + "</td><td class='ltr'>" + n(it.v) + "</td><td class='ltr'>" + n(it.i) + "</td><td class='ltr'>" + n(it.p) + "</td></tr>";
    }).join("");
    return "<div class='tbl-wrap'><table class='tbl'><thead><tr><th>العنصر</th><th class='ltr'>v (V)</th><th class='ltr'>i (A)</th><th>p ممتصة (W)</th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
      "<p class='muted'>اتجاه مرجع التيار في كل عنصر من اليسار لليمين أو من الأعلى للأسفل، والطرف + للجهد عند بداية هذا الاتجاه. مجموع القدرات <span class='ltr'>Σp = " + CV.num(gen.solution.powerSum) + "</span> ✓</p>";
  }

  function mount(root, cfg) {
    cfg = cfg || {};
    var S = CV.store, F = CV.feedback, G = CV.gen;
    var state = { family: cfg.families ? "auto" : "auto", dependent: !!cfg.dependent, gen: null, wrong: 0, hints: 0 };
    var famOptions = cfg.families || ["loop", "pair", "ladder", "grid"];
    var uid = "gp" + Math.random().toString(36).slice(2, 7);

    root.classList.add("gp");
    root.innerHTML =
      (cfg.controls ? '<div class="gp-controls">' +
        '<div class="field"><label for="' + uid + '-fam">شكل الدائرة</label><select class="select" id="' + uid + '-fam"><option value="auto">عشوائي</option>' + famOptions.map(function (f) { return '<option value="' + f + '">' + FAM_AR[f] + '</option>'; }).join("") + '</select></div>' +
        '<div class="field"><label for="' + uid + '-type">المطلوب</label><select class="select" id="' + uid + '-type"><option value="mix">متنوع</option><option value="iR">تيار</option><option value="vR">جهد</option><option value="p">قدرة</option><option value="Req">مقاومة مكافئة</option><option value="vN">جهد عقدة</option><option value="iM">تيار حلقة</option><option value="thev">ثيفنن ونورتن</option><option value="Pmax">أقصى نقل للقدرة</option><option value="sup">التراكب</option><option value="acI">AC: تيار عنصر (فيزور)</option><option value="acV">AC: جهد عنصر (فيزور)</option><option value="acZ">AC: ممانعة مكافئة</option><option value="acVN">AC: جهد عقدة</option><option value="acIM">AC: تيار حلقة</option><option value="acTh">AC: ثيفنن</option><option value="acPow">AC: القدرة P و Q و S</option><option value="acPmax">AC: أقصى نقل للقدرة</option></select></div>' +
        '<label class="gp-check" for="' + uid + '-dep"><input type="checkbox" id="' + uid + '-dep"' + (cfg.dependent ? " checked" : "") + '> مع مصدر تابع</label>' +
        '</div>' : '') +
      '<div class="gp-top"><span class="gp-tag"></span>' + (cfg.hideNew ? '' : '<button type="button" class="btn btn-ghost btn-sm gp-new">دائرة جديدة ↻</button>') + '</div>' +
      '<div class="gp-fig"></div>' +
      '<p class="gp-q"></p>' +
      '<form class="pb-form gp-form" novalidate><div class="pb-row"><span class="pb-sym gp-sym"></span><input class="input pb-input" id="' + uid + '-in" inputmode="decimal" autocomplete="off" aria-label="الإجابة" dir="ltr"><select class="select pb-unit" id="' + uid + '-u" aria-label="الوحدة" dir="ltr"></select></div><div class="gp-ph" hidden></div>' +
      '<div class="pb-actions"><button type="submit" class="btn btn-primary btn-sm">تحقق</button><button type="button" class="btn btn-ghost btn-sm gp-hint">تلميح</button><button type="button" class="btn btn-ghost btn-sm gp-sol" hidden>اعرض الحل</button>' + (CV.tutor && !cfg.noTutor ? '<button type="button" class="btn btn-ghost btn-sm gp-tutor">اسأل المعلم الذكي</button>' : '') + '</div></form>' +
      '<div class="pb-hints gp-hints"></div><div class="fb" hidden aria-live="polite"></div><div class="gp-solution" hidden></div><div class="gp-ws"></div>';

    var $ = function (s) { return root.querySelector(s); };

    function familiesNow() {
      var v = cfg.controls ? $("#" + uid + "-fam").value : "auto";
      return v === "auto" ? famOptions : [v];
    }
    function typesNow() {
      var base = cfg.types || ["iR", "vR", "pR", "pSrc"];
      if (!cfg.controls) return base;
      var v = $("#" + uid + "-type").value;
      if (v === "mix") return base.concat(["ctrl"]);
      if (v === "p") return ["pR", "pSrc"];
      return [v, "ctrl"];
    }

    function wantReq() { return cfg.req || (cfg.controls && $("#" + uid + "-type").value === "Req"); }
    function next(seed) {
      var dep = cfg.controls ? $("#" + uid + "-dep").checked : !!cfg.dependent;
      var fams = familiesNow();
      var req = wantReq();
      if (req) { dep = false; fams = fams.filter(function (f) { return f === "ladder" || f === "grid"; }); if (!fams.length) fams = ["ladder", "grid"]; }
      if (dep) fams = fams.filter(function (f) { return f === "ladder" || f === "grid"; });
      if (!fams.length) fams = ["ladder", "grid"];
      seed = seed || (Math.floor(Math.random() * 900000) + 100000);
      var tsel = cfg.controls ? $("#" + uid + "-type").value : "";
      var ackinds = cfg.ackinds || ({ acI: ["acI"], acV: ["acV"], acZ: ["acZ"], acVN: ["acVN"], acIM: ["acIM"], acTh: ["acVth", "acZth"], acPow: ["acP", "acQ", "acS"], acPmax: ["acPmax"] })[tsel];
      var akinds = ackinds ? null : cfg.kinds || ({ vN: ["vN"], iM: ["iM"], thev: ["Vth", "Rth", "In"], Pmax: ["Pmax"], sup: ["sup"] })[tsel];
      if (akinds) { req = false; fams = fams.filter(function (f) { return f === "ladder" || f === "grid"; }); if (!fams.length) fams = ["ladder", "grid"]; if (akinds.length === 1 && akinds[0] === "sup") dep = false; }
      if (ackinds) { req = false; if (cfg.controls) fams = fams.filter(function (f) { return f !== "pair"; }); if (!fams.length) fams = ["loop", "ladder", "grid"]; }
      var g = ackinds ? G.generate({ seed: seed, ac: true, kinds: ackinds, kind: ackinds[0], families: cfg.controls && $("#" + uid + "-fam").value === "auto" ? ["loop", "ladder", "grid"] : fams, dependent: dep })
            : akinds ? G.generate({ seed: seed, kinds: akinds, kind: akinds[0], families: fams, dependent: dep })
            : req ? G.generate({ seed: seed, req: true, families: fams, sp: cfg.sp })
                  : G.generate({ seed: seed, families: fams, dependent: dep, types: typesNow(), allowI: cfg.allowI, single: cfg.single });
      if (!g) { $(".gp-q").textContent = "تعذّر توليد دائرة بهذه الإعدادات. جرّب إعدادات أخرى."; return; }
      state.gen = g; state.wrong = 0; state.hints = 0; root.cvGen = g; // read by tests
      $(".gp-tag").innerHTML = "دائرة رقم <span class='ltr mono'>" + g.seed + "</span> · " + FAM_AR[g.family] + (ackinds ? " · تيار متردد" : akinds ? (dep ? " · مصدر تابع" : "") : req ? " · مقاومة مكافئة" + (g.reduction.usedDY ? " (تحتاج Δ-Y)" : "") : dep ? " · مصدر تابع" : "");
      $(".gp-fig").innerHTML = CV.draw.render(g.circuit, { aria: "دائرة مولّدة: " + FAM_AR[g.family] });
      $(".gp-q").innerHTML = questionText(g.question, g);
      var SYM = { vN: (g.question.label || "v") + " =", iM: (g.question.label || "i") + " =", Vth: "VTh =", Rth: "RTh =", In: "IN =", Pmax: "pmax =", acP: "P =", acQ: "Q =", acPmax: "Pmax =", sup: (g.question.q === "i" ? "i" : "v") + "(" + g.question.src + ") =" };
      $(".gp-sym").textContent = SYM[g.question.kind] ? SYM[g.question.kind] : g.question.kind === "Req" ? "Rab =" : g.question.unit === "A" ? (g.question.isCtrl ? "iₓ =" : "i =") : g.question.unit === "V" ? (g.question.isCtrl ? "vₓ =" : "v =") : "p =";
      var units = UNITS[g.question.unit];
      $("#" + uid + "-u").innerHTML = units.map(function (u, i) { return '<option value="' + i + '"' + (u.f === 1 ? " selected" : "") + '>' + u.l + '</option>'; }).join("");
      var inp = $("#" + uid + "-in"); inp.value = ""; inp.disabled = false;
      var isPh = !!g.question.phasor;
      $(".gp-form .pb-row").hidden = isPh; $(".gp-ph").hidden = !isPh;
      state.ph = isPh ? F.phasorInput($(".gp-ph"), uid + "-ph", UNITS[g.question.unit]) : null;
      $(".gp-form").hidden = false;
      $(".gp-form").querySelectorAll("button,select").forEach(function (b) { b.disabled = false; });
      $(".gp-sol").hidden = true; $(".gp-hint").disabled = false;
      $(".gp-hints").innerHTML = ""; $(".fb").hidden = true; $(".gp-solution").hidden = true;
      root.classList.remove("pb-complete");
      if (CV.workspace) CV.workspace.mount($(".gp-ws"), { key: "gen-" + g.family + "-" + g.seed, lessonId: cfg.lessonId || "generator",
        context: $(".gp-q").textContent,
        circuit: g.circuit.omega ? null : function () { return stepCtx(g); },
        onLabels: g.circuit.omega ? null : function () { var x = stepCtx(g); if (!x) return; g.circuit.nodeLabels = x.nodes; g.circuit.meshLabels = x.meshes; $(".gp-fig").innerHTML = CV.draw.render(g.circuit, { aria: "دائرة مولّدة: " + FAM_AR[g.family] }); },
        tutor: CV.tutor ? function () { return CV.tutor.fromGenerated(g, $(".gp-q").textContent); } : null,
        onAnswer: function (v) { return CV.workspace.fillAnswer($("#" + uid + "-in"), $("#" + uid + "-u"), v); } });
    }

    function stepCtx(g) { return CV.stepcheck.contextFor(g.circuit); } // the circuit's unknowns, named as they are (or will be) drawn
    function hintsFor(g) {
      var AH = {
        vN: ["اختر الأرضي عقدة مرجعية (هنا أسفل اليسار)، ثم اكتب KCL عند كل عقدة أساسية بدلالة جهود العقد: <span class='ltr'>Σ (vₖ − vⱼ)/R = 0</span>.", "مصدر جهد بين عقدة والأرضي يعطيك جهد العقدة مباشرة. ومصدر جهد بين عقدتين يجعلهما عقدة عظمى (supernode)."],
        iM: ["اكتب KVL حول كل حلقة باتجاه عقارب الساعة. تيار الفرع المشترك = فرق تياري الحلقتين.", "مصدر تيار في فرع خارجي يحدد تيار حلقته مباشرة. ومصدر تيار في فرع مشترك يحتاج حلقة عظمى (supermesh)."],
        Vth: ["V<sub>Th</sub> هو جهد الدائرة المفتوحة بين a و b: احسبه بدون أي حمل بين الطرفين.", "يمكنك أيضًا استخدام تحويل المصادر لاختزال الدائرة خطوة خطوة نحو الطرفين."],
        Rth: ["إذا لم توجد مصادر تابعة: أطفئ المصادر المستقلة (جهد ← سلك، تيار ← مفتوح) واحسب المقاومة المكافئة بين a و b.", "في كل الحالات: <span class='ltr'>R<sub>Th</sub> = V<sub>Th</sub> / I<sub>N</sub></span>. ومع المصادر التابعة لا تطفئها."],
        In: ["صل الطرفين a و b بسلك، واحسب التيار المار فيه من a إلى b.", "أو احسب <span class='ltr'>V<sub>Th</sub></span> و <span class='ltr'>R<sub>Th</sub></span> ثم <span class='ltr'>I<sub>N</sub> = V<sub>Th</sub> / R<sub>Th</sub></span>."],
        Pmax: ["أوجد مكافئ ثيفنن بين a و b أولًا.", "أقصى قدرة عند <span class='ltr'>R<sub>L</sub> = R<sub>Th</sub></span>، وقيمتها <span class='ltr'>V<sub>Th</sub>² / (4R<sub>Th</sub>)</span>."],
        sup: ["أبقِ المصدر المطلوب فقط، وأطفئ الآخر: مصدر الجهد يصبح سلكًا، ومصدر التيار يصبح دائرة مفتوحة.", "حل الدائرة الأبسط الناتجة بالتوالي والتوازي أو قسمة التيار والجهد."]
      };
      var PH = {
        acP: ["احسب فيزوري الجهد والتيار للعنصر أولًا (بالطرق المعتادة).", "ثم <span class='ltr'>P = ½·V<sub>m</sub>I<sub>m</sub>cos(θ<sub>v</sub> − θ<sub>i</sub>)</span> = الجزء الحقيقي من <span class='ltr'>½·V·I*</span>. للمقاومة يكفي <span class='ltr'>P = ½·I<sub>m</sub>²R</span>."],
        acQ: ["احسب فيزور التيار في العنصر.", "<span class='ltr'>Q = ½·I<sub>m</sub>²·X</span>: موجبة للملف <span class='ltr'>(X = ωL)</span> وسالبة للمكثف <span class='ltr'>(X = −1/ωC)</span>."],
        acS: ["احسب فيزور تيار المصدر بالاتجاه الذي يخرج من طرفه الموجب.", "القدرة المُسلَّمة <span class='ltr'>S = ½·V·I*</span> بهذا الاتجاه (لاحظ المرافق على التيار)."],
        acPmax: ["أوجد مكافئ ثيفنن بين a و b: <span class='ltr'>V<sub>Th</sub></span> و <span class='ltr'>Z<sub>Th</sub> = R<sub>Th</sub> + jX<sub>Th</sub></span>.", "الحمل الأمثل <span class='ltr'>Z<sub>L</sub> = Z<sub>Th</sub>*</span>، وأقصى قدرة <span class='ltr'>|V<sub>Th</sub>|²/(8R<sub>Th</sub>)</span> مع القيم العظمى."]
      };
      if (PH[g.question.kind]) return PH[g.question.kind];
      if (g.acq) return ["حوّل كل عنصر إلى ممانعته: <span class='ltr'>Z<sub>R</sub> = R</span>، <span class='ltr'>Z<sub>L</sub> = jωL</span>، <span class='ltr'>Z<sub>C</sub> = −j/(ωC)</span>، والمصادر إلى فيزوراتها.", "ثم استخدم نفس طرق Circuits DC (توالي/توازي، العقد، الحلقات، ثيفنن) لكن بالأعداد المركبة.", "للتحويل بين الشكلين: <span class='ltr'>a + jb = √(a² + b²) ∠ tan⁻¹(b/a)</span>، وانتبه للربع الذي يقع فيه العدد."];
      if (AH[g.question.kind]) return AH[g.question.kind].concat(g.circuit.edges.some(function (e) { return /^(CC|VC)/.test(e.type); }) ? [HINTS.dep] : []);
      if (g.question.kind === "Req") return HINTS.req.concat(g.reduction.usedDY ? [HINTS.dy] : []);
      var list = (g.family === "loop" || g.family === "pair") ? HINTS[g.family].slice() : HINTS.multi.slice();
      if (g.circuit.edges.some(function (e) { return /^(CC|VC)/.test(e.type); })) list.unshift(HINTS.dep);
      return list;
    }

    function showSolution(solved) {
      var g = state.gen, steps = G.steps(g);
      var ansTxt = g.question.phasor ? CV.ac.polar(g.question.z, g.question.unit) + " = " + CV.ac.rect(g.question.z, g.question.unit) : CV.fmt(g.question.value, g.question.unit);
      var html = (solved ? "<p class='gp-ok'>✓ إجابة صحيحة: <span class='eq-i'>" + ansTxt + "</span></p>" : "<p><b>الإجابة:</b> <span class='eq-i'>" + ansTxt + "</span></p>");
      if (steps) html += "<b>" + (g.analysis ? "قيم الحل" : "خطوات الحل") + "</b><ol class='steps'>" + steps.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ol>";
      if (g.question.kind !== "Req" && !g.noTable && !g.acq) html += "<b>قيم كل عناصر الدائرة</b>" + solutionTable(g);
      var box = $(".gp-solution"); box.innerHTML = html; box.hidden = false;
    }

    if ($(".gp-new")) $(".gp-new").addEventListener("click", function () { next(); });
    if (cfg.controls) ["-fam", "-type", "-dep"].forEach(function (s) { $("#" + uid + s).addEventListener("change", function () { next(); }); });
    $(".gp-hint").addEventListener("click", function () {
      var list = hintsFor(state.gen);
      if (state.hints < list.length) { $(".gp-hints").insertAdjacentHTML("beforeend", "<p><b>تلميح " + (state.hints + 1) + ":</b> " + list[state.hints] + "</p>"); state.hints++; }
      if (state.hints >= list.length) this.disabled = true;
    });
    $(".gp-sol").addEventListener("click", function () { showSolution(false); this.hidden = true; });
    if ($(".gp-tutor")) $(".gp-tutor").addEventListener("click", function () {
      var c = CV.tutor.fromGenerated(state.gen, $(".gp-q").textContent); c.attempt = state.lastFb || ""; CV.tutor.open(c);
    });

    $(".gp-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var g = state.gen, q = g.question;
      var r = q.phasor ? F.evaluatePhasor({ answer: q.z, tol: 0.01, diagnose: G.distractors(g) }, state.ph.read())
                       : F.evaluateNumber({ answer: q.value, tol: 0.01, diagnose: G.distractors(g) }, $("#" + uid + "-in").value, UNITS[q.unit][+$("#" + uid + "-u").value].f);
      var fb = $(".fb");
      if (r.status === "invalid") { fb.hidden = false; fb.className = "fb fb-info"; fb.innerHTML = "<p>" + r.why + "</p>"; return; }
      var qid = "gen-" + g.family + "-" + g.seed;
      S.recordAttempt(cfg.lessonId || "generator", qid, r.status === "correct", r.status === "wrong" ? (r.type || "unclassified") : null);
      if (cfg.onAttempt) cfg.onAttempt(r, g, state);
      if (r.status === "correct") {
        fb.hidden = true;
        S.recordQuestion(qid);
        $(".gp-form").querySelectorAll("input,select,button").forEach(function (b) { b.disabled = true; });
        root.classList.add("pb-complete");
        showSolution(true);
        if (cfg.onSolved) cfg.onSolved();
        return;
      }
      state.wrong++;
      var t = r.type && F.TYPES[r.type];
      state.lastFb = "أدخل الطالب قيمة خاطئة. التشخيص: " + (t ? t.ar + " — " : "غير معروف — ") + String(r.why || "").replace(/<[^>]+>/g, "");
      var html = '<div class="fb-top">' + (t ? '<span class="fb-type">' + t.ar + ' <span class="ltr">· ' + t.en + '</span></span>' : '<span class="fb-type fb-unk">نمط غير معروف</span>') + '</div><dl class="fb-grid"><dt>لماذا؟</dt><dd>' + r.why + '</dd>' + (r.hint ? '<dt>تلميح</dt><dd>' + r.hint + '</dd>' : '') + '</dl>';
      var rep = r.type ? S.mistakeCount(r.type) : 0;
      if (rep >= 2 && t) html += '<p class="fb-repeat">تكرر معك «' + t.ar + '» ' + rep + ' مرات حتى الآن.</p>';
      fb.hidden = false; fb.className = "fb fb-wrong"; fb.innerHTML = html;
      if (!r.type && !cfg.noAutoHint && state.hints < hintsFor(g).length) $(".gp-hint").click();
      if (state.wrong >= 3 && !cfg.noSolution) $(".gp-sol").hidden = false;
    });

    next(cfg.seed);
    return { next: next, state: state };
  }

  window.CV = window.CV || {};
  window.CV.practice = { mount: mount, FAM_AR: FAM_AR };
})();
