# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=Harvested 20 sources (11 primary). Papers: Mem0 (2504.19413) production-ready LTM, Zep temporal KG (2501.13956), LongMemEval (2410.10813), MemX local-first (2603.16171), Memoria scalable agentic (2512.12686), TeleMem multimodal (2601.06037), context-driven retrieval benchmark (2609.03467), UTILMEM evidence utilization (2608.30508). Practical: Letta memory blocks/dreaming, Zep Graphiti episodes/facts/context-types, Mem0 research (LoCoMo/LongMemEval/BEAM). MDN IndexedDB for local persistence. LangGraph/DeepAgents thinking context. 
Disagreements/freshness: research is recent (2024-2026) but benchmarks evolve (LoCoMo/LongMemEval emphasize retrieval quality/token cost). Tradeoffs: KG+temporal (Zep) vs vector+extrinsics (Mem0) vs local-first (MemX). Limitations: many arXiv preprints; implementation details vary. Harvest sufficient (20 sources) with primary focus on theory+systems.

CURRENT=Seven has `memory.cjs` + `memory-results.json` present (repo evidence). Architecture requires preserving kernel/shell/tasks/storage/bridge/routing/kernel ownership (no duplicate owners). Memory is subsystem under storage/context fabric per naming; current state shows memory module + results file exists — treat as implemented slice but need verification against product contracts. Must inspect actual memory.cjs behavior, invariants, persistence (IndexedDB vs file), retrieval, timeline/episodes if present.

TARGET=Deterministic, testable LTM: episode ingestion, fact extraction/relationships, bi-temporal validity (valid_at/invalid_at) where applicable, context-driven retrieval (not just query-time), evidence-grounded responses with provenance, local-first where possible, token-budget aware (recall vs cost), cross-session persistence, privacy (no secret leakage). Align with Mem0 efficiency claims and Zep point-in-time queries; benchmark against LongMemEval/LoCoMo style checks. Respect Seven identity.

NOW=Verify memory subsystem against contracts: read `memory.cjs`, `memory-results.json`, any memory tests, and `.seven-team/autonomy/` memory-related contracts. Define invariants (e.g. episode idempotency, fact provenance, retrieval determinism, no PII leakage). Add deterministic unit tests for extraction/retrieval; regression against stored results.

NEXT=Implement context-driven retrieval (proactive recall) with evidence utilization scoring (UTILMEM-inspired), episode lifecycle, relationship updates, invalidation. Add token-cost tracking. Local persistence (IndexedDB) with schema + migration safety.

LATER=Multimodal hooks, graph-based reasoning, memory compaction/pruning with policies, LongMemEval/LoCoMo integration into eval suite, adversarial tests (hallucinated facts, timeline corruption).

TESTS=Unit (extraction, retrieval, scoring), contract (episode→facts→context), integration (cross-session), regression against `memory-results.json`, determinism (fixed seeds), token-cost assertions, privacy (no secrets), adversarial (injection into episodes). E2E via eval harness.

RISKS=Storing sensitive user data; over-recall inflating tokens; timeline corruption; schema migrations; duplicate owners (memory vs storage/kernel). Android storage constraints. Must preserve architecture.

FIRST_SLICE=Read `memory.cjs` + results, write deterministic unit tests for core paths, define invariants in test names; verify retrieval correctness + cost. Smallest slice that proves memory behavior is testable.

KNOWN_UNKNOWNS=Exact memory API surface in Seven (episodes/facts/context-types), persistence backend, retrieval scoring, benchmark integration. Need to inspect code + autonomy contracts.

DOMAIN_VERDICT=READY_FOR_PLAN (harvested 20 sources sufficient; repo has memory evidence to inspect)
