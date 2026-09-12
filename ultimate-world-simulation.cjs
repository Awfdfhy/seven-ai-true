const assert=require('assert');
const W=require('./src/ultimate/world-simulation.js');

const inertia=new W.WorldInertiaMatrix();
const culture=inertia.apply('culture',0,100);
const emotion=inertia.apply('emotion',0,100);
assert.ok(Math.abs(culture.delta)<Math.abs(emotion.delta),'culture should change more slowly than emotion');
assert.equal(inertia.canTransform('law',100).requiresMorePressure,true);

const sim=new W.SimulationScheduler({hotInterval:1,warmInterval:3});
sim.register({id:'hero',tier:'hot',wakeTags:['palace'],state:{turns:0},priority:10});
sim.register({id:'court',tier:'warm',wakeTags:['palace'],state:{turns:0},priority:5});
sim.register({id:'far-city',tier:'cold',wakeTags:['war'],state:{turns:0}});
assert.equal(sim.due({maxEntities:10}).some(x=>x.id==='far-city'),false,'cold entities should sleep by default');
let r=sim.tick(v=>({state:{turns:(v.state.turns||0)+1}}));
assert.ok(r.processed.some(x=>x.id==='hero'));
assert.equal(r.processed.some(x=>x.id==='far-city'),false);
sim.wakeByEvent({type:'rumor',tags:['war']});
r=sim.tick(v=>({state:{turns:(v.state.turns||0)+1}}));
assert.ok(r.processed.some(x=>x.id==='far-city'),'relevant event should wake cold entity');
assert.equal(sim.view('far-city').nextTick,Infinity,'cold entity should return to sleep');

const info=new W.InformationPropagation();
info.addNode({id:'valen',permeability:1});info.addNode({id:'elaria',permeability:.9});info.addNode({id:'ravenna',permeability:.8});
info.connect('valen','elaria',{latency:2,trust:.9,distortion:.05});
info.connect('elaria','ravenna',{latency:3,trust:.8,distortion:.1});
const rumor=info.release({id:'m1',origin:'valen',time:10,confidence:1});
assert.equal(info.knows('m1','elaria',11),false);assert.equal(info.knows('m1','elaria',12),true);assert.equal(info.knows('m1','ravenna',15),true);
const ravenna=rumor.arrivals.find(x=>x.node==='ravenna');assert.ok(ravenna.confidence<1);assert.deepEqual(ravenna.path,['valen','elaria','ravenna']);

const institution=new W.InstitutionalMind({id:'council',values:[{name:'stability',weight:90}],mandates:['no_surrender'],inertia:.85});
const decision=institution.decide([{id:'surrender',utility:100,violatesMandates:['no_surrender']},{id:'negotiate',utility:30,stability:80,valueEffects:{stability:5}},{id:'attack',utility:50,stability:-20,valueEffects:{stability:-4}}],{sourceEventRefs:['event:1']});
assert.equal(decision.choice,'negotiate');assert.equal(decision.candidates.find(x=>x.id==='surrender').score,-Infinity);assert.deepEqual(decision.proof.sourceEventRefs,['event:1']);

console.log('ultimate world simulation: 18 assertions PASS');
