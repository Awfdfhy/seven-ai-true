# Seven AI — Project Truth Report

Audit date: 2026-10-05 (Asia/Baghdad). Release decision: **NO RC / NOT RELEASE-ACCEPTED**.

## Executive summary

The inspected main application is the HTML/Capacitor product, not the separate React/TypeScript remake found on specialist branches. Root `package.json` builds `seven_ai-final.html` through `release/build-release.cjs`; it does not build `remake/`. A successful main APK therefore cannot be evidence that all recent Memory/Tools work is included.

Initial inspected main: `ff9693077d5cedfaf4dd8213f9536c8f981f5f91`. Integrated upstream snapshot for this report: `8f9956858f61a82a4888e91cc3a2c4ce5fceadd7`, plus the release repairs described below. The enclosing Git commit identifies the final report/repair snapshot. Later specialist commits are outside this audit until retested.

Read the six master documents in full, inventoried the complete initial Git tree (452 entries, not truncated), inspected build/runtime/CI entrypoints and representative subsystem implementations, examined branches and open PRs, ran component suites and injected failures. This is a bounded engineering audit, not a claim that every line or every branch was reviewed.

## Current true system status

Completeness below means verified capability scope, not an invented percentage. Tests marked PASS refer to local deterministic/component checks; browser scenarios and live services are distinct gates.

| System | Current real implementation / evidence | Completeness | Test status | Integration status | Known problem / risk | Next action |
|---|---|---|---|---|---|---|
| Chat Core | `seven_ai-final.html`: room operations, streaming, send lock, bounded rendering, IndexedDB canonical persistence; `verify.cjs` has browser regressions | Implemented, acceptance incomplete | VM/runtime checks PASS; browser execution locally blocked | Root production path | Global generation/cancellation state and rapid switching need current E2E proof; HIGH | Run room-switch/stop/restart scenarios on exact candidate |
| Model Routing | Monolith provider registry, request normalization, route selection, health/quarantine and latency samples | Runtime exists; advertised model quality is not measured | Deterministic tests exist; live provider matrix UNMEASURED | Root chat consumes routing | Catalog scores/capabilities/free labels are declarations, not live evidence; HIGH | Capture live request/error/fallback/TTFT matrix |
| Memory | Monolith canonical bundle, immutable event history, retrieval and permissions; `memory.cjs`; a separate small `SevenRuntime` permission store also exists | Legacy fabric implemented; latest remake work absent from root build | Memory storage/corruption/ledger PASS | Legacy chat path exists; separate permission store needs explicit mapping | Parallel memory architectures, legacy/typed schema seams, scale; HIGH | Inventory exact data owners; adapt rather than silently merge |
| Files | Knowledge artifacts/chunk search, local PDF runtime, lazy attachments; unsupported binary files remain metadata; text extraction limit 8 MB | Parsing/context exists; universal device editing absent | Runtime fixture checks; PDF/SAF browser/device behavior pending | Attachments consumed by chat; native SAF generated | Large PDFs, binary lifetime, concurrent native IO need device evidence; MEDIUM | Test size limits, PDF cancellation, SAF persistence and restart |
| Web Research | Monolith `SevenSearchV2`, gateway worker, citation/evidence locks; separate release research runtime and compressed research workspace | Multiple implemented paths | Gateway 15 cases PASS; deterministic evidence suites PASS | Chat/gateway present; research workspace ownership duplicated | Current live quality and service availability not established; HIGH | Run live quality corpus and verify identical citation IDs across paths |
| Deep Think | `runDeepThink`, request budgets, stages, cancellation, latency diagnostics | Pipeline present | Fixtures/diagnostic checks; live reasoning quality UNMEASURED | Routing/chat integration present | Long network/model latency and stop isolation not device-tested; HIGH | Measure TTFT and total latency per provider with stop/network loss |
| Tools | Monolith schema/policy/ticket/discovery fabric; executable native adapters are `web.search` and `artifact.search`; separate `SevenRuntime`/`SevenExecution` gate | Limited production adapters; richer typed kernel on another branch | Runtime + cross-layer contracts PASS | Multiple schema/gate models coexist | MCP/plugin discovery does not imply executable adapter; HIGH | Define one adapter boundary and map `schema` vs `inputSchema`, risk vocabularies |
| Coding System | Read-only project workspace, knowledge context attachment, GitHub patch planner/apply flow | Inspection/chat/Git path present; device shell disabled | Coding map and evolution adapter fixtures PASS; real GitHub workflow E2E pending | GitHub writes repaired in this audit; standalone evolution expects adapters | Not a complete on-device coding agent; HIGH | Inspect Coding specialist PR against selected product, then patch/test real repo |
| Self-Development | `evolution/*` scoring, gates, durable state, repair/recovery; `github-self-dev.js` UI/native GitHub path | Tested policy core; production loop incomplete | Evolution suites PASS; 11 failure-hunt cases PASS | Browser GitHub path is not proven to route through the full evolution/Coding engine | Exact-CI false acceptance fixed; trusted eval/baseline/promotion wiring still open; HIGH | Connect real adapters with immutable baseline/candidate evidence |
| RPG | World/Canon compatibility runtimes; new state, session and character-context modules loaded by hub | Tested foundations; live structured turn transaction not wired into RPG UI/chat | State/session/context/long-story suites PASS after budget fix | Module loading exists; legacy RPG workspace still owns actual turns | Loaded code is not live usage; narrator/character prompt and shared memory seam incomplete; HIGH | Wire one validated atomic per-room turn and prove no secret/player-control leaks |
| Integration | Control/Runtime/Execution contracts, checkpoint integrity, cancellation/agency/citation gates | Component seams verified; whole-product gate incomplete | `integration-contracts.test.cjs` PASS | Late Control boot fix incorporated from upstream | Error taxonomy/request identity coverage and concurrent operations incomplete; HIGH | Run the acceptance matrix on one fixed product snapshot |
| Android / UI | Capacitor 8.5.2; generated native storage/SAF bridge; RTL/themes/reduced motion; API 34/36 instrumentation workflow | Native project generation verified | Web build and Android generation PASS; Gradle/browser/device checks BLOCKED locally | Root APK pipeline builds legacy product | Install/upgrade/signature continuity and current UI device evidence unverified; HIGH | Exact-SHA CI build + API 34/36 + installed upgrade test |
| CI/CD / evals | Root tests/APK workflows, deterministic evolution suites, corpus audit, many historical agent workflows | Infrastructure exists; test discovery repaired | 33 component suites PASS; 119 tracked JS syntax checks PASS | Root release path exists; Reality Lab references missing remake product | Multiple release trains, missing root lockfile, stale workflow lineage; HIGH | Separate workflow ownership and enforce a single release evidence record |
| Documentation | Master contracts and specialist docs exist | Updated by this audit; earlier entries retained as history | Compared to real code, not accepted as evidence alone | Truth report and release addendum provided | Plan prose was previously presented beside unfinished wiring; MEDIUM | Keep snapshot/SHA and observed/not-tested labels in every update |

