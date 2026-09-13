(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.SevenControl=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='4.2.0';
  const hasDOM=!!(root&&root.document);
  const TASK_STATES=Object.freeze(['CREATED','PLANNING','EXECUTING','VERIFYING','COMMITTING','COMPLETED','BLOCKED','INCONCLUSIVE','FAILED','CANCELLED']);
  const TERMINAL=new Set(['COMPLETED','INCONCLUSIVE','FAILED','CANCELLED']);
  const TRANSITIONS=Object.freeze({
    CREATED:new Set(['PLANNING','BLOCKED','CANCELLED','FAILED']),
    PLANNING:new Set(['EXECUTING','BLOCKED','INCONCLUSIVE','CANCELLED','FAILED']),
    EXECUTING:new Set(['VERIFYING','BLOCKED','INCONCLUSIVE','CANCELLED','FAILED']),
    VERIFYING:new Set(['COMMITTING','EXECUTING','BLOCKED','INCONCLUSIVE','CANCELLED','FAILED']),
    COMMITTING:new Set(['COMPLETED','BLOCKED','CANCELLED','FAILED']),
    BLOCKED:new Set(['PLANNING','EXECUTING','VERIFYING','CANCELLED','FAILED','INCONCLUSIVE']),
    INCONCLUSIVE:new Set(),FAILED:new Set(),CANCELLED:new Set(),COMPLETED:new Set()
  });
  const EPISTEMIC_KIND=Object.freeze(['FACT','CLAIM','INFERENCE','ASSUMPTION','UNKNOWN','CONFLICT']);
  const AUTH=Object.freeze({A0:6,A1:5,A2:4,A3:3,A4:2,A5:1,NONE:0});
  const TIERS=Object.freeze({
    lite:Object.freeze({contextScale:.55,concurrency:1,animationScale:.35,allowBackground:false,verificationDepth:1}),
    balanced:Object.freeze({contextScale:.8,concurrency:2,animationScale:.7,allowBackground:false,verificationDepth:2}),
    full:Object.freeze({contextScale:1,concurrency:3,animationScale:1,allowBackground:true,verificationDepth:3})
  });
  const state={version:VERSION,ready:false,tier:'balanced',budget:null,bootedAt:null};
  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function arr(v){return Array.isArray(v)?v:[];}
  function strings(v){return Array.from(new Set(arr(v).map(x=>String(x||'').trim()).filter(Boolean)));}
  function rank(v){const k=String(v||'NONE').toUpperCase();return Object.prototype.hasOwnProperty.call(AUTH,k)?AUTH[k]:0;}
  function authorityName(n){return Object.entries(AUTH).find(([,x])=>x===n)?.[0]||'NONE';}
  function weakest(values){const r=arr(values).map(rank);return authorityName(r.length?Math.min(...r):0);}
  function positive(v,f){const n=Number(v);return Number.isFinite(n)&&n>0?n:f;}
  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function id(prefix){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;}

  function createTaskContract(input){
    input=input||{};const goal=String(input.goal||'').trim();if(!goal)throw new Error('task contract requires goal');
    const allow=strings(input.allowedCapabilities),deny=strings(input.deniedCapabilities);
    const overlap=allow.filter(x=>deny.includes(x));if(overlap.length)throw new Error('capability overlap: '+overlap.join(','));
    return {schemaVersion:1,id:String(input.id||id('task')),createdAt:input.createdAt||new Date().toISOString(),state:'CREATED',goal,intent:String(input.intent||'general'),risk:['low','medium','high','critical'].includes(String(input.risk||'low'))?String(input.risk||'low'):'low',scope:clone(input.scope||{}),allowedCapabilities:allow,deniedCapabilities:deny,budgets:clone(input.budgets||{}),evidence:clone(input.evidence||{}),verification:clone(input.verification||{}),successCriteria:strings(input.successCriteria),stopConditions:strings(input.stopConditions),lineage:clone(input.lineage||{origin:'user'})};
  }
  function canUseCapability(contract,capability){
    const cap=String(capability||'').trim();if(!cap)return {allowed:false,reason:'missing-capability'};
    if(!contract||TERMINAL.has(contract.state))return {allowed:false,reason:'task-not-active'};
    if(arr(contract.deniedCapabilities).includes(cap))return {allowed:false,reason:'explicitly-denied'};
    const allow=arr(contract.allowedCapabilities);if(!allow.length)return {allowed:false,reason:'not-explicitly-allowed'};
    return allow.includes(cap)?{allowed:true,reason:'explicitly-allowed'}:{allowed:false,reason:'outside-capability-scope'};
  }
  function transitionTask(contract,next,meta){
    if(!contract)throw new Error('contract required');next=String(next);meta=meta||{};
    if(!TASK_STATES.includes(next))throw new Error('unknown task state: '+next);
    if(!TRANSITIONS[contract.state]||!TRANSITIONS[contract.state].has(next))throw new Error(`illegal task transition: ${contract.state}->${next}`);
    return {...clone(contract),state:next,transition:{from:contract.state,to:next,at:meta.at||new Date().toISOString(),reason:meta.reason||null,evidenceRef:meta.evidenceRef||null}};
  }

  function normalizeSource(s){if(!s||!s.id)throw new Error('source requires id');return {id:String(s.id),authority:authorityName(rank(s.authority||'A5')),observedAt:s.observedAt||null,capturedAt:s.capturedAt||null,independentGroup:s.independentGroup||s.id,uri:s.uri||null,contentHash:s.contentHash||null,trust:s.trust||'untrusted',metadata:clone(s.metadata||{})};}
  function createClaim(input){
    input=input||{};const text=String(input.text||'').trim();if(!text)throw new Error('claim requires text');
    const kind=String(input.kind||'CLAIM').toUpperCase();if(!EPISTEMIC_KIND.includes(kind))throw new Error('unknown epistemic kind: '+kind);
    const sources=arr(input.sources).map(normalizeSource);const srcAuth=weakest(sources.map(s=>s.authority));
    const declared=authorityName(rank(input.authority||srcAuth));const effective=authorityName(Math.min(rank(declared),rank(srcAuth||declared)));
    return {schemaVersion:1,id:String(input.id||id('claim')),text,kind,status:input.status||'OPEN',authority:effective,sources,evidence:arr(input.evidence).map(clone),lineage:clone(input.lineage||{parents:[],transformation:'direct'}),contradicts:strings(input.contradicts),supports:strings(input.supports),createdAt:input.createdAt||new Date().toISOString(),validFrom:input.validFrom||null,validUntil:input.validUntil||null,metadata:clone(input.metadata||{})};
  }
  function isFresh(claim,now,maxAgeMs){if(!maxAgeMs)return true;const stamps=arr(claim&&claim.sources).map(s=>s.observedAt||s.capturedAt).filter(Boolean).map(Date.parse).filter(Number.isFinite);if(!stamps.length)return false;return (now||Date.now())-Math.max(...stamps)<=maxAgeMs;}
  function independentSourceCount(claim){return new Set(arr(claim&&claim.sources).map(s=>s.independentGroup||s.id)).size;}
  function deriveClaim(input){input=input||{};const parents=arr(input.parents);if(!parents.length)throw new Error('derived claim requires parents');return createClaim({id:input.id,text:input.text,kind:input.kind||'INFERENCE',authority:weakest(parents.map(p=>p.authority)),sources:parents.flatMap(p=>arr(p.sources)),lineage:{parents:parents.map(p=>p.id),transformation:input.transformation||'derived',transformer:input.transformer||null},metadata:clone(input.metadata||{})});}
  function resolveClaim(claim,options){options=options||{};if(!claim)return {state:'UNKNOWN',reason:'missing-claim',authority:'NONE'};if(arr(claim.contradicts).length)return {state:'CONFLICT',reason:'explicit-conflict',authority:claim.authority};
    if(Number(options.minIndependentSources||0)>independentSourceCount(claim))return {state:'UNKNOWN',reason:'insufficient-independent-sources',authority:claim.authority};
    if(!isFresh(claim,options.now||Date.now(),Number(options.maxAgeMs||0)))return {state:'UNKNOWN',reason:'stale-evidence',authority:claim.authority};
    if(claim.kind==='ASSUMPTION')return {state:'ASSUMPTION',reason:'declared-assumption',authority:claim.authority};
    if(options.allowInference===false&&claim.kind==='INFERENCE')return {state:'UNKNOWN',reason:'inference-not-allowed',authority:claim.authority};
    if(!arr(claim.sources).length)return {state:'UNKNOWN',reason:'no-sources',authority:'NONE'};return {state:claim.kind,reason:'supported',authority:claim.authority};}
  function mergeClaims(claims){const list=arr(claims);if(!list.length)return {state:'UNKNOWN',authority:'NONE',claims:[]};const texts=new Set(list.map(c=>String(c.text||'').trim().toLowerCase()));const conflict=texts.size>1||list.some(c=>arr(c.contradicts).length);return {state:conflict?'CONFLICT':list.some(c=>c.kind==='FACT')?'FACT':'CLAIM',authority:weakest(list.map(c=>c.authority)),claims:list.map(c=>c.id),sourceCount:new Set(list.flatMap(c=>arr(c.sources).map(s=>s.id))).size,independentSourceCount:new Set(list.flatMap(c=>arr(c.sources).map(s=>s.independentGroup||s.id))).size};}
  function grantsAuthority(){return false;}

  const DEFAULT_SHARES=Object.freeze({instructions:.12,task:.16,evidence:.22,project:.18,memory:.14,tools:.10,conversation:.08});
  function tokensOf(item){const n=Number(item&&item.tokens);if(Number.isFinite(n)&&n>=0)return Math.ceil(n);const text=typeof item?.content==='string'?item.content:JSON.stringify(item?.content??'');return Math.max(1,Math.ceil(text.length/4));}
  function contextScore(item){return (item.pinned?10000:0)+(item.required?5000:0)+Number(item.priority||0)+(item.fresh===false?-1000:0)+(item.trust==='trusted'?100:item.trust==='untrusted'?-25:0);}
  function compileContext(input){input=input||{};const max=Math.max(0,Math.floor(Number(input.maxTokens)||0));const reserve=Math.max(0,Math.floor(Number(input.reserveTokens)||0));const available=Math.max(0,max-reserve);if(!available)return {selected:[],evicted:arr(input.items).map(clone),tokensUsed:0,tokenBudget:0,categoryUsage:{},warnings:['zero-context-budget']};const shares={...DEFAULT_SHARES,...(input.categoryShares||{})};const sum=Object.values(shares).reduce((a,b)=>a+Math.max(0,Number(b)||0),0)||1;const budgets=Object.fromEntries(Object.entries(shares).map(([k,v])=>[k,Math.floor(available*(Math.max(0,Number(v)||0)/sum))]));const usage=Object.fromEntries(Object.keys(budgets).map(k=>[k,0]));const selected=[],evicted=[],warnings=[];let total=0;
    const eligible=arr(input.items).map(raw=>({...clone(raw),category:raw.category||'conversation',tokens:tokensOf(raw)})).filter(item=>{if(item.lifecycle==='deleted'||item.lifecycle==='invalid'){evicted.push({...item,evictionReason:'lifecycle'});return false;}if(input.activeScope&&item.scope&&item.scope!==input.activeScope){evicted.push({...item,evictionReason:'scope'});return false;}if(!(item.category in budgets)){budgets[item.category]=0;usage[item.category]=0;}return true;});
    eligible.sort((a,b)=>contextScore(b)-contextScore(a)||(Number(b.recency||0)-Number(a.recency||0))||String(a.id||'').localeCompare(String(b.id||'')));
    for(const item of eligible){const required=item.pinned||item.required,catFits=usage[item.category]+item.tokens<=(budgets[item.category]||0),fits=total+item.tokens<=available;if(fits&&(required||catFits)){selected.push(item);usage[item.category]+=item.tokens;total+=item.tokens;if(required&&!catFits)warnings.push('category-overflow:'+item.category+':'+(item.id||'item'));}else evicted.push({...item,evictionReason:fits?'category-budget':'total-budget'});}const missing=eligible.filter(x=>(x.required||x.pinned)&&!selected.some(s=>s.id===x.id));if(missing.length)warnings.push('required-items-evicted:'+missing.map(x=>x.id||'item').join(','));return {selected,evicted,tokensUsed:total,tokenBudget:available,categoryUsage:usage,categoryBudgets:budgets,warnings};}

  function selectTier(signals){signals=signals||{};const battery=signals.batteryLevel==null?1:clamp(signals.batteryLevel,0,1),mem=Number(signals.deviceMemoryGb||0),cores=Number(signals.cores||0),pressure=String(signals.memoryPressure||'normal'),thermal=String(signals.thermal||'normal');if(pressure==='critical'||thermal==='critical'||battery<=.1)return 'lite';if(signals.reducedMotion||pressure==='high'||thermal==='high'||signals.hidden||Number(signals.recentLongTasks||0)>=3||(mem&&mem<=2)||(cores&&cores<=2)||battery<=.2)return 'lite';if(mem>=6&&cores>=6&&battery>.35&&!Number(signals.recentLongTasks||0))return 'full';return 'balanced';}
  function createBudget(input){input=input||{};const tier=TIERS[input.tier]?input.tier:'balanced',p=TIERS[tier],bc=positive(input.baseContextTokens,16000),bm=positive(input.baseMemoryMb,256),bt=positive(input.baseToolCalls,12);return {tier,baseContextTokens:bc,baseMemoryMb:bm,baseToolCalls:bt,contextTokens:Math.max(1024,Math.floor(bc*p.contextScale)),memoryMb:Math.max(64,Math.floor(bm*p.contextScale)),toolCalls:Math.max(1,Math.floor(bt*(tier==='full'?1:tier==='balanced'?.75:.5))),concurrency:p.concurrency,animationScale:p.animationScale,allowBackground:p.allowBackground,verificationDepth:p.verificationDepth};}
  function adaptBudget(current,signals){current=current||{};return createBudget({tier:selectTier(signals),baseContextTokens:positive(current.baseContextTokens,16000),baseMemoryMb:positive(current.baseMemoryMb,256),baseToolCalls:positive(current.baseToolCalls,12)});}

  function createSideEffectLedger(seed){const entries=clone(seed||[]),map=new Map(entries.filter(e=>e&&e.idempotencyKey).map(e=>[e.idempotencyKey,e]));function plan(input){input=input||{};const key=String(input.idempotencyKey||'').trim();if(!key)throw new Error('side effect requires idempotencyKey');if(map.has(key))return clone(map.get(key));const e={id:input.id||id('effect'),idempotencyKey:key,taskId:input.taskId||null,capability:input.capability||null,target:clone(input.target||null),reversible:!!input.reversible,state:'PLANNED',history:[]};entries.push(e);map.set(key,e);return clone(e);}function mutate(key,next,payload){payload=payload||{};const e=map.get(key);if(!e)throw new Error('unknown side effect: '+key);const allowed={PLANNED:['ATTEMPTED','FAILED'],ATTEMPTED:['VERIFIED','FAILED','UNCERTAIN'],UNCERTAIN:['RECONCILED','VERIFIED','FAILED','ROLLED_BACK'],VERIFIED:['ROLLED_BACK'],FAILED:['RECONCILED'],RECONCILED:['VERIFIED','FAILED','ROLLED_BACK'],ROLLED_BACK:[]};if(!allowed[e.state].includes(next))throw new Error(`illegal side effect transition: ${e.state}->${next}`);if(next==='VERIFIED'&&!payload.evidence)throw new Error('verified side effect requires evidence');if(next==='ROLLED_BACK'&&!e.reversible)throw new Error('irreversible side effect cannot be marked rolled back');const from=e.state;e.state=next;e.history.push({from,to:next,at:payload.at||new Date().toISOString(),reason:payload.reason||null});if(next==='VERIFIED')e.verification=clone(payload);return clone(e);}return {plan,mutate,get:key=>map.has(key)?clone(map.get(key)):null,unresolved:()=>entries.filter(e=>['PLANNED','ATTEMPTED','UNCERTAIN','RECONCILED'].includes(e.state)).map(clone),snapshot:()=>clone(entries)};}

  function detectSignals(){const nav=root&&root.navigator||{};const perf=root&&root.SevenPerformance;return {deviceMemoryGb:Number(nav.deviceMemory||0),cores:Number(nav.hardwareConcurrency||0),reducedMotion:!!(perf&&perf.state&&perf.state.reducedMotion),hidden:!!(hasDOM&&root.document.hidden),recentLongTasks:perf&&perf.state?perf.state.longTasks.slice(-3).filter(x=>x.duration>=50).length:0};}
  function boot(){const preferred=root&&root.SevenPerformance&&TIERS[root.SevenPerformance.state.tier]?root.SevenPerformance.state.tier:selectTier(detectSignals());state.tier=preferred;state.budget=createBudget({tier:preferred});state.ready=true;state.bootedAt=new Date().toISOString();if(hasDOM)root.document.documentElement.dataset.sevenControl='v4.2';return snapshot();}
  function snapshot(){return clone(state);}
  if(hasDOM){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}else boot();
  return {VERSION,state,TASK_STATES,EPISTEMIC_KIND,AUTH,TIERS,createTaskContract,canUseCapability,transitionTask,normalizeSource,createClaim,deriveClaim,resolveClaim,mergeClaims,isFresh,independentSourceCount,grantsAuthority,compileContext,tokensOf,selectTier,createBudget,adaptBudget,createSideEffectLedger,boot,snapshot};
});
