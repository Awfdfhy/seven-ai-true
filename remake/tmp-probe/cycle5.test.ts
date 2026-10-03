import { describe, expect, it } from "vitest";
import { ShellStore } from "../src/ui/shell/shell-store";
import { ThemeService } from "../src/ui/system/theme-service";

describe("theme auto semantics", () => {
  it("probe: prefers dark system + auto", async () => {
    const shell = new ShellStore({ themePreference: "auto" });
    const timers = new Map<number, () => void>();
    let nextId = 1;
    const scheduler = {
      setTimeout(cb: () => void) { const id = nextId++; timers.set(id, cb); return id; },
      clearTimeout(handle: unknown) { timers.delete(handle as number); },
    };
    const mediaListeners: Array<() => void> = [];
    (globalThis as any).matchMedia = (query: string) => ({
      matches: query.includes("dark") ? true : false,
      addEventListener: (_: string, cb: () => void) => { mediaListeners.push(cb); },
      removeEventListener: () => undefined,
    });
    const service = new ThemeService(shell, () => new Date(2026, 9, 4, 12, 0, 0), scheduler);
    service.start();
    console.log("effectiveTheme at noon with OS dark:", shell.getSnapshot().effectiveTheme);
    console.log("timers scheduled in auto:", timers.size);
    service.stop();
    service.onVisibilityResume();
    console.log("timers after stop:", timers.size);
    mediaListeners.forEach((cb) => cb());
    console.log("timers after media change:", timers.size);
    delete (globalThis as any).matchMedia;
    expect(true).toBe(true);
  });
});
