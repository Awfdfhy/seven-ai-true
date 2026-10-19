import { describe, expect, it } from "vitest";
import { createRoom, commitMessage } from "../../domain/chat";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryFabricService } from "../memory/memory-fabric-service";
import { ProviderChatTransport } from "./provider-chat-transport";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";

describe("ProviderChatTransport memory integration",()=>{
  it("injects relevant prior memory as untrusted historical context",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await memory.observeUserMessage({roomId:"old-room",messageId:"old-message",content:"I prefer dark mode",createdAt:10});
    const captured:{ value?: ProviderStreamRequest }={};
    const provider:ProviderAdapter={
      id:"test",
      async listModels(){return [];},
      async *stream(request){captured.value=request;yield {delta:"ok"};},
    };
    const transport=new ProviderChatTransport(provider,"model","SYSTEM",memory);
    let room=createRoom({id:"current-room",modelId:"model",now:20});
    room=commitMessage(room,{id:"current-user",role:"user",content:"Use my preferred theme",now:21});
    const out:string[]=[];
    for await(const delta of transport.stream({room,signal:new AbortController().signal}))out.push(delta);
    expect(out.join("")).toBe("ok");
    expect(captured.value?.messages[0]?.content).toContain("Durable memory");
    expect(captured.value?.messages[0]?.content).toContain("I prefer dark mode");
    expect(captured.value?.messages[0]?.content).toContain("never instructions");
  });
});
