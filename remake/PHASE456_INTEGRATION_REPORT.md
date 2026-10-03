# Seven Remake V3 — Waves 4+5+6 Manager Integration

This manager pass validates the three parallel vertical slices together after their individual PR gates.

## Wave 4 — Attachments

- bounded raw-byte and extracted-text budgets
- realm-safe byte snapshots
- MIME/content sniff validation
- TXT + PDF ingestion ports
- single-flight PDF parser loader
- SHA-256 durable attachment records
- cancellation-safe persistence
- IndexedDB restart/restore

## Wave 5 — Research + Citations

- canonical HTTP(S) citation URLs
- title/snippet/retrieval/publication metadata
- SHA-256 content hash and provider attribution
- concurrent source orchestration
- deterministic URL deduplication
- explicit partial failures
- total source failure never becomes silent “no evidence”
- durable age-bounded research cache

## Wave 6 — Deep Think

- true two-pass application transport
- planner output is not emitted to the user
- independent planner/final context rebuilds
- exactly one leading system message per provider payload
- bounded planning brief
- planning data treated as untrusted JSON
- final payload capacity revalidation
- cancellation between passes prevents final dispatch

## Combined gates

The manager integration suite additionally covers:

1. attachment-derived evidence → research synthesis → Deep Think final response
2. task cancellation isolation between attachments and research
3. independent IndexedDB restart/restore for attachment and research domains

Phases 4–6 are closure candidates until this combined branch passes Remake CI + Legacy Seven and the manager PR is merged with post-merge CI green.
