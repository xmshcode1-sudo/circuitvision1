"""CircuitVision — render the Circuits 1 lab explainer videos.
   1) node tools/videos/clab-plan.js > /tmp/clab-plan.json          (scene list, readings checked against the page)
   2) python3 -m http.server 8765   (from the repository root)
   3) python3 tools/videos/render.py /tmp/clab-plan.json exp1 [exp2 ...]
   Writes clab-lab<n>.mp4 (1920×1080, 30 fps, silent, like logic-lab<n>.mp4) and clab-lab<n>.jpg (poster) in the repository root.
   Needs: playwright (chromium), ffmpeg, numpy, pillow."""
import sys, os, json, asyncio, subprocess
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
URL = "http://localhost:8765/tools/videos/studio.html"
FPS, FADE = 30, 0.3

async def shoot(plan, outdir):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL, wait_until="load")
        await pg.wait_for_timeout(400)
        total = sum(s["dur"] for s in plan["scenes"]); t = 0; files = []
        for k, s in enumerate(plan["scenes"]):
            await pg.evaluate("([s, m]) => window.show(s, m)", [s, {"id": plan["id"], "n": plan["n"], "label": plan.get("label"), "progress": t / total}])
            await pg.wait_for_timeout(60)
            f = os.path.join(outdir, "%03d.png" % k)
            await pg.screenshot(path=f)
            files.append((f, s["dur"])); t += s["dur"]
        await b.close()
        if errs: print("page errors:", errs[:5])
        return files

def encode(files, out):
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    prev = None; nf = int(FADE * FPS)
    for f, dur in files:
        cur = np.asarray(Image.open(f).convert("RGB"), dtype=np.uint8)
        n = max(1, int(round(dur * FPS)))
        if prev is not None:
            a, c = prev.astype(np.float32), cur.astype(np.float32)
            for i in range(1, nf + 1):
                w = i / (nf + 1); pr.stdin.write((a * (1 - w) + c * w).astype(np.uint8).tobytes())
            n = max(1, n - nf)
        raw = cur.tobytes()
        for _ in range(n): pr.stdin.write(raw)
        prev = cur
    pr.stdin.close(); pr.wait()

import re
AR = re.compile("[\u0600-\u06ff]")
def tr(o, D, miss, key=None):
    if key == "state": return o
    if isinstance(o, str):
        if not AR.search(o): return o
        if o in D: return D[o]
        miss.add(o); return o
    if isinstance(o, list): return [tr(v, D, miss, key) for v in o]
    if isinstance(o, dict): return {k: tr(v, D, miss, k) for k, v in o.items()}
    return o
def artext(s):
    p = s.get("panel") or {}
    if s.get("kind") == "card": parts = [s.get("title", "")] + list(s.get("lines") or [])
    else: parts = [p.get("title", ""), p.get("sub", "")] + list(p.get("lines") or []) + list(p.get("steps") or []) + [p.get("note", "")]
    return " — ".join(x for x in parts if x)
def vtt(plan_ar, out):
    def ts(t): return "%02d:%02d:%06.3f" % (int(t // 3600), int(t % 3600 // 60), t % 60)
    L = ["WEBVTT", ""]; t = 0; k = 0
    for s in plan_ar["scenes"]:
        txt = artext(s).strip(); d = s["dur"]
        if txt:
            ch = []; cur = ""
            for w in re.split(r"(?<=[.:؟!])\s+", txt):
                if cur and len(cur) + len(w) > 84: ch.append(cur); cur = w
                else: cur = (cur + " " + w).strip()
            if cur: ch.append(cur)
            for j, c in enumerate(ch):
                a = t + d * j / len(ch); b = t + d * (j + 1) / len(ch); k += 1
                L += [str(k), ts(a) + " --> " + ts(b), c, ""]
        t += d
    open(out, "w").write("\n".join(L))

def main():
    global URL
    args = sys.argv[1:]; en = "--en" in args; args = [a for a in args if a != "--en"]
    plans = json.load(open(args[0], encoding="utf8"))
    D = json.load(open("/tmp/i18n/clab-dict.json")) if en else {}
    if en: URL = URL + "?lang=en"
    for eid in args[1:]:
        plan = plans[eid]; n = plan["n"]; plan_ar = plan
        if en:
            miss = set(); plan = tr(plan, D, miss)
            if miss: print(eid, "SKIP missing", len(miss), list(miss)[:3]); continue
        outdir = "/tmp/clab-frames/" + eid; os.makedirs(outdir, exist_ok=True)
        for f in os.listdir(outdir): os.remove(os.path.join(outdir, f))
        files = asyncio.run(shoot(plan, outdir))
        name = plan.get("out") or ("clab-lab%d" % n)
        out = os.path.join(ROOT, name + ".mp4")
        encode(files, out)
        Image.open(files[0][0]).convert("RGB").resize((1280, 720)).save(os.path.join(ROOT, name + ".jpg"), quality=82)
        d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
        if en: vtt(plan_ar, out[:-4] + ".ar.vtt")
        print(eid, "→", os.path.basename(out), d)

if __name__ == "__main__":
    main()
