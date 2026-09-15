"use strict";
const tournament=require("./logo-tournament.cjs");
const passb=require("./logo-tournament-passb.cjs");
const portfolioRuntime=require("./logo-candidate-portfolio.cjs");
const hostRuntime=require("./logo-host-evidence.cjs");
const reviewPackRuntime=require("./logo-review-pack.cjs");
const handoffRuntime=require("./logo-review-handoff.cjs");
const reviewAdjudication=require("./logo-review-adjudication.cjs");

const VERSION="1.0.0";
const HASH64=/^[0-9a-f]{64}$/i;
const DECISION_POLICIES=Object.freeze(["UNIQUE_SURVIVOR","UNIQUE_PARETO","EXPLICIT_TRADEOFF_DECISION"]);
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function verifySeal(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===tournament.sha(body)}
function exactCandidateMap(input,ids,name){if(!input||typeof input!=="object"||Array.isArray(input))throw new Error(`${name} required`);for(const id of ids)if(!input[id])throw new Error(`${name} missing ${id}`);for(const id of Object.keys(input))if(!ids.includes(id))throw new Error(`${name} contains foreign ${id}`);return input}

function adjudicateCandidateEntry({record,portfolioManifest,hostCandidate,reviewCandidate,reviewSubmission,hardGateFindings}){
  const candidate=record.candidate;
  if(hostCandidate?.candidateSeal!==candidate.seal||reviewCandidate?.candidateSeal!==candidate.seal)throw new Error(`candidate evidence drift: ${candidate.id}`);
  if(!handoffRuntime.verifyReviewHandoff(reviewCandidate.handoff,{portfolioManifest,candidate}))throw new Error(`review handoff invalid: ${candidate.id}`);
  if(!handoffRuntime.verifyReviewerSubmission(reviewSubmission,reviewCandidate.handoff))throw new Error(`review submission invalid: ${candidate.id}`);
  const independent=handoffRuntime.materializeIndependentReview({candidate,handoff:reviewCandidate.handoff,submission:reviewSubmission});
  if(!handoffRuntime.verifyIndependentReviewMaterialization(independent,{candidate,handoff:reviewCandidate.handoff,submission:reviewSubmission}))throw new Error(`independent review materialization invalid: ${candidate.id}`);
  const hardGateSubmission=reviewAdjudication.createHardGateSubmission({candidate,handoff:reviewCandidate.handoff,reviewSubmission,findings:hardGateFindings});
  const semantic=reviewAdjudication.materializeHardGateEvidence({candidate,handoff:reviewCandidate.handoff,reviewSubmission,hardGateSubmission});
  if(!reviewAdjudication.verifyHardGateMaterialization(semantic,{candidate,hardGateSubmission,reviewSubmission}))throw new Error(`semantic hard-gate materialization invalid: ${candidate.id}`);
  const hardGate=tournament.evaluateHardGates({candidate,geometry:record.geometry,evidence:semantic.stageEvidence});
  const assessments=[independent.assessment];
  const baseVerdict=tournament.adjudicateCandidate({candidate,hardGate,assessments});
  const evidenceBackedVerdict=passb.adjudicateEvidenceBacked({candidate,geometry:record.geometry,stageEvidence:semantic.stageEvidence,visualPackages:hostCandidate.packages,distinctivenessReceipt:independent.distinctivenessReceipt,assessments});
  if(!passb.verifyEvidenceBackedVerdict(evidenceBackedVerdict,candidate))throw new Error(`evidence-backed verdict invalid: ${candidate.id}`);
  return Object.freeze({candidateId:candidate.id,candidateSeal:candidate.seal,reviewSubmissionSeal:reviewSubmission.seal,reviewerContext:reviewSubmission.reviewerContext,independentReviewSeal:independent.receipt.seal,hardGateSubmissionSeal:hardGateSubmission.seal,hardGateMaterializationSeal:semantic.receipt.seal,hardGate,assessment:independent.assessment,distinctivenessReceipt:independent.distinctivenessReceipt,baseVerdict,evidenceBackedVerdict});
}

