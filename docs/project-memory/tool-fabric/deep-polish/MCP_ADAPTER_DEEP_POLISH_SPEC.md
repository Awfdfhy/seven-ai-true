# Seven Tool Fabric 2.0 — MCP Adapter / ToolInteropGateway Deep Polish

Date: 2026-09-13
Status: PROPOSED P0 DESIGN, NOT YET IMPLEMENTED OR FROZEN
Governing prompt: `MCP_ADAPTER_MAXIMUM_EFFORT_COMMAND.md`

## 1. Goal

Give Seven access to the MCP ecosystem without allowing an MCP server to become an authority boundary. Seven owns capability identity, permissions, side-effect classification, budgets, truth state, verification, lineage and user-visible status. MCP is transport/interoperability.

## 2. Current protocol facts used

Primary sources:
- https://blog.modelcontextprotocol.io/posts/2026-07-28/
- https://modelcontextprotocol.io/specification/draft/server/tools
- https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks
- https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28

Verified findings:
- MCP revision 2026-07-28 uses a stateless protocol core and removes the old mandatory initialize/session pattern for modern requests.
- requests carry protocol/client capability metadata; `server/discover` can be used for capability discovery.
- tools/list and related list/read responses can carry cache hints.
- tool schemas use JSON Schema 2020-12.
- tool annotations are explicitly untrusted unless the client has established server trust.
- tool names are only unique inside one server; aggregators need their own disambiguation strategy.
- Tasks are an extension for deferred/long-running tool execution, with get/update/cancel lifecycle.
- Roots, Sampling and Logging are deprecated in the current protocol generation; Seven should not build new core dependencies on them.

## 3. Existing Seven systems audited

### Task Contract
`hardening/task-contract.cjs` already provides:
- explicit allowed/denied capabilities
- task risk
- resource/network/tool-call/memory budgets
- evidence requirements
- verification requirements
- scope including files/projects/external domains
- explicit task state transitions

Decision: MCP must consume this envelope. It does not create a parallel permission model.

### Side Effect Ledger
`hardening/side-effect-ledger.cjs` already provides:
- PLANNED / ATTEMPTED / VERIFIED / FAILED / UNCERTAIN / RECONCILED / ROLLED_BACK
- mandatory idempotency key
- verification evidence requirement
- uncertain-side-effect reconciliation

Decision: every MCP operation classified by Seven as side-effecting goes through this ledger.

### Resource Governor
`hardening/resource-governor.cjs` already controls:
- Lite / Balanced / Full tiers
- context/memory/tool-call/concurrency budgets
- background/heavy capability policy

Decision: MCP discovery/calls are charged to these budgets and are lazy, not startup work.

## 4. Final proposed architecture

`Cognitive Control Plane`
→ `TaskContract capability check`
→ `ToolInteropGateway`
→ `Canonical Capability Registry`
→ `MCPAdapter`
→ `Transport/Auth`
→ external MCP server
→ `SchemaGuard`
→ `Result Normalizer`
→ `Truth/Lineage + SideEffect verification`
→ canonical Seven result

MCP is never exposed to the model as an unfiltered raw authority surface.

## 5. Identity model

Do not use remote server name as unique identity.

Seven server identity proposal:

`serverFingerprint = hash(origin + transport + authenticatedIssuer + configuredServerId + protocolFamily)`

Store separately:
- display name
- origin/endpoint
- transport
- protocol revision
- auth issuer/principal binding
- first seen / last seen
- trust tier
- observed server metadata
- capability catalogue version/hash

Canonical external tool identity:

`externalToolId = mcp:<serverFingerprint>:<remoteToolName>`

Canonical Seven capability remains vendor-neutral, for example:
- `web.search`
- `files.read`
- `calendar.event.create`

One canonical capability may have multiple adapters. One MCP tool may expose multiple normalized capabilities only through explicit Seven mapping.

## 6. Trust model

Default external server trust: `UNTRUSTED`.

Suggested trust tiers:
- UNTRUSTED
- USER_APPROVED
- VERIFIED_CONFIG
- MANAGED

Trust changes what metadata can be used as hints, but never bypasses TaskContract or SideEffectLedger.

Never accept remote declarations such as read-only, destructive, idempotent, safe, or verified as authority by themselves. They may be evidence for configuration review.

## 7. Capability normalization

For every discovered MCP tool Seven creates a normalized descriptor:

- canonical capability id
- external tool id
- server fingerprint
- remote name
- input schema hash
- output schema hash
- schema revision observation
- permission classes
- Seven side-effect class
- Seven idempotency policy
- risk floor
- network/domain scope
- estimated cost/latency class
- task support
- verification policy
- trust state
- provenance

Remote schema/metadata changes produce a new observed revision instead of silently mutating the old trusted mapping.

## 8. SchemaGuard integration

Use JSON Schema 2020-12 as the interchange schema, but compile trusted Seven-side validators where practical.

