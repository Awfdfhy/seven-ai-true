# Seven AI — Current Status

## Lead Release Manager — continuation integration snapshot

Release remains **NOT ACCEPTED / no RC**. PR #105 reconciles upstream `e40a655c0a71a24290a9515f3f72e7ffeb919329` with the release repairs, preserving both ADR-REL-001..005 and ADR-015..019 and specialist history. The enclosing commit identifies this candidate; later commits require separate evidence.

- All 34 local component suites reran on the merged source and passed; exact durations are in RELEASE_EVIDENCE.json. Full local browser gate remains unavailable because the Chromium archive download fails.
- Verified upstream-only CI: Seven AI tests run 37241282527 and Seven Android APK run 37241282530 passed on `b3e3ffa4fe676a838ed658e22fad1576cfe11237`. Android job 111550342818 passed lint/unit/build, packaged-content checks, and connected API34/API36 WebView tests. These results do not certify the PR candidate.
- Upstream added room write-ahead recovery, canonical response modes, originating-room cancellation, controller context budgets, fallback deadlines, temporal citations and native GitHub boundary/log fixes. Browser regressions exist for WAL staging/replay; actual Android process-kill/upgrade durability remains unproven.
- Intermediate PR SHA ad00c123daedebf4193b8b158a725c2353fc455f passed full Seven AI tests run 37259977856. New binary/signature gate changes need their own CI. The added shell ownership and APK binary suites pass locally (36 component suites now available).
- Added actual APK binary package/version/signature verification and a published JSON evidence artifact. Existing root debug build does not establish stable signing identity across runs; data-preserving upgrade remains unaccepted.
- Pending: final PR full browser CI, merge to main, fresh Android workflow for the exact merged SHA, embedded version-5 provenance/package/signature verification and install/upgrade persistence.
- Root HTML/Capacitor and typed remake remain different product trains. Live RPG atomic turn integration and Coding/Evolution wiring remain architectural blockers. Evidence score stays 43/100 until final-SHA gates are verified.

See PROJECT_TRUTH_REPORT.md and RELEASE_EVIDENCE.json. No fresh candidate APK or RC is claimed here.

## Earlier specialist batch history

Last integration update: 2026-10-05

## Integration position
**Release candidate validation in progress. Seven is not yet final-accepted.**

The Integration track has now repaired and regression-locked the highest-confidence cross-system failures found in the master bughunt: execution checkpoint integrity/retention, Canon chronology/branch boundaries, IndexedDB recovery, Arabic IME send safety, response-mode truth, room/mode cancellation, Deep Think role ordering and telemetry ownership, multilingual/context-window budgeting, fallback deadlines, provider discovery timeouts/health, GitHub credential expiry/path/log handling, attachment retry/size/type gates, research temporal citation locks, and multiple RPG projection/pack/snapshot defects.

## Evidence already green
- Seven AI tests: SUCCESS on main SHA 6f5063d61526880542107c825d2f48c64715e46f.
- Seven AI tests: SUCCESS on main SHA 7e320564c9c519283a5e93fb6c0b9a0343a16bcd.
- Seven Reality Lab: SUCCESS on SHA 428f5fd027c2203aa03808e782a1a0367d58a583.
- Recent static audit: PASS at 98,775 hot release-layer bytes, under the 100,000-byte gate.
- RPG focused evidence: 1010 state events, versioned session rollback/isolation/quarantine tests, bounded character context, and 1006-event long-story restart harness.

## Current RC batch
The next code SHA after this document update must pass:
1. all.cjs / Seven AI tests;
2. production release verifier/static audit;
3. Android lint + unit tests + APK build;
4. APK content verification;
5. Android 16 connected WebView tests;
6. Android 14 connected WebView/UI tests.

No later code push should be credited without rerunning those gates.

## Known acceptance blockers / external dependencies
- Live legacy RPG workspace is not yet atomically unified with the new structured RPG session manager/public Memory projection.
- Android background/process-death during queued room persistence is not fully proven.
- Repository required-status enforcement cannot be verified or configured through the current GitHub App. Repository rulesets currently return an empty list; branch-protection read requires unavailable administration permission.
- Agent workflow isolation is not fully proven.
- Several PARTIAL UI/lifecycle ownership items remain; see BUG_STATUS.md.

