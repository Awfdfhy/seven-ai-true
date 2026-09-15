# Seven UI Simplification Study — September 2026

> **Purpose:** Translate Seven's very large capability map into the smallest practical mobile interaction model without deleting capability, exposing implementation internals, or turning Home into a dashboard.
>
> **Scope:** Android-first product UX. This study governs information architecture and presentation. It does not change truth, permission, verification, runtime, provider, or protected-source rules.

## Research direction

The strongest recurring pattern across current AI products is not “show every capability as a tile.” The pattern is to keep the primary surface task-first, put the main prompt/composer at the center, and reveal specialist capability through a small mode/tool selector, contextual actions, projects/workspaces, and a compact navigation layer.

Current examples reviewed for this pass include ChatGPT mobile, Gemini, Perplexity, Microsoft Copilot, Claude, Kimi, Manus, Grok, Poe, Meta AI, Mistral/Vibe, and adjacent agent/workspace products. Product documentation was cross-checked where possible rather than treating screenshots as implementation truth.

Relevant observed patterns:
- ChatGPT mobile simplified its sidebar so major experiences sit in a compact horizontal strip while chats/projects retain the larger navigation space.
- Gemini exposes Deep Research and Canvas from the add/tool affordance around the composer rather than forcing separate permanent home cards.
- Perplexity exposes Research through the input mode selector and treats Projects as the persistent home for conversations, tasks, files, tools, and context.
- Microsoft 365 Copilot moved its mobile experience toward a cleaner chat-first design and streamlined app navigation.
- Kimi combines a general prompt with specialist agent/task modes such as Research, Slides, Docs, Websites, Sheets, and Design.
- Manus starts from one broad task prompt and only then expands into creation/building/action capabilities.
- Android guidance continues to recommend at least 48dp touch targets for interactive controls.
- Progressive disclosure remains the correct way to preserve expert power while keeping first-use complexity low.

## Core UX law

**Intent first. Capability second. Architecture last.**

A user should describe what they want before Seven asks them to understand models, tools, memory indexes, verification layers, provider routing, or runtime terminology.

Seven must not make its architecture map into its navigation map.

## The five-surface model

### 1. Home — Start and resume
Home has only five jobs:
1. identify Seven and current availability;
2. accept intent through the Universal Composer;
3. expose at most four high-value specialist shortcuts;
4. show current/continuable work;
5. provide primary navigation.

Home does **not** permanently expose Memory, Models, Tools, Verification, Evolution, Repair, Providers, or every specialist system as separate cards.

### 2. Universal Composer — One entrance to almost everything
The composer is the default gateway for Chat, Search, Research, Coding, World/RPG, Create, files, images, camera, voice, tools, and connected actions.

Default controls:
- `+` = attachments, camera, files, tools/actions, and additional inputs;
- `Auto` = execution depth/mode selector, with Fast/Balanced/Deep/Custom disclosed only on demand;
- `Context` = the single explicit context entry for conversation, memories, project, files, pinned evidence, and other sources;
- voice = speech/multimodal entry;
- send = execute.

Direct adaptive shortcuts below the composer are limited to:
- Research
- Code
- Create
- World

Chat is the default composer behavior and therefore does not need a permanent shortcut. Search is selected automatically for ordinary fresh-information tasks or exposed through the composer tools. Projects/Spaces and Library already have primary navigation destinations.

### 3. Spaces — Persistent work
Spaces/Projects own persistent task context:
- project instructions and goals;
- project memory;
- project files and knowledge;
- conversations/runs;
- checkpoints and artifacts;
- connected tools scoped to the project.

This prevents Home from becoming a project dashboard.

### 4. Library — Things Seven can reuse
Library unifies objects rather than implementation systems:
- Files
- Artifacts
- Saved outputs
- Memories
- Tools / skills / templates
- Sources / evidence packs where appropriate

Memory can have its own filtered view inside Library, but Memory is not a Home feature tile.

### 5. You — Control and trust
Advanced configuration belongs here:
- models and provider details;
- compute preferences;
- permissions and connected accounts;
- privacy and data controls;
- accessibility, language and RTL;
- performance tier and Reduced Motion;
- recovery, repair and integrity status;
- self-evolution status and approvals;
- expert/debug information.

The common case should never require visiting this surface.

## Seven Orb / Command Center

The center `7` Orb is a global new-task/command affordance, not another tab.

