# Seven Superloop Cycle 160

Run: 38357088730

## Machine summary

```json
{
  "cycle": 160,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
  "domainResearchReady": 0,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D01_CHAT_CORE",
    "D02_MEMORY_CONTEXT",
    "D03_TOOLS_CAPABILITY",
    "D04_CODING_SYSTEM",
    "D05_SELF_DEVELOPMENT",
    "D06_RPG_WORLD",
    "D07_RESEARCH_WEB",
    "D08_MODEL_ROUTING",
    "D09_DEEP_THINK",
    "D10_FILES_MULTIMODAL",
    "D11_ANDROID_NATIVE",
    "D12_UI_DESIGN_SYSTEM",
    "D13_ARABIC_RTL_A11Y",
    "D14_SECURITY_PRIVACY",
    "D15_PERSISTENCE_RECOVERY",
    "D16_NETWORK_RESILIENCE",
    "D17_PERFORMANCE_CONCURRENCY",
    "D18_TESTING_EVALS",
    "D19_AGENT_ORCHESTRATION",
    "D20_PRODUCT_QUALITY",
    "D21_OBSERVABILITY_WORLD_MODEL",
    "D22_PROTOCOLS_INTEROP",
    "D23_IMPORT_EXPORT_BACKUP",
    "D24_RELEASE_APK",
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "7e557b51f9408014afc890470af8929b49e7d074",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 160,
    "sourceSha": "7e557b51f9408014afc890470af8929b49e7d074",
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
OpenAI Codex v0.162.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a13437-0174-79e0-9943-22a70ca0dba4
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


Cycle: 160
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "7e557b51f9408014afc890470af8929b49e7d074", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 160, "championSha": "7e557b51f9408014afc890470af8929b49e7d074", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "7e557b51f9408014afc890470af8929b49e7d074", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.162.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a13434-c5da-7322-8108-223a73a5b75c
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

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHE

...[clipped by superloop]...

mented)** | The independent product-quality agent produced a complete WAVE01 specification for a deterministic UI evaluation harness (`eval/ui/*`: server, page-fixture, audits, unit tests, 4 golden-screen scenarios, manifest, CI wiring). This is a *design artifact only* — zero production code changed. |
| **Architecture discipline** | **Held** | No destructive rewrites, no duplicate runtimes/stores/bridges introduced. Constitution and proof-policy honored: missing evidence remains UNPROVEN. |
| **APK gate integrity** | **Enforced** | `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` correctly refused to publish an unchanged payload. `SELF_HEAL_APK=EXHAUSTED` confirms the gate cannot be bypassed. |

**Net user-visible improvement: 0.** The repository HEAD (`7e557b51f9408014afc890470af8929b49e7d074`) is identical to cycle-start for all product surfaces (`remake/src`, `remake/index.html`, `remake/public`, Android launcher).

---

### What the Team Rejected

| Category | Count | Detail |
|----------|-------|--------|
| **Feature candidates** | 20/20 rejected | Every agent (A01–A10, B01–B10) submitted "no candidate" — no feature integration occurred. |
| **Fix candidates** | 20/20 rejected | Same 20 agents — no fix integration occurred. |
| **Polish** | Rejected | `polishAccepted: false` — no UX polish delta met the premium bar. |
| **Evolution Arena promotion** | Blocked | `BLOCKED_PENDING_COMPARATIVE_PROOF` — no challenger exists; typecheck-only wins are explicitly forbidden. |

**Rejection rationale:** No agent produced runnable, tested, device-verified code that advances the product. Plans and designs are not evidence.

---

### What Remains Unproven (Hard Gaps)

| Gap | Why It Blocks Release | Required Evidence |
|-----|----------------------|-------------------|
| **Memory Fabric v2 end-to-end** | P0 campaign; live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion all missing | A06/B08 implementation commits + benchmarks + Android exact-build + strike-team ledger entries |
| **Tool System v1 (D03)** | P0 after Memory; ReferenceMonitor, approval binding, idempotency, audit tests not green | A04+A07 architecture/security + A08 verification + B09 race/replay + B10 cohesion evidence |
| **UI evaluation harness (WAVE01)** | Design complete, implementation zero | `eval/ui/` code merged, 4 golden scenarios passing in CI, manifest uploaded, reviewer baseline sign-off |
| **Android runtime parity** | No installed-artifact evidence since cycle 150+ | Executable emulator/device gate with current `seven-remake-v3` payload |
| **Arabic RTL parity** | Required for premium claim; untested | Visual + functional RTL audit at 390×844 + font-scale 150% |
| **Font-scale / landscape regression suite** | Specified in WAVE01 §6e; not built | Playwright matrix + Android `font_scale 1.30` runs with deterministic captures |
| **Nav-count drift / reachability** | 5 destinations claimed; 6th/hidden unproven | Census test asserting exactly 5 activatable, ≤2 taps each, correct workspace state |

**Any single hard fail above blocks a premium/release-quality claim.** Aggregate scores are irrelevant per the rubric.

---

### Exact Next-Cycle Priorities (Cycle 161)

| Priority | Owner | Assignment (objective / files / evidence / deps / acceptance) |
|----------|-------|---------------------------------------------------------------|
| **P0-1: Memory Fabric v2 — Live-chat wiring + restart persistence** | **A06 (lead), B08 (co-lead)** | **Obj:** Wire Memory v2 into live chat path with restart-surviving persistence.<br>**Files:** `.seven-team/memory-v2/EXECUTION_PLAN.md` slices 1–3; `packages/memory/*`, `packages/chat/*`.<br>**Evidence:** Implementation commit, unit/integration tests, benchmark vs. lexical baseline, Android exact-build log, strike-team ledger update.<br>**Deps:** A04 arch review (before merge), A08 verification tests, B09 race/stress, B10 cohesion.<br>**Acceptance:** `npm test --workspace=packages/memory` green; `adb shell am start` shows restored context after process death; Arabic parity verified. |
| **P0-2: Tool System v1 — ReferenceMonitor + approval binding** | **A04 (arch), A07 (security)** | **Obj:** Deterministic schema/capability/scope/approval/replay checks for every tool execution.<br>**Files:** `.seven-team/tools-v1/EXECUTION_PLAN.md` slices 1–2; `packages/tools/*`.<br>**Evidence:** Implementation commit, contract tests, fuzz/race benchmarks, audit log sample.<br>**Deps:** A08 verification, B09 replay, B10 cohesion, B07 network/failure semantics.<br>**Acceptance:** No tool executes without ReferenceMonitor verdict; idempotency keys enforced; audit log tamper-evident. |
| **P1-1: UI Evaluation Harness — WAVE01 PR 1 (4 golden scenarios)** | **B10 (product cohesion), A08 (verification)** | **Obj:** Land the *exact* WAVE01 PR 1 scope (no production source changes).<br>**Files:** Create `eval/ui/{server.cjs,page-fixture.cjs,audits.cjs,harness.test.cjs,golden-screens.test.cjs}`; wire into `all.cjs` + `package.json` + `seven-tests.yml`.<br>**Evidence:** `dist/ui-evidence-manifest.json` with 4 verified scenarios + sha256 artifacts; CI upload green.<br>**Deps:** None (isolated test infra).<br>**Acceptance:** `npm run test:ui` passes in OBSERVE mode; manifest structure matches spec §7; zero changes to `seven_ai-final.html`, `release/*`, `apk/*`. |
| **P1-2: Android exact-build gate restoration** | **B07 (network/failure), B09 (race/stress)** | **Obj:** Re-establish executable device/emulator gate for current HEAD.<br>**Files:** `.github/workflows/android-apk.yml`, `apk/launcher/*`.<br>**Evidence:** APK built, installed, launched, screenshot captured on emulator (API 34), `seven-remake-v3` payload hash matches.<br>**Deps:** P0-1/P0-2 must not break launcher.<br>**Acceptance:** `APK_STAGE=PASSED` with artifact hash in CI log. |
| **P2: Arabic RTL + font-scale regression matrix** | **B10 (cohesion), A08 (verification)** | **Obj:** Close the two explicit WAVE01 §6d/§6e gaps.<br>**Files:** Extend `eval/ui/golden-screens.test.cjs` (PR 2), add Android `font_scale 1.30` matrix.<br>**Evidence:** 17-scenario manifest (9 new + 4 PR1 + 4 RTL/font-scale) with MATCH/FAIL per cell; reviewer baseline sign-off.<br>**Deps:** P1-1 merged.<br>**Acceptance:** `ENFORCE` mode green; no `nav-count-drift`, no `horizontal-overflow`, all touch targets ≥44px, zero untranslated controls. |

---

### Manager Directive for Cycle 161

1. **No new feature agents** until P0-1 and P0-2 have *implementation commits with evidence* in the ledger.
2. **All 20 agents** re-assigned to the five priorities above — no parallel duplicate work.
3. **Weekly evidence checkpoints** (not status updates): each priority must append to its strike-team ledger (Memory/Tools/UI/Android/RTL) with commit SHA, test output, benchmark, or device log.
4. **Cycle 161 review gate:** If P0-1 and P0-2 lack ledger entries with passing benchmarks, the cycle ends with `BLOCKED_PENDING_EVIDENCE` — no exceptions.

---

**Bottom line:** Cycle 160 produced a *rigorous evaluation design* (WAVE01) but *zero product delta*. The next cycle must convert design into verified implementation on the two P0 campaigns (Memory, Tools) and land the UI harness (P1-1) to unblock visual/RTL/Android evidence. No premium claim is possible until the hard gaps close.
tokens used
13,861
**Cycle 160 — Final Manager Review**

---

### What Actually Improved

| Area | Status | Evidence |
|------|--------|----------|
| **Product-quality evaluation design** | **Planned (not implemented)** | The independent product-quality agent produced a complete WAVE01 specification for a deterministic UI evaluation harness (`eval/ui/*`: server, page-fixture, audits, unit tests, 4 golden-screen scenarios, manifest, CI wiring). This is a *design artifact only* — zero production code changed. |
| **Architecture discipline** | **Held** | No destructive rewrites, no duplicate runtimes/stores/bridges introduced. Constitution and proof-policy honored: missing evidence remains UNPROVEN. |
| **APK gate integrity** | **Enforced** | `APK_STAGE=BLOCKED_NO_PRODUCT_DELTA` correctly refused to publish an unchanged payload. `SELF_HEAL_APK=EXHAUSTED` confirms the gate cannot be bypassed. |

**Net user-visible improvement: 0.** The repository HEAD (`7e557b51f9408014afc890470af8929b49e7d074`) is identical to cycle-start for all product surfaces (`remake/src`, `remake/index.html`, `remake/public`, Android launcher).

---

### What the Team Rejected

| Category | Count | Detail |
|----------|-------|--------|
| **Feature candidates** | 20/20 rejected | Every agent (A01–A10, B01–B10) submitted "no candidate" — no feature integration occurred. |
| **Fix candidates** | 20/20 rejected | Same 20 agents — no fix integration occurred. |
| **Polish** | Rejected | `polishAccepted: false` — no UX polish delta met the premium bar. |
| **Evolution Arena promotion** | Blocked | `BLOCKED_PENDING_COMPARATIVE_PROOF` — no challenger exists; typecheck-only wins are explicitly forbidden. |

**Rejection rationale:** No agent produced runnable, tested, device-verified code that advances the product. Plans and designs are not evidence.

---

### What Remains Unproven (Hard Gaps)

| Gap | Why It Blocks Release | Required Evidence |
|-----|----------------------|-------------------|
| **Memory Fabric v2 end-to-end** | P0 campaign; live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion all missing | A06/B08 implementation commits + benchmarks + Android exact-build + strike-team ledger entries |
| **Tool System v1 (D03)** | P0 after Memory; ReferenceMonitor, approval binding, idempotency, audit tests not green | A04+A07 architecture/security + A08 verification + B09 race/replay + B10 cohesion evidence |
| **UI evaluation harness (WAVE01)** | Design complete, implementation zero | `eval/ui/` code merged, 4 golden scenarios passing in CI, manifest uploaded, reviewer baseline sign-off |
| **Android runtime parity** | No installed-artifact evidence since cycle 150+ | Executable emulator/device gate with current `seven-remake-v3` payload |
| **Arabic RTL parity** | Required for premium claim; untested | Visual + functional RTL audit at 390×844 + font-scale 150% |
| **Font-scale / landscape regression suite** | Specified in WAVE01 §6e; not built | Playwright matrix + Android `font_scale 1.30` runs with deterministic captures |
| **Nav-count drift / reachability** | 5 destinations claimed; 6th/hidden unproven | Census test asserting exactly 5 activatable, ≤2 taps each, correct workspace state |

**Any single hard fail above blocks a premium/release-quality claim.** Aggregate scores are irrelevant per the rubric.

---

### Exact Next-Cycle Priorities (Cycle 161)

| Priority | Owner | Assignment (objective / files / evidence / deps / acceptance) |
|----------|-------|---------------------------------------------------------------|
| **P0-1: Memory Fabric v2 — Live-chat wiring + restart persistence** | **A06 (lead), B08 (co-lead)** | **Obj:** Wire Memory v2 into live chat path with restart-surviving persistence.<br>**Files:** `.seven-team/memory-v2/EXECUTION_PLAN.md` slices 1–3; `packages/memory/*`, `packages/chat/*`.<br>**Evidence:** Implementation commit, unit/integration tests, benchmark vs. lexical baseline, Android exact-build log, strike-team ledger update.<br>**Deps:** A04 arch review (before merge), A08 verification tests, B09 race/stress, B10 cohesion.<br>**Acceptance:** `npm test --workspace=packages/memory` green; `adb shell am start` shows restored context after process death; Arabic parity verified. |
| **P0-2: Tool System v1 — ReferenceMonitor + approval binding** | **A04 (arch), A07 (security)** | **Obj:** Deterministic schema/capability/scope/approval/replay checks for every tool execution.<br>**Files:** `.seven-team/tools-v1/EXECUTION_PLAN.md` slices 1–2; `packages/tools/*`.<br>**Evidence:** Implementation commit, contract tests, fuzz/race benchmarks, audit log sample.<br>**Deps:** A08 verification, B09 replay, B10 cohesion, B07 network/failure semantics.<br>**Acceptance:** No tool executes without ReferenceMonitor verdict; idempotency keys enforced; audit log tamper-evident. |
| **P1-1: UI Evaluation Harness — WAVE01 PR 1 (4 golden scenarios)** | **B10 (product cohesion), A08 (verification)** | **Obj:** Land the *exact* WAVE01 PR 1 scope (no production source changes).<br>**Files:** Create `eval/ui/{server.cjs,page-fixture.cjs,audits.cjs,harness.test.cjs,golden-screens.test.cjs}`; wire into `all.cjs` + `package.json` + `seven-tests.yml`.<br>**Evidence:** `dist/ui-evidence-manifest.json` with 4 verified scenarios + sha256 artifacts; CI upload green.<br>**Deps:** None (isolated test infra).<br>**Acceptance:** `npm run test:ui` passes in OBSERVE mode; manifest structure matches spec §7; zero changes to `seven_ai-final.html`, `release/*`, `apk/*`. |
| **P1-2: Android exact-build gate restoration** | **B07 (network/failure), B09 (race/stress)** | **Obj:** Re-establish executable device/emulator gate for current HEAD.<br>**Files:** `.github/workflows/android-apk.yml`, `apk/launcher/*`.<br>**Evidence:** APK built, installed, launched, screenshot captured on emulator (API 34), `seven-remake-v3` payload hash matches.<br>**Deps:** P0-1/P0-2 must not break launcher.<br>**Acceptance:** `APK_STAGE=PASSED` with artifact hash in CI log. |
| **P2: Arabic RTL + font-scale regression matrix** | **B10 (cohesion), A08 (verification)** | **Obj:** Close the two explicit WAVE01 §6d/§6e gaps.<br>**Files:** Extend `eval/ui/golden-screens.test.cjs` (PR 2), add Android `font_scale 1.30` matrix.<br>**Evidence:** 17-scenario manifest (9 new + 4 PR1 + 4 RTL/font-scale) with MATCH/FAIL per cell; reviewer baseline sign-off.<br>**Deps:** P1-1 merged.<br>**Acceptance:** `ENFORCE` mode green; no `nav-count-drift`, no `horizontal-overflow`, all touch targets ≥44px, zero untranslated controls. |

---

### Manager Directive for Cycle 161

1. **No new feature agents** until P0-1 and P0-2 have *implementation commits with evidence* in the ledger.
2. **All 20 agents** re-assigned to the five priorities above — no parallel duplicate work.
3. **Weekly evidence checkpoints** (not status updates): each priority must append to its strike-team ledger (Memory/Tools/UI/Android/RTL) with commit SHA, test output, benchmark, or device log.
4. **Cycle 161 review gate:** If P0-1 and P0-2 lack ledger entries with passing benchmarks, the cycle ends with `BLOCKED_PENDING_EVIDENCE` — no exceptions.

---

**Bottom line:** Cycle 160 produced a *rigorous evaluation design* (WAVE01) but *zero product delta*. The next cycle must convert design into verified implementation on the two P0 campaigns (Memory, Tools) and land the UI harness (P1-1) to unblock visual/RTL/Android evidence. No premium claim is possible until the hard gaps close.
