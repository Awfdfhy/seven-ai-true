# Seven RPG Hyper-Polish — Round 02: Character Cognition

Status: **CHALLENGER ROUND 02 / MATERIAL IMPROVEMENT FOUND**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Baseline under attack: `RPG_3_5_IMPROVED_CANDIDATE.md` + accepted repairs from Round 01.

## Thesis

The 3.5 + Round 01 design correctly separates world truth, perception, appraisal, belief and action, but it still treats character cognition as one mostly linear loop. Long-running characters need stronger temporal separation, explicit uncertainty about their own interpretations, bounded active storyline memory, and a repair path that protects player agency instead of preserving persona or plot at any cost.

## Research pressure

Key findings incorporated:

- NCP-Bench (ICML 2026) shows long-horizon narrative consistency remains fragile. Its hierarchical-memory baseline reduces commitment conflicts but increases player-input conflicts, demonstrating that consistency mechanisms can accidentally fight the player. Source: https://github.com/NLP2CT/NCP-Bench
- Dynamic Persona Coherence (ACL 2026) separates long-term identity, mid-term accumulated meaning/stress and short-term affect, showing that static persona consistency and valid evolution are different targets. Source: https://aclanthology.org/2026.acl-long.1336/
- PersonaForge (ACL Findings 2026) reports stronger long-dialogue personality consistency from more orthogonal psychological constraints plus a selective cognitive workspace. Source: https://aclanthology.org/2026.findings-acl.386/
- PsyMem (TACL 2026) finds value in explicit psychological representation plus explicit memory control instead of implicit model memory. Source: https://aclanthology.org/2026.tacl-1.24/
- BOOKMARKS (2026) argues that recurrent summarization loses important role-playing details and proposes task-specific active storyline memory questions. Source: https://www.alphaxiv.org/abs/2605.14169
- Neuro-Symbolic Agentic RL for long-term OC interaction (ACL 2026) reports a hybrid trade-off: structured workflow improves logic while generative methods remain useful for persona quality. Source: https://aclanthology.org/2026.acl-short.44/

## Critical weaknesses found

### R2-W1 — Two-layer persona is insufficient

3.5 has stable identity and adaptive psychology, but this can still cause either:
- short-term mood to rewrite identity; or
- long-running stress/meaning changes to be lost as temporary affect.

### Repair: three-timescale Persona State

Use three ownership layers, without requiring a universal psychology taxonomy:

1. `IdentityLayer`
   - long-lived values/principles
   - stable personality tendencies
   - cultural/role identity
   - persistent capabilities/limitations
   - protected canon identity constraints when Real Works is active

2. `MeaningLayer`
   - medium-term accumulated stress/hope/grief/resentment/commitment pressure
   - unresolved interpretations
   - active identity tensions
   - learned expectations
   - arc momentum

3. `MomentLayer`
   - immediate appraisal
   - urgency
   - attention focus
   - approach/avoid tendency
   - current conversational stance

Changes across layers require different evidence thresholds. Moment state cannot directly rewrite Identity.

---

### R2-W2 — Appraisal can become mistaken certainty

A character may misread a gesture, motive or ambiguous event. Round 01 separates observation from appraisal but does not type the epistemic strength of appraisal.

### Repair: Interpretive Hypothesis

Add `InterpretiveHypothesis`:
- observer
- perception refs
- interpretation
- alternatives considered
- support basis
- contradiction refs
- uncertainty state
- expiry/revision conditions

Interpretations are character-local derived state, not world truth.

This supports misunderstandings, suspicion and later reinterpretation without retconning the original event.

---

### R2-W3 — Memory retrieval remains too generic

A large character history still risks either dumping too much context or forgetting the one old event that matters.

### Repair: Active Storyline Questions

Add a derived, reconstructable `CharacterBookmarkSet` inspired by search-based active storyline memory, but keep the event ledger authoritative.

Examples:
- What promise does this actor currently owe the player?
- Why does this actor distrust character X?
- What does this actor believe happened at location Y?
- Which unresolved event is most relevant to this scene?

Each bookmark stores:
- question key
- answer/capsule
- source event/memory refs
- valid-through world version
- branch
- owner/perspective
- refresh trigger

Bookmarks never become authority and may be deleted/rebuilt.

---

### R2-W4 — Persona repair can override agency

A consistency critic could reject a valid player-caused character change just because it differs from the initial persona.

### Repair: Agency-Safe Persona Repair

Persona repair order:
1. preserve authoritative world/player events;
2. preserve valid character learning/change caused by those events;
3. preserve identity constraints that have not been causally revised;
4. repair narration/expression last.

