"use strict";

const assert = require("assert/strict");
const { createHypothesis } = require("./self-development-hypotheses.cjs");
const { createPlanningCandidate } = require("./self-development-planner.cjs");
const { createReview } = require("./self-development-review.cjs");
const { decideAcceptance } = require("./self-development-acceptance.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const CANDIDATE_SHA = "2".repeat(40);
const EVIDENCE_DIGEST = "a".repeat(64);
const BUILDER = "builder-agent";

function hypothesis(id, changeClass = "ranking", targetPaths = [`release/${id}.js`]) {
  const mediumMetric = changeClass === "routing" ? "routingTaskSuccess" : "qualityScore";
  return createHypothesis({
    id,
    diagnosisId: "diag-phase6",
    mechanism: `Bounded mechanism for ${id} with explicit comparative validation.`,
    changeClass,
    targetPaths,
    expectedEffects: { [mediumMetric]: "IMPROVE" },
    validationMetrics: [mediumMetric],
    evidenceRefs: ["research:phase6"]
  });
}

function assessment() {
  return {
    expectedGain: 0.6,
    confidence: 0.8,
    implementationCost: 0.3,
    evaluationCost: 0.3,
    blastRadius: 0.2,
    reversibility: 0.9,
    userImpact: 0.7,
    urgency: 0.6,
    problemSeverity: 0.7,
    hardFailureFix: false
  };
}

function plan(id, changeClass = "ranking", targetPaths) {
  return createPlanningCandidate({
    hypothesis: hypothesis(id, changeClass, targetPaths || [`release/${id}.js`]),
    assessment: assessment()
  });
}

function evaluation({
  decision = "PASS",
  gates = { contracts: true, regression: true, rollback: true },
  sha = CANDIDATE_SHA,
  evidenceDigest = EVIDENCE_DIGEST
} = {}) {
  return {
    schemaVersion: 1,
    candidateIdentity: { sha },
    decision,
    evidenceDigest,
    hardGates: { ...gates }
  };
}

function proof(level, overrides = {}) {
  return {
    level,
    sourceSha: CANDIDATE_SHA,
    evidenceDigest: EVIDENCE_DIGEST,
    rollbackReady: true,
    knownUnknowns: [],
    ...overrides
  };
}

function review({
  id = "review-1",
  reviewerId = "independent-reviewer",
  verdict = "APPROVE",
  findings = [],
  sha = CANDIDATE_SHA,
  evidenceDigest = EVIDENCE_DIGEST,
  builderId = BUILDER,
  architectureChecked = true,
  testsChecked = true,
  resultsChecked = true
} = {}) {
  return createReview({
    reviewId: id,
    reviewerId,
    builderId,
    candidateSha: sha,
    evidenceDigest,
    verdict,
    findings,
    architectureChecked,
    testsChecked,
    resultsChecked
  });
}

pass("LOW candidate becomes shadow-eligible only with PASS evidence and required L2 proof", () => {
  const result = decideAcceptance({
    planningCandidate: plan("low"),
    evaluationResult: evaluation(),
    proofBundle: proof("L2"),
    builderId: BUILDER
  });
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(result.matchingReviewCount, 0);
});

pass("evaluation failure cannot be rescued by review or proof", () => {
  const result = decideAcceptance({
    planningCandidate: plan("eval-fail"),
    evaluationResult: evaluation({ decision: "FAIL" }),
    proofBundle: proof("L8"),
    builderId: BUILDER,
    reviews: [review()]
  });
  assert.equal(result.decision, "REJECT");
  assert.ok(result.reasons.includes("evaluation_fail"));
});

pass("missing required proof level blocks promotion eligibility", () => {
  const result = decideAcceptance({
    planningCandidate: plan("proof-low"),
    evaluationResult: evaluation(),
    proofBundle: proof("L1"),
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("proof_level_below_required:L2"));
});

pass("rollback readiness is mandatory before shadow eligibility", () => {
  const result = decideAcceptance({
    planningCandidate: plan("rollback"),
    evaluationResult: evaluation(),
    proofBundle: proof("L2", { rollbackReady: false }),
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("rollback_not_ready"));
});

pass("proof identity must bind the exact evaluated candidate and evidence", () => {
  const result = decideAcceptance({
    planningCandidate: plan("identity"),
    evaluationResult: evaluation(),
    proofBundle: proof("L2", { sourceSha: "3".repeat(40), evidenceDigest: "b".repeat(64) }),
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("proof_source_sha_mismatch"));
  assert.ok(result.reasons.includes("proof_evidence_digest_mismatch"));
});

pass("MEDIUM candidate cannot be self-reviewed by its builder", () => {
  const medium = plan("medium", "routing");
  const gates = {
    contracts: true,
    "domain-benchmark": true,
    regression: true,
    rollback: true
  };
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L3"),
    builderId: BUILDER,
    reviews: [review({ reviewerId: BUILDER })]
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("independent_approval_missing"));
});

pass("MEDIUM candidate can become shadow-eligible after evidence-bound independent approval", () => {
  const medium = plan("medium-ok", "routing");
  const gates = {
    contracts: true,
    "domain-benchmark": true,
    regression: true,
    rollback: true
  };
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L3"),
    builderId: BUILDER,
    reviews: [review()]
  });
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(result.matchingReviewCount, 1);
});

pass("review binding prevents approval for a different SHA or evidence bundle", () => {
  const medium = plan("review-binding", "routing");
  const gates = {
    contracts: true,
    "domain-benchmark": true,
    regression: true,
    rollback: true
  };
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L3"),
    builderId: BUILDER,
    reviews: [review({ sha: "4".repeat(40), evidenceDigest: "c".repeat(64) })]
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("independent_approval_missing"));
  assert.equal(result.matchingReviewCount, 0);
});

