(function(root,factory){const D=(typeof module==='object'&&module.exports)?{IR:require('./tool-ir.js'),Sec:require('./capability-security.js')}:{IR:root.SevenToolIR,Sec:root.SevenCapabilitySecurity};const api=factory(D);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenCapabilityProtocols=api;})(typeof globalThis!=='undefined'?globalThis:this,function(D){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};const now=()=>Date.now();
const secureId=D.Sec?.secureId||((p='id')=>`${p}_${now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`);
class ProtocolRegistry{constructor(){this.adapters=new Map();}register(id,adapter){check(id&&adapter,'PROTOCOL_REQUIRED');this.adapters.set(id,adapter);return this;}get(id){const x=this.adapters.get(id);check(x,'PROTOCOL_NOT_FOUND:'+id);return x;}supports(id){return this.adapters.has(id);}list(){return[...this.adapters.keys()];}}

class MCP20260728Adapter{
 constructor(input={}){this.transport=input.transport;this.protocolVersion='2026-07-28';this.catalogCache=new Map();this.clientInfo=clone(input.clientInfo||{name:'Seven AI',version:'4'});this.extensions=clone(input.extensions||{});this.discovered=null;}
 async request(method,params={},input={}){check(this.transport,'MCP_TRANSPORT_REQUIRED');const name=params.name||input.name||'',requestId=input.requestId||secureId('mcp');return this.transport({method,params:clone(params),headers:{'MCP-Protocol-Version':this.protocolVersion,'Mcp-Method':method,...(name?{'Mcp-Name':name}:{}),'Traceparent':input.traceparent||undefined,...(input.headers||{})},meta:{requestId,clientInfo:clone(input.clientInfo||this.clientInfo),extensions:clone(input.extensions||this.extensions)},signal:input.signal});}
 async discover(input={}){if(this.discovered&&!input.force)return clone(this.discovered);try{this.discovered=await this.request('server/discover',{},input);return clone(this.discovered);}catch(error){if(input.optional!==false){this.discovered={protocolVersion:this.protocolVersion,extensions:{},discoveryUnavailable:true};return clone(this.discovered);}throw error;}}
 _catalogKey(kind,input={}){return`${kind}:${input.cacheScope||'private'}:${input.authScope||'default'}`;}
 async _list(method,kind,input={}){const key=this._catalogKey(kind,input),hit=this.catalogCache.get(key);if(hit&&hit.expiresAt>now())return clone(hit.value);const out=await this.request(method,input.params||{},input),ttl=Math.max(0,Number(out?.ttlMs||0)),scope=out?.cacheScope||input.cacheScope||'private';if(ttl)this.catalogCache.set(this._catalogKey(kind,{...input,cacheScope:scope}),{value:clone(out),expiresAt:now()+ttl,scope});return out;}
 listTools(input={}){return this._list('tools/list','tools',input);}
 listPrompts(input={}){return this._list('prompts/list','prompts',input);}
 listResources(input={}){return this._list('resources/list','resources',input);}
 async readResource(uri,input={}){return this.request('resources/read',{uri},input);}
 async call(name,args={},input={}){return this.request('tools/call',{name,arguments:clone(args),_meta:clone(input.meta||{})},{...input,name});}
 async callRoundTrip(name,args={},input={}){let out=await this.call(name,args,input),round=0,max=Math.max(1,Number(input.maxRounds||8));while(out?.resultType==='input_required'||out?.status==='input_required'){check(++round<=max,'MCP_MRTR_ROUND_LIMIT');check(typeof input.onInputRequired==='function','MCP_INPUT_REQUIRED_HANDLER');const reply=await input.onInputRequired(clone(out),round);check(reply!==undefined,'MCP_INPUT_REQUIRED_UNRESOLVED');out=await this.request(out.method||'tools/call',{name,arguments:clone(args),_meta:{...(input.meta||{}),roundTrip:clone(reply),continuation:out.continuation||out._meta?.continuation}},{...input,name});}return out;}
 taskGet(taskId,input={}){return this.request('tasks/get',{taskId},input);}
 taskUpdate(taskId,update,input={}){return this.request('tasks/update',{taskId,...clone(update)},input);}
 taskCancel(taskId,input={}){return this.request('tasks/cancel',{taskId},input);}
 invalidateCatalog(kind=null){if(!kind)this.catalogCache.clear();else for(const k of [...this.catalogCache.keys()])if(k.startsWith(kind+':'))this.catalogCache.delete(k);}
}

class OpenAPIAdapter{constructor(input={}){this.invoke=input.invoke;this.spec=input.spec||null;}async call(operationId,args,input={}){check(this.invoke,'OPENAPI_INVOKER_REQUIRED');return this.invoke(operationId,clone(args),input);}}
class GraphQLAdapter{constructor(input={}){this.invoke=input.invoke;}async call(field,args,input={}){check(this.invoke,'GRAPHQL_INVOKER_REQUIRED');return this.invoke(field,clone(args),input);}}
class CLIAdapter{constructor(input={}){this.invoke=input.invoke;}async call(command,args,input={}){check(this.invoke,'CLI_INVOKER_REQUIRED');return this.invoke(command,clone(args),input);}}
class LocalAdapter{constructor(executors=new Map()){this.executors=executors;}async call(name,args,input={}){const fn=this.executors instanceof Map?this.executors.get(name):this.executors[name];check(typeof fn==='function','LOCAL_EXECUTOR_MISSING');return fn(clone(args),input);}}

class DurableTaskLedger{
 constructor(input={}){this.tasks=new Map();this.events=[];this.maxEvents=Math.max(128,Number(input.maxEvents||10000));}
 _auth(t,input={}){if(!t.authBinding)return true;check(input.authBinding&&input.authBinding===t.authBinding,'TASK_AUTH_REQUIRED');return true;}
 create(input={}){const id=input.id||secureId('task');check(!this.tasks.has(id),'TASK_EXISTS');const t={id,status:'queued',owner:input.owner||null,capabilityId:input.capabilityId||null,authBinding:input.authBinding||null,checkpoint:null,result:null,error:null,generation:Number(input.generation||1),createdAt:now(),updatedAt:now()};this.tasks.set(id,t);this._event(id,'created');return clone(t);}
 _event(id,type,data={}){this.events.push({seq:this.events.length+1,taskId:id,type,at:now(),data:clone(data)});if(this.events.length>this.maxEvents)this.events.splice(0,this.events.length-this.maxEvents);}
 update(id,patch={},input={}){const t=this.tasks.get(id);check(t,'TASK_NOT_FOUND');this._auth(t,input);const allowed=new Set(['queued','running','input_required','paused','completed','failed','cancelled']);if(patch.status)check(allowed.has(patch.status),'TASK_STATUS_INVALID');if(['completed','failed','cancelled'].includes(t.status)&&patch.status&&patch.status!==t.status)throw new Error('TASK_TERMINAL');Object.assign(t,clone(patch),{updatedAt:now()});this._event(id,'updated',patch);return clone(t);}
 checkpoint(id,value,input={}){return this.update(id,{checkpoint:clone(value)},input);}
 cancel(id,input={}){const t=this.tasks.get(id);check(t,'TASK_NOT_FOUND');this._auth(t,input);if(t.status==='cancelled')return clone(t);return this.update(id,{status:'cancelled',generation:t.generation+1},input);}
 acceptResult(id,generation,result,input={}){const t=this.tasks.get(id);check(t,'TASK_NOT_FOUND');this._auth(t,input);if(t.status==='cancelled'||Number(generation)!==t.generation){this._event(id,'late_result_rejected',{generation});return{accepted:false,reason:'LATE_RESULT'};}if(['completed','failed'].includes(t.status))return{accepted:false,reason:'TASK_TERMINAL'};return{accepted:true,task:this.update(id,{status:'completed',result:clone(result)},input)};}
 get(id,input={}){const t=this.tasks.get(id);if(!t)return null;this._auth(t,input);return clone(t);}
 resumable(){return[...this.tasks.values()].filter(t=>['queued','running','input_required','paused'].includes(t.status)).map(clone);}
}

class ProtocolCapabilityImporter{
 constructor({os,protocols,toolIR}){this.os=os;this.protocols=protocols;this.toolIR=toolIR||new D.IR.ToolIR();}
 async importMCP(serverId,input={}){const a=this.protocols.get(serverId),catalog=await a.listTools(input),rows=[];for(const t of catalog.tools||[]){const ir=this.toolIR.fromMCP(t,{serverId,trustZone:Number.isFinite(input.trustZone)?input.trustZone:3}),g=this.os.register({...ir,metadata:{...ir.metadata,source:'mcp',originalName:t.name,catalogCacheScope:catalog.cacheScope||null}},async(args,ctx)=>{const out=await a.callRoundTrip(t.name,args,{...ctx,maxRounds:input.maxRoundTrips,onInputRequired:input.onInputRequired});if(out?.resultType==='task'&&out.task)return{kind:'TaskHandle',task:out.task};return out;});rows.push(g);}return rows;}
 async importOpenAPI(providerId,operations=[],adapter,input={}){const rows=[];for(const op of operations){const ir=this.toolIR.fromOpenAPI(op,{providerId,trustZone:input.trustZone??3,method:op.method,path:op.path,inputSchema:op.inputSchema,outputSchema:op.outputSchema}),g=this.os.register(ir,(args,ctx)=>adapter.call(op.operationId,args,ctx));rows.push(g);}return rows;}
}

return{ProtocolRegistry,MCP20260728Adapter,OpenAPIAdapter,GraphQLAdapter,CLIAdapter,LocalAdapter,DurableTaskLedger,ProtocolCapabilityImporter};
});