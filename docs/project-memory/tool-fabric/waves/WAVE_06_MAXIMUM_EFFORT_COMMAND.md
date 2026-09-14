# Seven Tool Fabric 2.0 — Wave 06 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: Android device capabilities, scheduling, notifications, background work, sharing, sensors and privacy-sensitive platform tools.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 06

Goal: discover the strongest safe Android platform capabilities that let Seven perform useful real-device actions without excessive permissions, battery drain, hidden background work, or brittle vendor hacks.

Research current official Android platform guidance first. Prefer stable system APIs and user-mediated intents/pickers over broad permissions. Treat every platform capability as a permissioned Tool Fabric action with explicit scope, side effects and verification.

Research at minimum:
- WorkManager/background jobs
- exact vs inexact alarms/scheduling
- notifications and notification permission
- share sheet / ACTION_SEND / receiving shared content
- document/file pickers and persisted grants (coordinate with Wave 02 SAF)
- clipboard access and privacy restrictions
- camera/photo picker/media selection
- microphone/audio recording permission and foreground behavior
- connectivity/network state
- battery/charging constraints
- device capability detection
- Android intents/deep links/app launching where safe
- biometric/user-presence gates for sensitive actions where appropriate
- app links/URL opening
- system settings handoff rather than hidden settings modification

For every capability determine:
- minimum Android/API support
- permission required
- whether user interaction is mandatory
- foreground/background constraints
- battery/privacy implications
- persistence/reboot behavior
- exactness guarantees
- cancellation/update semantics
- data returned to Seven
- side-effect class
- verification signal
- fallback when unavailable

Rules:
- request permissions just in time, never blanket-request them at install if avoidable.
- prefer system pickers/shares that expose only user-selected data.
- do not use exact alarms for ordinary flexible AI jobs.
- no hidden always-on polling merely to simulate automation.
- background tasks must respect Android scheduling/battery policy.
- microphone/camera use must have obvious user-facing state and system permission.
- notification success means Android accepted/posting state, not that user read it.
- clipboard contents are sensitive transient input; avoid background scraping.
- launching external apps/settings is a side effect and requires clear intent/risk classification.

Output:
1. candidate/platform registry
2. canonical Seven device tools
3. permission matrix
4. automation/scheduling architecture
5. background/battery strategy
6. privacy/security constraints
7. rejected approaches
8. Deep Polish queue

Preserve all material findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
