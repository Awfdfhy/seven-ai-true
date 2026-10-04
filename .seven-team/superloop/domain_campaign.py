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

def domain_research_brief(campaign:dict[str,Any],agent_id:str,source_packs:dict[str,Any]|None=None)->str:
    assigned=domains_for_agent(campaign,agent_id)
    if not assigned: return "No primary domain campaign assignment; support adjacent domains when the Manager requests it."
    chunks=[]
    for d in assigned:
        chunks.append(
          f"### {d['id']} — {d['title']}\n"
          f"Priority: {d['priority']} | source target: {d['sourceTarget']} | owners: {', '.join(d['owners'])}\n"
          f"Seed sources (starting points, not a limit):\n- " + "\n- ".join(d.get("seeds") or [])
        )
    source_note = ""
    if source_packs:
        from domain_research_harvester import source_pack_brief
        source_note = "\n\nPRE-HARVESTED WEB EVIDENCE (analyze this first; do not waste the whole stage re-crawling it):\n" + source_pack_brief(campaign, agent_id, source_packs)
    contract = """
For EACH assigned domain, output exactly one bounded section using these markers:
BEGIN_DOMAIN_PLAN <DOMAIN_ID>
DOMAIN_ID=<DOMAIN_ID>
SOURCE_ANALYSIS=<what the sources collectively say, disagreements, freshness and limitations>
CURRENT=<Seven current implementation and evidence>
TARGET=<desired architecture/product behavior>
NOW=<first high-value implementation slice>
NEXT=<next improvements>
LATER=<longer-term ideas>
TESTS=<deterministic, E2E, Android, adversarial and eval proof>
RISKS=<security/privacy/performance/Android/RTL/cross-system risks>
FIRST_SLICE=<smallest implementation that materially improves the domain>
KNOWN_UNKNOWNS=<missing evidence>
DOMAIN_VERDICT=READY_FOR_PLAN or RESEARCH_INSUFFICIENT
END_DOMAIN_PLAN <DOMAIN_ID>

Use harvested URLs as evidence and keep their [SOURCE primary]/[SOURCE secondary] tags. You may fetch extra sources only to fill a real gap. Do not spend the stage on uncontrolled crawling.
"""
    return (
      "You are part of the Seven domain-by-domain internet research campaign. "
      "Inspect Seven first, analyze the harvested public-web evidence, then fill genuine gaps if needed. "
      "Never invent a source or claim a page was read when it was not.\n\n" + "\n\n".join(chunks) + source_note + "\n" + contract
    )

def audit_domain_research(campaign:dict[str,Any],reports:dict[str,str],source_packs:dict[str,Any]|None=None)->dict[str,Any]:
    results=[]; missing=[]; insufficient=[]
    for d in campaign.get("domains",[]):
        owner_text="\n".join(reports.get(a,"") for a in d.get("owners",[]))
        urls=set(URL_RE.findall(owner_text))
        pack=(source_packs or {}).get(d["id"],{})
        for s in pack.get("sources") or []:
            if s.get("url"): urls.add(s["url"])
        mentions=d["id"] in owner_text
        primary=max(len(re.findall(r"\[SOURCE\s+primary\]",owner_text,re.I)),int(pack.get("primaryFetched",0) or 0))
        target=int(d.get("sourceTarget",6))
        url_ok=len(urls)>=max(4,target//2)
        primary_ok=primary>=max(2,target//3)
        plan_marker=f"BEGIN_DOMAIN_PLAN {d['id']}" in owner_text and f"END_DOMAIN_PLAN {d['id']}" in owner_text
        ready=mentions and plan_marker and url_ok and primary_ok and "DOMAIN_VERDICT=READY_FOR_PLAN" in owner_text
        status="READY" if ready else "INSUFFICIENT"
        if not mentions: missing.append(d["id"])
        if not ready: insufficient.append(d["id"])
        results.append({"id":d["id"],"status":status,"urls":len(urls),"primaryTagged":primary,"target":target,"owners":d["owners"]})
    return {"schemaVersion":1,"domains":len(results),"ready":sum(1 for x in results if x["status"]=="READY"),
            "missing":missing,"insufficient":insufficient,"results":results}

def campaign_prompt_summary(campaign:dict[str,Any])->str:
    return "\n".join(f"{d['id']} | {d['title']} | owners={','.join(d['owners'])} | sources>={d['sourceTarget']}" for d in campaign["domains"])


def extract_domain_plans(campaign:dict[str,Any],reports:dict[str,str],audit:dict[str,Any])->dict[str,str]:
    statuses={x["id"]:x["status"] for x in audit.get("results",[])}
    plans={}
    for d in campaign.get("domains",[]):
        did=d["id"]; block=None
        pattern=re.compile(rf"BEGIN_DOMAIN_PLAN\s+{re.escape(did)}\s*(.*?)END_DOMAIN_PLAN\s+{re.escape(did)}",re.S|re.I)
        for owner in d.get("owners",[]):
            m=pattern.search(reports.get(owner,""))
            if m:
                block=m.group(1).strip()
                if "DOMAIN_VERDICT=READY_FOR_PLAN" in block: break
        if not block:
            block=(f"DOMAIN_ID={did}\nDOMAIN_VERDICT=RESEARCH_INSUFFICIENT\n"
                   f"CURRENT=No trustworthy plan block was produced in this cycle.\n"
                   f"KNOWN_UNKNOWNS=Research agent output missing or timed out.")
        plans[did]=f"# {did} — {d['title']}\n\nResearch audit: {statuses.get(did,'INSUFFICIENT')}\n\n{block}\n"
    return plans

def render_domain_roadmaps(campaign:dict[str,Any],plans:dict[str,str],audit:dict[str,Any])->str:
    head=(f"# Seven Domain Roadmaps — cycle evidence\n\n"
          f"Ready domains: {audit.get('ready',0)}/{audit.get('domains',0)}\n"
          "Only READY domains may drive implementation.\n\n")
    return head+"\n\n".join(plans[d["id"]] for d in campaign.get("domains",[]))
