# Seven Superloop Cycle 124

Run: 38095764102

## Machine summary

```json
{
  "cycle": 124,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 1,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
  "domainResearchReady": 3,
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
    "D10_FILES_MULTIMODAL",
    "D11_ANDROID_NATIVE",
    "D12_UI_DESIGN_SYSTEM",
    "D13_ARABIC_RTL_A11Y",
    "D14_SECURITY_PRIVACY",
    "D15_PERSISTENCE_RECOVERY",
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
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "6e17a6b9991bcfb311f7059b407cc30286ac8d40",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 124,
    "sourceSha": "6e17a6b9991bcfb311f7059b407cc30286ac8d40",
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
session id: 01a128a5-cd41-7be2-8be3-8a93a49de403
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


Cycle: 124
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6e17a6b9991bcfb311f7059b407cc30286ac8d40", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 124, "championSha": "6e17a6b9991bcfb311f7059b407cc30286ac8d40", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: conflict", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6e17a6b9991bcfb311f7059b407cc30286ac8d40", "fullGatesPass": true}
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
session id: 01a128a2-f4f5-7e71-ab92-061ab4ff4fdf
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
Assign A06/B08 as primary own

...[clipped by superloop]...

licts/none). Features were not accepted on claim alone.
- **APK release.** Rejected another build publication because no product delta exists.
- **Completion-by-truncation.** Agents with truncated exploratory/verification (A01,A03,A04,A05,A07,A09,A10,B01,B03,B04,B05,B07,B08) were marked **RESEARCH_INSUFFICIENT**, not complete.
- **Visual/aggregate downgrades.** Refused to treat missing exact-build visual evidence as PASS or to average away any rubric hard fail.
- **Speculation over source authority.** External research treated as starting evidence only, never authority over Seven’s exact runtime behavior.

## 3. What Remains Unproven

| Area | Unproven Item | Evidence Required |
|---|---|---|
| **Android** (A02) | Installed-artifact device/emulator gate | Instrumented round-trip on installed build bound to exact-build identity (artifact hash/manifest). Evidence ledger entry. |
| **Product Cohesion (Phase 10)** (B10, A01,A03,A10) | Phase 10 not implemented | ShellStore + ThemeService (domain+application), unified nav, 44px targets, logical CSS (LTR/RTL), reduced motion, 320px floor, locale→RTL authority, runtime smoke + minimal visual contract. |
| **Memory v2** (A06) | Live-chat wiring + full P0 checklist | Live wiring to chat, domain index `domain/memory/index.ts`, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion. Benchmarks vs local lexical/temporal baseline. |
| **Tool System v1 / ReferenceMonitor** (A04+A07) | Gates not materialized | ReferenceMonitor at kernel boundary, approval binding, idempotency, schema/capability/scope/approval/replay, audit tests green. |
| **RPG/Storage** (B07,B02,B08,B05) | Storage key ambiguity | Single canonical RPG storage key across surfaces, migration + fail-safe tests. |
| **Audit** (B07,A08) | `audit().chronology` hardcoded PASS | Chronology computed from actual gate outcomes with invariant tests. |
| **E2E/Test Infra** (A08) | Playwright not installed in verify env | Playwright installed and deterministic E2E subset runnable (or CI-equivalent defined). |
| **Verification completeness** (multiple) | Truncated RESEARCH/verification | Focused RESEARCH runs to closure; ledger complete; do not invent certainty. |
| **Cross-domain races** (B09) | Cancellation isolation under stress | Stress across attachments+tasks+bridge+chat with cancellation sealing; deterministic green. |
| **Native bridge wiring** (A02,A09) | JS contract vs native IPC/lifecycle unproven | Device/emulator verification of transport/lifecycle (resume/app-state) against Capacitor bridge. |
| **Citations/Deep Think phases** (B03,B04) | Schema compliance + Phase 3 validation | Deterministic citation schema tests, network-failure handling, and Phase 3 persistent/adversarial validation evidenced. |

## 4. Exact Next-Cycle Priorities (ranked by user impact & root cause)

1. **P0 — Phase 10 Product Cohesion (B10)**: Implement ShellStore/ThemeService (domain+application), unified nav, 44px, logical properties (RTL), reduced motion, 320px floor, locale→RTL. Add runtime smoke + unit tests. Coordinate A01,A03,A10.
2. **P0 — Android installed-artifact proof (A02)**: Device/emulator instrumented round-trip bound to exact build identity; create evidence ledger entry (APK/manifest/hash). Coordinate B09.
3. **P0 — Memory v2 live wiring (A06)**: Wire memory into live chat; add `domain/memory/index.ts`; satisfy provenance/abstention/temporal/restart/Android/Arabic/parity/secret exclusion; benchmark against local lexical/temporal baseline. Coordinate A04,A08,B09,B10.
4. **P0 — Tool System v1 gates (A04+A07)**: Materialize ReferenceMonitor at kernel boundary; approval binding, idempotency, schema/capability/scope/approval/replay + audit tests green. Coordinate A08,B07,B09,B10.
5. **P1 — Resolve RPG storage key (B07+B02+B08)**: Single canonical key; migration + backward-compat/fail-safe tests; remove ambiguity.
6. **P1 — Compute audit chronology (B07)**: Replace hardcoded PASS with computed chronology from gate outcomes; add invariant tests.
7. **P1 — E2E environment (A08)**: Install Playwright in verify environment (or document CI); enable deterministic E2E subset.
8. **P1 — Complete truncated verifications (A01,A03,A04,A05,B02,B03,B04)**: Focused RESEARCH runs to closure; mark RESEARCH_INSUFFICIENT where still true; do not invent certainty.
9. **P2 — Cross-module auth consumption (A07)**: Verify only `publicAuth` consumed; add guard if feasible.
10. **P2 — Cross-domain stress (B09)**: Cancellation isolation across attachments+tasks+bridge+chat under stress.

## 5. Bug Hunt Routing (top P0)

| Bug ID | Owner | Severity | Defect | Key Surfaces | Acceptance Test |
|---|---|---|---|---|---|
| **BH-124-01** | B10 (coord A01,A03,A10) | P0 | Phase 10 unimplemented (ShellStore/ThemeService, unified nav, 44px, logical CSS, reduced motion, 320px, locale→RTL) | `remake/src/ui/**`, `remake/src/application/shell/**` (new), `remake/src/domain/shell/**` (new) | Shell/theme unit+runtime smoke green; 44px/logical RTL verified; reduced motion respected; 320px floor holds; minimal visual contract passes. |
| **BH-124-02** | A02 (coord B09) | P0 | Android installed-artifact evidence missing (device/emulator gate) | `apk/**`, `remake/android/**`, bridge tests | Instrumented round-trip passes on installed build with exact-build identity (hash/manifest); evidence ledger entry created. |
| **BH-124-03** | A06 (coord A04,A08,B09,B10) | P0 | Memory live-chat wiring + P0 checklist unproven | `remake/src/application/memory/**`, `remake/src/domain/memory/**`, `remake/src/domain/memory/index.ts` (new), chat integration | P0 checklist satisfied: provenance/abstention/temporal/restart/Android/Arabic/parity/secret exclusion proven; benchmarks vs local lexical/temporal baseline; deterministic tests green. |
| **BH-124-04** | A04+A07 (coord A08,B07,B09,B10) | P0 | ReferenceMonitor + Tool System v1 gates unproven | `remake/src/tools/**`, `remake/src/kernel/**` | Schema/capability/scope/approval/replay + idempotency/audit tests green; ReferenceMonitor at kernel boundary. |

## 6. Final Verdict

**Authoritative branch:** `seven-remake-v3`  
**Evidence stance:** Missing = **UNPROVEN**; hard fails cannot be averaged away. Preserve failed experiments/quality debt as learning evidence.

Execute **BH-124-01–BH-124-04** before expanding feature count. No premium/release-quality claim is supported until Android installed-artifact proof, Phase 10 cohesion, Memory v2 live wiring, and Tool System v1 gates are evidenced.

```
PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED
PRODUCT_QUALITY_SCORE=UNPROVEN
PRODUCT_QUALITY_HARD_FAILS=3
```
tokens used
13,000
# Seven Superloop Manager — Cycle 124 Final Review

**Cycle:** 124  
**Manager stage:** manager-final-review  
**Authoritative branch:** `seven-remake-v3` (unchanged)  
**Head:** `6e17a6b9991bcfb311f7059b407cc30286ac8d40`  
**Feature integration:** accepted=[] , rejected=all 20 agents (no candidate/conflict), fullGatesPass=true  
**Evolution Arena:** promotion=BLOCKED_PENDING_COMPARATIVE_PROOF (no challenger wins from typecheck alone)  
**Fix integration:** accepted=[] , rejected=all 20 agents, fullGatesPass=true  
**Polish:** False  
**APK:** APK_STAGE=BLOCKED_NO_PRODUCT_DELTA; SELF_HEAL_APK=EXHAUSTED (no user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public`)

## 1. What Actually Improved

- **Evidence discipline upheld.** Treated all missing runtime/installed-artifact and truncated verification states as **UNPROVEN**. Refused to publish an APK when the Seven payload is effectively unchanged.
- **Arena integrity.** Evolution Arena blocked promotion pending comparative proof; upheld rule that typecheck alone does not qualify a challenger.
- **Deterministic gate recording.** Feature/fix integration recorded against `6e17a6b` with fullGatesPass=true while explicitly rejecting candidates lacking evidence.
- **Campaign priority enforced.** Memory v2 remains P0, Tool System v1 remains P0, with explicit ownership maps (A06/B08 primary for Memory; A04+A07 primary for Tools) and cross-domain review required.

## 2. What Was Rejected

- **All agent candidates (A01–A10, B01–B10).** No candidate accepted for feature integration or fix integration (noted conflicts/none). Features were not accepted on claim alone.
- **APK release.** Rejected another build publication because no product delta exists.
- **Completion-by-truncation.** Agents with truncated exploratory/verification (A01,A03,A04,A05,A07,A09,A10,B01,B03,B04,B05,B07,B08) were marked **RESEARCH_INSUFFICIENT**, not complete.
- **Visual/aggregate downgrades.** Refused to treat missing exact-build visual evidence as PASS or to average away any rubric hard fail.
- **Speculation over source authority.** External research treated as starting evidence only, never authority over Seven’s exact runtime behavior.

## 3. What Remains Unproven

| Area | Unproven Item | Evidence Required |
|---|---|---|
| **Android** (A02) | Installed-artifact device/emulator gate | Instrumented round-trip on installed build bound to exact-build identity (artifact hash/manifest). Evidence ledger entry. |
| **Product Cohesion (Phase 10)** (B10, A01,A03,A10) | Phase 10 not implemented | ShellStore + ThemeService (domain+application), unified nav, 44px targets, logical CSS (LTR/RTL), reduced motion, 320px floor, locale→RTL authority, runtime smoke + minimal visual contract. |
| **Memory v2** (A06) | Live-chat wiring + full P0 checklist | Live wiring to chat, domain index `domain/memory/index.ts`, temporal correction, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion. Benchmarks vs local lexical/temporal baseline. |
| **Tool System v1 / ReferenceMonitor** (A04+A07) | Gates not materialized | ReferenceMonitor at kernel boundary, approval binding, idempotency, schema/capability/scope/approval/replay, audit tests green. |
| **RPG/Storage** (B07,B02,B08,B05) | Storage key ambiguity | Single canonical RPG storage key across surfaces, migration + fail-safe tests. |
| **Audit** (B07,A08) | `audit().chronology` hardcoded PASS | Chronology computed from actual gate outcomes with invariant tests. |
| **E2E/Test Infra** (A08) | Playwright not installed in verify env | Playwright installed and deterministic E2E subset runnable (or CI-equivalent defined). |
| **Verification completeness** (multiple) | Truncated RESEARCH/verification | Focused RESEARCH runs to closure; ledger complete; do not invent certainty. |
| **Cross-domain races** (B09) | Cancellation isolation under stress | Stress across attachments+tasks+bridge+chat with cancellation sealing; deterministic green. |
| **Native bridge wiring** (A02,A09) | JS contract vs native IPC/lifecycle unproven | Device/emulator verification of transport/lifecycle (resume/app-state) against Capacitor bridge. |
| **Citations/Deep Think phases** (B03,B04) | Schema compliance + Phase 3 validation | Deterministic citation schema tests, network-failure handling, and Phase 3 persistent/adversarial validation evidenced. |

## 4. Exact Next-Cycle Priorities (ranked by user impact & root cause)

1. **P0 — Phase 10 Product Cohesion (B10)**: Implement ShellStore/ThemeService (domain+application), unified nav, 44px, logical properties (RTL), reduced motion, 320px floor, locale→RTL. Add runtime smoke + unit tests. Coordinate A01,A03,A10.
2. **P0 — Android installed-artifact proof (A02)**: Device/emulator instrumented round-trip bound to exact build identity; create evidence ledger entry (APK/manifest/hash). Coordinate B09.
3. **P0 — Memory v2 live wiring (A06)**: Wire memory into live chat; add `domain/memory/index.ts`; satisfy provenance/abstention/temporal/restart/Android/Arabic/parity/secret exclusion; benchmark against local lexical/temporal baseline. Coordinate A04,A08,B09,B10.
4. **P0 — Tool System v1 gates (A04+A07)**: Materialize ReferenceMonitor at kernel boundary; approval binding, idempotency, schema/capability/scope/approval/replay + audit tests green. Coordinate A08,B07,B09,B10.
5. **P1 — Resolve RPG storage key (B07+B02+B08)**: Single canonical key; migration + backward-compat/fail-safe tests; remove ambiguity.
6. **P1 — Compute audit chronology (B07)**: Replace hardcoded PASS with computed chronology from gate outcomes; add invariant tests.
7. **P1 — E2E environment (A08)**: Install Playwright in verify environment (or document CI); enable deterministic E2E subset.
8. **P1 — Complete truncated verifications (A01,A03,A04,A05,B02,B03,B04)**: Focused RESEARCH runs to closure; mark RESEARCH_INSUFFICIENT where still true; do not invent certainty.
9. **P2 — Cross-module auth consumption (A07)**: Verify only `publicAuth` consumed; add guard if feasible.
10. **P2 — Cross-domain stress (B09)**: Cancellation isolation across attachments+tasks+bridge+chat under stress.

## 5. Bug Hunt Routing (top P0)

| Bug ID | Owner | Severity | Defect | Key Surfaces | Acceptance Test |
|---|---|---|---|---|---|
| **BH-124-01** | B10 (coord A01,A03,A10) | P0 | Phase 10 unimplemented (ShellStore/ThemeService, unified nav, 44px, logical CSS, reduced motion, 320px, locale→RTL) | `remake/src/ui/**`, `remake/src/application/shell/**` (new), `remake/src/domain/shell/**` (new) | Shell/theme unit+runtime smoke green; 44px/logical RTL verified; reduced motion respected; 320px floor holds; minimal visual contract passes. |
| **BH-124-02** | A02 (coord B09) | P0 | Android installed-artifact evidence missing (device/emulator gate) | `apk/**`, `remake/android/**`, bridge tests | Instrumented round-trip passes on installed build with exact-build identity (hash/manifest); evidence ledger entry created. |
| **BH-124-03** | A06 (coord A04,A08,B09,B10) | P0 | Memory live-chat wiring + P0 checklist unproven | `remake/src/application/memory/**`, `remake/src/domain/memory/**`, `remake/src/domain/memory/index.ts` (new), chat integration | P0 checklist satisfied: provenance/abstention/temporal/restart/Android/Arabic/parity/secret exclusion proven; benchmarks vs local lexical/temporal baseline; deterministic tests green. |
| **BH-124-04** | A04+A07 (coord A08,B07,B09,B10) | P0 | ReferenceMonitor + Tool System v1 gates unproven | `remake/src/tools/**`, `remake/src/kernel/**` | Schema/capability/scope/approval/replay + idempotency/audit tests green; ReferenceMonitor at kernel boundary. |

## 6. Final Verdict

**Authoritative branch:** `seven-remake-v3`  
**Evidence stance:** Missing = **UNPROVEN**; hard fails cannot be averaged away. Preserve failed experiments/quality debt as learning evidence.

Execute **BH-124-01–BH-124-04** before expanding feature count. No premium/release-quality claim is supported until Android installed-artifact proof, Phase 10 cohesion, Memory v2 live wiring, and Tool System v1 gates are evidenced.

```
PRODUCT_QUALITY_VERDICT=CHANGES_REQUIRED
PRODUCT_QUALITY_SCORE=UNPROVEN
PRODUCT_QUALITY_HARD_FAILS=3
```
