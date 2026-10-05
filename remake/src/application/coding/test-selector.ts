import type { VerificationCommand, VerificationPlan, VerificationRule } from "./contracts";
import { canonicalRepositoryPath } from "./workspace-truth";

export const SEVEN_CODING_VERIFICATION_RULES: readonly VerificationRule[] = Object.freeze([
  Object.freeze({
    id: "repository-diff-check",
    when: () => true,
    command: Object.freeze({
      id: "repository-diff-check",
      cwd: ".",
      command: "git diff --check",
      phase: "mandatory",
      reason: "Every candidate must pass Git whitespace/conflict-marker validation.",
    }),
  }),
  Object.freeze({
    id: "coding-unit",
    when: (path: string) => path.startsWith("remake/src/application/coding/"),
    command: Object.freeze({
      id: "coding-unit",
      cwd: "remake",
      command: "npm test -- src/application/coding",
      phase: "targeted",
      reason: "Coding runtime changed.",
    }),
  }),
  Object.freeze({
    id: "remake-typecheck",
    when: (path: string) => path.startsWith("remake/src/") || path === "remake/package.json",
    command: Object.freeze({
      id: "remake-typecheck",
      cwd: "remake",
      command: "npm run typecheck",
      phase: "mandatory",
      reason: "TypeScript product source changed.",
    }),
  }),
  Object.freeze({
    id: "remake-tests",
    when: (path: string) => path.startsWith("remake/"),
    command: Object.freeze({
      id: "remake-tests",
      cwd: "remake",
      command: "npm test",
      phase: "regression",
      reason: "Seven Remake product changed.",
    }),
  }),
  Object.freeze({
    id: "remake-build",
    when: (path: string) => path.startsWith("remake/"),
    command: Object.freeze({
      id: "remake-build",
      cwd: "remake",
      command: "npm run build",
      phase: "mandatory",
      reason: "Product source must still compile and bundle.",
    }),
  }),
]);

function dedupe(commands: readonly VerificationCommand[]): readonly VerificationCommand[] {
  const map = new Map<string, VerificationCommand>();
  for (const command of commands) if (!map.has(command.id)) map.set(command.id, command);
  return Object.freeze([...map.values()]);
}

export function selectVerificationPlan(
  rawChangedPaths: readonly string[],
  rules: readonly VerificationRule[] = SEVEN_CODING_VERIFICATION_RULES,
  supplemental: readonly VerificationCommand[] = [],
): VerificationPlan {
  if (!Array.isArray(rawChangedPaths) || rawChangedPaths.length === 0) {
    throw new Error("Verification requires at least one changed path.");
  }
  const changedPaths = Object.freeze([...new Set(rawChangedPaths.map(canonicalRepositoryPath))].sort());
  const selected: VerificationCommand[] = [];
  for (const rule of rules) {
    if (changedPaths.some((path) => rule.when(path))) selected.push(rule.command);
  }
  selected.push(...supplemental);
  const commands = dedupe(selected);
  if (commands.length === 0) throw new Error("No deterministic verification rule covers this change set.");
  const mandatoryCommandIds = Object.freeze(commands.filter((command) => command.phase === "mandatory").map((command) => command.id));
  return Object.freeze({ changedPaths, commands, mandatoryCommandIds });
}
