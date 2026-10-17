# Seven Domain Roadmaps — cycle evidence

Ready domains: 4/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT

SOURCE_ANALYSIS=Harvested sources (20) split primary/secondary: arXiv papers on Mem0 [2504.19413] (production LTM extraction/retrieval), Zep [2501.13956] (temporal KG with episodes/facts/bi-temporal validity), LongMemEval [2410.10813], MemX [2603.16171] (local-first), Memoria [2512.12686], TeleMem [2601.06037] (multimodal), context-driven retrieval [2609.03467], UTILMEM [2608.30508] (evidence utilization). Practitioner refs: Letta memory/config [docs.letta.com], Zep Graphiti concepts (episodes, facts, context types) [help.getzep.com], Mem0 research benchmarks [mem0.ai/research]. Infra: IndexedDB [MDN], LangGraph/DeepAgents context [docs.langchain.com]. Collective view: modern LTM emphasizes (1) structured extraction (episodes/facts/entities/relations) with time/versioning (Zep bi-temporal valid_at/invalid_at), (2) retrieval quality over raw recall (context-driven retrieval, evidence utilization), (3) local-first/persistence correctness, (4) production constraints (cost/latency) with benchmarks (LoCoMo/LongMemEval). Disagreements: Mem0 emphasizes extraction pipeline + scalability; Zep emphasizes temporal KG + point-in-time queries; MemX emphasizes local-first offline. Freshness: arXiv recent (2025); docs current. Limitations: harvested pages are abstracts/docs (not full papers) and some arXiv IDs look forward-dated in list (e.g., 2603/2601/2609/2608) — treat as metadata labels, verify content if needed. No single source covers Seven’s exact RPG+chat hybrid; cross-system integration is under-specified in harvested set.

CURRENT=Seven memory domain is implemented in codebase (not just plans). Domain types/limits: `MEMORY_LIMITS` (id/content/summary up to 65k, 10k records/summaries), `createMemoryRecord/updateMemoryRecord` with strict validation (canonical non-empty strings, trimmed, lengths, priority 0-100, monotonic timestamps), `ContextSummary` v2 with `sourceFingerprint`, `migrateContextSummary` handles legacy v1->v2. Repository: `MemoryRepository` interface supports records+summaries, CAS `compareAndSwapSummary`, in-mem with capacity/duplicate checks; IndexedDB-backed `IndexedDBMemoryRepository` exists with schema (memories id, summaries roomId), bounded put with transaction-scoped count, versionchange/blocked handling, abort signals, storage errors. Service: `MemoryService` validates inputs/clock, creates records, lists by room, deletes. Context: `MemoryContextService` composes repository+summarizer+builder, enforces per-room lock (queue cap 64 per room, global cap 1024), max summary passes, abortable ops, CAS on summary writes, summary fingerprint from room prefix up to throughMessageId, guards against summarizer exceeding budget or making no progress. Tests: domain limits/identity + repo capacity/duplicates pass (vitest). VM harness `memory.cjs` runs against `seven_ai-final.html` (real source) with injected storage: 9/9 pass (ledger consistency, immutable history, write-failure snapshot preservation, corruption quarantine, metadata cannot authorize, delete commits canonical removal, legacy key unchanged, legacy noncanonical compatibility, duplicate ledger IDs rejected). Evidence: `remake/src/domain/memory/*`, `storage/memory-repository.ts`, `application/memory/*`, `application/context/*`, `memory.cjs`, `memory-results.json`.

TARGET=Harden memory/context fabric to production readiness aligned with agentic LTM best practices while preserving Seven architecture (no ownership duplication). Goals: (1) Time/versioned provenance for memories (episode-based ingestion) with bi-temporal fields where useful (valid_from/valid_to or Zep-like valid_at/invalid_at) and auditability; (2) Retrieval that goes beyond room-scoped list (semantic/search over records/summaries with filters by scope/room/priority/age) while keeping budgets; (3) Evidence utilization tracking (which retrieved items actually contributed to answer/context) to improve selection; (4) Deterministic, testable context selection with explicit omission reasons and compiled provenance (already partially present); (5) Cross-room/global user-level memory with clear scope boundaries (global vs room) and expansion isolation; (6) Local-first correctness (CAS, transaction boundaries, corruption quarantine, migration receipts) — strong foundation; (7) Benchmarks/eval hooks (LongMemEval/LoCoMo style) to prevent regressions; (8) Multimodality readiness if assets appear (TeleMem) without breaking existing types.

