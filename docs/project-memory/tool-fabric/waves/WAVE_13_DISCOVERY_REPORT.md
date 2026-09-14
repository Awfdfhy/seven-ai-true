# Seven Tool Fabric 2.0 — Wave 13 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 13. No production integration/freeze.
Governing command: `WAVE_13_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should use a **two-plane observability architecture**:

1. **Runtime Health Plane** — tiny, privacy-preserving signals needed to protect the live Android experience and drive ResourceGovernor decisions.
2. **Diagnostic / CI Plane** — heavier benchmark, trace, APK analysis and regression tools that do not belong in normal startup/runtime.

The ResourceGovernor must react to measured/coarse Android evidence without pretending those signals are more precise than they are. Thermal, memory, battery and traffic metrics vary by device/support level. Seven therefore uses evidence quality, hysteresis and sustained-state transitions rather than one-shot thresholds.

## Candidate / platform registry

| Candidate/platform | Kind | Class | Seven role |
|---|---|---|---|
| `ActivityManager.MemoryInfo` | Android platform API | CORE SIGNAL | coarse system memory pressure/availability |
| `ApplicationExitInfo` + historical exit reasons | Android platform API | CORE RECOVERY SIGNAL | crash/ANR/low-memory/excess-resource postmortem |
| `PowerManager` Thermal APIs | Android platform API | CORE SIGNAL | thermal status/headroom and throttling risk |
| `BatteryManager` | Android platform API | CORE SIGNAL | battery capacity/charging/current hints |
| `TrafficStats` | Android platform API | SPECIALIST COARSE SIGNAL | own-UID traffic deltas, not exact billing/network truth |
| process elapsed CPU time / trace sections | platform/runtime primitives | CORE/SPECIALIST | relative workload cost and trace correlation |
| Jetpack Macrobenchmark | benchmark framework | CORE CI/DEVICE TEST | startup/user-journey/frame regression evidence |
| `StartupTimingMetric` / `FrameTimingMetric` | Macrobenchmark metrics | CORE CI | TTID/TTFD/jank evidence |
| JankStats / FrameMetricsAggregator | runtime/field UI metrics | SPECIALIST | bounded journey/frame health instrumentation |
| Perfetto/System Trace | diagnostic profiler | SPECIALIST DEBUG/CI | deep scheduling/CPU/trace diagnosis |
| Android `Trace` / AndroidX tracing | lightweight trace markers | CORE CANDIDATE | named Seven spans/sections for correlation |
| APK Analyzer / `apkanalyzer` | build analysis | CORE CI | APK/AAB composition and size regression |
| Baseline Profiles + startup profiles | optimization artifact | SPECIALIST RELEASE OPTIMIZATION | speed critical app paths after measurement |
| StrictMode | developer diagnostic | DEBUG ONLY | detect accidental main-thread/disk/network mistakes |
| OpenTelemetry semantic model | interoperability standard | OPTIONAL EXPORT ADAPTER | export/compatibility, not mandatory startup SDK |

## Key platform findings

### Memory

`ActivityManager.MemoryInfo` exposes system-level fields such as available memory and low-memory state, but Android explicitly warns that available-memory values are not absolute due to kernel/system behavior.

Seven rule:
- use memory values as pressure signals/trends, not precise free-RAM guarantees
- pair with Seven-owned known allocations/model-pack state where possible
- never trigger destructive state loss merely because one sample crosses a threshold

Source:
- https://developer.android.com/reference/android/app/ActivityManager.MemoryInfo

### Process death / crash / ANR evidence

Android 11+ `ApplicationExitInfo`, via historical process exit reasons, can report causes such as ANR, Java/native crash, low-memory kill, excessive resource usage, user/system interruptions and initialization failure. PSS/RSS fields are last samples rather than exact pre-death truth.

Seven role:
- on next healthy startup, inspect recent exit evidence
- correlate with last persisted Seven run state/trace id when available
- mark previous operation as interrupted/recovery-required rather than assuming completion
- repeated low-memory/excess-resource exits lower device capability tier until later healthy evidence

Sources:
- https://developer.android.com/reference/android/app/ApplicationExitInfo
- https://developer.android.com/reference/android/app/ActivityManager#getHistoricalProcessExitReasons(java.lang.String,int,int)

### Thermal

`PowerManager` can provide current thermal status and thermal headroom/prediction on supported devices. Android documentation notes device-specific mappings and support limitations; headroom calls can yield `NaN` when unsupported or sampled improperly.

Seven rule:
- prefer listener/status changes for normal runtime
- use headroom only at low frequency before/during genuinely heavy optional workloads
- interpret `NaN`/unsupported as UNKNOWN, never as healthy
- decrease local inference/concurrency before severe throttling rather than after UI becomes unusable

Sources:
- https://developer.android.com/reference/android/os/PowerManager
- https://developer.android.com/games/optimize/adpf/thermal

### Battery

`BatteryManager` exposes capacity and current properties, but current direction/averaging and hardware behavior vary. Instantaneous/average current is a whole-device signal, not exact energy attribution to Seven.

Seven rule:
- use charging state, battery percentage and coarse current evidence for policy
- do not advertise per-feature joules or battery percentages saved without controlled measurement
- long local inference may be deprioritized on low battery unless user explicitly requests it

Source:
- https://developer.android.com/reference/android/os/BatteryManager

### Network traffic

`TrafficStats` can expose calling-UID receive/transmit byte counters. Android warns some measurements are partial and affected by network/VPN/translation behavior.

Seven role:
- coarse deltas around large downloads/research/modelpack jobs
- useful for detecting unexpectedly expensive behavior
- not accounting/billing truth and not provider request-level attribution unless Seven also instruments the request itself

Source:
- https://developer.android.com/reference/android/net/TrafficStats

## Performance / benchmark plane

### Macrobenchmark

Android recommends Macrobenchmark for end-user flows including startup, scrolling and animations. It runs externally from the target app, reducing instrumentation distortion.

Seven CI/release metrics:
- cold/warm/hot startup where meaningful
- TTID
- TTFD
- frame timing/jank on core journeys
- workspace open latency
- first composer interaction
- first streamed-token render
- Coding/RPG workspace transitions
- Lite/Reduced Motion paths

Use distributions/medians and percentile frame metrics, not one run.

Sources:
- https://developer.android.com/topic/performance/benchmarking/benchmarking-overview
- https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics

### Baseline / startup profiles

Baseline Profiles can precompile critical code paths and Android recommends measuring their impact with Macrobenchmark. They are an optimization after evidence, not permission to move heavy work into startup.

Seven proposal:
- generate profile only for proven critical app journeys
- compare profile enabled/disabled
- retain lazy-loading architecture regardless

Source:
- https://developer.android.com/topic/performance/baselineprofiles/overview

### APK size

Android Studio APK Analyzer and command-line `apkanalyzer` expose absolute/relative APK/AAB composition and permit build comparison.

Seven CI:
- total artifact size
- compressed/download estimate where available
- DEX/resources/native libraries/assets
- optional-model packs excluded from base-APK budget
- fail/warn on unexplained regression by component

Source:
- https://developer.android.com/studio/debug/apk-analyzer

## OpenTelemetry decision

OpenTelemetry JS currently marks traces and metrics stable while browser client instrumentation remains experimental/mostly unspecified.

Decision:
- Seven owns a tiny internal event/span/metric schema
- design names/attributes so an optional OTel exporter can map them later
- do not ship the full browser instrumentation stack simply to claim standards compliance
- export adapter is lazy/opt-in/diagnostic

Source:
- https://opentelemetry.io/docs/languages/js/

## Seven ObservabilityEvent

Recommended common envelope:

- `eventId`
- monotonic timestamp + wall timestamp when needed
- run/task/trace/span id
- subsystem
- event type
- severity
- duration where relevant
- provider/model/tool canonical ids
- performance tier
- resource snapshot reference
- success/failure/uncertainty status
- error class/code, not secret payload
- lineage/evidence quality
- app/version/build/device-class metadata

Default **forbidden content**:
- user message body
- file contents
- API tokens/secrets
- raw tool payloads
- full model output
- exact personal/location data unless a specific diagnostic flow is explicitly authorized

Observability records references/hashes/counts/state, not private content by default.

## Metric classes

### Always-light / event-driven
- run start/end/error
- tool start/end/verified
- model start/first-event/end/error
- cancellation state
- workspace activation
- process recovery evidence
- tier changes
- thermal status listener changes

### Sampled/on-demand
- memory snapshot
- thermal headroom
- battery/current hint
- app traffic delta
- local inference throughput

### CI/debug only
- Perfetto/System Trace
- Macrobenchmark
- deep memory allocation analysis
- StrictMode evidence
- APK composition analysis
- profiler traces

## ResourceSnapshot

Fields can include status + evidence quality:

- system memory pressure: NORMAL/LOW/UNKNOWN
- available memory sample
- process/local-runtime known allocation estimate where available
- thermal status
- thermal headroom + support flag
- battery percent
- charging state
- battery-saver state
- app network metering/connectivity class where Wave 06 exposes it
- UID traffic delta around tracked jobs
- active heavy jobs
- loaded local model/modelpack sizes
- current performance tier

Snapshot values must include source/API/time so stale resource data is visible.

## ResourceGovernor state machine

Recommended governor modes:

`FULL → BALANCED → CONSERVE → CRITICAL`

The user-facing existing performance tiers can map onto these policies while remaining separately configurable.

Transitions require sustained evidence/hysteresis, for example:
- multiple thermal/pressure observations
- OS low-memory callback/state
- recent low-memory/excess-resource process exit
- explicit battery-saver/low battery
- concurrency/latency backpressure

Recovery also requires sustained healthy evidence; do not bounce modes every sample.

### FULL
- normal allowed concurrency
- richer optional UI effects within design budget
- local intelligence available if device/model eligibility passes

### BALANCED
- default mobile mode
- cap concurrent heavy tasks
- prefer smaller/local helper models selectively
- lazy features unchanged

### CONSERVE
- pause/defer optional indexing/modelpack/background compute
- lower local inference threads/context where supported
- suppress expensive decorative motion/blur
- reduce research/browser concurrency
- favor remote compute if privacy/policy permits and network is suitable

### CRITICAL
- protect authoritative state and UI responsiveness first
- refuse/start no optional heavyweight local job
- unload optional model/runtime caches where safe
- persist checkpoint/run state
- maintain user cancellation and basic chat/control functionality

No governor transition may silently change a user's privacy requirement or execute a remote fallback that was disallowed.

## Workload budget classes

Every expensive subsystem declares resource characteristics:

- `LIGHT`: schema validation, lexical search, small SQLite queries
- `MEDIUM`: parsing/index updates, OCR image, moderate rerank
- `HEAVY`: speech model, local embedding batch, large document conversion
- `EXTREME`: local LLM generation, large model download/load, heavy media transforms

Task execution asks ResourceGovernor for an admission/budget decision rather than reading raw thermal/memory signals independently.

Decision examples:
- `ALLOW`
- `ALLOW_REDUCED`
- `DEFER_OPTIONAL`
- `REQUIRE_USER_OVERRIDE`
- `DENY_TEMPORARILY`

## Backpressure

ResourceGovernor also observes system-internal pressure:
- queued jobs
- active model streams
- active browser/project runners
- repeated provider retries
- UI event/render lag

Prefer bounded queues and explicit backpressure to spawning unlimited tasks.

## Privacy / retention

- ring buffer locally by default
- size/time bounded
- aggregate counters where detailed spans add little value
- redact identifiers/secrets
- diagnostic export is explicit
- crash evidence never silently uploads merely because it exists
- include schema/app version so old telemetry remains interpretable

## CI / release gates proposed

Hard/soft budgets should be established from a verified baseline rather than invented numbers.

Track:
- base APK/AAB size delta
- cold/warm startup median and regression range
- TTFD core screen
- P95/P99 frame timing/jank for representative flows
- memory peak/trend during chat, Coding Agent and RPG
- process survival under long sessions
- local-model load/first-token/thermal behavior
- Reduced Motion/Lite performance
- unexpected network/background activity

Use physical-device class baselines, including a low/midrange target representative of Seven's Android-first goal.

## Rejected approaches

- always-on high-frequency metrics polling: rejected
- full OTel browser SDK as mandatory startup dependency: rejected
- exact battery-cost claims from `BatteryManager` current: rejected
- treating `availMem` as guaranteed allocatable RAM: rejected
- interpreting unsupported thermal headroom as healthy: rejected
- one universal device threshold across OEMs: rejected
- unlimited concurrent agent/tool jobs: rejected
- governor silently relaxing privacy/local-only requirements: rejected
- shipping Perfetto/profiler machinery as normal app feature: rejected
- collecting private payloads because debugging is easier: rejected

## Canonical Seven capabilities proposed

- `observability.event.record`
- `observability.span.start/end`
- `resource.snapshot`
- `resource.workload.admit`
- `resource.tier.evaluate`
- `resource.optional_cache.trim`
- `recovery.process_exit.inspect`
- `benchmark.result.ingest`
- `artifact.size.inspect`

## Required Evals

Before Freeze:
- governor reacts to simulated low-memory/thermal states without losing canonical state
- governor does not oscillate under noisy signal
- Lite/Conserve mode actually reduces measured cost
- cancellation remains responsive in heavy workloads
- optional model unload/reload is safe
- interrupted process is correctly recovered/marked uncertain
- telemetry contains no prompt/file/secret payload by default
- disabled telemetry path adds negligible runtime work
- benchmark results are tied to build/device/config identity
- app-size/startup regression gates catch intentional canaries

## Deep Polish queue

`ObservabilityEnvelope → Android ResourceBridge → ResourceGovernor policy/hysteresis → workload declarations/admission → process-exit recovery bridge → tracing markers → Macrobenchmark suite → APK size gate → OTel export adapter → performance-tier integration`

## Coverage statement

Wave 13 closes the discovery gap around observability and ResourceGovernor primitives. Final thresholds require real Seven builds/device measurements and therefore must be set during implementation/Ultimate Polish, not invented during discovery.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
