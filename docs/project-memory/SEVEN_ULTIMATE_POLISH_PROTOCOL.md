# Seven AI — Ultimate Polish Protocol 2.1

> **Status:** Canonical architecture-polish protocol for Seven AI.
> **Scope:** Apply independently to every capability in `SEVEN_CAPABILITIES_MAP.md`, including all 45 core capability families and each Tool Fabric 2.0 capability family.
> **Goal:** Find the strongest practical design, not the largest design. Existing architecture is never assumed correct merely because it already exists.

---

## Operating Rule
For every system under polish, do not merely add features. Audit, attack, compare, simplify, redesign where justified, verify, evaluate, optimize its critical path, and only then produce a freeze candidate.

> If we were forced to build the strongest practical version of this system for Seven today, knowing everything we know now, would we still choose this architecture?

If no, redesign it.

---

# Seven Velocity Fabric

Velocity Fabric is a cross-cutting performance and smoothness architecture. It applies to every Seven subsystem and is not limited to raw execution speed.

## Objectives
Optimize simultaneously for:
- cold startup latency
- warm startup latency
- time to interactive
- interaction/input latency
- time to first visible response
- time to first streamed token/result
- end-to-end task latency
- sustained throughput
- frame/render smoothness
- perceived latency
- cancellation responsiveness
- background-work interference
- RAM/CPU/battery/thermal/network/storage efficiency

## Core Law
> **No capability may make Seven globally slower merely by existing.**

A heavy capability that is unused should have near-zero cost on startup and ordinary paths wherever technically practical.

## Velocity Architecture
Every system must consider:
- lazy/on-demand initialization
- lazy capability/tool loading
- fast paths for simple/common operations
- cold vs warm paths
- incremental computation
- incremental rendering
- streaming where useful
- safe parallel execution for independent dependencies
- batching where it lowers total cost
- request coalescing
- duplicate-work elimination
- memoization/caching with explicit freshness and authority rules
- bounded prefetching only when predicted benefit exceeds cost
- priority scheduling
- cooperative yielding to protect UI responsiveness
- backpressure
- bounded concurrency
- immediate cancellation propagation
- avoiding unnecessary serialization
- avoiding unnecessary model/tool/network calls
- local cheap decisions before expensive remote escalation where valid
- DOM/render/layout/repaint minimization
- list/tree/output virtualization for large surfaces
- progressive disclosure/rendering
- off-main-thread work where platform/runtime support makes it worthwhile
- unloading/releasing heavy resources after use

## Critical Path Discipline
For each important user journey:
1. Identify its true critical path.
2. Mark required vs deferrable work.
3. Remove redundant steps.
4. Parallelize only genuinely independent work.
5. Move optional work outside the blocking path.
6. Measure rather than assume bottlenecks.
7. Re-run correctness and authority checks after optimization.

Optimization may never bypass required security, authority, verification, integrity, or side-effect safeguards.

## Latency Budgets
Every polished subsystem must define measurable budgets where applicable for:
- initialization
- interaction response
- first visible feedback
- first streamed output
- ordinary operation
- cancellation acknowledgment
- UI frame work
- memory footprint
- background CPU/network activity

Budgets may vary by Full / Balanced / Lite performance tier and device capability. A subsystem that exceeds its budget must justify the cost or be redesigned/deferred/degraded.

## Smoothness Contract
Seven should remain responsive while work continues. Long-running operations must not unnecessarily block:
- scrolling
- typing
- navigation
- cancellation
- status updates
- lightweight interactions

Prefer progressive truthful feedback over frozen interfaces. Never fake progress merely to create perceived speed.

## Resource-Aware Velocity
Velocity Fabric integrates with Adaptive Compute and Resource Governor. Under pressure Seven may:
- reduce concurrency
- suppress expensive visual effects
- postpone optional background work
- unload nonessential caches/models
- reduce speculative/prefetch work
- select cheaper local/remote paths where appropriate
- reduce optional verification depth only where safety/correctness contracts permit

Use hysteresis so performance tiers do not oscillate rapidly.

