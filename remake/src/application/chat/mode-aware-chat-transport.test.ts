import { describe, expect, it } from "vitest";
import { createRoom } from "../../domain/chat";
import type { ChatTransport } from "./chat-service";
import { ModeAwareChatTransport } from "./mode-aware-chat-transport";

function transport(label: string, calls: string[]): ChatTransport {
  return {
    async *stream() {
      calls.push(label);
      yield label;
    },
  };
}

describe("ModeAwareChatTransport", () => {
  it("dispatches Deep Think independently from routing mode", async () => {
    const calls: string[] = [];
    const selected = new ModeAwareChatTransport(
      transport("routed", calls),
      transport("deep", calls),
    );
    let output = "";
    for await (const chunk of selected.stream({
      room: createRoom({ id: "r", mode: "quick", deepThink: true, now: 1 }),
      signal: new AbortController().signal,
    })) output += chunk;
    expect(output).toBe("deep");
    expect(calls).toEqual(["deep"]);
  });

  it("uses routed transport when Deep Think is disabled", async () => {
    const calls: string[] = [];
    const selected = new ModeAwareChatTransport(
      transport("routed", calls),
      transport("deep", calls),
    );
    let output = "";
    for await (const chunk of selected.stream({
      room: createRoom({ id: "r", mode: "deep", deepThink: false, now: 1 }),
      signal: new AbortController().signal,
    })) output += chunk;
    expect(output).toBe("routed");
    expect(calls).toEqual(["routed"]);
  });
});
