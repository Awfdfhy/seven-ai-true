# Seven AI — Current Status

## Active Development Branch
`ultimate-polish-v1`

## Ultimate Polish Execution
**Counter:** `12 / ≤30`

The user-set campaign ceiling is **30 Mega-Waves maximum**, not a quota to consume. Stop earlier if the required saturation/evidence gates are reached.

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
- Mega-Wave 11 — Real Works Canon Simulation + Titles / World Linguistic Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 12 — Visual Evidence Runtime Foundation → `PASS_FOUNDATION` ✅

Detailed durable evidence: `ULTIMATE_POLISH_PROGRESS.md`.

## Wave 12 verified truth
Seven now has an executable **Visual Evidence Runtime** that turns visual claims into sealed, scenario-bound evidence instead of prose or screenshot intuition. The strengthened runtime is layered through:
- `release/visual-evidence-runtime.cjs`
- `release/visual-evidence-runtime-passb.cjs`
- `release/visual-evidence-runtime-final.cjs`
- corresponding adversarial test suites
- `release/capture-ui.cjs` live Playwright evidence capture

The runtime binds exact scenario, viewport, locale/direction, theme, reduced-motion state, screenshot SHA-256, commit, branch and environment identity. It audits viewport overflow, touch targets, accessibility, contrast/state structure, and it keeps visual evidence tiers explicit (`HOST`, `EMULATOR`, `PHYSICAL_DEVICE`, etc.) so host evidence cannot masquerade as device certification.

Pass A began at `2309a822c5d3d2bbf063c4e9d205d5cce3047ed2`; capture/test wiring reached `7504be4835fd2cbad3b8831009443b676532cfcd`. Initial live evidence correctly exposed hard touch-target failures rather than hiding them. The UI was repaired in `release/beta-ui.css` to guarantee practical 44px touch hit boxes for core controls. Pass B then added sealed audit verification, environment identity, device-tier proof, scenario/evidence registries, explicit baseline approval and anti-laundering rules. Final runtime added bounded sub-pixel measurement tolerance so 43.9px layout rounding does not create a false warning while material undersizing still warns/fails.

