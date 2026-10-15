# Seven Superloop Cycle 188

Run: 38733610329

## Machine summary

```json
{
  "cycle": 188,
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
  "head": "ecb19b999f2f31efe05bdb9dd022637ce88b942f",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 188,
    "sourceSha": "ecb19b999f2f31efe05bdb9dd022637ce88b942f",
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
session id: 01a13fd5-851e-7b60-b0a2-41673298c4f1
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


Cycle: 188
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "ecb19b999f2f31efe05bdb9dd022637ce88b942f", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 188, "championSha": "ecb19b999f2f31efe05bdb9dd022637ce88b942f", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "ecb19b999f2f31efe05bdb9dd022637ce88b942f", "fullGatesPass": true}
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
session id: 01a13fd2-b83d-7e12-9621-08b0fc6eb0e9
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

orities.


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

--r--  1 runner runner    754 Oct 15 12:18 README.md
-rw-r--r--  1 runner runner  10954 Oct 15 12:18 SEVEN_AI_ARCHITECTURE_V4.md
-rw-r--r--  1 runner runner  25280 Oct 15 12:18 SEVEN_AI_FREE_MAX_PLAN.md
-rw-r--r--  1 runner runner   7577 Oct 15 12:18 SEVEN_IMPLEMENTATION_MATRIX.md
-rw-r--r--  1 runner runner   8458 Oct 15 12:18 SEVEN_POLISH_ROADMAP.md
-rw-r--r--  1 runner runner   1170 Oct 15 12:18 all.cjs
drwxr-xr-x  2 runner runner   4096 Oct 15 12:18 apk
-rw-r--r--  1 runner runner    272 Oct 15 12:18 capacitor.config.json
drwxr-xr-x  3 runner runner   4096 Oct 15 12:18 cloudflare
drwxr-xr-x  2 runner runner   4096 Oct 15 12:18 eval
drwxr-xr-x  2 runner runner   4096 Oct 15 12:18 evolution
-rw-r--r--  1 runner runner    137 Oct 15 12:18 memory-results.json
-rw-r--r--  1 runner runner   3261 Oct 15 12:18 memory.cjs
-rw-r--r--  1 runner runner   1350 Oct 15 12:18 package.json
drwxr-xr-x  2 runner runner   4096 Oct 15 12:18 plans
drwxr-xr-x  5 runner runner   4096 Oct 15 12:18 release
drwxr-xr-x  8 runner runner   4096 Oct 15 12:36 remake
-rw-r--r--  1 runner runner   4942 Oct 15 12:18 runtime-smoke.cjs
-rw-r--r--  1 runner runner 842964 Oct 15 12:18 seven_ai-final.html
-rw-r--r--  1 runner runner 620723 Oct 15 12:18 seven_ai-t150.html
-rw-r--r--  1 runner runner 641085 Oct 15 12:18 seven_ai-t152.html
-rw-r--r--  1 runner runner 651222 Oct 15 12:18 seven_ai-t161.html
-rw-r--r--  1 runner runner 122722 Oct 15 12:18 verify.cjs
===git===
37d4511 Superloop cycle 186 manager record
4f7d0c9 Superloop cycle 185 manager record
3c8d188 Superloop cycle 184 manager record
a68799e Superloop cycle 183 manager record
b3ae4f5 Superloop cycle 182 manager record
ad333c7 Superloop cycle 181 manager record
672575b Superloop cycle 180 manager record
0215edc Superloop cycle 179 manager record
7368779 Superloop cycle 178 manager record
54d3eca Superloop cycle 177 manager record
* (no branch)
+ autoloop/seven-24h-work-v6
  main
  remotes/origin/agent-b/01-rpg-ux
  remotes/origin/agent-b/02-android-rpg
  remotes/origin/agent-b/03-canon-retrieval
  remotes/origin/agent-b/04-rpg-engine
  remotes/origin/agent-b/05-rpg-runtime
  remotes/origin/agent-b/06-rpg-memory
  remotes/origin/agent-b/07-rpg-integrity

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality && find .seven-team -type f | head -60; echo "===count==="; find .seven-team -type f | wc -l' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
 succeeded in 0ms:
.seven-team/TWO_TEAM_PROTOCOL.md
.seven-team/wave-01-manifest.json
.seven-team/superloop-state.json
.seven-team/reports/wave-01/B02-rpg-android.md
.seven-team/reports/wave-01/A03-localization-cohesion.md
.seven-team/reports/wave-01/B03-canon-grounding.md
.seven-team/reports/wave-01/B10-integration-review.md
.seven-team/reports/wave-01/A09-ui-performance.md
.seven-team/reports/wave-01/B07-rpg-integrity.md
.seven-team/reports/wave-01/A05-runtime-controls.md
.seven-team/reports/wave-01/A06-persisted-ui-state.md
.seven-team/reports/wave-01/A07-selfdev-security.md
.seven-team/reports/wave-01/A02-android-evidence.md
.seven-team/reports/wave-01/B08-rpg-evaluation-harness.md
.seven-team/reports/wave-01/B05-rpg-runtime.md
.seven-team/reports/wave-01/A08-ui-evaluation-harness.md
.seven-team/reports/wave-01/B01-rpg-ux.md
.seven-team/reports/wave-01/B06-rpg-memory.md
.seven-team/reports/wave-01/A04-design-system-map.md
.seven-team/reports/wave-01/A01-ui-ownership.md
.seven-team/reports/wave-01/A10-integration-review.md
.seven-team/reports/wave-01/B04-rpg-engine-map.md
.seven-team/reports/wave-01/B09-rpg-performance.md
.seven-team/reports/bughunt/B10.md
.seven-team/reports/bughunt/B05.md
.seven-team/reports/bughunt/A07.md
.seven-team/reports/bughunt/B03.md
.seven-team/reports/bughunt/B04.md

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && git status --short | head -30; echo "=== remake ==="; find remake -maxdepth 2 -type f | head -40; echo "=== tests ==="; ls tests 2>/dev/null; ls *.cjs' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
=== remake ===
remake/PHASE11_KERNEL_OBSERVABILITY.md
remake/ARCHITECTURE.md
remake/PHASE6_DEEP_THINK.md
remake/remake/package-lock.json
remake/package-lock.json
remake/PHASE8_GITHUB_SELFDEV.md
remake/PHASE10_PRODUCT_POLISH.md
remake/PHASE1112_FINAL_MANAGER.md
remake/PHASE9_RPG_CANON.md
remake/index.html
remake/scratch/bench.mts
remake/PHASE4_ATTACHMENTS.md
remake/PHASE710_INTEGRATION_REPORT.md
remake/tsconfig.json
remake/vite.config.ts
remake/capacitor.config.json
remake/MILESTONES.md
remake/ZERO_BUG_CLOSURE_REPORT.md
remake/src/main.tsx
remake/PHASE3_HARDENING_REPORT.md
remake/README.md
remake/PHASE5_RESEARCH.md
remake/PHASE12_RELEASE_CLOSURE.md
remake/PHASE3_MEMORY_CONTEXT.md
remake/package.json
remake/PHASE456_INTEGRATION_REPORT.md
remake/PHASE7_ANDROID_BRIDGE.md
remake/FINAL_RELEASE_STATUS.md
remake/vitest.log
=== tests ===
all.cjs
memory.cjs
runtime-smoke.cjs
verify.cjs

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && cat .seven-team/cohesion/UI_FOUNDATION_V2.md .seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md 2>&1 | head -150' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# UI Foundation V2 — Product Contract

Classification: REBUILD

## Purpose

Seven should feel like one application, not a collection of independently styled workspaces. The visual system must remain coherent across chat, settings, search, research, coding, RPG, Self-Dev, Arabic RTL, day/night themes, and Android WebView.

## Non-goals

- No decorative redesign for its own sake.
- No new feature surfaces during this contract.
- No additional patch layer whose only purpose is overriding previous patch layers.

## Current problems to eliminate

The current release contains overlapping style layers including:
- seven-final.css
- ui-hardening.css
- seven-shell.css
- seven-shell-final.css
- ui-polish-fixes.css
- hub.css
- workspace-specific embedded styles

The rebuild must reduce specificity debt and establish explicit ownership of shared components.

## Design-system contract

One canonical token layer must define:
- typography scale
- spacing scale
- radius scale
- elevation/border treatment
- surfaces and text hierarchy
- action states
- dialog/menu geometry
- navigation
- composer
- cards
- fields
- responsive breakpoints
- motion/reduced-motion behavior
- safe-area behavior
- RTL mirroring rules

Shared components must consume tokens rather than invent per-workspace values.

## Primary success scenarios

1. Fresh install -> user immediately understands where chat, models, modes, settings, and workspaces live.
2. Switch day/night -> every visible surface updates consistently.
3. Switch English/Arabic -> layout remains usable, aligned, and localized.
4. Open model/mode/search/settings dialogs on the smallest phone -> no clipping or offscreen controls.
5. Switch Chat -> Research -> Coding -> RPG -> the application identity remains consistent.
6. Increase font scale and rotate to landscape -> composer/navigation remain usable.
7. Long messages, code, URLs, and many rooms -> no document-level horizontal expansion.

## Hard acceptance criteria

- zero document horizontal overflow in supported viewport matrix
- no visible unlocalized control in Arabic test scenarios
- no workspace may define a parallel global modal/navigation system without review
- no new !important declarations unless documented with a structural reason
- shared navigation has an explicit responsive layout for all current buttons
- all major surfaces have Android WebView screenshots in day/night and at least one RTL case
- accidental golden-screen drift blocks merge readiness

## Migration strategy

1. Inventory shared selectors and conflicting ownership.
2. Establish tokens and canonical components.
3. Migrate one surface at a time.
4. Delete superseded overrides after each migration.
5. Keep screenshot evidence after every migration.
6. Do not perform a blind all-at-once CSS rewrite.

## Performance budget

- no meaningful startup regression from the design system
- no interval-based layout polling for static UI
- avoid repeated full-DOM scans when mutation-scoped updates are sufficient
- keep interactions responsive on Android WebView

## Merge gate

Builder: agent/01-ui-ux  
Testing: agent/08-testing-ci  
Independent reviewer: agent/10-integration-review
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

codex

tokens used
482,411
