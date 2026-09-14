# Seven AI — Ultimate Polish Progress

> Durable execution ledger for the maximum-density Ultimate Polish campaign. This file records evidence, not aspirations.

## Campaign
- Branch: `ultimate-polish-v1`
- Density target: `~20–25` Mega-Waves
- Current counter: **`2 / ~20–25`**
- Protected source: `seven_ai-final.html`
- Protected source Git blob: `3e8dfa8e7da7124e16504140eb9631c10cabf053`

## Mega-Wave 01 — Speed + Smoothness Foundation
**Status:** `PASS_FOUNDATION`  
**Scope truth:** foundational runtime/verification pass only. This is not project-wide Performance, Android or Release saturation.

### Implementation truth reconstructed
The release already had `performance-runtime.js`, `control-runtime.js`, resource tiers, long-task observation, frame/idle scheduling, release build injection and browser/static gates. The gap was not absence of a performance system; it was weak dedicated verification and a policy bug in the primary release performance selector that coupled Reduced Motion accessibility preference to compute tier selection.

### Material changes
1. **Separated accessibility preference from compute capacity in the primary release Performance Runtime.** Reduced Motion remains exposed as a presentation signal but no longer forces a capable device into the `lite` performance tier.
2. **Added explicit tier recommendation from resource signals.** Critical memory/thermal/battery pressure and constrained hardware select `lite`; recent long tasks prevent optimistic `full` selection.
3. **Added conservative recovery/hysteresis.** Downgrades occur immediately under pressure, while upgrades are guarded to reduce tier thrashing after recent long tasks/pressure.
4. **Visibility-aware degradation/recovery.** Hidden pages can reduce work aggressively; returning visible re-evaluates the tier.
5. **Preserved lightweight scheduling primitives.** Keyed frame batching, cancellable idle work, cooperative yielding and bounded timing marks remain available.
6. **Added a dedicated Performance Runtime test suite** with 11 assertions.
7. **Removed the manual release-test registry.** `all.cjs` now discovers every `release/*.test.cjs` automatically, reducing the chance that future verification suites exist but are silently omitted from CI.
8. **Ran the Simplifier Duel twice.** The final adaptive runtime retained the new behavior while shrinking to `4368` bytes, smaller than the pre-wave runtime (`4487` bytes) and much smaller than the first strengthened candidate (`4951` bytes).

### Verification evidence
Final implementation GitHub Actions run `34847429061` at commit `57fe639cdedc066e73bda64571fc68c38426c4f7` completed successfully.

Evidence from the run:
- Performance Runtime: `PASS (11 assertions)`.
- Complete test gate: `PASS (39 suites)`.
- Runtime smoke: `PASS (28 assertions)`.
- Cognitive Boost: `PASS (19 assertions)` and Cognitive Gate: `PASS (5 assertions)` as regression coverage for the next dependency boundary.
- Source integrity lock: `PASS`, protected source remained `658133` bytes with blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.
- Static audit: `PASS`, `98946` startup bytes, `34881` lazy workspace bytes, `3688736 / 8388608` static APK bytes, `0 warnings`.
- Release verification: `PASS (2 checks, 98946 startup bytes)`.
- UI screenshot capture: `PASS (6 files)`.
- Release artifact upload: `PASS`.

### Simplifier Duel
The stronger design was kept inside the existing tiny runtime rather than introducing a separate performance service, worker or polling loop. After the first strengthened version passed, a second simplification pass reduced the runtime from `4951` to `4368` bytes with the same 11 direct gates. The final runtime is `119` bytes smaller than the pre-wave `4487`-byte implementation while adding adaptive pressure handling, guarded recovery and dedicated verification. Automatic release-test discovery also replaced a hand-maintained suite registry.

### Unlimited / Speed / Smoothness / Zero-Manual gates
- **Unlimited:** PASS for this foundation's bounded telemetry/scheduling design; it does not accumulate unbounded timing/long-task history.
- **Speed:** PASS_FOUNDATION; critical-path runtime remains below the existing release startup budget and heavy workspaces/PDF remain lazy.
- **Smoothness:** PASS_FOUNDATION; frame batching, cooperative yield and pressure-driven downgrade are verified. Real-phone frame pacing still requires device evidence.
- **Zero-Manual:** PASS_FOUNDATION; tier selection/recovery is automatic and does not require user configuration.

### Open evidence gaps
These are deliberately not relabeled as success:
- real Android phone startup, RAM, battery, thermal and sustained-frame measurements;
- project-wide p95/p99 latency and jank baselines across every capability;
- real provider/network variability under pressure;
- browser APIs do not directly expose every thermal/memory pressure signal, so native Android/runtime bridges remain future evidence work;
- CI dependency installation reported audit/deprecation warnings; dependency hygiene remains a separate hardening item rather than being hidden by this PASS.

### Wave 01 conclusion
`PASS_FOUNDATION`, not `IMPLEMENTATION_SATURATED` and not `RELEASE_SATURATED`.

---

