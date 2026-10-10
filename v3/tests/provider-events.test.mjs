import test from "node:test";
import assert from "node:assert/strict";
import {createProviderDescriptor,createProviderRequest,PROVIDER_KINDS} from "../core/providers/provider-contract.mjs";
import {assertRequestSupported} from "../core/providers/provider-capabilities.mjs";
import {collectProviderEvents,createProviderEvent} from "../core/providers/provider-events.mjs";

test("capability policy rejects unsupported tools and accepts supported request",()=>{
  const descriptor=createProviderDescriptor({
    id:"demo",
    kind:PROVIDER_KINDS.OPENAI_COMPATIBLE,
    capabilities:{stream:true,tools:false,reasoning:true},
    limits:{maxOutputTokens:4096}
  });
  const base=createProviderRequest({provider:"demo",model:"m",messages:[{role:"user",content:"hi"}],maxOutputTokens:2048});
  assert.equal(assertRequestSupported(descriptor,base),true);
  const withTools=createProviderRequest({provider:"demo",model:"m",messages:[{role:"user",content:"hi"}],tools:[{name:"x"}]});
  assert.throws(()=>assertRequestSupported(descriptor,withTools),/does not support tools/);
});

test("normalized provider event stream can be collected",async()=>{
  async function* stream(){
    yield createProviderEvent("start",{provider:"demo",model:"m"});
    yield createProviderEvent("text_delta",{text:"Hel"});
    yield createProviderEvent("text_delta",{text:"lo"});
    yield createProviderEvent("reasoning_delta",{reasoning:"r"});
    yield createProviderEvent("complete",{finishReason:"stop"});
  }
  const out=await collectProviderEvents(stream());
  assert.equal(out.text,"Hello");
  assert.equal(out.reasoning,"r");
  assert.equal(out.events.at(-1).type,"complete");
});
