const assert=require('assert');
const {SevenUltimateRuntime}=require('./src/ultimate/core.js');
const Persist=require('./src/ultimate/persistence.js');
const {MemoryRetriever,ContextWorkspace,ActiveContextCache,LatencyTracker}=require('./src/ultimate/context.js');
const {CharacterEngine,StoryArchitect,ToneDirector,FlashbackDirector}=require('./src/ultimate/rpg-engine.js');
const {ModelFabric,AdaptiveCompute,IntelligenceAmplifier}=require('./src/ultimate/model-fabric.js');
const {BUILTIN_TOOL_IDS,PermissionLedger,ToolFabric,ToolRun}=require('./src/ultimate/tool-fabric.js');
const UI=require('./src/ultimate/ui-system.js');
const {EvidenceGraph,QueryPortfolio,ResearchController}=require('./src/ultimate/research.js');
const {VisualCanonVault}=require('./src/ultimate/visual-canon.js');

let tick=0;const clock=()=>`2026-09-12T22:00:${String(tick++).padStart(2,'0')}+03:00`;
function makeRuntime(){
 const rt=new SevenUltimateRuntime({clock});
 rt.createGame({id:'g',name:'Valen'});rt.createCampaign('g',{id:'c'});rt.createTimeline('g','c',{id:'t'});
 rt.registerEntity('g',{id:'ali',name:'Ali',tier:'core'});rt.registerEntity('g',{id:'aria',name:'Aria',tier:'core'});
 const e1=rt.appendEvent('g','c','t',{id:'e1',type:'meeting',actorIds:['aria'],witnessIds:['ali'],payload:{text:'first palace meeting',topic:'crown'}});
 const e2=rt.appendEvent('g','c','t',{id:'e2',type:'crown',actorIds:['ali'],witnessIds:['aria'],payload:{text:'crown authority challenged'},causeRefs:[e1.ref]});
 rt.remember('g','c','t','ali',{id:'m1',sourceEventRef:e1.ref,interpretation:{summary:'first meeting'},emotionalWeight:4});
 rt.remember('g','c','t','ali',{id:'m2',sourceEventRef:e2.ref,interpretation:{summary:'crown crisis'},emotionalWeight:8});
 rt.createTrack('g','c','t',{id:'main',kind:'mainline'});rt.createTrack('g','c','t',{id:'side',kind:'filler'});
 rt.createFlashback('g','c','t',{id:'fb',trackId:'side',kind:'canonical_recall',sourceEventRefs:[e1.ref]});
 return rt;
}

