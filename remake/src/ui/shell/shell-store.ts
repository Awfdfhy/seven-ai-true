import { SevenError } from "../../core/errors";

export type SevenWorkspace = "core" | "research" | "build" | "world";
export type SevenLocale = "en" | "ar";
export type SevenDirection = "ltr" | "rtl";
export type ThemePreference = "auto" | "light" | "dark";
export type EffectiveTheme = "light" | "dark";

export type ShellSnapshot = Readonly<{
  activeWorkspace: SevenWorkspace;
  sidebarOpen: boolean;
  dialog: string | null;
  locale: SevenLocale;
  direction: SevenDirection;
  themePreference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  reducedMotion: boolean;
  viewportWidth: number;
  viewportHeight: number;
  keyboardVisible: boolean;
}>;

type Listener = () => void;

function direction(locale: SevenLocale): SevenDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

function validDimension(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a non-negative finite number.` });
  }
  return value;
}

export class ShellStore {
  private readonly listeners = new Set<Listener>();
  private state: ShellSnapshot;

  constructor(initial: Partial<ShellSnapshot> = {}) {
    if (!initial || typeof initial !== "object" || Array.isArray(initial)) {
      throw new SevenError({ code: "VALIDATION", message: "ShellStore initial state must be an object." });
    }
    const locale = initial.locale ?? "en";
    if (locale !== "en" && locale !== "ar") {
      throw new SevenError({ code: "VALIDATION", message: "Shell locale is unsupported." });
    }
    const preference = initial.themePreference ?? "auto";
    if (preference !== "auto" && preference !== "light" && preference !== "dark") {
      throw new SevenError({ code: "VALIDATION", message: "Shell theme preference is invalid." });
    }
    const effective = initial.effectiveTheme ?? "dark";
    if (effective !== "light" && effective !== "dark") {
      throw new SevenError({ code: "VALIDATION", message: "Shell effective theme is invalid." });
    }
    const workspace = initial.activeWorkspace ?? "core";
    if (!["core","research","build","world"].includes(workspace)) {
      throw new SevenError({ code: "VALIDATION", message: "Shell workspace is invalid." });
    }
    this.state = this.freeze({
      activeWorkspace: workspace,
      sidebarOpen: initial.sidebarOpen ?? false,
      dialog: initial.dialog ?? null,
      locale,
      direction: direction(locale),
      themePreference: preference,
      effectiveTheme: effective,
      reducedMotion: initial.reducedMotion ?? false,
      viewportWidth: validDimension(initial.viewportWidth ?? 390, "viewportWidth"),
      viewportHeight: validDimension(initial.viewportHeight ?? 844, "viewportHeight"),
      keyboardVisible: initial.keyboardVisible ?? false,
    });
  }

  getSnapshot = (): ShellSnapshot => this.state;

  subscribe = (listener: Listener): (() => void) => {
    if (typeof listener !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Shell listener must be a function." });
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  setWorkspace(workspace: SevenWorkspace): void {
    if (!["core","research","build","world"].includes(workspace)) {
      throw new SevenError({ code: "VALIDATION", message: "Shell workspace is invalid." });
    }
    this.patch({ activeWorkspace: workspace });
  }

  setLocale(locale: SevenLocale): void {
    if (locale !== "en" && locale !== "ar") {
      throw new SevenError({ code: "VALIDATION", message: "Shell locale is unsupported." });
    }
    this.patch({ locale, direction: direction(locale) });
  }

  setThemePreference(preference: ThemePreference): void {
    if (preference !== "auto" && preference !== "light" && preference !== "dark") {
      throw new SevenError({ code: "VALIDATION", message: "Shell theme preference is invalid." });
    }
    this.patch({ themePreference: preference });
  }

  setEffectiveTheme(theme: EffectiveTheme): void {
    if (theme !== "light" && theme !== "dark") {
      throw new SevenError({ code: "VALIDATION", message: "Shell effective theme is invalid." });
    }
    this.patch({ effectiveTheme: theme });
  }

  setReducedMotion(value: boolean): void {
    if (typeof value !== "boolean") {
      throw new SevenError({ code: "VALIDATION", message: "Reduced motion flag must be boolean." });
    }
    this.patch({ reducedMotion: value });
  }

  setSidebarOpen(value: boolean): void {
    if (typeof value !== "boolean") throw new SevenError({ code: "VALIDATION", message: "Sidebar flag must be boolean." });
    this.patch({ sidebarOpen: value });
  }

  setDialog(dialog: string | null): void {
    if (dialog !== null && (typeof dialog !== "string" || !dialog.trim() || dialog !== dialog.trim())) {
      throw new SevenError({ code: "VALIDATION", message: "Dialog id must be canonical or null." });
    }
    this.patch({ dialog });
  }

  setViewport(width: number, height: number, keyboardVisible: boolean): void {
    if (typeof keyboardVisible !== "boolean") {
      throw new SevenError({ code: "VALIDATION", message: "Keyboard visibility must be boolean." });
    }
    this.patch({
      viewportWidth: validDimension(width, "viewportWidth"),
      viewportHeight: validDimension(height, "viewportHeight"),
      keyboardVisible,
    });
  }

  private patch(update: Partial<ShellSnapshot>): void {
    const next = this.freeze({ ...this.state, ...update });
    if (
      Object.keys(update).every((key) =>
        this.state[key as keyof ShellSnapshot] === next[key as keyof ShellSnapshot],
      )
    ) return;
    this.state = next;
    for (const listener of [...this.listeners]) {
      try { listener(); } catch { /* observers cannot corrupt shell state */ }
    }
  }

  private freeze(snapshot: ShellSnapshot): ShellSnapshot {
    return Object.freeze({ ...snapshot });
  }
}
