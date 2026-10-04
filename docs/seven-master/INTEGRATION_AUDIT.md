# Seven AI — Integration + Verification Audit

Date: 2026-10-05
Product base: `seven-remake-v3`
Working evidence branch: `integration/verification-v1` / PR #103

## 1. Executable Dependency Map

```
App.tsx
 ├─ ShellStore / ThemeService
 ├─ ChatService
 │   ├─ TaskManager
 │   ├─ RoomRepository (IndexedDB)
 │   └─ MemoryFabricService.observeUserMessage
 ├─ RoutingChatTransport
 │   ├─ ModelRegistry
 │   ├─ ModelRouter
 │   ├─ ProviderHealthTracker
 │   └─ RoutedChatTransport
 │       ├─ IntegratedChatContextSource
 │       │   ├─ MemoryFabricService retrieval
 │       │   ├─ MemoryContextService / ContextBuilder / Summarizer
 │       │   └─ ToolOrchestrator read evidence
 │       └─ ProviderAdapter (Kilo in current runtime)
 └─ ToolApprovalCoordinator
     ├─ ToolRegistry / ToolExecutor / Authority
     └─ memory mutation tools

AppKernel
 ├─ memory legacy migration
 ├─ tool ledger lifecycle
 ├─ runtime storage lifecycle
 └─ theme lifecycle

Implemented but not currently composed into normal product dispatch:
 AttachmentService → AttachmentRepository
 ResearchService → ResearchSource[] + ResearchSynthesizer + ResearchRepository
 DeepThinkTransport → planner/final ProviderAdapter + context source
 GitHubSelfDevService → CodingVerificationPort → GitHubAuth → GitHubMutationPort
 RpgCanonService → RpgRepository(CAS/checksum)
```

## 2. Shared State / Ownership
| State | Owner | Scope | Risk |
|---|---|---|---|
| active tasks | TaskManager | owner/task | low-moderate; stress coverage exists |
| rooms/messages | RoomRepository | room | guarded by room IDs and immutable commits |
| durable memory | MemoryFabricRepository | global/room scopes | cross-room tests required continuously |
| context summaries | MemoryRepository | room summary | separate IndexedDB; now lifecycle-owned |
| provider health | ProviderHealthTracker | provider | recalculated into every route |
| tool ledger | IndexedDbToolExecutionLedger | execution | lifecycle-owned |
| RPG canon | RpgRepository | RPG snapshot ID | not yet joined to chat/memory turn |
| shell workspace | ShellStore | UI process | now prevented from silent Core dispatch |

## 3. Contract Audit
| Contract | Status | Evidence / Gap |
|---|---|---|
| Model abstraction | PASS core | ProviderAdapter contract independent of Kilo payload |
| Model routing | PASS core path | production runtime now uses registry/router/health/fallback |
| Chat + Memory | PASS core path | memory retrieval/context assembly + write observer are wired |
| Chat + Tools | PASS read/memory-mutation scope | untrusted evidence + explicit mutation approval |
| Files | PARTIAL | service/repository exist; normal runtime/UI composition missing |
| Research/Web | PARTIAL | orchestration/cache/failure model exist; concrete production Web source missing |
| Deep Think | PARTIAL | two-pass implementation tested; not selected by production runtime |
| Coding | MISSING/PARTIAL | no first-class Remake Coding orchestrator in current product composition |
| Self-Development | PARTIAL / SAFE | mutation path now requires Coding verification; no product-level Coding provider |
| RPG | PARTIAL | checksum/CAS/persistence strong; Memory/chat orchestration absent |
| Cancellation | PASS for core tested paths | Chat/Task/Android historical tests; more workspace E2E still needed |
| Error taxonomy | PARTIAL | common mapper exists; domain tagging coverage incomplete |
| Observability | PARTIAL+ | bounded redacted diagnostics + task/model traces now wired |
| Storage lifecycle | PASS for composed core | room/memory/context/tool storage shutdown owned by AppKernel |
| Android | PENDING | workflow started; final same-line result required |

