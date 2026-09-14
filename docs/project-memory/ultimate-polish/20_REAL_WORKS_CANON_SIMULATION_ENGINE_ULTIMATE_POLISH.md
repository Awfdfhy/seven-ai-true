# Seven AI — Capability 20 Real Works / Canon Simulation Engine Ultimate Polish

Status: **FREEZE CANDIDATE — architecture only**
Target: **Seven Canon Simulation Engine 3.0 — Source-Locked Branch-Aware Living Canon Graph**

## 1. Prime law

> Canon is never model memory. Canon is a source-bound, continuity-scoped graph of supported commitments. Missing coverage becomes `CANON_GAP`; incompatible player divergence becomes an explicit branch.

Seven may pursue maximum canon fidelity, but it must never claim exact canon where sources are missing, ambiguous or conflicting.

## 2. Ground truth

Strong foundations already exist:

- `world-runtime.js`: sourceRefs, anchors, required facts, forbidden changes, beat order, source coverage, branch-on-order divergence and player agency lock.
- `canon-simulator.js`: continuities, facts, character knowledge horizon, anchors/invariants, world/relationship/location/object state, branch creation and audits.
- `rpg.js`: model prose cannot auto-commit canon; verified controller events are required.

Weaknesses to remove:

- scalar `AUTHORITY_WEIGHT A0–A5` conflicts with frozen Epistemic/Research architecture;
- anchor/canon-debt scalars can compress distinct protected obligations into one number;
- one linear beat index is insufficient for partially ordered events, simultaneous events and adaptation variants;
- source coverage needs exact source/version/evidence locators, not only source ids.

## 3. Canon truth classes

Canonical scene/fact state uses typed epistemic relationships rather than one confidence number:

- `CANON_SUPPORTED`
- `CANON_GAP`
- `CANON_CONFLICT`
- `ADAPTATION_VARIANT`
- `SUPPORTED_DERIVATION`
- `DIVERGENCE`
- `WHAT_IF_BRANCH`
- `UNRESOLVED`

`SUPPORTED_DERIVATION` is never displayed as official canon merely because it is plausible.

## 4. Canonical objects

- `CanonWork`
- `ContinuityRef`
- `CanonSourceVersion`
- `CanonEvidenceUnit`
- `CanonEntity`
- `CanonIdentityLink`
- `CanonFact`
- `CanonEvent`
- `CanonEventRelation`
- `CanonRule`
- `CanonKnowledgeEdge`
- `CanonRelationshipEdge`
- `CanonAnchor`
- `CanonConstraintSet`
- `CanonCoverageContract`
- `CanonSceneContract`
- `InsertionPlan`
- `DivergenceEvent`
- `CanonBranch`
- `CanonAudit`

## 5. Source model

Every canon assertion must be reconstructable to source evidence when Seven labels it source-supported.

Source data includes:

- work/edition/adaptation/continuity
- source version/identity
- episode/chapter/scene/page/time locator as applicable
- acquisition/verification metadata
- evidence unit
- transformation lineage

Search snippets and model recall cannot create canon evidence.

## 6. Continuity graph

Continuities are explicit graphs, not one `default` string only. Seven distinguishes, when relevant:

- original source continuity
- adaptation continuity
- remake/reboot
- side material
- game continuity
- alternate timeline
- user-selected composite continuity only when deliberately defined

Facts do not leak across continuities unless an explicit mapping states equivalence.

## 7. Chronology

Canon events form a partially ordered graph:

- `BEFORE`
- `AFTER`
- `SAME_INTERVAL`
- `CAUSES`
- `REQUIRES`
- `REVEALS`
- `CONTRADICTS`
- `VARIANT_OF`

A total sequence is derived only when the source supports one.

## 8. Character knowledge horizon

For every active canon character, Seven tracks what is knowable at the current event/position.

Knowledge can derive from:

- witnessed canon event
- explicit communication
- source-supported prior knowledge
- valid in-world inference where the RPG rules allow it

Future plot knowledge, narrator knowledge and other characters' private knowledge cannot silently leak into dialogue.

## 9. Canon anchors and constraints

A `CanonAnchor` is not just a weight. It includes:

- protected proposition/event/relationship
- continuity
- validity interval
- source evidence
- dependencies
- flexibility class
- violation consequence
- whether player insertion can route around it

Scene compilation creates an explicit `CanonConstraintSet`:

- must already be true
- must remain possible
- must not yet be known
- protected upcoming commitments
- required character availability
- forbidden silent retcons
- allowed flexible spaces
- unresolved canon gaps

## 10. CanonCoverageContract

Before Seven claims a scene is canon-preserving, coverage must be sufficient for the claims the scene depends on.

Coverage may require:

- identity resolution
- time/event position
- active character knowledge
- relevant relationships
- relevant world rules/powers
- required anchors
- source evidence for critical factual claims

If required coverage is missing, status is `CANON_GAP`. Seven may continue conservatively, ask/search for sources, or clearly switch to a derived/branch mode according to policy.

## 11. Player insertion engine

Goal: maximize player freedom while minimizing unnecessary canon disruption.

