import { z } from "zod";
import { SevenError } from "../../core/errors";
import type {
  ToolAnnotations,
  ToolRisk,
} from "./contracts";
import { compileMcpInputSchema } from "./mcp-schema";
import type {
  McpClientPort,
  McpConnectionInfo,
  McpImmediateToolResult,
  McpRemoteTool,
  McpTaskState,
  McpToolCallOutcome,
} from "./mcp-port";
import { McpTaskPoller } from "./mcp-task";
import { ToolRegistry } from "./registry";

export type McpTrustClass = "untrusted" | "trusted-local" | "trusted-remote";

export type McpToolPolicyRule = Readonly<{
  localId?: string;
  title: string;
  description: string;
  capability: string;
  annotations: ToolAnnotations;
  timeoutMs?: number;
  maxResultBytes?: number;
}>;

export type McpServerPolicy = Readonly<{
  serverId: string;
  trust: McpTrustClass;
  allowLegacy: boolean;
  allowedProtocolVersions?: readonly string[];
  tools: Readonly<Record<string, McpToolPolicyRule>>;
}>;

export type McpImportReport = Readonly<{
  connection: McpConnectionInfo;
  imported: readonly string[];
  skipped: readonly Readonly<{ remoteName: string; reason: string }>[];
  catalogCache: Readonly<{
    scope: "private" | "public";
    ttlMs: number;
    fromCache: boolean;
  }>;
}>;

const outputSchema = z.object({
  items: z.array(z.string().max(4_000)).max(32),
  truncated: z.boolean(),
}).strict();

function slug(value: string, field: string): string {
  const out = value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  if (!out || out.length < 2) {
    throw new SevenError({ code: "VALIDATION", message: `${field} cannot form a stable MCP identifier.` });
  }
  return out;
}

function boundedLocalText(value: string, field: string, max: number): string {
  const clean = value.replace(/[\s\u00A0]+/g, " ").trim();
  if (!clean || clean.length > max) {
    throw new SevenError({ code: "VALIDATION", message: `${field} is invalid.` });
  }
  return clean;
}

function effectful(risk: ToolRisk): boolean {
  return risk === "write" || risk === "destructive" || risk === "external";
}

function isImmediate(value: unknown): value is McpImmediateToolResult {
  return !!value && typeof value === "object" && (value as { kind?: unknown }).kind === "complete";
}

function contentType(item: unknown): string {
  if (!item || typeof item !== "object") return "unknown";
  const type = (item as { type?: unknown }).type;
  return typeof type === "string" ? type : "unknown";
}

function normalizeImmediate(result: McpImmediateToolResult): Readonly<{ items: readonly string[]; truncated: boolean }> {
  if (result.isError) {
    throw new SevenError({ code: "TOOL", message: "Remote MCP tool returned an application error." });
  }
  const items: string[] = [];
  let truncated = false;
  let budget = 12_000;
  for (const item of result.content.slice(0, 32)) {
    const type = contentType(item);
    const textValue = (item as Record<string, unknown>).text;
    let text: string;
    if (type === "text" && typeof textValue === "string") {
      text = textValue;
    } else {
      text = `[MCP ${type} content omitted by Seven v1]`;
    }
    if (text.length > 4_000) {
      text = `${text.slice(0, 3_999)}…`;
      truncated = true;
    }
    if (text.length > budget) {
      if (budget > 1) items.push(`${text.slice(0, budget - 1)}…`);
      truncated = true;
      budget = 0;
      break;
    }
    items.push(text);
    budget -= text.length;
  }
  if (result.content.length > 32) truncated = true;
  return Object.freeze({ items: Object.freeze(items), truncated });
}

