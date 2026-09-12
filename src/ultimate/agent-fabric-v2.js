(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateAgentFabricV2=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
const PATTERNS=Object.freeze(['single','sequential','concurrent','handoff','supervisor','group_review','tree_search']);
const VISIBILITY=Object.freeze(['full','read_only','hidden']);

class AgentRegistry{
 constructor(){this.agents=new Map();}
 register(input={}){check(input.id&&!this.agents.has(input.id),'AGENT_ID_REQUIRED');const row={id:input.id,name:input.name||input.id,role:input.role||'general',capabilities:[...(input.capabilities||[])],tools:[...(input.tools||[])],modelRole:input.modelRole||input.role||'general',visibility:input.visibility||'full',authority:input.authority||'derived_only',maxDepth:Number(input.maxDepth??3),metadata:clone(input.metadata||{})};check(VISIBILITY.includes(row.visibility),'AGENT_VISIBILITY');this.agents.set(row.id,row);return clone(row);}
 get(id){const row=this.agents.get(id);check(row,'AGENT_NOT_FOUND');return clone(row);}
 match(input={}){const caps=new Set(input.capabilities||[]),role=input.role||null;return[...this.agents.values()].filter(a=>(!role||a.role===role||a.role==='general')&&[...caps].every(c=>a.capabilities.includes(c))).map(clone);}
}

class SharedBlackboard{
 constructor(){this.entries=new Map();this.history=[];}
 write(input={}){check(input.key,'BLACKBOARD_KEY_REQUIRED');const existing=this.entries.get(input.key),authority=input.authority||'derived',lineage=[...(input.lineage||[])];if(authority==='authoritative')check(lineage.length||input.sourceEventRef,'AUTHORITATIVE_LINEAGE_REQUIRED');if(existing?.authority==='authoritative'&&authority!=='authoritative')throw new Error('DERIVED_CANNOT_OVERWRITE_AUTHORITATIVE');const row={key:input.key,value:clone(input.value),authority,lineage,sourceEventRef:input.sourceEventRef||null,writer:input.writer||null,visibility:input.visibility||'full',version:(existing?.version||0)+1,at:Date.now()};check(VISIBILITY.includes(row.visibility),'BLACKBOARD_VISIBILITY');this.entries.set(row.key,row);this.history.push({key:row.key,version:row.version,authority:row.authority,writer:row.writer,at:row.at});return clone(row);}
 read(key,input={}){const row=this.entries.get(key);if(!row)return null;if(row.visibility==='hidden'&&input.includeHidden!==true)return null;return clone(row);}
 snapshot(input={}){return[...this.entries.values()].filter(x=>x.visibility!=='hidden'||input.includeHidden===true).map(clone);}
}

class TaskGraph{
 constructor(){this.tasks=new Map();}
 add(input={}){check(input.id&&!this.tasks.has(input.id),'TASK_ID_REQUIRED');const t={id:input.id,label:input.label||input.id,kind:input.kind||'work',requires:[...(input.requires||[])],capabilities:[...(input.capabilities||[])],preferredRole:input.preferredRole||null,state:'pending',attempts:0,maxAttempts:Number(input.maxAttempts??2),agentId:null,result:null,error:null,priority:Number(input.priority||0),metadata:clone(input.metadata||{})};this.tasks.set(t.id,t);return clone(t);}
 _depsDone(t){return t.requires.every(id=>this.tasks.get(id)?.state==='success');}
 runnable(){return[...this.tasks.values()].filter(t=>t.state==='pending'&&this._depsDone(t)).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id)).map(clone);}
 start(id,agentId){const t=this.tasks.get(id);check(t&&t.state==='pending'&&this._depsDone(t),'TASK_NOT_RUNNABLE');t.state='running';t.agentId=agentId;t.attempts++;return clone(t);}
 finish(id,input={}){const t=this.tasks.get(id);check(t&&t.state==='running','TASK_NOT_RUNNING');if(input.success===false){t.error=input.error||'failed';t.state=t.attempts<t.maxAttempts?'pending':'failed';}else{t.state='success';t.result=clone(input.result);}return clone(t);}
 blocked(){return[...this.tasks.values()].filter(t=>t.state==='pending'&&!this._depsDone(t)).map(clone);}
 done(){return[...this.tasks.values()].every(t=>['success','failed','cancelled'].includes(t.state));}
 hasDeadlock(){return!this.done()&&!this.runnable().length&&![...this.tasks.values()].some(t=>t.state==='running');}
 snapshot(){return[...this.tasks.values()].map(clone);}
}

