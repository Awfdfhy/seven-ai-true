# Seven RPG — Character Visual Identity Research Sweep V1

Status: **RESEARCH INPUT / PRE-IMPLEMENTATION**
Scope: persistent character appearance, image/storyboard/video consistency, recognition/disguise, visual truth and mobile architecture.

## Research conclusion

Current generative-media research strongly supports one architectural lesson for Seven:

> A text description or a single face embedding is not enough to represent a persistent RPG character visually.

Modern systems improve consistency by separating and anchoring multiple classes of visual information: identity, pose/view, clothing/texture, expression, scene/background, temporal continuity and multi-reference role binding.

Seven should not copy one specific generation model. It should own a provider-neutral **visual identity contract** and compile the right references/constraints for whichever image/video tool is available.

---

# 1. High-signal research

## 1.1 CharaConsist — ICCV 2025
Source: https://openaccess.thecvf.com/content/ICCV2025/html/Wang_CharaConsist_Fine-Grained_Consistent_Character_Generation_ICCV_2025_paper.html

Signal:
- character consistency is not just facial ID
- clothing details can drift under large motion changes
- foreground character and background consistency may require separate control

Seven implication:
- do not collapse face, clothing, character state and scene continuity into one opaque `appearancePrompt`
- visual state needs factorized constraints and scope ownership

## 1.2 Multi-focal Conditioned Latent Diffusion — CVPR 2025
Source: https://openaccess.thecvf.com/content/CVPR2025/html/Liu_Multi-focal_Conditioned_Latent_Diffusion_for_Person_Image_Synthesis_CVPR_2025_paper.html

Signal:
- face identity and clothing texture/details benefit from distinct conditioning
- pose change should not imply identity change

Seven implication:
- separate identity anchors from presentation/outfit anchors
- generation compilers should distinguish pose-invariant and pose-dependent attributes

## 1.3 ConsisID — CVPR 2025
Source: https://openaccess.thecvf.com/content/CVPR2025/html/Yuan_Identity-Preserving_Text-to-Video_Generation_by_Frequency_Decomposition_CVPR_2025_paper.html

Signal:
- video identity preservation remains hard
- different identity cues behave differently under pose/motion variation

Seven implication:
- video generation is a derived renderer, never the authority store
- long-running video must repeatedly bind to stable identity anchors rather than recursively trusting prior generated frames

## 1.4 MagicMirror / PersonalVideo / MagicID — ICCV 2025
Sources:
- https://openaccess.thecvf.com/content/ICCV2025/html/Zhang_MagicMirror_ID-Preserved_Video_Generation_in_Video_Diffusion_Transformers_ICCV_2025_paper.html
- https://openaccess.thecvf.com/content/ICCV2025/html/Li_PersonalVideo_High_ID-Fidelity_Video_Customization_without_Dynamic_and_Semantic_Degradation_ICCV_2025_paper.html
- https://openaccess.thecvf.com/content/ICCV2025/html/Li_MagicID_Hybrid_Preference_Optimization_for_ID-Consistent_and_Dynamic-Preserved_Video_Customization_ICCV_2025_paper.html

Signal:
- preserving identity can harm motion/semantic freedom if over-constrained
- visual continuity is a multi-objective problem: identity fidelity, editability, motion naturalness, semantic adherence

Seven implication:
- no single scalar `visualConsistency` should control generation
- Visual Evals must keep identity, outfit/state, pose/motion, semantic correctness and artifact quality as separate axes

## 1.5 Gloria — CVPR 2026
Source: https://openaccess.thecvf.com/content/CVPR2026/html/Yang_Gloria_Consistent_Character_Video_Generation_via_Content_Anchors_CVPR_2026_paper.html

Signal:
- compact structured anchor frames can preserve multi-view appearance and expressive identity over long video
- arbitrary prior frames are weaker than character-centric content anchors
- multiple anchors can conflict if not semantically distinguished

Seven implication:
- introduce a provider-neutral `VisualAnchorSet`
- anchors should carry semantic roles such as front/profile/back/expressions/outfit/form rather than exist as an undifferentiated image pile
- anchors are evidence/reference artifacts, not character truth by themselves

## 1.6 Mv2ID — 2026
Source: https://arxiv.org/abs/2603.21299

Signal:
- single-view references are fragile under large angle changes
- multiple views improve identity but naive multi-reference use can create copy-paste artifacts

Seven implication:
- character visual packs should support multi-view reference coverage
- the compiler should select only anchors relevant to the requested shot rather than injecting every reference indiscriminately

