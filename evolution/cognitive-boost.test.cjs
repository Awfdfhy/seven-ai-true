"use strict";

const assert = require("assert/strict");
const {
  allocateCompute,
  createClaim,
  addEvidence,
  assessClaim,
  createMission,
  nextMissionTasks,
  updateMissionTask,
  distillSkill,
  activateSkill,
  recordRouteOutcome,
  chooseRoute,
  propagateTrust,
  canInfluenceAuthority,
  runAdversarialArena,
  buildCognitiveDecision
} = require("./cognitive-boost.cjs");

let count = 0;
function test(name, fn) {
  const result = fn();
  assert.ok(result !== false, name);
  count += 1;
  console.log("PASS", name);
}

(async () => {
  test("adaptive compute keeps trivial tasks fast", () => allocateCompute({ complexity: 0.05 }).tier === "FAST");
  test("adaptive compute escalates difficult risky long-horizon tasks", () => {
    const plan = allocateCompute({ complexity: 1, risk: 1, freshnessNeed: 1, toolDepth: 1, longHorizon: 1, recentFailureRate: 1 });
    return plan.tier === "EXTREME" && plan.maxCandidates === 6 && plan.verifierPasses === 3;
  });

  let claim = createClaim({ text: "A current fact", freshnessSensitive: true });
  claim = addEvidence(claim, { id: "a", source: "official-a", sourceTrust: 1, verified: true, stance: "SUPPORT", excerpt: "yes" });
  test("fresh claims request more than one verified source", () => assessClaim(claim).needsMoreEvidence === true);
  claim = addEvidence(claim, { id: "b", source: "official-b", sourceTrust: 1, verified: true, stance: "CONTRADICT", excerpt: "no" });
  test("truth engine surfaces direct contradiction instead of averaging it away", () => {
    const result = assessClaim(claim);
    return result.status === "CONTESTED" && result.contradiction && result.confidence === 0;
  });

  let mission = createMission({
    goal: "ship safely",
    budget: { maxCost: 5 },
    tasks: [
      { id: "inspect", cost: 1, definitionOfDone: "understood" },
      { id: "edit", cost: 2, dependsOn: ["inspect"], definitionOfDone: "patched" },
      { id: "verify", cost: 2, dependsOn: ["edit"], definitionOfDone: "green" }
    ]
  });
  test("mission planner exposes only dependency-ready work", () => nextMissionTasks(mission).map(x => x.id).join(",") === "inspect");
  assert.throws(() => updateMissionTask(mission, "edit", "DONE"), /dependencies/);
  count += 1; console.log("PASS mission planner cannot skip dependencies");
  mission = updateMissionTask(mission, "inspect", "DONE");
  test("mission planner unlocks the next task after checkpoint", () => nextMissionTasks(mission)[0].id === "edit");
  assert.throws(() => createMission({ goal: "cycle", tasks: [{ id: "a", dependsOn: ["b"] }, { id: "b", dependsOn: ["a"] }] }), /cycle/);
  count += 1; console.log("PASS mission planner rejects dependency cycles");

  assert.throws(() => distillSkill({ name: "weak", trigger: "x", procedure: ["do"], provenance: ["run-1"], evalResult: { verified: true, score: 0.79 } }), /0.8/);
  count += 1; console.log("PASS skill distillation rejects under-evaluated experience");
  const skill = distillSkill({ name: "repair-js", trigger: "js regression", procedure: ["reproduce", "patch", "test"], knownFailures: ["scope drift"], provenance: ["run-1"], evalResult: { verified: true, score: 0.92, verifier: "seven-evals" } });
  assert.throws(() => activateSkill(skill, { verified: true, regressionFree: false, provenanceValid: true }), /gate failed/);
  count += 1; console.log("PASS skill cannot activate with regression");
  test("verified skill can activate after all gates", () => activateSkill(skill, { verified: true, regressionFree: true, provenanceValid: true }).active === true);

  let routes = {};
  routes = recordRouteOutcome(routes, { taskClass: "coding", modelId: "m1", reward: 0.95, success: true, verified: true });
  routes = recordRouteOutcome(routes, { taskClass: "coding", modelId: "m2", reward: 0.3, success: false, verified: true });
  const before = JSON.stringify(routes);
  routes = recordRouteOutcome(routes, { taskClass: "coding", modelId: "m2", reward: 1, success: true, verified: false });
  test("router ignores unverified outcomes", () => JSON.stringify(routes) === before);
  test("adaptive router learns from verified outcomes", () => chooseRoute(routes, { taskClass: "coding", candidates: [{ modelId: "m1" }, { modelId: "m2" }] }).selected === "m1");

  const flow = propagateTrust([{ id: "system", trust: "SYSTEM" }, { id: "web", trust: "EXTERNAL" }], { outputTrust: "SYSTEM" });
  test("derived content cannot raise authority above its weakest source", () => flow.trust === "EXTERNAL" && flow.tainted === true);
  test("tainted external content cannot authorize user-level side effects", () => canInfluenceAuthority(flow, "USER") === false);
  const verifiedFlow = propagateTrust([{ id: "user", trust: "USER" }, { id: "verified", trust: "VERIFIED" }]);
  test("sufficiently trusted flow can influence authority", () => canInfluenceAuthority(verifiedFlow, "USER") === true);

  const safeArena = await runAdversarialArena({
    candidate: { id: "candidate-safe" },
    critic: async () => ({ findings: [] }),
    attacker: async () => ({ findings: [] }),
    judge: async () => ({ verified: true, pass: true })
  });
  test("adversarial arena passes only verified clean candidate", () => safeArena.passed === true && safeArena.evidenceId.startsWith("arena-"));

  const blockedArena = await runAdversarialArena({
    candidate: { id: "candidate-bad" },
    critic: async () => ({ findings: [{ severity: "CRITICAL", type: "regression" }] }),
    attacker: async () => ({ findings: [] }),
    judge: async () => ({ verified: true, pass: true })
  });
  test("critical finding overrides a permissive judge", () => blockedArena.passed === false && blockedArena.criticalFindings.length === 1);

  const decision = buildCognitiveDecision({
    task: { taskClass: "coding", complexity: 0.9, risk: 0.8, longHorizon: 0.8 },
    claims: [claim],
    mission,
    routeState: routes,
    routeCandidates: [{ modelId: "m1" }, { modelId: "m2" }],
    trustInputs: [{ id: "web", trust: "EXTERNAL" }]
  });
  test("cognitive decision combines compute truth planning routing and trust", () => {
    return decision.compute.tier !== "FAST" && decision.truthBlocked === true && decision.route.selected === "m1" && decision.mayUseAuthorityTools === false;
  });

  console.log(`cognitive boost test suite: PASS (${count} assertions)`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
