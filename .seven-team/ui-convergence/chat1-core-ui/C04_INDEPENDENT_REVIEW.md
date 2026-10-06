# C04 — Independent Core UI Review

Reviewer role: **C04 — Core UI Reviewer**  
Rule: reviewer does not self-fix production code.

## Current verdict
**BLOCKED — NOT READY**

### Findings
- ✅ Research database meets the required 200 references: 50/50/50/50.
- ✅ Canonical ownership/deletion plan exists.
- ✅ A concrete competing model picker runtime was removed from `ui-polish-fixes.js`.
- ✅ Regression contract now enforces one Core model picker constructor.
- ⚠️ Legacy shell + final-shell architecture still has two staged shell files. This is transitional, documented, and requires the next merge phase rather than another override layer.
- ⚠️ `beta-ui.css`, `seven-final.css`, `ui-hardening.css` and shell CSS still overlap on Core surfaces.
- ❌ Required Android / viewport before-after screenshots have not yet been reviewed.
- ❌ 320/360/390/420 LTR/RTL Day/Night visual matrix is not yet passed.
- ❌ Keyboard-open composer evidence is not yet present.

## Review gate
C04 will only change verdict to PASS after:
1. screenshot artifacts exist for mandatory states,
2. no duplicate picker/actions are visible,
3. topbar/composer pass 320px Arabic,
4. Chat 0 confirms shared-shell integration does not reintroduce competing layers.
