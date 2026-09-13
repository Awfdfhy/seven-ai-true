# Seven RPG Hyper-Polish — Round 04: Narrative, Gameplay & Quests

Status: **CHALLENGER ROUND 04 / MATERIAL IMPROVEMENT FOUND**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Input: RPG 3.5 + accepted Round 01–03 repairs.

## Thesis

Seven already protects player agency and uses an optional Director, but a stronger architecture is needed for three edge cases:

1. narrative consistency mechanisms may accidentally reject valid player actions;
2. generated quests can be plausible in prose but mechanically unsolvable;
3. gameplay modules can drift away from narration unless their boundaries are explicit.

Round 04 therefore introduces an **agency-first narrative priority model**, dynamic solvability proof, mechanic/narrative handshakes, and bounded challenge adaptation.

## Research pressure

- NCP-Bench demonstrates that long-horizon consistency methods can trade off against player-input preservation. Narrative commitments must therefore never silently outrank a valid player action. https://github.com/NLP2CT/NCP-Bench
- CONAN shows that coherent procedural quests benefit from world facts, character motivations and planning rather than text-only generation. https://www.sciencedirect.com/science/article/pii/S1875952121000197
- Procedural branching-quest research combines planning with narrative structure, reinforcing explicit prerequisite/effect graphs rather than prose-only quest state. https://www.sciencedirect.com/science/article/pii/S1875952122000155
- SPHINX 2 (2026) highlights the value of exploration and logical/creative thinking in generated narrative puzzles, motivating a clue/solution contract rather than arbitrary puzzle prose. https://www.sciencedirect.com/science/article/pii/S1875952126000844
- Recent adaptive AI GM evaluation reports value from adjusting guidance/explanation depth to player expertise, but veteran-player limitations argue for conservative, user-controlled adaptation rather than universal personalization. https://www.sciencedirect.com/science/article/pii/S187595212600042X
- RPG generation work in 2026 supports dependency-aware staged generation to maintain coherence between world, NPCs, quests and mechanics. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7124684

## Critical weaknesses found

### R4-W1 — Narrative commitment has no explicit priority taxonomy

Not all commitments are equal. A physical law is different from a character promise, a quest objective, or an authored pacing preference.

### Repair: Commitment Classes

Add `CommitmentClass`:

- `WORLD_INVARIANT` — authoritative rule/physics/state constraint
- `PLAYER_COMMITMENT` — action/choice explicitly created by player
- `CHARACTER_COMMITMENT` — promise/oath/goal owned by an NPC
- `QUEST_CONTRACT` — explicit task state
- `CAUSAL_OBLIGATION` — unresolved consequence that must remain reachable/accounted for
- `AUTHORED_BEAT` — preferred story opportunity, normally bendable
- `DIRECTOR_PREFERENCE` — weakest, never blocks legal play
- `CANON_CONSTRAINT` — supplied by Real Works; branch semantics apply on incompatible player action

Priority law:

> A legal player action is never invalidated merely to preserve AUTHORED_BEAT or DIRECTOR_PREFERENCE. If it breaks a canon/quest/story trajectory, repair, consequence or branch semantics handle the divergence.

---

### R4-W2 — Player action interpretation can steal agency before validation

Free-form text may support several plausible actions. Picking the most dramatic interpretation can create an irreversible act the user did not state.

### Repair: PlayerActionInterpretation

Pipeline:

`User Text`
→ candidate `ActionInterpretationSet`
→ distinguish explicit vs inferred fields
→ validate world affordances
→ commit only explicit or safely entailed irreversible components
→ unresolved material ambiguity remains uncommitted

A narrator may describe immediate non-committing setup while preserving the user's next choice.

---

### R4-W3 — Director can still over-intervene

Opportunity queues are bounded, but the Director needs a hard intervention budget.

### Repair: Director Intervention Contract

Each scene/window has:
- maximum interventions
- cooldown after major consequence
- no intervention during unresolved player action
- no repeated opportunity class beyond configured threshold
- explicit quiet/recovery eligibility
- user-selectable OFF/PASSIVE/BALANCED/AUTHORIAL_PACK

After a major irreversible consequence, default behavior is to **yield an Agency Window** to the player instead of stacking another event.

---

### R4-W4 — Quests need dynamic solvability, not one-time affordance proof

A quest may be solvable when created and become impossible after world changes.

### Repair: Solvability Witness + Revalidation

`QuestSolvabilityWitness` is controller-only and proves at least one currently valid path category without revealing it to the player.

It references:
- prerequisite facts/resources
- required capability classes
- reachable locations/entities
- success transition
- failure/expiry transition
- dependency versions

Revalidate when dependencies change materially.

If no path remains:
- mark `BLOCKED`, `FAILED`, `SUPERSEDED`, or generate a justified recovery opportunity;
- never pretend the original task remains achievable.

---

### R4-W5 — Puzzle generation needs clue sufficiency

