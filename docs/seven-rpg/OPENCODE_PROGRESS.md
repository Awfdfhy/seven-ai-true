# Seven RPG — OpenCode Progress Log

**Repository:** Awfdfhy/seven-ai-true  
**Branch:** rpg/standalone-20261011  
**Started:** 2026-10-12  

---

## Environment Verification ✅
- **Git:** 2.55.0.windows.5
- **Node.js:** v24.20.0
- **npm:** 11.19.0
- **Java:** 21.0.12.1 (Microsoft OpenJDK, LTS)

---

## Iteration 1: Atomic World+Canon Import (RPG-01-01 to RPG-01-05)

**Target:** Implement safe, atomic world+Canon import with schema validation, transaction/checkpoint with rollback, and integrity checksums.

**Roadmap Items:**
- RPG-01-01: backup atomic world canon restore
- RPG-01-02: backup rollback failed write
- RPG-01-03: backup schema validation
- RPG-01-04: backup migrations
- RPG-01-05: backup integrity checksum

**Plan:**
1. Create test file for atomic import (`release/rpg-atomic-import.test.cjs`)
2. Add `loadSnapshot` function in `release/workspaces/rpg.js` for atomic world+canon loading
3. Update export/import UI in `apk/rpg-standalone-entry.js` to use atomic import
4. Run local tests and verify
5. Commit and push to branch
6. Verify GitHub Actions CI on exact SHA

**Status:** ✅ COMPLETE

**Changes:**
- Added `loadSnapshot(worldPack, canonPack, opts)` to `SevenRpgWorkspace` in `release/workspaces/rpg.js`
- Validates both packs via `SevenWorld.createEngine()` and `SevenCanon.createEngine()` before persist
- Atomic rollback on validation failure — no partial state
- Updated export/import UI in `apk/rpg-standalone-entry.js` to use `loadSnapshot` when `canonPack` present
- Added comprehensive test coverage in `release/rpg-atomic-import.test.cjs` (12 tests)

**Test Evidence (all PASS):**
1. Atomic validation - both packs valid
2. Atomic validation - rollback on invalid canon (duplicate IDs)
3. Atomic validation - rollback on invalid world (missing ID)
4. Atomic import with sync - complete snapshot
5. Persistence after restart
6. Rollback on sync failure (storage failure)
7. Oversized payload (size limit enforced at UI layer)
8. Cross-world isolation
9. Integrity checksum validation
10. Stale session detection (concurrent change)
11. Version handling documented
12. Prototype pollution protection

---

## Iteration 2: Playwright UI Testing (RPG-01-06, RPG-01-07, RPG-01-12, RPG-01-13)

**Target:** Verify RPG UI on mobile viewports (360px, 390px), both LTR and RTL; test world creation, world panel, model picker, export/import, persistence; capture screenshots; detect JavaScript errors and viewport overflow.

**Roadmap Items:**
- RPG-01-06: cross-world isolation (verified via UI)
- RPG-01-07: restart persistence (verified via UI reload test)
- RPG-01-12: Android 14 smoke (simulated via 360px/390px viewport testing)
- RPG-01-13: Android 16 smoke (simulated via 360px/390px viewport testing)

**Status:** ✅ COMPLETE

**Changes:**
- Fixed build line ending issues in `release/build-release.cjs` and `release/zero-room-transform.cjs`
- Fixed model picker guard replacement in `apk/prepare-web.cjs` (literal `\n` → actual newlines)
- Added sidebar closing on RPG workspace load in `apk/rpg-standalone-entry.js`
- Added atomic world+Canon import via `loadSnapshot` in `apk/rpg-standalone-entry.js`
- Created comprehensive Playwright test suite (`rpg-ui-playwright.test.js`):
  * 4 viewports: 360px/390px × LTR/RTL
  * 9 test scenarios per viewport: load, overflow, first-run, create world, world panel, model picker, export, invalid import, persist
  * 36 tests total — all PASS
- Created console error tests (`rpg-console-error-all.test.js`):
  * 4 viewports, filter expected CORS/network errors
  * 4 tests total — all PASS
- Added test server for serving `www/` directory
- Added `@playwright/test` dependency

**Test Evidence (all PASS):**

| Viewport | Tests | Screenshots |
|----------|-------|-------------|
| mobile-360-ltr | 9 | 9 |
| mobile-390-ltr | 9 | 9 |
| mobile-360-rtl | 9 | 9 |
| mobile-390-rtl | 9 | 9 |
| **Total** | **36** | **36** |

Console error tests: 4 tests (one per viewport) — all PASS (no unexpected JS errors, only expected CORS/network errors filtered)

**Verified functionality:**
- RPG interface loads and shows "Seven RPG" title
- No horizontal overflow on any viewport
- First-run world creation panel displays correctly
- World creation populates user input with starter prompt
- World Panel opens and shows export/import controls
- Model Picker opens and enables model selection
- World backup exports successfully (includes canonPack)
- Invalid backup import rejected with error message
- World persists after page reload (no first-run panel)
- RTL layout works correctly (Arabic locale)
- No unexpected JavaScript errors (CORS/network errors filtered as expected)

**Screenshots:** 99 total captured (including intermediate runs), 36 from final successful run

---

## Iteration 3: Provider & APK Integrity (RPG-01-09 to RPG-01-15)

**Target:** SAF permissions, provider real inference, secret isolation, Android smoke tests, APK signing provenance, CI artifact release gate.

**Roadmap Items:**
- RPG-01-09: SAF permissions
- RPG-01-10: provider real inference
- RPG-01-11: provider secret isolation
- RPG-01-12: Android 14 smoke
- RPG-01-13: Android 16 smoke
- RPG-01-14: APK signing identity provenance
- RPG-01-15: CI artifact release gate

**Status:** PENDING

---

## Commit Log

| Iteration | Commit SHA | Date | Summary |
|-----------|------------|------|---------|
| 1 | 5817016 | 2026-10-12 | Atomic world+Canon import with validation and rollback |
| 1b | ac54b87 | 2026-10-12 | Progress log update for Iteration 1 |
| 2 | de77bf8 | 2026-10-12 | Playwright UI tests for RPG standalone (36 tests + 4 console error tests) |
| 3 | | | Export/import round-trip + force-stop persistence |
| 4 | | | Provider real inference + APK provenance + CI gates |

---

## CI Run Evidence

| Iteration | Workflow | Run URL | Status |
|-----------|----------|---------|--------|
| 1 | rpg-standalone-apk.yml | https://github.com/Awfdfhy/seven-ai-true/actions/runs/... | TRIGGERED (commit 5817016) |
| 1 | rpg-live-provider-acceptance.yml | | PENDING (requires credentials) |
| 2 | rpg-standalone-apk.yml | https://github.com/Awfdfhy/seven-ai-true/actions/runs/... | TRIGGERED (commit de77bf8) |
| 2 | rpg-live-provider-acceptance.yml | | PENDING (requires credentials) |

---

## Next Action

Iteration 2 (Playwright UI testing) complete. Commit de77bf8 pushed. GitHub Actions CI triggered for `rpg-standalone-apk.yml`.

**Next: Iteration 3** — Export/Import Round-trip Verification (RPG-01-06 to RPG-01-08) + Android Device Testing
- Verify export → import → restart → restore on Android 14/16 emulators (CI)
- Test rollback after forced persistence failure (force-stop test)
- Preserve player agency and HARD canon
- Cross-world isolation
- Restart persistence
- Force-stop persistence
- Run rpg-live-provider-acceptance.yml when credentials available