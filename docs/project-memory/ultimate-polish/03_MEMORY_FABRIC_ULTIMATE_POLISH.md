# Seven AI — Memory Fabric Ultimate Polish

> **Campaign item:** #03 Memory Fabric
> **Protocol:** Ultimate Polish 2.1 + Velocity Fabric
> **Method:** Ground Truth -> Research -> Pass A -> Velocity Assault -> Pass B -> Velocity Regression -> Reconciliation
> **Result:** ARCHITECTURE FREEZE CANDIDATE
> **Implementation truth:** PARTIAL / strong foundation exists. This record does not claim final implementation or production verification.

## Mission
Memory is a core intelligence system, not a chat-history feature. Seven must preserve useful experience across months, track change over time, retrieve the right memory for the active task, learn reusable lessons from verified outcomes, resist corrupted or misleading memories, support genuine forgetting, and remain lightweight on Android.

Prime rule:
> **Capture with immutable origin, preserve change over time, derive aggressively but commit conservatively, retrieve hierarchically, and never let memory manufacture truth or authority.**

---

# 1. Ground Truth
Seven already has meaningful memory foundations in the protected source and test harness:
- canonical memory records and validation,
- explicit lifecycle states,
- provenance / trust / authority metadata,
- append-only event history and reconstruction,
- version/supersession concepts,
- temporal validity,
- consolidation contracts,
- conflict scanning,
- retrieval candidate / ranking / fusion contracts,
- deterministic retrieval-intent gating,
- lexical and relational retrieval foundations,
- fail-closed behavior for storage corruption/write failure,
- rule that memory metadata never grants action authority,
- real-source memory tests.

The implementation matrix correctly labels Memory Fabric partial versus the Architecture v4 target.

## Critical defects in the current architecture
1. The current type registry mixes unrelated dimensions: `working`, `episodic`, `semantic`, `event`, `temporal`, `causal`, `procedural`, `preference` are not peers.
2. Memory authority and factual truth still need a cleaner boundary after Epistemic Fabric 3.0.
3. Much runtime memory logic remains embedded in the protected monolithic HTML instead of an isolated replaceable module.
4. Retrieval needs a final governed hierarchy across exact/entity/time/lexical/relation/optional semantic paths.
5. Consolidation needs stronger guarantees that summaries and inferred patterns remain derived until explicitly committed.
6. Append-only history must coexist with genuine privacy deletion/purge.
7. Verified experience and reusable-procedure learning need explicit contracts.
8. Namespace/principal/project isolation must be enforced before retrieval ranking.
9. A single permanent salience/relevance score is insufficient for different query types.
10. Always-on embeddings, reflection, graph traversal, or model extraction would violate Seven's phone-first constraint.

---

# 2. First-Principles Boundary

`Transcript != Source Event != Memory != Truth != Project State != Run State != Context != Permission`

Memory Fabric owns durable reusable memory, memory lifecycle/history, experience records, namespaces, retrieval, derived indexes/views, consolidation candidates, retention and purge orchestration.

Memory Fabric does **not** own:
- working context: Context Workspace,
- raw transcript archive: Sessions/Persistence,
- factual verdicts: Epistemic Fabric,
- permission grants: Permission/Tool Security,
- canonical project files/state: Project/File systems,
- execution state: Cognitive Runtime,
- world canon: World/Canon runtime,
- model selection: Model Fabric.

---

# 3. Research Findings Used
The design borrows primitives rather than dependencies from current memory research:
- **LongMemEval:** memory evaluation must cover extraction, multi-session reasoning, temporal reasoning, updates and abstention.
- **LongMemEval-V2:** experienced agents need static-state recall, dynamic-state tracking, workflow knowledge, environment gotchas and premise awareness.
- **A-MEM:** dynamic links and evolving organization can improve retrieval, but Seven keeps those links derived.
- **Mem0:** selective extraction/consolidation/retrieval and graph-assisted relational recall can outperform repeated full-history context while reducing latency/token use.
- **LightMem:** filtering and deferred/offline consolidation can sharply reduce online compute while improving accuracy.
- **Temporal graph systems such as Graphiti/Zep:** useful ideas include entity/relationship time, invalidation rather than destructive overwrite, and hybrid lexical/semantic/graph retrieval.
- **Memory-security research:** persistent memory requires origin-bound authority; summary, tool echo, repetition and derived copies must not launder untrusted origin into trusted future behavior.

Seven adopts these concepts only when they preserve authority, privacy and mobile efficiency.

---

