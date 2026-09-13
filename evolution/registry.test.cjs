"use strict";

const assert = require("assert/strict");
const {
  stableId,
  normalizeModelRecord,
  verifyFreeProof,
  createRegistry,
  activeModels
} = require("./model-registry.cjs");
const {
  ingestDiscovery,
  deduplicateDiscoveries,
  discoveryCandidate
} = require("./observatory.cjs");
const { evaluateModelCandidate, compareModels } = require("./model-evals.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const baseline = { tests: 1, quality: 0.75, reliability: 0.75, performance: 0.70, efficiency: 0.70 };
const safeGates = {
  isolated: true,
  regressionFree: true,
  provenanceVerified: true,
  rollbackReady: true,
  criticalRegression: false
};
const strongRun = { tests: 1, quality: 0.90, reliability: 0.90, performance: 0.85, efficiency: 0.85 };

function verifiedHosted(overrides = {}) {
  return normalizeModelRecord({
    provider: "ExampleProvider",
    model: "example-free-model",
    status: "ACTIVE",
    source: { url: "https://example.invalid/model", discoveredAt: "2026-09-13T00:00:00.000Z", sourceType: "provider-catalog" },
    freeProof: {
      class: "FREE_API_TIER",
      status: "VERIFIED",
      evidence: ["provider states zero-cost tier"],
      verifiedAt: "2026-09-13T00:01:00.000Z"
    },
    ...overrides
  });
}

pass("stable model id is deterministic", () => {
  assert.equal(stableId("Provider", "Model"), stableId("provider", "model"));
});

pass("observatory discovery cannot self-promote to verified or active", () => {
  const record = ingestDiscovery({
    provider: "Provider",
    model: "NewModel",
    status: "ACTIVE",
    source: { url: "https://example.invalid/new", discoveredAt: "2026-09-13T00:00:00.000Z", sourceType: "feed" },
    freeProof: { class: "FREE_API_TIER", status: "VERIFIED", evidence: ["claim"], verifiedAt: "2026-09-13T00:00:01.000Z" }
  });
  assert.equal(record.status, "DISCOVERED");
  assert.equal(record.freeProof.status, "UNVERIFIED");
  assert.equal(record.freeProof.verifiedAt, "");
  assert.equal(discoveryCandidate(record).metadata.freeProofStatus, "UNVERIFIED");
});

pass("observatory requires explicit provenance", () => {
  assert.throws(() => ingestDiscovery({ provider: "P", model: "M", source: {} }), /source url required/);
});

pass("deduplication keeps the newest observation deterministically", () => {
  const oldRecord = ingestDiscovery({ provider: "P", model: "M", displayName: "old", source: { url: "https://example.invalid/old", discoveredAt: "2026-09-12T00:00:00.000Z", sourceType: "feed" } });
  const newRecord = ingestDiscovery({ provider: "P", model: "M", displayName: "new", source: { url: "https://example.invalid/new", discoveredAt: "2026-09-13T00:00:00.000Z", sourceType: "feed" } });
  const result = deduplicateDiscoveries([newRecord, oldRecord]);
  assert.equal(result.length, 1);
  assert.equal(result[0].displayName, "new");
});

pass("open weights require a license and verified evidence", () => {
  const record = normalizeModelRecord({
    provider: "Local",
    model: "weights",
    status: "ACTIVE",
    freeProof: { class: "OPEN_WEIGHTS_LOCAL", status: "VERIFIED", evidence: ["model card"], verifiedAt: "2026-09-13T00:00:00.000Z" }
  });
  const proof = verifyFreeProof(record);
  assert.equal(proof.valid, false);
  assert.ok(proof.reasons.includes("missing_license"));
});

pass("unknown free-proof classes fail closed", () => {
  const record = normalizeModelRecord({
    provider: "P",
    model: "M",
    freeProof: { class: "TRUST_ME", status: "VERIFIED", evidence: ["claim"], verifiedAt: "2026-09-13T00:00:00.000Z" }
  });
  assert.equal(verifyFreeProof(record).valid, false);
});

pass("active registry exposes only models with valid free proof", () => {
  const good = verifiedHosted();
  const bad = normalizeModelRecord({
    provider: "BadProvider",
    model: "unverified",
    status: "ACTIVE",
    freeProof: { class: "FREE_API_TIER", status: "UNVERIFIED", evidence: [] }
  });
  const registry = createRegistry([good, bad]);
  assert.deepEqual(activeModels(registry).map((item) => item.id), [good.id]);
});

pass("model eval rejects unverified candidate even with perfect benchmark scores", () => {
  const unverified = ingestDiscovery({
    provider: "FastProvider",
    model: "perfect-looking",
    source: { url: "https://example.invalid/perfect", discoveredAt: "2026-09-13T00:00:00.000Z", sourceType: "feed" },
    freeProof: { class: "FREE_API_TIER", evidence: ["unverified claim"] }
  });
  const result = evaluateModelCandidate({ baseline, record: unverified, runs: [{ tests: 1, quality: 1, reliability: 1, performance: 1, efficiency: 1 }], gates: safeGates });
  assert.equal(result.eligible, false);
  assert.ok(result.evaluation.failedGates.includes("freeProofVerified"));
});

pass("comparison selects verified safe model over unverified higher scorer", () => {
  const good = verifiedHosted();
  const unverified = ingestDiscovery({
    provider: "Unknown",
    model: "bigger-score",
    source: { url: "https://example.invalid/unknown", discoveredAt: "2026-09-13T00:00:00.000Z", sourceType: "feed" },
    freeProof: { class: "FREE_API_TIER", evidence: ["claim"] }
  });
  const result = compareModels({
    baseline,
    candidates: [
      { record: unverified, runs: [{ tests: 1, quality: 1, reliability: 1, performance: 1, efficiency: 1 }], gates: safeGates },
      { record: good, runs: [strongRun], gates: safeGates }
    ]
  });
  assert.equal(result.winner.modelId, good.id);
  assert.equal(result.rejected.length, 1);
});

console.log("model registry and observatory test suite: PASS");
