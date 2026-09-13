# Seven Tool Fabric 2.0 — Wave 18 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 18. No production renderer/transcoder dependency is frozen.
Governing command: `WAVE_18_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should own an **Artifact Production Plane** with typed source models and multiple replaceable exporters. It should not become a giant universal conversion app or put heavyweight codecs in the startup path.

Architecture:

1. `ArtifactDocument` — typed report/document semantic model.
2. `ArtifactTable` — Wave 15 TableSpec-backed spreadsheet/table export model.
3. `ImageTransformPlan` — bounded image operations.
4. `MediaTransformPlan` — bounded audio/video operations.
5. `ArtifactRenderer` — PDF/DOCX/XLSX/image adapters.
6. `MediaTransformer` — Android native or host codec path.
7. `ArtifactVerifier` — type/signature/hash/structure/postcondition checks.
8. `MetadataPolicy` — explicit preserve/strip/replace rules.
9. `ArtifactManifest` — provenance/reproducibility metadata, compatible with Wave 14 integrity concepts.

The semantic content exists before the output format. PDF/DOCX/XLSX/media files are derived artifacts, not canonical user/project truth merely because they were generated successfully.

## Candidate registry

| Candidate/platform | Kind | Preliminary class | Seven role |
|---|---|---|---|
| pdf-lib | pure JS PDF library | CORE/SPECIALIST CANDIDATE | basic PDF create/edit/merge/forms/pages/fonts |
| Android `PdfDocument` | platform PDF writer | SPECIALIST PLATFORM | simple native Android PDF generation |
| Paged.js + browser print pipeline | paged-media renderer | SPECIALIST HOST/WEB | rich HTML/CSS paginated reports |
| docx | JS OOXML generator | CORE/SPECIALIST CANDIDATE | DOCX report/document export |
| SheetJS CE | spreadsheet JS library | CORE/SPECIALIST CANDIDATE | data-first XLSX/CSV workbook export |
| `createImageBitmap` + OffscreenCanvas | Web APIs | CORE PLATFORM WEB | local image crop/resize/render/encode path |
| Android bitmap/image APIs | platform | CORE PLATFORM | native image transformations where bridge exists |
| Media3 Transformer | Android media API | CORE MEDIA CANDIDATE | native trim/transcode/crop/effects/export |
| FFmpeg + ffprobe | native host tools | SPECIALIST HOST | broad codec/container conversion/probe |
| ffmpeg.wasm | Wasm transcoder | EXPERIMENTAL | browser-only fallback after performance eval |
| WebCodecs | browser low-level codec API | SPECIALIST/EXPERIMENTAL | precise browser encode/decode building block |
| arbitrary executable templates | generated code | REJECTED | no canonical artifact path |

## ArtifactDocument

A small Seven-owned semantic model should support common reports without embedding renderer-specific APIs.

Possible blocks:
- heading
- paragraph
- list
- quote/callout
- code block
- table reference
- chart/image reference
- page/section break
- metadata fields
- source/citation footnote/endnote references

Document-level metadata:
- title
- language
- direction
- locale
- author/creator policy
- page intent
- accessibility description
- source artifact ids/lineage

Renderer-only fields such as PDF coordinates or OOXML classes do not belong in canonical semantic state.

## PDF paths

### pdf-lib

pdf-lib is pure TypeScript/JavaScript and works in browsers/Node/Deno/React Native. It can create/modify PDFs, draw text/images/vector graphics, embed fonts/pages, split/merge, fill forms and manage document metadata.

Seven role:
- strong local/browser candidate for basic PDF generation/manipulation
- version-pin if adopted
- disable any Seven capability for embedded PDF JavaScript/actions; generated documents should be passive by default
- large PDFs require ResourceGovernor and memory tests because many JS operations naturally work over in-memory bytes

Important:
- custom font support does not by itself prove correct complex-script shaping or bidirectional layout for every Arabic document. Arabic/RTL output must be verified on the exact renderer/font path before admission.

Source:
- https://pdf-lib.js.org/
- https://pdf-lib.js.org/docs/api/classes/pdfdocument

### Android PdfDocument

Android provides `android.graphics.pdf.PdfDocument` for creating pages from native Canvas/View content and writing to an output stream.

Seven role:
- lightweight platform option for simple native reports if Seven's Capacitor/native bridge makes it cheaper than a JS PDF stack
- not a rich document-layout engine by itself

Source:
- https://developer.android.com/reference/android/graphics/pdf/PdfDocument

### Paged.js / browser print

Paged.js implements paged-media layout over HTML/CSS and can produce print-ready paginated previews/output through browser/headless workflows.

Seven role:
- specialist path for rich reports/books where browser layout, CSS pagination, running headers/footnotes and complex typography matter
- generated content still passes Seven SafeMarkup boundary
- host/headless PDF generation is preferable to shipping a large always-loaded printing stack

Source:
- https://pagedjs.org/en/documentation/1-the-big-picture/

## DOCX

The `docx` JS/TS library exposes a declarative API for creating OOXML `.docx` documents and works in Node and browsers.

Seven role:
- strong DOCX exporter candidate behind `ArtifactDocument`
- typed mapping for sections, paragraphs, runs, tables, images and numbering
- output is verified as ZIP/OOXML structure before success
- Arabic/RTL/bidi and cross-viewer layout require explicit fixture testing in Word/LibreOffice/other readers before Freeze

Source:
- https://docx.js.org/api/

## Spreadsheet export

SheetJS CE can generate XLSX and other spreadsheet formats and supports browser file generation. Current CE documentation emphasizes data preservation and notes that richer styling/images/charts/pivot features are in Pro or otherwise outside the CE focus.

Seven decision:
- use only as a data-first spreadsheet exporter candidate, not as a full Excel design engine
- generate from Wave 15 `TableSpec`/AnalysisArtifact
- column types/date/number formats are explicit
- formula export is allowed only from reviewed typed formula generation, never from arbitrary executable model content
- large workbook generation is memory-bounded; upstream notes browser read/write workflows often operate in memory and need large-data strategies

Sources:
- https://docs.sheetjs.com/docs/
- https://docs.sheetjs.com/docs/api/write-options/
- https://docs.sheetjs.com/docs/demos/bigdata/stream/

## ImageTransformPlan

Canonical operations:
- decode/inspect
- orientation normalize
- crop
- resize
- rotate/flip
- composite watermark/annotation only when explicitly requested
- encode to approved output format/quality
- metadata preserve/strip policy

Fields include:
- source hash/type/dimensions
- requested operation list
- output dimensions
- fit/crop policy
- output MIME/quality
- alpha/background policy
- color-space policy where relevant
- metadata policy

### Browser path

`createImageBitmap` can crop/resize during bitmap creation and handles EXIF orientation options. `OffscreenCanvas.convertToBlob()` works in workers and can encode PNG plus commonly supported JPEG/WebP implementations.

Seven role:
- lightweight browser/WebView image path
- process large images off UI thread
- close/release bitmap resources promptly

Sources:
- https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
- https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob

## MediaTransformPlan

Typed plan fields:
- source reference/hash
- source media probe result
- trim ranges
- track selection/removal
- target container
- target audio/video codec when requested/supported
- size/resolution/frame-rate/bitrate intent
- crop/rotation/effect plan
- metadata policy
- expected duration
- output path/SAF target
- resource class

No raw FFmpeg command string is canonical tool input from the model.

## Android Media3 Transformer

Media3 Transformer supports Android 6+ and uses MediaCodec for hardware-backed video decode/encode and OpenGL for graphical edits. Current APIs cover trimming, crop/scale/rotate/effects, format conversion, audio processing and multi-asset composition. Export exposes progress/error/cancellation.

Seven decision:
- **preferred Android media transformation candidate**
- load/invoke only in media workspace/action
- ResourceGovernor admits HEAVY/EXTREME jobs
- cancellation must call Transformer cancellation and verify resulting file state
- output still passes `ArtifactVerifier`
- actual codec/container support is device-dependent and capability-probed, not assumed

Sources:
- https://developer.android.com/media/media3/transformer
- https://developer.android.com/media/media3/transformer/transformations
- https://developer.android.com/media/media3/transformer/supported-formats

## FFmpeg / ffprobe host specialist

Native FFmpeg remains the broadest conversion specialist for host/remote workers. Its own documentation emphasizes stream copy when transcoding is unnecessary because transcoding costs compute and usually incurs quality loss. `ffprobe` gives machine-readable container/stream metadata.

Seven rules:
- probe before transform
- use a structured allowlisted plan compiled into arguments by trusted Seven code
- prefer stream-copy/remux/trim paths where technically correct
- no direct arbitrary model-written shell command as the normal `media.transform` contract
- sandbox/file scope/time/resource policy from Wave 02 applies

Sources:
- https://ffmpeg.org/ffmpeg.html
- https://ffmpeg.org/ffprobe.html

## ffmpeg.wasm decision

ffmpeg.wasm runs FFmpeg-derived code in WebAssembly/worker environments, but its own published performance comparison shows very large slowdowns versus native FFmpeg for a representative WebM→MP4 transcode, even with multithreading.

Decision:
- EXPERIMENTAL browser fallback only
- never startup/base requirement
- do not choose merely because it avoids a server
- benchmark on target Android WebView before any adoption
- a custom small core may be considered only for a narrowly justified codec path

Sources:
- https://ffmpegwasm.netlify.app/docs/performance/
- https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/apps/website/docs/overview.md

## WebCodecs

WebCodecs offers low-level audio/video encoders/decoders and is available in dedicated workers on supporting browsers. It does not provide a complete media editing/container solution by itself; encoded chunks generally require demux/mux handling.

Seven role:
- specialist building block for a future lightweight browser-native path
- only when capability detection and codec/container requirements are satisfied
- not a replacement for Media3/FFmpeg for general transformations

Source:
- https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API

## MetadataPolicy

Every output declares one of:
- `PRESERVE_SAFE`
- `STRIP_NONESSENTIAL`
- `REPLACE_WITH_EXPLICIT`
- `PRESERVE_ALL_REQUESTED` only with reviewed reason

Potentially sensitive metadata:
- GPS/EXIF location
- device/camera identifiers
- author/company/user names
- edit history/comments
- document creator paths/software
- media tags

Seven should default newly generated shareable artifacts to minimal non-sensitive metadata unless the user/task requires preservation.

Original files remain unchanged unless an explicit side-effecting edit tool is requested.

## Font / Unicode / RTL law

Artifact generation must record/embed or reference a legally usable font strategy appropriate to the requested script.

Tests must cover:
- Arabic shaping
- RTL paragraph order
- Arabic + English + numbers
- code/math LTR islands
- diacritics
- line breaking
- table alignment
- PDF viewer portability
- DOCX viewer differences

Do not declare Arabic support based solely on UTF-8 string acceptance.

Fonts are dependencies/artifacts with license metadata and must not be casually bundled or redistributed.

## Artifact verification

After generation:
1. output exists and non-zero size
2. magic/signature/type matches intended format, not extension only
3. output hash computed
4. format-specific structural open/parse where feasible
5. expected page/sheet/track counts
6. expected dimensions/duration where relevant
7. no unexpected embedded active content
8. metadata policy spot-check
9. provenance manifest recorded
10. destination write verification per Wave 14

For complex documents/media, render/playback smoke tests in CI fixtures supplement structural validation.

## Reproducibility

ArtifactManifest records:
- source object ids/hashes
- typed artifact/transform plan hash
- exporter/transcoder id/version
- output options
- font ids/hashes/licenses where bundled
- codec/settings where material
- output SHA-256/size/type
- generation time
- warnings and non-deterministic fields

Byte-for-byte reproducibility is not promised for formats/exporters that inject timestamps/IDs or use device-specific codecs. Seven distinguishes semantic reproducibility from binary reproducibility.

## Android/startup strategy

- artifact contracts/validators: tiny core
- PDF/DOCX/XLSX JS exporters: lazy dynamic chunks
- image browser/native transforms: worker/native on demand
- Media3 Transformer: native module loaded/used only for media feature
- native FFmpeg: host/remote specialist, not APK default
- ffmpeg.wasm: experimental optional only
- WebCodecs: capability-detected specialist
- large jobs require ResourceGovernor admission and foreground/progress UX

## Rejected approaches

- FFmpeg binary/Wasm always loaded in base app: rejected
- arbitrary model-written FFmpeg command as canonical API: rejected
- PDF embedded JavaScript/actions in normal generated docs: rejected
- extension used as proof of output format: rejected
- silent metadata/GPS leakage: rejected
- full-file decode/transcode without resource limits: rejected
- generated executable HTML templates without SafeMarkup validation: rejected
- SheetJS CE treated as full-fidelity Excel layout engine: rejected
- ffmpeg.wasm chosen over native Android solely for feature count: rejected
- generated artifact reported successful before post-write verification: rejected

## Canonical capabilities

- `artifact.document.create`
- `artifact.pdf.export`
- `artifact.docx.export`
- `artifact.xlsx.export`
- `artifact.verify`
- `image.transform`
- `media.probe`
- `media.transform`
- `media.cancel`
- `artifact.metadata.inspect`
- `artifact.metadata.policy.apply`

## Required Evals

Before Freeze:
- Arabic/RTL PDF/DOCX fixture renders correctly across selected viewers
- large document does not crash low/midrange device
- corrupt/failed export never reports success
- generated PDF has no unexpected active JavaScript/action
- metadata strip canary removes GPS/private tags when requested
- XLSX typed dates/numbers/leading-zero strings round-trip correctly
- image EXIF orientation/crop/resize fixtures are correct
- media cancel frees resources and leaves no false-valid output
- device unsupported codec fails/falls back explicitly
- stream-copy path preserves quality when no transcode needed
- transformed duration/resolution/track count matches plan
- startup bytes unaffected until exporter/media feature is invoked

## Deep Polish queue

`ArtifactDocument/Manifest → ArtifactVerifier/MetadataPolicy → image transform path → pdf-lib vs native/Paged report bakeoff → docx exporter → SheetJS data exporter → Media3 Transformer → FFmpeg host adapter → Arabic/font portability suite → WebCodecs experiment → ffmpeg.wasm only if a narrow eval wins`

## Coverage statement

Wave 18 closes the targeted high-value discovery gap around document/media production. Seven gains broad artifact capability through typed, lazy exporters and platform/host specialists without becoming a heavyweight multimedia suite in its base APK.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
