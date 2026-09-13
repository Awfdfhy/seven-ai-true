# Seven AI — Capabilities & Tools Map

> **Purpose:** Canonical inventory of Seven's planned and implemented systems, capabilities, runtime layers, tools, product surfaces, safety boundaries, verification infrastructure, and the complete Tool Fabric 2.0 capability expansion discovered through Waves 01–19.
>
> **Important:** This is an inventory and architecture map, **not** a claim that every item is already implemented. Implementation truth belongs in `SEVEN_STATUS.md` and `SEVEN_IMPLEMENTATION_MATRIX.md`. Tool research status and candidate evidence live under `docs/project-memory/tool-fabric/`.

---

# Core Seven Capability Map

## 1. Cognitive Runtime
- Cognitive Control Plane 2.0
- Task Contract
- Dynamic Execution Graph
- Durable Run Kernel / explicit state machine
- Stop / Continue / Retry
- Recovery-aware execution
- Planner + tool/model orchestration
- Capability-aware planning
- Cost/risk-aware execution paths
- Explicit BLOCKED / FAIL / INCONCLUSIVE states

## 2. Truth / Epistemic Fabric
- FACT / CLAIM / INFERENCE / ASSUMPTION / UNKNOWN / CONFLICT states
- Evidence provenance
- Freshness / recency awareness
- Contradiction tracking
- Confidence that does not exceed source authority
- Model output is not truth by default
- Tool output is not treated as success until verified
- Derived data cannot gain authority through repetition or summarization
- Source identity / version / hash awareness
- Authority-safe canonical commit

## 3. Memory Fabric
- Append-only authoritative memory event ledger
- Event / Entity / Semantic derived views
- Temporal / Causal / Lexical / Vector indexes
- Hierarchical retrieval
- Chain-of-Memory style retrieval strategies
- Summaries remain derived, not authoritative
- Room / session / project memory
- Long-session continuity
- Memory lineage and reconstruction
- SQLite FTS5 lexical/BM25 retrieval direction
- Optional vector index layer
- Optional local embeddings / reranking
- Hybrid retrieval before vector-only retrieval
- Entity/time/causal indexes

## 4. Context Fabric / Context Workspace
- Context Compiler
- Pin / Compress / Expand / Evict / Reconstruct
- Category-specific token budgets
- Selective inclusion of messages, memories, files, evidence, code and canon
- Context priority and relevance scoring
- Reconstructable derived context instead of destructive compression
- EXACT / PROVIDER_REPORTED / ESTIMATED / UNKNOWN token accounting states
- Model-specific tokenizer adapters rather than a fake universal tokenizer
- Locale-aware chunk boundaries
- Arabic-aware segmentation
- Optional lossy compression only as a derived layer

## 5. Model Fabric
- Provider abstraction
- Model abstraction
- Capability profiles
- Reasoning profiles
- Coding / Vision / Tool-use capability awareness
- Context-window awareness
- Free-model proof classes / eligibility
- Provider/model switching without rewriting product logic
- Model routing by task
- Provider dialect adapters
- Streaming normalization
- Structured-output normalization
- Tool-call normalization
- Usage/token normalization
- Cancellation normalization
- Prompt-cache capability awareness
- Batch capability awareness
- Multimodal capability profiles
- Provider health / fallback state
- Local / remote backend parity contracts
- Model lifecycle / deprecation awareness

## 6. Adaptive Compute
- Dynamic reasoning depth
- Dynamic model strength
- Dynamic retrieval depth
- Dynamic verification depth
- Dynamic tool count
- Dynamic context breadth
- Lightweight path for simple tasks
- Deeper path for complex / critical tasks
- Resource-governor-informed compute selection
- Thermal / memory / battery aware degradation
- Local-vs-remote compute routing

## 7. Tool Runtime / Tool Fabric
- Tool registry
- Canonical capability identities
- Capability normalization
- Duplicate / alias merging
- Capability graph
- Progressive tool discovery
- Plan-aware dependency retrieval
- Schema validation
- Argument validation
- Result validation
- Tool pinning and hashes
- Timeouts
- Retries
- Cancellation
- Idempotency
- Permission checks
- Side-effect uncertainty handling
- Schema drift detection
- Tool provenance / lineage
- Tool health state
- Capability catalogue versioning
- Lazy tool loading
- Tool ranking by task / cost / reliability / latency
- External adapter isolation

