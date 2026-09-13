"use strict";

const assert = require("assert/strict");
const { ingestDiscovery } = require("./observatory.cjs");
const { createVerifiedProof, applyVerifiedProof } = require("./free-proof.cjs");
const {
  createCandidate,
  evaluateStage,
  shadowStage,
  canaryStage,
  promotionReadyStage,
  promote
} = require("./coordinator.cjs");
const { activateModel } = require("./model-promotion.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

const baseline = { tests: 1, quality: 0.7, reliability: 0.7, performance: 0.7, efficiency: 0.7 };
const stronger = { tests: 1, quality: 0.9, reliability: 0.9, performance: 0.8, efficiency: 0.8 };
const gates = {
  isolated: true,
  regressionFree: true,
  provenanceVerified: true,
  rollbackReady: true,
  freeProofVerified: true,
  licenseAllowed: true,
  criticalRegression: false
};

function verifiedModel() {
  const discovered = ingestDiscovery({
    provider: "Provider",
    model: "candidate-model",
    source: { url: "https://example.invalid/catalog", discoveredAt: "2026-09-13T00:00:00.000Z", sourceType: "provider-catalog" }
  });
  const proof = createVerifiedProof({
    proofClass: "FREE_API_TIER",
    evidence: [{ url: "https://example.invalid/official", observedAt: "2026-09-13T00:01:00.000Z", claim: "zero-cost tier", sourceType: "provider-official" }],
    verifiedAt: "2026-09-13T00:02:00.000Z",
    verifier: { id: "seven-free-proof-v1", method: "official-source-check" }
  });
  return applyVerifiedProof(discovered, proof);
}

function promotedCandidate(modelId) {
  const candidate = createCandidate({ id: `candidate-${modelId}`, kind: "model", source: "model-observatory", metadata: { modelId } });
  evaluateStage(candidate, { baseline, candidate: stronger, gates });
  shadowStage(candidate, { passed: true });
  canaryStage(candidate, { passed: true });
  promotionReadyStage(candidate, { canaryPassed: true, rollbackCheckpoint: true });
  promote(candidate, { approved: true, release: { target: "model-registry" } });
  return candidate;
}

pass("verified model cannot activate before evolution promotion", () => {
  const model = verifiedModel();
  const candidate = createCandidate({ id: "not-promoted", kind: "model", metadata: { modelId: model.id } });
  assert.throws(() => activateModel(model, candidate), /PROMOTED/);
});

pass("promotion candidate must be bound to the exact model", () => {
  const model = verifiedModel();
  const candidate = promotedCandidate("different-model-id");
  assert.throws(() => activateModel(model, candidate), /binding mismatch/);
});

pass("fully promoted and verified model can become active", () => {
  const model = verifiedModel();
  const candidate = promotedCandidate(model.id);
  const active = activateModel(model, candidate);
  assert.equal(active.status, "ACTIVE");
  assert.equal(active.lineage.sourceRecordId, model.id);
  assert.ok(active.lineage.transformation.includes(candidate.id));
});

pass("tampered candidate ledger blocks activation even after promotion", () => {
  const model = verifiedModel();
  const candidate = promotedCandidate(model.id);
  candidate.ledger = candidate.ledger.map((entry, index) => index === 0 ? { ...entry, payload: { altered: true } } : entry);
  assert.throws(() => activateModel(model, candidate), /ledger integrity failed/);
});

console.log("model promotion test suite: PASS");
