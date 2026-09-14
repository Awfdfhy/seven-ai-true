"use strict";

const { SCOPES, stableHash, deepFreeze } = require("./v44-governance.cjs");

const SCOPE_RANK = Object.freeze(Object.fromEntries(SCOPES.map((scope, index) => [scope, index])));

function compileExperience({
  id,
  sourceTargetHash,
  scope,
  substrateHash,
  mechanismClass,
  evidenceHash,
  outcomeClass,
  transferProofHash = null
} = {}) {
  const body = {
    format: "seven-retained-experience",
    version: 1,
    id: String(id || ""),
    sourceTargetHash: String(sourceTargetHash || ""),
    scope: String(scope || ""),
    substrateHash: String(substrateHash || ""),
    mechanismClass: String(mechanismClass || ""),
    evidenceHash: String(evidenceHash || ""),
    outcomeClass: String(outcomeClass || ""),
    transferProofHash: transferProofHash == null ? null : String(transferProofHash)
  };
  for (const field of ["id", "sourceTargetHash", "scope", "substrateHash", "mechanismClass", "evidenceHash", "outcomeClass"]) {
    if (!body[field]) throw new Error(`experience missing ${field}`);
  }
  if (!(body.scope in SCOPE_RANK)) throw new Error("invalid experience scope");
  return deepFreeze({ ...body, hash: stableHash(body) });
}

function verifyExperience(experience) {
  if (!experience || experience.format !== "seven-retained-experience" || !experience.hash) return { valid: false, reason: "missing_or_invalid" };
  const body = {
    format: experience.format,
    version: experience.version,
    id: experience.id,
    sourceTargetHash: experience.sourceTargetHash,
    scope: experience.scope,
    substrateHash: experience.substrateHash,
    mechanismClass: experience.mechanismClass,
    evidenceHash: experience.evidenceHash,
    outcomeClass: experience.outcomeClass,
    transferProofHash: experience.transferProofHash
  };
  return stableHash(body) === experience.hash ? { valid: true, reason: null } : { valid: false, reason: "hash_mismatch" };
}

function experienceUseReceipt({
  experience,
  currentTargetHash,
  requestedScope,
  currentSubstrateHash,
  transferEvidenceHash = null,
  negativeTransferSignal = false,
  supersededBy = null
} = {}) {
  const reasons = [];
  const verification = verifyExperience(experience);
  if (!verification.valid) reasons.push(`experience_${verification.reason}`);
  else {
    const requested = String(requestedScope || "");
    if (!(requested in SCOPE_RANK)) reasons.push("requested_scope_invalid");
    if (supersededBy) reasons.push("experience_superseded");
    if (negativeTransferSignal === true) reasons.push("negative_transfer_signal");
    const transfer = String(transferEvidenceHash || experience.transferProofHash || "");
    if (requested in SCOPE_RANK && SCOPE_RANK[requested] > SCOPE_RANK[experience.scope] && !transfer) reasons.push("scope_transfer_unproven");
    if (currentTargetHash && String(currentTargetHash) !== experience.sourceTargetHash && !transfer) reasons.push("target_transfer_unproven");
    if (currentSubstrateHash && String(currentSubstrateHash) !== experience.substrateHash && !transfer) reasons.push("substrate_transfer_unproven");
  }
  return deepFreeze({ usable: reasons.length === 0, reasons, experienceHash: experience && experience.hash || null });
}

function createSupersession({ priorExperienceHash, replacementExperienceHash, reason, evidenceHash } = {}) {
  const body = {
    format: "seven-experience-supersession",
    version: 1,
    priorExperienceHash: String(priorExperienceHash || ""),
    replacementExperienceHash: String(replacementExperienceHash || ""),
    reason: String(reason || ""),
    evidenceHash: String(evidenceHash || "")
  };
  for (const field of ["priorExperienceHash", "replacementExperienceHash", "reason", "evidenceHash"]) {
    if (!body[field]) throw new Error(`supersession missing ${field}`);
  }
  if (body.priorExperienceHash === body.replacementExperienceHash) throw new Error("supersession requires a different replacement");
  return deepFreeze({ ...body, hash: stableHash(body) });
}

module.exports = {
  SCOPE_RANK,
  compileExperience,
  verifyExperience,
  experienceUseReceipt,
  createSupersession
};
