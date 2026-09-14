# Seven RPG 4.0 — Reconciled Candidate

Status: **PRE-IMPLEMENTATION / SATURATION TEST TARGET / NOT YET FROZEN**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Supersedes for comparison: `RPG_3_5_IMPROVED_CANDIDATE.md`
Incorporates accepted changes from Hyper-Polish Rounds 01–07.

## Prime law

> Seven RPG is a character-centered causal simulation engine. Models may interpret, improvise, narrate and propose; authoritative world state, player agency, character perspective, mechanics and consequences remain governed by typed state, validated events and explicit transaction boundaries.

Entertainment strength is sustained depth under freedom, not maximum simulation volume.

---

# 1. Minimal canonical backbone

RPG 4.0 deliberately compresses the architecture into 15 canonical primitive families:

1. `WorldDefinition / WorldPack`
2. `WorldSession / BranchRef`
3. typed `WorldEvent` family
4. `WorldEntity` + versioned component/state schemas
5. `CharacterState`
6. `PerspectiveState`
7. `RelationshipState`
8. `CommitmentRecord`
9. `Organization / PopulationState`
10. `ScheduledEvent`
11. `GameplayModuleContract + module-owned state`
12. `Opportunity` controller family
13. `RootActionTransaction`
14. `RngState`
15. `WorldSnapshot`

Everything else is an event subtype, policy, schema, derived view, index or optional module unless independent identity is truly required.

---

# 2. Authoritative world model

Authoritative state evolves only through committed typed `WorldEvent`s.

Shared event envelope:
- event id/type
- branch
- world/schema version
- causal parents/root action
- actor/source
- payload schema
- affected entities/scopes
- provenance/authority
- world time
- transaction ref
- verification/result metadata

Narrative prose is never authoritative by itself.

Snapshots accelerate restoration but are reconstructable from event history + checkpoint.

Replay uses committed events and recorded RNG/resolutions. Historical model cognition is never rerun to reconstruct truth.

---

# 3. Root Action Transaction

One material player/NPC action resolves immediate consequences transactionally.

Pipeline:

1. bind branch/base world version
2. validate explicit action/proposal
3. resolve active gameplay modules
4. stage world/mechanical effects
5. project perception/knowledge effects
6. stage social/relationship effects
7. stage quest/commitment changes
8. refresh character meaning/goals
9. stage scheduler consequences
10. invariant/conflict verification
11. atomic commit of root + immediate derived events
12. persist delayed-event scheduling refs
13. rebuild derived views
14. open next agency window

Cancellation before commit creates no authoritative partial state.

---

# 4. Concurrent intent resolution

Where multiple NPC/world intents share a resolution window, Seven creates a bounded `IntentBatch`.

Each intent validates against the same base state, conflicts are grouped, and world/module policy determines arbitration/order.

Prose ordering never decides resource ownership, movement exclusivity or mechanical outcome.

---

# 5. Character Simulation Fabric 4.0

## 5.1 Sparse three-timescale psychology

`CharacterState` owns three conceptual update layers. Worlds materialize only dimensions they need.

### IdentityLayer
Slow-changing:
- identity/roles/origin
- long-lived values/principles
- stable personality tendencies
- culturally relevant identity
- protected taboos/boundaries
- persistent capabilities/limitations
- canon identity constraints in Real Works

### MeaningLayer
Medium-term:
- accumulated stress/hope/grief/resentment where relevant
- unresolved interpretations
- internal tensions
- learned expectations
- arc momentum
- active long-lived commitments

### MomentLayer
Immediate:
- appraisal
- attention focus
- urgency
- conversational stance
- approach/avoid tendency
- immediate emotional expression pressure

Moment state cannot directly rewrite Identity.

Durable identity/meaning changes require event lineage and a typed revision event.

## 5.2 Perception before cognition

Characters never consume global world truth directly.

`WorldEvent`
→ observable projection
→ `PerceptionEvent` event subtype
→ attention gate
→ character-local interpretation

Perception carries source event, modality/access conditions, observable projection, ambiguity and branch/time.

