/* CircuitVision — advanced level: one generated circuit, several linked questions.
   Each part needs a different prerequisite (Kirchhoff and an analysis method, Ohm's law, the passive sign
   convention, power balance, dependent sources), so the student must combine them on the same circuit.
   Every value comes from the MNA solution of the circuit (engine/mna.js through engine/gen.js); nothing is typed in by hand. */
(function () {
  "use strict";
  var CV = window.CV = window.CV || {};
  var G = CV.gen, n = function (v) { return CV.num(v); };
  var UNITS = { A: [["mA", 1e-3], ["A", 1]], V: [["mV", 1e-3], ["V", 1], ["kV", 1e3]], W: [["mW", 1e-3], ["W", 1], ["kW", 1e3]] };
  var TAG = {
    kvl: ['قانونا كيرشوف', "c1-elements-3"], method: ["طرق تحليل الدوائر", "c1-techniques-1"], ohm: ["قانون أوم", "c1-elements-2"],
    psc: ["العنصر المثالي واصطلاح الإشارة", "c1-variables-3"], power: ["القدرة والطاقة", "c1-variables-4"], dep: ["تحليل دائرة فيها مصادر تابعة", "c1-elements-4"]
  };
  var HINT = {
    ctrl: "ابدأ بالكمية المتحكِّمة: اكتب معادلات العقد أو الحلقات، وعبّر عن المصدر التابع بدلالة هذه الكمية، ثم حلّ.",
    iR: "حلّ الدائرة بطريقة جهود العقد أو تيارات الحلقات، ثم خذ تيار المقاومة باتجاه السهم المرسوم.",
    vR: "بعد أن تعرف تيار المقاومة، جهدها v = iR بالقطبية المرسومة. انتبه: السهم يدخل الطرف +.",
    pSrc: "قدرة المصدر الممتصة: إذا دخل مرجع التيار طرفه الموجب فـ p = vi، وإلا p = −vi. السالب يعني أنه يولّد.",
    pTot: "مجموع ما تمتصه كل المقاومات = مجموع ما تولّده المصادر. اجمع i²R لكل مقاومة، أو استخدم توازن القدرة."
  };
  function nice(v) { return G._internal.nice(v); }
  function build(seed, dep) {
    for (var t = 0; t < 60; t++) {
      var g = G.generate({ seed: seed + t * 104729, families: ["ladder", "grid"], dependent: dep, types: ["iR", "vR", "pR", "pSrc"] });
      if (!g) continue;
      var c = g.circuit, sol = g.solution, parts = [], used = {};
      c.edges.forEach(function (e) { delete e.asked; delete e.isCtrl; });
      var R = sol.elements.filter(function (it) { return it.edge.type === "R" && nice(it.i) && nice(it.v) && Math.abs(it.i) > 1e-6; });
      var S = sol.elements.filter(function (it) { return it.edge.type !== "R" && it.edge.type !== "W" && nice(it.p) && Math.abs(it.p) > 1e-6; });
      if (R.length < 2 || !S.length) continue;
      if (dep) {
        var D = sol.byName.D, ce = D && sol.byName[D.edge.ctrl];
        if (!ce) continue;
        var isI = D.edge.type === "CCCS" || D.edge.type === "CCVS", val = isI ? ce.i : ce.v;
        if (!nice(val)) continue;
        parts.push({ k: "ctrl", el: D.edge.ctrl, unit: isI ? "A" : "V", value: val, tags: ["dep", "method"],
          q: (isI ? "أوجد التيار المتحكِّم <span class='ltr'>iₓ</span> في " : "أوجد الجهد المتحكِّم <span class='ltr'>vₓ</span> عبر ") + "<span class='ltr'><b>" + D.edge.ctrl + "</b></span>" + (isI ? " باتجاه السهم." : " بالقطبية المرسومة.") });
        used[D.edge.ctrl] = 1; ce.edge.asked = isI ? "iR" : "vR"; ce.edge.isCtrl = true;
      }
      var ri = R.filter(function (it) { return !used[it.edge.name]; })[0]; if (!ri) continue;
      parts.push({ k: "iR", el: ri.edge.name, unit: "A", value: ri.i, tags: ["kvl", "method"], q: "أوجد التيار <span class='ltr'>i</span> في <span class='ltr'><b>" + ri.edge.name + "</b></span> باتجاه السهم المرسوم." });
      used[ri.edge.name] = 1; ri.edge.asked = "iR";
      var rv = R.filter(function (it) { return !used[it.edge.name]; })[0] || null;
      if (rv) { parts.push({ k: "vR", el: rv.edge.name, unit: "V", value: rv.v, tags: ["ohm", "method"], q: "أوجد الجهد <span class='ltr'>v</span> عبر <span class='ltr'><b>" + rv.edge.name + "</b></span> بالقطبية المرسومة." }); rv.edge.asked = "vR"; }
      var s = S.filter(function (it) { return it.edge.name !== "D"; })[0] || S[0];
      parts.push({ k: "pSrc", el: s.edge.name, unit: "W", value: s.p, tags: ["psc", "power"].concat(s.edge.name === "D" ? ["dep"] : []),
        q: "أوجد القدرة التي يمتصها " + (s.edge.name === "D" ? "المصدر التابع" : "المصدر <span class='ltr'><b>" + s.edge.name + "</b></span>") + " (سالبة إذا كان يولّد القدرة)." });
      var tot = sol.elements.filter(function (it) { return it.edge.type === "R"; }).reduce(function (a, it) { return a + it.p; }, 0);
      if (!nice(tot)) continue;
      parts.push({ k: "pTot", unit: "W", value: tot, tags: ["power"], q: "أوجد مجموع القدرة التي تمتصها كل المقاومات في الدائرة." });
      if (parts.length < 3) continue;
      // solved by hand: prefer circuits whose answers all come out clean
      if (t < 45 && !parts.every(function (p) { return G._internal.clean(p.value); })) continue;
      return { g: g, parts: parts };
    }
    return null;
  }
  function judge(p, v) {
    var t = p.value, tol = 5e-3 * Math.abs(t) + 1e-9;
    if (Math.abs(v - t) <= tol) return ["ok", "✓ صحيح."];
    if (Math.abs(v + t) <= tol) return ["bad", "القيمة صحيحة لكن الإشارة معكوسة. راجع اتجاه المرجع المرسوم" + (p.k === "pSrc" ? " واصطلاح الإشارة: السالب يعني أن العنصر يولّد." : ".")];
    if (Math.abs(v - t * 1000) <= tol * 1000 || Math.abs(v - t / 1000) <= tol / 1000) return ["bad", "الرقم صحيح لكن البادئة خطأ (فرق ×1000). راجع الوحدة المختارة."];
    return ["bad", "غير صحيح. " + HINT[p.k]];
  }
  function mount(root) {
    var st = null, uid = "cp" + Math.floor(Math.random() * 1e6);
    root.innerHTML = '<div class="cp-top"><label class="cp-dep"><input type="checkbox" id="' + uid + '-dep"> مع مصدر تابع</label><button type="button" class="btn btn-primary btn-sm cp-new">مسألة جديدة ↻</button></div>' +
      '<div class="cp-tag muted"></div><div class="cp-fig"></div><ol class="cp-parts"></ol><div class="cp-end"></div><div class="cp-ws"></div>';
    var $ = function (s) { return root.querySelector(s); };
    function tagsHtml(p) { return p.tags.map(function (k) { return '<a class="cp-req" href="lesson.html#' + TAG[k][1] + '">' + TAG[k][0] + '</a>'; }).join(""); }
    function next(seed) {
      seed = seed || Math.floor(Math.random() * 900000) + 100000;
      var dep = $("#" + uid + "-dep").checked, r = build(seed, dep);
      if (!r) { $(".cp-parts").innerHTML = "<li>تعذّر توليد مسألة بهذه الإعدادات. اضغط «مسألة جديدة».</li>"; return; }
      st = { r: r, done: {} };
      var g = r.g;
      $(".cp-tag").innerHTML = "مسألة مركّبة رقم <span class='ltr mono'>" + g.seed + "</span> · " + r.parts.length + " أجزاء على نفس الدائرة" + (dep ? " · مصدر تابع" : "");
      $(".cp-fig").innerHTML = CV.draw.render(g.circuit, { aria: "دائرة المسألة المركّبة" });
      $(".cp-parts").innerHTML = r.parts.map(function (p, i) {
        return '<li class="cp-part" data-i="' + i + '"><p class="cp-q">' + p.q + '</p><div class="cp-reqs"><span class="muted">يحتاج:</span>' + tagsHtml(p) + '</div>' +
          '<form class="cp-form" novalidate><input class="input ltr" inputmode="decimal" autocomplete="off" aria-label="إجابتك"><select class="select" aria-label="الوحدة">' +
          UNITS[p.unit].map(function (u, k) { return '<option value="' + u[1] + '"' + (u[1] === 1 ? " selected" : "") + '>' + u[0] + '</option>'; }).join("") +
          '</select><button class="btn btn-ghost btn-sm" type="submit">تحقق</button><button class="btn btn-ghost btn-sm cp-h" type="button">تلميح</button></form><p class="cp-fb" role="status" hidden></p></li>';
      }).join("");
      $(".cp-end").innerHTML = '<button type="button" class="btn btn-ghost btn-sm cp-sol">اعرض الحل</button><div class="cp-solution" hidden></div>';
      if (CV.workspace) {
        var stepCtx = function () { var A = CV.analysis; return { c: g.circuit, sol: g.solution, nodes: A.nodeLabels(g.circuit), meshes: A.meshes(g.circuit, g.solution) || [] }; };
        CV.workspace.mount($(".cp-ws"), { key: "adv-" + g.seed, lessonId: "advanced", circuit: stepCtx,
          onLabels: function () { var x = stepCtx(); g.circuit.nodeLabels = x.nodes; g.circuit.meshLabels = x.meshes; $(".cp-fig").innerHTML = CV.draw.render(g.circuit, { aria: "دائرة المسألة المركّبة" }); },
          tutor: CV.tutor ? function () {
            return { key: "adv:" + g.seed, title: "مسألة مركّبة", problem: r.parts.map(function (p, i) { return (i + 1) + ") " + p.q.replace(/<[^>]+>/g, ""); }).join(" "),
              facts: ["قيم العناصر من محرك الحل (v, i, p ممتصة): " + g.solution.elements.filter(function (it) { return it.edge.type !== "W"; }).map(function (it) { return it.edge.name + ": v=" + n(it.v) + " V, i=" + n(it.i) + " A, p=" + n(it.p) + " W"; }).join("؛ ")] };
          } : null,
          onAnswer: function () { return false; } });
      }
      root.querySelectorAll(".cp-part").forEach(function (li) {
        var i = +li.dataset.i, p = r.parts[i], fb = li.querySelector(".cp-fb");
        li.querySelector(".cp-h").addEventListener("click", function () { fb.hidden = false; fb.className = "cp-fb hint"; fb.textContent = HINT[p.k]; });
        li.querySelector("form").addEventListener("submit", function (e) {
          e.preventDefault();
          var raw = li.querySelector("input").value.replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace("٫", ".").replace(/[−–]/g, "-").replace(",", ".");
          var v = parseFloat(raw); if (!isFinite(v)) { fb.hidden = false; fb.className = "cp-fb bad"; fb.textContent = "اكتب رقمًا."; return; }
          var res = judge(p, v * +li.querySelector("select").value);
          fb.hidden = false; fb.className = "cp-fb " + res[0]; fb.textContent = res[1];
          if (res[0] === "ok") { st.done[i] = 1; li.classList.add("done"); li.querySelectorAll("input,select,button").forEach(function (b) { b.disabled = true; }); finish(); }
        });
      });
      $(".cp-sol").addEventListener("click", function () {
        this.hidden = true; var box = $(".cp-solution"); box.hidden = false;
        box.innerHTML = "<b>إجابات الأجزاء</b><ol>" + r.parts.map(function (p) { return "<li class='ltr'>" + n(p.value) + " " + p.unit + "</li>"; }).join("") + "</ol>" +
          "<b>كل قيم الدائرة (من محرك الحل)</b><div class='tbl-wrap'><table class='tbl'><thead><tr><th>العنصر</th><th class='ltr'>v (V)</th><th class='ltr'>i (A)</th><th>p ممتصة (W)</th></tr></thead><tbody>" +
          g.solution.elements.filter(function (it) { return it.edge.type !== "W"; }).map(function (it) { return "<tr><td class='ltr'>" + (it.edge.name === "D" ? "المصدر التابع" : it.edge.name) + "</td><td class='ltr'>" + n(it.v) + "</td><td class='ltr'>" + n(it.i) + "</td><td class='ltr'>" + n(it.p) + "</td></tr>"; }).join("") +
          "</tbody></table></div><p class='muted'>اتجاه مرجع التيار في كل عنصر من اليسار لليمين أو من الأعلى للأسفل، والطرف + للجهد عند بداية هذا الاتجاه.</p>";
        st.shown = true;
      });
    }
    function finish() {
      var r = st.r; if (Object.keys(st.done).length < r.parts.length) return;
      if (!st.shown) CV.store.recordQuestion("adv-" + r.g.seed);
      var e = document.createElement("p"); e.className = "cp-fb ok cp-all"; e.textContent = st.shown ? "✓ أكملت كل الأجزاء (بعد عرض الحل، فلا تُحتسب)." : "✓ أكملت المسألة المركّبة كاملة وسُجّلت في تقدمك.";
      $(".cp-end").prepend(e);
    }
    $(".cp-new").addEventListener("click", function () { next(); });
    $("#" + uid + "-dep").addEventListener("change", function () { next(); });
    next();
  }
  CV.compound = { mount: mount, build: build };
})();
