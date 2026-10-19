# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: READY

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
SOURCE_ANALYSIS=OpenTelemetry semantic conventions 1.44.0 (opentelemetry.io/docs/specs/semconv/, primary) and GenAI attributes (moved to separate repo, primary). Harvest=INSUFFICIENT: only 2 sources, target=8. OTel defines span names/kind, metric instruments/units, attribute names/types/valid values; GenAI attributes relocated. No Seven-specific observability guidance in sources.
CURRENT=`release/control-runtime.js` has side effect ledger (PLANNED→ATTEMPTED→VERIFIED/FAILED/UNCERTAIN/ROLLED_BACK), `compileContext`, `tokensOf`, `detectSignals`. `release/execution-bridge.js` has run ledger, verification (PASS/INCONCLUSIVE/FAIL), checkpoint/restore. `release/control-bridge.js` has guardCanonCommit, buildTaskContext, research→claim conversion. Bounded diagnostics with redaction mentioned in MILESTONES but no OpenTelemetry integration, no world model observability, no blast-radius tracing, no trace ID propagation across JS/native bridge.
TARGET=Bounded diagnostics with default token/secret/auth/prompt/message/content/body redaction (per MILESTONES phase 11), observability spans aligned to OTel GenAI conventions, blast-radius analysis for task failures, trace IDs on task lifecycle events, recovery diagnostics that never leave document globally inert.
NOW=Add trace IDs to task lifecycle events, redaction boundary for diagnostics output, world-model event schema for task/room/canon boundaries, instrument side effect ledger state transitions with trace context.
NEXT=OTel semantic convention alignment for GenAI spans, blast-radius analysis (which rooms/tasks affected by a provider failure), recovery screen diagnostics, Android instrumented round-trip observability.
LATER=Distributed tracing across Capacitor JS/native bridge, world model graph (rooms→memory→RPG→canon) with failure propagation maps, evaluator-plane observability hooks.
TESTS=Unit: redaction removes tokens/secrets/auth/prompt/message/body from diagnostics, trace ID propagation through task transitions, side effect ledger unresolved-effects consistency, checkpoint restore determinism, guardCanonCommit blocks invalid canon commits.
RISKS=Secret leakage in traces/diagnostics; incomplete observability hiding failures (INCONCLUSIVE mistaken for PASS); no Android observability evidence; trace overhead affecting performance budgets; OTel SDK not in package.json.
FIRST_SLICE=Trace ID on task lifecycle + redaction boundary for diagnostics + side effect ledger transition logging.
KNOWN_UNKNOWNs=OpenTelemetry SDK not installed; no OTel collector/exporter config; domain source target unmet (2/8) → RESEARCH_INSUFFICIENT until more OTel/GenAI observability sources gathered; no live trace consumer.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
