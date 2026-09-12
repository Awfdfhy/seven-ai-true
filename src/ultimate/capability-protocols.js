(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityProtocols=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};const now=()=>Date.now();
class ProtocolRegistry{constructor(){this.adapters=new Map();}register(id,adapter){check(id&&adapter,'PROTOCOL_REQUIRED');this.adapters.set(id,adapter);return this;}get(id){const x=this.adapters.get(id);check(x,'PROTOCOL_NOT_FOUND:'+id);return x;}supports(id){return this.adapters.has(id);}}
class MCP20260728Adapter{
 constructor(input={}){this.transport=input.transport;this.protocolVersion='2026-07-28';this.catalogCache=new Map();}
 async request(method,params={},input={}){check(this.transport,'MCP_TRANSPORT_REQUIRED');const name=params.name||input.name||'';return this.transport({method,params:clone(params),headers:{'MCP-Protocol-Version':this.protocolVersion,'Mcp-Method':method,...(name?{'Mcp-Name':name}:{}),...(input.headers||{})},meta:{clientInfo:clone(input.clientInfo||{name:'Seven AI',version:'4'})},signal:input.signal});}
 async discover(input={}){return this.request('server/discover',{},input);}
 async listTools(input={}){const scope=input.cacheScope||'private',key=`tools:${scope}`,hit=this.catalogCache.get(key);if(hit&&hit.expiresAt>now())return clone(hit.value);const out=await this.request('tools/list',{},input),ttl=Math.max(0,Number(out?.ttlMs||0));if(ttl)this.catalogCache.set(key,{value:clone(out),expiresAt:now()+ttl});return out;}
 async call(name,args={},input={}){return this.request('tools/call',{name,arguments:clone(args),_meta:clone(input.meta||{})},{...input,name});}
 async taskGet(taskId,input={}){return this.request('tasks/get',{taskId},input);}
 async taskUpdate(taskId,update,input={}){return this.request('tasks/update',{taskId,...clone(update)},input);}
 async taskCancel(taskId,input={}){return this.request('tasks/cancel',{taskId},input);}
}
class OpenAPIAdapter{constructor(input={}){this.invoke=input.invoke;this.spec=input.spec||null;}async call(operationId,args,input={}){check(this.invoke,'OPENAPI_INVOKER_REQUIRED');return this.invoke(operationId,clone(args),input);}}
class LocalAdapter{constructor(executors=new Map()){this.executors=executors;}async call(name,args,input={}){const fn=this.executors instanceof Map?this.executors.get(name):this.executors[name];check(typeof fn==='function','LOCAL_EXECUTOR_MISSING');return fn(clone(args),input);}}
class DurableTaskLedger{
 constructor(){this.tasks=new Map();this.events=[];}
 create(input={}){const id=input.id||`task_${now()}_${Math.random().toString(36).slice(2)}`;check(!this.tasks.has(id),'TASK_EXISTS');const t={id,status:'queued',owner:input.owner||null,capabilityId:input.capabilityId||null,authBinding:input.authBinding||null,checkpoint:null,result:null,error:null,generation:Number(input.generation||1),createdAt:now(),updatedAt:now()};this.tasks.set(id,t);this._event(id,'created');return clone(t);}
 _event(id,type,data={}){this.events.push({seq:this.events.length+1,taskId:id,type,at:now(),data:clone(data)});}
 update(id,patch={}){const t=this.tasks.get(id);check(t,'TASK_NOT_FOUND');const allowed=new Set(['queued','running','input_required','paused','completed','failed','cancelled']);if(patch.status)check(allowed.has(patch.status),'TASK_STATUS_INVALID');Object.assign(t,clone(patch),{updatedAt:now()});this._event(id,'updated',patch);return clone(t);}
 checkpoint(id,value){return this.update(id,{checkpoint:clone(value)});}
 cancel(id){const t=this.tasks.get(id);check(t,'TASK_NOT_FOUND');return this.update(id,{status:'cancelled',generation:t.generation+1});}
 acceptResult(id,generation,result){const t=this.tasks.get(id);check(t,'TASK_NOT_FOUND');if(t.status==='cancelled'||Number(generation)!==t.generation){this._event(id,'late_result_rejected',{generation});return{accepted:false,reason:'LATE_RESULT'};}return{accepted:true,task:this.update(id,{status:'completed',result:clone(result)})};}
 get(id){const t=this.tasks.get(id);return t?clone(t):null;}
}
class ProtocolCapabilityImporter{
 constructor({os,protocols}){this.os=os;this.protocols=protocols;}
 async importMCP(serverId,input={}){const a=this.protocols.get(serverId),catalog=await a.listTools(input),rows=[];for(const t of catalog.tools||[]){const id=`mcp.${serverId}.${t.name}`;const g=this.os.register({id,name:t.title||t.name,namespace:`mcp.${serverId}`,description:t.description||'',capabilities:t.capabilities||[t.name],inputSchema:t.inputSchema||{type:'object',properties:{},additionalProperties:false},outputSchema:t.outputSchema||null,actionClass:t.annotations?.readOnlyHint?'read':'external_action',reversible:!!t.annotations?.readOnlyHint,protocol:'mcp',providerId:serverId,version:String(t.version||'1'),trustZone:Number.isFinite(input.trustZone)?input.trustZone:3,permissions:[`mcp:${serverId}:${t.name}`],cache:{ttlMs:0},metadata:{source:'mcp',originalName:t.name}},async(args,ctx)=>{const out=await a.call(t.name,args,ctx);if(out?.resultType==='task'&&out.task)return{kind:'TaskHandle',task:out.task};return out;});rows.push(g);}return rows;}
}
return{ProtocolRegistry,MCP20260728Adapter,OpenAPIAdapter,LocalAdapter,DurableTaskLedger,ProtocolCapabilityImporter};
});