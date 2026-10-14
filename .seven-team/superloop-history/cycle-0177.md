# Seven Superloop Cycle 177

Run: 38491247053

## Machine summary

```json
{
  "cycle": 177,
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
  "head": "6f679e4b781115178a7e2818235850d1846b5883",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 177,
    "sourceSha": "6f679e4b781115178a7e2818235850d1846b5883",
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
session id: 01a13847-8344-7ed1-b3ca-c086e721f1a4
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


Cycle: 177
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6f679e4b781115178a7e2818235850d1846b5883", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 177, "championSha": "6f679e4b781115178a7e2818235850d1846b5883", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6f679e4b781115178a7e2818235850d1846b5883", "fullGatesPass": true}
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
session id: 01a13844-8c5c-7d42-a152-496b87d83a3d
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

l` | `CLOUDFLARE_API_TOKEN` (982), `SEARCH_GATEWAY_KEY` (985), provider key selection (1251), gateway header (4563) |
| Second (divergent) protected-path list | `evolution/experiment-lab.cjs` | `PROTECTED_PATHS` (5-13), `isProtected` (22-27) |
| Self-Dev UX visual/verify contract | `release/release-verify.cjs` (402-433), `apk/materialize-android-visual-test.cjs` (107-110) | opens panel, asserts a11y/inert/close |
| Self-Dev lazy load | `release/build-release.cjs` (146,162), `apk/prepare-web.cjs` (7) | lazy-local runtime fingerprint + prepackaging |
| CI gates relied upon | `.github/workflows/*.yml` | `seven-tests.yml`, `android-apk.yml` (dispatched), `agent-*.yml`, `search-gateway-production.yml` (uses `secrets.`/GITHUB_TOKEN) |

Files that do **not** exist (recorded, not blocking): no `src-tauri/`, no `electron/`, no committed `android/` project (materialized on demand by `apk/materialize-native-platform.cjs`). Trust boundary is therefore Capacitor → `SevenPlatformPlugin.java`.

---

## 2. Security Facts vs Hypotheses

### 2.1 FACTS (verifiable from source)

**F1 — Protected-path enforcement is JS-only and advisory.**
`PROTECTED_PATHS` (github-self-dev.js:9-20) and `protectedPath()` (85) live entirely in the web runtime. They are *consulted* on the write path (`atomicCommit` 171, `normalizeChanges` 237) and when curating model candidates (`selectTreePaths` 187, `validateSelectedFiles` 229). There is no native counterpart to this list. The native layer's write allow-list is independent (see F3).

**F2 — The web module exports raw, guard-bypassing primitives on `window`.**
`window.SevenGitHubSelfDev` (506-509) exposes `api`, `readFile`, `createBranch`, `atomicCommit`, `dispatchWorkflow`, `mergePullRequest`, `selfDevelop`, plus `protectedPath`. Any script in the WebView (XSS, injected 3rd-party content, a compromised lazy runtime) can call `SevenGitHubSelfDev.atomicCommit(branch, [{path:'all.cjs', content:'...'}], 'msg')` directly. `atomicCommit` *does* call `protectedPath` (171) — but the caller can equally call `api('PUT','/repos/Awfdfhy/seven-ai-true/contents/all.cjs', body)` (58-66, exported) which has **no protected-path check whatsoever** and goes straight to native.

**F3 — Native `allowedGithubPath` is the actual boundary, and it is a blocklist, not the repo's protect-list.**
`allowedGithubPath` (203-211): requires path starts with `GITHUB_REPO` (`/repos/Awfdfhy/seven-ai-true`), rejects `://` and `..`, allows `/user` only for GET, then blocks a substring blocklist: `/actions/secrets`, `/dependabot/secrets`, `/codespaces/secrets`, `/hooks`, `/collaborators`, `/deploy_keys`, `/environments`, `/actions/permissions`, `/rulesets`, `/protection`. Method limited by `GITHUB_METHOD` (GET|POST|PUT|PATCH|DELETE) validated in `githubApiOnce` (213) → `SecurityException`. Net: native protects *repo-admin/secrets* surfaces, but does **not** know about `all.cjs`, `.github/workflows/`, `evolution/`, `hardening/`, `PROJECT_MANIFEST.json`, `verify.cjs`, etc. So the "protected path" concept is **only** honored when the cooperative JS client calls it; the native layer would happily `PUT` those files if asked.

**F4 — Two divergent protected-path lists exist (policy drift).**
JS list (github-self-dev.js:9-20) includes `hardening/`, `release/github-self-dev.js`, `apk/materialize-native-platform.cjs`, `release/*.test.cjs`, and several `release/*…cjs` release-gate scripts; `evolution/experiment-lab.cjs` (5-13) includes `runtime-smoke.cjs`, `memory.cjs` (which JS does **not** protect) and omits all `release/`, `hardening/`, `apk/` entries. Neither list references the other; there is no shared source of truth.

**F5 — Token custody is native and Keystore-backed (good).**
`storeGithubToken` (188-194) + `ensureGithubToken` (195-201) keep access/refresh tokens in `SevenSecureStore` (private prefs + Android Keystore; comments at 31). `getCapabilities` advertises `secureStore/androidKeystore:true, broadStoragePermission:false` (163). The token never enters JS — good boundary design.

