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
  assert.throws(()=>browserControl.transitionTask(browser,"BLOCKED"),/requires reason/);
  assert.throws(()=>nodeControl.taskContract.transitionTask(node,"BLOCKED"),/requires reason/);
  assert.equal(browserControl.transitionTask(browser,"BLOCKED",{reason:"waiting"}).transition.reason,nodeControl.taskContract.transitionTask(node,"BLOCKED",{reason:"waiting"}).transition.reason);
})();

(function truthParity(){
  const observedAt=new Date().toISOString();
  const source={id:"source-a",authority:"A2",independentGroup:"publisher-a",observedAt,metadata:{title:"Primary source"}};
  const input={id:"claim-a",text:"fact",kind:"FACT",sources:[source,source],metadata:{domain:"parity"},evidence:[{id:"e1"}],supports:["claim-z"]};
  const n=nodeControl.truthFabric.createClaim(input);
  const b=browserControl.createClaim(input);
  assert.equal(browserControl.AUTH[b.authority],nodeControl.truthFabric.AUTHORITY[n.authority]);
  assert.equal(b.productionMode,n.productionMode);
  assert.equal(b.sources.length,n.sources.length);
  assert.deepEqual(b.metadata,n.metadata);
  assert.deepEqual(b.sources[0].metadata,n.sources[0].metadata);
  assert.deepEqual(b.evidence,n.evidence);
  assert.deepEqual(b.supports,n.supports);
  const nd=nodeControl.truthFabric.deriveClaim({id:"claim-b",text:"derived",parents:[n],transformation:"summary"});
  const bd=browserControl.deriveClaim({id:"claim-b",text:"derived",parents:[b],transformation:"summary"});
  assert.equal(browserControl.AUTH[bd.authority],nodeControl.truthFabric.AUTHORITY[nd.authority]);
  assert.equal(browserControl.resolveClaim(bd,{allowInference:false}).state,nodeControl.truthFabric.resolveClaim(nd,{allowInference:false}).state);
  const compatibleN=nodeControl.truthFabric.createClaim({id:"compatible",text:"another assertion",sources:[source]});
  const compatibleB=browserControl.createClaim({id:"compatible",text:"another assertion",sources:[source]});
  assert.equal(browserControl.mergeClaims([b,compatibleB]).state,nodeControl.truthFabric.mergeClaims([n,compatibleN]).state);
  assert.equal(browserControl.mergeClaims([b,compatibleB]).state,"CLAIM");
  const conflictN=nodeControl.truthFabric.createClaim({id:"conflict",text:"contrary",sources:[source],contradicts:[n.id]});
  const conflictB=browserControl.createClaim({id:"conflict",text:"contrary",sources:[source],contradicts:[b.id]});
  assert.equal(browserControl.mergeClaims([b,conflictB]).state,nodeControl.truthFabric.mergeClaims([n,conflictN]).state);
  assert.equal(browserControl.mergeClaims([b,conflictB]).state,"CONFLICT");
  const unknownN=nodeControl.truthFabric.createClaim({id:"unknown",text:"unknown independence",sources:[{id:"u1",authority:"A2"},{id:"u2",authority:"A2"}]});
  const unknownB=browserControl.createClaim({id:"unknown",text:"unknown independence",sources:[{id:"u1",authority:"A2"},{id:"u2",authority:"A2"}]});
  assert.equal(browserControl.independentSourceCount(unknownB),nodeControl.truthFabric.independentSourceCount(unknownN));
  assert.equal(browserControl.independentSourceCount(unknownB),0);
  const old="2020-01-01T00:00:00.000Z";
  const ns=nodeControl.truthFabric.createClaim({id:"stale",text:"old",kind:"FACT",sources:[{id:"old-source",authority:"A1",observedAt:old}]});
  const bs=browserControl.createClaim({id:"stale",text:"old",kind:"FACT",sources:[{id:"old-source",authority:"A1",observedAt:old}]});
  assert.deepEqual(browserControl.resolveClaim(bs,{now:Date.parse("2026-09-13T00:00:00Z"),maxAgeMs:86400000}),nodeControl.truthFabric.resolveClaim(ns,{now:Date.parse("2026-09-13T00:00:00Z"),maxAgeMs:86400000}));
  assert.equal(browserControl.grantsAuthority(bd),false);
})();

(function contextParity(){
  const input={maxTokens:600,reserveTokens:50,items:[
    {id:"task",category:"task",tokens:100,required:true,content:"task"},
    {id:"trusted",category:"evidence",tokens:80,priority:10,trust:"trusted",content:"trusted"},
    {id:"untrusted",category:"evidence",tokens:80,priority:10,trust:"untrusted",content:"untrusted"},
    {id:"deleted",category:"memory",tokens:20,lifecycle:"deleted",content:"bad"},
    {id:"large",category:"conversation",tokens:500,content:"large"}
  ]};
  const n=nodeControl.contextCompiler.compileContext(input);
  const b=browserControl.compileContext(input);
  assert.deepEqual(b.selected.map(x=>x.id),n.selected.map(x=>x.id));
  assert.equal(b.tokensUsed,n.tokensUsed);
  assert.equal(b.tokenBudget,n.tokenBudget);
  const nz=nodeControl.contextCompiler.compileContext({maxTokens:0,items:[{id:"x",content:"x"}]});
  const bz=browserControl.compileContext({maxTokens:0,items:[{id:"x",content:"x"}]});
  assert.deepEqual(bz.warnings,nz.warnings);
  assert.deepEqual(bz.selected,nz.selected);
})();

(function resourceParity(){
  for(const signals of [
    {deviceMemoryGb:2,cores:2,batteryLevel:.8},
    {deviceMemoryGb:8,cores:8,batteryLevel:.9},
    {deviceMemoryGb:8,cores:8,batteryLevel:.9,reducedMotion:true},
    {deviceMemoryGb:4,cores:4,batteryLevel:.5},
    {deviceMemoryGb:8,cores:8,batteryLevel:.08}
  ]) assert.equal(browserControl.selectTier(signals),nodeControl.resourceGovernor.selectTier(signals));
  assert.equal(browserControl.selectTier({deviceMemoryGb:8,cores:8,batteryLevel:.9,reducedMotion:true}),"full");
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
    [{id:"s1",title:"Source",url:"https://example.com/a",clusterId:"source-a",evidence:[{claimId:"c1",stance:"support",locator:"p1"}]}]
  );
  const truth=bridge.researchVerificationToTruth(verification);
  assert.equal(truth.status,"INCONCLUSIVE");
  assert.equal(truth.claims.find(c=>c.id==="research:c1").kind,"FACT");
  assert.equal(truth.claims.find(c=>c.id==="research:c2").kind,"UNKNOWN");
  assert.equal(truth.claims.find(c=>c.id==="research:c1").metadata.researchStatus,"SUPPORTED");
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