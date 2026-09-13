# Seven Polishing V4 — Self-Polish Round 02

Verdict: MATERIAL_IMPROVEMENT_FOUND
Saturation counter: 0/2

## Review lens
Round 02 treated V4 as an experiment-governance and decision-quality system. The question was not whether the checklist is comprehensive, but whether V4 can prevent biased or non-reproducible conclusions.

## Material improvements

### 1. Precommit evaluation contracts
Before comparing a major candidate against another, freeze the relevant scenario set, critical gates, metrics and acceptance rules. Candidate authors may add new tests after seeing results, but cannot silently remove or weaken the precommitted set.

### 2. Holdout scenario pool
For important systems, reserve hidden/shadow scenarios not used during candidate design. This reduces overfitting the architecture to the visible gauntlet.

### 3. Baseline identity lock
Every proof-of-improvement comparison binds to an exact baseline version, configuration, provider/model/tool versions, dataset/eval identity and device/environment where relevant. Moving baselines invalidate comparison claims.

### 4. Decision reproducibility
A freeze record must preserve enough inputs and decision rules for another review to reconstruct why Candidate X beat Y without relying on prose memory.

### 5. Sensitivity analysis
When a decision depends on thresholds, weights, budgets or uncertain assumptions, perturb them. A design that wins only at one fragile setting is not a robust winner.

### 6. Uncertainty ledger
Maintain unresolved uncertainty separately from known defects. Freeze may tolerate noncritical uncertainty only when bounded and paired with a reopen trigger or measurement plan.

### 7. Counterexample promotion
A single high-quality counterexample can outweigh many average successes when it violates a C0/C1 invariant. V4 explicitly promotes such counterexamples into the regression cemetery.

### 8. Change blast-radius map
Every accepted architectural change records which capabilities, schemas, persisted data, permissions, migrations, UI surfaces and resource budgets it can affect. This makes cross-system regression targeting sharper.

### 9. Reversibility preference
When two candidates are otherwise close, prefer the design with cheaper rollback/migration and lower irreversible commitment unless the less reversible design has demonstrated material benefit.

### 10. Evidence decay
Platform/provider/performance evidence can expire. Freeze records classify evidence as stable, version-bound or time-sensitive and specify revalidation triggers.

## Result
Round 02 found material governance improvements, so V4 remains unsaturated at 0/2. Integrate these before independent saturation reviews.