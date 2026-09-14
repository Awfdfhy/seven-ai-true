"use strict";
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const tournament=require("./logo-tournament.cjs");
const brand=require("./brand-asset-contract.cjs");
const genome=require("./design-genome.cjs");

const VERSION="1.0.0";
const VARIANTS=Object.freeze([
  ["MASTER_VECTOR","master.svg","MASTER"],
  ["MONOCHROME_VECTOR","monochrome.svg","MONO"],
  ["DAY_VECTOR","day.svg","DAY"],
  ["NIGHT_VECTOR","night.svg","NIGHT"],
  ["ADAPTIVE_FOREGROUND","adaptive-foreground.svg","FOREGROUND"],
  ["ADAPTIVE_BACKGROUND","adaptive-background.svg","BACKGROUND"],
  ["THEMED_MONOCHROME","themed-monochrome.svg","THEMED"]
]);
const CORE_VARIANTS=new Set(["MASTER","MONO","DAY","NIGHT","FOREGROUND","THEMED"]);
const HASH64=/^[0-9a-f]{64}$/i;
function sha(data){return crypto.createHash("sha256").update(data).digest("hex")}
function esc(s){return String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]))}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}

const DEFINITIONS=Object.freeze([
  Object.freeze({id:"orbit-cut",family:"L-A",name:"Orbit Cut",concept:"Seven Cut carried by a restrained orbital thread; speed and cognition without a generic chatbot bubble.",bounds:{x:22,y:22,width:64,height:64},pathCount:3,nodeCount:20,body:'<path d="M25 59C25 40 38 27 56 27C68 27 78 33 83 43" fill="none" stroke="__P__" stroke-width="6" stroke-linecap="round"/><path d="M31 33H79L49 82" fill="none" stroke="__S__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="44" r="4" fill="__P__"/>'}),
  Object.freeze({id:"infinite-cut",family:"L-B",name:"Infinite Cut",concept:"A single continuity loop interrupted by a decisive Seven Cut; open-ended work with a sharp identity break.",bounds:{x:22,y:22,width:64,height:64},pathCount:2,nodeCount:24,body:'<path d="M25 58C33 42 43 38 52 49L61 60C69 70 79 67 83 57C87 47 80 38 70 38C59 38 53 48 47 59L34 82" fill="none" stroke="__P__" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 31H79L50 81" fill="none" stroke="__S__" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'}),
  Object.freeze({id:"eclipse-seven",family:"L-C",name:"Eclipse Seven",concept:"A quiet eclipse frame around an open Seven spine; Day/Night duality without depending on literal sun or moon illustration.",bounds:{x:22,y:22,width:64,height:64},pathCount:3,nodeCount:18,body:'<path d="M78 35A29 29 0 1 0 82 68" fill="none" stroke="__P__" stroke-width="6" stroke-linecap="round"/><path d="M34 33H76L49 81" fill="none" stroke="__S__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M76 35L83 42" fill="none" stroke="__P__" stroke-width="5" stroke-linecap="round"/>'}),
  Object.freeze({id:"horizon-fold",family:"L-D",name:"Horizon Fold",concept:"Two controlled horizons fold into the Seven Cut, connecting research depth and forward motion without ornamental glow.",bounds:{x:22,y:22,width:64,height:64},pathCount:3,nodeCount:22,body:'<path d="M24 45C37 37 51 37 65 45C72 49 78 49 84 45" fill="none" stroke="__P__" stroke-width="5" stroke-linecap="round"/><path d="M24 64C38 56 51 56 64 64C72 69 78 69 84 64" fill="none" stroke="__P__" stroke-width="5" stroke-linecap="round"/><path d="M32 31H79L50 82" fill="none" stroke="__S__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'}),
  Object.freeze({id:"state-node-seven",family:"L-E",name:"State Node Seven",concept:"The numeral-seven route expressed as connected state nodes; a system identity that remains readable without color semantics.",bounds:{x:22,y:22,width:64,height:64},pathCount:5,nodeCount:20,body:'<path d="M29 34H78L50 81" fill="none" stroke="__S__" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="29" cy="34" r="5" fill="__P__"/><circle cx="78" cy="34" r="5" fill="__P__"/><circle cx="63" cy="57" r="5" fill="__P__"/><circle cx="50" cy="81" r="5" fill="__P__"/>'}),
  Object.freeze({id:"dual-arc-gate",family:"L-F",name:"Dual Arc Gate",concept:"Opposing arcs form a gateway around a Seven Cut, balancing Day/Night and Core/World without enclosing the mark in a generic badge.",bounds:{x:22,y:22,width:64,height:64},pathCount:3,nodeCount:20,body:'<path d="M25 62C25 43 36 29 51 26" fill="none" stroke="__P__" stroke-width="6" stroke-linecap="round"/><path d="M83 46C83 65 72 79 57 82" fill="none" stroke="__P__" stroke-width="6" stroke-linecap="round"/><path d="M32 33H78L49 81" fill="none" stroke="__S__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'})
]);

