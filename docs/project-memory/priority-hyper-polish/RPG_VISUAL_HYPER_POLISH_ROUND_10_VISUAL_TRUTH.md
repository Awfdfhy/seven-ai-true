# Seven RPG Visual Hyper-Polish — Round 10: Visual Truth & Identity

Status: **CHALLENGER ROUND / PRE-IMPLEMENTATION**
Target: `RPG_4_0_RECONCILED_CANDIDATE.md`
Research input: `RPG_VISUAL_IDENTITY_RESEARCH_SWEEP_V1.md`

## Round thesis

The prior RPG architecture can describe a transformation but cannot yet guarantee that a character remains recognizably the same person across outfits, viewpoints, generated images, storyboards and video.

The fix must preserve RPG 4.0's minimal backbone rather than adding an independent media universe.

---

# 1. Critical failure: appearance is not one field

A single prose descriptor such as `black hair, blue eyes, red coat` mixes fundamentally different state classes.

It cannot answer:
- which traits are identity-stable?
- which outfit is currently worn?
- what is hidden under clothing?
- what changed temporarily?
- what changed permanently?
- what belongs to a powered form?
- what is merely camera/light/style?
- what another actor can actually see?

### Repair: CharacterVisualState

`CharacterVisualState` is a **versioned component family under CharacterState / WorldEntity**, not a new top-level canonical primitive.

It contains sparse world-defined layers:

## A. IdentityVisualCore
Long-lived visual identity facts:
- broad face/feature identity descriptors where known
- hair baseline/color/style constraints where identity-relevant
- eye appearance where relevant
- silhouette/proportion descriptors where relevant
- stable distinguishing marks/features
- species/body-plan features in fictional worlds
- persistent prosthetic/assistive/device features where world-defined
- baseline age-stage presentation where relevant
- identity-linked non-body visual motifs only when truly persistent

This layer is not a beauty score and does not encode comparative attractiveness.

## B. PresentationState
Mutable chosen/contextual presentation:
- current hairstyle variant
- clothing/outfit pieces
- accessories
- cosmetics/styling where world-defined
- uniform/role presentation
- visible equipment
- carried visible signature props

## C. VisibleConditionState
Short-lived visual condition caused by events/environment:
- wet/dry
- dusty/clean
- clothing condition
- temporary magical/energy visual effect
- fatigue cues when narratively appropriate
- weather/environment overlays

Transient condition cannot rewrite IdentityVisualCore.

## D. FormState
Explicit form/transformation layer:
- base form
- powered form
- disguise form
- shapeshift/form variants where supported by world rules
- age/time-stage variant where caused by authoritative world progression

Every durable form change requires event lineage.

## E. PoseExpressionState
Ephemeral presentation request/state:
- pose class
- gaze/facing
- expression category
- gesture
- action/motion phase

This is scene-level and normally non-authoritative unless mechanics require it.

## F. VisibilityMask
Controls which visual facts are currently observable:
- covered/occluded
- concealed
- disguised
- transformed
- low-visibility
- viewpoint-dependent

This drives perception and recognition without deleting underlying truth.

---

# 2. Visual state ownership

World truth owns material appearance facts.

Generated prose/image/video does not automatically own them.

Authoritative appearance changes enter via typed event subtypes such as:
- `AppearanceChanged`
- `OutfitEquipped`
- `OutfitRemoved`
- `HairPresentationChanged`
- `AccessoryChanged`
- `VisibleEquipmentChanged`
- `VisualConditionApplied/Cleared`
- `TransformationEntered/Exited`
- `DisguiseApplied/Removed`
- `TimeStageChanged`

Events may be module-owned or world-pack-defined but must obey RootActionTransaction, branch scope and replay.

---

# 3. Visual provenance classes

Each material visual field carries origin semantics:

- `WORLD_DEFINED`
- `USER_DEFINED`
- `CANON_SOURCE_SUPPORTED`
- `BRANCH_EVENT_DERIVED`
- `GENERATED_PROPOSAL`
- `UNKNOWN`

`GENERATED_PROPOSAL` never silently upgrades to world truth.

For original worlds, the user may explicitly approve a generated design through a governed promotion event.

For Real Works, generated media cannot promote unsupported detail to official canon.

---

# 4. Unknown visual detail

Unknown is a real state.

If a source only establishes a uniform from the front, Seven cannot assert an unseen rear detail as canon.

A renderer may need to fill gaps. Those fills are classified as:
- `RENDER_ASSUMPTION_EPHEMERAL`
- `BRANCH_VISUAL_CHOICE` if explicitly adopted for this campaign
- `CANON_GAP` if Real Works requires official support

This prevents a generated image from laundering visual guesses into canon.

---

# 5. Wardrobe and presentation continuity

A robust RPG needs more than `currentOutfit = X`.

`WardrobeState` is a component/view over owned/available presentation items and outfit assemblies.

An `OutfitAssembly` may specify:
- item refs
- layer/slot semantics where the world needs them
- compatibility rules
- condition/state
- contextual tags such as formal, travel, uniform, cold-weather, ceremonial
- source/provenance
- visibility

The system does not require a universal fashion simulation. Worlds enable only relevant detail.

Contextual outfit selection can be suggested by policy but changing clothes requires a valid event/action or authored transition.

No narrator silently swaps clothing for aesthetic convenience.

