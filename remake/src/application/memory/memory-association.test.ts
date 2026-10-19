import { describe, expect, it } from "vitest";
import { createMemoryFact } from "../../domain/memory/fabric";
import { expandAssociatedMemories } from "./memory-association";

function f(id:string,content:string,tags:readonly string[]){
  return createMemoryFact({
    id,kind:"fact",tier:"recall",scope:"global",canonicalKey:`k:${id}`,
    content,tags,importance:.7,confidence:.96,observedAt:100,
    sourceRoomId:"r",sourceMessageId:`m-${id}`,
  });
}

describe("profile-style memory association expansion",()=>{
  it("bridges from a profile/project fact to a second fact through a rare entity",()=>{
    const profile=f("p","My main project is Seven",["project","seven"]);
    const tech=f("t","Seven uses React for its interface",["seven","react","interface"]);
    const noise=f("n","I like mango juice",["food","mango"]);
    const expanded=expandAssociatedMemories([profile,tech,noise],[profile],"What framework does my project use?");
    expect(expanded[0]?.fact.id).toBe("t");
    expect(expanded[0]?.bridgeTokens).toContain("seven");
    expect(expanded.some(x=>x.fact.id==="n")).toBe(false);
  });

  it("does not expand through ubiquitous/generic tokens",()=>{
    const seed=f("s","Project note about architecture",["project","architecture"]);
    const facts=[seed,...Array.from({length:20},(_,i)=>f(`x${i}`,`Architecture project item ${i}`,["project","architecture"]))];
    expect(expandAssociatedMemories(facts,[seed],"continue my project")).toHaveLength(0);
  });
});
