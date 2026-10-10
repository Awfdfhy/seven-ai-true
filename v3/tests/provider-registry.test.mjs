import test from "node:test";
import assert from "node:assert/strict";
import {createProviderRequest,PROVIDER_KINDS} from "../core/providers/provider-contract.mjs";
import {createProviderRegistry} from "../core/providers/provider-registry.mjs";
import {bridgeLegacyCatalog,bridgeLegacyProvider,parseLegacyModelSelection,toLegacyModelSelection} from "../core/providers/seven-v2-bridge.mjs";

test("registry is case-insensitive and aliases resolve to one owner",async()=>{
  const registry=createProviderRegistry();
  registry.register(
    {id:"groq",kind:PROVIDER_KINDS.OPENAI_COMPATIBLE,label:"Groq"},
    {id:"groq",async listModels(){return [{id:"m1"}]},async generate(req){return {provider:req.provider,model:req.model,text:"ok"}}},
    {aliases:["GROQ-FREE"]}
  );
  assert.equal(registry.has("GROQ"),true);
  assert.equal(registry.get("groq-free").descriptor.id,"groq");
  assert.deepEqual(await registry.listModels("groq"),[{id:"m1"}]);
  const out=await registry.generate(createProviderRequest({provider:"groq-free",model:"m1",messages:[{role:"user",content:"hi"}]}));
  assert.equal(out.text,"ok");
});

test("duplicate providers are rejected",()=>{
  const registry=createProviderRegistry();
  const adapter={id:"groq",async listModels(){return []},async generate(){return {}}};
  registry.register({id:"groq"},adapter);
  assert.throws(()=>registry.register({id:"groq"},adapter),/already registered/);
});

test("legacy Seven model selections round-trip",()=>{
  assert.deepEqual(parseLegacyModelSelection("openrouter::model:free"),{provider:"openrouter",model:"model:free"});
  assert.deepEqual(parseLegacyModelSelection("openai/gpt-oss-120b"),{provider:"groq",model:"openai/gpt-oss-120b"});
  assert.equal(toLegacyModelSelection("Groq","openai/gpt-oss-120b"),"groq::openai/gpt-oss-120b");
});

test("legacy catalog bridge groups only verified-free entries",()=>{
  const map=bridgeLegacyCatalog([
    {provider:"groq",id:"a",label:"A",free:true,maxTokens:1024,contextWindow:8192,capabilities:{stream:true}},
    {provider:"groq",id:"paid",free:false},
    {provider:"gemini",id:"g",free:true}
  ]);
  assert.equal(map.get("groq").length,1);
  assert.equal(map.get("gemini").length,1);
  assert.equal(bridgeLegacyProvider("gemini").kind,PROVIDER_KINDS.GOOGLE);
});
