# Seven AI — Self-Development + Tools Production Report

Status: PARTIAL — evidence-gated hardening in progress
Owner: Chat 4 (current four-developer assignment)
Branch: `chat4-selfdev-tools-hardening`

## Reality audit

GitHub/main is authoritative. The shipped root product is the HTML/Capacitor application. Typed/remake specialist branches are separate product trains and are not credited to the APK without explicit migration evidence.

### Tools inventory
- Root SevenRuntime exposes schema/policy/permission primitives and tool discovery/aliasing.
- Current product evidence identifies real adapters for `web.search` and `artifact.search`; discovery is not treated as execution.
- Native GitHub operations exist behind SevenPlatform and are separately permission/boundary tested.
- Richer typed Tools implementations exist outside the root product and are not blindly merged.
- A contract mismatch exists between legacy `schema` and typed `inputSchema`, plus differing risk vocabularies.

### Self-development inventory
- `release/github-self-dev.js` provides branch creation, bounded repository inspection, model-planned edits, atomic publication, exact-SHA CI wait, bounded repair, PR creation and SHA-bound optional merge.
- Protected evaluator/CI/auth/release paths are blocked from autonomous edits.
- `evolution/*` contains experiment, baseline/candidate evaluation, trusted-eval binding, durable checkpoints, rollback/recovery and Coding adapter policy.
- The shipped GitHub Self-Dev UI does not yet prove that its production path is routed through the full Coding + Evolution acceptance engine. Therefore Self-Development is not Production Ready.

## Batch 1 — Unified Tool Contract

Added:
- `release/tool-contract.cjs`
- `release/tool-contract.test.cjs`

The adapter normalizes:
- id/name
- `schema` vs `inputSchema`
- output schema
- risk vocabulary
- permission/resource declarations
- side-effect and confirmation flags
- bounded timeout
- bounded retry declaration
- cancellation
- normalized error envelope
- audit metadata

Execution fails closed when no executor or authorization gate exists. A discovered/stub tool cannot become executable merely by registration.

## Evidence

Draft PR: #121
Candidate SHA: `c985aa250b5b18d9999e4af2a79def00ff981a07`
Earlier exact-SHA Seven AI tests run: 37303610007 was started for SHA `c985aa250b5b18d9999e4af2a79def00ff981a07`; it is not evidence for later commits.

Focused regression covers schema/risk normalization, duplicate IDs, unavailable executor, denied authorization, successful audited execution, pre-cancellation and timeout.

No benchmark/test threshold was lowered and no existing test was deleted.

## Known gaps / risks

1. Unified contract is not yet wired into every legacy/native tool call site; doing so requires integration review because it changes a shared Tool boundary.
2. Production Self-Dev still has two architectural layers: `release/github-self-dev.js` and `evolution/*`. Full routing through Coding System + trusted eval acceptance is not yet demonstrated.
3. Real adapters remain intentionally limited. No claim is made that plugin/MCP discovery equals executable capability.
4. MBR-043 mutable workflow/infrastructure isolation remains open until behavioral evidence proves candidate work cannot mutate the verification infrastructure.
5. Required-status branch enforcement is an external repository gate (MBR-042).
6. A real bounded baseline→candidate→Coding→tests→benchmark→accept/reject→archive E2E remains required.

## Cross-system dependencies

- Coding System owner: expose a stable request/verified-patch interface that Self-Development can call without bypass.
- Master/Integration: approve the shared Tool adapter boundary before broad call-site migration.
- Verification: provide trusted immutable evaluation receipts bound to baseline SHA, candidate SHA and corpus identity.
- Android: later prove cancellation/timeout/native adapter behavior in the packaged WebView.

## Next exact actions

1. Wait for exact candidate CI and diagnose any failure without weakening gates.
2. Wire one root executable tool through the unified adapter behind existing SevenRuntime authorization and add compatibility regression.
3. Define the minimal Self-Dev→Coding request/receipt adapter against the Coding owner's public contract; do not invent a competing Coding engine.
4. Add an E2E fixture where a measured weakness produces a candidate, trusted eval compares it to baseline, a failed candidate is rejected/rolled back, and the learning record prevents blind repetition.
5. Re-run exact-SHA CI and integration contracts, then hand the Draft PR to Master.

## Readiness

PARTIAL. Not READY FOR INTEGRATION until exact-SHA CI is green and one existing root tool is proven through the adapter. Self-Development remains PARTIAL until the Coding/Evolution production seam is proven E2E.


## Batch 2 — Acceptance and learning hardening

- Root integration contracts now exercise the unified Tool normalization seam against the existing SevenExecution boundary; the adapter does not grant execution.
- Evolution acceptance changed from candidate score >= baseline score to strict candidate score > baseline score. Equal candidates are rejected.
- Added `evolution/learning-archive.cjs` and focused tests. Records bind hypothesis, baseline/candidate/patch SHA, tests, metrics, outcome, reason and rollback metadata with a checksum. The archive exposes a guard for previously failed identical baseline+hypothesis experiments.
- The archive is intentionally not yet auto-wired to production promotion. Wiring must be atomic with durable evolution state or explicitly recoverable; otherwise an archive write failure could create false history.

Latest implementation SHA before this report update: `12c393bdf3f736bc15b4418f9fced87908729612`.


## Batch 3 — Verification-infrastructure isolation

