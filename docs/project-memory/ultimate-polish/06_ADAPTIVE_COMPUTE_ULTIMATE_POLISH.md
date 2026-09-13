# Seven AI — Capability 06 Adaptive Compute Ultimate Polish

Status: **Ultimate Polish complete / reconciled freeze candidate**

Final target: **Seven Adaptive Compute 3.0 — Closed-Loop Marginal-Utility Compute Governor**

## Prime law

> Spend additional compute only when it has credible expected value, while mandatory correctness, authority, side-effect and verification floors are never traded away for speed.

Adaptive Compute is not a bigger `reasoning_effort` switch. It is the cross-system governor that decides the minimum sufficient amount and shape of computation for each task phase.

## 1. Ground truth

Seven already has useful foundations:

- `evolution/cognitive-boost.cjs` implements `allocateCompute()` and FAST / STANDARD / DEEP / EXTREME tiers.
- the current score combines complexity, risk, freshness need, tool depth, long horizon and recent failure rate.
- tiers currently scale candidate count, verifier passes and planner depth together.
- `evolution/cognitive-gate.cjs` can require an adversarial critic/attacker/judge arena for DEEP/EXTREME or high-risk work.
- `hardening/resource-governor.cjs` already supplies Lite/Balanced/Full device tiers, context/tool/concurrency budgets and device-pressure gates.
- the app has model-specific reasoning-effort controls and a Deep Think path.
- Model Fabric 3.0 now supplies qualified model/deployment choices rather than letting Adaptive Compute bind directly to providers.
- Velocity Fabric already requires progressive escalation and fast paths.

These are strong foundations, but the current compute architecture is too scalar and too preflight-oriented.

### Main weaknesses found

1. A single scalar score collapses independent needs such as reasoning, retrieval, tools, context and verification.
2. Risk is mixed with task difficulty; a simple consequential action can require heavy verification without requiring long reasoning.
3. Fixed tiers scale several expensive dimensions together even when only one dimension needs more compute.
4. Compute allocation is mostly decided before execution rather than adapting after evidence, tool results, failures and verification.
5. `DEEP`/`EXTREME` can trigger a full adversarial arena too broadly.
6. There is no explicit multi-resource ledger for model calls, tokens, tools, network, verification, wall-clock and child-task reservations.
7. There is no protected verification/recovery reserve, so an agent could conceptually burn its whole budget before proving success.
8. There is no explicit marginal-value / diminishing-return stop rule.
9. Model self-confidence and trajectory signals could become tempting but unsafe proxies for “needs more thinking.”
10. Child agents and parallel candidates need hierarchical budgets and bounded fan-out.

## 2. Ownership boundary

Adaptive Compute owns:

- compute policy
- multi-dimensional budget allocation
- phase-level compute leases
- budget reservations, spending and release
- difficulty / expected-value estimation policy
- dynamic escalation, de-escalation and pivot decisions
- no-progress / diminishing-return detection
- compute early-exit policy
- optional learned allocation policy and its lifecycle
- compute outcome telemetry and evaluation

Adaptive Compute does **not** own:

- task authority or state machine: Cognitive Runtime
- model/provider eligibility or endpoint selection: Model Fabric
- context construction: Context Fabric
- retrieval truth: Memory/Research systems
- tool permissions or side effects: Tool Fabric / Permission System
- factual verdicts: Epistemic Fabric
- verification truth: Verification/Judge
- device truth and hard resource ceilings: Resource Governor

## 3. Remove scalar compute as authority

FAST / STANDARD / DEEP / EXTREME may remain as UI/compatibility summaries, but they are no longer the canonical decision object.

Canonical compute is a **BudgetVector**.

Example dimensions:

- wall-clock ceiling
- model-call ceiling
- reasoning / generation budget
- candidate/sample width
- planning/replanning budget
- retrieval operations/depth
- context target/ceiling
- tool-call budget
- browser/network operation budget
- verification budget
- retry/escalation budget
- safe concurrency
- local compute allowance

These resources are not silently converted into one universal cost scalar. Their tradeoffs differ by task, device and provider.

## 4. Compute shapes

A task may be described by one or more compute shapes:

- `DIRECT`
- `REASONING_HEAVY`
- `RETRIEVAL_HEAVY`
- `CONTEXT_HEAVY`
- `TOOL_HEAVY`
- `VERIFICATION_HEAVY`
- `HYBRID`

These are routing descriptors, not fixed presets.

Examples:

