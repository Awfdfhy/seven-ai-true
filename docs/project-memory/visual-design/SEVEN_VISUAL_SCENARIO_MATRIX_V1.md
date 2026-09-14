# Seven Visual Scenario Matrix 1.0

Status: PHASE_1_LOCK_CANDIDATE
Comparison epoch: VISUAL-EPOCH-1

## Purpose
Define bounded high-information visual scenarios for fair baseline/candidate comparison without exploding into an impractical Cartesian product.

The matrix uses canonical must-pass scenarios plus pairwise/risk-based expansion.

## A. Canonical device windows

- D1 Compact: 360x780 CSS px
- D2 Primary: 390x844 CSS px
- D3 Large Phone: 412x915 CSS px
- D4 Wide/Tablet-like diagnostic: 768x1024 CSS px where the surface supports it

Physical Android device certification is a later evidence tier. Browser windows do not prove device performance.

## B. Theme
- T1 Day
- T2 Night

## C. Language / direction
- L1 English LTR
- L2 Arabic RTL
- L3 mixed Arabic + English + numerals + code/path fragments
- L4 long translated labels / text expansion

## D. Text scale
- F1 normal
- F2 enlarged
- F3 stress scale where supported without destroying critical functionality

Exact device fontScale values become device-evidence metadata when Android instrumentation is connected.

## E. Performance / motion
- P1 Full + normal motion
- P2 Balanced + normal motion
- P3 Lite + normal motion
- P4 Reduced Motion
- P5 hidden/background transition check for suspended nonessential motion

## F. Core semantic states
- S1 idle
- S2 thinking
- S3 research
- S4 coding
- S5 RPG/World
- S6 success
- S7 warning
- S8 error
- S9 cancelled/stopped
- S10 offline/provider unavailable
- S11 permission required/denied where relevant
- S12 recovery/retry where relevant

## G. Content stress
- C1 empty
- C2 short conversation
- C3 long assistant answer
- C4 long user message
- C5 code block with horizontal stress
- C6 citations/evidence-heavy answer
- C7 long unbroken token/path/URL-like string
- C8 Arabic paragraph with Latin/code/numbers
- C9 large project/file list
- C10 long tool output

## H. Input/window state
- I1 keyboard closed
- I2 keyboard/IME open
- I3 composer multi-line expansion
- I4 sidebar/drawer open
- I5 modal/dialog open
- I6 orientation/window resize where environment supports it

# Canonical must-pass scenarios

These scenarios are required before a global visual candidate can be frozen.

### V01 Core Night Primary
D2 T2 L1 F1 P2 S1 C2 I1
Purpose: canonical conversational baseline.

### V02 Core Day Primary
D2 T1 L1 F1 P2 S1 C2 I1
Purpose: Day/Night parity.

### V03 Core Arabic RTL
D2 T2 L2 F1 P2 S1 C2 I1
Purpose: real RTL composition, not only dir attributes.

### V04 Mixed Bidi Stress
D1 T1 L3 F2 P2 S1 C8 I1
Purpose: Arabic/Latin/numerals/code, compact width and enlarged text.

### V05 Composer Keyboard
D1 T2 L2 F2 P2 S1 C4 I2
Purpose: IME reachability, composer growth and RTL.

### V06 Long Answer
D1 T2 L1 F1 P2 S1 C3 I1
Purpose: reading rhythm, actions and scroll behavior.

### V07 Code Stress
D1 T2 L3 F1 P2 S5 C5 I1
Purpose: code readability, overflow and mixed direction.

### V08 Evidence Dense
D2 T1 L1 F1 P2 S3 C6 I1
Purpose: research/source hierarchy.

### V09 Thinking
D2 T2 L1 F1 P2 S2 C2 I1
Purpose: truthful progress state without over-animation.

### V10 Warning
D2 T1 L2 F1 P2 S7 C2 I1
Purpose: warning semantics survive Day + RTL.

### V11 Error/Recovery
D1 T2 L1 F1 P3 S8 C2 I1
Purpose: error clarity under Lite tier.

### V12 Offline/Provider Failure
D1 T1 L2 F1 P3 S10 C2 I1
Purpose: continuity/error messaging and Arabic mobile state.

### V13 Reduced Motion
D2 T2 L1 F1 P4 S2 C2 I1
Purpose: same semantic meaning without motion dependency.

### V14 Workspace Launcher
D2 T2 L1 F1 P2 S1 C1 I4
Purpose: global/domain navigation coherence.

### V15 Coding Workspace
D1 T2 L1 F1 P2 S4 C9 I1
Purpose: technical density, files/output/actions.

### V16 Coding Tool Output
D2 T1 L3 F1 P2 S4 C10 I1
Purpose: code/tool/output hierarchy and bidi-safe paths.

### V17 Research Workspace
D2 T1 L1 F1 P2 S3 C6 I1
Purpose: evidence-first visual grammar.

### V18 RPG / Real Works
D2 T2 L2 F1 P2 S5 C2 I1
Purpose: immersive domain personality without breaking global Seven grammar.

### V19 Settings / Permission Surface
D1 T1 L2 F2 P2 S11 C2 I5
Purpose: critical decisions, large text, RTL, touch reachability.

### V20 Large Window
D4 T1 L1 F1 P2 S1 C3 I1
Purpose: avoid mobile-only composition assumptions.

### V21 Large Font Stress
D1 T2 L2 F3 P3 S1 C4 I1
Purpose: survival under text expansion and Lite tier.

### V22 Hidden Motion
D2 T2 L1 F1 P1 S2 C2 I1 then hidden/background
Purpose: prove nonessential animation suspension rather than merely invisible rendering.

# Logo / icon matrix

Every finalist must render against:
- adaptive 108x108dp source grid
- 66x66dp guaranteed central safe region
- circle mask
- squircle mask
- rounded-square mask
- one more aggressive representative mask
- monochrome/themed mode
- light launcher surface
- dark launcher surface
- 16px, 24px, 32px, 48px and 64px visual previews
- 48dp minimum practical foreground mark check
- 66dp maximum central mark bound check
- splash/static launch usage
- motion-mark storyboard if motion is proposed

A candidate that only works at 1024px is rejected.

# Motion matrix

Material motions require at least:
- normal route
- interrupted/cancelled route
- repeated-use route
- Reduced Motion route
- Lite tier route
- RTL directional route where spatial direction is meaningful
- hidden/background route

High-impact motion families:
- launch
- navigation/sidebar/workspace
- message reveal/streaming
- thinking/research
- tool execution
- Deep Think
- success/warning/error
- theme change
- RPG/World transition
- generated media state where implemented

# Pairwise expansion

Do not run every possible combination. After canonical cases, use pairwise/risk-based expansion around:
- changed component
- changed token family
- changed motion family
- changed locale/direction behavior
- changed performance tier behavior

Any discovered failure adds a durable regression scenario.

# Evidence metadata

Every captured artifact must bind:
- commit/build identity
- candidate identity
- scenario ID
- viewport/device identity
- DPR/density where relevant
- locale/direction
- font/text scale
- theme
- Aurora/runtime state
- performance tier
- Reduced Motion setting
- capture implementation/version
- evaluator version when judged

# Holdout policy

Major candidate tournaments keep a small late-stage holdout set not used for iterative styling. Holdout cases should include at least one Arabic/mixed-bidi case, one extreme content case, one alternate window and one semantic error/warning case.

The holdout is not secret for security. Its purpose is to detect visual overfitting.