pass("negative or incomplete independent review blocks an otherwise passing candidate", () => {
  const medium = plan("review-negative", "routing");
  const gates = {
    contracts: true,
    "domain-benchmark": true,
    regression: true,
    rollback: true
  };
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L3"),
    builderId: BUILDER,
    reviews: [review({
      verdict: "CHANGES_REQUIRED",
      findings: [{
        code: "ARCH-001",
        severity: "HIGH",
        summary: "Candidate changes a shared boundary without enough compatibility evidence.",
        evidenceRef: "review:e1"
      }]
    })]
  });
  assert.equal(result.decision, "REJECT");
  assert.ok(result.reasons.includes("review_requires_changes"));
});

pass("HIGH candidate requires L5 proof, independent review and separate manual approval", () => {
  const high = plan("high", "storage_schema", ["release/storage-migration.js"]);
  const gates = {
    contracts: true,
    "domain-benchmark": true,
    integration: true,
    recovery: true,
    regression: true,
    rollback: true,
    security: true
  };

  const missingApproval = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L5"),
    builderId: BUILDER,
    reviews: [review()]
  });
  assert.equal(missingApproval.decision, "BLOCKED");
  assert.ok(missingApproval.reasons.includes("manual_approval_missing_or_invalid"));

  const approved = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L5"),
    builderId: BUILDER,
    reviews: [review()],
    manualApproval: {
      approved: true,
      approverId: "human-owner",
      candidateSha: CANDIDATE_SHA,
      evidenceDigest: EVIDENCE_DIGEST
    }
  });
  assert.equal(approved.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(approved.manualApproval.approverId, "human-owner");
});

pass("builder cannot satisfy HIGH manual approval itself", () => {
  const high = plan("high-self-approve", "storage_schema", ["release/storage-migration.js"]);
  const gates = {
    contracts: true,
    "domain-benchmark": true,
    integration: true,
    recovery: true,
    regression: true,
    rollback: true,
    security: true
  };
  const result = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evaluation({ gates }),
    proofBundle: proof("L5"),
    builderId: BUILDER,
    reviews: [review()],
    manualApproval: {
      approved: true,
      approverId: BUILDER,
      candidateSha: CANDIDATE_SHA,
      evidenceDigest: EVIDENCE_DIGEST
    }
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("manual_approval_missing_or_invalid"));
});

pass("required hard gate missing or false cannot be papered over by critic optimism", () => {
  const high = plan("gate-missing", "storage_schema", ["release/storage-migration.js"]);
  const missing = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evaluation({
      gates: {
        contracts: true,
        "domain-benchmark": true,
        integration: true,
        recovery: true,
        regression: true,
        rollback: true
      }
    }),
    proofBundle: proof("L5"),
    builderId: BUILDER,
    reviews: [review()],
    manualApproval: {
      approved: true,
      approverId: "human-owner",
      candidateSha: CANDIDATE_SHA,
      evidenceDigest: EVIDENCE_DIGEST
    }
  });
  assert.equal(missing.decision, "BLOCKED");
  assert.ok(missing.reasons.includes("required_gate_missing:security"));

  const failed = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evaluation({
      gates: {
        contracts: true,
        "domain-benchmark": true,
        integration: true,
        recovery: true,
        regression: true,
        rollback: true,
        security: false
      }
    }),
    proofBundle: proof("L5"),
    builderId: BUILDER,
    reviews: [review()],
    manualApproval: {
      approved: true,
      approverId: "human-owner",
      candidateSha: CANDIDATE_SHA,
      evidenceDigest: EVIDENCE_DIGEST
    }
  });
  assert.equal(failed.decision, "REJECT");
  assert.ok(failed.reasons.includes("required_gate_failed:security"));
});

pass("CRITICAL change remains governance-blocked even with L8 proof and approvals", () => {
  const critical = plan("critical", "self_development", ["evolution/gates.cjs"]);
  const result = decideAcceptance({
    planningCandidate: critical,
    evaluationResult: evaluation(),
    proofBundle: proof("L8"),
    builderId: BUILDER,
    reviews: [review()],
    manualApproval: {
      approved: true,
      approverId: "human-owner",
      candidateSha: CANDIDATE_SHA,
      evidenceDigest: EVIDENCE_DIGEST
    }
  });
  assert.equal(result.decision, "BLOCKED_GOVERNANCE");
  assert.ok(result.reasons.includes("critical_change_requires_separate_governance"));
});

pass("review records reject secret-like reviewer identifiers and evidence refs", () => {
  assert.throws(() => review({ reviewerId: "ghp_abcdefghijklmnopqrstuvwxyz123456" }), /secret-like reviewerId/);
  assert.throws(() => review({
    findings: [{
      code: "SEC",
      severity: "HIGH",
      summary: "Finding",
      evidenceRef: "sk-abcdefghijklmnopqrstuv"
    }]
  }), /secret-like finding evidenceRef/);
});

console.log("self-development review and acceptance test suite: PASS");
