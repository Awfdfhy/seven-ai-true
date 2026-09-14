"use strict";

const crypto=require("crypto");
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function text(v){return typeof v==="string"?v.trim():"";}
function uniq(v){return [...new Set((Array.isArray(v)?v:[]).map(x=>text(x)).filter(Boolean))].sort();}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o;}return v;}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex");}
function ms(v){if(typeof v==="number"&&Number.isFinite(v))return v;const n=Date.parse(v);return Number.isFinite(n)?n:null;}
function now(v){return ms(v)??Date.now();}
function subset(child,parent){const p=new Set(parent||[]);return (child||[]).every(x=>p.has(x));}
function canonicalResource(v){return text(v).replace(/\\/g,"/").replace(/\/+/g,"/");}
function canonicalDestination(v){const raw=text(v);if(!raw)return "";try{return new URL(raw.includes("://")?raw:`https://${raw}`).hostname.toLowerCase();}catch{return "";}}
function resourceAllowed(resource,prefixes){const r=canonicalResource(resource);const ps=uniq(prefixes).map(canonicalResource);if(!r)return true;if(!ps.length)return false;return ps.some(p=>r===p||r.startsWith(p.endsWith("/")?p:p+"/"));}
function destinationAllowed(destination,allowed){const d=canonicalDestination(destination),list=uniq(allowed).map(canonicalDestination).filter(Boolean);if(!d)return destination?false:true;if(!list.length)return false;return list.some(x=>d===x||d.endsWith("."+x));}

