# Seven AI — Second Ultimate Polish Campaign

> Status: FUTURE LOCKED CAMPAIGN
> Codename: SECOND PASS / SYSTEM-WIDE REFORGE
> Timing: Execute only after Tool Fabric 2.0 Discovery, individual Tool Deep Polish, and the current Ultimate Polish campaign have been completed and verified.

## Why this exists

Seven will not stop at the first comprehensive polish pass. The first pass changes the system itself: new tools, stronger interfaces, better verification, new architectural knowledge, new eval evidence, and new interactions between subsystems will expose opportunities and weaknesses that could not be seen before those improvements existed.

Therefore Seven receives a second complete system-wide polish campaign after the current roadmap is finished.

This is not permission for endless feature accumulation. The purpose is to re-evaluate the whole product from the stronger post-polish baseline and remove remaining weaknesses, duplication, friction, fragility, and architectural debt.

## Entry Gate

Do not begin this campaign until all of the following are true or explicitly documented as blocked:

1. Tool Fabric 2.0 Discovery has reached practical saturation.
2. Selected new tools have completed individual Deep Polish.
3. Tool classifications and integration architecture are frozen or explicitly experimental.
4. The existing `SEVEN_ULTIMATE_POLISH_PLAN.md` has completed its intended passes.
5. Relevant Seven Evals exist for comparing the pre-polish and post-polish system.
6. Current implementation status has been reconciled with architecture documents.
7. Major unresolved blockers are recorded rather than hidden.

## Canonical Inputs

The second pass must begin by re-reading and reconciling at minimum:

- `SEVEN_CAPABILITIES_MAP.md`
- `SEVEN_ULTIMATE_POLISH_PLAN.md`
- `SEVEN_MASTER_PLAN.md`
- `SEVEN_DECISIONS.md`
- `SEVEN_STATUS.md`
- `SEVEN_MAXIMUM_EFFORT_COMMAND_PROTOCOL.md`
- Tool Fabric 2.0 research protocol
- every Tool Fabric discovery wave and coverage audit
- every accepted Tool Deep Polish specification
- eval results and regression evidence produced during the first polish campaign

The capability map must be updated first if the completed Tool Fabric work introduced capabilities not represented in it.

## Core Mission

Re-polish **everything** from the new baseline.

The question is no longer:

> "How do we make the original Seven architecture strong?"

It becomes:

> "Now that Seven has undergone Tool Fabric 2.0 and a complete Ultimate Polish, what would we redesign, simplify, strengthen, merge, remove, measure, or re-balance if this stronger Seven were the starting point?"

## Full-System Scope

Every capability represented by the post-Tool-Fabric `SEVEN_CAPABILITIES_MAP.md` is in scope, including but not limited to:

- Cognitive Runtime
- Truth / Epistemic Fabric
- Memory Fabric
- Context Workspace
- Model Fabric
- Adaptive Compute
- Tool Fabric
- Tool Security Kernel
- Side-Effect Ledger
- File / Project tools
- Coding Agent
- Verification / Judge
- Seven Evals
- Self-Evolution
- Research / Evidence Plane
- Search / Retrieval
- Knowledge / Documents
- Vision
- RPG
- Real Works / Canon Simulation
- Titles / World Linguistic Engine
- Projects
- Sessions / Persistence
- Recovery / Integrity
- Observability
- Resource Governor
- Performance tiers
- UX Runtime
- Day / Night identity
- Brand
- Aurora
- Animation
- Accessibility
- Arabic / RTL
- Workspace Hub
- Typed / Generative UI
- Provider layer
- Local Intelligence Plane
- Streaming
- Real Cancellation
- Import / Export / Migration
- Permissions
- Lineage
- Idempotency
- Side-effect uncertainty
- Release verification
- CI / release gates
- every new Tool Fabric capability accepted after the original capability map

Nothing receives immunity merely because it passed the first polish campaign.

## Context-Adaptive Maximum Effort Rule

Every major subsystem in this second campaign must receive a new context-specific **SEVEN MAXIMUM EFFORT** command under `SEVEN_MAXIMUM_EFFORT_COMMAND_PROTOCOL.md`.

Do not blindly reuse the first-pass prompt. The second-pass prompt must incorporate what was learned from:

- implementation
- failures
- benchmarks
- evals
- real integration
- performance measurements
- new tools
- cross-system interactions

The prompt itself is part of project memory when materially useful.

## Second-Pass Audit Contract

For every subsystem:

1. Establish the verified current state.
2. Compare it against the first-pass target and actual implementation.
3. Inspect real failures, regressions, bottlenecks, and maintenance cost.
4. Inspect interactions with all newly accepted tools.
5. Search for newer or stronger external approaches where fresh research can materially improve the result.
6. Identify duplicated responsibility between systems.
7. Identify unnecessary layers or abstractions.
8. Identify missing invariants and verification gaps.
9. Re-score architecture, capability, reliability, security, performance, UX, and maintainability.
10. Propose the strongest practical redesign.
11. Attack that redesign with counterexamples and failure cases.
12. Benchmark/evaluate old-vs-new where possible.
13. Implement only changes that survive the gate.
14. Verify the resulting system.
15. Freeze it again only when the new criteria pass.

