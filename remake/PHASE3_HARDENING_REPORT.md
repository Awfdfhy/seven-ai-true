# Phase 3 memory/context hardening — 2026-10-03

This checkpoint combines the existing Phase 3 branch with four parallel review/implementation lanes: persistence, context construction, summary orchestration, and routed transport. It does not mark the entire milestone complete or claim an absence of all bugs.

## Changes

- Memory records, summaries and identifiers have explicit size limits. Repository capacity is enforced in the same IndexedDB transaction as insertion; replacements remain possible at capacity. No automatic eviction of user memories occurs.
- Stored records are validated and projected to canonical fields. Cancellation before opening storage avoids unnecessary work; cancellation during a write aborts the transaction. Restart, malformed-schema and concurrent-capacity cases are covered.
- Context construction retains the latest user turn and its following replies, preserves a contiguous history suffix and never mutates committed history. Memory and summary content is quoted as data inside exactly one leading system message.
- Full payload and section framing count toward deterministic budgets. The UTF-8 byte estimator is deliberately conservative, including for Arabic and emoji; it is a heuristic rather than the provider's exact tokenizer.
- Candidate summaries are validated before durable writes. Oversized summaries cannot replace valid persistent state. Incremental summaries do not duplicate an excluded summary's raw history.
- Preparation snapshots input, validates policy before copying, propagates cancellation across asynchronous ports, and coordinates same-room mutation. Queue and pass limits bound work.
- Routed fallback rebuilds context using each model's window, passes the reserved output limit, handles capacity-only fallback, and prevents dispatch after cancellation. Provider summarization also receives its output limit and rejects cancellation on stream completion.
- A persistent end-to-end test covers memory → summary → durable write → primary failure → smaller fallback → chat commit → repository close/reopen → reuse.

## Verification

Local merged-checkpoint results: strict TypeScript PASS; 176/176 tests across 14 files PASS; production build PASS. Dependency audit returned zero known vulnerabilities in the installed dependency set. See PR #61 CI for the final commit's authoritative checks.

The local legacy run passed its early Node suites but stopped at browser launch: the required Chromium executable was unavailable, and both full-browser and headless-shell downloads returned invalid archives. No browser test failure was converted into a pass; the existing GitHub legacy workflow remains the required gate.

## Remaining scope and limits

- Persistent context-policy/settings storage and an explicit migration strategy remain milestone work.
- Stale summary message IDs fail explicitly; automatic recovery for edited or imported histories remains to be designed.
- The service coordinates shared repository instances. Cross-tab/separate repository instances need storage-level compare-and-swap before claiming multi-writer summary safety.
- Custom estimators, context sources and storage/provider adapters are trusted ports. Adapters must honor output limits and abort before committing; the service cannot undo writes from an adapter that ignores its signal.
- The provider-backed summarizer still needs input-window-aware chunking for extremely long omitted prefixes.
- The Remake UI is still the foundation shell. This checkpoint does not deliver a new Android APK or prove live model quality or device WebView behavior.

Progress remains **2/12 complete; 3/12 in progress** pending remaining scope, review and integration gates.
