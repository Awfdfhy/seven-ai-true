#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, os, pathlib, re
from collections import Counter
from typing import Any

AUTONOMY_REL = pathlib.Path(".seven-team/autonomy")
REQUIRED_JSON = [
    "features.json","constitution.json","proof-policy.json","reality-lab.json",
    "evolution-arena.json","world-model.json","meta-team.json","synthetic-users.json",
    "observatory.json","quality-debt.json","causal-learning.json","trust-score.json"
]

def _read_json(path: pathlib.Path) -> dict[str, Any]:
    data=json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data,dict): raise ValueError(f"{path}: root must be object")
    return data

def load_autonomy_contracts(root: pathlib.Path) -> dict[str, dict[str, Any]]:
    base=root/AUTONOMY_REL
    return {name:_read_json(base/name) for name in REQUIRED_JSON}

def validate_autonomy_contracts(root: pathlib.Path, contracts: dict[str,dict[str,Any]]|None=None) -> dict[str,Any]:
    contracts=contracts or load_autonomy_contracts(root)
    missing=[name for name in REQUIRED_JSON if name not in contracts]
    if missing: raise ValueError("missing autonomy contracts: "+", ".join(missing))
    for name,data in contracts.items():
        if int(data.get("schemaVersion",0)) != 1: raise ValueError(f"{name}: schemaVersion must be 1")
    invariants=contracts["constitution.json"].get("invariants") or []
    ids=[x.get("id") for x in invariants]
    if not invariants or len(ids)!=len(set(ids)) or any(not x for x in ids): raise ValueError("constitution invariant IDs invalid")
    journeys=contracts["reality-lab.json"].get("journeys") or []
    jids=[x.get("id") for x in journeys]
    if not journeys or len(jids)!=len(set(jids)): raise ValueError("Reality Lab journey IDs invalid")
    personas=contracts["synthetic-users.json"].get("personas") or []
    pids=[x.get("id") for x in personas]
    if not personas or len(pids)!=len(set(pids)): raise ValueError("synthetic persona IDs invalid")
    systems=contracts["features.json"].get("systems") or []
    allowed={"ACTIVE_GUARDED","ACTIVE_RECORDING","CONFIGURED","SCAFFOLDED","UNPROVEN"}
    if any(x.get("status") not in allowed for x in systems): raise ValueError("invalid autonomy feature status")
    weights=sum(float(x.get("weight",0)) for x in contracts["trust-score.json"].get("components") or [])
    if abs(weights-1.0)>1e-9: raise ValueError(f"trust weights must sum to 1, got {weights}")
    return {"contracts":len(contracts),"invariants":len(invariants),"journeys":len(journeys),"personas":len(personas),"systems":len(systems)}

def _sha256(path:pathlib.Path)->str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def _resolve_relative(src:pathlib.Path,spec:str,root:pathlib.Path)->str|None:
    if not spec.startswith("."): return None
    base=(src.parent/spec).resolve()
    candidates=[base, pathlib.Path(str(base)+ext) for ext in []]
    checks=[base]
    for ext in (".ts",".tsx",".js",".jsx",".mjs",".cjs",".json"): checks.append(pathlib.Path(str(base)+ext))
    for ext in (".ts",".tsx",".js",".jsx",".mjs",".cjs"): checks.append(base/("index"+ext))
    for p in checks:
        try:
            if p.is_file() and root.resolve() in p.resolve().parents: return p.resolve().relative_to(root.resolve()).as_posix()
        except Exception: pass
    return None

def build_world_model(root:pathlib.Path, contracts:dict[str,dict[str,Any]], head_sha:str)->dict[str,Any]:
    cfg=contracts["world-model.json"]
    roots=[root/x for x in cfg.get("scanRoots",[]) if (root/x).exists()]
    exts=set(cfg.get("sourceExtensions",[]))
    max_bytes=int(cfg.get("maxFileBytes",800000))
    files=[]
    for base in roots:
        for p in base.rglob("*"):
            if len(files)>=1800: break
            if not p.is_file() or p.suffix.lower() not in exts: continue
            if any(x in {"node_modules",".git","dist","build"} for x in p.parts): continue
            try:
                if p.stat().st_size>max_bytes: continue
            except OSError: continue
            files.append(p)
    import_re=re.compile(r"""(?:from\s+|require\s*\(|import\s*\()\s*["']([^"']+)["']""")
    edges=[]; inbound=Counter(); outbound=Counter()
    for p in files:
        rel=p.relative_to(root).as_posix()
        try: text=p.read_text(encoding="utf-8",errors="ignore")
        except OSError: continue
        for spec in import_re.findall(text):
            target=_resolve_relative(p,spec,root)
            if target:
                edges.append({"from":rel,"to":target,"type":"IMPORTS"})
                outbound[rel]+=1; inbound[target]+=1
    hotspots=[]
    for path in set(inbound)|set(outbound):
        hotspots.append({"path":path,"inbound":inbound[path],"outbound":outbound[path],"fan":inbound[path]+outbound[path]})
    hotspots.sort(key=lambda x:(-x["fan"],x["path"]))
    by_root=Counter(p.relative_to(root).parts[0] for p in files)
    return {
      "schemaVersion":1,"sourceSha":head_sha,"nodes":len(files),"edges":len(edges),
      "subsystemFiles":dict(by_root),"hotspots":hotspots[:30],"dependencyEdges":edges[:5000],
      "limitations":["static relative import graph only","runtime/dynamic dependencies require execution evidence"]
    }

