# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: READY

DOMAIN_ID=D01_CHAT_CORE
SOURCE_ANALYSIS=Harvested primary sources analyzed: Streams API [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/Streams_API (async iteration, chunked delivery, backpressure semantics); AbortController [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/AbortController (controller-based cancellation, signal propagation to fetch/streams); React preserving-and-resetting state [SOURCE primary] https://react.dev/learn/preserving-and-resetting-state (keying, remount behavior, IME/composition pitfalls). MDN asset URLs are static CSS/fonts (not normative specs). No ChatGPT release notes content present in harvested payload. Limitations: harvested set is mostly API primitives (streams/abort/state) — lacks chat-specific UX (send/stop, retry, IME composition lock details, streaming error taxonomy) and concrete provider streaming implementations. Freshness: MDN/react current as of harvest; primitives stable.

CURRENT=Seven current implementation evidence (repo-inspected):
- `remake/src/application/chat/chat-service.ts` (send, streaming loop, draft emission, cancellation seals, commit-on-success). Key points: per-room active-check (`this.tasks.listActive(roomId).length>0`), user message committed before generation, consumes `transport.stream({room, signal})` as AsyncIterable, accumulates draft with `MAX_ASSISTANT_DRAFT_CHARS` guard, invokes `onDraft` safely (isolated catch), aborts on signal, requires non-empty trimmed draft, uses `sealCancellation()` then commits assistant exactly once, final `sealDeadline()`; returns `ChatRun` with `taskId`, `result` Promise<Room>, `cancel`.
- `remake/src/domain/chat/index.ts` (Room/ChatMessage, createRoom, commitMessage, cloneRoom, isRoom). Immutable snapshots, frozen messages, timestamp invariant (message timestamp >= room.createdAt, now = max(updatedAt, requestedTime)), UUID id generation with collision guard (`room.messages.some(m => m.id===id)`), validation of roles/content/timestamps.
- Ownership/cancellation: TaskManager is single owner (Milestone 1/12); unified cancellation; default deadline; exactly one active generation per room.
- Persistence/architecture: RoomRepository port, in-mem + IndexedDB impls; architecture enforces UI never calls providers/storage directly; AppKernel owns composition.

TARGET=Desired behavior for chat/core:
- Deterministic send/stop: stop/cancel never commits partial assistant response; double-stop is idempotent; race-free per-room ownership.
- Streaming correctness: backpressure via AsyncIterable consumption, provider delta validation, bounded draft size, clear retryability on provider errors.
- Composer UX: IME composition lock (Enter-to-send disabled during composition), text state preservation on remounts keyed by roomId (React state reset rules), attachment eligibility, send eligibility tied to active task + validity.
- Robustness: provider error taxonomy (PROVIDER/VALIDATION/ABORT) with retryable flags where appropriate, transport contract strictness, signal propagation end-to-end.

NOW=First high-value slice (smallest that materially improves):
- Composer controller: explicit IME composition state (compositionstart/end/composing flag), Enter-to-send policy (no send on Enter during composition, Shift+Enter newline or explicit send), auto-grow request ownership, send disabled while task active. Evidence-based from React state guidance (composition events). 
- Transport contract hardening: validate AsyncIterable shape early; emit structured provider errors with retryable classification (align with existing `retryable` on "Provider completed without assistant content"); document abort mapping to DOMException("AbortError").
- Draft emission: ensure onDraft provides frozen snapshot and roomId/taskId stable; consider rate-limiting high-frequency deltas to avoid re-render storms without losing correctness (non-blocking, keep as-is but add test).

NEXT=Next improvements:
- Retry policy: idempotent retry of send with backpressure, distinguish between pre-first-token failure (retry/fallback domain) and mid-stream failure (do not splice providers) — integrate with Models+Routing invariants (fallback only before first token). 
- Stop UX: cancel() idempotent, task state transitions visible to UI, ensure cancellation path clears active task before UI can re-send.
- Switching rooms: preserve composer draft per roomId, reset when room deleted/cleared; use React keys/remount rules to avoid leaking state.

LATER=Longer-term ideas:
- Stream progress metrics (tokens/bytes/sec), first-token latency, cancellation latency.
- Redact-sensitive content in error details; structured telemetry (no PII).
- Backpressure test harness simulating slow consumer.

TESTS=Deterministic proof:
- Per-room concurrent send race (already gate exists per Milestones) — extend with double-send via rapid UI actions.
- Stop/double-stop: cancel during draft emission, after user commit before stream, after stream ends; verify no partial commit.
- Streaming: empty delta skip, non-string delta rejection, oversized draft rejection, provider returns non-iterable, completion with empty trimmed content (retryable). 
- IME: composition lock prevents premature send; Enter handling correct in composition states.
- Persistence: user message persisted before generation; assistant committed exactly once on success; cancellation never commits assistant.
- Adversarial: transport throws mid-stream, signal.aborted during loop, sealCancellation/sealDeadline behavior.

RISKS=Security/privacy: draft callbacks must not leak secrets (no provider headers in draft). Performance: onDraft called per delta — must remain cheap/catch errors. Android: IME differences (composition events timing), WebView focus. RTL: composer text direction independent but input handling stable. Cross-system: AbortController/AsyncIterable available in browser/WebView; ensure no Node-only assumptions in web bundle. Race conditions if UI bypasses TaskManager active checks.

FIRST_SLICE=Composer IME composition lock + send eligibility tests (small, UI-agnostic logic where possible, or controller-level). Implement via explicit composition flag on composer controller and corresponding unit tests; minimal UI wiring if needed. This is evidence-backed (React preserving state + composition semantics) and directly impacts send/stop correctness.

KNOWN_UNKNOWNS=Harvested sources don’t include chat UX specifics (IME edge cases, mobile keyboard), provider streaming error catalogs, or concrete retry strategies. Need to inspect existing composer/controller implementation in repo (if any) under remake/src/ui or application-layer composer to avoid duplication with ShellStore ownership. Also confirm AbortController/stream support baseline for Android WebView target.

DOMAIN_VERDICT=READY_FOR_PLAN
