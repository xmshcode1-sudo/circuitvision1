"""CircuitVision — translation helper for the English videos and site.
   dump:  python3 tools/videos/i18n-merge.py dump  → /tmp/i18n/todo.json (numbered Arabic texts missing an English line, from /tmp/missing/*.json)
   merge: python3 tools/videos/i18n-merge.py merge <english.json> → appends {arabic: english} to lessons.en.js (the list is in the todo order)"""
import sys, json, glob, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
os.makedirs("/tmp/i18n", exist_ok=True)
if sys.argv[1] == "dump":
    seen, todo = set(), []
    for f in sorted(glob.glob("/tmp/missing/*.json")):
        for t in json.load(open(f)):
            if t not in seen: seen.add(t); todo.append(t)
    json.dump(todo, open("/tmp/i18n/todo.json", "w"), ensure_ascii=False, indent=0)
    for i, t in enumerate(todo): print(i, t)
else:
    todo = json.load(open("/tmp/i18n/todo.json")); en = json.load(open(sys.argv[2]))
    assert len(todo) == len(en), (len(todo), len(en))
    p = os.path.join(ROOT, "lessons.en.js"); s = open(p).read()
    add = "\n  bi.add(" + json.dumps(dict(zip(todo, en)), ensure_ascii=False, indent=2).replace("\n", "\n  ") + ");\n"
    i = s.rindex("})();"); open(p, "w").write(s[:i] + add + s[i:])
    print("merged", len(en))
