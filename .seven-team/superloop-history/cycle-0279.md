# Seven Superloop Cycle 279

Run: 39497504588

## Machine summary

```json
{
  "cycle": 279,
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
  "head": "b37de5b3a6b9d0221b11926532857e90f2d1dfd2",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 279,
    "sourceSha": "b37de5b3a6b9d0221b11926532857e90f2d1dfd2",
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
session id: 01a15b95-3e69-7602-8c1d-8f159e3e2a42
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


Cycle: 279
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b37de5b3a6b9d0221b11926532857e90f2d1dfd2", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 279, "championSha": "b37de5b3a6b9d0221b11926532857e90f2d1dfd2", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b37de5b3a6b9d0221b11926532857e90f2d1dfd2", "fullGatesPass": true}
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
session id: 01a15b94-56c3-7600-93d8-6e29e1d5d1fe
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

d
- tests run
- failures / risks
- commit SHA
- dependencies / blockers

## Merge gate

A change is merge-ready only when:

1. the worker branch has a concrete commit;
2. relevant tests pass;
3. agent/10-integration-review has reviewed the diff;
4. no active worker owns conflicting files;
5. the manager has a clear rollback point.

## Runtime phases

- Phase A — compatibility: prove every selected project is still reachable/installable.
- Phase B — binary smoke: install each CLI and run a non-model `--version` / `--help` probe.
- Phase C — provider/auth wiring: configure model access without committing secrets.
- Phase D — live parallel run: start isolated sessions/worktrees for all workers.
- Phase E — production loop: task -> branch -> tests -> review -> integration.

## Current blocker boundary

GitHub branches alone do not execute LLM agents. Live execution requires a runtime host plus model authentication or a compatible local/provider endpoint. The repository stores no credentials.
===TWO===
# Seven AI — Two-Team / 20-Agent Protocol

Status: ACTIVE STRUCTURE  
Topology: 2 teams × 10 agents  
Manager: ChatGPT (coordination and information relay only)

## Team A — Interface & Product Cohesion

Primary mission: UI Foundation V2 and cross-workspace coherence.

Team A owns the visual/product migration stream. It may inspect every workspace, but implementation ownership is limited to shared UI foundation, navigation, dialogs, settings presentation, responsive behavior, localization/RTL presentation, and Android visual evidence.

## Team B — RPG & Stateful Experience

Primary mission: RPG V2 10-minute vertical slice.

Team B owns RPG-specific experience, world/canon runtime integration, character-local knowledge, RPG persistence, RPG scenario tests, RPG context budgets, and RPG review.

## Why two teams instead of twenty agents in one pool

Parallelism only helps when work is separable. Two independently reviewed streams let Seven advance on UI and RPG at the same time without turning shared files into a merge-conflict queue.

## Hard cross-team rule

No file may be actively edited by both teams at the same time.

Shared-core files require a manager lease recorded in `.seven-team/ownership.json`.

If Team B needs a shared UI change:
1. Team B reports the requirement.
2. Manager assigns the shared file to Team A or explicitly leases it to Team B.
3. The other team stays read-only on that file until the lease closes.

If Team A needs RPG runtime behavior, the same rule applies in reverse.

## Parallel merge model

Team A worker -> Team A tests -> Team A reviewer (A10)  
Team B worker -> Team B tests -> Team B reviewer (B10)

Only reviewed commits become integration candidates. The manager compares both candidate sets before any main merge.

## Speed objective

The target is not "2× more code". The target is close to 2× throughput on independent work while keeping defect and conflict rates flat or lower.

## Current streams

- Team A: UI Foundation V2 (#49) + UI portion of evaluation harness (#51)
- Team B: RPG V2 vertical slice (#50) + RPG portion of evaluation harness (#51)
- Global review rules: #52
- Global control board: #48

## Live-runtime boundary

Creating branches and manifests does not make LLM workers live. Live sessions still require provider/model authentication on the runtime host. Until that wiring is present, both teams are structurally ready but not autonomous.

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && ls apk/ 2>/dev/null | head -30; echo "===patch==="; head -40 apk/patch-android.cjs 2>/dev/null' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
capture-android-legacy-launcher-ui.cjs
capture-android-release-profile.cjs
capture-android-splash-burst.cjs
capture-android-system-visuals.cjs
capture-android-themed-launcher-ui.cjs
harden-native-platform.cjs
materialize-android-assets.cjs
materialize-android-motion-bridge.cjs
materialize-android-visual-test.cjs
materialize-native-platform.cjs
patch-android.cjs
patch-production-signing.cjs
patch-themed-resolver-fallback.cjs
prepare-assets.cjs
prepare-pixel-launcher-home.cjs
prepare-web.cjs
remake-build-release-manifest.mjs
remake-materialize-android.cjs
sync-launcher-label-contract.cjs
verify-apk.cjs
===patch===
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const ANDROID=path.join(ROOT,'android');
const CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,'capacitor.config.json'),'utf8'));
const PACKAGE=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
const APP_ID=String(CONFIG.appId||'').trim();
const VERSION_NAME=String(PACKAGE.version||'').trim();
const VERSION_CODE=Number(PACKAGE.sevenAndroidVersionCode);
if(!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(VERSION_NAME))throw new Error('invalid package.json version');
if(!Number.isInteger(VERSION_CODE)||VERSION_CODE<1)throw new Error('invalid package.json sevenAndroidVersionCode');
if(!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(APP_ID))throw new Error('invalid Capacitor appId');
const PACKAGE_PATH=APP_ID.split('.');
const manifestPath=path.join(ANDROID,'app','src','main','AndroidManifest.xml');
if(!fs.existsSync(manifestPath))throw new Error('generated Android manifest missing');
let xml=fs.readFileSync(manifestPath,'utf8');
if(!xml.includes('android.permission.INTERNET'))throw new Error('Android INTERNET permission missing');
xml=xml.replace(/<application\b([^>]*)>/,(_,attrs)=>{
  let a=attrs.replace(/\sandroid:allowBackup="[^"]*"/g,'').replace(/\sandroid:usesCleartextTraffic="[^"]*"/g,'');
  return `<application${a} android:allowBackup="false" android:usesCleartextTraffic="false">`;
});
xml=xml.replace(/<activity\b([^>]*android:name="\.MainActivity"[^>]*)>/,(_,attrs)=>{
  let a=attrs;
  if(!/android:windowSoftInputMode=/.test(a))a+=' android:windowSoftInputMode="adjustResize"';
  if(/android:configChanges="([^"]*)"/.test(a)&&!/android:configChanges="[^"]*density/.test(a)){
    a=a.replace(/android:configChanges="([^"]*)"/,(_,v)=>`android:configChanges="${v}|density"`);
  }
  return `<activity${a}>`;
});
fs.writeFileSync(manifestPath,xml);

// The generated project is ephemeral. For CI release-device evidence only, make
// the application debug/release variants and AndroidTest APK use one explicit
// deterministic signing identity. Android instrumentation will correctly reject
// a test APK whose certificate differs from the installed release target.
// No credential is embedded here: CI provides the keystore and test-only values
// as Gradle properties, and normal local generation retains Capacitor defaults.
const gradlePath=path.join(ANDROID,'app','build.gradle');
if(!fs.existsSync(gradlePath))throw new Error('generated Android app Gradle file missing');
let gradle=fs.readFileSync(gradlePath,'utf8');

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && git diff origin/seven-remake-v3 b37de5b --stat -- remake/index.html remake/public 2>/dev/null; echo "exit=$?"; echo "===check if remake/src is referenced by build==="; grep -rl "remake/src" apk/ 2>/dev/null | head; grep -rn "seven_ai-final.html" apk/*.cjs 2>/dev/null | head -5' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
exit=0
===check if remake/src is referenced by build===

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && cat .seven-team/remake-mega/manifest.json 2>/dev/null | head -60' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
{
  "schemaVersion": 1,
  "wave": "remake-mega-01",
  "baseBranch": "seven-remake-v3",
  "baseSha": "be5bc24f0172f8469fbb35988d6542678e64417b",
  "marker": "REMAKE_MEGA=COMPLETE",
  "policy": {
    "allWorkersImplement": true,
    "noSharedWrites": true,
    "noNewDependencies": true,
    "requiredGates": [
      "scope",
      "report",
      "typecheck",
      "tests",
      "build"
    ],
    "integration": "manager-reviewed-only"
  },
  "workers": [
    {
      "id": "A01",
      "branch": "remake-agent/a01-chat-domain",
      "scope": "remake/src/domain/chat",
      "task": "Implement the clean chat domain model: immutable committed messages, transient assistant draft representation, Room aggregate, IDs, timestamps, invariants, pure update functions, and thorough tests. No persistence or UI."
    },
    {
      "id": "A02",
      "branch": "remake-agent/a02-chat-application",
      "scope": "remake/src/application/chat",
      "task": "Implement the application-level chat orchestration layer around the existing TaskManager: send lifecycle, one active send per room policy, streaming draft accumulation, finalize/fail/cancel transitions, request ownership, and tests with fake executors. No provider-specific code."
    },
    {
      "id": "A03",
      "branch": "remake-agent/a03-storage",
      "scope": "remake/src/storage",
      "task": "Implement a clean storage port plus IndexedDB adapter architecture with transactional versioned records, atomic migration helper, corruption/error classification, interactive-recovery-friendly errors, and tests using deterministic in-memory/fake primitives where browser IndexedDB is unavailable."
    },
    {
      "id": "A04",
      "branch": "remake-agent/a04-providers",
      "scope": "remake/src/providers",
      "task": "Implement provider contracts and payload-shaping primitives: provider capabilities, normalized model descriptors, strict message validation requiring one leading system message, normalized errors, mock provider, and tests. Do not hard-code real secrets or network endpoints."
    },
    {
      "id": "A05",
      "branch": "remake-agent/a05-routing",
      "scope": "remake/src/routing",
      "task": "Implement a pure model router and provider health/cooldown planner with explicit route plans, fallback candidates, global wall-clock budget accounting, cooldown/429 handling metadata, deterministic scoring, and tests."
    },
    {
      "id": "A06",
      "branch": "remake-agent/a06-memory",
      "scope": "remake/src/memory",
      "task": "Implement memory/context domain primitives: versioned memory entries, immutable updates, deterministic context selection, token-budget abstraction that does not assume English-only ratios, migration contracts, and tests. No storage adapter edits."
    },
    {
      "id": "A07",
      "branch": "remake-agent/a07-research",
      "scope": "remake/src/research",

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && cat .seven-team/ownership.json 2>/dev/null; echo "===manifest==="; cat .seven-team/wave-01-manifest.json 2>/dev/null | head -40' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
{
  "schemaVersion": 1,
  "policy": "exclusive-active-write",
  "manager": "ChatGPT",
  "leases": [
    {
      "team": "A",
      "scope": [
        "release/workspaces/*.css",
        "release/workspaces/seven-shell*.js",
        "release/workspaces/ui-polish-fixes.js",
        "release/workspaces/hub.js"
      ],
      "purpose": "UI Foundation V2",
      "status": "active"
    },
    {
      "team": "B",
      "scope": [
        "release/workspaces/rpg.js",
        "release/world-runtime.js",
        "release/canon-simulator.js"
      ],
      "purpose": "RPG V2 vertical slice",
      "status": "active"
    }
  ],
  "sharedReadOnlyByDefault": [
    "seven_ai-final.html",
    "release/build-release.cjs",
    "apk/patch-android.cjs",
    "verify.cjs",
    ".github/workflows/**"
  ],
  "sharedWriteRule": "Manager must grant a temporary explicit lease before either team edits sharedReadOnlyByDefault paths."
}
===manifest===
{
  "schemaVersion": 1,
  "workerMarker": "WAVE01=COMPLETE",
  "reviewMarker": "WAVE01_REVIEW=PASS",
  "workers": [
    {"id":"A01","team":"A","worker":"Cline","branch":"agent/01-ui-ux","report":".seven-team/reports/wave-01/A01-ui-ownership.md"},
    {"id":"A02","team":"A","worker":"Codex CLI","branch":"agent/02-android-build","report":".seven-team/reports/wave-01/A02-android-evidence.md"},
    {"id":"A03","team":"A","worker":"Gemini CLI","branch":"agent/03-search","report":".seven-team/reports/wave-01/A03-localization-cohesion.md"},
    {"id":"A04","team":"A","worker":"OpenHands","branch":"agent/04-research","report":".seven-team/reports/wave-01/A04-design-system-map.md"},
    {"id":"A05","team":"A","worker":"OpenCode","branch":"agent/05-runtime-models","report":".seven-team/reports/wave-01/A05-runtime-controls.md"},
    {"id":"A06","team":"A","worker":"Aider","branch":"agent/06-memory-context","report":".seven-team/reports/wave-01/A06-persisted-ui-state.md"},
    {"id":"A07","team":"A","worker":"Goose","branch":"agent/07-security-selfdev","report":".seven-team/reports/wave-01/A07-selfdev-security.md"},
    {"id":"A08","team":"A","worker":"mini-SWE","branch":"agent/08-testing-ci","report":".seven-team/reports/wave-01/A08-ui-evaluation-harness.md"},
    {"id":"A09","team":"A","worker":"Qwen Code","branch":"agent/09-performance","report":".seven-team/reports/wave-01/A09-ui-performance.md"},
    {"id":"B01","team":"B","worker":"Cline","branch":"agent-b/01-rpg-ux","report":".seven-team/reports/wave-01/B01-rpg-ux.md"},
    {"id":"B02","team":"B","worker":"Codex CLI","branch":"agent-b/02-android-rpg","report":".seven-team/reports/wave-01/B02-rpg-android.md"},
    {"id":"B03","team":"B","worker":"Gemini CLI","branch":"agent-b/03-canon-retrieval","report":".seven-team/reports/wave-01/B03-canon-grounding.md"},
    {"id":"B04","team":"B","worker":"OpenHands","branch":"agent-b/04-rpg-engine","report":".seven-team/reports/wave-01/B04-rpg-engine-map.md"},
    {"id":"B05","team":"B","worker":"OpenCode","branch":"agent-b/05-rpg-runtime","report":".seven-team/reports/wave-01/B05-rpg-runtime.md"},
    {"id":"B06","team":"B","worker":"Aider","branch":"agent-b/06-rpg-memory","report":".seven-team/reports/wave-01/B06-rpg-memory.md"},
    {"id":"B07","team":"B","worker":"Goose","branch":"agent-b/07-rpg-integrity","report":".seven-team/reports/wave-01/B07-rpg-integrity.md"},
    {"id":"B08","team":"B","worker":"mini-SWE","branch":"agent-b/08-rpg-testing","report":".seven-team/reports/wave-01/B08-rpg-evaluation-harness.md"},
    {"id":"B09","team":"B","worker":"Qwen Code","branch":"agent-b/09-rpg-performance","report":".seven-team/reports/wave-01/B09-rpg-performance.md"}
  ],
  "reviewers": [
    {"id":"A10","team":"A","worker":"Hermes Agent","branch":"agent/10-integration-review","report":".seven-team/reports/wave-01/A10-integration-review.md"},
    {"id":"B10","team":"B","worker":"Hermes Agent","branch":"agent-b/10-rpg-review","report":".seven-team/reports/wave-01/B10-integration-review.md"}
  ]
}

codex

tokens used
750,816
