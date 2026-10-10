import test from "node:test";
import assert from "node:assert/strict";
import {createProviderRequest} from "../core/providers/provider-contract.mjs";
import {collectProviderEvents} from "../core/providers/provider-events.mjs";
import {createOpenAICompatibleAdapter} from "../core/providers/openai-compatible-adapter.mjs";

function jsonResponse(body,status=200){
  return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json"}});
}

test("OpenAI-compatible adapter lists models and normalizes generation",async()=>{
  const calls=[];
  const fetchImpl=async(url,init={})=>{
    calls.push({url,init});
    if(url.endsWith("/models"))return jsonResponse({data:[{id:"demo-1",owned_by:"demo"}]});
    return jsonResponse({choices:[{message:{content:"hello",reasoning_content:"think"},finish_reason:"stop"}],usage:{total_tokens:3}});
  };
  const adapter=createOpenAICompatibleAdapter({id:"demo",baseURL:"https://example.test/v1",apiKey:"secret",fetchImpl});
  const models=await adapter.listModels();
  assert.equal(models[0].id,"demo-1");
  const request=createProviderRequest({provider:"demo",model:"demo-1",messages:[{role:"user",content:"hi"}],stream:false});
  const out=await adapter.generate(request);
  assert.equal(out.text,"hello");
  assert.equal(out.reasoning,"think");
  assert.equal(calls[1].init.headers.authorization,"Bearer secret");
  const sent=JSON.parse(calls[1].init.body);
  assert.equal(sent.model,"demo-1");
  assert.equal(sent.stream,false);
});

test("OpenAI-compatible adapter emits normalized SSE events",async()=>{
  const sse=[
    'data: {"choices":[{"delta":{"content":"Hel"}}]}',
    'data: {"choices":[{"delta":{"reasoning_content":"r"}}]}',
    'data: {"choices":[{"delta":{"content":"lo"},"finish_reason":"stop"}],"usage":{"total_tokens":4}}',
    'data: [DONE]',
    ''
  ].join("\n");
  const fetchImpl=async()=>new Response(sse,{status:200,headers:{"content-type":"text/event-stream"}});
  const adapter=createOpenAICompatibleAdapter({id:"demo",baseURL:"https://example.test/v1",fetchImpl});
  const request=createProviderRequest({provider:"demo",model:"m",messages:[{role:"user",content:"hi"}]});
  const out=await collectProviderEvents(adapter.stream(request));
  assert.equal(out.text,"Hello");
  assert.equal(out.reasoning,"r");
  assert.equal(out.events[0].type,"start");
  assert.equal(out.events.at(-1).type,"complete");
  assert.equal(out.events.some(x=>x.type==="usage"),true);
});

test("OpenAI-compatible adapter normalizes HTTP failure",async()=>{
  const fetchImpl=async()=>jsonResponse({error:{message:"rate limit",code:"rate_limit"}},429);
  const adapter=createOpenAICompatibleAdapter({id:"demo",baseURL:"https://example.test/v1",fetchImpl});
  const request=createProviderRequest({provider:"demo",model:"m",messages:[{role:"user",content:"hi"}]});
  const out=await collectProviderEvents(adapter.stream(request));
  const error=out.events.find(x=>x.type==="error");
  assert.equal(error.error.status,429);
  assert.equal(error.error.retryable,true);
});
