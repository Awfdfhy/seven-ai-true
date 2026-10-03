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

- 4/12 Attachments: CLOSURE CANDIDATE
  - TXT/PDF ingestion with MIME/content sniffing.
  - Bounded raw bytes and extracted text.
  - Realm-safe immutable byte snapshots.
  - Single-flight PDF parser runtime loading.
  - SHA-256 attachment identity.
  - Cancellation-safe durable persistence.
  - In-memory + IndexedDB repositories with restart/restore.
  - Individual gates: Remake CI PASS; Legacy Seven PASS.

- 5/12 Research + Citations: CLOSURE CANDIDATE
  - Canonical citation schema with URL/title/snippet/timestamps/content hash/provider identity.
  - Concurrent bounded research sources.
  - Deterministic citation deduplication.
  - Partial source failures remain visible.
  - Total network/provider failure cannot become silent no-evidence success.
  - Durable research cache with age bounds and explicit bypass.
  - Individual gates: Remake CI PASS; Legacy Seven PASS.

- 6/12 Deep Think: CLOSURE CANDIDATE
  - Two-pass application transport.
  - Planner output is internal and never directly emitted to the user.
  - Planner/final context is rebuilt for each model window.
  - Exactly one leading system message per pass.
  - Bounded planning brief injected as untrusted JSON data.
  - Final payload is revalidated after planning data is added.
  - Cancellation between passes prevents final provider dispatch.
  - Individual gates: Remake CI PASS; Legacy Seven PASS.

- Waves 4+5+6 manager integration: IN PROGRESS
  - attachment-derived evidence → research → Deep Think journey.
  - cross-task cancellation isolation.
  - independent persistence restart/restore.
  - Awaiting combined Remake CI + Legacy Seven + merge/post-merge CI.

**REMAKE_PROGRESS=3/12_COMPLETE + 4-6_CLOSURE_CANDIDATES**
