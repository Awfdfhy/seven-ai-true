# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: READY

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
SOURCE_ANALYSIS=[SOURCE primary] OTel semantic conventions (core) and [SOURCE primary] gen-ai attributes — authoritative for spans/metrics/log attributes, stability, naming. Harvested count low (INSUFFICIENT) but core sources present. Limitations: spec defines semantics, not Seven’s blast-radius model or internal world model. Gaps: what constitutes “engineering world model” in Seven, blast-radius definitions, correlation (trace→logs→metrics), sampling, PII redaction, Android constraints.
CURRENT=Repo grep shows observability/otel/gen_ai/span/trace/metric/telemetry present. A04,A09 owners; A09 overlap (performance/latency/cancellation, routing decisions) means OTel must capture budgets, failover, long tasks. Need to map current telemetry surfaces and invariants.
TARGET=Structured observability: consistent span names/kinds, OTel gen-ai attrs for LLM calls/routing (D08), performance attrs (latency, queue time, backpressure, cancellation reason), blast-radius tagging (affected surfaces, risk level), deterministic redaction, and minimal overhead. “World model” evidence: correlated events that explain behavior under pressure. 
NOW=Map telemetry implementation (tracer/metrics/exporters). Align with OTel semconv [SOURCE primary] for gen-ai [SOURCE primary] (adopt moved attrs), add key events for routing failover (D08), deep think phases (D09), long chat performance (D17). Define blast-radius taxonomy (what counts as blast radius, how tagged).
NEXT=Add performance histograms (P95/P99) per surface, cancellation/retry reason codes, error taxonomy, and correlation IDs across modules. Ensure sampling respects budgets (low overhead). Redaction policy enforced in code (no secrets/PII).
LATER=Trace-based regression tests (golden traces), anomaly signals, SLO/SLI definitions, and integration with evals. 
TESTS=Attribute correctness, redaction, sampling, correlation, overhead bounds. Integration: routing failover produces expected span attrs. Adversarial: log flooding, sensitive data, clock skew.
RISKS=Overhead (latency/memory), PII leakage, noisy telemetry, cross-cutting changes violating ownership, Android resource constraints. 
FIRST_SLICE=OTel gen-ai minimal attrs for routing decisions (model, route target, fallback reason, latency, error) and performance span for chat stream (duration, queue time, cancellation). Deterministic, low footprint.
KNOWN_UNKNOWNS=Exporter configuration, sampling strategy, existing blast-radius model contract, redaction rules, whether “world model” is product term or internal. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (harvested D21 low count; need Seven’s blast-radius/world model contract)