### Repair: PuzzleContract

Optional puzzle module defines:
- hidden solution/state
- clue graph
- required vs redundant clues
- legal interactions
- progressive revelation
- failure/reset semantics
- alternative solution classes if allowed
- `ClueSufficiencyProof`

The narrator cannot invent a solution after the fact solely to accept an arbitrary answer unless the puzzle explicitly allows open solutions.

---

### R4-W6 — Gameplay modules lack a common contract

### Repair: GameplayModuleContract

Every module declares:
- owned state schema
- readable dependencies
- legal action classes
- emitted event classes
- RNG requirements
- validation hooks
- cancellation/rollback semantics
- save/replay requirements
- Lite degradation behavior
- UI/presentation hints
- verification/eval suite

Modules never mutate unrelated state directly.

---

### R4-W7 — Narration can disagree with mechanics

A combat module might resolve a miss while prose says the strike landed.

### Repair: MechanicNarrativeHandshake

The narrator receives a `ResolutionCapsule` containing only committed outcomes and presentation freedoms.

Narration may elaborate sensory/style detail but cannot contradict:
- success/failure
- resource changes
- injuries/status
- locations
- ownership
- turn/order constraints
- known/unknown information

---

### R4-W8 — Difficulty adaptation risks covert manipulation

### Repair: Challenge Envelope

Optional `ChallengeEnvelope` is user/world controlled and separate from Director preference inference.

Possible settings:
- authored/static
- assistive
- adaptive-bounded

Adaptive signals may use:
- repeated mechanical failure
- demonstrated mastery
- requested difficulty
- explicit accessibility preference

Forbidden:
- secretly making outcomes worse to prolong play
- dynamic difficulty for retention/engagement maximization
- changing already-committed RNG outcome

All adaptation changes future opportunity parameters only within world/module rules.

---

### R4-W9 — Generated opportunities need provenance and ownership

### Repair: OpportunityOrigin

Every generated quest/opportunity records:
- generating cause
- requesting/benefiting actor or organization
- world need/goal
- generation policy version
- dependency refs
- whether authored, generated, Real Works-derived or branch-derived

This prevents generic quest spam detached from character/world motives.

---

### R4-W10 — Autonomous NPC chains can eclipse the player

### Repair: Agency Windows

A scene scheduler defines explicit windows where autonomous events may resolve, then yields after:
- meaningful state change
- direct question/request to player
- major reveal
- combat/decision threshold
- irreversible consequence

NPCs may continue among themselves only when the player is not being silently denied a reasonable chance to intervene.

---

## Narrative/gameplay architecture after Round 04

`Player Text`
→ `ActionInterpretationSet`
→ `Affordance/Rule Validation`
→ explicit `PlayerAction`
→ gameplay/world resolution
→ committed `ResolutionCapsule`
→ narrative rendering
→ consequence/social updates
→ Director opportunity refresh
→ `AgencyWindow`

Quest path:

`World/Character Need`
→ `OpportunityOrigin`
→ generated/authored QuestContract
→ `AffordanceProof`
→ `QuestSolvabilityWitness`
→ offer/discovery
→ revalidation on dependency change
→ explicit resolution/failure/supersession

## New canonical objects

- `CommitmentClass`
- `PlayerActionInterpretation`
- `QuestSolvabilityWitness`
- `PuzzleContract`
- `GameplayModuleContract`
- `ResolutionCapsule`
- `OpportunityOrigin`
- `AgencyWindow`
- `ChallengeEnvelope`

Derived/policy:
- `ActionInterpretationSet`
- `ClueSufficiencyProof`
- Director intervention budget/cooldown state

## Rejected alternatives

- preserving authored trajectory by rejecting valid player actions
- prose-only quest feasibility
- Director intervention every turn
- hidden dynamic difficulty optimized for engagement
- gameplay module direct writes into global state
- narrator deciding mechanical outcome after seeing desired prose
- irreversible action inferred from ambiguous user language

## New gauntlets

1. Valid unexpected player action breaks planned beat but remains accepted.
2. Ambiguous action does not commit an unstated irreversible choice.
3. Director yields after major reveal instead of stacking drama.
4. Quest becomes unsolvable after bridge destruction and is reclassified honestly.
5. Puzzle has sufficient discoverable clues before being offered as mandatory.
6. Combat miss cannot be narrated as a hit.
7. Lite mode disables deep mechanics without corrupting core world state.
8. Challenge adaptation respects explicit difficulty request and never rewrites committed outcomes.
9. Generated quest has a causally meaningful requester/origin.
10. NPC conversation yields before eclipsing a pending player intervention.
11. Real Works canon divergence creates branch rather than refusing a legal action for pacing.
12. Director OFF remains a coherent, playable experience.

## Reconciliation verdict

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter: **0 / 2**.

Round 04 materially improves agency preservation, quest truthfulness, modular mechanics and narration/mechanics consistency.