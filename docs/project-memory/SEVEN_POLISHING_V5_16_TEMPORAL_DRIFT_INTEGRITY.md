# Seven Polishing V5.16 — Temporal Drift Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.15 Statistical Selection Integrity

V5.16 hardens improvement claims against time, user, provider, model, tool, workload and environment drift.

## Prime law
Evidence is valid for an environment envelope and time interval, not forever.

## Requirements
1. Evidence timestamp and freshness class for every promotion-critical result.
2. Drift dimensions: user/workload distribution, model/provider revision, tool schema, platform/OS, network behavior, device class, locale, data corpus and policy/configuration.
3. Drift-trigger map: each material dependency declares which evidence families become stale when it changes.
4. Temporal replication: important claims are rechecked at later checkpoints when the relevant environment is nonstationary.
5. Population-shift review: benchmark/user/task distributions are compared before broad claims are carried forward.
6. Slice drift: monitor whether previously small slices become material or whether formerly representative slices disappear.
7. Provider substitution test: claims that depend on provider behavior are not automatically transferred to a replacement provider or model revision.
8. Schema/version compatibility: tool/API changes trigger targeted revalidation rather than inherited PASS.
9. Device/OS drift: Android/platform changes revalidate affected lifecycle, performance, permission, storage and rendering claims.
10. Locale drift: Arabic/RTL and other locale-sensitive claims retain explicit environment binding.
11. Data-age review: research/retrieval/canon evidence depending on changing external facts receives freshness semantics.
12. Performance drift: latency, memory and resource baselines are versioned; later regressions cannot hide behind old measurements.
13. Drift budget: tolerated variation is specified for stable claims, while structural drift forces a new comparison epoch.
14. Change-point handling: abrupt behavior shifts are not averaged away into long historical means.
15. Rolling confirmation: staged production-like evidence, when available, uses recent windows while retaining historical context.
16. Catastrophic forgetting check: recursive generations retain previously demonstrated capability families unless explicitly retired.
17. Drift-aware saturation: two NO_MATERIAL_IMPROVEMENT challenges do not count if the environment changed materially between them without revalidation.
18. Evidence expiration: expired evidence may inform research but cannot independently authorize promotion.
19. Drift provenance: the system records what changed, when, why it matters, and which claims are invalidated.
20. Conservative inheritance: unknown drift reduces claim scope instead of silently inheriting historical certainty.

## Saturation
V5.15 is NOT saturated. V5.16 resets saturation to 0/2.

## Truth boundary
Architecture only. No production drift detector, change-point detector, rolling-evaluation service or automated evidence-expiration runtime is claimed implemented.