# Seven AI — Capability 09 Side-Effect Ledger Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / current foundation exists**
Final target: **Seven Effect Ledger 3.0 — Evidence-Bound Real-World Change Journal**

## Executive decision

The current SideEffectLedger is a strong seed: it requires idempotency keys, records PLANNED/ATTEMPTED/VERIFIED/FAILED/UNCERTAIN states, requires evidence for VERIFIED, and prevents rollback claims for non-reversible effects.

Its main architectural weakness is that a single linear state tries to represent several independent truths at once.

A real external action has at least four orthogonal questions:

1. Did Seven dispatch the request?
2. Did the external effect actually occur?
3. Has that effect been independently verified?
4. If compensation/rollback was attempted, what happened to that compensation?

These must not collapse into one status.

> **Prime law:** Transport outcome is not effect truth. Seven records dispatch certainty, effect certainty, verification evidence and compensation state separately, and never invents exactly-once semantics across boundaries it does not control.

---

## 1. Ground truth

Current implementation in `hardening/side-effect-ledger.cjs` already provides:
- mandatory idempotency key;
- `PLANNED` before attempt;
- explicit `UNCERTAIN` state;
- evidence requirement for `VERIFIED`;
- transition validation;
- unresolved-effect listing;
- reversible flag before `ROLLED_BACK`.

This is better than generic `success=true`, but it remains insufficient for the final Seven architecture because:
- dispatch certainty and effect certainty are coupled;
- multiple attempts are not first-class records;
- idempotency scope is not typed strongly enough;
- partial effects are not explicit;
- compensation has only one coarse state;
- reconciliation strategy is not a first-class contract;
- crash/reload durability requirements are not frozen;
- remote idempotency support is not distinguished from local deduplication;
- real-world exactly-once cannot be guaranteed for arbitrary external systems.

---

# 2. Pass A — MAXIMIZE

## 2.1 Split effect identity from attempts

A canonical `EffectRecord` represents the intended real-world change.

Each network/tool execution becomes a separate `EffectAttempt`.

One effect may have zero, one or several attempts. Retries do not create a new logical effect unless the user/task intent itself changed.

## 2.2 Canonical effect identity

`EffectKey` must bind enough identity to prevent accidental cross-action deduplication:

- principal/account;
- task/run;
- canonical capability/action;
- canonical target/resource;
- normalized action payload fingerprint;
- binding/schema revision;
- idempotency namespace/version.

A provider-supplied idempotency token may be attached but never replaces Seven's logical effect identity.

## 2.3 Orthogonal state dimensions

Do not use one overloaded status.

### Lifecycle
- `OPEN`
- `RECONCILING`
- `COMPENSATING`
- `CLOSED`
- `ESCALATED_UNRESOLVED`

### Dispatch certainty
- `NOT_DISPATCHED`
- `DISPATCH_CONFIRMED`
- `DISPATCH_POSSIBLE`
- `DISPATCH_REJECTED_BEFORE_SEND`

### Effect certainty
- `UNKNOWN`
- `ABSENT_VERIFIED`
- `PRESENT_VERIFIED`
- `PARTIAL_VERIFIED`
- `CONFLICTING_EVIDENCE`
- `NOT_APPLICABLE`

### Compensation state
- `NONE`
- `AVAILABLE`
- `PLANNED`
- `ATTEMPTED`
- `VERIFIED`
- `FAILED`
- `UNCERTAIN`

The user-visible summary is derived from these dimensions rather than becoming canonical state itself.

## 2.4 Effect classes remain stable

Keep the six canonical classes already adopted by Seven:

- `NONE`
- `OBSERVATIONAL`
- `REVERSIBLE_WRITE`
- `IRREVERSIBLE_WRITE`
- `EXTERNAL_COMMUNICATION`
- `UNKNOWN_EFFECT`

Do not explode this into dozens of mutually inconsistent risk classes. Additional impact labels may be derived separately.

## 2.5 EffectPlan

Before dispatch, create an `EffectPlan` containing:

- EffectKey;
- task/run/principal refs;
- ActionFingerprint / AuthorizationReceipt ref;
- canonical capability and ToolBinding revision;
- target/resource ref;
- side-effect class;
- retry/idempotency policy;
- verification recipe;
- reconciliation recipe;
- compensation recipe if available;
- timeout/cancellation semantics;
- expected evidence shape;
- createdAt and policy/schema versions.

No side-effecting call is dispatched before this record exists durably enough for the current platform tier.

## 2.6 Attempt journal

`EffectAttempt` records:

- attempt id and ordinal;
- EffectKey;
- dispatch start/end timestamps;
- tool/binding revision;
- request fingerprint;
- downstream idempotency token if supported;
- transport result class;
- dispatch certainty;
- cancellation status;
- response/result hash;
- raw diagnostic reference when policy permits;
- budget/retry reason;
- lineage to ToolCallContract.

