# Seven Self-Development UI — Target Rules
1. Human-first task-centric flow: Task > Plan > Changes > Safety > Verify > Commit > Result; unavailable phases marked not available, never fabricated.
2. Compact workflow status above detailed logs; errors explain what failed, where, whether anything changed, and allowed next action, based on real state.
3. Device authorization states: disconnected, connecting, code-ready/waiting, connected, expired, error; code and URL are LTR, never show token.
4. Keep repository/branch/commit SHA secondary, directionally isolated and copyable where possible.
5. Changes list by files and operation types supported by data; open one file at a time; never default to a huge diff on mobile.
6. Protected path badge is derived from existing protection decision; never weaken rules or mislabel a blocked attempt as allowed.
7. Verification reflects only actual receipt/check data. Verified Coding Receipt baseSha/resultSha consistency is authoritative; UI cannot pronounce pass independently.
8. Preserve textarea input, focus/selection and options across progress re-render. Never overwrite user draft on log update.
9. Raw logs live in an accessible disclosure region; activity summary is the default view.
10. Canonical Dialog must be integrated only by owner with lease; preserve Back/Escape/focus return/scrim behavior.
11. 44px min fallback/48dp Android touch targets, WCAG AA, keyboard support, live status announcement, no color-only meaning.
12. No features, no extra API calls and no change to GitHub auth, persistence, permissions, protected paths, commit semantics or automation.
