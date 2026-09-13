"use strict";

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value || 0)));
}

function score(metrics = {}) {
  const weights = { tests: 0.45, quality: 0.20, reliability: 0.20, performance: 0.10, efficiency: 0.05 };
  let total = 0;
  for (const [key, weight] of Object.entries(weights)) total += clamp01(metrics[key]) * weight;
  return Number(total.toFixed(6));
}

function evaluate({ baseline = {}, candidate = {}, required = [] } = {}) {
  const missing = required.filter((key) => candidate[key] === undefined);
  const baselineScore = score(baseline);
  const candidateScore = score(candidate);
  const testsPass = Number(candidate.tests || 0) === 1;
  const pass = missing.length === 0 && testsPass && candidateScore >= baselineScore;
  return {
    baselineScore,
    candidateScore,
    delta: Number((candidateScore - baselineScore).toFixed(6)),
    missing,
    testsPass,
    pass,
    decision: pass ? "PROMOTE" : "REJECT"
  };
}

module.exports = { score, evaluate };
