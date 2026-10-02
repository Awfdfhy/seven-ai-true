# Model Intelligence v3 — Detailed Execution Specification

Date: 2026-10-02
Status: COMPLETE — merged to main via PR #20
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Objective

Upgrade Seven's model selection from a mostly single-task score into a confidence-aware, multi-intent router whose picker and Auto Routing share the same deterministic ranking result.

The implementation must improve decisions without creating hidden authority, paid fallback, or unstable model hopping.

## Non-negotiable invariants

- Free-only policy remains authoritative where the Free Model Fabric is active.
- Manual model selection remains a user preference; fallback never silently upgrades to paid.
- The same ranking primitive powers the visible model picker and Auto Routing.
- Health may affect availability and ranking, but never truth/evidence authority.
- Partial streamed output must never be retried through another model.
- Credentials never enter routing telemetry, explanations, prompts, exports, or diagnostics.
- A model lacking a required capability cannot win purely through high quality metadata.
- Stable near-ties should prefer continuity instead of switching models every request.

## Inputs

The v3 router evaluates:

### Request intent
A request can contain multiple simultaneous intents rather than exactly one label.

Initial intents:
- general
- coding
- reasoning
- research/current-info
- planning
- writing
- translation
- summarization
- vision
- tool/agent use
- long-context
- RPG/story
- fast response
- precision

Each intent receives a normalized weight. The analyzer also emits:
- primary intent
- secondary intents
- confidence
- complexity

### Workspace / mode
Workspace remains a strong prior:
- Chat
- Think
- Search
- Research
- Coding
- RPG

Request intent adjusts the workspace profile; it does not erase it.

### Context pressure
Use estimated input tokens, requested output budget, knowledge/file state, and model context window.

Derived:
- requiredContext
- contextPressure ratio
- headroom bonus/penalty

A model too small for required context is ineligible, not merely penalized.

### Capabilities
Hard/soft requirements:
- streaming
- tools
- vision
- structured output
- reasoning support when explicitly required

### Health
Use bounded, decayed observations:
- successes
- failures
- last success/failure
- rolling latency
- last HTTP status
- provider-wide cooldown
- model cooldown
- free-tier quota pressure

Do not let ancient failures permanently poison a model.

## Scoring design

Final score is normalized to 0..100 and composed from:

1. blended task fitness
2. quality
3. speed when relevant
4. context headroom
5. capability fit
6. provider/model health
7. quota pressure
8. switch hysteresis / continuity

The exact weights are deterministic constants in code and exposed only through diagnostics, not user prompts.

## Confidence

Routing confidence is separate from model score.

Confidence should rise when:
- intent signals agree
- one intent clearly dominates
- workspace prior agrees with request intent
- required capabilities are unambiguous

Confidence should fall when:
- request is extremely short/ambiguous
- multiple intents are near-tied
- metadata/capabilities are unknown

Low confidence does not block routing; it increases continuity preference and makes the explanation say the selection is a best-effort estimate.

## Hysteresis

Prevent unnecessary model switching.

If the current healthy model is within a small score margin of the new top candidate, retain it unless:
- it lacks a required capability
- it is cooling down
- context is insufficient
- provider quota/health is materially degraded
- the user manually selected another model

Initial margin target: 2.5 score points, increased slightly when confidence is low.

## Explainability

Every ranked candidate should expose a bounded explanation object, e.g.:

- strong_for: ["coding", "reasoning"]
- context_headroom: "high"
- capability_fit: ["tools", "structured"]
- health: "healthy" | "degraded" | "cooldown"
- continuity: "kept_near_tie" | "not_applicable"
- confidence: 0..1

The UI should render only 1–3 concise reasons such as:
- Best fit for coding + reasoning
- Large context headroom
- Healthy provider
- Kept current model because scores were nearly tied

Never display fabricated benchmark language.

## Provider Health v1 compatibility

Existing `FREE_MODEL_HEALTH_KEY` data must migrate lazily. No destructive migration.

The v3 reader accepts current fields:
- successes
- failures
- latencyMs
- lastSuccessAt
- lastFailureAt
- cooldownUntil
- lastStatus

New calculations derive a decayed health score from them first. Provider Health v2 may later add richer buckets without breaking v3.

## Functions to add/refine

Expected runtime primitives:

- `analyzeModelRequestV3(text, options)`
- `buildModelRankingContextV3(config)`
- `computeHealthSignalV3(model, now)`
- `scoreModelCandidateV3(model, context)`
- `rankModelCandidatesV3(models, context)`
- `applyRoutingHysteresisV3(ranked, currentModel, context)`
- `explainModelCandidateV3(model, context, scoreParts)`

Compatibility wrapper:
- existing `buildFreeRouteCandidates(config)` remains callable and delegates to v3.

## Tests

Deterministic tests must cover at minimum:

1. multi-intent coding + reasoning detection
2. ambiguous short request produces lower confidence
3. vision requirement prevents non-vision model from winning
4. insufficient context makes a model ineligible
5. recent repeated failures reduce health score more than old failures
6. 429 provider cooldown excludes provider
7. healthy near-tie keeps current model
8. clear score gap allows switching
9. manual mode remains authoritative subject to eligibility
10. fallback diversity remains provider-aware
11. explanation contains bounded non-secret reasons
12. no credential material appears in diagnostics
13. picker and Auto Routing derive from the same rank function

## Acceptance criteria

Model Intelligence v3 is complete only when:
- the normal routing path uses it;
- picker and Auto Routing agree for the same context;
- tests above pass;
- existing free-only and persistence tests remain green;
- no secret value is logged/exported;
- no external live-provider call is needed for deterministic tests;
- old health data remains readable;
- behavior is stable across reload.

## Implementation batch

Safe first batch:
1. add pure v3 analysis/scoring helpers;
2. delegate current free-route ranking to v3;
3. add hysteresis and explanations;
4. extend browser regression tests;
5. keep storage schema backward compatible.

Deferred to Provider Health v2:
- richer time buckets
- active probing
- EWMA samples per status family
- dedicated diagnostics UI
- persistent outcome-learning/kNN routing

## Completion record

- Implementation PR: #20
- Tested head SHA: `68e0d4616f625f637dd85dced50b7bb8f222a58b`
- CI run: Seven AI tests #2125 — PASS
- Squash merge SHA: `454c72ecab333938cc642b5ba0e63d27efc00f3e`
- Result: all deterministic and browser regression gates completed successfully before merge.
