# Seven Visual Intelligence & Design Fabric 1.3 - Image Asset Closure

Status: ARCHITECTURE_CANDIDATE
Cumulative stack: V1.0 + V1.1 + V1.2 + this closure
Governance: Polishing V5.40

## 1. Image Asset Intelligence Plane

Seven Visual Polish may inspect an image asset directly, not only the screen that contains it.

Supported asset classes in the architecture:
- raster logos/icons
- vector marks/icons
- adaptive icon layers
- splash/launch marks
- illustrations
- decorative graphics
- generated visual assets
- screenshots when treated explicitly as image evidence

### Canonical asset identity
Every asset receives an evidence envelope containing, where available:
- content hash
- asset class
- format
- pixel/vector dimensions
- aspect ratio
- alpha/background properties
- source/import/generation lineage
- license/usage status for external sources
- Design Genome version
- candidate/campaign identity

## 2. Objective Image Inspection

Where technically available, inspect:
- dimensions and scaling
- transparent bounds
- edge cleanliness and aliasing
- unintended crop/clipping
- empty/negative-space distribution
- palette and luminance relationships
- foreground/background contrast
- tiny-size degradation
- compression/raster artifacts
- monochrome survival
- representative background survival
- mask/crop survival
- duplicate/near-duplicate candidate detection
- output file size and decode/render cost

For vectors additionally inspect:
- viewport and bounds
- path/node complexity
- stroke/fill consistency
- scaling behavior
- unsupported or expensive filter/effect use
- accidental hidden geometry

## 3. Derived Visual Understanding

Multimodal/visual judgment may derive observations such as:
- focal point
- silhouette strength
- perceived balance
- visual hierarchy
- symbol legibility
- semantic/concept fit
- distinctiveness
- excess complexity
- likely tiny-size recognizability
- Day/Night personality fit

These remain judgment evidence. They do not become objective facts merely because a vision model produced them.

If text presence is material, OCR/text detection may be used as a bounded diagnostic channel. It is not automatically authoritative over the source asset or design intent.

## 4. Image Candidate Transformation Studio

Do not overwrite the baseline asset in place during exploration.

Candidate operation classes include:
- simplify geometry
- rebalance silhouette
- adjust negative space
- alter stroke/fill weight
- recolor through canonical roles
- remove accidental detail
- create monochrome form
- create adaptive foreground/background separation
- crop/reframe
- resize/resample
- vector/raster implementation alternative
- generate a conceptually different candidate
- no-change control

Each transformation creates a new candidate identity linked to its source and instruction/transformation lineage where available.

## 5. Multi-Candidate Rule

For material logo/brand decisions, a single edited result is not enough.

The Image Asset Studio should preserve a portfolio containing, when useful:
- baseline
- simplifier
- conservative refinement
- distinctive refinement
- structurally different candidate
- monochrome/adaptive derivative candidates

Candidate count follows uncertainty and diversity value, not a fixed quota.

## 6. Logo-Specific Measurement Bundle

Logo finalists require:
- silhouette comparison
- negative-space balance
- tiny-size matrix
- monochrome matrix
- adaptive mask matrix
- Day/Night/background matrix
- themed-icon treatment
- splash/launch fit
- static and motion-mark relationship
- asset complexity/cost
- distinctiveness/anti-imitation review
- concept-fit judgment

Recognition/recall claims require human evidence; a vision model may only provide a hypothesis or expert-style judgment.

## 7. Export & Implementation Verification

An approved visual concept is not complete until exported artifacts are verified.

Check:
- intended dimensions
- correct alpha/background
- expected color profile where material
- no accidental crop
- no excessive file size
- vector/raster parity where both exist
- launcher/splash integration output
- build pipeline consumes the approved identity rather than a stale legacy asset
- generated Android resources point to the intended layers

## 8. Image Truth Boundary

An edited screenshot cannot prove a feature exists.
A prettier warning graphic cannot prove warning logic is correct.
A logo mockup inside an Android frame cannot prove launcher-mask behavior.
A generated UI concept is a candidate design artifact, not implementation evidence.

Image evidence only proves what its evidence class can support.

## 9. Tool/Model Routing Boundary

The architecture may use different visual tools/models for:
- inspection
- candidate generation/editing
- vector/raster analysis
- independent judgment

The same generator should not be the only decisive judge of its own output for high-impact candidates.
Tool/model identity and material configuration belong in the candidate evidence manifest where available.

## 10. Failure Cemetery Additions

Future reproduced cases include:
- mark readable at 1024px but collapsing at 24px
- adaptive mask clipping
- monochrome losing identity
- aliasing after export
- stale build consuming previous logo
- excessive vector path complexity
- icon/background contrast failure
- candidate strongly resembling an external identity
- image generator artifact surviving into release asset

## 11. Closure

V1.3 closes Challenge C's missing direct-image capability at architecture level.

The complete visual architecture can now reason about both the product surface and the assets composing that surface. Implementation of image inspection/generation adapters remains separate from architecture truth.