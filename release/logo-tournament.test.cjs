const assert=require('assert');
const t=require('./logo-tournament.cjs');
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};const eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++};const throws=(fn,re,m)=>{assert.throws(fn,re,m);n++};
const H=x=>t.sha(x);

eq(t.VERSION,'1.0.0');eq(t.SAFE.layer,108);eq(t.SAFE.core,66);eq(t.SAFE.margin,21);eq(t.REQUIRED_SIZES.join(','),'16,24,32,48,64');eq(t.REQUIRED_MASKS.length,4);

const master=t.createAssetRef({id:'master-a',kind:'MASTER_VECTOR',sha256:H('master-a'),format:'SVG',viewBox:[0,0,108,108],bytes:1800});ok(t.verifyAssetRef(master));
const mono=t.createAssetRef({id:'mono-a',kind:'MONOCHROME_VECTOR',sha256:H('mono-a'),format:'SVG',viewBox:[0,0,108,108],bytes:1200});
throws(()=>t.createAssetRef({id:'x',kind:'MASTER_VECTOR',sha256:'x',format:'SVG',viewBox:[0,0,108,108],bytes:1}),/sha256/);
throws(()=>t.createAssetRef({id:'x',kind:'BAD',sha256:H('x'),format:'SVG',viewBox:[0,0,108,108],bytes:1}),/kind invalid/);
throws(()=>t.createAssetRef({id:'x',kind:'MASTER_VECTOR',sha256:H('x'),format:'SVG',viewBox:[0,0,108],bytes:1}),/viewBox/);

const geom=t.createGeometryProfile({essentialBounds:{x:22,y:22,width:64,height:64},pathCount:2,nodeCount:18});ok(t.verifyGeometryProfile(geom));eq(geom.essentialSafeRegionPass,true);
const unsafeGeom=t.createGeometryProfile({essentialBounds:{x:10,y:10,width:88,height:88},pathCount:1,nodeCount:9});eq(unsafeGeom.essentialSafeRegionPass,false);
throws(()=>t.createGeometryProfile({essentialBounds:{x:-1,y:0,width:20,height:20},pathCount:1,nodeCount:1}),/outside/);
throws(()=>t.createGeometryProfile({essentialBounds:{x:21,y:21,width:66,height:66},pathCount:0,nodeCount:1}),/pathCount/);

const candidate=t.createCandidate({id:'la-01',family:'L-A',name:'Continuity Alpha',concept:'seven plus continuity',genomeSeal:H('genome'),masterAsset:master,geometry:geom});ok(t.verifyCandidate(candidate,{masterAsset:master,geometry:geom}));
throws(()=>t.createCandidate({id:'x',family:'L-Z',name:'x',concept:'x',genomeSeal:H('g'),masterAsset:master,geometry:geom}),/family invalid/);
throws(()=>t.createCandidate({id:'x',family:'L-A',name:'x',concept:'x',genomeSeal:H('g'),masterAsset:mono,geometry:geom}),/MASTER_VECTOR/);
const ct={...candidate,name:'forged'};eq(t.verifyCandidate(ct),false);

const ev=[];
function add(stage,observations,producer='host',independent=false,artifacts=[]){const e=t.createStageEvidence({candidate,stage,producer,independent,observations,artifacts});ok(t.verifyStageEvidence(e,candidate));ev.push(e);return e;}
add('SILHOUETTE',{blackWhitePass:true,generic:false});
add('TINY_SIZE',{sizes:t.REQUIRED_SIZES.map(px=>({px,identifiable:true}))});
add('ADAPTIVE_MASK',{masks:t.REQUIRED_MASKS.map(mask=>({mask,essentialPreserved:true}))});
add('MONOCHROME',{oneColorSurvives:true});
add('DAY_NIGHT',{sameCoreGeometry:true,lightBackgroundPass:true,darkBackgroundPass:true});
add('PRODUCT_CONTEXT',{contexts:['launcher','splash','sidebar','topbar','settings','loading']});
add('MOTION_MARK',{recognitionWithoutMotion:true});
add('DISTINCTIVENESS',{suspiciousImitation:false,landscapeReviewed:true},'independent-brand-review',true);
add('HUMAN_EVIDENCE',{available:false});
add('SIMPLIFIER',{dominatedBySimpler:false});

let hard=t.evaluateHardGates({candidate,geometry:geom,evidence:ev});ok(t.verifyHardGateReport(hard,candidate));eq(hard.verdict,'PASS');eq(hard.failures.length,0);eq(hard.missing.length,0);
const hardTampered={...hard,verdict:'REJECT'};eq(t.verifyHardGateReport(hardTampered,candidate),false);

