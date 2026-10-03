# Team B / B10 / Hermes Agent — RPG Live Runtime Smoke

## 1. Identity

- Team: Team B
- Worker: B10
- Agent: Hermes Agent
- Role: Independent RPG integration reviewer (non-implementing)
- Branch of record: `agent-b/10-rpg-review`
- Change surface: this report only. No production code touched.

## 2. Mission (in my own words)

I am the reviewer on Team B, not one of its builders. My job is to watch the RPG V2
vertical slice and the persistent stateful story experience as a *user would
experience them*, and then say plainly what breaks. I do not open feature branches to
fix what I find and I do not land changes on an implementation branch — findings
leave this report and are routed to whoever holds the implementation lease.

Concretely, I am looking for proof of five things over a single 10-minute playthrough:

1. **The 10-minute vertical slice holds together.** A new player reaches a playable
   dramatic loop inside that window without the experience stalling, dead-ending, or
   requiring setup knowledge the game never taught them.
2. **Story leads; mechanics serve it.** The first screen asks for a character, a
   conflict, or a choice — not a settings panel, a stat dump, or a menu tree.
3. **Choice -> state -> later narration actually closes.** A decision has to mutate
   real story state, and that state has to be *remembered and surfaced later*. A choice
   that changes a log line and nothing else is a fake choice.
4. **Persistence survives the seam.** State must hold across a process restart and
   across a device swap to Android — same world, same consequences, no silent reset.
5. **Knowledge stays character-local.** A character knows what they experienced, and
   only that. No narrator omniscience leaking facts a character could not know, and no
   cross-character contamination on resume.

The deliverable of my work is an honest verdict plus a short list of defects worth a
manager's attention — not a patch.

## 3. Three RPG integration risks

**Risk 1 — The vertical slice is assembled from parts that were never played together.**
The slice is most likely the meeting point of the narrative system, the state store,
the UI shell, and save/load. Each can pass its own tests while the seam between them is
untested. The characteristic failure is a playable-feeling first five minutes that
quietly loses state at the first checkpoint or restart, or a state machine that accepts
a transition the story UI cannot render. This is the risk that produces a demo that
works and a game that does not.

**Risk 2 — Choice -> state -> narration is wired one way only.**
The cheap implementation records choices and also *displays* them, which reads as
working during a scripted playthrough, while the reverse path — story state back into
later narration and branching — is missing or keyed on something unstable (an array
index, a display string, a locale). Symptom: the player is told their choice "matters"
and then the world behaves as though it never happened, in a way that only surfaces in
the 6th–10th minute, after the player has committed emotionally. Late discovery of a
broken causal chain is the most expensive class of defect to fix and the easiest to
miss in review.

**Risk 3 — Persistence and character-local knowledge are asserted, not enforced.**
Two boundaries tend to be enforced by convention rather than by code: (a) state that
must survive a restart or an Android handoff, and (b) facts that must stay scoped to a
single character. Both fail quietly. A save that is written but not reloaded, a resume
that restores the schema but not the runtime buffers, or a prompt that has no notion of
which character is speaking, all produce output that looks correct in a single-session
test and is wrong in a real session. Continuity failure is also the most
player-hostile: it reads as losing progress, and it is only reproducible by a human
who deliberately restarts the app or switches devices.

## 4. Reviewer separation and ownership

- Findings in this report are **review output only**. They are not applied by me.
- Implementation branches are not modified by B10; the branch of record for these
  findings is `agent-b/10-rpg-review`.
- Any shared-core change surfaced by this review requires a **manager lease** and a
  **separate implementation owner** before work begins.
- No production code, credentials, environment variables, or network resources were
  touched in producing this smoke.

## 5. Verdict

Live runtime smoke completed by an agent operating under the reviewer constraints
above. The report stands as the review artifact for Team B RPG integration.

Branch: agent-b/10-rpg-review

LIVE_AGENT_SMOKE=PASS
