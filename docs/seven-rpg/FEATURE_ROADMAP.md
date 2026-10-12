# Seven RPG — Comprehensive Feature Roadmap

Status: PLANNED, NOT IMPLEMENTED by virtue of inclusion. Each item requires code, tests and evidence. Updated 2026-10-12.
Repository: Awfdfhy/seven-ai-true; branch rpg/standalone-20261011.

## Rules
- Focus exclusively on standalone RPG. Never merge to main, delete user data or repositories, or bypass gates.
- P0 before P1 before P2 before P3. Prefer repairing regressions to adding features.
- Each iteration: inspect actual code and CI; select one scoped task; document design; implement smallest safe change; test locally; commit to RPG branch; verify CI on that exact SHA; update progress and move to next.
- Labels describe proposed functionality. Audit whether already implemented before starting. Do not duplicate existing functions.
- For live providers: require actual credentials/real HTTP; BLOCKED if absent, never fake tests or expose secrets.
- For Canon import: require atomic persistence and rollback. If impossible safely, retain warning and defer; do not claim complete restoration.
- Run long-running process only with explicit configured host, authorization, model quotas and supervision; no infinite guarantee.

## Backlog (227 candidates)

| ID | Priority | Domain | Feature / acceptance target | State |
|---|---|---|---|---|
| RPG-01-01 | P0 | Release Integrity | backup atomic world canon restore | TODO audit |
| RPG-01-02 | P0 | Release Integrity | backup rollback failed write | TODO audit |
| RPG-01-03 | P0 | Release Integrity | backup schema validation | TODO audit |
| RPG-01-04 | P0 | Release Integrity | backup migrations | TODO audit |
| RPG-01-05 | P0 | Release Integrity | backup integrity checksum | TODO audit |
| RPG-01-06 | P0 | Release Integrity | cross-world isolation | TODO audit |
| RPG-01-07 | P0 | Release Integrity | restart persistence | TODO audit |
| RPG-01-08 | P0 | Release Integrity | force-stop persistence | TODO audit |
| RPG-01-09 | P0 | Release Integrity | SAF permissions | TODO audit |
| RPG-01-10 | P0 | Release Integrity | provider real inference | TODO audit |
| RPG-01-11 | P0 | Release Integrity | provider secret isolation | TODO audit |
| RPG-01-12 | P0 | Release Integrity | Android 14 smoke | TODO audit |
| RPG-01-13 | P0 | Release Integrity | Android 16 smoke | TODO audit |
| RPG-01-14 | P0 | Release Integrity | APK signing identity provenance | TODO audit |
| RPG-01-15 | P0 | Release Integrity | CI artifact release gate | TODO audit |
| RPG-02-01 | P1 | RPG Foundation | world creation wizard | TODO audit |
| RPG-02-02 | P1 | RPG Foundation | world templates | TODO audit |
| RPG-02-03 | P1 | RPG Foundation | multi world library | TODO audit |
| RPG-02-04 | P1 | RPG Foundation | world rename and archive | TODO audit |
| RPG-02-05 | P1 | RPG Foundation | world delete with confirmation | TODO audit |
| RPG-02-06 | P1 | RPG Foundation | world export preview | TODO audit |
| RPG-02-07 | P1 | RPG Foundation | world import preview | TODO audit |
| RPG-02-08 | P1 | RPG Foundation | campaign settings | TODO audit |
| RPG-02-09 | P1 | RPG Foundation | session timeline | TODO audit |
| RPG-02-10 | P1 | RPG Foundation | session checkpoints | TODO audit |
| RPG-02-11 | P1 | RPG Foundation | session branching | TODO audit |
| RPG-02-12 | P1 | RPG Foundation | replay read only | TODO audit |
| RPG-02-13 | P1 | RPG Foundation | world rules schema | TODO audit |
| RPG-02-14 | P1 | RPG Foundation | difficulty and tone profiles | TODO audit |
| RPG-02-15 | P1 | RPG Foundation | offline read only | TODO audit |
| RPG-03-01 | P1 | Canon Continuity | canon authority tiers | TODO audit |
| RPG-03-02 | P1 | Canon Continuity | immutable hard canon | TODO audit |
| RPG-03-03 | P1 | Canon Continuity | canon conflict suggestions | TODO audit |
| RPG-03-04 | P1 | Canon Continuity | canon audit journal | TODO audit |
| RPG-03-05 | P1 | Canon Continuity | canon revision history | TODO audit |
| RPG-03-06 | P1 | Canon Continuity | canon diff viewer | TODO audit |
| RPG-03-07 | P1 | Canon Continuity | canon character links | TODO audit |
| RPG-03-08 | P1 | Canon Continuity | canon place links | TODO audit |
| RPG-03-09 | P1 | Canon Continuity | canon timeline links | TODO audit |
| RPG-03-10 | P1 | Canon Continuity | canon spoiler boundaries | TODO audit |
| RPG-03-11 | P1 | Canon Continuity | canon provenance | TODO audit |
| RPG-03-12 | P1 | Canon Continuity | canon import mapping | TODO audit |
| RPG-03-13 | P1 | Canon Continuity | canon merge preview | TODO audit |
| RPG-03-14 | P1 | Canon Continuity | canon contradiction reports | TODO audit |
| RPG-03-15 | P1 | Canon Continuity | canon recovery | TODO audit |
| RPG-04-01 | P1 | Characters | character sheets | TODO audit |
| RPG-04-02 | P1 | Characters | NPC profiles | TODO audit |
| RPG-04-03 | P1 | Characters | traits and drives | TODO audit |
| RPG-04-04 | P1 | Characters | goals and fears | TODO audit |
| RPG-04-05 | P1 | Characters | motivation evolution | TODO audit |
| RPG-04-06 | P1 | Characters | character memory | TODO audit |
| RPG-04-07 | P1 | Characters | relationship graph | TODO audit |
| RPG-04-08 | P1 | Characters | relationship history | TODO audit |
| RPG-04-09 | P1 | Characters | trust metrics | TODO audit |
| RPG-04-10 | P1 | Characters | reputation | TODO audit |
| RPG-04-11 | P1 | Characters | faction affinity | TODO audit |
| RPG-04-12 | P1 | Characters | knowledge boundaries | TODO audit |
| RPG-04-13 | P1 | Characters | secret reveal rules | TODO audit |
| RPG-04-14 | P1 | Characters | character portrait support | TODO audit |
| RPG-04-15 | P1 | Characters | character dialogue styles | TODO audit |
| RPG-05-01 | P1 | Narration | narrator vs dialogue styling | TODO audit |
| RPG-05-02 | P1 | Narration | character speaker attribution | TODO audit |
| RPG-05-03 | P1 | Narration | player agency hard lock | TODO audit |
| RPG-05-04 | P1 | Narration | scene cards | TODO audit |
| RPG-05-05 | P1 | Narration | chapter titles | TODO audit |
| RPG-05-06 | P1 | Narration | episode arcs | TODO audit |
| RPG-05-07 | P1 | Narration | scene objectives | TODO audit |
| RPG-05-08 | P1 | Narration | pacing controls | TODO audit |
| RPG-05-09 | P1 | Narration | recap on return | TODO audit |
| RPG-05-10 | P1 | Narration | story choices optional | TODO audit |
| RPG-05-11 | P1 | Narration | dialogue variants | TODO audit |
| RPG-05-12 | P1 | Narration | NPC initiative | TODO audit |
| RPG-05-13 | P1 | Narration | narrative consequences | TODO audit |
| RPG-05-14 | P1 | Narration | foreshadowing tracker | TODO audit |
| RPG-05-15 | P1 | Narration | tone consistency | TODO audit |
| RPG-06-01 | P1 | Memory | episodic memory | TODO audit |
| RPG-06-02 | P1 | Memory | semantic memory | TODO audit |
| RPG-06-03 | P1 | Memory | working memory | TODO audit |
| RPG-06-04 | P1 | Memory | long term memory | TODO audit |
| RPG-06-05 | P1 | Memory | character scoped memories | TODO audit |
| RPG-06-06 | P1 | Memory | relationship memories | TODO audit |
| RPG-06-07 | P1 | Memory | location memories | TODO audit |
| RPG-06-08 | P1 | Memory | event salience scoring | TODO audit |
| RPG-06-09 | P1 | Memory | retrieval evidence | TODO audit |
| RPG-06-10 | P1 | Memory | memory deduplication | TODO audit |
| RPG-06-11 | P1 | Memory | memory compaction | TODO audit |
| RPG-06-12 | P1 | Memory | context window budgeting | TODO audit |
| RPG-06-13 | P1 | Memory | Arabic token estimates | TODO audit |
| RPG-06-14 | P1 | Memory | memory correction workflow | TODO audit |
| RPG-06-15 | P1 | Memory | memory forgetting policy | TODO audit |
| RPG-07-01 | P1 | LLM Runtime | provider status | TODO audit |
| RPG-07-02 | P1 | LLM Runtime | model picker persistence | TODO audit |
| RPG-07-03 | P1 | LLM Runtime | fallback with explicit consent | TODO audit |
| RPG-07-04 | P1 | LLM Runtime | streaming generation | TODO audit |
| RPG-07-05 | P1 | LLM Runtime | cancel streaming | TODO audit |
| RPG-07-06 | P1 | LLM Runtime | retry idempotency | TODO audit |
| RPG-07-07 | P1 | LLM Runtime | timeouts | TODO audit |
| RPG-07-08 | P1 | LLM Runtime | rate limit UX | TODO audit |
| RPG-07-09 | P1 | LLM Runtime | context injection contract | TODO audit |
| RPG-07-10 | P1 | LLM Runtime | structured response parser | TODO audit |
| RPG-07-11 | P1 | LLM Runtime | invalid JSON recovery | TODO audit |
| RPG-07-12 | P1 | LLM Runtime | prompt injection defenses | TODO audit |
| RPG-07-13 | P1 | LLM Runtime | local model support optional | TODO audit |
| RPG-07-14 | P1 | LLM Runtime | usage and token transparency | TODO audit |
| RPG-07-15 | P1 | LLM Runtime | real inference acceptance | TODO audit |
| RPG-08-01 | P2 | Progression | optional rulesets | TODO audit |
| RPG-08-02 | P2 | Progression | character levels | TODO audit |
| RPG-08-03 | P2 | Progression | experience | TODO audit |
| RPG-08-04 | P2 | Progression | skill checks | TODO audit |
| RPG-08-05 | P2 | Progression | skill tree | TODO audit |
| RPG-08-06 | P2 | Progression | abilities | TODO audit |
| RPG-08-07 | P2 | Progression | cooldowns | TODO audit |
| RPG-08-08 | P2 | Progression | status conditions | TODO audit |
| RPG-08-09 | P2 | Progression | quest journal | TODO audit |
| RPG-08-10 | P2 | Progression | achievements | TODO audit |
| RPG-08-11 | P2 | Progression | milestones | TODO audit |
| RPG-08-12 | P2 | Progression | titles | TODO audit |
| RPG-08-13 | P2 | Progression | inventory | TODO audit |
| RPG-08-14 | P2 | Progression | equipment | TODO audit |
| RPG-08-15 | P2 | Progression | loot and rewards | TODO audit |
| RPG-08-16 | P2 | Progression | crafting | TODO audit |
| RPG-09-01 | P2 | World Simulation | locations directory | TODO audit |
| RPG-09-02 | P2 | World Simulation | interactive world map | TODO audit |
| RPG-09-03 | P2 | World Simulation | travel ledger | TODO audit |
| RPG-09-04 | P2 | World Simulation | weather fiction state | TODO audit |
| RPG-09-05 | P2 | World Simulation | calendar | TODO audit |
| RPG-09-06 | P2 | World Simulation | day night cycle | TODO audit |
| RPG-09-07 | P2 | World Simulation | NPC schedules | TODO audit |
| RPG-09-08 | P2 | World Simulation | economy ledger | TODO audit |
| RPG-09-09 | P2 | World Simulation | shops and barter | TODO audit |
| RPG-09-10 | P2 | World Simulation | politics | TODO audit |
| RPG-09-11 | P2 | World Simulation | factions | TODO audit |
| RPG-09-12 | P2 | World Simulation | kingdoms | TODO audit |
| RPG-09-13 | P2 | World Simulation | diplomacy | TODO audit |
| RPG-09-14 | P2 | World Simulation | territory influence | TODO audit |
| RPG-09-15 | P2 | World Simulation | persistent consequences | TODO audit |
| RPG-10-01 | P2 | Combat | optional turn based combat | TODO audit |
| RPG-10-02 | P2 | Combat | combat narration | TODO audit |
| RPG-10-03 | P2 | Combat | initiative | TODO audit |
| RPG-10-04 | P2 | Combat | turn order UI | TODO audit |
| RPG-10-05 | P2 | Combat | action points | TODO audit |
| RPG-10-06 | P2 | Combat | health and resources | TODO audit |
| RPG-10-07 | P2 | Combat | skill resolution | TODO audit |
| RPG-10-08 | P2 | Combat | status effects | TODO audit |
| RPG-10-09 | P2 | Combat | enemy intent | TODO audit |
| RPG-10-10 | P2 | Combat | combat log | TODO audit |
| RPG-10-11 | P2 | Combat | retreat and surrender | TODO audit |
| RPG-10-12 | P2 | Combat | nonviolent alternatives | TODO audit |
| RPG-10-13 | P2 | Combat | balance profiles | TODO audit |
| RPG-10-14 | P2 | Combat | difficulty modifiers | TODO audit |
| RPG-10-15 | P2 | Combat | deterministic replays | TODO audit |
| RPG-11-01 | P2 | RPG UI | RPG-only app shell | TODO audit |
| RPG-11-02 | P2 | RPG UI | mobile portrait layout | TODO audit |
| RPG-11-03 | P2 | RPG UI | landscape layout | TODO audit |
| RPG-11-04 | P2 | RPG UI | RTL localization | TODO audit |
| RPG-11-05 | P2 | RPG UI | Arabic UI | TODO audit |
| RPG-11-06 | P2 | RPG UI | accessible controls | TODO audit |
| RPG-11-07 | P2 | RPG UI | keyboard focus | TODO audit |
| RPG-11-08 | P2 | RPG UI | screen reader labels | TODO audit |
| RPG-11-09 | P2 | RPG UI | reduced motion | TODO audit |
| RPG-11-10 | P2 | RPG UI | light dark themes | TODO audit |
| RPG-11-11 | P2 | RPG UI | custom typography | TODO audit |
| RPG-11-12 | P2 | RPG UI | story typography | TODO audit |
| RPG-11-13 | P2 | RPG UI | character cards | TODO audit |
| RPG-11-14 | P2 | RPG UI | world dashboard | TODO audit |
| RPG-11-15 | P2 | RPG UI | contextual command palette | TODO audit |
| RPG-11-16 | P2 | RPG UI | loading and offline states | TODO audit |
| RPG-12-01 | P2 | Assets Media | character portraits | TODO audit |
| RPG-12-02 | P2 | Assets Media | world illustrations opt in | TODO audit |
| RPG-12-03 | P2 | Assets Media | asset library | TODO audit |
| RPG-12-04 | P2 | Assets Media | image attachment | TODO audit |
| RPG-12-05 | P2 | Assets Media | scene backgrounds | TODO audit |
| RPG-12-06 | P2 | Assets Media | music optional | TODO audit |
| RPG-12-07 | P2 | Assets Media | SFX optional | TODO audit |
| RPG-12-08 | P2 | Assets Media | performance aware animations | TODO audit |
| RPG-12-09 | P2 | Assets Media | content filters | TODO audit |
| RPG-12-10 | P2 | Assets Media | asset backup manifests | TODO audit |
| RPG-12-11 | P2 | Assets Media | placeholder fallback | TODO audit |
| RPG-12-12 | P2 | Assets Media | copyright safe sourcing | TODO audit |
| RPG-12-13 | P2 | Assets Media | image caching | TODO audit |
| RPG-12-14 | P2 | Assets Media | offline asset access | TODO audit |
| RPG-12-15 | P2 | Assets Media | media accessibility | TODO audit |
| RPG-13-01 | P2 | Player Tools | save slots | TODO audit |
| RPG-13-02 | P2 | Player Tools | quick save checkpoint | TODO audit |
| RPG-13-03 | P2 | Player Tools | story search | TODO audit |
| RPG-13-04 | P2 | Player Tools | bookmark scenes | TODO audit |
| RPG-13-05 | P2 | Player Tools | highlight quotes | TODO audit |
| RPG-13-06 | P2 | Player Tools | export transcript | TODO audit |
| RPG-13-07 | P2 | Player Tools | share spoiler free recap | TODO audit |
| RPG-13-08 | P2 | Player Tools | notes journal | TODO audit |
| RPG-13-09 | P2 | Player Tools | player authored canon requests | TODO audit |
| RPG-13-10 | P2 | Player Tools | world glossary | TODO audit |
| RPG-13-11 | P2 | Player Tools | NPC directory | TODO audit |
| RPG-13-12 | P2 | Player Tools | relationship viewer | TODO audit |
| RPG-13-13 | P2 | Player Tools | timeline explorer | TODO audit |
| RPG-13-14 | P2 | Player Tools | session comparison | TODO audit |
| RPG-13-15 | P2 | Player Tools | undo uncommitted action | TODO audit |
| RPG-14-01 | P2 | Testing Performance | 1000-event campaigns | TODO audit |
| RPG-14-02 | P2 | Testing Performance | 500-message UI regression | TODO audit |
| RPG-14-03 | P2 | Testing Performance | 10k-event stress test | TODO audit |
| RPG-14-04 | P2 | Testing Performance | low memory recovery | TODO audit |
| RPG-14-05 | P2 | Testing Performance | large backup rejection | TODO audit |
| RPG-14-06 | P2 | Testing Performance | corrupt storage quarantine | TODO audit |
| RPG-14-07 | P2 | Testing Performance | Android upgrade retention | TODO audit |
| RPG-14-08 | P2 | Testing Performance | battery use | TODO audit |
| RPG-14-09 | P2 | Testing Performance | startup speed | TODO audit |
| RPG-14-10 | P2 | Testing Performance | render latency | TODO audit |
| RPG-14-11 | P2 | Testing Performance | memory leaks | TODO audit |
| RPG-14-12 | P2 | Testing Performance | storage growth | TODO audit |
| RPG-14-13 | P2 | Testing Performance | CI diagnostics | TODO audit |
| RPG-14-14 | P2 | Testing Performance | visual screenshots | TODO audit |
| RPG-14-15 | P2 | Testing Performance | release smoke matrix | TODO audit |
| RPG-15-01 | P3 | Advanced Future | multi-character parties | TODO audit |
| RPG-15-02 | P3 | Advanced Future | co-op architecture research only | TODO audit |
| RPG-15-03 | P3 | Advanced Future | modular plugins sandboxed | TODO audit |
| RPG-15-04 | P3 | Advanced Future | custom world rule editor | TODO audit |
| RPG-15-05 | P3 | Advanced Future | canon policy editor | TODO audit |
| RPG-15-06 | P3 | Advanced Future | story generator templates | TODO audit |
| RPG-15-07 | P3 | Advanced Future | GM tools | TODO audit |
| RPG-15-08 | P3 | Advanced Future | scenario packs | TODO audit |
| RPG-15-09 | P3 | Advanced Future | event scheduler | TODO audit |
| RPG-15-10 | P3 | Advanced Future | emergent rumors | TODO audit |
| RPG-15-11 | P3 | Advanced Future | NPC offscreen simulation | TODO audit |
| RPG-15-12 | P3 | Advanced Future | dynamic quest graph | TODO audit |
| RPG-15-13 | P3 | Advanced Future | world history atlas | TODO audit |
| RPG-15-14 | P3 | Advanced Future | campaign analytics | TODO audit |
| RPG-15-15 | P3 | Advanced Future | localized narrator voices optional | TODO audit |

## Mandatory acceptance
- Functional automated tests, negative/corruption cases, no player-control or hard canon regressions.
- Android 14/16 startup and core interactions, persistence after restart.
- Real model inference test separately marked BLOCKED if credentials unavailable.
- APK artifact and SHA/provenance; no release unless all mandatory checks PASS.

## OpenCode ongoing task contract
Read this roadmap alongside docs/seven-rpg/OPENCODE_CONTINUOUS_PLAN.md. Always choose highest severity unresolved failing test or highest-priority feasible TODO. Update docs/seven-rpg/OPENCODE_PROGRESS.md with attempted ID, evidence, commit, CI run URL and next item. Conclude each iteration and let external loop schedule next run. Never silently change workflow permissions or secrets.
