# Seven AI — Current Status

## Lead Release Manager — verified main debug APK; NO RC

Verified application/source SHA: `f5f6a51fbc6d14cff303399a1033ce04f2120f45`. This final evidence update changes documentation only; it does not identify a new application build. PR #105 and follow-up release/integration repairs are on main.

- Main Web run [37264279009](https://github.com/Awfdfhy/seven-ai-true/actions/runs/37264279009): SUCCESS. Isolated same-SHA Web run 37264279653: SUCCESS, **46 suites** (44 components, two browser suites), including 24 packaged-release checks. Downloaded current archive: 152 browser cases PASS, liveProviderCalls=false, ZIP CRC/digest verified.
- Main Android run [37264279050](https://github.com/Awfdfhy/seven-ai-true/actions/runs/37264279050): SUCCESS. Pre-APK all.cjs, generation, lint/unit/build, binary identity/signature and packaged payload verification passed. **API36: 5/5; API34: 5/5**, including activity-recreation WAL recovery, secure-store encryption and genuine system motion/RTL/theme/UI tests. Final APK verification passed again after device tests.
- New main APK artifact [11325603502](https://github.com/Awfdfhy/seven-ai-true/actions/runs/37264279050/artifacts/11325603502): Debug, `ai.seven.v243`, `2.4.3 / 243`, 6,270,954 bytes. SHA256 `e79bcfe4839e4b1f622d17d7f4b9ec46882dcefaf05ae9d67f8f1fe52bfd6a82`. Downloaded binary matches the CI receipt, clean source SHA/run, ZIP CRC/DEX/manifest and every one of 201 web-asset hashes. No old APK reused.
- Signer certificate SHA256: `93ee644b0d14a46c8f654b334b1b1fda15f52d4e815b634402836a6e8b42d7e0`. Valid signing is verified; upgrade signing continuity remains UNVERIFIED. API34 XML independently confirms 5 tests, zero failures/errors; CI logs confirm API36 likewise. Visual archive has 20 screenshots per API; representative night/Arabic screens inspected.

Current true implementation: root HTML/Capacitor product. Root chat/routing/context/memory/files/research/Deep Think fixtures and browser paths pass within their tested scope. Tools have limited real adapters; full Coding/Evolution production wiring remains incomplete. Typed remake Memory/Tools/Coding specialist branches are a separate product train and are not credited to this APK. RPG has actual room/world session, public Memory snapshot, bounded chat context, reload and empty-room isolation; uncertain cross-store persistence is journal-quarantined, with verified recovery still incomplete.

Newly observed UI issue REL-28: persistent Saved/IndexedDB badge overlaps bottom navigation labels in API14/API16 screenshots. OPEN, medium severity; does not invalidate observed smoke tests, but prevents a full UI-clean acceptance claim. Workflow/script guard tests for workspace races are narrower than behavioral concurrency verification.

Readiness evidence score: **67/100**, rubric in PROJECT_TRUTH_REPORT.md. **NO Seven AI RC1**: remaining acceptance gates include stable package/signing and installed upgrade data continuity, real process-kill persistence, live provider/search quality and TTFT, verified RPG journal recovery, typed/root product reconciliation and required-status enforcement. Main branch API reports protected=false and required checks off. No zero-bugs claim.

Exact next experiment: preserve package/certificate, seed chats/files/RPG state in build A, terminate the real process during queued persistence, relaunch and compare data; install a higher-version build B without clearing storage and verify the same records and SAF grants. Fix status-badge placement and rerun the visual gate. The reports below are chronological specialist history; obsolete statements about missing RPG live binding or pending current Web/Android gates are superseded by this snapshot.

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

## Continuation failure hunt additions
- REL-15: lifecycle regression expected a literal SevenPerformance.state.ready but implementation uses p.state.ready; assertion now checks both alias and readiness guard, passing.
- REL-16: RPG index-write plus rollback-write failure returned a normal rejection while advanced state remained loadable. Durable pending journal now quarantines the room and preserves prior session; focused tests prove no hydrate/context/resync, including a fresh bridge after restart. Verified recovery UX and truly atomic cross-store commit remain OPEN.
- REL-17: CI run 37260608130 failed at 320,506 workspace bytes after automatic PR/base integration. Pinned RPG minification and packaged-kernel regression checks now pass; workspace payload is 312,627 bytes (7,373-byte margin). Startup stays 99,668 bytes; no limits increased.
- Latest upstream includes real RPG chat context projection, attachment retention, token convergence, SAF hardening idempotence and improved workflow isolation. Focused affected checks passed; packaged RPG adds a 40th component suite. Final full CI remains required.
- Android activity recreation/WAL/motion/SAF regressions and workflow isolation tests were incorporated, but latest-SHA Android execution remains pending.

- REL-18: fixed stale zero-room build transform after room-change ownership updates. Executable deletion/event/generation-guard regressions pass; frontend build passes. There are now 41 component suites available plus two browser suites. Full final CI and Android run remain pending.

- REL-19: latest upstream night/system-auto-theme fixes caused a reproducible startup gate failure (100085 bytes). Parser-based beta startup packaging now gives 99397 bytes without changing the limit; 14 preference/system/legacy cases match source behavior. Source and packaged API names remain available. Latest contrast, zero-room, static and native generation checks pass; full final code CI is pending.
- Isolated release-branch Web/Android validation added upstream is preserved; main artifact acceptance still requires the exact main SHA/run. There are 42 component suites plus two browser suites.

- REL-20: actual packaged browser run 37261393766 failed night surface verification after component/packaged gates passed. Rooted lazy CSS overrode the lower-specificity inline theme bridge. Added rooted authoritative main/composer selectors; contrast/static checks pass (99531 startup bytes), full browser retest pending.

- Latest upstream canonical shell/remake night palette and removal of redundant auto-theme clock scheduler are incorporated. Current rooted theme bridge/static audit: 99176 startup bytes, 312627 workspaces, 4183832 total static bytes.
- REL-21: reopening RPG in an empty room after leaving a populated room previously retained prior in-memory workspace state when hydrate found no saved session. Mount now clears room-owned state before hydration; actual packaged browser regression checks empty work/canon/context and then original room restart restore. Browser result is pending, so no acceptance claim is made yet.

- Run 37261947268 passed actual night core surfaces, responsive/RTL matrix and live RPG Memory/context/restart/empty-room isolation; failed modern dialog canvas color. REL-22 adds a targeted canonical night dialog rule. This is not yet a full browser PASS.

- Main Web run 37262557069 failed intermittently when two UI owners alternated Arabic room-search labels (بحث المحادثات vs ابحث في المحادثات). REL-24 canonicalizes generated Remake copy to the existing tested label, including aria-label, and re-tests repeated late owner updates.
- Main Android run 37262557101 passed compilation and apksigner cryptographic verification (v2: true) but metadata parsing failed on actual `V2 Signer:` output. Added the captured output fixture and scheme label parsing; source stamps/public-key digests remain rejected. Final retest still required.
