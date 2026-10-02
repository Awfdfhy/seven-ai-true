"use strict";
const tournament=require("./logo-tournament.cjs");
const visual=require("./visual-evidence-runtime-final.cjs");

const VISUAL_STAGES=new Set(["SILHOUETTE","TINY_SIZE","ADAPTIVE_MASK","MONOCHROME","DAY_NIGHT","PRODUCT_CONTEXT"]);
const RELEASE_CONTEXTS=Object.freeze(["adaptive-icon","themed-icon","legacy-icon"]);
const HASH64=/^[0-9a-f]{64}$/i;
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===tournament.sha(body)}
function sourceRef(candidate,stage,variant){return `seven-logo-candidate:${candidate.seal}:${stage}:${variant}`}
function tagSet(s){return new Set(arr(s?.tags).map(String))}

function createVisualEvidenceBinding({candidate,stage,variant,scenario,artifact,evidence}){
  if(!tournament.verifyCandidate(candidate))throw new Error("verified candidate required");
  stage=req(stage,"stage");if(!VISUAL_STAGES.has(stage))throw new Error("stage is not visual-evidence governed");
  variant=req(variant,"variant");
  if(!visual.verifyEvidence(evidence,scenario,artifact))throw new Error("authentic visual v2 evidence required");
  if(evidence.status!==visual.VERDICT.PASS)throw new Error("visual evidence must PASS");
  const tags=tagSet(scenario),candidateTag=`logo-candidate:${candidate.id}`,stageTag=`logo-stage:${stage}`,variantTag=`logo-variant:${variant}`;
  if(!tags.has(candidateTag)||!tags.has(stageTag)||!tags.has(variantTag))throw new Error("scenario lacks exact candidate/stage/variant tags");
  const expected=sourceRef(candidate,stage,variant);if(artifact.sourceRef!==expected)throw new Error("artifact sourceRef is not candidate/stage/variant bound");
  if(evidence.foundation?.artifactHash!==artifact.artifactHash||evidence.foundation?.scenarioHash!==scenario.scenarioHash)throw new Error("evidence artifact/scenario drift");
  const body={schema:"seven-logo-visual-binding",version:1,candidateId:candidate.id,candidateSeal:candidate.seal,stage,variant,scenarioHash:scenario.scenarioHash,artifactHash:artifact.artifactHash,artifactSha256:artifact.sha256,evidenceHashV2:evidence.evidenceHashV2,evidenceTier:evidence.foundation.tier,environmentIdentity:evidence.environmentIdentity,branch:evidence.foundation.branch,commitSha:evidence.foundation.commitSha,sourceRef:expected};
  return seal(body);
}
function verifyVisualEvidenceBinding(binding,{candidate,scenario,artifact,evidence}={}){
  try{
    if(!verifySealed(binding,"seven-logo-visual-binding"))return false;
    if(candidate&&(!tournament.verifyCandidate(candidate)||binding.candidateSeal!==candidate.seal||binding.candidateId!==candidate.id))return false;
    if(scenario&&artifact&&evidence){
      if(!visual.verifyEvidence(evidence,scenario,artifact)||evidence.status!==visual.VERDICT.PASS)return false;
      if(binding.scenarioHash!==scenario.scenarioHash||binding.artifactHash!==artifact.artifactHash||binding.artifactSha256!==artifact.sha256||binding.evidenceHashV2!==evidence.evidenceHashV2)return false;
      if(binding.environmentIdentity!==evidence.environmentIdentity||binding.evidenceTier!==evidence.foundation.tier||binding.branch!==evidence.foundation.branch||binding.commitSha!==evidence.foundation.commitSha)return false;
      if(artifact.sourceRef!==binding.sourceRef||binding.sourceRef!==sourceRef(candidate,binding.stage,binding.variant))return false;
      const tags=tagSet(scenario);if(!tags.has(`logo-candidate:${candidate.id}`)||!tags.has(`logo-stage:${binding.stage}`)||!tags.has(`logo-variant:${binding.variant}`))return false;
    }
    return true;
  }catch{return false}
}

