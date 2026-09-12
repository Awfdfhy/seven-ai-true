const assert=require('assert');
const W=require('./src/ultimate/weight-evolution-runtime.js');
const E=require('./src/ultimate/model-evolution-lab.js');

(async()=>{
 const experiences=new E.VerifiedExperienceStore();
 experiences.add({id:'e1',taskType:'coding',input:{messages:[{role:'user',content:'fix a'}]},output:'patch a',verified:true,success:true,reward:.95,evidenceRefs:['test:a'],groupId:'a'});
 experiences.add({id:'e2',taskType:'coding',input:{messages:[{role:'user',content:'fix b'}]},output:'patch b',verified:true,success:true,reward:.93,evidenceRefs:['test:b'],groupId:'b'});
 const exported=new W.VerifiedDatasetExporter({store:experiences}).export({taskType:'coding',format:'sft'});assert.equal(exported.count,2);assert.ok(exported.sha);
 const artifacts=new W.TrainingArtifactStore();const ds=artifacts.put({id:'dataset:coding',kind:'dataset',payload:exported,sourceRefs:['e1','e2']});assert.equal(ds.kind,'dataset');
 const backends=new W.TrainingBackendRegistry();let phase='running';const worker=new W.WorkerProtocolBackend({id:'local-worker',local:true,freeProof:'local',capabilities:['qlora_sft'],request:async req=>{if(req.op==='submit')return{jobId:'backend-1'};if(req.op==='status')return phase==='running'?{state:'running'}:{state:'completed',artifact:{id:'adapter-1',payload:{adapter:'weights'}}};throw new Error('unexpected');}});backends.register(worker.descriptor());assert.equal(backends.eligible({capabilities:['qlora_sft'],freeOnly:true}).length,1);
 const compiler=new W.TrainingManifestCompiler();const manifest=compiler.compile({baseModelId:'open-base',datasetId:'dataset:coding',datasetSha:exported.sha,openWeights:true,method:'qlora_sft',requiredCategories:['coding']});assert.equal(manifest.method,'qlora_sft');assert.throws(()=>compiler.compile({baseModelId:'closed',datasetId:'x',openWeights:false}),/BASE_MODEL_NOT_OPEN_WEIGHTS/);
 const runtime=new W.WeightEvolutionRuntime({backends,artifacts,compiler,evaluator:async()=>({overall:.91,categories:{coding:.94},avgLatencyMs:100}),gate:{evaluate:(base,candidate)=>({pass:candidate.overall>=base.overall,issues:[]})}});
 const job=runtime.create({jobId:'j1',manifest,backendId:'local-worker',freeOnly:true});assert.equal(job.status,'created');
 const running=await runtime.launch('j1');assert.equal(running.status,'running');assert.equal(running.backendJobId,'backend-1');
 assert.equal((await runtime.refresh('j1')).status,'running');phase='completed';const complete=await runtime.refresh('j1');assert.equal(complete.status,'completed');assert.equal(complete.artifactId,'adapter-1');
 const candidate=await runtime.evaluate('j1',{baselineReport:{overall:.85,categories:{coding:.88},avgLatencyMs:105}});assert.equal(candidate.status,'candidate');assert.equal(candidate.gate.pass,true);
 assert.equal(runtime.promote('j1','shadow',{gate:{pass:true}}).status,'shadow');assert.equal(runtime.promote('j1','canary',{gate:{pass:true}}).status,'canary');assert.equal(runtime.promote('j1','specialist',{gate:{pass:true}}).status,'specialist');
 console.log('ultimate weight evolution: 18 assertions PASS');
})().catch(e=>{console.error(e);process.exit(1)});