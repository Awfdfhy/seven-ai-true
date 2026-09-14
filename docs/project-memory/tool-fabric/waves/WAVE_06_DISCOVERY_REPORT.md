# Seven Tool Fabric 2.0 — Wave 06 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 06. No candidate integrated/frozen.
Governing command: `WAVE_06_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should add an **Android Capability Plane**, not a generic high-authority "device tool".

The plane is split into narrow capabilities with explicit user interaction, permission, side-effect and verification semantics:

1. `TaskScheduler` — persistent, flexible background work through WorkManager.
2. `ExactEventScheduler` — rare user-facing precise events through AlarmManager only when justified.
3. `NotificationBridge` — permission-aware posting/canceling/status checks.
4. `ShareBridge` — Android Sharesheet plus explicit inbound share handling.
5. `MediaGrantBridge` — Photo Picker + Storage Access Framework rather than broad storage access.
6. `ClipboardBridge` — foreground/user-triggered copy/paste only.
7. `CaptureBridge` — explicit camera/microphone acquisition with visible user state.
8. `DeviceSignals` — network/power/capability observations without constant polling.
9. `IntentBridge` — constrained external-app/URL actions, never arbitrary model-built intents.
10. `UserPresenceGate` — BiometricPrompt/device credential gate for sensitive local actions.
11. `AppLinkIngress` — verified app-owned HTTPS deep links.
12. `SettingsHandoff` — open a relevant system settings screen and let the user act; Seven never pretends the setting changed.

The architecture should expose the **guarantee level** of every scheduled/device action rather than flattening Android's different execution models into one fake `schedule()` promise.

## Candidate / platform registry

| Candidate/platform | Kind | Preliminary class | Seven role | Priority |
|---|---|---|---|---|
| AndroidX WorkManager | platform library | CORE PLATFORM | persistent flexible work | P0 |
| AlarmManager | platform API | SPECIALIST PLATFORM | precise user-facing alarms only | P1 |
| NotificationManager + channels | platform API | CORE PLATFORM | notification lifecycle | P0 |
| `POST_NOTIFICATIONS` | runtime permission | CORE POLICY | notification permission on Android 13+ | P0 |
| Android Sharesheet / Intent Resolver | platform UI/API | CORE PLATFORM | user-mediated outbound sharing/opening | P0 |
| ACTION_SEND receive filters | platform API | SPECIALIST INGRESS | import user-shared text/files/URLs | P1 |
| Android Photo Picker | platform UI/API | CORE PLATFORM | user-selected images/videos | P0 |
| Storage Access Framework | platform API | CORE PLATFORM | document/tree grants; coordinated with Wave 02 | P0 |
| ClipboardManager | platform API | SPECIALIST | explicit copy/paste | P1 |
| Camera app intent | platform delegation | SPECIALIST | lightweight user-visible capture | P1 |
| CameraX | AndroidX camera library | SPECIALIST | only if Seven later needs embedded camera UI | P2 |
| microphone + foreground-service rules | platform capability | SPECIALIST SENSITIVE | user-visible voice capture | P1 |
| ConnectivityManager / NetworkCallback | platform API | CORE SIGNAL | live connectivity capability signal | P0 |
| WorkManager Constraints | platform policy | CORE PLATFORM | defer network/heavy work based on battery/network/storage | P0 |
| PackageManager feature checks | platform API | CORE PLATFORM | capability detection | P0 |
| BiometricPrompt | platform/AndroidX API | SPECIALIST SECURITY | local user-presence gate | P1 |
| Android App Links | platform security/linking | CORE INGRESS CANDIDATE | verified Seven-owned HTTPS deep links | P1 |
| Android Settings intents | platform handoff | SPECIALIST | user-mediated settings navigation | P2 |

## 1. TaskScheduler — WorkManager

Official Android guidance describes WorkManager as the recommended library for persistent work. It supports one-time/periodic work, unique work, chaining, observation/cancellation and execution constraints. Normal background work is not an exact clock scheduler.

Important verified properties:
- persistent work is scheduled after constraints are met, not at an exact second;
- periodic work has a minimum repeat interval of 15 minutes;
- constraints include network type, battery-not-low, charging, device-idle and storage-not-low;
- normal workers have a bounded execution window; longer work requires the appropriate long-running/foreground path.

Seven proposal:
- use WorkManager for durable flexible reminders/checks/sync/research refresh jobs where exact wall-clock execution is unnecessary;
- every task stores Seven task id, semantic intent, TaskContract revision, created time, desired window, constraint set and last execution/result;
- use unique work names so retries/updates do not accidentally duplicate jobs;
- make cancellation and replacement first-class;
- heavy network/model tasks should add network/battery/storage constraints where appropriate;
- WorkManager completion means the worker executed and returned a state, not that an external action succeeded. External effects still require SideEffectLedger verification.

Canonical tools:
- `automation.schedule_flexible`
- `automation.schedule_once`
- `automation.schedule_periodic`
- `automation.status`
- `automation.cancel`
- `automation.replace`

Sources:
- https://developer.android.com/develop/background-work/background-tasks/persistent
- https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work
- https://developer.android.com/reference/androidx/work/WorkManager

## 2. ExactEventScheduler — AlarmManager

Android explicitly recommends inexact alarms/WorkManager for most work and reserves exact alarms for genuinely precise, user-facing timing needs. Apps targeting newer Android versions may need special access/permission to schedule exact alarms, and the capability can be revoked.

Seven proposal:
- exact alarms are **not** the default implementation of reminders or AI monitoring;
- only expose exact scheduling when the user asks for a truly precise event and the platform policy allows it;
- check `canScheduleExactAlarms()` before claiming support;
- if exact access is unavailable, return a structured `EXACT_UNAVAILABLE` state and offer a flexible schedule instead;
- an exact alarm should trigger only short work or enqueue longer work rather than performing heavy model/network execution inside the alarm receiver;
- permission loss/cancellation is represented explicitly.

Canonical tools:
- `automation.schedule_exact_user_event`
- `automation.exact_capability`
- `automation.cancel_exact`

Source:
- https://developer.android.com/develop/background-work/services/alarms

## 3. Scheduling guarantee model

Seven should persist one of these execution guarantees for every schedule:

- `FLEXIBLE_PERSISTENT` — WorkManager; survives ordinary process death and runs after constraints permit.
- `INEXACT_USER_EVENT` — AlarmManager inexact alarm.
- `EXACT_USER_EVENT` — AlarmManager exact path, only when platform access is available.
- `FOREGROUND_EVENT_DRIVEN` — active app listener/callback, e.g. connectivity changes while registered.
- `REMOTE_MONITOR` — future server/host scheduler when a requirement cannot be reliably met on-device.

Never label all of these simply `scheduled=true`.

For condition watches that need checks more frequently than Android's periodic background-work floor, Seven must not simulate frequency with hidden polling. A remote/host runtime or event-driven platform signal is required.

## 4. NotificationBridge

Android 13+ uses the runtime `POST_NOTIFICATIONS` permission for ordinary app notifications. NotificationManager can also report whether notifications are enabled for the app.

Seven proposal:
- request notification permission only at the moment a user enables a feature that needs notifications;
- create stable semantic channels rather than one channel per task;
- before relying on a notification as delivery, check app notification capability/state where possible;
- `notify()` accepted by Android is **DELIVERY_ATTEMPTED**, not `USER_READ`;
- never convert notification posting into evidence that the user saw or acted on it.

Canonical tools:
- `notification.capability`
- `notification.post`
- `notification.update`
- `notification.cancel`
- `notification.open_settings`

Sources:
- https://developer.android.com/develop/ui/compose/notifications/notification-permission
- https://developer.android.com/reference/android/app/NotificationManager

## 5. ShareBridge

Android's Sharesheet is the preferred user-facing path for sending content to other apps. ACTION_SEND/Intent Resolver allows the system/user to select the destination. Seven can also receive explicitly shared content through declared ACTION_SEND filters.

Seven proposal:
- use Sharesheet for user-mediated generic outbound sharing;
- use Intent Resolver/open-with semantics for well-defined file/URL handoff;
- inbound share handlers accept only declared MIME/action combinations;
- every inbound URI/text/file is untrusted input and enters normal file/content validation;
- temporary URI grants must not be silently converted into permanent broad storage authority;
- receiving shared data is an import event with source app/intent metadata when available, not a trusted FACT.

Canonical tools:
- `share.send_text`
- `share.send_file`
- `share.open_with`
- `share.import_received`

Sources:
- https://developer.android.com/develop/ui/compose/sharing/send
- https://developer.android.com/develop/ui/compose/sharing/receive

## 6. MediaGrantBridge — Photo Picker first

The Android Photo Picker gives the user a system UI for selecting only chosen images/videos instead of granting access to the full media library. Persistable URI permission can be used for longer-lived processing when the platform/provider allows it.

Seven proposal:
- preferred path for image/video selection;
- do not request broad `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` merely to support ordinary user attachment;
- preserve URI-grant state and handle revoked/disappeared grants;
- coordinate with Wave 02 `AndroidFileGrant` so all URI grants share one permission model;
- selected media still requires type/size/content validation.

Canonical tools:
- `media.pick_image`
- `media.pick_video`
- `media.pick_multiple`
- `media.persist_grant`
- `media.release_grant`

Sources:
- https://developer.android.com/training/data-storage/shared/photo-picker
- https://developer.android.com/training/data-storage/shared/media

## 7. ClipboardBridge

Clipboard is convenient but privacy-sensitive transient state. Android 13+ already shows system feedback when content is copied; sensitive clipboard content can be flagged so the preview is hidden.

Seven proposal:
- copy/paste only from a clear foreground user action;
- no background clipboard harvesting or periodic clipboard monitoring;
- clipboard paste is untrusted input;
- mark credential-like/private clipboard output as sensitive when copying is explicitly requested;
- do not persist clipboard contents into memory unless the user actually submits/imports them.

Canonical tools:
- `clipboard.copy`
- `clipboard.paste_user`
- `clipboard.clear_owned` only when Seven can verify it is clearing content it placed or the user explicitly requests it

Source:
- https://developer.android.com/develop/ui/views/touch-and-input/copy-paste

## 8. CaptureBridge — camera and microphone

### Camera

For simple capture, Seven can delegate to a camera app/system-mediated flow instead of bundling a full camera stack. If a future Seven feature requires a custom embedded camera UI, CameraX is the preferred AndroidX direction to evaluate.

Rules:
- user-visible invocation only;
- capability-detect the camera;
- save/import through controlled URI/file grants;
- image capture success is verified from returned URI/data, not merely from launching the camera app.

### Microphone

Microphone access requires `RECORD_AUDIO`. Modern Android places strong while-in-use and foreground-service restrictions on microphone capture. Android 14+ enforces foreground-service type/permission requirements more strictly.

Seven proposal:
- voice recording starts only from obvious user interaction;
- show explicit recording state and stop/cancel controls;
- no boot-started or hidden microphone listener;
- for ongoing foreground capture use the required microphone foreground-service type/permission model;
- transcription remains a separate Wave 03 SpeechBroker operation after audio capture.

Canonical tools:
- `camera.capture_user`
- `audio.capture_start_user`
- `audio.capture_stop`
- `audio.capture_cancel`

Sources:
- https://developer.android.com/media/camera/camera-deprecated/photobasics
- https://developer.android.com/develop/background-work/services/fgs/service-types
- https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start

## 9. DeviceSignals

### Connectivity

Android recommends ConnectivityManager callbacks for fresh network state and WorkManager constraints for deferred jobs that should wait for an appropriate network. Network transport alone is not a reliable proxy for whether the connection is metered or usable; `NetworkCapabilities` exposes validated/internet/metered-style capabilities.

Seven proposal:
- use `NetworkCallback` only while a feature actually needs live connectivity state;
- unregister callbacks promptly;
- no connectivity polling loop;
- use `NET_CAPABILITY_VALIDATED` plus relevant capability state rather than assuming Wi-Fi means Internet/unmetered;
- scheduled network tasks use WorkManager constraints rather than a homegrown watcher.

Canonical tools:
- `device.network_state`
- `device.network_watch_start`
- `device.network_watch_stop`

Sources:
- https://developer.android.com/develop/connectivity/network-ops/reading-network-state
- https://developer.android.com/reference/android/net/NetworkCapabilities

### Power/storage constraints

Do not invent an always-on battery watcher for ordinary task scheduling. WorkManager already exposes battery-not-low, charging, idle and storage-not-low constraints for background work.

Canonical capability:
- `device.execution_constraints_snapshot`

## 10. Device capability detection

Seven should capability-detect rather than hard-code assumptions about all Android phones.

Use PackageManager/system APIs to determine available hardware/software features. Optional features should not unnecessarily exclude devices at install time.

Canonical tools:
- `device.capabilities`
- `device.feature_supported`

Source:
- https://developer.android.com/guide/topics/manifest/uses-feature-element

## 11. UserPresenceGate — BiometricPrompt

BiometricPrompt provides a system-controlled authentication UI and requires `USE_BIOMETRIC`. AndroidX offers compatibility handling across more versions.

Seven role:
- optional gate before revealing/using especially sensitive local data or authorizing a high-risk local action;
- integrate with CredentialVault/Keystore when cryptographic user-auth binding is justified;
- biometric success proves completion of the configured local authenticator challenge, **not** permission to perform an unrelated network/write/delete action;
- TaskContract permissions remain separate.

Canonical tools:
- `presence.capability`
- `presence.authenticate`

Sources:
- https://developer.android.com/reference/android/hardware/biometrics/BiometricPrompt
- https://developer.android.com/reference/androidx/biometric/BiometricPrompt

## 12. IntentBridge and AppLinkIngress

Raw arbitrary Android intents are too broad to expose directly to a model. Seven should expose typed intent actions.

Canonical tools:
- `app.open_url`
- `app.open_external_file`
- `app.open_external_action`
- `app.open_settings_page`

Rules:
- fixed action allowlist + typed parameters;
- user-visible side effect classification;
- handle the case where no matching Activity exists;
- never accept a model-produced raw component/intent URI as implicit authority.

For links owned by Seven, verified Android App Links are preferable to an unverified custom scheme when feasible because Android verifies the website/app association using Digital Asset Links.

Canonical ingress:
- `applink.receive`

Sources:
- https://developer.android.com/guide/components/intents-filters
- https://developer.android.com/training/app-links/about
- https://developer.android.com/training/app-links/verify-applinks

## 13. SettingsHandoff

Android exposes Settings intents for screens such as application details, notification settings and other system configuration pages. Some settings screens might not exist on every device, so intent resolution must be checked.

Seven rule:
- opening Settings is a handoff to the user;
- Seven may explain the required change but must not report success until state can be re-read and verified;
- never build a hidden "settings modification" layer around undocumented/vendor-specific hacks.

Canonical tools:
- `settings.open_app_details`
- `settings.open_notifications`
- `settings.open_exact_alarm_access`
- other pages only through a reviewed allowlist

Source:
- https://developer.android.com/reference/android/provider/Settings

## Permission / interaction matrix

| Capability | Permission / access | User interaction expectation | Side-effect class |
|---|---|---|---|
| WorkManager flexible task | normal app scheduling | task must be explicitly created by Seven/user flow | scheduled side effect |
| Exact alarm | special exact-alarm access on affected versions/use cases | explicit timing intent | high scheduling side effect |
| Notifications | `POST_NOTIFICATIONS` on Android 13+ for ordinary notifications | just-in-time request | external-visible side effect |
| Photo Picker | system picker; broad media permission unnecessary for ordinary selection | mandatory picker selection | scoped read grant |
| SAF document/tree | system picker + URI grant | mandatory grant | scoped read/write grant |
| Clipboard copy | no dangerous runtime permission | foreground/user-triggered | global transient write |
| Clipboard paste | no dangerous runtime permission | foreground/user-triggered | sensitive read |
| Camera capture | camera/system flow; direct Camera APIs may require CAMERA | obvious capture UI | sensor read/file creation |
| Microphone | `RECORD_AUDIO`; FGS requirements for ongoing foreground capture | obvious recording UI | sensitive sensor read |
| Network state callback | ordinary connectivity APIs | no special prompt for normal state | observation |
| BiometricPrompt | `USE_BIOMETRIC` | mandatory system prompt | local user-presence gate |
| External app/url intent | typed intent | user-visible handoff where appropriate | app-launch side effect |
| Settings screen | typed Settings intent | user performs actual change | navigation/handoff |

## Background / battery strategy

1. **No hidden heartbeat.** There is no Seven timer that wakes every few seconds/minutes simply to ask whether something changed.
2. Event-driven platform callbacks are active only while needed.
3. Persistent flexible jobs use WorkManager and its network/battery/storage constraints.
4. Exact alarms are scarce and user-meaningful.
5. Local AI-heavy work is queued only after ResourceGovernor checks battery/thermal/storage/network conditions when relevant.
6. Very frequent or high-reliability monitoring belongs to an optional remote/host runtime, not an Android battery-draining loop.
7. Heavy workspace/model modules remain lazy; these Android bridges should be thin.

## Side-effect verification rules

- scheduling: verify the local task record + platform accepted state when observable;
- notification: verify permission/enabled state and posting attempt, never user read;
- share/open external app: verify launch/chooser dispatch, not downstream completion unless a result contract exists;
- picker/import: verify returned URI grant and readable content;
- camera/audio: verify produced media exists/is readable;
- settings handoff: verify only after re-reading the target state;
- biometric: verification applies only to the local presence gate event;
- connectivity: values are observations with timestamps and can become stale.

## Rejected approaches

- one generic `device.execute` tool with broad Android authority;
- exact alarms for routine AI refresh/monitoring;
- hidden always-on background service to simulate automation;
- periodic sub-15-minute WorkManager promises;
- broad media-library permission when Photo Picker satisfies the task;
- background clipboard scraping;
- invisible microphone/camera capture;
- treating Wi-Fi transport as proof of an unmetered/working Internet connection;
- arbitrary model-generated Android intents/component names;
- claiming that a notification was read because it was posted;
- claiming a system setting changed merely because Seven opened the Settings screen;
- platform/vendor hacks that bypass normal Android permission UX.

## Deep Polish queue

Recommended order:

`TaskScheduler/WorkManager → NotificationBridge → MediaGrantBridge(Photo Picker + SAF) → ShareBridge/IntentBridge → DeviceSignals → UserPresenceGate → CaptureBridge → ExactEventScheduler → AppLinkIngress → SettingsHandoff`

This order prioritizes the most useful low-risk platform primitives before sensitive sensors and exceptional timing authority.

## Open gaps

- final Capacitor/native bridge shape and byte cost for each Android capability;
- exact behavior across Seven's final minSdk/targetSdk values;
- reboot/recovery reconciliation tests for pending schedules;
- notification action buttons/deep-link routing design;
- package-visibility policy for targeted external-app intents;
- target-device battery benchmarks for periodic background workloads;
- thermal-state integration with ResourceGovernor;
- exact UX for permission denial/permanent denial/revocation;
- remote scheduler architecture for high-frequency condition watches;
- OAuth/OIDC/connector authorization lifecycle, which belongs in a later dedicated wave.

## Coverage statement

Wave 06 covers Android scheduling, alarms, notifications, sharing, media selection, clipboard, camera/microphone capture boundaries, connectivity, device capability detection, biometric user-presence gates, typed external intents, verified app links and Settings handoff. It deliberately favors platform primitives and user-mediated access over extra third-party dependencies.

No production integration occurred in this wave. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
