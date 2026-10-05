"use strict";

const assert = require("assert/strict");
const { createHypothesis } = require("./self-development-hypotheses.cjs");
const {
  createPlanningCandidate,
  prioritizeCandidates,
  dominates
} = require("./self-development-planner.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

function hypothesis(id, overrides = {}) {
  return createHypothesis({
    id,
    diagnosisId: overrides.diagnosisId || "diag-phase4",
    mechanism: overrides.mechanism || `Bounded mechanism ${id} with explicit measurable effects.`,
    changeClass: overrides.changeClass || "ranking",
    targetPaths: overrides.targetPaths || [`release/${id}.js`],
    expectedEffects: overrides.expectedEffects || { qualityScore: "IMPROVE" },
    validationMetrics: overrides.validationMetrics || ["qualityScore"],
    assumptions: overrides.assumptions || ["baseline and candidate environment remain comparable"],
    rollbackPlan: overrides.rollbackPlan || "restore exact baseline SHA",
    evidenceRefs: overrides.evidenceRefs || ["research:phase4"]
  });
}

function assessment(overrides = {}) {
  return {
    expectedGain: 0.6,
    confidence: 0.7,
    implementationCost: 0.3,
    evaluationCost: 0.3,
    blastRadius: 0.2,
    reversibility: 0.9,
    userImpact: 0.6,
    urgency: 0.5,
    problemSeverity: 0.6,
    hardFailureFix: false,
    ...overrides
  };
}

pass("LOW planning derives fixed proof and bounded coding scope", () => {
  const plan = createPlanningCandidate({
    hypothesis: hypothesis("low"),
    assessment: assessment()
  });
  assert.equal(plan.riskLevel, "LOW");
  assert.equal(plan.disposition, "READY_FOR_CODING_PLAN");
  assert.equal(plan.ordinaryCodingAllowed, true);
  assert.equal(plan.proofPlan.requiredProofLevel, "L2");
  assert.deepEqual(plan.proofPlan.requiredHardGates, ["contracts", "regression", "rollback"]);
  assert.equal(plan.proofPlan.automaticPromotionAllowed, false);
  assert.equal(plan.scopeManifest.maxFiles, 3);
  assert.equal(plan.scopeManifest.maxRepairAttempts, 2);
  assert.ok(/^[0-9a-f]{64}$/.test(plan.scopeManifest.scopeDigest));
});

pass("MEDIUM planning requires independent review and stronger proof", () => {
  const plan = createPlanningCandidate({
    hypothesis: hypothesis("medium", { changeClass: "routing" }),
    assessment: assessment()
  });
  assert.equal(plan.riskLevel, "MEDIUM");
  assert.equal(plan.disposition, "INDEPENDENT_REVIEW_REQUIRED");
  assert.equal(plan.proofPlan.independentReview, true);
  assert.equal(plan.proofPlan.manualApproval, false);
  assert.equal(plan.proofPlan.requiredProofLevel, "L3");
  assert.ok(plan.proofPlan.requiredHardGates.includes("critic"));
  assert.ok(plan.proofPlan.requiredHardGates.includes("domain-benchmark"));
});

pass("HIGH planning requires manual approval, recovery and security gates", () => {
  const plan = createPlanningCandidate({
    hypothesis: hypothesis("high", {
      changeClass: "storage_schema",
      targetPaths: ["release/storage-migration.js"]
    }),
    assessment: assessment({ problemSeverity: 0.9 })
  });
  assert.equal(plan.riskLevel, "HIGH");
  assert.equal(plan.disposition, "MANUAL_APPROVAL_REQUIRED");
  assert.equal(plan.proofPlan.manualApproval, true);
  assert.equal(plan.proofPlan.independentReview, true);
  assert.equal(plan.proofPlan.requiredProofLevel, "L5");
  assert.ok(plan.proofPlan.requiredHardGates.includes("recovery"));
  assert.ok(plan.proofPlan.requiredHardGates.includes("security"));
  assert.ok(plan.proofPlan.requiredHardGates.includes("manual-approval"));
});

pass("CRITICAL evaluator/self-development work never enters ordinary Coding planning", () => {
  const plan = createPlanningCandidate({
    hypothesis: hypothesis("critical", {
      changeClass: "self_development",
      targetPaths: ["evolution/gates.cjs"],
      expectedEffects: { reliabilityScore: "IMPROVE" },
      validationMetrics: ["reliabilityScore"]
    }),
    assessment: assessment({ expectedGain: 1, confidence: 1, problemSeverity: 1, hardFailureFix: true })
  });
  assert.equal(plan.riskLevel, "CRITICAL");
  assert.equal(plan.disposition, "GOVERNANCE_REQUIRED");
  assert.equal(plan.ordinaryCodingAllowed, false);
  assert.equal(plan.scopeManifest.maxFiles, 0);
  assert.equal(plan.scopeManifest.maxRepairAttempts, 0);
  assert.equal(plan.proofPlan.requiredProofLevel, "L7");
  assert.ok(plan.proofPlan.requiredHardGates.includes("mutation"));
  assert.ok(plan.proofPlan.requiredHardGates.includes("manual-governance"));
});

pass("scope budget blocks oversized LOW candidate instead of silently widening authority", () => {
  const plan = createPlanningCandidate({
    hypothesis: hypothesis("wide-low", {
      targetPaths: [
        "release/a.js",
        "release/b.js",
        "release/c.js",
        "release/d.js"
      ]
    }),
    assessment: assessment()
  });
  assert.equal(plan.riskLevel, "LOW");
  assert.equal(plan.disposition, "BLOCKED_SCOPE_BUDGET");
  assert.equal(plan.ordinaryCodingAllowed, false);
});

pass("Pareto frontier preserves real tradeoffs instead of collapsing to one scalar", () => {
  const quality = hypothesis("quality");
  const cheap = hypothesis("cheap");
  const result = prioritizeCandidates({
    hypotheses: [quality, cheap],
    assessments: {
      quality: assessment({
        expectedGain: 0.95,
        confidence: 0.8,
        implementationCost: 0.7,
        evaluationCost: 0.6,
        blastRadius: 0.4,
        userImpact: 0.95
      }),
      cheap: assessment({
        expectedGain: 0.45,
        confidence: 0.9,
        implementationCost: 0.05,
        evaluationCost: 0.1,
        blastRadius: 0.05,
        userImpact: 0.5
      })
    }
  });
  assert.deepEqual(new Set(result.frontier.map((item) => item.id)), new Set(["quality", "cheap"]));
  assert.equal(result.dominated.length, 0);
  assert.ok(result.chosen);
  assert.match(result.estimateNotice, /evaluator evidence decides acceptance/);
});

pass("strictly dominated candidate is removed from the Pareto frontier", () => {
  const strong = createPlanningCandidate({
    hypothesis: hypothesis("strong"),
    assessment: assessment({
      expectedGain: 0.8,
      confidence: 0.9,
      implementationCost: 0.2,
      evaluationCost: 0.2,
      blastRadius: 0.1,
      reversibility: 0.95,
      userImpact: 0.8,
      urgency: 0.8,
      problemSeverity: 0.8
    })
  });
  const weak = createPlanningCandidate({
    hypothesis: hypothesis("weak"),
    assessment: assessment({
      expectedGain: 0.4,
      confidence: 0.6,
      implementationCost: 0.4,
      evaluationCost: 0.5,
      blastRadius: 0.3,
      reversibility: 0.7,
      userImpact: 0.5,
      urgency: 0.4,
      problemSeverity: 0.5
    })
  });
  assert.equal(dominates(strong, weak), true);

  const result = prioritizeCandidates({
    hypotheses: [strong.hypothesis, weak.hypothesis],
    assessments: {
      strong: strong.assessment,
      weak: weak.assessment
    }
  });
  assert.deepEqual(result.frontier.map((item) => item.id), ["strong"]);
  assert.deepEqual(result.dominated.map((item) => item.id), ["weak"]);
});

pass("hard-failure repair outranks cheap cosmetic gain when both are on the frontier", () => {
  const hard = hypothesis("hard-fix");
  const cosmetic = hypothesis("cosmetic");
  const result = prioritizeCandidates({
    hypotheses: [hard, cosmetic],
    assessments: {
      "hard-fix": assessment({
        expectedGain: 0.35,
        confidence: 0.8,
        implementationCost: 0.45,
        evaluationCost: 0.45,
        blastRadius: 0.2,
        problemSeverity: 1,
        urgency: 1,
        userImpact: 0.95,
        hardFailureFix: true
      }),
      cosmetic: assessment({
        expectedGain: 0.55,
        confidence: 0.95,
        implementationCost: 0.05,
        evaluationCost: 0.05,
        blastRadius: 0.05,
        problemSeverity: 0.3,
        urgency: 0.2,
        userImpact: 0.4,
        hardFailureFix: false
      })
    }
  });
  assert.equal(result.chosen.id, "hard-fix");
});

pass("governance and scope-blocked candidates cannot win via estimated utility", () => {
  const critical = hypothesis("critical-win", {
    changeClass: "evaluator",
    targetPaths: ["evolution/evals.cjs"],
    expectedEffects: { reliabilityScore: "IMPROVE" },
    validationMetrics: ["reliabilityScore"]
  });
  const wide = hypothesis("wide", {
    targetPaths: ["release/a.js", "release/b.js", "release/c.js", "release/d.js"]
  });
  const normal = hypothesis("normal");

  const result = prioritizeCandidates({
    hypotheses: [critical, wide, normal],
    assessments: {
      "critical-win": assessment({ expectedGain: 1, confidence: 1, userImpact: 1, problemSeverity: 1, hardFailureFix: true }),
      wide: assessment({ expectedGain: 0.99, confidence: 1, userImpact: 1 }),
      normal: assessment({ expectedGain: 0.4, confidence: 0.7 })
    }
  });

  assert.deepEqual(result.governance.map((item) => item.id), ["critical-win"]);
  assert.deepEqual(result.blocked.map((item) => item.id), ["wide"]);
  assert.equal(result.chosen.id, "normal");
});

pass("planner assessment is fail-closed on missing or out-of-range inputs", () => {
  assert.throws(() => createPlanningCandidate({
    hypothesis: hypothesis("missing-assessment"),
    assessment: { expectedGain: 0.5 }
  }), /planner assessment missing/);

  assert.throws(() => createPlanningCandidate({
    hypothesis: hypothesis("bad-assessment"),
    assessment: assessment({ blastRadius: 1.1 })
  }), /blastRadius must be between 0 and 1/);

  assert.throws(() => createPlanningCandidate({
    hypothesis: hypothesis("bad-hard"),
    assessment: { ...assessment(), hardFailureFix: "yes" }
  }), /hardFailureFix must be boolean/);
});

pass("proof and validation requirements come from risk + hypothesis, not caller downgrade", () => {
  const medium = hypothesis("proof-lock", {
    changeClass: "memory",
    expectedEffects: { memoryRecall: "IMPROVE", memoryPrecision: "PRESERVE" },
    validationMetrics: ["memoryRecall", "memoryPrecision"]
  });
  const plan = createPlanningCandidate({
    hypothesis: {
      ...medium,
      proofPlan: { requiredProofLevel: "L0", requiredHardGates: [] }
    },
    assessment: assessment()
  });
  assert.equal(plan.proofPlan.requiredProofLevel, "L3");
  assert.ok(plan.proofPlan.requiredHardGates.length > 0);
  assert.deepEqual(plan.proofPlan.validationMetrics, ["memoryPrecision", "memoryRecall"]);
});

pass("prioritization is deterministic for the same inputs", () => {
  const hypotheses = [hypothesis("b"), hypothesis("a")];
  const assessments = {
    a: assessment(),
    b: assessment()
  };
  const first = prioritizeCandidates({ hypotheses, assessments });
  const second = prioritizeCandidates({ hypotheses, assessments });
  assert.deepEqual(
    first.frontier.map((item) => [item.id, item.estimatedUtility, item.disposition]),
    second.frontier.map((item) => [item.id, item.estimatedUtility, item.disposition])
  );
  assert.equal(first.chosen.id, second.chosen.id);
});

console.log("self-development planner test suite: PASS");
