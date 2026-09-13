# Seven AI — Cognitive Runtime Freeze Record

> **Campaign item:** #01 Cognitive Runtime
> **Status:** ARCHITECTURE FROZEN FOR CAMPAIGN / IMPLEMENTATION DEFERRED
> **Source polish record:** `01_COGNITIVE_RUNTIME_ULTIMATE_POLISH.md`
> **Protocol:** Seven Ultimate Polish Protocol 2.1
> **Important:** This freezes the current architecture decision for the individual-system campaign. It does not claim the architecture is fully implemented or permanently immune to later cross-system reconciliation.

## Final Reconciled Architecture
**Seven Cognitive Runtime 3.0 — Event-Governed Adaptive Run Kernel**

Prime design rule:
> Thin deterministic kernel, rich specialized fabrics. Models propose. The kernel validates, schedules, records, and commits.

## Accepted Decisions
- DIRECT / WORKFLOW / AGENTIC execution classes.
- EPHEMERAL / CHECKPOINTED / DURABLE_EFFECTFUL durability classes.
- TaskContract V2 with intent/scope lock.
- Progressive Plan Frontier rather than mandatory full upfront DAG construction.
- Logical plan nodes separated from execution attempts.
- Explicit WAITING / CANCELLING / RECOVERING semantics.
- Structured cancellation propagation.
- Reconciliation before final cancellation when dispatched side effects may be uncertain.
- Transactional small RunHead plus semantic append-only RunJournal plus compact snapshots/artifact references.
- Replay/recovery reuses recorded observations rather than silently re-calling nondeterministic models/tools/network operations.
- readSet/writeSet conflict metadata for safe parallel scheduling.
- Hierarchical budget reservations and bounded concurrency/backpressure.
- Bounded replanning, no-progress detection, repeated-plan detection, and loop budgets.
- Child-agent isolation by default; canonical state commits remain controller-governed.
- Non-deterministic model/tool/network work executes as activities outside deterministic kernel state transitions.
- Resource Governor and Velocity Fabric participate in scheduling and compute decisions without overriding truth/security/authority requirements.
- Platform-backed Android persistent work is distinguished from merely resumable in-app work.

## Rejected / Avoided Decisions
- One giant cognitive monolith owning truth, memory, tools, models, permissions, and verification.
- Running every task through the deepest agentic path.
- Making every run maximally durable regardless of value/risk.
- Treating model-generated plans as authoritative state.
- Unbounded fan-out or speculative side-effect execution.
- Blind retries after uncertain external dispatch.
- Checkpoints that recursively duplicate ever-growing run history.
- Replaying history by re-invoking nondeterministic external operations.
- Letting child agents directly mutate canonical state by default.
- Performance shortcuts that bypass required verification, authority, security, or reconciliation.

## Frozen Invariants
1. User intent/scope/authority cannot be expanded by planner output.
2. Canonical run state is explicit and kernel-governed.
3. Derived planning state never silently becomes authoritative.
4. External side effects require idempotency/uncertainty semantics and evidence-bound verification.
5. Cancellation is a protocol, not only a boolean flag.
6. Recovery cannot invent certainty about unknown external effects.
7. Durable replay must not silently repeat nondeterministic work.
8. Parallel work is bounded and dependency/conflict aware.
9. Resource pressure may reduce optional compute but cannot remove mandatory correctness/safety guarantees.
10. Simple work receives a fast path; unused heavy cognitive capabilities should impose near-zero ordinary-path cost.
11. Every meaningful run transition is observable without exposing private chain-of-thought.
12. Cross-system reconciliation may amend this freeze only with documented proof of improvement.

## Implementation Stages
Implementation remains deferred until the architecture campaign has polished interacting systems. Preserve these stages for later execution:
- CR-P0: contracts/state schemas and compatibility boundary.
- CR-P1: RunHead + RunJournal persistence core.
- CR-P2: execution-class and durability-class selector.
- CR-P3: progressive planner/frontier + node-attempt model.
- CR-P4: structured cancellation/recovery/reconciliation.
- CR-P5: conflict-aware scheduler + hierarchical budgets/backpressure.
- CR-P6: model/tool activity adapters + deterministic replay boundary.
- CR-P7: adversarial, recovery, performance, Android, and long-run eval gates.

Exact implementation ordering may be refined during cross-system reconciliation, but these responsibilities must not be silently dropped.

## Verification Required Before Implementation Freeze
- crash/reload recovery tests
- cancellation-before-dispatch and cancellation-after-dispatch tests
- uncertain-side-effect reconciliation tests
- idempotent retry tests
- repeated-plan/no-progress loop tests
- parallel read/write conflict tests
- budget oversubscription tests
- provider/network interruption tests
- long-run journal/snapshot growth tests
- cold/warm path latency tests
- constrained Android resource tests
- DIRECT-path regression tests proving trivial tasks avoid deep orchestration

## Campaign Handoff
#01 is closed for individual architecture polish.

Next item: **#02 Truth / Epistemic Fabric**.

After all individual systems and Tool Fabric families are polished, #01 must participate in:
1. cross-system responsibility/authority reconciliation,
2. whole-Seven Velocity analysis,
3. final architecture red-team,
4. implementation sequencing and dependency resolution.
