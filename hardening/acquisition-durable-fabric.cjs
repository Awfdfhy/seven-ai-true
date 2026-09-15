"use strict";

const acquisition=require("./acquisition-fabric.cjs");
const durable=require("./durable-fabric-state.cjs");
const HASH64=/^[0-9a-f]{64}$/i;
const TERMINAL=new Set(["COMPLETE","FAILED","CANCELLED"]);
const RECOVERY_ACTION=Object.freeze({START:"START",RECONCILE:"RECONCILE_ATTEMPT",FINISH_CANCEL:"FINISH_CANCEL",ADMIT:"ADMIT",DONE:"DONE",HALT:"HALT"});

function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function seal(body){return Object.freeze({...body,seal:acquisition.sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===acquisition.sha(body)}
function uniq(v){return [...new Set(arr(v).map(x=>String(x).trim()).filter(Boolean))].sort()}
function admissionInfo(x){
  if(acquisition.verifyResearchAdmission(x))return {kind:"RESEARCH",seal:x.seal,sourceId:x.sourceId,versionId:x.sourceVersionId};
  if(acquisition.verifyVisualAdmission(x))return {kind:"VISUAL",seal:x.seal,sourceId:x.sourceId,versionId:x.visualVersionId};
  if(acquisition.verifyCanonAdmission(x))return {kind:"CANON",seal:x.seal,sourceId:x.sourceVersionId,versionId:x.sourceVersionId};
  throw new Error("verified acquisition admission required");
}
function verifyReceiptForState(receipt,{request,provider,attempt}){
  if(receipt==null)return null;
  if(!acquisition.verifyAcquisitionReceipt(receipt,{request,provider,attempt}))throw new Error("verified acquisition receipt required");
  return receipt;
}
function normalizeAdmissions(admissions,receipt){
  const out=arr(admissions).map(admissionInfo).sort((a,b)=>`${a.kind}:${a.sourceId}:${a.versionId}`.localeCompare(`${b.kind}:${b.sourceId}:${b.versionId}`));
  const seals=new Set();for(const row of out){if(seals.has(row.seal))throw new Error("duplicate acquisition admission");seals.add(row.seal)}
  if(out.length&&!receipt)throw new Error("admission requires receipt");
  return out;
}
function createState({request,provider,attempt,receipt=null,admissions=[]}){
  if(!acquisition.verifyAcquisitionRequest(request)||!acquisition.verifyAcquisitionProviderContract(provider)||!acquisition.verifyAcquisitionAttempt(attempt,request))throw new Error("verified acquisition request/provider/attempt required");
  const q=acquisition.qualifyProvider(request,provider);if(!q.eligible)throw new Error(`provider not eligible:${q.reasons.join(",")}`);
  const r=verifyReceiptForState(receipt,{request,provider,attempt}),a=normalizeAdmissions(admissions,r);
  if(TERMINAL.has(attempt.state)&&!r)throw new Error("terminal acquisition attempt requires receipt");
  if(!TERMINAL.has(attempt.state)&&r)throw new Error("non-terminal acquisition attempt cannot bind receipt");
  if(r&&r.status==="COMPLETE"&&attempt.state!=="COMPLETE")throw new Error("complete receipt/attempt mismatch");
  if(r&&r.status!=="COMPLETE"&&a.length)throw new Error("non-complete receipt cannot have admissions");
  return Object.freeze({schema:"seven.acquisition-durable-state.v1",requestSeal:request.seal,providerSeal:provider.seal,attemptSeal:attempt.seal,attemptState:attempt.state,attemptRevision:attempt.revision,receiptSeal:r?.seal||null,receiptStatus:r?.status||null,admissions:a,admissionFingerprint:acquisition.sha(a),sensitivity:request.sensitivity,kind:request.kind,principalId:request.principalId,scopeId:request.scopeId,grantsAuthority:false});
}
function verifyState(x){return !!x&&x.schema==="seven.acquisition-durable-state.v1"&&x.grantsAuthority===false&&HASH64.test(String(x.requestSeal||""))&&HASH64.test(String(x.providerSeal||""))&&HASH64.test(String(x.attemptSeal||""))&&Number.isInteger(x.attemptRevision)&&x.attemptRevision>=0&&acquisition.sha(arr(x.admissions))===x.admissionFingerprint}

function createAcquisitionCheckpoint(input={}){
  const {request,provider,attempt,receipt=null}=input,state=createState({request,provider,attempt,receipt,admissions:input.admissions});
  const previous=input.previousCheckpoint||null;
  if(previous&&!verifyAcquisitionCheckpoint(previous,{request,provider}))throw new Error("verified previous acquisition checkpoint required");
  if(previous){
    if(previous.state.requestSeal!==state.requestSeal||previous.state.providerSeal!==state.providerSeal)throw new Error("acquisition checkpoint identity drift");
    if(state.attemptRevision<previous.state.attemptRevision)throw new Error("acquisition attempt revision regression");
    if(state.attemptRevision===previous.state.attemptRevision&&state.attemptSeal!==previous.state.attemptSeal)throw new Error("same acquisition attempt revision cannot drift");
    if(TERMINAL.has(previous.state.attemptState)&&state.attemptSeal!==previous.state.attemptSeal)throw new Error("terminal acquisition attempt cannot advance");
    const oldAdmissions=new Set(previous.state.admissions.map(x=>x.seal));for(const x of oldAdmissions)if(!state.admissions.some(y=>y.seal===x))throw new Error("durable acquisition admission cannot disappear");
    if(previous.state.receiptSeal&&state.receiptSeal!==previous.state.receiptSeal)throw new Error("durable acquisition receipt cannot drift");
  }
  const dependencyHeads={requestSeal:request.seal,providerSeal:provider.seal,providerRevision:String(provider.revision),providerRequestSchemaHash:provider.requestSchemaHash,providerResponseSchemaHash:provider.responseSchemaHash};
  return durable.createFabricCheckpoint({fabricId:"acquisition",principalId:request.principalId,scopeId:request.scopeId||"",revision:previous?previous.revision+1:0,previousSeal:previous?.seal||null,state,dependencyHeads,committedAt:input.committedAt||new Date().toISOString(),rebuildable:false});
}
function verifyAcquisitionCheckpoint(checkpoint,{request=null,provider=null}={}){
  if(!durable.verifyFabricCheckpoint(checkpoint)||checkpoint.fabricId!=="acquisition"||!verifyState(checkpoint.state)||checkpoint.rebuildable!==false)return false;
  if(checkpoint.principalId!==checkpoint.state.principalId||checkpoint.scopeId!==checkpoint.state.scopeId)return false;
  if(request&&(!acquisition.verifyAcquisitionRequest(request)||checkpoint.state.requestSeal!==request.seal||checkpoint.principalId!==request.principalId||checkpoint.scopeId!==request.scopeId))return false;
  if(provider&&(!acquisition.verifyAcquisitionProviderContract(provider)||checkpoint.state.providerSeal!==provider.seal||checkpoint.dependencyHeads.providerRevision!==String(provider.revision)))return false;
  return true;
}
function assessAcquisitionFreshness(checkpoint,{request,provider}={}){
  if(!verifyAcquisitionCheckpoint(checkpoint,{request,provider}))return Object.freeze({status:"BLOCK",reasons:["invalid-acquisition-checkpoint"]});
  return durable.assessCheckpointFreshness(checkpoint,{requestSeal:request.seal,providerSeal:provider.seal,providerRevision:String(provider.revision),providerRequestSchemaHash:provider.requestSchemaHash,providerResponseSchemaHash:provider.responseSchemaHash});
}

function recoveryDecision(checkpoint,{request,provider,requiredAdmissionKinds=[]}={}){
  const fresh=assessAcquisitionFreshness(checkpoint,{request,provider});if(fresh.status!=="FRESH")return Object.freeze({action:RECOVERY_ACTION.HALT,reasons:fresh.reasons});
  const s=checkpoint.state;
  if(s.attemptState==="PLANNED")return Object.freeze({action:RECOVERY_ACTION.START,reasons:[]});
  if(s.attemptState==="STARTED")return Object.freeze({action:RECOVERY_ACTION.RECONCILE,reasons:["started-attempt-has-no-terminal-receipt"]});
  if(s.attemptState==="CANCEL_REQUESTED")return Object.freeze({action:RECOVERY_ACTION.FINISH_CANCEL,reasons:["cancellation-was-requested-before-interruption"]});
  if(s.attemptState==="FAILED"||s.attemptState==="CANCELLED")return Object.freeze({action:RECOVERY_ACTION.DONE,reasons:[`terminal-${s.attemptState.toLowerCase()}`]});
  if(s.attemptState==="COMPLETE"){
    if(s.receiptStatus!=="COMPLETE")return Object.freeze({action:RECOVERY_ACTION.DONE,reasons:[`terminal-receipt-${String(s.receiptStatus||"missing").toLowerCase()}`]});
    const have=new Set(s.admissions.map(x=>x.kind)),need=uniq(requiredAdmissionKinds).map(x=>x.toUpperCase()),missing=need.filter(x=>!have.has(x));
    return missing.length?Object.freeze({action:RECOVERY_ACTION.ADMIT,reasons:missing.map(x=>`missing-admission:${x}`),missing}):Object.freeze({action:RECOVERY_ACTION.DONE,reasons:[]});
  }
  return Object.freeze({action:RECOVERY_ACTION.HALT,reasons:["unknown-acquisition-state"]});
}

function createAdmissionCacheEntry(input={}){
  const receipt=input.receipt;if(!acquisition.verifyAcquisitionReceipt(receipt)||receipt.status!=="COMPLETE")throw new Error("verified COMPLETE acquisition receipt required");
  const info=admissionInfo(input.admission);if(input.admission.acquisitionSeal!==receipt.seal)throw new Error("admission/receipt lineage mismatch");
  if(receipt.sensitivity==="SENSITIVE")throw new Error("sensitive acquisition is not eligible for generic derived cache");
  const payload={kind:info.kind,admissionSeal:info.seal,acquisitionSeal:receipt.seal,sourceId:info.sourceId,versionId:info.versionId,contentHash:receipt.contentHash,mediaType:receipt.mediaType,retrievedAt:receipt.retrievedAt};
  return durable.createDerivedCacheEntry({fabricId:"acquisition-admission-cache",principalId:receipt.principalId,scopeId:receipt.scopeId||"",sourceRefs:[{sourceId:info.sourceId,versionId:info.versionId,locatorId:""}],transformHash:req(input.transformHash,"transformHash"),producerHash:req(input.producerHash,"producerHash"),payload,createdAt:input.createdAt||receipt.retrievedAt,expiresAt:input.expiresAt||null});
}
function verifyAdmissionCacheEntry(entry,{receipt=null,admission=null}={}){
  if(!durable.verifyDerivedCacheEntry(entry)||entry.fabricId!=="acquisition-admission-cache"||entry.authoritative!==false||entry.grantsAuthority!==false)return false;
  if(receipt&&(!acquisition.verifyAcquisitionReceipt(receipt)||entry.principalId!==receipt.principalId||entry.scopeId!==receipt.scopeId||entry.payload.acquisitionSeal!==receipt.seal||entry.payload.contentHash!==receipt.contentHash))return false;
  if(admission){let info;try{info=admissionInfo(admission)}catch{return false}if(entry.payload.admissionSeal!==info.seal||entry.payload.sourceId!==info.sourceId||entry.payload.versionId!==info.versionId)return false}
  return true;
}
function evaluateAdmissionCacheEntry(entry,{receipt,admission,currentSourceVersions,now=Date.now()}={}){
  if(!verifyAdmissionCacheEntry(entry,{receipt,admission}))return Object.freeze({status:"BLOCK",reasons:["invalid-acquisition-cache-entry"]});
  return durable.evaluateDerivedCacheEntry(entry,{principalId:receipt.principalId,scopeId:receipt.scopeId,currentSourceVersions,now});
}

function createAcquisitionJournal(input={}){return durable.createJournal({fabricId:"acquisition",principalId:req(input.principalId,"principalId"),scopeId:String(input.scopeId||"")})}
function appendAcquisitionJournal(journal,{checkpoint,type="CHECKPOINT",at}={}){
  if(!verifyAcquisitionCheckpoint(checkpoint))throw new Error("verified acquisition checkpoint required");
  if(!durable.verifyJournal(journal)||journal.fabricId!=="acquisition"||journal.principalId!==checkpoint.principalId||journal.scopeId!==checkpoint.scopeId)throw new Error("acquisition journal identity mismatch");
  return durable.appendJournal(journal,{type,subjectSeal:checkpoint.seal,detailHash:checkpoint.stateHash,at:at||checkpoint.committedAt});
}
function verifyAcquisitionJournal(j){return durable.verifyJournal(j)&&j.fabricId==="acquisition"}

module.exports=Object.freeze({RECOVERY_ACTION,createAcquisitionCheckpoint,verifyAcquisitionCheckpoint,assessAcquisitionFreshness,recoveryDecision,createAdmissionCacheEntry,verifyAdmissionCacheEntry,evaluateAdmissionCacheEntry,createAcquisitionJournal,appendAcquisitionJournal,verifyAcquisitionJournal});
