(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateRPG=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
const tokens=s=>new Set((String(s||'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}_-]+/gu)||[]));
const jaccard=(a,b)=>{const A=new Set(a||[]),B=new Set(b||[]);const u=new Set([...A,...B]);if(!u.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/u.size};

class CharacterEngine{
 constructor(runtime){check(runtime,'RUNTIME_REQUIRED');this.runtime=runtime;this.profiles=new Map();}
 key(gameId,entityId){return `${gameId}:${entityId}`}
 createProfile(gameId,entityId,input={}){
  const g=this.runtime.game(gameId);check(g.entities.has(entityId),'ENTITY_NOT_FOUND');const key=this.key(gameId,entityId);check(!this.profiles.has(key),'PROFILE_EXISTS');
  const values=(input.values||[]).map((x,i)=>typeof x==='string'?{name:x,weight:Math.max(1,100-i*10)}:{name:x.name,weight:clamp(x.weight,0,100)}).filter(x=>x.name);
  const p={gameId,entityId,values,philosophy:[...(input.philosophy||[])],goals:(input.goals||[]).map((g,i)=>typeof g==='string'?{id:`goal_${i+1}`,text:g,weight:70}:{id:g.id||`goal_${i+1}`,text:g.text||'',weight:clamp(g.weight||70)}),contradictions:clone(input.contradictions||[]),voice:clone(input.voice||{}),riskTolerance:clamp(input.riskTolerance==null?50:input.riskTolerance),trustStyle:input.trustStyle||'contextual',fears:[...(input.fears||[])],habits:[...(input.habits||[])],expertise:[...(input.expertise||[])],ignorance:[...(input.ignorance||[])],createdFrom:clone(input.createdFrom||{})};this.profiles.set(key,p);return clone(p);
 }
 get(gameId,entityId){const p=this.profiles.get(this.key(gameId,entityId));check(p,'PROFILE_NOT_FOUND');return p;}
 similarity(a,b){
  const A=typeof a==='string'?this.profiles.get(a):a,B=typeof b==='string'?this.profiles.get(b):b;check(A&&B,'PROFILE_NOT_FOUND');
  const value=jaccard(A.values.map(x=>x.name),B.values.map(x=>x.name));const goal=jaccard(A.goals.map(x=>x.text),B.goals.map(x=>x.text));const phil=jaccard([...tokens(A.philosophy.join(' '))],[...tokens(B.philosophy.join(' '))]);const voice=jaccard(Object.entries(A.voice).map(x=>x.join(':')),Object.entries(B.voice).map(x=>x.join(':')));return +(value*.35+goal*.25+phil*.2+voice*.2).toFixed(3);
 }
 distinctivenessReport(gameId,candidate,threshold=.82){const collisions=[];for(const p of this.profiles.values())if(p.gameId===gameId){const similarity=this.similarity(p,candidate);if(similarity>=threshold)collisions.push({entityId:p.entityId,similarity});}return {pass:collisions.length===0,collisions:collisions.sort((a,b)=>b.similarity-a.similarity)};}
 decide(gameId,entityId,situation={},candidates=[]){
  const p=this.get(gameId,entityId),known=new Set(situation.knownFacts||[]),relationships=situation.relationships||{};const scored=[];
  for(const c of candidates){const missing=(c.requiredFacts||[]).filter(x=>!known.has(x));if(missing.length){scored.push({id:c.id,eligible:false,missingFacts:missing,score:-Infinity});continue;}let score=0;
   for(const v of p.values){const effect=Number((c.valueEffects||{})[v.name]||0);score+=effect*(v.weight/100)*4;}
   for(const g of p.goals){const effect=Number((c.goalEffects||{})[g.id]??(c.goalEffects||{})[g.text]??0);score+=effect*(g.weight/100)*3;}
   for(const [rel,effect] of Object.entries(c.relationshipEffects||{}))score+=Number(effect)*(Number(relationships[rel]||50)/100);
   const risk=clamp(c.risk||0);score-=risk*((100-p.riskTolerance)/100)*.05;
   if(c.philosophyTags){const ph=tokens(p.philosophy.join(' '));score+=c.philosophyTags.filter(x=>ph.has(String(x).toLowerCase())).length*.75;}
   scored.push({id:c.id,eligible:true,score:+score.toFixed(3)});
  }
  scored.sort((a,b)=>b.score-a.score||String(a.id).localeCompare(String(b.id)));return {choice:scored.find(x=>x.eligible)?.id||null,candidates:scored};
 }
}

class StoryArchitect{
 constructor(){this.timelines=new Map();}
 state(timelineId){if(!this.timelines.has(timelineId))this.timelines.set(timelineId,{series:{themes:[],questions:[]},seasons:new Map(),arcs:new Map(),episodes:[]});return this.timelines.get(timelineId);}
 defineSeries(timelineId,input={}){const s=this.state(timelineId);s.series={title:input.title||'Untitled Series',premise:input.premise||'',themes:[...(input.themes||[])],questions:[...(input.questions||[])],forbiddenContradictions:[...(input.forbiddenContradictions||[])]};return clone(s.series);}
 createSeason(timelineId,input={}){const s=this.state(timelineId),id=input.id||`season_${s.seasons.size+1}`;check(!s.seasons.has(id),'SEASON_EXISTS');const season={id,number:input.number||s.seasons.size+1,title:input.title||id,dramaticQuestion:input.dramaticQuestion||'',startingState:clone(input.startingState||{}),targetTransformation:clone(input.targetTransformation||{}),requiredPayoffs:[...(input.requiredPayoffs||[])],status:'active'};s.seasons.set(id,season);return clone(season);}
 createArc(timelineId,input={}){const s=this.state(timelineId),id=input.id||`arc_${s.arcs.size+1}`;check(!s.arcs.has(id),'ARC_EXISTS');if(input.seasonId)check(s.seasons.has(input.seasonId),'SEASON_NOT_FOUND');const arc={id,seasonId:input.seasonId||null,type:input.type||'season_arc',title:input.title||id,status:input.status||'open',dependencies:[...(input.dependencies||[])],importance:clamp(input.importance==null?50:input.importance),threads:[...(input.threads||[])]};s.arcs.set(id,arc);return clone(arc);}
 canAdvanceArc(timelineId,arcId){const s=this.state(timelineId),a=s.arcs.get(arcId);check(a,'ARC_NOT_FOUND');const blocked=a.dependencies.filter(id=>{const d=s.arcs.get(id);return !d||!['resolved','superseded'].includes(d.status)});return {allowed:blocked.length===0,blockedBy:blocked};}
 updateArc(timelineId,arcId,status){const a=this.state(timelineId).arcs.get(arcId);check(a,'ARC_NOT_FOUND');check(['open','active','partially_resolved','dormant','resolved','failed','superseded','abandoned'].includes(status),'ARC_STATUS');a.status=status;return clone(a);}
 scheduleEpisode(timelineId,input={}){const s=this.state(timelineId);if(input.seasonId)check(s.seasons.has(input.seasonId),'SEASON_NOT_FOUND');const beats=(input.beats||[]).map(b=>({label:b.label||'beat',weight:Math.max(1,Math.min(5,Number(b.weight||1))),kind:b.kind||'general',arcIds:[...(b.arcIds||[])]}));const total=beats.reduce((n,b)=>n+b.weight,0),major=beats.filter(b=>b.weight>=4).length,irreversible=beats.filter(b=>b.kind==='irreversible').length;const warnings=[];if(total>16)warnings.push('NARRATIVE_OVERLOAD');if(major>2)warnings.push('TOO_MANY_MAJOR_BEATS');if(irreversible>1)warnings.push('TOO_MANY_IRREVERSIBLE_BEATS');for(const b of beats)for(const arcId of b.arcIds){check(s.arcs.has(arcId),'EPISODE_ARC_MISSING');const gate=this.canAdvanceArc(timelineId,arcId);if(!gate.allowed)warnings.push(`ARC_BLOCKED:${arcId}`)}const ep={id:input.id||`episode_${s.episodes.length+1}`,number:input.number||s.episodes.length+1,seasonId:input.seasonId||null,title:input.title||'Untitled Episode',role:input.role||'development',beats,status:input.status||'planned',endingState:'unknown',load:{total,major,irreversible},warnings:[...new Set(warnings)]};s.episodes.push(ep);return clone(ep);}
 seasonClosureGate(timelineId,seasonId,input={}){const s=this.state(timelineId),season=s.seasons.get(seasonId);check(season,'SEASON_NOT_FOUND');const checks={primaryQuestionResolved:!!input.primaryQuestionResolved,majorPayoffsHandled:!!input.majorPayoffsHandled,causalConsequencesCommitted:!!input.causalConsequencesCommitted,characterTransformationVisible:!!input.characterTransformationVisible,newStatusQuo:!!input.newStatusQuo,nextSeasonLaunchValid:input.nextSeasonLaunchValid!==false};const score=Object.values(checks).filter(Boolean).length;return {pass:score>=5,score,total:Object.keys(checks).length,checks};}
 atlas(timelineId){const s=this.state(timelineId);return {series:clone(s.series),seasons:[...s.seasons.values()].map(clone),arcs:[...s.arcs.values()].map(clone),episodes:clone(s.episodes)};}
}

class ToneDirector{
 constructor(){this.defaults={seriousness:55,tension:35,mystery:20,humor:20,warmth:45,formality:45,pace:50,lyricism:35,conflict:30,hope:50};}
 resolve(scene={},character={}){const v={...this.defaults,...clone(scene)};for(const k of Object.keys(this.defaults))v[k]=clamp(v[k]);return {scene:v,characterContrast:{humor:clamp(character.humor??v.humor),formality:clamp(character.formality??v.formality),directness:clamp(character.directness??50)}};}
 whiplash(a,b){const keys=['seriousness','tension','humor','warmth','pace','conflict'];const delta=keys.reduce((s,k)=>s+Math.abs(clamp(a[k])-clamp(b[k])),0)/keys.length;return {delta:+delta.toFixed(1),warning:delta>55};}
 curve(points=[]){return points.map((p,i)=>({index:i,...this.resolve(p).scene}));}
}

class FlashbackDirector{
 score(input={}){const positive=clamp(input.contextRelevance)+clamp(input.characterRelevance)+clamp(input.causalImportance)+clamp(input.emotionalResonance)+clamp(input.plotPayoff)+clamp(input.unansweredQuestionValue);const negative=clamp(input.repetition)+clamp(input.pacingDamage)+clamp(input.spoilerRisk)+clamp(input.agencyDamage);const raw=positive*.18-negative*.22;return {score:+Math.max(0,Math.min(100,raw)).toFixed(1),recommended:raw>=45};}
 contract(input={}){check(input.kind,'FLASHBACK_KIND_REQUIRED');return {kind:input.kind,scope:input.scope||'scene',perspective:input.perspective||'narrative',sourceEventRefs:[...(input.sourceEventRefs||[])],returnAnchor:clone(input.returnAnchor||{}),mayCommitHistory:input.kind==='historical_gap',canonRule:input.kind==='what_if_memory'?'isolated':'preserve_past'};}
}

return {CharacterEngine,StoryArchitect,ToneDirector,FlashbackDirector};
});
