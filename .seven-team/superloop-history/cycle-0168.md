# Seven Superloop Cycle 168

Run: 38402464646

## Machine summary

```json
{
  "cycle": 168,
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
  "head": "92c00b236ed869ca5d1af924e8714648999519eb",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 168,
    "sourceSha": "92c00b236ed869ca5d1af924e8714648999519eb",
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
session id: 01a1359d-0b03-7181-968c-2cbcf99d3b43
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


Cycle: 168
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "92c00b236ed869ca5d1af924e8714648999519eb", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 168, "championSha": "92c00b236ed869ca5d1af924e8714648999519eb", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "92c00b236ed869ca5d1af924e8714648999519eb", "fullGatesPass": true}
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
session id: 01a1359c-9c8c-7332-8250-35b810efad06
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

ch file or directory

 exited 1 in 0ms:
cat: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality/.seven-team/product-intelligence/JUDGE_PROTOCOL.md: No such file or directory

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/c168-explore-A01/.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
 exited 1 in 0ms:
cat: /home/runner/work/_temp/seven-superloop-worktrees/c168-explore-A01/.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json: No such file or directory

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-compatibility/.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
 exited 1 in 0ms:
cat: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-compatibility/.seven-team/product-intelligence/PRODUCT_QUALITY_RUBRIC.json: No such file or directory

codex

tokens used
72,256



Summarize what actually improved, what the team rejected, what remains unproven, and exact next-cycle
research priorities. Do not call missing evidence PASS.

Return a concrete manager deliverable. Do not modify files, commit, or push.

warning: Model metadata for `kilo-auto/free` not found. Defaulting to fallback metadata; this can degrade performance and cause issues.
exec
/bin/bash -lc 'ls -la /home/runner/work/_temp/seven-superloop-worktrees/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 12
drwxr-xr-x  3 runner runner 4096 Oct 13 14:14 .
drwxr-xr-x  7 runner runner 4096 Oct 13 13:48 ..
drwxr-xr-x 11 runner runner 4096 Oct 13 14:14 m-manager-final-review

exec
/bin/bash -lc 'find /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review -name "PRODUCT_QUALITY_RUBRIC.json" -o -name "JUDGE_PROTOCOL.md" -o -name "VISUAL_REFERENCE_CATALOG.json" -o -name "PRODUCT_KNOWLEDGE_BASE.md" 2>/dev/null' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
exec
/bin/bash -lc 'ls -la /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 2976
drwxr-xr-x 11 runner runner   4096 Oct 13 14:14 .
drwxr-xr-x  3 runner runner   4096 Oct 13 14:14 ..
-rw-r--r--  1 runner runner     92 Oct 13 14:14 .git
drwxr-xr-x  3 runner runner   4096 Oct 13 14:14 .github
-rw-r--r--  1 runner runner     33 Oct 13 14:14 .gitignore
drwxr-xr-x 11 runner runner   4096 Oct 13 14:14 .seven-team
-rw-r--r--  1 runner runner  10204 Oct 13 14:14 DEVELOPMENT_REPORT.md
-rw-r--r--  1 runner runner    559 Oct 13 14:14 PROJECT_MANIFEST.json
-rw-r--r--  1 runner runner    754 Oct 13 14:14 README.md
-rw-r--r--  1 runner runner  10954 Oct 13 14:14 SEVEN_AI_ARCHITECTURE_V4.md
-rw-r--r--  1 runner runner  25280 Oct 13 14:14 SEVEN_AI_FREE_MAX_PLAN.md
-rw-r--r--  1 runner runner   7577 Oct 13 14:14 SEVEN_IMPLEMENTATION_MATRIX.md
-rw-r--r--  1 runner runner   8458 Oct 13 14:14 SEVEN_POLISH_ROADMAP.md
-rw-r--r--  1 runner runner   1170 Oct 13 14:14 all.cjs
drwxr-xr-x  2 runner runner   4096 Oct 13 14:14 apk
-rw-r--r--  1 runner runner    272 Oct 13 14:14 capacitor.config.json
drwxr-xr-x  3 runner runner   4096 Oct 13 14:14 cloudflare
drwxr-xr-x  2 runner runner   4096 Oct 13 14:14 eval
drwxr-xr-x  2 runner runner   4096 Oct 13 14:14 evolution
-rw-r--r--  1 runner runner    137 Oct 13 14:14 memory-results.json
-rw-r--r--  1 runner runner   3261 Oct 13 14:14 memory.cjs
-rw-r--r--  1 runner runner   1350 Oct 13 14:14 package.json
drwxr-xr-x  2 runner runner   4096 Oct 13 14:14 plans
drwxr-xr-x  5 runner runner   4096 Oct 13 14:14 release
drwxr-xr-x  6 runner runner   4096 Oct 13 14:14 remake
-rw-r--r--  1 runner runner   4942 Oct 13 14:14 runtime-smoke.cjs
-rw-r--r--  1 runner runner 842964 Oct 13 14:14 seven_ai-final.html
-rw-r--r--  1 runner runner 620723 Oct 13 14:14 seven_ai-t150.html
-rw-r--r--  1 runner runner 641085 Oct 13 14:14 seven_ai-t152.html
-rw-r--r--  1 runner runner 651222 Oct 13 14:14 seven_ai-t161.html
-rw-r--r--  1 runner runner 122722 Oct 13 14:14 verify.cjs

exec
/bin/bash -lc 'ls -la /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 76
drwxr-xr-x 11 runner runner 4096 Oct 13 14:14 .
drwxr-xr-x 11 runner runner 4096 Oct 13 14:14 ..
-rw-r--r--  1 runner runner 1560 Oct 13 14:14 PROTOCOL.md
-rw-r--r--  1 runner runner 2434 Oct 13 14:14 TWO_TEAM_PROTOCOL.md
drwxr-xr-x  2 runner runner 4096 Oct 13 14:14 bughunt
drwxr-xr-x  2 runner runner 4096 Oct 13 14:14 cohesion
drwxr-xr-x  3 runner runner 4096 Oct 13 14:14 domain-campaign
-rw-r--r--  1 runner runner  923 Oct 13 14:14 ownership.json
drwxr-xr-x  5 runner runner 4096 Oct 13 14:14 prompts
-rw-r--r--  1 runner runner 3437 Oct 13 14:14 readiness.json
drwxr-xr-x  2 runner runner 4096 Oct 13 14:14 remake-mega
drwxr-xr-x  2 runner runner 4096 Oct 13 14:14 remake-super
drwxr-xr-x  4 runner runner 4096 Oct 13 14:14 reports
drwxr-xr-x  2 runner runner 4096 Oct 13 14:14 runtime
drwxr-xr-x  2 runner runner 4096 Oct 13 14:14 superloop-history
-rw-r--r--  1 runner runner 2608 Oct 13 14:14 superloop-state.json
-rw-r--r--  1 runner runner 8019 Oct 13 14:14 team.json
-rw-r--r--  1 runner runner 3033 Oct 13 14:14 wave-01-manifest.json

exec
/bin/bash -lc 'ls -la /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 268
drwxr-xr-x  6 runner runner   4096 Oct 13 14:14 .
drwxr-xr-x 11 runner runner   4096 Oct 13 14:14 ..
drwxr-xr-x  3 runner runner   4096 Oct 13 14:14 .vitest
-rw-r--r--  1 runner runner   6861 Oct 13 14:14 ARCHITECTURE.md
-rw-r--r--  1 runner runner   1538 Oct 13 14:14 FINAL_RELEASE_STATUS.md
-rw-r--r--  1 runner runner  12917 Oct 13 14:14 MILESTONES.md
-rw-r--r--  1 runner runner   1069 Oct 13 14:14 PHASE10_PRODUCT_POLISH.md
-rw-r--r--  1 runner runner   2448 Oct 13 14:14 PHASE1112_FINAL_MANAGER.md
-rw-r--r--  1 runner runner   1121 Oct 13 14:14 PHASE11_KERNEL_OBSERVABILITY.md
-rw-r--r--  1 runner runner   1159 Oct 13 14:14 PHASE12_RELEASE_CLOSURE.md
-rw-r--r--  1 runner runner   3102 Oct 13 14:14 PHASE3_HARDENING_REPORT.md
-rw-r--r--  1 runner runner   2048 Oct 13 14:14 PHASE3_MEMORY_CONTEXT.md
-rw-r--r--  1 runner runner   1756 Oct 13 14:14 PHASE456_INTEGRATION_REPORT.md
-rw-r--r--  1 runner runner    613 Oct 13 14:14 PHASE4_ATTACHMENTS.md
-rw-r--r--  1 runner runner    739 Oct 13 14:14 PHASE5_RESEARCH.md
-rw-r--r--  1 runner runner    772 Oct 13 14:14 PHASE6_DEEP_THINK.md
-rw-r--r--  1 runner runner   2272 Oct 13 14:14 PHASE710_INTEGRATION_REPORT.md
-rw-r--r--  1 runner runner    983 Oct 13 14:14 PHASE7_ANDROID_BRIDGE.md
-rw-r--r--  1 runner runner    983 Oct 13 14:14 PHASE8_GITHUB_SELFDEV.md
-rw-r--r--  1 runner runner    914 Oct 13 14:14 PHASE9_RPG_CANON.md
-rw-r--r--  1 runner runner   1502 Oct 13 14:14 README.md
-rw-r--r--  1 runner runner   7659 Oct 13 14:14 ZERO_BUG_CLOSURE_REPORT.md
-rw-r--r--  1 runner runner    282 Oct 13 14:14 capacitor.config.json
-rw-r--r--  1 runner runner    382 Oct 13 14:14 index.html
-rw-r--r--  1 runner runner 129927 Oct 13 14:14 package-lock.json
-rw-r--r--  1 runner runner   1117 Oct 13 14:14 package.json
drwxr-xr-x  2 runner runner   4096 Oct 13 14:14 remake
drwxr-xr-x  2 runner runner   4096 Oct 13 14:14 scratch
drwxr-xr-x 17 runner runner   4096 Oct 13 14:14 src
-rw-r--r--  1 runner runner    603 Oct 13 14:14 tsconfig.json
-rw-r--r--  1 runner runner    200 Oct 13 14:14 vite.config.ts
-rw-r--r--  1 runner runner      0 Oct 13 14:14 vitest.log

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/ARCHITECTURE.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# Seven Remake V3 — Architecture Blueprint

## 1. Product architecture

Seven is rebuilt as five layers with strict dependency direction:

```
UI
↓
Application Services
↓
Domain/Core
↓
Ports / Contracts
↓
Adapters (Web, Android, Providers, Storage)
```

The UI never calls a provider, IndexedDB, Capacitor plugin or GitHub API directly.

## 2. Runtime ownership

### AppKernel
The single composition root. Creates services exactly once and owns boot/shutdown.

### TaskManager
The only owner of active AI/research/file/GitHub tasks.

Task state:
`idle → starting → running → cancelling → cancelled | succeeded | failed`

Each task has:
- immutable `taskId`
- `AbortController`
- deadline
- task type
- room/workspace ownership
- structured error/result

No UI code directly manipulates an AbortController.

### ShellStore
The single source of truth for:
- active workspace
- sidebar state
- dialog state
- locale/direction
- theme preference
- viewport/keyboard state

There is no second shell implementation.

### ThemeService
Exactly one scheduler. Reconciles on:
- preference change
- visibility/resume
- clock boundary

It owns exactly one timer generation at a time.

## 3. Chat domain

### Room
Persistent aggregate:
- roomId
- title
- messages
- model preference
- mode preference
- context settings
- createdAt / updatedAt
- schemaVersion

### Message
Immutable once committed. Streaming text lives in a transient draft until finalized.

This prevents half-written assistant messages from corrupting room history.

### Composer
One controller owns:
- text
- IME composition lock
- attachments
- send eligibility
- auto-grow measurement request

Enter-to-send is disabled while composition is active.

## 4. AI runtime

### ProviderAdapter contract
Every provider implements the same interface:
- listModels
- complete
- stream
- normalizeError
- capabilities

Provider payload shaping is isolated per adapter.

### ModelRouter
Pure decision engine. Given:
- requested mode
- user model preference
- available providers/models
- health/cooldown state
- context budget

returns an explicit route plan.

### Deep Think
Two-pass orchestration is a service, not a UI patch.

Invariant:
- exactly one leading system message after final context shaping
- final payload is revalidated before provider dispatch

### Cancellation
All provider calls receive the TaskManager signal.
Android/native operations use a bridge cancellation token mapped to the same taskId.

## 5. Persistence

### StorageEngine contract
Supports:
- transaction
- get/put/delete
- atomic migration
- integrity metadata
- export/import

Persistent domains:
- rooms
- memory
- settings
- provider health
- research cache
- RPG/canon
- GitHub connection metadata (never plaintext secrets)

### Migration protocol

`read old → validate → write new temp → verify → commit → delete old`

A failed migration must leave the previous version recoverable.

### Recovery
Boot never leaves the document globally inert.
Storage failure transitions the app into an interactive recovery screen.

## 6. Android

Capacitor is an adapter layer only.

JS/native communication uses typed request/response envelopes:

```ts
type BridgeRequest<T> = {
  requestId: string;
  method: string;
  payload: T;
};

type BridgeResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: BridgeError };
```

Contract tests run both:
- JS mock bridge tests
- Android instrumented round-trip tests

SAF URI grants, GitHub native operations and file access are lifecycle-managed services.

## 7. Research

Citation schema must include:
- canonical URL
- title
- snippet/evidence
- retrievedAt
- publishedAt when known
- contentHash
- source/provider metadata

Research synthesis cannot silently convert network failure into “no evidence”.

## 8. Attachments

Single-flight runtime loader.
One ingestion pipeline:
- size budget
- MIME + content sniff validation
- explicit parse errors
- task cancellation
- attachment persistence policy

No wrapper-patching of `sendMessage`.

## 9. GitHub Self-Dev

GitHub auth lives behind `GitHubAuthService`.
Token refresh is single-flight with expiry skew.
Concurrent callers share one refresh promise.

UI observes connection state; it never caches token truth independently.

## 10. RPG / Canon

RPG is a first-class persistent domain.

Canonical snapshot includes:
- pack identity/version
- world session
- canon session
- branches
- titles
- relationships/state
- revision/checksum

Snapshots returned to UI are immutable copies.

## 11. UI

React + TypeScript.

Rules:
- components render state and emit intents
- no direct DOM mutation except dedicated measurement/focus hooks
- no inline JS event handlers
- one composer sizing hook
- RTL is derived from locale at the shell root
- accessibility state is part of component contracts

## 12. Testing pyramid

### Unit
Pure domain/state/router/migration tests.

### Contract
Provider payloads, storage adapters, JS/native bridge schemas.

### Integration
Boot, send, stop, persistence, restart, recovery.

### Android instrumented
WebView bridge, SAF, process recreation, keyboard/IME.

### E2E
Critical user journeys.

## 13. Release gates

A build cannot be called release-ready until:

1. TypeScript strict compile passes.
2. Unit + contract + integration tests pass.
3. Android bridge tests pass.
4. Built APK payload hashes are recorded.
5. Installed APK payload identity is checked.
6. Installed APK smoke test passes.
7. No BLOCKER/CRITICAL regression is open.

## 14. Implementation order

### Foundation
Kernel, errors, events, task manager, storage contracts, tests.

### Vertical Slice 1
Rooms + composer + one mock/provider adapter + streaming + stop + persistence.

### Vertical Slice 2
Model routing + provider health/fallback.

### Vertical Slice 3
Memory + context.

### Vertical Slice 4
Attachments.

### Vertical Slice 5
Research + citations.

### Vertical Slice 6
Deep Think.

### Vertical Slice 7
Android native bridge.

### Vertical Slice 8
GitHub Self-Dev.

### Vertical Slice 9
RPG / Canon.

### Vertical Slice 10 — Product Polish
Themes, RTL, accessibility, animation, performance.

### Vertical Slice 11 — AppKernel + Recovery + Observability
One composition root owns boot/shutdown, deterministic dependency order, rollback/retry recovery and bounded privacy-safe diagnostics. The normal React path receives an injected runtime rather than creating alternate owners.

### Vertical Slice 12 — Release Assurance + Final Closure
Deterministic payload identity, explicit release evidence gates, installed-artifact identity verification and evidence-bearing final closure. Missing device/artifact proof remains INCONCLUSIVE rather than being converted into PASS.

The old Seven feature set is ported only after the equivalent new subsystem passes its contract suite.

codex

tokens used
76,440
