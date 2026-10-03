import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TaskManager } from "../core/task-manager";
import {
  ShellStore,
  type SevenWorkspace,
  type ThemePreference,
} from "./shell/shell-store";
import { ThemeService } from "./system/theme-service";
import { sevenCopy } from "./system/locale";

const WORKSPACES: readonly SevenWorkspace[] = ["core", "research", "build", "world"];
const THEMES: readonly ThemePreference[] = ["auto", "light", "dark"];

export function App() {
  const taskManager = useMemo(() => new TaskManager(), []);
  const shell = useMemo(() => new ShellStore({
    viewportWidth: typeof window === "undefined" ? 390 : window.innerWidth,
    viewportHeight: typeof window === "undefined" ? 844 : window.innerHeight,
    reducedMotion:
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  }), []);
  const theme = useMemo(() => new ThemeService(shell), [shell]);
  const snapshot = useSyncExternalStore(shell.subscribe, shell.getSnapshot, shell.getSnapshot);
  const [status, setStatus] = useState("Runtime ready");
  const copy = sevenCopy(snapshot.locale);

  useEffect(() => {
    theme.start();
    const onResize = () => {
      const viewport = window.visualViewport;
      const width = viewport?.width ?? window.innerWidth;
      const height = viewport?.height ?? window.innerHeight;
      const keyboardVisible = window.innerHeight - height > 120;
      shell.setViewport(width, height, keyboardVisible);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") theme.onVisibilityResume();
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      theme.stop();
    };
  }, [shell, theme]);

  useEffect(() => {
    setStatus(copy.status);
  }, [copy.status]);

  const cycleTheme = () => {
    const index = THEMES.indexOf(snapshot.themePreference);
    theme.setPreference(THEMES[(index + 1) % THEMES.length] ?? "auto");
  };

  return (
    <main
      className="seven-app"
      dir={snapshot.direction}
      lang={snapshot.locale}
      data-theme={snapshot.effectiveTheme}
      data-reduced-motion={snapshot.reducedMotion ? "true" : "false"}
      data-keyboard={snapshot.keyboardVisible ? "visible" : "hidden"}
    >
      <header className="seven-header">
        <div>
          <p className="seven-eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
        <span className="seven-status" aria-live="polite">{status}</span>
      </header>

      <nav className="seven-workspaces" aria-label="Seven workspaces">
        {WORKSPACES.map((workspace) => (
          <button
            key={workspace}
            type="button"
            className="seven-workspace-button"
            aria-pressed={snapshot.activeWorkspace === workspace}
            onClick={() => shell.setWorkspace(workspace)}
          >
            {copy[workspace]}
          </button>
        ))}
      </nav>

      <section className="seven-stage" aria-labelledby="seven-stage-title">
        <p className="seven-kicker">{copy[snapshot.activeWorkspace]}</p>
        <h2 id="seven-stage-title">{copy.headline}</h2>
        <p>{copy.description}</p>

        <div className="seven-actions">
          <button
            type="button"
            onClick={() => {
              const active = taskManager.listActive().length;
              setStatus(active === 0 ? copy.status : `${active} active`);
            }}
          >
            {copy.check}
          </button>
          <button type="button" className="seven-secondary" onClick={cycleTheme}>
            {copy.theme}: {snapshot.themePreference}
          </button>
          <button
            type="button"
            className="seven-secondary"
            onClick={() => shell.setLocale(snapshot.locale === "en" ? "ar" : "en")}
          >
            {copy.language}
          </button>
        </div>
      </section>
    </main>
  );
}
