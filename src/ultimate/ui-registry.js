(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateUIRegistry=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
const VISIBLE_STATES=Object.freeze(['appearance','enter','active','success','failure','cancel','exit','reducedMotion','lowPower']);
const DEFAULT_MOTION=Object.freeze({appearance:'stable',enter:'standard-fade-rise',active:'state-specific',success:'check-morph',failure:'semantic-coral-once',cancel:'stop-and-fade',exit:'quick-fade',reducedMotion:'opacity-only',lowPower:'quick-fade'});
const SURFACES=Object.freeze(['home','chat','composer','halo','deep_thinking','search','research','sources','coding','files','editor','diff','terminal','tests','git','agent','artifact','projects','memory','tools','models','providers','evals','settings','notifications','permissions','errors','backup','import','rpg_library','rpg_home','rpg_story','rpg_scene_capsule','rpg_character','rpg_cast_atlas','rpg_relationships','rpg_chronicle','rpg_story_atlas','rpg_plot_board','rpg_journal','rpg_world','rpg_rumors','rpg_knowledge','rpg_flashback','rpg_episode_end','media','voice']);
class UIRegistry{
 constructor(opts={}){this.components=new Map();this.defaults={...DEFAULT_MOTION,...opts.defaults};for(const id of SURFACES)this.register({id,type:'surface'});}
 register(input={}){check(input.id&&!this.components.has(input.id),'UI_COMPONENT_EXISTS');const motion={...this.defaults,...(input.motion||{})};for(const k of VISIBLE_STATES)check(motion[k]!=null,`UI_MOTION_${k.toUpperCase()}_REQUIRED`);const c={id:input.id,type:input.type||'component',area:input.area||null,states:[...(input.states||['idle','active','success','failure','cancelled'])],motion,aurora:input.aurora||null,virtualized:!!input.virtualized,lazy:input.lazy!==false,metadata:clone(input.metadata||{})};this.components.set(c.id,c);return clone(c);}
 ensureTool(tool={}){const id=`tool:${tool.id}`;if(this.components.has(id))return this.get(id);return this.register({id,type:'tool',area:'tools',aurora:tool.category==='rpg'?'rpg':tool.category==='coding'?'coding':tool.category==='research'?'research':null,states:['queued','starting','waiting_permission','running','result','success','error','cancelled'],motion:{active:'travelling-highlight',success:'check-morph',failure:'semantic-coral-ring-once',cancel:'opacity-stop'}});}
 get(id){const c=this.components.get(id);check(c,'UI_COMPONENT_NOT_FOUND');return clone(c);}
 state(id,state,{reducedMotion=false,lowPower=false}={}){const c=this.components.get(id);check(c,'UI_COMPONENT_NOT_FOUND');check(c.states.includes(state)||['idle','result'].includes(state),'UI_STATE_UNSUPPORTED');let motion=c.motion.active;if(state==='success')motion=c.motion.success;if(state==='failure'||state==='error')motion=c.motion.failure;if(state==='cancelled')motion=c.motion.cancel;if(reducedMotion)motion=c.motion.reducedMotion;else if(lowPower)motion=c.motion.lowPower;return{id:c.id,state,motion,aurora:c.aurora};}
 audit(){const issues=[];for(const c of this.components.values())for(const k of VISIBLE_STATES)if(c.motion[k]==null)issues.push({id:c.id,missing:k});return{pass:issues.length===0,components:this.components.size,issues};}
 list(type=null){return[...this.components.values()].filter(c=>!type||c.type===type).map(clone);}
}
class ActivityStack{
 constructor(){this.items=[];}
 start(input={}){check(input.id,'ACTIVITY_ID_REQUIRED');const item={id:input.id,title:input.title||input.id,kind:input.kind||'tool',state:'running',startedAt:Date.now(),endedAt:null,summary:null,details:clone(input.details||{}),collapsed:false};this.items.push(item);return clone(item);}
 update(id,patch={}){const item=this.items.find(x=>x.id===id);check(item,'ACTIVITY_NOT_FOUND');Object.assign(item,clone(patch));if(['success','failure','cancelled','error'].includes(item.state)&&!item.endedAt)item.endedAt=Date.now();return clone(item);}
 collapseCompleted(){for(const i of this.items)if(['success','failure','cancelled','error'].includes(i.state))i.collapsed=true;return this.summary();}
 summary(){const active=this.items.filter(i=>i.state==='running').length,completed=this.items.length-active;return{active,completed,items:this.items.map(clone)};}
}
class SevenHaloState{
 constructor(){this.state={mode:'idle',label:'Seven',count:null,detail:null};}
 set(mode,input={}){const labels={idle:'Seven',thinking:'Thinking',research:'Research',coding:'Agent',rpg:'RPG',success:'Completed',error:'Error'};this.state={mode,label:input.label||labels[mode]||mode,count:input.count??null,detail:input.detail||null,aurora:mode==='research'?'research':mode==='coding'?'coding':mode==='rpg'?'rpg':mode==='thinking'?'thinking':mode};return clone(this.state);}
 compact(){const s=this.state;return`${['thinking','research','coding'].includes(s.mode)?'◌':'◉'} ${s.label}${s.count!=null?` · ${s.count}`:''}`;}
}
return{VISIBLE_STATES,DEFAULT_MOTION,SURFACES,UIRegistry,ActivityStack,SevenHaloState};
});