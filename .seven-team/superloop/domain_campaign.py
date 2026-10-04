from __future__ import annotations
import json, pathlib, re
from typing import Any

CAMPAIGN_PATH=pathlib.Path(".seven-team/domain-campaign/domains.json")
URL_RE=re.compile(r"https?://[^\s)\]>]+")

def load_domain_campaign(root:pathlib.Path)->dict[str,Any]:
    data=json.loads((root/CAMPAIGN_PATH).read_text(encoding="utf-8"))
    if data.get("schemaVersion")!=1 or not data.get("enabled"): raise ValueError("domain campaign invalid/disabled")
    domains=data.get("domains") or []
    ids=[d.get("id") for d in domains]
    if len(domains)<20 or len(ids)!=len(set(ids)): raise ValueError("domain campaign coverage invalid")
    for d in domains:
        if not d.get("owners") or int(d.get("sourceTarget",0))<4: raise ValueError(f"invalid domain config: {d.get('id')}")
    return data

def domains_for_agent(campaign:dict[str,Any],agent_id:str)->list[dict[str,Any]]:
    return [d for d in campaign.get("domains",[]) if agent_id in d.get("owners",[])]

def domain_research_brief(campaign:dict[str,Any],agent_id:str)->str:
    assigned=domains_for_agent(campaign,agent_id)
    if not assigned: return "No primary domain campaign assignment; support adjacent domains when the Manager requests it."
    chunks=[]
    for d in assigned:
        chunks.append(
          f"### {d['id']} — {d['title']}\n"
          f"Priority: {d['priority']} | source target: {d['sourceTarget']} | owners: {', '.join(d['owners'])}\n"
          f"Seed sources (starting points, not a limit):\n- " + "\n- ".join(d.get("seeds") or [])
        )
    return (
      "You are part of the Seven domain-by-domain internet research campaign. "
      "For every assigned domain, inspect Seven first, then conduct broad internet research using network/web access available in the runner. "
      "Use the required [SOURCE primary]/[SOURCE secondary] URL format, satisfy the source target where credible sources exist, "
      "and end each domain with the required DOMAIN_ID/DOMAIN_VERDICT metadata.\n\n" + "\n\n".join(chunks)
    )

def audit_domain_research(campaign:dict[str,Any],reports:dict[str,str])->dict[str,Any]:
    results=[]; missing=[]; insufficient=[]
    for d in campaign.get("domains",[]):
        owner_text="\n".join(reports.get(a,"") for a in d.get("owners",[]))
        urls=set(URL_RE.findall(owner_text))
        mentions=d["id"] in owner_text
        primary=len(re.findall(r"\[SOURCE\s+primary\]",owner_text,re.I))
        target=int(d.get("sourceTarget",6))
        url_ok=len(urls)>=max(4,target//2)
        primary_ok=primary>=max(2,target//3)
        ready=mentions and url_ok and primary_ok and "DOMAIN_VERDICT=READY_FOR_PLAN" in owner_text
        status="READY" if ready else "INSUFFICIENT"
        if not mentions: missing.append(d["id"])
        if not ready: insufficient.append(d["id"])
        results.append({"id":d["id"],"status":status,"urls":len(urls),"primaryTagged":primary,"target":target,"owners":d["owners"]})
    return {"schemaVersion":1,"domains":len(results),"ready":sum(1 for x in results if x["status"]=="READY"),
            "missing":missing,"insufficient":insufficient,"results":results}

def campaign_prompt_summary(campaign:dict[str,Any])->str:
    return "\n".join(f"{d['id']} | {d['title']} | owners={','.join(d['owners'])} | sources>={d['sourceTarget']}" for d in campaign["domains"])
