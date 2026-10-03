import { SevenError, toSevenError } from "./errors";

export type TaskStatus =
  | "starting"
  | "running"
  | "cancelling"
  | "cancelled"
  | "succeeded"
  | "failed";

export type TaskKind =
  | "chat"
  | "research"
  | "attachment"
  | "github"
  | "rpg"
  | "system";

export type TaskSnapshot = Readonly<{
  taskId: string;
  kind: TaskKind;
  ownerId: string;
  status: TaskStatus;
  startedAt: number;
  finishedAt?: number;
  deadlineAt?: number;
  cancelReason?: string;
  error?: SevenError;
}>;

export type TaskContext = Readonly<{
  taskId: string;
  signal: AbortSignal;
}>;

export type TaskSpec = Readonly<{
  kind: TaskKind;
  ownerId: string;
  timeoutMs?: number;
}>;

export type TaskRun<T> = Readonly<{
  taskId: string;
  result: Promise<T>;
  cancel: (reason?: string) => boolean;
}>;

type MutableTask = {
  taskId: string;
  kind: TaskKind;
  ownerId: string;
  status: TaskStatus;
  startedAt: number;
  finishedAt?: number;
  deadlineAt?: number;
  cancelReason?: string;
  error?: SevenError;
  controller: AbortController;
  timeoutId?: ReturnType<typeof setTimeout>;
};

type Listener = (snapshot: TaskSnapshot) => void;

export class TaskManager {
  private readonly tasks = new Map<string, MutableTask>();
  private readonly listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get(taskId: string): TaskSnapshot | undefined {
    const task = this.tasks.get(taskId);
    return task ? this.snapshot(task) : undefined;
  }

  listActive(ownerId?: string): TaskSnapshot[] {
    return [...this.tasks.values()]
      .filter((task) =>
        ["starting", "running", "cancelling"].includes(task.status),
      )
      .filter((task) => ownerId === undefined || task.ownerId === ownerId)
      .map((task) => this.snapshot(task));
  }

  run<T>(
    spec: TaskSpec,
    executor: (context: TaskContext) => Promise<T>,
  ): TaskRun<T> {
    const taskId = crypto.randomUUID();
    const startedAt = Date.now();
    const controller = new AbortController();

    const task: MutableTask = {
      taskId,
      kind: spec.kind,
      ownerId: spec.ownerId,
      status: "starting",
      startedAt,
      controller,
    };

    if (spec.timeoutMs !== undefined) {
      if (!Number.isFinite(spec.timeoutMs) || spec.timeoutMs <= 0) {
        throw new SevenError({
          code: "VALIDATION",
          message: "timeoutMs must be a positive finite number.",
        });
      }
      task.deadlineAt = startedAt + spec.timeoutMs;
    }

    this.tasks.set(taskId, task);
    this.emit(task);

    if (spec.timeoutMs !== undefined) {
      task.timeoutId = setTimeout(() => {
        this.requestCancel(task, "deadline");
      }, spec.timeoutMs);
    }

    const result = Promise.resolve()
      .then(() => {
        if (task.status === "cancelling") {
          throw new DOMException("Aborted", "AbortError");
        }
        task.status = "running";
        this.emit(task);
        return executor({ taskId, signal: controller.signal });
      })
      .then(
        (value) => {
          if (controller.signal.aborted || task.status === "cancelling") {
            const code =
              task.cancelReason === "deadline"
                ? "DEADLINE_EXCEEDED"
                : "CANCELLED";
            task.error = new SevenError({
              code,
              message:
                code === "DEADLINE_EXCEEDED"
                  ? "Task deadline exceeded."
                  : "Task cancelled.",
            });
            this.finish(task, "cancelled");
            throw task.error;
          }

          this.finish(task, "succeeded");
          return value;
        },
        (error: unknown) => {
          if (controller.signal.aborted || task.status === "cancelling") {
            const code =
              task.cancelReason === "deadline"
                ? "DEADLINE_EXCEEDED"
                : "CANCELLED";
            task.error = new SevenError({
              code,
              message:
                code === "DEADLINE_EXCEEDED"
                  ? "Task deadline exceeded."
                  : "Task cancelled.",
              cause: error,
            });
            this.finish(task, "cancelled");
            throw task.error;
          }

          task.error = toSevenError(error);
          this.finish(task, "failed");
          throw task.error;
        },
      );

    return {
      taskId,
      result,
      cancel: (reason = "user") => this.requestCancel(task, reason),
    };
  }

  cancel(taskId: string, reason = "user"): boolean {
    const task = this.tasks.get(taskId);
    return task ? this.requestCancel(task, reason) : false;
  }

  private requestCancel(task: MutableTask, reason: string): boolean {
    if (
      task.status === "cancelled" ||
      task.status === "succeeded" ||
      task.status === "failed" ||
      task.status === "cancelling"
    ) {
      return false;
    }

    task.status = "cancelling";
    task.cancelReason = reason;
    this.emit(task);

    if (!task.controller.signal.aborted) {
      task.controller.abort(reason);
    }

    return true;
  }

  private finish(
    task: MutableTask,
    status: "cancelled" | "succeeded" | "failed",
  ): void {
    if (task.timeoutId !== undefined) clearTimeout(task.timeoutId);
    delete task.timeoutId;
    task.status = status;
    task.finishedAt = Date.now();
    this.emit(task);
  }

  private snapshot(task: MutableTask): TaskSnapshot {
    return Object.freeze({
      taskId: task.taskId,
      kind: task.kind,
      ownerId: task.ownerId,
      status: task.status,
      startedAt: task.startedAt,
      ...(task.finishedAt !== undefined
        ? { finishedAt: task.finishedAt }
        : {}),
      ...(task.deadlineAt !== undefined
        ? { deadlineAt: task.deadlineAt }
        : {}),
      ...(task.cancelReason !== undefined
        ? { cancelReason: task.cancelReason }
        : {}),
      ...(task.error !== undefined ? { error: task.error } : {}),
    });
  }

  private emit(task: MutableTask): void {
    const snapshot = this.snapshot(task);
    for (const listener of this.listeners) listener(snapshot);
  }
}
