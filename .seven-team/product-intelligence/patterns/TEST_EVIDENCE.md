# Pattern Library — Testing, Evidence & Release

Status: ACTIVE KNOWLEDGE PACK

## Proof ladder

Agent claim < source inspection < unit < integration < browser E2E < Android emulator < chaos/differential < physical-device evidence.

## Exact artifact

Every release verdict binds source SHA, APK SHA256, test/evaluator version, screenshots and known limitations.

## Visual

Golden screenshots require intentional approval; presence of screenshot alone is not regression testing.

## AI semantics

Where exact text is nondeterministic, assert properties: instruction following, citation support, tool/file scope, cancellation, state ownership, safety and completion.

## Release rule

Any hard invariant fail blocks release regardless of aggregate score.