function taskResultAsImmediate(state: McpTaskState): McpImmediateToolResult {
  if (state.status !== "completed") {
    throw new SevenError({ code: "TOOL", message: "MCP task is not completed." });
  }
  const result = state.result;
  if (!result || typeof result !== "object") {
    throw new SevenError({ code: "TOOL", message: "Completed MCP task has no tool result." });
  }
  const candidate = result as {
    isError?: unknown;
    content?: unknown;
  };
  if (!Array.isArray(candidate.content)) {
    throw new SevenError({ code: "TOOL", message: "Completed MCP task result content is invalid." });
  }
  return Object.freeze({
    kind: "complete" as const,
    isError: candidate.isError === true,
    content: Object.freeze(candidate.content as readonly any[]),
  });
}

type CachedCatalog = Readonly<{
  tools: readonly McpRemoteTool[];
  scope: "private" | "public";
  expiresAt: number;
}>;

export class McpToolImporter {
  private catalogCache: CachedCatalog | null = null;

  constructor(
    private readonly registry: ToolRegistry,
    private readonly port: McpClientPort,
    private readonly taskPoller = new McpTaskPoller(),
    private readonly now: () => number = Date.now,
    private readonly maxCatalogTtlMs = 60_000,
  ) {
    if (!Number.isSafeInteger(maxCatalogTtlMs) || maxCatalogTtlMs < 0 || maxCatalogTtlMs > 10 * 60_000) {
      throw new SevenError({ code: "VALIDATION", message: "MCP catalog TTL cap is invalid." });
    }
  }

  invalidateCatalog(): void {
    this.catalogCache = null;
  }

  async connectAndImport(
    policy: McpServerPolicy,
    signal?: AbortSignal,
  ): Promise<McpImportReport> {
    if (!policy || typeof policy !== "object") {
      throw new SevenError({ code: "VALIDATION", message: "MCP server policy is invalid." });
    }
    const serverSlug = slug(policy.serverId, "MCP serverId");
    const connection = await this.port.connect(signal);

    if (connection.era === "legacy" && !policy.allowLegacy) {
      throw new SevenError({ code: "PERMISSION", message: "Legacy MCP protocol is not allowed by local policy." });
    }
    const allowedVersions = policy.allowedProtocolVersions ?? ["2026-07-28"];
    if (connection.era === "modern" && !allowedVersions.includes(connection.protocolVersion)) {
      throw new SevenError({ code: "PERMISSION", message: "MCP protocol version is not allowed by local policy." });
    }

    const catalogResult = await this.loadCatalog(signal);
    const catalog = catalogResult.catalog;
    if (catalog.tools.length > 256) {
      throw new SevenError({ code: "TOOL", message: "MCP server advertised too many tools." });
    }

    const imported: string[] = [];
    const skipped: Array<{ remoteName: string; reason: string }> = [];

    for (const remote of catalog.tools) {
      const rule = policy.tools[remote.name];
      if (!rule) {
        skipped.push({ remoteName: remote.name, reason: "not-allowlisted" });
        continue;
      }
      try {
        if (policy.trust === "untrusted" && effectful(rule.annotations.risk)) {
          skipped.push({ remoteName: remote.name, reason: "untrusted-server-effectful-tool" });
          continue;
        }
        if (effectful(rule.annotations.risk) && rule.annotations.approval !== "always") {
          skipped.push({ remoteName: remote.name, reason: "effectful-mcp-tool-requires-always-approval" });
          continue;
        }

        const inputSchema = compileMcpInputSchema(remote.inputSchema);
        const localId = rule.localId ?? `mcp.${serverSlug}.${slug(remote.name, "MCP tool name")}`;
        const title = boundedLocalText(rule.title, "MCP local title", 120);
        const description = boundedLocalText(rule.description, "MCP local description", 1_200);
        const timeoutMs = rule.timeoutMs ?? 30_000;
        const maxResultBytes = rule.maxResultBytes ?? 24_000;

        this.registry.register({
          id: localId,
          version: "1.0.0",
          title,
          description,
          inputSchema,
          outputSchema,
          requiredCapabilities: [rule.capability],
          annotations: rule.annotations,
          timeoutMs,
          maxResultBytes,
          concurrencyGroup: `mcp.${serverSlug}`,
          handler: async (ctx, input) => {
            if (effectful(rule.annotations.risk)) {
              await ctx.markEffectStarted();
            }
            const outcome = await this.port.callTool({
              name: remote.name,
              arguments: input,
              signal: ctx.signal,
            });
            return this.resolveOutcome(outcome, ctx.signal);
          },
        });
        imported.push(localId);
      } catch (error) {
        skipped.push({
          remoteName: remote.name,
          reason: error instanceof Error ? error.message.slice(0, 240) : "import-failed",
        });
      }
    }

    return Object.freeze({
      connection,
      imported: Object.freeze(imported),
      skipped: Object.freeze(skipped.map(item => Object.freeze(item))),
      catalogCache: Object.freeze({
        scope: catalogResult.scope,
        ttlMs: catalogResult.ttlMs,
        fromCache: catalogResult.fromCache,
      }),
    });
  }

