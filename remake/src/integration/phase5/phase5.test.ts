import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import { SevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import { createResearchCitation } from "../../domain/research";
import { ResearchService } from "../../application/research/research-service";
import { IndexedDbResearchRepository, InMemoryResearchRepository } from "../../storage/research-repository";

const hash = "a".repeat(64);
function citation(providerId: string, url: string, snippet = "Evidence") {
  return createResearchCitation({
    canonicalUrl: url,
    title: "Source",
    snippet,
    retrievedAt: 100,
    publishedAt: null,
    contentHash: hash,
    providerId,
  });
}

describe("Phase 5 research + citations", () => {
  it("canonicalizes citations and strips URL fragments", () => {
    expect(citation("web", "https://example.com/a#fragment").canonicalUrl)
      .toBe("https://example.com/a");
  });

  it("deduplicates evidence deterministically and exposes partial source failures", async () => {
    const synthesize = vi.fn(async ({ citations }: { citations: readonly unknown[] }) => `answer:${citations.length}`);
    const service = new ResearchService(
      new TaskManager(),
      [
        { id: "one", async search() { return [citation("one", "https://example.com/a")]; } },
        { id: "two", async search() { throw new SevenError({ code: "NETWORK", message: "offline" }); } },
        { id: "three", async search() { return [citation("three", "https://example.com/a#x"), citation("three", "https://example.com/b")]; } },
      ],
      { synthesize },
      new InMemoryResearchRepository(),
      () => 200,
    );
    const result = await service.run("Seven architecture").result;
    expect(result.citations.map((item) => item.canonicalUrl)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
    expect(result.sourceFailures).toEqual([{ sourceId: "two", code: "NETWORK" }]);
    expect(result.answer).toBe("answer:2");
  });

  it("never turns total network failure into a no-evidence success", async () => {
    const synthesize = vi.fn(async () => "must not run");
    const service = new ResearchService(
      new TaskManager(),
      [{ id: "web", async search() { throw new SevenError({ code: "NETWORK", message: "offline" }); } }],
      { synthesize },
      new InMemoryResearchRepository(),
    );
    await expect(service.run("query").result).rejects.toMatchObject({ code: "NETWORK", retryable: true });
    expect(synthesize).not.toHaveBeenCalled();
  });

  it("rejects forged provider attribution before synthesis", async () => {
    const synthesize = vi.fn(async () => "must not run");
    const service = new ResearchService(
      new TaskManager(),
      [{ id: "web", async search() { return [citation("other", "https://example.com")]; } }],
      { synthesize },
      new InMemoryResearchRepository(),
    );
    await expect(service.run("query").result).rejects.toMatchObject({ code: "PROVIDER" });
    expect(synthesize).not.toHaveBeenCalled();
  });

  it("uses durable cache within maxAge and bypasses network on restart", async () => {
    const name = `research-${crypto.randomUUID()}`;
    const firstRepo = new IndexedDbResearchRepository(name);
    let calls = 0;
    const source = { id: "web", async search() { calls += 1; return [citation("web", "https://example.com")]; } };
    const synthesizer = { async synthesize() { return "cached answer"; } };
    const first = new ResearchService(new TaskManager(), [source], synthesizer, firstRepo, () => 100);
    const expected = await first.run("cache me").result;
    await firstRepo.close();

    const secondRepo = new IndexedDbResearchRepository(name);
    const second = new ResearchService(new TaskManager(), [source], synthesizer, secondRepo, () => 150);
    expect(await second.run("cache me", { maxAgeMs: 100 }).result).toEqual(expected);
    expect(calls).toBe(1);
    await secondRepo.close();
  });

  it("cancellation prevents late synthesis from being cached", async () => {
    let release!: (value: string) => void;
    const pending = new Promise<string>((resolve) => { release = resolve; });
    const repository = new InMemoryResearchRepository();
    const service = new ResearchService(
      new TaskManager(),
      [{ id: "web", async search() { return [citation("web", "https://example.com")]; } }],
      { async synthesize() { return pending; } },
      repository,
    );
    const run = service.run("cancel me");
    await Promise.resolve();
    run.cancel();
    release("late");
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect(await repository.get("cancel me")).toBeNull();
  });
});
