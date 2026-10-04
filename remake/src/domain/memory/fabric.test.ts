import { describe, expect, it } from "vitest";
import { createMemoryFact, isMemoryFact, supersedeMemoryFact } from "./fabric";

describe("MemoryFact v2",()=>{
  it("preserves provenance and temporal history when superseded",()=>{
    const first=createMemoryFact({kind:"profile",tier:"core",scope:"global",canonicalKey:"profile:name",content:"My name is Ali",tags:["profile","name"],importance:1,confidence:.99,observedAt:10,sourceRoomId:"r1",sourceMessageId:"m1"});
    const ended=supersedeMemoryFact(first,20);
    expect(isMemoryFact(first)).toBe(true);
    expect(ended).toMatchObject({status:"superseded",validFrom:10,validUntil:20});
    expect(ended.source).toEqual({roomId:"r1",messageId:"m1",observedAt:10});
  });
});
