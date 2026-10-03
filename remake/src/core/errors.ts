export type SevenErrorCode =
  | "CANCELLED"
  | "DEADLINE_EXCEEDED"
  | "NETWORK"
  | "PROVIDER"
  | "STORAGE"
  | "BRIDGE"
  | "VALIDATION"
  | "UNKNOWN";

export type SevenErrorOptions = {
  code: SevenErrorCode;
  message: string;
  retryable?: boolean;
  cause?: unknown;
  details?: Readonly<Record<string, unknown>>;
};

export class SevenError extends Error {
  readonly code: SevenErrorCode;
  readonly retryable: boolean;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(options: SevenErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "SevenError";
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.details =
      options.details === undefined
        ? undefined
        : Object.freeze({ ...options.details });
  }
}

export function toSevenError(error: unknown): SevenError {
  if (error instanceof SevenError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new SevenError({
      code: "CANCELLED",
      message: "Task cancelled.",
      cause: error,
    });
  }
  if (error instanceof Error) {
    return new SevenError({
      code: "UNKNOWN",
      message: error.message || "Unknown error.",
      cause: error,
    });
  }
  return new SevenError({
    code: "UNKNOWN",
    message: "Unknown error.",
    details: {
      valueType:
        error === null ? "null" : Array.isArray(error) ? "array" : typeof error,
    },
  });
}