## Mega-Wave 02 — Cognitive Runtime + Truth/Epistemic Foundation
**Status:** `PASS_FOUNDATION`  
**Scope truth:** this closes material implementation defects in the existing cognitive/truth foundation and adds adversarial gates. It does **not** claim complete Cognitive Runtime 3.0 or Epistemic Fabric 3.0 implementation saturation.

### Implementation truth reconstructed
The repository already contained more cognitive machinery than the high-level status implied: Task Contract state transitions, scoped capability authorization, execution checkpoints, adaptive compute, mission planning, verified route learning, trust propagation, adversarial preflight, truth authority ceilings, Research/World bridges and deterministic recovery tests. The audit found several integration defects that could make the existing system behave less safely than its architecture promised:

1. Task Contract risk is a string (`low/medium/high/critical`) while adaptive compute previously interpreted risk numerically, so `high` could silently become `0`.
2. Authority-sensitive cognitive decisions could report tool authority as usable when no trust provenance was supplied.
3. Fresh-claim evidence counted verified evidence items instead of verified independent source groups, so duplicate evidence from one source could imitate multi-source support.
4. Truth Fabric treated different text strings as contradiction and defaulted unknown source independence to the source ID, creating false conflict and false independence.
5. The standalone Control Runtime and hardening Resource Governor still coupled Reduced Motion to the `lite` compute tier after Wave 01 fixed the primary Performance Runtime.
6. `BLOCKED`, `INCONCLUSIVE`, `FAILED`, and `CANCELLED` transitions could be recorded without a reason.
7. The mission planner could expose several individually affordable tasks whose combined cost exceeded the mission budget; RUNNING work also did not reserve budget and dependencies were only protected at completion rather than start.

### Maximum Effort Pass A — material changes
1. **Risk vocabulary normalization.** Added a canonical risk score map and made cognitive compute/preflight understand both Task Contract strings and numeric risk. High risk has at least STANDARD compute; critical risk has at least DEEP verification policy.
2. **Resource-aware compute without safety downgrades.** `lite`/`balanced` resource tiers can cap optional candidate breadth and planner depth while retaining the verifier passes demanded by risk.
3. **Authority fail-closed behavior.** Missing trust provenance now means `mayUseAuthorityTools = false`; authority-sensitive preflight blocks both untrusted external flow and absent provenance.
4. **Evidence independence semantics.** Fresh-claim checks now use verified independent groups rather than raw verified-evidence count. Multiple evidence items from one source do not fake independence.
5. **Truth source deduplication.** Source/version-like duplicates are removed before aggregation and inherited sources are deduplicated in derived claims.
6. **False-conflict removal.** Different claim wording no longer becomes a conflict merely because the strings differ. Conflict requires explicit contradiction linkage or a conflict state.
7. **Unknown-independence honesty.** Source IDs no longer automatically count as independent groups. Unknown independence remains unknown.
8. **Production-mode compatibility.** Claims expose whether they are ASSERTED, INFERRED, ASSUMED or UNKNOWN without pretending this is a full EF3 verdict graph.
9. **Explained non-success states.** Task Contract and browser Control Runtime require reasons for BLOCKED, INCONCLUSIVE, FAILED and CANCELLED transitions.
10. **Control/runtime parity.** Browser Control Runtime received the same truth semantics, source dedupe, failure-reason and accessibility/compute separation as the Node hardening layer.
11. **Reduced Motion parity.** Both Resource Governor and Control Runtime fallback now treat Reduced Motion as presentation/accessibility state rather than weak-device evidence.

### Pass A verification
GitHub Actions run `34853211411` at commit `6d3fc01d04611edae09b5ae3652cdc69f75d61b4` completed successfully.

Pass A evidence included:
- all suites: `PASS (39 suites)`;
- Cognitive Boost: `PASS (23 assertions)`;
- Cognitive Gate: `PASS (7 assertions)`;
- Runtime Smoke: `PASS (28 assertions)`;
- Performance Runtime: `PASS (11 assertions)`;
- control parity + bridge integration: `PASS`;
- execution bridge security + recovery: `PASS`;
- hardening tests: `PASS`;
- source integrity: `PASS` with protected source unchanged;
- static audit: `PASS`, `99553` startup bytes, `34881` lazy workspace bytes, `3689343 / 8388608` static APK bytes, `0 warnings`;
- release verification and six UI screenshots: `PASS`;
- release artifact upload: `PASS`.

### Maximum Effort Pass B — adversarial planner challenge
Pass B independently attacked budget/concurrency semantics rather than merely rereading Pass A. It found that the mission frontier checked tasks independently against remaining budget, which allowed a ready set whose **combined** cost exceeded the mission budget. It also found that RUNNING tasks did not reserve budget and a dependent task could be started early even though it could not be marked DONE early.

Material repairs:
1. DONE + RUNNING tasks now consume committed mission budget.
2. The ready frontier is constructed deterministically and cumulatively, subtracting each selected task from remaining budget.
3. Starting or completing a task fails when dependencies are incomplete.
4. Concurrent starts fail when they would oversubscribe the mission budget.
5. Added `evolution/cognitive-planner-polish.test.cjs` with four adversarial assertions.

