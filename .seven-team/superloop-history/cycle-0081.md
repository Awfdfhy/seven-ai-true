# Seven Superloop Cycle 81

Run: 37826242782

## Machine summary

```json
{
  "cycle": 81,
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
  "head": "b2c0c0efecb9f1a836b422a16b925f264f735733",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 81,
    "sourceSha": "b2c0c0efecb9f1a836b422a16b925f264f735733",
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
OpenAI Codex v0.162.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a11d1d-9a41-7761-b1a9-6bd85605f1a0
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


Cycle: 81
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b2c0c0efecb9f1a836b422a16b925f264f735733", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 81, "championSha": "b2c0c0efecb9f1a836b422a16b925f264f735733", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b2c0c0efecb9f1a836b422a16b925f264f735733", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.162.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a11d1c-8e8e-7422-9163-4f4e3ac5a625
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

`jest.useFakeTimers()`.

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

### A01-005 — MEDIUM — Theme preference 'auto' ignores system `prefers-color-scheme` on initial load
**Confidence:** VERIFIED  
**Affected:** `release/beta-ui-runtime.js:17-18` (`f()`, `g()`)  
**User symptom:** Fresh install with system dark mode + theme preference 'auto' starts in day theme until first auto-timer fires.  
**Technical evidence:** `f()` reads only `localStorage.getItem('theme')`; returns `'auto'` if not set or invalid. `g(p, h)` uses hour-based fallback (`h>=6&&h<18?'day':'night'`) ignoring `window.matchMedia('(prefers-color-scheme: dark)').matches`. No listener for system theme changes.  
**Reproduction:** Clear localStorage, set OS to dark mode, load app; observe `document.documentElement.dataset.sevenTheme === 'day'` initially.  
**Fix direction:** In `g()`, when `p==='auto'`, check `matchMedia('(prefers-color-scheme: dark)').matches` first; add `matchMedia` change listener to call `t(1)` on system change.  
**Regression test:** Mock `matchMedia`, load with `localStorage.clear()`, assert initial theme matches system preference.

---

### A01-006 — MEDIUM — Reduced-motion bridge double-applies when CSS `prefers-reduced-motion` also true
**Confidence:** STRONG  
**Affected:** `apk/materialize-android-motion-bridge.cjs:50` JS injection + `release/performance-runtime.js` (not shown but implied)  
**User symptom:** On Android with "Remove animations" ON, motion disabled twice — no functional issue but redundant work; potential race if one path fails.  
**Technical evidence:** Bridge injects JS that reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches` AND `nativeReduced` from Android, then ORs them: `p.state.reducedMotion = nativeReduced || css`. If both true, fine; but `SevenPerformance.applyTier` may be called twice (once from bridge, once from CSS media query listener in perf runtime).  
**Reproduction:** Enable Android "Remove animations", load app, add logging to `SevenPerformance.applyTier`, count calls.  
**Fix direction:** Deduplicate: let Android bridge be source of truth; suppress CSS listener when native bridge active.  
**Regression test:** Mock both sources true, assert `applyTier` called exactly once.

---

### A01-007 — LOW — Attachment menu Arabic labels hardcoded in JS instead of using i18n system
**Confidence:** VERIFIED  
**Affected:** `release/attachment-runtime.js:27` `Q('Attach photos or files','إرفاق صور أو ملفات')` inline bilingual strings  
**User symptom:** Arabic text appears but not managed by central i18n; cannot be translated to other RTL languages (Hebrew, Persian).  
**Technical evidence:** `Q()` function (not shown) likely returns second arg when `html[lang^="ar"]`; but strings duplicated across runtimes. No central message catalog.  
**Reproduction:** Switch to `he-IL` (Hebrew RTL); attachment menu shows Arabic or English, not Hebrew.  
**Fix direction:** Move all UI strings to central i18n module; use keys like `attach.photos`, `attach.files`.  
**Regression test:** Load with `lang=he-IL`, verify attachment menu uses Hebrew translations.

---

