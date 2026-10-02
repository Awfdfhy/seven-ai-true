# Measured Latency Optimization v2 — Detailed Plan

Date: 2026-10-02
Status: ACTIVE
Milestone: Seven AI 2.1.x post-polish latency learning
Parent: DEEP_THINK_SPEED_POLISH.md

## Objective

Turn Deep Think speed from static heuristics into measured, self-adjusting latency behavior while preserving:
- two-pass Deep Think;
- strongest supported reasoning effort;
- free-only policy;
- manual-selection semantics;
- Search/Memory/attachments/context;
- Stop/cancellation;
- no retry after partial final output.

The v2 system learns only timing/route telemetry. It never stores prompts, responses, chain-of-thought, API keys, headers, or arbitrary error bodies.

## Core metrics

Per provider + model + purpose + complexity tier, retain a bounded rolling window of:
- total latency
- time-to-first-token when streaming
- success/failure outcome
- timestamp

Derived:
- sample count
- p50 total
- p90 total
- p50 first-token
- p90 first-token
- freshness

Purposes:
- deepThink
- chat
- title
- summary/searchPlan where relevant

Complexity tiers:
- low
- medium
- high
- veryHigh

## Storage contract

Local-only key: `sevenLatencyV2`

Each route bucket:
- schemaVersion
- provider
- model
- purpose
- tier
- totalSamples (max 20)
- firstTokenSamples (max 20)
- successes
- failures
- lastUpdatedAt

Hard caps:
- max 120 route buckets
- max 20 samples per metric
- discard invalid/non-finite timing values
- oldest/least recently used route buckets evicted first

## Adaptive Speed Router v2

When `latencyPriority=true` and routing mode is Auto:

1. keep all existing hard eligibility gates;
2. keep reasoning/task-quality score;
3. keep Provider Health v2;
4. add measured latency score when enough fresh samples exist;
5. use p50 as normal responsiveness and p90 as tail-latency risk;
6. avoid overreacting to 1–2 samples;
7. never let speed compensate for missing required capability/context;
8. preserve manual routing preference.

Warm-up:
- 0–2 samples: metadata + Provider Health only
- 3–5: weak measured-latency influence
- 6+: full bounded influence

Near-ties:
- if two reasoning candidates are close in quality, the lower measured p90 wins;
- clear quality gaps still dominate speed.

## Dynamic timeout v2

Deep Think timeout becomes route-aware after enough samples.

Formula target:
- learned timeout ≈ p90 total × 1.8 + safety margin
- bounded by complexity-specific min/max
- never below 8 seconds
- never above existing tier ceiling unless Retry-After/provider state requires otherwise

Complexity bounds:
- low: 8–25s
- medium: 10–35s
- high: 15–45s
- veryHigh: 20–55s

With insufficient data, use Fast Lane v1 static timeout.

## Deep Think budget policy

Do NOT reduce the quality floor based purely on latency.

The existing complexity budgets remain the authoritative maximum hidden-output budgets:
- low 2048
- medium 4096
- high 8192
- veryHigh 12288

v2 may later reduce unused slack only after evidence shows no quality regression. That is deliberately deferred.

## First-token optimization

For final streamed answers:
- wrap the normal onToken callback without changing text;
- record first-token latency for the actual winning route;
- preserve frame-coalesced UI streaming;
- no extra provider calls.

This metric is used for diagnostics and later routing of final-answer models, not to expose hidden reasoning.

## Safe diagnostics

Expose read-only `window.SevenLatencyV2`:
- snapshot(provider?, model?, purpose?, tier?)
- percentile(...)
- timeout(...)
- clear() only for test/internal settings integration

No conversation content.

## Tests

1. valid samples persist and remain bounded
2. invalid samples are ignored
3. p50/p90 deterministic
4. warm-up influence is weak before 3 samples
5. 6+ samples influence Auto Deep Think route
6. manual route remains authoritative when eligible
7. slower near-tied model loses to faster measured model
8. clearly stronger reasoning model is not displaced by tiny latency advantage
9. learned timeout obeys tier min/max
10. static timeout used without enough data
11. first-token timing recorded once
12. failed pre-output attempt records total/failure but no fake first-token
13. partial-output failure never causes fallback
14. telemetry exposes no secret/content material
15. Provider Health v2 remains the health authority
16. existing Deep Think speed tests stay green

## Acceptance criteria

Complete when:
- real route timings are recorded for every successful/failing provider attempt;
- Auto Deep Think uses measured p50/p90 when statistically meaningful;
- timeout adapts by actual route history;
- no extra network request is added;
- all browser CI passes;
- Android main release gate passes after merge.

## Deferred

- request hedging
- reasoning-brief cache
- server-side telemetry
- cross-device sync of timings
- learned quality scoring
