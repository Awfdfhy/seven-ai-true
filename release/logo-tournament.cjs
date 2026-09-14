const crypto=require('crypto');

const VERSION='1.0.0';
const FAMILIES=Object.freeze(['L-A','L-B','L-C','L-D','L-E','L-F','CONTROL']);
const VERDICTS=Object.freeze(['FINALIST','REJECT','DISTINCTIVENESS_REVIEW_REQUIRED','TRADEOFF_REQUIRES_DECISION','INCONCLUSIVE']);
const STAGES=Object.freeze(['SILHOUETTE','TINY_SIZE','ADAPTIVE_MASK','MONOCHROME','DAY_NIGHT','PRODUCT_CONTEXT','MOTION_MARK','DISTINCTIVENESS','HUMAN_EVIDENCE','SIMPLIFIER']);
const DIMENSIONS=Object.freeze(['silhouette','smallSize','adaptiveMask','monochrome','distinctiveness','conceptFit','dayNightFit','motionPotential','implementationSimplicity','assetCost','durability']);
const REQUIRED_SIZES=Object.freeze([16,24,32,48,64]);
const REQUIRED_MASKS=Object.freeze(['circle','squircle','rounded-square','aggressive']);
const SAFE={layer:108,core:66,margin:21};
const HASH64=/^[0-9a-f]{64}$/i;

