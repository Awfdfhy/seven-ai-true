# Seven AI — Implementation Truth Matrix

This file separates architecture from shipped behavior. A prompt, document, button or API name does not make a subsystem complete.

## Definition of done
A subsystem is **DONE** only when executable code exists, normal-flow wiring invokes it, important paths have deterministic/browser/device evidence, and failures have explicit BLOCKED/FAIL/INCONCLUSIVE/retry/fallback/recovery semantics.

## Current implementation map

| System | Executable core | Normal-flow wiring | Verification | Current truth |
| --- | --- | --- | --- | --- |
| Chat / rooms | Yes | Yes | Browser + persistence gates | Strong, not final-production certified |
| Room persistence | IndexedDB adapter | Yes | Browser gate | Strong |
| Cognitive Runtime | Task state machine, scoped capabilities, adaptive compute/risk, dependency/budget mission frontier, route learning, trust gate, adversarial preflight | Partial across specialist flows | Cognitive Boost 23 + Gate 7 + Planner 4 + integration | Wave 02 foundation verified; CR3 execution classes/no-progress/uncertain-effect cancellation remain partial |
| Truth / Epistemic | Claim kinds, authority ceiling, lineage, freshness, dedupe, independence, conflict semantics | Partial via Research/World/control | Hardening + parity + cognitive gates | Wave 02 foundation verified; full ClaimGraph/correction/retraction projection remains partial |
| Memory Fabric | Selective admission, origin-bound versioned atoms, correction history, point-in-time lookup, scope/principal filters, same-origin dedupe, bounded recall, MemoryCapsules, hard purge | Hardening/runtime compatibility foundation; protected legacy source remains | Legacy memory tests + runtime smoke + 15 adversarial Memory/Context assertions | **Wave 03 foundation verified**; scalable persistence/indexes/semantic retrieval and complete derived purge reconciliation remain partial |
| Context Workspace | Typed roles, privileged instruction boundary, scope filtering, dedupe, mandatory blocking, elastic budgets, ordering/chronology, manifest/capsule | Browser Control Runtime `v4.3` + Control Bridge `v1.1.0` | Node/browser parity + 15 adversarial Memory/Context assertions + release verify | **Wave 03 foundation verified**; target-tokenizer handshake, full source adapters/invalidation/reconstruction remain partial |
| Model Fabric | Provider routing, registry, free-proof, health/evals/promotion modules | Partial | Deterministic evolution/model tests | Partial; Wave 04 active, live provider proof and full route contracts required |
| Adaptive Compute | Risk/resource-aware compute, planner depth/candidate breadth controls | Partial through cognitive layer | Cognitive Boost + resource/performance gates | Foundation exists; multi-dimensional leases/reserves/closed-loop utility policy remains Wave 04 work |
| Tool Fabric | Capability normalization, aliases, schema/risk/permission gates | Partial | Runtime smoke | Partial, external adapters/effect recovery remain |
| Local Intelligence | Deterministic embedding/classification helpers | Partial | Runtime smoke | Foundation implemented |
| Research Runtime | Claim-evidence matrix, freshness/conflict/gap analysis, citation locks | Packaged verification API; acquisition partial | Unit + release gates | Verification foundation implemented |
| Coding Runtime | Repo-map/patch/evidence foundations + evolution modules | Partial | Runtime + evolution tests | Partial; real platform shell/file bridge remains |
| Canon / Real Works | Source authority, anchors, world/canon contracts, branch/debt audit | Packaged APIs; chat orchestration partial | Unit/browser release tests | Functional foundation |
| Titles System | Deterministic world naming rules | Via World Runtime; UI partial | Unit gate | Functional foundation |
| UI Design / Runtime | Release CSS, adaptive tiers, semantic states, accessibility hooks | Yes through release build | Browser/static gates | Strong foundation; final Visual campaign pending |
| Motion System | Event-delegated reveals/press/theme motion | Yes | Browser + reduced-motion gate | Strong foundation |
| Performance Runtime | Adaptive tiers, pressure downgrade, guarded recovery, bounded marks, idle/frame scheduling/yield | Yes | 11 direct assertions + static/browser gates | Wave 01 foundation verified; real-device/tail evidence pending |
| PDF Runtime | Lazy local PDF.js | Yes | Browser/static | Strong |
| Evaluation Baseline | Frozen cross-system JSONL corpus + identity | Build/evolution gates | Corpus integrity | Implemented baseline; broader benchmark system later |
| Evolution Promotion Safety | Transactional apply/verify/rollback + baseline/corpus lock | Promotion runner | Evolution suites | Strong fail-closed foundation |
| Android packaging | Capacitor/assets/APK workflow | Build pipeline | Actions + emulator smoke | Packaging foundation; real-device evidence pending |
| Android SAF / Keystore | No final integration | No | No | Planned |
| MCP / A2A / AG-UI | Architecture target | No | No | Planned |
| Full observability | Partial counters/modules | Partial | Partial | Planned/partial |

