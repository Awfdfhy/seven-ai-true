"use strict";

const crypto = require("crypto");
const {
  createHypothesis,
  validateHypothesisSet
} = require("./self-development-hypotheses.cjs");

const PROFILES = Object.freeze({
  LOW: Object.freeze({
    requiredHardGates: Object.freeze(["contracts", "regression", "rollback"]),
    requiredProofLevel: "L2",
    independentReview: false,
    manualApproval: false,
    shadowRequired: true,
    ordinaryCodingAllowed: true,
    maxFiles: 3,
    maxBytes: 20000,
    maxRepairAttempts: 2
  }),
  MEDIUM: Object.freeze({
    requiredHardGates: Object.freeze(["contracts", "critic", "domain-benchmark", "regression", "rollback"]),
    requiredProofLevel: "L3",
    independentReview: true,
    manualApproval: false,
    shadowRequired: true,
    ordinaryCodingAllowed: true,
    maxFiles: 5,
    maxBytes: 50000,
    maxRepairAttempts: 2
  }),
  HIGH: Object.freeze({
    requiredHardGates: Object.freeze(["contracts", "critic", "domain-benchmark", "integration", "manual-approval", "recovery", "regression", "rollback", "security"]),
    requiredProofLevel: "L5",
    independentReview: true,
    manualApproval: true,
    shadowRequired: true,
    ordinaryCodingAllowed: true,
    maxFiles: 8,
    maxBytes: 80000,
    maxRepairAttempts: 1
  }),
  CRITICAL: Object.freeze({
    requiredHardGates: Object.freeze(["adversarial", "contracts", "critic", "domain-benchmark", "integration", "manual-governance", "mutation", "recovery", "regression", "rollback", "security"]),
    requiredProofLevel: "L7",
    independentReview: true,
    manualApproval: true,
    shadowRequired: true,
    ordinaryCodingAllowed: false,
    maxFiles: 0,
    maxBytes: 0,
    maxRepairAttempts: 0
  })
});

const RISK_RANK = Object.freeze({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 });

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

function digest(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableObject(value))).digest("hex");
}

function metric01(value, name) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) throw new Error(`${name} must be between 0 and 1`);
  return number;
}

function normalizeAssessment(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("planner assessment required");
  const numericKeys = [
    "expectedGain",
    "confidence",
    "implementationCost",
    "evaluationCost",
    "blastRadius",
    "reversibility",
    "userImpact",
    "urgency",
    "problemSeverity"
  ];
  const out = {};
  for (const key of numericKeys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) throw new Error(`planner assessment missing: ${key}`);
    out[key] = metric01(value[key], key);
  }
  if (value.hardFailureFix !== true && value.hardFailureFix !== false) throw new Error("hardFailureFix must be boolean");
  out.hardFailureFix = value.hardFailureFix;
  return Object.freeze(out);
}

function profileForRisk(level) {
  const profile = PROFILES[String(level || "").toUpperCase()];
  if (!profile) throw new Error("unknown planner risk level");
  return profile;
}

function utility(assessment, riskLevel) {
  const benefit =
    assessment.expectedGain * 0.22 +
    assessment.confidence * 0.14 +
    assessment.userImpact * 0.18 +
    assessment.urgency * 0.14 +
    assessment.reversibility * 0.12 +
    assessment.problemSeverity * 0.20;

  const cost =
    assessment.implementationCost * 0.35 +
    assessment.evaluationCost * 0.25 +
    assessment.blastRadius * 0.40;

  const riskPenalty = ({ LOW: 0.02, MEDIUM: 0.08, HIGH: 0.18, CRITICAL: 0.40 })[riskLevel] || 0.18;
  return Number((benefit - cost * 0.55 - riskPenalty).toFixed(6));
}

