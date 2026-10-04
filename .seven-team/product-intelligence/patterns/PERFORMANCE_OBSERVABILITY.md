# Pattern Library — Performance & Observability

Status: ACTIVE KNOWLEDGE PACK

## Measure user-perceived phases

Launch→usable, tap→feedback, send→request, request→first token, stream duration, room switch, file pick→ready, search→first source, restore→interactive.

## Tracing

Use consistent trace/metric/event names. Correlate controller decision, model route, network/tool calls, persistence and UI long tasks. Prompt/output content should remain opt-in due to sensitivity.

## Budgets

Set budgets per journey rather than generic speed claims. Track regressions against Champion/baseline and distinguish network latency from app latency.

## Anti-patterns

Logging secrets/prompts by default; metrics with unbounded cardinality; optimizing average while p95 user experience regresses; hiding slow work behind animation.