## 8. Tool Security Kernel
- READ_LOCAL / READ_REMOTE
- WRITE_LOCAL / WRITE_REMOTE
- EXECUTE
- NETWORK
- UPLOAD / DOWNLOAD
- DELETE / RENAME
- EXTERNAL_ACCOUNT_ACTION
- USER_INTERACTION
- Authority binding to original permission events
- Protected side-effect operations
- Explicit verification after actions
- No permission escalation via model/tool echo
- Untrusted remote metadata cannot grant authority
- Endpoint/domain scoping
- Prompt/resource injection defenses
- Sensitive argument preview / confirmation where policy requires
- Cache scoping by authenticated principal

## 9. Side-Effect Ledger
Tracks:
- requested action
- tool used
- target resource
- timestamp / run
- returned result
- verified effect
- uncertainty state
- retry safety
- rollback/checkpoint relation where applicable
- dispatch certainty
- reconciliation evidence
- idempotency key

Canonical side-effect classes:
- NONE
- OBSERVATIONAL
- REVERSIBLE_WRITE
- IRREVERSIBLE_WRITE
- EXTERNAL_COMMUNICATION
- UNKNOWN_EFFECT

## 10. File & Project Tools
- List files
- Read file / range
- Search files
- Search text
- Inspect project structure
- Create file
- Edit file
- Patch file
- Copy file
- Rename file with safeguards
- Delete file with safeguards
- Directory operations
- File metadata
- Compare versions
- Checkpoint / restore concepts
- Project map / project graph
- Safe archive inspection
- File-type detection
- Integrity hashes
- Structured project context
- Protected-path rules

## 11. Coding Agent
- Project Context
- Project Map
- Read / inspect / edit workflows
- Patch transactions
- Structural code search
- Structural editing direction
- Selective testing
- Auto Repair Loop: Inspect -> Edit -> Test -> Error -> Fix -> Test
- Stop / Continue / Retry
- Tool activity timeline
- Terminal output as structured chat bubbles
- Collapse / expand long output
- Copy per output bubble
- Checkpoints
- Verification before canonical commit
- Protected delete / rename
- No fake shell or fake successful actions
- Host-side security scanning specialists
- Static analysis specialists
- Mutation/property testing integration path

## 12. Verification / Judge Layer
- Goal-completion checking
- Constraint checking
- Scope drift detection
- Code/test verification
- Research evidence verification
- Tool-effect verification
- Changed-file verification
- PASS / FAIL / REPAIR decisions
- Artifact-bound evidence
- Property-based testing
- Failure injection
- Fuzzing support on host/CI
- Static/security analysis support
- Dependency / secret / SBOM verification
- Accessibility verification
- Mobile performance verification

## 13. Seven Evals
- Old vs New comparisons
- Accuracy
- Latency
- Token / context cost
- Tool success
- Hallucination rate
- Coding success
- Canon fidelity
- Recovery reliability
- Memory retrieval quality
- UX regressions
- Performance regressions
- Provider-routing quality
- Side-effect correctness
- Cancellation correctness
- Resource cost
- Battery / thermal impact
- Self-evolution changes must pass eval gates

## 14. Self-Evolution Engine
- Observe
- Propose
- Sandbox
- Evaluate
- Compare
- Accept / Reject

Potential improvement targets:
- prompts
- routing
- model selection
- tool selection
- memory retrieval
- context budgets
- retry policies
- verification strategies
- system heuristics
- provider profiles
- performance thresholds

## 15. Research System
- Query decomposition
- Search
- Retrieve
- Rank / rerank
- Deduplicate
- Cross-check
- Contradiction detection
- Source quality
- Freshness
- Evidence synthesis
- Citations
- Epistemic-state integration
- Scholarly identity deduplication
- Retraction / correction checks
- OA resolution
- Citation graph support
- Organization identity support
- Evidence packs

## 16. Search / Retrieval Tools
- Web search
- Page retrieval
- Document retrieval
- Project search
- Memory search
- Semantic search
- Lexical search
- Canon search
- Source search
- Reranking
- SearchBroker
- FetchExtractBroker
- BrowserActionBroker
- Cheap/direct path before expensive browser escalation
- Multi-provider search adapters
- Self-host search fallback
- Lightweight reader/extraction fallback

