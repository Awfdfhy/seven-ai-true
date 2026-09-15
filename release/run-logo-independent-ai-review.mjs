import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';
import { pipeline, RawImage, env } from '@huggingface/transformers';

const require=createRequire(import.meta.url);
const tournament=require('./logo-tournament.cjs');
const portfolioRuntime=require('./logo-candidate-portfolio.cjs');
const hostRuntime=require('./logo-host-evidence.cjs');
const reviewPackRuntime=require('./logo-review-pack.cjs');
const handoffRuntime=require('./logo-review-handoff.cjs');

const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const DIST=path.join(ROOT,'dist','logo-tournament');
const MODEL='Xenova/mobileclip_s0';
const MODEL_REVISION='20c6e4f26ad3f7f7e9cde13c4f9bb54852dd42c6';
const TRANSFORMERS_VERSION='4.2.0';
const REVIEWER='mobileclip-s0-independent-visual-reviewer';
const REVIEWER_CONTEXT=`clean-room:${MODEL}@${MODEL_REVISION}:transformers.js-${TRANSFORMERS_VERSION}:wave14-v1`;
const LANDSCAPE=Object.freeze({
  epoch:'VISUAL-EPOCH-1',
  products:['OpenAI / ChatGPT','Anthropic / Claude','Google Gemini','Microsoft Copilot','Perplexity'],
  sourceRefs:[
    'https://openai.com/brand/',
    'https://www.anthropic.com/',
    'https://design.google/library/expressive-symbol-gemini-ai',
    'https://www.microsoft.com/en-us/microsoft-copilot/',
    'https://www.perplexity.ai/'
  ],
  prompts:[
    'the ChatGPT interlocking knot logo',
    'the Claude AI asterisk or starburst logo',
    'the Google Gemini four point sparkle logo',
    'the Microsoft Copilot ribbon loop logo',
    'the Perplexity geometric grid star logo',
    'a unique proprietary seven shaped technology app logo'
  ]
});
const LANDSCAPE_SHA=tournament.sha(LANDSCAPE);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function scoreFromProbability(p){p=Number(p)||0;return p>=0.68?4:p>=0.52?3:p>=0.40?2:p>=0.25?1:0}
function byLabel(rows,label){return Number(rows.find(x=>x.label===label)?.score||0)}
async function classify(classifier,imagePath,labels){const image=await RawImage.read(imagePath);const rows=await classifier(image,labels,{hypothesis_template:'{}'});return rows.map(x=>({label:x.label,score:Number(x.score)}))}
function packageFor(hostCandidate,stage,variant){const p=hostCandidate.packages.find(x=>x.binding.stage===stage&&x.binding.variant===variant);if(!p)throw new Error(`missing HOST package ${hostCandidate.candidateId}:${stage}:${variant}`);return p}
function resolvedArtifact(pkg){const raw=String(pkg.artifact.path||'');const full=path.isAbsolute(raw)?raw:path.resolve(ROOT,raw);if(!fs.existsSync(full))throw new Error(`review artifact missing: ${raw}`);return full}
function familyPrompt(candidate){return ({
  'L-A':'a proprietary number seven fused with a continuity or infinity gesture',
  'L-B':'a proprietary celestial seven with an eclipse or orbital arc',
  'L-C':'a compact number seven intersected by one orbital path',
  'L-D':'a folded or horizon-like geometric number seven mark',
  'L-E':'a minimal proprietary pure number seven glyph',
  'L-F':'a distinctive abstract gateway mark with a seven-like identity'
})[candidate.family]||'a distinctive proprietary Seven app identity'}
function structuralScores(record){const g=record.geometry,totalBytes=record.assets.reduce((n,a)=>n+a.ref.bytes,0);const complexity=g.pathCount*5+g.nodeCount;return {
  motionPotential:complexity<=38?4:complexity<=48?3:complexity<=60?2:1,
  implementationSimplicity:complexity<=34?4:complexity<=44?3:complexity<=56?2:1,
  assetCost:totalBytes<=5000?4:totalBytes<=8000?3:totalBytes<=12000?2:1
}}
function average(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0}
async function evaluateCandidate({classifier,record,hostCandidate,reviewCandidate}){
  const traces={};
  const pair=async(name,pkg,positive,negative)=>{const rows=await classify(classifier,resolvedArtifact(pkg),[positive,negative]);const p=byLabel(rows,positive);traces[name]={artifactSha256:pkg.binding.artifactSha256,labels:rows,positive};return {p,pass:p>=0.50,score:scoreFromProbability(p)}};
  const silhouette=await pair('silhouette',packageFor(hostCandidate,'SILHOUETTE','mono-silhouette'),'a clear memorable app logo with a strong readable silhouette','an unclear generic abstract shape with a weak unreadable silhouette');
  const tiny=[];for(const px of tournament.REQUIRED_SIZES){const q=await pair(`tiny-${px}`,packageFor(hostCandidate,'TINY_SIZE',`size-${px}`),'a crisp recognizable app icon symbol that remains readable at small size','a blurry unreadable tiny icon symbol whose identity is lost');tiny.push({px,...q})}
  const masks=[];for(const mask of tournament.REQUIRED_MASKS){const q=await pair(`mask-${mask}`,packageFor(hostCandidate,'ADAPTIVE_MASK',`mask-${mask}`),'an intact centered app icon whose important symbol remains visible inside the mask','a clipped app icon with important symbol parts lost by the mask');masks.push({mask,...q})}
  const mono=await pair('monochrome',packageFor(hostCandidate,'MONOCHROME','one-color'),'a clean recognizable one color logo mark','an unreadable one color abstract blob');
  const day=await pair('day',packageFor(hostCandidate,'DAY_NIGHT','day'),'a coherent professional technology app logo on a light background','an incoherent or decorative symbol that does not work as an app logo');
  const night=await pair('night',packageFor(hostCandidate,'DAY_NIGHT','night'),'a coherent professional technology app logo on a dark background','an incoherent or decorative symbol that does not work as an app logo');
  const contexts=[];for(const ctx of reviewPackRuntime.PRODUCT_CONTEXTS){const q=await pair(`context-${ctx}`,packageFor(hostCandidate,'PRODUCT_CONTEXT',ctx),'a coherent professional app identity integrated naturally into a software product interface','a misplaced generic decorative shape that does not function as product identity');contexts.push({ctx,...q})}
  const masterPath=resolvedArtifact(packageFor(hostCandidate,'PRODUCT_CONTEXT','launcher'));
  const conceptRows=await classify(classifier,masterPath,[familyPrompt(record.candidate),'an unrelated generic abstract app symbol']);const conceptP=byLabel(conceptRows,familyPrompt(record.candidate));traces.concept={labels:conceptRows,positive:familyPrompt(record.candidate)};
  const distinctRows=await classify(classifier,masterPath,LANDSCAPE.prompts);const uniquePrompt=LANDSCAPE.prompts.at(-1),uniqueP=byLabel(distinctRows,uniquePrompt),known=distinctRows.filter(x=>x.label!==uniquePrompt),maxKnown=Math.max(...known.map(x=>x.score));const suspicious=maxKnown>=0.45&&maxKnown>uniqueP+0.15;traces.distinctiveness={labels:distinctRows,uniquePrompt,uniqueP,maxKnown,suspicious};
  const structural=structuralScores(record);
  const tinyP=Math.min(...tiny.map(x=>x.p)),maskP=Math.min(...masks.map(x=>x.p)),contextP=Math.min(...contexts.map(x=>x.p)),dayNightP=Math.min(day.p,night.p);
  const ratings={
    silhouette:silhouette.score,
    smallSize:scoreFromProbability(tinyP),
    adaptiveMask:scoreFromProbability(maskP),
    monochrome:mono.score,
    distinctiveness:suspicious?0:scoreFromProbability(clamp(0.50+uniqueP-maxKnown)),
    conceptFit:scoreFromProbability(conceptP),
    dayNightFit:scoreFromProbability(dayNightP),
    motionPotential:structural.motionPotential,
    implementationSimplicity:structural.implementationSimplicity,
    assetCost:structural.assetCost,
    durability:Math.min(silhouette.score,scoreFromProbability(tinyP),scoreFromProbability(maskP),mono.score,scoreFromProbability(dayNightP))
  };
  const findings={
    silhouetteIdentifiable:silhouette.pass,
    tinySizes:Object.fromEntries(tiny.map(x=>[String(x.px),x.pass])),
    adaptiveMasks:Object.fromEntries(masks.map(x=>[x.mask,x.pass])),
    monochromeOneColorSurvives:mono.pass,
    dayNight:{sameCoreGeometry:true,lightBackgroundPass:day.pass,darkBackgroundPass:night.pass},
    productContexts:Object.fromEntries(contexts.map(x=>[x.ctx,x.pass])),
    simplifierSurvives:mono.pass&&silhouette.pass&&record.geometry.pathCount<=5
  };
  const evidenceRefs=[...new Set(Object.values(traces).flatMap(x=>x.artifactSha256?[`sha256:${x.artifactSha256}`]:[]))];
  const reviewReference=`${MODEL}@${MODEL_REVISION}:${record.candidate.id}:${sha(Buffer.from(JSON.stringify(traces))).slice(0,16)}`;
  const submission=handoffRuntime.createReviewerSubmission({handoff:reviewCandidate.handoff,reviewer:REVIEWER,role:'INDEPENDENT_VISUAL_REVIEWER',reviewerContext:REVIEWER_CONTEXT,ratings,landscapeSha256:LANDSCAPE_SHA,sourceRefs:LANDSCAPE.sourceRefs,comparedProducts:LANDSCAPE.products,suspiciousImitation:suspicious,notes:`Independent zero-shot visual review. Model=${MODEL}; revision=${MODEL_REVISION}; Transformers.js=${TRANSFORMERS_VERSION}. Structural cost/simplicity metrics remain deterministic and separate from visual model judgments.`,evidenceRefs,reviewReference});
  if(!handoffRuntime.verifyReviewerSubmission(submission,reviewCandidate.handoff))throw new Error(`independent submission failed verification: ${record.candidate.id}`);
  return {candidateId:record.candidate.id,candidateSeal:record.candidate.seal,submission,findings,traces,structural};
}