A valid player-driven turning point may change a character. The repair layer is forbidden from undoing it merely to restore baseline persona similarity.

---

### R2-W5 — One decision ranking path risks predictable NPCs

Deterministic utility alone can make NPCs mechanically optimal. Pure model choice can become inconsistent.

### Repair: Bounded Dual-Process Decision Policy

`FastPolicy` handles routine/obvious actions from rules, schedules, affordances and lightweight scoring.

`DeliberativePolicy` activates only when one or more triggers fire:
- high internal tension
- irreversible consequence
- conflicting goals/values
- social ambiguity
- major relationship event
- high narrative materiality
- important branch/canon risk

Deliberation returns structured reasons and candidate actions. It cannot commit state directly.

---

### R2-W6 — Characters need self-knowledge boundaries

A character should not necessarily know the exact numeric/value representation of its own internal state.

### Repair: Internal State vs Self-Model

Separate:
- `CharacterInternalState` — controller state used for simulation.
- `CharacterSelfModel` — what the character consciously believes about itself.

A character may be in conflict, denial or confusion without exposing controller metadata in dialogue.

---

### R2-W7 — Long-running growth needs revision provenance

A value or belief may change gradually, but 3.5 lacks a strong contract for durable psychological revision.

### Repair: CharacterRevisionEvent

Durable changes to Identity/Meaning layers require a `CharacterRevisionEvent` with:
- prior state ref
- triggering event cluster
- revision class
- affected field
- rationale/evidence refs
- reversible vs durable
- Real Works classification: canon-supported / branch-derived / generated

This prevents arbitrary personality drift.

---

### R2-W8 — Attention is missing

Even if a character can perceive many things, it should not process everything equally.

### Repair: AttentionBudget

Per scene, compile a bounded `AttentionSet` from:
- threat/urgency
- goal relevance
- social salience
- novelty
- unresolved tension
- explicit focus

Only attended perceptions normally enter deep appraisal or memory promotion. Critical world rules may override this.

This improves believability and reduces compute.

---

## Character Cognition 3.6 pipeline

`WorldEvent`
→ `PerceptionProjection`
→ `PerceptionEvent`
→ `AttentionGate`
→ `InterpretiveHypothesis`
→ `AppraisalState`
→ `Knowledge/Belief Update`
→ `Memory + Bookmark Refresh`
→ `Identity / Meaning / Moment Reconciliation`
→ `Needs / Goals / InternalTensions`
→ `AffordanceSet`
→ `FastPolicy`
→ optional `DeliberativePolicy`
→ `ActionProposal`
→ World validation
→ Commit
→ social/consequence updates
→ optional `CharacterRevisionEvent`

## New canonical/derived objects accepted

Canonical where applicable:
- `IdentityLayer`
- `MeaningLayer`
- `MomentLayer`
- `InterpretiveHypothesis`
- `CharacterRevisionEvent`
- `CharacterSelfModel`

Derived/reconstructable:
- `CharacterBookmarkSet`
- `AttentionSet`
- stance/emotion labels
- compact active persona capsule

Policy objects:
- `FastPolicy`
- `DeliberativePolicy`
- `AttentionBudget`

## Rejected alternatives

- fixed 26-dimension psychology requirement for every world
- always-on hidden chain-of-thought / inner-monologue storage
- LLM call for every NPC decision
- persona similarity score as canonical truth
- repairing valid character growth back toward initial personality
- recurrent summary as the sole long-term character memory
- giving characters direct access to controller-only internal values

## New gauntlets

1. 200-turn identity stability with two causally justified major changes.
2. Ambiguous event yields different `InterpretiveHypothesis` for two actors.
3. Character later learns its earlier interpretation was wrong without world retcon.
4. Old promise recovered through bookmark refresh after long gap.
5. Persona repair preserves a player-caused turning point.
6. Routine action uses FastPolicy without model call.
7. High-stakes value conflict escalates to DeliberativePolicy.
8. Character cannot read its controller-only internal state verbatim.
9. Moment mood decays without erasing Meaning/Identity.
10. Durable identity revision requires a CharacterRevisionEvent.
11. Attention budget ignores irrelevant background events while preserving critical alerts.
12. Real Works identity change is correctly labeled canon-supported vs branch-derived.

## Reconciliation verdict

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter remains **0 / 2**.

Round 02 materially improves the character system in coherence, long-session memory, agency safety and compute efficiency. These repairs must be incorporated into the next candidate before saturation testing continues.