class BudgetLedger{
 constructor(input={}){this.limits={modelCalls:Number(input.modelCalls??24),toolCalls:Number(input.toolCalls??64),tokens:Number(input.tokens??120000),wallMs:Number(input.wallMs??180000),parallel:Number(input.parallel??4),depth:Number(input.depth??4),rounds:Number(input.rounds??8)};this.used={modelCalls:0,toolCalls:0,tokens:0,startedAt:Date.now(),active:0,maxDepth:0,rounds:0};}
 consume(kind,amount=1){check(kind in this.limits,'BUDGET_KIND');const n=Number(amount||0);if(kind==='wallMs')return this.remaining(kind);check((this.used[kind]||0)+n<=this.limits[kind],`BUDGET_EXCEEDED:${kind}`);this.used[kind]=(this.used[kind]||0)+n;return this.remaining(kind);}
 enter(depth=0){check(this.used.active+1<=this.limits.parallel,'BUDGET_EXCEEDED:parallel');check(depth<=this.limits.depth,'BUDGET_EXCEEDED:depth');this.used.active++;this.used.maxDepth=Math.max(this.used.maxDepth,depth);}
 leave(){this.used.active=Math.max(0,this.used.active-1);}
 round(){check(this.used.rounds+1<=this.limits.rounds,'BUDGET_EXCEEDED:rounds');this.used.rounds++;}
 remaining(kind){if(kind==='wallMs')return Math.max(0,this.limits.wallMs-(Date.now()-this.used.startedAt));if(kind==='parallel')return Math.max(0,this.limits.parallel-this.used.active);return Math.max(0,this.limits[kind]-(this.used[kind]||0));}
 audit(){const elapsed=Date.now()-this.used.startedAt;return{pass:elapsed<=this.limits.wallMs&&['modelCalls','toolCalls','tokens'].every(k=>(this.used[k]||0)<=this.limits[k]),limits:clone(this.limits),used:{...clone(this.used),elapsedMs:elapsed}};}
}

class HandoffContract{
 create(input={}){check(input.from&&input.to&&input.taskId,'HANDOFF_REQUIRED');const visibility=input.visibility||'read_only';check(VISIBILITY.includes(visibility),'HANDOFF_VISIBILITY');return{id:input.id||`${input.from}->${input.to}:${input.taskId}`,from:input.from,to:input.to,taskId:input.taskId,reason:input.reason||null,contextKeys:[...(input.contextKeys||[])],visibility,ownership:input.ownership||'task_only',returnControl:input.returnControl!==false,createdAt:Date.now()};}
 validate(contract,registry){registry.get(contract.from);registry.get(contract.to);return{pass:contract.from!==contract.to&&contract.contextKeys.length<=64,issues:[contract.from===contract.to?'SELF_HANDOFF':null,contract.contextKeys.length>64?'CONTEXT_SCOPE_TOO_LARGE':null].filter(Boolean)};}
}

