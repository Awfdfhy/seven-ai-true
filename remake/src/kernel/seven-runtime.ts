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
import { ProviderChatTransport } from "../application/chat/provider-chat-transport";
import { KiloAnonymousProviderAdapter } from "../providers/kilo-anonymous-adapter";
import { IndexedDbMemoryFabricRepository } from "../storage/memory-fabric-repository";
import { MemoryFabricService } from "../application/memory/memory-fabric-service";
import { IndexedDbMemoryRepository } from "../storage/memory-repository";
import { MemoryContextService } from "../application/context/memory-context-service";
import { ProviderContextSummarizer } from "../context/provider-context-summarizer";

export type SevenRuntime = Readonly<{
  taskManager: TaskManager;
  shell: ShellStore;
  theme: ThemeService;
  diagnostics: DiagnosticsBuffer;
  kernel: AppKernel;
  android: AndroidPlatformService | null;
  rooms: IndexedDbRoomRepository;
  chat: ChatService;
  chatTransport: ProviderChatTransport;
  memory: MemoryFabricService;
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
  const memoryRepository = new IndexedDbMemoryFabricRepository();
  const memory = new MemoryFabricService(memoryRepository);
  const chat = new ChatService(taskManager, rooms, memory);
  const kilo = new KiloAnonymousProviderAdapter();
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
  const chatTransport = new ProviderChatTransport(
    kilo,
    "kilo-auto/free",
    "You are Seven, a precise and helpful AI assistant.",
    memory,
    contextSource,
    32_768,
  );

  const kernel = new AppKernel(diagnostics);
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
    memory,
  });
}
