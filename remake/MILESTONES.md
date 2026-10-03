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
- 3/12 Memory + Context: NOT STARTED as an integrated milestone

**REMAKE_PROGRESS=2/12**
