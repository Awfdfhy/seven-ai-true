# Seven Domain Roadmaps — cycle evidence

Ready domains: 5/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: INSUFFICIENT

DOMAIN_ID=D02_MEMORY_CONTEXT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=MCP spec 2026-07-28 /server/tools (primary) + MCP Tasks extension draft (primary) + MCP TS SDK v2 + migration support-2026-07-28 (primary) + OpenAI function calling + programmatic tool calling (primary) + BFCL V4 + ToolSandbox/τ-bench/AgentDojo/AgentDyn/Adaptive Eval papers + OWASP GenAI Top-10 2026 + LLM06 Excessive Agency (secondary). Collectively: tools must be capability-declared, schema-validated, scope/approval-bound, replayable, and the LLM must never be an authorization boundary. OWASP LLM06 warns against excessive agency — tool invocation must be gated by deterministic checks, not model discretion. Limitations: harvested bodies truncated to assets; exact MCP tool schema/approval text not fully readable — treat as starting points.
CURRENT=No committed tool system found in the c265 worktree root (no `tools/`, `capability-graph/`, or permissions module). The closest trust boundary is the native `SevenPlatformPlugin` GitHub bridge (`githubApi` with `allowedGithubPath` blocklist, `GITHUB_METHOD` GET|POST|PUT|PATCH|DELETE) — effectively Seven's only "tool-like" execution surface today, and it is a blocklist not an allowlist (see D14). Self-dev exports raw primitives (`api`, `atomicCommit`, `mergePullRequest`, `dispatchWorkflow`) with no capability gate (F2). MCP 2026-07-28 tool semantics, Tasks extension, capability graph, schema validation, approval binding, idempotency, replay, and audit are NOT present. ReferenceMonitor/approval binding/idempotency/audit tests are not green (per Tool System v1 campaign preconditions).
TARGET=Deterministic tool system: capability graph + schema validation + scope/approval/replay checks before any execution; LLM never an authorization boundary; every tool call passes deterministic schema/capability/scope/approval/replay. Align with MCP 2026-07-28 tool shape and OpenAI function-calling patterns. Owned jointly with A04 (architecture) + A07 (security); do not duplicate A04's runtime/store/bridge ownership.
NOW=First slice: inventory existing "tool-like" surfaces (GitHub bridge `githubApi`, self-dev `atomicCommit`/`api`, attachment read/write chunks) and document them as the current capability surface; add a deterministic allowlist-based `allowedGithubPath` replacement (see D14 FIRST_SLICE) as the first concrete capability gate; add unit test asserting every native GitHub path/method is either explicitly allowed or explicitly rejected (default-deny). Do not build a full MCP server or capability graph in this slice.
NEXT=Implement capability graph + schema validation for tools; approval binding + idempotency keys + replay log; ReferenceMonitor; ReferenceMonitor/approval/idempotency/audit tests green before connecting high-impact external tools (per campaign rule).
LATER=MCP 2026-07-28 server/tools conformance; MCP Tasks extension; programmatic tool calling; benchmark against BFCL/ToolSandbox-style evals.
TESTS=default-deny path/method matrix test; protected-path rejection test (shared with D14); replay/idempotency tests once capability gates exist; no live provider calls.
RISKS=duplicate tool runtimes/bridges (one owner per subsystem rule); connecting high-impact external tools before ReferenceMonitor/approval/idempotency/audit are green; LLM-as-authz boundary (OWASP LLM06).
FIRST_SLICE=inventory tool-like surfaces + default-deny `allowedGithubPath` allowlist + path/method matrix unit test.
KNOWN_UNKNOWNS=no existing capability graph/permissions module found — confirm absence across `remake/`, `release/`, `apk/`; no MCP conformance test harness present.
DOMAIN_VERDICT=READY_FOR_PLAN


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: INSUFFICIENT

DOMAIN_ID=D04_CODING_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: INSUFFICIENT

DOMAIN_ID=D05_SELF_DEVELOPMENT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: INSUFFICIENT

DOMAIN_ID=D06_RPG_WORLD
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D07_RESEARCH_WEB
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: INSUFFICIENT

