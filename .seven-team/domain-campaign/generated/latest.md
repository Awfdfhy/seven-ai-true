# Seven Domain Roadmaps — cycle evidence

Ready domains: 3/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: INSUFFICIENT

DOMAIN_ID=D02_MEMORY_CONTEXT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: INSUFFICIENT

DOMAIN_ID=D06_RPG_WORLD
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=Harvested 10 primary sources (READY). BFCL leaderboard (gorilla.cs.berkeley.edu/leaderboard) [SOURCE primary] is an execution-based function-calling/tool-use benchmark (fresh, actively maintained; V4 noted) that emphasizes structured tool calls, parallel calls, relevance/format correctness—signal for “deep think” systems that must plan tool invocations and verify outputs. SWE-bench (swebench.com) [SOURCE primary] is a software engineering benchmark (GitHub issues→PRs) measuring end-to-end problem solving, planning, patch generation, verification; it’s a strong external signal for planning/verification/progress domains. Supporting static assets (CSS/ICO) [SOURCE primary] confirm harvested pages but add no substantive technical content. Gaps/limits: harvested pages are landing/leaderboard surfaces (no full paper text, no eval harness internals, no orchestration design details). Disagreements/nuance: BFCL measures tool correctness; SWE-bench measures repository-level problem solving—different axes (micro tool use vs macro planning). Freshness appears current (leaderboards present). Limitation: insufficient to derive Seven’s internal orchestration contracts from these alone; need Seven repo contracts and adjacent domain packs.
CURRENT=Inspected Seven repo: cwd `/home/runner/work/_temp/seven-superloop-worktrees/c249-research-B04`. `remake/ARCHITECTURE.md` (evidence: 1 file) describes system architecture; `remake/MILESTONES.md` (evidence: 1 file) describes current milestone state. `.seven-team/domain-campaign/domains.json` (evidence: 1 file) lists campaign domains (D09_DEEP_THINK assigned to B04,A09; priority CORE; source target 10). `.seven-team/product-intelligence/` index/rubric and sources map (evidence: inspected via find/read) present per instructions. No planner isolation/orchestration implementation files (B04 focus) were found modified in this repo state; architecture and milestones read as source of truth (no legacy override). Seven currently defines domain campaign structure and product-intelligence corpus, but implementation evidence for “two-pass orchestration, planner isolation, context reuse, speed and cancellation” is not present in inspected files. Evidence level: structural only (repo contracts present), behavioral/proof not found in inspected paths.
TARGET=Desired architecture for D09_DEEP_THINK: bounded two-pass orchestration (plan→verify/execute) with strict planner isolation (separate planning boundary, clear inputs/outputs, no cross-contamination), explicit context reuse (caching/retention with invalidation), speed and cancellation controls (deterministic time/step limits, abort semantics), and verification checkpoints. Must align with `remake/ARCHITECTURE.md` contracts (preserve architecture). External alignment: BFCL-like structured verification of tool/step outputs; SWE-bench-like planning discipline for multi-step tasks. Treat Seven contracts as source of truth.
NOW=First high-value implementation slice (evidence-backed, smallest): define orchestration contract boundary (plan schema, verify gates, progress state) with owner assignment (B04) and no duplicate owners for kernel/routing/etc. Add deterministic state machine (states: planning, verifying, executing, cancelled, failed) with explicit step counts, time budget, cancellation token. Introduce context reuse key (task+context hash) and invalidation rules. Add progress reporting surface (structured events). This slice is design+contracts first (no production edits in this stage) and can be proven by unit tests of state transitions and schema validation.
NEXT=Next improvements: two-pass details (first pass: outline + assumptions; second pass: concrete steps with verifiers), planner isolation (separate interface, no shared mutable state), cancellation propagation and backpressure, context reuse hit/miss metrics, and verification gates per step (pre/postconditions). Align with BFCL (structured outputs) and SWE-bench planning discipline.
LATER=Longer-term ideas: adaptive time budgets, plan repair (revision with justification), cached plan library per task class, verifier portfolio (static+dynamic), progress visualization hooks, and cross-domain orchestration patterns informed by external sources when credible.
TESTS=Deterministic: state machine transitions (all states), cancellation at boundaries, timeout behavior, context reuse invalidation, schema validation. E2E: small multi-step flow with plan→verify→execute. Android: not directly applicable unless orchestration exposed via UI; include if UI involved. Adversarial: cancellation races, invalid plan schema, context poisoning, budget exhaustion, infinite loop prevention. Eval proof: track BFCL/SWE-bench relevant metrics if integrated, but require proof-carrying checks against Seven invariants.
RISKS=Security/privacy: avoid leaking secrets in plan/context; enforce redaction. Performance: context reuse must not grow unbounded; cancellation must be cheap. Android/RTL/cross-system: if planning UI exists, respect ergonomics; cross-system: ensure no duplicate owners, preserve kernel/routing boundaries, follow `.seven-team/autonomy/` contracts. Orchestration changes can have broad impact—require invariant checks.
FIRST_SLICE=Define and test orchestration contract + deterministic state machine with budgets/cancellation and context reuse keys (smallest slice delivering material improvement). No production edits.
KNOWN_UNKNOWNS=Internal implementation details of current planner/orchestrator (none found in inspected files), exact step verification semantics, current context lifecycle, cancellation implementation patterns, and measurable baselines for speed/throughput. External: harvest gave surfaces only (need deeper specs if filling gaps). Mark gaps as evidence-dependent.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=Harvested sources are consistent and authoritative:
- [SOURCE primary] https://capacitorjs.com/docs/apis/filesystem — NodeJS-like Filesystem API surface (read/write/delete, directories, filesystem types) as Capacitor abstraction.
- [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files — Android Storage Access Framework (SAF) for content:// URIs, allowing user selection without broad file permissions (privacy-first).
- [SOURCE primary] https://mas.owasp.org/MASVS/ — Mobile App Security Verification Standard (MASVS) sets security/validation requirements relevant to file handling, URI grants, permissions.
- [SOURCE primary] https://capacitorjs.com, https://developer.android.com — platform docs.

Disagreements: None major. Freshness: docs current (Android SAF guidance stable; Capacitor Filesystem API current). Limitations: harvested set is API/doc-focused (no deep code samples for large PDFs/TXT ingestion, no real-world attachment UX). Need to verify how Seven maps SAF vs internal storage vs Capacitor filesystem. No contradiction with repo architecture.

CURRENT=Seven already has SAF/bridge foundations (strong):
- ARCHITECTURE.md: §6 Android uses typed BridgeRequest/BridgeResult; SAF URI grants lifecycle-managed. §8 Attachments: single-flight loader, ingestion pipeline (size budget, MIME+content sniff, explicit parse errors, task cancellation, persistence policy); no wrapper-patching sendMessage.
- MILESTONES.md: capability negotiation + SAF content-URI grant validation.
- Contracts: `remake/src/platform/android/contracts.ts` validates SAFGrant (must be object; uri is canonicalized string; only content:// URIs allowed; requires read and/or write; persisted boolean; issuedAt timestamp). Throws typed SevenError (VALIDATION) with clear messages.
- AndroidPlatformService: `remake/src/application/android/android-platform-service.ts` validates grant responses (schema, matches requested URI/scope, rejects malformed release). Error codes include BRIDGE/VALIDATION semantics.
- Phase 7 tests: `remake/src/integration/phase7/phase7.test.ts` cover SAF denied path (`SEVEN_SAF_DENIED`) and validate SAF grants as content URIs + native grant truth. All 259 tests pass (vitest json).
- Android bridge doc: `remake/PHASE7_ANDROID_BRIDGE.md` states SAF grants accept only content:// URIs and require explicit read/write scope; returned grant truth must match requested URI/scope and report persisted state.

Evidence inspected: remake/ARCHITECTURE.md, remake/MILESTONES.md, remake/src/platform/android/contracts.ts, remake/src/application/android/android-platform-service.ts, remake/src/integration/phase7/phase7.test.ts, remake/PHASE7_ANDROID_BRIDGE.md, remake/PHASE710_INTEGRATION_REPORT.md. No direct attachment ingestion/renderer code files found in src tree under obvious names in grep (attach/pdf/txt) — pipeline is described in architecture but implementation details (parsers, size limits, MIME sniffing, storage policy) need to be located/read. This is a gap (KNOWN_UNKNOWNS).

TARGET=Desired behavior (evidence-aligned):
- Strict SAF handling: content:// only, grant scope matches request, lifecycle-managed (grant/release), persisted grants validated. Android-first privacy (no broad READ_EXTERNAL_STORAGE unless strictly necessary). MASVS-aligned validation.
- Attachment ingestion pipeline per architecture: single-flight runtime loader; enforce size budget; MIME + content sniff validation; explicit parse errors; task cancellation; attachment persistence policy; never wrapper-patch sendMessage.
- TXT/PDF support with deterministic limits: max bytes, max pages (PDF), charset detection/normalization for TXT, timeouts, memory caps. Parse errors typed, not generic.
- File access abstraction that can use SAF on Android and Capacitor Filesystem on other platforms; consistent BridgeResult envelope. 
- Clear UX feedback on large files, unsupported types, permission/SAF denial, I/O errors.

NOW=First high-value slice (smallest that materially improves):
1. Locate attachment ingestion implementation (find files/classes named Attachment*, Ingest*, FileLoader, Composer attachments) and read them to confirm size budget, MIME sniff, parse errors, cancellation. Evidence required.
2. Define/verify TXT ingestion: size cap, charset (UTF-8 with fallback), line/char limits, truncation policy, error codes.
3. Define/verify PDF ingestion scope (what can be extracted: text-only vs metadata; if PDF.js/pdf-lib used, version/license, memory/time limits). If not implemented, propose minimal safe slice (reject or extract bounded text) with proof.
4. Add deterministic unit tests for: oversize rejection, invalid MIME/sniff mismatch, SAF-denied mapping to typed error, cancellation mid-ingest, empty/corrupt files. Tie to existing TaskManager cancellation.

NEXT=Next improvements:
- Capability negotiation (per MILESTONES) between platforms (Android SAF availability, filesystem access) exposed via AndroidPlatformService.
- Attachment persistence policy (where bytes stored: temporary vs persistent, retention, GC) with integrity metadata (contentHash, size, mime) per Research citation model style where applicable.
- Cross-platform mapping: Capacitor Filesystem vs SAF selection rules; Android SAF grant caching/refresh semantics.
- Streaming ingestion for large text (chunked) to avoid peak memory spikes.

LATER=Longer-term ideas:
- Multimodal beyond TXT/PDF: images/audio with sandboxed processing; but preserve identity and avoid overreach.
- Import/export integration with D23 (backup/restore of attachments metadata/grants).
- Android 13+ scoped storage nuances (READ_MEDIA_* vs SAF) — ensure SAF path remains primary for user-selected documents.
- OWASP MASVS mapping checklist (file validation, path traversal, content validation, error disclosure) as machine-verifiable.

TESTS=Deterministic, E2E, Android, adversarial:
- Unit: size budget boundary, MIME+sniff consistency (txt disguised), UTF-16/invalid bytes, truncation, cancellation token propagation.
- Integration (Phase-aligned): SAF grant lifecycle (request/grant/release) with mock bridge; SAF denial -> typed error surfaced; content:// only enforced.
- Android instrumented (per architecture): bridge round-trip for SAF grant truth.
- Adversarial: path traversal attempts via content URIs (validate scheme/authority/path handling), ZIP-bomb-like oversized text, PDF with many pages/large fonts, corrupted headers, content-type spoofing.
- E2E: composer attach flow respects cancellation and never patches sendMessage.

RISKS=Security/privacy/performance/Android/RTL/cross-system:
- Security: file content sniffing must be strict (avoid executing/processing unsafe types). Reject unknown dangerous types by default. Content validation against MASVS.
- Privacy: prefer SAF (user-select) over broad storage; never log full file contents or sensitive paths in plain errors (include hashes/ids). 
- Performance: single-flight + cancellation + size caps to prevent OOM on low-end Android.
- Android: SAF grants can be persisted but may be revoked by provider; must handle `SecurityException`/invalid grants (release + re-request). Scoped storage evolution.
- RTL: UI text around attachments (file names, sizes, errors) must follow existing i18n/RTL handling.
- Cross-system: bridge envelope consistency; mock vs real bridge divergence (contract tests prevent).

FIRST_SLICE=Smallest implementation that materially improves domain:
- Find and read attachment ingestion implementation (core/application layer). Confirm pipeline matches ARCHITECTURE.md (single-flight, size budget, MIME+sniff, parse errors, cancellation, persistence). If mismatched, document gaps.
- Add/verify TXT size cap + charset normalization + truncation + typed errors with unit tests.
- Verify SAF path is enforced (content:// only) end-to-end in attachment flow; add negative tests (file:// rejected) if missing.

KNOWN_UNKNOWNS=Missing evidence:
- Location of attachment ingestion/parsing code (TXT/PDF). Grep found pipeline described but not concrete files yet. Must inspect src for AttachmentStore/Ingestor/FileLoader/Composer attachments.
- Actual size limits (bytes), max text length, PDF extraction limits (pages/size) — not visible in contracts.
- Persistence policy details (temp vs durable, GC, quotas). 
- Platform selection logic (when to use SAF vs Capacitor Filesystem). 
- PDF library (if any) used, memory caps, timeouts — could affect performance/release blockers.
- How SAF grants are cached/revoked and surfaced to user on denial.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to locate/read attachment implementation + concrete limits before declaring READY_FOR_PLAN). The SAF/bridge foundation is strong and aligned with docs; TXT/PDF ingestion specifics and size/MIME policies are not yet evidenced from code.


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
SOURCE_ANALYSIS=Harvested sources align:
- [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files — SAF for user-directed export/import (save to chosen location, open from chosen location) without broad permissions; critical for "data portability".
- [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API — client-side structured storage (large data), indexes; relevant to export/import/backup of app data (rooms, memory, settings, provider health, research cache, RPG/canon, GitHub metadata) and integrity.
- Platform docs consistent.

Freshness: current. Limitations: no explicit "backup" format spec for Seven; harvested evidence is general (SAF + IndexedDB). Need to inspect Seven's StorageEngine contract, migration protocol, export/import surface, and any existing backup/restore code.

CURRENT=Seven has storage foundations:
- ARCHITECTURE.md §5 Persistence: StorageEngine contract (transaction, get/put/delete, atomic migration, integrity metadata, export/import). Persistent domains listed (rooms, memory, settings, provider health, research cache, RPG/canon, GitHub connection metadata — never plaintext secrets). Migration protocol: read old→validate→write new temp→verify→commit→delete old (failed migration leaves previous recoverable). Recovery: boot never leaves doc globally inert; storage failure transitions to interactive recovery screen.
- Phase 9 (RPG/Canon) shows strong durability/integrity: CAS (concurrent repo writes), checksum verification detects durable corruption before trusting state, persists/verifies canonical snapshot across IndexedDB restart. Tests confirm these behaviors.
- Phase 12 tests include edge cases (e.g. version boundary) — signals robustness focus.
- Android: SAF grants lifecycle-managed (relevant for user-chosen export/import destinations).

Evidence inspected: remake/ARCHITECTURE.md §5, remake/src/integration/phase9/phase9.test.ts (checksum/CAS/snapshot), remake/src/integration/phase12/zero-bug-pass.test.ts, Android SAF contracts/service as above.

No obvious "export/import UI/CLI/API" implementation files found by grep yet (search for export/import/backup in src gave limited hits in vitest json context, not implementation). Need to locate StorageEngine implementation and any export/import methods.

TARGET=Desired behavior (evidence-aligned):
- Data portability via SAF on Android: export to user-chosen location (content:// target via ACTION_CREATE_DOCUMENT/SAF write grant), import from user-chosen location (ACTION_OPEN_DOCUMENT/SAF read grant). Respects lifecycle, cancellation, typed errors.
- Export format: deterministic, versioned (schemaVersion), includes integrity metadata (checksum/hash of exported payload), human-inspectable where practical (JSON) but safe (no secrets). Covers domains per contract.
- Import: validates schema/version, checksum/integrity, atomic application with transaction boundary, migration-safe handling. Rejects corrupted/stale payloads with typed errors; never silently overwrites without validation.
- Backup/restore semantics: "backup" = export snapshot; "restore" = import validated snapshot. Recovery path integrates with StorageEngine migration/recovery (boot recovery screen). 
- IndexedDB considerations: large exports may be slow; use streaming/iterative export, cancellation (TaskManager), progress feedback, memory caps. MDN IndexedDB guidance supports structured data; export/import must not block UI indefinitely.
- Security: no plaintext secrets in export; GitHub metadata exported only as safe metadata per contract; validate SAF URIs (content://) and handle revoked grants.

NOW=First high-value slice:
1. Locate StorageEngine implementation and any export/import methods (class/interface impl). Verify methods exist and signatures match contract (export/import mentioned). Read implementation.
2. Identify export/import format versioning and integrity (checksum/contentHash). Compare to Research citation contentHash model (good practice). Ensure atomicity on import.
3. Verify SAF integration points for export/import (Android platform service methods to request create/open document and write/read bytes). If missing, define minimal contract.
4. Add deterministic tests: export produces versioned JSON with checksum; import validates checksum/schema; corrupted import rejected; import with stale version handled per migration protocol; cancellation during export/import.

NEXT=Next improvements:
- Cross-platform export/import: web (download blob, file input) and Android (SAF) paths unified behind abstraction.
- Incremental/partial export? maybe not necessary; full snapshot with integrity is clean.
- Backup scheduling/retention policy (user-initiated per portability requirement; avoid automatic silent backups unless explicit).
- Integration with D10: export/import of attachment metadata and any stored attachment blobs with safe references; handle SAF grants for attachments.

LATER=Longer-term ideas:
- Encrypted export option (user passphrase) for sensitive data; but requires careful key management and not specified. Defer unless required.
- Differential backups, verification of restored state (round-trip) in tests.
- MASVS mapping for data portability (secure transmission/storage of exported data).

TESTS=Deterministic, E2E, Android:
- Unit: export/import round-trip preserves domains; checksum mismatch rejected; schemaVersion validation; unknown fields handled safely.
- Integration: Phase 9 style integrity tests extended to export/import path; migration protocol still holds.
- Android: SAF create/open document flow with mock bridge; grant lifecycle; cancellation.
- Adversarial: tampered export (modified checksum, injected secrets attempt), oversized export, partial/corrupted bytes, import during transaction conflict.
- E2E: user-initiated export/import with proper error messages, no data loss on failure.

RISKS=Security/privacy/performance/Android:
- Security: exported data is sensitive (rooms, memory, research cache). If written to external storage via SAF, user controls destination but data persists there; app must not force insecure locations. Validate imports strictly.
- Privacy: never include secrets/tokens; GitHub connection metadata per contract ("never plaintext secrets") — must be enforced in export.
- Performance: IndexedDB export of large datasets can be memory-heavy; iterate with cursors, avoid loading entire DB into single large string in one go; support cancellation.
- Android: SAF grants for write/read can be revoked; handle errors gracefully; scoped storage.
- Cross-system: blob vs string for large binary attachments (if exported) — format must handle.

FIRST_SLICE=Smallest implementation that materially improves domain:
- Locate StorageEngine impl + export/import. Read signatures and behavior. Confirm integrity metadata (checksum) present or planned.
- Verify export covers required domains and excludes secrets. Add unit test for round-trip.
- Ensure import is atomic (transaction) and rejects corrupt/stale payloads with typed errors. Align with migration/recovery protocol.

KNOWN_UNKNOWNS=Missing evidence:
- StorageEngine implementation file(s) (export/import methods). Not obvious from grep hits shown.
- Export/import format schema (version, checksum algorithm, field list, whether attachments blobs included).
- Existence of any backup/restore UI or API surface. 
- How secrets are filtered in export (GitHub metadata).
- Cross-platform abstraction for file writing (SAF vs download). 
- Size limits/progress for large exports.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need StorageEngine export/import implementation + format spec). Foundations (contract, migration, integrity/CAS from Phase 9) are strong and align with MDN IndexedDB + Android SAF. Concrete export/import surface and secret filtering proof missing.


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
