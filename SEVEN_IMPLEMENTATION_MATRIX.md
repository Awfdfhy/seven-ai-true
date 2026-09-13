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
| Research Runtime | Claim-evidence matrix, freshness/contradiction/gap analysis, citation locks and follow-up actions | Packaged verification API; live search/fetch orchestration remains partial | Unit gate + release size gate | Verification foundation implemented; acquisition/orchestration still partial |
| Coding Runtime | Repo-map/patch/evidence foundations plus evolution modules | Partial | Runtime + evolution tests | Partial, real platform shell/file bridge remains |
| Canon Runtime | Source authority, knowledge horizon, anchors, branch/debt audit | Packaged release API | Unit + browser release test | Implemented foundation |
| Real Works Runtime | Source-bound beat order, fidelity status, branch-on-divergence, player-agency lock | Packaged release API; chat orchestration wiring still pending | Unit gate added | Functional foundation |
| Titles System | Deterministic per-world naming rules for episode/chapter/arc/side story/special/what-if/filler/game | Available through World Runtime; product UI wiring pending | Unit gate added | Functional foundation |
| UI Design System | Release CSS layer, adaptive tiers, reduced motion | Yes through release build | Browser/static release gates | Strong |
| UI Runtime | Semantic message/composer/tool state, accessibility hooks, zero-polling observers | Yes through release build | Browser gate added | Functional layer |
| Motion System | Event-delegated reveals, press states, theme motion | Yes | Browser + reduced-motion gate | Strong |
| Performance Runtime | Lite/balanced/full tiers, long-task downgrade, idle/frame scheduling | Yes | Browser/static gate | Strong |
| PDF Runtime | Lazy local PDF.js packaging | Yes | Browser/static gate | Strong |
| Evaluation Baseline | Frozen cross-system JSONL corpus + baseline identity | Build/evolution gates | Corpus integrity CI gate | Implemented baseline; live model/device quality remains measured separately |
| Evolution Promotion Safety | Transactional apply/verify/rollback plus baseline/corpus identity lock | Autonomous promotion runner | Evolution test suite | Strong fail-closed promotion foundation |
| Android packaging | Capacitor generation, asset preparation, APK verification workflow | Build pipeline | GitHub Actions + Android 16 WebView smoke | Packaging and emulator smoke implemented; real-phone battery/RAM/thermal and live-provider proof remain explicit |
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

## Research verification rules

- Claims are explicit objects, not implicit prose guesses.
- Evidence is bound to a source, stance, locator, authority class, and transformation.
- Time-sensitive claims are checked against a freshness window.
- Supporting and contradicting evidence produce a conflict instead of false certainty.
- Missing evidence produces a gap; stale evidence produces a freshness-search action.
- Citation locks contain only valid, non-stale supporting source URLs.
- `PASS` is impossible while a claim is GAP, STALE, UNCITABLE, or CONFLICT.
- Search/fetch/extract adapters remain separate acquisition layers and cannot self-certify their own output.

## Evolution promotion rules

- Candidate promotion is bound to a frozen evaluation identity.
- The identity contains baseline commit, corpus version, task count, and SHA-256 corpus hash.
- Missing or drifted evaluation identity fails before repository inspection or mutation.
- A benchmark change requires a new deliberate baseline/evaluation cycle.
- CI or regression failure after apply requires rollback; rollback failure is never reported as success.
- Benchmark improvement cannot override a critical security, permission, persistence, or crash regression.

## Next integration gates

1. Wire World Runtime into the RPG conversation controller so contracts are used before generation and commits happen after verified scene output.
2. Connect Research acquisition adapters to the verification runtime: Search → Fetch → Extract → Matrix → Verify → Cite.
3. Promote Coding from repository primitives to the platform file/shell bridge with inspect/edit/test/diff evidence.
4. Finish Model Fabric live free-proof/health/fallback validation without claiming external resources are unlimited.
5. Move remaining canonical persistence away from bounded localStorage where practical.
6. Add Android SAF/Keystore, then run real-device startup, storage, cancellation, offline/fallback, and provider tests.
7. Add protocol adapters only after their underlying capabilities are authoritative and tested.
8. Only after those gates, call the complete product release-ready.
