"use strict";

const assert = require("assert/strict");
const { createUpdateTransaction } = require("./update-transaction.cjs");
const { executePromotion } = require("./promotion-runner.cjs");

async function pass(name, fn) {
  await fn();
  console.log("PASS", name);
}

function fakeAdapter({ baseline = "aaaaaaa", candidate = "bbbbbbb", verify = { ciPassed: true, regressionFree: true }, applyThrows = false, rollbackThrows = false, drift = false } = {}) {
  let head = drift ? "ccccccc" : baseline;
  const calls = [];
  return {
    calls,
    async getHeadSha() {
      calls.push(["getHeadSha", head]);
      return head;
    },
    async applyCandidate({ candidateSha, expectedBaseSha }) {
      calls.push(["applyCandidate", candidateSha, expectedBaseSha]);
      if (head !== expectedBaseSha) throw new Error("adapter base mismatch");
      head = candidate;
      if (applyThrows) throw new Error("apply exploded after side effect");
      return head;
    },
    async verifyCandidate() {
      calls.push(["verifyCandidate"]);
      if (verify instanceof Error) throw verify;
      return verify;
    },
    async rollbackTo({ rollbackSha }) {
      calls.push(["rollbackTo", rollbackSha]);
      if (rollbackThrows) throw new Error("rollback failed");
      head = rollbackSha;
      return head;
    }
  };
}

function tx(id = "tx") {
  return createUpdateTransaction({ id, experimentId: "exp", baselineSha: "aaaaaaa", candidateSha: "bbbbbbb" });
}

(async () => {
  await pass("happy path commits only after adapter verification", async () => {
    const adapter = fakeAdapter();
    const result = await executePromotion({ transaction: tx("happy"), experimentPass: true, adapter });
    assert.equal(result.outcome, "COMMITTED");
    assert.equal(result.transaction.state, "COMMITTED");
    assert.ok(adapter.calls.some((call) => call[0] === "verifyCandidate"));
    assert.equal(adapter.calls.some((call) => call[0] === "rollbackTo"), false);
  });

  await pass("base drift blocks apply entirely", async () => {
    const adapter = fakeAdapter({ drift: true });
    await assert.rejects(() => executePromotion({ transaction: tx("drift"), experimentPass: true, adapter }), /base drift detected/);
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  await pass("verification failure automatically restores baseline", async () => {
    const adapter = fakeAdapter({ verify: { ciPassed: false, regressionFree: true } });
    const result = await executePromotion({ transaction: tx("verify-fail"), experimentPass: true, adapter });
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.equal(result.transaction.state, "ROLLED_BACK");
    assert.ok(adapter.calls.some((call) => call[0] === "rollbackTo"));
  });

  await pass("verification exception automatically restores baseline", async () => {
    const adapter = fakeAdapter({ verify: new Error("CI unavailable") });
    const result = await executePromotion({ transaction: tx("verify-error"), experimentPass: true, adapter });
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.equal(result.transaction.state, "ROLLED_BACK");
    assert.match(result.verifyError, /CI unavailable/);
  });

  await pass("uncertain apply exception triggers rollback even before applied state is confirmed", async () => {
    const adapter = fakeAdapter({ applyThrows: true });
    const result = await executePromotion({ transaction: tx("apply-error"), experimentPass: true, adapter });
    assert.equal(result.outcome, "ROLLED_BACK");
    assert.equal(result.transaction.state, "ROLLED_BACK");
    assert.match(result.applyError, /apply exploded/);
  });

  await pass("rollback failure never gets misreported as success", async () => {
    const adapter = fakeAdapter({ verify: { ciPassed: false, regressionFree: false }, rollbackThrows: true });
    const result = await executePromotion({ transaction: tx("rollback-fail"), experimentPass: true, adapter });
    assert.equal(result.outcome, "ROLLBACK_FAILED");
    assert.equal(result.transaction.state, "ROLLBACK_REQUIRED");
    assert.match(result.rollbackError, /rollback failed/);
  });

  await pass("failed experiment gate blocks apply before any mutation", async () => {
    const adapter = fakeAdapter();
    await assert.rejects(() => executePromotion({ transaction: tx("gate-fail"), experimentPass: false, adapter }), /experiment gate did not pass/);
    assert.equal(adapter.calls.some((call) => call[0] === "applyCandidate"), false);
  });

  console.log("promotion runner test suite: PASS");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
