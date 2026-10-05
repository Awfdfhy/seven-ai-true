import { SevenError } from "../../core/errors";
import { isRoom } from "../../domain/chat";
import type { ChatStreamContext, ChatTransport } from "./chat-service";

export type ModeAwareTransportObserver = Readonly<{
  record(input: Readonly<{
    taskId: string | null;
    transport: "routed" | "deep-think";
  }>): void;
}>;

export class ModeAwareChatTransport implements ChatTransport {
  constructor(
    private readonly routed: ChatTransport,
    private readonly deepThink: ChatTransport,
    private readonly observer?: ModeAwareTransportObserver,
  ) {
    for (const [name, value] of [["routed", routed], ["deepThink", deepThink]] as const) {
      if (!value || typeof value !== "object" || typeof value.stream !== "function") {
        throw new SevenError({ code: "VALIDATION", message: `ModeAwareChatTransport ${name} transport is malformed.` });
      }
    }
    if (
      observer !== undefined &&
      (!observer || typeof observer !== "object" || typeof observer.record !== "function")
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Mode-aware transport observer is malformed." });
    }
  }

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    if (!context || typeof context !== "object" || !isRoom(context.room)) {
      throw new SevenError({ code: "VALIDATION", message: "Mode-aware chat context is malformed." });
    }
    if (context.signal.aborted) throw new DOMException("Aborted", "AbortError");
    const useDeepThink = context.room.deepThink === true;
    try {
      this.observer?.record({
        taskId: context.taskId ?? null,
        transport: useDeepThink ? "deep-think" : "routed",
      });
    } catch {
      // Observability cannot alter dispatch.
    }
    const selected = useDeepThink ? this.deepThink : this.routed;
    for await (const chunk of selected.stream(context)) {
      if (context.signal.aborted) throw new DOMException("Aborted", "AbortError");
      yield chunk;
    }
  }
}
