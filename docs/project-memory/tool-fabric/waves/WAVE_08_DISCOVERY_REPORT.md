# Seven Tool Fabric 2.0 — Wave 08 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 08. No candidate integrated/frozen.
Governing command: `WAVE_08_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven needs a **Verification Plane**, not one universal test runner.

The correct architecture separates cheap execution-time verification from heavyweight host/CI verification:

1. `VerificationOrchestrator` — selects checks from risk, changed scope and TaskContract.
2. `EvidenceNormalizer` — converts heterogeneous tool output into Seven evidence records.
3. `ImpactSelector` — runs the smallest safe relevant test set interactively, then expands for release gates.
4. `PropertyEngine` — generated/property/model-based invariants for parsers, state machines and tools.
5. `ApiContractFuzzer` — OpenAPI/contract-driven API testing in isolated/test environments.
6. `StaticAnalysisBroker` — Semgrep/CodeQL style findings behind a normalized interface.
7. `SupplyChainVerifier` — dependency vulnerability, SBOM and license evidence.
8. `SecretLeakScanner` — source/history/artifact secret detection.
9. `BrowserVerification` — Playwright-based UI/network/release testing.
10. `AndroidVerification` — UI Automator + Macrobenchmark on the packaged Android app.
11. `AccessibilityVerifier` — axe-core for WebView/HTML surfaces plus Android-native accessibility checks where needed.
12. `MutationAudit` — selective StrykerJS checks for high-value logic only.

**Central law:** a scanner finding is a CLAIM/EVIDENCE until Seven matches it to the exact project/artifact state and verifies applicability. A green exit code is also not proof of the user-visible goal unless the relevant postconditions were actually checked.

## Candidate registry

| Candidate | Kind | Preliminary class | Seven role | Deployment |
|---|---|---|---|---|
| Vitest | JS/TS test runner | CORE HOST/CI CANDIDATE | unit/integration tests + machine output | host/CI |
| Playwright Test | browser E2E | CORE/SPECIALIST HOST | browser/WebView UI, network faults, traces, screenshots | host/CI |
| fast-check | property/model-based testing | CORE VERIFICATION CANDIDATE | generated invariants + state-machine testing | dev/CI |
| Schemathesis | OpenAPI/GraphQL property testing | SPECIALIST HOST | API contract fuzzing | host/CI |
| Semgrep CE | syntax/static analysis | SPECIALIST HOST | project rules + security patterns | host/CI |
| GitHub CodeQL | semantic/static security analysis | SPECIALIST CI | deeper JS/TS/Kotlin/etc. security queries | CI |
| OSV-Scanner | dependency vulnerability scanner | CORE/SPECIALIST CI | known-vulnerability evidence | host/CI |
| Syft | SBOM generator | SPECIALIST CI | artifact/package inventory | host/CI |
| CycloneDX | SBOM standard | CORE INTERCHANGE STANDARD | portable SBOM format | artifact/CI |
| SPDX | SBOM/license standard | CORE INTERCHANGE STANDARD | software/license inventory | artifact/CI |
| Gitleaks | secret scanner | STABLE FALLBACK | current/history secret detection | host/CI |
| Betterleaks | newer secret scanner | EXPERIMENTAL/STRONG CANDIDATE | broader successor-style secret scanning | host/CI |
| axe-core | web accessibility engine | CORE/SPECIALIST UI CHECK | automated HTML/WebView a11y checks | browser CI |
| AndroidX UI Automator 2.4 | Android UI testing | CORE ANDROID TEST CANDIDATE | outside-process packaged-app/system UI checks | device/CI |
| Android Macrobenchmark | Android performance benchmark | CORE ANDROID PERF CANDIDATE | startup/frame critical-journey regression | device/CI |
| Baseline Profiles | Android optimization artifact | SPECIALIST PERFORMANCE | startup/critical path optimization after measurement | build/release |
| StrykerJS | mutation testing | SPECIALIST EXPENSIVE | test-suite strength on critical modules | selective CI |

## 1. Verification evidence model

Every verification result must be bound to the thing actually tested.

Canonical `VerificationEvidence` fields:
- evidence id
- run id / TaskContract id
- source commit/tree hash
- artifact hash when testing a build
- tool id + exact version
- rule/query/test suite id + version/hash
- environment/runtime/browser/device identity
- configuration hash
- started/completed timestamps
- scope tested
- inputs/fixture ids + hashes
- status: `PASS | FAIL | INCONCLUSIVE | ERROR | SKIPPED`
- findings
- postconditions checked
- failing seed/path/example when generated
- logs/artifact references
- lineage
- confidence/applicability state

A result produced against commit A must never be silently reused as proof for commit B without an explicit impact/reuse rule.

## 2. Verification ladder

### Level V0 — runtime guards
Always-cheap checks near tool execution:
- schema validation
- permission/authority check
- argument bounds
- response/status validation
- side-effect verification
- hashes/lineage

These belong in Seven runtime.

### Level V1 — interactive impacted checks
After an agent edit or local operation:
- syntax/type/static sanity where cheap
- directly related unit/integration tests
- changed-file/source-integrity checks
- targeted browser assertion if UI touched

Goal: rapid feedback, not exhaustive proof.

### Level V2 — repair verification
When V1 fails or change is risky:
- broader dependent tests
- property tests with bounded run count
- relevant Semgrep/custom rules
- deterministic network fault cases
- state-machine tests for changed runtime paths

### Level V3 — CI gate
On branch/PR:
- full unit/integration suite
- Playwright release flows
- static/security scanning
- dependency/secret checks
- source-integrity/build gates
- selected property/API fuzzing
- accessibility checks

### Level V4 — release gate
Against actual release artifact:
- packaged artifact boot
- real Android device/emulator flows
- Macrobenchmark critical journeys
- UI Automator permission/share/system flows
- Day/Night/RTL/Reduced Motion/Lite checks
- verified screenshots
- SBOM + vulnerability/license evidence
- artifact provenance/hash/signature checks

## 3. Vitest

Vitest remains a strong fit for Seven's JS/TS host tests. Current docs expose JSON/JUnit reporters and JSON/LCOV-style coverage outputs, making normalization practical.

Seven role:
- fast unit/integration layer for modularized runtime code;
- machine-readable JSON/JUnit output into `EvidenceNormalizer`;
- changed-module test selection when dependency mapping is reliable;
- full run at CI/release gates.

Do not treat code coverage percentage as proof of behavioral correctness.

Sources:
- https://vitest.dev/guide/reporters
- https://vitest.dev/config/coverage

## 4. Playwright

Playwright provides browser automation, network interception/mocking, HAR replay and traces. It also has experimental Android/WebView support, but official docs explicitly list limitations and ADB requirements.

Seven role:
- primary host browser test for Beta/Web runtime;
- release screenshot capture from the actual built artifact;
- network fault simulation: abort, timeout, mocked status, offline;
- trace-on-failure for reproducible repair evidence;
- HAR-based deterministic fixtures only after secret/cookie/header sanitization.

Android decision:
- do not make Playwright's experimental Android API the sole Android release verifier;
- use native AndroidX/UI Automator for packaged-app guarantees;
- Playwright Android can remain an experimental supplementary path.

Sources:
- https://playwright.dev/docs/network
- https://playwright.dev/docs/mock
- https://playwright.dev/docs/api/class-tracing
- https://playwright.dev/docs/api/class-android

## 5. fast-check — PropertyEngine

fast-check is a strong match for Seven because it supports generated inputs, shrinking, reproducible seeds and model-based command testing. Current documentation includes replay using seed/path/replayPath.

Highest-value Seven targets:
- TaskContract/state transition invariants
- Run Kernel stop/continue/retry state machine
- SideEffectLedger/idempotency invariants
- JSON/schema normalization
- URL/path/archive boundary functions
- Memory/Context derived-view consistency
- parser round trips
- permission monotonicity: derived data must never increase authority
- Canon/RPG world-diff validation

Rules:
- save failing seed/path/replayPath into verification evidence;
- keep interactive budgets small;
- expand run counts in CI/nightly/release;
- generated commands that could cause real side effects execute only against mock/test backends.

Sources:
- https://fast-check.dev/docs/introduction/
- https://fast-check.dev/docs/advanced/model-based-testing/

## 6. ApiContractFuzzer — Schemathesis

Schemathesis generates property-based tests from OpenAPI/GraphQL schemas and can run via CLI/container/GitHub Actions.

Seven role:
- host/CI specialist for APIs Seven owns or test/sandbox accounts for external integrations;
- pair with Wave 04 `ApiContractEngine` fixtures;
- find schema boundary, malformed-response and unexpected-status behavior before adapter freeze.

Safety:
- never point generated mutating tests at a production account unless the API/test plan explicitly guarantees isolation;
- disable or sandbox destructive operations by default;
- cap request count/concurrency/time;
- preserve failing request schema/example after redacting credentials.

Source:
- https://schemathesis.io/

## 7. StaticAnalysisBroker

### Semgrep CE

Semgrep Community Edition is a deterministic syntax-aware rules engine and provides machine-readable JSON/SARIF-style outputs. It is useful for project-specific architecture/security rules as well as conventional findings.

Seven-specific rules worth creating:
- forbid raw token logging/localStorage persistence
- forbid unsanitized `innerHTML` paths
- forbid direct high-authority Android bridge calls outside Tool Fabric
- detect arbitrary `eval`/Function construction
- protect `seven_ai-final.html` mutation paths
- require side-effect registration around known remote-write adapters
- prevent raw provider SDK calls outside adapters

Important licensing note:
- Semgrep CE engine remains community/free, but Semgrep-maintained rules have their own rules license. Seven must review rule licensing for the exact use/distribution model before embedding or redistributing rule packs.

Sources:
- https://semgrep.dev/products/community-edition
- https://semgrep.dev/blog/2024/important-updates-to-semgrep-oss

### CodeQL

GitHub CodeQL provides deeper semantic/static analysis with default and `security-extended` query suites, including JavaScript/TypeScript and Kotlin/Java support. Results can be generated in SARIF.

Seven role:
- CI/security specialist, especially because Seven's public GitHub repository can use GitHub code-scanning capabilities subject to GitHub's terms;
- not shipped in APK;
- supplement, not replace, targeted Semgrep architecture rules.

Sources:
- https://docs.github.com/en/code-security/reference/code-scanning/codeql/codeql-queries/javascript-typescript-built-in-queries
- https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-query-suites
- https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-cli

## 8. SupplyChainVerifier

### OSV-Scanner

OSV-Scanner supports machine-readable JSON/SARIF and scanning from project dependency sources/SBOMs. It also has license checking support using SPDX identifiers.

Seven role:
- dependency vulnerability evidence on CI/release;
- findings are matched to the exact lockfile/SBOM/artifact revision;
- no blind auto-upgrade: remediation proposals still need compatibility/evals.

Sources:
- https://google.github.io/osv-scanner/output/
- https://google.github.io/osv-scanner/usage/license-scanning/

### Syft + SBOM standards

Syft can inventory source/filesystems/artifacts and output native JSON, SPDX and CycloneDX. Its docs note that format conversion can lose information, so Seven should retain the richest original scan evidence and generate interchange views separately.

Seven decision:
- host/CI specialist, never startup runtime;
- generate SBOM from the release artifact/build context;
- bind SBOM hash to release artifact hash;
- store either Syft-native evidence plus CycloneDX/SPDX export, or choose a standards-first canonical profile after Deep Polish;
- do not assume all standard formats preserve identical fields.

Standards:
- CycloneDX is an OWASP-maintained BOM standard;
- SPDX is an ISO/IEC 5962 standard and SPDX 3.0 is current on the SPDX specification site.

Sources:
- https://oss.anchore.com/docs/guides/sbom/formats/
- https://cyclonedx.org/specification/overview/
- https://spdx.dev/use/specifications/

## 9. SecretLeakScanner

### Gitleaks

Gitleaks remains mature and scans repositories/files/stdin, with baseline and machine-report support. However its current upstream README states that the project is feature-complete and future releases focus on security patches.

Classification:
- `STABLE FALLBACK`, not the long-term innovation path.

### Betterleaks

Betterleaks is the newer candidate associated with the original Gitleaks direction. Current documentation includes directory/git scans, JSON/SARIF reports, baselines, archive/decoding support and optional live validation.

Classification:
- `EXPERIMENTAL / STRONG CANDIDATE` until Deep Polish verifies maturity, release cadence, compatibility and false-positive/validation safety.

Seven rules:
- normal scans redact detected secret values from persisted evidence;
- live validation is OFF by default because it performs outbound requests using candidate credentials;
- enabling validation requires an explicit network/security mode with request/rate limits;
- secret findings never get copied into model context;
- scan current tree + relevant git history + packaged release artifacts where practical.

Sources:
- https://github.com/gitleaks/gitleaks
- https://github.com/betterleaks/betterleaks

## 10. AccessibilityVerifier

axe-core is a strong automated accessibility engine for Seven's HTML/WebView surfaces and supports modern WCAG rule mappings. Its own ecosystem documentation clearly states automated checks cannot prove full accessibility conformance.

Seven role:
- browser CI checks for accessible names/ARIA/contrast/structural issues that axe can automate;
- combine with Seven-specific tests for RTL, focus order, touch targets, keyboard/focus behavior and Reduced Motion;
- retain manual/real-device checks for criteria automation cannot determine.

axe-core does not itself cover native Android view accessibility. Native wrapper/system surfaces need Android testing/accessibility-tree checks separately.

Sources:
- https://www.deque.com/axe/axe-core/
- https://docs.deque.com/devtools-for-web/4/en/rulesets/

## 11. AndroidVerification

### UI Automator 2.4

AndroidX UI Automator 2.4.0 is a stable 2026 release for cross-app/outside-process functional UI testing. The modern API includes explicit app-state/waiting support, screenshot capability and results reporting.

High-value Seven tests:
- permission prompts and denial/retry flows
- Photo Picker/SAF handoff
- notification/settings handoff
- share sheet flows
- process relaunch/recovery
- deep/app links
- orientation/device window changes
- actual APK navigation without relying on internal DOM details

Source:
- https://developer.android.com/jetpack/androidx/releases/test-uiautomator

### Macrobenchmark

Android Macrobenchmark measures user-level flows such as startup, scrolling/frame timing and critical interactions externally from the target app.

Seven role:
- release-performance gate on a stable representative device/device class;
- cold/warm startup metrics;
- frame/jank/critical journey measurements;
- compare medians against baseline rather than one noisy run;
- store device/OS/build/environment with results.

Because the user's target is a resource-constrained Android phone, Seven should maintain at least one **real mid-range device benchmark profile**, not only flagship/emulator measurements.

Sources:
- https://developer.android.com/topic/performance/benchmarking/benchmarking-overview
- https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics

### Baseline Profiles

Baseline Profiles can improve Android critical-path compilation/startup, but they are an optimization artifact, not verification by themselves.

Rule:
- generate/adjust only after Macrobenchmark proves benefit on critical Seven journeys;
- verify that profile changes actually improve or at least do not regress target-device metrics.

Source:
- https://developer.android.com/topic/performance/baselineprofiles/overview

## 12. MutationAudit — StrykerJS

Mutation testing checks whether tests actually detect small intentional code defects. StrykerJS supports JavaScript/TypeScript projects but is computationally expensive because it executes many mutants/tests.

Seven classification: `SPECIALIST EXPENSIVE`.

Use selectively for:
- permission/authority logic
- SideEffectLedger/idempotency
- TaskContract validation
- canonical state transitions
- source-integrity protections
- critical parser/sanitization boundaries

Do not run broad mutation testing on every interactive edit or bundle/UI file. Require demonstrated signal-per-CI-minute before expanding scope.

Sources:
- https://stryker-mutator.io/docs/stryker-js/introduction/
- https://stryker-mutator.io/docs/stryker-js/configuration/

## 13. Fault and network verification

Wave 07 introduced RetryController/side-effect uncertainty. Wave 08 must verify them under controlled faults.

Required cases:
- DNS/connect failure before dispatch
- connection reset during response
- timeout after possible write dispatch
- 401 expired token
- 403 insufficient scope
- 408/429/5xx behavior
- `Retry-After`
- stale/changed ETag leading to 412
- duplicated response/delivery
- cancellation during streaming/tool action
- process reload between side-effect dispatch and verification

Browser/API adapters can use Playwright routing/HAR or test servers. Never inject these faults against uncontrolled production actions.

## 14. State-machine verification

Use fast-check model-based commands against simplified reference models for:
- Durable Run Kernel
- Connection lifecycle
- WorkManager scheduling records
- Memory event ledger/view rebuild
- Context pin/compress/evict/reconstruct
- permission grants/revocation
- Tool call lifecycle
- SideEffectLedger `REQUESTED → DISPATCHED → VERIFIED/FAILED/UNCERTAIN`

Critical invariant examples:
- no terminal PASS before required verification evidence exists;
- retry cannot duplicate a known successful non-idempotent action;
- revoked permission cannot reappear through summary/cache/model echo;
- derived object authority ≤ authoritative source authority;
- stop/cancel prevents downstream work from starting after cancellation boundary.

## 15. Verification selection algorithm

Proposed `ImpactSelector` input:
- changed files/components
- capability graph
- risk class
- side-effect class
- source/runtime layers touched
- previous failures
- release vs interactive mode

Output:
- mandatory checks
- optional confidence checks
- skipped checks + reason
- estimated time/resource budget

Example:
- CSS-only token change → CSS/static checks + Playwright surfaces + axe + screenshot/overflow, not API fuzzing.
- AuthBroker change → unit/property + OAuth fixtures + secret scan + static/security + retry fault tests + connection state model.
- Canon validator change → canon fixtures + property/model tests + no Android benchmark unless startup bundle changed.

## 16. Findings are evidence, not truth

Normalized finding states:
- `DETECTED`
- `CONFIRMED`
- `FALSE_POSITIVE`
- `NOT_APPLICABLE`
- `MITIGATED`
- `ACCEPTED_RISK`
- `UNKNOWN`

Every state transition requires evidence/reviewer or deterministic validation reference. A scanner's severity label does not automatically become Seven's final risk score.

## 17. Rejected / limited approaches

- shipping heavy scanners/fuzzers inside Seven APK: rejected.
- one universal test command for every change: rejected.
- coverage percentage as correctness proof: rejected.
- scanner output as authoritative fact: rejected.
- real production side effects during fuzzing/property tests: rejected.
- Playwright experimental Android path as sole release verifier: rejected.
- automated axe result as full accessibility certification: rejected.
- mutation testing entire codebase on every commit: rejected.
- automatic dependency upgrades solely because a scanner suggests a fixed version: rejected.
- storing leaked secret values inside CI evidence: rejected.
- live secret validation by default: rejected.
- retaining unsanitized HAR files containing credentials/cookies: rejected.

## 18. Deep Polish queue

Recommended order:

`VerificationEvidence schema → ImpactSelector → Vitest normalization → fast-check PropertyEngine → Playwright release/fault harness → Android UI Automator + Macrobenchmark → StaticAnalysisBroker(Semgrep+CodeQL) → SupplyChainVerifier(OSV+SBOM) → SecretLeakScanner → AccessibilityVerifier → Schemathesis ApiContractFuzzer → selective StrykerJS MutationAudit`

This order first establishes Seven's evidence and selection semantics, then adds specialist engines behind those stable contracts.

## 19. Open gaps

- benchmark actual Vitest/Playwright/fast-check overhead on current repository layout;
- final `VerificationEvidence` JSON schema;
- dependency/capability graph implementation for ImpactSelector;
- exact policy for caching/reusing prior test evidence across unchanged dependencies;
- Betterleaks maturity/false-positive benchmark against Gitleaks on Seven history;
- Semgrep rule licensing review before redistributing any maintained rule packs;
- CodeQL workflow availability/config for the active public repo and branch protections;
- final SBOM canonical/internal vs interchange representation;
- representative Android benchmark device matrix and thresholds;
- accessibility checks for Capacitor/native wrapper chrome after packaging;
- isolated API sandbox accounts for future connector fuzzing;
- nightly vs PR vs release fuzz budgets.

## Coverage statement

Wave 08 covers unit/integration testing, browser E2E/network replay, property/model-based verification, API contract fuzzing, static/security analysis, dependency vulnerability scanning, SBOM/license inventory, secret scanning, accessibility checks, Android functional/performance verification and mutation testing.

This is practical saturation for the general verification-tool discovery wave. Domain-specific verification for individual tools will still be Deep Polished with those tools.

No production integration occurred in this wave. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
