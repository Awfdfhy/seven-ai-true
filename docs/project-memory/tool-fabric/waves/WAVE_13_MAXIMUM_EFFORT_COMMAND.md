# Seven Tool Fabric 2.0 — Wave 13 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: Observability, performance measurement, Android resource signals, runtime budgets and adaptive Resource Governor.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 13

Goal: give Seven reliable evidence about its own cost and health so intelligence/tooling cannot silently make the Android experience worse. Prefer small native/platform signals and CI/host profilers over heavy always-on telemetry.

Research official Android/Jetpack tooling first and evaluate standards/exporters only as optional layers.

Research at minimum:
- startup and frame/jank measurement
- memory pressure and process memory evidence
- CPU/process time
- thermal status/headroom
- battery state and limitations of energy attribution
- network/connectivity and app traffic measurement
- APK/AAB size measurement
- crash/ANR/process-death evidence
- trace/span/event model
- privacy/redaction
- bounded event buffering
- OpenTelemetry compatibility without forcing its full SDK into startup
- runtime concurrency/resource budgets
- backpressure and degradation policies
- Full/Balanced/Lite tier control
- local-model/speech/OCR workload gating
- CI benchmark gates and device variance

Rules:
- do not pretend coarse Android signals provide exact per-feature energy usage.
- telemetry does not contain message/file/tool payloads by default.
- no hidden high-frequency polling merely for metrics.
- use listener/event APIs where possible and sample only when useful.
- resource thresholds need hysteresis/debounce to avoid oscillation.
- low-memory/thermal/battery states may reduce optional compute but must not corrupt authoritative state.
- benchmark/debug tooling can be heavy because it does not ship in normal startup.
- distinguish measured device evidence from heuristics.

Output:
1. canonical Seven observability event/metric model
2. Android signal registry
3. ResourceGovernor state machine and budgets
4. privacy/redaction policy
5. CI/benchmark tool registry
6. runtime vs debug/CI deployment split
7. degradation/recovery rules
8. rejected approaches
9. Deep Polish queue and eval gates

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
