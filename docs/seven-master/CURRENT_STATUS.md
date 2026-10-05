# Seven AI — Current Status

Last integration update: 2026-10-05

## Integration position
**Release candidate validation in progress. Seven is not yet final-accepted.**

The Integration track has now repaired and regression-locked the highest-confidence cross-system failures found in the master bughunt: execution checkpoint integrity/retention, Canon chronology/branch boundaries, IndexedDB recovery, Arabic IME send safety, response-mode truth, room/mode cancellation, Deep Think role ordering and telemetry ownership, multilingual/context-window budgeting, fallback deadlines, provider discovery timeouts/health, GitHub credential expiry/path/log handling, attachment retry/size/type gates, research temporal citation locks, and multiple RPG projection/pack/snapshot defects.

## Evidence already green
- Seven AI tests: SUCCESS on main SHA 6f5063d61526880542107c825d2f48c64715e46f.
- Seven AI tests: SUCCESS on main SHA 7e320564c9c519283a5e93fb6c0b9a0343a16bcd.
- Seven Reality Lab: SUCCESS on SHA 428f5fd027c2203aa03808e782a1a0367d58a583.
- Recent static audit: PASS at 98,775 hot release-layer bytes, under the 100,000-byte gate.
- RPG focused evidence: 1010 state events, versioned session rollback/isolation/quarantine tests, bounded character context, and 1006-event long-story restart harness.

## Current RC batch
The next code SHA after this document update must pass:
1. all.cjs / Seven AI tests;
2. production release verifier/static audit;
3. Android lint + unit tests + APK build;
4. APK content verification;
5. Android 16 connected WebView tests;
6. Android 14 connected WebView/UI tests.

No later code push should be credited without rerunning those gates.

## Known acceptance blockers / external dependencies
- Live legacy RPG workspace is not yet atomically unified with the new structured RPG session manager/public Memory projection.
- Android background/process-death during queued room persistence is not fully proven.
- Repository required-status enforcement cannot be verified or configured through the current GitHub App. Repository rulesets currently return an empty list; branch-protection read requires unavailable administration permission.
- Agent workflow isolation is not fully proven.
- Several PARTIAL UI/lifecycle ownership items remain; see BUG_STATUS.md.

## Acceptance statement
**No zero-bugs claim.** Current meaning of green is only: zero known reproducible blockers in the specific suites that passed. Full Integration Acceptance requires the latest release-code SHA to complete Web + Android gates and resolution/explicit acceptance of the blockers above.

See:
- docs/seven-master/INTEGRATION_AUDIT.md
- docs/seven-master/BUG_STATUS.md
- docs/seven-master/INTEGRATION_CONTRACTS.md

## Coding Specialist — V1 Verified Candidate

Status: **IMPLEMENTATION + SPECIALIST VERIFICATION COMPLETE; MERGE/PRODUCT UI INTEGRATION PENDING**

Branch: `coding-system-v1`  
PR: #104 — `Coding System V1 — full verified coding agent runtime`  
Verified code-bearing SHA: `371db3e45aea21fd1f0d191ff88542d64c914490`

### Implemented runtime
- Full lifecycle: Understand → Inspect → Research → Plan → Edit → Test → Debug → Verify → Review → Document.
- Exact Git head + file SHA-256 + repository snapshot fingerprints.
- Stale-head, stale-snapshot and stale-file rejection.
- Transactional multi-file candidate construction, rollback snapshot and blast-radius budgets.
- Bounded automatic repository discovery, language/build/test/instruction detection, symbols/imports and relevance-ranked repo map.
- Provider-backed structured Coding model adapter.
- Shared ModelRouter + ProviderHealthTracker routing/failover; no private Coding provider router.
- ResearchService bridge.
- Atomic exact-base GitHub tree/blob commit adapter with non-force branch update and post-commit verification.
- Deterministic verification policy outside model authority.
- Bounded debug/repair loop.
- Deterministic anti-test-weakening diff review.
- Optional independent reviewer route.
- GitHub Actions candidate verification adapter.
- Repository operations registered through ToolRegistry / ToolExecutor:
  - coding.repo.head
  - coding.repo.list
  - coding.repo.read
  - coding.repo.commit
- Scoped capabilities, mutation approval, idempotency/replay protection, audit, effect ledger, mutation concurrency group and external cancellation propagation.
- Uncertain mutation effects fail closed to BLOCKED/reconciliation instead of blind retry.
- Runtime task scope is bound to the originating task ID.

### Verification evidence on the same code SHA
- Seven Remake V3 CI #407 — **SUCCESS**
  - dependency audits
  - strict TypeScript
  - Vitest regression
  - production build
- Seven AI tests #3239 — **SUCCESS**
  - `node all.cjs`
  - verified release artifact
- Seven Remake Android Release Gate #173 — **SUCCESS**
  - Remake compile/tests/build
  - deterministic payload identity
  - Android lint + unit tests + APK build
  - APK embedded identity verification
  - Android 14 installed WebView/smoke gate
  - Android 16 installed WebView/smoke gate

### Adversarial / focused coverage added
- stale workspace/head/file cases
- ambiguous/missing patch anchors
- critical-path authority denial
- resulting-byte blast-radius enforcement
- repository concurrent-head drift
- test disabling/assertion reduction detection
- mandatory verification cannot be removed by model
- bounded failed-test → diagnose → repair → reverify loop
- model-route provider failover/health penalty
- Tool Fabric read/write capability enforcement
- mutation approval and audit evidence
- replay-safe repeated commit
- cancellation propagation into tool execution

### Shared contract status
`INTEGRATION_CONTRACTS.md` is synchronized from current main and is **not expanded or weakened** by Coding V1. The implementation fits underneath the existing Coding + Tool + Cancellation contracts.

### Remaining integration work
These are not Coding-runtime implementation blockers:
1. merge/reconcile PR #104 into the chosen product branch;
2. expose the Coding runtime through the final Seven UI/workspace flow (Android/APK/UI owner);
3. run a live provider + connected GitHub canary through the composed Seven runtime when production credentials/approvals are available;
4. hand Self-Development to this verified Coding path only after integration accepts the merge.

No claim of zero bugs is made. The statement is narrower: **Coding V1 specialist implementation has no known reproducible blocker in the suites above and is ready for integration review.**
