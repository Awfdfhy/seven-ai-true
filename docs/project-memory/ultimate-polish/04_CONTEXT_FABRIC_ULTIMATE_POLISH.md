# Seven AI — #04 Context Fabric / Context Workspace Ultimate Polish

> Campaign item: **#04 Context Fabric / Context Workspace**
> Status: **PASS A + VELOCITY ASSAULT + PASS B + RECONCILIATION COMPLETE / FREEZE CANDIDATE**
> Target: **Seven Context Fabric 3.0 — Governed Elastic Context Workspace**
> This document is architecture truth, not an implementation-complete claim.

## Prime Law

> **Context is a disposable, reconstructable execution view, never an authority store. Seven should present the model with the minimum sufficient material for the current step, preserve lineage and instruction boundaries, and expand only when the task or uncertainty justifies it.**

A bigger context window is not the goal. The goal is a smaller, cleaner, correctly ordered, source-bound working set that can expand without losing the original material.

---

## 1. Ground Truth

### Current executable foundation
`hardening/context-compiler.cjs` already provides:
- category budgets;
- token estimation;
- pinned/required items;
- scope filtering;
- priority/freshness/trust scoring;
- deterministic selection;
- eviction diagnostics;
- model-message projection with lineage metadata.

`release/control-bridge.js` already feeds task, truth, project, memory, tools and conversation into the compiler.

The protected browser source also contains:
- context-source collection;
- input/history budgeting;
- serialization;
- validation before generation;
- a runtime workspace hook.

`hardening/control-parity.test.cjs` verifies Node/browser compiler parity and basic budget behavior.

Architecture v4 already requires an active workspace with:
- select / rank / dedupe;
- pin / compress / expand / evict / reconstruct;
- explicit category token budgets;
- evidence-aware compilation;
- validation before model invocation.

### Current limitations found
1. Fixed category shares are too rigid. Unused capacity cannot be intelligently borrowed by the categories that actually matter to the current step.
2. Selection is mostly scalar-score + greedy fit. Context importance is not safely reducible to one number.
3. `required`/`pinned` items can still be evicted when the total budget is exhausted, but the compiler only warns after the fact.
4. A default `role: system` projection is too permissive for generic context items.
5. `release/control-bridge.js` currently projects truth, project, memory and tool payloads mostly as system-role messages. Data and instruction authority are therefore insufficiently separated at the compiler contract boundary.
6. The compiler may reorder eligible items by score rather than preserving semantic order classes such as conversation chronology.
7. Character-count/4 token estimation is not reliable enough across models and languages, especially Arabic, code and structured data.
8. Scope filtering is a simple equality check and is not a full principal/project/room/delegation isolation model.
9. No first-class dependency/coherence bundles exist. A selected fragment can outlive a prerequisite that gives it meaning.
10. Oversized content is not governed by structure-aware reduction as a first-class contract.
11. Compression/expansion/reconstruction are architecture targets but not a complete independent governed runtime.
12. There is no formal context manifest binding a model call to exact source revisions, transformations and compilation policy.
13. Full-history or append-heavy strategies remain possible in browser paths; recency is useful but cannot substitute for relevance, task state or evidence coverage.
14. Context health is not yet a first-class diagnostic object.

---

## 2. Research and Competitive Sweep

The external evidence changes the design in several important ways:

