(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenWorld=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';
  const STATUS=Object.freeze({CANON:'CANON',BRANCH:'BRANCH',BLOCKED:'BLOCKED',UNVERIFIED:'UNVERIFIED'});
  const DEFAULT_LABELS=Object.freeze({episode:'Episode',chapter:'Chapter',arc:'Arc',sideStory:'Side Story',special:'Special',whatIf:'What If',filler:'Filler',game:'Game'});
  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function arr(v){return Array.isArray(v)?v:[];}
  function notify(name,detail){
    if(!root||!root.document||typeof root.dispatchEvent!=='function'||typeof root.CustomEvent!=='function')return;
    root.dispatchEvent(new root.CustomEvent(name,{detail:detail||{}}));
  }
  function normalizeWork(raw){
    const work=clone(raw||{});
    if(!work.id)throw new Error('work requires id');
    work.title=work.title||work.id;
    work.version=work.version||'1.0.0';
    work.continuity=work.continuity||'default';
    work.sources=arr(work.sources);
    work.beats=arr(work.beats).map((beat,index)=>Object.assign({index,sourceRefs:[],anchors:[],requiredFacts:[],forbiddenChanges:[]},beat));
    work.titleRules=Object.assign({},DEFAULT_LABELS,work.titleRules||{});
    const ids=new Set();
    for(const beat of work.beats){
      if(!beat.id)throw new Error('work beat requires id');
      if(ids.has(beat.id))throw new Error('duplicate work beat: '+beat.id);
      ids.add(beat.id);
      beat.sourceRefs=arr(beat.sourceRefs);beat.anchors=arr(beat.anchors);beat.requiredFacts=arr(beat.requiredFacts);beat.forbiddenChanges=arr(beat.forbiddenChanges);
    }
    return work;
  }
  function sourceCoverage(work,beat){
    if(!beat)return STATUS.UNVERIFIED;
    if(!beat.sourceRefs.length)return STATUS.UNVERIFIED;
    const known=new Set(work.sources.map(s=>s&&s.id).filter(Boolean));
    return beat.sourceRefs.every(id=>known.has(id))?STATUS.CANON:STATUS.UNVERIFIED;
  }
  function createEngine(rawWork){
    const work=normalizeWork(rawWork);
    function createSession(opts){
      opts=opts||{};
      const session={workId:work.id,workVersion:work.version,continuity:opts.continuity||work.continuity,beatIndex:Number.isInteger(opts.beatIndex)?opts.beatIndex:-1,branchId:opts.branchId||null,branchOrigin:clone(opts.branchOrigin)||null,history:arr(opts.history),titles:arr(opts.titles)};
      notify('seven:world-entry',{workId:work.id,continuity:session.continuity,branched:!!session.branchId});
      return session;
    }
    function expectedBeat(session){return work.beats[session.beatIndex+1]||null;}
    function beatById(id){return work.beats.find(b=>b.id===id)||null;}
    function sceneContract(session,opts){
      opts=opts||{};
      const beat=opts.beatId?beatById(opts.beatId):expectedBeat(session);
      if(!beat)return {status:'COMPLETE',workId:work.id,playerAgencyLock:true};
      return {
        status:sourceCoverage(work,beat),workId:work.id,workTitle:work.title,continuity:session.continuity,
        expectedBeatId:expectedBeat(session)&&expectedBeat(session).id,beat:clone(beat),
        sourceRefs:beat.sourceRefs.slice(),anchors:beat.anchors.slice(),requiredFacts:beat.requiredFacts.slice(),forbiddenChanges:beat.forbiddenChanges.slice(),
        playerAgencyLock:true,
        rule:'The runtime may react to player actions but must not invent the player choice, intention, emotion, or irreversible action.'
      };
    }
    function commitBeat(session,input){
      input=input||{};
      const beat=beatById(input.beatId);
      if(!beat)return {status:STATUS.BLOCKED,reason:'unknown-beat',session:clone(session)};
      const expected=expectedBeat(session);
      const inOrder=!!expected&&expected.id===beat.id;
      if(!inOrder&&!input.allowBranch)return {status:STATUS.BLOCKED,reason:'canon-order',expectedBeatId:expected&&expected.id,session:clone(session)};
      const next=clone(session);
      let branchCreated=false;
      if(!inOrder&&!next.branchId){
        next.branchId=input.branchId||('work-branch-'+Date.now().toString(36));
        next.branchOrigin={fromBeatIndex:session.beatIndex,expectedBeatId:expected&&expected.id,chosenBeatId:beat.id,reason:'canon-order-divergence'};
        branchCreated=true;
      }
      next.beatIndex=beat.index;
      const fidelity=sourceCoverage(work,beat);
      const record={id:input.id||('work-event-'+(next.history.length+1)),beatId:beat.id,beatIndex:beat.index,status:next.branchId?STATUS.BRANCH:fidelity,sourceRefs:beat.sourceRefs.slice(),playerActionSource:input.playerActionSource||null,at:new Date().toISOString()};
      if(input.playerAction&&input.playerActionSource!=='user')return {status:STATUS.BLOCKED,reason:'player-agency',session:clone(session)};
      next.history.push(record);
      if(branchCreated)notify('seven:canon-divergence',{workId:work.id,branchId:next.branchId,origin:clone(next.branchOrigin)});
      notify('seven:world-scene-change',{workId:work.id,beatId:beat.id,status:record.status,branchId:next.branchId});
      return {status:record.status,record,session:next};
    }
    function formatTitle(kind,meta){
      meta=meta||{};kind=String(kind||'episode');
      const label=work.titleRules[kind]||DEFAULT_LABELS[kind]||kind;
      const number=meta.number==null?'':String(meta.number).trim();
      const name=meta.name==null?'':String(meta.name).trim();
      const lead=number?label+' '+number:label;
      return name?lead+' — '+name:lead;
    }
    function recordTitle(session,kind,meta){
      const next=clone(session);const title=formatTitle(kind,meta);
      next.titles.push({kind:String(kind||'episode'),title,at:new Date().toISOString(),workId:work.id});
      return {session:next,title};
    }
    function audit(session){
      const sequence=[];let previous=-1;
      for(const record of arr(session.history)){
        const beat=beatById(record.beatId);
        if(!beat){sequence.push({id:record.id,status:'FAIL',reason:'unknown-beat'});continue;}
        if(!session.branchId&&beat.index!==previous+1)sequence.push({id:record.id,status:'FAIL',reason:'canon-order'});
        previous=beat.index;
      }
      const reached=work.beats.slice(0,Math.max(0,session.beatIndex+1));
      const unverified=reached.filter(beat=>sourceCoverage(work,beat)!==STATUS.CANON).map(beat=>beat.id);
      return {sequence:{status:sequence.length?'FAIL':'PASS',issues:sequence},sourceFidelity:{status:unverified.length?'INCONCLUSIVE':'PASS',unverified},branch:{status:session.branchId?'BRANCHED':'CANON',id:session.branchId},progress:{beatIndex:session.beatIndex,total:work.beats.length,complete:session.beatIndex>=work.beats.length-1}};
    }
    return {work:clone(work),createSession,expectedBeat,sceneContract,commitBeat,formatTitle,recordTitle,audit};
  }
  return {STATUS,DEFAULT_LABELS,normalizeWork,createEngine};
});
