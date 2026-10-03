# Seven Remake V3 — Milestones

This file records only milestones that are integrated into `seven-remake-v3` and protected by the Remake CI gates.

## Foundation — COMPLETE

- Strict TypeScript baseline.
- React rendering shell isolated from domain/runtime logic.
- Structured `SevenError` model.
- Single-owner `TaskManager`.
- Task IDs, ownership, cancellation, deadlines and lifecycle tests.
- Dedicated Remake CI: typecheck, tests, production build.

## 1/12 — Chat + Rooms + Persistence — COMPLETE

Integrated capabilities:

- Immutable `Room` and committed `ChatMessage` domain.
- Transient assistant draft: partial streaming output is not committed to room history.
- Per-room send ownership acquired before the first asynchronous storage boundary.
- Exactly one active generation may own a room.
- Unified cancellation through `TaskManager`.
- Default chat deadline even when callers omit one.
- User message persistence before generation.
- Assistant message committed exactly once only after successful stream completion.
- Cancellation never commits a partial assistant response.
- `RoomRepository` port.
- In-memory deterministic repository for tests.
- IndexedDB repository for browser/Android WebView persistence.
- Stored-room schema validation and structured storage failures.
- Save/list/get/delete support.
- Restart/restore round-trip covered by vertical tests.

Acceptance evidence:

`send → stream → stop/cancel → no partial assistant commit → save → restore`

Status: **PASS**

## 2/12 — Models + Routing — COMPLETE

Integrated capabilities:

- Typed `ProviderAdapter` contract.
- Normalized `ModelDescriptor` and capabilities.
- Strict provider message validation.
- Exactly one leading system message invariant.
- Immutable `ModelRegistry`.
- Deterministic routing for Quick / Balanced / Deep.
- Preferred-model support.
- Streaming capability filtering.
- Provider penalties and cooldown filtering.
- `ProviderHealthTracker` with failure penalties, Retry-After-style cooldowns and recovery on success.
- Bounded route candidate count.
- Routed streaming transport.
- Fallback is allowed only before the first emitted token.
- A provider failure after output begins cannot silently switch providers and splice two answers.
- Cancellation propagates through the routed provider stream.
- The chat task deadline acts as the global wall-clock budget across fallback attempts.
- All-route failure becomes a structured retryable provider error.

Acceptance evidence:

`model registry → health/cooldown → route plan → primary failure before token → fallback → stream → commit`

Status: **PASS**

## Hardening gates passed before 2/12 closure

- Per-room concurrent-send race regression.
- Stop/double-stop regression.
- Partial-stream cancellation regression.
- Default deadline regression.
- Provider cooldown regression.
- Full Seven Remake strict typecheck.
- Full Seven Remake test suite.
- Seven Remake production build.
- Legacy Seven regression suite on both Phase 1-2 PRs.

## Progress

- Foundation: COMPLETE
- 1/12 Chat + Rooms + Persistence: COMPLETE
- 2/12 Models + Routing: COMPLETE
- 3/12 Memory + Context: COMPLETE
  - Versioned global + room memory domain.
  - In-memory and IndexedDB memory + summary persistence.
  - Explicit manual-delete-only memory capacity policy; no silent eviction.
  - Explicit MemoryService CRUD surface.
  - Durable normalized context-policy/settings repository with restart persistence.
  - Persisted policy defaults consumed by MemoryContextService; request overrides remain deterministic.
  - Deterministic token estimator and bounded ContextBuilder.
  - Relevant-memory selection and one-leading-system-message invariant.
  - Contiguous recent-history retention.
  - Incremental durable conversation summary with bounded passes.
  - Summary schema v2 with legacy v1 migration.
  - Source-history fingerprints detect deleted or edited summarized history.
  - Stale summaries are CAS-invalidated and rebuilt rather than crashing context preparation.
  - Storage-level summary compare-and-swap prevents lost updates across tabs/repository instances.
  - Provider-backed summarizer has context-window-aware bounded chunking and carry-forward summaries.
  - Oversized/empty provider summaries are rejected before durable truth changes.
  - Cancellation propagates through memory reads, policy reads, summarization and persistence.
  - Route candidates carry model contextWindow.
  - Fallback rebuilds context for each candidate's own window.
  - Prepared-context runtime validation before provider dispatch.
  - Persistent/adversarial Phase 3 integration tests are included in the permanent suite.
  - Closure-candidate evidence: Seven Remake V3 CI #188 SUCCESS; 16/16 test files PASS; 190/190 tests PASS; strict typecheck PASS; build PASS; dependency audits 0 vulnerabilities.
  - Closure gates passed: final-head legacy regression PASS; PR #61 merged; post-merge Remake CI PASS.

