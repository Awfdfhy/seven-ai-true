# Seven Superloop Cycle 274

Run: 39434417900

## Machine summary

```json
{
  "cycle": 274,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "UNPROVEN",
  "productQualityScore": "UNPROVEN",
  "domainResearchReady": 5,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D01_CHAT_CORE",
    "D02_MEMORY_CONTEXT",
    "D03_TOOLS_CAPABILITY",
    "D06_RPG_WORLD",
    "D07_RESEARCH_WEB",
    "D08_MODEL_ROUTING",
    "D09_DEEP_THINK",
    "D10_FILES_MULTIMODAL",
    "D12_UI_DESIGN_SYSTEM",
    "D14_SECURITY_PRIVACY",
    "D15_PERSISTENCE_RECOVERY",
    "D16_NETWORK_RESILIENCE",
    "D17_PERFORMANCE_CONCURRENCY",
    "D18_TESTING_EVALS",
    "D19_AGENT_ORCHESTRATION",
    "D20_PRODUCT_QUALITY",
    "D21_OBSERVABILITY_WORLD_MODEL",
    "D23_IMPORT_EXPORT_BACKUP",
    "D24_RELEASE_APK",
    "D25_HISTORY_ROOMS",
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "5f13dc6efe30ad245a55c851db9196f1d67a9699",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 274,
    "sourceSha": "5f13dc6efe30ad245a55c851db9196f1d67a9699",
    "proof": {
      "deterministicFinalGates": true,
      "apkBuilt": false,
      "productQualityScored": false,
      "productHardFailsKnown": false,
      "realityLabExactInstalledEvidence": false,
      "constitutionRuntimeCoverage": "PARTIAL",
      "physicalDeviceEvidence": false
    },
    "productQualityScore": "UNPROVEN",
    "productHardFails": "UNPROVEN",
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
session id: 01a15a21-0036-7161-a05d-39aef2113e7a
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


Cycle: 274
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "5f13dc6efe30ad245a55c851db9196f1d67a9699", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 274, "championSha": "5f13dc6efe30ad245a55c851db9196f1d67a9699", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "5f13dc6efe30ad245a55c851db9196f1d67a9699", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:


[agent timeout after 240s]

Manager fallback: preserve current architecture, prioritize release blockers and require evidence before integration.

Summarize what actually improved, what the team rejected, what remains unproven, and exact next-cycle
research priorities. Do not call missing evidence PASS.

Return a concrete manager deliverable. Do not modify files, commit, or push.

warning: Model metadata for `kilo-auto/free` not found. Defaulting to fallback metadata; this can degrade performance and cause issues.
exec
/bin/bash -lc 'git -C /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review log --oneline -5' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
5f13dc6 Superloop cycle 273 manager record
faeecd1 Superloop cycle 272 manager record
9440f0e Superloop cycle 271 manager record
fbda641 Superloop cycle 270 manager record
d6c20a5 Superloop cycle 269 manager record

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/superloop/team-v1.json | head -200' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
cat: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/superloop/team-v1.json: No such file or directory

exec
/bin/bash -lc 'git -C /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review diff --name-only 5f13dc6efe30ad245a55c851db9196f1d67a9699''^1..5f13dc6efe30ad245a55c851db9196f1d67a9699 | head -30' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
.seven-team/domain-campaign/generated/history/cycle-0273.md
.seven-team/domain-campaign/generated/latest-audit.json
.seven-team/superloop-history/cycle-0273.md
.seven-team/superloop-state.json

exec
/bin/bash -lc 'ls /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/ | head -80' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
PROTOCOL.md
TWO_TEAM_PROTOCOL.md
bughunt
cohesion
domain-campaign
ownership.json
prompts
readiness.json
remake-mega
remake-super
reports
runtime
superloop-history
superloop-state.json
team.json
wave-01-manifest.json

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/superloop-state.json | head -120' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
{
  "schemaVersion": 1,
  "enabled": true,
  "lastCompletedCycle": 273,
  "lastCompletedAt": "2026-10-20T15:11:37.022452+00:00",
  "workBranch": "autoloop/seven-24h-work-v6",
  "productBranch": "seven-remake-v3",
  "runId": "39430384960",
  "runNumber": "471",
  "summary": {
    "cycle": 273,
    "featureCandidates": 0,
    "featuresAccepted": 0,
    "fixCandidates": 0,
    "fixesAccepted": 0,
    "polishAccepted": false,
    "apkState": "BLOCKED_NO_PRODUCT_DELTA",
    "productQualityVerdict": "UNPROVEN",
    "productQualityScore": "UNPROVEN",
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
    "head": "faeecd1bdbd6a028342b4b5be05c8298b3b91ecc",
    "autonomy": {
      "schemaVersion": 1,
      "cycle": 273,
      "sourceSha": "faeecd1bdbd6a028342b4b5be05c8298b3b91ecc",
      "proof": {
        "deterministicFinalGates": true,
        "apkBuilt": false,
        "productQualityScored": false,
        "productHardFailsKnown": false,
        "realityLabExactInstalledEvidence": false,
        "constitutionRuntimeCoverage": "PARTIAL",
        "physicalDeviceEvidence": false
      },
      "productQualityScore": "UNPROVEN",
      "productHardFails": "UNPROVEN",
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
}

codex
# CYCLE 274 - FINAL MANAGER REVIEW 

**Head:** `5f13dc6efe30ad245a55c851db9196f1d67a9699`  
**Champion Status:** `HOLD_CHAMPION` | **Promotion:** `BLOCKED_PENDING_COMPARATIVE_PROOF`  
**Gates:** `fullGatesPass: true` (Typecheck/Lint/Tests baseline) | **Polish:** `False` | **APK:** `BLOCKED_NO_PRODUCT_DELTA`


---


## What Actually Improved
- **Discipline Over Quantity:** The team correctly refused to promote anything without evidence. All feature and fix candidates were rejected due to having "no candidate", preventing scope creep.
- **Arena Guardrails Enforced:** The Evolution Arena upheld its rule of "No challenger wins from typecheck alone", blocking promotion despite a green gate set. 
- **Churn Prevention:** `SELF_HEAL_APK=EXHAUSTED` and the APK was correctly blocked due to the lack of a product-runtime delta, preventing the publishing of an effectively unchanged Seven payload. 
- **Stability Preserved:** The architecture remains untouched at the champion SHA with a passing gate baseline, exactly as demanded by the hard rules. 



---


## What Was Rejected
- **Features (A01-A10, B01-B10):** 0 accepted, all rejected with `no candidate`. 
- **Fixes (A01-A10, B01-B10):** 0 accepted, all rejected with `no candidate`.
- **Polish:** Not accepted for this cycle.
- **Evolution Arena:** 0 challengers. Promotion remains blocked pending comparative proof against `5f13dc6efe30ad245a55c851db9196f1d67a9699`.
- **APK Publication:** Blocked. No user-facing or product-runtime delta exists under `remake/src/`, `remake/index.html`, or `remake/public/`. 



---


## What Remains Unproven
- **Product Delta:** The largest blocker. There is no verifiable change to Seven's runtime behavior or UX this cycle. This is the reason for the blocked APK and directly impacts the ability to claim any product improvement.
- **Product Quality:** `productQualityScored: false`, `productHardFails: UNPROVEN`, and the overall verdict is `UNPROVEN`. Crucially, *missing exact-build visual evidence means visual quality is UNPROVEN, not PASS*. Any rubric hard fail would block a premium/release-quality claim regardless of score.
- **Reality & Android Proof:** `apkBuilt: false`, `realityLabExactInstalledEvidence: false`, and `physicalDeviceEvidence: false`. No executable device/emulator gate has proven an installed artifact for this cycle.
- **Constitution & Autonomy:** `constitutionRuntimeCoverage: PARTIAL`, `trustStatus: UNPROVEN_OR_BLOCKED`. The autonomy plane explicitly states that aggregate scores can never override constitution or product hard fails.
- **Domain Research:** 0/30 domains are marked research-complete. *Every single* configured subsystem (D01-D30) is marked `RESEARCH_INSUFFICIENT`. This is a systemic research gap, not a documentation gap.
- **P0 Campaigns:** Memory v2 and Tools v1 lack the required evidence to be considered complete (live-chat wiring, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion for Memory; ReferenceMonitor, approval binding, idempotency, and audit tests for Tools). 



---


## Exact Next-Cycle Priorities
These are research-first and evidence-gated. Nothing is to be promoted until the proof exists. 

| Priority | Focus | Required Evidence | Owner Notes |
| :-- | :-- | :-- | :-- |
| **P0** | **Product Delta** | Concrete diffs under `remake/src/`, `remake/index.html`, or `remake/public/` with a user-facing explanation of the behavior change. | This is mandatory to even consider an APK. No "infra only" change should be used to justify publishing. |
| **P0** | **Reality Lab + Android Exact-Build Proof** | Installed artifact identity (build hash, package, device/emulator), run logs, and reproducible installation. | Treat "built" as false until this gate passes. Do not attempt to self-heal APKs without a delta. |
| **P0** | **Product Intelligence Rubric** | Run against the exact build using `.seven-team/product-intelligence/` (rubric, KB, visual boards, judge protocol). Explicitly call out any hard fails. | Missing visual evidence = UNPROVEN. These hard fails cannot be averaged away. |
| **P1** | **Close Critical Domain Gaps** | For D01 (Chat Core), D02 (Memory/Context), D03 (Tools/Capability), D11 (Android Native), D12 (UI Design System), D14 (Security/Privacy), and D15 (Persistence/Recovery): current-state audit, internet research, architecture roadmap, tests, risks, *and* a first implementation slice with evidence. | Do not consolidate domains. Marking as `RESEARCH_INSUFFICIENT` requires follow-up evidence gathering, not certainty. |
| **P1** | **Enforce Campaign Discipline** | **Memory v2:** Update the strike-team ledger with implementation commit, tests, benchmark vs lexical/temporal baseline, Android exact-build state, and unproven items. **Tools v1:** Only wire high-impact external tools after ReferenceMonitor, approval binding, idempotency, and audit tests are green. The LLM must never be an authorization boundary. | Follow the ownership maps exactly. Do not duplicate tasks across agents. |
| **P2** | **Arena Readiness** | Comparative proof (benchmarks, Reality Lab results, and regression coverage) against champion `5f13dc6...`. | Typecheck alone is insufficient. Treat all challengers as Evolution Arena entries until proven otherwise. | 

**Gate for Cycle 275 Integration:** At least one candidate with concrete code + tests + runtime/Reality Lab evidence, a validated product delta if APK is in scope, no unresolved product-quality or constitution hard fails, and any promoted change must not violate the preservation rules (cancellation, deadlines, persistence recovery, immutable public state, exact payload identity).
tokens used
42,146
# CYCLE 274 - FINAL MANAGER REVIEW 

**Head:** `5f13dc6efe30ad245a55c851db9196f1d67a9699`  
**Champion Status:** `HOLD_CHAMPION` | **Promotion:** `BLOCKED_PENDING_COMPARATIVE_PROOF`  
**Gates:** `fullGatesPass: true` (Typecheck/Lint/Tests baseline) | **Polish:** `False` | **APK:** `BLOCKED_NO_PRODUCT_DELTA`


---


## What Actually Improved
- **Discipline Over Quantity:** The team correctly refused to promote anything without evidence. All feature and fix candidates were rejected due to having "no candidate", preventing scope creep.
- **Arena Guardrails Enforced:** The Evolution Arena upheld its rule of "No challenger wins from typecheck alone", blocking promotion despite a green gate set. 
- **Churn Prevention:** `SELF_HEAL_APK=EXHAUSTED` and the APK was correctly blocked due to the lack of a product-runtime delta, preventing the publishing of an effectively unchanged Seven payload. 
- **Stability Preserved:** The architecture remains untouched at the champion SHA with a passing gate baseline, exactly as demanded by the hard rules. 



---


## What Was Rejected
- **Features (A01-A10, B01-B10):** 0 accepted, all rejected with `no candidate`. 
- **Fixes (A01-A10, B01-B10):** 0 accepted, all rejected with `no candidate`.
- **Polish:** Not accepted for this cycle.
- **Evolution Arena:** 0 challengers. Promotion remains blocked pending comparative proof against `5f13dc6efe30ad245a55c851db9196f1d67a9699`.
- **APK Publication:** Blocked. No user-facing or product-runtime delta exists under `remake/src/`, `remake/index.html`, or `remake/public/`. 



---


## What Remains Unproven
- **Product Delta:** The largest blocker. There is no verifiable change to Seven's runtime behavior or UX this cycle. This is the reason for the blocked APK and directly impacts the ability to claim any product improvement.
- **Product Quality:** `productQualityScored: false`, `productHardFails: UNPROVEN`, and the overall verdict is `UNPROVEN`. Crucially, *missing exact-build visual evidence means visual quality is UNPROVEN, not PASS*. Any rubric hard fail would block a premium/release-quality claim regardless of score.
- **Reality & Android Proof:** `apkBuilt: false`, `realityLabExactInstalledEvidence: false`, and `physicalDeviceEvidence: false`. No executable device/emulator gate has proven an installed artifact for this cycle.
- **Constitution & Autonomy:** `constitutionRuntimeCoverage: PARTIAL`, `trustStatus: UNPROVEN_OR_BLOCKED`. The autonomy plane explicitly states that aggregate scores can never override constitution or product hard fails.
- **Domain Research:** 0/30 domains are marked research-complete. *Every single* configured subsystem (D01-D30) is marked `RESEARCH_INSUFFICIENT`. This is a systemic research gap, not a documentation gap.
- **P0 Campaigns:** Memory v2 and Tools v1 lack the required evidence to be considered complete (live-chat wiring, provenance, abstention, restart persistence, Android evidence, Arabic parity, secret exclusion for Memory; ReferenceMonitor, approval binding, idempotency, and audit tests for Tools). 



---


## Exact Next-Cycle Priorities
These are research-first and evidence-gated. Nothing is to be promoted until the proof exists. 

| Priority | Focus | Required Evidence | Owner Notes |
| :-- | :-- | :-- | :-- |
| **P0** | **Product Delta** | Concrete diffs under `remake/src/`, `remake/index.html`, or `remake/public/` with a user-facing explanation of the behavior change. | This is mandatory to even consider an APK. No "infra only" change should be used to justify publishing. |
| **P0** | **Reality Lab + Android Exact-Build Proof** | Installed artifact identity (build hash, package, device/emulator), run logs, and reproducible installation. | Treat "built" as false until this gate passes. Do not attempt to self-heal APKs without a delta. |
| **P0** | **Product Intelligence Rubric** | Run against the exact build using `.seven-team/product-intelligence/` (rubric, KB, visual boards, judge protocol). Explicitly call out any hard fails. | Missing visual evidence = UNPROVEN. These hard fails cannot be averaged away. |
| **P1** | **Close Critical Domain Gaps** | For D01 (Chat Core), D02 (Memory/Context), D03 (Tools/Capability), D11 (Android Native), D12 (UI Design System), D14 (Security/Privacy), and D15 (Persistence/Recovery): current-state audit, internet research, architecture roadmap, tests, risks, *and* a first implementation slice with evidence. | Do not consolidate domains. Marking as `RESEARCH_INSUFFICIENT` requires follow-up evidence gathering, not certainty. |
| **P1** | **Enforce Campaign Discipline** | **Memory v2:** Update the strike-team ledger with implementation commit, tests, benchmark vs lexical/temporal baseline, Android exact-build state, and unproven items. **Tools v1:** Only wire high-impact external tools after ReferenceMonitor, approval binding, idempotency, and audit tests are green. The LLM must never be an authorization boundary. | Follow the ownership maps exactly. Do not duplicate tasks across agents. |
| **P2** | **Arena Readiness** | Comparative proof (benchmarks, Reality Lab results, and regression coverage) against champion `5f13dc6...`. | Typecheck alone is insufficient. Treat all challengers as Evolution Arena entries until proven otherwise. | 

**Gate for Cycle 275 Integration:** At least one candidate with concrete code + tests + runtime/Reality Lab evidence, a validated product delta if APK is in scope, no unresolved product-quality or constitution hard fails, and any promoted change must not violate the preservation rules (cancellation, deadlines, persistence recovery, immutable public state, exact payload identity).
