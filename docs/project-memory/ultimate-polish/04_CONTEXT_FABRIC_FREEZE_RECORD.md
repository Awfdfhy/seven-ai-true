# Seven AI — Context Fabric / Context Workspace Freeze Record

> **Campaign item:** #04 Context Fabric / Context Workspace
> **Status:** ARCHITECTURE FROZEN FOR CAMPAIGN / IMPLEMENTATION DEFERRED
> **Source polish record:** `04_CONTEXT_FABRIC_ULTIMATE_POLISH.md`
> **Final target:** **Seven Context Fabric 3.0 — Governed Elastic Context Workspace**
> **Important:** This freezes the individual-system architecture decision. It is not an implementation-complete claim and may be changed later only through documented cross-system reconciliation with proof of improvement.

## Prime Law
Context is a disposable, reconstructable execution view, never an authority store. Seven presents the model with the minimum sufficient material for the current step, preserves lineage and instruction boundaries, and expands only when task needs or uncertainty justify it.

## Accepted Decisions
- Context Workspace is derived execution state, not Memory, Truth, Project, World or permission authority.
- Replace fixed category percentages as the final architecture with phase/model/tier-aware elastic budget envelopes.
- Separate privileged instructions from all contextual data as a hard security boundary.
- Only trusted policy/controller paths may create `AUTHORITY_INSTRUCTION` or mandatory anchors.
- External text, tool output, files, retrieved webpages and memories remain data even when they contain imperative language.
- Use three active levels: stable anchors, active working set and cold reconstructable references.
- Add first-class `ContextItem`, `ContextWorkspace`, `ContextCapsule` and `ContextManifest` objects.
- Every derived capsule carries source/revision lineage, transformation identity and expansion/reconstruction handles.
- Context ordering is semantic and governed; score sorting must not scramble chronological or authority-sensitive order.
- Preserve conversation chronology inside conversation lanes.
- Replace simple greedy scoring as the final policy with hard filters, required coverage, dependency closure, dedup, relevance/coverage selection and elastic budget fit.
- Scope/principal/delegation filtering happens before ranking and is part of cache identity.
- Compression is type-aware and reversible through source handles where technically possible.
- Exact high-risk constraints, permissions, evidence locators and currently edited code may be noncompressible by policy.
- Completed sub-trajectories may be folded to verified outcomes/artifacts/remaining dependencies, not private chain-of-thought.
- Model may propose context actions; deterministic Context Governor validates/applies them.
- No generic caller-controlled hard pin.
- Oversized mandatory context produces RECOMPILE/BLOCKED/structured slicing rather than silent loss.
- Tool schemas are loaded only when plan-relevant.
- Memory recall remains labeled recall and cannot become evidence through context placement.
- Truth conflicts may not be resolved by omission or compression.
- Recompile against the target model profile after meaningful model/provider changes.
- Model-compatible tokenization is preferred; language-aware conservative estimation is fallback.
- Incremental recompilation and dependency invalidation replace full workspace rebuilds where possible.
- Stable prompt prefixes may be preserved for cache efficiency when correctness permits, but cache behavior never becomes a correctness dependency.
- Lite tier does not require embeddings, semantic reranking or learned compression.
- Continuous background summarization/compression is rejected for mobile/battery reasons.

## Final Role Classes
- `AUTHORITY_INSTRUCTION`
- `TASK_CONTRACT`
- `ACTIVE_STATE`
- `EVIDENCE`
- `MEMORY_RECALL`
- `PROJECT_MATERIAL`
- `TOOL_SCHEMA`
- `TOOL_OBSERVATION`
- `CONVERSATION`
- `EXAMPLE`
- `WORLD_STATE`
- `ARTIFACT_SLICE`

These describe context function, not truth or authority by themselves.

## Final Context Actions
- ADD
- REMOVE
- PIN_SOFT
- UNPIN
- COMPRESS
- EXPAND
- FOLD
- REFRESH
- REPLACE_DERIVED
- DEDUP
- RECONSTRUCT

Mandatory retention is controlled separately by trusted runtime contracts.

