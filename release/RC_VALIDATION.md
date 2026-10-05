# Seven AI — RC Validation Pin

Created: 2026-10-05
Base main SHA: aa3ac7abf5094f327180ec0fe0b5ba2a14a997e2

Purpose: freeze one release-validation snapshot so long Android API 36 / API 34 gates are not cancelled by unrelated pushes to main.

Acceptance gates for this branch:
- Seven AI tests / all.cjs
- browser release evidence upload
- native Android generation
- Android lint + unit tests + APK build
- APK package/version/signature/payload verification
- Android 16 connected WebView instrumentation
- Android 14 connected WebView/UI instrumentation
- post-device APK verification
- installable APK artifact + verification evidence

This file is release-control metadata only and is not loaded by the application.
