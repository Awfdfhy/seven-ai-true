import { describe, expect, it, vi } from "vitest";
import { TaskManager } from "./task-manager";

describe("TaskManager", () => {
  it("completes a task successfully", async () => {
    const manager = new TaskManager();
    let observedTaskId = "";
    const run = manager.run(
      { kind: "chat", ownerId: "room-1" },
      async ({ taskId, signal }) => {
        observedTaskId = taskId;
        expect(signal.aborted).toBe(false);
        return "ok";
      },
    );

    await expect(run.result).resolves.toBe("ok");
    expect(observedTaskId).toBe(run.taskId);
    expect(manager.get(run.taskId)?.status).toBe("succeeded");
    expect(manager.listActive()).toHaveLength(0);
  });

  it("cancels exactly once and cannot double-abort", async () => {
    const manager = new TaskManager();
    let abortEvents = 0;

    const run = manager.run(
      { kind: "chat", ownerId: "room-1" },
      ({ signal }) =>
        new Promise<string>((_resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => {
              abortEvents += 1;
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        }),
    );

    await vi.waitFor(() =>
      expect(manager.get(run.taskId)?.status).toBe("running"),
    );

    expect(run.cancel("user")).toBe(true);
    expect(run.cancel("user-again")).toBe(false);

    await expect(run.result).rejects.toMatchObject({
      code: "CANCELLED",
    });
    expect(abortEvents).toBe(1);
    expect(manager.get(run.taskId)?.status).toBe("cancelled");
  });

  it("isolates active tasks by owner", async () => {
    const manager = new TaskManager();

    const makePending = (ownerId: string) =>
      manager.run(
        { kind: "chat", ownerId },
        ({ signal }) =>
          new Promise<void>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("Aborted", "AbortError")),
              { once: true },
            );
          }),
      );

    const a = makePending("room-a");
    const b = makePending("room-b");

    await vi.waitFor(() => expect(manager.listActive()).toHaveLength(2));
    expect(manager.listActive("room-a")).toHaveLength(1);

    a.cancel();
    b.cancel();
    await Promise.allSettled([a.result, b.result]);
  });

  it("turns timeout into a deadline error", async () => {
    vi.useFakeTimers();
    const manager = new TaskManager();

    const run = manager.run(
      { kind: "research", ownerId: "room-1", timeoutMs: 1000 },
      ({ signal }) =>
        new Promise<void>((_resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    await vi.advanceTimersByTimeAsync(1000);

    await expect(run.result).rejects.toMatchObject<SevenError>({
      code: "DEADLINE_EXCEEDED",
    });
    expect(manager.get(run.taskId)?.status).toBe("cancelled");
    vi.useRealTimers();
  });
});
