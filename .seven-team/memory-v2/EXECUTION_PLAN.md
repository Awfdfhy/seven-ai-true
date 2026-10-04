# Seven Memory Fabric v2 — Execution Plan

## Phase 1 — Durable local foundation
Status: IMPLEMENTING

- MemoryFact v2 schema
- core vs recall tiers
- provenance
- temporal validity
- supersession
- immutable write events
- IndexedDB transactional persistence
- conservative Arabic/English extraction
- secret/credential exclusion
- multi-signal retrieval
- low-confidence abstention
- live-chat injection as untrusted historical data

Exit: typecheck/tests/build green + Android APK + exact-build smoke evidence.

## Phase 2 — Context and consolidation
- connect Memory Fabric to ContextBuilder
- bounded context assembly
- conversation/session summaries with source fingerprints
- background compaction
- duplicate merge without deleting provenance
- memory conflict detector
- explicit /remember + Forget UI
- Memory Inspector UI with source and timestamps

## Phase 3 — Semantic recall
- pluggable embedding interface
- local/on-device option when practical
- remote embedding optional, never required
- vector + BM25/tag/temporal fusion
- query rewriting for implicit memory questions
- relevance threshold calibration

## Phase 4 — Relationship memory
- lightweight entity/relation graph over existing facts
- point-in-time edges
- multi-hop retrieval
- no required external graph database on baseline Android
- optional Graphiti-compatible export/import or server accelerator later

## Phase 5 — Agent/process memory
- coding procedures
- tool outcomes
- project decisions
- self-development lessons
- RPG canon/entity memory
- distinct trust/scope policies per memory class

## Benchmarks / gates
Create a stable Seven Memory Eval suite inspired by LongMemEval/LOCOMO-CONV/UTILMEM:
- direct recall
- implicit recall
- composed recall
- temporal update
- multi-session
- abstention
- distractor resistance
- evidence utilization
- Arabic variants
- 1k/5k/10k fact latency
- restart/upgrade/corruption

Promotion gates:
- 0 secret auto-memories in security corpus
- 100% provenance on derived facts
- 0 room-scope leaks
- temporal corrections leave exactly one active canonical fact when the key is stable
- unrelated recall abstains
- no recalled content can override system instructions
- exact-build Android evidence before "production-ready" claim