## 5.3 Interpretation is not truth

A character may form an `InterpretiveHypothesis` from perceptions.

It may be correct, mistaken, incomplete or revised later. World truth remains unchanged.

## 5.4 PerspectiveState

One perspective family tracks actor-local entries such as:
- observed
- communicated
- believed
- suspected
- rejected
- discovered
- unresolved

Every entry preserves event/source lineage and temporal/branch scope.

The architecture distinguishes objective world state, character belief and player discovery.

## 5.5 Active storyline memory

The event ledger remains authority. Character memory is a perspective-local derived/retrieval layer.

`CharacterBookmarkSet` is a rebuildable active-memory view containing task-relevant questions such as:
- what promise is unresolved?
- why does actor A distrust B?
- what does this character think happened at X?
- which old event matters to this scene?

Bookmarks bind source refs, perspective owner, branch and validity version.

No recurrent summary can silently replace source events.

## 5.6 Memory diagnostics

Character memory is evaluated across:
- Anchoring
- Selecting
- Bounding
- Enacting

Memory retrieval quality and persona quality are tested separately.

## 5.7 Internal tension

Characters can hold conflicting values, goals, loyalties, expectations and obligations through explicit `InternalTension` state/view.

Tension can persist without forced resolution and may cause hesitation, compromise, regret or later character revision.

## 5.8 Internal state vs self-model

Controller-only internal state is separate from `CharacterSelfModel`.

Characters do not automatically know controller metadata about themselves. Denial, uncertainty and self-misunderstanding remain possible.

## 5.9 Decision policy

Routine behavior uses cheap `FastPolicy` over rules, schedules, affordances, goals and sparse utility.

Selective `DeliberativePolicy` activates only on triggers such as:
- irreversible stakes
- conflicting important goals/values
- high social ambiguity
- major relationship event
- high narrative materiality
- canon/branch risk

Deliberation may generate structured candidate actions/reasons but cannot commit state.

## 5.10 Attention budget

Characters deeply process only a bounded `AttentionSet`, chosen from threat/urgency, goals, social salience, novelty, explicit focus and unresolved tension.

Critical world rules may override attention filtering.

## 5.11 Character revision

Durable psychological change is a typed WorldEvent subtype containing:
- prior state refs
- trigger event cluster
- affected field/layer
- revision class
- evidence/rationale refs
- durability/reversibility
- Real Works classification when applicable

Valid player-driven change cannot be repaired back toward baseline persona merely to increase similarity.

## 5.12 Character expression

`CharacterExpressionProfile` is a derived/pack-defined constraint view for register, vocabulary tendencies, directness, humor, speech rhythm, mannerisms, boundaries and emotional expression.

It prevents generic voice while avoiding catchphrase lock-in.

---

# 6. Social World Fabric 4.0

## 6.1 Event-derived relationships

`RelationshipState` is asymmetric and grounded in formative events, expectations, obligations, unresolved tensions and salient episodes.

Trust/respect/affection/fear/loyalty/resentment/rivalry and similar dimensions are optional sparse summaries, not one master score and not authority over history.

## 6.2 CommitmentRecord

A single typed lifecycle family handles promises, debts, oaths, duties, quest obligations and other commitments.

`Secret` remains information-access state rather than being forced into commitment semantics.

## 6.3 Information propagation

Rumors/claims move through explicit transmission event subtypes.

Each transmission binds sender, receiver/audience, packet/claim lineage, channel, communicated representation, transformation/omission and time/branch.

Repetition does not increase world authority.

## 6.4 Social knowledge realms

Derived views distinguish:
- private beliefs
- group beliefs
- public records
- institutional records

An official record does not imply every individual member knows it.

## 6.5 Social impact projection

Reputation/relationship impact requires a valid path:
- participant
- witness
- communication
- public/institutional record
- valid inference

Invisible actions do not mutate universal reputation.

## 6.6 Organizations

Organizations scale through resolution tiers:
- SIMPLE
- STRUCTURED
- MATERIAL

