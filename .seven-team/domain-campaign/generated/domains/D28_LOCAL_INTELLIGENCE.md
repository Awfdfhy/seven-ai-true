# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=Harvested evidence is READY with 5 primary sources. HiGMem and LLMRouterBench provide hierarchical memory/routing research references. Freshness is current (ACL 2026). Limitation: no evidence that local embeddings/reranking improve Seven's measured baseline.
CURRENT=No dedicated local intelligence/embeddings/reranking module found in inspected `remake/src`; local intelligence appears absent or undocumented in this scope. Evidence level: absence in inspected tree, not proof of absence elsewhere.
TARGET=Optional local/offline fallback with benchmark-gated complexity, preserving current lexical/temporal memory baseline.
NOW=Document current baseline and define benchmark gate before adding embeddings/reranking.
NEXT=Prototype offline fallback behind feature flag and measure against lexical baseline.
LATER=Semantic/vector/graph complexity only if benchmark wins.
TESTS=Benchmark comparison, offline fallback tests, privacy tests for local data.
RISKS=Complexity without measured benefit; privacy; offline correctness.
FIRST_SLICE=Benchmark harness + baseline metrics.
KNOWN_UNKNOWNS=No local intelligence implementation evidence; no benchmark results.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
