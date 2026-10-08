# Seven Superloop Cycle 60

Run: 37694976429

## Machine summary

```json
{
  "cycle": 60,
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
  "head": "0bd4c201d9417795da04cbac2ac7c87948a90b1b",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 60,
    "sourceSha": "0bd4c201d9417795da04cbac2ac7c87948a90b1b",
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
OpenAI Codex v0.161.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a118d4-503b-71d2-9742-de7e83f87bf8
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


Cycle: 60
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "0bd4c201d9417795da04cbac2ac7c87948a90b1b", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 60, "championSha": "0bd4c201d9417795da04cbac2ac7c87948a90b1b", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "0bd4c201d9417795da04cbac2ac7c87948a90b1b", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.161.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a118d2-2c60-7f91-9aa8-0fcf852d7291
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

Memory is currently a P0 product campaign. Use .seven-team/memory-v2/RESEARCH_SYNTHESIS.m

...[clipped by superloop]...

rloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A06-persisted-ui-state.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A07-selfdev-security.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A02-android-evidence.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/B08-rpg-evaluation-harness.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/B05-rpg-runtime.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A08-ui-evaluation-harness.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/B01-rpg-ux.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/B06-rpg-memory.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A04-design-system-map.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A01-ui-ownership.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/A10-integration-review.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/B04-rpg-engine-map.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01/B09-rpg-performance.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B10.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B05.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A07.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B03.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B04.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A08.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A04.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B02.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A10.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A03.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B09.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A05.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A09.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A06.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B08.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B07.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B06.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A01.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A02.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B01.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/remake-mega/manifest.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/team.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/PROTOCOL.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/EVALUATION_GATE.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/WAVE01_MANAGER_SUMMARY.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/UI_FOUNDATION_V2.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/WAVE01_MANAGER_SUMMARY.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# Seven Production Wave 01 — Manager Summary

Verified agents: 20/20

Scope: integration of the Wave 01 audit/review evidence package. This does not claim the UI Foundation V2 or RPG V2 implementation itself is finished.

## Evidence
- A01 — Cline — A01-ui-ownership.md — PASS
- A02 — Codex CLI — A02-android-evidence.md — PASS
- A03 — Gemini CLI — A03-localization-cohesion.md — PASS
- A04 — OpenHands — A04-design-system-map.md — PASS
- A05 — OpenCode — A05-runtime-controls.md — PASS
- A06 — Aider — A06-persisted-ui-state.md — PASS
- A07 — Goose — A07-selfdev-security.md — PASS
- A08 — mini-SWE — A08-ui-evaluation-harness.md — PASS
- A09 — Qwen Code — A09-ui-performance.md — PASS
- A10 — Hermes Agent — A10-integration-review.md — PASS
- B01 — Cline — B01-rpg-ux.md — PASS
- B02 — Codex CLI — B02-rpg-android.md — PASS
- B03 — Gemini CLI — B03-canon-grounding.md — PASS
- B04 — OpenHands — B04-rpg-engine-map.md — PASS
- B05 — OpenCode — B05-rpg-runtime.md — PASS
- B06 — Aider — B06-rpg-memory.md — PASS
- B07 — Goose — B07-rpg-integrity.md — PASS
- B08 — mini-SWE — B08-rpg-evaluation-harness.md — PASS
- B09 — Qwen Code — B09-rpg-performance.md — PASS
- B10 — Hermes Agent — B10-integration-review.md — PASS

## Gates
- 18 worker audit reports: PASS
- A10 independent Team A review: PASS
- B10 independent Team B review: PASS
- Cross-team evidence collection: PASS
- Main regression suite: PASS (Seven AI tests #2724 on ccb1b735)

WAVE01_MANAGER=PASS

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# RPG V2 — Product Contract

Classification: REBUILD

## Purpose

RPG mode should make Seven feel like a persistent interactive-story engine. The user should enter a world, interact naturally, see consequences persist, and trust continuity without managing internal data structures.

## Problem statement

The current RPG surface exposes infrastructure-heavy controls such as loading Real Works / Canon JSON packs and manually recording episode/chapter/arc titles. These capabilities can remain as advanced tooling, but they do not constitute a compelling primary RPG experience.

The primary happy path must not require JSON imports, title bookkeeping, or knowledge of internal world/canon engines.

## V2 core promise

Within the first 10 minutes a user should experience:
- a clear world/session start
- at least one memorable character interaction
- a meaningful choice
- a visible consequence
- continuity across several turns
- persistence after leaving and returning
- an interface that stays focused on the story rather than engine controls

## First vertical slice

Build only the smallest slice that can prove the promise:

1. Start RPG.
2. Choose from a simple start flow: continue existing world or start new.
3. New world asks only essential setup; defaults should work.
4. Story begins immediately.
5. One character has explicit state: relationship/knowledge/current intent.
6. One player decision mutates world state.
7. Later narration reflects that mutation.
8. Leave RPG.
9. Re-enter RPG.
10. State and continuity are restored.

Do not expand to elaborate world packs, title systems, lore editors, inventories, combat, or multiple campaigns until this slice passes.

## Primary user flow budget

Fresh user -> meaningful first story turn in <= 3 user-visible actions.

Failure conditions:
- requires importing a JSON pack for the primary flow
- opens with a dense control panel
- story state exists internally but is not perceptible in subsequent narration
- continuity disappears after workspace exit/reopen
- model can silently contradict established state without detection or repair

## State contract

V2 state must distinguish at minimum:
- immutable/declared canon facts
- current world state
- character-local knowledge
- relationship/state variables
- player-authored decisions
- derived summary/context

Every persisted mutation needs provenance sufficient for debugging.

## Canon behavior

Canon is a constraint system, not a UI burden.

The engine must:
- detect contradictions against high-confidence established facts
- distinguish intentional alternate/what-if branches from accidental contradiction
- preserve the user's explicit control over their player character when configured
- never silently promote model invention into immutable canon

## Memory requirements

- continuity must survive at least 20 conversational turns in the evaluation scenario
- leaving/re-entering the workspace must preserve the active session
- restarting the application must preserve the session when persistence is available
- character knowledge must not automatically equal global narrator knowledge

## UX requirements

Primary RPG UI should emphasize:
- world/session identity
- current story
- lightweight state feedback only when useful
- continue/new/exit

Advanced controls such as pack imports, canon debugging, or manual title management must live behind an advanced/debug surface if retained.

## Acceptance scenarios

### RPG-01 Start
Fresh install -> enter RPG -> meaningful story turn within <= 3 actions.

### RPG-02 Consequence
Make a choice that changes a known world variable -> within later turns the narration must reflect the changed state.

### RPG-03 Character knowledge
Reveal information to Character A but not Character B -> B must not act as if they know it unless a valid propagation event occurs.

### RPG-04 Persistence
Exit RPG and return -> active session, recent state, and current scene continuity remain.

### RPG-05 Long continuity
Run 20-turn scripted scenario -> established core facts remain consistent unless intentionally changed.

### RPG-06 Canon conflict
Inject a contradictory candidate fact -> system surfaces/block-repairs the contradiction rather than silently accepting it.

### RPG-07 Mobile UX
Small Android viewport + Arabic RTL + night theme -> story/composer/navigation usable without clipping.

## Performance budget

RPG state projection must not send the entire raw world history on every request. Compile only the relevant bounded context for the next turn.

## Merge gate

Builder: agent/04-research  
Memory/context support: agent/06-memory-context  
Testing: agent/08-testing-ci  
Independent reviewer: agent/10-integration-review

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/superloop-state.json' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
{
  "schemaVersion": 1,
  "enabled": true,
  "lastCompletedCycle": 59,
  "lastCompletedAt": "2026-10-07T23:18:45.616829+00:00",
  "workBranch": "autoloop/seven-24h-work-v6",
  "productBranch": "seven-remake-v3",
  "runId": "37687269756",
  "runNumber": "151",
  "summary": {
    "cycle": 59,
    "featureCandidates": 0,
    "featuresAccepted": 0,
    "fixCandidates": 1,
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
    "head": "be6880652aa3eac0a717223869762eb2e2351571",
    "autonomy": {
      "schemaVersion": 1,
      "cycle": 59,
      "sourceSha": "be6880652aa3eac0a717223869762eb2e2351571",
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

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/memory-v2/RESEARCH_SYNTHESIS.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 exited 1 in 0ms:
cat: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/memory-v2/RESEARCH_SYNTHESIS.md: No such file or directory

exec
/bin/bash -lc 'ls -la /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/memory-v2/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 exited 2 in 0ms:
ls: cannot access '/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/memory-v2/': No such file or directory

exec
/bin/bash -lc 'find /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team -type d -name "memory*" 2>/dev/null' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
codex

tokens used
195,405
