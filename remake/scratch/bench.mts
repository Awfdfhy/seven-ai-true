import { ContextBuilder } from "../src/context/context-builder";
import { commitMessage, createRoom } from "../src/domain/chat";
import { createMemoryRecord } from "../src/domain/memory";

function bigRoom(count: number, chars = 10) {
  let room = createRoom({ id: "big", now: 0 });
  for (let i = 0; i < count; i += 1) {
    room = commitMessage(room, {
      role: i % 2 === 0 ? "user" : "assistant",
      content: `${i}:` + "x".repeat(chars),
      now: i + 1,
    });
  }
  return room;
}

console.log("--- history retention work profile ---");
for (const count of [250, 500, 1000, 2000, 4000]) {
  let calls = 0;
  let scanned = 0;
  const builder = new ContextBuilder({
    estimateText: (s: string) => s.length,
    estimateMessages: (ms: readonly { role: string; content: string }[]) => {
      calls += 1;
      scanned += ms.length;
      return 30 + ms.reduce((n, m) => n + m.content.length, 0);
    },
  });
  const t0 = performance.now();
  builder.build({ room: bigRoom(count), systemPrompt: "Base", contextWindow: 1_000_000, memories: [], summary: null });
  console.log(`count=${count} ms=${(performance.now() - t0).toFixed(1)} calls=${calls} scanned=${scanned} scannedPerMsg=${(scanned / count).toFixed(1)}`);
}

console.log("--- memory ranking work profile ---");
for (const count of [250, 500, 1000, 2000]) {
  const builder = new ContextBuilder();
  const room = bigRoom(4, 10);
  const memories = Array.from({ length: count }, (_, i) =>
    createMemoryRecord({ id: `m${i}`, scope: "global", content: `memory ${i} ` + "y".repeat(40), now: i }),
  );
  const t0 = performance.now();
  builder.build({ room, systemPrompt: "Base", contextWindow: 100_000, memories, summary: null });
  console.log(`count=${count} ms=${(performance.now() - t0).toFixed(1)}`);
}
