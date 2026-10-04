# Seven Tools v1 — Implementation Evidence

Status: FINAL PRODUCT GATES PENDING
Product branch target: seven-remake-v3
Current final Tools merge SHA: 6a8a16b31a6ccca1f5b412e71a15e55adb4cf162

## Proven merged layers

### Capability / authority kernel
- versioned ToolRegistry
- strict Zod input/output schemas
- scoped ToolGrant capability model
- deterministic ReferenceMonitor outside the model
- runtime-clock authorization
- exact argument-bound approvals
- one-shot approval handling
- stable invocation fingerprinting

### Safe executor
- callId / idempotencyKey
- replay protection
- durable execution/effect ledger
- explicit markEffectStarted boundary
- pre-effect retry vs post-effect EFFECT_UNKNOWN
- timeout/cancellation through TaskManager
- concurrency groups
- bounded output validation
- content-free audit metadata

### Discovery / model integration
- capability graph
- bounded risk-aware discovery
- provider tool planner restricted to pure/read tools
- unknown/mutating tool requests fail closed
- read-only ToolOrchestrator
- untrusted tool evidence injected into chat with explicit data boundary

### Built-in tools
- memory.search
- memory.list
- rooms.search
- memory.set_tier with exact approval
- memory.forget with exact approval

File/attachment tools are intentionally deferred because the attachment repository/service is not yet wired into the live Seven runtime. D03 does not create a fake empty file tool surface; that dependency belongs to the Files/Attachments domain.

### Adversarial evaluation
Merged adversarial gate covers:
- room/task scope leakage
- tool-id restriction bypass
- expired grant with forged requestedAt
- unknown/hallucinated tool ids
- malformed/oversized output
- pre-effect cancellation
- prompt injection in tool results
- secret-adjacent result redaction
- provider attempts to promote mutating tools
- malicious tool descriptions / catalog isolation

Replay, changed-args, one-shot approval and restart/effect-state behavior are covered by kernel/ledger tests.

### MCP 2026 boundary
- local allowlist only
- remote annotations do not determine local risk
- local trust classification
- untrusted servers cannot import effectful tools
- effectful imported tools require ALWAYS approval
- strict fail-closed JSON Schema subset
- 2026-07-28 version policy
- legacy rejection when policy disallows it
- bounded tools/list TTL cache
- conservative private cache default
- MCP Tasks polling/cancellation foundation
- input_required/requestState fails closed without parsing/logging/echoing opaque state
- serverInfo/clientInfo are not used for authority/security decisions

MCP network transport/account configuration remains a later connector/network integration concern; D03 defines and verifies the trusted port/runtime boundary.

## Gate evidence already green before final merge

- Tools hardening PR: Remake CI PASS, Seven AI tests PASS, Android 14 PASS, Android 16 PASS.
- Adversarial eval PR: Remake CI PASS, Seven AI tests PASS, Android 14 PASS, Android 16 PASS.
- MCP PR final candidate eac663b: Remake CI PASS, Seven AI tests PASS, Android 14 PASS, Android 16 PASS.

## Final closure gate

D03 may be marked PROVEN only when the merged product SHA
6a8a16b31a6ccca1f5b412e71a15e55adb4cf162
passes:
- Remake CI
- Android Release Gate
- Reality Lab exact-build evidence

Until then, status remains FINAL PRODUCT GATES PENDING.
