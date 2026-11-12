/* CircuitVision — Smart Feedback engine.
   Checks a student's step answer against the exact value computed in the lesson data,
   then explains the mistake instead of saying "Incorrect".
   Order of diagnosis:
     1. correct (within tolerance)
     2. a known mistake written by the lesson author for this step (most specific)
     3. automatic patterns: opposite sign, unit/prefix factor, close-but-off arithmetic
     4. unknown: say so honestly and offer the next hint
   No AI is involved: every judgement here comes from arithmetic on known values. */
(function () {
  "use strict";

  var TYPES = {
    conceptual:   { ar: "خطأ في المفهوم",     en: "Conceptual Error" },
    formula:      { ar: "اختيار قانون خاطئ",   en: "Formula Selection Error" },
    substitution: { ar: "خطأ في التعويض",      en: "Substitution Error" },
    math:         { ar: "خطأ حسابي",           en: "Mathematical Error" },
    sign:         { ar: "خطأ في الإشارة",      en: "Sign Convention Error" },
    unit:         { ar: "خطأ في الوحدة",       en: "Unit Error" }
  };

  function parseNumber(raw) {
    if (raw == null) return NaN;
    var s = String(raw).trim()
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 1776); })
      .replace(/[٫,]/g, ".").replace(/[−–]/g, "-").replace(/\s+/g, "")
      .replace(/[×x\*]10\^?/i, "e");
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  }

  function close(a, b, rel) {
    rel = rel || 0.01;
    if (b === 0) return Math.abs(a) < 1e-12;
    return Math.abs(a - b) <= rel * Math.abs(b);
  }

  var FACTORS = [
    [1e3, "أكبر بألف مرة"], [1e-3, "أصغر بألف مرة"], [1e6, "أكبر بمليون مرة"], [1e-6, "أصغر بمليون مرة"],
    [1e9, "أكبر بمليار مرة"], [1e-9, "أصغر بمليار مرة"], [3600, "أكبر بـ 3600 مرة"], [1 / 3600, "أصغر بـ 3600 مرة"],
    [60, "أكبر بـ 60 مرة"], [1 / 60, "أصغر بـ 60 مرة"]
  ];

  /* Returns { status: correct|wrong|invalid, type?, why?, hint?, review?, known? } */
  function evaluateNumber(step, raw, factor) {
    var n = parseNumber(raw);
    if (isNaN(n)) return { status: "invalid", why: "اكتب رقمًا فقط، مثل 0.25 أو 2.5e-3، واختر الوحدة من القائمة." };
    var v = n * (factor || 1), ans = step.answer, tol = step.tol || 0.01;
    if (close(v, ans, tol)) return { status: "correct" };
    var known = (step.diagnose || []);
    for (var i = 0; i < known.length; i++) {
      if (close(v, known[i].value, tol)) return { status: "wrong", known: true, type: known[i].type, why: known[i].why, hint: known[i].hint, review: known[i].review };
    }
    if (ans !== 0 && close(v, -ans, tol)) {
      return { status: "wrong", type: "sign", why: "مقدار إجابتك صحيح لكن إشارتها معكوسة. الإشارة هنا تحمل معنى فيزيائيًا: اتجاه التيار الفعلي، أو هل العنصر يمتص القدرة أم يولّدها.", hint: "ارجع إلى اتجاهات المرجع في الرسم وطبّق اصطلاح الإشارة خطوة خطوة." };
    }
    for (var j = 0; j < FACTORS.length; j++) {
      if (close(v, ans * FACTORS[j][0], tol)) {
        return { status: "wrong", type: "unit", why: "الأرقام في حلك صحيحة، لكن قيمتك " + FACTORS[j][1] + " من الصحيحة. هذا يحدث عادة عند نسيان تحويل البادئة (m، k، µ) أو وحدة الزمن (ثانية، دقيقة، ساعة).", hint: "حوّل كل القيم المعطاة إلى الوحدات الأساسية في SI قبل التعويض، ثم اختر وحدة الإجابة بعناية." };
      }
    }
    if (close(v, ans, 0.1)) {
      var pct = Math.abs((v - ans) / ans * 100);
      return { status: "wrong", type: "math", why: "إجابتك قريبة من الصحيحة (الفرق حوالي " + (pct < 1 ? pct.toFixed(1) : Math.round(pct)) + "%). الطريقة على الأرجح صحيحة، والخطأ في التقريب أو في عملية حسابية.", hint: "أعد الحساب بدون تقريب في الخطوات الوسيطة، وقرّب النتيجة النهائية فقط." };
    }
    return { status: "wrong", type: null, why: "لم أتعرف على نمط هذا الخطأ تحديدًا. راجع القانون المستخدم في هذه الخطوة والقيم التي عوّضتها." };
  }

  function evaluateChoice(step, index) {
    var o = step.options[index];
    if (!o) return { status: "invalid", why: "اختر إجابة أولًا." };
    if (o.correct) return { status: "correct", why: o.why };
    return { status: "wrong", known: true, type: o.type, why: o.why, hint: o.hint, review: o.review };
  }


  /* ---------------- Phasor answers (Chapter 5+) ---------------- */
  function cplx(re, im) { return { re: re, im: im }; }
  function cabs(z) { return Math.hypot(z.re, z.im); }
  function carg(z) { return Math.atan2(z.im, z.re) * 180 / Math.PI; }
  function cclose(a, b, rel) { var d = Math.hypot(a.re - b.re, a.im - b.im); return d <= Math.max((rel || 0.01) * cabs(b), 1e-9); }
  function angDiff(a, b) { var d = ((a - b) % 360 + 540) % 360 - 180; return Math.abs(d); }

  /* input: { z: {re,im} (SI), form: "polar"|"rect", ang (deg, as typed) } */
  function evaluatePhasor(step, input) {
    if (!input || input.error) return { status: "invalid", why: (input && input.error) || "اكتب الإجابة." };
    var z = input.z, ans = step.answer;
    if (cclose(z, ans, step.tol || 0.01)) return { status: "correct" };
    var known = step.diagnose || [];
    for (var i = 0; i < known.length; i++) if (cclose(z, known[i].value, step.tol || 0.01)) return { status: "wrong", known: true, type: known[i].type, why: known[i].why, hint: known[i].hint, review: known[i].review };
    var m = cabs(z), m0 = cabs(ans), a = carg(z), a0 = carg(ans);
    if (cclose(z, cplx(ans.re, -ans.im))) return { status: "wrong", type: "sign", why: "إجابتك المرافق المركّب للصحيحة: الجزء الحقيقي صحيح لكن إشارة الجزء التخيلي (والزاوية) معكوسة. هذا يحدث عادة عند استخدام <span class='ltr'>+j</span> للمكثف أو <span class='ltr'>−j</span> للملف، أو عند عكس إشارة الزاوية.", hint: "تذكّر: <span class='ltr'>Z<sub>L</sub> = +jωL</span> و <span class='ltr'>Z<sub>C</sub> = −j/(ωC)</span>." };
    if (cclose(z, cplx(-ans.re, -ans.im))) return { status: "wrong", type: "sign", why: "إجابتك مزاحة 180° عن الصحيحة (نفس المقدار، إشارة معكوسة). راجع اتجاه المرجع للتيار أو قطبية الجهد." };
    if (m0 > 1e-9 && Math.abs(m - m0) <= 0.01 * m0) {
      if (input.form === "polar" && Math.abs(input.ang - a0 * Math.PI / 180) < 0.02) return { status: "wrong", type: "unit", why: "المقدار صحيح، لكنك كتبت الزاوية بالراديان. اكتبها بالدرجات." };
      if (Math.abs(angDiff(a, a0) - 90) < 1.5) return { status: "wrong", type: "conceptual", why: "المقدار صحيح لكن الزاوية مزاحة 90°. غالبًا نسيت <span class='ltr'>j</span> في ممانعة ملف أو مكثف، أو قسمت/ضربت في j في المكان الخطأ." };
      return { status: "wrong", type: "math", why: "المقدار صحيح، لكن الزاوية خطأ (الفرق حوالي " + Math.round(angDiff(a, a0)) + "°). راجع حساب الزاوية: <span class='ltr'>θ = tan⁻¹(b/a)</span> مع مراعاة الربع الذي يقع فيه العدد." };
    }
    if (m0 > 1e-9 && angDiff(a, a0) < 1.5) {
      var r = m / m0, facts = [[Math.SQRT2, "أكبر بـ √2"], [1 / Math.SQRT2, "أصغر بـ √2"], [2 * Math.PI, "أكبر بـ 2π"], [1 / (2 * Math.PI), "أصغر بـ 2π"], [1000, "أكبر بألف مرة"], [1e-3, "أصغر بألف مرة"]];
      for (var k = 0; k < facts.length; k++) if (Math.abs(r / facts[k][0] - 1) < 0.01) {
        var why = k < 2 ? "الزاوية صحيحة، والمقدار " + facts[k][1] + ": خلطت بين القيمة العظمى والقيمة الفعالة (rms). الفيزورات هنا بالقيمة العظمى." : k < 4 ? "الزاوية صحيحة، والمقدار " + facts[k][1] + ": خلطت بين f و ω. تذكّر <span class='ltr'>ω = 2πf</span>." : "الزاوية صحيحة، والمقدار " + facts[k][1] + ": راجع البادئات (m، k، µ).";
        return { status: "wrong", type: "unit", why: why };
      }
      if (Math.abs(r - 1) < 0.1) return { status: "wrong", type: "math", why: "الزاوية صحيحة والمقدار قريب (الفرق حوالي " + Math.round(Math.abs(r - 1) * 100) + "%). راجع التقريب في الحساب." };
      return { status: "wrong", type: "math", why: "الزاوية صحيحة لكن المقدار خطأ. راجع حساب المقدار <span class='ltr'>|z| = √(a² + b²)</span> أو قسمة المقادير." };
    }
    return { status: "wrong", type: null, why: "لم أتعرف على نمط هذا الخطأ. راجع الممانعات والمعادلة المستخدمة." };
  }

  /* Phasor input: polar (magnitude ∠ angle°) or rectangular (a + jb). */
  function phasorInput(box, uid, units, defForm) {
    box.innerHTML =
      '<div class="ph-in" dir="ltr">' +
        '<select class="select ph-form" id="' + uid + '-form" aria-label="شكل الإجابة"><option value="polar">∠ قطبي</option><option value="rect">a + jb ديكارتي</option></select>' +
        '<span class="ph-polar"><input class="input pb-input ph-mag" id="' + uid + '-mag" inputmode="decimal" autocomplete="off" aria-label="المقدار" placeholder="المقدار"><span class="ph-sym">∠</span><input class="input pb-input ph-ang" id="' + uid + '-ang" inputmode="decimal" autocomplete="off" aria-label="الزاوية بالدرجات" placeholder="الزاوية"><span class="ph-sym">°</span></span>' +
        '<span class="ph-rect" hidden><input class="input pb-input ph-re" id="' + uid + '-re" inputmode="decimal" autocomplete="off" aria-label="الجزء الحقيقي" placeholder="a"><span class="ph-sym">+ j</span><input class="input pb-input ph-im" id="' + uid + '-im" inputmode="decimal" autocomplete="off" aria-label="الجزء التخيلي" placeholder="b"></span>' +
        '<select class="select pb-unit ph-unit" id="' + uid + '-u" aria-label="الوحدة">' + units.map(function (u, i) { return '<option value="' + i + '"' + (u.f === 1 ? " selected" : "") + '>' + u.l + '</option>'; }).join("") + '</select>' +
      '</div>';
    var form = box.querySelector(".ph-form");
    if (defForm) form.value = defForm;
    function sync() { box.querySelector(".ph-polar").hidden = form.value !== "polar"; box.querySelector(".ph-rect").hidden = form.value !== "rect"; }
    form.addEventListener("change", sync); sync();
    return {
      read: function () {
        var f = units[+box.querySelector(".ph-unit").value].f;
        if (form.value === "polar") {
          var mg = parseNumber(box.querySelector(".ph-mag").value), an = parseNumber(box.querySelector(".ph-ang").value || "0");
          if (isNaN(mg) || isNaN(an)) return { error: "اكتب المقدار والزاوية بالأرقام (الزاوية بالدرجات)." };
          var r = an * Math.PI / 180; return { z: cplx(mg * f * Math.cos(r), mg * f * Math.sin(r)), form: "polar", ang: an };
        }
        var re = parseNumber(box.querySelector(".ph-re").value || "0"), im = parseNumber(box.querySelector(".ph-im").value || "0");
        if (isNaN(re) || isNaN(im)) return { error: "اكتب الجزأين الحقيقي والتخيلي بالأرقام. للسالب اكتب −، مثل 3 + j(−4)." };
        return { z: cplx(re * f, im * f), form: "rect" };
      },
      disable: function (d) { box.querySelectorAll("input,select").forEach(function (x) { x.disabled = d; }); }
    };
  }

  /* ---------------- UI ---------------- */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function renderProblem(root, problem, lessonId, opts) {
    opts = opts || {};
    var S = CV.store;
    root.innerHTML = "";
    var head = h("div", "pb-head");
    head.appendChild(h("p", "pb-prompt", problem.prompt));
    if (problem.figure) head.appendChild(h("div", "pb-fig", problem.figure));
    root.appendChild(head);
    var stepsWrap = h("ol", "pb-steps");
    root.appendChild(stepsWrap);

    var saved = (S.get().practice[lessonId] || { steps: {} }).steps;
    var nodes = [], lastFb = "";

    problem.steps.forEach(function (step, si) {
      var li = h("li", "pb-step");
      li.dataset.state = "locked";
      li.innerHTML = '<div class="pb-step-head"><span class="pb-n">' + (si + 1) + '</span><div class="pb-label">' + step.label + '</div></div>';
      var body = h("div", "pb-body");
      var form = h("form", "pb-form");
      form.setAttribute("novalidate", "");
      var fid = lessonId + "-" + step.id;

      var phIn = null;
      if (step.kind === "phasor") {
        var phBox = h("div", "pb-row-ph"); form.appendChild(phBox);
        phIn = phasorInput(phBox, fid, step.units, step.form);
      } else if (step.kind === "choice") {
        var group = h("div", "pb-choices");
        group.setAttribute("role", "radiogroup");
        step.options.forEach(function (o, oi) {
          var id = fid + "-o" + oi;
          group.insertAdjacentHTML("beforeend", '<label class="pb-choice" for="' + id + '"><input type="radio" name="' + fid + '" id="' + id + '" value="' + oi + '"><span>' + o.t + '</span></label>');
        });
        form.appendChild(group);
      } else {
        var row = h("div", "pb-row");
        row.innerHTML = '<span class="pb-sym">' + (step.symbol || "") + '</span><input class="input pb-input" id="' + fid + '" inputmode="decimal" autocomplete="off" aria-label="الإجابة" dir="ltr">' +
          '<select class="select pb-unit" id="' + fid + '-u" aria-label="الوحدة" dir="ltr">' + step.units.map(function (u, ui) { return '<option value="' + ui + '"' + (ui === (step.unitDefault || 0) ? " selected" : "") + '>' + u.l + '</option>'; }).join("") + '</select>';
        form.appendChild(row);
      }
      var actions = h("div", "pb-actions");
      actions.innerHTML = '<button type="submit" class="btn btn-primary btn-sm">تحقق</button><button type="button" class="btn btn-ghost btn-sm pb-hint-btn">تلميح</button><button type="button" class="btn btn-ghost btn-sm pb-sol-btn" hidden>اعرض حل هذه الخطوة</button>';
      form.appendChild(actions);
      body.appendChild(form);
      var hintBox = h("div", "pb-hints"); body.appendChild(hintBox);
      var fb = h("div", "fb"); fb.hidden = true; fb.setAttribute("aria-live", "polite"); body.appendChild(fb);
      var sol = h("div", "pb-sol"); sol.hidden = true; sol.innerHTML = '<b>حل الخطوة:</b> ' + step.solution; body.appendChild(sol);
      var done = h("div", "pb-done"); done.hidden = true; done.innerHTML = '✓ ' + step.solution; body.appendChild(done);
      li.appendChild(body);
      stepsWrap.appendChild(li);

      var wrong = 0, hintsShown = 0;
      function showHint() {
        if (hintsShown >= step.hints.length) return;
        hintBox.insertAdjacentHTML("beforeend", '<p><b>تلميح ' + (hintsShown + 1) + ':</b> ' + step.hints[hintsShown] + '</p>');
        hintsShown++; S.recordHint(lessonId, step.id);
        if (hintsShown >= step.hints.length) actions.querySelector(".pb-hint-btn").disabled = true;
      }
      actions.querySelector(".pb-hint-btn").addEventListener("click", showHint);
      actions.querySelector(".pb-sol-btn").addEventListener("click", function () { sol.hidden = false; this.hidden = true; });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var r;
        if (step.kind === "phasor") {
          r = evaluatePhasor(step, phIn.read());
        } else if (step.kind === "choice") {
          var c = form.querySelector("input:checked");
          r = evaluateChoice(step, c ? +c.value : -1);
        } else {
          r = evaluateNumber(step, form.querySelector(".pb-input").value, step.units[+form.querySelector(".pb-unit").value].f);
        }
        if (r.status === "invalid") { showFeedback(fb, r, null); return; }
        S.recordAttempt(lessonId, step.id, r.status === "correct", r.status === "wrong" ? (r.type || "unclassified") : null);
        if (r.status === "correct") { solve(si); return; }
        wrong++;
        showFeedback(fb, r, { n: si + 1, label: step.label, repeat: r.type ? S.mistakeCount(r.type) : 0 });
        lastFb = "خطأ في الخطوة " + (si + 1) + ". التشخيص: " + (r.type && TYPES[r.type] ? TYPES[r.type].ar + " — " : "غير معروف — ") + String(r.why || "").replace(/<[^>]+>/g, "");
        if (!r.hint && hintsShown < step.hints.length) showHint();
        if (wrong >= 3) actions.querySelector(".pb-sol-btn").hidden = false;
      });

      nodes.push({ li: li, form: form, fb: fb, done: done, sol: sol });
    });

    function setState(i, state) {
      var n = nodes[i]; if (!n) return;
      n.li.dataset.state = state;
      var dis = state !== "active";
      n.form.querySelectorAll("input,select,button").forEach(function (x) { x.disabled = dis; });
      n.form.hidden = state === "solved";
      if (state === "solved") { n.fb.hidden = true; n.sol.hidden = true; n.done.hidden = false; n.li.querySelector(".pb-hints").hidden = true; }
    }

    function solve(i) {
      setState(i, "solved");
      if (i + 1 < nodes.length) { setState(i + 1, "active"); var inp = nodes[i + 1].form.querySelector("input"); if (inp && opts.focus !== false) inp.focus(); }
      else root.classList.add("pb-complete");
      if (opts.onChange) opts.onChange(status());
    }

    function status() {
      var st = (S.get().practice[lessonId] || { steps: {} }).steps;
      return { solved: problem.steps.every(function (s) { return st[s.id] && st[s.id].solved; }) };
    }

    // Restore
    var firstOpen = -1;
    problem.steps.forEach(function (s, i) {
      if (saved[s.id] && saved[s.id].solved && firstOpen === -1) setState(i, "solved");
      else if (firstOpen === -1) { firstOpen = i; setState(i, "active"); }
      else setState(i, "locked");
    });
    if (firstOpen === -1) root.classList.add("pb-complete");
    if (CV.tutor && opts.tutor !== false) {
      var tb = h("div", "pb-tutor", '<button type="button" class="btn btn-ghost btn-sm">اسأل المعلم الذكي عن هذه المسألة</button>');
      tb.querySelector("button").addEventListener("click", function () { var c = CV.tutor.fromProblem(problem, lessonId, opts.title || ""); c.attempt = lastFb; CV.tutor.open(c); });
      root.appendChild(tb);
    }
    return { status: status };
  }

  function showFeedback(box, r, where) {
    box.hidden = false;
    if (r.status === "invalid") { box.className = "fb fb-info"; box.innerHTML = "<p>" + r.why + "</p>"; return; }
    var t = r.type && TYPES[r.type];
    var html = '<div class="fb-top">' + (t ? '<span class="fb-type">' + t.ar + ' <span class="ltr">· ' + t.en + '</span></span>' : '<span class="fb-type fb-unk">نمط غير معروف</span>') + '</div>';
    html += '<dl class="fb-grid">';
    html += '<dt>أين؟</dt><dd>الخطوة ' + where.n + '</dd>';
    html += '<dt>لماذا؟</dt><dd>' + r.why + '</dd>';
    if (r.review) html += '<dt>راجع</dt><dd><a class="fb-review" href="#' + r.review.lesson + '" data-lesson="' + r.review.lesson + '" data-sec="' + r.review.section + '">' + r.review.label + '</a></dd>';
    if (r.hint) html += '<dt>تلميح</dt><dd>' + r.hint + '</dd>';
    html += '</dl>';
    if (where.repeat >= 2 && t) html += '<p class="fb-repeat">تكرر معك «' + t.ar + '» ' + where.repeat + ' مرات حتى الآن. خذ لحظة لتراجع هذه النقطة قبل المتابعة.</p>';
    box.className = "fb fb-wrong";
    box.innerHTML = html;
  }

  window.CV = window.CV || {};
  window.CV.feedback = { TYPES: TYPES, parseNumber: parseNumber, evaluateNumber: evaluateNumber, evaluateChoice: evaluateChoice, evaluatePhasor: evaluatePhasor, phasorInput: phasorInput, renderProblem: renderProblem };
})();
