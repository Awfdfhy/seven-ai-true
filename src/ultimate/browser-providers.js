'use strict';
const { OpenAICompatibleAdapter }=require('./provider-adapters.js');
const DEFAULT_ROLES=['general','reasoning','coding','research','rpg'];

function attachOpenAIProvider(os,input={}){
 const id=String(input.id||'').trim(),modelId=String(input.modelId||'').trim(),baseUrl=String(input.baseUrl||'').trim();
 if(!id||!modelId||!baseUrl)throw new Error('PROVIDER_ID_MODEL_URL_REQUIRED');
 if(!os.models.providers.has(id))os.models.registerProvider({id,name:input.name||id,freeProof:input.freeProof||'verified_free',local:!!input.local,health:'healthy',latencyMs:Number(input.latencyMs||300),capabilities:['chat','stream']});
 else os.models.setProviderHealth(id,'healthy',Number(input.latencyMs||300));
 if(!os.providers.adapters.has(id)){
  const headers={...(input.headers||{})};
  if(input.token)headers.Authorization=`Bearer ${input.token}`;
  os.providers.register(new OpenAICompatibleAdapter({id,baseUrl,headers}),{freeProof:input.freeProof||'verified_free',local:!!input.local});
 }
 const routeId=`${id}:${modelId}`;
 if(!os.models.models.has(routeId))os.models.registerModel({id:routeId,providerId:id,roles:[...(input.roles||DEFAULT_ROLES)],capabilities:['chat','stream'],quality:Number(input.quality??.8),speed:Number(input.speed??.8),context:Number(input.context||32768),status:'specialist',costClass:input.costClass||'free'});
 return routeId;
}

function markUnavailable(os,id){if(os.models.providers.has(id))os.models.setProviderHealth(id,'down');}
module.exports={attachOpenAIProvider,markUnavailable,DEFAULT_ROLES};
