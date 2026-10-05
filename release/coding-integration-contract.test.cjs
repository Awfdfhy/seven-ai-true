"use strict";
const assert=require("assert");
const {CONTRACT_VERSION,normalizeRequest,receipt,executeCodingRequest}=require("./coding-integration-contract.cjs");
(async()=>{
 const r=normalizeRequest({task:"Fix bounded bug",source:"self-development",maxRepairs:99});
 assert.equal(r.contract,CONTRACT_VERSION);assert.equal(r.maxRepairs,3);assert.ok(Object.isFrozen(r));
 assert.throws(()=>normalizeRequest({task:""}),/invalid-coding-request/);
 const proposal={id:1};
 const e=receipt({schema:"seven-coding-evidence-v1",verdict:"READY_FOR_INTEGRATION",baseSha:"aaaaaaa",resultSha:"bbbbbbb",filesChanged:["src/a.js"],tests:["fixture"],failures:["first failure"],diffDigest:"d".repeat(64),proposal,states:["UNDERSTAND","VERIFY","COMMIT_OR_PROPOSE"]});
 assert.equal(e.contract,CONTRACT_VERSION);assert.deepEqual(e.filesChanged,["src/a.js"]);assert.deepEqual(e.tests,["fixture"]);assert.ok(Object.isFrozen(e));assert.ok(Object.isFrozen(e.filesChanged));assert.ok(Object.isFrozen(e.proposal));
 proposal.id=2;assert.equal(e.proposal.id,1);
 assert.throws(()=>receipt({schema:"wrong"}),/invalid-coding-evidence/);
 assert.throws(()=>receipt({schema:"seven-coding-evidence-v1",verdict:"READY_FOR_INTEGRATION",baseSha:"a",resultSha:"b",filesChanged:[],tests:[],failures:[],states:[]}),/incomplete-ready-evidence/);

 let sha="base000",attempt=0,proposals=0;
 const adapter={
  snapshot:async()=>({sha}),
  inspect:async()=>({filesRead:["src/a.js"],plan:{changes:[{path:"src/a.js",content:"wrong"}]}}),
  research:async()=>({notes:["bounded"]}),
  applyAtomic:async()=>({sha:sha="cand00"+(++attempt)}),
  runTests:async()=>attempt===1?{ok:false,tests:["fixture"],failures:["expected 2 got 3"]}:{ok:true,tests:["fixture"]},
  diagnose:async()=>({root:"off by one"}),
  repair:async()=>({changes:[{path:"src/a.js",content:"fixed"}]}),
  diff:async()=>({text:"diff --git a/src/a.js b/src/a.js",files:["src/a.js"]}),
  verify:async({candidateSha})=>({ok:candidateSha===sha}),
  propose:async({candidateSha})=>({id:"p1",sha:candidateSha,get marker(){return "verified"}})
 };
 const out=await executeCodingRequest(adapter,{task:"Fix fixture bug",source:"self-development"});
 proposals++;
 assert.equal(out.contract,CONTRACT_VERSION);assert.equal(out.verdict,"READY_FOR_INTEGRATION");assert.equal(out.baseSha,"base000");assert.equal(out.resultSha,"cand002");assert.deepEqual(out.filesChanged,["src/a.js"]);assert.ok(out.states.includes("DIAGNOSE"));assert.ok(out.states.includes("REPAIR"));assert.ok(out.states.includes("RETEST"));assert.ok(out.states.includes("REVIEW"));assert.ok(out.states.includes("VERIFY"));assert.equal(out.proposal.id,"p1");assert.equal(proposals,1);
 console.log("coding integration contract: PASS");
})().catch(e=>{console.error(e);process.exit(1)});
