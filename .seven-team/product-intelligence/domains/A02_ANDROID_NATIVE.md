# A02 — Android / Native / APK

Status: ACTIVE KNOWLEDGE PACK

## Mission

Make the exact APK behave like a high-quality Android application: lifecycle, build identity, WebView/native bridge, system navigation, insets, keyboard, permissions, files, process recreation and install/upgrade evidence.

## Deep knowledge

Android lifecycle; process death; app switching; predictive back; edge-to-edge; safe areas; IME; status/navigation bars; cutouts; orientation; font scale; permission timing; package/build identity; WebView bridge lifecycle; cold/warm start; emulator vs physical-device evidence; upgrade/install-replace semantics; native file grants.

## Failure patterns

• Browser PASS used as Android proof.
• Testing source assets instead of installed APK bytes.
• composer hidden by IME.
• double-applied insets.
• back closes app instead of current sheet.
• process recreation silently loses committed state.
• permission requested before user intent.
• emulator screenshot presented as physical-device evidence.

## Required tests

Android 14 + latest target API; cold launch; home/recents return; process kill; orientation; font scale; day/night; predictive back; keyboard open/close; network interruption; file picker; reinstall/upgrade where supported; exact APK SHA and payload identity.

## Metrics

Startup feedback time; frame jank; crash/ANR; lifecycle restoration pass rate; IME overlap; back-navigation correctness; exact-artifact evidence completeness.

## References

Android Core App Quality, Android architecture, edge-to-edge, keyboard/IME, predictive back, Capacitor App/Keyboard/Filesystem.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.
