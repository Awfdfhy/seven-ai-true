import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import "./ui/app.css";

const root = document.getElementById("root");
if (!root) throw new Error("Seven root element is missing.");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
