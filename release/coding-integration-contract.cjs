"use strict";
const {runCodingTransaction}=require("./coding-production-runtime.cjs");
const CONTRACT_VERSION="seven-coding-integration-v1";
function text(v,n){const s=String(v||"").trim();if(!s||s.length>n)throw Error("invalid-coding-request");return s}
function boundedStrings(v,max=200,len=1000){if(!Array.isArray(v))return Object.freeze([]);return Object.freeze(v.slice(0,max).map(x=>String(x).slice(0,len)))}
function frozenProposal(v){if(v==null)return null;if(typeof v!=="object"||Array.isArray(v))throw Error("invalid-coding-proposal");return Object.freeze({...v})}
function normalizeRequest(input={}){
 const task=text(input.task,8000),source=String(input.source||"self-development").trim();
 const maxRepairs=Math.max(0,Math.min(3,Number(input.maxRepairs??2)));
 return Object.freeze({contract:CONTRACT_VERSION,task,source:text(source,128),maxRepairs});
}
function receipt(e){
 if(!e||e.schema!=="seven-coding-evidence-v1")throw Error("invalid-coding-evidence");
 const baseSha=text(e.baseSha,128),resultSha=text(e.resultSha,128);
 if(!e.verdict||!Array.isArray(e.states)||!Array.isArray(e.filesChanged)||!Array.isArray(e.tests)||!Array.isArray(e.failures))throw Error("invalid-coding-evidence");
 if(e.verdict==="READY_FOR_INTEGRATION"&&(!e.diffDigest||!e.proposal))throw Error("incomplete-ready-evidence");
 return Object.freeze({contract:CONTRACT_VERSION,verdict:text(e.verdict,64),baseSha,resultSha,filesChanged:boundedStrings(e.filesChanged,200,500),tests:boundedStrings(e.tests,200,500),failures:boundedStrings(e.failures,200,1000),diffDigest:e.diffDigest?text(e.diffDigest,128):null,proposal:frozenProposal(e.proposal),states:boundedStrings(e.states,64,64)});
}
async function executeCodingRequest(adapter,input){
 const req=normalizeRequest(input);
 const e=await runCodingTransaction(adapter,{task:req.task,maxRepairs:req.maxRepairs});
 return receipt(e);
}
module.exports={CONTRACT_VERSION,normalizeRequest,receipt,executeCodingRequest};
