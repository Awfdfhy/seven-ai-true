# Provider Health v2 — Detailed Execution Specification

Date: 2026-10-02
Status: IMPLEMENTATION READY
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Objective

Upgrade Seven's provider/model health from simple counters and fixed cooldowns into a bounded, self-healing runtime signal that distinguishes failure classes, respects provider-wide outages, tracks rolling latency, applies dynamic cooldown/backoff, surfaces safe diagnostics, and feeds Model Intelligence v3 without leaking credentials or prompts.

## Invariants

- Health is advisory routing state, never evidence or truth authority.
- Credentials, prompt text, response text, and raw headers are never persisted in health telemetry.
- Existing `FREE_MODEL_HEALTH_KEY` data remains readable; migration is lazy and non-destructive.
- A single model failure must not unnecessarily disable the whole provider.
- Provider-wide failures are reserved for classes that plausibly affect all models: auth, quota/rate-limit, repeated server/network failures.
- User/manual selection does not bypass a hard cooldown when the route cannot work.
- Partial streamed output is never retried automatically on another provider.
- Cooldowns are bounded; old failures decay and successful calls heal the route.
- Diagnostics must be safe to export.

## Health schema v2

Each model/provider health record may contain:

- schemaVersion
- successes
- failures
- consecutiveSuccesses
- consecutiveFailures
- latencyMs (legacy compatible)
- ewmaLatencyMs
- latencySamples (bounded numeric ring, max 12)
- lastSuccessAt
- lastFailureAt
- lastAttemptAt
- cooldownUntil
- lastStatus
- lastErrorClass
- statusFamilyCounts (bounded object)
- recoveryCount

Provider-wide records continue to use id `*`.

Legacy records lacking v2 fields are normalized on read.

## Failure classes

`classifyProviderFailureV2(error)` returns one of:

- auth — 401/403
- rate_limit — 429
- not_found — 404/model unavailable
- client — other 4xx
- server — 5xx
- timeout — AbortError caused by timeout / explicit timeout marker
- network — fetch/network failure
- cancelled — user cancellation
- unknown

Cancelled requests do not damage health.

## Dynamic cooldown policy

Base cooldowns:
- auth: 10 min
- rate_limit: 2 min
- not_found: 30 min model-only
- client: 30 sec model-only
- server: 20 sec
- timeout: 15 sec
- network: 10 sec
- unknown: 15 sec

Dynamic multiplier:
- exponential by consecutive failures, capped
- successful calls reset failure streak
- Retry-After may extend rate-limit cooldown when safely parsed
- hard cap: 30 minutes except model-not-found which may remain 30 minutes

Provider-wide circuit behavior:
- auth and rate_limit immediately create provider cooldown
- server/timeout/network create provider-wide cooldown only after repeated recent failures
- not_found/client remain model-local
- success after cooldown heals provider-wide degradation

## Rolling latency

Use EWMA plus bounded samples.

- EWMA alpha target: 0.25
- keep up to 12 latency samples
- derive p50/p90 approximately from stored samples for diagnostics
- routing uses EWMA, not one anomalous request
- zero/invalid latency is ignored

## Health score

Provider Health v2 exports a normalized 0..1 score.

Factors:
- decayed success/failure history
- consecutive failure penalty
- recent error-class penalty
- provider-wide degradation
- latency pressure when speed is relevant
- recovery after recent success

States:
- healthy
- degraded
- poor
- cooldown

Model Intelligence v3's `computeHealthSignalV3` must delegate to Provider Health v2 so there is one health truth.

## Quota pressure

Keep existing daily request accounting and expose:

- requests
- successes
- failures
- ratio to configured soft cap when known
- state: normal / elevated / near_limit

Quota pressure affects ranking but does not fabricate exact external quota remaining.

## Diagnostics

Expose `window.SevenProviderHealthV2` with safe read-only methods:

- `snapshot(provider?, model?)`
- `provider(providerId)`
- `model(providerId, modelId)`
- `classify(error)`
- `score(providerId, modelId)`

Snapshot fields may include:
- provider/model ids
- state
- score
- ewma latency
- p50/p90 latency
- success/failure counts
- consecutive failures
- last error class/status
- cooldown remaining
- quota pressure

Never include:
- API tokens
- auth headers
- prompt/response content
- raw error bodies

## UI integration

The model status line should summarize route health without clutter:
- Healthy
- Degraded
- Cooling down
- Quota pressure

Detailed diagnostics remain behind the runtime API for now. A dedicated diagnostics panel is deferred to the UI Simplification/Observability pass.

## Tests

Deterministic browser tests must cover:

1. legacy v1 health record normalizes into v2 shape
2. success records EWMA latency and bounded sample history
3. failure classification distinguishes auth/429/404/5xx/network/cancel
4. cancelled request does not increment failures
5. consecutive failures increase cooldown
6. Retry-After can extend 429 cooldown but is bounded
7. 404 remains model-local
8. 401/403 and 429 open provider-wide circuit
9. repeated server/network failures can open provider circuit
10. successful request resets failure streak and heals model cooldown
11. old failures decay in score
12. diagnostics contain no secret-shaped values
13. quota pressure states are deterministic
14. Model Intelligence v3 health delegates to v2
15. existing free-only routing/fallback tests remain green

## Acceptance criteria

Provider Health v2 is complete when:
- normal provider calls record v2 success/failure telemetry;
- Model Intelligence v3 consumes the v2 signal;
- legacy health storage remains compatible;
- circuit breakers are failure-class aware;
- health recovers after success/time;
- no secrets/prompts are stored or exposed;
- all existing and new CI tests pass;
- implementation is merged only after the tested head SHA is confirmed.

## Deferred

- active background health probes
- server-side observability
- long-term per-hour histogram storage
- learned provider reliability models
- dedicated diagnostics UI
