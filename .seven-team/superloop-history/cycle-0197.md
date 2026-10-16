# Seven Superloop Cycle 197

Run: 38869910998

## Machine summary

```json
{
  "cycle": 197,
  "featureCandidates": 0,
  "featuresAccepted": 0,
  "fixCandidates": 0,
  "fixesAccepted": 0,
  "polishAccepted": false,
  "apkState": "BLOCKED_NO_PRODUCT_DELTA",
  "productQualityVerdict": "UNPROVEN",
  "productQualityScore": "UNPROVEN",
  "domainResearchReady": 3,
  "domainResearchTotal": 30,
  "domainResearchInsufficient": [
    "D02_MEMORY_CONTEXT",
    "D03_TOOLS_CAPABILITY",
    "D04_CODING_SYSTEM",
    "D05_SELF_DEVELOPMENT",
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
    "D26_SETTINGS_CONTROLS",
    "D27_ERROR_RECOVERY_UX",
    "D28_LOCAL_INTELLIGENCE",
    "D29_REAL_WORKS_CANON",
    "D30_AUTONOMOUS_QUALITY"
  ],
  "head": "bf4673c17a5b69f1c7248c9de840fbf9c424fbd5",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 197,
    "sourceSha": "bf4673c17a5b69f1c7248c9de840fbf9c424fbd5",
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
session id: 01a14436-c4c1-77a2-b3ff-0aaa8dd99590
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


Cycle: 197
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "bf4673c17a5b69f1c7248c9de840fbf9c424fbd5", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 197, "championSha": "bf4673c17a5b69f1c7248c9de840fbf9c424fbd5", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "bf4673c17a5b69f1c7248c9de840fbf9c424fbd5", "fullGatesPass": true}
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
2026-10-16T10:16:47.615339Z ERROR codex_core::tools::router: error=`justification` requires an explicit `sandbox_permissions`; use `sandbox_permissions: "require_escalated"` for unsandboxed execution, or omit `justification`.
2026-10-16T10:16:47.617224Z ERROR codex_core::tools::router: error=`justification` requires an explicit `sandbox_permissions`; use `sandbox_permissions: "require_escalated"` for unsandboxed execution, or omit `justification`.
2026-10-16T10:16:47.618834Z ERROR codex_core::tools::router: error=`justification` requires an explicit `sandbox_permissions`; use `sandbox_permissions: "require_escalated"` for unsandboxed execution, or omit `justification`.
2026-10-16T10:16:59.258132Z ERROR codex_core::tools::router: error=approval policy is Never; reject command — you cannot ask for escalated permissions if the approval policy is Never
2026-10-16T10:16:59.259666Z ERROR codex_core::tools::router: error=approval policy is Never; reject command — you cannot ask for escalated permissions if the approval policy is Never
exec
/bin/bash -lc 'ls -la' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
exec
/bin/bash -lc 'git log --oneline -5' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 2976
drwxr-xr-x 11 runner runner   4096 Oct 16 10:16 .
drwxr-xr-x  4 runner runner   4096 Oct 16 10:16 ..
-rw-r--r--  1 runner runner     92 Oct 16 10:16 .git
drwxr-xr-x  3 runner runner   4096 Oct 16 10:16 .github
-rw-r--r--  1 runner runner     33 Oct 16 10:16 .gitignore
drwxr-xr-x 11 runner runner   4096 Oct 16 10:16 .seven-team
-rw-r--r--  1 runner runner  10204 Oct 16 10:16 DEVELOPMENT_REPORT.md
-rw-r--r--  1 runner runner    559 Oct 16 10:16 PROJECT_MANIFEST.json
-rw-r--r--  1 runner runner    754 Oct 16 10:16 README.md
-rw-r--r--  1 runner runner  10954 Oct 16 10:16 SEVEN_AI_ARCHITECTURE_V4.md
-rw-r--r--  1 runner runner  25280 Oct 16 10:16 SEVEN_AI_FREE_MAX_PLAN.md
-rw-r--r--  1 runner runner   7577 Oct 16 10:16 SEVEN_IMPLEMENTATION_MATRIX.md
-rw-r--r--  1 runner runner   8458 Oct 16 10:16 SEVEN_POLISH_ROADMAP.md
-rw-r--r--  1 runner runner   1170 Oct 16 10:16 all.cjs
drwxr-xr-x  2 runner runner   4096 Oct 16 10:16 apk
-rw-r--r--  1 runner runner    272 Oct 16 10:16 capacitor.config.json
drwxr-xr-x  3 runner runner   4096 Oct 16 10:16 cloudflare
drwxr-xr-x  2 runner runner   4096 Oct 16 10:16 eval
drwxr-xr-x  2 runner runner   4096 Oct 16 10:16 evolution
-rw-r--r--  1 runner runner    137 Oct 16 10:16 memory-results.json
-rw-r--r--  1 runner runner   3261 Oct 16 10:16 memory.cjs
-rw-r--r--  1 runner runner   1350 Oct 16 10:16 package.json
drwxr-xr-x  2 runner runner   4096 Oct 16 10:16 plans
drwxr-xr-x  5 runner runner   4096 Oct 16 10:16 release
drwxr-xr-x  6 runner runner   4096 Oct 16 10:16 remake
-rw-r--r--  1 runner runner   4942 Oct 16 10:16 runtime-smoke.cjs
-rw-r--r--  1 runner runner 842964 Oct 16 10:16 seven_ai-final.html
-rw-r--r--  1 runner runner 620723 Oct 16 10:16 seven_ai-t150.html
-rw-r--r--  1 runner runner 641085 Oct 16 10:16 seven_ai-t152.html
-rw-r--r--  1 runner runner 651222 Oct 16 10:16 seven_ai-t161.html
-rw-r--r--  1 runner runner 122722 Oct 16 10:16 verify.cjs

 succeeded in 0ms:
bf4673c Superloop cycle 196 manager record
815b971 Superloop cycle 195 manager record
480264f Superloop cycle 194 manager record
56e1738 Superloop cycle 193 manager record
8561969 Superloop cycle 192 manager record

exec
/bin/bash -lc 'ls -la remake/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
exec
/bin/bash -lc 'ls -la .seven-team/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 84
drwxr-xr-x 11 runner runner  4096 Oct 16 10:16 .
drwxr-xr-x 11 runner runner  4096 Oct 16 10:16 ..
-rw-r--r--  1 runner runner  1560 Oct 16 10:16 PROTOCOL.md
-rw-r--r--  1 runner runner  2434 Oct 16 10:16 TWO_TEAM_PROTOCOL.md
drwxr-xr-x  2 runner runner  4096 Oct 16 10:16 bughunt
drwxr-xr-x  2 runner runner  4096 Oct 16 10:16 cohesion
drwxr-xr-x  3 runner runner  4096 Oct 16 10:16 domain-campaign
-rw-r--r--  1 runner runner   923 Oct 16 10:16 ownership.json
drwxr-xr-x  5 runner runner  4096 Oct 16 10:16 prompts
-rw-r--r--  1 runner runner  3437 Oct 16 10:16 readiness.json
drwxr-xr-x  2

...[clipped by superloop]...

1 runner runner  8638 Oct 16 10:16 coding-candidate.cjs
-rw-r--r--  1 runner runner  5725 Oct 16 10:16 coding-candidate.test.cjs
-rw-r--r--  1 runner runner  6351 Oct 16 10:16 coding-evolution.cjs
-rw-r--r--  1 runner runner  8293 Oct 16 10:16 coding-evolution.test.cjs
-rw-r--r--  1 runner runner 12422 Oct 16 10:16 cognitive-boost.cjs
-rw-r--r--  1 runner runner  6383 Oct 16 10:16 cognitive-boost.test.cjs
-rw-r--r--  1 runner runner  1781 Oct 16 10:16 cognitive-gate.cjs
-rw-r--r--  1 runner runner  2477 Oct 16 10:16 cognitive-gate.test.cjs
-rw-r--r--  1 runner runner  3946 Oct 16 10:16 coordinator.cjs
-rw-r--r--  1 runner runner  1001 Oct 16 10:16 core.cjs
-rw-r--r--  1 runner runner  3749 Oct 16 10:16 durable-engine.cjs
-rw-r--r--  1 runner runner  5558 Oct 16 10:16 durable-engine.test.cjs
-rw-r--r--  1 runner runner  7380 Oct 16 10:16 engine.cjs
-rw-r--r--  1 runner runner  6917 Oct 16 10:16 engine.test.cjs
-rw-r--r--  1 runner runner  2889 Oct 16 10:16 eval-lock.cjs
-rw-r--r--  1 runner runner  1868 Oct 16 10:16 evals.cjs
-rw-r--r--  1 runner runner  3653 Oct 16 10:16 evolution.test.cjs
-rw-r--r--  1 runner runner  3226 Oct 16 10:16 experiment-lab.cjs
-rw-r--r--  1 runner runner  6510 Oct 16 10:16 experiment-transaction.test.cjs
-rw-r--r--  1 runner runner  2401 Oct 16 10:16 free-proof.cjs
-rw-r--r--  1 runner runner  1418 Oct 16 10:16 gates.cjs
-rw-r--r--  1 runner runner  2486 Oct 16 10:16 health-monitor.cjs
-rw-r--r--  1 runner runner  1841 Oct 16 10:16 ledger.cjs
-rw-r--r--  1 runner runner  1860 Oct 16 10:16 model-evals.cjs
-rw-r--r--  1 runner runner  1706 Oct 16 10:16 model-promotion.cjs
-rw-r--r--  1 runner runner  3364 Oct 16 10:16 model-promotion.test.cjs
-rw-r--r--  1 runner runner  3951 Oct 16 10:16 model-registry.cjs
-rw-r--r--  1 runner runner  2575 Oct 16 10:16 observatory.cjs
-rw-r--r--  1 runner runner  5904 Oct 16 10:16 promotion-runner.cjs
-rw-r--r--  1 runner runner  5847 Oct 16 10:16 promotion-runner.test.cjs
-rw-r--r--  1 runner runner  3036 Oct 16 10:16 recovery.cjs
-rw-r--r--  1 runner runner  5585 Oct 16 10:16 recovery.test.cjs
-rw-r--r--  1 runner runner  7456 Oct 16 10:16 registry.test.cjs
-rw-r--r--  1 runner runner  2041 Oct 16 10:16 repair-cycle.cjs
-rw-r--r--  1 runner runner  2596 Oct 16 10:16 state-store.cjs
-rw-r--r--  1 runner runner  5116 Oct 16 10:16 update-transaction.cjs
---
total 432
drwxr-xr-x  5 runner runner  4096 Oct 16 10:16 .
drwxr-xr-x 11 runner runner  4096 Oct 16 10:16 ..
-rw-r--r--  1 runner runner  2799 Oct 16 10:16 attachment-loader.js
-rw-r--r--  1 runner runner 14817 Oct 16 10:16 attachment-runtime.js
-rw-r--r--  1 runner runner 13057 Oct 16 10:16 beta-ui-runtime.js
-rw-r--r--  1 runner runner 11993 Oct 16 10:16 beta-ui.css
drwxr-xr-x  2 runner runner  4096 Oct 16 10:16 brand
-rw-r--r--  1 runner runner  7130 Oct 16 10:16 brand-asset-contract.cjs
-rw-r--r--  1 runner runner 15788 Oct 16 10:16 build-release.cjs
-rw-r--r--  1 runner runner 10145 Oct 16 10:16 canon-simulator.js
-rw-r--r--  1 runner runner  2416 Oct 16 10:16 canon-simulator.test.cjs
-rw-r--r--  1 runner runner  2063 Oct 16 10:16 contrast.test.cjs
-rw-r--r--  1 runner runner  6698 Oct 16 10:16 control-bridge.js
-rw-r--r--  1 runner runner 18271 Oct 16 10:16 control-runtime.js
-rw-r--r--  1 runner runner  1842 Oct 16 10:16 embedded-credentials.test.cjs
-rw-r--r--  1 runner runner 12852 Oct 16 10:16 execution-bridge.js
-rw-r--r--  1 runner runner  2058 Oct 16 10:16 frontier-model-patch.cjs
-rw-r--r--  1 runner runner 31790 Oct 16 10:16 github-self-dev.js
-rw-r--r--  1 runner runner 12166 Oct 16 10:16 logo-tournament-passb.cjs
-rw-r--r--  1 runner runner 16547 Oct 16 10:16 logo-tournament.cjs
-rw-r--r--  1 runner runner 23171 Oct 16 10:16 materialize-remake-assets.cjs
-rw-r--r--  1 runner runner  3341 Oct 16 10:16 motion-runtime.js
-rw-r--r--  1 runner runner   637 Oct 16 10:16 pdf-runtime.js
-rw-r--r--  1 runner runner  4320 Oct 16 10:16 performance-runtime.js
-rw-r--r--  1 runner runner 51279 Oct 16 10:16 release-verify.cjs
drwxr-xr-x  2 runner runner  4096 Oct 16 10:16 remake-source
-rw-r--r--  1 runner runner  6579 Oct 16 10:16 research-runtime.js
-rw-r--r--  1 runner runner  2323 Oct 16 10:16 research-runtime.test.cjs
-rw-r--r--  1 runner runner 13107 Oct 16 10:16 seven-final.css
-rw-r--r--  1 runner runner  6176 Oct 16 10:16 static-audit.cjs
-rw-r--r--  1 runner runner  6845 Oct 16 10:16 ui-hardening.css
-rw-r--r--  1 runner runner  3227 Oct 16 10:16 ui-polish-loader.js
-rw-r--r--  1 runner runner  4394 Oct 16 10:16 ui-runtime.js
-rw-r--r--  1 runner runner  1905 Oct 16 10:16 vendor-pdf.cjs
-rw-r--r--  1 runner runner  1615 Oct 16 10:16 visual-evidence-runtime-final.cjs
-rw-r--r--  1 runner runner  8635 Oct 16 10:16 visual-evidence-runtime-passb.cjs
-rw-r--r--  1 runner runner 13045 Oct 16 10:16 visual-evidence-runtime.cjs
drwxr-xr-x  2 runner runner  4096 Oct 16 10:16 workspaces
-rw-r--r--  1 runner runner  6260 Oct 16 10:16 world-runtime.js
-rw-r--r--  1 runner runner  2375 Oct 16 10:16 world-runtime.test.cjs
-rw-r--r--  1 runner runner  4557 Oct 16 10:16 zero-room-transform.cjs

exec
/bin/bash -lc 'ls -la remake/src/kernel/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
total 24
drwxr-xr-x  2 runner runner  4096 Oct 16 10:16 .
drwxr-xr-x 17 runner runner  4096 Oct 16 10:16 ..
-rw-r--r--  1 runner runner 10339 Oct 16 10:16 app-kernel.ts
-rw-r--r--  1 runner runner  2291 Oct 16 10:16 seven-runtime.ts

exec
/bin/bash -lc 'cat remake/src/kernel/seven-runtime.ts 2>/dev/null | head -100' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
import { SevenError } from "../core/errors";
import { TaskManager } from "../core/task-manager";
import { AppKernel } from "./app-kernel";
import { DiagnosticsBuffer } from "../observability/diagnostics";
import { ShellStore, type ShellSnapshot } from "../ui/shell/shell-store";
import { ThemeService, type ThemeScheduler } from "../ui/system/theme-service";
import { AndroidBridgeClient } from "../platform/android/android-bridge";
import { createCapacitorAndroidNativeTransport } from "../platform/android/capacitor-native-transport";
import { AndroidPlatformService } from "../application/android/android-platform-service";

export type SevenRuntime = Readonly<{
  taskManager: TaskManager;
  shell: ShellStore;
  theme: ThemeService;
  diagnostics: DiagnosticsBuffer;
  kernel: AppKernel;
  android: AndroidPlatformService | null;
}>;

export type SevenRuntimeOptions = Readonly<{
  initialShell?: Partial<ShellSnapshot>;
  diagnosticsCapacity?: number;
  diagnosticsNow?: () => number;
  themeNow?: () => Date;
  themeScheduler?: ThemeScheduler;
}>;

export function createSevenRuntime(options: SevenRuntimeOptions = {}): SevenRuntime {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Seven runtime options must be an object.",
    });
  }

  const taskManager = new TaskManager();
  const diagnostics = new DiagnosticsBuffer(
    options.diagnosticsCapacity ?? 256,
    options.diagnosticsNow ?? Date.now,
  );
  const shell = new ShellStore(options.initialShell ?? {});

  const themeNow = options.themeNow ?? (() => new Date());
  const theme = options.themeScheduler === undefined
    ? new ThemeService(shell, themeNow)
    : new ThemeService(shell, themeNow, options.themeScheduler);

  const nativeTransport = createCapacitorAndroidNativeTransport();
  const android = nativeTransport
    ? new AndroidPlatformService(taskManager, new AndroidBridgeClient(nativeTransport))
    : null;

  const kernel = new AppKernel(diagnostics);
  kernel.register({
    id: "theme",
    async start() {
      theme.start();
    },
    async stop() {
      theme.stop();
    },
  });

  return Object.freeze({
    taskManager,
    shell,
    theme,
    diagnostics,
    kernel,
    android,
  });
}

exec
/bin/bash -lc 'cat remake/ARCHITECTURE.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
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
179,394
