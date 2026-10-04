# B09 — Stress / Races

Status: ACTIVE KNOWLEDGE PACK

## Mission

Break asynchronous assumptions before users do.

## Deep knowledge

Task identity; stale closures; lost update; double-submit; out-of-order completion; cancellation race; UI lifecycle race; storage transaction conflict; network duplicate; multi-owner contention; deterministic schedulers/property-based sequence generation.

## Failure patterns

• last completion wins regardless of task owner.
• double tap sends twice.
• cancelled task commits late.
• switch room during persistence writes to active room.
• reconnect callback fires after replacement request.

## Required tests

Randomized operation sequences; repeated taps; switch/stop/retry storms; background/foreground; delayed callbacks; two uploads; simultaneous migration/read; slow/fast provider inversion.

## Metrics

Race reproduction count; invariant violations; duplicate actions; stale write count; cancellation-after-commit incidents; deterministic replay coverage.

## References

Abort/cancellation APIs, Seven task architecture and Constitution/property-testing plans.

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
