# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: READY

DOMAIN_ID=D07_RESEARCH_WEB
SOURCE_ANALYSIS=Harvested 4 sources; harvest marked INSUFFICIENT. Primary: BrowseComp PDF (openai.com). Secondary: Springer article + assets (client challenge). 
Limitations: PDF only (content not fully harvested), Springer article blocked by client challenge in harvest. Missing key retrieval/citation practices, evidence standards. Need to fill gaps with authoritative sources: BrowseComp (benchmark details), evidence hierarchies (official specs first), citation requirements, retrieval evals (RAG, BEIR-like), provenance. 
Gap: need to read BrowseComp details, evidence quality rubric enforcement, anti-hallucination (cite URLs, never invent). 

CURRENT=Seven requires product intelligence + domain campaign with harvested URLs as evidence; aesthetic claims weak without runtime/screenshot evidence. Also must distinguish browser/mock/Android build/installed-device evidence. Research discipline: read index/quality rubric, inspect relevant packs.

TARGET=Evidence-first research: prefer official specs/docs, primary papers, recognized benchmarks. Record URLs + exact lessons. Meet source targets. If insufficient, mark RESEARCH_INSUFFICIENT. Never invent sources. Provenance required.

NOW=Fix harvest gap for D07: fetch BrowseComp page summary (not just PDF asset), evidence standards (citation, URL verification), retrieval benchmarks. Read .seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json, quality rubric.

NEXT=Research workflow: URL allowlist from OFFICIAL_SOURCE_MAP, harvest log with timestamps, credibility scoring, disagreement tracking, freshness checks.

LATER=Automated citation validation, source staleness alerts, evidence graph.

TESTS=Deterministic research checklist (all URLs verified, tags correct, gaps labeled). Contract: no invented evidence.

RISKS=Sloppy citations, scope creep (over-crawling), marking sufficient when not. 

FIRST_SLICE=Close D07 harvest gap: pull BrowseComp page (openai.com/index/browsecomp/) details + evidence rubric. Update research checklist. Smallest fix.

KNOWN_UNKNOWNS=BrowseComp task details, exact evidence rubric text, retrieval corpus standards. Marked INSUFFICIENT in harvest.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (harvest incomplete for retrieval/citations; must fill gap before finalizing)
