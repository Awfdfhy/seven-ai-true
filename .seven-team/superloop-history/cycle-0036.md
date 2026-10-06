# Seven Superloop Cycle 36

Run: 37473829548

## Machine summary

```json
{
  "cycle": 36,
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
  "head": "94055e20886c8ad5bc13d62752e125bfaeb5c6fc",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 36,
    "sourceSha": "94055e20886c8ad5bc13d62752e125bfaeb5c6fc",
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
OpenAI Codex v0.160.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a111cb-1928-7c51-bd37-3135f335c986
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


Cycle: 36
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "94055e20886c8ad5bc13d62752e125bfaeb5c6fc", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 36, "championSha": "94055e20886c8ad5bc13d62752e125bfaeb5c6fc", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "94055e20886c8ad5bc13d62752e125bfaeb5c6fc", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.160.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a111c9-cf7c-76d2-831b-f99eac8f520c
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
Primary architecture/security owners: A04+A07. Verification A08, race/replay B09, 

...[clipped by superloop]...

superloop-worktrees/m-manager-product-quality/.seven-team/reports/wave-01/B09-rpg-performance.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B10.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B05.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A07.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B03.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B04.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A08.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A04.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B02.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A10.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A03.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B09.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A05.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A09.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A06.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B08.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B07.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B06.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A01.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/A02.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/reports/bughunt/B01.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/remake-mega/manifest.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/team.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/PROTOCOL.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/cohesion/EVALUATION_GATE.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/cohesion/WAVE01_MANAGER_SUMMARY.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/cohesion/UI_FOUNDATION_V2.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/cohesion/EVALUATION_GATE.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
 succeeded in 0ms:
# Seven Evaluation Gate

## Principle

Tests must answer "does the product work as intended for a person?" rather than only "does a function return the expected value?"

## Gate A — Functional

Required:
- no uncaught runtime errors in the target flow
- persistence survives close/reopen when the contract requires it
- Stop/cancel affects only the intended operation
- no horizontal overflow at supported mobile widths
- RTL and day/night themes remain functional
- Android WebView smoke passes for the target surface

## Gate B — Experience

Each feature must have scenario tests with an explicit user goal and maximum friction budget.

Example form:

- Goal: start a new RPG session.
- Starting state: fresh install, no imported packs.
- Expected: first meaningful story turn in <= 3 user-visible actions.
- Failure: requires knowledge of JSON packs, hidden setup, or unexplained control panels.

Experience evidence can be automated where deterministic and manually reviewed where visual/semantic judgment is required.

## Gate C — Integration

A feature must:
- use shared navigation conventions
- use shared design tokens/components
- support Arabic/RTL where the rest of Seven does
- obey common persistence and model-routing rules
- avoid introducing a parallel settings or modal system unless explicitly approved
- not duplicate an existing control surface

## Gate D — Evidence

Required artifacts for merge readiness:
- relevant automated test output
- Android WebView screenshot set for UI-affecting changes
- a short before/after behavior note
- known limitations
- independent reviewer verdict: READY / CHANGES REQUIRED

## Golden screens

Maintain reference coverage for:
- Chat
- Sidebar
- Model picker
- Mode/depth dialogs
- Search
- Research
- Coding
- RPG
- Settings tabs
- Attachments
- Arabic RTL
- Day/night
- smallest supported phone width
- landscape / increased font scale

Visual changes must be intentional and reviewed; accidental drift is a regression.

## Anti-patterns that fail the gate

- "The button exists" as proof of usefulness.
- Adding more CSS overrides to hide a structural layout problem.
- A feature requiring manual internal-format imports for its primary happy path.
- The same agent implementing and self-approving a major feature.
- Declaring success while CI only proves unit-level behavior.

exec
/bin/bash -lc 'find /home/runner/work/_temp/seven-superloop-worktrees -name "PRODUCT_QUALITY_RUBRIC.json" 2>/dev/null' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
 succeeded in 0ms:
codex

tokens used
134,028



Summarize what actually improved, what the team rejected, what remains unproven, and exact next-cycle
research priorities. Do not call missing evidence PASS.

Return a concrete manager deliverable. Do not modify files, commit, or push.

warning: Model metadata for `kilo-auto/free` not found. Defaulting to fallback metadata; this can degrade performance and cause issues.
2026-10-06T15:18:11.161437Z ERROR codex_core::tools::router: error=`justification` requires an explicit `sandbox_permissions`; use `sandbox_permissions: "require_escalated"` for unsandboxed execution, or omit `justification`.
codex

tokens used
11,447
