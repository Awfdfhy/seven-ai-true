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

export function modelKey(model: Pick<ModelDescriptor, "providerId" | "id">): string {
  return `${model.providerId}::${model.id}`;
}

export function assertValidModelDescriptor(model: ModelDescriptor): void {
  const textFields = [
    ["id", model.id],
    ["providerId", model.providerId],
    ["displayName", model.displayName],
  ] as const;

  for (const [field, value] of textFields) {
    if (!value.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Model ${field} must not be empty.`,
      });
    }
  }

  if (!Number.isSafeInteger(model.contextWindow) || model.contextWindow <= 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Model contextWindow must be a positive integer.",
    });
  }

  for (const [field, value] of [
    ["qualityScore", model.qualityScore],
    ["speedScore", model.speedScore],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Model ${field} must be a non-negative finite number.`,
      });
    }
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
  if (messages.length === 0 || messages[0]?.role !== "system") {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider payload must begin with exactly one system message.",
    });
  }

  let systemCount = 0;
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];
    if (!message) continue;
    if (
      message.role !== "system" &&
      message.role !== "user" &&
      message.role !== "assistant"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Provider message ${index} has an invalid role.`,
      });
    }
    if (!message.content.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Provider message ${index} is empty.`,
      });
    }
    if (message.role === "system") {
      systemCount += 1;
      if (index !== 0) {
        throw new SevenError({
          code: "VALIDATION",
          message: "System messages are only allowed at index 0.",
        });
      }
    }
  }

  if (systemCount !== 1) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider payload must contain exactly one system message.",
    });
  }
}
