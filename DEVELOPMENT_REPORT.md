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