## Defects found and repairs

| ID | Severity | Reproducible cause | Disposition / evidence |
|---|---|---|---|
| REL-01 | CRITICAL | Self-dev CI selected `runs[0]` when no run matched candidate SHA, allowing an old success | FIXED: require exact SHA + branch in required workflow endpoint; timeout rejects; failure injection PASS |
| REL-02 | HIGH | Self-dev branches awaited push CI although root tests only automatically run on main/PR | FIXED: dispatch `seven-tests.yml` after initial and repair commits; accept dispatch runs for exact SHA |
| REL-03 | HIGH | `atomicCommit` used separate Contents API commits, publishing partial changes if a later write failed | FIXED: one tree/commit, one non-forced ref update, validate all paths first, preserve modes; race test PASS |
| REL-04 | HIGH | Merge was not bound to the tested head | FIXED: merge request includes verified SHA; injected test PASS |
| REL-05 | HIGH | Evaluation/APK verification paths remained writable by autonomous patches | FIXED: protect eval corpus, memory/runtime test entrypoints and release/provenance gates; test PASS |
| REL-06 | HIGH | File read exceptions, including network/auth errors, were treated as nonexistent files | FIXED: only 404 permits create; injected 503 aborts without replacement |
| REL-07 | HIGH | APK gate checked markers/generated Gradle but lacked an exact source/payload binding | FIXED: packaging manifest v5 records source SHA, dirty status, run ID and SHA-256 inventory; verifier checks bundled bytes; seven rejection/acceptance cases PASS; actual APK validation pending |
| REL-08 | HIGH | Static startup audit omitted the UI polish loader and measured a different quantity from browser gate | FIXED: both use compiled startup bytes; loader refactored without public API changes; no budget increase |
| REL-09 | MEDIUM | Failed lazy scripts remained in DOM; subsequent attempts could wait forever or resolve without a runtime | FIXED: failed/absent-registration scripts removed, retry allowed, concurrent loads deduplicated; failure/recovery tests PASS |
| REL-10 | HIGH | New RPG character context trimmed Canon but kept hundreds of knowledge references; existing 9k-bound test failed | FIXED: refs follow selected Canon, count complete serialized view including diagnostics, reject unavoidable oversize; original failing scenario + oversized biography now PASS |
| REL-11 | MEDIUM | Build synchronizer rewrote four tracked launcher files, conflicting with clean source provenance | FIXED: synchronized current label committed in source; second synchronization changes 0/4 files |
| REL-12 | HIGH | Explicit test lists could omit new specialist regression files | FIXED: root automatically discovers every `release/*.test.cjs`; newly landing RPG/context/boot suites included |

