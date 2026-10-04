# A05 — Models / Routing / Providers

Status: ACTIVE KNOWLEDGE PACK

## Mission

Make model choice excellent by default, resilient under provider failure, and understandable without requiring provider expertise.

## Deep knowledge

Capability registry; model metadata; routing objectives; Quick/Balanced/Deep; availability/health; latency; quotas; fallback; provider normalization; model-switch penalty; cost/free-proof semantics; deterministic routing tests; user override semantics; failure-class normalization.

## Failure patterns

• strongest model hardcoded as universal default.
• fallback silently changes capability or permissions.
• provider names dominate normal UX.
• retries multiply one user action.
• stale health marks dead provider healthy.
• route selection ignores task requirements.

## Required tests

Capability matching; provider outage; timeout/rate-limit/auth distinction; fallback chain; cancellation; user-selected model; no-config/zero-key routes; routing reproducibility; UI state reflects actual selected route.

## Metrics

First-success latency; fallback rate; route success; wrong-capability route rate; retry amplification; user override success; routing quality score.

## References

OpenTelemetry GenAI concepts for safe telemetry; Seven provider-health/model intelligence plans; current AI chat model-selection UX benchmarks.

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