def _write_artifact(artifact_root:pathlib.Path,cycle:int,name:str,data:Any)->pathlib.Path:
    p=artifact_root/f"cycle-{cycle:04d}"/"autonomy"/name
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    return p

def build_cycle_snapshot(root:pathlib.Path,artifact_root:pathlib.Path,cycle:int,head_sha:str,contracts:dict[str,dict[str,Any]],team:dict[str,Any])->str:
    validated=validate_autonomy_contracts(root,contracts)
    world=build_world_model(root,contracts,head_sha)
    previous={}
    state=root/".seven-team/superloop-state.json"
    if state.exists():
        try: previous=json.loads(state.read_text(encoding="utf-8")).get("summary") or {}
        except Exception: previous={}
    coverage={a["id"]:len(a.get("knowledgePacks") or []) for a in team.get("agents",[])}
    snapshot={
      "schemaVersion":1,"cycle":cycle,"sourceSha":head_sha,"contracts":validated,
      "featureStatus":{x["id"]:x["status"] for x in contracts["features.json"]["systems"]},
      "constitution":{"invariants":validated["invariants"],"critical":sum(1 for x in contracts["constitution.json"]["invariants"] if x["severity"]=="CRITICAL")},
      "realityLab":{"journeys":validated["journeys"],"status":"UNPROVEN_THIS_CYCLE"},
      "syntheticUsers":{"personas":validated["personas"]},
      "knowledgePackCoverage":coverage,"worldModel":world,
      "previousChampionCandidate":{"head":previous.get("head"),"quality":previous.get("productQualityScore"),"verdict":previous.get("productQualityVerdict")}
    }
    _write_artifact(artifact_root,cycle,"preflight.json",snapshot)
    return (
      f"AUTONOMY_PREFLIGHT: systems={validated['systems']} invariants={validated['invariants']} "
      f"realityJourneys={validated['journeys']} personas={validated['personas']} "
      f"worldNodes={world['nodes']} worldEdges={world['edges']}. "
      "Constitution/proof rules are mandatory; missing Reality Lab evidence remains UNPROVEN."
    )

def record_arena_candidates(artifact_root:pathlib.Path,cycle:int,champion_sha:str,candidates:dict[str,str],outputs:dict[str,str])->dict[str,Any]:
    challengers=[]
    for aid,sha in sorted(candidates.items()):
        challengers.append({"agent":aid,"sha":sha,"stage":"SHADOW_ELIGIBLE","comparativeScore":None,"proof":"quick typecheck candidate only","outputDigest":hashlib.sha256((outputs.get(aid,"")).encode()).hexdigest()})
    result={"schemaVersion":1,"cycle":cycle,"championSha":champion_sha,"challengers":challengers,
            "promotion":"BLOCKED_PENDING_COMPARATIVE_PROOF","rule":"No challenger wins from typecheck alone."}
    _write_artifact(artifact_root,cycle,"arena.json",result)
    return result

def _parse_line(text:str,key:str)->str|None:
    prefix=key+"="
    for line in (text or "").splitlines():
        if line.startswith(prefix): return line.split("=",1)[1].strip()
    return None

def finalize_cycle(root:pathlib.Path,artifact_root:pathlib.Path,cycle:int,summary:dict[str,Any],product_quality:str,apk_result:str,contracts:dict[str,dict[str,Any]])->dict[str,Any]:
    score_raw=_parse_line(product_quality,"PRODUCT_QUALITY_SCORE") or "UNPROVEN"
    hard_raw=_parse_line(product_quality,"PRODUCT_QUALITY_HARD_FAILS") or "UNPROVEN"
    try: score=float(score_raw)
    except Exception: score=None
    try: hard=int(hard_raw)
    except Exception: hard=None
    apk_pass="APK_STAGE=PASS" in (apk_result or "")
    proof={
      "deterministicFinalGates":True,
      "apkBuilt":apk_pass,
      "productQualityScored":score is not None,
      "productHardFailsKnown":hard is not None,
      "realityLabExactInstalledEvidence":False,
      "constitutionRuntimeCoverage":"PARTIAL",
      "physicalDeviceEvidence":False
    }
    hard_block=(hard is not None and hard>0)
    promotion_ready=bool(apk_pass and score is not None and score>=8.2 and hard==0 and proof["realityLabExactInstalledEvidence"])
    trust_status="PROMOTION_ELIGIBLE" if promotion_ready else "UNPROVEN_OR_BLOCKED"
    result={
      "schemaVersion":1,"cycle":cycle,"sourceSha":summary.get("head"),"proof":proof,
      "productQualityScore":score_raw,"productHardFails":hard_raw,
      "trustStatus":trust_status,
      "championDecision":"CHALLENGER_ELIGIBLE" if promotion_ready else "HOLD_CHAMPION",
      "missingProof":[k for k,v in proof.items() if v is False or v=="PARTIAL"],
      "note":"Aggregate score never overrides Constitution/product hard fails."
    }
    _write_artifact(artifact_root,cycle,"final-trust.json",result)
    return result

def main():
    ap=argparse.ArgumentParser()
    sub=ap.add_subparsers(dest="cmd",required=True)
    v=sub.add_parser("validate"); v.add_argument("--root",default=".")
    args=ap.parse_args()
    root=pathlib.Path(args.root).resolve()
    if args.cmd=="validate":
        print(json.dumps(validate_autonomy_contracts(root),indent=2))

if __name__=="__main__": main()
