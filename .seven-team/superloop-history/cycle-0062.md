# Seven Superloop Cycle 62

Run: 37712717911

## Machine summary

```json
{
  "cycle": 62,
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
  "head": "6ad65c9c2bf16b18869dffaea0875404c63cba4e",
  "autonomy": {
    "schemaVersion": 1,
    "cycle": 62,
    "sourceSha": "6ad65c9c2bf16b18869dffaea0875404c63cba4e",
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
OpenAI Codex v0.161.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a1195e-6442-75e2-bd37-cd41d0b15658
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


Cycle: 62
Manager stage: manager-final-review

Produce the final cycle review.
Feature integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6ad65c9c2bf16b18869dffaea0875404c63cba4e", "fullGatesPass": true}
Evolution Arena: {"schemaVersion": 1, "cycle": 62, "championSha": "6ad65c9c2bf16b18869dffaea0875404c63cba4e", "challengers": [], "promotion": "BLOCKED_PENDING_COMPARATIVE_PROOF", "rule": "No challenger wins from typecheck alone."}
Fix integration: {"accepted": [], "rejected": ["A01: no candidate", "A02: no candidate", "A03: no candidate", "A04: no candidate", "A05: no candidate", "A06: no candidate", "A07: no candidate", "A08: no candidate", "A09: no candidate", "A10: no candidate", "B01: no candidate", "B02: no candidate", "B03: no candidate", "B04: no candidate", "B05: no candidate", "B06: no candidate", "B07: no candidate", "B08: no candidate", "B09: no candidate", "B10: no candidate"], "head": "6ad65c9c2bf16b18869dffaea0875404c63cba4e", "fullGatesPass": true}
Polish accepted: False
APK result: APK_STAGE=BLOCKED_NO_PRODUCT_DELTA
No user-facing/product-runtime delta exists under remake/src, remake/index.html or remake/public. Refusing to publish another APK whose Seven payload is effectively unchanged.
SELF_HEAL_APK=EXHAUSTED

Independent product-quality synthesis:
Reading additional input from stdin...
OpenAI Codex v0.161.0
--------
workdir: /home/runner/work/_temp/seven-superloop-worktrees/m-manager-product-quality
model: kilo-auto/free
provider: seven
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 01a1195d-9d2a-7912-af1f-70feb8448abc
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

 `PLANNED` or `ATTEMPTED` state, and the run is later restored, the system may re-execute the side effect because the restored ledger shows it as not yet attempted, leading to duplicate real-world effects (e.g., duplicate API calls). This is a race between execution-bridge's persistence and control-runtime's side-effect state machine.

## Missing / Error States
- Memory subsystem: no handling for `localStorage` being disabled (private browsing) beyond quota errors; getItem may return null, setItem may throw a different error.
- Migration: no rollback mechanism if v2 write fails after v1 deletion.
- Checkpoint: no handling for storage quota exceeded during persistCheckpoint; the error is thrown and may crash the run.

## False Positives Rejected
- Attachment loader hang after failure: While the loader can hang if a script element remains after a failed load, this is outside the memory/context specialization and does not affect persistence of user data.
- Theme persistence: The beta-ui-runtime theme handling is straightforward and correctly falls back to 'auto' on error; no bug found.
- Build-time injection failures: These are build-time checks and do not affect runtime memory behavior.

## Top 5 Highest-Priority Bugs
1. A06-002 (CRITICAL) — Legacy migration data loss.
2. A06-001 (HIGH) — Corruption crash in update/delete.
3. A06-005 (HIGH) — Checkpoint corruption propagation.
4. A06-003 (MEDIUM) — Token estimation overflow for multilingual text.
5. A06-004 (MEDIUM) — Checkpoint storage bloat.

BUGHUNT=COMPLETE

exec
/bin/bash -lc 'cat /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review/.seven-team/reports/bughunt/A07.md' in /home/runner/work/_temp/seven-superloop-worktrees/m-manager-final-review
 succeeded in 0ms:
# Seven AI 2.4.3 Zero-Key Final — Bug Audit Report (A07)

## Areas Inspected
- `apk/materialize-native-platform.cjs` — Native bridge, GitHub OAuth, secure store (Keystore + AES-GCM)
- `apk/patch-android.cjs` — Manifest, Gradle, instrumentation tests
- `apk/verify-apk.cjs` — Release verification gates
- `apk/capture-android-*.cjs` — Device proof, ADB flows, evidence capture
- `apk/harden-native-platform.cjs` — Native permission boundary lint
- `apk/materialize-android-motion-bridge.cjs` — Reduced-motion bridge injection
- Extracted web payload (SHA-256 verified): `github-self-dev.js`, `native-bridge.js`, workspaces

---

## Bugs Found (Sorted by Severity)

### A07-001 | CRITICAL | VERIFIED
**Surface:** `apk/materialize-native-platform.cjs:189-201` — GitHub token refresh & storage  
**Symptom:** Refresh token stored without expiry validation; access token expiry parsed but not enforced before use; race between `ensureGithubToken` callers can trigger concurrent refreshes.  
**Root Cause:** `storeGithubToken` writes `expires_in` as absolute timestamp but `ensureGithubToken` only checks `exp > now` — if clock skew or missing `expires_in`, token treated as valid forever. No mutex on refresh; two callers can both POST `/oauth/access_token` with same refresh token, invalidating one.  
**Evidence:** Lines 189-201: `expires_in` optional, `refresh_token_expires_in` optional; `ensureGithubToken` reads `GH_EXPIRES` but falls back to `access` if refresh missing (line 198).  
**Reproduction:** 1) Set `GH_ACCESS` with past `GH_EXPIRES`; 2) Call `githubApi` concurrently from two JS contexts; observe 401 or token clobber.  
**Fix Direction:** Add refresh mutex (per-clientId), validate `expires_in` presence, enforce expiry with skew tolerance, invalidate refresh token on refresh failure.  
**Regression Test:** Unit test `ensureGithubToken` with expired/missing expiries; concurrency test with 10 parallel callers.

---

### A07-002 | CRITICAL | VERIFIED
**Surface:** `apk/materialize-native-platform.cjs:53-75` — `SevenSecureStore` AES-GCM IV generation  
**Symptom:** IV derived from ciphertext prefix (first 12 bytes) but encryption path not shown; if IV reused or predictable, confidentiality fails.  
**Root Cause:** `generateKey()` creates AES-256-GCM key in Keystore (line 53). `put()` encrypts but encryption code omitted in evidence; `get()` splits `iv = payload.substring(0,12)` (line 74). No evidence of cryptographically random IV per encryption.  
**Evidence:** Line 75 validates IV length only. Keystore `KeyGenParameterSpec` not shown — may lack `setRandomizedEncryptionRequired(true)`.  
**Reproduction:** Encrypt two identical values; compare ciphertext prefixes. If equal, IV reused.  
**Fix Direction:** Ensure `KeyGenParameterSpec.Builder.setRandomizedEncryptionRequired(true)`; use `Cipher.getParameters().getParameterSpec(GCMParameterSpec.class)` for IV; store IV || ciphertext || tag.  
**Regression Test:** `secureStoreEncryptsAtRest` (line 121) must assert distinct IVs for identical plaintexts.

---

### A07-003 | HIGH | STRONG
**Surface:** `apk/materialize-native-platform.cjs:208-212` — GitHub API blocked paths list  
**Symptom:** Blocklist approach for sensitive endpoints; new GitHub API endpoints (e.g., `/repos/{owner}/{repo}/actions/variables`, `/organization/secrets`) not covered.  
**Root Cause:** Hardcoded `blocked` array (line 208) misses Actions variables, organization-level secrets, codespaces secrets v2, fine-grained PAT scopes.  
**Evidence:** Only 9 paths blocked; GitHub REST API has 50+ sensitive endpoints.  
**Reproduction:** Call `githubApi` with `PATCH /repos/x/y/actions/variables/Z` — succeeds, leaks CI variable values.  
**Fix Direction:** Switch to allowlist of safe read-only paths (`/repos/{owner}/{repo}`, `/user`, `/rate_limit`) or implement OAuth fine-grained token with minimal scopes.  
**Regression Test:** Parametrized test attempting each known sensitive endpoint; all must return 403/blocked.

---

### A07-004 | HIGH | VERIFIED
**Surface:** `apk/materialize-native-platform.cjs:212-219` — GitHub API request lacks certificate pinning / hostname verification override check  
**Symptom:** `HttpURLConnection` uses system trust store only; vulnerable to MITM on compromised device or malicious CA.  
**Root Cause:** No `HostnameVerifier` or `CertificatePinner`; `HttpsURLConnection` default trusts all system CAs.  
**Evidence:** Line 214 opens raw `URL(GITHUB_API+path)`.  
**Reproduction:** Run on device with user-installed CA (e.g., Charles Proxy); observe successful API calls.  
**Fix Direction:** Pin GitHub's public key (SHA-256 of `api.github.com` leaf or intermediate) via custom `HostnameVerifier` + `X509TrustManager`.  
**Regression Test:** Instrumentation test with mock TLS server presenting wrong cert; call must fail.

---

### A07-005 | HIGH | NEEDS_RUNTIME_TEST
**Surface:** `apk/materialize-native-platform.cjs:222-229` — GitHub device flow polling interval not respected  
**Symptom:** `githubPollDeviceFlow` ignores `interval` from device code response; polls immediately in tight loop if caller retries.  
**Root Cause:** Line 228 reads `interval` from response but never passes back to JS or enforces delay. JS side (`github-self-dev.js`) may poll aggressively.  
**Evidence:** Response includes `interval` (line 228) but no backoff logic in Java.  
**Reproduction:** Start device flow; poll every 100ms; observe GitHub rate limit (429) or `slow_down` error.  
**Fix Direction:** Return `interval` to JS; JS must enforce minimum poll interval; Java should reject polls faster than `interval`.  
**Regression Test:** Mock device flow server; verify poll spacing ≥ `interval`.

---

### A07-006 | MEDIUM | VERIFIED
**Surface:** `apk/materialize-native-platform.cjs:137-139` — Secure store key validation regex (`SAFE_KEY`) not shown  
**Symptom:** If `SAFE_KEY` permits `.` or `/`, keys could traverse internal preferences namespace.  
**Root Cause:** `secureKey()` validates via `SAFE_KEY.matcher(key).matches()` but pattern definition absent from evidence.  
**Evidence:** Line 139 throws on invalid key; pattern unknown.  
**Reproduction:** Attempt `secureSet({key: "../../malicious", value: "x"})` — if accepted, writes outside intended scope.  
**Fix Direction:** Define `SAFE_KEY = Pattern.compile("^[a-zA-Z0-9._-]{1,128}$")`; document in code.  
**Regression Test:** Fuzz key input with path traversal, null bytes, long strings; all must reject.

---

### A07-007 | MEDIUM | STRONG
**Surface:** `apk/verify-apk.cjs:40` — Password input detection heuristic  
**Symptom:** Grep for `type="password"` only; misses `type='password'`, `inputmode="password"`, `-webkit-text-security`, or Capacitor plugin password fields.  
**Root Cause:** Regex `/type=["']password["']/i` (line 40) single-quote/double-quote only; no attribute variations.  
**Evidence:** Line 40 assertion.  
**Reproduction:** Add `<input type='password'>` or `<input inputmode="password">` to HTML; verification passes.  
**Fix Direction:** Expand check: `/(type|inputmode)\s*=\s*["']password["']/i` and scan for `autocomplete="current-password"`.  
**Regression Test:** Fixture HTML with 5 password field variants; all must trigger failure.

---

### A07-008 | MEDIUM | VERIFIED
**Surface:** `apk/materialize-native-platform.cjs:167-193` — GitHub client ID validation missing  
**Symptom:** `githubClientId` reads from call input; no format validation (should match `^[a-zA-Z0-9]{20}$` for GitHub OAuth Apps).  
**Root Cause:** Line 167-170 accepts any string; malicious caller could inject arbitrary `client_id` in device flow, causing user to authorize wrong app.  
**Evidence:** No regex/allowlist on `clientId`.  
**Reproduction:** Call `githubBeginDeviceFlow({clientId: "attacker_client_id"})`; user sees attacker's app name.  
**Fix Direction:** Validate client ID format; optionally pin to known Seven AI client ID(s) in native code.  
**Regression Test:** Invalid client IDs (empty, wrong length, special chars) must reject with `SEVEN_GITHUB_INPUT`.

---

### A07-009 | LOW | VERIFIED
**Surface:** `apk/materialize-native-platform.cjs:237-240` — GitHub job logs ZIP decompression no size limit per entry  
**Symptom:** `ZipInputStream` reads entries until `MAX_GITHUB_RESPONSE` (180KB) total, but single entry could expand to >180KB before truncation, causing OOM.  
**Root Cause:** Line 239-240 loops `zin.read(buf)` without per-entry cap.  
**Evidence:** `MAX_GITHUB_RESPONSE` only checked on `text.size()`.  
**Reproduction:** Craft ZIP with 10MB uncompressed entry; observe memory pressure.  
**Fix Direction:** Add per-entry byte limit (e.g., 64KB) and total limit; use `ZipEntry.getSize()` if available.  
**Regression Test:** Mock job logs endpoint serving ZIP with large entry; call must complete without OOM.

---

### A07-010 | LOW | NEEDS_RUNTIME_TEST
**Surface:** `apk/materialize-android-motion-bridge.cjs:30-32` — Animation scale reads lack fallback for restricted APIs  
**Symptom:** `Settings.Global.getFloat` may throw `SecurityException` on Android 14+ if caller not system app; bridge crashes silently.  
**Root Cause:** Lines 30-32 assume permission; no try-catch. `retrySevenAndroidReducedMotion` (line 37) retries on `"true"` string mismatch, not exception.  
**Evidence:** No exception handling in bridge snippet.  
**Reproduction:** Run on API 34+ emulator without `WRITE_SECURE_SETTINGS`; bridge fails, reduced-motion not synced.  
**Fix Direction:** Wrap each `getFloat` in try-catch; default to 1.0f on exception; log warning.  
**Regression Test:** Instrumentation test mocking `SecurityException`; bridge must not crash.

---

### A07-011 | LOW | VERIFIED
**Surface:** `apk/patch-android.cjs:113-115` — Instrumentation test uses `Date.now()` for secure store key, flaky under parallel test runs  
**Symptom:** Key collision possible if two test instances run same millisecond.  
**Root Cause:** Line 115: `k='ci.webview.roundtrip',v='seven-'+Date.now()`.  
**Evidence:** Test assertion line 115.  
**Reproduction:** Run test suite twice in same ms (CI parallelism); second run may read first's value.  
**Fix Direction:** Use `System.nanoTime()` or UUID in Java test (line 125 does correctly).  
**Regression Test:** Run test 100x in loop; no false passes.

---

### A07-012 | LOW | STRONG
**Surface:** `apk/harden-native-platform.cjs:19` — Forbidden lint suppression check only scans for `@SuppressLint("WrongConstant")`  
**Symptom:** Other dangerous suppressions (`SetWorldReadable`, `SetWorldExecutable`, `InsecureHostnameVerifier`) not caught.  
**Root Cause:** Single-string check (line 19).  
**Evidence:** Line 19 only.  
**Reproduction:** Add `@SuppressLint("InsecureHostnameVerifier")` to generated Java; harden passes.  
**Fix Direction:** Expand forbidden list to all security-relevant suppressions.  
**Regression Test:** Fixture Java files with each forbidden suppression; all must fail harden.

---

## Cross-System Contradictions / Races
1. **Token refresh vs. secure store** — `ensureGithubToken` calls `secure.put` (line 190) while `secureGet` may be reading same key; no atomicity guarantee in `SevenSecureStore` (preferences `commit()` is async-ish).
2. **Device proof vs. capture scripts** — `capture-android-release-profile.cjs:63` creates device proof with `environmentType` from env; `capture-android-legacy-launcher-ui.cjs:160` hardcodes `"EMULATOR"`. Inconsistent evidence schema if run on physical device.
3. **Zero-Key claim vs. GitHub client ID** — `verify-apk.cjs:42` asserts "Zero-Key routing" but native bridge requires GitHub OAuth client ID (line 167) — not a key, but an app identity that must be configured. Documented? Not in evidence.

---

## Missing / Error States
- `githubApiOnce` (line 212) catches `Exception` broadly; 401/403 not distinguished from network error — caller cannot trigger re-auth.
- `secureGet` returns `{found:false}` on missing key but also on decryption failure (line 255) — indistinguishable.
- `githubDisconnect` (line 244) removes keys but does not revoke token at GitHub (no `DELETE /applications/{client_id}/token`).
- No handling for GitHub OAuth app deletion / client secret rotation.

---

## False Positives Rejected
| Candidate | Reason |
|-----------|--------|
| `eval`/`new Function` in web payload | Static scan shows 0 hits; `github-self-dev.js` uses dynamic `import` only. |
| Password inputs in APK | `verify-apk.cjs:40` heuristic incomplete (see A07-007) but no actual password fields found in extracted HTML. |
| Broad storage permission | `getCapabilities` returns `broadStoragePermission:false` (line 163) — correct for SAF-only design. |
| Keystore key export | `SevenSecureStore` key alias fixed, non-exportable by default (Android Keystore). |

---

## Top 5 Highest-Priority Bugs
1. **A07-001** — Concurrent token refresh clobber + expiry enforcement gap (CRITICAL)
2. **A07-002** — AES-GCM IV generation unverified (CRITICAL)
3. **A07-003** — GitHub API blocklist incomplete (HIGH)
4. **A07-004** — No certificate pinning on GitHub API (HIGH)
5. **A07-005** — Device flow polling interval ignored (HIGH, NEEDS_RUNTIME_TEST)

---

BUGHUNT=COMPLETE

codex

tokens used
550,422
