"use strict";

const assert = require("assert/strict");
const {
  createObservation,
  ObservationBuffer,
  normalizeMetrics,
  normalizeMetadata
} = require("./self-development-observer.cjs");
const {
  aggregateWeaknesses,
  diagnoseWeakness,
  classifyChangeRisk,
  createImprovementProposal
} = require("./self-development-diagnosis.cjs");

function pass(name, fn) {
  fn();
  console.log("PASS", name);
}

function observation(overrides = {}) {
  return createObservation({
    timestamp: "2026-10-05T00:00:00.000Z",
    source: "seven-runtime",
    subsystem: "tools",
    kind: "tool_call",
    outcome: "ERROR",
    severity: "MEDIUM",
    runId: "run-1",
    metrics: { toolSuccess: 0, errorCount: 1, latencyMs: 120 },
    metadata: { errorClass: "schema_validation", toolId: "memory.search", stage: "execute" },
    evidenceRefs: ["trace:1"],
    ...overrides
  });
}

pass("observation records are content-minimized and deterministic", () => {
  const a = observation({ id: "obs-a", timestamp: "2026-10-05T00:00:00.000Z" });
  const b = observation({ id: "obs-b", timestamp: "2026-10-05T00:01:00.000Z" });
  assert.equal(a.fingerprint, b.fingerprint);
  assert.equal(a.metrics.toolSuccess, 0);
  assert.equal(a.metadata.toolId, "memory.search");
  assert.equal(Object.isFrozen(a), true);
});

pass("prompt, response and credential-shaped metadata are structurally rejected", () => {
  assert.throws(() => normalizeMetadata({ prompt: "hello" }), /forbidden telemetry metadata key/);
  assert.throws(() => normalizeMetadata({ responseContent: "hello" }), /forbidden telemetry metadata key/);
  assert.throws(() => normalizeMetadata({ provider: "ghp_abcdefghijklmnopqrstuvwxyz123456" }), /secret-like telemetry metadata rejected/);
  assert.throws(() => normalizeMetadata({ apiKey: "anything" }), /forbidden telemetry metadata key/);
});

pass("secret-like run identifiers and evidence references fail closed", () => {
  assert.throws(() => observation({ runId: "ghp_abcdefghijklmnopqrstuvwxyz123456" }), /secret-like identifier rejected/);
  assert.throws(() => observation({ evidenceRefs: ["sk-abcdefghijklmnopqrstuv"] }), /secret-like identifier rejected/);
});

pass("unknown, non-finite and out-of-range metrics fail closed", () => {
  assert.throws(() => normalizeMetrics({ mysteryMetric: 1 }), /unknown observation metric/);
  assert.throws(() => normalizeMetrics({ latencyMs: Infinity }), /non-finite observation metric/);
  assert.throws(() => normalizeMetrics({ qualityScore: 1.1 }), /out of range/);
  assert.throws(() => normalizeMetrics({ retryCount: -1 }), /out of range/);
});

pass("observation buffer is bounded and returns detached snapshots", () => {
  const buffer = new ObservationBuffer({ maxEntries: 10 });
  for (let i = 0; i < 12; i += 1) {
    buffer.append(observation({
      id: `obs-${i}`,
      timestamp: `2026-10-05T00:${String(i).padStart(2, "0")}:00.000Z`,
      requestId: `req-${i}`
    }));
  }
  assert.equal(buffer.size(), 10);
  const snapshot = buffer.snapshot();
  assert.equal(snapshot[0].id, "obs-2");
  snapshot[0].metrics.toolSuccess = 1;
  assert.equal(buffer.snapshot()[0].metrics.toolSuccess, 0);
});

pass("buffer revalidates caller-supplied records instead of trusting forged normalization flags", () => {
  const buffer = new ObservationBuffer({ maxEntries: 10 });
  assert.throws(() => buffer.append({
    schemaVersion: 1,
    fingerprint: "forged",
    id: "forged-record",
    timestamp: "2026-10-05T00:00:00Z",
    source: "seven-runtime",
    subsystem: "tools",
    kind: "tool_call",
    outcome: "ERROR",
    severity: "MEDIUM",
    metrics: { toolSuccess: 0 },
    metadata: { prompt: "this must never enter telemetry" },
    evidenceRefs: []
  }), /forbidden telemetry metadata key/);
  assert.equal(buffer.size(), 0);
});

pass("successful observations do not become weakness clusters", () => {
  const rows = [
    createObservation({
      timestamp: "2026-10-05T00:00:00Z",
      source: "seven-runtime",
      subsystem: "model-routing",
      kind: "route",
      outcome: "PASS",
      severity: "INFO",
      metrics: { taskSuccess: 1, latencyMs: 80 },
      metadata: { route: "auto" }
    })
  ];
  assert.deepEqual(aggregateWeaknesses(rows), []);
});

