# Seven RPG 4.2 — Reconciled Visual Identity Candidate

Status: **PRE-IMPLEMENTATION / SATURATION TEST TARGET / NOT YET REFROZEN**
Base: `RPG_4_0_RECONCILED_CANDIDATE.md`
Supersedes visual target: `RPG_4_1_RECONCILED_VISUAL_CANDIDATE.md`
Incorporates accepted Visual Hyper-Polish Rounds 10–15.

## Prime law

> Seven RPG is a character-centered causal living-world engine. Models and media generators may interpret, narrate, visualize and propose; authoritative world state, player agency, character perspective, mechanics, visual identity and consequences remain governed by typed state, validated events and explicit transaction boundaries.

Generated pixels are representation, not truth.

---

# 1. RPG 4.0 remains intact

All RPG 4.0 causal, psychological, social, scheduler, agency, quest, gameplay-module, branch, save/replay and Real Works laws remain in force unless explicitly strengthened here.

The canonical top-level primitive count remains **15**.

Visual identity is integrated through:
- `CharacterState` / `WorldEntity` versioned visual components
- typed visual `WorldEvent` subtypes
- `PerspectiveState` recognition entries
- existing GameplayModule ownership where appropriate
- derived reference/index/contract/artifact layers

No separate visual authority database is introduced.

---

# 2. CharacterVisualState component

Sparse material visual state is factorized into:

## IdentityVisualCore
Slow/stable visual identity facts where known and world-relevant.

## PresentationState
Current hairstyle/presentation, outfit, accessories, role uniform and visible equipment/props.

## VisibleConditionState
Temporary event/environment-derived visual state.

## FormRef / visual form deltas
Current transformation/form presentation, while transformation mechanics remain owned by the responsible world/gameplay module.

## Visibility / concealment
Material hidden, covered, disguised or occluded cues required for perception/rendering.

A pose/expression target is normally scene/render state rather than durable identity state.

---

# 3. Visual events and history

Material changes are ordinary typed WorldEvent subtypes under RootActionTransaction and branch scope.

Examples:
- appearance revision
- presentation/outfit change
- accessory/equipment presentation change
- visible condition apply/clear
- form/transformation transition
- disguise transition
- time-stage change
- original-world visual design promotion

No separate appearance ledger exists. Historical appearance is reconstructed/queryable from normal event history and snapshots.

---

# 4. Visual provenance and gaps

Material visual fields retain origin semantics:
- WORLD_DEFINED
- USER_DEFINED
- CANON_SOURCE_SUPPORTED
- BRANCH_EVENT_DERIVED
- GENERATED_PROPOSAL
- UNKNOWN

Renderer-only gaps are classified separately:
- RENDER_ASSUMPTION_EPHEMERAL
- BRANCH_VISUAL_CHOICE
- CANON_GAP

Repeated model agreement never promotes authority.

---

# 5. Inventory / wardrobe boundary

There is no duplicate authoritative wardrobe store.

If Inventory/Equipment is enabled, it owns possession/equipment truth and PresentationState references relevant item refs.

For lightweight narrative worlds without detailed inventory, PresentationState may own a coarse named outfit/presentation variant according to world-pack rules.

`OutfitAssembly` may exist as a derived/world-pack recipe.

---

# 6. Dynamic PresentationPolicy

A lightweight derived/world-pack `PresentationPolicy` helps Character FastPolicy propose context-appropriate presentation actions.

Inputs may include:
- role/duty
- place/context
- weather/environment
- ceremony/event type
- travel/combat/work/rest
- organization uniform rules
- available items or coarse wardrobe access
- world/cultural presentation grammar
- character preferences/values
- disguise/stealth need
- form compatibility

It cannot mutate state itself.

A derived `PresentationAffordance` identifies legal choices such as keep current presentation, change outfit, equip/remove visible gear, adopt valid uniform, or apply a supported disguise.

---

# 7. Presentation personality without stereotypes

Sparse `PresentationPreferenceProfile` can influence character choices, for example:
- practical vs ornamental tendency
- formality tolerance
- signature-item attachment
- uniform compliance
- blend-in vs stand-out preference
- familiar-repeat vs variety tendency

These are character tendencies, not attractiveness/body judgments.

World packs may define cultural/faction/role presentation grammars without flattening every member into one appearance.

---

# 8. Signature visual cues

Optional `SignatureVisualCue`s may identify recurring high-value motifs such as:
- accessory
- emblem
- hairstyle preference
- color tendency
- silhouette motif
- characteristic equipment presentation

Each cue is contextual and removable by valid state events; it is not a permanent catchphrase-in-clothing.

---

# 9. Perspective and recognition

Visual truth remains separate from observer belief.

Pipeline:
`CharacterVisualState -> visibility projection -> PerceptionEvent -> interpretation/appraisal -> PerspectiveState`

`RecognitionHypothesis` lives inside PerspectiveState and may be:
- RECOGNIZED
- LIKELY
- UNCERTAIN
- MISIDENTIFIED
- REJECTED
- UNKNOWN

