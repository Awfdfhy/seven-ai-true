from __future__ import annotations
import concurrent.futures, html, json, re, ssl, urllib.parse, urllib.request
from typing import Any

UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 SevenResearch/1.0"
PRIMARY_HINTS=(
    "developer.android.com","developer.mozilla.org","w3.org","modelcontextprotocol.io",
    "docs.github.com","github.com","openai.com","swebench.com","gorilla.cs.berkeley.edu",
    "opentelemetry.io","mas.owasp.org","react.dev","capacitorjs.com","yarnspinner.dev",
    "docs.yarnspinner.dev","docs.godotengine.org","aclanthology.org","arxiv.org"
)
TAG_RE=re.compile(r"<[^>]+>")
HREF_RE=re.compile(r'href=["\']([^"\']+)["\']',re.I)
TITLE_RE=re.compile(r"<title[^>]*>(.*?)</title>",re.I|re.S)
META_RE=re.compile(r'<meta[^>]+(?:name|property)=["\'](?:description|og:description)["\'][^>]+content=["\'](.*?)["\']',re.I|re.S)

def _clean(text:str)->str:
    text=html.unescape(TAG_RE.sub(" ",text or ""))
    return re.sub(r"\s+"," ",text).strip()

def _fetch(url:str,timeout:int=12,max_bytes:int=500_000)->dict[str,Any]:
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"text/html,application/xhtml+xml,application/pdf;q=0.8,*/*;q=0.2"})
    ctx=ssl.create_default_context()
    try:
        with urllib.request.urlopen(req,timeout=timeout,context=ctx) as r:
            final=r.geturl()
            ctype=(r.headers.get("content-type") or "").lower()
            data=r.read(max_bytes)
        text=data.decode("utf-8","ignore") if "html" in ctype or "text" in ctype or not ctype else ""
        title=_clean(TITLE_RE.search(text).group(1)) if text and TITLE_RE.search(text) else urllib.parse.urlparse(final).path.rsplit("/",1)[-1] or urllib.parse.urlparse(final).netloc
        m=META_RE.search(text) if text else None
        snippet=_clean(m.group(1)) if m else _clean(text)[:700]
        return {"url":final,"ok":True,"contentType":ctype,"title":title[:240],"snippet":snippet[:700],"html":text}
    except Exception as exc:
        return {"url":url,"ok":False,"error":str(exc)[:300],"contentType":"","title":"","snippet":"","html":""}

def _primary(url:str)->bool:
    host=(urllib.parse.urlparse(url).hostname or "").lower()
    return any(host==h or host.endswith("."+h) for h in PRIMARY_HINTS)

def _same_host_links(base_url:str,text:str,limit:int=8)->list[str]:
    host=urllib.parse.urlparse(base_url).hostname
    out=[]
    for href in HREF_RE.findall(text or ""):
        u=urllib.parse.urljoin(base_url,html.unescape(href))
        p=urllib.parse.urlparse(u)
        if p.scheme not in ("http","https") or p.hostname!=host: continue
        u=urllib.parse.urlunparse((p.scheme,p.netloc,p.path,p.params,p.query,""))
        if u not in out and u!=base_url: out.append(u)
        if len(out)>=limit: break
    return out

def _search(query:str,limit:int=8)->list[str]:
    url="https://html.duckduckgo.com/html/?q="+urllib.parse.quote(query)
    r=_fetch(url,timeout=10,max_bytes=350_000)
    if not r["ok"]: return []
    out=[]
    for href in HREF_RE.findall(r["html"]):
        href=html.unescape(href)
        p=urllib.parse.urlparse(href)
        if "duckduckgo.com" in (p.hostname or ""):
            q=urllib.parse.parse_qs(p.query)
            if q.get("uddg"): href=urllib.parse.unquote(q["uddg"][0])
        if href.startswith("//"): href="https:"+href
        if href.startswith("http") and "duckduckgo.com" not in href:
            if href not in out: out.append(href)
        if len(out)>=limit: break
    return out

def _harvest_domain(domain:dict[str,Any])->dict[str,Any]:
    target=max(6,min(18,int(domain.get("sourceTarget",8))))
    candidates=[]; seen=set()
    def add(u:str):
        if not u or u in seen: return
        p=urllib.parse.urlparse(u)
        if p.scheme in ("http","https"):
            seen.add(u); candidates.append(u)
    for u in domain.get("seeds") or []: add(u)
    title=str(domain.get("title",""))
    for q in (f"{title} official documentation benchmark",f"{title} architecture best practices 2025 2026"):
        for u in _search(q,limit=8): add(u)
    sources=[]; i=0
    while i<len(candidates) and len(sources)<target+3 and i<40:
        u=candidates[i]; i+=1
        r=_fetch(u)
        if not r["ok"]: continue
        record={k:r[k] for k in ("url","contentType","title","snippet")}
        record["primary"]=_primary(r["url"])
        sources.append(record)
        if len(sources)<target:
            for link in _same_host_links(r["url"],r.get("html",""),limit=4): add(link)
    uniq=[]; urls=set()
    for s in sources:
        if s["url"] in urls: continue
        urls.add(s["url"]); uniq.append(s)
    return {
        "id":domain["id"],"title":domain["title"],"target":target,
        "sources":uniq[:target+2],"fetched":len(uniq[:target+2]),
        "primaryFetched":sum(1 for s in uniq[:target+2] if s["primary"]),
        "harvestVerdict":"READY" if len(uniq)>=max(4,target//2) else "INSUFFICIENT"
    }

def harvest_campaign_sources(campaign:dict[str,Any],max_workers:int=8)->dict[str,Any]:
    domains=campaign.get("domains") or []
    out={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
        futs={pool.submit(_harvest_domain,d):d["id"] for d in domains}
        for f in concurrent.futures.as_completed(futs):
            did=futs[f]
            try: out[did]=f.result()
            except Exception as exc:
                out[did]={"id":did,"sources":[],"fetched":0,"primaryFetched":0,"harvestVerdict":"ERROR","error":str(exc)}
    return out

def source_pack_brief(campaign:dict[str,Any],agent_id:str,packs:dict[str,Any])->str:
    chunks=[]
    for d in campaign.get("domains") or []:
        if agent_id not in d.get("owners",[]): continue
        p=packs.get(d["id"],{})
        lines=[]
        for s in p.get("sources") or []:
            tag="primary" if s.get("primary") else "secondary"
            lines.append(f"[SOURCE {tag}] {s.get('url')}\nTITLE: {s.get('title','')}\nNOTE: {s.get('snippet','')[:420]}")
        chunks.append(f"### HARVESTED {d['id']} — {d['title']}\nFetched {p.get('fetched',0)} sources; primary={p.get('primaryFetched',0)}; harvest={p.get('harvestVerdict','UNKNOWN')}\n"+"\n\n".join(lines))
    return "\n\n".join(chunks) or "No harvested source pack assigned."
