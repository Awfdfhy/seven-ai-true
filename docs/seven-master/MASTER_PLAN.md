# Seven AI — Multi-Chat Master Plan

## Purpose
Use multiple focused ChatGPT conversations without losing architectural consistency.

## Source of Truth
GitHub is authoritative. Chats are workers, not the permanent memory of the project.

## Chat Topology
0. Master / Control Center
1. Memory
2. Web Research
3. Tools
4. Coding System
5. Self-Development
6. RPG System
7. Integration + Verification
8. Android / APK / UI

## Global Development Order
Chat Core → Model Routing → Memory → Files → Web Research → Deep Think → Tools → Coding System → Self-Development → RPG → Integration → Android/APK/UI

## Rules
- One subsystem per specialist chat.
- Shared interfaces are changed only through INTEGRATION_CONTRACTS.md.
- Every meaningful decision is logged in DECISIONS.md.
- Every work session ends by updating CURRENT_STATUS.md.
- Never claim a subsystem complete without tests/evidence.
- Integration chat validates cross-system compatibility.
- Master chat decides priorities and resolves conflicts.

## Definition of Done for Any Subsystem
1. Research / requirements complete.
2. Architecture documented.
3. Implementation complete.
4. Unit/component tests pass.
5. Integration tests pass.
6. Regression checks pass.
7. Known limitations documented.
8. CURRENT_STATUS.md updated.
