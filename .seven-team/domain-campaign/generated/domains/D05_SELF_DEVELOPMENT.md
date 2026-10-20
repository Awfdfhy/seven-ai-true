# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: READY

DOMAIN_ID=D05_SELF_DEVELOPMENT
SOURCE_ANALYSIS=[SOURCE primary] https://github.com/SWE-agent/SWE-agent | Self-improving loop ideas (learn from trajectories) but needs safety. [SOURCE primary] https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents | Custom agents as programmable behavior. [SOURCE primary] https://mas.owasp.org/MASVS/ | Mobile security baseline (relevant if self-dev touches Android paths). [SOURCE primary] https://opentelemetry.io/docs/specs/semconv/ | Observability/telemetry semantics for tracing self-development actions. Collected: 14 sources. Focus on autonomous evolution with guardrails.
CURRENT=Assignment says B06 owns self-development. Repo has `.seven-team/autonomy/` (mentioned in instructions) - need to inspect. Architecture preserved. No obvious self-modifying code paths visible in quick scan; likely conceptual/early stage. Evidence: PARTIAL.
TARGET=Safe self-development: (1) capability discovery, (2) bounded self-improvement proposals (diff-only, reviewable), (3) proof-carrying changes (invariants touched, evidence level), (4) rollback/recovery, (5) observability (traces/metrics), (6) constitution compliance (must not modify constitution/proof policy/judge rules/baselines/evaluator-plane). Human approval gates for high-impact changes.
NOW=Inspect `.seven-team/autonomy/` for contracts/policies. Read `remake/ARCHITECTURE.md` fully for constraints. Identify existing guardrails and "do not modify" lists. Map git state (branches, SHAs) for recovery context.
NEXT=Define self-dev loop (observe→propose→verify→apply→validate) with hard stops. Add invariant checker, evidence-level tracking, diff budget. Implement recovery playbook (exact SHA revert, workspace reset). Add telemetry per semconv where applicable.
LATER=Learned policies from trajectories, but only with sandboxed eval and proof requirements. Capability gating by domain.
TESTS=Deterministic: invariant violations block apply, diff budget enforced, rollback restores SHA. E2E: propose safe change with proof, blocked by policy. Adversarial: attempt to modify protected files (constitution/policy) - must be rejected. Security: secret handling per MASVS principles.
RISKS=Self-modification risk. Must strictly follow "do not modify constitution, proof policy, judge rules, baselines, or evaluator-plane controls". Android/mobile paths need MASVS awareness. Telemetry must not leak secrets (OTel semconv guidance). Recovery is critical.
FIRST_SLICE=Read-only inventory of autonomy contracts + protected paths. Create recovery checklist (exact SHA capture, working tree state). Define proof template (invariants, evidence level, UNPROVEN). No self-modification.
KNOWN_UNKNOWNS=What exists in `.seven-team/autonomy/`. Exact protected file list. Current approval gates. Whether any self-dev exists.
DOMAIN_VERDICT=READY_FOR_PLAN
