# Seven AI Ultimate — Frontier Chat & Raw Intelligence Program (2026)

## Target

Seven should compete with frontier chat/agent systems at the **system level**: general chat quality, long-context continuity, adaptive reasoning, tool use, long-horizon completion, verification, efficiency, and continuous improvement.

The reference target for this iteration is the publicly documented behavior of Claude Fable 5.1: 1M native context, 128K max output, adaptive thinking with multiple effort levels, long-running agentic work, append-only conversation history, progress updates, parallel independent tool calls, and strong verification discipline.

Seven does not fake a larger native context window or a stronger base checkpoint than the selected provider actually supplies. Instead it adds a **Virtual Context Fabric**, adaptive test-time inference, verification, routing, and an open-weight evolution path so effective system capability can grow beyond any single model call.

## Public Fable 5.1 characteristics used as engineering targets

- 1M context and 128K max output.
- Adaptive thinking with low / medium / high / xhigh / max effort.
- Append-only conversation history for preserved long-running state.
- User-facing progress updates during tool-heavy work.
- Batching independent tool calls to reduce round trips.
- Strong long-horizon completion rather than stopping early.
- Prompt caching and stable prefixes for efficiency.
- Stronger agentic coding, research, verification, and root-cause analysis than its predecessor.

Sources:
- https://platform.claude.com/docs/en/models/fable-5-1/overview
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1
- https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context
- https://www.anthropic.com/claude-fable-and-mythos-5-1

## Seven Frontier Chat architecture

### 1. Append-only Conversation Ledger

`frontier-chat-fabric.js` never mutates prior canonical chat turns. Every turn is chained to the prior turn hash. Summaries and compacted views are derived objects with source turn IDs and prefix hashes.

This solves three problems at once:

1. long-run continuity
2. cache stability
3. exact auditability / reconstruction

### 2. Virtual Context Fabric

Native model context remains bounded by the selected model. Seven therefore separates:

- **virtual context**: the full durable conversation / project / memory space
- **materialized context**: the carefully selected working set sent to the model

The compiler combines:

- system instructions
- pinned constraints
- recent turns
- query-relevant older turns
- lineage-linked compaction summaries

It reports virtual tokens, materialized tokens, and compression ratio. Compaction never overwrites the original conversation.

### 3. Adaptive Effort

Seven maps each turn onto:

`low → medium → high → xhigh → max`

based on complexity, uncertainty, risk, freshness, long-horizon depth, quality priority, and latency priority.

The provider feature runtime translates this canonical effort into provider-specific request fields only when the provider declares native support.

### 4. Provider Feature Negotiation

`provider-feature-runtime.js` gives Seven a capability profile per provider/model family:

- effort controls
- native context / output limits
- prompt caching
- append-only thinking requirements
- turn-scoped system instructions
- progress updates
- parallel tool calls
- structured output

The chat layer does not assume every provider supports the same knobs.

### 5. Verified Frontier Inference

`frontier-inference-runtime.js` turns difficult chat turns into bounded inference programs instead of one-shot generation.

Supported execution paths include:

- direct
- sample + verify
- solver / critic
- solver / critic / repair
- tree search
- specialist council + synthesis

Only the final selected answer is streamed to the user. Intermediate candidates remain internal execution artifacts.

### 6. Tool-integrated verification

Verification can combine:

- deterministic checks
- tests / calculators / parsers / schema validators
- evidence checks
- an independent rubric judge model

Critical deterministic failures override an optimistic model judge.

This is aligned with 2025–2026 research showing that test-time scaling is much stronger when candidate search is paired with verification, and that external tools can dramatically improve verification for smaller models.

Research references:
- https://proceedings.mlr.press/v267/setlur25a.html
- https://proceedings.iclr.cc/paper_files/paper/2026/hash/776a5f2c7d6dd4b0d83145fc044e2726-Abstract-Conference.html
- https://aclanthology.org/2026.findings-acl.1243/
- https://arxiv.org/abs/2608.04001

### 7. Completion Contracts

Long tasks receive explicit acceptance criteria and blockers. Seven can checkpoint unfinished work and resume without pretending a task is complete.

The public UI receives short progress states, not private chain-of-thought.

### 8. Frontier Evaluation Gate

`frontier-evals.js` scores the **whole inference system**, not just a model name.

Core categories:

- general chat
- instruction following
- reasoning
- coding
- research
- tool use
- long context
- long horizon
- verification
- efficiency

Comparisons are protocol matched. A model evaluated with five candidates + tools is not directly compared to a one-shot no-tools run as if they were the same object.

## Raw Intelligence V2

Seven now has two distinct improvement paths.

### Closed/API models

Improve system intelligence through:

- routing
- context selection
- retrieval
- tools
- prompt programs
- multi-candidate inference
- verification
- workflow search
- outcome learning

### Open-weight models

Add true weight evolution through gated campaigns:

1. capability baseline
2. verified data flywheel
3. QLoRA / SFT
4. verified teacher distillation
5. DPO / preference optimization
6. verifiable-reward optimization where rewards are trustworthy
7. long-context curriculum when needed
8. quantization/speculative-serving evaluation
9. sealed regression eval
10. shadow → canary → specialist → default-candidate → default promotion

No training run may promote itself. Promotion requires eval evidence and a continual-learning gate to prevent catastrophic capability regression.

## Verified Data Flywheel

Only verified experiences can influence training or production routing.

Sources of verification can include:

- exact tests
- schemas
- calculators
- citation/evidence checks
- deterministic simulators
- human approval
- independent rubric judges

Failures are classified into a failure taxonomy. The highest-frequency/highest-severity failure types become the next targeted curriculum.

## Efficiency rules

Seven pursues intelligence per unit of latency / token / provider quota rather than always maximizing calls.

Rules:

- direct path for easy requests
- multi-candidate only when expected gain justifies it
- stable-prefix caching when supported
- exact-result cache only for safe non-fresh requests
- parallel independent retrieval/tool calls
- circuit breakers and provider fallback
- selective compaction instead of blindly growing prompts
- targeted file edits instead of large rewrites
- quantization only after quality gates for local models

## Definition of success

Seven should not claim parity from architecture alone. The goal is to make parity **measurable and reachable**.

A candidate Seven build earns “frontier-equivalent for a workload” only when a sealed, protocol-matched eval shows it meeting the configured quality floors while staying inside latency/token/reliability limits.

This keeps the project ambitious without replacing evidence with branding.