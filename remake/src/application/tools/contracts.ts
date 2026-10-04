import { z, type ZodType } from "zod";
import { SevenError } from "../../core/errors";

export type ToolRisk = "pure" | "read" | "write" | "destructive" | "external";
export type ToolIdempotency = "idempotent" | "replay-guarded" | "non-idempotent";
export type ToolApprovalPolicy = "never" | "if-mutating" | "always";
export type ToolSensitivity = "public" | "user-data" | "secret-adjacent";
export type ToolReversibility = "reversible" | "compensatable" | "irreversible";

export type ToolAnnotations = Readonly<{
  risk: ToolRisk;
  idempotency: ToolIdempotency;
  approval: ToolApprovalPolicy;
  sensitivity: ToolSensitivity;
  reversibility: ToolReversibility;
}>;

export type ToolExecutionContext = Readonly<{
  callId: string;
  roomId: string;
  taskId: string;
  signal: AbortSignal;
  markEffectStarted: () => void;
}>;

export type ToolHandler<TInput, TOutput> = (
  context: ToolExecutionContext,
  input: TInput,
) => Promise<TOutput>;

export type ToolDefinition<TInput = unknown, TOutput = unknown> = Readonly<{
  id: string;
  version: string;
  title: string;
  description: string;
  inputSchema: ZodType<TInput>;
  outputSchema: ZodType<TOutput>;
  requiredCapabilities: readonly string[];
  annotations: ToolAnnotations;
  timeoutMs: number;
  maxResultBytes: number;
  concurrencyGroup?: string;
  handler: ToolHandler<TInput, TOutput>;
}>;

export type ToolGrantScope = Readonly<{
  roomId?: string;
  taskId?: string;
}>;

export type ToolGrant = Readonly<{
  grantId: string;
  capabilities: readonly string[];
  toolIds?: readonly string[];
  scope: ToolGrantScope;
  issuedAt: number;
  expiresAt: number;
  source: "user" | "system" | "admin";
}>;

export type ToolInvocation = Readonly<{
  callId: string;
  taskId: string;
  roomId: string;
  toolId: string;
  args: unknown;
  idempotencyKey: string;
  requestedAt: number;
}>;

export type ToolApproval = Readonly<{
  approvalId: string;
  invocationFingerprint: string;
  issuedAt: number;
  expiresAt: number;
  oneShot: boolean;
}>;

export type ToolResultStatus =
  | "succeeded"
  | "denied"
  | "invalid"
  | "cancelled"
  | "failed"
  | "effect_unknown";

export type ToolResult<TOutput = unknown> = Readonly<{
  callId: string;
  toolId: string;
  status: ToolResultStatus;
  output?: TOutput;
  errorCode?: string;
  retryable: boolean;
  effectStarted: boolean;
  startedAt: number;
  completedAt: number;
  invocationFingerprint: string;
}>;

export type ToolAuditEvent = Readonly<{
  callId: string;
  toolId: string;
  roomId: string;
  taskId: string;
  status: ToolResultStatus;
  invocationFingerprint: string;
  effectStarted: boolean;
  startedAt: number;
  completedAt: number;
}>;

export interface ToolAuditSink {
  record(event: ToolAuditEvent): void | Promise<void>;
}

export type ToolExecutionRequest = Readonly<{
  invocation: ToolInvocation;
  grants: readonly ToolGrant[];
  approval?: ToolApproval;
}>;

const TOOL_ID_RE = /^[a-z0-9][a-z0-9._-]{2,127}$/;
const VERSION_RE = /^[0-9]+.[0-9]+.[0-9]+(?:-[a-z0-9.-]+)?$/i;

export function canonicalToolId(value: unknown, field = "tool id"): string {
  if (typeof value !== "string" || value !== value.trim() || !TOOL_ID_RE.test(value)) {
    throw new SevenError({ code: "VALIDATION", message: `${field} is invalid.` });
  }
  return value;
}

export function canonicalToolVersion(value: unknown): string {
  if (typeof value !== "string" || value !== value.trim() || !VERSION_RE.test(value)) {
    throw new SevenError({ code: "VALIDATION", message: "Tool version must be semantic version text." });
  }
  return value;
}

export function canonicalCapability(value: unknown): string {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    !/^[a-z0-9][a-z0-9._:-]{1,127}$/i.test(value)
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Tool capability is invalid." });
  }
  return value;
}

export function validateToolDefinition<TInput,TOutput>(
  definition: ToolDefinition<TInput,TOutput>,
): ToolDefinition<TInput,TOutput> {
  if (!definition || typeof definition !== "object") {
    throw new SevenError({ code: "VALIDATION", message: "Tool definition must be an object." });
  }
  const id=canonicalToolId(definition.id);
  const version=canonicalToolVersion(definition.version);
  for (const [field,value,max] of [
    ["title",definition.title,120],
    ["description",definition.description,1200],
  ] as const) {
    if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > max) {
      throw new SevenError({ code: "VALIDATION", message: `Tool ${field} is invalid.` });
    }
  }
  if (!(definition.inputSchema instanceof z.ZodType) || !(definition.outputSchema instanceof z.ZodType)) {
    throw new SevenError({ code: "VALIDATION", message: "Tool schemas must be Zod schemas." });
  }
  if (typeof definition.handler !== "function") {
    throw new SevenError({ code: "VALIDATION", message: "Tool handler must be a function." });
  }
  if (
    !Number.isSafeInteger(definition.timeoutMs) ||
    definition.timeoutMs < 50 ||
    definition.timeoutMs > 120_000
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Tool timeout is invalid." });
  }
  if (
    !Number.isSafeInteger(definition.maxResultBytes) ||
    definition.maxResultBytes < 64 ||
    definition.maxResultBytes > 1_000_000
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Tool maxResultBytes is invalid." });
  }
  const capabilities=Object.freeze(
    [...new Set(definition.requiredCapabilities.map(canonicalCapability))],
  );
  const annotations=definition.annotations;
  if (
    !annotations ||
    !["pure","read","write","destructive","external"].includes(annotations.risk) ||
    !["idempotent","replay-guarded","non-idempotent"].includes(annotations.idempotency) ||
    !["never","if-mutating","always"].includes(annotations.approval) ||
    !["public","user-data","secret-adjacent"].includes(annotations.sensitivity) ||
    !["reversible","compensatable","irreversible"].includes(annotations.reversibility)
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Tool annotations are invalid." });
  }
  return Object.freeze({
    ...definition,
    id,
    version,
    requiredCapabilities: capabilities,
    annotations: Object.freeze({ ...annotations }),
    ...(definition.concurrencyGroup
      ? { concurrencyGroup: canonicalCapability(definition.concurrencyGroup) }
      : {}),
  });
}

export function isMutatingTool(definition: ToolDefinition): boolean {
  return definition.annotations.risk === "write" || definition.annotations.risk === "destructive";
}
