# Seven Superloop Cycle 202

Run: 38928898416

## Machine summary

```json
{
  "cycle": 202,
  "featureCandidates": 1,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "CHANGES_REQUIRED or RC or PREMIUM_CANDIDATE or UNPROVEN",
  "productQualityScore": "<0.0-10.0 or UNPROVEN>",
  "domainResearchReady": 10,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D01_CHAT_CORE",
    "D04_CODING_SYSTEM",
    "D05_SELF_DEVELOPMENT",
    "D07_RESEARCH_WEB",
    "D08_MODEL_ROUTING",
    "D09_DEEP_THINK",
    "D10_FILES_MULTIMODAL",
    "D13_ARABIC_RTL_A11Y",
    "D14_SECURITY_PRIVACY",
    "D15_PERSISTENCE_RECOVERY",
    "D16_NETWORK_RESILIENCE",
    "D17_PERFORMANCE_CONCURRENCY",
    "D18_TESTING_EVALS",
    "D21_OBSERVABILITY_WORLD_MODEL",
    "D22_PROTOCOLS_INTEROP",
    "D23_IMPORT_EXPORT_BACKUP",
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON"
  ],
  "head": "038210691113aef1260748796677fcf2512278a6",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 202,
    "sourceSha": "038210691113aef1260748796677fcf2512278a6",
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
session id: 01a145b8-3873-7332-a240-f320f302ddad
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


Cycle: 202
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: conflict", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "038210691113aef1260748796677fcf2512278a6", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 202, "championSha": "038210691113aef1260748796677fcf2512278a6", "challengers": [{"agent": "A10", "sha": "1bc03dce75198641a609a596f4bd7176ec4ccf64", "stage": "SHADOW_ELIGIBLE", "comparativeScore": null, "proof": "quick typecheck candidate only", "outputDigest": "bbd0849d43b3d6908acd6a3509618e12e6d4f39f561840749aaf9d1393a05fa1"}], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "038210691113aef1260748796677fcf2512278a6", "fullGatesPass": true}
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
session id: 01a145b6-2ce3-7d10-8bf9-438cf15fd2be
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

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.md and EXECUTION_PLA

...[clipped by superloop]...

date, A10: conflict, B01–B10: no candidate]`. No vertical user value justified expansion without live evidence.
- **All fix candidates.** `accepted=[]`, `rejected=[A01–B10: no candidate]`. No minimal coherent fix set demonstrated sufficient proof to be integrated.
- **Polish.** Rejected (no product delta). Visual polish cannot be counted toward premium feel without exact-build visual evidence per the Product Intelligence rubric.
- **A10 promotion.** Rejected on Evolution Arena policy (typecheck-only is insufficient). Requires comparative proof bound to candidate source/artifact identity (Reality Lab).
- **Scope inflation.** Rejected attempts to treat RESEARCH_INSUFFICIENT domains as complete, to merge domains into one plan, to promote complexity without measured gain, or to weaken evaluator/constitution rules.

---

### 3) What remains unproven

| Blocker | Area | Evidence missing | Impact |
|---|---|---|---|
| **BH-202-01** | Android installed-artifact | Exact build id/hash, install success, launch, smoke, JS↔native round-trip (typed envelopes). Must distinguish build/mock/install. | **Hard (critical).** Blocks any premium/release-quality claim. |
| **BH-202-02** | Memory v2 (P0) | Evidence ledger against live-chat runtime: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android exact-build state, Arabic parity, secret exclusion; benchmarks vs local lexical/temporal baseline; commits/tests/unproven list. | **Hard.** Campaign incomplete; cannot be closed. |
| **BH-202-03** | Tool System v1 (P0 after Memory) | ReferenceMonitor + tests, approval binding, idempotency, audit trail; deterministic schema/capability/scope/approval/replay verified; LLM not authorization boundary proven live. | **Hard.** Must be green before connecting high-impact external tools. |
| **BH-202-04** | TaskManager ↔ `remake/ARCHITECTURE.md` | Minimal coherent alignment (doc or code) preserving ownership/layering and single-owner boundaries. | Medium. Architecture consistency unproven vs stated reality. |
| **BH-202-05** | Verification debt | Concrete PASS/FAIL + evidence for truncated domains (A01,A03,A08,A09,A10,B04,B06,B08,B10,B09), RTL/accessibility (A03), product cohesion/QA (B10). Exact-build visual evidence required; rubric hard fails block claims. | Medium–Hard. Aggregate score cannot substitute for hard fails. |
| **BH-202-06** | Deep Think export | Barrel export (`index.ts`) or documented import pattern; no behavior change. | Medium. Cohesion gap. |
| **BH-202-07** | Test hygiene (perf) | jsdom pooling evidence (e.g. `pool: 'vmThreads'` or `isolate: false`) preserving isolation; affected tests green. | Medium (non-blocking correctness). |
| **BH-202-08** | SAF lifecycle (attachments) | Lifecycle-managed SAF tests/evidence (grants, revocation, task cancellation, ingestion pipeline), integrated with Android bridge. | Medium. Bridge integration incomplete. |

