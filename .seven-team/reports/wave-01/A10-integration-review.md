# A10 — Integration Review: Wave 01A Audit Package (UI Foundation V2)

Scope: whether the nine Team A audit reports are an evidence-backed, coherent implementation
plan. This is NOT a claim that the UI Foundation V2 rebuild is done.

## 1. Reports reviewed — all nine present and usable

| ID | Subject | Evidence character |
|---|---|---|
| A01 | UI ownership / migration map | grep counts, file:line, absent-file recorded |
| A02 | Android-WebView matrix | PROVEN/CAPTURED/UNPROVEN convention, workflow+generator traced |
| A03 | Localization/nav/dialog cohesion | verified findings F1-F8 + migration order |
| A04 | Design-system map | layer graph, components C1-C14, Steps 0-13 with deletion criteria |
| A05 | Runtime/model/mode/search controls | control -> state -> runtime traces with line refs |
| A06 | Persisted UI state | IndexedDB invariants verified; narrow evidence boundary |
| A07 | Self-Dev credential/protected-action UX | facts vs hypotheses split, native boundary traced |
| A08 | Product UI evaluation harness | reuse map, failure semantics, first slice |
| A09 | Performance baseline/budgets | file:line hotspots; budgets are estimates only |

Weak or missing evidence:
- A09 is the weakest report: every number in its budget table is an estimate ("untested").
  No metric is measured. Instrumentation must precede any budget claim.
- A06 restricted itself to 4 files and lists 14 unknowns (locale/theme/model keys, build
  ownership). Those are already answered by A03 F8, A05 and A04 R11; merge, do not re-open.
- No report in the package produced a screenshot or a test run. All nine are static,
  read-only audits: the package contains zero runtime evidence.
- A08 dates its evidence base "commit of 2024-10-03 tree"; A02 is dated 2026-10-03.
  Possible snapshot drift — confirm both against one tree before implementation.
- A02 states it rewrote a prior version and deleted unverifiable claims. Correct practice,
  but any earlier claim from it is now unreviewable.

## 2. Cross-agent conflicts, resolved by report ID

C1 Overlay count. A01 counts 3 systems; A03 F5 counts 4 stylesheets styling `.modal` plus
2 JS layers; A04 C8 counts a 4-way geometry conflict. Not a contradiction — different units.
One decision: a single overlay component (A04 C8 `workspaces/dialog.css`) and one menu
component (A04 C9).
C2 Nav button count. A08 makes a "5-button nav" structural gate. A01 §5.1 proves the count
is unverified: `seven-shell-nav-btn` is absent from both HTML files and the grid hardcodes
`repeat(4,...)`. A01 wins on fact. The harness must pin the count from runtime DOM first;
A08's 5-button gate is provisional.
C3 "First implementation slice". A01 (nav grid), A04 (token alias + deterministic order),
A08 (harness only), plus A05/A06/A07/A09 each name their own. A04 R1/R4 and A08 make the
harness and load-order determinism prerequisites for every other claim. Resolved order:
A08 PR1 -> A04 Step 1 -> A04 Step 2 -> A01 nav slice inside A04 Step 6/13.
C4 Android coverage strength. A08 rates Gate A Android "Strong (no golden compare)";
A02 marks small viewport, landscape, any font scale except 1.15, safe-area, system day/night
and the release variant UNPROVEN. A02 wins; A08 was rating harness wiring, not coverage.
C5 Golden harness existence. A04 R1 says no screenshot/visual-regression file exists; A08
finds an orphaned `release/visual-evidence-runtime.cjs` kernel. A08 wins: kernel exists,
wiring absent. Both agree no baselines are committed.
C6 Unclaimed defect: A03 F5 — `seven-shell-final.js` stamps every `.modal` with
`data-seven-shell-surface="settings"`. No other report covers it. Accept as found; it must
land in the same commit as A04 Step 8 (A03 risk 3: un-migrated dialogs lose focus/Escape).

## 3. Merged dependency order for implementation

0. Evidence first: A08 PR1 (OBSERVE harness, 4 goldens, manifest, no production source) +
   A02 P0-1 Android baseline diff + read `dist/static-audit.json`.
1. Decisions, no code: Manager lease on `release/seven-final.css`, `beta-ui.css`,
   `ui-hardening.css`, `static-audit.cjs`, `seven_ai-final.html` (A04 R2); shipped-artifact
   provenance (A05 D1/R-4); which menu system survives (A04 R10); whether the model pick is
   a lock or a seed (A05 §1.1).
