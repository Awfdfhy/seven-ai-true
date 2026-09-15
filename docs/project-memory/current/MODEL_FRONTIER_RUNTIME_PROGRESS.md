# Seven AI — Model Frontier Runtime Progress

Date: 2026-09-15
Status: VERIFIED PARALLEL FOUNDATION — does not advance the official Ultimate Polish counter
Implementation commit: `c49c42fc8cf59a7b0f663e4954f7d757612cd407`
CI run: `34920123541` / #1518 — SUCCESS

## Purpose
Turn the model-frontier research rules into executable fail-closed runtime contracts without hard-coding a favorite model, inventing a durable-free entitlement, mixing benchmark scales, or spending Seven's remaining startup-byte headroom.

## Implemented runtime
### Provider Adapter Contract
`evolution/provider-adapter-contract.cjs`

The adapter contract now seals provider identity, adapter revision, request/response/error-map fingerprints, supported capabilities, streaming/cancellation behavior, endpoint kinds and credential mode.

Endpoint observations are exact model-revision/endpoint records and carry:
- observed access class (`DURABLE_FREE_TIER`, `TRIAL_FREE`, `TEMPORARY_PROMO`, `SIGNUP_CREDIT`, `LOCAL_SELF_HOSTED`, `PAID`, `UNKNOWN`);
- pricing, health and quota state;
- quota remainder/reset when known;
- provider terms URL plus terms hash;
- observed capabilities/context/output windows;
- streaming/cancellation support and latency observation;
- observation time and observer identity.

Freshness is explicit. Stale observations cannot silently qualify a route. Paid, down or exhausted endpoints fail eligibility. Missing capability/context/streaming/cancellation evidence fails the corresponding requirement.

A durable Seven champion can only use `DURABLE_FREE_TIER` or `LOCAL_SELF_HOSTED` access. Trial/promotional/signup-credit capacity may be used only as explicitly opportunistic free capacity and cannot be relabeled as durable champion access.

### Model Frontier Qualification
`evolution/model-frontier-qualification.cjs`

A benchmark observation binds exact model record/revision/endpoint to index name, index revision and methodology SHA-256 fingerprint. Numeric comparison is refused when those identities differ.

Seven Eval receipts bind the exact model deployment to a suite fingerprint, runtime fingerprint and holdout fingerprint. Safety, regression, authority, cancellation and resource gates remain hard gates and cannot be purchased by a higher quality score.

Adversarial receipts require a reviewer context distinct from builder context. A qualification lease is issued only after verified free proof, fresh provider binding, benchmark evidence, Seven Evals and adversarial review all pass.

Qualification leases expire. `CHAMPION` and `OPPORTUNISTIC` are separate roles. Champion selection ignores expired, invalid and opportunistic-only leases, refuses to compare unmatched Seven Eval identities, and retains an incumbent when a challenger lacks a material matched-eval gain.

## Verification evidence
Run `34920123541` / #1518 completed successfully at commit `c49c42fc8cf59a7b0f663e4954f7d757612cd407`.

Key results:
- `Provider Adapter Contract: PASS (26 assertions)`;
- `Model Frontier Qualification: PASS (33 assertions)`;
- `model/compute polish: PASS (36 assertions)`;
- `all test suites: PASS (96 suites)`;
- source integrity lock PASS: `seven_ai-final.html` stayed `658133` bytes at blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`;
- static audit PASS: `99758 / 100000` startup bytes, `63855 / 65536` lazy workspace bytes, `3718522 / 8388608` static APK estimate, `0` static warnings;
- production dependency gate PASS with `0` production vulnerabilities; three full-graph findings remain dev/tooling-only (`@capacitor/cli`, `uuid`, `xcode`);
- release artifact `10378290130`, size `3109068` bytes, SHA-256 `9d2ca341a22a0487c5012dcc18a3a31134eb0f15a929395c1083625b19a86312`.

## Truth boundary
This foundation does **not** claim a live Seven champion and does not answer “the strongest model in Seven” with a fabricated winner.

No real provider endpoint was called by this foundation, no live free entitlement was proven by it, and no external benchmark result was promoted into Seven champion status. Real champion selection still requires fresh real endpoint observations, fresh terms/free-proof evidence, exact same-revision benchmark evidence, matched Seven Evals and independent adversarial receipts.

Kimi K3 remains research-candidate evidence only under the existing research snapshot. A development/trial-free route cannot become a durable champion merely because the base model is strong.

## Campaign relationship
The official counter remains `13 / ≤30`. Mega-Wave 14 remains formally open because its genuine independent logo adjudication cannot be manufactured by the builder context. This model-frontier runtime is dependency-safe parallel finalization work that reduces later Model Fabric integration debt without bypassing Wave 14.
