# Seven AI — Current Status

## Lead Release Manager — 2026-10-05 verified snapshot

This section supersedes older batch acceptance statements below. Audited upstream main through `8f9956858f61a82a4888e91cc3a2c4ce5fceadd7`; the commit containing this update identifies the integrated release repairs. Later commits require fresh evidence.

**Release decision: NOT ACCEPTED / no RC / no fresh APK produced locally.** Evidence score 43/100, with rubric and limitations in [PROJECT_TRUTH_REPORT.md](PROJECT_TRUTH_REPORT.md); machine-readable checks and benchmark results in [RELEASE_EVIDENCE.json](RELEASE_EVIDENCE.json).

- 33 local component suites verified; 119 tracked JS syntax checks passed. New RPG context suite failed first, then passed after bounded knowledge-reference repair; long-story benchmark passes 1006 committed events.
- Web build and Android native-project generation passed. Browser/full all.cjs verification was blocked by Chromium download; Gradle compilation blocked by network access. Neither is counted as PASS.
- Repaired exact-SHA self-dev CI selection/dispatch, atomic multi-file commits, SHA-bound merges, protected acceptance gates and network-read error handling.
- Added APK web-payload SHA/run provenance and hashes, unified the startup budget, repaired UI loader failure/retry and committed synchronized launcher source labels.
- Incorporated upstream checkpoint/cancellation/Control boot/storage recovery work with explicit provenance.
- Root main builds HTML/Capacitor. The typed remake Memory/Tools branches are a different application and remain unmerged/unaccepted as root APK capabilities.
- RPG State/Session/Context kernels now exist and have component tests; importing them from hub is not live atomic RPG turn integration. Persisted-kernel tests do not establish actual app restart/upgrade behavior.
- Live provider quality/TTFT, device lifecycle/UI/RTL/dark mode, install/upgrade/signature continuity, complete cancellation isolation and error taxonomy remain gates.

Next exact action: pin an integrated candidate SHA, run root full tests + Android/API34/API36 CI on that SHA, verify embedded source/hash/package/signature and install/upgrade persistence; reconcile the product split and live RPG/Coding/Self-Development wiring before RC1.

## Earlier specialist batch history

Last integration update: 2026-10-05

## Current Position
Cross-system Integration / Verification is active. Specialist chats may continue subsystem work, but main is judged by shared contracts and regression/build evidence.

### Implemented / under active hardening
- Chat Core
- Model Routing
- Memory
- Files
- Web Research
- Deep Think
- Tools
- Coding System / GitHub Self-Dev execution surfaces
- Self-Development foundations
- RPG world/canon/state foundations
- Android/Capacitor release pipeline

## Integration Batch 01
Implemented:
- Added release/integration-contracts.test.cjs and registered it in all.cjs.
- Hardened execution checkpoint restore with schema v2 identity + checksum validation and bounded retention.
- Replaced hard-coded Canon chronology PASS with ledger position-regression detection.
- Unified the release stop shim so Android and web attempt actual controller abort instead of Android nulling the controller.
- Added contract/state isolation coverage across Control → Runtime → Execution, Research citation locks, World player-agency, Canon chronology and context scope isolation.

Observed during this batch:
- Multi-chat writes moved main while integration work was in progress; integration must always re-read current HEAD before shared edits.
- A CI failure was caused by exceeding the 100,000-byte hot release-layer budget after checkpoint hardening. The implementation was compacted rather than weakening the budget.
- RPG state kernel work is landing concurrently and remains integration/acceptance work, not automatically complete.

## Known Open Integration Risks
- Legacy generation/cancellation state still has broader global/per-room scoping debt; the immediate Android/web abort bug is fixed, but full cross-room cancellation isolation is not yet proven.
- RPG persistence, prompt projection and public-memory seam require end-to-end verification against the newly landing state kernel.
- Unified error taxonomy is now a contract; implementation coverage across all legacy surfaces remains to be audited.
- Trace/observability coverage is incomplete and requires a request lifecycle audit.
- Android acceptance must come from the latest Seven Android APK run, not from web tests alone.
- The existing master bughunt remains the defect backlog; repaired items require regression evidence before closure.

## Acceptance State
NOT YET ACCEPTED AS FULLY INTEGRATED. No claim of zero bugs is made.

See docs/seven-master/INTEGRATION_AUDIT.md for inventory, dependency map, contract status and scorecard.


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
