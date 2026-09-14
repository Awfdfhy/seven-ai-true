# Seven RPG Hyper-Polish — Round 06: Agency, Discovery & Chronicle

Status: **CHALLENGER ROUND 06 / MATERIAL IMPROVEMENT FOUND**
Protocol: `RPG_HYPER_POLISH_PROTOCOL_2_0.md`
Input: RPG 3.5 + accepted Round 01–05 repairs.

## Thesis

The architecture preserves player agency mechanically, but entertainment also depends on whether the player can later reconstruct how their choices changed the world. Exploration and mystery play also need structured uncertainty rather than narrator improvisation.

Round 06 adds derived causal traces, a personalized campaign chronicle, discovery state and an optional structured investigation layer.

## Research pressure

- A 2026 Nature Communications study on interactive narratives found that player agency changes episodic memory organization: participants with control showed more personalized recall, while causally or semantically central events were remembered better. Source: https://www.nature.com/articles/s41467-026-73907-2
- A 2026 systematic review of single-player RPGs emphasizes that perceived agency emerges from choices, world-building, exploration, pacing, rules and consequences rather than from menus alone. Source: https://www.mdpi.com/2673-6470/6/2/33
- Recent constraint-based game-agent work supports combining structured evidence constraints with LLM explanation rather than relying on free-form inference alone. Source: https://ojs.aaai.org/index.php/AAAI/article/view/38453
- Lightweight 2026 RPG testing reports that narrative coherence and character consistency can score well while perceived choice influence remains weaker, reinforcing the need to evaluate agency as its own property. Source: https://journals.sagepub.com/doi/10.3233/FAIA260065

## Critical weaknesses found

### R6-W1 — Choices matter internally but may feel invisible

A correct ConsequenceGraph does not guarantee that meaningful downstream impact can later be reconstructed.

### Repair: AgencyTrace

Derived `AgencyTrace` links:
- explicit player decision/action
- direct committed effects
- later causal descendants
- social/character consequences
- opened/closed affordances
- branch creation
- unresolved consequences

It is reconstructable from authoritative events and never becomes authority itself.

Uses:
- internal agency evaluation
- recap/chronicle
- optional player-facing consequence review where appropriate
- debugging false-choice failures

---

### R6-W2 — The campaign lacks a player-centered historical view

World history and character memory are not the same as "my story".

### Repair: PlayerChronicle

Derived `PlayerChronicle` prioritizes:
- explicit player choices
- causally central events
- relationship turning points
- discoveries
- irreversible outcomes
- personal promises/debts
- major transformations
- branch-defining moments

Entries bind to event refs and may be regenerated. It is not a lossy replacement for the world ledger.

Chronicle ordering can expose causal groupings in addition to chronology.

---

### R6-W3 — Important consequences can remain permanently invisible

Some consequences should be hidden temporarily, but a system where major effects never surface can create false-choice perception.

### Repair: Causal Feedback Policy

For each material player-caused consequence classify visibility:
- `IMMEDIATE_OBSERVABLE`
- `DELAYED_DISCOVERABLE`
- `PRIVATE_TO_OTHERS`
- `STRUCTURALLY_HIDDEN`

The Director/scene system may surface discoverable consequences when valid, but cannot reveal hidden information merely to prove the system worked.

Agency eval distinguishes "effect existed" from "effect became perceivable."

---

### R6-W4 — Discovery is scattered across character/player knowledge

Exploration, mysteries and secrets benefit from explicit discovery state.

### Repair: DiscoveryRecord

`DiscoveryRecord` binds:
- player/avatar perspective
- discovered entity/location/clue/concept
- discovery event
- branch/time
- certainty/interpretation boundary
- related unresolved questions

Discovery differs from world existence. Something can exist without being discovered.

---

### R6-W5 — Investigation module is underspecified

### Repair: Hypothesis/Evidence Graph Module

Optional investigation module owns:
- `EvidenceItem`
- `Hypothesis`
- hard constraints
- soft/supporting constraints
- contradictions
- source/perspective
- unresolved alternatives
- information-value estimates for possible investigative actions

The module may rank hypotheses but never promote a hypothesis to world truth without authoritative resolution/evidence.

LLMs may explain or propose hypotheses; structured constraints handle impossible assignments where available.

---

### R6-W6 — Exploration needs affordance discovery, not just map movement

### Repair: ExplorationSurface

Locations/entities expose discoverable affordance classes gated by:
- presence/proximity
- perception capabilities
- world-appropriate tools/skills if a module requires them
- prior discoveries
- time/world state

The narrator can hint at discoverable affordances without enumerating controller-only secrets.

---

### R6-W7 — Agency measurement needs its own eval family

Add independent measures:
- legal action acceptance rate
- irreversible-action invention rate
- consequence persistence
- downstream causal depth for material choices
- choice influence visibility
- branch diversity
- forced-choice incidents
- Director override incidents
- player-rated perceived control/ownership in human tests

Do not infer agency from narrative quality score.

---

## New objects/views

Derived/reconstructable:
- `AgencyTrace`
- `PlayerChronicle`
- `DiscoveryRecord`
- `CausalFeedbackView`
- `ExplorationSurface`

Optional investigation module:
- `EvidenceItem`
- `Hypothesis`
- constraint graph
- information-value view

## Rejected alternatives

- global "choices matter" score as truth
- immediate UI notification for every consequence
- exposing hidden consequences just to reassure the player
- storing Chronicle as the only history
- LLM-only mystery inference
- assuming location presence automatically means full discovery

## New gauntlets

1. Two playthroughs through similar content produce different PlayerChronicles because choices differ.
2. Major choice has a reconstructable AgencyTrace after 200 turns.
3. Hidden consequence remains hidden until a valid discovery route appears.
4. Player can discover a clue without learning its correct interpretation automatically.
5. Investigation hypothesis remains plausible but non-authoritative until resolved.
6. Structured evidence can prune an impossible hypothesis deterministically.
7. Director cannot reveal private consequence solely to increase perceived agency.
8. Exploration hints expose legal affordances without leaking controller-only objects.
9. Human/eval agency score can fail even when prose quality is high.
10. Chronicle reconstruction after migration yields the same event refs.

## Reconciliation verdict

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter: **0 / 2**.

Round 06 materially improves perceived agency, long-campaign identity, exploration and investigation while preserving epistemic boundaries.