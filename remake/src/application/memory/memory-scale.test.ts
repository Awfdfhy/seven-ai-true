import { describe, expect, it } from "vitest";
import { createMemoryFact, type MemoryFact } from "../../domain/memory/fabric";
import { formatMemoryContext, MemoryRetrievalEngine } from "./memory-retrieval";

function recall(id: number, content: string, tags: readonly string[], at = id + 1): MemoryFact {
  return createMemoryFact({
    id: `stress-${id}`,
    kind: "fact",
    tier: "recall",
    scope: "global",
    canonicalKey: `stress:key:${id}`,
    content,
    tags,
    importance: 0.45,
    confidence: 0.95,
    observedAt: at,
    sourceRoomId: "stress-room",
    sourceMessageId: `stress-message-${id}`,
  });
}

describe("Memory Fabric scale and distractor resistance", () => {
  it("finds the relevant semantic concept among 2000 lexical distractors", () => {
    const facts: MemoryFact[] = [];
    for (let index = 0; index < 2000; index += 1) {
      facts.push(recall(
        index,
        `Project archive note ${index} about build iteration ${index % 37} and test batch ${index % 19}`,
        ["archive", "project", `batch-${index % 19}`],
      ));
    }
    const theme = createMemoryFact({
      id: "theme-memory",
      kind: "preference",
      tier: "recall",
      scope: "global",
      canonicalKey: "preference:theme",
      content: "I prefer dark mode",
      tags: ["preference", "theme"],
      importance: 0.9,
      confidence: 0.99,
      observedAt: 5000,
      sourceRoomId: "settings-chat",
      sourceMessageId: "theme-source",
    });
    facts.splice(997, 0, theme);

    const hits = new MemoryRetrievalEngine().search(
      facts,
      "Use the appearance theme that I prefer",
      { now: 6000, maxRecall: 8 },
    );

    expect(hits[0]?.fact.id).toBe(theme.id);
    expect(hits.some(hit => hit.fact.id === theme.id)).toBe(true);
    expect(hits.filter(hit => hit.fact.id.startsWith("stress-"))).toHaveLength(0);
  });

  it("still abstains with 2000 plausible but unrelated memories", () => {
    const facts = Array.from({ length: 2000 }, (_, index) =>
      recall(
        index,
        `Study archive item ${index} covers chapter ${index % 40} exercise ${index % 12}`,
        ["study", "archive", `chapter-${index % 40}`],
      ),
    );
    const hits = new MemoryRetrievalEngine().search(
      facts,
      "Explain why the sky appears blue",
      { now: 4000, maxRecall: 8 },
    );
    expect(hits).toHaveLength(0);
  });

  it("keeps the final model memory context bounded with a large candidate set", () => {
    const facts = Array.from({ length: 300 }, (_, index) =>
      recall(
        index,
        `Remembered project decision ${index} concerns architecture module ${index % 12}`,
        ["project", "decision", "architecture"],
      ),
    );
    const hits = new MemoryRetrievalEngine().search(
      facts,
      "What project architecture decisions should we remember?",
      { now: 1000, maxRecall: 8 },
    );
    const context = formatMemoryContext(hits, 2400);
    expect(context.length).toBeLessThanOrEqual(2400);
    expect(context).not.toBe("");
    const serialized = context.slice(context.indexOf("\n") + 1);
    expect(() => JSON.parse(serialized)).not.toThrow();
    expect((JSON.parse(serialized) as unknown[]).length).toBeLessThanOrEqual(8);
  });
});
