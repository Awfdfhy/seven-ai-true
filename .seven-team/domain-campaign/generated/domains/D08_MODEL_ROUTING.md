# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: READY

DOMAIN_ID=D08_MODEL_ROUTING
SOURCE_ANALYSIS=LLMRouterBench (ACL 2026, aclanthology.org/2026.findings-acl.1881) provides a massive benchmark + unified framework for LLM routing — primary, harvest=READY. OpenTelemetry GenAI semantic conventions (opentelemetry.io docs) define standard attributes for model/routing observability — primary. 11 primary sources harvested. No disagreement between sources; limitation is that LLMRouterBench is an evaluation framework, not a runtime router implementation, and OTel GenAI attributes moved to a separate repo (stability/migration note).
CURRENT=Seven has no ModelRouter. `release/control-runtime.js` has task contracts, capability gating (`canUseCapability`), tier selection (`selectTier`), budget creation (`createBudget`), and context compilation (`compileContext`) — but zero provider health tracking, no fallback chain, no route-plan output, no model selection decision engine. `release/control-bridge.js` `syncResources()` updates tier+budget non-atomically (read tier → create budget → write state), a race under parallel callers.
TARGET=A pure ModelRouter service (per ARCHITECTURE §4): given requested mode, user model preference, available providers/models, health/cooldown state, and context budget → returns an explicit route plan. ProviderAdapter contract (listModels/complete/stream/normalizeError/capabilities) isolated per adapter. Provider health with cooldown and fallback. Route plan is deterministic and revalidated before provider dispatch.
NOW=Implement ModelRouter module: provider registry, health/cooldown tracker, fallback chain, route-plan output, integration hook into `control-runtime.compileContext` for context-aware routing.
NEXT=Wire router into task execution path (control-bridge execution), provider health polling, cooldown backoff, fallback exhaustion error surface.
LATER=LLMRouterBench-aligned routing evaluation harness; local embedding/lexical signals for routing decisions (only if measured win over baseline); Android provider health round-trip evidence.
TESTS=Unit: route plan determinism for same input, fallback chain order on provider failure, cooldown prevents immediate retry, health stale-after-ttl, context budget influences route selection, no duplicate owners (router is single owner, not provider).
RISKS=Wrong route increases latency/cost; provider health race under concurrent calls; fallback loop silently degrading quality; route plan not revalidated → stale model used; credential/secret leakage in health diagnostics.
FIRST_SLICE=ModelRouter with health/cooldown + fallback chain + route plan, unit-tested; no provider implementation changes.
KNOWN_UNKNOWNS=Provider adapter interfaces not yet defined in repo; no live provider credentials; OTEL GenAI attribute mapping not yet applied to Seven trace schema.
DOMAIN_VERDICT=READY_FOR_PLAN
