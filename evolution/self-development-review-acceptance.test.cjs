"use strict";

const assert = require("assert/strict");
const crypto = require("crypto");
const { createHypothesis } = require("./self-development-hypotheses.cjs");
const { createPlanningCandidate } = require("./self-development-planner.cjs");
const { createReview } = require("./self-development-review.cjs");
const { decideAcceptance } = require("./self-development-acceptance.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stableObject(value[key]);
      return out;
    }, {});
  }
  return value;
}

function hashObject(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableObject(value))).digest("hex");
}

const BASE_SHA = "1".repeat(40);
const CANDIDATE_SHA = "2".repeat(40);
const BUILDER = "builder-agent";

function hypothesis(id, changeClass = "ranking", targetPaths = [`release/${id}.js`]) {
  const metric = changeClass === "routing" ? "routingTaskSuccess" : "qualityScore";
  return createHypothesis({
    id,
    diagnosisId: "diag-phase6",
    mechanism: `Bounded mechanism for ${id} with explicit comparative validation.`,
    changeClass,
    targetPaths,
    expectedEffects: { [metric]: "IMPROVE" },
    validationMetrics: [metric],
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
  comparisons = []
} = {}) {
  const core = {
    schemaVersion: 1,
    experimentId: "phase6-fixture",
    manifestDigest: "b".repeat(64),
    baselineIdentity: { sha: BASE_SHA, artifactDigest: null, artifactType: "git-tree" },
    candidateIdentity: { sha, artifactDigest: null, artifactType: "git-tree" },
    environmentDigest: "c".repeat(64),
    decision,
    reasons: [],
    hardGates: { ...gates },
    comparisons
  };
  return {
    ...core,
    evidenceDigest: hashObject(core)
  };
}

function proof(level, evalResult, overrides = {}) {
  return {
    level,
    sourceSha: evalResult.candidateIdentity.sha,
    evidenceDigest: evalResult.evidenceDigest,
    rollbackReady: true,
    knownUnknowns: [],
    ...overrides
  };
}

function review(evalResult, {
  id = "review-1",
  reviewerId = "independent-reviewer",
  verdict = "APPROVE",
  findings = [],
  sha = evalResult.candidateIdentity.sha,
  evidenceDigest = evalResult.evidenceDigest,
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

function manual(evalResult, approverId = "human-owner") {
  return {
    approved: true,
    approverId,
    candidateSha: evalResult.candidateIdentity.sha,
    evidenceDigest: evalResult.evidenceDigest
  };
}

pass("LOW candidate becomes shadow-eligible only with PASS evidence and required L2 proof", () => {
  const evalResult = evaluation();
  const result = decideAcceptance({
    planningCandidate: plan("low"),
    evaluationResult: evalResult,
    proofBundle: proof("L2", evalResult),
    builderId: BUILDER
  });
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(result.matchingReviewCount, 0);
});

pass("evaluation digest tampering is BLOCKED before any acceptance reasoning", () => {
  const evalResult = evaluation();
  const tampered = { ...evalResult, decision: "PASS", evidenceDigest: "d".repeat(64) };
  const result = decideAcceptance({
    planningCandidate: plan("eval-tamper"),
    evaluationResult: tampered,
    proofBundle: {
      level: "L8",
      sourceSha: CANDIDATE_SHA,
      evidenceDigest: tampered.evidenceDigest,
      rollbackReady: true
    },
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.deepEqual(result.reasons, ["evaluation_evidence_digest_invalid"]);
});

pass("evaluation failure cannot be rescued by review or proof", () => {
  const evalResult = evaluation({ decision: "FAIL" });
  const result = decideAcceptance({
    planningCandidate: plan("eval-fail"),
    evaluationResult: evalResult,
    proofBundle: proof("L8", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)]
  });
  assert.equal(result.decision, "REJECT");
  assert.ok(result.reasons.includes("evaluation_fail"));
});

pass("missing required proof level blocks promotion eligibility", () => {
  const evalResult = evaluation();
  const result = decideAcceptance({
    planningCandidate: plan("proof-low"),
    evaluationResult: evalResult,
    proofBundle: proof("L1", evalResult),
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("proof_level_below_required:L2"));
});

pass("rollback readiness is mandatory before shadow eligibility", () => {
  const evalResult = evaluation();
  const result = decideAcceptance({
    planningCandidate: plan("rollback"),
    evaluationResult: evalResult,
    proofBundle: proof("L2", evalResult, { rollbackReady: false }),
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("rollback_not_ready"));
});

pass("proof identity must bind exact evaluated candidate and evidence", () => {
  const evalResult = evaluation();
  const result = decideAcceptance({
    planningCandidate: plan("identity"),
    evaluationResult: evalResult,
    proofBundle: proof("L2", evalResult, { sourceSha: "3".repeat(40), evidenceDigest: "e".repeat(64) }),
    builderId: BUILDER
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("proof_source_sha_mismatch"));
  assert.ok(result.reasons.includes("proof_evidence_digest_mismatch"));
});

pass("acceptance rederives planning risk so caller cannot forge LOW proof requirements", () => {
  const highPlan = plan("forged-plan", "storage_schema", ["release/storage-migration.js"]);
  const forged = {
    ...highPlan,
    riskLevel: "LOW",
    disposition: "READY_FOR_CODING_PLAN",
    proofPlan: {
      requiredHardGates: [],
      requiredProofLevel: "L0",
      independentReview: false,
      manualApproval: false,
      shadowRequired: false
    }
  };
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      integration: true,
      recovery: true,
      regression: true,
      rollback: true,
      security: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: forged,
    evaluationResult: evalResult,
    proofBundle: proof("L5", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)],
    manualApproval: manual(evalResult)
  });
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");

  const withoutApproval = decideAcceptance({
    planningCandidate: forged,
    evaluationResult: evalResult,
    proofBundle: proof("L5", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)]
  });
  assert.equal(withoutApproval.decision, "BLOCKED");
  assert.ok(withoutApproval.reasons.includes("manual_approval_missing_or_invalid"));
});

pass("MEDIUM candidate cannot be self-reviewed by its builder", () => {
  const medium = plan("medium", "routing");
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      regression: true,
      rollback: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evalResult,
    proofBundle: proof("L3", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult, { reviewerId: BUILDER })]
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("independent_approval_missing"));
});

pass("forged independent flag cannot turn builder review into independent approval", () => {
  const medium = plan("forged-review", "routing");
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      regression: true,
      rollback: true
    }
  });
  const own = review(evalResult, { reviewerId: BUILDER });
  const forged = { ...own, independent: true };
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evalResult,
    proofBundle: proof("L3", evalResult),
    builderId: BUILDER,
    reviews: [forged]
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("independent_approval_missing"));
});