## Acceptance statement
**No zero-bugs claim.** Current meaning of green is only: zero known reproducible blockers in the specific suites that passed. Full Integration Acceptance requires the latest release-code SHA to complete Web + Android gates and resolution/explicit acceptance of the blockers above.


## RPG Specialist Batch 01 — Structured State Foundation

Implemented:
- docs/seven-master/RPG_RESEARCH_REPORT.md — external research synthesis + repo gap analysis.
- docs/seven-master/RPG_ARCHITECTURE.md — structured RPG architecture and integration boundaries.
- docs/seven-master/RPG_IMPLEMENTATION_PLAN.md — staged build/evaluation plan through long-story + Android + Integration verification.
- release/workspaces/rpg-state.js — pure structured-state kernel.
- release/rpg-state.test.cjs — deterministic state/continuity acceptance coverage.
- all.cjs now registers the RPG state suite.
- RPG workspace dependency loader now loads SevenRpgState with legacy World/Canon runtimes.
- RPG State Contract v1 and ADR-010..014 ratified.

Evidence from the kernel scenario:
- PASS at 1010 committed events/turns.
- Player-control mutation from runtime is blocked.
- Invalid cross-location scene is blocked.
- Future/local-secret knowledge is bounded by character.
- Belief can disagree with truth without promoting to Canon.
- Multi-dimensional relationship and emotion mutations persist.
- Lower-priority Canon and conflicting HARD CANON mutations are blocked; explicit user override is accepted.
- Inventory ownership and timeline rollback guards pass.
- Test context projection remained bounded (~5.2k serialized chars for the long fixture).

Not yet accepted:
- live model generation does not yet consume the new Character/Narrator views;
- per-room/per-world RPG persistence kernel now exists and is tested; live RPG workspace use is not yet wired;
- legacy World/Canon + new state commit is not yet one atomic turn transaction;
- character-context boundary fixtures now pass; live model dialogue no-leak behavior is still unverified;
- directional relationships, production token-aware retrieval, semantic 100/500/1000-turn evaluation and Android restore UX remain open.

Next RPG implementation target: wire the tested Session/Context modules into the actual per-room turn transaction and shared Memory, then verify Android restart and live generation.


## RPG Specialist Batch 02 — Persistence, Context Isolation, Long-Story Harness

Implemented:
- release/workspaces/rpg-session.js — versioned per-room/per-world session manager with corruption detection/quarantine, optimistic revision checks and atomic batch commit/rollback.
- release/rpg-session.test.cjs — roundtrip, stale-write, room isolation, corruption, identity and rollback tests.
- release/workspaces/rpg-context.js — separate Narrator View and character-local Character View.
- release/rpg-context.test.cjs — knowledge-boundary tests at the generation-context boundary, including exact character-ID relationship filtering.
- release/rpg-longstory.test.cjs — 1006-event deterministic continuity benchmark with old consequence persistence, item ownership, quest/faction state, voice stability, knowledge propagation, restart checkpoints, HARD CANON rejection and player-agency rejection.
- all three suites are registered in all.cjs; RPG lazy loader includes the new state/session/context runtimes.

Evidence already established by focused module tests:
- state kernel: PASS at 1010 events;
- session manager: PASS for room isolation, stale writes, atomic rollback and corrupt-state quarantine.

CI note:
- an earlier main run at SHA 2b655b9 failed the static startup budget at 102,602 bytes, not an RPG logic assertion.
- the project retained the 100,000-byte gate; a concurrent release optimization (a5dea37) adjusted the real startup layer rather than weakening the limit.
- full CI for the latest RPG/context/long-story commits is still being revalidated, so this batch is not yet marked regression-safe.

Still open:
- live room/workspace binding and automatic hydrate/continue flow;
- migration/unification with legacy World/Canon runtime state;
- shared Context Builder + Model Routing token-accounted RPG projection;
- public Memory Fabric writes for RPG adapter records;
- model-output delta extraction and post-generation validator;
- directional relationship model;
- semantic character voice/emotion/narrative evaluation;
- Android RPG restart/RTL/mobile acceptance.
See:
- docs/seven-master/INTEGRATION_AUDIT.md
- docs/seven-master/BUG_STATUS.md
- docs/seven-master/INTEGRATION_CONTRACTS.md
