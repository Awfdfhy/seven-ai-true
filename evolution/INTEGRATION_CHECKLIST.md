# Integration checklist

Before any future evolution adapter can promote a candidate, it must prove:

1. Candidate work is isolated from the stable release.
2. Required metrics are present and tests pass.
3. No critical regression is known.
4. Provenance is verifiable.
5. A rollback checkpoint exists.
6. Free-proof and license checks pass for model candidates.
7. Shadow evaluation passes.
8. Canary evaluation passes.
9. The evolution ledger verifies successfully.
10. Final promotion approval is explicit.

If any item is unknown or false, the candidate must remain unpromoted.
