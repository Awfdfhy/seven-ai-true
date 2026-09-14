# Seven AI — Memory Fabric Freeze Record

> **Campaign item:** #03 Memory Fabric
> **Status:** ARCHITECTURE FROZEN FOR CAMPAIGN / IMPLEMENTATION DEFERRED
> **Source record:** `03_MEMORY_FABRIC_ULTIMATE_POLISH.md`
> **Final target:** **Seven Memory Fabric 3.0 — Origin-Bound Temporal Experience Ledger**
> **Important:** This is an individual-system architecture freeze, not an implementation-complete claim. Cross-system reconciliation may amend it only with documented proof of improvement.

## Prime Law
> Capture with immutable origin, preserve change over time, derive aggressively but commit conservatively, retrieve hierarchically, and never let memory manufacture truth or authority.

## Final Ownership
Memory owns durable reusable memories, memory event/history semantics, admission, lifecycle, temporal memory evolution, experience records, namespaces/scopes, retrieval, derived memory indexes/views, consolidation candidates and retention/purge orchestration.

It does not own working context, raw transcript archive, factual truth, permissions, canonical project state, execution state, world canon or model routing.

## Canonical Objects
- `MemoryEvent` — immutable memory-system occurrence with origin/principal/scope/time/lineage.
- `MemoryAtom` — versioned durable reusable memory with role, scope, source refs, temporal validity, lifecycle, policy and origin authority.
- `PurgeReceipt` — optional minimal non-sensitive audit marker after governed hard deletion.
- Namespace/policy metadata — ownership, sharing, retention, sensitivity, write eligibility, export and purge rules.

## Durable Roles
- EPISODE
- STATE
- PREFERENCE
- GOAL
- PROCEDURE
- LESSON
- PROFILE

These are memory-use roles, not truth classes.

## Taxonomy Reconciliation
The previous flat type model is not retained as the final architecture:
- `working` belongs to Context Workspace,
- `event` becomes the MemoryEvent primitive,
- `temporal` becomes time metadata/indexing,
- `causal` becomes a typed relation/index,
- `semantic` becomes a derived semantic/entity view and/or Epistemic reference.

## Accepted Architecture
- immutable origin binding,
- versioned memory atoms,
- explicit current vs historical temporal semantics,
- source-preserving correction/supersession,
- selective memory admission rather than transcript dumping,
- verified Experience/Lesson records,
- governed Procedure distillation,
- explicit namespaces/principals/scopes,
- hierarchical retrieval with cheap paths first,
- lexical/entity/time/relationship retrieval as first-class paths,
- optional semantic/vector retrieval,
- deterministic fusion + query-specific ranking signal vector,
- MemoryCapsule as the compact Context boundary,
- derived temporal/entity/topic/procedure views,
- derived bounded memory graph rather than graph authority,
- lazy embeddings and model reranking,
- deferred/resource-governed consolidation,
- full purge across canonical payload and derived indexes,
- structured/lexical fallback when semantic infrastructure is unavailable,
- child-agent candidate-only writes by default,
- origin-cluster handling so restatement/repetition cannot fake independent corroboration.

## Rejected Designs
- giant vector store as the memory architecture,
- one universal memory type enum mixing orthogonal axes,
- full transcript = long-term memory,
- global always-on graph traversal,
- vector-first retrieval for every query,
- one permanent relevance/importance score,
- continuous background reflection,
- automatic procedure creation from one successful run,
- automatic entity merge as canonical identity,
- summary replacing/deleting source memory,
- model-controlled unrestricted canonical writes,
- append-only policy that prevents genuine user deletion,
- relevance decay as a substitute for deletion,
- memory text acting as permission,
- private chain-of-thought persistence,
- mandatory embedding model for correctness,
- mandatory graph-database/server dependency in the base APK.