## 17. Knowledge / Files
- TXT ingestion
- PDF ingestion
- Project documents
- Room / project knowledge bases
- Selective retrieval into context
- Source-backed knowledge rather than unconditional full-file injection
- Document conversion/extraction specialists
- Metadata extraction
- Archive inspection
- Content hashing
- SourceLedger binding

## 18. Vision
- Image understanding
- Screenshot inspection
- UI inspection
- Document / diagram interpretation
- Visual debugging
- Vision-capable model routing only when needed
- OCRBroker
- Platform OCR path
- Optional local OCR model pack
- Document scanner integration path
- Image provenance metadata path

## 19. RPG Engine
- World State
- Character State
- Relationship State
- Knowledge State
- Rules / powers / invariants
- Inventory / locations / events
- Continuity
- Timeline
- Consequences
- Model proposes narrative/world changes
- Verified controller commits state
- Typed WorldDiff
- Deterministic rules
- Replayable PRNG
- Explicit branches / conflicts
- Derived graph views
- Timeline / knowledge / world validator

## 20. Real Works / Canon Simulation Engine
- Canon Graph
- Source hierarchy / provenance
- Timeline / episode / event graph
- Character identity and knowledge-state
- Relationship graph
- Rules / powers
- World state
- Safe player insertion engine
- Scene contracts
- Source refs
- Anchors
- Required facts
- Forbidden changes
- CANON vs DIVERGENCE / WHAT-IF
- CANON_GAP for insufficient source coverage
- Explicit divergence rather than fake canon preservation
- Canon SourceLedger
- Source identity/version/hash/anchors/coverage/lineage
- Branch-aware canon validation

## 21. Titles / World Linguistic Engine
Naming support for:
- Episodes
- Chapters
- Arcs
- Seasons
- Side Stories
- Specials
- OVAs
- Fillers
- What Ifs
- Games
- DLC-style content
- Events
- Quests
- Achievements
- Locations
- Organizations
- Powers
- Artifacts

Titles should inherit the linguistic DNA of each world rather than generic naming templates.

## 22. Projects System
- Persistent project scope
- Files
- Memory
- Context
- Goals
- Instructions
- Agent state
- Run history
- Tools
- Checkpoints
- Export/import boundary
- Project integrity manifest

## 23. Sessions / Persistence
- Rooms
- Titles
- Messages
- Settings
- Selected model
- Project state
- Memory
- Run state
- Recovery after reload
- Migration path beyond localStorage-only persistence
- Schema versioning
- Upgrade migrations
- Integrity verification

## 24. Recovery / Integrity
- Source-integrity checks
- State recovery
- Corruption handling
- Checkpoints
- Execution records
- Rollback concepts
- Release artifact verification
- Protected source guarantees
- SQLite online backup strategy
- quick_check / integrity_check path
- Versioned migrations
- Transactional imports
- Export manifests / hashes
- Partial/corrupt import recovery
- Secrets exclusion
- Compatibility/version gates
- Optional sync only when authority can be preserved

## 25. Observability
- Selected model
- Tools used
- Timings
- Errors
- Retries
- Context size
- Token estimates
- Verification result
- Run state
- Performance tier
- Internal execution traces suitable for debugging without exposing private reasoning
- Lightweight structured telemetry
- Redaction/privacy boundaries
- Artifact-bound diagnostics
- Android exit/crash/ANR evidence
- Network-use evidence
- Thermal evidence
- Resource-governor decisions

## 26. Resource Governor
- RAM awareness
- CPU pressure awareness
- Battery impact awareness
- Thermal status / headroom awareness
- Network pressure awareness
- Context size control
- Model-call pressure
- Concurrent job limits
- Expensive UI effect suppression
- Lazy loading
- Startup budget enforcement
- Hysteresis to avoid oscillating tiers
- Evidence tiers for imperfect device signals
- Heavy local inference suppression under pressure
- Adaptive concurrency / workload budgets

## 27. Performance Tiers
- Full
- Balanced
- Lite

Lite principles:
- Disable expensive blur/effects
- Minimize animations
- Lazy-load heavy features
- Simpler rendering
- Reduce local model concurrency
- Reduce optional verification depth where safe
- Preserve functionality over decoration