DOMAIN_ID=D09_DEEP_THINK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=Capacitor Filesystem plugin API (primary) + Android SAF shared storage/documents (primary) + OWASP MASVS (primary). Collectively: file access must be user-authorized (SAF `ACTION_OPEN_DOCUMENT`/`ACTION_CREATE_DOCUMENT`), persistable URI permissions, chunked read/write, metadata, no broad storage permission, MIME handling, Android 4.4+ SAF. Limitations: harvested bodies truncated to CSS; exact Capacitor/Android API details not fully verified — starting points.
CURRENT=Seven has a working SAF-based attachment surface: `SevenPlatformPlugin` exposes `openDocument`/`createDocument`/`readChunk`/`writeChunk`/`releaseDocument` with `content://`-only URI acceptance, persistable URI permission handling (hardened by `apk/harden-native-platform.cjs`: explicit read/write flags, no `WrongConstant` suppression), `MAX_CHUNK=262144`, `MAX_GITHUB_RESPONSE=2MB`. `SevenSecureStore` Keystore for at-rest encryption. Web side: `release/attachment-loader.js` (lazy-boot `attachment-runtime.js`) + `release/attachment-runtime.js` (MAX_TEXT_BYTES 8MB, text/binary extension categories, photo/file menu, Arabic labels, drag/drop/paste, composer patch, `sendMessage` wrapper clears selection). Existing Android test `secureStoreEncryptsAtRest` + `verifiedReleaseBootsInsideAndroidWebView` assert `SevenAttachmentLoader` present, `SevenAttachments` undefined (lazy), `secureSet/get/remove` round-trip. Gap: no multimodal/PDF rendering path (`vendor-pdf.cjs` stub, `pdf-runtime.js` 637 bytes, `SevenPdf.loaded===false` asserted — PDF not loaded); no attachment persistence/recovery across restart; no file-type allowlist beyond extension categories; no scanned executable/archive/policy gating on attached files; no RTL-specific attachment UX audit.
TARGET=SAF-gated, chunked, user-authorized file/attachment handling with PDF/multimodal support, at-rest encryption via Keystore, file-type policy (no executables by default), restart persistence of attachment references (not binaries), Arabic/RTL parity, no broad storage permission (`broadStoragePermission:false` already reported).
NOW=First slice: add unit tests for SAF permission correctness (read vs write flag selection already hardened; assert `releasePersistableUriPermission` releases only held flags); add file-type policy test (executables/archive rejected by default); verify `attachment-runtime.js` extension categories vs `attachment-loader.js` triggers are coherent; document PDF gap (`SevenPdf.loaded===false`) as a known limitation, not a fix in this slice.
NEXT=PDF/multimodal rendering path; attachment persistence across restart (references, not binaries); scanned-content policy; RTL attachment UX audit; Android device evidence for attachment flows.
LATER=Multimodal model input (image/audio) integration; OCR; large-file streaming beyond 8MB text cap with backpressure.
TESTS=SAF read/write flag unit test; persistable URI release test (already partially in `harden-native-platform.cjs` style); file-type allowlist/rejection test; `secureStoreEncryptsAtRest` (exists); `verifiedReleaseBootsInsideAndroidWebView` attachment assertions (exist). No live provider calls.
RISKS=SAF URI permission leakage if release flags wrong (mitigated by harden pass); executable/archive attachment leading to RCE/XSS (file-type policy needed); attachment binaries bloating localStorage/IndexedDB (persist references only); RTL text truncation in attachment chips.
FIRST_SLICE=SAF permission unit tests + file-type default-deny policy test + coherence check between loader/runtime extension categories.
KNOWN_UNKNOWNS=PDF render path absent (`vendor-pdf.cjs`/`pdf-runtime.js` stubs) — confirm whether intentional or a gap; no Android device/emulator evidence for attachment flows this cycle (`apkBuilt:false`).
DOMAIN_VERDICT=READY_FOR_PLAN


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: READY

