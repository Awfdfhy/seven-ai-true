# Seven AI — Capability 19 RPG Engine Ultimate Polish

Status: **FREEZE CANDIDATE — architecture only**
Target: **Seven RPG Engine 3.0 — Event-Sourced Causal World Simulation Kernel**

## 1. Prime law

> The model narrates and proposes. The World Kernel owns state, rules, causality, player agency and commit.

A beautiful paragraph cannot change authoritative world state unless a valid WorldDiff passes deterministic/verified checks.

## 2. Ground truth

Seven already has strong foundations:

- `release/world-runtime.js` provides source-bound scene contracts, ordered beats, branch-on-divergence and a player-agency lock.
- `release/canon-simulator.js` tracks world, knowledge, relationships, locations, objects, invariants, anchors and branch state.
- `release/workspaces/rpg.js` makes verified commits explicit and states that model prose does not auto-commit canon.

These are valuable foundations. The final architecture generalizes them beyond Real Works and removes scalar/heuristic authority from core state semantics.

## 3. Research implications

NCP-Bench (2026) formalizes Narrative Commitment Preservation and reports a major long-horizon consistency gap: fluent LLM narration frequently violates earlier facts/commitments under unconstrained interaction. This supports Seven's separation of narrative generation from authoritative simulation state.

## 4. Pass A — maximum world simulation

### Canonical objects

- `WorldDefinition`
- `WorldSession`
- `WorldEvent`
- `WorldSnapshot`
- `WorldEntity`
- `RuleSet`
- `InvariantSet`
- `CharacterState`
- `KnowledgeState`
- `RelationshipState`
- `ResourceState`
- `LocationState`
- `QuestCommitment`
- `NarrativeCommitment`
- `SceneContract`
- `PlayerAction`
- `WorldDiffProposal`
- `WorldCommitResult`
- `BranchRef`
- `RngState`
- `WorldAudit`

### Event-sourced authority

Authoritative state evolves through committed `WorldEvent`s. Snapshots accelerate loading but remain reconstructable from a checkpoint + event suffix.

Every event binds:

- session/world version
- cause/parent events
- actor/source
- validated action/diff
- affected entities/resources
- rule/invariant checks
- RNG draws if applicable
- branch
- timestamp/turn/scene
- verification record

Narrative prose is not an event by itself.

### Player agency lock

Seven never invents as authoritative state:

- the player's irreversible action
- the player's intention
- the player's emotion
- a player choice not supplied by the user

The narrator may describe environment and NPC reactions, but a player action must originate from an explicit user action or a previously authorized player automation mode.

### Character autonomy without player theft

NPCs may act from:

- goals
- beliefs/knowledge
- personality constraints
- relationships
- world rules
- available actions/resources

Their action proposal is validated by the World Kernel before commit.

### Knowledge/fog-of-war

`KnowledgeState` is per actor and temporally scoped. A character may know a proposition only through:

- initial world definition
- observed event
- communication event
- inference explicitly allowed by the rules
- source/canon knowledge when in Real Works mode

Global world truth is never copied wholesale into every character context.

### Causality

Events record causal parents/dependencies where material. The engine distinguishes:

- state preconditions
- direct effects
- delayed effects
- scheduled events
- commitments/obligations
- unresolved consequences

This prevents later narration from silently forgetting consequences because they fell out of prompt context.

### Rules and invariants

Rules can cover:

- movement/location
- inventories/resources
- powers/abilities
- cooldowns/costs
- status conditions
- social/legal/world constraints
- time/calendar
- quest gates
- transformation/death/recovery semantics as appropriate to the fictional world

Hard invariants are deterministic when possible. Soft narrative preferences never masquerade as hard physics.

### Typed WorldDiff

Models propose structured changes:

- add/update/remove entity state
- move actor/object
- resource delta
- knowledge update
- relationship event
- commitment create/resolve/fail
- schedule/cancel event
- branch creation

The controller validates preconditions, permissions/player agency, invariants, causality and budget before commit.

### Conflict semantics

When a proposal conflicts with authoritative state:

- reject the invalid field/event;
- request repair/replan; or
- create an explicit branch/alternate state if the mode permits.

Never silently retcon established state.

### Deterministic randomness

