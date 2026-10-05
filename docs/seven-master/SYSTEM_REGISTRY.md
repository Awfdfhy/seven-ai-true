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
| Coding System | 4 | **Verified candidate / merge pending** | Tools, Files, Git, Models, Research | inspect/patch/test/build/Git/Android E2E |
| Self-Development | 5 | Existing / verification | Coding, Tools, Git, Verification | bounded improve/test/accept loop |
| RPG System | 6 | Active implementation / verification | Memory, Models, World/Canon state | continuity + knowledge-boundary + isolation + persistence |
| Integration | 7 | ACTIVE | All systems | contract/E2E/failure/regression |
| Android/APK/UI | 8 | Continuous | Integrated app, Capacitor/WebView | build/install/device tests |

## Ownership Rule
Ownership means primary responsibility, not exclusive access. Cross-system changes require contract review.

## Verification Rule
Existing means code exists. It does not mean acceptance-ready. Completion is gated by evidence in CI/device runs and the Integration Acceptance Gate.

## Coding V1 Candidate
Branch: `coding-system-v1`  
Verified code-bearing SHA: `371db3e45aea21fd1f0d191ff88542d64c914490`

Evidence:
- Seven Remake V3 CI #407 — SUCCESS.
- Seven AI tests #3239 — SUCCESS.
- Seven Remake Android Release Gate #173 — SUCCESS, including APK identity plus installed Android 14 and Android 16 smoke gates.

The candidate implements the backend/runtime Coding lifecycle and remains merge/integration work until PR #104 is integrated into the product branch. End-user UI surfacing remains owned by Android/APK/UI.
