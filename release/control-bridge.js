(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const VERSION='1.0.0';
  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function arr(v){return Array.isArray(v)?v:[];}
  function requireControl(){if(!root||!root.SevenControl)throw new Error('SevenControl runtime required');return root.SevenControl;}

  function syncResources(signals){
    const control=requireControl();
    const perf=root.SevenPerformance;
    const tier=perf&&perf.state&&control.TIERS[perf.state.tier]?perf.state.tier:control.selectTier(signals||{});
    const current=control.state.budget||control.createBudget({tier});
    const next=control.createBudget({tier,baseContextTokens:current.baseContextTokens,baseMemoryMb:current.baseMemoryMb,baseToolCalls:current.baseToolCalls});
    control.state.tier=tier;control.state.budget=next;
    return clone(next);
  }

  function researchRowToClaim(row,matrix){
    const control=requireControl();
    if(!row||!row.claim)throw new Error('research row required');
    const byId=new Map(arr(matrix&&matrix.sources).map(s=>[s.id,s]));
    const evidence=arr(row.evidence);
    const support=evidence.filter(e=>e.stance==='support');
    const contradict=evidence.filter(e=>e.stance==='contradict');
    const sources=[];
    for(const ev of [...support,...contradict]){
      const raw=byId.get(ev.sourceId)||{};
      if(sources.some(s=>s.id===ev.sourceId))continue;
      sources.push({
        id:ev.sourceId,
        authority:ev.authority||raw.authority||'A5',
        uri:ev.url||raw.url||null,
        observedAt:raw.publishedAt?new Date(raw.publishedAt).toISOString():raw.retrievedAt?new Date(raw.retrievedAt).toISOString():null,
        independentGroup:raw.independentGroup||raw.publisher||ev.sourceId,
        trust:'untrusted',
        metadata:{title:ev.title||raw.title||null,locator:ev.locator||null,transformation:ev.transformation||'extract'}
      });
    }
    let kind='CLAIM';
    const contradictions=[];
    if(row.status==='CONFLICT'){kind='CONFLICT';contradictions.push('research-matrix-conflict');}
    else if(row.status==='GAP'||row.status==='STALE'||row.status==='UNCITABLE')kind='UNKNOWN';
    else if(row.status==='SUPPORTED')kind='FACT';
    return control.createClaim({
      id:'research:'+row.claim.id,
      text:row.claim.text,
      kind,
      sources,
      contradicts:contradictions,
      lineage:{parents:[],transformation:'research-evidence-matrix',transformer:'SevenResearch'},
      metadata:{researchStatus:row.status,bestAuthority:row.bestAuthority,supportCount:row.supportCount,contradictionCount:row.contradictionCount}
    });
  }

  function researchVerificationToTruth(verification){
    if(!verification||!verification.matrix)throw new Error('research verification matrix required');
    const claims=verification.matrix.rows.map(row=>researchRowToClaim(row,verification.matrix));
    const unresolved=claims.filter(c=>['UNKNOWN','CONFLICT'].includes(c.kind)).map(c=>c.id);
    return {
      schemaVersion:1,
      status:unresolved.length?'INCONCLUSIVE':'PASS',
      claims,
      unresolved,
      citationLock:clone(verification.citationLock||null),
      lineage:{source:'SevenResearch',matrixVersion:verification.matrix.version||1,createdAt:verification.matrix.createdAt||null}
    };
  }

  function worldContractTruth(contract,work){
    const control=requireControl();
    if(!contract)throw new Error('world scene contract required');
    if(contract.status==='COMPLETE')return {status:'PASS',claims:[],reason:'work-complete'};
    const sources=new Map(arr(work&&work.sources).map(s=>[s.id,s]));
    const refs=arr(contract.sourceRefs);
    const normalized=refs.map(id=>{
      const s=sources.get(id)||{};
      return {id,authority:s.authority||'A5',uri:s.url||s.uri||null,observedAt:s.publishedAt||s.observedAt||null,independentGroup:s.independentGroup||s.publisher||id,trust:'untrusted'};
    });
    const covered=contract.status==='CANON'&&refs.length>0&&refs.every(id=>sources.has(id));
    const claim=control.createClaim({
      id:'world:'+String(contract.workId||'work')+':'+String(contract.beat&&contract.beat.id||contract.expectedBeatId||'scene'),
      text:'Scene contract is supported by the declared canon sources.',
      kind:covered?'FACT':'UNKNOWN',
      sources:normalized,
      lineage:{parents:[],transformation:'canon-scene-contract',transformer:'SevenWorld'},
      metadata:{workId:contract.workId||null,beatId:contract.beat&&contract.beat.id||contract.expectedBeatId||null,sourceRefs:refs,worldStatus:contract.status}
    });
    return {status:covered?'PASS':'CANON_GAP',claims:[claim],reason:covered?'source-covered':'source-coverage-incomplete'};
  }

  function guardCanonCommit({contract,work,commitResult}={}){
    const truth=worldContractTruth(contract,work);
    if(truth.status!=='PASS'&&commitResult&&commitResult.status==='CANON'){
      return {allowed:false,status:'CANON_GAP',reason:'canon-status-without-complete-source-coverage',truth,commitResult:clone(commitResult)};
    }
    return {allowed:true,status:truth.status,truth,commitResult:clone(commitResult||null)};
  }

  function buildTaskContext({task,truth=[],project=[],memory=[],tools=[],conversation=[],maxTokens,reserveTokens=0}={}){
    const control=requireControl();
    if(!task)throw new Error('task contract required');
    const budget=Number(maxTokens)||Number(control.state.budget&&control.state.budget.contextTokens)||16000;
    const items=[
      {id:'task:'+task.id,category:'task',role:'system',required:true,pinned:true,content:{goal:task.goal,intent:task.intent,risk:task.risk,scope:task.scope,successCriteria:task.successCriteria,stopConditions:task.stopConditions}},
      ...arr(truth).map((x,i)=>({id:x.id||'truth-'+i,category:'evidence',role:'system',priority:100,content:x,lineage:x.lineage||null,trust:'untrusted'})),
      ...arr(project).map((x,i)=>({id:x.id||'project-'+i,category:'project',role:x.role||'system',priority:x.priority||50,content:x.content??x,lineage:x.lineage||null})),
      ...arr(memory).map((x,i)=>({id:x.id||'memory-'+i,category:'memory',role:x.role||'system',priority:x.priority||20,content:x.content??x,lineage:x.lineage||null,lifecycle:x.lifecycle,scope:x.scope})),
      ...arr(tools).map((x,i)=>({id:x.id||'tool-'+i,category:'tools',role:'system',priority:x.priority||30,content:x.content??x,lineage:x.lineage||null})),
      ...arr(conversation).map((x,i)=>({id:x.id||'conversation-'+i,category:'conversation',role:x.role||'user',priority:x.priority||0,content:x.content??x,lineage:x.lineage||null,recency:x.recency||i}))
    ];
    return control.compileContext({items,maxTokens:budget,reserveTokens,activeScope:task.scope&&task.scope.activeScope||null});
  }

  const state={version:VERSION,ready:false,tier:null,error:null,bootedAt:null};
  function boot(){
    const control=requireControl();
    if(!control.state||!control.state.ready)throw new Error('SevenControl runtime not ready');
    const budget=syncResources();
    state.ready=true;state.tier=budget.tier;state.error=null;state.bootedAt=new Date().toISOString();
    return clone(state);
  }
  function safeBoot(){try{return boot();}catch(e){state.ready=false;state.error=String(e&&e.message||e);return clone(state);}}
  const hasDOM=!!(root&&root.document);
  if(hasDOM&&root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',safeBoot,{once:true});
  else safeBoot();
  return {VERSION,state,syncResources,researchRowToClaim,researchVerificationToTruth,worldContractTruth,guardCanonCommit,buildTaskContext,boot};
});
