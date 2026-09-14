# Seven Polishing V5.10 — Audit Reproducibility

Status: ARCHITECTURE_CANDIDATE
Parent: V5.9 Proof Selector Adversarialization

V5.10 attacks benchmark and audit construction itself. A strong evaluator can still create false confidence if tasks are invalid, reference solutions are weak, framing leaks effort cues, run records cannot be regenerated, or disagreement is flattened.

## Prime law
Promotion evidence is only as strong as the construction, acceptance, reproducibility, and adjudication quality of the evaluations that produced it.

## Gates
1. Task acceptance: every promotion-critical task records why it is valid and what would cause rejection.
2. Reference sufficiency: use a known-valid route or deterministic oracle where the task permits it; otherwise oracle weakness is explicit.
3. No-op control: tasks meant to detect meaningful behavior must reject irrelevant/no-change behavior when applicable.
4. Broken-task quarantine: ambiguous, unstable, underspecified, impossible, or environment-corrupted cases are separated from valid scoring.
5. Prompt and framing provenance: wording, system instructions, examples, roles, and hidden scaffolding are version-bound evaluation inputs.
6. Framing sensitivity: selected critical tasks are rerun under semantically equivalent framing changes to expose brittle elicitation.
7. Benchmark lineage: source, transformations, authoring process, acceptance checks, contamination risk, and revisions are recorded.
8. Run regeneration: promotion-critical aggregates must be reproducible from raw/committed run records and a versioned audit procedure when practical.
9. Disagreement preservation: evaluator conflicts remain visible until adjudicated; averaging cannot erase critical contradiction.
10. Independent adjudication: material conflicts use a predeclared tie-break or escalation path independent from the Builder.
11. Evaluator identity lock: model, prompt, tool, version, or rubric changes create a new evaluator identity and trigger compatibility review.
12. Family calibration: task acceptance and evaluator reliability are tracked per scenario/failure family when sufficient evidence exists.
13. Benchmark aging: stale tasks remain historical evidence but cannot silently count as fresh release proof after material environment drift.
14. Duplicate discounting: breadth is reduced for cases sharing essentially the same causal structure or source lineage.
15. Difficulty-strata audit: aggregate gains cannot hide regression in critical/hard strata.
16. Missingness transparency: skipped, unavailable, flaky, quarantined, and invalid runs are reported separately from success/failure.
17. Retry semantics: evaluator/environment retries are distinguished from candidate retries consuming task budget.
18. Human semantic sampling: when claims depend heavily on automated grading, a risk-weighted sample receives independent semantic review where practical.
19. Append-only audit chain: post-result corrections preserve history and rationale rather than silently rewriting runs.
20. Reproduction failure: if a material claim cannot be regenerated within declared tolerance, its verdict strength is downgraded pending resolution.

## Saturation
V5.10 starts at 0/2. A saturation attempt only counts if task acceptance, evaluator identity, run-regeneration procedure, selector red team, and benchmark-aging rules are frozen before results are observed.

## Truth boundary
Architecture only. No benchmark-authoring runtime, run-regeneration system, human-review workflow, or evaluator-drift automation is claimed implemented.