Insertion planning finds **causal slack**, not a fake global insertion score. It searches for places where the player can exist or act without requiring unsupported changes to protected commitments.

An `InsertionPlan` records:

- entry point
- continuity/event position
- initial knowledge
- social/location constraints
- protected anchors nearby
- flexible narrative space
- likely causal dependencies
- branch triggers
- coverage state

The user remains free to break canon. Seven's job is to label and propagate that divergence honestly.

## 12. Divergence semantics

When a player action conflicts with a protected canon commitment:

1. validate that the conflict is real, not merely stylistic;
2. preserve the player's action;
3. record a `DivergenceEvent`;
4. fork `CanonBranch` from the last compatible checkpoint;
5. stop claiming later events are official canon unless independently unaffected/rejoined under explicit proof;
6. propagate causal consequences through RPG Engine.

No invisible rollback of the user's choice. No forced railroading merely to preserve canon.

## 13. Branch debt is structural, not scalar

The old `canonDebt` scalar is replaced by unresolved divergence dependencies:

- which anchors are invalidated
- which future events lose preconditions
- which relationships/knowledge states change
- which events remain reachable
- which canon commitments are still compatible

A derived summary may estimate branch distance for UX, but it is never the authority.

## 14. Source conflicts and ambiguous canon

When official/credible sources disagree:

- preserve both assertions and source versions;
- classify conflict by continuity/edition/time;
- do not average them;
- choose a branch/interpretation only when the continuity contract permits it;
- expose `CANON_CONFLICT` or `UNRESOLVED` when necessary.

## 15. Spoiler horizon

Canon knowledge available to **Seven's simulator** can exceed what is shown to the user, but user-facing retrieval/synthesis respects a spoiler policy/horizon when configured. NPC knowledge remains separately constrained by in-world horizon regardless of user spoiler setting.

## 16. Copyright-safe source handling

Seven stores facts, structured events, source locators, short evidence units where permitted, and user-provided material. It does not require reproducing long copyrighted scripts, chapters or dialogue to simulate canon accurately. The engine reasons from source-bound structured claims rather than copying the work wholesale.

## 17. Canon + RPG integration

```text
Canon Graph + Coverage Contract
 -> CanonSceneContract
 -> RPG SceneContract
 -> player action
 -> narrator/NPC proposals
 -> WorldDiff validation
 -> canon constraint audit
 -> commit to current branch
 -> update reachable canon obligations
```

RPG Engine owns generic state/causality. Canon Engine owns source/continuity constraints.

## 18. Velocity assault

- active canon subgraph only in hot context
- lexical/structured lookup before embeddings
- cold source evidence remains handles
- precompute compact identity/timeline indexes during explicit ingestion
- no full-work prompt dumps
- lazy retrieval of future anchors
- no continuous canon research during ordinary scene generation unless a gap affects the current scene
- snapshots/checkpoints for branch state
- source/version hashes prevent repeated parsing

## 19. Pass B — destroy the winner

### Perfect 100% canon claim
Rejected. Exactness depends on source coverage and source consistency.

### Model-memory canon
Rejected.

### One scalar source authority
Rejected by Epistemic Fabric.

### One canon-debt score
Rejected as lossy; dependency-level divergence is authoritative.

### One linear timeline
Rejected; partial order and continuity variants are required.

### Preserve canon by overriding player choices
Rejected; branch honestly instead.

### Inject entire source work into prompt
Rejected for context, copyright, mobile cost and provenance reasons.

### Every plausible inference labeled canon
Rejected; use `SUPPORTED_DERIVATION`/`CANON_GAP`.

## 20. Mandatory evals

- source-backed simple scene
- missing critical source -> CANON_GAP
- conflicting source versions
- anime/manga or adaptation continuity separation
- partially ordered events
- future character knowledge leak
- identity alias resolution
- player action preserving canon
- player action requiring divergence
- rigid future commitment invalidated
- branch consequence propagation 50+ scenes later
- what-if isolation
- rejoining only with valid conditions
- spoiler horizon
- inactive lore not loaded into context
- source update/version invalidation
- Arabic RPG narration while canon identifiers remain stable
- long-horizon NCP-style commitment stress
- copyright-safe structured ingestion path

## 21. Implementation stages

- CAN-P0 source/version/continuity schemas
- CAN-P1 entities/facts/events/evidence graph
- CAN-P2 partial chronology + identity resolution
- CAN-P3 character knowledge/relationship/rule graph
- CAN-P4 anchors/ConstraintSet/CoverageContract
- CAN-P5 scene compiler + Retrieval/Research bridge
- CAN-P6 insertion planning
- CAN-P7 structural divergence/branch dependency graph
- CAN-P8 RPG WorldDiff integration
- CAN-P9 spoiler/source-conflict handling
- CAN-P10 long-horizon/adaptation/mobile evals

## 22. Freeze decision

Freeze candidate is the strongest practical Real Works design for Seven: maximum source-locked fidelity when evidence exists, explicit gaps when it does not, and honest causal branching when player freedom changes the work. It turns canon preservation from a prompt instruction into a verifiable world constraint system.
