"use strict";
const assert=require("assert");
const fs=require("fs"),os=require("os"),path=require("path");
const t=require("./logo-tournament.cjs");
const p=require("./logo-tournament-passb.cjs");
const v=require("./visual-evidence-runtime-final.cjs");
const b=require("./brand-asset-contract.cjs");
let n=0;const ok=(x,m)=>{assert.ok(x,m);n++},eq=(a,c,m)=>{assert.strictEqual(a,c,m);n++},throws=(f,r,m)=>{assert.throws(f,r,m);n++};
const H=x=>t.sha(x),COMMIT="a".repeat(40),BRANCH="ultimate-polish-v1",ENV="github-actions:ubuntu:chrome";
const safeSvg=(salt="")=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><path d="M24 82 L54 24 L84 82 Z" data-s="${salt}"/></svg>`;
const masterSvg=safeSvg("master"),master=t.createAssetRef({id:"master",kind:"MASTER_VECTOR",sha256:b.fileSha256(Buffer.from(masterSvg)),format:"SVG",viewBox:[0,0,108,108],bytes:Buffer.byteLength(masterSvg)});
const geom=t.createGeometryProfile({essentialBounds:{x:21,y:21,width:66,height:66},pathCount:1,nodeCount:3});
const candidate=t.createCandidate({id:"la-final",family:"L-A",name:"Final Test",concept:"governed seven continuity",genomeSeal:H("genome"),masterAsset:master,geometry:geom});
function stageEvidence(){const out=[],add=(stage,observations,producer="host",independent=false)=>out.push(t.createStageEvidence({candidate,stage,producer,independent,observations,artifacts:[]}));add("SILHOUETTE",{blackWhitePass:true,generic:false});add("TINY_SIZE",{sizes:t.REQUIRED_SIZES.map(px=>({px,identifiable:true}))});add("ADAPTIVE_MASK",{masks:t.REQUIRED_MASKS.map(mask=>({mask,essentialPreserved:true}))});add("MONOCHROME",{oneColorSurvives:true});add("DAY_NIGHT",{sameCoreGeometry:true,lightBackgroundPass:true,darkBackgroundPass:true});add("PRODUCT_CONTEXT",{contexts:["launcher","splash","sidebar","topbar","settings"]});add("DISTINCTIVENESS",{suspiciousImitation:false},"review",true);add("SIMPLIFIER",{dominatedBySimpler:false});return out}
function visualPackage(stage,variant){const scenario=v.createScenario({id:`brand-${stage}-${variant}`.toLowerCase().replace(/[^a-z0-9-]/g,"-"),surface:"brand-tournament",journey:"logo",state:variant,viewport:{width:360,height:720},density:1,fontScale:1,locale:"en",direction:"ltr",theme:"night",captureMethod:"playwright-host",expectedSelectors:["#logo"],criticalSelectors:["#logo"],tags:[`logo-candidate:${candidate.id}`,`logo-stage:${stage}`,`logo-variant:${variant}`]});const artifact=v.createArtifact(scenario,{sha256:H(`${stage}:${variant}`),path:`dist/${stage}/${variant}.png`,byteSize:100,width:360,height:720,sourceRef:p.sourceRef(candidate,stage,variant)});const audit=v.auditState(scenario,{presentSelectors:["#logo"],direction:"ltr"});const evidence=v.createEvidence(scenario,artifact,{audits:[audit],tier:v.EVIDENCE_TIER.HOST,environmentIdentity:ENV,commitSha:COMMIT,branch:BRANCH});const binding=p.createVisualEvidenceBinding({candidate,stage,variant,scenario,artifact,evidence});return {binding,scenario,artifact,evidence}}
const packages=[];for(const [stage,variants] of Object.entries(p.requiredVisualCoverage()))for(const variant of variants)packages.push(visualPackage(stage,variant));
const distinct=p.createDistinctivenessReceipt({candidate,reviewer:"independent",reviewerContext:"reviewer-ctx",builderContext:"builder-ctx",landscapeSha256:H("landscape"),sourceRefs:["s:a","s:b","s:c"],comparedProducts:["A","B","C","D","E"],suspiciousImitation:false});
const ratings=Object.fromEntries(t.DIMENSIONS.map(d=>[d,3])),assessment=t.createDimensionAssessment({candidate,assessor:"independent-judge",independent:true,ratings});
const hard=t.evaluateHardGates({candidate,geometry:geom,evidence:stageEvidence()}),candidateVerdict=t.adjudicateCandidate({candidate,hardGate:hard,assessments:[assessment]});eq(candidateVerdict.verdict,"FINALIST");
const evidenceBacked=p.adjudicateEvidenceBacked({candidate,geometry:geom,stageEvidence:stageEvidence(),visualPackages:packages,distinctivenessReceipt:distinct,assessments:[assessment]});eq(evidenceBacked.verdict,"FINALIST");

const defs=[
 ["master","MASTER_VECTOR",masterSvg],
 ["mono","MONOCHROME_VECTOR",safeSvg("mono")],
 ["day","DAY_VECTOR",safeSvg("day")],
 ["night","NIGHT_VECTOR",safeSvg("night")],
 ["adaptive-fg","ADAPTIVE_FOREGROUND",safeSvg("af")],
 ["adaptive-bg","ADAPTIVE_BACKGROUND",safeSvg("ab")],
 ["themed","THEMED_MONOCHROME",safeSvg("themed")]
];
const refs=defs.map(([id,kind,svg])=>kind==="MASTER_VECTOR"?master:t.createAssetRef({id,kind,sha256:b.fileSha256(Buffer.from(svg)),format:"SVG",viewBox:[0,0,108,108],bytes:Buffer.byteLength(svg)}));
const exportReceipt=t.createExportReceipt({candidate,candidateVerdict,assets:refs,exporter:"test-export",reason:"exact finalist export"});
const root=fs.mkdtempSync(path.join(os.tmpdir(),"seven-brand-"));fs.mkdirSync(path.join(root,"brand","final"),{recursive:true});
try{
  const assetFiles=defs.map(([id,kind,svg],i)=>{const rel=`brand/final/${id}.svg`;fs.writeFileSync(path.join(root,rel),svg);return {id,path:rel,sha256:refs[i].sha256}});
  const manifest=b.createBrandExportManifest({candidate,candidateVerdict,evidenceBackedVerdict:evidenceBacked,exportReceipt,assetFiles});ok(b.verifyBrandExportManifest(manifest));ok(b.verifyBrandExportManifest(manifest,{root,requireFiles:true}));
  const manifestPath=path.join(root,"brand/final/brand-export.json");fs.writeFileSync(manifestPath,JSON.stringify(manifest));const loaded=b.loadBrandExportManifest(manifestPath,{root,requireFiles:true});eq(loaded.seal,manifest.seal);
  eq(b.chooseBrandAsset(manifest,"MASTER_VECTOR").path,"brand/final/master.svg");
  const plan=b.createConsumptionPlan({manifest,root});ok(b.verifyConsumptionPlan(plan,manifest));eq(plan.master.sha256,master.sha256);eq(plan.adaptiveForeground.path,"brand/final/adaptive-fg.svg");
  const badPlan={...plan,master:{...plan.master,sha256:H("forged")}};eq(b.verifyConsumptionPlan(badPlan,manifest),false);
  fs.appendFileSync(path.join(root,"brand/final/mono.svg"),"<!--tamper-->");eq(b.verifyBrandExportManifest(manifest,{root,requireFiles:true}),false);fs.writeFileSync(path.join(root,"brand/final/mono.svg"),safeSvg("mono"));ok(b.verifyBrandExportManifest(manifest,{root,requireFiles:true}));
  throws(()=>b.createBrandExportManifest({candidate,candidateVerdict,evidenceBackedVerdict:evidenceBacked,exportReceipt,assetFiles:assetFiles.slice(1)}),/cover export receipt exactly/);
  throws(()=>b.createBrandExportManifest({candidate,candidateVerdict,evidenceBackedVerdict:evidenceBacked,exportReceipt,assetFiles:assetFiles.map((x,i)=>i?x:{...x,path:"../escape.svg"})}),/repository-relative/);
  const wrongSha=assetFiles.map((x,i)=>i?x:{...x,sha256:H("wrong")});throws(()=>b.createBrandExportManifest({candidate,candidateVerdict,evidenceBackedVerdict:evidenceBacked,exportReceipt,assetFiles:wrongSha}),/sha mismatch/);
  const weakVerdict={...evidenceBacked,verdict:"INCONCLUSIVE"};throws(()=>b.createBrandExportManifest({candidate,candidateVerdict,evidenceBackedVerdict:weakVerdict,exportReceipt,assetFiles}),/evidence-backed finalist/);
  eq(b.inspectSvg(safeSvg(),{kind:"MASTER_VECTOR",path:"x"}).verdict,"PASS");
  for(const bad of ["<svg viewBox='0 0 108 108'><text>x</text></svg>","<svg viewBox='0 0 108 108'><image href='x.png'/></svg>","<svg viewBox='0 0 108 108'><script>x</script></svg>","<svg viewBox='0 0 108 108'><path onclick='x()'/></svg>","<svg viewBox='0 0 100 100'><path/></svg>"])eq(b.inspectSvg(bad,{kind:"MASTER_VECTOR",path:"x"}).verdict,"BLOCK");
  eq(b.inspectSvg("<svg viewBox='0 0 108 108'><clipPath id='c'/><path/></svg>",{kind:"ADAPTIVE_FOREGROUND",path:"x"}).verdict,"BLOCK");
  eq(b.inspectSvg("<svg viewBox='0 0 108 108'><filter id='f'><feGaussianBlur/></filter></svg>",{kind:"ADAPTIVE_FOREGROUND",path:"x"}).verdict,"BLOCK");
  throws(()=>b.cleanRepoPath("brand/final/../x.svg"),/repository-relative/);throws(()=>b.cleanRepoPath("assets/x.svg"),/brand\/final/);
}finally{fs.rmSync(root,{recursive:true,force:true})}
console.log(`Brand Asset Contract: PASS (${n} assertions)`);
