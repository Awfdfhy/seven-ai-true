# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=20 sources harvested (11 primary, 9 secondary); harvest READY. Mem0 reports 92.5 LoCoMo / 94.4 LongMemEval at 3-4x lower token cost vs full-context; Zep uses bi-temporal valid_at/invalid_at facts and Graphiti temporal knowledge graphs; LongMemEval and UTILMEM (evidence utilization) define evaluation; MemX local-first and Memoria agentic memory show incremental migration patterns; Letta memory blocks show structured core memory. Disagreement: graph/semantic memory (Zep) vs local lexical/temporal baseline; no single standard. Freshness: arXiv 2025-2026, vendor docs current. Limitation: abstracts only, no full paper text; no Seven runtime measurements.
CURRENT=Seven has memory modules under remake/src (context, storage) and legacy memory.cjs at root; Memory v2 research synthesis and execution plan exist in .seven-team/memory-v2. Restart persistence, secret exclusion, temporal correction, provenance, abstention remain UNPROVEN. Incremental migration beside legacy is the stated approach.
TARGET=Local-first temporal memory with provenance, correction/invalidation, abstention, restart persistence, secret exclusion, and measured benchmark win over lexical baseline before semantic/graph promotion.
NOW=Complete Memory v2 current-state audit: map storage owners, context assembly, and persistence recovery; add restart-persistence and secret-exclusion regression tests.
NEXT=Temporal correction and provenance ledger; benchmark lexical baseline vs semantic candidate; Arabic parity.
LATER=Optional graph/vector memory only if it wins measured benchmark; multimodal memory (TeleMem) deferred.
TESTS=Deterministic: restart persistence, secret exclusion, temporal correction, abstention; E2E: long chat with corrections; Android: WebView persistence; adversarial: secret leakage, stale fact; eval: LongMemEval-style recall/abstention.
RISKS=Privacy (secrets in memory), performance (context bloat), Android WebView storage, RTL/Arabic, data loss on restart, duplicate memory owners.
FIRST_SLICE=Restart-persistence + secret-exclusion tests wired to existing memory owner with no new store.
KNOWN_UNKNOWNS=Exact runtime memory module paths, current test coverage, benchmark baseline numbers, Android IndexedDB behavior.
DOMAIN_VERDICT=READY_FOR_PLAN
