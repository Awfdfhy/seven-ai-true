# Chat 6 — implementation handoff (2026-10-08)
Status: ISOLATED PATCH / NOT READY. No merge into frozen integration branch.

## Scope
Code changes only at:
- release/workspaces/coding.js
- release/github-self-dev.js
Plus regression test at:
- .seven-team/ui-convergence/chat6/chat6-ui-regression.test.cjs

## Implemented
- Coding: file buttons have aria-pressed and path names, files/fingerprints/code are LTR, independently scrollable read-only code preview, file inputs reset for repeated imports, Run disabled when app is busy.
- SelfDev: preserve task draft and selection on render; fix a discovered regression where /selfdev task prefill was set BEFORE render and thus lost; preserve expanded activity disclosure on render; add stage aria-live, 44px close and control sizes, visible focus styling, code LTR, raw logs collapsed by default.
- Protected paths, security checks, device flow, commits, receipts, runtime behavior unmodified.

## Verification performed
Connector-fetched source was inspected and 10 structural/static contract assertions passed in the current session.
Node test file exists but was NOT executed with Node. No Playwright, APK, Android 14/16 screenshots, runtime UI interaction, CSS computed-style or full static audit has been executed.
Compared unminified source lengths from initial audit:
- coding.js 11948 -> 12638 (+690 bytes)
- github-self-dev.js 30857 -> 31970 (+1113 bytes)
Combined unminified delta +1803 bytes. Release-layer compiled delta is UNKNOWN and must be measured. The patch cannot be merged if size gate worsens beyond permitted budgets.

## Known gaps / blockers
1. Current separate branch was behind integration head when last compared; never merge without rebase/cherry-pick conflict review and integrator lease.
2. SelfDev still uses bespoke modal/CSS injection: shared migration must be performed by I01, not Chat 6 during freeze.
3. Source helper tests are superficial and do not establish behavior. Add browser/device behavioral tests before acceptance.
4. SelfDev task explanation appears to promise autonomous PR/repair flow while actual selfDevelop() delegates to Verified Coding bridge. Correct microcopy only once bridge guarantees checked.
5. 200 structured research queue entries are unverified candidates, not visually validated references.
6. No independent Visual QA pass or before/after Android screenshot evidence.

## Suggested next owner action
I01: grant isolated handoff review only, run Node regression and full CI/static size gate on exact merged SHA, resolve bridge/data contracts, collect RTL/LTR day/night Android API34/36 screenshots, then request V01/V02/V03 independent verdict.
