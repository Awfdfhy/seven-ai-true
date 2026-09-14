"use strict";

const crypto = require("crypto");

const LANES = Object.freeze(["RUNTIME_ADAPTATION", "ENGINEERING_EVOLUTION", "META_EVOLUTION", "MODEL_TRAINING"]);
const SCOPES = Object.freeze(["DEVICE_LOCAL", "USER_LOCAL", "PROJECT_LOCAL", "CAMPAIGN_LOCAL", "PRODUCT", "GLOBAL"]);
const DECISIONS = Object.freeze(["REJECT", "EXPERIMENT_ONLY", "REQUIRE_APPROVAL", "AUTO_ELIGIBLE"]);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = canonicalize(value[key]);
      return out;
    }, {});
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function finiteCount(value, name) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a non-negative number`);
  return n;
}

function freezeTarget(input = {}) {
  const rawLimit = Number(input.generationLimit == null ? 10 : input.generationLimit);
  if (!Number.isInteger(rawLimit) || rawLimit < 0) throw new Error("generation limit must be a non-negative integer");
  const target = {
    format: "seven-improvement-target",
    version: 2,
    id: String(input.id || ""),
    lane: String(input.lane || "ENGINEERING_EVOLUTION"),
    scope: String(input.scope || "CAMPAIGN_LOCAL"),
    authorityHash: String(input.authorityHash || ""),
    requirements: Array.isArray(input.requirements) ? canonicalize(input.requirements) : [],
    invariants: Array.isArray(input.invariants) ? canonicalize(input.invariants) : [],
    forbiddenRegressions: Array.isArray(input.forbiddenRegressions) ? canonicalize(input.forbiddenRegressions) : [],
    resourceEnvelope: canonicalize(input.resourceEnvelope || {}),
    generationLimit: Math.min(10, rawLimit)
  };
  if (!target.id) throw new Error("improvement target id required");
  if (!LANES.includes(target.lane)) throw new Error("invalid evolution lane");
  if (!SCOPES.includes(target.scope)) throw new Error("invalid evolution scope");
  if (!target.authorityHash) throw new Error("authority hash required");
  return deepFreeze({ ...target, hash: stableHash(target) });
}

function createCampaign({ id, target, constitutionHash, generation = 0 } = {}) {
  if (!id) throw new Error("campaign id required");
  if (!target || !target.hash) throw new Error("frozen target required");
  if (!constitutionHash) throw new Error("constitution hash required");
  const g = Number(generation || 0);
  if (!Number.isInteger(g) || g < 0 || g > target.generationLimit || g > 10) throw new Error("generation budget exceeded");
  return deepFreeze({
    format: "seven-evolution-campaign",
    version: 2,
    id: String(id),
    targetHash: target.hash,
    constitutionHash: String(constitutionHash),
    generation: g,
    generationLimit: target.generationLimit
  });
}

function assertCampaignAdvance(campaign, nextGeneration) {
  if (!campaign) throw new Error("campaign required");
  const next = Number(nextGeneration);
  if (!Number.isInteger(next) || next !== campaign.generation + 1) throw new Error("non-sequential generation");
  if (next > campaign.generationLimit || next > 10) throw new Error("global recursion budget exceeded");
  return true;
}

function assessAssistance(input = {}) {
  const counts = {
    humanInterventions: finiteCount(input.humanInterventions, "humanInterventions"),
    extraRetries: finiteCount(input.extraRetries, "extraRetries"),
    strongerModelCalls: finiteCount(input.strongerModelCalls, "strongerModelCalls")
  };
  const external = counts.humanInterventions + counts.extraRetries + counts.strongerModelCalls;
  return deepFreeze({ ...counts, externalAssistance: external, autonomousEvidence: external === 0 });
}

function pathwayReceipt(input = {}) {
  const stages = ["saved", "represented", "retrieved", "applied", "updated", "outcome"];
  const missing = stages.filter((stage) => input[stage] !== true);
  return deepFreeze({ complete: missing.length === 0, missing });
}

function promotionDecision({ target, campaign, candidate = {}, judge = {}, assistance = {}, policy = {} } = {}) {
  const reasons = [];
  if (!target || !campaign) reasons.push("missing_governance_identity");
  else {
    if (campaign.targetHash !== target.hash) reasons.push("target_identity_mismatch");
    if (campaign.generation > campaign.generationLimit || campaign.generation > 10) reasons.push("generation_budget_exceeded");
    if (candidate.authorityHash && candidate.authorityHash !== target.authorityHash) reasons.push("authority_changed");
  }
  if (!candidate.hash) reasons.push("candidate_hash_missing");
  if (judge.independent !== true) reasons.push("judge_not_independent");
  if (judge.evalLocked !== true) reasons.push("evaluation_not_locked");
  if (judge.holdoutPassed !== true) reasons.push("holdout_not_passed");
  if (judge.forbiddenRegression === true) reasons.push("forbidden_regression");
  if (judge.rollbackReady !== true) reasons.push("rollback_not_ready");
  if (assistance.autonomousEvidence === false && candidate.claimsAutonomous === true) reasons.push("assistance_misattributed");
  if (candidate.scope && !SCOPES.includes(candidate.scope)) reasons.push("invalid_candidate_scope");
  if (candidate.scope && target && candidate.scope !== target.scope && policy.allowScopePromotion !== true) reasons.push("scope_escalation_not_authorized");

  if (reasons.length) return deepFreeze({ decision: "REJECT", reasons });
  const requested = String(policy.decision || "REQUIRE_APPROVAL");
  const decision = DECISIONS.includes(requested) ? requested : "REQUIRE_APPROVAL";
  return deepFreeze({ decision, reasons: [] });
}

module.exports = {
  LANES,
  SCOPES,
  DECISIONS,
  canonicalize,
  deepFreeze,
  stableHash,
  freezeTarget,
  createCampaign,
  assertCampaignAdvance,
  assessAssistance,
  pathwayReceipt,
  promotionDecision
};
