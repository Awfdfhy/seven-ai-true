# Seven Superloop Cycle 237

Run: 39147751885

## Machine summary

```json
{
  "cycle": 237,
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
  "head": "b6a413956a1860bbc302ccd4516683c597c7dff5",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 237,
    "sourceSha": "b6a413956a1860bbc302ccd4516683c597c7dff5",
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
session id: 01a15068-470d-7951-bd57-7c8909c33234
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


Cycle: 237
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b6a413956a1860bbc302ccd4516683c597c7dff5", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 237, "championSha": "b6a413956a1860bbc302ccd4516683c597c7dff5", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b6a413956a1860bbc302ccd4516683c597c7dff5", "fullGatesPass": true}
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
/bin/bash -lc 'ls -la /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
exec
/bin/bash -lc 'find /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review -maxdepth 3 -type f | head -100' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 2976
drwxr-xr-x 11 runner runner   4096 Oct 18 19:06 .
drwxr-xr-x  3 runner runner   4096 Oct 18 19:06 ..
-rw-r--r--  1 runner runner     92 Oct 18 19:06 .git
drwxr-xr-x  3 runner runner   4096 Oct 18 19:06 .github
-rw-r--r--  1 runner runner     33 Oct 18 19:06 .gitignore
drwxr-xr-x 11 runner runner   4096 Oct 18 19:06 .seven-team
-rw-r--r--  1 runner runner  10204 Oct 18 19:06 DEVELOPMENT_REPORT.md
-rw-r--r--  1 runner runner    559 Oct 18 19:06 PROJECT_MANIFEST.json
-rw-r--r--  1 runner runner    754 Oct 18 19:06 README.md
-rw-r--r--  1 runner runner  10954 Oct 18 19:06 SEVEN_AI_ARCHITECTURE_V4.md
-rw-r--r--  1 runner runner  25280 Oct 18 19:06 SEVEN_AI_FREE_MAX_PLAN.md
-rw-r--r--  1 runner runner   7577 Oct 18 19:06 SEVEN_IMPLEMENTATION_MATRIX.md
-rw-r--r--  1 runner runner   8458 Oct 18 19:06 SEVEN_POLISH_ROADMAP.md
-rw-r--r--  1 runner runner   1170 Oct 18 19:06 all.cjs
drwxr-xr-x  2 runner runner   4096 Oct 18 19:06 apk
-rw-r--r--  1 runner runner    272 Oct 18 19:06 capacitor.config.json
drwxr-xr-x  3 runner runner   4096 Oct 18 19:06 cloudflare
drwxr-xr-x  2 runner runner   4096 Oct 18 19:06 eval
drwxr-xr-x  2 runner runner   4096 Oct 18 19:06 evolution
-rw-r--r--  1 runner runner    137 Oct 18 19:06 memory-results.json
-rw-r--r--  1 runner runner   3261 Oct 18 19:06 memory.cjs
-rw-r--r--  1 runner runner   1350 Oct 18 19:06 package.json
drwxr-xr-x  2 runner runner   4096 Oct 18 19:06 plans
drwxr-xr-x  5 runner runner   4096 Oct 18 19:06 release
drwxr-xr-x  6 runner runner   4096 Oct 18 19:06 remake
-rw-r--r--  1 runner runner   4942 Oct 18 19:06 runtime-smoke.cjs
-rw-r--r--  1 runner runner 842964 Oct 18 19:06 seven_ai-final.html
-rw-r--r--  1 runner runner 620723 Oct 18 19:06 seven_ai-t150.html
-rw-r--r--  1 runner runner 641085 Oct 18 19:06 seven_ai-t152.html
-rw-r--r--  1 runner runner 651222 Oct 18 19:06 seven_ai-t161.html
-rw-r--r--  1 runner runner 122722 Oct 18 19:06 verify.cjs

 succeeded in 0ms:
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/seven_ai-t161.html
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE11_KERNEL_OBSERVABILITY.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/ARCHITECTURE.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE6_DEEP_THINK.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/remake/package-lock.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/package-lock.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE8_GITHUB_SELFDEV.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE10_PRODUCT_POLISH.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE1112_FINAL_MANAGER.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE9_RPG_CANON.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/index.html
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/scratch/bench.mts
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE4_ATTACHMENTS.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/PHASE710_INTEGRATION_REPORT.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/tsconfig.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/vite.config.ts
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/capacitor.config.json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/MILESTONES.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-revi

...[clipped by superloop]...

6->237===" && git diff --stat 2ced2423d1d7ccb3d8f6baaea79e65b1c920e17c b6a413956a1860bbc302ccd4516683c597c7dff5 2>/dev/null | tail -30' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
b6a4139 Superloop cycle 236 manager record
2ced242 Superloop cycle 235 manager record
09ca429 Superloop cycle 234 manager record
fb7bac0 Superloop cycle 233 manager record
d01d4d5 Superloop cycle 232 manager record
c749990 Superloop cycle 231 manager record
855270d Superloop cycle 230 manager record
a015740 Superloop cycle 229 manager record
===diff stat 236->237===
 .../generated/history/cycle-0236.md                | 303 +++++++++
 .../domain-campaign/generated/latest-audit.json    |  76 +--
 .seven-team/superloop-history/cycle-0236.md        | 740 +++++++++++++++++++++
 .seven-team/superloop-state.json                   |  24 +-
 4 files changed, 1093 insertions(+), 50 deletions(-)

2026-10-18T19:08:21.588084Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 420
exec
/bin/bash -lc "grep -l \"RESEARCH_INSUFFICIENT\\|RESEARCH_READY\\|RESEARCH_COMPLETE\\|status\" /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/*.md | head; echo \"===D20 head===\"; head -30 /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D20_PRODUCT_QUALITY.md" in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D01_CHAT_CORE.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D02_MEMORY_CONTEXT.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D03_TOOLS_CAPABILITY.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D04_CODING_SYSTEM.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D05_SELF_DEVELOPMENT.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D06_RPG_WORLD.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D07_RESEARCH_WEB.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D08_MODEL_ROUTING.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D09_DEEP_THINK.md
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/domains/D10_FILES_MULTIMODAL.md
===D20 head===
# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: INSUFFICIENT

DOMAIN_ID=D20_PRODUCT_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.

2026-10-18T19:08:26.201116Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 146
exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated/latest-audit.json 2>/dev/null' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
{
  "schemaVersion": 1,
  "domains": 30,
  "ready": 0,
  "missing": [],
  "insufficient": [
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
  "results": [
    {
      "id": "D01_CHAT_CORE",
      "status": "INSUFFICIENT",
      "urls": 71,
      "primaryTagged": 86,
      "target": 10,
      "owners": [
        "B01",
        "A04"
      ]
    },
    {
      "id": "D02_MEMORY_CONTEXT",
      "status": "INSUFFICIENT",
      "urls": 115,
      "primaryTagged": 215,
      "target": 20,
      "owners": [
        "A06",
        "B08",
        "A04",
        "A08",
        "B09",
        "B10"
      ]
    },
    {
      "id": "D03_TOOLS_CAPABILITY",
      "status": "INSUFFICIENT",
      "urls": 104,
      "primaryTagged": 224,
      "target": 20,
      "owners": [
        "A04",
        "A07",
        "A08",
        "B09",
        "B10",
        "B07"
      ]
    },
    {
      "id": "D04_CODING_SYSTEM",
      "status": "INSUFFICIENT",
      "urls": 30,
      "primaryTagged": 39,
      "target": 12,
      "owners": [
        "B06",
        "A08"
      ]
    },
    {
      "id": "D05_SELF_DEVELOPMENT",
      "status": "INSUFFICIENT",
      "urls": 45,
      "primaryTagged": 90,
      "target": 12,
      "owners": [
        "B06",
        "A10"
      ]
    },
    {
      "id": "D06_RPG_WORLD",
      "status": "INSUFFICIENT",
      "urls": 38,
      "primaryTagged": 42,
      "target": 12,
      "owners": [
        "B05",
        "A06"
      ]
    },
    {
      "id": "D07_RESEARCH_WEB",
      "status": "INSUFFICIENT",
      "urls": 8,
      "primaryTagged": 3,
      "target": 12,
      "owners": [
        "B03",
        "A08"
      ]
    },
    {
      "id": "D08_MODEL_ROUTING",
      "status": "INSUFFICIENT",
      "urls": 50,
      "primaryTagged": 67,
      "target": 10,
      "owners": [
        "A05",
        "A09"
      ]
    },
    {
      "id": "D09_DEEP_THINK",
      "status": "INSUFFICIENT",
      "urls": 43,
      "primaryTagged": 47,
      "target": 10,
      "owners": [
        "B04",
        "A09"
      ]
    },
    {
      "id": "D10_FILES_MULTIMODAL",
      "status": "INSUFFICIENT",
      "urls": 51,
      "primaryTagged": 60,
      "target": 8,
      "owners": [
        "B02",
        "A07"
      ]
    },
    {
      "id": "D11_ANDROID_NATIVE",
      "status": "INSUFFICIENT",
      "urls": 32,
      "primaryTagged": 46,
      "target": 10,
      "owners": [
        "A02",
        "A03"
      ]
    },
    {
      "id": "D12_UI_DESIGN_SYSTEM",
      "status": "INSUFFICIENT",
      "urls": 90,
      "primaryTagged": 122,
      "target": 10,
      "owners": [
        "A01",
        "B10"
      ]
    },
    {
      "id": "D13_ARABIC_RTL_A11Y",
      "status": "INSUFFICIENT",
      "urls": 32,
      "primaryTagged": 61,
      "target": 8,
      "owners": [
        "A03",
        "A01"
      ]
    },
    {
      "id": "D14_SECURITY_PRIVACY",
      "status": "INSUFFICIENT",
      "urls": 69,
      "primaryTagged": 92,
      "target": 12,
      "owners": [
        "A07",
        "A10"
      ]
    },
    {
      "id": "D15_PERSISTENCE_RECOVERY",
      "status": "INSUFFICIENT",
      "urls": 41,
      "primaryTagged": 41,
      "target": 10,
      "owners": [
        "B08",
        "B09"
      ]
    },
    {
      "id": "D16_NETWORK_RESILIENCE",
      "status": "INSUFFICIENT",
      "urls": 59,
      "primaryTagged": 66,
      "target": 8,
      "owners": [
        "B07",
        "A05"
      ]
    },
    {
      "id": "D17_PERFORMANCE_CONCURRENCY",
      "status": "INSUFFICIENT",
      "urls": 43,
      "primaryTagged": 36,
      "target": 10,
      "owners": [
        "A09",
        "B09"
      ]
    },
    {
      "id": "D18_TESTING_EVALS",
      "status": "INSUFFICIENT",
      "urls": 43,
      "primaryTagged": 51,
      "target": 12,
      "owners": [
        "A08",
        "A10"
      ]
    },
    {
      "id": "D19_AGENT_ORCHESTRATION",
      "status": "INSUFFICIENT",
      "urls": 97,
      "primaryTagged": 148,
      "target": 10,
      "owners": [
        "B10",
        "A04"
      ]
    },
    {
      "id": "D20_PRODUCT_QUALITY",
      "status": "INSUFFICIENT",
      "urls": 90,
      "primaryTagged": 122,
      "target": 8,
      "owners": [
        "B10",
        "A01"
      ]
    },
    {
      "id": "D21_OBSERVABILITY_WORLD_MODEL",
      "status": "INSUFFICIENT",
      "urls": 101,
      "primaryTagged": 100,
      "target": 8,
      "owners": [
        "A04",
        "A09"
      ]
    },
    {
      "id": "D22_PROTOCOLS_INTEROP",
      "status": "INSUFFICIENT",
      "urls": 81,
      "primaryTagged": 103,
      "target": 10,
      "owners": [
        "A04",
        "B06"
      ]
    },
    {
      "id": "D23_IMPORT_EXPORT_BACKUP",
      "status": "INSUFFICIENT",
      "urls": 52,
      "primaryTagged": 60,
      "target": 6,
      "owners": [
        "B02",
        "B08"
      ]
    },
    {
      "id": "D24_RELEASE_APK",
      "status": "INSUFFICIENT",
      "urls": 21,
      "primaryTagged": 23,
      "target": 8,
      "owners": [
        "A02",
        "A08"
      ]
    },
    {
      "id": "D25_HISTORY_ROOMS",
      "status": "INSUFFICIENT",
      "urls": 44,
      "primaryTagged": 63,
      "target": 8,
      "owners": [
        "B01",
        "B08"
      ]
    },
    {
      "id": "D26_SETTINGS_CONTROLS",
      "status": "INSUFFICIENT",
      "urls": 45,
      "primaryTagged": 69,
      "target": 6,
      "owners": [
        "A05",
        "A01"
      ]
    },
    {
      "id": "D27_ERROR_RECOVERY_UX",
      "status": "INSUFFICIENT",
      "urls": 90,
      "primaryTagged": 119,
      "target": 8,
      "owners": [
        "B07",
        "B10"
      ]
    },
    {
      "id": "D28_LOCAL_INTELLIGENCE",
      "status": "INSUFFICIENT",
      "urls": 50,
      "primaryTagged": 67,
      "target": 8,
      "owners": [
        "A05",
        "A09"
      ]
    },
    {
      "id": "D29_REAL_WORKS_CANON",
      "status": "INSUFFICIENT",
      "urls": 24,
      "primaryTagged": 19,
      "target": 8,
      "owners": [
        "B05",
        "B03"
      ]
    },
    {
      "id": "D30_AUTONOMOUS_QUALITY",
      "status": "INSUFFICIENT",
      "urls": 93,
      "primaryTagged": 135,
      "target": 12,
      "owners": [
        "A08",
        "B10",
        "A10"
      ]
    }
  ]
}

2026-10-18T19:08:34.759288Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 277
exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/EVALUATION_GATE.md | head -70; echo "===RPG V2==="; head -40 /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
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

===RPG V2===
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


codex

tokens used
759,087
