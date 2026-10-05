"use strict";
const assert=require("assert/strict"),crypto=require("crypto");
const {runCodingTransaction}=require("./coding-production-runtime.cjs");const {selectTests}=require("./coding-test-selector.cjs");
function h(v){return crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex")}
(async()=>{
 let repo={"fixture/math.js":"exports.add=(a,b)=>a-b","fixture/math.test.js":"assert(add(1,1)===2)"},sha=h(repo),testRuns=0;
 const a={
  snapshot:async()=>({sha}),inspect:async()=>({filesRead:["fixture/math.js","fixture/math.test.js"],plan:{changes:[{path:"fixture/math.js",content:"exports.add=(a,b)=>a+b+1"}]}}),
  plan:async({inspection})=>inspection.plan,
  applyAtomic:async({baseSha,changes})=>{assert.equal(baseSha,sha);const next={...repo};for(const c of changes)next[c.path]=c.content;repo=next;sha=h(repo);return{sha}},
  runTests:async({changed})=>{testRuns++;const selected=selectTests(changed);const ok=repo["fixture/math.js"].includes("a+b")&&!repo["fixture/math.js"].includes("a+b+1");return{ok,tests:["fixture/math.test.js",...selected.mandatory],failures:ok?[]:["add(1,1) expected 2 got 3"]}},
  diagnose:async({testResult})=>({root:testResult.failures[0],fix:"remove +1"}),
  repair:async()=>({changes:[{path:"fixture/math.js",content:"exports.add=(a,b)=>a+b"}]}),
  diff:async()=>({text:repo["fixture/math.js"]}),verify:async({candidateSha})=>({ok:candidateSha===sha}),
  propose:async({candidateSha})=>({kind:"verified-patch",sha:candidateSha})
 };
 const out=await runCodingTransaction(a,{task:"Fix add in fixture repository",maxRepairs:2});
 assert.equal(out.verdict,"READY_FOR_INTEGRATION");assert.equal(out.repairs,1);assert.equal(testRuns,2);assert.equal(repo["fixture/math.js"],"exports.add=(a,b)=>a+b");assert.equal(out.proposal.sha,out.resultSha);
 console.log("coding fixture E2E: PASS — first failure, diagnosis, repair, retest, verify, proposal");
})().catch(e=>{console.error(e);process.exit(1)});