- Evolution protected paths now cover all of `.github/`, not only `.github/workflows/`.
- Regression proves an experiment cannot request `.github/CODEOWNERS` or workflow paths.
- This strengthens MBR-043 but does not close it: behavioral candidate-worktree evidence is still required.
- Exact-SHA CI requested for implementation SHA `6ea22050938719233234991392e7eebdbda2fc99`; run 37304286099 was pending when recorded.


## Batch 4 — CI repair, durable learning, behavioral isolation

### Failure found and fixed
Exact-SHA run 37304323351 failed in `release/tool-contract.cjs` with a Node syntax error caused by mixing `&&` and nullish coalescing without explicit grouping in retry normalization. The expression was fixed and retry-policy normalization gained focused regression coverage. This failure is retained as evidence; it was not hidden or bypassed.

### Durable learning
- Added `evolution/learning-store.cjs` and test.
- Learning records use the existing atomic state envelope/checksum store.
- Reload verifies integrity; tampered committed state fails closed.
- `runCodingEvolution` now archives terminal trusted-evaluation outcomes with baseline/candidate SHA, evidence ID, metrics, outcome and rollback metadata.
- `PENDING_APPROVAL` is not misclassified as a terminal learning result.
- Archive persistence errors are surfaced as `learningError`; they do not silently rewrite the already-observed promotion outcome.

### Behavioral isolation
`runCodingCandidate` now has a regression proving a candidate that reports `.github/CODEOWNERS` as a changed path is rejected as `REJECTED_SCOPE` and its isolated candidate is discarded.

Latest candidate implementation SHA before this report update: `457f0ff04698209e67a84ead49a13b695c9ff938`.
Exact-SHA Seven AI tests run 37304769178 was pending when recorded.


## Batch 5 — Retry execution and learning-loop guard

### CI failure retained
Run 37304844600 failed because the newly added retry regression fixture itself was malformed by an unsafe textual replacement (`timeoutMs:10,...}0`). The fixture was repaired without weakening any assertion. This is recorded as a Chat 4 regression, not hidden.

### Tool runtime
- Scalar permission/resource declarations now normalize as one item rather than being spread into characters.
- Retry policy is executable, not metadata-only.
- Retry is bounded to max 3 retries.
- Only normalized retryable failures (network/rate-limit/timeout) retry.
- Non-retryable tool failures fail fast.
- Cancellation is checked between attempts and never intentionally retried.
- Audit evidence records attempt count.

### Self-Development learning loop
- Before Coding begins, `runCodingEvolution` checks the durable learning archive for the same subsystem+hypothesis+baseline fingerprint.
- A prior terminal failure/rollback rejects the duplicate experiment as `REJECTED_REPEAT_FAILURE` at `LEARNING_GUARD`.
- Regression proves the second Coding Agent receives zero calls.
- A changed hypothesis or changed baseline remains eligible, so learning does not permanently blacklist a subsystem.

Latest implementation SHA before this report update: `0c0a4b2aa257a89ea2b61619de6071f67c64620a`.
Exact-SHA Seven AI tests run 37305481877 was pending when recorded.


## Batch 6 — Contract validation, side-effect safety, rollback learning

### CI failure retained
Run 37305550986 failed at the unified legacy contract assertion. The assertion relied on cross-VM object/reference semantics rather than the contract's schema meaning. It was replaced with explicit semantic checks for type, required field, property type and additionalProperties; execution authorization requirements were not weakened.

### Concurrent branch safety
A GitHub 409 occurred while updating `release/tool-contract.cjs`, proving the branch advanced concurrently. The update was not forced. The latest blob was re-read before further work, preserving concurrent hardening.

### Tool contract now present on branch
- cloned and deep-frozen input/output schemas and metadata
- conservative schema validation before execution and output validation after execution
- malformed output -> `MALFORMED_OUTPUT`
- invalid input -> `VALIDATION_ERROR`
- non-idempotent side-effect tools cannot retry
- side-effect tools require cooperative abort semantics before bounded timeout execution
- timed-out read/idempotent execution is aborted when possible and late results are quarantined in audit semantics
- normalized scalar/array permissions and resources
- bounded retry only for retryable normalized failures

### Rollback learning evidence
The post-apply regression test now verifies the durable learning archive records `ROLLED_BACK`, candidate SHA and rollback baseline SHA after the promotion adapter restores baseline.

Latest Chat 4 SHA before this report update: `e0761cd4a52e8d5f59bbd9db46f1fa391e6a66cd`.
Exact-SHA run 37305863396 was queued when recorded.


## Batch 7 — Learning fingerprint hardening and idempotent retry proof

- Repeat-failure fingerprints now canonicalize subsystem, hypothesis whitespace/case, and baseline SHA case. Cosmetic changes can no longer bypass the learning guard and re-run an already failed experiment.
- Regression proves `TOOLS` / `tools`, repeated spaces, and SHA case normalize to the same failed-experiment fingerprint.
- Added explicit execution proof that a WRITE tool retries only when it declares both idempotency and cooperative abort support. Non-idempotent side effects remain retry-disabled.
- Older run 37305926980 was cancelled after the branch advanced and is not counted as pass/fail evidence.

Latest implementation SHA before this report update: `fb8d4162dce100822942eb1026ea2a5ccef2a520`.
Exact-SHA run 37306204165 was pending when recorded.
