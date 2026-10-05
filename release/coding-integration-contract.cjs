"use strict";
const {runCodingTransaction}=require("./coding-production-runtime.cjs");
const CONTRACT_VERSION="seven-coding-integration-v1";
function text(v,n){const s=String(v||"").trim();if(!s||s.length>n)throw Error("invalid-coding-request");return s}
function normalizeRequest(input={}){
 const task=text(input.task,8000),source=String(input.source||"self-development").trim();
 const maxRepairs=Math.max(0,Math.min(3,Number(input.maxRepairs??2)));
 return Object.freeze({contract:CONTRACT_VERSION,task,source:text(source,128),maxRepairs});
}
function receipt(e){
 if(!e||e.schema!=="seven-coding-evidence-v1")throw Error("invalid-coding-evidence");
 return Object.freeze({contract:CONTRACT_VERSION,verdict:e.verdict,baseSha:e.baseSha,resultSha:e.resultSha,tests:Object.freeze([...(e.tests||[])]),failures:Object.freeze([...(e.failures||[])]),diffDigest:e.diffDigest||null,proposal:e.proposal||null,states:Object.freeze([...(e.states||[])])});
}
async function executeCodingRequest(adapter,input){
 const req=normalizeRequest(input);
 const e=await runCodingTransaction(adapter,{task:req.task,maxRepairs:req.maxRepairs});
 return receipt(e);
}
module.exports={CONTRACT_VERSION,normalizeRequest,receipt,executeCodingRequest};
