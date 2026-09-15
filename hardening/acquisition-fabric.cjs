"use strict";
const crypto=require("crypto");
const research=require("./research-fabric.cjs");
const vision=require("./vision-fabric.cjs");
const canon=require("./canon-fabric-final.cjs");

const HASH64=/^[0-9a-f]{64}$/i;
const KINDS=Object.freeze(["SEARCH_FETCH","FILE_IMPORT","VISUAL_CAPTURE","CANON_SOURCE"]);
const STATUS=Object.freeze(["COMPLETE","NOT_FOUND","CANCELLED","FAILED"]);
const SENSITIVITY=Object.freeze(["PUBLIC","PRIVATE","SENSITIVE"]);
const ATTEMPT=Object.freeze(["PLANNED","STARTED","CANCEL_REQUESTED","COMPLETE","FAILED","CANCELLED"]);
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function finite(v,n){const x=Number(v);if(!Number.isFinite(x))throw new Error(`${n} must be finite`);return x}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function sha(v){return crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex")}
function seal(body){return Object.freeze({...body,seal:sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===sha(body)}
function iso(v,n){const s=req(v,n),t=Date.parse(s);if(!Number.isFinite(t))throw new Error(`${n} invalid`);return new Date(t).toISOString()}
function en(v,set,n){const s=String(v||"").toUpperCase();if(!set.includes(s))throw new Error(`${n} invalid`);return s}
function uniq(xs){return [...new Set(arr(xs).map(x=>String(x).trim()).filter(Boolean))].sort()}
function strong(v,n){const s=req(v,n).toLowerCase();if(!HASH64.test(s))throw new Error(`${n} must be sha256`);return s}

function createAcquisitionProviderContract(input={}){
  const providerId=req(input.providerId,"providerId"),revision=req(input.revision,"revision"),kinds=uniq(input.kinds).map(x=>en(x,KINDS,"kind"));if(!kinds.length)throw new Error("provider kinds required");
  const realms=uniq(input.realms);if(!realms.length)throw new Error("provider realms required");const mediaTypes=uniq(input.mediaTypes);if(!mediaTypes.length)throw new Error("provider mediaTypes required");
  const maxBytes=Math.trunc(finite(input.maxBytes,"maxBytes"));if(maxBytes<=0)throw new Error("maxBytes must be positive");
  const body={schema:"seven.acquisition-provider.v1",providerId,revision,kinds,realms,mediaTypes,maxBytes,network:input.network===true,supportsCancellation:input.supportsCancellation===true,metadataPolicy:String(input.metadataPolicy||"MINIMIZE").toUpperCase(),requestSchemaHash:strong(input.requestSchemaHash,"requestSchemaHash"),responseSchemaHash:strong(input.responseSchemaHash,"responseSchemaHash")};return seal(body)
}
function verifyAcquisitionProviderContract(x){return verifySealed(x,"seven.acquisition-provider.v1")}
function createAcquisitionRequest(input={}){
  const kind=en(input.kind,KINDS,"kind"),principalId=req(input.principalId,"principalId"),scopeId=String(input.scopeId||""),taskId=req(input.taskId,"taskId"),target=req(input.target,"target"),realm=req(input.realm,"realm"),sensitivity=en(input.sensitivity||"PRIVATE",SENSITIVITY,"sensitivity"),expectedMediaTypes=uniq(input.expectedMediaTypes);if(!expectedMediaTypes.length)throw new Error("expectedMediaTypes required");
  const maxBytes=Math.trunc(finite(input.maxBytes,"maxBytes"));if(maxBytes<=0)throw new Error("maxBytes must be positive");if(input.ambient===true)throw new Error("ambient acquisition is forbidden");
  const userAuthorizationRef=String(input.userAuthorizationRef||"");if(["FILE_IMPORT","VISUAL_CAPTURE"].includes(kind)&&!userAuthorizationRef)throw new Error(`${kind} requires userAuthorizationRef`);
  const body={schema:"seven.acquisition-request.v1",taskId,kind,principalId,scopeId,target,realm,sensitivity,expectedMediaTypes,maxBytes,allowNetwork:input.allowNetwork===true,userAuthorizationRef:userAuthorizationRef||null,ambient:false,createdAt:iso(input.createdAt||new Date().toISOString(),"createdAt")};return seal(body)
}
function verifyAcquisitionRequest(x){return verifySealed(x,"seven.acquisition-request.v1")&&x.ambient===false&&KINDS.includes(x.kind)&&SENSITIVITY.includes(x.sensitivity)}
function qualifyProvider(request,provider){
  const reasons=[];if(!verifyAcquisitionRequest(request))reasons.push("invalid-request");if(!verifyAcquisitionProviderContract(provider))reasons.push("invalid-provider");if(reasons.length)return Object.freeze({eligible:false,reasons});
  if(!provider.kinds.includes(request.kind))reasons.push("kind-unsupported");if(!provider.realms.includes(request.realm))reasons.push("realm-unsupported");if(request.maxBytes>provider.maxBytes)reasons.push("provider-byte-limit");if(request.allowNetwork!==true&&provider.network)reasons.push("network-not-authorized");if(request.allowNetwork===true&&!provider.network&&request.kind==="SEARCH_FETCH")reasons.push("network-provider-required");if(request.expectedMediaTypes.some(x=>!provider.mediaTypes.includes(x)))reasons.push("media-type-unsupported");
  return Object.freeze({eligible:reasons.length===0,reasons})
}
function createAcquisitionAttempt(request){if(!verifyAcquisitionRequest(request))throw new Error("verified request required");return seal({schema:"seven.acquisition-attempt.v1",requestSeal:request.seal,state:"PLANNED",revision:0,events:[]})}
function verifyAcquisitionAttempt(x,request=null){if(!verifySealed(x,"seven.acquisition-attempt.v1")||!ATTEMPT.includes(x.state)||!Number.isInteger(x.revision)||x.revision!==arr(x.events).length)return false;if(request&&x.requestSeal!==request.seal)return false;let state="PLANNED";for(let i=0;i<x.events.length;i++){const e=x.events[i];if(e.revision!==i+1||e.from!==state)return false;state=e.to}return state===x.state}
function transitionAttempt(attempt,to,{at,reason=""}={}){if(!verifyAcquisitionAttempt(attempt))throw new Error("verified attempt required");const target=en(to,ATTEMPT,"attempt state"),allowed={PLANNED:["STARTED","CANCELLED"],STARTED:["CANCEL_REQUESTED","COMPLETE","FAILED"],CANCEL_REQUESTED:["CANCELLED","FAILED"],COMPLETE:[],FAILED:[],CANCELLED:[]};if(!allowed[attempt.state].includes(target))throw new Error(`invalid acquisition transition:${attempt.state}->${target}`);const event={revision:attempt.revision+1,from:attempt.state,to:target,at:iso(at||new Date().toISOString(),"at"),reason:String(reason||"")};return seal({schema:attempt.schema,requestSeal:attempt.requestSeal,state:target,revision:attempt.revision+1,events:[...attempt.events,event]})}
function createAcquisitionReceipt(input={}){
  const request=input.request,provider=input.provider,attempt=input.attempt;if(!verifyAcquisitionRequest(request)||!verifyAcquisitionProviderContract(provider)||!verifyAcquisitionAttempt(attempt,request))throw new Error("verified request/provider/attempt required");const q=qualifyProvider(request,provider);if(!q.eligible)throw new Error(`provider not eligible:${q.reasons.join(",")}`);
  const status=en(input.status,STATUS,"status");if(status==="COMPLETE"&&attempt.state!=="COMPLETE")throw new Error("complete receipt requires COMPLETE attempt");if(status==="CANCELLED"&&attempt.state!=="CANCELLED")throw new Error("cancelled receipt requires CANCELLED attempt");if(status==="FAILED"&&attempt.state!=="FAILED")throw new Error("failed receipt requires FAILED attempt");if(status==="NOT_FOUND"&&!['COMPLETE','FAILED'].includes(attempt.state))throw new Error("not-found receipt requires terminal attempt");
  let artifactSha256=null,contentHash=null,byteLength=0,mediaType=null,sourceRef=null,metadataHash=null;
  if(status==="COMPLETE"){
    artifactSha256=strong(input.artifactSha256,"artifactSha256");contentHash=strong(input.contentHash,"contentHash");byteLength=Math.trunc(finite(input.byteLength,"byteLength"));if(byteLength<0||byteLength>request.maxBytes||byteLength>provider.maxBytes)throw new Error("acquired artifact exceeds byte limit");mediaType=req(input.mediaType,"mediaType");if(!request.expectedMediaTypes.includes(mediaType)||!provider.mediaTypes.includes(mediaType))throw new Error("receipt media type outside contract");sourceRef=req(input.sourceRef,"sourceRef");metadataHash=strong(input.metadataHash||sha({}),"metadataHash");
  }
  const body={schema:"seven.acquisition-receipt.v1",requestSeal:request.seal,providerSeal:provider.seal,attemptSeal:attempt.seal,taskId:request.taskId,kind:request.kind,principalId:request.principalId,scopeId:request.scopeId,realm:request.realm,sensitivity:request.sensitivity,status,artifactSha256,contentHash,byteLength,mediaType,sourceRef,metadataHash,metadataStripped:input.metadataStripped!==false,retrievedAt:iso(input.retrievedAt||new Date().toISOString(),"retrievedAt"),untrustedContent:true,grantsAuthority:false,notes:String(input.notes||"")};return seal(body)
}
function verifyAcquisitionReceipt(x,{request,provider,attempt}={}){if(!verifySealed(x,"seven.acquisition-receipt.v1")||x.grantsAuthority!==false||x.untrustedContent!==true)return false;if(request&&(!verifyAcquisitionRequest(request)||x.requestSeal!==request.seal||x.principalId!==request.principalId||x.scopeId!==request.scopeId))return false;if(provider&&(!verifyAcquisitionProviderContract(provider)||x.providerSeal!==provider.seal))return false;if(attempt&&(!verifyAcquisitionAttempt(attempt,request)||x.attemptSeal!==attempt.seal))return false;return true}
function requireComplete(receipt){if(!verifyAcquisitionReceipt(receipt)||receipt.status!=="COMPLETE")throw new Error("verified COMPLETE acquisition receipt required");return receipt}

function admitResearchSource(input={}){
  const r=requireComplete(input.receipt);const source=research.createKnowledgeSource({sourceId:req(input.sourceId,"sourceId"),realm:r.realm,principalId:r.principalId,scopeId:r.scopeId||null,canonicalRef:r.sourceRef,mediaType:r.mediaType,title:String(input.title||input.sourceId)});const version=research.createSourceVersion({source,versionKey:req(input.versionKey,"versionKey"),contentHash:r.contentHash,byteLength:r.byteLength,observedAt:r.retrievedAt,publishedAt:input.publishedAt||null,updatedAt:input.updatedAt||null,provenanceHash:r.seal,availability:"AVAILABLE"});return seal({schema:"seven.acquisition-research-admission.v1",acquisitionSeal:r.seal,sourceId:source.id,sourceVersionId:version.id,principalId:r.principalId,scopeId:r.scopeId,source,version,grantsAuthority:false})
}
function verifyResearchAdmission(x){return verifySealed(x,"seven.acquisition-research-admission.v1")&&x.grantsAuthority===false&&x.source?.id===x.sourceId&&x.version?.id===x.sourceVersionId}
function admitVisualSource(input={}){
  const r=requireComplete(input.receipt);if(!["VISUAL_CAPTURE","FILE_IMPORT","SEARCH_FETCH"].includes(r.kind))throw new Error("receipt kind cannot create visual source");if(!/^image\//i.test(String(r.mediaType||"")))throw new Error("receipt media type cannot create visual source");const source=vision.createVisualSource({id:req(input.sourceId,"sourceId"),principal:r.principalId,project:r.scopeId||null,origin:r.sourceRef,originKind:r.kind,sensitivity:r.sensitivity,createdAt:r.retrievedAt,ambient:false,metadata:{acquisitionSeal:r.seal,metadataHash:r.metadataHash}});const version=vision.createVisualVersion({source,contentHash:r.contentHash,width:input.width,height:input.height,orientation:input.orientation||0,pageIndex:input.pageIndex??null,frameIndex:input.frameIndex??null,capturedAt:input.capturedAt||r.retrievedAt});return seal({schema:"seven.acquisition-visual-admission.v1",acquisitionSeal:r.seal,sourceId:source.id,visualVersionId:version.id,principalId:r.principalId,scopeId:r.scopeId,source,version,grantsAuthority:false})
}
function verifyVisualAdmission(x){return verifySealed(x,"seven.acquisition-visual-admission.v1")&&x.grantsAuthority===false&&x.source?.id===x.sourceId&&x.version?.id===x.visualVersionId}
function admitCanonSource(input={}){
  const r=requireComplete(input.receipt);if(r.kind!=="CANON_SOURCE"&&r.kind!=="FILE_IMPORT"&&r.kind!=="SEARCH_FETCH")throw new Error("receipt kind cannot create canon source");const continuity=input.continuity;if(!continuity?.id)throw new Error("continuity required");const source=canon.createSourceVersion(continuity,{id:req(input.sourceId,"sourceId"),sourceKind:String(input.sourceKind||"PRIMARY"),sourceIdentity:r.sourceRef,version:req(input.version,"version"),contentHash:r.contentHash,publishedAt:input.publishedAt||null});let evidence=null;if(input.evidence){evidence=canon.createEvidence(source,{id:req(input.evidence.id,"evidence.id"),locator:clone(input.evidence.locator),excerptHash:strong(input.evidence.excerptHash,"evidence.excerptHash"),claimScope:input.evidence.claimScope||null})}return seal({schema:"seven.acquisition-canon-admission.v1",acquisitionSeal:r.seal,sourceVersionId:source.id,evidenceId:evidence?.id||null,source,evidence,grantsCanonFactAuthority:false})
}
function verifyCanonAdmission(x){return verifySealed(x,"seven.acquisition-canon-admission.v1")&&x.grantsCanonFactAuthority===false&&x.source?.id===x.sourceVersionId&&((x.evidence==null&&x.evidenceId==null)||x.evidence?.id===x.evidenceId)}

module.exports=Object.freeze({KINDS,STATUS,SENSITIVITY,ATTEMPT,sha,createAcquisitionProviderContract,verifyAcquisitionProviderContract,createAcquisitionRequest,verifyAcquisitionRequest,qualifyProvider,createAcquisitionAttempt,verifyAcquisitionAttempt,transitionAttempt,createAcquisitionReceipt,verifyAcquisitionReceipt,admitResearchSource,verifyResearchAdmission,admitVisualSource,verifyVisualAdmission,admitCanonSource,verifyCanonAdmission});
