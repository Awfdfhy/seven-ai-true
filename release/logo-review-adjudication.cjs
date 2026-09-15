"use strict";
const tournament=require("./logo-tournament.cjs");
const handoffRuntime=require("./logo-review-handoff.cjs");

const VERSION="1.0.0";
const HASH64=/^[0-9a-f]{64}$/i;
const REQUIRED_CONTEXTS=Object.freeze(["launcher","splash","sidebar","topbar","settings"]);
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function verifySeal(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===tournament.sha(body)}
function bool(v,n){if(typeof v!=="boolean")throw new Error(`${n} must be boolean`);return v}
function exactBooleanMap(input,keys,n){if(!input||typeof input!=="object"||Array.isArray(input))throw new Error(`${n} required`);const out={};for(const k of keys)out[k]=bool(input[k],`${n}.${k}`);for(const k of Object.keys(input))if(!keys.map(String).includes(String(k)))throw new Error(`${n}.${k} unknown`);return out}
function normalizeFindings(findings={}){
  const tiny=exactBooleanMap(findings.tinySizes,tournament.REQUIRED_SIZES.map(String),"tinySizes");
  const masks=exactBooleanMap(findings.adaptiveMasks,tournament.REQUIRED_MASKS,"adaptiveMasks");
  const contexts=exactBooleanMap(findings.productContexts,REQUIRED_CONTEXTS,"productContexts");
  const dayNight=findings.dayNight;if(!dayNight||typeof dayNight!=="object"||Array.isArray(dayNight))throw new Error("dayNight required");
  const normalizedDayNight={sameCoreGeometry:bool(dayNight.sameCoreGeometry,"dayNight.sameCoreGeometry"),lightBackgroundPass:bool(dayNight.lightBackgroundPass,"dayNight.lightBackgroundPass"),darkBackgroundPass:bool(dayNight.darkBackgroundPass,"dayNight.darkBackgroundPass")};
  return Object.freeze({silhouetteIdentifiable:bool(findings.silhouetteIdentifiable,"silhouetteIdentifiable"),tinySizes:tiny,adaptiveMasks:masks,monochromeOneColorSurvives:bool(findings.monochromeOneColorSurvives,"monochromeOneColorSurvives"),dayNight:normalizedDayNight,productContexts:contexts,simplifierSurvives:bool(findings.simplifierSurvives,"simplifierSurvives")});
}
function createHardGateSubmission({candidate,handoff,reviewSubmission,findings}){
  if(!tournament.verifyCandidate(candidate))throw new Error("verified candidate required");
  if(!handoffRuntime.verifyReviewHandoff(handoff)||handoff.candidateSeal!==candidate.seal)throw new Error("candidate/handoff mismatch");
  if(!handoffRuntime.verifyReviewerSubmission(reviewSubmission,handoff)||reviewSubmission.candidateSeal!==candidate.seal)throw new Error("verified independent review submission required");
  const normalized=normalizeFindings(findings);
  return seal({schema:"seven-logo-review-hard-gate-submission",version:VERSION,candidateId:candidate.id,candidateSeal:candidate.seal,handoffSeal:handoff.seal,reviewSubmissionSeal:reviewSubmission.seal,reviewer:reviewSubmission.reviewer,reviewerContext:reviewSubmission.reviewerContext,builderContext:reviewSubmission.builderContext,reviewReference:reviewSubmission.reviewReference,findings:normalized,independent:true,authorityBoundary:{semanticObservationOnly:true,doesNotChooseWinner:true,doesNotAuthorizeExport:true,doesNotProveAndroidConsumption:true}});
}
function verifyHardGateSubmission(s,{candidate,handoff,reviewSubmission}={}){
  try{
    if(!verifySeal(s,"seven-logo-review-hard-gate-submission")||s.independent!==true||s.reviewerContext===s.builderContext||s.authorityBoundary?.doesNotChooseWinner!==true)return false;
    normalizeFindings(s.findings);
    if(candidate&&(!tournament.verifyCandidate(candidate)||s.candidateSeal!==candidate.seal||s.candidateId!==candidate.id))return false;
    if(handoff&&(!handoffRuntime.verifyReviewHandoff(handoff)||s.handoffSeal!==handoff.seal||s.candidateSeal!==handoff.candidateSeal))return false;
    if(reviewSubmission&&(!handoffRuntime.verifyReviewerSubmission(reviewSubmission,handoff)||s.reviewSubmissionSeal!==reviewSubmission.seal||s.reviewer!==reviewSubmission.reviewer||s.reviewerContext!==reviewSubmission.reviewerContext||s.reviewReference!==reviewSubmission.reviewReference))return false;
    return true;
  }catch{return false}
}
function materializeHardGateEvidence({candidate,handoff,reviewSubmission,hardGateSubmission}){
  if(!verifyHardGateSubmission(hardGateSubmission,{candidate,handoff,reviewSubmission}))throw new Error("verified hard-gate submission required");
  const f=hardGateSubmission.findings,producer=`${reviewSubmission.reviewer}:${reviewSubmission.reviewReference}:hard-gate`,stageEvidence=[];
  // SILHOUETTE and SIMPLIFIER are presence-only in the v1 tournament evaluator. Failed findings are therefore omitted so they fail closed as missing instead of being laundered into PASS.
  if(f.silhouetteIdentifiable)stageEvidence.push(tournament.createStageEvidence({candidate,stage:"SILHOUETTE",producer,independent:true,observations:{identifiable:true}}));
  stageEvidence.push(tournament.createStageEvidence({candidate,stage:"TINY_SIZE",producer,independent:true,observations:{sizes:tournament.REQUIRED_SIZES.map(px=>({px,identifiable:f.tinySizes[String(px)]}))}}));
  stageEvidence.push(tournament.createStageEvidence({candidate,stage:"ADAPTIVE_MASK",producer,independent:true,observations:{masks:tournament.REQUIRED_MASKS.map(mask=>({mask,essentialPreserved:f.adaptiveMasks[mask]}))}}));
  stageEvidence.push(tournament.createStageEvidence({candidate,stage:"MONOCHROME",producer,independent:true,observations:{oneColorSurvives:f.monochromeOneColorSurvives}}));
  stageEvidence.push(tournament.createStageEvidence({candidate,stage:"DAY_NIGHT",producer,independent:true,observations:{...f.dayNight}}));
  stageEvidence.push(tournament.createStageEvidence({candidate,stage:"PRODUCT_CONTEXT",producer,independent:true,observations:{contexts:REQUIRED_CONTEXTS.filter(x=>f.productContexts[x])}}));
  stageEvidence.push(tournament.createStageEvidence({candidate,stage:"DISTINCTIVENESS",producer,independent:true,observations:{suspiciousImitation:reviewSubmission.suspiciousImitation===true,landscapeSha256:reviewSubmission.landscapeSha256,sourceRefs:reviewSubmission.sourceRefs,comparedProducts:reviewSubmission.comparedProducts}}));
  if(f.simplifierSurvives)stageEvidence.push(tournament.createStageEvidence({candidate,stage:"SIMPLIFIER",producer,independent:true,observations:{simplifiedStillIdentifiable:true}}));
  if(!stageEvidence.every(e=>tournament.verifyStageEvidence(e,candidate)))throw new Error("materialized stage evidence verification failed");
  const hardGate=tournament.evaluateHardGates({candidate,geometry:null,evidence:[]});
  void hardGate;
  const receipt=seal({schema:"seven-logo-review-hard-gate-materialization",version:VERSION,candidateSeal:candidate.seal,hardGateSubmissionSeal:hardGateSubmission.seal,reviewSubmissionSeal:reviewSubmission.seal,stageEvidenceSeals:stageEvidence.map(e=>e.seal).sort(),stageCount:stageEvidence.length,status:"EVIDENCE_MATERIALIZED",authorityBoundary:{doesNotChooseWinner:true,doesNotAuthorizeExport:true,doesNotProveAndroidConsumption:true}});
  return Object.freeze({receipt,stageEvidence});
}
function verifyHardGateMaterialization(materialized,{candidate,hardGateSubmission,reviewSubmission}={}){
  try{const r=materialized?.receipt,e=materialized?.stageEvidence;if(!verifySeal(r,"seven-logo-review-hard-gate-materialization")||!Array.isArray(e)||r.stageCount!==e.length||r.stageEvidenceSeals.join("|")!==e.map(x=>x.seal).sort().join("|"))return false;if(candidate&&(!tournament.verifyCandidate(candidate)||r.candidateSeal!==candidate.seal||!e.every(x=>tournament.verifyStageEvidence(x,candidate))))return false;if(hardGateSubmission&&r.hardGateSubmissionSeal!==hardGateSubmission.seal)return false;if(reviewSubmission&&r.reviewSubmissionSeal!==reviewSubmission.seal)return false;return r.authorityBoundary?.doesNotChooseWinner===true}catch{return false}
}
module.exports=Object.freeze({VERSION,REQUIRED_CONTEXTS,normalizeFindings,createHardGateSubmission,verifyHardGateSubmission,materializeHardGateEvidence,verifyHardGateMaterialization});
