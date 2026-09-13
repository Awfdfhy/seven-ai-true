const assert=require('assert/strict');
const {createEngine,STATUS}=require('./canon-simulator.js');

const engine=createEngine({
  id:'demo-work',version:'1.0.0',defaultContinuity:'anime',
  continuities:[{id:'anime'}],
  sources:[{id:'official',authority:'A0'},{id:'wiki',authority:'A3'}],
  entities:[{id:'hero'},{id:'guide'}],
  facts:[
    {id:'secret',availableAt:10,knownBy:['guide'],sources:['official']},
    {id:'rumor',availableAt:2,sources:['wiki']}
  ],
  anchors:[
    {id:'meeting',strength:'strong',continuity:'anime'},
    {id:'finale',strength:'rigid',continuity:'anime'}
  ],
  invariants:[
    {id:'guide-home',type:'location',entityId:'guide',value:'village',severity:'error'},
    {id:'secret-lock',type:'fact-unknown-before',characterId:'hero',factId:'secret',before:10,severity:'error'}
  ]
});

const session=engine.createSession({continuity:'anime',position:5,locations:{guide:'village'}});
assert.equal(engine.factStatus(engine.pack.facts[0]),STATUS.VERIFIED);
assert.deepEqual(engine.canCharacterKnow(session,'hero','secret'),{allowed:false,status:'verified',reason:'future-knowledge'});
assert.equal(engine.canCharacterKnow(session,'guide','secret').allowed,false,'future horizon must beat static knownBy');
assert.ok(engine.scoreInsertion({canonDisruption:.1,characterOpportunity:.8,playerAgency:.9,narrativeValue:.9,causalCompatibility:.9,temporalCompatibility:.9,futureAnchorRisk:.1})>70);

const contract=engine.buildSceneContract(session,{characters:['hero','guide'],anchorIds:['meeting'],mustBeTrue:['guide-present']});
assert.equal(contract.canonObligations[0].id,'meeting');
assert.equal(contract.position,5);

let result=engine.applySceneDelta(session,{position:6,relationships:{'hero:guide':{trust:.2}}},{id:'scene-1'});
assert.equal(result.branched,false);
assert.equal(result.session.ledger.length,1);
assert.equal(engine.audit(result.session).characterKnowledge.status,'PASS');

result=engine.applySceneDelta(result.session,{invalidatesAnchors:['finale']},{id:'scene-2'});
assert.equal(result.branched,true);
assert.equal(result.session.branchOrigin.reason,'rigid-anchor-invalidated');
assert.equal(result.record.status,STATUS.BRANCH);

const bad=engine.applySceneDelta(session,{knowledge:{hero:['secret']}},{id:'scene-bad'});
assert.equal(bad.issues.length,1);
assert.equal(engine.audit(bad.session).characterKnowledge.status,'FAIL');

console.log('canon simulator: PASS');
