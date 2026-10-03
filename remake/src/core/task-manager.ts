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
  cancellationSealed: boolean;
  deadlineSealed: boolean;
  error?: SevenError;
}>;

export type TaskContext = Readonly<{
  taskId: string;
  signal: AbortSignal;
  sealCancellation: () => boolean;
  sealDeadline: () => boolean;
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
  cancellationSealed: boolean;
  deadlineSealed: boolean;
  error?: SevenError;
  controller: AbortController;
  timeoutId?: ReturnType<typeof setTimeout>;
};

type Listener = (snapshot: TaskSnapshot) => void;

const MAX_TIMEOUT_MS = 2_147_483_647;

export type TaskManagerOptions = Readonly<{
  maxRetainedCompleted?: number;
}>;

export class TaskManager {
  private readonly tasks = new Map<string, MutableTask>();
  private readonly listeners = new Set<Listener>();
  private readonly completedOrder: string[] = [];
  private readonly exclusiveOwners = new Set<string>();
  private readonly maxRetainedCompleted: number;

  constructor(options: TaskManagerOptions = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "TaskManager options must be an object.",
      });
    }
    const limit = options.maxRetainedCompleted ?? 128;
    if (!Number.isSafeInteger(limit) || limit < 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "maxRetainedCompleted must be a non-negative integer.",
      });
    }
    this.maxRetainedCompleted = limit;
  }

  subscribe(listener: Listener): () => void {
    if (typeof listener !== "function") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task listener must be a function.",
      });
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get(taskId: string): TaskSnapshot | undefined {
    const id = this.validateTaskId(taskId);
    const task = this.tasks.get(id);
    return task ? this.snapshot(task) : undefined;
  }

  claimExclusiveOwner(ownerId: string): () => void {
    this.validateOwnerId(ownerId);

    if (
      this.exclusiveOwners.has(ownerId) ||
      this.listActive(ownerId).length > 0
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task owner is already active or reserved.",
        details: { ownerId },
      });
    }

    this.exclusiveOwners.add(ownerId);
    let released = false;

    return () => {
      if (released) return;
      released = true;
      this.exclusiveOwners.delete(ownerId);
    };
  }

  listActive(ownerId?: string): TaskSnapshot[] {
    if (ownerId !== undefined) this.validateOwnerId(ownerId);
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
    if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task specification must be an object.",
      });
    }
    const validKinds: readonly TaskKind[] = [
      "chat",
      "research",
      "attachment",
      "github",
      "rpg",
      "system",
    ];
    if (!validKinds.includes(spec.kind)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task kind is invalid.",
      });
    }
    this.validateOwnerId(spec.ownerId);
    if (this.exclusiveOwners.has(spec.ownerId)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task owner is currently reserved.",
        details: { ownerId: spec.ownerId },
      });
    }
    if (typeof executor !== "function") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task executor must be a function.",
      });
    }

    const timeoutMs = spec.timeoutMs;
    if (
      timeoutMs !== undefined &&
      (!Number.isFinite(timeoutMs) ||
        timeoutMs <= 0 ||
        timeoutMs > MAX_TIMEOUT_MS)
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "timeoutMs must be a positive finite timer-safe number.",
      });
    }

    const taskId = crypto.randomUUID();
    const startedAt = Date.now();
    const controller = new AbortController();

    const task: MutableTask = {
      taskId,
      kind: spec.kind,
      ownerId: spec.ownerId,
      status: "starting",
      startedAt,
      cancellationSealed: false,
      deadlineSealed: false,
      controller,
    };

    if (timeoutMs !== undefined) {
      task.deadlineAt = startedAt + timeoutMs;
    }

    this.tasks.set(taskId, task);
    this.emit(task);

    if (timeoutMs !== undefined) {
      task.timeoutId = setTimeout(() => {
        this.requestCancel(task, "deadline");
      }, timeoutMs);
    }

    const result = Promise.resolve()
      .then(() => {
        if (task.status === "cancelling") {
          throw new DOMException("Aborted", "AbortError");
        }
        task.status = "running";
        this.emit(task);
        return this.executeWithAbort(task, () =>
          executor({
            taskId,
            signal: controller.signal,
            sealCancellation: () => this.sealCancellation(task),
          }),
        );
      })
      .then(
        (value) => {
          if (
            (!task.deadlineSealed &&
              task.cancelReason === "deadline" &&
              controller.signal.aborted) ||
            (!task.cancellationSealed &&
              (controller.signal.aborted || task.status === "cancelling"))
          ) {
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
          if (
            (!task.deadlineSealed &&
              task.cancelReason === "deadline" &&
              controller.signal.aborted) ||
            (!task.cancellationSealed &&
              (controller.signal.aborted || task.status === "cancelling"))
          ) {
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

          task.error =
            error instanceof DOMException && error.name === "AbortError"
              ? new SevenError({
                  code: "UNKNOWN",
                  message:
                    "Task executor aborted without TaskManager cancellation.",
                  cause: error,
                })
              : toSevenError(error);
          this.finish(task, "failed");
          throw task.error;
        },
      );

    return {
      taskId,
      result,
      cancel: (reason = "user") =>
        this.requestCancel(task, this.validateCancelReason(reason)),
    };
  }

  cancel(taskId: string, reason = "user"): boolean {
    const id = this.validateTaskId(taskId);
    const normalizedReason = this.validateCancelReason(reason);
    const task = this.tasks.get(id);
    return task ? this.requestCancel(task, normalizedReason) : false;
  }

  private validateCancelReason(reason: string): string {
    if (typeof reason !== "string" || !reason.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Cancellation reason must be a non-empty string.",
      });
    }
    return reason.trim();
  }

  private validateTaskId(taskId: string): string {
    if (
      typeof taskId !== "string" ||
      !taskId.trim() ||
      taskId !== taskId.trim()
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "taskId must be a canonical non-empty string.",
      });
    }
    return taskId;
  }

  private validateOwnerId(ownerId: string): void {
    if (
      typeof ownerId !== "string" ||
      !ownerId.trim() ||
      ownerId !== ownerId.trim()
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Task ownerId must be a canonical non-empty string.",
      });
    }
  }

  private executeWithAbort<T>(
    task: MutableTask,
    executor: () => Promise<T>,
  ): Promise<T> {
    const signal = task.controller.signal;
    if (signal.aborted) {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }

    return new Promise<T>((resolve, reject) => {
      let settled = false;
      const cleanup = () => signal.removeEventListener("abort", onAbort);
      const finishResolve = (value: T) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      const finishReject = (error: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };
      const onAbort = () =>
        finishReject(new DOMException("Aborted", "AbortError"));

      signal.addEventListener("abort", onAbort, { once: true });
      Promise.resolve()
        .then(executor)
        .then(finishResolve, finishReject);
    });
  }

  private sealCancellation(task: MutableTask): boolean {
    if (
      task.cancellationSealed ||
      task.status === "cancelling" ||
      task.status === "cancelled" ||
      task.status === "failed" ||
      task.status === "succeeded" ||
      task.controller.signal.aborted
    ) {
      return false;
    }
    task.cancellationSealed = true;
    this.emit(task);
    return true;
  }

  private sealDeadline(task: MutableTask): boolean {
    if (
      task.deadlineSealed ||
      task.status === "cancelling" ||
      task.status === "cancelled" ||
      task.status === "failed" ||
      task.status === "succeeded" ||
      task.controller.signal.aborted
    ) {
      return false;
    }
    task.deadlineSealed = true;
    if (task.timeoutId !== undefined) {
      clearTimeout(task.timeoutId);
      delete task.timeoutId;
    }
    this.emit(task);
    return true;
  }

  private requestCancel(task: MutableTask, reason: string): boolean {
    if (
      (reason === "deadline" && task.deadlineSealed) ||
      (task.cancellationSealed && reason !== "deadline") ||
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
    task.finishedAt = Math.max(task.startedAt, Date.now());
    this.emit(task);

    this.completedOrder.push(task.taskId);
    while (this.completedOrder.length > this.maxRetainedCompleted) {
      const oldest = this.completedOrder.shift();
      if (oldest !== undefined) this.tasks.delete(oldest);
    }
  }

  private snapshot(task: MutableTask): TaskSnapshot {
    return Object.freeze({
      taskId: task.taskId,
      kind: task.kind,
      ownerId: task.ownerId,
      status: task.status,
      startedAt: task.startedAt,
      cancellationSealed: task.cancellationSealed,
      deadlineSealed: task.deadlineSealed,
      ...(task.finishedAt !== undefined
        ? { finishedAt: task.finishedAt }
        : {}),
      ...(task.deadlineAt !== undefined
        ? { deadlineAt: task.deadlineAt }
        : {}),
      ...(task.cancelReason !== undefined
        ? { cancelReason: task.cancelReason }
        : {}),
      ...(task.error !== undefined
        ? {
            error: new SevenError({
              code: task.error.code,
              message: this.publicErrorMessage(task.error.code),
              retryable: task.error.retryable,
            }),
          }
        : {}),
    });
  }

  private publicErrorMessage(code: SevenError["code"]): string {
    switch (code) {
      case "CANCELLED":
        return "Task cancelled.";
      case "DEADLINE_EXCEEDED":
        return "Task deadline exceeded.";
      case "NETWORK":
        return "Network operation failed.";
      case "PROVIDER":
        return "Provider operation failed.";
      case "STORAGE":
        return "Storage operation failed.";
      case "BRIDGE":
        return "Bridge operation failed.";
      case "VALIDATION":
        return "Task validation failed.";
      case "UNKNOWN":
      default:
        return "Task failed.";
    }
  }

  private emit(task: MutableTask): void {
    const snapshot = this.snapshot(task);
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {
        // Observers must never be able to corrupt task lifecycle.
      }
    }
  }
}