Only important organizations pay for subgroups, named decision-makers and high-detail simulation.

---

# 7. Living World Scheduler 4.0

## 7.1 Entity fidelity

- ACTIVE: current-scene material entities
- RELEVANT: off-screen but causally important
- BACKGROUND: aggregate/coarse state

No continuous full-detail cognition for every actor.

## 7.2 Population cohorts

Large populations may exist as `PopulationCohort`s with region/role/context, aggregate resources/status, salient public events, organization links and uncertainty bounds.

Cohorts never pretend to be individually simulated people.

## 7.3 Honest materialization

When a background member becomes a material character, a materialization event may inherit only:
- world/pack facts
- cohort context
- recorded aggregate events
- explicit prior individual mentions

Precise unsimulated personal history is not retroactively invented as fact.

## 7.4 Adaptive time resolution

Scheduler work is event-driven across:
- SCENE
- LOCAL
- REGIONAL
- WORLD

There is no universal continuous tick.

Deadlines/events wake only relevant scopes.

## 7.5 Aggregate off-screen events

Coarse simulation may commit `AggregateEvent` subtypes that record affected scope, state delta, cause class, time interval and explicit unknown-detail boundaries.

## 7.6 Demotion

When a material character becomes background, derived demotion capsules preserve retrieval refs for unresolved commitments, important knowledge, formative relationship events, scheduled obligations and material arc state.

The event ledger remains authority.

---

# 8. Narrative Experience Fabric 4.0

## 8.1 Scene Manager

Owns scene orchestration only:
- initialize/end scene
- cast changes
- speaker/focus changes
- location/time transitions

It cannot change truth by prose.

## 8.2 Role-bound views

Compile distinct views:
- ControllerView
- NarratorView
- CharacterView(actor)
- PlayerPresentationView
- DirectorView

No single omniscient prompt is reused across roles.

## 8.3 Scene Contract

Narrative generation receives branch/time/location, exact player action, active actors, actor perspective capsules, goals, material relationships, hard rules, resources, unresolved consequences, commitments, opportunity state, transition bounds, Real Works constraints and presentation policy.

## 8.4 Opportunity family

One controller family represents possible:
- quests
- encounters
- discoveries
- social callbacks
- character-arc moments
- world events
- puzzles
- authored beats

Opportunities are not authority until accepted/resolved into events/commitments.

## 8.5 Experience Director

Director actions are bounded proposals only.

Modes:
- OFF
- PASSIVE
- BALANCED
- AUTHORIAL_PACK

It uses a bounded opportunity queue and intervention budget, respects cooldowns/quiet windows, cannot invent player choice, cannot rewrite state and cannot block legal action merely to preserve pacing.

## 8.6 Agency windows

After major reveal, irreversible consequence, direct request/decision threshold or meaningful state change, the scheduler yields a reasonable player-intervention window rather than chaining autonomous drama indefinitely.

---

# 9. Player action authority

Free-form user text first becomes an `ActionInterpretationSet`.

The system distinguishes:
- explicit action content
- safely entailed detail
- uncertain inference

Irreversible unstated actions are never committed merely because they make a better story.

A legal unexpected action outranks Director preferences and soft authored beats.

---

# 10. Commitment priority

Commitment classes are semantic policy fields, not separate stores:
- WORLD_INVARIANT
- PLAYER_COMMITMENT
- CHARACTER_COMMITMENT
- QUEST_CONTRACT
- CAUSAL_OBLIGATION
- AUTHORED_BEAT
- DIRECTOR_PREFERENCE
- CANON_CONSTRAINT

Soft authored/director commitments never invalidate legal player actions.

Real Works canon incompatibility uses explicit branch semantics rather than player-action theft.

---

# 11. Quest / Opportunity truth

Generated quests/opportunities require:
- world feasibility
- character/organization motive
- valid origin/dependencies
- player affordance
- bounded complexity
- explicit success/failure/expiry

A controller-only `QuestSolvabilityWitness` proves at least one currently valid path class.

Material dependency changes trigger revalidation.

