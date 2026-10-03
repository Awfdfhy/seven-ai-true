import { describe, expect, it, vi } from "vitest";
import { SevenError } from "../../core/errors";
import { AppKernel, type KernelService } from "../../kernel/app-kernel";
import { DiagnosticsBuffer } from "../../observability/diagnostics";

function service(
  id: string,
  log: string[],
  options: {
    dependsOn?: readonly string[];
    start?: () => Promise<void>;
    stop?: () => Promise<void>;
  } = {},
): KernelService {
  return {
    id,
    ...(options.dependsOn ? { dependsOn: options.dependsOn } : {}),
    async start() {
      log.push(`start:${id}`);
      await options.start?.();
    },
    async stop() {
      log.push(`stop:${id}`);
      await options.stop?.();
    },
  };
}

describe("Phase 11 AppKernel + observability", () => {
  it("boots services once in dependency order and shuts down in reverse order", async () => {
    const log: string[] = [];
    const kernel = new AppKernel();
    kernel.register(service("storage", log));
    kernel.register(service("memory", log, { dependsOn: ["storage"] }));
    kernel.register(service("ui", log, { dependsOn: ["memory"] }));

    const one = kernel.start();
    const two = kernel.start();
    expect(one).toBe(two);
    expect((await one).status).toBe("running");
    expect(log).toEqual(["start:storage", "start:memory", "start:ui"]);

    await kernel.start();
    expect(log).toEqual(["start:storage", "start:memory", "start:ui"]);

    await kernel.shutdown();
    expect(log).toEqual([
      "start:storage",
      "start:memory",
      "start:ui",
      "stop:ui",
      "stop:memory",
      "stop:storage",
    ]);
  });

  it("rolls back already-started services when a later dependency fails", async () => {
    const log: string[] = [];
    const diagnostics = new DiagnosticsBuffer(32, () => 10);
    const kernel = new AppKernel(diagnostics);
    kernel.register(service("storage", log));
    kernel.register(service("network", log, {
      dependsOn: ["storage"],
      start: async () => {
        throw new SevenError({ code: "NETWORK", message: "offline", retryable: true });
      },
    }));

    await expect(kernel.start()).rejects.toMatchObject({ code: "NETWORK" });
    expect(log).toEqual(["start:storage", "start:network", "stop:storage"]);
    expect(kernel.snapshot()).toMatchObject({
      status: "failed",
      failedServiceId: "network",
      rollbackFailureCount: 0,
      errorCode: "NETWORK",
    });
    expect(diagnostics.list().some((event) => event.name === "start_failed")).toBe(true);
  });

  it("can retry cleanly after recovery from a startup failure", async () => {
    const log: string[] = [];
    let fail = true;
    const kernel = new AppKernel();
    kernel.register(service("storage", log));
    kernel.register(service("provider", log, {
      dependsOn: ["storage"],
      start: async () => {
        if (fail) throw new SevenError({ code: "PROVIDER", message: "down", retryable: true });
      },
    }));

    await expect(kernel.start()).rejects.toMatchObject({ code: "PROVIDER" });
    fail = false;
    expect((await kernel.start()).status).toBe("running");
    expect(log).toEqual([
      "start:storage",
      "start:provider",
      "stop:storage",
      "start:storage",
      "start:provider",
    ]);
  });

  it("rejects missing dependencies and cycles before starting any service", async () => {
    const log: string[] = [];
    const missing = new AppKernel();
    missing.register(service("ui", log, { dependsOn: ["storage"] }));
    await expect(missing.start()).rejects.toMatchObject({ code: "VALIDATION" });
    expect(log).toEqual([]);

    const cyclic = new AppKernel();
    cyclic.register(service("a", log, { dependsOn: ["b"] }));
    cyclic.register(service("b", log, { dependsOn: ["a"] }));
    await expect(cyclic.start()).rejects.toMatchObject({ code: "VALIDATION" });
    expect(log).toEqual([]);
  });

  it("cancels an in-flight boot and rolls back completed dependencies", async () => {
    const log: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const kernel = new AppKernel();
    kernel.register(service("storage", log));
    kernel.register({
      id: "slow",
      dependsOn: ["storage"],
      async start(signal) {
        log.push("start:slow");
        await Promise.race([
          gate,
          new Promise<void>((_, reject) =>
            signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }),
          ),
        ]);
      },
      async stop() {
        log.push("stop:slow");
      },
    });

    const pending = kernel.start();
    for (let i = 0; i < 8 && !log.includes("start:slow"); i += 1) await Promise.resolve();
    expect(kernel.cancelStart()).toBe(true);
    release();
    await expect(pending).rejects.toMatchObject({ code: "CANCELLED" });
    expect(log).toContain("stop:storage");
    expect(kernel.snapshot().status).toBe("failed");
  });

  it("redacts sensitive/content-bearing diagnostic attributes and enforces ring capacity", () => {
    let now = 1;
    const diagnostics = new DiagnosticsBuffer(2, () => now++);
    diagnostics.record({
      level: "info",
      category: "github",
      name: "request",
      attributes: {
        accessToken: "ghp-secret",
        Authorization: "Bearer secret",
        prompt: "private user prompt",
        messageContent: "private content",
        modelId: "model-a",
      },
    });
    diagnostics.record({ level: "info", category: "kernel", name: "two" });
    diagnostics.record({ level: "warn", category: "kernel", name: "three" });

    const events = diagnostics.list();
    expect(events).toHaveLength(2);
    expect(events.map((event) => event.name)).toEqual(["two", "three"]);

    const isolated = new DiagnosticsBuffer(4, () => 10);
    const event = isolated.record({
      level: "error",
      category: "provider",
      name: "failed",
      correlationId: "task-1",
      attributes: {
        token: "secret",
        body: "raw response",
        latencyMs: 25,
      },
    });
    expect(event.attributes.token).toBe("[redacted]");
    expect(event.attributes.body).toBe("[redacted]");
    expect(event.attributes.latencyMs).toBe(25);
    expect(JSON.stringify(event)).not.toContain("secret");
    expect(JSON.stringify(event)).not.toContain("raw response");
  });

  it("observer-free diagnostics never block kernel lifecycle", async () => {
    const log: string[] = [];
    const diagnostics = new DiagnosticsBuffer(8, () => 1);
    const record = vi.spyOn(diagnostics, "record").mockImplementation(() => {
      throw new Error("diagnostics failure");
    });
    const kernel = new AppKernel(diagnostics);
    kernel.register(service("one", log));
    expect((await kernel.start()).status).toBe("running");
    expect(record).toHaveBeenCalled();
  });
});
