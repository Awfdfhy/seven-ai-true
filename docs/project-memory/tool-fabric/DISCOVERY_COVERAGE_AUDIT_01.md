# Seven Tool Fabric 2.0 — Discovery Coverage Audit 01

Date: 2026-09-13
Status: COMPLETE — DISCOVERY NOT YET SATURATED
Governing command: `DISCOVERY_COVERAGE_AUDIT_01_MAXIMUM_EFFORT_COMMAND.md`

## Verdict

Waves 01–10 now cover the **core execution, search, local intelligence, API, Android, verification, canon-simulation and research-evidence spine** of Seven very deeply.

However discovery should **not** close yet. Several high-value capability classes remain only architectural or partially covered, and four valuable tool categories were not represented strongly in the original capability map at all.

The correct next move is **not** to search for random additional libraries. It is to run a small number of targeted waves against the remaining high-value gaps, then repeat this coverage audit and begin individual Deep Polish.

## Coverage scale

- `DEEP_COVERAGE` — multiple candidates, architecture, rejection logic and integration boundaries exist.
- `PARTIAL_COVERAGE` — useful primitives exist but a dedicated capability layer/candidate audit is incomplete.
- `ARCHITECTURE_ONLY` — Seven plan exists but external/tool implementation choices have not been deeply researched.
- `UNEXPLORED_HIGH_VALUE` — capability can materially expand Seven and merits a wave.
- `UNEXPLORED_LOW_VALUE` — real capability, but poor return/weight now.
- `OUT_OF_SCOPE_FOR_TOOL_DISCOVERY` — belongs to another Ultimate Polish Boss rather than discovery.

## 1. Existing capability-map coverage

| Capability area | Coverage | Evidence / waves | Audit result |
|---|---|---|---|
| Cognitive Runtime / planner / run state | ARCHITECTURE_ONLY | existing Seven architecture + verification concepts | external agent frameworks intentionally not adopted; model/provider execution still needs Wave 12 |
| Truth / Epistemic Fabric | PARTIAL_COVERAGE | Waves 04, 08, 10 | evidence/provenance/integrity excellent; final truth-policy polish belongs to Boss architecture |
| Memory Fabric | PARTIAL_COVERAGE | Wave 03 vector/local intelligence; Wave 09 event/replay patterns | needs dedicated Wave 11 for retrieval/index/context-memory tooling |
| Context Workspace | ARCHITECTURE_ONLY | capability map | needs Wave 11 |
| Model Fabric | ARCHITECTURE_ONLY | provider abstraction concept; local runtimes Wave 03 | needs Wave 12 |
| Adaptive Compute | ARCHITECTURE_ONLY | ResourceGovernor concept | needs Wave 12/13 inputs, final logic belongs Cognitive Boss |
| Tool Runtime / interoperability | DEEP_COVERAGE | Waves 01, 02, 04, 07, 08 | strong |
| Tool Security / permissions | DEEP_COVERAGE | Waves 02, 04, 06, 07, 08 | strong |
| Side-Effect Ledger / uncertainty / idempotency | DEEP_COVERAGE | Waves 02, 04, 07, 08 | strong |
| File / Project Tools | DEEP_COVERAGE | Wave 02 + Wave 01 code structure | strong |
| Coding Agent toolset | PARTIAL_COVERAGE | Waves 01, 02, 08 | primitives strong; final agent UX/planner polish later |
| Verification / Judge | DEEP_COVERAGE | Wave 08 | strong |
| Seven Evals | PARTIAL_COVERAGE | Wave 08 | engines/evidence strong; suite design belongs Evals Boss |
| Self-Evolution | OUT_OF_SCOPE_FOR_TOOL_DISCOVERY | capability map + verification foundations | should consume Seven Evals, not become a library hunt |
| Research System | DEEP_COVERAGE | Waves 01, 04, 10 | strong |
| Search / Retrieval | DEEP_COVERAGE | Waves 01, 03, 09, 10 | strong except Memory/Context-specific retrieval |
| Knowledge / Files | DEEP_COVERAGE | Waves 01, 02, 04 | strong ingest/retrieval primitives |
| Vision | DEEP_COVERAGE | Wave 03 | strong |
| RPG / Real Works | DEEP_COVERAGE | Wave 09 | strong |
| Titles / World Linguistic | OUT_OF_SCOPE_FOR_TOOL_DISCOVERY | RPG architecture | needs product/linguistic polish, not generic third-party engine by default |
| Projects / Sessions / persistence | PARTIAL_COVERAGE | SQLite/tool architecture | migration/recovery/import/export still need Wave 14 |
| Recovery / Integrity | PARTIAL_COVERAGE | Waves 02, 04, 08, 09 | artifact/source integrity strong; backup/migration/recovery incomplete |
| Observability | PARTIAL_COVERAGE | OpenTelemetry candidate in Wave 01, Verification evidence Wave 08 | needs Wave 13 |
| Resource Governor | ARCHITECTURE_ONLY | Android constraints + benchmarks | needs Wave 13 |
| Performance tiers | PARTIAL_COVERAGE | Wave 06/08 Android concepts | runtime measurement/control needs Wave 13 |
| UX / brand / motion / accessibility | PARTIAL_COVERAGE | axe/UI Automator/Playwright in Wave 08 | visual polish is separate Boss; no need random UI libraries yet |
| Arabic / RTL | PARTIAL_COVERAGE | release/UI tests, FTS note Wave 09 | dedicated linguistic/product eval later, not generic Tool wave |
| Generative / Typed UI | ARCHITECTURE_ONLY | capability map | data visualization/typed-output primitives merit Wave 15; general UI framework hunt rejected |
| Provider Layer | ARCHITECTURE_ONLY | Wave 07 auth + Wave 03 local models | Wave 12 required |
| Local Intelligence | DEEP_COVERAGE | Wave 03 | strong |
| Streaming / real cancellation | PARTIAL_COVERAGE | tool cancellation concepts, Wave 07 remote actions | provider/model-specific mechanics need Wave 12 |
| Import / Export | ARCHITECTURE_ONLY | capability map | Wave 14 required |
| Permission / lineage / idempotency / uncertainty | DEEP_COVERAGE | Waves 02, 04, 07, 08 | strong |
| Release/CI gates | DEEP_COVERAGE | Wave 08 + existing CI | strong |
| GitHub Project Memory | DEEP_COVERAGE | current process | strong |