function buildPlanningCandidate({ hypothesis, assessment, orchestrationAuthorized = false, validationDigest = null } = {}) {
  const validatedHypothesis = createHypothesis(hypothesis);
  const normalizedAssessment = normalizeAssessment(assessment);
  const riskLevel = validatedHypothesis.risk.level;
  const profile = profileForRisk(riskLevel);
  const scopeOverBudget = profile.ordinaryCodingAllowed && validatedHypothesis.targetPaths.length > profile.maxFiles;

  const scopeCore = {
    allowedPaths: validatedHypothesis.targetPaths,
    maxFiles: profile.maxFiles,
    maxBytes: profile.maxBytes,
    maxRepairAttempts: profile.maxRepairAttempts,
    riskLevel
  };
  const scopeManifest = Object.freeze({
    ...scopeCore,
    scopeDigest: digest(scopeCore)
  });

  const proofPlan = Object.freeze({
    validationMetrics: validatedHypothesis.validationMetrics,
    requiredHardGates: profile.requiredHardGates,
    requiredProofLevel: profile.requiredProofLevel,
    independentReview: profile.independentReview,
    manualApproval: profile.manualApproval,
    shadowRequired: profile.shadowRequired,
    automaticPromotionAllowed: false
  });

  let disposition = "READY_FOR_CODING_PLAN";
  if (!profile.ordinaryCodingAllowed) disposition = "GOVERNANCE_REQUIRED";
  else if (scopeOverBudget) disposition = "BLOCKED_SCOPE_BUDGET";
  else if (profile.manualApproval) disposition = "MANUAL_APPROVAL_REQUIRED";
  else if (profile.independentReview) disposition = "INDEPENDENT_REVIEW_REQUIRED";

  return Object.freeze({
    schemaVersion: 2,
    id: validatedHypothesis.id,
    hypothesis: validatedHypothesis,
    assessment: normalizedAssessment,
    estimateOnly: true,
    riskLevel,
    proofPlan,
    scopeManifest,
    estimatedUtility: utility(normalizedAssessment, riskLevel),
    disposition,
    ordinaryCodingAllowed: profile.ordinaryCodingAllowed && !scopeOverBudget,
    orchestrationAuthorized: orchestrationAuthorized === true,
    validationDigest: validationDigest || null
  });
}

// Used by the acceptance layer only to re-derive risk/proof requirements from
// a hypothesis. This is intentionally NOT an orchestration authorization.
function derivePlanningCandidate({ hypothesis, assessment } = {}) {
  return buildPlanningCandidate({
    hypothesis,
    assessment,
    orchestrationAuthorized: false,
    validationDigest: null
  });
}

function dominates(a, b) {
  const ab = a.assessment;
  const bb = b.assessment;
  const benefitKeys = ["expectedGain", "confidence", "reversibility", "userImpact", "urgency", "problemSeverity"];
  const costKeys = ["implementationCost", "evaluationCost", "blastRadius"];

  let strict = false;

  const aHard = ab.hardFailureFix ? 1 : 0;
  const bHard = bb.hardFailureFix ? 1 : 0;
  if (aHard < bHard) return false;
  if (aHard > bHard) strict = true;

  for (const key of benefitKeys) {
    if (ab[key] < bb[key]) return false;
    if (ab[key] > bb[key]) strict = true;
  }
  for (const key of costKeys) {
    if (ab[key] > bb[key]) return false;
    if (ab[key] < bb[key]) strict = true;
  }

  const aRisk = RISK_RANK[a.riskLevel] || 3;
  const bRisk = RISK_RANK[b.riskLevel] || 3;
  if (aRisk > bRisk) return false;
  if (aRisk < bRisk) strict = true;

  return strict;
}

function priorityCompare(a, b) {
  if (a.assessment.hardFailureFix !== b.assessment.hardFailureFix) return a.assessment.hardFailureFix ? -1 : 1;
  if (a.assessment.problemSeverity !== b.assessment.problemSeverity) return b.assessment.problemSeverity - a.assessment.problemSeverity;
  if (a.estimatedUtility !== b.estimatedUtility) return b.estimatedUtility - a.estimatedUtility;
  if (RISK_RANK[a.riskLevel] !== RISK_RANK[b.riskLevel]) return RISK_RANK[a.riskLevel] - RISK_RANK[b.riskLevel];
  return a.id.localeCompare(b.id);
}

