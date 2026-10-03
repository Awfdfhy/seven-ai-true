import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { createRoom, commitMessage } from "../../domain/chat";
import { createMemoryRecord } from "../../domain/memory";
import { IndexedDbMemoryRepository } from "../../storage/memory-repository";
import { IndexedDbRoomRepository } from "../../storage/room-repository";
import { MemoryContextService, type SummarizeContextInput } from "../../application/context/memory-context-service";
import { ChatService } from "../../application/chat/chat-service";
import { TaskManager } from "../../core/task-manager";
import { RoutedChatTransport } from "../phase12";
import { ConservativeTokenEstimator } from "../../context/token-estimator";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";

it("persists memory and incremental summaries through routed fallback, chat commit and restart", async () => {
  const suffix = crypto.randomUUID();
  const memoryOptions = { databaseName: `phase3-memory-${suffix}` };
  const roomOptions = { databaseName: `phase3-rooms-${suffix}` };
  const memories = new IndexedDbMemoryRepository(memoryOptions);
  const rooms = new IndexedDbRoomRepository(roomOptions);
  let room = createRoom({ id: "story-room", now: 1 });
  for (let index = 0; index < 12; index++) {
    room = commitMessage(room, {
      id: `history-${index}`, role: index % 2 ? "assistant" : "user",
      content: `Turn ${index}: ${"Historical story detail. ".repeat(35)}`, now: index + 2,
    });
  }
  await rooms.put(room);
  await memories.put(createMemoryRecord({ id: "language", scope: "global", content: "Use Arabic.", now: 1 }));
  await memories.put(createMemoryRecord({ id: "other-room", scope: "room", roomId: "unrelated", content: "PRIVATE_OTHER_ROOM", now: 1 }));
  const summaries: SummarizeContextInput[] = [];
  const source = new MemoryContextService(memories, {
    async summarize(input) {
      summaries.push(input);
      return "The user is continuing a story in Arabic.";
    },
  });
  const requests: ProviderStreamRequest[] = [];
  const provider: ProviderAdapter = {
    id: "test-provider",
    async listModels() { return []; },
    async *stream(request) {
      requests.push(request);
      // The durable summary must already be visible before provider dispatch.
      expect(await memories.getSummary(room.id)).not.toBeNull();
      if (request.modelId === "large") throw new Error("primary unavailable");
      yield { delta: "تم حفظ السياق" };
    },
  };
  const transport = new RoutedChatTransport({ createdAt: 1, mode: "balanced", candidates: [
    { providerId: provider.id, modelId: "large", contextWindow: 6000, score: 2 },
    { providerId: provider.id, modelId: "small", contextWindow: 3500, score: 1 },
  ] }, new Map([[provider.id, provider]]), "You are Seven.", undefined, Date.now, source);
  const chat = new ChatService(new TaskManager(), rooms);
  const latest = "أكمل القصة مع الاحتفاظ بالتفاصيل";
  const run = await chat.send(room.id, latest, transport);
  const completed = await run.result;
  expect(requests.map(request => request.modelId)).toEqual(["large", "small"]);
  expect(summaries.length).toBeGreaterThanOrEqual(2);
  expect(summaries[1]?.previousSummary).toBe("The user is continuing a story in Arabic.");
  const estimator = new ConservativeTokenEstimator();
  for (const [index, request] of requests.entries()) {
    expect(request.messages.filter(message => message.role === "system")).toHaveLength(1);
    expect(request.messages[0]?.role).toBe("system");
    expect(request.messages.at(-1)?.content).toBe(latest);
    expect(JSON.stringify(request.messages)).not.toContain("PRIVATE_OTHER_ROOM");
    expect(estimator.estimateMessages(request.messages)).toBeLessThanOrEqual((index ? 3500 : 6000) - 1024);
    expect(request.maxOutputTokens).toBe(1024);
  }
  expect(completed.messages.slice(0, room.messages.length)).toEqual(room.messages);
  expect(completed.messages.at(-1)?.content).toBe("تم حفظ السياق");
  const savedSummary = await memories.getSummary(room.id);
  await memories.close();
  await rooms.close();
  const reopenedMemories = new IndexedDbMemoryRepository(memoryOptions);
  const reopenedRooms = new IndexedDbRoomRepository(roomOptions);
  try {
    expect(await reopenedMemories.getSummary(room.id)).toEqual(savedSummary);
    expect((await reopenedMemories.listForRoom(room.id)).map(memory => memory.id)).toEqual(["language"]);
    expect(await reopenedRooms.get(room.id)).toEqual(completed);
    const restoredSource = new MemoryContextService(reopenedMemories, {
      async summarize() { throw new Error("Restored sufficient summary must be reused"); },
    });
    const payload = await restoredSource.prepare({ room: completed, systemPrompt: "You are Seven.", contextWindow: 3500, signal: new AbortController().signal });
    expect(payload.summaryUsed).toBe(true);
    expect(payload.omittedMessages).toHaveLength(0);
  } finally {
    await reopenedMemories.close();
    await reopenedRooms.close();
  }
});
