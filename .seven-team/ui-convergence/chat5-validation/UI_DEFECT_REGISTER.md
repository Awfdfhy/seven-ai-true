# Chat 5 — UI Defect Register

Status values: OPEN / VERIFY / CLOSED.
Severity: P0 blocks use; P1 major/release-blocking; P2 visible polish inconsistency; P3 minor cosmetic.

| ID | Sev | Surface | Evidence | Expected | Actual | Owner | Status |
|---|---|---|---|---|---|---|---|
| UI-REF-001 | P1 | Reference DB | central JSONL | 1000+ visually reviewed, diverse screens | 1000/1000 are CATALOGUED_PENDING_SCREEN_REVIEW | V03/I01 | OPEN |
| UI-REF-002 | P1 | Reference DB | central JSONL | requested canonical schema | multiple required fields absent in all 1000 rows | V03/I01 | OPEN |
| UI-REF-003 | P1 | Reference DB | corpus distribution | <=15–20/product normally | only 8 products; every product >20, max 181 | V03/I01 | OPEN |
| UI-REF-004 | P1 | Reference DB | source distribution | broad source mix | 100% Interface In Game | V03/I01 | OPEN |
| UI-REF-005 | P1 | Reference DB | branch tree | explicit Chat 1 + Chat 4 DB inputs | Chat 1/4 DBs found on separate branches; canonical integration/provenance still pending | Chat 1/4 + I01 | OPEN |
| UI-GOLD-001 | P1 | Golden references | GOLDEN_REFERENCES.md | completed Top100→Top30→Golden12 | file explicitly says initial shortlist only | V03/I01 | OPEN |
| UI-EVID-001 | P1 | Android 14 | exact head 5a65efce + run 37400365670 | SHA-bound screenshot set | no Android workflow/evidence exists on this SHA; only Seven AI tests ran | V01 | OPEN |
| UI-EVID-002 | P1 | Android 16 | exact head 5a65efce + run 37400365670 | SHA-bound screenshot set | no Android workflow/evidence exists on this SHA; only Seven AI tests ran | V02 | OPEN |
| UI-EVID-003 | P1 | Before/After | RPG A verifier + run 37400365670 | before/after screenshots with SHA/device/theme/lang metadata | RPG A 19-shot matrix is prepared but static budget gate prevents production; run artifacts list is empty | V01/V02/V03 | OPEN |
| UI-ARCH-001 | P1 | Shared UI architecture | LEGACY_UI_DELETION_PLAN.md | one canonical overlay/picker/token stack | plan still reports 3 overlay systems, 2+ model presentations, 5 token namespaces, runtime CSS precedence debt | I01 | OPEN |
| UI-A11Y-001 | P1 | Touch targets | ui-foundation.css + seven-shell-final.css + rpg.js | interactive controls >=44px compact / 48dp Android target | RPG mini=40px, RPG copy=36px, shell code-copy=28px | B03/Chat 2/I01 | OPEN |
| UI-ARCH-002 | P2 | CSS discipline | LEGACY_UI_DELETION_PLAN.md | no specificity escalation | audit reports ~471 !important declarations; canonical shell still contains many migration overrides | I01 | OPEN |
| UI-RPG-001 | P1 | RPG convergence | independent RPG A/B reports + integrator status | implementation evidence sufficient for READY | integrator still records RPG baselines NOT READY and implementation slices incomplete | Chat 2/3 + I01 | OPEN |
| UI-MATRIX-001 | P1 | Acceptance matrix | VISUAL_ACCEPTANCE_MATRIX.md | full surface/state matrix and screenshot verdicts | current matrix is a compact plan, not completed evidence | V03 | OPEN |
| UI-REL-001 | P1 | Release validation | convergence branch movement | freeze one exact candidate SHA before final visual/device review | branch advanced repeatedly during validation (61d7498 → ed292c0 → 6046ba0), cancelling runs and invalidating evidence inheritance | I01 | OPEN |
| UI-CI-001 | P1 | Integrated SHA | run 37722218977 on PR head f203b140b72c356f1ba962ce3c58a7d66ba385d7 | Seven tests SUCCESS on exact final SHA | FAILED at node all.cjs: static audit `release-layer-too-heavy` 102209 bytes + `lazy-workspaces-too-heavy` 320205/320000; do not raise budgets | I01 | OPEN |
| UI-BUNDLE-002 | P1 | Lazy workspace bundle | run 37722218977 on PR head f203b140b72c356f1ba962ce3c58a7d66ba385d7 | lazy workspaces <=320000 bytes | FAILED at 320205 bytes; +205 over budget. Likely delta source: release/workspaces/rpg-ui-b-render.js grew +260 raw chars since 5a65efce | Chat 3/I01 | OPEN |
| UI-BUNDLE-001 | P1 | Release bundle | run 37398352964 | release layer must stay within existing budget | static audit reports 102,209 bytes and fails `release-layer-too-heavy` | I01 | OPEN |
| UI-APK-001 | P1 | APK | integrator status | exact SHA/run/artifact/package/versionCode/signer/install/launch evidence | missing for convergence head | I01/V01/V02 | OPEN |

## Visual defect format for future findings

```
ID:
Severity:
Surface:
Screenshot:
SHA:
Device:
Android:
Viewport:
Theme:
Language/Direction:
Font scale:
Keyboard:
Steps:
Expected:
Actual:
Owner:
Status:
```

## Automatic release-fail rules
Any confirmed clipping, overlap, unreachable action, duplicate control, unclosable modal, unreadable contrast, broken RTL, undersized critical target, keyboard-covered composer, off-screen picker, unusable sidebar, visible legacy duplicate, cross-workspace language break, horizontal overflow, or broken font scaling is P0/P1 depending on impact.

UI READY requires P0=0 and P1=0. P2 acceptance is Chat 0/I01-only.
