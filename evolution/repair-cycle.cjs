"use strict";

const STAGES = Object.freeze(["REPRODUCE", "REPAIR", "REVIEW", "REGRESSION_GATE", "COMPLETE"]);

function createRepairCycle({ issueId, maxAttempts = 3 } = {}) {
  if (!issueId) throw new Error("issueId required");
  const limit = Math.max(1, Math.min(10, Number(maxAttempts) || 3));
  return {
    issueId: String(issueId),
    stage: "REPRODUCE",
    attempt: 1,
    maxAttempts: limit,
    history: []
  };
}

function record(cycle, action, data = {}) {
  cycle.history.push(Object.freeze({
    index: cycle.history.length + 1,
    stage: cycle.stage,
    action,
    data: { ...data }
  }));
}

function advanceRepairCycle(cycle, result = {}) {
  if (!cycle || cycle.stage === "COMPLETE") throw new Error("repair cycle is complete or invalid");

  if (cycle.stage === "REPRODUCE") {
    record(cycle, "reproduce", result);
    if (result.reproduced !== true) return { ...cycle, outcome: "STOP_NOT_REPRODUCED" };
    cycle.stage = "REPAIR";
    return cycle;
  }

  if (cycle.stage === "REPAIR") {
    record(cycle, "repair", result);
    if (result.changed !== true) return { ...cycle, outcome: "STOP_NO_CHANGE" };
    cycle.stage = "REVIEW";
    return cycle;
  }

  if (cycle.stage === "REVIEW") {
    record(cycle, "review", result);
    if (result.approved !== true) {
      if (cycle.attempt >= cycle.maxAttempts) return { ...cycle, outcome: "REJECT_MAX_ATTEMPTS" };
      cycle.attempt += 1;
      cycle.stage = "REPAIR";
      return cycle;
    }
    cycle.stage = "REGRESSION_GATE";
    return cycle;
  }

  if (cycle.stage === "REGRESSION_GATE") {
    record(cycle, "regression_gate", result);
    if (result.passed !== true) {
      if (cycle.attempt >= cycle.maxAttempts) return { ...cycle, outcome: "REJECT_REGRESSION" };
      cycle.attempt += 1;
      cycle.stage = "REPAIR";
      return cycle;
    }
    cycle.stage = "COMPLETE";
    return { ...cycle, outcome: "PASS" };
  }

  throw new Error(`unknown repair stage: ${cycle.stage}`);
}

module.exports = { STAGES, createRepairCycle, advanceRepairCycle };
