# Seven Polishing V5.21 — Evidence Resolution Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.20 Exogenous Event Integrity

V5.21 separates four claims that were previously too easy to conflate: detecting that a run is wrong, localizing where the issue began, attributing why it began, and reproducing it reliably.

## Prime law
Evidence sufficient to detect failure is not automatically sufficient to localize, attribute, or reproduce it.

## Requirements
1. Resolution Ladder: DETECTED → LOCALIZED → ATTRIBUTED → REPRODUCED, with each level requiring stronger evidence.
2. Telemetry Sufficiency Check: every promotion-critical diagnosis states which resolution level the available traces can actually support.
3. Localization Abstention: when multiple origins remain observationally equivalent, the evaluator must abstain instead of inventing a root cause.
4. Evidence-View Comparison: compare coarse traces, enriched traces, state snapshots, decision records, and provenance links when practical.
5. Decision Provenance: material routing, recovery, tool, memory, context, permission, and promotion decisions retain enough lineage to explain why the branch was taken.
6. State-Transition Links: important state changes bind to the event or decision that produced them.
7. Ambiguity Class: unresolved origin ambiguity is recorded as a first-class result.
8. Reproduction Strength: a reproduced failure records subject, environment, state preconditions, event sequence, and expected/observed result.
9. Diagnosis Claim Ceiling: no repair or architectural conclusion may claim a more specific cause than the supporting evidence resolution permits.
10. Repair Validation Split: a repair may restore behavior without proving the original cause; verdicts keep these claims separate.
11. Cross-Observer Agreement: when multiple telemetry views disagree materially, the disagreement is preserved rather than merged into a false single narrative.
12. Observability Cost: richer telemetry pays explicit RAM, storage, latency, privacy, and battery costs on mobile.
13. Selective Detail: high-resolution traces are enabled by risk or active diagnosis rather than always-on maximum logging.
14. Missing-Telemetry Semantics: absent evidence lowers the supported claim level; it never silently counts as normal behavior.
15. Regression Preservation: defects found only with higher-resolution evidence become regression cases for future observability changes.

## Saturation
V5.20 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No production telemetry collector, diagnosis engine, or reproduction runtime is claimed implemented.