## 28. UX Runtime
- Component states
- Semantic UI states
- Workspace states
- Typed / generated UI where appropriate
- Responsive behavior
- Accessibility behavior
- Mobile-first interactions
- Tool progress / uncertainty states
- Long-running task states

## 29. Day / Night Identity System
Day:
- clean bright surfaces
- restrained cool depth
- Seven Blue / Cyan identity

Night:
- midnight/navy surfaces
- controlled blue/cyan light
- low glare

Both share the same Seven shape DNA.

## 30. Seven Brand System
- Curved / ribbon-like `7`
- Simple silhouette
- Curved geometry
- Ribbon continuity
- Seven Blue / Cyan
- Day/Night compatible
- Monochrome capable
- Suitable for app icon / clothing / hardware
- Avoid generic AI sparkle / brain / circuit / robot / infinity / crypto aesthetics

## 31. Aurora Semantic State System
States:
- Idle
- Thinking
- Research
- Coding
- RPG
- Success
- Warning
- Error

Aurora may affect accents, subtle lighting, status presentation and motion intensity, but never authority or truth status.

## 32. Animation System
- Meaningful motion only
- Lightweight
- Interruptible where applicable
- Reduced Motion compatible
- Performance-tier aware
- No constant decorative loops
- Workspace / composer / status / tool / success transitions
- Future ribbon-DNA motion language

## 33. Accessibility
- Reduced Motion
- Contrast
- Touch target sizing
- Phone layout robustness
- Focus behavior
- Arabic readability
- RTL
- Bidi-safe code and mixed-language content
- Chart/table accessibility
- Generated-media accessibility metadata path

## 34. Arabic / RTL
- True RTL layouts
- Direction-aware UI
- Arabic typography
- Arabic Markdown
- Mixed Arabic / English / code safety
- Mobile RTL verification
- Locale-aware segmentation

## 35. Workspace Hub
Current / established surfaces:
- Coding Workspace
- RPG / Real Works Workspace

Possible future workspaces:
- Research
- Files / Knowledge
- Projects
- Memory Inspector
- Model Lab
- Data Analysis
- Media / Documents

## 36. Generative / Typed UI
Potential typed surfaces:
- status cards
- progress views
- code diffs
- research results
- tables
- timelines
- RPG state
- source cards
- file trees
- charts
- maps
- weather cards
- media job status

Generated UI must be schema-bound / typed rather than arbitrary unsafe HTML.

## 37. Provider Layer
- Groq
- OpenRouter
- direct providers
- local runtimes
- future providers
- OpenAI-family adapter path
- Anthropic-family adapter path
- Gemini-family adapter path
- Mistral / Cerebras / Together / Fireworks / xAI class adapters where justified

Provider choice should not leak into product-level logic. "OpenAI-compatible" is treated as a dialect family, not a guarantee of identical behavior.

## 38. Local Intelligence Plane
- Local embeddings
- Local reranking
- Classification
- Intent detection
- Memory selection
- Lightweight fallback
- ONNX Runtime Mobile direction
- llama.cpp fallback direction
- Optional model packs
- No large model downloads on startup
- Hash/license/runtime/size eligibility metadata for local packs

## 39. Streaming
- Incremental response rendering
- Streaming-aware status UI
- Streaming-aware tool events
- Integration with cancellation
- Provider event normalization
- Partial tool-call assembly
- Usage/final-state reconciliation

## 40. Real Cancellation
- AbortController / provider cancellation where supported
- Stop generation
- Stop streams
- Stop compatible tools
- Stop chained tasks safely
- Best-effort remote cancellation
- Explicit `CANCELLED_UNCERTAIN` where remote effects may already exist

## 41. Import / Export
Target coverage:
- chats
- rooms
- settings
- memory
- projects
- knowledge
- safe upgrade / APK migration
- versioned archive manifest
- checksums
- schema compatibility
- user-selected export destination via platform file APIs
- secrets excluded by default

## 42. Permission System
- Read
- Write
- Execute
- Network
- Delete
- Rename
- Upload / Download
- External side effects
- External account actions
- User-interaction requirements

Permissions must bind to authoritative user grants and must not become permanent merely because an AI or tool echoed them.

