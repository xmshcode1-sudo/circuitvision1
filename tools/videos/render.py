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
            await pg.evaluate("([s, m]) => window.show(s, m)", [s, {"id": plan["id"], "n": plan["n"], "progress": t / total}])
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

def main():
    plans = json.load(open(sys.argv[1], encoding="utf8"))
    for eid in sys.argv[2:]:
        plan = plans[eid]; n = plan["n"]
        outdir = "/tmp/clab-frames/" + eid; os.makedirs(outdir, exist_ok=True)
        for f in os.listdir(outdir): os.remove(os.path.join(outdir, f))
        files = asyncio.run(shoot(plan, outdir))
        out = os.path.join(ROOT, "clab-lab%d.mp4" % n)
        encode(files, out)
        Image.open(files[0][0]).convert("RGB").resize((1280, 720)).save(os.path.join(ROOT, "clab-lab%d.jpg" % n), quality=82)
        d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration,size", "-of", "csv=p=0", out], capture_output=True, text=True).stdout.strip()
        print(eid, "→", os.path.basename(out), d)

if __name__ == "__main__":
    main()
