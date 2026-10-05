# Seven AI — Integration + Verification Audit

Date: 2026-10-05
Product base: `seven-remake-v3`
Working branch: `integration/verification-v1` / PR #103

## 1. Executable dependency map

```
App.tsx
 ├─ ShellStore / ThemeService
 ├─ ChatService
 │   ├─ TaskManager
 │   ├─ RoomRepository
 │   └─ MemoryFabricService.observeUserMessage
 ├─ ModeAwareChatTransport
 │   ├─ RoutingChatTransport
 │   │   ├─ ModelRegistry / ModelRouter / ProviderHealthTracker
 │   │   └─ RoutedChatTransport
 │   │       ├─ IntegratedChatContextSource
 │   │       │   ├─ Memory context/retrieval
 │   │       │   ├─ ToolOrchestrator read evidence
 │   │       │   └─ Attachment context
 │   │       └─ ProviderAdapter
 │   └─ DeepThinkTransport (planner → final)
 └─ ToolApprovalCoordinator → ToolExecutor / Authority / mutation tools

Coding V1 shared infrastructure
 ├─ CodingAgentService / routed coding agent
 ├─ exact-SHA WorkspaceTruth + repository intelligence
 ├─ transactional patch/review/verification
 ├─ Tool-backed repository port
 ├─ GitHub coding repository adapter
 └─ GitHub Actions verification port

Implemented but still not fully product-dispatched:
 ResearchService → concrete production Web source/synthesizer missing
 Coding Build workspace / Self-Development → verified Coding runtime adoption still requires product composition
 RpgCanonService → shared Memory/Chat turn transaction incomplete
 PDF Attachment parser → disabled
```

## 2. Contract audit

| Contract | Status | Evidence / gap |
|---|---|---|
| Model abstraction | PASS core | provider-independent ProviderAdapter |
| Model routing | PASS core | production registry/router/health/fallback; route recalculated per turn |
| Chat + Memory | PASS core | write observer + bounded retrieval/context |
| Chat + Tools | PASS core scope | read evidence + explicit mutation approval |
| Files | PASS TXT / PARTIAL PDF | text ingest/restart/concurrent room isolation wired; PDF parser absent |
| Research/Web | PARTIAL | orchestration/cache/failure semantics exist; production Web source missing |
| Deep Think | PASS core / PARTIAL provider diversity | real two-pass per-room dispatch; same bootstrap provider currently |
| Coding | PASS specialist / PARTIAL product composition | V1 exact-SHA/patch/test/review/Git/Tools implementation is upstream-verified; Build UI/runtime adoption open |
| Self-Development | SAFE PARTIAL | cannot mutate before valid Coding evidence; product verifier adoption open |
| RPG | PARTIAL | checksum/CAS/continuity strong; shared Memory/Chat transaction open |
| Cancellation | PASS tested core | per-room/request cancellation + late-result rejection + cross-owner isolation |
| Error taxonomy | PASS core / broader tagging open | requested public taxonomy present; Kilo rate/network/malformed semantics covered |
| Observability | PASS core / broader subsystem timings open | bounded redacted task/model/tool traces; model TTFT and durations |
| State isolation | PASS tested Chat UI/core scope | per-room run/draft/error/composer/approval state; active restart + independent tasks |
| Storage lifecycle | PASS composed core | AppKernel owns composed repositories |
| Android | PASS baseline / FINAL SHA OPEN | c66 exact-SHA Android 14/16 gate passed; reconciliation merge must rerun |

## 3. Closed reproducible defects in this Integration line

| Severity | Defect | Repair |
|---|---|---|
| HIGH | production Chat bypassed ModelRouter | canonical routed transport promoted and composed |
| HIGH | Self-Dev could mutate without Coding verification | fail-closed verification before credentials/mutation |
| HIGH | Research/Build/RPG workspace selection silently used normal Chat | uncomposed workspaces fail closed |
| HIGH | background completion could force-select its old room | completion now updates only origin room data |
| HIGH | global UI generation state blocked/contaminated independent rooms | run/draft/error/composer state keyed by room |
| MEDIUM | Tool approval result could be projected into current non-origin room | PendingToolAction carries origin room and UI/result are room-scoped |
| MEDIUM | Kilo 429/network/malformed stream semantics were incomplete | structured RATE_LIMIT/NETWORK metadata; malformed JSON fails explicitly |
| MEDIUM | provider error body could reach user-facing error text | raw upstream body removed; public taxonomy presentation used |
| MEDIUM | invalid reduced-motion CSS selector emitted build warning | selector/media rule split into valid CSS |
| MEDIUM | routing metrics consulted timing clock when metrics/health were absent | timing is side-effect free unless observer/health requires it |

No zero-bugs claim is made.

## 4. Failure / concurrency evidence

Permanent regression evidence covers:
- normal multi-turn Chat;
- provider fallback only before meaningful output;
- network loss and partial Research-source failure;
- rate limit and malformed provider JSON/SSE;
- cancellation during/after work and independent-owner isolation;
- active restart preserving committed user turn without partial assistant commit;
- IndexedDB restart recovery;
- simultaneous attachment writes across rooms;
- 100-revision RPG continuity;
- 2,000-message bounded context;
- per-room generation/composer/tool-approval UI ownership.

## 5. Performance and observability

Runtime diagnostics expose:
- total TaskManager task duration;
- model attempt duration and TTFT;
- tool execution duration;
- route/provider/model identifiers and normalized failure categories without prompt/output bodies.

CI performance budgets cover:
- 2,000 routing decisions over a 256-model catalog;
- repeated 2,000-message context assembly;
- 1,000 independent TaskManager operations.

These are regression budgets, not live provider/network SLA measurements. Live provider quality/TTFT and broader memory/web/storage/startup latency measurements remain separate acceptance evidence.

## 6. Final acceptance gate

- [x] Core routing/memory/tool contracts share production code paths.
- [x] Cross-system regression suite exists.
- [x] Failure injection includes network/rate-limit/malformed provider data/restart/concurrency.
- [x] Chat request state isolation and cancellation are verified in tested scope.
- [x] Production web build has passed on Integration staging.
- [x] Baseline Android 14/16 gate passed on `c66d979`.
- [x] Coding V1 specialist implementation has exact-SHA post-merge CI/Android evidence upstream.
- [ ] Coding V1 reconciled into Integration lineage and final same-SHA gates PASS.
- [ ] Build workspace + Self-Development use the verified Coding runtime end-to-end.
- [ ] Production Research Web source/synthesis composition verified.
- [ ] PDF parser production adapter verified.
- [ ] RPG + shared Memory + Chat transactional orchestration verified.
- [ ] Final reconciliation SHA Remake CI + Seven AI + Android 14/16 PASS.
- [ ] Live-provider quality/TTFT and remaining subsystem performance evidence accepted.

Verdict: **NOT YET FULLY INTEGRATED**.
