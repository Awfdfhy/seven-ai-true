"use strict";
const assert=require("assert/strict");
const {normalizeTool,createRegistry,execute}=require("./tool-contract.cjs");
(async()=>{
 const legacy=normalizeTool({id:"web.search",schema:{type:"object"},risk:"side_effect",requiredPermissions:["network"],timeout:250,retryPolicy:{maxRetries:2}});
 assert.equal(legacy.inputSchema.type,"object");assert.equal(legacy.risk,"WRITE");assert.deepEqual([...legacy.permissions],["network"]);assert.equal(legacy.retryPolicy.maxRetries,2);
 const typed=normalizeTool({name:"artifact.search",inputSchema:{type:"object"},riskLevel:"read"});assert.equal(typed.id,"artifact.search");assert.equal(typed.risk,"READ");
 assert.throws(()=>createRegistry([{id:"x"},{id:"x"}]),/duplicate/);
 const unavailable=await execute({tool:{id:"stub"},input:{},authorize:()=>({allowed:true})});assert.equal(unavailable.error.code,"UNAVAILABLE");
 let ran=false;const denied=await execute({tool:{id:"write",executor:()=>{ran=true}},input:{},authorize:()=>({allowed:false,reason:"scope"})});assert.equal(denied.error.code,"PERMISSION_ERROR");assert.equal(ran,false);
 const ok=await execute({tool:{id:"read",risk:"read",executor:async x=>({value:x.value})},input:{value:7},authorize:()=>({allowed:true}),traceId:"t1"});assert.equal(ok.ok,true);assert.equal(ok.output.value,7);assert.equal(ok.audit.toolId,"read");
 const ac=new AbortController();ac.abort();const cancelled=await execute({tool:{id:"read",executor:()=>1},input:{},authorize:()=>({allowed:true}),signal:ac.signal});assert.equal(cancelled.error.code,"CANCELLED");
 const timeout=await execute({tool:{id:"slow",timeoutMs:100,executor:()=>new Promise(()=>{})},input:{},authorize:()=>({allowed:true})});assert.equal(timeout.error.code,"TIMEOUT");assert.equal(timeout.error.retryable,true);
 console.log("tool contract: PASS (schema/risk/auth/unavailable/cancel/timeout/audit)");
})().catch(e=>{console.error(e);process.exitCode=1});