### Final implementation verification
GitHub Actions run `34853584115` at commit `bf8c66e0ca9f7e2363dde7827ff530a5e3cd3d85` completed successfully.

Evidence from the final implementation run:
- complete test gate: **`PASS (40 suites)`**;
- Cognitive Boost: **`PASS (23 assertions)`**;
- Cognitive Gate: **`PASS (7 assertions)`**;
- Cognitive Planner Polish: **`PASS (4 assertions)`**;
- Runtime Smoke: **`PASS (28 assertions)`**;
- Performance Runtime: **`PASS (11 assertions)`**;
- control parity + bridge integration: `PASS`;
- execution bridge security + recovery: `PASS`;
- hardening tests: `PASS`;
- source-integrity lock: `PASS`, protected `seven_ai-final.html` remained `658133` bytes with blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`;
- static audit: `PASS`, **`99553` startup bytes**, `34881` lazy workspace bytes, `3689343 / 8388608` static APK bytes, `0 warnings`;
- release verification: `PASS (2 checks, 99553 startup bytes)`;
- UI screenshot capture: `PASS (6 files)`;
- release artifact: uploaded as artifact `10351706713`, size `2062964` bytes, SHA-256 `143d15b95dd0620d5c9b86440d1141e2e0b674bc5a8be572abc48f4b74832f97`.

Wave 02 implementation delta from Wave 01 checkpoint to Pass B implementation checkpoint was 12 commits across 11 implementation/test files before documentation updates, with no protected-source modification.

### Simplifier Duel
The strongest full Cognitive Runtime 3.0 / Epistemic Fabric 3.0 architecture would add execution-class selection, richer run phases, a durable ClaimGraph, typed evidence edges and reconciliation machinery. The strongest materially simpler implementation for this wave was chosen instead: repair the existing deterministic kernel and duplicated Control Runtime semantics, add focused adversarial tests, and avoid adding a second orchestration service or a large startup-path graph runtime.

This was especially important because the final release startup layer is already `99553 / 100000` bytes, leaving only `447` bytes under the current cap. A half-implemented cancellation/reconciliation state machine would add weight and failure surface without safely closing uncertain side effects. That protocol is therefore routed to the Tool / Side-Effect / Recovery polish where it can be implemented end-to-end rather than faked here.

### Unlimited / Speed / Smoothness / Zero-Manual gates
- **Unlimited:** `PASS_FOUNDATION`. Mission work is bounded by explicit budgets and dependency state rather than arbitrary chat/message quotas; long-lived work still needs later durable orchestration polish.
- **Speed:** `PASS_FOUNDATION`. Cheap tasks remain FAST; risk escalates selectively; resource pressure caps optional breadth rather than globally enabling expensive reasoning. Release startup remains inside the unchanged `100000`-byte cap.
- **Smoothness:** `PASS_FOUNDATION`. Reduced Motion is no longer conflated with compute capacity in either primary or fallback tier selection; no polling/orchestration loop was added to the release critical path.
- **Zero-Manual:** `PASS_FOUNDATION`. Risk interpretation, authority denial, evidence independence, tier selection and mission-budget enforcement happen automatically without exposing internal architecture to ordinary users.

### Open implementation/evidence gaps
These are explicit carry-forward work, not hidden under PASS:
- full DIRECT / WORKFLOW / AGENTIC execution-class policy from Cognitive Runtime 3.0;
- explicit structured WAITING / CANCELLING / RECOVERING protocol and no-progress/repeated-plan loop budgets;
- reconciliation-before-final-cancel for dispatched or uncertain side effects;
- conflict-aware parallel scheduling for read/write sets beyond the current mission budget/dependency frontier;
- full provenance-locked ClaimGraph / SourceVersion / EvidenceUnit / typed support-refute-correction edges;
- correction, retraction, invalidation and stale-derived-state propagation;
- caller-independent verified FACT projection and TruthCapsule / ClaimEvidenceLock style durable proof objects;
- broader live-provider/tool/network failure evidence;
- project-wide p95/p99 cognitive latency and real Android device RAM/battery/thermal/frame evidence;
- CI dependency installation still reports `7` audit findings (`3 moderate`, `3 high`, `1 critical`) plus deprecated transitive packages; dependency hygiene remains a separate hardening task.

### Wave 02 conclusion
`PASS_FOUNDATION`, not `IMPLEMENTATION_SATURATED`, not `ARCHITECTURE_REPLACED`, and not `RELEASE_SATURATED`.

## Next Mega-Wave
**Mega-Wave 03 — Memory Fabric + Context Workspace Foundation**

Attack authoritative memory events/views, lineage and permission separation, retrieval/index correctness, compaction/reconstruction, pin/compress/expand/evict semantics, category budgets, stale/duplicate handling, long-lived bounded storage, speed/smoothness under large histories and Zero-Manual retrieval/context behavior. Preserve the Wave 02 authority/truth boundaries while integrating Memory ↔ Context.
