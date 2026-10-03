# Team B — Live Runtime Smoke Report (B03)

## Identity
- Team: B
- Worker: B03
- Agent: Gemini CLI
- Date: 2026-10-03
- Branch: agent-b/03-canon-retrieval

## Mission
B03 owns RPG canon/lore retrieval, grounded context selection, and contradiction
evidence. In practice: when the RPG engine builds the next-turn context, B03's
scope is the machinery that (1) retrieves only the canon facts and lore relevant
to the current scene, (2) compiles a bounded, grounded context projection instead
of dumping raw world history, and (3) detects when a model-proposed candidate
fact contradicts established canon and produces evidence for repair rather than
letting it silently promote. Canon constraints must stay invisible to the player —
a constraint system, not a UI burden — and character-local knowledge must remain
strictly partitioned from global narrator knowledge.

## Live smoke scope
This was a controlled live runtime smoke: report-only verification against the
RPG V2 product contract and team ownership/lease state. No repository files were
modified other than this report. No credentials or environment variables were
inspected, and no network requests were made.

## Canon / retrieval / grounding risks

1. **Silent canon promotion.** A model-invented "fact" can be written into the
   immutable canon layer without a contradiction check against high-confidence
   established facts, permanently corrupting continuity (violates RPG-06 and the
   "never silently promote model invention into immutable canon" clause).
   Mitigation: candidate facts must enter a pending state with provenance, pass a
   contradiction gate, and only then be promoted; conflicts must surface
   evidence (source fact, conflicting claim, confidence) for repair.

2. **Character/global knowledge bleed.** Character-local knowledge (what Character
   A was told) can leak into the global narrator context, causing Character B to
   act on information they should not have (violates RPG-03 and the memory
   requirement that character knowledge must not automatically equal narrator
   knowledge). Mitigation: retrieval must filter facts by per-character knowledge
   sets and only merge on explicit, provenance-tracked propagation events.

3. **Unbounded context projection.** The engine may send the entire raw world
   history on every request, blowing the performance budget and burying relevant
   canon under noise (violates the performance budget: compile only the relevant
   bounded context for the next turn). Mitigation: retrieval must rank and
   truncate canon/state/lore to a bounded window with recency, relevance, and
   contradiction-freshness signals.

## Lease / ownership check
- Team B lease (ownership.json): release/workspaces/rpg.js,
  release/world-runtime.js, release/canon-simulator.js — active, exclusive.
- B03 made no writes to those files in this smoke; report-only.
- Shared-core writes (sharedReadOnlyByDefault) remain manager-lease-gated; none
  attempted.

## Result
Live smoke completed: identity, mission, risk set, and branch verified against
.seven-team/PROTOCOL.md, .seven-team/ownership.json, and
.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md. No failures observed in this
report-only probe.

LIVE_AGENT_SMOKE=PASS