DOMAIN_ID=D11_ANDROID_NATIVE
SOURCE_ANALYSIS=Android core app quality [SOURCE primary] developer.android.com/docs/quality-guidelines/core-app-quality: app quality tests directly drive installs, reviews, engagement, retention. Android architecture recommendations [SOURCE primary] developer.android.com/topic/architecture/recommendations: layered UI, lifecycle management, DI, testing. Edge-to-edge [SOURCE primary] developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge: draw under system bars, handle insets + display cutouts, never occlude interactive targets. Predictive back [SOURCE primary] developer.android.com/design/ui/mobile/guides/patterns/predictive-back: handle back gesture with animation, dispatch system back consistently, dismiss overlays via back. Capacitor App API [SOURCE primary] capacitorjs.com/docs/apis/app: pause/resume/foreground/background events, deep links, app URL open, persisted plugin state. Capacitor Keyboard API [SOURCE primary] capacitorjs.com/docs/apis/keyboard: show/hide events, visibility control, scroll/resize behavior. Collectively they say: platform quality is measured on installed devices, lifecycle/resume/back/keyboard/insets are device-provable only, and Capacitor is the JS↔native adapter — never a second runtime. Limitations: harvested notes are metadata-level (no full page text re-fetched); no Capacitor native plugin bytecode reviewed beyond repo sources; no IME-specific Android guidance harvested beyond the Keyboard API note. No disagreements among sources; layers are complementary.
CURRENT=Legacy root app `ai.seven.v243` / Seven 2.4.3 / Capacitor 8.5.2: `apk/patch-android.cjs` injects `windowSoftInputMode=adjustResize` + `density` configChanges, `allowBackup=false`, `usesCleartextTraffic=false`; CI builds `assembleDebug` only (release variant unexercised); API 34 + API 36 emulator smoke with `screencap` capture but NO golden-baseline diff (P0-1 blocker per `.seven-team/reports/wave-01/A02-android-evidence.md`); no `WindowInsets`/`setDecorFitsSystemWindows`/`ColorMode` native inset model (`materialize-native-platform.cjs` contains none); back behavior not covered by generated tests; IME/keyboard evidence explicitly NOT trusted on `-no-window -gpu swiftshader_indirect` x86_64 emulator (needs physical device); font scale only on API 34 (1.15), API 36 at default. A02 bughunt: A02-001 storage failure leaves `document.body.inert=true` (no recovery UI), A02-002 queued IndexedDB persistence races Android process death (no pagehide/freeze flush), A02-003 native Capacitor resume not proven wired to Web runtime, A02-004 Stop/cancellation implementation contradicts its own mobile policy, A02-005 `navigator.onLine` link state presented as connectivity. Remake V3 `ai.seven.remake.v3` / Capacitor 8.5.2: Phase 7 bridge COMPLETE — typed request/response envelopes with requestId correlation [remake/src/platform/android/contracts.ts], `AndroidBridgeClient` with abort→transport.cancel(requestId) mapping + late-complete-ignore [remake/src/platform/android/android-bridge.ts], `CapacitorAndroidNativeTransport` gated on `isNativePlatform()===true && getPlatform()==="android"` [capacitor-native-transport.ts], `AndroidPlatformService` capability negotiation + SAF `content://`-only grant validation with truth matching [application/android/android-platform-service.ts], mock-transport unit tests [src/integration/phase7/]. Installed gate PASS on API 34 + API 36: package/version + per-file SHA-256 identity + WebView boot smoke + real bridge round-trip [FINAL_RELEASE_STATUS.md, artifact Seven-Remake-V3.apk id 11287572718]. BUT D11-specific coverage (resume/lifecycle wiring, back handler, keyboard/IME, safe-area insets) is NOT proven for remake beyond the bridge round-trip; docs in PHASE7_ANDROID_BRIDGE.md state device-specific native implementation and installed-APK evidence are release gates, not browser-simulated tests.
TARGET=One Capacitor adapter (no second native runtime), typed envelopes only. On installed device: edge-to-edge content under system bars with insets handled and no occlusion of 44px-touch-floor interactive targets; predictive back dismisses dialogs/sidebar and dispatches system back consistently; keyboard show/hide keeps composer visible + unoccluded, enter-to-send disabled during IME composition (architecture invariant); Capacitor App pause/resume events feed the idempotent resume synchronizer; IndexedDB flush on pagehide/freeze/background (A02-002) and storage failure never leaves document inert (A02-001); installed identity (package/version/per-file hash) proven on API 34 + API 36 (already PASS for remake — keep as regression).
NOW=First high-value slice: add D11 device coverage to the remake Android release test suite via `remake-materialize-android.cjs`-generated `SevenRemakeLifecycleTest.java`: (1) app pause/resume → JS resume synchronizer refresh (`document.visibilityState`, viewport CSS vars, room UI), (2) system back dismisses open dialog/sidebar, (3) keyboard show → composer visible and interactive targets unoccluded, (4) read `env(safe-area-inset-*)` + assert interactive-target rect containment (no occlusion). Wire into `remake/package.json` `android:ci` Gradle test step (keep debug variant; release variant is D24's slice). For legacy: no new production surface under feature freeze; log gaps as release blockers.
NEXT=Exercise `assembleRelease` once (D24 slice) so release signing/config is not a hypothesis; physical-device ARM/GPU spot check (emulator is x86_64 swiftshader); golden baseline diff for screenshots (convert capture→verdict); font-scale matrix (API 34 1.15 + API 36 1.5); Arabic RTL + 320px responsive floor on device; split API 34/36 into separate CI jobs to stay inside the 50-min budget.
LATER=Tablet/foldable profile; predictive back animation timing on real device; IME composition-lock integration with native keyboard events (enter-to-send disabled during composition); per-Android-System-WebView version matrix; gesture-navigation back-to-home edge cases.
TESTS=Unit (existing, keep green): requestId correlation → BRIDGE error on mismatch; non-content:// SAF URI rejected; duplicate capability rejected; cancellation→late-success ignored [src/integration/phase7/phase7.test.ts]. Android instrumented (existing): installed payload identity + version + package, WebView boot smoke + bridge round-trip [remake-materialize-android.cjs SevenRemakeReleaseTest]. Android instrumented (NEW in this slice): pause/resume state refresh, back dismissal, keyboard→composer visible, inset non-occlusion. Adversarial: malformed bridge response → BRIDGE; transport exception → structured BRIDGE error (retryable); SAF grant truth mismatch (uri/read/write/persisted) rejected. E2E: send→stream→cancel→no partial assistant commit on device (Remake CI phases 1–2, device run). Eval: none directly owned by this domain (platform).
RISKS=Security: SAF scope over-grant (read+write when read suffices); secrets never modeled as bridge response state (invariant); plaintext secret storage avoided (legacy SevenSecureStore AES-GCM in Android Keystore). Privacy: content-URI logging must not leak paths. Performance: two emulator boots already strain the 50-min CI budget; adding matrix cells needs job split. Android: swiftshader/-no-window IME evidence untrusted; debug-only build means release signing/config unproven. RTL: Arabic font-scale/layout untested on device. Cross-system: TaskManager cancellation mapped to native token; legacy IndexedDB background flush missing; AppKernel single owner preserved (no duplicate bridge).
FIRST_SLICE=Generated `SevenRemakeLifecycleTest.java` + four device assertions (resume refresh, back dismissal, keyboard→composer visible, inset non-occlusion), added to `android:ci` Gradle step; debug variant only; no legacy source changes.
KNOWN_UNKNOWNs=Physical-device ARM/GPU WebView rendering; `assembleRelease` actually runs for remake (workflow shows `assembleDebug`; FINAL_RELEASE_STATUS claims PASS — reconcile); real IME keyboard show/hide on device; predictive back animation timing; Arabic RTL at font_scale 1.5 on device; installed API 34/36 gate is KNOWN PASS (not unknown).
DOMAIN_VERDICT=READY_FOR_PLAN


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: INSUFFICIENT

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: INSUFFICIENT

DOMAIN_ID=D13_ARABIC_RTL_A11Y
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: READY

DOMAIN_ID=D14_SECURITY_PRIVACY
SOURCE_ANALYSIS=OWASP MASVS (primary) + MCP 2026-07-28 spec (primary) + OpenTelemetry GenAI semantic conventions (primary). MASVS governs mobile app security baseline (keystore, network security, storage encryption); MCP spec governs tool/authorization boundaries and capability discovery; OTel GenAI covers agent observability attribution. All three are current/authoritative. Disagreements: none material — they layer (MASVS = mobile runtime, MCP = protocol boundary, OTel = telemetry). Limitations: harvested page bodies were truncated to CSS/font assets for modelcontextprotocol.io and mas.owasp.org, so exact normative text (e.g., specific MASVS control IDs) was not fully readable; must be treated as starting points, not fully verified citations.
CURRENT=Seven's trust boundary is Capacitor → `SevenPlatformPlugin.java` (materialized by `apk/materialize-native-platform.cjs`; no committed android/ project). Native-enforced controls verified: (1) Keystore-backed `SevenSecureStore` with `setRandomizedEncryptionRequired(true)`, random per-encryption IV stored as `iv.ciphertext` (A07-002 STRONG); (2) `allowedGithubPath` blocklist of 10 repo-admin/secret substrings (F3); (3) GitHub device-flow OAuth with tokens in Keystore (F5). Client-side-only/advisory gaps verified by A07 wave-01 + bughunt A07: (F1) `PROTECTED_PATHS` (9 regexes incl. `.github/workflows/`, `evolution/`, `all.cjs`, `verify.cjs`, `release/*.test.cjs`, etc.) exists only in web runtime `release/github-self-dev.js:9-20`; native has no counterpart. (F2) `window.SevenGitHubSelfDev` exports raw `api`/`atomicCommit`/`mergePullRequest`/`dispatchWorkflow` with no capability gate — `api()` performs no protected-path check. (F4) divergent second protect-list in `evolution/experiment-lab.cjs`. (F6) credentials embedded into release HTML via `window.__SEVEN_EMBEDDED_CREDENTIALS` (GROQ/NVIDIA/OpenRouter/Gemini/LLM7/AION/Mistral/Zai/Cloudflare/Search gateway) + localStorage fallback for GitHub auto-merge opt-in (`seven_github_auto_merge_v1`, `seven_github_build_apk_v1`). (F8) auto-merge/APK-dispatch persisted in localStorage with no action-time confirmation. (A07-001 CRITICAL) token refresh lacks expiry enforcement/skew tolerance and has no refresh mutex — concurrent callers can clobber tokens. (A07-003 HIGH) blocklist misses Actions variables, org secrets, codespaces v2, fine-grained PAT scopes. (A07-004 HIGH) no certificate pinning / hostname verification — `HttpURLConnection` trusts system CAs only. No test asserts protected-path policy blocks writes; no native↔JS protect-list parity test.
TARGET=Native-enforced, capability-gated GitHub self-dev boundary: (1) unified allowlist-backed protect-list enforced natively (mirroring JS `PROTECTED_PATHS` exactly) so exported `api()` cannot bypass; (2) refresh-token mutex + expiry enforcement with clock skew tolerance; (3) certificate pinning (GitHub leaf/intermediate public key) on `githubApi`/`githubJobLogs`; (4) action-time confirmation for auto-merge/APK-dispatch destructive opt-ins (not silent localStorage persistence); (5) credentials moved out of bundle into Keystore-only custody (larger, out of first slice); (6) deterministc parity test native↔JS protect-lists. Preserve single owner: native bridge remains sole trust boundary; no duplicate runtime/store/bridge.
NOW=First slice: (a) extend native `allowedGithubPath` in `apk/materialize-native-platform.cjs` to mirror the JS `PROTECTED_PATHS` regexes as a hard allowlist (not blocklist), rejecting any path/method not on the safe set; (b) add refresh mutex + `expires_in` validation + skew tolerance to `ensureGithubToken`/`storeGithubToken`; (c) add `release/github-self-dev-protected-paths.test.cjs` unit test loading the JS module with a stubbed `Capacitor.Plugins.SevenPlatform`, asserting `atomicCommit`/`normalizeChanges` reject each `PROTECTED_PATHS` entry; (d) string-containment parity test asserting Java source contains each JS regex (mirroring `harden-native-platform.cjs` style). Does NOT touch credential embedding (Gap E) — separate build/packaging change.
NEXT=Add certificate pinning; replace blocklist with allowlist across all sensitive GitHub endpoints; add merge/dispatch action-time confirm modal (must not regress `release-verify.cjs` inert/focus/a11y contract); extract shared policy module between `evolution/experiment-lab.cjs` and native (out of slice per D3); add tests for merge/dispatch confirmation and localStorage opt-in reset/labeling.
LATER=Move all embedded credentials (Cloudflare/Search/LLM keys) out of bundle into Keystore; OAuth fine-grained PAT with minimal scopes; device-bound credential attestation; formal capability/authorization model for self-dev (no exported raw primitives).
TESTS=Deterministic: `github-self-dev-protected-paths.test.cjs` (reject each protected path via `atomicCommit`/`normalizeChanges`; stubbed native plugin); native↔JS regex parity test (string containment on Java source); `ensureGithubToken` unit tests (expired/missing expiry, skew tolerance, 10 parallel callers → single refresh); `secureStoreEncryptsAtRest` already exists (distinct IVs). E2E/Android: `SevenSmokeTest.java` secure round-trip already covers `secureSet/get/remove` + capabilities; extend to assert protected native path returns `SEVEN_GITHUB_API` 403-equivalent. Adversarial: parametrized test hitting each known sensitive endpoint (Actions variables, org secrets, codespaces) → all must be blocked. No live provider calls (blocked in tests per README).
RISKS=R1 native allowlist could break legitimate self-dev writes targeting now-protected paths (mirroring JS list exactly mitigates drift but is a real Android rebuild); R2 confirm modal must not regress inert/focus/a11y contract (`release-verify.cjs:402-433`); R3 dual protect-lists drift until unified (parity test mitigates); R4 credential embedding untouched — messaging must not imply all secrets are Keystore-protected (Cloudflare/Search keys remain embedded); R5 Android native toolchain + emulator needed to regenerate `SevenPlatformPlugin.java` (android/ materialized, not committed); RTL/Arabic strings in self-dev panel must keep confirm modal coherent.
FIRST_SLICE=native allowlist mirroring JS `PROTECTED_PATHS` + refresh mutex/expiry+skew + `github-self-dev-protected-paths.test.cjs` + native↔JS parity test. Smallest change that materially improves the domain: converts the highest-impact client-only control (protected-path policy) into a native-enforced invariant.
KNOWN_UNKNOWNS=exact MASVS control IDs not fully verified (page bodies truncated); whether any legitimate self-dev flow writes to a now-protected path (requires Android rebuild + regression run); exact clock-skew tolerance value; no APK built this cycle (`apkState: BLOCKED_NO_PRODUCT_DELTA`, `apkBuilt: false`) so native changes are unproven on device.
DOMAIN_VERDICT=READY_FOR_PLAN


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: INSUFFICIENT

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: INSUFFICIENT

DOMAIN_ID=D16_NETWORK_RESILIENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: INSUFFICIENT

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D18_TESTING_EVALS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: INSUFFICIENT

DOMAIN_ID=D19_AGENT_ORCHESTRATION
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: INSUFFICIENT

DOMAIN_ID=D20_PRODUCT_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: INSUFFICIENT

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: INSUFFICIENT

DOMAIN_ID=D22_PROTOCOLS_INTEROP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: INSUFFICIENT

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Android app signing [SOURCE primary] developer.android.com/studio/publish/app-signing: upload key → Play App Signing, keystore security, release vs debug signing, versionCode/versionName anchors; no credentials embedded in repo — CI provides keystore via Gradle properties. Core app quality [SOURCE primary] developer.android.com/docs/quality-guidelines/core-app-quality: quality directly affects installs/reviews/engagement/retention. Limitations: metadata-level notes only; no keystore/cert material handled by repo; Play App Signing opt-in status not confirmed for either appId. No disagreement; signing guidance is consistent across locales.
CURRENT=Legacy root: appId `ai.seven.v243`, version 2.4.3, `sevenAndroidVersionCode: 243` [capacitor.config.json, package.json]; `apk/patch-android.cjs` injects deterministic CI signing (`sevenCiKeystore` Gradle property → `testBuildType=release` + `signingConfigs.sevenCi` for debug+release), deletes Capacitor's template instrumented test, writes `SevenSmokeTest.java` (SAF + SevenSecureStore ciphertext checks); `apk/verify-apk.cjs` gates versionCode/versionName match, APK <30MB, required assets, release markers (`SEVEN_FINAL_RELEASE_LAYER_V1`, `data-seven-remake="1"`), no remote PDF runtime, no password inputs, no manual API keys, no `apiKeyInput` fields; `assembleDebug` only — release variant unexercised (R-1..R-3 hypothesis per A02 report). Remake V3: appId `ai.seven.remake.v3`, version 0.0.1 [remake/capacitor.config.json, package.json]; `remake-build-release-manifest.mjs` writes `dist/seven-remake-release.json` — deterministic per-file SHA-256 + `payloadSha256` over descriptor, sorted entries, path-traversal rejection; `remake-materialize-android.cjs` embeds manifest into APK assets + generates `SevenRemakeReleaseTest.java` verifying packageName==artifactId, versionName==manifest version, payloadSha256==sha256(descriptor), every file size+sha256 matches, WebView boot smoke + real `SevenRemakeNative` bridge round-trip (`platform.capabilities` → capabilities incl. `saf`); release gate PASS on API 34 + API 36, artifact `Seven-Remake-V3.apk` id `11287572718` digest `sha256:aa75260a9f713a474a5f02d04c78479a60397b69c26977a896ff86a19ca7b445`, Android release-gate run 37160934350 PASS, Remake CI run 37160934367 PASS [FINAL_RELEASE_STATUS.md]. Remake `android:ci` runs `assembleDebug` only — release variant unexercised here too; `remake-materialize-android.cjs` adds no signing-config prelude (unlike legacy `patch-android.cjs`). No embedded credentials (legacy `release/embedded-credentials.test.cjs`, `verify-apk.cjs`).
TARGET=Deterministic release payload identity proven (remake: PASS). Installed artifact verification: package id, version, every web-payload file hash vs manifest (remake: PASS on API 34/36 — keep regression). Signed release APK built at least once per candidate (BOTH domains currently debug-only → release signing is hypothesized, not proven). No production secrets embedded (verified). Release-gate aggregation PASS/FAIL/BLOCKED/INCONCLUSIVE with no manufactured PASS (phase 12 contract — satisfied for remake, must survive any build-script change).
NOW=First high-value slice: add `assembleRelease` (guarded by `sevenCiKeystore` Gradle property, mirroring legacy `patch-android.cjs`) to remake `package.json` `android:ci` Gradle invocation, plus a remake `verify-apk.cjs` analog asserting release-APK contents/size/markers/no-credentials. Smallest change that converts "release signing hypothesized" into "release signing executed and content-verified." Legacy: no changes (feature freeze); legacy release variant remains a documented gap.
NEXT=Play App Signing opt-in documentation for `ai.seven.remake.v3` (and legacy `ai.seven.v243` if still shipped); upload-key rotation policy; release APK size budget asserted for remake (<30MB legacy precedent); deterministic rebuild reproducibility (same source → same manifest hash + byte-identical APK); installed-device gate on every release candidate (already PASS — keep as regression gate).
LATER=Android App Bundle (.aab) for Play Delivery; feature-module ABI splits; signature scheme v2/v3/v4 verification; auto-update/in-app update flow.
TESTS=Unit: manifest generation deterministic (same input → same payloadSha256); entries sorted; no unsafe paths [remake-build-release-manifest.mjs]. Android instrumented (existing): `installedPayloadIdentityMatchesBuiltManifest`, `installedRemakeBootsAndNativeBridgeRoundTrips` [remake-materialize-android.cjs]. Android instrumented (NEW in this slice): release-APK content gate (size, assets, markers, no credential fields, signing config present when sevenCiKeystore set). Adversarial: tampered manifest → identity mismatch detected; wrong package name → rejected; missing/extra file entry → failure; APK over budget → fail. Eval: phase-12 release-gate aggregation (PASS/FAIL/BLOCKED/INCONCLUSIVE).
RISKS=Security: no credentials embedded (verified); signing key material never in repo (CI Gradle properties only). Android: release variant unexercised in remake `android:ci` (`assembleDebug` only); debug keystore vs release signing divergence could pass debug gate but fail release install. Performance: APK size budget not asserted for remake. Cross-system: payload identity ties to build manifest — any build-script change invalidates installed-gate expectation until rebaselined; one owner (D24/A02 with A08 verification) to prevent duplicate release pipelines.
FIRST_SLICE=Guarded `assembleRelease` in remake `android:ci` + remake `verify-apk.cjs` release-content gate; no legacy changes.
KNOWN_UNKNOWNs=Whether remake release gate ran `assembleRelease` or only `assembleDebug` (workflow vs FINAL_RELEASE_STATUS claim — reconcile); Play App Signing opt-in status; remake release APK size; reproducible-build determinism (byte-identical APK).
DOMAIN_VERDICT=READY_FOR_PLAN


# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: INSUFFICIENT

DOMAIN_ID=D25_HISTORY_ROOMS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: INSUFFICIENT

DOMAIN_ID=D26_SETTINGS_CONTROLS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: INSUFFICIENT

DOMAIN_ID=D27_ERROR_RECOVERY_UX
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D29_REAL_WORKS_CANON — Real Works / Source Fidelity / Canon Branching

Research audit: INSUFFICIENT

DOMAIN_ID=D29_REAL_WORKS_CANON
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.
