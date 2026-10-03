import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createSevenRuntime } from "./kernel/seven-runtime";
import { App } from "./ui/App";
import "./ui/app.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Seven root element is missing.");

const runtime = createSevenRuntime({
  initialShell: {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    reducedMotion:
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  },
});

const root = createRoot(rootElement);
const render = () => {
  root.render(
    <StrictMode>
      <App runtime={runtime} />
    </StrictMode>,
  );
};

void runtime.kernel.start().then(render, render);
