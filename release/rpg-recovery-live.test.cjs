const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Context=require('./workspaces/rpg-context.js');
const Planner=require('./workspaces/rpg-planner.js');
const Orchestrator=require('./workspaces/rpg-orchestrator.js');
const LiveIntegration=require('./workspaces/rpg-live-integration.js');

const storage=Session.memoryStorage(),prefix='seven_rpg_session_v3',roomId='live-room',worldId='live-world';
const manager=Session.createManager({stateApi:State,storage,prefix,clock:(()=>{let n=0;return()=>String(++n)})()});
let seeded=manager.start({roomId,worldId,state:{worldId,world:{locations:{home:{},road:{}}},characters:{hero:{control:'player',locationId:'home'},npc:{control:'ai',locationId:'home',intent:'watch'}}}});
assert.equal(seeded.ok,true);
storage.setItem(prefix+':active:'+encodeURIComponent(roomId),worldId);

const mem={objects:[]};let seq=0;
const runtime={
  hash:s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16)},
  lineage:(source,transformation,parentRefs=[])=>({source,transformation,parentRefs}),
  readMemory:()=>({version:1,objects:mem.objects.map(x=>JSON.parse(JSON.stringify(x))),events:[]}),
  createMemory:(content,type,opts)=>({id:opts.id,content,type,version:1,createdAt:++seq,scope:opts.scope,source:opts.source,provenance:{source:'rpg'},authority:{originAuthority:'rpg',authorityClass:'derived'},evidenceRefs:[],relationRefs:[],policy:{}}),
  commitMemory:(obj,op)=>{const i=mem.objects.findIndex(x=>x.id===obj.id);if(op==='CREATE'){if(i>=0)return false;mem.objects.push(JSON.parse(JSON.stringify(obj)));return true}if(op==='UPDATE'){if(i<0)return false;mem.objects[i]=JSON.parse(JSON.stringify(obj));return true}return false}
};
let memorySeq=0;
const sandbox={console,globalThis:null,currentRoom:roomId,localStorage:storage,SevenRpgState:State,SevenRpgSession:Session,SevenRpgContext:Context,SevenRpgPlanner:Planner,SevenRpgOrchestrator:Orchestrator,SevenRpgLiveIntegration:LiveIntegration,SevenRuntime:runtime,
  addScopedMemory:(content,scope,scopeRef)=>({id:'m'+(++memorySeq),content,scope,scopeRef}),
  setMemoryEpistemicStatus:()=>true,setMemoryProvenance:()=>true,setMemoryTemporal:()=>true};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'workspaces','rpg-live.js'),'utf8'),sandbox,{filename:'rpg-live.js'});
assert.ok(sandbox.SevenRpgLive);
let source=sandbox.SevenRpgLive.contextSource({roomId,maxChars:9000});
assert.ok(source&&source.content.includes('"hero"'));
assert.equal(JSON.parse(source.content).scene.controlRules.hero,'player');

const pendingKey=prefix+':pending:'+encodeURIComponent(roomId);
storage.setItem(pendingKey,JSON.stringify({version:1,roomId,worldId}));
assert.equal(sandbox.SevenRpgLive.contextSource({roomId,maxChars:9000}),null);
(async()=>{
  let blocked=await sandbox.SevenRpgLive.processGeneratedTurn({roomId,userText:'I move to the road.',reply:'The hero moves.',extractor:async()=>({events:[{type:'character.move',actorId:'hero',payload:{characterId:'hero',toLocationId:'road'},evidence:{source:'user',quote:'I move to the road.'}}]})});
  assert.equal(blocked.ok,false);assert.equal(blocked.reason,'recovery-required');
  assert.equal(manager.load(roomId,worldId).session.state.characters.hero.locationId,'home');

  storage.removeItem(pendingKey);
  const committed=await sandbox.SevenRpgLive.processGeneratedTurn({roomId,userText:'I move to the road.',reply:'The hero moves.',applyWorldTick:false,extractor:async()=>({events:[{type:'character.move',actorId:'hero',payload:{characterId:'hero',toLocationId:'road'},evidence:{source:'user',quote:'I move to the road.'}}]})});
  assert.equal(committed.ok,true);
  assert.equal(manager.load(roomId,worldId).session.state.characters.hero.locationId,'road');
  assert.ok(['published','unavailable','memory-projection-failed'].includes(committed.projectionStatus));
  console.log('rpg recovery-safe live bridge: PASS');
})().catch(e=>{console.error(e);process.exit(1)});