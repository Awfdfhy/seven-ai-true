# Seven RPG Visual Hyper-Polish — Round 11: Image / Video Continuity

Status: **CHALLENGER ROUND / PRE-IMPLEMENTATION**
Target: visual architecture after Round 10.

## Round thesis

Even perfect structured appearance state can still produce inconsistent images/video if every shot is generated independently from prose.

Seven therefore needs a governed bridge between authoritative RPG state and optional media providers.

The bridge must preserve continuity without turning generated pixels into authority.

---

# 1. Media is derived output

Canonical rule:

> A rendered image, storyboard panel or video clip is a derived artifact of a particular world/branch/scene state and render contract.

Media artifacts cannot silently mutate:
- character identity
- outfit
- equipment
- transformation
- location
- relationship
- world fact
- canon status

If a rendered artifact contains a contradiction, the artifact is wrong; the world is not rewritten to match it.

---

# 2. VisualSceneContract

Every generation request compiles a provider-neutral `VisualSceneContract`.

Fields may include:
- world/session/branch refs
- scene/time/location refs
- visible actor ids
- per-actor `CharacterVisualCapsule`
- actor spatial/role bindings
- current outfit/form/condition
- visible props/equipment
- environment state needed for continuity
- action/pose/expression target
- camera/framing intent
- lighting/time-of-day constraints where material
- world visual-style profile
- required/forbidden visual facts
- canonical gaps/render assumptions
- continuity refs from prior approved shots
- generation purpose: portrait / scene still / key art / storyboard / video
- provider capability requirements

It contains only what the renderer needs.

---

# 3. ShotPlan

Long visual storytelling should decompose into shots rather than one giant prompt.

`ShotPlan` is a derived controller object:
- shot id/order
- participants
- temporal interval
- camera/framing intent
- actor actions
- entry/exit state
- continuity dependencies
- dialogue/action beat refs if relevant
- target duration for video
- transition relation

A ShotPlan cannot alter world events. It only visualizes already-resolved or explicitly staged narrative content.

---

# 4. Actor binding in multi-character scenes

Each visible character receives an explicit `VisualRoleBinding`:
- character id
- semantic role label
- region/spatial hint where provider supports it
- current visual-state version
- selected identity anchors
- current outfit/form anchors
- negative identity-confusion constraints

This reduces identity swapping/attribute bleed in multi-character generations.

The role binding is more important than a global cast paragraph.

---

# 5. ContinuityContext

`ContinuityContext` links adjacent visual artifacts but does not make the previous artifact authoritative.

It can carry:
- previous shot/frame refs
- previous camera relation
- actor positions
- pose/action continuation
- current outfit/form versions
- persistent props
- environment continuity cues
- visual anchor subset

Priority order remains:

`Authoritative State > Approved Source/Anchor > Current Scene Contract > Prior Generated Artifact`

If a previous frame conflicts with current state, it is excluded or masked rather than copied forward.

---

# 6. Anchor selection policy

Do not inject every reference into every request.

`AnchorSelector` chooses a bounded subset by:
- actor
- current form
- current outfit
- desired view
- expression/action
- source authority
- recency/validity
- provider limits

This responds to the multi-reference conflict problem observed in current research.

The selector is deterministic/heuristic by default and may use local similarity/reranking selectively.

---

# 7. GenerationManifest

Every generated visual artifact records a reconstructable `GenerationManifest`:
- contract hash/version
- provider/model/revision when known
- tool/binding version
- generation parameters relevant to reproducibility
- seed when supplied/meaningful
- selected anchor refs
- source artifact refs
- render assumptions
- branch/world versions
- timestamp
- output hash/ref
- verification result

Secrets/credentials are never stored in the manifest.

The manifest supports audit, regeneration and provider switching.

---

# 8. VisualArtifact

Derived media metadata:
- artifact id
- type: portrait / image / panel / storyboard / video / thumbnail
- branch/session association
- represented scene/time range
- represented character visual-state versions
- generation manifest
- verification verdict
- user approval/pin state
- cache/storage class

Artifact bytes may live in local/provider storage; RPG state stores refs/metadata only.

---

# 9. Output verification

A generated artifact is not accepted merely because generation succeeded.

`VisualContinuityVerifier` evaluates independent dimensions:
- correct characters present
- character identity continuity
- current outfit/presentation
- correct form/transformation
- visible equipment/props
- forbidden/hidden facts not exposed
- multi-character separation
- location/background constraints
- action/pose semantic match
- temporal/shot continuity
- style profile adherence

