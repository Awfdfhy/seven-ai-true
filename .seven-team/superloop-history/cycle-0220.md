# Seven Superloop Cycle 220

Run: 39057408838

## Machine summary

```json
{
  "cycle": 220,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
  "domainResearchReady": 6,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D01_CHAT_CORE",
    "D02_MEMORY_CONTEXT",
    "D04_CODING_SYSTEM",
    "D05_SELF_DEVELOPMENT",
    "D06_RPG_WORLD",
    "D07_RESEARCH_WEB",
    "D08_MODEL_ROUTING",
    "D09_DEEP_THINK",
    "D12_UI_DESIGN_SYSTEM",
    "D15_PERSISTENCE_RECOVERY",
    "D16_NETWORK_RESILIENCE",
    "D17_PERFORMANCE_CONCURRENCY",
    "D18_TESTING_EVALS",
    "D19_AGENT_ORCHESTRATION",
    "D20_PRODUCT_QUALITY",
    "D21_OBSERVABILITY_WORLD_MODEL",
    "D22_PROTOCOLS_INTEROP",
    "D24_RELEASE_APK",
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "f3eb45a956556f42ae3c1db186735da32d90228d",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 220,
    "sourceSha": "f3eb45a956556f42ae3c1db186735da32d90228d",
    "proof": {
      "deterministicFinalGates": true,
      "apkBuilt": false,
      "productQualityScored": false,
      "productHardFailsKnown": false,
      "realityLabExactInstalledEvidence": false,
      "constitutionRuntimeCoverage": "PARTIAL",
      "physicalDeviceEvidence": false
    },
    "productQualityScore": "<0.0-10.0 or UNPROVEN>",
    "productHardFails": "<integer>",
    "trustStatus": "UNPROVEN_OR_BLOCKED",
    "championDecision": "HOLD_CHAMPION",
    "missingProof": [
      "apkBuilt",
      "productQualityScored",
      "productHardFailsKnown",
      "realityLabExactInstalledEvidence",
      "constitutionRuntimeCoverage",
      "physicalDeviceEvidence"
    ],
    "note": "Aggregate score never overrides Constitution/product hard fails."
  }
}
```

## Manager final review

Reading additional input from stdin...
OpenAI Codex v0.163.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a14b95-f534-7611-831c-929051c8f15a
--------
user
# Seven Superloop Manager

You are the manager above a 20-agent engineering team working on Seven AI.

Your job is NOT to produce generic advice. Inspect the actual repository state and use the agents' evidence to drive a coherent product.

Hard rules:
- The authoritative product branch is `seven-remake-v3`.
- Never downgrade architecture, tests, security or release evidence to make progress appear green.
- De-duplicate overlapping ideas and reject contradictory implementations.
- Prefer vertical user value and release-readiness over feature count.
- A feature is not accepted because an agent claims it works; require code/test/runtime evidence.
- Missing Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- Never expose or request secrets.
- Keep one owner per subsystem; prevent parallel agents from creating duplicate runtimes/stores/bridges.
- Protect cancellation, deadlines, persistence recovery, immutable public state and exact payload identity.

For planning, give every one of the 20 agents a specific assignment with:
1. objective,
2. files/surfaces to inspect,
3. expected evidence,
4. dependencies/conflicts,
5. acceptance test.

For synthesis, rank findings by user impact and root cause, then convert only the best compatible items into an execution plan.

For integration, favor the smallest coherent set of changes that passes the full suite.

For final cycle review, state what actually improved, what was rejected, what remains unproven, and the exact next-cycle priorities.


## Product Intelligence requirement

Before product/UX planning, integration, polish or final review, use:
- `.seven-team/product-intelligence/README.md`
- `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`
- relevant sections of `PRODUCT_KNOWLEDGE_BASE.md`
- `VISUAL_REFERENCE_CATALOG.json`
- `JUDGE_PROTOCOL.md`
- the visual boards under `.seven-team/product-intelligence/visual/`

Do not reward feature count. Judge whether Seven behaves and feels like one premium AI chat product.
Missing exact-build visual evidence means visual quality is UNPROVEN, not PASS.
Any rubric hard fail blocks a premium/release-quality claim regardless of aggregate score.
Reference products are principles/evidence only; never copy branding, proprietary assets or pixel geometry.


## Product Intelligence Encyclopedia v2