(async()=>{
 const rt=makeRuntime();
 // persistence + integrity + optimistic revision
 const backup=Persist.createBackup(rt,{createdAt:'2026-09-12T22:00:00+03:00'});assert.equal(Persist.validateBackup(backup),true);
 const restored=Persist.restoreBackup(backup,{clock});assert.deepStrictEqual(restored.gameSummary('g'),rt.gameSummary('g'));
 assert.equal(restored.memories('g','c','t','ali').length,2);assert.equal(restored.storyAtlas('g','c','t').flashbacks.length,1);
 const corrupted=JSON.parse(JSON.stringify(backup));corrupted.payload.games[0].name='Tampered';assert.throws(()=>Persist.validateBackup(corrupted),/BACKUP_CORRUPT/);
 const store=new Persist.RevisionedMemoryStore();const s1=await Persist.persistRuntime(store,'state',rt,0,{createdAt:'2026-09-12T22:00:00+03:00'});assert.equal(s1.revision,1);
 await assert.rejects(()=>Persist.persistRuntime(store,'state',rt,0),/STALE_REVISION/);
 const loaded=await Persist.loadRuntime(store,'state',{clock});assert.equal(loaded.revision,1);assert.equal(loaded.runtime.gameSummary('g').events,2);

 // selective character memory/context
 const retriever=new MemoryRetriever(rt);const recall=retriever.searchCharacter('g','c','t','ali','crown',{limit:1,tokenBudget:600});assert.equal(recall.items.length,1);assert.equal(recall.items[0].event.id,'e2');
 assert.equal(retriever.causesOf('g','c','t','t:e2')[0].id,'e1');
 const ws=new ContextWorkspace();ws.add({id:'canon',category:'canon',content:{a:1},priority:10,pinned:true,sourceRefs:['t:e1']});ws.add({id:'noise',category:'chat',content:'x'.repeat(2000),priority:1});
 ws.compress('canon',{a:'summary'},'summary');assert.equal(ws.get('canon').lineage.sourcePreserved,true);ws.expand('canon');assert.equal(ws.get('canon').content.a,1);
 const compiled=ws.compile({totalBudget:50,categoryBudgets:{canon:50,chat:10}});assert.ok(compiled.items.some(x=>x.id==='canon'),'pinned authoritative context must survive budget pressure');
 const cache=new ActiveContextCache({clock:(()=>{let n=0;return()=>n+=10})(),ttlMs:100});cache.set('g','c','t',{scene:'palace'});assert.equal(cache.patch('g','c','t',{turn:2}).turn,2);
 const latency=new LatencyTracker();latency.record({contextMs:20,memoryMs:10,networkMs:50,ttftMs:200,generationMs:800,cacheHit:true});assert.equal(latency.bottleneck(),'generationMs');

 // character soul + decisions + story architecture
 const chars=new CharacterEngine(rt);const aria=chars.createProfile('g','aria',{values:[{name:'autonomy',weight:100},{name:'duty',weight:75}],philosophy:['Power must justify itself'],goals:[{id:'protect_choice',text:'protect choice',weight:90}],voice:{formality:'high',directness:'medium'},riskTolerance:45});
 chars.createProfile('g','ali',{values:[{name:'freedom',weight:100}],philosophy:['Imposed authority deserves resistance'],goals:['stay free'],voice:{formality:'low',humor:'high'},riskTolerance:90});
 assert.ok(chars.similarity(aria,chars.get('g','ali'))<.82,'major characters should be structurally distinct');
 const decision=chars.decide('g','aria',{knownFacts:['treaty_clause'],relationships:{ali:90}},[{id:'support',requiredFacts:['treaty_clause'],valueEffects:{autonomy:1},goalEffects:{protect_choice:1},risk:30,relationshipEffects:{ali:1}},{id:'submit',valueEffects:{autonomy:-1},risk:5}]);assert.equal(decision.choice,'support');
 const blocked=chars.decide('g','aria',{knownFacts:[]},[{id:'secret_action',requiredFacts:['secret_x'],valueEffects:{autonomy:2}}]);assert.equal(blocked.choice,null);
 const story=new StoryArchitect();story.defineSeries('t',{title:'Valen',themes:['choice'],questions:['What becomes of the crown?']});story.createSeason('t',{id:'s1',dramaticQuestion:'Can Valen remain free?'});story.createArc('t',{id:'crown',seasonId:'s1',title:'Crown',status:'active'});story.createArc('t',{id:'ecc',seasonId:'s1',title:'ECC',dependencies:['crown']});
 assert.equal(story.canAdvanceArc('t','ecc').allowed,false);story.updateArc('t','crown','resolved');assert.equal(story.canAdvanceArc('t','ecc').allowed,true);
 const overloaded=story.scheduleEpisode('t',{seasonId:'s1',beats:[{weight:5,kind:'irreversible',arcIds:['ecc']},{weight:5,kind:'irreversible',arcIds:['ecc']},{weight:5,arcIds:['ecc']},{weight:4,arcIds:['ecc']}]});assert.ok(overloaded.warnings.includes('NARRATIVE_OVERLOAD'));assert.ok(overloaded.warnings.includes('TOO_MANY_IRREVERSIBLE_BEATS'));
 assert.equal(story.seasonClosureGate('t','s1',{primaryQuestionResolved:true,majorPayoffsHandled:true,causalConsequencesCommitted:true,characterTransformationVisible:true,newStatusQuo:true}).pass,true);
 const tone=new ToneDirector();assert.equal(tone.whiplash({seriousness:100,tension:100,humor:0,warmth:0,pace:20,conflict:100},{seriousness:0,tension:0,humor:100,warmth:100,pace:100,conflict:0}).warning,true);
 const flash=new FlashbackDirector();assert.equal(flash.contract({kind:'historical_gap'}).mayCommitHistory,true);assert.equal(flash.score({contextRelevance:100,characterRelevance:100,causalImportance:100,emotionalResonance:100,plotPayoff:100,unansweredQuestionValue:100}).recommended,true);

 // model routing and adaptive intelligence
 const mf=new ModelFabric();mf.registerProvider({id:'local',local:true,latencyMs:90});mf.registerProvider({id:'freecloud',freeProof:'verified_free',latencyMs:220});mf.registerProvider({id:'paid',freeProof:'paid',latencyMs:60});
 mf.registerModel({id:'local-fast',providerId:'local',roles:['general','rpg'],quality:.6,speed:.95,capabilities:['tools']});mf.registerModel({id:'cloud-smart',providerId:'freecloud',roles:['general','rpg'],quality:.95,speed:.7,capabilities:['tools']});mf.registerModel({id:'paid-best',providerId:'paid',roles:['general'],quality:1,speed:1,costClass:'paid'});
 mf.recordOutcome('cloud-smart',{taskType:'rpg',success:true,latencyMs:300});mf.recordOutcome('cloud-smart',{taskType:'rpg',success:true,latencyMs:280});mf.recordOutcome('local-fast',{taskType:'rpg',success:false,latencyMs:80});
 const routed=mf.route({role:'rpg',taskType:'rpg',capabilities:['tools']});assert.equal(routed.selected.modelId,'cloud-smart');assert.ok(!routed.candidates.some(x=>x.modelId==='paid-best'),'paid models must not enter free-first route by default');
 const compute=new AdaptiveCompute();assert.equal(compute.decide({complexity:.95,uncertainty:.9,risk:.9,latencyPriority:.1}).mode,'max');
 const amp=new IntelligenceAmplifier(mf,compute);assert.ok(amp.plan({role:'rpg',taskType:'rpg',capabilities:['tools'],complexity:.8,uncertainty:.8,risk:.8,latencyPriority:.1}).stages.includes('verify'));

 // tools, grants and UI contracts
 const tools=new ToolFabric();assert.equal(BUILTIN_TOOL_IDS.length,40);assert.equal(tools.resolve('canon_guardian').category,'rpg');
 tools.register({id:'safe_edit',category:'coding',capabilities:['edit'],aliases:['edit_alias'],actionClass:'write',schema:{type:'object',required:['path'],properties:{path:{type:'string'}},additionalProperties:false}});assert.equal(tools.resolve('edit_alias').id,'safe_edit');assert.equal(tools.validateArgs('safe_edit',{path:'a.js'}),true);assert.throws(()=>tools.validateArgs('safe_edit',{path:'a.js',oops:true}),/TOOL_ARG_UNKNOWN/);
 const grants=new PermissionLedger();grants.issue({id:'grant1',sourceEventRef:'permission:event1',scope:'project1',toolIds:['safe_edit'],actionClasses:['write']});assert.equal(grants.authorize({scope:'project1',toolId:'safe_edit',actionClass:'write'}).allowed,true);grants.revoke('grant1');assert.equal(grants.authorize({scope:'project1',toolId:'safe_edit',actionClass:'write'}).allowed,false);
 const run=new ToolRun('safe_edit');run.transition('starting');run.transition('waiting_permission');run.transition('running');run.transition('success');assert.equal(run.state,'success');assert.equal(tools.uiContract('safe_edit').reducedMotion.motion,'opacity-only');

 // UI identity / motion
 const morning=UI.themeFor({mode:'automatic',date:new Date(2026,8,12,9,0)}),night=UI.themeFor({mode:'automatic',date:new Date(2026,8,12,23,0)});assert.equal(morning.launcherIcon,'seven-day');assert.equal(night.launcherIcon,'seven-night');assert.equal(UI.motionContract({reducedMotion:true}).enter,'opacity-only');
 const scheduler=new UI.MotionScheduler({maxExpressive:1});const a=scheduler.request({id:'a',kind:'expressive'}),b=scheduler.request({id:'b',kind:'expressive'});assert.equal(a.state,'active');assert.equal(b.state,'queued');assert.ok(scheduler.complete('a').active.some(x=>x.id==='b'));

 // evidence-first research
 const graph=new EvidenceGraph();graph.addSource({id:'official',url:'https://example.com/docs?utm_source=x',independenceRoot:'official',authority:1});graph.addSource({id:'independent',url:'https://other.example/report',independenceRoot:'other'});graph.addClaim({id:'claim1',text:'Feature exists',requiredEvidence:2});graph.link({claimId:'claim1',sourceId:'official',relation:'support',passage:'docs say yes'});assert.equal(graph.claimView('claim1').claim.status,'unverified');graph.link({claimId:'claim1',sourceId:'independent',relation:'support',passage:'independent confirmation'});assert.equal(graph.claimView('claim1').claim.status,'supported');assert.equal(graph.citationAudit().pass,true);
 graph.addClaim({id:'claim2',text:'Conflicted claim',requiredEvidence:1});graph.link({claimId:'claim2',sourceId:'official',relation:'support',passage:'yes'});graph.link({claimId:'claim2',sourceId:'independent',relation:'contradict',passage:'no'});assert.equal(graph.conflicts().length,1);
 const portfolio=new QueryPortfolio().build('Seven AI',{technical:true,historical:true,languages:['ar']});assert.ok(portfolio.some(x=>x.kind==='criticism')&&portfolio.some(x=>x.kind==='multilingual'));
 const rc=new ResearchController();rc.begin('test');rc.graph=graph;assert.equal(rc.canStop(),false,'unresolved contradiction must prevent evidence saturation stop');

 // visual canon and closed-loop acceptance
 const visuals=new VisualCanonVault();visuals.registerCharacter('g','aria',{identity:{face:'canon'},palette:{primary:'#fff'}});visuals.addOutfit('g','aria',{id:'royal',name:'Royal'});visuals.addAccessory('g','aria',{id:'crown_pin'});visuals.addReference('g','aria',{id:'ref1',kind:'main_portrait',uri:'ref://aria'});visuals.transition('g','aria',{id:'v2',outfitId:'royal',accessoryIds:['crown_pin'],episodeId:'ep12',sourceEventRef:'t:e2'});assert.equal(visuals.referencePack('g','aria').state.outfitId,'royal');
 visuals.registerGeneratedImage({id:'img1',gameId:'g',characters:[{entityId:'aria',slot:'A'}],episodeId:'ep12'});const bad=visuals.evaluateImage('img1',{identity:96,hair:95,eyes:96,outfit:70,accessories:90,style:94,pose:92,scene:95});assert.equal(bad.accepted,false);const good=visuals.evaluateImage('img1',{identity:96,hair:95,eyes:96,outfit:94,accessories:92,style:94,pose:92,scene:95});assert.equal(good.accepted,true);

 console.log('ultimate systems: 52 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});