- **A Survey of Context Engineering for Large Language Models (2025)** formalizes context engineering as retrieval/generation + processing + management, rather than prompt wording alone.
- **Agentic Context Engineering / ACE (2025)** warns about brevity bias and context collapse from repeated rewriting; incremental structured updates preserve details better than destructive summary replacement.
- **Context as a Tool / CAT (2025)** shows that long-horizon agents benefit when context management becomes an explicit action rather than passive append-only history or emergency compression.
- **Context-Folding (2025)** shows strong long-horizon results from branching into a subtask and folding completed intermediate trajectories while retaining outcomes, using much smaller active context.
- **ACON (2025)** demonstrates that compression policy itself should be optimized against failures rather than treated as a fixed summarization prompt.
- **Evaluating Long-Context Reasoning in LLM-Based WebAgents (2025)** reports severe degradation as irrelevant histories grow, including loops and loss of the original goal.
- **Less Context, Better Agents (2026)** reports that selective retention plus summarization can outperform full history while using far fewer tokens in a long-horizon tool workflow.
- **The Horizon Gap (2026)** reinforces that long-context capacity, long-horizon task reliability and long-term memory are different problems.
- **Latent Context Language Models / LCLM (2026)** supports the broader architectural idea of compressed context with adaptive expansion of relevant regions, even though Seven should not depend on a heavyweight learned compressor.

### Research conclusion
Seven must not equate maximum context with maximum intelligence.

The strongest practical direction is:
**stable anchors + active working set + compact derived capsules + cold source handles + governed expansion.**

---

# PASS A — MAXIMIZE

## 3. Workspace Object Model

### 3.1 `ContextWorkspace`
A per-turn/per-run working object containing:
- workspaceId;
- run/task id;
- task phase / active plan node;
- target model profile;
- policy version;
- scope/principal envelope;
- budget envelope;
- active context items;
- cold source handles;
- compilation diagnostics;
- context manifest hash.

It is **derived execution state**, not canonical Memory, Truth, Project or World state.

### 3.2 `ContextItem`
A context item must carry:
- id;
- role class;
- source system;
- source object/revision refs;
- lineage/transformation;
- scope/principal;
- temporal/freshness metadata where relevant;
- estimated/exact token cost;
- dependency refs;
- retention class;
- compression state;
- instruction/data classification;
- reconstruction handle.

The content may be inline, summarized, chunked or represented by a handle.

### 3.3 Role classes
Final architecture separates context function from truth type:
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

Only a trusted policy/controller path can create `AUTHORITY_INSTRUCTION`.
Retrieved text, webpages, files, memories and tool outputs are data even if they contain imperative language.

### 3.4 `ContextCapsule`
A compact derived representation of larger source material:
- capsuleId;
- source refs and source-version hashes;
- transformation/compressor version;
- retained claims/state/constraints;
- omitted-region metadata;
- fidelity/coverage diagnostics;
- expansion handles;
- token cost.

A capsule never replaces source authority and must be expandable or reconstructable.

### 3.5 `ContextManifest`
Every consequential model call receives a manifest identity containing:
- selected context item ids/revisions;
- source hashes where available;
- transformation ids;
- policy/compiler version;
- model profile;
- token budget;
- required-item coverage;
- compilation timestamp/phase.

This makes context-related failures reproducible and auditable.

---

## 4. Three-Level Active Context

### L0 — Anchors
Small, stable, high-value material:
- privileged policy/instructions;
- task contract and current goal;
- stop/success conditions;
- active scope/permissions projection;
- current plan frontier or world/coding state required for this step.

Anchors are not allowed to disappear silently because a lower-priority category grew.

### L1 — Active Working Set
Material needed for the immediate step:
- recent high-fidelity interactions;
- selected evidence;
- current files/code slices;
- relevant memory capsules;
- active tool schemas/results;
- current conflict/uncertainty capsules.

### L2 — Cold References
Not sent in full:
- old conversation regions;
- full files;
- large research corpora;
- completed tool trajectories;
- expanded provenance;
- inactive world lore;
- old memory episodes.

L2 stays addressable through handles and can be expanded on demand.

---

## 5. Context Actions

The governed action set is:
- `ADD`
- `REMOVE`
- `PIN_SOFT`
- `UNPIN`
- `COMPRESS`
- `EXPAND`
- `FOLD`
- `REFRESH`
- `REPLACE_DERIVED`
- `DEDUP`
- `RECONSTRUCT`

