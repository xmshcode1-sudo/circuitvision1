"""CircuitVision — render the Circuits 1 lesson videos (c1-*.mp4) from the explainer scripts (c1-explain-*.js) drawn by
   explain.js in explain-studio.html: English on screen, the Arabic of every beat in a subtitle track (c1-*.ar.vtt).
   Serves the repository itself on port 8765 while it runs.
   python3 tools/videos/explain-render.py [lesson ids or prefixes …]   (no ids = every scripted lesson)
   Each frame is drawn by EX.frame(id, t); only frames where something moves are captured, the rest repeat the last image."""
import sys, os, json, asyncio, subprocess, base64, math, re, time, io
from PIL import Image
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
URL = "http://localhost:8765/tools/videos/explain-studio.html"
FPS = 30

def vtt_time(t):
    h = int(t // 3600); m = int(t % 3600 // 60); x = t % 60
    return "%02d:%02d:%06.3f" % (h, m, x)

def chunks(text, n=80):   # split a beat's Arabic into subtitle lines of about n characters, at sentence or comma breaks
    parts = [p.strip() for p in re.split(r"(?<=[.،؛:!؟])\s+", text) if p.strip()]
    out, cur = [], ""
    for p in parts:
        if len(cur) + len(p) + 1 <= n or not cur: cur = (cur + " " + p).strip()
        else: out.append(cur); cur = p
        while len(cur) > n * 1.5:
            cut = cur.rfind(" ", 0, n); cut = cut if cut > 20 else n; out.append(cur[:cut].strip()); cur = cur[cut:].strip()
    if cur: out.append(cur)
    return out or [text]

def write_vtt(path, subs):
    lines = ["WEBVTT", ""]; k = 0
    for a, b, txt in subs:
        cs = chunks(txt); L = sum(len(c) for c in cs) or 1; u = a
        for c in cs:
            w = (b - a) * len(c) / L; k += 1; lines += [str(k), vtt_time(u) + " --> " + vtt_time(u + w - 0.04), c, ""]; u += w
    open(path, "w").write("\n".join(lines))

async def render(pg, cdp, vid):
    info = await pg.evaluate("(id) => EX.info(id)", vid)
    total = info["dur"]; n = int(math.ceil(total * FPS))
    mp4 = os.path.join(ROOT, vid + ".mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], stdin=subprocess.PIPE)
    last = None; shots = 0; thumb_t = info["scenes"][0][1] - 0.6
    for k in range(n):
        t = k / FPS
        r = await pg.evaluate("([id, t]) => EX.frame(id, t)", [vid, t])
        if r["busy"] or last is None:
            last = base64.b64decode((await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 90, "optimizeForSpeed": True}))["data"]); shots += 1
        ff.stdin.write(last)
        if abs(t - thumb_t) < 0.5 / FPS: Image.open(io.BytesIO(last)).convert("RGB").resize((960, 540)).save(mp4[:-4] + ".jpg", quality=82)
    ff.stdin.close(); ff.wait()
    write_vtt(mp4[:-4] + ".ar.vtt", info["subs"])
    return total, shots, n

async def main(args):
    srv = subprocess.Popen(["python3", "-m", "http.server", "8765"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    durs = {}; done = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"])
            pg = await b.new_page(viewport={"width": 1920, "height": 1080}); cdp = await pg.context.new_cdp_session(pg)
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(URL, wait_until="load"); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            ids = await pg.evaluate("EX.list()")
            want = [a for a in args if not a.startswith("--")]
            for vid in ids:
                if want and not any(vid == x or vid.startswith(x) for x in want): continue
                t0 = time.time()
                try: total, shots, n = await render(pg, cdp, vid)
                except Exception as e: print(vid, "FAILED", e, flush=True); continue
                sec = int(round(total)); durs[vid] = "%d:%02d" % (sec // 60, sec % 60); done.append(vid); save(durs, done)
                print(vid, durs[vid], "%d/%d frames captured" % (shots, n), "%.0fs" % (time.time() - t0), flush=True)
            if errs: print("page errors:", errs[:5])
            await b.close()
    finally: srv.kill()
    save(durs, done)

def save(durs, done):   # after every video, so an interrupted run keeps what it finished
    pth = os.path.join(ROOT, "ss-video-durations.js"); txt = open(pth).read()
    D = json.loads(txt[txt.index("var D = ") + 8:txt.index("; var L")]); A = json.loads(txt[txt.index("var A = ") + 8:txt.index("; window.CV.videoAr")])
    D.update(durs); A = sorted(set(A) | set(done))
    open(pth, "w").write("/* Durations of the lesson videos, and the videos that are in English with an Arabic subtitle track (written by tools/videos/lesson-render.py and explain-render.py). */\n(function () { var D = " + json.dumps(D, sort_keys=True) + "; var L = window.CV && window.CV.lessons; window.CV = window.CV || {}; window.CV.videoDur = D; if (L) for (var k in D) if (L[k]) L[k].videoDur = D[k]; var A = " + json.dumps(A) + "; window.CV.videoAr = A; })();\n")

asyncio.run(main(sys.argv[1:]))
