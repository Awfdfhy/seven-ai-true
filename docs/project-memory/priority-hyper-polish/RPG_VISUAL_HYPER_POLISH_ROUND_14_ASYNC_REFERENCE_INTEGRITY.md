# Seven RPG Visual Hyper-Polish — Round 14: Async & Reference Integrity

Status: **INDEPENDENT CROSS-SYSTEM CHALLENGER / PRE-IMPLEMENTATION**
Target: `RPG_4_1_RECONCILED_VISUAL_CANDIDATE.md`

## Round thesis

RPG 4.1 is coherent when references agree and media generation returns immediately. Real integrations are messier: references can represent different variants, world state can change while a render is running, and external tool calls can fail after dispatch.

These are continuity and authority problems, not cosmetic details.

---

# 1. Reference ingestion is not truth import

A reference image enters as a `ReferenceArtifact`.

Vision/parsing may derive candidate observations such as:
- hairstyle/presentation cues
- outfit cues
- visible distinguishing details
- viewpoint
- expression
- possible form/outfit variant

These remain derived observations with source lineage. They do not automatically update `CharacterVisualState`.

---

# 2. Conflicting reference sets

References may differ because they represent:
- alternate outfits
- alternate forms
- different time periods
- different adaptations/continuities
- different styles
- generation mistakes
- unresolved ambiguity

`ReferenceCompatibilityView` may classify relations:
- SAME_VARIANT_COMPATIBLE
- DIFFERENT_OUTFIT
- DIFFERENT_FORM
- DIFFERENT_EPOCH
- DIFFERENT_CONTINUITY
- STYLE_ONLY_DIFFERENCE
- MATERIAL_CONFLICT
- UNKNOWN_RELATION

Seven never averages conflicting references into a synthetic false identity.

---

# 3. Scoped approval

For original/user-owned characters, approval of a generated/reference image is scoped to explicit design fields or variants.

Examples:
- identity features only
- current outfit only
- palette/presentation only
- one complete named visual variant

Incidental background objects or unrequested render details do not become world state.

---

# 4. Anchor eligibility snapshot

Every render request freezes an `AnchorEligibilitySnapshot`:
- selected reference ids
- compatibility verdicts
- visual-state version
- branch/time/form/outfit scope
- evidence/reference roles

A later reference revision cannot silently change the historical meaning of an already-dispatched request.

---

# 5. Async generation base versions

Each generation request binds:
- `baseWorldVersion`
- `baseSceneVersion`
- per-character `visualStateVersion`
- branch
- render-contract hash

When the result returns, Seven checks whether it still matches the target state.

Classifications:
- CURRENT_VALID
- HISTORICAL_VALID
- STALE_PRESENTATION
- STATE_CONTRADICTED
- BRANCH_MISMATCH

A stale artifact can remain linked to its original historical scene, but it cannot silently become the current presentation.

---

# 6. Tool dispatch and cancellation

Media generation uses the existing Tool Fabric / Side-Effect Ledger / Resource Governor rather than inventing a second action system.

Dispatch certainty remains explicit:
- NOT_DISPATCHED
- DISPATCHED
- MAYBE_DISPATCHED

Stopping local waiting does not falsely imply a remote provider stopped after dispatch.

Retry policy follows provider/tool idempotency and effect certainty.

---

# 7. Regeneration semantics

A stored seed does not guarantee identical pixels unless the provider contract proves deterministic reproduction.

`REGENERATE_SAME_CONTRACT` means the same authoritative state and visual constraints, not guaranteed bit-identical output.

---

# 8. Parallel candidates

If multiple visual candidates are produced:
- each has an independent attempt id
- all bind the same immutable render-contract identity
- verification runs independently
- candidate selection does not mutate world state
- rejected candidates remain discardable artifacts

A later explicit design promotion is a separate event.

---

# 9. Provider capability drift

Media provider/model capabilities can change.

The manifest records provider/model revision when known.

Routing uses current capability evidence rather than assuming an older successful capability still exists.

If a binding no longer supports the needed mode, Seven reroutes or degrades honestly.

---

# 10. Project/reference scope

Reference artifacts inherit their project/world access scope.

Derived anchors/crops inherit the same scope. Processing or summarizing a reference never expands its authority or scope.

---

# 11. Cache correctness

Relevant cache identity includes:
- source/reference version
- branch/world scope
- visual-state version
- form/outfit variant
- render-contract/provider revision where material

A cache hit from another branch or old outfit is invalid.

---

# 12. Invalidation

A `VisualRevisionEvent` or source update invalidates incompatible derived data:
- anchor indexes
- coverage maps
- character visual capsules
- stale thumbnails
- continuity hints

Source artifacts themselves are not deleted merely because a derived view becomes stale.

---

# 13. Cross-system gauntlet

1. outfit changes while video generation is running
2. result returns after branch switch
3. provider times out after uncertain dispatch
4. retry happens only when tool semantics allow it
5. two references differ because one is an alternate form
6. two references differ because one is a render mistake
7. only selected visual fields are approved from a generated design
8. a reference source gets a new version
9. old cache cannot reintroduce an outdated outfit
10. provider/model revision changes
11. multiple candidate generations cannot race to mutate state
12. historical artifact remains valid for its original scene while marked stale for the current scene

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Reason: RPG 4.1 needed explicit async base-version validation and stronger reference-ingestion/approval semantics.

Saturation counter remains **0 / 2**.