### Hard-pin rule
There is no generic caller-controlled hard pin.
Mandatory retention comes only from policy/task/runtime contracts with explicit authority.
External content cannot declare itself mandatory.

### Model action rule
A model may **propose** context actions. The deterministic Context Governor validates and applies them. The model cannot directly delete anchors, elevate data to instructions, bypass scope, or hide unresolved evidence.

---

## 6. Elastic Budgeting

Fixed percentages are replaced by an **elastic Budget Envelope**.

Each lane may define:
- minimum floor;
- preferred target;
- maximum ceiling;
- borrowability;
- overflow policy;
- compression policy.

Budget is phase-aware:
- simple chat;
- research;
- coding inspect/edit/test;
- RPG/world;
- tool execution;
- verification;
- recovery.

Unused capacity can be borrowed safely.

### Output reserve
Reserve is model/task aware, not merely a fixed integer. The compiler accounts for:
- model context window;
- output cap;
- expected structured output;
- tool call envelope;
- verification/retry headroom.

### Token counting
Priority order:
1. exact/model-compatible tokenizer when cheap and available;
2. provider/model token estimator;
3. conservative language-aware fallback.

The char/4 heuristic is a fallback only, never the final budgeting contract.

---

## 7. Selection Pipeline

Final selection pipeline:

`Task Phase → Scope/Principal Filter → Authority/Instruction Boundary → Validity/Freshness → Required Coverage → Dependency Closure → Exact Dedup → Candidate Ranking → Diversity/Coverage → Elastic Budget Fit → Optional Compression → Optional Semantic Rerank → Order Assembly → Validation → Manifest`

### Hard filters before ranking
The following are not ranking bonuses:
- permission/scope;
- instruction authority;
- invalid/deleted state;
- required task anchors;
- principal isolation;
- known source invalidation.

### Ranking signals
Derived ranking may use:
- current-step relevance;
- task-goal relevance;
- evidence coverage;
- entity/file/beat affinity;
- temporal fit;
- novelty/redundancy;
- recency where appropriate;
- active-plan dependency;
- source role;
- retrieval confidence as a ranking hint only.

No ranking score grants truth or authority.

---

## 8. Order Is Semantics

Context ordering is governed, not an accidental consequence of score sorting.

Assembly classes:
1. privileged authority instructions;
2. task contract / invariant constraints;
3. active state;
4. task-specific evidence/material;
5. tool definitions needed now;
6. chronological short-term interaction;
7. current user turn.

Within chronological conversation slices, original order is preserved.

Context optimization may reorder independent data blocks only when the policy declares that ordering semantically irrelevant.

---

## 9. Compression, Folding and Reconstruction

### Structured compression
Compression is type-aware:
- conversation → decisions, unresolved questions, commitments, referenced facts;
- coding → file/symbol/diff/test/error state;
- research → claim/evidence/locator/uncertainty state;
- tool trajectory → action/result/error/verification state;
- RPG → current world state, canon anchors, player commitments, unresolved hooks;
- project → active requirements, decisions and changed artifacts.

### Never compress blindly
High-risk exact material may be retained or referenced instead of summarized:
- permissions;
- exact user constraints;
- security policy;
- code ranges currently being edited;
- evidence quotations/locators required for verification;
- irreversible-action confirmations.

### Fold completed sub-trajectories
Completed subtasks can be folded into:
- objective;
- verified outcome;
- artifacts/evidence;
- remaining dependencies;
- errors or uncertainty;
- expansion handle.

Do not preserve hidden chain-of-thought. Preserve externally useful decisions, observations and evidence.

### Expansion
If a capsule becomes insufficient, Seven expands only the needed source region rather than restoring the entire history.

---

# VELOCITY ASSAULT

## 10. Fast Paths

### Direct chat fast path
No semantic reranker, compressor model or graph walk by default.
Use:
- anchors;
- current turn;
- bounded recent history;
- already-relevant memory capsule when needed.

### Complex task path
Add active workspace operations only when task length/ambiguity/evidence demands them.

