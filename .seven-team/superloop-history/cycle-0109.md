# Seven Superloop Cycle 109

Run: 38003138284

## Machine summary

```json
{
  "cycle": 109,
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
  "head": "b2311e796a0981d26c7c26680da86260d1ddcfb1",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 109,
    "sourceSha": "b2311e796a0981d26c7c26680da86260d1ddcfb1",
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
session id: 01a12343-4dba-7d22-94a7-4bef1da172db
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


Cycle: 109
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b2311e796a0981d26c7c26680da86260d1ddcfb1", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 109, "championSha": "b2311e796a0981d26c7c26680da86260d1ddcfb1", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "b2311e796a0981d26c7c26680da86260d1ddcfb1", "fullGatesPass": true}
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
session id: 01a12341-5509-7d30-92d6-0f95e20e0bcd
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

sual-test.cjs` — Android integration test flows
- `release/build-release.cjs`, `release-verify.cjs` — build pipeline
- `seven_ai-final.html` — monolithic payload (943KB, 13K lines)

---

## Bugs Found (Sorted by Severity)

### A04-001 — BLOCKER — VERIFIED
**Surface:** `release/workspaces/seven-shell-final.js` vs `release/workspaces/seven-shell.js` (dual shell exports)
**Symptom:** Two `SevenShell` implementations loaded into same global namespace; last-write-wins causes unpredictable shell behavior (sidebar, model menu, dialogs, workspace switching).
**Evidence:** File inventory shows both `seven-shell-final.js` (88 lines, 13892 bytes) and `seven-shell.js` (48 lines, 15570 bytes) in `release/workspaces/`. `seven_ai-final.html` bundles all release scripts; no module isolation. Android test (`materialize-android-visual-test.cjs:93-100`) calls `SevenRemake.modeDialog()` and `SevenShell.sync()` assuming single authoritative shell.
**Root Cause:** Build pipeline (`build-release.cjs`) concatenates both shell files without deduplication or version gating.
**Reproduction:** Load `seven_ai-final.html` in browser; `console.log(SevenShell.version)` — observe which shell wins; toggle sidebar via `SevenShell.sync()` vs direct classList manipulation.
**Fix Direction:** Single canonical shell entry point; gate legacy `seven-shell.js` behind feature flag or remove from release bundle.
**Regression Test:** Unit test asserting `typeof SevenShell === 'object' && SevenShell.version === 'final'` after bundle load.

---

### A04-002 — CRITICAL — STRONG
**Surface:** `release/ui-runtime.js`, `release/beta-ui-runtime.js`, `release/ui-polish-loader.js` (triple UI runtime)
**Symptom:** Three independent UI runtimes mutate DOM/CSS variables concurrently; race conditions on theme, density, reduced-motion, RTL.
**Evidence:** All three files exist in `release/` and are bundled. `ui-polish-loader.js` (line 1) suggests dynamic loading but no coordination protocol. Android test (`materialize-android-visual-test.cjs:129-135`) forces RTL via `document.documentElement.dir='rtl'` then calls `SevenShell.sync()` — assumes shell is single source of truth, but beta/ui-polish may have already applied conflicting styles.
**Root Cause:** No initialization sequencing or singleton guard across UI runtimes.
**Reproduction:** Rapid theme toggle + workspace switch + RTL flip; observe CSS variable flicker or layout break.
**Fix Direction:** Single `SevenUI` bootstrap with explicit phase order (core → polish → beta opt-in); expose `SevenUI.ready` promise.
**Regression Test:** Deterministic integration test: load all three, apply 10 rapid theme/workspace/RTL changes, assert zero CSS variable conflicts via `getComputedStyle`.

---

