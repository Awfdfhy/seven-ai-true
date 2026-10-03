import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { commitMessage, createRoom } from "../../domain/chat";
import { createResearchCitation } from "../../domain/research";
import { AttachmentService, SingleFlightPdfParserLoader } from "../../application/attachments/attachment-service";
import { ResearchService } from "../../application/research/research-service";
import { MemoryContextService } from "../../application/context/memory-context-service";
import { DeepThinkTransport } from "../../application/deep-think/deep-think-transport";
import {
  InMemoryAttachmentRepository,
  IndexedDbAttachmentRepository,
} from "../../storage/attachment-repository";
import {
  InMemoryResearchRepository,
  IndexedDbResearchRepository,
} from "../../storage/research-repository";
import { InMemoryMemoryRepository } from "../../storage/memory-repository";
import type { ProviderAdapter } from "../../providers/contracts";

const hash = "b".repeat(64);

function adapter(id: string, output: string): ProviderAdapter {
  return {
    id,
    async listModels() { return []; },
    async *stream() { yield { delta: output }; },
  };
}

describe("Waves 4+5+6 manager integration", () => {
  it("carries an attachment-derived fact through research into a Deep Think answer", async () => {
    const tasks = new TaskManager();
    const attachmentRepository = new InMemoryAttachmentRepository();
    const attachmentService = new AttachmentService(
      tasks,
      attachmentRepository,
      new SingleFlightPdfParserLoader(async () => ({ parse: async () => "unused" })),
      () => 10,
    );

    const attachment = await attachmentService.ingest({
      roomId: "combined-room",
      id: "spec",
      name: "spec.txt",
      declaredMimeType: "text/plain",
      bytes: new TextEncoder().encode("Seven requires trustworthy citations."),
    }).result;

    const researchRepository = new InMemoryResearchRepository();
    const researchService = new ResearchService(
      tasks,
      [{
        id: "attachment-evidence",
        async search() {
          return [createResearchCitation({
            canonicalUrl: "https://example.com/seven-spec",
            title: attachment.name,
            snippet: attachment.extractedText,
            retrievedAt: 20,
            publishedAt: null,
            contentHash: hash,
            providerId: "attachment-evidence",
          })];
        },
      }],
      {
        async synthesize({ citations }) {
          return `Research confirms: ${citations[0]?.snippet ?? "missing"}`;
        },
      },
      researchRepository,
      () => 20,
    );
    const research = await researchService.run("What does the spec require?").result;
    expect(research.answer).toContain("trustworthy citations");

    const deepRoom = commitMessage(
      createRoom({ id: "deep-combined", now: 1 }),
      {
        id: "u1",
        role: "user",
        content: `Use this verified research: ${research.answer}`,
        now: 2,
      },
    );
    const context = new MemoryContextService(
      new InMemoryMemoryRepository(),
      { async summarize() { throw new Error("summary should not be needed"); } },
    );
    const transport = new DeepThinkTransport(
      { provider: adapter("planner", "Plan from verified evidence"), modelId: "p", contextWindow: 8000 },
      { provider: adapter("final", "Final answer uses verified citations."), modelId: "f", contextWindow: 8000 },
      context,
      { plannerOutputTokens: 200, finalOutputTokens: 300 },
    );

    let final = "";
    for await (const delta of transport.stream({
      room: deepRoom,
      signal: new AbortController().signal,
    })) {
      final += delta;
    }

    expect(final).toBe("Final answer uses verified citations.");
    expect(tasks.listActive()).toEqual([]);
  });

  it("isolates cancellation across attachment and research tasks sharing one TaskManager", async () => {
    const tasks = new TaskManager();
    const attachmentRepository = new InMemoryAttachmentRepository();
    let release!: (value: string) => void;
    const parsePending = new Promise<string>((resolve) => { release = resolve; });
    const attachmentService = new AttachmentService(
      tasks,
      attachmentRepository,
      new SingleFlightPdfParserLoader(async () => ({ parse: async () => parsePending })),
    );

    const researchService = new ResearchService(
      tasks,
      [{
        id: "web",
        async search() {
          return [createResearchCitation({
            canonicalUrl: "https://example.com/ok",
            title: "OK",
            snippet: "Independent evidence",
            retrievedAt: 1,
            publishedAt: null,
            contentHash: hash,
            providerId: "web",
          })];
        },
      }],
      { async synthesize() { return "research survives"; } },
      new InMemoryResearchRepository(),
      () => 1,
    );

    const attachmentRun = attachmentService.ingest({
      roomId: "cancel-room",
      id: "cancelled",
      name: "cancel.pdf",
      declaredMimeType: "application/pdf",
      bytes: new TextEncoder().encode("%PDF-1.7\nbody"),
    });
    const researchRun = researchService.run("independent query");

    await Promise.resolve();
    attachmentRun.cancel("user");
    await expect(attachmentRun.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect((await researchRun.result).answer).toBe("research survives");
    release("late parse");
    await Promise.resolve();
    expect(await attachmentRepository.get("cancel-room", "cancelled")).toBeNull();
  });

  it("restores attachment and research persistence independently after restart", async () => {
    const suffix = crypto.randomUUID();
    const attachmentName = `manager-attachments-${suffix}`;
    const researchName = `manager-research-${suffix}`;
    const tasks = new TaskManager();

    const attachmentOne = new IndexedDbAttachmentRepository(attachmentName);
    const attachmentService = new AttachmentService(
      tasks,
      attachmentOne,
      new SingleFlightPdfParserLoader(async () => ({ parse: async () => "unused" })),
      () => 5,
    );
    const savedAttachment = await attachmentService.ingest({
      roomId: "room",
      id: "persisted",
      name: "persisted.txt",
      declaredMimeType: "text/plain",
      bytes: new TextEncoder().encode("persistent attachment"),
    }).result;
    await attachmentOne.close();

    const researchOne = new IndexedDbResearchRepository(researchName);
    const researchService = new ResearchService(
      tasks,
      [{
        id: "web",
        async search() {
          return [createResearchCitation({
            canonicalUrl: "https://example.com/persisted",
            title: "Persisted",
            snippet: "persistent research",
            retrievedAt: 5,
            publishedAt: null,
            contentHash: hash,
            providerId: "web",
          })];
        },
      }],
      { async synthesize() { return "persistent answer"; } },
      researchOne,
      () => 5,
    );
    const savedResearch = await researchService.run("persist research").result;
    await researchOne.close();

    const attachmentTwo = new IndexedDbAttachmentRepository(attachmentName);
    const researchTwo = new IndexedDbResearchRepository(researchName);
    expect(await attachmentTwo.get("room", "persisted")).toEqual(savedAttachment);
    expect(await researchTwo.get("persist research")).toEqual(savedResearch);
    await attachmentTwo.close();
    await researchTwo.close();
  });
});
