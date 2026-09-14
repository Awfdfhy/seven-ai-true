"use strict";
const assert=require("assert");
const t=require("./logo-tournament.cjs");
const p=require("./logo-tournament-passb.cjs");
const v=require("./visual-evidence-runtime-final.cjs");
let n=0;const ok=(x,m)=>{assert.ok(x,m);n++},eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++},throws=(f,r,m)=>{assert.throws(f,r,m);n++};
const H=x=>t.sha(x),COMMIT="9".repeat(40),BRANCH="ultimate-polish-v1",ENV="github-actions:ubuntu:chrome";

const master=t.createAssetRef({id:"master",kind:"MASTER_VECTOR",sha256:H("master"),format:"SVG",viewBox:[0,0,108,108],bytes:1400});
const geom=t.createGeometryProfile({essentialBounds:{x:21,y:21,width:66,height:66},pathCount:2,nodeCount:14});
const candidate=t.createCandidate({id:"la-01",family:"L-A",name:"Alpha",concept:"Seven continuity",genomeSeal:H("genome"),masterAsset:master,geometry:geom});

function stageEvidence(){
  const out=[],add=(stage,observations,producer="host",independent=false)=>out.push(t.createStageEvidence({candidate,stage,producer,independent,observations,artifacts:[]}));
  add("SILHOUETTE",{blackWhitePass:true,generic:false});
  add("TINY_SIZE",{sizes:t.REQUIRED_SIZES.map(px=>({px,identifiable:true}))});
  add("ADAPTIVE_MASK",{masks:t.REQUIRED_MASKS.map(mask=>({mask,essentialPreserved:true}))});
  add("MONOCHROME",{oneColorSurvives:true});
  add("DAY_NIGHT",{sameCoreGeometry:true,lightBackgroundPass:true,darkBackgroundPass:true});
  add("PRODUCT_CONTEXT",{contexts:["launcher","splash","sidebar","topbar","settings"]});
  add("MOTION_MARK",{recognitionWithoutMotion:true});
  add("DISTINCTIVENESS",{suspiciousImitation:false},"brand-review",true);
  add("SIMPLIFIER",{dominatedBySimpler:false});
  return out;
}
function makePackage(stage,variant,{tier=v.EVIDENCE_TIER.HOST,commit=COMMIT,branch=BRANCH,env=ENV,sourceOverride=null,tagsOverride=null}={}){
  const tags=tagsOverride||[`logo-candidate:${candidate.id}`,`logo-stage:${stage}`,`logo-variant:${variant}`];
  const scenario=v.createScenario({id:`logo-${stage.toLowerCase()}-${variant.replace(/[^a-z0-9-]/gi,"-")}-${tier.toLowerCase()}`,surface:"brand-tournament",journey:"logo",state:variant,viewport:{width:360,height:720},density:1,fontScale:1,locale:"en",direction:"ltr",theme:"night",captureMethod:"playwright-host",expectedSelectors:["#logo"],criticalSelectors:["#logo"],tags});
  const artifact=v.createArtifact(scenario,{sha256:H(`${stage}:${variant}:${tier}`),path:`dist/logo/${stage}/${variant}.png`,byteSize:240,width:360,height:720,sourceRef:sourceOverride||p.sourceRef(candidate,stage,variant)});
  const audit=v.auditState(scenario,{presentSelectors:["#logo"],direction:"ltr"});
  const input={audits:[audit],tier,environmentIdentity:env,commitSha:commit,branch};
  if(tier===v.EVIDENCE_TIER.RELEASE_BUILD_DEVICE)input.tierProof={kind:tier,proofHash:H(`proof:${variant}`),sourceRef:`device:${variant}`,capturedBy:"android-release-ci"};
  const evidence=v.createEvidence(scenario,artifact,input);
  const binding=p.createVisualEvidenceBinding({candidate,stage,variant,scenario,artifact,evidence});
  return {binding,scenario,artifact,evidence};
}
function completePackages(){const out=[];for(const [stage,variants] of Object.entries(p.requiredVisualCoverage()))for(const variant of variants)out.push(makePackage(stage,variant));return out;}

