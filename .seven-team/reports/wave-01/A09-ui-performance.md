# A09 — UI Foundation V2 Performance Baseline & Budgets

## Scope & Method
Read-only inspection of `seven_ai-final.html`, `release/ui-runtime.js`, `release/beta-ui-runtime.js`, `release/motion-runtime.js`, and existing perf tests in `verify.cjs`. No source edits.

## Verified Hotspots (file:line refs)
1. **Full-DOM rebuild on every chat change** — `seven_ai-final.html:1841` `renderChatHistory()` wipes `chatDiv.innerHTML=""` then re-adds all messages from `start` to end. Triggers on every `addMessage`, `setCurrentRoom`, summary insert, and streaming completion (`1655`, `1686`, `1773`, `1787`, `1796`, `4685`, `4870`, `4885`).
2. **MutationObserver fan-out** — `motion-runtime.js:107` observes `#chat` with `{childList,subtree:true}` then calls `requestAnimationFrame` per record → `reveal()` + layout. Plus `ui-runtime.js:60` messageObserver, `beta-ui-runtime.js:36,40` observers on `.tool-btn.toggle`, deep-think toggles, stop button, and `materialize-remake-assets.cjs:84,97` RTL `translate()` observer on workspace root firing RAF `translate(root)`.
3. **Per-element `getComputedStyle`/`getBoundingClientRect` scans** — `ui-runtime.js:36,47` runs on every observer tick; verify perf tests confirm same pattern (`verify.cjs:184,197`). `motion-runtime.js:74` `getComputedStyle(stop).display`.
4. **Streaming writes** — `seven_ai-final.html:2043` `scheduleStreamingBubbleUpdate` batches via RAF (good) but `renderChatHistory()` at `:4506` is called on every chunk completion in some paths.
5. **Lazy loader RAF warm** — `release/ui-polish-loader.js:34` schedules `warm()` on `requestIdleCallback`/`requestAnimationFrame` at ready; triple script/link injection path.

## Baseline Metrics (CI-collectable)
- `verify.cjs:202` long-chat: 500-message history render + `querySelectorAll('.message')` count.
- `verify.cjs:206` show-earlier expand: before/after render count + `getChatRenderLimit`.
- `verify.cjs:210` streaming: `streamingUiMetrics.requests/writes/cancelledFrames` snapshot.
- Add: `performance.now()` marks around `renderChatHistory` and observer-caused RAF; `document.fonts.ready` duration; first interaction to `settingsModal` open.

## Budgets (Foundation V2)
| Interaction | Target (P75) | Current (estimate) |
|---|---|---|
| Cold startup → first paint | <1.2 s | untested (lazy loader injects at DOMContentLoaded RAF) |
| Navigation (room switch) | <200 ms | `renderChatHistory` full rebuild — likely >400 ms at 500 msgs |
| Settings dialog open | <150 ms | observer cascade risk |
| Long-chat append (new msg) | <32 ms / <16ms frame budget | full rebuild breaks this |
| Theme/RTL switch | <250 ms | per-element `translate()` observer + style recalcs |
| Scrollback expand (Show earlier) | <200 ms | currently two RAF frames |

## First Optimization Slice
**Replace full rebuild in `renderChatHistory` with diff/preservation** (`seven_ai-final.html:1841`):
- Keep existing `<div class="message">` nodes, only append/stitch new tail messages.
- Gate `showEarlierChatMessages` to insert only the delta (`+CHAT_RENDER_CHUNK`) at the top of the list, preserving existing nodes (avoids re-render flicker).
- This single change addresses hot path #1 and directly improves 4 of 6 budgets.

## Tests To Add
- `tests/perf/chat-render.spec.{js,cjs}`: render 500 msgs, assert `renderChatHistory` < 200 ms; assert node reuse count > 0.
- `tests/perf/streaming.spec`: 50-chunk bubble, assert `cancelledFrames === 0` and total writes batched to ≤5 RAF frames.
- `tests/perf/observer.spec`: assert messageObserver + motion chatObserver do not exceed 1 RAF per frame under burst add (count via `requestAnimationFrame` hook).

## Risks / Dependencies
- `addMessage` (`seven_ai-final.html:1628`) currently mutates `innerHTML` per assistant message via `renderMarkdown`; diff must avoid clashing with markdown re-render. Keep markdown render isolated from node-stitch.
- RTL `translate()` observer (`materialize-remake-assets.cjs:84,97`) runs on every character data change — pair with debounce (`motion-runtime.js` `T()` already exists) in slice 2.
- Lazy `ui-polish-loader.js` load timing interacts with first-paint budget; verify loader does not block shell paint.
- Budget assumes no provider/network in loop (deterministic). CI gate must use mocked rooms.

WAVE01=COMPLETE