/* CircuitVision — Real-World Engineering, part 2: «from the lessons to the real world». For every published lesson of every
   course: when and why its method is used, and where it is seen in real engineering. These two parts used to sit inside each
   lesson; they live here now so the lessons stay short. The text is the lessons' own (CV.lessons), nothing is added. */
(function () {
  "use strict";
  var root = document.getElementById("rw-root"); if (!root || !(CV.allCourses || CV.courses)) return;
  function part(L, id) { return (L.sections || []).filter(function (s) { return s.id === id; })[0]; }
  var courses = (CV.allCourses || CV.courses || []).map(function (c) {
    var chs = c.chapters.map(function (ch) {
      var ls = ch.lessons.filter(function (l) { return l.published && CV.lessons[l.id] && (part(CV.lessons[l.id], "when") || part(CV.lessons[l.id], "realworld")); });
      return { ch: ch, ls: ls };
    }).filter(function (x) { return x.ls.length; });
    return { c: c, chs: chs };
  }).filter(function (x) { return x.chs.length; });
  if (!courses.length) return;
  var box = document.createElement("section"); box.className = "card rw-uses"; box.id = "uses";
  box.innerHTML = '<div class="sec-h"><h2>من الدروس إلى الواقع</h2><span class="en">From the lessons to the real world</span></div>' +
    '<p class="muted">لكل درس: متى ولماذا نستخدم طريقته، وأين تراه في الهندسة الحقيقية.</p>' +
    courses.map(function (x) {
      return '<h3 class="rw-c">' + x.c.ar + '</h3>' + x.chs.map(function (y) {
        return '<p class="rw-ch muted small">' + y.ch.ar + '</p>' + y.ls.map(function (l) {
          var L = CV.lessons[l.id], w = part(L, "when"), r = part(L, "realworld");
          return '<details class="rw-l" id="use-' + l.id + '"><summary>' + L.ar + (L.en ? ' <span class="en">' + L.en + '</span>' : '') + '</summary>' +
            (w ? '<h4>متى ولماذا نستخدمه؟</h4>' + w.html : '') + (r ? '<h4>في الواقع</h4>' + r.html : '') +
            '<p><a class="lk" href="lesson.html#' + l.id + '">← ارجع للدرس</a></p></details>';
        }).join("");
      }).join("");
    }).join("");
  root.appendChild(box);
  function open() { var m = /^#use-(.+)$/.exec(location.hash); if (!m) return; var d = document.getElementById("use-" + m[1]); if (d) { d.open = true; setTimeout(function () { d.scrollIntoView({ block: "start" }); }, 50); } }
  window.addEventListener("hashchange", open); open();
})();
