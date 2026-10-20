# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: READY

DOMAIN_ID=D22_PROTOCOLS_INTEROP
SOURCE_ANALYSIS=[SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28 | MCP 2026-07-28 GA spec. [SOURCE primary] https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/blog/content/posts/2026-07-28-spec-ga/index.md | GA announcement/blog. 10 sources total. Need to map to Seven's interop (bridge/routing?). Must not duplicate bridge/routing/kernel owners.
CURRENT=Assignment lists owners A04,B06. Quick scan - no obvious MCP server/client code visible at top level. Bridge/routing mentioned as areas not to duplicate owners for. Evidence: PARTIAL.
TARGET=Interop layer alignment: (1) tool/resource/prompt schema compatibility, (2) transport security, (3) capability negotiation, (4) error semantics, (5) logging/telemetry, (6) versioning. Only if it fits existing architecture; avoid creating new owners.
NEXT=Inventory existing tool/bridge interfaces. Compare to MCP concepts without reimplementing. Identify integration points (if any). Focus on safety (authz, input validation).
LATER=Selective MCP compatibility where beneficial, with proof.
TESTS=Schema validation, capability negotiation, error handling, authz checks.
RISKS=Scope creep into bridge/routing. Version skew. Security (tool execution). Must respect ownership boundaries.
FIRST_SLICE=Read-only mapping of existing interop surfaces vs MCP GA concepts. No protocol implementation.
KNOWN_UNKNOWNS=Existing bridge/routing implementation. Whether MCP is in scope now.
DOMAIN_VERDICT=READY_FOR_PLAN
