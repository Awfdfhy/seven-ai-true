const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Live=require('./workspaces/rpg-live-integration.js');
const storage=Session.memoryStorage(),mem={objects:[]};
let seq=0,failMemory=false;
const runtime={
  hash:s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16)},
  lineage:(source,transformation,parentRefs=[])=>({source,transformation,parentRefs}),
  readMemory:()=>({version:1,objects:mem.objects.map(x=>JSON.parse(JSON.stringify(x))),events:[]}),
  createMemory:(content,type,opts)=>({id:opts.id,content,type,version:1,createdAt:++seq,scope:opts.scope,source:opts.source,provenance:{source:'rpg'},authority:{originAuthority:'rpg',authorityClass:'derived'},evidenceRefs:[],relationRefs:[],policy:{}}),
  commitMemory:(obj,op)=>{if(failMemory)return false;const i=mem.objects.findIndex(x=>x.id===obj.id);if(op==='CREATE'){if(i>=0)return false;mem.objects.push(JSON.parse(JSON.stringify(obj)));return true}if(op==='UPDATE'){if(i<0)return false;mem.objects[i]=JSON.parse(JSON.stringify(obj));return true}return false}
};
const a=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});
const one={work:{id:'valen',title:'Valen'},worldSession:{position:1,titles:[]},canonPack:{id:'canon'},canonSession:{position:1,ledger:[]}};
let out=a.sync({roomId:'room-a',worldId:'valen',legacy:one,reason:'load'});
assert.equal(out.ok,true);assert.equal(mem.objects.length,1);assert.equal(a.loadLatest('room-a').session.legacy.worldSession.position,1);
const two=JSON.parse(JSON.stringify(one));two.worldSession.position=2;two.canonSession.ledger=[{id:'e1'}];
out=a.sync({roomId:'room-a',worldId:'valen',legacy:two,reason:'turn'});
assert.equal(out.ok,true);assert.equal(mem.objects.length,1);assert.equal(a.load('room-a','valen').session.legacy.worldSession.position,2);
const before=a.load('room-a','valen').session.legacy.worldSession.position;failMemory=true;
const three=JSON.parse(JSON.stringify(two));three.worldSession.position=3;
out=a.sync({roomId:'room-a',worldId:'valen',legacy:three,reason:'failed-memory'});
assert.equal(out.ok,false);assert.equal(out.reason,'memory-projection-failed');assert.equal(a.load('room-a','valen').session.legacy.worldSession.position,before);
const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});
assert.equal(b.loadLatest('room-a').session.legacy.worldSession.position,2);
assert.ok(b.context('room-a','valen',{maxChars:4000})._diagnostics.bounded);
console.log('rpg live integration: PASS');