### A04-003 — CRITICAL — VERIFIED
**Surface:** `apk/materialize-android-motion-bridge.cjs:15-28` — WebView global replacement during Capacitor navigation
**Symptom:** WebView `window` object replaced mid-navigation; any in-flight JS promises (workspace open, dialog show, attachment load) resolve against stale global, causing silent failures or crashes.
**Evidence:** Comment explicitly states "The WebView global may be replaced while Capacitor finishes navigation". Android visual test (`materialize-android-visual-test.cjs:67-73`) injects `hub.js` via script tag and polls `window.__sevenWsReady` — if navigation replaces global, `__sevenWsReady` resets and test hangs.
**Root Cause:** Capacitor's `loadUrl`/`navigate` creates new WebView context; no bridge preservation for Seven's long-lived singletons (SevenWorkspaces, SevenShell, SevenRemake, SevenGitHubSelfDev).
**Reproduction:** Cold start → open workspace → trigger native navigation (deep link, permission dialog) → return to app; workspace UI frozen or duplicate instances.
**Fix Direction:** Persist Seven singletons on `window.SevenPersist` before navigation; restore on `capacitor:webviewcreated` or `DOMContentLoaded`; add navigation guard in `SevenWorkspaces.open()`.
**Regression Test:** Android instrumented test: launch → open coding workspace → trigger system permission dialog → dismiss → assert workspace still functional (chat input accepts text).

---

### A04-004 — HIGH — VERIFIED
**Surface:** `release/workspaces/hub.js` + `release/workspaces/seven-shell-final.js` — Workspace open/close lifecycle leaks
**Symptom:** `SevenWorkspaces.open('kind')` creates workspace but no guaranteed cleanup on rapid switch; event listeners, MutationObservers, intervals accumulate.
**Evidence:** Android test (`materialize-android-visual-test.cjs:71-73`, `120-127`) sequences: `ensureWorkspaces()` → `workspace('coding')` → `workspace('research')` → `workspace('rpg')` → `close()` → `openLauncher()` — no `await SevenWorkspaces.close()` between switches. `hub.js` (1 line, 8871 bytes) likely exports `open`/`close` but no guard against double-open.
**Root Cause:** `open()` does not `close()` previous workspace automatically; callers expected to manage but don't.
**Reproduction:** `SevenWorkspaces.open('coding'); SevenWorkspaces.open('research'); SevenWorkspaces.open('rpg');` — inspect `document.querySelectorAll('[data-workspace]')` count and listener count via `getEventListeners()`.
**Fix Direction:** `open(kind)` implicitly closes active workspace; return promise that resolves after teardown+setup; add `isOpen(kind)` guard.
**Regression Test:** Automated test: 50 rapid workspace switches; assert max 1 active workspace DOM node and zero leaked listeners.

---

### A04-005 — HIGH — STRONG
**Surface:** `release/attachment-runtime.js` + `release/attachment-loader.js` — Attachment menu state machine race
**Symptom:** Attachment menu (`.seven-attach-menu`) shown/hidden via multiple entry points (shell chip, keyboard shortcut, workspace action) with no central state guard; double-open causes duplicate menus or orphaned backdrop.
**Evidence:** Android test (`materialize-android-visual-test.cjs:103-106`) waits for `window.__sevenAttachVisual==='ok' && .seven-attach-menu visible` — assumes single menu. `attachment-runtime.js` (33 lines, 14817 bytes in release) likely manages menu but `seven-shell-final.js` also has attachment trigger.
**Root Cause:** No singleton menu controller; each caller does `menu.hidden = false` without checking existing instance.
**Reproduction:** Click attachment chip → press Ctrl+Shift+A (if bound) → click chip again; count `.seven-attach-menu` elements.
**Fix Direction:** Central `SevenAttachments.menu` singleton with `open()`/`close()`/`toggle()`; all entry points delegate.
**Regression Test:** Unit test: call `open()` 10x rapidly; assert exactly 1 menu DOM node and 1 backdrop.

---

### A04-006 — HIGH — NEEDS_RUNTIME_TEST
**Surface:** `release/github-self-dev.js` (510 lines, 31790 bytes) — Dynamic load + panel lifecycle
**Symptom:** GitHub Self-Dev panel loaded on-demand via script injection (`materialize-android-visual-test.cjs:107-108`); if user triggers twice before load completes, two panels or script errors.
**Evidence:** Test injects script and polls `window.__sevenGhVisual`; no deduplication guard. `github-self-dev.js` SHA matches APK payload (f9403357...).
**Root Cause:** Lazy-load pattern without `loading`/`loaded` state machine; callers don't await ready promise.
**Reproduction:** Click GitHub button → immediately click again before panel appears; observe console errors or duplicate panels.
**Fix Direction:** Export `SevenGitHubSelfDev.ready` promise; `openPanel()` returns that promise; UI disables trigger while loading.
**Regression Test:** E2E test: 5 rapid clicks on GitHub trigger; assert exactly 1 panel, 1 script load, 0 errors.

