const assert=require('assert');
const {SevenUltimateRuntime}=require('./src/ultimate/core.js');
const {KnowledgeFirewall,RelationshipGraph,PlotRegistry,WorldState,CausalLogicEngine}=require('./src/ultimate/rpg-state.js');
const {RequestRuntime}=require('./src/ultimate/request-runtime.js');

(async()=>{
 let n=0;const rt=new SevenUltimateRuntime({clock:()=>`2026-09-12T23:00:${String(n++).padStart(2,'0')}+03:00`});
 rt.createGame({id:'g',name:'Valen'});rt.createCampaign('g',{id:'c'});rt.createTimeline('g','c',{id:'t'});rt.registerEntity('g',{id:'ali',name:'Ali'});rt.registerEntity('g',{id:'aria',name:'Aria'});
 const source=rt.appendEvent('g','c','t',{id:'source',type:'discovery',actorIds:['aria'],witnessIds:['aria'],payload:{fact:'clause17'}});
 const knowledge=new KnowledgeFirewall(rt);knowledge.learn('g','c','t','aria',{factId:'clause17',sourceEventRef:source.ref,confidence:95,interpretation:'dangerous clause'});assert.equal(knowledge.knows('g','t','aria','clause17'),true);assert.equal(knowledge.knows('g','t','ali','clause17'),false,'facts must not leak between characters');
 const rel=new RelationshipGraph();rel.apply('ali','aria',{sourceEventRef:source.ref,trust:8,respect:3,reason:'shared evidence'});assert.equal(rel.get('ali','aria').trust,58);assert.equal(rel.why('aria','ali').length,1);
 const plots=new PlotRegistry(rt);plots.create({id:'ecc',title:'ECC',originEventRef:source.ref,openQuestions:['who controls it?']});plots.advance('g','c','t','ecc',{sourceEventRef:source.ref,action:'open'});assert.equal(plots.get('ecc').events.length,1);
 const world=new WorldState();world.setEntity('g','t','aria',{locationId:'palace'});world.setResource('g','t','influence',5);
 const logic=new CausalLogicEngine(rt,knowledge,world);
 const proposal={gameId:'g',campaignId:'c',timelineId:'t',actorEntityId:'aria',requiredFacts:['clause17'],requiredLocation:'palace',resourceCosts:{influence:2},entityPatch:{stance:'opposed'},type:'political_action',action:{kind:'challenge_clause'},prerequisiteEventRefs:[source.ref]};
 const sim=logic.simulate(proposal);assert.equal(sim.pass,true);assert.equal(world.snapshot('g','t').resources.influence,5,'simulation must never mutate authoritative world state');
 const committed=logic.commit({...proposal,eventId:'challenge'});assert.equal(committed.state.resources.influence,3);assert.equal(committed.state.entities.aria.stance,'opposed');assert.equal(rt.visibleEvents('g','c','t').length,2);
 assert.equal(logic.validate({...proposal,actorEntityId:'ali'}).pass,false,'actor without knowledge/location must fail validation');

 const requests=new RequestRuntime({defaultTimeoutMs:1000});
 async function* stream(){yield 'Hello ';yield 'Seven';}
 const done=await requests.run({id:'r1',execute:async()=>stream(),flushIntervalMs:0});assert.equal(done.status,'completed');assert.equal(done.output,'Hello Seven');
 let release;const wait=new Promise(r=>release=r);async function* slow({signal}){yield 'A';await wait;if(signal.aborted)return;yield 'B';}
 const pending=requests.run({id:'r2',execute:async({signal})=>slow({signal}),flushIntervalMs:0});await new Promise(r=>setTimeout(r,5));assert.equal(requests.cancel('r2'),true);release();const cancelled=await pending;assert.equal(cancelled.status,'cancelled');assert.ok(!cancelled.output.includes('B'),'late chunks after cancellation must be rejected');
 const prep=await requests.prepareParallel({memory:async()=>1,context:async()=>2},{required:['memory','context']});assert.equal(prep.memory.value,1);await assert.rejects(()=>requests.prepareParallel({requiredTask:async()=>{throw new Error('boom')}},{required:['requiredTask']}),/PREPARE_REQUIRED_FAILED/);
 console.log('ultimate advanced: 18 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});