## Cache Correctness
Caching must preserve Seven's truth/authority laws. Every important cache defines:
- source identity
- freshness/expiry semantics
- invalidation strategy
- authority level
- principal/auth scope
- reconstruction path where relevant

A faster stale or authority-confused answer is a regression, not an optimization.

## Perceived Performance
Improve perceived speed through truthful mechanisms:
- immediate input acknowledgment
- early real status
- progressive results
- streaming
- useful partial rendering
- responsive cancellation
- retaining usable UI during background work

Never simulate completed work, fabricated tool activity, fake progress, or fake verification.

## Velocity Observability
Measure enough to locate real bottlenecks:
- critical-path spans
- queue delay
- model/tool/network latency
- cache hit/miss
- initialization cost
- render/main-thread stalls where measurable
- memory pressure
- thermal/resource state
- cancellation latency
- retries/duplicate work

Telemetry must remain lightweight and respect privacy/redaction boundaries.

## Velocity Regression Gates
Changes should be tested against representative baselines. Track at minimum where applicable:
- startup
- time to interactive
- first response/token/result
- task completion latency
- frame/input responsiveness
- peak/steady RAM
- CPU work
- battery/thermal impact
- network bytes/round trips
- cancellation responsiveness

A capability improvement that materially harms global responsiveness must be rejected, redesigned, lazy-loaded, tiered, or explicitly justified.

## Velocity Failure Rule
Never trade correctness for speed silently. If an optimization changes correctness, evidence quality, security, authority, durability, or side-effect semantics, it must be treated as an architectural change and pass the full polish/eval gates.

---

# Ultimate Polish Pass

## 1. Establish Ground Truth
Determine what exists architecturally, what is implemented, planned, legacy, duplicated, speculative, or dependent on unverified assumptions. Never turn an architectural target into an implementation claim.

## 2. First-Principles Reconstruction
Ask what problem the system solves, how it would be built today from zero, what minimum useful primitives exist, what is authoritative vs derived, and where responsibility boundaries belong.

## 3. Adversarial Architecture Attack
Attack race conditions, stale/corrupt/hallucinated state, authority escalation, ambiguous ownership, hidden coupling, retries, cancellation, partial/network/provider failures, malformed/malicious/huge inputs, low-memory/thermal/offline states, contradictory evidence, irreversible actions, migrations and version drift.

## 4. Assumption Destruction
Extract hidden assumptions. For each: why is it required, what if false, can dependency be removed, and can correctness survive without it?

## 5. Alternative Architecture Search
Compare meaningful alternatives, including radically different designs where justified, across capability, correctness, complexity, latency, RAM, battery, storage, network, maintainability, security, recoverability, observability and testability.

## 6. Capability Ceiling
Find the maximum useful capability. Add capabilities only when useful, implementable, compatible with Seven invariants, and worth their complexity/resource cost.

## 7. Research & Competitive Sweep
Search relevant research, production architectures, open source, agent runtimes, databases, OS/compiler/browser/distributed/mobile systems and relevant AI products. Extract useful primitives rather than copying fashionable systems.

## 8. Intelligence Upgrade
Replace naive static decisions where justified with adaptive/evidence/capability/resource/uncertainty-aware policies, while retaining deterministic fallbacks when safer.

## 9. Truth & Authority Audit
For meaningful state define source, authority, owner, lineage, freshness, confidence, mutability, persistence and reconstruction. Derived information never silently becomes authoritative.

## 10. Security & Side-Effect Audit
Test permissions, privilege boundaries, injection, untrusted outputs/metadata, destructive actions, external communication, retries, idempotency, uncertainty, confirmations and secrets.

## 11. Failure & Recovery Engineering
Define failure states, retries, timeouts, cancellation, checkpoints, rollback, reconciliation, corruption recovery and crash recovery. Preserve explicit uncertainty rather than inventing binary certainty.

## 12. Performance & Mobile Assault
Assume constrained Android. Audit startup/APK/RAM/CPU/battery/thermal/storage/network/background work/concurrency/rendering/local models. Decide what can lazy-load, cache, stream, batch, defer, unload, disable or degrade gracefully.

