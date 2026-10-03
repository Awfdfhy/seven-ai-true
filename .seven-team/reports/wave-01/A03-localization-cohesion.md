# A03 — Localization / Navigation / Dialog Cohesion Audit (Wave 01A)

**Agent:** A03 (Gemini CLI), Team A
**Scope:** cross-workspace UX consistency across Chat, Search, Research, Coding, Settings, RPG, Self-Dev
**Mode:** read-only audit. No production source was modified.

---

## 1. Evidence: files inspected

| File | Bytes | Role |
|---|---|---|
| `release/workspaces/seven-shell.js` | 15,570 | Chat shell runtime (`isAr()` x8) |
| `release/workspaces/seven-shell-final.js` | 13,892 | Shell polish/final pass, modal+nav sync |
| `release/workspaces/hub.js` | 8,871 | Workspace launcher / navigation hub |
| `release/workspaces/rpg.js` | 20,493 | RPG workspace |
| `release/workspaces/coding.js` | 12,544 | Coding workspace |
| `release/workspaces/research.js` | 9,262 | Research workspace |
| `release/workspaces/generated-ui.js` | 7,637 | Generated UI bundle |
| `release/workspaces/ui-polish-fixes.js` | 10,150 | Polish patch layer |
| `release/workspaces/rtl.css` | 547 | RTL stylesheet |
| `release/workspaces/seven-shell.css` | 14,878 | Shell CSS |
| `release/workspaces/seven-shell-final.css` | 10,991 | Final shell CSS |
| `release/workspaces/hub.css` | 12,691 | Hub CSS |
| `release/seven-final.css` | — | Canonical `.modal` styling (10 tokens) |
| `release/ui-hardening.css` | — | Hardening `.modal` (7 tokens) |
| `release/beta-ui-runtime.js` | 13,057 | Theme/day-night runtime, Arabic strings |
| `release/github-self-dev.js` | — | Self-Dev workspace (15 Arabic glyphs) |
| `release/control-runtime.js` | 18,271 | Control plane (context budget) |
| `release/control-bridge.js` | — | Bridge |
| `release/release-verify.cjs` | — | Verification harness (30 Arabic glyphs) |

**Absent / not found:** there is **no** dedicated Settings workspace file. Settings
surfaces as `.settings-modal` / `.settings-panel` DOM classes manipulated from
`seven-shell-final.js`. There is **no** shared i18n module, dictionary, or message
catalog anywhere under `release/`.

---

## 2. Verified inconsistencies

### F1 — Five independent copies of the same Arabic/RTL detection (duplicated localization strategy)

The exact expression `(documentElement.lang||'').startsWith('ar')` is re-implemented in
five separate shipped bundles, each with its own local copy:

| File | Evidence |
|---|---|
| `release/workspaces/seven-shell.js:8` | `isAr()` — 8 call sites |
| `release/workspaces/coding.js` | `documentElement.lang\|\|''` + `startsWith('ar')` |
| `release/workspaces/rpg.js` | `documentElement.lang\|\|''` + `startsWith('ar')` |
| `release/workspaces/seven-shell-final.js:6` | `documentElement.lang\|\|''` + `startsWith('ar')` |
| `release/workspaces/ui-polish-fixes.js` (4 hits) | `documentElement.lang\|\|''` + `startsWith('ar')` |
| `release/github-self-dev.js` | `documentElement.lang\|\|""` (double-quote variant — divergent copy) |
| `release/beta-ui-runtime.js` (4 hits, lines 4 & 28) | `documentElement.lang` |

Note `github-self-dev.js` uses `""` while every other file uses `''` — these are
independently minified copies, not shared code.

**Impact:** a locale change at runtime cannot be broadcast. Each bundle re-reads `lang`
only during its own initialization; a language switch performed after a workspace is
mounted will leave already-mounted workspaces rendering the previous language.

### F2 — Coverage is drastically uneven (verified Arabic glyph counts)

| File | Arabic glyphs |
|---|---|
| `release/release-verify.cjs` | 30 |
| `release/github-self-dev.js` | 15 |
| `release/workspaces/seven-shell.js` | 14 |
| `release/workspaces/seven-shell-final.js` | 11 |
| `release/materialize-remake-assets.cjs` | 11 |
| `release/workspaces/rpg.js` | 7 |
| `release/beta-ui-runtime.js` | 7 |
| `release/workspaces/ui-polish-fixes.js` | 5 |
| `release/attachment-runtime.js` | 3 |
| `release/workspaces/coding.js` | 1 |

