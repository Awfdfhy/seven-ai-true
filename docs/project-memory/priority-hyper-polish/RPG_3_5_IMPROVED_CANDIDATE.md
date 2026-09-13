# Seven RPG 3.5 — Improved Candidate

Status: **PRE-IMPLEMENTATION IMPROVED CANDIDATE / NOT FROZEN**
Supersedes for Hyper-Polish comparison: `Seven RPG Engine 3.0 — Event-Sourced Causal World Simulation Kernel`

## Prime law

> Seven RPG is a character-centered causal simulation engine. Models may interpret, narrate, propose and improvise; authoritative world state, character perspective, consequences and player agency remain governed by typed state and validated events.

The purpose of this revision is not to add every known RPG mechanic. It is to maximize entertainment value through persistent people, meaningful decisions, social consequence, world reactivity and long-term continuity while preserving Seven's mobile-first architecture.

---

# 1. Architecture overview

Seven RPG 3.5 is divided into seven internal fabrics:

1. **World Kernel** — authoritative event/state/causality/rules.
2. **Character Simulation Fabric** — identity, psychology, memory, beliefs, goals, needs, expression and action proposals.
3. **Social World Fabric** — relationships, factions, reputation, secrets, rumors, obligations and social structures.
4. **Living World Scheduler** — routines, off-screen changes, delayed events and simulation fidelity tiers.
5. **Narrative Experience Fabric** — Scene Manager + optional Experience Director + opportunity selection.
6. **Gameplay Module Fabric** — optional world-specific mechanics such as combat, exploration, progression, economy, crafting, stealth, survival or puzzles.
7. **History / Legacy Fabric** — durable milestones, transformations, historical figures, retired/dead characters, titles and optional cross-campaign legacy.

