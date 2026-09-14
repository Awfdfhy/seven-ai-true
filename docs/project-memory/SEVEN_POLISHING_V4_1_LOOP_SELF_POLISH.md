# Seven Polishing V4.1 — The Loop — Self-Polish Campaign

Status: COMPLETED ARCHITECTURE SELF-POLISH
Parent baseline: Seven Polishing Protocol V4 (`ba464dc842f12e5cd92d48f3501fdf5cd6508278`)
Candidate: Seven Polishing Protocol V4.1 — The Loop
Companion: Seven Benchmark + Visual Evidence Fabric 1.0

## Ground truth
V4 already had strong evidence discipline, precommit evals, holdouts, regression cemetery, Pareto analysis, mobile gates, visual/UX coverage, independent reviews and bounded 2/2 saturation. Its material gap was that measurable improvement evidence was described procedurally but not promoted into a reusable first-class Benchmark Fabric, and image/screenshot evidence was not modeled deeply enough for future UI/UX/Brand/Motion polish.

## Search surface
- benchmark validity and reproducibility
- baseline locking
- benchmark gaming / Goodhart risk
- holdout/shadow/release partitions
- variance/environment identity
- visual regression
- semantic visual understanding
- structural-vs-pixel evidence
- accessibility
- Arabic/RTL/font scaling
- motion evidence
- privacy of screenshots
- mobile/device evidence tiers
- benchmark cost and startup/runtime isolation
- evaluator drift
- stale goldens
- regression promotion

## Research evidence used
Current Android documentation supports screenshot testing as a high-value way to verify rendered UI against approved references and produce visual diffs; Compose screenshot testing supports preview variants such as theme and font scale. Android accessibility guidance recommends combining manual testing, analysis tools and automated tests rather than relying on a single evidence channel. Android also treats touch-target and contrast failures as concrete accessibility concerns. These sources support a dual visual + structural strategy rather than a vision-only judge.

## Round 01 — Measurement truth
Result: `MATERIAL_IMPROVEMENT_FOUND`

Added first-class BenchmarkContract, exact baseline/candidate/environment binding, typed observations/verdicts and explicit evidence tiers. Prevented prose claims such as 'faster' or 'lighter' from becoming accepted without comparable evidence when measurement is feasible.

## Round 02 — Anti-overfitting / Goodhart
Result: `MATERIAL_IMPROVEMENT_FOUND`

Added visible development suites, shadow suites, holdouts and release suites; fixed acceptance rules before comparison; added Goodhart defense and prohibition on silently weakening C0/C1 gates after results are known.

## Round 03 — Visual understanding
Result: `MATERIAL_IMPROVEMENT_FOUND`

Added VisualEvidenceArtifact, VisualObservation and multimodal inspection for clipping, overlap, hierarchy, RTL, bidi, theme consistency, responsive layout and visual regressions.

Crucial boundary: model visual judgment remains derived evidence, not pixel-to-truth magic.

## Round 04 — Dual-channel UI truth
Result: `MATERIAL_IMPROVEMENT_FOUND`

Separated:
1. STRUCTURAL evidence — semantics tree, layout bounds, accessibility metadata, design tokens and test APIs.
2. VISUAL evidence — screenshots, frame sequences, diffs and multimodal inspection.

Disagreement becomes `UI_EVIDENCE_CONFLICT`, not silent winner selection. Exact contrast, touch-target dimensions, focus order, semantics and runtime smoothness cannot be inferred from screenshots alone when stronger evidence exists.

## Round 05 — Benchmark health
Result: `MATERIAL_IMPROVEMENT_FOUND`

A benchmark can itself be bad. Added campaign requirements to inspect:
- repeatability / flakiness
- sensitivity to material changes
- environment dependence
- variance
- discriminatory power
- stale or overfit cases
- evaluator drift
- invalidation triggers

A benchmark that cannot reliably distinguish known-better/known-worse cases is `MEASUREMENT_INVALID` or `INCONCLUSIVE`, not an authority source.

## Round 06 — Visual reference truth
Result: `MATERIAL_IMPROVEMENT_FOUND`

Golden screenshots are now regression anchors, not canonical truth. A diff can mean regression, intended improvement, stale golden or rendering variance. Golden replacement requires explicit approval tied to the change and cannot be used merely to turn red into green.

## Round 07 — Mobile/resource/privacy attack
Result: `MATERIAL_IMPROVEMENT_FOUND`

Added staged benchmark escalation and near-zero ordinary-path cost for unused visual/benchmark machinery. Vision models and screenshot corpora must not load on startup. Screenshot evidence is permission/privacy scoped; remote vision upload cannot occur silently.

## Round 08 — Motion and runtime truth
Result: `MATERIAL_IMPROVEMENT_FOUND`

Added frame-sequence/video evidence for continuity and reduced-motion behavior, while explicitly requiring runtime frame/performance evidence for smoothness/jank claims. Still images cannot prove animation performance.

## Round 09 — Simplifier
Result: `NO_MATERIAL_IMPROVEMENT`

Attempted to merge Benchmark Fabric into Seven Evals only. Rejected: Seven Evals measures the product, while Benchmark Fabric is reusable evidence infrastructure inside polishing campaigns, including architecture alternatives and visual candidates before product implementation. Kept shared concepts aligned to avoid duplicate authority.

Attempted a single universal quality score. Rejected because it would allow C0/C1 regressions to hide behind unrelated gains.

## Challenge Review A — Metrology / architecture lens
Examined:
- circular self-approval
- movable goals
- benchmark gaming
- benchmark invalidation
- metric aggregation
- reproducibility
- simplification
- evidence lineage

No material architectural improvement remained after the benchmark-health, Goodhart and baseline-lock additions.

Verdict: `NO_MATERIAL_IMPROVEMENT` → 1/2

## Challenge Review B — UI/mobile/accessibility/privacy lens
Different surface:
- screenshots vs semantics
- RTL/mixed bidi
- font scaling
- Day/Night
- reduced motion
- touch target/contrast evidence
- stale goldens
- screenshot privacy
- device evidence tiers
- startup/RAM cost

No material architectural improvement remained within this documented surface. The dual-channel visual model plus staged evidence escalation covered the material gaps discovered.

Verdict: `NO_MATERIAL_IMPROVEMENT` → 2/2

## Saturation interpretation
This is an ARCHITECTURE saturation for the protocol extension, not proof that benchmark runners, screenshot capture, multimodal evaluator, Android instrumented tests or real-device pipelines are implemented.

Evidence ladder remains:
`ARCHITECTURE_ACCEPTED != IMPLEMENTED != TESTED != DEVICE_VERIFIED != RELEASE_PROVEN`.

## Reopen triggers
- benchmark implementation exposes a measurement flaw
- visual evaluator shows systematic bias/drift
- UI comparison fails on new screen classes or Android rendering changes
- benchmark cost materially harms mobile resource budgets
- benchmark gaming/Goodhart counterexample
- stronger visual/semantic testing technique becomes practically available
- implementation evidence contradicts architecture assumptions
