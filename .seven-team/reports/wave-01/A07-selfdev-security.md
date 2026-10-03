# A07 — Self-Dev, Credential Surfaces & Protected-Action UX Audit
**Team A · Seven Production Wave 01A · UI Foundation V2**
Scope: `release/github-self-dev.js` and connected native/bridge/security code. Read-only inspection. No production source edited.

---

## 1. Evidence Map (files / functions / lines)

| Surface | File | Key functions / lines |
|---|---|---|
| Self-Dev web client | `release/github-self-dev.js` (510 L) | `PROTECTED_PATHS` (9-20), `protectedPath` (85), `safeRepoPath` (86), `atomicCommit` (166-181), `normalizeChanges` (231-246), `materializeChanges` (247-269), `selectTreePaths` (185-197), `selfDevelop` (337-390), `mergePullRequest` (329-331), `dispatchWorkflow` (332-336), `render` (436-479), boot/export (500-509) |
| Native GitHub bridge (real trust boundary) | `apk/materialize-native-platform.cjs` (Java `SevenPlatformPlugin`) | `allowedGithubPath` (203-211), `GITHUB_METHOD` (123), `githubApiOnce` (212-231), `ensureGithubToken` (195-201), `storeGithubToken` (188-194), `githubJobLogs` (239), secure-store key `SAFE_KEY` (119) |
| Native hardening pass | `apk/harden-native-platform.cjs` | SAF persistable-permission correctness; forbids `@SuppressLint("WrongConstant")` (18) |
| Packaging / credential embedding | `release/build-release.cjs` | `embeddedCredentialsFromEnv`, embeds creds into release HTML (146-174); fingerprint includes github-self-dev (152) |
| Credential embed regression test | `release/embedded-credentials.test.cjs` | asserts env→package mapping, no fixture leak into source (only) |
| Runtime credential read | `seven_ai-final.html` | `CLOUDFLARE_API_TOKEN` (982), `SEARCH_GATEWAY_KEY` (985), provider key selection (1251), gateway header (4563) |
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

---

## 4. Native-vs-Web Enforcement Ownership (recommended target state)

| Control | Today (owner) | Evidence | Risk if client-only | Target owner |
|---|---|---|---|---|
| GitHub token custody / refresh | Native (Keystore) | F5, materialize:188-201 | n/a — already native ✔ | Native (keep) |
| Repo-admin/secret path blocklist | Native | F3, materialize:203-213 | n/a — already native ✔ | Native (keep) |
| **Protected-path (workflows/evaluators/native-signing/release-gates) blocklist** | **Web only** | F1 (9-20,171,237) | Bypass via exported `api` (F2/H1) | **Native** (mirror list, fail-closed) |
| Write/commit/branch creation | Web (native is dumb pipe) | atomicCommit 166-181 | Client controls payload | Native validates path+size before proxying |
| Merge to base / workflow dispatch | Web (no confirm) | F8, 329-336 | Stale opt-in → one-tap merge | Web **+** confirm gate at action time; optionally native-side approval flag |
| Branch protection / required checks | Assumed (not verified) | F9 | Merge may bypass policy if repo-side is weak | Repo-side (out of app scope) — app should *verify* not assume |

---

## 5. UX Requirements for Protected Actions (UI Foundation V2)

Consistent risk communication currently is **incomplete**: the panel has a good explanatory paragraph (render 455) describing protection, but the two most destructive controls (auto-merge, APK dispatch) are quiet checkboxes whose state silently persists. Requirements:

1. **Risk-tiered visual language.** Protected/irreversible actions (merge to `main`, APK dispatch) must use a distinct destructive style (e.g., warning border + explicit "affects default branch" label), not the same `.seven-gh-switch` styling as benign options. (F8)
2. **Confirmation at the action site, not at opt-in.** Re-prompt (typed/modal confirm) immediately before `mergePullRequest` and `dispatchWorkflow`, even if the toggle was previously on. Include target branch, PR number, and diff scope in the confirm text. (Gap C)
3. **Do not silently persist destructive authorization.** `auto_merge_v1` should default to off each session or visibly show "ON (persistent)" with a one-tap reset. (H4)
4. **Consistent identity/privilege display.** Before enabling Self Develop, show the authenticated `login · repo` (already rendered at 439/445) plus the token class/scopes the app actually holds; make "Not verified" a visually distinct, blocking state — not just muted text.
5. **Capability-aware buttons.** Merge and APK dispatch should be disabled unless the corresponding capability is confirmed available (CI observed green for head SHA; workflow exists). Show a disabled-with-reason tooltip instead of silently failing.
6. **No protected-path policy described to the user that isn't enforced.** The panel claims "credentials and GitHub authorization boundary are protected" (455). Once Gap A is closed natively, this claim becomes true end-to-end; today it is enforced only for the happy path. UX must not overstate guarantees that depend on client cooperation.
7. **A11y/typography continuity.** Any new confirm/risk UI must keep the existing a11y contract verified by `release-verify.cjs` (402-433): `role="dialog"`, `aria-modal`, labelled title, focus/inert sibling handling, Escape-to-close, and the Arabic `L(en,ar)` parity for all new strings.

---

## 6. Exact First Implementation Slice (smallest shippable, high value)

**Goal: move protected-path enforcement into the native boundary and close the merge-confirm gap — without editing web logic beyond one confirm call.**

