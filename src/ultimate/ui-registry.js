(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateUIRegistry=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
const VISIBLE_STATES=Object.freeze(['appearance','enter','active','success','failure','cancel','exit','reducedMotion','lowPower']);
const DEFAULT_MOTION=Object.freeze({appearance:'stable',enter:'standard-fade-rise',active:'state-specific',success:'check-morph',failure:'semantic-coral-once',cancel:'stop-and-fade',exit:'quick-fade',reducedMotion:'opacity-only',lowPower:'quick-fade'});
const DEFAULT_A11Y=Object.freeze({minimumTarget:44,keyboard:true,visibleFocus:true,reducedMotion:true,colorIndependentState:true,reflow320:true,textZoom200:true});
const SURFACES=Object.freeze([
'home','chat','composer','halo','command_palette','toast','drawer','sheet','popover','menu','tooltip','empty_state','skeleton','offline','update',
'deep_thinking','search','research','sources','source_viewer','evidence_graph','citation_audit',
'coding','coding_activity_rail','coding_project_panel','coding_editor','coding_diff','coding_agent_dock','coding_bottom_dock','coding_review','coding_threads','coding_terminal_bubbles','files','file_upload','editor','diff','terminal','tests','git','agent','artifact','checkpoint','permissions','errors','backup','restore','import',
'projects','project_overview','knowledge','memory','memory_timeline','context_workspace','tools','tool_activity','models','model_selector','providers','provider_health','evals','settings','notifications',
'rpg_library','rpg_home','rpg_story','rpg_scene_capsule','rpg_character','rpg_cast_atlas','rpg_relationships','rpg_chronicle','rpg_story_atlas','rpg_plot_board','rpg_journal','rpg_world','rpg_rumors','rpg_knowledge','rpg_flashback','rpg_episode_end','rpg_side_story','rpg_interlude','rpg_timeline_branch','rpg_agency_gate','rpg_character_genesis','rpg_visual_canon','rpg_canon_universe','rpg_canon_sources','rpg_continuity_branch','rpg_npc_life','rpg_npc_goals','rpg_npc_identity','rpg_npc_routine','rpg_npc_future',
'media','image_viewer','pdf_viewer','voice'
]);
const INTERACTIVE_TYPES=new Set(['tool','control','surface-control','menu-item']);
class UIRegistry{
 constructor(opts={}){this.components=new Map();this.defaults={...DEFAULT_MOTION,...opts.defaults};this.a11yDefaults={...DEFAULT_A11Y,...opts.a11yDefaults};for(const id of SURFACES)this.register({id,type:'surface'});}
 register(input={}){check(input.id&&!this.components.has(input.id),'UI_COMPONENT_EXISTS');const motion={...this.defaults,...(input.motion||{})};for(const k of VISIBLE_STATES)check(motion[k]!=null,`UI_MOTION_${k.toUpperCase()}_REQUIRED`);const accessibility={...this.a11yDefaults,...clone(input.accessibility||{})};const c={id:input.id,type:input.type||'component',area:input.area||null,states:[...(input.states||['idle','active','success','failure','cancelled'])],motion,aurora:input.aurora||null,virtualized:!!input.virtualized,lazy:input.lazy!==false,accessibility,metadata:clone(input.metadata||{})};this.components.set(c.id,c);return clone(c);}
 ensureTool(tool={}){const id=`tool:${tool.id}`;if(this.components.has(id))return this.get(id);return this.register({id,type:'tool',area:'tools',aurora:tool.category==='rpg'?'rpg':tool.category==='coding'?'coding':tool.category==='research'?'research':null,states:['queued','starting','waiting_permission','running','result','success','error','cancelled'],motion:{active:'travelling-highlight',success:'check-morph',failure:'semantic-coral-ring-once',cancel:'opacity-stop'},accessibility:{ariaLive:'polite',minimumTarget:44},metadata:{category:tool.category||'general',risk:tool.risk||'low'}});}
 get(id){const c=this.components.get(id);check(c,'UI_COMPONENT_NOT_FOUND');return clone(c);}
 state(id,state,{reducedMotion=false,lowPower=false}={}){const c=this.components.get(id);check(c,'UI_COMPONENT_NOT_FOUND');check(c.states.includes(state)||['idle','result'].includes(state),'UI_STATE_UNSUPPORTED');let motion=c.motion.active;if(state==='success')motion=c.motion.success;if(state==='failure'||state==='error')motion=c.motion.failure;if(state==='cancelled')motion=c.motion.cancel;if(reducedMotion)motion=c.motion.reducedMotion;else if(lowPower)motion=c.motion.lowPower;const semantic={success:'success',failure:'error',error:'error',cancelled:'neutral',waiting_permission:'warning',running:'progress',starting:'progress',queued:'neutral',result:'neutral',idle:'neutral'}[state]||'neutral';return{id:c.id,state,motion,aurora:c.aurora,semantic,accessibility:clone(c.accessibility)};}
 audit(){const issues=[];for(const c of this.components.values()){for(const k of VISIBLE_STATES)if(c.motion[k]==null)issues.push({id:c.id,missing:k});if((INTERACTIVE_TYPES.has(c.type)||c.type==='tool')&&Number(c.accessibility.minimumTarget||0)<44)issues.push({id:c.id,missing:'minimumTarget44'});if(c.accessibility.keyboard===false)issues.push({id:c.id,missing:'keyboard'});if(c.accessibility.visibleFocus===false)issues.push({id:c.id,missing:'visibleFocus'});}return{pass:issues.length===0,components:this.components.size,surfaces:SURFACES.length,issues};}
 list(type=null){return[...this.components.values()].filter(c=>!type||c.type===type).map(clone);}
}
class ActivityStack{
 constructor(){this.items=[];}
 start(input={}){check(input.id,'ACTIVITY_ID_REQUIRED');const item={id:input.id,title:input.title||input.id,kind:input.kind||'tool',state:'running',startedAt:Date.now(),endedAt:null,summary:null,details:clone(input.details||{}),progress:input.progress??null,collapsed:false};this.items.push(item);return clone(item);}
 update(id,patch={}){const item=this.items.find(x=>x.id===id);check(item,'ACTIVITY_NOT_FOUND');Object.assign(item,clone(patch));if(item.progress!=null)item.progress=Math.max(0,Math.min(1,Number(item.progress)||0));if(['success','failure','cancelled','error'].includes(item.state)&&!item.endedAt)item.endedAt=Date.now();return clone(item);}
 collapseCompleted(){for(const i of this.items)if(['success','failure','cancelled','error'].includes(i.state))i.collapsed=true;return this.summary();}
 summary(){const active=this.items.filter(i=>['running','starting','waiting_permission','queued'].includes(i.state)).length,completed=this.items.length-active;return{active,completed,items:this.items.map(clone)};}
}
class SevenHaloState{
 constructor(){this.state={mode:'idle',label:'Seven',count:null,detail:null};}
 set(mode,input={}){const labels={idle:'Seven',thinking:'Thinking',research:'Research',coding:'Agent',rpg:'RPG',success:'Completed',error:'Error',warning:'Attention'};this.state={mode,label:input.label||labels[mode]||mode,count:input.count??null,detail:input.detail||null,aurora:mode==='research'?'research':mode==='coding'?'coding':mode==='rpg'?'rpg':mode==='thinking'?'thinking':mode};return clone(this.state);}
 compact(){const s=this.state;return`${['thinking','research','coding'].includes(s.mode)?'◌':'◉'} ${s.label}${s.count!=null?` · ${s.count}`:''}`;}
}
return{VISIBLE_STATES,DEFAULT_MOTION,DEFAULT_A11Y,SURFACES,UIRegistry,ActivityStack,SevenHaloState};
});