const ID_RE=/^[a-z0-9][a-z0-9._-]{0,63}$/;

export const PROVIDER_KINDS=Object.freeze({
  OPENAI_COMPATIBLE:"openai_compatible",
  ANTHROPIC:"anthropic",
  GOOGLE:"google",
  LOCAL:"local",
  CUSTOM:"custom"
});

export function normalizeProviderId(value){
  const id=String(value??"").trim().toLowerCase();
  if(!ID_RE.test(id))throw new TypeError("invalid provider id");
  return id;
}

function positiveInt(value,fallback){
  const n=Number(value);
  return Number.isInteger(n)&&n>0?n:fallback;
}

export function createProviderDescriptor(input={}){
  const id=normalizeProviderId(input.id);
  const kind=Object.values(PROVIDER_KINDS).includes(input.kind)?input.kind:PROVIDER_KINDS.CUSTOM;
  const descriptor={
    id,
    label:String(input.label||id).trim()||id,
    kind,
    baseURL:input.baseURL==null?null:String(input.baseURL).trim(),
    credentialMode:["none","optional","required","managed"].includes(input.credentialMode)?input.credentialMode:"optional",
    capabilities:Object.freeze({
      stream:input.capabilities?.stream!==false,
      tools:input.capabilities?.tools===true,
      vision:input.capabilities?.vision===true,
      structured:input.capabilities?.structured===true,
      reasoning:input.capabilities?.reasoning===true
    }),
    limits:Object.freeze({
      contextWindow:positiveInt(input.limits?.contextWindow,131072),
      maxOutputTokens:positiveInt(input.limits?.maxOutputTokens,8192)
    }),
    metadata:Object.freeze({...input.metadata})
  };
  return Object.freeze(descriptor);
}

export function normalizeMessages(messages){
  if(!Array.isArray(messages))throw new TypeError("messages must be an array");
  return messages.map((m,index)=>{
    const role=String(m?.role||"").trim();
    if(!["system","user","assistant","tool"].includes(role))throw new TypeError(`invalid message role at ${index}`);
    return Object.freeze({
      role,
      content:m?.content==null?"":m.content,
      name:m?.name==null?undefined:String(m.name),
      toolCallId:m?.toolCallId==null?undefined:String(m.toolCallId)
    });
  });
}

export function createProviderRequest(input={}){
  const provider=normalizeProviderId(input.provider);
  const model=String(input.model||"").trim();
  if(!model)throw new TypeError("model is required");
  return Object.freeze({
    provider,
    model,
    messages:Object.freeze(normalizeMessages(input.messages||[])),
    stream:input.stream!==false,
    temperature:Number.isFinite(Number(input.temperature))?Number(input.temperature):1,
    maxOutputTokens:positiveInt(input.maxOutputTokens,8192),
    reasoningEffort:input.reasoningEffort==null?null:String(input.reasoningEffort),
    tools:Object.freeze(Array.isArray(input.tools)?input.tools.slice():[]),
    metadata:Object.freeze({...input.metadata})
  });
}

export function assertProviderAdapter(adapter){
  if(!adapter||typeof adapter!=="object")throw new TypeError("adapter must be an object");
  normalizeProviderId(adapter.id);
  for(const method of ["listModels","generate"]){
    if(typeof adapter[method]!=="function")throw new TypeError(`provider adapter missing ${method}()`);
  }
  return adapter;
}

export function normalizeProviderError(error,provider){
  const e=error instanceof Error?error:new Error(String(error));
  return Object.freeze({
    provider:normalizeProviderId(provider),
    name:e.name||"Error",
    message:e.message||"provider failure",
    code:e.code==null?null:String(e.code),
    retryable:e.retryable===true,
    status:Number.isInteger(e.status)?e.status:null
  });
}
