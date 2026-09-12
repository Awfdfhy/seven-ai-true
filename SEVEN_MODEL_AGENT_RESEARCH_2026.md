# Seven AI Ultimate — Model & Agent Intelligence Fabric (2026)

This document is the implementation-oriented research record for the Model/Agent layer of Seven AI Ultimate. It complements `SEVEN_AI_ULTIMATE_MASTER_SPEC.md` and does not replace the authoritative runtime invariants.

## Design target

Seven must treat a model as one component in an intelligence system, not as the system itself. The runtime should improve end-to-end capability through selective compute, verified routing, tools, memory, search, multiple candidate solutions, verification, workflow learning, and eventually open-weight specialization where practical.

The default path must remain fast. Expensive reasoning, councils, tree search, multiple agents, and strong models wake only when expected value justifies their latency.

## 1. Model Control Plane

The new `model-control-plane.js` adds:

- task-aware dynamic model/provider routing
- hard eligibility gates for role, capabilities, context fit, provider health, quota state, free/local requirements, and latency
- rolling TTFT, inter-token latency, throughput, queue time, error rate, cache-hit, and token telemetry
- verified task-specific outcome posteriors so routing learns from measured success rather than reputation alone
- small controlled exploration bonus for uncertain routes
- provider-diverse fallback graphs for rate limits, outages, timeouts, and network failures
- optional delayed hedging when routes are free/local and latency sensitivity is high
- serving recommendations for prefix caching, chunked prefill, continuous batching, speculative decoding, quantization, priority scheduling, and disaggregated prefill

Routing never turns an unverified result into authority. Learning from outcomes requires verification.

## 2. Adaptive Test-Time Intelligence

`intelligence-orchestrator.js` implements a bounded inference ladder:

`direct → sample+verify → solver/critic → solver/critic/repair → tree search → council+ synthesis`

The strategy is selected by complexity, uncertainty, risk, verifiability, latency priority, and available model diversity. Every strategy has explicit model-call, verifier-call, parallelism, and round budgets.

Only public work states are exposed to UI. Private model deliberation is not rendered.

This design follows the broad research lesson that more inference compute can improve hard reasoning, but the optimal amount depends on task and protocol. Seven therefore scales compute selectively rather than maximizing token count blindly.

## 3. Agent Fabric V2

`agent-fabric-v2.js` adds a generic governed orchestration layer above specialist agents.

Supported patterns:

- single
- sequential
- concurrent fan-out/fan-in
- handoff
- supervisor
- group review
- bounded tree search

Core runtime pieces:

- capability-based `AgentRegistry`
- dependency-aware `TaskGraph`
- `SharedBlackboard` with authority and lineage rules
- explicit Full / ReadOnly / Hidden worker visibility
- scoped handoff contracts
- hard model-call, tool-call, token, wall-time, parallelism, depth, and round budgets
- checkpoints
- deadlock detection
- kill switch
- verified reflection memory
- workflow outcome learning

A derived agent output cannot overwrite authoritative blackboard state. Authoritative entries require source lineage.

## 4. Workflow intelligence

Seven should not freeze one manually designed agent topology forever. Verified workflow outcomes are recorded by task type, and the runtime can prefer patterns that repeatedly perform well.

`WorkflowEvolutionSearch` represents workflows as node/edge programs, mutates them, evaluates them only with verified metrics, and keeps high-performing variants. The long-term direction is automated offline workflow search inspired by systems such as AFlow, while production execution stays bounded and deterministic enough to debug.

## 5. Model Evolution Lab

`model-evolution-lab.js` separates system intelligence growth from weight training.

### For API / closed-weight models

Seven can still improve through:

1. verified routing
2. context and retrieval optimization
3. tool-use improvements
4. test-time scaling
5. prompt-program optimization
6. workflow search
7. outcome learning

### For open-weight models

The lab can additionally prepare gated recipes for:

- QLoRA / adapter SFT
- teacher distillation from verified outputs
- DPO when quality preference pairs exist
- verifiable-reward reasoning training when deterministic evaluators and enough high-quality data exist
- draft-model training for speculative decoding where useful

Training data must be verified, deduplicated, grouped to prevent train/eval leakage, and lineage-linked to sources. Base models remain immutable; adapters/checkpoints are versioned separately.

No checkpoint can become a Seven default merely because training completed. Promotion still requires shadow/canary evaluation and regression gates.

## 6. Verified Experience Store

Only externally or deterministically verified outcomes can enter the model-improvement dataset. Each record carries:

- task type
- input/output
- reward/success
- evidence references
- producing model/workflow
- group ID for split isolation
- metadata and lineage

Repeated identical examples are deduplicated before dataset construction.

## 7. Serving and latency

For hosted APIs, Seven optimizes perceived and actual latency through small contexts, stable prompt prefixes, streaming, warm-route affinity, parallel independent retrieval, provider failover, and selective compute.

For self-hosted models, the serving planner can recommend features supported by modern inference engines such as continuous batching, prefix caching, chunked prefill, speculative decoding, quantization, and separate prefill/decode deployments. These are recommendations, not assumptions: deployment capabilities are discovered and benchmarked before activation.

The runtime records TTFT separately from total generation latency so it can diagnose whether a slow response comes from prompt prefill, provider queueing, network behavior, or decode speed.

## 8. Model/Agent UI

`model-agent-ui.js` defines presentation contracts for:

- Model Cockpit: selected route, candidate ranking, health, confidence, TTFT, strategy, and serving capabilities
- Agent Cockpit: live task DAG, assignments, handoffs, budget, activity, and verification state
- Intelligence Ladder: public stages such as candidate search, verify, repair, or synthesis
- Model Observatory: lifecycle, roles, free/local class, speed/quality, and health

Animations use the Seven Motion contract and fall back to state crossfades under Reduced Motion.

## 9. Runtime integration

`model-agent-extension.js` attaches Model Control Plane V2, the resilient executor, Agent Fabric V2, Model Evolution Lab, and UI presentation to an existing `SevenUltimateOS` without rewriting the baseline runtime. `CognitiveController` also accepts the control plane directly while preserving its legacy route path as a compatibility fallback.

## 10. Non-negotiable invariants

- authoritative state remains explicit
- derived consensus never creates authority
- every learned outcome that influences routing/training is verified
- free/local routes remain first-class
- strong models and multi-agent execution are selective, not always-on
- cancellation and budgets bound autonomous work
- failures preserve exact state and are observable
- evaluation measures the entire inference workflow, not only the base model name
- latency, quality, and reliability are optimized jointly

## Research anchors

The design was informed by modern work on test-time scaling, RouteLLM-style quality/cost routing, Reflexion-style verified episodic feedback, LATS/tree-search reasoning, graph-style reasoning, automated agent-workflow search, QLoRA, DPO, and current multi-agent orchestration patterns such as sequential, concurrent, handoff, review, and manager-led coordination. Serving recommendations follow current vLLM capabilities including prefix caching, chunked prefill, continuous batching, speculative decoding, quantization, and disaggregated prefill/decode.

The research is used as design evidence, not as proof that any single technique is universally superior. Every optimization must earn promotion in Seven's own eval suites and real telemetry.
