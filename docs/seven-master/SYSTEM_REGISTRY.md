# Seven AI — System Registry

| System | Owner Chat | Status | Depends On | Primary Validation |
|---|---:|---|---|---|
| Chat Core | Master | Existing / hardening | Models, Storage | conversation + state regression |
| Model Routing | Master | Existing / hardening | Providers, Runtime health | routing/eval matrix |
| Memory | 1 | Active / iterative | Chat Core, Storage | retrieval, isolation, retention |
| Files | Master | Existing / iterative | Tools, Storage | parse/read/write + size/type gates |
| Web Research | 2 | Active / iterative | Tools, Models, Network | evidence/citation/freshness tests |
| Deep Think | Master | Existing / iterative | Models, Routing, Context | quality + latency + cancellation |
| Tools | 3 | Existing / hardening | Runtime, Permissions | schema + authorization + execution |
| Coding System | 4 | Merged + post-merge verified on `seven-remake-v3` / PR #104 | Tools, Files, Git, Model Routing, Research | exact-SHA inspect/patch/CI/Android/Git E2E |
| Self-Development | 5 | Existing / verification | Coding, Tools, Git, Verification | bounded improve/test/accept loop |
| RPG System | 6 | Active implementation / verification | Memory, Models, World/Canon state | continuity + knowledge-boundary + isolation + persistence |
| Integration | 7 | ACTIVE | All systems | contract/E2E/failure/regression |
| Android/APK/UI | 8 | Continuous | Integrated app, Capacitor/WebView | build/install/device tests |

## Ownership Rule
Ownership means primary responsibility, not exclusive access. Cross-system changes require contract review.

## Verification Rule
Existing means code exists. It does not mean acceptance-ready. Completion is gated by evidence in CI/device runs and the Integration Acceptance Gate.
