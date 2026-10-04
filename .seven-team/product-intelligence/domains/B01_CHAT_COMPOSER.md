# B01 — Chat / Rooms / Composer

Status: ACTIVE KNOWLEDGE PACK

## Mission

Own the highest-value surface: effortless conversation creation, streaming, stopping, retrying, room switching and draft continuity.

## Deep knowledge

Composer ergonomics; text growth; IME; send/stop state machine; stream lifecycle; optimistic insertion; room/task binding; drafts; retry/regenerate; copy; selection; markdown readability; scroll anchoring; unread/new-response handling; first-run empty state; history/sidebar interactions.

## Failure patterns

• send button changes meaning without clear state.
• stop cancels another room.
• retry duplicates user message.
• switching room moves stream output.
• keyboard covers composer.
• composer overloaded with permanent controls.
• auto-scroll fights user reading.

## Required tests

Fresh first message; multiline; long prompt; rapid send/stop; switch rooms midstream; retry; offline; draft persistence; IME; Arabic mixed text; long response; code/table/citation response; process restart.

## Metrics

First-prompt actions; send success; stop correctness; duplicate-turn rate; room leakage (zero); composer obstruction; draft recovery; scroll stability.

## References

Current ChatGPT mobile composer/history patterns as benchmark principles; Android IME/back; React state identity.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.
