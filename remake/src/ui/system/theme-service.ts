import { SevenError } from "../../core/errors";
import type { EffectiveTheme, ShellStore, ThemePreference } from "../shell/shell-store";

export interface ThemeScheduler {
  setTimeout(callback: () => void, delayMs: number): unknown;
  clearTimeout(handle: unknown): void;
}

const defaultScheduler: ThemeScheduler = {
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

function themeFor(preference: ThemePreference, date: Date): EffectiveTheme {
  if (preference === "light" || preference === "dark") return preference;
  const hour = date.getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
}

function delayToBoundary(date: Date): number {
  const next = new Date(date.getTime());
  const hour = date.getHours();
  if (hour < 7) {
    next.setHours(7, 0, 0, 0);
  } else if (hour < 19) {
    next.setHours(19, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(7, 0, 0, 0);
  }
  return Math.max(1, next.getTime() - date.getTime());
}

export class ThemeService {
  private timer: unknown | null = null;
  private generation = 0;
  private started = false;

  constructor(
    private readonly shell: ShellStore,
    private readonly now: () => Date = () => new Date(),
    private readonly scheduler: ThemeScheduler = defaultScheduler,
  ) {
    if (!shell || typeof shell !== "object" || typeof shell.getSnapshot !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "ThemeService requires ShellStore." });
    }
    if (typeof now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "ThemeService requires a clock." });
    }
    if (!scheduler || typeof scheduler.setTimeout !== "function" || typeof scheduler.clearTimeout !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "ThemeService scheduler is malformed." });
    }
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    this.reconcile();
  }

  stop(): void {
    this.started = false;
    this.generation += 1;
    if (this.timer !== null) {
      this.scheduler.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  setPreference(preference: ThemePreference): void {
    this.shell.setThemePreference(preference);
    this.reconcile();
  }

  onVisibilityResume(): void {
    this.reconcile();
  }

  reconcile(): void {
    const date = this.now();
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
      throw new SevenError({ code: "VALIDATION", message: "ThemeService clock returned an invalid Date." });
    }
    const preference = this.shell.getSnapshot().themePreference;
    this.shell.setEffectiveTheme(themeFor(preference, date));

    this.generation += 1;
    const generation = this.generation;
    if (this.timer !== null) {
      this.scheduler.clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.started || preference !== "auto") return;

    this.timer = this.scheduler.setTimeout(() => {
      if (!this.started || generation !== this.generation) return;
      this.timer = null;
      this.reconcile();
    }, delayToBoundary(date));
  }
}
