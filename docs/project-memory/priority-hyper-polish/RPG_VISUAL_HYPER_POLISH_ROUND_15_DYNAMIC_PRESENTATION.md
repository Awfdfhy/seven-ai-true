# Seven RPG Visual Hyper-Polish — Round 15: Dynamic In-World Presentation

Status: **CHARACTER/WORLD CHALLENGER / PRE-IMPLEMENTATION**
Target: RPG 4.1 visual candidate + Round 14 integrity repairs.

## Round thesis

A continuity system that perfectly preserves the same outfit forever is still a bad living-world system.

Characters should be able to change presentation when the world, role, culture, resources or their own choices make that plausible.

The challenge is to add believable presentation behavior without building a universal fashion simulator.

---

# 1. Presentation is partly character behavior

`PresentationState` remains authoritative current state.

Selection/change is proposed through normal character/world action logic.

A lightweight `PresentationPolicy` is a derived/world-pack policy used by FastPolicy when appearance choice becomes relevant.

Possible inputs:
- current role/duty
- location/context
- weather/environment
- ceremony/event type
- travel/combat/work/rest context
- organization uniform rules
- available owned items where inventory exists
- culture/world norms
- character preferences/values
- disguise/stealth need when relevant
- transformation/form compatibility
- resource/access constraints

It does not autonomously mutate state.

---

# 2. PresentationAffordance

When a context change makes presentation relevant, the system derives legal `PresentationAffordance`s such as:
- keep current presentation
- change to available outfit/variant
- equip/remove visible gear
- use role uniform
- adopt disguise
- change hairstyle/presentation only if world/time/action permits

The character/player chooses or policy proposes among legal options.

A material change commits through the normal action/event transaction.

---

# 3. No magical wardrobe

An outfit cannot appear because it would look nice.

Where Inventory/Equipment exists:
- possession/access rules apply
- required items must exist/be accessible
- equipment conflicts resolve through module rules

Where inventory is intentionally abstract:
- world-pack policy may allow coarse wardrobe access such as `home wardrobe`, `uniform issue`, or `ceremonial attire`
- the abstraction is explicit

Seven never silently switches to unavailable equipment.

---

# 4. Contextual continuity

Typical triggers may include:
- entering formal event
- starting duty/work shift
- weather/season change
- rest/sleep transition
- travel preparation
- combat preparation
- faction/organization role
- cultural/religious/world ceremony if explicitly defined by the world pack
- disguise/infiltration plan
- transformation

No trigger requires change. Character preference, circumstance and player authority still matter.

---

# 5. Visual personality expression

Character identity can influence presentation tendencies without turning them into stereotypes.

`PresentationPreferenceProfile` is sparse and world-defined.

It may express tendencies such as:
- practical vs ornamental preference
- formality tolerance
- attachment to a signature item
- uniform compliance
- willingness to stand out/blend in
- comfort with repeated familiar outfits vs variety

These are behavior tendencies, not attractiveness or body-quality judgments.

---

# 6. Cultural/faction grammar

World packs may define presentation grammars for:
- roles
- organizations
- regions/cultures
- ranks/status
- ceremonies
- historical periods

A grammar constrains plausible options and naming/material motifs; it does not force every member to look identical.

Faction/cultural identity is evidence for generation and character choice, not a replacement for individual state.

---

# 7. Signature visual motifs

A character may have sparse `SignatureVisualCue`s:
- recurring accessory
- emblem
- color tendency
- silhouette motif
- hairstyle preference
- characteristic equipment presentation

Each cue has strength/optionality/context.

The renderer should preserve strong signature cues where state says they are present, but the system avoids repetitive costume lock-in.

---

# 8. Presentation memory and reactions

Other characters may notice meaningful presentation changes through normal Perception/Perspective.

Examples:
- new uniform signals role change
- missing signature item raises suspicion
- disguise changes recognition likelihood
- ceremonial clothing communicates context

Social meaning comes from world rules/relationships/perspective, not from a universal appearance judgment engine.

---

# 9. NPC off-screen presentation

BACKGROUND characters do not simulate outfits continuously.

When a material character becomes ACTIVE/RELEVANT, the system reconstructs/chooses presentation from:
- last material PresentationState
- elapsed-world events
- role/location/context
- valid wardrobe/inventory abstraction

A presentation update is generated only if context materially requires it.

No background closet tick.

---

# 10. Director boundary

Experience Director may surface an opportunity involving appearance only if grounded in world/character state.

It cannot force clothing/presentation changes merely to create prettier visuals.

Presentation remains owned by player/character/world constraints.

---

# 11. Real Works

For canon characters:
- canon outfit/form availability respects timeline/continuity
- generated alternate presentation is branch-derived unless source-supported
- iconic/signature visual cues can be protected by CanonVisualBinding
- a branch event may validly create a new outfit/presentation without relabeling it official canon

---

# 12. Evals added

1. character does not remain in context-inappropriate gear forever when legal change is plausible
2. NPC cannot use unavailable outfit/equipment
3. role uniform appears only when role/context makes it valid
4. player-owned character is not auto-redressed against explicit choice
5. signature cue persists when present but can be removed by valid event
6. cultural/faction grammar affects plausible options without flattening individuals
7. weather/context influence can be ignored when character/world circumstances justify it
8. background NPC incurs near-zero ongoing presentation compute
9. Real Works future outfit does not leak early
10. appearance change can create perspective/social meaning without universal reputation mutation

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Reason: visual continuity without believable in-world presentation change would produce visually static characters. A lightweight policy integrated into existing character action logic materially improves living-world fidelity with little persistent-state cost.

Saturation counter remains **0 / 2**.
