# Ultimate Polish Mega-Wave 13 — Design Genome Runtime + Design Lint Closure

Status: `PASS_FOUNDATION`
Branch: `ultimate-polish-v1`
Protected source: `seven_ai-final.html` remains untouched at blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`, `658133` bytes.

## Purpose
Wave 13 converts Seven's visual identity rules from prose into governed executable/build-time contracts without spending the remaining startup budget. It does not select the final logo and it does not claim the Final UI is complete.

## Pass A
Commit `9a3b185eeaf959dcf39f75b1a9429ac7aff13319` added:
- `release/design-genome.cjs`
- `release/design-genome.test.cjs`
- `release/design-lint.cjs`
- `release/design-lint.test.cjs`

The canonical Design Genome now models Day/Night canvas/surface/text/brand roles, Aurora semantic states, Core/Build/Research/World domain accents, typography roles, spacing, shape, motion, and mobile touch targets. It formalizes the Seven signature primitives `orbitThread`, `sevenCut`, `evidenceRail`, `focusHalo`, and `stateNode`, plus compatibility mappings for the existing `--sb-*` and `--seven-*` token families.

The runtime produces deterministic sealed snapshots and coverage ledgers. Design Lint detects unsafe `transition: all`, unguarded continuous motion, unknown canonical tokens, unmapped legacy tokens, RTL physical-edge migration candidates, raw colors, and unknown signature primitives. This tooling is build/test-time only, so it does not add hot-path startup bytes.

Pass A Actions run `34892416342` / #1478: `SUCCESS`.

## Pass B — governance / anti-drift
Commit `72246f62c10babd201ec1ed0ef86119cf27d83e7` added:
- `release/design-genome-passb.cjs`
- `release/design-genome-passb.test.cjs`

Pass B binds visual source references to exact repository path + blob SHA + commit SHA + branch, and adds:
- single-commit/single-branch Design Genome manifests;
- no path traversal or weak-SHA acceptance;
- duplicate source identity rejection;
- monotonic coverage comparison;
- rejection when adapted/canonical coverage silently disappears;
- rejection of new unmapped legacy tokens unless explicitly approved;
- sealed migration receipts;
- signature primitive use audits;
- `stateNode` cannot encode meaning by color alone;
- promotion gate requiring exact manifest + PASS comparison + migration receipt + primitive audits.

## Final verification
GitHub Actions run `34892708588` / #1479: `SUCCESS` end-to-end.

Evidence:
- `all test suites: PASS (63 suites)`;
- Design Genome: `141 assertions` PASS;
- Design Lint: `37 assertions` PASS;
- Design Genome Pass B: `35 assertions` PASS;
- current release Design Lint: `0 FAIL`, `7 WARN`, `54 INFO`;
- the warnings are migration debt, not hidden failures or a claim of completed token convergence;
- live Visual Evidence capture remains `8/8 PASS`, `0 WARN`, `0 FAIL` in explicit HOST/OBSERVE mode;
- protected-source integrity PASS;
- static audit remains `99743 / 100000` startup bytes, `34881` lazy workspace bytes, `3689533 / 8388608` static APK bytes, `0` static warnings;
- release verification PASS.

Artifact:
- ID `10368050591`
- size `2180110` bytes
- SHA-256 `f4ee05b5f40efc97c5eaffcb1e4bb7de8f94f7a060ebbb4203914f9c0735c4d1`

## Truth boundary
Wave 13 proves a governed executable Design Genome foundation and build-time drift detection. It does **not** prove that every existing component already consumes only canonical tokens. The live lint intentionally exposes `7` warnings and `54` informational migration findings. Those must be migrated incrementally without breaking Day/Night, RTL, accessibility, performance, or startup budget.

The final logo is not selected here. Logo candidate generation/promotion belongs to Mega-Wave 14 and must use the locked Visual Evaluation Constitution rather than personal preference alone.

## Carry-forward
- Logo & Identity Tournament with exact asset manifests, silhouette/tiny-size/adaptive-mask/themed-icon evidence and distinctiveness review;
- gradual canonical token migration under the monotonic coverage gate;
- Global UI and specialist workspace tournaments;
- Motion, Arabic/RTL, accessibility, mobile-performance and Android device certification;
- Visual Red Team and saturation 2/2.
