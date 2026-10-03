import { SevenError } from "../core/errors";
import { TaskManager } from "../core/task-manager";
import { AppKernel } from "./app-kernel";
import { DiagnosticsBuffer } from "../observability/diagnostics";
import { ShellStore, type ShellSnapshot } from "../ui/shell/shell-store";
import { ThemeService, type ThemeScheduler } from "../ui/system/theme-service";
import { AndroidBridgeClient } from "../platform/android/android-bridge";
import { createCapacitorAndroidNativeTransport } from "../platform/android/capacitor-native-transport";
import { AndroidPlatformService } from "../application/android/android-platform-service";

export type SevenRuntime = Readonly<{
  taskManager: TaskManager;
  shell: ShellStore;
  theme: ThemeService;
  diagnostics: DiagnosticsBuffer;
  kernel: AppKernel;
  android: AndroidPlatformService | null;
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
  });
}
