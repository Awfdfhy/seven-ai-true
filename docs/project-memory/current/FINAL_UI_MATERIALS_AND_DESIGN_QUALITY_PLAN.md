# Seven AI — Final UI Materials & Design Quality Plan

> **Status:** REQUIRED_BEFORE_FINAL_UI_FREEZE / REQUIRED_BEFORE_FINAL_E2E / REQUIRED_BEFORE_FINAL_SEVEN
>
> **Purpose:** Prevent Seven from becoming functionally complete but visually cheap, generic, over-decorated, inconsistent, or resource-heavy. This plan governs material language and final design quality across every user-facing capability.

## 1. Product Design Target
Seven must feel premium, distinctive, calm, fast, coherent and intentional on Android. Premium quality is not defined by maximum blur, gradients or effects. It is defined by hierarchy, typography, spacing, material behavior, motion, interaction quality, state clarity, consistency, identity and restraint.

The internal system may be deep; the surface must remain understandable. Complexity is progressively disclosed rather than dumped into dashboards.

## 2. Material Architecture
Seven uses a governed material stack rather than one universal glass effect.

### M0 — Canvas
Primary Day/Night environment. Stable, low-cost, quiet background layer.

### M1 — Base Surface
Chat body, workspace foundations and large persistent regions. Mostly opaque and extremely cheap to render.

### M2 — Elevated Surface
Cards, inspectors, tool/result containers, grouped controls and secondary panels. Elevation is communicated through tonal separation, edge treatment and restrained shadow before expensive effects.

### M3 — Floating Surface
Sheets, menus, command surfaces, transient overlays and contextual controls. May use controlled translucency/blur where supported and justified.

### M4 — Focus / Intelligence Material
Reserved Seven-signature treatment for active reasoning, selected objects, important state transitions, generated UI focus and high-value moments. Uses the Design Genome rather than generic neon/glass decoration.

### M5 — Hero / Identity Material
Rare brand moments such as launch, major empty-state identity, workspace arrival or exceptional completion moments. Never repeated everywhere.

## 3. Fancy Material Rules
Fancy material is a quality instrument, not wallpaper.

Allowed ingredients include controlled translucency, backdrop blur, layered tonal surfaces, soft edge light, subtle specular response, restrained glow, depth, gradient fields, masked texture/noise, focus halo and state-responsive surfaces.

Rules:
- Every expensive material needs a visual purpose.
- Never stack blur-on-blur without measured justification.
- Never reduce text/control contrast for decoration.
- Avoid generic glassmorphism, neon overload and gradient soup.
- Material must respond coherently to Day/Night, focus, disabled, pressed, selected, loading and error states.
- Signature treatments are scarce; scarcity preserves hierarchy.
- Prefer static/precomputed assets when they deliver equivalent quality at lower runtime cost.
- Heavy materials are lazy and must not enter the startup hot path merely for decoration.

## 4. Adaptive Material Governor
Material quality adapts without making the app feel broken.

### Full
Capable devices receive the complete approved material treatment.

### Balanced
Reduce blur radius, shadow complexity, live compositing, particles and nonessential layered effects while preserving hierarchy and identity.

### Lite
Prefer opaque/tonal surfaces, precomputed texture, simplified elevation and minimal live effects. Typography, spacing, geometry, state clarity and brand DNA remain intact.

### Reduced Motion
Material state changes remain clear without relying on movement. Motion-dependent shine/orbit/parallax is removed or replaced by immediate/low-motion state treatment.

No tier may remove required functionality, correctness, accessibility or essential state communication.

## 5. Day / Night Material Pairing
Day and Night are siblings, not simple color inversions.

Day prioritizes clean luminous surfaces, precise edges, restrained depth and the approved white/day identity behavior.

Night prioritizes controlled dark depth, separation without crushed blacks, limited luminous accents and the approved black/night identity behavior where context permits.

Both themes must preserve hierarchy, readability, contrast and recognizable Seven geometry.

## 6. Seven Design Quality Constitution
Every final surface must satisfy all applicable dimensions:

1. **Visual hierarchy** — the eye knows what matters first.
2. **Typography** — deliberate scale, weight, line height, wrapping and Arabic/Latin harmony.
3. **Spacing rhythm** — governed spacing, no accidental density.
4. **Geometry** — consistent radii, cuts, edges, alignment and touch geometry.
5. **Material quality** — surfaces have intentional depth/material behavior rather than default rectangles.
6. **Color discipline** — semantic color roles, contrast and limited accent use.
7. **Iconography** — coherent stroke/fill/optical size and no random icon-family mixture.
8. **Motion** — meaningful continuity and feedback, never decorative jank.
9. **Interaction quality** — immediate feedback, obvious targets, good keyboard/IME behavior and no dead controls.
10. **State quality** — loading/running/success/error/retry/cancel/permission/offline/empty states are designed, not afterthoughts.
11. **Content quality** — labels, hierarchy and microcopy avoid engineering jargon where ordinary users do not need it.
12. **Distinctiveness** — recognizable Seven DNA without copying another AI product or stock Material UI.
13. **Accessibility** — contrast, touch targets, focus semantics, screen-reader structure and Reduced Motion.
14. **Arabic / RTL** — first-class composition, not mirrored leftovers.
15. **Responsiveness** — phone sizes, keyboard, long content and specialist workspaces remain composed.
16. **Performance** — no premium visual is allowed to create unacceptable startup, frame, RAM, battery or thermal cost.
17. **Consistency** — identical concepts look and behave identically across Chat/Coding/Research/RPG and generated surfaces.
18. **Restraint** — decoration must not compete with the user's work.

