"use strict";

const { aggregateRuns } = require("./evals.cjs");
const { evaluateCandidate } = require("./gates.cjs");
const { verifyFreeProof } = require("./model-registry.cjs");

function licenseAllowed(record) {
  if (!record || !record.freeProof) return false;
  if (record.freeProof.class === "OPEN_WEIGHTS_LOCAL") return Boolean(record.freeProof.license);
  return true;
}

function evaluateModelCandidate({ baseline = {}, record, runs = [], gates = {} } = {}) {
  if (!record) throw new Error("model record required");
  if (!Array.isArray(runs) || runs.length === 0) throw new Error("benchmark runs required");

  const proof = verifyFreeProof(record);
  const metrics = aggregateRuns(runs);
  const hardGates = {
    ...gates,
    freeProofVerified: proof.valid,
    licenseAllowed: licenseAllowed(record)
  };
  const evaluation = evaluateCandidate({ baseline, candidate: metrics, gates: hardGates });

  return {
    modelId: record.id,
    provider: record.provider,
    model: record.model,
    metrics,
    freeProof: proof,
    evaluation,
    eligible: evaluation.pass === true
  };
}

function compareModels({ baseline = {}, candidates = [] } = {}) {
  const results = candidates.map((candidate) => evaluateModelCandidate({
    baseline,
    record: candidate.record,
    runs: candidate.runs,
    gates: candidate.gates
  }));

  const ranked = results
    .filter((result) => result.eligible)
    .sort((a, b) => {
      if (b.evaluation.candidateScore !== a.evaluation.candidateScore) {
        return b.evaluation.candidateScore - a.evaluation.candidateScore;
      }
      return a.modelId.localeCompare(b.modelId);
    });

  return {
    results,
    winner: ranked.length ? ranked[0] : null,
    rejected: results.filter((result) => !result.eligible)
  };
}

module.exports = { licenseAllowed, evaluateModelCandidate, compareModels };
