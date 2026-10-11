# Seven Superloop Cycle 128

Run: 38110216362

## Machine summary

```json
{
  "cycle": 128,
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
  "head": "6a35cbc3b1899327dc56f9d2346123a1b8882cd9",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 128,
    "sourceSha": "6a35cbc3b1899327dc56f9d2346123a1b8882cd9",
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
OpenAI Codex v0.162.1
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a12992-96a7-7353-b900-4cf55d8d3035
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


Cycle: 128
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6a35cbc3b1899327dc56f9d2346123a1b8882cd9", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 128, "championSha": "6a35cbc3b1899327dc56f9d2346123a1b8882cd9", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6a35cbc3b1899327dc56f9d2346123a1b8882cd9", "fullGatesPass": true}
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
/bin/bash -lc 'find /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review -maxdepth 3 -type d 2>/dev/null | head -80' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/remake
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/scratch
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/.vitest
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/.vitest/json
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/github
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/rpg
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/application
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/observability
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/storage
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/ui
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/providers
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/context
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/integration
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/routing
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/kernel
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/core
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/domain
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/release
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/remake/src/platform
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/plans
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/cloudflare
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/cloudflare/search-gateway
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.github
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.github/workflows
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/evolution
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/eval
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/wave-01
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/remake-mega
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/cohesion
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/remake-super
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/domain-campaign/generated
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/prompts
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/prompts/wave-01
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/prompts/live-smoke
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/prompts/bughunt
/home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/runtime
/home/runner/work/_temp/seven-superloop-worktrees/m-manag

...[clipped by superloop]...

nd display a warning; saving cannot be promised after a tab is forcibly closed. Existing synchronous UI handlers may update the view before asynchronous save commits; the persistence badge is the durable-status indicator. After startup storage failure, editing remains blocked. Cross-origin/file-origin migration cannot happen automatically: export/import from the old origin is necessary.

## Code audit against roadmap

| Area | Evidence in T150 | Remaining priority |
| --- | --- | --- |
| Rooms | loadRooms/saveRooms use three separate localStorage keys | T151 adapter implemented, browser integration pending |
| Memory | canonical CRUD, structural authority, event history, consistency and derived retrieval helpers | Async transactional storage, real grants, purge, broader provenance enforcement |
| Runs | versioned v2 bundle, bounded event ledger, legacy read-only migration, transitions/checkpoints | Async transaction backend and stronger effect recovery |
| Context | contracts, sources, budgeting, compilation and Runtime workspace projection | Full UI actions and exact browser fixtures |
| Tools | native capability/ticket validation and execution helpers | Permission-source integration, external adapters, effect uncertainty |
| Models | configured free-provider router, discovery, usage/health cache, streaming parser | Account/component proof enforcement and empirical routing evaluation |
| Files | extracted knowledge text and metadata; code explicitly does not retain original bytes | Durable originals and reconstruction |
| Research | search and context integration | Full fetched claim-evidence/citation verification pipeline |
| Coding | safe repo-map API and patch/evidence helpers in Runtime layer | Full shell bridge and Android file permissions |

## Verification evidence

- Baseline SHA-256 matches the supplied manifest exactly.
- `node --check` on the final classic application script: PASS.
- `node tests/memory.cjs`: 9 PASS using actual memory source in Node VM with an injected synchronous storage adapter. Covers create/update/delete consistency, immutable history snapshots, write failure, corruption, action authorization rejection, unchanged old keys, legacy record compatibility and duplicate events.
- `tests/runtime-smoke.cjs`: 12 assertions PASS, including explicit grant/revocation, workspace, local embeddings, tool gate, run ledger, research, coding and model-outcome paths.
- `tests/all.cjs`: local release gate PASS; browser regression is explicitly reported INCONCLUSIVE when Chromium is unavailable.
- `tests/verify.cjs`: browser suite supplied but not executed successfully. Chromium installation timed out in this environment. No browser PASS is claimed.
- No live provider tests, phone benchmark, visual regression or full T150 regression suite was supplied/executed.
- Diff included as `T150-T152.patch`; changes limited to room persistence/init/send/import and memory persistence/action-authorization boundary.

## تشغيل الاختبار والمتابعة

احتفظ بـ T150 وصدّر محادثاته قبل تجربة المرشح. افتح المرشح من نفس أصل HTTP/المنفذ لاستعمال التخزين السابق؛ تغيير الأصل يتطلب الاستيراد. لا تعود إلى T150 وتتوقع أن يقرأ بيانات IndexedDB الجديدة: صدّر المحادثات من المرشح أولًا، ثم استوردها في T150.

Developer verification:

1. Install a supported Node runtime and Playwright in the test environment; install Chromium from Playwright's official installer.
2. Set CODEX_PRIMARY_RUNTIME_NODE_MODULES to the absolute node_modules directory containing Playwright.
3. Run `node tests/memory.cjs` and `node tests/verify.cjs` from this bundle.
4. Add/execute crash injection, malformed import, storage-full, startup-corruption, multi-tab and full mobile UI checks before production adoption.

Next external gate is browser/Android integration. The source is safe to continue developing, but it should not be marketed as a crash-free production APK until those platform gates pass.
## T161 continuation — safe runtime hardening


2026-10-11T04:59:20.986440Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 394
exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && git branch -a 2>/dev/null | head -30; echo "=== HEAD ==="; git rev-parse HEAD; echo "=== seven-remake-v3 ==="; git log --oneline seven-remake-v3 -3 2>/dev/null || echo "no local seven-remake-v3"; echo "=== origin ==="; git remote -v 2>/dev/null | head' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
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
  remotes/origin/agent-b/08-rpg-testing
  remotes/origin/agent-b/09-rpg-performance
  remotes/origin/agent-b/10-rpg-review
  remotes/origin/agent/01-ui-ux
  remotes/origin/agent/02-android-build
  remotes/origin/agent/03-search
  remotes/origin/agent/04-research
  remotes/origin/agent/05-runtime-models
  remotes/origin/agent/06-memory-context
  remotes/origin/agent/07-security-selfdev
  remotes/origin/agent/08-testing-ci
  remotes/origin/agent/09-performance
  remotes/origin/agent/10-integration-review
  remotes/origin/autoloop/seven-24h-work
  remotes/origin/autoloop/seven-24h-work-v2
  remotes/origin/autoloop/seven-24h-work-v4
  remotes/origin/autoloop/seven-24h-work-v5
  remotes/origin/autoloop/seven-24h-work-v6
  remotes/origin/automation/seven-24h-autopilot
  remotes/origin/automation/seven-conveyor-v2
=== HEAD ===
deab175aa9ffa8b226aab2438568aa8ecbd22cca
=== seven-remake-v3 ===
no local seven-remake-v3
=== origin ===
origin	https://github.com/Awfdfhy/seven-ai-true (fetch)
origin	https://github.com/Awfdfhy/seven-ai-true (push)

2026-10-11T04:59:29.328992Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 143
exec
/bin/bash -lc "sed -n '1,90p' /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A08.md" in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# Seven AI 2.4.3 Bug Hunt — A08 Test Gaps / Regression Audit

## Areas Inspected
- `.github/workflows/` — 15 workflow files (android-apk, seven-tests, agent-live-*-smoke, wave-01-*, agent-team-*)
- `apk/*.cjs` — Android visual certification, legacy launcher capture, release profile evidence
- `all.cjs` — Unified test runner orchestrating 11 test suites
- Release verification: `seven_ai-final.html` marker checks, build identity, artifact SHA-256
- Workspace runtimes: intelligence, research-v2, rpg, remake, seven-shell-final, world-runtime, canon-simulator
- Native bridge, attachment runtime, github-self-dev integration points

---

## Bugs Found (Sorted by Severity)

### A08-001 — BLOCKER — VERIFIED
**Surface:** Android APK workflow device tests (`.github/workflows/android-apk.yml:79-112`)
**Symptom:** Connected Android tests run on emulators but **no unit/integration test suite executes** — only UI visual capture. The `connectedDebugAndroidTest` task runs instrumented UI tests, but there is **zero evidence** of JVM/Kotlin unit tests, Robolectric tests, or WebView JS bridge contract tests in CI.
**Evidence:** Lines 94, 112 invoke `./gradlew :app:connectedDebugAndroidTest` only. No `test`, `testDebugUnitTest`, or `connectedCheck` for non-UI layers. `android-apk.yml:124` re-runs `npm run android:verify` (static check) but no test execution.
**Reproduction:** `cd android && ./gradlew tasks --all | grep -i test` — observe missing unit test tasks in CI path.
**Fix Direction:** Add `testDebugUnitTest` and `connectedCheck` (or explicit instrumented test classes for bridge contracts) to CI before visual capture.
**Regression Test:** CI gate requiring `testDebugUnitTest` pass + at least one WebView→Native bridge contract test (e.g., `native-bridge.js` message round-trip).

---

### A08-002 — CRITICAL — STRONG
**Surface:** `all.cjs` test runner (lines 6-10) — **no timeout isolation per suite**
**Symptom:** Single 120s global timeout for **all 11 test suites** (eval/harness, search-v2-eval, memory, runtime-smoke, verify, search-gateway, releaseTests, evolutionTests). One hung suite kills entire run; no per-suite timeout, no parallelization, no flake detection.
**Evidence:** `all.cjs:8` — `spawnSync` with `timeout:120000` applied to each file sequentially. Suites like `search-gateway.test.mjs` (network-dependent) can exceed 120s alone.
**Reproduction:** Inject `setTimeout(() => {}, 130000)` into `memory.cjs`; observe full runner exit code 1 with no per-suite diagnostics.
**Fix Direction:** Wrap each suite with individual timeout, capture stdout/stderr per suite, emit JUnit XML for CI visibility.
**Regression Test:** CI job that injects a slow suite and verifies only that suite fails, others complete and report.

---

### A08-003 — CRITICAL — NEEDS_RUNTIME_TEST
**Surface:** Release verification gap — APK artifact identity vs. runtime behavior
**Symptom:** `APK_TARGET.md` defines exact SHA-256 for 12 web payload files, but **no runtime equivalence test** exists. The `android-apk.yml` builds APK, runs visual capture, but **never loads the APK in WebView and verifies the 12 SHA-256 hashes match at runtime**.
**Evidence:** `apk/capture-android-release-profile.cjs:47` verifies build identity (signing, package), `apk/capture-android-legacy-launcher-ui.cjs` captures launcher UI only. No step extracts `assets/index.html` from installed APK and hashes it.
**Reproduction:** Build APK, `adb install`, `adb shell "run-as ai.seven.v243 cat assets/index.html | sha256sum"` — compare to `a5abf9d9f8fc6b9f07fc72f26011cd76da29c1e3d116f092602d2480e183bef1`.
**Fix Direction:** Add post-install runtime hash verification step in `android-apk.yml` after device boot, before visual tests.
**Regression Test:** CI step that fails if any of 12 payload file hashes diverge from `APK_TARGET.md` at runtime.

---

### A08-004 — HIGH — VERIFIED
**Surface:** Agent live smoke workflows — **no cross-agent contamination isolation**
**Symptom:** All 10 agent smoke workflows (cline, codex, gemini, goose, hermes, mini-swe, opencode, openhands, qwen, aider) share **same repository checkout, same working directory, same `git reset --hard HEAD` cleanup**. Parallel runs (matrix or concurrent workflows) will clobber each other's state.
**Evidence:** Every workflow ends with `git reset --hard HEAD` (e.g., `agent-live-cline-smoke.yml:123`, `agent-live-mini-swe-smoke.yml:134`). No unique worktree, no `GITHUB_WORKSPACE` isolation, no artifact namespacing per agent.
**Reproduction:** Trigger two agent smoke workflows simultaneously; observe `git reset` race, corrupted report files.
**Fix Direction:** Use `actions/checkout` with `path: agent-${{ matrix.agent }}` or `git worktree add` per agent; write reports to agent-scoped directories.
**Regression Test:** Concurrency stress test: run 3+ agent smokes in parallel, verify all reports generated cleanly with correct agent IDs.

---

### A08-005 — HIGH — STRONG
**Surface:** `seven-tests.yml` — Playwright tests **only run on Chromium desktop**, no Android WebView, no iOS WebKit
**Symptom:** Line 30 installs Chromium only; line 45 expects `test-results/**` but no device/emulator matrix. Seven is Capacitor/Android-first; desktop Chromium ≠ Android WebView (different JS engine, different native bridge).
**Evidence:** `seven-tests.yml:28-30` — `npx playwright install --with-deps --only-shell chromium`. No `android` or `webkit` projects in Playwright config referenced.
**Reproduction:** Run `npx playwright test --project=chromium` vs. `npx playwright test --project=android` (if configured) — observe bridge API differences (e.g., `window.SevenBridge` availability).
**Fix Direction:** Add Playwright Android project (via `playwright-android` or real device cloud), run same test suite on Android WebView in CI.
**Regression Test:** CI matrix job: `chromium`, `android-webview`, `webkit` — all must pass same core test suite (navigation, bridge calls, localStorage persistence).

---

### A08-006 — HIGH — VERIFIED
**Surface:** `wave-01-manager.yml` regression suite (lines 317-320) — **runs but not gated on merge**
**Symptom:** "Main regression suite: required before merge" comment exists, but **no branch protection / required status check** configured in workflow. The suite runs in `wave-01-manager` job but not as a required check on `main` or release branches.
**Evidence:** `wave-01-manager.yml:309-320` defines suite installation and run, but workflow triggers on `workflow_dispatch` only (line 6-7), not `pull_request` or `push`.
**Reproduction:** Open PR → observe no "Seven main regression suite" status check.
**Fix Direction:** Add `on: [pull_request, push]` to `wave-01-manager.yml` or create dedicated `regression-gate.yml` with `required: true` in branch protection.
**Regression Test:** Branch protection rule verification script: `gh api repos/{owner}/{repo}/branches/main/protection/required_status_checks --jq '.contexts[] | select(. | contains("regression"))'`.

---

### A08-007 — MEDIUM — VERIFIED
**Surface:** `apk/capture-android-release-profile.cjs:57` — **instrumentation test class hardcoded**, no discovery
**Symptom:** `adb shell am instrument -w -r -e class ai.seven.app.SevenVisualTest` — single hardcoded test class. Adding new visual test classes requires CJS edit, not Gradle test discovery.
**Evidence:** Line 57 hardcodes `-e class ai.seven.app.SevenVisualTest`. No `@RunWith(AndroidJUnit4.class)` suite aggregation.
**Reproduction:** Add `SevenVisualTest2.kt` in same package; run CI — new test not executed.
**Fix Direction:** Use `@Suite` or `AndroidJUnitRunner` with package scan; remove hardcoded class filter.
**Regression Test:** Add dummy visual test class; verify CI executes it without CJS change.

---

### A08-008 — MEDIUM — STRONG
**Surface:** `agent-team-compatibility.yml:87` — **team composition validation only at workflow runtime**, not at config load
**Symptom:** Validates `team.workers.length === 10` at line 87 during workflow execution. If `team-config.json` drifts (e.g., 9 workers), failure occurs mid-CI, not at PR validation.
**Evidence:** Validation inside workflow step, not in a reusable `validate-config` job that runs on `pull_request`.
**Reproduction:** Edit `team-config.json` to 9 workers; open PR — no failure until workflow dispatched.
**Fix Direction:** Extract validation to standalone Node script; add `validate-config.yml` on `pull_request` with `fail-fast`.

2026-10-11T04:59:43.212890Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 347
codex

tokens used
1,066,195

codex

tokens used
211,142
