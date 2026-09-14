# Seven Polishing V5.5 — Systems Proof

Status: ARCHITECTURE_CANDIDATE
Parent: V5.4

V5.5 evaluates improvement as a complete interacting system rather than a set of separately passing components.

## Core laws
- Integration evidence is required for promotion-critical subsystem interactions.
- Boundary transitions must be tested explicitly where relevant.
- Long-horizon invariants outrank single-step success.
- Recovery must preserve semantic correctness, not merely restore a usable UI.
- Conflicting copies of state must be identified and reconciled by authority rules.
- Resource pressure must degrade capability gracefully without corrupting truth or authority.
- Performance claims must include long-session and tail behavior when measurable.
- Stochastic/concurrent evaluations must declare repetition and variance expectations.
- Promotion-critical evidence must retain subject, environment, evaluator/tool identity, inputs, freshness, and lineage.
- Critical unknown assumptions block dependent promotion claims.

## Systems interaction matrix
For material subsystem pairs or clusters, create interaction cases across persistence, recovery, tools, providers, context, memory, cancellation, streaming, imports, migrations, Android lifecycle, permissions and resource governance. Isolated component PASS cannot prove coupled correctness.

## Boundary transitions
Target transitions such as before/after commit, current/stale revision, online/offline, foreground/background, process restart, low/high resource pressure, LTR/RTL, day/night and reduced/full motion where applicable.

## Temporal invariants
Long sequences test that authority does not increase accidentally, revoked state does not reappear, derived state does not overwrite canonical truth, uncertain real-world effects are not blindly retried, and recovery does not discard lineage or uncertainty.

## Recovery equivalence
After a recoverable interruption, recovered state must correspond to an allowed semantic state of uninterrupted execution or be explicitly marked degraded/uncertain. Cosmetic recovery is insufficient.

## State-copy audit
Search UI state, persistent stores, caches, summaries, indexes, session state and recovery snapshots for conflicting copies. A stale copy capable of overwriting more authoritative state is a material defect.

## Resource-pressure ladder
Evaluate behavior as memory, storage, CPU, network, context and provider budgets tighten. The goal is predictable degradation, not survival under impossible conditions.

## Tail and variance discipline
Where sample size supports it, record tails, high-water marks, queue growth, retry amplification and long-session degradation. Stochastic or concurrency-sensitive claims require repeated trials and stated variance rules.

## Assumption ledger
Classify assumptions as VERIFIED, ENVIRONMENT_BOUND, PLAUSIBLE_UNVERIFIED or UNKNOWN. Claims may not outrun the weakest critical assumption on which they depend.

## Promotion rehearsal
Before future canonical adoption, rehearse promotion and rollback in a non-authoritative slot. Verify version binding, migration expectations, evidence attachment and rollback integrity.

## Complexity gate
Added architecture creates recurring maintenance, test, state, migration, resource and interaction costs. Narrow gains cannot justify unbounded complexity.

## Cross-generation ratchet
Each recursive generation must retain or explicitly replace previous protections with equal-or-stronger demonstrated coverage.

## Saturation
Saturation requires two independent consecutive NO_MATERIAL_IMPROVEMENT challenges under a fixed evaluation constitution. At least one challenge must focus on simplification, interactions and unknown-unknown discovery rather than repeating benchmark attacks. Any material constitution change resets the count.

## Materiality
The 200% Materiality rule remains a step-change class. Literal 2x applies only to valid ratio metrics; non-ratio quality requires categorical or multi-axis evidence.

## Truth boundary
Architecture only. This document does not claim the corresponding runners, Android pressure harness, evidence verifier, promotion rehearsal, or rollback automation are implemented.