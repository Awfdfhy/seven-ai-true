"use strict";
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const tournament=require("./logo-tournament.cjs");
const passb=require("./logo-tournament-passb.cjs");

const SCHEMA="seven-brand-export-manifest";
const REQUIRED_KINDS=Object.freeze(["MASTER_VECTOR","MONOCHROME_VECTOR","DAY_VECTOR","NIGHT_VECTOR","ADAPTIVE_FOREGROUND","ADAPTIVE_BACKGROUND","THEMED_MONOCHROME"]);
const VECTOR_KINDS=new Set(REQUIRED_KINDS);
const HASH64=/^[0-9a-f]{64}$/i;
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function fileSha256(buf){return crypto.createHash("sha256").update(buf).digest("hex")}
function cleanRepoPath(p){p=req(p,"asset path").replace(/\\/g,"/");if(p.startsWith("/")||p.split("/").some(x=>x===".."||x===""))throw new Error("asset path must be normalized repository-relative path");if(!p.startsWith("brand/final/"))throw new Error("final brand asset must live under brand/final/");return p}
function seal(body){return Object.freeze({...body,seal:tournament.sha(body)})}
function verifySeal(x){if(!x||x.schema!==SCHEMA||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===tournament.sha(body)}

function createBrandExportManifest({candidate,candidateVerdict,evidenceBackedVerdict,exportReceipt,assetFiles}){
  if(!tournament.verifyCandidate(candidate))throw new Error("candidate invalid");
  if(!tournament.verifyCandidateVerdict(candidateVerdict,candidate)||candidateVerdict.verdict!=="FINALIST")throw new Error("base finalist verdict required");
  if(!passb.verifyEvidenceBackedVerdict(evidenceBackedVerdict,candidate)||evidenceBackedVerdict.verdict!=="FINALIST")throw new Error("evidence-backed finalist verdict required");
  if(!tournament.verifyExportReceipt(exportReceipt,candidate,candidateVerdict))throw new Error("export receipt invalid");
  const refs=new Map(arr(exportReceipt.assets).map(x=>[x.id,x]));
  if(!Array.isArray(assetFiles)||assetFiles.length!==refs.size)throw new Error("assetFiles must cover export receipt exactly");
  const seenIds=new Set(),seenKinds=new Set(),items=[];
  for(const item of assetFiles){
    const id=req(item?.id,"asset id"),p=cleanRepoPath(item?.path),ref=refs.get(id);if(!ref)throw new Error(`asset ${id} not present in export receipt`);
    if(seenIds.has(id))throw new Error("duplicate asset id");if(seenKinds.has(ref.kind))throw new Error("duplicate asset kind");seenIds.add(id);seenKinds.add(ref.kind);
    if(item.sha256!==ref.sha256)throw new Error(`asset ${id} sha mismatch from export receipt`);
    items.push({id,kind:ref.kind,path:p,sha256:ref.sha256,assetSeal:ref.seal});
  }
  for(const kind of REQUIRED_KINDS)if(!seenKinds.has(kind))throw new Error(`missing final brand kind ${kind}`);
  const body={schema:SCHEMA,version:1,candidateId:candidate.id,candidateSeal:candidate.seal,candidateVerdictSeal:candidateVerdict.seal,evidenceBackedVerdictSeal:evidenceBackedVerdict.seal,exportReceiptSeal:exportReceipt.seal,assets:items.sort((a,b)=>a.kind.localeCompare(b.kind))};return seal(body);
}

function inspectSvg(svg,{kind,path:assetPath}){
  const text=Buffer.isBuffer(svg)?svg.toString("utf8"):String(svg);
  const failures=[];
  if(!/<svg\b/i.test(text)||!/<\/svg>/i.test(text))failures.push("not-svg-document");
  const vb=/\bviewBox\s*=\s*["']\s*([^"']+?)\s*["']/i.exec(text);if(!vb)failures.push("missing-viewBox");else{const nums=vb[1].trim().split(/[\s,]+/).map(Number);if(nums.length!==4||nums.some(x=>!Number.isFinite(x))||nums[0]!==0||nums[1]!==0||nums[2]!==108||nums[3]!==108)failures.push("viewBox-must-be-0-0-108-108")}
  for(const [name,re] of [["text",/<text\b/i],["raster-image",/<image\b/i],["filter",/<filter\b/i],["foreignObject",/<foreignObject\b/i],["script",/<script\b/i],["event-handler",/\son[a-z]+\s*=/i],["external-href",/(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/)/i]])if(re.test(text))failures.push(`forbidden-${name}`);
  if(kind==="ADAPTIVE_FOREGROUND"&&/(?:mask|clipPath)\b/i.test(text))failures.push("adaptive-foreground-baked-mask-or-clip");
  if(kind==="ADAPTIVE_FOREGROUND"&&/<(?:feDropShadow|feGaussianBlur)\b/i.test(text))failures.push("adaptive-foreground-baked-shadow");
  return {path:assetPath,kind,verdict:failures.length?"BLOCK":"PASS",failures};
}

function verifyBrandExportManifest(manifest,{root=null,requireFiles=false}={}){
  try{
    if(!verifySeal(manifest)||!Array.isArray(manifest.assets))return false;
    const kinds=new Set(),ids=new Set(),paths=new Set();
    for(const item of manifest.assets){
      if(!item||!REQUIRED_KINDS.includes(item.kind)||!HASH64.test(String(item.sha256||""))||!HASH64.test(String(item.assetSeal||"")))return false;
      const p=cleanRepoPath(item.path);if(ids.has(item.id)||kinds.has(item.kind)||paths.has(p))return false;ids.add(item.id);kinds.add(item.kind);paths.add(p);
      if(requireFiles){if(!root)return false;const full=path.resolve(root,p),rootAbs=path.resolve(root)+path.sep;if(!full.startsWith(rootAbs))return false;if(!fs.existsSync(full)||!fs.statSync(full).isFile())return false;const buf=fs.readFileSync(full);if(fileSha256(buf)!==item.sha256)return false;if(VECTOR_KINDS.has(item.kind)&&inspectSvg(buf,{kind:item.kind,path:p}).verdict!=="PASS")return false;}
    }
    return REQUIRED_KINDS.every(k=>kinds.has(k));
  }catch{return false}
}

function loadBrandExportManifest(manifestPath,{root,requireFiles=true}={}){
  const raw=fs.readFileSync(manifestPath,"utf8"),manifest=JSON.parse(raw);if(!verifyBrandExportManifest(manifest,{root,requireFiles}))throw new Error("brand export manifest verification failed");return manifest;
}
function chooseBrandAsset(manifest,kind){if(!verifyBrandExportManifest(manifest))throw new Error("manifest invalid");const item=manifest.assets.find(x=>x.kind===kind);if(!item)throw new Error(`brand asset kind unavailable: ${kind}`);return item}
function createConsumptionPlan({manifest,root}){
  if(!verifyBrandExportManifest(manifest,{root,requireFiles:true}))throw new Error("verified materialized brand manifest required");
  const byKind=Object.fromEntries(manifest.assets.map(x=>[x.kind,{path:x.path,sha256:x.sha256}]));
  const body={schema:"seven-brand-consumption-plan",version:1,manifestSeal:manifest.seal,candidateSeal:manifest.candidateSeal,master:byKind.MASTER_VECTOR,monochrome:byKind.MONOCHROME_VECTOR,day:byKind.DAY_VECTOR,night:byKind.NIGHT_VECTOR,adaptiveForeground:byKind.ADAPTIVE_FOREGROUND,adaptiveBackground:byKind.ADAPTIVE_BACKGROUND,themedMonochrome:byKind.THEMED_MONOCHROME};return seal(body)
}
function verifyConsumptionPlan(plan,manifest){if(!plan||plan.schema!=="seven-brand-consumption-plan")return false;const {seal:s,...body}=plan;if(s!==tournament.sha(body))return false;return !manifest||verifyBrandExportManifest(manifest)&&plan.manifestSeal===manifest.seal&&plan.candidateSeal===manifest.candidateSeal}

module.exports=Object.freeze({SCHEMA,REQUIRED_KINDS,fileSha256,cleanRepoPath,createBrandExportManifest,inspectSvg,verifyBrandExportManifest,loadBrandExportManifest,chooseBrandAsset,createConsumptionPlan,verifyConsumptionPlan});
