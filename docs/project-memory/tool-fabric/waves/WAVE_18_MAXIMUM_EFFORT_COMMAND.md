# Seven Tool Fabric 2.0 — Wave 18 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: document/media creation, export and transformation.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 18

Goal: let Seven create useful portable artifacts without bloating Android, executing unsafe conversion pipelines, or confusing visual rendering with authoritative source data.

Research maintained browser/JS/native/host tools and standards. Reuse Wave 04 archive/integrity, Wave 14 export/recovery and Wave 15 typed data/visualization.

Research at minimum:
- PDF creation/editing/export
- DOCX generation
- spreadsheet/XLSX generation where useful
- HTML/Markdown to printable/report artifacts
- image resize/crop/rotate/encode/metadata handling
- audio trim/convert/normalize/transcode
- video/container probe/trim/transcode
- SVG/raster chart export
- font/Unicode/Arabic/RTL requirements
- large-file streaming/memory limits
- metadata/privacy stripping
- deterministic/reproducible export where possible
- FFmpeg native/host/Wasm tradeoffs
- Android platform media/image APIs
- output verification and mime/signature checks

Rules:
- heavy codecs/transcoders stay lazy/host/native specialist, never startup dependencies.
- generated files are verified after creation before reporting success.
- file extension never proves content type.
- user/source metadata is preserved or stripped according to explicit policy, not accidentally.
- generated PDF/DOCX/XLSX content comes from typed artifact models rather than arbitrary executable templates.
- fonts/licensing and Unicode/Arabic shaping must be considered for portable output.
- no giant full-file buffering without size/resource checks.
- archive/export packages reuse Wave 14 integrity manifests.

Output:
1. ArtifactProductionPlane architecture
2. typed document/media transformation contracts
3. candidate registry
4. local vs host/native deployment strategy
5. metadata/privacy/font rules
6. verification/reproducibility strategy
7. Android/startup strategy
8. rejected approaches
9. Deep Polish queue and eval gates

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
