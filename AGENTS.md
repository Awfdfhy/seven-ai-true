# Seven RPG agent operating rules

- This repository is an independent RPG product. Do not turn it into a general assistant, coding assistant, or productivity suite.
- Before editing, read the relevant product contract, architecture notes, tests, and existing agent instructions.
- Preserve existing localStorage keys, save formats, chat/world data, and backward compatibility unless a migration is explicitly designed and tested.
- Never delete user data, perform destructive cleanup, rewrite the framework, or alter release/signing secrets as a shortcut.
- Never merge to `main`, publish a release, or delete files/branches without explicit user approval.
- Work on a feature branch. Inspect git status and current changes before edits; do not overwrite unrelated work.
- Make the smallest coherent change. Add regression tests and run the narrowest relevant tests plus the full available gate.
- Do not claim tests, emulator runs, skill installation, or release verification unless the command/tool result proves it.
- For RPG work, consult `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md` and preserve RPG-01 through RPG-07.
- For UI work, consult `.seven-team/product-intelligence/README.md`, the quality rubric, visual reference catalog, and existing ownership docs when present.
- Skill registry: `.agents/skills/README.md`. Skills are instruction packs, not automatically executable tools; each host must explicitly load compatible skills.
