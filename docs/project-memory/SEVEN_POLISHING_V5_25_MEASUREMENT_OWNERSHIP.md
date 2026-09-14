# Seven Polishing V5.25 — Measurement Ownership Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.24 Benchmark Compression Integrity

V5.25 separates the capability of the evaluated system from capability supplied by the evaluation scaffold or scorer.

## Prime law
A benchmark result is interpretable only when execution ownership and scoring validity are explicit.

## Requirements
1. Decision Ownership Map: record which execution-critical decisions are made by Seven, the harness, fixed middleware, external services, or evaluator logic.
2. Scaffold Contribution: distinguish assistance supplied by wrappers, retries, memory managers, routers, parsers, planners, or tool adapters from the capability being claimed.
3. Minimal Scaffold Baseline: where practical, compare against a reduced scaffold to estimate how much performance depends on evaluation infrastructure.
4. Scorer Validity: verify that the scorer measures task correctness rather than formatting, proxy shape, or easily satisfied surface criteria.
5. Ground-Truth Preference: use deterministic or reconstructed ground truth where practical for claims that require objective correctness.
6. Scorer Disagreement: material disagreement between scorers is preserved and investigated rather than averaged into certainty.
7. Harness Version Binding: results bind to exact harness/scorer versions and become stale when those components change materially.
8. Ownership Transfer Test: if a decision is moved from scaffold to Seven, re-evaluate rather than assuming the score retains meaning.
9. Hidden Assistance Audit: automatically inserted context, retries, default actions, cached state, or preprocessing are recorded as part of the evaluation contract.
10. Reliability Beyond Mean: report worst-case or tail behavior when averages would hide seed- or scenario-sensitive weakness.
11. Capability Claim Ceiling: a capability cannot be attributed to Seven when a necessary execution decision was supplied externally without independent evidence.
12. Benchmark Repair Epoch: material scaffold/scorer repairs start a new comparison epoch unless a bridge study demonstrates comparability.
13. Comparator Fairness: incumbent and candidate receive matched scaffold assistance when the goal is candidate comparison.
14. Release Evidence Separation: benchmark success under a strong harness cannot substitute for release evidence under the production scaffold.
15. Measurement Audit: before saturation, an independent review asks whether the benchmark still measures the intended construct after all wrappers and scoring rules are applied.

## Saturation
V5.24 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No de-scaffolding harness, scorer audit runtime, or ground-truth reconstruction system is claimed implemented.