"use strict";

const crypto = require("crypto");

const LANES = Object.freeze(["RUNTIME_ADAPTATION", "ENGINEERING_EVOLUTION", "META_EVOLUTION", "MODEL_TRAINING"]);
const SCOPES = Object.freeze(["DEVICE_LOCAL", "USER_LOCAL", "PROJECT_LOCAL", "CAMPAIGN_LOCAL", "PRODUCT", "GLOBAL"]);
const DECISIONS = Object.freeze(["REJECT", "EXPERIMENT_ONLY", "REQUIRE_APPROVAL", "AUTO_ELIGIBLE"]);

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function freezeTarget(input = {}) {
  const target = {
    format: "seven-improvement-target",
    version: 1,
    id: String(input.id || ""),
    lane: String(input.lane || "ENGINEERING_EVOLUTION"),
    scope: String(input.scope || "CAMPAIGN_LOCAL"),
    authorityHash: String(input.authorityHash || ""),
    requirements: Array.isArray(input.requirements) ? [...input.requirements] : [],
    invariants: Array.isArray(input.invariants) ? [...input.invariants] : [],
    forbiddenRegressions: Array.isArray(input.forbiddenRegressions) ? [...input.forbiddenRegressions] : [],
    resourceEnvelope: input.resourceEnvelope || {},
    generationLimit: Math.min(10, Math.max(0, Number(input.generationLimit == null ? 10 : input.generationLimit)))
  };
  if (!target.id) throw new Error("improvement target id required");
  if (!LANES.includes(target.lane)) throw new Error("invalid evolution lane");
  if (!SCOPES.includes(target.scope)) throw new Error("invalid evolution scope");
  if (!target.authorityHash) throw new Error("authority hash required");
  const hash = stableHash(target);
  return Object.freeze({ ...target, hash });
}

function createCampaign({ id, target, constitutionHash, generation = 0 } = {}) {
  if (!id) throw new Error("campaign id required");
  if (!target || !target.hash) throw new Error("frozen target required");
  if (!constitutionHash) throw new Error("constitution hash required");
  const g = Number(generation || 0);
  if (!Number.isInteger(g) || g < 0 || g > target.generationLimit) throw new Error("generation budget exceeded");
  return Object.freeze({
    format: "seven-evolution-campaign",
    version: 1,
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
  const external = Number(input.humanInterventions || 0) + Number(input.extraRetries || 0) + Number(input.strongerModelCalls || 0);
  return Object.freeze({ externalAssistance: external, autonomousEvidence: external === 0 });
}

function pathwayReceipt(input = {}) {
  const stages = ["saved", "represented", "retrieved", "applied", "updated", "outcome"];
  const missing = stages.filter((stage) => input[stage] !== true);
  return Object.freeze({ complete: missing.length === 0, missing });
}

function promotionDecision({ target, campaign, candidate = {}, judge = {}, assistance = {}, policy = {} } = {}) {
  const reasons = [];
  if (!target || !campaign) reasons.push("missing_governance_identity");
  else {
    if (campaign.targetHash !== target.hash) reasons.push("target_identity_mismatch");
    if (campaign.generation > campaign.generationLimit || campaign.generation > 10) reasons.push("generation_budget_exceeded");
  }
  if (!candidate.hash) reasons.push("candidate_hash_missing");
  if (candidate.authorityHash && candidate.authorityHash !== target.authorityHash) reasons.push("authority_changed");
  if (judge.independent !== true) reasons.push("judge_not_independent");
  if (judge.evalLocked !== true) reasons.push("evaluation_not_locked");
  if (judge.holdoutPassed !== true) reasons.push("holdout_not_passed");
  if (judge.forbiddenRegression === true) reasons.push("forbidden_regression");
  if (judge.rollbackReady !== true) reasons.push("rollback_not_ready");
  if (assistance.autonomousEvidence === false && candidate.claimsAutonomous === true) reasons.push("assistance_misattributed");
  if (candidate.scope && !SCOPES.includes(candidate.scope)) reasons.push("invalid_candidate_scope");
  if (candidate.scope && target && candidate.scope !== target.scope && policy.allowScopePromotion !== true) reasons.push("scope_escalation_not_authorized");

  if (reasons.length) return Object.freeze({ decision: "REJECT", reasons });
  const requested = String(policy.decision || "REQUIRE_APPROVAL");
  const decision = DECISIONS.includes(requested) ? requested : "REQUIRE_APPROVAL";
  return Object.freeze({ decision, reasons: [] });
}

module.exports = {
  LANES,
  SCOPES,
  DECISIONS,
  stableHash,
  freezeTarget,
  createCampaign,
  assertCampaignAdvance,
  assessAssistance,
  pathwayReceipt,
  promotionDecision
};