NOW=First high-value slice (smallest that materially improves): (a) Extend `MemoryRecord` with optional provenance fields (source type, source ref, episodeId, discoveredAt/position, certainty, continuity/branch if RPG context) while keeping schemaVersion explicit and backward compatible (validate + migration). (b) Add `episodeId` index conceptually and allow repository to filter by episode/scope; (c) Track retrieval evidence in context build (log which memory IDs/summaries were included and why) — return in `ContextBuildResult` metadata without leaking hidden content; (d) Strengthen corruption quarantine in IndexedDB path (on read, detect malformed objects and surface `STORAGE` with quarantine action) and add migration receipt recording for summary migrations; (e) Add deterministic unit tests for new fields + evidence logging. Keep changes minimal and type-safe.

NEXT=Next improvements: (a) Add semantic search interface (pluggable retriever) behind feature flag — e.g. `searchMemories({query, roomId?, scope?, limit, signal})` returning ranked results with scores; (b) Implement episode ingestion helper (map conversation turns to episode + extract candidate facts) aligned with Zep episodes concept; (c) Bi-temporal validity on facts if needed (valid_at/invalid_at) and point-in-time queries for summaries/memories; (d) Evidence utilization metrics (which items cited/utilized) to feed selector; (e) Context-driven retrieval policy (when user doesn’t ask explicitly) with guardrails; (f) Add LongMemEval-style smoke test harness (separate from browser VM) to measure recall/cost.

LATER=Longer-term: (a) Temporal KG (entities/relations) with CAS on graph edges and time-travel queries; (b) Multimodal memory (TeleMem) with content-addressed blobs and quotas; (c) Cross-tenant/RPG scoping with stronger isolation (expansion budgets already implied); (d) Token-aware adaptive summarization with target variance tracking; (e) Distributed consistency considerations only if sync introduced (local-first remains default); (f) Automatic compaction/TTL policies with receipts.

TESTS=Deterministic: extend domain tests for new provenance fields, monotonicity, validation; repo CAS/concurrency edge cases; context service evidence logging and lock caps; corruption quarantine. E2E: memory.cjs stays passing (no weakening); add Node-based integration using InMemory repo + dummy summarizer. Android: if IndexedDB path used in webview, test quota/blocked/abort. Adversarial: oversized fields, duplicate IDs, malformed payloads, signal abuse, summarizer misbehavior, CAS races, cross-scope leakage attempts, metadata cannot authorize (already tested). Eval: simple recall test (episode->retrieval->inclusion) and evidence utilization assertion.

RISKS=Security: provenance must be audit-only (no authority from metadata) — current code already enforces this in tests; new fields must not become trust anchors. Privacy: global vs room scope leakage (expansion isolation critical); episode content must respect policies. Performance: semantic search adds latency/cost; keep behind flag and with budgets. Android: IndexedDB quota/blocked/versionchange; WebView differences. Cross-system: avoid duplicating ownership with shell/tasks/storage/kernel/bridge/routing; integrate via existing interfaces. Determinism: timestamps use clock (ok if restored explicitly) — fingerprints help; avoid Date.now() in identity unless recorded.

FIRST_SLICE=Add optional provenance fields to MemoryRecord (episodeId, sourceType, sourceRef, discoveredAt, certainty) with validation, keep schemaVersion 1 (additive) or bump intentionally; extend ContextBuildResult to include includedMemoryIds and summaryUsed flag already exists but add omission reasons per memory? Or at least evidence list; add IndexedDB corruption detection on read (validate objects against isMemoryRecord/isContextSummary before use) and migration receipt recording in summary CAS path (log source/target schema) — all minimal, testable, no architecture change.

KNOWN_UNKNOWNS=Full paper contents not fetched (abstracts only); arXiv forward-dated IDs need verification; exact browser integration paths beyond memory.cjs unclear; tokenizer/token estimation policy not visible in inspected files (builder estimates text but tokenizer impl unknown); whether sync/multimodality planned; RPG cross-linking details (D06) require coordination. Also need to confirm if `seven_ai-final.html` is the source of truth for browser VM or if remake TS is canonical — both exist.

DOMAIN_VERDICT=READY_FOR_PLAN


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: INSUFFICIENT

