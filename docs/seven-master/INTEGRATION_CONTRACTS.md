# Seven AI — Integration Contracts

This file is the compatibility boundary between specialist chats.

## Core Contracts

### Model Layer
Must expose a stable request/response abstraction independent of provider-specific payloads.

### Memory Layer
Must support:
- write/update
- retrieve/search
- relevance ranking
- provenance/metadata
- deletion/forget semantics
- context-budget-aware retrieval

### Tool Layer
Must support:
- tool discovery/registry
- schema validation
- permission/safety checks
- execution result normalization
- error propagation
- retry policy
- audit trail

### Coding System
Must consume Files + Tools and provide:
- repository inspection
- plan generation
- targeted edits/patches
- test/build invocation
- failure diagnosis
- verification report
- Git-aware change tracking

### Self-Development
Must never bypass Coding System verification.
Improvement loop:
Observe → Diagnose → Propose → Patch → Test → Compare → Accept/Reject → Record

### RPG System
Must use Memory through public memory interfaces; it must not create a separate hidden memory architecture unless explicitly approved.

## Contract Change Procedure
1. Propose change.
2. Identify affected systems.
3. Add decision entry.
4. Update this file.
5. Run integration tests.
6. Update CURRENT_STATUS.md.
