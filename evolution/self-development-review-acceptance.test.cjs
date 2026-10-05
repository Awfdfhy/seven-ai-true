"use strict";

const assert = require("assert/strict");
const { createEvalLock } = require("./eval-lock.cjs");
const { createHypothesis } = require("./self-development-hypotheses.cjs");
const { createResearchEvidence } = require("./self-development-research.cjs");
const {
  derivePlanningCandidate,
  authorizePlanningCandidate
} = require("./self-development-planner.cjs");
const {
  createEvaluationManifest,
  evaluatePaired
} = require("./self-development-paired-eval.cjs");
const { createReview } = require("./self-development-review.cjs");
const { decideAcceptance } = require("./self-development-acceptance.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
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
    evidenceRefs: ["obs:phase6"]
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

function researchEvidence(count) {
  return Array.from({ length: count }, (_, index) => createResearchEvidence({
    id: `phase6-r${index + 1}`,
    claimKey: "root_cause",
    stance: "SUPPORT",
    sourceUrl: `https://source-${index + 1}.example.com/phase6`,
    sourceType: "PAPER",
    publishedAt: "2026-09-20T00:00:00Z",
    retrievedAt: "2026-10-05T00:00:00Z",
    confidence: 0.9
  }));
}

function validationFor(h, changeClass) {
  const riskResearchCount = ["storage_schema", "shared_contract", "auth", "permissions"].includes(changeClass)
    ? 2
    : ["self_development", "evaluator", "protected_policy"].includes(changeClass)
      ? 3
      : 0;
  return {
    diagnosis: {
      id: "diag-phase6",
      confidence: 0.9,
      observationIds: ["obs:phase6"]
    },
    candidates: [h],
    researchContext: {},
    researchEvidence: researchEvidence(riskResearchCount),
    requiredClaimKeys: riskResearchCount ? ["root_cause"] : [],
    researchAsOf: riskResearchCount ? "2026-10-05T00:00:00Z" : undefined,
    priorAttempts: []
  };
}

function planned(id, changeClass = "ranking", targetPaths) {
  const h = hypothesis(id, changeClass, targetPaths || [`release/${id}.js`]);
  const validation = validationFor(h, changeClass);
  const authorization = authorizePlanningCandidate({
    hypothesisValidation: validation,
    hypothesisId: h.id,
    assessment: assessment()
  });
  assert.equal(authorization.decision, "AUTHORIZED");
  return { candidate: authorization.candidate, validation };
}

function evaluatorGatesFor(plan) {
  return plan.proofPlan.requiredHardGates.filter((gate) => !["critic", "manual-approval"].includes(gate));
}

function evaluationFor(plan, {
  hardGateOverrides = {},
  requiredHardGates,
  baselineValue = 0.60,
  candidateValue = 0.80,
  candidateSha = CANDIDATE_SHA
} = {}) {
  const metricId = plan.proofPlan.validationMetrics[0];
  const gates = requiredHardGates || evaluatorGatesFor(plan);
  const manifest = createEvaluationManifest({
    experimentId: `phase6-${plan.id}`,
    evalLock: createEvalLock({ purpose: "self-development-phase6-test", experimentId: `phase6-${plan.id}` }),
    baselineIdentity: { sha: BASE_SHA, artifactType: "git-tree" },
    candidateIdentity: { sha: candidateSha, artifactType: "git-tree" },
    environment: {
      platform: "linux",
      runtime: "node",
      runtimeVersion: process.version,
      architecture: process.arch,
      buildProfile: "ci",
      fixtureVersion: "phase6-v2"
    },
    metrics: [metricId],
    targetMetrics: [metricId],
    requiredHardGates: gates
  });

  const hardGateResults = {};
  for (const gate of gates) hardGateResults[gate] = true;
  Object.assign(hardGateResults, hardGateOverrides);

  const makeRuns = (prefix, value) => [1, 2, 3].map((n) => ({
    runId: `${prefix}-${n}`,
    manifestDigest: manifest.manifestDigest,
    environmentDigest: manifest.environmentDigest,
    metrics: { [metricId]: value }
  }));

  const result = evaluatePaired({
    manifest,
    baselineRuns: makeRuns("base", baselineValue),
    candidateRuns: makeRuns("candidate", candidateValue),
    hardGateResults
  });
  return { manifest, result };
}

function proof(level, evaluationResult, overrides = {}) {
  return {
    level,
    sourceSha: evaluationResult.candidateIdentity.sha,
    evidenceDigest: evaluationResult.evidenceDigest,
    rollbackReady: true,
    knownUnknowns: [],
    ...overrides
  };
}

function review(evaluationResult, {
  id = "review-1",
  reviewerId = "independent-reviewer",
  verdict = "APPROVE",
  findings = [],
  builderId = BUILDER,
  architectureChecked = true,
  testsChecked = true,
  resultsChecked = true
} = {}) {
  return createReview({
    reviewId: id,
    reviewerId,
    builderId,
    candidateSha: evaluationResult.candidateIdentity.sha,
    evidenceDigest: evaluationResult.evidenceDigest,
    verdict,
    findings,
    architectureChecked,
    testsChecked,
    resultsChecked
  });
}

function manual(evaluationResult, approverId = "human-owner") {
  return {
    approved: true,
    approverId,
    candidateSha: evaluationResult.candidateIdentity.sha,
    evidenceDigest: evaluationResult.evidenceDigest
  };
}

const TRUST_PROOF = () => true;
const TRUST_REVIEW = () => true;
const TRUST_APPROVAL = () => true;
const REJECT_AUTHORITY = () => false;

function decide(fixture, bundle, overrides = {}) {
  return decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof(fixture.candidate.proofPlan.requiredProofLevel, bundle.result),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF,
    ...overrides
  });
}

