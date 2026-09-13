# Seven AI — Cognitive Runtime Ultimate Polish

> **Campaign Item:** 01 — Cognitive Runtime
> **Protocol:** `SEVEN_ULTIMATE_POLISH_PROTOCOL.md` v2.1
> **Method:** Full-strength Pass A -> Velocity Assault -> full-strength Pass B -> Velocity Regression Assault -> Reconciliation
> **Result:** **ARCHITECTURE FREEZE CANDIDATE**
> **Implementation truth:** PARTIAL / FOUNDATION EXISTS. This document does not claim that the final architecture below is implemented, wired, benchmarked, or production-verified.
> **Protected-source rule:** This polish does not require modifying `seven_ai-final.html`.

---

# Maximum Effort Command — Cognitive Runtime

**Goal:** Reconstruct Seven's Cognitive Runtime as the smallest practical control plane capable of safely orchestrating direct responses, deterministic workflows, open-ended agentic work, tools, models, memory, context, verification, recovery, user steering, side effects, and Android resource constraints without turning the controller into a monolith.

Use maximum practical depth of repository inspection, current architecture research, adversarial analysis, performance reasoning, failure engineering, and comparison. Preserve mature Seven foundations where they remain correct. Treat model plans as proposals, never authority. Separate authoritative execution state from derived plans, context, UI projections, model confidence, and tool output. Explicitly test crash recovery, duplicate dispatch, uncertain side effects, cancellation races, stale plans, parallel conflicts, app/process loss, resource pressure, long waits, user interrupts, provider failures, loops, and schema evolution.

Prefer simple deterministic paths for simple tasks and progressively escalate only when measurable task needs justify additional agentic complexity. Do not import a heavyweight orchestration framework merely because its concepts are useful. Borrow proven primitives while keeping the Android/runtime footprint small. The final design must integrate with Truth Fabric, Memory Fabric, Context Workspace, Model Fabric, Tool Fabric 2.0, Tool Security, Side-Effect Ledger, Verification/Judge, Resource Governor, Velocity Fabric, Observability, Recovery, and Android execution semantics without duplicating their authority.

Freeze only an architecture whose authority model, state transitions, durability semantics, cancellation semantics, side-effect reconciliation, performance path, eval contract, and migration path are explicit.

---

# 1. Ground Truth Audit

## Existing strong foundations

The repository already contains real Cognitive Runtime foundations rather than only plans:

- `release/control-runtime.js`
  - explicit task states and transition rules
  - Task Contract creation and capability scoping
  - epistemic claim helpers
  - Context compilation
  - Resource tier/budget logic
  - Side-effect ledger helpers
- `release/control-bridge.js`
  - Research -> Truth bridge
  - Canon commit guard
  - resource synchronization
  - task-context compilation bridge
- `release/execution-bridge.js`
  - execution runs
  - tool authorization
  - side-effect idempotency requirement
  - tool attempt / verify / fail lifecycle
  - verification and commit gate
  - cancellation
  - checkpoints and restore
- `hardening/task-contract.cjs`
  - explicit scope, evidence, budget, verification and lineage fields
- `hardening/resource-governor.cjs`
  - Full / Balanced / Lite resource decisions
- `hardening/side-effect-ledger.cjs`
  - PLANNED / ATTEMPTED / VERIFIED / FAILED / UNCERTAIN / RECONCILED / ROLLED_BACK
- `evolution/cognitive-boost.cjs`
  - adaptive compute concepts
  - mission dependency graph
  - route outcomes
  - adversarial evaluation concepts
- `evolution/cognitive-gate.cjs`
  - preflight cognitive/adversarial gate
- `evolution/durable-engine.cjs`
  - durable checkpoint/recovery concepts for the evolution subsystem
- parity, hardening, runtime and release tests already exercise a meaningful subset of these contracts.

## Ground-truth limits

The current implementation is not yet one coherent durable Cognitive Run Kernel.

Material gaps/duplications observed:

1. **Execution state and mission/planning state are split across multiple orchestration models.** `cognitive-boost` has mission task state while `execution-bridge` has run/task state.
2. **Durability is checkpoint-oriented rather than a unified semantic transaction model for all important run transitions.**
3. **Current checkpoints can snapshot the whole run, including growing histories.** This risks progressively increasing serialization/storage work for long runs.
4. **Cancellation currently can make a run terminal immediately even when a dispatched side effect may still need reconciliation.** The architecture needs a nonterminal cancelling/recovery phase.
5. **The controller currently contains logic that ultimately belongs to other fabrics** (Truth, Resource Governor, routing, etc.). A stronger final runtime should consume those systems through contracts rather than duplicate policy.
6. **The plan representation is not yet a first-class versioned Plan IR with deterministic validation, resource access sets, effect classes and progressive expansion.**
7. **WAITING / resumable external-input semantics are not first-class in the main task state machine.**
8. **Crash/reload recovery is not yet specified as a universal run lifecycle with reconciliation-before-retry.**
9. **Parallel execution lacks a unified conflict/resource/budget reservation model.**
10. **Android background execution cannot be treated as guaranteed merely because JavaScript state is persisted.** Platform-backed persistent work must be explicit when required.

