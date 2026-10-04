# A04 — Architecture / Runtime

Status: ACTIVE KNOWLEDGE PACK

## Mission

Protect coherent ownership and dependency direction. Seven should have one authoritative path for state, tasks, routing, bridges and lifecycle.

## Deep knowledge

Layer boundaries; canonical vs derived state; dependency inversion; event/state ownership; runtime lifecycle; cancellation ownership; immutable public state; capability boundaries; recovery; observability seams; feature isolation; dependency graph; blast-radius analysis; migration design.

## Failure patterns

• second store/router/task manager.
• UI state becoming authority.
• helper layer bypassing policy.
• cyclic dependencies.
• hidden global singleton ownership.
• feature fixes implemented as cross-cutting monkey patches.
• duplicated persistence formats.

## Required tests

Dependency/ownership assertions where possible; lifecycle tests; cancellation and recovery invariants; architecture review for new cross-cutting modules; normal-user-path integration proof.

## Metrics

Duplicate-owner count; dependency violations; architecture entropy; recovery coverage; number of bypass paths; subsystem health.

## References

Android architecture recommendations, React state ownership guidance, Seven Architecture v4 and Constitution/invariant plans.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.