DOMAIN_ID=D03_TOOLS_CAPABILITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: INSUFFICIENT

DOMAIN_ID=D04_CODING_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: INSUFFICIENT

DOMAIN_ID=D05_SELF_DEVELOPMENT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD

SOURCE_ANALYSIS=Harvested RPG sources: Yarn Spinner docs [yarnspinner.dev/docs, dialogue-runner] and Unity repo [github.com/YarnSpinnerTool/YarnSpinner-Unity] (dialogue runtime, lines/options/commands, runner architecture). Godot save games [docs.godotengine.org/en/stable/tutorials/io/saving_games.html] (serialization strategies, versioning/migration, what to persist). B06 audit in repo is the strongest concrete evidence: `release/world-runtime.js` (Real Works: ordered beats, sourceRefs/anchors/requiredFacts/forbiddenChanges, branch on divergence, audit), `release/canon-simulator.js` (canon packs, facts/entities/anchors/invariants, character knowledge as fact IDs, ledger, scene contracts, applySceneDelta, canCharacterKnow). Gaps in harvested set relative to Seven needs: no explicit rpgId/session identity model, no atomic commit boundary across world+canon, no provenance schema (source hashes/authority), no migration registry, no branch ancestry/knowledge visibility policy details, no bounded context budgets, no save/restore quarantine. Freshness: Yarn Spinner/Godot docs current; audit is recent. Limitations: harvested includes some GitBook/image assets (noise); need to focus on dialogue/runtime + save/load patterns.

CURRENT=Repo contains B06 audit (`.seven-team/reports/wave-01/B06-rpg-memory.md`) documenting both runtimes. Key verified primitives: ordered canon progression, beat commits with divergence->branch, canon session with pack identity/version, position, branch, canon debt, world state, character knowledge (fact IDs), relationships/locations/objects, ledger, warnings, canCharacterKnow checks continuity/position/knowledge, scene contracts (continuity/position/active chars/goals/relationships/locations/anchor obligations/exit states), applySceneDelta clones session, appends ledger, may branch on rigid-anchor invalidation/canon debt/force, audit checks. Limitations called out: knowledge has no discovery event/provenance/position/branch/certainty beyond fact IDs; knownBy grants knowledge without discovery record; applySceneDelta doesn’t validate IDs/shapes/source/authority; ledger status independent of provenance authority; chronology hardcoded PASS; audit misses wrong-continuity details; invariant checks use truthiness; mustBeTrue/mustNotYetBeKnown not enforced; contracts clone full maps (unbounded); canon debt/warnings unpersisted; no rpgId binding; separate commits (no atomicity); sessions memory-only (import not persistence/restore); no session schema/migration/compat checks/restore validation; RPG memory not connected to scoped-memory retrieval; no bounded character context/expansion isolation; snapshot exposes live refs; engine methods callable without workspace gates; memory.cjs doesn’t test RPG scope/context bounding/migration/restore.

TARGET=Make RPG memory a persistent, provenance-carrying vertical slice with clear boundaries: (1) Stable identity: `rpgId` binds work+canon pack+session; identity required on save/restore. (2) Atomic progression: commit beat + required world delta atomically (all advance or none), revision-based CAS/staleness checks, invariant enforcement before commit. (3) Provenance-rich knowledge: replace bare fact-ID arrays with knowledge records (factId, sourceRef, position, commitId/episodeId, certainty, continuity, branch, discoveredAt, actor) — discovery events required (not just knownBy). (4) Scene obligations enforced: mustBeTrue/mustNotYetBeKnown checked against committed state and active character knowledge; violations recorded as issues (no silent accept). (5) Persistence+restore: durable save envelope with schema version, rpgId, fingerprints/hashes, migration registry, quarantine on corruption/incompat, rollback on failure. (6) Bounded context: per-character and compiled context budgets (items/tokens/age/depth), expansion isolation, required context preservation, compiled provenance (scope/ref/access/fact/event/continuity/branch/source/certainty/truncation reason) — metadata non-authoritative. (7) Branch/continuity ancestry-aware visibility (future knowledge excluded, cross-continuity/branch excluded). (8) Workspace gates enforced (no direct engine bypass). (9) Deterministic tests covering RPG-03/04/05 from audit.