The shared corpus is now domain-routed. Before assigning work, inspect the specialist's `knowledgePacks` in `.seven-team/superloop/team-v1.json`.
For cross-domain changes, require the relevant adjacent packs as part of the assignment.
Use `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` to refresh current platform/product guidance when material.
Do not flood every agent with the entire corpus; route the smallest complete knowledge set for the task.


## Autonomous Product Engineering Stack

The evaluator-plane contracts under `.seven-team/autonomy/` are mandatory. In every cycle:
- Honor the Seven Constitution and proof-policy; missing evidence is UNPROVEN.
- Treat isolated agent candidates as Evolution Arena challengers, not winners.
- Use the Engineering World Model for blast-radius/test planning, never as runtime proof.
- Reality Lab evidence must be bound to the candidate source/artifact identity.
- Product-quality, security and constitution hard fails cannot be averaged away.
- Meta-Team changes may be proposed only from repeated evidence; they cannot grant privileges or weaken evaluator rules.
- Preserve failed experiments/quality debt as learning evidence instead of erasing them.


## Domain-by-Domain Internet Research Campaign

The campaign under `.seven-team/domain-campaign/` is mandatory during RESEARCH.
Every configured Seven subsystem receives its own current-state audit, broad internet research, architecture roadmap, tests, risks and first implementation slice.
Do not merge several domains into one vague plan. Preserve separate roadmaps.
A domain marked RESEARCH_INSUFFICIENT cannot be treated as research-complete; assign follow-up evidence gathering instead of inventing certainty.
External sources are starting evidence, not authority over Seven's exact runtime behavior.


## Memory Fabric v2 priority campaign

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md as the shared evidence baseline.
Assign A06/B08 as primary owners with A04 architecture review, A08 verification, B09 race/stress review and B10 product-cohesion review.
Do not call Memory complete until live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity and secret exclusion are proven.
Prefer incremental migration beside legacy memory over destructive rewrites.


## Memory Strike Team evidence discipline

For any Memory/Context task, read .seven-team/memory-v2/STRIKE_TEAM.md and IMPLEMENTATION_EVIDENCE.md in addition to the research synthesis.
Assign work by the ownership map instead of duplicating the same task across agents.
Every new memory capability must add evidence to the ledger: implementation commit, tests, benchmark result, Android exact-build state, and known unproven items.
Do not promote semantic/vector/graph complexity unless it wins a measured benchmark against the current local lexical/temporal baseline.


## Tool System v1 priority campaign

D03 Tools is now P0 after Memory v2.
Use .seven-team/tools-v1/RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md.
Primary architecture/security owners: A04+A07. Verification A08, race/replay B09, product cohesion B10, network/failure semantics B07.
The LLM is never an authorization boundary. Every execution passes deterministic schema, capability, scope, approval and replay checks.
Do not connect high-impact external tools before ReferenceMonitor, approval binding, idempotency and audit tests are green.


Cycle: 220
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "f3eb45a956556f42ae3c1db186735da32d90228d", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 220, "championSha": "f3eb45a956556f42ae3c1db186735da32d90228d", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "f3eb45a956556f42ae3c1db186735da32d90228d", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.163.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a14b92-e0e2-7810-96c3-88e503855d5a
--------
user
# Seven Superloop Manager

You are the manager above a 20-agent engineering team working on Seven AI.

Your job is NOT to produce generic advice. Inspect the actual repository state and use the agents' evidence to drive a coherent product.

Hard rules:
- The authoritative product branch is `seven-remake-v3`.
- Never downgrade architecture, tests, security or release evidence to make progress appear green.
- De-duplicate overlapping ideas and reject contradictory implementations.
- Prefer vertical user value and release-readiness over feature count.
- A feature is not accepted because an agent claims it works; require code/test/runtime evidence.
- Missing Android installed-artifact evidence remains missing until an executable device/emulator gate proves it.
- Never expose or request secrets.
- Keep one owner per subsystem; prevent parallel agents from creating duplicate runtimes/stores/bridges.
- Protect cancellation, deadlines, persistence recovery, immutable public state and exact payload identity.

For planning, give every one of the 20 agents a specific assignment with:
1. objective,
2. files/surfaces to inspect,
3. expected evidence,
4. dependencies/conflicts,
5. acceptance test.

For synthesis, rank findings by user impact and root cause, then convert only the best compatible items into an execution plan.

