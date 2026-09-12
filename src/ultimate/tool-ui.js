(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateToolUI=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const ICONS=Object.freeze({research:'◎',files:'▣',coding:'⌘',general:'◇',memory:'◉',rpg:'♙',verification:'✓',reasoning:'◆',learning:'↗'});
const STATE_LABELS=Object.freeze({queued:'Queued',starting:'Starting',waiting_permission:'Permission required',running:'Running',result:'Result',success:'Completed',error:'Failed',failure:'Failed',cancelled:'Cancelled'});
const STATE_ACTIONS=Object.freeze({queued:['cancel'],starting:['cancel'],waiting_permission:['allow_once','review','cancel'],running:['details','cancel'],result:['details','copy'],success:['details','copy'],error:['details','retry'],failure:['details','retry'],cancelled:['details','retry']});
const CATEGORY_AURORA=Object.freeze({research:'research',coding:'coding',rpg:'rpg',verification:'thinking',reasoning:'thinking',memory:'idle',files:'idle',general:'idle',learning:'success'});
const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
function text(v,fallback=''){return v==null?fallback:String(v)}
function summarize(toolId,details={}){
 const d=details||{};
 switch(toolId){
  case'web_search':return{primary:text(d.query,'Web search'),meta:d.results!=null?`${d.results} results${d.opened!=null?` · ${d.opened} opened`:''}`:''};
  case'deep_research':return{primary:text(d.question,'Deep research'),meta:d.sources!=null?`${d.sources} sources · ${d.claims||0} claims`:text(d.wave,'')};
  case'web_page_reader':case'browser_agent':return{primary:text(d.title||d.url,'Reading page'),meta:text(d.status,'')};
  case'citation_verifier':return{primary:text(d.claim,'Citation verification'),meta:d.verified!=null?`${d.verified} verified · ${d.conflicts||0} conflicts`:''};
  case'file_search':return{primary:text(d.query,'File search'),meta:d.scanned!=null?`${d.scanned} scanned · ${d.matches||0} matches`:''};
  case'document_reader':return{primary:text(d.name,'Document reader'),meta:d.page!=null?`Page ${d.page}${d.pages?` / ${d.pages}`:''}`:''};
  case'knowledge_extractor':return{primary:text(d.source,'Knowledge extraction'),meta:`${d.entities||0} entities · ${d.facts||0} facts · ${d.links||0} links`};
  case'code_search':return{primary:text(d.query,'Code search'),meta:d.files!=null?`${d.files} files · ${d.symbols||0} symbols`:''};
  case'code_executor':return{primary:text(d.command,'Execute code'),meta:text(d.sandbox,'sandbox')};
  case'test_runner':return{primary:text(d.suite,'Tests'),meta:d.total!=null?`${d.passed||0}/${d.total} passed`:''};
  case'patch_tool':return{primary:text(d.file,'Apply patch'),meta:d.added!=null?`+${d.added||0} −${d.removed||0}`:''};
  case'git_tool':return{primary:text(d.operation,'Git'),meta:text(d.branch,'')};
  case'dependency_inspector':return{primary:'Dependencies',meta:d.packages!=null?`${d.packages} packages · ${d.conflicts||0} conflicts`:''};
  case'calculator':return{primary:text(d.expression,'Calculator'),meta:d.result!=null?`= ${d.result}`:''};
  case'structured_data':return{primary:text(d.title,'Structured data'),meta:d.rows!=null?`${d.rows} rows · ${d.columns||0} columns`:''};
  case'memory_query':return{primary:text(d.query,'Memory query'),meta:d.matches!=null?`${d.matches} relevant memories`:''};
  case'memory_commit':return{primary:text(d.summary,'Memory update'),meta:text(d.scope,'')};
  case'entity_resolver':return{primary:text(d.name,'Resolve entity'),meta:text(d.entityId,'')};
  case'timeline_engine':case'timeline_reconstructor':return{primary:text(d.title,'Timeline'),meta:d.events!=null?`${d.events} events`:''};
  case'rpg_world_state':return{primary:text(d.location||d.world,'World state'),meta:text(d.time,'')};
  case'character_state':return{primary:text(d.character,'Character state'),meta:text(d.status,'')};
  case'relationship_graph':return{primary:text(d.focus,'Relationships'),meta:d.edges!=null?`${d.edges} links`:''};
  case'lorebook_retriever':return{primary:text(d.query,'Lore'),meta:d.entries!=null?`${d.entries} entries`:''};
  case'canon_guardian':return{primary:'Canon guardian',meta:d.conflicts!=null?`${d.conflicts} conflicts`:''};
  case'scene_state_engine':return{primary:text(d.scene,'Scene state'),meta:d.present!=null?`${d.present} present`:''};
  case'inventory_quest_state':return{primary:text(d.title,'Inventory & quests'),meta:text(d.change,'')};
  case'rpg_rules_engine':return{primary:text(d.resolution,'RPG resolution'),meta:text(d.position,'')};
  case'narrative_arc_tracker':return{primary:text(d.arc,'Narrative arc'),meta:text(d.stage,'')};
  case'continuity_judge':return{primary:'Continuity judge',meta:d.checks!=null?`${d.passed||0}/${d.checks} checks`:''};
  case'semantic_repo_mapper':return{primary:text(d.repository,'Repository map'),meta:d.files!=null?`${d.files} files · ${d.modules||0} modules`:''};
  case'state_diff_inspector':return{primary:text(d.title,'State diff'),meta:d.changes!=null?`${d.changes} changes`:''};
  case'evidence_graph_builder':return{primary:'Evidence graph',meta:d.nodes!=null?`${d.nodes} nodes · ${d.edges||0} edges`:''};
  case'constraint_solver':return{primary:text(d.problem,'Constraint solver'),meta:d.constraints!=null?`${d.constraints} constraints`:''};
  case'simulation_sandbox':return{primary:text(d.scenario,'Simulation'),meta:d.steps!=null?`${d.steps} steps`:''};
  case'regression_hunter':return{primary:text(d.target,'Regression hunter'),meta:d.failures!=null?`${d.failures} failures`:''};
  case'schema_synthesizer':return{primary:text(d.target,'Schema synthesizer'),meta:d.fields!=null?`${d.fields} fields`:''};
  case'conflict_resolver':return{primary:text(d.topic,'Conflict resolver'),meta:d.conflicts!=null?`${d.conflicts} conflicts`:''};
  case'outcome_learner':return{primary:text(d.task,'Outcome learner'),meta:d.samples!=null?`${d.samples} verified samples`:''};
  default:return{primary:text(d.title||d.summary,toolId.replaceAll('_',' ')),meta:text(d.meta,'')};
 }
}
class ToolPresentationEngine{
 constructor(opts={}){this.registry=opts.registry||null;}
 card(tool={},run={},opts={}){const state=run.state||'queued',details={...(run.details||{}),...(opts.details||{})},summary=summarize(tool.id,details),uiState=this.registry?.state?this.registry.state(`tool:${tool.id}`,state,{reducedMotion:!!opts.reducedMotion,lowPower:!!opts.lowPower}):null;return{toolId:tool.id,title:tool.name||tool.id.replaceAll('_',' '),category:tool.category||'general',icon:tool.ui?.icon&&tool.ui.icon!=='tool'?tool.ui.icon:(ICONS[tool.category]||'◇'),state,stateLabel:STATE_LABELS[state]||state,primary:summary.primary,meta:summary.meta,progress:run.progress==null?null:clamp(run.progress),actions:[...(STATE_ACTIONS[state]||['details'])],aurora:uiState?.aurora||CATEGORY_AURORA[tool.category]||'idle',motion:uiState?.motion||'state-specific',semantic:uiState?.semantic||'neutral',risk:tool.risk||'low',permissionRequired:state==='waiting_permission',details:clone(details)};}
 detail(tool={},run={},opts={}){const card=this.card(tool,run,opts);return{...card,sections:[{id:'input',label:'Input',content:clone(run.input||run.details?.input||null)},{id:'progress',label:'Progress',content:clone(run.history||[])},{id:'output',label:'Output',content:clone(run.output||run.result||null)},{id:'permission',label:'Permission',content:clone(run.permission||null)}].filter(s=>s.content!=null)};}
 catalog(tools=[],runs=new Map(),opts={}){const iterable=tools instanceof Map?tools.values():tools;return[...iterable].map(t=>this.card(t,runs instanceof Map?(runs.get(t.id)||{}):((runs||{})[t.id]||{}),opts));}
}
return{ICONS,STATE_LABELS,STATE_ACTIONS,CATEGORY_AURORA,summarize,ToolPresentationEngine};
});