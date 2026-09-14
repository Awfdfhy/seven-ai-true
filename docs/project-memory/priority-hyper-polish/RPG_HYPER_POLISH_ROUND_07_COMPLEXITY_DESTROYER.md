# Seven RPG Hyper-Polish — Round 07: Complexity Destroyer

Status: **CHALLENGER ROUND 07 / MATERIAL IMPROVEMENT FOUND**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Input: RPG 3.5 + accepted Round 01–06 repairs.

## Independent challenger thesis

The strongest risk is now over-modeling. Earlier rounds intentionally exploded hidden assumptions into explicit concepts. This round asks the inverse question:

> Which distinctions are semantically necessary, and which should be types/fields/views rather than standalone canonical object families?

A stronger architecture should preserve the distinctions while shrinking the number of persistence primitives, mutation paths and context surfaces.

## Alternative arena

### Alternative A — Minimal deterministic RPG core

Event ledger + entity/component state + utility AI + authored/generated text.

Strengths:
- simple
- fast
- testable

Weaknesses:
- insufficient perspective/social/long-horizon character depth unless many ad-hoc components reappear.

### Alternative B — Fully agentic cast

One generative agent per NPC with private memory/plans.

Strengths:
- flexible
- expressive

Weaknesses:
- expensive
- difficult to replay
- prone to knowledge leaks/persona drift
- weak transactional truth
- poor 1000-actor scaling

### Alternative C — Current Seven hybrid

Typed event/state kernel + selective model cognition + derived character/social/narrative views.

Verdict: C remains strongest, but the current conceptual inventory can be substantially simplified.

## Material simplifications

### R7-S1 — Use one authoritative event family

Do **not** maintain separate ledgers for:
- CharacterRevisionEvent
- MaterializationEvent
- TransmissionEvent
- AggregateEvent
- social milestones
- discovery events
- quest transitions

All are typed `WorldEvent` variants with shared envelope:
- event id
- event type
- branch
- world/schema version
- cause/parents
- actor/source
- payload schema id
- affected entities/scopes
- authority/provenance
- timestamp/world time
- transaction/root action ref

Specialized names remain event type contracts, not separate storage engines.

Result: fewer persistence paths and unified replay/causality.

---

### R7-S2 — Collapse social commitment object explosion

`Promise`, `Debt`, `Oath`, `Leverage`, `QuestContract` and similar concepts share lifecycle mechanics but differ semantically.

Create canonical `CommitmentRecord` with typed class:
- promise
- debt
- oath
- duty
- quest
- legal/social obligation
- authored/canon obligation where appropriate

Specialized schemas may extend payloads.

`Secret` remains separate because it is information access, not obligation.

---

### R7-S3 — Treat many concepts as metadata/policies, not persisted entities

The following should normally be embedded fields or policies unless a world/module explicitly requires standalone identity:
- `AudienceScope`
- `InformationReach`
- `OpportunityOrigin`
- `GeneratedDetailClass`
- `CommitmentClass`
- `NarrativeMateriality`
- `AttentionBudget`
- `OrganizationResolutionTier`

This reduces object graph growth.

---

### R7-S4 — One Perspective State family

Instead of unrelated storage systems for knowledge/belief/discovery/rumor interpretation, define `PerspectiveState(actor/viewer)` with typed entries:
- observed
- communicated
- believed
- suspected
- rejected
- discovered
- unresolved

Entries retain source/event lineage and certainty semantics.

`CharacterView` and `PlayerPresentationView` are compiled from PerspectiveState plus permissions, not separate truth stores.

---

### R7-S5 — One Opportunity family

Quests, optional encounters, discoveries, social callbacks and Director opportunities share a planning surface.

Use `Opportunity` as the generic derived/controller object with subtype contracts:
- QUEST
- ENCOUNTER
- DISCOVERY
- SOCIAL_CALLBACK
- CHARACTER_ARC
- WORLD_EVENT
- PUZZLE
- AUTHORED_BEAT

Only accepted/committed state transitions become authoritative events/commitments.

This prevents duplicate queues and lifecycle rules.

---

### R7-S6 — Keep psychology sparse

`IdentityLayer`, `MeaningLayer`, `MomentLayer` remain conceptual ownership layers, but worlds materialize only fields they use.

No mandatory universal Big Five, emotion vector, needs taxonomy or stress meter.

A `CharacterStateSchema` supplied by the world/pack declares active dimensions and their update contracts.

---

### R7-S7 — One extension mechanism

`GovernedExtensionRegistry` covers world packs, character extensions and gameplay module state. Do not create separate extension registries per fabric.

---

### R7-S8 — Derived systems stay rebuildable

Explicitly classify as rebuildable views:
- CharacterBookmarkSet
- relationship stance summaries
- GroupBeliefView
- Public/Institutional views where source records exist
- DemotionCapsule
- AgencyTrace
- PlayerChronicle
- ExplorationSurface
- Director ranking queues
- social/reputation summaries

They can be cached/persisted for speed but never become irreplaceable authority.

---

## Final minimal canonical primitive families

The architecture can be expressed through a much smaller backbone:

1. `WorldDefinition / WorldPack`
2. `WorldSession / BranchRef`
3. `WorldEvent` typed event family
4. `WorldEntity` + versioned component/state schemas
5. `CharacterState` with sparse three-timescale psychology
6. `PerspectiveState`
7. `RelationshipState` backed by event refs
8. `CommitmentRecord`
9. `Organization/PopulationState`
10. `ScheduledEvent`
11. `GameplayModuleContract + module-owned state`
12. `Opportunity` controller family
13. `RootActionTransaction`
14. `RngState`
15. `WorldSnapshot`

Everything else is an event subtype, policy, schema, view, index or optional module.

## What was deliberately NOT collapsed

- World truth vs PerspectiveState
- player action vs NPC proposal
- authoritative events vs derived summaries
- Identity/Meaning/Moment ownership boundaries
- relationship history vs stance summaries
- Real Works canon source state vs RPG branch state
- gameplay resolution vs narrative presentation
- current branch vs alternate branches

Those distinctions prevent real failure modes and earn their complexity.

## Mobile impact

This simplification reduces:
- schema count
- persistence code
- indexes
- migration surface
- context compiler inputs
- cache invalidation paths
- risk of multiple authorities

It also makes lazy loading easier because optional modules/views can remain absent.

## New gauntlets

1. Reconstruct all accepted Round 01–06 semantics using the 15 canonical primitive families.
2. No derived cache is required to recover authoritative campaign state.
3. Adding a new gameplay module requires no new core ledger.
4. Adding a new social obligation type uses CommitmentRecord subtype rather than a new persistence system.
5. Perspective knowledge and world truth remain impossible to conflate by schema.
6. A lightweight world can omit unused psychological dimensions entirely.
7. Old derived views can be deleted and rebuilt after migration.

## Reconciliation verdict

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter: **0 / 2**.

The system becomes stronger by becoming smaller: the accepted behavioral distinctions remain, while canonical persistence is compressed into a bounded backbone.