  private async loadCatalog(signal?: AbortSignal): Promise<Readonly<{
    catalog: Readonly<{ tools: readonly McpRemoteTool[] }>;
    scope: "private" | "public";
    ttlMs: number;
    fromCache: boolean;
  }>> {
    const now = this.now();
    if (this.catalogCache && this.catalogCache.expiresAt > now) {
      return Object.freeze({
        catalog: Object.freeze({ tools: this.catalogCache.tools }),
        scope: this.catalogCache.scope,
        ttlMs: Math.max(0, this.catalogCache.expiresAt - now),
        fromCache: true,
      });
    }

    const raw = await this.port.listTools(signal);
    const rawTtl = raw.ttlMs;
    const ttlMs = Number.isSafeInteger(rawTtl) && (rawTtl ?? 0) > 0
      ? Math.min(rawTtl as number, this.maxCatalogTtlMs)
      : 0;
    const scope = raw.cacheScope === "public" ? "public" : "private";
    const tools = Object.freeze([...raw.tools]);

    if (ttlMs > 0) {
      this.catalogCache = Object.freeze({
        tools,
        scope,
        expiresAt: now + ttlMs,
      });
    } else {
      this.catalogCache = null;
    }

    return Object.freeze({
      catalog: Object.freeze({ tools }),
      scope,
      ttlMs,
      fromCache: false,
    });
  }

  private async resolveOutcome(
    outcome: McpToolCallOutcome,
    signal: AbortSignal,
  ): Promise<Readonly<{ items: readonly string[]; truncated: boolean }>> {
    if (isImmediate(outcome)) return normalizeImmediate(outcome);

    if (outcome.kind === "input_required") {
      // requestState is opaque attacker-controlled round-trip state in MCP 2026.
      // Seven v1 does not auto-fulfil remote elicitation/sampling, so fail closed
      // without logging, parsing, modifying, or echoing requestState.
      if (
        typeof outcome.requestState !== "string" ||
        !outcome.requestState ||
        outcome.requestState.length > 16_384 ||
        !outcome.inputRequests ||
        typeof outcome.inputRequests !== "object" ||
        Array.isArray(outcome.inputRequests)
      ) {
        throw new SevenError({ code: "TOOL", message: "Remote MCP input-required result is malformed." });
      }
      throw new SevenError({
        code: "PERMISSION",
        message: "Remote MCP tool requested interactive input that Seven has not explicitly authorized.",
      });
    }

    const state = await this.taskPoller.settle(this.port, outcome.task, signal);
    switch (state.status) {
      case "completed":
        return normalizeImmediate(taskResultAsImmediate(state));
      case "cancelled":
        throw new SevenError({ code: "CANCELLED", message: "Remote MCP task was cancelled." });
      case "failed":
        throw new SevenError({ code: "TOOL", message: "Remote MCP task failed at the protocol layer." });
      case "input_required":
        throw new SevenError({
          code: "TOOL",
          message: "Remote MCP task requires interactive input that Seven v1 has not approved.",
        });
      case "working":
        throw new SevenError({ code: "TOOL", message: "Remote MCP task remained non-terminal unexpectedly." });
    }
  }
}
