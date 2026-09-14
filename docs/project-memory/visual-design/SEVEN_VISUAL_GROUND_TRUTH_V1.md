# Seven Visual Ground Truth 1.0

Status: PHASE_0_GROUND_TRUTH
Parent: SEVEN_VISUAL_INTELLIGENCE_AND_DESIGN_FABRIC_V1.md
Branch baseline inspected: seven-beta-ui-v1 @ b2c4a5af14ef7c94776ed3f6164679b7a8f02b22
Protected source: seven_ai-final.html @ 3e8dfa8e7da7124e16504140eb9631c10cabf053

## Purpose
Record what Seven visibly implements and verifies today before any new visual candidate is allowed to redefine the baseline.

This is an implementation/evidence inventory, not an aesthetic verdict.

## 1. Existing strengths already implemented

### Release-layer visual system
Current visual behavior is layered through release assets rather than rewriting the protected source directly.

Observed implementation surfaces include:
- release/seven-final.css
- release/beta-ui.css
- release/beta-ui-runtime.js
- release/ui-runtime.js
- release/motion-runtime.js
- release/performance-runtime.js
- release/workspaces/hub.css
- release/workspaces/hub.js
- release/workspaces/coding.js
- release/workspaces/rpg.js
- release/research-runtime.js
- release/world-runtime.js

This gives Seven a practical place to evolve visual behavior while keeping the protected source integrity gate intact.

### Day / Night
Both release CSS layers define Day/Night behavior. Beta UI has theme-aware surfaces, text, borders, accent roles and theme-specific background treatment.

### Aurora
Aurora is already implemented as a semantic visual state layer rather than a decorative palette. Current beta CSS exposes thinking, research, coding, RPG, success, warning and error state treatments. Intensity is separate from semantic state.

### Performance tiers
Current CSS already distinguishes Lite/Balanced/Full behavior. Lite removes or suppresses several expensive decorative effects including blur, glow-like decoration and some transforms.

### Reduced Motion
Current CSS has a broad prefers-reduced-motion rule and the motion runtime checks reduced-motion before press/theme motion. Workspace browser tests also exercise a reduced-motion context.

### Lazy workspaces
Workspace assets are verified as lazy-local and do not load during ordinary chat boot. This is a strong mobile-first design constraint to preserve.

### RTL / mixed bidi groundwork
Current browser tests exercise mixed Arabic/English message bubbles, dir=auto, textarea direction behavior, no horizontal overflow, Day/Night at mobile width and safe-area bottom behavior.

### Contrast groundwork
A deterministic contrast gate exists and verifies six important light/dark pairs for accent actions, danger actions and muted text.

### Visual artifact capture
CI has a deterministic Playwright capture path that currently emits six screenshots:
1. Chat Night
2. Chat Day
3. Aurora Thinking
4. Workspace Launcher
5. Coding Agent
6. RPG Real Works

### Android shell
Android generation, hardening and WebView smoke tests exist. The Android test checks runtime readiness, origin, composer presence, horizontal overflow and focusability.

## 2. Current design structure

### Token reality
There are currently at least two visible token dialects:

A. seven-final.css
- --seven-motion-*
- --seven-radius-*
- --seven-elev-*
- --seven-ring
- --seven-code-bg
- legacy/general roles such as --accent, --muted, --danger

B. beta-ui.css
- --sb-bg
- --sb-s / --sb-s2
- --sb-t / --sb-m
- --sb-a / --sb-a2
- --sb-mode / --sb-mode2
- --sb-ao / --sb-rate

There is also workspace-specific CSS in hub.css.

This is functional but creates a material design-system risk: token duplication and theme/brand drift can occur because different visual layers can evolve independently.

### Current accent reality
The base/final layer uses a violet-centered accent family while the beta layer introduces a blue/cyan primary family and separate Aurora colors. This is not automatically wrong, but the relationship is not yet expressed as one canonical Design Genome.

### Current motion reality
The motion runtime currently provides:
- pointer press feedback
- new-message reveal
- theme-shift feedback
- reduced-motion suppression
- batched reveal integration with performance runtime

It does not yet constitute a complete measured Motion Genome for navigation, streaming, tool execution, Deep Think, workspace transitions, progress, interruption and domain choreography.

## 3. Material evidence gaps

### G1. Screenshot coverage is too narrow
Current capture uses one 390x844 viewport and six scenes. It does not yet provide the full matrix required for:
- Arabic RTL visual review
- mixed-bidi visual review
- large font/text scaling
- smaller/larger device widths
- Lite/Balanced/Full visual parity
- Reduced Motion visual equivalence
- warning/error/offline/cancelled states
- extreme/long content
- keyboard-open composition
- Research visual surface
- broad settings/permissions/import/export/error/recovery coverage