Rules:
- validate arguments before dispatch
- reject unknown/invalid required structure according to configured schema policy
- validate structured output where output schema is present
- preserve raw response separately for diagnostics/lineage if policy allows
- never pass malformed structured output into authoritative state
- schema hash is part of adapter provenance

If schema changes unexpectedly:
- mark mapping `SCHEMA_DRIFT`
- prevent sensitive/write use until revalidated
- read-only use may continue only if policy explicitly allows safe fallback

## 9. Permission mapping

Seven permission classes proposed:
- READ_LOCAL
- READ_REMOTE
- WRITE_LOCAL
- WRITE_REMOTE
- EXECUTE
- NETWORK
- UPLOAD
- DOWNLOAD
- DELETE
- RENAME
- EXTERNAL_ACCOUNT_ACTION
- USER_INTERACTION

A tool can require multiple classes.

Remote annotations cannot reduce Seven's required permissions.

## 10. Side-effect policy

Seven side-effect classes:
- NONE
- OBSERVATIONAL
- REVERSIBLE_WRITE
- IRREVERSIBLE_WRITE
- EXTERNAL_COMMUNICATION
- UNKNOWN_EFFECT

Rules:
- `NONE/OBSERVATIONAL`: retry may be allowed within budget if transport failure occurs and operation is Seven-approved as repeat-safe.
- writes/actions: create SideEffectLedger entry before dispatch.
- if request times out after dispatch and remote effect cannot be proved absent, mark `UNCERTAIN`.
- do not blindly retry an `UNCERTAIN` action.
- reconcile through a read/query/status capability where possible.
- only move to `VERIFIED` with evidence.

This preserves Seven's existing no-fake-success rule.

## 11. Idempotency

Do not infer idempotency from tool name or remote annotation alone.

Seven idempotency policies:
- SAFE_REPEAT
- KEYED_REPEAT
- DO_NOT_REPEAT
- UNKNOWN

Automatic retry is allowed only for:
- SAFE_REPEAT, or
- KEYED_REPEAT where the downstream tool supports a Seven-reviewed stable key path.

`UNKNOWN` side effects never receive blind automatic retries after dispatch uncertainty.

## 12. Caching and discovery

Cache key must include at least:
- server fingerprint
- authenticated principal/scope binding
- protocol revision
- discovery/list method

Respect MCP cache hints only as an upper bound. Seven may shorten TTL.

Invalidate immediately on:
- auth principal/scope change
- server fingerprint change
- protocol downgrade/upgrade requiring remap
- explicit capability-change signal when available
- schema drift
- user disconnect/revoke
- trust-policy change

Never share a capability cache across users/principals unless the protocol/server explicitly indicates safety and Seven policy permits it.

## 13. Tasks mapping

MCP Tasks are remote execution handles. They do not replace Seven TaskContract.

Store a remote task binding:
- Seven task id
- server fingerprint
- remote task id
- originating externalToolId
- created/updated timestamps
- remote status
- Seven derived status
- last evidence/result hash

Rules:
- Seven remains authoritative for user-visible task completion.
- remote `completed` means "remote reports completion", then Seven verifies the result/effect.
- remote `cancelled` maps to evidence, not automatic proof that a side effect did not occur.
- on reconnect, poll/reconcile according to budget and risk.

## 14. Cancellation

Cancellation is best-effort at remote boundaries.

When user/Seven cancels:
1. stop local downstream planning immediately.
2. send remote task/request cancellation where supported.
3. mark unresolved side effects according to evidence.
4. do not report clean cancellation if a dispatched write may already have happened.
5. reconcile high-risk uncertain effects when safe and permitted.

## 15. Multi Round-Trip Requests / server-to-client interaction

Treat every server-to-client interaction as a new request for authority.

Rules:
- no automatic privilege inheritance beyond the original TaskContract.
- user elicitation becomes `USER_INTERACTION` and must be surfaced intentionally.
- supplied values are scoped to the requesting operation.
- deprecated Sampling/Roots should not become new Seven core dependencies.

## 16. Resources and prompts

MCP resources/prompts are external content, not Seven instructions.

Normalize with:
- source/server fingerprint
- URI/name
- retrieval timestamp
- content hash
- MIME/type
- trust tier
- lineage
- freshness/cache metadata

Any embedded instructions remain content subject to prompt-injection defenses. They do not override system/project/user authority.

## 17. Error model

Normalize remote outcomes to Seven classes:
- TRANSPORT_FAILURE
- AUTH_FAILURE
- PERMISSION_DENIED
- RATE_LIMITED
- TIMEOUT_BEFORE_DISPATCH
- TIMEOUT_AFTER_DISPATCH_UNKNOWN
- REMOTE_VALIDATION_ERROR
- SCHEMA_DRIFT
- REMOTE_TOOL_ERROR
- MALFORMED_RESULT
- TASK_LOST
- CANCELLED_CONFIRMED
- CANCELLED_UNCERTAIN

Keep raw protocol error as lineage/diagnostic metadata without making callers depend on provider-specific shapes.