Attempts are append-only events. Current views are derived.

## 2.7 Idempotency truth

Keep Tool Fabric's canonical idempotency classes:

- `SAFE_REPEAT`
- `KEYED_REPEAT`
- `DO_NOT_REPEAT`
- `UNKNOWN`

Rules:

- `SAFE_REPEAT`: bounded automatic retry may be allowed when policy/budget permit.
- `KEYED_REPEAT`: automatic retry only if the downstream boundary supports the reviewed stable idempotency path and the same logical EffectKey is reused.
- `DO_NOT_REPEAT`: no automatic post-dispatch retry.
- `UNKNOWN`: no blind retry once dispatch may have occurred.

Local duplicate suppression does not prove the remote world changed only once.

## 2.8 No fake exactly-once

Seven can provide stronger semantics inside storage/process boundaries it controls.

Across arbitrary remote systems, canonical claims are limited to evidence-supported states.

Never expose `EXACTLY_ONCE` as a generic promise.

Where a remote service supports stable idempotency keys, Seven may derive a stronger provider-specific guarantee class, but it stays evidence/provider-bound.

## 2.9 VerificationRecipe

Every non-observational effect should have a typed verification plan where practical.

Examples of recipe categories:
- read-back the target state;
- fetch created object by stable id;
- compare artifact hash/version;
- query operation/task status;
- inspect authoritative local store;
- verify external acknowledgement plus read-back when required.

Verification evidence includes source identity, locator, observedAt, hash/version and verdict.

A tool's own return value is not automatically independent verification.

## 2.10 ReconciliationRecipe

When dispatch/effect certainty is incomplete, move to reconciliation rather than guessing.

A recipe specifies:
- permitted observation capability;
- target identifiers;
- evidence threshold;
- retry/backoff budget;
- deadline/expiry;
- terminal unresolved policy;
- whether user action is required.

Reconciliation should be cheap and selective. Do not poll forever.

## 2.11 Compensation is a new effect

A rollback/undo request is itself a real-world action and must be tracked as its own linked effect.

`CompensationLink` binds:
- original EffectKey;
- compensation EffectKey;
- strategy/version;
- expected restoration condition.

`COMPENSATION_VERIFIED` means the compensating operation was verified. It does **not** claim that every consequence of the original action disappeared unless that restoration condition is actually proven.

## 2.12 Partial effects

Many real actions can partially succeed.

`PARTIAL_VERIFIED` includes:
- verified changed components;
- verified unchanged/failed components;
- unknown components;
- next reconciliation/repair action.

Partial is never coerced into generic success or failure.

## 2.13 Cancellation

Cancellation affects future execution, not history.

After cancellation:
- if dispatch definitely never occurred -> effect may resolve `ABSENT_VERIFIED` or remain not applicable;
- if dispatch occurred or may have occurred -> reconcile according to risk/policy;
- cancellation acknowledgement alone does not prove the external effect is absent.

This aligns #09 with Cognitive Runtime's `CANCELLING` / reconciliation model and Tool Fabric's `CANCELLED_UNCERTAIN` boundary.

## 2.14 Persistence and crash recovery

The canonical journal must survive reload/crash for effectful work.

Minimum durability rule:
- `EffectPlan` durable before dispatch for meaningful external writes/actions;
- attempt dispatch transition recorded as close to the boundary as platform permits;
- recovery scans unresolved EffectRecords;
- uncertain records are reconciled, not silently retried;
- journal corruption fails closed and does not invent clean state.

Browser prototype storage may differ from final Android storage, but semantics remain identical.

## 2.15 Transactional outbox for internal boundaries

Where Seven owns both the authoritative state transition and outbound work queue, use a transactional outbox/inbox style pattern to narrow crash windows.

This is an optimization for owned boundaries, not a global requirement for every external tool.

## 2.16 Read-only/observational calls

Observational tools normally do not need durable EffectRecords unless:
- the read itself has external visibility/accounting consequence;
- audit policy requires it;
- the provider has unusual effect semantics;
- the result participates in a sensitive verification trail.

Do not turn every harmless read into ledger bloat.

## 2.17 Derived user status

UI may derive concise states such as:
- Preparing
- Sent
- Verifying
- Confirmed
- Partially confirmed
- Uncertain
- Reconciling
- Reverted/compensated
- Needs attention

These are projections, not canonical truth.

## 2.18 Audit privacy

Store enough to reconstruct what happened without persisting secrets or unnecessary payload bodies.

Prefer hashes, stable refs, typed summaries and artifact references over duplicating sensitive content into the ledger.

---

# 3. Velocity assault

The ledger must not become a write-amplification engine.