Therefore this polish preserves the existing foundations but changes the center of gravity: Seven should have a **thin deterministic run kernel plus composable fabrics**, not an ever-growing smart controller.

---

# 2. External Evidence Sweep

Research used as design evidence:

- Anthropic, **Building Effective AI Agents**: simple composable workflows should be preferred until additional agentic complexity demonstrably improves outcomes; routing, parallelization, orchestrator-workers, evaluator-optimizer and open-ended agents are different useful patterns rather than one universal loop.
  - https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, **Effective Context Engineering for AI Agents**: just-in-time context and isolated sub-agent contexts reduce unnecessary context load.
  - https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, **Harness design for long-running application development**: repeatedly stress-test harness complexity because assumptions encoded in orchestration can become unnecessary as models improve.
  - https://www.anthropic.com/engineering/harness-design-long-running-apps
- Temporal durable execution documentation: persist workflow progress, separate orchestration from failure-prone activities, and resume after failures instead of rebuilding progress manually.
  - https://docs.temporal.io/
  - https://temporal.io/
- LangGraph persistence / interrupts / subgraphs: checkpoints support recovery and external interrupts; re-executed work around interrupts must be replay-safe/idempotent; per-invocation isolation avoids unnecessary shared state.
  - https://docs.langchain.com/oss/python/langgraph/persistence
  - https://docs.langchain.com/oss/python/langgraph/interrupts
  - https://docs.langchain.com/oss/python/langgraph/use-subgraphs
- Android background work guidance: persistent work outside the visible process requires platform-appropriate mechanisms such as WorkManager rather than assuming the app process stays alive.
  - https://developer.android.com/develop/background-work
  - https://developer.android.com/develop/background-work/background-tasks/persistent
- MDN Prioritized Task Scheduling: user-blocking / user-visible / background priorities, cancellation signals and cooperative yielding are useful when supported, but require fallbacks because availability is not universal.
  - https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API

**Decision:** borrow primitives, not framework weight. Seven does not need Temporal or LangGraph as mandatory runtime dependencies to gain durable checkpoints, interrupts, progressive graphs, activity boundaries and replay safety.

---

# 3. Pass A — MAXIMIZE

Pass A produced the following candidate.

## Candidate A: Durable Cognitive Orchestrator

Core ideas:

1. Task Contract as explicit execution boundary.
2. Versioned Dynamic Execution Graph for complex work.
3. Durable semantic checkpoints and run journal.
4. Scheduler with dependency-aware parallelism.
5. Activity boundary for model/tool/network/non-deterministic work.
6. Verification before canonical commit.
7. Hierarchical cancellation and budgets.
8. User interrupts/resume as first-class events.
9. Side-effect reconciliation before retries.
10. Adaptive compute and resource-tier integration.

Candidate A was materially stronger than the current loose combination of mission graph + execution run + checkpoints, but Pass B found that it could still become too heavy if applied uniformly.

---

# 4. Velocity & Smoothness Assault on Candidate A

The fastest runtime is not a universally durable graph engine. The architecture must avoid charging every trivial interaction for capabilities needed only by long-running tasks.

## Required fast-path separation

Every task is classified into an **Execution Style** independently of its **Durability Class**.

### Execution Style

- `DIRECT`
  - one bounded operation or response
  - no general planner required
- `WORKFLOW`
  - known composable sequence / routing / parallel pattern
  - deterministic orchestration dominates
- `AGENTIC`
  - open-ended task where the next useful action depends on observations during execution
  - progressive planning/replanning allowed

Escalation is monotonic when uncertainty or complexity increases. A local/lightweight classifier may recommend a route, but risk/authority rules can force escalation. The route is derived state, not authority.

### Durability Class

- `EPHEMERAL`
  - trivial/read-only work that can safely restart
  - minimum persistence overhead
- `CHECKPOINTED`
  - multi-step work where preserving progress matters but no unresolved irreversible effect exists
- `DURABLE_EFFECTFUL`
  - writes, external communication, high-risk actions, user approvals, long waits, or any task where duplicate execution could cause harm