`coding.js` carries **one** Arabic glyph against 5 detection call sites — the RTL
detector is present but essentially untranslated. `research.js`, `hub.js`, and
`ui-runtime.js` contain **zero** Arabic glyphs, so Search, Research, and the workspace
launcher emit English-only chrome.

### F3 — Untranslated strings despite an active RTL detector

Because `coding.js` and `seven-shell.js` both detect Arabic but only partly translate,
the following user-facing literals remain English-only and render LTR while the rest
of the page is RTL:

- `release/workspaces/seven-shell.js:23` — the empty-state node is built with
  `node.innerHTML='<div class="seven-shell-empty-mark" aria-hidden="true">7</div><strong>What can Seven do for you?</strong><span>Start a new conversation, or type below. Seven will create the chat when you send.</span><button type="button" class="seven-shell-new" aria-label="New chat">New chat</button>'`
  — hardcoded English, **not** routed through any `isAr()` branch. This is the Chat
  empty state, the first screen a new user sees. Note the same function
  (`ensureEmpty`) does use `isAr()` for the backdrop `aria-label`
  (`isAr()?'إغلاق التنقل':'Close navigation'`, line 26) — proving the pattern exists in
  the very same file and was simply not applied to the body copy.
- `release/workspaces/coding.js` — `title="Refresh"` (hardcoded English tooltip on the
  Coding refresh control).
- `release/workspaces/hub.js` — `aria-label="Close"` (hardcoded English on the workspace
  launcher close button). The launcher is the primary cross-workspace navigation surface
  and has no Arabic at all.

### F4 — RTL is CSS-only, and forced `direction:ltr` on code surfaces

`release/workspaces/rtl.css` is 547 bytes and contains **no** `dir` attribute writer —
it is purely presentational. Its contents:

```
.seven-ws-code,.seven-ws-fingerprint{direction:ltr;unicode-bidi:isolate;text-align:start}
.seven-ws-output,.seven-ws-source,.seven-rpg-contract dd,.seven-research-claim p,
.seven-research-evidence small,.seven-ws-task textarea,.seven-ws-field
{unicode-bidi:plaintext;text-align:start}
html[dir=rtl] .seven-ws-kicker{letter-spacing:.08em}
html[dir=rtl] .seven-ws-head h1{letter-spacing:-.02em}
html[dir=rtl] .seven-ws-actions,html[dir=rtl] .seven-ws-task-actions{justify-content:flex-start}
```

Findings:
- `.seven-ws-code` is force-set to `direction:ltr` **unconditionally** — correct for
  code, but it also applies `text-align:start`, so the alignment intent is overridden by
  the hardcoded LTR base direction.
- Only **three** `html[dir=rtl]` overrides exist in the entire stylesheet, and they are
  limited to `letter-spacing` and `justify-content` on two action rows. There are **no**
  RTL rules for: navigation/sidebar ordering, tab strips, the launcher grid, settings
  panels, breadcrumb/trail rows, or modal placement.
- The stylesheet targets `html[dir=rtl]`, but no bundle in `release/workspaces/` writes
  `document.documentElement.dir` — only `coding.js`, `generated-ui.js`, and `research.js`
  emit `dir=` as a static string attribute (`dir='ltr'` in `generated-ui.js`), and
  `ui-hardening.css:45` contains a static `dir="ltr"`. The `[dir=rtl]` selectors are
  therefore likely **never matched** at runtime. This is the single highest-impact RTL
  defect: the RTL stylesheet is dead unless some external bootstrap sets `dir`.

### F5 — Parallel modal systems (four competing implementations)

`.modal` is styled independently in four stylesheets and managed by at least two
JavaScript layers:

- `release/seven-final.css` — 10 `.modal` tokens (canonical definition)
- `release/ui-hardening.css` — 7 `.modal` tokens (a second, competing hardening pass)
- `release/workspaces/seven-shell.css` — 1 token
- `release/workspaces/seven-shell-final.css` — 1 token

Worse, `seven-shell-final.js` **conflates three semantically different surfaces into one
selector list**, then stamps them all with a single `data-seven-shell-surface="settings"`
marker:

```js
qa('.settings-modal,.settings-panel,.modal').forEach(m=>{
  if(m.dataset.sevenShellSurface!=='settings') m.dataset.sevenShellSurface='settings';
  ...
});
const roots=qa('.topbar,.sidebar,.settings-modal,.settings-panel,.modal,.seven-ws-launcher');
```

A generic `.modal` (e.g. an unrelated confirm dialog) is therefore silently re-labelled
as `"settings"` and treated as a Settings surface by the shell's focus-trap, surface
restoration, and polish logic. The Settings modal, the Settings panel, and any generic
dialog share one identity.

### F6 — Two independent navigation state sources (state-sync race)

- `release/workspaces/seven-shell-final.js:55-56` reads active workspace from the DOM:
  ```js
  function activeWorkspace(){return d.documentElement.dataset.sevenWorkspace||'chat';}
  function syncNav(){const active=activeWorkspace();
    qa('[data-seven-shell-workspace]').forEach(b=>{const on=b.dataset.sevenShellWorkspace===active; ...})}
  ```
  It keys off `data-seven-shell-workspace`.
- `release/workspaces/hub.js` uses a **different attribute and a JS variable**:
  ```js
  '<button class="seven-ws-choice" data-ws="'+kind+'"><strong>'+label+'</strong><span>'+desc+'</span></button>'
  ...
  let active=n.querySelector('[data-ws="'+S.active+'"]');
  ```

Two selectors (`data-seven-shell-workspace` vs `data-ws`), two sources of truth
(`documentElement.dataset.sevenWorkspace` vs the module-local `S.active`), and no
observed synchronization between them. A workspace opened via the hub launcher will not
be reflected by `syncNav()` unless the launcher also writes
`documentElement.dataset.sevenWorkspace`; conversely a nav click will not update
`S.active`. This is a genuine state-sync race between the launcher and the shell nav.

### F7 — Theme (day/night) is hardcoded English in the only theme control

`release/beta-ui-runtime.js:19` — `t(e)` (theme applier) builds its control label with
English-only ternaries and no `isAr()` branch, despite that file carrying 7 Arabic
glyphs elsewhere:

```js
const z=(p==='auto'?'Auto · ':'')+(x==='day'?'Day':'Night');
b.title='Theme: '+z;
b.setAttribute('aria-label','Theme: '+z);
```

Also `d.body.classList.toggle('light',x==='day')` — the day theme is keyed on a
`.light` class, while every other surface uses `data-seven-theme` / `day|night`
vocabulary. The theme control is also found by a brittle inline-attribute query:
`$('button[onclick="toggleTheme()"]')` — this breaks the moment the markup is
restructured or the handler is bound via `addEventListener`.

### F8 — Language persistence key appears only in the verifier

`localStorage.setItem('seven_ui_lang'` occurs 7 times, all inside
`release/release-verify.cjs` (lines 149, 216, 301, 398, 438, 481, 500). No shipped
runtime bundle under `release/workspaces/` or `release/*.js` writes or reads
`seven_ui_lang`. The persisted preference key is defined by the test harness only —
the production write path for the language selection is missing or lives outside the
audited release tree.

---

## 3. Canonical strategy (single source of truth)

**One localization core. One navigation core. One dialog core.**

**L10N — `SevenLocale` singleton**, replacing `isAr()` in all five bundles:

- Single authority for `document.documentElement.lang` **and** `.dir`. `SevenLocale`
  is the *only* writer of both attributes, and it always writes them together
  (`lang="ar"` ⇒ `dir="rtl"`), eliminating F4's dead-selector condition.
- Exposes `SevenLocale.t(key, params)` backed by one message catalog, plus
  `SevenLocale.onChange(cb)` so mounted workspaces re-render on switch (fixes F1's
  stale-render bug).
- Keys are namespaced by workspace: `chat.empty.title`, `hub.choice.chat.desc`,
  `theme.label.auto`. Every hardcoded literal in §2 F3/F7 becomes a key.
- Backing store: `localStorage['seven_ui_lang']` — the key already used by
  `release-verify.cjs`, so the verifier keeps working and the production write path
  becomes real (fixes F8).

