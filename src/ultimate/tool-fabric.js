(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateTools=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const BUILTINS=[
['web_search','research'],['deep_research','research'],['web_page_reader','research'],['browser_agent','research'],['citation_verifier','research'],['file_search','files'],['document_reader','files'],['knowledge_extractor','files'],['code_search','coding'],['code_executor','coding'],['test_runner','coding'],['patch_tool','coding'],['git_tool','coding'],['dependency_inspector','coding'],['calculator','general'],['structured_data','general'],['memory_query','memory'],['memory_commit','memory'],['entity_resolver','memory'],['timeline_engine','rpg'],['rpg_world_state','rpg'],['character_state','rpg'],['relationship_graph','rpg'],['lorebook_retriever','rpg'],['canon_guardian','rpg'],['scene_state_engine','rpg'],['inventory_quest_state','rpg'],['rpg_rules_engine','rpg'],['narrative_arc_tracker','rpg'],['continuity_judge','rpg'],['semantic_repo_mapper','coding'],['state_diff_inspector','verification'],['evidence_graph_builder','research'],['constraint_solver','reasoning'],['simulation_sandbox','reasoning'],['regression_hunter','verification'],['schema_synthesizer','general'],['timeline_reconstructor','rpg'],['conflict_resolver','reasoning'],['outcome_learner','learning']
];
const typeOk=(v,t)=>t==='array'?Array.isArray(v):t==='object'?(v&&typeof v==='object'&&!Array.isArray(v)):t==='number'?typeof v==='number'&&!Number.isNaN(v):typeof v===t;
class PermissionLedger{
 constructor(){this.grants=new Map();}
 issue(input={}){check(input.id&&input.sourceEventRef,'GRANT_SOURCE_REQUIRED');check(Array.isArray(input.actionClasses)&&input.actionClasses.length,'GRANT_ACTION_REQUIRED');const g={id:input.id,sourceEventRef:input.sourceEventRef,scope:input.scope||'*',toolIds:[...(input.toolIds||['*'])],actionClasses:[...input.actionClasses],revoked:false};this.grants.set(g.id,g);return clone(g);}
 revoke(id){const g=this.grants.get(id);check(g,'GRANT_NOT_FOUND');g.revoked=true;return clone(g);}
 authorize(input={}){for(const g of this.grants.values()){if(g.revoked)continue;if(g.scope!=='*'&&g.scope!==input.scope)continue;if(!g.toolIds.includes('*')&&!g.toolIds.includes(input.toolId))continue;if(!g.actionClasses.includes(input.actionClass))continue;return {allowed:true,grantId:g.id,sourceEventRef:g.sourceEventRef};}return {allowed:false,reason:'NO_AUTHORITATIVE_GRANT'};}
}
class ToolFabric{
 constructor(){this.tools=new Map();this.aliases=new Map();for(const [id,category] of BUILTINS)this.register({id,category,capabilities:[id],risk:category==='coding'&&['code_executor','patch_tool','git_tool'].includes(id)?'medium':'low'});}
 register(input={}){check(input.id,'TOOL_ID_REQUIRED');check(!this.tools.has(input.id),'TOOL_EXISTS');const t={id:input.id,name:input.name||input.id.replaceAll('_',' '),category:input.category||'general',capabilities:[...(input.capabilities||[input.id])],aliases:[...(input.aliases||[])],risk:input.risk||'low',actionClass:input.actionClass||'read',schema:clone(input.schema||{type:'object',properties:{},additionalProperties:true}),ui:{icon:input.ui?.icon||'tool',compact:input.ui?.compact!==false,states:['queued','starting','running','waiting_permission','success','error','cancelled']}};this.tools.set(t.id,t);for(const a of t.aliases)this.aliases.set(a,t.id);return clone(t);}
 resolve(id){const canonical=this.aliases.get(id)||id;const t=this.tools.get(canonical);check(t,'TOOL_NOT_FOUND');return t;}
 validateArgs(id,args={}){const t=this.resolve(id),s=t.schema||{};check(args&&typeof args==='object'&&!Array.isArray(args),'TOOL_ARGS_OBJECT');for(const r of s.required||[])check(Object.prototype.hasOwnProperty.call(args,r),`TOOL_ARG_REQUIRED:${r}`);for(const [k,v] of Object.entries(args)){const p=(s.properties||{})[k];if(!p){if(s.additionalProperties===false)throw new Error(`TOOL_ARG_UNKNOWN:${k}`);continue;}if(p.type&&!typeOk(v,p.type))throw new Error(`TOOL_ARG_TYPE:${k}`);if(p.enum&&!p.enum.includes(v))throw new Error(`TOOL_ARG_ENUM:${k}`);}return true;}
 byCapability(cap){return [...this.tools.values()].filter(t=>t.capabilities.includes(cap)).map(clone);}
 plan(capabilities=[]){const chosen=[];for(const cap of capabilities){const found=this.byCapability(cap)[0];if(found&&!chosen.some(x=>x.id===found.id))chosen.push(found);}return chosen;}
 uiContract(id){const t=this.resolve(id);return {toolId:t.id,appearance:{category:t.category,icon:t.ui.icon},enter:{motion:'quick-fade'},active:{motion:'progress-highlight'},success:{motion:'check-morph'},failure:{motion:'coral-ring-once'},cancel:{motion:'fade-stop'},exit:{motion:'quick-fade'},reducedMotion:{motion:'opacity-only'},lowPower:{motion:'static-progress'}};}
}
class ToolRun{
 constructor(toolId){this.toolId=toolId;this.state='queued';this.history=[{state:'queued',at:Date.now()}];}
 transition(next){const allowed={queued:['starting','cancelled'],starting:['running','waiting_permission','error','cancelled'],waiting_permission:['running','cancelled','error'],running:['success','error','cancelled'],success:[],error:[],cancelled:[]};check((allowed[this.state]||[]).includes(next),`INVALID_TOOL_TRANSITION:${this.state}->${next}`);this.state=next;this.history.push({state:next,at:Date.now()});return this.snapshot();}
 snapshot(){return {toolId:this.toolId,state:this.state,history:clone(this.history)};}
}
return {BUILTIN_TOOL_IDS:Object.freeze(BUILTINS.map(x=>x[0])),PermissionLedger,ToolFabric,ToolRun};
});
