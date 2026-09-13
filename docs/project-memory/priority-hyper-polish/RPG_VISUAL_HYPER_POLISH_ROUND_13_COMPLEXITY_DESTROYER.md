# Seven RPG Visual Hyper-Polish — Round 13: Complexity Destroyer

Status: **CHALLENGER / SIMPLIFICATION PASS / PRE-IMPLEMENTATION**

## Mission

Rounds 10–12 found real value, but a visual system can easily become a parallel game engine with dozens of objects.

This pass asks:

> Which concepts need independent persistence/authority, and which should be components, event subtypes, derived views or provider contracts?

The goal is maximum visual continuity per unit of complexity.

---

# 1. Candidate overengineering found

Potential duplication:
- WardrobeState could duplicate Inventory/Equipment module truth.
- VisualFormGraph could duplicate transformation/gameplay module rules.
- Recognition system could duplicate PerspectiveState.
- AppearanceEpoch could duplicate event history/time queries.
- VisualClue could duplicate Investigation evidence projections.
- ShotPlan/ContinuityContext/VisualCheckpoint could become three overlapping media-controller stores.
- VisualAnchorSet could be mistaken for authority instead of an index/view over source artifacts.

### Verdict

Collapse aggressively.

---

# 2. Minimal visual backbone

No sixteenth RPG top-level primitive is required.

The accepted visual architecture fits inside the existing 15-family RPG backbone using four structural categories:

## V1 — `VisualStateComponent`
Versioned component under `CharacterState` / relevant `WorldEntity`.

Owns only current material visual facts and refs:
- IdentityVisualCore
- PresentationState
- VisibleConditionState
- active FormRef / sparse form deltas where owned here
- visibility/concealment flags where material

It does not own camera, art style, render history or observer belief.

## V2 — typed visual `WorldEvent` subtypes
Own material changes:
- appearance revision
- outfit/presentation change
- condition change
- form/transformation transition
- disguise transition
- user-approved visual design promotion

No separate appearance ledger is needed because the normal WorldEvent ledger already exists.

## V3 — derived visual reference/index layer
Includes:
- VisualAnchorSet
- VisualCoverageMap
- AppearanceEpoch view
- CharacterVisualCapsule
- continuity reference selection

These are rebuildable from state, sources and artifacts.

## V4 — derived media contract/artifact layer
Includes:
- VisualSceneContract
- shot/segment plan
- role bindings
- continuity context
- GenerationManifest
- VisualArtifact metadata
- verification result

These may be persisted for audit/cache/reproduction but never outrank RPG state.

---

# 3. Wardrobe collapse

Do not create a second authoritative wardrobe inventory.

Where Inventory/Equipment module exists:
- it owns possession/equipment truth
- VisualState references presentation-relevant item/equipment refs
- `OutfitAssembly` is a derived or world-pack recipe/view

Where the world does not enable detailed inventory:
- PresentationState may directly own coarse outfit identity/version

Thus Seven supports both lightweight narrative worlds and equipment-heavy RPGs without duplicate stores.

---

# 4. Form collapse

Transformation mechanics belong to the responsible world/gameplay module.

Visual layer owns only:
- current visual form reference
- visual deltas/anchors needed for rendering
- provenance and compatibility

A `VisualFormGraph` is optional derived/module schema, not a universal core object.

---

# 5. Recognition collapse

Recognition stays inside PerspectiveState.

`RecognitionHypothesis` is a perspective entry type/view, not a new canonical subsystem.

Visual system supplies observable cues.
Perspective/appraisal system owns what the observer concludes.

---

# 6. Visual clue collapse

Investigation module owns evidence semantics.

Visual system can project a perceived visual feature with exact provenance.
Investigation may promote that projection into a clue/evidence object according to its own rules.

No duplicate clue store.

---

# 7. Media controller collapse

Use one parent `VisualRenderContract` family with modes:
- PORTRAIT
- STILL
- PANEL
- STORYBOARD_SHOT
- VIDEO_SEGMENT

Mode-specific fields cover shot planning, continuity and temporal constraints.

`VisualSceneContract` becomes the RPG-facing compiled view; provider adapters may transform it into provider-specific requests.

Avoid a permanent object for every intermediate planning concept.

---

# 8. Reference semantics

`VisualAnchorSet` is an indexed view over `ReferenceArtifact` metadata.

ReferenceArtifact metadata records:
- artifact/source ref
- subject/entity
- semantic roles
- visual-state compatibility
- source authority role
- generation-reference role
- branch/continuity/time scope
- user approval scope

One artifact may support multiple roles.

There is no second copied image store.

---

# 9. Style collapse

`WorldVisualStyleProfile` belongs to world/media presentation configuration, not CharacterState.

Character-specific style exceptions are presentation policy only.

Changing style cannot create a CharacterRevisionEvent.

---

# 10. Render assumptions

Do not store every generated microdetail.

Uncommitted renderer fills remain in `GenerationManifest.renderAssumptions` only when useful for audit/continuity.

A material detail enters world state only through explicit promotion/change event.

This keeps the event ledger clean.

---

# 11. Storage budget

Per character baseline should remain small:
- sparse typed visual fields
- item/form refs
- source/reference ids
- small compatibility metadata

No default:
- face embedding
- body mesh
- dense landmark history
- every generated frame
- every outfit permutation
- every expression image

Heavy assets are optional references in storage/cache tiers.

---

# 12. Mobile degradation

### Lite
- text/state visual identity only
- no automatic anchor analysis
- no media generation
- manual/user-provided references supported as metadata

### Balanced
- image generation when requested
- small approved anchor sets
- basic verification

### Full
- richer anchor selection
- storyboards/video provider routing
- advanced multimodal verification when available

Same authoritative VisualState across all tiers.

---

# 13. Complexity proof

Accepted visual depth does **not** increase the RPG canonical primitive count.

The 15 primitive families remain intact.

Visual identity is represented through:
- existing CharacterState/WorldEntity components
- existing WorldEvent family
- existing PerspectiveState
- optional GameplayModule ownership
- derived contracts/artifacts/indexes

This is materially simpler than introducing a separate visual database/runtime while preserving the user-facing capability ceiling.

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Reason: simplification reduces duplicated authority, save/migration burden and mobile state cost while retaining all accepted visual capabilities.

Saturation counter remains **0 / 2**.
