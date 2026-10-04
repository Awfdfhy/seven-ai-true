export type McpProtocolEra = "legacy" | "modern";

export type McpConnectionInfo = Readonly<{
  era: McpProtocolEra;
  protocolVersion: string;
  serverName?: string;
  serverVersion?: string;
}>;

export type McpRemoteTool = Readonly<{
  name: string;
  title?: string;
  description?: string;
  inputSchema: unknown;
  outputSchema?: unknown;
  annotations?: unknown;
}>;

export type McpContentItem = Readonly<{ type: string } & Record<string, unknown>>;

export type McpImmediateToolResult = Readonly<{
  kind: "complete";
  isError: boolean;
  content: readonly McpContentItem[];
  structuredContent?: unknown;
}>;

export type McpInputRequiredToolResult = Readonly<{
  kind: "input_required";
  requestState: string;
  inputRequests: Readonly<Record<string, unknown>>;
}>;

export type McpTaskStatus =
  | "working"
  | "input_required"
  | "completed"
  | "cancelled"
  | "failed";

export type McpTaskState = Readonly<{
  taskId: string;
  status: McpTaskStatus;
  statusMessage?: string;
  createdAt: string;
  lastUpdatedAt: string;
  ttlMs: number | null;
  pollIntervalMs?: number;
  inputRequests?: Readonly<Record<string, unknown>>;
  result?: unknown;
  error?: unknown;
}>;

export type McpTaskToolResult = Readonly<{
  kind: "task";
  task: McpTaskState;
}>;

export type McpToolCallOutcome =
  | McpImmediateToolResult
  | McpTaskToolResult
  | McpInputRequiredToolResult;

export interface McpClientPort {
  connect(signal?: AbortSignal): Promise<McpConnectionInfo>;
  listTools(signal?: AbortSignal): Promise<Readonly<{
    tools: readonly McpRemoteTool[];
    ttlMs?: number;
    cacheScope?: "private" | "public";
  }>>;
  callTool(input: Readonly<{
    name: string;
    arguments: Readonly<Record<string, unknown>>;
    signal: AbortSignal;
  }>): Promise<McpToolCallOutcome>;
  getTask?(taskId: string, signal?: AbortSignal): Promise<McpTaskState>;
  cancelTask?(taskId: string, signal?: AbortSignal): Promise<void>;
  close(): Promise<void>;
}
