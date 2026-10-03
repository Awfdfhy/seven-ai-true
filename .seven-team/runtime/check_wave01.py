#!/usr/bin/env python3
import argparse, json, subprocess, sys
from pathlib import Path

ap=argparse.ArgumentParser()
ap.add_argument("--phase", choices=["workers","all"], default="workers")
ap.add_argument("--soft", action="store_true")
ap.add_argument("--collect")
args=ap.parse_args()

manifest=json.loads(Path(".seven-team/wave-01-manifest.json").read_text())
rows=list(manifest["workers"])
if args.phase=="all":
    rows += list(manifest["reviewers"])
worker_marker=manifest["workerMarker"]
review_marker=manifest["reviewMarker"]
results=[]
ok=0
for row in rows:
    marker=review_marker if row["id"].endswith("10") else worker_marker
    ref=f"origin/{row['branch']}:{row['report']}"
    p=subprocess.run(["git","show",ref],text=True,capture_output=True)
    content=p.stdout if p.returncode==0 else ""
    good=p.returncode==0 and marker in content
    results.append({**row,"ready":good,"marker":marker})
    ok += int(good)
    if good and args.collect:
        out=Path(args.collect)/Path(row["report"]).name
        out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(content,encoding="utf-8")

complete=ok==len(results)
summary={"phase":args.phase,"ready":complete,"readyCount":ok,"total":len(results),"entries":results}
Path("/tmp/seven-wave01-status.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
print(f"Seven Wave 01 {args.phase}: {ok}/{len(results)}")
for r in results:
    print(("READY " if r["ready"] else "MISS  ")+f"{r['id']} {r['worker']:<13} {r['branch']}")
print("WAVE01_READY="+("1" if complete else "0"))
if not complete and not args.soft:
    sys.exit(1)