Final implementation HEAD **`7764d275b6231008d603352c442cf56a0bfd6132`** passed GitHub Actions run **`34890701798` / #1474** end-to-end:
- `all test suites: PASS (60 suites)`;
- Visual Evidence foundation: **43 assertions**;
- Visual Evidence Pass B: **32 assertions**;
- Final measurement guard: **5 assertions**;
- live capture: **8 scenarios, 8 PASS, 0 WARN, 0 FAIL**, explicitly in `OBSERVE` mode;
- source integrity lock: protected `seven_ai-final.html` remains exactly `658133` bytes / blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`;
- static audit: **`99743 / 100000` startup bytes**, `34881` lazy workspace bytes, `3689533 / 8388608` static APK bytes, `0` static warnings;
- release artifact upload succeeded.

Artifact: **`10366787278`**, size `2175309` bytes, SHA-256 **`fad44979a715b618ce6197c0b9b7b3d049d0df4e1fddf3b29cd6e9300c86ab38`**.

Important scope boundary: this is **HOST-tier Visual Evidence foundation**, not real-device Android visual certification and not a claim that the Final UI is complete. Goldens cannot auto-update to make tests green; baseline changes require explicit review/reason/reference. Device-tier evidence requires matching device proof.

## Startup budget warning
The verified release startup footprint is now **`99743 / 100000` bytes**, leaving only **257 bytes** of startup headroom. Wave 13 and later visual work must therefore remain build-time/lazy where practical, or simplify/compact existing startup assets before adding hot-path payload. Visual quality work may not silently break the startup gate.

## Model-frontier research decision
`MODEL_FRONTIER_RESEARCH.md` records the current research snapshot. Model rankings are time-sensitive research evidence, not permanent architecture truth.

Seven must never hard-code a model as “best” from one leaderboard or a stale score. Champion qualification requires model/revision identity, same-version independent benchmark evidence, access/free-proof, endpoint capability proof, Seven Evals, adversarial comparison and an expiring qualification lease. “Free” is a proof class, not a boolean; development/trial endpoints, signup credit, durable free tiers, local/self-hosted and paid access remain distinct.

## Protected Source
`seven_ai-final.html`

Integrity reference remains `658133` bytes, Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.
Do not modify it without explicit user authorization. Do not merge this branch to `main` or another protected branch without explicit user approval.

## Major implementation truth
- **Performance:** Wave 01 foundation verified; real-phone battery/RAM/thermal/frame-tail evidence remains.
- **Cognitive + Truth:** Wave 02 foundation verified; full CR3/ClaimGraph/correction/retraction projection remains later work.
- **Memory + Context:** Wave 03 foundation verified; scalable persistence/optional semantic indexes/complete derived invalidation remain later work.
- **Model + Adaptive Compute:** Wave 04 foundation verified; live-provider/adapters, dynamic free-proof refresh and device tuning remain later work.
- **Tool/Security/Effects:** Wave 05 foundation verified; external adapters, durable effect persistence and live reconciliation remain integration work.
- **Verification/Evals:** Wave 06 foundation verified; larger holdouts/calibration/persistent reporting/device cohorts remain later work.
- **File/Coding:** Wave 07 foundation verified; SAF/shell bridges, durable transactions, larger repositories and final UI remain later work.
- **Research/Knowledge/Retrieval:** Wave 08 foundation verified; live acquisition, durable indexes and larger multilingual/current-web benchmarks remain later work.
- **Vision:** Wave 09 foundation verified; live OCR/VLM/platform adapters and capture permissions remain later work.
- **RPG + Story:** Wave 10 foundation verified; persistence, larger simulations/benchmarks and specialist UI remain later.
- **Real Works / Canon + Titles:** Wave 11 executable foundation verified; live source acquisition, persistence, corpus scale and UI remain later.
- **Visual Evidence Runtime:** Wave 12 HOST-tier foundation verified; final design implementation and device-tier certification remain later.
- **UI / Android:** visual architecture is saturated, but final implementation, genome convergence, identity tournament and real-device certification remain later.

## Cross-cutting laws
- authority cannot be manufactured by model/tool/memory/summary/search/vision/story/title/visual text or increase through derivation;
- visual screenshots are pixel evidence, not automatic proof of semantics/behavior/accessibility;
- evidence tier cannot be promoted by relabeling; device-level claims require device-level proof;
- golden/reference updates require explicit approval and cannot be used merely to silence regression;
- canon is source-version/evidence/continuity bound; missing required support becomes `CANON_GAP`;
- player choices and protected mental states remain user-owned;
- generated titles never silently become official;
- benchmark numbers from different index revisions cannot be compared as if they shared one scale;
- expensive intelligence and visual tooling remain selective/lazy where practical;
- Unlimited means no arbitrary Seven-side quota, not denial of provider/device limits;
- architecture, foundation implementation, host evidence and release/device saturation are distinct claims.

## Explicit open issues
- remaining Ultimate Polish Mega-Waves after `12 / ≤30`;
- Design Genome Runtime + Design Lint, Logo/Identity Tournament, Global UI and specialist visual implementation;
- live provider/model adapters and dynamic champion qualification;
- live Research/Vision/Canon acquisition and durable derivative caches;
- persistent recovery for remaining Effect/Memory/Project/Research/Vision/RPG/Story/Canon state;
- real Android startup/RAM/battery/thermal/frame/long-session and visual evidence;
- larger hidden/holdout, long-horizon and competitor/product benchmarks;
- Android visual certification and final Visual Red Team;
- dependency install still reports `7` audit findings (`3 moderate`, `3 high`, `1 critical`), deprecated transitive packages/install-script warnings and GitHub Action Node deprecation warnings. These remain explicit release issues rather than being hidden by subsystem PASS labels.

## Immediate Next Work
**Mega-Wave 13 — Design Genome Runtime + Design Lint Foundation.** Converge existing visual token families into a governed Seven design genome, formalize reusable identity primitives/rules and add build-time/lazy Design Lint that detects drift without spending the remaining startup budget. Do not select the final logo in this wave; the Logo & Identity Tournament remains the next dedicated campaign.

## Development Philosophy
Use the largest safe coherent pass, verify it, repair failures in the same turn when practical, preserve evidence in GitHub and continue. Do not manufacture complexity, benchmark equivalence, visual proof or completion claims.
