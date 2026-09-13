const assert=require('assert/strict');
const {createEngine,STATUS}=require('./world-runtime.js');

const world=createEngine({
  id:'demo-series',title:'Demo Series',continuity:'anime',
  sources:[{id:'official-ep1',authority:'A0'},{id:'official-ep2',authority:'A0'}],
  beats:[
    {id:'ep1-start',sourceRefs:['official-ep1'],anchors:['meet'],requiredFacts:['hero-arrives']},
    {id:'ep1-end',sourceRefs:['official-ep1'],anchors:['promise']},
    {id:'ep2-start',sourceRefs:['official-ep2'],anchors:['next-day']}
  ],
  titleRules:{episode:'Case',sideStory:'Interlude'}
});

let session=world.createSession();
let contract=world.sceneContract(session);
assert.equal(contract.expectedBeatId,'ep1-start');
assert.equal(contract.status,STATUS.CANON);
assert.equal(contract.playerAgencyLock,true);

let result=world.commitBeat(session,{beatId:'ep2-start'});
assert.equal(result.status,STATUS.BLOCKED);
assert.equal(result.reason,'canon-order');
assert.equal(result.expectedBeatId,'ep1-start');

result=world.commitBeat(session,{beatId:'ep1-start',playerAction:'walks away',playerActionSource:'runtime'});
assert.equal(result.status,STATUS.BLOCKED);
assert.equal(result.reason,'player-agency');

result=world.commitBeat(session,{beatId:'ep1-start',playerAction:'walks away',playerActionSource:'user'});
assert.equal(result.status,STATUS.CANON);
session=result.session;
assert.equal(session.beatIndex,0);

const titled=world.recordTitle(session,'episode',{number:1,name:'Arrival'});
assert.equal(titled.title,'Case 1 — Arrival');
session=titled.session;
assert.equal(session.titles.length,1);

result=world.commitBeat(session,{beatId:'ep2-start',allowBranch:true,branchId:'what-if-1'});
assert.equal(result.status,STATUS.BRANCH);
assert.equal(result.session.branchId,'what-if-1');
assert.equal(result.session.branchOrigin.expectedBeatId,'ep1-end');
assert.equal(world.audit(result.session).branch.status,'BRANCHED');

const uncertain=createEngine({id:'unsourced',beats:[{id:'b1'}]});
const uncertainSession=uncertain.createSession();
assert.equal(uncertain.sceneContract(uncertainSession).status,STATUS.UNVERIFIED);
const uncertainResult=uncertain.commitBeat(uncertainSession,{beatId:'b1'});
assert.equal(uncertainResult.status,STATUS.UNVERIFIED);
assert.equal(uncertain.audit(uncertainResult.session).sourceFidelity.status,'INCONCLUSIVE');

console.log('world runtime: PASS');