# 4. Pass A — Maximal Candidate
Pass A proposed:
1. immutable memory event ledger,
2. versioned memory atoms,
3. entity/temporal/causal graph,
4. lexical/vector/graph/time indexes,
5. automatic admission,
6. extraction/dedup/conflict handling,
7. continuous consolidation/reflection,
8. procedure learning from experience,
9. hybrid query planner/reranker,
10. multi-agent namespaces,
11. retention/forgetting,
12. observability/evals.

It was powerful but too broad and expensive as a default. Velocity and Pass B removed always-on intelligence and separated orthogonal responsibilities.

---

# 5. Velocity Assault
Default read path:

`Need Gate -> Scope Filter -> Cheap Candidate Retrieval -> Fusion -> Validation -> MemoryCapsule`

No model call is required to retrieve a direct preference, exact project memory or keyed state.

Heavy/lazy only:
- embedding model load,
- vector rebuilds,
- broad graph traversal,
- clustering,
- model-based consolidation,
- broad conflict scans,
- archive-wide reprocessing.

Preferred future storage semantics, pending Persistence reconciliation:
- transactional canonical store,
- FTS/BM25-style lexical index where available,
- relational adjacency tables for bounded graph expansion,
- optional rebuildable vector sidecar,
- IndexedDB-class semantic equivalent on web.

No server graph database belongs in the base APK.

### Retrieval tiers
**Lite:** direct/keyed + scope/entity/time + lexical + bounded relations.

**Balanced:** Lite + richer fusion + optional cached/local semantic candidates.

**Full:** Balanced + optional semantic rerank + broader bounded graph/episode expansion.

Privacy, authority and scope filters are mandatory in every tier.

Consolidation runs only at session/task boundaries, idle windows, explicit user request, or resource-healthy deferred windows. Background memory work always yields to interactive work.

---

# 6. Pass B — Destroy the Winner

## B1. Graph becomes a second truth store
**Fix:** entity/semantic/graph structures are derived views referencing MemoryAtoms and Epistemic claim/verdict refs. Graph presence never means factual truth.

## B2. Flat taxonomy mixes unrelated axes
**Fix:** working memory moves to Context Workspace; event becomes MemoryEvent; temporal/causal become relation/index dimensions; semantic becomes a derived view. Durable memory roles remain separate.

## B3. Consolidation invents durable knowledge
**Fix:** consolidation outputs `DerivedMemoryView` or `MemoryCandidate`; canonical promotion requires source refs, validation and policy. Original sources remain reconstructable.

## B4. A misleading successful-looking experience poisons later behavior
**Fix:** Experience records preserve origin, task scope and verified outcome. Procedure distillation requires explicit authoritative instruction or evidence-qualified verified experience. Retrieved memory never bypasses Tool Security.

## B5. Origin is laundered by summary/repetition/tool echo
**Fix:** immutable origin-authority references survive every transformation. Descendants of one origin remain one corroboration cluster.

## B6. Vector-first retrieval misses exact/current memory
**Fix:** hard scope/entity/lifecycle/time filters and exact/current structured paths precede semantic similarity.

## B7. Recency breaks historical questions
**Fix:** retrieval explicitly distinguishes current-state queries from point-in-time/history queries.

## B8. Entity resolution merges different people/projects
**Fix:** entity resolution is derived and reversible; ambiguous entities remain separate. Canonical MemoryAtom identity never depends on inferred merge.

## B9. Append-only ledger prevents genuine forgetting
**Fix:** audit history is separated from payload retention. A governed PURGE can erase canonical payload and derived representations while optionally retaining only a minimal non-sensitive purge receipt.

## B10. Relevance decay is mistaken for deletion
**Fix:** decay/archival affect retrieval only. PURGED is a governance state with cross-index enforcement.

## B11. Shared memory leaks between scopes
**Fix:** principal/namespace/scope filters apply before candidate generation wherever possible and always before output.

## B12. Child agent silently edits parent memory
**Fix:** child agents emit MemoryCandidates by default. Canonical shared writes require explicit capability/policy.

## B13. Stored procedure becomes permission
**Fix:** procedures are knowledge only; actions still pass Task Contract, permissions and side-effect controls.

## B14. Store-everything policy bloats and contaminates memory
**Fix:** transcripts remain separate. Admission stores only durable future-use information.

## B15. Store-too-little loses workflow knowledge and environment gotchas
**Fix:** explicit EXPERIENCE / LESSON / PROCEDURE paths preserve verified operational learning.

## B16. One global importance score fails across tasks
**Fix:** canonical memory stores no universal relevance scalar. Ranking uses a query-specific signal vector. Retention priority is separate.

