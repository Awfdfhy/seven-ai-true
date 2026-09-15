# Seven Design Studio

Status: **feature-complete mobile-first design-studio candidate; first physical Android pass completed; host polish suite green; final device recheck pending**

Branch: `seven-design-studio-v0`

Seven Design Studio is a focused visual UI design environment for building SEVEN itself. It is intentionally not a general Figma clone. The goal is to provide the parts SEVEN needs most: touch-first canvas editing, reusable components, visual properties, state/variant design, mobile previews, prototype behavior, deterministic design checks, export, and SEVEN-specific design language.

## Product boundary

The studio is isolated from the production Seven runtime. It does **not** claim real model execution, research, memory, permissions, tools, verification, provider actions, or side effects. Prototype interactions are explicitly local prototype behavior.

`seven_ai-final.html` remains protected and is not modified by the studio.

## Implemented editor

### Mobile shell
- touch-oriented top bar, preview controls, canvas and bottom dock;
- Android portrait-first layout;
- 320 / 360 / 393 / 412 / 480 preview widths;
- Night / Day;
- LTR / RTL;
- Full / Balanced / Lite preview behavior;
- Large Text stress mode;
- Reduced Motion mode;
- safe-area-aware shell;
- Android IME-friendly viewport mode;
- >=44px critical touch targets with 46-48px mobile polish targets;
- visible keyboard focus treatment;
- compact small-phone behavior.

### Visual construction
- GrapesJS Core canvas;
- select and edit real component trees;
- Layers tree;
- Undo / Redo;
- duplicate / delete;
- editable layout properties;
- gap, padding, radius, font size, background and text color;
- SEVEN design tokens;
- reusable local component library;
- persistent optional 8px design grid;
- persistent optional safe-area guides;
- design guides are editor-only and are never exported.

### Component library
General primitives:
- Frame;
- Stack;
- Row;
- Divider;
- Text;
- Title;
- Button;
- Chip.

SEVEN primitives:
- Universal Composer;
- Active Task;
- Continue card;
- Bottom Navigation + Seven Orb;
- Bottom Sheet;
- Evidence card.

### Screens / starter templates
- Home;
- Chat;
- Research;
- Coding;
- World / RPG;
- Blank.

The editor also supports multiple GrapesJS pages/screens inside one local project.

### Variants and semantic states
Selected components can carry:
- `default`;
- `compact`;
- `expanded`;
- `active`;
- `disabled`;
- `error` variants.

Aurora state family:
- Idle;
- Listening;
- Thinking;
- Researching;
- Coding;
- World;
- Generating;
- Success;
- Warning;
- Error.

Aurora is presentation only. It never means truth, confidence, authority, permission, verification, or canon proof.

### Prototype preview
A separate Preview surface renders the actual current screen as standalone HTML. Components may be assigned local prototype actions such as:
- toast;
- next-screen placeholder;
- open-command placeholder;
- toggle-state.

A mobile preview guard enforces the selected Night/Day palette and text contrast in the prototype iframe. This specifically addresses the first physical Android finding where a preview labelled `night` rendered a light screen with low-contrast text.

These remain prototype-only and are not production runtime claims.

### Local Design Judge
The deterministic judge can inspect the current rendered canvas for mechanical risks including:
- undersized touch controls;
- missing image alt attributes;
- horizontal overflow;
- tiny text;
- excessive card density;
- state surfaces relying too heavily on visual state without text.

The score is a local heuristic, not a claim of artistic quality or release readiness.

### Persistence, recovery and export
- automatic local project save;
- explicit save;
- save-on-background/page-exit hardening;
- bounded local recovery snapshots;
- manual Recovery Snapshot;
- Restore Latest recovery action;
- document name;
- reusable component library in local storage;
- hardened standalone HTML export;
- Copy HTML fallback for Android workflows;
- full Seven Design Studio JSON export;
- JSON import.

Hardened HTML export carries the selected theme/direction/accessibility classes and the same Night/Day contrast guard used by Prototype Preview. It also includes mobile viewport/safe-area metadata.

