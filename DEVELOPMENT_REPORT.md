# Seven AI T161 — final candidate hardening report

## النتيجة

تم تعديل كود T150 فعليًا مع إبقاء الأصل داخل الحزمة. هذه نسخة مرشّحة قوية وليست شهادة PASS شاملة: فحص الصياغة، اختبارات الذاكرة، اختبارات Runtime، وسلامة الأرشيف نجحت. اختبار المتصفح/Android ومزودات الإنترنت الحقيقية يحتاج بيئة خارجية.

## Implemented changes

- T154: canonical backup/import v2 now includes rooms, memory bundle and execution runs while excluding credentials; payloads are validated before mutation, imported nonterminal runs are cancelled as historical records, and import waits for durable room persistence.

- T153: active generation requests now receive an AbortController signal; Stop aborts the current fetch/stream where the platform supports cancellation, while late results remain rejected by the existing stop checks.

- T151: native IndexedDB room adapter, one transaction for conversation snapshot/revision/audit, lazy one-time migration, untouched legacy localStorage keys, queued saves, visible pending/failure status, unload warning, stale-tab revision rejection. Startup fails closed instead of silently opening stale legacy rooms after a database error.
- T151: send waits for its user-message save before requesting a response; pending saves suppress duplicate sends. Import success waits for persistence acknowledgement.
- T152: canonical memory current state and its event ledger share one atomic localStorage envelope. All existing memory write paths use that envelope. Old keys remain unchanged. This removes the two-key crash window without changing synchronous memory APIs.
- T152: memory action-authority gate fails closed until a real original permission grant exists. Memory provenance, rank, ledger consistency and caller policy flags cannot alone grant permission. This function had no live tool-call callers in T150, so ordinary tool execution behavior is unchanged.
- T161: provider requests now have a real timeout/cancellation boundary; late network failures cannot leave a dead request hanging indefinitely.
- T161: the controller records deterministic Local Intelligence hints and Context compilation exposes an active workspace projection without promoting it to canonical state.
- T161: execution runs use a versioned v2 bundle with append-only operational events; the v1 key is read-only compatibility input and is never dual-written.
- T161: canonical backup/import includes the run ledger and restores in-memory/local snapshots after an import failure.
- T161: explicit permission grant issue/revoke helpers verify source events and revocations; a revoked grant cannot authorize a sensitive action.
- T161: a global fault containment guard surfaces unexpected UI errors without exposing credentials, prompts, or internal traces.

## Important implementation limits

This remains a single-file release candidate, not a finished APK. Canonical memory and the execution ledger still use bounded localStorage envelopes for compatibility; room snapshots use IndexedDB transactions. A room snapshot is not per-message immutable storage, and memory deletion is not a cryptographic privacy purge. The new Runtime APIs are integrated into planning/context and safe persistence boundaries, but external MCP/A2A adapters, Android SAF/Keystore, and full UI wiring require a separate platform build.

The v1 run key remains a read-only migration source; new writes use the v2 bundle. API credentials retain T150 behavior. No new provider, paid fallback, chain-of-thought storage, framework dependency, or APK packaging was introduced. Existing external PDF/font dependencies remain.

Storage failures retain unsaved in-memory room state and display a warning; saving cannot be promised after a tab is forcibly closed. Existing synchronous UI handlers may update the view before asynchronous save commits; the persistence badge is the durable-status indicator. After startup storage failure, editing remains blocked. Cross-origin/file-origin migration cannot happen automatically: export/import from the old origin is necessary.

## Code audit against roadmap

| Area | Evidence in T150 | Remaining priority |
| --- | --- | --- |
| Rooms | loadRooms/saveRooms use three separate localStorage keys | T151 adapter implemented, browser integration pending |
| Memory | canonical CRUD, structural authority, event history, consistency and derived retrieval helpers | Async transactional storage, real grants, purge, broader provenance enforcement |
| Runs | versioned v2 bundle, bounded event ledger, legacy read-only migration, transitions/checkpoints | Async transaction backend and stronger effect recovery |
| Context | contracts, sources, budgeting, compilation and Runtime workspace projection | Full UI actions and exact browser fixtures |
| Tools | native capability/ticket validation and execution helpers | Permission-source integration, external adapters, effect uncertainty |
| Models | configured free-provider router, discovery, usage/health cache, streaming parser | Account/component proof enforcement and empirical routing evaluation |
| Files | extracted knowledge text and metadata; code explicitly does not retain original bytes | Durable originals and reconstruction |
| Research | search and context integration | Full fetched claim-evidence/citation verification pipeline |
| Coding | safe repo-map API and patch/evidence helpers in Runtime layer | Full shell bridge and Android file permissions |

## Verification evidence

- Baseline SHA-256 matches the supplied manifest exactly.
- `node --check` on the final classic application script: PASS.
- `node tests/memory.cjs`: 9 PASS using actual memory source in Node VM with an injected synchronous storage adapter. Covers create/update/delete consistency, immutable history snapshots, write failure, corruption, action authorization rejection, unchanged old keys, legacy record compatibility and duplicate events.
- `tests/runtime-smoke.cjs`: 12 assertions PASS, including explicit grant/revocation, workspace, local embeddings, tool gate, run ledger, research, coding and model-outcome paths.
- `tests/all.cjs`: local release gate PASS; browser regression is explicitly reported INCONCLUSIVE when Chromium is unavailable.
- `tests/verify.cjs`: browser suite supplied but not executed successfully. Chromium installation timed out in this environment. No browser PASS is claimed.
- No live provider tests, phone benchmark, visual regression or full T150 regression suite was supplied/executed.
- Diff included as `T150-T152.patch`; changes limited to room persistence/init/send/import and memory persistence/action-authorization boundary.

