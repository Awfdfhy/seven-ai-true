# Coding implementation plan — freeze-safe
1. Capture baseline viewport screenshots and selector/computed-style inventories at exact SHA.
2. Confirm workspace primitives and runtime payloads in the frozen integration branch.
3. Implement ONLY on a separate Chat6-owned branch or isolated patch; no shared shell/tokens.
4. Render task first, then project and preview, then execution/verification/result; preserve data-code-* hooks and exported API.
5. Move fingerprint behind inspector and give code/path LTR; make code pre independently scrollable.
6. Keep attachProjectContext, import files/folder, sendMessage, stopGeneration, regenerateLastReply behavior exact.
7. Unit/regression: imports, empty states, duplicate same-file import, selected path, Arabic, no-run, run with steps/calls, verification failures, run stop/retry, context persistence rollback.
8. Measure source and built release-layer byte sizes BEFORE and AFTER: no budget bump.
9. Submit changes to I01 for lease and integration. Do not merge frozen branch.
10. Android screenshots API34/36 and independent visual review after integrator stabilization.

No implementation has been performed or tested in this document batch.
