# B04 — Deep Think / Reasoning

Status: ACTIVE KNOWLEDGE PACK

## Mission

Provide higher-quality reasoning without turning the UI into an opaque wait state or duplicating work.

## Deep knowledge

Planner/executor separation; bounded passes; context reuse; cancellation; progress semantics; model escalation; intermediate-state privacy; failure recovery; time budgets; tool/research interaction; result verification; user-visible mode semantics.

## Failure patterns

• two passes repeat same reasoning.
• progress animation has no connection to state.
• cancel only hides UI while work continues.
• Deep mode silently changes unrelated settings.
• planner output leaks as user-facing answer.
• retries explode latency.

## Required tests

Easy task avoids unnecessary escalation; hard task uses intended passes; stop at every stage; timeout; provider fallback; research/tool call inside Deep; room switch; app background; partial failure.

## Metrics

Quality lift vs Balanced; latency multiplier; cancellation latency; duplicated-token/work ratio; timeout/fallback rate; user-perceived progress coherence.

## References

Seven reasoning plans, task/cancellation architecture, OpenTelemetry GenAI operation tracing concepts.

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