## 43. Lineage System
Derived objects retain links to:
- source
- transformation
- resulting object

Applies to:
- memories
- summaries
- research facts
- tool results
- canon state
- generated context
- charts
- generated documents
- generated media
- remote tasks

## 44. Idempotency
- Avoid duplicate side effects during retries
- Track retry-safe operations
- Detect operations that must be verified before retrying
- SAFE_REPEAT
- KEYED_REPEAT
- DO_NOT_REPEAT
- UNKNOWN

## 45. Side-Effect Uncertainty
If a request may have completed but confirmation was lost, represent it as unknown rather than automatically failed. Verify the real-world state before retrying.

Normalized uncertainty/error states include:
- TIMEOUT_BEFORE_DISPATCH
- TIMEOUT_AFTER_DISPATCH_UNKNOWN
- CANCELLED_CONFIRMED
- CANCELLED_UNCERTAIN
- SCHEMA_DRIFT
- MALFORMED_RESULT
- TASK_LOST

## 46. Release Screenshot Verification
Verified release screenshot targets:
- Chat Night
- Chat Day
- Aurora Thinking
- Workspace Launcher
- Coding Agent
- RPG / Real Works

Screenshots must come from the actual verified release artifact, not concept mockups.

## 47. CI / Release Gates
- Unit / browser tests
- Source integrity
- Build verification
- Release boot
- Mobile widths
- RTL
- Day / Night
- Reduced Motion
- Lite tier
- Overflow
- Contrast
- Startup budget
- Lazy workspace loading
- Screenshot capture
- Property tests
- Security/static analysis on host/CI
- Dependency vulnerability checks
- Secret scanning
- SBOM generation direction
- Android performance/macrobenchmark direction

## 48. GitHub Project Memory
Canonical durable project-memory files:
- `SEVEN_MASTER_PLAN.md`
- `SEVEN_DECISIONS.md`
- `SEVEN_STATUS.md`
- `SEVEN_CAPABILITIES_MAP.md`
- `SEVEN_ULTIMATE_POLISH_PLAN.md`
- `SEVEN_SECOND_ULTIMATE_POLISH_PLAN.md`
- `SEVEN_MAXIMUM_EFFORT_COMMAND_PROTOCOL.md`
- `tool-fabric/SEVEN_TOOL_FABRIC_2_RESEARCH_PROTOCOL.md`
- `tool-fabric/DEEP_POLISH_MASTER_QUEUE.md`
- Tool Fabric discovery waves / coverage audits / deep-polish specs

---

# Tool Fabric 2.0 Expansion

The following capability planes were added or significantly expanded through Tool Fabric 2.0 Waves 01–19. They are part of Seven's canonical capability map even when their final implementation is pending Deep Polish.

## 49. Canonical Tool Contract / SchemaGuard
- Canonical Seven-owned tool descriptor
- JSON Schema boundary validation
- Argument validation before dispatch
- Result validation before authoritative use
- Schema hashes / revisions
- Schema drift detection
- Trusted internal validator path
- Standalone/generated-validator option to avoid heavy mobile runtime dependencies
- Unknown/malformed output blocked from canonical commit
- Tool capability/risk/permission/idempotency metadata

## 50. Tool Interoperability Gateway / MCP Adapter
- MCP as interoperability transport, never authority
- Server fingerprint identity
- Collision-safe external tool IDs
- Capability normalization into Seven IDs
- MCP tool/resource/prompt normalization
- Auth/principal-bound cache
- Schema drift handling
- MCP Tasks mapped to Seven task state without replacing TaskContract
- Remote cancellation reconciliation
- Progressive schema retrieval to avoid context bloat
- Remote annotations treated as untrusted hints
- Modern MCP protocol adapter direction
- Host/bridge handling for local-process transports

Deep-polish spec already exists under `tool-fabric/deep-polish/` but is not yet frozen/implemented.

## 51. SearchBroker
Canonical broker over multiple search providers:
- query normalization
- provider capability/rate-limit awareness
- source provenance
- result deduplication
- freshness metadata
- fallback routing
- provider health
- cheap/direct search before heavier browsing

Candidate classes researched include independent search providers, research-oriented search APIs, and self-host search fallback.

