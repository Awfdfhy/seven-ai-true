# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: READY

DOMAIN_ID=D22_PROTOCOLS_INTEROP
SOURCE_ANALYSIS=Harvested: MCP spec 2026-07-28 [SOURCE primary] and GA blog post [SOURCE primary] define protocol (JSON-RPC, tools/resources/prompts, sampling, roots, elicitation, lifecycle, auth considerations). Focus GA. Also GitHub references. Key: capability negotiation, structured errors, cancellation semantics, security (auth/roots). Limitations: harvested entries include fonts/CSS/manifest (metadata). No Seven MCP integration visible.
CURRENT=Seven has ProviderAdapter contract (stream/complete/capabilities/normalizeError), ModelRouter, TaskManager cancellation, typed bridge envelopes (requestId correlation), structured BRIDGE errors. AppKernel owns boot. No MCP client/server code evident from milestones/arch (focus on providers, GitHub, Android bridge). Evidence: `remake/ARCHITECTURE.md`, `remake/MILESTONES.md`.
TARGET=MCP interoperability as adapter (not replacing ProviderAdapter). Treat MCP tools as external capabilities with same invariants: cancellation propagates, deadlines enforced, structured errors normalized, capability negotiation, requestId correlation, diagnostics redacted (no secrets in logs). Respect MCP security model (roots, auth). For coding workspace operations, MCP tools must also satisfy same policy (exact SHA, path denylist, changed-path verification) if they mutate repo.
NOW=Define `McpAdapter` implementing same ProviderAdapter surface where applicable (capabilities map MCP→Seven), or separate tool adapter. Enforce: per-call cancellation (AbortController→MCP cancel), deadline mapped to timeout, normalize MCP errors to `SevenError` with code/category, redact diagnostics. Capability negotiation at connect.
NEXT=Roots/elicitation mapping; tool result size limits; rate limits; circuit breaker on MCP failures. Idempotency keys for mutating tools. Streaming where MCP supports. Ensure MCP calls cannot bypass coding workspace safety (intercept mutations).
LATER=Multi-server registry, health tracking analogous to ProviderHealthTracker (cooldown/retry), OTel semconv for MCP spans, Android constraints. Evaluate MCP vs internal adapters.
TESTS=Unit: error normalization, cancel propagation, capability mapping. Integration: mock MCP server with deterministic responses, timeout, cancel mid-stream. Adversarial: oversized payload, malformed JSON-RPC, tool injection via args (sanitize), path arguments must pass denylist.
RISKS=Tool injection (untrusted args), secret leakage to MCP servers, bypassing internal invariants, timeout/cancel mismatch, version skew (spec GA). Require allowlists, redaction, policy enforcement at boundary.
FIRST_SLICE=`McpAdapter` skeleton: connect with capability negotiation, listTools→capabilities, callTool with cancellation+deadline, normalizeError→SevenError. Mock server tests. No repo mutation yet.
KNOWN_UNKNOWNS=Whether Seven needs MCP now; codebase has no MCP deps. Harvested spec truncated (CSS). Need to confirm if any subsystem expects MCP. Also mapping to TaskManager types.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