Also incorporated upstream fixes for checkpoint integrity/retention, actual cancellation abort, Control late-boot recovery and IndexedDB recovery UI. Those are credited to the upstream integration work, not newly invented fixes from this audit.

No claim of zero bugs is made. The separate master bughunt backlog was not fully revalidated/closed by this pass.

## Integration conflicts and unfinished branches

- **Two applications:** root HTML/Capacitor versus `remake/` React/TypeScript. Compare at `f65a300` showed `tools-v1-champion` 274 commits ahead / 83 behind and `memory-v2-semantic-final` 271 ahead / 83 behind. These counts describe that comparison, not today's moving branch tips. The diffs add entire application/storage/tool trees; blindly cherry-picking them is unsafe.
- Root `package.json` has no `remake` build/typecheck command. Root passing tests do not cover the typed Memory/Tools implementation.
- `seven-reality-lab.yml` listens to `Seven Remake Android Release Gate`, expects `remake/package.json` and a remake embedded release identity. That workflow is not the root `Seven Android APK` acceptance path. A green historical Reality Lab run must not be attributed to the root candidate.
- World/Canon versus new RPG State/Session/Context have different responsibility boundaries. ADR-010..014 describes the target; hub loading alone does not implement the transition.
- Legacy Tool `inputSchema`/risk levels and permission-store `schema`/side-effect risk vocabulary require an adapter. Passing a fixture built for one API does not prove all native tools use it.
- Compressed `release/remake-source/*.gz` is a materialized UI/intelligence asset source, not the typed remake application. Generated `release/workspaces/remake.js` is overwritten during build; permanent edits belong in its tracked source/transform.
- `seven_ai-t150.html`, `t152`, `t161`, multiple shell layers and many historic agent branches remain. Their presence is not evidence of execution or safe deletion; no branches/history were deleted.
- Open specialist PRs observed included Integration #103, Self-Development #102 and historical Coding/Web/UI work. Review changed files and SHA-specific gates before merging; titles/status documents do not prove absence/presence on main.

## Test and failure-hunt evidence