## Frozen Invariants
1. Memory-record authority is distinct from factual truth authority.
2. Memory never grants permission.
3. Working context is not long-term memory.
4. Transcript history is not automatically memory.
5. Event, durable role, time and relation semantics remain orthogonal.
6. Origin authority cannot rise through transformation, retrieval, summary, repetition or tool echo.
7. Derived graph/vector/summary/index state is rebuildable and non-authoritative.
8. Principal/namespace/scope filters apply before memory leaves the fabric.
9. Purged content must disappear from canonical payload and derived indexes, not just the UI.
10. Corrections preserve history unless a purge removes it.
11. Current-state and point-in-time retrieval are distinct.
12. Procedure memory is knowledge only, never authorization.
13. Experience becomes procedure only through a governed verification gate.
14. Self-derived descendants do not count as independent corroboration.
15. Private chain-of-thought is never stored as memory.
16. Semantic/vector retrieval is optional; structured/lexical fallback remains usable.
17. Memory admission is selective; store-everything is forbidden as the default strategy.
18. Retrieval can abstain when no relevant memory exists.
19. Heavy consolidation/embedding work is lazy and Resource-Governor controlled.
20. Cross-system changes require documented proof of improvement.

## Retrieval Contract
`Need Gate -> Scope/Policy Filter -> Direct/Entity/Time -> Lexical -> Procedure/Task -> Bounded Relations -> Optional Semantic -> Fusion -> Query-aware Rank -> Epistemic Expansion -> MemoryCapsule`

This ordering is a cost/authority architecture, not a requirement that every stage run on every query.

## Write Contract
`Source Event -> Principal/Sensitivity Boundary -> Admission -> Candidate -> Role/Scope -> Entity/Time -> Dedup -> Epistemic Binding -> Conflict/Supersession -> Retention -> Commit Event + Atom -> Incremental Derived Updates`

Automatic extraction may propose writes but cannot grant itself canonical authority.

## Experience Learning Contract
A verified task can create an Experience/Lesson record. A reusable Procedure requires explicit authoritative instruction or enough compatible verified experience plus a verification/activation gate. Stored procedures never bypass permissions or Tool Security.

## Purge Contract
A hard purge must remove the forgotten payload from canonical memory and invalidate/remove reconstructable derived copies including lexical/vector/graph/summary/cache representations. A minimal non-sensitive purge receipt may remain when policy permits.

## Velocity Contract
- no heavy memory subsystem on startup merely because it exists,
- direct/exact/current-state memory has a fast path,
- embeddings and semantic reranking are lazy,
- index updates are incremental,
- graph expansion is bounded,
- consolidation occurs off the interaction critical path,
- Lite tier remains fully correct without optional semantic intelligence,
- memory can degrade to canonical/structured/lexical retrieval when derived indexes fail.

## Mandatory Eval Families
- LongMemEval,
- LongMemEval-V2,
- LoCoMo,
- MemBench,
- Seven write-admission tests,
- temporal/update tests,
- procedure/experience transfer tests,
- origin/security tests,
- scope-isolation tests,
- forget/purge tests,
- Arabic/English retrieval tests,
- long-scale and constrained-phone performance tests.

## Implementation Stages
- `MF-P0` schemas + compatibility bridge.
- `MF-P1` MemoryEvent / MemoryAtom / namespace / purge core.
- `MF-P2` role taxonomy + temporal revisions/supersession.
- `MF-P3` hierarchical hybrid retrieval + MemoryCapsule.
- `MF-P4` Epistemic binding + origin/security hardening.
- `MF-P5` Experience/Lesson/Procedure pipeline.
- `MF-P6` optional local semantic retrieval/reranking + lazy migration.
- `MF-P7` consolidation/materialized views + bounded temporal graph.
- `MF-P8` Context/Projects/Coding/World integrations.
- `MF-P9` persistence/import/export/recovery/purge reconciliation.
- `MF-P10` benchmark/security/mobile gates.

## Campaign Handoff
#03 is closed for individual architecture polish.

Next item: **#04 Context Fabric / Context Workspace**.

Memory must be revisited during cross-system reconciliation, especially with Epistemic Fabric, Context Workspace, Persistence, Projects, Permission/Security and Resource Governor before implementation freeze.