## New Requirement: Cross-System Polish

The second campaign must not polish systems only in isolation.

After individual subsystem passes, perform explicit interaction audits for combinations such as:

- Memory × Context × Research
- Model Routing × Adaptive Compute × Resource Governor
- Tools × Permissions × Side Effects × Verification
- Coding Agent × Project Context × Recovery
- Research × Evidence × Truth Fabric
- RPG × Canon × Memory × Timeline
- Local Intelligence × Battery × Storage × Startup
- Streaming × Cancellation × Tool execution
- UI × Aurora × Performance tiers × Reduced Motion
- Arabic/RTL × generated UI × code rendering
- Import/Export × migrations × authoritative state
- Self-Evolution × Evals × security boundaries

The objective is to catch failures that are invisible when each subsystem is tested alone.

## Simplification Pass

A mandatory part of the second Ultimate Polish is subtraction.

Search explicitly for:
- redundant tools
- overlapping providers
- duplicated indexes
- unnecessary state copies
- dead compatibility layers
- expensive features with weak value
- abstractions that add more failure modes than capability
- UI decoration that costs performance without improving comprehension
- background work that can become on-demand

A deletion/simplification proposal still requires safety review. This plan does not authorize deleting project files or protected source automatically.

## Android Reality Gate

The stronger Seven must not become a desktop/server architecture wearing an Android costume.

Re-measure:
- cold startup
- warm startup
- RAM
- CPU
- battery
- storage
- APK size
- network use
- model/tool latency
- concurrency
- background activity
- lazy loading effectiveness
- Full / Balanced / Lite behavior

If a newly polished capability makes the phone experience materially worse, redesign or move it behind lazy/host/remote execution rather than accepting the regression by default.

## Truth and Authority Gate

The second pass must again verify that:
- model output is not authoritative by origin
- summaries do not gain authority
- embeddings/indexes remain derived
- tool output is verified when actions matter
- permissions remain bound to authoritative grants
- research evidence preserves provenance
- canon commits pass the controller/validator
- side-effect uncertainty remains explicit
- derived objects retain lineage

No optimization may weaken these laws for convenience.

## Evaluation Standard

The second pass should rely more heavily on measured evidence than the first because a mature Seven should now have richer eval infrastructure.

Where applicable compare:
- baseline before Tool Fabric 2.0
- state after first Ultimate Polish
- candidate second-pass state

Measure capability and cost together. A feature that improves one benchmark while doubling fragility, RAM, latency, or maintenance is not automatically an improvement.

## Freeze Standard 2.0

A subsystem does not receive Second-Pass Freeze merely because no new ideas are available.

Freeze requires sufficient evidence that:
- architecture is coherent
- responsibility boundaries are clear
- behavior is verified
- important failure modes are handled
- security/authority invariants hold
- Android performance is acceptable
- recovery is defined
- observability is adequate
- relevant UX/accessibility gates pass
- evals show no unjustified regression
- further changes have low expected value relative to complexity/risk

## Campaign Exit

At the end, produce a **Second Ultimate Polish Final Audit** containing:
- final post-polish capability map
- subsystem scores
- cross-system scores
- accepted changes
- rejected changes and reasons
- removed/merged responsibilities
- performance results
- eval results
- unresolved limitations
- experimental systems
- final architecture snapshot
- final freeze status

The report must distinguish measured results from estimates.

## Anti-Infinite-Polish Rule

This campaign is intentionally extreme, but it must remain engineering rather than compulsive churn.

A third pass is not automatically created because a second pass exists. After Second Ultimate Polish, new work should require evidence of meaningful expected improvement, a discovered failure, a new capability requirement, or a major external technological change.

The goal is not endless motion. The goal is a Seven whose remaining imperfections are known, measured, and deliberately accepted.

## Safety Invariants

- `seven_ai-final.html` remains protected unless a reviewed implementation step explicitly requires modification.
- No project file is deleted merely because a simplification idea exists.
- No protected branch is merged without explicit approval.
- No PASS/FREEZE without verification.
- GitHub Project Memory remains the durable record.
- Major research, decisions, rejected alternatives, evals, and freeze criteria are committed during the work cycle.

## Campaign Pipeline

`Post-Tool-Fabric Baseline → Capability Map Reconciliation → Maximum-Effort Re-Audit → Individual Re-Polish → Cross-System Polish → Simplification → Android Reality Gate → Adversarial Verification → Seven Evals → Final Audit → Freeze 2.0`

## One-Line Definition

**Second Ultimate Polish = rebuild our definition of “best possible Seven” after the first polish has already changed what Seven is capable of becoming.**
