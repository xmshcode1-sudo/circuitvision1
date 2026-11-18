"""CircuitVision — run every MATLAB script in matlab/*.m and record what it prints and draws.
   Each script is split at its %% sections; a runner adds a marker before every section and saves the figure after
   every section that draws. It runs in GNU Octave (MATLAB-compatible core functions only; the scripts use fprintf for
   every number so the printed text is the same in MATLAB). Output: matlab-data.js and matlab/fig/<id>-<k>.png.
   python3 tools/matlab/build.py [ids…]   (no ids = all). Fails loudly if a script errors or a check fails."""
import os, re, sys, json, subprocess, glob, tempfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MD, FIG = os.path.join(ROOT, "matlab"), os.path.join(ROOT, "matlab", "fig")
DRAW = re.compile(r"\b(plot|stem|subplot|figure|xlabel|ylabel|title|legend|hold|axis|grid|stairs|area|bar|semilogx|semilogy|loglog|compass|text|yline|xline|fill)\s*\(?")

def parse(path):
    src = open(path, encoding="utf8").read().replace("\r", "")
    lines = src.split("\n"); head = {"title": "", "ar": "", "lesson": "", "course": "", "level": ""}
    secs, cur = [], None
    for ln in lines:
        m = re.match(r"%(title|ar-title|lesson|course|level):\s*(.*)$", ln)
        if m and cur is None:
            k = {"title": "title", "ar-title": "ar", "lesson": "lesson", "course": "course", "level": "level"}[m.group(1)]; head[k] = m.group(2).strip(); continue
        m = re.match(r"%%(!?)\s*(.*)$", ln)
        if m:
            cur = {"t": m.group(2).strip(), "project": m.group(1) == "!", "ar": [], "code": [], "checks": []}; secs.append(cur); continue
        if cur is None: continue
        m = re.match(r"\s*%check:\s*(.*)$", ln)
        if m: cur["checks"].append(m.group(1)); continue
        m = re.match(r"\s*%ar:\s*(.*)$", ln)
        if m: cur["ar"].append(m.group(1)); continue
        cur["code"].append(ln)
    for s in secs:
        while s["code"] and not s["code"][-1].strip(): s["code"].pop()
        while s["code"] and not s["code"][0].strip(): s["code"].pop(0)
        s["code"] = "\n".join(s["code"])
    return head, secs, src

def student_file(src):   # the downloadable script: the Arabic notes stay as comments
    return "\n".join(l for l in src.split("\n") if not re.match(r"\s*%check:", l))

def run(id_, secs):
    # MATLAB wants local functions at the END of a script; Octave wants them defined BEFORE use (after a leading "1;").
    # So the runner takes every top-level function block out of the sections and puts it first.
    funcs = []
    def take(code):
        out, buf, inside = [], [], False
        for ln in code.split("\n"):
            if re.match(r"^function\b", ln): inside = True
            (buf if inside else out).append(ln)
            if inside and re.match(r"^end\s*$", ln): funcs.append("\n".join(buf)); buf, inside = [], False
        return "\n".join(out)
    body = ["1;", "graphics_toolkit('qt'); set(0,'defaultfigurevisible','off'); set(0,'defaultfigureposition',[0 0 900 520]);",
            "set(0,'defaultaxesfontsize',11); set(0,'defaulttextfontsize',11); set(0,'defaultlinelinewidth',1.5);"]
    codes = [take(s["code"]) for s in secs]
    drawers = [re.match(r"function\s+(?:\[[^\]]*\]\s*=\s*|\w+\s*=\s*)?(\w+)", f).group(1) for f in funcs if DRAW.search(re.sub(r"%.*", "", f))]
    for k, s in enumerate(secs):
        body.append("fprintf('@@SEC %d@@\\n');" % k)
        code = codes[k]
        body.append(code)
        for c in s["checks"]: body.append("if ~(%s), error('CHECK FAILED: %s'); end" % (c, c.replace("'", "''")))
        plain = re.sub(r"%.*", "", code)
        if DRAW.search(plain) or any(re.search(r"\b%s\s*\(" % d, plain) for d in drawers):
            body.append("if ~isempty(get(0,'children')), drawnow; print(gcf,'-dpng','-r150','%s'); fprintf('@@FIG %d@@\\n'); end" % (os.path.join(FIG, "%s-%d.png" % (id_, k)), k))
    body = body[:1] + funcs + body[1:]
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "cvrun.m"); open(p, "w", encoding="utf8").write("\n".join(body) + "\n")
        r = subprocess.run(["xvfb-run", "-a", "-s", "-screen 0 1920x1080x24", "octave", "--no-gui", "--quiet", p], capture_output=True, text=True, timeout=240, cwd=d)
    if r.returncode != 0 or "error:" in r.stderr:
        print(r.stdout[-2000:]); print(r.stderr[-3000:]); raise SystemExit("FAILED: " + id_)
    outs, figs, k = {}, set(), None
    for ln in r.stdout.split("\n"):
        m = re.match(r"@@SEC (\d+)@@$", ln)
        if m: k = int(m.group(1)); outs[k] = []; continue
        m = re.match(r"@@FIG (\d+)@@$", ln)
        if m: figs.add(int(m.group(1))); continue
        if k is not None and not ln.startswith("warning:"): outs[k].append(ln)
    for k in outs:
        outs[k] = [l for l in outs[k] if not re.match(r"^\s{4}\S+ at line \d+", l)]
        while outs[k] and not outs[k][-1].strip(): outs[k].pop()
        if any("NaN" in l for l in outs[k]): raise SystemExit("FAILED: %s section %d printed NaN" % (id_, k))
    return outs, figs

