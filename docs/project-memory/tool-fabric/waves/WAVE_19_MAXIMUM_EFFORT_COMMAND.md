# Seven Tool Fabric 2.0 — Wave 19 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: provider-neutral generative image/media capability, image generation and generative editing.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 19

Goal: close Seven's remaining P1 gap by designing a provider-neutral generative media plane, focused first on image generation/editing, without bundling huge models into the base APK or making one vendor's image API canonical.

Research current official provider/model/runtime documentation first. Evaluate local, host and remote paths separately.

Research at minimum:
- text-to-image
- reference/image-conditioned generation
- generative editing/inpainting/outpainting/masking
- multiple image inputs/references where supported
- output size/aspect/quality/format controls
- transparency/background controls where supported
- seed/reproducibility limits
- model/provider/version identity
- prompt transformation/revision behavior
- output metadata/provenance/watermark/content-credential mechanisms
- safety/moderation result states
- remote providers and broker-style adapters
- host workflows such as ComfyUI/diffusers
- local/mobile diffusion/runtime feasibility
- cancellation/progress and long-running job states
- storage/network/GPU/RAM costs
- generated asset verification and Artifact Production Plane integration
- audio/video generation only enough to decide common future broker vs deferral

Rules:
- provider APIs are replaceable adapters; Seven owns canonical request/result contracts.
- generated media is a derived artifact with lineage to prompt/references/model/provider.
- do not claim pixel-level reproducibility merely because a seed exists.
- reference images/masks preserve source lineage and privacy policy.
- generated outputs pass file/type/hash/dimension verification before success.
- large local models are optional downloaded packs, never base APK dependencies.
- local generation is admitted only after target-device resource/thermal evals.
- hidden provider prompt rewriting must be recorded when surfaced, not guessed.
- provider safety refusal/block is a distinct result state, not generic failure.
- remote fallback cannot violate privacy/local-only constraints.

Output:
1. GenerativeMediaBroker architecture
2. canonical ImageGenerationRequest/GeneratedAsset contracts
3. candidate/provider/runtime registry
4. editing/reference/mask normalization
5. provenance/reproducibility rules
6. local/host/remote deployment strategy
7. Android/resource policy
8. rejected approaches
9. Deep Polish queue and eval gates
10. decision on whether audio/video generation need separate broad discovery

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
