"use strict";

const crypto = require("crypto");
const { authorizePlanningCandidate } = require("./self-development-planner.cjs");
const { createReview } = require("./self-development-review.cjs");
const { createEvaluationManifest } = require("./self-development-paired-eval.cjs");

const PROOF_LEVELS = Object.freeze({
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
  L5: 5,
  L6: 6,
  L7: 7,
  L8: 8
});

const SECRET_LIKE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;
const POST_EVAL_GATES = Object.freeze(new Set(["critic", "manual-approval"]));

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

function safeText(value, name, max = 200) {
  const text = String(value == null ? "" : value).trim().replace(/\s+/g, " ");
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (SECRET_LIKE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function exactSha(value, name) {
  const sha = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`${name} requires exact 40-char SHA`);
  return sha;
}

function digest64(value, name) {
  const digest = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(digest)) throw new Error(`${name} requires sha256 digest`);
  return digest;
}

function sameStable(a, b) {
  return hashObject(a) === hashObject(b);
}

function normalizePlanningCandidate(value, hypothesisValidation) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("planningCandidate required");
  if (value.orchestrationAuthorized !== true) {
    return { valid: false, reason: "planning_not_orchestration_authorized", candidate: null, validation: null };
  }
  const authorization = authorizePlanningCandidate({
    hypothesisValidation,
    hypothesisId: value.hypothesis && value.hypothesis.id,
    assessment: value.assessment
  });
  if (!authorization || authorization.decision !== "AUTHORIZED" || !authorization.candidate) {
    return {
      valid: false,
      reason: "planning_hypothesis_revalidation_failed",
      candidate: null,
      validation: authorization && authorization.validation || null
    };
  }
  if (String(value.validationDigest || "") !== authorization.validation.digest) {
    return {
      valid: false,
      reason: "planning_validation_digest_mismatch",
      candidate: authorization.candidate,
      validation: authorization.validation
    };
  }
  if (value.scopeManifest && value.scopeManifest.scopeDigest !== authorization.candidate.scopeManifest.scopeDigest) {
    return {
      valid: false,
      reason: "planning_scope_digest_mismatch",
      candidate: authorization.candidate,
      validation: authorization.validation
    };
  }
  return {
    valid: true,
    reason: null,
    candidate: authorization.candidate,
    validation: authorization.validation
  };
}

function verifyEvaluationManifest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.schemaVersion !== 1) {
    return { valid: false, reason: "evaluation_manifest_invalid", manifest: null };
  }
  try {
    const rebuilt = createEvaluationManifest({
      experimentId: value.experimentId,
      evalLock: value.evaluatorIdentity,
      baselineIdentity: value.baselineIdentity,
      candidateIdentity: value.candidateIdentity,
      environment: value.environment,
      metrics: value.metrics,
      targetMetrics: value.targetMetrics,
      requiredHardGates: value.requiredHardGates
    });
    if (rebuilt.manifestDigest !== value.manifestDigest) {
      return { valid: false, reason: "evaluation_manifest_digest_invalid", manifest: rebuilt };
    }
    return { valid: true, reason: null, manifest: rebuilt };
  } catch (error) {
    return {
      valid: false,
      reason: error && error.code === "EVAL_LOCK_INVALID"
        ? "evaluator_identity_drift"
        : "evaluation_manifest_invalid",
      manifest: null
    };
  }
}