It preserves perceived cues and source events.

An observer may be wrong without world identity changing.

---

# 10. Disguise and apparent identity

Valid disguise/illusion mechanics can expose a temporary `ApparentIdentityProfile` containing only modified observable cues.

True `characterId` is unchanged unless world rules define a real identity/form transformation.

Recognition may use appearance plus optional evidence supplied by other systems, such as voice or movement. No always-on biometric/recognition subsystem is required.

---

# 11. Forms / transformations

The responsible world/gameplay module owns transformation rules.

Visual state keeps only current `FormRef`, necessary deltas, anchors and compatibility.

Delta-based forms are preferred to copying a full character record.

Outfit/equipment compatibility resolves through explicit module/world rules rather than narrator guesses.

---

# 12. Temporal appearance

Derived `AppearanceEpoch` views query event history to bind the correct visual period by time/branch.

Future forms/outfits cannot leak into earlier scenes.

---

# 13. Real Works visual truth

`CanonVisualBinding` is source-bound by dimensions such as:
- work/franchise
- continuity
- adaptation/medium
- source version where relevant
- timeline point
- form/outfit

Anime/manga/game variants are not silently blended.

Source artifacts have independent roles:
- evidence for canon appearance claims
- practical generation references

A useful image reference is not automatically canon evidence, and textual canon evidence need not be a useful render anchor.

---

# 14. ReferenceArtifact ingestion

A reference enters as a source artifact first.

Vision/parsing can produce derived observations, but these do not update CharacterVisualState automatically.

Multiple references may be classified by a derived `ReferenceCompatibilityView`:
- SAME_VARIANT_COMPATIBLE
- DIFFERENT_OUTFIT
- DIFFERENT_FORM
- DIFFERENT_EPOCH
- DIFFERENT_CONTINUITY
- STYLE_ONLY_DIFFERENCE
- MATERIAL_CONFLICT
- UNKNOWN_RELATION

Seven never averages contradictory references into fake truth.

---

# 15. Scoped visual approval

For original/user-owned worlds, approving a reference/generated design is field/variant scoped.

Examples:
- identity features only
- outfit only
- palette/presentation only
- one named complete variant

Incidental pixels do not become state.

Promotion requires a typed visual revision event with source lineage and conflict checks.

Real Works generated detail can become branch design, never unsupported official canon.

---

# 16. VisualAnchorSet and coverage

`VisualAnchorSet` is a derived indexed selection over ReferenceArtifact metadata.

Semantic anchor roles may include:
- front/profile/three-quarter/back
- full-body/silhouette
- neutral/expression
- outfit variant
- form variant
- distinctive detail

`VisualCoverageMap` reports where reference coverage is weak.

The compiler selects a bounded relevant subset rather than every anchor.

---

# 17. Anchor validity

Anchor compatibility includes:
- branch
- world/scene time
- visual-state version
- form
- outfit/presentation
- canon continuity/adaptation
- source/reference version
- approval scope

A stale but attractive anchor cannot override current state.

Each render freezes an `AnchorEligibilitySnapshot` so later reference revisions do not rewrite the meaning of an already-dispatched request.

---

# 18. CharacterVisualCapsule

Disposable compiled render/perception view:
- character id
- visual-state version
- required stable visible traits
- presentation
- form
- temporary condition
- visibility/concealment
- target pose/expression/action when relevant
- selected references
- locked facts
- allowed render freedom
- unknown/gap markers

No full character/world history dump is required.

---

# 19. Style separation

`WorldVisualStyleProfile` is presentation/media policy, not identity state.

Changing illustration/comic/3D-like/video style cannot create a visual identity revision.

---

# 20. VisualSceneContract / VisualRenderContract

All optional media generation starts from a provider-neutral compiled contract.

Modes:
- PORTRAIT
- STILL
- PANEL
- STORYBOARD_SHOT
- VIDEO_SEGMENT

Contract data may include:
- branch/session/scene/time/location
- visible actors
- per-actor visual capsules
- per-actor role/spatial binding
- required visible props/equipment
- environment facts needed for continuity
- target action/pose/expression
- camera/framing intent
- locked facts
- forbidden contradictions
- render assumptions/gaps
- visual style policy
- continuity refs

---

# 21. Multi-character binding

Each visible subject receives an explicit `VisualRoleBinding` with its own character id, state version, form/outfit references and scene role/region hints where supported.

For video, binding may include temporal presence intervals.

This reduces identity/outfit/attribute swapping.

---

# 22. Continuity priority

`Authoritative RPG state`
> `source/user-approved compatible references`
> `current scene contract`
> `approved continuity hints`
> `prior generated frames`
> `text fallback`

Prior generated frames are weak continuity hints, never new truth.

---

# 23. Async generation integrity

Every generation request binds:
- `baseWorldVersion`
- `baseSceneVersion`
- per-character `visualStateVersion`
- branch
- render-contract hash
- `AnchorEligibilitySnapshot`

Returning results are classified:
- CURRENT_VALID
- HISTORICAL_VALID
- STALE_PRESENTATION
- STATE_CONTRADICTED
- BRANCH_MISMATCH

