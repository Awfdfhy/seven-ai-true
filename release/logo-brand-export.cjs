"use strict";
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const tournament=require("./logo-tournament.cjs");
const portfolioRuntime=require("./logo-candidate-portfolio.cjs");
const closure=require("./logo-tournament-closure.cjs");
const brand=require("./brand-asset-contract.cjs");

const VERSION="1.0.0";
const FILENAMES=Object.freeze({MASTER_VECTOR:"master.svg",MONOCHROME_VECTOR:"monochrome.svg",DAY_VECTOR:"day.svg",NIGHT_VECTOR:"night.svg",ADAPTIVE_FOREGROUND:"adaptive-foreground.svg",ADAPTIVE_BACKGROUND:"adaptive-background.svg",THEMED_MONOCHROME:"themed-monochrome.svg"});
function sha(buf){return crypto.createHash("sha256").update(buf).digest("hex")}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function repoPath(...parts){return parts.join("/").replace(/\\/g,"/")}
function dirDigest(dir){if(!fs.existsSync(dir))return null;const files=[];function walk(p){for(const name of fs.readdirSync(p).sort()){const full=path.join(p,name),st=fs.statSync(full);if(st.isDirectory())walk(full);else files.push({path:path.relative(dir,full).split(path.sep).join("/"),sha256:sha(fs.readFileSync(full)),bytes:st.size})}}walk(dir);return tournament.sha(files)}
function selectedRecord({portfolio,adjudication,decision}){if(!portfolioRuntime.verifyPortfolioManifest(portfolio?.manifest))throw new Error("verified portfolio required");if(!closure.verifyTournamentAdjudication(adjudication,{portfolio}))throw new Error("complete portfolio-bound adjudication required");if(!closure.verifyChampionDecision(decision,adjudication))throw new Error("verified champion decision required");const record=portfolio.records.find(r=>r.candidate.id===decision.selectedCandidateId);if(!record)throw new Error("selected candidate missing from portfolio");const entry=closure.selectedEntry({adjudication,decision});if(entry.candidateSeal!==record.candidate.seal||entry.baseVerdict.verdict!=="FINALIST"||entry.evidenceBackedVerdict.verdict!=="FINALIST")throw new Error("selected candidate is not an evidence-backed finalist");return {record,entry}}
function createExportPlan({portfolio,adjudication,decision,exporter="seven-logo-brand-export-v1"}){
  const {record,entry}=selectedRecord({portfolio,adjudication,decision}),assets=record.assets.map(a=>a.ref);const exportReceipt=tournament.createExportReceipt({candidate:record.candidate,candidateVerdict:entry.baseVerdict,assets,exporter,reason:`Champion ${decision.selectedCandidateId} selected by ${decision.policy}; materialize exact candidate assets.`});
  const files=record.assets.map(a=>{const filename=FILENAMES[a.kind];if(!filename)throw new Error(`unsupported final brand kind ${a.kind}`);return Object.freeze({id:a.ref.id,kind:a.kind,filename,path:repoPath("brand","final",filename),sha256:a.ref.sha256,svg:a.svg})}).sort((a,b)=>a.kind.localeCompare(b.kind));
  const body={schema:"seven-logo-brand-export-plan",version:VERSION,portfolioSeal:portfolio.manifest.seal,adjudicationSeal:adjudication.receipt.seal,championDecisionSeal:decision.seal,candidateId:record.candidate.id,candidateSeal:record.candidate.seal,baseVerdictSeal:entry.baseVerdict.seal,evidenceBackedVerdictSeal:entry.evidenceBackedVerdict.seal,exportReceipt,files:files.map(({svg,...x})=>x),authorityBoundary:{winnerRequired:true,completePortfolioAdjudicationRequired:true,exactCandidateBytesRequired:true,transactionalMaterializationRequired:true,doesNotProveAndroidConsumption:true,doesNotProveReleaseDeviceEvidence:true,brandFreezeStillBlocked:true}};
  return Object.freeze({receipt:seal(body),record,entry,files});
}
function verifyExportPlan(plan,{portfolio,adjudication,decision}={}){try{const r=plan?.receipt;if(!r||r.schema!=="seven-logo-brand-export-plan")return false;const {seal:s,...body}=r;if(s!==tournament.sha(body)||r.authorityBoundary?.brandFreezeStillBlocked!==true||r.authorityBoundary?.completePortfolioAdjudicationRequired!==true)return false;if(portfolio&&r.portfolioSeal!==portfolio.manifest.seal)return false;if(adjudication&&r.adjudicationSeal!==adjudication.receipt.seal)return false;if(decision&&r.championDecisionSeal!==decision.seal)return false;if(!Array.isArray(plan.files)||plan.files.length!==brand.REQUIRED_KINDS.length)return false;for(const f of plan.files){if(!brand.REQUIRED_KINDS.includes(f.kind)||FILENAMES[f.kind]!==f.filename||sha(Buffer.from(f.svg))!==f.sha256)return false}return true}catch{return false}}
function materializeBrandExport({root=process.cwd(),portfolio,adjudication,decision,exporter}={}){
  const plan=createExportPlan({portfolio,adjudication,decision,exporter});if(!verifyExportPlan(plan,{portfolio,adjudication,decision}))throw new Error("export plan verification failed");
  const brandRoot=path.join(root,"brand"),finalDir=path.join(brandRoot,"final"),stageRoot=path.join(brandRoot,".stage"),stageDir=path.join(stageRoot,plan.receipt.seal),rollbackRoot=path.join(brandRoot,"rollback");
  fs.rmSync(stageDir,{recursive:true,force:true});fs.mkdirSync(stageDir,{recursive:true});for(const f of plan.files)fs.writeFileSync(path.join(stageDir,f.filename),f.svg);
  for(const f of plan.files){const b=fs.readFileSync(path.join(stageDir,f.filename));if(sha(b)!==f.sha256||brand.inspectSvg(b,{kind:f.kind,path:f.path}).verdict!=="PASS")throw new Error(`staged brand asset invalid: ${f.kind}`)}
  const previousDigest=dirDigest(finalDir),backupDir=previousDigest?path.join(rollbackRoot,previousDigest):null;let backedUp=false,promoted=false;
  try{
    if(previousDigest){fs.mkdirSync(rollbackRoot,{recursive:true});if(fs.existsSync(backupDir))fs.rmSync(backupDir,{recursive:true,force:true});fs.renameSync(finalDir,backupDir);backedUp=true}else fs.rmSync(finalDir,{recursive:true,force:true});
    fs.mkdirSync(brandRoot,{recursive:true});fs.renameSync(stageDir,finalDir);promoted=true;
    const assetFiles=plan.files.map(f=>({id:f.id,path:f.path,sha256:f.sha256}));const manifest=brand.createBrandExportManifest({candidate:plan.record.candidate,candidateVerdict:plan.entry.baseVerdict,evidenceBackedVerdict:plan.entry.evidenceBackedVerdict,exportReceipt:plan.receipt.exportReceipt,assetFiles});
    if(!brand.verifyBrandExportManifest(manifest,{root,requireFiles:true}))throw new Error("materialized brand manifest failed verification");const consumptionPlan=brand.createConsumptionPlan({manifest,root});if(!brand.verifyConsumptionPlan(consumptionPlan,manifest))throw new Error("brand consumption plan failed verification");
    const documents={
      "brand-export-manifest.json":manifest,
      "consumption-plan.json":consumptionPlan,
      "champion-decision.json":decision,
      "export-receipt.json":plan.receipt.exportReceipt,
      "candidate-verdict.json":plan.entry.baseVerdict,
      "evidence-backed-verdict.json":plan.entry.evidenceBackedVerdict
    };
    for(const [name,value] of Object.entries(documents))fs.writeFileSync(path.join(finalDir,name),JSON.stringify(value,null,2)+"\n");
    const finalPayloadDigest=dirDigest(finalDir),receipt=seal({schema:"seven-logo-brand-materialization",version:VERSION,candidateId:plan.record.candidate.id,candidateSeal:plan.record.candidate.seal,championDecisionSeal:decision.seal,exportPlanSeal:plan.receipt.seal,brandManifestSeal:manifest.seal,consumptionPlanSeal:consumptionPlan.seal,exportReceiptSeal:plan.receipt.exportReceipt.seal,candidateVerdictSeal:plan.entry.baseVerdict.seal,evidenceBackedVerdictSeal:plan.entry.evidenceBackedVerdict.seal,previousDigest,backupPath:backupDir?path.relative(root,backupDir).split(path.sep).join("/"):null,finalPayloadDigest,status:"MATERIALIZED_NOT_FROZEN",authorityBoundary:{payloadDigestExcludesThisReceipt:true,rollbackSnapshotPreserved:!!previousDigest,androidConsumptionStillRequired:true,releaseBuildDeviceEvidenceStillRequired:true,brandFreezeStillBlocked:true}});fs.writeFileSync(path.join(finalDir,"materialization-receipt.json"),JSON.stringify(receipt,null,2)+"\n");
    return Object.freeze({plan:plan.receipt,manifest,consumptionPlan,receipt});
  }catch(err){if(promoted)fs.rmSync(finalDir,{recursive:true,force:true});if(backedUp&&backupDir&&fs.existsSync(backupDir))fs.renameSync(backupDir,finalDir);fs.rmSync(stageDir,{recursive:true,force:true});throw err}
  finally{if(fs.existsSync(stageDir))fs.rmSync(stageDir,{recursive:true,force:true});try{if(fs.existsSync(stageRoot)&&fs.readdirSync(stageRoot).length===0)fs.rmdirSync(stageRoot)}catch{}}
}
module.exports=Object.freeze({VERSION,FILENAMES,dirDigest,selectedRecord,createExportPlan,verifyExportPlan,materializeBrandExport});
