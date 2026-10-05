import { describe, expect, it } from "vitest";
import { ContextBuilder } from "../../context/context-builder";
import { TaskManager } from "../../core/task-manager";
import type { Room } from "../../domain/chat";
import type { ModelDescriptor } from "../../providers/contracts";
import { ModelRouter } from "../../routing/model-router";

type Measurement = Readonly<{
  name: string;
  operations: number;
  durationMs: number;
  budgetMs: number;
}>;

function measure<T>(
  name: string,
  operations: number,
  budgetMs: number,
  work: () => T,
): Readonly<{ value: T; metric: Measurement }> {
  const started = performance.now();
  const value = work();
  const durationMs = performance.now() - started;
  return {
    value,
    metric: Object.freeze({ name, operations, durationMs, budgetMs }),
  };
}

function model(index: number): ModelDescriptor {
  const providerId = `provider-${index % 16}`;
  return Object.freeze({
    id: `model-${index}`,
    providerId,
    displayName: `Model ${index}`,
    contextWindow: 131_072,
    qualityScore: 50 + (index % 50),
    speedScore: 50 + ((index * 7) % 50),
    capabilities: Object.freeze({
      streaming: true,
      tools: index % 2 === 0,
      vision: false,
    }),
  });
}

function longRoom(messageCount: number): Room {
  const messages = Object.freeze(Array.from({ length: messageCount }, (_, index) => Object.freeze({
    id: `perf-message-${index}`,
    role: index % 2 === 0 ? "user" as const : "assistant" as const,
    content: `performance message ${index} ${"context ".repeat(10)}`,
    createdAt: index + 1,
  })));
  return Object.freeze({
    schemaVersion: 1,
    id: "performance-room",
    title: "Performance",
    modelId: null,
    mode: "balanced",
    messages,
    createdAt: 0,
    updatedAt: messageCount,
  });
}

describe("Integration performance budgets", () => {
  it("keeps model routing comfortably bounded at catalog scale", () => {
    const router = new ModelRouter();
    const models = Object.freeze(Array.from({ length: 256 }, (_, index) => model(index)));
    const health = Object.freeze(Array.from({ length: 16 }, (_, index) => Object.freeze({
      providerId: `provider-${index}`,
      penalty: index % 3,
      cooldownUntil: null,
    })));

    const { value: lastPlan, metric } = measure("routing-2000x256", 2_000, 10_000, () => {
      let plan = router.plan(models, health, {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: 100,
        maxAttempts: 3,
      });
      for (let index = 1; index < 2_000; index += 1) {
        plan = router.plan(models, health, {
          mode: index % 3 === 0 ? "quick" : index % 3 === 1 ? "balanced" : "deep",
          preferredModelId: null,
          requireStreaming: true,
          now: 100 + index,
          maxAttempts: 3,
        });
      }
      return plan;
    });

    console.info("[perf]", metric);
    expect(lastPlan.candidates).toHaveLength(3);
    expect(metric.durationMs).toBeLessThan(metric.budgetMs);
  });

  it("keeps repeated 2,000-message context assembly within a broad CI budget", () => {
    const builder = new ContextBuilder();
    const room = longRoom(2_000);

    const { value: last, metric } = measure("context-40x2000", 40, 10_000, () => {
      let result = builder.build({
        room,
        systemPrompt: "You are Seven.",
        contextWindow: 8_192,
        memories: [],
        summary: null,
        policy: { reservedOutputTokens: 1_024 },
      });
      for (let index = 1; index < 40; index += 1) {
        result = builder.build({
          room,
          systemPrompt: "You are Seven.",
          contextWindow: 8_192,
          memories: [],
          summary: null,
          policy: { reservedOutputTokens: 1_024 },
        });
      }
      return result;
    });

    console.info("[perf]", metric);
    expect(last.estimatedInputTokens).toBeLessThanOrEqual(last.maxInputTokens);
    expect(last.omittedMessages.length).toBeGreaterThan(0);
    expect(metric.durationMs).toBeLessThan(metric.budgetMs);
  });

  it("keeps TaskManager orchestration overhead bounded for 1,000 independent tasks", async () => {
    const manager = new TaskManager({ maxRetainedCompleted: 0 });
    const started = performance.now();
    const runs = Array.from({ length: 1_000 }, (_, index) =>
      manager.run(
        { kind: "system", ownerId: `perf-owner-${index}` },
        async () => index,
      ),
    );
    const values = await Promise.all(runs.map((run) => run.result));
    const metric: Measurement = Object.freeze({
      name: "task-manager-1000",
      operations: 1_000,
      durationMs: performance.now() - started,
      budgetMs: 10_000,
    });

    console.info("[perf]", metric);
    expect(values).toHaveLength(1_000);
    expect(manager.listActive()).toEqual([]);
    expect(metric.durationMs).toBeLessThan(metric.budgetMs);
  });
});
