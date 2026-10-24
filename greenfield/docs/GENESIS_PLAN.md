# Seven RPG Genesis Plan

## Gate G0 — Repository and scope
**Goal:** establish provenance and protect the existing project.
- Record repository URL, branch, HEAD SHA, working-tree state, default branch, CI workflows, and permissions.
- Inventory app entry points, modules, storage schemas/keys, provider integrations, import/export, Android configuration, tests, and release artifacts.
- Produce a verified fact/assumption/unknown register.
- Confirm all work is isolated from legacy source changes.
**Exit:** inventory and source register reviewed; no destructive operation performed.

## Gate G1 — Product contract
- Define RPG identity, player agency, AI boundaries, world/campaign isolation, Canon semantics, privacy, offline expectations, Android targets, localization, and minimum viable gameplay.
- Give each feature a stable ID, priority, dependencies, acceptance tests, owner, status, and evidence.
- Resolve contradictions before architecture hardens.
**Exit:** MVP-0 and feature catalog are testable and internally consistent.

## Gate G2 — Stack decision
- Compare no more than three viable stacks with weighted scores.
- Include mobile UX, Arabic RTL/LTR, persistent data and migrations, AI streaming/cancel, offline behavior, Android APIs, performance on low/mid-range devices, accessibility, testing, release reproducibility, license, ecosystem health, and autonomous-agent ergonomics.
- Build a narrow proof-of-concept for the highest-risk technical assumptions.
- Record decision, rejected options, trade-offs, and migration cost in ADR-0001.
**Exit:** evidence-backed stack choice and reproducible commands exist.

## Gate G3 — Domain and data contracts
Define before implementing save logic:
- versioned world and player schema;
- command/validation/result contracts;
- domain events and deterministic reducer;
- event IDs, idempotency, concurrency and stale-action rules;
- atomic save boundaries, backup, restore, migration, corruption recovery;
- import/export schema, size limits, validation, confirmation, and rollback;
- separation of Canon, event history, character knowledge, belief, rumor, summary, and proposal.
**Exit:** contract tests cover valid, invalid, duplicate, stale, and malformed cases.

## Gate G4 — MVP-0 vertical slice
Build only one complete playable loop:
1. launch and recover existing save;
2. create world and player character;
3. enter a scene;
4. submit player action;
5. validate action against current state and player agency;
6. get structured narrative from deterministic mock provider;
7. validate proposed events;
8. apply legal events only;
9. save atomically;
10. force-stop/reopen and restore identical world state.
**Exit:** end-to-end tests pass, including failure injection and state integrity.

## Gate G5 — AI runtime
- Stable provider interface, timeout, retry policy, cancellation, streaming, structured output validation, usage/error telemetry without secrets, capability declaration, model selection, and offline fallback.
- Keep credentials outside source and mobile bundles; prefer secure server-side mediation when appropriate.
- Never allow model prose to mutate state directly.
**Exit:** mock and one real provider pass the same contract suite; failure is recoverable.

## Gate G6 — RPG systems
Implement in dependency order based on feature catalog: character identity/sheets, attributes and checks, inventory/equipment, quests, relationships, factions, map/world travel, combat/turns/skills, progression, and additional narrative systems. Avoid implementing all systems simultaneously.
**Exit:** each system has deterministic rules, save/load tests, UI states, and regression evidence.

## Gate G7 — UI convergence
- Establish design tokens and shared components before expanding screens.
- Audit every screen for hierarchy, touch targets, navigation, overflow, empty/loading/error/offline/cancelled/stale states, keyboard/focus, screen readers, reduced motion, small screens, Arabic RTL and English LTR.
- Use real content lengths, not only idealized mock text.
**Exit:** golden screenshots and interaction tests pass on supported sizes and directions.

## Gate G8 — Android readiness
- Verify exact supported API levels, storage/document-provider behavior, lifecycle restoration, back navigation, permissions, keyboard, network transitions, audio behavior if applicable, and performance.
- Run install/upgrade/reinstall, save/export/import, force-stop/reopen, and recovery tests.
- Build reproducibly and record artifact checksum, signing configuration (never secret material), commit SHA, test report, and screenshots.
**Exit:** all release gates pass; any untested platform is explicitly listed as unverified.

## Gate G9 — Release candidate
- Run complete automated suite, security scan, dependency/license review, accessibility/RTL review, and Android smoke/regression.
- Verify no credentials, debug endpoints, private user data, or test fixtures leak into release.
- Publish only with owner approval.
**Exit:** evidence-backed release checklist approved.

## Task discipline
Every task must specify: ID, objective, dependencies, file scope, implementation notes, acceptance criteria, exact test commands, risk, rollback, status, and evidence. Update status documents in the same change. Keep tasks small and reversible. No feature is complete because its documentation exists.