## 18. Retry policy

Retry decision inputs:
- Seven idempotency policy
- whether dispatch is known to have occurred
- side-effect class
- error class
- risk
- remaining TaskContract budget
- server health/backoff state

Use bounded exponential backoff with jitter for eligible transient failures. Never let provider retry loops evade Seven tool-call/network budgets.

## 19. Security model

Threats explicitly covered:
- malicious metadata/annotations
- prompt/resource injection
- duplicate tool names across servers
- server identity spoofing
- schema drift
- over-broad OAuth scopes
- stale auth-bound caches
- data exfiltration through tool arguments
- SSRF/local-network reach through remote-configured URLs
- DNS rebinding for local endpoints
- replay/duplicate writes
- timeout-after-side-effect ambiguity
- forged success output
- task-handle substitution

Security rules:
- endpoint allow/configuration policy
- HTTPS by default for remote endpoints
- local endpoints restricted to deliberate local configuration
- issuer/principal binding for auth
- explicit argument preview/confirmation for sensitive operations when policy requires
- output sanitization/validation before model/authoritative state
- audit record for every external call

## 20. Android/performance strategy

Do not run MCP discovery at app startup.

- load adapter lazily on first connected-tool use
- persist only compact normalized descriptors/cache metadata
- cap discovered catalogue size
- capability retrieval is plan-aware instead of dumping all external schemas into model context
- compile/serialize compact schema summaries for model selection; keep full schema outside prompt until a capability is shortlisted
- remote HTTP is the primary mobile path
- stdio/local-process MCP is host/bridge territory, not direct WebView execution
- cache within safe auth/protocol boundaries
- ResourceGovernor controls concurrency, network/tool-call budget and background refresh

## 21. Context efficiency

Do not expose every discovered MCP tool to the model.

Progressive retrieval:
1. task intent → canonical capability class
2. capability graph → shortlist adapters
3. lightweight metadata/rank
4. load full schema only for top candidates
5. dispatch one selected adapter

This prevents large MCP ecosystems from consuming Seven's reasoning context.

## 22. Observability record

Per external call record:
- Seven task id
- canonical capability
- externalToolId
- server fingerprint
- protocol revision
- schema hash
- permission decision
- side-effect ledger key when applicable
- start/end timestamps
- retry count
- cancellation state
- normalized outcome
- verification status
- byte/token/context estimates where available

Never persist secrets/tokens in normal telemetry.

## 23. Evals before implementation freeze

### Correctness
- schema-valid read call
- malformed input blocked before network
- malformed output blocked from authoritative commit
- tool-name collision across two servers
- schema drift detection

### Security
- malicious `readOnly` annotation cannot bypass Seven classification
- injected resource/prompt cannot alter authority
- auth-principal change invalidates cache
- sensitive tool outside TaskContract is denied

### Side effects
- successful reversible write + verification
- timeout before dispatch
- timeout after possible dispatch → UNCERTAIN
- reconciliation proves effect happened
- duplicate retry does not duplicate effect

### Tasks/cancellation
- remote async task completion then Seven verification
- cancel acknowledged before effect
- cancel with ambiguous effect remains uncertain
- server disappears and later returns

### Performance/mobile
- no startup load
- catalogue with 10 / 100 / 1000 external tools
- progressive capability retrieval context cost
- Lite tier concurrency/budget behavior

## 24. Freeze criteria

MCP adapter may reach `FROZEN-V1` only when:
- no raw remote annotation can grant authority
- capability identities are collision-safe
- every call is scoped by TaskContract
- side-effecting calls bind to SideEffectLedger
- schema drift is handled safely
- task/cancellation uncertainty is represented explicitly
- auth-bound cache invalidation works
- context does not scale linearly by dumping all tool schemas into prompts
- mobile startup remains unaffected when MCP is unused
- all critical evals above pass
- source-integrity/release gates remain green

## 25. Rejected architecture alternatives

### Raw MCP tools directly exposed to model
Rejected: weak permission/authority boundary, tool-list context bloat, collision and injection risks.

### MCP annotations as side-effect truth
Rejected: protocol explicitly treats annotations as untrusted unless server trust is established, and Seven's stronger rule is to classify effects itself.

### MCP Tasks replacing Seven task kernel
Rejected: remote task state cannot represent Seven verification, canonical commit, local cancellation ambiguity or cross-provider orchestration.

### Always-on MCP initialization/discovery at startup
Rejected: violates Android-first startup and resource constraints.

## 26. Open questions for implementation phase

- exact TypeScript SDK bundle cost versus a narrow client wrapper
- whether legacy 2025-era compatibility is worth shipping in mobile runtime or delegated to a bridge
- credential storage path in final Android architecture
- managed-server trust provisioning format
- exact catalogue limits per performance tier
- how much MCP Apps support Seven should expose in V1, if any

No implementation is authorized by this document yet. Next gate: evaluate this design, then produce the minimal implementation plan/test fixture before code changes.
