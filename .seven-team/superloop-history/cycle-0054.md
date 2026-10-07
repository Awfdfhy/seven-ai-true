# Seven Superloop Cycle 54

Run: 37629943870

## Machine summary

```json
{
  "cycle": 54,
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
  "head": "bc4dbc8b3f23db751590aa7c537026bce6fdb8c3",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 54,
    "sourceSha": "bc4dbc8b3f23db751590aa7c537026bce6fdb8c3",
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
session id: 01a116c7-8fd7-7782-bd0c-251328320054
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


Cycle: 54
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "bc4dbc8b3f23db751590aa7c537026bce6fdb8c3", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 54, "championSha": "bc4dbc8b3f23db751590aa7c537026bce6fdb8c3", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "bc4dbc8b3f23db751590aa7c537026bce6fdb8c3", "fullGatesPass": true}
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
session id: 01a116c7-89e2-7630-83e8-2cdb39dfa927
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

he three dialogs, model menu, workspace picker, and sidebar in RTL. | same two files | M (≈1 dev-day) | CI-blocking |

### P1 — required before release sign-off, not before merge

| # | Matrix cell | Notes | Est. cost |
|---|---|---|---|
| P1-1 | **Day-theme parity.** Re-run the dialogs, settings tabs, workspace picker, and sidebar assertions under `SevenTheme.setPreference('day')` with the **same** token-assertion shape as the existing night block. | Generator only | S–M (≈0.5 day) |
| P1-2 | **Arabic RTL × {large font, landscape, compact width}.** Extend the existing RTL block into a matrix instead of a single sequence; assert settings modal and at least one dialog in RTL (currently unproven). | Generator only | M (≈1 day) |
| P1-3 | **LTR long chat.** Same 18-message synthetic load in `dir='ltr'`, asserting `.seven-shell-jump` presence/class. Add one code-block message to catch horizontal overflow inside messages. | Generator only | S (≈0.25 day) |
| P1-4 | **Release-variant APK.** Add `assembleRelease`; run `SEVEN_APK_PATH=<release apk> npm run android:verify`. Zero new assertions needed for the first pass — this only proves the existing gate survives a shrunk artifact. | Workflow only | S (≈0.5 day + CI time) |
| P1-5 | **System day/night.** `adb shell cmd uimode night yes|no` before launch, asserting the app honours the system signal **or** explicitly asserting it does not (whichever is the intended V2 contract). Requires the product contract to be decided first. | Workflow + generator | S (≈0.5 day) + decision |

### P2 — valuable, deferrable

| # | Matrix cell | Notes | Est. cost |
|---|---|---|---|
| P2-1 | **Keyboard / IME.** Focus `#userInput`, wait for `visualViewport.height` to shrink, assert composer stays visible and no dialog action is occluded. **See blockers — emulator evidence here is unreliable.** | Requires a physical device run or a hardened IME harness | L (≈2 days, plus a device) |
| P2-2 | **Safe-area inset measurement.** Read resolved `env(safe-area-inset-*)` on both APIs and assert *no occlusion of interactive targets*, not non-zero insets (see §2.6 G-KB-3). | Emulator cutout profile needed | M (≈1 day) |
| P2-3 | **Back behaviour.** Dispatch back with a dialog open and with the sidebar open; assert dismissal contract. | Generator only | S (≈0.25 day) |
| P2-4 | **ARM / real-device spot check.** Both emulator steps are `x86_64` with `-gpu swiftshader_indirect`; no GPU-composited or ARM WebView rendering is proven. | Manual / self-hosted runner | M (device access) |
| P2-5 | **Tablet / foldable.** One non-`pixel_6` profile. | Workflow | S |

---

## 6. Blockers

1. **No golden baseline exists anywhere.** Screenshots are produced, pulled, and uploaded with
   `retention-days: 3`, and nothing diffs them. Every visual claim in §1 is therefore
   human-review-only, and any new matrix cell added without P0-1 multiplies unreviewed images rather than
   adding signal. This is the single highest-leverage blocker.
