# Seven AI — Capability 06 Adaptive Compute Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**  
Implementation status: **Deferred / partial foundation remains**

## Frozen target

**Seven Adaptive Compute 3.0 — Closed-Loop Marginal-Utility Compute Governor**

## Prime law

> Spend additional compute only when it has credible expected value, while mandatory correctness, authority, side-effect and verification floors are never traded away for speed.

## Final reconciled architecture

1. Adaptive Compute uses a multi-dimensional **BudgetVector**, not one canonical scalar tier.
2. FAST / STANDARD / DEEP / EXTREME may survive only as compatibility or UI summaries.
3. Reasoning, retrieval, context, tools, verification, candidate sampling, retries and concurrency are allocated independently.
4. Risk/consequence is separated from reasoning difficulty.
5. High consequence may raise verification floors without forcing long reasoning.
6. Mandatory authority, permission, side-effect, schema and verification floors are established before optimization.
7. Runs reserve protected verification and recovery/reconciliation compute before optional exploration.
8. Compute is allocated through bounded **ComputeLeases** with hierarchical parent/child reservations.
9. Children/parallel agents cannot mint or oversubscribe compute beyond parent reservations.
10. Ordinary allocation is cheap and local; no meta-LLM call is required on the hot path.
11. Initial allocation uses deterministic task features, known structural requirements, historical verified outcomes and the current ResourceEnvelope.
12. Allocation is closed-loop and is reconsidered only at meaningful checkpoints.
13. Checkpoint decisions include continue, deepen, broaden, shift, pivot, verify, early-exit and abandon-as-inconclusive.
14. Additional compute is governed by expected marginal verified utility, not by the existence of unused budget.
15. Diminishing returns and no-progress signals can terminate or pivot a run.
16. Model self-confidence alone is never enough to reduce required assurance or accept a result.
17. Early reasoning/entropy signals are supplementary only after calibration against task-difficulty baselines.
18. Early exit requires success criteria plus all mandatory verification/effect conditions.
19. Multiple candidates and parallel branches require expected benefit, selection/verification, reservation and bounded concurrency.
20. Tool calls are explicit compute resources; the planner may see a compact remaining-budget view but budget never grants tool authority.
21. Retrieval receives stage-specific budgets; query expansion, candidate generation, reranking and evidence expansion do not scale uniformly.
22. Verification escalates progressively from deterministic checks to expensive model critics only when justified.
23. The existing critic/attacker/judge arena becomes a selective Verification strategy rather than an automatic DEEP-tier consequence.
24. Adaptive Compute requests model quality/latency/capability classes; Model Fabric chooses eligible model/deployment routes.
25. Adaptive Compute may request context breadth/ceilings, but Context Fabric owns content selection and authority-safe compilation.
26. Resource Governor supplies device/resource ceilings and hysteresis; Adaptive Compute cannot override them.
27. Optional work may degrade under battery, memory, thermal, network or quota pressure, but mandatory correctness/effect floors do not silently degrade.
28. If mandatory floors cannot fit available resources, Seven returns truthful BLOCKED/INCONCLUSIVE/deferred state rather than fake success.
29. Mobile hot path has no always-on metareasoning, broad predictive background thinking or speculative large-model loading.
30. User intent such as FAST/AUTO/MAX_QUALITY is a preference/ceiling signal, not a permission or truth control.
31. MAX_QUALITY remains bounded by resources, provider limits, no-progress and diminishing-return rules.
32. A learned allocator is optional and must beat a permanent deterministic champion under held-out, multilingual and resource-diverse evals.
33. Learned policy rewards come from verified outcomes, never raw model confidence.
34. Learned policy lifecycle is shadow → canary → approved → drift monitor → rollback/quarantine.
35. Compute quality is evaluated on a Pareto frontier spanning verified success, latency, tokens/model calls, tools/network, verification cost and device impact.

## Canonical objects

- `ComputeRequest`
- `ResourceEnvelope`
- `BudgetVector`
- `ComputeLease`
- `BudgetLedger`
- `ComputeCheckpoint`
- `AllocationPolicy`

## Compute shapes

- `DIRECT`
- `REASONING_HEAVY`
- `RETRIEVAL_HEAVY`
- `CONTEXT_HEAVY`
- `TOOL_HEAVY`
- `VERIFICATION_HEAVY`
- `HYBRID`

These are descriptive shapes, not rigid presets.

## Mandatory protected reserves

Conceptual partitions:

- execution budget
- verification reserve
- recovery/reconciliation reserve
- optional exploration reserve

Optional reasoning/search cannot silently consume the verification or recovery reserve.

## Closed-loop checkpoint actions

- `CONTINUE`
- `DEEPEN`
- `BROADEN`
- `SHIFT_BUDGET`
- `PIVOT`
- `VERIFY_NOW`
- `EARLY_EXIT`
- `ABANDON_AS_INCONCLUSIVE`

## No-progress signals

At minimum evaluate:

- repeated plans
- repeated equivalent tool calls
- repeated unchanged failures
- verifier/evidence plateau
- strategy oscillation
- repeated candidates without new independent evidence
- budget burn without success-criterion progress

## Research decisions retained

The freeze integrates these findings:

- compute-optimal test-time scaling depends on task difficulty;
- no single test-time scaling regime universally dominates;
- fixed or uniform budgets cause overthinking/underthinking;
- budget-aware tool use matters more than simply raising tool-call ceilings;
- stage-specific retrieval allocation is superior to blindly scaling every stage;
- cheaper/discriminative verification can be more compute-efficient than always using generative judges;
- dynamic early exit can reduce reasoning waste, but must be validated per model/task;
- early trajectory signals can be confounded by problem difficulty and therefore require controlled calibration.

## Implementation sequence

- **AC-P0** schemas and compatibility projection
- **AC-P1** mandatory floors vs optional optimization
- **AC-P2** deterministic champion allocator
- **AC-P3** hierarchical leases/reservations/ledger
- **AC-P4** checkpoints, no-progress, bounded escalation and early exit
- **AC-P5** Cognitive/Model/Context handshakes
- **AC-P6** tool/retrieval/verification stage budgets
- **AC-P7** Resource Governor/mobile/cancellation integration
- **AC-P8** Pareto eval harness
- **AC-P9** optional learned allocator shadow/canary
- **AC-P10** adversarial, multilingual, long-run and Android resource gates

## Freeze boundary

This record freezes architecture for the Ultimate Polish campaign only.

It does **not** claim AC-P0 through AC-P10 are implemented or that current runtime behavior already matches this design.

Implementation remains partial until normal-flow wiring, failure/recovery behavior, deterministic evidence, real provider/device tests and campaign-level cross-system reconciliation are complete.