# Seven Self-Development v1 — Research Synthesis

Status: RESEARCH COMPLETE FOR ARCHITECTURE BASELINE
Date: 2026-10-05
Tracking: #100

## Executive conclusion

The strongest practical pattern is not unrestricted "self-rewrite". It is an evidence-gated experiment system:

Observation → hypothesis → isolated challenger → locked evaluation → comparative evidence → independent critique → bounded promotion/rollback → durable learning.

The language model is useful for diagnosis, search, hypothesis generation, planning and critique. It is not the authority that declares its own change successful. Deterministic policy, protected evaluators, external execution evidence and exact artifact identity decide promotion.

## External research findings

### 1. Evolutionary search works when the evaluator is objective

Google DeepMind's AlphaEvolve combines LLM proposal generation with automated evaluators and an evolutionary program database. The important transferable principle is separation between creative proposal and objective scoring. Evolution is most useful where progress can be measured clearly.

Seven implication:
- generate multiple candidate hypotheses rather than one self-confident patch;
- preserve strong losers/Pareto candidates;
- do not use model confidence as the fitness function;
- only evolve dimensions with a repeatable evaluator.

Source:
- https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/
- https://deepmind.google/blog/alphaevolve-impact/

### 2. Reflection is a hypothesis generator, not proof

Reflexion stores linguistic feedback from trials and reuses it in later attempts. Self-Refine iterates generation → feedback → refinement. CRITIC improves self-correction by bringing external tools into the critique loop.

Seven implication:
- reflection may propose root causes and fixes;
- reflections must be tagged HYPOTHESIS until backed by evidence;
- tool/test/retrieval evidence outranks self-critique;
- the same model may help refine a candidate but cannot independently certify a high-risk change.

Sources:
- https://arxiv.org/abs/2303.11366
- https://arxiv.org/abs/2303.17651
- https://arxiv.org/abs/2305.11738

### 3. Prompt optimization should be benchmark-driven

GEPA samples trajectories, reflects on failures, proposes prompt updates and combines lessons from a Pareto frontier. DSPy MIPROv2 jointly optimizes instructions and demonstrations using explicit metrics and validation trials.

Seven implication:
- prompts are versioned candidate artifacts;
- prompt optimization requires a fixed train/development/held-out split;
- keep the current champion until a challenger wins under the same metric lock;
- avoid repeated tuning on the final acceptance corpus.

Sources:
- https://arxiv.org/abs/2507.19457
- https://dspy.ai/3.0.0/api/optimizers/MIPROv2/
- https://dspy.ai/3.2.0/learn/optimization/optimizers/

### 4. Coding-agent quality depends heavily on the execution interface

SWE-agent reports that an Agent-Computer Interface benefits from syntax/lint rejection on edits, bounded file views, concise repository search and explicit command-result semantics. mini-SWE-agent demonstrates that a small, auditable loop can remain highly competitive; complexity is not automatically capability.

Seven implication:
- keep Coding System execution primitives small, deterministic and auditable;
- exact repository state, bounded reads, deterministic test selection and sandboxing matter more than adding more planner prose;
- Self-Development must call Coding System rather than duplicate Git/file/shell authority.

Sources:
- https://github.com/SWE-agent/SWE-agent/blob/main/docs/background/aci.md
- https://github.com/swe-agent/mini-swe-agent

### 5. Sandboxed workspaces and event-driven state reduce blast radius

OpenHands separates agent reasoning, tools, workspace and server/API concerns. Its current SDK describes a stateless event-driven agent loop and explicit workspace abstraction, including sandboxed/remote execution options.

Seven implication:
- self-development orchestration should not own raw file/shell authority;
- candidate execution belongs in an isolated Coding workspace;
- every phase should emit durable events rather than rely on hidden conversational state.

Sources:
- https://github.com/OpenHands/docs/blob/main/sdk/arch/agent.mdx
- https://github.com/OpenHands/software-agent-sdk/blob/main/openhands-sdk/openhands/sdk/workspace/base.py

### 6. Reliable coding benchmarks require evaluator hygiene

SWE-bench Verified is a human-validated subset designed to remove ambiguous/unsolvable tasks and bad tests. SWE-Bench Pro Verified specifically reports benchmark unreliability from reward hacking/leakage and task-quality problems, and adds anti-hacking safeguards.

Seven implication:
- lock evaluator identity before candidate work;
- evaluator/test/baseline changes cannot occur inside the candidate being judged;
- held-out acceptance tests must remain unavailable to the candidate builder where practical;
- benchmark quality is itself versioned and reviewed outside candidate runs.

Sources:
- https://www.swebench.com/verified.html
- https://arxiv.org/abs/2609.08149

### 7. Reward hacking is a concrete engineering threat

The 2026 Reward Hacking Benchmark includes shortcut opportunities such as skipping verification and tampering with evaluation-relevant functions. Environmental hardening materially reduced exploit rates.

Seven implication:
- do not rely on instructions such as "do not weaken tests";
- make evaluator mutation structurally impossible for normal candidates;
- record skipped gates as failures, not optimization;
- test Seven itself against evaluator-tampering, stale-SHA and hidden-failure attacks.

Source:
- https://proceedings.mlr.press/v306/thaman26a.html

### 8. "Agent wrote tests" is not sufficient evidence

Recent studies find that agent-generated tests often act as observational probes, and simply increasing their number has limited effect on task success. Large-scale analysis also finds agent-authored tests can have higher flakiness risk even when edge-case coverage is strong.

Seven implication:
- candidate-authored tests are supplemental;
- mandatory regression suites and held-out tests are selected outside the model;
- future quality gates should measure assertion strength, mutation kill rate, flakiness and regression detection rather than test count.

Sources:
- https://arxiv.org/abs/2602.07900
- https://arxiv.org/abs/2607.12068

