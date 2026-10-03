# B09 RPG V2 Performance Audit Report

## Evidence Base
- **Primary**: `release/workspaces/rpg.js` (lines 3-38 shown)
- **Missing**: `SevenWorld`, `SevenCanon` engine implementations; persistence layer; UI update pipeline; token counting utilities

## Current Costs & Risks (Located)
- **Context per turn**: `snapshot()` (L23) serializes `worldEngine.work`, `worldSession`, `canonPack`, `canonSession` — full object graphs, no budgeting
- **State projection**: `currentContract()` (L26) calls `worldEngine.sceneContract()` each render; `renderStatus()` (L37) calls it + `aura()` (L22) which runs `canonEngine.audit()` — **O(n) canon audit per UI frame**
- **Persistence writes**: `snapshot()` used for save; no incremental/dirty tracking; `loadWork`/`loadCanon` (L24-25) rebuild engines from full packs
- **UI update costs**: `renderStatus()` → `renderTitles()` → DOM mutations per title row; `aura()` dispatches `SevenAurora.set()` — synchronous layout thrash risk
- **Token leakage risk**: `canonEngine.audit()` exposes `characterKnowledge.status` (L22) — if audit includes raw knowledge, context may leak

## Bounded Context Policy (Inferred)
- **World context**: `worldSession` + current `sceneContract` only
- **Canon context**: `canonSession` + audit summary (pass/fail), **not** raw knowledge
- **Turn input**: `commitVerifiedBeat` (L28) requires `verified:true` + `beatId` + `playerAction` — minimal
- **Delta input**: `applyVerifiedDelta` (L29) requires `verified:true` + delta + meta — minimal
- **Missing**: explicit context window cap; no truncation/summarization in `snapshot()`

## Token/Latency Budgets (Proposed)
| Path | Budget | Measurement Point |
|------|--------|-------------------|
| Turn context build | ≤ 2,000 tokens | `snapshot()` output length |
| Canon audit | ≤ 15 ms | `aura()` duration |
| World commit | ≤ 10 ms | `commitVerifiedBeat` duration |
| Canon delta apply | ≤ 10 ms | `applyVerifiedDelta` duration |
| UI render (status+titles) | ≤ 5 ms | `renderStatus` + `renderTitles` |
| Persistence write | ≤ 20 ms | `snapshot()` + storage write |

## Persistence Hot-Path Policy
- **Write trigger**: only on `commitVerifiedBeat` success, `applyVerifiedDelta` success, `recordTitle` success
- **Format**: incremental — dirty flags on `worldSession`/`canonSession`; write only changed subtrees
- **Read**: lazy-load engines; `loadWork`/`loadCanon` accept pre-built engines to avoid re-parse
- **Unknown**: no `localStorage`/IndexedDB code visible — assume external

## 20-Turn Measurement Plan
1. **Seed**: load canonical world pack (measure `loadWork` + `loadCanon`)
2. **Turns 1-20**: for each — `commitVerifiedBeat` (verified beat) → `applyVerifiedDelta` (canon delta) → `renderStatus` → `snapshot`
3. **Metrics per turn**: context tokens, audit latency, commit latency, delta latency, render latency, snapshot size
4. **Assertions**: p95 latency < budgets; context tokens monotonic ≤ budget; zero `characterKnowledge` in serialized context

## Exact Files & Functions
| Concern | File | Functions |
|---------|------|-----------|
| Context build | `rpg.js` | `snapshot()`, `currentContract()` |
| Canon audit | `rpg.js` | `aura()` → `canonEngine.audit()` |
| World commit | `rpg.js` | `commitVerifiedBeat()`, `beatById()` |
| Canon delta | `rpg.js` | `applyVerifiedDelta()` |
| Title/auto-title | `rpg.js` | `autoTitle()`, `recordTitle()`, `titleItems()` |
| UI render | `rpg.js` | `renderStatus()`, `renderTitles()`, `notice()` |
| Persistence | `rpg.js` | `snapshot()` (serialize), `loadWork()`, `loadCanon()` (deserialize) |
| Engine internals | **Unknown** | `SevenWorld.createEngine`, `SevenCanon.createEngine`, `sceneContract`, `commitBeat`, `applySceneDelta`, `audit`, `pack` |

## First Optimization Slice
1. **Cap context**: modify `snapshot()` to return `{ worldSession: minimalSessionView(worldSession), canonSession: minimalSessionView(canonSession), contract: currentContract() }` — drop `work`/`pack`
2. **Debounce audit**: `aura()` → run canon audit ≤ 1×/500ms; cache last result
3. **Incremental persist**: add `dirty` flags to sessions; `snapshot()` writes only dirty paths
4. **Virtualize titles**: `renderTitles()` → render only visible rows (current list unbounded)

## Correctness Guardrails
- **Knowledge leak**: unit test — `snapshot()` output JSON must not contain `characterKnowledge`, `invariantDetails`, `futureAnchorDetails`
- **State drop**: property test — after 20 turns, `loadWork(snapshot)` → `worldSession` equals pre-save session (deep equal on canonical fields)
- **Audit integrity**: `aura()` warning iff `audit().characterKnowledge.status === 'FAIL'` — no silent degradation
- **Verified-only**: `commitVerifiedBeat`/`applyVerifiedDelta` reject unverified inputs (L28-29) — enforce at engine boundary

## Unknowns Requiring Upstream Evidence
- `SevenWorld`/`SevenCanon` engine sizes, `audit()` output schema, `sceneContract()` complexity
- Persistence backend (localStorage/IndexedDB/remote) and write amplification
- Token estimator (tiktoken? custom?) for context budgeting
- `SevenAurora` integration latency
WAVE01=COMPLETE