### A01-008 — LOW — Settings modal overflow check uses `scrollWidth <= clientWidth + 1` fudge factor
**Confidence:** VERIFIED  
**Affected:** `apk/materialize-android-visual-test.cjs:113` assertion  
**User symptom:** Settings modal may horizontally overflow by 1px on some viewports without test catching it.  
**Technical evidence:** Test asserts `m.scrollWidth <= m.clientWidth + 1` — the `+1` allows 1px overflow. Should be `<= clientWidth`.  
**Reproduction:** Resize viewport to 320px, open settings, measure `modal-content.scrollWidth - modal-content.clientWidth`.  
**Fix direction:** Fix modal CSS to prevent overflow; tighten test to `<= clientWidth`.  
**Regression test:** Visual test at 320px viewport asserting zero horizontal overflow.

---

### A01-009 — LOW — Theme color meta tag updated but not `apple-mobile-web-app-status-bar-style`
**Confidence:** STRONG  
**Affected:** `release/beta-ui-runtime.js:19` updates `meta[name="theme-color"]` only  
**User symptom:** On iOS PWA, status bar stays light in night mode because `apple-mobile-web-app-status-bar-style` not set to `black-translucent`.  
**Technical evidence:** Line 19 updates `theme-color` meta but no handling of `apple-mobile-web-app-status-bar-style`. iOS requires both for dark status bar.  
**Reproduction:** Install as PWA on iOS, switch to night mode, observe status bar text color.  
**Fix direction:** Add `meta[name="apple-mobile-web-app-status-bar-style"]` with content `black-translucent` in night, `default` in day.  
**Regression test:** Check both meta tags after theme change.

---

### A01-010 — NEEDS_RUNTIME_TEST — Themed launcher icon monochrome asset not verified in APK
**Confidence:** NEEDS_RUNTIME_TEST  
**Affected:** `apk/materialize-android-assets.cjs:36-37` generates `ic_launcher.xml` with `<monochrome>` layer; `apk/verify-apk.cjs` does not assert monochrome presence  
**User symptom:** On Android 13+ with themed icons enabled, app icon may not adapt (shows full-color instead of monochrome).  
**Technical evidence:** Asset generator creates monochrome layer at line 36-37. `verify-apk.cjs` checks adaptive icon but not monochrome layer (lines 26-45). No aapt2 dump verification for `monochrome` drawable.  
**Reproduction:** Build APK, run `aapt2 dump resources APK | grep ic_launcher_monochrome`, verify resource exists.  
**Fix direction:** Add verification step in `verify-apk.cjs` for monochrome drawable in `mipmap-anydpi-v33`.  
**Regression test:** CI step running `aapt2 dump` and asserting monochrome resource present.

---

## Cross-System Contradictions / Races
1. **Theme engine vs Android motion bridge** (A01-006): Both write `SevenPerformance.state.reducedMotion`; last writer wins. No coordination protocol.
2. **Shell sidebar vs RTL CSS** (A01-003): `seven-shell-final.css` uses physical `left`/`right`; `rtl.css` may not override all shell rules due to load order/specificity.
3. **Attachment menu vs composer height** (A01-004): Menu position hardcoded to composer assumption; composer height dynamic (keyboard, multi-line, toolbar).

---

## Missing / Error States
- No error UI for theme persistence failure (localStorage quota exceeded, private browsing)
- No fallback when `matchMedia` unsupported (older WebViews)
- Attachment menu has no empty-state when no files selected (strip hidden but no message)
- Sidebar in RTL: no test for `dir=rtl` + `lang=ar` + sidebar closed → open → close cycle

---

## False Positives Rejected
- **Duplicate IDs in index.html:** Evidence states "0 duplicate ids in static markup" — clean.
- **`eval`/`new Function` usage:** Evidence confirms "no static `eval(` or `new Function(` hits" — clean.
- **Legacy name capture UI in APK:** `verify-apk.cjs:41` asserts absence — verified not present.

---

## Top 5 Highest-Priority Bugs
1. **A01-001** (CRITICAL) — Theme timer leak causes unpredictable flips
2. **A01-002** (HIGH) — Night background color inconsistency visible on OLED
3. **A01-003** (HIGH) — RTL sidebar broken for Arabic/Hebrew users
4. **A01-004** (MEDIUM) — Attachment menu clipped by iOS home indicator
5. **A01-005** (MEDIUM) — Auto theme ignores system preference on first load

