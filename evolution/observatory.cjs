"use strict";

const { normalizeModelRecord, stableId } = require("./model-registry.cjs");

function requireSource(source = {}) {
  const url = typeof source.url === "string" ? source.url.trim() : "";
  const discoveredAt = typeof source.discoveredAt === "string" ? source.discoveredAt.trim() : "";
  const sourceType = typeof source.sourceType === "string" ? source.sourceType.trim() : "";
  if (!url) throw new Error("discovery source url required");
  if (!discoveredAt) throw new Error("discoveredAt required");
  if (!sourceType) throw new Error("sourceType required");
  return { url, discoveredAt, sourceType };
}

function ingestDiscovery(input = {}) {
  const source = requireSource(input.source);
  const provider = String(input.provider || "").trim();
  const model = String(input.model || "").trim();
  if (!provider || !model) throw new Error("provider and model are required");

  return normalizeModelRecord({
    ...input,
    id: input.id || stableId(provider, model),
    status: "DISCOVERED",
    source,
    freeProof: {
      class: input.freeProof && input.freeProof.class,
      status: "UNVERIFIED",
      license: input.freeProof && input.freeProof.license,
      evidence: input.freeProof && input.freeProof.evidence,
      verifiedAt: ""
    },
    lineage: {
      sourceRecordId: input.lineage && input.lineage.sourceRecordId,
      transformation: "observatory-discovery-normalization"
    }
  });
}

function deduplicateDiscoveries(records = []) {
  const map = new Map();
  for (const input of records) {
    const record = input && input.id ? input : ingestDiscovery(input);
    const existing = map.get(record.id);
    if (!existing) {
      map.set(record.id, record);
      continue;
    }

    const existingTime = Date.parse(existing.source.discoveredAt) || 0;
    const nextTime = Date.parse(record.source.discoveredAt) || 0;
    map.set(record.id, nextTime >= existingTime ? record : existing);
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function discoveryCandidate(record) {
  if (!record || record.status !== "DISCOVERED") throw new Error("DISCOVERED record required");
  return Object.freeze({
    id: record.id,
    kind: "model",
    source: "model-observatory",
    metadata: Object.freeze({
      provider: record.provider,
      model: record.model,
      sourceUrl: record.source.url,
      discoveredAt: record.source.discoveredAt,
      freeProofStatus: record.freeProof.status
    })
  });
}

module.exports = { requireSource, ingestDiscovery, deduplicateDiscoveries, discoveryCandidate };
