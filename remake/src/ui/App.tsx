import { useMemo, useState } from "react";
import { TaskManager } from "../core/task-manager";

export function App() {
  const taskManager = useMemo(() => new TaskManager(), []);
  const [status, setStatus] = useState("Clean core ready");

  return (
    <main className="seven-app">
      <header className="seven-header">
        <div>
          <p className="seven-eyebrow">SEVEN REMAKE V3</p>
          <h1>Seven</h1>
        </div>
        <span className="seven-status" aria-live="polite">
          {status}
        </span>
      </header>

      <section className="seven-stage" aria-labelledby="foundation-title">
        <p className="seven-kicker">Foundation 01</p>
        <h2 id="foundation-title">One runtime. One owner. Explicit state.</h2>
        <p>
          The remake has started from a clean TypeScript core. The legacy Seven
          runtime is not loaded here.
        </p>

        <button
          type="button"
          onClick={() => {
            const active = taskManager.listActive().length;
            setStatus(active === 0 ? "Task runtime healthy" : `${active} active task(s)`);
          }}
        >
          Check core
        </button>
      </section>
    </main>
  );
}
