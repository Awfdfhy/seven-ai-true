const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
let tick=0;const storage=Session.memoryStorage();const M=Session.createManager({stateApi:State,storage,clock:()=>('T'+(++tick))});
const seed={characters:{hero:{control:'player',locationId:'home'},npc:{control:'ai',locationId:'home'}},world:{locations:{home:{},road:{}}},canon:{entries:{publicFact:{level:'HARD',value:'sun rises',public:true}}}};
let a=M.start({roomId:'room-a',worldId:'world-1',state:seed});assert.equal(a.ok,true);assert.equal(a.session.persistedRevision,0);assert.equal(M.inspect('room-a','world-1').status,'VALID');
let loaded=M.load('room-a','world-1');assert.equal(loaded.ok,true);assert.deepEqual(loaded.session.state,a.session.state);
const stale=M.load('room-a','world-1').session;
let tx=M.commitEvents(loaded.session,[{id:'t1',type:'character.move',source:'user',actorId:'hero',payload:{characterId:'hero',toLocationId:'road'}},{id:'t2',type:'relationship.change',source:'runtime',payload:{a:'hero',b:'npc',delta:{trust:.2},reason:'help'}}]);assert.equal(tx.ok,true);assert.equal(tx.session.state.revision,2);assert.equal(tx.session.state.characters.hero.locationId,'road');assert.equal(State.relationshipFor(tx.session.state,'hero','npc').trust,.2);
let staleWrite=M.commitEvents(stale,[{id:'stale',type:'world.set',source:'runtime',payload:{path:['flags','stale'],value:true}}]);assert.equal(staleWrite.status,'CONFLICT');assert.equal(M.load('room-a','world-1').session.state.world.flags.stale,undefined);
const before=M.load('room-a','world-1').session;const beforeRaw=storage.getItem(M.key('room-a','world-1'));
let rejected=M.commitEvents(before,[{id:'ok-first',type:'world.set',source:'runtime',payload:{path:['flags','temporary'],value:true}},{id:'bad-second',type:'character.move',source:'runtime',actorId:'hero',payload:{characterId:'hero',toLocationId:'home'}}]);assert.equal(rejected.status,'BLOCKED');assert.equal(rejected.eventReason,'player-control');assert.equal(storage.getItem(M.key('room-a','world-1')),beforeRaw);assert.equal(M.load('room-a','world-1').session.state.world.flags.temporary,undefined);
let b=M.start({roomId:'room-b',worldId:'world-1',state:seed});assert.equal(b.ok,true);let btx=M.commitEvents(b.session,[{id:'b1',type:'world.set',source:'runtime',payload:{path:['flags','roomB'],value:1}}]);assert.equal(btx.ok,true);assert.equal(M.load('room-a','world-1').session.state.world.flags.roomB,undefined);assert.equal(M.load('room-b','world-1').session.state.world.flags.roomB,1);
const key=M.key('room-b','world-1');const corrupt=JSON.parse(storage.getItem(key));corrupt.state.turn=999;storage.setItem(key,JSON.stringify(corrupt));const bad=M.load('room-b','world-1');assert.equal(bad.status,'CORRUPT');assert.equal(bad.reason,'integrity-mismatch');assert.equal(storage.getItem(key),null);assert.ok(storage.getItem(key+':quarantine'));
const start2=M.start({roomId:'room-c',worldId:'world-x',state:seed});assert.equal(start2.ok,true);const copied=JSON.parse(storage.getItem(M.key('room-c','world-x')));copied.roomId='other';delete copied.integrity;copied.integrity={algorithm:'fnv1a32',digest:Session.checksum((()=>{const x=JSON.parse(JSON.stringify(copied));delete x.integrity;return x;})())};storage.setItem(M.key('room-c','world-x'),JSON.stringify(copied));const mismatch=M.load('room-c','world-x');assert.equal(mismatch.status,'CORRUPT');assert.equal(mismatch.reason,'identity-mismatch');
// --- Schema evolution -------------------------------------------------------
// A version bump must not strand existing player saves. An older envelope is walked
// forward through the migration ladder; a NEWER envelope is reported, not destroyed.
const seedMigrate={characters:{hero:{control:'player',locationId:'home'}},world:{locations:{home:{}}},canon:{entries:{}}};
const futureStorage=Session.memoryStorage();
const futureM=Session.createManager({stateApi:State,storage:futureStorage,clock:()=>('T1')});
assert.equal(futureM.start({roomId:'room-f',worldId:'world-1',state:seedMigrate}).ok,true);
const futureKey=futureM.key('room-f','world-1');
const v1Raw=futureStorage.getItem(futureKey);
const asV2=JSON.parse(v1Raw);asV2.schemaVersion=2;delete asV2.integrity;
asV2.integrity={algorithm:'fnv1a32',digest:Session.checksum((()=>{const x=JSON.parse(JSON.stringify(asV2));delete x.integrity;return x;})())};
futureStorage.setItem(futureKey,JSON.stringify(asV2));
const futureLoad=futureM.load('room-f','world-1');
assert.equal(futureLoad.ok,false);
assert.equal(futureLoad.status,'UNSUPPORTED','a newer save must not be reported as corrupt');
assert.equal(futureLoad.reason,'future-envelope');
assert.equal(futureLoad.storedVersion,2);
// Crucially: the bytes survive, so a fixed build (or a downgrade) can still recover the campaign.
assert.equal(futureStorage.getItem(futureKey),JSON.stringify(asV2),'a newer save must NOT be quarantined or deleted');
assert.equal(futureStorage.getItem(futureKey+':quarantine'),null);

