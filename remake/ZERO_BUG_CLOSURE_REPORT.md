# Seven Remake V3 — Phase 1–2 Zero-Bug Closure Report

## Scope

This report closes the deep hardening pass for the currently integrated Phase 1–2 surface:

- Chat / rooms / streaming lifecycle
- Task ownership, cancellation and deadlines
- Room persistence and IndexedDB lifecycle
- Provider contracts and streaming transport
- Model registry, routing and provider health
- Current Phase 1–2 architecture boundaries

Future milestones are explicitly out of scope. Any later production change reopens this gate.

## Verified integrated candidate

- Final merged SHA on `seven-remake-v3`: `e216fafc5e7e8ae9e880ce4317e4faecd87caf37`
- Pull request: #60 — `Seven Remake: zero-bug hardening pass 01`
- The last production-source hardening after the earlier `9564b2b` checkpoint was the TaskManager listener-snapshot fix (`475b969`), followed by its regression test (`ced4210`).
- Temporary audit workflows/artifacts were then cleaned before integration.
- Post-merge verification was executed again on the merged `seven-remake-v3` commit itself.

## Deterministic verification

### Seven Remake V3 CI

Pre-merge candidate workflow run: `37125606301` — **SUCCESS**

Post-merge workflow run on `seven-remake-v3`: `37126282472` — **SUCCESS**

- Dependency audit: **0 vulnerabilities**
- Production dependency audit: **0 vulnerabilities**
- Full dependency audit at moderate threshold: **0 vulnerabilities**
- Strict TypeScript: **PASS**
- Test files: **6/6 PASS**
- Tests: **91/91 PASS**
- Production build: **PASS**
- Vite build completed successfully

### Legacy Seven regression suite

Workflow run: `37125606298` — **SUCCESS**

- All legacy Seven test suites: **PASS**
- Reported total: **26 suites PASS**
- Verified release artifact upload: **SUCCESS**

## Adversarial audit handling

Multiple 20/32-agent adversarial waves were used during the hardening pass. Auditor output was treated as untrusted evidence: a finding was accepted only when it identified a real current file/function and a deterministic reproduction that survived manual source review.

Important examples:

- A Current32 C04 report claimed listener reentrancy but its reproduction field was literally a placeholder (`DETERMINISTIC REPRODUCTION`). It was rejected as invalid evidence.
- A prior C10 report referenced a non-existent path and proposed semantics that contradicted the verified task lifecycle. It was rejected.
- A C07 blocked-IndexedDB claim was adjudicated as the intended fail-fast + retryable policy and is covered by a regression proving a subsequent retry succeeds after the blocker closes.
- Free-model timeouts / malformed JSON / missing artifacts were classified as audit-harness failures, not application bugs.

No unresolved reproducible finding from the valid audit evidence remains in the Phase 1–2 production candidate.

## Major bug classes fixed

### 1. Task ownership and cancellation

- Per-room ownership is acquired before asynchronous preflight.
- Competing ChatService instances cannot race the same room owner.
- User cancel and deadlines terminate the public task result even when an executor ignores `AbortSignal`.
- Double cancel and terminal-state transitions are deterministic.
- The internal `deadline` reason cannot be spoofed by callers.
- Completed task retention is bounded.

### 2. Durable commit boundary

- Partial assistant drafts are never committed as completed messages.
- User cancellation cannot cross the final assistant commit seal.
- Deadlines remain active while a final durable write is still pending.
- Persistence receives the same task `AbortSignal`.
- Once the final durable write completes, the deadline can be sealed and cleared.

### 3. Error privacy and retry semantics

- Raw provider causes are not exposed through task snapshots.
- Task result errors use sanitized public messages.
- Safe retry metadata such as `retryAfterMs` is preserved for internal routing/retry logic.
- Unknown thrown objects are not retained wholesale.
- Provider-controlled `Error.name` values are not surfaced in fallback diagnostics.
- Error details are copied/frozen rather than retaining a mutable external object.

### 4. Persistence / IndexedDB

- Runtime validation is enforced at repository boundaries.
- Malformed room state is rejected before persistence.
- IndexedDB version values and identifiers are validated.
- `onblocked` follows an explicit fail-fast retryable policy.
- `versionchange` closes stale connections.
- Transactions/requests can be aborted through the task signal.
- Invalid writes, blocked upgrades and retry behavior have regressions.

### 5. Room and message invariants

- Room/message IDs are canonical.
- Duplicate message IDs are rejected.
- Timestamps are finite and monotonic.
- Persisted state rejects malformed or non-monotonic records.
- Frozen message snapshots are safely reused while mutable external rooms are cloned.
- Equal-time room ordering is deterministic and locale-independent.

### 6. Provider contracts and streaming

- Exactly one leading system message is enforced.
- Runtime-invalid roles, models, capabilities and chunks are rejected.
- Provider adapter identity is validated before dispatch.
- Provider maps and method bindings are snapshotted to prevent mid-generation mutation races.
- Large/meaningless prelude and oversized chunks are bounded.
- Custom ChatTransport deltas are runtime-validated.

### 7. Fallback correctness

- Fallback may occur only before meaningful output begins.
- Whitespace-only output does not falsely lock the request to a failed provider.
- A failure after meaningful output begins cannot splice another provider's answer into the same response.
- Failure diagnostics are normalized and privacy-safe.

### 8. Model registry and router

- Registry replacement is validated and deterministic.
- Duplicate/malformed descriptors are rejected.
- Model keys are collision-safe.
- Preferred-model resolution rejects ambiguous or non-canonical identifiers.
- Quick / Balanced / Deep scoring is deterministic.
- Tie breaking is locale-independent.
- Numeric overflow / NaN / invalid runtime values are rejected.

### 9. Provider health

- Penalties and cooldowns are explicitly tracked.
- `retryAfterMs` creates cooldowns.
- Stale success/failure updates are ignored using ordered attempt identity/generation logic.
- Forged/cross-provider health attempt tokens are rejected.
- The health clock is not consulted when health tracking is disabled.

### 10. Architecture / resource hardening

- No mutable `window.Seven*` runtime ownership is introduced.
- UI remains isolated from direct provider/network/storage responsibilities in current Phase 1–2.
- Assistant draft growth and provider chunk/prelude growth are bounded.
- Architecture, stress and zero-bug regression suites remain permanently in the repository.
- Dependency auditing is now a permanent CI gate.

## Closure verdict

```
PHASE_1_2_ZERO_BUG_GATE

Integrated merge          e216faf
Last production hardening 475b969
Regression checkpoint     ced4210
Remake test files         6/6 PASS
Remake tests              91/91 PASS
TypeScript                PASS
Production build          PASS
Dependency vulnerabilities 0
Legacy suites             26/26 PASS
Known reproducible bugs   0
Temporary audit workflows CLEANED

ZERO_BUG_SCOPE=PHASE_1_2
KNOWN_REPRODUCIBLE_BUGS=0
ZERO_BUG_GATE=PASS
```

This is a zero-known-reproducible-bug verdict for the defined Phase 1–2 scope at the integrated merge commit `e216faf`, not a mathematical claim that arbitrary future environments or future code can never reveal another defect. Any reproducible new defect reopens this gate immediately.
