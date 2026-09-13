# Seven AI — Current Status

> Compact operational truth snapshot. Detailed architecture lives in capability Polish/Freeze records; implementation truth remains separate from architecture intent.

## Active Development Branch
`seven-beta-ui-v1`

## Protected Branches / PRs
- `main` — baseline
- `seven-v4.2-hardening` — hardened architecture branch
- PR #15: keep unmerged
- PR #16: keep Draft/unmerged

## Protected Source
`seven_ai-final.html`
Known integrity reference: bytes `658133`; Git blob SHA `3e8dfa8e7da7124e16504140eb9631c10cabf053`.
The protected source remains unchanged during architecture-only polish unless explicitly authorized.

## Canonical Polishing Governance
**Seven Polishing Protocol V4.4 — Velocity Fabric** is now the canonical architecture-governance protocol for new polishing campaigns.

Core records:
- V4.4 Velocity protocol: `docs/project-memory/SEVEN_POLISHING_V4_4_VELOCITY_FABRIC.md`
- V4.4 self-polish/saturation: `docs/project-memory/SEVEN_POLISHING_V4_4_VELOCITY_SELF_POLISH.md`
- V4.3 Maximum Research parent: `docs/project-memory/SEVEN_POLISHING_V4_3_MAXIMUM_RESEARCH_LOOP.md`
- V4.3 self-evolution: `docs/project-memory/SEVEN_POLISHING_V4_3_SELF_EVOLUTION_LEDGER.md`
- V4.2 Motion/Expert parent: `docs/project-memory/SEVEN_POLISHING_V4_2_MOTION_AND_EXPERT_JUDGMENT.md`
- Benchmark/Visual companion: `docs/project-memory/SEVEN_BENCHMARK_AND_VISUAL_EVIDENCE_FABRIC.md`
- V4.1 Loop parent: `docs/project-memory/SEVEN_POLISHING_PROTOCOL_V4_1_LOOP.md`
- Historical V4: `docs/project-memory/SEVEN_POLISHING_PROTOCOL_V4.md`

V4.4 inherits all V4.3 quality/research laws and adds a benchmark-governed execution-speed layer. It searches for the **fastest valid completion path** rather than assuming one fixed fast path.

### V4.4 core laws
- speed may remove redundant work, reorder work, parallelize independent work and reuse valid evidence;
- speed may never weaken mandatory evidence, C0/C1 gates, release proof, authority or uncertainty rules;
- fastest path is selected by strategy tournament under a locked `VelocityContract`;
- incremental revalidation uses a dependency-aware `ProofGraph` with explicit invalidation;
- selected tests accelerate iteration but never imply full release PASS;
- cache reuse is content/environment/evaluator bound and cannot override invalidation;
- critical-path scheduling, early-kill/Pareto pruning, adaptive parallelism and campaign fusion are permitted only when traceability/correctness survive;
- flaky tests remain explicit evidence-quality problems and are never silently discarded;
- optimized paths are challenged by shadow/holdout cases so a path cannot appear fast merely because it misses defects;
- release boundaries may still require broad/full regression, clean build/install, migration/recovery and representative-device evidence.

### V4.4 self-polish history
- Rounds 01–15: `MATERIAL_IMPROVEMENT_FOUND`
- Round 16 Simplifier: `NO_MATERIAL_IMPROVEMENT`
- Independent Challenge A (testing/metrology/CI safety): `NO_MATERIAL_IMPROVEMENT` → 1/2
- Independent Challenge B (mobile/project/debugging/product throughput): `NO_MATERIAL_IMPROVEMENT` → 2/2
- V4.4 architecture saturation: **2/2**

Status: **`V4_4_ARCHITECTURE_SATURATED_2_OF_2`**.

Important: architecture saturation does NOT mean the dependency graph builder, proof graph runtime, impact test selector, cache, scheduler, strategy tournament runner, Android benchmark harness or adaptive Repair Burst executor is implemented. Evidence ladder remains `ARCHITECTURE_ACCEPTED != IMPLEMENTED != TESTED != DEVICE_VERIFIED != RELEASE_PROVEN`.

## Capabilities 01–15
Capabilities 01–15 retain their architecture freezes and implementation truth from individual records and `SEVEN_IMPLEMENTATION_MATRIX.md`. They require V4.4 revalidation before Seven 1.0 where materially affected.

## Priority capabilities 16–21
| # | Capability | Current status |
|---|---|---|
| 16 | Search / Retrieval Tools | `HYPER_POLISH_REOPENED` |
| 17 | Knowledge / Files | `HYPER_POLISH_REOPENED` |
| 18 | Vision | `HYPER_POLISH_REOPENED` |
| 19 | RPG Engine | Seven RPG 4.2 saturated historical candidate; V4.4 revalidation required pre-1.0 |
| 20 | Real Works / Canon Simulation | `HYPER_POLISH_REOPENED` |
| 21 | Titles / World Linguistic Engine | Seven World Linguistic Engine 4.1 saturated historical candidate; V4.4 revalidation required pre-1.0 |

