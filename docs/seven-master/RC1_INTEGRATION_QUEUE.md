# Seven AI — RC1 Integration Queue

Authority: Chat 0 — Master / Release Manager
Integration branch: `integration/rc1-convergence-20261005`
Base: current `main`
Status: ACTIVE — no RC1 acceptance yet

## Candidate lanes

| PR | Lane | Branch | Current state | Master disposition |
|---|---|---|---|---|
| #122 | Android + Persistence + UI | `chat1/android-rc1-hardening-20261005` | ACTIVE | Review after exact-head CI; process-kill/upgrade/signing still required |
| #120 | RPG Production | `chat2/rpg-production-hardening` | ACTIVE | Material progress; transaction/recovery/context proof still required |
| #119 | Coding System | `chat3-coding-production` | ACTIVE | Syntax artifact reported; acceptance-infrastructure protection and authoritative diff enumeration required |
| #121 | Self-Development + Tools | `chat4-selfdev-tools-hardening` | ACTIVE | Timeout/immutability/schema-validation issues reported; Coding seam/E2E still required |

## Known overlap
- PR #122 and PR #120 both modify `release/release-verify.cjs`. They must not be auto-merged independently without reconciliation.
- PR #121 modifies shared `release/integration-contracts.test.cjs`; integrate only after shared Tool boundary is approved.
- PR #119 mostly adds isolated Coding runtime/adapter/test files, but its security boundary affects Self-Development and Tools.

## Integration order
1. Evidence gate each specialist branch independently.
2. Repair specialist blockers before integration; no threshold weakening.
3. Integrate lowest-conflict foundations first:
   - Coding verified transaction contract;
   - Tools/Self-Dev only after adapting to the accepted Coding seam.
4. Reconcile RPG + Android release verifier changes manually on this branch.
5. Run full `all.cjs` / packaged browser acceptance on the exact integration SHA.
6. Generate Android project and run lint/unit/APK binary+provenance checks.
7. Run API36 + API34 instrumentation.
8. Run process-kill and Build A→B upgrade/data continuity experiments.
9. Verify package/version/signer continuity.
10. Issue GO / CONDITIONAL GO / NO-GO.

## Merge policy
- No specialist PR merges to `main` during RC convergence.
- Draft PR is not acceptance evidence.
- Green focused tests alone are insufficient; exact-head shared regression is required.
- Product truth beats reports.
- Cross-system contract changes require Master review.
- RC1 requires one fixed final SHA and artifact provenance from that SHA.

## Current release blockers
- real process-kill persistence;
- upgrade/data/signing continuity;
- RPG recovery/transaction/live context final proof;
- Coding production E2E;
- Self-Dev → Coding trusted acceptance E2E;
- real executable Tool adapter proof;
- final integrated Web + Android gates;
- branch required-status enforcement remains an external/admin limitation.