A run may escalate durability. It must not silently downgrade after an effect/approval/durable boundary.

## Critical-path improvements

- Planner and graph code are lazy-loaded only for `WORKFLOW`/`AGENTIC` paths.
- The full Tool Fabric catalogue is not loaded into every run; progressive capability discovery supplies only relevant contracts.
- Context is compiled just in time from references rather than preloading all project/memory/tool data.
- Independent read-only nodes may run concurrently within Resource Governor limits.
- Verification uses cheap deterministic checks first, then deeper judges only when task risk/uncertainty requires them.
- Checkpoint writes occur at semantic durability boundaries, not every micro-event.
- Event writes may be safely batched/coalesced between mandatory durability barriers.
- Large model/tool results live as artifact/evidence references, not repeatedly deep-copied into the run object.
- Long synchronous work yields to the UI. `scheduler.postTask` / `scheduler.yield` may be used when supported, with a small fallback scheduler elsewhere.
- User interaction and cancellation always outrank background maintenance.

## Concrete current-runtime performance concern

`release/execution-bridge.js` currently checkpoints a clone of the whole run. The run itself contains event/call/effect histories. Long runs can therefore make checkpoint serialization progressively more expensive. The polished design replaces whole-history checkpoint cloning with:

- compact `RunHead`
- append-only semantic `RunJournal`
- content-addressed artifact/evidence references
- periodic compact snapshots that do **not** recursively embed the journal

This is both a durability and velocity improvement.

---

# 5. Pass B — DESTROY THE WINNER

Pass B treated Candidate A as a hostile design and found these failure modes.

## Attack 1: Event-sourcing everything

**Failure:** full event sourcing of every token, UI event and transient scheduler decision would inflate storage, replay time and implementation complexity.

**Resolution:** use a **Transactional Run Journal**, not universal event sourcing. Persist only semantic state-changing/recovery-relevant events. Token streaming and transient UI detail stay outside the authoritative journal.

## Attack 2: Giant upfront DAG

**Failure:** a full plan generated before execution adds latency, becomes stale after new observations, and wastes model/context work.

**Resolution:** use a **Progressive Plan Frontier**. Plan enough to expose safe near-term work, then expand only when necessary. Known workflows may compile their complete small graph deterministically.

## Attack 3: Central-controller monolith

**Failure:** putting truth scoring, model ranking, permission policy, tool schemas, resource tier logic and memory policy inside Cognitive Runtime creates duplicated authority and a single maintenance bottleneck.

**Resolution:** Cognitive Runtime becomes a thin orchestrator. Other fabrics own their domains. The kernel requests decisions and records references to them.

## Attack 4: Cancellation falsely equals completion

**Failure:** immediately transitioning to terminal `CANCELLED` after a remote dispatch can hide an effect that actually completed.

**Resolution:** add `CANCELLING` as a nonterminal run state. Stop new dispatch immediately, propagate cancellation, then settle attempts. Uncertain dispatched effects enter reconciliation. Terminal `CANCELLED` is allowed only when the runtime has a safe final effect disposition. Otherwise the run moves through `RECOVERING`, and may finish `INCONCLUSIVE` if reality cannot be established.

## Attack 5: Replay re-executes non-deterministic work

**Failure:** calling a model/tool/network/random/clock function again during recovery can create a different history or duplicate an effect.

**Resolution:** the deterministic kernel replays **recorded observations**, not external actions. Non-deterministic operations live behind the Activity/Execution Adapter boundary.

## Attack 6: Parallel branches overspend or collide

**Failure:** independent-looking branches may write the same file/resource, exceed the parent budget, or race for an external side effect.

**Resolution:** Plan Nodes declare resource `readSet` / `writeSet`, effect class and budget reservation. The scheduler uses conflict checks plus hierarchical reservations before dispatch.

## Attack 7: Durable subagents share hidden state

**Failure:** persistent worker/subagent state creates cross-task contamination and checkpoint conflicts.

**Resolution:** child runs are isolated **per invocation by default**. They inherit only explicitly scoped inputs, budget and capability requirements. Persistent child state is opt-in and owned by the appropriate Memory/Project system, never an accidental scheduler feature.

## Attack 8: Checkpoint every step

**Failure:** phone storage/serialization overhead can dominate short tasks.

**Resolution:** checkpoint at **semantic durability barriers**: before/after high-risk effects, before indefinite waits/approval, after expensive milestones worth preserving, and at bounded intervals for long work. `EPHEMERAL` tasks skip graph persistence entirely.

## Attack 9: Planner broadens authority

