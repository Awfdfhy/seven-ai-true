(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilitySecurity=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const check=(v,m)=>{if(!v)throw new Error(m)};
const now=()=>Date.now();
const stable=v=>{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(stable).join(',')+']';return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';};
function bytesToHex(bytes){return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');}
async function sha256(value){const text=typeof value==='string'?value:stable(value),enc=typeof TextEncoder!=='undefined'?new TextEncoder().encode(text):null;if(globalThis.crypto?.subtle&&enc)return bytesToHex(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',enc)));if(typeof require==='function'){try{const crypto=require('crypto');return crypto.createHash('sha256').update(text).digest('hex');}catch{}}let h1=0x811c9dc5,h2=0x9e3779b9;for(let i=0;i<text.length;i++){h1=Math.imul(h1^text.charCodeAt(i),16777619);h2=Math.imul(h2+text.charCodeAt(i),2246822519);}return`fallback-${(h1>>>0).toString(16).padStart(8,'0')}${(h2>>>0).toString(16).padStart(8,'0')}`;}
function secureId(prefix='id'){if(globalThis.crypto?.randomUUID)return`${prefix}_${globalThis.crypto.randomUUID()}`;if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(4);globalThis.crypto.getRandomValues(a);return`${prefix}_${[...a].map(x=>x.toString(16).padStart(8,'0')).join('')}`;}return`${prefix}_${now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;}

class DefinitionIntegrityStore{
 constructor(){this.rows=new Map();this.events=[];}
 securityProjection(g={}){return{id:g.id,version:g.version,providerId:g.providerId,protocol:g.protocol,description:g.description,inputSchema:g.inputSchema,outputSchema:g.outputSchema,actionClass:g.actionClass,sideEffects:g.sideEffects,permissions:g.permissions,network:g.network,privacy:g.privacy,trustZone:g.trustZone,authority:g.authority,implementationHash:g.implementationHash||'',metadata:{source:g.metadata?.source||null,originalName:g.metadata?.originalName||null}};}
 async pin(g,input={}){check(g?.id,'INTEGRITY_CAPABILITY_REQUIRED');const digest=await sha256(this.securityProjection(g)),old=this.rows.get(g.id);if(old&&old.digest!==digest&&!input.reviewed)throw new Error('CAPABILITY_INTEGRITY_REVIEW_REQUIRED');const row={capabilityId:g.id,digest,version:String(g.version||'1'),providerId:g.providerId||null,approvedBy:input.approvedBy||'system',approvedAt:now()};this.rows.set(g.id,row);this.events.push({type:old?'repin':'pin',at:now(),row:clone(row)});return clone(row);}
 async verify(g){const p=this.rows.get(g?.id);if(!p)return{ok:false,reason:'UNPINNED'};const actual=await sha256(this.securityProjection(g));return actual===p.digest?{ok:true,digest:actual}:{ok:false,reason:'DEFINITION_MUTATED',expected:p.digest,actual};}
 quarantine(id,reason='INTEGRITY_FAILURE'){const row=this.rows.get(id);if(row)row.quarantined={reason,at:now()};this.events.push({type:'quarantine',capabilityId:id,reason,at:now()});}
 isQuarantined(id){return !!this.rows.get(id)?.quarantined;}
}

class SecretVaultBoundary{
 constructor(){this.secrets=new Map();}
 put(value,input={}){check(value!==undefined&&value!==null,'SECRET_VALUE_REQUIRED');const ref=input.ref||secureId('secret');this.secrets.set(ref,{value:String(value),scope:input.scope||'*',providerId:input.providerId||null,createdAt:now(),expiresAt:input.expiresAt||null});return{credentialRef:ref,scope:input.scope||'*',providerId:input.providerId||null};}
 describe(ref){const id=typeof ref==='string'?ref:ref?.credentialRef,x=this.secrets.get(id);check(x,'SECRET_REF_NOT_FOUND');return{credentialRef:id,scope:x.scope,providerId:x.providerId,expiresAt:x.expiresAt};}
 resolveForTransport(ref,input={}){const id=typeof ref==='string'?ref:ref?.credentialRef,x=this.secrets.get(id);check(x,'SECRET_REF_NOT_FOUND');check(!x.expiresAt||x.expiresAt>now(),'SECRET_REF_EXPIRED');if(x.scope!=='*')check(x.scope===input.scope,'SECRET_SCOPE_BLOCKED');if(x.providerId)check(x.providerId===input.providerId,'SECRET_PROVIDER_BLOCKED');check(input.transportBoundary===true,'SECRET_TRANSPORT_BOUNDARY_REQUIRED');return x.value;}
 revoke(ref){const id=typeof ref==='string'?ref:ref?.credentialRef;return this.secrets.delete(id);}
}

class TaintTracker{
 constructor(){this.labels=new WeakMap();this.refs=new Map();}
 label(value,labels=[]){const set=new Set(labels);if(value&&typeof value==='object')this.labels.set(value,set);return value;}
 labels(value){return value&&typeof value==='object'?[...(this.labels.get(value)||[])]:[];}
 bind(ref,labels=[]){this.refs.set(String(ref),new Set(labels));}
 labelsForRef(ref){return[...(this.refs.get(String(ref))||[])];}
 combine(...groups){return[...new Set(groups.flat().filter(Boolean))];}
}

class CrossToolExfiltrationGuard{
 constructor(input={}){this.sensitivity={public:0,untrusted:1,private:2,project_internal:3,secret:4,...(input.sensitivity||{})};this.events=[];}
 inspect(input={}){const labels=[...new Set(input.labels||[])],destination=input.destination||{},max=Math.max(0,...labels.map(x=>this.sensitivity[x]??2)),allowed=this.sensitivity[destination.maxSensitivity||'private']??2;let decision={ok:true};if(max>allowed)decision={ok:false,reason:'SENSITIVITY_FLOW_BLOCKED'};else if(labels.includes('secret')&&destination.network===true&&!destination.secretAuthorized)decision={ok:false,reason:'SECRET_EGRESS_BLOCKED'};else if(labels.includes('project_internal')&&destination.network===true&&!destination.projectEgressAuthorized)decision={ok:false,reason:'PROJECT_EGRESS_BLOCKED'};else if(labels.includes('untrusted')&&!['pure','read'].includes(destination.actionClass||'read'))decision={ok:false,reason:'UNTRUSTED_SIDE_EFFECT_BLOCKED'};this.events.push({at:now(),from:input.from||null,to:destination.capabilityId||null,labels,decision:clone(decision)});return decision;}
}

class CapabilityRiskEngine{
 score(g={},input={}){const action={pure:0,read:.08,write:.42,external_action:.72,irreversible:1}[g.actionClass]??.5,trust=Math.min(1,Math.max(0,Number(g.trustZone??4)/5)),sensitivity={public:0,private:.25,project_internal:.45,secret:.9}[input.dataSensitivity||g.privacy]??.35,scope=input.scope==='*'?.35:0,reversible=g.reversible===false?.25:0,network=g.network==='required'?.15:0,novelty=input.novel?0.15:0;return Math.min(1,action*.38+trust*.2+sensitivity*.2+scope*.08+reversible*.08+network*.04+novelty*.02);}
 decision(g,input={}){const score=this.score(g,input),threshold=Number(input.threshold??.55);if(score>=.85)return{score,level:'critical',requiresExplicitConfirmation:true,allowAuto:false};if(score>=threshold)return{score,level:'high',requiresExplicitConfirmation:true,allowAuto:false};if(score>=.3)return{score,level:'medium',requiresExplicitConfirmation:false,allowAuto:input.autoMedium===true};return{score,level:'low',requiresExplicitConfirmation:false,allowAuto:true};}
}

class CapabilityLeaseKernel{
 constructor(){this.leases=new Map();}
 grant(input={}){check(input.capabilityId&&input.scope,'LEASE_FIELDS_REQUIRED');const id=input.id||secureId('lease'),row={id,capabilityId:String(input.capabilityId),scope:String(input.scope),taskId:input.taskId||null,actionClasses:[...new Set(input.actionClasses||['read'])],sourceEventRef:input.sourceEventRef||null,issuedAt:now(),expiresAt:input.expiresAt||now()+Math.max(1000,Number(input.ttlMs||300000)),revoked:false};this.leases.set(id,row);return clone(row);}
 revoke(id){const x=this.leases.get(id);if(x){x.revoked=true;x.revokedAt=now();}return !!x;}
 authorize(g,input={}){if(g.actionClass==='pure')return{ok:true,reason:'PURE'};const t=now();for(const x of this.leases.values()){if(x.revoked||x.expiresAt<=t||x.capabilityId!==g.id)continue;if(x.scope!=='*'&&x.scope!==input.scope)continue;if(x.taskId&&x.taskId!==input.taskId)continue;if(!x.actionClasses.includes(g.actionClass))continue;return{ok:true,leaseId:x.id,sourceEventRef:x.sourceEventRef};}return{ok:false,reason:'LEASE_REQUIRED'};}
 sweep(){const t=now();for(const[id,x]of this.leases)if(x.expiresAt<=t||x.revoked)this.leases.delete(id);}
}

class SupplyChainGate{
 constructor(input={}){this.integrity=input.integrity||new DefinitionIntegrityStore();this.states=new Map();}
 async admit(g,input={}){const pin=await this.integrity.pin(g,{reviewed:input.reviewed===true,approvedBy:input.approvedBy});const state=input.shadow?'shadow':input.canary?'canary':'approved';this.states.set(g.id,{state,at:now(),digest:pin.digest});return{capabilityId:g.id,state,digest:pin.digest};}
 async verifyBeforeRun(g){if(this.integrity.isQuarantined(g.id))return{ok:false,reason:'QUARANTINED'};const v=await this.integrity.verify(g);if(!v.ok){this.integrity.quarantine(g.id,v.reason);return v;}const state=this.states.get(g.id)?.state||'unapproved';return state==='unapproved'?{ok:false,reason:'SUPPLY_CHAIN_UNAPPROVED'}:{ok:true,state,digest:v.digest};}
 promote(id,to='approved'){const x=this.states.get(id);check(x,'SUPPLY_CHAIN_UNKNOWN');check(['shadow','canary','approved'].includes(to),'SUPPLY_CHAIN_STATE_INVALID');x.state=to;x.at=now();return clone(x);}
}

class SecurityPolicyKernel{
 constructor(input={}){this.risk=input.risk||new CapabilityRiskEngine();this.egress=input.egress||new CrossToolExfiltrationGuard();this.supply=input.supply||null;}
 async beforeExecute(g,input={}){if(this.supply){const s=await this.supply.verifyBeforeRun(g);if(!s.ok)return{ok:false,reason:s.reason};}const risk=this.risk.decision(g,input);if(risk.requiresExplicitConfirmation&&input.explicitConfirmation!==true)return{ok:false,reason:'EXPLICIT_CONFIRMATION_REQUIRED',risk};const flow=this.egress.inspect({from:input.from,labels:input.inputLabels||[],destination:{capabilityId:g.id,actionClass:g.actionClass,network:g.network==='required',maxSensitivity:input.maxDestinationSensitivity||'private',secretAuthorized:input.secretAuthorized,projectEgressAuthorized:input.projectEgressAuthorized}});if(!flow.ok)return flow;return{ok:true,risk};}
}

return{sha256,secureId,DefinitionIntegrityStore,SecretVaultBoundary,TaintTracker,CrossToolExfiltrationGuard,CapabilityRiskEngine,CapabilityLeaseKernel,SupplyChainGate,SecurityPolicyKernel};
});