## 13. Velocity & Smoothness Assault
Apply the complete Velocity Fabric to the subsystem. Profile its critical paths, remove redundant blocking work, establish latency/resource budgets, protect UI responsiveness, and test cold/warm/pressure conditions.

## 14. UX Translation
Represent progress, uncertainty, errors, recovery, permissions, verification, cancellation, long-running work and diagnostics appropriately without exposing useless internal complexity.

## 15. Integration Audit
Find duplicated responsibility, conflicting authority, circular dependencies, coupling, missing contracts/events and incompatible state models across Seven.

## 16. Simplification Pass
Try to remove primitives/layers/abstractions/features whose value does not justify complexity. Stronger does not mean larger.

## 17. Verification Contract
Define evidence-bound proof that the system accomplished what it claims rather than relying on model confidence.

## 18. Evaluation Contract
Measure correctness, reliability, latency, resources, recovery, security, UX, regressions and edge cases. Compare OLD vs NEW where possible.

## 19. Proof of Improvement
For each major change record problem, solution, advantage, cost, new risks, measurement and acceptance/rejection rationale.

## 20. Future-Proofing
Test new providers/models/tools/Android versions, schema evolution, larger projects, longer sessions, offline/local execution and future capabilities without product-wide rewrites.

## 21. Final Red-Team
Attack the final proposal again as if trying to prove a competitor's architecture unsound. Material new failures return it to repair.

## 22. Freeze Candidate
Produce final architecture/capabilities/invariants/authority/interfaces/failure semantics/security boundaries/performance budgets/integration contracts/verification/evals/deferred and rejected ideas/implementation order. Do not freeze while a clear improvement remains whose expected value materially exceeds its cost.

---

# Double-Pass Campaign Rule

Every capability receives two full-strength independent polish passes:

**PASS A — MAXIMIZE**
Apply the complete protocol, including Velocity & Smoothness Assault, and produce Freeze Candidate A.

**PASS B — DESTROY THE WINNER**
Start from Candidate A without assuming it is correct. Reapply the complete protocol at full strength, attack A, seek superior alternatives, detect overengineering and performance/security/correctness regressions, and allow removal or reversal of Pass A changes.

Pass B is not required to invent changes. If no meaningful improvement survives proof/eval gates, record `NO MATERIAL IMPROVEMENT`.

**RECONCILIATION GATE**
Compare A and B. Accept only changes that survive correctness, authority, security, recovery, verification, eval and Velocity regression gates. Then produce FINAL FREEZE.

Campaign flow:
`Current -> Polish A -> Velocity Assault -> Candidate A -> Polish B -> Velocity Regression Assault -> Candidate B -> Reconciliation -> FINAL FREEZE`

---

# Global Seven Laws
1. Explicit authoritative state.
2. Derived state never silently gains authority.
3. Full lineage for meaningful derived objects.
4. Verification before claiming real-world success.
5. Explicit uncertainty instead of invented certainty.
6. Selective compute instead of always-on expensive intelligence.
7. Mobile-first resource discipline.
8. Graceful degradation.
9. Provider independence.
10. Recoverability.
11. Cancellation safety.
12. Side-effect safety and idempotency.
13. Security boundaries AI/tool output cannot override.
14. Typed contracts between major systems.
15. No fake actions, tool success, canon fidelity, evidence, verification, or progress.
16. Complexity must earn its existence.
17. No capability may impose material global startup/runtime cost merely by existing when that cost can technically be deferred.
18. Optimize measured critical paths, not imagined bottlenecks.
19. Speed never silently overrides correctness, authority, security, durability or verification.
20. Smoothness and responsiveness are first-class product correctness properties.

---

# Campaign Application
Apply this protocol independently to:
1. Every numbered core capability in `SEVEN_CAPABILITIES_MAP.md`.
2. Every Tool Fabric 2.0 capability family individually.
3. Cross-system boundaries after individual polishing.
4. Velocity Fabric itself, including two-pass polish and regression testing.
5. A final whole-system integration, performance and red-team pass.

Each polish record preserves ground truth, alternatives, accepted/rejected changes, evidence, verification/evals, latency/resource budgets, velocity results and the resulting freeze candidate.
