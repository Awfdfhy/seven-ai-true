# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT

SOURCE_ANALYSIS
[From harvested 20 sources: 11 primary, 9 secondary; arXiv + Letta + Zep + Mem0 + MDN + LangChain]
- Foundational papers frame memory as production concern: Mem0 (2504.19413) defines scalable long-term memory for agents with production readiness focus; Zep (2501.13956) proposes temporal knowledge graph (Context Graph) with time-aware facts/episodes; Memoria (2512.12686) emphasizes scalable agentic memory framework for personalization.
- Benchmarks show retrieval quality matters: LongMemEval (2410.10813) evaluates long-term interactive memory; UTILMEM (2608.30508) measures evidence utilization; “When Users Don’t Ask” (2609.03467) benchmarks context-driven retrieval (proactive recall). Mem0 reports strong LoCoMo/LongMemEval scores with lower token cost (mem0.ai/research). 
- System designs: MemX (2603.16171) local-first; TeleMem (2601.06037) long-term + multimodal. 
- Product docs reinforce concepts: Letta memory blocks (core memory) for structured state; Zep concepts (episodes -> graph, facts with bi-temporal validity, context types: facts/entities/episodes/thread summaries/observations/user summary) guide what to extract/store. 
- Platform/storage: MDN IndexedDB API is standard for client-side structured storage (large, indexed) — relevant if local-first or hybrid. 
- Agent frameworks: LangGraph thinking/DeepAgents inform orchestration patterns (subagents, planning) but not memory store itself.
Disagreements/freshness: arXiv IDs look recent/future-dated in some labels (e.g. 2603…) — treat as harvested metadata; content is the abstracts/titles. Limitations: harvested are abstracts/pages (not full PDFs deeply read here) and product docs are secondary; need to verify concrete Seven implementation vs concepts. No single “right” model (vector vs temporal KG vs blocks) — architecture choice must fit Seven.

CURRENT
[From repo inspection, evidence-grounded]
- Memory/context subsystem exists in codebase (stores, context modules). 
- Persistence layer present (IndexedDB patterns observed in storage modules) — local storage available. 
- No evidence of temporal KG (Zep Graphiti) integrated; no Mem0 client; no Letta-style memory blocks surfaced as core contract. 
- Memory likely session+local caches; long-term recall semantics (proactive retrieval, time decay, invalidation) not obvious from file scan. 
- Ownership boundaries per ARCHITECTURE.md exist but memory contracts not fully enumerated in quick scan.
Evidence: remake/ARCHITECTURE.md, .seven-team/domain-campaign/domains.json, storage/memory files found via search.

TARGET
Desired state (evidence-backed):
- Clear memory model with layers: working (session), episodic (interactions), semantic (facts), procedural (skills/rules) with well-defined schemas.
- Time-aware model inspired by Zep (episodes, bi-temporal facts, entities) to support “what changed when” and point-in-time recall.
- Retrieval: hybrid (semantic + keyword + graph/path) with re-ranking; support proactive (context-driven, not just query) recall per “When Users Don’t Ask” (2609.03467).
- Evidence utilization focus (UTILMEM): store provenance/links so recalled memories can be cited/utilized correctly.
- Local-first option (MemX) with clear sync boundary; production guardrails (scoping, TTL/decay, PII policy).
- Benchmarks as guardrails: LongMemEval-style tasks to validate recall quality, not just presence.
- Contracts: memory read/write/query with clear invariants, ownership per ARCHITECTURE.md.

NOW (first high-value slice, smallest that materially improves)
- Define memory contracts/interfaces (types: MemoryBlock/Episode/Fact, retrieval result with score/provenance) — no heavy SDK integration yet.
- Introduce episodic log (append-only episodes) with timestamps and metadata (source, session). 
- Hybrid retrieval scaffold (vector + keyword) over local store (IndexedDB) with basic ranking. 
- Add time decay/recency bias and scope filters (per session/user/thread).
- Instrumentation: retrieval metrics (hits, latency, coverage) to make quality measurable.
Slice size: interfaces + minimal implementation + unit tests. No production behavior change without tests.

NEXT
- Temporal graph edges (entities <-> facts) with valid_at/invalid_at (Zep-inspired) for canonicalization/conflict resolution.
- Proactive recall triggers (context-driven) based on task state (not just user query) — align to 2609.03467.
- Summarization of threads into observations/user summary (Zep context types) to compress history.
- Migration strategy for existing local memory (backward compatible).

LATER
- Multimodal hooks (TeleMem) if assets/attachments appear.
- Cross-device sync with conflict model; local-first by default.
- Eval harness (LongMemEval/UTILMEM subsets) integrated as CI checks for memory quality.
- Personalization (Memoria) with consent boundaries.

TESTS (deterministic)
- Unit: serialization, schema, time handling, decay, scope enforcement.
- Integration: append/read/query, deduplication, invalidation (fact supersession).
- E2E: conversation flows where recall matters (user says “as before”, context shifts).
- Adversarial: PII leakage, cross-thread bleed, stale facts, injection via memories.
- Eval: small LongMemEval-style regression set (deterministic fixtures) to prevent recall regressions.

RISKS
- Privacy: memories can leak across contexts; need redaction, scopes, user control (delete/export).
- Performance/Android: IndexedDB queries large corpora; need indexing, pagination, budgets.
- Correctness: time semantics bugs (bi-temporal) hard to test; canonicalization drift.
- Security: untrusted content stored; retrieval injection.
- Cross-system: ownership conflicts if multiple subsystems write to same memory store (must respect ARCHITECTURE.md boundaries).

FIRST_SLICE
Define `MemoryStore` contract + `EpisodicMemory` (append episodes, query by time/semantic) with IndexedDB backend minimal impl + 5–10 deterministic unit tests. This is smallest slice that enables measurable recall without destabilizing.

KNOWN_UNKNOWNS
- Full PDFs of arXiv papers not deeply parsed (abstracts only) — may miss algorithmic details.
- Current Seven memory schemas/limits unknown from quick scan (need deeper file read of memory modules). 
- Whether benchmarks (LongMemEval) can run in CI (fixtures). 
- Product requirements for “context budgets” not explicit in MILESTONES.

DOMAIN_VERDICT=READY_FOR_PLAN
