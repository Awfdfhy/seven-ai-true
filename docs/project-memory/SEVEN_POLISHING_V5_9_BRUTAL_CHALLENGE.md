# V5.8 → V5.9 Brutal Challenge

Verdict: MATERIAL_IMPROVEMENT_FOUND
Saturation: 0/2

The attack attempted to make Minimal Sufficient Proof fail by exploiting its own proof-selection machinery.

Material gaps found:
1. The ProofGraph selector could become a single epistemic point of failure.
2. Dominance pruning could delete a rare but uniquely useful evaluator.
3. Evidence compression could erase failure-family diversity.
4. Incremental revalidation could repeatedly miss an unmodeled dependency.
5. Stop rules could terminate because the selector stopped looking in the right places.
6. The selector lacked an independent broad-reference comparison path.
7. No permanent miss ledger forced learning from selector-specific escapes.
8. Omission needed positive redundancy evidence rather than silence.
9. Saturation needed a holdout not tuned through the iterative loop.
10. Evaluation awareness could expose task or grading structure to the candidate.
11. Successful outcomes still needed explicit review for scoring/task-intent divergence.
12. Incumbent/candidate elicitation parity needed stronger binding.
13. Compute/attempt/tool effort needed explicit accounting in comparative claims.
14. Aggregate stability could hide fragile task families.
15. Evaluator calibration needed per-family evidence where practical.
16. Reused proof needed stronger compatibility checks across constitution epochs.
17. Proof minimization needed a circuit breaker after repeated misses.
18. Simplifier deletions needed independent challenge against unique protected failure classes.

Result: V5.8 is NOT SATURATED. V5.9 integrates these protections. Architecture evidence only.