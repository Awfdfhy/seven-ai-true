"use strict";

const { stableHash, deepFreeze } = require("./v44-governance.cjs");

const PROPAGATION_SCALES = Object.freeze(["ACTION", "ATTEMPT", "EXPERIENCE", "GENERATION", "PRODUCT"]);
const AUTONOMY_MODES = Object.freeze(["AUTO", "REQUIRE_APPROVAL", "EXPERIMENT_ONLY", "FORBIDDEN"]);

function createAutonomyEnvelope({ id, actions = {} } = {}) {
  if (!id) throw new Error("autonomy envelope id required");
  const normalized = {};
  for (const [action, mode] of Object.entries(actions)) {
    const value = String(mode || "");
    if (!AUTONOMY_MODES.includes(value)) throw new Error(`invalid autonomy mode for ${action}`);
    normalized[String(action)] = value;
  }
  const body = { format: "seven-autonomy-envelope", version: 1, id: String(id), actions: normalized };
  return deepFreeze({ ...body, hash: stableHash(body) });
}

function autonomyReceipt({ envelope, action, requestedDecision } = {}) {
  const reasons = [];
  const mode = envelope && envelope.actions ? envelope.actions[String(action || "")] : null;
  if (!envelope || !envelope.hash) reasons.push("autonomy_envelope_missing");
  else if (!mode) reasons.push("autonomy_action_undeclared");
  else if (mode === "FORBIDDEN") reasons.push("autonomy_action_forbidden");
  const decision = String(requestedDecision || "REQUIRE_APPROVAL");
  if (mode === "REQUIRE_APPROVAL" && decision === "AUTO_ELIGIBLE") reasons.push("autonomy_policy_exceeds_envelope");
  if (mode === "EXPERIMENT_ONLY" && decision !== "EXPERIMENT_ONLY") reasons.push("autonomy_policy_exceeds_envelope");
  return deepFreeze({ pass: reasons.length === 0, reasons, mode: mode || null });
}

function capabilityConservationReceipt({ baseline = {}, candidate = {}, protectedCapabilities = [], tolerance = 0 } = {}) {
  const reasons = [];
  const slack = Number(tolerance || 0);
  if (!Number.isFinite(slack) || slack < 0) throw new Error("capability tolerance must be non-negative");
  for (const name of protectedCapabilities.map(String)) {
    if (!(name in baseline) || !(name in candidate)) {
      reasons.push(`capability_missing:${name}`);
      continue;
    }
    const before = baseline[name];
    const after = candidate[name];
    if (typeof before === "number" && typeof after === "number") {
      if (!Number.isFinite(before) || !Number.isFinite(after) || after < before - slack) reasons.push(`capability_regression:${name}`);
    } else if (before === true && after !== true) reasons.push(`capability_regression:${name}`);
    else if (typeof before === "string" && after !== before) reasons.push(`capability_changed:${name}`);
  }
  return deepFreeze({ pass: reasons.length === 0, reasons });
}

function propagationReceipt({ fromScale, toScale, authorized = false, evidenceHash = null } = {}) {
  const from = PROPAGATION_SCALES.indexOf(String(fromScale || ""));
  const to = PROPAGATION_SCALES.indexOf(String(toScale || ""));
  const reasons = [];
  if (from < 0 || to < 0) reasons.push("propagation_scale_invalid");
  if (from >= 0 && to > from && authorized !== true) reasons.push("propagation_not_authorized");
  if (from >= 0 && to > from && !evidenceHash) reasons.push("propagation_evidence_missing");
  return deepFreeze({ pass: reasons.length === 0, reasons, fromScale: fromScale || null, toScale: toScale || null });
}

function substrateTransferReceipt({ claim = "LOCAL", tested = [], requiredSubstrates = [] } = {}) {
  const passed = new Set(tested.filter((item) => item && item.passed === true).map((item) => String(item.substrate)));
  const reasons = [];
  for (const substrate of requiredSubstrates.map(String)) {
    if (!passed.has(substrate)) reasons.push(`substrate_not_proven:${substrate}`);
  }
  if (String(claim) === "GENERAL" && passed.size < 2) reasons.push("general_transfer_underpowered");
  return deepFreeze({ pass: reasons.length === 0, reasons, passedSubstrates: [...passed].sort() });
}

function toolLibraryHealthReceipt({
  brokenDependencies = 0,
  compositionRegressions = 0,
  newDuplicateCapabilities = 0,
  orphanedTools = 0,
  rollbackReady = false
} = {}) {
  const reasons = [];
  if (Number(brokenDependencies) > 0) reasons.push("tool_dependency_breakage");
  if (Number(compositionRegressions) > 0) reasons.push("tool_composition_regression");
  if (Number(newDuplicateCapabilities) > 0) reasons.push("tool_duplicate_growth");
  if (Number(orphanedTools) > 0) reasons.push("tool_orphan_growth");
  if (rollbackReady !== true) reasons.push("tool_library_rollback_unready");
  return deepFreeze({ pass: reasons.length === 0, reasons });
}

function oversightSustainabilityReceipt({
  reviewMinutes = 0,
  interventionCount = 0,
  fatigueSignal = false,
  independentReview = false,
  maxReviewMinutes = 30,
  maxInterventions = 5
} = {}) {
  const reasons = [];
  const minutes = Number(reviewMinutes);
  const interventions = Number(interventionCount);
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > Number(maxReviewMinutes)) reasons.push("oversight_time_budget_exceeded");
  if (!Number.isFinite(interventions) || interventions < 0 || interventions > Number(maxInterventions)) reasons.push("oversight_intervention_budget_exceeded");
  if (fatigueSignal === true) reasons.push("oversight_fatigue_signal");
  if (independentReview !== true) reasons.push("independent_oversight_missing");
  return deepFreeze({ pass: reasons.length === 0, reasons, reviewMinutes: minutes, interventionCount: interventions });
}

function bootstrapSupervisorReceipt({ incumbentEngineHash, candidateEngineHash, supervisorEngineHash, rollbackHash } = {}) {
  const reasons = [];
  for (const [name, value] of Object.entries({ incumbentEngineHash, candidateEngineHash, supervisorEngineHash, rollbackHash })) {
    if (!value) reasons.push(`bootstrap_missing:${name}`);
  }
  if (incumbentEngineHash && candidateEngineHash && incumbentEngineHash === candidateEngineHash) reasons.push("bootstrap_candidate_not_distinct");
  if (supervisorEngineHash && candidateEngineHash && supervisorEngineHash === candidateEngineHash) reasons.push("bootstrap_supervisor_is_candidate");
  return deepFreeze({ pass: reasons.length === 0, reasons });
}

module.exports = {
  PROPAGATION_SCALES,
  AUTONOMY_MODES,
  createAutonomyEnvelope,
  autonomyReceipt,
  capabilityConservationReceipt,
  propagationReceipt,
  substrateTransferReceipt,
  toolLibraryHealthReceipt,
  oversightSustainabilityReceipt,
  bootstrapSupervisorReceipt
};