---

# 6. Visual identity vs art style

`WorldVisualStyleProfile` is separate from CharacterVisualState.

It may describe:
- medium/style family
- abstraction level
- line/render tendencies
- material/lighting tendencies
- color-language rules
- camera/cinematography preferences

Changing style must not mutate character identity.

The same authoritative character can be rendered as illustration, comic panel, 3D-like scene, icon or video while preserving state.

---

# 7. Visual Anchor Set

`VisualAnchorSet` is a **derived/provider-neutral reference package**, not authority.

Possible semantic anchor roles:
- front
- left/right profile
- three-quarter
- back
- full-body/silhouette
- neutral expression
- expression references
- current outfit
- alternate canonical outfit
- transformation/form
- distinctive accessory/mark

Each anchor binds:
- character id
- branch/world version compatibility
- visual-state version
- semantic role
- source artifact
- crop/region if needed
- provenance/authority class
- approved/generated status
- validity interval

The generation compiler chooses a small relevant subset rather than injecting every anchor.

---

# 8. Reference hierarchy

When constructing a visual output, references are ranked by role, not by one global weight:

1. authoritative source-bound canon/user-approved anchors for identity facts
2. current branch/world-state presentation/form anchors
3. current scene continuity anchors
4. generated prior-frame references as continuity hints only
5. text-derived descriptions as fallback

A prior generated image never outranks current authoritative state merely because it is visually convenient.

---

# 9. Visual identity compiler

`CharacterVisualCapsule` compiles only the state needed for a render request:
- character id
- visual-state version
- required stable traits
- current form
- current outfit/presentation
- visible condition
- visibility/occlusion constraints
- pose/expression target
- relevant anchor refs
- allowed presentation freedom
- forbidden contradictions
- unknown/gap markers

The capsule is reconstructable and disposable.

---

# 10. Perspective integration

Visual truth and character perception remain separate.

Pipeline:

`CharacterVisualState`
→ scene/view conditions
→ visibility projection
→ `PerceptionEvent`
→ actor-local visual belief/recognition

A character may observe:
- full identity cue
- partial cue
- uncertain cue
- apparent/disguised cue
- silhouette only
- no reliable cue

The observer does not receive hidden VisualState fields by default.

---

# 11. Recognition model

Recognition is a derived inference, not automatic ID lookup.

Possible signals:
- face/feature cue
- silhouette/body-plan cue
- hair/presentation cue
- voice cue if multimodal system supplies it
- gait/mannerism cue where world/scene supports it
- equipment/signature prop
- contextual expectation
- prior familiarity

Output classes:
- `RECOGNIZED`
- `PROBABLY_RECOGNIZED`
- `UNCERTAIN`
- `MISIDENTIFIED`
- `NOT_RECOGNIZED`

Recognition confidence is observer/context-specific and never changes world identity.

---

# 12. Disguise

A disguise is not a boolean invisibility spell unless world mechanics say so.

It changes observable cues and may introduce an `ApparentIdentityProfile`.

Disguise evaluation depends on:
- disguise quality/capability
- observer familiarity
- available cues
- distance/viewpoint/lighting
- behavior/voice if relevant
- contradictions/events

The system can support dramatic near-recognition without omniscient NPCs.

---

# 13. Real Works visual boundary

Canon visual data must be source/continuity bound.

Important distinctions:
- official design facts
- official alternate form/outfit
- adaptation-specific variant
- localized/art-style variant
- branch-derived change
- generated speculative fill
- CANON_GAP

A manga/anime/game adaptation difference is not silently merged into one fake appearance.

The Canon system owns source identity and continuity classification; RPG owns current branch visual state.

---

# 14. Character creation

For original characters, creation should store structured visual choices rather than only a paragraph.

`VisualCharacterCreationContract` may capture:
- world/species constraints
- user-specified stable traits
- user-specified presentation
- unknown/free dimensions
- reference images if user supplies them
- approved anchor set
- style preference separately

Generated design proposals remain editable and uncommitted until accepted.

---

# 15. Visual evaluation additions

Required tests:

1. same identity across 12+ poses/views
2. current outfit survives scene changes
3. outfit changes only after valid state transition
4. temporary condition clears without altering identity
5. transformation switches correct form and can revert
6. hidden mark never leaks to observer who cannot see it
7. disguise can fool unfamiliar observer but fail with familiar observer under stronger cues
8. multi-character identities do not swap
9. style change preserves character identity/state
10. Real Works unsupported detail stays CANON_GAP/speculative
11. save/reload preserves visual-state version exactly
12. branch A outfit/form does not leak into branch B
13. provider switch reconstructs from state/anchors rather than prior prompt memory
14. image generation disabled: RPG remains fully playable

---

# 16. Complexity decision

### ACCEPT
- `CharacterVisualState` as versioned component family
- layered visual state
- `VisualAnchorSet` as derived artifact family
- `CharacterVisualCapsule`
- wardrobe/outfit assembly where world-enabled
- recognition/disguise inference
- source-bound visual provenance

### DO NOT ADD as top-level canonical primitive yet
- separate Visual World database
- permanent frame-by-frame appearance ledger
- dense body-part schema for every world
- mandatory face embedding store
- mandatory image model runtime
- one universal style/beauty score

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter remains **0 / 2**.
