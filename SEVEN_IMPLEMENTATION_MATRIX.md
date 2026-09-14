# Seven AI — Implementation Truth Matrix

This file separates architecture from shipped behavior. A prompt, document, button, screenshot, benchmark score or API name does not make a subsystem complete.

## Definition of done
A subsystem is **DONE** only when executable code exists, normal-flow wiring invokes it, important paths have deterministic/browser/device evidence, and failures have explicit BLOCKED/FAIL/INCONCLUSIVE/retry/fallback/recovery semantics.

## Current implementation map

| System | Executable core | Normal-flow wiring | Verification | Current truth |
| --- | --- | --- | --- | --- |
| Chat / rooms | Yes | Yes | Browser + persistence gates | Strong, not final-production certified |
| Room persistence | IndexedDB adapter | Yes | Browser gate | Strong |
| Cognitive Runtime | Task state machine, adaptive compute/risk, dependency/budget mission frontier, route learning, trust/adversarial gates | Partial across specialist flows | Cognitive Boost 23 + Gate 7 + Planner 4 | **Wave 02 foundation verified** |
| Truth / Epistemic | Claim kinds, authority ceiling, lineage, freshness, dedupe, independence, conflict semantics | Partial via Research/World/control | Hardening + parity + cognitive gates | **Wave 02 foundation verified** |
| Memory Fabric | Selective admission, origin-bound atoms, correction history, scope/principal filters, dedupe, bounded recall, capsules, hard purge | Foundation | Legacy/runtime + 15 adversarial | **Wave 03 foundation verified** |
| Context Workspace | Typed roles, privileged instruction boundary, scope filtering, dedupe, mandatory blocking, elastic budgets, chronology | Browser Control Runtime + bridge | Node/browser + adversarial | **Wave 03 foundation verified** |
| Model Fabric | Family/revision/endpoint identity, proof/pricing/health/quota, hard eligibility, verified ranking, lease/failover, context handshake | Foundation; live adapters partial | Model/Compute 36 + registry/promotion | **Wave 04 foundation verified** |
| Adaptive Compute | BudgetVector, mandatory floors, ceilings, leases, protected verification/recovery reserves | Partial through cognitive layer | Model/Compute + Cognitive/Performance | **Wave 04 foundation verified** |
| Tool Fabric | CapabilitySpec/BindingRevision, snapshots, schema fingerprints, bounded retrieval/frontier, exact ToolCallContract, invocation states | Strong host/hardening foundation | Tool/Security/Effect 54 | **Wave 05 foundation verified** |
| Tool Security Kernel | Authoritative grants, epochs, exact scope/destination, read-vs-release, confirmations, narrowing leases | Host/hardening | Tool/Security/Effect 54 | **Wave 05 foundation verified** |
| Side-Effect Ledger | Logical Effect identity, dispatch/effect/compensation state, idempotency retry, bounded reconciliation, tamper detection | Host/hardening + compatibility | Tool/Security/Effect 54 | **Wave 05 foundation verified** |
| Verification / Judge | AcceptanceContract, VerificationPlan DAG, evidence freshness/independence, bounded repair, independent high-risk judge, JudgeReceipt | Host/evolution; migration partial | Judge/Benchmark 53 | **Wave 06 foundation verified** |
| Seven Evals / Benchmark | Versioned tasks/suites/environments/runs, hard gates, uncertainty, paired comparison, contamination, release receipts | Evolution/benchmark | Judge/Benchmark 53 | **Wave 06 foundation verified** |
| File / Project Tools | ProjectRoot/Grant, FileRef/VersionToken, protected paths, ProjectMap, staged transaction, rollback/postconditions | Foundation; platform adapter partial | Coding/File 58 + Pass B 25 | **Wave 07 foundation verified** |
| Coding Runtime | RequirementLedger, ChangeContract, BaselineProof, isolated candidate, reproduce/investigate/test/review/repair, Judge promotion | Strong host/evolution; UI partial | Coding/File + Judge | **Wave 07 foundation verified** |
| Research Fabric | Source-versioned locator-bound EvidenceUnits, dependency clusters, freshness/conflict, CoverageContract, locks/citations | Release + hardening + Truth bridge | Research 46 + 17 + bridge 2 | **Wave 08 foundation verified** |
| Retrieval Fabric | QueryPlan, cheap exact/lexical baseline, conditional semantic/hybrid portfolio, discovery-only observations, clustering/manifests | Foundation; provider adapters partial | Wave 08 suites | **Wave 08 foundation verified** |
| Knowledge / Files | KnowledgeSource/SourceVersion/SourceLocator, derived representations and invalidation | Foundation; ingestion/storage partial | Wave 08 suites | **Wave 08 foundation verified** |
| Vision Fabric | VisualSource/Version/Frame/Region, OCR/Layout, observations, perception plans, remote envelopes, exact targets | Foundation; live OCR/VLM partial | Vision 54 + 27 | **Wave 09 foundation verified** |
| RPG World Kernel | Sealed world/event state, player actions, proposal/validate/commit, causal replay, snapshots, branches, deterministic RNG, actor knowledge | Canonical hardening; UI/persistence partial | Pass A/B/final + CI | **Wave 10 foundation verified** |
| Story Fabric | StoryContract/Ledger/Graph, arcs/promises/reveals, Scene/Beat/Artifact, critics, Judge-bound Story→World handoff | Canonical hardening; live writer/UI partial | Pass A/B/final + Judge | **Wave 10 foundation verified** |
| Canon / Real Works | Source/version/evidence continuities, facts/events/partial chronology, knowledge, anchors, coverage, insertion/divergence, RPG constraints | Canonical hardening; live acquisition partial | Wave 11 + Pass B/final | **Wave 11 foundation verified** |
| Titles / World Linguistic | Typed status/domains, evidence-bound profiles, deterministic grammar, collisions, localization/Arabic, replay manifests | Canonical hardening; UI/model assist partial | Wave 11 + Pass B/final | **Wave 11 foundation verified** |
| Visual Evidence Runtime | Sealed scenarios/artifacts/audits/evidence, evidence tiers, registries, anti-laundering, environment/device proof | Playwright capture + build/test | 43 + 32 + 5; 8/8 HOST captures | **Wave 12 HOST-tier foundation verified** |
| Design Genome Runtime | Canonical semantic tokens, Day/Night/Aurora/domain roles, typography/spacing/shape/motion, signature primitives, sealed snapshots | Build/test authority; component migration incremental | Genome 141 + Pass B 35 | **Wave 13 foundation verified** |
| Design Lint / Genome Coverage | Drift lint, legacy adapters, coverage ledger, exact source manifest, monotonic migration comparison, migration receipts, primitive audits | Build/test path | Lint 37; live `0 FAIL / 7 WARN / 54 INFO` | **Wave 13 foundation verified**; warnings/info are explicit migration debt |
| UI Design / Runtime | Release CSS, adaptive tiers, semantic states, accessibility hooks, 44px core touch repair | Yes | Browser/static/contrast + host visual evidence | Strong foundation; final Genome migration/global UI tournament pending |
| Motion System | Event-delegated reveal/press/theme motion | Yes | Browser + reduced-motion + visual probe | Strong foundation; dedicated motion campaign pending |
| Performance Runtime | Adaptive tiers, pressure downgrade, guarded recovery, bounded marks, idle/frame scheduling/yield | Yes | 11 direct + static/browser | **Wave 01 foundation verified** |
| PDF Runtime | Lazy local PDF.js | Yes | Browser/static | Strong |
| Evolution Promotion Safety | Transactional apply/verify/rollback + baseline/corpus lock | Promotion runner | Evolution suites | Strong fail-closed foundation |
| Android packaging | Capacitor/assets/APK workflow | Build pipeline | Actions + emulator smoke | Packaging foundation; real-device evidence pending |
| Android SAF / Keystore | No final integration | No | No | Planned |
| Full observability | Partial counters/modules | Partial | Partial | Planned/partial |

