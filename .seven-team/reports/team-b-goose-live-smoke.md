# Team B — B07 — Goose Live Runtime Smoke Test Report

## 1. Identity

| Field | Value |
| --- | --- |
| Team | Team B (RPG V2 / stateful story experience) |
| Worker ID | B07 |
| Runtime / Agent | Goose |
| Role | RPG state integrity, provenance, and security boundaries around imported or derived state |
| Report type | Controlled live runtime smoke test |
| Timestamp | 2026-10-03 04:25:00 +00:00 |

## 2. B07 Mission (in my own words)

I own the question of *where the truth about a character's world comes from*. In RPG V2 the game
state is not a single blob of numbers — it is a layered pile of records: authoritative
persistent state, session-local runtime state, canon imported from external sources, and derived
state computed by inference or summarization. My job is to make sure those layers never quietly
blend together in a way that a player (or a downstream consumer) cannot see.

Concretely, I am the guard at the seams:

- I verify that anything entering the persistent store is either authored by a trusted,
  identified source or is explicitly labelled as untrusted/imported material.
- I make sure imported canon and derived summaries are never able to silently overwrite trusted
  persistent state, and that any write that is not a trusted-priority write is visible,
  reversible, and attributable.
- I enforce the character-local knowledge boundary, so that knowledge gained in one character's
  timeline, session, or imported dossier cannot leak into another character's model of the world
  (including via caches, embeddings, retriever indexes, and prompt assembly).
- I keep the change gates honest: shared-core / schema-level changes require a manager lease plus
  independent review before they can land, and I will not self-authorize them.

I do not decide narrative content. I decide what is allowed to be treated as fact, and I make that
decision auditable.

## 3. Three RPG State-Integrity / Provenance Risks

### Risk 1 — Cross-character knowledge leakage through shared or pooled context

*What goes wrong:* Knowledge is scoped to a character, but the retrieval and prompt-assembly paths
are frequently scoped to a "world", a "campaign", or a run/session id. A shared vector index, a
world-level summary cache, or a replayed message history can therefore surface facts that only one
character was ever supposed to know — another character's secrets, a later reveal, an unrevealed
plot fact — into a different character's context.

*Why it matters:* It is both a correctness bug and a spoiler/privilege violation. Once leaked, the
model treats the foreign knowledge as its own and will act on it: NPC dispositions, hidden motives,
and quest flags all become wrong. It is also hard to detect, because the resulting state is
internally consistent — nothing crashes, the state is simply wrong and unauthorized.

*Containment:* Every knowledge-bearing artifact must carry a character/session scope key and be
filtered on read, not just on write. Pooled indexes need hard scope partitions or per-scope
post-filtering that is proven to drop out-of-scope rows. Regression tests should assert that a
character with no access to an event cannot obtain it through retrieval, cache, summary, or
checkpoint restore.

### Risk 2 — Imported canon or derived state silently overwriting trusted persistent state

*What goes wrong:* Canon imports, lore documents, save-slot merges, LLM-generated summaries, and
inferred state ("the player seems to have accepted the quest") are written through the same
persistence path as authoritative state. A derived or imported value then wins a field-level or
whole-record overwrite against a trusted value, and the trusted value is gone. There is no
provenance on the record, so nothing can tell afterwards which layer produced the current truth.

*Why it matters:* This is irreversible state corruption that stays invisible until a player
notices a wrong fact, and the original trusted value is typically not recoverable once the
overwrite commits.

*Containment:* Field-level provenance and a trust tier on every persisted value. Imports and derived
writes must land in a quarantine/staging tier, be diffed and reviewed, and only be promoted into
trusted state through an explicit, logged, reversible promotion step. Conflicting writes should fail
loudly or be held for review — never last-writer-wins. Trusted-priority writes must always be able
to roll back an import that was wrong.

### Risk 3 — Unattributed, unaudited writes to shared core (missing lease + review)

*What goes wrong:* Fixes to a "temporary" case end up touching shared RPG core (schema, save
serialization, the state reducer, or the shared-core prompt/summary path) without going through the
change gate, because the boundary between a character-local change and a shared-core change is not
explicitly defined. The result is an unreviewed, unversioned mutation of the single component every
character's state flows through, with no manager lease, no independent reviewer, and no rollback
plan.

*Why it matters:* Shared-core defects are not contained to one character or one session — they
amplify across all of them, and a silent change to the reducer or serializer can corrupt every
persisted save at once. Unaudited means un-diagnosable later.

*Containment:* An explicit definition of what counts as shared core, enforced in review and ideally
in tooling. Any change to that surface requires a manager lease plus independent review from a
worker other than the author, a stated migration/rollback plan, and a provenance record for the
change. A worker must not be able to grant their own lease.

## 4. Branch

```
agent-b/07-rpg-integrity
```

## 5. Smoke Test Result

Runtime: Goose. Repository change limited to this report file only — no other file was created,
modified, or deleted. No environment variables, credentials, git remotes, or network resources were
inspected. No shared-core or state-mutating code was executed, and no manager lease or independent
review was required, since this is a documentation-only smoke test artifact.

LIVE_AGENT_SMOKE=PASS