*Note:* Domain-campaign items marked RESEARCH_INSUFFICIENT remain unproven; they must be closed by evidence gathering, not certainty. External sources are starting evidence only (not authority over Seven’s exact runtime behavior).

---

### 4) Exact next-cycle priorities

Execute the smallest coherent set that can pass the full suite and resolve hard blockers. Do not expand scope until evidence exists.

| Priority | Owner(s) | Objective | Files/surfaces to inspect | Expected evidence | Dependencies/conflicts | Acceptance test |
|---|---|---|---|---|---|---|
| **P0.1 (Hard)** | **A02** | Prove Android installed-artifact on device/emulator. | Android build/install, Capacitor bridge, APK/installed build. | Exact build id/hash, install success, launch, smoke, JS↔native round-trip (typed envelopes). Distinguish build/mock/install. | Blocks premium/release claim. | Installed-device gate passes; evidence attached (not build-only). |
| **P0.2 (Hard)** | **A06 (primary), A04, A08, B09, B10** | Close Memory v2 evidence gaps against live runtime. | Memory domain, chat wiring, persistence, temporal/provenance/abstention, restart, Arabic/secret exclusion. | Evidence ledger updated (commits, tests, benchmarks vs local lexical/temporal baseline, Android exact-build state, known unproven items). Prefer incremental migration beside legacy (no destructive rewrite). | Depends on P0.1 for Android exact-build state (where applicable). | All checklist items proven, or explicitly re-planned with evidence; live-chat wiring demonstrated. |
| **P0.3 (Hard)** | **A04+A07, A08, B09, B10, B07** | Enforce Tool System v1 gates before high-impact external tools. | ReferenceMonitor, approval binding, idempotency, audit, schema/capability/scope/approval/replay. | Gates green; LLM non-authorizing; deterministic checks verified; audit tests present. | Prerequisite before connecting external tools. | Full gate suite green with artifacts. |
| **P1.1** | **A04** | Reconcile TaskManager path with `remake/ARCHITECTURE.md`. | `remake/ARCHITECTURE.md`, `remake/src/core/task-manager.ts`, references to `application/tasks/task-manager.ts`. | Minimal coherent alignment (doc or code); ownership/layering preserved; single-owner intact. | Avoid broad refactor. | Typecheck + affected tests green; `ARCHITECTURE.md` consistent with reality. |
| **P1.2** | **A10+manager + A01,A03,A08,A09,B04,B06,B08,B09** | Complete truncated verification domains. | UI/visual, RTL/accessibility, testing/perf, red-team, cohesion/QA, stress/races, DeepThink export as needed. | Concrete evidence per domain; apply Product Intelligence rubric (hard fails block); visual claims require exact-build evidence. Route defects to bug hunt. | Uses rubric/encyclopedia v2 (route smallest complete knowledge pack per task). | Each domain PASS/FAIL with evidence; UNPROVEN cleared or re-listed with timeline. |
| **P2.1** | **B02** | Prove SAF lifecycle (attachments). | Attachments/SAF surface, bridge integration, task cancellation. | Lifecycle-managed SAF tests/evidence (grants, revocation, cancellation, ingestion). | Integrates with Android bridge (P0.1 context). | Deterministic lifecycle evidence present and reproducible. |

---

**Manager conclusion:** Core is compatible and the test suite is green. However, the premium/release claim remains **UNPROVEN**. The next cycle must focus first on **BH-202-01 (A02)** to establish a concrete Android installed-artifact, then **BH-202-02 (Memory v2)** and **BH-202-03 (Tool System v1)** to close their live-proof gaps. Only the minimal coherent set above should be executed; no scope expansion until those blockers carry verifiable evidence.
tokens used
13,195
**CYCLE 202 — FINAL MANAGER REVIEW** 

