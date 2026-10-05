# Seven AI — Project Truth Report

Audit date: 2026-10-05 (Asia/Baghdad). Release decision: **NO RC / NOT RELEASE-ACCEPTED**.

## Latest verified release-code snapshot

Release-code SHA: `120420b076ad7803bc06f15d73fa58546925785b`, on main after PR #105 was merged. Web run [37262979369](https://github.com/Awfdfhy/seven-ai-true/actions/runs/37262979369), job 111613870503: **SUCCESS, all 44 suites** (42 components and two browser suites). Android run [37262979489](https://github.com/Awfdfhy/seven-ai-true/actions/runs/37262979489), job 111613870959: lint/unit/build/first binary and payload verification **PASS**; API36 **FAILED (3/5 tests)**; API34 and final artifact acceptance were skipped. Harness repairs are pending device retest. The initial audit and continuation chronology below retain earlier observations; this snapshot and the following table supersede their old pending/wiring statements.

| System | Current real implementation / evidence | Verified completeness | Test status | Integration status | Known problem / risk | Next action |
|---|---|---|---|---|---|---|
| Chat Core | Root `seven_ai-final.html`: streaming, room WAL/IndexedDB, IME, stop/switch and context lifecycle | Root chat scenarios verified; live service acceptance incomplete | Current 44-suite CI PASS, including browser scenarios | In root release | Process kill/upgrade and real network races remain; HIGH | Device persistence and live-provider matrix |
| Model Routing | Root registry, health/quarantine, discovery deadlines, request/context budgets | Deterministic routing verified; quality/TTFT not measured | Current runtime/browser fixtures PASS | Root chat/Deep Think consumes it | Catalog claims do not prove provider availability/quality; HIGH | Measure requests, errors, fallback and TTFT with live providers |
| Memory | Root canonical fabric/events/retrieval/permissions; separate typed remake implementation remains on specialist branches | Root storage/recovery fixtures verified | Memory component/browser scope checks PASS | Root chat and RPG public snapshot wired | Multiple product/storage owners and 10k-record scan latency; HIGH | Explicit typed migration boundary; indexing benchmark |
| Files | Local PDF/attachments/knowledge extraction and generated native SAF; bounded text input | Root parsing/context verified; universal editing absent | Current component/browser gates PASS; native device gates pending | Root chat/SAF boundary | Large real PDFs, concurrent native IO and persisted URI grants not comprehensively tested; MEDIUM | Device large-file/restart/URI tests |
| Web Research | Root search gateway/evidence/citation locks, bounded deep research and lazy research workspace | Deterministic evidence pipeline verified | Gateway, eval corpus and browser fixtures PASS | Root chat gateway wired; multiple research owners remain | Live source quality/availability unmeasured; HIGH | Live Arabic/current/technical corpus and latency |
| Deep Think | Root role pipeline, token/request budgets, cancellation and diagnostics | Stage/control behavior verified | Current fixtures/browser checks PASS | Root chat/routing connected | Live reasoning quality and latency unmeasured; HIGH | Live staged-provider/cancellation benchmark |
| Tools | Root schema/policy/discovery; actual native executors `web.search`, `artifact.search`; separate runtime gate | Limited adapters verified | Runtime/integration fixtures PASS | Root adapters exist; typed kernel outside APK | Different schema/risk vocabularies; discovery != executable tool; HIGH | One explicit adapter contract before importing typed tools |
| Coding System | Root read-only project workspace/context and native GitHub patch path | Inspection/chat/Git boundary fixtures verified; full coding agent incomplete | Workspace browser and evolution/Git fixtures PASS | Full Coding/Evolution production wiring not established | Typed specialist app and root have separate release trains; HIGH | Capability map and one real gated coding transaction |
| Self-Development | Evolution policy/state/repair/recovery and GitHub path; exact-SHA CI/merge and atomic Git writes repaired | Policy/transaction core verified with injected adapters | 13 evolution suites and failure hunt PASS | Real provider/account autonomous loop unverified | Baseline/eval trust and production adapter wiring; HIGH | Bounded live repository experiment with immutable evidence |
| RPG | `rpg-live-integration.js`: room/world sessions, public Memory snapshot, bounded character context, reload and empty-room reset | Live root adapter verified; validated atomic multi-store recovery incomplete | Source/packaged kernels, 1006-event story and browser live/reload/isolation PASS | UI/chat/Memory connected; uncertain journal blocks hydration/context | Recovery UI, multi-tab arbitration and semantic character evaluation missing; HIGH | Verified journal recovery, then process-kill and dialogue corpus |
| Integration | Runtime/Control/Execution/context/cancellation/persistence seams and source-vs-packaged regressions | Tested root seams verified; cross-product acceptance incomplete | Current all.cjs 44 suites PASS | One root code snapshot integrated on main | Typed product split and shared-state edge cases; HIGH | Resolve ownership and acceptance blockers explicitly |
| Android / APK | Capacitor root package with secure store/SAF/motion/activity recreation instrumentation | Compilation and binary verification observed | Lint/unit/build/signature/package/payload PASS; API34/36 pending | Exact-SHA main workflow | Debug signing continuity, upgrade and process death remain; HIGH | Finish devices, download and independently hash artifact |
| UI | Root shell/remake materialized assets, RTL/day/night/reduced motion | Packaged browser matrix verified | Current browser gate PASS, including repaired dialog/search/RPG state | Canonical palette/Arabic labels and source transforms aligned | Actual phone usability/startup not measured; MEDIUM | Review API34/36 visual evidence and physical phone |
| CI/CD / Actions | Root test/APK workflows, automatic suite discovery, SHA-bound acceptance/provenance | Current root Web gate verified; Android completion pending | 44 suites PASS on current SHA | Typed Reality Lab remains a different workflow/product | `main` branch API reports protected=false and status enforcement off; HIGH | Configure required gates with repository administration access |
| tests / evals / performance | Component, browser, gateway/evolution/research/RPG fixtures; synthetic performance measurements | Deterministic scope verified; live performance/quality incomplete | 42 local components + 44 CI suites PASS; no root lint/typecheck scripts | Root train tested; typed branch tests not credited | Fixtures do not prove live quality; HIGH | Live provider eval + Android startup + 10k-memory regression benchmark |
| Build artifacts / docs | v5 APK inventory, source SHA/run binding, binary metadata/certificate evidence; master contracts/ADRs/report | Web artifact inspected; APK final acceptance pending | Web ZIP CRC/digest/static audit PASS | Old artifacts excluded | Root Web artifact omitted browser results due stale upload path; MEDIUM | REL-25 archival fix, final APK evidence and current status |