2. Deterministic cascade order, A04 Step 1 — prerequisite of every deletion criterion.
3. Token alias layer `ui-foundation.css`, append-only, zero component rules (A04 Step 2).
4. Versioned UI-state adapter as sole writer (A06) — precedes any locale/theme/model write.
5. Locale singleton + `dir` writer (A03 steps 1-4). Its step 3 revives three dead
   `html[dir=rtl]` rules: highest RTL-regression risk, needs A02 P0-2/3/4 evidence first.
6. Control registry and per-turn snapshot threading (A05) — after A04 C8/C9 canonical,
   because it depends on stable DOM IDs (A05 D4).
7. Component migration, A04 Steps 3-13 in order; A01 nav slice inside Step 6; shell
   deletion in Step 13 as a paired JS+CSS commit (A04 R5).
8. Perf slice (A09 `renderChatHistory` diff) as its own commit after step 3; never co-migrated
   with component rules (A04 §9.6).
9. A07 native protected-path + merge/dispatch confirm: parallel track, needs Android
   toolchain, requires a security-fix exemption from the feature freeze.

## 4. Top blockers and ownership

B1 No visual baseline anywhere, so no migration step is provable. Owner A08 + A02. Blocks 7.
B2 Lease/scope: Team A owns only `release/workspaces/*.css`; base token layers are
   read-only. Owner Manager. Blocks A04 Steps 2/5/8.
B3 Build provenance unknown: four HTML copies, inlined CSS, runtime-injected layers
   (A01 risk, A05 D1/R-4, A04 R11). Owner Manager + release owner. Blocks all deletions.
B4 Overlay/menu survivor undecided (A04 R10, A01 §4, A03 F5). Owner Manager.
B5 `seven_ui_lang` has no runtime writer (A03 F8) — contract scenario 3 unprovable. Owner A03.
B6 Model pick is a seed, not a lock; catalog refresh discards the pending pick (A05 R1) and
   silently persists an effort/max-token reset (A05 R2). Owner A05; needs a contract ruling.
B7 Release-variant APK never built or verified (A02 P1-4); A02 R1-R3 stay hypotheses. Owner
   A02 + Manager.
B8 Protected-path policy is client-only and non-GitHub keys ship in the bundle (A07 F1/F2/F6).
   Owner A07. Needs freeze exemption.

## 5. Evaluation evidence required before future product merges

- `all.cjs` PASS including the UI harness, plus `dist/ui-evidence-manifest.json` uploaded (A08).
- Zero pageerror / console.error per scenario (A08 P0.1).
- Baselines approved with reviewer/reason/approvalRef, or an explicit OBSERVE->ENFORCE decision.
- Android cells small viewport, font scale 1.5 and 2.0, landscape, day theme, RTL matrix on
  API 34 and 36, each with a diff verdict (A02 P0/P1).
- Gate B: RPG first turn within 3 user-visible actions; Stop-scope scenario; UI close/reopen
  persistence; first-run zero-key routing (A08 §3).
- Gate C censuses: exactly one of each control ID (A05 T7), nav count/order, single overlay,
  zero untranslated Arabic controls (A08 §3 items 10-12).
- Gate D: before/after note, limitations, independent READY / CHANGES REQUIRED, no
  builder self-approval.
- Perf budgets measured, not estimated (A09).
- Security: protected-path block test plus native/JS list parity test (A07 §7).

## 6. Audit-package readiness vs product-release readiness

Audit package: READY as the UI Foundation V2 implementation plan, subject to C1-C6 and B1-B8.
It is file:line-evidenced and it correctly refuses to claim product completion.
Product release: NOT READY and not claimed. No committed baselines, no web screenshot
capture, most of the Android matrix UNPROVEN, release variant untested, locale persistence
incomplete, rebuild not started.

## 7. Verdict

Nine of nine reports present, non-empty, read-only, each ending WAVE01=COMPLETE and
citing source. Conflicts are resolvable by report ID and none blocks adoption of the plan.
Weaknesses concentrate in A09 (no measurements) and A06 (narrow evidence boundary), each
with the report that closes it. Accepted as the integration plan; not accepted as
product-release evidence.

WAVE01_REVIEW=PASS