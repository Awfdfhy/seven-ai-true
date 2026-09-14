# Seven AI — Ultimate Polish Progress

> Durable evidence ledger for the maximum-density Ultimate Polish campaign. Runtime/repository evidence outranks documentation claims.

## Campaign
- Branch: `ultimate-polish-v1`
- Density target: `~20–25` Mega-Waves
- Current counter: **`3 / ~20–25`**
- Protected source: `seven_ai-final.html`
- Protected source reference: `658133` bytes, Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`
- Protected-branch law: do not merge to `main` or another protected branch without explicit user approval.

## Mega-Wave 01 — Speed + Smoothness Foundation
**Status:** `PASS_FOUNDATION`

### Material implementation
- separated Reduced Motion accessibility preference from compute-tier selection;
- added resource/pressure-aware `lite/balanced/full` recommendation;
- immediate downgrade plus conservative recovery/hysteresis;
- visibility-aware degradation/re-evaluation;
- retained keyed frame batching, cancellable idle work and cooperative yielding;
- added 11 direct Performance Runtime assertions;
- made `all.cjs` discover `release/*.test.cjs` automatically;
- Simplifier Duel reduced the strengthened Performance Runtime to `4368` bytes, below the pre-wave `4487` bytes.

### Evidence
Implementation commit `57fe639cdedc066e73bda64571fc68c38426c4f7`, implementation run `34847429061`, final documented HEAD `afa6b8205969d48c8487ed5a57f647d852ee5021`, final workflow run `34847605495`.

Verified: `39` suites; Performance Runtime `11`; Runtime Smoke `28`; source integrity PASS; `98946` startup bytes; `34881` lazy workspace bytes; `3688736 / 8388608` static APK bytes; `0 warnings`; release verify `2` checks; six UI screenshots; release artifact upload.

### Carry-forward gaps
Real Android startup/RAM/battery/thermal/frame evidence, project-wide tail latency/jank, provider/network pressure and dependency hygiene remain release-level work.

---

## Mega-Wave 02 — Cognitive Runtime + Truth/Epistemic Foundation
**Status:** `PASS_FOUNDATION`

### Material implementation
- normalized Task Contract string risk so `high`/`critical` cannot collapse to numeric zero;
- preserved verification floors under constrained compute tiers;
- authority-sensitive decisions fail closed when trust provenance is absent or externally tainted;
- fresh-claim evidence counts independent verified source groups rather than duplicate evidence rows;
- deduplicated source/version evidence and stopped treating different wording as automatic contradiction;
- unknown source independence stays unknown;
- required reasons for `BLOCKED`, `INCONCLUSIVE`, `FAILED`, `CANCELLED` transitions;
- restored Reduced Motion/compute separation in fallback Control/Resource paths;
- Pass B repaired mission-budget concurrency: DONE/RUNNING work reserves budget, the ready frontier is cumulative, dependencies cannot start early, and concurrent starts cannot oversubscribe.

### Evidence
Pass A run `34853211411` at `6d3fc01d04611edae09b5ae3652cdc69f75d61b4`.
Final implementation run `34853584115` at `bf8c66e0ca9f7e2363dde7827ff530a5e3cd3d85`.

Verified: `40` suites; Cognitive Boost `23`; Cognitive Gate `7`; Cognitive Planner Polish `4`; Runtime Smoke `28`; Performance Runtime `11`; control/execution integration PASS; source integrity PASS; `99553` startup bytes; `34881` lazy workspace bytes; `3689343 / 8388608` static APK bytes; `0 warnings`; release verification and six screenshots PASS.

### Carry-forward gaps
Full CR3 execution classes, structured WAITING/CANCELLING/RECOVERING, uncertain-side-effect reconciliation, complete ClaimGraph/correction propagation and broader live/device evidence remain later ownership domains.

---

## Mega-Wave 03 — Memory Fabric + Context Workspace Foundation
**Status:** `PASS_FOUNDATION`

### Truth reconstructed
The repository already had protected-source memory history, IDB/persistence tests, runtime context actions and a Node context compiler. The architecture target was materially stronger than the executable boundary: long-term memory needed origin-bound version semantics and Context needed hard separation between privileged instructions and recalled/retrieved/tool/project data. The audit also found Node/browser policy drift: the strengthened Node compiler could enforce rules the release Control Runtime did not yet share.

### Maximum Effort Pass A — Memory Fabric
Added `hardening/memory-fabric.cjs` as a protected-source-safe foundation rather than rewriting `seven_ai-final.html`.

Implemented:
1. selective durable admission instead of transcript dumping;
2. explicit durable roles (`EPISODE`, `STATE`, `PREFERENCE`, `GOAL`, `PROCEDURE`, `LESSON`, `PROFILE`);
3. Procedure admission requires verified experience or authoritative instruction;
4. immutable origin/principal/scope/cluster/authority binding;
5. versioned correction/supersession with historical retrieval and point-in-time lookup;
6. same-origin canonical-restatement dedupe so repetition cannot fake corroboration;
7. scope/principal/namespace filtering before recall leaves Memory;
8. bounded retrieval and deterministic ranking;
9. `MemoryCapsule` projection marked `MEMORY_RECALL`, `RECALL_ONLY`, `grantsAuthority:false`;
10. Memory cannot authorize an action;
11. hard purge removes current and historical canonical payload and leaves only a non-sensitive receipt.

### Maximum Effort Pass A — Context Workspace
Strengthened `hardening/context-compiler.cjs` into a governed elastic compiler:
1. typed context roles instead of generic system-role projection;
2. only trusted runtime/controller/policy `AUTHORITY_INSTRUCTION` can enter the privileged `system` lane;
3. Memory, evidence, project material, tool observations/schemas and other contextual data cannot self-promote into instructions;
4. principal/namespace/scope and lifecycle filtering occurs before ranking;
5. revision/content dedupe before budget selection;
6. mandatory anchors are selected first and oversized mandatory context returns `BLOCKED` rather than silently dropping requirements;
7. elastic budget borrowing uses otherwise stranded budget without treating the window as a target fill level;
8. semantic role ordering plus conversation chronology preservation;
9. deterministic ContextManifest/ContextCapsule identity;
10. blocked compilation refuses model-message assembly.

### Pass B — browser parity, bridge hardening and Simplifier Duel
Pass B found two independent release defects:
- Node hardening policy had become stronger than the browser `release/control-runtime.js`, causing real policy drift;
- the existing `release/control-bridge.js` still projected truth/project/memory/tool data using system-like roles.

Repairs:
- upgraded browser Control Runtime to `v4.3` with governed context semantics, scope filters, mandatory blocking, dedupe, elastic borrowing and chronology;
- compacted and hardened Control Bridge `v1.1.0` so Task/Truth/Project/Memory/Tool/Conversation inputs carry explicit context roles and Memory remains recall-only data;
- exposed `memoryFabric` through `hardening/index.cjs`;
- added `hardening/memory-context.test.cjs` with 15 adversarial assertions;
- aligned general hardening tests with the trusted-instruction boundary;
- updated release verification to the `v4.3` contract marker.

The first browser-parity candidate exceeded the unchanged startup cap (`101169 > 100000`). The cap was **not raised**. The Simplifier Duel compacted the bridge and brought the final release layer to **`99794` bytes**, preserving the stronger policy while returning under budget.

### Final implementation evidence
Final implementation HEAD before documentation: `5172c30fbb2eaffde30cbe65356668d75a12a0d8`.
GitHub Actions run **`34857043114`** / run #1426: **success**.

Evidence from the exact HEAD:
- complete gate: **`PASS (41 suites)`**;
- Memory/Context hardening: **`PASS (15 assertions)`**;
- control parity + bridge integration: PASS;
- hardening tests: PASS;
- Runtime Smoke: `PASS (28 assertions)`;
- Performance Runtime: `PASS (11 assertions)`;
- Cognitive Boost: `PASS (23 assertions)`;
- Cognitive Gate: `PASS (7 assertions)`;
- Cognitive Planner Polish: `PASS (4 assertions)`;
- source-integrity lock: PASS, protected source remains `658133` bytes / blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`;
- static audit: **`99794` startup bytes**, `34881` lazy workspace bytes, `3689584 / 8388608` static APK bytes, `0 warnings`;
- release verification: `PASS (2 checks, 99794 startup bytes)`;
- UI screenshot capture: `PASS (6 files)`;
- release artifact upload: PASS, artifact `10353232511`, zip SHA-256 `531211e047fda5921baf3cfae3b3a67c8a31e9f8633eb101585c37671ce0ed9b`.

### Unlimited / Speed / Smoothness / Zero-Manual gates
- **Unlimited:** `PASS_FOUNDATION`. Retrieval/context are bounded by explicit resource/window budgets rather than arbitrary conversation counts; long-lived scalable persistence remains later work.
- **Speed:** `PASS_FOUNDATION`. Required governance was added without raising the startup ceiling; the final release remains `99794 / 100000` bytes and heavy workspaces/PDF remain lazy.
- **Smoothness:** `PASS_FOUNDATION`. No continuous background summarization, vector service or polling loop was added to the interaction path.
- **Zero-Manual:** `PASS_FOUNDATION`. Scope filtering, recall labeling, dedupe, mandatory-context blocking and elastic budget use happen automatically.

### Explicit open evidence/implementation gaps
- full scalable persistent Memory 3.0 storage and materialized lexical/entity/time/vector indexes;
- optional local semantic/vector retrieval, reranking and lazy embedding migration;
- complete cross-system invalidation/reconstruction checkpoint machinery;
- exact provider/model tokenizer handshake and model-switch recompilation, owned with Model Fabric;
- full import/export/recovery/purge reconciliation across every derived representation;
- real Android long-session RAM/battery/latency evidence;
- protected legacy memory remains intact and later needs a governed compatibility bridge rather than casual source editing;
- CI dependency install still reports `7` audit findings (`3 moderate`, `3 high`, `1 critical`) plus deprecation warnings; this remains explicit dependency-hardening work.

### Wave 03 conclusion
`PASS_FOUNDATION`, not `IMPLEMENTATION_SATURATED`, not `RELEASE_SATURATED`.

## Next Mega-Wave
**Mega-Wave 04 — Model Fabric + Adaptive Compute Foundation**

Audit and strengthen ModelFamily/Revision/Endpoint identity, free-proof freshness and fail-closed eligibility, health/quota/endpoint semantics, champion/fallback/lease behavior, context-window handshake, verified-outcome routing and promotion safety. Reconcile Adaptive Compute around multi-dimensional budgets, protected verification/recovery floors, resource ceilings, early-exit/inconclusive semantics and deterministic champion behavior without adding a hot-path meta-model.