"use strict";
const {runCodingTransaction}=require("./coding-production-runtime.cjs");
const CONTRACT_VERSION="seven-coding-integration-v1";
function text(v,n){const s=String(v||"").trim();if(!s||s.length>n)throw Error("invalid-coding-request");return s}
function boundedStrings(v,max=200,len=1000){if(!Array.isArray(v)||v.length>max)throw Error('unbounded-coding-evidence');return Object.freeze(v.map(x=>{if(typeof x!=='string'||x.length>len)throw Error('unbounded-coding-evidence');return x}))}
function frozenProposal(v){
 if(v==null)return null;if(typeof v!=="object"||Array.isArray(v))throw Error("invalid-coding-proposal");
 let nodes=0;
 function copy(x,depth=0){
  if(++nodes>200||depth>6)throw Error('unbounded-coding-proposal');
  if(x===null||typeof x==='boolean'||typeof x==='number'&&Number.isFinite(x))return x;
  if(typeof x==='string'&&x.length<=2000)return x;
  if(typeof x!=='object'||!x)throw Error('invalid-coding-proposal');
  if(Array.isArray(x))return Object.freeze(x.map(y=>copy(y,depth+1)));
  const out={};for(const k of Object.keys(x)){if(k.length>128||['__proto__','constructor','prototype'].includes(k))throw Error('invalid-coding-proposal');out[k]=copy(x[k],depth+1)}return Object.freeze(out);
 }
 return copy(v);
}
function normalizeRequest(input={}){
 const task=text(input.task,8000),source=String(input.source||"self-development").trim();
 const requested=Number(input.maxRepairs??2);if(!Number.isFinite(requested))throw Error('invalid-coding-request');
 const maxRepairs=Math.max(0,Math.min(3,Math.floor(requested)));
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