function validationSummary(set) {
  const core = {
    decision: set.decision,
    minCandidates: set.minCandidates,
    acceptedFingerprints: set.accepted.map((item) => item.fingerprint).sort(),
    rejected: set.rejected.map((item) => ({
      fingerprint: item.fingerprint || null,
      reason: item.reason
    })).sort((a, b) => String(a.fingerprint).localeCompare(String(b.fingerprint)) || String(a.reason).localeCompare(String(b.reason))),
    researchRequired: Boolean(set.researchDecision && set.researchDecision.required),
    researchReasons: set.researchDecision ? [...set.researchDecision.reasons].sort() : [],
    researchCoverage: set.researchSummary ? set.researchSummary.coverage : null,
    researchHosts: set.researchSummary ? [...set.researchSummary.independentHosts].sort() : []
  };
  return Object.freeze({ ...core, digest: digest(core) });
}

function prioritizeCandidates({ hypothesisValidation, assessments = {} } = {}) {
  if (!hypothesisValidation || typeof hypothesisValidation !== "object" || Array.isArray(hypothesisValidation)) {
    throw new Error("hypothesisValidation input required");
  }
  if (!assessments || typeof assessments !== "object" || Array.isArray(assessments)) throw new Error("planner assessments object required");

  // Re-run Phase 3 validation inside the planner. The caller cannot substitute
  // a precomputed READY flag or pass raw hypotheses around the research gate.
  const set = validateHypothesisSet(hypothesisValidation);
  const validation = validationSummary(set);

  if (set.readyForPlanning !== true || set.decision !== "READY_FOR_PLANNING") {
    return Object.freeze({
      schemaVersion: 2,
      decision: "BLOCKED_HYPOTHESIS_VALIDATION",
      validation,
      candidates: Object.freeze([]),
      frontier: Object.freeze([]),
      dominated: Object.freeze([]),
      governance: Object.freeze([]),
      blocked: Object.freeze([]),
      chosen: null,
      estimateNotice: "No planning occurs until Phase 3 validation passes."
    });
  }

  const hypotheses = set.accepted;
  const ids = hypotheses.map((item) => String(item.id));
  if (new Set(ids).size !== ids.length) throw new Error("duplicate hypothesis id in validated set");
  const fingerprints = hypotheses.map((item) => String(item.fingerprint));
  if (new Set(fingerprints).size !== fingerprints.length) throw new Error("duplicate hypothesis fingerprint in validated set");

  const candidates = hypotheses.map((hypothesis) => {
    const id = String(hypothesis.id);
    if (!Object.prototype.hasOwnProperty.call(assessments, id)) throw new Error(`missing planner assessment for ${id}`);
    return buildPlanningCandidate({
      hypothesis,
      assessment: assessments[id],
      orchestrationAuthorized: true,
      validationDigest: validation.digest
    });
  });

  const governance = candidates.filter((item) => item.disposition === "GOVERNANCE_REQUIRED");
  const blocked = candidates.filter((item) => item.disposition === "BLOCKED_SCOPE_BUDGET");
  const eligible = candidates.filter((item) => !governance.includes(item) && !blocked.includes(item));

  const frontier = eligible
    .filter((candidate) => !eligible.some((other) => other !== candidate && dominates(other, candidate)))
    .sort(priorityCompare);
  const frontierIds = new Set(frontier.map((item) => item.id));
  const dominated = eligible.filter((item) => !frontierIds.has(item.id)).sort(priorityCompare);

  return Object.freeze({
    schemaVersion: 2,
    decision: "PLANNED",
    validation,
    candidates: Object.freeze(candidates),
    frontier: Object.freeze(frontier),
    dominated: Object.freeze(dominated),
    governance: Object.freeze(governance),
    blocked: Object.freeze(blocked),
    chosen: frontier.length ? frontier[0] : null,
    estimateNotice: "Planner scores are prioritization estimates only; evaluator evidence decides acceptance."
  });
}

module.exports = {
  derivePlanningCandidate,
  prioritizeCandidates,
  dominates
};