- 4/12 Attachments: COMPLETE
  - TXT/PDF ingestion with MIME/content sniffing.
  - Bounded raw bytes and extracted text.
  - Realm-safe immutable byte snapshots.
  - Single-flight PDF parser runtime loading.
  - SHA-256 attachment identity.
  - Cancellation-safe durable persistence.
  - In-memory + IndexedDB repositories with restart/restore.
  - Individual gates: Remake CI PASS; Legacy Seven PASS.

- 5/12 Research + Citations: COMPLETE
  - Canonical citation schema with URL/title/snippet/timestamps/content hash/provider identity.
  - Concurrent bounded research sources.
  - Deterministic citation deduplication.
  - Partial source failures remain visible.
  - Total network/provider failure cannot become silent no-evidence success.
  - Durable research cache with age bounds and explicit bypass.
  - Individual gates: Remake CI PASS; Legacy Seven PASS.

- 6/12 Deep Think: COMPLETE
  - Two-pass application transport.
  - Planner output is internal and never directly emitted to the user.
  - Planner/final context is rebuilt for each model window.
  - Exactly one leading system message per pass.
  - Bounded planning brief injected as untrusted JSON data.
  - Final payload is revalidated after planning data is added.
  - Cancellation between passes prevents final provider dispatch.
  - Individual gates: Remake CI PASS; Legacy Seven PASS.

- Waves 4+5+6 manager integration: COMPLETE
  - attachment-derived evidence → research → Deep Think journey.
  - cross-task cancellation isolation.
  - independent persistence restart/restore.
  - Combined Remake CI: PASS — 20/20 files, 209/209 tests, build PASS, 0 vulnerabilities.
  - Combined Legacy Seven + release artifact: PASS.
  - Manager PR #65 merged; post-merge Remake CI PASS.

- 7/12 Android Native Bridge: COMPLETE
  - Typed request/response envelopes with exact requestId correlation.
  - Structured BRIDGE error normalization.
  - Capability negotiation and SAF content-URI grant validation.
  - JS cancellation maps to the exact native request token.
  - Native cancellation is idempotent; late completion cannot win.
  - Individual gates: Remake CI PASS; Legacy Seven + release artifact PASS.

- 8/12 GitHub Self-Dev: COMPLETE
  - Public auth snapshots never contain plaintext access tokens.
  - Single-flight refresh with expiry skew.
  - Per-caller cancellation isolation during shared refresh.
  - Exact full base-SHA mutation contract.
  - Repository path normalization and secret-path rejection before credential acquisition.
  - Mutation result changed-path verification.
  - Individual gates: Remake CI PASS; Legacy Seven + release artifact PASS.

- 9/12 RPG / Canon: COMPLETE
  - Immutable authoritative RPG snapshots with separate world/canon session identities.
  - Branches, titles, relationships and world state under one revision.
  - Deterministic SHA-256 checksum verification.
  - Expected-revision change sets and storage CAS.
  - IndexedDB persistence lives under the storage adapter boundary.
  - Restart/restore and corruption detection.
  - Individual gates: Remake CI PASS; Legacy Seven + release artifact PASS.

- 10/12 Product / UI Polish: COMPLETE
  - Single ShellStore owns workspace, locale/direction, theme, viewport/keyboard and reduced-motion truth.
  - Core / Research / Build / World share one mobile-first shell.
  - Locale-derived RTL/LTR.
  - One ThemeService auto/light/dark scheduler with one timer generation.
  - Reduced-motion authority, logical CSS properties, 44px touch floor and 320px responsive floor.
  - Individual gates: Remake CI PASS; Legacy Seven + release artifact PASS.

