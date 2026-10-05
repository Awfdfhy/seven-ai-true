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
