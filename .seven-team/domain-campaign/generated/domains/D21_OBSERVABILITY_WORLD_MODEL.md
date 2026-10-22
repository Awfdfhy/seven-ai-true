# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: READY

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
SOURCE_ANALYSIS=Harvested OTel docs/specs (semconv) and GenAI semconv (duplicate). Harvest count small (INSUFFICIENT per provided data). OTel provides robust conventions for traces/metrics/logs and gen-ai attributes. Need more sources for world model/blast radius patterns.
CURRENT=TaskManager has listeners/snapshots; architecture mentions observability implicitly. No explicit world model/blast radius service inspected. Ownership A04/A09.
TARGET=Engineering world model with causal tracing, blast radius analysis, SLOs, and OTel-aligned telemetry across tasks/bridge/storage/providers.
NOW=Map critical paths to traceable spans (TaskManager, router, Deep Think, storage), adopt OTel GenAI attributes where applicable, and define blast radius schema.
NEXT=Implement dependency graph for blast radius, error budgets, and alerts.
LATER=Automated impact analysis.
TESTS=Trace propagation tests, blast radius tests, and telemetry schema validation.
RISKS=Telemetry volume/cost, PII in traces, overhead on hot paths.
FIRST_SLICE=Instrument TaskManager with span events (task start/end/cancel/timeout) and define minimal world model schema with tests.
KNOWN_UNKNOWNS=Existing tracing infrastructure, sampling, and blast radius requirements.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
