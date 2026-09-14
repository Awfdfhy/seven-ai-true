# Seven AI — Capability 18 Vision Ultimate Polish

Status: **FREEZE CANDIDATE — architecture only**
Target: **Seven Vision Fabric 3.0 — Provenance-Bound Selective Perception Plane**

## Prime law

> Vision observes pixels and proposes structured observations. It does not gain action authority, world truth, or file truth merely because a model described an image confidently.

## Ground truth

Seven's capability map already targets image understanding, screenshots, UI inspection, document/diagram interpretation, OCRBroker, platform OCR and optional local OCR packs. Model Fabric can route vision-capable models. The final integration remains partial.

## Research implications

Visual-agent benchmarks such as OSWorld demonstrate that screenshot-based agents still struggle with precise grounding, unexpected windows and long-horizon GUI operation. Document benchmarks such as MMDocBench show that fine-grained document understanding spans OCR, layout, tables, charts and region-grounded reasoning rather than one generic image score.

Therefore Seven must separate perception, grounding, interpretation and action.

## Pass A — maximum perception architecture

### Canonical objects

- `VisualSource`
- `VisualVersion`
- `VisualFrame`
- `VisualRegion`
- `OCRArtifact`
- `LayoutArtifact`
- `VisualObservation`
- `GroundedObservationSet`
- `PerceptionRequest`
- `PerceptionPlan`
- `PerceptionManifest`
- `FrameDelta`
- `VisualEvidenceRef`

### Source identity

Each visual input records:

- source/origin
- image/page/frame identity
- content hash where possible
- dimensions/orientation
- capture/import timestamp
- page/frame index
- transforms applied
- principal/project scope
- lineage

Resizing/cropping creates a derived representation, not a new authoritative original.

### Selective perception ladder

1. metadata/preflight
2. exact image/page identity
3. cheap local/platform OCR or structural extraction when sufficient
4. layout/region segmentation
5. targeted crops/regions
6. vision-language interpretation only for unresolved semantic needs
7. optional second perception path when verification/risk justifies it
8. structured observation validation
9. Evidence/Context handoff

Do not send every full-resolution image to a remote VLM by default.

### OCR is not vision truth

`OCRArtifact` contains:

- source/page/region locator
- engine/version
- recognized text
- token/line boxes when available
- language hints
- transformation chain
- uncertainty/quality diagnostics when available

OCR text remains derived. Exact quotations/citations must remain tied to source regions and may require visual verification when quality is poor.

### Layout and documents

Documents preserve:

- page hierarchy
- blocks/paragraphs
- reading-order hypotheses
- tables/charts/images
- coordinates
- headers/footers
- section associations

Reading order is a derived interpretation and can be ambiguous.

### Grounded observations

A `VisualObservation` must include:

- subject/predicate/value or typed observation
- exact region(s)
- VisualVersion
- method/model identity
- transformation lineage
- temporal/frame scope
- verification state

Narrative model prose is not the canonical observation store.

### UI/screenshot understanding

Vision may identify controls, text, states and possible targets, but:

- it cannot grant `click`, `type`, `upload`, `send` or other action permission;
- coordinates are proposals subject to current-frame validation;
- a new screenshot/frame invalidates stale geometry when layout changes;
- structured accessibility/DOM data may complement pixels but can also be stale/noisy and remains separately sourced.

BrowserAction/Device tools own actions under Tool Security.

### Temporal/screen perception

For video/screen streams use adaptive sampling:

- frame hashes/deltas
- event-triggered capture
- region refresh
- keyframes
- bounded recent frame history

No continuous high-rate remote vision loop on mobile.

### Charts and diagrams

Use layered extraction:

1. text/OCR
2. axes/legend/labels/regions
3. geometric relations
4. semantic interpretation
5. claim/evidence handoff

When a precise numeric value cannot be reliably read, mark it unresolved rather than infer from appearance.

### Privacy

Before remote vision dispatch, policy can require:

- scope check
- local preflight
- crop/minimize to required region
- metadata stripping where appropriate
- user/enterprise privacy policy

Redaction is itself a derived transformation with lineage. It cannot silently alter evidentiary meaning.

### Model routing

Model Fabric selects perception model by:

- OCR need
- fine detail
- chart/document need
- GUI grounding
- language
- context window
- local/remote privacy
- latency/device constraints

A single vision model is not assumed best across all tasks.

## Velocity assault

- lazy vision bundle/model loading
- platform OCR before heavy VLM where sufficient
- thumbnail/preflight first
- target regions rather than full repeated frames
- duplicate-frame suppression
- reuse valid OCR/layout derivatives
- no background camera/screen analysis unless an explicit active task owns it
- cancellation between stages
- resource-governor thermal/RAM gates
- local packs optional and downloadable only deliberately

## Pass B — destroy the winner

### Full-image VLM for everything
Rejected: expensive, privacy-heavy, less deterministic for exact text/layout.

### OCR text treated as original document
Rejected: loses region/layout/error provenance.

### Coordinates stored as durable UI identity
Rejected: geometry can drift between frames.

### Vision tool allowed to click directly
Rejected: observation and action authority must remain separate.

### Confidence scalar as canonical truth
Rejected. Verification is property-specific and evidence-bound.

### Continuous screenshot polling
Rejected for battery/privacy/performance.

## Reconciled architecture

```text
VisualSource/Version
 -> cheap metadata/OCR/layout
 -> targeted regions
 -> optional VLM interpretation
 -> GroundedObservationSet
 -> property-specific verification
 -> Knowledge/Research/Context consumers

Action request
 -> separate Tool/Device/Browser contract
 -> Security authorization
 -> current-frame target revalidation
```

## Mandatory evals

- clean OCR page
- noisy/scanned Arabic page
- mixed Arabic/English UI
- table/chart reading
- diagram relations
- tiny text requiring crop/escalation
- stale coordinate after UI movement
- unexpected modal/window
- duplicate frames
- screenshot with irrelevant sensitive regions where minimization should crop
- OCR vs VLM disagreement
- exact source-region reconstruction
- multi-page document
- orientation/rotation
- Lite without local VLM
- cancellation mid-pipeline
- thermal/resource downgrade
- frame delta/keyframe recovery
- no-action-authority invariant

## Implementation stages

- VF-P0 source/version/region contracts
- VF-P1 platform/local OCR bridge
- VF-P2 layout/region artifacts
- VF-P3 vision model adapter + grounded observations
- VF-P4 document/chart/diagram paths
- VF-P5 screenshot/UI frame validation
- VF-P6 temporal/delta sampling
- VF-P7 privacy/minimization policy bridge
- VF-P8 Knowledge/Research evidence bridge
- VF-P9 observability/resource controls
- VF-P10 multilingual/device/adversarial evals

## Freeze decision

Freeze candidate makes vision a selective, source-bound perception substrate. It improves exactness, privacy, mobile efficiency and action safety while allowing strong multimodal models to be used where they add real semantic value.