2. **CI time budget.** The job is `timeout-minutes: 50` and already contains a full web build
   (`node all.cjs` + `npm run android:generate`), two Gradle invocations, and two full emulator boots.
   P0-2 through P0-4 as written would add matrix dimensions inside those existing boots (cheap) or as new
   steps (expensive). Splitting the two API levels into separate jobs is the safe shape but doubles
   build time — a workflow-architecture decision, not a test change.
3. **No `android/` in version control.** `rm -rf android` on every generate means baseline APKs, test
   sources, and any Gradle tuning are entirely reproducible-from-script or lost.
4. **IME evidence on a `-no-window -gpu swiftshader_indirect` emulator is not trustworthy.** P2-1 should be
   treated as requiring a physical device or a deliberately instrumented IME; do not gate merge on it.
5. **System dark-mode contract is undecided.** `SevenTheme` is an app preference; whether V2 must follow
   `cmd uimode` is a product decision, so P1-5 cannot be written until it is made.
6. **No native inset model exists** (`materialize-native-platform.cjs` contains no `WindowInsets` /
   `setDecorFitsSystemWindows` / `ColorMode` code). Safe-area gaps must therefore be closed by
   **measurement**, and a change to the activity may be required before a gate can be written at all.
7. **Release variant is entirely unexercised**, so R-1..R-3 are hypotheses until `assembleRelease` runs once.
8. **Test/report separation.** `SevenSmokeTest` (SAF + `SevenSecureStore`) and `SevenVisualEvidenceTest` run
   under one Gradle task; failures are hard to attribute in logs.

---

## 7. Recommended first Android gate

**Extend the existing API 36 emulator step in `.github/workflows/android-apk.yml` with device-state
preconditions, and add exactly one new generated test method — `captureResponsiveMatrix()` — in
`apk/materialize-android-visual-test.cjs`.** Concretely:

1. In the API 36 step, set `wm size 720x1280`, `wm density 320`, `accelerometer_rotation 0`,
   `user_rotation 1`, and `font_scale 1.5` before `:app:connectedDebugAndroidTest`, and restore nothing
   (fresh emulator per step).
2. In the generator, add `captureResponsiveMatrix()` that relaunches at each device state and asserts the
   **three assertions that already have precedent in the suite** — document-level
   `scrollWidth <= clientWidth + 1` (the same pattern the suite already uses on `.modal-content`),
   interactive-target rect containment in `innerWidth`/`innerHeight`, and dialog rect containment —
   then calls the existing `shot()` so the human-review path keeps working.
3. Add the baseline-diff step (P0-1) for this one subset in the same change, so the new gate produces a
   **verdict**, not just more images.

Why this first: API 36 is already booted and green, needs no new infrastructure, exercises the newest
WebView, and — unlike API 34 — currently runs at **default font scale**, so it has the largest uncovered
surface. It also converts three declared-but-unproven settings (`adjustResize`, safe-area usage, viewport
meta without `viewport-fit=cover`) into measurements. API 34 should follow as the second gate once the
cell shape is proven, and it should carry the `font_scale 1.15` legacy value plus the new cells so the
existing 20 shots keep a meaning.

