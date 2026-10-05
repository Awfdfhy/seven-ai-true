const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Live=require('./workspaces/rpg-live-integration.js');
const backingStorage=Session.memoryStorage(),mem={objects:[]};
let seq=0,failMemory=false,failIndex=false,failAll=false,quotaAfterIndex=false,failJournalRemove=false;
const storage={getItem:k=>backingStorage.getItem(k),setItem:(k,v)=>{if(failAll)throw Error('fixture quota');if(failIndex&&String(k).includes(':active:')){if(quotaAfterIndex)failAll=true;throw Error('fixture index write failure')}return backingStorage.setItem(k,v)},removeItem:k=>{if(failAll)throw Error('fixture quota');if(failJournalRemove&&String(k).includes(':pending:'))throw Error('fixture journal remove failure');return backingStorage.removeItem(k)}};
const runtime={
  hash:s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16)},
  lineage:(source,transformation,parentRefs=[])=>({source,transformation,parentRefs}),
  readMemory:()=>({version:1,objects:mem.objects.map(x=>JSON.parse(JSON.stringify(x))),events:[]}),
  createMemory:(content,type,opts)=>({id:opts.id,content,type,version:1,createdAt:++seq,scope:opts.scope,source:opts.source,provenance:{source:'rpg'},authority:{originAuthority:'rpg',authorityClass:'derived'},evidenceRefs:[],relationRefs:[],policy:{}}),
  commitMemory:(obj,op)=>{if(failMemory)return false;const i=mem.objects.findIndex(x=>x.id===obj.id);if(op==='CREATE'){if(i>=0)return false;mem.objects.push(JSON.parse(JSON.stringify(obj)));return true}if(op==='UPDATE'){if(i<0)return false;mem.objects[i]=JSON.parse(JSON.stringify(obj));return true}return false}
};
const a=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});

// Structured live transaction: deterministic validation owns mutation, including player agency and HARD CANON.
const txSeed={worldId:'tx-world',world:{locations:{home:{},road:{}}},characters:{hero:{control:'player',locationId:'home'},npc:{control:'ai',locationId:'home'}},canon:{entries:{law:{level:'HARD',value:'old law',public:true}}}};
assert.equal(a.manager.start({roomId:'tx-room',worldId:'tx-world',state:txSeed,legacy:null}).ok,true);
let txOut=a.transact({roomId:'tx-room',worldId:'tx-world',events:[{id:'bad-player',type:'character.move',source:'runtime',actorId:'hero',payload:{characterId:'hero',toLocationId:'road'}}]});
assert.equal(txOut.ok,false);assert.equal(txOut.eventReason,'player-control');assert.equal(a.load('tx-room','tx-world').session.state.characters.hero.locationId,'home');
txOut=a.transact({roomId:'tx-room',worldId:'tx-world',events:[{id:'user-move',type:'character.move',source:'user',actorId:'hero',payload:{characterId:'hero',toLocationId:'road'}}]});
assert.equal(txOut.ok,true);assert.equal(txOut.status,'COMMITTED');assert.equal(a.loadLatest('tx-room').session.state.characters.hero.locationId,'road');
const revisionAfterMove=a.load('tx-room','tx-world').session.state.revision;
txOut=a.transact({roomId:'tx-room',worldId:'tx-world',events:[{id:'bad-canon',type:'canon.set',source:'runtime',authority:'runtime',payload:{id:'law',entry:{level:'HARD',value:'new law',public:true}}}]});
assert.equal(txOut.ok,false);assert.equal(txOut.eventReason,'hard-canon-conflict');assert.equal(a.load('tx-room','tx-world').session.state.revision,revisionAfterMove);
failMemory=true;
txOut=a.transact({roomId:'tx-room',worldId:'tx-world',events:[{id:'memory-fail',type:'world.set',source:'runtime',payload:{path:['flags','temp'],value:true}}]});
assert.equal(txOut.ok,false);assert.equal(txOut.reason,'memory-projection-failed');assert.equal(a.load('tx-room','tx-world').session.state.world.flags.temp,undefined);
failMemory=false;

