"""CircuitVision — render a Logic Design lab video from the lab page's own experiment, trainer and solutions.
   1) python3 -m http.server 8765   (from the repository root)
   2) python3 tools/videos/logic-render.py [--en] exp7 [exp… ]
   Writes logic-lab<n>.mp4 (1920×1080, 30 fps, silent) and logic-lab<n>.jpg (poster) in the repository root.
   --en: the video in English (text from tools/videos/logic-en.js) with Arabic subtitles in logic-lab<n>.ar.vtt.
   Needs: playwright (chromium), ffmpeg, numpy, pillow."""
import sys, os, re, asyncio, subprocess
from PIL import Image
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
from render import encode, ROOT

URL = "http://localhost:8765/tools/videos/logic-studio.html"

async def arabic(eid):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
        pg = await b.new_page()
        await pg.goto(URL, wait_until="load")
        plan = await pg.evaluate("(id) => window.plan(id)", eid)
        await b.close()
        return plan

def vtt(plan, out):
    def ts(t): return "%02d:%02d:%06.3f" % (int(t // 3600), int(t % 3600 // 60), t % 60)
    L = ["WEBVTT", ""]; t = 0; k = 0
    for s in plan:
        d = s["dur"]
        if d <= 0: continue
        txt = s.get("ar", "").strip()
        if txt:
            ch = []; cur = ""
            for w in re.split(r"\s+—\s+|(?<=[.؟!])\s+", txt):
                if cur and len(cur) + len(w) > 84: ch.append(cur); cur = w
                else: cur = (cur + " — " + w) if cur else w
            if cur: ch.append(cur)
            for j, c in enumerate(ch):
                a = t + d * j / len(ch); b = t + d * (j + 1) / len(ch); k += 1
                L += [str(k), ts(a) + " --> " + ts(b), c.strip(" —"), ""]
        t += d
    open(out, "w", encoding="utf8").write("\n".join(L))

async def shoot(eid, outdir, en=False):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=1)
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL + ("?lang=en" if en else ""), wait_until="load")
        await pg.wait_for_timeout(400)
        plan = await pg.evaluate("(id) => window.plan(id)", eid)
        total = sum(s["dur"] for s in plan); t = 0; files = []
        for k, s in enumerate(plan):
            await pg.evaluate("([i, p]) => window.show(i, p)", [k, t / total])
            if s["dur"] <= 0: continue
            await pg.wait_for_timeout(40)
            f = os.path.join(outdir, "%04d.png" % k)
            await pg.screenshot(path=f)
            files.append((f, s["dur"])); t += s["dur"]
        miss = await pg.evaluate("() => window.missing()")
        if miss: print("no English for", len(miss), "strings:", miss[:3])
        await b.close()
        if errs: print("page errors:", errs[:5])
        return files

def main():
    args = sys.argv[1:]; en = "--en" in args; args = [a for a in args if a != "--en"]
    for eid in args:
        n = int(eid.replace("exp", ""))
        outdir = "/tmp/logic-frames/" + eid; os.makedirs(outdir, exist_ok=True)
        for f in os.listdir(outdir): os.remove(os.path.join(outdir, f))
        files = asyncio.run(shoot(eid, outdir, en))
        out = os.path.join(ROOT, "logic-lab%d.mp4" % n)
        encode(files, out)
        Image.open(files[0][0]).convert("RGB").resize((1280, 720)).save(os.path.join(ROOT, "logic-lab%d.jpg" % n), quality=82)
        if en: vtt(asyncio.run(arabic(eid)), out[:-4] + ".ar.vtt")
        d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
        print(eid, "→", os.path.basename(out), d, len(files), "frames")

if __name__ == "__main__":
    main()
