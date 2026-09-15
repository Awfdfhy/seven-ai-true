"use strict";
const fs=require("fs");
const path=require("path");
const tournament=require("./logo-tournament.cjs");
const passb=require("./logo-tournament-passb.cjs");
const portfolioRuntime=require("./logo-candidate-portfolio.cjs");
const hostRuntime=require("./logo-host-evidence.cjs");
const handoffRuntime=require("./logo-review-handoff.cjs");

const VERSION="1.0.0";
const VISUAL_COVERAGE=passb.requiredVisualCoverage();
const VISUAL_STAGES=Object.freeze(Object.keys(VISUAL_COVERAGE));
const HASH64=/^[0-9a-f]{64}$/i;
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function verifySeal(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===tournament.sha(body)}
function uniq(xs){return [...new Set(xs)].sort()}

function stageEvidenceIndex(hostCandidate,stage){
  const packages=(hostCandidate?.packages||[]).filter(p=>p?.binding?.stage===stage);
  return packages.map(p=>Object.freeze({variant:p.binding.variant,bindingSeal:p.binding.seal,evidenceHashV2:p.binding.evidenceHashV2,artifactSha256:p.binding.artifactSha256,artifactPath:p.artifact?.path||null,evidenceTier:p.binding.evidenceTier,environmentIdentity:p.binding.environmentIdentity})).sort((a,b)=>a.variant.localeCompare(b.variant));
}
function assertExactVisualCoverage(hostCandidate,stage){
  const expected=[...(VISUAL_COVERAGE[stage]||[])].sort(),evidence=stageEvidenceIndex(hostCandidate,stage),actual=evidence.map(x=>x.variant).sort();
  if(JSON.stringify(expected)!==JSON.stringify(actual))throw new Error(`${hostCandidate?.candidateId||"candidate"} ${stage} evidence coverage mismatch`);
  if(evidence.some(x=>x.evidenceTier!=="HOST"||!HASH64.test(String(x.bindingSeal||""))||!HASH64.test(String(x.evidenceHashV2||""))||!HASH64.test(String(x.artifactSha256||""))))throw new Error(`${hostCandidate?.candidateId||"candidate"} ${stage} HOST evidence invalid`);
  return evidence;
}
function createStageWorksheet(record,hostCandidate){
  if(!record?.candidate||hostCandidate?.candidateId!==record.candidate.id||hostCandidate?.candidateSeal!==record.candidate.seal)throw new Error("candidate/host evidence mismatch");
  if(hostCandidate?.coverage?.verdict!=="PASS"||hostCandidate.coverage.candidateSeal!==record.candidate.seal)throw new Error("PASS host coverage required");
  const stages={};
  for(const stage of tournament.STAGES){
    if(VISUAL_STAGES.includes(stage)){
      const evidence=assertExactVisualCoverage(hostCandidate,stage);
      stages[stage]={status:"HOST_RENDER_CAPTURED_SEMANTIC_REVIEW_REQUIRED",captureTier:"HOST",renderIntegrity:"PASS",evidence};
    }else if(stage==="HUMAN_EVIDENCE"){
      stages[stage]={status:"OPTIONAL_WHERE_AVAILABLE",evidence:[]};
    }else if(stage==="MOTION_MARK"){
      stages[stage]={status:"INDEPENDENT_REVIEW_REQUIRED",evidence:[],note:"Motion potential must be judged, but motion is never required for recognition."};
    }else{
      stages[stage]={status:"INDEPENDENT_REVIEW_REQUIRED",evidence:[]};
    }
  }
  return Object.freeze({candidateId:record.candidate.id,candidateSeal:record.candidate.seal,hostCoverageSeal:hostCandidate.coverage.seal,stages,dimensions:Object.fromEntries(tournament.DIMENSIONS.map(d=>[d,null])),winnerEligible:false,authorityBoundary:{hostEvidenceProvesRenderIntegrityOnly:true,semanticRatingsStillIndependent:true,humanEvidenceOptional:true,noWinnerClaim:true}});
}
function createSubmissionTemplate({handoff,worksheet}){
  if(!handoffRuntime.verifyReviewHandoff(handoff)||worksheet?.candidateSeal!==handoff.candidateSeal)throw new Error("verified handoff/worksheet required");
  return Object.freeze({schema:"seven-logo-review-submission-template",version:VERSION,handoffSeal:handoff.seal,candidateId:handoff.candidateId,candidateSeal:handoff.candidateSeal,reviewer:null,role:null,reviewerContext:null,reviewReference:null,ratings:Object.fromEntries(tournament.DIMENSIONS.map(d=>[d,null])),landscapeSha256:null,sourceRefs:[],comparedProducts:[],suspiciousImitation:false,notes:"",evidenceRefs:uniq(Object.values(worksheet.stages).flatMap(s=>(s.evidence||[]).map(e=>e.bindingSeal))),instructions:{useDifferentContextFromBuilder:true,ratingsAreIntegersZeroToFour:true,minimumDistinctivenessSources:3,minimumComparedProducts:5,hostEvidenceIsRenderIntegrityNotSemanticApproval:true,humanRecognitionEvidenceOptional:true,doNotChooseWinnerInSubmission:true}});
}
function createReviewBundle({portfolio,hostPack,builderContext="seven-ci-logo-builder-wave14-v1",artifactRef="dist/logo-tournament"}){
  if(!portfolioRuntime.verifyPortfolioManifest(portfolio?.manifest))throw new Error("verified portfolio required");
  if(!hostRuntime.verifyPack(hostPack,portfolio.records))throw new Error("verified HOST visual evidence pack required");
  builderContext=req(builderContext,"builderContext");artifactRef=req(artifactRef,"artifactRef");
  if(!/^[0-9a-f]{40}$/i.test(String(hostPack.commitSha||"")))throw new Error("host pack commitSha must be git sha");
  const hostById=new Map(hostPack.candidates.map(c=>[c.candidateId,c]));
  const candidates=portfolio.records.map(record=>{
    const hc=hostById.get(record.candidate.id);if(!hc)throw new Error(`missing host evidence for ${record.candidate.id}`);
    const worksheet=createStageWorksheet(record,hc);
    const handoff=handoffRuntime.createReviewHandoff({portfolioManifest:portfolio.manifest,candidate:record.candidate,builderContext,branch:hostPack.branch,commitSha:hostPack.commitSha,artifactRef});
    const submissionTemplate=createSubmissionTemplate({handoff,worksheet});
    return Object.freeze({candidateId:record.candidate.id,candidateSeal:record.candidate.seal,handoff,worksheet,submissionTemplate});
  });
  const body={schema:"seven-logo-independent-review-pack",version:VERSION,portfolioSeal:portfolio.manifest.seal,hostPackHash:hostPack.packHash,branch:hostPack.branch,commitSha:hostPack.commitSha,builderContext,artifactRef,candidateCount:candidates.length,candidates,status:"READY_FOR_INDEPENDENT_SEMANTIC_REVIEW",winner:null,freezeEligible:false,remainingGates:["independent semantic/dimension review","independent distinctiveness review","evidence-backed hard-gate adjudication","Pareto finalist comparison and decision","winner export to brand/final","Android production consumption proof","RELEASE_BUILD_DEVICE icon evidence","rollback-safe brand freeze"],authorityBoundary:{sameBuilderContextCannotReview:true,hostEvidenceCannotBecomeSemanticApproval:true,humanEvidenceOptionalButNeverFabricated:true,noWinnerClaim:true,noExportAuthorization:true,noReleaseDeviceClaim:true}};
  return seal(body);
}
function verifyReviewBundle(bundle,{portfolio,hostPack}={}){
  try{
    if(!verifySeal(bundle,"seven-logo-independent-review-pack")||bundle.status!=="READY_FOR_INDEPENDENT_SEMANTIC_REVIEW"||bundle.winner!==null||bundle.freezeEligible!==false||bundle.authorityBoundary?.sameBuilderContextCannotReview!==true)return false;
    if(portfolio){if(!portfolioRuntime.verifyPortfolioManifest(portfolio.manifest)||bundle.portfolioSeal!==portfolio.manifest.seal||bundle.candidateCount!==portfolio.records.length)return false}
    if(hostPack){if(!portfolio||!hostRuntime.verifyPack(hostPack,portfolio.records)||bundle.hostPackHash!==hostPack.packHash||bundle.branch!==hostPack.branch||bundle.commitSha!==hostPack.commitSha)return false}
    const records=portfolio?new Map(portfolio.records.map(r=>[r.candidate.id,r])):null;
    for(const c of bundle.candidates||[]){const r=records?.get(c.candidateId);if(r&&c.candidateSeal!==r.candidate.seal)return false;if(!handoffRuntime.verifyReviewHandoff(c.handoff,r?{portfolioManifest:portfolio.manifest,candidate:r.candidate}:undefined))return false;if(c.worksheet?.candidateSeal!==c.candidateSeal||c.submissionTemplate?.handoffSeal!==c.handoff.seal)return false}
    return (bundle.candidates||[]).length===bundle.candidateCount;
  }catch{return false}
}
function writeReviewBundle({root=process.cwd(),outDir="dist/logo-tournament",portfolio,hostPack,builderContext,artifactRef}={}){
  const bundle=createReviewBundle({portfolio,hostPack,builderContext,artifactRef});if(!verifyReviewBundle(bundle,{portfolio,hostPack}))throw new Error("review bundle verification failed");
  const out=path.resolve(root,outDir),reviewDir=path.join(out,"independent-review");fs.mkdirSync(reviewDir,{recursive:true});
  fs.writeFileSync(path.join(out,"review-pack.json"),JSON.stringify(bundle,null,2));
  fs.writeFileSync(path.join(out,"review-worksheet.json"),JSON.stringify(bundle.candidates.map(c=>c.worksheet),null,2));
  fs.writeFileSync(path.join(out,"review-handoffs.json"),JSON.stringify({schema:"seven-logo-review-handoff-index",version:VERSION,portfolioSeal:bundle.portfolioSeal,hostPackHash:bundle.hostPackHash,branch:bundle.branch,commitSha:bundle.commitSha,builderContext:bundle.builderContext,candidates:bundle.candidates.map(c=>({candidateId:c.candidateId,candidateSeal:c.candidateSeal,handoff:c.handoff,submissionTemplate:c.submissionTemplate}))},null,2));
  for(const c of bundle.candidates){fs.writeFileSync(path.join(reviewDir,`${c.candidateId}-handoff.json`),JSON.stringify(c.handoff,null,2));fs.writeFileSync(path.join(reviewDir,`${c.candidateId}-submission-template.json`),JSON.stringify(c.submissionTemplate,null,2));}
  return bundle;
}
module.exports=Object.freeze({VERSION,VISUAL_STAGES,stageEvidenceIndex,assertExactVisualCoverage,createStageWorksheet,createSubmissionTemplate,createReviewBundle,verifyReviewBundle,writeReviewBundle});
