"use strict";
const crypto=require("crypto");
const F=Object.freeze;
const REL=F(["SUPPORT","CONTRADICT","QUALIFY","DEFINE","ATTRIBUTE","CONTEXT","DUPLICATE","DEPEND"]);
const REALMS=F(["OPEN_WEB","CONNECTED","PROJECT","LOCAL","USER","STRUCTURED"]);
const MODES=F(["QUICK","STANDARD","DEEP"]);
const CLAIM_STATUS=F(["SUPPORTED","GAP","STALE","CONFLICT","UNCITABLE","NOT_FOUND_COVERED"]);
function text(v){return typeof v==="string"?v.trim():"";}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o;}return v;}
function hash(v){return crypto.createHash("sha256").update(typeof v==="string"?v:JSON.stringify(stable(v))).digest("hex");}
function uniq(a){return [...new Set((Array.isArray(a)?a:[]).map(text).filter(Boolean))].sort();}
function enumv(v,set,fallback){const x=String(v||fallback).toUpperCase();if(!set.includes(x))throw Error(`invalid value:${x}`);return x;}
function ms(v){if(v==null)return null;const n=typeof v==="number"?v:Date.parse(v);if(!Number.isFinite(n))throw Error("invalid time");return n;}
function nonneg(v,name){const n=Number(v);if(!Number.isFinite(n)||n<0)throw Error(`${name} invalid`);return n;}
function url(v){try{const u=new URL(v);if(!["https:","http:"].includes(u.protocol))return null;u.hash="";return u.href;}catch{return null;}}
function id(prefix,body){return `${prefix}-${hash(body).slice(0,24)}`;}

// Knowledge Fabric: canonical source/version first; all other forms are derived.
function createKnowledgeSource(i={}){
  const sourceId=text(i.sourceId),realm=enumv(i.realm,REALMS,"LOCAL"),principalId=text(i.principalId),canonicalRef=text(i.canonicalRef);
  if(!sourceId||!principalId||!canonicalRef)throw Error("knowledge source identity incomplete");
  const b={schemaVersion:1,sourceId,realm,principalId,scopeId:text(i.scopeId)||null,canonicalRef,mediaType:text(i.mediaType)||"application/octet-stream",title:text(i.title)||sourceId};
  return F({...b,id:id("knowledge-source",b)});
}
function createSourceVersion({source,versionKey,contentHash,byteLength,observedAt,publishedAt=null,updatedAt=null,provenanceHash,availability="AVAILABLE"}={}){
  if(!source?.id||!text(versionKey)||!text(contentHash)||!text(provenanceHash))throw Error("source version identity incomplete");
  const size=Number(byteLength);if(!Number.isInteger(size)||size<0)throw Error("source version byteLength invalid");
  const b={schemaVersion:1,sourceId:source.id,sourceRealm:source.realm,principalId:source.principalId,scopeId:source.scopeId,versionKey:text(versionKey),contentHash:text(contentHash),byteLength:size,observedAt:ms(observedAt)??Date.now(),publishedAt:ms(publishedAt),updatedAt:ms(updatedAt),provenanceHash:text(provenanceHash),availability:String(availability).toUpperCase()};
  return F({...b,id:id("source-version",b)});
}
function createSourceLocator({sourceVersion,kind="TEXT_RANGE",page=null,start=null,end=null,selector=null,region=null,label=null}={}){
  if(!sourceVersion?.id)throw Error("source version required");const k=String(kind).toUpperCase();
  const b={schemaVersion:1,sourceVersionId:sourceVersion.id,kind:k,page:Number.isInteger(page)&&page>0?page:null,start:Number.isInteger(start)&&start>=0?start:null,end:Number.isInteger(end)&&end>=0?end:null,selector:text(selector)||null,region:region?stable(region):null,label:text(label)||null};
  if(k==="TEXT_RANGE"&&(b.start==null||b.end==null||b.end<b.start))throw Error("text locator range invalid");
  if(k==="PAGE"&&b.page==null)throw Error("page locator required");
  if(k==="REGION"&&!b.region)throw Error("region locator required");
  if(!["TEXT_RANGE","PAGE","REGION","SELECTOR","RECORD","WHOLE"].includes(k))throw Error("invalid locator kind");
  if(k==="SELECTOR"&&!b.selector)throw Error("selector required");
  return F({...b,id:id("source-locator",b)});
}
function createDerivedRepresentation({sourceVersion,kind,contentHash,transformHash,parentIds=[],confidence=null}={}){
  if(!sourceVersion?.id||!text(kind)||!text(contentHash)||!text(transformHash))throw Error("derived representation identity incomplete");
  const c=confidence==null?null:Number(confidence);if(c!=null&&(!Number.isFinite(c)||c<0||c>1))throw Error("derived confidence invalid");
  const b={schemaVersion:1,sourceVersionId:sourceVersion.id,kind:String(kind).toUpperCase(),contentHash:text(contentHash),transformHash:text(transformHash),parentIds:uniq(parentIds),confidence:c,authoritative:false,rebuildable:true};
  return F({...b,id:id("derived-representation",b)});
}
function invalidateDerived({currentSourceVersion,derived=[]}={}){if(!currentSourceVersion?.id)throw Error("current source version required");const stale=(derived||[]).filter(x=>x?.sourceVersionId!==currentSourceVersion.id).map(x=>x.id).filter(Boolean);return F({valid:stale.length===0,staleIds:stale.sort(),currentSourceVersionId:currentSourceVersion.id});}
function createKnowledgeResult({sourceVersion,locator,contentHash,queryId,score=0,representationId=null}={}){
  if(!sourceVersion?.id||!locator?.id||locator.sourceVersionId!==sourceVersion.id||!text(contentHash)||!text(queryId))throw Error("knowledge result lineage incomplete");
  const s=Number(score);if(!Number.isFinite(s))throw Error("knowledge score invalid");
  const b={schemaVersion:1,sourceVersionId:sourceVersion.id,locatorId:locator.id,contentHash:text(contentHash),queryId:text(queryId),score:s,representationId:text(representationId)||null,grantsAuthority:false};
  return F({...b,id:id("knowledge-result",b)});
}

