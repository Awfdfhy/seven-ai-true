# Seven Self-Evolution Engine 4.4 — Assistance & Propagation Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: Self-Evolution Engine 4.3
Governance: V5.40 Meta-Assurance Closure

## 1. Assistance Accounting
Every evaluation records meaningful assistance separately from candidate capability: human edits, manual debugging, external patches, extra research, additional retries, stronger models, expanded tool access, or increased compute. Assisted success may support a collaboration claim, but it cannot silently become an autonomous-capability claim.

## 2. Intervention Classes
Interventions are classified as:
- OBSERVE_ONLY;
- APPROVAL_ONLY;
- CLARIFICATION;
- DIAGNOSTIC_HELP;
- CORRECTIVE_EDIT;
- EXTERNAL_REPAIR;
- OVERRIDE.

Promotion evidence records which classes occurred and where they affected the result.

## 3. Oversight Placement
Human/expert review is placed where it has the greatest decision value rather than added at every step by default. High-value review points include target/goal lock, promotion-critical verification, unresolved contradiction, broad-scope promotion, and governance change.

## 4. Review Packet
A reviewer receives a compact evidence packet independent of Builder narrative:
- Goal Receipt and target hash;
- candidate/incumbent identities;
- deterministic/invariant results;
- key axis results and regressions;
- assistance record;
- unresolved contradictions/assumptions;
- resource/complexity delta;
- rollback/recovery evidence;
- exact requested decision.

## 5. Review Sustainability
Campaign design tracks review burden, repeated-review frequency, time-to-decision, disagreement rate, and cases reopened by later evidence. The system should reduce redundant review without removing high-criticality oversight.

## 6. Verification Priority
Where deterministic or executable checks validly test a claim, their result outranks conflicting free-form model judgment for that claim. LLM Judge output remains useful for semantic, qualitative, and open-ended assessment but cannot override a failed noncompensable invariant.

## 7. Four-Scale Propagation Barrier
Evidence and learned artifacts cross explicit boundaries:
1. ACTION scale — one execution step;
2. ATTEMPT scale — one task/run;
3. EXPERIENCE scale — retained learning across later tasks;
4. GENERATION scale — persistent updates inherited by successor development engines.

A claim at a lower scale does not automatically authorize persistence at a higher scale.

## 8. Inherited Artifact Revalidation
A successor generation does not trust an artifact merely because a previous generation produced or promoted it. Inherited prompts, tools, memories, tests, models, schemas, and heuristics retain evidence state, scope, freshness, dependencies, and invalidation triggers. Material environment or requirement changes can require revalidation.

## 9. Assistance-Normalized Comparison
When comparing incumbent and candidate, assistance budgets are matched where practical. If one side receives materially more help, the delta is exposed and claim scope narrowed.

## 10. Oversight Independence
For broad or high-criticality promotion, review should include a perspective not generated solely from the same Builder context. Shared model/provider/tool dependencies are recorded as correlation, not treated as independent evidence.

## 11. Escalation Quality
Self-Evolution is evaluated on whether it escalates the right uncertainty with enough evidence for efficient review, not on maximizing or minimizing escalation count.

## 12. Learning From Review
Reviewer feedback enters the Experience Compiler only with provenance, scope, and evidence classification. A review comment is not canonical truth merely because it came from a reviewer; authoritative requirements remain separate.

## Truth boundary
Architecture only. This revision does not claim automated assistance accounting, reviewer workload measurement, or independent review tooling is implemented.