- Waves 7→10 manager integration: COMPLETE
  - cross-subsystem TaskManager cancellation isolation.
  - GitHub secret non-leakage into public auth/task snapshots.
  - RPG restart persistence independent of shell/UI projection.
  - Theme single-timer ownership independent of Android capability truth.
  - Combined Remake CI: PASS — 25/25 test files, 237/237 tests, strict typecheck/build PASS, dependency audits 0 vulnerabilities.
  - Combined Legacy Seven + verified release artifact: PASS.
  - Manager PR #70 merged; post-merge Remake CI PASS.
  - Android installed-APK/native round-trip evidence remains a final release gate; browser CI does not pretend to replace device evidence.

- 11/12 AppKernel + Recovery + Observability: COMPLETE
  - One AppKernel owns service boot/shutdown.
  - Deterministic dependency graph with cycle/missing-dependency rejection.
  - Concurrent boot callers share one promise.
  - Startup failure rolls back completed services in reverse order.
  - Failed boot is retryable after recovery.
  - Boot cancellation rolls back completed dependencies.
  - Bounded diagnostics with default token/secret/auth/prompt/message/content/body redaction.
  - Normal path now boots through createSevenRuntime; React no longer constructs TaskManager/ShellStore/ThemeService/AppKernel owners.
  - Individual gates: Remake CI PASS; Legacy Seven + verified release artifact PASS.

- 12/12 Release Assurance + Final Closure: COMPLETE
  - Deterministic release payload manifests.
  - SHA-256 payload identity.
  - Exact installed artifact id/version/payload comparison.
  - Required gate aggregation with PASS / FAIL / BLOCKED / INCONCLUSIVE.
  - Missing release evidence cannot manufacture PASS.
  - Final closure requires evidence-bearing completion records for all 12 phases.
  - Individual gates: rebased Remake CI PASS — 27/27 files, 251/251 tests; Legacy Seven + verified legacy release artifact PASS.

- Final Manager 11+12: COMPLETE
  - normal application path uses one SevenRuntime/AppKernel.
  - boot failure remains recoverable.
  - UI contains no duplicate runtime-owner construction.
  - 12/12 implementation truth is separated from installed-remake release evidence.
  - Combined Remake CI: PASS — 28/28 test files, 255/255 tests, strict typecheck/build PASS, dependency audits 0 vulnerabilities.
  - Combined Legacy Seven + verified legacy release artifact: PASS.
  - Final Manager PR #74 merged; post-merge Remake CI PASS.
  - Normal application boot is now owned by one SevenRuntime/AppKernel.
  - Installed-remake release evidence is now complete.

- Android Release Closure: COMPLETE
  - Dedicated Seven Remake Capacitor package: `ai.seven.remake.v3`.
  - Production Phase 7 transport is wired to the native `SevenRemakeNative` plugin.
  - Deterministic web-payload SHA-256 manifest is embedded into the APK.
  - Installed package/version/payload identity is verified against the built manifest.
  - Native bridge round-trip is verified from the installed WebView.
  - Android 14 installed smoke/identity/bridge gate: PASS.
  - Android 16 installed smoke/identity/bridge gate: PASS.
  - PR #79 merged into `seven-remake-v3` at `a8000ca65ff766a22c510454a3fa8d914f97a314`.
  - Post-merge Remake CI #240 / run `37160934367`: PASS.
  - Post-merge Android Release Gate #5 / run `37160934350`: PASS.
  - Verified APK artifact: `Seven-Remake-V3.apk`, artifact id `11287572718`.
  - APK artifact digest: `sha256:aa75260a9f713a474a5f02d04c78479a60397b69c26977a896ff86a19ca7b445`.
  - Phase 12 required release gates are all PASS.

**REMAKE_PROGRESS=12/12**

**RELEASE_READY=PASS**
