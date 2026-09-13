"use strict";

const { normalizeModelRecord, verifyFreeProof } = require("./model-registry.cjs");
const { verifyCandidate } = require("./coordinator.cjs");

function assertPromotionBinding(record, candidate) {
  if (!record || !record.id) throw new Error("model record required");
  if (!candidate || candidate.kind !== "model") throw new Error("model evolution candidate required");
  if (!candidate.metadata || candidate.metadata.modelId !== record.id) throw new Error("candidate/model binding mismatch");
  if (candidate.state !== "PROMOTED") throw new Error("candidate must be PROMOTED");
  const integrity = verifyCandidate(candidate);
  if (!integrity.valid) throw new Error("candidate ledger integrity failed");
  const proof = verifyFreeProof(record);
  if (!proof.valid) throw new Error(`free-proof invalid: ${proof.reasons.join(",")}`);
  if (!["VERIFIED", "ACTIVE"].includes(record.status)) throw new Error("model must be VERIFIED before activation");
  return { integrity, proof };
}

function activateModel(record, candidate) {
  assertPromotionBinding(record, candidate);
  return normalizeModelRecord({
    ...record,
    status: "ACTIVE",
    lineage: {
      sourceRecordId: record.id,
      transformation: `evolution-promotion:${candidate.id}`
    }
  });
}

function retireModel(record, { reason = "superseded", sourceRecordId = "" } = {}) {
  if (!record || !record.id) throw new Error("model record required");
  return normalizeModelRecord({
    ...record,
    status: "RETIRED",
    lineage: {
      sourceRecordId: sourceRecordId || record.id,
      transformation: `retire:${String(reason)}`
    }
  });
}

module.exports = { assertPromotionBinding, activateModel, retireModel };
