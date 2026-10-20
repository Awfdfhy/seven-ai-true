import { describe, expect, it } from "vitest";
import { KiloAnonymousProviderAdapter } from "./kilo-anonymous-adapter";
import { SevenError } from "../core/errors";

describe("KiloAnonymousProviderAdapter network resilience", () => {
  it("retries retryable HTTP statuses and normalizes final failure", async () => {
    let calls = 0;
    const fakeFetch = (async () => {
      calls += 1;
      return new Response("boom", { status: 503 });
    }) as typeof fetch;

    const adapter = new KiloAnonymousProviderAdapter(fakeFetch, 1, 0);
    await expect(adapter.listModels(new AbortController().signal)).rejects.toBeInstanceOf(SevenError);
    expect(calls).toBe(2);
  });

  it("normalizes fetch throws into NETWORK SevenError", async () => {
    const fakeFetch = (async () => {
      throw new Error("socket hang up");
    }) as typeof fetch;

    const adapter = new KiloAnonymousProviderAdapter(fakeFetch, 0, 0);
    try {
      await adapter.listModels(new AbortController().signal);
      throw new Error("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SevenError);
      expect((error as SevenError).code).toBe("NETWORK");
      expect((error as SevenError).retryable).toBe(true);
    }
  });

  it("normalizes AbortError into CANCELLED", async () => {
    const fakeFetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
      throw new DOMException("Aborted", "AbortError");
    }) as typeof fetch;

    const ac = new AbortController();
    ac.abort();
    const adapter = new KiloAnonymousProviderAdapter(fakeFetch, 0, 0);
    try {
      await adapter.listModels(ac.signal);
      throw new Error("expected throw");
    } catch (error) {
      expect(error).toBeInstanceOf(SevenError);
      expect((error as SevenError).code).toBe("CANCELLED");
    }
  });
});
