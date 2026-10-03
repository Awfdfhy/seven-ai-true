import { SevenError } from "../../core/errors";
import { TaskManager, type TaskRun } from "../../core/task-manager";
import {
  createAndroidCapabilities,
  createSafGrant,
  isAndroidCapabilities,
  isSafGrant,
  type AndroidCapabilities,
  type SafGrant,
} from "../../platform/android/contracts";
import { AndroidBridgeClient } from "../../platform/android/android-bridge";

export type AndroidRun<T> = Readonly<{
  taskId: string;
  result: Promise<T>;
  cancel(reason?: string): boolean;
}>;

function wrapRun<T>(run: TaskRun<T>): AndroidRun<T> {
  return Object.freeze({ taskId: run.taskId, result: run.result, cancel: run.cancel });
}

export class AndroidPlatformService {
  constructor(
    private readonly tasks: TaskManager,
    private readonly bridge: AndroidBridgeClient,
  ) {
    if (!tasks || typeof tasks !== "object" || typeof tasks.run !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "AndroidPlatformService requires TaskManager." });
    }
    if (!bridge || typeof bridge !== "object" || typeof bridge.invoke !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "AndroidPlatformService requires AndroidBridgeClient." });
    }
  }

  negotiateCapabilities(timeoutMs = 10_000): AndroidRun<AndroidCapabilities> {
    const run = this.tasks.run(
      { kind: "system", ownerId: "android:capabilities", timeoutMs },
      async ({ signal }) => {
        const raw = await this.bridge.invoke<Record<string, never>, unknown>(
          "platform.capabilities",
          {},
          signal,
        );
        if (!isAndroidCapabilities(raw)) {
          throw new SevenError({ code: "BRIDGE", message: "Android capability response failed schema validation." });
        }
        return createAndroidCapabilities(raw.capabilities);
      },
    );
    return wrapRun(run);
  }

  persistSafGrant(
    grant: Omit<SafGrant, "schemaVersion">,
    timeoutMs = 10_000,
  ): AndroidRun<SafGrant> {
    const normalized = createSafGrant(grant);
    const run = this.tasks.run(
      { kind: "system", ownerId: `android:saf:${normalized.uri}`, timeoutMs },
      async ({ signal }) => {
        const raw = await this.bridge.invoke<SafGrant, unknown>(
          "saf.persistGrant",
          normalized,
          signal,
        );
        if (!isSafGrant(raw)) {
          throw new SevenError({ code: "BRIDGE", message: "Android SAF grant response failed schema validation." });
        }
        if (
          raw.uri !== normalized.uri ||
          raw.read !== normalized.read ||
          raw.write !== normalized.write ||
          raw.persisted !== true
        ) {
          throw new SevenError({ code: "BRIDGE", message: "Android SAF grant response does not match the requested grant." });
        }
        return createSafGrant({
          uri: raw.uri,
          read: raw.read,
          write: raw.write,
          persisted: raw.persisted,
          issuedAt: raw.issuedAt,
        });
      },
    );
    return wrapRun(run);
  }

  releaseSafGrant(uri: string, timeoutMs = 10_000): AndroidRun<boolean> {
    const grant = createSafGrant({
      uri,
      read: true,
      write: false,
      persisted: true,
      issuedAt: 0,
    });
    const run = this.tasks.run(
      { kind: "system", ownerId: `android:saf:${grant.uri}`, timeoutMs },
      async ({ signal }) => {
        const raw = await this.bridge.invoke<{ uri: string }, unknown>(
          "saf.releaseGrant",
          { uri: grant.uri },
          signal,
        );
        if (
          !raw ||
          typeof raw !== "object" ||
          Array.isArray(raw) ||
          typeof (raw as { released?: unknown }).released !== "boolean"
        ) {
          throw new SevenError({ code: "BRIDGE", message: "Android SAF release response is malformed." });
        }
        return (raw as { released: boolean }).released;
      },
    );
    return wrapRun(run);
  }
}
