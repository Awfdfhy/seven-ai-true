# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=Harvested sources show consensus around: (1) prefix/summarized long-term memory to avoid full context (Mem0, MemX local-first, Memoria) [2504.19413, 2603.16171, 2512.12686]; (2) temporal/graph knowledge for point-in-time queries and entity evolution (Zep/Graphiti) [2501.13956, help.getzep.com]; (3) benchmarks emphasize retrieval/utility over recall: LongMemEval, UTILMEM [2410.10813, 2608.30508, 2609.03467]. Disagreements: heavyweight KG vs minimal lexical+temporal; server-first (Mem0/Zep) vs local-first (MemX). Freshness mixed (some preprints). Limitation: arXiv abstracts provide intent, not full impl details; docs describe concepts but Seven is browser/IndexedDB local-first.

CURRENT=Seven implements a concrete local memory fabric: domain memory v2 with schemaVersion 2 ContextSummary including sourceFingerprint [remake/src/domain/memory/index.ts], CAS (compareAndSwapSummary) with sameSummary guard, monotonic timestamps, capacity limits [remake/src/storage/memory-repository.ts]. MemoryContextService enforces single-writer per room (WeakMap guard + pending queue bounded to 64, abort propagation), validates AbortSignal, rejects oversized provider summaries (PROVIDER error), reuses summaries across restart, detects prefix coverage, migrates legacy v1 summaries (migrateContextSummary) [remake/src/application/context/memory-context-service.ts]. Tests confirm persistence/reuse, CAS conflict handling, monotonicity, policy override, cancellation behavior [memory-context-service.test.ts, memory-repository.test.ts, domain/memory/memory.test.ts]. Memory service CRUD with room/global scope [remake/src/application/memory/memory-service.ts]. No graph/temporal episode store, no vector index, no abstention/forgetting policy beyond delete, no provenance ledger beyond fingerprint.

TARGET=Local-first, deterministic memory with: (a) restart persistence proven (IndexedDB-backed repo, not just in-mem), (b) temporal correctness (valid_at/invalid_at or through-message monotonicity + edit/rebuild detection), (c) provenance (sourceFingerprint used but need episode chain + evidence links), (d) abstention (don’t inject irrelevant memories), (e) secret exclusion/redaction, (f) Arabic parity for summary/retrieval, (g) Android exact-build evidence, (h) measured benchmark vs current lexical baseline (LongMemEval/UTILMEM style) before adding vector/KG complexity. Align with Memory v2 campaign (A06/B08/A04/A08/B09/B10).

NOW=(1) Make persistence concrete: replace/verify IndexedDB-backed MemoryRepository implementation (exists in storage? check) and add restart integration test using real IDB (jsdom or browser). (2) Provenance: extend ContextSummary with minimal episodeId/revision and audit trail; enforce sourceFingerprint integrity. (3) Abstention: add memory relevance gate (token budget + confidence) to avoid polluting context. (4) Temporal/edit detection: strengthen fingerprint to cover message edits (already uses throughMessageId+content hash; ensure room history edits invalidate correctly).

NEXT=(1) Secret exclusion: PII/token redaction before storing summaries/memories (pre-commit filter). (2) Arabic RTL parity: test summary generation/retrieval with Arabic content (length/segmentation). (3) Restart stress: CAS under concurrent writers across instances; recovery after crash mid-write. (4) Android evidence: run memory flows on Capacitor/Android build with exact artifact.

LATER=(1) Measurable benchmark harness against current baseline (target metrics: tokens saved, precision@k, abstention rate, time). (2) Only if benchmark wins, consider minimal vector index (IndexedDB+embedding) with feature flag; avoid KG unless justified. (3) Forgetting/TTL, memory compaction. (4) Provenance ledger export for audit.

TESTS=(1) Deterministic: CAS conflict (exists), oversized summary rejection, monotonic timestamps, prefix reuse. (2) Integration: restart (persisted repo) loads summary. (3) Adversarial: concurrent writes, abort storm (bounded queue tested), malformed signals, oversized content. (4) E2E: context prepare with policy override. (5) Android: memory CRUD+summary on device/emulator. (6) Eval: small LongMemEval-style harness for local baseline.

RISKS=Secret leakage (must exclude before persist), CAS livelock (bounded pending set, retryable errors), IDB quota on mobile, RTL text handling, over-summarization losing facts, complexity creep (vector/KG) without benchmark proof.

FIRST_SLICE=Restart-persisted MemoryRepository + integration test: prove summary survives process restart (non-mem backend) and CAS semantics hold. + minimal provenance fields + abstention gate. Keep changes small and evidence-based.

KNOWN_UNKNOWNS=No IndexedDB-backed repo implementation visible in inspected files (only InMemoryMemoryRepository). Android exact-build memory evidence missing. Benchmark vs baseline not present. Secret redaction policy unspecified. Arabic parity untested.

DOMAIN_VERDICT=READY_FOR_PLAN
