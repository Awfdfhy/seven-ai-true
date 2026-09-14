"use strict";

const { stableHash, deepFreeze } = require("./v44-governance.cjs");

function freezeEvaluationConstitution({
  comparisonEpoch,
  corpusHash,
  judgeHash,
  testAuthorHash,
  committedBeforeCandidate = false,
  hiddenHoldoutHash = null
} = {}) {
  const body = {
    format: "seven-evaluation-constitution",
    version: 1,
    comparisonEpoch: String(comparisonEpoch || ""),
    corpusHash: String(corpusHash || ""),
    judgeHash: String(judgeHash || ""),
    testAuthorHash: String(testAuthorHash || ""),
    committedBeforeCandidate: committedBeforeCandidate === true,
    hiddenHoldoutHash: hiddenHoldoutHash == null ? null : String(hiddenHoldoutHash)
  };
  for (const field of ["comparisonEpoch", "corpusHash", "judgeHash", "testAuthorHash"]) {
    if (!body[field]) throw new Error(`evaluation constitution missing ${field}`);
  }
  return deepFreeze({ ...body, hash: stableHash(body) });
}

function evaluationFirewallReceipt({
  constitution,
  candidateBuilderHash,
  requestedJudgeHash,
  candidateTouchesEvaluation = false
} = {}) {
  const reasons = [];
  if (!constitution || !constitution.hash) reasons.push("evaluation_constitution_missing");
  else {
    if (!candidateBuilderHash) reasons.push("candidate_builder_identity_missing");
    if (!requestedJudgeHash) reasons.push("requested_judge_identity_missing");
    if (requestedJudgeHash && String(requestedJudgeHash) !== constitution.judgeHash) reasons.push("judge_identity_changed_inside_epoch");
    if (candidateBuilderHash && String(candidateBuilderHash) === constitution.judgeHash) reasons.push("builder_is_judge");
    if (candidateBuilderHash && String(candidateBuilderHash) === constitution.testAuthorHash && constitution.committedBeforeCandidate !== true) {
      reasons.push("candidate_authored_decisive_tests");
    }
    if (candidateTouchesEvaluation === true) reasons.push("candidate_changed_evaluation_identity");
  }
  return deepFreeze({ pass: reasons.length === 0, reasons });
}

function createEvaluatorEscrow({
  incumbentJudgeHash,
  candidateJudgeHash,
  calibrationEvidenceHash,
  approvedBy,
  currentEpoch,
  effectiveEpoch
} = {}) {
  const escrow = {
    format: "seven-evaluator-change-escrow",
    version: 1,
    incumbentJudgeHash: String(incumbentJudgeHash || ""),
    candidateJudgeHash: String(candidateJudgeHash || ""),
    calibrationEvidenceHash: String(calibrationEvidenceHash || ""),
    approvedBy: String(approvedBy || ""),
    currentEpoch: String(currentEpoch || ""),
    effectiveEpoch: String(effectiveEpoch || "")
  };
  for (const field of ["incumbentJudgeHash", "candidateJudgeHash", "calibrationEvidenceHash", "approvedBy", "currentEpoch", "effectiveEpoch"]) {
    if (!escrow[field]) throw new Error(`evaluator escrow missing ${field}`);
  }
  if (escrow.incumbentJudgeHash === escrow.candidateJudgeHash) throw new Error("evaluator escrow requires a different judge");
  if (escrow.currentEpoch === escrow.effectiveEpoch) throw new Error("evaluator change cannot activate inside the current comparison epoch");
  return deepFreeze({ ...escrow, hash: stableHash(escrow) });
}

function evaluatorEscrowReceipt({ escrow, requestedJudgeHash, epoch } = {}) {
  const reasons = [];
  if (!escrow || !escrow.hash) reasons.push("evaluator_escrow_missing");
  else {
    if (String(epoch || "") !== escrow.effectiveEpoch) reasons.push("evaluator_change_wrong_epoch");
    if (String(requestedJudgeHash || "") !== escrow.candidateJudgeHash) reasons.push("evaluator_change_identity_mismatch");
    if (!escrow.calibrationEvidenceHash) reasons.push("evaluator_calibration_missing");
  }
  return deepFreeze({ pass: reasons.length === 0, reasons });
}

module.exports = {
  freezeEvaluationConstitution,
  evaluationFirewallReceipt,
  createEvaluatorEscrow,
  evaluatorEscrowReceipt
};