For integration, favor the smallest coherent set of changes that passes the full suite.

For final cycle review, state what actually improved, what was rejected, what remains unproven, and the exact next-cycle priorities.


## Product Intelligence requirement

Before product/UX planning, integration, polish or final review, use:
- `.seven-team/product-intelligence/README.md`
- `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`
- relevant sections of `PRODUCT_KNOWLEDGE_BASE.md`
- `VISUAL_REFERENCE_CATALOG.json`
- `JUDGE_PROTOCOL.md`
- the visual boards under `.seven-team/product-intelligence/visual/`

Do not reward feature count. Judge whether Seven behaves and feels like one premium AI chat product.
Missing exact-build visual evidence means visual quality is UNPROVEN, not PASS.
Any rubric hard fail blocks a premium/release-quality claim regardless of aggregate score.
Reference products are principles/evidence only; never copy branding, proprietary assets or pixel geometry.


## Product Intelligence Encyclopedia v2

The shared corpus is now domain-routed. Before assigning work, inspect the specialist's `knowledgePacks` in `.seven-team/superloop/team-v1.json`.
For cross-domain changes, require the relevant adjacent packs as part of the assignment.
Use `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json` to refresh current platform/product guidance when material.
Do not flood every agent with the entire corpus; route the smallest complete knowledge set for the task.


## Autonomous Product Engineering Stack

The evaluator-plane contracts under `.seven-team/autonomy/` are mandatory. In every cycle:
- Honor the Seven Constitution and proof-policy; missing evidence is UNPROVEN.
- Treat isolated agent candidates as Evolution Arena challengers, not winners.
- Use the Engineering World Model for blast-radius/test planning, never as runtime proof.
- Reality Lab evidence must be bound to the candidate source/artifact identity.
- Product-quality, security and constitution hard fails cannot be averaged away.
- Meta-Team changes may be proposed only from repeated evidence; they cannot grant privileges or weaken evaluator rules.
- Preserve failed experiments/quality debt as learning evidence instead of erasing them.


## Domain-by-Domain Internet Research Campaign

The campaign under `.seven-team/domain-campaign/` is mandatory during RESEARCH.
Every configured Seven subsystem receives its own current-state audit, broad internet research, architecture roadmap, tests, risks and first implementation slice.
Do not merge several domains into one vague plan. Preserve separate roadmaps.
A domain marked RESEARCH_INSUFFICIENT cannot be treated as research-complete; assign follow-up evidence gathering instead of inventing certainty.
External sources are starting evidence, not authority over Seven's exact runtime behavior.


## Memory Fabric v2 priority campaign

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md as the shared evidence baseline.
Assign A06/B08 as primary owners with A04 architecture review, A08 verification, B09 race/stress review and

...[clipped by superloop]...

