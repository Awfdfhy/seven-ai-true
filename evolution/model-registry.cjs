"use strict";

const crypto = require("crypto");

const FREE_PROOF_CLASSES = Object.freeze([
  "OPEN_WEIGHTS_LOCAL",
  "FREE_API_TIER",
  "ZERO_COST_HOSTED"
]);

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stableId(provider, model) {
  return crypto.createHash("sha256").update(`${provider.toLowerCase()}::${model.toLowerCase()}`).digest("hex").slice(0, 24);
}

function normalizeCapabilities(input = {}) {
  const keys = ["chat", "coding", "reasoning", "vision", "tools", "json", "longContext", "local"];
  return keys.reduce((out, key) => {
    out[key] = input[key] === true;
    return out;
  }, {});
}

function normalizeModelRecord(input = {}) {
  const provider = text(input.provider);
  const model = text(input.model);
  if (!provider || !model) throw new Error("provider and model are required");
  const record = {
    id: text(input.id) || stableId(provider, model),
    provider,
    model,
    displayName: text(input.displayName) || model,
    capabilities: normalizeCapabilities(input.capabilities),
    contextWindow: Math.max(0, Number(input.contextWindow) || 0),
    status: ["DISCOVERED", "VERIFIED", "ACTIVE", "REJECTED", "RETIRED"].includes(input.status) ? input.status : "DISCOVERED",
    source: {
      url: text(input.source && input.source.url),
      discoveredAt: text(input.source && input.source.discoveredAt),
      sourceType: text(input.source && input.source.sourceType) || "unknown"
    },
    freeProof: {
      class: text(input.freeProof && input.freeProof.class),
      status: text(input.freeProof && input.freeProof.status) || "UNVERIFIED",
      license: text(input.freeProof && input.freeProof.license),
      evidence: Array.isArray(input.freeProof && input.freeProof.evidence) ? input.freeProof.evidence.filter(Boolean).map(String) : [],
      verifiedAt: text(input.freeProof && input.freeProof.verifiedAt)
    },
    lineage: {
      sourceRecordId: text(input.lineage && input.lineage.sourceRecordId),
      transformation: text(input.lineage && input.lineage.transformation) || "normalized"
    }
  };
  return Object.freeze(record);
}

function verifyFreeProof(record) {
  const proof = record && record.freeProof ? record.freeProof : {};
  const reasons = [];
  if (!FREE_PROOF_CLASSES.includes(proof.class)) reasons.push("invalid_free_proof_class");
  if (proof.status !== "VERIFIED") reasons.push("free_proof_not_verified");
  if (!proof.verifiedAt) reasons.push("missing_verified_at");
  if (!Array.isArray(proof.evidence) || proof.evidence.length === 0) reasons.push("missing_evidence");
  if (proof.class === "OPEN_WEIGHTS_LOCAL" && !proof.license) reasons.push("missing_license");
  return { valid: reasons.length === 0, reasons };
}

function createRegistry(records = []) {
  const map = new Map();
  for (const item of records) {
    const record = normalizeModelRecord(item);
    if (map.has(record.id)) throw new Error(`duplicate model id: ${record.id}`);
    map.set(record.id, record);
  }
  return map;
}

function upsertModel(registry, input) {
  if (!(registry instanceof Map)) throw new Error("registry must be a Map");
  const record = normalizeModelRecord(input);
  const previous = registry.get(record.id) || null;
  registry.set(record.id, record);
  return { previous, record };
}

function activeModels(registry) {
  return [...registry.values()].filter((record) => record.status === "ACTIVE" && verifyFreeProof(record).valid);
}

module.exports = {
  FREE_PROOF_CLASSES,
  stableId,
  normalizeCapabilities,
  normalizeModelRecord,
  verifyFreeProof,
  createRegistry,
  upsertModel,
  activeModels
};
