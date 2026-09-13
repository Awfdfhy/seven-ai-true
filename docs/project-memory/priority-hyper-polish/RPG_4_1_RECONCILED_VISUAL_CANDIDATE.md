# Seven RPG 4.1 — Reconciled Visual Candidate

Status: **PRE-IMPLEMENTATION / SATURATION TEST TARGET / NOT YET REFROZEN**
Supersedes as current Hyper-Polish target: `RPG_4_0_RECONCILED_CANDIDATE.md`
Preserves RPG 4.0's causal/character architecture and incorporates accepted Visual Hyper-Polish Rounds 10–13.

## Prime law

> Seven RPG is a character-centered causal living-world engine. Models and media generators may interpret, improvise, narrate, visualize and propose; authoritative world state, player agency, character perspective, mechanics, visual identity and consequences remain governed by typed state, validated events and explicit transaction boundaries.

Generated pixels are representation, not truth.

---

# 1. Canonical backbone remains 15 families

RPG 4.1 deliberately does **not** add a new top-level visual database/runtime.

The canonical primitive families remain:

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

Visual depth is integrated through versioned components, event subtypes, Perspective entries, provider-neutral derived contracts and artifact metadata.

---

# 2. CharacterVisualState

`CharacterVisualState` is a sparse versioned component under `CharacterState` / relevant `WorldEntity`.

It contains only material world facts needed to preserve appearance continuity.

## 2.1 IdentityVisualCore
Slow/stable visual identity facts where known and world-relevant:
- feature identity descriptors
- hair baseline constraints
- eye appearance where relevant
- silhouette/proportion descriptors where relevant
- stable distinguishing features
- fictional species/body-plan features
- persistent assistive/prosthetic/device features where world-defined
- age-stage identity where relevant

No beauty/rank score is part of the architecture.

## 2.2 PresentationState
Mutable current presentation:
- hairstyle variant
- outfit/clothing identity
- accessories
- uniform/role presentation
- visible equipment
- visible signature props

If an Inventory/Equipment module owns item truth, PresentationState references its items instead of duplicating possession state.

## 2.3 VisibleConditionState
Short-lived event/environment-derived visible condition:
- wet/dry
- dusty/clean
- clothing condition
- temporary magical/energy effects
- weather/environment overlays
- other world-pack-defined temporary cues

Transient condition cannot mutate identity.

## 2.4 FormRef / form deltas
Current form or transformation visual state.

Transformation mechanics remain owned by the relevant world/gameplay module. VisualState stores only the current form ref and the visual deltas/compatibility needed for presentation.

## 2.5 Visibility / concealment
Material hidden/covered/disguised/occluded cues are represented explicitly when needed for perception, recognition or generation.

---

# 3. Visual change authority

Material appearance changes occur through typed `WorldEvent` subtypes inside normal RootActionTransaction semantics.

Examples:
- appearance revision
- outfit/presentation change
- hairstyle change
- accessory/equipment presentation change
- visible-condition apply/clear
- transformation/form transition
- disguise apply/remove
- time-stage change
- user-approved original-world visual design promotion

Narrative prose or generated media cannot silently create one of these events.

---

# 4. Visual provenance

Material visual fields preserve origin semantics such as:
- WORLD_DEFINED
- USER_DEFINED
- CANON_SOURCE_SUPPORTED
- BRANCH_EVENT_DERIVED
- GENERATED_PROPOSAL
- UNKNOWN

Repeated generated outputs never increase authority.

For Real Works, unsupported render detail remains `CANON_GAP` or explicit branch/render assumption.

---

# 5. Unknown detail is first-class

A renderer may require a detail that world/canon state does not establish.

Seven distinguishes:
- `RENDER_ASSUMPTION_EPHEMERAL`
- `BRANCH_VISUAL_CHOICE`
- `CANON_GAP`

Render assumptions exist to complete an image/video; they do not automatically enter world state.

---

# 6. Perspective and recognition

Visual truth and observer knowledge remain separate.

Pipeline:

`CharacterVisualState`
→ scene/view/visibility projection
→ `PerceptionEvent`
→ Attention / Interpretation / Appraisal
→ observer `PerspectiveState`

