"use strict";

const crypto = require("crypto");
const { normalizeRepoPath } = require("./experiment-lab.cjs");
const { classifyChangeRisk } = require("./self-development-diagnosis.cjs");
const { getMetricDefinition } = require("./self-development-metrics.cjs");
const { decideResearch, summarizeResearch } = require("./self-development-research.cjs");

const EFFECTS = Object.freeze(new Set(["IMPROVE", "PRESERVE"]));
const SECRET_LIKE = /(?:bearer\s+[a-z0-9._~-]+|gh[pousr]_[a-z0-9_]+|sk-[a-z0-9_-]{12,})/i;

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

function hash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableObject(value))).digest("hex");
}

function safeText(value, name, max) {
  const text = String(value == null ? "" : value).trim().replace(/\s+/g, " ");
  if (!text || text.length > max || /[\u0000-\u001f]/.test(text)) throw new Error(`invalid ${name}`);
  if (SECRET_LIKE.test(text)) throw new Error(`secret-like ${name} rejected`);
  return text;
}

function safeList(values, name, { maxItems = 16, maxText = 240 } = {}) {
  if (!Array.isArray(values)) throw new Error(`${name} must be an array`);
  return Object.freeze([...new Set(values.map((value) => safeText(value, name, maxText)))].slice(0, maxItems));
}

function normalizeExpectedEffects(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("expectedEffects must be an object");
  const out = {};
  for (const metricId of Object.keys(value).sort()) {
    getMetricDefinition(metricId);
    const effect = String(value[metricId] || "").toUpperCase();
    if (!EFFECTS.has(effect)) throw new Error(`invalid expected effect for ${metricId}`);
    out[metricId] = effect;
  }
  if (!Object.keys(out).length) throw new Error("at least one expected metric effect required");
  if (!Object.values(out).includes("IMPROVE")) throw new Error("hypothesis must predict at least one metric improvement");
  return Object.freeze(out);
}

function createHypothesis({
  id,
  diagnosisId,
  mechanism,
  changeClass,
  targetPaths = [],
  expectedEffects = {},
  assumptions = [],
  validationMetrics = [],
  rollbackPlan,
  evidenceRefs = []
} = {}) {
  const paths = [...new Set(targetPaths.map(normalizeRepoPath))].sort();
  if (!paths.length) throw new Error("hypothesis targetPaths required");
  const effects = normalizeExpectedEffects(expectedEffects);
  const metrics = [...new Set(validationMetrics.map(String))].sort();
  if (!metrics.length) throw new Error("validationMetrics required");
  metrics.forEach(getMetricDefinition);
  for (const metricId of Object.keys(effects)) {
    if (!metrics.includes(metricId)) throw new Error(`expected metric missing from validation plan: ${metricId}`);
  }

  const risk = classifyChangeRisk({ changeClass, targetPaths: paths });
  const core = {
    schemaVersion: 1,
    id: safeText(id, "hypothesis id", 160),
    diagnosisId: safeText(diagnosisId, "diagnosis id", 200),
    mechanism: safeText(mechanism, "hypothesis mechanism", 800),
    changeClass: safeText(changeClass, "changeClass", 80),
    targetPaths: Object.freeze(paths),
    expectedEffects: effects,
    assumptions: safeList(assumptions, "assumption", { maxItems: 12, maxText: 240 }),
    validationMetrics: Object.freeze(metrics),
    rollbackPlan: safeText(rollbackPlan || "restore exact baseline SHA and discard isolated candidate", "rollback plan", 600),
    evidenceRefs: safeList(evidenceRefs, "evidenceRef", { maxItems: 20, maxText: 200 }),
    risk
  };

  const fingerprint = hash({
    diagnosisId: core.diagnosisId,
    mechanism: core.mechanism.toLowerCase(),
    changeClass: core.changeClass.toLowerCase(),
    targetPaths: core.targetPaths,
    expectedEffects: core.expectedEffects,
    validationMetrics: core.validationMetrics
  });

  return Object.freeze({
    ...core,
    fingerprint,
    planningDisposition: risk.level === "CRITICAL"
      ? "GOVERNANCE_REQUIRED"
      : risk.level === "HIGH"
        ? "MANUAL_APPROVAL_REQUIRED"
        : "ELIGIBLE_FOR_PLANNING"
  });
}

function normalizePriorAttempt(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid prior attempt");
  const decision = String(value.decision || "").toUpperCase();
  if (!["ACCEPT", "REJECT", "ROLLBACK", "BLOCKED", "INCONCLUSIVE"].includes(decision)) throw new Error("invalid prior attempt decision");
  const fingerprint = String(value.fingerprint || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(fingerprint)) throw new Error("invalid prior attempt fingerprint");
  return {
    fingerprint,
    decision,
    evidenceRefs: safeList(value.evidenceRefs || [], "prior evidenceRef", { maxItems: 20, maxText: 200 })
  };
}

function riskRank(level) {
  return ({ LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 })[String(level || "").toUpperCase()] || 3;
}