## 52. FetchExtractBroker
- URL/page retrieval
- content extraction
- reader-mode extraction
- difficult-page escalation
- crawl specialist path
- source content hash
- MIME/type handling
- extraction provenance
- raw vs derived content separation

## 53. BrowserActionBroker
- Deterministic browser action execution
- Navigation / click / type / form interaction
- Screenshot/evidence capture
- Host-side Playwright path
- Persistent browser loop only when justified
- Browser actions treated as side effects where applicable
- Arbitrary browser-code execution treated as privileged host capability

## 54. CodeStructureEngine
- Tree-sitter style syntax structure
- Structural search/editing
- AST-aware code operations
- Text search fallback
- Language-aware patch support
- Syntax/result validation
- Host-side static/security analysis specialists

## 55. Data / SQL Plane
- SQLite canonical local data authority
- FTS5 lexical/BM25
- JSON functions
- recursive CTEs
- foreign keys / transactions
- DuckDB-Wasm specialist analytical path
- Typed query results
- Reproducible analytical operations
- No second database unless evals prove need

## 56. API Contract Engine
- OpenAPI 3.1 family contract ingestion
- Capability extraction
- Request/response schema validation
- Endpoint/action normalization
- API descriptions never grant permission
- Contract drift detection

## 57. API Action Broker
- Remote API execution behind Seven permissions
- Auth/connection binding
- rate-limit handling
- timeout classification
- idempotency awareness
- conditional requests / ETag support where useful
- retry safety
- verification/reconciliation after writes

## 58. Event Contract / Webhook Plane
- AsyncAPI family event-contract support
- WebhookIngress
- Raw-byte signature verification before parsing
- Standard webhook security patterns
- EventEnvelope
- CloudEvents-style normalized metadata path
- Replay/duplicate-event protection
- Event source provenance

## 59. AuthBroker / ConnectionBroker
- OAuth/OIDC native-app safe flow
- PKCE
- authorization metadata/discovery
- token revocation
- resource indicators
- DPoP-capable path where appropriate
- connection identity separate from user identity
- multi-account support
- refresh-token rotation awareness
- no token passthrough between unrelated systems
- explicit provider principal/scope binding

## 60. RemoteActionBroker
- Authenticated remote side effects
- connection-scoped execution
- provider-specific retries isolated behind adapter
- ambiguous result -> UNCERTAIN
- downstream status/read-back reconciliation
- provider idempotency-key support where available

## 61. Deterministic Utility Plane
- ExactMath
- DateTimeEngine
- UnitEngine
- StructuredDataEngine
- SafeMarkupEngine
- ArticleExtractor
- TextEngine
- SafePatternEngine
- CompressionEngine

Includes:
- BigInt exact integer path
- exact decimal arithmetic direction
- Temporal capability path
- UCUM semantic units
- URL parsing
- JSON/YAML/CSV/XML handling
- Markdown parsing
- HTML sanitization
- readability extraction
- Intl.Segmenter
- Unicode normalization
- safe regex engine option
- native compression streams / archive specialists

## 62. VisionCapture / OCR Plane
- platform image capture path
- OCRBroker
- mobile OCR
- optional stronger OCR pack
- document scanner integration
- screenshot/document text extraction
- OCR provenance and confidence metadata
- lazy loading of heavy OCR models

## 63. SpeechBroker
- local/offline ASR specialist path
- speech recognition model packs
- provider/host speech fallback
- cancellation/progress
- optional whisper-family local specialist
- mobile resource budget controls

## 64. Portable Inference Runtime
- ONNX Runtime Mobile candidate
- model-pack loading
- runtime/model size accounting
- latency/power measurement
- optional WebView/Wasm inference specialists
- custom/minimal builds where justified
- no heavyweight inference runtime in startup path without evidence

## 65. Embedding / Rerank Engine
- model-specific local embedding packs
- local reranking
- hybrid lexical+semantic retrieval
- optional vector indexes
- model/version/hash metadata
- lazy indexing
- derived index rebuildability

## 66. Android Device Capability Plane
- WorkManager-style persistent deferrable jobs
- AlarmManager only for genuine exact user-facing timing
- NotificationBridge
- ShareBridge
- Photo Picker / SAF media grants
- ClipboardBridge
- CaptureBridge
- DeviceSignals
- IntentBridge
- UserPresenceGate / BiometricPrompt
- AppLinkIngress
- SettingsHandoff
- NetworkCallback rather than polling
- visible mic/camera state
- no hidden always-on polling

