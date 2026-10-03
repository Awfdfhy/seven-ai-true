# Seven Remake V3 — Phase 4/12: Attachments

Acceptance path:

`bytes → size guard → MIME/content sniff → parse → hash → durable attachment → restart/restore`

Invariants:

1. Raw caller bytes are snapshotted before asynchronous work.
2. Supported content is UTF-8 text or PDF; declared MIME must match detected content.
3. PDF parser runtime loading is single-flight.
4. Cancellation prevents late parser completion from becoming durable truth.
5. Extracted text and raw byte sizes are bounded.
6. Attachment records are immutable, hashed and room-scoped.
7. IndexedDB restore is schema-validated.
