# UI Integration Freeze

Effective immediately on branch `ui/20-agent-convergence-20261006`.

Owner: Chat 0 / I01.

Until this freeze is lifted:
- No agent may modify shared/core production UI files.
- Chat 1–4 may add isolated reports/tests only if they do not change the release candidate SHA after validation starts.
- Chat 5 remains read-only.
- No new features.
- No new CSS override layer.
- No new token namespace.
- No new modal/picker/shell implementation.
- RPG implementation changes require Chat 0 integration.
- CI evidence is valid only for the exact frozen SHA.

Reason: repeated concurrent commits cancelled integration CI and obscured evidence. The next acceptance cycle must use one stable candidate SHA.