---

BUGHUNT=COMPLETE

2026-10-08T20:05:54.981736Z ERROR codex_core::tools::router: error=failed to parse function arguments: missing field `cmd` at line 1 column 99
exec
/bin/bash -lc 'cat .seven-team/bughunt/BUGHUNT_MANAGER_SUMMARY.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# Seven AI 2.4.3 — 20-Agent Full Bug Hunt

**Completed agents:** 20/20  
**Target:** user-uploaded `Seven-AI-2.4.3-Zero-Key-Final(1).apk`  
**Scope:** diagnostic audit only; no production bug fixes were made in this wave.

## Completion status

- Team A: **10/10**
- Team B: **10/10**
- Valid source reports: **20/20**
- Raw bug findings indexed: **174**
- Deduplicated/promoted master root causes: **60**
- Master report: `.seven-team/bughunt/MASTER_BUG_REPORT.md`
- Master status: **MASTER_BUGHUNT=COMPLETE**

## Reports

- A01 — Cline — UI / visual layout / theme / night mode / responsive surfaces — PASS (13041 chars)
- A02 — Codex CLI — Android lifecycle / install-upgrade / WebView / native bridge / permissions — PASS (7607 chars; evidence-grounded recovery)
- A03 — Gemini CLI — Arabic RTL / localization / accessibility / text overflow / keyboard — PASS (9907 chars)
- A04 — OpenHands — Navigation / dialogs / workspaces / architecture / duplicate UI systems — PASS (15495 chars)
- A05 — OpenCode — Model picker / provider routing / free-route selection / mode controls — PASS (12611 chars)
- A06 — Aider — Memory / context / persistence / migrations / corruption / restore — PASS (5614 chars)
- A07 — Goose — Security / zero-key / credentials / self-dev / GitHub protections — PASS (13147 chars)
- A08 — mini-SWE — Test gaps / reproducibility / CI / release verification / regressions — PASS (13343 chars)
- A09 — Qwen Code — Performance / DOM / storage / observers / network latency / long chats — PASS (12911 chars)
- A10 — Hermes Agent — Holistic adversarial product audit across all surfaces — PASS (15612 chars)
- B01 — Cline — Chat core / send-stop-copy / streaming / retry / room switching — PASS (8916 chars)
- B02 — Codex CLI — Attachments / PDF / import-export / file errors / Android document flow — PASS (11061 chars)
- B03 — Gemini CLI — Web Search / Deep Research / citations / evidence / stale-result handling — PASS (9628 chars)
- B04 — OpenHands — Deep Think / reasoning modes / context construction / orchestration — PASS (17623 chars)
- B05 — OpenCode — RPG / canon / world runtime / state / titles / persistence — PASS (7954 chars; evidence-grounded recovery)
- B06 — Aider — Coding workspace / GitHub self-development / repo actions / failure recovery — PASS (16753 chars)
- B07 — Goose — Provider/network failures / offline / timeout / rate-limit / fallback behavior — PASS (7956 chars)
- B08 — mini-SWE — Storage / backup / migration / session recovery / destructive edge cases — PASS (6316 chars)
- B09 — Qwen Code — Concurrency / races / duplicate actions / state corruption / stress paths — PASS (11178 chars)
- B10 — Hermes Agent — Independent whole-app adversarial bug hunt and cross-system contradictions — PASS (11008 chars)

## Manager synthesis

The manager has completed the synthesis phase.

The 174 raw findings were not treated as 174 independent production bugs. Repeated symptoms were attached to common root causes, and weak/inferred findings were moved to a validation queue or rejected rather than inflating the count.

The authoritative repair ledger is the Master Bug Report. It contains **60 prioritized root causes**, ordered BLOCKER → CRITICAL → HIGH → MEDIUM → LOW, with source bug IDs preserved for traceability.

No production fixes have started yet. The next phase is the repair campaign, beginning with the BLOCKER/CRITICAL roots and requiring a regression test before each fix batch.

BUGHUNT_MANAGER=PASS

codex

tokens used
331,264
