# Seven AI — Implementation Truth Matrix

This file separates architecture from shipped behavior. A subsystem is not complete because a prompt, document, button, or API name exists.

## Definition of done

A Seven subsystem is **DONE** only when all four are true:

1. **Implemented**: executable code exists.
2. **Wired**: the normal user flow actually invokes it.
3. **Verified**: deterministic/browser/device evidence exists for the important path.
4. **Recoverable**: failure has an explicit BLOCKED, FAIL, INCONCLUSIVE, retry, fallback, or recovery state.

Anything else is marked partial.

## Current implementation map

| System | Executable core | Normal-flow wiring | Verification | Current truth |
| --- | --- | --- | --- | --- |
| Chat / rooms | Yes | Yes | Browser + persistence gates exist | Strong, not final-production certified |
| Room persistence | IndexedDB adapter | Yes | Browser gate exists | Strong |
| Memory Fabric | Canonical objects, event history, origin-bound permission primitives | Partial | Memory + runtime smoke | Partial versus Architecture v4 target |
| Context Workspace | Pin/compress/expand/evict/reconstruct primitives | Partial | Runtime smoke | Partial |
| Tool Fabric | Capability normalization, aliases, schema/risk/permission gates | Partial | Runtime smoke | Partial, external adapters/effect recovery remain |
| Model Fabric | Provider routing pieces, health/free-proof/evolution modules | Partial | Deterministic evolution tests | Partial, live provider proof still required |
| Local Intelligence | Deterministic embedding/classification helpers | Partial | Runtime smoke | Foundation implemented |
| Research Runtime | Evidence envelope/citation-lock foundations | Partial | Runtime smoke | Early partial, not full fetch/compare/contradiction pipeline |
| Coding Runtime | Repo-map/patch/evidence foundations plus evolution modules | Partial | Runtime + evolution tests | Partial, real platform shell/file bridge remains |
| Canon Runtime | Source authority, knowledge horizon, anchors, branch/debt audit | Packaged release API | Unit + browser release test | Implemented foundation |
| Real Works Runtime | Source-bound beat order, fidelity status, branch-on-divergence, player-agency lock | Packaged release API; chat orchestration wiring still pending | Unit gate added | New functional foundation |
| Titles System | Deterministic per-world naming rules for episode/chapter/arc/side story/special/what-if/filler/game | Available through World Runtime; product UI wiring pending | Unit gate added | New functional foundation |
| UI Design System | Release CSS layer, adaptive tiers, reduced motion | Yes through release build | Browser/static release gates | Stronger in current polish branch |
| UI Runtime | Semantic message/composer/tool state, accessibility hooks, zero-polling observers | Yes through release build | Browser gate added | New functional layer |
| Motion System | Event-delegated reveals, press states, theme motion | Yes | Browser + reduced-motion gate | Strong |
| Performance Runtime | Lite/balanced/full tiers, long-task downgrade, idle/frame scheduling | Yes | Browser/static gate | Strong |
| PDF Runtime | Lazy local PDF.js packaging | Yes | Browser/static gate | Strong |
| Android packaging | Capacitor generation, asset preparation, APK verification workflow | Build pipeline | GitHub Actions pipeline exists | Packaging implemented; device/live-provider proof must remain explicit |
| Android SAF / Keystore | No final integration | No | No | Planned |
| MCP / A2A / AG-UI | Architecture target | No | No | Planned |
| Full observability / OpenTelemetry alignment | Partial counters/modules | Partial | Partial | Planned/partial |

## UI polish rules

The UI is treated as a runtime surface, not decoration.

- Mobile-first reachability and safe-area support.
- No polling animation loops.
- Reduced Motion is authoritative.
- Performance tier can remove blur, glow, decoration, and expensive motion.
- Message rendering keeps `content-visibility` optimization.
- Composer state reflects actual busy/ready state.
- Tool toggles expose semantic pressed state as well as visual state.
- Chat is an accessible live log.
- Expensive visual effects are optional and never required for functionality.

## World / Real Works rules

- Canon order is source-bound, not model-memory-bound.
- Missing source references produce `UNVERIFIED` or `INCONCLUSIVE`, never fake certainty.
- Divergent choices create a branch instead of silently rewriting the original work.
- The runtime cannot invent the player's irreversible action, intention, or emotion.
- Naming is deterministic from a world's title rules and can be customized without changing state authority.
- Full work ingestion still needs source acquisition, normalization, provenance binding, and user-facing orchestration.

## Next integration gates

1. Merge the UI + World runtime only after full CI is green.
2. Wire World Runtime into the RPG conversation controller so contracts are used before generation and commits happen after verified scene output.
3. Promote Research from evidence-envelope primitives to real Search → Fetch → Extract → Compare → Verify → Cite.
4. Promote Coding from repository primitives to the platform file/shell bridge with inspect/edit/test/diff evidence.
5. Finish Model Fabric live free-proof/health/fallback validation without claiming external resources are unlimited.
6. Move remaining canonical persistence away from bounded localStorage where practical.
7. Add Android SAF/Keystore, then run real-device startup, storage, cancellation, offline/fallback, and provider tests.
8. Only after those gates, call the complete product release-ready.