If no solution remains, state becomes BLOCKED/FAILED/SUPERSEDED or receives a causally justified recovery route. Seven never pretends the task remains possible.

---

# 12. Puzzle / investigation modules

Optional puzzle module declares hidden state/solution, clue graph, legal interactions, progressive revelation, alternative solution classes and clue sufficiency.

Optional investigation module may maintain evidence/hypothesis constraints and information-value views.

Hypotheses remain non-authoritative until resolved by valid evidence/state.

---

# 13. Gameplay Module Fabric 4.0

Every optional module declares:
- owned state schema
- readable dependencies
- legal action classes
- emitted event classes
- RNG requirements
- validation hooks
- cancellation/rollback semantics
- save/replay requirements
- Lite degradation
- presentation hints
- verification/eval suite

Possible modules include combat, exploration, progression, equipment/inventory depth, economy/trade, crafting/building, stealth, survival, investigation, puzzles, diplomacy/politics and settlement/domain management.

Worlds load only relevant modules.

## MechanicNarrativeHandshake

Committed mechanic outcomes produce a `ResolutionCapsule` containing fixed results plus presentation freedoms.

Narration may embellish style/sensory detail but cannot contradict committed success/failure, resources, status, location, ownership, timing or knowledge constraints.

## Challenge Envelope

Optional difficulty behavior is authored/static, assistive or bounded-adaptive.

Adaptation can use explicit request, accessibility preference, repeated failure or demonstrated mastery, but never secretly manipulate outcomes for retention and never rewrite committed RNG/state.

---

# 14. Agency, discovery and player chronicle

## AgencyTrace

Derived causal view links explicit player actions to direct and delayed descendants, social consequences, opened/closed affordances, branches and unresolved effects.

## PlayerChronicle

Derived player-centered history prioritizes:
- explicit player choices
- causal turning points
- discoveries
- relationship milestones
- commitments
- transformations
- irreversible outcomes
- branch-defining moments

It references authoritative events and can be rebuilt.

## DiscoveryRecord

Tracks what the player/avatar has actually discovered, separately from what exists in world truth.

## Causal feedback

Consequences may be immediate, delayed-discoverable, private-to-others or structurally hidden.

The system never leaks secrets just to prove choices mattered, but agency evaluation distinguishes real effect from perceivable effect.

---

# 15. Generated-detail materialization

Narrative invention is classified as:
- PRESENTATION_ONLY
- OBSERVABLE_EPHEMERAL
- PROPOSED_MATERIAL_DETAIL
- COMMITTED_WORLD_DETAIL

Only explicit validated promotion creates durable world state.

---

# 16. Branch and Real Works boundary

Every mutable material event/state is branch-scoped.

No implicit branch merge.

Real Works supplies source-bound canon identity, timeline, knowledge horizons, relationships, world rules and canon constraints.

RPG applies simulation overlays/branch events without rewriting source canon.

Missing canon support remains `CANON_GAP`.

---

# 17. Versioning and saves

Persist:
- WorldSchemaVersion
- WorldPackVersion
- enabled GameplayModule revisions
- Real Works pack/version if attached
- material naming grammar version where needed
- migration history

Migrations transform representation, not historical meaning.

Ambiguous irreversible migration becomes explicit compatibility/fork handling instead of guessed reinterpretation.

---

# 18. History and storage

Authoritative events are immutable but storage/retrieval tiers may classify:
- HOT_MATERIAL
- WARM_MATERIAL
- COLD_ARCHIVE
- DERIVED_DISCARDABLE

Cold archives may be compressed/tiered with integrity hashes/indexes. Authoritative history is never replaced by a summary.

Derived caches may always be discarded/rebuilt.

---

# 19. Governed extension registry

World packs/modules may add namespaced extension schemas with:
- owner
- schema/version
- authority semantics
- persistence class
- validation
- migration rule
- context exposure policy

Unknown extension data is preserved opaquely or rejected according to compatibility policy, never interpreted by guesswork.

---

# 20. Event phase ordering

