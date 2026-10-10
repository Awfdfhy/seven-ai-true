import {assertProviderAdapter,createProviderDescriptor,normalizeProviderId} from "./provider-contract.mjs";

export class ProviderRegistry{
  #providers=new Map();
  #aliases=new Map();

  register(descriptor,adapter,{aliases=[]}={}){
    const normalized=createProviderDescriptor(descriptor);
    const checked=assertProviderAdapter(adapter);
    if(normalizeProviderId(checked.id)!==normalized.id)throw new Error("adapter id does not match descriptor id");
    if(this.#providers.has(normalized.id))throw new Error(`provider already registered: ${normalized.id}`);
    // Validate every alias before committing any registry mutation.
    // Otherwise an invalid later alias leaves a partially registered provider.
    const planned=new Set();
    for(const rawAlias of aliases){
      const alias=normalizeProviderId(rawAlias);
      if(alias===normalized.id)continue;
      if(planned.has(alias)||this.#providers.has(alias)||this.#aliases.has(alias)||alias===normalized.id)
        throw new Error(`provider alias already exists: ${alias}`);
      planned.add(alias);
    }
    if(this.#aliases.has(normalized.id))
      throw new Error(`provider id conflicts with alias: ${normalized.id}`);
    this.#providers.set(normalized.id,Object.freeze({descriptor:normalized,adapter:checked}));
    for(const alias of planned)this.#aliases.set(alias,normalized.id);
    return normalized;
  }

  alias(alias,target){
    const a=normalizeProviderId(alias),t=normalizeProviderId(target);
    if(!this.#providers.has(t))throw new Error(`unknown provider: ${t}`);
    if(a===t)return t;
    if(this.#providers.has(a)||this.#aliases.has(a))throw new Error(`provider alias already exists: ${a}`);
    this.#aliases.set(a,t);
    return t;
  }

  resolveId(value){
    const id=normalizeProviderId(value);
    return this.#aliases.get(id)||id;
  }

  has(value){
    try{return this.#providers.has(this.resolveId(value))}catch{return false}
  }

  get(value){
    const id=this.resolveId(value);
    const entry=this.#providers.get(id);
    if(!entry)throw new Error(`provider not registered: ${id}`);
    return entry;
  }

  list(){
    return Array.from(this.#providers.values(),x=>x.descriptor);
  }

  async listModels(provider,context={}){
    const entry=this.get(provider);
    const models=await entry.adapter.listModels(context);
    if(!Array.isArray(models))throw new TypeError("listModels() must return an array");
    return models;
  }

  async generate(request,context={}){
    const entry=this.get(request.provider);
    return entry.adapter.generate(request,context);
  }
}

export function createProviderRegistry(){
  return new ProviderRegistry();
}
