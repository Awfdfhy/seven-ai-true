(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateCodingStudio=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
const MODES=Object.freeze(['ask','plan','agent','debug','review']);
const ACTIVITY=Object.freeze(['explorer','search','source_control','runs','agents','problems']);
const BOTTOM=Object.freeze(['terminal','tests','problems','output']);
function layoutFor(width){const w=Number(width||1280);if(w<760)return{kind:'phone',activityRail:false,projectPanel:'sheet',agentDock:'surface',bottomDock:'surface',editor:'surface'};if(w<1100)return{kind:'compact',activityRail:true,projectPanel:'overlay',agentDock:'overlay',bottomDock:'dock',editor:'primary'};return{kind:'desktop',activityRail:true,projectPanel:'dock',agentDock:'dock',bottomDock:'dock',editor:'primary'};}
class ChangeSet{
 constructor(input={}){this.id=input.id||`changes_${Date.now()}`;this.files=new Map();this.status='open';}
 addFile(input={}){check(input.path,'CHANGE_FILE_PATH_REQUIRED');const hunks=(input.hunks||[]).map((h,i)=>({id:h.id||`${input.path}:${i}`,summary:h.summary||'',added:Number(h.added||0),removed:Number(h.removed||0),status:h.status||'pending',before:h.before||null,after:h.after||null}));this.files.set(input.path,{path:input.path,status:'changed',hunks});return this.file(input.path);}
 file(path){const f=this.files.get(path);check(f,'CHANGE_FILE_NOT_FOUND');return clone(f);}
 decide(path,hunkId,decision){check(['accepted','rejected','pending'].includes(decision),'CHANGE_DECISION');const f=this.files.get(path);check(f,'CHANGE_FILE_NOT_FOUND');const h=f.hunks.find(x=>x.id===hunkId);check(h,'CHANGE_HUNK_NOT_FOUND');h.status=decision;f.status=f.hunks.every(x=>x.status==='accepted')?'accepted':f.hunks.every(x=>x.status==='rejected')?'rejected':'changed';return clone(h);}
 summary(){const files=[...this.files.values()],hunks=files.flatMap(f=>f.hunks);return{files:files.length,added:hunks.reduce((n,h)=>n+h.added,0),removed:hunks.reduce((n,h)=>n+h.removed,0),pending:hunks.filter(h=>h.status==='pending').length,accepted:hunks.filter(h=>h.status==='accepted').length,rejected:hunks.filter(h=>h.status==='rejected').length,status:this.status};}
}
class AgentThread{
 constructor(input={}){check(input.id,'CODING_THREAD_ID_REQUIRED');this.id=input.id;this.title=input.title||input.id;this.mode=input.mode||'agent';check(MODES.includes(this.mode),'CODING_MODE');this.status=input.status||'idle';this.goal=input.goal||'';this.steps=[];this.queue=[];this.toolActivity=[];this.evidence={tests:null,syntax:null,diff:null,review:null};this.startedAt=input.startedAt||Date.now();}
 setMode(mode){check(MODES.includes(mode),'CODING_MODE');this.mode=mode;return this.snapshot();}
 step(input={}){check(input.id,'CODING_STEP_ID_REQUIRED');const s={id:input.id,label:input.label||input.id,state:input.state||'queued',detail:input.detail||null,startedAt:input.startedAt||null,endedAt:input.endedAt||null};const i=this.steps.findIndex(x=>x.id===s.id);if(i>=0)this.steps[i]={...this.steps[i],...s};else this.steps.push(s);return clone(s);}
 activity(input={}){check(input.id,'CODING_ACTIVITY_ID_REQUIRED');const a={id:input.id,title:input.title||input.id,kind:input.kind||'tool',state:input.state||'running',summary:input.summary||null,progress:input.progress??null};const i=this.toolActivity.findIndex(x=>x.id===a.id);if(i>=0)this.toolActivity[i]={...this.toolActivity[i],...a};else this.toolActivity.push(a);return clone(a);}
 enqueue(text){const q={id:`queue_${Date.now()}_${this.queue.length}`,text:String(text),state:'queued'};this.queue.push(q);return clone(q);}
 snapshot(){return clone({id:this.id,title:this.title,mode:this.mode,status:this.status,goal:this.goal,steps:this.steps,queue:this.queue,toolActivity:this.toolActivity,evidence:this.evidence,startedAt:this.startedAt});}
}
class CodingStudioState{
 constructor(input={}){this.projectId=input.projectId||null;this.activity=input.activity||'explorer';this.projectPanel=true;this.agentDock=true;this.bottomDock=input.bottomDock||'terminal';this.bottomOpen=true;this.activeFile=input.activeFile||null;this.previewFile=null;this.tabs=[];this.files=[];this.threads=new Map();this.activeThreadId=null;this.terminals=new Map();this.changeSets=new Map();this.branch=input.branch||'main';this.sandbox=input.sandbox||'workspace-write';this.modelRole=input.modelRole||'coding';this.latency=null;}
 setActivity(id){check(ACTIVITY.includes(id),'CODING_ACTIVITY');this.activity=id;return id;}
 openFile(path,input={}){check(path,'CODING_FILE_PATH_REQUIRED');if(input.preview!==false&&!this.tabs.includes(path)){this.previewFile=path;this.activeFile=path;return{path,preview:true};}if(!this.tabs.includes(path))this.tabs.push(path);this.previewFile=null;this.activeFile=path;return{path,preview:false};}
 pinPreview(){if(this.previewFile&&!this.tabs.includes(this.previewFile))this.tabs.push(this.previewFile);const path=this.previewFile;this.previewFile=null;return path;}
 closeFile(path){this.tabs=this.tabs.filter(x=>x!==path);if(this.previewFile===path)this.previewFile=null;if(this.activeFile===path)this.activeFile=this.tabs[this.tabs.length-1]||this.previewFile||null;return this.activeFile;}
 createThread(input={}){const t=new AgentThread(input);check(!this.threads.has(t.id),'CODING_THREAD_EXISTS');this.threads.set(t.id,t);this.activeThreadId=t.id;return t;}
 thread(id=this.activeThreadId){const t=this.threads.get(id);check(t,'CODING_THREAD_NOT_FOUND');return t;}
 createTerminal(input={}){const id=input.id||`terminal_${this.terminals.size+1}`;check(!this.terminals.has(id),'TERMINAL_EXISTS');const row={id,title:input.title||`Terminal ${this.terminals.size+1}`,state:'idle',command:null,lines:[],exitCode:null,collapsed:false};this.terminals.set(id,row);return clone(row);}
 terminalEvent(id,input={}){const t=this.terminals.get(id);check(t,'TERMINAL_NOT_FOUND');if(input.command!=null)t.command=String(input.command);if(input.line!=null)t.lines.push(String(input.line));if(input.state)t.state=input.state;if(input.exitCode!=null)t.exitCode=Number(input.exitCode);return clone(t);}
 createChangeSet(input={}){const c=new ChangeSet(input);this.changeSets.set(c.id,c);return c;}
 view(width=1280){const thread=this.activeThreadId?this.thread().snapshot():null;return{layout:layoutFor(width),projectId:this.projectId,activity:this.activity,panels:{project:this.projectPanel,agent:this.agentDock,bottom:this.bottomOpen?this.bottomDock:null},editor:{activeFile:this.activeFile,previewFile:this.previewFile,tabs:[...this.tabs]},agent:thread,terminals:[...this.terminals.values()].map(clone),changes:[...this.changeSets.values()].map(c=>({id:c.id,...c.summary()})),status:{branch:this.branch,sandbox:this.sandbox,modelRole:this.modelRole,latency:this.latency},authority:'derived_coding_ui_state'};}
}
class CodingStudioPresentation{
 constructor(opts={}){this.state=opts.state||new CodingStudioState(opts);}
 runFromAgent(agentRun={}){const id=agentRun.id||`run_${Date.now()}`,t=this.state.threads.get(id)||this.state.createThread({id,title:agentRun.goal||'Agent task',mode:'agent',goal:agentRun.goal||''});t.status=agentRun.status||t.status;for(const e of agentRun.events||[]){if(e.type==='step_start')t.step({id:e.data?.step||e.data?.payload?.step||`step_${t.steps.length}`,label:e.data?.step||'Working',state:'running',startedAt:e.at});if(e.type==='step_end'){const step=e.data?.step||t.steps.at(-1)?.id||`step_${t.steps.length}`;t.step({id:step,label:step,state:'success',endedAt:e.at});}if(e.type==='error')t.activity({id:`error_${e.at}`,title:'Agent error',kind:'error',state:'error',summary:e.data?.message||''});}t.evidence=clone(agentRun.evidence||t.evidence);return t.snapshot();}
 card(){const t=this.state.activeThreadId?this.state.thread().snapshot():null;if(!t)return{mode:'agent',title:'Coding Agent',status:'idle',primary:'Ready',steps:[],activity:[]};return{mode:t.mode,title:t.title,status:t.status,primary:t.goal,steps:t.steps,activity:t.toolActivity,evidence:t.evidence,queue:t.queue};}
}
return{MODES,ACTIVITY,BOTTOM,layoutFor,ChangeSet,AgentThread,CodingStudioState,CodingStudioPresentation};
});