**Failure:** a model-generated plan can invent a new target, domain, capability or write scope.

**Resolution:** Plan validation is monotonic: it may narrow the Task Contract but cannot broaden it. Any required expansion becomes a user-authorized contract amendment event, not a planner decision.

## Attack 10: Android background promises

**Failure:** a web/Capacitor JS process can be killed. Persisting a checkpoint does not guarantee continuous execution.

**Resolution:** distinguish **resumable** from **platform-persistent** work. If execution must continue after app/process loss, dispatch through an explicit Android host/background capability appropriate to the task. Otherwise park safely and resume on foreground.

## Attack 11: Verification everywhere

**Failure:** deep verification on every trivial node destroys latency/battery without increasing useful reliability.

**Resolution:** verification depth is risk/evidence/effect aware. Some invariants remain mandatory regardless of tier: permissions, effect uncertainty, scope, commit integrity and required success criteria.

## Attack 12: Orchestration assumes current models stay weak

**Failure:** excessive harness structure can become dead weight as models improve.

**Resolution:** every orchestration layer must be benchmark-removable. Templates, critic loops and multi-agent decomposition are optional policies behind eval gates, not permanent mandatory ceremony.

---

# 6. Reconciliation — Final Architecture

## Freeze Candidate Name

# **Seven Cognitive Runtime 3.0 — Event-Governed Adaptive Run Kernel**

The name is an architecture target, not an implementation-version claim.

## Prime design rule

> **Thin deterministic kernel, rich specialized fabrics. Models propose. The kernel validates, schedules, records and commits.**

The kernel does not try to be Truth Fabric, Model Fabric, Tool Security, Memory, Resource Governor or Verification. It coordinates them through typed contracts.

---

# 7. Final Component Model

## A. Intent Lock + Task Contract v2

The original user instruction remains the root authority. `TaskContractV2` is the canonical operational interpretation used for execution, but it may never exceed its source authority.

Required fields:

- `taskId`
- `protocolVersion`
- `goal`
- `intentSourceRefs`
- `constraints`
- `scope`
- `riskClass`
- `capabilityScope`
- `deniedCapabilities`
- `authorityGrantRefs` (references only; Security Kernel owns grants)
- `privacyEgressPolicy`
- `budgets`
  - hard and soft limits
  - model/tool/network/time/memory/resource dimensions where measurable
- `successCriteria`
- `verificationRequirements`
- `stopConditions`
- `deadline`
- `interactionPolicy`
- `durabilityClass`
- `lineage`
- `revision`

### Contract amendment law

A plan may narrow a contract automatically. Broadening target/scope/authority/destructive power requires an authoritative amendment source. Every amendment is revisioned and lineage-bound.

---

## B. Deterministic Run Kernel

The Run Kernel owns only execution lifecycle invariants.

### Final run states

- `CREATED`
- `PLANNING`
- `EXECUTING`
- `WAITING`
- `VERIFYING`
- `COMMITTING`
- `CANCELLING`
- `RECOVERING`
- `BLOCKED`
- `COMPLETED`
- `INCONCLUSIVE`
- `FAILED`
- `CANCELLED`

`COMPLETED`, `INCONCLUSIVE`, `FAILED`, and `CANCELLED` are terminal.

### Important semantics

- `WAITING`: healthy resumable wait for user input, timer, rate limit, dependency, provider availability, or platform resume.
- `BLOCKED`: progress cannot continue until a missing requirement is resolved; not terminal.
- `CANCELLING`: cancellation requested; no new normal work may dispatch; in-flight work is settling.
- `RECOVERING`: crash/reload/uncertain dispatch/schema recovery or side-effect reconciliation is active.
- `INCONCLUSIVE`: runtime reached a safe terminal state but required truth/effect/success certainty could not be established.

### Commit fence

Entering `COMMITTING` is a semantic fence. Cancellation may stop optional downstream work but may not pretend an atomic commit did not happen. Commit adapters must define their own atomicity/rollback semantics.

---

## C. Transactional RunHead + RunJournal

### `RunHead`

Compact current state:

- run id / task id
- revision
- state
- execution style
- durability class
- active plan version
- active/waiting node refs
- budget ledger ref
- cancellation epoch
- latest durable sequence
- unresolved effect refs
- protocol/schema versions
- timestamps

### `RunJournal`

Append-only **semantic** events, for example:

- task accepted/amended
- plan created/revised
- node state changed
- observation recorded
- capability/security decision referenced
- effect dispatch referenced
- verification result recorded
- wait opened/resumed
- cancellation requested/propagated
- run transition
- checkpoint committed
- recovery started/completed
- budget reservation/release

