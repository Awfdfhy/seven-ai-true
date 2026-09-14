# Seven Visual Intelligence 1.3 - Challenge D

Status: MATERIAL_IMPROVEMENT_FOUND
Saturation counter: 0/2
Lens: generated/typed UI, tool outputs, dynamic surfaces and untrusted presentation requests.

## Material finding
Seven is not only a fixed-screen application. Its roadmap includes Generative / Typed UI, tool output surfaces, research evidence, charts and dynamically composed workspaces.

A frozen Design Genome can still be bypassed if a model/tool produces raw markup/styles or an unconstrained component tree.

## Required closure
Add a Generated UI Governance Plane with:
- typed component allowlist/catalog
- schema validation
- semantic role validation
- Design Genome token-only styling by default
- no direct arbitrary CSS/HTML authority from model/tool output
- bounded layout primitives
- accessibility contracts per component
- RTL/Day/Night/Reduced Motion compatibility contracts
- unknown-component safe fallback
- content-size/extreme-data stress handling
- visual evidence binding for generated surfaces
- provenance linking tool/model result to rendered component tree
- isolation between data authority and presentation authority
- chart/data-viz grammar with non-color semantic alternatives
- generated surface resource budgets

Generated UI may request presentation but cannot grant itself runtime authority, permissions or verified status through visual form.

## Verdict
MATERIAL_IMPROVEMENT_FOUND.
Close generated-surface governance before fixing the architecture for saturation.