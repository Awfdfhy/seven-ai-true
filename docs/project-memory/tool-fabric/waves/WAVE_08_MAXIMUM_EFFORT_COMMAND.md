# Seven Tool Fabric 2.0 — Wave 08 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: verification, testing, fuzzing, static/security analysis, regression detection and tool-contract validation.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 08

Goal: discover the strongest practical verification and testing capabilities that let Seven prove tool behavior, detect regressions and break unsafe assumptions before production, without turning the Android app into a CI server or bloating the base APK.

Use current official documentation, active repositories, standards and technical evidence. Separate runtime verification from host/CI verification. Seven must own verification contracts and evidence records; third-party test/scanner tools remain replaceable specialists.

Research at minimum:
- unit/integration test runners for Seven's JS/TS/runtime layers
- browser/WebView/end-to-end automation
- property-based testing
- fuzzing of parsers/tool schemas/state machines
- contract/schema testing
- API/OpenAPI conformance/property testing
- static analysis
- security-focused static analysis
- dependency vulnerability scanning
- secret scanning
- software bill of materials / dependency inventory
- license auditing
- artifact integrity/provenance validation
- performance/memory regression testing
- accessibility/UI regression checks where tooling is practical
- mutation testing only if value justifies cost
- deterministic test fixtures / record-replay for remote tools
- network fault injection / timeout/retry/idempotency tests
- state-machine/model-based testing for Run Kernel and side effects
- Android instrumentation/runtime verification paths
- verification evidence normalization for Seven Evals

For every candidate determine:
- what class of failure it can actually detect
- false-positive / false-negative characteristics
- runtime vs CI/host deployment
- Android suitability and whether it belongs outside the APK
- incremental/selective test capability
- deterministic/reproducible operation
- machine-readable output
- cancellation/timeout behavior
- maintenance/license
- dependency/runtime weight
- ability to test generated/adversarial inputs safely
- overlap with existing Wave 01/02 candidates

Rules:
- no scanner result becomes FACT solely because a scanner emitted it; findings are evidence/claims until matched to project state.
- verification must be tied to the exact artifact/source/config/model/tool version tested.
- prefer impacted/selective checks during interactive repair and full gates in CI/release.
- tests must verify side effects and state changes, not only exit code 0.
- remote-tool tests use isolated fixtures/sandboxes/test accounts where possible and must not perform uncontrolled real-world side effects.
- fuzzers get explicit time/memory/input budgets.
- property-based tests must preserve failing seeds/examples for reproduction.
- mutation testing is optional and targeted; it must prove useful signal before consuming large CI budgets.
- mobile runtime should contain only lightweight verification needed at execution time; heavy scanners/fuzzers stay host/CI/lazy.
- never expose raw secrets through logs, fixtures or snapshots.

Output:
1. candidate registry
2. Seven Verification Plane architecture
3. canonical verification/test tool contracts
4. evidence model
5. interactive vs CI/release verification ladder
6. fuzz/property/model-based strategy
7. security/dependency/SBOM strategy
8. performance/accessibility regression strategy
9. rejected/limited approaches
10. Deep Polish queue

Preserve all material sources, findings, uncertainty, candidate classifications and rejected approaches in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
