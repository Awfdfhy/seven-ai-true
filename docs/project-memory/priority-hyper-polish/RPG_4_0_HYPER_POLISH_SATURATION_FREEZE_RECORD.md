# Seven RPG 4.0 — Hyper-Polish Saturation Freeze Record

Status: **RPG_HYPER_POLISH_SATURATED_CANDIDATE — architecture only**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Canonical candidate: `RPG_4_0_RECONCILED_CANDIDATE.md`
Baseline entering special campaign: `RPG_3_5_IMPROVED_CANDIDATE.md`

## Freeze rule satisfied

The special protocol requires two consecutive independent rounds with:

`NO MATERIAL IMPROVEMENT`

after the most recent accepted material change.

Campaign sequence:

- Round 01 — `MATERIAL_IMPROVEMENT_FOUND`
- Round 02 — `MATERIAL_IMPROVEMENT_FOUND`
- Round 03 — `MATERIAL_IMPROVEMENT_FOUND`
- Round 04 — `MATERIAL_IMPROVEMENT_FOUND`
- Round 05 — `MATERIAL_IMPROVEMENT_FOUND`
- Round 06 — `MATERIAL_IMPROVEMENT_FOUND`
- Round 07 — `MATERIAL_IMPROVEMENT_FOUND` (complexity/simplification pass)
- Reconciliation → `RPG_4_0_RECONCILED_CANDIDATE.md`
- Round 08 — `NO MATERIAL IMPROVEMENT`
- Round 09 — `NO MATERIAL IMPROVEMENT`

Final saturation counter: **2 / 2**.

## Frozen target

**Seven RPG 4.0 — Character-Centered Causal Living World Engine**

Prime law:

> Models may interpret, improvise, narrate and propose; authoritative world state, player agency, character perspective, mechanics and consequences remain governed by typed state, validated events and explicit transaction boundaries.

## Canonical backbone

The saturated architecture retains fifteen canonical primitive families:

1. WorldDefinition / WorldPack
2. WorldSession / BranchRef
3. typed WorldEvent family
4. WorldEntity + versioned state/component schemas
5. CharacterState
6. PerspectiveState
7. RelationshipState
8. CommitmentRecord
9. Organization / PopulationState
10. ScheduledEvent
11. GameplayModuleContract + module-owned state
12. Opportunity controller family
13. RootActionTransaction
14. RngState
15. WorldSnapshot

All other accepted concepts are event subtypes, policies, schemas, derived views, indexes, or optional modules unless future evidence proves independent canonical identity is required.

## Major accepted improvements over RPG 3.5

### Character simulation
- explicit Perception → Attention → Interpretation → Appraisal pipeline
- three-timescale Identity / Meaning / Moment psychology
- sparse world-defined character dimensions
- PerspectiveState separate from world truth
- active storyline bookmarks as rebuildable memory views
- Anchoring / Selecting / Bounding / Enacting memory evaluation
- InternalTension
- CharacterSelfModel distinct from controller state
- FastPolicy + selectively activated DeliberativePolicy
- event-bound durable character revision
- agency-safe persona repair

### Social world
- event-derived asymmetric relationships
- unified CommitmentRecord lifecycle
- explicit information transmission lineage
- private/group/public/institutional knowledge views
- audience-scoped social impact
- organization resolution tiers
- no universal reputation or relationship scalar

### Living world
- ACTIVE / RELEVANT / BACKGROUND fidelity
- PopulationCohorts
- honest cohort→individual materialization
- adaptive temporal resolution
- aggregate off-screen events with explicit unknown-detail boundaries
- event-driven scheduling rather than continuous whole-world ticking
- reconstructable demotion capsules

### Narrative and agency
- role-bound Controller/Narrator/Character/Player/Director views
- bounded Opportunity family
- optional Director with intervention budget/cooldowns/quiet windows
- explicit AgencyWindows
- action interpretation separates explicit from inferred user intent
- legal player action outranks Director preference and soft authored beats
- commitment priority semantics

