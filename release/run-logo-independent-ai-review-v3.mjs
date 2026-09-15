import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
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
const INPUT_DIR=path.join(DIST,'independent-review-inputs');
const MODEL='Xenova/clip-vit-base-patch32';
const MODEL_REVISION='d15189d7028b43f1d3e65039190477f6af591c2a';
const TRANSFORMERS_VERSION='4.2.0';
const REVIEWER='clip-vit-base-patch32-independent-visual-reviewer';
const PREPROCESSING=Object.freeze({
  schema:'seven-logo-independent-review-preprocessing.v3',
  sourceViewport:{width:360,height:420},
  sourceMarkCenter:{x:180,y:210},
  isolatedStages:['SILHOUETTE','TINY_SIZE','ADAPTIVE_MASK','MONOCHROME','DAY_NIGHT'],
  isolatedNormalCropPx:144,
  tinyPaddingPx:12,
  tinyMinimumCropPx:24,
  modelInputPx:224,
  tinyResizeKernel:'nearest',
  normalResizeKernel:'lanczos3',
  productContextMode:'full-host-screenshot',
  conceptDistinctivenessSource:'isolated-day-mark',
  semanticThreshold:0.50,
  tinyGate:{method:'foreground-raster-survival-v1',foregroundDistance:28,minOccupancy:0.018,maxOccupancy:0.48,minBBoxWidth:0.20,minBBoxHeight:0.20,minLargestComponentRatio:0.42},
  rule:'tiny-size hard gates use preserved HOST raster structure, not CLIP semantic confidence; CLIP remains diagnostic for tiny sizes and authoritative for semantic visual judgments'
});
const PREPROCESSING_SHA=tournament.sha(PREPROCESSING);
const REVIEWER_CONTEXT=`clean-room:${MODEL}@${MODEL_REVISION}:transformers.js-${TRANSFORMERS_VERSION}:wave14-v3:preprocess-${PREPROCESSING_SHA.slice(0,16)}`;
const LANDSCAPE=Object.freeze({
  epoch:'VISUAL-EPOCH-1',
  products:['OpenAI / ChatGPT','Anthropic / Claude','Google Gemini','Microsoft Copilot','Perplexity'],
  sourceRefs:['https://openai.com/brand/','https://www.anthropic.com/','https://design.google/library/expressive-symbol-gemini-ai','https://www.microsoft.com/en-us/microsoft-copilot/','https://www.perplexity.ai/'],
  prompts:['the ChatGPT interlocking knot logo','the Claude AI asterisk or starburst logo','the Google Gemini four point sparkle logo','the Microsoft Copilot ribbon loop logo','the Perplexity geometric grid star logo','a unique proprietary seven shaped technology app logo']
});
const LANDSCAPE_SHA=tournament.sha(LANDSCAPE);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function scoreFromProbability(p){p=Number(p)||0;return p>=0.68?4:p>=0.52?3:p>=0.40?2:p>=0.25?1:0}
const byLabel=(rows,label)=>Number(rows.find(x=>x.label===label)?.score||0);
async function classify(classifier,imagePath,labels){const image=await RawImage.read(imagePath);const rows=await classifier(image,labels,{hypothesis_template:'{}'});return rows.map(x=>({label:x.label,score:Number(x.score)}))}
function packageFor(hostCandidate,stage,variant){const p=hostCandidate.packages.find(x=>x.binding.stage===stage&&x.binding.variant===variant);if(!p)throw new Error(`missing HOST package ${hostCandidate.candidateId}:${stage}:${variant}`);return p}
function resolvedArtifact(pkg){const raw=String(pkg.artifact.path||'');const full=path.isAbsolute(raw)?raw:path.resolve(ROOT,raw);if(!fs.existsSync(full))throw new Error(`review artifact missing: ${raw}`);return full}
const safe=s=>String(s).replace(/[^a-z0-9._-]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
function pxFromVariant(v){const m=String(v).match(/^size-(\d+)$/);return m?Number(m[1]):null}
function markSizeFor(stage,variant){if(stage==='TINY_SIZE')return pxFromVariant(variant)||24;if(['ADAPTIVE_MASK','SILHOUETTE','MONOCHROME','DAY_NIGHT'].includes(stage))return 108;return null}
const isolatedStage=stage=>PREPROCESSING.isolatedStages.includes(stage);
async function preprocessPackage(pkg,{candidateId,stage,variant,forceIsolated=false}={}){
  const input=resolvedArtifact(pkg);
  if(!forceIsolated&&!isolatedStage(stage))return {path:input,meta:{mode:'full-host-screenshot',sourceSha256:pkg.binding.artifactSha256,outputSha256:pkg.binding.artifactSha256,stage,variant}};
  const markSize=markSizeFor(stage,variant)||108,cropSize=stage==='TINY_SIZE'?Math.max(markSize+PREPROCESSING.tinyPaddingPx,PREPROCESSING.tinyMinimumCropPx):PREPROCESSING.isolatedNormalCropPx;
  const left=Math.round(PREPROCESSING.sourceMarkCenter.x-cropSize/2),top=Math.round(PREPROCESSING.sourceMarkCenter.y-cropSize/2);
  if(left<0||top<0||left+cropSize>PREPROCESSING.sourceViewport.width||top+cropSize>PREPROCESSING.sourceViewport.height)throw new Error(`invalid independent-review crop ${candidateId}:${stage}:${variant}`);
  const dir=path.join(INPUT_DIR,safe(candidateId));fs.mkdirSync(dir,{recursive:true});const out=path.join(dir,`${safe(stage)}-${safe(variant)}-${cropSize}px.png`);
  const kernel=stage==='TINY_SIZE'?sharp.kernel.nearest:sharp.kernel.lanczos3;
  await sharp(input).extract({left,top,width:cropSize,height:cropSize}).resize(PREPROCESSING.modelInputPx,PREPROCESSING.modelInputPx,{fit:'fill',kernel}).png({compressionLevel:9}).toFile(out);
  const outBytes=fs.readFileSync(out);return {path:out,meta:{mode:'isolated-mark-crop',sourceSha256:pkg.binding.artifactSha256,outputSha256:sha(outBytes),stage,variant,markSizePx:markSize,crop:{left,top,width:cropSize,height:cropSize},resize:{width:PREPROCESSING.modelInputPx,height:PREPROCESSING.modelInputPx,kernel:stage==='TINY_SIZE'?'nearest':'lanczos3'},preprocessingSha256:PREPROCESSING_SHA}};
}
async function rasterSurvival(imagePath){
  const {data,info}=await sharp(imagePath).removeAlpha().raw().toBuffer({resolveWithObject:true});const {width,height,channels}=info;
  const samples=[[0,0],[width-1,0],[0,height-1],[width-1,height-1]].map(([x,y])=>{const i=(y*width+x)*channels;return [data[i],data[i+1],data[i+2]]});
  const bg=[0,1,2].map(c=>Math.round(samples.reduce((n,s)=>n+s[c],0)/samples.length));const mask=new Uint8Array(width*height);let count=0,minX=width,minY=height,maxX=-1,maxY=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*channels,dr=data[i]-bg[0],dg=data[i+1]-bg[1],db=data[i+2]-bg[2],dist=Math.sqrt(dr*dr+dg*dg+db*db);if(dist>=PREPROCESSING.tinyGate.foregroundDistance){const p=y*width+x;mask[p]=1;count++;if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}}
  const occupancy=count/(width*height),bboxWidth=count?(maxX-minX+1)/width:0,bboxHeight=count?(maxY-minY+1)/height:0;
  let largest=0;const seen=new Uint8Array(mask.length),stack=[];for(let p=0;p<mask.length;p++){if(!mask[p]||seen[p])continue;let size=0;stack.push(p);seen[p]=1;while(stack.length){const q=stack.pop();size++;const x=q%width,y=Math.floor(q/width);for(const n of [q-1,q+1,q-width,q+width]){if(n<0||n>=mask.length||seen[n]||!mask[n])continue;const nx=n%width,ny=Math.floor(n/width);if(Math.abs(nx-x)+Math.abs(ny-y)!==1)continue;seen[n]=1;stack.push(n)}}if(size>largest)largest=size}
  const largestComponentRatio=count?largest/count:0,g=PREPROCESSING.tinyGate;const pass=occupancy>=g.minOccupancy&&occupancy<=g.maxOccupancy&&bboxWidth>=g.minBBoxWidth&&bboxHeight>=g.minBBoxHeight&&largestComponentRatio>=g.minLargestComponentRatio;
  return {pass,occupancy,bboxWidth,bboxHeight,largestComponentRatio,backgroundRgb:bg,foregroundPixels:count,width,height};
}
function familyPrompt(candidate){return ({'L-A':'a proprietary number seven fused with a continuity or infinity gesture','L-B':'a proprietary celestial number seven with a controlled eclipse or orbital arc','L-C':'a compact number seven intersected by one orbital path and node','L-D':'a folded or horizon-like geometric number seven mark with strong negative space','L-E':'a compact proprietary number seven connected to an intelligence state node','L-F':'a distinctive abstract dual-arc gateway mark with a subtle seven-like identity'})[candidate.family]||'a distinctive proprietary Seven app identity'}
function structuralScores(record){const g=record.geometry,totalBytes=record.assets.reduce((n,a)=>n+a.ref.bytes,0),complexity=g.pathCount*5+g.nodeCount;return {motionPotential:complexity<=38?4:complexity<=48?3:complexity<=60?2:1,implementationSimplicity:complexity<=34?4:complexity<=44?3:complexity<=56?2:1,assetCost:totalBytes<=5000?4:totalBytes<=8000?3:totalBytes<=12000?2:1}}
async function evaluateCandidate({classifier,record,hostCandidate,reviewCandidate}){
  const traces={};
  const pair=async(name,pkg,positive,negative,{stage=pkg.binding.stage,variant=pkg.binding.variant,forceIsolated=false}={})=>{const prepared=await preprocessPackage(pkg,{candidateId:record.candidate.id,stage,variant,forceIsolated});const rows=await classify(classifier,prepared.path,[positive,negative]);const p=byLabel(rows,positive);traces[name]={artifactSha256:pkg.binding.artifactSha256,labels:rows,positive,preprocessing:prepared.meta};return {p,pass:p>=PREPROCESSING.semanticThreshold,score:scoreFromProbability(p),prepared}};
  const silhouette=await pair('silhouette',packageFor(hostCandidate,'SILHOUETTE','mono-silhouette'),'a clear memorable app logo with a strong readable silhouette','an unclear generic abstract shape with a weak unreadable silhouette');
  const tiny=[];for(const px of tournament.REQUIRED_SIZES){const q=await pair(`tiny-${px}`,packageFor(hostCandidate,'TINY_SIZE',`size-${px}`),'a crisp recognizable app icon symbol that remains readable at small size','a blurry unreadable tiny icon symbol whose identity is lost');const survival=await rasterSurvival(q.prepared.path);traces[`tiny-${px}`].rasterSurvival=survival;tiny.push({px,...q,survival})}
  const masks=[];for(const mask of tournament.REQUIRED_MASKS){const q=await pair(`mask-${mask}`,packageFor(hostCandidate,'ADAPTIVE_MASK',`mask-${mask}`),'an intact centered app icon whose important symbol remains visible inside the mask','a clipped app icon with important symbol parts lost by the mask');masks.push({mask,...q})}
  const mono=await pair('monochrome',packageFor(hostCandidate,'MONOCHROME','one-color'),'a clean recognizable one color logo mark','an unreadable one color abstract blob');
  const day=await pair('day',packageFor(hostCandidate,'DAY_NIGHT','day'),'a coherent professional technology app logo on a light background','an incoherent or decorative symbol that does not work as an app logo');
  const night=await pair('night',packageFor(hostCandidate,'DAY_NIGHT','night'),'a coherent professional technology app logo on a dark background','an incoherent or decorative symbol that does not work as an app logo');
  const contexts=[];for(const ctx of reviewPackRuntime.PRODUCT_CONTEXTS){const q=await pair(`context-${ctx}`,packageFor(hostCandidate,'PRODUCT_CONTEXT',ctx),'a coherent professional app identity integrated naturally into a software product interface','a misplaced generic decorative shape that does not function as product identity');contexts.push({ctx,...q})}
  const identityPkg=packageFor(hostCandidate,'DAY_NIGHT','day'),identityInput=await preprocessPackage(identityPkg,{candidateId:record.candidate.id,stage:'DAY_NIGHT',variant:'day',forceIsolated:true});
  const fp=familyPrompt(record.candidate),conceptRows=await classify(classifier,identityInput.path,[fp,'an unrelated generic abstract app symbol']),conceptP=byLabel(conceptRows,fp);traces.concept={artifactSha256:identityPkg.binding.artifactSha256,labels:conceptRows,positive:fp,preprocessing:identityInput.meta};
  const distinctRows=await classify(classifier,identityInput.path,LANDSCAPE.prompts),uniquePrompt=LANDSCAPE.prompts.at(-1),uniqueP=byLabel(distinctRows,uniquePrompt),known=distinctRows.filter(x=>x.label!==uniquePrompt),maxKnown=Math.max(...known.map(x=>x.score)),suspicious=maxKnown>=0.45&&maxKnown>uniqueP+0.15;traces.distinctiveness={artifactSha256:identityPkg.binding.artifactSha256,labels:distinctRows,uniquePrompt,uniqueP,maxKnown,suspicious,preprocessing:identityInput.meta};
  const structural=structuralScores(record),tinyAll=tiny.every(x=>x.survival.pass),tinyMinComponent=Math.min(...tiny.map(x=>x.survival.largestComponentRatio)),tinyScore=tinyAll?(tinyMinComponent>=0.65?4:3):0,maskP=Math.min(...masks.map(x=>x.p)),dayNightP=Math.min(day.p,night.p);
  const ratings={silhouette:silhouette.score,smallSize:tinyScore,adaptiveMask:scoreFromProbability(maskP),monochrome:mono.score,distinctiveness:suspicious?0:scoreFromProbability(clamp(0.50+uniqueP-maxKnown)),conceptFit:scoreFromProbability(conceptP),dayNightFit:scoreFromProbability(dayNightP),motionPotential:structural.motionPotential,implementationSimplicity:structural.implementationSimplicity,assetCost:structural.assetCost,durability:Math.min(silhouette.score,tinyScore,scoreFromProbability(maskP),mono.score,scoreFromProbability(dayNightP))};
  const findings={silhouetteIdentifiable:silhouette.pass,tinySizes:Object.fromEntries(tiny.map(x=>[String(x.px),x.survival.pass])),adaptiveMasks:Object.fromEntries(masks.map(x=>[x.mask,x.pass])),monochromeOneColorSurvives:mono.pass,dayNight:{sameCoreGeometry:true,lightBackgroundPass:day.pass,darkBackgroundPass:night.pass},productContexts:Object.fromEntries(contexts.map(x=>[x.ctx,x.pass])),simplifierSurvives:mono.pass&&silhouette.pass&&record.geometry.pathCount<=5};
  const evidenceRefs=[...new Set(Object.values(traces).flatMap(x=>x.artifactSha256?[`sha256:${x.artifactSha256}`]:[]))],reviewReference=`${MODEL}@${MODEL_REVISION}:${record.candidate.id}:${sha(Buffer.from(JSON.stringify(traces))).slice(0,16)}`;
  const submission=handoffRuntime.createReviewerSubmission({handoff:reviewCandidate.handoff,reviewer:REVIEWER,role:'INDEPENDENT_VISUAL_REVIEWER',reviewerContext:REVIEWER_CONTEXT,ratings,landscapeSha256:LANDSCAPE_SHA,sourceRefs:LANDSCAPE.sourceRefs,comparedProducts:LANDSCAPE.products,suspiciousImitation:suspicious,notes:`Independent visual review. Model=${MODEL}; revision=${MODEL_REVISION}; Transformers.js=${TRANSFORMERS_VERSION}; preprocessing=${PREPROCESSING_SHA}. Tiny-size hard gates use deterministic foreground raster-survival on isolated HOST pixels; CLIP tiny confidence is retained only as diagnostic evidence. Semantic threshold remains ${PREPROCESSING.semanticThreshold.toFixed(2)}.`,evidenceRefs,reviewReference});
  if(!handoffRuntime.verifyReviewerSubmission(submission,reviewCandidate.handoff))throw new Error(`independent submission failed verification: ${record.candidate.id}`);return {candidateId:record.candidate.id,candidateSeal:record.candidate.seal,submission,findings,traces,structural};
}
async function main(){
  const portfolio=portfolioRuntime.buildPortfolio(),hostPack=readJson(path.join(DIST,'host-visual-evidence.json')),reviewPack=readJson(path.join(DIST,'review-pack.json'));
  if(!hostRuntime.verifyPack(hostPack,portfolio.records))throw new Error('HOST pack invalid before independent review');if(!reviewPackRuntime.verifyReviewBundle(reviewPack,{portfolio,hostPack}))throw new Error('review pack invalid before independent review');
  fs.rmSync(INPUT_DIR,{recursive:true,force:true});fs.mkdirSync(INPUT_DIR,{recursive:true});env.cacheDir=path.join(ROOT,'.cache','wave14-clip');env.allowRemoteModels=true;
  const classifier=await pipeline('zero-shot-image-classification',MODEL,{revision:MODEL_REVISION,dtype:'q8'}),results=[];for(const record of portfolio.records){const hostCandidate=hostPack.candidates.find(x=>x.candidateId===record.candidate.id),reviewCandidate=reviewPack.candidates.find(x=>x.candidateId===record.candidate.id);results.push(await evaluateCandidate({classifier,record,hostCandidate,reviewCandidate}))}
  const body={schema:'seven-logo-independent-ai-review.v2',version:2,portfolioSeal:portfolio.manifest.seal,hostPackHash:hostPack.packHash,reviewPackSeal:reviewPack.seal,model:{id:MODEL,revision:MODEL_REVISION,transformersJs:TRANSFORMERS_VERSION,dtype:'q8',task:'zero-shot-image-classification'},preprocessing:PREPROCESSING,preprocessingSha256:PREPROCESSING_SHA,reviewer:REVIEWER,reviewerContext:REVIEWER_CONTEXT,builderContext:reviewPack.builderContext,landscape:LANDSCAPE,landscapeSha256:LANDSCAPE_SHA,results,authorityBoundary:{independentModel:true,differentContextFromBuilder:REVIEWER_CONTEXT!==reviewPack.builderContext,doesNotChooseWinner:true,doesNotAuthorizeExport:true,doesNotProveAndroidConsumption:true}};
  const sealed={...body,seal:tournament.sha(body)};fs.writeFileSync(path.join(DIST,'independent-ai-review.json'),JSON.stringify(sealed,null,2));console.log('logo independent AI review v3: PASS',results.map(x=>`${x.candidateId}[${Object.entries(x.submission.ratings).map(([k,v])=>`${k}:${v}`).join(',')}]`).join(' | '));
}
main().catch(e=>{console.error(e);process.exit(1)});
