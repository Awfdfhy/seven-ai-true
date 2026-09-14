# Evolution Core status

Implementation branch: `seven-beta-ui-v1`

## Self-Evolution V4.4 runtime status

The frozen Self-Evolution V4.4 architecture now has a strict repository runtime path implemented and exercised by CI.

Implemented controls include:

- frozen ImprovementTarget and campaign identity
- four evolution lanes and bounded generation depth
- clean-room Builder / Judge / Promotion identity checks
- matched-budget fairness checks
- assistance accounting for autonomy claims
- learning-pathway proof for retained-experience claims
- evaluation constitution locking and test-authoring firewall
- evaluator-change escrow for future comparison epochs
- atomic PromotionBundle identity across code/prompts/schemas/tools/migrations/rollback
- shared recursion supervisor across nested campaigns
- pre-promotion reservation of the global recursive budget
- durable supervisor persistence and restart reconciliation
- durable campaign journal with tamper-evident lineage
- retained-experience scope/substrate transfer guard
- negative-transfer and supersession handling
- AutonomyEnvelope checks
- protected capability conservation checks
- cross-scale propagation barrier
- substrate transfer evidence checks
- tool-library health checks
- oversight sustainability checks
- Bootstrap Supervisor separation for evolution-engine upgrades
- fail-closed V4.4 strict runtime entrypoint before the existing shadow/canary/promotion/rollback core
- strict Coding Agent campaign path: isolated candidate workspace -> trusted Seven Evals -> V4.4 strict governance -> durable promotion core
- existing evaluation lock, durable update transaction, recovery, post-release health, and rollback machinery

## First closed-loop campaign

The first seeded deterministic V4.4 campaign completed in GitHub Actions run #1306.

Target: `release/performance-runtime.js` repeated-boot resource overhead.

Observed baseline under repeated boot:

- PerformanceObserver registrations: 3
- visibilitychange listener registrations: 3

The isolated candidate reduced both to one registration, passed Coding Agent reproduce/repair/review/regression, trusted Seven Evals, V4.4 strict governance, PromotionBundle verification, durable promotion simulation, and post-apply verification. The campaign verdict was `COMMITTED` with candidate SHA-1 `9eac3f4fb0fbdb9f240134ac7766bce96b380716`.

The exact verified candidate was then promoted to the repository through external user-authorized GitHub authority in commit `aa7aeeee25acdb0658db05422fa63f23dc294e4f`. The one-shot canary was converted into a permanent regression gate so repeated `boot()` calls must continue to reuse one observer and one visibility listener.

Campaign evidence is preserved in `evolution/FIRST_V44_CAMPAIGN_EVIDENCE.json`.

## Validation

GitHub Actions `Seven AI tests` run #1306 completed successfully for strict coding integration commit `8b57668f3c7a0377b01462f442af02cf6f81e300`.

The workflow passed:

- `node all.cjs` including 38 suites and the first V4.4 closed-loop campaign
- Chromium installation/runtime checks
- verified Beta UI capture
- verified release-artifact upload

Earlier V4.4 runtime layers also passed CI in runs #1296, #1298, #1300, #1302 and #1304.

## Truth boundary

This proves repository implementation, CI validation of the covered V4.4 runtime paths, and one real repository improvement that was generated/evaluated inside an isolated seeded campaign and then externally promoted after proof.

It does **not** prove open-ended autonomous recursive evolution in production, Android device verification of the self-evolution machinery, universal improvement magnitude, or production self-modification authority. Seven still does not grant itself repository credentials, deployment authority, or production authority; the final repository promotion was performed through external user-authorized GitHub access.
