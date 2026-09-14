"use strict";

const assert = require("assert");
const {
  taskContract,
  truthFabric,
  contextCompiler,
  resourceGovernor,
  sideEffectLedger
} = require("./index.cjs");

(function taskContractTests(){
  const task = taskContract.createTaskContract({
    id: "t1",
    goal: "Safely patch Seven",
    risk: "high",
    allowedCapabilities: ["read", "patch", "test"],
    deniedCapabilities: ["delete"],
    evidence: { required: true, minIndependentSources: 1 },
    budgets: { toolCalls: 10 },
    verification: { checks: ["tests", "diff"] }
  });
  assert.equal(taskContract.canUseCapability(task, "patch").allowed, true);
  assert.equal(taskContract.canUseCapability(task, "delete").allowed, false);
  const planning = taskContract.transitionTask(task, "PLANNING");
  const executing = taskContract.transitionTask(planning, "EXECUTING");
  assert.equal(executing.state, "EXECUTING");
  assert.throws(() => taskContract.transitionTask(task, "BLOCKED"), /requires reason/);
  assert.equal(taskContract.transitionTask(task, "BLOCKED", { reason: "dependency-unavailable" }).transition.reason, "dependency-unavailable");
  assert.throws(() => taskContract.transitionTask(task, "COMPLETED"), /illegal task transition/);
})();

(function truthTests(){
  const sourceA = { id: "a", authority: "A1", independentGroup: "publisher-a", observedAt: new Date().toISOString() };
  const sourceB = { id: "b", authority: "A2", independentGroup: "publisher-b", observedAt: new Date().toISOString() };
  const fact = truthFabric.createClaim({ id: "c1", text: "Seven test fact", kind: "FACT", sources: [sourceA, sourceB, sourceA] });
  assert.equal(fact.sources.length, 2);
  assert.equal(fact.productionMode, "ASSERTED");
  assert.equal(truthFabric.resolveClaim(fact, { minIndependentSources: 2 }).state, "FACT");
  const derived = truthFabric.deriveClaim({ id: "c2", text: "Derived conclusion", parents: [fact], transformation: "summary" });
  assert.ok(truthFabric.AUTHORITY[derived.authority] <= truthFabric.AUTHORITY[fact.authority]);
  assert.equal(truthFabric.grantsAuthority(derived), false);
  const different = truthFabric.createClaim({ id: "c3", text: "Different but compatible assertion", sources: [sourceA] });
  assert.equal(truthFabric.mergeClaims([fact, different]).state, "CLAIM");
  const contradicted = truthFabric.createClaim({ id: "c4", text: "Explicit contrary assertion", sources: [sourceB], contradicts: [fact.id] });
  assert.equal(truthFabric.mergeClaims([fact, contradicted]).state, "CONFLICT");
  const unknownIndependence = truthFabric.createClaim({ id: "c5", text: "Unknown independence", sources: [{ id: "u1", authority: "A2" }, { id: "u2", authority: "A2" }] });
  assert.equal(truthFabric.independentSourceCount(unknownIndependence), 0);
  assert.equal(truthFabric.resolveClaim(unknownIndependence, { minIndependentSources: 1 }).state, "UNKNOWN");
})();

(function contextTests(){
  const compiled = contextCompiler.compileContext({
    maxTokens: 1000,
    reserveTokens: 100,
    items: [
      { id: "sys", category: "instructions", contextRole: "AUTHORITY_INSTRUCTION", trustedInstruction: true, authoritySource: "runtime", tokens: 100, pinned: true, content: "rules" },
      { id: "task", category: "task", tokens: 120, required: true, content: "goal" },
      { id: "old", category: "conversation", tokens: 700, priority: 0, content: "old" },
      { id: "ev", category: "evidence", tokens: 150, priority: 50, content: "evidence" },
      { id: "bad", category: "memory", tokens: 20, lifecycle: "deleted", content: "deleted" }
    ]
  });
  assert.equal(compiled.status, "PASS");
  assert.ok(compiled.tokensUsed <= compiled.tokenBudget);
  assert.ok(compiled.selected.some(x => x.id === "sys"));
  assert.ok(compiled.selected.some(x => x.id === "task"));
  assert.ok(!compiled.selected.some(x => x.id === "bad"));
  const messages = contextCompiler.buildModelMessages(compiled);
  assert.equal(messages.find(x => x.sevenContext.id === "sys").role, "system");
  assert.equal(messages.find(x => x.sevenContext.id === "task").role, "user");
})();

(function resourceTests(){
  assert.equal(resourceGovernor.selectTier({ deviceMemoryGb: 2, cores: 2 }), "lite");
  assert.equal(resourceGovernor.selectTier({ deviceMemoryGb: 8, cores: 8, batteryLevel: .8 }), "full");
  assert.equal(resourceGovernor.selectTier({ deviceMemoryGb: 8, cores: 8, batteryLevel: .8, reducedMotion: true }), "full");
  const lite = resourceGovernor.createBudget({ tier: "lite", baseContextTokens: 10000 });
  assert.ok(lite.contextTokens < 10000);
  const adaptedOnce = resourceGovernor.adaptBudget(lite, { deviceMemoryGb: 2, cores: 2 });
  const adaptedTwice = resourceGovernor.adaptBudget(adaptedOnce, { deviceMemoryGb: 2, cores: 2 });
  assert.equal(adaptedOnce.contextTokens, adaptedTwice.contextTokens);
  assert.equal(adaptedTwice.baseContextTokens, 10000);
  assert.equal(resourceGovernor.capabilityDecision("parallel-agents", { tier: "lite" }).allowed, false);
})();

(function ledgerTests(){
  const ledger = sideEffectLedger.createLedger();
  const planned = ledger.plan({ idempotencyKey: "write:file:1", capability: "write", reversible: true });
  assert.equal(planned.state, "PLANNED");
  ledger.mutate("write:file:1", "ATTEMPTED", { requestId: "req-1" });
  assert.throws(() => ledger.mutate("write:file:1", "VERIFIED", {}), /requires evidence/);
  const verified = ledger.mutate("write:file:1", "VERIFIED", { evidence: { sha: "abc" } });
  assert.equal(verified.state, "VERIFIED");
  assert.equal(ledger.unresolved().length, 0);
})();

console.log("hardening tests: PASS");