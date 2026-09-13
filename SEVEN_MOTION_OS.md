# Seven Motion OS 3.0

## Executable motion architecture for Brand OS v7.0

Motion is part of the Seven Identity Runtime. It is not a decorative layer and it never outranks correctness, truth, action safety, accessibility, usability, platform familiarity, or performance.

> Every transition must explain state, space, cause, or hierarchy. If it explains nothing, it does not animate.

The implementation target is premium continuity at mobile cost: transform and opacity first, event-driven work only, no permanent idle effects, no dependency on animation for meaning, and no change to canonical product state.

## 1. Motion contract

Every requested motion declares:

- `family`: one of the approved motion families.
- `purpose`: `state`, `space`, `cause`, or `hierarchy`.
- `priority`: P0 through P4.
- `stateful`: required for any repeating activity motion.
- `signature`: whether this is one of the rare identity moments.
- `target`: the element whose state or spatial relationship is being explained.

The runtime rejects unexplained motion, unbounded idle loops, unknown families, and keyframes that animate layout or costly paint properties. Accepted keyframes are limited to compositor-friendly `transform` and `opacity`, plus Web Animations metadata.

## 2. Priority arbitration

| Priority | Meaning | Examples |
| --- | --- | --- |
| P0 | Critical feedback | blocked action, uncertain side effect, serious error |
| P1 | User initiated | press, drag, send, open, close, undo |
| P2 | System state | thinking, searching, executing, verifying |
| P3 | Context transition | navigation, mode change, World entry |
| P4 | Ambient | only when it communicates a live state |

P0 suppresses P3/P4. P1 suppresses P4. Scroll and page hiding suppress ambient work. A concurrency budget prevents several animations from competing for attention.

## 3. Motion families

| Family | Meaning | Typical use |
| --- | --- | --- |
| Snap | immediate cause/effect | press and selection |
| Glide | spatial continuity | panels, menus, tabs |
| Settle | completion and weight | completed response or run |
| Reveal | new hierarchy/state | messages, cards, evidence |
| Orbit | bounded or state-bound work | thinking and tool activity |
| Pulse | one-time attention | meaningful state change |
| Collapse | removal/reduction | delete and close |
| Transfer | continuity between origins | composer to sent message, retry, undo |

No component owns an arbitrary curve. Durations and curves come from the shared runtime tokens.

## 4. Profiles and budgets

Balanced is the default. Ultra is opt-in. The governor can lower the effective profile without changing product functionality.

| Effective profile | Concurrent motion | Spatial motion | Signature motion | Repeating state motion |
| --- | ---: | --- | --- | --- |
| Ultra | 5 | full, restrained | full | allowed while state is live |
| Balanced | 3 | restrained | simplified | allowed while state is live |
| Lite | 1 | very short | replaced by basic feedback | static or one cycle |
| Reduced | 1 | none | fade/state change only | none |
| Off | 0 | none | none | none |

Inputs to the governor are the explicit user preference, `prefers-reduced-motion`, page visibility, Seven Performance tier, low-battery signals when the platform exposes them, current interaction priority, and measured frame pressure during active animations. There is no background benchmark loop.

## 5. Choreography law

Motion order is user action, important feedback, navigation/context, then ambient state. When several states change together, one motion leads and the others reduce intensity. Critical dialogs stop ambient activity. Scrolling quiets secondary motion. Deep Think owns the activity emphasis while it is active.

## 6. Spatial continuity

- Composer to message uses a bounded FLIP-style transfer from the send origin.
- Modal entry and exit use the most recent initiating control as their spatial origin.
- Sidebar entry reveals only a capped number of visible children.
- Source/evidence items assemble toward their parent surface.
- Deletion collapses toward the originating element; the inverse `undo` contract is available for a real undo action.
- Streaming text is never animated token by token.

## 7. Signature moments

Signature motion is reserved for Seven Wake, Celestial Shift, Deep Think Orbit, consequential Agent Completion, World Entry, and Canon Divergence. These are simplified on Balanced and replaced with basic state feedback on Lite/Reduced. Ordinary settings, cards, and navigation never use signature choreography.

## 8. Mode expression

- **Core:** quiet reveal and minimal hierarchy motion.
- **Build:** precise, short, causal; diffs reveal in a capped sequence.
- **World:** slightly more deliberate temporal transitions without changing Core navigation.
- **Research:** claims and evidence assemble as a restrained topology.

Mode expression changes timing and choreography only. It cannot change truth, authority, action state, accessibility meaning, or player agency.

## 9. Performance and accessibility gates

- No animation of width, height, top, left, margins, blur, filter, or shadow.
- No `transition: all` in the release motion layer.
- `will-change` exists only for the duration of active Web Animations.
- Mutation work is frame-batched and bulk message restoration animates at most the newest relevant item.
- Long output retains `content-visibility` behavior.
- Hidden pages pause CSS state animation and the governor resolves to Off.
- Reduced Motion removes spatial transforms and caps feedback duration.
- Every meaning is present in text, shape, label, ARIA state, or DOM state before motion is applied.

## 10. Verification gates

Release tests must prove all eight families, reject unexplained and costly motion, strip spatial movement under Reduced Motion, keep Balanced as the automatic default, cap Lite/low-power work, install the settings and semantic attributes, exercise the message/theme/execution/World/Research bridges, and remain under the static byte budget.

## 11. Truth boundary

Passing deterministic and browser tests proves runtime behavior in those environments. It does not prove 60/90/120 Hz smoothness, temperature, battery use, or OEM WebView behavior on the Tecno Pova 5. Those remain real-device release gates.
