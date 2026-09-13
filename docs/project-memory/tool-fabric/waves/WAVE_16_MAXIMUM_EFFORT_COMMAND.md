# Seven Tool Fabric 2.0 — Wave 16 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: symbolic mathematics, numerical/scientific compute, matrices, equations, calculus and constrained scientific runtimes.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 16

Goal: route mathematical/scientific tasks to deterministic engines with explicit precision, assumptions and verification rather than relying on model arithmetic. Preserve Wave 05 ExactMath for simple exact arithmetic and add only capabilities it cannot cover.

Research current maintained browser/JS/Wasm/host candidates and scientific-runtime options. Optimize for a tiny base app, lazy specialist loading and reproducible results.

Research at minimum:
- symbolic expression representation/parsing
- simplification and exact algebra
- equation/system solving
- differentiation/integration
- arbitrary precision and rational arithmetic interoperability
- matrices/linear algebra
- numerical root solving/integration/optimization
- complex numbers
- units interaction
- plotting handoff to Wave 15 rather than separate chart logic
- Python/SymPy/NumPy/SciPy host or optional runtime fallback
- Pyodide feasibility and weight
- safety of expression parsing
- computation limits/timeouts/cancellation
- precision/error/conditioning metadata
- result verification/substitution/residual checks

Rules:
- never evaluate user/model math by JavaScript eval.
- symbolic and numerical results must state engine/method/precision when material.
- exact and approximate results are distinct types.
- equation solutions should be verified by substitution/residual where practical.
- numerical failure/non-convergence is not a result of zero/none.
- arbitrary scientific Python code is not a default mobile tool; use sandbox boundaries from Wave 02.
- giant scientific runtimes stay optional/host/lazy.
- renderer/plotting belongs to Wave 15 ChartSpec.

Output:
1. MathEngine architecture
2. symbolic/numeric candidate registry
3. typed mathematical result contracts
4. verification/precision rules
5. safe expression boundary
6. local vs host deployment strategy
7. rejected approaches
8. Deep Polish queue and eval gates

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
