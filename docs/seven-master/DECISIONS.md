# Seven AI — Architecture Decision Log

## ADR-001 — GitHub is the Source of Truth
Status: Accepted
Decision: Multi-chat work is coordinated through repository documentation and code, not chat memory alone.

## ADR-002 — One Primary Subsystem per Specialist Chat
Status: Accepted
Decision: Specialist chats own focused domains to reduce context pollution and conflicting assumptions.

## ADR-003 — Shared Contracts Are Explicit
Status: Accepted
Decision: Cross-system interfaces are documented in INTEGRATION_CONTRACTS.md and cannot be silently changed.

## ADR-004 — Coding Before Self-Development
Status: Accepted
Decision: The Coding System must be robust and verified before autonomous/self-development features depend on it.

## ADR-005 — Verification Is Mandatory
Status: Accepted
Decision: No subsystem is marked complete from implementation alone; tests and regression evidence are required.

## ADR-006 — Self-Development Is an Evidence-Gated Experiment Controller
Status: Accepted
Date: 2026-10-05
Decision: Seven Self-Development may observe, diagnose, research, hypothesize, prioritize and request candidate work, but production mutations must go through the authoritative Coding System. A self-development model or critic cannot certify its own improvement. Promotion requires baseline/candidate identity, locked evaluation, comparable evidence, hard regression gates and rollback readiness.
Affected systems: Coding System, Tools, Memory, Model Routing, Web Research, Eval/Verification, GitHub integration, Self-Development.

## ADR-007 — Evaluator Plane Is Immutable During Candidate Evaluation
Status: Accepted
Date: 2026-10-05
Decision: Evaluators, benchmark manifests, baselines, constitution, judge rules, acceptance policy and protected-path policy cannot be changed by the candidate they judge. Changes to the evaluator/Self-Development plane are CRITICAL governance changes and require separate review and adversarial verification.
Reason: Prevent reward hacking, test weakening, silent success-criteria drift and recursive self-certification.
Affected systems: Evolution Core, Eval harness, Coding System, CI, Self-Development.

## ADR-008 — Self-Development Telemetry Is Content-Minimized by Default
Status: Accepted
Date: 2026-10-05
Decision: Observation records store structured metrics, categorical failure classes, IDs and evidence references. Prompt/response content and secrets/credentials are forbidden by default. Raw diagnostic material, when explicitly required, must remain separately redacted and permission-scoped.
Affected systems: Observability, Model Routing, Memory, Tools, Search, Coding, Android diagnostics.