- a factual freshness question may be retrieval-heavy but reasoning-light;
- a code repair may be tool/test-heavy with moderate reasoning;
- a simple external action may be reasoning-light but verification-heavy;
- a long RPG continuation may be context-heavy rather than verifier-heavy;
- a hard proof may be reasoning-heavy with minimal tools.

## 5. Canonical objects

### ComputeRequest

Derived from TaskContract plus current run phase. Carries objectives, success criteria, risk class, latency preference, current unresolved blockers and permitted capabilities.

### ResourceEnvelope

Read-only constraints supplied by Resource Governor and relevant fabrics: device tier, battery/thermal/memory pressure, network state, provider/quota availability and foreground/background state.

### BudgetVector

The allowed and reserved computation for a task or phase.

### ComputeLease

A bounded allocation for one phase/subtask. It has an owner, parent, expiry/termination conditions, reserved resources and mandatory reserves.

### BudgetLedger

Records reservation, commitment, spend, release and exhaustion events. Child leases cannot collectively exceed parent reservations.

### ComputeCheckpoint

A compact decision point containing verified progress, remaining blockers, consumed budget, resource changes, no-progress signals and the next compute action.

### AllocationPolicy

Versioned deterministic or learned policy with lineage, eval identity, deployment state and rollback target.

## 6. Mandatory floors before optimization

Adaptive optimization happens only **after** mandatory floors are established.

Possible floors include:

- permission/authority checks
- side-effect reconciliation/verification
- required deterministic validation
- minimum evidence/freshness rules
- required schema/output validation
- task-specific safety/correctness gates
- cancellation/recovery bookkeeping

A user choosing “fast” or a phone entering Lite mode may reduce optional work, but cannot disable these floors.

**Risk raises mandatory assurance; it does not automatically mean longer chain-of-thought.**

## 7. Budget partition and reserves

Every meaningful run reserves compute before spending it.

Recommended conceptual partitions:

- execution budget
- verification reserve
- recovery/reconciliation reserve
- optional exploration reserve

Verification/recovery reserves cannot be silently consumed by speculative planning or candidate sampling.

Unused reservations are released and can be reallocated later.

This prevents the failure mode: “the agent spent everything generating an answer and had nothing left to prove it.”

## 8. Initial allocation

Ordinary hot-path allocation should be cheap.

Inputs may include:

- task class and language/modality
- deterministic complexity features
- known tool/retrieval requirements
- historical success by task cluster
- current epistemic gaps
- success-criterion structure
- expected horizon
- provider/model capabilities from Model Fabric
- resource envelope
- user latency/quality preference

Do **not** require another expensive LLM call merely to decide how much LLM compute to use.

A compact local classifier or deterministic champion is preferred.

## 9. Closed-loop allocation

Compute is re-evaluated only at meaningful checkpoints, for example:

- retrieval materially changes evidence state
- a tool call succeeds/fails
- a test fails
- a blocker is resolved
- verification fails
- the route changes
- the device/resource envelope changes materially
- a subtask completes
- no-progress is detected

Checkpoint actions are bounded:

- `CONTINUE`
- `DEEPEN`
- `BROADEN`
- `SHIFT_BUDGET`
- `PIVOT`
- `VERIFY_NOW`
- `EARLY_EXIT`
- `ABANDON_AS_INCONCLUSIVE`

No continuous metareasoning loop is required.

## 10. Marginal utility rule

The conceptual decision is:

> Is the expected increase in **verified task utility** from the next unit of compute worth its resource/opportunity cost?

Seven does not need a fake precise dollar value for every operation. The first implementation may use calibrated ordinal buckets and deterministic rules.

A learned marginal-utility estimator is optional later, and must beat the deterministic champion in held-out evals.

Strong evidence of diminishing returns should stop escalation even when nominal budget remains.

## 11. Difficulty estimation is uncertain

Input difficulty is a prediction, not truth.

Use:

- cheap task features
- task-cluster outcome history
- known structural requirements
- externally verifiable progress/failure signals

Treat model self-confidence, entropy and early reasoning-trace signals as weak supplementary evidence unless independently calibrated.

Recent work shows early-trajectory predictors can be confounded by problem difficulty. Therefore Seven must benchmark any “early signal” against a question/task-only difficulty baseline and within-task-cluster controls before trusting it.

## 12. Early exit

Seven exits compute early when:

- success criteria are satisfied;
- mandatory verification floors have passed;
- required side effects are verified/reconciled;
- required epistemic blockers are resolved;
- no required phase remains.

Budget remaining is not a reason to keep thinking.