NOW=Smallest high-value slice: (a) Introduce `rpgId` on session creation and require it in save/restore envelope (schema v1); (b) Define knowledge record types (separate from fact IDs) with provenance fields; add migration path from legacy knowledge arrays (map knownBy to discovery records with defaults) — non-breaking where possible; (c) Enforce `mustBeTrue` and `mustNotYetBeKnow` in applySceneDelta/commit path (record issues, don’t silently accept); (d) Add revision/timestamped expected revision to beat+delta commit (atomic boundary conceptually) and CAS on persistence; (e) Add basic restore validation (schema/rpgId/match work/canon pack, ledger sequence checks) with quarantine on failure; (f) Unit tests for obligations and knowledge migration.

NEXT=Next: (a) Full state round-trip (RPG-04.1) with semantic equality; (b) Atomic commit implementation (transactional write to storage, snapshot rollback on failure) — align with MemoryRepository CAS patterns; (c) Provenance survival tests (all restored fields preserved); (d) Bounded context builder for RPG (RPG-05) with budgets, expansion, compiled provenance; (e) Branch ancestry visibility (ancestry chain) and future-knowledge horizon enforcement; (f) Pack content-hash support for compatibility checks; (g) Workspace gate enforcement (wrap engine methods).

LATER=Longer-term: (a) Migration registry with receipts and rollback; (b) Deterministic replay (avoid Date.now() dependence, use event IDs); (c) Tokenizer integration for budgets; (d) Full browser integration tests covering all RPG-03/04/05; (e) Canonical authority schema; (f) Compaction/TTL for ledger/history; (g) Cross-RPG isolation hardening.

TESTS=Deterministic: knowledge migration, obligation enforcement, rpgId validation, restore quarantine. E2E: round-trip save/restore with fixtures. Android/browser: persistence quota/blocked. Adversarial: truncated/corrupt JSON, schema mismatches, unknown migration, missing rpgId, pack mismatch, broken ledger, revision mismatch, invalid refs, cross-continuity leaks, expansion cycles/budgets, future-knowledge access. Eval: RPG-03 visibility matrix, RPG-05 budget determinism.

RISKS=Identity: cannot safely infer rpgId for existing saves — must require it (quarantine if missing). Retrofits: changing knowledge from arrays to records can break callers; need migration + compatibility layer. Atomicity: separate world/canon commits are inconsistent risk — introduce transactional boundary and rollback snapshots. Determinism: timestamps/Date.now() affect branches/IDs — persist generated IDs and use revision numbers. Authority: provenance must not grant authority (metadata audit-only). Budgets: unbounded maps (relationships/locations) — must enforce item/token limits. Security: expansion isolation, cross-RPG leakage, private facts; workspace gate bypass. Performance: cloning large state; consider structural sharing with receipts.

FIRST_SLICE=Define RPG identity + knowledge records + obligation enforcement + basic restore validation. This is smallest coherent change: add `rpgId` to session types/envelope, introduce `CharacterKnowledgeRecord` (factId, sourceRef, position, commitId, certainty, continuity, branch, discoveredAt) with validation/migration from legacy arrays, enforce `mustBeTrue`/`mustNotYetBeKnown` in applySceneDelta (treat violations as issues; block if configured), add save/restore envelope schema with version and rpgId validation + quarantine on corrupt/incompatible data. All changes localized to domain+runtimes with tests.

KNOWN_UNKNOWNS=Active `seven_ai-final.html` contents not inspected (memory.cjs targets it but not read directly); exact RPG integration in browser/active chat binding unknown; saved-session schema/samples unknown; tokenizer/budget conventions unknown; branch ancestry representation beyond branchOrigin unknown; canonical source authority schema unknown; browser integration test paths unknown; whether content hashes available for packs. Also need to coordinate with D02 on shared provenance types.

DOMAIN_VERDICT=READY_FOR_PLAN


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D07_RESEARCH_WEB
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: INSUFFICIENT

