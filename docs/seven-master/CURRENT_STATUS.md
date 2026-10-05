# Seven AI — Current Status

Last integration update: 2026-10-05
Working branch: `integration/verification-v1`
Pull request: #103 → `seven-remake-v3`

## Integration Reconciliation — ACTIVE

Integration is reconciling the verified typed Remake line with concurrent specialist work. Seven is **not yet fully accepted**.

Current integrated repairs/evidence include:
- production ModelRouter/ProviderHealth routed Chat path and canonical fallback implementation;
- Memory + read-only Tools + UTF-8 Attachment evidence in bounded Chat context;
- per-room Quick/Balanced/Deep and separate per-room two-pass Deep Think dispatch;
- Kilo HTTP/network/rate-limit/malformed-JSON semantics with no raw provider-body leakage;
- public error taxonomy and redacted task/model/tool diagnostics with duration + TTFT fields;
- request-scoped cancellation, active-restart coverage and independent cross-owner cancellation;
- room-scoped generation/draft/error/composer state, room-scoped Tool approvals/notices and no completion-driven room hijack;
- Self-Development fail-closed Coding verification before credential acquisition/mutation, including malformed-evidence hardening;
- permanent cross-system regression scenarios and broad CI performance budgets;
- Coding V1 from PR #104 is being reconciled into this Integration lineage with its Tool Fabric, exact-SHA workspace truth, verification runner, shared routing/research adapters and GitHub Actions verification ports.

## Exact evidence already established

Typed Integration baseline `c66d979de0244edf359720151405c5d1e994f690`:
- Seven Remake V3 CI run **37263230219** — SUCCESS.
- Seven AI tests run **37263230215** — SUCCESS.
- Seven Remake Android Release Gate run **37263230207** — SUCCESS.

State-isolation staging `78241fd8b29864c7d0063828823954a4c175fe6d`:
- Seven Remake V3 CI run **37263909624** — SUCCESS, **75/75 files and 441/441 tests**, production build PASS.
- Seven AI tests run **37263909635** — SUCCESS.
- A final Android result for the reconciled Coding + Integration merge is still required; staging or older Android runs are not substituted for the final SHA.

Coding V1 upstream:
- merged through PR #104 on `seven-remake-v3`;
- merge SHA `42ff64c01074cff0d9358ba58ec6a0a316b83316`;
- post-merge Remake CI run **37263362539** — SUCCESS;
- post-merge Android Release Gate run **37263362532** — SUCCESS.

## Remaining acceptance gaps
1. Reconcile Coding V1 with the Integration branch and rerun all final gates on the resulting exact SHA.
2. Wire/verify the Build workspace and Self-Development product path through the verified Coding runtime; specialist existence alone is insufficient.
3. ResearchService still lacks a concrete production Web source/synthesizer in SevenRuntime.
4. PDF parsing remains disabled in the typed product; UTF-8 text attachments are integrated.
5. RPG typed canonical persistence is strong but is not yet one atomic Chat + shared Memory + RPG turn orchestration.
6. Deep Think uses the current bootstrapped provider for planner/final; multi-provider planner/final routing and live-provider latency/quality evaluation remain open.
7. Live model catalog refresh remains outside lifecycle-managed runtime composition.
8. Final reconciliation SHA still requires same-line Remake CI + Seven AI regression + Android 14/16 evidence.

## Acceptance statement
**NOT ACCEPTED YET.** Current green evidence means zero known reproducible BLOCKER/CRITICAL defects in the specific tested paths, not zero bugs overall.

---

## Upstream specialist / release status history

## Lead Release Manager — integrated main, final Android acceptance in progress

PR #105 is **MERGED** at main SHA `29b26c6417b9fa332ae55f129bae983fb9efae02`, with the same source tree as the verified candidate. Full Web/all.cjs passed both PR run 37262152839 and isolated push run 37262150543 on head c5d63bf4ce51f1b21a3af6a186e3e8af5eac3500. All 42 local component suites passed; native generation and source-clean payload manifests pass. This is not a full release acceptance or RC.

Android validation run 37262150559 passed pre-APK Web gates, lint, unit tests and compilation, then failed in the new certificate-output parser. Main Android run 37262300975 requires fresh verification after the parser repair. Numbered, API-range/v3.1 and observed scheme-labelled V2/V3.1/V3.2 signer formats are now regression-tested, excluding source-stamp/public-key digests; a failed parse includes public certificate diagnostics. Cryptographic signature verification still requires apksigner success. Final exact-SHA APK/API34/API36 acceptance remains pending.