pass("LOW candidate becomes shadow-eligible only through authorized plan + locked evaluation + trusted proof", () => {
  const fixture = planned("low");
  const bundle = evaluationFor(fixture.candidate);
  assert.equal(bundle.result.decision, "PASS");
  const result = decide(fixture, bundle);
  assert.equal(result.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(result.trustedReviewCount, 0);
  assert.equal(result.planningValidationDigest, fixture.candidate.validationDigest);
  assert.equal(result.manifestDigest, bundle.manifest.manifestDigest);
});

pass("direct risk derivation cannot bypass Phase 3 orchestration authorization", () => {
  const fixture = planned("direct-block");
  const direct = derivePlanningCandidate({
    hypothesis: fixture.candidate.hypothesis,
    assessment: fixture.candidate.assessment
  });
  const bundle = evaluationFor(fixture.candidate);
  const result = decideAcceptance({
    planningCandidate: direct,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L2", bundle.result),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF
  });
  assert.equal(result.decision, "BLOCKED");
  assert.deepEqual(result.reasons, ["planning_not_orchestration_authorized"]);
});

pass("acceptance re-runs Phase 3 validation and rejects mismatched planning evidence", () => {
  const fixture = planned("revalidate");
  const bundle = evaluationFor(fixture.candidate);
  const wrongValidation = {
    ...fixture.validation,
    candidates: [hypothesis("other")]
  };
  const result = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: wrongValidation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L2", bundle.result),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("planning_hypothesis_revalidation_failed"));
});

pass("evaluation manifest is re-built against the current evaluator lock", () => {
  const fixture = planned("manifest-lock");
  const bundle = evaluationFor(fixture.candidate);
  const tamperedManifest = {
    ...bundle.manifest,
    evaluatorIdentity: {
      ...bundle.manifest.evaluatorIdentity,
      corpusHash: "0".repeat(64)
    }
  };
  const result = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: tamperedManifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L2", bundle.result),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(["evaluator_identity_drift", "evaluation_manifest_invalid"].includes(result.reasons[0]));
});

pass("evaluation digest tampering is BLOCKED before acceptance reasoning", () => {
  const fixture = planned("eval-tamper");
  const bundle = evaluationFor(fixture.candidate);
  const tampered = { ...bundle.result, evidenceDigest: "d".repeat(64) };
  const result = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: tampered,
    proofBundle: proof("L8", { ...bundle.result, evidenceDigest: tampered.evidenceDigest }),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF
  });
  assert.equal(result.decision, "BLOCKED");
  assert.deepEqual(result.reasons, ["evaluation_evidence_digest_invalid"]);
});

