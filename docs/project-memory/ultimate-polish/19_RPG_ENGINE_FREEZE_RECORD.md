# Seven AI — Capability 19 RPG Engine Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation: **Deferred / strong world-runtime foundation remains partial**

## Frozen target

**Seven RPG Engine 3.0 — Event-Sourced Causal World Simulation Kernel**

## Prime law

> The model narrates and proposes. The World Kernel owns state, rules, causality, player agency and commit.

## Frozen decisions

1. Authoritative world state evolves through committed `WorldEvent`s.
2. Snapshots accelerate recovery but do not replace event lineage.
3. Player irreversible actions, intentions and emotions cannot be invented by the model.
4. NPC autonomy is constrained by goals, knowledge, resources and world rules.
5. Character knowledge is actor- and time-scoped; global truth is not copied into every character.
6. Material consequences remain explicit causal dependencies/commitments.
7. Hard rules/invariants are deterministic where practical.
8. Narrative preferences remain distinct from world physics/rules.
9. Models propose typed `WorldDiffProposal`s; the controller validates before commit.
10. Invalid proposals repair, reject or branch; they never silently retcon authoritative state.
11. Authoritative randomness uses replayable RNG state, not model sampling randomness.
12. Branches retain explicit parent/divergence/checkpoint identity and do not implicitly merge.
13. Scene context is compiled from active state plus cold references rather than a giant world dump.
14. Relationship dimensions are world-specific and event-derived, not a mandatory single affection score.
15. Goals/quests are explicit commitments/state machines.
16. Inactive/distant world entities can remain coarse until needed; no always-on model simulation.
17. Real Works constraints plug into the generic RPG kernel but do not replace it.
18. Cancelled/unverified generation cannot create authoritative world events.

## Canonical objects

`WorldDefinition`, `WorldSession`, `WorldEvent`, `WorldSnapshot`, `WorldEntity`, `RuleSet`, `InvariantSet`, `CharacterState`, `KnowledgeState`, `RelationshipState`, `ResourceState`, `LocationState`, `QuestCommitment`, `NarrativeCommitment`, `SceneContract`, `PlayerAction`, `WorldDiffProposal`, `WorldCommitResult`, `BranchRef`, `RngState`, `WorldAudit`.

## Required eval families

Long-horizon continuity, agency, impossible actions, resource conservation, knowledge horizons, delayed consequences, RNG replay, save/reload, branch isolation, cancellation, repair, NPC non-omniscience, Arabic campaigns, Lite hot-state cost and Real Works constraint injection.

## Implementation path

`RPG-P0` schemas → `P1` event ledger/snapshots → `P2` rules/diffs → `P3` agency/knowledge → `P4` causality/commitments → `P5` branch/replay/RNG → `P6` relationship/quest views → `P7` scene compiler → `P8` narrator pipeline → `P9` Real Works bridge → `P10` long-horizon/mobile evals.

No implementation completion is claimed by this freeze.
