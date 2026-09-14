# Seven Tool Fabric 2.0 — Wave 04 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: APIs/OpenAPI, webhooks/events, archive/media inspection, provenance, and RPG/Real-Works graph/retrieval utilities.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 04

Goal: discover the strongest practical tools and standards that let Seven safely understand and invoke external APIs, consume events/webhooks, inspect archives/media, preserve provenance, and power canon/world simulation without creating brittle vendor-specific integrations or fake authority.

Research broadly from current official specifications, upstream implementations and security guidance. Separate standards/protocols from parsers/generators/providers. Prefer Seven-owned canonical contracts with replaceable adapters.

Research at minimum:
- OpenAPI parsing/validation and operation discovery
- JSON Schema compatibility and schema dereferencing
- API client generation versus runtime invocation
- AsyncAPI/event contracts
- webhook verification, replay protection and delivery semantics
- SSE/WebSocket/event-stream integration where useful
- archive inspection/extraction safety
- MIME/media metadata inspection
- PDF/image/audio/video metadata and safe probing
- content hashing/provenance
- citation/source graph primitives
- temporal/event graph data structures
- graph/query engines relevant to RPG/Canon
- diff/change detection for canonical sources
- source deduplication and content-addressed storage

For external API actions, explicitly evaluate:
- auth/credential boundary
- server allowlists/origin binding
- operation risk classification
- request/response schema validation
- idempotency
- rate limiting
- retries/backoff
- timeout-after-side-effect uncertainty
- pagination
- streaming responses
- file uploads/downloads
- API version/schema drift
- observability
- verification of effect

For webhooks/events:
- verify signatures/authenticity before trust
- record event id, timestamp and source
- protect against replay/duplicate delivery
- acknowledge only according to provider semantics
- process idempotently
- preserve raw event lineage
- event payload does not become Seven authority by itself

For archives/media:
- defend against path traversal, symlink escape, decompression bombs, malformed metadata and parser abuse
- inspect limits before extraction
- prefer streaming/bounded processing
- media metadata is evidence, not proof of semantic content

For RPG/Real Works:
- favor explicit event/entity/relationship/timeline/source graphs over model-generated summaries
- support source hierarchy, retcons, uncertainty, spoilers and CANON_GAP
- evaluate whether SQLite-derived graph views and graph algorithms are enough before adding a database
- preserve source anchors and hashes so canon state can be rebuilt/revalidated

Output:
1. candidate registry
2. primary evidence ledger
3. rejected alternatives
4. Seven canonical tool contracts
5. API/event security architecture
6. archive/media safety architecture
7. Canon/Real Works tool architecture
8. unresolved gaps
9. Deep Polish queue

Preserve all material results in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