A durable transition atomically advances `RunHead.revision` and appends its journal event where the storage adapter permits. Divergence is a recovery fault, never silently ignored.

### Snapshot rule

Periodic compact snapshots accelerate load/recovery but never recursively contain full journal history. Large outputs are referenced by artifact/evidence id/hash.

---

## D. Progressive Plan IR

The plan is **derived and revisable**, not truth or authority.

`PlanGraphVersion` contains a bounded frontier of `PlanNode`s.

Each `PlanNode` declares:

- id / version
- purpose
- dependencies
- preconditions
- expected output/artifact
- required capability identities
- `readSet`
- `writeSet`
- side-effect class
- permission/approval requirements
- retry class
- timeout/deadline
- expected evidence
- verification contract
- resource/cost estimate
- priority
- speculative eligibility
- executor hint
- expansion condition

### Plan Validator

Before nodes become runnable, deterministic validation checks:

- no scope/authority expansion
- dependency validity / cycle rules
- capability availability
- permission requirements
- budget feasibility
- effect classification
- read/write conflicts
- mandatory verification
- durability escalation requirements

### Progressive planning

Open-ended agent work plans only enough safe frontier to proceed. New observations can extend or revise the future graph without invalidating already verified work.

---

## E. Adaptive Scheduler

The scheduler operates on the validated runnable frontier.

### Priority classes

- `USER_BLOCKING`
- `USER_VISIBLE`
- `BACKGROUND`

### Scheduling laws

- Resource Governor owns concurrency ceilings.
- Independent read-only work may parallelize.
- Conflicting writes/effects do not parallelize without an explicit safe transaction model.
- Child work reserves budget from the parent before dispatch.
- Queues are bounded and apply backpressure.
- Interactive/cancellation work outranks maintenance.
- Starvation prevention exists for legitimate lower-priority work.
- CPU-heavy in-process work yields cooperatively to preserve UI smoothness.
- Browser prioritized scheduling is opportunistic, never a required API.

---

## F. Execution / Activity Boundary

All important non-determinism is outside the deterministic reducer:

- model calls
- tool calls
- network
- browser actions
- filesystem/device operations
- wall clock/timers
- randomness
- external user input
- remote connector state

Each attempt returns an `ObservationEnvelope` containing relevant fields such as:

- logical node id
- attempt id
- source/executor identity
- request/input hash
- result artifact/evidence ref
- timestamps
- status
- trust/authority metadata refs
- usage/resource evidence
- error/uncertainty state
- lineage

The kernel records the envelope and reduces state. Recovery reuses recorded observations rather than re-calling the external world merely to reconstruct history.

### Logical node vs physical attempt

A retry creates another attempt for the same logical node. Observability and idempotency must not confuse retries with new semantic work.

---

## G. Side-Effect Safety Integration

Cognitive Runtime consumes the canonical Side-Effect Ledger rather than duplicating it.

Rules:

- any effectful operation gets an idempotency/reconciliation identity before dispatch
- dispatch certainty is recorded separately from effect verification
- timeout after possible dispatch becomes uncertain, not failed
- no automatic repeat while effect state is uncertain
- cancellation cannot erase reconciliation obligations
- commit is blocked by unresolved mandatory effects
- retries follow `SAFE_REPEAT / KEYED_REPEAT / DO_NOT_REPEAT / UNKNOWN`

---

## H. Structured Cancellation Tree

Every run owns a root cancellation scope. Child nodes/subruns receive derived cancellation scopes.

Cancellation sequence:

1. Record `cancel.requested` and enter `CANCELLING`.
2. Stop scheduling new ordinary work.
3. Propagate abort to compatible model/tool/network operations.
4. Wait for local acknowledgement within bounded time.
5. Convert dispatched-but-unconfirmed effects to explicit uncertainty.
6. Reconcile effect state where possible.
7. Reach `CANCELLED` only when safe terminal semantics are known; otherwise recover or terminate `INCONCLUSIVE` with evidence.

Detached background work is prohibited unless the Task Contract explicitly permits it and ownership is transferred to a persistent subsystem.

---

## I. Interrupt / Wait / Resume Protocol

A wait is a persisted object with:

- `waitId`
- reason/type
- createdAt/deadline
- expected signal schema
- resume policy
- checkpoint sequence
- authority requirement

User approval, clarification, external callback, rate-limit sleep, Android foreground return, or provider recovery arrive as explicit signals. Resume continues from the durable boundary rather than replaying arbitrary pre-wait side effects.

---

## J. Bounded Replanning

Replanning may trigger only from a material cause:

- new observation invalidates a precondition
- required capability unavailable
- verification fails
- user steering/contract amendment
- budget/resource state changes materially
- repeated execution failure
- newly discovered evidence conflict

Controls:

- replan budget
- repeated-plan hash detection
- no-progress detector
- repeated-node failure threshold
- successful-node preservation unless explicitly invalidated
- plan diff / reason record

A model is never allowed to loop simply because it can invent another step.

---

# 8. Authority Model

## Authoritative or authority-bearing

- original user/system instruction sources
- Task Contract operational scope, bounded by those sources
- authoritative permission grants owned by Security Kernel
- committed `RunHead` revision
- semantic `RunJournal`
- canonical Side-Effect Ledger
- canonical state owned by Memory/Project/File/World/etc. after their commit gates

## Derived / revisable

- execution style choice
- durability recommendation before escalation
- plan graph
- route/model/tool ranking
- context assembly
- progress estimate
- summaries
- planner rationales
- evaluator opinions
- UI projection
- caches

## Observation/evidence

Model/tool/provider outputs are recorded evidence/observations. They become authoritative only through the rules of the owning system. Repetition, agreement or confidence does not elevate authority by itself.

---

# 9. Child Runs / Multi-Agent Rule

Multi-agent execution is optional, not the default.

When justified:

- child runs are isolated per invocation by default
- parent passes minimum explicit inputs
- parent delegates only a subset of its scope/budget/capability requirements
- child cannot mint authority
- child returns artifact/evidence references, not direct writes to parent canonical state
- parent verification/commit decides what is accepted
- persistent child memory is explicit and belongs to Memory/Project systems

This prevents hidden shared-state contamination and keeps parallel workers disposable.

---

# 10. Cognitive Runtime / Fabric Boundaries

## Truth Fabric owns
- epistemic states
- source authority/provenance
- contradiction/freshness logic

Cognitive Runtime only requests truth decisions and records refs.

## Model Fabric owns
- provider/model capability profiles
- model routing evidence
- health/fallback

Cognitive Runtime requests a model route under task constraints.

## Tool Fabric + Tool Security own
- capability identity/schema
- discovery/ranking metadata
- permission/risk gates

Cognitive Runtime requests/executes validated capabilities; it cannot grant them.

## Resource Governor owns
- device/resource tier
- concurrency ceilings
- heavy-capability restrictions

Cognitive Runtime obeys the supplied resource budget.

## Context Workspace owns
- selected context and context actions

Cognitive Runtime requests context for the current node/task.

## Verification/Judge owns
- verification strategies/evidence interpretation

Cognitive Runtime invokes required checks and gates commit on results.

## Recovery owns
- storage integrity/migrations/recovery adapters

Cognitive Runtime defines run semantics and consumes those primitives.

This boundary cleanup is a major simplification over duplicating Truth, route, resource and permission policy inside the controller.

---

# 11. Android Reality Contract

Seven must distinguish three cases:

1. **Foreground in-process work**
   - ordinary JS/async execution
   - cancelled if process disappears unless checkpointed
2. **Resumable work**
   - persistent run state exists
   - process may stop
   - Seven resumes from a safe boundary when app/runtime returns
3. **Platform-persistent work**
   - execution must continue after app leaves foreground/process recreation
   - requires an Android host/background mechanism suitable for that class of work

No UI message may imply that a long task is still physically executing after Android has suspended/killed the process unless a platform executor/remote host actually owns it.

---

# 12. Velocity Freeze Candidate

## Cold path

Must not synchronously initialize:

- full dynamic planner
- full Tool Fabric catalogue
- browser automation
- local models
- deep verification specialists
- research engines
- background schedulers not needed for startup

## Hot direct path

Target flow:

`input -> minimal Task Contract -> light route decision -> minimal context -> model/deterministic action -> required cheap checks -> stream/render`

No general DAG required.

## Agentic path

Target flow:

`contract -> progressive frontier -> validate -> schedule safe ready nodes -> observe -> update -> verify/replan -> commit`

## Storage efficiency

- semantic deltas, not whole-run rewrites
- compact snapshots
- artifact references
- bounded event retention/compaction policy with integrity guarantees
- indexes by run/task/state/wait/effect ref

## Main-thread protection

- no unbounded JSON stringify/parse clones of growing run histories on interaction paths
- cooperative yielding for long JS work
- large parsing/indexing moves off the critical UI path where practical
- batched projection updates

## Provisional regression gates

Final numeric budgets require real reference-device measurement. Until then:

