# Seven RPG 3.5 — Hyper-Polish Round 01

Status: **CHALLENGER ROUND 01 / PRE-IMPLEMENTATION**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Target under attack: `RPG_3_5_IMPROVED_CANDIDATE.md`

## Round thesis

RPG 3.5 is materially stronger than RPG 3.0, but it still risks becoming a collection of excellent state objects without sufficiently explicit **perception, appraisal, salience, affordance and attention mechanics** connecting them.

The challenger therefore attacks the *transitions between state*, not merely the state fields.

---

# 1. Critical weaknesses found

## W1 — Perception is under-specified

RPG 3.5 starts the character cycle at `Perception`, but does not yet define a canonical PerceptionEvent.

Without this, characters could accidentally learn:

- events outside sensory/social reach
- the hidden intention behind an action
- exact state values they could not observe
- private dialogue merely because it exists in session state

### Repair

Add:

`PerceptionEvent`
- observer
- source world event
- modality/category
- observable projection
- visibility/audibility/access conditions
- ambiguity
- timestamp/scene
- provenance

Characters update perspective only from authorized perception or communication events.

---

## W2 — Observation and interpretation are conflated

Two characters can witness the same event and interpret it differently.

### Repair

Separate:

`PerceptionEvent` → `Appraisal` → `BeliefUpdate`

Appraisal may depend on:

- values
- goals
- relationship history
- prior beliefs
- emotional state
- cultural/social frame

The observed event remains unchanged even when interpretations diverge.

---

## W3 — Emotion risks becoming a decorative mood field

A generic emotion tag does not earn architecture complexity.

### Repair

Use `AppraisalState` rather than a giant emotion taxonomy.

Track only material effects such as:

- approach/avoid tendency
- urgency
- trust update pressure
- perceived threat/opportunity
- goal relevance
- control/uncertainty

Optional narrative emotion labels are derived views. This keeps mechanics compact while allowing rich prose.

---

## W4 — Character contradictions need explicit tension

Real characters can hold conflicting values, goals and obligations.

### Repair

Add `InternalTension`:

- competing commitments/values/goals
- triggering context
- persistence
- possible resolutions
- no forced resolution

This supports believable hesitation, hypocrisy, compromise, regret and change without making personality random.

---

## W5 — Relationship dimensions alone can still feel gamey

Even multidimensional trust/fear/etc. can devolve into hidden meters.

### Repair

Make `RelationshipState` primarily an **event-pattern view**:

- formative events
- unresolved tensions
- expectations
- obligations
- salient positive/negative episodes
- current stance dimensions as derived summaries

The summary dimensions never replace relationship history.

---

## W6 — Social reputation needs audience scope

"Faction reputation" is still too broad when only part of a group knows something.

### Repair

Add `AudienceScope` and `InformationReach`:

- direct witnesses
- communication network
- organization subgroups
- public record
- private circle
- geographic/local reach where relevant

Reputation changes only where information has propagated or an authoritative public event applies.

---

## W7 — Off-screen simulation could create meaningless churn

Living worlds are not automatically entertaining. If every background actor changes continuously, history becomes noise.

### Repair

Introduce `MaterialityGate` for background transitions.

Persist an off-screen event as explicit history only when it materially affects:

- player opportunity
- material character state
- faction/world state
- scheduled commitment
- future scene feasibility
- Real Works constraints

Other activity can remain aggregated.

---

## W8 — Director needs an opportunity economy

A Director that merely seeks variety can overproduce interruptions.

### Repair

Add `NarrativeOpportunity` object with:

- origin state/events
- involved actors
- prerequisites
- relevance reason
- novelty class
- urgency/expiry
- expected player affordances
- expected cost/noise
- director mode eligibility

The Director ranks a bounded queue rather than generating drama continuously.

---

## W9 — Player preference inference can become self-fulfilling

If Seven infers "likes combat" and shows more combat, the evidence becomes biased.

### Repair

Player preference evidence must track:

- observation source
- opportunity exposure
- selection vs forced exposure
- recency
- uncertainty

Director occasionally preserves content diversity instead of collapsing to one inferred style.

---

## W10 — Quest generation needs affordance proof

A plausible quest can still be fake if its objectives cannot actually be achieved through current world capabilities.

### Repair

Every generated opportunity/quest requires an `AffordanceProof`:

- actor capable of requesting it
- target/resource/location exists or can validly emerge
- player has at least one valid action path or discoverable path
- success/failure transitions are representable
- reward/consequence is committable

No "go investigate X" when the engine cannot support investigation actions.

---

## W11 — Character importance requires explicit promotion logic