function validateHypothesisSet({
  diagnosis,
  candidates = [],
  researchContext = {},
  researchEvidence = [],
  requiredClaimKeys = [],
  researchAsOf,
  researchMaxAgeDays = 365,
  priorAttempts = []
} = {}) {
  if (!diagnosis || typeof diagnosis !== "object") throw new Error("diagnosis required");
  const confidence = Number(diagnosis.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) throw new Error("invalid diagnosis confidence");
  if (!Array.isArray(candidates) || !candidates.length) throw new Error("hypothesis candidates required");
  if (!researchContext || typeof researchContext !== "object" || Array.isArray(researchContext)) throw new Error("researchContext must be an object");

  const prepared = [];
  const invalid = [];
  for (const raw of candidates) {
    try {
      prepared.push(raw && raw.fingerprint && raw.schemaVersion === 1 ? createHypothesis(raw) : createHypothesis(raw));
    } catch (error) {
      invalid.push(Object.freeze({ id: raw && raw.id ? String(raw.id) : null, reason: `invalid_hypothesis:${error.message}` }));
    }
  }

  const maxRisk = prepared.reduce((best, item) => riskRank(item.risk.level) > riskRank(best) ? item.risk.level : best, "LOW");
  const researchDecision = decideResearch({
    diagnosis,
    riskLevel: maxRisk,
    fastMoving: researchContext.fastMoving === true,
    externalDependency: researchContext.externalDependency === true,
    priorFailedAttempts: researchContext.priorFailedAttempts || 0,
    solutionAmbiguity: researchContext.solutionAmbiguity || 0
  });

  let researchSummary = null;
  if (researchDecision.required || (Array.isArray(researchEvidence) && researchEvidence.length > 0)) {
    if (!researchAsOf) {
      return Object.freeze({
        readyForPlanning: false,
        decision: "BLOCKED_RESEARCH_INCOMPLETE",
        minCandidates: 0,
        accepted: Object.freeze([]),
        rejected: Object.freeze(invalid),
        reasons: Object.freeze(["research_as_of_required"]),
        researchDecision,
        researchSummary: null
      });
    }
    researchSummary = summarizeResearch({
      evidence: researchEvidence,
      requiredClaimKeys,
      asOf: researchAsOf,
      maxAgeDays: researchMaxAgeDays
    });
  }

  if (researchDecision.required) {
    if (!researchSummary || researchSummary.complete !== true || Number(researchSummary.evidenceCount || 0) === 0) {
      return Object.freeze({
        readyForPlanning: false,
        decision: "BLOCKED_RESEARCH_INCOMPLETE",
        minCandidates: 0,
        accepted: Object.freeze([]),
        rejected: Object.freeze(invalid),
        reasons: Object.freeze(["required_research_incomplete"]),
        researchDecision,
        researchSummary
      });
    }
    if (researchSummary.staleEvidenceIds.length >= researchSummary.evidenceCount) {
      return Object.freeze({
        readyForPlanning: false,
        decision: "BLOCKED_RESEARCH_STALE",
        minCandidates: 0,
        accepted: Object.freeze([]),
        rejected: Object.freeze(invalid),
        reasons: Object.freeze(["all_required_research_stale"]),
        researchDecision,
        researchSummary
      });
    }
  }

  const contradictionCount = researchSummary ? researchSummary.contradictions.length : 0;
  const ambiguityRequiresAlternatives = researchDecision.reasons.includes("multiple_plausible_remedies");
  const minCandidates = confidence < 0.65 || contradictionCount > 0 || ambiguityRequiresAlternatives ? 2 : 1;
  const prior = priorAttempts.map(normalizePriorAttempt);
  const seen = new Set();
  const accepted = [];
  const rejected = [...invalid];

  for (const candidate of prepared) {
    if (seen.has(candidate.fingerprint)) {
      rejected.push(Object.freeze({ id: candidate.id, fingerprint: candidate.fingerprint, reason: "duplicate_hypothesis_in_set" }));
      continue;
    }
    seen.add(candidate.fingerprint);

    const matchingPrior = prior.filter((attempt) => attempt.fingerprint === candidate.fingerprint && ["REJECT", "ROLLBACK"].includes(attempt.decision));
    if (matchingPrior.length) {
      const oldEvidence = new Set(matchingPrior.flatMap((attempt) => attempt.evidenceRefs));
      const newEvidence = candidate.evidenceRefs.filter((ref) => !oldEvidence.has(ref));
      if (!newEvidence.length) {
        rejected.push(Object.freeze({
          id: candidate.id,
          fingerprint: candidate.fingerprint,
          reason: "repeated_failed_hypothesis_without_new_evidence"
        }));
        continue;
      }
    }

    accepted.push(candidate);
  }

  const enough = accepted.length >= minCandidates;
  return Object.freeze({
    readyForPlanning: enough,
    decision: enough ? "READY_FOR_PLANNING" : "INSUFFICIENT_DISTINCT_HYPOTHESES",
    minCandidates,
    accepted: Object.freeze(accepted),
    rejected: Object.freeze(rejected),
    reasons: Object.freeze(enough ? [] : [`need_${minCandidates}_distinct_hypotheses`]),
    requiresCritic: contradictionCount > 0 || accepted.some((item) => ["HIGH", "CRITICAL"].includes(item.risk.level)),
    researchDecision,
    researchSummary
  });
}

module.exports = {
  createHypothesis,
  validateHypothesisSet
};