class ReflectionStore{
 constructor(){this.rows=[];}
 add(input={}){check(input.verified===true,'REFLECTION_MUST_BE_VERIFIED');check(input.taskType&&input.lesson,'REFLECTION_REQUIRED');const row={id:input.id||`reflection_${this.rows.length+1}`,taskType:input.taskType,lesson:String(input.lesson),trigger:input.trigger||null,pattern:input.pattern||null,sourceRunId:input.sourceRunId||null,score:clamp(input.score??.5),verified:true,at:Date.now()};this.rows.push(row);return clone(row);}
 retrieve(taskType,limit=6){return this.rows.filter(r=>r.taskType===taskType).sort((a,b)=>b.score-a.score||b.at-a.at).slice(0,limit).map(clone);}
}

class WorkflowOutcomeLearner{
 constructor(){this.rows=new Map();}
 record(input={}){check(input.verified===true,'WORKFLOW_OUTCOME_MUST_BE_VERIFIED');const k=`${input.taskType||'general'}|${input.pattern}`,r=this.rows.get(k)||{wins:0,total:0,latency:0,cost:0};r.total++;if(input.success)r.wins++;r.latency=((r.latency*(r.total-1))+Number(input.latencyMs||0))/r.total;r.cost=((r.cost*(r.total-1))+Number(input.cost||0))/r.total;this.rows.set(k,r);return clone(r);}
 recommend(taskType,patterns=PATTERNS){return patterns.map(pattern=>{const r=this.rows.get(`${taskType}|${pattern}`)||{wins:1,total:2,latency:0,cost:0};const success=r.wins/r.total,latencyPenalty=Math.min(.25,r.latency/120000),costPenalty=Math.min(.2,r.cost/10);return{pattern,score:+(success-latencyPenalty-costPenalty).toFixed(4),samples:r.total};}).sort((a,b)=>b.score-a.score);}
}

class OrchestrationPlanner{
 constructor(input={}){this.learner=input.learner||new WorkflowOutcomeLearner();}
 choose(input={}){const taskType=input.taskType||'general',subtasks=Math.max(1,Number(input.subtasks||1)),independence=clamp(input.independence??0),specialization=clamp(input.specialization??.4),uncertainty=clamp(input.uncertainty??.3),complexity=clamp(input.complexity??.4),latency=clamp(input.latencyPriority??.5);let pattern='single';if(subtasks>1&&independence>.65)pattern='concurrent';else if(subtasks>1&&specialization>.7&&input.transferOwnership)pattern='handoff';else if(subtasks>2&&complexity>.65)pattern='supervisor';else if(uncertainty>.7&&input.reviewValue!==false)pattern='group_review';else if(complexity>.82&&latency<.55)pattern='tree_search';else if(subtasks>1)pattern='sequential';const learned=this.learner.recommend(taskType);if(input.allowLearnedOverride!==false&&learned[0]?.samples>=5&&learned[0].score>.72)pattern=learned[0].pattern;return{pattern,taskType,reason:{subtasks,independence,specialization,uncertainty,complexity,latency},learnedTop:learned[0],authority:'derived_orchestration_plan'};}
}

