# Seven Tool System v1 — Execution Plan

## Phase 1 — Capability Kernel
- ToolDefinition v1
- strict schema validator
- ToolRegistry with stable identities/versioning
- CapabilityGraph
- ToolGrant / scoped permission model
- deterministic ReferenceMonitor
- risk annotations

Exit:
- invalid args fail before handler
- ungranted tools fail closed
- result text cannot escalate permission

## Phase 2 — Safe Executor
- callId / idempotencyKey
- duplicate/replay ledger
- argument-bound approval
- AbortSignal / timeout
- concurrency groups
- result-size limits
- structured error taxonomy
- EFFECT_UNKNOWN state
- immutable audit records

## Phase 3 — Model integration
- provider-independent ToolCall / ToolResult contracts
- Kilo route support if protocol/model supports function calling
- bounded fallback for models without native tools
- tool-result provenance in chat
- Stop cancels in-flight local execution

## Phase 4 — Built-in local tools
Start with low-risk tools:
- calculator-like deterministic utilities
- local memory lookup/control
- room/history search
- file metadata/read-only extraction

Then:
- web/research
- file write/export
- GitHub/self-development

Mutating/external tools require stronger grants/approvals.

## Phase 5 — MCP 2026
- MCP client adapter
- protocol version negotiation
- list TTL/cache
- 2026 request state handles
- Tasks extension support
- MCP server trust classification
- OAuth/auth boundary
- no security decisions from self-reported serverInfo/clientInfo

## Phase 6 — Evaluation
Seven Tool Eval inspired by BFCL, ToolSandbox, tau-bench, AgentDojo:
- exact argument validity
- missing-information abstention
- parallel independent calls
- sequential state dependency
- duplicate replay
- timeout/cancel
- tool unavailable
- stale grant
- approval argument mutation
- indirect prompt injection in tool result
- malicious tool description
- final-state correctness
- pass^k consistency
- Android lifecycle/process restore

Promotion targets:
- 100% fail-closed permission tests
- 100% destructive-action approval binding
- 0 duplicate side effects under replay corpus
- 0 permission escalation in adversarial corpus
- deterministic recovery classification
- exact-build Android evidence before production-ready claim