An observer may receive only:
- clear identifying cue
- partial cue
- silhouette
- disguised cue
- uncertain cue
- no usable cue

## RecognitionHypothesis

Recognition is represented inside `PerspectiveState`, not as world identity truth.

Possible states:
- RECOGNIZED
- LIKELY
- UNCERTAIN
- MISIDENTIFIED
- REJECTED
- UNKNOWN

Supporting/contradicting cues and source events are preserved.

A character can therefore be wrong about who they saw without corrupting world identity.

---

# 7. Disguise / apparent identity

A disguise or illusion may expose an `ApparentIdentityProfile` containing only cues altered by valid world mechanics.

It never changes true `characterId` by itself.

Recognition outcome may depend on:
- observer familiarity
- visible cues
- distance/viewpoint/lighting
- behavior/voice evidence supplied by other modalities
- signature items
- contextual expectation
- disguise/world-module quality

No automatic omniscient recognition.

---

# 8. Forms and transformations

Where needed, world/gameplay modules may define a sparse form graph or transformation schema.

Visual architecture prefers delta-based forms over full duplicated character records.

A form may alter:
- visible physical/species cues
- silhouette
- hair/eyes/energy motifs where world-defined
- equipment compatibility
- presentation compatibility
- relevant anchors

Reversion reconstructs from authoritative base + event history, not model memory.

---

# 9. Temporal appearance / epochs

Appearance changes over long timelines are queried from normal event history.

A derived `AppearanceEpoch` view can represent intervals such as:
- pre/post transformation
- old/new uniform period
- age/time-stage period
- branch redesign interval

Generation binds world time + branch so future visual states do not leak into earlier scenes.

---

# 10. ReferenceArtifact and VisualAnchorSet

Reference bytes are not copied into a second visual database.

`ReferenceArtifact` metadata may bind:
- artifact/source ref
- subject/entity
- semantic roles
- supported visual fields
- source/evidence role
- generation-reference role
- branch/continuity/time compatibility
- user approval scope
- visual-state version compatibility

`VisualAnchorSet` is a derived indexed selection over these artifacts.

Possible anchor roles:
- front/profile/three-quarter/back
- full-body/silhouette
- neutral/expression references
- outfit variant
- form/transformation
- distinctive accessory/detail

The compiler selects only a bounded relevant subset.

---

# 11. VisualCoverageMap

Derived diagnostic, never authority.

It reports coverage for important dimensions such as:
- multi-view identity
- full-body/silhouette
- current/alternate outfit
- form variants
- expressions
- distinctive details

It can warn that a requested angle/form has weak reference coverage and therefore higher drift risk.

RPG play is never blocked by weak coverage.

---

# 12. CharacterVisualCapsule

Disposable compiled view for one render/perception need:
- character id
- visual-state version
- stable required traits
- current presentation
- current form
- temporary condition
- visibility/concealment
- target pose/expression/action if relevant
- selected reference refs
- locked facts
- allowed render freedom
- unknown/gap markers

It prevents full CharacterState/world history from being dumped into media prompts.

---

# 13. Style is separate from identity

`WorldVisualStyleProfile` belongs to presentation/world media policy.

It may describe medium/render/camera/color-language tendencies.

Changing from illustration to comic panel to 3D-like frame to video must not create a character appearance revision.

---

# 14. VisualSceneContract

Optional image/video/storyboard generation begins with a provider-neutral `VisualSceneContract` compiled from authoritative state.

It binds:
- branch/session/scene/time/location
- visible actors
- per-actor visual capsules
- spatial/role bindings
- required props/equipment
- current environment state needed for continuity
- target action/pose/expression
- camera/framing intent
- locked visual facts
- forbidden contradictions
- render assumptions/gaps
- world style policy
- continuity refs
- requested media mode

Media generation cannot bypass this contract for material RPG scenes.

---

# 15. VisualRenderContract family

One derived family supports modes:
- PORTRAIT
- STILL
- PANEL
- STORYBOARD_SHOT
- VIDEO_SEGMENT

Mode-specific fields add only what is needed, preventing separate permanent subsystems for every media type.