### Cheap-first policy
1. deterministic filters;
2. exact ids/refs;
3. lexical/structural selection;
4. cached capsules;
5. lightweight local classification;
6. semantic retrieval/reranking;
7. model-assisted compression only when justified.

### Prompt/prefix stability
Keep stable privileged/task prefixes as stable as correctness permits, improving provider prompt/KV cache opportunities without making cache behavior part of correctness.

### Incremental compilation
Recompile only lanes affected by changed dependencies. Do not rebuild or re-summarize the entire workspace after every token/tool event.

### Mobile rules
- no mandatory embedding model;
- no continuous background compression;
- bounded indexes and active items;
- lazy expansion;
- optional off-main-thread tokenization/compression;
- Lite tier favors deterministic/lexical/structural context management.

---

# PASS B — DESTROY THE WINNER

## 11. Adversarial Attacks on Pass A

### Attack 1: Context manager becomes another autonomous model
**Failure:** cost, nondeterminism and prompt-injection surface explode.
**Resolution:** deterministic Context Governor owns mutations; models only propose optional semantic actions.

### Attack 2: Summaries silently become canonical state
**Resolution:** capsules remain derived, source-bound and reconstructable.

### Attack 3: Data becomes instruction through role projection
**Resolution:** privileged instruction class is capability-gated. External/tool/memory/project text remains data.

### Attack 4: Fixed budgets starve the actual task
**Resolution:** elastic floors/targets/ceilings with governed borrowing.

### Attack 5: Priority sorting destroys dialogue order
**Resolution:** order classes and chronological invariants are explicit.

### Attack 6: Compression deletes the one detail needed later
**Resolution:** source handles + reversible expansion + coverage diagnostics + noncompressible classes.

### Attack 7: Large context window encourages dumping everything
**Resolution:** minimum-sufficient-context objective; context size is a budget ceiling, not a target.

### Attack 8: Required flags become denial-of-service
**Resolution:** only trusted contracts can create mandatory anchors; oversized mandatory material triggers BLOCKED/RECOMPILE/STRUCTURED-SLICE rather than silent eviction.

### Attack 9: Duplicate tool/search results consume budget
**Resolution:** exact dedup first, source/dependency-aware dedup next, semantic dedup optional.

### Attack 10: Scope leak across rooms/projects/subagents
**Resolution:** principal/scope/delegation envelope is a hard pre-ranking filter and cache key dimension.

### Attack 11: Stale capsule survives source update
**Resolution:** capsule cache keys bind source revisions/hashes + transformation version; dependency invalidation triggers refresh.

### Attack 12: Model switch invalidates token budget
**Resolution:** workspace sources are reusable, compiled prompt is not. Recompile against target model profile.

### Attack 13: Code truncation preserves head/tail but removes edited symbol
**Resolution:** structure-aware file/symbol/line slicing; generic head/tail truncation is last-resort presentation only.

### Attack 14: Research compression merges contradictory evidence
**Resolution:** Truth Fabric owns verdict/conflict; Context preserves distinct evidence refs and unresolved conflict capsules.

### Attack 15: Memory recall is treated as evidence
**Resolution:** MEMORY_RECALL lane remains labeled recall; world truth requires Truth/Evidence binding.

### Attack 16: Context tool removes inconvenient evidence
**Resolution:** evidence-lock/verification requirements can create protected coverage requirements. Model proposals cannot hide them.

### Attack 17: Completed subtask fold lies about success
**Resolution:** folded outcome status comes from Cognitive/Verification runtime, not compressor prose.

### Attack 18: Huge tool schemas flood context
**Resolution:** Tool Fabric exposes only plan-relevant normalized capabilities/schema fragments.

### Attack 19: Continuous compression drains battery
**Resolution:** event/milestone-triggered, budget-triggered or explicit compression only.