Immediate transaction phases are ordered:
1. action/mechanical resolution
2. world effects
3. perception/knowledge projections
4. social/relationship consequences
5. quest/commitment transitions
6. character meaning/goal refresh
7. scheduler/director derived refresh
8. presentation

Later phases cannot recursively reopen earlier committed phases in the same root action. New material action requires a new root event/window.

---

# 21. Mobile / Velocity architecture

Hard rules:
- no always-on model sessions for every NPC
- no mandatory vector DB
- no dense all-to-all social matrix
- no continuous whole-world tick
- no full-history prompt
- no eager loading of unused gameplay modules

Strategies:
- ACTIVE/RELEVANT/BACKGROUND simulation
- cohort aggregation
- event-driven scheduler
- sparse psychology
- active storyline bookmarks
- lexical/local deterministic retrieval baseline
- selective embeddings/rerank only where useful
- FastPolicy before DeliberativePolicy
- batched background updates
- compact snapshots
- derived cache eviction
- cold archive
- Director disabled/passive in Lite where needed
- cooperative/background work yields to UI

---

# 22. Evaluation portfolio

No universal RPG score.

## Character
- anonymous persona tests so model recognition cannot mask role-playing weakness
- 50/100/200/500-turn identity fidelity
- temporal/arc-aware fidelity
- justified evolution vs drift
- memory Anchoring/Selecting/Bounding/Enacting
- false belief / reinterpretation
- secret/knowledge leakage
- bilingual/Arabic character tests
- voice variety without catchphrase collapse
- Fast vs Deliberative policy routing

## Social
- asymmetric relationships
- mixed stance
- companion↔companion state
- rumor lineage
- public/private/institutional scope
- obligations after long delay
- reputation divergence
- materialization honesty

## Agency
- legal-action acceptance
- irreversible-action invention
- player-input conflict rate
- downstream causal depth
- consequence persistence
- perceivable-choice influence
- branch diversity
- Director override incidents
- human perceived-control tests when available

## World
- 10/50/200/1000+ conceptual actors with bounded material set
- long time skip
- cohort→individual materialization
- scheduler correctness
- crash/reload
- branch isolation
- migration/replay
- 100k-event archive behavior

## Narrative
- Narrative Commitment Preservation style adversarial trajectories
- Director OFF playability
- quiet vs intense pacing variety
- multi-character scene coherence
- narrator/mechanics agreement
- unresolved-thread persistence

## Gameplay
- module isolation
- solvability revalidation
- puzzle clue sufficiency
- ChallengeEnvelope fairness
- deterministic RNG replay
- Lite degradation

## Real Works
- canon identity/horizon
- CANON_GAP preservation
- legal divergence → branch
- branch overlay never mutates source canon

## Performance
- cold load
- scene compile
- first visible response
- turn resolution latency
- cancellation
- RAM/CPU/battery/thermal
- background work interference

---

# 23. Implementation staging

- RPG4-P0 schemas, event envelope, branch/version contracts
- RPG4-P1 transaction engine + replay/snapshots/migration foundation
- RPG4-P2 CharacterState/PerspectiveState/perception/attention
- RPG4-P3 memory bookmarks + Fast/Deliberative policy + revisions
- RPG4-P4 relationships/commitments/information propagation
- RPG4-P5 cohorts/organizations/scheduler/materialization
- RPG4-P6 scene/view compiler + Director/opportunity/agency windows
- RPG4-P7 quest solvability + discovery/chronicle/agency trace
- RPG4-P8 GameplayModuleContract + initial selected modules
- RPG4-P9 Real Works/Title/Context/Memory bridges
- RPG4-P10 long-horizon + mobile + recovery eval suite

No implementation stage changes `seven_ai-final.html` during the architecture-only Hyper-Polish campaign.

---

# 24. Reconciliation status

Rounds 01–07 found material improvements and reset saturation each time.

RPG 4.0 is the first candidate that contains the reconciled result of all accepted improvements **after the Complexity Destroyer pass**.

Saturation counter entering the next challenger: **0 / 2**.