**Head:** `038210691113aef1260748796677fcf2512278a6`  
**Branch (authoritative):** `seven-remake-v3`  
**Gates:** `fullGatesPass = true` (test suite green, core compatible).  
**Polish accepted:** `false`  
**APK stage:** `BLOCKED_NO_PRODUCT_DELTA` (no user-facing/product-runtime delta under `remake/src`, `remake/index.html`, or `remake/public`); `SELF_HEAL_APK=EXHAUSTED`.  
**Evolution Arena (A10):** `SHADOW_ELIGIBLE`, `comparativeScore=null`, proof `"quick typecheck candidate only"`, promotion `BLOCKED_PENDING_COMPARATIVE_PROOF`. Rule enforced: *"No challenger wins from typecheck alone."*

---

### 1) What actually improved

- **Stability baseline held.** Full test suite is green at `038210691113aef1260748796677fcf2512278a6` with no regressions observed from evaluated candidates.
- **Evidence discipline enforced.** Challenger promotion was blocked for lack of comparative/runtime proof. The manager refused to inflate completeness by averaging hard fails (product quality, security, constitution). 
- **Release discipline exercised.** APK publication was rejected because there is no product-runtime delta to ship. Publishing an effectively unchanged Seven payload would violate release-readiness and evidence requirements.
- **Campaign scaffolding is in place.** Memory Fabric v2 and Tool System v1 now have research syntheses, execution plans, strike-team ownership maps and domain-campaign separation (roadmaps not merged). 
- **Decision hygiene.** No feature or fix set met acceptance; empty accept lists reflect requirement to require code/test/runtime evidence (not agent claims). 

---

### 2) What was rejected

- **All agent candidates (features).** `accepted=[]`, `rejected=[A01–A09: no candidate, A10: conflict, B01–B10: no candidate]`. No vertical user value justified expansion without live evidence.
- **All fix candidates.** `accepted=[]`, `rejected=[A01–B10: no candidate]`. No minimal coherent fix set demonstrated sufficient proof to be integrated.
- **Polish.** Rejected (no product delta). Visual polish cannot be counted toward premium feel without exact-build visual evidence per the Product Intelligence rubric.
- **A10 promotion.** Rejected on Evolution Arena policy (typecheck-only is insufficient). Requires comparative proof bound to candidate source/artifact identity (Reality Lab).
- **Scope inflation.** Rejected attempts to treat RESEARCH_INSUFFICIENT domains as complete, to merge domains into one plan, to promote complexity without measured gain, or to weaken evaluator/constitution rules.

---

### 3) What remains unproven

| Blocker | Area | Evidence missing | Impact |
|---|---|---|---|
| **BH-202-01** | Android installed-artifact | Exact build id/hash, install success, launch, smoke, JS↔native round-trip (typed envelopes). Must distinguish build/mock/install. | **Hard (critical).** Blocks any premium/release-quality claim. |
| **BH-202-02** | Memory v2 (P0) | Evidence ledger against live-chat runtime: live-chat wiring, temporal correction, provenance, abstention, restart persistence, Android exact-build state, Arabic parity, secret exclusion; benchmarks vs local lexical/temporal baseline; commits/tests/unproven list. | **Hard.** Campaign incomplete; cannot be closed. |
| **BH-202-03** | Tool System v1 (P0 after Memory) | ReferenceMonitor + tests, approval binding, idempotency, audit trail; deterministic schema/capability/scope/approval/replay verified; LLM not authorization boundary proven live. | **Hard.** Must be green before connecting high-impact external tools. |
| **BH-202-04** | TaskManager ↔ `remake/ARCHITECTURE.md` | Minimal coherent alignment (doc or code) preserving ownership/layering and single-owner boundaries. | Medium. Architecture consistency unproven vs stated reality. |
| **BH-202-05** | Verification debt | Concrete PASS/FAIL + evidence for truncated domains (A01,A03,A08,A09,A10,B04,B06,B08,B10,B09), RTL/accessibility (A03), product cohesion/QA (B10). Exact-build visual evidence required; rubric hard fails block claims. | Medium–Hard. Aggregate score cannot substitute for hard fails. |
| **BH-202-06** | Deep Think export | Barrel export (`index.ts`) or documented import pattern; no behavior change. | Medium. Cohesion gap. |
| **BH-202-07** | Test hygiene (perf) | jsdom pooling evidence (e.g. `pool: 'vmThreads'` or `isolate: false`) preserving isolation; affected tests green. | Medium (non-blocking correctness). |
| **BH-202-08** | SAF lifecycle (attachments) | Lifecycle-managed SAF tests/evidence (grants, revocation, task cancellation, ingestion pipeline), integrated with Android bridge. | Medium. Bridge integration incomplete. |

