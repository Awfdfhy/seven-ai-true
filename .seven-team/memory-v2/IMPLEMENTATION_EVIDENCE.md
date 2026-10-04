# Memory v2 Implementation Evidence

Updated: 2026-10-04

## Product branch commits

- 6554613 — temporal provenance-aware Memory Fabric core
- 3bf7f06 — live chat recall wiring
- 4f8eebc — temporal/privacy/injection benchmark gates
- 4191217 / 7a9e4f7 / 420e2e0 — implicit, historical, Arabic and precision retrieval fixes
- 65b9823 / 618cc00 — hard forget semantics + IndexedDB transaction
- 117f354 — user-visible Memory Inspector
- e3e6f80 — historical core-identity recall without normal-context pollution
- dfaf09a / de01356 — bounded long-chat context + lazy durable summaries
- 0e0dfe7 / bdd85cb — bounded valid JSON memory context
- 6c651dd — 2000-item distractor stress gates

## Proven so far

- TypeScript strict compile: PASS on latest pre-stress baseline and stress run CI
- Unit/integration suite: PASS
- Build: PASS
- 2000 distractor relevant retrieval: PASS
- 2000 unrelated distractor abstention: PASS
- temporal supersession: PASS
- historical retrieval: PASS
- Arabic durable preference extraction/recall: PASS
- room/global isolation: PASS
- provenance: PASS
- hard forget: PASS
- secret exclusion: PASS
- instruction-like memory rejection: PASS
- live provider memory injection: PASS
- lazy summary path: PASS in CI
- bounded valid JSON context: PASS

## Not yet proven

- latest SHA Android installed smoke: pending Android Gate
- Reality Lab on exact latest APK: pending trigger after Android success
- 5k/10k scale latency budget
- full extraction precision corpus
- semantic embedding quality delta
- physical-device user validation
- backup/import/export


## New product-branch evidence

- 6901770 — local Memory Intent Gate: NONE / CORE / RECALL / HISTORY routing with English/Arabic tests.
- 2e1bd69 / 1c74bff — explainable profile-association expansion for multi-hop recall; generic category tags barred from acting as bridges.
- 2af0c18 — per-canonical-key write serialization and out-of-order temporal preservation.
- 9aba69b — bilingual extraction precision corpus and 10,000-memory scale gate.

These additions remain subject to the latest CI/Android exact-build gates. Do not mark them proven until the matching SHA is green.


## Latest fixed candidate — 9aba69b

CI #276: PASS
- TypeScript strict compile: PASS
- production dependency audit: PASS
- full dependency moderate audit: PASS
- production build: PASS
- 43/43 test files PASS
- 324/324 tests PASS
- Memory scale suite: 4 tests PASS in 401ms total on GitHub CI, including 10,000-memory retrieval gate
- Bilingual extraction corpus: 31 tests PASS in 22ms
- Intent-gate candidate baseline: PASS in earlier CI #271
- Generic lexical/association bridge hardening: PASS in CI #275

Still pending for this exact candidate:
- Android Release Gate on 9aba69b
- Android 14 installed smoke
- Android 16 installed smoke
- exact-build Reality Lab
