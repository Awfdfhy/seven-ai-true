import { describe, expect, it } from "vitest";
import { KiloAnonymousProviderAdapter } from "./kilo-anonymous-adapter";

describe("KiloAnonymousProviderAdapter", () => {
  it("discovers anonymous models without sending credentials", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      return new Response(
        JSON.stringify({
          data: [
            {
              id: "kilo-auto/free",
              name: "Kilo Auto Free",
              context_length: 131072,
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;

    const adapter = new KiloAnonymousProviderAdapter(fakeFetch);
    const models = await adapter.listModels(new AbortController().signal);

    expect(models).toHaveLength(1);
    expect(models[0]).toMatchObject({
      id: "kilo-auto/free",
      providerId: "kilo",
      displayName: "Kilo Auto Free",
      contextWindow: 131072,
    });
    expect(calls[0]?.url).toBe("https://api.kilo.ai/api/gateway/models");
    expect(new Headers(calls[0]?.init?.headers).has("authorization")).toBe(false);
  });

  it("parses SSE chat deltas and keeps the route zero-key", async () => {
    let requestBody: Record<string, unknown> | null = null;
    let requestHeaders = new Headers();
    const fakeFetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestHeaders = new Headers(init?.headers);
      requestBody = JSON.parse(String(init?.body ?? "{}")) as Record<string, unknown>;
      const stream = [
        'data: {"choices":[{"delta":{"content":"Hel"}}]}',
        "",
        'data: {"choices":[{"delta":{"content":"lo"}}]}',
        "",
        "data: [DONE]",
        "",
      ].join("\n");
      return new Response(stream, {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      });
    }) as typeof fetch;

    const adapter = new KiloAnonymousProviderAdapter(fakeFetch);
    const chunks: string[] = [];
    for await (const chunk of adapter.stream(
      {
        modelId: "kilo-auto/free",
        messages: [
          { role: "system", content: "You are Seven." },
          { role: "user", content: "Hello" },
        ],
        maxOutputTokens: 64,
      },
      new AbortController().signal,
    )) {
      chunks.push(chunk.delta);
    }

    expect(chunks.join("")).toBe("Hello");
    expect(requestBody).toMatchObject({
      model: "kilo-auto/free",
      stream: true,
      max_tokens: 64,
    });
    expect(requestHeaders.has("authorization")).toBe(false);
  });
});