*Note:* Domain-campaign items marked RESEARCH_INSUFFICIENT remain unproven; they must be closed by evidence gathering, not certainty. External sources are starting evidence only (not authority over Seven’s exact runtime behavior).

---

### 4) Exact next-cycle priorities

Execute the smallest coherent set that can pass the full suite and resolve hard blockers. Do not expand scope until evidence exists.

| Priority | Owner(s) | Objective | Files/surfaces to inspect | Expected evidence | Dependencies/conflicts | Acceptance test |
|---|---|---|---|---|---|---|
| **P0.1 (Hard)** | **A02** | Prove Android installed-artifact on device/emulator. | Android build/install, Capacitor bridge, APK/installed build. | Exact build id/hash, install success, launch, smoke, JS↔native round-trip (typed envelopes). Distinguish build/mock/install. | Blocks premium/release claim. | Installed-device gate passes; evidence attached (not build-only). |
| **P0.2 (Hard)** | **A06 (primary), A04, A08, B09, B10** | Close Memory v2 evidence gaps against live runtime. | Memory domain, chat wiring, persistence, temporal/provenance/abstention, restart, Arabic/secret exclusion. | Evidence ledger updated (commits, tests, benchmarks vs local lexical/temporal baseline, Android exact-build state, known unproven items). Prefer incremental migration beside legacy (no destructive rewrite). | Depends on P0.1 for Android exact-build state (where applicable). | All checklist items proven, or explicitly re-planned with evidence; live-chat wiring demonstrated. |
| **P0.3 (Hard)** | **A04+A07, A08, B09, B10, B07** | Enforce Tool System v1 gates before high-impact external tools. | ReferenceMonitor, approval binding, idempotency, audit, schema/capability/scope/approval/replay. | Gates green; LLM non-authorizing; deterministic checks verified; audit tests present. | Prerequisite before connecting external tools. | Full gate suite green with artifacts. |
| **P1.1** | **A04** | Reconcile TaskManager path with `remake/ARCHITECTURE.md`. | `remake/ARCHITECTURE.md`, `remake/src/core/task-manager.ts`, references to `application/tasks/task-manager.ts`. | Minimal coherent alignment (doc or code); ownership/layering preserved; single-owner intact. | Avoid broad refactor. | Typecheck + affected tests green; `ARCHITECTURE.md` consistent with reality. |
| **P1.2** | **A10+manager + A01,A03,A08,A09,B04,B06,B08,B09** | Complete truncated verification domains. | UI/visual, RTL/accessibility, testing/perf, red-team, cohesion/QA, stress/races, DeepThink export as needed. | Concrete evidence per domain; apply Product Intelligence rubric (hard fails block); visual claims require exact-build evidence. Route defects to bug hunt. | Uses rubric/encyclopedia v2 (route smallest complete knowledge pack per task). | Each domain PASS/FAIL with evidence; UNPROVEN cleared or re-listed with timeline. |
| **P2.1** | **B02** | Prove SAF lifecycle (attachments). | Attachments/SAF surface, bridge integration, task cancellation. | Lifecycle-managed SAF tests/evidence (grants, revocation, cancellation, ingestion). | Integrates with Android bridge (P0.1 context). | Deterministic lifecycle evidence present and reproducible. |

---

**Manager conclusion:** Core is compatible and the test suite is green. However, the premium/release claim remains **UNPROVEN**. The next cycle must focus first on **BH-202-01 (A02)** to establish a concrete Android installed-artifact, then **BH-202-02 (Memory v2)** and **BH-202-03 (Tool System v1)** to close their live-proof gaps. Only the minimal coherent set above should be executed; no scope expansion until those blockers carry verifiable evidence.