REL-26/27: Android run 37262979489 failed 3/5 instrumentation tests. Confirmed incorrect window aliases for global lexical room state, and WAL fixtures lacked a stable persisted room/base revision. Shared fixture now creates a room when needed and awaits a successful flush before staging; empty/existing/failed-flush executable cases PASS. Activity recreation assertions retain title and cleared-WAL requirements. Night core surfaces wait for the same actual canonical colors instead of assuming a 120 ms delay; root cause of that visual failure is not yet established. Failed-test XML/HTML and binary diagnostics now upload even on failure. Device retest remains required. Test discovery is now 43 components plus two browser suites.

REL-25: downloaded current Web artifact contains neither the advertised `release/release-results.json` nor actual browser results. `verify.cjs` writes `results.json` at root; release verifier does not produce the advertised file. Workflow now requires the actual result file before upload and archives it. Producer/upload path consistency check passes; actual post-fix upload remains to be observed. This changes evidence archival only, with no application/runtime/native changes.

Current static evidence from downloaded run artifact: startup 99,176 bytes / 100,000; workspaces 312,727 / 320,000; total static 4,183,932 / 8,388,608. Limits were not raised. Web artifact 11325333676 ZIP SHA256: `f9bb90e4099a8d94bb11714720d05b4888e9dbda44205795a78fec6e89671c7b` (matches GitHub digest). No RC is authorized by passing these gates alone.

## Executive summary

The inspected main application is the HTML/Capacitor product, not the separate React/TypeScript remake found on specialist branches. Root `package.json` builds `seven_ai-final.html` through `release/build-release.cjs`; it does not build `remake/`. A successful main APK therefore cannot be evidence that all recent Memory/Tools work is included.

