# Seven RPG — Greenfield Bootstrap

**Own the intelligence. Borrow the infrastructure.**

This directory stages the new-from-zero Seven RPG plan inside the existing repository for review. It is documentation-only: it does not replace the current app and does not claim that a new GitHub repository has been created.

## Read in order
1. [Agent rules](AGENTS.md)
2. [First-run prompt](docs/FIRST_RUN_PROMPT.txt)
3. [Genesis plan](docs/GENESIS_PLAN.md)
4. [Master prompt](docs/MASTER_PROMPT.md)
5. [Current status](docs/CURRENT_STATUS.md)

## Non-negotiable product boundaries
- Seven RPG is an independent, mobile-first role-playing game—not a general assistant, coding agent, productivity suite, or unrelated chatbot.
- Preserve player agency: the AI cannot make consequential decisions or speak for the player's character unless control is explicitly delegated.
- Model output is untrusted proposal text. Only validated domain commands/events can mutate authoritative game state.
- Separate Canon facts, observed events, character knowledge, beliefs, rumors, summaries, and model suggestions.
- Protect existing data and legacy code. Do not perform destructive migrations or copy the old code wholesale.
- Do not merge into `main`, publish releases, change visibility, rewrite history, delete data, or incur avoidable costs without explicit approval.

## Status
**Planning/bootstrap only.** The codebase has not been rebuilt by this documentation change. Stack choice is blocked until a comparison and proof-of-concept are recorded in `docs/MASTER_PROMPT.md` and an ADR. A feature is not complete until there is reproducible evidence tied to a commit SHA.

## Relationship to the existing app
The current repository remains the historical source of evidence. This greenfield directory is an isolated proposal on branch `greenfield/seven-rpg-bootstrap-20261024`; no legacy source files were intentionally changed. The eventual preferred destination is a separate repository named `seven-rpg`. Do not treat this staging branch as that new repository.
