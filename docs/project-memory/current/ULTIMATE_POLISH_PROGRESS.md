# Seven AI — Ultimate Polish Progress

> Durable execution ledger for the maximum-density Ultimate Polish campaign. This file records evidence, not aspirations.

## Campaign
- Branch: `ultimate-polish-v1`
- Density target: `~20–25` Mega-Waves
- Current counter: **`1 / ~20–25`**
- Protected source: `seven_ai-final.html`
- Protected source Git blob: `3e8dfa8e7da7124e16504140eb9631c10cabf053`

## Mega-Wave 01 — Speed + Smoothness Foundation
**Status:** `PASS_FOUNDATION`  
**Scope truth:** foundational runtime/verification pass only. This is not project-wide Performance, Android or Release saturation.

### Implementation truth reconstructed
The release already had `performance-runtime.js`, `control-runtime.js`, resource tiers, long-task observation, frame/idle scheduling, release build injection and browser/static gates. The gap was not absence of a performance system; it was weak dedicated verification and a policy bug that coupled Reduced Motion accessibility preference to compute tier selection.

### Material changes
1. **Separated accessibility preference from compute capacity.** Reduced Motion remains exposed as an authoritative presentation signal but no longer forces a capable device into the `lite` compute/performance tier.
2. **Added explicit tier recommendation from resource signals.** Critical memory/thermal/battery pressure and constrained hardware select `lite`; recent long tasks prevent optimistic `full` selection.
3. **Added conservative recovery/hysteresis.** Downgrades occur immediately under pressure, while upgrades are guarded to reduce tier thrashing after recent long tasks/pressure.
4. **Visibility-aware degradation/recovery.** Hidden pages can reduce work aggressively; returning visible re-evaluates the tier.
5. **Preserved lightweight scheduling primitives.** Keyed frame batching, cancellable idle work, cooperative yielding and bounded timing marks remain available.
6. **Added a dedicated Performance Runtime test suite** with 11 assertions.
7. **Removed the manual release-test registry.** `all.cjs` now discovers every `release/*.test.cjs` automatically, reducing the chance that future verification suites exist but are silently omitted from CI.

### Verification evidence
GitHub Actions run `34846916622` at commit `64951b3539423f0ac3b72b77d2c8e0232b573ec1` completed successfully.

Evidence from the run:
- Performance Runtime: `PASS (11 assertions)`.
- Complete test gate: `PASS (39 suites)`.
- Runtime smoke: `PASS (28 assertions)`.
- Source integrity lock: `PASS`, protected source remained `658133` bytes with blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.
- Static audit: `PASS`, `99529` startup bytes, `34881` lazy workspace bytes, `0 warnings`.
- Release verification: `PASS`.
- UI screenshot capture: `PASS (6 files)`.
- Release artifact upload: `PASS`.

### Simplifier Duel
The stronger design was kept compact instead of introducing a separate performance service, worker or polling loop. The release runtime grew only enough to add explicit adaptive behavior while remaining beneath the existing startup budget. Automatic test discovery replaced a longer hand-maintained registry.

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

## Next Mega-Wave
**Mega-Wave 02 — Cognitive Runtime + Truth/Epistemic Foundation**

Attack Task Contract, execution graph/state machine, planning/orchestration, BLOCKED/FAIL/INCONCLUSIVE semantics, cancellation/recovery boundaries, truth authority/lineage and their interaction with adaptive resource budgets. Preserve large coherent patch + final verification discipline.