**UNPROVEN** | Locate `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `JUDGE_PROTOCOL.md`, `VISUAL_REFERENCE_CATALOG.json`, and visual boards under `.seven-team/product-intelligence/visual/`. If absent, define minimal rubric and treat visual dimensions as UNPROVEN. |
| **Visual/product quality** | **UNPROVEN** | Exact-build runtime evidence (browser/preview) for core chat flow (send/cancel/regen, theme, RTL if Arabic, reduced motion, 320px+ mobile, 44px touch targets) with screenshots tied to commit SHA/build hash; compare to references if available. |
| **TypeScript/type-surface health** | **UNPROVEN** | Reconcile A10 claim (~299 TS errors) vs milestone PASS. Run `npx tsc --noEmit` in `remake/` (or root per scripts) and capture full log + failing file list. |
| **Test surface execution** | **UNPROVEN** | Reconcile "190/209+ tests PASS" vs "Test discovery empty (0 files)". Run `npx vitest --run` and capture discovery, counts, failures, and slowest tests. |
| **Canon/RPG integrity** | **UNPROVEN** | Identify canon module path and owner; verify summary fingerprint includes canon head; test required-block preservation, atomicity, cancel safety, corruption detection (runtime failure paths). |
| **Android installed-artifact behavior** | **UNPROVEN** | Only when user-facing product delta exists: build/install on device/emulator; prove launch, chat send/cancel, attachments/SAF, bridge round-trip with correct requestId correlation and cancellation semantics. (Currently blocked by policy.) |
| **Memory v2 end-to-end** | **UNPROVEN** | Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion with ledger entries per `.seven-team/memory-v2/STRIKE_TEAM.md` and `IMPLEMENTATION_EVIDENCE.md`. |
| **Tools v1 gates** | **UNPROVEN** | ReferenceMonitor, approval binding, idempotency, audit tests green before connecting high-impact external tools; LLM never authorization boundary. |
| **Evolution Arena proof** | **UNPROVEN** | Promotion remains blocked pending comparative proof (not typecheck alone). |

---

## Exact next-cycle priorities (ranked by user impact + release-blocker risk)

### P0 — Evidence recovery (foundation)
1. **Locate product-intelligence corpus** (Owner: Manager + A10)  
   - **Files/surfaces:** `.seven-team/product-intelligence/`, `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json`, `.seven-team/product-intelligence/visual/`  
   - **Evidence:** paths found (or absence documented), rubric contents, route smallest complete knowledge set to relevant agents  
   - **Acceptance:** Corpus located or minimal rubric defined with explicit UNPROVEN for visual dimensions.

2. **Reconcile typecheck + tests** (Owners: A04 + A08)  
   - **Surfaces:** `remake/` (per scripts)  
   - **Commands:** `npx tsc --noEmit`, `npx vitest --run`  
   - **Evidence:** full logs, failing files, discovery count, pass/fail totals  
   - **Acceptance:** Exact reconciliation explaining delta vs prior claims; no PASS without captured outputs.

3. **Canon/RPG ownership + invariants** (Owners: B05 + A08)  
   - **Surfaces:** canon module (locate), summary/fingerprint code, required-block logic, atomicity/cancel paths  
   - **Evidence:** unit/integration tests covering required-block preservation, atomicity, cancel safety, corruption detection, fingerprint includes canon head  
   - **Acceptance:** Owner assigned, invariants verified via runtime failure exercises.

### P1 — Product cohesion + visual proof
4. **Visual quality proof** (Owners: A01 + B10)  
   - **Surfaces:** core chat UI, theme/RTL/reduced motion, responsive/mobile  
   - **Evidence:** build hash + commit SHA, exact-build runtime run, screenshots for specified states, comparison to visual references if available  
   - **Acceptance:** Visual dimensions moved from UNPROVEN to documented PASS/FAIL with artifacts.

5. **End-to-end chat regression vertical** (Owners: B01 + A08 + B09)  
   - **Surfaces:** send/stream/cancel/regen, persistence/restore, TaskManager invariants  
   - **Evidence:** deterministic test or scripted run with logs proving no partial assistant commit on cancel, correct save/restore  
   - **Acceptance:** Vertical passes against stated invariants; failures logged as debt if any.

### P2 — Release readiness gates
6. **Android installed-artifact proof** (Owners: A02 + A07) — *only when user-facing product delta exists*  
   - **Surfaces:** Android build/install/runtime, SAF/attachments, bridge  
   - **Evidence:** device ID/emulator, install logs, runtime traces showing requestId correlation and cancellation semantics  
   - **Acceptance:** Keep `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` until delta + proof. Do not claim device PASS otherwise.

7. **Memory v2 live wiring verification** (Owners: A06 + B08 + A08 + B09 + B10)  
   - **Surfaces:** live chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion  
   - **Evidence:** ledger entries per STRIKE_TEAM/IMPLEMENTATION_EVIDENCE, tests, benchmarks vs local lexical/temporal baseline  
   - **Acceptance:** All checklist items proven; no premature promotion of semantic/vector/graph complexity.

8. **Tools v1 pre-connection gates** (Owners: A04 + A07 + B07 + B09 + B10)  
   - **Surfaces:** ReferenceMonitor, approval binding, idempotency, audit  
   - **Evidence:** gate checklist green, LLM non-authoritative confirmed  
   - **Acceptance:** All gates green before high-impact external tools connected.

---

**Manager Recommendation:** Execute P0 first to resolve contradictory evidence and recover corpus/rubric. Do not merge any "polish" claiming premium/RC. Treat milestone labels as hypotheses. Require evidence before integration. De-duplicate, reject contradictions, preserve architecture/security/tests, and protect the stated invariants.

**End State:** Synthesis complete. Evidence boundaries preserved. Claims limited to what is verifiably present.
tokens used
12,541
**CYCLE 220 — FINAL MANAGER REVIEW**

**Head:** `f3eb45a956556f42ae3c1db186735da32d90228d`  
**Authoritative Branch:** `seven-remake-v3`  
**Stage:** `manager-final-review`  
**Verdict:** `CHANGES_REQUIRED` — Not RC, not Premium Candidate  
**Overall Status:** `UNPROVEN`  
**Polish Accepted:** `False`  
**APK Stage:** `BLOCKED_NO_PRODUCT_DELTA` | `SELF_HEAL_APK=EXHAUSTED`  

---

## What actually improved

- **Discipline over promotion.** The Evolution Arena correctly blocked promotion (`BLOCKED_PENDING_COMPARATIVE_PROOF`), refusing to crown a champion from typecheck alone.
- **Release discipline.** APK publication was correctly refused due to no user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public`. `SELF_HEAL_APK=EXHAUSTED` was honored rather than fabricating a release artifact.
- **Integration discipline.** Feature integration and fix integration both returned `accepted: []` and rejected all 20 agents (`"no candidate"`). Progress was not inferred from `fullGatesPass: true` in a null-integration state.
- **Campaign clarity.** Memory v2 and Tools v1 were correctly identified as P0 with explicit ownership maps, and the need for domain-routed evidence (Product Intelligence Encyclopedia v2) was preserved.
- **Evidence boundaries.** Hard fails (product intelligence, visual quality, Android installed-artifact behavior) were explicitly called out as non-averagable, and claims were limited to verifiably present state.

