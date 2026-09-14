# Seven Polishing V5.7 — Epistemic Stress

Status: ARCHITECTURE_CANDIDATE
Parent: V5.6 Proof of Improvement

V5.7 attacks the possibility that the entire improvement campaign is confidently optimizing the wrong thing.

## Core rule
Before promotion, Seven must challenge not only candidate quality but also the target definition, measurement model, causal story and completeness of the search surface, without allowing the candidate to rewrite authoritative requirements.

## Gates
1. Requirement challenge: distinguish authoritative requirement defects from candidate defects; proposed requirement changes require separate governance and a new comparison epoch.
2. Metric validity: every important metric states what construct it represents and known ways it can diverge from user/system value.
3. Proxy divergence tests: seek cases where the metric improves while the intended property worsens.
4. Construct triangulation: important non-directly-observable properties require evidence from different measurement mechanisms.
5. Scope falsification: actively search for the smallest context in which the improvement claim stops being true.
6. Causal graph challenge: attack omitted confounders and alternative causal paths.
7. Search-space diversity: candidate families must include replacement, simplification, decomposition and no-change baselines, not only incremental additions.
8. Novelty tax: architectural novelty receives no credit by itself; unfamiliar complexity must earn evidence.
9. Historical replay: where records exist, ask whether the new governance would have caught previously discovered failures before they escaped.
10. Future-change simulation: reason through provider replacement, schema migration, model downgrade, offline operation and device constraints to expose brittle assumptions.
11. Observer effect ledger: record when instrumentation, repeated evaluation or special test setup can materially change behavior.
12. Measurement uncertainty: report resolution limits, noise and unavailable evidence rather than turning them into confidence.
13. Contradiction register: unresolved high-criticality evidence conflicts block broad promotion.
14. Epistemic downgrade: later evidence may reduce an earlier verdict without rewriting the original historical record.
15. Stop-rule challenge: before declaring saturation, a challenger tries to show that stopping is caused by evaluator blindness, exhausted search diversity or excessive materiality thresholds rather than true local saturation.
16. Materiality calibration: the 200% step-change gate cannot discard smaller changes that collectively remove a C0/C1 defect; such safety/correctness fixes are handled by criticality, not product-gain theater.
17. Improvement portfolio: distinguish mandatory defect correction, ordinary valuable polish and recursive-generation step changes. Only the last consumes a recursive promotion slot.
18. Meta-overhead ceiling: the improvement process itself must not grow without bound. Added governance must demonstrate reduced risk or increased detection power sufficient to justify its cost.

## Result semantics
A candidate can be BETTER_IN_SCOPE without being globally better. Promotion records exact scope, assumptions, evidence frontier and unresolved contradictions.

## Truth boundary
Architecture only. V5.7 does not claim empirical validation or saturation.