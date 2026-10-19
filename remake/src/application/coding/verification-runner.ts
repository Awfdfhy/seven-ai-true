import type { VerificationCommand, VerificationPlan } from "./contracts";
import { sha256Text } from "./hash";

export type VerificationExecution = Readonly<{
  commandId: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  startedAt: number;
  completedAt: number;
  timedOut?: boolean;
}>;

export interface VerificationExecutionPort {
  execute(command: VerificationCommand, signal: AbortSignal): Promise<VerificationExecution>;
}

export type VerificationEvidence = Readonly<{
  version: 1;
  status: "PASS" | "FAIL" | "CANCELLED";
  changedPaths: readonly string[];
  results: readonly Readonly<VerificationExecution & { outputSha256: string }>[];
  failedCommandIds: readonly string[];
  missingMandatoryCommandIds: readonly string[];
}>;

function validExecution(execution: VerificationExecution, command: VerificationCommand): void {
  if (!execution || typeof execution !== "object" || execution.commandId !== command.id) {
    throw new Error("Verification executor returned a mismatched command result.");
  }
  if (!Number.isSafeInteger(execution.exitCode) || execution.exitCode < 0 || execution.exitCode > 255) {
    throw new Error("Verification executor returned an invalid exit code.");
  }
  if (typeof execution.stdout !== "string" || typeof execution.stderr !== "string") {
    throw new Error("Verification executor returned invalid output.");
  }
  if (!Number.isFinite(execution.startedAt) || !Number.isFinite(execution.completedAt) || execution.completedAt < execution.startedAt) {
    throw new Error("Verification executor returned invalid timestamps.");
  }
}

export async function runVerificationPlan(
  plan: VerificationPlan,
  executor: VerificationExecutionPort,
  signal: AbortSignal,
): Promise<VerificationEvidence> {
  if (!plan || !Array.isArray(plan.commands) || plan.commands.length === 0) throw new Error("Verification plan is empty.");
  const commandIds = plan.commands.map((command) => command.id);
  if (new Set(commandIds).size !== commandIds.length) throw new Error("Verification plan contains duplicate command ids.");
  const results: Array<Readonly<VerificationExecution & { outputSha256: string }>> = [];
  const failed: string[] = [];
  let cancelled = false;
  for (const command of plan.commands) {
    if (signal.aborted) { cancelled = true; break; }
    let execution: VerificationExecution;
    try {
      execution = await executor.execute(command, signal);
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) {
        cancelled = true;
        break;
      }
      throw error;
    }
    validExecution(execution, command);
    const outputSha256 = await sha256Text(`${execution.stdout}\u0000${execution.stderr}`);
    results.push(Object.freeze({ ...execution, outputSha256 }));
    if (execution.exitCode !== 0 || execution.timedOut === true) failed.push(command.id);
  }
  const completedIds = new Set(results.map((result) => result.commandId));
  const missingMandatory = plan.mandatoryCommandIds.filter((id) => !completedIds.has(id));
  const status = cancelled ? "CANCELLED" : failed.length || missingMandatory.length ? "FAIL" : "PASS";
  return Object.freeze({
    version: 1,
    status,
    changedPaths: Object.freeze([...plan.changedPaths]),
    results: Object.freeze(results),
    failedCommandIds: Object.freeze(failed),
    missingMandatoryCommandIds: Object.freeze(missingMandatory),
  });
}