const noTiny=ev.filter(e=>e.stage!=='TINY_SIZE');hard=t.evaluateHardGates({candidate,geometry:geom,evidence:noTiny});eq(hard.verdict,'REJECT');ok(hard.failures.some(x=>x==='tiny-size-16-not-proven'));ok(hard.missing.includes('TINY_SIZE'));
const unsafeCandidate=t.createCandidate({id:'unsafe',family:'L-D',name:'Unsafe',concept:'unsafe bounds',genomeSeal:H('genome'),masterAsset:t.createAssetRef({id:'master-u',kind:'MASTER_VECTOR',sha256:H('master-u'),format:'SVG',viewBox:[0,0,108,108],bytes:900}),geometry:unsafeGeom});
const unsafeEvidence=ev.map(e=>t.createStageEvidence({candidate:unsafeCandidate,stage:e.stage,producer:e.producer,independent:e.independent,observations:e.observations,artifacts:[]}));hard=t.evaluateHardGates({candidate:unsafeCandidate,geometry:unsafeGeom,evidence:unsafeEvidence});eq(hard.verdict,'REJECT');ok(hard.failures.includes('essential-geometry-outside-66dp-safe-region'));

const badGeom=t.createGeometryProfile({essentialBounds:{x:21,y:21,width:66,height:66},pathCount:1,nodeCount:8,usesText:true,usesFilter:true,bakedMask:true,bakedShadow:true});
const badCandidate=t.createCandidate({id:'bad',family:'L-B',name:'Bad',concept:'bad effects',genomeSeal:H('genome'),masterAsset:t.createAssetRef({id:'master-b',kind:'MASTER_VECTOR',sha256:H('master-b'),format:'SVG',viewBox:[0,0,108,108],bytes:1000}),geometry:badGeom});
const badEv=ev.map(e=>t.createStageEvidence({candidate:badCandidate,stage:e.stage,producer:e.producer,independent:e.independent,observations:e.observations,artifacts:[]}));hard=t.evaluateHardGates({candidate:badCandidate,geometry:badGeom,evidence:badEv});eq(hard.verdict,'REJECT');for(const reason of ['logo-cannot-require-text','identity-cannot-require-filter-effects','adaptive-layer-cannot-bake-launcher-mask','adaptive-layer-cannot-bake-outline-shadow'])ok(hard.failures.includes(reason));

const suspicious=ev.filter(e=>e.stage!=='DISTINCTIVENESS');suspicious.push(t.createStageEvidence({candidate,stage:'DISTINCTIVENESS',producer:'independent-brand-review',independent:true,observations:{suspiciousImitation:true}}));hard=t.evaluateHardGates({candidate,geometry:geom,evidence:suspicious});eq(hard.verdict,'REJECT');ok(hard.failures.includes('suspicious-imitation'));
const nonIndependent=ev.filter(e=>e.stage!=='DISTINCTIVENESS');nonIndependent.push(t.createStageEvidence({candidate,stage:'DISTINCTIVENESS',producer:'builder',independent:false,observations:{suspiciousImitation:false}}));hard=t.evaluateHardGates({candidate,geometry:geom,evidence:nonIndependent});eq(hard.verdict,'INCONCLUSIVE');ok(hard.missing.includes('INDEPENDENT_DISTINCTIVENESS'));

const ratings=Object.fromEntries(t.DIMENSIONS.map(d=>[d,3]));
const a1=t.createDimensionAssessment({candidate,assessor:'visual-judge-a',independent:true,ratings});const a2=t.createDimensionAssessment({candidate,assessor:'visual-judge-b',independent:false,ratings:{...ratings,motionPotential:4}});ok(t.verifyDimensionAssessment(a1,candidate));
throws(()=>t.createDimensionAssessment({candidate,assessor:'x',ratings:{}}),/missing dimension/);
throws(()=>t.createDimensionAssessment({candidate,assessor:'x',ratings:{...ratings,silhouette:5}}),/0\.\.4/);
hard=t.evaluateHardGates({candidate,geometry:geom,evidence:ev});
let verdict=t.adjudicateCandidate({candidate,hardGate:hard,assessments:[a1,a2]});ok(t.verifyCandidateVerdict(verdict,candidate));eq(verdict.verdict,'FINALIST');eq(verdict.dimensionFloor.silhouette,3);
const noIndependentA=t.createDimensionAssessment({candidate,assessor:'builder-only',independent:false,ratings});verdict=t.adjudicateCandidate({candidate,hardGate:hard,assessments:[noIndependentA]});eq(verdict.verdict,'INCONCLUSIVE');
const weak=t.createDimensionAssessment({candidate,assessor:'weak-independent',independent:true,ratings:{...ratings,smallSize:1}});verdict=t.adjudicateCandidate({candidate,hardGate:hard,assessments:[weak]});eq(verdict.verdict,'REJECT');ok(verdict.reasons.includes('weak-smallSize'));

