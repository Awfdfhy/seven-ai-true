# Seven Tool Fabric 2.0 — Wave 19 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 19. No image-generation provider/runtime is frozen.
Governing command: `WAVE_19_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should own a provider-neutral **Generative Media Plane** focused first on image generation and generative image editing.

Architecture:

1. `GenerativeMediaBroker` — one canonical generation/edit boundary.
2. `GenerationCapabilityRegistry` — evidence-backed provider/model capability manifests.
3. `ImageGenerationAdapter` — text-to-image and reference-conditioned generation.
4. `ImageEditAdapter` — edit/inpaint/outpaint/mask/reference normalization.
5. `GenerationJobController` — async job, progress, cancellation and uncertain-state handling.
6. `GeneratedAssetVerifier` — MIME/signature/decode/dimension/hash verification before success.
7. `GenerationProvenance` — request/model/reference/output lineage.
8. `ContentCredentialsBridge` — optional C2PA interoperability.
9. `HostGenerationBackend` — Diffusers/ComfyUI-class workflows.
10. `LocalGenerationBackend` — optional experimentally admitted Android/native runtime.

The model/provider produces a derived media artifact. The canonical Seven state is the request, references, capability evidence, job state, verified output and provenance, not a provider-specific response object.

## Candidate / provider registry

| Candidate | Kind | Preliminary class | Seven role |
|---|---|---|---|
| OpenAI GPT Image family | remote provider/model | SPECIALIST ADAPTER | high-quality generation/editing adapter |
| Gemini image-generation models | remote provider/model | SPECIALIST ADAPTER | generation, editing, multi-reference workflows |
| Black Forest Labs FLUX API | remote provider/model | SPECIALIST ADAPTER | async generation/editing/multi-reference |
| Stability AI platform | remote provider/model | SPECIALIST ADAPTER | generation/editing/reference operations |
| Hugging Face Diffusers | Python inference framework | CORE HOST SPECIALIST / REFERENCE | host-side open-model pipelines and capability research |
| ComfyUI | workflow runtime/API | SPECIALIST HOST | graph/workflow execution for advanced generation pipelines |
| stable-diffusion.cpp | native C/C++ inference runtime | EXPERIMENTAL LOCAL | optional Android/local diffusion backend |
| C2PA Content Credentials | provenance standard | OPTIONAL CORE-ALIGNED BRIDGE | cryptographic provenance/history interoperability |
| large local diffusion weights in base APK | deployment approach | REJECTED | violates Android size/startup/resource laws |

Provider availability, pricing, free quota, model identity and limits are time-sensitive evidence and must not be hardcoded as permanent product facts.

## Canonical ImageGenerationRequest

Recommended fields:

- `requestId`
- `taskContractId`
- `mode`: `TEXT_TO_IMAGE`, `IMAGE_TO_IMAGE`, `EDIT`, `INPAINT`, `OUTPAINT`
- prompt text + prompt source/version
- optional negative prompt where the selected backend supports it
- ordered reference assets with immutable hashes and intended role
- optional mask asset + mask semantics
- requested count
- width/height or aspect-ratio intent
- quality/speed class
- output format
- transparency/background intent where supported
- seed/replay hint when supported
- provider/model constraints
- privacy/locality requirements
- provider allow/deny policy
- safety/result policy
- provenance/content-credentials policy
- resource/budget class
- cancellation token
- lineage/trace id

Adapters must reject or explicitly transform unsupported options. They must never silently pretend a requested mask, transparency, reference count or quality level was honored.

## GeneratedAsset

Recommended fields:

- asset id
- generation request id/hash
- output MIME/type
- width/height
- byte size
- SHA-256
- provider/model/revision actually used
- job id/provider request id
- reference/mask hashes
- effective prompt/revised prompt only when provider exposes it
- seed/sampler/scheduler metadata where available
- generation start/end time
- provider safety/refusal status
- verification status
- provenance/content-credential status
- metadata-policy result
- lineage to request and source references
- warnings/limitations

A visually plausible returned URL/base64 payload is not sufficient for success until Seven verifies the asset.

## Capability manifest

Generative model/provider capabilities vary quickly, so Seven records them as evidence:

- text-to-image
- image-to-image
- edit/inpaint/outpaint
- explicit mask support
- semantic edit without mask
- maximum reference images
- supported input/output MIME types
- transparency/background control
- supported output dimensions/aspect ratios
- quality controls
- seed/replay support
- async job support
- progress support
- cancel endpoint/confirmation quality
- output metadata/provenance behavior
- prompt rewriting/revision exposure
- safety refusal/block semantics
- region/privacy/data-handling evidence
- pricing/free-eligibility evidence observed at time
- model revision/snapshot identity

Capability names are Seven-owned. Provider marketing labels are adapter metadata.

## OpenAI image adapter findings

Current OpenAI model documentation exposes dedicated GPT Image models for generation and editing. Current GPT-Image-2/2.5 family documentation shows text input and image input/output support, dedicated image-generation/edit endpoints, quality controls and dated model snapshots for some image models.

Important architecture findings:
- image-model capabilities and endpoint support are distinct from normal text-model streaming/tool/structured-output capabilities;
- current GPT image model pages do not advertise normal token-streaming semantics for the image generation result;
- model IDs/snapshots can change, so exact model identity belongs in the asset lineage;
- current free-tier API support for these image models cannot be assumed and is time-sensitive.

Seven decision:
- direct OpenAI image adapter behind `GenerativeMediaBroker`;
- do not reuse text-stream completion state machine blindly for image jobs;
- use model capability evidence rather than assuming every OpenAI model can generate images merely because some Responses models can invoke an image-generation tool.

Official sources:
- https://developers.openai.com/api/docs/models/gpt-image-2
- https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst
- https://developers.openai.com/api/docs/models/gpt-image-2.5-flare
- https://developers.openai.com/api/docs/models

## Gemini image adapter findings

Current Gemini image-generation documentation supports text-to-image, text+image editing, conversational/multi-turn editing, configurable output format/aspect/size, and multiple reference images for current Gemini image models. Exact reference limits and resolution options are model-specific and must stay in capability manifests.

Current documentation also distinguishes native Gemini image models from older Imagen paths and recommends current Gemini image models for new use cases.

Seven decision:
- Gemini adapter supports generation/edit mode through canonical request content blocks;
- multi-turn provider conversation state is not canonical asset history; Seven retains its own request/reference lineage;
- semantic masking/edit instructions are normalized separately from explicit pixel masks because providers do not expose identical editing semantics;
- provider grounding/search features are independent capabilities and cannot silently run if the Seven task/privacy contract did not permit them.

Official source:
- https://ai.google.dev/gemini-api/docs/image-generation

## Black Forest Labs / FLUX

BFL exposes asynchronous image generation through request creation followed by result retrieval/polling. Current FLUX.2 documentation supports generation and image editing with multiple reference images and model-specific controls.

Seven role:
- strong remote specialist adapter candidate;
- maps naturally to `GenerationJobController` async lifecycle;
- provider-specific reference limits, dimensions, output and pricing remain capability evidence;
- not a universal free backend.

Official sources:
- https://docs.bfl.ai/quick_start/introduction
- https://docs.bfl.ai/quick_start/generating_images
- https://docs.bfl.ai/flux_2/flux2_image_editing

## Stability AI

Current Stability developer APIs expose image generation/editing/reference-oriented workflows with provider-specific options such as seeds, output formats and edit operations.

Seven role:
- remote specialist adapter;
- adapter translates Stability-specific edit operation names into Seven generation/edit modes only where semantics match;
- feature presence and current commercial limits remain time-sensitive evidence.

Official source:
- https://platform.stability.ai/docs/api-reference

## Editing normalization

Provider semantics differ. Seven therefore distinguishes:

### Explicit-mask inpainting
Inputs:
- source image
- pixel mask
- prompt

The mask object records:
- source image hash it targets
- mask dimensions
- coordinate alignment
- mask interpretation (`EDIT_WHITE`, `EDIT_ALPHA`, etc.) normalized by adapter
- mask hash

### Semantic edit
Inputs:
- source/reference image(s)
- natural-language change contract
- optional preservation constraints

This is not called exact inpainting unless the provider actually honors an explicit mask.

### Reference-conditioned generation
References carry roles such as:
- subject/character reference
- style reference
- composition/control reference
- generic provider reference

Provider adapters may only map roles they actually support.

## Hugging Face Diffusers

Diffusers supplies host-side pipelines for text-to-image, image-to-image, inpainting and controlled generation such as ControlNet. Current documentation also contains video and audio generation pipeline families.

Inpainting uses explicit masks. ControlNet supports additional structural conditioning such as depth/pose/edges. Diffusers also exposes seeds/generators, schedulers and pipeline parameters that can be retained for reproducibility evidence.

Seven decision:
- preferred open-model host reference/runtime candidate;
- Python/GPU model stack is too heavy for Seven base APK;
- expose reviewed workflow adapters instead of arbitrary generated Python by default;
- host backend can support richer reproducibility metadata than many remote APIs, but exact repeatability still depends on model/runtime/hardware/settings.

Official sources:
- https://huggingface.co/docs/diffusers/using-diffusers/inpaint
- https://huggingface.co/docs/diffusers/api/pipelines/controlnet
- https://huggingface.co/docs/diffusers/api/pipelines/overview

## ComfyUI host backend

ComfyUI is a modular graph/workflow AI engine and backend. Its official repository includes API examples that queue workflows and monitor them over HTTP/WebSocket. Current official documentation also publishes a versioned API contract for workflow jobs/assets, including durable job identity and cancellation/resumption-oriented semantics in newer API paths.

Seven role:
- specialist host workflow runtime for advanced image-generation/edit pipelines;
- Seven stores a canonical reviewed workflow template id/hash plus parameter bindings rather than letting the model construct arbitrary untrusted node graphs by default;
- custom nodes are code dependencies and therefore require the same pin/hash/trust/sandbox discipline as other executable extensions;
- job progress/result is normalized through `GenerationJobController`.

Official sources:
- https://github.com/Comfy-Org/ComfyUI
- https://github.com/Comfy-Org/ComfyUI/blob/master/script_examples/basic_api_example.py
- https://github.com/Comfy-Org/ComfyUI/blob/master/script_examples/websockets_api_example.py
- https://github.com/Comfy-Org/docs/blob/main/openapi-v2.yaml

## Local Android / stable-diffusion.cpp

The active `stable-diffusion.cpp` project supports multiple diffusion/image model families and CPU/GPU backends. Current build documentation includes Vulkan and an OpenCL path for Adreno GPUs with Android NDK instructions.

Seven decision:
- EXPERIMENTAL local backend candidate only;
- native runtime is not equivalent to a lightweight feature because model weights, working memory, generation latency and sustained thermals dominate cost;
- no image model weight in base APK;
- downloaded model packs use Wave 03 model-pack integrity/lifecycle rules;
- eligibility requires storage/RAM/backend capability checks and Wave 13 ResourceGovernor admission;
- target-device benchmarks must measure load time, peak RAM, thermal behavior, generation latency and cancellation before admission.

Official sources:
- https://github.com/leejet/stable-diffusion.cpp
- https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/build.md

## GenerationJobController

Canonical lifecycle:

`CREATED → VALIDATING → QUEUED/ACCEPTED → RUNNING → VERIFYING_OUTPUT → COMPLETED`

Alternative terminal/intermediate states:
- `REFUSED`
- `BLOCKED`
- `FAILED`
- `CANCEL_REQUESTED`
- `CANCELLED_CONFIRMED`
- `ABORTED_LOCAL_REMOTE_UNKNOWN`
- `EXPIRED`

Rules:
- remote async provider request id is durable job evidence;
- local UI cancellation does not prove provider-side work stopped;
- adapters report their cancellation-confirmation capability;
- partial/provider preview images remain non-final derived artifacts unless explicitly preserved;
- timeouts after job submission produce `REMOTE_STATE_UNKNOWN` unless status can be queried.

## Reproducibility law

A seed is a **replay hint**, not proof of pixel-identical reproducibility.

Seven records where available:
- prompt/effective prompt
- seed
- model/revision/hash
- VAE/text encoder references when local
- sampler/scheduler
- step count/guidance/strength
- dimensions
- reference/mask hashes
- runtime/library version
- hardware/backend

Reproducibility status:
- `BYTE_VERIFIED_REPEATABLE`
- `CONFIG_REPLAYABLE`
- `PROVIDER_BEST_EFFORT`
- `NONDETERMINISTIC/UNKNOWN`

Never promise deterministic replay from a remote model merely because it accepts `seed`.

## Provenance / C2PA

C2PA Content Credentials provide a standard for cryptographically verifiable provenance/history assertions and content bindings. Current C2PA specifications have continued to evolve in 2026.

Seven role:
- optional interoperability bridge;
- ingest provider-supplied credentials when present;
- optionally create Seven generation/edit provenance credentials only if signing/key management is designed correctly;
- retain raw asset hash and Seven lineage regardless of C2PA availability.

Critical truth rule:
- valid C2PA can support claims about origin/history/integrity;
- it does **not** prove that depicted events are factually true.

Official sources:
- https://spec.c2pa.org/
- https://spec.c2pa.org/specifications/specifications/2.4/specs/C2PA_Specification.html

## GeneratedAssetVerifier

Reuse Wave 18 ArtifactVerifier and add generation-specific checks:

1. output bytes retrieved completely
2. magic/MIME matches intended supported type
3. decode succeeds
4. dimensions/pixel count within requested/provider-reported bounds
5. non-zero file size and bounded size
6. SHA-256 computed
7. metadata inspected under MetadataPolicy
8. C2PA/provenance inspected if present/required
9. provider job/output id linked to asset
10. reference/request lineage attached

A provider `completed` state with an unreadable/corrupt result becomes output-verification failure, not Seven success.

## Prompt/rewrite handling

Providers may internally transform prompts or not expose their effective representation.

Rules:
- store the user/Seven submitted prompt exactly as an authoritative request field;
- record revised/effective prompt only when provider exposes it;
- never invent a hidden rewritten prompt;
- provider-side hidden transformations remain `UNKNOWN`.

## Privacy

Reference images can be highly sensitive.

Before remote dispatch:
- provider/locality policy check
- exact list/hash of assets to upload
- remove unrelated metadata according to policy when appropriate
- no hidden upload of previous conversation images
- local-only task can use only a local/approved host backend
- provider fallback cannot silently change locality/privacy requirements

## Safety/result states

Provider safety systems may refuse/block generation. Seven normalizes at least:
- `COMPLETED`
- `REFUSED_POLICY`
- `BLOCKED_PROVIDER`
- `FAILED_TECHNICAL`
- `CANCELLED`
- `UNKNOWN_REMOTE_STATE`

Provider safety state is execution evidence, not a reason to fabricate output or silently swap to another provider.

## Android/resource strategy

### Base APK
- contracts, adapters registry and small verification glue only.

### Remote providers
- lazy network adapters; no SDK unless its value beats direct protocol cost.

### Host backend
- Diffusers/ComfyUI on capable desktop/server/worker.

### Local optional
- stable-diffusion.cpp or future measured runtime only through explicit downloaded model packs.

Local generation is `EXTREME` ResourceGovernor class by default until a specific model/device benchmark proves a lower class.

No long generation begins in background invisibly. UI exposes job/progress/cancel state.

## Audio/video generation decision

Diffusers and modern provider ecosystems demonstrate that text/image-to-video and text-to-audio generation are real adjacent capabilities, but they have materially higher compute/storage/output-size complexity and weaker necessity for Seven's initial general-assistant core.

Decision:
- `GenerativeMediaBroker` is modality-extensible (`IMAGE`, future `VIDEO`, `AUDIO`).
- **Image generation/editing is P1 and covered now.**
- video/audio generation remain P2 specialist capabilities.
- do not open another broad Discovery wave merely to catalog every video/music model.
- targeted research may reopen when Seven chooses to implement either modality.

## Rejected approaches

- one provider's image request schema as Seven canonical API: rejected
- image-model weights bundled in base APK: rejected
- claiming seed guarantees identical output: rejected
- arbitrary ComfyUI graph generated/executed without review: rejected
- ComfyUI custom nodes trusted by default: rejected
- provider-completed response accepted without file verification: rejected
- generated asset without prompt/reference/model lineage: rejected
- C2PA treated as proof of semantic truth: rejected
- hidden remote fallback from local-only task: rejected
- storing private reference images in logs/telemetry: rejected
- separate product architecture for each image provider: rejected
- broad video/audio model catalog before concrete implementation need: rejected

## Canonical capabilities

- `media.generate.image`
- `media.edit.image`
- `media.inpaint.image`
- `media.outpaint.image`
- `media.generation.status`
- `media.generation.cancel`
- `media.generated_asset.verify`
- `media.provenance.inspect`
- `media.content_credentials.inspect`

## Required Evals

Before Freeze:
- same canonical request is translated correctly across at least two provider adapters
- unsupported provider options fail explicitly rather than disappear
- reference/mask hashes and alignment remain intact
- remote timeout after accepted job produces accurate uncertainty state
- corrupt/provider-invalid output cannot become success
- provider block/refusal remains distinct from technical failure
- privacy/local-only route never uploads reference images
- model/provider revision is retained
- seed is not mislabeled deterministic without repeat evidence
- local backend ResourceGovernor stops/defers on unsafe thermal/memory state
- generated asset survives decode/MIME/dimension/hash verification
- C2PA validation failure does not corrupt ordinary raw hash/provenance lineage
- ordinary chat startup loads none of the heavy generation runtime/models

## Deep Polish queue

`Canonical Generation Contracts → CapabilityRegistry → GeneratedAssetVerifier → GenerationJobController → OpenAI Adapter → Gemini Adapter → FLUX/BFL Adapter → Stability Adapter → Provenance/C2PA Bridge → Diffusers HostAdapter → ComfyUI ReviewedWorkflowAdapter → stable-diffusion.cpp Android experiment → image-generation cross-provider eval suite`

## Coverage statement

Wave 19 closes the remaining P1 gap identified in Coverage Audit 02: provider-neutral image generation and generative image editing. Audio/video generation have a common future architectural home but are deliberately deferred as P2 specialists rather than extending broad discovery indefinitely.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