### G2. Screenshots are captured but not yet a complete promotion judge
The capture harness produces evidence artifacts, but there is no complete baseline registry + structured perceptual/structural diff + independent visual-judgment promotion path covering the whole product.

### G3. Contrast gate is narrow
The current deterministic contrast gate covers six hard-coded pairings. It does not yet automatically validate every rendered foreground/background state, focus indicator, non-text control boundary, Aurora state, workspace-specific token, disabled state or transient state.

### G4. Touch-target target is not yet aligned to Seven's strongest Android baseline
Current mobile CSS includes several controls with 40px effective dimensions and tool pills with 34px minimum height. Android's strong recommendation for touch interfaces is 48dp effective touch targets. Visual glyphs may remain smaller, but Seven needs a verified 48dp interaction hit area for ordinary mobile controls except documented exceptions.

### G5. Logo pipeline is not an identity system
Current apk/prepare-assets.cjs extracts one embedded PNG from seven_ai-final.html and resizes it to 1024x1024. There is no current proof of a deliberately authored:
- adaptive foreground layer
- adaptive background layer
- monochrome/themed layer
- mask-tournament result
- tiny-size mark
- Day/Night brand treatment
- logo recognition comparison

### G6. Android icon geometry is not yet a locked design gate
Current pipeline does not independently prove the final mark against the Android adaptive-icon 108x108dp layer geometry and 66x66dp protected central region across representative masks.

### G7. Design Genome is not yet implemented
Seven has useful tokens and motifs, but no single canonical executable source of truth yet governs:
- spacing rhythm
- shape hierarchy
- typography roles
- icon grammar
- surface grammar
- domain personalities
- motion grammar
- semantic/brand/Aurora color composition

### G8. Visual AI judgment is architecture, not runtime
Visual Evidence and Expert Judgment are documented, but the repository does not yet have a full multimodal candidate-review runtime that reads screenshots/frame sequences, emits typed findings and participates in a locked design tournament.

### G9. Motion proof is incomplete
Reduced Motion is present and motion is lightweight, but there is no complete video/frame-sequence review and device frame-pacing evidence across all material motion families.

### G10. Accessibility proof is partial
Current code has focus-visible styling, RTL tests, contrast tests and reduced-motion behavior. A complete accessibility release claim still requires broader target-size, focus order, semantic-name/role/value, keyboard behavior, text scaling/reflow and Android assistive-technology/device evidence.

### G11. Typography is not yet a governed cross-script system
Arabic/Latin directionality is handled at content level, but there is no frozen typography system proving Arabic and Latin role parity, mixed-script metrics, long-form reading, code/source typography, text expansion and font-resource cost.

### G12. Domain personality can drift
Coding and RPG already have distinct surfaces. Research/World/Core also have domain behavior. Without a Design Genome, domain identity can become four visually unrelated products.

## 4. Existing evidence that must remain protected

Any visual candidate must preserve or improve:
- source-integrity lock for seven_ai-final.html
- release boot
- lazy-local workspaces
- no ordinary-boot loading of heavy workspaces
- Day/Night functionality
- Aurora semantic authority boundary
- mixed-bidi correctness
- safe-area handling
- no horizontal mobile overflow
- Reduced Motion path
- Lite tier simplification
- tool/canon/coding truth boundaries
- release verification
- Android WebView boot/focus/runtime readiness

## 5. Platform evidence adopted as external constraints

Current official Android guidance used as platform evidence:
- M3 Expressive provides research-backed guidance across theming, components, motion and typography and complements Android 16 visual style. Seven may learn from it but must not copy it as identity.
- Android adaptive icons use foreground/background layers, optional/desired monochrome theming, 108x108dp layers, and a 66x66dp central safe region; logo content should remain within the documented bounds.
- Android recommends 48x48dp touch targets for touch interfaces; the responsive hit target may extend beyond the visible glyph.

WCAG 2.2 is also used as web-layer accessibility evidence, including target-size minimum rules and the principle that interaction-triggered motion should be disableable when nonessential.

## 6. Phase 0 conclusion

Seven already has a serious visual foundation and several unusually good truth/performance safeguards. The main problem is not lack of styling. It is lack of one governed, product-wide Design Genome and a sufficiently broad visual evidence/tournament runtime.

Phase 1 therefore locks the evaluation constitution before Phase 2 generates the new Design Genome.