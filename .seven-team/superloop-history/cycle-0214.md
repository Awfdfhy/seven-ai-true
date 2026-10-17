# Seven Superloop Cycle 214

Run: 39018571706

## Machine summary

```json
{
  "cycle": 214,
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
  "head": "4082cb023b419c30cc3fb8c2521aaacfce6ba9f4",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 214,
    "sourceSha": "4082cb023b419c30cc3fb8c2521aaacfce6ba9f4",
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
session id: 01a14980-04aa-7902-ac29-a5ac99f986d1
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


Cycle: 214
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "4082cb023b419c30cc3fb8c2521aaacfce6ba9f4", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 214, "championSha": "4082cb023b419c30cc3fb8c2521aaacfce6ba9f4", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "4082cb023b419c30cc3fb8c2521aaacfce6ba9f4", "fullGatesPass": true}
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
session id: 01a1497c-dd49-7503-8432-2c4797956d5c
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

/tool-execution-ledger.ts        |  290 -----
 remake/src/ui/App.tsx                              |  608 ++--------
 remake/src/ui/app.css                              |  435 +++----
 remake/src/ui/system/theme-service.ts              |    8 +-
 remake/vitest.log                                  |    0
 589 files changed, 150258 insertions(+), 13279 deletions(-)

2026-10-17T10:57:16.401364Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 455
2026-10-17T10:57:16.402129Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 196
exec
/bin/bash -lc 'git -C /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review merge-base --is-ancestor seven-remake-v3 HEAD && echo "v3 IS ancestor of HEAD" || echo "v3 NOT ancestor"' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
v3 NOT ancestor

2026-10-17T10:57:31.820663Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 261
2026-10-17T10:57:31.821549Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 141
2026-10-17T10:57:35.466239Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 257
exec
/bin/bash -lc 'ls /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
A01.md
A02.md
A03.md
A04.md
A05.md
A06.md
A07.md
A08.md
A09.md
A10.md
B01.md
B02.md
B03.md
B04.md
B05.md
B06.md
B07.md
B08.md
B09.md
B10.md

2026-10-17T10:57:42.198762Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 137
2026-10-17T10:57:42.199517Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 137
exec
/bin/bash -lc 'head -80 /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/B09.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
exec
/bin/bash -lc 'head -60 /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A01.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# B09 Concurrency/Race/State Corruption Bug Hunt Report

## Areas Inspected
- `release/attachment-loader.js` — lazy-load promise guard, replay logic
- `release/attachment-runtime.js` — sendMessage patch, selection rendering, file input binding
- `release/beta-ui-runtime.js` — mode picker, stop button patch, message arrival observer, theme timer
- `release/control-bridge.js` — syncResources, boot guard, task context compilation
- `release/control-runtime.js` — task contract validation, budget shares
- `release/build-release.cjs` — script injection order, PDF/attachment lazy-load guards
- `release/verify.cjs` — verification pipeline

---

## Bugs Found (Sorted by Severity)

### B09-001  CRITICAL  VERIFIED
**Surface:** `release/attachment-loader.js:6-16` — `load()` promise guard  
**Symptom:** Concurrent callers during first load can each create their own `Promise` if they race past the `S.loading` check before the first promise assigns.  
**Root Cause:** Check-then-act on `S.loading` is not atomic. Two callers entering `load()` simultaneously both see `S.loading === null`, both create a new `Promise`, both append `<script>` tags. The second script load overwrites `S.loading` but the first promise may resolve/reject independently.  
**Evidence:** Lines 8-9: `if (S.loading) return S.loading; S.loading = new Promise(...)`. No mutex.  
**Repro:** `Promise.all([SevenAttachmentLoader.load(), SevenAttachmentLoader.load()])` from cold start; observe two `<script id="seven-attachment-runtime-lazy">` in DOM.  
**Fix:** Assign a sentinel synchronously before async work: `S.loading = S.loading || new Promise(...)` or use a `loadingPromise` variable closed over.  
**Regression:** Unit test that fires N concurrent `load()` calls and asserts exactly one script tag appended and all callers receive same promise.

---

### B09-002  HIGH  VERIFIED
**Surface:** `release/attachment-runtime.js:28` — `patchSend()` wraps `r.sendMessage`  
**Symptom:** If `patchSend()` runs twice (e.g., hot-reload or double boot), the wrapper wraps the previous wrapper, causing `clearSelection()` to run N times per send and `original` chain to grow.  
**Root Cause:** Guard `r.sendMessage.sevenAttachmentPatched` is set on the *wrapper*, but if `r.sendMessage` is replaced externally after patching, the guard is lost. Also no idempotency if `boot()` runs twice.  
**Evidence:** Line 28: `if (typeof r.sendMessage !== 'function' || r.sendMessage.sevenAttachmentPatched) return;` — only checks current reference.  
**Repro:** Call `boot()` twice (simulate double DOMContentLoaded); send a message; `clearSelection()` fires twice.  
**Fix:** Store original once on a hidden symbol/weakmap; patch only if `sendMessage[ORIGINAL_SYMBOL]` absent.  
**Regression:** Double-boot test asserting `sendMessage.toString()` contains only one wrapper layer.

---

### B09-003  HIGH  STRONG
**Surface:** `release/beta-ui-runtime.js:36` — `installStopFix()` patches `r.stopGeneration`  
**Symptom:** Rapid stop/start cycles leave `stopGeneration` in a state where `stopRequested` variable is referenced but not declared (typo: `stopRequested` vs `requested`), and `activeAbortController` access races with Android branch nulling it.  
**Root Cause:** Line 36: `let requested=false; try{stopRequested=true;requested=true}catch(_){}` — `stopRequested` is undeclared (leaks to global or throws in strict mode). Android branch sets `activeAbortController=null` while non-Android branch reads it.  
**Evidence:** Variable name mismatch; no synchronization on `activeAbortController` across platforms.  
**Repro:** Tap stop button rapidly 5×; observe console ReferenceError or double-abort.  
**Fix:** Declare `let stopRequested = false`; guard `activeAbortController` with `if (activeAbortController) activeAbortController.abort()` in both branches.  
**Regression:** Stress test: 50 rapid stop/start cycles, no exceptions, single abort per cycle.

---

### B09-004  HIGH  VERIFIED
**Surface:** `release/beta-ui-runtime.js:20` — `a()` theme timer scheduling  
**Symptom:** Multiple `setTimeout` timers can stack if `a()` is called before previous timer fires (e.g., theme preference change + auto-timer).  
**Root Cause:** `clearTimeout(S.themeTimer)` runs but `S.themeTimer` is overwritten *after* the new `setTimeout`. If `a()` re-enters (via `p()` → `a()`), the first timer ID is lost.  
**Evidence:** Line 20: `S.themeTimer = setTimeout(...)`; line 21 calls `a()` after setting new preference.  
**Repro:** Toggle theme preference rapidly; observe multiple `t(1)` executions.  
**Fix:** Capture timer ID locally, clear *then* assign: `const id = setTimeout(...); S.themeTimer = id;`.  
**Regression:** Theme toggle spam test; assert only one pending timer at any time.

---

### B09-005  MEDIUM  VERIFIED
**Surface:** `release/beta-ui-runtime.js:38-39` — `installMessageArrival()` MutationObserver  
**Symptom:** If `installMessageArrival()` runs twice (e.g., workspace switch), two observers attach to `#chat`, double-firing `animateArrival` on each new message.  
**Root Cause:** `S.messageObserver.disconnect()` guards re-entry, but `S.messageObserver` is only set *after* `new MutationObserver`. If constructor throws, old observer not disconnected. Also no guard against double-call from external code.  
**Evidence:** Line 39: `if (S.messageObserver) S.messageObserver.disconnect();` then `S.messageObserver = new MutationObserver(...)`.  
**Repro:** Call `installMessageArrival()` twice; add one message; `seven:message-arrival` fires twice.  
**Fix:** Disconnect *before* creating new observer; use a module-level `installed` flag.  
**Regression:** Double-install test; assert single arrival event per message.

