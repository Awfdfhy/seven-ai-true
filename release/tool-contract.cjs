"use strict";

const ERROR_CODES=Object.freeze(["TIMEOUT","NETWORK_ERROR","AUTH_ERROR","VALIDATION_ERROR","PERMISSION_ERROR","UNAVAILABLE","RATE_LIMIT","TOOL_ERROR","MALFORMED_OUTPUT","CANCELLED","INTERNAL_ERROR"]);
const ERROR_CODE_SET=new Set(ERROR_CODES);
const RISK=Object.freeze({none:"NONE",read:"READ",low:"READ",write:"WRITE",side_effect:"WRITE",sideeffect:"WRITE",high:"HIGH",critical:"CRITICAL"});
const SCHEMA_KEYS=new Set(["type","properties","required","additionalProperties","items","enum","description","title","default","minLength","maxLength","minimum","maximum","minItems","maxItems"]);
function text(v){return String(v==null?"":v).trim()}
function normalizeRisk(v){const k=text(v).toLowerCase().replace(/[ -]/g,"_");return RISK[k]||"HIGH"}
function list(v){if(v==null)return[];return(Array.isArray(v)?v:[v]).map(text).filter(Boolean)}
function cloneValue(v,seen=new WeakSet()){
 if(Array.isArray(v)){if(seen.has(v))throw new Error("cyclic-contract-value");seen.add(v);const out=v.map(x=>cloneValue(x,seen));seen.delete(v);return out}
 if(v&&typeof v==="object"){if(seen.has(v))throw new Error("cyclic-contract-value");seen.add(v);const out={};for(const [k,x] of Object.entries(v))out[k]=cloneValue(x,seen);seen.delete(v);return out}
 return v;
}
function deepFreeze(v){if(!v||typeof v!=="object"||Object.isFrozen(v))return v;for(const x of Object.values(v))deepFreeze(x);return Object.freeze(v)}
function validateSchema(schema,value,path="$"){
 const issues=[];
 if(!schema||typeof schema!=="object"||Array.isArray(schema))return[{path,reason:"invalid-schema"}];
 for(const key of Object.keys(schema))if(!SCHEMA_KEYS.has(key))issues.push({path,reason:"unsupported-schema-key:"+key});
 if(Array.isArray(schema.enum)&&!schema.enum.some(x=>JSON.stringify(x)===JSON.stringify(value)))issues.push({path,reason:"enum"});
 const type=schema.type;
 if(type){
  const ok=type==="object"?!!value&&typeof value==="object"&&!Array.isArray(value):
   type==="array"?Array.isArray(value):type==="string"?typeof value==="string":
   type==="number"?typeof value==="number"&&Number.isFinite(value):type==="integer"?Number.isInteger(value):
   type==="boolean"?typeof value==="boolean":type==="null"?value===null:false;
  if(!ok){issues.push({path,reason:"type:"+type});return issues}
 }
 if(type==="object"&&value&&typeof value==="object"&&!Array.isArray(value)){
  const props=schema.properties&&typeof schema.properties==="object"&&!Array.isArray(schema.properties)?schema.properties:{};
  for(const key of Array.isArray(schema.required)?schema.required:[])if(!Object.prototype.hasOwnProperty.call(value,key))issues.push({path:path+"."+key,reason:"required"});
  if(schema.additionalProperties===false)for(const key of Object.keys(value))if(!Object.prototype.hasOwnProperty.call(props,key))issues.push({path:path+"."+key,reason:"additional-property"});
  for(const [key,child] of Object.entries(props))if(Object.prototype.hasOwnProperty.call(value,key))issues.push(...validateSchema(child,value[key],path+"."+key));
 }
 if(type==="array"&&Array.isArray(value)){
  if(Number.isFinite(schema.minItems)&&value.length<schema.minItems)issues.push({path,reason:"minItems"});
  if(Number.isFinite(schema.maxItems)&&value.length>schema.maxItems)issues.push({path,reason:"maxItems"});
  if(schema.items)for(let i=0;i<value.length;i++)issues.push(...validateSchema(schema.items,value[i],path+"["+i+"]"));
 }
 if(type==="string"&&typeof value==="string"){
  if(Number.isFinite(schema.minLength)&&value.length<schema.minLength)issues.push({path,reason:"minLength"});
  if(Number.isFinite(schema.maxLength)&&value.length>schema.maxLength)issues.push({path,reason:"maxLength"});
 }
 if((type==="number"||type==="integer")&&typeof value==="number"){
  if(Number.isFinite(schema.minimum)&&value<schema.minimum)issues.push({path,reason:"minimum"});
  if(Number.isFinite(schema.maximum)&&value>schema.maximum)issues.push({path,reason:"maximum"});
 }
 return issues;
}
function normalizeTool(raw={}){
 const id=text(raw.id||raw.name);if(!id)throw new Error("tool id required");
 const schema=cloneValue(raw.inputSchema||raw.schema||{type:"object",properties:{},additionalProperties:false});
 if(!schema||typeof schema!=="object"||Array.isArray(schema))throw new Error("invalid tool input schema");
 const outputSchema=raw.outputSchema&&typeof raw.outputSchema==="object"&&!Array.isArray(raw.outputSchema)?cloneValue(raw.outputSchema):null;
 const timeoutMs=Math.max(100,Math.min(120000,Number(raw.timeoutMs||raw.timeout||15000)||15000));
 const risk=normalizeRisk(raw.risk||raw.riskLevel),sideEffect=raw.sideEffect===true||["WRITE","HIGH","CRITICAL"].includes(risk),idempotent=raw.idempotent===true;
 const requestedRetries=Math.max(0,Math.min(3,Number((raw.retryPolicy&&raw.retryPolicy.maxRetries)??raw.maxRetries??0)||0));
 const retries=sideEffect&&!idempotent?0:requestedRetries;
 const abortSemantics=raw.abortSemantics==="cooperative"||raw.supportsAbort===true?"cooperative":(sideEffect?"none":"quarantine");
 return Object.freeze({
  id,name:text(raw.name||id),inputSchema:deepFreeze(schema),outputSchema:outputSchema?deepFreeze(outputSchema):null,
  risk,permissions:Object.freeze(list(raw.permissions??raw.requiredPermissions)),resources:Object.freeze(list(raw.resources??raw.allowedResources)),
  sideEffect,idempotent,confirmationRequired:raw.confirmationRequired===true||risk==="CRITICAL",
  timeoutMs,retryPolicy:Object.freeze({maxRetries:retries}),cancelable:raw.cancelable!==false,abortSemantics,
  executor:typeof raw.executor==="function"?raw.executor:null,metadata:deepFreeze(cloneValue(raw.metadata||{}))
 });
}
function errorEnvelope(error,meta={}){
 let code=text(error&&error.code).toUpperCase();
 if(!ERROR_CODE_SET.has(code)){const m=text(error&&error.message).toLowerCase();code=m.includes("timeout")?"TIMEOUT":m.includes("cancel")?"CANCELLED":m.includes("auth")?"AUTH_ERROR":m.includes("permission")?"PERMISSION_ERROR":"TOOL_ERROR"}
 return Object.freeze({ok:false,error:Object.freeze({code,message:text(error&&error.message||code),retryable:code==="NETWORK_ERROR"||code==="RATE_LIMIT"||code==="TIMEOUT"}),audit:deepFreeze(cloneValue(meta))});
}
function successEnvelope(output,meta={}){return Object.freeze({ok:true,output,audit:deepFreeze(cloneValue(meta))})}
function createRegistry(rawTools=[]){const map=new Map();for(const raw of rawTools){const t=normalizeTool(raw);if(map.has(t.id))throw new Error("duplicate tool id: "+t.id);map.set(t.id,t)}return Object.freeze({list:()=>[...map.values()],get:id=>map.get(String(id))||null})}
async function execute({tool,input,authorize,signal,traceId,now=()=>Date.now()}={}){
 const t=normalizeTool(tool),started=now(),baseAudit={toolId:t.id,traceId:text(traceId)||null,startedAt:started,risk:t.risk};
 if(!t.executor)return errorEnvelope(Object.assign(new Error("tool unavailable"),{code:"UNAVAILABLE"}),baseAudit);
 const inputIssues=validateSchema(t.inputSchema,input);
 if(inputIssues.length)return errorEnvelope(Object.assign(new Error("tool input validation failed"),{code:"VALIDATION_ERROR"}),{...baseAudit,validationIssues:inputIssues.slice(0,20)});
 if(signal&&signal.aborted)return errorEnvelope(Object.assign(new Error("cancelled"),{code:"CANCELLED"}),baseAudit);
 if(typeof authorize!=="function")return errorEnvelope(Object.assign(new Error("permission gate unavailable"),{code:"PERMISSION_ERROR"}),baseAudit);
 let auth;try{auth=await authorize(t,input)}catch(e){return errorEnvelope(Object.assign(e,{code:e.code||"PERMISSION_ERROR"}),baseAudit)}
 if(!auth||auth.allowed!==true)return errorEnvelope(Object.assign(new Error(auth&&auth.reason||"permission denied"),{code:"PERMISSION_ERROR"}),baseAudit);
 if(t.sideEffect&&t.abortSemantics!=="cooperative"&&t.timeoutMs>0)return errorEnvelope(Object.assign(new Error("side-effect tool lacks cooperative abort contract"),{code:"UNAVAILABLE"}),{...baseAudit,reason:"unsafe-timeout-semantics"});
 const maxAttempts=1+t.retryPolicy.maxRetries;
 for(let attempt=1;attempt<=maxAttempts;attempt+=1){
  if(signal&&signal.aborted)return errorEnvelope(Object.assign(new Error("cancelled"),{code:"CANCELLED"}),{...baseAudit,attempt,attempts:attempt});
  const controller=typeof AbortController==="function"?new AbortController():null;
  let timer,parentAbort,settled=false;
  const effectiveSignal=controller?controller.signal:signal;
  try{
   const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{reject(Object.assign(new Error("tool timeout"),{code:"TIMEOUT"}));if(controller&&!controller.signal.aborted)controller.abort("timeout")},t.timeoutMs)});
   const cancelled=new Promise((_,reject)=>{
    if(signal){parentAbort=()=>{reject(Object.assign(new Error("cancelled"),{code:"CANCELLED"}));if(controller&&!controller.signal.aborted)controller.abort("caller-cancelled")};signal.addEventListener("abort",parentAbort,{once:true})}
   });
   const execution=Promise.resolve().then(()=>t.executor(input,{signal:effectiveSignal,traceId,attempt})).then(
    output=>{settled=true;return output},
    error=>{settled=true;throw error}
   );
   const output=await Promise.race([execution,timeout,cancelled]);
   if(t.outputSchema){const outputIssues=validateSchema(t.outputSchema,output);if(outputIssues.length)return errorEnvelope(Object.assign(new Error("tool output validation failed"),{code:"MALFORMED_OUTPUT"}),{...baseAudit,attempt,attempts:attempt,validationIssues:outputIssues.slice(0,20)})}
   return successEnvelope(output,{...baseAudit,attempt,attempts:attempt,finishedAt:now(),durationMs:Math.max(0,now()-started)});
  }catch(e){
   const failed=errorEnvelope(e,{...baseAudit,attempt,attempts:attempt,finishedAt:now(),durationMs:Math.max(0,now()-started),lateResultPolicy:settled?"settled":"quarantine"});
   if(!failed.error.retryable||attempt>=maxAttempts||(signal&&signal.aborted))return failed;
  }finally{if(timer)clearTimeout(timer);if(signal&&parentAbort)signal.removeEventListener("abort",parentAbort)}
 }
 return errorEnvelope(Object.assign(new Error("tool retry exhaustion"),{code:"TOOL_ERROR"}),baseAudit);
}
module.exports={ERROR_CODES,normalizeRisk,normalizeTool,validateSchema,errorEnvelope,successEnvelope,createRegistry,execute};
