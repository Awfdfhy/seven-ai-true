# B01 — RPG V2 UX Audit (Wave 01B)
Scope: `release/workspaces/rpg.js` (58 lines, v2.2.0-beta.1) + shell/hub. Read-only; no source edited.
Criteria: `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md` L95-96 (RPG-01), L113-114 (RPG-07). No RPG entry in `index.html`.

## 1. Current user flow as implemented (verified)
| # | Action | Implementation |
|---|---|---|
| 1 | Tap `✦` in shell nav | `seven-shell-final.js:50` `navButton('rpg','✦','RPG')`; label forced `'RPG'` L56 |
| 2 | RPG mounts over the chat screen | `hub.js` `open('rpg')` → `chat(true)`, `n.innerHTML=''`, `next.mount(n)` |
| 3 | `.seven-rpg-chatbar` injected above `.input-area` | `rpg.js:52 buildBar()`; brand `Freeform RPG`, chip `Chat mode` |
| 4 | Only 3 buttons: `Titles`, `•••`, `Exit RPG` | `•••` is `display:none` at `max-width:620px` (STYLE) |
| 5 | `•••`/Titles open one drawer | `setDrawer()` L51 — drawer holds the **title form** (kind select + number + name + Record) **and** `Load Real Works` / `Load Canon` |
| 6 | Pack entry = local JSON file picker | `jsonFile()` L39 is the **only** caller of `loadWork()` L24 / `loadCanon()` L25 |
| 7 | User types in the ordinary composer | no seeding, no starter scene at `mount()` |

No pack → `worldEngine=null` → `renderStatus()` L37 shows `Chat mode`; `recordTitle()` L33 → `BLOCKED:world-not-loaded`.

## 2. Friction points
| # | Friction | Evidence | Impact |
|---|---|---|---|
| F1 | **JSON import mandatory** for world/canon state | `loadWork/loadCanon` only via file inputs in `jsonFile()` | Breaks "no JSON import required" |
| F2 | **Story machinery unreachable from UI** | `commitVerifiedBeat()` L28, `applyVerifiedDelta()` L29, `currentContract()` L26 exported (L58), unbound to any control | No first turn, beats, deltas |
| F3 | **No persistence** | `localStorage` count = **0** in `rpg.js`, `hub.js`, `seven-shell-final.js`; `unmount()` L57 nulls sessions | Exit destroys the story |
| F4 | **Shell hides RPG controls** | `seven-shell-final.js:66` injects `#seven-no-rpg-titles` hiding `[data-rpg-title-toggle],[data-title-*],[data-rpg-titles]`; L83 swallows `seven:rpg-title-recorded` | With `•••` hidden ≤620px, drawer + packs unreachable on phones |
| F5 | **Engine strings as UI** | `renderStatus()` L37 writes raw `c.status` into the chip | Debug-HUD feel |
| F6 | **Titles drawer is the front door** | `buildBar()` L52 buries pack loaders under a drawer labelled `Titles` | Invites Episode naming, not play |
| F7 | **Copy button on every turn** | `scanCopy()/addCopy()` L42-50 + `MutationObserver` L50 | Competes with story |
| F8 | **Physical CSS breaks RTL** | `.seven-rpg-copy{margin:… auto}`, `justify-content:flex-end`, 4-col drawer grid | Copy lands wrong side in Arabic |
| F9 | **Non-token colors** | `#69dbb1/#ffc65c/#ff8793` in notices, `.seven-rpg-copy.failed` | Not night-aware |

## 3. Proposed V2 start/continue flow (≤3 visible actions)
1. **Enter RPG** — same nav tap; `mount()` renders a **Story Home card** above the composer: `Start a story` · `Continue — <last title>` (hidden with no save) · `Advanced ▾`.
2. **Pick a built-in starter** — 3 embedded packs (Sandbox / Canon demo / What-if) in an inline const, so `hub.js script()` needs no change; `Continue` restores `worldSession`/`canonSession`/`titles` from `localStorage`.
3. **First story turn** — `mount()` auto-commits the opening beat and seeds one opening message with **2–3 tappable choices**; tapping a choice *is* the turn. No file picker, no title form.

## 4. Advanced / debug-only (kept, but hidden)
Title kind/number/name form · `Load Real Works` / `Load Canon` JSON import · raw contract/beat/audit readouts · duplicate-title warnings · raw status strings · per-message Copy (one toolbar action).

## 5. State feedback: useful vs engine noise
| Keep | Cut / move |
|---|---|
| Current title + Continue resume point | Raw `c.status` chip (F5) |
| Available choices / beat name | `Pack rejected: <e.message>` as primary feedback (L39) |
| `Saved` / `Restored` on the story card | `Next: Episode 4` preview before a story exists (L40) |
| Canon conflict surfaced as a story beat | `aura()` mode flips (L22) |

## 6. Mobile / RTL / night requirements
- ≤360px: story card, choices, composer stack; no horizontal scroll; `•••` must not be the only pack path (F4).
- RTL: logical props (`margin-inline-start`, `justify-content:flex-start`) in chatbar, actions, copy button, drawer grid; extend `rtl.css`.
- Night: notice/copy colors to `var(--sb-*)`; keep `themeSync()` L56 + `seven:themechange`.

## 7. First implementation slice — exact files
| File | Change |
|---|---|
| `release/workspaces/rpg.js` | add `storyHome()`, `STARTERS`, `persist()/restore()`, `seedFirstTurn()`; call from `mount()` L55; humanize `renderStatus()` L37; pack loaders + title form under `Advanced` |
| `release/workspaces/seven-shell-final.js` | reconcile `#seven-no-rpg-titles` (L66/L83) so story card/choices are never hidden; ≥44px targets |
| `release/workspaces/hub.js` | `open('rpg')`: pass resume flag; story-first `CFG.rpg` label/desc (L1) |
| `release/workspaces/rtl.css` | logical-property rules for RPG chatbar/copy/drawer |

## 8. Acceptance mapping
- **RPG-01** (≤3 actions to a meaningful turn): V2 = tap RPG (1) → Start/Continue (2) → tap opening choice (3). Today ≥5 actions, JSON-gated (F1), no seeded turn (F2).
- **RPG-07** (small Android + Arabic RTL + night, no clipping): fails today — drawer/pack loading unreachable ≤620px (F4), physical CSS flips in RTL (F8), hardcoded colors (F9).

## 9. Dependencies / risks
- `SevenWorld`/`SevenCanon` pack schema is not in the audited files; starter packs must be validated against the real schema (highest risk).
- Reconciling `#seven-no-rpg-titles` may clash with the shell's "no titles" mode; confirm with shell owners.
- Persistence needs a storage version/migration (`S.version` = `2.2.0-beta.1`).
- Seeded beats must bypass `verified:true` in `commitVerifiedBeat()` L28.

WAVE01=COMPLETE