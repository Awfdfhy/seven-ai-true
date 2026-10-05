"use strict";
const assert=require("assert/strict");const {createVerifiedProposalPort}=require("./coding-proposal-policy.cjs");
const A="a".repeat(40),B="b".repeat(40),D="d".repeat(64),evidence={tests:["gate"],diffDigest:D};
(async()=>{
 let opened=0;const api={openPullRequest:async x=>{opened++;return{number:7,url:"pr",...x}}};
 const good=createVerifiedProposalPort(api,{branch:"work",base:"main",currentHead:async()=>B,ciForSha:async s=>({id:99,status:"completed",conclusion:s===B?"success":"failure"})});
 const p=await good({task:"fix",baseSha:A,candidateSha:B,evidence});assert.equal(p.number,7);assert.equal(p.candidateSha,B);assert.equal(opened,1);
 const stale=createVerifiedProposalPort(api,{branch:"work",currentHead:async()=>A,ciForSha:async()=>({status:"completed",conclusion:"success"})});await assert.rejects(()=>stale({baseSha:A,candidateSha:B,evidence}),/stale-candidate/);
 const red=createVerifiedProposalPort(api,{branch:"work",currentHead:async()=>B,ciForSha:async()=>({status:"completed",conclusion:"failure"})});await assert.rejects(()=>red({baseSha:A,candidateSha:B,evidence}),/green-ci-required/);
 await assert.rejects(()=>good({baseSha:A,candidateSha:B,evidence:{tests:[],diffDigest:D}}),/test-evidence-required/);
 assert.throws(()=>createVerifiedProposalPort(api,{branch:"main",base:"main"}),/must-differ/);
 console.log("coding proposal policy: PASS");
})().catch(e=>{console.error(e);process.exit(1)});