DOMAIN_ID=D09_DEEP_THINK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=<what the sources collectively say, disagreements, freshness and limitations>
Current consensus from harvested sources:
- Capacitor Filesystem [SOURCE primary] https://capacitorjs.com/docs/apis/filesystem: NodeJS-like file ops (read/write/delete/stat/etc.) with platform dirs; useful for app-private storage but not the Android “shared documents” picker surface by itself. 
- Android SAF [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files: ACTION_OPEN_DOCUMENT/ACTION_CREATE_DOCUMENT/DocumentFile + persistable grants; required for user-selected files (TXT/PDF) across providers without broad READ_EXTERNAL_STORAGE on modern Android. 
- OWASP MASVS [SOURCE primary] https://mas.owasp.org/MASVS/: secure storage/permissions/IPC expectations (mobile app security baseline). 
- Minor locale duplicates (ar/bn) confirm same SAF guidance. Harvested static assets (favicon/css/opensearch/manifest) are site metadata, not technical content. 
Disagreements: none material. Freshness: Capacitor docs current; Android SAF stable (API 19+). Limitations: harvested texts don’t show Seven’s concrete plugin usage, granted URIs, MIME allowlists, size limits, or TXT/PDF handling specifics.

CURRENT=<Seven current implementation and evidence>
Repo inspection (evidence: file reads):
- `remake/ARCHITECTURE.md`: describes app as “Seven AI (Codex model)” web app with Capacitor wrapper, Android APK, cloudflare worker; no explicit SAF/attachments/files API surface documented. 
- `remake/MILESTONES.md`: milestone list exists but no file-ingestion/SAF milestone line found in quick scan. 
- `capacitor.config.json`: `{ "appId": "com.sevenagent.app", "appName": "Seven AI", "webDir": ".", "bundledWebRuntime": false }` — no plugins listed; Filesystem plugin not declared. 
- `package.json`: minimal (no @capacitor/filesystem, @capacitor/preferences etc.). 
- `seven_ai-final.html`, `seven_ai-t150.html`, `seven_ai-t152.html`, `seven_ai-t161.html`: large single-page HTML apps (bundled). Searched for attachment/file indicators: “attachment”, “file”, “pdf”, “txt”, “upload”, “open document”, “ACTION_OPEN”, “SAF”, “persistable uri”, “grant”, “Filesystem”, “Capacitor”. 
  - Found UI mentions? Quick grep: no explicit SAF intents; “file” appears in generic contexts (no clear file picker implementation visible in these HTML bundles at first pass). Evidence level: static HTML inspection (browser-like mock evidence). No Android runtime/device evidence yet. 
- `apk/`: directory exists (APK present). No decompiled inspection performed here (keeps scope to research; could be build artifact). Build evidence not read unless necessary. 
Conclusion: No concrete SAF integration, no Capacitor Filesystem usage declared, no TXT/PDF ingestion pipeline visible in repo state. Claims about file handling would be unproven.

TARGET=<desired architecture/product behavior>
- Android-first: use SAF for user-selected TXT/PDF (and future binary) with `ACTION_OPEN_DOCUMENT` + MIME allowlist (`text/*`, `application/pdf`) and `ACTION_CREATE_DOCUMENT` for export. Persist grants via `takePersistableUriPermission` per MASVS safe storage/permission principles [SOURCE primary] https://mas.owasp.org/MASVS/. 
- Files API boundary: if using Capacitor, declare `@capacitor/filesystem` and consider `@capacitor/app`/bridge needs; but shared storage access is SAF (native Android), not purely app-private Filesystem. Distinguish: private cache vs user-picked documents. 
- Limits: explicit max size, per-attachment count, max total, quarantine, preview truncation, memory caps (avoid loading huge PDFs into strings). 
- Grants: minimal scope, revoke not automatic on uninstall in all cases; must track granted URIs. 
- Import/export: TXT/PDF ingestion (read text, extract metadata), export conversation/session as TXT/PDF (create document), with error taxonomy. 
- Platform parity: web (file input) vs Android (SAF) — feature flagging, capability detection.

NOW=<first high-value implementation slice>
Smallest slice (evidence-backed):
1. Define attachments contract: `Attachment { id, uri, name, mime, size, source:'saf'|'web'|'local', sha256?, persisted:boolean }` (architecture-aligned, no new duplicate owners). 
2. Android capability detection + SAF picker (open document) with MIME allowlist (TXT/PDF). 
3. Read selected document (stream/chunked) with size limit (e.g. 10MB default, configurable) and text extraction path for text/*; PDF: placeholder/parse strategy or “unsupported” with clear error (don’t guess). 
4. Persist/read grants; basic denial handling. 
5. Deterministic tests: unit (limits/MIME), contract (invariant checks), Android mock (SAF intents) — no weakening guards.

NEXT=<next improvements>
- Export: ACTION_CREATE_DOCUMENT for TXT (and PDF generation path if needed). 
- Multi-select, recent URIs cache (scoped), thumbnails? 
- Android 13+ READ_MEDIA_* vs SAF nuance; handle “permission denied” taxonomy. 
- File change notifications (DocumentsContract) if read-modify needed (rare). 
- Cross-system: integrate with storage/bridge/routing per architecture (avoid creating duplicate owners). 

LATER=<longer-term ideas>
- Large files: streaming, background read, memory budget. 
- OCR? not requested; skip unless evidence justifies. 
- Cloud storage providers coverage; MASVS threat model updates. 

TESTS=<deterministic, E2E, Android, adversarial and eval proof>
- Unit: MIME validation, size limits, base64/UTF-8 decode, truncation. 
- Contract: attachment invariants, grant lifecycle. 
- Android (mock): SAF intent result parsing, persistable grants, URIs revoked, “file not found”, provider errors. 
- Adversarial: path traversal not applicable (URIs), content-type spoofing, huge files, symlink-like provider behavior, permission revocation mid-read, malformed PDFs/TXT. 
- E2E: web file input + Android SAF (if device available) — label as build/device evidence when run. 
- Eval: ingestion success/failure taxonomy coverage.

RISKS=<security/privacy/performance/Android/RTL/cross-system risks>
- Privacy: reading user documents requires minimal scope; log redaction (no URIs in logs). MASVS alignment [SOURCE primary] https://mas.owasp.org/MASVS/. 
- Security: persistable grants are powerful; track and scope; avoid copying to public dirs unless explicit. 
- Performance: load large docs incrementally; UI thread blocking. 
- Android: API level, scoped storage changes, provider quirks. 
- Cross-system: creating duplicate owners for storage/bridge would violate architecture (preserve `remake/ARCHITECTURE.md`). 
- Evidence gap: no runtime/device proof yet (APK exists but untested).

FIRST_SLICE=<smallest implementation that materially improves the domain>
Add SAF picker (Android) + web fallback, TXT/PDF allowlist, 10MB limit, read to text (TXT) with clear errors, attachment model, and tests. This directly addresses “TXT/PDF ingestion, file limits, Android documents, grants” with deterministic proof.

KNOWN_UNKNOWNS=<missing evidence>
- Whether Seven already uses Capacitor Filesystem/any file plugin (package.json/capacitor.config empty of plugins). 
- APK’s manifest/permissions (READ_EXTERNAL_STORAGE? no longer needed for SAF; but build might have). 
- Actual file handling code in HTML bundles (grep inconclusive in quick pass). 
- Grant persistence behavior in current build (no installed-device evidence). 
- Max practical sizes for chat context (product decision). 
- Import/export UI entry points (routing). 

DOMAIN_VERDICT=READY_FOR_PLAN


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: INSUFFICIENT

DOMAIN_ID=D11_ANDROID_NATIVE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: INSUFFICIENT

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: INSUFFICIENT

DOMAIN_ID=D13_ARABIC_RTL_A11Y
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: INSUFFICIENT

DOMAIN_ID=D14_SECURITY_PRIVACY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: INSUFFICIENT

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: INSUFFICIENT

DOMAIN_ID=D16_NETWORK_RESILIENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: INSUFFICIENT

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D18_TESTING_EVALS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: INSUFFICIENT

DOMAIN_ID=D19_AGENT_ORCHESTRATION
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: INSUFFICIENT

DOMAIN_ID=D20_PRODUCT_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: INSUFFICIENT

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: INSUFFICIENT

DOMAIN_ID=D22_PROTOCOLS_INTEROP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=<what the sources collectively say, disagreements, freshness and limitations>
- Android SAF for export: `ACTION_CREATE_DOCUMENT` to let user choose destination (portability) without writing to arbitrary shared paths [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files. Same SAF guidance as D10 (locale variants). 
- IndexedDB: client-side structured storage, large amounts, indexes [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API. Useful for backup/export snapshots, conversation history, metadata; not a general “files to user Documents” picker. 
- MASVS baseline applies to data handling. 
Disagreements: none. Freshness: MDN IndexedDB current; Android SAF stable. Limitations: harvested sources don’t specify Seven’s data model (conversations/messages/attachments), export formats (TXT/PDF), backup scope, or restore semantics.

CURRENT=<Seven current implementation and evidence>
- Repo: `seven_ai-final.html` etc large bundles; no obvious “export”, “backup”, “import” UI/logic found in quick grep (evidence level: static). 
- No IndexedDB wrapper visible; no SAF export implementation. 
- `memory.cjs`, `memory-results.json`, `verify.cjs`, `runtime-smoke.cjs` suggest small utility scripts (Node) — likely dev tools, not app import/export. 
- Architecture: web app + Capacitor wrapper; no backup/portability surface documented. 
Conclusion: import/export/backup not implemented; current state is unproven for portability.

TARGET=<desired architecture/product behavior>
- Data portability: user can export conversation(s) as TXT (human-readable) and optionally PDF; import conversation from TXT (structured) with validation. 
- Backup scope: conversations, messages, attachments metadata (not necessarily re-downloading remote blobs unless policy states), settings (non-secret). 
- Android export: ACTION_CREATE_DOCUMENT (SAF) for user-chosen location; web: Blob download. 
- Import: SAF open document (TXT/PDF ingestion path from D10) or web file input; validate schema, idempotency, conflict resolution (merge vs replace). 
- Deterministic, safe: no auto-upload of private data; redact secrets; respect file limits (D10). 
- Architecture-aligned (no duplicate owners for storage/kernel/bridge). 

NOW=<first high-value implementation slice>
Smallest slice:
1. Export single conversation as TXT via SAF (Android) + Blob download (web). Include metadata header (timestamp, id, count). 
2. Import TXT (line-based or JSONL) with schema validation and size limits. 
3. Deterministic tests (export format, import validation, roundtrip). 

NEXT=<next improvements>
- Multi-conversation export (ZIP of TXTs) or combined. 
- IndexedDB snapshot export/import (structured) — leverage MDN IndexedDB knowledge [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API for full backup (not just current session). 
- PDF export (print-to-PDF or generator) — needs evidence-backed library choice (no guessing). 
- Restore semantics (dedupe, attachments re-link). 
- Auto-backup policy? explicitly not assumed.

LATER=<longer-term ideas>
- Cloud backup providers (optional, user-driven), encryption at rest for exported files? 
- Differential backups, versioning. 

TESTS=<deterministic, E2E, Android, adversarial and eval proof>
- Roundtrip: export TXT → import → state equivalent (minus ephemeral). 
- Validation: malformed JSONL/TXT, BOM, encoding, large files, binary disguised as TXT. 
- Limits: enforce D10 limits on import. 
- Android: ACTION_CREATE_DOCUMENT success/failure, write permissions to granted URI. 
- Adversarial: injection in export/import, path concerns (SAF URIs), data exfiltration (no auto-send). 
- E2E: full import/export journey. 

RISKS=<security/privacy/performance/Android/RTL/cross-system risks>
- Privacy: exports contain user content; must never auto-share; user selects destination (SAF) — aligns with shared storage guidance [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files. 
- Data integrity: roundtrip fidelity, attachment references (URIs may not be portable). 
- Performance: large histories → streaming export. 
- Cross-system: backup touches storage; avoid duplicate storage owner. 
- IndexedDB: quota, browser differences (MDN IndexedDB) — test deterministically. 

FIRST_SLICE=<smallest implementation that materially improves the domain>
TXT export/import for a single conversation with SAF+web support and validation. This is minimal, portable, testable, and uses harvested evidence.

KNOWN_UNKNOWNS=<missing evidence>
- Data model shape in app (conversation schema) — not visible in HTML bundles inspected. 
- Whether any IndexedDB is used (needs runtime inspection). 
- Attachment portability (URIs from SAF not portable across installs/devices) — product decision needed. 
- PDF requirements (explicitly in focus: “TXT/PDF ingestion…” for import, export not stated but implied; treat PDF export as NEXT unless manager assigns). 
- Restore target scope (full DB vs session). 

DOMAIN_VERDICT=READY_FOR_PLAN


# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D24_RELEASE_APK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: INSUFFICIENT

DOMAIN_ID=D25_HISTORY_ROOMS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: INSUFFICIENT

DOMAIN_ID=D26_SETTINGS_CONTROLS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: INSUFFICIENT

DOMAIN_ID=D27_ERROR_RECOVERY_UX
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D29_REAL_WORKS_CANON — Real Works / Source Fidelity / Canon Branching

Research audit: INSUFFICIENT

DOMAIN_ID=D29_REAL_WORKS_CANON
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.
