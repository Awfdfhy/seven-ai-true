import { SevenError } from "../core/errors";
import {
  evaluateReleaseGates,
  type ReleaseGateEvidence,
  type ReleaseGateReport,
} from "./release-assurance";

export type PhaseCompletion = Readonly<{
  phase: number;
  state: "COMPLETE" | "INCOMPLETE";
  evidenceId: string | null;
}>;

export type FinalClosureReport = Readonly<{
  schemaVersion: 1;
  state: "PASS" | "FAIL" | "BLOCKED" | "INCONCLUSIVE";
  phasesComplete: boolean;
  release: ReleaseGateReport;
  phases: readonly PhaseCompletion[];
}>;

function normalizePhase(value: PhaseCompletion): PhaseCompletion {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "VALIDATION", message: "Phase completion record is malformed." });
  }
  if (!Number.isSafeInteger(value.phase) || value.phase < 1 || value.phase > 12) {
    throw new SevenError({ code: "VALIDATION", message: "Phase number must be 1-12." });
  }
  if (value.state !== "COMPLETE" && value.state !== "INCOMPLETE") {
    throw new SevenError({ code: "VALIDATION", message: "Phase completion state is invalid." });
  }
  if (
    value.evidenceId !== null &&
    (typeof value.evidenceId !== "string" || !value.evidenceId.trim() || value.evidenceId !== value.evidenceId.trim())
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Phase evidence id must be canonical or null." });
  }
  return Object.freeze({
    phase: value.phase,
    state: value.state,
    evidenceId: value.evidenceId,
  });
}

export function evaluateFinalClosure(
  phases: readonly PhaseCompletion[],
  releaseEvidence: readonly ReleaseGateEvidence[],
): FinalClosureReport {
  if (!Array.isArray(phases)) {
    throw new SevenError({ code: "VALIDATION", message: "Phase completion input must be an array." });
  }
  const map = new Map<number, PhaseCompletion>();
  for (const raw of phases) {
    const phase = normalizePhase(raw);
    if (map.has(phase.phase)) {
      throw new SevenError({ code: "VALIDATION", message: "Phase completion input contains duplicates." });
    }
    map.set(phase.phase, phase);
  }
  const normalized = Object.freeze(
    Array.from({ length: 12 }, (_, index) =>
      map.get(index + 1) ??
      Object.freeze({
        phase: index + 1,
        state: "INCOMPLETE" as const,
        evidenceId: null,
      }),
    ),
  );
  const phasesComplete = normalized.every(
    (phase) => phase.state === "COMPLETE" && phase.evidenceId !== null,
  );
  const release = evaluateReleaseGates(releaseEvidence);
  const state = !phasesComplete
    ? "INCONCLUSIVE" as const
    : release.state;

  return Object.freeze({
    schemaVersion: 1 as const,
    state,
    phasesComplete,
    release,
    phases: normalized,
  });
}
