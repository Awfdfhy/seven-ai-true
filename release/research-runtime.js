(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenResearch=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const STATUS=Object.freeze({PASS:'PASS',INCONCLUSIVE:'INCONCLUSIVE',BLOCKED:'BLOCKED'});
  const STANCE=Object.freeze({SUPPORT:'support',CONTRADICT:'contradict',CONTEXT:'context'});
  const AUTHORITY=Object.freeze({A0:1,A1:.95,A2:.82,A3:.68,A4:.48,A5:.25});

  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function arr(v){return Array.isArray(v)?v:[];}
  function str(v){return typeof v==='string'?v.trim():'';}
  function authority(v){return AUTHORITY[String(v||'A5').toUpperCase()]||AUTHORITY.A5;}
  function validUrl(v){try{const u=new URL(v);return u.protocol==='https:'||u.protocol==='http:';}catch{return false;}}
  function toMs(v){const n=Date.parse(v||'');return Number.isFinite(n)?n:null;}

  function normalizeClaims(raw){
    const ids=new Set();
    return arr(raw).map((item,index)=>{
      const c=typeof item==='string'?{text:item}:clone(item||{});
      c.id=str(c.id)||('claim-'+(index+1));
      if(ids.has(c.id))throw new Error('duplicate claim id: '+c.id);ids.add(c.id);
      c.text=str(c.text);if(!c.text)throw new Error('claim text required: '+c.id);
      c.timeSensitive=!!c.timeSensitive;
      c.freshnessDays=Number.isFinite(Number(c.freshnessDays))?Math.max(0,Number(c.freshnessDays)):null;
      return c;
    });
  }

  function normalizeSources(raw){
    const ids=new Set();
    return arr(raw).map((item,index)=>{
      const s=clone(item||{});s.id=str(s.id)||('source-'+(index+1));
      if(ids.has(s.id))throw new Error('duplicate source id: '+s.id);ids.add(s.id);
      s.title=str(s.title)||s.id;s.url=str(s.url);s.authority=String(s.authority||'A5').toUpperCase();
      s.publishedAt=toMs(s.publishedAt);s.retrievedAt=toMs(s.retrievedAt)||Date.now();
      s.evidence=arr(s.evidence).map((e,i)=>({
        id:str(e&&e.id)||s.id+':e'+(i+1),
        claimId:str(e&&e.claimId),
        stance:Object.values(STANCE).includes(e&&e.stance)?e.stance:STANCE.CONTEXT,
        excerpt:str(e&&e.excerpt),
        locator:str(e&&e.locator),
        transformation:str(e&&e.transformation)||'extract'
      }));
      return s;
    });
  }

  function sourceFreshness(source,claim,nowMs,defaultDays){
    if(!claim.timeSensitive)return {required:false,status:'NOT_REQUIRED',ageDays:null,limitDays:null};
    const base=source.publishedAt||source.retrievedAt;
    const limit=claim.freshnessDays==null?defaultDays:claim.freshnessDays;
    const age=Math.max(0,(nowMs-base)/86400000);
    return {required:true,status:age<=limit?'FRESH':'STALE',ageDays:Number(age.toFixed(2)),limitDays:limit};
  }

  function createClaimEvidenceMatrix(rawClaims,rawSources,opts){
    opts=opts||{};
    const claims=normalizeClaims(rawClaims),sources=normalizeSources(rawSources);
    const nowMs=toMs(opts.now)||Date.now();
    const defaultDays=Number.isFinite(Number(opts.defaultFreshnessDays))?Math.max(0,Number(opts.defaultFreshnessDays)):30;
    const sourceMap=new Map(sources.map(s=>[s.id,s]));
    const rows=claims.map(claim=>{
      const evidence=[];
      for(const source of sources)for(const e of source.evidence)if(e.claimId===claim.id){
        evidence.push({sourceId:source.id,title:source.title,url:source.url,authority:source.authority,authorityWeight:authority(source.authority),stance:e.stance,excerpt:e.excerpt,locator:e.locator,transformation:e.transformation,freshness:sourceFreshness(source,claim,nowMs,defaultDays)});
      }
      const support=evidence.filter(e=>e.stance===STANCE.SUPPORT);
      const contradict=evidence.filter(e=>e.stance===STANCE.CONTRADICT);
      const freshSupport=support.filter(e=>e.freshness.status!=='STALE');
      const validSupport=freshSupport.filter(e=>sourceMap.has(e.sourceId)&&validUrl(e.url));
      const bestAuthority=validSupport.length?Math.max(...validSupport.map(e=>e.authorityWeight)):0;
      let status='SUPPORTED';
      if(!support.length)status='GAP';
      else if(claim.timeSensitive&&!freshSupport.length)status='STALE';
      else if(!validSupport.length)status='UNCITABLE';
      else if(contradict.length)status='CONFLICT';
      return {claim:clone(claim),status,bestAuthority,evidence,supportCount:support.length,contradictionCount:contradict.length};
    });
    return {version:1,createdAt:new Date(nowMs).toISOString(),claims,sourceCount:sources.length,rows,sources};
  }

  function analyze(matrix){
    if(!matrix||!Array.isArray(matrix.rows))throw new Error('invalid research matrix');
    const pick=status=>matrix.rows.filter(r=>r.status===status).map(r=>r.claim.id);
    const gaps=pick('GAP'),stale=pick('STALE'),uncitable=pick('UNCITABLE'),conflicts=pick('CONFLICT');
    const weak=matrix.rows.filter(r=>r.status==='SUPPORTED'&&r.bestAuthority<AUTHORITY.A3).map(r=>r.claim.id);
    const status=(gaps.length||stale.length||uncitable.length||conflicts.length)?STATUS.INCONCLUSIVE:STATUS.PASS;
    return {status,gaps,stale,uncitable,conflicts,weak,complete:status===STATUS.PASS};
  }

  function lockCitations(matrix){
    const analysis=analyze(matrix);
    const claims={};
    for(const row of matrix.rows){
      if(row.status!=='SUPPORTED'&&row.status!=='CONFLICT')continue;
      const refs=row.evidence.filter(e=>e.stance===STANCE.SUPPORT&&e.freshness.status!=='STALE'&&validUrl(e.url)).map(e=>({sourceId:e.sourceId,url:e.url,title:e.title,locator:e.locator,authority:e.authority}));
      if(refs.length)claims[row.claim.id]=refs;
    }
    return {version:1,status:analysis.status,claims,lockedAt:new Date().toISOString()};
  }

  function nextActions(matrix){
    const a=analyze(matrix),actions=[];
    for(const id of a.gaps)actions.push({type:'gap-search',claimId:id});
    for(const id of a.stale)actions.push({type:'freshness-search',claimId:id});
    for(const id of a.conflicts)actions.push({type:'contradiction-resolution',claimId:id});
    for(const id of a.uncitable)actions.push({type:'citation-recovery',claimId:id});
    for(const id of a.weak)actions.push({type:'authority-upgrade',claimId:id});
    return actions;
  }

  function verify(rawClaims,rawSources,opts){
    const matrix=createClaimEvidenceMatrix(rawClaims,rawSources,opts);
    return {matrix,analysis:analyze(matrix),citationLock:lockCitations(matrix),nextActions:nextActions(matrix)};
  }

  return {STATUS,STANCE,AUTHORITY,normalizeClaims,normalizeSources,createClaimEvidenceMatrix,analyze,lockCitations,nextActions,verify};
});
