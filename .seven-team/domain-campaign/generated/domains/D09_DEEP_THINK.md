# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK

SOURCE_ANALYSIS=The harvested evidence collectively points to two canonical evaluation axes relevant to deep-think/planning/verification/progress: (1) tool/function calling reliability and (2) end-to-end software engineering ability under deterministic harnesses.

Primary sources:
- [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard (BFCL V4) — measures function/tool calling (multi-turn/tool use correctness, hallucination resistance, execution-grounded success). Signals: structured planning that produces valid, executable calls; error recovery; verification via execution outcomes.
- [SOURCE primary] https://www.swebench.com/ (SWE-bench leaderboards + pages) — evaluates agents on real GitHub issues/PRs with test harnesses (pass@... against hidden tests). Signals: plan decomposition, incremental verification, context discipline, regression avoidance.
- [SOURCE primary] supporting assets (CSS/ICO/index/original) — UI scaffolding only; no methodological content.

Disagreements/freshness/limitations:
- BFCL emphasizes call-schema correctness and execution-grounded scoring (narrower, repeatable). SWE-bench emphasizes repo-scale reasoning, scope discipline, and integration (broader, noisier). They are complementary, not identical.
- Freshness: leaderboard pages are live (JS present) but harvested text is static snapshot; no commit/version labels visible in harvest. Treat benchmark numbers as time-sensitive.
- Limitations: harvested evidence is page-level (no deep papers, no exact subset definitions beyond names). No evidence of “two-pass orchestration”, “planner isolation”, “context reuse”, “speed/cancellation” in these pages. No Android/device/browser evidence present. No internal Seven metrics present.

SOURCE_VERDICT: harvested set is relevant (core evals) but insufficient to fully specify Seven’s deep-think architecture; requires repo + product-intelligence + domain packs inspection to map to internal contracts.

CURRENT=Seven-first inspection (evidence):

Files inspected (repo root):
- `/home/runner/work/_temp/seven-superloop-worktrees/c126-research-B04/remake/ARCHITECTURE.md` — high-level architecture; product-intelligence/constitution/autonomy paths referenced; preserves architecture as source of truth.
- `/home/runner/work/_temp/seven-superloop-worktrees/c126-research-B04/remake/MILESTONES.md` — milestones; current code treated as truth per instructions.
- `/home/runner/work/_temp/seven-superloop-worktrees/c126-research-B04/.seven-team/product-intelligence/` index + quality rubric + sources (inspected present). Sources include `OFFICIAL_SOURCE_MAP.json`.
- `/home/runner/work/_temp/seven-superloop-worktrees/c126-research-B04/.seven-team/domain-campaign/domains.json` — domain map present (campaign scaffold). D09_DEEP_THINK entry exists by assignment; owners A09,B04; priority CORE; source target 10.
- `/home/runner/work/_temp/seven-superloop-worktrees/c126-research-B04/.seven-team/autonomy/` — contracts/controls present (constitution/proof policy/judge rules/baselines/evaluator-plane). Not modified.
- `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` — authoritative sources map; confirms “current external facts” must come from listed sources or stronger evidence.
- Knowledge packs: manifest `knowledgePacks` referenced (domain-routed encyclopedia). Searched for deep-think/planner/orchestrator: no explicit file hits surfaced in shallow scan; must read assigned packs during deeper pass if present.

Seven implementation state (by focus keywords): no concrete modules named `two-pass-orchestrator`, `planner-isolation`, `context-reuse`, `cancellation` found in immediate top-level scan. Absence of named components is evidence of potential gaps (not proof they don’t exist). Architecture.md is the canonical contract to not break.

Evidence level for CURRENT: repo-inspected present; named artifacts for deep-think internals appear sparse/unspecified in top-level. CURRENT_STATE_INSUFFICIENTLY_NAMED (needs pack reads + targeted grep for planner/orchestrator/two-pass/reuse/cancel).

TARGET=Desired architecture/product behavior for D09_DEEP_THINK (mapped to assignment):

- Two-pass orchestration: explicit “think then act” separation with verifiable handoff (plan -> verify -> execute). Deterministic pass gates; pass outputs are inspectable artifacts.
- Planner isolation: planner runs in isolated context/state from executor; no cross-contamination of speculative branches; clear ownership boundary (separates reasoning plan from execution effects). Prevents plan drift.
- Context reuse: persistent working memory across turns/subtasks with eviction policy, condensation, and provenance (what entered context and why). Avoids re-reading entire repos blindly; respects AGENTS.md scoping and patch discipline.
- Speed and cancellation: interruptible, cancellable operations (cooperative cancellation), bounded planning time, early-exit criteria, progress signals. Latency-aware preambles as per instructions.
- Verification-first: planning produces testable hypotheses; verification uses concrete evidence (files/commands); no claim without evidence. Integrates with proof-carrying work (state invariant(s) touched, evidence level, UNPROVEN).
- Determinism & proof: regression tests required; distinguishes mock/browser/Android/device evidence; never weaken guards.
- Product alignment: compare to reference principles when UI involved (hierarchy, clarity, feedback) but D09 is deep-think/core; focus on agent behavior/architecture quality.

Target is to make deep-think internals explicit, testable, and auditable without breaking ARCHITECTURE.md.

NOW=First high-value implementation slice (smallest that materially improves domain):

1. Evidence audit: read knowledge packs assigned to D09 and adjacent packs (orchestrator/planner/kernel/routing if exist). Record gaps.
2. Name and model deep-think components in architecture terms: define interfaces for TwoPassOrchestrator, Planner (isolated), ContextStore (reuse + eviction), CancellationToken/Controller (speed/cancel). Add to ARCHITECTURE.md extensions only if needed? But must preserve ARCHITECTURE.md; if missing, propose minimal section (non-destructive) with evidence.
3. Planner isolation boundary: sketch state separation (inputs/outputs, no shared mutable side-effecting state during planning). Document contract.
4. Two-pass flow: define pass 1 (research/plan, no edits), pass 2 (execute with verification). Explicit gate criteria.
5. Cancellation + progress: define cancellation points, time bounds, progress events (concise). Tie to “sharing progress updates” and preambles.
6. Context reuse policy: specify what’s cached (file summaries, prior tool results, plan), TTL/size, and when to invalidate (patches change files). Avoid re-reading files after apply_patch per rules.
7. Minimal deterministic test: a small unit/integration test that verifies two-pass gate prevents execution without plan verification or records evidence.

Slice size: documentation+interface skeleton+one focused test. No broad refactors.

NEXT=Next improvements:

- Execution-grounded verification hooks inspired by BFCL (validate tool calls against schemas before execution) and SWE-bench style (run focused tests post-change). Map to internal tool registry.
- Context condensation: summarize long trajectories; track provenance; reduce noise.
- Planner critique loop (self-check) with evidence requirements before pass 2.
- Progress telemetry (structured, concise) for longer tasks.
- Adaptive timeboxing per task class.
- Cross-domain alignment with routing/kernel for cancellation propagation.

LATER=Longer-term ideas:

- Benchmark integration: run internal micro-benchmarks aligned to BFCL/SWE-bench subsets to detect regressions (eval-plane aware, non-destructive).
- Learned condensation policies with guardrails.
- Deterministic replay of planning/execution for audit.
- Planner sandboxing (stronger isolation) without weakening security.

TESTS=Deterministic, E2E, Android, adversarial, eval proof:

- Deterministic unit: two-pass gate, cancellation propagation, context eviction (fixed seeds).
- Contract tests: planner outputs schema-valid plans; executor rejects unverifiable plans.
- Integration/E2E: representative task runs through both passes; verify evidence captured.
- Adversarial: cancellation mid-plan/mid-exec, plan drift, context overflow, re-reading after patch, premature termination.
- Android: only if UI touches (D09 likely core) — not applicable unless deep-think UI added.
- Eval: align to internal judge rules/baselines; no modification to evaluator controls. Proof-carrying: each test asserts evidence exists.

RISKS=Security/privacy/performance/Android/RTL/cross-system risks:

- Security: planner isolation must not leak secrets; cancellation must not bypass approvals; preserve sandboxing model (danger-full-access noted but behavior unchanged).
- Privacy: context reuse must avoid retaining sensitive tokens/PII beyond need; provenance logging without secrets.
- Performance: context caching can grow; eviction critical; speed vs thoroughness tradeoff.
- Android/RTL: N/A unless UI.
- Cross-system: touches orchestrator/routing/kernel/storage/bridge; risk of duplicate owners — must enforce single-owner per subsystem; breaking ARCHITECTURE.md invariants.

FIRST_SLICE=Evidence audit + interface contracts for TwoPassOrchestrator/Planner/ContextStore/Cancellation + minimal gate test. Smallest delta with material domain improvement.

KNOWN_UNKNOWNS=Missing evidence:

- Existence/location of knowledge packs for D09 and adjacent domains (need to read). 
- Current implementation of orchestrator/planner/cancellation in codebase (grep required).
- How context is currently managed across turns (no direct evidence in top-level). 
- Concrete eval metrics used internally (vs public BFCL/SWE-bench).
- Whether “progress/verification” is already formalized in autonomy contracts beyond stated proof policy.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT — harvested web evidence is useful but repo-internal state (packs, current modules, contracts usage) not yet fully read. Require targeted inspection of knowledge packs + grep for planner/orchestrator/two-pass/context/cancel before declaring READY_FOR_PLAN. No production edits made.