Game mechanics requiring randomness use a replayable PRNG state/seed recorded with draws. Model sampling randomness does not determine authoritative dice/combat/loot outcomes unless the world's rules explicitly delegate that mechanic and the delegation is recorded.

### Branch model

Branches have:

- stable id
- parent branch
- divergence event
- inherited checkpoint
- branch-local event suffix
- merge policy, usually `NO_IMPLICIT_MERGE`

What-if branches do not contaminate the canonical campaign state.

### Scene contract

Before generation, Seven compiles a compact scene contract:

- active branch/time/location
- player action exactly as supplied
- active actors and knowledge horizons
- current goals/commitments
- relevant relationships
- hard rules/invariants
- unresolved consequences
- allowed/blocked transitions
- relevant inventory/resources
- Real Works canon obligations if attached

Context Fabric retrieves only relevant state and cold-references the rest.

### Narrative layer

The narrative model may choose presentation, pacing, dialogue and imagery within the contract. It may propose new NPC actions/events, but commits happen after structured extraction/validation.

### Relationship system

Relationships are not one scalar `affection`. Use event-derived dimensions where a world needs them, such as trust, fear, debt, allegiance, familiarity or hostility. Only dimensions useful to that RPG are materialized.

### Goals/quests

Goals are explicit state machines/commitments rather than remembered prose. They can be active, blocked, completed, failed, abandoned or superseded with provenance to events.

## 5. Long-horizon state strategy

Hot context:

- current scene
- active actors
- nearby resources
- active commitments
- unresolved consequences

Warm derived views:

- recent episodes/scenes
- relationship summaries
- quest history

Cold authoritative history:

- event ledger
- snapshots
- artifacts

Compression cannot rewrite authoritative history.

## 6. Velocity assault

- compact active state
- lazy graph/index views
- snapshots at measured intervals
- incremental invariant checks
- only relevant NPCs simulated at high detail
- distant/inactive entities use coarse state until activated
- no always-on model simulation for every NPC
- bounded scheduled-event queue
- no vector DB required for baseline
- cancellation before commit leaves no phantom event

## 7. Pass B — destroy the winner

### LLM-only world memory
Rejected: long-horizon commitment failure is too high.

### Giant JSON world state in every prompt
Rejected: context/latency explosion.

### Relationship as one score
Rejected as too lossy for complex worlds; dimensions remain world-specific and event-grounded.

### Full autonomous simulation of every entity
Rejected for compute cost and narrative noise.

### Model-generated RNG
Rejected for authoritative mechanics because it is not replayable.

### Narration auto-commits state
Rejected. Structured validated diff is mandatory.

### Silent retcon to keep story flowing
Rejected. Conflict/branch/repair is explicit.

## 8. Real Works boundary

RPG Engine owns generic world simulation. Capability #20 owns canon source/continuity obligations. Real Works injects `CanonConstraintSet`/scene obligations into RPG contracts but does not replace the World Kernel.

Original/freeform RPG has no canon claim and can use user-defined rules/world packs.

## 9. Mandatory evals

- 100/500-turn continuity
- early fact recalled after long gap
- player agency attempts
- impossible action blocked
- resource/inventory conservation
- character future knowledge blocked
- causal delayed consequence survives context folding
- deterministic RNG replay
- save/reload exact reconstruction
- branch isolation
- what-if does not mutate main branch
- cancelled generation creates no event
- repair after invalid WorldDiff
- NPC goals without omniscience
- relationship event reconstruction
- Arabic long-form campaign
- Lite tier with compact hot state
- Real Works constraint injection
- conflicting canon/world rule handling

## 10. Implementation stages

- RPG-P0 canonical schemas/events
- RPG-P1 world ledger + snapshots
- RPG-P2 rules/invariants + typed WorldDiff
- RPG-P3 player-agency and knowledge-state kernel
- RPG-P4 causality/commitments/scheduling
- RPG-P5 branch/replay/RNG
- RPG-P6 relationship/quest derived views
- RPG-P7 scene compiler + Context bridge
- RPG-P8 narrator proposal/repair pipeline
- RPG-P9 Real Works constraint bridge
- RPG-P10 long-horizon/mobile evals

## 11. Freeze decision

Freeze candidate turns Seven RPG from prompt-driven roleplay into a lightweight causal simulation system with an LLM narrative surface. It preserves free player action while making continuity, consequences, knowledge and branches explicit and replayable.