## Capability 22 — Projects System
**Seven Project Fabric 4.3 — Local-First Durable Work Graph** is a saturated historical architecture candidate and receives V4.4 revalidation where materially applicable before Seven 1.0.

## Debugging & Repair Fabric
**Seven Debugging & Repair Fabric 1.1 — Evidence-Governed Causal Repair Mesh** is `V4_3_ARCHITECTURE_SATURATED_2_OF_2` and now integrates with V4.4 Velocity Fabric.

Records:
- `docs/project-memory/SEVEN_DEBUGGING_AND_REPAIR_FABRIC_V1.md`
- `docs/project-memory/SEVEN_DEBUGGING_REPAIR_V4_3_SELF_POLISH_AND_SATURATION.md`

Repair Burst Mode clusters failures by shared cause, ranks fan-out blockers, repairs root causes first, performs impact-selected revalidation, then runs broader mandatory regression once the batch stabilizes.

Repair verdicts preserve distinctions such as `FIXED_CAUSE_PROVEN`, `FIXED_BEHAVIOR_PROVEN_CAUSE_PARTIAL`, `MITIGATED_CAUSE_UNRESOLVED`, `INCONCLUSIVE` and `BLOCKED_BY_ENVIRONMENT`. A disappearing symptom or passing original test never proves semantic correctness by itself.

## Campaign Navigation
Next numbered Mega-Campaign: **#23 Sessions / Persistence + #24 Recovery / Integrity + relevant #41 Import/Export interactions**, now governed by **Polishing V4.4 Velocity Fabric**.

The default campaign execution model becomes:
`Lock quality gates → build dependency/proof graph → generate candidate execution DAGs → run cheap/high-yield checks first → parallelize independent lanes → cache/reuse valid evidence → cluster failures → Repair Burst → incremental revalidation → broad/release gates where required → compare strategy runtime/quality → retain fastest valid strategy`.

Unfinished Priority #16, #17, #18 and #20 remain open and must be revisited before final whole-Seven architecture freeze.

## Major Cross-System Laws
- authoritative and derived state are explicit and separate
- derived objects never silently gain authority
- meaningful derived objects retain lineage
- verification precedes claims of real-world success
- uncertainty remains explicit
- expensive intelligence is selective
- mobile resource discipline and graceful degradation are mandatory
- provider independence, recovery and cancellation safety are first-class
- side effects require authority/idempotency/uncertainty semantics
- tool/model/content output cannot override security boundaries
- architecture claims never become implementation/device/release claims without evidence
- measurable material improvement claims use comparable benchmark evidence when feasible
- benchmark metrics cannot compensate for critical regressions
- research breadth is coverage-driven and adversarial, not a fixed tiny query count
- search ranking/popularity is not evidence authority
- a disappearing failure symptom is not proof of a correct repair
- patch success on the original test cannot establish semantic correctness by itself
- automated repair cannot self-promote around Verification/permission/release authority
- **speed removes waste, never required proof**
- **the fastest path is an empirical result, not an assumption**
- **iteration proof cannot silently substitute for release proof**

## Explicitly Partial / Unfinished
- live Search → Fetch → Extract orchestration
- final Tool Fabric external adapters
- live Model Fabric free-proof/health/fallback validation
- Android SAF/Keystore and platform file/shell bridges
- final Knowledge Vault/index and Vision/OCR/layout pipelines
- RPG 4.2 runtime/evals/visual contracts/media wiring
- Real Works final source-ingestion Canon Graph
- Titles 4.1 runtime/multilingual evals
- Project Fabric 4.3 runtime implementation/evals/device proof
- V4.3 executable research benchmark/search-coverage infrastructure
- executable Benchmark runner / suite infrastructure
- screenshot/video capture, visual diff and multimodal Motion Evidence runtime
- Android frame/jank/input-latency instrumentation and representative-device proof
- Debugging & Repair Fabric runtime adapters/replay/repair benchmark/Repair Burst implementation
- **V4.4 dependency graph / ProofGraph / impact-selector / cache / critical-path scheduler / strategy tournament runtime**
- final product UI, brand/logo freeze and real-phone resource certification

## Release Safety
Before declaring major implementation PASS: verify CI, source integrity, no accidental deletion, protected source integrity, release boot where applicable, mobile/RTL/theme/reduced-motion gates, benchmark identity/validity where claims are measurable, motion/video evidence for material animation claims, research evidence freshness/coverage for time-sensitive decisions, repair semantic/regression evidence for automatic fixes, and release-specific broad evidence independent of iteration fast paths.

## Development Philosophy
Use large coherent passes and strong final verification. V4.4 governs new polishing: search broadly enough to understand the real design space, then eliminate waste aggressively. Reuse only valid proof, parallelize only independent work, prioritize high-yield checks, kill dominated candidates early, optimize the critical path, consolidate debugging into Repair Bursts, benchmark competing execution strategies, and promote only the fastest strategy that preserves the complete required quality envelope. Treat 2/2 saturation as bounded evidence, never proof of perfection.
