# Seven RPG — OpenCode Continuous Engineering Plan
Updated: 2026-10-12
Repository: Awfdfhy/seven-ai-true
Working branch: rpg/standalone-20261011

## Mission
Develop **only Seven RPG** as a standalone Android app. This document is the source of work instructions for OpenCode recurring runs. Do not declare production readiness based on simulated tests. Do not modify main, merge pull requests, delete user data, or remove unrelated GitHub repositories.

## Current verified baseline
- Commit 76b48b0957fd851a26aed6b40142fe7a4580069f: Seven AI tests and standalone APK workflow SUCCESS; Android API 34 and 36 startup smoke passed; debug APK artifact uploaded.
- Later work should be reverified against its own exact commit SHA, not against this baseline.
- Existing backup exporter can include canonPack but UI importer currently restores *world only*. It explicitly warns the user.
- Real-provider acceptance script exists at apk/rpg-live-llm-acceptance.cjs; independent workflow at .github/workflows/rpg-live-provider-acceptance.yml. Do not call it successful without an actual live inference result.

## Priority P0 — integrity, tests and acceptance
1. Verify current branch head and latest Actions; inspect failures and logs first.
2. Implement safe, **atomic world+Canon import** if supported by RPG storage/runtime: validate both schemas, use transaction/checkpoint with rollback on errors, and avoid partial write. Otherwise keep explicit separately-confirmed imports and never imply atomic recovery. Add tests for corrupted JSON, incompatible version, size cap, concurrent changes, mismatched world IDs, malicious keys, cancel and persistence after process restart.
3. Verify export -> import -> restart -> restore on Android 14 and 16; check original canon, relationships, character memory and world state. Test rollback after a forced persistence failure. Preserve player agency and HARD canon.
4. Test actual configured AI providers using the live acceptance workflow when the repository has credentials. Never expose tokens in logs, APK or code; report BLOCKED when no keys, rather than PASS.
5. Check APK package ai.seven.rpg, signer, version code, artifact provenance and exact head SHA. Only promote release when all required checks are green.

## Priority P1 — dedicated RPG experience
1. Remove remaining inherited Seven AI chat/settings chrome *inside standalone build only*; preserve required model routing and accessibility. Do not delete Seven AI source or break shared test gates.
2. Polish responsive mobile RPG controls, RTL, keyboard, focus, screen readers, reduced motion, dark theme, empty/error/loading/offline.
3. Provide clear in-app world, Canon, party, character, relationship and session indicators through existing runtime APIs. Build new features incrementally with tests.
4. Ensure provider picker applies a real persisted routing choice; do not merely focus a model element. Expose provider errors and retry safely.

## Priority P2 — long-form RPG quality
1. Continuity, timeline, canon authority, NPC knowledge isolation, summaries, player-control lock.
2. Memory compaction and recovery across long campaigns; deterministic tests for 1000+ events and multiple worlds.
3. Export/import versioning and migration with integrity checks. Add cancellation and backup-preview UX.
4. Performance improvements for long chats, storage limits, low-memory Android and background/foreground lifecycle.

## Rules for each OpenCode iteration
- Work solely on rpg/standalone-20261011; inspect git status and pull latest remote branch before edits; avoid overwriting other contributors.
- Select ONE bounded unfinished task each iteration; research interfaces before coding; use smallest compatible changes.
- Add tests reproducing bug, fix, run local checks (node all.cjs, targeted tests, android checks when available), commit and push only if verified.
- Confirm GitHub Actions on exact new SHA. If CI is still running, record IN PROGRESS; if red, fix before new features. No imaginary evidence.
- Update docs/seven-rpg/OPENCODE_PROGRESS.md with SHA, tests, blockers and next task.
- No feature claims without tests. Never disable, weaken, skip or delete acceptance gates to obtain green.
- Never alter main, delete releases or repositories, change secrets or credentials, or auto-merge. No destructive migrations or bulk deletes.
- If truly blocked, record clear reproducible evidence and choose next safe independent task. Never claim automatic infinite uptime.

## Completion criteria
No unresolved P0 bugs; exact SHA passes regression and Android API 34/36; actual end-to-end backup+Canon restore verified; live model gate passes with real configured provider; source and APK identity/signature verified; RPG-only UI validated by screenshots; user approves production release.
