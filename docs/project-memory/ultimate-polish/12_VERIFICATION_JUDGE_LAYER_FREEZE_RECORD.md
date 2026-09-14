# Seven AI — Capability 12 Verification / Judge Layer Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / distributed verification foundations remain**

## Frozen target

**Seven Verification Fabric 3.0 — Evidence-Calibrated Independent Decision Kernel**

## Prime law

> Verification is an independent evidence-to-verdict process. Deterministic and authoritative checks dominate when available; model judges are fallible derived evaluators; missing or conflicting evidence produces `INCONCLUSIVE`, never manufactured PASS.

## Scope of this freeze

This freezes the cross-system verification architecture. It does not claim that all domain verifiers, judge calibration corpora, device measurements or Capability 13 release-evaluation governance are already implemented.

## Final reconciled decisions

1. Every meaningful verification run binds to a versioned `VerificationContract`.
2. The subject is identified by stable id/version/hash rather than presentation text alone.
3. Requirements/claims map to checks, evidence and residual uncertainty through a `VerificationMatrix`.
4. Evidence is property-specific and source-bound.
5. Canonical evidence classes include authoritative state, deterministic execution, formal proof, independent observation, source evidence, device measurement, model judgment and human acceptance.
6. No evidence class has one universal authority score for every property.
7. `EvidenceRef` records verifier/source identity, time, subject, covered property, artifact/hash, environment and lineage.
8. Deterministic or authoritative checks are preferred when they directly answer the property.
9. Model judges supplement semantic/qualitative gaps and cannot override a deterministic contradiction to the same exact property.
10. Producer self-report is not independent verification.
11. High-impact contracts may require stronger independence such as fresh context, separate verifier, read-back observation or human acceptance.
12. `JudgeProfile` and calibration evidence are domain/check-specific.
13. Newly available judges are not automatically trusted for promotion-critical decisions.
14. Judge calibration tracks false-pass/fail, abstention, stability, locale and revision drift where measurable.
15. Comparative judging may hide irrelevant producer/order metadata when useful without hiding required provenance/safety facts.
16. Model/rubric judges return structured criterion outcomes and evidence refs rather than a single prose score.
17. Seven does not use one canonical 0–100 confidence number as verification truth.
18. Canonical verdicts are `PASS`, `FAIL`, `INCONCLUSIVE`, `REPAIR_REQUIRED`, `BLOCKED`; `PASS_WITH_WARNINGS` may exist only as a derived presentation state.
19. `PASS` requires sufficient valid evidence for every blocking criterion.
20. `FAIL` requires evidence of a blocking violation.
21. `INCONCLUSIVE` is a legitimate unresolved-verification state.
22. `BLOCKED` means required verification could not be run under current environment/capability/authority.
23. Final acceptance is computed by deterministic `VerdictPolicy`; model judges contribute evidence rather than owning policy.
24. Repair feedback identifies failed criteria/evidence and recheck scope without requiring private reasoning traces.
25. Inline verification probes may run at meaningful semantic boundaries; expensive verification stays selective.
26. Verification checks form a dependency-aware DAG rather than a mandatory full linear checklist.
27. Decisive failures can cancel irrelevant expensive checks.
28. Verification infrastructure is itself evaluated for false acceptance/rejection, stale evidence, dependence, target drift and measurement loopholes.
29. Structured trace review is used when outcome checks alone cannot validate required process constraints, but Seven generally grades outcomes/invariants rather than one brittle action sequence.
30. Verification manifests persist subject/contract hashes, check results, evidence refs, verifier revisions and verdicts; large evidence remains artifact-backed.
31. Verdicts are invalidated/rechecked when relevant subject, requirement, source freshness, environment or verifier dependencies change.
32. Human acceptance is a distinct evidence/authority event, not a universal correctness oracle.
33. Lite tier may reduce advisory/model checks but never changes mandatory verdict semantics.
34. No verifier/judge initialization burdens startup when unused.

## Canonical objects

- `VerificationSubject`
- `VerificationContract`
- `VerificationCriterion`
- `VerificationMatrix`
- `CheckPlan`
- `CheckResult`
- `EvidenceRef`
- `EvidenceDependencyCluster`
- `JudgeProfile`
- `JudgeCalibrationSnapshot`
- `RubricSpec`
- `VerdictPolicy`
- `VerdictRecord`
- `RepairDirective`
- `VerificationManifest`

## Canonical verdicts

- `PASS`
- `FAIL`
- `INCONCLUSIVE`
- `REPAIR_REQUIRED`
- `BLOCKED`

## Frozen invariants

1. Producers are not sole acceptance authority for their own outputs.
2. Verification targets/requirements are versioned and cannot drift silently.
3. Evidence is source-bound and property-specific.
4. Deterministic/authoritative contradictions dominate model opinion for the same property.
5. Correlated evidence does not gain authority merely by repetition.
6. Judges are calibrated, versioned and may abstain.
7. Missing evidence never becomes fake certainty.
8. Blocking criteria cannot be averaged away.
9. PASS requires all blocking conditions.
10. Verification does not grant permission.
11. Relevant dependency changes can invalidate prior verdicts.
12. Large evidence remains artifact-backed.
13. Repair feedback is criterion/evidence based.
14. Verification itself remains an evaluated subsystem.
15. Performance optimization cannot silently weaken mandatory verification.

## Mandatory eval families

- clear pass/fail/inconclusive/blocked/repair outcomes;
- stale/wrong-subject/dependent evidence;
- changed subject or verification contract;
- authoritative contradiction;
- judge false-pass/fail and abstention;
- Arabic/English judge consistency;
- Coding/Research/Tool/File/Memory/Canon/Release integrations;
- evidence reuse and invalidation;
- Lite-tier latency/RAM/battery;
- no active verification -> near-zero startup cost.

## Implementation stages

- VJ-P0 subject/contract/criterion schemas
- VJ-P1 EvidenceRef + matrix
- VJ-P2 deterministic check DAG/adapters
- VJ-P3 VerdictPolicy/verdict states
- VJ-P4 structured judge/rubric adapter
- VJ-P5 calibration/dependency tracking
- VJ-P6 repair/reverification invalidation
- VJ-P7 cross-system integrations
- VJ-P8 audit/UX/artifact experience
- VJ-P9 verifier-validity/multilingual/adversarial gates
- VJ-P10 mobile/velocity/resource gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.