Initial inspected main: `ff9693077d5cedfaf4dd8213f9536c8f981f5f91`. Integrated upstream snapshot for this report: `9c51dc7ee7c467d02a7fee0714952370323ebca8`, plus the release repairs described below. The enclosing Git commit identifies the final report/repair snapshot. Later specialist commits are outside this audit until retested.

Read the six master documents in full, inventoried the complete initial Git tree (452 entries, not truncated), inspected build/runtime/CI entrypoints and representative subsystem implementations, examined branches and open PRs, ran component suites and injected failures. This is a bounded engineering audit, not a claim that every line or every branch was reviewed.

## Initial audit system status — historical, superseded above

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
| CI/CD / evals | Root tests/APK workflows, deterministic evolution suites, corpus audit, many historical agent workflows | Infrastructure exists; test discovery repaired | 34 component suites PASS; 119 tracked JS syntax checks PASS | Root release path exists; Reality Lab references missing remake product | Multiple release trains, missing root lockfile, stale workflow lineage; HIGH | Separate workflow ownership and enforce a single release evidence record |
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

Also incorporated upstream fixes for checkpoint integrity/retention, actual cancellation abort, Control late-boot recovery, IndexedDB/memory recovery, exact RPG relationship identity, attachment lifecycle, IME safety, provider-safe Deep Think and discovery/token-expiry resilience. Those are credited to the upstream integration work, not newly invented fixes from this audit.

REL-13 (MEDIUM): memory tests wrote generated results into a tracked source file. Results now go to `dist/memory-results.json`; no consumer references the old path, and a rerun leaves tracked source unchanged. This preserves the clean-source APK gate.

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

- 31 component suites passed on the merged main snapshot through Control boot/session work; two newly landing RPG context/long-story suites were then tested. Context failed before REL-10 and passed after repair. Total verified component suites: **34**. Their evidence is in `RELEASE_EVIDENCE.json`.
- `release/github-self-dev.test.cjs`: 11 failure-hunt cases, including stale CI, wrong branch, unfinished timeout, exact failure, partial/racing changes, protected gates, network read failure and merge SHA binding.
- `apk/build-provenance.test.cjs`: 7 cases (current payload, stale bytes, wrong SHA, dirty source, old format, duplicate paths, traversal).
- `release/ui-polish-loader.test.cjs`: network error, missing runtime registration, retry recovery and concurrent loading.
- Gateway 15 tests, Memory 11 assertions, runtime 28 assertions, integration contracts, evolution unit/regression and RPG deterministic tests passed. These use synthetic/injected adapters where documented.
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

RPG state reached approximately 298 KB in the benchmark. These measurements diagnose growth; changing canonical state/ledger architecture requires a specialist contract review. Startup release layer is ~98.9 KB under the unchanged 100 KB gate. Total static package is ~4.17 MB under the 8 MiB budget; these bytes are not startup milliseconds.

Startup time, TTFT, total response latency, live routing overhead, live tool/web latency, large-chat rendering, APK startup/battery/RAM/thermal remain UNMEASURED in this pass. Existing telemetry functions and catalog speed numbers are not substituted for measurements.

## Initial readiness and artifact decision — historical

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

Final recheck: all 34 available component suites passed on the merged upstream snapshot plus these repairs. Full browser/Android gates remain unverified.

## Continuation evidence — integrated upstream b3e3ffa

PR #105 merges upstream b3e3ffa4fe676a838ed658e22fad1576cfe11237 with all REL repairs. Documentation conflicts were reconciled by preserving both architectural decision sets and specialist history. All 34 component suites reran and passed on this merged source. No full-browser candidate pass is claimed locally: Chromium headless archive download still fails.

Independent upstream evidence: root Seven AI tests run 37241282527 and Android run 37241282530 succeeded at b3e3ffa; job 111550342818 passed lint, unit tests, APK build/content verification and connected API34/API36 tests. Artifact 11318020327 belongs to that upstream SHA, not the repaired candidate. It is not promoted as the new candidate artifact.

Upstream now has synchronous room WAL staging and browser replay/revision tests, mode/room cancellation regressions, request-scoped Deep Think telemetry, selected-model context budgeting, fair-share network deadlines, citation temporal metadata and exact native GitHub repository boundaries. This improves implementation coverage but does not establish Android process-kill durability or upgrade continuity. Acceptance remains withheld pending fresh final-SHA CI and unresolved product/live-RPG integration. Historical measurements above remain tied to their original scope.