const one={work:{id:'valen',title:'Valen'},worldSession:{position:1,titles:[]},canonPack:{id:'canon'},canonSession:{position:1,ledger:[]}};
let out=a.sync({roomId:'room-a',worldId:'valen',legacy:one,reason:'load'});
assert.equal(out.ok,true);assert.equal(mem.objects.length,1);assert.equal(a.loadLatest('room-a').session.legacy.worldSession.position,1);
const two=JSON.parse(JSON.stringify(one));two.worldSession.position=2;two.canonSession.ledger=[{id:'e1'}];
out=a.sync({roomId:'room-a',worldId:'valen',legacy:two,reason:'turn'});
assert.equal(out.ok,true);assert.equal(mem.objects.length,1);assert.equal(a.load('room-a','valen').session.legacy.worldSession.position,2);
const before=a.load('room-a','valen').session.legacy.worldSession.position,memBefore=mem.objects[0].content;
failIndex=true;
const three=JSON.parse(JSON.stringify(two));three.worldSession.position=3;
out=a.sync({roomId:'room-a',worldId:'valen',legacy:three,reason:'failed-index'});
assert.equal(out.ok,false);assert.equal(out.reason,'active-index-write-failed');assert.equal(a.load('room-a','valen').session.legacy.worldSession.position,before);assert.equal(mem.objects[0].content,memBefore);
failIndex=false;failMemory=true;
const four=JSON.parse(JSON.stringify(two));four.worldSession.position=4;
out=a.sync({roomId:'room-a',worldId:'valen',legacy:four,reason:'failed-memory'});
assert.equal(out.ok,false);assert.equal(out.reason,'memory-projection-failed');assert.equal(a.load('room-a','valen').session.legacy.worldSession.position,before);
const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});
assert.equal(b.loadLatest('room-a').session.legacy.worldSession.position,2);
assert.ok(b.context('room-a','valen',{maxChars:4000})._diagnostics.bounded);
failMemory=false;failIndex=true;quotaAfterIndex=true;
out=a.sync({roomId:'room-a',worldId:'valen',legacy:four,reason:'compound-storage-failure'});
assert.equal(out.reason,'recovery-required');
assert.equal(a.load('room-a','valen').ok,false);
assert.equal(a.loadLatest('room-a').reason,'recovery-required');
assert.equal(a.context('room-a','valen'),null);
const restarted=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});
assert.equal(restarted.loadLatest('room-a').reason,'recovery-required');
assert.equal(JSON.parse(backingStorage.getItem('seven_rpg_session_v3:pending:room-a')).previous.legacy.worldSession.position,2);
failAll=false;failIndex=false;
assert.equal(restarted.sync({roomId:'room-a',worldId:'valen',legacy:four}).reason,'recovery-required');
assert.equal(restarted.inspectRecovery('room-a').journalStatus,'pending');
const recovered=restarted.recover('room-a');
assert.equal(recovered.ok,true);assert.equal(recovered.status,'RECOVERED');assert.equal(recovered.journalStatus,'rolled_back');
assert.equal(restarted.loadLatest('room-a').session.legacy.worldSession.position,2);
assert.equal(restarted.inspectRecovery('room-a').status,'CLEAN');
out=restarted.sync({roomId:'room-a',worldId:'valen',legacy:four,reason:'post-recovery'});
assert.equal(out.ok,true);assert.equal(restarted.loadLatest('room-a').session.legacy.worldSession.position,4);

// If durable session/index/memory commit succeeds but journal cleanup fails, restart must finalize commit, not roll it back.
const five=JSON.parse(JSON.stringify(four));five.worldSession.position=5;
failJournalRemove=true;
out=restarted.sync({roomId:'room-a',worldId:'valen',legacy:five,reason:'cleanup-failure'});
assert.equal(out.ok,false);assert.equal(out.reason,'recovery-required');assert.equal(out.journalStatus,'committed');
failJournalRemove=false;
const afterCommitRestart=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});
const committedRecovery=afterCommitRestart.recover('room-a');
assert.equal(committedRecovery.ok,true);assert.equal(committedRecovery.journalStatus,'committed');assert.equal(committedRecovery.action,'finalized-journal-cleared');
assert.equal(afterCommitRestart.loadLatest('room-a').session.legacy.worldSession.position,5);

// A recovery journal must never overwrite a newer valid revision.
const latest=restarted.loadLatest('room-a').session;
const previous=JSON.parse(JSON.stringify(latest));previous.state.revision=Math.max(0,latest.state.revision-2);previous.persistedRevision=previous.state.revision;
backingStorage.setItem('seven_rpg_session_v3:pending:room-a',JSON.stringify({version:1,status:'pending',roomId:'room-a',worldId:'valen',previous,previousIndex:'valen',baseRevision:previous.state.revision,candidateRevision:previous.state.revision+1}));
const refused=restarted.recover('room-a');
assert.equal(refused.ok,false);assert.equal(refused.reason,'recovery-required');assert.equal(refused.journalStatus,'abandoned');assert.equal(refused.recoveryDetail,'newer-valid-state');
assert.equal(restarted.loadLatest('room-a').reason,'recovery-required');
backingStorage.removeItem('seven_rpg_session_v3:pending:room-a');

const count=backingStorage.keys().length;failAll=true;
assert.equal(restarted.sync({roomId:'new-room',worldId:'valen',legacy:one}).reason,'journal-write-failed');
assert.equal(backingStorage.keys().length,count);
console.log('rpg live integration: PASS');
