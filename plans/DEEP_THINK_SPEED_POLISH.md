# Deep Thinking Speed Polish — Detailed Plan

Date: 2026-10-02
Status: ACTIVE
Milestone: Seven AI 2.1.x — post-polish latency pass
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Goal

Make Deep Thinking return the final answer as quickly as possible without removing Deep Think's functional guarantees.

Deep Think remains:
1. a dedicated internal reasoning pass;
2. followed by a separate final-answer pass;
3. strongest supported reasoning effort for the reasoning pass;
4. health/fallback aware;
5. cancellable;
6. compatible with Search, Memory, Coding, RPG, attachments/context, and manual/auto routing.

This pass optimizes latency, not by disabling reasoning stages, but by removing avoidable work and making routing/budgets latency-aware.

## User-visible objective

Primary metric: time from Send → first useful final-answer token.

Secondary metrics:
- internal reasoning pass duration
- final generation time-to-first-token
- total request duration
- fallback delay
- number of provider attempts
- hidden reasoning output tokens/budget

No raw chain-of-thought is exposed.

## Speed Pillar

Speed becomes an explicit routing dimension for Deep Thinking rather than an incidental model metadata field.

The Deep Think route must balance:
- reasoning fitness
- model quality
- provider health
- real observed latency
- context headroom
- quota pressure
- speed

Manual mode still respects the user's selected model when it is healthy and eligible. Auto mode may choose the fastest strong reasoning route.

## Phase A — Critical-path timing

Add safe local timing diagnostics:
- contextMs
- deepThinkMs
- finalFirstTokenMs
- finalTotalMs
- totalMs
- route attempts
- selected deep route/final route identifiers

Diagnostics must not contain prompts, responses, API keys, headers, or chain-of-thought.

Purpose: prove future optimizations reduce latency instead of guessing.

## Phase B — Deep Think Fast Lane v1

### B1. Compact internal reasoning brief

Replace the verbose scratch prompt that asks for long step-by-step prose with a compact internal brief.

The internal pass still performs the same functions:
- analyze the request
- identify constraints/assumptions
- check edge cases
- choose an approach
- note uncertainty
- verify likely mistakes

But its output is a concise decision brief for the final model, not a long narrated chain-of-thought.

This reduces generated hidden tokens and therefore latency.

### B2. Adaptive hidden-output budget

Do not always allocate the model's full output ceiling to the hidden pass.

Use deterministic request complexity:

- low: ~1.2K hidden output tokens
- medium: ~2.4K
- high: ~4.8K
- very long / research-heavy: up to ~8K

Always clamp to the selected model's supported maximum.

The final answer keeps the user's normal output budget.

### B3. Speed-aware Deep Think routing

For the internal pass only:
- keep reasoning/quality/capability gates;
- add explicit latency priority;
- use Provider Health v2 EWMA latency;
- preserve context-window and required-capability hard gates;
- preserve free-only policy;
- preserve manual model preference semantics.

Auto Routing should prefer a slightly faster model when reasoning quality is effectively tied.

### B4. Faster slow-route escape

Deep Thinking receives a purpose-specific provider timeout policy.

Target:
- low complexity: 25s
- medium: 35s
- high: 45s

A timeout is classified by Provider Health v2 and normal fallback continues.

This reduces pathological stalls without changing normal successful routes.

### B5. No duplicate critical-path work

Ensure Deep Think does not:
- rerun Memory retrieval;
- rerun Web Search;
- rebuild the canonical context twice;
- run title generation synchronously;
- perform UI-only work on the critical path.

The reasoning pass consumes the already-built context. Final generation reuses it plus the compact reasoning brief.

## Phase C — Perceived latency

- Create the assistant response bubble before the hidden pass.
- Show a lightweight stage state in that same response surface:
  - Preparing context
  - Reasoning
  - Answering
- Remove the extra temporary system-message DOM churn.
- First final token replaces the stage indicator immediately.

This does not fake progress and does not expose hidden reasoning.

## Phase D — Tail latency

After Fast Lane v1 metrics exist:

1. adaptive fallback margin based on Provider Health v2;
2. avoid a known-degraded provider for the hidden pass;
3. optional hedged request only if:
   - Auto mode;
   - no partial output;
   - quota pressure is normal;
   - first route exceeds a measured latency threshold.

Hedging is deferred until evidence shows it is needed because it can double provider usage.

## Phase E — Deep Think cache for safe repeats

Optional later optimization:
- cache only the compact internal brief;
- key by normalized request/context/model-policy hash;
- short TTL;
- never persist credentials;
- invalidate on room/context/memory/search evidence changes.

Useful for Regenerate/retry of the exact same request.

## Functional invariants

The speed pass must NOT:
- disable the hidden reasoning pass;
- lower reasoning_effort below the strongest supported level for Deep Think;
- remove Search/Memory/context;
- expose chain-of-thought;
- silently switch to paid models;
- retry after partial streamed final output;
- weaken Stop/cancellation;
- bypass provider health/cooldown;
- mutate canonical conversation earlier than the verified final answer path.

## Tests

1. Deep Think still performs two model calls.
2. reasoning effort remains strongest supported effort.
3. hidden budget is lower than full ceiling for low/medium requests.
4. high-complexity requests receive a larger hidden budget.
5. final response retains the normal user max-token budget.
6. Deep Think route has latencyPriority enabled.
7. manual mode preserves selected-model preference when eligible.
8. Auto mode may prefer a faster near-tied reasoning route.
9. Provider Health v2 latency affects the Deep Think ranking.
10. purpose-specific timeout is bounded by complexity.
11. timeout still enters normal fallback.
12. Search results are reused, not repeated.
13. Memory context is reused, not repeated.
14. Stop cancels Deep Think/final generation as before.
15. no chain-of-thought is rendered into the UI.
16. diagnostics contain no prompt/response/secret data.
17. existing Model Intelligence, Provider Health, Memory, UI, performance, RTL and Android browser gates remain green.

## Acceptance criteria

Fast Lane v1 is complete when:
- Deep Think keeps the same functional two-pass architecture;
- hidden reasoning output is compact and adaptively budgeted;
- Auto routing explicitly values speed/observed latency for the hidden pass;
- fallback does not wait the generic timeout for every complexity class;
- full browser CI passes;
- Android workflow passes after merge;
- timing diagnostics can quantify latency without sensitive content.

## Implementation order

1. Phase A timing instrumentation
2. Phase B1 compact brief
3. Phase B2 adaptive hidden budget
4. Phase B3 speed-aware route
5. Phase B4 timeout policy
6. Phase C single-surface progress UI
7. CI + Android gate
8. Only then evaluate Phase D hedging from measurements