## 2. Original Tool Fabric research-domain coverage

### DEEP_COVERAGE
- Web / Search / Browser
- Research
- Coding structure
- Files / Projects
- Shell / Execution boundaries
- Git / patch transactions
- Testing / Debugging / verification
- Local data / SQLite / DuckDB roles
- Documents / PDF ingestion
- Vision / OCR
- Audio / Speech
- Embeddings / vector retrieval
- Local Intelligence
- MCP / protocol interoperability
- APIs / remote actions
- Automation / Android scheduling
- Security / permissions / sandboxing
- Verification / judges
- knowledge/canon graph queries
- Android / on-device capabilities
- RPG / Simulation
- Real Works / Canon
- scholarly evidence / citation research

### PARTIAL or still missing
- memory-specific indexes/retrieval/reconstruction
- context selection/tokenization/compression
- model/provider runtime/routing
- structured model outputs/tool-call normalization
- streaming/cancellation across model providers
- observability/telemetry/performance measurement
- resource/thermal/battery governor feedback
- migrations/import/export/backups/recovery
- general quantitative/scientific computation beyond exact decimal utilities
- visualization/typed analytical presentation
- geospatial/maps/weather/structured world data
- document/media **production/transformation**, not just ingestion
- productivity connector capability packs after generic auth

## 3. High-value domains discovered outside the original map

### A. Data Analysis & Visualization — UNEXPLORED_HIGH_VALUE

Missing user value:
- turning CSV/JSON/SQLite query results into trustworthy tables/charts/statistics;
- typed chart specs for Generative UI;
- reproducible analysis artifacts.

Why Waves 01/05 do not finish it:
- DuckDB/SQLite solve data execution, not statistical/visual presentation;
- no chart-spec, safe rendering or analytical result contract has been researched.

Proposed wave: **Wave 15**.

Reject the wave if a tiny built-in typed chart/table layer plus existing SQL fully covers the intended user tasks after evaluation.

### B. Mathematical / Symbolic / Scientific Compute — UNEXPLORED_HIGH_VALUE

Wave 05 gives exact deterministic arithmetic, units and dates, but not:
- symbolic algebra
- equation solving
- calculus
- matrix/scientific operations
- constrained local Python/scientific fallback

Proposed wave: **Wave 16**.

Android rule: no giant Python/scientific bundle in startup path. Host/lazy/local-pack strategies only.

### C. Geospatial / Maps / Weather / Public World Data — UNEXPLORED_HIGH_VALUE

Seven currently lacks a normalized real-world spatial/environment tool plane.

Potential capabilities:
- geocoding/reverse geocoding
- route/place/POI data
- coordinates/geometry
- weather/forecast
- timezone derived from coordinates where needed
- map rendering as typed UI

Proposed wave: **Wave 17**.

Privacy and provider-usage policies are critical. Exact user location is never inferred or transmitted without authoritative user/platform permission.

### D. Document / Media Production — UNEXPLORED_HIGH_VALUE

Current waves focus heavily on **reading** content. Missing:
- creating/exporting PDF/doc-like reports
- safe image transforms
- audio/media transformations
- archive/export packages
- metadata-aware conversions

Proposed wave: **Wave 18**, but keep it narrow and lazy.