let pkg=makePackage("SILHOUETTE","mono-silhouette");ok(p.verifyVisualEvidenceBinding(pkg.binding,{candidate,...pkg}));
const forged={...pkg.binding,variant:"other"};eq(p.verifyVisualEvidenceBinding(forged,{candidate,...pkg}),false);
throws(()=>makePackage("SILHOUETTE","bad-source",{sourceOverride:"wrong"}),/artifact sourceRef/);
throws(()=>makePackage("TINY_SIZE","size-16",{tagsOverride:[`logo-candidate:${candidate.id}`,"logo-stage:TINY_SIZE"]}),/scenario lacks exact/);
throws(()=>p.createVisualEvidenceBinding({candidate,stage:"DISTINCTIVENESS",variant:"x",scenario:pkg.scenario,artifact:pkg.artifact,evidence:pkg.evidence}),/not visual-evidence governed/);

const packages=completePackages();eq(packages.length,18);let coverage=p.evaluateVisualEvidenceCoverage({candidate,packages});ok(p.verifyVisualEvidenceCoverage(coverage,candidate));eq(coverage.verdict,"PASS");eq(coverage.missing.length,0);
coverage=p.evaluateVisualEvidenceCoverage({candidate,packages:packages.slice(1)});eq(coverage.verdict,"INCONCLUSIVE");ok(coverage.missing.includes("SILHOUETTE:mono-silhouette"));
coverage=p.evaluateVisualEvidenceCoverage({candidate,packages:[...packages,packages[0]]});eq(coverage.verdict,"BLOCK");ok(coverage.failures.some(x=>x.startsWith("duplicate-binding:")));
const cross=makePackage("SILHOUETTE","mono-silhouette",{commit:"8".repeat(40)});coverage=p.evaluateVisualEvidenceCoverage({candidate,packages:[cross,...packages.slice(1)]});eq(coverage.verdict,"BLOCK");ok(coverage.failures.some(x=>x.startsWith("cross-revision-evidence:")));

const distinct=p.createDistinctivenessReceipt({candidate,reviewer:"independent-brand-review",reviewerContext:"review-context-2",builderContext:"builder-context-1",landscapeSha256:H("landscape-v1"),sourceRefs:["official:a","official:b","official:c"],comparedProducts:["A","B","C","D","E","F"],suspiciousImitation:false});ok(p.verifyDistinctivenessReceipt(distinct,candidate));eq(distinct.verdict,"PASS");
throws(()=>p.createDistinctivenessReceipt({candidate,reviewer:"r",reviewerContext:"same",builderContext:"same",landscapeSha256:H("x"),sourceRefs:["a","b","c"],comparedProducts:["A","B","C","D","E"]}),/context-independent/);
throws(()=>p.createDistinctivenessReceipt({candidate,reviewer:"r",reviewerContext:"r",builderContext:"b",landscapeSha256:H("x"),sourceRefs:["a","b"],comparedProducts:["A","B","C","D","E"]}),/three source refs/);
throws(()=>p.createDistinctivenessReceipt({candidate,reviewer:"r",reviewerContext:"r",builderContext:"b",landscapeSha256:H("x"),sourceRefs:["a","b","c"],comparedProducts:["A","B","C","D"]}),/five compared/);
const suspicious=p.createDistinctivenessReceipt({candidate,reviewer:"independent-brand-review",reviewerContext:"review-context-2",builderContext:"builder-context-1",landscapeSha256:H("landscape-v1"),sourceRefs:["a","b","c"],comparedProducts:["A","B","C","D","E"],suspiciousImitation:true});eq(suspicious.verdict,"BLOCK");

const ratings=Object.fromEntries(t.DIMENSIONS.map(d=>[d,3]));const assessment=t.createDimensionAssessment({candidate,assessor:"independent-visual-judge",independent:true,ratings});
let adjudicated=p.adjudicateEvidenceBacked({candidate,geometry:geom,stageEvidence:stageEvidence(),visualPackages:packages,distinctivenessReceipt:distinct,assessments:[assessment]});ok(p.verifyEvidenceBackedVerdict(adjudicated,candidate));eq(adjudicated.verdict,"FINALIST");
adjudicated=p.adjudicateEvidenceBacked({candidate,geometry:geom,stageEvidence:stageEvidence(),visualPackages:packages.slice(1),distinctivenessReceipt:distinct,assessments:[assessment]});eq(adjudicated.verdict,"INCONCLUSIVE");
adjudicated=p.adjudicateEvidenceBacked({candidate,geometry:geom,stageEvidence:stageEvidence(),visualPackages:packages,distinctivenessReceipt:suspicious,assessments:[assessment]});eq(adjudicated.verdict,"REJECT");
const weak=t.createDimensionAssessment({candidate,assessor:"weak-independent",independent:true,ratings:{...ratings,smallSize:1}});adjudicated=p.adjudicateEvidenceBacked({candidate,geometry:geom,stageEvidence:stageEvidence(),visualPackages:packages,distinctivenessReceipt:distinct,assessments:[weak]});eq(adjudicated.verdict,"REJECT");

