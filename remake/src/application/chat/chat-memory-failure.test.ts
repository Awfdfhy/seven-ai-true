import { describe, expect, it } from "vitest";
import { SevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import { createRoom } from "../../domain/chat";
import { InMemoryRoomRepository } from "../../storage/room-repository";
import { ChatService, type ChatTransport, type UserMemoryObserver } from "./chat-service";

describe("Chat memory failure isolation",()=>{
  it("keeps the committed user turn and completes assistant output when memory storage fails",async()=>{
    const room=createRoom({id:"room-1",modelId:"model",now:100});
    const rooms=new InMemoryRoomRepository([room]);
    const memory:UserMemoryObserver={
      async observeUserMessage(){
        throw new SevenError({code:"STORAGE",message:"simulated quota failure"});
      },
    };
    const transport:ChatTransport={
      async *stream(){ yield "Still works"; },
    };
    const chat=new ChatService(new TaskManager(),rooms,memory);
    const run=await chat.send("room-1","Remember something durable",transport,{timeoutMs:5_000});
    const completed=await run.result;
    expect(completed.messages.map(message=>[message.role,message.content])).toEqual([
      ["user","Remember something durable"],
      ["assistant","Still works"],
    ]);
    expect((await rooms.get("room-1"))?.messages).toHaveLength(2);
  });
});
