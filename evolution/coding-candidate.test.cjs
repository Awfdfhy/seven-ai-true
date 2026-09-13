"use strict";

const assert = require("assert/strict");
const { createExperiment } = require("./experiment-lab.cjs");
const { runCodingCandidate } = require("./coding-candidate.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function experiment() {
  return createExperiment({
    id: "coding-agent-fix",
    subsystem: "coding-agent",
    hypothesis: "candidate repair improves coding reliability",
    baselineRef: "aaaaaaa",
    candidateRef: "candidate-workspace",
    allowedPaths: ["seven_ai-final.html"]
  });
}

function fakeAgent(options = {}) {
  let stable = "aaaaaaa";
  let repairCalls = 0;
  const calls = [];
  return {
    calls,
    async getStableHeadSha() { calls.push(["getStableHeadSha", stable]); return stable; },
    async prepareCandidate() {
      calls.push(["prepareCandidate"]);
      if (options.prepareMutatesStable) stable = "ccccccc";
      return options.invalidIsolation
        ? { isolated: false, baselineSha: "aaaaaaa", workspaceId: "ws" }
        : { isolated: true, baselineSha: "aaaaaaa", workspaceId: "ws-1" };
    },
    async reproduce() { calls.push(["reproduce"]); return { reproduced: options.reproduced !== false }; },
    async repair({ attempt }) {
      repairCalls += 1;
      calls.push(["repair", attempt]);
      if (options.repairMutatesStable && repairCalls === 1) stable = "ccccccc";
      return { changed: options.changed !== false };
    },
    async review({ attempt }) {
      calls.push(["review", attempt]);
      if (options.reviewFirstFails && attempt === 1) return { approved: false };
      return { approved: options.reviewApproved !== false };
    },
    async regression({ attempt }) {
      calls.push(["regression", attempt]);
      if (options.regressionFirstFails && attempt === 1) return { passed: false };
      return { passed: options.regressionPassed !== false };
    },
    async getChangedPaths() {
      calls.push(["getChangedPaths"]);
      return options.changedPaths || ["seven_ai-final.html"];
    },
    async getCandidateSha() { calls.push(["getCandidateSha"]); return options.candidateSha || "bbbbbbb"; },
    async discardCandidate({ reason }) { calls.push(["discardCandidate", reason]); if (options.discardThrows) throw new Error("discard failed"); },
    async restoreStable({ baselineSha }) {
      calls.push(["restoreStable", baselineSha]);
      if (options.restoreThrows) throw new Error("restore failed");
      stable = baselineSha;
    }
  };
}

(async () => {
  await pass("safe isolated coding candidate completes without touching stable", async () => {
    const agent = fakeAgent();
    const result = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent });
    assert.equal(result.outcome, "PASS");
    assert.equal(result.candidateSha, "bbbbbbb");
    assert.deepEqual(result.changedPaths, ["seven_ai-final.html"]);
    assert.equal(agent.calls.some((call) => call[0] === "restoreStable"), false);
  });

  await pass("scope violation discards candidate before finalization", async () => {
    const agent = fakeAgent({ changedPaths: ["seven_ai-final.html", "evolution/gates.cjs"] });
    const result = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent });
    assert.equal(result.outcome, "REJECTED_SCOPE");
    assert.ok(result.scope.protectedChanges.includes("evolution/gates.cjs"));
    assert.ok(agent.calls.some((call) => call[0] === "discardCandidate"));
  });

  await pass("stable mutation during repair is restored then candidate is rejected", async () => {
    const agent = fakeAgent({ repairMutatesStable: true });
    const result = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent });
    assert.equal(result.outcome, "REJECTED_STABLE_MUTATION");
    assert.equal(result.stage, "REPAIR");
    assert.ok(agent.calls.some((call) => call[0] === "restoreStable"));
  });

  await pass("failed stable restoration halts instead of continuing", async () => {
    const agent = fakeAgent({ repairMutatesStable: true, restoreThrows: true });
    const result = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent });
    assert.equal(result.outcome, "HALT_STABLE_RESTORE_FAILED");
  });

  await pass("review failure can retry within bounded attempts", async () => {
    const agent = fakeAgent({ reviewFirstFails: true });
    const result = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent, maxAttempts: 2 });
    assert.equal(result.outcome, "PASS");
    assert.equal(result.attempts, 2);
    assert.equal(agent.calls.filter((call) => call[0] === "repair").length, 2);
  });

  await pass("invalid isolation proof rejects before reproduction", async () => {
    const agent = fakeAgent({ invalidIsolation: true });
    const result = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent });
    assert.equal(result.outcome, "REJECTED_ISOLATION");
    assert.equal(agent.calls.some((call) => call[0] === "reproduce"), false);
  });

  await pass("candidate SHA must differ from baseline and look commit-like", async () => {
    const same = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent: fakeAgent({ candidateSha: "aaaaaaa" }) });
    assert.equal(same.outcome, "REJECTED_CANDIDATE_SHA");
    const invalid = await runCodingCandidate({ experiment: experiment(), baselineSha: "aaaaaaa", agent: fakeAgent({ candidateSha: "not-a-sha" }) });
    assert.equal(invalid.outcome, "REJECTED_CANDIDATE_SHA");
  });

  console.log("coding candidate pipeline test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