---

### B09-006  MEDIUM  STRONG
**Surface:** `release/control-bridge.js:1` — `syncResources()` tier selection  
**Symptom:** Concurrent calls to `syncResources()` with different `s` (state) can race on `x.state.tier` and `x.state.budget` writes, leaving budget inconsistent with tier.  
**Root Cause:** No lock; `x.state.tier = t; x.state.budget = n;` are separate writes. Caller A reads tier, caller B writes new tier, caller A writes budget for stale tier.  
**Evidence:** Lines in `syncResources`: `const t = ...; const b = ...; const n = ...; x.state.tier = t; x.state.budget = n;`.  
**Repro:** Parallel `syncResources({tier:'lite'})` and `syncResources({tier:'pro'})`; inspect final `x.state.budget.tier`.  
**Fix:** Make tier+budget update atomic via a single `x.setTierAndBudget(t, n)` method or mutex.  
**Regression:** Concurrency test with 10 parallel callers; final state consistent.

---

 succeeded in 0ms:
# A01 Bug Audit Report — UI / Visual Layout / Theme / Night Mode / Responsive Surfaces

## Areas Inspected
- `release/beta-ui-runtime.js` — theme engine, auto-switching, persistence, CSS variable wiring
- `release/attachment-runtime.js` — attachment menu CSS, responsive breakpoints, RTL support
- `release/seven-shell-final.js` + `release/seven-shell-final.css` — shell layout, sidebar, modals, theming
- `release/ui-runtime.js` — core UI runtime, composer, settings panels
- `release/workspaces/remake.js` + `release/workspaces/remake.css` — remake workspace UI
- `apk/materialize-android-visual-test.cjs` — visual test expectations for day/night/RTL/reduced-motion
- `apk/materialize-android-motion-bridge.cjs` — Android reduced-motion bridge
- `release/workspaces/rtl.css` — RTL-specific styles

---

## Bugs Found (Sorted by Severity)

