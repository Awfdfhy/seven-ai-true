# Dependency-First Roadmap

1. **M0 — Provenance and inventory:** inspect repository, data formats, UI, providers, Android, CI, tests, release evidence. Exit: source register and unknowns.
2. **M1 — Product contract:** resolve requirement conflicts; define MVP-0, player agency, Canon semantics, offline expectations, supported languages and devices. Exit: feature catalog and adversarial acceptance suite.
3. **M2 — Stack decision:** compare up to three stacks; test risky assumptions; write ADR-0001. Exit: reproducible proof-of-concept and exact commands.
4. **M3 — Domain/data contracts:** versioned state, commands, events, reducer, idempotency, migrations, backups, import/export. Exit: contract tests.
5. **M4 — MVP-0 vertical slice:** create world/character, enter scene, submit action, mock narrative, validate/apply legal events, save and recover. Exit: end-to-end pass.
6. **M5 — AI runtime:** provider abstraction, structured output, cancellation, retry budgets, secure credentials. Exit: mock and one real provider pass same contract.
7. **M6 — Canon and memory:** event provenance, character-specific knowledge, belief/rumor separation, summaries with sources. Exit: leakage and continuity tests.
8. **M7 — RPG mechanics:** character sheet, checks, inventory, progression, quests, relationships, factions, map, combat. Exit: per-system rule/save/load tests.
9. **M8 — UI convergence:** tokens, shared components, responsive screens, RTL/LTR, accessibility, async states. Exit: golden screenshots and interaction tests.
10. **M9 — Android hardening:** lifecycle, storage, SAF, import/export, supported API matrix, performance. Exit: device/emulator evidence.
11. **M10 — Release candidate:** security/license/dependency review, complete regression, reproducible artifact and checksum. Exit: explicit owner approval.

Do not skip gates because a later feature appears exciting. Parallel agents must have explicit file ownership and independent branches/worktrees.
