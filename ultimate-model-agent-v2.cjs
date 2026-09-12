const assert=require('assert');
const MC=require('./src/ultimate/model-control-plane.js');
const AF=require('./src/ultimate/agent-fabric-v2.js');
const EV=require('./src/ultimate/model-evolution-lab.js');
const IN=require('./src/ultimate/intelligence-orchestrator.js');
const UI=require('./src/ultimate/model-agent-ui.js');

(async()=>{
const models={providers:new Map([
 ['p1',{id:'p1',health:'healthy',freeProof:'verified_free',local:false,latencyMs:120,quotaState:'ok'}],
 ['p2',{id:'p2',health:'healthy',freeProof:'local',local:true,latencyMs:180,quotaState:'ok'}]
]),eligible:()=>[
 {id:'fast',providerId:'p1',roles:['general','coding'],quality:.86,speed:.95,context:16000,costClass:'free'},
 {id:'deep',providerId:'p2',roles:['reasoning','coding'],quality:.94,speed:.72,context:64000,costClass:'free'},
 {id:'tiny',providerId:'p1',roles:['general'],quality:.55,speed:.99,context:2048,costClass:'free'}
]};
const control=new MC.ModelControlPlane({models});
let plan=control.plan({role:'coding',taskType:'coding',contextTokens:6000,maxOutputTokens:512,complexity:.8,uncertainty:.7,risk:.5,verifiability:.9,latencyPriority:.25,selfHosted:true,promptTokens:18000,stablePrefixTokens:1000,availableAccelerators:2,latencySla:'strict',expectedConcurrency:2});
assert.ok(plan.route.selected.modelId);
assert.ok(!plan.route.candidates.some(x=>x.modelId==='tiny'));
assert.ok(['solver_critic_repair','council_graph','tree_search'].includes(plan.strategy.mode));
assert.equal(plan.serving.hints.prefixCaching,true);
assert.equal(plan.serving.hints.chunkedPrefill,true);
assert.equal(plan.serving.hints.disaggregatedPrefill,true);
assert.throws(()=>control.recordVerifiedOutcome({modelId:'fast',taskType:'coding',verified:false,success:true}),/VERIFIED/);
for(let i=0;i<6;i++)control.recordVerifiedOutcome({modelId:'deep',taskType:'coding',verified:true,success:true,quality:.95});
assert.ok(control.outcomes.score('deep','coding').mean>.5);
control.recordAttempt({providerId:'p1',modelId:'fast',success:false,ttftMs:900,error:'timeout'});
assert.equal(control.telemetry.snapshot('p1','fast').requests,1);

const registry=new AF.AgentRegistry();
registry.register({id:'planner',role:'general',capabilities:['plan']});
registry.register({id:'coder',role:'coding',capabilities:['edit','test']});
const board=new AF.SharedBlackboard();
board.write({key:'truth',value:{v:1},authority:'authoritative',sourceEventRef:'evt1'});
assert.throws(()=>board.write({key:'truth',value:{v:2},authority:'derived'}),/DERIVED/);
const graph=new AF.TaskGraph();
graph.add({id:'a',capabilities:['plan']});
graph.add({id:'b',requires:['a'],preferredRole:'coding',capabilities:['edit','test']});
assert.deepEqual(graph.runnable().map(x=>x.id),['a']);
const fabric=new AF.AgentFabricV2({registry,blackboard:board});
const run=fabric.createRun({id:'run1',taskType:'coding',graph,subtasks:2,independence:0});
const result=await fabric.execute({run,executor:async({task})=>({success:true,result:{task:task.id},modelCalls:1,tokens:20}),verifiedOutcome:{verified:true,success:true}});
assert.equal(result.status,'completed');
assert.ok(result.tasks.every(x=>x.state==='success'));
const hc=new AF.HandoffContract(),h=hc.create({from:'planner',to:'coder',taskId:'b',contextKeys:['truth']});
assert.equal(hc.validate(h,registry).pass,true);
const refl=new AF.ReflectionStore();
assert.throws(()=>refl.add({taskType:'coding',lesson:'x'}),/VERIFIED/);
refl.add({taskType:'coding',lesson:'test after edit',verified:true,score:.9});
assert.equal(refl.retrieve('coding')[0].lesson,'test after edit');

const store=new EV.VerifiedExperienceStore();
for(let i=0;i<12;i++)store.add({id:'e'+i,taskType:'coding',input:{q:i},output:{a:i},verified:true,success:true,evidenceRefs:['test:'+i],groupId:'g'+Math.floor(i/2)});
assert.equal(store.stats().count,12);
const dataset=new EV.DatasetBuilder(store).build({taskType:'coding'});
assert.equal(dataset.pass,true);
assert.equal(dataset.leakage.length,0);
const recipe=new EV.TrainingRecipePlanner().plan({openWeights:true,examples:400,preferencePairs:150,verifiableFraction:.8,teacherAvailable:true,hardware:{multiGpu:true},goals:['latency'],draftModelCandidate:true});
assert.ok(recipe.steps.some(x=>x.kind==='sft_qlora'));
assert.ok(recipe.steps.some(x=>x.kind==='dpo'));
assert.ok(recipe.steps.some(x=>x.kind==='verifiable_reward_training'));
const lineage=new EV.ModelLineageRegistry();lineage.register({id:'base'});lineage.register({id:'v1',parentId:'base',datasetId:dataset.id});
assert.throws(()=>lineage.promote('v1',{status:'canary',gate:{pass:false}}),/GATE/);
lineage.promote('v1',{status:'canary',gate:{pass:true}});
assert.equal(lineage.ancestry('v1').length,2);
const search=new EV.WorkflowEvolutionSearch({maxPopulation:4});search.seed({id:'w0',nodes:[{id:'solve'}]});const w1=search.mutate('w0',{id:'w1',operations:[{type:'add_node',node:{id:'verify'}}]});search.score('w0',{verified:true,quality:.6,latencyMs:1000,modelCalls:1});search.score(w1.id,{verified:true,quality:.9,latencyMs:1200,modelCalls:2});assert.equal(search.elite(1)[0].id,'w1');

let calls=0;const intel=new IN.IntelligenceOrchestrator({invoke:async({candidateIndex,stage})=>{calls++;return{answer:`${stage}-${candidateIndex}`}},verify:async c=>({verified:true,score:c.answer.endsWith('-1')?.95:.6})});
const out=await intel.run({prompt:'solve',models:[{id:'m1'},{id:'m2'}],strategy:{mode:'sample_verify',budget:{candidates:2,maxModelCalls:4,maxVerifierCalls:2,parallel:2}}});
assert.equal(out.winner.verified,true);assert.ok(out.winner.score>=.95);assert.equal(calls,2);assert.ok(out.trace.some(x=>x.stage==='verify'));
const presenter=new UI.ModelAgentPresentation();
assert.equal(presenter.modelCockpit({plan}).kind,'model_cockpit');
assert.equal(presenter.agentCockpit({run:result}).kind,'agent_cockpit');
assert.equal(presenter.inference(out).privacy.includes('private deliberation'),true);
console.log('ultimate model/agent v2: 35 assertions PASS');
})().catch(e=>{console.error(e);process.exit(1)});