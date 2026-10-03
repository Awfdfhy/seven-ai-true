import { describe, expect, it, vi } from "vitest";
import { ShellStore } from "../../ui/shell/shell-store";
import { ThemeService, type ThemeScheduler } from "../../ui/system/theme-service";
import { sevenCopy } from "../../ui/system/locale";

describe("Phase 10 Product/UI polish", () => {
  it("uses one immutable shell snapshot for workspace, locale, direction and viewport state", () => {
    const shell = new ShellStore();
    const initial = shell.getSnapshot();
    expect(Object.isFrozen(initial)).toBe(true);
    shell.setWorkspace("world");
    shell.setLocale("ar");
    shell.setViewport(360, 640, true);
    const next = shell.getSnapshot();
    expect(next.activeWorkspace).toBe("world");
    expect(next.locale).toBe("ar");
    expect(next.direction).toBe("rtl");
    expect(next.viewportWidth).toBe(360);
    expect(next.keyboardVisible).toBe(true);
    expect(initial.activeWorkspace).toBe("core");
  });

  it("derives localized user-facing copy without creating a second runtime state source", () => {
    expect(sevenCopy("en").research).toBe("Research");
    expect(sevenCopy("ar").research).toBe("البحث");
    expect(sevenCopy("ar").language).toBe("English");
  });

  it("ThemeService owns exactly one auto-theme timer generation", () => {
    const shell = new ShellStore({ themePreference: "auto" });
    const callbacks = new Map<number, () => void>();
    let nextId = 1;
    const cleared: number[] = [];
    const scheduler: ThemeScheduler = {
      setTimeout(callback) {
        const id = nextId++;
        callbacks.set(id, callback);
        return id;
      },
      clearTimeout(handle) {
        cleared.push(handle as number);
        callbacks.delete(handle as number);
      },
    };
    const service = new ThemeService(shell, () => new Date(2026, 9, 3, 12, 0, 0), scheduler);
    service.start();
    expect(shell.getSnapshot().effectiveTheme).toBe("light");
    expect(callbacks.size).toBe(1);
    service.onVisibilityResume();
    expect(callbacks.size).toBe(1);
    expect(cleared).toHaveLength(1);
    service.stop();
    expect(callbacks.size).toBe(0);
  });

  it("manual theme preference removes the auto timer and becomes authoritative", () => {
    const shell = new ShellStore({ themePreference: "auto" });
    const scheduler = {
      setTimeout: vi.fn(() => 1),
      clearTimeout: vi.fn(),
    };
    const service = new ThemeService(shell, () => new Date(2026, 9, 3, 23, 0, 0), scheduler);
    service.start();
    expect(shell.getSnapshot().effectiveTheme).toBe("dark");
    service.setPreference("light");
    expect(shell.getSnapshot().themePreference).toBe("light");
    expect(shell.getSnapshot().effectiveTheme).toBe("light");
    expect(scheduler.clearTimeout).toHaveBeenCalled();
    expect(scheduler.setTimeout).toHaveBeenCalledTimes(1);
  });

  it("shell subscriptions are deterministic and observer failures cannot corrupt state", () => {
    const shell = new ShellStore();
    const good = vi.fn();
    shell.subscribe(() => { throw new Error("observer failure"); });
    shell.subscribe(good);
    shell.setWorkspace("research");
    expect(good).toHaveBeenCalledTimes(1);
    expect(shell.getSnapshot().activeWorkspace).toBe("research");
  });

  it("validates minimum product-state inputs instead of accepting impossible viewport/theme state", () => {
    expect(() => new ShellStore({ viewportWidth: -1 })).toThrow();
    const shell = new ShellStore();
    expect(() => shell.setViewport(Number.NaN, 800, false)).toThrow();
    expect(() => shell.setThemePreference("neon" as never)).toThrow();
  });
});