**NAV — single workspace registry + router.** One `SEVEN_WORKSPACES` map
(`{chat,search,research,coding,settings,rpg,selfdev}`) owning the canonical attribute.
Choose **one** attribute (`data-ws`, since `hub.js` already writes it and it is the
selector the launcher uses), and make `activeWorkspace()` read it. `syncNav()` becomes a
pure render of that single attribute. The hub's `S.active` is removed and reads the
registry instead (fixes F6). Navigation uses History API with `popstate` so
back/forward is language- and state-correct.

**DIALOG — one dialog controller.** A single `SevenDialog.open({surface, title, body})`
that owns: focus trap, `aria-modal`, `Escape`, backdrop dismissal, scroll lock, and
focus restoration. Surface is an explicit enum (`settings | confirm | launcher`),
never inferred from a CSS class. `seven-shell-final.js` stops blanket-rewriting
`.modal` into `data-seven-shell-surface="settings"`; it opts specific surfaces in
(fixes F5). All four stylesheets collapse to one `.modal` block in `seven-final.css`.

---

## 4. Migration order

1. **`seven-locale.js` (new)** — `SevenLocale` singleton, catalog, `lang`+`dir` writer,
   `seven_ui_lang` persistence. Ship dark (additive only, no behavior change).
2. **Backdrop the 5 `isAr()` copies** — each delegates to `SevenLocale.isArabic()`.
   Zero visible change; removes duplication.
3. **Wire the missing `dir` writer** — `SevenLocale` sets `documentElement.dir`.
   *This single step revives the three dead `html[dir=rtl]` rules in `rtl.css`*; expect
   a visible RTL shift, so it must be validated before step 4.
4. **Extract strings to catalog** — starting with the Chat empty state
   (`seven-shell.js:23`), then `hub.js` `aria-label="Close"`, then `coding.js`
   `title="Refresh"`, then the theme control (`beta-ui-runtime.js:19`). Research /
   Search get catalog entries created here (they currently have zero Arabic).
5. **`SevenDialog`** — migrate Settings modal first (highest usage), then the launcher,
   then generic modals. Retire the four competing `.modal` blocks in the same pass.
6. **Unify workspace routing** — single `data-ws` attribute, registry-driven
   `activeWorkspace()`, History API, `popstate` handling.
7. **RTL audit pass** — after `dir` is live, extend `rtl.css` beyond its current three
   rules to cover sidebar/launcher order, tab strips, breadcrumbs, and modal placement.

---

## 5. Acceptance cases

### Arabic RTL
| # | Case | Expected |
|---|---|---|
| A1 | Set `lang=ar`; load each workspace (Chat, Search, Research, Coding, Settings, RPG, Self-Dev) | No English-only chrome remains; every control has an Arabic label |
| A2 | Switch language `en` → `ar` at runtime **after** all workspaces mounted | All mounted workspaces re-render; `syncNav()` labels update without reload |
| A3 | Assert `documentElement.dir === 'rtl'` | Required for `html[dir=rtl]` rules; must be non-null (today it is likely unset) |
| A4 | RTL + Coding workspace open | `.seven-ws-code` stays `direction:ltr`; surrounding chrome mirrors; no bidirectional bleed (`unicode-bidi` holds) |
| A5 | RTL + Chat empty state | `What can Seven do for you?` / `New chat` render in Arabic; both visual and `aria-label` |
| A6 | RTL + Settings modal | Modal mirrors to the right edge; focus trap cycles forward (not backward) |
| A7 | RTL + launcher (hub) | Choice grid mirrors; `data-ws` focus lands on the visually-first tile |
| A8 | RTL + mixed-content paste (English query, Arabic answer) in Research | No line-order inversion in `.seven-research-claim p` / `.seven-research-evidence small` |
| A9 | Reload after `ar` selection | `lang`, `dir`, and catalog all restore from `seven_ui_lang` |

### Day/night
| # | Case | Expected |
|---|---|---|
| D1 | Toggle theme day↔night in both languages | `data-seven-theme`, `meta[name=theme-color]`, and `.light` class stay consistent |
| D2 | Theme control label under `ar` | Localized (not `Theme: Auto · Day`) |
| D3 | `preference=auto` across the 06:00/18:00 boundary | `a()` reschedules exactly once; no duplicate timers |
| D4 | Theme toggle in a workspace whose markup lacks `onclick="toggleTheme()"` | Control still found via delegated binding (F7 brittleness fix) |

