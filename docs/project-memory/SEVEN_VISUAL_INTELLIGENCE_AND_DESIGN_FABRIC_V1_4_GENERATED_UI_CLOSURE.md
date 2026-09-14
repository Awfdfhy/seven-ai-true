# Seven Visual Intelligence & Design Fabric 1.4 - Generated UI Closure

Status: ARCHITECTURE_CANDIDATE
Cumulative stack: V1.0 + V1.1 + V1.2 + V1.3 + this closure
Governance: Polishing V5.40

## 1. Generated UI Governance Plane

Dynamic UI is treated as a typed rendering request, not permission to emit arbitrary presentation code.

### Core law
Data/tool/model output may request an approved presentation shape, but it cannot grant itself authority, verification state, permissions or unrestricted styling.

## 2. Typed Component Catalog

Generated surfaces use an allowlisted catalog of components such as:
- text/heading/body/metadata
- status/evidence badges
- cards/sections
- tables/lists
- code/diff/output
- source/citation groups
- progress/state panels
- forms with explicit permission contracts
- charts/visualizations
- media previews
- timeline/chronology
- RPG/canon entities
- tool result panels

Each component contract defines:
- input schema
- semantic role
- allowed Design Genome tokens
- accessibility semantics
- RTL behavior
- Day/Night behavior
- Reduced Motion behavior
- Lite-tier behavior
- size/content limits
- interaction/side-effect boundary
- fallback behavior

## 3. Schema & Presentation Firewall

Before render:
1. validate typed schema,
2. reject unknown/forbidden component types,
3. validate content bounds,
4. normalize semantic roles,
5. resolve canonical Design Genome tokens,
6. strip/deny arbitrary executable markup/style authority,
7. bind provenance to the rendered tree.

Raw HTML/CSS/JS from a model or tool is content/data unless a separately authorized coding workflow handles it. It is not automatically executable UI.

## 4. Authority Separation

Presentation never raises authority.

Examples:
- a green card cannot turn an unverified result into VERIFIED,
- a warning-colored result does not become authoritative merely because it looks critical,
- tool output cannot create a permission prompt that authorizes itself,
- generated forms cannot perform side effects without the existing permission/tool runtime,
- rendered citations remain bound to their actual source/evidence lineage.

## 5. Generated Layout Constraints

Dynamic surfaces use bounded primitives:
- canonical spacing
- canonical typography
- canonical surface hierarchy
- bounded nesting depth
- bounded card/list density
- overflow handling
- long-content virtualization/lazy rendering where needed
- mobile-first responsive composition
- no unbounded fixed-height content traps
- no component that hides critical action/state under decorative content

## 6. Data Visualization Grammar

Charts/visualizations require:
- truthful axis/domain binding
- source/data provenance
- accessible text/table alternative where material
- non-color-only distinction
- Day/Night contrast
- RTL label/layout behavior where relevant
- small-screen fallback
- large-data/resource budget
- explicit uncertainty/interval rendering when present in source data

A visualization is derived evidence, not stronger authority than its data.

## 7. Unknown Component Fallback

Unknown/unsupported generated component requests fail safely to a canonical readable representation such as:
- structured text
- key/value table
- code/plain result block

Failure to render a fancy component must not lose the underlying information.

## 8. Generated Surface Evidence

Material generated UI fixtures enter the visual scenario system with:
- schema identity
- renderer version
- component catalog version
- Design Genome version
- source/tool/model provenance
- content stress class
- screenshot/structural evidence
- accessibility receipt
- resource receipt when heavy

## 9. Component Evolution

Adding a new generated component requires:
- use-case proof
- schema
- semantic contract
- Design Genome integration
- state completeness
- accessibility contract
- scenario tests
- resource behavior
- security/permission boundary review
- regression-cemetery entry if a failure was discovered

Models/tools cannot extend the allowlist at runtime by assertion.

## 10. Closure

V1.4 closes the generated/typed UI gap found by Challenge D. The cumulative Visual Intelligence architecture now covers fixed screens, direct image assets, motion, platform identity, dynamically generated surfaces, human/evaluator evidence, accessibility, performance and post-release durability.

Runtime implementation remains separate from architecture truth.