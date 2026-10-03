# Seven Remake V3 — Phase 5/12: Research + Citations

Acceptance path:

`query → concurrent sources → citation validation → canonicalization/dedup → synthesis → durable cache → restart/reuse`

Invariants:

1. Citations include canonical URL, title, evidence snippet, retrieval/publication timestamps, SHA-256 content hash and provider identity.
2. A source cannot forge another provider's identity.
3. Partial source failure is surfaced in the result.
4. Total network/provider failure cannot silently become “no evidence”.
5. Evidence and result sizes are bounded.
6. Cancellation prevents late synthesis from entering durable cache.
7. Cached research is schema-validated and can be age-bounded or explicitly bypassed.
