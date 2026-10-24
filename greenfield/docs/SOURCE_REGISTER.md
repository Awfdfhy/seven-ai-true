# Source Register

Status vocabulary: VERIFIED, INFERRED, ASSUMED, UNKNOWN, BLOCKED. Historical recollections are leads, not implementation evidence.

| ID | Requirement / claim | Current evidence | Status | Required verification |
|---|---|---|---|---|
| SRC-001 | Seven RPG remains an independent RPG, not a general assistant | Product directive in greenfield documents | VERIFIED as requirement | Preserve in UI, docs, and architecture |
| SRC-002 | Player controls consequential character actions/dialogue unless delegated | Product directive | VERIFIED as requirement | Agency contract tests |
| SRC-003 | AI output cannot directly mutate authoritative state | Architecture requirement | VERIFIED as requirement | Attempted illegal-mutation tests |
| SRC-004 | Persistent world state survives force-stop/reopen | Required MVP-0 behavior | UNKNOWN implementation | End-to-end save/recovery test |
| SRC-005 | Canon and character knowledge remain distinct | Product requirement | UNKNOWN implementation | Schema and retrieval isolation tests |
| SRC-006 | Arabic RTL and English LTR work throughout | Product requirement | UNKNOWN implementation | UI/golden tests on real screens |
| SRC-007 | Android SAF/document-provider behavior works on target APIs | Historical risk reported by owner | UNKNOWN | Emulator/device matrix and logs |
| SRC-008 | Old localStorage keys/data may need compatibility | Historical implementation context | UNKNOWN current source | Inspect actual source and write migration plan |
| SRC-009 | Multiple AI providers should be replaceable | Product requirement | UNKNOWN implementation | Contract suite for mock and one real provider |
| SRC-010 | Existing old release/build claims are still valid | Historical claims only | UNKNOWN | Reproduce from commit, workflow logs, and artifacts |

Add a row for every inherited requirement. Include source path/commit, confidence, conflict, acceptance criteria, and evidence links. Never mark implementation VERIFIED based on this register alone.
