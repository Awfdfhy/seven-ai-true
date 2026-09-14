"use strict";
const tournament=require("./logo-tournament.cjs");
const passb=require("./logo-tournament-passb.cjs");
const portfolioRuntime=require("./logo-candidate-portfolio.cjs");

const VERSION="1.0.0";
const HASH64=/^[0-9a-f]{64}$/i;
const REVIEW_ROLES=Object.freeze(["INDEPENDENT_BRAND_REVIEWER","INDEPENDENT_VISUAL_REVIEWER","HUMAN_PRODUCT_REVIEWER"]);
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function arr(v){return Array.isArray(v)?v:[]}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function verifySeal(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===tournament.sha(body)}
function uniqueStrings(xs,n){const out=[...new Set(arr(xs).map(x=>req(x,n)))].sort();if(out.length!==arr(xs).length)throw new Error(`duplicate ${n}`);return out}
function candidateEntry(manifest,candidate){
  if(!portfolioRuntime.verifyPortfolioManifest(manifest))throw new Error("verified portfolio manifest required");
  if(!tournament.verifyCandidate(candidate))throw new Error("verified candidate required");
  const entry=arr(manifest.candidates).find(x=>x.id===candidate.id);if(!entry||entry.candidateSeal!==candidate.seal)throw new Error("candidate is not exact member of portfolio manifest");return entry;
}

function createReviewHandoff({portfolioManifest,candidate,builderContext,branch,commitSha,artifactRef}){
  const entry=candidateEntry(portfolioManifest,candidate);builderContext=req(builderContext,"builderContext");branch=req(branch,"branch");commitSha=req(commitSha,"commitSha");if(!/^[0-9a-f]{40}$/i.test(commitSha))throw new Error("commitSha must be git sha");artifactRef=req(artifactRef,"artifactRef");
  const body={schema:"seven-logo-review-handoff",version:VERSION,portfolioSeal:portfolioManifest.seal,candidateId:candidate.id,candidateSeal:candidate.seal,family:candidate.family,name:candidate.name,concept:candidate.concept,builderContext,branch,commitSha:commitSha.toLowerCase(),artifactRef,assets:arr(entry.assets).map(x=>({kind:x.kind,file:x.file,sha256:x.sha256,assetSeal:x.assetSeal})).sort((a,b)=>a.kind.localeCompare(b.kind)),requiredDimensions:[...tournament.DIMENSIONS],requiredTinySizes:[...tournament.REQUIRED_SIZES],requiredMasks:[...tournament.REQUIRED_MASKS],reviewRequirements:{independentContext:true,minimumDistinctivenessSources:3,minimumComparedProducts:5,noScalarWinner:true,noSelfPromotion:true,releaseDeviceProofStillRequired:true},status:"AWAITING_INDEPENDENT_REVIEW"};return seal(body)
}
function verifyReviewHandoff(h,{portfolioManifest,candidate}={}){
  try{if(!verifySeal(h,"seven-logo-review-handoff")||h.status!=="AWAITING_INDEPENDENT_REVIEW"||!Array.isArray(h.assets)||h.assets.length!==7)return false;if(portfolioManifest&&candidate){const entry=candidateEntry(portfolioManifest,candidate);if(h.portfolioSeal!==portfolioManifest.seal||h.candidateSeal!==candidate.seal||h.candidateId!==candidate.id)return false;if(entry.assets.length!==h.assets.length)return false}return true}catch{return false}
}

function createReviewerSubmission({handoff,reviewer,role,reviewerContext,ratings,landscapeSha256,sourceRefs,comparedProducts,suspiciousImitation=false,notes="",evidenceRefs=[],reviewReference}){
  if(!verifyReviewHandoff(handoff))throw new Error("verified review handoff required");reviewer=req(reviewer,"reviewer");role=req(role,"role");if(!REVIEW_ROLES.includes(role))throw new Error("review role invalid");reviewerContext=req(reviewerContext,"reviewerContext");if(reviewerContext===handoff.builderContext)throw new Error("reviewer context must be independent from builder context");reviewReference=req(reviewReference,"reviewReference");
  if(!ratings||typeof ratings!=="object")throw new Error("ratings required");const normalized={};for(const d of tournament.DIMENSIONS){const v=ratings[d];if(!Number.isInteger(v)||v<0||v>4)throw new Error(`rating ${d} must be integer 0..4`);normalized[d]=v}
  if(!HASH64.test(String(landscapeSha256||"")))throw new Error("landscapeSha256 must be sha256");const refs=uniqueStrings(sourceRefs,"sourceRef");if(refs.length<3)throw new Error("at least three distinctiveness source refs required");const products=uniqueStrings(comparedProducts,"comparedProduct");if(products.length<5)throw new Error("at least five compared products required");const evRefs=uniqueStrings(evidenceRefs,"evidenceRef");
  const body={schema:"seven-logo-review-submission",version:VERSION,handoffSeal:handoff.seal,portfolioSeal:handoff.portfolioSeal,candidateId:handoff.candidateId,candidateSeal:handoff.candidateSeal,reviewer,role,reviewerContext,builderContext:handoff.builderContext,reviewReference,ratings:normalized,landscapeSha256:String(landscapeSha256).toLowerCase(),sourceRefs:refs,comparedProducts:products,suspiciousImitation:!!suspiciousImitation,notes:String(notes||""),evidenceRefs:evRefs,independent:true};return seal(body)
}
function verifyReviewerSubmission(s,handoff){
  try{if(!verifySeal(s,"seven-logo-review-submission")||s.independent!==true||s.reviewerContext===s.builderContext||!REVIEW_ROLES.includes(s.role))return false;if(handoff&&(!verifyReviewHandoff(handoff)||s.handoffSeal!==handoff.seal||s.candidateSeal!==handoff.candidateSeal||s.portfolioSeal!==handoff.portfolioSeal))return false;for(const d of tournament.DIMENSIONS)if(!Number.isInteger(s.ratings?.[d])||s.ratings[d]<0||s.ratings[d]>4)return false;return arr(s.sourceRefs).length>=3&&arr(s.comparedProducts).length>=5&&HASH64.test(String(s.landscapeSha256||""))}catch{return false}
}

