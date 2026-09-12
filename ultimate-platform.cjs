const assert=require('assert');
const {ProjectWorkspace}=require('./src/ultimate/project-workspace.js');
const {EvalSuite,EvalRunner,RegressionGate,PromotionRegistry,PromptEvolutionEngine}=require('./src/ultimate/eval-engine.js');
const {canonicalUrl,SearchFabric,GapDetector,EvidenceIndependence}=require('./src/ultimate/search-fabric.js');
const {MediaForge,MediaProviderRegistry}=require('./src/ultimate/media-forge.js');
const {AdapterRegistry,ProtocolBoundary,MCPAdapterContract,A2AEnvelope,GenerativeUIEnvelope}=require('./src/ultimate/protocol-adapters.js');

(async()=>{
 // Projects + artifacts
 let tick=0;const ws=new ProjectWorkspace({clock:()=>`2026-09-12T23:00:${String(tick++).padStart(2,'0')}+03:00`});
 const p=ws.create({id:'seven',name:'Seven AI',instructions:'Preserve canonical state'});assert.equal(p.files,0);
 ws.addChat('seven',{id:'chat1',title:'Ultimate'});ws.attachFile('seven',{id:'file1',name:'spec.md',sourceRef:'repo:spec',hash:'abc'});ws.addKnowledge('seven',{id:'k1',sourceRefs:['repo:spec'],contentRef:'knowledge:1',lineage:{transform:'extract'}});ws.linkMemory('seven','memory:event1');ws.addRun('seven',{id:'run1',type:'coding'});ws.updateRun('seven','run1',{status:'success'});
 const art=ws.createArtifact('seven',{id:'artifact1',name:'UI',type:'html',content:'v1',sourceRefs:['repo:spec']});assert.equal(art.versions.length,1);ws.artifacts.commit('artifact1',{content:'v2',message:'improve'});assert.equal(ws.artifacts.compare('artifact1','artifact1:v1','artifact1:v2').changed,true);assert.equal(ws.summary('seven').artifacts,1);

 // Evals, regressions, lifecycle and prompt evolution
 const suite=new EvalSuite({id:'core'});suite.add({id:'a',category:'logic',input:2,expected:4});suite.add({id:'b',category:'logic',input:3,expected:6});
 const runner=new EvalRunner({clock:(()=>{let x=0;return()=>x+=10})()});const perfect=await runner.run(suite,{id:'double',execute:async x=>x*2});assert.equal(perfect.overall,1);
 const weak=await runner.run(suite,{id:'weak',execute:async x=>x===2?4:0});assert.ok(weak.overall<perfect.overall);const gate=new RegressionGate({maxOverallDrop:.01});assert.equal(gate.evaluate(perfect,weak).pass,false);
 const promo=new PromotionRegistry();promo.register({id:'m1'});promo.transition('m1','shadow',{pass:true});promo.transition('m1','canary',{pass:true});promo.transition('m1','specialist',{pass:true});assert.equal(promo.get('m1').status,'specialist');
 const evo=new PromptEvolutionEngine({gate:new RegressionGate({maxOverallDrop:.05,maxLatencyIncrease:1})});evo.add({id:'base',template:'A'});evo.add({id:'cand',template:'B',parentId:'base'});evo.score('base',weak);evo.score('cand',perfect);assert.equal(evo.choose('base',['cand']).selected.id,'cand');

 // Search fabric
 assert.equal(canonicalUrl('https://EXAMPLE.com/a/?utm_source=x#z'),'https://example.com/a');const search=new SearchFabric();const plan=search.prepare('latest API documentation',{depth:'deep'});assert.ok(plan.waves.length>=3);assert.equal(plan.intent.needContradiction,true);
 search.ingest({url:'https://example.com/docs?utm_source=x',title:'Docs',provider:'a',authority:1,directness:1,evidence:1});search.ingest({url:'https://example.com/docs',title:'Duplicate',provider:'b'});assert.equal(search.fusion.list().length,1,'canonical URL fusion must dedupe provider duplicates');
 const indep=new EvidenceIndependence();assert.equal(indep.independentCount([{url:'a',independenceRoot:'root1'},{url:'b',independenceRoot:'root1'},{url:'c',independenceRoot:'root2'}]),2);
 const gaps=new GapDetector().analyze([{id:'c1',requiredEvidence:2,requiresPrimary:true}],[{id:'s1',claimIds:['c1'],independenceRoot:'r1',primary:false}]);assert.ok(gaps.some(x=>x.type==='INSUFFICIENT_INDEPENDENCE')&&gaps.some(x=>x.type==='PRIMARY_SOURCE_MISSING'));

 // Optional Media Forge remains cold when disabled and can use canon-aware providers
 const visuals={referencePack:(g,e)=>({gameId:g,entityId:e,refs:['portrait']}),evaluateImage:(id,scores)=>({accepted:(scores.identity||0)>=90})};const providers=new MediaProviderRegistry();providers.register({id:'local-image',kinds:['image'],local:true,priority:10,execute:async req=>({imageId:req.imageId||'img',scores:{identity:95},refs:req.characterReferences})});const media=new MediaForge({providers,visuals});assert.throws(()=>media.createJob({id:'j0',kind:'image'}),/MEDIA_DISABLED/);media.configure('image',true);const job=media.createJob({id:'j1',kind:'image',request:{gameId:'g',imageId:'img1',characters:[{entityId:'aria',slot:'A'}]}});assert.equal(job.request.characterReferences[0].entityId,'aria');const finished=await media.run('j1');assert.equal(finished.status,'success');

 // Protocol boundaries never gain authority
 const reg=new AdapterRegistry();reg.register({id:'mcp1',protocol:'mcp',capabilities:['read'],invoke:async p=>({text:'ok',p})});const boundary=new ProtocolBoundary({registry:reg});const out=await boundary.invoke({protocol:'mcp',capability:'read',payload:{path:'a'},sourceRefs:['user:1']});assert.equal(out.trustedForActions,false);assert.equal(out.authority,'derived_external');
 assert.equal(MCPAdapterContract.toolDescriptor({name:'read',schema:{type:'object'}}).authority,'descriptor_only');assert.equal(A2AEnvelope.task({taskId:'t',agentId:'a'}).authority,'external_agent_output_is_derived');assert.equal(GenerativeUIEnvelope.component({type:'card'}).authority,'presentation_only');

 console.log('ultimate platform: 30 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});