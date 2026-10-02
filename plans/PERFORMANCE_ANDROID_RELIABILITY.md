# Performance + Android Reliability — Detailed Execution Specification

Date: 2026-10-02
Status: IMPLEMENTATION READY
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Objective

Finish Seven AI 2.1 Intelligence & Reliability Polish by hardening long-session rendering, streaming UI pressure, app background/foreground recovery, network-state awareness, mobile keyboard/safe-area behavior, and Android/WebView release gates.

This stage improves projection/runtime reliability without changing canonical conversation, memory, or provider authority.

## Invariants

- Full conversation history remains canonical and is never deleted merely to improve rendering.
- Rendering may project only a bounded recent window; older messages remain retrievable on demand.
- Streaming optimization must never change generated text or commit timing.
- Backgrounding the app must not silently cancel a request.
- Network-state UI is advisory; `navigator.onLine` is not treated as proof that a provider is reachable.
- Stop/cancellation remains authoritative and race-safe.
- No physical-device claim is made from emulator evidence.
- Existing Android APK generation/signing/package checks remain unchanged unless a test proves a change is required.

## 1. Long Chat Projection

Introduce a bounded DOM projection for chat history.

Target:
- initial render: recent ~100 messages
- older history remains canonical in `room.history`
- a semantic "Show earlier messages" control expands the projection in bounded chunks
- per-room render depth is ephemeral UI state, not canonical storage
- summary remains visible
- regenerate control remains attached to the actual latest assistant message
- switching rooms restores a bounded projection safely

Add off-screen rendering hints such as `content-visibility:auto` / `contain-intrinsic-size` where supported.

## 2. Streaming DOM Throttle

Current streaming writes the complete partial text into the DOM on every provider chunk.

Replace this with a frame-coalesced updater:
- latest partial text wins
- at most one DOM write per animation frame
- final output flushes/cancels any pending frame before Markdown finalization
- stale/disconnected bubbles are ignored
- Stop retains partial visible text
- expose bounded internal counters for deterministic tests

## 3. Background / Foreground

Add lifecycle projection:
- listen to `visibilitychange`
- mark background/foreground state
- pause decorative animation while hidden
- do not cancel generation solely because page became hidden
- on resume, resynchronize lightweight UI state (route badge, room title/list, viewport variables)
- support `pageshow` / BFCache restoration

## 4. Network Awareness

Add advisory state:
- listen to `online` / `offline`
- expose `online | offline | unknown`
- project network state via `document.documentElement.dataset.network`
- refresh routing status when Settings is open
- do not disable local UI or claim provider reachability from this signal alone

## 5. Keyboard / Visual Viewport / Safe Areas

Mobile WebView hardening:
- update CSS variables from `visualViewport` when available
- safe-area padding using `env(safe-area-inset-*)`
- composer and settings remain within the visible viewport
- 320px viewport still has no horizontal overflow
- do not force-scroll while user is reading older messages
- reduced-motion behavior preserved

## 6. Recovery Surface

Expose read-only `window.SevenAppReliability` diagnostics:
- version
- visibility state
- network state
- visual viewport metrics
- render-window state
- streaming UI counters

No prompts, response content, credentials, or canonical data are returned by diagnostics.

## 7. Tests

Browser regression tests:
1. 500-message canonical chat renders a bounded DOM window
2. "Show earlier messages" expands DOM without mutating canonical history
3. last assistant regenerate behavior survives bounded render
4. streaming updater coalesces many updates and preserves final text
5. visibility/background state toggles without cancelling generation
6. pageshow/resume resynchronization is safe
7. network-state projection updates deterministically
8. 320px settings/chat have no horizontal overflow
9. RTL still fits at 320px
10. safe-area/viewport runtime initializes without exceptions
11. reliability diagnostics contain no conversation text or secret-shaped values
12. existing routing/memory/provider health regressions remain green

Android gates after merge to main:
- pre-APK `node all.cjs`
- Android lint
- Android unit tests
- debug APK build
- packaged APK verification
- Android 16 WebView emulator smoke test
- final APK verification

## Acceptance Criteria

This final 2.1 stage is complete only when:
- long chat projection is bounded without data loss;
- streaming DOM writes are frame-coalesced;
- lifecycle/network/viewport signals are resilient;
- 320px + RTL regression gates pass;
- full Seven CI is green;
- the exact tested PR head is merged;
- Android workflow on main completes successfully, including API 36 WebView emulator smoke;
- the roadmap records emulator evidence accurately and does not call it a physical-device test.
