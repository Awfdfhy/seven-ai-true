import {createProviderDescriptor,PROVIDER_KINDS} from "./provider-contract.mjs";

const KIND_BY_PROVIDER=Object.freeze({
  groq:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  nvidia:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  openrouter:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  llm7:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  aion:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  mistral:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  zai:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  kilo:PROVIDER_KINDS.OPENAI_COMPATIBLE,
  gemini:PROVIDER_KINDS.GOOGLE,
  cloudflare:PROVIDER_KINDS.CUSTOM
});

export function parseLegacyModelSelection(selection,defaultProvider="groq"){
  const raw=String(selection||"").trim();
  if(!raw)throw new TypeError("legacy model selection is empty");
  const split=raw.indexOf("::");
  if(split>0)return Object.freeze({provider:raw.slice(0,split).toLowerCase(),model:raw.slice(split+2)});
  return Object.freeze({provider:String(defaultProvider).toLowerCase(),model:raw});
}

export function toLegacyModelSelection(provider,model){
  const p=String(provider||"").trim().toLowerCase(),m=String(model||"").trim();
  if(!p||!m)throw new TypeError("provider and model are required");
  return `${p}::${m}`;
}

export function bridgeLegacyProvider(provider,options={}){
  const id=String(provider||"").trim().toLowerCase();
  return createProviderDescriptor({
    id,
    label:options.label||id,
    kind:KIND_BY_PROVIDER[id]||PROVIDER_KINDS.CUSTOM,
    baseURL:options.baseURL??null,
    credentialMode:options.credentialMode||"optional",
    capabilities:options.capabilities||{},
    limits:options.limits||{},
    metadata:{source:"seven-v2-bridge",...options.metadata}
  });
}

export function bridgeLegacyCatalog(models=[]){
  const providers=new Map();
  for(const model of models){
    if(!model||model.free!==true||!model.provider||!model.id)continue;
    const id=String(model.provider).toLowerCase();
    if(!providers.has(id))providers.set(id,[]);
    providers.get(id).push(Object.freeze({
      id:String(model.id),
      label:String(model.label||model.id),
      free:true,
      contextWindow:Number(model.contextWindow)||null,
      maxOutputTokens:Number(model.maxTokens)||null,
      capabilities:Object.freeze({...model.capabilities})
    }));
  }
  return providers;
}
