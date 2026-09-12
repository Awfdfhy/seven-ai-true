# Seven AI Ultimate — Coding Studio, Canon RPG, and NPC Life Research

This document records the design decisions behind the Coding Studio, canon-work RPG adapter, and deep NPC life/personality systems. It is a decision log rather than a prompt recipe.

## Coding Studio research

Seven's Coding Studio combines proven interaction patterns from modern editors without copying any one product:

- VS Code: central editor as the primary work surface; explorer/search/source-control/testing as contextual tools; command palette as a universal navigation layer.
- JetBrains IDEs: tool windows remain secondary to the editor; progressive disclosure; compact information-dense layouts.
- Zed: preview-versus-pinned files, dockable terminal/tool panels, multiple agent threads, keyboard-first navigation, restrained visual chrome.
- Cursor: explicit Ask / Plan / Agent / Debug modes, plan review before complex edits, visible live diffs, Stop, queued follow-ups, and post-run review.
- GitHub code review: agent-authored changes still require inspectable diffs, tests, and review evidence before acceptance.
- Seven UI v7.1 rules: 44px touch targets, visible focus, reduced motion, low-power behavior, RTL, semantic state labels, content-first surfaces.

### Coding Studio contract

The coding surface is not a terminal skin. It is a calm workbench with five layers:

1. Activity rail — Explorer, Search, Source Control, Runs, Agents, Problems.
2. Project panel — files, symbols, search, changes.
3. Editor canvas — tabs, breadcrumbs, code/diff/artifact views.
4. Agent dock — mode, plan, active step, tool activity, evidence, review.
5. Bottom dock — Terminal, Tests, Problems, Output, with terminal bubbles as the default agent-facing presentation.

On phones these become full-height task surfaces switched by a compact segmented dock rather than squeezed desktop columns.

## Character and NPC research

The NPC system draws from several traditions instead of reducing a character to one persona paragraph:

- Big Five / Five-Factor approaches: stable-but-not-absolute trait dimensions.
- Self-determination theory: autonomy, competence, and relatedness as motivational pressures.
- Attachment and interpersonal research: trust formation and relationship expectations are separate from generic friendliness.
- Narrative identity research: people make sense of themselves through evolving life stories; past events can change self-concept without rewriting the original event.
- Autobiographical memory: episodic experiences, self-related semantic knowledge, and identity claims are distinct memory products.
- BDI agent architectures: beliefs, desires, and intentions are explicit and can diverge from world truth.
- Generative Agents: observation, memory retrieval, reflection, planning, routines, and social propagation improve believable long-running behavior.
- Façade / drama management: moment-to-moment autonomous behavior can coexist with story-level pacing and player agency.
- Modern role-playing-agent research such as Character-LLM, RoleLLM, PersonaGym, and PersonaForge: long-term character consistency needs structured profiles, experience, evaluation, and selective deeper cognition rather than a single prompt.
- 2026 computational character ontology research: character representation should preserve separate facets such as actions, emotions, traits, relations, possessions, social position, and other interpretable attributes instead of collapsing them into one vector.

### Seven NPC principle

A significant character is represented as a changing life, not a static persona:

Birth/origin → development → roles → relationships → work and routines → formative events → beliefs → goals → intentions → consequences → identity revision → future possibilities.

World truth, the character's knowledge, the character's beliefs, and the character's interpretation remain separate.

Character goals are persistent narrative state. Seven does not erase an antagonist's or morally dark character's ambition merely because it is unpleasant. A goal changes only through world constraints, explicit character reasoning, fulfillment, replacement by a stronger goal, or a sourced character-development event. Rendering remains non-graphic and policy-aware while the underlying fictional motivation can stay serious, antagonistic, cruel, criminal, or violent in abstract narrative terms.

## Existing-work / franchise RPG research

Seven must support RPGs based on existing fictional works without treating adaptations, specials, alternate continuities, or user divergence as one contradictory canon blob.

The canon adapter therefore uses:

- source precedence rather than source deletion;
- continuity branches;
- temporal validity windows;
- spoiler/progress gates;
- per-character knowledge gates;
- source lineage for every structured fact;
- player divergence as a new branch instead of silently rewriting source canon;
- facts and summaries instead of storing or reproducing long copyrighted passages.

This allows a user to build a game around a television series, anime, manga, film, novel, comic, game, or mixed-media franchise while keeping chronology, adaptation differences, character knowledge, and player-created divergence explicit.

## Performance rules

- NPCs are Hot / Warm / Cold. Only active characters receive full cognition every turn.
- Routine, need drift, schedules, and simple goal persistence are deterministic/local.
- LLM calls are reserved for dialogue, ambiguous high-stakes decisions, major reflection, and narrative synthesis.
- Active Mind Packets carry only relevant memories and goals.
- Canon retrieval is branch-, time-, character-, and spoiler-scoped before semantic reranking.
- Coding Studio renders only visible panels and virtualizes long logs/diffs.
- Terminal output is chunked and collapsible; agent activity is summarized into structured bubbles.
- Most motion uses transform/opacity and is disabled or simplified in low-power/reduced-motion modes.
