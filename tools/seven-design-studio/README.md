# Seven Design Studio

Status: **feature-complete mobile-first design-studio candidate, pending first physical Android usability pass**

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
- Reduced Motion mode.

### Visual construction
- GrapesJS Core canvas;
- select and edit real component trees;
- Layers tree;
- Undo / Redo;
- duplicate / delete;
- editable layout properties;
- gap, padding, radius, font size, background and text color;
- SEVEN design tokens;
- reusable local component library.

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

### Persistence and export
- automatic local project save;
- explicit save;
- document name;
- reusable component library in local storage;
- standalone HTML export;
- full Seven Design Studio JSON export;
- JSON import.

### Installability
The studio includes:
- Web App Manifest;
- SEVEN Design app icon;
- service worker shell caching;
- standalone PWA display mode.

Once served over HTTPS, compatible Android browsers can install it to the home screen.

## Files

- `index.html` — mobile studio shell;
- `studio.css` — editor UI system;
- `studio.js` — editor runtime, components, states, judge, preview and export;
- `manifest.webmanifest` — PWA metadata;
- `sw.js` — app-shell cache;
- `seven-design-icon.svg` — temporary studio icon, not the final governed SEVEN logo;
- `test.cjs` — mobile-browser smoke test and protected-source integrity check.

## Dependency boundary

GrapesJS Core is currently loaded from `unpkg.com`. The studio itself has no usage-credit counter, but first load requires network access to that external dependency. After the first real Android pass, the next hardening step should vendor/pin GrapesJS locally so the editor can become deterministic and genuinely offline-first.

## Verification

`test.cjs` performs:
- JavaScript syntax parse;
- required asset/shell checks;
- mobile Chromium boot;
- actual GrapesJS canvas render;
- Day mode propagation into the canvas;
- RTL propagation;
- component library render;
- Preview open/close;
- 320px device switching;
- protected `seven_ai-final.html` byte-integrity check.

The branch also wires the test through `hardening/design-studio.test.cjs`, allowing the repository's existing test discovery to execute it in CI without changing the protected application source.

## What remains before calling it physically verified

Only evidence that requires the user's real Android device:
1. actual touch comfort and drag/select behavior;
2. Android Chrome keyboard / IME behavior;
3. real viewport and safe-area behavior on the user's phone;
4. export/download behavior under Android storage permissions;
5. PWA installation behavior;
6. performance and battery feel during a real design session.

Those cannot be truthfully certified from host Chromium alone.

## First physical test target

When host verification is green enough to proceed, open the hosted studio on Android and test one complete flow:

`Home template → select Composer → Design → change radius/token → States → Researching → switch 320px → RTL → Preview → Save → export JSON`

If this flow is comfortable, the editor is ready to be used for the full SEVEN UI campaign.