function makeFinalist(id,family,delta={}){
  const asset=t.createAssetRef({id:'m-'+id,kind:'MASTER_VECTOR',sha256:H('m-'+id),format:'SVG',viewBox:[0,0,108,108],bytes:1000});
  const g=t.createGeometryProfile({essentialBounds:{x:21,y:21,width:66,height:66},pathCount:1,nodeCount:10});
  const c=t.createCandidate({id,family,name:id,concept:id,genomeSeal:H('genome'),masterAsset:asset,geometry:g});
  const evidence=ev.map(e=>t.createStageEvidence({candidate:c,stage:e.stage,producer:e.producer,independent:e.independent,observations:e.observations,artifacts:[]}));
  const h=t.evaluateHardGates({candidate:c,geometry:g,evidence});
  const rr={...ratings,...delta};const aa=t.createDimensionAssessment({candidate:c,assessor:'judge-'+id,independent:true,ratings:rr});
  const v=t.adjudicateCandidate({candidate:c,hardGate:h,assessments:[aa]});return {c,a:aa,v};
}
const f1=makeFinalist('f1','L-E',{silhouette:4,smallSize:4});const f2=makeFinalist('f2','L-C',{motionPotential:4,conceptFit:4});
let comparison=t.compareFinalists({candidates:[f1.c,f2.c],verdicts:{f1:f1.v,f2:f2.v},assessmentsByCandidate:{f1:[f1.a],f2:[f2.a]}});eq(comparison.verdict,'TRADEOFF_REQUIRES_DECISION');eq(comparison.undominated.length,2);
const f3=makeFinalist('f3','L-A',{silhouette:4,smallSize:4,motionPotential:4,conceptFit:4});comparison=t.compareFinalists({candidates:[f1.c,f3.c],verdicts:{f1:f1.v,f3:f3.v},assessmentsByCandidate:{f1:[f1.a],f3:[f3.a]}});eq(comparison.verdict,'FINALIST');eq(comparison.undominated[0],'f3');

const finalistVerdict=t.adjudicateCandidate({candidate,hardGate:t.evaluateHardGates({candidate,geometry:geom,evidence:ev}),assessments:[a1,a2]});
const exportAssets=[
  master,mono,
  t.createAssetRef({id:'day',kind:'DAY_VECTOR',sha256:H('day'),format:'SVG',viewBox:[0,0,108,108],bytes:1200}),
  t.createAssetRef({id:'night',kind:'NIGHT_VECTOR',sha256:H('night'),format:'SVG',viewBox:[0,0,108,108],bytes:1200}),
  t.createAssetRef({id:'af',kind:'ADAPTIVE_FOREGROUND',sha256:H('af'),format:'SVG',viewBox:[0,0,108,108],bytes:1400}),
  t.createAssetRef({id:'ab',kind:'ADAPTIVE_BACKGROUND',sha256:H('ab'),format:'SVG',viewBox:[0,0,108,108],bytes:500}),
  t.createAssetRef({id:'theme',kind:'THEMED_MONOCHROME',sha256:H('theme'),format:'SVG',viewBox:[0,0,108,108],bytes:1000})
];
const receipt=t.createExportReceipt({candidate,candidateVerdict:finalistVerdict,assets:exportAssets,exporter:'brand-export-pipeline',reason:'exact approved finalist exports'});ok(t.verifyExportReceipt(receipt,candidate,finalistVerdict));
throws(()=>t.createExportReceipt({candidate,candidateVerdict:finalistVerdict,assets:[master],exporter:'x',reason:'x'}),/missing export/);
const proof=t.createAndroidConsumptionProof({exportReceipt:receipt,buildCommit:'a'.repeat(40),artifactSha256:H('apk'),adaptiveIconConsumed:true,themedIconConsumed:true,legacyIconConsumed:true,verifier:'android-ci'});ok(t.verifyAndroidConsumptionProof(proof,receipt));eq(proof.verdict,'PASS');ok(t.assertBrandFreezeEligible({candidate,candidateVerdict:finalistVerdict,exportReceipt:receipt,androidProof:proof}));
const blocked=t.createAndroidConsumptionProof({exportReceipt:receipt,buildCommit:'b'.repeat(40),artifactSha256:H('apk2'),adaptiveIconConsumed:true,themedIconConsumed:false,legacyIconConsumed:true,verifier:'android-ci'});eq(blocked.verdict,'BLOCK');throws(()=>t.assertBrandFreezeEligible({candidate,candidateVerdict:finalistVerdict,exportReceipt:receipt,androidProof:blocked}),/not proven/);

console.log(`Logo Tournament Foundation: PASS (${n} assertions)`);
