# Seven Polishing V5.35 — Environment Replay Fidelity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.34 Executable Invariant Proof

V5.35 reconciles two competing needs: reproducible evaluation and realistic live environments.

## Prime law
Replay evidence and live-world evidence answer different questions; neither may silently substitute for the other.

## Requirements
1. Dual Evidence Lanes: distinguish reproducible replay/snapshot evaluation from live-environment evaluation.
2. Environment Identity: record application/site/API versions, seedable state, locale, timezone, dependency versions, and relevant configuration.
3. Snapshot Provenance: replay artifacts retain source time, collection method, schema, and transformation lineage.
4. Replay Fidelity: validate that replayed behavior preserves the properties relevant to the claim.
5. Live Drift Ledger: live runs record material page, API, data, provider, and workflow changes encountered over time.
6. Replay-vs-Live Comparison: important workflows periodically compare replay performance with live performance to detect simulator/replay drift.
7. Non-Replayable Effects: actions or external events that cannot be safely reproduced are labeled and evaluated through alternative evidence.
8. Temporal Event Fidelity: timeouts, deadlines, asynchronous arrivals, expiry, and wait conditions are represented where material.
9. Network/Provider Conditions: latency, unavailability, rate changes, and degraded responses may be replayed only when the model is validated for those conditions.
10. State Reset Semantics: benchmarks define exactly what state resets between runs and what state legitimately persists.
11. Determinism Boundary: deterministic replay does not imply deterministic production behavior.
12. Reproduction Capsule: a material result records enough environment and state identity to reproduce it within the supported lane.
13. Environment Coverage: broad deployment claims require more than one narrow replay environment when real deployment is heterogeneous.
14. Drift Invalidation: material live-world change invalidates affected replay claims until bridge evidence is collected.
15. Cost Split: reproducibility infrastructure cost and live-evaluation cost are tracked separately for V4.4 scheduling.
16. Release Claim Ceiling: replay success can support regression confidence; live/deployment claims require appropriate live or bridged evidence.

## Saturation
V5.34 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No record/replay engine, live-world evaluator, or environment snapshot system is claimed implemented.