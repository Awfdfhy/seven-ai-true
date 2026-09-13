# Seven RPG Visual Hyper-Polish — Round 12: Recognition, Canon & Forms

Status: **CHALLENGER ROUND / PRE-IMPLEMENTATION**

## Round thesis

Round 10 separated visual state layers. Round 11 governed media derivation. The remaining failure is identity semantics:

> Looking like X is not the same thing as being X, and official appearance is not one timeless universal image.

This matters for disguise, transformations, time progression, adaptation variants, witnesses, mysteries and Real Works.

---

# 1. Identity mapping is separate from appearance

`characterId` remains authoritative identity.

`CharacterVisualState` describes current visual state.

`RecognitionHypothesis` describes an observer's inference about identity.

These are never collapsed.

A disguised actor can have:
- true `characterId = A`
- apparent visual profile resembling B or an unknown persona
- observer belief = B

World truth remains A.

---

# 2. ApparentIdentityProfile

Disguise/shapeshift/illusion modules may provide a temporary `ApparentIdentityProfile` containing only the cues they change.

It can override observable presentation such as:
- face/feature presentation where world rules allow
- hair
- clothing
- silhouette
- voice if a separate audio/illusion module allows it
- identifying marks
- species/form cues

It never changes true identity unless the world event is an actual identity-changing transformation by world rules.

---

# 3. RecognitionHypothesis lifecycle

Recognition lives inside `PerspectiveState` as a typed hypothesis/view:

- candidate identity refs
- supporting perceived cues
- contradicting cues
- familiarity context
- scene/view conditions
- current status
- source event refs

States:
- RECOGNIZED
- LIKELY
- UNCERTAIN
- MISIDENTIFIED
- REJECTED
- UNKNOWN

Correction is event-driven. Discovering a disguise can revise perspective without rewriting prior perception history.

---

# 4. Recognition is multimodal but modular

Visual cues are one channel.

If future systems provide audio/motion evidence, recognition may combine:
- appearance
- voice
- movement/mannerism
- signature equipment
- behavior/context

The RPG visual subsystem exposes evidence; it does not own all modalities.

No always-on biometric stack is required.

---

# 5. Visual clue semantics

Visible appearance can become gameplay evidence.

`VisualClue` is a derived/proposed evidence object bound to exact scene/perception refs.

Examples include:
- distinctive accessory
- changed uniform
- unusual form state
- matching visible mark
- outfit inconsistency
- transformation residue

A clue supports a hypothesis but is not automatically world proof unless the world rules make it decisive.

This connects Visual Identity to Investigation without granting it truth authority.

---

# 6. Form graph instead of one transformation field

Characters/world entities may have a sparse `VisualFormGraph`.

A form node can reference:
- parent/base form
- entry conditions
- exit conditions
- persistent visual deltas
- presentation compatibility
- equipment compatibility
- anchor set
- world/canon provenance

Edges define legal transitions.

This supports:
- powered forms
- species/form shifts
- armored states
- curse/blessing forms
- temporary illusions
- age/time-stage variants

without duplicating the entire character record.

The graph exists only for characters/worlds that need it.

---

# 7. Delta-based forms

A form should usually be represented as a delta over a baseline visual state rather than a full duplicate.

Benefits:
- less storage
- fewer contradictory fields
- easier reversion
- clearer provenance
- easier provider compilation

A full replacement profile is allowed only when transformation semantics truly replace the body-plan/visual identity model.

---

# 8. Outfit compatibility across forms

An outfit/equipment item may declare compatibility rules with form/species/body-plan states.

When form changes:
- compatible presentation persists
- incompatible presentation must resolve through explicit module/world policy
- narrator cannot guess a material equipment transformation if rules do not define it

Unknown behavior becomes explicit unresolved state or world-pack policy.

---

# 9. Temporal appearance

Visual identity can evolve through time.

`AppearanceEpoch` is a derived interval/view over event history, not a new authority store.

Examples:
- childhood/adult era in worlds that model long time spans
- pre/post major transformation
- old/new uniform period
- branch-specific redesign

Generation requests bind the correct epoch by world time and branch.

This prevents future appearance leaking into earlier scenes.

---

# 10. Real Works visual continuity key

There is no single universal canonical picture for every character.

Important key dimensions include:
- work/franchise
- continuity
- adaptation/medium
- source version/edition where relevant
- timeline/episode/chapter/game state
- form/outfit

`CanonVisualBinding` therefore binds exact visual facts/anchors to a `CanonContinuityKey` and temporal availability.

Anime-only redesigns do not silently overwrite manga/game variants.

---

# 11. Source evidence vs reference utility

A source image can play two independent roles:

### Evidence role
Supports a canon appearance claim.

### Generation reference role
Helps a renderer reproduce a visual identity.

A useful reference is not automatically authoritative evidence.
An authoritative text claim may establish a fact without providing a useful image anchor.

Seven stores these roles separately.

---

# 12. Canon gap handling

When official sources do not establish a needed render detail:

- preserve `CANON_GAP`
- renderer may fill with `RENDER_ASSUMPTION_EPHEMERAL`
- user may adopt a branch visual choice
- official canon status remains unchanged

Repeated generations agreeing on the same invented detail do not increase canon authority.

---

# 13. Anchor invalidation

Visual anchors have compatibility predicates.

An anchor is invalid or partial when:
- wrong branch
- wrong form
- outdated outfit
- incompatible appearance epoch
- contradicted by later user-approved visual revision
- wrong adaptation continuity

The compiler must not continue feeding a visually beautiful but state-stale anchor.

---

# 14. Reference coverage map

`VisualCoverageMap` is a derived diagnostic showing which important visual dimensions have strong references:
- front/profile/back coverage
- full-body/silhouette
- form variants
- outfit variants
- expressions
- distinctive details

It helps Seven decide whether generation is likely to drift and whether a new approved anchor would materially help.

It does not block RPG play.

---

# 15. Player-created appearance authority

For an original/player character:
- explicit user choices outrank generated proposals
- approved references can become authoritative design evidence for that user-owned world
- renderer drift never silently alters user choices
- user can revise the design through explicit versioned events

A `VisualRevisionEvent` records changed fields and invalidates/rebuilds incompatible anchors/caches.

---

# 16. Generated reference safety

Generated anchors are marked as generated.

They may be approved as design anchors in original worlds, but approval is scoped to defined visual fields/variant, not a blanket promotion of every pixel.

This prevents accidental promotion of:
- random background objects
- incidental clothing folds/details
- unrequested accessories
- renderer artifacts

---

# 17. Evals added

1. same disguised actor produces different recognition outcomes for familiar vs unfamiliar observers
2. misidentification persists until causally corrected
3. observer cannot use hidden underlying appearance through Perspective leak
4. transformation reverts correctly from delta-based form
5. incompatible outfit/form produces explicit resolution rather than narration guess
6. episode-early scene never uses later canonical appearance epoch
7. anime/manga/game variants remain separated
8. generated anchor approval promotes only specified design fields
9. stale anchor is invalidated after visual revision
10. visual clue supports investigation without becoming automatic truth
11. repeated generated detail never becomes canon by repetition
12. multi-modal recognition can extend without changing CharacterVisualState authority

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter remains **0 / 2**.
