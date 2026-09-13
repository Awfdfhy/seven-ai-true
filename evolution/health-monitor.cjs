"use strict";

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function createHealthPolicy({
  minSamples = 3,
  minSuccessRate = 0.98,
  maxErrorRate = 0.02,
  maxLatencyRegression = 0.20,
  maxQualityRegression = 0.02
} = {}) {
  return Object.freeze({
    minSamples: Math.max(1, Math.min(100, Number(minSamples) || 3)),
    minSuccessRate: clamp01(minSuccessRate),
    maxErrorRate: clamp01(maxErrorRate),
    maxLatencyRegression: Math.max(0, Number(maxLatencyRegression) || 0),
    maxQualityRegression: Math.max(0, Number(maxQualityRegression) || 0)
  });
}

function normalizeSample(sample = {}) {
  return Object.freeze({
    successRate: clamp01(sample.successRate),
    errorRate: clamp01(sample.errorRate),
    latencyRegression: Math.max(0, Number(sample.latencyRegression) || 0),
    qualityRegression: Math.max(0, Number(sample.qualityRegression) || 0),
    critical: sample.critical === true,
    source: String(sample.source || "unknown")
  });
}

function average(samples, key) {
  return samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length;
}

function assessHealth(samples = [], policy = createHealthPolicy()) {
  const normalized = samples.map(normalizeSample);
  if (normalized.some((sample) => sample.critical)) {
    return { status: "ROLLBACK_REQUIRED", reason: "critical_signal", samples: normalized.length };
  }
  if (normalized.length < policy.minSamples) {
    return { status: "INSUFFICIENT_DATA", reason: "min_samples", samples: normalized.length };
  }

  const metrics = {
    successRate: average(normalized, "successRate"),
    errorRate: average(normalized, "errorRate"),
    latencyRegression: average(normalized, "latencyRegression"),
    qualityRegression: average(normalized, "qualityRegression")
  };
  const reasons = [];
  if (metrics.successRate < policy.minSuccessRate) reasons.push("success_rate");
  if (metrics.errorRate > policy.maxErrorRate) reasons.push("error_rate");
  if (metrics.latencyRegression > policy.maxLatencyRegression) reasons.push("latency_regression");
  if (metrics.qualityRegression > policy.maxQualityRegression) reasons.push("quality_regression");

  return {
    status: reasons.length ? "ROLLBACK_REQUIRED" : "HEALTHY",
    reason: reasons.join(",") || null,
    reasons,
    samples: normalized.length,
    metrics
  };
}

module.exports = { createHealthPolicy, normalizeSample, assessHealth };