Model confidence alone never triggers acceptance.

Research on dynamic early exit reports substantial token reductions and sometimes accuracy gains, but Seven treats these as hypotheses to verify per model/task rather than universal constants.

## 13. No-progress and overthinking control

Detect patterns such as:

- repeated plan fingerprints
- repeated equivalent tool calls
- repeated error class with no changed precondition
- verifier status not improving
- evidence coverage plateau
- oscillation between two strategies
- repeated candidate answers without independent new evidence
- large budget burn without success-criterion progress

Responses include budget shift, pivot, simpler method, verification now, or explicit `INCONCLUSIVE`/`BLOCKED`.

More compute is not automatically the cure for failed compute.

## 14. Reasoning allocation

Reasoning controls may include:

- reasoning effort supported by the selected model
- output/thinking token ceiling
- sequential deliberation length
- candidate count
- search width/depth
- replanning count

The optimal mechanism depends on model and task. Test-time scaling protocols are not interchangeable.

Do not blindly increase every mechanism together.

## 15. Tool-aware compute

Tool calls are first-class compute resources.

The planner receives a compact view of remaining tool budget so it can choose between:

- digging deeper on a promising path
- pivoting
- verifying
- stopping

Tool Fabric still owns permission, schema and effect safety.

Budget awareness never grants tool authority.

Research on budget-aware agents shows that merely increasing tool-call ceilings can hit a performance plateau; explicit budget awareness and adaptive planning are more effective.

## 16. Retrieval-aware compute

Retrieval stages receive separate budgets for:

- query expansion
- lexical/semantic candidate generation
- reranking depth
- evidence expansion
- contradiction/freshness follow-up

Do not distribute compute uniformly across retrieval stages.

Recent retrieval-agent work found that stronger/deeper reranking could be much more valuable than extra query-expansion thinking, reinforcing stage-specific allocation.

## 17. Verification-aware compute

Verification follows progressive escalation:

1. deterministic checks
2. execution/result evidence
3. consistency/contract checks
4. lightweight learned/discriminative verifier where qualified
5. generative critic/judge only when justified
6. independent stronger route only for cases where the expected gain warrants it

The current critic/attacker/judge arena becomes a **selective Verification strategy**, not an automatic consequence of a generic DEEP tier.

Verification compute may increase with consequence/risk even when reasoning compute does not.

## 18. Candidate sampling and parallelism

Multiple candidates/branches are allowed only when:

- the task benefits from diversity/search;
- candidates are meaningfully independent;
- there is a selection/verifier mechanism;
- the budget supports them;
- Resource Governor permits concurrency.

Reserve before fan-out. Cancel losing work as soon as it is safely dominated.

Never create unbounded candidate trees or parallel agents.

## 19. Hierarchical budgets

Mission → run → phase → subtask/child-agent → operation.

Every child receives a lease from its parent.

Rules:

- children cannot mint compute;
- unused child reservations return to the parent;
- parent cancellation propagates;
- side-effect/reconciliation reserve stays protected;
- high-priority foreground work can preempt optional background work.

This is required for future parallel agents and long Coding/Research workflows.

## 20. Model Fabric handshake

Adaptive Compute expresses requirements, not provider names.

Example outputs to Model Fabric:

- target success/qualification class
- latency preference
- reasoning-control requirement
- local/remote resource constraints
- acceptable escalation tier

Model Fabric chooses a currently eligible model/deployment.

If routing changes materially, Adaptive Compute can re-evaluate the budget because different models have different compute curves.

## 21. Context Fabric handshake

Adaptive Compute may set a context target/ceiling and request broader/narrower context.

Context Fabric decides **what content** enters the window and how it is compressed/reconstructed.

Adaptive Compute cannot bypass instruction/data authority separation.

## 22. Resource Governor handshake

Resource Governor supplies hard/soft device constraints.

Adaptive Compute may degrade optional work under:

- thermal pressure
- low battery
- memory pressure
- foreground/background changes
- weak network
- provider/quota pressure

But it may not degrade mandatory correctness or effect verification. If the required floor cannot fit, return a truthful blocked/deferred/inconclusive state.

Use hysteresis to avoid oscillating compute profiles.

## 23. Mobile-first rules

- no always-on metareasoning process
- no heavy classifier needed on startup
- no speculative large-model load
- no continuous benchmark/probe loop
- no broad predictive “sleep-time thinking” by default
- optional idle/charging work should prefer deterministic indexing/cache preparation with clear invalidation
- speculative AI precomputation requires explicit benefit, cheap cancellation and Resource Governor approval
- keep the ordinary allocator local, tiny and synchronous where practical