def main(ids):
    data_p = os.path.join(ROOT, "matlab-data.js"); data = {}
    if os.path.exists(data_p):
        t = open(data_p, encoding="utf8").read(); data = json.loads(t[t.index("CV.matlab = ") + 12:t.rindex(";")])
    files = sorted(glob.glob(os.path.join(MD, "*.m")))
    for f in files:
        id_ = os.path.basename(f)[:-2]
        if ids and not any(id_ == x or id_.startswith(x) for x in ids): continue
        head, secs, src = parse(f)
        open(os.path.join(MD, "dl", id_ + ".m"), "w", encoding="utf8").write(student_file(src))
        for old in glob.glob(os.path.join(FIG, id_ + "-*.png")): os.remove(old)
        outs, figs = run(id_, secs)
        data[id_] = {"id": id_, "title": head["title"], "ar": head["ar"], "lesson": head["lesson"], "course": head["course"], "level": head["level"], "file": "matlab/dl/" + id_ + ".m", "checks": sum(len(x["checks"]) for x in secs),
                     "sections": [{"t": s["t"], "project": s["project"], "ar": s["ar"], "code": s["code"], "out": "\n".join(outs.get(k, [])), "fig": ("matlab/fig/%s-%d.png" % (id_, k)) if k in figs else None} for k, s in enumerate(secs)]}
        print(id_, len(secs), "sections,", len(figs), "figures", flush=True)
        save(data_p, data)
    save(data_p, data)

def save(data_p, data):
    os.makedirs(os.path.join(MD, "data"), exist_ok=True)
    idx = {}
    for k, v in data.items():
        open(os.path.join(MD, "data", k + ".json"), "w", encoding="utf8").write(json.dumps(v, ensure_ascii=False))
        idx[k] = {"title": v["title"], "ar": v["ar"], "lesson": v["lesson"], "course": v["course"], "level": v["level"], "checks": v["checks"], "n": len(v["sections"]), "figs": sum(1 for x in v["sections"] if x["fig"])}
    open(os.path.join(ROOT, "matlab-index.js"), "w", encoding="utf8").write("/* Index of the MATLAB scripts (tools/matlab/build.py). The full script of each is in matlab/data/<id>.json. */\nwindow.CV = window.CV || {}; window.CV.matlabIndex = " + json.dumps(idx, ensure_ascii=False, sort_keys=True) + ";\n")
    open(data_p, "w", encoding="utf8").write("/* MATLAB scripts of the lessons: code, what it prints and draws (tools/matlab/build.py, run in GNU Octave 8 (qt graphics under xvfb)). */\nwindow.CV = window.CV || {}; window.CV.matlab = " + json.dumps(data, ensure_ascii=False, sort_keys=True) + ";\n")

main(sys.argv[1:])