const PALETTES=Object.freeze({
  MASTER:{p:"#087bff",s:"#21d7f2"},MONO:{p:"#000000",s:"#000000"},DAY:{p:"#087bff",s:"#0b1728"},NIGHT:{p:"#21d7f2",s:"#f7fbff"},FOREGROUND:{p:"#ffffff",s:"#ffffff"},THEMED:{p:"#000000",s:"#000000"}
});
function svgWrap(body){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">${body}</svg>`}
function renderSvg(def,variant){
  if(variant==="BACKGROUND")return svgWrap('<rect x="0" y="0" width="108" height="108" fill="#07111f"/>');
  const p=PALETTES[variant];if(!p)throw new Error(`unknown variant ${variant}`);
  return svgWrap(def.body.replaceAll("__P__",p.p).replaceAll("__S__",p.s));
}
function geometrySignature(def){return sha(def.body.replaceAll("__P__","#").replaceAll("__S__","#"))}
function byteSize(text){return Buffer.byteLength(text,"utf8")}
function assetRef(def,kind,file,variant){const svg=renderSvg(def,variant);const ref=tournament.createAssetRef({id:`${def.id}:${kind.toLowerCase()}`,kind,sha256:sha(svg),format:"SVG",viewBox:[0,0,108,108],bytes:byteSize(svg)});return {kind,file,variant,svg,ref,inspection:brand.inspectSvg(svg,{kind,path:`brand/candidates/${def.id}/${file}`})}}
function createRecord(def){
  const snapshot=genome.createSnapshot({theme:"night",aurora:"idle",domain:"core"});if(!genome.verifySnapshot(snapshot))throw new Error("Design Genome snapshot failed");
  const assets=VARIANTS.map(([kind,file,variant])=>assetRef(def,kind,file,variant));
  for(const a of assets)if(a.inspection.verdict!=="PASS")throw new Error(`${def.id}/${a.file} failed brand inspection: ${a.inspection.failures.join(",")}`);
  const master=assets.find(x=>x.kind==="MASTER_VECTOR").ref;
  const geometry=tournament.createGeometryProfile({essentialBounds:def.bounds,pathCount:def.pathCount,nodeCount:def.nodeCount,usesText:false,usesRaster:false,usesFilter:false,bakedMask:false,bakedShadow:false});
  const candidate=tournament.createCandidate({id:def.id,family:def.family,name:def.name,concept:def.concept,genomeSeal:snapshot.seal,masterAsset:master,geometry});
  return Object.freeze({definition:def,designGenomeSnapshot:snapshot,geometry,candidate,geometrySignature:geometrySignature(def),assets:Object.freeze(assets)});
}
function buildReviewSkeleton(record){
  const stages={};for(const stage of tournament.STAGES)stages[stage]={status:["DISTINCTIVENESS","HUMAN_EVIDENCE","SIMPLIFIER"].includes(stage)?"INDEPENDENT_REVIEW_REQUIRED":"CAPTURE_REQUIRED",evidence:[]};
  return {candidateId:record.candidate.id,candidateSeal:record.candidate.seal,stages,dimensions:Object.fromEntries(tournament.DIMENSIONS.map(d=>[d,null])),winnerEligible:false};
}
function buildPortfolio(){
  const records=DEFINITIONS.map(createRecord),masterHashes=records.map(r=>r.assets.find(a=>a.kind==="MASTER_VECTOR").ref.sha256),geometryHashes=records.map(r=>r.geometrySignature);
  if(new Set(masterHashes).size!==records.length)throw new Error("candidate master SVGs must be unique");if(new Set(geometryHashes).size!==records.length)throw new Error("candidate geometry signatures must be unique");
  for(const r of records){if(!tournament.verifyCandidate(r.candidate,{masterAsset:r.assets.find(a=>a.kind==="MASTER_VECTOR").ref,geometry:r.geometry}))throw new Error(`candidate verification failed: ${r.candidate.id}`);if(!r.geometry.essentialSafeRegionPass)throw new Error(`candidate escaped 66dp safe region: ${r.candidate.id}`)}
  const body={schema:"seven-logo-candidate-portfolio",version:VERSION,genomeSeal:records[0].designGenomeSnapshot.seal,candidateCount:records.length,candidates:records.map(r=>({id:r.candidate.id,family:r.candidate.family,name:r.candidate.name,concept:r.candidate.concept,candidateSeal:r.candidate.seal,geometrySeal:r.geometry.seal,geometrySignature:r.geometrySignature,assets:r.assets.map(a=>({kind:a.kind,file:a.file,sha256:a.ref.sha256,assetSeal:a.ref.seal,bytes:a.ref.bytes}))})),winner:null,freezeEligible:false,authorityBoundary:{automatedStructuralPassDoesNotEqualVisualApproval:true,independentDistinctivenessRequired:true,humanEvidenceOptionalButNeverFabricated:true,releaseBuildDeviceProofRequiredForFreeze:true,productionAssetReplacementAllowed:false}};
  return Object.freeze({records,manifest:seal(body),reviews:records.map(buildReviewSkeleton)});
}
function verifyPortfolioManifest(manifest){if(!manifest||manifest.schema!=="seven-logo-candidate-portfolio"||!HASH64.test(String(manifest.seal||"")))return false;const {seal:s,...body}=manifest;return s===tournament.sha(body)&&manifest.winner===null&&manifest.freezeEligible===false&&manifest.authorityBoundary?.productionAssetReplacementAllowed===false}
function contactSheetHtml(records){
  const sizes=tournament.REQUIRED_SIZES;
  const card=r=>{const master=r.assets.find(a=>a.kind==="MASTER_VECTOR").svg,day=r.assets.find(a=>a.kind==="DAY_VECTOR").svg,night=r.assets.find(a=>a.kind==="NIGHT_VECTOR").svg,mono=r.assets.find(a=>a.kind==="MONOCHROME_VECTOR").svg;return `<section class="card"><h2>${esc(r.candidate.name)} <small>${esc(r.candidate.family)}</small></h2><p>${esc(r.candidate.concept)}</p><div class="sizes">${sizes.map(px=>`<span><i style="width:${px}px;height:${px}px">${master}</i><b>${px}</b></span>`).join("")}</div><div class="modes"><div class="day">${day}<b>Day</b></div><div class="night">${night}<b>Night</b></div><div class="mono">${mono}<b>Mono</b></div></div><div class="masks"><span class="circle">${master}</span><span class="squircle">${master}</span><span class="rounded">${master}</span><span class="aggressive">${master}</span></div><code>${esc(r.candidate.id)}</code></section>`};
  return `<!doctype html><html><head><meta charset="utf-8"><title>Seven Logo Tournament Review Pack</title><style>*{box-sizing:border-box}body{margin:0;padding:28px;background:#07111f;color:#f7fbff;font:14px system-ui,sans-serif}header{max-width:1200px;margin:auto auto 22px}h1{margin:0 0 8px;font-size:30px}header p{color:#91a2b7}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:1200px;margin:auto}.card{background:#0c1828;border:1px solid #23364e;border-radius:22px;padding:18px;overflow:hidden}.card h2{margin:0 0 8px}.card small{color:#21d7f2}.card p{min-height:42px;color:#b6c4d5}.sizes{display:flex;align-items:end;gap:15px;min-height:94px;padding:12px;background:#091421;border-radius:16px}.sizes span{display:grid;justify-items:center;gap:5px}.sizes i{display:block}.sizes svg,.modes svg,.masks svg{width:100%;height:100%;display:block}.sizes b,.modes b{font-size:10px;color:#91a2b7}.modes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.modes>div{display:grid;place-items:center;gap:4px;height:120px;padding:14px;border-radius:14px}.modes svg{max-width:72px;max-height:72px}.day{background:#f7fbff}.night{background:#07111f;border:1px solid #23364e}.mono{background:#fff}.masks{display:flex;gap:12px;margin-top:10px}.masks span{display:block;width:72px;height:72px;padding:3px;background:#122238;overflow:hidden}.circle{border-radius:50%}.squircle{border-radius:28%}.rounded{border-radius:18%}.aggressive{border-radius:42% 18% 42% 18%}code{display:block;margin-top:10px;color:#8fa7c2}@media(max-width:800px){.grid{grid-template-columns:1fr}}</style></head><body><header><h1>Seven Logo Tournament</h1><p>Candidate review pack. Structural generation only. No winner, brand freeze, or production Android replacement is implied.</p></header><main class="grid">${records.map(card).join("")}</main></body></html>`;
}
function writePortfolio(root=process.cwd(),outDir="dist/logo-tournament"){
  const portfolio=buildPortfolio(),out=path.resolve(root,outDir);fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
  for(const r of portfolio.records){const dir=path.join(out,"candidates",r.candidate.id);fs.mkdirSync(dir,{recursive:true});for(const a of r.assets)fs.writeFileSync(path.join(dir,a.file),a.svg);fs.writeFileSync(path.join(dir,"candidate.json"),JSON.stringify({candidate:r.candidate,geometry:r.geometry,geometrySignature:r.geometrySignature,assets:r.assets.map(a=>({kind:a.kind,file:a.file,ref:a.ref,inspection:a.inspection})),review:buildReviewSkeleton(r)},null,2));}
  fs.writeFileSync(path.join(out,"portfolio-manifest.json"),JSON.stringify(portfolio.manifest,null,2));fs.writeFileSync(path.join(out,"review-worksheet.json"),JSON.stringify(portfolio.reviews,null,2));fs.writeFileSync(path.join(out,"contact-sheet.html"),contactSheetHtml(portfolio.records));
  return {out,portfolio};
}
module.exports=Object.freeze({VERSION,DEFINITIONS,VARIANTS,CORE_VARIANTS,renderSvg,geometrySignature,createRecord,buildPortfolio,verifyPortfolioManifest,buildReviewSkeleton,contactSheetHtml,writePortfolio});
