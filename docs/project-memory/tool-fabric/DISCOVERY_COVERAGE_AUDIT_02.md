# Seven Tool Fabric 2.0 — Discovery Coverage Audit 02

Date: 2026-09-13
Status: COMPLETE — BROAD DISCOVERY ALMOST SATURATED, ONE MATERIAL P1 GAP REMAINS
Governing command: `DISCOVERY_COVERAGE_AUDIT_02_MAXIMUM_EFFORT_COMMAND.md`

## Verdict

Waves 01–18 now cover Seven's P0 Tool Fabric architecture to practical saturation and cover nearly all high-value P1 general-assistant capability classes identified by Coverage Audit 01.

However broad Discovery should **not close yet** because one material capability gap survived the adversarial audit:

> **Generative Media / Image Synthesis & Generative Editing**

Seven has deep image understanding/OCR (Wave 03) and deterministic image/media transformation/export (Wave 18), but it does not yet have a researched provider-neutral capability for generating a new image from a prompt/reference or performing generative image editing/inpainting/outpainting.

For a general AI product targeting strong free-plan competitiveness, this is a genuine P1 capability rather than random feature accumulation.

Therefore:

- Waves 01–18: accepted as complete Discovery waves.
- Wave 19: add one targeted **Generative Media / Image Generation** wave.
- Productivity connector packs remain P2 and do not keep broad discovery open because Waves 04/07 already provide generic API/Auth/Connection foundations.
- After Wave 19, run Coverage Audit 03. If no new P0/P1 class emerges, declare `SATURATED_FOR_BROAD_DISCOVERY` and transition fully to tool-by-tool Deep Polish.

## 1. Coverage matrix after Waves 01–18

| Capability class | Primary coverage | Status |
|---|---|---|
| Web/search/retrieval | W01, W10 | DEEP |
| Browser automation | W01 | DEEP |
| Coding structure/search/lint | W01 | DEEP |
| Tool interoperability/MCP | W01 | DEEP |
| Schema validation | W01 | DEEP |
| Local data/SQL | W01, W15 | DEEP |
| Sandboxed execution | W02 | DEEP |
| Git/patch transactions | W02 | DEEP |
| Android file grants/secrets | W02 | DEEP |
| Dependency/supply-chain verification | W02, W08 | DEEP |
| Vision/OCR | W03 | DEEP |
| Speech/STT/TTS/VAD | W03 | DEEP |
| Local inference/embeddings/vector | W03, W11 | DEEP |
| API contracts/events/webhooks | W04, W07 | DEEP |
| Content/archive/media inspection | W04 | DEEP |
| Canon provenance/source ledger | W04, W09 | DEEP |
| Deterministic utilities/parsers/markup | W05 | DEEP |
| Android device actions/scheduling | W06 | DEEP |
| OAuth/connections/remote actions | W07 | DEEP |
| Testing/fuzzing/static/security analysis | W08 | DEEP |
| RPG/Canon deterministic simulation | W09 | DEEP |
| Scholarly/research evidence | W10 | DEEP |
| Memory/Context retrieval/reconstruction | W11 | DEEP |
| Model/provider runtime/routing | W12 | DEEP |
| Streaming/cancellation/token accounting | W12 | DEEP |
| Observability/resource governance | W13 | DEEP |
| Recovery/migration/import/export | W14 | DEEP |
| Data analysis/statistics/visualization | W15 | DEEP |
| Symbolic/scientific math | W16 | DEEP |
| Geospatial/maps/weather/world data | W17 | DEEP |
| Document/media production/transformation | W18 | DEEP |
| Generative image/media | none dedicated | **P1 GAP** |

## 2. P0 assessment

No unresearched P0 Tool Fabric capability class was found.

Important architectural/product systems still require implementation and Ultimate Polish, but they are not reasons to keep broad **tool discovery** open:
- Cognitive Control Plane
- Truth/Epistemic policy
- Adaptive Compute decision logic
- Self-Evolution acceptance logic
- final UX/Aurora/brand/motion/accessibility
- Titles/World Linguistic Engine
- final Seven Evals suite design

These should consume the researched primitives and be polished as Seven-owned architecture rather than trigger generic library hunts.

## 3. Remaining P1 gap

### Generative Media / Image Synthesis

Missing canonical abilities:
- text-to-image
- image-to-image/reference-conditioned generation
- generative image editing
- inpainting/outpainting where provider/runtime supports it
- mask/reference handling
- provider/model capability normalization
- output provenance and reproducibility metadata
- generation resource/cost routing
- local/remote generation posture
- generated-image artifact verification

This cannot be honestly claimed covered by Wave 03 or Wave 18.

Decision: create **Wave 19** narrowly for this capability.

Audio/music/video generation are not automatically P1 requirements for the first Seven release. Wave 19 should examine them only enough to decide whether they belong under the same future broker or remain deferred specialists.

## 4. P2/deferred capability classes

### Productivity connector packs

Examples:
- email
- calendar
- cloud drives
- notes/tasks
- issue trackers/code hosting providers beyond existing GitHub workflows

Decision: P2/deferred from broad discovery.

Reason:
- generic foundations already exist: OpenAPI/EventContract (W04), OAuth/ConnectionBroker (W07), Tool Security/SideEffectLedger (W02/04/07), provider-specific schemas can be added when an actual connector is chosen.
- researching dozens of SaaS APIs now would create churn and stale documentation rather than architectural value.

### Realtime full-duplex voice UX

