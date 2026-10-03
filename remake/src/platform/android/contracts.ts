import { SevenError } from "../../core/errors";

export const ANDROID_BRIDGE_LIMITS = Object.freeze({
  methodCharacters: 128,
  uriCharacters: 4096,
  errorMessageCharacters: 2048,
});

export type AndroidCapability =
  | "saf"
  | "secure-storage"
  | "file-read"
  | "file-write"
  | "lifecycle";

export type BridgeRequest<T> = Readonly<{
  requestId: string;
  method: string;
  payload: T;
}>;

export type BridgeError = Readonly<{
  code: string;
  message: string;
  retryable: boolean;
}>;

export type BridgeResult<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: BridgeError }>;

export type BridgeResponse<T> = Readonly<{
  requestId: string;
  result: BridgeResult<T>;
}>;

export type AndroidCapabilities = Readonly<{
  schemaVersion: 1;
  capabilities: readonly AndroidCapability[];
}>;

export type SafGrant = Readonly<{
  schemaVersion: 1;
  uri: string;
  read: boolean;
  write: boolean;
  persisted: boolean;
  issuedAt: number;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonical(value: unknown, field: string, max = 512): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a canonical non-empty string.`,
    });
  }
  return value;
}

export function createBridgeRequest<T>(
  method: string,
  payload: T,
  requestId: string = crypto.randomUUID(),
): BridgeRequest<T> {
  return Object.freeze({
    requestId: canonical(requestId, "Bridge requestId"),
    method: canonical(method, "Bridge method", ANDROID_BRIDGE_LIMITS.methodCharacters),
    payload,
  });
}

export function assertBridgeResponse<T>(
  value: unknown,
  expectedRequestId: string,
): asserts value is BridgeResponse<T> {
  const requestId = canonical(expectedRequestId, "Expected requestId");
  if (!isRecord(value)) {
    throw new SevenError({ code: "BRIDGE", message: "Native bridge response must be an object." });
  }
  if (value.requestId !== requestId) {
    throw new SevenError({
      code: "BRIDGE",
      message: "Native bridge response requestId does not match the active request.",
    });
  }
  if (!isRecord(value.result) || typeof value.result.ok !== "boolean") {
    throw new SevenError({ code: "BRIDGE", message: "Native bridge result envelope is malformed." });
  }
  if (value.result.ok) {
    if (!("value" in value.result)) {
      throw new SevenError({ code: "BRIDGE", message: "Successful native bridge result is missing value." });
    }
    return;
  }
  if (!isRecord(value.result.error)) {
    throw new SevenError({ code: "BRIDGE", message: "Failed native bridge result is missing error metadata." });
  }
  const error = value.result.error;
  canonical(error.code, "Bridge error code", 128);
  canonical(error.message, "Bridge error message", ANDROID_BRIDGE_LIMITS.errorMessageCharacters);
  if (typeof error.retryable !== "boolean") {
    throw new SevenError({ code: "BRIDGE", message: "Bridge error retryable flag is invalid." });
  }
}

export function createAndroidCapabilities(
  capabilities: readonly AndroidCapability[],
): AndroidCapabilities {
  if (!Array.isArray(capabilities)) {
    throw new SevenError({ code: "VALIDATION", message: "Android capabilities must be an array." });
  }
  const allowed = new Set<AndroidCapability>([
    "saf",
    "secure-storage",
    "file-read",
    "file-write",
    "lifecycle",
  ]);
  const seen = new Set<AndroidCapability>();
  const normalized: AndroidCapability[] = [];
  for (const capability of capabilities) {
    if (!allowed.has(capability) || seen.has(capability)) {
      throw new SevenError({ code: "VALIDATION", message: "Android capability list is invalid or duplicated." });
    }
    seen.add(capability);
    normalized.push(capability);
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    capabilities: Object.freeze(normalized),
  });
}

export function isAndroidCapabilities(value: unknown): value is AndroidCapabilities {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.capabilities)) return false;
  try {
    const normalized = createAndroidCapabilities(value.capabilities as AndroidCapability[]);
    return normalized.capabilities.length === value.capabilities.length;
  } catch {
    return false;
  }
}

export function createSafGrant(input: Omit<SafGrant, "schemaVersion">): SafGrant {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new SevenError({ code: "VALIDATION", message: "SAF grant must be an object." });
  }
  const uri = canonical(input.uri, "SAF URI", ANDROID_BRIDGE_LIMITS.uriCharacters);
  let parsed: URL;
  try { parsed = new URL(uri); }
  catch (error) {
    throw new SevenError({ code: "VALIDATION", message: "SAF URI is invalid.", cause: error });
  }
  if (parsed.protocol !== "content:") {
    throw new SevenError({ code: "VALIDATION", message: "SAF grants must use content:// URIs." });
  }
  if (typeof input.read !== "boolean" || typeof input.write !== "boolean" || (!input.read && !input.write)) {
    throw new SevenError({ code: "VALIDATION", message: "SAF grant must include read and/or write permission." });
  }
  if (typeof input.persisted !== "boolean") {
    throw new SevenError({ code: "VALIDATION", message: "SAF persisted flag is invalid." });
  }
  if (!Number.isFinite(input.issuedAt) || input.issuedAt < 0) {
    throw new SevenError({ code: "VALIDATION", message: "SAF issuedAt is invalid." });
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    uri,
    read: input.read,
    write: input.write,
    persisted: input.persisted,
    issuedAt: input.issuedAt,
  });
}

export function isSafGrant(value: unknown): value is SafGrant {
  if (!isRecord(value) || value.schemaVersion !== 1) return false;
  try {
    const normalized = createSafGrant(value as Omit<SafGrant, "schemaVersion">);
    return (
      normalized.uri === value.uri &&
      normalized.read === value.read &&
      normalized.write === value.write &&
      normalized.persisted === value.persisted &&
      normalized.issuedAt === value.issuedAt
    );
  } catch {
    return false;
  }
}
