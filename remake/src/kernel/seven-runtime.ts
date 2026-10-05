import { SevenError } from "../core/errors";
import { TaskManager } from "../core/task-manager";
import { AppKernel } from "./app-kernel";
import { DiagnosticsBuffer } from "../observability/diagnostics";
import { ShellStore, type ShellSnapshot } from "../ui/shell/shell-store";
import { ThemeService, type ThemeScheduler } from "../ui/system/theme-service";
import { AndroidBridgeClient } from "../platform/android/android-bridge";
import { createCapacitorAndroidNativeTransport } from "../platform/android/capacitor-native-transport";
import { AndroidPlatformService } from "../application/android/android-platform-service";
import { IndexedDbRoomRepository } from "../storage/room-repository";
import { ChatService } from "../application/chat/chat-service";
import { RoutingChatTransport } from "../application/chat/routed-chat-transport";
import { ModeAwareChatTransport } from "../application/chat/mode-aware-chat-transport";
import { DeepThinkTransport } from "../application/deep-think/deep-think-transport";
import { KiloAnonymousProviderAdapter } from "../providers/kilo-anonymous-adapter";
import { ModelRegistry, ModelRouter, ProviderHealthTracker } from "../routing/model-router";
import { IntegratedChatContextSource } from "../application/context/integrated-chat-context-source";
import { classifySevenError } from "../core/error-taxonomy";
import { IndexedDbMemoryFabricRepository } from "../storage/memory-fabric-repository";
import { MemoryFabricService } from "../application/memory/memory-fabric-service";
import { IndexedDbMemoryRepository } from "../storage/memory-repository";
import { MemoryContextService } from "../application/context/memory-context-service";
import { ProviderContextSummarizer } from "../context/provider-context-summarizer";
import { MemoryLegacyMigrationService } from "../application/memory/memory-legacy-migration-service";
import { ProviderMemoryQueryRewriter } from "../application/memory/memory-query-rewriter";
import { MemoryRetrievalEngine } from "../application/memory/memory-retrieval";
import { ToolRegistry } from "../application/tools/registry";
import { registerBuiltinReadTools } from "../application/tools/builtins";
import { InMemoryToolAuthoritySource } from "../application/tools/authority";
import { IndexedDbToolExecutionLedger } from "../storage/tool-execution-ledger";
import { ToolExecutor } from "../application/tools/executor";
import { ToolDiscovery } from "../application/tools/discovery";
import { ProviderToolPlanner } from "../application/tools/planner";
import { DefaultReadToolCapabilityPolicy } from "../application/tools/read-capability-policy";
import { ToolOrchestrator } from "../application/tools/orchestrator";
import { OrchestratedReadToolContextSource } from "../application/tools/chat-tool-context";
import { registerBuiltinMemoryMutationTools } from "../application/tools/mutation-builtins";
import { LocalMemoryMutationProposer } from "../application/tools/memory-mutation-proposer";
import { ToolApprovalCoordinator } from "../application/tools/approval-coordinator";
import { AttachmentService, SingleFlightPdfParserLoader } from "../application/attachments/attachment-service";
import { StoredAttachmentContextSource } from "../application/attachments/attachment-context-source";
import { IndexedDbAttachmentRepository } from "../storage/attachment-repository";

export type SevenRuntime = Readonly<{
  taskManager: TaskManager;
  shell: ShellStore;
  theme: ThemeService;
  diagnostics: DiagnosticsBuffer;
  kernel: AppKernel;
  android: AndroidPlatformService | null;
  rooms: IndexedDbRoomRepository;
  chat: ChatService;
  chatTransport: ModeAwareChatTransport;
  routedChatTransport: RoutingChatTransport;
  deepThinkTransport: DeepThinkTransport;
  modelRegistry: ModelRegistry;
  modelRouter: ModelRouter;
  providerHealth: ProviderHealthTracker;
  memory: MemoryFabricService;
  attachments: AttachmentService;
  toolRegistry: ToolRegistry;
  toolOrchestrator: ToolOrchestrator;
  toolApprovalCoordinator: ToolApprovalCoordinator;
}>;

export type SevenRuntimeOptions = Readonly<{
  initialShell?: Partial<ShellSnapshot>;
  diagnosticsCapacity?: number;
  diagnosticsNow?: () => number;
  themeNow?: () => Date;
  themeScheduler?: ThemeScheduler;
}>;