The system has ACTIVE/RELEVANT/BACKGROUND but no robust "why this nobody became important" mechanism.

### Repair

Add `NarrativeMateriality` signals:

- repeated player interaction
- strong causal impact
- relationship formation
- possession of key knowledge/resource
- unresolved commitment
- faction role
- Real Works significance

An ordinary actor can become a persistent material character through events, producing Nemesis-like emergent personal history without copying a proprietary system.

---

## W12 — Character creation/generation needs anti-stereotype structure

Procedural characters can become combinations of trope labels.

### Repair

Generate characters from independent structured axes and history:

- role/context
- values
- goals
- formative events
- relationships
- capabilities
- tensions
- preferences
- constraints

Then derive prose. Avoid "one archetype = whole personality".

---

# 2. New canonical objects proposed by Challenger 01

- `PerceptionEvent`
- `Appraisal`
- `AppraisalState`
- `InternalTension`
- `AudienceScope`
- `InformationReach`
- `MaterialityGate`
- `NarrativeOpportunity`
- `AffordanceProof`
- `NarrativeMateriality`
- `CharacterGenerationContract`
- `OpportunityExposureRecord`

These are accepted only if Reconciliation finds each earns its complexity.

---

# 3. Character pipeline candidate 3.6

Proposed stronger loop:

`WorldEvent`
→ `Perception Projection`
→ `PerceptionEvent`
→ `Appraisal`
→ `Knowledge/Belief Update`
→ `Memory Salience Update`
→ `Need/Goal/Tension Evaluation`
→ `Situation Affordances`
→ `Candidate Actions`
→ `Deterministic Eligibility Filter`
→ `Utility Ranking`
→ optional selective model cognition
→ `ActionProposal`
→ World validation
→ Commit
→ relationship/social/consequence updates
→ optional reflection

This is stronger than "LLM thinks what to do" because every stage has explicit ownership and failure semantics.

---

# 4. Relationship pipeline candidate

`InteractionEvent`
→ what each actor perceived
→ appraisal per actor
→ salient relationship episode
→ expectation/obligation change
→ derived stance update
→ future affordance changes

This supports situations such as:

- respect without affection
- loyalty despite resentment
- fear alongside admiration
- ideological disagreement between close allies
- betrayal that permanently changes expectations even after surface reconciliation

without inventing one master relationship score.

---

# 5. Emergent recurring-character mechanic

High-value addition inspired by persistent-rival/legacy systems but generalized safely:

### `Material Character Promotion`

A background actor can become material when events make them matter.

Possible triggers:

- defeats/helps/blocks player in a major event
- witnesses an important event
- forms a strong relationship
- gains a meaningful role
- becomes owner of a secret/obligation
- survives a major turning point
- repeatedly intersects the player's path

Promotion creates a persistent CharacterIdentityCore and history capsule from existing event lineage.

No arbitrary generated "special NPC" status is required.

---

# 6. Entertainment density law

> A persisted mechanic must either change future decisions, characterization, information flow, consequences or available experiences.

If it only produces metadata that is never used, it should remain derived/debug-only or be removed.

This law is added specifically to prevent Seven RPG becoming a simulation spreadsheet wearing a cape.

---

# 7. Round 01 reconciliation verdict

### ACCEPT into next candidate

- PerceptionEvent / perspective projection
- Appraisal separate from observation
- InternalTension
- relationship event-pattern primary model
- audience-scoped information/reputation
- background MaterialityGate
- bounded NarrativeOpportunity queue
- AffordanceProof for generated opportunities
- material-character promotion
- preference exposure correction
- structured character generation contract

### MODIFY

- rich emotion system → compact appraisal mechanics + derived emotion labels
- Director personalization → conservative ranking aid, not optimization target

### REJECT

- dense emotion vector for every character
- continuously changing background relationships
- permanent logging of every off-screen micro-event
- autonomous Director generating events every tick
- hidden universal "interestingness" score

---

# 8. New tests added

1. same event produces different valid appraisals in two characters
2. actor cannot perceive private scene
3. actor may hear a rumor without knowing underlying truth
4. relationship remains complex after reconciliation
5. background churn stays aggregated
6. ordinary NPC becomes persistent after causal importance
7. Director queue remains bounded under long idle period
8. generated quest fails closed without affordance proof
9. preference model corrects for unequal exposure
10. character generation avoids single-archetype flattening
11. internal tension persists across scenes until causally resolved
12. derived emotional prose changes without corrupting identity state

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

RPG 3.5 is **not saturated**. Challenger 01 finds architecture-level improvements worth incorporating before implementation.