### REL-14 — APK binary identity/signature verification gap
The previous verifier compared generated Gradle version fields but did not inspect the APK binary manifest/signature. Added binary-verification.cjs: aapt badging package/version checks, apksigner cryptographic verification/certificate fingerprints, missing-tool/unsigned/malformed/wrong-identity regressions and an uploaded apk-verification.json. Focused tests pass; actual APK execution is pending final main Android CI. Stable cross-build debug signing and data-preserving upgrades remain UNVERIFIED. Root debug workflow does not supply the optional CI keystore properties; no private signing material was added to source.

Continuation also integrated e40a655 (shell observer ownership and workflow fallback); shell ownership/static/syntax checks passed. Intermediate PR ad00c123 full Seven AI tests run 37259977856 succeeded. APK binary changes invalidate treating that run as final candidate evidence. Startup audit now reports 99,668 bytes, only 332 bytes below the strict limit; lazy workspace bytes 310,078.

### Latest integration and failure hunt — f90fabb
Upstream introduced rpg-live-integration.js, workspace/session restore/public-memory sync, agent workflow isolation and Android WAL/activity-recreation/motion/SAF coverage. All 39 local component suites passed on this integrated source before the following repair; focused changed suites passed after it. The old table's statement that no live RPG adapter exists is superseded: an adapter now exists, while full atomic transaction/generation/recovery acceptance remains incomplete.

REL-15 fixed a reproducible static lifecycle-test failure caused by a stale variable-name expectation. REL-16 reproduced compound persistence failure: rejection active-index-write-failed, on-disk legacy position advanced from 1 to 2, public memory unchanged. Added a durable per-room uncertainty journal before mutation. Journal-write failure prevents mutations; incomplete rollback/interruption leaves hydrate/context/sync blocked across a new bridge instance, with previous session/index preserved. This mitigates accepting inconsistent persisted state; it does not implement automatic journal recovery or a cross-store atomic commit. Recovery UX, multi-tab arbitration, live character-local model prompting and process-kill persistence remain release blockers.

Latest static audit: startup 99,668 bytes; lazy workspace 319,738 bytes (262-byte margin), static total 4,188,140 bytes. Budgets were not weakened. Additional feature growth should reduce workspace payload before consuming this margin.

### REL-17 — Workspace budget overflow on the actual PR merge
CI run 37260608130 failed static audit at 320,506 workspace bytes. Its checkout c82f71a merged candidate 8521fc02 into newer base ca51645; this is why the earlier local 319,738-byte snapshot was insufficient evidence. Integrated upstream through 8f23536 (room-scoped RPG chat projection, attachment/token convergence, SAF idempotence and workflow tests) and added pinned parser-based RPG packaging. Workspace payload is now 312,627 bytes; limits unchanged. Existing source tests for four RPG modules also run on their packaged output and pass (state 1010 events, session corruption/rollback, bounded character context, live uncertainty/restart).

Packaging benchmark: four readable sources 51,154 bytes, minified output 42,114 bytes; warm Node transform p50 42.60ms / p95 54.92ms. This is build overhead and byte reduction, not measured APK startup or TTFT. Full final-SHA web/Android gates remain required. Root RPG now has a room-scoped chat projection; character-specific semantic generation and uncertain-journal recovery remain incomplete.

### REL-18 — Web/Android build transform stale after room lifecycle integration
npm run android:generate reproduced zero-room transform missing delete final room. Upstream added previousRoomId/event ownership to deletion, while the packaging transform matched an entire old block. Split the transform into the last-room guard and empty-room selection anchors, preserving active-generation protection and dispatchRoomChange. Added executable regressions for deleting the final room, the exact change event, refusing active-generation deletion, repeat transform and changed-anchor rejection. npm run build:web and static audit now pass; final Android generation is rerun after committing.

