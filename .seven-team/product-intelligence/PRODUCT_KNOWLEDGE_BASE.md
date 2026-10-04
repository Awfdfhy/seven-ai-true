# Seven Product Knowledge Base v1

This is the team's durable product-intelligence corpus. It is deliberately principle-heavy so it remains useful when individual competitor layouts change.

## A. AI chat product principles

### A1. Conversation is the primary surface
- The composer, message stream and response state are the core product, not a dashboard around them.
- The first screen should make the next action obvious in under a few seconds.
- A new user should be able to send a useful first prompt without opening Settings.
- Advanced controls should be discoverable without permanently crowding the composer.
- Model/mode/search/reasoning controls must describe user outcomes, not provider internals.
- Empty states should teach by example, not by documentation dump.
- The response stream must remain visually dominant while secondary controls recede.

### A2. Composer quality
- One clear input target.
- Attachment entry point is stable and reachable with one hand.
- Send/stop states must be unambiguous.
- The input grows predictably for multiline text.
- IME/keyboard opening must not cover the send affordance or active text.
- Drafts survive accidental navigation when appropriate.
- Long prompts remain editable without layout collapse.
- Tool/mode chips are limited and contextual.
- Disabled states explain why when user action can recover.
- Voice/file/search affordances share a coherent grammar.

### A3. Response quality as UI
- Streaming should feel immediate and stable; avoid large reflows.
- Markdown hierarchy must be clear on a phone.
- Code, tables, citations, images and files need purpose-built rendering.
- Loading/progress indicators should communicate state, not merely animate.
- Sources belong near the claims they support.
- Errors should preserve the user's prompt and offer recovery.
- Retry should not duplicate messages or corrupt room history.
- Stop must stop the intended generation only.
- Long answers need scan-friendly structure and persistent reading position.

### A4. Conversation memory and history
- Room identity is obvious.
- Switching rooms cannot leak draft/stream state.
- History loading must be fast and incremental.
- Rename/archive/delete behavior is predictable and reversible where possible.
- Memory should feel useful, not mysterious: show meaningful controls/explanations without exposing internal token machinery.
- Restore after process death must not silently lose recent committed turns.

## B. Information architecture

- Prefer a small number of durable destinations over many feature-specific screens.
- A capability should have one canonical home.
- Do not duplicate Settings, model selection, search toggles or file pickers across workspaces.
- Navigation labels must describe user goals.
- Back behavior must match Android expectations.
- Modal, sheet and full-screen navigation are distinct patterns and should not be mixed arbitrarily.
- Deep features should progressively disclose rather than occupy permanent top-level space.
- Keep core chat usable even if advanced workspaces fail.

## C. Visual system

### C1. Hierarchy
- One dominant action per state.
- Primary text, secondary metadata and tertiary chrome must be visually distinguishable.
- Surface elevation must communicate containment, not decoration.
- Repeated components use the same spacing, radius, typography and icon rules.
- Avoid ornamental borders around every element.
- Empty space is a functional grouping tool.

### C2. Density
- Phone layouts optimize for reading and thumb interaction.
- Controls that appear together should share purpose.
- Do not expose every model/provider parameter at once.
- Dense expert controls belong in secondary sheets/settings.
- Minimum touch targets must remain comfortable under RTL and font scaling.

### C3. Typography
- Use a compact type scale with clear roles.
- Body text prioritizes readability over novelty.
- Arabic typography must be evaluated independently; identical Latin metrics are not automatically correct.
- Code typography and prose typography should not compete.
- Avoid excessive weight variation.

### C4. Color/theme
- Day/night are first-class themes, not simple inversion.
- Accent color signals action/selection, not decoration everywhere.
- Destructive actions are distinct.
- Disabled, loading, selected and error states remain distinguishable in both themes.
- Contrast must survive OLED dark mode and low-brightness use.

### C5. Motion
- Motion explains continuity: opening a sheet, switching room, sending, streaming, expanding sources.
- Avoid motion that delays action.
- Reduced-motion path is functional and coherent.
- Loading animations must not distract from readable partial output.

## D. Android product quality

- Cold launch gives useful feedback quickly.
- Keyboard and safe-area handling are deterministic.
- Back gesture/button behaves predictably across sheets, dialogs and screens.
- Process recreation and foreground/background transitions preserve committed state.
- Permission requests occur in context.
- File picking uses native Android expectations.
- Network loss is surfaced without destroying input.
- Small-phone widths remain first-class.
- Font scale and landscape are regression surfaces.
- Haptics, when used, confirm meaningful transitions rather than every tap.

