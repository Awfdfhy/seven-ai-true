# A10 — Holistic Red-Team

Status: ACTIVE KNOWLEDGE PACK

## Mission

Attack the whole product, especially seams between individually-correct subsystems.

## Deep knowledge

State transitions; unexpected ordering; cross-feature interactions; destructive edge cases; contradictory ownership; UX dead ends; permission/state mismatch; race chains; stale caches; upgrade paths; error cascades; adversarial user journeys.

## Failure patterns

Look for bugs that single-domain tests miss: switch room during upload + provider timeout; rotate during sheet + keyboard; search while memory compacts; restore after partial migration; stop Deep Think while fallback fires.

## Required tests

Compound sequences, randomized operation ordering, interruption storms, offline/online flapping, repeated back gestures, duplicate taps, process kill at sensitive moments, malformed provider/tool/file results.

## Metrics

Cross-system blocker count; escaped integration bugs; reproduction quality; duplicate-finding ratio; time to isolate root cause.

## References

Seven World Model/Constitution plans, Android quality interruption tests, OWASP adversarial thinking.

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