- 31 component suites passed on the merged main snapshot through Control boot/session work; two newly landing RPG context/long-story suites were then tested. Context failed before REL-10 and passed after repair. Total verified component suites: **33**. Their evidence is in `RELEASE_EVIDENCE.json`.
- `release/github-self-dev.test.cjs`: 11 failure-hunt cases, including stale CI, wrong branch, unfinished timeout, exact failure, partial/racing changes, protected gates, network read failure and merge SHA binding.
- `apk/build-provenance.test.cjs`: 7 cases (current payload, stale bytes, wrong SHA, dirty source, old format, duplicate paths, traversal).
- `release/ui-polish-loader.test.cjs`: network error, missing runtime registration, retry recovery and concurrent loading.
- Gateway 15 tests, Memory 9 assertions, runtime 28 assertions, integration contracts, evolution unit/regression and RPG deterministic tests passed. These use synthetic/injected adapters where documented.
- 119 tracked JS/CJS/MJS files passed `node --check`; this is syntax checking, not lint or type checking. Root declares neither lint nor TypeScript checking scripts.
- `npm run build:web`: PASS. `npm run android:generate`: PASS, including native assets/bridge/SAF/reduced-motion/instrumentation materialization.
- `node all.cjs`: **NOT A FULL PASS** locally. `verify.cjs` cannot launch Chromium; both supported browser download attempts returned unusable archives. No mock browser result substituted.
- `./gradlew --no-daemon lintDebug testDebugUnitTest assembleDebug`: **BLOCKED**, Gradle 8.14.3 download failed with `Network is unreachable`. Local Java is 17; workflow requires Java 21; no local Android SDK/emulator was available. Android lint/unit/device/install results remain unverified.
- Network/provider recovery, malformed provider output, rapid switching, concurrent native file operations, restart during operations and install/upgrade remain acceptance work. Existing fixtures are distinguished from live/device testing.

## Performance evidence and limits

Node 24.19.0 Linux container, synthetic records, 20 warmed retrieval measurements. These are not Tecno Pova 5 measurements.

| Measurement | p50 | p95 | Interpretation |
|---|---:|---:|---|
| Memory ranking, 100 records | 1.14 ms | 1.78 ms | Small fixture cost |
| Memory ranking, 1,000 records | 8.04 ms | 13.02 ms | Scaling visible |
| Memory ranking, 10,000 records | 118.64 ms | 164.87 ms | Whole-corpus scan is a real candidate for indexing/worker execution |
| RPG event, first 100 of 1,000 | 0.50 ms | 0.99 ms | Small ledger |
| RPG event, last 100 of 1,000 | 8.24 ms | 10.12 ms | Full state/ledger cloning and validation increase per-turn work |

RPG state reached approximately 298 KB in the benchmark. These measurements diagnose growth; changing canonical state/ledger architecture requires a specialist contract review. Startup release layer is ~98.7 KB under the unchanged 100 KB gate. Total static package is ~4.16 MB under the 8 MiB budget; these bytes are not startup milliseconds.

Startup time, TTFT, total response latency, live routing overhead, live tool/web latency, large-chat rendering, APK startup/battery/RAM/thermal remain UNMEASURED in this pass. Existing telemetry functions and catalog speed numbers are not substituted for measurements.

## Release readiness and artifact decision

Evidence score: **43/100** (engineering rubric, not percent feature completion).

| Gate | Earned / available |
|---|---:|
| Component correctness | 15 / 20 |
| Cross-product/system integration | 5 / 20 |
| Live end-to-end behavior | 5 / 15 |
| Android build/lifecycle/UI evidence | 5 / 20 |
| Source/artifact provenance | 8 / 10 |
| Install/upgrade/data continuity | 0 / 10 |
| Truth documentation | 5 / 5 |

Expected generated identity: `ai.seven.v243`, version `2.4.3`, versionCode `243`. These values were read from generated Gradle, **not from a built APK**. No fresh installable APK was produced by this local pass. No old APK was reused. No RC1 was created because the acceptance gate did not pass.

Signing identity continuity, package/data migration across older variants, actual binary package/version/signature, APK install and upgrade remain gates. Current workflow builds Debug; that alone is not a production signing/upgrade proof.

## Precise next action

1. Pin one release candidate SHA and settle the product split: root main currently means the HTML product. Keep unreviewed typed remake work isolated and produce a capability-by-capability migration plan rather than claim it is already included.
2. Run `node all.cjs` and `Seven Android APK` on that exact integrated SHA in CI with Chromium, Java 21 and Android SDK. Record named jobs/conclusions and artifact source SHA; no unrelated success qualifies.
3. Verify APK manifest/version/signature and hashed web payload; run API 34/36 smoke plus an actual install/upgrade/restart on the user's Android 14 device without deleting data.
4. Wire one atomic RPG turn through Session/Context/Memory and stress cancellation/room isolation; reconcile the Coding/Self-Development specialist implementations with the chosen release path.
5. Only then issue **Seven AI RC1**, with SHA/run/tests/known issues/blockers/artifact recorded in one acceptance record.
