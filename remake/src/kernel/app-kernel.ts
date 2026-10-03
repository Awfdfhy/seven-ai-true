import { SevenError, toSevenError } from "../core/errors";
import type { DiagnosticsBuffer } from "../observability/diagnostics";

export type KernelStatus =
  | "idle"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "failed";

export interface KernelService {
  readonly id: string;
  readonly dependsOn?: readonly string[];
  start(signal: AbortSignal): Promise<void>;
  stop(): Promise<void>;
}

export type KernelSnapshot = Readonly<{
  status: KernelStatus;
  registeredServiceIds: readonly string[];
  startedServiceIds: readonly string[];
  failedServiceId: string | null;
  rollbackFailureCount: number;
  errorCode: SevenError["code"] | null;
}>;

function canonical(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function snapshotService(service: KernelService): KernelService {
  if (
    !service ||
    typeof service !== "object" ||
    typeof service.start !== "function" ||
    typeof service.stop !== "function"
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Kernel service is malformed." });
  }
  const id = canonical(service.id, "Kernel service id");
  const dependsOn = Object.freeze([...(service.dependsOn ?? [])].map((dependency) => canonical(dependency, "Kernel dependency id")));
  if (new Set(dependsOn).size !== dependsOn.length || dependsOn.includes(id)) {
    throw new SevenError({ code: "VALIDATION", message: "Kernel service dependencies are duplicated or self-referential." });
  }
  return Object.freeze({
    id,
    dependsOn,
    start: service.start.bind(service),
    stop: service.stop.bind(service),
  });
}

export class AppKernel {
  private readonly services = new Map<string, KernelService>();
  private status: KernelStatus = "idle";
  private started: string[] = [];
  private failedServiceId: string | null = null;
  private rollbackFailureCount = 0;
  private errorCode: SevenError["code"] | null = null;
  private startPromise: Promise<KernelSnapshot> | null = null;
  private stopPromise: Promise<KernelSnapshot> | null = null;
  private startController: AbortController | null = null;

  constructor(private readonly diagnostics?: DiagnosticsBuffer) {
    if (
      diagnostics !== undefined &&
      (!diagnostics || typeof diagnostics !== "object" || typeof diagnostics.record !== "function")
    ) {
      throw new SevenError({ code: "VALIDATION", message: "AppKernel diagnostics dependency is malformed." });
    }
  }

  register(service: KernelService): void {
    if (this.status !== "idle" && this.status !== "stopped" && this.status !== "failed") {
      throw new SevenError({ code: "VALIDATION", message: "Kernel services cannot be registered while lifecycle is active." });
    }
    const normalized = snapshotService(service);
    if (this.services.has(normalized.id)) {
      throw new SevenError({ code: "VALIDATION", message: "Kernel service id is already registered." });
    }
    this.services.set(normalized.id, normalized);
  }

  snapshot(): KernelSnapshot {
    return Object.freeze({
      status: this.status,
      registeredServiceIds: Object.freeze([...this.services.keys()]),
      startedServiceIds: Object.freeze([...this.started]),
      failedServiceId: this.failedServiceId,
      rollbackFailureCount: this.rollbackFailureCount,
      errorCode: this.errorCode,
    });
  }

  start(): Promise<KernelSnapshot> {
    if (this.status === "running") return Promise.resolve(this.snapshot());
    if (this.startPromise) return this.startPromise;
    if (this.stopPromise) {
      return this.stopPromise.then(() => this.start());
    }

    const order = this.resolveOrder();
    this.status = "starting";
    this.failedServiceId = null;
    this.rollbackFailureCount = 0;
    this.errorCode = null;
    this.started = [];
    const controller = new AbortController();
    this.startController = controller;
    this.record("info", "kernel", "start_begin", { serviceCount: order.length });

    const pending = (async () => {
      try {
        for (const service of order) {
          if (controller.signal.aborted) throw new DOMException("Aborted", "AbortError");
          try {
            await service.start(controller.signal);
          } catch (error) {
            this.failedServiceId = service.id;
            throw error;
          }
          if (controller.signal.aborted) throw new DOMException("Aborted", "AbortError");
          this.started.push(service.id);
          this.record("info", "kernel", "service_started", { serviceId: service.id });
        }
        this.status = "running";
        this.record("info", "kernel", "start_complete", { startedCount: this.started.length });
        return this.snapshot();
      } catch (error) {
        const normalized =
          error instanceof DOMException && error.name === "AbortError"
            ? new SevenError({ code: "CANCELLED", message: "Kernel startup cancelled." })
            : toSevenError(error);
        this.errorCode = normalized.code;
        await this.rollbackStarted();
        this.status = "failed";
        this.record("error", "kernel", "start_failed", {
          failedServiceId: this.failedServiceId,
          errorCode: normalized.code,
          rollbackFailureCount: this.rollbackFailureCount,
        });
        throw new SevenError({
          code: normalized.code,
          message: "Kernel startup failed.",
          retryable: normalized.retryable,
        });
      } finally {
        if (this.startPromise === pending) this.startPromise = null;
        if (this.startController === controller) this.startController = null;
      }
    })();

    this.startPromise = pending;
    return pending;
  }

  cancelStart(): boolean {
    if (this.status !== "starting" || !this.startController || this.startController.signal.aborted) return false;
    this.startController.abort("kernel-cancel");
    return true;
  }

  shutdown(): Promise<KernelSnapshot> {
    if (this.stopPromise) return this.stopPromise;
    if (this.status === "idle" || this.status === "stopped") {
      this.status = "stopped";
      return Promise.resolve(this.snapshot());
    }
    if (this.startPromise) {
      this.cancelStart();
      return this.startPromise.catch(() => undefined).then(() => this.shutdown());
    }

    this.status = "stopping";
    this.record("info", "kernel", "shutdown_begin", { startedCount: this.started.length });
    const pending = (async () => {
      const failures: unknown[] = [];
      for (const id of [...this.started].reverse()) {
        const service = this.services.get(id);
        if (!service) continue;
        try {
          await service.stop();
          this.record("info", "kernel", "service_stopped", { serviceId: id });
        } catch (error) {
          failures.push(error);
          this.record("warn", "kernel", "service_stop_failed", { serviceId: id });
        }
      }
      this.started = [];
      this.status = failures.length === 0 ? "stopped" : "failed";
      this.rollbackFailureCount = failures.length;
      this.errorCode = failures.length === 0 ? null : "UNKNOWN";
      this.record(failures.length === 0 ? "info" : "error", "kernel", "shutdown_complete", {
        failureCount: failures.length,
      });
      if (failures.length > 0) {
        throw new SevenError({
          code: "UNKNOWN",
          message: "Kernel shutdown completed with service stop failures.",
          retryable: true,
          details: { failureCount: failures.length },
        });
      }
      return this.snapshot();
    })().finally(() => {
      if (this.stopPromise === pending) this.stopPromise = null;
    });
    this.stopPromise = pending;
    return pending;
  }

  private resolveOrder(): readonly KernelService[] {
    const permanent = new Set<string>();
    const temporary = new Set<string>();
    const ordered: KernelService[] = [];

    const visit = (id: string) => {
      if (permanent.has(id)) return;
      if (temporary.has(id)) {
        throw new SevenError({ code: "VALIDATION", message: "Kernel dependency graph contains a cycle." });
      }
      const service = this.services.get(id);
      if (!service) {
        throw new SevenError({ code: "VALIDATION", message: `Kernel dependency ${id} is not registered.` });
      }
      temporary.add(id);
      for (const dependency of service.dependsOn ?? []) {
        if (!this.services.has(dependency)) {
          throw new SevenError({ code: "VALIDATION", message: `Kernel dependency ${dependency} is not registered.` });
        }
        visit(dependency);
      }
      temporary.delete(id);
      permanent.add(id);
      ordered.push(service);
    };

    for (const id of this.services.keys()) visit(id);
    return Object.freeze(ordered);
  }

  private async rollbackStarted(): Promise<void> {
    let failures = 0;
    for (const id of [...this.started].reverse()) {
      const service = this.services.get(id);
      if (!service) continue;
      try {
        await service.stop();
        this.record("info", "kernel", "service_rolled_back", { serviceId: id });
      } catch {
        failures += 1;
        this.record("warn", "kernel", "rollback_stop_failed", { serviceId: id });
      }
    }
    this.started = [];
    this.rollbackFailureCount = failures;
  }

  private record(
    level: "info" | "warn" | "error",
    category: string,
    name: string,
    attributes?: Readonly<Record<string, unknown>>,
  ): void {
    try {
      this.diagnostics?.record({ level, category, name, attributes });
    } catch {
      // Diagnostics must never become a lifecycle dependency.
    }
  }
}
