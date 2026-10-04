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

## Self-Development Specialist Batch 01 — Observation & Diagnosis Foundation

Tracking:
- roadmap issue #100
- candidate PR #102
- stale candidate PR #101 was intentionally closed without merge after base drift

Implemented in the current candidate:
- .seven-team/self-development-v1/RESEARCH_SYNTHESIS.md
- .seven-team/self-development-v1/ARCHITECTURE.md
- .seven-team/self-development-v1/EXECUTION_PLAN.md
- evolution/self-development-observer.cjs
- evolution/self-development-diagnosis.cjs
- evolution/self-development-foundation.test.cjs
- ADR-015..017 and expanded Self-Development integration contract

Phase 1 behavior:
- privacy/content-minimized structured observations
- allowlisted metrics/metadata and secret-like telemetry rejection
- bounded observation buffer
- deterministic weakness aggregation
- diagnosis remains HYPOTHESIS until controlled evidence exists
- critical-signal escalation
- conservative LOW/MEDIUM/HIGH/CRITICAL change risk
- evaluator/Self-Development protected paths route to GOVERNANCE_REQUIRED
- no production file-write, shell, GitHub mutation, merge or promotion authority

Current dependency truth:
- existing Coding/GitHub execution surfaces are present and under verification;
- the dedicated Coding v1 IMPLEMENTATION_EVIDENCE.md is not present at this captured baseline;
- governed production Self-Development mutation remains blocked until the Coding contract is proven.

Verification state:
- Phase 1 is a protected Evolution/Self-Development-plane candidate;
- full Seven CI/regression must pass on a merge-capable exact candidate;
- independent review remains required before merge.

Next Self-Development target after Phase 1 evidence: Phase 2 Metric Registry + paired baseline/candidate evaluator.

