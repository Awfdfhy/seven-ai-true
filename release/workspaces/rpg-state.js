(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenRpgState=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const SCHEMA='seven-rpg-state';
const VERSION=1;
const CANON_LEVEL=Object.freeze({RUMOR:0,SOFT:1,ACTIVE:2,HARD:3});
const CONTROL_MODE=Object.freeze({PLAYER:'player',AI:'ai',SHARED:'shared',NARRATOR:'narrator'});
const RELATIONSHIP_DIMENSIONS=Object.freeze(['trust','affection','respect','fear','loyalty','attraction','suspicion','rivalry','resentment','dependency','familiarity']);
const EMOTION_DIMENSIONS=Object.freeze(['happiness','anger','fear','embarrassment','jealousy','grief','excitement','anxiety','affection']);
const FACT_STATES=Object.freeze(['existing_fact','new_narrative_event','narrator_inference','unconfirmed']);

function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
function arr(v){return Array.isArray(v)?v:[];}
function text(v){return typeof v==='string'?v.trim():'';}
function clamp(v,min,max){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;}
function uniq(xs){return Array.from(new Set(arr(xs).filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim())));}
function stableId(prefix,n){return prefix+'-'+String(n).padStart(6,'0');}
function pairKey(a,b){return [String(a),String(b)].sort().join('::');}
function hasOwn(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function canonRank(level){return hasOwn(CANON_LEVEL,String(level||'').toUpperCase())?CANON_LEVEL[String(level).toUpperCase()]:-1;}
function normalizeControl(v){return Object.values(CONTROL_MODE).includes(v)?v:CONTROL_MODE.AI;}
function normalizeFactState(v){return FACT_STATES.includes(v)?v:'existing_fact';}

function normalizeRelationship(input){
  const src=obj(input),out={};
  for(const k of RELATIONSHIP_DIMENSIONS)out[k]=clamp(src[k]??0,-1,1);
  out.events=arr(src.events).slice(-128).map(clone);
  return out;
}
function normalizeEmotions(input){
  const src=obj(input),out={};
  for(const k of EMOTION_DIMENSIONS)out[k]=clamp(src[k]??0,0,1);
  return out;
}
function normalizeVoice(input){
  const v=obj(input);
  return {vocabulary:text(v.vocabulary),sentenceLength:text(v.sentenceLength),humor:text(v.humor),formality:text(v.formality),recurringExpressions:uniq(v.recurringExpressions),culturalBackground:text(v.culturalBackground),emotionalExpressionStyle:text(v.emotionalExpressionStyle)};
}
function normalizeCharacter(id,input){
  const c=obj(input);
  return {
    id:String(id),control:normalizeControl(c.control),identity:clone(obj(c.identity)),age:c.age??null,appearance:clone(obj(c.appearance)),
    personality:clone(obj(c.personality)),motivations:uniq(c.motivations),goals:arr(c.goals).map(clone),fears:uniq(c.fears),preferences:clone(obj(c.preferences)),
    abilities:uniq(c.abilities),inventory:uniq(c.inventory),locationId:text(c.locationId)||null,emotions:normalizeEmotions(c.emotions),secrets:uniq(c.secrets),
    beliefs:clone(obj(c.beliefs)),knowledge:clone(obj(c.knowledge)),history:arr(c.history).slice(-256).map(clone),promises:arr(c.promises).slice(-128).map(clone),
    injuries:arr(c.injuries).map(clone),status:text(c.status)||'active',loyalties:clone(obj(c.loyalties)),opinions:clone(obj(c.opinions)),voice:normalizeVoice(c.voice),
    intent:text(c.intent)||'',updatedTurn:Number.isInteger(c.updatedTurn)?c.updatedTurn:0
  };
}
function normalizeQuest(id,input){const q=obj(input);return {id:String(id),title:text(q.title)||String(id),status:['active','completed','failed','hidden','paused'].includes(q.status)?q.status:'active',objectives:arr(q.objectives).map(clone),dependencies:uniq(q.dependencies),rewards:arr(q.rewards).map(clone),consequences:arr(q.consequences).map(clone),ownerIds:uniq(q.ownerIds),hidden:q.hidden===true,updatedTurn:Number.isInteger(q.updatedTurn)?q.updatedTurn:0};}
function normalizeFaction(id,input){const f=obj(input);return {id:String(id),name:text(f.name)||String(id),goals:uniq(f.goals),leaderIds:uniq(f.leaderIds),memberIds:uniq(f.memberIds),resources:clone(obj(f.resources)),alliances:uniq(f.alliances),enemies:uniq(f.enemies),territory:uniq(f.territory),reputation:clone(obj(f.reputation)),updatedTurn:Number.isInteger(f.updatedTurn)?f.updatedTurn:0};}
function normalizeItem(id,input){const x=obj(input);return {id:String(id),name:text(x.name)||String(id),ownerId:text(x.ownerId)||null,locationId:text(x.locationId)||null,equippedBy:text(x.equippedBy)||null,quantity:Math.max(0,Number.isFinite(Number(x.quantity))?Number(x.quantity):1),consumable:x.consumable===true,state:clone(obj(x.state)),tags:uniq(x.tags)};}
function normalizeAbility(id,input){const a=obj(input);return {id:String(id),name:text(a.name)||String(id),ownerIds:uniq(a.ownerIds),limitations:uniq(a.limitations),costs:clone(obj(a.costs)),weaknesses:uniq(a.weaknesses),cooldownTurns:Math.max(0,Number(a.cooldownTurns)||0),lastUsedTurn:Number.isInteger(a.lastUsedTurn)?a.lastUsedTurn:null,powerScale:Number.isFinite(Number(a.powerScale))?Number(a.powerScale):1,forbidden:a.forbidden===true,tags:uniq(a.tags)};}
function normalizeCanonEntry(id,input){const e=obj(input);return {id:String(id),level:String(e.level||'SOFT').toUpperCase(),factState:normalizeFactState(e.factState),value:clone(e.value),entityIds:uniq(e.entityIds),tags:uniq(e.tags),availableAtTick:Number.isFinite(Number(e.availableAtTick))?Number(e.availableAtTick):0,public:e.public===true,sourceEventId:text(e.sourceEventId)||null,confidence:clamp(e.confidence??1,0,1),status:['active','superseded','retracted'].includes(e.status)?e.status:'active',supersedes:uniq(e.supersedes)};}

function createState(seed){
  const s=obj(seed),characters={},quests={},factions={},items={},abilities={},canon={};
  for(const [id,v] of Object.entries(obj(s.characters)))characters[id]=normalizeCharacter(id,v);
  for(const [id,v] of Object.entries(obj(s.quests)))quests[id]=normalizeQuest(id,v);
  for(const [id,v] of Object.entries(obj(s.factions)))factions[id]=normalizeFaction(id,v);
  for(const [id,v] of Object.entries(obj(s.items)))items[id]=normalizeItem(id,v);
  for(const [id,v] of Object.entries(obj(s.abilities)))abilities[id]=normalizeAbility(id,v);
  const canonSrc=obj(obj(s.canon).entries||s.canonEntries);for(const [id,v] of Object.entries(canonSrc))canon[id]=normalizeCanonEntry(id,v);
  const relationships={};for(const [k,v] of Object.entries(obj(s.relationships)))relationships[k]=normalizeRelationship(v);
  return {
    schema:SCHEMA,version:VERSION,sessionId:text(s.sessionId)||'rpg-session',worldId:text(s.worldId)||'world',continuity:text(s.continuity)||'default',
    turn:Number.isInteger(s.turn)&&s.turn>=0?s.turn:0,revision:Number.isInteger(s.revision)&&s.revision>=0?s.revision:0,
    timeline:{tick:Number.isFinite(Number(obj(s.timeline).tick))?Number(obj(s.timeline).tick):0,dateLabel:text(obj(s.timeline).dateLabel),events:arr(obj(s.timeline).events).map(clone)},
    world:{locations:clone(obj(obj(s.world).locations)),kingdoms:clone(obj(obj(s.world).kingdoms)),factions:clone(obj(obj(s.world).factions)),organizations:clone(obj(obj(s.world).organizations)),politics:clone(obj(obj(s.world).politics)),economy:clone(obj(obj(s.world).economy)),wars:clone(obj(obj(s.world).wars)),laws:clone(obj(obj(s.world).laws)),weather:clone(obj(obj(s.world).weather)),activeEvents:clone(obj(obj(s.world).activeEvents)),resources:clone(obj(obj(s.world).resources)),rules:clone(obj(obj(s.world).rules)),flags:clone(obj(obj(s.world).flags))},
    characters,relationships,quests,factions,items,abilities,canon:{entries:canon},openThreads:clone(obj(s.openThreads)),scene:s.scene?clone(s.scene):null,
    ledger:arr(s.ledger).map(clone),memoryRefs:arr(s.memoryRefs).map(clone),counters:Object.assign({event:0,scene:0},clone(obj(s.counters))),diagnostics:{lastValidation:null,lastContextPacket:null}
  };
}

function relationshipFor(state,a,b){return clone(state.relationships[pairKey(a,b)]||normalizeRelationship({}));}
function character(state,id){return state&&state.characters?state.characters[id]||null:null;}
function canonEntry(state,id){return state&&state.canon&&state.canon.entries?state.canon.entries[id]||null:null;}
function canCharacterKnow(state,characterId,factId,atTick){
  const c=character(state,characterId),f=canonEntry(state,factId),tick=atTick==null?state.timeline.tick:Number(atTick);
  if(!c)return {allowed:false,reason:'unknown-character'};
  if(!f||f.status!=='active')return {allowed:false,reason:'unknown-fact'};
  if(Number.isFinite(f.availableAtTick)&&tick<f.availableAtTick)return {allowed:false,reason:'future-knowledge'};
  if(f.public===true)return {allowed:true,reason:'public',confidence:f.confidence};
  const k=obj(c.knowledge)[factId];
  if(!k)return {allowed:false,reason:'not-established'};
  if(k.revoked===true)return {allowed:false,reason:'revoked'};
  if(Number.isFinite(Number(k.learnedAtTick))&&tick<Number(k.learnedAtTick))return {allowed:false,reason:'future-knowledge'};
  return {allowed:true,reason:'known',confidence:clamp(k.confidence??1,0,1),sourceEventId:k.sourceEventId||null};
}
function beliefOf(state,characterId,factId){const c=character(state,characterId);return c&&hasOwn(c.beliefs,factId)?clone(c.beliefs[factId]):null;}

function block(state,event,reason,details){return {ok:false,status:'BLOCKED',reason,details:details||null,state};}
function recordEvent(next,event,status,extra){
  next.revision+=1;next.turn+=event.countsAsTurn===false?0:1;
  const rec={id:event.id,type:event.type,turn:next.turn,tick:next.timeline.tick,source:event.source||'runtime',actorId:event.actorId||null,status,summary:text(event.summary),payload:clone(event.payload||{}),provenance:{source:event.source||'runtime',authority:event.authority||'runtime',transformation:event.transformation||event.type},...clone(extra||{})};
  next.ledger.push(rec);if(next.ledger.length>4096)next.ledger=next.ledger.slice(-4096);return rec;
}
function ensureEventId(state,event){const e=clone(event||{});if(!text(e.id)){state.counters.event=(Number(state.counters.event)||0)+1;e.id=stableId('evt',state.counters.event);}return e;}
function ensureCharacterMutable(state,event,targetId){
  const c=character(state,targetId);if(!c)return {ok:false,reason:'unknown-character'};
  if(c.control===CONTROL_MODE.PLAYER&&event.source!=='user')return {ok:false,reason:'player-control'};
  if(c.control===CONTROL_MODE.SHARED&&event.source!=='user'&&event.requiresPlayerConsent===true)return {ok:false,reason:'shared-control-consent'};
  return {ok:true,c};
}
function setNestedWorld(world,path,value){const parts=arr(path).length?path:String(path||'').split('.').filter(Boolean);if(!parts.length)return false;let cur=world;for(let i=0;i<parts.length-1;i++){const k=parts[i];if(!cur[k]||typeof cur[k]!=='object'||Array.isArray(cur[k]))cur[k]={};cur=cur[k];}cur[parts[parts.length-1]]=clone(value);return true;}
function applyEvent(state,eventInput){
  const base=createState(state),event=ensureEventId(base,eventInput||{}),p=obj(event.payload),type=text(event.type);
  if(!type)return block(state,event,'missing-event-type');
  const next=createState(base);
  if(Number.isFinite(Number(event.atTick))&&Number(event.atTick)<next.timeline.tick)return block(state,event,'timeline-backwards',{current:next.timeline.tick,candidate:Number(event.atTick)});
  if(Number.isFinite(Number(event.atTick)))next.timeline.tick=Number(event.atTick);

  if(type==='time.advance'){
    const by=Number(p.by);if(!Number.isFinite(by)||by<0)return block(state,event,'invalid-time-advance');next.timeline.tick+=by;if(text(p.dateLabel))next.timeline.dateLabel=text(p.dateLabel);
  } else if(type==='scene.start'){
    const ids=uniq(p.participantIds),locationId=text(p.locationId)||null,remoteAllowed=p.remoteAllowed===true;
    for(const id of ids){const c=character(next,id);if(!c)return block(state,event,'unknown-character',{characterId:id});if(locationId&&!remoteAllowed&&c.locationId&&c.locationId!==locationId)return block(state,event,'spatial-conflict',{characterId:id,characterLocation:c.locationId,sceneLocation:locationId});}
    next.counters.scene=(Number(next.counters.scene)||0)+1;next.scene={id:text(p.id)||stableId('scene',next.counters.scene),locationId,timeTick:next.timeline.tick,participantIds:ids,purpose:text(p.purpose),activeConflicts:uniq(p.activeConflicts),environment:clone(obj(p.environment)),remoteAllowed,startedTurn:next.turn+1};
  } else if(type==='scene.end'){
    if(!next.scene)return block(state,event,'no-active-scene');next.scene=null;
  } else if(type==='character.move'){
    const id=text(p.characterId),guard=ensureCharacterMutable(next,event,id);if(!guard.ok)return block(state,event,guard.reason,{characterId:id});const to=text(p.toLocationId);if(!to)return block(state,event,'missing-location');guard.c.locationId=to;guard.c.updatedTurn=next.turn+1;
  } else if(type==='character.set'){
    const id=text(p.characterId),guard=ensureCharacterMutable(next,event,id);if(!guard.ok)return block(state,event,guard.reason,{characterId:id});const allowed=['status','intent','age','appearance','personality','motivations','goals','fears','preferences','injuries','loyalties','opinions','voice'];for(const k of allowed)if(hasOwn(p.patch||{},k))guard.c[k]=k==='voice'?normalizeVoice(p.patch[k]):clone(p.patch[k]);guard.c.updatedTurn=next.turn+1;
  } else if(type==='knowledge.learn'){
    const id=text(p.characterId),factId=text(p.factId),c=character(next,id),f=canonEntry(next,factId);if(!c)return block(state,event,'unknown-character');if(!f)return block(state,event,'unknown-fact');if(next.timeline.tick<f.availableAtTick&&!p.allowEarlyReveal)return block(state,event,'future-knowledge');c.knowledge[factId]={learnedAtTick:next.timeline.tick,sourceEventId:event.id,confidence:clamp(p.confidence??1,0,1),method:text(p.method)||'told'};c.updatedTurn=next.turn+1;
  } else if(type==='belief.set'){
    const id=text(p.characterId),c=character(next,id);if(!c)return block(state,event,'unknown-character');c.beliefs[text(p.factId)||text(p.key)]={value:clone(p.value),confidence:clamp(p.confidence??.5,0,1),sourceEventId:event.id,updatedAtTick:next.timeline.tick};c.updatedTurn=next.turn+1;
  } else if(type==='relationship.change'){
    const a=text(p.a),b=text(p.b);if(!character(next,a)||!character(next,b))return block(state,event,'unknown-character');const key=pairKey(a,b),rel=normalizeRelationship(next.relationships[key]||{});for(const [k,v] of Object.entries(obj(p.delta)))if(RELATIONSHIP_DIMENSIONS.includes(k))rel[k]=clamp(rel[k]+Number(v||0),-1,1);rel.events.push({eventId:event.id,turn:next.turn+1,tick:next.timeline.tick,reason:text(p.reason),delta:clone(obj(p.delta))});rel.events=rel.events.slice(-128);next.relationships[key]=rel;
  } else if(type==='emotion.change'){
    const id=text(p.characterId),c=character(next,id);if(!c)return block(state,event,'unknown-character');for(const [k,v] of Object.entries(obj(p.delta)))if(EMOTION_DIMENSIONS.includes(k))c.emotions[k]=clamp(c.emotions[k]+Number(v||0),0,1);c.updatedTurn=next.turn+1;
  } else if(type==='item.transfer'){
    const id=text(p.itemId),it=next.items[id];if(!it)return block(state,event,'unknown-item');const from=text(p.fromOwnerId)||null,to=text(p.toOwnerId)||null;if(from&&it.ownerId!==from)return block(state,event,'item-owner-mismatch',{expected:it.ownerId,provided:from});if(to&&!character(next,to))return block(state,event,'unknown-character',{characterId:to});if(from&&character(next,from))next.characters[from].inventory=next.characters[from].inventory.filter(x=>x!==id);it.ownerId=to;it.locationId=to?null:(text(p.toLocationId)||it.locationId);it.equippedBy=null;if(to){next.characters[to].inventory=uniq(next.characters[to].inventory.concat(id));}
  } else if(type==='quest.update'){
    const id=text(p.questId);if(!id)return block(state,event,'missing-quest-id');next.quests[id]=normalizeQuest(id,Object.assign({},next.quests[id]||{},clone(p.patch||{}),{updatedTurn:next.turn+1}));
  } else if(type==='faction.update'){
    const id=text(p.factionId);if(!id)return block(state,event,'missing-faction-id');next.factions[id]=normalizeFaction(id,Object.assign({},next.factions[id]||{},clone(p.patch||{}),{updatedTurn:next.turn+1}));
  } else if(type==='ability.use'){
    const id=text(p.abilityId),a=next.abilities[id];if(!a)return block(state,event,'unknown-ability');if(a.forbidden&&!p.overrideForbidden)return block(state,event,'ability-forbidden');if(a.ownerIds.length&&text(p.characterId)&&!a.ownerIds.includes(text(p.characterId)))return block(state,event,'ability-owner-mismatch');if(a.lastUsedTurn!=null&&next.turn-a.lastUsedTurn<a.cooldownTurns)return block(state,event,'ability-cooldown',{readyAtTurn:a.lastUsedTurn+a.cooldownTurns});a.lastUsedTurn=next.turn;
  } else if(type==='canon.set'){
    const id=text(p.id);if(!id)return block(state,event,'missing-canon-id');const candidate=normalizeCanonEntry(id,Object.assign({},p.entry||{}, {sourceEventId:event.id})),existing=canonEntry(next,id);
    if(existing&&canonRank(candidate.level)<canonRank(existing.level)&&event.authority!=='user-override')return block(state,event,'canon-precedence',{existingLevel:existing.level,candidateLevel:candidate.level});
    if(existing&&JSON.stringify(existing.value)!==JSON.stringify(candidate.value)&&canonRank(candidate.level)===canonRank(existing.level)&&candidate.level==='HARD'&&event.authority!=='user-override')return block(state,event,'hard-canon-conflict');
    next.canon.entries[id]=candidate;
  } else if(type==='world.set'){
    if(!setNestedWorld(next.world,p.path,p.value))return block(state,event,'invalid-world-path');
  } else if(type==='thread.update'){
    const id=text(p.threadId);if(!id)return block(state,event,'missing-thread-id');next.openThreads[id]=Object.assign({},clone(next.openThreads[id]||{}),clone(p.patch||{}),{updatedTurn:next.turn+1});
  } else return block(state,event,'unsupported-event-type',{type});

  next.timeline.events.push({eventId:event.id,type,tick:next.timeline.tick});if(next.timeline.events.length>4096)next.timeline.events=next.timeline.events.slice(-4096);
  const rec=recordEvent(next,event,'COMMITTED');
  const validation=validateState(next);next.diagnostics.lastValidation=validation;
  if(!validation.valid)return block(state,event,'post-commit-validation-failed',{issues:validation.issues});
  return {ok:true,status:'COMMITTED',state:next,record:rec};
}

function relevantCanon(state,entityIds,tags,limit){
  const es=new Set(uniq(entityIds)),ts=new Set(uniq(tags));
  return Object.values(state.canon.entries).filter(e=>e.status==='active').map(e=>{let score=canonRank(e.level)*10+(e.public?1:0);for(const id of e.entityIds)if(es.has(id))score+=8;for(const t of e.tags)if(ts.has(t))score+=4;return {e,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.e.id.localeCompare(b.e.id)).slice(0,limit||32).map(x=>clone(x.e));
}
function buildContextPacket(stateInput,options){
  const state=createState(stateInput),opts=obj(options),scene=state.scene?clone(state.scene):null;
  const ids=uniq([...(scene?scene.participantIds:[]),...arr(opts.characterIds)]).slice(0,16);
  const tags=uniq(opts.tags);const chars={};
  for(const id of ids){const c=character(state,id);if(!c)continue;const knownFacts={};for(const factId of Object.keys(c.knowledge||{})){const k=canCharacterKnow(state,id,factId);if(k.allowed)knownFacts[factId]=clone(c.knowledge[factId]);}
    chars[id]={id:c.id,control:c.control,identity:clone(c.identity),age:c.age,appearance:clone(c.appearance),personality:clone(c.personality),motivations:clone(c.motivations),goals:clone(c.goals),fears:clone(c.fears),preferences:clone(c.preferences),locationId:c.locationId,emotions:clone(c.emotions),beliefs:clone(c.beliefs),knownFacts,injuries:clone(c.injuries),status:c.status,loyalties:clone(c.loyalties),opinions:clone(c.opinions),intent:c.intent,voice:clone(c.voice)};
  }
  const rel={};for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const k=pairKey(ids[i],ids[j]);if(state.relationships[k])rel[k]=clone(state.relationships[k]);}
  const activeQuests={};for(const [id,q] of Object.entries(state.quests))if(['active','hidden','paused'].includes(q.status)&&(q.ownerIds.length===0||q.ownerIds.some(x=>ids.includes(x))))activeQuests[id]=clone(q);
  const location=scene&&scene.locationId?clone(state.world.locations[scene.locationId]||null):null;
  const canon=relevantCanon(state,ids.concat(scene&&scene.locationId?[scene.locationId]:[]),tags,Number(opts.canonLimit)||32);
  const threadEntries=Object.entries(state.openThreads).sort((a,b)=>(b[1].updatedTurn||0)-(a[1].updatedTurn||0)).slice(0,Number(opts.threadLimit)||16);
  const ledger=state.ledger.slice(-(Number(opts.recentEventLimit)||12)).map(r=>({id:r.id,type:r.type,turn:r.turn,tick:r.tick,source:r.source,actorId:r.actorId,summary:r.summary,payload:clone(r.payload)}));
  const packet={schema:'seven-rpg-context',version:1,sessionId:state.sessionId,worldId:state.worldId,continuity:state.continuity,turn:state.turn,timeline:{tick:state.timeline.tick,dateLabel:state.timeline.dateLabel},scene,location,characters:chars,relationships:rel,activeQuests,canon,openThreads:Object.fromEntries(threadEntries.map(([k,v])=>[k,clone(v)])),recentEvents:ledger,controlRules:Object.fromEntries(ids.map(id=>[id,chars[id]?chars[id].control:null])),memoryRefs:state.memoryRefs.slice(-32).map(clone)};
  const maxChars=Math.max(1024,Number(opts.maxChars)||24000);let serialized=JSON.stringify(packet);if(serialized.length>maxChars){packet.recentEvents=packet.recentEvents.slice(-4);packet.openThreads=Object.fromEntries(Object.entries(packet.openThreads).slice(0,8));packet.canon=packet.canon.slice(0,12);serialized=JSON.stringify(packet);}packet._diagnostics={serializedChars:serialized.length,bounded:serialized.length<=maxChars,characterCount:Object.keys(chars).length,canonCount:packet.canon.length};return packet;
}

function toMemoryRecords(stateInput,options){
  const state=createState(stateInput),opts=obj(options),scopeRef=text(opts.scopeRef)||('rpg:'+state.worldId),out=[];
  for(const e of Object.values(state.canon.entries))if(e.status==='active')out.push({kind:'WorldFact',scope:'rpg',scopeRef,canonicalKey:'canon:'+e.id,content:JSON.stringify({id:e.id,level:e.level,value:e.value}),confidence:e.confidence,sourceEventId:e.sourceEventId,metadata:{entityIds:e.entityIds,tags:e.tags,factState:e.factState}});
  for(const [key,r] of Object.entries(state.relationships))out.push({kind:'RelationshipEvent',scope:'rpg',scopeRef,canonicalKey:'relationship:'+key,content:JSON.stringify(r),confidence:1,sourceEventId:r.events.length?r.events[r.events.length-1].eventId:null,metadata:{pair:key}});
  for(const [id,q] of Object.entries(state.quests))out.push({kind:'QuestState',scope:'rpg',scopeRef,canonicalKey:'quest:'+id,content:JSON.stringify(q),confidence:1,sourceEventId:null,metadata:{status:q.status}});
  if(state.scene)out.push({kind:'LocationState',scope:'rpg',scopeRef,canonicalKey:'scene:'+state.scene.id,content:JSON.stringify(state.scene),confidence:1,sourceEventId:null,metadata:{locationId:state.scene.locationId}});
  return out;
}

function validateState(stateInput){
  const state=createState(stateInput),issues=[];
  if(state.schema!==SCHEMA||state.version!==VERSION)issues.push({code:'schema',severity:'error'});
  let last=-Infinity;for(const e of state.timeline.events){if(Number(e.tick)<last)issues.push({code:'timeline-backwards',severity:'error',eventId:e.eventId});last=Number(e.tick);}
  if(state.scene&&!state.scene.remoteAllowed&&state.scene.locationId){for(const id of state.scene.participantIds){const c=character(state,id);if(!c)issues.push({code:'scene-unknown-character',severity:'error',characterId:id});else if(c.locationId&&c.locationId!==state.scene.locationId)issues.push({code:'scene-location-mismatch',severity:'error',characterId:id});}}
  for(const [id,c] of Object.entries(state.characters)){
    for(const factId of Object.keys(c.knowledge||{})){const k=canCharacterKnow(state,id,factId);if(!k.allowed&&['future-knowledge','unknown-fact'].includes(k.reason))issues.push({code:'knowledge-'+k.reason,severity:'error',characterId:id,factId});}
    for(const itemId of c.inventory){const it=state.items[itemId];if(!it)issues.push({code:'inventory-unknown-item',severity:'error',characterId:id,itemId});else if(it.ownerId!==id)issues.push({code:'inventory-owner-mismatch',severity:'error',characterId:id,itemId,ownerId:it.ownerId});}
  }
  for(const [id,it] of Object.entries(state.items))if(it.ownerId){const c=character(state,it.ownerId);if(!c)issues.push({code:'item-unknown-owner',severity:'error',itemId:id});else if(!c.inventory.includes(id))issues.push({code:'item-owner-inventory-mismatch',severity:'error',itemId:id,ownerId:it.ownerId});}
  for(const [key] of Object.entries(state.relationships)){const [a,b]=key.split('::');if(!character(state,a)||!character(state,b))issues.push({code:'relationship-unknown-character',severity:'error',pair:key});}
  for(const rec of state.ledger){if(rec&&rec.actorId){const c=character(state,rec.actorId);if(c&&c.control===CONTROL_MODE.PLAYER&&rec.source!=='user'&&['character.move','character.set'].includes(rec.type))issues.push({code:'player-control-violation',severity:'error',eventId:rec.id,actorId:rec.actorId});}}
  return {valid:!issues.some(x=>x.severity==='error'),issues};
}

function proposeNpcActions(stateInput,options){
  const state=createState(stateInput),opts=obj(options),ids=uniq(opts.characterIds||Object.keys(state.characters)),proposals=[];
  for(const id of ids){const c=character(state,id);if(!c||c.control===CONTROL_MODE.PLAYER||c.control===CONTROL_MODE.NARRATOR||c.status!=='active')continue;const goal=arr(c.goals).find(g=>g&&g.status!=='completed'&&g.status!=='failed')||null;if(!goal&&!c.intent)continue;proposals.push({characterId:id,intent:c.intent||text(goal&&goal.description)||text(goal&&goal.id),locationId:c.locationId,basis:{goal:clone(goal),emotions:clone(c.emotions),relationships:Object.fromEntries(Object.entries(state.relationships).filter(([k])=>k.includes(id)).slice(0,8))},requiresValidation:true});}
  return proposals;
}

return {SCHEMA,VERSION,CANON_LEVEL,CONTROL_MODE,RELATIONSHIP_DIMENSIONS,EMOTION_DIMENSIONS,FACT_STATES,createState,validateState,applyEvent,canCharacterKnow,beliefOf,relationshipFor,buildContextPacket,toMemoryRecords,proposeNpcActions,pairKey};
});
