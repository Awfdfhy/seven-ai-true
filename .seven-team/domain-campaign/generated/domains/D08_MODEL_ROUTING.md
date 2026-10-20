# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: READY

DOMAIN_ID=D08_MODEL_ROUTING
SOURCE_ANALYSIS=Harvested evidence is READY with 11 primary sources. LLMRouterBench (ACL 2026) supports benchmarked routing comparison; OpenTelemetry GenAI semantic conventions support provider/health telemetry attribute standardization. Freshness is current for 2026 routing research, but benchmark details are not extracted beyond source metadata in this packet. Disagreement/limitation: benchmark leaderboards provide external model-quality evidence, not Seven runtime behavior.
CURRENT=Seven has `remake/src/routing/model-router.ts` with `ModelRegistry`, provider health tracking, cooldowns, attempt tokens, route plans, and validation. `remake/src/application/chat/provider-chat-transport.ts` and tests exercise provider chat. Evidence level: code + unit/integration tests; no production edits this cycle.
TARGET=Deterministic provider health/fallback with cooldown decay, retry-after handling, route explainability, and telemetry aligned to OpenTelemetry GenAI attributes. Keep one routing owner.
NOW=Add route decision diagnostics (provider, model, cooldown, retry-after, attempt token) without secrets; add stress tests for concurrent health updates and cooldown expiry.
NEXT=Compare routing decisions against LLMRouterBench-style benchmark harness; add provider latency/error rolling windows.
LATER=Adaptive routing policies with benchmark-gated rollout.
TESTS=Unit tests for cooldown precedence, attempt-token ordering, health snapshot immutability; integration tests for fallback and cancellation; replay tests.
RISKS=Race on health state; stale cooldowns; provider identity leakage; overfitting to benchmark scores.
FIRST_SLICE=Route telemetry + deterministic cooldown tests.
KNOWN_UNKNOWNS=No measured latency/quality baseline in harvested evidence; no Android-specific provider behavior.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
