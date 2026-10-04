(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SevenRpgOrchestrator=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
function arr(v){return Array.isArray(v)?v:[];}
function text(v){return typeof v==='string'?v.trim():'';}
function short(v,n){const s=String(v==null?'':v).replace(/\s+/g,' ').trim();return s.length>(n||300)?s.slice(0,(n||300)-1)+'…':s;}
const ALLOWED=new Set(['time.advance','scene.start','scene.end','character.move','character.set','knowledge.learn','belief.set','relationship.change','emotion.change','item.transfer','quest.update','faction.update','ability.use','canon.set','world.set','thread.update','travel.start','travel.arrive']);
function parseJson(raw){
 if(raw&&typeof raw==='object'&&!Array.isArray(raw))return raw;
 const s=String(raw||'').trim().replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/,'');
 const a=s.indexOf('{'),b=s.lastIndexOf('}');if(a<0||b<a)return null;try{return JSON.parse(s.slice(a,b+1));}catch(_){return null;}
}
function evidenceGrounded(evidence,userText,reply){
 const e=obj(evidence),source=e.source==='user'?'user':(e.source==='assistant'?'assistant':null),quote=text(e.quote);
 if(!source||!quote||quote.length>320)return false;const hay=source==='user'?String(userText||''):String(reply||'');return hay.includes(quote);
}
function sanitizeProposedEvents(input,userText,reply,state){
 const out=[];for(const [i,item] of arr(input&&input.events).entries()){
   if(!item||!ALLOWED.has(item.type)||!item.payload||typeof item.payload!=='object')continue;
   const grounded=evidenceGrounded(item.evidence,userText,reply);if(!grounded)continue;
   const evidenceSource=obj(item.evidence).source;if(item.type==='canon.set'&&evidenceSource!=='user')continue;
   const source=evidenceSource==='user'?'user':'runtime';
   const ev={id:'turn-'+String(state.revision+1)+'-'+String(i+1),type:item.type,source,countsAsTurn:false,payload:clone(item.payload),summary:short(item.summary||obj(item.evidence).quote,220)};
   if(text(item.actorId))ev.actorId=text(item.actorId);
   if(source==='user'&&item.authority==='user-override'&&item.type==='canon.set'&&obj(item.evidence).explicitOverride===true&&/(override|retcon|change canon|make (?:this|it) canon|غيّر.*كانون|غير.*كانون|ريتكون|اعتبر.*كانون)/i.test(String(obj(item.evidence).quote||'')))ev.authority='user-override';
   out.push(ev);
 }
 return out.slice(0,24);
}
function memoryEntries(records,session){
 const scopeRef='rpg:'+session.worldId,out=[];
 for(const rec of arr(records)){
   if(!rec||rec.type==='narrative.record')continue;
   const content='RPG '+rec.type+(rec.summary?': '+short(rec.summary,260):'')+' [turn '+rec.turn+', tick '+rec.tick+']';
   out.push({content,scopeRef,eventId:rec.id,epistemicStatus:['belief.set'].includes(rec.type)?'BELIEF':(['character.move','relationship.change','emotion.change','item.transfer','quest.update','faction.update','ability.use','world.set','canon.set','knowledge.learn','travel.start','travel.arrive'].includes(rec.type)?'EPISODE':'OBSERVATION'),provenanceSource:rec.source==='user'?'USER':'SYSTEM'});
 }
 return out;
}
function createRuntime(options){
 const o=obj(options),stateApi=o.stateApi,sessionApi=o.sessionApi,contextApi=o.contextApi,plannerApi=o.plannerApi||null,storage=o.storage;
 if(!stateApi||!sessionApi||!contextApi)throw Error('RPG state/session/context APIs required');
 const manager=sessionApi.createManager({stateApi,storage,prefix:text(o.prefix)||'seven_rpg_session_v4',clock:o.clock});
 const sessions=new Map(),pointerPrefix=text(o.pointerPrefix)||'seven_rpg_world_v2';
 const memoryWriter=typeof o.memoryWriter==='function'?o.memoryWriter:null;
 function pointerKey(roomId){return pointerPrefix+':'+encodeURIComponent(roomId);}
 function worldFor(roomId,explicit){
   if(text(explicit))return text(explicit);try{const s=storage.getItem(pointerKey(roomId));if(text(s))return text(s);}catch(_){}
   return 'room:'+roomId;
 }
 function rememberWorld(roomId,worldId){try{storage.setItem(pointerKey(roomId),worldId);}catch(_){}}
 function ensure(roomIdInput,worldIdInput,seed){
   const roomId=text(roomIdInput);if(!roomId)return {ok:false,status:'BLOCKED',reason:'invalid-room'};
   const worldId=worldFor(roomId,worldIdInput),key=roomId+'::'+worldId;if(sessions.has(key))return {ok:true,status:'READY',session:sessions.get(key)};
   let loaded=manager.load(roomId,worldId);
   if(!loaded.ok&&loaded.status==='MISSING')loaded=manager.start({roomId,worldId,state:Object.assign({sessionId:'rpg:'+roomId+':'+worldId,worldId},clone(seed||{}))});
   if(!loaded.ok)return loaded;sessions.set(key,loaded.session);rememberWorld(roomId,worldId);return {ok:true,status:'READY',session:loaded.session};
 }
 function activeSession(roomId){const worldId=worldFor(roomId),key=roomId+'::'+worldId;return sessions.get(key)||null;}
 function setSession(session){sessions.set(session.roomId+'::'+session.worldId,session);rememberWorld(session.roomId,session.worldId);return session;}
 function snapshot(roomId){const s=activeSession(roomId);return s?clone(s):null;}
 function selectWorld(roomId,worldId,seed){const found=ensure(roomId,worldId,seed);if(found.ok)rememberWorld(roomId,worldId);return found;}
 function commitEvents(roomId,events){
   const ready=ensure(roomId);if(!ready.ok)return ready;const out=manager.commitEvents(ready.session,events);
   if(out.ok){setSession(out.session);if(memoryWriter){for(const m of memoryEntries(out.records,out.session)){try{memoryWriter(m);}catch(_){}}}}
   return out;
 }
 function generationContext(roomId,options){const ready=ensure(roomId);if(!ready.ok)return ready;return contextApi.buildSceneGenerationView(ready.session.state,stateApi,options||{});}
 function narratorContext(roomId,options){const ready=ensure(roomId);if(!ready.ok)return ready;return contextApi.buildNarratorView(ready.session.state,stateApi,options||{});}
 function plan(roomId,options){const ready=ensure(roomId);if(!ready.ok)return ready;return plannerApi?{ok:true,status:'READY',plan:plannerApi.buildPlan(ready.session.state,stateApi,options||{})}:{ok:false,status:'BLOCKED',reason:'planner-unavailable'};}
 async function processTurn(input){
   const x=obj(input),roomId=text(x.roomId),ready=ensure(roomId);if(!ready.ok)return ready;
   const extractor=typeof x.extractor==='function'?x.extractor:null;let proposals={events:[]},extractionStatus='skipped';
   if(extractor){
     const narrator=contextApi.buildNarratorView(ready.session.state,stateApi,{maxChars:16000,canonLimit:24});
     try{const raw=await extractor({userText:String(x.userText||''),reply:String(x.reply||''),state:narrator.view,allowedEventTypes:Array.from(ALLOWED)});const parsed=parseJson(raw);if(parsed){proposals=parsed;extractionStatus='parsed';if(Array.isArray(parsed.violations)&&parsed.violations.length)return{ok:false,status:'REPAIR_REQUIRED',reason:'narrative-violation',violations:parsed.violations.slice(0,8),session:ready.session};}else extractionStatus='invalid-json';}catch(e){extractionStatus='error';}
   }
   const events=sanitizeProposedEvents(proposals,String(x.userText||''),String(x.reply||''),ready.session.state);
   if(plannerApi&&x.applyWorldTick===true)events.push(...plannerApi.worldTickProposals(ready.session.state,stateApi,{emotionDecay:.02,maxEvents:12}));
   events.push({id:'turn-'+String(ready.session.state.revision+1)+'-record',type:'narrative.record',source:'runtime',countsAsTurn:true,payload:{user:short(x.userText,280),assistant:short(x.reply,420),extractionStatus},summary:'Narrative turn committed.'});
   const committed=manager.commitEvents(ready.session,events);
   if(!committed.ok)return Object.assign({extractionStatus,proposedEventCount:events.length-1},committed);
   setSession(committed.session);if(memoryWriter){for(const m of memoryEntries(committed.records,committed.session)){try{memoryWriter(m);}catch(_){}}}
   return {ok:true,status:'COMMITTED',session:committed.session,records:committed.records,extractionStatus,appliedEventCount:events.length-1};
 }
 return {manager,ensure,activeSession,snapshot,selectWorld,commitEvents,generationContext,narratorContext,plan,processTurn,parseJson,sanitizeProposedEvents};
}
return {createRuntime,parseJson,evidenceGrounded,sanitizeProposedEvents,memoryEntries};
});