class AgentFabricV2{
 constructor(input={}){this.registry=input.registry||new AgentRegistry();this.blackboard=input.blackboard||new SharedBlackboard();this.reflections=input.reflections||new ReflectionStore();this.learner=input.learner||new WorkflowOutcomeLearner();this.planner=input.planner||new OrchestrationPlanner({learner:this.learner});this.handoffs=new HandoffContract();this.runs=new Map();this.killed=false;}
 kill(reason='USER_STOP'){this.killed=true;for(const r of this.runs.values())if(r.status==='running'){r.status='cancelled';r.events.push({type:'killed',reason,at:Date.now()});}return true;}
 resetKill(){this.killed=false;}
 createRun(input={}){check(input.id&&!this.runs.has(input.id),'AGENT_RUN_EXISTS');const graph=input.graph||new TaskGraph(),budget=input.budget||new BudgetLedger(input.limits||{}),plan=this.planner.choose(input),run={id:input.id,taskType:input.taskType||'general',status:'running',pattern:plan.pattern,plan,graph,budget,events:[{type:'created',at:Date.now(),pattern:plan.pattern}],checkpoint:0,startedAt:Date.now()};this.runs.set(run.id,run);return run;}
 checkpoint(runId){const r=this.runs.get(runId);check(r,'AGENT_RUN_NOT_FOUND');r.checkpoint++;const snap={runId,checkpoint:r.checkpoint,status:r.status,pattern:r.pattern,tasks:r.graph.snapshot(),budget:r.budget.audit(),blackboard:this.blackboard.snapshot({includeHidden:true}),at:Date.now()};r.events.push({type:'checkpoint',at:snap.at,checkpoint:r.checkpoint});return clone(snap);}
 _pickAgent(task){const matches=this.registry.match({role:task.preferredRole,capabilities:task.capabilities});return matches[0]||this.registry.match({capabilities:task.capabilities})[0]||null;}
 async execute(input={}){check(typeof input.executor==='function','AGENT_EXECUTOR_REQUIRED');const run=input.run||this.createRun(input);const runOne=async task=>{if(this.killed)return;const agent=this._pickAgent(task);check(agent,'NO_AGENT_FOR_TASK');run.budget.enter(Number(task.metadata?.depth||0));try{run.graph.start(task.id,agent.id);run.events.push({type:'task_start',taskId:task.id,agentId:agent.id,at:Date.now()});const result=await input.executor({task:clone(task),agent:clone(agent),blackboard:this.blackboard,budget:run.budget,reflections:this.reflections.retrieve(run.taskType)});if(result?.modelCalls)run.budget.consume('modelCalls',result.modelCalls);if(result?.toolCalls)run.budget.consume('toolCalls',result.toolCalls);if(result?.tokens)run.budget.consume('tokens',result.tokens);run.graph.finish(task.id,{success:result?.success!==false,result:result?.result,error:result?.error});run.events.push({type:result?.success===false?'task_fail':'task_end',taskId:task.id,agentId:agent.id,at:Date.now()});}finally{run.budget.leave();}};while(!run.graph.done()&&!this.killed){check(run.budget.remaining('wallMs')>0,'BUDGET_EXCEEDED:wallMs');run.budget.round();const ready=run.graph.runnable();if(!ready.length){if(run.graph.hasDeadlock()){run.status='deadlocked';run.events.push({type:'deadlock',at:Date.now(),blocked:run.graph.blocked().map(x=>x.id)});break;}await new Promise(r=>setTimeout(r,0));continue;}const parallel=run.pattern==='concurrent'||run.pattern==='supervisor'||run.pattern==='group_review',batch=parallel?ready.slice(0,Math.max(1,run.budget.remaining('parallel'))):ready.slice(0,1);await Promise.all(batch.map(runOne));}if(this.killed)run.status='cancelled';else if(run.status!=='deadlocked')run.status=run.graph.snapshot().some(t=>t.state==='failed')?'failed':'completed';const latency=Date.now()-run.startedAt;run.events.push({type:'finished',status:run.status,at:Date.now(),latencyMs:latency});if(input.verifiedOutcome?.verified===true)this.learner.record({taskType:run.taskType,pattern:run.pattern,verified:true,success:run.status==='completed'&&input.verifiedOutcome.success!==false,latencyMs:latency,cost:input.verifiedOutcome.cost||0});return this.snapshot(run.id);}
 snapshot(runId){const r=this.runs.get(runId);check(r,'AGENT_RUN_NOT_FOUND');return{id:r.id,taskType:r.taskType,status:r.status,pattern:r.pattern,plan:clone(r.plan),tasks:r.graph.snapshot(),budget:r.budget.audit(),events:clone(r.events),checkpoint:r.checkpoint,authority:'derived_agent_run'};}
}

return{PATTERNS,VISIBILITY,AgentRegistry,SharedBlackboard,TaskGraph,BudgetLedger,HandoffContract,ReflectionStore,WorkflowOutcomeLearner,OrchestrationPlanner,AgentFabricV2};
});