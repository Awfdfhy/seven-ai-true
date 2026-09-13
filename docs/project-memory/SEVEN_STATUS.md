# Seven AI — Current Status

> Update this file when a meaningful project milestone changes. It is a compact operational snapshot, not a replacement for the Master Plan.

## Active Development Branch
`seven-beta-ui-v1`

## Protected Branches / PRs
- `main` — baseline
- `seven-v4.2-hardening` — hardened architecture branch
- PR #15: `seven-v4.2-hardening` → `main` — keep unmerged
- PR #16: `seven-beta-ui-v1` → `seven-v4.2-hardening` — keep Draft/unmerged

## Protected Source
`seven_ai-final.html`

Known integrity reference from the protected baseline:
- bytes: `658133`
- Git blob SHA: `3e8dfa8e7da7124e16504140eb9631c10cabf053`

A source-integrity test exists and should remain part of release verification.

## Ultimate Polish Campaign
- Protocol: `SEVEN_ULTIMATE_POLISH_PROTOCOL.md` v2.1
- Velocity Fabric is mandatory across every capability polish.
- Capability 01 — Cognitive Runtime: **Architecture Freeze Candidate complete**
- Canonical polish record: `docs/project-memory/ultimate-polish/01_COGNITIVE_RUNTIME_ULTIMATE_POLISH.md`
- Cognitive Runtime implementation remains **partial/foundation**, not implementation-frozen. CR-P0 through CR-P7 remain to be built/wired/verified against the freeze candidate.
- Next numbered core capability after Cognitive Runtime: Capability 02 — Truth / Epistemic Fabric.

## Implemented / Strongly Established
- Hardened Cognitive Runtime v4.2 direction
- Task contracts, truth fabric, context compiler, resource governance and side-effect ledger foundations
- Browser control / bridge / execution bridge
- Memory and persistence hardening foundations
- Research runtime
- Canon simulator and world runtime
- Coding runtime foundations and verification controls
- Beta UI runtime
- Adaptive Day/Night theme
- Aurora semantic state layer
- Lazy workspace hub
- Coding Agent workspace
- RPG / Real Works workspace
- Mobile / RTL / reduced-motion test coverage
- Verified release artifact pipeline
- Real release screenshot capture pipeline
- GitHub project-memory system

## Beta UI State
Beta UI is functional but not final product UI.

Current visual direction is being aligned with the adopted curved/ribbon Seven identity:
- primary brand family: Seven Blue / Cyan
- Day: clean bright surfaces
- Night: midnight/navy surfaces
- curves and ribbon continuity
- restrained shadows and highlights
- semantic workspace/state colors remain functional, not decorative

Latest identity-alignment work started on the Beta branch. Do not call Beta UI final until the remaining polish and gates pass.

## Remaining Beta UI Work
1. Verify current identity-alignment CI
2. Finish Chat/Home/Topbar/Sidebar/Composer/Settings polish
3. Bring Coding Agent workspace into the same visual language
4. Bring RPG / Real Works workspace into the same visual language
5. Refine Aurora / motion / status presentation
6. Run mobile, RTL, Day/Night, Reduced Motion, Lite, contrast, overflow, source-integrity and release gates
7. Capture new real screenshots from the verified artifact
8. Beta UI Freeze

## Final UI
Not started as a dedicated final redesign. The Final UI phase comes after Beta/identity/system stabilization and may redesign surfaces more substantially.

## Release Safety
Before declaring a major milestone PASS:
- verify CI success
- verify source integrity
- verify no accidental file deletions
- verify protected source remains unchanged unless explicitly approved
- verify release artifact boots
- verify mobile/RTL/theme/reduced-motion gates
- do not merge protected PRs automatically

## Current Development Philosophy
Use large coherent patches, minimal repetitive checks, then one strong final verification pass. Preserve mature systems and avoid scope drift.