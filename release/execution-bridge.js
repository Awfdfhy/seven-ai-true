(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenExecution=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='1.0.0';
  const TERMINAL=new Set(['COMPLETED','INCONCLUSIVE','FAILED','CANCELLED']);
  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function arr(v){return Array.isArray(v)?v:[];}
  function id(prefix){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;}
  function control(){if(!root||!root.SevenControl)throw new Error('SevenControl runtime required');return root.SevenControl;}
  function runtime(){if(!root||!root.SevenRuntime)throw new Error('SevenRuntime v4 required');return root.SevenRuntime;}
  function isTerminal(run){return !!(run&&run.task&&TERMINAL.has(run.task.state));}
  function normalizePath(v){return String(v||'').replace(/\\/g,'/').replace(/^\.\//,'').replace(/\/+/g,'/');}
  function fileInScope(path,allowed){
    const target=normalizePath(path);if(!target)return true;const list=arr(allowed).map(normalizePath).filter(Boolean);if(!list.length)return true;
    return list.some(base=>target===base||target.startsWith(base.replace(/\/$/,'')+'/'));
  }
  function domainInScope(url,allowed){
    if(!url)return true;const list=arr(allowed).map(x=>String(x||'').toLowerCase().replace(/^\.+/,'')).filter(Boolean);if(!list.length)return true;
    let host;try{host=new URL(String(url)).hostname.toLowerCase();}catch{return false;}
    return list.some(domain=>host===domain||host.endsWith('.'+domain));
  }
  function scopeDecision(task,args){
    const scope=task&&task.scope||{};args=args||{};
    const file=args.path||args.file||args.filePath||null;
    const url=args.url||args.href||null;
    if(file&&!fileInScope(file,scope.files))return {allowed:false,reason:'file-outside-task-scope'};
    if(url&&!domainInScope(url,scope.externalDomains))return {allowed:false,reason:'domain-outside-task-scope'};
    return {allowed:true,reason:'within-task-scope'};
  }
  function authorizeTool({task,tool,args,grant}={}){
    if(!task||!tool)return {allowed:false,reason:'missing-task-or-tool'};
    const capability=String(tool.capability||tool.id||'').trim();
    const cap=control().canUseCapability(task,capability);
    if(!cap.allowed)return {allowed:false,reason:'task-capability:'+cap.reason,capability};
    const scope=scopeDecision(task,args);if(!scope.allowed)return {...scope,capability};
    let gate;try{gate=runtime().gateTool(tool,args||{},grant||null);}catch(e){return {allowed:false,reason:'runtime-gate-error',detail:String(e&&e.message||e),capability};}
    if(!gate||!gate.allowed)return {allowed:false,reason:'runtime-gate:'+(gate&&gate.reason||'denied'),capability,gate:clone(gate||null)};
    return {allowed:true,reason:'authorized',capability,gate:clone(gate)};
  }
  function createRun(taskInput,opts){
    opts=opts||{};const c=control();
    let task=taskInput&&taskInput.schemaVersion?clone(taskInput):c.createTaskContract(taskInput||{});
    if(task.state!=='CREATED')throw new Error('new execution run requires CREATED task');
    task=c.transitionTask(task,'PLANNING',{reason:'execution-run-created'});
    return {schemaVersion:1,id:String(opts.id||id('run')),createdAt:opts.createdAt||new Date().toISOString(),updatedAt:opts.createdAt||new Date().toISOString(),task,sequence:0,calls:[],events:[],verification:{status:'PENDING',evidence:[]},effects:c.createSideEffectLedger().snapshot(),cancelIntent:null};
  }
  function hydrateLedger(run){return control().createSideEffectLedger(arr(run&&run.effects));}
  function appendEvent(run,type,data,opts){
    opts=opts||{};if(!run)throw new Error('run required');
    if(isTerminal(run)&&!opts.allowTerminal)throw new Error('late event rejected for terminal run');
    run.sequence=Number(run.sequence||0)+1;run.updatedAt=opts.at||new Date().toISOString();
    const event={id:`${run.id}:e${run.sequence}`,sequence:run.sequence,type:String(type),at:run.updatedAt,data:clone(data||null)};
    run.events.push(event);return clone(event);
  }
  function transition(run,next,reason){
    if(!run)throw new Error('run required');run.task=control().transitionTask(run.task,next,{reason});appendEvent(run,'task.transition',{state:next,reason},{allowTerminal:next==='CANCELLED'||next==='FAILED'||next==='INCONCLUSIVE'||next==='COMPLETED'});return run;
  }
  function startExecution(run){if(run.task.state==='PLANNING')transition(run,'EXECUTING','execution-started');return run;}
  function planToolCall({run,tool,args,grant,idempotencyKey}={}){
    if(!run)throw new Error('run required');if(isTerminal(run))throw new Error('cannot plan tool call for terminal run');
    if(run.task.state==='PLANNING')startExecution(run);if(run.task.state!=='EXECUTING')throw new Error('tool calls require EXECUTING state');
    const authorization=authorizeTool({task:run.task,tool,args,grant});
    const call={id:id('call'),toolId:tool&&tool.id||null,capability:tool&&tool.capability||tool&&tool.id||null,args:clone(args||{}),status:authorization.allowed?'PLANNED':'BLOCKED',authorization,createdAt:new Date().toISOString(),effectKey:null};
    if(!authorization.allowed){run.calls.push(call);appendEvent(run,'tool.blocked',{callId:call.id,reason:authorization.reason});return {allowed:false,call:clone(call),run};}
    const sideEffect=tool&&(['side_effect','write','destructive'].includes(String(tool.risk||'').toLowerCase())||tool.sideEffect===true||tool.write===true);
    if(sideEffect){
      const key=String(idempotencyKey||'').trim();if(!key)throw new Error('side-effecting tool call requires idempotencyKey');
      const ledger=hydrateLedger(run);ledger.plan({idempotencyKey:key,taskId:run.task.id,capability:call.capability,target:{toolId:call.toolId,args:call.args},reversible:tool.reversible===true});run.effects=ledger.snapshot();call.effectKey=key;
    }
    run.calls.push(call);appendEvent(run,'tool.planned',{callId:call.id,toolId:call.toolId,capability:call.capability,effectKey:call.effectKey});return {allowed:true,call:clone(call),run};
  }
  function findCall(run,callId){const call=arr(run&&run.calls).find(c=>c.id===callId);if(!call)throw new Error('unknown tool call: '+callId);return call;}
  function markToolAttempt(run,callId,meta){
    if(isTerminal(run))throw new Error('late tool attempt rejected');const call=findCall(run,callId);if(call.status!=='PLANNED')throw new Error('tool call is not planned');call.status='ATTEMPTED';call.attempt=clone(meta||{});
    if(call.effectKey){const ledger=hydrateLedger(run);ledger.mutate(call.effectKey,'ATTEMPTED',{requestId:meta&&meta.requestId||null,at:meta&&meta.at});run.effects=ledger.snapshot();}
    appendEvent(run,'tool.attempted',{callId,requestId:meta&&meta.requestId||null});return clone(call);
  }
  function verifyToolCall(run,callId,evidence){
    if(isTerminal(run))throw new Error('late tool verification rejected');const call=findCall(run,callId);if(call.status!=='ATTEMPTED')throw new Error('tool call must be attempted before verification');
    if(call.effectKey){const ledger=hydrateLedger(run);ledger.mutate(call.effectKey,'VERIFIED',{evidence:clone(evidence),at:new Date().toISOString()});run.effects=ledger.snapshot();}
    call.status='VERIFIED';call.evidence=clone(evidence||null);appendEvent(run,'tool.verified',{callId,evidence:clone(evidence||null)});return clone(call);
  }
  function failToolCall(run,callId,reason,uncertain){
    if(isTerminal(run))throw new Error('late tool failure rejected');const call=findCall(run,callId);call.status=uncertain?'UNCERTAIN':'FAILED';call.failureReason=String(reason||'tool-failed');
    if(call.effectKey){const ledger=hydrateLedger(run);const current=ledger.get(call.effectKey);if(current&&current.state==='PLANNED')ledger.mutate(call.effectKey,'FAILED',{reason:call.failureReason});else if(current&&current.state==='ATTEMPTED')ledger.mutate(call.effectKey,uncertain?'UNCERTAIN':'FAILED',{reason:call.failureReason});run.effects=ledger.snapshot();}
    appendEvent(run,uncertain?'tool.uncertain':'tool.failed',{callId,reason:call.failureReason});return clone(call);
  }
  function beginVerification(run){if(run.task.state!=='EXECUTING')throw new Error('verification requires EXECUTING state');transition(run,'VERIFYING','execution-finished');return run;}
  function recordVerification(run,{status,evidence,reason}={}){
    if(run.task.state!=='VERIFYING')throw new Error('run is not VERIFYING');const normalized=String(status||'').toUpperCase();if(!['PASS','INCONCLUSIVE','FAIL'].includes(normalized))throw new Error('invalid verification status');
    run.verification={status:normalized,evidence:arr(evidence).map(clone),reason:reason||null,at:new Date().toISOString()};appendEvent(run,'verification.recorded',run.verification);return clone(run.verification);
  }
  function unresolvedEffects(run){return hydrateLedger(run).unresolved();}
  function canCommit(run){
    if(!run||run.task.state!=='VERIFYING')return {allowed:false,reason:'not-verifying'};
    if(unresolvedEffects(run).length)return {allowed:false,reason:'unresolved-side-effects'};
    if(run.task.verification&&run.task.verification.required!==false&&run.verification.status!=='PASS')return {allowed:false,reason:'verification-not-passed'};
    return {allowed:true,reason:'verified'};
  }
  function beginCommit(run){const gate=canCommit(run);if(!gate.allowed)return gate;transition(run,'COMMITTING','verification-passed');return {allowed:true,run};}
  function completeRun(run,evidenceRef){if(run.task.state!=='COMMITTING')throw new Error('completion requires COMMITTING state');run.task=control().transitionTask(run.task,'COMPLETED',{reason:'commit-complete',evidenceRef:evidenceRef||null});appendEvent(run,'run.completed',{evidenceRef:evidenceRef||null},{allowTerminal:true});return run;}
  function cancelRun(run,reason){if(isTerminal(run))return run;run.cancelIntent={at:new Date().toISOString(),reason:String(reason||'user-cancelled')};run.task=control().transitionTask(run.task,'CANCELLED',{reason:run.cancelIntent.reason});appendEvent(run,'run.cancelled',run.cancelIntent,{allowTerminal:true});return run;}
  function registerTools(tools){return runtime().registerTools(arr(tools));}
  function persistCheckpoint(run,reason){
    if(!run)throw new Error('run required');const r=runtime();const current=r.readRuns();const events=arr(current&&current.events).map(clone);const event={id:id('execution-checkpoint'),kind:'seven-execution-checkpoint-v1',taskId:run.task.id,runId:run.id,state:run.task.state,reason:reason||null,at:new Date().toISOString(),snapshot:clone(run)};
    const ok=r.runLedger([...events,event]);if(!ok)throw new Error('run ledger rejected checkpoint');return clone(event);
  }
  function restoreLatest(taskId){const r=runtime();const events=arr(r.readRuns()&&r.readRuns().events).filter(e=>e&&e.kind==='seven-execution-checkpoint-v1'&&e.taskId===taskId);return events.length?clone(events[events.length-1].snapshot):null;}

  const state={version:VERSION,ready:false,error:null,bootedAt:null};
  function boot(){const c=control(),r=runtime();if(!c.state||!c.state.ready)throw new Error('SevenControl runtime not ready');if(Number(r.version)!==4)throw new Error('SevenRuntime v4 required');state.ready=true;state.error=null;state.bootedAt=new Date().toISOString();return clone(state);}
  function safeBoot(){try{return boot();}catch(e){state.ready=false;state.error=String(e&&e.message||e);return clone(state);}}
  const hasDOM=!!(root&&root.document);if(hasDOM&&root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',safeBoot,{once:true});else safeBoot();
  return {VERSION,state,scopeDecision,authorizeTool,registerTools,createRun,startExecution,planToolCall,markToolAttempt,verifyToolCall,failToolCall,beginVerification,recordVerification,unresolvedEffects,canCommit,beginCommit,completeRun,cancelRun,appendEvent,persistCheckpoint,restoreLatest,boot};
});
