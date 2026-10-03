# Phase 3 memory/context hardening — Wave 3 COMPLETE — 2026-10-03

This checkpoint closes the previously recorded Phase 3 functional gaps while preserving all Phase 1–2 invariants. PR #61 was merged into `seven-remake-v3`, and the post-merge Remake CI completed successfully.

## Changes

- Memory records, summaries and identifiers have explicit size limits. Capacity is enforced transactionally. The eviction policy is explicit: **manual-delete-only** — user memory is never silently evicted; replacements are allowed at capacity and deletion frees capacity.
- Context policy/settings now have a dedicated in-memory + IndexedDB repository. Policies are normalized to a complete canonical shape, survive restart, honor cancellation, and are consumed by `MemoryContextService`; per-request policy still overrides persisted defaults.
- Context summaries are now schema v2 and carry a source-history fingerprint. Legacy v1 summaries are migrated on read. Missing or edited source history invalidates stale summaries, removes them with compare-and-swap, and rebuilds context rather than failing the request.
- Summary mutation now uses storage-level compare-and-swap. Separate repository instances/tabs cannot silently overwrite each other; a stale writer receives a retryable structured storage conflict.
- Context construction still retains the newest user turn, preserves a contiguous history suffix, quotes memory/summary as untrusted data inside exactly one leading system message, and never mutates committed room history.
- Full payload framing counts toward deterministic budgets. The conservative estimator remains intentionally stricter than provider tokenizers.
- Provider-backed summarization now chunks oversized source transcripts against an explicit summarizer context-window budget, carries the prior compact summary forward between chunks, enforces a bounded chunk count, and rejects provider output that exceeds the requested summary budget.
- Routed fallback continues to rebuild context for each candidate model's own context window and prevents dispatch after cancellation.
- Persistent and adversarial tests cover restart, stale/edited history, legacy migration, cancellation, cross-tab CAS races, persisted policy precedence, provider fallback, and bounded summarizer chunking.

## Verification

Authoritative closure-candidate Remake CI: **Seven Remake V3 CI #188 = SUCCESS**.

- strict TypeScript: PASS
- test files: **16/16 PASS**
- tests: **190/190 PASS**
- production build: PASS
- production dependency audit: **0 vulnerabilities**
- full dependency moderate-severity audit: **0 vulnerabilities**

Final-head Legacy Seven regression passed before merge. Post-merge Remake CI also passed on merge commit `30330ff0b27ecac13c95a987c6a5911e9dcf154b`.

## Closure status

- final-head Legacy Seven regression: **PASS**
- PR #61 merge into `seven-remake-v3`: **PASS**
- post-merge Remake CI: **PASS**
- milestone status: **3/12 COMPLETE**

The Remake UI/Android product shell remains later milestone work and is not part of the Phase 3 Memory + Context acceptance boundary.