## Current system laws
- Authority cannot be created by model/tool/memory/summary/search/vision/story/title/visual text or increased through derivation.
- Search/ranking/snippets remain discovery signals, not evidence authority.
- Vision pixels/OCR/VLM remain derived observation and cannot grant action/world/file authority.
- Visual screenshots are scenario evidence, not automatic proof of semantics/behavior/accessibility/device quality.
- Visual evidence tiers cannot be promoted by relabeling; device claims require device proof.
- Golden/reference updates require explicit approval and may not be changed merely to make a regression disappear.
- Design Genome manifests bind exact branch/commit/source blobs; visual migration must be monotonic or explicitly reviewed.
- State Node/status semantics cannot rely on color alone.
- Memory recall remains recall-only; contextual placement never creates permission.
- Child compute cannot mint budget or steal protected verification/recovery reserve.
- Effectful tool authorization binds exact principal/task/action/resource/schema/args.
- Transport success is not real-world effect truth.
- Verification verdicts are evidence-bound; missing evidence cannot become PASS through prose.
- Benchmark hard gates cannot be averaged away by quality scores.
- World state is owned by the RPG World Kernel, not prose/model memory.
- Player agency is authoritative user input.
- Canon is source/version/evidence/continuity bound; missing required coverage remains `CANON_GAP`.
- Generated titles never silently become official titles.

## UI / performance rules
- Mobile-first reachability and safe areas.
- Reduced Motion changes presentation only, never correctness.
- Performance tiers may reduce optional decoration/depth, never safety/meaning.
- Heavy PDF/workspace/tool/benchmark/coding/research/vision/RPG/Story/Canon/visual-evidence/design-evaluation tooling stays lazy or build-time where practical.
- Release startup gate remains `<100000` bytes. Current verified startup is **`99743 / 100000` bytes**, leaving **257 bytes** headroom.
- Wave 14+ visual work must not silently inflate startup. Recover/compact bytes first or keep work lazy/build-time.

## Next integration gates
1. **Logo & Identity Tournament:** governed candidate manifests, silhouette/tiny-size/adaptive-mask/Day-Night/themed-icon evidence, distinctiveness and anti-imitation review. No production asset replacement until promotion passes.
2. Canonical token migration + Global UI tournament.
3. Specialist workspaces + Typed/Generated UI + Motion Genome.
4. Accessibility + Arabic/RTL + mobile-performance offensives.
5. Live Research/Vision/provider adapters and durable caches/persistence.
6. Android SAF/Keystore + real-device startup/storage/cancellation/offline/provider/capture/visual certification.
7. Larger holdout/competitor evals, Visual Red Team and final saturation 2/2.
8. Only then may the complete product be called release-ready.