## تشغيل الاختبار والمتابعة

احتفظ بـ T150 وصدّر محادثاته قبل تجربة المرشح. افتح المرشح من نفس أصل HTTP/المنفذ لاستعمال التخزين السابق؛ تغيير الأصل يتطلب الاستيراد. لا تعود إلى T150 وتتوقع أن يقرأ بيانات IndexedDB الجديدة: صدّر المحادثات من المرشح أولًا، ثم استوردها في T150.

Developer verification:

1. Install a supported Node runtime and Playwright in the test environment; install Chromium from Playwright's official installer.
2. Set CODEX_PRIMARY_RUNTIME_NODE_MODULES to the absolute node_modules directory containing Playwright.
3. Run `node tests/memory.cjs` and `node tests/verify.cjs` from this bundle.
4. Add/execute crash injection, malformed import, storage-full, startup-corruption, multi-tab and full mobile UI checks before production adoption.

Next external gate is browser/Android integration. The source is safe to continue developing, but it should not be marketed as a crash-free production APK until those platform gates pass.
## T161 continuation — safe runtime hardening

The release keeps the existing T150–T154 UI and adds an isolated `window.SevenRuntime` compatibility layer. It provides canonical memory commits with an append-only ledger, explicit source-bound permission grants, active context actions, deterministic local embeddings/classification, normalized tool registry/risk gates, run ledger persistence, research evidence envelopes, safe repository mapping, and bounded model outcome records. No paid fallback or credentials are introduced.

Evidence: `tests/memory.cjs` 9 PASS; `tests/runtime-smoke.cjs` 12 PASS; JavaScript extraction `node --check` PASS. Browser regression is INCONCLUSIVE because the managed Chromium executable is unavailable in this environment.

Final gate: local deterministic checks and archive integrity PASS. Browser/Android integration remains an external-environment gate and is intentionally not represented as PASS.

## T163 continuation — runtime integrity hardening

- Runtime memory now rejects malformed or duplicate canonical records, records before/after snapshots for commits, and binds permission grants to the exact canonical record, scope, action class, and original grant event.
- High-risk tool calls validate required arguments, types, enums, and unknown fields before the permission gate. Duplicate tool capabilities resolve aliases to one canonical registry entry.
- Context compression retains the original source for expansion; reconstruction accepts an explicit replacement source and deduplication preserves pin state and lineage.
- Execution runs and model outcomes fail closed on malformed persistence; run events append instead of replacing history. The model outcome reader is exposed for deterministic inspection.
- `runtime-smoke.cjs` now covers 28 assertions across memory, authorization, tool schemas, context actions, run ledger, outcomes, research, coding, and local intelligence.

The candidate SHA-256 in `PROJECT_MANIFEST.json` is bound to the current `seven_ai-final.html`. Deterministic local checks pass, and GitHub Actions run `34697079913` passed the complete `node all.cjs` gate: 9 memory, 28 runtime, and 11 browser assertions. Android/APK and live-provider integration remain unverified.

## T164 continuation — Seven Motion OS 3.0

- Replaced the small reveal/press helper with a governed motion runtime. Every request must declare one of eight shared families, one of four semantic purposes, and P0-P4 priority. Unknown, unexplained, idle, layout-heavy, and paint-heavy motion is rejected before execution.
- Added independent `Ultra`, `Balanced`, `Lite`, `Reduced`, and internal `Off` effective profiles. Balanced is the automatic default; `prefers-reduced-motion`, hidden state, low battery where exposed, Seven Performance tier, and sustained frame pressure can only lower motion expression.
- Added a user motion-quality control to Settings without expanding the source monolith markup. The preference is local, while accessibility and runtime caps remain authoritative.
- Wired meaningful motion to sent messages, message reveal, natural streaming, Deep Think, execution stages, tool paths, completion, errors, retry, room deletion, modal spatial origin, sidebar, source topology, theme change, World entry, scene changes, and Canon divergence. Future menus, tabs, dragging, skeletons, undo, and coding diffs use the same public semantic contract.
- Added the bounded signature set: Seven Wake, Celestial Shift, Deep Think Orbit, consequential Agent Completion, World Entry, and Canon Divergence. Signature layers are pointer-transparent, transient, absent in Reduced/Off, and simplified below Balanced.
- Added `SEVEN_MOTION_OS.md` as the executable identity-motion contract and `release/motion-runtime.test.cjs` with 21 deterministic checks. The static audit passes with a 95,155-byte release layer and zero warnings, below the existing 100,000-byte cap.

Local Chromium could not be downloaded because the Playwright CDN returned 502/timeouts, so no local browser result was inferred. GitHub Actions run `34751724151` subsequently passed Chromium installation, the complete `node all.cjs` gate, and verified-artifact upload for the exact Motion OS tree. The Android workflow is limited to `main`, `apk-finalization`, or manual dispatch and was not run by the PR; smoothness, battery, and thermal claims on the physical Tecno Pova 5 remain a separate real-device gate.