function verifyEvaluationResult(value, manifest) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.schemaVersion !== 1) {
    return { valid: false, reason: "evaluation_result_invalid" };
  }

  const resultCore = {
    schemaVersion: value.schemaVersion,
    experimentId: value.experimentId,
    manifestDigest: value.manifestDigest,
    baselineIdentity: value.baselineIdentity,
    candidateIdentity: value.candidateIdentity,
    environmentDigest: value.environmentDigest,
    decision: value.decision,
    reasons: value.reasons,
    hardGates: value.hardGates,
    comparisons: value.comparisons
  };
  const expected = hashObject(resultCore);
  if (typeof value.evidenceDigest !== "string" || value.evidenceDigest !== expected) {
    return { valid: false, reason: "evaluation_evidence_digest_invalid", expected };
  }
  if (!manifest) return { valid: false, reason: "evaluation_manifest_missing" };
  if (value.manifestDigest !== manifest.manifestDigest) return { valid: false, reason: "evaluation_manifest_binding_mismatch" };
  if (value.experimentId !== manifest.experimentId) return { valid: false, reason: "evaluation_experiment_mismatch" };
  if (!sameStable(value.baselineIdentity, manifest.baselineIdentity)) return { valid: false, reason: "evaluation_baseline_identity_mismatch" };
  if (!sameStable(value.candidateIdentity, manifest.candidateIdentity)) return { valid: false, reason: "evaluation_candidate_identity_mismatch" };
  if (value.environmentDigest !== manifest.environmentDigest) return { valid: false, reason: "evaluation_environment_mismatch" };

  const comparisonIds = Array.isArray(value.comparisons)
    ? value.comparisons.map((item) => String(item && item.metricId || "")).sort()
    : [];
  const expectedMetricIds = [...manifest.metrics].sort();
  if (comparisonIds.length !== expectedMetricIds.length || comparisonIds.some((id, index) => id !== expectedMetricIds[index])) {
    return { valid: false, reason: "evaluation_metric_set_mismatch" };
  }

  return { valid: true, reason: null, expected };
}

function normalizeProofBundle({
  level,
  sourceSha,
  evidenceDigest,
  rollbackReady,
  knownUnknowns = []
} = {}) {
  const proofLevel = String(level || "").toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(PROOF_LEVELS, proofLevel)) throw new Error("invalid proof level");
  if (rollbackReady !== true && rollbackReady !== false) throw new Error("rollbackReady must be boolean");
  if (!Array.isArray(knownUnknowns)) throw new Error("knownUnknowns must be an array");

  return Object.freeze({
    level: proofLevel,
    sourceSha: exactSha(sourceSha, "proof sourceSha"),
    evidenceDigest: digest64(evidenceDigest, "proof evidenceDigest"),
    rollbackReady,
    knownUnknowns: Object.freeze([...new Set(knownUnknowns.map((value) => safeText(value, "knownUnknown", 240)))].slice(0, 30))
  });
}

function normalizeManualApproval(value, candidateSha, evidenceDigest, builderId) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (value.approved !== true) return null;
  const approverId = safeText(value.approverId, "manual approverId", 160);
  if (approverId === builderId) return null;
  if (exactSha(value.candidateSha, "manual candidateSha") !== candidateSha) return null;
  if (digest64(value.evidenceDigest, "manual evidenceDigest") !== evidenceDigest) return null;
  return Object.freeze({
    approved: true,
    approverId,
    candidateSha,
    evidenceDigest
  });
}

function normalizeReviews(reviews = []) {
  const normalized = [];
  const errors = [];
  for (const raw of reviews) {
    try {
      normalized.push(createReview({
        reviewId: raw && raw.reviewId,
        reviewerId: raw && raw.reviewerId,
        builderId: raw && raw.builderId,
        candidateSha: raw && raw.candidateSha,
        evidenceDigest: raw && raw.evidenceDigest,
        verdict: raw && raw.verdict,
        scope: raw && raw.scope,
        findings: raw && raw.findings,
        architectureChecked: raw && raw.architectureChecked,
        testsChecked: raw && raw.testsChecked,
        resultsChecked: raw && raw.resultsChecked
      }));
    } catch (error) {
      errors.push(String(error && error.message || error));
    }
  }
  return { normalized, errors };
}

function reviewMatches(review, candidateSha, evidenceDigest, builderId) {
  return Boolean(
    review &&
    review.schemaVersion === 1 &&
    review.candidateSha === candidateSha &&
    review.evidenceDigest === evidenceDigest &&
    review.builderId === builderId
  );
}

function mapEvaluationDecision(decision) {
  switch (String(decision || "").toUpperCase()) {
    case "FAIL": return "REJECT";
    case "BLOCKED": return "BLOCKED";
    case "INCONCLUSIVE": return "INCONCLUSIVE";
    case "PASS": return "PASS";
    default: return "BLOCKED";
  }
}

function trustedVerifierResult(verifier, payload, context) {
  if (typeof verifier !== "function") return { available: false, trusted: false };
  try {
    return { available: true, trusted: verifier(payload, context) === true };
  } catch {
    return { available: true, trusted: false };
  }
}

