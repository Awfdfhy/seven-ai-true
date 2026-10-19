import { SevenError } from "../core/errors";
import {
  type ModelDescriptor,
  type ProviderAdapter,
  type ProviderChunk,
  type ProviderStreamRequest,
  assertValidProviderMessages,
} from "./contracts";

const MODELS_URL = "https://api.kilo.ai/api/gateway/models";
const CHAT_URL = "https://api.kilo.ai/api/gateway/chat/completions";

type FetchLike = typeof fetch;

function retryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function normalizeModel(raw: unknown): ModelDescriptor | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === "string" ? item.id.trim() : "";
  if (!id) return null;
  const name =
    typeof item.name === "string" && item.name.trim()
      ? item.name.trim()
      : id;
  const contextWindow =
    typeof item.context_length === "number" && Number.isSafeInteger(item.context_length) && item.context_length > 0
      ? item.context_length
      : 131_072;
  return Object.freeze({
    id,
    providerId: "kilo",
    displayName: name,
    contextWindow,
    qualityScore: 0,
    speedScore: 0,
    capabilities: Object.freeze({
      streaming: true,
      tools: true,
      vision: false,
    }),
  });
}

export class KiloAnonymousProviderAdapter implements ProviderAdapter {
  readonly id = "kilo";

  constructor(private readonly fetchImpl: FetchLike = fetch) {}

  async listModels(signal: AbortSignal): Promise<readonly ModelDescriptor[]> {
    const response = await this.fetchImpl(MODELS_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) {
      throw new SevenError({
        code: "PROVIDER",
        message: `Kilo model discovery failed with HTTP ${response.status}.`,
        retryable: retryableStatus(response.status),
      });
    }
    const payload = await response.json() as { data?: unknown[] };
    const models = Array.isArray(payload.data)
      ? payload.data.map(normalizeModel).filter((model): model is ModelDescriptor => model !== null)
      : [];
    return Object.freeze(models);
  }

  async *stream(
    request: ProviderStreamRequest,
    signal: AbortSignal,
  ): AsyncIterable<ProviderChunk> {
    assertValidProviderMessages(request.messages);
    if (typeof request.modelId !== "string" || !request.modelId.trim()) {
      throw new SevenError({ code: "VALIDATION", message: "Kilo modelId must not be empty." });
    }

    const response = await this.fetchImpl(CHAT_URL, {
      method: "POST",
      headers: {
        Accept: "text/event-stream, application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.modelId,
        messages: request.messages,
        stream: true,
        ...(request.maxOutputTokens ? { max_tokens: request.maxOutputTokens } : {}),
      }),
      signal,
    });

    if (!response.ok) {
      let detail = "";
      try { detail = (await response.text()).slice(0, 500); } catch { /* ignore */ }
      throw new SevenError({
        code: "PROVIDER",
        message: `Kilo chat failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}.`,
        retryable: retryableStatus(response.status),
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/event-stream")) {
      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
      };
      const message = payload.choices?.[0]?.message;
      const text = message?.content ?? message?.reasoning_content ?? "";
      if (text) yield Object.freeze({ delta: text });
      return;
    }

    if (!response.body) {
      throw new SevenError({ code: "PROVIDER", message: "Kilo stream response had no body.", retryable: true });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() ?? "";
        for (const frame of frames) {
          for (const line of frame.split(/\r?\n/)) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            let payload: unknown;
            try { payload = JSON.parse(data); } catch { continue; }
            if (!payload || typeof payload !== "object") continue;
            const choices = (payload as { choices?: unknown[] }).choices;
            if (!Array.isArray(choices)) continue;
            for (const choice of choices) {
              if (!choice || typeof choice !== "object") continue;
              const delta = (choice as { delta?: { content?: unknown; reasoning_content?: unknown } }).delta;
              const text =
                typeof delta?.content === "string"
                  ? delta.content
                  : typeof delta?.reasoning_content === "string"
                    ? delta.reasoning_content
                    : "";
              if (text) yield Object.freeze({ delta: text });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
