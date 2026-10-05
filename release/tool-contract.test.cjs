"use strict";
const assert=require("assert/strict");
const {normalizeTool,createRegistry,execute}=require("./tool-contract.cjs");
(async()=>{
 const legacy=normalizeTool({id:"web.search",schema:{type:"object"},risk:"side_effect",requiredPermissions:["network"],timeout:250,retryPolicy:{maxRetries:2}});
 assert.equal(legacy.inputSchema.type,"object");assert.equal(legacy.risk,"WRITE");assert.deepEqual([...legacy.permissions],["network"]);assert.equal(legacy.retryPolicy.maxRetries,2);
 const typed=normalizeTool({name:"artifact.search",inputSchema:{type:"object"},riskLevel:"read",permissions:"artifact.read",resources:"room:1"});assert.equal(typed.id,"artifact.search");assert.equal(typed.risk,"READ");assert.deepEqual([...typed.permissions],["artifact.read"]);assert.deepEqual([...typed.resources],["room:1"]);
 assert.throws(()=>createRegistry([{id:"x"},{id:"x"}]),/duplicate/);
 const unavailable=await execute({tool:{id:"stub"},input:{},authorize:()=>({allowed:true})});assert.equal(unavailable.error.code,"UNAVAILABLE");
 let ran=false;const denied=await execute({tool:{id:"write",executor:()=>{ran=true}},input:{},authorize:()=>({allowed:false,reason:"scope"})});assert.equal(denied.error.code,"PERMISSION_ERROR");assert.equal(ran,false);
 const ok=await execute({tool:{id:"read",risk:"read",executor:async x=>({value:x.value})},input:{value:7},authorize:()=>({allowed:true}),traceId:"t1"});assert.equal(ok.ok,true);assert.equal(ok.output.value,7);assert.equal(ok.audit.toolId,"read");
 const ac=new AbortController();ac.abort();const cancelled=await execute({tool:{id:"read",executor:()=>1},input:{},authorize:()=>({allowed:true}),signal:ac.signal});assert.equal(cancelled.error.code,"CANCELLED");
 const timeout=await execute({tool:{id:"slow",timeoutMs:100,executor:()=>new Promise(()=>{})},input:{},authorize:()=>({allowed:true})});assert.equal(timeout.error.code,"TIMEOUT");assert.equal(timeout.error.retryable,true);
 let tries=0;const retried=await execute({tool:{id:"net",retryPolicy:{maxRetries:2},executor:()=>{tries++;if(tries<3)throw Object.assign(new Error("network"),{code:"NETWORK_ERROR"});return "ok"}},input:{},authorize:()=>({allowed:true})});assert.equal(retried.ok,true);assert.equal(tries,3);assert.equal(retried.audit.attempts,3);
 let hardTries=0;const hard=await execute({tool:{id:"hard",retryPolicy:{maxRetries:3},executor:()=>{hardTries++;throw Object.assign(new Error("bad"),{code:"TOOL_ERROR"})}},input:{},authorize:()=>({allowed:true})});assert.equal(hard.ok,false);assert.equal(hardTries,1);
 console.log("tool contract: PASS (schema/risk/auth/unavailable/cancel/timeout/retry/audit)");
})().catch(e=>{console.error(e);process.exitCode=1});