### Mobile
| # | Case | Expected |
|---|---|---|
| M1 | Narrow viewport + Settings modal | Scroll lock holds; background cannot scroll; focus cannot escape |
| M2 | Narrow viewport + launcher open | Backdrop tap closes; focus returns to `S.launcherOpener` |
| M3 | Sidebar open, then workspace switch | Sidebar state (`open`/`active`/`body.sidebar-open`/`data-seven-shell-sidebar`) converges — all four markers agree |
| M4 | RTL + sidebar on mobile | Drawer edge, backdrop, and close affordance mirror |
| M5 | Keyboard-only traversal of launcher in RTL | Tab order matches visual order |
| M6 | Rapid workspace switching (hub → nav → hub) | Exactly one workspace active; `S.active` and `dataset.sevenWorkspace` never diverge |

---

## 6. Files likely affected

**New:** `release/workspaces/seven-locale.js`, `release/workspaces/seven-dialog.js`, message catalog (JSON or inline).

**Modified (high confidence):**
- `release/workspaces/seven-shell.js` — empty state, `isAr()` x8, backdrop label
- `release/workspaces/seven-shell-final.js` — surface conflation (F5), `activeWorkspace`/`syncNav` (F6)
- `release/workspaces/hub.js` — `data-ws` canonical, `S.active`, `aria-label="Close"`
- `release/workspaces/coding.js` — `title="Refresh"`, `isAr` dedup
- `release/workspaces/rpg.js` — `isAr` dedup, `.seven-rpg-contract dd` bidi
- `release/workspaces/generated-ui.js` — hardcoded `dir='ltr'` (3 occurrences)
- `release/workspaces/ui-polish-fixes.js` — `isAr` dedup (4 hits)
- `release/beta-ui-runtime.js` — theme label localization, `.light` class
- `release/github-self-dev.js` — `isAr` dedup, language key
- `release/attachment-runtime.js` — Arabic strings
- `release/workspaces/rtl.css` — expand beyond 3 rules
- `release/workspaces/seven-shell.css`, `release/workspaces/seven-shell-final.css`,
  `release/seven-final.css`, `release/ui-hardening.css` — collapse `.modal`

**Tests likely affected:** `release/release-verify.cjs` (7 `seven_ui_lang` sites),
`release/contrast.test.cjs`, `release/static-audit.cjs`, `release/brand-asset-contract.cjs`.

---

## 7. Risks & dependencies

**Risks**
1. **RTL visual regression (highest).** Step 3 makes previously-dead `html[dir=rtl]`
   rules live for the first time. Any layout that silently depended on LTR will shift.
   Gate this step behind dedicated RTL visual regression on all seven workspaces.
2. **Shell-final is a rewrite-on-top-of-shell.** `seven-shell.js` and
   `seven-shell-final.js` both run and both own `isAr`. Removing a function from one may
   be masked by the other. Verify actual load order in the shipped HTML before cutting.
3. **Surface re-labeling removal changes focus behavior.** Today any `.modal` is captured
   by the shell focus trap; after F5 is fixed, un-migrated dialogs will lose trap/Escape
   handling. Migrate all call sites in one commit, not incrementally.
4. **`github-self-dev.js` may be built/regenerated** — if it is emitted by a build step,
   editing it directly will be overwritten. Confirm provenance first.
5. **Catalog extraction touches minified code.** Source is single-line minified
   (e.g. `coding.js` = 1 line). Edits require exact-literal replacement; review diffs
   with care.

**Dependencies**
- Brand asset contract (`release/brand/runtime.js`, `seven-day-white.svg`,
  `seven-night-black.svg`) for day/night acceptance.
- `release-verify.cjs` gates on `seven_ui_lang`; locale consolidation must not break it.
- `.seven-team/cohesion/UI_FOUNDATION_V2.md` and `EVALUATION_GATE.md` should be read
  before step 3 to avoid conflicting with an already-agreed foundation.
- Nav unification (step 6) touches `hub.css` / `seven-shell.css` launcher geometry —
  schedule with the UI polish owners to avoid parallel visual regressions.

**Not verified (stated as absent, not assumed):** no shared i18n module, message
catalog, Settings workspace file, or runtime writer of `seven_ui_lang` was found under
`release/`. Absence was confirmed by targeted search; the Settings surface exists only as
`.settings-modal` / `.settings-panel` classes.

---

*Read-only audit. No production source modified.*
WAVE01=COMPLETE