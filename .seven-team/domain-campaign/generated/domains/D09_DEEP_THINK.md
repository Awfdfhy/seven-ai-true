# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK

SOURCE_ANALYSIS=Harvested sources are primarily leaderboard/benchmark pages (BFCL V4 [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard, SWE-bench leaderboards [SOURCE primary] https://www.swebench.com/ and related assets). 
Collectively they measure: (1) tool/function calling correctness under constrained schemas (BFCL) and (2) software engineering task success via repo-grounded issue resolution (SWE-bench). 
Key points:
- BFCL V4 emphasizes structured function/tool calls, multi-turn/tool-use robustness and execution-grounded evaluation (not just syntax). The leaderboard framing is explicit about evaluation methodology and categories; freshness is tied to benchmark releases (V4 is current as of recent BFCL cycles). Limitations: synthetic/benchmark-driven; does not directly measure agentic planning depth, cancellation semantics, context reuse efficiency, or two-pass orchestration in a live coding agent.
- SWE-bench focuses on end-to-end issue resolution against real repos (Pass@k on test suites). It measures practical task completion but is retrospective (static tasks) and does not directly probe intra-run planning isolation, speculative work cancellation, or planner speed under streaming/tool pressure.
- Assets (CSS/HTML) are site scaffolding, not technical evidence.
- Disagreements/limits: benchmarks optimize for different axes (tool correctness vs full task pass). Neither directly quantifies planner latency/cost, two-pass orchestration quality, context compression/reuse, or cancellation correctness. The harvested set is insufficient to define a concrete Seven planner spec; we must ground against Seven’s actual planner/orchestrator implementation and product-intelligence principles.

CURRENT=Repository inspection (evidence-grounded):
- remake/ARCHITECTURE.md: Defines ownership matrix and subsystems (shell/tasks/storage/bridge/routing/kernel). No owner explicitly labeled “Deep Think/Planner” in the inspected head; per rules we must not invent owners. The architecture emphasizes contracts and ownership boundaries; planner/orchestrator is not obvious as a separate named subsystem in the top-level ownership list shown.
- remake/MILESTONES.md (inspected): Contains cycle/milestone structure (Cycle 144 stage RESEARCH noted). No explicit D09 milestone slice identified in the inspected portion; treat as truth per instructions but implementation state is not fully enumerated from head alone.
- .seven-team/domain-campaign/domains.json: D09_DEEP_THINK priority CORE, source target 10, owners B04,A09. Seeds include BrowseComp (https://openai.com/index/browsecomp/), BFCL, SWE-bench. Harvested 10 sources (all primary) for this domain; harvest READY. 
- .seven-team/product-intelligence: Present (index/rubric/knowledge/sources). Must be consulted for UI/product quality if planner surfaces UX (e.g. plan display/progress/verification UI). Aesthetic claims without runtime evidence labeled weak.
- Codebase search (planner/orchestrator/two-pass/context reuse/cancel): No obvious planner/orchestrator module files surfaced by filename grep in inspected paths; routing exists (src/lib/routing) but no planner files immediately identified in head scans. This means CURRENT state of deep-think implementation is UNVERIFIED from file contents alone — we need deeper inspection of code (core/agent/planner, orchestrator, plan, think) to make concrete claims. Evidence level: partial (docs+campaign only).

TARGET=Desired state (evidence-aligned with benchmark insights, Seven constraints):
- Two-pass orchestration: explicit plan-first pass (intent, subgoals, constraints, invariants) separated from execution pass (tool calls) with a well-defined handoff. Invariant tracking and verification checkpoints between passes. 
- Planner isolation: deterministic planning boundary (inputs/outputs, no cross-contamination of execution side effects during planning) to enable replay and verification. 
- Context reuse: intelligent context condensation between steps (summaries, artifacts, relevant history) to reduce token/latency while preserving required state. Must be auditable (what was kept/dropped).
- Speed: minimize planning latency (time-to-first-actionable-plan) without sacrificing safety; track p50/p90/p99.
- Cancellation: robust cancellation semantics (cooperative + preemptive where safe), idempotent cleanup, no leaked side effects on cancel, clear UX/progress state on abort.
- Verification/progress: explicit verification criteria per subgoal, progress reporting, evidence capture (files/commands/results). 
- Deterministic regression proof: unit/integration tests for planner behavior (two-pass, cancel, reuse), plus eval hooks aligned to principles (BFCL-like tool correctness where relevant; SWE-bench style task slices where applicable). 
Constraints: preserve architecture in remake/ARCHITECTURE.md, don’t create duplicate owners, distinguish evidence types, never weaken guards/tests.

NOW=First high-value implementation slice (smallest that materially improves domain):
1. Locate and read actual planner/orchestrator implementation (if exists) and any AGENTS.md in scope. Evidence: file paths + contents summary.
2. Define planner contract (I/O, invariants, two-pass phases, cancel points). Add contract tests (deterministic). 
3. Add minimal two-pass skeleton: Plan phase produces a verifiable plan (subgoals, required evidence, verification criteria); Execute phase consumes plan. No behavior change unless missing.
4. Instrument basic metrics (planning time, steps, tokens/context size) and cancellation hook (graceful abort on user/requested cancel). 
5. Add regression tests for cancel (no side effects) and plan immutability semantics.

NEXT=Next improvements:
- Context reuse policy: configurable condensation (keep artifacts, drop redundant history), with provenance log. 
- Verification checkpoints: per-subgoal verification with evidence required before proceeding.
- Planner isolation tests (replay plan against fixed inputs).
- Align tool-calling discipline to BFCL-style schema constraints where Seven tools are used (deterministic validation). 
- Progress UX hooks (if UI involved) validated against product-intelligence rubric (clarity, hierarchy, feedback) with runtime evidence.

LATER=Longer-term ideas:
- Hybrid planning (fast heuristic + slower deliberative) with time budgets.
- Learned/heuristic condensation with ablation metrics; cost-aware planning.
- Eval integration: BFCL subset relevant to Seven tools + internal SWE-bench-like slices on small repos; track regression trends.
- Adversarial tests (planner stalls, cancel races, inconsistent state). 
- BrowseComp-informed deep-research planning behaviors (query decomposition, evidence gathering, citation discipline) adapted to coding agent context (cite file paths/commands, not just URLs).

TESTS=Deterministic, E2E, Android, adversarial, eval proof (concrete):
- Unit: contract shape, two-pass handoff, cancel idempotency, plan serialization, context reuse policy.
- Integration/E2E: representative tasks exercising plan->execute, cancel mid-execution, context growth then condensation.
- Deterministic: fixed fixtures, no network-dependent planner tests (network disabled in unit paths).
- Adversarial: cancel during planning/exec, empty/ambiguous goals, tool failures, loop detection.
- Android (if planner affects mobile UX): minimal verification against Android ergonomics if plan UI surfaces; else N/A but flagged.
- Eval: small internal suite mirroring BFCL-relevant cases for Seven tools + targeted SWE-bench-like slices. Must produce pass/fail + metrics (time, tokens, cancel success).

RISKS=Security/privacy/performance/Android/RTL/cross-system:
- Security: cancellation must not leak partial secrets; context condensation must not retain sensitive tokens in artifacts/logs. Never log credentials.
- Privacy: planner logs/artifacts must respect filesystem boundaries; provenance must not expose unrelated paths unnecessarily.
- Performance: two-pass adds overhead; must be justified by better outcomes or bounded (p90). Context reuse can trade accuracy for speed.
- Android/RTL: if progress/plan UI touches mobile, check density/ergonomics/RTL per product-intelligence; weak evidence if no runtime screenshots.
- Cross-system: planner touching routing/kernel/shell/tasks/storage/bridge risks ownership conflicts (no duplicate owners). Changes must respect ARCHITECTURE contracts. 
- Correctness: two-pass can introduce handoff bugs; cancellation races can corrupt state. Require deterministic proof.

FIRST_SLICE=Smallest implementation that materially improves domain: read planner/orchestrator source (locate files), write contract + two-pass skeleton + cancel test + metrics hooks. This is reviewable (small diff) and directly addresses “two-pass orchestration, planner isolation, context reuse, speed and cancellation” with evidence.

KNOWN_UNKNOWNS=Missing evidence:
- Current planner implementation exists? Location/files unknown from head inspection. Need to grep for planner/orchestrator/think/plan in src, core, agent, lib.
- Does planner already have two-pass, cancel, context reuse? Unknown.
- Owners: is there an existing owner for deep-think/planner? ARCHITECTURE head doesn’t show it explicitly; could be implicit. Must inspect full ARCHITECTURE and code.
- Product-intelligence knowledge packs for D09: not read yet (must read index+rubric+relevant knowledge for RESEARCH). 
- Eval baselines: no internal BFCL/SWE-bench-like numbers for Seven planner. 
- BrowseComp lessons applicable to coding agent: need to extract concrete practices (query decomposition, evidence discipline) vs generic claims.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (cannot fully define implementation until we inspect actual planner/orchestrator code, full ARCHITECTURE ownership, and product-intelligence knowledge packs for D09). Harvested benchmark URLs provide useful external framing but do not constitute proof of current Seven state or a concrete Seven planner design.
