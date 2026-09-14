# Seven Polishing V5.34 — Executable Invariant Proof

Status: ARCHITECTURE_CANDIDATE
Parent: V5.33 Oversight Review

V5.34 raises selected correctness claims from heuristic judgment to executable or formally checkable invariants where the state space and specification permit it.

## Prime law
When a critical property can be checked deterministically, heuristic approval is weaker evidence and should not be the primary gate.

## Requirements
1. Invariant Registry: C0/C1 properties identify whether they are testable, property-checkable, state-machine-checkable, or formally specified.
2. Authority Invariants: authority cannot increase through summarization, caching, delegation, retrieval, or derived state.
3. State-Transition Invariants: invalid state-machine transitions are rejected independently of model confidence.
4. Effect Invariants: idempotency keys, uncertain-effect state, and duplicate-effect prevention use executable checks where possible.
5. Permission Invariants: action-sensitive permissions bind to authoritative source state and expiry/revocation rules.
6. Persistence Invariants: migration/recovery checks verify required canonical data and lineage relationships.
7. Pre/Post Conditions: critical tools and workflows define deterministic preconditions/postconditions where practical.
8. Bounded Model Checking: finite state or bounded workflow regions may receive exhaustive transition exploration when feasible.
9. Property-Based Testing: parameterized invariants receive generated cases beyond hand-authored examples.
10. Counterexample Preservation: failing traces produced by invariant checks become regression artifacts.
11. Proof Assumption Ledger: formal or executable proofs state scope, environmental assumptions, finite-domain restrictions, and excluded behaviors.
12. Proof Claim Ceiling: a bounded proof cannot be described as an unbounded guarantee.
13. Specification Review: proving the wrong specification is not success; specification validity remains independently challenged.
14. Proof Freshness: code, schema, tool, permission, or state-model changes invalidate affected proofs.
15. Judge Separation: semantic judges evaluate properties not covered by executable invariants rather than re-deciding machine-checkable facts.
16. Cost-Aware Use: expensive formal methods are reserved for critical/high-value regions where they materially increase assurance.

## Saturation
V5.33 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No formal verifier, model checker, theorem-proving pipeline, or invariant runtime is claimed implemented.