## B17. Self-retrieval creates fake corroboration
**Fix:** restatements and derived descendants retain the same origin cluster and do not count as new authority/evidence.

## B18. Private reasoning becomes persistent memory
**Fix:** never store private chain-of-thought. Persist concise outcomes, evidence refs, state transitions and verified lessons only.

## B19. Embedding-model upgrades trigger massive reprocessing
**Fix:** vector indexes are optional, versioned and rebuildable. Migration may be lazy/query-driven while lexical/entity/time retrieval remains functional.

## B20. Continuous reflection drains battery
**Fix:** bounded resource-governed consolidation windows only; no always-on memory loops and no correctness dependency on immediate consolidation.

---

# 7. Reconciled Architecture

## **Seven Memory Fabric 3.0 — Origin-Bound Temporal Experience Ledger**

### Canonical object A: `MemoryEvent`
Immutable memory-system occurrence with:
- event id/version,
- operation,
- actor/principal/source refs,
- origin-authority ref,
- scope,
- observed/recorded time,
- payload ref,
- target memory ids,
- lineage.

A MemoryEvent proves an event occurred in Seven's memory system, not that its proposition is world truth.

### Canonical object B: `MemoryAtom`
Versioned durable reusable unit with:
- memory id/revision,
- durable role,
- content/payload,
- namespace/scope/principal,
- source event refs,
- Epistemic claim refs,
- entity refs,
- valid-time interval,
- lifecycle,
- retention/sensitivity policy refs,
- immutable origin-authority ref,
- supersession refs,
- timestamps/lineage.

### Canonical object C: `PurgeReceipt`
Optional minimal non-sensitive record that a purge occurred. It cannot contain reversible forgotten content.

### Namespace / Policy metadata
Defines owner, sharing, retention, sensitivity, automatic-write eligibility, export and purge behavior.

---

# 8. Orthogonal Memory Model

## Durable roles
- `EPISODE` — bounded remembered interaction/event.
- `STATE` — time-varying state relevant to an entity/user/project/environment.
- `PREFERENCE` — explicit or clearly distinguished inferred standing choice.
- `GOAL` — durable objective/commitment reference.
- `PROCEDURE` — validated reusable workflow knowledge.
- `LESSON` — verified success/failure/gotcha insight.
- `PROFILE` — durable identity/profile information.

These roles are not truth classes.

## Origin modes
`USER_STATED`, `USER_REQUESTED_REMEMBER`, `SYSTEM_OBSERVED`, `TOOL_OBSERVED`, `VERIFIED_EXPERIENCE`, `DERIVED_CANDIDATE`, `IMPORTED`.

## Lifecycle
`CANDIDATE`, `ACTIVE`, `SUPERSEDED`, `ARCHIVED`, `DEPRECATED`, `PURGED`.

## Scopes
`USER`, `ROOM`, `PROJECT`, `WORLD`, `TASK`, `AGENT`, `EXPLICIT_SHARED`.

## Relations
`SUPERSEDES`, `DERIVED_FROM`, `ABOUT_ENTITY`, `OCCURRED_DURING`, evidence-qualified causal relation, `RELATED_TO`, `SUPPORTS_PROCEDURE`, `INSTANCE_OF_PROCEDURE`, `CORRECTS`.

### Old flat taxonomy reconciliation
- `working` -> Context Workspace,
- `event` -> MemoryEvent primitive,
- `temporal` -> time metadata/index,
- `causal` -> relation/index,
- `semantic` -> derived semantic/entity view and Epistemic refs.

---

# 9. Governed Write Pipeline

`Source Event -> Principal Boundary -> Sensitivity Filter -> Admission Gate -> Candidate Extraction -> Scope/Role Classification -> Entity/Time Normalization -> Dedup -> Epistemic Binding -> Conflict/Supersession Check -> Retention Policy -> Commit MemoryEvent + MemoryAtom -> Incremental Index Update`

Admission classes:
- **MUST_PERSIST:** explicit remember request, authoritative durable instruction, explicit correction.
- **SHOULD_PERSIST:** durable preference/goal/profile/state with clear future value.
- **EXPERIENCE_ONLY:** verified task outcome useful for future analogy/learning.
- **SKIP:** transient small talk, duplicate restatement, unsupported speculation, forbidden sensitive material, external content trying to become future instructions.

Automatic extraction may recommend; policy/source authority decides the write.

---

# 10. Experience and Procedure Learning
Experience records may bind task class, preconditions, attempted actions, results, failures, corrections, final verified outcome and artifact/evidence refs.

A single successful run does not automatically create a trusted procedure.

