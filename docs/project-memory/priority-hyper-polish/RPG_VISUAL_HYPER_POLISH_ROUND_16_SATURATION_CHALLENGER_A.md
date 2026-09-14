# Seven RPG Visual Hyper-Polish — Round 16: Saturation Challenger A

Status: **INDEPENDENT SATURATION CHALLENGER A / PRE-IMPLEMENTATION**
Target: `RPG_4_2_RECONCILED_VISUAL_CANDIDATE.md`

## Method

This challenger does not search for extra features first. It attempts to replace RPG 4.2's visual architecture with materially stronger alternatives.

A replacement must beat the current design on at least one meaningful axis without unacceptable losses in truth, provider independence, player agency, Real Works fidelity, mobile cost or implementation feasibility.

---

# Alternative A — Prompt / character-bible architecture

Model:
- one canonical prose description
- current outfit appended to prompts
- previous images reused as references

Advantages:
- very simple
- low schema cost

Failures:
- stable vs mutable traits are conflated
- branch/time/form state becomes fragile
- hidden vs visible information is unclear
- references drift and can overwrite truth
- Real Works source lineage is weak
- generated artifacts tend to become accidental authority
- provider switching is brittle

Verdict: simpler but materially weaker.

---

# Alternative B — Embedding-first identity architecture

Model:
- persistent visual embedding/identity vector is the main character identity representation
- textual/state metadata is secondary

Advantages:
- strong compatibility with some image/video pipelines
- compact runtime representation for supported models

Failures:
- provider/model-specific semantics
- poor explainability and migration across model families
- does not naturally represent outfit/form/canon/branch authority
- embedding cannot express unknown/canon-gap status
- encourages visual similarity to outrank world truth
- stylized/nonhuman/multi-medium identity remains model-dependent

Verdict: valuable optional adapter artifact, not a stronger canonical architecture.

---

# Alternative C — Canonical 3D avatar / mesh-first architecture

Model:
- persistent 3D model becomes the master visual truth
- 2D images/video derive from it

Advantages:
- strong geometry/multi-view consistency
- useful for games with true 3D avatars

Failures:
- huge authoring/runtime burden
- poor fit for abstract, stylized, anime, comic and shape-shifting worlds
- cannot fully represent medium-specific canon design without interpretation
- mobile/storage cost is much larger
- user must acquire/build assets
- provider independence decreases

Verdict: excellent optional world/gameplay/media module for some titles, not the universal RPG core.

RPG 4.2 can host a 3D representation ref as a ReferenceArtifact/extension without architectural replacement.

---

# Alternative D — Anchor-first media graph

Model:
- approved images become the main persistent identity graph
- later media derives mostly from anchor selection

Advantages:
- strong practical visual generation guidance
- naturally supports multi-view references

Failures:
- current outfit/form can diverge from old anchors
- generated artifacts risk authority inflation
- difficult to represent details that are known but not visible in available anchors
- canon gaps and branch state become awkward
- image availability becomes prerequisite for strong character identity

Verdict: anchors are important derived evidence/reference tools, but should not replace typed state.

---

# Alternative E — Separate Visual Engine authority store

Model:
- RPG world state and visual world state are separate persistent engines with synchronization

Advantages:
- visual subsystem autonomy
- specialized schemas possible

Failures:
- duplicated authority
- synchronization races
- migration/save complexity
- more mobile state
- appearance events can disagree with RPG causality
- harder branch/replay semantics

Verdict: rejected. RPG 4.2's component/event integration is stronger.

---

# Current Hybrid under attack

RPG 4.2 uses:
- typed authoritative VisualState components
- normal WorldEvent history
- PerspectiveState for recognition
- optional module ownership for inventory/forms
- source/approval-scoped references
- derived anchors/capsules/contracts
- provider-neutral rendering
- explicit async version checks
- independent media verification

This keeps truth inspectable while allowing modern reference-conditioned generators to exploit strong visual anchors.

Current 2025–2026 generation research does not require Seven to replace this architecture with model-specific latent state. Research instead reinforces the need for explicit reference roles, multi-view/appearance coverage, multi-subject binding and long-range re-anchoring, all represented in RPG 4.2.

---

# Simplification attack

Could CharacterVisualState be collapsed back into free-form CharacterState fields?

No. That would remove explicit lifecycle/provenance/version semantics needed for media continuity.

Could VisualAnchorSet be canonical?

No. Keeping it derived prevents reference availability from becoming truth.

Could GenerationManifest be removed?

No for externally generated artifacts that need audit/reproduction/provider switching; however it remains artifact metadata rather than RPG authority.

Could PresentationPolicy be removed?

Only at the cost of static/inappropriate presentation behavior in living-world campaigns. It remains derived and sparse, so its cost is low.

---

# Mobile assault

No material global startup cost is imposed by the visual architecture:
- VisualState is compact typed data
- references are pointers/metadata
- anchors/capsules are lazy derived views
- image/video providers are optional
- BACKGROUND NPC presentation is not continuously simulated
- media bytes can be cache-tiered

No stronger alternative was found that preserves the same capability ceiling at materially lower core cost.

---

# Challenger A verdict

`NO MATERIAL IMPROVEMENT`

No architecture replacement or deletion survived the Pareto test.

Optional 3D/embedding representations remain extensions/adapters rather than core authority.

Saturation counter: **1 / 2**.