pass("evaluation failure cannot be rescued by proof or review", () => {
  const fixture = planned("eval-fail");
  const bundle = evaluationFor(fixture.candidate, { candidateValue: 0.40 });
  assert.equal(bundle.result.decision, "FAIL");
  const result = decide(fixture, bundle, {
    reviews: [review(bundle.result)],
    reviewVerifier: TRUST_REVIEW
  });
  assert.equal(result.decision, "REJECT");
  assert.ok(result.reasons.includes("evaluation_fail"));
});

pass("proof requires a trusted verifier callback in addition to structural binding", () => {
  const fixture = planned("proof-authority");
  const bundle = evaluationFor(fixture.candidate);

  const missing = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L2", bundle.result),
    builderId: BUILDER
  });
  assert.equal(missing.decision, "BLOCKED");
  assert.ok(missing.reasons.includes("proof_verifier_missing"));

  const rejected = decide(fixture, bundle, { proofVerifier: REJECT_AUTHORITY });
  assert.equal(rejected.decision, "BLOCKED");
  assert.ok(rejected.reasons.includes("proof_authority_verification_failed"));
});

pass("missing required proof level or rollback readiness blocks shadow eligibility", () => {
  const fixture = planned("proof-low");
  const bundle = evaluationFor(fixture.candidate);

  const low = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L1", bundle.result),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF
  });
  assert.equal(low.decision, "BLOCKED");
  assert.ok(low.reasons.includes("proof_level_below_required:L2"));

  const rollback = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L2", bundle.result, { rollbackReady: false }),
    builderId: BUILDER,
    proofVerifier: TRUST_PROOF
  });
  assert.equal(rollback.decision, "BLOCKED");
  assert.ok(rollback.reasons.includes("rollback_not_ready"));
});

pass("manifest must include every evaluator-owned gate required by the rederived risk plan", () => {
  const fixture = planned("gate-manifest");
  const required = evaluatorGatesFor(fixture.candidate);
  const incomplete = required.filter((gate) => gate !== "rollback");
  const bundle = evaluationFor(fixture.candidate, { requiredHardGates: incomplete });
  assert.equal(bundle.result.decision, "PASS");
  const result = decide(fixture, bundle);
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("manifest_gate_missing:rollback"));
});

pass("failed evaluator hard gate rejects even when target metric improves", () => {
  const fixture = planned("gate-fail");
  const bundle = evaluationFor(fixture.candidate, {
    hardGateOverrides: { regression: false }
  });
  assert.equal(bundle.result.decision, "FAIL");
  const result = decide(fixture, bundle);
  assert.equal(result.decision, "REJECT");
});