## Final Components
1. Context Governor
2. Context Workspace
3. Context Source Adapters
4. Elastic Budgeter
5. Context Selector
6. Context Compressor / Fold Engine
7. Context Expander / Reconstructor
8. Context Assembler
9. Context Validator
10. Context Manifest
11. Context Health Diagnostics

## Validation States
Before a model call, compilation can return:
- PASS
- RECOMPILE
- BLOCKED
- INCONCLUSIVE

Known-invalid context must not silently proceed to the model.

## Frozen Invariants
1. Context is never canonical truth/state merely because it was selected.
2. Context transformations never increase authority.
3. Untrusted/retrieved/tool/memory/file content cannot promote itself into privileged instruction space.
4. Required anchors cannot be silently evicted.
5. Cross-principal/project/room/delegation scope is a hard boundary.
6. Derived compression must preserve lineage and reconstruction/expansion references where available.
7. Context ordering must preserve declared semantic order invariants.
8. Memory recall is not evidence.
9. Context cannot manufacture a Truth verdict or hide a required conflict to obtain a clean answer.
10. Context cannot manufacture permission or tool authority.
11. Model context capacity is a ceiling, not a target fill level.
12. Context management must remain useful without embeddings or a compressor model.
13. Private chain-of-thought is not a persistence target for folding/checkpointing.
14. Model/provider changes may require recompilation because tokenization/window/output constraints can change.
15. Context caches/capsules are source-version and policy scoped and must invalidate on relevant dependency changes.
16. Performance optimization cannot override scope, instruction authority, evidence coverage or required anchors.
17. Cross-system reconciliation may alter this architecture only with documented proof of improvement.

## Rejected / Avoided Designs
- full-history-by-default;
- vector-only context selection;
- one universal importance score;
- fixed category shares for every task as final policy;
- untrusted generic system-role projection;
- destructive summaries without source handles;
- model-controlled hard pins;
- continuous background compression;
- silent required-item eviction;
- context as a second Memory database;
- context as a second project/world state store;
- persisting private chain-of-thought;
- relying on huge context windows as a substitute for long-horizon architecture;
- heavyweight learned compression as a mandatory Android dependency.

## Implementation Stages
Implementation is deferred until interacting systems are polished/reconciled:
- `CF-P0`: ContextItem/Workspace/Manifest schemas + ownership bridge
- `CF-P1`: instruction/data authority separation + safe assembler
- `CF-P2`: elastic model/phase/tier Budget Envelope + tokenizer adapters
- `CF-P3`: deterministic selector, dependency closure, dedup and order classes
- `CF-P4`: source adapters for Cognitive/Memory/Truth/Project/Tool/World/Coding
- `CF-P5`: type-aware compression, folding and expansion handles
- `CF-P6`: incremental recompilation, invalidation and prefix/cache optimization
- `CF-P7`: durable derived checkpoints + reconstruction/recovery
- `CF-P8`: optional local semantic rerank/compressor helpers
- `CF-P9`: observability and context-health diagnostics
- `CF-P10`: adversarial, long-horizon, multilingual, mobile and performance gates

## Mandatory Eval Families Before Implementation Freeze
- critical early constraint in very long chat
- irrelevant-history flood
- duplicate-result flood
- prompt injection inside webpage/file/tool/memory content
- cross-room/project/principal leakage
- Arabic/code/JSON token-budget stress
- oversized mandatory item
- elastic budget borrowing/starvation
- chronological-order preservation
- 100+ step task-goal retention
- milestone folding + later exact expansion
- compression fidelity and omitted-detail recovery
- stale source invalidation
- provider/model switch recompilation
- conflict survival through compression
- tool-schema explosion
- verbose tool-result pruning
- coding symbol/range context selection
- RPG canon versus irrelevant lore
- research evidence-lock preservation
- cancellation/recovery from derived context checkpoint
- Lite-tier latency/RAM/battery
- manifest reproducibility
- malicious hard-pin/system-role promotion attempt

## Campaign Handoff
#04 is closed for individual architecture polish.

Next item: **#05 Model Fabric**.

After the individual campaign, #04 must participate in Memory/Truth/Cognitive/Tool ownership reconciliation, whole-Seven Velocity analysis, final red-team and implementation sequencing.
