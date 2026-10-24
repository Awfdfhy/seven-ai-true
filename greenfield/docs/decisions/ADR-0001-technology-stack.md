# ADR-0001: Technology Stack

- **Status:** OPEN — no stack selected.
- **Date:** 2026-10-24
- **Decision owner:** Project owner
- **Context:** Seven RPG is a mobile-first, text-heavy cinematic RPG requiring robust persistent state, AI provider replacement, Arabic RTL/LTR, deterministic tests, Android packaging, and reliable low/mid-range performance.

## Candidate evaluation
Compare no more than three candidates. Do not fill scores from preference alone.

| Criterion | Weight | Candidate A | Candidate B | Candidate C |
|---|---:|---:|---:|---:|
| Android packaging/lifecycle | 15 | TBD | TBD | TBD |
| Mobile UI and RTL | 15 | TBD | TBD | TBD |
| Persistence/migrations | 15 | TBD | TBD | TBD |
| Deterministic testing | 10 | TBD | TBD | TBD |
| AI streaming/cancellation | 10 | TBD | TBD | TBD |
| Low/mid-range performance | 10 | TBD | TBD | TBD |
| Offline behavior | 5 | TBD | TBD | TBD |
| Accessibility | 5 | TBD | TBD | TBD |
| Reproducible builds/app size | 5 | TBD | TBD | TBD |
| Maintenance/licensing/ecosystem | 5 | TBD | TBD | TBD |
| Agent ergonomics | 5 | TBD | TBD | TBD |

## Required evidence
- Candidate-specific proof-of-concept repository or isolated spike.
- Exact build/test commands and outputs.
- Android packaging and lifecycle smoke.
- RTL rendering and text-input smoke.
- Save/load/migration feasibility.
- Provider mock, cancellation, and structured-output feasibility.
- Dependency health, license, maintenance, and app-size observations.

## Decision
**Not yet made.** Populate candidates, evidence, scores, rejected options, migration costs, and owner review. Do not scaffold the full application before the decision is evidence-backed.
