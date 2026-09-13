"use strict";

const { FREE_PROOF_CLASSES, normalizeModelRecord, verifyFreeProof } = require("./model-registry.cjs");

function normalizeEvidence(item = {}) {
  const url = String(item.url || "").trim();
  const observedAt = String(item.observedAt || "").trim();
  const claim = String(item.claim || "").trim();
  const sourceType = String(item.sourceType || "").trim();
  if (!url || !observedAt || !claim || !sourceType) throw new Error("complete free-proof evidence required");
  return Object.freeze({ url, observedAt, claim, sourceType });
}

function createVerifiedProof({ proofClass, evidence = [], verifiedAt, verifier = {}, license = "" } = {}) {
  if (!FREE_PROOF_CLASSES.includes(proofClass)) throw new Error("unsupported free-proof class");
  const verifierId = String(verifier.id || "").trim();
  const method = String(verifier.method || "").trim();
  if (!verifierId || !method) throw new Error("explicit verifier identity and method required");
  if (!verifiedAt) throw new Error("verifiedAt required");

  const normalizedEvidence = evidence.map(normalizeEvidence);
  if (normalizedEvidence.length === 0) throw new Error("free-proof evidence required");
  const hasOfficialEvidence = normalizedEvidence.some((item) => ["official", "provider-official", "model-card"].includes(item.sourceType));
  if (!hasOfficialEvidence) throw new Error("official free-proof evidence required");
  if (proofClass === "OPEN_WEIGHTS_LOCAL" && !String(license || "").trim()) throw new Error("license required for open weights");

  return Object.freeze({
    class: proofClass,
    status: "VERIFIED",
    license: String(license || "").trim(),
    evidence: normalizedEvidence.map((item) => JSON.stringify(item)),
    verifiedAt: String(verifiedAt),
    verifier: Object.freeze({ id: verifierId, method })
  });
}

function applyVerifiedProof(record, proof) {
  if (!record || !record.id) throw new Error("model record required");
  const candidate = normalizeModelRecord({
    ...record,
    status: "VERIFIED",
    freeProof: proof,
    lineage: {
      sourceRecordId: record.id,
      transformation: "free-proof-verification"
    }
  });
  const verification = verifyFreeProof(candidate);
  if (!verification.valid) throw new Error(`invalid verified proof: ${verification.reasons.join(",")}`);
  return candidate;
}

module.exports = { normalizeEvidence, createVerifiedProof, applyVerifiedProof };
