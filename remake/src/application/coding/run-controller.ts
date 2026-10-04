import type { CodingEvidenceEvent, CodingRun, CodingStage } from "./contracts";

const TRANSITIONS: Readonly<Record<CodingStage, readonly CodingStage[]>> = {
  UNDERSTAND: ["INSPECT", "BLOCKED", "FAILED"],
  INSPECT: ["RESEARCH", "PLAN", "BLOCKED", "FAILED"],
  RESEARCH: ["PLAN", "BLOCKED", "FAILED"],
  PLAN: ["EDIT", "BLOCKED", "FAILED"],
  EDIT: ["TEST", "BLOCKED", "FAILED"],
  TEST: ["DEBUG", "VERIFY", "BLOCKED", "FAILED"],
  DEBUG: ["EDIT", "TEST", "BLOCKED", "FAILED"],
  VERIFY: ["REVIEW", "DEBUG", "BLOCKED", "FAILED"],
  REVIEW: ["DOCUMENT", "DEBUG", "BLOCKED", "FAILED"],
  DOCUMENT: ["COMPLETE", "BLOCKED", "FAILED"],
  COMPLETE: [],
  BLOCKED: [],
  FAILED: [],
};

function canonicalText(value: string, field: string, max: number): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > max) {
    throw new Error(`${field} must be canonical text.`);
  }
  return value;
}

function canonicalId(value: string, field: string): string {
  return canonicalText(value, field, 256);
}

function timestamp(value?: string): string {
  const at = value ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(at))) throw new Error("Evidence timestamp is invalid.");
  return at;
}

export function createCodingRun(input: Readonly<{
  runId: string;
  taskId: string;
  acceptanceCriteria: readonly string[];
  at?: string;
}>): CodingRun {
  if (!Array.isArray(input.acceptanceCriteria) || input.acceptanceCriteria.length === 0) {
    throw new Error("Coding run requires explicit acceptance criteria.");
  }
  const acceptanceCriteria = Object.freeze(
    input.acceptanceCriteria.map((criterion) => canonicalText(criterion, "Acceptance criterion", 2048)),
  );
  const event: CodingEvidenceEvent = Object.freeze({
    stage: "UNDERSTAND",
    at: timestamp(input.at),
    kind: "run-created",
    summary: "Task normalized with explicit acceptance criteria.",
  });
  return Object.freeze({
    version: 1,
    runId: canonicalId(input.runId, "Run id"),
    taskId: canonicalId(input.taskId, "Task id"),
    stage: "UNDERSTAND",
    acceptanceCriteria,
    history: Object.freeze([event]),
  });
}

export function transitionCodingRun(
  run: CodingRun,
  next: CodingStage,
  evidence: Omit<CodingEvidenceEvent, "stage" | "at"> & Readonly<{ at?: string }>,
): CodingRun {
  if (!TRANSITIONS[run.stage].includes(next)) {
    throw new Error(`Illegal coding transition: ${run.stage} -> ${next}`);
  }
  const event: CodingEvidenceEvent = Object.freeze({
    stage: next,
    at: timestamp(evidence.at),
    kind: canonicalText(evidence.kind, "Evidence kind", 128),
    summary: canonicalText(evidence.summary, "Evidence summary", 2048),
    ...(evidence.data ? { data: Object.freeze({ ...evidence.data }) } : {}),
  });
  return Object.freeze({ ...run, stage: next, history: Object.freeze([...run.history, event]) });
}

export function allowedCodingTransitions(stage: CodingStage): readonly CodingStage[] {
  return TRANSITIONS[stage];
}
