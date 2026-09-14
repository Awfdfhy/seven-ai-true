# Seven Polishing V5.30 — Intervention Backfire Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.29 Reliability Regime Integrity

V5.30 prevents helper mechanisms from being credited as improvements merely because they are more sophisticated or improve a narrow benchmark.

## Prime law
An intervention must prove net benefit across the scope it claims; added intelligence can create new failure modes.

## Requirements
1. Intervention Identity: every material helper records the exact mechanism being added or changed.
2. Mandatory Ablation: compare the full candidate against a version with the intervention disabled where practical.
3. Negative-Transfer Search: test whether an intervention that helps one domain, horizon, locale, or resource regime hurts another.
4. Horizon Interaction: evaluate whether the intervention changes reliability decay or late-stage behavior, not only short-task success.
5. Complexity Cost: state, latency, RAM, storage, network, battery, migration, and maintenance costs remain explicit.
6. Recovery Interaction: verify that added helpers do not make recovery harder, slower, or less semantically complete.
7. Authority Interaction: helpers cannot silently create new authority paths through cached, summarized, or delegated state.
8. Context Interaction: memory/context helpers are checked for stale retrieval, overcompression, duplication, and noise accumulation.
9. Retry Interaction: retry helpers are checked for repeated work, duplicated effects, queue growth, and hidden cost inflation.
10. Tool Interaction: routing/planning helpers are checked for unnecessary tool use and added coordination overhead.
11. Simpler-Alternative Duel: compare against the simplest intervention capable of producing the claimed gain.
12. Benefit Persistence: important gains are rechecked after fresh runs, changed seeds, and relevant environment shifts.
13. Removal Test: if removing the helper leaves the claimed benefit unchanged, the helper cannot receive causal credit.
14. Portfolio Conflict: interventions are evaluated together when individually positive changes may interact negatively.
15. Retirement Rule: interventions whose ongoing cost exceeds durable value can be demoted or removed without treating removal as regression.

## Saturation
V5.29 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No intervention-ablation runtime, negative-transfer harness, or automatic retirement engine is claimed implemented.