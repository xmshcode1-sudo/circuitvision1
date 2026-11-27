"""CircuitVision — render Circuits 1 LAB videos (clab-lab<n>.mp4) from clab-explain-<n>.js drawn by clab-explain.js in
   clab-explain-studio.html: animated real bench, English on screen, Arabic in clab-lab<n>.ar.vtt, sound effects only (mixed in, no music).
   python3 tools/videos/clab-explain-render.py [ids …]   e.g. clab-lab1"""
import sys, os, json, asyncio, subprocess, base64, math, time, io, wave
import numpy as np
from PIL import Image
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
URL = "http://localhost:8765/tools/videos/clab-explain-studio.html"
FPS = 30; SR = 44100
import importlib.util
spec = importlib.util.spec_from_file_location("er", os.path.join(os.path.dirname(__file__), "explain-render.py").replace("explain-render", "explain-render"))

def vtt_time(t): return "%02d:%02d:%06.3f" % (int(t // 3600), int(t % 3600 // 60), t % 60)
import re
def chunks(text, n=80):
    parts = [p.strip() for p in re.split(r"(?<=[.،؛:!؟])\s+", text) if p.strip()]; out, cur = [], ""
    for p in parts:
        if len(cur) + len(p) + 1 <= n or not cur: cur = (cur + " " + p).strip()
        else: out.append(cur); cur = p
    if cur: out.append(cur)
    return out or [text]
def write_vtt(path, subs):
    L = ["WEBVTT", ""]; k = 0
    for a, b, txt in subs:
        cs = chunks(txt); tot = sum(len(c) for c in cs) or 1; u = a
        for c in cs:
            w = (b - a) * len(c) / tot; k += 1; L += [str(k), vtt_time(u) + " --> " + vtt_time(u + w - 0.04), c, ""]; u += w
    open(path, "w").write("\n".join(L))

def tone(f0, f1, d, env, vol=0.4):
    n = int(SR * d); t = np.arange(n) / SR; f = f0 + (f1 - f0) * t / d; ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(t, d) * vol
def noise(d, lp, vol):
    n = int(SR * d); x = np.random.RandomState(1).randn(n); k = np.ones(lp) / lp; return np.convolve(x, k, "same") * vol * np.exp(-np.arange(n) / SR * 18)
def fx(kind):
    dec = lambda r: (lambda t, d: np.exp(-t * r) * np.minimum(1, t * 400))
    if kind == "pop": return tone(520, 220, .16, dec(22)) + noise(.16, 6, .18)
    if kind == "click": return noise(.05, 3, .9)[:int(SR * .05)] + tone(1800, 900, .05, dec(60), .25)
    if kind == "tick": return tone(1500, 1500, .05, dec(70), .3)
    if kind == "dial": return tone(900, 900, .08, dec(40), .18) + noise(.08, 4, .35)
    if kind == "ding": return tone(1320, 1320, .55, dec(6), .32) + tone(1980, 1980, .55, dec(8), .14)
    if kind == "whoosh":
        n = int(SR * .7); x = np.random.RandomState(2).randn(n); k = np.ones(40) / 40; y = np.convolve(x, k, "same"); t = np.arange(n) / SR
        return y * np.sin(np.pi * t / .7) ** 2 * .9
    return np.zeros(10)

def mix(sfx, total, path):
    buf = np.zeros(int(SR * (total + 1.5)))
    for t, k in sfx:
        s = fx(k); i = int(t * SR); buf[i:i + len(s)] += s[:len(buf) - i]
    buf = np.clip(buf, -1, 1)
    with wave.open(path, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf * 32000).astype("<i2").tobytes())

async def render(pg, cdp, vid):
    info = await pg.evaluate("(id) => EX.info(id)", vid); total = info["dur"]; n = int(math.ceil(total * FPS))
    mp4 = os.path.join(ROOT, vid + ".mp4"); silent = mp4 + ".v.mp4"; wav = mp4 + ".wav"
    MUX = "--mux" in sys.argv and os.path.exists(silent)
    ff = None if MUX else subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-c:v", "mjpeg", "-framerate", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p", silent], stdin=subprocess.PIPE)
    last = None; shots = 0; thumb_t = info["scenes"][1][0] + 4
    for k in range(0 if MUX else n):
        t = k / FPS; r = await pg.evaluate("([id, t]) => EX.frame(id, t)", [vid, t])
        if r["busy"] or last is None:
            last = base64.b64decode((await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 90, "optimizeForSpeed": True}))["data"]); shots += 1
        ff.stdin.write(last)
        if abs(t - thumb_t) < 0.5 / FPS: Image.open(io.BytesIO(last)).convert("RGB").resize((960, 540)).save(mp4[:-4] + ".jpg", quality=82)
    if ff: ff.stdin.close(); ff.wait()
    mix(info["sfx"], total, wav)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", mp4], check=True)
    os.remove(silent); os.remove(wav); write_vtt(mp4[:-4] + ".ar.vtt", info["subs"])
    return total, shots, n

async def main(args):
    for e in ("exp1",):  # plan of every lab that has a script
        pass
    plan = {}
    for k in range(1, 11):
        subprocess.run("node tools/videos/clab-plan.js exp%d > /tmp/_p%d.json" % (k, k), shell=True, cwd=ROOT, check=True); plan.update(json.load(open("/tmp/_p%d.json" % k)))
    open(os.path.join(ROOT, "tools/videos/_plan.json"), "w").write(json.dumps(plan))
    srv = subprocess.Popen(["python3", "-m", "http.server", "8765"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"]); pg = await b.new_page(viewport={"width": 1920, "height": 1080}); cdp = await pg.context.new_cdp_session(pg)
            errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
            await pg.goto(URL, wait_until="load"); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(300)
            for vid in await pg.evaluate("EX.list()"):
                if args and not any(vid == a for a in args): continue
                t0 = time.time(); total, shots, n = await render(pg, cdp, vid); print(vid, "%.0fs" % total, "%d/%d frames" % (shots, n), "%.0fs" % (time.time() - t0), flush=True)
            if errs: print("errors:", errs[:6])
            await b.close()
    finally: srv.kill()
asyncio.run(main([a for a in sys.argv[1:] if not a.startswith("--")]))
