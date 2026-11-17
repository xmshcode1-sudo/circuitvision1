"""CircuitVision — render the Signals and Systems lesson videos (ss-<lesson>.mp4 + .jpg poster) from the same lesson data
   the page shows (CV.ssVideo, built by ss-build.js). Run a server on 8765 from the repository root, then:
   python3 tools/videos/ss-render.py [lesson ids …]   (no ids = all lessons). Writes ss-video-durations.js too."""
import sys, os, json, asyncio, subprocess
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
URL = "http://localhost:8765/tools/videos/ss-studio.html"
FPS, FADE = 30, 0.3

def encode(files, out):
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE); prev = None; nf = int(FADE * FPS)
    for f, dur, still in files:
        cur = np.asarray(Image.open(f).convert("RGB"), dtype=np.uint8); n = max(1, int(round(dur * FPS)))
        if prev is not None and not still:
            a, c = prev.astype(np.float32), cur.astype(np.float32)
            for i in range(1, nf + 1):
                w = i / (nf + 1); pr.stdin.write((a * (1 - w) + c * w).astype(np.uint8).tobytes())
            n = max(1, n - nf)
        raw = cur.tobytes()
        for _ in range(n): pr.stdin.write(raw)
        prev = cur
    pr.stdin.close(); pr.wait()

async def main(ids):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL, wait_until="load"); await pg.wait_for_timeout(300)
        allv = await pg.evaluate("window.list()")
        durs = {}
        for v in allv:
            if ids and v["id"] not in ids: continue
            out = "/tmp/ss-frames/" + v["id"]; os.makedirs(out, exist_ok=True)
            total = sum(v["scenes"]); t = 0; files = []
            stills = await pg.evaluate("(id) => CV.ssVideo[id].map(s => !!s.still)", v["id"])
            for i, d in enumerate(v["scenes"]):
                await pg.evaluate("([id, i, p]) => window.show(id, i, p)", [v["id"], i, t / total])
                f = os.path.join(out, "%03d.png" % i); await pg.screenshot(path=f); files.append((f, d, stills[i])); t += d
            mp4 = os.path.join(ROOT, "ss-" + v["id"][3:] + ".mp4") if v["id"].startswith("ss-") else os.path.join(ROOT, v["id"] + ".mp4")
            mp4 = os.path.join(ROOT, v["id"] + ".mp4")
            encode(files, mp4)
            Image.open(files[0][0]).convert("RGB").resize((960, 540)).save(mp4[:-4] + ".jpg", quality=82)
            sec = int(round(total)); durs[v["id"]] = "%d:%02d" % (sec // 60, sec % 60)
            print(v["id"], durs[v["id"]], len(files), "scenes", flush=True)
        await b.close()
        if errs: print("page errors:", errs[:5])
        old = {}
        pth = os.path.join(ROOT, "ss-video-durations.js")
        try:
            txt = open(pth).read(); old = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
        except Exception: pass
        old.update(durs)
        open(pth, "w").write("/* Durations of the Signals and Systems lesson videos (written by tools/videos/ss-render.py). */\n(function () { var D = " + json.dumps(old, sort_keys=True) + "; var L = window.CV && window.CV.lessons; if (L) for (var k in D) if (L[k]) L[k].videoDur = D[k]; })();\n")

asyncio.run(main(sys.argv[1:]))