A historical artifact can remain attached to its original scene while being rejected as current presentation.

---

# 24. Tool / Side-Effect integration

Media generation uses Seven's existing Tool Fabric, Side-Effect Ledger and Resource Governor.

Dispatch certainty remains explicit:
- NOT_DISPATCHED
- DISPATCHED
- MAYBE_DISPATCHED

Cancellation of local waiting does not falsely imply the remote operation stopped after dispatch.

Retry follows tool/provider idempotency/effect knowledge.

---

# 25. GenerationManifest and artifact metadata

Each visual artifact may record:
- immutable render-contract identity
- provider/model/tool revision when known
- relevant generation parameters
- seed when meaningful
- selected reference ids
- render assumptions
- state/branch versions
- attempt id
- timestamp
- output ref/hash
- verification verdict

`REGENERATE_SAME_CONTRACT` promises the same state/constraints, not identical pixels unless provider determinism is proven.

Parallel candidates share contract identity but have independent attempts.

---

# 26. Visual continuity verification

Evaluate separate axes:
- character identity continuity
- current form
- outfit/presentation
- equipment/props
- concealment/hidden-detail safety
- multi-character separation
- semantic pose/action match
- scene/location constraints
- temporal continuity
- style adherence
- artifact quality

Verdicts:
- PASS
- PASS_WITH_NONMATERIAL_VARIATION
- REGENERATE_RECOMMENDED
- FAIL_STATE_CONTRADICTION
- INCONCLUSIVE

No universal visual score.

---

# 27. Images, storyboards and video

Each shot/segment recompiles from authoritative state first.

Prior approved media can help continuity but never becomes the master state.

Long video prefers bounded segments with re-anchoring at segment boundaries.

Video contracts may include start/end visual state, subject presence intervals, action/expression trajectories, camera intent, persistent props/environment and selected identity anchors.

---

# 28. Provider capability boundary

RPG never requires a specific media model/provider.

Bindings advertise capabilities such as reference generation, editing, layout/pose controls, multi-reference binding, image-to-video, reference-to-video, multi-subject support and temporal control.

If no provider satisfies the contract, Seven degrades honestly to text, description, still, storyboard planning or explicit capability gap.

Core RPG remains playable without media generation.

---

# 29. Cache and invalidation

Relevant cache identity includes source/ref version, branch/world scope, visual-state version, form/outfit, contract/provider revision where material.

Visual revisions/source updates invalidate incompatible derived:
- anchor indexes
- coverage maps
- visual capsules
- thumbnails
- continuity hints

Authoritative source artifacts are not deleted simply because derived data is stale.

---

# 30. Background NPC cost

BACKGROUND actors do not run continuous appearance simulation.

When promoted/materialized, current presentation is reconstructed from last material state + elapsed material events + role/location/context + valid wardrobe/inventory abstraction.

Presentation updates occur only when materially needed.

---

# 31. Visual evaluation portfolio

Mandatory tracks include:

## Identity
- 12+ views/poses
- 20+ scene images
- expression variation
- style changes

## Presentation
- outfit persistence/change validity
- equipment visibility
- temporary-condition lifecycle
- form delta/reversion
- contextual presentation behavior

## Perspective
- hidden detail isolation
- familiar/unfamiliar disguise outcomes
- misidentification/correction

## Multi-character
- no subject identity/outfit swaps
- role binding over adjacent shots/video segments

## Branch/time
- branch isolation
- no future-appearance leak
- exact save/reload material state
- stale async result handling

## Real Works
- adaptation separation
- CANON_GAP preservation
- generated branch variation not relabeled official

## References
- conflicting variants remain explicit
- scoped approval
- stale anchor invalidation

## Media
- bad prior frame does not contaminate world truth
- provider switch reconstitutes from state/references
- long-video segment re-anchoring
- parallel candidates cannot mutate state
- media disabled causes no functional regression

## Mobile
- compact per-character visual state
- lazy anchor metadata
- media cache eviction
- zero always-on generator sessions

---

# 32. Implementation staging extension

After refreeze only:
- RPG4V-P0 visual schemas/event subtypes
- RPG4V-P1 presentation/form/visibility/replay
- RPG4V-P2 recognition/disguise/perspective
- RPG4V-P3 dynamic PresentationPolicy
- RPG4V-P4 reference ingestion/compatibility/approval
- RPG4V-P5 anchor/coverage/capsule compiler
- RPG4V-P6 render contracts + async base-version handling
- RPG4V-P7 Tool/Effect/Resource bridge + manifests
- RPG4V-P8 image verification/storyboard
- RPG4V-P9 video segment contracts/re-anchoring
- RPG4V-P10 Real Works CanonVisualBinding + long-horizon/mobile evals

---

# 33. Reconciliation status

Visual Rounds 10–15 each found material improvement.

The latest accepted material improvement is Round 15.

RPG 4.2 is the reconciled target for new independent saturation challengers.

Saturation counter: **0 / 2**.