## 1.7 ContextAnyone — 2025
Source: https://arxiv.org/abs/2512.07328

Signal:
- hairstyle, outfit and body-level appearance matter alongside facial identity

Seven implication:
- `VisualIdentity` must be broader than face identity
- outfit and mutable presentation require their own state/version lineage

## 1.8 DreamingComics / DreamShot — CVPR 2026
Sources:
- https://openaccess.thecvf.com/content/CVPR2026/html/Kwon_DreamingComics_A_Story_Visualization_Pipeline_via_Subject_and_Layout_Customized_CVPR_2026_paper.html
- https://openaccess.thecvf.com/content/CVPR2026/html/Huang_DreamShot_Personalized_Storyboard_Synthesis_with_Video_Diffusion_Prior_CVPR_2026_paper.html

Signal:
- story visualization benefits from explicit subject references, layout control, role binding and previous-shot continuity
- multi-character scenes require role/region separation or identities can bleed into each other

Seven implication:
- `VisualSceneContract` should bind each visible actor to a role/region/reference set
- storyboard continuity should use shot lineage rather than regenerate every frame from raw prose

## 1.9 AlcheMinT — CVPR 2026
Source: https://openaccess.thecvf.com/content/CVPR2026/html/Girish_AlcheMinT_Fine-grained_Temporal_Control_for_Multi-Reference_Consistent_Video_Generation_CVPR_2026_paper.html

Signal:
- multi-subject video benefits from explicit temporal subject control

Seven implication:
- scene contracts need subject presence intervals/shot participation rather than one global cast prompt

---

# 2. Architectural lessons for Seven

## L1 — Visual truth must be state-first, renderer-second

A generated image/video is a rendering attempt of authoritative state. It cannot silently add permanent clothing, markings, props, scars, locations or transformations to the world.

## L2 — Identity is factorized

Seven must distinguish at least:
- persistent physical/visual identity
- mutable presentation
- transient visible condition
- transformation/form
- pose/expression
- style/rendering
- environment/lighting

## L3 — References need semantic roles

A bag of reference images is not enough. Anchors require role metadata and lineage.

## L4 — Long-term continuity needs re-anchoring

Do not recursively treat a previous generated frame as the new truth. Drift compounds. Stable character/world state and approved anchors should remain the root.

## L5 — Multi-character scenes require explicit identity binding

Each actor needs a separate identity binding, spatial/role scope and visible-state contract.

## L6 — Visual state and visual knowledge are different

A hidden mark can exist in world state without being visible to another character. Disguise/occlusion/viewpoint affect perception.

## L7 — Style is not identity

Changing render style, camera, lighting or medium must not mutate the character's canonical appearance state.

## L8 — Canon appearance needs source lineage

For Real Works, official appearance facts and reference assets must remain source/continuity bound. Missing detail remains a gap or generated branch choice, not fake canon.

## L9 — Consistency is multi-axis

Required eval axes include:
- identity continuity
- form/body/silhouette continuity
- hair/accessory continuity
- outfit continuity
- equipment/prop continuity
- pose/expression correctness
- multi-character separation
- scene continuity
- state correctness
- temporal consistency
- style adherence
- artifact quality

No universal scalar score.

## L10 — Mobile architecture must not carry media-model weight

Seven's phone runtime should primarily store compact typed state, small reference metadata, thumbnails/cache pointers and generation manifests. Heavy generation belongs to optional local/remote providers and is invoked selectively.

---

# 3. Candidate capability ceiling

A strong Seven visual-character system should eventually support:

- persistent original characters
- player-created characters
- Real Works canon characters
- alternate outfits
- seasonal/contextual outfits
- disguise
- uniforms and role-based presentation
- equipment visibility
- transformations/forms
- aging/time progression where world-defined
- multi-view reference packs
- expression anchors
- portrait generation
- scene stills
- episode/key-art generation
- storyboard sequences
- future short/long video generation
- campaign gallery
- branch-specific appearance history
- player discovery of visual clues
- visual identity recovery after save/reload/provider switch

The architecture should achieve this without making image/video generation mandatory for RPG play.

---

# 4. Research verdict

`MATERIAL_IMPROVEMENT_FOUND`

The visual domain is not a cosmetic add-on. It affects continuity, identity, perception, canon fidelity, multimodal storytelling and future media generation.

RPG 4.0 therefore remains reopened. Saturation counter stays **0 / 2**.
