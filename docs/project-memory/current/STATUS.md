# Seven AI — Current Status

## Active Development Branch
`ultimate-polish-v1`

## Ultimate Polish Execution
**Counter:** `10 / ~20–25`

- Mega-Wave 01 — Speed + Smoothness Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 02 — Cognitive Runtime + Truth/Epistemic Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 03 — Memory Fabric + Context Workspace Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 04 — Model Fabric + Adaptive Compute Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 05 — Tool Fabric + Tool Security + Side-Effect Recovery Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 06 — Verification/Judge + Seven Evals/Benchmark Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 07 — File & Project Tools + Coding Agent Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 08 — Research + Search/Retrieval + Knowledge/Files Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 09 — Vision Fabric Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 10 — RPG Engine + Story Fabric Runtime Foundation → `PASS_FOUNDATION` ✅

Detailed durable evidence: `ULTIMATE_POLISH_PROGRESS.md`.

## Wave 10 verified truth
Seven now has an executable RPG/Story hardening foundation whose canonical export is `hardening/rpg-story-fabric-final.cjs`.

Pass A commit `d8485312657e2423d63534d29f5c15a766b0534c` created the event-sourced World Kernel + first executable Story Fabric and passed run `34878307667` / #1456.

Pass B commit `4bd5d8e79176cdd8cd194f8de1ede6e148c67e6c` added state/session seals, state reconstruction, branch ancestry, PlayerAction/proposal integrity, narrative dependency seals and Wave 06 Judge-bound Story→World handoff. Run `34878748629` / #1457 failed correctly on a test fixture that could not reach the intended already-known-reveal guard. Test-only repair `47dab9e2e3bdcb8447c79537567dbd200cc84e02` fixed that fixture without weakening invariants; run `34879032060` / #1458 succeeded.

Final adversarial review found residual authority gaps. Commit `be4f2642e8ee0c1455ab0e4e467570e7c9d4fa4e` made `hardening/rpg-story-fabric-final.cjs` canonical and closed them:
- generic `ADD_KNOWLEDGE` now requires an existing transmission event;
- player movement must match the actual user-authored PlayerAction target;
- player mental state fields cannot be invented from an unrelated action;
- RNG state advances require an authentic deterministic receipt;
- snapshot state/boundary hashes are reverified;
- earned arc changes require existing world-event evidence;
- promise payoff and reader reveal references must resolve to real StoryGraph nodes;
- generic World Kernel commit refuses Story/Narrative-origin proposals;
- Story-origin world changes require authentic Judge-bound handoff at commit time and still commit only through the World Kernel;
- cancelled Story generation cannot create authoritative world events.

Final implementation run `34879527880` / #1459 succeeded end-to-end, including `node all.cjs`, UI capture and release artifact upload. The campaign now contains `54` auto-discovered suites. The final RPG/Story adversarial guard adds `28` assertions. Because the new specialist runtime remains outside the release startup asset list, the existing startup gate remains `98941 / 100000` bytes. Artifact: `10362351591`, SHA-256 `605f0e94a86ef4af5bc6b200869d1f149a55b69ed68e38c3ea8b9c5584e9c10e`, size `2072583` bytes.

This is a **foundation PASS**, not release saturation. Long-horizon campaigns, richer faction/schedule/rumor/director simulation, persistent RPG/Story recovery, larger narrative-quality benchmarks, specialist UI and real-device evidence remain later work.

## Protected Source
`seven_ai-final.html`

Integrity reference: `658133` bytes, Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.
Do not modify it without explicit user authorization.

## Major implementation truth
- **Performance:** Wave 01 foundation verified; real-phone battery/RAM/thermal/frame-tail evidence remains.
- **Cognitive + Truth:** Wave 02 foundation verified; full CR3/ClaimGraph/correction/retraction projection remains later work.
- **Memory + Context:** Wave 03 foundation verified; scalable persistence/optional semantic indexes/complete derived invalidation remain later work.
- **Model + Adaptive Compute:** Wave 04 foundation verified; live-provider/adapters and device tuning remain later work.
- **Tool/Security/Effects:** Wave 05 foundation verified; external adapters, durable effect persistence and live reconciliation remain integration work.
- **Verification/Evals:** Wave 06 foundation verified; larger holdouts/calibration/persistent reporting/device cohorts remain later work.
- **File/Coding:** Wave 07 foundation verified; SAF/shell bridges, durable transactions, larger repositories and final UI remain later work.
- **Research/Knowledge/Retrieval:** Wave 08 foundation verified; live acquisition, durable indexes and larger multilingual/current-web benchmarks remain later work.
- **Vision:** Wave 09 foundation verified; live OCR/VLM/platform adapters and capture permissions remain later work.
- **RPG + Story:** Wave 10 executable foundation verified. World truth, player agency, actor knowledge, branch/event state and Story narrative artifacts are separated by explicit authority boundaries.
- **Real Works / Canon + Titles:** architecture/foundations exist but specialist executable integration is the next Mega-Wave.
- **UI / Android:** final visual implementation and real-device certification remain later.

## Cross-cutting laws
- authority cannot be manufactured by model/tool/memory/summary/search/vision/story text or increase through derivation;
- player choices and mental states remain user-owned unless explicitly supplied by the user;
- character knowledge requires an evidence-backed transmission path;
- Story Fabric proposes narrative/world changes but does not own world truth;
- World Kernel commits only validated authoritative transitions;
- search and perception outputs remain evidence candidates, not permissions;
- verification precedes success claims and uncertainty remains explicit;
- hard correctness/security gates cannot be averaged away;
- expensive intelligence stays selective/lazy;
- Unlimited means open-ended product behavior with bounded external/device resources;
- architecture, implementation and release saturation are distinct claims.

## Explicit open issues
- remaining Ultimate Polish Mega-Waves after `10 / ~20–25`;
- Real Works/Canon Simulation + Titles / World Linguistic executable specialist integration;
- live Research/Vision/provider adapters and durable derivative caches;
- persistent RPG/Story/Effect/Memory/Project/Research recovery;
- real Android startup/RAM/battery/thermal/frame/long-session evidence;
- larger hidden/holdout, long-horizon and competitor/product benchmarks;
- final visual implementation, Android visual certification and Visual Red Team;
- dependency install currently reports `7` audit findings (`3 moderate`, `3 high`, `1 critical`) plus deprecated transitive packages and GitHub Action Node deprecation warnings. These are not hidden by subsystem PASS labels.

## Immediate Next Work
**Mega-Wave 11 — Real Works Canon Simulation + Titles / World Linguistic Foundation.** Build a source/version/evidence-bound canon graph with continuity/adaptation separation, `CANON_GAP`, branch-aware divergence, character knowledge horizons, anchors/coverage/insertion contracts and RPG integration. Couple it to an evidence-grounded Titles engine with official/generated status separation, world-specific naming grammar, collision/localization/Arabic rules and reproducible manifests.

## Development Philosophy
Use the largest safe coherent pass, verify it, repair failures in the same turn when practical, preserve evidence in GitHub and continue. Do not manufacture complexity or completion claims.
