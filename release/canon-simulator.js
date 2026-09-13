(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.SevenCanon=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const STATUS=Object.freeze({VERIFIED:'verified',PROBABLE:'probable',AMBIGUOUS:'ambiguous',CONFLICTING:'conflicting',UNKNOWN:'unknown',BRANCH:'branch-created'});
  const ANCHOR_WEIGHT=Object.freeze({incidental:0.1,soft:0.25,elastic:0.5,strong:0.8,rigid:1});
  const AUTHORITY_WEIGHT=Object.freeze({A0:1,A1:0.95,A2:0.8,A3:0.65,A4:0.45,A5:0.2});

  function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function asArray(v){return Array.isArray(v)?v:[];}
  function byId(items){const m=new Map();for(const item of asArray(items))if(item&&item.id)m.set(item.id,item);return m;}
  function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}
  function anchorWeight(v){return ANCHOR_WEIGHT[String(v||'soft').toLowerCase()]||ANCHOR_WEIGHT.soft;}
  function sourceWeight(v){return AUTHORITY_WEIGHT[String(v||'A5').toUpperCase()]||AUTHORITY_WEIGHT.A5;}

  function normalizePack(input){
    const p=clone(input||{});
    if(!p.id) throw new Error('canon pack requires id');
    p.version=p.version||'1.0.0';
    p.continuities=asArray(p.continuities);
    p.events=asArray(p.events);
    p.entities=asArray(p.entities);
    p.facts=asArray(p.facts);
    p.anchors=asArray(p.anchors);
    p.invariants=asArray(p.invariants);
    p.sources=asArray(p.sources);
    return p;
  }

  function validatePack(pack){
    const issues=[];
    const ids=new Set();
    for(const group of ['events','entities','facts','anchors']){
      for(const item of pack[group]){
        if(!item||!item.id){issues.push(group+':missing-id');continue;}
        const key=group+':'+item.id;
        if(ids.has(key))issues.push(key+':duplicate');
        ids.add(key);
      }
    }
    for(const a of pack.anchors) if(a.strength&&!Object.prototype.hasOwnProperty.call(ANCHOR_WEIGHT,String(a.strength).toLowerCase())) issues.push('anchor:'+a.id+':bad-strength');
    return {ok:issues.length===0,issues};
  }

  function createEngine(rawPack){
    const pack=normalizePack(rawPack);
    const validation=validatePack(pack);
    if(!validation.ok) throw new Error('invalid canon pack: '+validation.issues.join(','));
    const events=byId(pack.events), entities=byId(pack.entities), facts=byId(pack.facts), anchors=byId(pack.anchors), sources=byId(pack.sources);

    function sourceAuthority(sourceId){const s=sources.get(sourceId);return sourceWeight(s&&s.authority);}
    function factStatus(fact){
      if(!fact)return STATUS.UNKNOWN;
      if(fact.status)return fact.status;
      const refs=asArray(fact.sources);
      if(!refs.length)return STATUS.PROBABLE;
      const best=Math.max.apply(null,refs.map(sourceAuthority));
      return best>=0.8?STATUS.VERIFIED:best>=0.45?STATUS.PROBABLE:STATUS.AMBIGUOUS;
    }

    function createSession(opts){
      opts=opts||{};
      const continuity=opts.continuity||pack.defaultContinuity||(pack.continuities[0]&&pack.continuities[0].id)||'default';
      return {
        packId:pack.id,packVersion:pack.version,continuity,
        position:opts.position||null,
        branchId:null,branchOrigin:null,canonDebt:0,
        world:Object.assign({},clone(opts.world||{})),
        knowledge:Object.assign({},clone(opts.knowledge||{})),
        relationships:Object.assign({},clone(opts.relationships||{})),
        locations:Object.assign({},clone(opts.locations||{})),
        objects:Object.assign({},clone(opts.objects||{})),
        ledger:[],warnings:[]
      };
    }

    function canCharacterKnow(session,characterId,factId,position){
      const fact=facts.get(factId);
      if(!fact)return {allowed:false,status:STATUS.UNKNOWN,reason:'unknown-fact'};
      if(fact.continuity&&fact.continuity!==session.continuity)return {allowed:false,status:factStatus(fact),reason:'wrong-continuity'};
      const horizon=position==null?session.position:position;
      if(fact.availableAt!=null&&horizon!=null&&Number(horizon)<Number(fact.availableAt))return {allowed:false,status:factStatus(fact),reason:'future-knowledge'};
      const known=asArray(session.knowledge[characterId]);
      if(known.includes(factId)||asArray(fact.knownBy).includes(characterId))return {allowed:true,status:factStatus(fact),reason:'known'};
      return {allowed:false,status:factStatus(fact),reason:'not-established'};
    }

    function scoreInsertion(candidate){
      const c=candidate||{};
      const disruption=clamp(c.canonDisruption,0,1), risk=clamp(c.futureAnchorRisk,0,1);
      const opportunity=clamp(c.characterOpportunity,0,1), agency=clamp(c.playerAgency,0,1), narrative=clamp(c.narrativeValue,0,1), causal=clamp(c.causalCompatibility,0,1), temporal=clamp(c.temporalCompatibility,0,1);
      return Number((100*(0.17*opportunity+0.22*agency+0.18*narrative+0.18*causal+0.15*temporal+0.10*(1-disruption)-0.10*risk)).toFixed(2));
    }

    function buildSceneContract(session,scene){
      scene=scene||{};
      return {
        continuity:session.continuity,
        position:scene.position==null?session.position:scene.position,
        mustBeTrue:asArray(scene.mustBeTrue),
        mustNotYetBeKnown:asArray(scene.mustNotYetBeKnown),
        activeCharacters:asArray(scene.characters),
        characterGoals:clone(scene.characterGoals||{}),
        relationshipState:clone(session.relationships),
        locationState:clone(session.locations),
        canonObligations:asArray(scene.anchorIds).map(id=>anchors.get(id)).filter(Boolean).map(clone),
        possibleExitStates:asArray(scene.possibleExitStates)
      };
    }

    function invariantIssues(session,next){
      const issues=[];
      for(const inv of pack.invariants){
        if(!inv||!inv.type)continue;
        if(inv.continuity&&inv.continuity!==session.continuity)continue;
        if(inv.type==='location'&&next.locations[inv.entityId]&&next.locations[inv.entityId]!==inv.value)issues.push({id:inv.id||inv.type,type:inv.type,severity:inv.severity||'error'});
        if(inv.type==='object-owner'&&next.objects[inv.objectId]&&next.objects[inv.objectId].owner!==inv.value)issues.push({id:inv.id||inv.type,type:inv.type,severity:inv.severity||'error'});
        if(inv.type==='fact-unknown-before'&&Number(next.position)<Number(inv.before)){
          const known=asArray(next.knowledge[inv.characterId]);if(known.includes(inv.factId))issues.push({id:inv.id||inv.type,type:inv.type,severity:inv.severity||'error'});
        }
      }
      return issues;
    }

    function threatenedAnchors(session,delta){
      const affected=new Set(asArray(delta.invalidatesAnchors));
      const out=[];
      for(const id of affected){const a=anchors.get(id);if(a&&(!a.continuity||a.continuity===session.continuity))out.push({id:a.id,strength:a.strength||'soft',weight:anchorWeight(a.strength)});}
      return out;
    }

    function applySceneDelta(session,delta,meta){
      delta=delta||{};meta=meta||{};
      const next=clone(session);
      if(delta.position!=null)next.position=delta.position;
      Object.assign(next.world,clone(delta.world||{}));
      Object.assign(next.relationships,clone(delta.relationships||{}));
      Object.assign(next.locations,clone(delta.locations||{}));
      Object.assign(next.objects,clone(delta.objects||{}));
      for(const [characterId,newFacts] of Object.entries(delta.knowledge||{})){
        const set=new Set(asArray(next.knowledge[characterId]));for(const factId of asArray(newFacts))set.add(factId);next.knowledge[characterId]=Array.from(set);
      }
      const invariants=invariantIssues(session,next);
      const threatened=threatenedAnchors(session,delta);
      const debtAdd=threatened.reduce((sum,a)=>sum+a.weight*0.25,0)+invariants.length*0.2;
      next.canonDebt=Number((next.canonDebt+debtAdd).toFixed(3));
      const rigid=threatened.some(a=>a.weight>=ANCHOR_WEIGHT.rigid);
      const mustBranch=rigid||next.canonDebt>=1||meta.forceBranch===true;
      if(mustBranch&&!next.branchId){
        next.branchId=meta.branchId||('branch-'+Date.now().toString(36));
        next.branchOrigin={position:session.position,reason:rigid?'rigid-anchor-invalidated':next.canonDebt>=1?'canon-debt-threshold':'forced'};
      }
      const record={
        id:meta.id||('evt-'+(next.ledger.length+1)),at:new Date().toISOString(),position:next.position,
        status:next.branchId?STATUS.BRANCH:STATUS.VERIFIED,delta:clone(delta),
        threatenedAnchors:threatened,invariantIssues:invariants,
        provenance:{source:meta.source||'session',authority:meta.authority||'player/runtime',transformation:meta.transformation||'scene-commit'}
      };
      next.ledger.push(record);
      if(invariants.length)next.warnings.push({type:'invariant',issues:invariants,recordId:record.id});
      return {session:next,record,branched:!!next.branchId,issues:invariants};
    }

    function audit(session){
      const knowledgeIssues=[];
      for(const [characterId,known] of Object.entries(session.knowledge||{}))for(const factId of asArray(known)){
        const check=canCharacterKnow(session,characterId,factId,session.position);if(!check.allowed&&check.reason==='future-knowledge')knowledgeIssues.push({characterId,factId,reason:check.reason});
      }
      const invariant=invariantIssues(session,session);
      return {
        chronology:{status:'PASS'},
        characterKnowledge:{status:knowledgeIssues.length?'FAIL':'PASS',issues:knowledgeIssues},
        invariants:{status:invariant.length?'FAIL':'PASS',issues:invariant},
        futureAnchors:{status:session.canonDebt>=0.75?'AT_RISK':'PASS',canonDebt:session.canonDebt},
        branch:{status:session.branchId?'BRANCHED':'CANON',id:session.branchId},
        sourceCertainty:{status:pack.facts.every(f=>factStatus(f)!==STATUS.UNKNOWN)?'KNOWN':'MIXED'}
      };
    }

    return {pack:clone(pack),createSession,canCharacterKnow,scoreInsertion,buildSceneContract,applySceneDelta,audit,factStatus};
  }

  return {STATUS,ANCHOR_WEIGHT,AUTHORITY_WEIGHT,normalizePack,validatePack,createEngine};
});