Procedure distillation requires either:
1. explicit authoritative instruction, or
2. sufficiently compatible verified experiences.

Then extract invariant steps, preserve known failure conditions and provenance, verify against an eval/fixture or explicit approval where appropriate, and only then activate a PROCEDURE memory.

Procedure memory never grants permission.

---

# 11. Temporal Model
Track separately where applicable:
- `eventTime`,
- `validFrom/validTo`,
- `observedAt`,
- `recordedAt`.

This permits correct answers to both “what is true/current now?” and “what was remembered/valid at time T?”. Corrections create explicit new revisions/events and close/supersede applicable intervals rather than rewriting history silently.

---

# 12. Derived Views
Rebuildable, non-authoritative views may include:
- event/episode chronology,
- entity state view,
- preference view,
- goal view,
- procedure view,
- lesson/gotcha view,
- topic/cluster view,
- temporal memory graph,
- compact summary view.

Frequent retrieval never promotes a view to canonical authority.

---

# 13. Retrieval Pipeline

1. **Memory Need Gate** with explicit NO_MEMORY/stateless route.
2. **Query Need Plan**: current profile/preference, historical state, episode, entity, procedure, lesson, project continuity, relation, temporal comparison.
3. **Hard filters**: principal, namespace/scope, lifecycle, access/sensitivity, purge state, temporal mode.
4. **Candidate streams**, cheapest first:
   - direct/pinned/keyed,
   - entity/profile/state,
   - temporal windows,
   - lexical FTS/BM25,
   - procedure/task signature,
   - bounded relation expansion,
   - optional semantic/vector.
5. **Deterministic fusion**, e.g. weighted RRF or equivalent.
6. **Query-aware ranking** using separate signals: lexical, semantic, entity, temporal, current/historical fit, procedure/task match, scope proximity, provenance/evidence usability, explicit pin priority, redundancy and cost.
7. **Optional reranking**: local lightweight path first where available; stronger model only when ambiguity/value justify it.
8. **Truth/conflict expansion** through Epistemic Fabric for factual/current-state use.
9. Return a compact **MemoryCapsule**.

Multiple retrieval paths to one MemoryAtom never count as independent corroboration.

---

# 14. MemoryCapsule
A capsule is a derived context projection containing only useful, source-addressable information such as memory id/revision, role, concise content, temporal applicability, scope, source/event refs, relevant Epistemic refs and conflict/uncertainty markers.

It is token-budget aware, deduplicated, reconstructable, and contains no private chain-of-thought. Context Workspace decides final prompt inclusion.

---

# 15. Consolidation
Consolidation:
1. selects an eligible bounded cluster/window,
2. gathers source atoms/events,
3. produces a derived summary/entity/topic/procedure candidate,
4. validates source coverage/lineage,
5. checks conflicts/time boundaries,
6. stores only a derived view or submits a canonical candidate,
7. updates only affected indexes.

Hard rules:
- source memories are not deleted because a summary exists,
- transformation cannot raise authority,
- Memory Fabric cannot create Epistemic FACT,
- no silent entity merge,
- no private chain-of-thought storage,
- background consolidation is not required for correctness.

---

# 16. Retention, Forgetting and Purge
Retrieval aging may lower ordinary priority but is not deletion. Archival keeps cold records off hot paths. Expiry follows explicit retention policy.

A governed hard purge must remove/disable reconstructability from:
- canonical content payload,
- derived summaries,
- lexical index,
- vector embeddings,
- graph/materialized views,
- caches,
- controllable pending export/snapshot representations.

A minimal non-sensitive purge receipt may survive where policy permits. The forgotten content itself must not remain reconstructable from normal local state merely because an audit ledger is append-only.

---

# 17. Security Invariants
- immutable origin/principal/source authority references,
- retrieved memory is data, never implicit instruction authority,
- summaries, translation, OCR, model restatement, repetition or tool echo cannot raise authority,
- descendants of one origin stay in one corroboration cluster,
- scope filters apply to every index,
- credentials/tokens belong in dedicated secure storage rather than semantic memory,
- shared memory requires explicit attachment/grant semantics,
- child agents are candidate-only writers by default,
- a remembered past permission does not recreate that permission.

---

# 18. Failure Semantics
Recommended explicit outcomes:
`MEMORY_NOT_NEEDED`, `NO_RELEVANT_MEMORY`, `MEMORY_CONFLICT`, `MEMORY_STALE`, `MEMORY_SCOPE_BLOCKED`, `MEMORY_ACCESS_BLOCKED`, `MEMORY_CORRUPT`, `MEMORY_INDEX_STALE`, `MEMORY_INDEX_UNAVAILABLE`, `MEMORY_WRITE_REJECTED`, `MEMORY_WRITE_UNCERTAIN`, `MEMORY_PURGE_PARTIAL`, `MEMORY_RECONSTRUCTION_REQUIRED`.