Its command center is the universal escape hatch for capabilities that are intentionally not shown on Home. It should support search-first discovery instead of a wall of categories.

Suggested command groups after search:
- **Ask:** chat, search, research, files, vision, voice
- **Make:** image, document, presentation, app/site, structured output
- **Build:** coding, project actions, tool workflows, automation
- **World:** RPG, Real Works / Canon, What-if
- **Use context:** Spaces, Memory, Files, Pinned, Sources
- **System:** models, compute, permissions, recovery, verification details, evolution/repair

These groups are navigation aids, not independent product silos.

## Capability placement map

| Capability family | Default presentation |
| --- | --- |
| Chat | Composer default |
| Search | Automatic or composer tool |
| Research | Adaptive shortcut + composer mode |
| Coding | Adaptive shortcut + specialist workspace |
| Vision / images / camera | `+` composer input |
| Voice | Dedicated composer control |
| Create assets | Adaptive shortcut + artifact workspace |
| RPG / World / Real Works | `World` shortcut + specialist workspace |
| Projects | `Spaces` primary navigation |
| Context | `Context` composer control |
| Memory | Context source + Library view |
| Files / Knowledge | `+`, Spaces, Library |
| Tools / external actions | `+` / command center, then contextual inline UI |
| Models / providers | Auto by default; details under You / Expert |
| Adaptive Compute | `Auto` by default; advanced selector on demand |
| Truth / verification | Inline evidence/state only when relevant; details expandable |
| Permissions / side effects | Just-in-time confirmation, never a Home tile |
| Recovery / repair | surfaced only when action is needed; status under You |
| Self-evolution | background governed system; status/approvals under You |
| Evals / observability | expert/diagnostic surfaces, not normal navigation |

## Home V4 information hierarchy

1. Header: Seven identity + one activity control + profile.
2. Greeting / readiness state.
3. Universal Composer.
4. Four adaptive specialist shortcuts maximum.
5. One `Now` surface that combines active work and continuation instead of separate Active, Continue, and For You sections.
6. Bottom navigation: `Home | Spaces | 7 | Library | You`.

No six-tile feature grid. No dedicated Home compute card. No dedicated Home memory card. No duplicate Chat tile. No permanent Tools & Create row.

## Visual quality rules

- 8px primary spacing rhythm, with 4px only for micro-alignment.
- 48px minimum interactive target on Android-oriented layouts.
- Body text normally 14–16px; supporting labels should avoid ultra-small 7–9px typography.
- Use one strong focal surface: the composer.
- Glows are semantic emphasis, not card decoration.
- Neutral cards first; gradients only where they communicate identity/state.
- One icon grammar with consistent stroke, optical size, and container geometry.
- Prefer two hierarchy levels within a card instead of three or four competing metadata lines.
- One active work item plus one continuation item on Home. More opens history/tasks.
- No fake progress percentages. Show actual phase/state labels only.
- Day theme is cool off-white and high contrast, not a washed-out inversion of Night.
- RTL uses logical alignment and direction-aware arrows.
- Reduced Motion and Lite remove ambient animation/glow before removing useful state.
- 320px phones must preserve the same task hierarchy, not hide core controls.

## Dynamic simplicity

The four shortcuts are **adaptive slots**, not fixed architecture buttons. Research, Code, Create, and World are the initial balanced defaults because they cover Seven's major specialist experiences. Over time the runtime may replace a slot with a more relevant entry, but never exceed four visible specialist shortcuts on Home without explicit evidence that the limit is harmful.

The `Now` surface is also adaptive:
- active task present → show active task first;
- no active task → show best continuation;
- no history → show one contextual suggestion;
- never stack all three at once merely because data exists.

## Quality bar for implementation

A Home candidate is not considered improved just because it contains more polish. It should pass:
- no horizontal overflow at 320 / 360 / 393 / 412 / 480;
- 48px primary touch targets;
- Day/Night and structural RTL;
- Reduced Motion and performance-tier degradation;
- composer remains the strongest visual focus;
- maximum four specialist shortcuts on Home;
- active + resume information consolidated into one compact region;
- capability coverage remains reachable through Composer, Orb, Spaces, Library, or You;
- protected `seven_ai-final.html` remains unchanged.

## Decision

For the next Home implementation, Seven should move from the V3 “feature showcase” composition to a **V4 task-first launchpad**. The objective is not fewer capabilities. The objective is fewer simultaneous decisions.
