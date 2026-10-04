# Seven AI — System Registry

Last verified against: `integration/verification-v1` (PR #103), 2026-10-05.

| System | Remake implementation | Production composition | Verification state | Status |
|---|---|---|---|---|
| Chat Core | `application/chat/chat-service.ts` | SevenRuntime + App UI | unit/integration/stress | STRONG / active |
| Model Routing | ModelRegistry + ModelRouter + ProviderHealthTracker + RoutedChatTransport | **wired in Integration Batch 02** | fallback/cooldown/context + CI | INTEGRATED CORE |
| Memory | MemoryFabric + retrieval/query rewrite + context summarization | wired into Core Chat | memory/context/tool integration tests | INTEGRATED CORE / broader audit open |
| Files / Attachments | AttachmentService + IndexedDB repository | **not wired to SevenRuntime/UI** | component + historical phase tests | PARTIAL |
| Web Research | ResearchService + repository contracts | **no concrete production source/synthesizer in SevenRuntime** | component/phase tests | PARTIAL / NOT PRODUCT-WIRED |
| Deep Think | two-pass DeepThinkTransport | **not selected by production Chat runtime** | component/phase tests | PARTIAL / NOT PRODUCT-WIRED |
| Tools | Registry + planner + authority + executor + ledger + approvals | read tools + memory mutation wired | tool suites + runtime composition | INTEGRATED CORE |
| Coding System | contracts/legacy/release work exists outside Remake runtime | no first-class Remake Coding orchestrator | external/specialist evidence | GAP IN REMAKE PRODUCT |
| Self-Development | GitHub auth + bounded mutation service | not product UI-wired; now requires Coding verification port | Phase8 + manager tests | FAIL-CLOSED FOUNDATION |
| RPG | structured canon snapshots + CAS/checksum repository | not SevenRuntime/chat-memory orchestrated | phase9/manager persistence tests | PARTIAL |
| Android/Capacitor | typed bridge + platform service + release pipeline | wired when native transport exists | Android 14/16 workflow | ACTIVE GATE |
| Observability | DiagnosticsBuffer + task/model traces | wired for TaskManager + model routing | CI regression | PARTIAL / expanding |
| Integration | PR #103 | cross-system working branch | Remake CI green; Android pending at this checkpoint | ACTIVE |

### Product truth rule
"Implementation exists" is not equivalent to "production-integrated." A system is product-integrated only when it is reachable through SevenRuntime/application orchestration and has evidence on the same code path.

### Canonical product line
The executable TypeScript/Capacitor product currently lives under `remake/` on `seven-remake-v3`. The repository `main` branch contains newer coordination/release documents and legacy/runtime surfaces, but it is not by itself the current Remake application composition root.
