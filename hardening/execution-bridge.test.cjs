"use strict";

const assert = require("assert/strict");
const control = require("../release/control-runtime.js");

globalThis.SevenControl = control;
let persistedEvents = [];
let gateCalls = 0;
globalThis.SevenRuntime = {
  version: 4,
  gateTool(tool,args,grant){
    gateCalls++;
    const schema=tool.schema||{};
    for(const required of schema.required||[]) if(args[required]===undefined) return {allowed:false,reason:"missing_argument"};
    if(tool.risk==="side_effect"&&(!grant||grant.actionClass!==tool.capability)) return {allowed:false,reason:"permission_denied"};
    return {allowed:true,reason:"ok"};
  },
  registerTools(tools){
    const seen=new Map(),capabilities=[],aliases={};
    for(const tool of tools){
      if(!seen.has(tool.capability)){seen.set(tool.capability,tool.id);capabilities.push(tool);}
      else aliases[tool.name||tool.id]=seen.get(tool.capability);
    }
    return {capabilities,aliases};
  },
  readRuns(){ return {events: JSON.parse(JSON.stringify(persistedEvents))}; },
  runLedger(events){ persistedEvents=JSON.parse(JSON.stringify(events)); return true; }
};

delete require.cache[require.resolve("../release/execution-bridge.js")];
const execution = require("../release/execution-bridge.js");

assert.equal(execution.state.ready,true);

(function pathSecurity(){
  assert.deepEqual(execution.canonicalPath("../secret"),{valid:false,path:"",reason:"path-traversal"});
  assert.equal(execution.canonicalPath("src/../secret").path,"secret");
  assert.equal(execution.canonicalPath("/etc/passwd").valid,false);
  const task=control.createTaskContract({id:"scope",goal:"scope",allowedCapabilities:["fs.write"],scope:{files:["src"],externalDomains:["example.com"]}});
  assert.equal(execution.scopeDecision(task,{path:"src/a.js"}).allowed,true);
  assert.equal(execution.scopeDecision(task,{path:"src/../secret"}).allowed,false);
  assert.equal(execution.scopeDecision(task,{path:"../secret"}).allowed,false);
  assert.equal(execution.scopeDecision(task,{url:"https://api.example.com/v1"}).allowed,true);
  assert.equal(execution.scopeDecision(task,{url:"https://example.com.evil.test/v1"}).allowed,false);
})();

(function authorizationOrder(){
  gateCalls=0;
  const task=control.createTaskContract({id:"deny",goal:"deny",allowedCapabilities:["fs.read"]});
  const result=execution.authorizeTool({task,tool:{id:"write",capability:"fs.write",risk:"side_effect",schema:{}},args:{},grant:{actionClass:"fs.write"}});
  assert.equal(result.allowed,false);
  assert.match(result.reason,/task-capability/);
  assert.equal(gateCalls,0,"runtime gate must not run after task capability denial");
})();

(function toolRegistryReuse(){
  const registry=execution.registerTools([
    {id:"x",name:"search",capability:"web.search"},
    {id:"y",name:"search2",capability:"web.search"}
  ]);
  assert.equal(registry.capabilities.length,1);
  assert.equal(registry.aliases.search2,"x");
})();

(function verifiedSideEffectLifecycle(){
  const task=control.createTaskContract({
    id:"write-task",goal:"write safely",allowedCapabilities:["fs.write"],scope:{files:["src"]},verification:{required:true}
  });
  const run=execution.createRun(task,{id:"run-write"});
  const tool={id:"write",capability:"fs.write",risk:"side_effect",reversible:true,schema:{required:["path"]}};
  const grant={actionClass:"fs.write"};
  assert.throws(()=>execution.planToolCall({run,tool,args:{path:"src/a.js"},grant}),/idempotencyKey/);
  const planned=execution.planToolCall({run,tool,args:{path:"src/a.js"},grant,idempotencyKey:"write:src/a.js:v1"});
  assert.equal(planned.allowed,true);
  assert.equal(run.task.state,"EXECUTING");
  assert.equal(execution.unresolvedEffects(run).length,1);
  execution.markToolAttempt(run,planned.call.id,{requestId:"req-1"});
  assert.throws(()=>execution.verifyToolCall(run,planned.call.id),/requires evidence/);
  execution.verifyToolCall(run,planned.call.id,{sha:"abc"});
  assert.equal(execution.unresolvedEffects(run).length,0);
  execution.beginVerification(run);
  assert.equal(execution.canCommit(run).allowed,false);
  execution.recordVerification(run,{status:"PASS",evidence:[{test:"ok"}]});
  assert.equal(execution.canCommit(run).allowed,true);
  assert.equal(execution.beginCommit(run).allowed,true);
  execution.completeRun(run,"verify:1");
  assert.equal(run.task.state,"COMPLETED");
  assert.throws(()=>execution.appendEvent(run,"late",{}),/late event/);
})();

(function blockedScopeDoesNotCreateEffect(){
  const task=control.createTaskContract({id:"blocked",goal:"blocked",allowedCapabilities:["fs.write"],scope:{files:["src"]}});
  const run=execution.createRun(task);
  const result=execution.planToolCall({run,tool:{id:"write",capability:"fs.write",risk:"side_effect",schema:{required:["path"]}},args:{path:"src/../outside"},grant:{actionClass:"fs.write"},idempotencyKey:"bad"});
  assert.equal(result.allowed,false);
  assert.equal(execution.unresolvedEffects(run).length,0);
})();

(function cancellationRejectsLateWork(){
  const run=execution.createRun({id:"cancel",goal:"cancel",allowedCapabilities:["fs.read"]});
  execution.startExecution(run);
  execution.cancelRun(run,"user-stop");
  assert.equal(run.task.state,"CANCELLED");
  assert.throws(()=>execution.planToolCall({run,tool:{id:"read",capability:"fs.read",schema:{}},args:{}}),/terminal run/);
  assert.throws(()=>execution.appendEvent(run,"late",{}),/late event/);
})();

(function checkpointRestore(){
  persistedEvents=[];
  const run=execution.createRun({id:"restore-task",goal:"restore",allowedCapabilities:["fs.read"]},{id:"restore-run"});
  execution.startExecution(run);
  const saved=execution.persistCheckpoint(run,"before-tool");
  assert.equal(saved.kind,"seven-execution-checkpoint-v1");
  const restored=execution.restoreLatest("restore-task");
  assert.equal(restored.id,"restore-run");
  assert.equal(restored.task.state,"EXECUTING");
})();

console.log("execution bridge security + recovery: PASS");
