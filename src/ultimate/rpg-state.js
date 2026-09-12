(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateRPGState=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
class KnowledgeFirewall{
 constructor(runtime){this.runtime=runtime;this.rows=new Map();}
 key(gameId,timelineId,entityId){return`${gameId}|${timelineId}|${entityId}`;}
 learn(gameId,campaignId,timelineId,entityId,input={}){this.runtime.game(gameId);check(this.runtime.game(gameId).entities.has(entityId),'ENTITY_NOT_FOUND');check(input.factId&&input.sourceEventRef,'KNOWLEDGE_SOURCE_REQUIRED');const visible=new Set(this.runtime.visibleEvents(gameId,campaignId,timelineId).map(e=>e.ref));check(visible.has(input.sourceEventRef),'KNOWLEDGE_SOURCE_NOT_VISIBLE');const k=this.key(gameId,timelineId,entityId),list=this.rows.get(k)||[];const row={factId:input.factId,sourceEventRef:input.sourceEventRef,belief:clone(input.belief??input.factId),interpretation:clone(input.interpretation||null),confidence:clamp(input.confidence==null?100:input.confidence),learnedAt:input.learnedAt||Date.now()};list.push(row);this.rows.set(k,list);return clone(row);}
 facts(gameId,timelineId,entityId){return clone(this.rows.get(this.key(gameId,timelineId,entityId))||[]);}
 knows(gameId,timelineId,entityId,factId,minConfidence=1){return this.facts(gameId,timelineId,entityId).some(x=>x.factId===factId&&x.confidence>=minConfidence);}
}
class RelationshipGraph{
 constructor(){this.edges=new Map();this.history=[];}
 key(a,b){return[a,b].sort().join('|');}
 ensure(a,b){const k=this.key(a,b);if(!this.edges.has(k))this.edges.set(k,{a,b,trust:50,respect:50,comfort:50,suspicion:0,affection:0,debt:0});return this.edges.get(k);}
 apply(a,b,input={}){check(input.sourceEventRef,'RELATIONSHIP_SOURCE_REQUIRED');const e=this.ensure(a,b),before=clone(e);for(const axis of['trust','respect','comfort','suspicion','affection'])if(input[axis]!=null)e[axis]=clamp(e[axis]+Number(input[axis]));if(input.debt!=null)e.debt+=Number(input.debt);const h={id:input.id||`rel_${this.history.length+1}`,entities:[a,b],sourceEventRef:input.sourceEventRef,before,after:clone(e),reason:input.reason||null};this.history.push(h);return clone(h);}
 get(a,b){return clone(this.ensure(a,b));}
 why(a,b,limit=20){const k=this.key(a,b);return clone(this.history.filter(x=>this.key(...x.entities)===k).slice(-limit));}
}
class PlotRegistry{
 constructor(runtime){this.runtime=runtime;this.rows=new Map();}
 create(input={}){check(input.id&&!this.rows.has(input.id),'PLOT_EXISTS');const p={id:input.id,title:input.title||input.id,status:input.status||'open',importance:clamp(input.importance==null?50:input.importance),originEventRef:input.originEventRef||null,events:[],characters:[...(input.characters||[])],locations:[...(input.locations||[])],secrets:[...(input.secrets||[])],foreshadowing:[...(input.foreshadowing||[])],openQuestions:[...(input.openQuestions||[])],resolvedQuestions:[]};this.rows.set(p.id,p);return clone(p);}
 advance(gameId,campaignId,timelineId,plotId,input={}){const p=this.rows.get(plotId);check(p,'PLOT_NOT_FOUND');check(input.sourceEventRef,'PLOT_EVENT_REQUIRED');const visible=new Set(this.runtime.visibleEvents(gameId,campaignId,timelineId).map(e=>e.ref));check(visible.has(input.sourceEventRef),'PLOT_EVENT_NOT_VISIBLE');p.events.push({sourceEventRef:input.sourceEventRef,action:input.action||'advance',note:input.note||null});if(input.status)p.status=input.status;if(input.resolveQuestion){p.openQuestions=p.openQuestions.filter(x=>x!==input.resolveQuestion);p.resolvedQuestions.push(input.resolveQuestion);}return clone(p);}
 get(id){const p=this.rows.get(id);check(p,'PLOT_NOT_FOUND');return clone(p);}
 list(){return[...this.rows.values()].map(clone);}
}
class WorldState{
 constructor(){this.timelines=new Map();}
 key(gameId,timelineId){return`${gameId}|${timelineId}`;}
 state(gameId,timelineId){const k=this.key(gameId,timelineId);if(!this.timelines.has(k))this.timelines.set(k,{revision:0,entities:{},resources:{},flags:{}});return this.timelines.get(k);}
 setEntity(gameId,timelineId,entityId,state={}){const s=this.state(gameId,timelineId);s.entities[entityId]={...(s.entities[entityId]||{}),...clone(state)};s.revision++;return clone(s.entities[entityId]);}
 setResource(gameId,timelineId,name,value){const s=this.state(gameId,timelineId);s.resources[name]=Number(value);s.revision++;return s.resources[name];}
 snapshot(gameId,timelineId){return clone(this.state(gameId,timelineId));}
}
class CausalLogicEngine{
 constructor(runtime,knowledge=new KnowledgeFirewall(runtime),world=new WorldState()){this.runtime=runtime;this.knowledge=knowledge;this.world=world;this.validators=[];}
 addValidator(fn){check(typeof fn==='function','VALIDATOR_REQUIRED');this.validators.push(fn);}
 validate(input={}){const {gameId,campaignId,timelineId,actorEntityId}=input;const g=this.runtime.game(gameId);check(g.entities.has(actorEntityId),'ACTOR_NOT_FOUND');const visible=new Set(this.runtime.visibleEvents(gameId,campaignId,timelineId).map(e=>e.ref)),reasons=[];for(const ref of input.prerequisiteEventRefs||[])if(!visible.has(ref))reasons.push(`MISSING_PREREQUISITE:${ref}`);for(const fact of input.requiredFacts||[])if(!this.knowledge.knows(gameId,timelineId,actorEntityId,fact,input.minKnowledgeConfidence||1))reasons.push(`ACTOR_DOES_NOT_KNOW:${fact}`);const ws=this.world.state(gameId,timelineId),actor=ws.entities[actorEntityId]||{};if(input.requiredLocation&&actor.locationId!==input.requiredLocation)reasons.push('WRONG_LOCATION');for(const [resource,cost] of Object.entries(input.resourceCosts||{}))if(Number(ws.resources[resource]||0)<Number(cost))reasons.push(`INSUFFICIENT_RESOURCE:${resource}`);if(input.canonForbidden)reasons.push('CANON_FORBIDDEN');for(const fn of this.validators){const r=fn(clone(input),clone(ws));if(r===false)reasons.push('CUSTOM_VALIDATOR');else if(r&&r.pass===false)reasons.push(r.reason||'CUSTOM_VALIDATOR');}return{pass:reasons.length===0,reasons};}
 simulate(input={}){const gate=this.validate(input);if(!gate.pass)return{pass:false,reasons:gate.reasons,diff:null};const ws=this.world.snapshot(input.gameId,input.timelineId),diff={resourceDelta:{},entityPatch:clone(input.entityPatch||{}),flags:clone(input.flags||{})};for(const [k,cost] of Object.entries(input.resourceCosts||{}))diff.resourceDelta[k]=-Number(cost);for(const [k,gain] of Object.entries(input.resourceGains||{}))diff.resourceDelta[k]=(diff.resourceDelta[k]||0)+Number(gain);return{pass:true,reasons:[],before:ws,diff};}
 commit(input={}){const sim=this.simulate(input);check(sim.pass,`CAUSAL_VALIDATION_FAILED:${sim.reasons.join(',')}`);const ws=this.world.state(input.gameId,input.timelineId);for(const [k,d] of Object.entries(sim.diff.resourceDelta))ws.resources[k]=Number(ws.resources[k]||0)+d;if(input.entityPatch)ws.entities[input.actorEntityId]={...(ws.entities[input.actorEntityId]||{}),...clone(input.entityPatch)};Object.assign(ws.flags,clone(input.flags||{}));ws.revision++;const event=this.runtime.appendEvent(input.gameId,input.campaignId,input.timelineId,{id:input.eventId,type:input.type||'resolved_action',actorIds:[input.actorEntityId],witnessIds:input.witnessIds||[],payload:{action:clone(input.action||{}),worldDiff:clone(sim.diff),result:clone(input.result||{})},causeRefs:input.causeRefs||input.prerequisiteEventRefs||[]});return{event,state:this.world.snapshot(input.gameId,input.timelineId)};}
}
return{KnowledgeFirewall,RelationshipGraph,PlotRegistry,WorldState,CausalLogicEngine};
});
