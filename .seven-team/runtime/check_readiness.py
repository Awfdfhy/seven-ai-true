#!/usr/bin/env python3
import json, subprocess, sys
from pathlib import Path

manifest=json.loads(Path(".seven-team/readiness.json").read_text())
marker=manifest["requiredMarker"]
rows=[]
ok=0
for a in manifest["agents"]:
    ref=f"origin/{a['branch']}:{a['report']}"
    p=subprocess.run(["git","show",ref],text=True,capture_output=True)
    good=p.returncode==0 and marker in p.stdout
    rows.append({"id":a["id"],"worker":a["worker"],"branch":a["branch"],"report":a["report"],"ready":good})
    ok+=int(good)

result={"ready":ok==len(rows),"readyCount":ok,"total":len(rows),"agents":rows}
Path("/tmp/seven-team-readiness.json").write_text(json.dumps(result,indent=2)+"\n")
print(f"Seven team readiness: {ok}/{len(rows)}")
for r in rows:
    print(("READY " if r["ready"] else "MISS  ")+f"{r['id']} {r['worker']:<13} {r['branch']}")
if ok!=len(rows):
    sys.exit(1)
