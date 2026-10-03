import { useEffect, useState, useSyncExternalStore } from "react";
import type { SevenRuntime } from "../kernel/seven-runtime";
import {
  type SevenWorkspace,
  type ThemePreference,
} from "./shell/shell-store";
import { sevenCopy } from "./system/locale";

const WORKSPACES: readonly SevenWorkspace[] = ["core", "research", "build", "world"];
const THEMES: readonly ThemePreference[] = ["auto", "light", "dark"];

export function App({ runtime }: Readonly<{ runtime: SevenRuntime }>) {
  const { taskManager, shell, theme, kernel } = runtime;
  const snapshot = useSyncExternalStore(shell.subscribe, shell.getSnapshot, shell.getSnapshot);
  const [status, setStatus] = useState(
    kernel.snapshot().status === "failed" ? "Runtime recovery required" : "Runtime ready",
  );
  const copy = sevenCopy(snapshot.locale);

  useEffect(() => {
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
    };
  }, [shell, theme]);

  useEffect(() => {
    if (kernel.snapshot().status === "running") setStatus(copy.status);
  }, [copy.status, kernel]);

  const cycleTheme = () => {
    const index = THEMES.indexOf(snapshot.themePreference);
    theme.setPreference(THEMES[(index + 1) % THEMES.length] ?? "auto");
  };

  const checkRuntime = () => {
    const current = kernel.snapshot().status;
    if (current === "failed" || current === "stopped" || current === "idle") {
      setStatus(snapshot.locale === "ar" ? "جارٍ تشغيل النظام" : "Starting runtime");
      void kernel.start().then(
        () => setStatus(copy.status),
        () => setStatus(snapshot.locale === "ar" ? "يلزم استرداد النظام" : "Runtime recovery required"),
      );
      return;
    }
    const active = taskManager.listActive().length;
    setStatus(active === 0 ? copy.status : `${active} active`);
  };

  return (
    <main
      className="seven-app"
      dir={snapshot.direction}
      lang={snapshot.locale}
      data-theme={snapshot.effectiveTheme}
      data-reduced-motion={snapshot.reducedMotion ? "true" : "false"}
      data-keyboard={snapshot.keyboardVisible ? "visible" : "hidden"}
      data-kernel={kernel.snapshot().status}
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
          <button type="button" onClick={checkRuntime}>
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
