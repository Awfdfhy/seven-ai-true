# Seven Memory Strike Team

Status: ACTIVE
Branch under evaluation: seven-remake-v3
Primary product goal: a trustworthy long-term memory system that is local-first, temporal, provenance-aware, relevance-gated, Arabic-capable and user-controllable.

## Ownership

### A06 — Memory Architect / Consolidation
Own:
- MemoryFact schema evolution
- extraction/consolidation policy
- core vs recall tier rules
- conflict handling
- canonical-key semantics
- summary/memory interaction
- benchmark interpretation
Must not:
- silently widen what is auto-saved
- weaken privacy gates to improve recall

### B08 — Storage / Recovery
Own:
- IndexedDB schema/migrations
- atomic writes
- hard forget
- corruption recovery
- restart persistence
- quota/capacity behavior
- import/export/backup semantics
Required proof:
- abrupt restart
- blocked upgrade
- quota failure
- migration rollback
- delete persistence

### A04 — Context Architecture
Own:
- long-chat compression
- context budget allocation
- summary fingerprints
- separation of room history / durable memory / summary / tool state
- lifecycle boundaries
Required invariant:
Storage != Memory != State != Context != Evidence != Provenance.

### B09 — Retrieval Stress / Races
Own:
- 1k/2k/5k/10k distractor tests
- concurrent writes
- same-key updates
- cancel during summary
- cross-room race isolation
- latency and memory pressure budgets
- stale writer rejection

### A08 — Verification / Release Gate
Own:
- stable Seven Memory Eval suite
- Android exact-build evidence
- benchmark reports
- regression thresholds
- release verdict
Must block release on:
- room-scope leak
- secret auto-memory
- broken hard forget
- invalid context payload
- corrupted restart
- memory-instruction injection

### B10 — Memory UX / Product Judge
Own:
- Memory Inspector usability
- discoverability
- explain "why Seven remembered this"
- source/provenance presentation
- forget UX
- user trust / surprise minimization
- compare current UX principles against first-party/current benchmark products

## Shared workflow

1. RESEARCH
2. SPECIFY one measurable hypothesis
3. IMPLEMENT minimal vertical slice
4. RUN unit/contract/integration tests
5. RUN Memory Eval
6. RUN Android exact-build gate
7. INSPECT user-visible memory behavior
8. RECORD result in memory-v2 evidence
9. MERGE only if quality does not regress

## Current implemented baseline

- MemoryFact v2 with kind/tier/scope/canonicalKey
- source provenance
- temporal validity and supersession
- core vs recall memory
- deterministic Arabic/English extraction
- obvious secret/credential exclusion
- instruction-like memory rejection
- local IndexedDB persistence
- hard forget
- Memory Inspector
- lexical + tag/concept + recency + importance/confidence ranking
- recall abstention
- historical recall
- bounded valid JSON memory injection
- live chat wiring
- lazy long-chat summary/context compression
- 2000-item distractor stress gate

## Next experiments — ordered

1. Extraction precision corpus
   - 500+ Arabic/English positive/negative utterances
   - target high precision before recall expansion
2. Consolidation
   - duplicate paraphrases
   - stable canonical keys
   - contradiction classes
3. Context summaries
   - 100/500/1000 turn synthetic rooms
   - continuation fidelity after restart
4. Semantic recall experiment
   - optional local embeddings only
   - compare quality delta vs APK/model size and latency
5. Entity/relation layer
   - only if multi-hop benchmark proves lexical+semantic insufficient
6. Memory explanations
   - source message/time + reason for recall
7. Backup/export/import
   - explicit user control
8. RPG/project memory specialization
   - separate trust policy from personal user memory

## Promotion criteria

No "Memory complete" claim until all are proven:
- direct recall
- implicit recall
- temporal update
- historical recall
- multi-session persistence
- room isolation
- provenance
- hard forget
- secret exclusion
- instruction-injection resistance
- unrelated-query abstention
- long-chat summary fidelity
- corruption/restart recovery
- Arabic parity
- Android installed-build evidence
- bounded latency at large memory counts