---

## What was rejected

- **Premature quality claims.** Any assertion of "Premium Candidate" or "RC" based on aggregate score or milestone labels ("COMPLETE"). These are claims requiring verification, not proof.
- **Unsubstantiated agent promotion.** All 20 agents were rejected due to lack of code/test/runtime evidence. No challenger wins from isolated signals.
- **Artifact-as-proof abuse.** Reusing an APK as device proof while `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` was rejected.
- **Contradictory evidence normalization.** Conflicting signals (e.g. "strict typecheck PASS" vs ~299 TypeScript errors reported by A10; "190/209+ tests PASS" vs "Test discovery empty (0 files)") were not reconciled into a PASS — they remain contradictory and **UNPROVEN**.
- **Complexity without measurement.** Memory/Tools complexity expansion without meeting the required gates (benchmarks vs local baseline, ReferenceMonitor/approval binding/idempotency/audit, live wiring, etc.) was rejected.
- **Downgrades.** No erosion of architecture, tests, security, constitution, cancellation/deadlines/persistence recovery/immutable public state/exact payload identity to make progress appear green.

---

## What remains unproven

| Area | Status | Required Evidence |
|---|---|---|
| **Product intelligence corpus** | **UNPROVEN** | Locate `.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json`, `JUDGE_PROTOCOL.md`, `VISUAL_REFERENCE_CATALOG.json`, and visual boards under `.seven-team/product-intelligence/visual/`. If absent, define minimal rubric and treat visual dimensions as UNPROVEN. |
| **Visual/product quality** | **UNPROVEN** | Exact-build runtime evidence (browser/preview) for core chat flow (send/cancel/regen, theme, RTL if Arabic, reduced motion, 320px+ mobile, 44px touch targets) with screenshots tied to commit SHA/build hash; compare to references if available. |
| **TypeScript/type-surface health** | **UNPROVEN** | Reconcile A10 claim (~299 TS errors) vs milestone PASS. Run `npx tsc --noEmit` in `remake/` (or root per scripts) and capture full log + failing file list. |
| **Test surface execution** | **UNPROVEN** | Reconcile "190/209+ tests PASS" vs "Test discovery empty (0 files)". Run `npx vitest --run` and capture discovery, counts, failures, and slowest tests. |
| **Canon/RPG integrity** | **UNPROVEN** | Identify canon module path and owner; verify summary fingerprint includes canon head; test required-block preservation, atomicity, cancel safety, corruption detection (runtime failure paths). |
| **Android installed-artifact behavior** | **UNPROVEN** | Only when user-facing product delta exists: build/install on device/emulator; prove launch, chat send/cancel, attachments/SAF, bridge round-trip with correct requestId correlation and cancellation semantics. (Currently blocked by policy.) |
| **Memory v2 end-to-end** | **UNPROVEN** | Live-chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion with ledger entries per `.seven-team/memory-v2/STRIKE_TEAM.md` and `IMPLEMENTATION_EVIDENCE.md`. |
| **Tools v1 gates** | **UNPROVEN** | ReferenceMonitor, approval binding, idempotency, audit tests green before connecting high-impact external tools; LLM never authorization boundary. |
| **Evolution Arena proof** | **UNPROVEN** | Promotion remains blocked pending comparative proof (not typecheck alone). |