### A01-001 — CRITICAL — Theme auto-switch timer leaks on rapid preference changes
**Confidence:** VERIFIED  
**Affected:** `release/beta-ui-runtime.js:19-21` (`a()`, `p()`, `t()`)  
**User symptom:** After toggling theme preference rapidly (auto → day → night → auto), multiple `setTimeout` timers run concurrently, causing theme to flip unexpectedly minutes later.  
**Technical evidence:** `a()` creates `S.themeTimer = setTimeout(...)` but never clears existing timer before setting new one. `p()` calls `a()` after `t(1)`, but `t()` also calls `a()` when `e&&o!==x`. Rapid calls stack timers. Line 20: `S.themeTimer=setTimeout(...)` without `clearTimeout(S.themeTimer)` first.  
**Reproduction:** Call `SevenBetaUI.p('day')` → `SevenBetaUI.p('night')` → `SevenBetaUI.p('auto')` within 100ms; observe multiple `seven:themechange` events fire at wrong times.  
**Fix direction:** In `a()`, add `clearTimeout(S.themeTimer)` at start before computing next deadline.  
**Regression test:** Unit test that calls `p()` 3× rapidly and asserts exactly one timer exists via `jest.useFakeTimers()`.

---

### A01-002 — HIGH — Night mode CSS variable `--s-bg` mismatch between shell and composer
**Confidence:** VERIFIED  
**Affected:** `release/seven-shell-final.css` vs `release/ui-runtime.js` composer styles; visual test expects `#111815` on root but `rgb(23,33,29)` on `.main`/`.composer`  
**User symptom:** In night mode, chat background shows subtle banding: root `--s-bg` = `#111815` (17,24,21) but `.main` and `.composer` hardcoded to `rgb(23,33,29)` — 2-bit luminance difference visible on OLED.  
**Technical evidence:** `apk/materialize-android-visual-test.cjs:90` asserts `rs.getPropertyValue('--s-bg').trim()==='#111815' && ms.backgroundColor==='rgb(23, 33, 29)'`. These are different colors. `release/seven-shell-final.css` defines `--s-bg: #111815` for night; composer/main use inline or separate rules with `rgb(23,33,29)`.  
**Reproduction:** Open app in night mode; inspect `getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg')` vs `getComputedStyle(document.querySelector('.main')).backgroundColor`.  
**Fix direction:** Unify night background to single source: either make `.main`/`.composer` use `var(--s-bg)` or update `--s-bg` to `rgb(23,33,29)` and adjust all consumers.  
**Regression test:** Visual test asserting `getComputedStyle(root).getPropertyValue('--s-bg') === getComputedStyle(main).backgroundColor` in night mode.

---

### A01-003 — HIGH — RTL sidebar positioning broken when opening after language switch
**Confidence:** STRONG  
**Affected:** `release/seven-shell-final.js` sidebar toggle + `apk/materialize-android-visual-test.cjs:129-135`  
**User symptom:** After switching to Arabic (RTL), opening sidebar places it off-screen or misaligned; visual test expects `r.left >= innerWidth-2` but sidebar renders at `left: 0`.  
**Technical evidence:** Test at line 129-135 sets `dir=rtl`, `lang=ar-IQ`, then opens sidebar and asserts `r.left >= innerWidth-2` (sidebar should be right-aligned). Shell CSS likely uses `left: 0` for closed state and `transform: translateX(0)` for open, but RTL requires `right: 0` / `transform: translateX(0)` with `direction: rtl` on parent. `release/workspaces/rtl.css` exists but may not cover shell sidebar.  
**Reproduction:** Set `document.documentElement.dir='rtl'`, `document.documentElement.lang='ar-IQ'`, open sidebar via `SevenShell.sync()`, measure `sidebar.getBoundingClientRect().left`.  
**Fix direction:** Ensure sidebar uses logical properties (`inset-inline-start/end`) or RTL-aware transforms; verify `rtl.css` is loaded and covers `.sidebar`.  
**Regression test:** E2E test switching to RTL, opening sidebar, asserting `getBoundingClientRect().right <= innerWidth + 2`.

---

### A01-004 — MEDIUM — Attachment menu responsive breakpoint at 520px ignores safe-area-inset-bottom on iOS
**Confidence:** VERIFIED  
**Affected:** `release/attachment-runtime.js:11` (STYLE string) `@media(max-width:520px)` rule  
**User symptom:** On iPhone with home indicator, attachment menu sits too low, obscured by home bar when keyboard dismissed.  
**Technical evidence:** CSS at line 11: `bottom: calc(82px + env(safe-area-inset-bottom))` — but `82px` assumes fixed composer height. Composer height varies with input content, toolbar visibility, and keyboard state. Hardcoded `82px` breaks when composer expands.  
**Reproduction:** Resize viewport to 375px width, expand composer with multi-line input, open attachment menu; measure menu bottom vs `env(safe-area-inset-bottom)`.  
**Fix direction:** Position menu relative to composer using `anchor-positioning` (if supported) or compute `bottom` dynamically from `composer.getBoundingClientRect().bottom + env(safe-area-inset-bottom)`.  
**Regression test:** Visual test with simulated iPhone viewport (375×812, safe-area-inset-bottom=34px), multi-line composer, verify menu not clipped.

---


codex

tokens used
1,482,943