// Older envelope + a manager that understands the newer schema => migrated forward, data intact.
const migStorage=Session.memoryStorage();
let v1Clock=0;
const v1Manager=Session.createManager({stateApi:State,storage:migStorage,clock:()=>('V1-'+(++v1Clock))});
assert.equal(v1Manager.start({roomId:'room-m',worldId:'world-1',state:seedMigrate}).ok,true);
const migKey=v1Manager.key('room-m','world-1');
const v2Manager=Session.createManager({
  stateApi:State,storage:migStorage,clock:()=>('V2-'+(++v1Clock)),
  schemaVersion:2,
  // v1 -> v2: the shipped shape is unchanged, so the step records the new field and re-stamps.
  migrations:{1:(envelope)=>{const next=JSON.parse(JSON.stringify(envelope));next.schemaVersion=2;next.migratedFrom=1;return next;}}
});
const migrated=v2Manager.load('room-m','world-1');
assert.equal(migrated.ok,true,'an older save must migrate forward, not be rejected');
assert.equal(migrated.status,'LOADED');
assert.equal(migrated.migratedFrom,1);
assert.equal(migrated.session.state.characters.hero.locationId,'home','migration must preserve campaign state');
assert.equal(migrated.envelope.schemaVersion,2,'migrated envelope reports the new schema version');
// The returned envelope must be a VALID envelope in its own right: migration changed the body, so
// the pre-migration digest is stale and must have been re-stamped.
{
  const probe=JSON.parse(JSON.stringify(migrated.envelope));
  const digest=probe.integrity.digest;delete probe.integrity;
  assert.equal(Session.checksum(probe),digest,'migrated envelope must carry a matching digest');
  assert.equal(v2Manager.inspect('room-m','world-1').status,'VALID','migrated envelope must re-validate');
}
// Re-saving commits the upgraded shape at the new version.
assert.equal(v2Manager.persist(migrated.session,{force:true}).ok,true);
assert.equal(JSON.parse(migStorage.getItem(migKey)).schemaVersion,2);
// A ladder that cannot reach the target is reported, not silently accepted.
const noStepManager=Session.createManager({stateApi:State,storage:migStorage,schemaVersion:3,migrations:{}});
assert.equal(noStepManager.load('room-m','world-1').reason,'unsupported-envelope');
// And a manager that does not understand the stored version says so instead of destroying it.
const floorStorage=Session.memoryStorage();
const floorManager=Session.createManager({stateApi:State,storage:floorStorage,clock:()=>('F1')});
assert.equal(floorManager.start({roomId:'room-x',worldId:'world-1',state:seedMigrate}).ok,true);
const floorKey=floorManager.key('room-x','world-1');
const asNew=JSON.parse(floorStorage.getItem(floorKey));asNew.schemaVersion=9;delete asNew.integrity;
asNew.integrity={algorithm:'fnv1a32',digest:Session.checksum((()=>{const x=JSON.parse(JSON.stringify(asNew));delete x.integrity;return x;})())};
floorStorage.setItem(floorKey,JSON.stringify(asNew));
const floorLoad=floorManager.load('room-x','world-1');
assert.equal(floorLoad.ok,false);
assert.equal(floorLoad.reason,'future-envelope');
assert.equal(floorLoad.storedVersion,9);
assert.equal(floorStorage.getItem(floorKey),JSON.stringify(asNew),'an unreadable-but-valid save must not be deleted');
assert.equal(floorStorage.getItem(floorKey+':quarantine'),null);

console.log('rpg session manager: PASS',JSON.stringify({rooms:3,atomicRollback:true,staleWriteBlocked:true,corruptQuarantined:true,schemaMigration:true,futureSavePreserved:true}));
