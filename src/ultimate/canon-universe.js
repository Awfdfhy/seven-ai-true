(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateCanonUniverse=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
const SOURCE_PRIORITY=Object.freeze({primary:100,official_supplement:90,licensed_reference:80,adaptation:70,user_canon:65,secondary:50,fan_summary:30,unknown:10});
class CanonSourceRegistry{
 constructor(){this.sources=new Map();}
 add(input={}){check(input.id&&!this.sources.has(input.id),'CANON_SOURCE_ID_REQUIRED');const s={id:input.id,title:input.title||input.id,kind:input.kind||'unknown',medium:input.medium||null,continuityId:input.continuityId||'main',priority:Number(input.priority??SOURCE_PRIORITY[input.kind]??10),authority:input.authority||'external_reference',url:input.url||null,notes:input.notes||null};this.sources.set(s.id,s);return clone(s);}
 get(id){const s=this.sources.get(id);check(s,'CANON_SOURCE_NOT_FOUND');return clone(s);}
}
class CanonFactLedger{
 constructor(sourceRegistry){this.sources=sourceRegistry;this.facts=new Map();}
 add(input={}){check(input.id&&!this.facts.has(input.id),'CANON_FACT_ID_REQUIRED');check(input.subjectId&&input.predicate,'CANON_FACT_REQUIRED');check(Array.isArray(input.sourceRefs)&&input.sourceRefs.length,'CANON_FACT_SOURCE_REQUIRED');for(const id of input.sourceRefs)this.sources.get(id);const row=Object.freeze({id:input.id,subjectId:input.subjectId,predicate:input.predicate,object:clone(input.object),continuityId:input.continuityId||'main',validFrom:input.validFrom??null,validTo:input.validTo??null,spoilerRank:Number(input.spoilerRank??0),knownBy:[...(input.knownBy||[])],certainty:Math.max(0,Math.min(1,Number(input.certainty??1))),sourceRefs:[...input.sourceRefs],summary:String(input.summary||''),tags:[...(input.tags||[])],authority:'structured_canon_fact'});this.facts.set(row.id,row);return clone(row);}
 sourceWeight(fact){return Math.max(...fact.sourceRefs.map(id=>this.sources.get(id).priority));}
 query(input={}){const marker=input.marker??Infinity,spoilerRank=input.spoilerRank??Infinity,continuities=new Set(input.continuityIds||[input.continuityId||'main']),subjectIds=input.subjectIds?new Set(input.subjectIds):null,predicates=input.predicates?new Set(input.predicates):null,characterId=input.characterId||null;const rows=[...this.facts.values()].filter(f=>continuities.has(f.continuityId)&&(!subjectIds||subjectIds.has(f.subjectId))&&(!predicates||predicates.has(f.predicate))&&(f.validFrom==null||f.validFrom<=marker)&&(f.validTo==null||f.validTo>=marker)&&f.spoilerRank<=spoilerRank&&(!characterId||!f.knownBy.length||f.knownBy.includes(characterId))).map(f=>({...clone(f),sourcePriority:this.sourceWeight(f)}));rows.sort((a,b)=>b.sourcePriority-a.sourcePriority||b.certainty-a.certainty);return rows;}
 conflicts(input={}){const rows=this.query(input),groups=new Map();for(const f of rows){const k=`${f.subjectId}|${f.predicate}`;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(f);}return[...groups.entries()].filter(([,g])=>new Set(g.map(x=>JSON.stringify(x.object))).size>1).map(([key,facts])=>({key,facts,preferred:facts.slice().sort((a,b)=>b.sourcePriority-a.sourcePriority||b.certainty-a.certainty)[0]}));}
}
class ContinuityGraph{
 constructor(){this.nodes=new Map([['main',{id:'main',name:'Main canon',parentId:null,branchPoint:null,kind:'source_canon'}]]);}
 add(input={}){check(input.id&&!this.nodes.has(input.id),'CONTINUITY_ID_REQUIRED');const parentId=input.parentId||'main';check(this.nodes.has(parentId),'CONTINUITY_PARENT_NOT_FOUND');const row={id:input.id,name:input.name||input.id,parentId,branchPoint:clone(input.branchPoint||null),kind:input.kind||'adaptation',status:input.status||'active'};this.nodes.set(row.id,row);return clone(row);}
 lineage(id){check(this.nodes.has(id),'CONTINUITY_NOT_FOUND');const out=[];let cur=this.nodes.get(id);while(cur){out.push(clone(cur));cur=cur.parentId?this.nodes.get(cur.parentId):null;}return out;}
 scope(id){return this.lineage(id).map(x=>x.id);}
}
class CanonUniverse{
 constructor(input={}){check(input.id,'CANON_UNIVERSE_ID_REQUIRED');this.id=input.id;this.title=input.title||input.id;this.medium=[...(input.medium||[])];this.sources=new CanonSourceRegistry();this.facts=new CanonFactLedger(this.sources);this.continuities=new ContinuityGraph();this.characters=new Map();this.progress={continuityId:'main',marker:0,spoilerRank:0};this.policy={factsOnly:true,preserveSourceCanon:true,playerDivergenceCreatesBranch:true,...clone(input.policy||{})};}
 addCharacter(input={}){check(input.id&&!this.characters.has(input.id),'CANON_CHARACTER_ID_REQUIRED');const row={id:input.id,name:input.name||input.id,aliases:[...(input.aliases||[])],roles:[...(input.roles||[])],continuityIds:[...(input.continuityIds||['main'])],visual:clone(input.visual||{}),voice:clone(input.voice||{}),sourceRefs:[...(input.sourceRefs||[])]};this.characters.set(row.id,row);return clone(row);}
 setProgress(input={}){if(input.continuityId)check(this.continuities.nodes.has(input.continuityId),'CONTINUITY_NOT_FOUND');this.progress={...this.progress,...clone(input)};return clone(this.progress);}
 fork(input={}){const parentId=input.parentId||this.progress.continuityId||'main';const id=input.id||`player_${Date.now()}`;return this.continuities.add({id,name:input.name||'Player timeline',parentId,branchPoint:{marker:input.marker??this.progress.marker,sourceEventRef:input.sourceEventRef||null},kind:'player_divergence'});}
 context(input={}){const continuityId=input.continuityId||this.progress.continuityId,marker=input.marker??this.progress.marker,spoilerRank=input.spoilerRank??this.progress.spoilerRank,scope=this.continuities.scope(continuityId),facts=this.facts.query({continuityIds:scope,marker,spoilerRank,subjectIds:input.subjectIds,predicates:input.predicates,characterId:input.characterId});const conflicts=this.facts.conflicts({continuityIds:scope,marker,spoilerRank,subjectIds:input.subjectIds,predicates:input.predicates,characterId:input.characterId});return{universeId:this.id,title:this.title,continuityId,marker,spoilerRank,facts,conflicts,characters:(input.characterIds||[]).map(id=>clone(this.characters.get(id))).filter(Boolean),authority:'derived_canon_context',lineage:{continuities:scope,sourceRefs:[...new Set(facts.flatMap(f=>f.sourceRefs))]}};}
 audit(){const orphanFacts=[];for(const f of this.facts.facts.values())for(const s of f.sourceRefs)if(!this.sources.sources.has(s))orphanFacts.push(f.id);return{pass:orphanFacts.length===0,sources:this.sources.sources.size,facts:this.facts.facts.size,characters:this.characters.size,continuities:this.continuities.nodes.size,orphanFacts};}
}
class CanonUniverseRegistry{
 constructor(){this.universes=new Map();}
 create(input={}){check(input.id&&!this.universes.has(input.id),'CANON_UNIVERSE_EXISTS');const u=new CanonUniverse(input);this.universes.set(u.id,u);return u;}
 get(id){const u=this.universes.get(id);check(u,'CANON_UNIVERSE_NOT_FOUND');return u;}
}
class CanonRPGAdapter{
 constructor(registry){this.registry=registry;}
 prepare(universeId,input={}){const u=this.registry.get(universeId),context=u.context(input);return{mode:'existing_work_rpg',universeId,continuityId:context.continuityId,canon:context,guardrails:{preserveSourceCanon:u.policy.preserveSourceCanon,divergenceCreatesBranch:u.policy.playerDivergenceCreatesBranch,factsOnly:u.policy.factsOnly},promptPacket:{facts:context.facts.map(f=>({subjectId:f.subjectId,predicate:f.predicate,object:f.object,certainty:f.certainty})),characters:context.characters,conflicts:context.conflicts.map(c=>({key:c.key,preferred:c.preferred.id}))},authority:'derived_rpg_adapter'};}
 divergence(universeId,input={}){const u=this.registry.get(universeId);return u.fork(input);}
}
return{SOURCE_PRIORITY,CanonSourceRegistry,CanonFactLedger,ContinuityGraph,CanonUniverse,CanonUniverseRegistry,CanonRPGAdapter};
});