## 7. Capability → Product Surface Rule
At Final UI Completion, every user-relevant entry in `CAPABILITY_REGISTRY.md` must map to:

`Capability → discoverable entry point → appropriate Screen/Workspace/Sheet/Menu/Action → real runtime wiring → complete state model → recovery path → Android evidence → E2E evidence`.

Not every capability gets a separate screen. Coherent capabilities are consolidated into workflows and progressively disclosed controls. Seven must avoid feature-card sprawl.

## 8. Workspace Material Personalities
All workspaces share the same Design Genome but may tune density and material emphasis.

- **Chat:** calm, content-first, low chrome, contextual intelligence surfaces.
- **Coding:** information-dense but elegant, strong code/result hierarchy, diff/run/terminal states visually explicit.
- **Research:** evidence-forward, source/provenance hierarchy, readable long-form synthesis.
- **RPG / Real Works:** immersive without sacrificing controls, canon/state clarity or performance.
- **Settings / system surfaces:** quieter materials, maximum clarity and minimal spectacle.
- **Generated UI:** must consume governed tokens/material roles and cannot invent an unrelated visual language.

## 9. Anti-Cheapness Failure Catalog
Final review explicitly searches for:

- default-looking cards/buttons;
- excessive rounded rectangles;
- random gradients/glows;
- blur used as a substitute for hierarchy;
- inconsistent radii/spacing/iconography;
- tiny or low-contrast text;
- huge unused areas without compositional purpose;
- feature dashboards with too many equal-priority cards;
- modal/sheet proliferation;
- dead controls or placeholder UI;
- animations without interaction meaning;
- copycat ChatGPT/Claude/Gemini/Material appearance;
- specialist workspaces that look like unrelated applications;
- cheap fallback appearance on lower performance tiers;
- RTL layouts that merely mirror LTR without recomposition;
- beautiful screenshots that become janky during real use.

Any material anti-cheapness defect blocks final visual freeze until resolved or explicitly accepted with evidence.

## 10. Design Lint Expansion
Design Lint should enforce machine-checkable portions where practical:

- token-only semantic colors/material roles;
- governed radius/spacing/type scales;
- minimum touch targets;
- forbidden arbitrary shadows/blur/gradients outside approved tokens;
- no uncontrolled z-index/elevation proliferation;
- required state coverage for interactive components;
- Reduced Motion paths;
- RTL-safe layout primitives;
- generated UI token compliance;
- performance budget flags for expensive visual primitives.

Lint is a guardrail, not a replacement for visual/human review.

## 11. Review Pipeline
Final UI is reviewed in this order:

`Capability inventory → information architecture → wireflows → material composition → typography/spacing/geometry → Day/Night → motion → interaction/state completeness → RTL/accessibility → real Android screenshots → performance/smoothness stress → visual consistency audit → anti-cheapness review → Visual Red Team → repair → freeze`.

Review uses representative real content, long messages, streaming, tools, errors, empty states, keyboard-open layouts and workspace switching rather than hero screenshots only.

## 12. Material Performance Budgets
Exact numeric budgets must be derived from measured target-device evidence rather than invented here. The release gate measures at minimum:

- cold/warm startup impact;
- frame stability and jank during scroll/transitions;
- RAM delta of specialist surfaces;
- GPU/compositing pressure where observable;
- battery/thermal behavior in sustained representative use;
- APK/storage impact of material assets;
- transition latency and input responsiveness.

When a material fails budget, optimize in this order:

`remove redundant layers → reduce live compositing → precompute/static asset → lower material tier → simplify effect → remove nonessential effect`.

Do not sacrifice text clarity, state clarity or functionality to preserve decoration.

## 13. Final Material & Design Quality Gate
The UI may not be declared final merely because every capability is wired.

PASS requires:
- no known material anti-cheapness blocker;
- coherent Seven material language across all major surfaces;
- complete Day/Night treatment;
- Full/Balanced/Lite behavior where applicable;
- Reduced Motion compatibility;
- Arabic/RTL and accessibility evidence;
- real Android visual evidence;
- smoothness/performance evidence under representative stress;
- no dead/placeholder user-facing control;
- capability-to-UI-to-runtime traceability;
- Visual Red Team complete with material findings repaired or explicitly dispositioned;
- final human visual review before freeze.

A functionally correct but visibly generic, inconsistent, janky or cheap UI is **FAIL**, not release-ready.

## 14. Relationship to Existing Gates
This plan strengthens, and does not replace:

- Visual Intelligence & Design Fabric;
- Design Genome and Design Lint;
- Final UI Completion & Product Wiring;
- Android Visual Certification;
- Seven Speeding & Smoothness System;
- Accessibility and Arabic/RTL requirements;
- Final E2E verification;
- Final Seven Red Team.

Execution order remains implementation truth first, then final capability/product wiring and design completion, then comprehensive E2E/Red Team/Android/RC verification. Material polish must be designed early enough to avoid a last-minute decorative reskin, but final freeze happens only against the real completed capability surface.

## 15. Freeze Rule
Material/design freeze is earned only after two valid challenge/review rounds find no material unresolved quality improvement for the release scope, or return `NO_MATERIAL_IMPROVEMENT` with evidence. Any major capability, navigation, identity, performance-tier or visual-system change can reopen the gate.
