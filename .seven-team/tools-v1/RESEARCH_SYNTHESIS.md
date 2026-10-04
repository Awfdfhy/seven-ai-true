# Seven Tool System v1 — Research Synthesis

Date: 2026-10-04
Status: ACTIVE DESIGN INPUT
Owners: A04, A07, A08, B09, B10, B07

## Executive decision

Seven should not model tools as a loose array of functions owned by the LLM.

The target architecture is:

Model request
→ Tool intent/call
→ **Reference Monitor**
→ schema validation
→ capability/grant validation
→ risk/approval policy
→ idempotency/replay guard
→ bounded executor
→ structured result
→ provenance/evidence
→ untrusted result returned to model

The LLM proposes actions. It never grants itself permissions and never decides whether a dangerous action is authorized.

## Evidence base

### Protocol / first-party
- MCP 2026-07-28 tools: https://modelcontextprotocol.io/specification/2026-07-28/server/tools
- MCP Tasks extension: https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks
- MCP TypeScript SDK v2: https://ts.sdk.modelcontextprotocol.io/v2/
- MCP 2026 migration/state-handles: https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28
- OpenAI function calling: https://developers.openai.com/api/docs/guides/function-calling
- OpenAI programmatic tool calling: https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling

### Evaluation
- Berkeley Function Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard
- ToolSandbox: https://arxiv.org/abs/2408.04682
- tau-bench: https://arxiv.org/abs/2406.12045

### Security
- AgentDojo: https://arxiv.org/abs/2406.13352
- AgentDyn: https://arxiv.org/abs/2602.03117
- Adaptive out-of-band defenses: https://arxiv.org/abs/2606.26479
- OWASP Agentic Top 10 2026: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
- OWASP Excessive Agency: https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
- OWASP Agent Control announcement: https://genai.owasp.org/2026/09/01/owasp-genai-security-project-unveils-2026-top-10-for-llm-applications-new-agent-control-standard-and-sponsors-as-community-tops-30000-members/

## Research conclusions

### 1. Strict schemas are a runtime contract, not prompt decoration

Every structured tool must have a bounded schema.
Unknown properties are rejected.
Enums should represent states that would otherwise be contradictory.
Schema validation must happen again application-side even if the model/provider supports strict structured output.

Seven will support:
- structured function tools
- text/custom tools only when their free-form nature is necessary
- output schemas where predictable
- bounded result sizes

### 2. Tool discovery must scale without flooding model context

Do not give every tool to every turn.

Use:
request intent
→ capability graph
→ candidate namespaces
→ relevant tools only

Deferred discovery/tool search is preferable to loading huge schemas permanently.

### 3. Permissions belong outside the model

A tool definition and a permission are different objects.

Example:
- tool exists: github.create_file
- model may know it exists
- user/session grant may allow github.read
- create_file remains denied

The model cannot convert read permission into write permission through reasoning or tool-result content.

### 4. Separate risk from functionality

Tool descriptors need deterministic annotations:
- effect: PURE / READ / WRITE / DESTRUCTIVE / EXTERNAL
- idempotency: IDEMPOTENT / REPLAY_GUARDED / NON_IDEMPOTENT
- sensitivity: PUBLIC / USER_DATA / SECRET_ADJACENT
- approval: NEVER / IF_MUTATING / ALWAYS
- reversibility: REVERSIBLE / COMPENSATABLE / IRREVERSIBLE
- scope: room / session / app / external account

Risk policy uses these annotations; model descriptions do not.

### 5. Approval must bind exact arguments

"Approve sending an email" is too weak.

Approval proof must bind:
- tool id
- canonical args hash
- scope/account
- expiration
- calling room/task
- risk classification

Changing recipient/path/amount after approval invalidates approval.

### 6. Side effects require replay safety

Network retries, process restore, provider retries or duplicate model output can repeat tool calls.

Seven must give every invocation a callId and idempotency key.
For non-idempotent tools:
- duplicate callId returns prior result
- changed args with same idempotency key are rejected
- uncertain effect is a first-class state, not silently retried

### 7. Cancellation is part of correctness

MCP Tasks 2026 models durable execution and cancellation for long work.
Seven baseline needs:
- AbortSignal for every handler
- timeout
- CANCEL_REQUESTED / CANCELLED / SUCCEEDED / FAILED / EFFECT_UNKNOWN
- late completion cannot mutate a cancelled Seven task unless the external side effect already happened and is recorded as such

### 8. Tool results are untrusted data

Result content may contain prompt injection.

Tool output:
- cannot change permission policy
- cannot request a new grant by text alone
- is marked UNTRUSTED_EXTERNAL unless generated locally from trusted runtime state
- is size-bounded
- can carry structured evidence/provenance separate from model-visible prose

### 9. Stateful evaluation matters

A syntactically valid call is not enough.

ToolSandbox and tau-bench motivate checks on:
- correct final state
- insufficient-information handling
- state dependencies
- canonicalization
- policy adherence
- repeated reliability (pass^k)
- recovery after failure

### 10. Security must assume the model can be fooled

AgentDojo/AgentDyn show indirect prompt injection remains material.
Seven security therefore uses a deterministic reference monitor and least privilege.
Prompt-based "remember not to do dangerous things" is not a security boundary.

## Seven Tool Runtime v1 contracts

### ToolDefinition
- id / namespace / title / description / version
- strict input schema
- optional output schema
- capability requirements
- risk annotations
- timeout
- max result bytes
- concurrency group

### ToolGrant
- grantId
- allowed capabilities/tool ids
- scope
- issuedAt / expiresAt
- account/resource constraints
- source: user/system/admin
- cannot be created by tool output

### ToolInvocation
- callId
- taskId / roomId
- toolId + toolVersion
- canonical args
- argsSha256
- idempotencyKey
- requestedAt

### ToolApproval
- approvalId
- invocation fingerprint
- expiresAt
- one-shot/reusable policy

### ToolResult
- callId
- status
- structured output
- bounded model-visible summary
- provenance
- effect certainty
- started/completed timestamps
- error category
- retryability

## Non-negotiable invariants

1. No execution before schema validation.
2. No execution before capability/grant validation.
3. Approval is argument-bound.
4. A tool cannot grant itself or another tool permissions.
5. Result text cannot modify authority.
6. Non-idempotent effects are never blindly retried.
7. Cancel/timeout behavior is deterministic.
8. Every side effect has an audit record.
9. Tool output is bounded before entering model context.
10. Secrets are redacted from logs/evidence/model context.
11. Room/task ownership is preserved.
12. Unknown/unsupported tools fail closed.
13. Uncertain external effect becomes EFFECT_UNKNOWN.
14. Tool registry identities are stable and versioned.
15. Evaluation compares resulting system state, not only call syntax.

## What Seven should not do

- expose all tools all the time
- let the model approve itself
- reuse broad account credentials for every tool
- store raw secret-bearing args in normal logs
- retry a send/delete/pay/publish action because the network response was ambiguous
- trust MCP server display metadata for security decisions
- let tool result text invoke another privileged tool without a fresh policy check
- treat "tool call JSON parsed" as success