- simple/direct tasks must show no material median orchestration regression versus current runtime
- cold startup / time-to-interactive must show no material regression from unused Cognitive Runtime features
- cancellation intent propagation must be observable immediately and abort compatible in-flight work without waiting for planner completion
- long-run checkpoint cost must not grow by repeatedly serializing the full historical journal
- memory/storage growth must be approximately proportional to new semantic events/artifacts, not repeatedly proportional to total history
- background work must not cause visible interaction starvation

Reference-device benchmarks must turn these into numeric p50/p95 budgets before implementation Freeze.

---

# 13. Security / Failure Semantics

Required invariants:

1. Plan cannot grant authority.
2. Tool/model output cannot mutate canonical run state except through validated reducer events.
3. External input is untrusted until owning subsystem validates it.
4. Unknown effect outcome stays unknown.
5. Retry is forbidden when it can duplicate an unresolved effect.
6. Child task cannot exceed parent scope/authority/budget.
7. Resource exhaustion degrades optional intelligence before mandatory safety.
8. Run recovery cannot re-dispatch an old external action just to recreate state.
9. Schema/version mismatch enters migration/recovery, not best-effort silent coercion.
10. Large/hostile plans are bounded by node/edge/budget limits.
11. Planner output must pass structural validation before scheduling.
12. User steering is recorded as an input event and cannot silently rewrite history.
13. Internal private reasoning/chain-of-thought is not persisted; store concise decision records, plan diffs and evidence instead.

---

# 14. Observability Contract

Every run should expose redacted structured diagnostics with IDs for:

- run
- task
- plan version
- logical node
- physical attempt
- model/tool/provider route refs
- effect refs
- checkpoint/journal sequence

Measure:

- queue delay
- planning latency
- context compilation latency
- first-action latency
- model/tool/network latency
- verification latency
- commit latency
- wait duration
- recovery latency
- retry/replan counts
- duplicated work prevented
- checkpoint/serialization cost
- cancellation propagation latency
- unresolved effect count
- fast-path ratio
- concurrency/utilization
- resource tier changes
- critical-path duration

No private chain-of-thought is required for observability.

---

# 15. UX Projection Contract

UI is a projection of authoritative runtime state.

Useful states include:

- Preparing
- Running
- Waiting for you
- Waiting for service/resource
- Verifying
- Stopping
- Recovering
- Blocked
- Completed
- Inconclusive
- Failed
- Cancelled

Rules:

- a plan is labeled as planned/proposed and may change
- tool activity must distinguish planned / attempted / verified / uncertain
- progress percentages are shown only if derived from a real measurable contract; otherwise use stage/progress events without fake precision
- Stop changes the authoritative cancellation intent immediately
- recovery and uncertainty are visible when they affect user decisions

---

# 16. Evaluation Contract

## State-machine properties

- illegal transitions rejected
- terminal states immutable except explicit migration tooling
- WAITING/BLOCKED/CANCELLING/RECOVERING transitions covered
- contract amendments cannot broaden without authority

## Replay/recovery

Inject crash/reload at every semantic boundary:

- before dispatch
- after dispatch before acknowledgement
- after acknowledgement before verification
- during wait creation
- during checkpoint
- during verification
- during commit
- during cancellation

Verify recovery never duplicates unsafe work.

## Side effects

- duplicate idempotency key
- timeout before dispatch
- timeout after dispatch unknown
- cancellation after dispatch
- remote success with lost acknowledgement
- retry safety classes
- reconciliation success/failure

## Planning

- cycle attack
- node explosion
- scope-broadening plan
- impossible capability
- conflicting writes
- stale plan after observation
- repeated replan loop
- no-progress loop
- user steering invalidates future nodes without rerunning valid completed work

## Parallelism

- independent reads execute concurrently
- conflicting writes serialize
- child budget reservations cannot oversubscribe parent
- cancellation propagates to descendants
- one child failure does not corrupt siblings or parent state

## Velocity

Benchmark at minimum:

- DIRECT task overhead
- WORKFLOW task overhead
- AGENTIC planning overhead
- long run with increasing event count
- checkpoint cost over time
- recovery time
- cancellation response
- context/planner lazy-loading
- Full/Balanced/Lite concurrency
- Android foreground/background transitions
- UI responsiveness during long work

## Adversarial inputs

- malformed plan
- malicious tool output
- injected fake permission
- forged verification
- stale authority ref
- corrupted journal
- duplicate/out-of-order event
- schema downgrade
- oversized result/artifact

## Freeze rule

Architecture Freeze Candidate may be accepted now. **Implementation Freeze is forbidden** until code is wired and the relevant deterministic, browser and Android/device gates pass.

---

# 17. Implementation Order

## CR-P0 — Contract and state semantics

