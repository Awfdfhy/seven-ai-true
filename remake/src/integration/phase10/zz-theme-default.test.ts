import { describe, expect, it } from "vitest";
import { ShellStore } from "../../ui/shell/shell-store";
import { ThemeService } from "../../ui/system/theme-service";

describe("ThemeService default scheduler", () => {
  it("arms the real boundary timer in a DOM-less global scope", () => {
    const shell = new ShellStore({ themePreference: "auto" });
    const service = new ThemeService(shell, () => new Date(2026, 9, 4, 12, 0, 0));
    expect(() => service.start()).not.toThrow();
    expect(shell.getSnapshot().effectiveTheme).toBe("light");
    service.stop();
  });
});
