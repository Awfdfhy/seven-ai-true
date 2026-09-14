# Seven Tool Fabric 2.0 — Wave 04 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 04. No candidate integrated/frozen.
Governing command: `WAVE_04_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should add a **Contract + Event + Provenance plane**, not a pile of vendor-specific API integrations.

Proposed Seven-owned layers:

1. `ApiContractEngine` — imports, validates and normalizes OpenAPI operations into Seven capabilities.
2. `ApiActionBroker` — invokes normalized operations through TaskContract, CredentialVault and SideEffectLedger.
3. `EventContractEngine` — understands AsyncAPI/event contracts without granting event payloads authority.
4. `WebhookIngress` — verifies event authenticity, replay/idempotency and lineage before processing.
5. `EventEnvelope` — Seven-native normalized event record, optionally compatible with CloudEvents concepts.
6. `ArchiveInspector` — lists/probes archives under strict size/path limits before extraction.
7. `MediaProbe` — identifies/probes media metadata without decoding everything.
8. `ContentIntegrity` — hashes/canonicalizes objects and files for lineage, change detection and cache identity.
9. `SourceLedger` — source snapshots/anchors/hashes for Research and Real Works/Canon.
10. `CanonGraphTools` — derived timeline/entity/relation queries over Seven's authoritative state, not a new authority database.

## Candidate registry

| Candidate/standard | Kind | Preliminary class | Seven role | Priority |
|---|---|---|---|---|
| OpenAPI 3.1.x | specification | CORE CONTRACT | external REST operation description | P0 |
| Redocly CLI | validator/bundler | SPECIALIST HOST/CI | lint/bundle OpenAPI/AsyncAPI | P1 |
| AsyncAPI 3.1.x | specification | CORE EVENT CONTRACT | message/event API description | P1 |
| AsyncAPI Parser | parser | SPECIALIST CANDIDATE | parse/normalize event descriptions | P1 |
| Standard Webhooks | signature convention/spec | CORE SECURITY PATTERN | webhook verification/replay defense | P0 |
| CloudEvents | event envelope spec | SPECIALIST STANDARD | normalized event vocabulary/interchange | P1 |
| RFC 8785 JCS | canonicalization spec | CORE INTEGRITY PATTERN | stable JSON hashing/signing | P0 |
| Web Crypto | platform crypto API | CORE PLATFORM | SHA-256/signature primitives where supported | P0 |
| zip.js | browser ZIP library | SPECIALIST CANDIDATE | bounded streaming ZIP inspect/extract | P1 |
| fflate | compact compression lib | FALLBACK/benchmark | very small stream decompression candidate | P2 |
| libarchive | native archive library | SPECIALIST HOST | broad archive support with secure flags | P1 |
| file-type | binary signature detector | SPECIALIST LIGHT | file-type hint/probe | P1 |
| ffprobe | media probe | SPECIALIST HOST | audio/video/container metadata | P1 |
| ExifTool | metadata reader | SPECIALIST HOST | deep image/document/media metadata | P2 |
| W3C PROV model | provenance standard/model | REFERENCE MODEL | lineage vocabulary inspiration | P2 |

## OpenAPI / API contract architecture

### OpenAPI 3.1.x
OpenAPI supplies machine-readable REST API descriptions including servers, operations, parameters, request bodies, responses and security schemes. Operation identifiers can be used as stable local references only after Seven verifies uniqueness and binds them to a particular spec/server revision.

Seven rule:
- an OpenAPI document describes possibilities; it does not authorize any operation.
- server URLs inside imported specs are untrusted configuration until explicitly approved.
- examples/defaults/descriptions are non-authoritative content.

Source:
- https://spec.openapis.org/oas/v3.1.1.html

### Redocly CLI
Current Redocly CLI can lint and bundle API descriptions and resolve multi-file `$ref` structures. It is active in 2026 and supports OpenAPI plus AsyncAPI/Arazzo tooling.

Seven role:
- host/CI preflight and normalization tool
- useful for imported project API specs or Seven's own integration test fixtures
- not required in Android startup runtime

Sources:
- https://redocly.com/docs/cli/commands/lint
- https://redocly.com/docs/cli/commands/bundle

### ApiContractEngine proposal

Import pipeline:
`raw spec → source hash → format/version detect → lint/parse → resolve refs under policy → canonical operation descriptors → risk classification → user/server approval → capability registry`

Canonical operation descriptor contains:
- spec source + immutable hash
- OpenAPI version
- server id/origin
- operationId + canonical Seven id
- method/path
- parameter/request schema hashes
- response schema hashes
- auth scheme references
- Seven permission classes
- side-effect class
- idempotency policy
- pagination/streaming hints
- verification policy

Never derive write-safety only from HTTP method. `GET` is usually observational but Seven may still enforce domain/network scope; `POST/PUT/PATCH/DELETE` require explicit side-effect classification.

### ApiActionBroker
Before dispatch:
1. TaskContract capability check
2. server/origin binding check
3. CredentialVault reference resolution
4. request schema validation
5. side-effect plan/idempotency key if needed
6. budget/rate policy

After dispatch:
1. response/body/content-type limits
2. response schema validation if available
3. normalize provider-specific error
4. verify effect where action-sensitive
5. record lineage/side-effect evidence

Timeout-after-dispatch for a write becomes `UNCERTAIN`; never blindly retry unless Seven has verified idempotency semantics.

## Async/event architecture

### AsyncAPI
AsyncAPI 3.x describes message-driven APIs across multiple protocols. 3.1.0 was released in 2026 and official tooling/schema support was updated.

Seven role:
- parse channels/messages/operations into `EventContractEngine`
- treat bindings as transport configuration, not permission
- use message schemas for validation before events enter authoritative workflows

Sources:
- https://www.asyncapi.com/docs/reference/specification/v3.0.0
- https://www.asyncapi.com/blog/release-notes-3.1.0
- https://www.asyncapi.com/docs/tools/generator/parser

### CloudEvents
CloudEvents provides standard context fields such as event `id`, `source`, `type` and optional `time`, useful for interoperable event envelopes/deduplication.

Seven proposal:
- Seven-native `EventEnvelope` can map to/from CloudEvents where integrations use it
- source/id are identity evidence, not proof of authenticity

Source:
- https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md

### Standard Webhooks
The specification recommends authenticating payload + timestamp + unique event id, timestamp tolerance for replay resistance and idempotent handling keyed by event id. It also accommodates key rotation with multiple signatures.

Seven proposal:
- highest-priority webhook verification pattern
- verify exact raw request bytes before parsing/normalization
- constant-time signature compare or audited crypto primitive
- configured clock-skew window
- event-id replay ledger
- bind secret/key to expected source/origin
- retain raw-body hash and verification evidence

Source:
- https://github.com/standard-webhooks/standard-webhooks/blob/main/spec/standard-webhooks.md

## Seven EventEnvelope proposal

Fields:
- `eventId`
- `sourceId`
- `type`
- `occurredAt`
- `receivedAt`
- `deliveryAttemptId`
- `contractId/revision`
- `rawHash`
- `signatureStatus`
- `schemaStatus`
- `dedupeStatus`
- `payloadRef`
- `lineage`
- `authorityState`

States:
`RECEIVED → AUTHENTICATED/UNAUTHENTICATED → VALIDATED/INVALID → DEDUPED → DISPATCHED → PROCESSED/FAILED`

A cryptographically valid webhook still contains claims from an external system; signature verifies origin/integrity, not truth of semantic content.

## Content integrity

### RFC 8785 JCS
JCS creates deterministic JSON representations suitable for repeatable hashing/signing.

Seven role:
- canonical hashes for structured tool descriptors, source snapshots, decision records and event payloads where canonical JSON is appropriate
- do not replace raw-source hashes; store both raw and normalized/canonical hashes when transformation matters

Source:
- https://www.rfc-editor.org/rfc/rfc8785.html

### Web Crypto
Web Crypto provides browser cryptographic primitives including SHA-family digests and can operate in Web Workers. `SubtleCrypto.digest` requires the full input in memory and is not streaming.

Seven role:
- small/medium object hashing in browser/worker
- large-file hashing requires a streaming/native strategy to avoid full-buffer memory spikes

Sources:
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest

## Archive safety

### zip.js
Current zip.js is browser-focused, BSD-3-Clause, supports streams, workers, Zip64 and range/stream-oriented reading.

Seven role:
- browser/WebView ZIP specialist
- never extract all entries blindly
- first enumerate central directory/entry metadata, then apply Seven limits
- use Web Workers for decompression where available

Source:
- https://github.com/gildas-lormeau/zip.js

### libarchive
Native host specialist with explicit secure extraction flags for symlink traversal, `..` components and absolute paths, plus safe-write options.

Seven role:
- broad archive support on host/worker
- Seven must enable secure flags explicitly; libarchive defaults alone are not sufficient for untrusted extraction

Source:
- https://github.com/libarchive/libarchive/blob/master/libarchive/archive.h

### ArchiveInspector safety policy
Before extraction:
- maximum archive bytes
- maximum entry count
- maximum single-entry uncompressed bytes
- maximum cumulative uncompressed bytes
- maximum expansion ratio
- maximum nesting depth
- normalize each path
- reject absolute paths
- reject `..` traversal
- reject/contain symlinks/hardlinks
- reject special device files
- no executable launch
- extract only into dedicated staging root
- cancellation + cleanup

`archive.inspect` must be available without extraction where format permits.

Canonical tools:
- `archive.inspect`
- `archive.extract_selected`
- `archive.create`

## File/media probing

### file-type
Detects many binary formats using magic-number signatures, but its own documentation correctly warns this is a best-effort hint and not proof a file is valid/safe.

Seven role:
- lightweight pre-classifier only
- never allow detected type to bypass parser/sandbox policy

Source:
- https://github.com/sindresorhus/file-type

### ffprobe
Can expose container/stream metadata and machine-readable JSON output without requiring full media transcoding.

Seven role:
- host/remote `media.probe` backend
- invoke with bounded input/time and explicit fields rather than dumping packets/frames by default

Source:
- https://ffmpeg.org/ffprobe.html

### ExifTool
Broad metadata reader across images/media/doc formats.

Seven role:
- deep host-side metadata specialist after simple platform metadata paths
- read-only by default; metadata writing is a separate side-effect capability and not required for initial Tool Fabric

Source:
- https://exiftool.org/exiftool_pod2.html

Canonical tools:
- `file.identify`
- `file.hash`
- `media.probe`
- `media.metadata.read`

## Provenance / lineage

W3C PROV provides a useful model around entities, activities and agents that influenced/produced derived objects.

Seven decision:
- borrow compatible concepts, do not import a heavyweight RDF stack merely for standards compliance
- Seven's existing lineage law remains canonical: derived object must retain source + transformation + current object

Source:
- https://www.w3.org/TR/prov-primer/

## Real Works / Canon tool architecture

Do not add a standalone graph database yet.

Seven-owned canonical canon tools proposed:
- `canon.source.register`
- `canon.source.snapshot`
- `canon.source.diff`
- `canon.anchor.resolve`
- `canon.event.query`
- `canon.timeline.query`
- `canon.entity.query`
- `canon.relationship.query`
- `canon.knowledge_at_time`
- `canon.rule.query`
- `canon.conflict.detect`
- `canon.retcon.record`
- `canon.coverage.audit`
- `canon.scene.validate`
- `canon.world_diff.validate`

### SourceLedger
For every canon source/snapshot record:
- work/source identity
- source tier
- edition/version
- acquisition URI/reference
- retrieved/observed time
- raw content hash
- normalized content hash where applicable
- parser/extractor version
- source anchors (episode/chapter/time/page/etc.)
- spoiler boundary
- coverage ranges
- confidence/uncertainty
- lineage

### Canon source changes
When a source changes:
`new snapshot → content diff → impacted anchors → impacted facts/events → revalidation queue`

Do not silently rewrite old canon state. Preserve previous source snapshot/history and produce derived changes.

### Graph queries
Use Seven's entity/event/relationship tables and temporal/causal indexes with SQLite recursive queries/derived graph views first. A separate graph engine earns admission only if Canon/RPG evals prove queries that the existing data plane cannot meet within latency/complexity budgets.

## Rejections / limits

- no OpenAPI document can grant itself network/write permission
- no runtime code generation from an API spec as the default mobile integration strategy
- no webhook payload is trusted before signature/auth validation when the provider supports it
- no event id alone proves authenticity
- no automatic archive extraction
- no metadata tool output treated as semantic truth
- no separate graph database merely because graph terminology appears in RPG/Canon
- no whole-file Web Crypto hashing for arbitrarily large files without memory limits/streaming strategy

## Deep Polish queue

`ApiContractEngine/OpenAPI → WebhookIngress/Standard Webhooks → ContentIntegrity/JCS+hashing → ArchiveInspector/zip.js+host libarchive → EventContractEngine/AsyncAPI → MediaProbe → SourceLedger+CanonGraphTools`

## Open gaps

- exact runtime OpenAPI parser choice for the lightweight Android path
- OAuth/OIDC acquisition flows and token refresh integration with CredentialVault
- provider-specific pagination/idempotency normalization
- streaming hash implementation for large files
- non-ZIP archive handling on Android without bloating APK
- media metadata parsing available directly through Android platform APIs
- source-anchor extraction strategies per Real Work medium (anime/video, manga/book, wiki/reference)
- canon-source licensing/availability constraints by work

No production integration occurred in this wave.