---

# 16. Multi-character binding

Each visible character receives a `VisualRoleBinding` with:
- exact character id
- role/region hint where supported
- visual-state version
- identity/form/outfit anchors
- temporal presence for video where relevant
- identity-confusion constraints

A global cast prompt is insufficient for multi-character continuity.

---

# 17. Continuity hierarchy

Reference priority:

1. current authoritative RPG state
2. authoritative/user-approved/canon source references
3. current scene contract
4. approved continuity references from prior outputs
5. generated prior frames as weak hints
6. text fallback

Prior generated frames never outrank current state.

This limits recursive drift.

---

# 18. Media generation manifest

Each generated artifact may persist a `GenerationManifest` containing:
- contract hash/version
- provider/model/tool revision when known
- relevant generation parameters
- seed when meaningful
- selected anchors/source refs
- render assumptions
- branch/world/state versions
- timestamp
- output ref/hash
- verification verdict

Credentials/secrets are excluded.

This makes regeneration, auditing and provider switching possible.

---

# 19. VisualArtifact metadata

Derived media types:
- portrait
- scene image
- panel
- storyboard
- video segment
- thumbnail/preview

Metadata records:
- represented branch/scene/time
- represented visual-state versions
- generation manifest
- verification result
- user approval/pin state
- cache/storage class

Artifact bytes may be evicted according to storage policy when safe; authoritative world state does not depend on retaining generated pixels.

---

# 20. Visual continuity verification

Generated output is independently checked on separate axes:
- subject identity
- correct form
- outfit/presentation
- equipment/props
- concealment/hidden-detail safety
- multi-character separation
- action/pose semantic adherence
- scene/location constraints
- temporal continuity
- style adherence
- general artifact quality

No universal visual score.

Verdicts:
- PASS
- PASS_WITH_NONMATERIAL_VARIATION
- REGENERATE_RECOMMENDED
- FAIL_STATE_CONTRADICTION
- INCONCLUSIVE

A failed artifact does not rewrite world state.

---

# 21. Locked facts vs render freedom

## Locked
- identity-defining visible facts
- current outfit/form
- required visible equipment
- actor presence
- explicit scene/canon constraints

## Controlled freedom
- small pose nuance
- composition within user/scene intent
- lighting/artistic microdetail
- nonmaterial background detail

## Unknown assumptions
- details necessary for rendering but not established as world/canon truth

This balances continuity and natural visual variation.

---

# 22. Storyboards and images

Image sequence pipeline:

1. resolve/compile scene state
2. compile visual contracts
3. choose bounded anchors
4. generate candidate
5. verify
6. optionally retain approved candidate as weak continuity reference
7. next shot recompiles from authoritative state first

The chain never becomes `previous image -> next image -> next image` without state re-anchoring.

---

# 23. Video

Video uses the same state, with temporal segment fields:
- start/end state
- actor presence intervals
- action trajectory
- expression trajectory when specified
- camera motion intent
- persistent props/environment
- identity anchors
- previous/next segment continuity refs

Long video prefers bounded segments with explicit re-anchoring.

This reflects current research showing that structured content anchors and explicit multi-reference/role controls improve long-duration and multi-subject consistency.

---

# 24. Media provider boundary

RPG does not contain or require a specific generator.

A provider/binding advertises optional capabilities such as:
- text/reference image generation
- editing/inpainting
- pose/layout controls
- multi-reference subject binding
- image-to-video
- reference-to-video
- multi-subject video
- temporal controls

A media router chooses only compatible bindings.

If unavailable, Seven can degrade to:
- text-only RPG
- visual description
- still instead of video
- storyboard/layout without rendered frames
- explicit capability gap

No media provider is required for core play.

---

# 25. Original-character design promotion

For user-owned/original worlds, generated design suggestions may become authoritative only through explicit scoped promotion.

Promotion identifies:
- exact visual fields/detail being accepted
- target character/entity
- branch/world scope
- source artifact/ref
- conflict validation
- typed visual revision event

Approval never promotes every incidental pixel.

---

# 26. Real Works visual boundary