Scope (3 files, all already owned by this surface):
1. **`apk/materialize-native-platform.cjs` (Java)** — extend `allowedGithubPath` (203-211) with the canonical protected-path regexes currently in `github-self-dev.js:9-20`, so native rejects `PUT`/`POST` to `contents/<protected>` with a `SecurityException`. Introduce a single `SEVEN_PROTECTED` definition (regex list) mirroring the JS list; keep the existing secret/hook blocklist.
2. **`release/github-self-dev.js`** — add a confirmation step immediately before `mergePullRequest` (376-380) and `dispatchWorkflow` (373-374): a small `confirmAction(...)` helper that renders a styled modal (destructive styling) requiring explicit user confirmation showing branch + PR. Make the persistent opt-in visibly labeled and resettable (UX-3). Keep the exported surface for compatibility but note in code that native now backstops path policy.
3. **Test** — add `release/github-self-dev-protected-paths.test.cjs` that loads the JS module in Node with a stubbed `Capacitor.Plugins.SevenPlatform` and asserts (a) `atomicCommit`/`normalizeChanges` reject each `PROTECTED_PATHS` entry, and (b) the exported `api` path is *documented as untrusted* / or add a matching native-side assertion via the Java constants if a harness exists. At minimum, unit-test the JS protect-list and assert native source contains the same regexes (string-containment guard, mirroring `harden-native-platform.cjs` style).

This slice is chosen because it converts the single highest-impact client-only control (Gap A/Gap B root cause) into a native-enforced invariant, and it removes the silent-persistence merge UX (Gap C/H4) — both squarely within UI Foundation V2's "trust boundaries + protected-action UX" charter. It deliberately does NOT yet touch credential embedding (Gap E), which is a separate, larger build/packaging change.

---

## 7. Tests

Existing (read-only observations):
- `release/embedded-credentials.test.cjs` — credential embed packaging (F7); only asserts "not in source," intentionally allows embed.
- `release/release-verify.cjs:402-433` — Self-Dev panel a11y/visual/inert assertions via Playwright (open panel, geometry, close, sibling inert).
- `apk/materialize-android-visual-test.cjs:107-110` — on-device WebView smoke that lazily loads github-self-dev.js and screenshots the panel; `prefers-reduced-motion` handling is in the injected CSS.
- `apk/harden-native-platform.cjs` — shape-guarded native rewrites + forbids `WrongConstant` suppression (a good pattern to imitate for new native edits).

Gaps / to add with the slice:
- **No test asserts the protected-path policy actually blocks writes** — the highest-value missing test. Add `github-self-dev-protected-paths.test.cjs`.
- No test asserts merge/dispatch confirmation is required.
- Native protect-list ↔ JS protect-list parity is untested (string-containment test on the Java source closes this cheaply, matching harden-native-platform.cjs style).
- No test asserts localStorage destructive opt-in is reset / labeled.

---

## 8. Risks & Dependencies

**Risks:**
- R1 — Changing native `allowedGithubPath` could break legitimate flows if any current self-dev write legitimately targets a now-protected path (e.g., editing a `release/*.test.cjs`). The protect-list mirrors the JS one exactly to avoid behavior drift, but the Java edit is a real code change requiring a full Android rebuild/materialization.
- R2 — The confirm modal adds a new dialog; must not regress the existing inert/focus/a11y contract that `release-verify.cjs` enforces (two dialogs could conflict with the panel's own inert management in `closePanel` 394-400).
- R3 — Dual protect-lists remain until fully unified; the slice mirrors rather than eliminates drift, so future additions must update both (parity test mitigates).
- R4 — Credential embedding (Gap E) is untouched by this slice; if UI Foundation V2 messaging implies all secrets are Keystore-protected, that would be inaccurate for Cloudflare/Search keys (H3/F6).

**Dependencies:**
- D1 — Android native toolchain + `apk/materialize-native-platform.cjs` run and an emulator/device to regenerate `SevenPlatformPlugin.java` (android/ project is materialized, not committed).
- D2 — `release/release-verify.cjs` (Playwright) green on the web UI after adding the confirm flow.
- D3 — Coordination with whoever owns `evolution/experiment-lab.cjs` protect-list to eventually extract a shared policy module (out of this slice).
- D4 — Playwright/browser availability for a11y regression if the modal is implemented in the existing panel.

---

## 9. Security Facts vs Hypotheses — Summary

- **Facts (source-verified):** native Keystore token custody ✔ (F5); native repo-admin/secret blocklist ✔ (F3); protected-path list is web-only and advisory (F1); exported `api`/`atomicCommit`/`mergePullRequest` with no capability gate (F2); divergent protect-lists (F4); credentials embedded in bundle + localStorage fallback (F6); auto-merge/APK-dispatch persisted with no confirm (F8); merge is squash + CI-gated but branch protection assumed (F9).
- **Hypotheses (reasoned):** practical bypass via exported `api` (H1); `memory.cjs`/`runtime-smoke.cjs` gap from list drift (H2); localStorage fallback widens XSS blast radius (H3); persistent auto-merge opt-in = silent one-tap merge-to-main (H4).

Bottom line: the **only** genuinely native-enforced controls are token custody and the repo-admin/secret path blocklist. The **protected-path policy and the merge/dispatch authorizations are client-side only**, and the destructive-action UX silently persists its opt-in. The first slice (native protect-list + action-time confirm + parity/protection tests) closes the two highest-impact gaps with minimal blast radius.

WAVE01=COMPLETE