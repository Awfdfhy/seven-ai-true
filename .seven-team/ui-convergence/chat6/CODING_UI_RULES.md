# Seven Coding UI — Target Rules
1. Hierarchy: task is first, followed by project context, selected file preview, execution, verification, result.
2. Not an IDE: no simulated terminal, fake workspace editor, pretend filesystem modification or compile buttons.
3. Project ListRow shows filename first; path, size and fingerprint only on inspector expansion; file rows have accessible selection semantics.
4. Every path, SHA, fingerprint, and code preview uses dir=ltr, overflow-wrap:anywhere for paths and independent horizontal scrolling for code; no forced RTL code layout.
5. Task composer is a dedicated compact task surface; Run, Stop, Retry invoke existing handlers without duplicate global composer.
6. Execution collapses into human-friendly steps, keeping exact statuses and expandable raw evidence.
7. PASS/WARNING/FAILED/PENDING must use icon+word+explanation, never color alone; never infer checks not present in run data.
8. Empty states: no-project, no-selected-file, no-execution, no-verification, no-output: one explanatory sentence plus applicable existing action.
9. Canonical semantic tokens only; no new component library, CSS framework, global overrides or modal.
10. Breakpoint matrix 320/360/390/420px, Arabic/English, light/dark, large text, keyboard, 100 files, giant path/error/task, reduced motion and focus.
11. Minimum actionable geometry 44px compact fallback, Android target 48dp.
12. QA gates: exact-SHA screenshot and behavioral evidence plus independent visual reviewer; do not label READY beforehand.
