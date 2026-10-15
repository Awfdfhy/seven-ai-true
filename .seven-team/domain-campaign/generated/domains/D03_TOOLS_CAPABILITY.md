# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested 20 (primary=17): MCP 2026-07-28 tools/tasks, OpenAI function/tool calling updates, BFCL V4, ToolSandbox/τ-bench for stateful interactive eval, AgentDojo/AgentDyn for prompt injection/defenses in dynamic envs. OWASP GenAI 2026 Top 10 and LLM06 Excessive Agency emphasize least privilege, capability scoping, permission boundaries, tool execution gating. MCP TS SDK migration notes point to evolving protocol. Common: tools must be gated by permissions and lifecycle-aware (cancellable). Disagreements: programmatic vs model-driven tool selection tradeoffs. Freshness current. Limitations: benchmarks focus on correctness/security, less on cancellation races/stress under load.

CURRENT=TaskManager enforces lifecycle, owner isolation, exclusiveOwners (reservation), timeout->deadline, sanitized errors. No explicit tool registry/capability graph/permission model visible in inspected files. Owners include B09.

TARGET=Tool execution gated through TaskManager with capability scoping per owner, permission checks, and cancellable tool calls. Enforce OWASP Excessive Agency (least privilege, human-in-loop where high-impact) and MCP tool schemas. Tool results must not leak across owners; cancellation propagates to tool (AbortSignal). Capability graph maps tools->owners->permissions.

NOW=Define ToolTaskSpec extending TaskSpec with requiredCapabilities[] and permissionSet. Gate run() by capability availability per owner (pre-check) before creating task. Ensure tool executors receive TaskContext.signal and respect seals. Add audit event emission (taskId, tool, owner, status) – non-blocking.

NEXT=Capability graph (owner->tool->scopes) with validation; MCP tool registry integration (tools spec 2026-07-28); tool execution sandboxing boundaries. Add rate limits per owner. Map errors to sanitized SevenError types.

LATER=Adversarial eval via AgentDojo/AgentDyn patterns (prompt injection resilience), BFCL-style correctness, ToolSandbox/τ-bench for interactive flows. Dynamic permission revocation on cancellation/seal.

TESTS=Deterministic: tool cancelled mid-execution -> AbortError propagated as CANCELLED, no cross-owner tool result leakage, capability check fails before task creation. Adversarial: excessive agency attempts blocked, prompt injection in tool args handled. Eval: BFCL subset, ToolSandbox stateful cases.

RISKS=Excessive agency (LLM06), prompt injection (AgentDojo), permission creep, tool execution races, TOCTOU on permission checks, cross-system bridge abuse.

FIRST_SLICE=Capability-gated TaskSpec + pre-check before run() with owner-scoped allowlist; ensures tools execute only under valid task with AbortSignal. Deterministic tests for gating and cancellation.

KNOWN_UNKNOWNS=Seven’s tool registry location, MCP server inventory, concrete permission model. Integration with bridge/kernel owners.

DOMAIN_VERDICT=READY_FOR_PLAN
