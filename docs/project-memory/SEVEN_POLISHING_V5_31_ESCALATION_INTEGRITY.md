# Seven Polishing V5.31 — Escalation Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.30 Intervention Backfire Integrity

V5.31 evaluates whether Seven knows when to continue autonomously, when to ask for missing information, and when to escalate without turning human review into an unlimited hidden resource.

## Prime law
Neither acting on missing information nor escalating everything is acceptable evidence of good judgment.

## Requirements
1. Action/Ask/Escalate Triage: evaluation distinguishes cases that should proceed, request information, or require higher-authority review.
2. Missing-Information Cases: tasks include realistic absent details that materially affect the correct next action.
3. Ambiguity Cases: evaluate whether Seven detects when multiple reasonable interpretations require clarification.
4. Contradiction Cases: conflicting authoritative inputs must trigger reconciliation rather than confident guessing.
5. False-Escalation Rate: unnecessary escalation is measured separately from unsafe or under-informed action.
6. Missed-Escalation Rate: failure to request help when required is measured separately from ordinary task failure.
7. Escalation Burden: time, interruption, review effort, and queue pressure are explicit costs.
8. Human-Capacity Constraint: evaluation does not assume infinite or immediate human availability.
9. Escalation Threshold Calibration: thresholds are tested across nearby risk/uncertainty conditions to avoid brittle routing.
10. Minimal-Pair Evaluation: near-identical scenarios with one material difference are used where practical to test judgment rather than keyword matching.
11. Context Preservation: an escalation carries the evidence, current state, constraints, open questions, and next decision needed by the reviewer.
12. Authority Preservation: escalation cannot silently grant Seven or the reviewer authority that was not present in the source state.
13. Return-from-Escalation: after human input, Seven verifies what changed and resumes from the authoritative updated state.
14. Selective Autonomy Curve: report task quality and human-review burden together rather than optimizing either alone.
15. Domain Sensitivity: escalation policy is calibrated separately for coding, research, files, external actions, and other materially different domains.
16. Overreliance Guard: repeated use of escalation cannot be counted as autonomous capability improvement.
17. Underreliance Guard: avoiding escalation cannot be rewarded when the task contract requires clarification or review.
18. Regression Memory: prior missed or unnecessary escalations remain represented in future evaluation.

## Saturation
V5.30 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No escalation router, human-review queue, or selective-autonomy benchmark runtime is claimed implemented.