import {assertRequestSupported} from "./provider-capabilities.mjs";
import {createProviderDescriptor,normalizeProviderError,PROVIDER_KINDS} from "./provider-contract.mjs";
import {createProviderEvent} from "./provider-events.mjs";

function cleanBaseURL(value){
  return String(value||"").trim().replace(/\/+$/,"");
}

function mergeHeaders(...sets){
  return Object.assign({"content-type":"application/json"},...sets.filter(Boolean));
}

function normalizeChoiceMessage(json){
  const choice=json?.choices?.[0]||{};
  const message=choice.message||{};
  return Object.freeze({
    text:typeof message.content==="string"?message.content:"",
    reasoning:typeof message.reasoning_content==="string"?message.reasoning_content:
      (typeof message.reasoning==="string"?message.reasoning:""),
    toolCalls:Array.isArray(message.tool_calls)?message.tool_calls:[],
    finishReason:choice.finish_reason??null,
    usage:json?.usage??null,
    raw:json
  });
}

async function readJson(response){
  let body;
  try{body=await response.json()}catch{body=null}
  if(!response.ok){
    const e=new Error(body?.error?.message||body?.message||`provider HTTP ${response.status}`);
    e.status=response.status;
    e.code=body?.error?.code||null;
    e.retryable=response.status===408||response.status===409||response.status===429||response.status>=500;
    throw e;
  }
  return body;
}

async function* parseSse(response,{provider,model}){
  if(!response.ok){
    try{await readJson(response)}catch(e){yield createProviderEvent("error",{provider,model,error:normalizeProviderError(e,provider)});return}
  }
  if(!response.body){
    yield createProviderEvent("error",{provider,model,error:normalizeProviderError(new Error("stream body unavailable"),provider)});
    return;
  }
  yield createProviderEvent("start",{provider,model});
  const reader=response.body.getReader(),decoder=new TextDecoder();
  let buffer="",done=false,finishReason=null;
  try{
  while(!done){
    const part=await reader.read();
    done=part.done;
    buffer+=decoder.decode(part.value||new Uint8Array(),{stream:!done});
    const lines=buffer.split(/\r?\n/);
    buffer=lines.pop()||"";
    // Some providers end their stream without a final newline.
    if(part.done&&buffer){lines.push(buffer);buffer=""}
    for(const line of lines){
      if(!line.startsWith("data:"))continue;
      const data=line.slice(5).trim();
      if(!data)continue;
      if(data==="[DONE]"){done=true;break}
      let packet;
      try{packet=JSON.parse(data)}catch{continue}
      const choice=packet?.choices?.[0]||{},delta=choice.delta||{};
      if(typeof delta.content==="string"&&delta.content)yield createProviderEvent("text_delta",{provider,model,text:delta.content});
      const reasoning=typeof delta.reasoning_content==="string"?delta.reasoning_content:
        (typeof delta.reasoning==="string"?delta.reasoning:"");
      if(reasoning)yield createProviderEvent("reasoning_delta",{provider,model,reasoning});
      if(Array.isArray(delta.tool_calls))for(const toolCall of delta.tool_calls)yield createProviderEvent("tool_call",{provider,model,toolCall});
      if(packet.usage)yield createProviderEvent("usage",{provider,model,usage:packet.usage});
      if(choice.finish_reason!=null)finishReason=choice.finish_reason;
    }
  }
  }catch(error){
    yield createProviderEvent("error",{provider,model,error:normalizeProviderError(error,provider)});
    return;
  }finally{
    reader.releaseLock();
  }
  yield createProviderEvent("complete",{provider,model,finishReason:finishReason||"stop"});
}

export function createOpenAICompatibleAdapter(options={}){
  const id=String(options.id||"").trim().toLowerCase();
  const baseURL=cleanBaseURL(options.baseURL);
  if(!id)throw new TypeError("adapter id is required");
  if(!baseURL)throw new TypeError("baseURL is required");
  const fetchImpl=options.fetchImpl||globalThis.fetch;
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation is required");
  const descriptor=createProviderDescriptor({
    id,
    label:options.label||id,
    kind:PROVIDER_KINDS.OPENAI_COMPATIBLE,
    baseURL,
    credentialMode:options.credentialMode||"optional",
    capabilities:{stream:true,tools:true,structured:true,reasoning:true,...options.capabilities},
    limits:options.limits||{},
    metadata:options.metadata||{}
  });

  function headers(context={}){
    const apiKey=context.apiKey??options.apiKey;
    const auth=apiKey?{authorization:`Bearer ${apiKey}`}:{};
    return mergeHeaders(options.headers,auth,context.headers);
  }

  function endpoint(path){
    return baseURL+path;
  }

  const adapter={
    id,
    descriptor,

    async listModels(context={}){
      const response=await fetchImpl(endpoint(options.modelsPath||"/models"),{
        method:"GET",
        headers:headers(context),
        signal:context.signal
      });
      const body=await readJson(response);
      const list=Array.isArray(body?.data)?body.data:(Array.isArray(body?.models)?body.models:[]);
      return list.map(x=>Object.freeze({
        id:String(x?.id||x?.name||""),
        label:String(x?.name||x?.id||""),
        ownedBy:x?.owned_by??null,
        raw:x
      })).filter(x=>x.id);
    },

    async generate(request,context={}){
      assertRequestSupported(descriptor,{...request,stream:false});
      const body={
        model:request.model,
        messages:request.messages,
        stream:false,
        temperature:request.temperature,
        max_tokens:request.maxOutputTokens
      };
      if(request.tools?.length)body.tools=request.tools;
      if(request.reasoningEffort)body.reasoning_effort=request.reasoningEffort;
      if(request.metadata?.responseFormat)body.response_format=request.metadata.responseFormat;
      const response=await fetchImpl(endpoint(options.chatPath||"/chat/completions"),{
        method:"POST",
        headers:headers(context),
        body:JSON.stringify(body),
        signal:context.signal
      });
      return normalizeChoiceMessage(await readJson(response));
    },

    async *stream(request,context={}){
      assertRequestSupported(descriptor,{...request,stream:true});
      const body={
        model:request.model,
        messages:request.messages,
        stream:true,
        stream_options:{include_usage:true},
        temperature:request.temperature,
        max_tokens:request.maxOutputTokens
      };
      if(request.tools?.length)body.tools=request.tools;
      if(request.reasoningEffort)body.reasoning_effort=request.reasoningEffort;
      if(request.metadata?.responseFormat)body.response_format=request.metadata.responseFormat;
      let response;
      try{
        response=await fetchImpl(endpoint(options.chatPath||"/chat/completions"),{
          method:"POST",
          headers:headers(context),
          body:JSON.stringify(body),
          signal:context.signal
        });
      }catch(error){
        yield createProviderEvent("error",{provider:id,model:request.model,error:normalizeProviderError(error,id)});
        return;
      }
      yield* parseSse(response,{provider:id,model:request.model});
    }
  };
  return Object.freeze(adapter);
}
