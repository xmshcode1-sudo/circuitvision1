"""List the Arabic texts of the lesson videos that have no English yet: python3 tools/videos/i18n-scan.py <id prefix>
   → /tmp/missing/<id>.json, then i18n-merge.py dump (sub-strings of longer texts are dropped: they are covered by them)."""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
async def main(pfx):
    async with async_playwright() as p:
        b = await p.chromium.launch(channel="chrome", args=["--no-sandbox"]); pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        await pg.goto("http://localhost:8765/tools/videos/lesson-studio.html?lang=en"); await pg.wait_for_timeout(600)
        os.makedirs("/tmp/missing", exist_ok=True); n = 0
        for v in await pg.evaluate("window.list()"):
            if not any(v["id"].startswith(x) for x in pfx): continue
            miss = set()
            for i in range(len(v["scenes"])):
                await pg.evaluate("([id,i,p])=>window.show(id,i,p)", [v["id"], i, 0])
                for x in await pg.evaluate("window.missing()"): miss.add(x)
            if miss: json.dump(sorted(miss), open("/tmp/missing/%s.json" % v["id"], "w"), ensure_ascii=False); n += 1
        print("videos with missing:", n); await b.close()
asyncio.run(main(sys.argv[1:]))
