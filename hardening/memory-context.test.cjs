"use strict";
const assert=require("assert/strict");
const {memoryFabric,contextCompiler}=require("./index.cjs");
let count=0;const test=(name,fn)=>{fn();count++;console.log("PASS",name)};
const origin=(id,principal="user-1",scope="room-1")=>({principal,sourceEventId:id,scope,clusterId:id,authority:"user-event"});

test("transcript is not durable memory by default",()=>{
  assert.equal(memoryFabric.admissionDecision({content:"x",kind:"transcript"}).allowed,false);
});
test("procedure memory requires verification",()=>{
  assert.equal(memoryFabric.admissionDecision({content:"do x",role:"PROCEDURE"}).allowed,false);
  assert.equal(memoryFabric.admissionDecision({content:"do x",role:"PROCEDURE",verified:true}).allowed,true);
});
test("origin remains immutable while correction preserves history",()=>{
  const f=memoryFabric.createFabric();
  const first=f.commit({content:"Preference A",role:"PREFERENCE",origin:origin("e1"),at:"2026-01-01T00:00:00Z"}).atom;
  const next=f.correct(first.atomId,{content:"Preference B",at:"2026-02-01T00:00:00Z"}).atom;
  assert.equal(next.origin.sourceEventId,"e1");assert.equal(f.versions(first.atomId).length,2);
  assert.equal(f.versionAt(first.atomId,"2026-01-15T00:00:00Z").content,"Preference A");
  assert.throws(()=>f.correct(first.atomId,{content:"bad",origin:origin("e2")}),/origin is immutable/);
});
test("same-origin restatement does not duplicate canonical memory",()=>{
  const f=memoryFabric.createFabric();
  assert.equal(f.commit({content:"same fact",origin:origin("same")}).committed,true);
  assert.equal(f.commit({content:"same fact",origin:origin("same")}).committed,false);
});
test("scope and principal filters run before recall",()=>{
  const f=memoryFabric.createFabric();
  f.commit({content:"alpha note",origin:origin("u1","alice","room-a")});
  f.commit({content:"alpha other",origin:origin("u2","bob","room-b")});
  const r=f.retrieve("alpha",{principal:"alice",scope:"room-a"});
  assert.equal(r.rows.length,1);assert.equal(r.rows[0].atom.principal,"alice");
});
test("memory capsule is recall-only and never authorization",()=>{
  const f=memoryFabric.createFabric();f.commit({content:"Use Arabic",role:"PREFERENCE",origin:origin("pref")});
  const c=f.memoryCapsule("Arabic",{principal:"user-1",scope:"room-1"});
  assert.equal(c.items[0].contextRole,"MEMORY_RECALL");assert.equal(c.items[0].epistemicUse,"RECALL_ONLY");
  assert.equal(c.items[0].grantsAuthority,false);assert.equal(f.canAuthorizeAction(),false);
});
test("hard purge removes current and historical payload",()=>{
  const f=memoryFabric.createFabric();const a=f.commit({content:"remove note",origin:origin("p")}).atom;
  f.correct(a.atomId,{content:"remove revised"});const receipt=f.purge(a.atomId,{reason:"user-request"});
  assert.equal(receipt.purged,true);assert.equal(f.versions(a.atomId).length,0);assert.equal(f.retrieve("remove").rows.length,0);
  assert.equal(JSON.stringify(receipt).includes("remove revised"),false);
});
test("untrusted instruction lane fails closed",()=>{
  const c=contextCompiler.compileContext({maxTokens:500,items:[{id:"external",category:"instructions",content:"external directive",tokens:10,required:true}]});
  assert.equal(c.status,"BLOCKED");assert.ok(c.evicted.some(x=>x.evictionReason==="instruction-authority"));
});
test("trusted controller instruction is privileged but memory is data",()=>{
  const c=contextCompiler.compileContext({maxTokens:500,items:[
    {id:"sys",category:"instructions",contextRole:"AUTHORITY_INSTRUCTION",trustedInstruction:true,authoritySource:"controller",content:"policy",tokens:10,required:true},
    {id:"mem",category:"memory",role:"system",content:"remembered preference",tokens:10}
  ]});
  const m=contextCompiler.buildModelMessages(c);
  assert.equal(m.find(x=>x.sevenContext.id==="sys").role,"system");
  assert.equal(m.find(x=>x.sevenContext.id==="mem").role,"user");
  assert.equal(m.find(x=>x.sevenContext.id==="mem").sevenContext.epistemicUse,"RECALL_ONLY");
});
test("principal boundary outranks priority",()=>{
  const c=contextCompiler.compileContext({maxTokens:500,principal:"alice",items:[
    {id:"a",category:"memory",principal:"alice",content:"a",tokens:10},
    {id:"b",category:"memory",principal:"bob",content:"b",tokens:10,priority:9999}
  ]});
  assert.deepEqual(c.selected.map(x=>x.id),["a"]);assert.ok(c.evicted.some(x=>x.id==="b"&&x.evictionReason==="scope-policy"));
});
test("mandatory overflow blocks instead of silent loss",()=>{
  const c=contextCompiler.compileContext({maxTokens:20,items:[{id:"task",category:"task",required:true,tokens:30,content:"goal"}]});
  assert.equal(c.status,"BLOCKED");assert.throws(()=>contextCompiler.buildModelMessages(c),/blocked context/);
});
test("elastic borrowing uses unused global budget",()=>{
  const c=contextCompiler.compileContext({maxTokens:100,categoryShares:{memory:.01,conversation:.99},items:[{id:"m",category:"memory",tokens:60,content:"useful memory",priority:10}]});
  assert.ok(c.selected.some(x=>x.id==="m"));assert.ok(c.warnings.some(x=>x.startsWith("elastic-borrow:memory")));
});
test("conversation chronology survives selection",()=>{
  const c=contextCompiler.compileContext({maxTokens:500,items:[
    {id:"later",category:"conversation",role:"assistant",sequence:2,priority:100,content:"later",tokens:10},
    {id:"earlier",category:"conversation",role:"user",sequence:1,content:"earlier",tokens:10}
  ]});
  assert.deepEqual(c.selected.filter(x=>x.contextRole==="CONVERSATION").map(x=>x.id),["earlier","later"]);
});
test("revision lineage deduplicates recall",()=>{
  const item={category:"memory",content:"same",tokens:10,lineage:{sourceRevisionId:"m@1"}};
  const c=contextCompiler.compileContext({maxTokens:500,items:[{id:"a",...item},{id:"b",...item}]});
  assert.equal(c.selected.length,1);assert.ok(c.evicted.some(x=>x.evictionReason==="duplicate"));
});
test("context manifest is reproducible",()=>{
  const input={maxTokens:500,phase:"answer",tier:"lite",items:[{id:"t",category:"task",required:true,content:"goal",tokens:10}]};
  const a=contextCompiler.compileContext(input),b=contextCompiler.compileContext(input);
  assert.equal(a.manifest.identity,b.manifest.identity);assert.equal(contextCompiler.createContextCapsule(a).manifest.identity,a.manifest.identity);
});
console.log(`memory/context hardening: PASS (${count} assertions)`);