## 67. Verification Arsenal
Host/CI specialists researched for:
- unit/integration/browser verification
- property-based testing
- mutation testing
- API contract fuzzing
- static analysis
- CodeQL-style deep analysis
- dependency vulnerability scanning
- secret scanning
- SBOM generation
- accessibility tests
- Android Macrobenchmark / UI automation / baseline profiles

Heavy scanners/fuzzers stay out of the base APK.

## 68. Research Evidence Plane
- Open scholarly graph/search adapters
- DOI metadata providers
- dataset/software DOI metadata
- citation/recommendation graph specialists
- citation graph corroboration
- preprint sources
- OA resolution
- retraction/correction checking
- biomedical source adapter
- organization identity
- citation formatting
- source/work deduplication
- citation count never treated as truth

## 69. Canon Graph Tools
- deterministic typed WorldDiff
- JSON Pointer-style addressability
- JSON Patch-style diff reference
- SQLite recursive graph traversal
- FTS canon search
- replayable random state
- explicit branch/conflict semantics
- rule allowlists
- graph-algorithm specialist only if required
- CRDT automatic canon conflict resolution rejected for authority-sensitive state

## 70. Observability + Mobile Resource Evidence Plane
- lightweight metrics/tracing
- privacy/redaction
- ApplicationExitInfo-style crash/ANR/low-memory evidence
- thermal status/headroom
- app network traffic evidence
- startup/frame/app-size measurement
- adaptive concurrency
- trace/event buffering
- evidence-confidence tiers
- no secret/content logging by default

## 71. Recovery / Migration Plane
- schema migrations
- transaction journals/checkpoints
- online database backup
- integrity manifests/hashes
- backup/restore
- partial/corrupt import recovery
- APK-upgrade migration
- secrets exclusion
- version compatibility
- transactional staged import
- user-controlled export destination

## 72. Data Analysis Plane
- CSV/JSON/SQLite analysis
- typed analytical datasets
- deterministic transformations
- summary statistics
- reproducible analysis artifacts
- provenance from input dataset to output result
- analysis separated from presentation

## 73. Typed Visualization Plane
Seven-owned typed specs:
- `TableSpec`
- `ChartSpec`

Capabilities:
- safe chart rendering
- replaceable renderers
- SVG/accessibility-friendly path
- lightweight canvas renderer path
- declarative visualization specialist path
- axis/unit/source metadata
- no arbitrary generated HTML/JS

## 74. Math / Symbolic / Scientific Compute
- exact arithmetic
- complex/fraction/unit math
- matrices
- symbolic differentiation
- equation solving
- calculus specialist path
- scientific array/numerical path
- local lightweight JS math path
- heavy SymPy/NumPy/SciPy-style host/remote sandbox path
- giant Python runtime rejected from base APK

## 75. Geospatial / World Data Plane
- GeoJSON/WGS84 interchange
- coordinate/geometry operations
- geocoding/reverse geocoding
- places / POI queries
- routing
- weather / forecast
- timezone/location-derived metadata where justified
- map rendering as typed UI
- location privacy/permission boundary
- provider attribution/policy compliance

## 76. Document Production Plane
- PDF generation/editing
- DOCX generation
- spreadsheet generation
- report production
- structured export packages
- metadata-aware output
- document validation
- local lightweight generation where practical
- heavy office conversion delegated to host/service if needed

## 77. Media Transformation Plane
- image resize/crop/rotate/format conversion
- audio/video trim/conversion
- Android-native Media3/MediaCodec path
- progress/cancellation
- metadata handling
- WebCodecs low-level web path where useful
- FFmpeg host specialist
- ffmpeg.wasm not default Android path due weight/performance

## 78. Generative Media Plane
- image generation
- image editing
- reference-image workflows
- provider capability profiles
- output quality/size/format controls
- generation job state
- cancellation/progress
- artifact lineage
- content hash
- prompt/settings provenance where policy permits
- remote/provider path as default
- host workflow orchestration path
- experimental local diffusion path only when device/resources permit
- no massive diffusion weights in base APK

## 79. Media Provenance Plane
- C2PA/content-credentials verification path
- provenance metadata preservation where possible
- generated/edited artifact lineage
- provenance is evidence of origin/history, **not proof that depicted content is factually true**

