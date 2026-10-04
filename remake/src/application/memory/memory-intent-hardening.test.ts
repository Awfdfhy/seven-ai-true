import { describe, expect, it } from "vitest";
import { classifyMemoryIntent } from "./memory-intent";

describe("Memory intent first-person state hardening",()=>{
  const personalQueries = [
    "Where am I based these days?",
    "Where do I live?",
    "What am I studying?",
    "What subject am I focusing on for school?",
    "What do I prefer?",
    "Which theme do I use?",
    "Who am I?",
    "أين أسكن؟",
    "وين اعيش؟",
    "ماذا أدرس؟",
    "ما الذي أفضله؟",
    "ما مشروعي؟",
    "من أنا؟",
  ] as const;

  it.each(personalQueries)("routes personal-state question to memory: %s",(query)=>{
    expect(classifyMemoryIntent(query).mode).not.toBe("none");
  });

  const selfContained = [
    "Am I correct that water boils at 100C at sea level?",
    "I think the derivative is 2x; explain why.",
    "أنا أعتقد أن المشتقة 2x، اشرح السبب",
    "هل أنا محق أن الماء يغلي عند 100 درجة؟",
  ] as const;

  it.each(selfContained)("does not open memory for generic first-person phrasing: %s",(query)=>{
    expect(classifyMemoryIntent(query).mode).toBe("none");
  });
});
