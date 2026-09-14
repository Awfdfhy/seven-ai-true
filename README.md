# Seven AI

Seven AI is an Android-first, user-owned AI platform built as one coherent intelligence system rather than a pile of disconnected features.

## Current Source
- Protected application source: `seven_ai-final.html`
- Architecture baseline: `SEVEN_AI_ARCHITECTURE_V4.md`
- Current durable project memory: `docs/project-memory/current/`
- Historical design, research and polishing evidence remains preserved under `docs/project-memory/` and specialist subdirectories.

## Canonical Project Memory
Read these first for current work:
1. `docs/project-memory/current/MASTER_PLAN.md`
2. `docs/project-memory/current/DECISIONS.md`
3. `docs/project-memory/current/STATUS.md`
4. `docs/project-memory/current/CAPABILITY_REGISTRY.md`
5. `docs/project-memory/current/ULTIMATE_POLISH.md`
6. `docs/project-memory/current/MAXIMUM_EFFORT_PROTOCOL.md`

The current visual campaign has frozen the **Visual Intelligence & Design Fabric V1.4 architecture** at `ARCHITECTURE_SATURATED_2_OF_2`. This is an architecture result, not a claim that final visual implementation is complete. The implementation program includes the Design Genome, Logo Tournament and 12 visual Mega-Waves.

The broader Ultimate Polish campaign targets every canonical capability individually, including Tool Fabric 2.0 additions, with independent challenge passes and a cross-cutting Speeding & Smoothness System.

## Repository Rules
- Preserve mature work.
- Do not casually modify or replace `seven_ai-final.html`.
- Do not delete historical evidence merely because it is no longer authoritative.
- Verification precedes PASS claims.
- Expensive compute, tools and effects remain selective.
- Android RAM, battery, startup, storage and APK weight are first-class constraints.
- Reduced Motion, performance tiers, Arabic/RTL and accessibility remain product requirements.

## Tests
With Node.js 20 or newer:

```sh
npm install --no-save playwright
npx playwright install --with-deps --only-shell chromium
node all.cjs
```

The runner exits unsuccessfully if browser startup or assertions fail. Browser tests use isolated storage and block external requests; no live provider calls are made. GitHub Actions runs the verification workflow on supported repository events.

Android/APK and live-provider integration have their own verification gates. See `DEVELOPMENT_REPORT.md` and the current project-memory status for the latest evidence.
