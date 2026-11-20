"""CircuitVision — render the lesson videos of Signals and Systems (ss-*) and Logic Design (ld-*) from the lesson data
   (CV.ssVideo, built by ss-build.js) in the lab-video frame (tools/videos/lesson-studio.html). Server on 8765 from the repository root, then:
   python3 tools/videos/lesson-render.py [lesson ids or prefixes …]   (no ids = all). Updates ss-video-durations.js."""
import sys, os, json, asyncio, subprocess
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
URL = "http://localhost:8765/tools/videos/lesson-studio.html"
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

ANIM, ANF = 1.0, 9   # the first second of a scene is animated (window.anim), in ANF frames

def vtt_time(t):
    h = int(t // 3600); m = int(t % 3600 // 60); x = t % 60
    return "%02d:%02d:%06.3f" % (h, m, x)

def chunks(text, n=84):   # split a scene's Arabic into subtitle lines of about n characters, at sentence or comma breaks
    import re
    parts = [p.strip() for p in re.split(r"(?<=[.،؛:!؟])\s+", text) if p.strip()]
    out, cur = [], ""
    for p in parts:
        if len(cur) + len(p) + 1 <= n or not cur: cur = (cur + " " + p).strip()
        else: out.append(cur); cur = p
        while len(cur) > n * 1.6:
            cut = cur.rfind(" ", 0, n); cut = cut if cut > 20 else n; out.append(cur[:cut].strip()); cur = cur[cut:].strip()
    if cur: out.append(cur)
    return out or [text]

async def main(ids):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        EN = "--en" in sys.argv
        await pg.goto(URL + ("?lang=en" if EN else ""), wait_until="load"); await pg.wait_for_timeout(500)
        allv = await pg.evaluate("window.list()")
        durs = {}; subsDone = []
        for v in allv:
            if [y for y in ids if not y.startswith("--")] and not any(v["id"] == x or v["id"].startswith(x) for x in [y for y in ids if not y.startswith("--")]): continue
            out = "/tmp/ss-frames/" + v["id"]; os.makedirs(out, exist_ok=True)
            total = sum(v["scenes"]); t = 0; files = []
            stills = v["still"]
            if EN:   # no Arabic may be left on screen: list what is missing and skip the video
                miss = set()
                for i in range(len(v["scenes"])):
                    await pg.evaluate("([id, i, p]) => window.show(id, i, p)", [v["id"], i, 0])
                    for x in await pg.evaluate("window.missing()"): miss.add(x)
                if miss:
                    os.makedirs("/tmp/missing", exist_ok=True); open("/tmp/missing/" + v["id"] + ".json", "w").write(json.dumps(sorted(miss), ensure_ascii=False, indent=0))
                    print(v["id"], "SKIPPED:", len(miss), "texts without English", flush=True); continue
            subs = []
            for i, d in enumerate(v["scenes"]):
                await pg.evaluate("([id, i, p]) => window.show(id, i, p)", [v["id"], i, t / total])
                if EN: subs.append((t, t + d, await pg.evaluate("([id, i]) => window.arText(id, i)", [v["id"], i])))
                animate = not stills[i] and d > ANIM + 0.5 and await pg.evaluate("window.animPrep()")
                if animate:
                    for k in range(ANF):
                        await pg.evaluate("(t) => window.anim(t)", k / (ANF - 1))
                        f = os.path.join(out, "%03d-%02d.png" % (i, k)); await pg.screenshot(path=f)
                        files.append((f, ANIM / ANF if k < ANF - 1 else d - ANIM * (ANF - 1) / ANF, stills[i] or k > 0))
                else:
                    f = os.path.join(out, "%03d.png" % i); await pg.screenshot(path=f); files.append((f, d, stills[i]))
                t += d
            mp4 = os.path.join(ROOT, v["id"] + ".mp4")
            encode(files, mp4)
            Image.open(files[0][0]).convert("RGB").resize((960, 540)).save(mp4[:-4] + ".jpg", quality=82)
            if EN:   # the Arabic of every scene as a subtitle track, timed with the scenes
                lines = ["WEBVTT", ""]; k = 0
                for a, b2, txt in subs:
                    cs = chunks(txt); L = sum(len(c) for c in cs) or 1; u = a
                    for c in cs:
                        w = (b2 - a) * len(c) / L; k += 1; lines += [str(k), vtt_time(u) + " --> " + vtt_time(u + w), c, ""]; u += w
                open(mp4[:-4] + ".ar.vtt", "w").write("\n".join(lines)); subsDone.append(v["id"])
            sec = int(round(total)); durs[v["id"]] = "%d:%02d" % (sec // 60, sec % 60)
            print(v["id"], durs[v["id"]], len(files), "scenes", flush=True)
        await b.close()
        if errs: print("page errors:", errs[:5])
        old = {}
        pth = os.path.join(ROOT, "ss-video-durations.js")
        try:
            txt = open(pth).read(); old = json.loads(txt[txt.index("var D = ") + 8:txt.index("; var L")])
        except Exception: pass
        old.update(durs)
        subs0 = []
        try: subs0 = json.loads(txt[txt.index("var A = ") + 8:txt.index("; window.CV.videoAr")])
        except Exception: pass
        subsAll = sorted(set(subs0) | set(subsDone))
        open(pth, "w").write("/* Durations of the lesson videos, and the videos that are in English with an Arabic subtitle track (written by tools/videos/lesson-render.py). */\n(function () { var D = " + json.dumps(old, sort_keys=True) + "; var L = window.CV && window.CV.lessons; window.CV = window.CV || {}; window.CV.videoDur = D; if (L) for (var k in D) if (L[k]) L[k].videoDur = D[k]; var A = " + json.dumps(subsAll) + "; window.CV.videoAr = A; })();\n")

asyncio.run(main(sys.argv[1:]))
