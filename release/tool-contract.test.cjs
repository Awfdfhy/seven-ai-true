"use strict";
const assert=require("assert/strict");
const {ERROR_CODES,normalizeTool,createRegistry,execute}=require("./tool-contract.cjs");
(async()=>{
 const sourceSchema={type:"object",required:["q"],properties:{q:{type:"string",minLength:1}},additionalProperties:false};
 const legacy=normalizeTool({id:"web.search",schema:sourceSchema,risk:"side_effect",requiredPermissions:"network",timeout:250,retryPolicy:{maxRetries:2}});
 assert.equal(legacy.inputSchema.type,"object");assert.equal(legacy.risk,"WRITE");assert.deepEqual([...legacy.permissions],["network"]);
 assert.equal(legacy.retryPolicy.maxRetries,0,"non-idempotent side effects must not retry");
 sourceSchema.properties.q.type="number";
 assert.equal(legacy.inputSchema.properties.q.type,"string","normalized schema must be cloned");
 assert.equal(Object.isFrozen(legacy.inputSchema.properties.q),true);
 assert.equal(Object.isFrozen(ERROR_CODES),true);assert.equal(typeof ERROR_CODES.add,"undefined");

 const typed=normalizeTool({name:"artifact.search",inputSchema:{type:"object"},riskLevel:"read",permissions:"artifact.read",resources:"room:1"});
 assert.equal(typed.id,"artifact.search");assert.equal(typed.risk,"READ");assert.deepEqual([...typed.permissions],["artifact.read"]);assert.deepEqual([...typed.resources],["room:1"]);
 assert.throws(()=>createRegistry([{id:"x"},{id:"x"}]),/duplicate/);

 const unavailable=await execute({tool:{id:"stub"},input:{},authorize:()=>({allowed:true})});assert.equal(unavailable.error.code,"UNAVAILABLE");
 let ran=false;
 const denied=await execute({tool:{id:"write",risk:"write",supportsAbort:true,executor:()=>{ran=true}},input:{},authorize:()=>({allowed:false,reason:"scope"})});
 assert.equal(denied.error.code,"PERMISSION_ERROR");assert.equal(ran,false);

 let invalidRan=false;
 const invalid=await execute({
  tool:{id:"validated",risk:"read",inputSchema:{type:"object",required:["value"],properties:{value:{type:"number"}},additionalProperties:false},executor:()=>{invalidRan=true;return 1}},
  input:{value:"bad"},authorize:()=>({allowed:true})
 });
 assert.equal(invalid.error.code,"VALIDATION_ERROR");assert.equal(invalidRan,false);

 const ok=await execute({
  tool:{id:"read",risk:"read",inputSchema:{type:"object",required:["value"],properties:{value:{type:"number"}},additionalProperties:false},outputSchema:{type:"object",required:["value"],properties:{value:{type:"number"}},additionalProperties:false},executor:async x=>({value:x.value})},
  input:{value:7},authorize:()=>({allowed:true}),traceId:"t1"
 });
 assert.equal(ok.ok,true);assert.equal(ok.output.value,7);assert.equal(ok.audit.toolId,"read");

 const malformed=await execute({
  tool:{id:"bad-output",risk:"read",outputSchema:{type:"object",required:["value"],properties:{value:{type:"number"}},additionalProperties:false},executor:async()=>({value:"wrong"})},
  input:{},authorize:()=>({allowed:true})
 });
 assert.equal(malformed.error.code,"MALFORMED_OUTPUT");

 const ac=new AbortController();ac.abort();
 const cancelled=await execute({tool:{id:"read-cancel",risk:"read",executor:()=>1},input:{},authorize:()=>({allowed:true}),signal:ac.signal});
 assert.equal(cancelled.error.code,"CANCELLED");

 let timeoutAborted=false;
 const timeout=await execute({
  tool:{id:"slow",risk:"read",timeoutMs:100,executor:(x,ctx)=>new Promise((resolve,reject)=>{
   ctx.signal.addEventListener("abort",()=>{timeoutAborted=true;reject(Object.assign(new Error("aborted"),{code:"CANCELLED"}))},{once:true});
  })},
  input:{},authorize:()=>({allowed:true})
 });
 assert.equal(timeout.error.code,"TIMEOUT");assert.equal(timeout.error.retryable,true);assert.equal(timeoutAborted,true);assert.equal(timeout.audit.lateResultPolicy,"quarantine");

 let unsafeRan=false;
 const unsafeWrite=await execute({tool:{id:"unsafe-write",risk:"write",executor:()=>{unsafeRan=true;return true}},input:{},authorize:()=>({allowed:true})});
 assert.equal(unsafeWrite.error.code,"UNAVAILABLE");assert.equal(unsafeRan,false);

 let safeWriteRan=false;
 const safeWrite=await execute({tool:{id:"safe-write",risk:"write",supportsAbort:true,inputSchema:{type:"object"},executor:()=>{safeWriteRan=true;return true}},input:{},authorize:()=>({allowed:true})});
 assert.equal(safeWrite.ok,true);assert.equal(safeWriteRan,true);

 let tries=0;
 const retried=await execute({tool:{id:"net",risk:"read",retryPolicy:{maxRetries:2},executor:()=>{tries++;if(tries<3)throw Object.assign(new Error("network"),{code:"NETWORK_ERROR"});return "ok"}},input:{},authorize:()=>({allowed:true})});
 assert.equal(retried.ok,true);assert.equal(tries,3);assert.equal(retried.audit.attempts,3);

 let sideTries=0;
 const sideRetry=await execute({tool:{id:"side-retry",risk:"write",idempotent:true,supportsAbort:true,retryPolicy:{maxRetries:2},executor:()=>{sideTries++;if(sideTries===1)throw Object.assign(new Error("network"),{code:"NETWORK_ERROR"});return true}},input:{},authorize:()=>({allowed:true})});
 assert.equal(sideRetry.ok,true);assert.equal(sideTries,2,"only explicitly idempotent side effects may retry");

 let hardTries=0;
 const hard=await execute({tool:{id:"hard",risk:"read",retryPolicy:{maxRetries:3},executor:()=>{hardTries++;throw Object.assign(new Error("bad"),{code:"TOOL_ERROR"})}},input:{},authorize:()=>({allowed:true})});
 assert.equal(hard.ok,false);assert.equal(hardTries,1);

 console.log("tool contract: PASS (immutable schema/list normalization/input-output validation/auth/cancel/timeout/side-effect safety/retry/audit)");
})().catch(e=>{console.error(e);process.exitCode=1});
