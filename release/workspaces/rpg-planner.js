(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SevenRpgPlanner=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
function arr(v){return Array.isArray(v)?v:[];}
function text(v){return typeof v==='string'?v.trim():'';}
function scoreGoal(goal){if(!goal||typeof goal!=='object')return 0;let s=1;if(goal.priority==='high')s+=3;else if(goal.priority==='medium')s+=2;if(goal.status==='active'||!goal.status)s+=2;return s;}
function relationshipPressure(state,id){
 let pressure=0;
 for(const [key,r] of Object.entries(obj(state.relationships))){
   const pieces=key.includes('->')?key.split('->'):key.split('::');if(!pieces.includes(id))continue;
   pressure+=Math.max(0,Number(r&&r.suspicion)||0)+Math.max(0,Number(r&&r.rivalry)||0)+Math.max(0,Number(r&&r.resentment)||0)+Math.max(0,Number(r&&r.fear)||0)*.5;
 }
 return pressure;
}
function planNpc(stateInput,stateApi,characterId,options){
 const state=stateApi.createState(stateInput),c=state.characters[characterId],opts=obj(options);
 if(!c)return {ok:false,reason:'unknown-character'};if(c.control==='player'||c.control==='narrator')return {ok:false,reason:'control-locked'};if(c.status!=='active')return {ok:false,reason:'inactive'};
 const goals=arr(c.goals).filter(g=>g&&g.status!=='completed'&&g.status!=='failed').sort((a,b)=>scoreGoal(b)-scoreGoal(a));
 const goal=goals[0]||null,pressure=relationshipPressure(state,characterId);
 const intent=text(c.intent)||text(goal&&goal.description)||text(goal&&goal.id);
 if(!intent)return {ok:false,reason:'no-intent'};
 const scene=state.scene,onscreen=!!(scene&&arr(scene.participantIds).includes(characterId));
 return {ok:true,proposal:{characterId,intent,locationId:c.locationId,onscreen,visibility:onscreen?'scene':'offscreen',priority:Math.min(10,2+scoreGoal(goal)+Math.round(pressure*2)),basis:{goal:clone(goal),emotions:clone(c.emotions),relationshipPressure:pressure},requiresValidation:true}};
}
function buildPlan(stateInput,stateApi,options){
 if(!stateApi||typeof stateApi.createState!=='function')throw Error('SevenRpgState-compatible stateApi required');
 const state=stateApi.createState(stateInput),opts=obj(options),ids=arr(opts.characterIds).length?arr(opts.characterIds):Object.keys(state.characters);
 const proposals=[];
 for(const id of ids){const p=planNpc(state,stateApi,id,opts);if(p.ok)proposals.push(p.proposal);}
 proposals.sort((a,b)=>b.priority-a.priority||a.characterId.localeCompare(b.characterId));
 const threads=Object.entries(obj(state.openThreads)).filter(([,v])=>!v||!['resolved','closed'].includes(v.status)).sort((a,b)=>(b[1]&&b[1].updatedTurn||0)-(a[1]&&a[1].updatedTurn||0)).slice(0,8).map(([id,v])=>({id,state:clone(v)}));
 const factions=Object.values(obj(state.factions)).filter(f=>f&&arr(f.goals).length).slice(0,8).map(f=>({id:f.id,goals:clone(f.goals),leaders:clone(f.leaderIds),enemies:clone(f.enemies)}));
 return {schema:'seven-rpg-plan',version:1,turn:state.turn,tick:state.timeline.tick,npcProposals:proposals.slice(0,Math.max(1,Number(opts.limit)||12)),openThreads:threads,factions};
}
function worldTickProposals(stateInput,stateApi,options){
 const state=stateApi.createState(stateInput),opts=obj(options),events=[],decay=Math.max(0,Math.min(.25,Number(opts.emotionDecay)||.03));
 for(const c of Object.values(state.characters)){
   if(!c||c.status!=='active'||c.control==='player')continue;
   const delta={};for(const k of ['anger','fear','embarrassment','jealousy','anxiety','excitement']){const v=Number(c.emotions&&c.emotions[k])||0;if(v>0)delta[k]=-Math.min(v,v*decay);}
   if(Object.values(delta).some(v=>Math.abs(v)>.0001))events.push({type:'emotion.change',source:'runtime',countsAsTurn:false,payload:{characterId:c.id,delta},summary:'Background emotional settling.'});
 }
 return events.slice(0,Math.max(0,Number(opts.maxEvents)||32));
}
return {planNpc,buildPlan,worldTickProposals};
});