export function createSevenRuntime(options: SevenRuntimeOptions = {}): SevenRuntime {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Seven runtime options must be an object.",
    });
  }

  const taskManager = new TaskManager();
  const diagnostics = new DiagnosticsBuffer(
    options.diagnosticsCapacity ?? 256,
    options.diagnosticsNow ?? Date.now,
  );
  taskManager.subscribe((task) => {
    const disposition = task.error ? classifySevenError(task.error) : null;
    diagnostics.record({
      level: task.status === "failed" ? "warn" : "info",
      category: "task",
      name: "lifecycle",
      correlationId: task.taskId,
      attributes: {
        kind: task.kind,
        status: task.status,
        errorCategory: disposition?.category ?? null,
        retryable: disposition?.retryable ?? false,
        durationMs: task.finishedAt === undefined
          ? null
          : Math.max(0, task.finishedAt - task.startedAt),
      },
    });
  });
  const shell = new ShellStore(options.initialShell ?? {});

  const themeNow = options.themeNow ?? (() => new Date());
  const theme = options.themeScheduler === undefined
    ? new ThemeService(shell, themeNow)
    : new ThemeService(shell, themeNow, options.themeScheduler);

  const nativeTransport = createCapacitorAndroidNativeTransport();
  const android = nativeTransport
    ? new AndroidPlatformService(taskManager, new AndroidBridgeClient(nativeTransport))
    : null;

  const rooms = new IndexedDbRoomRepository();
  const kilo = new KiloAnonymousProviderAdapter();
  const modelRegistry = new ModelRegistry();
  modelRegistry.replaceProviderModels("kilo", [Object.freeze({
    id: "kilo-auto/free",
    providerId: "kilo",
    displayName: "Kilo Auto Free",
    contextWindow: 131_072,
    qualityScore: 50,
    speedScore: 50,
    capabilities: Object.freeze({ streaming: true, tools: true, vision: false }),
  })]);
  const modelRouter = new ModelRouter();
  const providerHealth = new ProviderHealthTracker();
  const attachmentRepository = new IndexedDbAttachmentRepository();
  const attachments = new AttachmentService(
    taskManager,
    attachmentRepository,
    new SingleFlightPdfParserLoader(async () => {
      throw new SevenError({
        code: "VALIDATION",
        message: "PDF extraction is not enabled in this build. Use a UTF-8 text file.",
        details: { domain: "file", reason: "PDF_PARSER_UNAVAILABLE" },
      });
    }),
  );
  const attachmentContextSource = new StoredAttachmentContextSource(attachmentRepository);
  const memoryRepository = new IndexedDbMemoryFabricRepository();
  const queryRewriter = new ProviderMemoryQueryRewriter(kilo, "kilo-auto/free");
  const memory = new MemoryFabricService(memoryRepository, new MemoryRetrievalEngine(), queryRewriter);
  const legacyMemoryRepository = new IndexedDbMemoryRepository({
    databaseName: "seven-remake-memory",
    maxRecords: 10_000,
    maxSummaries: 10_000,
  });
  const legacyMigration = new MemoryLegacyMigrationService(
    legacyMemoryRepository,
    memoryRepository,
  );
  const chat = new ChatService(taskManager, rooms, memory);

  const toolRegistry = new ToolRegistry();
  registerBuiltinReadTools(toolRegistry, { memory, rooms });
  registerBuiltinMemoryMutationTools(toolRegistry, memory);
  const toolAuthority = new InMemoryToolAuthoritySource();
  toolAuthority.setGrant({
    grantId: "seven-local-read-tools",
    capabilities: Object.freeze(["memory.read", "rooms.read"]),
    scope: Object.freeze({}),
    issuedAt: 0,
    expiresAt: Number.MAX_SAFE_INTEGER,
    source: "system",
  });
  toolAuthority.setGrant({
    grantId: "seven-local-memory-mutations",
    capabilities: Object.freeze(["memory.write", "memory.delete"]),
    toolIds: Object.freeze(["memory.set_tier", "memory.forget"]),
    scope: Object.freeze({}),
    issuedAt: 0,
    expiresAt: Number.MAX_SAFE_INTEGER,
    source: "system",
  });
  const toolLedger = new IndexedDbToolExecutionLedger();
  const toolExecutor = new ToolExecutor(
    toolRegistry,
    taskManager,
    toolAuthority,
    undefined,
    {
      record(event) {
        diagnostics.record({
          level: event.status === "failed" || event.status === "effect_unknown" ? "warn" : "info",
          category: "tools",
          name: "tool_execution",
          attributes: {
            toolId: event.toolId,
            status: event.status,
            effectStarted: event.effectStarted,
          },
        });
      },
    },
    256,
    toolLedger,
  );
  const toolDiscovery = new ToolDiscovery(toolRegistry);
  const toolPlanner = new ProviderToolPlanner(kilo, "kilo-auto/free");
  const toolOrchestrator = new ToolOrchestrator(
    toolDiscovery,
    toolPlanner,
    toolExecutor,
    new DefaultReadToolCapabilityPolicy(),
  );
  const toolContextSource = new OrchestratedReadToolContextSource(
    toolOrchestrator,
    toolRegistry,
  );
  const toolApprovalCoordinator = new ToolApprovalCoordinator(
    new LocalMemoryMutationProposer(memory, toolRegistry),
    toolRegistry,
    toolExecutor,
    toolAuthority,
  );

  const summaryRepository = new IndexedDbMemoryRepository({
    databaseName: "seven-remake-context-summary-v2",
    maxRecords: 1,
    maxSummaries: 10_000,
  });
  const summarizer = new ProviderContextSummarizer(kilo, "kilo-auto/free", {
    contextWindowTokens: 32_768,
    maxChunks: 16,
  });
  const contextSource = new MemoryContextService(summaryRepository, summarizer, undefined, {
    maxSummaryPasses: 8,
  });
  const integratedContextSource = new IntegratedChatContextSource(
    contextSource,
    memory,
    toolContextSource,
    attachmentContextSource,
  );
  const routedChatTransport = new RoutingChatTransport(
    modelRegistry,
    modelRouter,
    providerHealth,
    new Map([["kilo", kilo]]),
    {
      mode: (room) => room.mode ?? "balanced",
      maxAttempts: 3,
      systemPrompt: "You are Seven, a precise and helpful AI assistant.",
      contextSource: integratedContextSource,
      observer: {
        record(event) {
          diagnostics.record({
            level: event.type === "attempt_failure" ? "warn" : "info",
            category: "model",
            name: event.type,
            correlationId: event.taskId,
            attributes: {
              mode: event.mode,
              providerId: event.providerId ?? null,
              modelId: event.modelId ?? null,
              reason: event.reason ?? null,
              candidateCount: event.candidateCount ?? null,
              durationMs: event.durationMs ?? null,
              ttftMs: event.ttftMs ?? null,
            },
          });
        },
      },
    },
  );
  const deepThinkTransport = new DeepThinkTransport(
    { provider: kilo, modelId: "kilo-auto/free", contextWindow: 131_072 },
    { provider: kilo, modelId: "kilo-auto/free", contextWindow: 131_072 },
    integratedContextSource,
    {
      systemPrompt: "You are Seven, a precise and helpful AI assistant.",
      plannerOutputTokens: 768,
      finalOutputTokens: 2048,
    },
  );
  const chatTransport = new ModeAwareChatTransport(
    routedChatTransport,
    deepThinkTransport,
    {
      record(event) {
        diagnostics.record({
          level: "info",
          category: "model",
          name: "transport_selected",
          correlationId: event.taskId,
          attributes: { transport: event.transport },
        });
      },
    },
  );

  const kernel = new AppKernel(diagnostics);
  kernel.register({
    id: "memory-legacy-migration",
    async start(signal) {
      try {
        const result = await legacyMigration.migrate(signal);
        diagnostics.record({
          level: "info",
          category: "memory",
          name: "legacy_migration_complete",
          attributes: {
            scanned: result.scanned,
            migrated: result.migrated,
            skippedExisting: result.skippedExisting,
          },
        });
      } catch (error) {
        if (signal.aborted) throw error;
        diagnostics.record({
          level: "warn",
          category: "memory",
          name: "legacy_migration_failed",
          attributes: {
            errorType: error instanceof Error ? error.name : "unknown",
          },
        });
        // Legacy migration is recovery work, not a startup dependency.
        // Existing v1 data remains untouched and Seven may continue normally.
      }
    },
    async stop() {
      await legacyMemoryRepository.close();
    },
  });

  kernel.register({
    id: "tool-ledger",
    async start() {},
    async stop() {
      await toolLedger.close();
    },
  });

  kernel.register({
    id: "runtime-storage",
    async start() {},
    async stop() {
      await Promise.allSettled([
        rooms.close(),
        attachmentRepository.close(),
        memoryRepository.close(),
        summaryRepository.close(),
      ]);
    },
  });

  kernel.register({
    id: "theme",
    async start() {
      theme.start();
    },
    async stop() {
      theme.stop();
    },
  });

  return Object.freeze({
    taskManager,
    shell,
    theme,
    diagnostics,
    kernel,
    android,
    rooms,
    chat,
    chatTransport,
    routedChatTransport,
    deepThinkTransport,
    modelRegistry,
    modelRouter,
    providerHealth,
    memory,
    attachments,
    toolRegistry,
    toolOrchestrator,
    toolApprovalCoordinator,
  });
}
