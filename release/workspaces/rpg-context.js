(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenRpgContext=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
function arr(v){return Array.isArray(v)?v:[];}
function text(v){return typeof v==='string'?v.trim():'';}
function uniq(xs){return Array.from(new Set(arr(xs).filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim())));}
function canonRank(level){return ({RUMOR:0,SOFT:1,ACTIVE:2,HARD:3})[String(level||'').toUpperCase()]??-1;}
function scoreCanon(entry,character,scene){
  let score=canonRank(entry.level)*20+(entry.public?4:0);
  const ids=new Set([character.id,character.locationId,...arr(scene&&scene.participantIds),scene&&scene.locationId].filter(Boolean));
  for(const id of arr(entry.entityIds))if(ids.has(id))score+=12;
  if(character.goals&&character.goals.some(g=>JSON.stringify(g).includes(entry.id)))score+=4;
  return score;
}
function relationshipSlice(state,characterId,participantIds){
  const out={};const participants=new Set(uniq(participantIds));
  for(const [key,value] of Object.entries(obj(state.relationships))){
    const pieces=key.includes('->')?key.split('->'):key.split('::');
    if(!pieces.includes(characterId))continue;
    const other=pieces.find(x=>x!==characterId);
    if(participants.size&&other&&!participants.has(other))continue;
    out[key]=clone(value);
  }
  return out;
}
function questSlice(state,characterId){
  const out={};for(const [id,q] of Object.entries(obj(state.quests))){
    const owners=arr(q&&q.ownerIds);if(owners.length===0||owners.includes(characterId))out[id]=clone(q);
  }return out;
}
function knownCanon(state,stateApi,characterId,limit){
  const c=state.characters[characterId];if(!c)return[];
  const scene=state.scene||null;
  return Object.values(obj(state.canon&&state.canon.entries))
    .filter(e=>e&&e.status==='active')
    .filter(e=>{const k=stateApi.canCharacterKnow(state,characterId,e.id);return k&&k.allowed===true;})
    .map(e=>({entry:e,score:scoreCanon(e,c,scene)}))
    .sort((a,b)=>b.score-a.score||String(a.entry.id).localeCompare(String(b.entry.id)))
    .slice(0,Math.max(1,Number(limit)||32))
    .map(x=>clone(x.entry));
}
function buildCharacterView(stateInput,stateApi,characterId,options){
  if(!stateApi||typeof stateApi.createState!=='function'||typeof stateApi.canCharacterKnow!=='function')throw Error('SevenRpgState-compatible stateApi required');
  const state=stateApi.createState(stateInput),c=state.characters[characterId],opts=obj(options);
  if(!c)return {ok:false,status:'BLOCKED',reason:'unknown-character'};
  const scene=state.scene?clone(state.scene):null;
  const participants=scene?scene.participantIds:[];
  const location=c.locationId?clone(state.world.locations[c.locationId]||null):null;
  const selectedCanon=knownCanon(state,stateApi,characterId,opts.canonLimit);
  const selectedCanonIds=new Set(selectedCanon.map(e=>e.id));
  const view={
    schema:'seven-rpg-character-view',version:1,worldId:state.worldId,sessionId:state.sessionId,turn:state.turn,timeline:{tick:state.timeline.tick,dateLabel:state.timeline.dateLabel},
    character:{id:c.id,control:c.control,identity:clone(c.identity),age:c.age,appearance:clone(c.appearance),personality:clone(c.personality),motivations:clone(c.motivations),goals:clone(c.goals),fears:clone(c.fears),preferences:clone(c.preferences),locationId:c.locationId,emotions:clone(c.emotions),beliefs:clone(c.beliefs),injuries:clone(c.injuries),status:c.status,loyalties:clone(c.loyalties),opinions:clone(c.opinions),intent:c.intent,voice:clone(c.voice)},
    scene,location,knownCanon:selectedCanon,
    relationships:relationshipSlice(state,characterId,participants),
    quests:questSlice(state,characterId),
    inventory:arr(c.inventory).map(id=>state.items[id]).filter(Boolean).map(clone),
    abilities:arr(c.abilities).map(id=>state.abilities[id]).filter(Boolean).map(clone),
    knowledgeRefs:Object.fromEntries(Object.entries(obj(c.knowledge)).filter(([factId])=>selectedCanonIds.has(factId)).map(([id,k])=>[id,clone(k)])),
    controlRule:c.control,
    hidden:{globalCanonOmitted:true,globalLedgerOmitted:true,otherCharacterPrivateStateOmitted:true}
  };
  let serialized=JSON.stringify(view);const maxChars=Math.max(1200,Number(opts.maxChars)||18000);
  if(serialized.length>maxChars){
    view.knownCanon=view.knownCanon.slice(0,12);
    const keep=new Set(view.knownCanon.map(e=>e.id));
    view.knowledgeRefs=Object.fromEntries(Object.entries(view.knowledgeRefs).filter(([id])=>keep.has(id)).slice(0,12));
    view.quests=Object.fromEntries(Object.entries(view.quests).slice(0,8));
    view.relationships=Object.fromEntries(Object.entries(view.relationships).slice(0,12).map(([k,v])=>[k,Object.assign({},v,{events:arr(v&&v.events).slice(-8)})]));
    view.inventory=view.inventory.slice(0,24);view.abilities=view.abilities.slice(0,24);
    serialized=JSON.stringify(view);
  }
  if(serialized.length>maxChars){
    view.knownCanon=view.knownCanon.slice(0,6);
    const keep=new Set(view.knownCanon.map(e=>e.id));
    view.knowledgeRefs=Object.fromEntries(Object.entries(view.knowledgeRefs).filter(([id])=>keep.has(id)).slice(0,6));
    view.quests=Object.fromEntries(Object.entries(view.quests).slice(0,4));
    view.relationships=Object.fromEntries(Object.entries(view.relationships).slice(0,6).map(([k,v])=>[k,Object.assign({},v,{events:arr(v&&v.events).slice(-4)})]));
    view.inventory=view.inventory.slice(0,12);view.abilities=view.abilities.slice(0,12);
    view.character.goals=arr(view.character.goals).slice(0,6);
    view.character.motivations=arr(view.character.motivations).slice(0,8);
    view.character.fears=arr(view.character.fears).slice(0,8);
    view.character.beliefs=Object.fromEntries(Object.entries(obj(view.character.beliefs)).slice(0,12));
    view.character.loyalties=Object.fromEntries(Object.entries(obj(view.character.loyalties)).slice(0,12));
    view.character.opinions=Object.fromEntries(Object.entries(obj(view.character.opinions)).slice(0,12));
    serialized=JSON.stringify(view);
  }
  view._diagnostics={serializedChars:serialized.length,bounded:serialized.length<=maxChars,canonCount:view.knownCanon.length};
  return {ok:true,status:'READY',view};
}
function buildSceneGenerationView(stateInput,stateApi,options){
  if(!stateApi||typeof stateApi.createState!=='function')throw Error('SevenRpgState-compatible stateApi required');
  const state=stateApi.createState(stateInput),opts=obj(options),scene=state.scene?clone(state.scene):null;
  const requested=uniq([...(scene?scene.participantIds:[]),...arr(opts.characterIds)]);
  const ids=(requested.length?requested:Object.keys(state.characters).filter(id=>state.characters[id]&&state.characters[id].status==='active')).slice(0,Math.max(1,Number(opts.characterLimit)||20));
  const characters={};
  const perCharacterMax=Math.max(1800,Math.floor((Number(opts.maxChars)||24000)/Math.max(1,ids.length)));
  for(const id of ids){
    const built=buildCharacterView(state,stateApi,id,{maxChars:perCharacterMax,canonLimit:Number(opts.canonLimit)||16});
    if(built.ok)characters[id]=built.view;
  }
  const publicCanon=Object.values(obj(state.canon&&state.canon.entries))
    .filter(e=>e&&e.status==='active'&&e.public===true)
    .sort((a,b)=>canonRank(b.level)-canonRank(a.level)||String(a.id).localeCompare(String(b.id)))
    .slice(0,Math.max(1,Number(opts.publicCanonLimit)||20)).map(clone);
  const location=scene&&scene.locationId?clone(state.world.locations[scene.locationId]||null):null;
  const view={
    schema:'seven-rpg-scene-view',version:1,worldId:state.worldId,sessionId:state.sessionId,turn:state.turn,
    timeline:{tick:state.timeline.tick,dateLabel:state.timeline.dateLabel},scene,location,characters,publicCanon,
    openThreads:Object.fromEntries(Object.entries(obj(state.openThreads)).sort((a,b)=>(b[1]&&b[1].updatedTurn||0)-(a[1]&&a[1].updatedTurn||0)).slice(0,12).map(([k,v])=>[k,clone(v)])),
    controlRules:Object.fromEntries(ids.map(id=>[id,state.characters[id]?state.characters[id].control:null])),
    generationRules:{
      worldTruthHiddenByDefault:true,
      useCharacterLocalKnowledgeForDialogue:true,
      doNotInventPlayerActions:true,
      doNotPromoteInferenceToCanon:true,
      durableChangesRequireValidatedCommit:true
    }
  };
  const maxChars=Math.max(4000,Number(opts.maxChars)||24000);
  let serialized=JSON.stringify(view);
  if(serialized.length>maxChars){
    for(const id of Object.keys(view.characters)){
      const cv=view.characters[id];
      cv.knownCanon=arr(cv.knownCanon).slice(0,6);
      cv.knowledgeRefs=Object.fromEntries(Object.entries(obj(cv.knowledgeRefs)).slice(0,6));
      cv.relationships=Object.fromEntries(Object.entries(obj(cv.relationships)).slice(0,6));
      cv.quests=Object.fromEntries(Object.entries(obj(cv.quests)).slice(0,4));
      cv.inventory=arr(cv.inventory).slice(0,8);cv.abilities=arr(cv.abilities).slice(0,8);
    }
    view.publicCanon=view.publicCanon.slice(0,10);view.openThreads=Object.fromEntries(Object.entries(view.openThreads).slice(0,6));
    serialized=JSON.stringify(view);
  }
  if(serialized.length>maxChars){
    const keep=Object.keys(view.characters).slice(0,8);
    view.characters=Object.fromEntries(keep.map(id=>[id,view.characters[id]]));
    view.controlRules=Object.fromEntries(keep.map(id=>[id,view.controlRules[id]]));
    view.publicCanon=view.publicCanon.slice(0,6);view.openThreads=Object.fromEntries(Object.entries(view.openThreads).slice(0,4));
    serialized=JSON.stringify(view);
  }
  view._diagnostics={serializedChars:serialized.length,bounded:serialized.length<=maxChars,characterCount:Object.keys(view.characters).length,publicCanonCount:view.publicCanon.length};
  return {ok:true,status:'READY',view};
}

