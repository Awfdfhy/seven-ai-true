"use strict";

const { evaluateCandidate } = require("./gates.cjs");

function normalizeMetric(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function aggregateRuns(runs = []) {
  if (!Array.isArray(runs) || runs.length === 0) throw new Error("at least one eval run required");
  const keys = ["tests", "quality", "reliability", "performance", "efficiency"];
  const metrics = {};
  for (const key of keys) {
    const values = runs.map((run) => normalizeMetric(run[key]));
    metrics[key] = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(6));
  }
  return metrics;
}

function evaluateMany({ baseline = {}, candidates = [] } = {}) {
  return candidates.map((entry) => {
    const metrics = entry.metrics || aggregateRuns(entry.runs || []);
    const evaluation = evaluateCandidate({
      baseline,
      candidate: metrics,
      gates: entry.gates || {}
    });
    return {
      id: String(entry.id),
      metrics,
      evaluation,
      eligible: evaluation.pass === true
    };
  });
}

function rankCandidates(results = []) {
  return [...results]
    .filter((item) => item.eligible)
    .sort((a, b) => {
      if (b.evaluation.candidateScore !== a.evaluation.candidateScore) {
        return b.evaluation.candidateScore - a.evaluation.candidateScore;
      }
      if (b.evaluation.delta !== a.evaluation.delta) return b.evaluation.delta - a.evaluation.delta;
      return a.id.localeCompare(b.id);
    });
}

function selectWinner(input) {
  const results = evaluateMany(input);
  const ranked = rankCandidates(results);
  return {
    results,
    winner: ranked.length ? ranked[0] : null,
    rejected: results.filter((item) => !item.eligible)
  };
}

module.exports = { normalizeMetric, aggregateRuns, evaluateMany, rankCandidates, selectWinner };