// Retrieval Fabric: discovery only until exact source version + extract exists.
function createRetrievalNeed(i={}){
  const needId=text(i.needId),claimId=text(i.claimId),query=text(i.query);if(!needId||!claimId||!query)throw Error("retrieval need identity incomplete");
  const realms=(i.realms?.length?i.realms:["OPEN_WEB"]).map(x=>enumv(x,REALMS));
  const b={schemaVersion:1,needId,claimId,query,language:text(i.language)||"und",realms:[...new Set(realms)].sort(),freshnessDays:i.freshnessDays==null?null:nonneg(i.freshnessDays,"retrieval freshnessDays"),exactPreferred:i.exactPreferred!==false,semanticNeed:i.semanticNeed===true,scopeHash:text(i.scopeHash)||null};
  return F({...b,id:id("retrieval-need",b)});
}
function createQueryPlan({need,variants=[]}={}){
  if(!need?.id)throw Error("retrieval need required");
  const rows=(variants.length?variants:[{query:need.query,method:"LEXICAL"}]).map((v,n)=>({id:text(v.id)||`q${n+1}`,query:text(v.query),method:String(v.method||"LEXICAL").toUpperCase(),parentId:text(v.parentId)||null,rewriteReason:text(v.rewriteReason)||null}));
  if(rows.some(x=>!x.query||!["EXACT","LEXICAL","METADATA","SEMANTIC","HYBRID","CITATION_CHASE","STRUCTURED","BROWSER"].includes(x.method)))throw Error("query variant invalid");
  const b={schemaVersion:1,retrievalNeedId:need.id,claimId:need.claimId,originalQuery:need.query,variants:rows};
  return F({...b,id:id("query-plan",b)});
}
function selectRetrievalPortfolio({need,resourceTier="BALANCED",lexicalHit=false,exactHit=false,semanticUtility=0}={}){
  if(!need?.id)throw Error("retrieval need required");const tier=String(resourceTier).toUpperCase(),methods=[];
  if(need.exactPreferred)methods.push("EXACT");methods.push("LEXICAL");
  if(!exactHit&&!lexicalHit&&tier!=="LITE"&&need.semanticNeed&&Number(semanticUtility)>0)methods.push("SEMANTIC","HYBRID");
  return F({retrievalNeedId:need.id,resourceTier:tier,methods:[...new Set(methods)],semanticRequired:false});
}
function createSearchObservation({plan