### 9. Model routing optimization must beat simple baselines

RouteLLM shows useful quality/cost routing can be learned from preference data. LLMRouterBench (400K+ instances, 21 datasets, 33 models) finds many sophisticated routing methods do not reliably beat a simple baseline and highlights quality/cost/latency plus model-recall failures.

Seven implication:
- every routing challenger competes against the current deterministic baseline;
- track quality, cost/tokens, latency, availability and route recall separately;
- more models/features are not evidence of a better router.

Sources:
- https://arxiv.org/abs/2406.18665
- https://arxiv.org/abs/2601.07206

### 10. Memory optimization requires temporal/update/abstention tests

LongMemEval separates long-term memory into extraction, multi-session reasoning, temporal reasoning, knowledge updates and abstention. Seven already has a strong Memory v2 champion and should preserve simple lexical/temporal baselines before adding complexity.

Seven implication:
- Memory challengers must improve the relevant dimension without regressing hard-forget, provenance, scope or abstention;
- retrieval complexity must earn promotion comparatively.

Source:
- https://arxiv.org/abs/2410.10813

### 11. Tool evaluation must include agentic behavior, not only schema syntax

BFCL V4 evaluates web search, memory, multi-turn tool use, hallucination behavior, latency and cost in addition to basic function calling.

Seven implication:
- tool optimization metrics need correctness, missed-tool/hallucinated-tool rate, multi-turn completion, latency and effect-safety;
- a syntactically valid call is not enough.

Source:
- https://gorilla.cs.berkeley.edu/leaderboard

### 12. Observability needs common semantics and privacy boundaries

OpenTelemetry semantic conventions provide standardized names for traces, metrics and events; GenAI conventions focus on model/runtime metadata and token/performance signals. OWASP MASVS warns against sensitive data in logs.

Seven implication:
- use structured content-minimized events;
- prompt/response capture is OFF by default;
- credentials/secrets are forbidden in telemetry;
- correlate request/controller/memory/routing/tool/evidence/verification/persistence/UI spans by IDs, not copied content.

Sources:
- https://opentelemetry.io/docs/specs/semconv/
- https://opentelemetry.io/blog/2024/otel-generative-ai/
- https://mas.owasp.org/MASWE/MASVS-STORAGE/MASWE-0005/

## Seven current-state comparison

### Strong foundations already present

- Evolution Core already has candidate lifecycle, hard gates, hash-chained ledger, rollback state, bounded repair, durable checkpoints, shadow/canary stages and promotion approval.
- eval-lock.cjs locks baseline/corpus identity before evaluation.
- autonomy constitution/proof-policy already forbid evaluator gaming and define evidence levels.
- Memory v2 is a proven champion baseline with comparative-change discipline.
- Tools v1 has deterministic ReferenceMonitor/risk/permission primitives.
- Model Intelligence v3 and Measured Latency v2 provide deterministic routing plus privacy-preserving route telemetry.
- eval/harness.cjs provides a cross-domain corpus and explicit UNMEASURED truth states.

### Material gaps

1. No cohesive front half for Observe → Measure → Diagnose → Research → Hypothesize → Prioritize.
2. Observatory policy exists, but there is no single canonical runtime Observation Engine consuming all subsystem signals.
3. Legacy release/github-self-dev.js bypasses Evolution Core and the planned Coding v1 runtime.
4. Protected-path policy is duplicated and divergent between release/github-self-dev.js and evolution/experiment-lab.cjs.
5. The native GitHub boundary protects admin/secrets API surfaces but is not the canonical repository-file protection policy.
6. Legacy "atomicCommit" writes files through multiple contents-API commits rather than one transactional candidate patch.
7. Current Coding v1 has research/plan but no IMPLEMENTATION_EVIDENCE.md; authoritative exact-SHA transactional Coding Runtime is not yet proven complete.
8. No canonical weakness/diagnosis record, improvement proposal schema, or cross-run learning archive is wired into the product.
9. Generic evaluation currently emphasizes pass/fail suites; self-development needs paired baseline/candidate metric manifests and domain-specific held-out gates.
10. Independent critic/reviewer is policy, but not yet a hard adapter requirement in the live GitHub self-dev path.

## Architecture principles extracted from research

1. Proposal authority != evaluation authority.
2. Reflection generates hypotheses; evidence decides.
3. Exact baseline/candidate identity is mandatory.
4. Evaluator plane is immutable during candidate evaluation.
5. Production mutation goes only through Coding System.
6. Mandatory tests are selected outside candidate model control.
7. Compare paired runs under the same lock and environment.
8. Hard safety/invariant regressions dominate aggregate score.
9. Prefer Pareto/frontier preservation over one opaque scalar winner.
10. Failed experiments are durable learning, not discarded embarrassment.
11. Keep loops bounded and rollback-first.
12. Telemetry is content-minimized and privacy preserving.
13. Optimize a subsystem only against its existing champion.
14. New architectural complexity must beat a simple baseline.
15. A claim without bound evidence is UNPROVEN/INCONCLUSIVE.

## Research risk notes

- Benchmark wins may not transfer to Seven's mobile/runtime constraints.
- LLM-as-judge is useful for semantic review but can be biased and correlated with the builder; it cannot be the only acceptance signal.
- Prompt/evolution methods can overfit a repeatedly reused evaluation corpus.
- Multi-agent review adds cost and coordination complexity; use it selectively for MEDIUM/HIGH risk.
- Automated tests can be gamed or be too weak; mutation/adversarial checks are required for evaluator quality.
- Observational telemetry can identify correlations but not prove causality; causal language requires a controlled experiment or strong discriminating evidence.

## Decision

Build Self-Development as a governor over existing specialized systems, not a second coding agent and not an unrestricted recursive rewriter.
