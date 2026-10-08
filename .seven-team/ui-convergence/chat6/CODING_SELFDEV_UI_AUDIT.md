# Chat 6 — Coding + Self-Development UI Audit
Date: 2026-10-08. Source: ui/20-agent-convergence-20261006. Read-only audit; no production files changed.

## Governance
Integration freeze explicitly bans direct shared/core writes and new CSS override, token namespace, picker, modal or shell implementations. Chat 6 receives no implicit lease. Wave document describes its original base as 0c112b..., whereas COMPONENT_OWNERSHIP identifies f86d409...; compare exact integration head before any implementation.

## Coding: release/workspaces/coding.js
- DOM: mount() builds own header, action bar, banner, project map, file preview, execution/verification panel, agent output and task input.
- Classes: seven-ws-shell/head/headline/kicker/actions/btn/banner/dot/grid/card/card-head/card-body/list/row/row-path/fingerprint/code/statusline/step/step-top/pill/output/task/task-actions/empty/icon-btn.
- Shared dependencies: SevenRuntime.codingMap, getExecutionRuns, createKnowledgeArtifact/rebuildKnowledge/saveRooms, sendMessage, stopGeneration, regenerateLastReply, SevenAurora, SevenWorkspaces, chat DOM. Do not change contracts.
- KEEP: importFiles, bindProject, per-file textContent, read-only preview, attachProjectContext rollback, real run/verification data, stop/retry handlers and observer cleanup.
- MIGRATE: visual card geometry, priority, actions, progress and empty states into shared Card, ListRow, Chip, EmptyState, InspectorPanel, and Field primitives (subject to available actual implementations).
- REWRITE UI ONLY: file label/fingerprint information architecture, task-first layout, compact execution step list with expandable evidence, verification status label+symbol, filename metadata disclosure.
- DELETE only after verified: redundant headings, fingerprint as always-visible primary label, duplicated layout rules and raw inline style for border and font-size.
- Issues: files are buttons with no explicit type and no aria-selected/current state; path strings and fingerprint lack dir=ltr and isolate; pre text direction not explicit; run status is unnormalized and color/label not guaranteed; renderRuns shows last 10 steps without indication that earlier steps were omitted; file input cannot necessarily reimport same files until reset; busy flag only observes data-seven-busy, ensure actual stop state tested; task lives below three dense panels and is visually secondary. No proven screenshot evidence yet.
- Mobile risks: long paths/fingerprints, 3-column seven-ws-grid without verified 320px reflow, fixed-width code, actions wrapping, large task text.
- Contract blocker candidate: map.files[] shape and run.verification may not provide deep detail for desired evidence; document missing fields rather than inventing them.

## Self-Development: release/github-self-dev.js
- DOM: injected navigation button; injected overlay dialog, bespoke head/close, connection card, OAuth device card, task area with auto-merge/build options, raw log card.
- Classes: seven-gh-backdrop/panel/head/close/body/card/row/muted/btn/code/task/log/nav/switch; injected style from ensureStyle() with hard-coded shadow, rgba, #6d5cff, #8e78ff, #0f1020; fallback var(--sb-*) tokens.
- KEEP unchanged: native GitHub device-flow methods, protectedPath and protected file list, safeRepoPath, bridge requirements, Verified Coding Receipt validation and error handling, state transitions, local settings semantics and exact-SHA checks.
- MIGRATE: existing dialog into canonical overlay by integrator lease ONLY, cards/badges/activity into canonical primitives.
- REWRITE UI ONLY: user-facing sequence Task > Plan > Changes > Safety > Verify > Commit > Result; expose only actual stages/receipt fields; compact human summary and expanded logs; clear connectivity states.
- DELETE after bridge verification: injected independent style and modal family, stale descriptive text describing direct autonomous PR/CI loop as if guaranteed. Source selfDevelop() actually delegates to SevenSelfDevelopment.runCodingEvolution and validates COMMITTED and a READY_FOR_INTEGRATION receipt. The UI's explanatory promise must match the bridge's supported flow.
- P1 candidate: render() replaces body.innerHTML on every log/state update, likely loses unsubmitted textarea content, focus/cursor position and intermediate keyboard state. Verify with reproduction before categorizing confirmed P1.
- P1 candidate: autoMerge/buildApk toggles are surfaced but whether bridge honors those exact options is unverified. Never claim effect without bridge contract check.
- A11y risks: modal initial focus/focus return/trap not evident; nav observer persists without cleanup; close is 38x38px vs 44px fallback; controls 42px vs 44px; no aria-live for changing stage; device code lacks explicit dir=ltr; technical identifiers and mixed RTL require direction isolation.
- Mobile risks: log/long error and repo identifiers, keyboard + bottom aligned dialog, code wrapping, dense controls.
- Security: do not broaden protected path regex or rework OAuth, authorization, credential storage, permission or commit logic.

## Constraints and evidence
Not claimed: Android screenshots, visual pass, computed CSS audit, zero overflow, release-size improvements, zero P0/P1, independent reviewer approval, 200 references studied.
Release layer budget noted as 102209 bytes in task brief, not independently measured here. Freeze remains in effect.