function createPolicySnapshot(input={}){
  const epoch=Math.max(1,Number(input.epoch)||1),revocationEpoch=Math.max(0,Number(input.revocationEpoch)||0);
  return Object.freeze({schemaVersion:1,id:`policy-${hash({epoch,revocationEpoch,denies:input.denies||[],confirm:input.confirmEffectClasses||[]}).slice(0,24)}`,epoch,revocationEpoch,denies:(input.denies||[]).map(clone),confirmEffectClasses:uniq(input.confirmEffectClasses),createdAt:input.createdAt||new Date().toISOString()});
}
function createAuthorityGrant(input={}){
  const principalId=text(input.principalId),sourceEventId=text(input.sourceEventId),sourceKind=String(input.sourceKind||"").toUpperCase();if(!principalId||!sourceEventId||!["USER","SYSTEM","POLICY"].includes(sourceKind))throw new Error("authoritative principal/source event required");
  const capabilities=uniq(input.capabilities);if(!capabilities.length)throw new Error("empty capability grant fails closed");
  const issuedAt=now(input.issuedAt),expiresAt=ms(input.expiresAt);if(expiresAt!==null&&expiresAt<=issuedAt)throw new Error("grant expiry must follow issue time");
  const core={principalId,sourceEventId,sourceKind,capabilities,actions:uniq(input.actions),resourcePrefixes:uniq(input.resourcePrefixes),destinations:uniq(input.destinations).map(canonicalDestination).filter(Boolean),allowRelease:input.allowRelease===true,taskId:text(input.taskId)||null,projectId:text(input.projectId)||null,bindingRevisionId:text(input.bindingRevisionId)||null,schemaFingerprint:text(input.schemaFingerprint)||null,policyEpoch:Math.max(1,Number(input.policyEpoch)||1),revocationEpoch:Math.max(0,Number(input.revocationEpoch)||0),issuedAt,expiresAt};
  return Object.freeze({schemaVersion:1,id:`grant-${hash(core).slice(0,24)}`,...core,authoritative:true});
}
function createAuthorityLease({grant,capabilities,actions,resourcePrefixes,destinations,taskId,projectId,bindingRevisionId,schemaFingerprint,expiresAt,now:at=Date.now()}={}){
  if(!grant||grant.authoritative!==true)throw new Error("authoritative grant required");const caps=capabilities?uniq(capabilities):[...grant.capabilities],acts=actions?uniq(actions):[...grant.actions],resources=resourcePrefixes?uniq(resourcePrefixes):[...grant.resourcePrefixes],dests=destinations?uniq(destinations).map(canonicalDestination):[...grant.destinations];
  if(!subset(caps,grant.capabilities)||!subset(acts,grant.actions)||!subset(resources,grant.resourcePrefixes)||!subset(dests,grant.destinations))throw new Error("authority lease cannot widen parent scope");
  const t=now(at),parentExpiry=grant.expiresAt,exp=ms(expiresAt)??(parentExpiry??t+5*60*1000);if(parentExpiry!==null&&exp>parentExpiry)throw new Error("lease cannot outlive grant");if(exp<=t)throw new Error("lease already expired");
  const task=text(taskId)||grant.taskId,project=text(projectId)||grant.projectId;if(grant.taskId&&task!==grant.taskId)throw new Error("lease cannot change task scope");if(grant.projectId&&project!==grant.projectId)throw new Error("lease cannot change project scope");
  const binding=text(bindingRevisionId)||grant.bindingRevisionId,schema=text(schemaFingerprint)||grant.schemaFingerprint;if(grant.bindingRevisionId&&binding!==grant.bindingRevisionId)throw new Error("lease cannot change binding identity");if(grant.schemaFingerprint&&schema!==grant.schemaFingerprint)throw new Error("lease cannot change schema identity");
  const core={grantId:grant.id,principalId:grant.principalId,capabilities:caps,actions:acts,resourcePrefixes:resources,destinations:dests,allowRelease:grant.allowRelease,taskId:task||null,projectId:project||null,bindingRevisionId:binding||null,schemaFingerprint:schema||null,policyEpoch:grant.policyEpoch,revocationEpoch:grant.revocationEpoch,issuedAt:t,expiresAt:exp};
  return Object.freeze({schemaVersion:1,id:`authority-lease-${hash(core).slice(0,24)}`,...core,derivedFromAuthoritativeGrant:true});
}
function normalizeActionIntent(input={}){
  const principalId=text(input.principalId),capability=text(input.capability),action=text(input.action);if(!principalId||!capability||!action)throw new Error("principal capability and action required");
  return Object.freeze({schemaVersion:1,principalId,taskId:text(input.taskId)||null,projectId:text(input.projectId)||null,capability,action,resource:canonicalResource(input.resource),destination:canonicalDestination(input.destination),dataClasses:uniq(input.dataClasses),originTaints:uniq(input.originTaints),effectClass:String(input.effectClass||"OBSERVATIONAL").toUpperCase(),bindingRevisionId:text(input.bindingRevisionId)||null,schemaFingerprint:text(input.schemaFingerprint)||null,requiresConfirmation:input.requiresConfirmation===true,payloadFingerprint:text(input.payloadFingerprint)||null});
}
function actionFingerprint(intent){return hash({principalId:intent.principalId,taskId:intent.taskId,projectId:intent.projectId,capability:intent.capability,action:intent.action,resource:intent.resource,destination:intent.destination,dataClasses:intent.dataClasses,effectClass:intent.effectClass,bindingRevisionId:intent.bindingRevisionId,schemaFingerprint:intent.schemaFingerprint,payloadFingerprint:intent.payloadFingerprint});}
function createConfirmationReceipt({intent,principalId,policyEpoch,sourceEventId,expiresAt,now:at=Date.now()}={}){
  if(!intent)throw new Error("intent required");const p=text(principalId)||intent.principalId,source=text(sourceEventId);if(!source||p!==intent.principalId)throw new Error("authoritative confirmation source/principal required");const t=now(at),exp=ms(expiresAt)??t+2*60*1000;if(exp<=t)throw new Error("confirmation expired");const fingerprint=actionFingerprint(intent);return Object.freeze({schemaVersion:1,id:`confirm-${hash({fingerprint,p,source,t}).slice(0,24)}`,actionFingerprint:fingerprint,principalId:p,policyEpoch:Math.max(1,Number(policyEpoch)||1),sourceEventId:source,issuedAt:t,expiresAt:exp});
}
function denyMatches(rule,intent){if(!rule)return false;if(rule.principalId&&rule.principalId!==intent.principalId)return false;if(rule.capability&&rule.capability!==intent.capability)return false;if(rule.action&&rule.action!==intent.action)return false;if(rule.resourcePrefix&&!resourceAllowed(intent.resource,[rule.resourcePrefix]))return false;if(rule.destination&&!destinationAllowed(intent.destination,[rule.destination]))return false;return true;}
function authorizationCacheKey({intent,grant,lease,policy}={}){return hash({fingerprint:actionFingerprint(intent),grantId:grant&&grant.id,leaseId:lease&&lease.id,policyId:policy&&policy.id,principalId:intent&&intent.principalId,bindingRevisionId:intent&&intent.bindingRevisionId,schemaFingerprint:intent&&intent.schemaFingerprint});}
function authorize({intent,grant,lease=null,policy,confirmation=null,now:at=Date.now()}={}){
  if(!intent||!grant||!policy)return {decision:"DENY",reason:"missing-authority-input"};const t=now(at);
  if(grant.authoritative!==true||!grant.sourceEventId)return {decision:"DENY",reason:"non-authoritative-grant"};
  if(policy.denies.some(r=>denyMatches(r,intent)))return {decision:"DENY",reason:"explicit-deny"};
  if(grant.principalId!==intent.principalId)return {decision:"DENY",reason:"principal-mismatch"};
  if(grant.expiresAt!==null&&t>=grant.expiresAt)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"grant-expired"};
  if(policy.revocationEpoch>grant.revocationEpoch)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"revocation-epoch-advanced"};
  if(policy.epoch!==grant.policyEpoch)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"policy-epoch-changed"};
  const scope=lease||grant;if(lease){if(lease.grantId!==grant.id||lease.principalId!==grant.principalId)return {decision:"DENY",reason:"lease-parent-mismatch"};if(t>=lease.expiresAt)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"lease-expired"};if(lease.policyEpoch!==policy.epoch||lease.revocationEpoch<policy.revocationEpoch)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"lease-stale"};}
  if(!scope.capabilities.includes(intent.capability))return {decision:"DENY",reason:"capability-outside-authority"};
  if(scope.actions.length&&!scope.actions.includes(intent.action))return {decision:"DENY",reason:"action-outside-authority"};
  if(scope.taskId&&scope.taskId!==intent.taskId)return {decision:"DENY",reason:"task-scope-mismatch"};if(scope.projectId&&scope.projectId!==intent.projectId)return {decision:"DENY",reason:"project-scope-mismatch"};
  if(intent.resource&&!resourceAllowed(intent.resource,scope.resourcePrefixes))return {decision:"DENY",reason:"resource-outside-authority"};
  if(intent.destination&&!destinationAllowed(intent.destination,scope.destinations))return {decision:"DENY",reason:"destination-outside-authority"};
  if(intent.destination&&intent.dataClasses.length&&scope.allowRelease!==true)return {decision:"DENY",reason:"read-does-not-grant-release"};
  if(scope.bindingRevisionId&&scope.bindingRevisionId!==intent.bindingRevisionId)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"binding-revision-drift"};if(scope.schemaFingerprint&&scope.schemaFingerprint!==intent.schemaFingerprint)return {decision:"BLOCKED_NEEDS_REAUTH",reason:"schema-drift"};
  const confirmNeeded=intent.requiresConfirmation||policy.confirmEffectClasses.includes(intent.effectClass);if(confirmNeeded){const fp=actionFingerprint(intent);if(!confirmation)return {decision:"ALLOW_WITH_CONFIRMATION",reason:"confirmation-required",actionFingerprint:fp};if(confirmation.principalId!==intent.principalId||confirmation.actionFingerprint!==fp||confirmation.policyEpoch!==policy.epoch||t>=confirmation.expiresAt)return {decision:"ALLOW_WITH_CONFIRMATION",reason:"confirmation-invalid-or-stale",actionFingerprint:fp};}
  const bindingRevisionId=intent.bindingRevisionId,schemaFingerprint=intent.schemaFingerprint;const id=`auth-${hash({intent:actionFingerprint(intent),grant:grant.id,lease:lease&&lease.id,policy:policy.id}).slice(0,24)}`;return {decision:"ALLOW",reason:"least-privilege-match",receipt:Object.freeze({schemaVersion:1,id,decision:"ALLOW",principalId:intent.principalId,grantId:grant.id,leaseId:lease&&lease.id||null,policyId:policy.id,policyEpoch:policy.epoch,actionFingerprint:actionFingerprint(intent),bindingRevisionId,schemaFingerprint,issuedAt:t}),cacheKey:authorizationCacheKey({intent,grant,lease,policy})};
}
function createSublease({parentGrant,parentLease,...rest}={}){const base=parentLease?Object.freeze({...parentGrant,id:parentLease.grantId,principalId:parentLease.principalId,capabilities:parentLease.capabilities,actions:parentLease.actions,resourcePrefixes:parentLease.resourcePrefixes,destinations:parentLease.destinations,allowRelease:parentLease.allowRelease,taskId:parentLease.taskId,projectId:parentLease.projectId,bindingRevisionId:parentLease.bindingRevisionId,schemaFingerprint:parentLease.schemaFingerprint,policyEpoch:parentLease.policyEpoch,revocationEpoch:parentLease.revocationEpoch,expiresAt:parentLease.expiresAt,authoritative:true}):parentGrant;return createAuthorityLease({grant:base,...rest});}
function contentCanGrantAuthority(){return false;}

module.exports={canonicalResource,canonicalDestination,resourceAllowed,destinationAllowed,createPolicySnapshot,createAuthorityGrant,createAuthorityLease,createSublease,normalizeActionIntent,actionFingerprint,createConfirmationReceipt,authorizationCacheKey,authorize,contentCanGrantAuthority};
