"use strict";

const ERROR_CODES=Object.freeze(new Set(["TIMEOUT","NETWORK_ERROR","AUTH_ERROR","VALIDATION_ERROR","PERMISSION_ERROR","UNAVAILABLE","RATE_LIMIT","TOOL_ERROR","MALFORMED_OUTPUT","CANCELLED","INTERNAL_ERROR"]));
const RISK=Object.freeze({none:"NONE",read:"READ",low:"READ",write:"WRITE",side_effect:"WRITE",sideeffect:"WRITE",high:"HIGH",critical:"CRITICAL"});
function text(v){return String(v==null?"":v).trim()}
function normalizeRisk(v){const k=text(v).toLowerCase().replace(/[ -]/g,"_");return RISK[k]||"HIGH"}
function normalizeTool(raw={}){
 const id=text(raw.id||raw.name); if(!id)throw new Error("tool id required");
 const schema=raw.inputSchema||raw.schema||{type:"object",properties:{},additionalProperties:false};
 if(!schema||typeof schema!=="object"||Array.isArray(schema))throw new Error("invalid tool input schema");
 const timeoutMs=Math.max(100,Math.min(120000,Number(raw.timeoutMs||raw.timeout||15000)||15000));
 const retries=Math.max(0,Math.min(3,Number((raw.retryPolicy&&raw.retryPolicy.maxRetries)??raw.maxRetries??0)||0));
 return Object.freeze({
  id,name:text(raw.name||id),inputSchema:schema,outputSchema:raw.outputSchema&&typeof raw.outputSchema==="object"?raw.outputSchema:null,
  risk:normalizeRisk(raw.risk||raw.riskLevel),permissions:Object.freeze([...(raw.permissions||raw.requiredPermissions||[])].map(text).filter(Boolean)),
  resources:Object.freeze([...(raw.resources||raw.allowedResources||[])].map(text).filter(Boolean)),
  sideEffect:raw.sideEffect===true||["WRITE","HIGH","CRITICAL"].includes(normalizeRisk(raw.risk||raw.riskLevel)),
  confirmationRequired:raw.confirmationRequired===true||normalizeRisk(raw.risk||raw.riskLevel)==="CRITICAL",
  timeoutMs,retryPolicy:Object.freeze({maxRetries:retries}),cancelable:raw.cancelable!==false,
  executor:typeof raw.executor==="function"?raw.executor:null,metadata:Object.freeze({...raw.metadata})
 });
}
function errorEnvelope(error,meta={}){
 let code=text(error&&error.code).toUpperCase();
 if(!ERROR_CODES.has(code)){const m=text(error&&error.message).toLowerCase();code=m.includes("timeout")?"TIMEOUT":m.includes("cancel")?"CANCELLED":m.includes("auth")?"AUTH_ERROR":m.includes("permission")?"PERMISSION_ERROR":"TOOL_ERROR"}
 return Object.freeze({ok:false,error:Object.freeze({code,message:text(error&&error.message||code),retryable:code==="NETWORK_ERROR"||code==="RATE_LIMIT"||code==="TIMEOUT"}),audit:Object.freeze({...meta})});
}
function successEnvelope(output,meta={}){return Object.freeze({ok:true,output,audit:Object.freeze({...meta})})}
function createRegistry(rawTools=[]){
 const map=new Map();
 for(const raw of rawTools){const t=normalizeTool(raw);if(map.has(t.id))throw new Error("duplicate tool id: "+t.id);map.set(t.id,t)}
 return Object.freeze({list:()=>[...map.values()],get:id=>map.get(String(id))||null});
}
async function execute({tool,input,authorize,signal,traceId,now=()=>Date.now()}={}){
 const t=normalizeTool(tool);const started=now();const audit={toolId:t.id,traceId:text(traceId)||null,startedAt:started,risk:t.risk};
 if(!t.executor)return errorEnvelope(Object.assign(new Error("tool unavailable"),{code:"UNAVAILABLE"}),audit);
 if(signal&&signal.aborted)return errorEnvelope(Object.assign(new Error("cancelled"),{code:"CANCELLED"}),audit);
 if(typeof authorize!=="function")return errorEnvelope(Object.assign(new Error("permission gate unavailable"),{code:"PERMISSION_ERROR"}),audit);
 let auth;try{auth=await authorize(t,input)}catch(e){return errorEnvelope(Object.assign(e,{code:e.code||"PERMISSION_ERROR"}),audit)}
 if(!auth||auth.allowed!==true)return errorEnvelope(Object.assign(new Error(auth&&auth.reason||"permission denied"),{code:"PERMISSION_ERROR"}),audit);
 let timer,abortListener;
 try{
  const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(new Error("tool timeout"),{code:"TIMEOUT"})),t.timeoutMs)});
  const cancelled=new Promise((_,reject)=>{if(signal){abortListener=()=>reject(Object.assign(new Error("cancelled"),{code:"CANCELLED"}));signal.addEventListener("abort",abortListener,{once:true})}});
  const output=await Promise.race([Promise.resolve().then(()=>t.executor(input,{signal,traceId})),timeout,cancelled]);
  return successEnvelope(output,{...audit,finishedAt:now(),durationMs:Math.max(0,now()-started)});
 }catch(e){return errorEnvelope(e,{...audit,finishedAt:now(),durationMs:Math.max(0,now()-started)})}
 finally{if(timer)clearTimeout(timer);if(signal&&abortListener)signal.removeEventListener("abort",abortListener)}
}
module.exports={ERROR_CODES,normalizeRisk,normalizeTool,errorEnvelope,successEnvelope,createRegistry,execute};