Explicitly **not** recommended as a first gate: any release-variant work (R-1..R-4 — needs a decision about
the job's time budget first) and anything keyboard/IME related (blocker #4).

WAVE01=COMPLETE

exec
/bin/bash -lc 'cd /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review && cat .seven-team/reports/wave-01/A10-integration-review.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# A10 — Integration Review: Wave 01A Audit Package (UI Foundation V2)

Scope: whether the nine Team A audit reports are an evidence-backed, coherent implementation
plan. This is NOT a claim that the UI Foundation V2 rebuild is done.

## 1. Reports reviewed — all nine present and usable

| ID | Subject | Evidence character |
|---|---|---|
| A01 | UI ownership / migration map | grep counts, file:line, absent-file recorded |
| A02 | Android-WebView matrix | PROVEN/CAPTURED/UNPROVEN convention, workflow+generator traced |
| A03 | Localization/nav/dialog cohesion | verified findings F1-F8 + migration order |
| A04 | Design-system map | layer graph, components C1-C14, Steps 0-13 with deletion criteria |
| A05 | Runtime/model/mode/search controls | control -> state -> runtime traces with line refs |
| A06 | Persisted UI state | IndexedDB invariants verified; narrow evidence boundary |
| A07 | Self-Dev credential/protected-action UX | facts vs hypotheses split, native boundary traced |
| A08 | Product UI evaluation harness | reuse map, failure semantics, first slice |
| A09 | Performance baseline/budgets | file:line hotspots; budgets are estimates only |

Weak or missing evidence:
- A09 is the weakest report: every number in its budget table is an estimate ("untested").
  No metric is measured. Instrumentation must precede any budget claim.
- A06 restricted itself to 4 files and lists 14 unknowns (locale/theme/model keys, build
  ownership). Those are already answered by A03 F8, A05 and A04 R11; merge, do not re-open.
- No report in the package produced a screenshot or a test run. All nine are static,
  read-only audits: the package contains zero runtime evidence.
- A08 dates its evidence base "commit of 2024-10-03 tree"; A02 is dated 2026-10-03.
  Possible snapshot drift — confirm both against one tree before implementation.
- A02 states it rewrote a prior version and deleted unverifiable claims. Correct practice,
  but any earlier claim from it is now unreviewable.

## 2. Cross-agent conflicts, resolved by report ID

C1 Overlay count. A01 counts 3 systems; A03 F5 counts 4 stylesheets styling `.modal` plus
2 JS layers; A04 C8 counts a 4-way geometry conflict. Not a contradiction — different units.
One decision: a single overlay component (A04 C8 `workspaces/dialog.css`) and one menu
component (A04 C9).
C2 Nav button count. A08 makes a "5-button nav" structural gate. A01 §5.1 proves the count
is unverified: `seven-shell-nav-btn` is absent from both HTML files and the grid hardcodes
`repeat(4,...)`. A01 wins on fact. The harness must pin the count from runtime DOM first;
A08's 5-button gate is provisional.
C3 "First implementation slice". A01 (nav grid), A04 (token alias + deterministic order),
A08 (harness only), plus A05/A06/A07/A09 each name their own. A04 R1/R4 and A08 make the
harness and load-order determinism prerequisites for every other claim. Resolved order:
A08 PR1 -> A04 Step 1 -> A04 Step 2 -> A01 nav slice inside A04 Step 6/13.
C4 Android coverage strength. A08 rates Gate A Android "Strong (no golden compare)";
A02 marks small viewport, landscape, any font scale except 1.15, safe-area, system day/night
and the release variant UNPROVEN. A02 wins; A08 was rating harness wiring, not coverage.
C5 Golden harness existence. A04 R1 says no screenshot/visual-regression file exists; A08
finds an orphaned `release/visual-evidence-runtime.cjs` kernel. A08 wins: kernel exists,
wiring absent. Both agree no baselines are committed.
C6 Unclaimed defect: A03 F5 — `seven-shell-final.js` stamps every `.modal` with
`data-seven-shell-surface="settings"`. No other report covers it. Accept as found; it must
land in the same commit as A04 Step 8 (A03 risk 3: un-migrated dialogs lose focus/Escape).

## 3. Merged dependency order for implementation

0. Evidence first: A08 PR1 (OBSERVE harness, 4 goldens, manifest, no production source) +
   A02 P0-1 Android baseline diff + read `dist/static-audit.json`.
1. Decisions, no code: Manager lease on `release/seven-final.css`, `beta-ui.css`,
   `ui-hardening.css`, `static-audit.cjs`, `seven_ai-final.html` (A04 R2); shipped-artifact
   provenance (A05 D1/R-4); which menu system survives (A04 R10); whether the model pick is
   a lock or a seed (A05 §1.1).
2. Deterministic cascade order, A04 Step 1 — prerequisite of every deletion criterion.
3. Token alias layer `ui-foundation.css`, append-only, zero component rules (A04 Step 2).
4. Versioned UI-state adapter as sole writer (A06) — precedes any locale/theme/model write.
5. Locale singleton + `dir` writer (A03 steps 1-4). Its step 3 revives three dead
   `html[dir=rtl]` rules: highest RTL-regression risk, needs A02 P0-2/3/4 evidence first.
6. Control registry and per-turn snapshot threading (A05) — after A04 C8/C9 canonical,
   because it depends on stable DOM IDs (A05 D4).
7. Component migration, A04 Steps 3-13 in order; A01 nav slice inside Step 6; shell
   deletion in Step 13 as a paired JS+CSS commit (A04 R5).
8. Perf slice (A09 `renderChatHistory` diff) as its own commit after step 3; never co-migrated
   with component rules (A04 §9.6).
9. A07 native protected-path + merge/dispatch confirm: parallel track, needs Android
   toolchain, requires a security-fix exemption from the feature freeze.

## 4. Top blockers and ownership

B1 No visual baseline anywhere, so no migration step is provable. Owner A08 + A02. Blocks 7.
B2 Lease/scope: Team A owns only `release/workspaces/*.css`; base token layers are
   read-only. Owner Manager. Blocks A04 Steps 2/5/8.
B3 Build provenance unknown: four HTML copies, inlined CSS, runtime-injected layers
   (A01 risk, A05 D1/R-4, A04 R11). Owner Manager + release owner. Blocks all deletions.
B4 Overlay/menu survivor undecided (A04 R10, A01 §4, A03 F5). Owner Manager.
B5 `seven_ui_lang` has no runtime writer (A03 F8) — contract scenario 3 unprovable. Owner A03.
B6 Model pick is a seed, not a lock; catalog refresh discards the pending pick (A05 R1) and
   silently persists an effort/max-token reset (A05 R2). Owner A05; needs a contract ruling.
B7 Release-variant APK never built or verified (A02 P1-4); A02 R1-R3 stay hypotheses. Owner
   A02 + Manager.
B8 Protected-path policy is client-only and non-GitHub keys ship in the bundle (A07 F1/F2/F6).
   Owner A07. Needs freeze exemption.

## 5. Evaluation evidence required before future product merges

- `all.cjs` PASS including the UI harness, plus `dist/ui-evidence-manifest.json` uploaded (A08).
- Zero pageerror / console.error per scenario (A08 P0.1).
- Baselines approved with reviewer/reason/approvalRef, or an explicit OBSERVE->ENFORCE decision.
- Android cells small viewport, font scale 1.5 and 2.0, landscape, day theme, RTL matrix on
  API 34 and 36, each with a diff verdict (A02 P0/P1).
- Gate B: RPG first turn within 3 user-visible actions; Stop-scope scenario; UI close/reopen
  persistence; first-run zero-key routing (A08 §3).
- Gate C censuses: exactly one of each control ID (A05 T7), nav count/order, single overlay,
  zero untranslated Arabic controls (A08 §3 items 10-12).
- Gate D: before/after note, limitations, independent READY / CHANGES REQUIRED, no
  builder self-approval.
- Perf budgets measured, not estimated (A09).
- Security: protected-path block test plus native/JS list parity test (A07 §7).

## 6. Audit-package readiness vs product-release readiness

Audit package: READY as the UI Foundation V2 implementation plan, subject to C1-C6 and B1-B8.
It is file:line-evidenced and it correctly refuses to claim product completion.
Product release: NOT READY and not claimed. No committed baselines, no web screenshot
capture, most of the Android matrix UNPROVEN, release variant untested, locale persistence
incomplete, rebuild not started.

## 7. Verdict

Nine of nine reports present, non-empty, read-only, each ending WAVE01=COMPLETE and
citing source. Conflicts are resolvable by report ID and none blocks adoption of the plan.
Weaknesses concentrate in A09 (no measurements) and A06 (narrow evidence boundary), each
with the report that closes it. Accepted as the integration plan; not accepted as
product-release evidence.

WAVE01_REVIEW=PASS
codex

tokens used
157,000
