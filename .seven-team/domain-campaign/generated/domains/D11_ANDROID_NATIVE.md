# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: READY

DOMAIN_ID=D11_ANDROID_NATIVE
SOURCE_ANALYSIS=Harvested Android docs collectively define core app quality expectations (stability, UX, navigation, accessibility), Android architecture recommendations (layered design, ViewModel, lifecycle-aware components, DI, testing), edge-to-edge (draw under system bars, handle insets, display cutouts), predictive back (Android 14+ with fallback), and Capacitor App/Keyboard APIs (app lifecycle events, deeplinks, keyboard visibility/insets). Key points: edge-to-edge requires handling window insets (not just transparent bars), predictive back requires API-level gating and migration of custom back handling, IME state affects layout and composition; Capacitor Keyboard emits show/hide and provides info but app must react to insets. Limitations: harvested list is doc-focused (quality guidelines, architecture, design, Capacitor API) — lacks concrete repo-level native bridge implementation details beyond Capacitor API surface; localized pages exist but do not add technical substance. Freshness: Android guidance is current (edge-to-edge, predictive back) and Capacitor App/Keyboard docs are current. No obvious contradictions.
CURRENT=Repo evidence (inspected):
- Capacitor is adapter-only (remake/ARCHITECTURE.md §6). Typed bridge envelope defined: BridgeRequest<T>, BridgeResult<T> with ok/error (remake/ARCHITECTURE.md §6). Contract tests must run JS mock bridge + Android instrumented round-trip.
- Android project present: android/app/src/main/AndroidManifest.xml exists (basic Capacitor app config). android/app/build.gradle exists (Capacitor plugin deps referenced; see below).
- Capacitor config present (capacitor.config.*) — configures appId/appName (standard Capacitor setup). 
- Bridge types/envelope referenced in architecture; no new production edits performed. Existing codebase shows Capacitor plugins integrated (App, Keyboard) per typical setup; exact plugin registration/native handlers not exhaustively enumerated in this pass but architecture mandates typed envelopes and lifecycle-managed services (SAF, GitHub, file access). 
- Architecture also emphasizes: IME composition lock, send eligibility, auto-grow measurement request; Enter-to-send disabled during composition (remake/ARCHITECTURE.md §2). Cancellation uses bridge cancellation token mapped to taskId (remake/ARCHITECTURE.md §4). These are constraints the native layer must respect.
TARGET=Desired behavior aligned with sources:
- Edge-to-edge compliant: app draws under system bars, handles insets (status/nav/IME), respects display cutouts, and avoids overlap. Proper window insets handling on Android (e.g. WindowInsetsController, fitsSystemWindows/insets padding) coordinated with Capacitor/keyboard events.
- Predictive back: adopt Android 14+ predictive back where appropriate; provide fallback for older API levels; do not break custom back handling. 
- IME/lifecycle correctness: keyboard show/hide drives layout (insets), composition state honored (IME composition lock), lifecycle events (App plugin) drive state safely; bridge operations honor cancellation tokens.
- Native bridge remains adapter-only with typed envelopes; Android instrumented round-trips validate envelope compatibility.
NOW=First high-value slice (smallest material improvement):
1. Verify edge-to-edge readiness: inspect android/app/src/main/java/... and themes/styles for edge-to-edge flags (enableEdgeToEdge), window insets handling. 
2. Verify predictive back readiness: check AndroidManifest/Activity config and onBackPressed/predictive back APIs; confirm API level gating. 
3. Confirm Capacitor Keyboard/App plugin wiring and how insets/keyboard events propagate to UI (to avoid IME overlap). 
4. Validate bridge envelope usage exists end-to-end (types + requestId propagation + ok/error) against contract test surface.
NEXT=Next improvements:
- Add explicit insets handling (consume/dispatch system bars/IME insets) and test on API levels covering older devices. 
- Implement predictive back migration plan if any custom back exists; add tests/guards. 
- Strengthen lifecycle ownership: ensure SAF URI grants, file access, GitHub native ops are lifecycle-managed (per arch) and cancel on pause/destroy with taskId. 
- Add Android instrumented tests covering keyboard show/hide + IME composition + back behavior.
LATER=Longer-term ideas:
- Adopt Core App Quality checklist items relevant to stability/navigation/permissions. 
- Add device identity collection (see D24) tied to installed evidence. 
- Consider gesture navigation edge cases, display cutouts, multi-window, RTL.
TESTS=Deterministic/Android/eval proof ideas:
- JS mock bridge tests: envelope shape, requestId, ok/error paths, cancellation propagation.
- Android instrumented round-trip: BridgeRequest→native→BridgeResult with fixtures.
- UI tests: edge-to-edge insets on different screen sizes/cutouts; keyboard open/close/IME composition; predictive back flows with API gating. 
- Adversarial: rapid show/hide keyboard, lifecycle churn (pause/resume), cancellation mid-bridge call, invalid envelope.
RISKS=Security/privacy/performance/Android/RTL/cross-system:
- Misconfigured edge-to-edge can cause content under display cutouts or overlap with system bars. 
- Predictive back incorrect gating (API<34) can break navigation. 
- IME/keyboard events can cause layout thrash; need careful insets handling. 
- Bridge surface must remain typed; avoid leaking tokens/PII in envelopes. 
- Cross-system: Capacitor adapter-only must be preserved (no UI logic leaking to native except via envelope). RTL/multi-window need validation.
FIRST_SLICE=Inspect Android native code (Activity/MainActivity, themes, plugins) for edge-to-edge, predictive back, Keyboard/App integration and bridge envelope usage; document concrete findings with file paths. This is RESEARCH-only (no edits). Smallest slice that materially informs release readiness.
KNOWN_UNKNOWNS=Missing concrete evidence in this scan: specific MainActivity implementation, plugin classes, how BridgeRequest/BridgeResult types are serialized on Android side, exact insets handling code, predictive back registration, signing config (see D24), and installed-device runtime evidence (emulator/device runs). Also need to confirm contract test locations for JS mock + Android instrumented round-trips.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (insufficient concrete implementation details in inspected files to fully assess edge-to-edge/predictive back/bridge envelope implementation; need deeper read of android/app/src/main/java and res/values/themes)