const hard=t.evaluateHardGates({candidate,geometry:geom,evidence:stageEvidence()});const finalist=t.adjudicateCandidate({candidate,hardGate:hard,assessments:[assessment]});eq(finalist.verdict,"FINALIST");
const exportAssets=[master,
 t.createAssetRef({id:"mono",kind:"MONOCHROME_VECTOR",sha256:H("mono"),format:"SVG",viewBox:[0,0,108,108],bytes:900}),
 t.createAssetRef({id:"day",kind:"DAY_VECTOR",sha256:H("day"),format:"SVG",viewBox:[0,0,108,108],bytes:1000}),
 t.createAssetRef({id:"night",kind:"NIGHT_VECTOR",sha256:H("night"),format:"SVG",viewBox:[0,0,108,108],bytes:1000}),
 t.createAssetRef({id:"af",kind:"ADAPTIVE_FOREGROUND",sha256:H("af"),format:"SVG",viewBox:[0,0,108,108],bytes:1000}),
 t.createAssetRef({id:"ab",kind:"ADAPTIVE_BACKGROUND",sha256:H("ab"),format:"SVG",viewBox:[0,0,108,108],bytes:500}),
 t.createAssetRef({id:"theme",kind:"THEMED_MONOCHROME",sha256:H("theme"),format:"SVG",viewBox:[0,0,108,108],bytes:800})];
const exportReceipt=t.createExportReceipt({candidate,candidateVerdict:finalist,assets:exportAssets,exporter:"brand-export",reason:"approved exact assets"});
const rel=[
 {...makePackage("PRODUCT_CONTEXT","release-adaptive",{tier:v.EVIDENCE_TIER.RELEASE_BUILD_DEVICE}),releaseContext:"adaptive-icon"},
 {...makePackage("PRODUCT_CONTEXT","release-themed",{tier:v.EVIDENCE_TIER.RELEASE_BUILD_DEVICE}),releaseContext:"themed-icon"},
 {...makePackage("PRODUCT_CONTEXT","release-legacy",{tier:v.EVIDENCE_TIER.RELEASE_BUILD_DEVICE}),releaseContext:"legacy-icon"}
];
let releaseEvidence=p.createReleaseIconEvidenceReceipt({candidate,exportReceipt,packages:rel});ok(p.verifyReleaseIconEvidenceReceipt(releaseEvidence,candidate,exportReceipt));eq(releaseEvidence.verdict,"PASS");
releaseEvidence=p.createReleaseIconEvidenceReceipt({candidate,exportReceipt,packages:rel.slice(0,2)});eq(releaseEvidence.verdict,"INCONCLUSIVE");ok(releaseEvidence.missing.includes("legacy-icon"));
const hostRel={...makePackage("PRODUCT_CONTEXT","release-host"),releaseContext:"legacy-icon"};releaseEvidence=p.createReleaseIconEvidenceReceipt({candidate,exportReceipt,packages:[rel[0],rel[1],hostRel]});eq(releaseEvidence.verdict,"BLOCK");ok(releaseEvidence.failures.includes("release-device-tier-required:legacy-icon"));

const releasePass=p.createReleaseIconEvidenceReceipt({candidate,exportReceipt,packages:rel});const android=t.createAndroidConsumptionProof({exportReceipt,buildCommit:COMMIT,artifactSha256:H("apk"),adaptiveIconConsumed:true,themedIconConsumed:true,legacyIconConsumed:true,verifier:"android-ci"});ok(p.assertReleaseBrandFreezeEligible({candidate,candidateVerdict:finalist,exportReceipt,androidProof:android,releaseIconEvidence:releasePass}));
const mismatch=t.createAndroidConsumptionProof({exportReceipt,buildCommit:"7".repeat(40),artifactSha256:H("apk2"),adaptiveIconConsumed:true,themedIconConsumed:true,legacyIconConsumed:true,verifier:"android-ci"});throws(()=>p.assertReleaseBrandFreezeEligible({candidate,candidateVerdict:finalist,exportReceipt,androidProof:mismatch,releaseIconEvidence:releasePass}),/commit mismatch/);

console.log(`Logo Tournament Pass B: PASS (${n} assertions)`);
