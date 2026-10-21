# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: READY

DOMAIN_ID=D07_RESEARCH_WEB
SOURCE_ANALYSIS=Harvested 4 sources (1 primary). BrowseComp (OpenAI) paper/pdf + leaderboard context, Springer article blocked by challenge. BrowseComp tests ability to browse web and find hard-to-locate info with citation/verification. Implies need for retrieval, source tracking, citation, evidence quality.
CURRENT=Research stage exists in cycle; domain campaign with seed URLs. Need to see if web research tool exists and how citations tracked.
TARGET=BrowseComp-aligned: query decomposition, source selection, evidence extraction, citation with URLs, verification, avoid hallucinated sources. Track source quality.
NOW=Review domain campaign usage, source tracking. Ensure URLs recorded with [SOURCE primary]/[SOURCE secondary].
NEXT=Citation format, source allowlist (OFFICIAL_SOURCE_MAP), freshness checks.
LATER=Multi-hop retrieval, contradiction detection, evidence strength scoring.
TESTS=BrowseComp subset, citation accuracy, source existence checks.
RISKS=Hallucinated URLs, paywalls, stale info, missing primary sources.
FIRST_SLICE=Enforce URL recording + source map validation; add citation linter.
KNOWN_UNKNOWNS=Web research implementation. Harvest insufficient (only 1 primary accessible) - need to read BrowseComp paper if cached or fetch gaps carefully.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