## 4. Remaining architectural tool waves

### Wave 11 — Memory + Context Tooling — P0

Research:
- lexical/vector/hybrid memory retrieval
- temporal/entity/causal index primitives
- token accounting
- context ranking
- deterministic compression/reconstruction
- context cache strategies
- reranking
- memory extraction validation
- long-session retrieval eval tooling

Must preserve Seven law: summaries/embeddings/caches are derived, never authoritative.

### Wave 12 — Model / Provider Runtime — P0

Research:
- provider adapters
- capability discovery/profiles
- OpenAI-compatible dialect differences
- tool-call/structured-output schemas
- JSON-schema constrained generation where available
- streaming protocols
- cancellation semantics
- context/token accounting per model
- reasoning controls
- vision/tool-use capability detection
- fallback/routing
- local/remote model health

No model/provider SDK owns product logic.

### Wave 13 — Observability + Resource Governor — P0

Research:
- lightweight metrics/tracing
- Android memory/CPU/thermal/battery/network signals
- startup/frame/app-size measurement
- trace/event buffering
- privacy/redaction
- adaptive concurrency and workload budgets
- crash/error evidence boundaries

Goal: Seven can measure whether its intelligence/tooling is making the phone worse.

### Wave 14 — Recovery + Migration + Import/Export — P0

Research:
- SQLite/schema migrations
- transaction journals/checkpoints
- export archive format
- integrity manifests/hashes
- backup/restore
- partial/corrupt import recovery
- APK upgrade migration
- secrets exclusion
- version compatibility
- optional sync only if authority can be preserved

## 5. Later capability-expansion waves

### Wave 15 — Data Analysis & Typed Visualization — P1
### Wave 16 — Math / Symbolic / Scientific Compute — P1
### Wave 17 — Geospatial / Maps / Weather / Structured World Data — P1
### Wave 18 — Document / Media Production & Transformation — P1
### Wave 19 — Productivity Connector Capability Packs — P2

Wave 19 should evaluate normalized capability groups such as:
- mail read/search/draft/send
- calendar read/create/update
- cloud files
- code hosting/issues/PRs
- notes/tasks

But provider-specific integration only becomes worthwhile after Wave 07 Auth/ConnectionBroker and Wave 12 model/tool execution contracts are stable. Do not hard-wire dozens of provider SDKs.

## 6. Low-value / defer domains

### Full generic game engine
`UNEXPLORED_LOW_VALUE / REJECTED` for current Seven architecture. Wave 09 deterministic world controller is stronger and lighter.

### Second graph database
`UNEXPLORED_LOW_VALUE / REJECTED` unless future evals prove SQLite-derived graph views fail at real workloads.

### Full collaborative CRDT authority
`UNEXPLORED_LOW_VALUE` for canonical state. Could later serve drafts/notes, but not core truth/canon/memory authority.

### Generic UI framework replacement
`OUT_OF_SCOPE`. Current Beta UI is already real product work. Tool discovery must not trigger a rewrite.

### Huge local scientific/runtime bundles in base APK
`REJECTED`. Any such capability must be optional/lazy/host-side.

## 7. Duplication guard

Future waves must reuse existing contracts instead of adding synonyms:
- provider credentials → Wave 07 CredentialVaultBridge
- rate limits/retries → Wave 07
- schema validation → Wave 01 SchemaGuard
- sandboxing → Wave 02
- source provenance → Wave 04 SourceLedger
- deterministic utilities → Wave 05
- Android permissions/capabilities → Wave 06
- verification/evidence → Wave 08
- canon state/branches → Wave 09
- research evidence → Wave 10

If a new candidate cannot enter through an existing boundary or justify a new capability boundary, presume duplication until proven otherwise.

## 8. Next execution order

P0 architecture closure:

`Wave 11 Memory/Context → Wave 12 Model/Provider → Wave 13 Observability/Resources → Wave 14 Recovery/Migration`

P1 capability expansion:

`Wave 15 Analysis/Visualization → Wave 16 Math/Scientific → Wave 17 Geospatial/World Data → Wave 18 Production/Transformation`

Then run **Discovery Coverage Audit 02**.

Only if Audit 02 still finds material gaps should more general discovery waves be created. Otherwise close broad Discovery and begin **tool-by-tool Deep Polish**.

## 9. Saturation assessment

Current state: **NOT SATURATED**.

Reason:
- four existing Seven core systems still lack deep tool implementation research (Memory/Context, Model Fabric, Resource/Observability, Recovery/Migration);
- four high-value general-assistant capabilities are genuinely underexplored (analysis/visualization, mathematical/scientific, geospatial/world data, content production).

However the search space is now bounded. Random library hunting has diminishing expected value. Remaining discovery should be targeted to Waves 11–18 and then re-audited.

No production code was modified by this audit. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