pass("MEDIUM self-review cannot satisfy independent review even if authority verifier trusts the record", () => {
  const fixture = planned("medium", "routing");
  const bundle = evaluationFor(fixture.candidate);
  const own = review(bundle.result, { reviewerId: BUILDER });
  const result = decide(fixture, bundle, {
    reviews: [own],
    reviewVerifier: TRUST_REVIEW
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("independent_approval_missing"));
});

pass("valid independent review is ignored unless trusted review authority verifies it", () => {
  const fixture = planned("medium-trust", "routing");
  const bundle = evaluationFor(fixture.candidate);
  const independent = review(bundle.result);

  const noVerifier = decide(fixture, bundle, { reviews: [independent] });
  assert.equal(noVerifier.decision, "BLOCKED");
  assert.ok(noVerifier.reasons.includes("review_verifier_missing"));

  const rejectedAuthority = decide(fixture, bundle, {
    reviews: [independent],
    reviewVerifier: REJECT_AUTHORITY
  });
  assert.equal(rejectedAuthority.decision, "BLOCKED");
  assert.ok(rejectedAuthority.reasons.includes("review_authority_verification_failed"));

  const accepted = decide(fixture, bundle, {
    reviews: [independent],
    reviewVerifier: TRUST_REVIEW
  });
  assert.equal(accepted.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(accepted.trustedReviewCount, 1);
});

pass("negative trusted independent review rejects otherwise passing evidence", () => {
  const fixture = planned("medium-negative", "routing");
  const bundle = evaluationFor(fixture.candidate);
  const negative = review(bundle.result, {
    verdict: "CHANGES_REQUIRED",
    findings: [{
      code: "ARCH-001",
      severity: "HIGH",
      summary: "Shared boundary regression needs repair.",
      evidenceRef: "review:e1"
    }]
  });
  const result = decide(fixture, bundle, {
    reviews: [negative],
    reviewVerifier: TRUST_REVIEW
  });
  assert.equal(result.decision, "REJECT");
  assert.ok(result.reasons.includes("review_requires_changes"));
});

pass("HIGH requires independent review and trusted manual approval authority", () => {
  const fixture = planned("high", "storage_schema", ["release/storage-migration.js"]);
  const bundle = evaluationFor(fixture.candidate);
  const independent = review(bundle.result);

  const missingVerifier = decide(fixture, bundle, {
    reviews: [independent],
    reviewVerifier: TRUST_REVIEW,
    manualApproval: manual(bundle.result)
  });
  assert.equal(missingVerifier.decision, "BLOCKED");
  assert.ok(missingVerifier.reasons.includes("manual_approval_verifier_missing"));

  const rejectedApproval = decide(fixture, bundle, {
    reviews: [independent],
    reviewVerifier: TRUST_REVIEW,
    manualApproval: manual(bundle.result),
    manualApprovalVerifier: REJECT_AUTHORITY
  });
  assert.equal(rejectedApproval.decision, "BLOCKED");
  assert.ok(rejectedApproval.reasons.includes("manual_approval_authority_verification_failed"));

  const approved = decide(fixture, bundle, {
    reviews: [independent],
    reviewVerifier: TRUST_REVIEW,
    manualApproval: manual(bundle.result),
    manualApprovalVerifier: TRUST_APPROVAL
  });
  assert.equal(approved.decision, "ELIGIBLE_FOR_SHADOW");
  assert.equal(approved.manualApproval.approverId, "human-owner");
});

pass("builder cannot satisfy HIGH manual approval structurally", () => {
  const fixture = planned("high-self", "storage_schema", ["release/storage-migration.js"]);
  const bundle = evaluationFor(fixture.candidate);
  const result = decide(fixture, bundle, {
    reviews: [review(bundle.result)],
    reviewVerifier: TRUST_REVIEW,
    manualApproval: manual(bundle.result, BUILDER),
    manualApprovalVerifier: TRUST_APPROVAL
  });
  assert.equal(result.decision, "BLOCKED");
  assert.ok(result.reasons.includes("manual_approval_missing_or_invalid"));
});

pass("CRITICAL change remains governance-blocked even with strongest normal-path proof", () => {
  const fixture = planned("critical", "self_development", ["evolution/gates.cjs"]);
  const bundle = evaluationFor(fixture.candidate);
  const result = decideAcceptance({
    planningCandidate: fixture.candidate,
    hypothesisValidation: fixture.validation,
    evaluationManifest: bundle.manifest,
    evaluationResult: bundle.result,
    proofBundle: proof("L8", bundle.result),
    builderId: BUILDER,
    reviews: [review(bundle.result)],
    manualApproval: manual(bundle.result),
    proofVerifier: TRUST_PROOF,
    reviewVerifier: TRUST_REVIEW,
    manualApprovalVerifier: TRUST_APPROVAL
  });
  assert.equal(result.decision, "BLOCKED_GOVERNANCE");
  assert.ok(result.reasons.includes("critical_change_requires_separate_governance"));
});

pass("review records still reject secret-like reviewer identifiers and evidence refs", () => {
  const fixture = planned("secret-review", "routing");
  const bundle = evaluationFor(fixture.candidate);
  assert.throws(() => review(bundle.result, { reviewerId: "ghp_abcdefghijklmnopqrstuvwxyz123456" }), /secret-like reviewerId/);
  assert.throws(() => review(bundle.result, {
    findings: [{
      code: "SEC",
      severity: "HIGH",
      summary: "Finding",
      evidenceRef: "sk-abcdefghijklmnopqrstuv"
    }]
  }), /secret-like finding evidenceRef/);
});

console.log("self-development review and acceptance test suite: PASS");
