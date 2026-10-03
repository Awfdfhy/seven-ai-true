import { SevenError } from "../core/errors";

export type DiagnosticLevel = "debug" | "info" | "warn" | "error";

export type DiagnosticPrimitive = string | number | boolean | null;

export type DiagnosticEvent = Readonly<{
  schemaVersion: 1;
  sequence: number;
  timestamp: number;
  level: DiagnosticLevel;
  category: string;
  name: string;
  correlationId: string | null;
  attributes: Readonly<Record<string, DiagnosticPrimitive>>;
}>;

export type DiagnosticExport = Readonly<{
  schemaVersion: 1;
  generatedAt: number;
  events: readonly DiagnosticEvent[];
}>;

const BLOCKED_KEY = /(authorization|bearer|token|secret|password|api[-_]?key|credential|cookie|prompt|message|content|body|access[-_]?token|refresh[-_]?token)/i;
const MAX_ATTRIBUTE_KEY = 128;
const MAX_ATTRIBUTE_STRING = 1024;

function canonical(value: unknown, field: string, max = 256): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function safePrimitive(value: unknown): DiagnosticPrimitive {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "[invalid-number]";
    return value;
  }
  if (typeof value === "string") {
    return value.length <= MAX_ATTRIBUTE_STRING
      ? value
      : `${value.slice(0, MAX_ATTRIBUTE_STRING)}…`;
  }
  return "[non-primitive]";
}

function sanitizeAttributes(
  value: Readonly<Record<string, unknown>> | undefined,
): Readonly<Record<string, DiagnosticPrimitive>> {
  if (value === undefined) return Object.freeze({});
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "VALIDATION", message: "Diagnostic attributes must be an object." });
  }
  const entries = Object.entries(value);
  if (entries.length > 64) {
    throw new SevenError({ code: "VALIDATION", message: "Diagnostic attributes exceed the safe limit." });
  }
  const output: Record<string, DiagnosticPrimitive> = {};
  for (const [rawKey, rawValue] of entries) {
    const key = canonical(rawKey, "Diagnostic attribute key", MAX_ATTRIBUTE_KEY);
    output[key] = BLOCKED_KEY.test(key) ? "[redacted]" : safePrimitive(rawValue);
  }
  return Object.freeze(output);
}

function cloneEvent(event: DiagnosticEvent): DiagnosticEvent {
  return Object.freeze({
    schemaVersion: 1 as const,
    sequence: event.sequence,
    timestamp: event.timestamp,
    level: event.level,
    category: event.category,
    name: event.name,
    correlationId: event.correlationId,
    attributes: Object.freeze({ ...event.attributes }),
  });
}

export class DiagnosticsBuffer {
  private readonly events: DiagnosticEvent[] = [];
  private sequence = 0;

  constructor(
    private readonly capacity = 256,
    private readonly now: () => number = Date.now,
  ) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0 || capacity > 10_000) {
      throw new SevenError({ code: "VALIDATION", message: "Diagnostics capacity must be 1-10000." });
    }
    if (typeof now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Diagnostics clock must be a function." });
    }
  }

  record(input: Readonly<{
    level: DiagnosticLevel;
    category: string;
    name: string;
    correlationId?: string | null;
    attributes?: Readonly<Record<string, unknown>>;
  }>): DiagnosticEvent {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new SevenError({ code: "VALIDATION", message: "Diagnostic event must be an object." });
    }
    if (!["debug", "info", "warn", "error"].includes(input.level)) {
      throw new SevenError({ code: "VALIDATION", message: "Diagnostic level is invalid." });
    }
    const timestamp = this.now();
    if (!Number.isFinite(timestamp) || timestamp < 0) {
      throw new SevenError({ code: "VALIDATION", message: "Diagnostics clock returned an invalid timestamp." });
    }
    const correlationId =
      input.correlationId === undefined || input.correlationId === null
        ? null
        : canonical(input.correlationId, "Diagnostic correlationId", 512);

    const event = Object.freeze({
      schemaVersion: 1 as const,
      sequence: ++this.sequence,
      timestamp,
      level: input.level,
      category: canonical(input.category, "Diagnostic category", 128),
      name: canonical(input.name, "Diagnostic name", 128),
      correlationId,
      attributes: sanitizeAttributes(input.attributes),
    });
    this.events.push(event);
    while (this.events.length > this.capacity) this.events.shift();
    return cloneEvent(event);
  }

  list(): readonly DiagnosticEvent[] {
    return Object.freeze(this.events.map(cloneEvent));
  }

  export(): DiagnosticExport {
    const generatedAt = this.now();
    if (!Number.isFinite(generatedAt) || generatedAt < 0) {
      throw new SevenError({ code: "VALIDATION", message: "Diagnostics clock returned an invalid timestamp." });
    }
    return Object.freeze({
      schemaVersion: 1 as const,
      generatedAt,
      events: this.list(),
    });
  }

  clear(): void {
    this.events.splice(0);
  }
}