## 4. Reproducible Bug Ledger
| Severity | Reproduction | Root cause | Fix | Verification |
|---|---|---|---|---|
| HIGH | production Chat ignored ModelRouter | routed transport lived only in integration code | promoted canonical transport + Runtime routing composition | CI 420/420 |
| HIGH | Self-Dev could call mutation without Coding verification | GitHubSelfDevService depended directly on auth+mutation | mandatory fail-closed Coding evidence gate | Phase8/manager tests + CI |
| HIGH | selecting Research/Build/RPG then sending used normal Chat | App changed workspace styling only | workspace dispatch now fails closed until adapter exists | source/runtime guard; next UI E2E pass |
| MEDIUM | room/memory/context DB handles not Kernel-owned on shutdown | incomplete composition lifecycle | runtime-storage Kernel service closes them | typecheck/tests; restart/device still tracked |
| MEDIUM | public error categories not represented in Remake core | internal codes only | `classifySevenError` public taxonomy mapper | unit tests |
| MEDIUM | routed fallback implementation duplicated under Phase12 | integration helper became parallel implementation | Phase12 now re-exports production transport | architecture + full regression |

At this checkpoint: **0 known reproducible BLOCKER bugs in the tested core scope**. This is not a claim of zero bugs overall. HIGH gaps remain and prevent acceptance.

## 5. Failure / Concurrency Evidence Already Present
- fallback before first meaningful token;
- failure after meaningful output cannot splice providers;
- provider cooldown exclusion;
- cancellation during context preparation;
- cancellation after partial assistant draft leaves no completed assistant message;
- hundreds of TaskManager tasks/cancellations and concurrent rooms in stress tests;
- IndexedDB blocked/version-change/corruption tests across domain repositories;
- GitHub credential secrecy and shared refresh isolation;
- RPG CAS/revision/checksum/restart behavior;
- Android request ID + cancellation bridge historical release gate.

Still required in this integration branch: app restart during active operation, malformed live provider framing at runtime boundary, explicit rate-limit recovery route, simultaneous file operations, full long-session benchmark, and workspace-specific E2E once adapters are composed.

## 6. Integration Scorecard
Scores are evidence-weighted, not completion percentages.

| System | Functional | Integrated | Tested | Regression Safe | Performance | Status |
|---|---:|---:|---:|---:|---:|---|
| Chat Core | 92 | 90 | 94 | 92 | 82 | STRONG |
| Model Routing | 92 | 90 | 92 | 90 | 84 | STRONG CORE |
| Memory | 92 | 88 | 92 | 88 | 78 | STRONG CORE |
| Files | 82 | 35 | 78 | 72 | 70 | PARTIAL |
| Web Research | 84 | 30 | 82 | 75 | 68 | PARTIAL |
| Deep Think | 86 | 35 | 84 | 78 | 60 | PARTIAL |
| Tools | 92 | 88 | 92 | 88 | 80 | STRONG CORE |
| Coding | 65 | 25 | 55 | 55 | 60 | GAP IN REMAKE |
| Self-Development | 72 | 35 | 78 | 76 | 65 | SAFE FOUNDATION |
| RPG | 82 | 35 | 84 | 80 | 70 | PARTIAL |
| Android/APK | 90 | 85 | 88 | 85 | 75 | GATE RUNNING |
| Observability | 78 | 72 | 70 | 75 | 85 | IMPROVED / PARTIAL |

## 7. Final Acceptance Gate
- [x] Core route/memory/tool contracts use production code paths.
- [x] Remake strict typecheck passes.
- [x] Remake full tests pass (420/420 at Batch 02 checkpoint).
- [x] Production web build passes.
- [x] Self-Development cannot bypass Coding verification.
- [x] Unwired workspace requests fail closed rather than contaminate Core Chat.
- [ ] Attachments/Files product composition verified.
- [ ] Research Web source + synthesis product composition verified.
- [ ] Deep Think production dispatch verified.
- [ ] Coding orchestrator product path verified.
- [ ] RPG + Memory + Chat transactional orchestration verified.
- [ ] latest Android build + API34/API36 device gates PASS on final SHA.
- [ ] performance benchmark suite completed.
- [ ] no known CRITICAL bugs in the full tested scope.

Verdict: **NOT YET FULLY INTEGRATED**.