function adjudicateTournament({portfolio,hostPack,reviewPack,submissionsByCandidate,hardGateFindingsByCandidate}){
  if(!portfolioRuntime.verifyPortfolioManifest(portfolio?.manifest))throw new Error("verified portfolio required");
  if(!hostRuntime.verifyPack(hostPack,portfolio.records))throw new Error("verified HOST pack required");
  if(!reviewPackRuntime.verifyReviewBundle(reviewPack,{portfolio,hostPack}))throw new Error("verified review pack required");
  const ids=portfolio.records.map(r=>r.candidate.id).sort();
  exactCandidateMap(submissionsByCandidate,ids,"submissionsByCandidate");exactCandidateMap(hardGateFindingsByCandidate,ids,"hardGateFindingsByCandidate");
  const hostById=new Map(hostPack.candidates.map(x=>[x.candidateId,x])),reviewById=new Map(reviewPack.candidates.map(x=>[x.candidateId,x]));
  const entries=[];
  for(const record of portfolio.records){const id=record.candidate.id;entries.push(adjudicateCandidateEntry({record,portfolioManifest:portfolio.manifest,hostCandidate:hostById.get(id),reviewCandidate:reviewById.get(id),reviewSubmission:submissionsByCandidate[id],hardGateFindings:hardGateFindingsByCandidate[id]}));}
  const finalists=entries.filter(x=>x.baseVerdict.verdict==="FINALIST"&&x.evidenceBackedVerdict.verdict==="FINALIST");
  const rejected=entries.filter(x=>x.baseVerdict.verdict==="REJECT"||x.evidenceBackedVerdict.verdict==="REJECT").map(x=>x.candidateId).sort();
  const finalistIds=new Set(finalists.map(x=>x.candidateId));const rejectedIds=new Set(rejected);
  const inconclusive=entries.filter(x=>!finalistIds.has(x.candidateId)&&!rejectedIds.has(x.candidateId)).map(x=>x.candidateId).sort();
  let comparison={verdict:"INCONCLUSIVE",reason:inconclusive.length?"candidate-review-inconclusive":"no-finalist"},selectionState="NO_CHAMPION",eligible=[];
  // A candidate cannot win while any competitor remains inconclusive. This prevents premature survivor/Pareto selection.
  if(inconclusive.length===0&&finalists.length===1){comparison={verdict:"UNIQUE_SURVIVOR",undominated:[finalists[0].candidateId],dimensionFloors:{[finalists[0].candidateId]:finalists[0].baseVerdict.dimensionFloor}};selectionState="UNIQUE_SELECTION_AVAILABLE";eligible=[finalists[0].candidateId]}
  else if(inconclusive.length===0&&finalists.length>=2){
    const candidates=finalists.map(x=>portfolio.records.find(r=>r.candidate.id===x.candidateId).candidate),verdicts={},assessmentsByCandidate={};
    for(const x of finalists){verdicts[x.candidateId]=x.baseVerdict;assessmentsByCandidate[x.candidateId]=[x.assessment]}
    comparison=tournament.compareFinalists({candidates,verdicts,assessmentsByCandidate});eligible=arr(comparison.undominated);
    selectionState=comparison.verdict==="FINALIST"&&eligible.length===1?"UNIQUE_SELECTION_AVAILABLE":comparison.verdict==="TRADEOFF_REQUIRES_DECISION"?"EXPLICIT_DECISION_REQUIRED":"NO_CHAMPION";
  }
  const body={schema:"seven-logo-tournament-adjudication",version:VERSION,portfolioSeal:portfolio.manifest.seal,hostPackHash:hostPack.packHash,reviewPackSeal:reviewPack.seal,builderContext:reviewPack.builderContext,branch:hostPack.branch,commitSha:hostPack.commitSha,candidateCount:entries.length,entries:entries.map(x=>({candidateId:x.candidateId,candidateSeal:x.candidateSeal,reviewSubmissionSeal:x.reviewSubmissionSeal,reviewerContext:x.reviewerContext,independentReviewSeal:x.independentReviewSeal,hardGateSubmissionSeal:x.hardGateSubmissionSeal,hardGateMaterializationSeal:x.hardGateMaterializationSeal,hardGateSeal:x.hardGate.seal,assessmentSeal:x.assessment.seal,distinctivenessSeal:x.distinctivenessReceipt.seal,baseVerdictSeal:x.baseVerdict.seal,baseVerdict:x.baseVerdict.verdict,evidenceBackedVerdictSeal:x.evidenceBackedVerdict.seal,evidenceBackedVerdict:x.evidenceBackedVerdict.verdict})),finalists:finalists.map(x=>x.candidateId).sort(),rejected,inconclusive,comparison,eligibleChampionIds:[...eligible].sort(),selectionState,winner:null,exportAuthorized:false,authorityBoundary:{fullCandidateCoverageRequired:true,inconclusiveCompetitorBlocksChampion:true,reviewIndependencePreserved:true,adjudicationDoesNotChooseTradeoff:true,noExportBeforeChampionDecision:true,noAndroidProofClaim:true}};
  return Object.freeze({receipt:seal(body),entries});
}
function verifyTournamentAdjudication(result,{portfolio,hostPack,reviewPack}={}){
  try{const r=result?.receipt;if(!verifySeal(r,"seven-logo-tournament-adjudication")||r.winner!==null||r.exportAuthorized!==false||r.candidateCount!==arr(r.entries).length||r.authorityBoundary?.fullCandidateCoverageRequired!==true||r.authorityBoundary?.inconclusiveCompetitorBlocksChampion!==true)return false;if(r.inconclusive.length&&r.eligibleChampionIds.length)return false;if(portfolio&&(!portfolioRuntime.verifyPortfolioManifest(portfolio.manifest)||r.portfolioSeal!==portfolio.manifest.seal||r.candidateCount!==portfolio.records.length))return false;if(hostPack&&r.hostPackHash!==hostPack.packHash)return false;if(reviewPack&&(r.reviewPackSeal!==reviewPack.seal||r.builderContext!==reviewPack.builderContext))return false;return true}catch{return false}
}