pass("MEDIUM candidate can become shadow-eligible after evidence-bound independent approval", () => {
  const medium = plan("medium-ok", "routing");
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      regression: true,
      rollback: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evalResult,
    proofBundle: proof("L3", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)]
  });
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(result.matchingReviewCount, 1);
});

pass("review binding prevents approval for a different SHA or evidence bundle", () => {
  const medium = plan("review-binding", "routing");
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      regression: true,
      rollback: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evalResult,
    proofBundle: proof("L3", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult, { sha: "4".repeat(40), evidenceDigest: "f".repeat(64) })]
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("independent_approval_missing"));
  assert.equal(result.matchingReviewCount, 0);
});

pass("negative or incomplete independent review blocks otherwise passing evidence", () => {
  const medium = plan("review-negative", "routing");
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      regression: true,
      rollback: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evalResult,
    proofBundle: proof("L3", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult, {
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

pass("malformed review record is not silently trusted", () => {
  const medium = plan("bad-review", "routing");
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      regression: true,
      rollback: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: medium,
    evaluationResult: evalResult,
    proofBundle: proof("L3", evalResult),
    builderId: BUILDER,
    reviews: [{
      schemaVersion: 1,
      reviewerId: "independent-reviewer",
      builderId: BUILDER,
      candidateSha: CANDIDATE_SHA,
      evidenceDigest: evalResult.evidenceDigest,
      verdict: "APPROVE",
      independent: true
    }]
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("invalid_review_record"));
  assert.ok(result.reasons.includes("independent_approval_missing"));
});

pass("HIGH candidate requires L5 proof, independent review and separate manual approval", () => {
  const high = plan("high", "storage_schema", ["release/storage-migration.js"]);
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      integration: true,
      recovery: true,
      regression: true,
      rollback: true,
      security: true
    }
  });

  const missingApproval = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evalResult,
    proofBundle: proof("L5", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)]
  });
  assert.equal(missingApproval.decision, "BLOCKED");
  assert.ok(missingApproval.reasons.includes("manual_approval_missing_or_invalid"));

  const approved = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evalResult,
    proofBundle: proof("L5", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)],
    manualApproval: manual(evalResult)
  });
  assert.equal(approved.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(approved.manualApproval.approverId, "human-owner");
});

