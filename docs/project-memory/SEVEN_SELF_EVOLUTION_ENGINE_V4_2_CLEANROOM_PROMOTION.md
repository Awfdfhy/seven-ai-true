# Seven Self-Evolution Engine 4.2 — Clean-Room Evaluation & Staged Promotion

Status: ARCHITECTURE_CANDIDATE
Parent: Self-Evolution Engine 4.1
Governance: V5.40 Meta-Assurance Closure

V4.2 closes material evidence-isolation and evaluation-fairness gaps found in the V4.1 challenge.

## 1. Clean-Room Plane Isolation
Builder, Judge, and Promotion planes use separate authoritative workspaces for promotion-critical evaluation.

The Judge workspace must not inherit Builder mutable memory, scratch context, candidate-local caches, unreleased experience summaries, or candidate-controlled interpretations unless explicitly supplied as versioned evidence inputs.

Shared foundation models/providers may still create correlated error risk; such correlation is recorded and cannot be counted as full independence.

## 2. Test-Authoring Firewall
Builder-generated tests are useful discovery evidence but are not automatically promotion authority.

A promotion-critical test authored or materially shaped by Builder must be independently ratified, transformed into an accepted oracle, or supplemented by independent/fresh evidence before it can support promotion.

Future hidden tests remain unavailable to Builder.

## 3. Hidden-Evidence Learning Firewall
Hidden evaluation results are partitioned into:
- verdict-only feedback;
- approved failure-class summaries;
- retired/released case evidence;
- permanently sealed evidence.

Builder receives only the minimum feedback class authorized for legitimate learning. A hidden case does not enter reusable Experience Compiler memory merely because it detected a defect.

## 4. Matched Evaluation Budgets
Incumbent and candidate comparisons bind relevant budgets: model/provider class, tool access, retry policy, wall-clock allowance, context allowance, external-data access, cache state, and device/environment where material.

If a candidate requires a larger budget, that resource delta becomes part of the result rather than disappearing inside the score.

## 5. Mechanism Attribution Control
When provider/model/tool upgrades occur near an engine change, evaluation uses matched or ablated comparisons where practical:
- old engine + old dependency;
- new engine + old dependency;
- old engine + new dependency;
- new engine + new dependency.

Claims are narrowed when the contribution cannot be separated.

## 6. Raw Evidence Boundary
Candidate-controlled telemetry, summaries, scores, or transformed traces cannot replace raw/source evidence for promotion-critical claims. Transformations retain lineage and may be independently reconstructed or cross-checked when material.

## 7. Generation Work Budget
The ten promoted-generation ceiling is paired with a bounded per-generation work budget. Ordinary polish may accumulate inside a generation, but research/candidate/repair loops cannot continue without bound merely because no recursive slot has yet been consumed.

Budget exhaustion yields HOLD/STOP rather than fabricated progress.

## 8. Staged Promotion States
Where artifact type permits safe staging, promotion proceeds through explicit states:
- LAB_CANDIDATE;
- VERIFIED_CANDIDATE;
- SHADOW_OR_NONAUTHORITATIVE;
- EXPERIMENTAL;
- CANONICAL.

Not every artifact needs every stage, but skipping a stage must be justified by artifact semantics and risk. Evidence from one stage does not automatically prove later-stage behavior.

## 9. Observation Window
Staged promotions define a precommitted observation window or evidence condition for latent failures: long-session degradation, recovery/migration issues, resource drift, recurrence of known failures, and environment-specific regressions where relevant.

## 10. Campaign Workspace Lifecycle
Each campaign has a versioned workspace manifest. Candidate scratch state, caches, generated tools, temporary benchmarks, and rejected artifacts are either promoted with explicit lineage, archived as non-authoritative evidence, or destroyed/retired according to policy. Residual workspace state cannot silently influence a later campaign.

## 11. Metric Non-Authority
Self-Evolution health metrics are observability signals. Promotion yield, speed, number of candidates, benchmark score, or research volume cannot directly become the objective that overrides Goal Receipt, critical invariants, or evidence validity.

## 12. Cross-Plane Artifact Contract
Every artifact crossing Builder → Judge or Judge → Promotion carries:
- identity/hash;
- producer plane;
- evidence state;
- scope;
- transformation lineage;
- environment/epoch identity;
- permitted uses;
- freshness/expiry if applicable.

## 13. Release and Device Boundary
Canonical engineering promotion still does not imply Android release. Release validation, representative-device evidence, signing/distribution, migration and rollback remain downstream gates.

## Truth boundary
Architecture only. V4.2 does not claim clean-room evaluation infrastructure, staged rollout runtime, isolated workspaces, or automatic campaign lifecycle management is implemented.