### Attack 20: Context workspace turns into a second memory database
**Resolution:** persistence is limited to derived checkpoints/manifests needed for durable runs; canonical reusable knowledge stays in Memory Fabric.

---

# RECONCILIATION — FINAL ARCHITECTURE

## 12. Final Target

# **Seven Context Fabric 3.0 — Governed Elastic Context Workspace**

The architecture is an active, policy-governed, reconstructable working set between Seven's authoritative systems and the model.

### Core components
1. **Context Governor** — validates and applies workspace actions.
2. **Context Workspace** — active per-run/per-turn working set.
3. **Context Source Adapters** — receive capsules/slices from Memory, Truth, Project, Tools, World, Research and Coding.
4. **Elastic Budgeter** — phase/model/tier-aware floors, targets, ceilings and reserve.
5. **Context Selector** — hard filters, dependency closure, relevance/coverage ranking and dedup.
6. **Context Compressor/Fold Engine** — type-aware derived capsules and completed-subtrajectory folding.
7. **Context Expander/Reconstructor** — restores exact relevant source regions on demand.
8. **Context Assembler** — role-safe ordering and final model-message construction.
9. **Context Validator** — checks scope, authority boundary, required coverage, stale refs, token fit and ordering.
10. **Context Manifest** — reproducible identity for the final context projection.
11. **Context Health Diagnostics** — derived metrics only, never authority.

---

## 13. Ownership Boundaries

### Cognitive Runtime owns
- task/run state;
- plan frontier;
- cancellation/recovery state;
- execution phase.

Context receives projections of these; it does not redefine them.

### Memory Fabric owns
- durable reusable memory;
- memory retrieval and source lineage.

Context receives `MemoryCapsule`/memory slices; recall is not evidence.

### Truth Fabric owns
- claim/evidence/verdict semantics;
- evidence locks and conflicts.

Context cannot promote a claim to FACT or resolve conflict by omission.

### Tool Fabric owns
- capability/schema truth;
- tool result validation/side-effect state.

Context selects relevant projections only.

### Projects / Coding / World own
- canonical project/file/world/work progression state.

Context contains source-bound slices, never alternate mutable copies.

---

## 14. Validation Contract Before Every Model Call

A context compile may return:
- `PASS`
- `RECOMPILE`
- `BLOCKED`
- `INCONCLUSIVE`

Mandatory checks:
- model token budget fits with reserve;
- required anchors present;
- no untrusted item occupies privileged instruction lane;
- scope/principal access valid;
- source refs/revisions valid where required;
- no dangling dependency required for interpretation;
- chronological lanes preserve order;
- unresolved evidence/conflicts required by policy are not silently removed;
- stale derived capsules are refreshed or marked;
- output manifest created.

Seven must not silently call the model with a known-invalid context.

---

## 15. Context Health Metrics

Track at workspace/call level:
- total input tokens;
- tokens by lane;
- required-context recall;
- irrelevant/redundant token ratio;
- compression ratio;
- capsule expansion rate;
- stale capsule count;
- duplicate count;
- source coverage;
- scope-filter count;
- compile latency;
- token-count latency;
- semantic-rerank latency;
- prompt-prefix stability/cache opportunity;
- task-drift indicators;
- context-related retry rate;
- reconstruction completeness.

No universal `context quality score` is canonical.

---

## 16. Performance Tiers

### Lite
- deterministic filters;
- exact/lexical/structural selection;
- small recent interaction window;
- cached type-aware capsules;
- no mandatory semantic embedding/reranker;
- strict bounded context operations.

### Balanced
- optional local semantic selection/reranking;
- milestone compression;
- broader evidence/project expansion when needed.

### Full
- deeper bounded semantic reranking;
- richer adaptive compression/expansion;
- multi-source context planning for complex research/coding tasks.

Correctness, scope and instruction authority are identical across tiers. Only optional intelligence/depth changes.

---

## 17. Mandatory Eval Families

