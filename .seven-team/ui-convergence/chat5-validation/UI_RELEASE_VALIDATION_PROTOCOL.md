# Chat 5 — UI Release Validation Protocol

## Purpose
Prevent false READY claims caused by a moving integration branch.

## Freeze rule
I01 selects exactly one candidate SHA and records it as `FROZEN_UI_CANDIDATE_SHA`.
No screenshots, Android runs, visual scores, APK evidence, or CI from another SHA may be inherited unless the validator explicitly proves the changed files cannot affect the relevant gate.

Any production/UI commit after freeze invalidates the freeze and restarts this protocol.

## Gate order
1. Freeze exact SHA.
2. Seven AI tests on exact SHA = SUCCESS.
3. Static UI architecture checks on exact SHA:
   - one picker state owner;
   - one overlay contract;
   - no newly introduced global token namespace;
   - bundle budgets unchanged or improved;
   - no new unapproved !important escalation.
4. Build APK from exact SHA.
5. Verify artifact:
   - workflow run ID;
   - artifact ID;
   - extract real APK from ZIP if necessary;
   - package identity;
   - versionCode;
   - signer SHA-256;
   - file size.
6. V01 Android 14:
   - install;
   - launch;
   - LTR/RTL;
   - day/night;
   - keyboard open/closed;
   - core + RPG screenshots.
7. V02 Android 16:
   - same matrix;
   - edge-to-edge;
   - system bars;
   - keyboard resize;
   - back navigation.
8. V03 viewport/cross-workspace:
   - 320/360/390/420;
   - EN/LTR + AR/RTL;
   - normal + large font;
   - empty/long/stress content;
   - Core/RPG/Coding/Research/Self-Development/Settings.
9. Review every screenshot with the 15-axis 1–5 rubric.
10. Close P0/P1.
11. Reconfirm SHA has not moved.
12. Only then emit `UI READY`.

## Automatic reset conditions
- integration branch head changes;
- APK was built from another SHA;
- screenshots lack SHA metadata;
- Android evidence comes from different APK identities;
- a P0/P1 is reopened;
- visual architecture changes after screenshot capture.

## Current state
Current convergence branch moved repeatedly during validation:
`61d749847d8ec97c23fcb705a62e7401ca3d95e8`
→ `ed292c019d1af9a971743bfe43819fdd940b1adb`
→ `6046ba07910fc97df604779518f630993ee2dc35`.

Therefore no final freeze exists yet.