async function main(){
  const portfolio=portfolioRuntime.buildPortfolio(),hostPack=readJson(path.join(DIST,'host-visual-evidence.json')),reviewPack=readJson(path.join(DIST,'review-pack.json'));
  if(!hostRuntime.verifyPack(hostPack,portfolio.records))throw new Error('HOST pack invalid before independent review');
  if(!reviewPackRuntime.verifyReviewBundle(reviewPack,{portfolio,hostPack}))throw new Error('review pack invalid before independent review');
  env.cacheDir=path.join(ROOT,'.cache','wave14-mobileclip');env.allowRemoteModels=true;
  const classifier=await pipeline('zero-shot-image-classification',MODEL,{revision:MODEL_REVISION,dtype:'q8'});
  const results=[];for(const record of portfolio.records){const hostCandidate=hostPack.candidates.find(x=>x.candidateId===record.candidate.id),reviewCandidate=reviewPack.candidates.find(x=>x.candidateId===record.candidate.id);results.push(await evaluateCandidate({classifier,record,hostCandidate,reviewCandidate}))}
  const body={schema:'seven-logo-independent-ai-review.v1',version:1,portfolioSeal:portfolio.manifest.seal,hostPackHash:hostPack.packHash,reviewPackSeal:reviewPack.seal,model:{id:MODEL,revision:MODEL_REVISION,transformersJs:TRANSFORMERS_VERSION,dtype:'q8',task:'zero-shot-image-classification'},reviewer:REVIEWER,reviewerContext:REVIEWER_CONTEXT,builderContext:reviewPack.builderContext,landscape:LANDSCAPE,landscapeSha256:LANDSCAPE_SHA,results,authorityBoundary:{independentModel:true,differentContextFromBuilder:REVIEWER_CONTEXT!==reviewPack.builderContext,doesNotChooseWinner:true,doesNotAuthorizeExport:true,doesNotProveAndroidConsumption:true}};
  const sealed={...body,seal:tournament.sha(body)};fs.writeFileSync(path.join(DIST,'independent-ai-review.json'),JSON.stringify(sealed,null,2));
  console.log('logo independent AI review: PASS',results.map(x=>`${x.candidateId}[${Object.entries(x.submission.ratings).map(([k,v])=>`${k}:${v}`).join(',')}]`).join(' | '));
}
main().catch(e=>{console.error(e);process.exit(1)});
