# UI Foundation V2 — Product Contract

Classification: REBUILD

## Purpose

Seven should feel like one application, not a collection of independently styled workspaces. The visual system must remain coherent across chat, settings, search, research, coding, RPG, Self-Dev, Arabic RTL, day/night themes, and Android WebView.

## Non-goals

- No decorative redesign for its own sake.
- No new feature surfaces during this contract.
- No additional patch layer whose only purpose is overriding previous patch layers.

## Current problems to eliminate

The current release contains overlapping style layers including:
- seven-final.css
- ui-hardening.css
- seven-shell.css
- seven-shell-final.css
- ui-polish-fixes.css
- hub.css
- workspace-specific embedded styles

The rebuild must reduce specificity debt and establish explicit ownership of shared components.

## Design-system contract

One canonical token layer must define:
- typography scale
- spacing scale
- radius scale
- elevation/border treatment
- surfaces and text hierarchy
- action states
- dialog/menu geometry
- navigation
- composer
- cards
- fields
- responsive breakpoints
- motion/reduced-motion behavior
- safe-area behavior
- RTL mirroring rules

Shared components must consume tokens rather than invent per-workspace values.

## Primary success scenarios

1. Fresh install -> user immediately understands where chat, models, modes, settings, and workspaces live.
2. Switch day/night -> every visible surface updates consistently.
3. Switch English/Arabic -> layout remains usable, aligned, and localized.
4. Open model/mode/search/settings dialogs on the smallest phone -> no clipping or offscreen controls.
5. Switch Chat -> Research -> Coding -> RPG -> the application identity remains consistent.
6. Increase font scale and rotate to landscape -> composer/navigation remain usable.
7. Long messages, code, URLs, and many rooms -> no document-level horizontal expansion.

## Hard acceptance criteria

- zero document horizontal overflow in supported viewport matrix
- no visible unlocalized control in Arabic test scenarios
- no workspace may define a parallel global modal/navigation system without review
- no new !important declarations unless documented with a structural reason
- shared navigation has an explicit responsive layout for all current buttons
- all major surfaces have Android WebView screenshots in day/night and at least one RTL case
- accidental golden-screen drift blocks merge readiness

## Migration strategy

1. Inventory shared selectors and conflicting ownership.
2. Establish tokens and canonical components.
3. Migrate one surface at a time.
4. Delete superseded overrides after each migration.
5. Keep screenshot evidence after every migration.
6. Do not perform a blind all-at-once CSS rewrite.

## Performance budget

- no meaningful startup regression from the design system
- no interval-based layout polling for static UI
- avoid repeated full-DOM scans when mutation-scoped updates are sufficient
- keep interactions responsive on Android WebView

## Merge gate

Builder: agent/01-ui-ux  
Testing: agent/08-testing-ci  
Independent reviewer: agent/10-integration-review
