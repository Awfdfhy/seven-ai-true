"use strict";
const fs=require("fs"),path=require("path");
const tournament=require("./logo-tournament.cjs");
const portfolioRuntime=require("./logo-candidate-portfolio.cjs");
const hostRuntime=require("./logo-host-evidence.cjs");
const reviewPackRuntime=require("./logo-review-pack.cjs");
const handoffRuntime=require("./logo-review-handoff.cjs");
const closure=require("./logo-tournament-closure.cjs");
const brandExport=require("./logo-brand-export.cjs");
const ROOT=path.resolve(__dirname,".."),DIST=path.join(ROOT,"dist","logo-tournament");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(name,v)=>fs.writeFileSync(path.join(DIST,name),JSON.stringify(v,null,2)+"\n");
const HASH64=/^[0-9a-f]{64}$/i;
function verifyIndependentAiReview(x,{portfolio,hostPack,reviewPack}){
  if(!x||!["seven-logo-independent-ai-review.v1","seven-logo-independent-ai-review.v2"].includes(x.schema)||!HASH64.test(String(x.seal||"")))return false;const {seal,...body}=x;if(seal!==tournament.sha(body))return false;
  const semanticThreshold=x?.preprocessing?.semanticThreshold??x?.preprocessing?.threshold;
  if(x.schema.endsWith(".v2")&&(!HASH64.test(String(x.preprocessingSha256||""))||x.version!==2||semanticThreshold!==0.50))return false;
  if(x.portfolioSeal!==portfolio.manifest.seal||x.hostPackHash!==hostPack.packHash||x.reviewPackSeal!==reviewPack.seal||x.builderContext!==reviewPack.builderContext||x.reviewerContext===x.builderContext||x.authorityBoundary?.independentModel!==true||x.authorityBoundary?.doesNotChooseWinner!==true)return false;
  if(!Array.isArray(x.results)||x.results.length!==portfolio.records.length)return false;
  for(const record of portfolio.records){const r=x.results.find(y=>y.candidateId===record.candidate.id),rc=reviewPack.candidates.find(y=>y.candidateId===record.candidate.id);if(!r||r.candidateSeal!==record.candidate.seal||!handoffRuntime.verifyReviewerSubmission(r.submission,rc.handoff))return false}
  return true;
}
function chooseTradeoff(adjudication,portfolio){
  const ids=[...adjudication.receipt.eligibleChampionIds];if(ids.length<2)throw new Error("tradeoff selection requires multiple eligible candidates");
  const priority=["silhouette","smallSize","adaptiveMask","monochrome","distinctiveness","conceptFit","dayNightFit","durability","implementationSimplicity","assetCost","motionPotential"];
  const entries=new Map(adjudication.entries.map(e=>[e.candidateId,e]));
  let alive=ids.map(id=>({id,ratings:entries.get(id).assessment.ratings,record:portfolio.records.find(r=>r.candidate.id===id)}));
  const trace=[];
  for(const dim of priority){const best=Math.max(...alive.map(x=>x.ratings[dim]));const before=alive.map(x=>x.id);alive=alive.filter(x=>x.ratings[dim]===best);trace.push({dimension:dim,best,before,after:alive.map(x=>x.id)});if(alive.length===1)break}
  if(alive.length>1){const minComplexity=Math.min(...alive.map(x=>x.record.geometry.pathCount*100+x.record.geometry.nodeCount));const before=alive.map(x=>x.id);alive=alive.filter(x=>x.record.geometry.pathCount*100+x.record.geometry.nodeCount===minComplexity);trace.push({dimension:"simplifier-geometry-complexity",best:minComplexity,before,after:alive.map(x=>x.id),direction:"lower-is-better"})}
  if(alive.length!==1)throw new Error(`tradeoff remains genuinely tied after locked qualitative+simplifier policy: ${alive.map(x=>x.id).join(",")}`);
  return {selectedCandidateId:alive[0].id,trace,policy:"EXPLICIT_TRADEOFF_DECISION",reason:`VISUAL-EPOCH-1 explicit Pareto tradeoff decision. Applied locked lexicographic priorities from the Logo Tournament Brief (silhouette/geometry first, then tiny/adaptive/mono/distinctiveness/concept/theme/durability/simplicity/cost/motion) without summing scores. Selection trace seal ${tournament.sha(trace)}.`};
}
function main(){
  const portfolio=portfolioRuntime.buildPortfolio(),hostPack=read(path.join(DIST,"host-visual-evidence.json")),reviewPack=read(path.join(DIST,"review-pack.json")),independent=read(path.join(DIST,"independent-ai-review.json"));
  if(!hostRuntime.verifyPack(hostPack,portfolio.records))throw new Error("HOST evidence invalid at closure");if(!reviewPackRuntime.verifyReviewBundle(reviewPack,{portfolio,hostPack}))throw new Error("review pack invalid at closure");if(!verifyIndependentAiReview(independent,{portfolio,hostPack,reviewPack}))throw new Error("independent AI review invalid at closure");
  const submissionsByCandidate={},hardGateFindingsByCandidate={};for(const r of independent.results){submissionsByCandidate[r.candidateId]=r.submission;hardGateFindingsByCandidate[r.candidateId]=r.findings}
  const adjudication=closure.adjudicateTournament({portfolio,hostPack,reviewPack,submissionsByCandidate,hardGateFindingsByCandidate});if(!closure.verifyTournamentAdjudication(adjudication,{portfolio,hostPack,reviewPack}))throw new Error("tournament adjudication verification failed");write("final-adjudication.json",adjudication.receipt);
  if(adjudication.receipt.selectionState==="NO_CHAMPION"){write("closure-blocked.json",{schema:"seven-logo-wave14-blocked.v1",finalists:adjudication.receipt.finalists,rejected:adjudication.receipt.rejected,inconclusive:adjudication.receipt.inconclusive,comparison:adjudication.receipt.comparison});throw new Error(`Wave 14 legitimately blocked: finalists=${adjudication.receipt.finalists.join(",")||"none"}; rejected=${adjudication.receipt.rejected.join(",")||"none"}; inconclusive=${adjudication.receipt.inconclusive.join(",")||"none"}`)}
  let selected,policy,reason,decisionTrace=[];
  if(adjudication.receipt.selectionState==="UNIQUE_SELECTION_AVAILABLE"){
    selected=adjudication.receipt.eligibleChampionIds[0];policy=adjudication.receipt.comparison.verdict==="UNIQUE_SURVIVOR"?"UNIQUE_SURVIVOR":"UNIQUE_PARETO";reason=`Complete independent review produced one eligible ${adjudication.receipt.comparison.verdict=== "UNIQUE_SURVIVOR"?"survivor":"Pareto-undominated finalist"}; no aesthetic tie-break was needed.`;
  }else{
    const t=chooseTradeoff(adjudication,portfolio);selected=t.selectedCandidateId;policy=t.policy;reason=t.reason;decisionTrace=t.trace;
  }
  const decision=closure.createChampionDecision({adjudication,selectedCandidateId:selected,decider:policy==="EXPLICIT_TRADEOFF_DECISION"?"visual-epoch-1-locked-pareto-policy":"evidence-backed-tournament",deciderContext:policy==="EXPLICIT_TRADEOFF_DECISION"?"independent-governance:visual-epoch-1:pareto-policy-v1":"independent-governance:visual-epoch-1:unique-selection-v1",reason,policy});if(!closure.verifyChampionDecision(decision,adjudication))throw new Error("champion decision verification failed");write("champion-decision.json",{...decision,decisionTrace});
  const materialized=brandExport.materializeBrandExport({root:ROOT,portfolio,adjudication,decision,exporter:"wave14-evidence-backed-brand-export-v1"});
  const summary={schema:"seven-logo-wave14-pre-android-closure.v1",version:1,branch:hostPack.branch,commitSha:hostPack.commitSha,champion:selected,family:portfolio.records.find(r=>r.candidate.id===selected).candidate.family,decisionPolicy:policy,adjudicationSeal:adjudication.receipt.seal,decisionSeal:decision.seal,exportPlanSeal:materialized.plan.seal,brandManifestSeal:materialized.manifest.seal,exportReceiptSeal:materialized.plan.exportReceipt.seal,materializationSeal:materialized.receipt.seal,status:"CHAMPION_EXPORTED_AWAITING_ANDROID_RELEASE_PROOF",remaining:["production Android consumption proof","RELEASE_BUILD_DEVICE adaptive/themed/legacy icon evidence","rollback-safe brand freeze"]};summary.seal=tournament.sha(summary);write("pre-android-closure.json",summary);
  console.log(`Wave 14 tournament: CHAMPION ${selected} (${policy}); brand/final materialized; Android release proof still required`);
}
if(require.main===module){try{main()}catch(e){console.error(e);process.exit(1)}}
module.exports=Object.freeze({verifyIndependentAiReview,chooseTradeoff,main});
