"use strict";

const {
  autonomyReceipt,
  capabilityConservationReceipt,
  propagationReceipt,
  substrateTransferReceipt,
  toolLibraryHealthReceipt,
  oversightSustainabilityReceipt,
  bootstrapSupervisorReceipt
} = require("./v44-advanced-governance.cjs");
const { deepFreeze } = require("./v44-governance.cjs");
const { runGovernedEvolution } = require("./v44-runtime.cjs");

function strictPreflight({ candidate = {}, governancePolicy = {}, autonomyEnvelope, advancedEvidence = {} } = {}) {
  const autonomy = autonomyReceipt({
    envelope: autonomyEnvelope,
    action: candidate.action || "PROMOTE_CANDIDATE",
    requestedDecision: governancePolicy.decision || "REQUIRE_APPROVAL"
  });
  const conservation = capabilityConservationReceipt(advancedEvidence.capabilityConservation || {});
  const propagation = propagationReceipt(advancedEvidence.propagation || {});
  const substrate = candidate.claimsGeneralTransfer === true
    ? substrateTransferReceipt(advancedEvidence.substrateTransfer || { claim: "GENERAL" })
    : deepFreeze({ pass: true, reasons: [], notRequired: true });
  const tools = candidate.changesToolLibrary === true
    ? toolLibraryHealthReceipt(advancedEvidence.toolLibraryHealth || {})
    : deepFreeze({ pass: true, reasons: [], notRequired: true });
  const oversight = oversightSustainabilityReceipt(advancedEvidence.oversight || {});
  const bootstrap = candidate.upgradesEvolutionEngine === true
    ? bootstrapSupervisorReceipt(advancedEvidence.bootstrapSupervisor || {})
    : deepFreeze({ pass: true, reasons: [], notRequired: true });

  const receipts = { autonomy, conservation, propagation, substrate, tools, oversight, bootstrap };
  const reasons = Object.values(receipts).flatMap((receipt) => receipt.pass ? [] : receipt.reasons || []);
  return deepFreeze({ pass: reasons.length === 0, reasons: [...new Set(reasons)], receipts });
}

async function runStrictEvolution(input = {}) {
  const preflight = strictPreflight(input);
  if (!preflight.pass) {
    return { outcome: "ADVANCED_GOVERNANCE_REJECTED", stage: "V44_STRICT_PREFLIGHT", strictV44: preflight };
  }

  const autonomyMode = preflight.receipts.autonomy.mode;
  if (autonomyMode === "EXPERIMENT_ONLY") {
    return { outcome: "ADVANCED_EXPERIMENT_ONLY", stage: "V44_STRICT_PREFLIGHT", strictV44: preflight };
  }
  if (autonomyMode === "REQUIRE_APPROVAL" && input.advancedEvidence && input.advancedEvidence.approved !== true) {
    return { outcome: "ADVANCED_APPROVAL_REQUIRED", stage: "V44_STRICT_PREFLIGHT", strictV44: preflight };
  }

  const result = await runGovernedEvolution(input);
  return { ...result, strictV44: preflight };
}

module.exports = { strictPreflight, runStrictEvolution };