Real Works (#20) attaches canon constraints to these fabrics; it does not replace them.

---

# 2. World Kernel

Authoritative objects:

- `WorldDefinition`
- `WorldSession`
- `WorldEvent`
- `WorldSnapshot`
- `WorldEntity`
- `RuleSet`
- `InvariantSet`
- `CausalLink`
- `ScheduledWorldEvent`
- `BranchRef`
- `RngState`
- `WorldAudit`

State evolves only through validated committed events. Narrative text is never authoritative by itself.

Key properties:

- event-sourced authority
- explicit causality
- delayed consequences
- replayable deterministic mechanics where applicable
- branch isolation
- cancellation before commit
- compact checkpoints
- reconstruction after crash/reload

---

# 3. Character Simulation Fabric

## 3.1 Character Identity Core

Slow/stable layer:

- `characterId`
- roles/origin
- long-lived values
- personality dimensions
- cultural identity relevant to world
- principles/taboos
- important historical identity markers
- baseline capabilities

Identity is not a giant free-form prompt. Rich prose may exist as a derived narrative view.

## 3.2 Adaptive Psychological State

Faster changing layer:

- active goals
- motives
- needs
- current beliefs
- emotional/appraisal state
- stress/meaning accumulation if world uses it
- active fears/hopes
- unresolved commitments
- current priorities

Stable identity and adaptive psychological change are explicitly separated to avoid both robotic rigidity and persona drift.

## 3.3 Perspective Memory

Each material character has a perspective-local memory view:

- witnessed episodes
- communicated claims
- known facts
- rumors with source lineage
- personal inferences
- emotionally salient memories
- relationship events
- unresolved events
- learned knowledge

Character context never receives global truth by default.

## 3.4 Belief model

A character may:

- know a supported fact
- believe a supported fact
- believe an unsupported/false claim
- suspect a proposition
- reject a claim
- be uncertain
- be unaware

Belief does not become world truth.

## 3.5 Memory salience lifecycle

Possible memory states:

- `OBSERVATION`
- `EPISODIC`
- `SALIENT`
- `CORE`
- `UNRESOLVED`
- `DORMANT`

Promotion is rule/evidence based. Strong experiences may change later behavior, values or relationships without rewriting the original event.

## 3.6 Needs, values and motivation

Needs are sparse and world-defined. Motivation is derived from:

`Identity + Values + Needs + Goals + Beliefs + Relationships + Situation`

No universal fixed list is required.

## 3.7 Character action cycle

`Perception -> Perspective Update -> Memory Retrieval -> Appraisal -> Goal/Motive Evaluation -> Candidate Actions -> Utility/Rule Filter -> optional deep cognition -> WorldDiff Proposal -> Validation -> Commit -> Reflection/Memory Update`

Deep model reasoning is selective rather than continuous.

## 3.8 Character expression

`CharacterExpressionProfile` includes situation-sensitive:

- register
- vocabulary tendencies
- directness
- humor
- speech rhythm abstractions
- mannerisms
- conversational boundaries
- emotional expression tendencies

Generated wording remains flexible. The profile constrains behavior rather than forcing repetitive catchphrases.

## 3.9 Character development / arcs

`CharacterArcState` may track:

- unresolved tensions
- desires/fears
- commitments
- milestones
- turning points
- learned lessons
- changed beliefs
- transformations
- setbacks
- unresolved endings

An arc is descriptive/stateful, not a mandatory growth rail.

---

# 4. Social World Fabric

## 4.1 Event-derived relationships

Relationships are asymmetric and event-grounded.

Sparse dimensions may include:

- trust
- respect
- affection
- familiarity
- loyalty
- resentment
- fear
- rivalry
- debt
- ideological alignment

Only dimensions relevant to the relationship/world are materialized.

## 4.2 Relationship milestones

Milestones may unlock:

- conversations
- confessions
- quests/opportunities
- cooperation
- refusal/betrayal
- support actions
- world-rule-defined abilities or permissions

No milestone occurs merely because a hidden number crossed a threshold without supporting history.

## 4.3 Secrets and obligations

Canonical social objects:

- `Secret`
- `Promise`
- `Debt`
- `Oath`
- `Leverage`
- `WitnessedDeed`
- `SocialCommitment`

These become first-class future affordances.

## 4.4 Rumor / information network

Information transmission is explicit:

`Claim -> Speaker -> Transmission Event -> Receiver -> Receiver Belief/Knowledge Update`

This powers gossip, mysteries, misinformation, discovery and reputation spread.

## 4.5 Reputation

Reputation is distributed belief, not a global meter.

Views:

- individual opinion
- faction/community opinion
- known public deeds
- disputed rumors
- hidden deeds
- behavior dispositions inferred from repeated actions

## 4.6 Factions / organizations

`OrganizationState`:

- identity
- values/interests
- roles/memberships
- resources/influence abstraction
- current goals
- relationships
- internal divisions if important
- agenda/events

Groups run at a coarser simulation level than material characters unless the current mode requires detail.

---

# 5. Living World Scheduler

## 5.1 Simulation fidelity tiers

### ACTIVE
Current-scene material characters/entities. Highest detail.

### RELEVANT
Off-screen but causally/narratively important. Deterministic/coarse simulation and scheduled events.

### BACKGROUND
Aggregated populations/events. No constant individual cognition.

Promotion/demotion criteria include proximity, active commitments, upcoming scheduled event, player interest, narrative importance and Real Works anchor relevance.

## 5.2 Character routines

Conditional routines may reference:

- time/calendar
- role/job
- location
- social obligations
- active goals
- needs
- emergencies
- relationships
- world state

Routines are interruptible.

## 5.3 Off-screen life

The scheduler may evolve material but inactive actors through bounded state changes such as:

- move/travel
- routine duties
- role changes
- relationship-relevant encounters
- goal progress
- faction events
- scheduled commitments

No costly free-running LLM is used for every actor.

---

# 6. Narrative Experience Fabric

## 6.1 Scene Manager

Typed operations:

- `INIT_SCENE`
- `ADD_ACTOR`
- `REMOVE_ACTOR`
- `PICK_SPEAKER`
- `SHIFT_FOCUS`
- `SWITCH_LOCATION`
- `ADVANCE_TIME`
- `END_SCENE`

It orchestrates the scene, never changes truth by narration.

## 6.2 Scene Contract 2.0

Compiled before narrative generation:

- branch/time/location
- exact player action
- active actors
- actor perspective capsules
- goals/motivations
- active relationships
- hard rules
- available resources
- unresolved consequences
- social commitments
- quest/opportunity state
- possible/blocked transitions
- relevant Real Works constraints
- narrative viewpoint policy
- director hints if enabled

## 6.3 Experience Director

Purpose: increase opportunity quality, variety and pacing without railroading.

Signals may include:

- unresolved consequences
- character arcs
- neglected commitments
- pacing history
- repeated scene patterns
- world changes
- player preference profile
- underused relevant characters/locations
- tension/recovery needs

Actions are **proposals**:

- surface an opportunity
- schedule a possible encounter
- recommend spotlight shift
- propose complication
- propose quiet/recovery beat
- select among valid authored/generated opportunities

Forbidden:

- fabricating player choices
- deleting legal player actions to force plot
- rewriting state
- guaranteed manipulation toward one ending unless explicit authored mode says so

Director modes: `OFF`, `PASSIVE`, `BALANCED`, `AUTHORIAL_PACK`.

## 6.4 Player preference model

May infer preferences from behavior with low authority:

- exploration vs social vs tactical interest
- preferred pacing
- desired challenge density
- interest in specific characters/locations/themes

It is used to rank optional content, not to constrain player freedom.

---

# 7. Consequence & Commitment Graph

A meaningful choice can create:

- immediate world effect
- delayed effect
- scheduled consequence
- knowledge spread
- relationship event
- faction reaction
- secret/obligation
- quest state transition
- character arc event
- resource/capability change
- irreversible marker

Consequences remain linked to origin events and branch.

This graph is the primary anti-forgetting structure for "choices matter".

---

# 8. Quest / Opportunity Fabric

`OpportunityGraph` supports:

- prerequisites
- blockers
- goals
- optional subgoals
- hidden controller-only goals
- ownership
- expiry
- supersession
- failure states
- consequences
- branch binding
- generated follow-ups

Generated quests/opportunities must satisfy:

1. world feasibility
2. character motivation plausibility
3. no contradiction with commitments/canon
4. novelty/value threshold
5. bounded complexity

---

# 9. Gameplay Module Fabric

The RPG core defines interfaces, not one universal ruleset.

Optional modules:

- combat/tactical resolution
- exploration/discovery
- skill/class/proficiency progression
- equipment/inventory depth
- economy/trade
- crafting/building
- stealth/infiltration
- survival/resource pressure
- investigation/mystery
- puzzle/challenge
- diplomacy/politics
- settlement/domain management

Each world enables only relevant modules. Modules emit/consume typed events and cannot bypass World Kernel authority.

---

# 10. Internal Thought / Voice System

Optional `InternalVoice` actors can represent:

- skills
- values
- fears
- memories
- beliefs
- roles

They may comment, argue or offer options. They are explicitly fallible and cannot authoritatively decide player intent/action.

This is a high-entertainment optional mode, not baseline cost.

---

# 11. Transformations and legacy

## Transformations

Durable event-derived changes may affect:

- status/role
- beliefs
- relationships
- abilities
- appearance descriptors
- faction position
- title/reputation
- long-term strengths/limitations

## Legacy

Optional long-campaign system:

- retirement/death/history records
- successors/descendants where world defines them
- inherited obligations/knowledge only through explicit mechanisms
- legends and titles
- returning legacy characters
- cross-campaign myth seeds

No legacy system is loaded when not used.

---

# 12. Real Works integration

Real Works supplies:

- source-bound character identity/knowledge
- canon timeline/anchors
- continuity rules
- known relationships
- canon personality evidence
- world rules
- source-supported titles/names

RPG remains responsible for simulation state. Real Works constrains it.

A canon character still uses the Character Simulation Fabric, but canonical identity facts are protected by Canon constraints and unsupported psychology changes cannot silently become canon.

---

# 13. Mobile / Velocity strategy

- no full-world LLM simulation
- sparse character dimensions
- deterministic baseline action utility
- local lexical/event lookup baseline
- selective embeddings
- selective deep character cognition only on ambiguity/high-value moments
- hot CharacterCapsules compiled per scene
- inactive NPC batch updates
- compact event records + snapshots
- lazy social/faction graph indexes
- world modules loaded only when enabled
- director off/passive in Lite tier
- UI remains responsive while background reconstruction/indexing yields

---

# 14. Mandatory eval expansion

## Character fidelity

- 50/100/500-turn persona stability
- stable identity vs valid psychological evolution
- character memory anchoring/selecting/bounding/enacting
- false-belief behavior
- secret leakage attempts
- rumor source tracking
- long-gap relationship recall
- values under pressure
- personality expression without catchphrase repetition
- learned lesson without identity rewrite

## Social simulation

- asymmetric relationship states
- companion-companion conflict
- faction disagreement
- reputation differs across groups
- rumor propagates only along valid interactions
- public/private information separation
- obligation callback after long delay

## Living world

- schedule interruption
- off-screen goal progress
- background actor does not consume material continuous compute
- promotion from BACKGROUND→RELEVANT→ACTIVE preserves state
- crash/reload preserves scheduled events

## Narrative

- director OFF remains playable
- director cannot steal player action
- high-agency unexpected player action remains valid
- repetitive scene-pattern detection
- quiet/intense pacing variety
- scene manager multi-character speaker orchestration

## Consequence

- irreversible choice remains remembered
- delayed consequence fires after context folding
- branch-local consequences do not leak
- generated opportunity respects prerequisite graph

## Mobile

- 50+ character world with only small active set
- large history cold-load behavior
- Lite mode without embeddings/director
- cancellation latency
- peak RAM and background CPU gates

---

# 15. Main architectural delta from RPG 3.0

RPG 3.0 established trustworthy causal world simulation.

RPG 3.5 adds the missing **entertainment substrate**:

- psychologically layered characters
- perspective memory and beliefs
- information/rumor flow
- event-derived social relationships
- factions/secrets/reputation
- living off-screen world
- character arcs and transformation
- director/scene orchestration
- consequence graph
- modular gameplay mechanics
- optional internal voices
- legacy

The candidate remains deliberately pre-implementation until it survives the dedicated RPG Hyper-Polish protocol.