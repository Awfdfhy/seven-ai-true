# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=Harvested sources (20 fetched; primary=11) converge on temporal/graph memory, episodic storage, and retrieval benchmarks (Mem0 92.5 LoCoMo/94.4 LongMemEval, Zep temporal KG with valid_at/invalid_at, LongMemEval/UTILMEM for context-driven retrieval). Common themes: local-first persistence (MemX), scaling agent memory (Memoria/TeleMem), and SDK patterns (Letta memory blocks, Graphiti facts/episodes). Disagreements/minimal: different retrieval philosophies (vector vs temporal graph vs hybrid). Freshness: 2024–2025 preprints (some 260x IDs appear as arXiv numbering artifacts in text) – treat as recent research directions. Limitations: benchmarks emphasize conversational QA, not agent action lifecycle races; persistence concurrency semantics (IndexedDB/locks) mentioned indirectly via local-first but not stress-tested for cancellation/stale writes.

CURRENT=Seven TaskManager is lifecycle-focused (states, AbortController, seals, exclusive owners) but has no integration with long-term/context memory fabric. Repository evidence: only task-manager.ts/test.ts under remake/src/core; no memory blocks, episodes, or temporal fact storage observed. Memory ownership unclear relative to B09 stress domain.

TARGET=Deterministic memory lifecycle aligned with task lifecycle: memory writes (episodic events, task outcomes, cancellation reasons) should be cancellable, idempotent, and race-safe. Adopt temporal semantics (Zep facts with validity windows) so stale writes from cancelled tasks don’t overwrite newer state. Local-first persistence (MemX) patterns suggest versioned writes and conflict detection. Memory retrieval must not block UI/agent during cancellation (respect AbortSignal). Clear ownership: memory fabric owners (A06,B08,A04,A08,B09,B10) must not duplicate TaskManager ownership.

NOW=Define MemoryTaskContext extending TaskContext with memorySessionId and abort-aware write queue. Add a memory write policy: writes after cancellation/deadline seal are dropped or versioned (no stale write). Create a minimal in-memory temporal log (episodes/facts) with versioned keys to prove cancellation-before-write and write-after-seal are prevented. Instrument with TaskManager signals.

NEXT=Integrate IndexedDB-backed episodic store (MDN IndexedDB) with transaction semantics respecting cancellation (abort transactions early). Add conflict detection (version/timestamp) to prevent stale overwrites from slow writes. Benchmark retrieval under long tasks (align with LongMemEval style) without blocking.

LATER=Temporal graph (Graphiti-style) with bi-temporal validity; cross-session consolidation; memory eviction aligned with TaskManager maxRetainedCompleted semantics; eval gates (LoCoMo/LongMemEval/UTILMEM) for context-driven retrieval quality.

TESTS=Deterministic: cancellation-before-write, write-after-seal dropped, stale-write prevented by version, concurrent writers by owner isolated. E2E: task completes -> memory written; task cancelled mid-write -> no partial/stale state. Android: lifecycle-aware (background) persistence. Adversarial: rapid cancel/start, slow transactions aborted. Eval: memory retrieval latency non-blocking under cancellation.

RISKS=Persistence races (IndexedDB transactions), write amplification, token/retention bloat conflicting with maxRetainedCompleted, cross-owner memory leakage. Android background constraints. Privacy: episodic logs must not leak secrets.

FIRST_SLICE=Abort-aware in-memory episodic log with versioned writes + TaskManager integration: smallest change to prevent stale writes from cancelled tasks with deterministic tests.

KNOWN_UNKNOWNS=How Seven’s memory fabric is partitioned across owners (B09 ownership boundary vs A06/B08). Concrete IndexedDB schema/versioning. Benchmark thresholds for Seven.

DOMAIN_VERDICT=READY_FOR_PLAN
