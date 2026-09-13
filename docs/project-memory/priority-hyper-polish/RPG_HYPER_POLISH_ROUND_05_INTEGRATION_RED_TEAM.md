# Seven RPG Hyper-Polish — Round 05: Integrated Red-Team

Status: **CHALLENGER ROUND 05 / MATERIAL IMPROVEMENT FOUND**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Input: RPG 3.5 + accepted Round 01–04 repairs.

## Thesis

The individual fabrics are now strong enough that the highest remaining risks sit at their boundaries. Round 05 attacks transactional consistency, concurrent proposals, replay, schema/version drift, view leakage, branch identity and state growth.

## Critical weaknesses found

### R5-W1 — One player turn can create a partial immediate state

A player action may resolve mechanics, relationship impact, knowledge propagation and quest transitions. If cancellation/crash occurs between these immediate writes, the world can become internally inconsistent.

### Repair: Root Action Transaction

Introduce `RootActionTransaction` for immediate consequences of one committed action.

Stages:
1. bind exact world/branch/version
2. validate PlayerAction or autonomous ActionProposal
3. resolve enabled gameplay modules
4. derive immediate WorldDiff/Event bundle
5. validate invariants/conflicts
6. stage immediate social/quest/knowledge changes
7. commit root + immediate derived events as one transaction boundary
8. enqueue delayed consequences separately with causal refs

Delayed future events are not part of the atomic commit, but their scheduling record is.

Cancellation before commit leaves no authoritative partial state.

---

### R5-W2 — Concurrent NPC actions can conflict

Two actors may simultaneously claim the same resource, move through a constrained location or perform mutually exclusive actions.

### Repair: Intent Batch + Conflict Arbitration

At a world resolution window:
- gather bounded `ActionIntent`s
- validate against the same base snapshot
- build conflict sets
- apply world/module arbitration policy
- resolve order only where needed
- commit results with explicit winner/loser/block reasons

No model may silently decide concurrency by prose order.

---

### R5-W3 — Replay must not rerun generative cognition

A saved campaign reconstructed by rerunning models would drift.

### Repair: Replay Boundary

Authoritative replay uses:
- committed WorldEvents
- recorded RNG draws/state
- committed module resolutions
- committed generated content identifiers where content became material

It does **not** rerun historical model cognition.

Derived prose, summaries, indexes and Director rankings may be regenerated.

---

### R5-W4 — Save compatibility is under-specified

A long-lived RPG architecture needs schema/module evolution without corrupting campaigns.

### Repair: Versioned World Contract

Persist:
- `WorldSchemaVersion`
- `WorldPackVersion`
- enabled `GameplayModuleRevision`s
- Real Works pack/version if attached
- Titles grammar version where material names are stored
- migration history

Migration rules:
- never reinterpret old events silently;
- migrations transform representation, not historical meaning;
- irreversible/ambiguous migration => read-only compatibility or explicit fork rather than invented certainty.

---

### R5-W5 — Branch identity must be universal

Some objects mention branch but the architecture lacks a universal branch-scoping rule.

### Repair: BranchScope Law

Every material mutable object/event is either:
- globally immutable definition/source data; or
- bound to `BranchRef` + world version range.

Cross-branch reads require explicit comparison tooling. No implicit merge.

---

### R5-W6 — Narrator/Director/controller views can leak hidden state

The narrator needs enough truth to render the scene, but characters and sometimes the player must not receive all controller knowledge.

### Repair: Role-Bound View Compiler

Compile separate views:
- `ControllerView` — full authorized simulation state
- `NarratorView` — enough to narrate without exposing protected hidden detail
- `CharacterView(actor)` — actor perspective only
- `PlayerPresentationView` — what the player can legitimately observe/know
- `DirectorView` — opportunity/pacing state, no permission to rewrite facts

Generated prose can only receive the view appropriate to its role.

---

### R5-W7 — Generated flavor can later be mistaken for material history

A narrator may improvise a harmless visual detail. If later code treats it as world truth, authority escalates silently.