Before implementation freeze:
1. long chat with critical early constraint;
2. irrelevant-history flooding;
3. duplicate evidence flooding;
4. prompt injection inside webpage/file/tool output;
5. memory text containing imperative instructions;
6. cross-room/project/principal leak attempt;
7. Arabic-heavy context token budgeting;
8. code + JSON + multilingual token-budget stress;
9. mandatory item larger than remaining budget;
10. category starvation and budget borrowing;
11. chronological conversation-order preservation;
12. exact task-goal retention after 100+ steps;
13. milestone folding and later expansion;
14. compression fidelity / omitted-detail recovery;
15. stale source revision invalidating capsule;
16. model/provider switch requiring recompilation;
17. conflicting evidence preserved through compression;
18. tool-schema explosion;
19. verbose tool-result pruning;
20. coding symbol/range retrieval versus head-tail truncation;
21. RPG canon state versus unrelated lore;
22. research claim-evidence lock survival;
23. cancellation + durable context checkpoint recovery;
24. Lite-tier RAM/CPU/battery/latency;
25. context manifest reproducibility;
26. malicious caller attempting privileged hard pin/system promotion.

### Success criteria
- zero scope leaks;
- zero untrusted privileged-role promotions;
- zero silent loss of mandatory anchors;
- bounded compile latency and RAM;
- materially lower irrelevant-token usage than full-history baseline;
- no statistically meaningful task-quality regression under normal compression budgets;
- improved long-horizon task stability versus append-only/full-history baselines.

---

## 18. Implementation Stages

Implementation remains deferred until cross-system reconciliation.

- `CF-P0` — canonical ContextItem/Workspace/Manifest schemas + ownership bridge.
- `CF-P1` — instruction/data authority separation and safe assembler.
- `CF-P2` — elastic model/phase/tier Budget Envelope + tokenizer adapters.
- `CF-P3` — deterministic selector, dependency closure, dedup and order classes.
- `CF-P4` — source adapters for Cognitive/Memory/Truth/Project/Tool/World/Coding.
- `CF-P5` — type-aware compression, folding and expansion handles.
- `CF-P6` — incremental recompilation, dependency invalidation and cache/prefix optimization.
- `CF-P7` — durable derived checkpoints + reconstruction/recovery.
- `CF-P8` — optional local semantic rerank/compressor helpers.
- `CF-P9` — observability/context health diagnostics.
- `CF-P10` — adversarial, long-horizon, multilingual, mobile and performance eval gates.

---

## 19. Proof-of-Improvement Requirements

Pass B changes survive only if they beat the current/fixed-share design on at least one meaningful dimension without unacceptable regression:
- task completion;
- required-context recall;
- context token efficiency;
- instruction isolation/security;
- long-horizon stability;
- compilation latency;
- RAM/battery use;
- reconstruction fidelity;
- recovery robustness.

A larger context window or lower token count alone is not proof of improvement.

---

## 20. Rejected / Avoided Designs

- always send full history;
- vector-search-only context selection;
- one universal context score;
- one fixed category percentage table for every task;
- automatic model-controlled hard pins;
- generic external content rendered as privileged system instruction;
- destructive summarization with no source handle;
- continuous background compression;
- silently dropping required context when over budget;
- treating Memory recall as evidence;
- using Context Workspace as canonical Memory or project state;
- persisting private chain-of-thought as context history;
- blindly trusting million-token windows to solve long-horizon reliability;
- making heavy learned compression a base-APK dependency.

---

## 21. Freeze Candidate

Pass A maximized context intelligence. Pass B removed dangerous complexity and authority leakage. Velocity assault moved optional semantic work off the ordinary fast path.

The resulting candidate is deliberately not the system with the most context. It is the system with the strongest **context discipline**:

**small stable anchors + relevant active workspace + source-bound capsules + cold handles + governed expansion + explicit validation.**

Recommended campaign outcome: **FREEZE Seven Context Fabric 3.0 architecture; defer implementation until cross-system reconciliation.**
