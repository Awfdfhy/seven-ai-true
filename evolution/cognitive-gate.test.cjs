"use strict";

const assert = require("assert/strict");
const { createClaim, addEvidence } = require("./cognitive-boost.cjs");
const { runCognitivePreflight } = require("./cognitive-gate.cjs");

(async () => {
  let count = 0;
  const check = (name, condition) => { assert.ok(condition, name); count += 1; console.log("PASS", name); };

  const low = await runCognitivePreflight({
    candidate: { id: "low" },
    context: { task: { complexity: 0.1, risk: 0.1 } }
  });
  check("low-risk task can pass without arena", low.pass === true && low.computeTier === "FAST");

  const missingArena = await runCognitivePreflight({
    candidate: { id: "high" },
    context: { task: { complexity: 1, risk: 1, longHorizon: 1 }, risk: 1 }
  });
  check("high-risk task fails closed when arena is unavailable", missingArena.pass === false && missingArena.reasons.includes("arena_required_but_unavailable"));

  const cleanArena = {
    critic: async () => ({ findings: [] }),
    attacker: async () => ({ findings: [] }),
    judge: async () => ({ verified: true, pass: true })
  };
  const highPass = await runCognitivePreflight({
    candidate: { id: "high-clean" },
    context: { task: { complexity: 1, risk: 1, longHorizon: 1 }, risk: 1 },
    arenaAdapter: cleanArena
  });
  check("high-risk task can pass only through verified clean arena", highPass.pass === true && highPass.arena && highPass.arena.passed === true);

  let contested = createClaim({ text: "contested fact" });
  contested = addEvidence(contested, { id: "s", sourceTrust: 1, verified: true, stance: "SUPPORT" });
  contested = addEvidence(contested, { id: "c", sourceTrust: 1, verified: true, stance: "CONTRADICT" });
  const truthFail = await runCognitivePreflight({
    candidate: { id: "truth" },
    context: { task: { complexity: 0.2 }, claims: [contested] }
  });
  check("contested truth blocks preflight", truthFail.pass === false && truthFail.reasons.includes("truth_contested"));

  const trustFail = await runCognitivePreflight({
    candidate: { id: "trust" },
    context: {
      task: { complexity: 0.2 },
      requiresAuthority: true,
      trustInputs: [{ id: "web", trust: "EXTERNAL" }]
    }
  });
  check("external taint cannot authorize authority-sensitive action", trustFail.pass === false && trustFail.reasons.includes("authority_flow_blocked"));

  console.log(`cognitive gate test suite: PASS (${count} assertions)`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
