"use strict";

const assert = require("assert/strict");
const nodeControl = require("./index.cjs");
const browserControl = require("../release/control-runtime.js");
const research = require("../release/research-runtime.js");
const world = require("../release/world-runtime.js");

globalThis.SevenControl = browserControl;
globalThis.SevenPerformance = { state: { tier: "balanced", reducedMotion: false, longTasks: [] } };
delete require.cache[require.resolve("../release/control-bridge.js")];
const bridge = require("../release/control-bridge.js");

(function taskParity(){
  const input={id:"parity-task",goal:"Protect Seven",risk:"high",allowedCapabilities:["read","test"],deniedCapabilities:["delete"]};
  const node=nodeControl.taskContract.createTaskContract(input);
  const browser=browserControl.createTaskContract(input);
  for(const cap of ["read","test","delete","write"]){
    assert.deepEqual(browserControl.canUseCapability(browser,cap),nodeControl.taskContract.canUseCapability(node,cap),`capability parity: ${cap}`);
  }
  assert.equal(browserControl.transitionTask(browser,"PLANNING").state,nodeControl.taskContract.transitionTask(node,"PLANNING").state);
})();

(function truthParity(){
  const source={id:"source-a",authority:"A2",independentGroup:"publisher-a",observedAt:new Date().toISOString()};
  const n=nodeControl.truthFabric.createClaim({id:"claim-a",text:"fact",kind:"FACT",sources:[source]});
  const b=browserControl.createClaim({id:"claim-a",text:"fact",kind:"FACT",sources:[source]});
  assert.equal(browserControl.AUTH[b.authority],nodeControl.truthFabric.AUTHORITY[n.authority]);
  const nd=nodeControl.truthFabric.deriveClaim({id:"claim-b",text:"derived",parents:[n],transformation:"summary"});
  const bd=browserControl.deriveClaim({id:"claim-b",text:"derived",parents:[b],transformation:"summary"});
  assert.equal(browserControl.AUTH[bd.authority],nodeControl.truthFabric.AUTHORITY[nd.authority]);
  assert.equal(browserControl.resolveClaim(bd,{allowInference:false}).state,nodeControl.truthFabric.resolveClaim(nd,{allowInference:false}).state);
})();

(function contextParity(){
  const input={maxTokens:600,reserveTokens:50,items:[
    {id:"task",category:"task",tokens:100,required:true,content:"task"},
    {id:"evidence",category:"evidence",tokens:120,priority:100,content:"evidence"},
    {id:"deleted",category:"memory",tokens:20,lifecycle:"deleted",content:"bad"},
    {id:"large",category:"conversation",tokens:500,content:"large"}
  ]};
  const n=nodeControl.contextCompiler.compileContext(input);
  const b=browserControl.compileContext(input);
  assert.deepEqual(b.selected.map(x=>x.id),n.selected.map(x=>x.id));
  assert.equal(b.tokensUsed,n.tokensUsed);
  assert.equal(b.tokenBudget,n.tokenBudget);
})();

(function resourceParity(){
  for(const signals of [
    {deviceMemoryGb:2,cores:2,batteryLevel:.8},
    {deviceMemoryGb:8,cores:8,batteryLevel:.9},
    {deviceMemoryGb:4,cores:4,batteryLevel:.5},
    {deviceMemoryGb:8,cores:8,batteryLevel:.08}
  ]) assert.equal(browserControl.selectTier(signals),nodeControl.resourceGovernor.selectTier(signals));
  const n=nodeControl.resourceGovernor.createBudget({tier:"lite",baseContextTokens:12000,baseMemoryMb:300,baseToolCalls:20});
  const b=browserControl.createBudget({tier:"lite",baseContextTokens:12000,baseMemoryMb:300,baseToolCalls:20});
  for(const key of ["tier","baseContextTokens","baseMemoryMb","baseToolCalls","contextTokens","memoryMb","toolCalls","concurrency","verificationDepth"]) assert.equal(b[key],n[key],`budget parity: ${key}`);
})();

(function sideEffectParity(){
  const n=nodeControl.sideEffectLedger.createLedger();
  const b=browserControl.createSideEffectLedger();
  n.plan({id:"n",idempotencyKey:"write:x",reversible:true});
  b.plan({id:"b",idempotencyKey:"write:x",reversible:true});
  n.mutate("write:x","ATTEMPTED",{});b.mutate("write:x","ATTEMPTED",{});
  assert.throws(()=>n.mutate("write:x","VERIFIED",{}),/requires evidence/);
  assert.throws(()=>b.mutate("write:x","VERIFIED",{}),/requires evidence/);
  assert.equal(n.mutate("write:x","VERIFIED",{evidence:{sha:"x"}}).state,b.mutate("write:x","VERIFIED",{evidence:{sha:"x"}}).state);
})();

(function researchBridge(){
  const verification=research.verify(
    [{id:"c1",text:"supported"},{id:"c2",text:"gap"}],
    [{id:"s1",title:"Source",url:"https://example.com/a",authority:"A1",evidence:[{claimId:"c1",stance:"support",excerpt:"e"}]}]
  );
  const truth=bridge.researchVerificationToTruth(verification);
  assert.equal(truth.status,"INCONCLUSIVE");
  assert.equal(truth.claims.find(c=>c.id==="research:c1").kind,"FACT");
  assert.equal(truth.claims.find(c=>c.id==="research:c2").kind,"UNKNOWN");
  assert.ok(truth.unresolved.includes("research:c2"));
})();

(function worldBridge(){
  const work={id:"work",sources:[{id:"official",authority:"A0",url:"https://example.com/canon"}],beats:[
    {id:"verified",sourceRefs:["official"]},
    {id:"gap",sourceRefs:[]}
  ]};
  const engine=world.createEngine(work);
  const session=engine.createSession();
  const first=engine.sceneContract(session,{beatId:"verified"});
  assert.equal(bridge.worldContractTruth(first,engine.work).status,"PASS");
  const second=engine.sceneContract(session,{beatId:"gap"});
  assert.equal(bridge.worldContractTruth(second,engine.work).status,"CANON_GAP");
  const guard=bridge.guardCanonCommit({contract:second,work:engine.work,commitResult:{status:"CANON"}});
  assert.equal(guard.allowed,false);
  assert.equal(guard.status,"CANON_GAP");
})();

(function bridgeContext(){
  const task=browserControl.createTaskContract({id:"ctx",goal:"answer",allowedCapabilities:["read"]});
  const compiled=bridge.buildTaskContext({task,truth:[{id:"truth",kind:"FACT",text:"known",lineage:{source:"test"}}],conversation:[{id:"msg",content:"hello"}],maxTokens:1000});
  assert.ok(compiled.selected.some(x=>x.id==="task:ctx"));
  assert.ok(compiled.tokensUsed<=compiled.tokenBudget);
})();

console.log("control parity + bridge integration: PASS");
