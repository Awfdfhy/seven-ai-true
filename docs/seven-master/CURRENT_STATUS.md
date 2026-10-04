# Seven AI — Current Status

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
- per-room/per-world RPG persistence is not yet wired;
- legacy World/Canon + new state commit is not yet one atomic turn transaction;
- state-level knowledge tests do not yet prove generation-level no-leak behavior;
- directional relationships, production token-aware retrieval, semantic 100/500/1000-turn evaluation and Android restore UX remain open.

Next RPG implementation target: versioned per-room persistence + atomic session ownership and corruption/restart tests.

## Coding Specialist Batch 01 — Workspace Truth / Patch Kernel

Target branch: `coding-system-v1`
Exact product base: `seven-remake-v3@6a8a16b31a6ccca1f5b412e71a15e55adb4cf162`

Implemented:
- deep current-agent research + Seven gap analysis in `docs/coding-system/RESEARCH_2026-10-05.md`;
- layered Coding architecture and 12-phase implementation plan;
- explicit Coding lifecycle: Understand → Inspect → Research → Plan → Edit → Test → Debug → Verify → Review → Document;
- exact repository/branch/head workspace identity and SHA-256 source/snapshot fingerprints;
- stale-head, stale-snapshot and stale-file rejection;
- safe canonical paths and non-model authority for critical contract/evaluator/workflow paths;
- bounded transactional multi-file candidate construction with rollback snapshot;
- exact-anchor patch rejection for missing/ambiguous edits;
- changed-file and actual resulting-byte blast-radius budgets;
- deterministic verification selection owned by policy, including universal `git diff --check`, focused Coding tests, Remake typecheck, full tests and build gates.

Local evidence before repository CI:
- strict TypeScript production compile: PASS;
- executable Node smoke for snapshot/patch/stale-state/verification/lifecycle: PASS;
- strict TypeScript compile including `coding-kernel.test.ts`: PASS;
- one real transition-table TypeScript defect was caught and repaired before push.

Concurrency note:
- `main` changed during this Coding batch. The specialist branch detected the stale `seven-master` copy and was reconciled against the new authoritative Integration/RPG updates instead of overwriting them.

Acceptance state:
- Batch 1 is IMPLEMENTED, NOT YET PROMOTED COMPLETE until PR CI confirms the actual Remake unit/regression/typecheck/build gates.

Next Coding target:
- real Files/worktree adapter + repository intelligence (inventory, symbols, imports/references, test ownership, instruction discovery and relevance-ranked repo map), with stale/concurrent-edit tests against real Git state.
