(function(root,factory){const D=(typeof module==='object'&&module.exports)?{C:require('./capability-os.js'),I:require('./capability-intelligence.js'),IR:require('./tool-ir.js'),S:require('./capability-scheduler.js'),O:require('./capability-observatory.js'),P:require('./programmatic-tools.js'),T:require('./capability-transactions.js'),Sec:require('./capability-security.js'),F:require('./frontier-tool-loop.js')}:{C:root.SevenCapabilityOS,I:root.SevenCapabilityIntelligence,IR:root.SevenToolIR,S:root.SevenCapabilityScheduler,O:root.SevenCapabilityObservatory,P:root.SevenProgrammaticTools,T:root.SevenCapabilityTransactions,Sec:root.SevenCapabilitySecurity,F:root.SevenUltimateFrontierToolLoop};const api=factory(D);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenFrontierCapabilityBridge=api;})(typeof globalThis!=='undefined'?globalThis:this,function(D){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};

const DEFAULT_PROFILES=Object.freeze({
 general:['calculator','structured_data','schema_synthesizer'],
 research:['web_search','deep_research','web_page_reader','citation_verifier','evidence_graph_builder'],
 coding:['code_search','semantic_repo_mapper','document_reader','patch_tool','test_runner','git_tool','dependency_inspector','regression_hunter','state_diff_inspector'],
 rpg:['timeline_engine','rpg_world_state','character_state','relationship_graph','lorebook_retriever','canon_guardian','scene_state_engine','inventory_quest_state','rpg_rules_engine','narrative_arc_tracker','continuity_judge','timeline_reconstructor'],
 memory:['memory_query','memory_commit','entity_resolver'],
 files:['file_search','document_reader','knowledge_extractor'],
 verification:['citation_verifier','continuity_judge','regression_hunter','state_diff_inspector']
});

class CapabilityProfileRegistry{
 constructor(input={}){this.rows=new Map(Object.entries({...DEFAULT_PROFILES,...(input.profiles||{})}).map(([k,v])=>[k,[...new Set(v)]]));}
 set(id,capabilities=[]){this.rows.set(id,[...new Set(capabilities)]);return this;}
 get(id){return[...(this.rows.get(id)||this.rows.get('general')||[])];}
 merge(ids=[]){return[...new Set(ids.flatMap(id=>this.get(id)))];}
}

class LegacyCapabilityMigrator{
 constructor(input={}){check(input.os,'MIGRATOR_OS_REQUIRED');this.os=input.os;}
 migrate(fabric,executorRegistry,input={}){check(fabric?.tools,'LEGACY_FABRIC_REQUIRED');const rows=[];for(const t of fabric.tools.values()){let ex=null,meta=null;try{meta=executorRegistry?.executors?.get(t.id)||null;ex=meta?.fn||null;}catch{}if(this.os.registry.items.has(t.id)){rows.push(this.os.registry.resolve(t.id));continue;}const g=this.os.register({id:t.id,name:t.name,namespace:t.category||'general',description:`Seven ${t.category||'general'} capability: ${t.name}`,capabilities:t.capabilities||[t.id],inputSchema:t.schema||{type:'object',properties:{},additionalProperties:true},outputSchema:meta?.resultSchema||null,actionClass:t.actionClass||'read',sideEffects:meta?.sideEffects&&meta.sideEffects!=='none'?[meta.sideEffects]:[],idempotent:meta?.idempotent!==false,reversible:meta?.sideEffects==='none',protocol:'local',providerId:'seven',version:'legacy-bridge-1',trustZone:1,reliability:.95,tags:[t.category||'general','legacy_migrated'],metadata:{legacyTool:true,risk:t.risk||'low'}},ex?async(args,ctx)=>ex(clone(args),ctx):null);rows.push(g);}
 if(input.grantReadScope){for(const g of rows)if(g.actionClass==='read'&&this.os.executors.has(g.id))this.os.permissions.grant({capabilityId:g.id,scope:input.grantReadScope,actionClasses:['read'],taskId:input.taskId||null});}return rows;}
}

class CapabilityFabricFacade{
 constructor(os){this.os=os;}
 resolve(id){const g=this.os.registry.resolve(id);return{id:g.id,name:g.name,category:g.namespace,schema:clone(g.inputSchema),actionClass:g.actionClass,capabilities:clone(g.capabilities),risk:g.metadata?.risk||'low'};}
 plan(capabilities=[]){const out=[];for(const cap of capabilities){const direct=this.os.registry.items.get(cap);if(direct){out.push(this.resolve(direct.id));continue;}const found=this.os.registry.list().find(g=>g.capabilities.includes(cap));if(found&&!out.some(x=>x.id===found.id))out.push(this.resolve(found.id));}return out;}
}

class CapabilityExecutorFacade{
 constructor(os){this.os=os;this.executors=new Map();this.refresh();}
 refresh(){this.executors.clear();for(const[id,fn]of this.os.executors)if(typeof fn==='function')this.executors.set(id,{fn});return this;}
}

class CapabilityRuntimeFacade{
 constructor(input={}){this.os=input.os;this.observatory=input.observatory||null;}
 async execute(input={}){const g=this.os.registry.resolve(input.toolId||input.capabilityId),started=Date.now(),out=await this.os.execute({capabilityId:g.id,args:input.args||{},scope:input.scope||'*',taskId:input.taskId,signal:input.signal,inputLabels:input.inputLabels||[],workload:input.workload,callId:input.callId});const latencyMs=Date.now()-started;if(this.observatory)this.observatory.record({capabilityId:g.id,providerId:g.providerId,workload:input.workload||g.namespace,success:out.state==='success',verified:out.packet?.verified===true,latencyMs,cacheHit:out.cacheHit===true,version:g.version});return{toolId:g.id,state:out.state==='failed'?'error':out.state,result:out.packet?.projection??out.packet?.raw??null,error:out.reason||null,packet:out.packet||null,cacheHit:out.cacheHit===true,sideEffectUncertainty:out.state==='uncertain'};}
}

class CapabilityAgenticToolLoop{
 constructor(input={}){check(input.os&&input.providers,'CAPABILITY_TOOL_LOOP_DEPS_REQUIRED');this.os=input.os;this.providers=input.providers;this.intelligence=input.intelligence||new D.I.CapabilityIntelligencePlane({os:this.os});this.observatory=input.observatory||new D.O.CapabilityObservatory();this.fabric=new CapabilityFabricFacade(this.os);this.executorFacade=new CapabilityExecutorFacade(this.os);this.runtimeFacade=new CapabilityRuntimeFacade({os:this.os,observatory:this.observatory});this.loop=input.loop||new D.F.AgenticToolLoop({fabric:this.fabric,runtime:this.runtimeFacade,providers:this.providers,schemas:new D.F.ToolSchemaCompiler({fabric:this.fabric,executors:this.executorFacade})});}
 refresh(){this.executorFacade.refresh();this.intelligence.discovery.refresh();return this;}
 prepare(query,input={}){this.refresh();const compiled=this.intelligence.compileForTask(query,{...input,discoveryLimit:input.discoveryLimit||32,disclosureLevel:3});const ids=compiled.tools.map(x=>x.id).filter(id=>this.os.executors.has(id));return{...compiled,ids};}
 canHandle(ids=[]){this.refresh();return ids.some(id=>this.os.executors.has(id));}
 authorization(ids=[],scope='*',taskId=null){return ids.map(id=>{const g=this.os.registry.resolve(id);return{id,...this.os.permissions.authorize(g,{scope,taskId})};});}
 async run(input={}){let ids=[...(input.toolIds||[])];if(!ids.length){const last=[...(input.messages||[])].reverse().find(x=>x.role==='user'),query=typeof last?.content==='string'?last.content:JSON.stringify(last?.content||'');ids=this.prepare(query,{allowNetwork:input.allowNetwork!==false,workload:input.workload,limit:input.toolLimit||12}).ids;}if(!ids.length)return{handled:false,reason:'NO_EXECUTABLE_CAPABILITIES'};return this.loop.run({...input,toolIds:ids});}
}

class CapabilityPlatform{
 constructor(input={}){this.os=input.os||new D.C.CapabilityOS(input.osOptions||{});this.intelligence=input.intelligence||new D.I.CapabilityIntelligencePlane({os:this.os,toolsetBudget:input.toolsetBudget});this.observatory=input.observatory||new D.O.CapabilityObservatory(input.observatoryOptions);this.scheduler=input.scheduler||new D.S.AdvancedCapabilityScheduler({runtime:this.os.runtime,registry:this.os.registry,...(input.schedulerOptions||{})});this.transactions=input.transactions||new D.T.TransactionCoordinator({runtime:this.os.runtime});this.programmatic=input.programmatic||new D.P.ProgrammaticToolRuntime({runtime:this.os.runtime,registry:this.os.registry});this.macros=input.macros||new D.P.ToolMacroLibrary({compiler:new D.P.RecipeCompiler({registry:this.os.registry})});this.fastLane=input.fastLane||new D.P.FastLaneRouter({programmatic:this.programmatic,macros:this.macros});this.ir=input.ir||new D.IR.ToolIR();this.schemaCompiler=input.schemaCompiler||new D.IR.ProviderSchemaCompiler({ir:this.ir});this.artifacts=input.artifacts||new D.IR.ArtifactRefStore();this.resultBus=input.resultBus||new D.IR.TypedResultBus();this.integrity=input.integrity||new D.Sec.DefinitionIntegrityStore();this.secrets=input.secrets||new D.Sec.SecretVaultBoundary();this.risk=input.risk||new D.Sec.CapabilityRiskEngine();this.profiles=input.profiles||new CapabilityProfileRegistry();this.coverage=new D.O.CapabilityCoverageMap();this.arena=new D.O.ToolArena();}
 migrateLegacy(fabric,executors,input={}){const rows=new LegacyCapabilityMigrator({os:this.os}).migrate(fabric,executors,input);this.intelligence.discovery.refresh();return rows;}
 createToolLoop(providers,input={}){return new CapabilityAgenticToolLoop({os:this.os,providers,intelligence:this.intelligence,observatory:this.observatory,...input});}
 snapshot(){return{os:this.os.snapshot(),index:this.intelligence.discovery.index.stats(),telemetry:this.observatory.snapshot(),profiles:[...this.profiles.rows.keys()],macros:this.macros.rows.size,artifacts:this.artifacts.artifacts.size};}
}

return{DEFAULT_PROFILES,CapabilityProfileRegistry,LegacyCapabilityMigrator,CapabilityFabricFacade,CapabilityExecutorFacade,CapabilityRuntimeFacade,CapabilityAgenticToolLoop,CapabilityPlatform};
});