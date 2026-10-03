# B10 — Wave 01B Team B Integration Review (RPG V2)

Scope: the AUDIT PACKAGE as an implementation plan. Not a claim that RPG V2 is built.

## 1. Reports reviewed

| ID | Report | Evidence quality |
|---|---|---|
| B01 | UX | Strong; file:line, 9 friction items, RPG-01/07 mapped |
| B02 | Android/persistence | Strong; self-corrected 2 first-pass claims |
| B03 | Canon grounding | Good static read; self-declared "not executed" |
| B04 | Engine map | Strong; best slice decomposition |
| B05 | Runtime | Strongest shared-core anchors; read-only scope |
| B06 | Memory/context | Partial; could not inspect seven_ai-final.html |
| B07 | Integrity | Strong; severity-ranked gaps G1-G12 |
| B08 | Eval harness | Strong; full evidence-base inventory |
| B09 | Performance | Weakest; engines/persistence "Unknown", no measurement |

All nine present, non-empty, WAVE01=COMPLETE-terminated. Contracts read: product contract,
EVALUATION_GATE (A-D), SEVEN_COHESION_PASS, manifest.

Weak: no worker executed a test, so runtime evidence is zero (B03, B06, B09). No measured
baseline for the B09 budgets. B06 lists 16 unknowns. B08 leaves open whether SevenWorkspaces
already restores the last active workspace.

## 2. Independently corroborated facts (high confidence)

- No persistence; state is a memory-only module closure, so exit continuity is accidental (B01, B02, B06, B07, B08, B09).
- Primary path is gated on JSON pack import; no zero-config start (B01, B03, B04, B08).
- Zero RPG automated coverage; on-device RPG is screenshot-only, RTL/night asserted in Chat not RPG (B02, B07, B08).
- No seam feeds canon/scene contracts into the model prompt (B03, B04, B05).
- audit().chronology returns a hardcoded PASS (B03, B07).
- `verified:true` is the only gate and the UI never sets it, so applyVerifiedDelta is in-app always BLOCKED (B03, B05, B06).

## 3. Conflicts (resolved by citation)

1. Storage key: four proposed — B02 `seven.rpg.v2.session`, B08 `seven_rpg_session_v2`, B07 `seven_rpg_session_v1`, B06 `seven_rpg_state_v1`. Ratify one.
2. Test substrate: B08 mandates built dist (engines are inlined, not raw-HTML globals); B02 implies driving the workspace directly. B08 wins for shipped-surface proof.
3. Suites: B02, B04, B08 each propose different RPG suites. Consolidate; unregistered suites (B04) are unproven state.
4. CI ownership: B04 says all.cjs is outside the Team B lease and blocks registration; B08 assumes access. B04's constraint stands.
5. Gate semantics: B07 G1 (token is unauthenticated) vs B04/B08 treating it as sufficient. B07 is right; bind it to an assertion + input digest.
6. B09 calls the persistence backend unknown; B02 resolves it (WebView localStorage persists under androidScheme "https"; no Capacitor storage plugin). Resolved-by-B02.
7. Architecture overlap: B04 (new state/persistence modules), B06 (extend primitives), B02/B08 (serialize via snapshot()). One owner decision; do not build all three.

## 4. Merged dependency order

0. Ratify key/format, provenance record, verified-gate spec; grant leases for all.cjs and the shared-core prompt seam (B04, B06, B07, B08).
1. Harness first, zero production change: canon suite asserting RPG-03/RPG-06 (B08 Slice A) — the regression net for steps 2-5.
2. Pure state + persistence: envelope with independent schemaVersion, quarantine, provenance record, hash chain; node-testable, no DOM (B04, B06, B07).
3. Engine integrity: real chronology check, error-severity invariants refuse, contradiction check before derived commits, branch restore (B03, B07).
4. Shared-core prompt seam: bounded rpgState projection in buildContext, budget-counted. Critical path (B04, B05).
5. Workspace wiring: reset before hydrate; ≤3-action start with no JSON import; advanced-only pack import and titles; reconcile shell title suppression; visible corrupt-state notice instead of silent Chat fallback (B01, B02).
6. Bounded context and write cost: cap the serialized snapshot, debounce the per-render canon audit, dirty-flag writes (B09).
7. Complete tests, then opt-in live semantic verdicts (B02, B08).

## 5. Top blockers and ownership

- B1 critical path — no prompt seam, so RPG-02/03/05 cannot pass. agent/04-research + agent/10 lease.
- B2 RPG-01/RPG-04 impossible: no start flow, no persistence. agent/04-research.
- B3 RPG-06 falsely green: unauthenticated gate + hardcoded chronology PASS. agent/04-research.
- B4 all.cjs outside lease blocks CI registration. manager lease / agent/08-testing-ci.
- B5 Shell hides title controls and the overflow control at ≤620px, so the pack path is unreachable on small Android. agent/01-ui-ux + agent/04-research.
- B6 Zero executed evidence anywhere in the package. agent/08-testing-ci.

## 6. Evidence required before future product merges

- Gate A: no uncaught errors across start → turn → exit → re-enter; reload and cold-start restore; no overflow ≤360px with RPG open; RTL and night tokens; Android smoke asserting RPG state, not a screenshot.
- Gate B: ≤3 user-visible actions from fresh storage, counted in-page on the built artifact; reviewer verdict on whether the first turn is memorable.
- Gate C: shared navigation/tokens and the ratified persistence convention; Arabic renders as Arabic; no parallel settings or modal surface.
- Gate D: automated output, before/after note, known limitations, independent verdict, both engine suites green unmodified.
- Semantic tier, non-blocking in CI: RPG-02/03/05/06 prose verdicts from an opt-in live run; stub runs labelled STUB; host/emulator tier labelled; PHYSICAL_DEVICE stays UNMEASURED.
- Determinism: no Math.random/Date.now in the harness, identical digest across two runs, no characterKnowledge in serialized context.

## 7. Audit-package vs product-release readiness

Audit package: READY. Coherent, evidence-cited, contract-mapped, honest about its own gaps; the nine
reports converge on the same root causes and none overclaims a finished product.

Product (RPG V2): NOT READY. RPG-01, RPG-04, RPG-05, RPG-07 fail by direct inspection; RPG-02 fails
because no bounded context reaches the model; RPG-03/RPG-06 are testable today but the in-app path
is BLOCKED and the gate is unauthenticated; RPG automated coverage is zero today.

## 8. Verdict

Audit package: READY to integrate as the RPG V2 implementation plan, once §3 conflicts are ratified
and B1-B6 are tracked as blockers. Product merge readiness: CHANGES REQUIRED — no RPG product change
merges until §6 evidence exists.

WAVE01_REVIEW=PASS