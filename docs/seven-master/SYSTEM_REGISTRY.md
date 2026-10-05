# Seven AI — System Registry

Last reconciled for Integration: 2026-10-05.
Product base: `seven-remake-v3`.
Integration branch: `integration/verification-v1` / PR #103.

| System | Implementation truth | Product composition | Verification state | Status |
|---|---|---|---|---|
| Chat Core | `application/chat/chat-service.ts` + room persistence | SevenRuntime + App UI | unit/integration/stress + restart cases | STRONG / ACTIVE |
| Model Routing | ModelRegistry + ModelRouter + ProviderHealthTracker + canonical RoutedChatTransport | production Core Chat route | fallback/cooldown/context/TTFT traces | INTEGRATED CORE |
| Memory | Memory Fabric + retrieval/query rewrite + context summarization | Core Chat + tools/context | retrieval/isolation/restart/concurrency suites | INTEGRATED CORE |
| Files / Attachments | AttachmentService + IndexedDB + bounded context source | UTF-8 text wired to SevenRuntime/UI/context | room isolation + concurrent writes | TXT INTEGRATED / PDF PARTIAL |
| Web Research | ResearchService + repository/evidence contracts | no concrete production Web source/synthesizer in SevenRuntime | component + cross-system failure tests | PARTIAL / NOT PRODUCT-WIRED |
| Deep Think | two-pass DeepThinkTransport | per-room Deep Think flag via ModeAwareChatTransport | component/runtime routing tests | INTEGRATED CORE / MULTI-PROVIDER OPEN |
| Tools | Registry + planner + authority + executor + ledger + approvals | read tools + memory mutations + Coding repository Tool Fabric | adversarial/idempotency/approval suites | INTEGRATED CORE |
| Coding System | typed V1 under `application/coding/` + GitHub repository/Actions adapters; merged to base via PR #104 | specialist runtime exists; SevenRuntime/UI product dispatch reconciliation remains | exact-SHA CI + Android evidence on Coding merge line | IMPLEMENTED + VERIFIED / PRODUCT ADOPTION OPEN |
| Self-Development | GitHub auth + bounded mutation service | fails closed behind CodingVerificationPort before credentials/mutation | Phase8 + manager + malformed-evidence tests | SAFE FOUNDATION / ADOPTION OPEN |
| RPG | structured canon snapshots + CAS/checksum repository | not yet one shared Memory/Chat transactional turn path in Remake | long continuity/restart/isolation suites | PARTIAL |
| Android / Capacitor | typed bridge + platform service + release pipeline | wired when native transport exists | exact-SHA Android 14/16 gates | STRONG GATE / FINAL RECONCILIATION RUN OPEN |
| Observability | bounded redacted diagnostics + task/tool/model timings | runtime TaskManager/model/tool paths | deterministic TTFT/duration tests + perf budgets | INTEGRATED CORE |
| Integration | contract/E2E/failure/performance branch | PR #103 | permanent regression suite + final gates | ACTIVE |

## Ownership rule
Ownership means primary responsibility, not exclusive access. Cross-system changes require contract review.

## Product-truth rule
"Implementation exists" is not equivalent to "production-integrated." A system is product-integrated only when it is reachable through the intended SevenRuntime/application path and has evidence on that same path.

## Canonical product line
The executable typed TypeScript/Capacitor product lives under `remake/` on `seven-remake-v3`. Integration reconciles specialist changes into that product line and records exact-SHA evidence.
