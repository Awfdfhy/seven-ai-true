# Seven Polishing V5.13 — Decision Boundaries

Status: ARCHITECTURE_CANDIDATE
Parent: V5.12 Decision Robustness

V5.13 prevents robust evaluation from degenerating into permanent indecision. It defines when disagreement is decision-relevant, when uncertainty merely narrows a claim, and when evidence is sufficient to act.

## Prime law
Uncertainty must calibrate the verdict, not automatically veto progress.

## Requirements
1. Decision relevance: every unresolved uncertainty states which verdicts or claim scopes it can actually affect.
2. Blocking threshold: only uncertainties capable of changing a critical decision block promotion; lower-impact uncertainty narrows claims or becomes explicit debt.
3. Accept/reject symmetry: Promotion Gate must test for both false promotion and false rejection risk.
4. Opportunity-cost ledger: prolonged evaluation has cost in delay, maintenance, complexity and missed product value; this cost is explicit but cannot override critical correctness/safety gates.
5. Value-of-information stop: additional evaluation continues only while expected decision value justifies cost or while a mandatory critical gate remains unresolved.
6. Evidence sufficiency contract: each verdict class has a predefined minimum evidence portfolio.
7. Claim-tier ladder: evidence can support local, subsystem, cross-system, deployment-like or release claims without forcing all-or-nothing judgment.
8. Uncertainty localization: unknowns remain attached to the precise assumption, scenario or dependency that creates them.
9. Reopen triggers: promoted decisions define concrete future evidence that would reopen review.
10. Reject-with-learning: rejected candidates preserve reusable evidence and causal findings rather than returning to zero.
11. Reversible promotion: where impact and platform permit, lower-risk improvements may progress through bounded reversible stages rather than waiting for maximal evidence.
12. Irreversibility premium: hard-to-rollback changes require stronger evidence than easily reversible changes.
13. Evidence deadline is not proof: time pressure cannot turn missing evidence into PASS.
14. Conservatism audit: periodically test whether gates reject known-good or simpler beneficial candidates at an excessive rate.
15. Ambiguity budget: persistent low-impact ambiguity cannot consume unlimited evaluation resources.
16. Escalation ladder: unresolved high-impact conflicts move to stronger oracle/evidence mechanisms rather than repeated equivalent review.
17. Pareto decision rule: a candidate with a critical regression loses even if aggregate score improves; noncritical tradeoffs remain explicit rather than hidden in one score.
18. Default-to-incumbent rule: if evidence is materially insufficient and the change is not required to fix a critical defect, retain the known-good incumbent.

## Saturation
V5.12 is NOT saturated. This material decision-policy change resets saturation to 0/2.

## Truth boundary
Architecture only. No runtime value-of-information scheduler or staged promotion system is claimed implemented.