## Current cognitive / epistemic / memory / context laws
- Task risk is normalized before compute policy; `high`/`critical` cannot collapse to zero.
- Resource pressure may reduce optional breadth but not mandatory verification floors.
- Missing trust provenance fails closed for authority-sensitive actions.
- Mission planning respects dependencies and cumulative budgets; RUNNING work reserves budget.
- Reduced Motion is presentation/accessibility state, not evidence of weak compute.
- Different wording is not contradiction; explicit conflict relationships remain conflicts.
- Unknown source independence is not promoted to independence.
- Derived claims cannot exceed weakest source/parent authority and never grant action authority.
- Memory origin/principal/scope authority is immutable through correction, summary, retrieval or restatement.
- Memory Recall is `RECALL_ONLY`; placement in Context does not make it evidence or permission.
- Only trusted runtime/controller/policy authority instructions may occupy the privileged system lane.
- Retrieved/tool/project/memory/evidence data cannot self-promote into privileged instructions.
- Principal/namespace/scope filtering occurs before context ranking.
- Required context cannot be silently evicted; insufficient mandatory capacity blocks compilation.
- Context can borrow unused budget elastically while remaining below the global window.
- Conversation chronology survives relevance selection.

## UI / performance rules
- Mobile-first reachability and safe areas.
- No polling animation loops or required decorative effects.
- Reduced Motion affects presentation only.
- Performance tiers may reduce optional decoration/depth, never correctness/safety.
- Heavy PDF/workspace assets remain lazy.
- Current release startup gate remains `<100000` bytes; Wave 03 final evidence is `99794` bytes.

## Research / World rules
- Claims bind to source/stance/locator/authority/transformation.
- GAP/STALE/UNCITABLE/CONFLICT cannot become PASS through prose.
- Canon order is source-bound, missing source references remain unverified/inconclusive, divergence branches rather than rewriting canon, and player irreversible intent is not invented.

## Evolution promotion rules
- Promotion is bound to frozen evaluation identity and exact candidate/baseline state.
- Missing/drifted eval identity fails before mutation.
- Critical security/permission/persistence/crash regression overrides benchmark gains.
- Apply/verify failure requires rollback; rollback failure is never reported success.

## Next integration gates
1. **Model Fabric + Adaptive Compute:** reconcile ModelFamily/Revision/Endpoint identity, strict free-proof freshness, quota/health eligibility, champion/fallback/lease behavior, target-model context handshake, verified-outcome routing, multi-dimensional budgets and protected verification/recovery reserves.
2. Tool/Side-Effect/Recovery: reconcile cancellation after dispatched/uncertain effects end-to-end.
3. Research: Search → Fetch → Extract → Matrix → Verify → Cite with live acquisition adapters.
4. Coding: connect repo primitives to platform file/shell inspect/edit/test/diff evidence.
5. RPG/Real Works: wire contracts into conversation generation/verified scene commits.
6. Persistence: migrate remaining bounded/local legacy state where practical and reconcile Memory purge/import/export/recovery.
7. Android SAF/Keystore + real-device startup/storage/cancellation/offline/provider tests.
8. Protocol adapters only after underlying capability authority/contracts are verified.
9. Benchmark/eval expansion, specialist/UI campaigns, Android certification and final Red Team.
10. Only then may the complete product be called release-ready.