**F6 — Non-GitHub credentials are embedded client-side (at-rest exposure).**
`build-release.cjs` embeds `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SEARCH_GATEWAY_KEY`, `SEARCH_GATEWAY_URL` into the packaged HTML (146-174; keys enumerated at embedded-credentials.test.cjs 30-33). At runtime `seven_ai-final.html` reads them (982-985), with a `localStorage` fallback (`cloudflare_api_token`, `search_gateway_key`) and a provider-key selector (1251) and gateway header (4563). These ship **in the app bundle** and are extractable by any WebView script — unlike GitHub tokens, they are not Keystore-bound.

**F7 — Embedded-credential test only checks the "not in source" direction.**
`embedded-credentials.test.cjs:25` asserts fixtures are absent from `seven_ai-final.html` (source) but :29 asserts they ARE present in the packaged release. This codifies embedding as intended; there is no runtime revocation/rotation surface test.

**F8 — Protected-action UX has no confirmation gate for merge/dispatch.**
Auto-merge and build-APK are checkboxes (render 458-459) persisted to `localStorage` (`seven_github_auto_merge_v1`, `seven_github_build_apk_v1`; 472-475). On run, if `autoMerge`, `mergePullRequest` squashes into base (376-380); if `buildApk`, `dispatchWorkflow('android-apk.yml')` (373-374). **No `confirm()`/modal/re-auth** is presented at the moment of merge or dispatch. The only implicit gate is CI passing (`waitForRun`, 355-368) — an app-side wait, not a server-side policy.

**F9 — Merge is squash and CI-gated but branch protection is assumed, not verified.**
`openPullRequest` (326-328) opens against `opts.base`; `mergePullRequest` (329) `merge_method:"squash"`. The code never checks that required status checks / branch protection actually exist; it only waits for a run it found (or `runs[0]`) to complete (298-313). If `run.conclusion!=="success"` it errors (368), but a run on a *different* head could be selected if the exact `head_sha` isn't yet visible.

**F10 — The web client's identity is hardcoded.** `CLIENT_ID="Iv23lilyiGs3RQPZrPjq"` and `REPO="Awfdfhy/seven-ai-true"` are module constants (5-6) and are also re-derived natively (`GITHUB_REPO` at materialize-native-platform.cjs:126). These are not secrets (OAuth public client id + public repo name) but they are duplicated in two places with no shared build-time contract.

---

### 2.2 HYPOTHESES (reasoned, not directly proven in source)

**H1 — `api()` is the practical bypass for protected-path policy.** Because `api` (58) is exported and performs no `protectedPath` check, a malicious/buggy WebView script can `PUT` to `contents/all.cjs` etc. while native allows it (F3). Mitigation would be to have native itself enforce the protect-list. *(Confidence: high on mechanism; the "no JS-side check in api" is directly observable.)*

**H2 — Divergent lists create a real gap for `memory.cjs`/`runtime-smoke.cjs`.** If the model selects `memory.cjs`, `selectTreePaths` (187) only filters by the JS list (which does not protect `memory.cjs`) and non-source extensions, so `memory.cjs` is editable autonomously; meanwhile `experiment-lab.cjs` would consider it protected. Whether that matters depends on which surface is authoritative — unclear. *(Confidence: medium.)*

**H3 — localStorage credential fallback widens the XSS blast radius.** If a WebView script runs, it can read `cloudflare_api_token` / `search_gateway_key` from localStorage and exfiltrate; embedded creds make that moot for packaged builds but localStorage persists the fallback path for web/older builds. *(Confidence: medium-high; mechanism observable at 982-985.)*

**H4 — Persisted `auto_merge=1` localStorage means a user who once opted in keeps one-tap merge-to-main on every future run** without re-confirming the destructive scope (F8). This is a UX/security smell: destructive authorization silently persists across sessions. *(Confidence: high on behavior; "risk" is judgment.)*

---

## 3. Concrete Trust-Boundary Gaps

- **Gap A — No native enforcement of the protected-path policy.** The security-critical list (workflows, evaluators, signing/native materializers, release gates) is honored only by the cooperative web client (F1+F3). Ownership is inverted: the *policy that matters* lives in the least-trusted tier.
- **Gap B — Exported low-level `api`/`atomicCommit`/`mergePullRequest` bypass UI policy.** `window.SevenGitHubSelfDev` (506-509) hands the WebView the exact primitives that can write any non-blocked path and merge PRs, with no capability gating beyond "is the plugin present."
- **Gap C — Destructive actions lack a confirmation / re-auth boundary at the action site.** Merge and workflow dispatch fire on a stale localStorage opt-in (F8). CI-pass is the only interlock, and it is advisory (F9).
- **Gap D — Policy drift across duplicate protect-lists** (F4) with no single source of truth, so additions in one surface are not enforced in the other.
- **Gap E — Non-GitHub secrets shipped in the bundle and readable by any script** (F6), asymmetric to the strong Keystore handling of GitHub tokens (F5). No rotation/revocation surface in-app.


 succeeded in 0ms:
# A06 — Persisted UI State Audit

**Wave:** Seven Production Wave 01A  
**Mission:** Audit persistence and state-migration risk for UI Foundation V2  
**Scope:** Settings, room state, localization, theme, model UI state, legacy keys, and recovery behavior  
**Evidence boundary:** Only the supplied read-only files were used. No additional repository source was available in the provided evidence.

## Executive summary

1. **Room persistence has a canonical IndexedDB migration path.** The verified store is `seven_ai_canonical_v1`, with `state` and `audit` object stores. Initial room migration produces revision `1`; saved room state and audit revisions must agree.
2. **Legacy room keys are compatibility inputs, not canonical storage after migration.** The verified keys are `chat_rooms_v6`, `room_titles_v6`, and `current_room_v6`. Tests require their original contents to remain unchanged.
3. **Cross-tab room writes already have fail-closed semantics.** A stale tab receives `false` from `saveRooms()` and transitions `roomPersistence.status().failed` to `true`; it must not overwrite the winning tab.
4. **Memory persistence provides a useful safety pattern.** Writes are snapshot-based, failures leave the exact prior bundle unchanged, and corrupt canonical memory is not replaced with empty data. Legacy memory keys remain untouched.
5. **Durable settings, localization, theme, and model-selection persistence are not verified by the supplied evidence.** The UI scripts derive language and model state from runtime DOM controls, but no durable settings/theme/locale/model key or migration schema is shown.
6. **The two release overlays duplicate presentation responsibilities.** `ui-polish-fixes.js` and `seven-shell.js` both project model selection, localization, room labels, and empty states into the DOM. They must remain consumers of canonical state rather than becoming additional persistence owners.
7. **Long-chat rendering is correctly separated from canonical history.** A 500-message room renders at most 100 message elements, expands to a 200-message projection, and preserves all 500 canonical records.
8. **The first implementation slice should centralize versioned UI state in the existing IndexedDB persistence layer without changing room migration semantics.** Model identity, locale, theme, and non-secret settings should be committed atomically, while release overlays derive their UI from that state.

## Evidence reviewed

- `../../../release/workspaces/ui-polish-fixes.js`
  - Room search and row filtering.
  - Model-picker creation and localization.
  - Zero-room facade and room-function wrapping.
  - Branding and dynamic DOM synchronization.
- `../../../release/workspaces/seven-shell.js`
  - Shell labels, localization, room metadata, composer, model chip, copy controls, empty state, and viewport behavior.
  - Runtime synchronization through `seven:workspacechange` and `seven:themechange`.
- `../../../verify.cjs`
  - IndexedDB room migration, revisions, audit agreement, stale-tab handling, legacy preservation, settings structure, model routing, long-chat rendering, localization, theme event references, and diagnostics.
- `../../../memory.cjs`
  - Atomic memory updates, immutable ledger history, quota-failure preservation, corrupt-data refusal, and legacy-key preservation.

## Verified persistence keys and flows

### 1. Canonical room state

**Verified canonical database**

- Database: `seven_ai_canonical_v1`
- Object stores:
  - `state`
  - `audit`
- Verified canonical state record: `state["rooms"]`
- Runtime status API: `roomPersistence.status()`
- Status fields observed:
  - `ready`
  - `revision`
  - `failed`

**Verified migration flow**

1. The application starts from legacy local storage when no canonical room state has been initialized.
2. Initial migration reaches `roomPersistence.status().ready === true`.
3. Initial canonical room revision is `1`.
4. Room IDs, titles, and message content survive migration.
5. Legacy local-storage room keys remain byte-for-byte available for compatibility after migration.
6. The canonical state revision and last audit revision agree.
7. The audit entry count equals the current canonical revision.

**Verified save and reload flow**

1. Room mutations are held in the in-memory `rooms` and `roomTitles` structures.
2. `saveRooms()` persists a complete snapshot and resolves to a boolean.
3. Rapid queued snapshots preserve call order.
4. A successful save survives reload.
5. Two tabs may load the same revision.
6. The first tab can save a newer revision.
7. The stale tab then receives `false` and enters the failed state.
8. The stale tab does not overwrite the winning snapshot.

### 2. Legacy room keys

The following keys are verified migration inputs and compatibility fixtures:

| Key | Verified role |
|---|---|
| `chat_rooms_v6` | Legacy room collection, including history and room metadata |
| `room_titles_v6` | Legacy room-title mapping |
| `current_room_v6` | Legacy selected-room identifier |

Required invariant: migration must not delete, normalize, or rewrite these keys. The supplied tests explicitly compare migrated state against the original legacy value.

### 3. Memory persistence adjacent to UI settings

**Verified canonical key**

- `seven_ai_memory_bundle_v2`

**Verified legacy keys**

- `seven_ai_memory_v1`
- `seven_ai_event_ledger_v1`

**Verified safety behavior**

- A create, update, or delete is committed as one coherent operation.
- Update and delete operations append immutable ledger history.
- A quota or write failure returns failure without changing the previous canonical bundle.
- Corrupt canonical memory causes writes to fail rather than replacing corruption with empty state.

codex

tokens used
427,851
