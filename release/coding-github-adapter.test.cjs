"use strict";
const assert=require("assert/strict");const {createGithubCodingAdapter}=require("./coding-github-adapter.cjs");
function api(){
 let sha="base",dispatches=0,commits=0;
 return {get sha(){return sha},get dispatches(){return dispatches},get commits(){return commits},
 repositoryTree:async()=>({head:{sha,treeSha:"tree-"+sha},truncated:false,items:[{path:"src/bug.js",type:"blob"},{path:"README.md",type:"blob"}]}),
 readFile:async path=>({path,content:path==="src/bug.js"?"bug":"docs"}),
 atomicCommit:async(branch,changes)=>{assert.equal(branch,"work");assert.ok(changes.length);sha="candidate-"+(++commits);return{sha}},
 dispatchWorkflow:async(name,branch)=>{assert.equal(name,"seven-tests.yml");assert.equal(branch,"work");dispatches++;return true}
 };
}
(async()=>{
 const g=api();let waited=null;
 const a=createGithubCodingAdapter(g,{branch:"work",waitForExactRun:async(b,s)=>{waited={b,s};return{conclusion:"success"}},diff:async()=>({text:"diff",files:["src/bug.js"]}),verify:async()=>({ok:true}),propose:async()=>({id:1})});
 const snap=await a.snapshot();assert.equal(snap.sha,"base");
 const ins=await a.inspect({task:"fix src bug",snapshot:snap});assert.ok(ins.filesRead.includes("src/bug.js"));
 const applied=await a.applyAtomic({baseSha:"base",changes:[{path:"src/bug.js",content:"fixed"}]});assert.equal(applied.sha,"candidate-1");
 const tr=await a.runTests({candidateSha:applied.sha,changed:["src/bug.js"]});assert.equal(tr.ok,true);assert.deepEqual(waited,{b:"work",s:"candidate-1"});assert.equal(g.dispatches,1);
 await assert.rejects(()=>a.applyAtomic({baseSha:"base",changes:[{path:"x",content:"x"}]}),/stale-write/);
 const badDiff=createGithubCodingAdapter(api(),{branch:"work",diff:async()=>({text:"diff"}),verify:async()=>({ok:true}),propose:async()=>({})});await assert.rejects(()=>badDiff.diff({baseSha:"a",headSha:"b"}),/authoritative-diff-required/);
 const noWait=createGithubCodingAdapter(api(),{branch:"work",diff:async()=>({}),verify:async()=>({ok:true}),propose:async()=>({})});
 const blocked=await noWait.runTests({candidateSha:"x",changed:["src/x.js"]});assert.equal(blocked.ok,false);assert.ok(blocked.failures.includes("exact-ci-wait-adapter-required"));
 console.log("coding GitHub adapter: PASS");
})().catch(e=>{console.error(e);process.exit(1)});