- TaskContractV2 schema/migration
- new WAITING / CANCELLING / RECOVERING semantics
- RunHead + semantic RunJournal contract
- authoritative/derived object rules
- logical node vs attempt identity

## CR-P1 — Plan IR and validator

- Progressive PlanGraphVersion
- PlanNode contract
- cycle/scope/budget/effect/conflict validation
- progressive frontier expansion
- bounded replanning / no-progress detection

## CR-P2 — Execution supervisor

- Activity/ObservationEnvelope boundary
- attempt model
- idempotency/reconciliation hooks
- structured cancellation tree
- wait/resume signals

## CR-P3 — Durable persistence

- transactional RunHead + journal adapter
- compact snapshots
- recovery reducer
- unresolved-effect recovery
- schema/version migration
- remove full-history checkpoint cloning from the hot path

## CR-P4 — Scheduler + Velocity

- priority queues
- conflict/read-write scheduling
- hierarchical budget reservation
- Resource Governor concurrency
- cooperative yield/fallback scheduling
- direct/workflow/agentic fast-path routing

## CR-P5 — Fabric boundary cleanup

Move ownership out of the controller where duplicated:

- truth decisions -> Truth Fabric
- route quality -> Model Fabric
- resource tiers -> Resource Governor
- tool permission/schema policy -> Tool/Security Fabric

Maintain compatibility adapters during migration.

## CR-P6 — Verification / UI / observability

- commit gates
- typed runtime projection
- redacted trace/metrics
- wait/recovery/cancellation UX
- eval harness expansion

## CR-P7 — Android integration gate

- resumable process-loss tests
- platform-persistent adapter where genuinely required
- battery/thermal/resource benchmarks
- foreground/background truthfulness tests

---

# 18. Accepted Improvements

Accepted because expected value exceeds complexity:

- thin deterministic run kernel
- TaskContractV2 with explicit amendment semantics
- DIRECT / WORKFLOW / AGENTIC execution styles
- EPHEMERAL / CHECKPOINTED / DURABLE_EFFECTFUL durability classes
- WAITING / CANCELLING / RECOVERING states
- compact RunHead + semantic RunJournal
- progressive Plan IR instead of universal upfront DAG
- activity/non-determinism boundary
- logical node vs physical attempt model
- structured cancellation tree
- side-effect reconciliation before terminal cancellation/retry
- resource conflict sets and hierarchical budgets
- isolated per-invocation child runs
- bounded replanning/no-progress detection
- lazy planner/tool/context loading
- semantic checkpoint barriers
- artifact references instead of repeated deep copies
- Android resumable vs platform-persistent distinction
- explicit performance/velocity evals

---

# 19. Rejected / Deferred Ideas

## Rejected as defaults

- always-agentic execution
- always-deep verification
- universal full event sourcing of every transient detail
- giant full-task plan before first useful action
- persistent shared subagent state by default
- speculative side-effect dispatch
- automatic retry after uncertain dispatch
- checkpointing every micro-step
- storing chain-of-thought
- full Tool Fabric loading on startup
- copying Truth/Model/Resource/Security policy into Cognitive Runtime
- mandatory Temporal/LangGraph/framework dependency
- hedged duplicate model/tool requests by default
- claiming continuous Android background execution without a platform/remote owner

## Deferred until evidence justifies

- distributed multi-device run ownership
- remote cloud Run Kernel
- advanced speculative branch execution
- learned scheduler policies
- large-scale multi-agent swarms

They may be reconsidered only with measured use cases and eval evidence.

---

# 20. Final Reconciliation Verdict

**PASS A:** materially improved power/durability but was at risk of becoming too general and heavy.

**PASS B:** removed unnecessary universal durability, central policy duplication, full-plan bias, unsafe cancellation semantics and checkpoint bloat.

**Velocity Regression Assault:** final design preserves an extremely short DIRECT path, lazy-loads advanced orchestration, avoids full-history checkpoint copies, bounds parallelism, and treats UI responsiveness/resource cost as runtime correctness properties.

## FINAL FREEZE CANDIDATE

Seven Cognitive Runtime should become:

> **A thin, deterministic, event-governed adaptive run kernel that selects the simplest sufficient execution style, progressively plans only when needed, delegates intelligence and authority to specialized fabrics, survives interruption/failure without duplicating effects, and remains cheap enough that unused sophistication is almost invisible to the ordinary hot path.**

This is the architectural target for Capability #1.

**Status after this document:** architecture polish for Cognitive Runtime is complete enough to serve as the implementation target, but implementation/eval/device Freeze remains pending until CR-P0..CR-P7 are built and verified.
