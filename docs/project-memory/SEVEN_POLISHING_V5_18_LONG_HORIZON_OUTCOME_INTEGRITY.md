# Seven Polishing V5.18 — Long-Horizon Outcome Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.17 Deployment Observation Integrity

V5.18 hardens improvement claims against delayed regressions, cumulative state/resource debt, feedback loops and adaptation effects that do not appear during short evaluations.

## Prime law
A short clean window cannot prove long-horizon stability.

## Requirements
1. Horizon classes: claims declare whether evidence covers immediate, session, multi-session, multi-day or longer behavior where relevant.
2. Cumulative-state review: memory, indexes, caches, histories, logs, queues and persistence growth are evaluated for bounded behavior.
3. Resource-debt tracking: RAM, storage, network, token/context, battery and background-work costs are checked for accumulation rather than single-run peaks alone.
4. Retry/deferred-work debt: backlogs, repeated retries and postponed reconciliation cannot grow invisibly across sessions.
5. Recovery-after-age: recovery tests include aged state rather than only newly created clean state where material.
6. Migration-chain integrity: repeated upgrades/migrations are evaluated across realistic version paths, not only latest-from-clean install.
7. Delayed-effect review: failures that emerge after caches warm, histories grow, summaries compact, permissions change or providers drift receive explicit scenarios.
8. User-behavior feedback: deployment can change how users interact with the system; broad claims are rechecked when usage patterns materially shift.
9. Adaptation feedback: routing, caching, personalization or learning mechanisms are checked for feedback loops that amplify early errors or narrow future evidence.
10. Long-session degradation: latency, memory, UI responsiveness, context quality and correctness are evaluated over extended sessions on representative device tiers.
11. Data-retention correctness: deletion, revocation and expiry continue to hold after compaction, restart, migration and long retention periods.
12. Regression accumulation: many individually small regressions cannot evade review merely because each is below a single-change threshold.
13. Maintenance burden over time: recurring manual intervention, calibration or cleanup needed to sustain the gain is counted as durability cost.
14. Dependency aging: external contracts and integrations receive periodic revalidation according to their change rate and criticality.
15. Delayed rollback limits: if rollback becomes harder after data/schema/state evolves, the reversible window is explicit and promotion scope reflects it.
16. Long-horizon baseline: the incumbent is measured over the same horizon where practical, avoiding unfair comparison of aged candidate to fresh baseline or vice versa.
17. Temporal confound disclosure: unrelated environmental changes during long evaluations are recorded rather than silently attributed to the candidate.
18. Sustained-gain check: improvements that vanish after adaptation, warm state or realistic workload duration are downgraded to short-horizon gains.
19. End-of-life path: new mechanisms specify cleanup, migration or retirement semantics so abandoned state does not become permanent product debt.
20. Horizon-aware verdict: promotion records the longest horizon actually evidenced; it does not imply indefinite stability.

## Saturation
V5.17 is NOT saturated. V5.18 resets saturation to 0/2.

## Truth boundary
Architecture only. No long-duration runner, retention simulator, multi-version migration harness or production feedback-loop detector is claimed implemented.