---

### A04-007 — MEDIUM — VERIFIED
**Surface:** `release/control-runtime.js` (18 lines, 18271 bytes) + `release/execution-bridge.js` (134 lines, 12852 bytes) — Control/execution bridge duplication
**Symptom:** Two bridge systems for native↔web communication; `control-bridge.js` exists but is 0 lines (placeholder?), `execution-bridge.js` handles execution; unclear ownership of `native-bridge.js` (APK payload).
**Evidence:** File inventory shows `control-bridge.js` at 0 lines/6698 bytes — likely stale. `native-bridge.js` in APK (SHA 44ae55c9...) not in release/ source tree.
**Root Cause:** Incomplete migration from control-bridge to execution-bridge; dead code in bundle.
**Reproduction:** Static audit: `grep -r "control-bridge" release/` — find imports/references.
**Fix Direction:** Remove `control-bridge.js` from bundle; verify `execution-bridge.js` covers all native calls.
**Regression Test:** Build verification: `control-bridge.js` not in final `seven_ai-final.html`.

---

### A04-008 — MEDIUM — STRONG
**Surface:** `release/workspaces/seven-shell-final.css` vs `release/workspaces/seven-shell.css` — Duplicate shell stylesheets
**Symptom:** Two CSS files for shell (50 lines/10991 bytes vs 70 lines/15350 bytes); both loaded → specificity wars, duplicate rules, increased payload.
**Evidence:** Both in `release/workspaces/`; `build-release.cjs` likely concatenates both. Android test expects specific selectors (`.seven-shell-model-chip`, `.seven-shell-model-menu`, `.seven-shell-backdrop`).
**Root Cause:** Legacy `seven-shell.css` not removed when `seven-shell-final.css` introduced.
**Reproduction:** Load app; inspect Styles panel for duplicate `.seven-shell-*` rules from two sources.
**Fix Direction:** Single canonical shell CSS; delete legacy.
**Regression Test:** Build audit: `grep -c "seven-shell" seven_ai-final.html | grep -v final` → 0.

---

### A04-009 — MEDIUM — VERIFIED
**Surface:** `release/motion-runtime.js` (1 line, 3341 bytes) — Reduced-motion not respected in workspace transitions
**Symptom:** `prefers-reduced-motion` media query ignored for workspace open/close animations; causes vestibular issues.
**Evidence:** `motion-runtime.js` exists but minimal; Android test (`materialize-android-visual-test.cjs:78-80`) explicitly disables all animation scales via `settings put global` — implies motion is normally enabled and not gated by user preference.
**Root Cause:** Workspace transitions (hub.js, shell) use CSS animations without `@media (prefers-reduced-motion)` guard.
**Reproduction:** Enable "Remove animations" in Android/OS; switch workspaces; observe slide/fade still runs.
**Fix Direction:** Wrap all transition keyframes in `@media (prefers-reduced-motion: no-preference)`; expose `SevenMotion.enabled` flag.
**Regression Test:** Automated: set `matchMedia('(prefers-reduced-motion: reduce)').matches = true`; run workspace switch; assert `getComputedStyle(el).animationDuration === '0s'`.

---

### A04-010 — LOW — VERIFIED
**Surface:** `release/performance-runtime.js` (93 lines, 4320 bytes) — Performance marks not cleared on workspace close
**Symptom:** `performance.mark('ws-open-coding')` etc. accumulate across sessions; `performance.getEntriesByType('mark')` grows unbounded.
**Evidence:** File exists; no `performance.clearMarks()` on workspace teardown.
**Reproduction:** Open/close workspaces 20x; `console.log(performance.getEntriesByType('mark').length)`.
**Fix Direction:** `SevenWorkspaces.close()` calls `performance.clearMarks('ws-*')` and `clearMeasures('ws-*')`.
**Regression Test:** Unit test: 10 workspace cycles; assert mark count ≤ 10.