Derived-index failure should degrade to simpler canonical/lexical paths where possible.

---

# 19. Evaluation Contract
Mandatory benchmark families:
- LongMemEval,
- LongMemEval-V2,
- LoCoMo,
- MemBench.

Seven-specific suites must test:
- important-memory capture vs junk rejection,
- explicit remember/correction/update,
- exact preference and Arabic/English paraphrase,
- current vs historical state,
- entity ambiguity,
- multi-hop relation,
- procedure/gotcha recall,
- absent-memory abstention,
- conflicting memories,
- experience transfer with precondition matching,
- poisoned/misleading memory resistance,
- summary/tool-echo authority laundering resistance,
- child-agent write isolation,
- cross-project/namespace isolation,
- forget/purge completeness,
- no forbidden sensitive data admitted to semantic memory,
- 1k/10k/100k scale where platform permits,
- interrupted index rebuild,
- mixed embedding versions,
- Lite/low-RAM/thermal operation.

Metrics include write precision/recall, Recall@k, MRR/nDCG, task accuracy, temporal/update accuracy, abstention correctness, stale-memory error rate, conflict preservation, security-block rate, scope-leak rate, purge completeness, p50/p95 retrieval latency, injected-token count, storage growth and mobile resource cost.

---

# 20. Proof of Improvement
Compared with the existing architecture, this candidate improves:
- taxonomy correctness,
- Epistemic/Memory authority separation,
- origin-bound security,
- verified experience learning,
- temporal reasoning,
- hierarchical retrieval,
- privacy/purge semantics,
- namespace isolation,
- mobile efficiency,
- index rebuildability,
- storage/model replaceability,
- benchmark coverage.

---

# 21. Implementation Stages
Implementation is deferred until interacting architectures are polished/reconciled.

- `MF-P0` — canonical schemas + compatibility map from current records.
- `MF-P1` — MemoryEvent / MemoryAtom / namespaces / purge semantics + transactional adapter.
- `MF-P2` — role taxonomy + temporal revision/supersession.
- `MF-P3` — hybrid lexical/entity/time/relation retrieval + MemoryCapsule.
- `MF-P4` — Epistemic binding + origin-authority/security hardening.
- `MF-P5` — Experience/Lesson/Procedure pipeline.
- `MF-P6` — optional local embeddings/reranking + lazy migration.
- `MF-P7` — consolidation/materialized views + bounded temporal graph.
- `MF-P8` — Context/Projects/Coding/World integrations.
- `MF-P9` — purge/import/export/recovery/persistence reconciliation.
- `MF-P10` — benchmark/security/mobile eval gates.

Do not mutate the protected `seven_ai-final.html` merely to begin these stages.

---

# 22. Freeze-Candidate Invariants
1. Memory-record authority is not factual-truth authority.
2. Memory never grants permission.
3. Working context is not long-term memory.
4. Transcript history is not automatically long-term memory.
5. Event, durable role, temporal relation and semantic view are separate axes.
6. Origin authority cannot rise through transformation, retrieval or repetition.
7. Graph/vector/summary/index state is derived and rebuildable.
8. Scope/principal filters are enforced before memory leaves the fabric.
9. Purged content disappears from canonical payload and derived indexes, not only UI.
10. Corrections preserve history unless purge is requested.
11. Recency never replaces point-in-time reasoning.
12. Procedure memory is advisory knowledge, not action authorization.
13. Experience becomes procedure only through a verification gate.
14. Self-derived restatements are not independent corroboration.
15. Private chain-of-thought is never stored as memory.
16. Semantic/vector retrieval is optional; structured/lexical fallback remains functional.
17. Admission is selective; store-everything is rejected.
18. Retrieval can abstain; absence does not permit invention.
19. Heavy consolidation/embedding work is lazy and resource-governed.
20. Cross-system reconciliation may amend this architecture only with documented proof of improvement.

## Verdict
**PASS — ARCHITECTURE FREEZE CANDIDATE**

The strongest practical Seven memory is not a giant vector store, recursive summary, graph database, or model-managed notebook. It is a small origin-bound canonical event/atom core surrounded by rebuildable temporal/entity/retrieval views, verified experience learning, query-aware hybrid retrieval and aggressively lazy computation.

Next after formal freeze: **#04 Context Fabric / Context Workspace**.