function buildNarratorView(stateInput,stateApi,options){
  if(!stateApi||typeof stateApi.buildContextPacket!=='function')throw Error('SevenRpgState-compatible stateApi required');
  const packet=stateApi.buildContextPacket(stateInput,options||{});
  return {ok:true,status:'READY',view:Object.assign({schema:'seven-rpg-narrator-view',access:'world-truth'},packet)};
}
function memoryVisibleToCharacter(record,characterId){
  if(!record||typeof record!=='object')return false;
  const m=obj(record.metadata),visibility=text(m.visibility||record.visibility);
  if(visibility==='public')return true;
  const allow=uniq(m.allowedCharacterIds||record.allowedCharacterIds);
  return allow.includes(characterId);
}
function filterMemoryRecords(records,characterId){
  return arr(records).filter(r=>memoryVisibleToCharacter(r,characterId)).map(clone);
}
function validateNoKnowledgeLeak(view,state,stateApi,characterId){
  const issues=[];
  for(const e of arr(view&&view.knownCanon)){
    const k=stateApi.canCharacterKnow(state,characterId,e.id);
    if(!k||!k.allowed)issues.push({code:'forbidden-canon',factId:e.id,reason:k&&k.reason||'unknown'});
  }
  const refs=obj(view&&view.knowledgeRefs);
  for(const factId of Object.keys(refs)){const k=stateApi.canCharacterKnow(state,characterId,factId);if(!k||!k.allowed)issues.push({code:'forbidden-knowledge-ref',factId,reason:k&&k.reason||'unknown'});}
  return {valid:issues.length===0,issues};
}

return {buildCharacterView,buildSceneGenerationView,buildNarratorView,filterMemoryRecords,memoryVisibleToCharacter,validateNoKnowledgeLeak};
});
