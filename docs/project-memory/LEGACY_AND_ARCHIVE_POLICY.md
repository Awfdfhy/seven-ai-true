# Seven AI — Legacy & Archive Policy

## Purpose
Seven has accumulated multiple generations of architecture, polishing, challenge, freeze, research and implementation evidence. Those records are useful, but mixing them with current authority creates stale-plan bugs.

## Classification
### CURRENT
Documents under `docs/project-memory/current/` are the default authoritative planning layer.

### SPECIALIST EVIDENCE
Named specialist fabrics, Tool Fabric research, visual systems, benchmark evidence, debugging records and implementation reports may remain active references when a current document points to them.

### HISTORICAL EVIDENCE
Versioned polishing generations, old challenge rounds, superseded freeze records and earlier architecture candidates are historical unless explicitly reactivated by a current decision.

## Rules
1. Never infer that the highest version number is automatically authoritative.
2. Never treat a historical `PASS`, `FREEZE` or `SATURATED` result as proof for a newer architecture or implementation.
3. Preserve historical files when they explain lineage, rejected alternatives, regressions or evaluation logic.
4. Prefer relocation/indexing over destructive deletion.
5. Any future cleanup that physically archives files must preserve Git history and repair references in current documents.
6. Runtime truth outranks documentation claims when they conflict.
7. `seven_ai-final.html` is unaffected by documentation reorganization and remains protected.

## Naming policy going forward
Current top-level project-memory documents use short stable names inside `current/`. Specialist systems may keep descriptive filenames. Experimental generations should include clear version/status language and should not be added to the current read set until promoted.