pass("repeated coherent failures aggregate deterministically", () => {
  const rows = [
    observation({ id: "a", timestamp: "2026-10-05T00:00:00Z" }),
    observation({ id: "b", timestamp: "2026-10-05T00:01:00Z", runId: "run-2" }),
    observation({ id: "c", timestamp: "2026-10-05T00:02:00Z", runId: "run-3" })
  ];
  const clusters = aggregateWeaknesses(rows);
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].count, 3);
  assert.equal(clusters[0].subsystem, "tools");
  assert.equal(clusters[0].metrics.toolSuccess, 0);
  assert.deepEqual(clusters[0].observationIds, ["a", "b", "c"]);
});

pass("diagnosis stays a hypothesis even with repeated evidence", () => {
  const cluster = aggregateWeaknesses([
    observation({ id: "a" }),
    observation({ id: "b", timestamp: "2026-10-05T00:01:00Z" }),
    observation({ id: "c", timestamp: "2026-10-05T00:02:00Z" })
  ])[0];
  const diagnosis = diagnoseWeakness(cluster);
  assert.equal(diagnosis.causalStatus, "HYPOTHESIS");
  assert.equal(diagnosis.evidenceSufficientForPlanning, true);
  assert.equal(diagnosis.hypotheses[0].family, "tool_selection_or_execution");
  assert.ok(diagnosis.confidence > 0.5);
});

pass("single critical crash can escalate without pretending causal certainty", () => {
  const crash = createObservation({
    id: "crash-1",
    timestamp: "2026-10-05T00:03:00Z",
    source: "seven-runtime",
    subsystem: "core-runtime",
    kind: "crash",
    outcome: "ERROR",
    severity: "CRITICAL",
    metrics: { crash: 1, errorCount: 1 },
    metadata: { errorClass: "fatal_runtime", stage: "controller" }
  });
  const diagnosis = diagnoseWeakness(aggregateWeaknesses([crash])[0], { minEvidence: 3 });
  assert.equal(diagnosis.evidenceSufficientForPlanning, true);
  assert.equal(diagnosis.causalStatus, "HYPOTHESIS");
  assert.equal(diagnosis.hypotheses[0].family, "runtime_stability");
});

pass("insufficient non-critical evidence blocks planning", () => {
  const cluster = aggregateWeaknesses([observation({ id: "one", severity: "LOW" })])[0];
  const diagnosis = diagnoseWeakness(cluster, { minEvidence: 2 });
  assert.equal(diagnosis.evidenceSufficientForPlanning, false);
  assert.ok(diagnosis.missingEvidence.length > 0);
});

pass("risk policy is conservative and protects evaluator/self-development plane", () => {
  assert.equal(classifyChangeRisk({ changeClass: "prompt", targetPaths: ["release/prompts/chat.txt"] }).level, "LOW");
  assert.equal(classifyChangeRisk({ changeClass: "routing", targetPaths: ["release/router.js"] }).level, "MEDIUM");
  assert.equal(classifyChangeRisk({ changeClass: "shared_contract", targetPaths: ["release/runtime-contract.js"] }).level, "HIGH");
  assert.equal(classifyChangeRisk({ changeClass: "prompt", targetPaths: ["evolution/gates.cjs"] }).level, "CRITICAL");
  assert.equal(classifyChangeRisk({ changeClass: "unknown-new-class", targetPaths: ["release/new.js"] }).level, "HIGH");
});

pass("proposal cannot route protected-plane edits into ordinary Coding System execution", () => {
  const diagnosis = diagnoseWeakness(aggregateWeaknesses([
    observation({ id: "a" }),
    observation({ id: "b", timestamp: "2026-10-05T00:01:00Z" })
  ])[0]);

  const safe = createImprovementProposal({
    id: "proposal-safe",
    diagnosis,
    baselineSha: "abcdef1234567",
    changeClass: "tool_selection",
    allowedPaths: ["release/router.js"],
    affectedSystems: ["Tools", "Model Routing"],
    expectedEffects: { toolSuccess: "increase" },
    validationPlan: ["tool fixtures", "regression suite"]
  });
  assert.equal(safe.codingEligible, true);
  assert.equal(safe.decision, "READY_FOR_CODING_SYSTEM");
  assert.equal(safe.risk.level, "MEDIUM");

  const protectedProposal = createImprovementProposal({
    id: "proposal-protected",
    diagnosis,
    baselineSha: "abcdef1234567",
    changeClass: "prompt",
    allowedPaths: ["evolution/gates.cjs"],
    affectedSystems: ["Self-Development"],
    validationPlan: ["mutation tests"]
  });
  assert.equal(protectedProposal.codingEligible, false);
  assert.equal(protectedProposal.decision, "GOVERNANCE_REQUIRED");
  assert.equal(protectedProposal.risk.level, "CRITICAL");
  assert.deepEqual(protectedProposal.protectedPaths, ["evolution/gates.cjs"]);
});

pass("self-development phase 1 exports no production mutation capability", () => {
  const observer = require("./self-development-observer.cjs");
  const diagnosis = require("./self-development-diagnosis.cjs");
  const forbidden = ["writeFile", "commit", "merge", "applyPatch", "executeShell", "githubApi", "promote"];
  for (const key of forbidden) {
    assert.equal(Object.prototype.hasOwnProperty.call(observer, key), false);
    assert.equal(Object.prototype.hasOwnProperty.call(diagnosis, key), false);
  }
});

console.log("self-development foundation test suite: PASS");