### Repair: Materialization Boundary for Generated Detail

Narrative detail classes:
- `PRESENTATION_ONLY`
- `OBSERVABLE_EPHEMERAL`
- `PROPOSED_MATERIAL_DETAIL`
- `COMMITTED_WORLD_DETAIL`

Only explicit validated promotion creates a durable world fact/entity/property.

---

### R5-W8 — Event/history growth needs retention classes

MaterialityGate reduces noise, but very long campaigns still accumulate large ledgers and derived state.

### Repair: History Retention Classes

Events remain immutable, but storage/retrieval may tier them:
- `HOT_MATERIAL`
- `WARM_MATERIAL`
- `COLD_ARCHIVE`
- `DERIVED_DISCARDABLE`

Authoritative historical events are never summarized away. Cold archives may be compressed/storage-tiered with integrity hashes and indexes.

---

### R5-W9 — Cross-fabric circular updates can cascade

Example: relationship change affects goal, goal creates quest, quest creates Director opportunity, opportunity changes scene, scene creates relationship change.

### Repair: Event Phase Ordering

Immediate transaction phases:
1. action resolution
2. world/mechanics effects
3. perception/knowledge projections
4. social/relationship consequences
5. quest/commitment transitions
6. character meaning/goal refresh
7. scheduler/director derived refresh
8. presentation

Later phases may schedule future work but cannot recursively reopen earlier committed phases in the same transaction. New material action requires a new root event/window.

---

### R5-W10 — Extension fields need governance

Open-schema world/character extensions are useful but can become untyped junk.

### Repair: Governed Extension Registry

World packs/modules may add namespaced extension schemas with:
- owner module/pack
- schema/version
- authority semantics
- persistence class
- migration rule
- validation
- context exposure policy

Unknown extension data is preserved opaquely or rejected according to compatibility policy, never interpreted by guesswork.

---

## Integrated execution model

`Input / Scheduled Trigger`
→ role/authority-specific interpretation
→ `RootActionTransaction`
→ `IntentBatch` when concurrency exists
→ module/world resolution
→ phase-ordered immediate consequences
→ atomic commit
→ delayed schedule entries
→ derived view/index refresh
→ role-bound context compilation
→ narration/presentation
→ next `AgencyWindow`

## New canonical objects/laws

- `RootActionTransaction`
- `ActionIntent`
- `IntentBatch`
- `WorldSchemaVersion`
- `GameplayModuleRevision`
- universal `BranchScope Law`
- `GeneratedDetailClass`
- `ExtensionSchemaRegistration`

Derived/policy:
- `RoleBoundViewCompiler`
- history retention/tiering policy
- conflict arbitration policy
- event phase ordering

## Rejected alternatives

- committing mechanics/social/quest writes independently with no transaction boundary
- rerunning old LLM calls during replay
- implicit save migration
- branch-neutral mutable state
- one omniscient prompt reused for narrator/NPC/player-facing output
- treating every improvised noun/adjective as durable world truth
- recursive same-turn cascades with no phase boundary
- arbitrary unvalidated custom JSON fields

## New gauntlets

1. Crash halfway through immediate consequence processing leaves no partial commit.
2. Two NPCs compete for one item and resolution is deterministic/recorded.
3. Save replay never reruns historical model cognition.
4. Old save opens after schema evolution with explicit migration evidence.
5. Branch-local relationship state never leaks to main branch.
6. Character prompt cannot access ControllerView-only secret.
7. Narrated decorative detail remains non-authoritative until promoted.
8. 100k-event campaign can cold-archive without losing authoritative reconstructability.
9. Social→quest→director cycle cannot recursively explode in one turn.
10. Unknown module extension survives compatibility handling without guessed semantics.
11. Cancellation before atomic commit produces no ghost quest/social change.
12. Real Works branch overlay remains separate from source canon definition.

## Reconciliation verdict

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter: **0 / 2**.

Round 05 materially improves transactional correctness, replayability, versioning, branch isolation, information boundaries and long-campaign scalability.