---

## Exact next-cycle priorities (ranked by user impact + release-blocker risk)

### P0 — Evidence recovery (foundation)
1. **Locate product-intelligence corpus** (Owner: Manager + A10)  
   - **Files/surfaces:** `.seven-team/product-intelligence/`, `PRODUCT_KNOWLEDGE_BASE.md`, `VISUAL_REFERENCE_CATALOG.json`, `JUDGE_PROTOCOL.md`, `.seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json`, `.seven-team/product-intelligence/visual/`  
   - **Evidence:** paths found (or absence documented), rubric contents, route smallest complete knowledge set to relevant agents  
   - **Acceptance:** Corpus located or minimal rubric defined with explicit UNPROVEN for visual dimensions.

2. **Reconcile typecheck + tests** (Owners: A04 + A08)  
   - **Surfaces:** `remake/` (per scripts)  
   - **Commands:** `npx tsc --noEmit`, `npx vitest --run`  
   - **Evidence:** full logs, failing files, discovery count, pass/fail totals  
   - **Acceptance:** Exact reconciliation explaining delta vs prior claims; no PASS without captured outputs.

3. **Canon/RPG ownership + invariants** (Owners: B05 + A08)  
   - **Surfaces:** canon module (locate), summary/fingerprint code, required-block logic, atomicity/cancel paths  
   - **Evidence:** unit/integration tests covering required-block preservation, atomicity, cancel safety, corruption detection, fingerprint includes canon head  
   - **Acceptance:** Owner assigned, invariants verified via runtime failure exercises.

### P1 — Product cohesion + visual proof
4. **Visual quality proof** (Owners: A01 + B10)  
   - **Surfaces:** core chat UI, theme/RTL/reduced motion, responsive/mobile  
   - **Evidence:** build hash + commit SHA, exact-build runtime run, screenshots for specified states, comparison to visual references if available  
   - **Acceptance:** Visual dimensions moved from UNPROVEN to documented PASS/FAIL with artifacts.

5. **End-to-end chat regression vertical** (Owners: B01 + A08 + B09)  
   - **Surfaces:** send/stream/cancel/regen, persistence/restore, TaskManager invariants  
   - **Evidence:** deterministic test or scripted run with logs proving no partial assistant commit on cancel, correct save/restore  
   - **Acceptance:** Vertical passes against stated invariants; failures logged as debt if any.

### P2 — Release readiness gates
6. **Android installed-artifact proof** (Owners: A02 + A07) — *only when user-facing product delta exists*  
   - **Surfaces:** Android build/install/runtime, SAF/attachments, bridge  
   - **Evidence:** device ID/emulator, install logs, runtime traces showing requestId correlation and cancellation semantics  
   - **Acceptance:** Keep `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` until delta + proof. Do not claim device PASS otherwise.

7. **Memory v2 live wiring verification** (Owners: A06 + B08 + A08 + B09 + B10)  
   - **Surfaces:** live chat wiring, temporal correction, provenance, abstention, restart persistence, Arabic parity, secret exclusion  
   - **Evidence:** ledger entries per STRIKE_TEAM/IMPLEMENTATION_EVIDENCE, tests, benchmarks vs local lexical/temporal baseline  
   - **Acceptance:** All checklist items proven; no premature promotion of semantic/vector/graph complexity.

8. **Tools v1 pre-connection gates** (Owners: A04 + A07 + B07 + B09 + B10)  
   - **Surfaces:** ReferenceMonitor, approval binding, idempotency, audit  
   - **Evidence:** gate checklist green, LLM non-authoritative confirmed  
   - **Acceptance:** All gates green before high-impact external tools connected.

---

**Manager Recommendation:** Execute P0 first to resolve contradictory evidence and recover corpus/rubric. Do not merge any "polish" claiming premium/RC. Treat milestone labels as hypotheses. Require evidence before integration. De-duplicate, reject contradictions, preserve architecture/security/tests, and protect the stated invariants.

**End State:** Synthesis complete. Evidence boundaries preserved. Claims limited to what is verifiably present.