## 24. User compute intent

Possible product-level intent:

- `FAST`
- `AUTO` (default)
- `MAX_QUALITY`

These are preference/ceiling signals, not permission or truth controls.

`FAST` cannot undercut mandatory floors.
`MAX_QUALITY` is still bounded by available resources, provider limits, no-progress rules and diminishing returns.

## 25. Learned allocation policy

A learned allocator is optional.

Lifecycle:

`candidate → offline eval → shadow → canary → approved → drift monitor → rollback/quarantine`

Permanent deterministic champion remains the fallback.

Training/feedback rules:

- rewards come from verified task outcomes, not model self-confidence;
- preserve task/language/modality stratification;
- use resource-normalized quality metrics;
- store versioned policy lineage;
- avoid storing sensitive raw prompts when task features suffice;
- bounded exploration only inside already-safe envelopes;
- one lucky run cannot dominate policy.

## 26. Evaluation objective

Do not optimize only accuracy, tokens, or latency.

Measure Pareto behavior across:

- verified success rate
- correctness / task utility
- latency / TTFT
- model tokens/calls
- tool/network operations
- verification cost
- provider quota consumption
- RAM/CPU
- battery/thermal impact
- fallback/escalation frequency
- no-progress termination quality
- cancellation/recovery

A policy is better when it moves the quality-resource Pareto frontier without violating hard gates.

## 27. Research synthesis

Key findings integrated into the design:

- Snell et al., *Scaling LLM Test-Time Compute Optimally...* (2024): compute-optimal strategy depends strongly on prompt difficulty and can outperform naive best-of-N efficiency.
- *Reasoning on a Budget* (2025): separates fixed-budget control from true adaptive compute and documents overthinking/underthinking.
- *Dynamic Early Exit in Reasoning Models* (2025): demonstrates that excessive reasoning can waste tokens and sometimes hurt quality.
- *Budget-Aware Tool-Use Enables Effective Agent Scaling* (2025): tool-call budget alone is insufficient; explicit budget awareness and adaptive planning matter.
- *Budget-aware Test-time Scaling via Discriminative Verification* (2025): cheaper verification strategies can dominate expensive generative verification under fixed budgets.
- *The Art of Scaling Test-Time Compute* (2025): no single test-time strategy universally dominates; optimal strategy depends on problem difficulty and model type.
- *Adaptive Test-Time Compute Allocation...* (2026): frames allocation as constrained optimization and reports gains over uniform/heuristic budgets.
- *Compute Allocation for Reasoning-Intensive Retrieval Agents* (2026): compute value differs sharply by pipeline stage.
- *Test-Time Scaling in Reasoning LLMs* (2026): sequential, leaf-level and prefix-level scaling are distinct regimes and should not be collapsed into one scalar budget.
- *It's the Problem, Not the Path* (2026): warns that early reasoning signals can be confounded by underlying task difficulty.

Research references:

- https://arxiv.org/abs/2408.03314
- https://arxiv.org/abs/2507.02076
- https://arxiv.org/abs/2504.15895
- https://arxiv.org/abs/2511.17006
- https://arxiv.org/abs/2510.14913
- https://arxiv.org/abs/2512.02008
- https://arxiv.org/abs/2604.14853
- https://arxiv.org/abs/2603.14635
- https://arxiv.org/abs/2608.04001
- https://arxiv.org/abs/2609.03436

## 28. Pass A — MAXIMIZE

Pass A proposed the strongest practical adaptive layer:

- vector budgets instead of one scalar
- stage-specific compute shapes
- dynamic checkpoints
- difficulty prediction
- marginal-utility escalation
- candidate/search scaling
- adaptive tool/retrieval/context/verification depth
- learned allocation policy
- hierarchical reservations
- optional opportunistic precomputation

Candidate A materially improved flexibility but risked becoming a second planner and overusing meta-computation.

## 29. Velocity Assault

Remove from the ordinary hot path:

- meta-LLM allocation calls
- full provider/model evaluation
- heavy embeddings solely for compute choice
- continuous resource polling beyond available platform signals
- unconditional multi-candidate generation
- unconditional critic/attacker/judge calls
- background predictive reasoning

Fast path should be approximately:

`cheap features → mandatory floor → deterministic allocator → small BudgetVector → execute`

Checkpoint only after meaningful events.

## 30. Pass B — DESTROY THE WINNER

Pass B attacked Candidate A with these failure modes:

1. **Second-planner creep** — Adaptive Compute must allocate resources, not invent task semantics.
2. **Scalar relapse** — compatibility tier labels cannot become authority again.
3. **Risk=difficulty error** — split reasoning difficulty from verification/consequence floors.
4. **Allocator self-confidence poisoning** — self-reported confidence cannot directly increase/decrease assurance.
5. **Runaway escalation** — hard ceilings, escalation counts and no-progress rules are mandatory.
6. **Verification starvation** — protected reserve is mandatory.
7. **False early exit** — acceptance requires success criteria plus mandatory verification.
8. **Parallel oversubscription** — hierarchical reservation before fan-out.
9. **Resource oscillation** — use Resource Governor hysteresis and checkpointed reallocation.
10. **Background battery drain** — predictive precompute rejected by default on mobile.
11. **Benchmark gaming** — learned allocation must be evaluated across task classes, Arabic/English, easy/hard mixes and resource conditions.
12. **Early-signal leakage/confounding** — difficulty-only baselines are mandatory for early-exit predictors.
13. **More-compute superstition** — repeated failure can trigger pivot/stop rather than deeper thinking.

All survived reconciliations are included in the final target.

## 31. Final architecture

```text
TaskContract + Run Phase + Success Criteria
        + Epistemic/Verification State
        + ResourceEnvelope
        + User Compute Intent
                 |
                 v
        Mandatory Compute Floors
                 |
                 v
        Cheap Difficulty/Need Estimator
                 |
                 v
        Deterministic Champion Allocator
                 |
                 v
             BudgetVector
                 |
                 v
              ComputeLease
                 |
                 v
 Execute via Cognitive / Model / Context / Tool / Retrieval fabrics
                 |
          meaningful checkpoint
                 |
                 v
 Progress + Blockers + Spend + Resource Changes
                 |
                 v
 Continue | Shift | Deepen | Broaden | Pivot | Verify | Exit
                 |
                 v
       Verified Outcome + BudgetLedger
                 |
       optional bounded policy learning
```

## 32. Mandatory eval families

Before implementation freeze, test at least:

- trivial chat fast path
- hard reasoning quality/token Pareto
- easy-problem overthinking
- hard-problem underthinking
- retrieval-heavy vs reasoning-heavy allocation
- coding inspect/edit/test budget allocation
- research evidence/freshness allocation
- budget-aware tool-use
- high-consequence but simple action verification floor
- context-heavy RPG continuity without needless reasoning escalation
- early-exit correctness
- false-confidence early-exit attacks
- no-progress loops
- repeated tool/result loops
- verification-reserve preservation
- recovery-reserve preservation
- child-agent budget isolation
- bounded parallelism
- cancellation budget release
- provider/quota degradation
- offline/local fallback
- memory pressure
- thermal/battery degradation
- Lite/Balanced/Full behavior
- Arabic/English parity
- long-run budget accounting
- learned allocator vs deterministic champion
- policy drift/rollback
- task-difficulty baseline vs trajectory-signal predictor

## 33. Implementation stages

Implementation remains deferred until cross-system reconciliation.

- **AC-P0** — define ComputeRequest, BudgetVector, ComputeLease, BudgetLedger and compatibility tier projection.
- **AC-P1** — split mandatory floors from optional utility optimization.
- **AC-P2** — deterministic champion allocator and compute-shape classifier.
- **AC-P3** — hierarchical reservations, verification/recovery reserves and budget accounting.
- **AC-P4** — meaningful checkpoints, no-progress and bounded escalation/pivot/exit.
- **AC-P5** — handshakes with Cognitive Runtime, Model Fabric and Context Fabric.
- **AC-P6** — tool/retrieval/verification stage-specific budgets.
- **AC-P7** — Resource Governor/mobile degradation and cancellation/release semantics.
- **AC-P8** — eval harness and Pareto dashboards.
- **AC-P9** — optional learned allocator in shadow/canary with deterministic rollback.
- **AC-P10** — adversarial, long-run, Android battery/thermal and multilingual gates.

## 34. Freeze decision

The frozen campaign target is:

# **Seven Adaptive Compute 3.0 — Closed-Loop Marginal-Utility Compute Governor**

It replaces “choose one compute tier before the run” with **multi-dimensional, reserved, evidence-responsive compute allocation**.

The system is designed to think **enough**, search **enough**, use tools **enough**, and verify **enough** — then stop.

Architecture freeze is not implementation completion. Existing compute foundations remain partial until AC-P0 through AC-P10 are implemented, wired and verified.