Current implementation evidence: root HTML/Capacitor product; room WAL/cancellation/IME/modes/context/token/attachments/network/research integration; live room-scoped RPG session/public-memory/context/reload and empty-room isolation passed packaged browser gates. Source and packaged RPG state/session/context/failure modules pass. Uncertain RPG persistence is quarantined by a durable journal; automatic verified journal recovery remains incomplete.

Open release gates: fresh final main Web/Android evidence; Android process-kill and upgrade persistence/signing continuity; live provider quality/TTFT; typed remake Memory/Tools/Coding product reconciliation; automatic RPG journal recovery and character-specific semantic model evaluation. No RC or zero-bugs claim. See PROJECT_TRUTH_REPORT.md and RELEASE_EVIDENCE.json.

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


## Coding Specialist — V1 acceptance-ready (2026-10-05)

The typed Remake Coding System specialist implementation is complete and acceptance-ready for integration review in PR #104. This is **not** a claim that the root/main Seven product or overall release is complete; current Release Manager reconciliation gates remain authoritative.

Implemented:
- exact-SHA workspace truth, per-file/snapshot SHA-256 binding, stale/concurrent-edit rejection;
- bounded transactional patch engine, rollback evidence, critical-path authority policy and blast-radius limits;
- automatic bounded repository discovery, symbol/import/build/test/instruction intelligence and relevance-ranked repo maps;
- full lifecycle: Understand → Inspect → Research → Plan → Edit → Test → Debug → Verify → Review → Document;
- shared ModelRouter + ProviderHealthTracker routing/failover;
- ResearchService bridge;
- bounded repair loop and independent read-only reviewer support;
- exact-base atomic Git commit adapter with non-force branch update and post-commit content/head verification;
- policy-owned verification runner and deterministic anti-test-weakening diff review;
- Tool Fabric repository boundary with `coding.repo.read` / `coding.repo.write`, mutating approval, audit, idempotent replay/effect ledger and propagated cancellation;
- GitHub Actions exact-candidate verification and Android release validation.

Code-bearing acceptance SHA:
`371db3e45aea21fd1f0d191ff88542d64c914490`

Evidence on that exact code SHA:
- Seven Remake V3 CI #407 / run 37260125276 — **SUCCESS**.
- Seven AI tests #3239 / run 37260125250 — **SUCCESS**, including `node all.cjs` and verified artifact upload.
- Seven Remake Android Release Gate #173 / run 37260125280 — **SUCCESS**, including strict compile/tests/build, Android lint/unit/APK build, embedded release identity, Android 14 installed smoke and Android 16 installed smoke.

PR:
- #104 — `Coding System V1 — full verified coding agent runtime`
- branch: `coding-system-v1`
- base: `seven-remake-v3`
- status: acceptance-ready for integration review. Merge/reconciliation with the currently released root product remains an Integration/Release Manager responsibility.


## Coding Specialist — merged + post-merge verified

PR #104 is **MERGED** into `seven-remake-v3`.

Merge SHA:
`42ff64c01074cff0d9358ba58ec6a0a316b83316`

Post-merge evidence on the exact merge SHA:
- Seven Remake V3 CI #428 / run 37263362539 — **SUCCESS** (audits, strict typecheck, Vitest, production build).
- Seven Remake Android Release Gate #194 / run 37263362532 — **SUCCESS** (strict Remake compile/tests/build, Android lint/unit/APK build, release identity, Android 14 installed smoke, Android 16 installed smoke).

Specialist regression evidence retained from the exact code-bearing candidate `371db3e45aea21fd1f0d191ff88542d64c914490`:
- Seven AI tests #3239 / run 37260125250 — **SUCCESS**, including `node all.cjs`.
- Seven Remake V3 CI #407 — **SUCCESS**.
- Seven Remake Android Release Gate #173 — **SUCCESS**.

Coding V1 is therefore complete at the specialist + typed-Remake branch level. The remaining work is product-level reconciliation with root/main, final UI/approval UX, live-provider/GitHub canary under explicit credentials/authorization, and Self-Development adoption through this verified path. Those remain Integration / Release Manager responsibilities rather than Coding V1 blockers.

