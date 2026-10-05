"use strict";
const assert=require("assert");
const {runCodingTransaction}=require("./coding-production-runtime.cjs");
function adapter(opts={}){
 let sha="base",attempt=0,proposals=0;
 return {snapshot:async()=>({sha}),inspect:async()=>({filesRead:["src/a.js"],plan:{changes:[{path:"src/a.js",content:"fixed"}]}}),plan:async({inspection})=>inspection.plan,
 applyAtomic:async({baseSha})=>{assert.equal(baseSha,sha);sha="c"+(++attempt);return{sha}},
 runTests:async()=>attempt===1&&opts.failFirst?{ok:false,tests:["fixture"],failures:["expected 2 got 1"]}:{ok:true,tests:["fixture"]},
 diagnose:async()=>({root:"fixture bug"}),repair:async()=>({changes:[{path:"src/a.js",content:"fixed-again"}]}),
 diff:async()=>({text:"diff --git a/src/a.js b/src/a.js"}),
 verify:async()=>({ok:true}),propose:async x=>{proposals++;return{id:"proposal-1",sha:x.candidateSha}},get proposals(){return proposals},
 move:()=>{sha="external"}};
}
(async()=>{
 const a=adapter({failFirst:true});const r=await runCodingTransaction(a,{task:"fix fixture bug",maxRepairs:2});
 assert.equal(r.verdict,"READY_FOR_INTEGRATION");assert.equal(r.repairs,1);assert.ok(r.states.includes("DIAGNOSE"));assert.ok(r.states.includes("RETEST"));assert.equal(a.proposals,1);assert.equal(r.baseSha,"base");assert.equal(r.resultSha,"c2");assert.match(r.diffDigest,/^[a-f0-9]{64}$/);
 const protectedAdapter=adapter();protectedAdapter.plan=async()=>({changes:[{path:"release/x.test.cjs",content:"cheat"}]});
 await assert.rejects(()=>runCodingTransaction(protectedAdapter,{task:"cheat"}),/protected-path/);
 const stale=adapter();stale.plan=async({inspection})=>{stale.move();return inspection.plan};
 await assert.rejects(()=>runCodingTransaction(stale,{task:"stale"}),/stale-plan/);
 const same=adapter();same.applyAtomic=async()=>({sha:"base"});await assert.rejects(()=>runCodingTransaction(same,{task:"no-op candidate"}),/candidate-sha-required/);
 const dirty=adapter();dirty.diff=async()=>({text:"diff",files:["src/a.js","surprise.js"]});await assert.rejects(()=>runCodingTransaction(dirty,{task:"dirty diff"}),/unexpected-diff-files:surprise.js/);
 const noInventory=adapter();noInventory.diff=async()=>({text:"diff"});await assert.rejects(()=>runCodingTransaction(noInventory,{task:"missing authoritative diff"}),/authoritative-diff-required/);
 for(const p of [".github/CODEOWNERS","evolution/engine.test.cjs","apk/binary-verification.test.cjs","cloudflare/search-gateway/search-gateway.test.mjs","release/release-verify.cjs"]){
   const guarded=adapter();guarded.plan=async()=>({changes:[{path:p,content:"tamper"}]});
   await assert.rejects(()=>runCodingTransaction(guarded,{task:"tamper acceptance infra"}),/protected-path/);
 }
 console.log("coding production runtime tests: PASS");
})().catch(e=>{console.error(e);process.exit(1)});
