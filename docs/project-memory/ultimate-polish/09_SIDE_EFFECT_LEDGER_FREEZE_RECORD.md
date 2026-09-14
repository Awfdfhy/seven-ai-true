# Seven AI — Capability 09 Side-Effect Ledger Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / current foundation remains**

## Frozen target

**Seven Effect Ledger 3.0 — Evidence-Bound Real-World Change Journal**

## Prime law

> Transport outcome is not effect truth. Seven records dispatch certainty, effect certainty, verification evidence and compensation state separately, and never invents exactly-once semantics across boundaries it does not control.

## Scope of this freeze

This freezes the real-world side-effect tracking architecture.

It does not mean:
- every tool adapter is implemented;
- persistent Android storage is finished;
- every external service has a reconciliation adapter;
- every rollback path exists;
- every UI surface is finished.

## Final reconciled decisions

1. Logical effect identity is separate from execution attempts.
2. `EffectRecord` represents the intended change; `EffectAttempt` represents each execution try.
3. Effect identity binds principal, task/run, action, target, normalized payload fingerprint, binding/schema revision and idempotency namespace.
4. Lifecycle, dispatch certainty, effect certainty and compensation are orthogonal dimensions.
5. Canonical effect classes remain `NONE`, `OBSERVATIONAL`, `REVERSIBLE_WRITE`, `IRREVERSIBLE_WRITE`, `EXTERNAL_COMMUNICATION`, `UNKNOWN_EFFECT`.
6. Side-effecting dispatch starts from a typed `EffectPlan`.
7. EffectPlan binds AuthorizationReceipt, ToolCallContract lineage, verification recipe, reconciliation recipe and compensation recipe when available.
8. Attempts are append-only journal events.
9. Provider response is evidence, not universal proof of effect truth.
10. Verification requires source-bound evidence.
11. Timeout/failure after possible dispatch preserves uncertainty.
12. Uncertain post-dispatch actions are never blindly retried.
13. Idempotency classes remain `SAFE_REPEAT`, `KEYED_REPEAT`, `DO_NOT_REPEAT`, `UNKNOWN`.
14. Local duplicate suppression never becomes a generic remote exactly-once claim.
15. Provider-specific stronger guarantees remain provider/evidence-bound.
16. Reconciliation uses bounded typed observation recipes rather than indefinite polling.
17. Compensation/undo is a separate linked effect with its own verification and uncertainty.
18. A verified compensation does not automatically prove every consequence of the original action disappeared.
19. Partial real-world outcomes remain `PARTIAL_VERIFIED` rather than generic success/failure.
20. Cancellation changes future execution, not history.
21. Meaningful effect plans are durable before dispatch to the extent supported by the platform tier.
22. Recovery scans unresolved effects and reconciles rather than silently retrying.
23. Journal corruption fails closed.
24. Transactional outbox/inbox patterns may strengthen boundaries Seven owns, but are not a universal external exactly-once solution.
25. Ordinary observational reads do not create durable effect records unless policy/audit semantics require them.
26. Large evidence is artifactized rather than duplicated into the ledger.
27. User-visible statuses are derived projections, not canonical truth.
28. Lite tier may reduce diagnostics but never erase uncertainty semantics.

## Canonical state dimensions

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

### Compensation
- `NONE`
- `AVAILABLE`
- `PLANNED`
- `ATTEMPTED`
- `VERIFIED`
- `FAILED`
- `UNCERTAIN`

## Canonical objects

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

## Frozen invariants

1. Transport success is not effect truth.
2. Transport failure is not proof the effect is absent.
3. Dispatch and effect certainty are separate.
4. Verification requires evidence.
5. Post-dispatch uncertainty does not receive blind retry.
6. Idempotency is explicit and binding-specific.
7. No generic exactly-once promise across uncontrolled external boundaries.
8. Compensation is a separately tracked effect.
9. Partial outcomes remain partial.
10. Cancellation does not rewrite dispatch history.
11. Effectful work is recoverable after crash/reload.
12. Corruption fails closed.
13. SideEffectLedger does not grant authority; Capability 08 does.
14. SideEffectLedger does not replace Epistemic/Verification verdicts.

## Mandatory eval families

- clean verified completion;
- failure before dispatch;
- possible dispatch with lost confirmation;
- reconciliation proves absence;
- reconciliation proves presence;
- partial outcome;
- each idempotency class;
- duplicate logical effect after reload;
- compensation verified/failed/uncertain;
- cancellation before and after possible dispatch;
- crash before/during/after dispatch;
- unresolved recovery scan;
- journal corruption;
- long-run history with small unresolved working set;
- Lite-tier startup/RAM/storage/network cost.

## Implementation stages

- SEL-P0 schemas/state dimensions
- SEL-P1 append-only attempt journal/current views
- SEL-P2 EffectKey/idempotency binding
- SEL-P3 verification/evidence recipes
- SEL-P4 reconciliation engine/unresolved index
- SEL-P5 compensation-as-effect
- SEL-P6 durable crash recovery
- SEL-P7 Tool/Cognitive/Security integration
- SEL-P8 UI/observability projections
- SEL-P9 failure-injection/mobile/long-run gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.