pass("builder cannot satisfy HIGH manual approval itself", () => {
  const high = plan("high-self-approve", "storage_schema", ["release/storage-migration.js"]);
  const evalResult = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      integration: true,
      recovery: true,
      regression: true,
      rollback: true,
      security: true
    }
  });
  const result = decideAcceptance({
    planningCandidate: high,
    evaluationResult: evalResult,
    proofBundle: proof("L5", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)],
    manualApproval: manual(evalResult, BUILDER)
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("manual_approval_missing_or_invalid"));
});

pass("required hard gate missing or false cannot be papered over by critic optimism", () => {
  const high = plan("gate-missing", "storage_schema", ["release/storage-migration.js"]);
  const missingEval = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      integration: true,
      recovery: true,
      regression: true,
      rollback: true
    }
  });
  const missing = decideAcceptance({
    planningCandidate: high,
    evaluationResult: missingEval,
    proofBundle: proof("L5", missingEval),
    builderId: BUILDER,
    reviews: [review(missingEval)],
    manualApproval: manual(missingEval)
  });
  assert.equal(missing.decision, "BLOCKED");
  assert.ok(missing.reasons.includes("required_gate_missing:security"));

  const failedEval = evaluation({
    gates: {
      contracts: true,
      "domain-benchmark": true,
      integration: true,
      recovery: true,
      regression: true,
      rollback: true,
      security: false
    }
  });
  const failed = decideAcceptance({
    planningCandidate: high,
    evaluationResult: failedEval,
    proofBundle: proof("L5", failedEval),
    builderId: BUILDER,
    reviews: [review(failedEval)],
    manualApproval: manual(failedEval)
  });
  assert.equal(failed.decision, "REJECT");
  assert.ok(failed.reasons.includes("required_gate_failed:security"));
});

pass("CRITICAL change remains governance-blocked even with L8 proof and approvals", () => {
  const critical = plan("critical", "self_development", ["evolution/gates.cjs"]);
  const evalResult = evaluation();
  const result = decideAcceptance({
    planningCandidate: critical,
    evaluationResult: evalResult,
    proofBundle: proof("L8", evalResult),
    builderId: BUILDER,
    reviews: [review(evalResult)],
    manualApproval: manual(evalResult)
  });
  assert.equal(result.decision, "BLOCKED_GOVERNANCE");
  assert.ok(result.reasons.includes("critical_change_requires_separate_governance"));
});

pass("review records reject secret-like reviewer identifiers and evidence refs", () => {
  const evalResult = evaluation();
  assert.throws(() => review(evalResult, { reviewerId: "ghp_abcdefghijklmnopqrstuvwxyz123456" }), /secret-like reviewerId/);
  assert.throws(() => review(evalResult, {
    findings: [{
      code: "SEC",
      severity: "HIGH",
      summary: "Finding",
      evidenceRef: "sk-abcdefghijklmnopqrstuv"
    }]
  }), /secret-like finding evidenceRef/);
});

console.log("self-development review and acceptance test suite: PASS");
