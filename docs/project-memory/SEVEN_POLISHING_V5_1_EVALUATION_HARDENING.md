# Seven Polishing V5.1 — Evaluation Hardening

Status: ARCHITECTURE_CANDIDATE
Parent: Seven Polishing V5

## Core upgrade
A candidate is not better because one score increased. Promotion evidence must cover the outcome, the execution path, transfer, repeatability, deployment realism, resource cost and evaluator reliability when those dimensions matter.

## Oracle hierarchy
Prefer the strongest available oracle for each claim:
1. deterministic or formal check
2. executable state/replay/simulator check
3. invariant, property or metamorphic check
4. independent structured judge with locked rubric
5. multi-judge disagreement analysis
6. self-assessment only as weak diagnostic evidence

A weaker oracle cannot silently override a contradictory stronger oracle.

## Trajectory evidence
Agentic evaluation can bind initial state, actions, tool calls, intermediate state changes, evidence consulted, authority decisions, retries, replanning, side-effect attempts and final state. A correct-looking final answer does not erase an invalid path.

Tests should include silent faults where the visible outcome survives despite an internal mistake, so judges are measured on process validity as well as visible success.

## Stochastic consistency
When repeatability matters, use repeated trials rather than a single PASS. Report success distribution, variance, tail failures, flaky dependency rate and environment sensitivity.

## Realized tool utility
Static tool quality and actual agent utility are separate. A useful tool only counts as an agent improvement when the agent invokes it appropriately, interprets it correctly, avoids noise traps and improves the target workflow.

## Evaluation realism
Relevant campaigns include representative state, tools, timing and resource conditions. Synthetic success cannot silently claim deployment equivalence.

## Contamination ledger
Evaluation families carry exposure state: PUBLIC, DEVELOPMENT, SHADOW, HOLDOUT, RELEASE, SUSPECTED_EXPOSURE, CONFIRMED_EXPOSURE or UNKNOWN. Material leakage weakens the allowable claim and requires replacement or independent evidence.

## Rotating holdouts
After promotion, future hidden cases rotate or expand. The Builder receives bounded diagnostic classes rather than future case details.

## Orthogonal evaluator jury
High-materiality candidates should face different evaluator families where feasible: correctness, trajectory/process, authority, resources, robustness/transfer, localization/accessibility and expert product quality. Correlated judges do not count as independent evidence merely because several outputs agree.

## Judge calibration
Before high-materiality promotion, evaluator behavior is checked using known-good, known-bad, overfit, mutation-generated and simpler-equivalent candidates. If calibration is unreliable, promotion pauses.

## Evaluator firebreak
The Builder cannot edit, replace or tune the final evaluator after candidate outcomes are known. Evaluator changes require a separate governance record and invalidate affected comparisons.

## Generation escrow
Before evaluation, lock the target contract, incumbent identity, candidate identities, evaluator versions, benchmark identities, rubric/scoring rules, environment envelope, resource envelope and promotion thresholds. Changing these after results creates a new comparison.

## Evidence debt
Fast iteration may defer expensive evidence only when allowed by criticality. Deferred evidence is explicit EvidenceDebt and cannot cross a promotion/release boundary that requires it.

## Capability debt
Feature gain that adds fragility, unsupported environments, excessive state or maintenance burden creates CapabilityDebt and participates in promotion economics.

## Attribution and transfer
Large bundles use differential/ablation checks where practical. If a gain cannot be isolated, the claim belongs to the bundle. Transfer labels are BENCHMARK_LOCAL, ENVIRONMENT_BOUND, ADJACENT_TRANSFER, MULTI_ENVIRONMENT_TRANSFER and RELEASE_OBSERVED.

## Plateau detector
Repeated tiny gains, oscillation, growing complexity for negligible value or persistent evaluator disagreement trigger plateau review rather than forced recursive continuation.

## Anti-Goodhart signals
Investigate instead of auto-promoting when public metrics rise while hidden metrics stagnate, process faults rise despite outcome gains, evaluator families disagree, resource cost explodes, transfer fails, or behavior changes sharply between obvious evaluation and representative conditions.

## Hostility ratchet
Each promoted generation hardens at least one relevant dimension such as hidden novelty, silent-fault detection, evaluator calibration, repeatability, deployment realism, transfer distance, fault injection, resource stress or interruption recovery.

## Truth boundary
V5.1 is an architecture candidate only. It does not claim runtime implementation or empirical superiority over V4.4.