Canon appearance is keyed by:
- work/franchise
- continuity
- adaptation/medium
- source version where relevant
- timeline point
- form/outfit

`CanonVisualBinding` keeps official design facts/anchors source-bound.

Anime/manga/game variants are not silently blended.

A source artifact may have two independent roles:
- evidence for a canon visual claim
- useful generation reference

These roles are not equivalent.

Unsupported visual detail remains `CANON_GAP` even if a renderer repeatedly invents the same answer.

---

# 27. Player discovery and investigation

A visible feature reaches another character/player only through valid perception.

Investigation modules may convert perceived visual projections into evidence/clues, but the visual subsystem itself does not declare guilt/truth.

Examples:
- distinctive accessory
- altered uniform
- visible transformation residue
- apparent identity inconsistency

Perspective and evidence systems retain provenance.

---

# 28. Mobile / Velocity

Hard rules:
- no bundled mandatory image/video model
- no always-on media generation
- no default face embeddings
- no frame-by-frame video storage in RPG state
- no full-resolution media in normal text context
- no eager anchor analysis for every NPC

### Lite
- structured visual state only
- user/manual references as metadata
- no automatic generation required

### Balanced
- requested image generation
- small anchor sets
- lightweight verification where available

### Full
- richer image/storyboard/video routing
- advanced reference selection/verification

All tiers share the same authoritative VisualState.

---

# 29. Visual cache / storage

Phone runtime primarily stores:
- compact typed visual fields
- source/reference pointers
- small thumbnail/cache metadata
- generation manifests
- artifact refs

Large assets follow normal storage/cache policy and may be lazy-loaded/evicted where reconstructable or externally backed.

---

# 30. Required visual gauntlets

## Identity continuity
- 12+ views/poses of same character
- 20+ generated images across scenes
- expression variation without identity drift
- style swap without identity mutation

## Presentation
- outfit persists until valid change
- equipment visibility matches module state
- temporary visual condition clears correctly
- form transitions/reversion preserve correct deltas

## Perspective
- hidden features do not leak
- disguise produces observer-dependent recognition
- misidentification can persist and later correct

## Multi-character
- identities/outfits/props do not swap
- spatial/role binding survives scene change

## Branch/time
- branch-specific outfit/form isolation
- past scene never receives future appearance epoch
- save/reload reconstructs exact material visual state

## Real Works
- adaptation variants remain separate
- unsupported detail remains CANON_GAP
- generated branch variation never relabeled official

## Media
- prior bad frame cannot overwrite state
- provider switch recompiles from state/anchors
- video segment re-anchoring limits drift
- image/video disabled causes no RPG functional regression

## Performance
- 50+ characters with only active subset carrying hot visual capsules
- anchor metadata lazy load
- media cache eviction
- zero background generator sessions

---

# 31. Implementation staging extension

Existing RPG4 stages remain valid. Add visual implementation slices only after architecture refreeze:

- RPG4V-P0 `VisualStateComponent` schemas + visual event subtypes
- RPG4V-P1 Presentation/Form/Visibility + replay/save migration
- RPG4V-P2 Perspective recognition/disguise integration
- RPG4V-P3 ReferenceArtifact/Anchor/Coverage derived layer
- RPG4V-P4 VisualCapsule + VisualSceneContract compiler
- RPG4V-P5 Media provider capability boundary + manifests
- RPG4V-P6 image/still verification
- RPG4V-P7 storyboard/video segment contracts
- RPG4V-P8 Real Works CanonVisualBinding
- RPG4V-P9 mobile/resource + long-horizon visual evals

Architecture completion still does not imply implementation.

---

# 32. Reconciliation verdict

Accepted from Rounds 10–13:
- structured persistent visual identity
- mutable presentation / transient condition / form separation
- perspective-bound recognition and disguise
- source-bound Real Works visual continuity
- semantic multi-view reference anchors
- provider-neutral image/video contracts
- state-first re-anchoring
- artifact manifests and verification
- multi-character role binding
- mobile/lazy media design
- aggressive complexity collapse

Canonical primitive count remains **15**.

## Saturation status

The latest accepted material change is Round 13.

Saturation counter entering independent challengers: **0 / 2**.
