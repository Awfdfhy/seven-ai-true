# Seven Remake V3 — Phase 3/12: Memory + Context

## Goal

Build a deterministic, persistent memory/context pipeline that can shape every provider request without breaking the Phase 1–2 invariants.

## Non-negotiable invariants

1. Exactly one leading system message reaches a provider.
2. Context shaping never mutates committed room history.
3. The newest user turn is never silently dropped.
4. Every context payload has a deterministic input-token budget.
5. Model fallback rebuilds context for the fallback model's own context window.
6. Memory and summaries are versioned, validated and persistable.
7. Summary writes are durable before the new summary is used as persistent truth.
8. Cancellation propagates through memory reads, summarization and persistence.
9. No unbounded memory/context collection is allowed.
10. A malformed memory record or summary fails with a structured SevenError.

## Phase 3A — Durable memory

- Global and room-scoped memory records.
- Priority 0–100.
- In-memory repository for deterministic tests.
- IndexedDB repository for browser/Android WebView persistence.
- One summary record per room.
- Restart/restore round-trip.

## Phase 3B — Context shaping

- TokenEstimator contract.
- Conservative deterministic estimator.
- Explicit output reserve.
- Explicit memory/summary budgets.
- Recent-history retention.
- High-priority/relevant memory selection.
- Summary merged into the leading system message.
- Payload validation before provider dispatch.

## Phase 3C — Summarization orchestration

- ContextSummarizer port.
- Incremental room summary.
- Summary-through-message identity.
- Rebuild after durable summary write.
- Cancellation-safe orchestration.

## Acceptance path

`room + durable memory → context budget → summarize old prefix → persist summary → rebuild → provider payload → fallback model rebuild → restart/restore`

Phase 3 is complete only after this path passes strict TypeScript, unit/integration tests, production build and the legacy Seven regression suite.
