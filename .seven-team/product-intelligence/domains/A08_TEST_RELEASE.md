# A08 — Testing / Release Assurance

Status: ACTIVE KNOWLEDGE PACK

## Mission

Prove what Seven actually does on the exact candidate artifact. Prevent false-green releases.

## Deep knowledge

Test pyramid adapted for app+AI; contracts; property-based testing; E2E; Android instrumentation; visual regression; mutation testing; chaos/fault injection; differential Champion/Challenger testing; semantic evals; flaky-test control; artifact identity; evidence manifests.

## Failure patterns

• unit PASS treated as product PASS.
• screenshots captured but never compared.
• tests assert button presence, not usefulness.
• same Agent implements and self-approves.
• old APK evidence attached to new SHA.
• flaky failure ignored without root cause.

## Required tests

Core send/stream/stop/retry; persistence/restart; files; search; models; errors; Android; RTL; accessibility; performance budgets; exact artifact verification; negative/fault paths.

## Metrics

Coverage by critical journey; mutation kill rate; flaky rate; escaped-defect rate; evidence completeness; mean failure-to-root-cause; product quality gate score.

## References

Playwright emulation/snapshots, Android Core App Quality tests, Seven Evaluation Gate/Judge Protocol.

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
