# Team A — A10 Live Runtime Smoke Test (Hermes Agent)

## 1. Identity

- **Team:** Team A — UI Foundation V2 and cross-workspace product cohesion
- **Worker:** A10 — Independent Integration Reviewer
- **Runtime:** Hermes Agent
- **Change scope for this run:** `.seven-team/reports/team-a-hermes-live-smoke.md` (report only)

## 2. Mission (independent review, no implementation)

My job is to look at the product as a whole rather than inside any single workspace, and to say plainly where the seams between areas are likely to fail. I do not implement features, I do not "fix while looking," and I do not touch production code to make a finding go away. Anything I find becomes a written risk with enough detail that the owning team can act on it under the right lease. My output is judgment, not diffs: if a fix touches the shared core, I flag that a manager lease and separate implementation owner are required, and I stop there.

Review lens, in priority order:

1. **Cross-workspace coherence** — do chat, settings, search, research, coding, RPG, and Self-Dev behave like one product with one set of conventions, or like seven tools sharing a shell?
2. **Directional correctness** — RTL is a first-class layout target here, not a bolt-on mirror.
3. **Theme and state** — themes, tokens, and persisted state must resolve identically in every workspace.
4. **Small-screen and embedded runtime** — mobile layouts and the Android WebView are where CSS assumptions surface as real defects.

## 3. Three cross-workspace integration risks

### Risk 1 — Shared-core presentation state leaks across workspace boundaries

Chat, research, coding, and Self-Dev each render rich content: streamed text, code blocks, diffs, tables, tool traces. These surfaces share tokens, typography scale, and container padding, but their content shapes differ. The failure mode is a change made in one workspace to solve a local problem (wider code-block padding, a different stream cursor, a rem-based font size) that silently re-flows every other workspace that consumes the same shared component. The risk is not any single workspace breaking — it is the shared core becoming a place where no team can safely make a change, because the blast radius of any edit is unstated and untested outside the editor that motivated it. **Mitigation required:** shared-core changes need a manager lease and a named separate implementation owner, plus a coherence pass across the consuming workspaces before merge — not a single-workspace visual check.

### Risk 2 — Settings persistence diverges from what each workspace actually reads

Settings is the single write path for user preferences: theme, language/direction, density, model or provider selection, and per-workspace toggles. The risk is a write/read asymmetry: a preference is added to settings, persisted, and surfaced in the settings UI, but one or more workspaces keep their own default, their own cache, or their own interpretation of that key. The user then sees a control that does nothing in a specific workspace, or — worse in RTL and theme terms — a workspace that renders left-to-right or light while settings claims the opposite. Because the symptom appears in a workspace far from the settings code that caused it, this class of defect is expensive to trace and tends to be patched at the reading site instead of the write path. **Mitigation required:** one canonical settings schema as the source of truth, consumers read-only from it, and an explicit per-workspace coverage statement for every new preference so an unread key fails review rather than shipping silently.

### Risk 3 — Android WebView and mobile narrow-viewport behavior diverges from the desktop design target

Search, research, and coding are the densest layouts in the product: multi-pane results, wide code blocks, horizontal timelines, sticky action bars. They are tuned against a modern desktop engine, and desktop Chrome is the implicit reference during development. The Android WebView differs in engine version, viewport handling, safe-area insets, and keyboard behavior; mobile viewports also change what "fits" in ways a desktop check never surfaces. The concrete risk is that a workspace is verified on desktop and silently degrades on device: clipped or horizontally scrolling results, an action bar hidden behind the keyboard, insets that double-count, or a stream that stops auto-scrolling. This is a cross-workspace risk because each dense workspace independently makes these assumptions, and each will need the same corrections; a per-workspace fix applied four times is a shared defect wearing four patches. **Mitigation required:** define the supported engine/viewport matrix once, treat WebView and narrow viewport as a required verification target for any dense workspace, and fix layout/inset/overflow at the shared container level rather than per workspace.

## 4. Branch

`agent/10-integration-review`

## 5. Smoke outcome

Live runtime smoke executed by Hermes Agent as Team A worker A10. Report-only change; no production code touched, no other file modified, no credentials or environment inspected, no network requests made.

LIVE_AGENT_SMOKE=PASS
