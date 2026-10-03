# Live Smoke Test Report

## 1. Identity

- **Team:** Team B — RPG V2 / stateful story experience
- **Worker:** B07 — RPG state integrity, provenance, and security boundaries around imported or model-derived state
- **Agent runtime:** Goose

## 2. Mission

I own the guarantee that everything written into RPG V2 canonical state can be traced to an authorized source, and that nothing the model invents on its own quietly hardens into permanent canon. Concretely: every state mutation must carry provenance (who/what produced it, under which authority), model-generated content must land in provisional/staging layers until a human or an authorized promotion step ratifies it, and each character's knowledge of the world must remain strictly bounded by what that character has actually perceived or been told. I also hold the line on shared-core writes: only a valid manager lease may mutate shared world state, so concurrent workers cannot interleave partial or unowned writes into the same core files.

## 3. Three State-Integrity / Security Risks

1. **Unratified model invention promoted to immutable canon.** A model-generated fact (a location, a death, a rule of the world) is written straight into the canon layer and becomes indistinguishable from human-authored, ratified lore. The result is silent, permanent drift of canon that no later pass can distinguish from truth — and every downstream reader trusts it.

2. **Knowledge-boundary leakage (character omniscience).** Prose rendering or state injection pulls facts the viewpoint character has not learned — secret identities, unpublished events, another character's private inventory. This destroys the epistemic integrity of the story, breaks suspense and NPC logic, and leaks narrative secrets that other players or later reveals are supposed to depend on.

3. **Unleased / unowned shared-core writes.** Concurrent workers write shared state without holding a manager lease, or without atomic read-modify-write, causing lost updates, interleaved partial writes, and corruption of the shared core. Beyond data loss, the absence of a verifiable write authority means there is no accountability for *which* worker introduced a state change — destroying both provenance and the audit trail.

## 4. Branch

`agent-b/07-rpg-integrity`

LIVE_AGENT_SMOKE=PASS
