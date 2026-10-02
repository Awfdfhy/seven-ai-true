# Web Search v2 — Batch 8: Live Quality Hardening

Date: 2026-10-02
Status: PLANNED — begins after Batch 7 Android gate
Parent: WEB_SEARCH_OVERHAUL_V2.md
Depends on: Batches 1–7 complete

## Objective

Move Web Search v2 from architectural correctness to retrieval-quality correctness.

Batch 8 measures and hardens whether Seven:
- asks the right searches;
- retrieves authoritative/current evidence;
- reads the best pages;
- avoids redundant/SEO-heavy evidence;
- cites claims with sufficient support;
- stops early when evidence is sufficient;
- reports PARTIAL/INCONCLUSIVE instead of bluffing.

No single opaque quality score is allowed. Quality remains decomposed.

## 1. Live quality benchmark

Add an opt-in/non-release-blocking live evaluation suite separate from deterministic CI.

Evaluation families:
- Arabic current fact
- English current fact
- official technical documentation
- current software/model availability
- comparison with two independent sides
- ambiguous entity
- recent announcement/news
- evergreen reference fact
- conflicting current reports
- niche technical question
- Arabic-primary-source topic
- no-good-result / blocked-reader case

Each fixture declares expected evidence properties rather than one exact URL.

## 2. Metrics

Per query:
- relevant-source recall
- primary/docs source presence
- current-source presence when time-sensitive
- unique-host diversity
- duplicate rate
- read-success rate
- snippet-only dependence
- stale-evidence rate
- citation coverage
- unsupported-citation rate
- contradiction detection
- evidence sufficiency decision
- search latency
- reader latency
- total research latency

Aggregate p50/p90 separately. Do not average away catastrophic misses.

## 3. Source-quality hardening

Introduce bounded spam/SEO heuristics:
- title/query keyword stuffing
- excessive tracking/canonical anomalies
- thin snippets
- repeated near-identical syndicated content
- suspicious host repetition

These are ranking penalties, never automatic truth labels.

Boost source-type appropriateness by intent:
- technical/API → official documentation
- current product/model → official announcement + independent corroboration
- academic → paper/institution/review
- current event → primary/current + reputable independent report
- community experience → community may be intentionally relevant

## 4. Authority discovery

When intent requests primary/documentation evidence and none appears:
- issue one bounded authority-targeted query;
- use domain hints only when derived from already discovered canonical/official evidence;
- never infer "official" merely from search rank.

## 5. Freshness hardening

For time-sensitive intent:
- require at least one current/recent evidence unit where possible;
- stale-only evidence cannot yield SUFFICIENT unless the question itself targets history;
- distinguish publication date, update date, and fetch date;
- unknown date is not treated as current.

## 6. Evidence diversity

Context selector prevents:
- one host dominating the evidence bundle;
- multiple syndicated copies consuming context;
- encyclopedia/reference sources crowding out primary evidence.

Preserve corroboration metadata even when duplicate content is suppressed.

## 7. Reader prioritization

Read budget should prioritize:
1. likely primary/docs source
2. highest relevance independent source
3. freshness-critical source
4. conflict/counterevidence source

Do not spend page-read budget simply by raw search rank.

## 8. Adaptive stopping

Normal Search stops early when:
- coverage sufficient;
- required primary/current evidence exists;
- no unresolved strong conflict;
- minimum source diversity met.

Deep Research continues only for explicit weak coverage/gaps.

This is a speed improvement and a quality improvement.

## 9. Citation integrity hardening

Audit final answer:
- every [S#]/[R#] exists;
- citations do not reference blocked/failed evidence as read;
- factual paragraphs with externally derived claims have evidence;
- source cards preserve exact citation IDs;
- unknown/unsupported citation IDs are stripped/flagged before persistence.

## 10. Arabic quality

Arabic query path must preserve:
- Arabic primary query;
- Arabic Wikipedia/Arabic sources where relevant;
- English technical/entity expansion when useful;
- Arabic source evidence must not be downranked solely for language.

Add Arabic-specific token normalization for common punctuation/diacritics without destructive stemming.

## 11. Gateway backend health

Track metadata-only backend health:
- search success/failure
- p50/p90 latency
- empty-result rate
- reader success/block rate

If a general backend is degraded:
- retain knowledge adapters;
- label capability truthfully;
- avoid long waits;
- do not claim full-web coverage.

No queries/page bodies stored in health telemetry.

## 12. Quality diagnostics UI

Optional diagnostics expose:
- source-type distribution
- freshness distribution
- unique hosts
- read/snippet ratio
- primary-source presence
- gap/conflict state
- stage p50/p90 from local session

Default user UI stays compact.

## 13. Tests

Deterministic:
- intent-appropriate source boosts
- SEO/spam penalty bounded
- host diversity
- stale-only current query not SUFFICIENT
- unknown date not current
- primary-source missing triggers <=1 targeted query
- reader priority follows evidence need, not raw rank
- citation IDs valid after synthesis
- Arabic normalization preserves entity tokens
- backend health contains no query/page/secret data
- early stop never fires with unresolved strong conflict

Live/non-blocking:
- benchmark suite records decomposed metrics
- no secret echo
- no full page-body persistence
- failures reported by category

## Acceptance

Complete when:
- deterministic CI is green;
- Android API 36 gate is green;
- live evaluator can be run without changing release behavior;
- Search/Research quality can be compared across commits using decomposed metrics;
- no new unlimited query/read loops are introduced.