Rules:
- create durable EffectRecords only for actions that need effect semantics;
- append compact events;
- maintain small current-state indexes/views;
- artifactize large evidence;
- batch safe local journal flushes where durability policy allows;
- no continuous background reconciliation;
- use event-driven or bounded scheduled reconciliation;
- lazy-load full history only for diagnostics/recovery;
- keep hot unresolved index small.

Lite tier preserves correctness and uncertainty semantics; it may reduce optional diagnostics, never effect safety.

---

# 4. Pass B — DESTROY THE WINNER

Rejected alternatives:

## One linear state machine
Rejected because transport, effect and compensation are separate truths.

## Provider response = effect truth
Rejected. Response is evidence, sometimes strong, but not universally sufficient.

## Timeout = failure
Rejected. Timeout after possible dispatch creates uncertainty.

## Retry everything with the same local key
Rejected. Local dedupe cannot guarantee remote idempotency.

## Generic exactly-once guarantee
Rejected across boundaries Seven does not control.

## Rollback flag on original record
Rejected. Compensation is a separate effect with its own uncertainty and verification.

## Infinite reconciliation polling
Rejected for battery/network/reliability reasons.

## Ledger every read
Rejected as needless mobile/storage overhead.

## Store complete raw payloads for audit
Rejected. Use minimal structured lineage plus artifact refs under privacy policy.

---

# 5. Reconciliation result

Final design uses:
- logical EffectRecord + append-only EffectAttempt events;
- orthogonal lifecycle/dispatch/effect/compensation dimensions;
- evidence-bound verification;
- typed bounded reconciliation;
- compensation as a linked effect;
- explicit partial state;
- no generic exactly-once promise;
- persistent unresolved index for crash recovery;
- low-overhead selective logging.

---

# 6. Canonical objects

- `EffectKey`
- `EffectRecord`
- `EffectPlan`
- `EffectAttempt`
- `EffectEvidence`
- `VerificationRecipe`
- `ReconciliationRecipe`
- `CompensationLink`
- `EffectSnapshot`
- `EffectArtifactRef`

---

# 7. Frozen invariants

1. Transport success is not effect truth.
2. Transport failure is not proof the effect is absent.
3. Dispatch certainty is tracked separately from effect certainty.
4. Verification requires evidence.
5. Uncertain post-dispatch actions are not blindly retried.
6. Idempotency class is explicit and binding-specific.
7. Local dedupe does not imply remote exactly-once.
8. Compensation is tracked as a separate linked effect.
9. Partial effects remain partial.
10. Cancellation never rewrites an already-dispatched history.
11. Effectful work has recoverable durable journal semantics.
12. Large evidence lives in artifacts, not duplicated ledger rows.
13. Read-only calls do not create ledger bloat by default.
14. Corruption fails closed.
15. SideEffectLedger does not grant permission; #08 does.
16. SideEffectLedger does not decide factual truth beyond effect evidence; verification/epistemic layers consume it.

---

# 8. Evaluation contract

Core:
- planned effect then clean verified completion;
- failure before dispatch;
- uncertain dispatch;
- verified absence after reconciliation;
- verified presence after lost response;
- partial effect;
- repeated attempt under each idempotency class;
- duplicate EffectKey after reload;
- compensation success/failure/uncertainty;
- cancellation before and after possible dispatch.

Durability:
- crash before dispatch;
- crash immediately after dispatch boundary;
- crash during verification;
- reload unresolved scan;
- journal corruption;
- migration/version change.

Performance:
- 10 / 1,000 / 100,000 historical effects with small unresolved set;
- startup cost with no unresolved effects;
- reconciliation network/battery budget;
- Lite-tier storage and RAM;
- artifact-backed evidence loading.

---

# 9. Implementation stages

- **SEL-P0** canonical schemas and orthogonal states.
- **SEL-P1** append-only EffectAttempt journal + current views.
- **SEL-P2** EffectKey/idempotency namespace binding.
- **SEL-P3** verification and evidence recipes.
- **SEL-P4** reconciliation engine and unresolved index.
- **SEL-P5** compensation-as-effect model.
- **SEL-P6** crash recovery/durable storage integration.
- **SEL-P7** Tool/Cognitive/Security integration.
- **SEL-P8** UI/observability projections.
- **SEL-P9** failure-injection, long-run and Android/mobile gates.

---

# 10. Proof of improvement

Compared with the current ledger, Effect Ledger 3.0:
- removes ambiguity caused by one linear state;
- makes dispatch uncertainty explicit;
- distinguishes transport result from real-world state;
- makes retries evidence- and idempotency-aware;
- represents partial outcomes;
- treats undo as a separately verifiable action;
- recovers unresolved effects after crash/reload;
- avoids claiming impossible generic exactly-once semantics;
- remains lightweight by journaling only meaningful effects and artifactizing large evidence.

---

# 11. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Effect Ledger 3.0 — Evidence-Bound Real-World Change Journal**.

Implementation remains deferred. No protected product source is modified by this architecture document.