function requiredVisualCoverage(){
  return Object.freeze({
    SILHOUETTE:["mono-silhouette"],
    TINY_SIZE:tournament.REQUIRED_SIZES.map(x=>`size-${x}`),
    ADAPTIVE_MASK:tournament.REQUIRED_MASKS.map(x=>`mask-${x}`),
    MONOCHROME:["one-color"],
    DAY_NIGHT:["day","night"],
    PRODUCT_CONTEXT:["launcher","splash","sidebar","topbar","settings"]
  });
}
function evaluateVisualEvidenceCoverage({candidate,packages}){
  if(!tournament.verifyCandidate(candidate))throw new Error("verified candidate required");
  const seen=new Set(),failures=[];let commonBranch=null,commonCommit=null;
  for(const pkg of arr(packages)){
    const {binding,scenario,artifact,evidence}=pkg||{};
    if(!verifyVisualEvidenceBinding(binding,{candidate,scenario,artifact,evidence})){failures.push("invalid-binding");continue}
    const key=`${binding.stage}:${binding.variant}`;if(seen.has(key)){failures.push(`duplicate-binding:${key}`);continue}seen.add(key);
    if(commonBranch==null){commonBranch=binding.branch;commonCommit=binding.commitSha}else if(binding.branch!==commonBranch||binding.commitSha!==commonCommit)failures.push(`cross-revision-evidence:${key}`);
  }
  const missing=[];for(const [stage,variants] of Object.entries(requiredVisualCoverage()))for(const variant of variants)if(!seen.has(`${stage}:${variant}`))missing.push(`${stage}:${variant}`);
  const body={schema:"seven-logo-visual-coverage",version:1,candidateSeal:candidate.seal,branch:commonBranch,commitSha:commonCommit,covered:[...seen].sort(),missing:missing.sort(),failures:[...new Set(failures)].sort(),verdict:failures.length?"BLOCK":missing.length?"INCONCLUSIVE":"PASS"};
  return seal(body);
}
function verifyVisualEvidenceCoverage(r,candidate){return verifySealed(r,"seven-logo-visual-coverage")&&(!candidate||r.candidateSeal===candidate.seal)}

function createDistinctivenessReceipt({candidate,reviewer,reviewerContext,builderContext,landscapeSha256,sourceRefs,comparedProducts,suspiciousImitation=false,notes=""}){
  if(!tournament.verifyCandidate(candidate))throw new Error("verified candidate required");reviewer=req(reviewer,"reviewer");reviewerContext=req(reviewerContext,"reviewerContext");builderContext=req(builderContext,"builderContext");
  if(reviewerContext===builderContext)throw new Error("distinctiveness review must be context-independent from builder");
  if(!HASH64.test(String(landscapeSha256||"")))throw new Error("landscapeSha256 required");
  const refs=[...new Set(arr(sourceRefs).map(x=>req(x,"sourceRef")))].sort();if(refs.length<3)throw new Error("distinctiveness review needs at least three source refs");
  const products=[...new Set(arr(comparedProducts).map(x=>req(x,"comparedProduct")))].sort();if(products.length<5)throw new Error("distinctiveness review needs at least five compared products");
  const body={schema:"seven-logo-distinctiveness-receipt",version:1,candidateSeal:candidate.seal,reviewer,reviewerContext,builderContext,landscapeSha256:String(landscapeSha256).toLowerCase(),sourceRefs:refs,comparedProducts:products,suspiciousImitation:!!suspiciousImitation,notes:String(notes||""),verdict:suspiciousImitation?"BLOCK":"PASS"};return seal(body);
}
function verifyDistinctivenessReceipt(r,candidate){return verifySealed(r,"seven-logo-distinctiveness-receipt")&&(!candidate||r.candidateSeal===candidate.seal)&&r.reviewerContext!==r.builderContext&&arr(r.sourceRefs).length>=3&&arr(r.comparedProducts).length>=5}