### REL-19 — Startup budget regression after upstream theme fixes
Integrated e5d9c70798d7edd4f2368ca6a5547570d5931ad9, including stronger night surfaces, system-aware auto theme and isolated release-branch validation. Static audit reproduced startup layer 100085 bytes against strict <100000. Parser-packaged beta runtime now produces 99397 startup bytes; workspace 312627 bytes; total static payload 4184053 bytes. Compression is disabled, public property/function names retained, and 14 original-vs-packaged preference/system/legacy cases pass. Contrast gate passes. Latest source native project generation is rerun after commit. These changes require final full browser and Android evidence; earlier green code is not credited automatically.

### REL-20 — Night-theme specificity conflict in the actual packaged browser
Run 37261393766 passed source/browser regressions, component/packaged RPG/byte gates, then failed release-verify.cjs:90 waiting for #111815 main/composer surfaces. Existing lazy remake rules use #seven-app and shell selectors more specific than the inline resolved-theme bridge, leaving #17211d. Added equally rooted authoritative selectors to the existing core theme bridge; day behavior and acceptance colors remain unchanged. Static audit 99531 bytes and contrast pass. Full browser revalidation remains mandatory; no pass is inferred from CSS alone.

### Latest canonical theme integration and RPG room ownership
Incorporated upstream canonical night canvas fixes and removal of redundant theme clock scheduling. Existing root bridge selectors are retained; all themed shell/remake surfaces target the same tested canvas. Latest static audit: startup 99176, workspaces 312627, total static 4183832 bytes.

REL-21: source inspection found mount called hydrate without clearing prior room-owned state. Closing RPG, switching to an empty room while its listener was unmounted, then reopening could retain the previous world's in-memory workspace when loadLatest returns MISSING. Mount now invokes the existing roomChanged clear/hydrate handler. Extended packaged browser integration to close, reopen an empty room, verify null work/canon/context, then return and reload the original world. Exact browser gate pending; no pass inferred solely from source change.

### REL-22 — Modern night dialog surface mismatch
Run 37261947268 passed night core surfaces, the mobile/RTL matrix and real RPG Memory/context/restart/empty-room isolation regression, then failed release-verify.cjs:440: modern dialog background was rgb(23,33,29), expected canonical rgb(17,24,21). Added a targeted rooted night dialog rule in tracked ui-hardening.css (materialized into remake.css), retaining the acceptance expectation. Static/contrast pass; full final retest required.

### Integrated main and APK signer-output repair
PR #105 merged at 29b26c6417b9fa332ae55f129bae983fb9efae02; no code-tree delta from candidate c5d63bf4ce51f1b21a3af6a186e3e8af5eac3500. Full Web passes: PR run 37262152839 and exact-commit isolated push run 37262150543. All 42 final local components passed. Actual packaged night/dialog/RTL/responsive/RPG Memory/context/restart/empty-room isolation gates passed.

REL-23 (introduced gate assumption): Android run 37262150559 compiled successfully but certificate parsing failed without retaining tool stdout. Parser formerly accepted only numbered signer labels; official apksigner also emits API-range labels for v3.1. Extended supported label parsing, deduplicated certificate fingerprints, excluded source stamps/public-key lines and added diagnostic output. Added API-range/dev-release/uppercase/source-stamp rejection cases. Focused tests pass, real SDK retest remains required; no valid APK is inferred from this repair.

Official implementation reference: https://android.googlesource.com/platform/tools/apksig/+/master/src/apksigner/java/com/android/apksigner/ApkSignerTool.java

REL-23 diagnosis update: main Android run 37262557101 emitted Verifies / v2 true, Number of signers 1, and `V2 Signer: certificate SHA-256 digest`. The earlier API-range extension alone did not fix this SDK output. Added the actual captured scheme-labelled fixture plus V3.1/V3.2 support, preserving public-key/source-stamp rejection and required apksigner exit success. Cryptographic verification is independent of parser success; final APK acceptance remains pending.

REL-24: main Web run 37262557069 exposed nondeterministic Arabic search label ownership. Remake translate wrote ابحث في المحادثات while UiPolish wrote بحث المحادثات; a late translate changed the accessibility label after initial checks. Materialization now aligns the compressed Remake translation with the established canonical label; existing browser gate also repeats alternating owner updates before asserting both placeholder and aria-label. This repairs an intermittent integration gate without accepting either late race result arbitrarily.
