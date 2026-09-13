# Seven RPG Hyper-Polish — Round 03: Social + Living World

Status: **CHALLENGER ROUND 03 / MATERIAL IMPROVEMENT FOUND**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Input: RPG 3.5 + accepted Round 01/02 repairs.

## Thesis

The existing Social World and Living World designs are rich, but two failure modes remain:

1. a living world can become computational theater: many simulated events that never matter;
2. coarse off-screen simulation can later fabricate precise personal history that never actually existed.

Round 03 therefore attacks **population scale, social propagation, institutional state, privacy, temporal resolution and reconstruction honesty**.

## Research pressure

- RoleSimLLM (2026) uses role-driven simulation plus graph-based interaction to balance fine-grained agent behavior with scale. This supports grouped/cohort simulation for non-material populations rather than one LLM mind per actor. https://www.sciencedirect.com/science/article/pii/S0306457326000804
- Recent living-world projects similarly use tiered simulation, with expensive cognition restricted to nearby/material NPCs and cheaper aggregate or rule-based updates for distant populations. The architectural lesson is useful even though Seven must retain its own truth/authority model.
- Procedural RPG research repeatedly shows that coherent content requires dependency-aware structured stages rather than free-form generation detached from world state. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7124684
- Player-centered RPG literature continues to emphasize perceived agency, consequences and challenge rather than raw simulation volume. https://www.mdpi.com/2673-6470/6/2/33

## Critical weaknesses found

### R3-W1 — BACKGROUND actors still lack a scalable canonical representation

A thousand conceptual NPCs cannot each have full CharacterState, Memory, goals and LLM cognition.

### Repair: Population/Cohort Layer

Add optional `PopulationCohort`:
- cohort id
- region/community/role
- approximate size
- shared structural constraints
- aggregate resources/status
- salient public events
- organization ties
- known material members
- uncertainty bounds

Cohorts are not fake individuals. They represent populations only at the level actually simulated.

Individualization occurs through `MaterializationEvent`, which creates a concrete actor from valid prior constraints without inventing a detailed personal past that was never simulated.

---

### R3-W2 — Off-screen promotion can fabricate history

If an anonymous guard becomes important later, Seven must not retrospectively invent that the guard secretly witnessed ten earlier scenes.

### Repair: Honest Materialization

`MaterializationEvent` may inherit only:
- cohort membership/context
- recorded aggregate events that affected the cohort
- explicit prior individual mentions/events
- world-definition facts

Unknown personal details remain unknown/generated-now rather than backfilled as historical truth.

---

### R3-W3 — Time needs variable resolution

ACTIVE/RELEVANT/BACKGROUND is useful, but the scheduler still needs temporal granularity.

### Repair: Adaptive Temporal Resolution

- `SCENE`: immediate event-driven resolution
- `LOCAL`: minutes/hours, routines and nearby commitments
- `REGIONAL`: hours/days, organizations/travel/economy abstractions
- `WORLD`: days/seasons/event-triggered aggregates

There is no universal continuous tick. Events and deadlines wake only affected scopes.

---

### R3-W4 — Social propagation needs packet identity

Rumor chains exist conceptually but not strongly enough to distinguish the claim from each transmission.

### Repair: InformationPacket + TransmissionEvent

`InformationPacket`:
- claim/proposition ref
- origin event/source
- representation at current holder
- truth status is not embedded unless holder legitimately knows it

`TransmissionEvent`:
- sender
- receiver/audience
- packet ref
- channel
- what was actually communicated
- omissions/transformations if any
- timestamp/location/branch

A later rumor is lineage-linked to the original packet chain. Repetition does not increase world authority.

---

### R3-W5 — Reputation needs separate public/institutional memory

A faction or town may have official records that are not equivalent to every member's private belief.

### Repair: Social Knowledge Realms

Separate:
- `PrivateBeliefView`
- `GroupBeliefView`
- `PublicRecordView`
- `InstitutionalRecordView`

A court record, guild notice or official bounty can have institutional reach even when individuals have not personally heard it.

Group views remain derived from valid records/transmissions and do not imply universal member knowledge.

---