function decideAcceptance({
  planningCandidate,
  hypothesisValidation,
  evaluationManifest,
  evaluationResult,
  proofBundle,
  builderId,
  reviews = [],
  manualApproval = null,
  proofVerifier,
  reviewVerifier,
  manualApprovalVerifier
} = {}) {
  if (!Array.isArray(reviews)) throw new Error("reviews must be an array");

  const planning = normalizePlanningCandidate(planningCandidate, hypothesisValidation);
  if (!planning.valid) {
    return Object.freeze({
      decision: "BLOCKED",
      reasons: Object.freeze([planning.reason]),
      candidateSha: null,
      evidenceDigest: null
    });
  }
  const derivedPlan = planning.candidate;

  const manifestVerification = verifyEvaluationManifest(evaluationManifest);
  if (!manifestVerification.valid) {
    return Object.freeze({
      decision: "BLOCKED",
      reasons: Object.freeze([manifestVerification.reason]),
      candidateSha: null,
      evidenceDigest: null
    });
  }
  const manifest = manifestVerification.manifest;

  const evaluationVerification = verifyEvaluationResult(evaluationResult, manifest);
  if (!evaluationVerification.valid) {
    return Object.freeze({
      decision: "BLOCKED",
      reasons: Object.freeze([evaluationVerification.reason]),
      candidateSha: null,
      evidenceDigest: null
    });
  }

  const builder = safeText(builderId, "builderId", 160);
  const candidateSha = exactSha(evaluationResult.candidateIdentity && evaluationResult.candidateIdentity.sha, "evaluation candidateSha");
  const evidenceDigest = digest64(evaluationResult.evidenceDigest, "evaluation evidenceDigest");

  if (manifest.candidateIdentity.sha !== candidateSha) {
    return Object.freeze({
      decision: "BLOCKED",
      reasons: Object.freeze(["manifest_candidate_sha_mismatch"]),
      candidateSha,
      evidenceDigest
    });
  }

  const proof = normalizeProofBundle(proofBundle);
  const proofAuthority = trustedVerifierResult(proofVerifier, proof, {
    candidateSha,
    evidenceDigest,
    requiredProofLevel: derivedPlan.proofPlan.requiredProofLevel,
    riskLevel: derivedPlan.riskLevel
  });

  const reviewNormalization = normalizeReviews(reviews);
  const reasons = [];
  if (reviewNormalization.errors.length) reasons.push("invalid_review_record");

  if (!proofAuthority.available) reasons.push("proof_verifier_missing");
  else if (!proofAuthority.trusted) reasons.push("proof_authority_verification_failed");

  const evaluationDecision = mapEvaluationDecision(evaluationResult.decision);

  if (derivedPlan.disposition === "GOVERNANCE_REQUIRED" || derivedPlan.riskLevel === "CRITICAL") {
    return Object.freeze({
      decision: "BLOCKED_GOVERNANCE",
      reasons: Object.freeze(["critical_change_requires_separate_governance"]),
      candidateSha,
      evidenceDigest
    });
  }

  if (evaluationDecision !== "PASS") {
    return Object.freeze({
      decision: evaluationDecision,
      reasons: Object.freeze([`evaluation_${String(evaluationResult.decision || "unknown").toLowerCase()}`]),
      candidateSha,
      evidenceDigest
    });
  }

  if (proof.sourceSha !== candidateSha) reasons.push("proof_source_sha_mismatch");
  if (proof.evidenceDigest !== evidenceDigest) reasons.push("proof_evidence_digest_mismatch");
  if (derivedPlan.proofPlan.shadowRequired && proof.rollbackReady !== true) reasons.push("rollback_not_ready");

  const requiredLevel = String(derivedPlan.proofPlan.requiredProofLevel || "").toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(PROOF_LEVELS, requiredLevel)) reasons.push("planning_proof_level_invalid");
  else if (PROOF_LEVELS[proof.level] < PROOF_LEVELS[requiredLevel]) reasons.push(`proof_level_below_required:${requiredLevel}`);

  const evaluatorGates = (derivedPlan.proofPlan.requiredHardGates || []).filter((gate) => !POST_EVAL_GATES.has(gate));
  for (const gate of evaluatorGates) {
    if (!manifest.requiredHardGates.includes(gate)) {
      reasons.push(`manifest_gate_missing:${gate}`);
      continue;
    }
    if (evaluationResult.hardGates && Object.prototype.hasOwnProperty.call(evaluationResult.hardGates, gate)) {
      if (evaluationResult.hardGates[gate] !== true) reasons.push(`required_gate_failed:${gate}`);
    } else {
      reasons.push(`required_gate_missing:${gate}`);
    }
  }

  const matchingReviews = reviewNormalization.normalized.filter((review) =>
    reviewMatches(review, candidateSha, evidenceDigest, builder)
  );
  const trustedReviews = [];
  if (matchingReviews.length) {
    if (typeof reviewVerifier !== "function") {
      reasons.push("review_verifier_missing");
    } else {
      for (const review of matchingReviews) {
        const authority = trustedVerifierResult(reviewVerifier, review, {
          candidateSha,
          evidenceDigest,
          builderId: builder,
          riskLevel: derivedPlan.riskLevel
        });
        if (authority.trusted) trustedReviews.push(review);
        else reasons.push("review_authority_verification_failed");
      }
    }
  }

  const negativeReviews = trustedReviews.filter((review) =>
    review.verdict === "REJECT" ||
    review.verdict === "CHANGES_REQUIRED" ||
    review.hasCriticalFinding === true ||
    review.hasHighFinding === true ||
    review.architectureChecked !== true ||
    review.testsChecked !== true ||
    review.resultsChecked !== true
  );
  if (negativeReviews.length) reasons.push("review_requires_changes");

  if (derivedPlan.proofPlan.independentReview === true) {
    if (typeof reviewVerifier !== "function") reasons.push("review_verifier_missing");
    const independentApproval = trustedReviews.some((review) =>
      review.independent === true &&
      review.reviewerId !== builder &&
      review.verdict === "APPROVE" &&
      review.hasCriticalFinding !== true &&
      review.hasHighFinding !== true &&
      review.architectureChecked === true &&
      review.testsChecked === true &&
      review.resultsChecked === true
    );
    if (!independentApproval) reasons.push("independent_approval_missing");
  }

  let approval = null;
  if (derivedPlan.proofPlan.manualApproval === true) {
    approval = normalizeManualApproval(manualApproval, candidateSha, evidenceDigest, builder);
    if (!approval) {
      reasons.push("manual_approval_missing_or_invalid");
    } else {
      const approvalAuthority = trustedVerifierResult(manualApprovalVerifier, approval, {
        candidateSha,
        evidenceDigest,
        builderId: builder,
        riskLevel: derivedPlan.riskLevel
      });
      if (!approvalAuthority.available) reasons.push("manual_approval_verifier_missing");
      else if (!approvalAuthority.trusted) reasons.push("manual_approval_authority_verification_failed");
    }
  }

  if (reasons.length) {
    const uniqueReasons = [...new Set(reasons)];
    const hardReject = uniqueReasons.includes("review_requires_changes") ||
      uniqueReasons.some((reason) => reason.startsWith("required_gate_failed:"));
    return Object.freeze({
      decision: hardReject ? "REJECT" : "BLOCKED",
      reasons: Object.freeze(uniqueReasons),
      candidateSha,
      evidenceDigest,
      proof,
      matchingReviewCount: matchingReviews.length,
      trustedReviewCount: trustedReviews.length,
      manualApproval: approval
    });
  }

  return Object.freeze({
    decision: derivedPlan.proofPlan.shadowRequired ? "ELIGIBLE_FOR_SHADOW" : "ELIGIBLE_FOR_CANARY",
    reasons: Object.freeze([]),
    candidateSha,
    evidenceDigest,
    proof,
    matchingReviewCount: matchingReviews.length,
    trustedReviewCount: trustedReviews.length,
    manualApproval: approval,
    planningValidationDigest: planning.validation.digest,
    manifestDigest: manifest.manifestDigest
  });
}

module.exports = {
  PROOF_LEVELS,
  normalizeProofBundle,
  decideAcceptance
};
