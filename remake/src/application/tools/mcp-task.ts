import { SevenError } from "../../core/errors";
import type { McpClientPort, McpTaskState } from "./mcp-port";

function parseTime(value: string, field: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    throw new SevenError({ code: "TOOL", message: `MCP task ${field} timestamp is invalid.` });
  }
  return time;
}

function sleepDefault(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

export class McpTaskPoller {
  constructor(
    private readonly now: () => number = Date.now,
    private readonly sleep: (ms: number, signal: AbortSignal) => Promise<void> = sleepDefault,
    private readonly maxPolls = 128,
  ) {
    if (!Number.isSafeInteger(maxPolls) || maxPolls < 1 || maxPolls > 1024) {
      throw new SevenError({ code: "VALIDATION", message: "MCP task poll limit is invalid." });
    }
  }

  async settle(
    port: McpClientPort,
    initial: McpTaskState,
    signal: AbortSignal,
  ): Promise<McpTaskState> {
    if (!port.getTask) {
      throw new SevenError({ code: "TOOL", message: "MCP server returned a task but the client port cannot poll tasks." });
    }
    let state = initial;
    for (let poll = 0; poll <= this.maxPolls; poll += 1) {
      if (signal.aborted) {
        if (port.cancelTask) {
          try { await port.cancelTask(state.taskId); } catch {}
        }
        throw new DOMException("Aborted", "AbortError");
      }

      if (state.status !== "working") return state;

      const createdAt = parseTime(state.createdAt, "createdAt");
      if (state.ttlMs !== null) {
        if (!Number.isSafeInteger(state.ttlMs) || state.ttlMs < 0) {
          throw new SevenError({ code: "TOOL", message: "MCP task TTL is invalid." });
        }
        if (this.now() > createdAt + state.ttlMs) {
          throw new SevenError({ code: "TOOL", message: "MCP task TTL expired before completion." });
        }
      }

      if (poll === this.maxPolls) {
        throw new SevenError({ code: "DEADLINE_EXCEEDED", message: "MCP task exceeded Seven's polling limit.", retryable: true });
      }

      const requested = state.pollIntervalMs ?? 1000;
      const interval = Math.max(100, Math.min(10_000, Number.isFinite(requested) ? requested : 1000));
      await this.sleep(interval, signal);
      state = await port.getTask(state.taskId, signal);
    }
    throw new SevenError({ code: "DEADLINE_EXCEEDED", message: "MCP task polling ended unexpectedly.", retryable: true });
  }
}
