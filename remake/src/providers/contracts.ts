import { SevenError } from "../core/errors";

export type ProviderMessageRole = "system" | "user" | "assistant";

export type ProviderMessage = Readonly<{
  role: ProviderMessageRole;
  content: string;
}>;

export type ModelCapabilities = Readonly<{
  streaming: boolean;
  tools: boolean;
  vision: boolean;
}>;

export type ModelDescriptor = Readonly<{
  id: string;
  providerId: string;
  displayName: string;
  contextWindow: number;
  qualityScore: number;
  speedScore: number;
  capabilities: ModelCapabilities;
}>;

export type ProviderStreamRequest = Readonly<{
  modelId: string;
  messages: readonly ProviderMessage[];
  maxOutputTokens?: number;
}>;

export type ProviderChunk = Readonly<{
  delta: string;
}>;

export interface ProviderAdapter {
  readonly id: string;
  listModels(signal: AbortSignal): Promise<readonly ModelDescriptor[]>;
  stream(
    request: ProviderStreamRequest,
    signal: AbortSignal,
  ): AsyncIterable<ProviderChunk>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function modelKey(
  model: Pick<ModelDescriptor, "providerId" | "id">,
): string {
  if (
    !isRecord(model) ||
    typeof model.providerId !== "string" ||
    !model.providerId.trim() ||
    model.providerId !== model.providerId.trim() ||
    typeof model.id !== "string" ||
    !model.id.trim() ||
    model.id !== model.id.trim()
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model key requires non-empty providerId and id.",
    });
  }
  return `${encodeURIComponent(model.providerId)}::${encodeURIComponent(model.id)}`;
}

export function assertValidModelDescriptor(
  model: ModelDescriptor,
): void {
  if (!isRecord(model)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model descriptor must be an object.",
    });
  }

  const identityFields = [
    ["id", model.id],
    ["providerId", model.providerId],
  ] as const;

  for (const [field, value] of identityFields) {
    if (
      typeof value !== "string" ||
      !value.trim() ||
      value !== value.trim()
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Model ${field} must be a canonical non-empty string.`,
      });
    }
  }

  if (
    typeof model.displayName !== "string" ||
    !model.displayName.trim()
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model displayName must not be empty.",
    });
  }

  if (!Number.isSafeInteger(model.contextWindow) || model.contextWindow <= 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model contextWindow must be a positive safe integer.",
    });
  }

  for (const [field, value] of [
    ["qualityScore", model.qualityScore],
    ["speedScore", model.speedScore],
  ] as const) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Model ${field} must be a non-negative finite number.`,
      });
    }
  }

  if (!isRecord(model.capabilities)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model capabilities must be an object.",
    });
  }
  if (
    typeof model.capabilities.streaming !== "boolean" ||
    typeof model.capabilities.tools !== "boolean" ||
    typeof model.capabilities.vision !== "boolean"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model capabilities must be booleans.",
    });
  }
}

export function assertValidProviderMessages(
  messages: readonly ProviderMessage[],
): void {
  if (!Array.isArray(messages)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider messages must be an array.",
    });
  }
  if (messages.length === 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider payload must begin with exactly one system message.",
    });
  }

  let systemCount = 0;
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index] as unknown;
    if (!isRecord(message)) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Provider message ${index} must be an object.`,
      });
    }

    const role = message.role;
    const content = message.content;
    if (role !== "system" && role !== "user" && role !== "assistant") {
      throw new SevenError({
        code: "VALIDATION",
        message: `Provider message ${index} has an invalid role.`,
      });
    }
    if (typeof content !== "string" || !content.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Provider message ${index} is empty.`,
      });
    }

    if (role === "system") {
      systemCount += 1;
      if (index !== 0) {
        throw new SevenError({
          code: "VALIDATION",
          message: "System messages are only allowed at index 0.",
        });
      }
    } else if (index === 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider payload must begin with a system message.",
      });
    }
  }

  if (systemCount !== 1) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider payload must contain exactly one system message.",
    });
  }
}