### Installability and offline resilience
The studio includes:
- Web App Manifest;
- SEVEN Design app icon;
- standalone PWA display mode;
- versioned app-shell cache;
- best-effort first-load pre-cache for pinned GrapesJS Core 0.23.6 assets;
- cache-first reuse of the pinned GrapesJS assets after a successful online load;
- an in-editor offline readiness status.

The studio itself has no usage-credit counter. GrapesJS Core is pinned to `0.23.6` and is loaded from `unpkg.com` on the first uncached load. A future vendoring pass can remove that remaining first-load network dependency entirely.

## Files

- `index.html` — mobile studio shell;
- `studio.css` — editor UI system;
- `studio-bridge.js` — narrow bridge exposing the GrapesJS editor to hardening extensions without rewriting the core runtime;
- `studio.js` — editor runtime, components, states, judge, preview and base export;
- `mobile-polish.css` — Android/touch/safe-area/guides presentation hardening;
- `mobile-polish.js` — preview theme guard, hardened export, recovery, offline status, guides and mobile reliability layer;
- `manifest.webmanifest` — PWA metadata;
- `sw.js` — versioned local + pinned dependency cache;
- `seven-design-icon.svg` — temporary studio icon, not the final governed SEVEN logo;
- `test.cjs` — core mobile-browser verification and protected-source integrity check;
- `polish.test.cjs` — hardened export/recovery/editor-bridge browser regression suite.

## Verification

The isolated `Seven Design Studio` GitHub Actions workflow is the authoritative host verification for this tool. It runs both browser suites independently from unrelated repository systems.

Host verification currently covers:
- JavaScript syntax and required asset wiring;
- mobile Chromium boot with touch enabled;
- actual GrapesJS canvas render;
- minimum critical touch-target checks;
- Night prototype preview contrast/palette;
- Day mode propagation;
- RTL propagation;
- Day + RTL prototype preview;
- component library render;
- prototype horizontal-overflow check;
- 320px device switching and shell overflow check;
- editor bridge availability;
- recovery snapshot persistence;
- hardened HTML export/download;
- export mobile viewport metadata;
- export theme/direction preservation;
- export contrast guard;
- protected `seven_ai-final.html` byte-integrity check.

The wider repository workflow currently has an unrelated pre-existing acquisition-cache assertion (`STALE` vs `HIT`). It is not used to mislabel the Studio as failed when the isolated Studio workflow is green.

## Physical Android evidence

First device pass: **completed**.

User-observed result:
- the hosted Studio opened successfully on Android;
- Prototype Preview rendered at 320px;
- the overall mobile composition was judged good by the user;
- no obvious horizontal layout break was visible in the supplied screenshot.

Observed defect from that pass:
- Preview header reported `night` while the prototype content appeared light and several foreground elements lost contrast.

Implemented response:
- explicit prototype Night/Day fallback variables;
- forced foreground/background pairing for core SEVEN surfaces;
- stronger touch sizing;
- small-phone shell polish;
- improved preview framing;
- hardened exported HTML;
- recovery snapshots and background save hardening;
- persistent 8px grid and safe-area guides;
- pinned dependency offline caching after a successful load;
- automated regression coverage for the physical-pass defect and mobile reliability features.

The fixes are host-verified. They still require the user's next physical-device recheck before being called fully device-verified.

## Remaining physical checks

These still require the real Android device and must not be fabricated from host Chromium:
1. recheck Night and Day prototype contrast after the new guard;
2. actual drag/select comfort over a longer editing session;
3. Android keyboard / IME behavior while editing text and numeric fields;
4. safe-area behavior in browser and installed PWA display modes;
5. HTML/JSON export and Copy HTML behavior under Android;
6. recovery snapshot/restore behavior in normal use;
7. PWA installation and relaunch;
8. cached relaunch with network unavailable;
9. performance, heat and battery feel during a real design session.

## Next physical test target

Use one compact flow:

`Home → 320px → Night Preview → Day Preview → RTL → close Preview → More → 8px Grid → Safe-area Guides → select Composer → Design → change radius/token → States → Researching → Preview → Recovery Snapshot → Save → Export HTML/JSON`

If this remains comfortable on-device, the Studio is ready to become the primary design environment for the full SEVEN UI campaign.