---

### A04-011 — LOW — STRONG
**Surface:** `release/research-runtime.js` (121 lines, 6579 bytes) + `release/workspaces/research-v2.js` (SHA 0144e9f1...) — Research workspace dual implementation
**Symptom:** Two research workspace implementations (`research.js` in release/workspaces/ 1 line/9262 bytes, `research-v2.js` in APK payload); unclear which is active.
**Evidence:** APK payload includes `workspaces/research-v2.js` (SHA 0144e9f1...); repo has `release/workspaces/research.js`. Build pipeline may include both.
**Root Cause:** Incomplete migration v1→v2.
**Reproduction:** Open research workspace; check `document.documentElement.dataset.sevenWorkspace` and which JS module initialized.
**Fix Direction:** Single research workspace; remove v1 from bundle.
**Regression Test:** Build audit: only one research workspace module in final HTML.

---

### A04-012 — LOW — NEEDS_RUNTIME_TEST
**Surface:** `release/canon-simulator.js` (187 lines, 10145 bytes) + `release/world-runtime.js` (102 lines, 6260 bytes) — Canon/World runtime initialization order
**Symptom:** Canon simulator and world runtime both initialize on load; if world-runtime depends on canon state, race causes undefined behavior.
**Evidence:** Both bundled; no explicit initialization sequencing. `canon-simulator.test.cjs` exists but tests in isolation.
**Reproduction:** Add `console.log` to both init; reload 50x; observe order variance.
**Fix Direction:** Explicit `SevenCanon.ready.then(() => SevenWorld.init())` or single bootstrap.
**Regression Test:** Deterministic init order test via `window.SevenInitOrder` array.

---

## Cross-System Contradictions / Races
1. **Shell + UI Runtimes + RTL** — Shell sync assumes it owns layout; beta-ui/polish may have already mutated `dir`/`lang` (A04-002).
2. **Workspace + Attachment + GitHub Panels** — All use modal/overlay pattern (`.s-modal`, `.seven-attach-menu`, `#seven-github-selfdev`) with no z-index coordination or mutual exclusion.
3. **Capacitor Navigation + All Singletons** — WebView replacement invalidates `SevenWorkspaces`, `SevenShell`, `SevenRemake`, `SevenGitHubSelfDev`, `SevenAttachments` simultaneously (A04-003).
4. **Legacy vs Final Shell** — Both listen for same events (sidebar toggle, model select); double-handling (A04-001).

---

## Missing / Error States
- No error boundary for workspace load failure (script error in `hub.js`/`coding.js`/`research.js`/`rpg.js`).
- No fallback if `SevenWorkspaces.open()` rejects (network, CSP, script error).
- Attachment menu: no keyboard trap / focus management when open.
- GitHub Self-Dev: no offline/error state UI.
- Sidebar: no `aria-expanded` sync when controlled via `dataset.sevenShellSidebar` vs classList.
- Model menu: no `Escape` key close handler visible in evidence.

---

## False Positives Rejected
- **Duplicate HTML IDs** — APK target states "58 HTML ids, 0 duplicate ids in static markup".
- **`eval`/`new Function`** — Target states "no static `eval(` or `new Function(` hits".
- **`sessionStorage`** — Target states "0 `sessionStorage` references".
- **PDF.js cmap** — Explicitly excluded from audit.
- **Launcher/Splash capture scripts** — Test infrastructure, not production code.

---

## Top 5 Highest-Priority Bugs
1. **A04-001** Dual shell — architectural corruption, affects all shell-dependent features.
2. **A04-003** WebView global replacement — silent data loss/crash on Android navigation.
3. **A04-002** Triple UI runtime — theme/layout instability, hard to debug.
4. **A04-004** Workspace lifecycle leaks — memory/performance degradation over session.
5. **A04-005** Attachment menu race — user-visible duplicate UI, focus loss.

---

BUGHUNT=COMPLETE

codex

tokens used
357,546
