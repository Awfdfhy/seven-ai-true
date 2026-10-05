"use strict";

const DEFINITIONS = Object.freeze({
  testsPass: Object.freeze({
    id: "testsPass",
    domain: "verification",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 1,
    minImprovement: 0.000001,
    regressionTolerance: 0,
    maxCv: null,
    hardConstraint: Object.freeze({ min: 1 })
  }),
  regressionCount: Object.freeze({
    id: "regressionCount",
    domain: "verification",
    direction: "LOWER_IS_BETTER",
    unit: "count",
    min: 0,
    minSamples: 1,
    minImprovement: 1,
    regressionTolerance: 0,
    maxCv: null,
    hardConstraint: Object.freeze({ max: 0 })
  }),
  crashRate: Object.freeze({
    id: "crashRate",
    domain: "reliability",
    direction: "LOWER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 1,
    minImprovement: 0.005,
    regressionTolerance: 0,
    maxCv: null,
    hardConstraint: Object.freeze({ max: 0 })
  }),
  taskSuccess: Object.freeze({
    id: "taskSuccess",
    domain: "quality",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.50
  }),
  qualityScore: Object.freeze({
    id: "qualityScore",
    domain: "quality",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.35
  }),
  reliabilityScore: Object.freeze({
    id: "reliabilityScore",
    domain: "reliability",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.01,
    regressionTolerance: 0.01,
    maxCv: 0.35
  }),
  errorRate: Object.freeze({
    id: "errorRate",
    domain: "reliability",
    direction: "LOWER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.01,
    regressionTolerance: 0.01,
    maxCv: 0.60
  }),
  p50LatencyMs: Object.freeze({
    id: "p50LatencyMs",
    domain: "latency",
    direction: "LOWER_IS_BETTER",
    unit: "ms",
    min: 0,
    minSamples: 3,
    minImprovement: 10,
    regressionTolerance: 20,
    maxCv: 0.60
  }),
  p90LatencyMs: Object.freeze({
    id: "p90LatencyMs",
    domain: "latency",
    direction: "LOWER_IS_BETTER",
    unit: "ms",
    min: 0,
    minSamples: 3,
    minImprovement: 20,
    regressionTolerance: 40,
    maxCv: 0.70
  }),
  firstTokenMs: Object.freeze({
    id: "firstTokenMs",
    domain: "latency",
    direction: "LOWER_IS_BETTER",
    unit: "ms",
    min: 0,
    minSamples: 3,
    minImprovement: 10,
    regressionTolerance: 20,
    maxCv: 0.70
  }),
  totalTokens: Object.freeze({
    id: "totalTokens",
    domain: "efficiency",
    direction: "LOWER_IS_BETTER",
    unit: "tokens",
    min: 0,
    minSamples: 3,
    minImprovement: 25,
    regressionTolerance: 50,
    maxCv: 0.60
  }),
  costEstimateUsd: Object.freeze({
    id: "costEstimateUsd",
    domain: "efficiency",
    direction: "LOWER_IS_BETTER",
    unit: "usd",
    min: 0,
    minSamples: 3,
    minImprovement: 0.001,
    regressionTolerance: 0.002,
    maxCv: 0.60
  }),
  toolSuccessRate: Object.freeze({
    id: "toolSuccessRate",
    domain: "tools",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.50
  }),
  toolHallucinationRate: Object.freeze({
    id: "toolHallucinationRate",
    domain: "tools",
    direction: "LOWER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.01,
    regressionTolerance: 0.01,
    maxCv: 0.60
  }),
  searchEvidenceCoverage: Object.freeze({
    id: "searchEvidenceCoverage",
    domain: "research",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.40
  }),
  memoryRecall: Object.freeze({
    id: "memoryRecall",
    domain: "memory",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.40
  }),
  memoryPrecision: Object.freeze({
    id: "memoryPrecision",
    domain: "memory",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.40
  }),
  memoryAbstentionAccuracy: Object.freeze({
    id: "memoryAbstentionAccuracy",
    domain: "memory",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.40
  }),
  routingTaskSuccess: Object.freeze({
    id: "routingTaskSuccess",
    domain: "routing",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.02,
    maxCv: 0.45
  }),
  uiErrorRate: Object.freeze({
    id: "uiErrorRate",
    domain: "ui",
    direction: "LOWER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.01,
    regressionTolerance: 0.01,
    maxCv: 0.60
  }),
  stateRecoveryRate: Object.freeze({
    id: "stateRecoveryRate",
    domain: "recovery",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.01,
    maxCv: 0.40
  }),
  mutationKillRate: Object.freeze({
    id: "mutationKillRate",
    domain: "tests",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.01,
    maxCv: 0.30
  }),
  regressionDetectionRate: Object.freeze({
    id: "regressionDetectionRate",
    domain: "tests",
    direction: "HIGHER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.02,
    regressionTolerance: 0.01,
    maxCv: 0.30
  }),
  flakinessRate: Object.freeze({
    id: "flakinessRate",
    domain: "tests",
    direction: "LOWER_IS_BETTER",
    unit: "ratio",
    min: 0,
    max: 1,
    minSamples: 3,
    minImprovement: 0.005,
    regressionTolerance: 0.005,
    maxCv: 0.80,
    hardConstraint: Object.freeze({ max: 0.05 })
  })
});

function cloneDefinition(definition) {
  if (!definition) return null;
  return Object.freeze({
    ...definition,
    hardConstraint: definition.hardConstraint
      ? Object.freeze({ ...definition.hardConstraint })
      : undefined
  });
}

function getMetricDefinition(id) {
  const key = String(id || "");
  const definition = DEFINITIONS[key];
  if (!definition) throw new Error(`unknown self-development metric: ${key}`);
  return cloneDefinition(definition);
}

function listMetricDefinitions() {
  return Object.freeze(Object.keys(DEFINITIONS).sort().map((id) => getMetricDefinition(id)));
}

function validateMetricValue(id, raw) {
  const definition = DEFINITIONS[String(id || "")];
  if (!definition) throw new Error(`unknown self-development metric: ${id}`);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`non-finite metric value: ${id}`);
  if (definition.min !== undefined && value < definition.min) throw new Error(`metric below minimum: ${id}`);
  if (definition.max !== undefined && value > definition.max) throw new Error(`metric above maximum: ${id}`);
  return value;
}

module.exports = {
  getMetricDefinition,
  listMetricDefinitions,
  validateMetricValue
};