## 80. Archive / Content Integrity Plane
- zip archive creation/inspection
- archive path-safety checks
- decompression-bomb limits
- file-type sniffing
- content hashes
- canonical JSON/integrity serialization direction
- media/document metadata inspection
- source ledger linkage

## 81. Productivity Connector Capability Plane
Future normalized capability packs may cover:
- mail read/search/draft/send
- calendar read/create/update
- cloud files
- code hosting/issues/PRs
- notes/tasks

Rules:
- generic AuthBroker/ConnectionBroker first
- no dozens of provider SDKs hardwired into core
- provider-specific adapters map to canonical capabilities
- external actions remain permission/side-effect/verification bound

---

# Tool Candidate Classification Rules

Every external tool/library/provider/protocol/model/infrastructure component discovered for Seven must be classified as one of:

- **CORE** — strong candidate for a canonical Seven capability boundary or widely reusable primitive.
- **SPECIALIST** — powerful but loaded/used only for tasks that need it.
- **FALLBACK** — resilience path when the preferred route is unavailable.
- **EXPERIMENTAL** — promising but not yet stable/proven enough for default use.
- **REJECTED** — evaluated and deliberately not adopted.

A popular tool is not automatically CORE. Adoption depends on capability fit, maintenance, license, free/usage reality, mobile weight, reliability, security, integration complexity, failure modes, and Seven Evals.

# Tool Fabric Global Laws

1. **Seven owns authority.** Providers, MCP servers, models and tools cannot grant themselves permission or truth status.
2. **Provider SDKs do not own product logic.** Vendor quirks remain behind adapters.
3. **Heavy capability is lazy.** No large models, scanners, scientific stacks, browser engines or media runtimes in the startup path without measured justification.
4. **Android-first is non-negotiable.** RAM, battery, storage, APK size, thermal state and startup are architectural constraints.
5. **Tool success must be verified when effects matter.** A returned `200`, `success`, or remote `completed` is evidence, not automatic canonical truth.
6. **Uncertainty survives.** Timeout-after-dispatch and ambiguous cancellation are represented explicitly instead of being relabeled as failure/success.
7. **Derived objects remain derived.** Embeddings, summaries, indexes, chart specs, OCR text and tool-normalized results never gain authority merely through transformation.
8. **No capability duplication without proof.** New candidates must enter through an existing capability boundary or justify a new one.
9. **Progressive discovery over context dumping.** Only shortlisted tool schemas reach model context.
10. **Deep Polish before freeze.** Discovery identifies candidates; implementation/freeze requires contracts, tests, evals, performance and failure-path proof.

# Tool Fabric Discovery State

Broad Tool Fabric discovery completed Waves **01–19** and reached `SATURATED_FOR_BROAD_DISCOVERY` in Coverage Audit 03.

This means:
- no automatic Wave 20;
- no random library hunting;
- future broad discovery reopens only when there is evidence of a real P0/P1 capability gap, a major technology shift, or an eval-proven deficiency;
- current priority is **tool-by-tool Deep Polish, implementation, wiring, verification and freeze**.

# Deep Polish State

Canonical queue:
`docs/project-memory/tool-fabric/DEEP_POLISH_MASTER_QUEUE.md`

Already present:
- MCP Adapter Maximum Effort command
- MCP Adapter Deep Polish spec

Current next foundational focus:
- Canonical Tool Contract
- SchemaGuard
- then dependency-ordered tool/platform deep polish

A Deep Polish spec is not equivalent to implementation or `FROZEN-V1`. Freeze requires verified code, wiring, failure paths, security invariants, performance evidence and relevant Seven Evals.

---

# Core Rule

This capability map is an inventory, not a claim that every item is fully implemented. Implementation status belongs in `SEVEN_STATUS.md` / `SEVEN_IMPLEMENTATION_MATRIX.md`; architectural intent belongs in `SEVEN_MASTER_PLAN.md`; Tool Fabric research belongs under `docs/project-memory/tool-fabric/`; final system-wide perfection work belongs in `SEVEN_ULTIMATE_POLISH_PLAN.md` and the later `SEVEN_SECOND_ULTIMATE_POLISH_PLAN.md`.
