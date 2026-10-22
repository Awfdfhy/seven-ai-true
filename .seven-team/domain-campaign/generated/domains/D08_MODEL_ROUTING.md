# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: READY

DOMAIN_ID=D08_MODEL_ROUTING
SOURCE_ANALYSIS=Harvested LLMRouterBench (ACL Findings 2026) and OpenTelemetry GenAI semconv. LLMRouterBench presents a large benchmark/unified framework for LLM routing (routing decisions by quality/cost/latency). OTel GenAI semconv provides attribute registry for gen-ai telemetry (model, provider, agent, etc.). Gap: no harvested provider health/fallback implementation details; need to align routing telemetry with OTel and evaluate against routing benchmarks.
CURRENT=ARCHITECTURE states ModelRouter is "pure decision engine" given mode, user preference, available providers/models, health/cooldown state, context budget returning explicit route plan. ProviderAdapter contract defined. Provider health/cooldown state exists in storage domains per architecture. No concrete router implementation inspected in this pass; ownership implied shared A05/A09.
TARGET=Evidence-driven routing: route by explicit plan with health/cooldown, cost/latency/quality tradeoffs, deterministic fallback, circuit breaking, and OTel-aligned telemetry (gen_ai.*) with replayable decisions.
NOW=Extract router decision schema (inputs/outputs/reasons), add decision logging with OTel GenAI attributes, and codify fallback order with tests.
NEXT=Integrate routing signals from health checks, context budget, and model capabilities; add A/B routing experiments with deterministic replay.
LATER=Learned routing informed by LLMRouterBench metrics with guardrails and evals.
TESTS=Routing unit tests (fallback chains), health/cooldown transitions, budget-constrained routing, telemetry schema validation, and replay tests.
RISKS=Routing changes can flip models unexpectedly; must preserve user preference and have circuit breakers. Telemetry must not leak prompts.
FIRST_SLICE=Define RoutePlan schema + router interface with health/cooldown inputs and emit OTel GenAI decision attributes (model/provider/route_reason) with deterministic tests.
KNOWN_UNKNOWNS=Current health check cadence, cooldown values, provider capability matrix completeness, and integration with Deep Think.
DOMAIN_VERDICT=READY_FOR_PLAN
