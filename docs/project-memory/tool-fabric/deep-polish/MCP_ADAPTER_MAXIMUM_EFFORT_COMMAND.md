# Seven Tool Fabric 2.0 — MCP Adapter Maximum Effort Command

Status: ACTIVE DEEP-POLISH CONTRACT
Date: 2026-09-13

## SEVEN MAXIMUM EFFORT — MCP / ToolInteropGateway

Goal: design the strongest practical MCP interoperability layer for Seven without allowing MCP servers, tool metadata, remote prompts/resources, or provider behavior to bypass Seven's own truth, permission, side-effect, budget, verification, recovery, or lineage systems.

Inspect Seven's existing `TaskContract`, `SideEffectLedger`, `ResourceGovernor`, truth/evidence architecture and execution bridge before proposing integration. Preserve their authority instead of duplicating or weakening them.

Research the current MCP specification and official SDK behavior at maximum practical depth, including:
- stateless request model
- capability discovery
- tools/resources/prompts
- Tasks lifecycle
- Multi Round-Trip Requests
- cancellation
- cacheability and invalidation
- authorization hardening
- trace propagation
- extensions
- transport options
- errors and retries
- security guidance
- tool annotations/metadata trust boundaries
- server identity/versioning

For each capability determine:
- how it maps to Seven canonical capability names
- whether it is read-only or side-effecting
- permission class
- idempotency and retry policy
- timeout/cancellation behavior
- schema validation strategy
- provenance/lineage record
- verification requirements
- uncertainty behavior if connection/result confirmation is lost
- resource/budget cost
- Android/client implications

Adversarially test the design against:
- malicious or incorrect tool metadata
- prompt/resource injection
- capability-list changes after authorization changes
- stale cached tool lists
- duplicate/aliased tools across servers
- schema drift
- server version drift
- ambiguous side effects
- timeout after a remote action may already have occurred
- replay/duplicate execution
- over-broad authorization
- server disappearance mid-run
- long-running task cancellation/recovery
- tool output claiming success without evidence

Do not expose raw MCP tools directly to the model as authority. Seven must normalize them through its own canonical capability graph and security envelope.

Prefer a thin, replaceable adapter. Do not make the Android startup path depend on a large MCP runtime if the same interoperability can be loaded lazily.

Output must include:
1. verified current-protocol facts
2. Seven existing-state audit
3. final proposed architecture
4. canonical interface contracts
5. permission/side-effect mapping
6. cache/versioning rules
7. cancellation/retry/idempotency rules
8. threat/failure model
9. Android/performance plan
10. eval matrix
11. explicit open questions
12. freeze criteria

Preserve all material evidence, decisions and rejected alternatives in GitHub Project Memory. Do not implement into production code until this Deep Polish design is reviewed and its required evals are defined.
