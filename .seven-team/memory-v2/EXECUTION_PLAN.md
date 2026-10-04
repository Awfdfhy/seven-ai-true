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


## Completion gate

The Manager must not report Memory as COMPLETE unless every item below is backed by current-build evidence.

### Functional
- [ ] durable global memory
- [ ] room-scoped memory isolation
- [ ] temporal supersession
- [ ] historical recall
- [ ] core + recall separation
- [ ] live-chat injection
- [ ] long-chat lazy summaries
- [ ] hard forget
- [ ] Memory Inspector
- [ ] Arabic + English extraction/recall

### Safety / privacy
- [ ] credential/OTP/API-key exclusion
- [ ] instruction-like memory rejection
- [ ] recalled memory rendered as untrusted data
- [ ] no room-scope leakage
- [ ] delete removes fact content from active fact store
- [ ] assistant output is not silently promoted to user truth

### Retrieval quality
- [ ] unrelated-query abstention
- [ ] temporal update chooses current fact
- [ ] explicit historical query can retrieve superseded fact
- [ ] implicit preference query works
- [ ] 2k distractor suite passes
- [ ] 5k/10k scale measured before semantic layer promotion
- [ ] bounded context never emits truncated/invalid JSON

### Durability
- [ ] IndexedDB restart persistence
- [ ] schema migration behavior
- [ ] blocked-upgrade behavior
- [ ] corruption behavior
- [ ] quota/capacity behavior
- [ ] summary fingerprint invalidates stale summaries

### Exact-build evidence
- [ ] strict typecheck
- [ ] full test suite
- [ ] production build
- [ ] Android lint/unit/assemble
- [ ] APK payload identity
- [ ] Android 14 installed smoke
- [ ] Android 16 installed smoke
- [ ] Reality Lab exact-build evidence

If any item is missing, verdict is MEMORY_IN_PROGRESS or MEMORY_UNPROVEN, never COMPLETE.