Verdicts:
- `PASS`
- `PASS_WITH_NONMATERIAL_VARIATION`
- `REGENERATE_RECOMMENDED`
- `FAIL_STATE_CONTRADICTION`
- `INCONCLUSIVE`

Verification cannot promote pixels into world truth.

---

# 10. Render freedom vs locked facts

The compiler separates:

## Locked facts
Must match state/source:
- identity-defining visible traits
- current outfit/form
- required equipment
- scene participants
- explicit location/time constraints
- canon-protected visual facts

## Controlled freedom
May vary:
- small pose nuances
- camera composition within request
- nonmaterial folds/lighting texture
- background extras not promoted to world truth
- artistic microdetail

## Unknown/render assumptions
Needed by renderer but not established as truth.

This prevents both brittle overconstraint and uncontrolled visual hallucination.

---

# 11. Image sequence continuity

For portraits/storyboards/comics:

1. compile scene/shot state
2. select anchors
3. generate candidate
4. verify
5. retain approved candidate as continuity hint
6. next shot recompiles from authoritative state first

Previous image is context, never the master state.

---

# 12. Video continuity

Video uses the same truth model but adds temporal planning.

`VideoSegmentContract` may include:
- segment time span
- participating actors
- start/end visual state
- action trajectory
- expression trajectory if specified
- camera motion intent
- persistent environment/prop constraints
- identity anchor set
- previous/next segment continuity refs

For long video, Seven prefers bounded segments with re-anchoring rather than one uncontrolled generation request.

Research such as Gloria supports compact structured content anchors for long-duration appearance consistency; Seven generalizes the principle without depending on a single video model.

---

# 13. Video state checkpoints

At segment boundaries, compile a `VisualCheckpoint` from authoritative RPG state plus committed scene facts.

The checkpoint is not copied from generated video alone.

If a video invents a visual detail during segment N, segment N+1 does not automatically inherit it unless:
- it was already authoritative,
- it is presentation-only continuity,
- or the user/world explicitly promotes it via a valid visual-state event.

---

# 14. Provider independence

RPG never hardcodes a specific image/video provider.

A media provider advertises capabilities such as:
- text-to-image
- reference-to-image
- inpainting/editing
- multi-reference subject binding
- pose/layout control
- image-to-video
- reference-to-video
- multi-subject video
- temporal controls
- maximum references/resolution/duration

`MediaCapabilityRouter` selects a compatible binding.

If no provider can satisfy the contract, Seven degrades honestly:
- produce storyboard text/layout only
- generate still instead of video
- omit optional visual output
- report capability gap

RPG play never blocks on media generation.

---

# 15. Regeneration and editing

User may request:
- regenerate same scene
- change camera/style only
- change outfit through world action
- edit presentation artifact without changing world
- adopt a generated visual variant into original-world canon

The system distinguishes these operations.

`RenderEdit` modifies a derived artifact.
`WorldAppearanceChange` modifies authoritative state.

They are never conflated.

---

# 16. Media promotion rule

For original/user-owned worlds only, the user may explicitly say that a generated visual detail is now part of the character/world.

Promotion requires:
- identify the exact detail
- identify target entity/state field
- branch/world scope
- provenance to source artifact
- conflict validation
- typed appearance/world event

For Real Works official canon, user approval can define a branch adaptation but cannot relabel unsupported detail as official canon.

---

# 17. Mobile / resource discipline

Phone baseline stores:
- structured VisualState
- small thumbnails where useful
- anchor metadata/pointers
- artifact manifests
- compact continuity metadata

Heavy image/video bytes use normal cache/storage tiers and can be evicted if reconstructable or externally stored.

No background image/video generation.
No model loaded merely because RPG exists.
No full-resolution media inserted into every context.
No frame-by-frame video analysis unless explicitly needed.

Generation is user-triggered or high-value feature-triggered under Resource Governor policy.

---

# 18. Failure gauntlet additions

1. 20-image campaign with same character across outfits/angles
2. two visually similar characters in one scene remain separate
3. outfit state change propagates after event, not before
4. prior bad frame does not contaminate future state
5. provider switch preserves visual contract
6. video segment re-anchoring prevents accumulated identity drift
7. branch-specific transformation never leaks to other branch
8. hidden feature is not rendered when current visibility says concealed
9. Real Works adaptation variants remain distinct
10. image/video disabled produces no RPG functional regression
11. generated prop not in state does not become persistent next scene
12. regenerate same scene can vary composition without changing locked facts

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter remains **0 / 2**.
