# Phase 3 memory/context hardening — Wave 3 closure candidate — 2026-10-03

This checkpoint closes the previously recorded Phase 3 functional gaps while preserving all Phase 1–2 invariants. It is a closure candidate until PR #61 is merged and post-merge CI on `seven-remake-v3` is green.

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

Legacy Seven regression remains a mandatory pre-merge gate on the final PR head. After merge, the push-triggered Remake CI on `seven-remake-v3` is the final Phase 3 closure gate.

## Remaining closure gates

1. Final-head Legacy Seven regression must pass.
2. Merge PR #61 into `seven-remake-v3`.
3. Post-merge Remake CI on `seven-remake-v3` must pass.
4. Then update `MILESTONES.md` to Phase 3 COMPLETE / `REMAKE_PROGRESS=3/12`.

The Remake UI/Android product shell remains later milestone work and is not part of the Phase 3 Memory + Context acceptance boundary.
