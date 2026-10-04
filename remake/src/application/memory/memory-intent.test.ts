import { describe, expect, it } from "vitest";
import { classifyMemoryIntent } from "./memory-intent";

describe("Memory intent gate",()=>{
  it("skips self-contained factual questions",()=>{
    expect(classifyMemoryIntent("Explain quantum tunneling").mode).toBe("none");
    expect(classifyMemoryIntent("ما هو قانون نيوتن الثاني؟").mode).toBe("none");
  });

  it("routes personal and preference questions to memory",()=>{
    expect(classifyMemoryIntent("What is my name?").mode).toBe("core");
    expect(classifyMemoryIntent("Use my preferred theme").mode).toBe("core");
    expect(classifyMemoryIntent("استخدم المظهر الذي أفضله").mode).toBe("core");
  });

  it("routes continuity to recall and explicit history to historical search",()=>{
    expect(classifyMemoryIntent("Continue from what we discussed about my project").mode).toBe("recall");
    expect(classifyMemoryIntent("What theme did I prefer before?").mode).toBe("history");
    expect(classifyMemoryIntent("ماذا كنت أفضل سابقاً؟").mode).toBe("history");
  });
});