### R3-W6 — Factions need internal structure without becoming mini-governments everywhere

### Repair: Organization Resolution Tiers

Organizations may operate as:
- `SIMPLE`: goals/resources/relationships
- `STRUCTURED`: roles/subgroups/internal tensions
- `MATERIAL`: named leaders/agents, explicit decisions and events

Only organizations important to current play pay the higher state cost.

---

### R3-W7 — Relationship updates need visibility and attribution

A socially relevant action may affect only witnesses, victims or people later told about it.

### Repair: Social Impact Projection

A WorldEvent may emit `SocialImpactCandidate`s.

Each affected actor/group receives a projection only if there is a valid path:
- direct participation
- witness
- communication
- public/institutional record
- explicit inference from available evidence

No global reputation mutation from invisible acts.

---

### R3-W8 — Absence and neglect need commitments, not arbitrary decay

Relationships should not randomly worsen merely because turns passed.

### Repair: Deadline/Expectation semantics

Absence matters only when backed by:
- promise/deadline
- routine expectation
- explicit social norm
- active dependency
- important scheduled event

There is no universal relationship-decay timer.

---

### R3-W9 — Off-screen simulation needs uncertainty-preserving results

A coarse simulation may know that a caravan was delayed without knowing every conversation that happened.

### Repair: AggregateEvent

`AggregateEvent` records:
- affected scope
- state delta
- cause class
- time interval
- known/unknown detail boundary
- derived individual consequences only when justified

Narration may later describe only established detail or clearly generate non-authoritative flavor consistent with the aggregate.

---

### R3-W10 — Materiality demotion needs anti-loss rules

A previously important NPC may leave the active story but still has critical unresolved state.

### Repair: Demotion Capsule

Before ACTIVE/RELEVANT → BACKGROUND, create a compact reconstructable capsule containing refs to:
- unresolved commitments
- secrets/knowledge that matter
- relationship formative events
- scheduled obligations
- important inventory/role state
- arc/tension refs

The event ledger remains authority; the capsule is retrieval acceleration.

---

## Social/Living architecture after Round 03

### Population hierarchy

`World Population`
→ `PopulationCohorts`
→ `Organizations`
→ `Material Characters`

An entity moves toward detail only when causally/player/narratively material.

### Information propagation

`Origin Event/Claim`
→ `InformationPacket`
→ `TransmissionEvent(s)`
→ receiver-local belief/appraisal
→ optional public/institutional record
→ audience-scoped social impact

### Time scheduler

Event-driven wakeups plus variable temporal resolution. No full-world per-turn loop.

## New canonical objects

- `PopulationCohort`
- `MaterializationEvent`
- `InformationPacket`
- `TransmissionEvent`
- `AggregateEvent`
- `SocialImpactCandidate`

Derived/reconstructable:
- `GroupBeliefView`
- `PublicRecordView`
- `InstitutionalRecordView`
- `DemotionCapsule`

Policies:
- `TemporalResolutionPolicy`
- `OrganizationResolutionTier`

## Rejected alternatives

- one LLM agent per conceptual NPC
- universal rumor-distortion probability
- global reputation meter
- automatic relationship decay with time
- retrospective invention of precise off-screen personal history
- continuous whole-world tick
- dense all-to-all relationship matrix

## New gauntlets

1. 1,000 conceptual actors with fewer than 20 material individuals.
2. Background cohort changes without individual hallucinated histories.
3. Anonymous NPC becomes material and inherits only justified past.
4. Secret act remains unknown to unwitnessed faction.
5. Official record spreads institutionally without implying every member has read it.
6. Rumor mutates through explicit transmissions while source lineage remains intact.
7. Reputation differs across two communities with different information reach.
8. Relationship does not decay merely because 100 turns pass.
9. Missed promise does affect relationship when deadline fires.
10. Long time skip uses regional/world resolution without thousands of micro-events.
11. Demoted character returns with unresolved commitments intact.
12. Aggregate off-screen event remains honest about unknown details.

## Reconciliation verdict

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter: **0 / 2**.

Round 03 materially improves scalability, epistemic honesty, social causality and mobile feasibility. The next candidate must incorporate these repairs before further saturation attempts.