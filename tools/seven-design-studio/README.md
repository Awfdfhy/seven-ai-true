# Seven Design Studio V0

Status: **isolated experimental implementation**

Branch: `seven-design-studio-v0`

This is the smallest practical mobile-first visual editor for designing Seven UI without changing the protected application source.

## Why this exists

The goal is to own the design workflow instead of depending on limited external AI design generations. V0 deliberately stays small: a touch-oriented editor shell around GrapesJS Core, plus Seven-specific tokens and mobile preview behavior.

## V0 scope

Implemented in `index.html`:

- visual canvas;
- touch-friendly mobile shell;
- add: Frame, Stack, Text, Button, Card, Composer, Sheet and Nav;
- layer tree and selection;
- design properties for layout, direction, gap, padding, radius, font size, background and text color;
- Seven color tokens;
- 320 / 360 / 393 / 412 / 480 px preview widths;
- Night / Day preview;
- LTR / RTL preview;
- local autosave plus explicit Save;
- HTML export;
- GrapesJS project JSON export;
- starter Seven Home surface.

## Safety boundary

This editor is isolated from Seven runtime code. It does not claim real tools, permissions, model execution, research, verification, memory, side effects or provider connectivity.

`seven_ai-final.html` is not modified by this experiment.

## Run

The file is a static web app. Serve `tools/seven-design-studio/` from any basic static HTTP server and open `index.html` in Android Chrome.

The only network dependency in V0 is GrapesJS Core loaded from `unpkg.com`. A later pass can pin/vendor the dependency for deterministic offline use.

## Deliberately not in V0

- AI Designer;
- Design Judge;
- prototype flow engine;
- full component variants/state model;
- collaborative editing;
- GitHub sync from inside the editor;
- APK wrapper;
- production integration with Seven runtime.

These should be added only after V0 is verified usable on the phone.

## Next gate

Before expanding scope, verify on Android:

1. page loads;
2. starter canvas renders;
3. selecting elements works;
4. Add inserts components;
5. Layers selects the correct component;
6. Design changes update the selected element;
7. 320/393/480 previews remain usable;
8. Day and RTL toggles work;
9. Save survives reload;
10. HTML and JSON export download correctly.

If those pass, V1 should add a governed Seven component/state system rather than more generic editor chrome.
