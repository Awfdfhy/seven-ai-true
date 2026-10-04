# Seven AI — System Registry

| System | Owner Chat | Status | Depends On | Primary Validation |
|---|---:|---|---|---|
| Chat Core | Master | Existing | Models | conversation regression |
| Model Routing | Master | Existing | Providers | routing/eval matrix |
| Memory | 1 | Active/Iterative | Chat Core, Storage | retrieval/retention tests |
| Files | Master | Existing/Iterative | Tools | parse/read/write tests |
| Web Research | 2 | Active/Iterative | Tools, Models | source quality + synthesis |
| Deep Think | Master | Existing/Iterative | Models, Routing | reasoning quality + latency |
| Tools | 3 | Current focus completed/iterative | Routing, Safety | tool-selection + execution tests |
| Coding System | 4 | NEXT | Tools, Files, Git | patch/build/test benchmark |
| Self-Development | 5 | Planned | Coding, Tools, Git, Verification | sandboxed improvement loop |
| RPG System | 6 | Planned | Memory, Tools, Models | continuity/state simulations |
| Integration | 7 | Continuous | All systems | end-to-end/regression |
| Android/APK/UI | 8 | Continuous | Integrated app | build/install/device tests |

## Ownership Rule
Ownership means primary responsibility, not exclusive access. Cross-system changes require contract review.
