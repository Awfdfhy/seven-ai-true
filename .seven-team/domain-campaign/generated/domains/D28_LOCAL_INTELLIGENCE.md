# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=HiGMem (ACL 2026, aclanthology.org/2026.findings-acl.1690) — hierarchical LLM-guided memory for long-term conversational agents, primary. LLMRouterBench (ACL 2026, same as D08) — routing framework, primary. Harvest=READY, primary=5. Sources agree local/temporal memory matters for long chats; HiGMem is LLM-guided (not purely local). Limitation: neither source is a local-embeddings/reranking spec; both are research papers, not implementation blueprints.
CURRENT=`memory.cjs` tests memory add/update/delete/ledger consistency, immutable history, write failure atomicity, corruption protection, action-authorization rejection, legacy key compatibility. `release/control-runtime.js` compileContext has MEMORY_RECALL category (share .12) but no local search, no embeddings, no reranking, no offline fallback. No local intelligence layer exists; no tombstone/provenance on memory records; no offline model-routing fallback when providers unavailable.
TARGET=Local lexical/temporal memory baseline (constitution: do NOT promote semantic/vector/graph unless it wins a measured benchmark against the lexical/temporal baseline). Offline fallback for model routing when providers unavailable. Memory provenance/tombstones. Arabic parity for local intelligence (D13 cross-ref).
NOW=Local lexical/temporal memory search with tombstone/provenance, offline fallback routing (provider-unavailable → local cache/lexical match), memory write atomicity already present (memory.cjs) — extend to local search index.
NEXT=Reranking for local search results; embeddings only if measured benchmark beats lexical baseline (constitution gate); restart persistence for memory (memory-v2 campaign).
LATER=Vector/semantic search only if benchmark-won, Arabic local intelligence parity, offline research cache for long-chat continuity.
TESTS=Unit: lexical search relevance ranking, tombstone prevents deleted memory recall, offline fallback returns cached/local result when provider down, memory ledger consistency under concurrent writes, benchmark lexical vs vector (vector must win measured test to be adopted).
RISKS=Semantic/vector complexity without measured win (constitution violation); memory corruption from concurrent writes; offline fallback silently returning stale data; Arabic/localization gaps in local intelligence; memory secrets leaking into logs/diagnostics.
FIRST_SLICE=Local lexical memory search + tombstone/provenance + offline routing fallback; benchmark harness comparing lexical vs (optional) vector.
KNOWN_UNKNOWNs=No embedding model in repo; no benchmark harness for local intelligence; no offline provider cache format defined; Android local intelligence evidence missing.
DOMAIN_VERDICT=READY_FOR_PLAN