function adjudicateEvidenceBacked({candidate,geometry,stageEvidence,visualPackages,distinctivenessReceipt,assessments}){
  if(!tournament.verifyCandidate(candidate))throw new Error("verified candidate required");
  const hard=tournament.evaluateHardGates({candidate,geometry,evidence:stageEvidence});
  const visualCoverage=evaluateVisualEvidenceCoverage({candidate,packages:visualPackages});
  const distinctOk=verifyDistinctivenessReceipt(distinctivenessReceipt,candidate);
  if(hard.verdict==="REJECT"||visualCoverage.verdict==="BLOCK"||(distinctOk&&distinctivenessReceipt.verdict==="BLOCK"))return seal({schema:"seven-logo-evidence-backed-verdict",version:1,candidateSeal:candidate.seal,verdict:"REJECT",hardGateSeal:hard.seal,visualCoverageSeal:visualCoverage.seal,distinctivenessSeal:distinctOk?distinctivenessReceipt.seal:null,reasons:[hard.verdict==="REJECT"?"hard-gate-reject":null,visualCoverage.verdict==="BLOCK"?"visual-evidence-block":null,distinctOk&&distinctivenessReceipt.verdict==="BLOCK"?"distinctiveness-block":null].filter(Boolean)});
  if(hard.verdict!=="PASS"||visualCoverage.verdict!=="PASS"||!distinctOk)return seal({schema:"seven-logo-evidence-backed-verdict",version:1,candidateSeal:candidate.seal,verdict:"INCONCLUSIVE",hardGateSeal:hard.seal,visualCoverageSeal:visualCoverage.seal,distinctivenessSeal:distinctOk?distinctivenessReceipt.seal:null,reasons:[hard.verdict!=="PASS"?"hard-gate-incomplete":null,visualCoverage.verdict!=="PASS"?"visual-evidence-incomplete":null,!distinctOk?"distinctiveness-receipt-missing":null].filter(Boolean)});
  const base=tournament.adjudicateCandidate({candidate,hardGate:hard,assessments});
  return seal({schema:"seven-logo-evidence-backed-verdict",version:1,candidateSeal:candidate.seal,verdict:base.verdict,hardGateSeal:hard.seal,visualCoverageSeal:visualCoverage.seal,distinctivenessSeal:distinctivenessReceipt.seal,baseVerdictSeal:base.seal,reasons:clone(base.reasons||[])});
}
function verifyEvidenceBackedVerdict(v,candidate){return verifySealed(v,"seven-logo-evidence-backed-verdict")&&(!candidate||v.candidateSeal===candidate.seal)}

function createReleaseIconEvidenceReceipt({candidate,exportReceipt,packages}){
  if(!tournament.verifyCandidate(candidate)||!tournament.verifyExportReceipt(exportReceipt,candidate))throw new Error("candidate/export receipt invalid");
  const found=new Map(),failures=[];let commit=null,branch=null;
  for(const pkg of arr(packages)){
    const {binding,scenario,artifact,evidence,releaseContext}=pkg||{};const ctx=String(releaseContext||"");if(!RELEASE_CONTEXTS.includes(ctx)){failures.push("unknown-release-context");continue}
    if(!verifyVisualEvidenceBinding(binding,{candidate,scenario,artifact,evidence})){failures.push(`invalid-release-binding:${ctx}`);continue}
    if(evidence.foundation.tier!==visual.EVIDENCE_TIER.RELEASE_BUILD_DEVICE){failures.push(`release-device-tier-required:${ctx}`);continue}
    if(found.has(ctx)){failures.push(`duplicate-release-context:${ctx}`);continue}found.set(ctx,binding.evidenceHashV2);
    if(commit==null){commit=binding.commitSha;branch=binding.branch}else if(binding.commitSha!==commit||binding.branch!==branch)failures.push(`cross-revision-release-evidence:${ctx}`);
  }
  const missing=RELEASE_CONTEXTS.filter(x=>!found.has(x));const body={schema:"seven-logo-release-icon-evidence",version:1,candidateSeal:candidate.seal,exportReceiptSeal:exportReceipt.seal,branch,commitSha:commit,contexts:Object.fromEntries([...found.entries()].sort()),missing,failures:[...new Set(failures)].sort(),verdict:failures.length?"BLOCK":missing.length?"INCONCLUSIVE":"PASS"};return seal(body);
}
function verifyReleaseIconEvidenceReceipt(r,candidate,exportReceipt){return verifySealed(r,"seven-logo-release-icon-evidence")&&(!candidate||r.candidateSeal===candidate.seal)&&(!exportReceipt||r.exportReceiptSeal===exportReceipt.seal)}
function assertReleaseBrandFreezeEligible({candidate,candidateVerdict,exportReceipt,androidProof,releaseIconEvidence}){
  tournament.assertBrandFreezeEligible({candidate,candidateVerdict,exportReceipt,androidProof});
  if(!verifyReleaseIconEvidenceReceipt(releaseIconEvidence,candidate,exportReceipt)||releaseIconEvidence.verdict!=="PASS")throw new Error("release-build-device logo evidence not proven");
  if(androidProof.buildCommit!==releaseIconEvidence.commitSha)throw new Error("Android proof and release visual evidence commit mismatch");
  return true;
}

module.exports=Object.freeze({VISUAL_STAGES,RELEASE_CONTEXTS,sourceRef,createVisualEvidenceBinding,verifyVisualEvidenceBinding,requiredVisualCoverage,evaluateVisualEvidenceCoverage,verifyVisualEvidenceCoverage,createDistinctivenessReceipt,verifyDistinctivenessReceipt,adjudicateEvidenceBacked,verifyEvidenceBackedVerdict,createReleaseIconEvidenceReceipt,verifyReleaseIconEvidenceReceipt,assertReleaseBrandFreezeEligible});