### Quests/gameplay
- dynamic QuestSolvabilityWitness
- puzzle clue sufficiency contracts
- GameplayModuleContract
- ResolutionCapsule / mechanic-narrative handshake
- bounded ChallengeEnvelope
- modules remain lazy/optional

### Integration/recovery
- RootActionTransaction
- bounded concurrent IntentBatch resolution
- deterministic authoritative replay without rerunning historical model cognition
- universal branch scoping
- versioned world/module/save contracts
- role-bound views prevent hidden-state leakage
- generated-detail materialization boundary
- ordered immediate event phases
- governed extension registry
- hot/warm/cold history tiers

### Agency/discovery/history
- AgencyTrace
- PlayerChronicle
- DiscoveryRecord
- causal feedback visibility classification
- optional structured investigation hypothesis/evidence module

## Core invariants

1. Narrative prose is never authoritative by itself.
2. Player intent is never invented as an irreversible committed action.
3. Legal player actions are not rejected merely to preserve soft plot preferences.
4. Character knowledge is perspective-bound.
5. Interpretation/belief never silently becomes world truth.
6. Character change requires causal lineage; valid growth is not repaired back to baseline persona.
7. Relationship summaries never replace formative event history.
8. Hidden acts do not create global reputation changes without an information path.
9. Background simulation never invents precise personal history that was not represented.
10. Optional Director behavior never owns world truth or player choice.
11. Generated quests cannot claim solvability without current world affordances.
12. Mechanics commit outcomes before narrative rendering.
13. Immediate material changes are transactionally committed.
14. Historical replay uses recorded authoritative events, not regenerated cognition.
15. Mutable state is branch-scoped; no implicit branch merge.
16. Real Works source canon is separate from mutable RPG overlays/branches.
17. Derived views/caches remain rebuildable.
18. Unused gameplay/intelligence modules impose near-zero global startup cost where technically practical.
19. No full-world continuous model simulation is required.
20. Architecture truth remains separate from implementation truth.

## Mandatory evaluation families before implementation/release claims

- anonymous persona fidelity
- arc-aware temporal character fidelity
- 50/100/200/500-turn continuity
- memory Anchoring/Selecting/Bounding/Enacting
- false-belief and reinterpretation behavior
- perspective/secret leakage
- relationship/social causality
- information propagation lineage
- Narrative Commitment Preservation-style adversarial trajectories
- legal-action acceptance and irreversible-action invention
- consequence persistence and perceived influence
- branch isolation
- deterministic replay/recovery
- schema migration
- world-scale 10/50/200/1000+ conceptual actors with bounded active set
- quest solvability revalidation
- narrator/mechanics agreement
- Real Works canon/branch/CANON_GAP behavior
- Arabic/bilingual role-play
- Full/Balanced/Lite mobile latency/RAM/CPU/battery/thermal/cancellation behavior

## Rejected architecture directions

- prompt-only RPG memory
- one full persistent model agent per conceptual NPC
- universal continuous world tick
- global reputation meter
- universal relationship score
- fixed mandatory psychology vector
- summary-as-authority memory
- narrator auto-commit
- model-generated authoritative mechanics without validated resolution
- text-only quest feasibility
- Director authority over legal player action
- direct mutation of source canon by branch events
- dense always-loaded mega-ruleset
- rerunning historical models for replay
- one omniscient prompt shared across all roles

## Implementation truth

This freeze is **architecture saturation only**.

It does not claim:
- RPG 4.0 is implemented
- the runtime has passed the mandatory evals
- real-device mobile budgets have passed
- Real Works 4.0 integration is complete
- release readiness

Existing world/canon/RPG workspace code remains a foundation that is materially simpler than the saturated target.

Implementation should follow the staged plan in `RPG_4_0_RECONCILED_CANDIDATE.md` only after the surrounding Priority 16–21 campaign allows implementation/reconciliation.

## Freeze decision

`RPG_HYPER_POLISH_SATURATED_CANDIDATE`

No material architecture improvement survived either of the two consecutive independent post-reconciliation challenger rounds.

Further changes require new evidence, a newly discovered critical failure, implementation evidence that invalidates an assumption, or a clearly superior Pareto design. Cosmetic novelty alone does not reopen the freeze.