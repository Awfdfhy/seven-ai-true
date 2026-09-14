# Seven Polishing V5.20 — Exogenous Event Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.19 Horizon Coverage

V5.20 handles long-running workflows where meaningful state changes occur independently of Seven's own actions.

## Prime law
A system that acts correctly only when it controls the timing of state changes is not proven for asynchronous deployment.

## Requirements
1. External-Event Model: represent events that occur without agent action, including arrival, update, removal and expiration where relevant.
2. Wait-vs-Act Evaluation: verify that Seven can choose to wait when continued action adds no value.
3. Reaction-Time Evidence: when timing matters, measure delay from relevant external event to valid response.
4. Polling Cost: repeated checks consume explicit compute/network/context budgets and cannot be treated as free reliability.
5. Missed-Event Cases: evaluate events that appear briefly or become obsolete before the next observation.
6. Duplicate-Event Cases: repeated notifications must not cause duplicated state transitions or repeated side effects.
7. Out-of-Order Cases: event ordering assumptions are challenged where the environment permits reordering.
8. Stale-Event Guard: late observations do not authorize actions that are no longer valid.
9. Race Semantics: define behavior when local action and external state change overlap.
10. Clock/Time Boundary Review: time-dependent claims bind to explicit clocks/timezones/deadlines when material.
11. Quiet-Period Efficiency: long periods with no useful event should not force wasteful continuous reasoning.
12. Wake Condition Contract: waiting ends only for defined conditions, timeout, cancellation or authority-changing events.
13. Event Freshness: observed external state carries freshness/provenance sufficient for the claim being made.
14. Environment-Change Recovery: unexpected page/API/provider changes during a waiting workflow trigger revalidation rather than silent continuation.
15. Attention Budget: monitoring work has bounded resource cost distinct from active task execution.
16. False-Wake / Missed-Wake Review: evaluate both unnecessary wakeups and failure to resume on a relevant event.
17. Multi-Source Event Reconciliation: conflicting events from different sources retain provenance and do not collapse into fake certainty.
18. Asynchronous Regression Memory: failures caused by timing/order remain in the regression corpus even if synchronous tests pass.

## Saturation
V5.19 is NOT saturated. This material expansion resets saturation to 0/2.

## Truth boundary
Architecture only. No asynchronous event harness, wake-condition runtime or monitoring benchmark runner is claimed implemented.