"use strict";
const crypto=require("crypto");
const F=Object.freeze;
const REL=F(["SUPPORT","CONTRADICT","QUALIFY","DEFINE","ATTRIBUTE","CONTEXT","DUPLICATE","DEPEND"]);
const REALMS=F(["OPEN_WEB","CONNECTED","PROJECT","LOCAL","USER","STRUCTURED"]);
const MODES=F(["QUICK","STANDARD","DEEP"]);
const CLAIM_STATUS=F(["SUPPORTED","GAP","STALE","CONFLICT","UNCITABLE","NOT_FOUND_COVERED"]);
const METHODS=F(["EXACT","LEXICAL","METADATA","SEMANTIC","HYBRID","CITATION_CHASE","STRUCTURED","BROWSER"]);
function text(v){return typeof v==="string"?v.trim():"";}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o;}return v;}
function hash(v){return crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex");}
function uniq(a){return [...new Set((Array.isArray(a)?a:[]).map(text).filter(Boolean))].sort();}
function enumv(v,set,fallback){const x=String(v||fallback).toUpperCase();if(!set.includes(x))throw Error(`invalid value:${x}`);return x;}
function ms(v){if(v==null)return null;const n=typeof v==="number"?v:Date.parse(v);if(!Number.isFinite(n))throw Error("invalid time");return n;}
function nonneg(v,name){const n=Number(v);if(!Number.isFinite(n)||n<0)throw Error(`${name} invalid`);return n;}
function posint(v,name,fallback){if(v==null&&fallback!=null)return fallback;const n=Number(v);if(!Number.isInteger(n)||n<=0)throw Error(`${name} invalid`);return n;}
function httpUrl(v){try{const u=new URL(v);if(!["https:","http:"].includes(u.protocol))return null;u.hash="";return u.href;}catch{return null;}}
function id(prefix,body){return `${prefix}-${hash(body).slice(0,24)}`;}
function identityValid(obj,prefix){if(!obj?.id)return false;const b={...obj};delete b.id;return obj.id===id(prefix,b);}
function subset(rows,allowed){return rows.every(x=>allowed.includes(x));}

function createKnowledgeSource(i={}){
  const sourceId=text(i.sourceId),realm=enumv(i.realm,REALMS,"LOCAL"),principalId=text(i.principalId),canonicalRef=text(i.canonicalRef);
  if(!sourceId||!principalId||!canonicalRef)throw Error("knowledge source identity incomplete");
  const b={schemaVersion:1,sourceId,realm,principalId,scopeId:text(i.scopeId)||null,canonicalRef,mediaType:text(i.mediaType)||"application/octet-stream",title:text(i.title)||sourceId};
  return F({...b,id:id("knowledge-source",b)});
}
function createSourceVersion({source,versionKey,contentHash,byteLength,observedAt,publishedAt=null,updatedAt=null,provenanceHash,availability="AVAILABLE"}={}){
  if(!source?.id||!identityValid(source,"knowledge-source")||!text(versionKey)||!text(contentHash)||!text(provenanceHash))throw Error("source version identity incomplete");
  const size=Number(byteLength);if(!Number.isInteger(size)||size<0)throw Error("source version byteLength invalid");
  const obs=ms(observedAt)??Date.now(),pub=ms(publishedAt),upd=ms(updatedAt);if(pub!=null&&upd!=null&&upd<pub)throw Error("source version update precedes publication");
  const b={schemaVersion:1,sourceId:source.id,sourceRealm:source.realm,principalId:source.principalId,scopeId:source.scopeId,versionKey:text(versionKey),contentHash:text(contentHash),byteLength:size,observedAt:obs,publishedAt:pub,updatedAt:upd,provenanceHash:text(provenanceHash),availability:String(availability).toUpperCase()};
  return F({...b,id:id("source-version",b)});
}
function createSourceLocator({sourceVersion,kind="TEXT_RANGE",page=null,start=null,end=null,selector=null,region=null,label=null}={}){
  if(!sourceVersion?.id||!identityValid(sourceVersion,"source-version"))throw Error("source version required");const k=String(kind).toUpperCase();
  const b={schemaVersion:1,sourceVersionId:sourceVersion.id,kind:k,page:Number.isInteger(page)&&page>0?page:null,start:Number.isInteger(start)&&start>=0?start:null,end:Number.isInteger(end)&&end>=0?end:null,selector:text(selector)||null,region:region?stable(region):null,label:text(label)||null};
  if(!["TEXT_RANGE","PAGE","REGION","SELECTOR","RECORD","WHOLE"].includes(k))throw Error("invalid locator kind");
  if(k==="TEXT_RANGE"&&(b.start==null||b.end==null||b.end<b.start))throw Error("text locator range invalid");
  if(k==="PAGE"&&b.page==null)throw Error("page locator required");
  if(k==="REGION"&&!b.region)throw Error("region locator required");
  if(k==="SELECTOR"&&!b.selector)throw Error("selector required");
  return F({...b,id:id("source-locator",b)});
}
function createDerivedRepresentation({sourceVersion,kind,contentHash,transformHash,parentIds=[],confidence=null}={}){
  if(!sourceVersion?.id||!text(kind)||!text(contentHash)||!text(transformHash))throw Error("derived representation identity incomplete");
  const c=confidence==null?null:Number(confidence);if(c!=null&&(!Number.isFinite(c)||c<0||c>1))throw Error("derived confidence invalid");
  const b={schemaVersion:1,sourceVersionId:sourceVersion.id,kind:String(kind).toUpperCase(),contentHash:text(contentHash),transformHash:text(transformHash),parentIds:uniq(parentIds),confidence:c,authoritative:false,rebuildable:true};
  return F({...b,id:id("derived-representation",b)});
}
function invalidateDerived({currentSourceVersion,derived=[]}={}){
  if(!currentSourceVersion?.id)throw Error("current source version required");
  const stale=(derived||[]).filter(x=>x?.sourceVersionId!==currentSourceVersion.id).map(x=>x.id).filter(Boolean).sort();
  return F({valid:stale.length===0,staleIds:stale,currentSourceVersionId:currentSourceVersion.id});
}
function createKnowledgeResult({sourceVersion,locator,contentHash,queryId,score=0,representationId=null}={}){
  if(!sourceVersion?.id||!locator?.id||locator.sourceVersionId!==sourceVersion.id||!text(contentHash)||!text(queryId))throw Error("knowledge result lineage incomplete");
  const s=Number(score);if(!Number.isFinite(s))throw Error("knowledge score invalid");
  const b={schemaVersion:1,sourceVersionId:sourceVersion.id,locatorId:locator.id,contentHash:text(contentHash),queryId:text(queryId),score:s,representationId:text(representationId)||null,grantsAuthority:false};
  return F({...b,id:id("knowledge-result",b)});
}

function createRetrievalNeed(i={}){
  const needId=text(i.needId),claimId=text(i.claimId),query=text(i.query);if(!needId||!claimId||!query)throw Error("retrieval need identity incomplete");
  const realms=(i.realms?.length?i.realms:["OPEN_WEB"]).map(x=>enumv(x,REALMS));
  const b={schemaVersion:1,needId,claimId,query,language:text(i.language)||"und",realms:[...new Set(realms)].sort(),freshnessDays:i.freshnessDays==null?null:nonneg(i.freshnessDays,"retrieval freshnessDays"),exactPreferred:i.exactPreferred!==false,semanticNeed:i.semanticNeed===true,scopeHash:text(i.scopeHash)||null};
  return F({...b,id:id("retrieval-need",b)});
}
function createQueryPlan({need,variants=[]}={}){
  if(!need?.id)throw Error("retrieval need required");
  const rows=(variants.length?variants:[{query:need.query,method:"LEXICAL"}]).map((v,n)=>({id:text(v.id)||`q${n+1}`,query:text(v.query),method:String(v.method||"LEXICAL").toUpperCase(),parentId:text(v.parentId)||null,rewriteReason:text(v.rewriteReason)||null}));
  if(rows.some(x=>!x.query||!METHODS.includes(x.method)))throw Error("query variant invalid");
  if(new Set(rows.map(x=>x.id)).size!==rows.length)throw Error("duplicate query variant id");
  const byId=new Map(rows.map(x=>[x.id,x]));for(const row of rows)if(row.parentId&&!byId.has(row.parentId))throw Error(`unknown query parent:${row.id}`);
  const visiting=new Set(),done=new Set();function visit(q){if(done.has(q))return;if(visiting.has(q))throw Error("query variant cycle");visiting.add(q);const p=byId.get(q)?.parentId;if(p)visit(p);visiting.delete(q);done.add(q);}for(const row of rows)visit(row.id);
  const b={schemaVersion:1,retrievalNeedId:need.id,claimId:need.claimId,originalQuery:need.query,variants:rows};
  return F({...b,id:id("query-plan",b)});
}
function selectRetrievalPortfolio({need,resourceTier="BALANCED",lexicalHit=false,exactHit=false,semanticUtility=0}={}){
  if(!need?.id)throw Error("retrieval need required");const tier=String(resourceTier).toUpperCase();if(!["LITE","BALANCED","FULL"].includes(tier))throw Error("invalid resource tier");
  const methods=[];if(need.exactPreferred)methods.push("EXACT");methods.push("LEXICAL");
  if(!exactHit&&!lexicalHit&&tier!=="LITE"&&need.semanticNeed&&Number(semanticUtility)>0)methods.push("SEMANTIC","HYBRID");
  return F({retrievalNeedId:need.id,resourceTier:tier,methods:[...new Set(methods)],semanticRequired:false});
}
function createSearchObservation({plan,variantId,providerId,url,title="",snippet="",retrievedAt,realm="OPEN_WEB",resultRank=null}={}){
  if(!plan?.id||!text(variantId)||!text(providerId))throw Error("search observation identity incomplete");
  const variant=plan.variants?.find(v=>v.id===variantId);if(!variant)throw Error("search observation variant outside plan");
  const normalized=httpUrl(url);if(!normalized)throw Error("search observation URL invalid");
  const rank=resultRank==null?null:Number(resultRank);if(rank!=null&&(!Number.isInteger(rank)||rank<1))throw Error("search observation rank invalid");
  const b={schemaVersion:1,queryPlanId:plan.id,retrievalNeedId:plan.retrievalNeedId,claimId:plan.claimId,variantId:variant.id,queryHash:hash(variant.query),providerId:text(providerId),url:normalized,title:text(title),snippetHash:text(snippet)?hash(text(snippet)):null,retrievedAt:ms(retrievedAt)??Date.now(),realm:enumv(realm,REALMS,"OPEN_WEB"),resultRank:rank,discoveryOnly:true,grantsAuthority:false};
  return F({...b,id:id("search-observation",b)});
}
function createCandidateDocument({observations=[],contentFingerprint,realm="OPEN_WEB"}={}){
  if(!Array.isArray(observations)||!observations.length||!text(contentFingerprint))throw Error("candidate document identity incomplete");const r=enumv(realm,REALMS,"OPEN_WEB");
  if(observations.some(o=>!o?.id||o.realm!==r))throw Error("candidate observation realm mismatch");
  const plans=uniq(observations.map(o=>o.queryPlanId));if(plans.length!==1)throw Error("candidate observations span query plans");
  const b={schemaVersion:1,queryPlanId:plans[0],realm:r,observationIds:uniq(observations.map(o=>o.id)),contentFingerprint:text(contentFingerprint),urls:uniq(observations.map(o=>o.url)),discoveryOnly:true,grantsAuthority:false};
  return F({...b,id:id("candidate-document",b)});
}
function clusterCandidates(candidates=[]){
  const groups=new Map();for(const c of candidates||[]){if(!c?.id||!text(c.contentFingerprint))throw Error("candidate invalid");const key=c.contentFingerprint;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
  return [...groups.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([fingerprint,rows])=>{const body={schemaVersion:1,contentFingerprint:fingerprint,candidateIds:rows.map(x=>x.id).sort(),realms:uniq(rows.map(x=>x.realm)),independenceUnit:`content:${hash(fingerprint).slice(0,16)}`};return F({...body,id:id("candidate-cluster",body)});});
}
function createFetchedSourceRef({candidate,sourceVersion,fetchArtifactHash}={}){
  if(!candidate?.id||!sourceVersion?.id||!text(fetchArtifactHash))throw Error("fetched source identity incomplete");
  if(candidate.realm!==sourceVersion.sourceRealm)throw Error("candidate/source realm mismatch");
  const b={schemaVersion:1,candidateId:candidate.id,queryPlanId:candidate.queryPlanId,sourceVersionId:sourceVersion.id,sourceRealm:sourceVersion.sourceRealm,principalId:sourceVersion.principalId,fetchArtifactHash:text(fetchArtifactHash)};
  return F({...b,id:id("fetched-source",b)});
}
function createExtractedSegmentRef({fetchedSource,sourceVersion,locator,contentHash,extractorHash}={}){
  if(!fetchedSource?.id||!sourceVersion?.id||!locator?.id||!text(contentHash)||!text(extractorHash))throw Error("extracted segment lineage incomplete");
  if(fetchedSource.sourceVersionId!==sourceVersion.id||locator.sourceVersionId!==sourceVersion.id)throw Error("extracted segment lineage mismatch");
  const b={schemaVersion:1,fetchedSourceId:fetchedSource.id,sourceVersionId:sourceVersion.id,locatorId:locator.id,contentHash:text(contentHash),extractorHash:text(extractorHash),derived:true,grantsAuthority:false};
  return F({...b,id:id("extracted-segment",b)});
}
function createRetrievalRunManifest({need,plan,observations=[],candidateIds=[],fetchedIds=[],startedAt,endedAt,stopReason}={}){
  if(!need?.id||!plan?.id||plan.retrievalNeedId!==need.id)throw Error("retrieval manifest plan mismatch");
  const start=ms(startedAt),end=ms(endedAt);if(start==null||end==null||end<start)throw Error("retrieval manifest time invalid");
  const variants=new Set((plan.variants||[]).map(v=>v.id));
  for(const o of observations||[])if(!o?.id||o.queryPlanId!==plan.id||o.retrievalNeedId!==need.id||o.claimId!==need.claimId||!variants.has(o.variantId))throw Error("retrieval observation outside plan");
  const b={schemaVersion:1,retrievalNeedId:need.id,queryPlanId:plan.id,claimId:need.claimId,observationIds:uniq(observations.map(o=>o.id)),candidateIds:uniq(candidateIds),fetchedIds:uniq(fetchedIds),startedAt:start,endedAt:end,stopReason:text(stopReason)||"UNKNOWN"};
  return F({...b,id:id("retrieval-run",b)});
}

function createResearchContract(i={}){
  const researchId=text(i.researchId),goalHash=text(i.goalHash),principalId=text(i.principalId);if(!researchId||!goalHash||!principalId)throw Error("research contract identity incomplete");
  const realms=(i.realms?.length?i.realms:["OPEN_WEB"]).map(x=>enumv(x,REALMS));
  const b={schemaVersion:1,researchId,goalHash,principalId,scopeId:text(i.scopeId)||null,mode:enumv(i.mode,MODES,"STANDARD"),realms:[...new Set(realms)].sort(),defaultFreshnessDays:i.defaultFreshnessDays==null?30:nonneg(i.defaultFreshnessDays,"defaultFreshnessDays"),maxQueries:posint(i.maxQueries,"maxQueries",8),maxSources:posint(i.maxSources,"maxSources",12),sourcePolicyHash:text(i.sourcePolicyHash)||null,outputContractHash:text(i.outputContractHash)||null};
  return F({...b,id:id("research-contract",b)});
}
function createClaimRef({contract,claimId,claimHash,timeSensitive=false,freshnessDays=null,negative=false,minIndependentSupport=1,domain=null,role=null}={}){
  if(!contract?.id||!text(claimId)||!text(claimHash))throw Error("claim identity incomplete");
  const fresh=freshnessDays==null?null:nonneg(freshnessDays,"freshnessDays"),min=posint(minIndependentSupport,"minIndependentSupport",1);
  const b={schemaVersion:1,researchContractId:contract.id,claimId:text(claimId),claimHash:text(claimHash),principalId:contract.principalId,scopeId:contract.scopeId,realms:contract.realms,timeSensitive:timeSensitive===true,freshnessDays:fresh,defaultFreshnessDays:contract.defaultFreshnessDays,negative:negative===true,minIndependentSupport:min,domain:text(domain)||null,role:text(role)||null};
  return F({...b,id:id("claim-ref",b)});
}
function createResearchAgenda({contract,questions=[],claims=[]}={}){
  if(!contract?.id)throw Error("research contract required");
  const qs=(questions||[]).map((q,n)=>({id:text(q.id)||`question-${n+1}`,questionHash:text(q.questionHash),parentId:text(q.parentId)||null,state:String(q.state||"OPEN").toUpperCase()}));if(qs.some(q=>!q.questionHash))throw Error("research question hash required");if(new Set(qs.map(q=>q.id)).size!==qs.length)throw Error("duplicate research question");
  const cs=(claims||[]);if(cs.some(c=>!c?.id||c.researchContractId!==contract.id))throw Error("agenda claim contract mismatch");if(new Set(cs.map(c=>c.id)).size!==cs.length)throw Error("duplicate agenda claim");
  const b={schemaVersion:1,researchContractId:contract.id,questions:qs,claimRefs:cs.map(c=>c.id),claimSetHash:hash(cs.map(c=>[c.id,c.claimHash]).sort())};return F({...b,id:id("research-agenda",b)});
}
function createEvidenceUnit({claim,sourceVersion,locator,relation="SUPPORT",contentHash,dependencyClusterId,extractorHash,claimPolicyEligible=true,transformation="EXTRACT",observedAt=null}={}){
  if(!claim?.id||!sourceVersion?.id||!locator?.id||locator.sourceVersionId!==sourceVersion.id||!text(contentHash)||!text(dependencyClusterId)||!text(extractorHash))throw Error("evidence lineage incomplete");
  if(sourceVersion.principalId!==claim.principalId)throw Error("evidence principal mismatch");
  if(sourceVersion.scopeId&&claim.scopeId&&sourceVersion.scopeId!==claim.scopeId)throw Error("evidence scope mismatch");
  if(!claim.realms.includes(sourceVersion.sourceRealm))throw Error("evidence realm outside research contract");
  const rel=enumv(relation,REL,"SUPPORT"),b={schemaVersion:1,researchContractId:claim.researchContractId,claimRefId:claim.id,claimId:claim.claimId,claimHash:claim.claimHash,sourceVersionId:sourceVersion.id,sourceRealm:sourceVersion.sourceRealm,principalId:sourceVersion.principalId,scopeId:sourceVersion.scopeId,locatorId:locator.id,relation:rel,contentHash:text(contentHash),dependencyClusterId:text(dependencyClusterId),extractorHash:text(extractorHash),transformation:String(transformation||"EXTRACT").toUpperCase(),observedAt:ms(observedAt)??sourceVersion.observedAt,claimPolicyEligible:claimPolicyEligible!==false,grantsAuthority:false};
  return F({...b,id:id("evidence-unit",b)});
}
function createCoverageContract({claim,realms=[],queryPlanIds=[],providerIds=[],windowStart=null,windowEnd=null,maxResults,coverageHash,completed=false}={}){
  if(!claim?.id||!claim.negative)throw Error("coverage contract requires negative claim");
  const rs=(realms.length?realms:claim.realms).map(x=>enumv(x,REALMS));if(!subset(rs,claim.realms))throw Error("coverage realm outside research contract");
  const start=ms(windowStart),end=ms(windowEnd);if(start!=null&&end!=null&&end<start)throw Error("coverage window invalid");
  const max=posint(maxResults,"coverage maxResults");const qp=uniq(queryPlanIds),pp=uniq(providerIds);if(completed&&(!qp.length||!pp.length))throw Error("completed coverage requires query and provider evidence");
  if(!text(coverageHash))throw Error("coverage hash required");
  const b={schemaVersion:1,researchContractId:claim.researchContractId,claimRefId:claim.id,claimId:claim.claimId,realms:[...new Set(rs)].sort(),queryPlanIds:qp,providerIds:pp,windowStart:start,windowEnd:end,maxResults:max,coverageHash:text(coverageHash),completed:completed===true};return F({...b,id:id("coverage-contract",b)});
}
function freshnessFor(sourceVersion,claim,now){if(!claim.timeSensitive)return{required:false,status:"NOT_REQUIRED",ageDays:null,limitDays:null};const base=sourceVersion.updatedAt??sourceVersion.publishedAt??sourceVersion.observedAt,limit=claim.freshnessDays??claim.defaultFreshnessDays??30,age=Math.max(0,(now-base)/86400000);return{required:true,status:age<=limit?"FRESH":"STALE",ageDays:Number(age.toFixed(2)),limitDays:limit};}
function evidenceEligible(e,claim,sourceMap){if(!e||e.claimRefId!==claim.id||e.claimHash!==claim.claimHash||e.principalId!==claim.principalId||!claim.realms.includes(e.sourceRealm)||e.claimPolicyEligible===false)return false;const v=sourceMap.get(e.sourceVersionId);if(!v||v.principalId!==claim.principalId||v.sourceRealm!==e.sourceRealm)return false;if(v.scopeId&&claim.scopeId&&v.scopeId!==claim.scopeId)return false;return true;}
function assessClaimEvidence({claim,evidence=[],sourceVersions=[],now=Date.now(),minIndependentSupport=null,coverageContract=null}={}){
  if(!claim?.id)throw Error("claim required");const clock=ms(now)??Date.now(),sourceMap=new Map((sourceVersions||[]).filter(Boolean).map(v=>[v.id,v])),valid=(evidence||[]).filter(e=>evidenceEligible(e,claim,sourceMap));
  const decorated=valid.map(e=>({e,v:sourceMap.get(e.sourceVersionId),fresh:freshnessFor(sourceMap.get(e.sourceVersionId),claim,clock)}));
  const support=decorated.filter(x=>x.e.relation==="SUPPORT"),contra=decorated.filter(x=>x.e.relation==="CONTRADICT"),freshSupport=support.filter(x=>x.fresh.status!=="STALE"),freshContra=contra.filter(x=>x.fresh.status!=="STALE"),ind=new Set(freshSupport.map(x=>x.e.dependencyClusterId));
  const floor=minIndependentSupport==null?claim.minIndependentSupport:posint(minIndependentSupport,"minIndependentSupport");let status="GAP";
  if(claim.negative&&!support.length&&!contra.length&&coverageContract?.completed===true&&coverageContract.claimRefId===claim.id&&identityValid(coverageContract,"coverage-contract"))status="NOT_FOUND_COVERED";
  else if(claim.timeSensitive&&support.length&&!freshSupport.length)status="STALE";
  else if(freshSupport.length&&freshContra.length)status="CONFLICT";
  else if(freshSupport.length&&ind.size>=floor)status="SUPPORTED";
  else status="GAP";
  const b={schemaVersion:1,claimRefId:claim.id,claimId:claim.claimId,claimHash:claim.claimHash,status,evidenceIds:valid.map(e=>e.id).sort(),supportEvidenceIds:freshSupport.map(x=>x.e.id).sort(),contradictionEvidenceIds:freshContra.map(x=>x.e.id).sort(),sourceVersionIds:uniq(valid.map(e=>e.sourceVersionId)),independentSupportCount:ind.size,minIndependentSupport:floor,coverageContractId:status==="NOT_FOUND_COVERED"?coverageContract.id:null};return F({...b,id:id("claim-assessment",b)});
}
function createClaimEvidenceLock({contract,agenda,claims=[],evidence=[],sourceVersions=[],assessments=[],lockedAt}={}){
  if(!contract?.id||!agenda?.id||agenda.researchContractId!==contract.id)throw Error("claim lock contract/agenda mismatch");const claimMap=new Map(claims.map(c=>[c.id,c])),eMap=new Map(evidence.map(e=>[e.id,e])),vMap=new Map(sourceVersions.map(v=>[v.id,v])),aMap=new Map(assessments.map(a=>[a.claimRefId,a]));
  if(claimMap.size!==claims.length||aMap.size!==assessments.length)throw Error("claim lock duplicate identity");
  const entries=[];for(const c of claims){if(c.researchContractId!==contract.id)throw Error("claim lock claim contract mismatch");const a=aMap.get(c.id);if(!a)throw Error(`claim assessment missing:${c.id}`);if(!["SUPPORTED","NOT_FOUND_COVERED"].includes(a.status))throw Error(`claim not lockable:${c.id}:${a.status}`);const ids=a.status==="SUPPORTED"?a.supportEvidenceIds:[];for(const eid of ids){const e=eMap.get(eid);if(!e)throw Error(`locked evidence missing:${eid}`);if(e.claimRefId!==c.id||e.claimHash!==c.claimHash)throw Error(`locked evidence claim mismatch:${eid}`);if(!vMap.has(e.sourceVersionId))throw Error(`locked source version missing:${e.sourceVersionId}`);}entries.push({claimRefId:c.id,claimId:c.claimId,claimHash:c.claimHash,status:a.status,evidenceIds:[...ids].sort(),sourceVersionIds:uniq(ids.map(eid=>eMap.get(eid).sourceVersionId)),coverageContractId:a.coverageContractId||null});}
  const b={schemaVersion:2,researchContractId:contract.id,agendaId:agenda.id,entries,lockedAt:ms(lockedAt)??Date.now()};return F({...b,id:id("claim-evidence-lock",b)});
}
function verifyClaimEvidenceLock({lock,contract,agenda,claims=[],evidence=[],sourceVersions=[]}={}){
  const reasons=[];if(!lock||!contract||!agenda)return{valid:false,reasons:["lock-context-missing"]};if(!identityValid(lock,"claim-evidence-lock"))reasons.push("claim-evidence-lock-tampered");if(lock.researchContractId!==contract.id)reasons.push("lock-contract-mismatch");if(lock.agendaId!==agenda.id)reasons.push("lock-agenda-mismatch");
  const cm=new Map(claims.map(c=>[c.id,c])),em=new Map(evidence.map(e=>[e.id,e])),vm=new Map(sourceVersions.map(v=>[v.id,v]));for(const ent of lock.entries||[]){const c=cm.get(ent.claimRefId);if(!c||c.claimHash!==ent.claimHash)reasons.push(`locked-claim-drift:${ent.claimRefId}`);for(const eid of ent.evidenceIds||[]){const e=em.get(eid);if(!e)reasons.push(`locked-evidence-missing:${eid}`);else{if(e.claimRefId!==ent.claimRefId||e.claimHash!==ent.claimHash)reasons.push(`locked-evidence-claim-drift:${eid}`);if(!vm.has(e.sourceVersionId))reasons.push(`locked-source-version-missing:${e.sourceVersionId}`);}}}
  return{valid:reasons.length===0,reasons:[...new Set(reasons)]};
}
function createCitationManifest({lock,evidence=[],sourceVersions=[],locators=[]}={}){
  if(!lock?.id||!identityValid(lock,"claim-evidence-lock"))throw Error("valid claim evidence lock required");const em=new Map(evidence.map(e=>[e.id,e])),vm=new Map(sourceVersions.map(v=>[v.id,v])),lm=new Map(locators.map(l=>[l.id,l])),citations=[];
  for(const ent of lock.entries||[])for(const eid of ent.evidenceIds||[]){const e=em.get(eid);if(!e)throw Error(`locked evidence missing:${eid}`);const v=vm.get(e.sourceVersionId),l=lm.get(e.locatorId);if(!v||!l||l.sourceVersionId!==v.id)throw Error(`citation lineage missing:${eid}`);citations.push({claimRefId:ent.claimRefId,claimId:ent.claimId,evidenceId:e.id,sourceVersionId:v.id,sourceId:v.sourceId,locatorId:l.id,relation:e.relation,contentHash:e.contentHash});}
  citations.sort((a,b)=>a.claimRefId.localeCompare(b.claimRefId)||a.evidenceId.localeCompare(b.evidenceId));const b={schemaVersion:1,claimEvidenceLockId:lock.id,citations};return F({...b,id:id("citation-manifest",b)});
}
function verifyCitationManifest({manifest,lock,evidence=[],sourceVersions=[],locators=[]}={}){
  const reasons=[];if(!manifest||!lock)return{valid:false,reasons:["citation-context-missing"]};if(!identityValid(manifest,"citation-manifest"))reasons.push("citation-manifest-tampered");if(manifest.claimEvidenceLockId!==lock.id)reasons.push("citation-lock-mismatch");
  const em=new Map(evidence.map(e=>[e.id,e])),vm=new Map(sourceVersions.map(v=>[v.id,v])),lm=new Map(locators.map(l=>[l.id,l])),locked=new Map();for(const ent of lock.entries||[])for(const eid of ent.evidenceIds||[])locked.set(eid,ent.claimRefId);const cited=new Set();
  for(const c of manifest.citations||[]){if(cited.has(c.evidenceId))reasons.push(`duplicate-citation:${c.evidenceId}`);cited.add(c.evidenceId);if(!locked.has(c.evidenceId))reasons.push(`citation-not-locked:${c.evidenceId}`);const e=em.get(c.evidenceId),v=vm.get(c.sourceVersionId),l=lm.get(c.locatorId);if(!e||!v||!l)reasons.push(`citation-lineage-missing:${c.evidenceId}`);else{if(e.sourceVersionId!==v.id||e.locatorId!==l.id||l.sourceVersionId!==v.id||c.claimRefId!==e.claimRefId)reasons.push(`citation-lineage-drift:${c.evidenceId}`);}}
  for(const eid of locked.keys())if(!cited.has(eid))reasons.push(`locked-evidence-uncited:${eid}`);return{valid:reasons.length===0,reasons:[...new Set(reasons)]};
}
function researchGaps(assessments=[]){const action={GAP:"EVIDENCE_SEARCH",STALE:"FRESHNESS_SEARCH",CONFLICT:"CONFLICT_RESOLUTION",UNCITABLE:"CITATION_RECOVERY"};return(assessments||[]).filter(a=>action[a?.status]).map(a=>({claimId:a.claimRefId,status:a.status,action:action[a.status]}));}
function shouldStopResearch({contract,assessments=[],queriesUsed=0,sourcesUsed=0,marginalVerifiedGain=null,stableUnresolvedConflict=false,explicitStop=false}={}){
  if(!contract?.id)throw Error("research contract required");if(explicitStop)return F({stop:true,reason:"EXPLICIT_STOP"});
  if(queriesUsed>=contract.maxQueries||sourcesUsed>=contract.maxSources)return F({stop:true,reason:"BUDGET_LIMIT"});
  if(assessments.length&&assessments.every(a=>["SUPPORTED","NOT_FOUND_COVERED"].includes(a.status)))return F({stop:true,reason:"CONTRACT_COMPLETE"});
  if(stableUnresolvedConflict)return F({stop:true,reason:"STABLE_UNRESOLVED_CONFLICT"});
  if(marginalVerifiedGain!=null&&Number(marginalVerifiedGain)<=0)return F({stop:true,reason:"LOW_MARGINAL_VERIFIED_GAIN"});
  return F({stop:false,reason:"CONTINUE"});
}
function createResearchResultPack({contract,agenda,lock,citationManifest,assessmentIds=[],gapIds=[],reportHash,verificationManifestHash=null}={}){
  if(!contract?.id||!agenda?.id||!lock?.id||!citationManifest?.id||!text(reportHash))throw Error("research result pack identity incomplete");if(agenda.researchContractId!==contract.id||lock.researchContractId!==contract.id||citationManifest.claimEvidenceLockId!==lock.id)throw Error("research result pack lineage mismatch");
  const b={schemaVersion:1,researchContractId:contract.id,agendaId:agenda.id,claimEvidenceLockId:lock.id,citationManifestId:citationManifest.id,assessmentIds:uniq(assessmentIds),gapIds:uniq(gapIds),reportHash:text(reportHash),verificationManifestHash:text(verificationManifestHash)||null};return F({...b,id:id("research-result-pack",b)});
}

module.exports=F({REL,REALMS,MODES,CLAIM_STATUS,METHODS,hash,createKnowledgeSource,createSourceVersion,createSourceLocator,createDerivedRepresentation,invalidateDerived,createKnowledgeResult,createRetrievalNeed,createQueryPlan,selectRetrievalPortfolio,createSearchObservation,createCandidateDocument,clusterCandidates,createFetchedSourceRef,createExtractedSegmentRef,createRetrievalRunManifest,createResearchContract,createClaimRef,createResearchAgenda,createEvidenceUnit,createCoverageContract,assessClaimEvidence,createClaimEvidenceLock,verifyClaimEvidenceLock,createCitationManifest,verifyCitationManifest,researchGaps,shouldStopResearch,createResearchResultPack});