## E. Arabic / RTL

- Layout direction and text direction are separate concerns.
- Mixed Arabic/English/code content must remain readable.
- Icons with directional meaning mirror when semantically required.
- Numbers, code, URLs and citations should not become visually scrambled.
- Sheets, navigation, composer and overflow menus must be explicitly tested in RTL.
- Arabic copy should be natural product language, not literal word-for-word localization.
- Font metrics, line height and truncation need Arabic-specific review.

## F. Search / research UX

- Search status should explain what is happening: searching, reading, synthesizing, citing.
- The user should not need to understand retrieval architecture.
- Source quality/freshness is more valuable than raw source count.
- Citations must be tappable and mapped to claims.
- Research mode should expose deeper evidence without turning ordinary chat into a control panel.
- Partial source failures should degrade gracefully.

## G. Model and reasoning UX

- Default routing should be excellent without requiring model knowledge.
- Model choice is an expert affordance, not the prerequisite for success.
- Quick/Balanced/Deep should communicate latency/quality tradeoff clearly.
- Deep reasoning must not feel frozen; progress states should be meaningful.
- Provider outages/fallback should be normalized into user-facing language.
- Never expose credentials or implementation-specific failure dumps.

## H. Files and multimodality

- Attachments have visible upload/processing state.
- Unsupported type/size errors are immediate and actionable.
- File identity remains attached to the correct room/task.
- Preview and remove actions are obvious.
- Reopening the app must not create phantom attachments.
- Generated images/files should be easy to inspect and continue working with.

## I. Error/recovery design

- Preserve user work first.
- Error messages state what failed and what the user can do.
- Retry is bounded and idempotent.
- Offline state is distinguishable from provider failure.
- Corrupt local state must enter a recoverable mode, never an inert UI.
- Self-healing may repair implementation failures but must not weaken gates.

## J. Performance perception

- Perceived latency matters as much as benchmark latency.
- React immediately to input, then perform expensive work.
- Avoid layout shifts during streaming.
- Long histories use incremental rendering/loading.
- Animations stay smooth on midrange Android hardware.
- Background tasks must not block composer interaction.

## K. Product cohesion test

Ask these questions for every new APK:
1. Does it feel like one product or several tools glued together?
2. Is chat still the obvious center?
3. Are controls placed where users expect them?
4. Does every feature use the same design language?
5. Can a new user discover advanced features without being overwhelmed?
6. Does the product explain system state?
7. Does Android behavior feel native enough?
8. Is Arabic/RTL equally intentional?
9. Are error and recovery states as polished as happy paths?
10. Would removing a feature make the product clearer? If yes, justify keeping it.

## L. Anti-pattern library

Hard-negative examples:
- dashboard-first AI chat where the message stream feels secondary;
- permanent rows of provider/model/debug toggles;
- multiple unrelated modal styles;
- feature icons with ambiguous meaning and no labels/tooltips;
- loading spinners with no state explanation;
- duplicate controls in toolbar + composer + settings;
- hidden long-press required for core tasks;
- oversized cards that waste phone viewport;
- excessive gradients/glows used to simulate quality;
- copied competitor geometry without adapting to Seven workflows;
- inconsistent back behavior;
- success defined as “button exists”;
- visual polish that hides broken persistence;
- dense developer terminology in user-facing errors.

## M. Benchmark lessons (not copy instructions)

### ChatGPT
Study: calm conversation-first hierarchy, minimal permanent chrome, strong composer, progressive exposure of tools, readable long responses, clear attachment affordance, history/sidebar discipline.

### Gemini
Study: expressive but structured response presentation, multimodal/tool discovery, fluid transition language, dynamic layouts while preserving readability.

### Perplexity
Study: search/source integration, concise source affordances, mode/model selection without overwhelming the query field, research progression.

### Microsoft Copilot
Study: task-aware prompting, output readability, connecting tools to user intent rather than surfacing implementation mechanics.

### Poe
Study: model/bot abundance and discoverability; also use as a warning against allowing model choice to overwhelm the core chat flow.

## N. Evidence hierarchy

Strongest to weakest:
1. executable user journey on target Android build;
2. deterministic browser/E2E test;
3. captured screenshot/video with exact build identity;
4. source inspection tied to runtime path;
5. agent inference;
6. aesthetic opinion without evidence.

Judges must label which level supports every major claim.