function createChampionDecision({adjudication,selectedCandidateId,decider,deciderContext,reason,policy}){
  const r=adjudication?.receipt;if(!verifyTournamentAdjudication(adjudication))throw new Error("verified tournament adjudication required");
  selectedCandidateId=req(selectedCandidateId,"selectedCandidateId");decider=req(decider,"decider");deciderContext=req(deciderContext,"deciderContext");reason=req(reason,"reason");
  if(!DECISION_POLICIES.includes(policy))throw new Error("decision policy invalid");if(!r.eligibleChampionIds.includes(selectedCandidateId))throw new Error("selected candidate is not eligible");
  if(r.selectionState==="UNIQUE_SELECTION_AVAILABLE"){
    const expected=r.comparison.verdict==="UNIQUE_SURVIVOR"?"UNIQUE_SURVIVOR":"UNIQUE_PARETO";if(policy!==expected)throw new Error(`unique selection requires ${expected}`);if(r.eligibleChampionIds.length!==1)throw new Error("unique selection cardinality invalid");
  }else if(r.selectionState==="EXPLICIT_DECISION_REQUIRED"){
    if(policy!=="EXPLICIT_TRADEOFF_DECISION")throw new Error("tradeoff requires explicit decision policy");
    if(deciderContext===r.builderContext)throw new Error("tradeoff decider must be independent from builder context");
  }else throw new Error("adjudication has no selectable champion");
  return seal({schema:"seven-logo-champion-decision",version:VERSION,adjudicationSeal:r.seal,portfolioSeal:r.portfolioSeal,selectedCandidateId,policy,decider,deciderContext,reason,eligibleChampionIds:[...r.eligibleChampionIds],status:"CHAMPION_SELECTED",authorityBoundary:{authorizesCandidateSelectionOnly:true,doesNotProveAndroidConsumption:true,doesNotProveReleaseDeviceEvidence:true,brandFreezeStillBlocked:true}});
}
function verifyChampionDecision(d,adjudication){
  try{if(!verifySeal(d,"seven-logo-champion-decision")||d.status!=="CHAMPION_SELECTED"||d.authorityBoundary?.brandFreezeStillBlocked!==true)return false;if(adjudication){const r=adjudication.receipt;if(!verifyTournamentAdjudication(adjudication)||d.adjudicationSeal!==r.seal||d.portfolioSeal!==r.portfolioSeal||!r.eligibleChampionIds.includes(d.selectedCandidateId))return false;if(r.selectionState==="EXPLICIT_DECISION_REQUIRED"&&(d.policy!=="EXPLICIT_TRADEOFF_DECISION"||d.deciderContext===r.builderContext))return false}return DECISION_POLICIES.includes(d.policy)}catch{return false}
}

function selectedEntry({adjudication,decision}){if(!verifyChampionDecision(decision,adjudication))throw new Error("verified champion decision required");const entry=adjudication.entries.find(x=>x.candidateId===decision.selectedCandidateId);if(!entry)throw new Error("champion entry unavailable");return entry}

module.exports=Object.freeze({VERSION,DECISION_POLICIES,adjudicateCandidateEntry,adjudicateTournament,verifyTournamentAdjudication,createChampionDecision,verifyChampionDecision,selectedEntry});