function materializeIndependentReview({candidate,handoff,submission}){
  if(!tournament.verifyCandidate(candidate)||!verifyReviewHandoff(handoff)||handoff.candidateSeal!==candidate.seal)throw new Error("candidate/handoff mismatch");if(!verifyReviewerSubmission(submission,handoff))throw new Error("verified independent reviewer submission required");
  const assessment=tournament.createDimensionAssessment({candidate,assessor:`${submission.reviewer}:${submission.reviewReference}`,independent:true,ratings:submission.ratings,notes:{role:submission.role,reviewReference:submission.reviewReference,evidenceRefs:submission.evidenceRefs,notes:submission.notes}});
  const distinctivenessReceipt=passb.createDistinctivenessReceipt({candidate,reviewer:submission.reviewer,reviewerContext:submission.reviewerContext,builderContext:submission.builderContext,landscapeSha256:submission.landscapeSha256,sourceRefs:submission.sourceRefs,comparedProducts:submission.comparedProducts,suspiciousImitation:submission.suspiciousImitation,notes:submission.notes});
  const body={schema:"seven-logo-independent-review-materialization",version:VERSION,candidateSeal:candidate.seal,handoffSeal:handoff.seal,submissionSeal:submission.seal,assessmentSeal:assessment.seal,distinctivenessSeal:distinctivenessReceipt.seal,distinctivenessVerdict:distinctivenessReceipt.verdict,status:distinctivenessReceipt.verdict==="BLOCK"?"REVIEW_BLOCK":"REVIEW_ADMISSIBLE",authorityBoundary:{doesNotCreateHardGateEvidence:true,doesNotChooseWinner:true,doesNotAuthorizeExport:true,doesNotProveAndroidConsumption:true}};
  return Object.freeze({receipt:seal(body),assessment,distinctivenessReceipt})
}
function verifyIndependentReviewMaterialization(materialized,{candidate,handoff,submission}={}){
  try{const r=materialized?.receipt,a=materialized?.assessment,d=materialized?.distinctivenessReceipt;if(!verifySeal(r,"seven-logo-independent-review-materialization")||!tournament.verifyDimensionAssessment(a,candidate)||!passb.verifyDistinctivenessReceipt(d,candidate))return false;if(candidate&&r.candidateSeal!==candidate.seal)return false;if(handoff&&r.handoffSeal!==handoff.seal)return false;if(submission&&r.submissionSeal!==submission.seal)return false;return r.assessmentSeal===a.seal&&r.distinctivenessSeal===d.seal&&r.authorityBoundary?.doesNotChooseWinner===true}catch{return false}
}

function createReviewRegistry({portfolioManifest}){if(!portfolioRuntime.verifyPortfolioManifest(portfolioManifest))throw new Error("verified portfolio manifest required");return seal({schema:"seven-logo-review-registry",version:VERSION,portfolioSeal:portfolioManifest.seal,revision:0,entries:{}})}
function verifyReviewRegistry(r,portfolioManifest){if(!verifySeal(r,"seven-logo-review-registry"))return false;return !portfolioManifest||portfolioRuntime.verifyPortfolioManifest(portfolioManifest)&&r.portfolioSeal===portfolioManifest.seal}
function appendIndependentReview(registry,materialized){
  if(!verifyReviewRegistry(registry)||!verifyIndependentReviewMaterialization(materialized))throw new Error("verified registry/materialized review required");const r=materialized.receipt,key=`${r.candidateSeal}:${r.submissionSeal}`;if(registry.entries[key])return registry;const entries={...registry.entries,[key]:{candidateSeal:r.candidateSeal,submissionSeal:r.submissionSeal,assessmentSeal:r.assessmentSeal,distinctivenessSeal:r.distinctivenessSeal,status:r.status}},body={schema:registry.schema,version:registry.version,portfolioSeal:registry.portfolioSeal,revision:registry.revision+1,entries};return seal(body)
}

module.exports=Object.freeze({VERSION,REVIEW_ROLES,createReviewHandoff,verifyReviewHandoff,createReviewerSubmission,verifyReviewerSubmission,materializeIndependentReview,verifyIndependentReviewMaterialization,createReviewRegistry,verifyReviewRegistry,appendIndependentReview});
