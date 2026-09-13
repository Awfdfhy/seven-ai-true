# Seven Tool Fabric 2.0 — Wave 16 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 16. No math engine dependency is frozen.
Governing command: `WAVE_16_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should use a **tiered Math Compute Plane**, not one giant computer-algebra/scientific runtime.

1. `ExactMath` from Wave 05 handles integers/decimals/units/basic deterministic arithmetic.
2. `LocalMathEngine` handles common matrices, complex/fraction operations and bounded symbolic transforms.
3. `SymbolicEngine` handles algebra/calculus/equation work when a lightweight browser engine is sufficient.
4. `ScientificHost` uses SymPy/NumPy/SciPy inside Wave 02 sandbox boundaries for advanced work.
5. `MathVerifier` independently checks substitutions, residuals, domains and precision evidence.

The result contract distinguishes exact symbolic answers from numerical approximations and incomplete/non-convergent computations.

## Candidate registry

| Candidate | Kind | Preliminary class | Seven role |
|---|---|---|---|
| Wave 05 BigInt + Decimal | exact arithmetic | CORE EXISTING | simple exact numerical path |
| math.js custom bundle | JS math library | CORE/SPECIALIST CANDIDATE | bounded local matrices/complex/fractions/units/symbolic derivatives |
| Nerdamer | browser symbolic CAS | SPECIALIST / BENCHMARK | algebra/solve/calculus where local symbolic depth matters |
| SymPy | Python symbolic CAS | CORE HOST SPECIALIST | authoritative-compute candidate for advanced symbolic workflows |
| NumPy | Python numerical arrays | HOST SPECIALIST | numerical linear algebra/array primitives |
| SciPy | scientific numerical library | HOST SPECIALIST | root finding, integration, optimization and advanced numerical methods |
| Pyodide | Python/Wasm runtime | EXPERIMENTAL OPTIONAL | browser scientific fallback only if cost is justified |
| unrestricted generated Python | execution strategy | REJECT AS DEFAULT | only explicit sandboxed scientific jobs may use code execution |

## Canonical architecture

`MathTaskClassifier → SafeMathParser → {ExactMath | LocalMathEngine | SymbolicEngine | ScientificHost} → MathVerifier → MathResult`

Routing is capability-based. The model may propose a mathematical operation, but deterministic engines perform the actual calculation where possible.

## Typed expression / result boundary

### MathExpression

Recommended fields:
- expression source text
- parsed AST/reference
- variables/symbols
- assumptions/domains per symbol
- units where applicable
- exact numeric literals preserved as rational/decimal when possible
- source lineage
- parser/engine version

### MathResult

Recommended fields:
- result type: `EXACT`, `SYMBOLIC`, `APPROXIMATE`, `INTERVAL`, `SET`, `MATRIX`, `NO_SOLUTION`, `UNRESOLVED`, `NON_CONVERGENT`, `ERROR`
- canonical expression/value representation
- display representation
- variables/domains/assumptions
- numerical precision/tolerance where relevant
- method/engine/version
- verification status
- residual/substitution evidence
- warnings such as singularity/branch/domain ambiguity
- lineage to input expression/task

`UNRESOLVED` is distinct from `NO_SOLUTION`.

## math.js

math.js supports numbers, BigNumbers, fractions, complex numbers, matrices, units, expression trees, simplification and symbolic differentiation. It also supports matrix operations such as LU solving.

Important mobile finding:
- upstream explicitly supports custom ES-module bundling/tree-shaking and number-only builds; the full library contains many data classes, parser/docs and hundreds of functions.

Seven role:
- build a deliberately small local bundle rather than importing `all`
- expose only reviewed deterministic operations
- reuse Wave 05 exact/unit primitives where they already cover the task
- expression parsing happens in a worker for adversarial/heavy input

Security:
- math.js itself warns arbitrary expressions can create security/stability risks and recommends limiting dangerous functions and using Worker/child-process isolation for potentially heavy expressions.
- Seven never exposes `import`, arbitrary custom function registration, or mutation of global math semantics to model/user expressions.

Sources:
- https://mathjs.org/docs/
- https://mathjs.org/docs/custom_bundling.html
- https://mathjs.org/docs/expressions/security.html
- https://mathjs.org/docs/reference/functions/derivative.html
- https://mathjs.org/docs/reference/functions/lusolve.html

## Nerdamer

Nerdamer provides browser symbolic algebra modules for simplification/algebra, differentiation, integration and equation/system solving. Its module architecture allows core functionality plus optional Algebra/Calculus/Solve components.

Seven role:
- specialist/benchmark for local symbolic operations that exceed a minimal math.js bundle
- do not assume every integral/solve operation succeeds; Nerdamer documents incomplete integration states and performance sensitivity to integration depth
- results pass MathVerifier

Concern:
- public documentation surface is materially older than the most active modern dependencies, so maintenance/freshness and bundle/runtime benchmarks must be part of Deep Polish before adoption.

Sources:
- https://nerdamer.com/documentation.html
- https://nerdamer.com/quickstart.html
- https://nerdamer.com/functions/integrate.html

## SymPy

SymPy is a mature Python symbolic mathematics system with solvers, calculus, simplification, matrices, numerical evaluation and an assumptions system.

The assumptions lesson matters for Seven: expressions can change meaning depending on domains such as real/positive/integer. Unknown assumptions are not equivalent to false assumptions.

Seven role:
- preferred advanced symbolic host/remote specialist candidate
- input is a typed mathematical job, not arbitrary Python source by default
- host adapter converts Seven expressions/assumptions into reviewed SymPy operations
- result serializes back into MathResult rather than exposing Python objects to product logic

Sources:
- https://docs.sympy.org/
- https://docs.sympy.org/latest/guides/assumptions.html
- https://docs.sympy.org/latest/reference/public/basics/index.html
- https://docs.sympy.org/latest/reference/public/matrices/index.html

## NumPy / SciPy

NumPy provides multidimensional arrays and compiled numerical operations including linear algebra and statistics. SciPy extends numerical/scientific computation with root solving, integration, optimization and many specialist algorithms.

Seven role:
- host/remote scientific backend behind explicit capabilities
- numerical algorithms must expose tolerances, iteration status and convergence evidence
- method selection remains explicit/reproducible

Example law:
A numerical root routine that reaches iteration limits returns `NON_CONVERGENT`/warning evidence, never a fabricated exact solution.

Sources:
- https://numpy.org/doc/stable/user/whatisnumpy.html
- https://docs.scipy.org/doc/scipy/
- https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.elementwise.find_root.html

## Pyodide decision

Pyodide brings CPython to WebAssembly and can load scientific packages including NumPy/SciPy. Long computations should run in a Web Worker.

However the current full distribution including vendored packages is documented as **200+ MB**. This conflicts strongly with Seven's base-APK/startup/storage constraints.

Decision:
- EXPERIMENTAL optional runtime only
- never base APK
- only revisit if a narrowly packaged/on-demand configuration beats remote/host and lightweight JS engines on target-device Evals
- model/package downloads require explicit user action/resource eligibility

Sources:
- https://pyodide.org/en/stable/
- https://pyodide.org/en/stable/usage/downloading-and-deploying.html
- https://pyodide.org/en/stable/usage/webworker.html

## SafeMathParser

Rules:
- no JavaScript `eval` / `Function`
- bounded source length/node count/depth
- allowlisted operators/functions
- symbol count limits
- matrix dimensions/elements bounded
- exponent/factorial/combinatorial explosion limits
- time budget + worker cancellation
- no file/network/DOM access
- no function definitions that escape reviewed math semantics

Expressions are mathematical data, never executable host code.

## Exact vs approximate law

Seven preserves distinctions:

`2/3` exact rational ≠ `0.6666667` approximate.

A symbolic root ≠ a floating approximation.

Every approximate result may include:
- precision/digits
- absolute/relative tolerance
- algorithm
- residual/error estimate where available

Never append decimals beyond engine-supported precision merely for visual polish.

## Equation verification

For proposed solution sets:
1. substitute into original equation/system where practical
2. simplify exact residual or compute numerical residual
3. validate variable domain/assumptions
4. detect denominator/domain exclusions introduced by algebraic transformations
5. retain unverified/conditional solutions explicitly

A solver's success flag is evidence, but Seven can add independent verification.

## Calculus verification

Differentiation:
- symbolic derivative can be checked by simplification against alternate form and optional numerical spot checks away from singularities.

Integration:
- differentiate an antiderivative candidate and compare to integrand under assumptions/domain.
- unresolved integral remains `UNRESOLVED` rather than text guessed by the model.

Definite numerical integration:
- record method/tolerance/error estimate where engine provides it.

## Linear algebra

Local common operations may use a minimal math.js subset.

Advanced/large numerical linear algebra escalates to NumPy/SciPy host path.

Record:
- matrix shape/type
- singular/ill-conditioned status when available
- decomposition/solver method
- tolerance
- residual norm for solved systems

Do not invert matrices just to solve systems when a direct solver is available.

## ScientificHost

Uses Wave 02 `ProjectRunner/CodeEvalSandbox` principles:
- fixed reviewed scientific operation adapters preferred over arbitrary scripts
- explicit input/output data
- no ambient credentials/files/network unless separately granted
- time/memory limits
- cancellation
- package/runtime version recorded

For genuinely open-ended scientific notebooks/code requested by the user, use a separate explicit code-execution capability, not hidden fallback from `math.solve`.

## Wave 15 integration

Plotting is not part of MathEngine.

Math results can emit typed tables/series/functions sampled under an explicit domain, then pass to:
`TableSpec → ChartSpec → VisualizationValidator → Renderer`

Sampling resolution/domain are retained in lineage.

## Android deployment

### Base/core
- Wave 05 exact arithmetic
- tiny SafeMathParser/contracts

### Lazy local specialist
- custom-bundled selected math.js functions
- optional symbolic engine if bundle Evals justify it

### Host/remote
- SymPy
- NumPy/SciPy
- high-complexity CAS/numerical jobs

### Experimental downloaded runtime
- Pyodide only after explicit capability/performance/storage justification

## Rejected approaches

- LLM arithmetic when deterministic engine exists: rejected
- JavaScript eval calculator: rejected
- full math.js bundle automatically at startup: rejected
- full Pyodide/scientific stack in base APK: rejected
- arbitrary Python as invisible fallback: rejected
- solver output accepted without domain/residual checks where practical: rejected
- numerical non-convergence represented as no solution: rejected
- approximate float promoted to exact symbolic value: rejected
- plotting logic duplicated inside MathEngine: rejected

## Canonical capabilities

- `math.parse`
- `math.simplify`
- `math.differentiate`
- `math.integrate`
- `math.solve`
- `math.evaluate`
- `math.matrix.compute`
- `math.numeric.root`
- `math.numeric.integrate`
- `math.numeric.optimize`
- `math.verify`
- `math.sample_function`

## Required Evals

Before Freeze:
- exact arithmetic never silently becomes binary-float approximate
- algebraic solutions verify against original equations
- domain/extraneous-root canaries are caught
- derivative/integral verification catches deliberately wrong result
- singular/ill-conditioned matrix cases produce correct status
- numerical non-convergence is explicit
- parser cannot access host JS/DOM/network
- pathological expression cannot freeze UI indefinitely
- local bundle/startup cost stays within measured budget
- host result is reproducible from engine/package/method metadata
- Arabic math surrounding text and LTR equations remain readable in UI

## Deep Polish queue

`MathResult/MathExpression → SafeMathParser → MathVerifier → minimal math.js bundle → local matrix/numeric primitives → Nerdamer benchmark → SymPy host adapter → NumPy/SciPy scientific adapters → numerical tolerance policy → Wave15 chart handoff → Pyodide only if evals justify`

## Coverage statement

Wave 16 closes the high-value general mathematical/scientific discovery gap while preserving Seven's Android-first design. Deep scientific breadth is available through sandboxed host specialists rather than bloating the mobile base.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.
