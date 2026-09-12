(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.SevenUltimateProtocols=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));const check=(v,m)=>{if(!v)throw new Error(m)};
class AdapterRegistry{
 constructor(){this.adapters=new Map();}
 register(input={}){check(input.id&&input.protocol&&typeof input.invoke==='function','ADAPTER_REQUIRED');check(!this.adapters.has(input.id),'ADAPTER_EXISTS');const a={id:input.id,protocol:input.protocol,version:input.version||'unknown',capabilities:[...(input.capabilities||[])],invoke:input.invoke,health:input.health||'healthy',authority:'external_untrusted'};this.adapters.set(a.id,a);return{id:a.id,protocol:a.protocol,capabilities:[...a.capabilities],authority:a.authority};}
 resolve(protocol,capability){return[...this.adapters.values()].filter(a=>a.protocol===protocol&&a.health!=='down'&&(!capability||a.capabilities.includes(capability)));}
}
class ProtocolBoundary{
 constructor(opts={}){this.registry=opts.registry||new AdapterRegistry();this.maxPayloadBytes=opts.maxPayloadBytes||1_000_000;}
 normalizeRequest(input={}){check(input.protocol&&input.capability,'PROTOCOL_REQUEST_REQUIRED');const payload=clone(input.payload||{}),size=JSON.stringify(payload).length;check(size<=this.maxPayloadBytes,'PROTOCOL_PAYLOAD_TOO_LARGE');return{protocol:input.protocol,capability:input.capability,payload,sourceRefs:[...(input.sourceRefs||[])],permissionGrantId:input.permissionGrantId||null,requestId:input.requestId||`proto_${Date.now()}`};}
 async invoke(input={},runtime={}){const req=this.normalizeRequest(input),candidates=this.registry.resolve(req.protocol,req.capability);check(candidates.length,'PROTOCOL_ADAPTER_UNAVAILABLE');let last=null;for(const a of candidates){try{const raw=await a.invoke(clone(req.payload),{signal:runtime.signal,requestId:req.requestId});return{requestId:req.requestId,adapterId:a.id,protocol:a.protocol,capability:req.capability,authority:'derived_external',trustedForActions:false,sourceRefs:[...req.sourceRefs],result:clone(raw)};}catch(e){last=e;}}throw last||new Error('PROTOCOL_INVOKE_FAILED');}
}
class MCPAdapterContract{
 static toolDescriptor(input={}){check(input.name&&input.schema,'MCP_TOOL_DESCRIPTOR');return{id:input.id||input.name,name:input.name,description:input.description||'',schema:clone(input.schema),capabilities:[...(input.capabilities||[input.name])],source:'mcp',authority:'descriptor_only'};}
}
class A2AEnvelope{
 static task(input={}){check(input.taskId&&input.agentId,'A2A_TASK_REQUIRED');return{taskId:input.taskId,agentId:input.agentId,goal:input.goal||'',contextRefs:[...(input.contextRefs||[])],status:input.status||'submitted',payload:clone(input.payload||{}),authority:'external_agent_output_is_derived'};}
}
class GenerativeUIEnvelope{
 static component(input={}){check(input.type,'UI_COMPONENT_TYPE_REQUIRED');return{type:input.type,props:clone(input.props||{}),state:clone(input.state||{}),actions:[...(input.actions||[])],sourceRefs:[...(input.sourceRefs||[])],authority:'presentation_only'};}
}
return{AdapterRegistry,ProtocolBoundary,MCPAdapterContract,A2AEnvelope,GenerativeUIEnvelope};
});