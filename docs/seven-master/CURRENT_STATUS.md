# Seven AI — Current Status

Last coordination update: 2026-10-05

## Current Position
The dedicated Coding System campaign is active.

### Completed / already under iterative development
- Chat Core
- Model Routing
- Memory work
- Files
- Web Research
- Deep Think
- Tools

### Current Primary Step
**Coding System — IN PROGRESS**

Target product base: `seven-remake-v3`
Exact Batch 1 base SHA: `6a8a16b31a6ccca1f5b412e71a15e55adb4cf162`
Specialist branch: `coding-system-v1`

## Coding System Batch 1 — Kernel
Implemented locally and prepared for repository verification:
- exact repository/branch/head workspace identity
- deterministic file SHA-256 fingerprints and snapshot fingerprint
- stale-head / stale-snapshot / stale-file rejection
- safe canonical repository path validation
- critical-path authority gate for workflows, evaluator paths, and `INTEGRATION_CONTRACTS.md`
- bounded multi-file transactional patch model with rollback snapshot
- exact-anchor patching with missing/ambiguous-anchor rejection
- actual resulting-byte and changed-file blast-radius limits
- deterministic verification selection outside model authority
- universal `git diff --check` gate plus Coding unit, TypeScript, full test, and build gates for Remake changes
- explicit Coding lifecycle state machine with evidence history

Documented lifecycle:
Understand → Inspect → Research → Plan → Edit → Test → Debug → Verify → Review → Document

## Research / Architecture Evidence
Created:
- `docs/coding-system/RESEARCH_2026-10-05.md`
- `docs/coding-system/ARCHITECTURE.md`
- `docs/coding-system/IMPLEMENTATION_PLAN.md`

The architecture treats the model as a planner/repair agent, not as the authority for workspace identity, permissions, mandatory tests, or PASS.

## Verification Evidence — Batch 1
Local pre-push evidence:
- strict TypeScript compile of production Coding kernel: PASS
- Node execution smoke covering snapshot, patch, stale-head rejection, deterministic verification, and lifecycle: PASS
- strict TypeScript compile including `coding-kernel.test.ts`: PASS
- one real TypeScript defect in the lifecycle transition table was caught by compilation and fixed before repository mutation

Remote product CI / full Vitest / product build status must be recorded after the branch/PR run. Until those gates are green, Batch 1 is **implemented but not promoted complete**.

## Integration Contract Status
`docs/seven-master/INTEGRATION_CONTRACTS.md` is unchanged in Batch 1. The Coding kernel implements beneath the existing contract; no shared public contract was silently expanded or broken.

## Known Limits / Not Yet Claimed
- no real Files/worktree adapter yet
- no sandboxed shell/command execution adapter yet
- no language-aware symbol/reference repo map yet
- no live Research bridge inside Coding runs yet
- no test execution ledger/result parser yet
- no bounded automatic debug/repair controller yet
- no independent reviewer adapter yet
- no Git commit/PR promotion adapter inside Seven yet
- no Android device evidence for Coding execution yet

## Next Exact Action
Batch 2: connect Workspace Truth to a real repository Files/worktree adapter, add incremental repo intelligence (inventory, symbols, imports/references, test ownership, relevance-ranked repo map), then verify stale/concurrent edit detection against real Git state before exposing edit authority to the model.

### After Coding
1. Self-Development
2. RPG System
3. Cross-system Integration / Verification
4. Android/APK/UI hardening