Speech primitives are covered in W03. Realtime conversational orchestration is primarily a Model/UX/Audio product polish problem, not another generic tool hunt unless implementation exposes a missing primitive.

### Sync/collaboration

W14 intentionally rejects generic sync as backup. Multi-device authoritative sync remains a separate future product feature because it requires distributed authority/conflict semantics, not merely a library.

### 3D/CAD/game engines

Low expected value for Seven's general AI goals. Keep deferred unless a concrete user/product requirement appears.

## 5. Duplication / simplification findings

The 18 waves produced many candidates, but Seven should **not** integrate one library per discovery item.

Important consolidation rules:

- Search providers sit behind `SearchBroker`; do not create provider-named product tools.
- Browser AI wrappers do not duplicate Seven's planner; deterministic Playwright-style primitives remain preferred.
- SQLite remains the default authoritative/local data plane; no second graph/vector database without eval proof.
- `SchemaGuard` is one validation boundary reused across models/tools/import/chart specs/etc.
- `CredentialVault + AuthBroker + ConnectionBroker` own credentials/connections; every provider does not invent its own storage.
- `ArtifactVerifier` concepts from W02/W04/W14/W18 should converge into one verification family.
- `ResourceGovernor` is the single admission control path for local models, speech, OCR, maps and media jobs.
- `TableSpec/ChartSpec/MapSpec/ArtifactDocument` are typed Seven surfaces, not arbitrary renderer/provider configs.
- provider SDKs are replaceable adapters, not product dependencies by default.

## 6. Android/base-APK assessment

The research remains consistent with Seven's Android-first law:

Base/core candidates are mainly small contracts/platform APIs:
- schema validators/contracts
- SQLite core metadata/state
- deterministic utility kernel
- TaskContract/permissions/lineage
- lightweight resource/observability bridge

Heavy systems remain lazy/optional/remote/host:
- browser automation
- DuckDB-Wasm
- large OCR/speech/local-LLM model packs
- SymPy/NumPy/SciPy
- MapLibre
- media transcoders
- heavy document converters

Wave 19 must follow the same rule: no large diffusion/image model weight in base APK.

## 7. Security/authority assessment

Coverage is now strong across:
- least-authority tool execution
- explicit permission classes
- side-effect uncertainty/idempotency
- sandboxing and project scopes
- credential isolation
- webhook/request authenticity
- artifact/content hashes
- archive/path traversal limits
- model/provider capability evidence
- import staging and recovery
- research/canon provenance
- derived-memory non-authority
- output/schema validation
- adversarial verification/evals

Remaining work is implementation and cross-system enforcement, not discovery of another generic security library.

## 8. Adversarial challenge: what else might look missing?

Candidates examined conceptually:

- translation/language detection: primarily model/local-classifier/product capability; no dedicated heavy tool required yet.
- databases/cloud warehouses: generic API/SQL/connector architecture already permits specialist adapters; not universal P1.
- shopping/local businesses: web/search/geo/API brokers cover the primitive; provider-specific commerce data is not a core Tool Fabric dependency.
- contacts/SMS/phone actions: privacy-heavy Android product features, not required for Seven's core AI strength.
- 3D/CAD: specialist/low-value now.
- generic automation platforms: duplicate Seven planner/API/event layers unless a concrete connector earns admission.
- more vector/graph databases: duplication without measured need.
- another agent framework: duplication of Cognitive Control Plane.

Only generative image/media remains sufficiently broad, user-visible and architecturally distinct to justify another Discovery wave.

## 9. Transition plan

Current pipeline:

`Waves 01–18 COMPLETE → Wave 19 Generative Media → Coverage Audit 03 → Broad Discovery Freeze → Tool-by-Tool Deep Polish`

Deep Polish does not mean integrating everything. Every candidate must survive:
- interface contract
- capability/permission metadata
- Android impact
- lifecycle/cancellation
- security
- lineage/provenance
- verification
- failure/recovery
- benchmarks/evals
- duplication test
- final ACCEPT / SPECIALIST / FALLBACK / EXPERIMENTAL / REJECT decision

## 10. Provisional Deep Polish order after closure

Architecture-first queue:

1. SchemaGuard / canonical tool contracts
2. MCP interoperability adapter
3. SQLite data plane / persistence contract
4. PatchTransaction
5. CredentialVault / Android SAF
6. ModelGateway / CapabilityRegistry / Groq adapter
7. Memory HybridRetriever / ContextCompiler
8. ResourceGovernor / Observability envelope
9. Recovery/Migration/Export protocol
10. Tree-sitter / code structure
11. ast-grep structural edits
12. ProjectRunner / CodeEvalSandbox
13. SearchBroker / FetchExtractBroker
14. BrowserActionBroker / Playwright
15. ResearchEvidencePlane
16. Verification specialists
17. Local Intelligence runtime/speech/OCR
18. RPG/Canon WorldDiff/SourceLedger
19. Analysis/ChartSpec/Math engines
20. Geo/Weather plane
21. Artifact Production Plane
22. Generative Media plane after Wave 19

The exact queue may be regrouped into coherent integration batches after Audit 03.

## Final audit status

**NOT YET `SATURATED_FOR_BROAD_DISCOVERY`.**

Reason: one material P1 capability gap remains.

This is intentionally a stricter verdict than simply celebrating completion of Wave 18. The campaign closes only after that gap is researched and a final audit fails to find another material P0/P1 class.

No production source was modified by this audit. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
