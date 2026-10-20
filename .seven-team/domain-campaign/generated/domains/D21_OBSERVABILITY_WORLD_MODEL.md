# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: READY

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
SOURCE_ANALYSIS=Harvested evidence is INSUFFICIENT: only 2 primary sources. OpenTelemetry semantic conventions provide attribute/span guidance; GenAI attributes moved to dedicated repo. Disagreement: none; limitation is shallow harvest and no Seven runtime telemetry evidence.
CURRENT=Seven has `remake/src/observability/diagnostics.ts` with redaction, bounded buffer, immutable events, and validation. No broader world-model/blast-radius runtime instrumentation found in inspected files. Evidence level: code + tests.
TARGET=Safe diagnostics aligned to OpenTelemetry GenAI conventions, blast-radius-aware change planning, and no secret/prompt leakage.
NOW=Map diagnostic categories to GenAI semantic conventions and add tests for redaction of tokens/prompts/content.
NEXT=Add correlation IDs across routing/deep-think/memory and export format validation.
LATER=Engineering world model integration with test planning.
TESTS=Redaction tests, schema validation, capacity bounds, correlation propagation.
RISKS=Secret leakage; unbounded telemetry; PII in attributes.
FIRST_SLICE=Telemetry schema mapping + redaction regression tests.
KNOWN_UNKNOWNS=No installed-device or runtime trace evidence; harvested source count below target.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
