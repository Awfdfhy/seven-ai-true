# Seven AI — Active Team Board

Updated: 2026-10-05
Authority: Chat 0 — Master / Release Manager

## Current release truth
- main: `8a856fd4764ec9d93492b46df76d1791ab0862b5`
- verified application/source SHA: `f5f6a51fbc6d14cff303399a1033ce04f2120f45`
- verified Debug APK exists and passed current Web + API34/API36 gates.
- RC1 is NOT yet accepted.
- No zero-bugs claim.

## Active developer lanes

| Chat | Lane | Branch | Current branch SHA | Primary ownership |
|---|---|---|---|---|
| 1 | Android + Persistence + UI | `chat1/android-rc1-hardening-20261005` | `8a856fd4764ec9d93492b46df76d1791ab0862b5` | process-kill persistence, upgrade continuity, signing continuity, SAF, Android lifecycle, UI/UX release blockers |
| 2 | RPG Release Maintainer | `chat2/rpg-production-hardening` | `f4abac186b6e7415dbf77fcb0ed57474165da67e` | **READY FOR INTEGRATION / FROZEN** — regression-only ownership for RPG during RC1 convergence |
| 3 | Coding System | `chat3-coding-production` | `b7afa47a654d7109208db26b96e3f268a35feaa4` | inspect→plan→edit→test→debug→verify→Git E2E |
| 4 | Self-Development + Tools | `chat4-selfdev-tools-hardening` | `c985aa250b5b18d9999e4af2a79def00ff981a07` | executable tool contract/adapters + bounded self-improvement loop through Coding |

## Master responsibilities
Chat 0 does not duplicate specialist implementation. It:
1. watches branch movement and evidence;
2. detects overlapping file ownership and contract changes;
3. audits specialist claims against code/tests/CI;
4. owns shared contract/release decisions;
5. blocks unverified merges;
6. reconciles cross-system changes;
7. runs/coordinates final Integration + QA;
8. pins release candidates to one exact SHA;
9. issues GO / CONDITIONAL GO / NO-GO for RC1.

## Integration rules
- No specialist lane pushes directly to `main` as part of normal development.
- Cross-system API/schema changes must be reported before integration.
- Do not weaken tests, budgets, or acceptance thresholds to make a branch green.
- Every handoff must include branch, SHA, changed files, tests, CI, remaining risks, and dependencies.
- A branch is not accepted because code exists; exact evidence is required.
- Shared release validation must run on one fixed integration SHA.
- If two lanes touch the same contract or generated release path, Master decides integration order.

## RC1 acceptance queue
1. Android real process-kill persistence + Build A→B upgrade/data continuity.
2. UI status-badge overlap repair + visual regression.
3. RPG verified journal recovery and live transaction recovery. ✅ READY FOR INTEGRATION — SHA `f4abac186b6e7415dbf77fcb0ed57474165da67e`, CI `37306748021`, workspace `319517/320000` bytes.
4. Coding real gated E2E transaction.
5. Self-Development real bounded baseline→candidate→accept/reject experiment using Coding.
6. Tool execution contract/adapters reconciliation.
7. Product/root vs specialist capability reconciliation.
8. Final all.cjs + packaged release verifier.
9. Android lint/unit/APK verification.
10. API36 + API34 device gates.
11. APK provenance/signature/package/version verification.
12. Master release decision.

## Merge priority
Release-safety fixes and contract blockers outrank feature expansion.
No unrelated feature work enters the RC convergence branch without Master approval.

## Status vocabulary
- ACTIVE
- BLOCKED
- READY FOR MASTER REVIEW
- READY FOR INTEGRATION
- ACCEPTED INTO INTEGRATION
- REJECTED / NEEDS REPAIR
- RC GATE PASS


## Frozen specialist handoffs

### Chat 2 — RPG Release Maintainer
- Branch: `chat2/rpg-production-hardening`
- Frozen SHA: `f4abac186b6e7415dbf77fcb0ed57474165da67e`
- Exact successful CI: `37306748021`
- Report: `docs/seven-master/RPG_PRODUCTION_REPORT.md`
- Workspace budget: `319517 / 320000` bytes
- State: **READY FOR INTEGRATION**
- New feature work: **STOPPED**
- Allowed future changes before RC1: regression repairs requested by Master only.
- Final RC review response must be either `RC RPG PASS` or `RC RPG BLOCKED: <exact issue>`.
