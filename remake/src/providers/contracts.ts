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
