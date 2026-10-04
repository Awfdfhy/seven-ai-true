# Pattern Library — Chat, Composer & Response

Status: ACTIVE KNOWLEDGE PACK

## North star

The fastest path from app launch to a useful conversation. Chat owns the primary visual hierarchy. Advanced power exists without occupying permanent space.

## Composer anatomy

Input area; attachment affordance; contextual tool/mode entry; send/stop; voice if supported; processing states; draft identity. Keep hit targets comfortable and preserve the active text above IME/system UI.

## State machine

IDLE → EDITING → SUBMITTING → STREAMING → COMPLETE. Side paths: STOPPING, FAILED_RECOVERABLE, OFFLINE_WAITING. Each state has explicit allowed actions. Never infer task truth only from button appearance.

## Streaming rules

Stable scroll anchoring; low reflow; incremental markdown strategy; partial answer visibly active; stop always targets originating task; source/tool progress is truthful; no duplicate finalization.

## Long answer rules

Readable heading rhythm, lists, code blocks, tables with horizontal containment, citation affordances, copy/selection, image/file outputs and preservation of reading position.

## Mobile checks

320/360/390/412 widths; keyboard open; font scale; RTL; landscape; long paste; multi-line draft; system back; orientation; transient network loss.

## Benchmark lesson

Current leading AI chat apps increasingly consolidate tool controls to reduce composer clutter; use the principle of progressive disclosure, not copied pixels.
