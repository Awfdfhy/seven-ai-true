# Seven RPG Visual Hyper-Polish — Round 17: Saturation Challenger B

Status: **INDEPENDENT SATURATION CHALLENGER B / PRE-IMPLEMENTATION**
Target: `RPG_4_2_RECONCILED_VISUAL_CANDIDATE.md`
Method: compound failure gauntlet rather than architecture comparison.

## Rule

A scenario only forces a new material improvement if the current architecture cannot represent, recover or fail honestly without adding/restructuring canonical concepts.

---

# Scenario 1 — 30-shot multi-character visual story

Three recurring characters appear across changing camera angles, expressions and locations. Two have intentionally similar hairstyles/colors.

Expected architecture behavior:
- independent CharacterVisualState versions
- per-character VisualRoleBinding
- semantic reference anchors
- state-first recompilation each shot
- multi-character verifier checks identity/outfit separation

Result: representable. No new primitive required.

---

# Scenario 2 — Outfit change during active generation

Shot A is generating. The player changes clothing through a valid world action before the result returns.

Expected:
- request remains bound to old base/visual versions
- returned artifact becomes HISTORICAL_VALID or STALE_PRESENTATION
- it cannot overwrite current PresentationState

Result: handled by Round 14 async integrity.

---

# Scenario 3 — Transformation during video sequence

Character begins in base form, transforms through a valid gameplay event, then later reverts.

Expected:
- transformation module owns mechanics
- VisualState points to correct FormRef/deltas
- segments before/after bind correct state versions
- re-anchoring prevents old-form references from leaking forward

Result: handled.

---

# Scenario 4 — Branch split after visual redesign

Branch A adopts a new outfit/design. Branch B continues from an earlier point.

Expected:
- visual events are branch-scoped
- anchor compatibility includes branch/state version
- cache identity prevents cross-branch reuse

Result: handled.

---

# Scenario 5 — Disguise and observer disagreement

A disguised character is seen by a stranger and by a close companion.

Expected:
- true identity remains world state
- ApparentIdentityProfile changes visible cues
- each observer receives its own PerceptionEvent
- RecognitionHypothesis can differ by familiarity and available cues

Result: handled without global recognition truth.

---

# Scenario 6 — Visual clue in investigation

A visible accessory suggests a suspect identity but is not conclusive.

Expected:
- visual system projects the perceived feature with lineage
- Investigation module decides evidential semantics
- observer belief stays separate from world truth

Result: handled without duplicate clue authority.

---

# Scenario 7 — Conflicting Real Works references

Anime and game adaptations show materially different design variants.

Expected:
- CanonVisualBinding scopes source/continuity/adaptation/time
- ReferenceCompatibilityView identifies different continuity/variant
- renderer selects only compatible references
- no blending into fake universal canon

Result: handled.

---

# Scenario 8 — Canon gap required for rendering

A rear clothing detail is not established by the source but a back-view image is requested.

Expected:
- preserve CANON_GAP
- allow RENDER_ASSUMPTION_EPHEMERAL if renderer requires completion
- generated detail does not become canon

Result: handled.

---

# Scenario 9 — User approves only one part of a generated design

Generated image has desired jacket but unwanted hairstyle.

Expected:
- approval is field/variant scoped
- typed VisualRevisionEvent promotes only the jacket/presentation detail
- unrelated pixels remain non-authoritative

Result: handled.

---

# Scenario 10 — Provider switch

A campaign created images with Provider A, then only Provider B is available.

Expected:
- regenerate from authoritative state + compatible references + provider-neutral contract
- GenerationManifest preserves historical provider identity
- no provider-specific embedding is required as canonical state

Result: handled.

---

# Scenario 11 — Provider result after branch switch

Video dispatched on branch A returns while player is on branch B.

Expected:
- branch/base-version checks classify result BRANCH_MISMATCH for current view
- artifact may remain associated with branch A
- no state mutation

Result: handled.

---

# Scenario 12 — Uncertain external dispatch

Generation request encounters network failure after dispatch uncertainty.

Expected:
- Tool Fabric / Side-Effect Ledger owns dispatch certainty
- no blind retry when effect/idempotency is unknown
- RPG does not invent success/failure

Result: handled by existing Seven cross-system law.

---

# Scenario 13 — Bad generated frame introduces a new accessory

One video segment renders an accessory that does not exist in state.

Expected:
- verifier flags state contradiction/nonmaterial render error
- next segment re-anchors from authoritative state
- artifact cannot promote accessory automatically

Result: handled.

---

# Scenario 14 — Long campaign and cache eviction

Hundreds of images exist. Local cache removes older full-resolution media.

Expected:
- world truth is unaffected
- manifests/refs can remain compact
- reconstructable media may be regenerated when provider/tool availability permits
- archived/historical artifact metadata remains separate from authority

Result: handled.

---

# Scenario 15 — 200 background characters

World contains many NPCs but only a handful are active.

Expected:
- no continuous appearance simulation
- compact visual state only for materialized characters as needed
- contextual presentation reconstructed lazily
- no mandatory anchors/media for background population

Result: handled within mobile constraints.

---

# Scenario 16 — Presentation routine conflict

An NPC's role suggests a uniform, but their character state and current legal circumstances justify refusing it.

Expected:
- PresentationPolicy only proposes affordances
- Character Fast/Deliberative policy may reject proposal
- no forced outfit mutation

Result: agency preserved.

---

# Scenario 17 — Save/reload mid-campaign

App closes after a transformation/outfit change, while derived visual caches are absent.

Expected:
- authoritative state reconstructs from normal events/snapshot
- derived anchors/capsules/caches rebuild lazily
- no dependence on hidden provider session memory

Result: handled.

---

# Scenario 18 — Lite mode, no image/video provider

Expected:
- full RPG character/world mechanics remain usable
- visual state still supports text description, perspective, disguise and continuity
- no generator is required

Result: handled.

---

# Scenario 19 — Style transition

Player requests the same scene as comic panel, painterly illustration and video-like frame.

Expected:
- WorldVisualStyleProfile/render contract changes
- CharacterVisualState does not change
- verifier checks identity/state independently from style

Result: handled.

---

# Scenario 20 — Accessibility / textual fallback

Visual artifact is unavailable or user prefers text-only presentation.

Expected:
- authoritative scene/visual state can compile a textual visual description without needing generated pixels
- accessibility presentation belongs to UX/presentation bridge rather than new RPG authority

Result: no core redesign required.

---

# Scenario 21 — Media provenance bridge

Seven's general Media Provenance Plane may attach provenance metadata/signatures where supported.

Expected:
- GenerationManifest provides RPG-side lineage
- Media Provenance Plane handles media-standard provenance
- no duplicate RPG provenance engine

Result: bridge requirement, not a new visual primitive.

---

# Scenario 22 — Dynamic provider capability limits

Requested multi-character video exceeds currently available provider capabilities.

Expected:
- router detects mismatch
- degrade to shorter segments/storyboard/still/text or another compatible binding
- state remains unchanged

Result: handled.

---

# Failure hunt verdict

No tested scenario required:
- a sixteenth canonical RPG primitive
- a separate visual truth database
- a provider-specific identity store
- frame-by-frame authoritative history
- mandatory 3D assets
- always-on image/video generation

Remaining work is implementation, provider integration, UX and empirical eval tuning rather than an uncovered architecture class.

## Challenger B verdict

`NO MATERIAL IMPROVEMENT`

No unresolved critical visual-continuity failure was found that requires architecture change.

Saturation counter: **2 / 2**.

The Visual Identity reopen is eligible for Saturation Freeze, subject to final reconciliation/integrity verification.
