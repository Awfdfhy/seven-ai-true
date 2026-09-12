(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateAgent=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
class VerificationGate{
 constructor(opts={}){this.required=opts.required||['changedFiles','tests','diffInspected','syntax'];}
 evaluate(evidence={}){const checks={changedFiles:Array.isArray(evidence.changedFiles)&&evidence.changedFiles.length>0,tests:evidence.tests?.status==='pass',diffInspected:!!evidence.diffInspected,syntax:evidence.syntax?.status==='pass'};const missing=this.required.filter(k=>!checks[k]);return{state:missing.length?'FAIL':'PASS',checks,missing};}
}
class AgentRun{
 constructor(id,goal){this.id=id;this.goal=goal;this.status='planning';this.events=[{type:'created',at:Date.now(),goal}];this.evidence={changedFiles:[],tests:null,diffInspected:false,syntax:null};this.repairCount=0;}
 event(type,data={}){this.events.push({type,at:Date.now(),data:clone(data)});}
 snapshot(){return clone({id:this.id,goal:this.goal,status:this.status,events:this.events,evidence:this.evidence,repairCount:this.repairCount});}
}
class CodingAgentRuntime{
 constructor(opts={}){this.maxRepairs=opts.maxRepairs??3;this.verifier=opts.verifier||new VerificationGate();this.runs=new Map();}
 create(id,goal){check(id&&!this.runs.has(id),'AGENT_RUN_EXISTS');const r=new AgentRun(id,goal);this.runs.set(id,r);return r;}
 async execute(input={}){check(input.id&&input.goal&&typeof input.executor==='function','AGENT_INPUT_REQUIRED');const run=this.create(input.id,input.goal);const invoke=async(step,payload={})=>{run.status=step;run.event('step_start',{step,payload});const result=await input.executor(step,clone(payload),run.snapshot());run.event('step_end',{step,result});return result||{};};
  try{
   const inspect=await invoke('inspect',input.context||{});run.status='planning';const plan=input.plan||inspect.plan||['edit','test','verify'];run.event('plan',{plan});
   let edit=await invoke('edit',{plan});if(edit.changedFiles)run.evidence.changedFiles=[...new Set([...run.evidence.changedFiles,...edit.changedFiles])];
   if(input.syntax!==false){const syntax=await invoke('syntax',{changedFiles:run.evidence.changedFiles});run.evidence.syntax={status:syntax.pass===false?'fail':'pass',details:clone(syntax)};}
   let tests=await invoke('test',{changedFiles:run.evidence.changedFiles});run.evidence.tests={status:tests.pass?'pass':'fail',details:clone(tests)};
   while(run.evidence.tests.status!=='pass'&&run.repairCount<this.maxRepairs){run.repairCount++;run.status='repairing';const repair=await invoke('repair',{attempt:run.repairCount,failure:tests});if(repair.changedFiles)run.evidence.changedFiles=[...new Set([...run.evidence.changedFiles,...repair.changedFiles])];tests=await invoke('test',{changedFiles:run.evidence.changedFiles,repairAttempt:run.repairCount});run.evidence.tests={status:tests.pass?'pass':'fail',details:clone(tests)};}
   const diff=await invoke('inspect_diff',{changedFiles:run.evidence.changedFiles});run.evidence.diffInspected=diff.inspected!==false;
   const gate=this.verifier.evaluate(run.evidence);run.status=gate.state==='PASS'?'completed':'inconclusive';run.event('verification',gate);return{...run.snapshot(),verification:gate};
  }catch(error){run.status='failed';run.event('error',{message:String(error&&error.message||error)});return{...run.snapshot(),verification:{state:'FAIL',missing:['execution']}};}
 }
 activity(runId){const r=this.runs.get(runId);check(r,'AGENT_RUN_NOT_FOUND');return r.events.map((e,i)=>({id:`${runId}:${i}`,kind:e.type,state:e.type==='step_start'?'running':e.type==='error'?'error':e.type==='verification'&&e.data.state==='PASS'?'success':'completed',data:clone(e.data)}));}
}
return{VerificationGate,CodingAgentRuntime};
});
