"use strict";

const core=require("./canon-fabric.cjs");
const rpg=require("./rpg-story-fabric-final.cjs");
const A=v=>Array.isArray(v)?v:[], C=v=>v==null?v:JSON.parse(JSON.stringify(v)), F=Object.freeze;
function uniq(v){return [...new Set(A(v).map(String))]}
function headsMap(heads){
  const out={};
  if(Array.isArray(heads)) for(const s of heads){ if(s?.sourceIdentity&&s?.sourceVersionHash) out[String(s.sourceIdentity)]=String(s.sourceVersionHash); }
  else if(heads&&typeof heads==="object") for(const [k,v] of Object.entries(heads)) out[String(k)]=String(v?.sourceVersionHash??v);
  return out;
}
function auditAnchorGraph(corpus){
  const issues=[], anchors=corpus?.anchors||{}, color={};
  function dfs(id){ color[id]=1; for(const dep of A(anchors[id]?.dependsOn)){ if(!anchors[dep]) issues.push(`anchor-dependency-missing:${id}:${dep}`); else if(color[dep]===1) issues.push(`anchor-cycle:${id}:${dep}`); else if(!color[dep]) dfs(dep); } color[id]=2; }
  for(const id of Object.keys(anchors)) if(!color[id]) dfs(id);
  return F({status:issues.length?"FAIL":"PASS",issues});
}
function verifyCorpus(corpus){
  const base=core.verifyCorpus(corpus), anchorAudit=auditAnchorGraph(corpus), issues=[...A(base.issues),...anchorAudit.issues];
  return F({valid:base.valid&&anchorAudit.status==="PASS",issues});
}
function createCorpus(input={}){
  const corpus=core.createCorpus(input), check=verifyCorpus(corpus);
  if(!check.valid) throw new Error(`canon corpus invalid:${check.issues.join(",")}`);
  return corpus;
}
function auditSourceFreshness(corpus,activeHeads,opts={}){
  const check=verifyCorpus(corpus); if(!check.valid) return F({status:"BLOCKED",issues:check.issues,staleSourceIds:[],staleEvidenceIds:[],invalidatedFactIds:[],invalidatedEventIds:[]});
  const heads=headsMap(activeHeads), staleSources=new Set(), unknownSources=new Set();
  for(const s of Object.values(corpus.sources||{})){
    const head=heads[s.sourceIdentity];
    if(!head){ if(opts.requireComplete===true) unknownSources.add(s.id); continue; }
    if(head!==s.sourceVersionHash) staleSources.add(s.id);
  }
  const staleEvidence=new Set();
  for(const e of Object.values(corpus.evidence||{})) if(staleSources.has(e.sourceVersionId)||unknownSources.has(e.sourceVersionId)) staleEvidence.add(e.id);
  const invalidFacts=new Set();
  for(const f of Object.values(corpus.facts||{})){
    if(f.status===core.FACT_STATUS.SUPPORTED_CANON){ const refs=A(f.evidenceRefs); if(refs.length&&refs.every(id=>staleEvidence.has(id))) invalidFacts.add(f.id); }
  }
  let changed=true;
  while(changed){ changed=false; for(const f of Object.values(corpus.facts||{})){ if(f.status!==core.FACT_STATUS.SUPPORTED_DERIVATION||invalidFacts.has(f.id)) continue; if(A(f.derivation?.inputFactIds).some(id=>invalidFacts.has(id))){ invalidFacts.add(f.id); changed=true; } } }
  const invalidEvents=new Set();
  for(const e of Object.values(corpus.events||{})) if(A(e.factRefs).some(id=>invalidFacts.has(id))|| (A(e.evidenceRefs).length&&A(e.evidenceRefs).every(id=>staleEvidence.has(id)))) invalidEvents.add(e.id);
  const issues=[...staleSources].map(id=>`stale-source:${id}`).concat([...unknownSources].map(id=>`source-head-unknown:${id}`),[...invalidFacts].map(id=>`fact-source-stale:${id}`),[...invalidEvents].map(id=>`event-source-stale:${id}`));
  return F({status:issues.length?"STALE":"FRESH",issues,staleSourceIds:[...staleSources].sort(),unknownSourceIds:[...unknownSources].sort(),staleEvidenceIds:[...staleEvidence].sort(),invalidatedFactIds:[...invalidFacts].sort(),invalidatedEventIds:[...invalidEvents].sort(),headFingerprint:core.hash(heads)});
}
function evaluateCoverage(corpus,contract,input={}){
  const base=core.evaluateCoverage(corpus,contract); if(base.status!==core.COVERAGE_STATUS.PASS) return base;
  if(!input.activeSourceHeads) return base;
  const fresh=auditSourceFreshness(corpus,input.activeSourceHeads,{requireComplete:input.requireCompleteSourceHeads===true});
  if(fresh.status==="BLOCKED") return F({status:core.COVERAGE_STATUS.BLOCKED,issues:fresh.issues});
  const invalid=new Set(fresh.invalidatedFactIds), issues=[];
  for(const id of A(contract.requiredFactIds)) if(invalid.has(id)) issues.push(`required-fact-stale:${id}`);
  for(const id of A(contract.requiredAnchorIds)){ const a=corpus.anchors?.[id]; if(a?.kind==="FACT"&&invalid.has(a.targetId)) issues.push(`required-anchor-stale:${id}`); if(a?.kind==="EVENT"&&fresh.invalidatedEventIds.includes(a.targetId)) issues.push(`required-anchor-stale:${id}`); }
  if(input.requireCompleteSourceHeads===true) for(const id of fresh.unknownSourceIds) issues.push(`source-head-unknown:${id}`);
  return issues.length?F({status:core.COVERAGE_STATUS.CANON_GAP,issues,freshness:fresh}):F({...base,freshness:fresh});
}
function createSceneContract(corpus,input={}){
  const base=core.createSceneContract(corpus,input), active=input.activeSourceHeads||null;
  if(active){
    const freshness=auditSourceFreshness(corpus,active,{requireComplete:input.requireCompleteSourceHeads===true});
    if(freshness.status!=="FRESH") throw new Error(`scene source freshness failed:${freshness.issues.join(",")}`);
    const sourceHeadFingerprint=freshness.headFingerprint;
    return F({...base,sourceHeadFingerprint,sceneSeal:core.hash({sceneHash:base.sceneHash,corpusIntegrityHash:corpus.integrityHash,sourceHeadFingerprint})});
  }
  return F({...base,sourceHeadFingerprint:null,sceneSeal:core.hash({sceneHash:base.sceneHash,corpusIntegrityHash:corpus.integrityHash,sourceHeadFingerprint:null})});
}
function verifySceneContract(corpus,scene,input={}){
  const check=verifyCorpus(corpus); if(!check.valid) return F({valid:false,reason:"corpus-invalid",issues:check.issues});
  if(scene.corpusIntegrityHash!==corpus.integrityHash) return F({valid:false,reason:"scene-corpus-drift"});
  const fp=scene.sourceHeadFingerprint??null;
  if(scene.sceneSeal!==core.hash({sceneHash:scene.sceneHash,corpusIntegrityHash:corpus.integrityHash,sourceHeadFingerprint:fp})) return F({valid:false,reason:"scene-seal-drift"});
  if(input.activeSourceHeads){ const fresh=auditSourceFreshness(corpus,input.activeSourceHeads,{requireComplete:input.requireCompleteSourceHeads===true}); if(fresh.status!=="FRESH") return F({valid:false,reason:"scene-source-stale",issues:fresh.issues}); if(fp&&fresh.headFingerprint!==fp) return F({valid:false,reason:"scene-source-head-drift"}); }
  return F({valid:true,reason:"scene-valid"});
}
function analyzeInsertion(corpus,scene,input={}){
  const sv=verifySceneContract(corpus,scene,input); if(!sv.valid) return F({status:core.INSERTION_STATUS.BLOCKED,issues:[sv.reason,...A(sv.issues)]});
  return core.analyzeInsertion(corpus,scene,input);
}
function createDivergenceEvent(corpus,input={}){
  const clean={...input};
  if(input.playerCaused===true){
    const def=input.rpgDefinition, session=input.rpgSession, action=input.playerAction;
    if(!def||!session||!action) throw new Error("player-caused divergence requires authoritative RPG definition/session/PlayerAction");
    const sv=rpg.verifySessionSeal(def,session); if(!sv.valid) throw new Error(`RPG session invalid:${sv.reason}`);
    const av=rpg.verifyPlayerAction(action,session); if(!av.valid) throw new Error(`PlayerAction invalid:${av.reason}`);
    clean.playerActionLineage={actionId:action.id,actionHash:action.actionHash,sessionId:action.sessionId,branchId:action.branchId,baseRevision:action.baseRevision};
  }
  delete clean.rpgDefinition; delete clean.rpgSession; delete clean.playerAction;
  return core.createDivergenceEvent(corpus,clean);
}
function verifyDivergenceLineage(divergence,input={}){
  if(!divergence?.divergenceHash) return F({valid:false,reason:"divergence-missing"});
  if(divergence.playerCaused!==true) return F({valid:true,reason:"non-player-divergence"});
  const l=divergence.playerActionLineage, action=input.playerAction, session=input.rpgSession, def=input.rpgDefinition;
  if(!l||!action||!session||!def) return F({valid:false,reason:"authoritative-player-lineage-required"});
  const sv=rpg.verifySessionSeal(def,session); if(!sv.valid) return F({valid:false,reason:`rpg-session:${sv.reason}`});
  const av=rpg.verifyPlayerAction(action,session); if(!av.valid) return F({valid:false,reason:`player-action:${av.reason}`});
  const exact=l.actionId===action.id&&l.actionHash===action.actionHash&&l.sessionId===action.sessionId&&l.branchId===action.branchId&&l.baseRevision===action.baseRevision;
  return F({valid:exact,reason:exact?"player-lineage-valid":"player-lineage-drift"});
}
function createRpgConstraintSet(corpus,scene,session,definition){
  if(!definition) throw new Error("RPG WorldDefinition required");
  const sv=rpg.verifySessionSeal(definition,session); if(!sv.valid) throw new Error(`RPG session invalid:${sv.reason}`);
  const sc=verifySceneContract(corpus,scene); if(!sc.valid) throw new Error(`canon scene invalid:${sc.reason}`);
  const base=core.createRpgConstraintSet(corpus,scene,session), body={...base,worldDefinitionHash:definition.definitionHash||null,verifiedSessionSeal:session.sessionSeal};
  return F({...body,constraintSeal:core.hash(body)});
}
function auditCanon(corpus,input={}){
  const base=core.auditCanon(corpus), check=verifyCorpus(corpus), anchor=auditAnchorGraph(corpus), fresh=input.activeSourceHeads?auditSourceFreshness(corpus,input.activeSourceHeads,{requireComplete:input.requireCompleteSourceHeads===true}):null;
  const issues=[...A(base.issues),...A(check.issues),...A(anchor.issues),...(fresh&&fresh.status!=="FRESH"?fresh.issues:[])];
  return F({...base,status:issues.length?"REVIEW":"PASS",issues:[...new Set(issues)],freshness:fresh});
}
module.exports=F({...core,createCorpus,verifyCorpus,auditAnchorGraph,auditSourceFreshness,evaluateCoverage,createSceneContract,verifySceneContract,analyzeInsertion,createDivergenceEvent,verifyDivergenceLineage,createRpgConstraintSet,auditCanon});