function stable(v){if(Array.isArray(v))return '['+v.map(stable).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';return JSON.stringify(v);}
function sha(v){return crypto.createHash('sha256').update(typeof v==='string'?v:stable(v)).digest('hex');}
function req(v,n){if(typeof v!=='string'||!v.trim())throw new Error(n+' required');return v.trim();}
function enumv(v,a,n){if(!a.includes(v))throw new Error(n+' invalid');return v;}
function hash(v,n){if(!HASH64.test(v||''))throw new Error(n+' must be sha256');return v.toLowerCase();}
function finite(v,n){if(!Number.isFinite(v))throw new Error(n+' must be finite');return v;}
function score(v,n){finite(v,n);if(!Number.isInteger(v)||v<0||v>4)throw new Error(n+' must be integer 0..4');return v;}
function unique(xs,n){if(new Set(xs).size!==xs.length)throw new Error('duplicate '+n);}
function seal(body){return {...body,seal:sha(body)};}
function verifySealed(obj,schema){if(!obj||obj.schema!==schema)return false;const {seal:s,...body}=obj;return HASH64.test(s||'')&&s===sha(body);}

function createAssetRef({id,kind,sha256,format,viewBox,bytes}){
  id=req(id,'asset id');kind=enumv(kind,['MASTER_VECTOR','MONOCHROME_VECTOR','DAY_VECTOR','NIGHT_VECTOR','ADAPTIVE_FOREGROUND','ADAPTIVE_BACKGROUND','THEMED_MONOCHROME','RASTER_PREVIEW'],'asset kind');
  format=enumv(format,['SVG','PNG','WEBP'],'format');hash(sha256,'asset sha256');
  if(!Array.isArray(viewBox)||viewBox.length!==4||viewBox.some(x=>!Number.isFinite(x)))throw new Error('viewBox must be four finite numbers');
  if(!(bytes>0&&Number.isInteger(bytes)))throw new Error('asset bytes must be positive integer');
  return seal({schema:'seven-logo-asset-ref',version:1,id,kind,sha256:sha256.toLowerCase(),format,viewBox:[...viewBox],bytes});
}
function verifyAssetRef(a){return verifySealed(a,'seven-logo-asset-ref')&&HASH64.test(a.sha256||'')&&a.bytes>0;}

function createGeometryProfile({essentialBounds,pathCount,nodeCount,usesText=false,usesRaster=false,usesFilter=false,bakedMask=false,bakedShadow=false}){
  if(!essentialBounds||['x','y','width','height'].some(k=>!Number.isFinite(essentialBounds[k])))throw new Error('essentialBounds invalid');
  const b={...essentialBounds};
  if(b.width<=0||b.height<=0||b.x<0||b.y<0||b.x+b.width>SAFE.layer||b.y+b.height>SAFE.layer)throw new Error('essentialBounds outside 108 layer');
  if(!(Number.isInteger(pathCount)&&pathCount>0))throw new Error('pathCount invalid');
  if(!(Number.isInteger(nodeCount)&&nodeCount>0))throw new Error('nodeCount invalid');
  const inside=b.x>=SAFE.margin&&b.y>=SAFE.margin&&b.x+b.width<=SAFE.layer-SAFE.margin&&b.y+b.height<=SAFE.layer-SAFE.margin;
  return seal({schema:'seven-logo-geometry-profile',version:1,essentialBounds:b,pathCount,nodeCount,usesText:!!usesText,usesRaster:!!usesRaster,usesFilter:!!usesFilter,bakedMask:!!bakedMask,bakedShadow:!!bakedShadow,essentialSafeRegionPass:inside});
}
function verifyGeometryProfile(g){return verifySealed(g,'seven-logo-geometry-profile');}

function createCandidate({id,family,name,concept,genomeSeal,masterAsset,geometry,parentId=null}){
  id=req(id,'candidate id');enumv(family,FAMILIES,'family');name=req(name,'candidate name');concept=req(concept,'concept');hash(genomeSeal,'genomeSeal');
  if(!verifyAssetRef(masterAsset)||masterAsset.kind!=='MASTER_VECTOR'||masterAsset.format!=='SVG')throw new Error('master asset must be verified SVG MASTER_VECTOR');
  if(!verifyGeometryProfile(geometry))throw new Error('geometry profile invalid');
  const body={schema:'seven-logo-candidate',version:1,id,family,name,concept,genomeSeal:genomeSeal.toLowerCase(),masterAssetSeal:masterAsset.seal,masterAssetSha256:masterAsset.sha256,geometrySeal:geometry.seal,parentId:parentId?req(parentId,'parentId'):null};
  return seal(body);
}
function verifyCandidate(c,{masterAsset,geometry}={}){
  if(!verifySealed(c,'seven-logo-candidate'))return false;
  if(masterAsset&&(!verifyAssetRef(masterAsset)||masterAsset.seal!==c.masterAssetSeal||masterAsset.sha256!==c.masterAssetSha256))return false;
  if(geometry&&(!verifyGeometryProfile(geometry)||geometry.seal!==c.geometrySeal))return false;
  return true;
}

function createStageEvidence({candidate,stage,producer,independent=false,observations={},artifacts=[]}){
  if(!verifyCandidate(candidate))throw new Error('verified candidate required');enumv(stage,STAGES,'stage');producer=req(producer,'producer');
  if(!artifacts.every(verifyAssetRef))throw new Error('all evidence artifacts must verify');unique(artifacts.map(a=>a.id),'evidence artifact id');
  const body={schema:'seven-logo-stage-evidence',version:1,candidateSeal:candidate.seal,candidateId:candidate.id,stage,producer,independent:!!independent,observations:JSON.parse(JSON.stringify(observations)),artifacts:artifacts.map(a=>({id:a.id,seal:a.seal,sha256:a.sha256,kind:a.kind})).sort((a,b)=>a.id.localeCompare(b.id))};
  return seal(body);
}
function verifyStageEvidence(e,candidate){return verifySealed(e,'seven-logo-stage-evidence')&&(!candidate||verifyCandidate(candidate)&&e.candidateSeal===candidate.seal&&e.candidateId===candidate.id);}

function evaluateHardGates({candidate,geometry,evidence=[]}){
  if(!verifyCandidate(candidate)||!verifyGeometryProfile(geometry)||candidate.geometrySeal!==geometry.seal)throw new Error('candidate/geometry mismatch');
  if(!evidence.every(e=>verifyStageEvidence(e,candidate)))throw new Error('invalid stage evidence');
  unique(evidence.map(e=>e.stage+':'+e.producer),'stage producer evidence');
  const byStage=new Map();for(const e of evidence){if(!byStage.has(e.stage))byStage.set(e.stage,[]);byStage.get(e.stage).push(e);}
  const failures=[],missing=[];
  if(!geometry.essentialSafeRegionPass)failures.push('essential-geometry-outside-66dp-safe-region');
  if(geometry.usesText)failures.push('logo-cannot-require-text');
  if(geometry.usesRaster)failures.push('master-geometry-must-be-vector');
  if(geometry.usesFilter)failures.push('identity-cannot-require-filter-effects');
  if(geometry.bakedMask)failures.push('adaptive-layer-cannot-bake-launcher-mask');
  if(geometry.bakedShadow)failures.push('adaptive-layer-cannot-bake-outline-shadow');

  for(const s of ['SILHOUETTE','TINY_SIZE','ADAPTIVE_MASK','MONOCHROME','DAY_NIGHT','PRODUCT_CONTEXT','DISTINCTIVENESS','SIMPLIFIER'])if(!byStage.has(s))missing.push(s);
  const tiny=(byStage.get('TINY_SIZE')||[]).flatMap(e=>e.observations.sizes||[]);
  for(const sz of REQUIRED_SIZES)if(!tiny.some(x=>x&&x.px===sz&&x.identifiable===true))failures.push('tiny-size-'+sz+'-not-proven');
  const masks=(byStage.get('ADAPTIVE_MASK')||[]).flatMap(e=>e.observations.masks||[]);
  for(const m of REQUIRED_MASKS)if(!masks.some(x=>x&&x.mask===m&&x.essentialPreserved===true))failures.push('adaptive-mask-'+m+'-not-proven');
  const mono=(byStage.get('MONOCHROME')||[]).some(e=>e.observations.oneColorSurvives===true);if(!mono)failures.push('monochrome-survival-not-proven');
  const dn=(byStage.get('DAY_NIGHT')||[]).some(e=>e.observations.sameCoreGeometry===true&&e.observations.lightBackgroundPass===true&&e.observations.darkBackgroundPass===true);if(!dn)failures.push('day-night-core-parity-not-proven');
  const dist=(byStage.get('DISTINCTIVENESS')||[]);if(!dist.some(e=>e.independent===true))missing.push('INDEPENDENT_DISTINCTIVENESS');
  if(dist.some(e=>e.observations.suspiciousImitation===true))failures.push('suspicious-imitation');
  const context=(byStage.get('PRODUCT_CONTEXT')||[]).flatMap(e=>e.observations.contexts||[]);for(const c of ['launcher','splash','sidebar','topbar','settings'])if(!context.includes(c))failures.push('product-context-'+c+'-not-proven');
  const body={schema:'seven-logo-hard-gate-report',version:1,candidateSeal:candidate.seal,failures:[...new Set(failures)].sort(),missing:[...new Set(missing)].sort()};
  return seal({...body,verdict:body.failures.length?'REJECT':body.missing.length?'INCONCLUSIVE':'PASS'});
}
function verifyHardGateReport(r,candidate){return verifySealed(r,'seven-logo-hard-gate-report')&&(!candidate||r.candidateSeal===candidate.seal);}

function createDimensionAssessment({candidate,assessor,independent=false,ratings,notes={}}){
  if(!verifyCandidate(candidate))throw new Error('candidate required');assessor=req(assessor,'assessor');
  if(!ratings||typeof ratings!=='object')throw new Error('ratings required');
  const out={};for(const d of DIMENSIONS){if(!(d in ratings))throw new Error('missing dimension '+d);out[d]=score(ratings[d],d);}
  const body={schema:'seven-logo-dimension-assessment',version:1,candidateSeal:candidate.seal,assessor,independent:!!independent,ratings:out,notes:JSON.parse(JSON.stringify(notes))};return seal(body);
}
function verifyDimensionAssessment(a,candidate){return verifySealed(a,'seven-logo-dimension-assessment')&&(!candidate||a.candidateSeal===candidate.seal);}

function adjudicateCandidate({candidate,hardGate,assessments=[]}){
  if(!verifyCandidate(candidate)||!verifyHardGateReport(hardGate,candidate))throw new Error('candidate/hardGate invalid');
  if(!assessments.length||!assessments.every(a=>verifyDimensionAssessment(a,candidate)))throw new Error('verified assessments required');
  unique(assessments.map(a=>a.assessor),'assessor');
  if(hardGate.verdict==='REJECT')return seal({schema:'seven-logo-candidate-verdict',version:1,candidateSeal:candidate.seal,verdict:'REJECT',reasons:['hard-gate-failure'],hardGateSeal:hardGate.seal,assessmentSeals:assessments.map(a=>a.seal).sort()});
  if(hardGate.verdict!=='PASS')return seal({schema:'seven-logo-candidate-verdict',version:1,candidateSeal:candidate.seal,verdict:'INCONCLUSIVE',reasons:['missing-hard-gate-evidence'],hardGateSeal:hardGate.seal,assessmentSeals:assessments.map(a=>a.seal).sort()});
  const independent=assessments.filter(a=>a.independent);if(!independent.length)return seal({schema:'seven-logo-candidate-verdict',version:1,candidateSeal:candidate.seal,verdict:'INCONCLUSIVE',reasons:['independent-assessment-required'],hardGateSeal:hardGate.seal,assessmentSeals:assessments.map(a=>a.seal).sort()});
  const mins={};for(const d of DIMENSIONS)mins[d]=Math.min(...assessments.map(a=>a.ratings[d]));
  const critical=['silhouette','smallSize','adaptiveMask','monochrome','distinctiveness','durability'];
  if(critical.some(d=>mins[d]<2))return seal({schema:'seven-logo-candidate-verdict',version:1,candidateSeal:candidate.seal,verdict:'REJECT',reasons:critical.filter(d=>mins[d]<2).map(d=>'weak-'+d),hardGateSeal:hardGate.seal,assessmentSeals:assessments.map(a=>a.seal).sort(),dimensionFloor:mins});
  const body={schema:'seven-logo-candidate-verdict',version:1,candidateSeal:candidate.seal,verdict:'FINALIST',reasons:['all-hard-gates-pass','independent-assessment-present','no-critical-dimension-below-floor'],hardGateSeal:hardGate.seal,assessmentSeals:assessments.map(a=>a.seal).sort(),dimensionFloor:mins};return seal(body);
}
function verifyCandidateVerdict(v,candidate){return verifySealed(v,'seven-logo-candidate-verdict')&&VERDICTS.includes(v.verdict)&&(!candidate||v.candidateSeal===candidate.seal);}

function compareFinalists({candidates,verdicts,assessmentsByCandidate}){
  if(!Array.isArray(candidates)||candidates.length<2)throw new Error('at least two candidates required');unique(candidates.map(c=>c.id),'candidate id');
  const finalists=[];for(const c of candidates){const v=verdicts[c.id];if(!verifyCandidate(c)||!verifyCandidateVerdict(v,c))throw new Error('invalid candidate verdict '+c.id);if(v.verdict==='FINALIST')finalists.push(c);}
  if(finalists.length<2)return {verdict:'INCONCLUSIVE',reason:'need-at-least-two-finalists'};
  const floors={};for(const c of finalists){const as=assessmentsByCandidate[c.id]||[];if(!as.length||!as.every(a=>verifyDimensionAssessment(a,c)))throw new Error('assessment set missing '+c.id);floors[c.id]={};for(const d of DIMENSIONS)floors[c.id][d]=Math.min(...as.map(a=>a.ratings[d]));}
  const dominates=(a,b)=>DIMENSIONS.every(d=>floors[a][d]>=floors[b][d])&&DIMENSIONS.some(d=>floors[a][d]>floors[b][d]);
  const undominated=finalists.filter(c=>!finalists.some(o=>o.id!==c.id&&dominates(o.id,c.id))).map(c=>c.id).sort();
  return {verdict:undominated.length===1?'FINALIST':'TRADEOFF_REQUIRES_DECISION',undominated,dimensionFloors:floors};
}

function createExportReceipt({candidate,candidateVerdict,assets,exporter,reason}){
  if(!verifyCandidate(candidate)||!verifyCandidateVerdict(candidateVerdict,candidate)||candidateVerdict.verdict!=='FINALIST')throw new Error('FINALIST candidate required');
  if(!Array.isArray(assets)||!assets.length||!assets.every(verifyAssetRef))throw new Error('verified export assets required');unique(assets.map(a=>a.kind),'export asset kind');
  for(const kind of ['MASTER_VECTOR','MONOCHROME_VECTOR','DAY_VECTOR','NIGHT_VECTOR','ADAPTIVE_FOREGROUND','ADAPTIVE_BACKGROUND','THEMED_MONOCHROME'])if(!assets.some(a=>a.kind===kind))throw new Error('missing export '+kind);
  exporter=req(exporter,'exporter');reason=req(reason,'reason');const body={schema:'seven-logo-export-receipt',version:1,candidateSeal:candidate.seal,candidateVerdictSeal:candidateVerdict.seal,exporter,reason,assets:assets.map(a=>({id:a.id,kind:a.kind,sha256:a.sha256,seal:a.seal})).sort((a,b)=>a.kind.localeCompare(b.kind))};return seal(body);
}
function verifyExportReceipt(r,candidate,candidateVerdict){return verifySealed(r,'seven-logo-export-receipt')&&(!candidate||r.candidateSeal===candidate.seal)&&(!candidateVerdict||r.candidateVerdictSeal===candidateVerdict.seal);}

function createAndroidConsumptionProof({exportReceipt,buildCommit,artifactSha256,adaptiveIconConsumed,themedIconConsumed,legacyIconConsumed,verifier}){
  if(!verifySealed(exportReceipt,'seven-logo-export-receipt'))throw new Error('export receipt required');
  if(!/^[0-9a-f]{40}$/i.test(buildCommit||''))throw new Error('buildCommit must be git sha');hash(artifactSha256,'artifactSha256');verifier=req(verifier,'verifier');
  const body={schema:'seven-logo-android-consumption-proof',version:1,exportReceiptSeal:exportReceipt.seal,buildCommit:buildCommit.toLowerCase(),artifactSha256:artifactSha256.toLowerCase(),adaptiveIconConsumed:!!adaptiveIconConsumed,themedIconConsumed:!!themedIconConsumed,legacyIconConsumed:!!legacyIconConsumed,verifier};
  return seal({...body,verdict:body.adaptiveIconConsumed&&body.themedIconConsumed&&body.legacyIconConsumed?'PASS':'BLOCK'});
}
function verifyAndroidConsumptionProof(p,exportReceipt){return verifySealed(p,'seven-logo-android-consumption-proof')&&(!exportReceipt||p.exportReceiptSeal===exportReceipt.seal);}

function assertBrandFreezeEligible({candidate,candidateVerdict,exportReceipt,androidProof}){
  if(!verifyCandidate(candidate))throw new Error('candidate invalid');
  if(!verifyCandidateVerdict(candidateVerdict,candidate)||candidateVerdict.verdict!=='FINALIST')throw new Error('candidate is not finalist');
  if(!verifyExportReceipt(exportReceipt,candidate,candidateVerdict))throw new Error('export receipt invalid');
  if(!verifyAndroidConsumptionProof(androidProof,exportReceipt)||androidProof.verdict!=='PASS')throw new Error('Android asset consumption not proven');
  return true;
}

module.exports={VERSION,FAMILIES,VERDICTS,STAGES,DIMENSIONS,REQUIRED_SIZES,REQUIRED_MASKS,SAFE,sha,createAssetRef,verifyAssetRef,createGeometryProfile,verifyGeometryProfile,createCandidate,verifyCandidate,createStageEvidence,verifyStageEvidence,evaluateHardGates,verifyHardGateReport,createDimensionAssessment,verifyDimensionAssessment,adjudicateCandidate,verifyCandidateVerdict,compareFinalists,createExportReceipt,verifyExportReceipt,createAndroidConsumptionProof,verifyAndroidConsumptionProof,assertBrandFreezeEligible};
