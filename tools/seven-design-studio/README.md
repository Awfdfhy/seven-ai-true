# Seven Design Studio

Status: **feature-complete mobile-first design-studio candidate; first physical Android pass completed; post-pass polish awaiting device recheck**

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
- safe-area aware shell;
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

A mobile preview guard now enforces the selected Night/Day palette and text contrast in the prototype iframe. This specifically addresses the first physical Android finding where a preview labelled `night` rendered a light screen with low-contrast text.

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
- standalone PWA display mode;
- versioned app-shell cache including the mobile polish assets.

Once served over HTTPS, compatible Android browsers can install it to the home screen.

## Files

- `index.html` — mobile studio shell;
- `studio.css` — editor UI system;
- `studio.js` — editor runtime, components, states, judge, preview and export;
- `mobile-polish.css` — Android/touch/safe-area presentation hardening;
- `mobile-polish.js` — preview theme guard, mobile accessibility labels and escape handling;
- `manifest.webmanifest` — PWA metadata;
- `sw.js` — versioned app-shell cache;
- `seven-design-icon.svg` — temporary studio icon, not the final governed SEVEN logo;
- `test.cjs` — mobile-browser verification and protected-source integrity check.

## Dependency boundary

GrapesJS Core is pinned at `0.23.6` but is currently loaded from `unpkg.com`. The studio itself has no usage-credit counter, but first load requires network access to that external dependency. A later hardening step may vendor GrapesJS locally so the editor can become deterministic and genuinely offline-first.

## Verification

The isolated `Seven Design Studio` GitHub Actions workflow runs `test.cjs` independently from unrelated repository suites.

`test.cjs` performs:
- JavaScript syntax parse for the core and mobile polish layers;
- required asset/shell checks;
- mobile Chromium boot with touch enabled;
- actual GrapesJS canvas render;
- minimum touch-target checks;
- Night prototype preview contrast and palette check;
- Day mode propagation into the canvas;
- RTL propagation;
- Day + RTL prototype preview check;
- component library render;
- 320px device switching;
- 320px shell overflow check;
- preview horizontal-overflow check;
- protected `seven_ai-final.html` byte-integrity check.

The branch also wires the test through `hardening/design-studio.test.cjs`, allowing the repository's existing discovery to execute it without changing the protected application source. The wider repository workflow currently has an unrelated pre-existing acquisition-cache assertion (`STALE` vs `HIT`); the isolated Design Studio workflow is the authoritative host check for this tool until that separate failure is resolved.

## Physical Android evidence

First device pass: **completed**.

User-observed result:
- the hosted Studio opened successfully on Android;
- Prototype Preview rendered at 320px;
- the overall mobile composition was judged comfortable/good by the user;
- no obvious horizontal layout break was visible in the supplied screenshot.

Observed defect from that pass:
- Preview header reported `night` while the prototype content appeared light and several foreground elements lost contrast.

Implemented response:
- explicit prototype Night/Day fallback variables;
- forced foreground/background pairing for core SEVEN surfaces;
- theme-color synchronization;
- stronger touch sizing;
- small-phone shell polish;
- improved preview framing;
- automated regression coverage for Night/Day preview contrast.

The fix is host-tested but still requires the user's next physical-device recheck before being called device-verified.

## Remaining physical checks

These still require the real Android device and must not be fabricated from host Chromium:
1. recheck Night and Day prototype contrast after the new guard;
2. actual drag/select comfort over a longer editing session;
3. Android keyboard / IME behavior while editing text and numeric fields;
4. safe-area behavior under browser/PWA display modes;
5. export/download behavior under Android storage handling;
6. PWA installation and relaunch;
7. performance, heat and battery feel during a real design session.

## Next physical test target

Use one compact flow:

`Home → 320px → Night Preview → Day Preview → RTL → close Preview → select Composer → Design → change radius/token → States → Researching → Preview → Save → export JSON`

If this remains comfortable on-device, the Studio is ready to become the primary tool for the full SEVEN UI campaign.
