import { SevenError } from "../core/errors";

export type ReleaseGateState = "PASS" | "FAIL" | "BLOCKED" | "INCONCLUSIVE";

export type ReleaseGateId =
  | "strict-compile"
  | "automated-tests"
  | "android-bridge"
  | "built-payload-hash"
  | "installed-payload-identity"
  | "installed-smoke"
  | "critical-regressions";

export type ReleaseGateEvidence = Readonly<{
  id: ReleaseGateId;
  state: ReleaseGateState;
  evidenceId: string | null;
  detail: string | null;
}>;

export type ReleaseGateReport = Readonly<{
  schemaVersion: 1;
  state: ReleaseGateState;
  releaseReady: boolean;
  gates: readonly ReleaseGateEvidence[];
}>;

export type ReleasePayloadFile = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
}>;

export type ReleasePayloadManifest = Readonly<{
  schemaVersion: 1;
  artifactId: string;
  version: string;
  files: readonly ReleasePayloadFile[];
  payloadSha256: string;
}>;

export type InstalledArtifactIdentity = Readonly<{
  artifactId: string;
  version: string;
  payloadSha256: string;
}>;

const REQUIRED_GATES: readonly ReleaseGateId[] = Object.freeze([
  "strict-compile",
  "automated-tests",
  "android-bridge",
  "built-payload-hash",
  "installed-payload-identity",
  "installed-smoke",
  "critical-regressions",
]);

function canonical(value: unknown, field: string, max = 2048): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function sha256Hex(value: unknown, field: string): string {
  const normalized = canonical(value, field, 128).toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be SHA-256 hex.` });
  }
  return normalized;
}

function safePath(value: unknown): string {
  const path = canonical(value, "Release payload path", 1024).replace(/\\/g, "/");
  if (
    path.startsWith("/") ||
    path.includes("\u0000") ||
    path.split("/").some((segment) => segment === "." || segment === ".." || segment === "")
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Release payload path is unsafe." });
  }
  return path;
}

function cloneEvidence(value: ReleaseGateEvidence): ReleaseGateEvidence {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "VALIDATION", message: "Release gate evidence must be an object." });
  }
  if (!REQUIRED_GATES.includes(value.id)) {
    throw new SevenError({ code: "VALIDATION", message: "Release gate id is invalid." });
  }
  if (!["PASS", "FAIL", "BLOCKED", "INCONCLUSIVE"].includes(value.state)) {
    throw new SevenError({ code: "VALIDATION", message: "Release gate state is invalid." });
  }
  return Object.freeze({
    id: value.id,
    state: value.state,
    evidenceId: value.evidenceId === null ? null : canonical(value.evidenceId, "Release evidence id", 512),
    detail: value.detail === null ? null : canonical(value.detail, "Release evidence detail", 2048),
  });
}

export async function sha256Text(value: string): Promise<string> {
  if (typeof value !== "string") {
    throw new SevenError({ code: "VALIDATION", message: "SHA-256 input must be text." });
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function canonicalPayloadDescriptor(input: Readonly<{
  artifactId: string;
  version: string;
  files: readonly ReleasePayloadFile[];
}>): string {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new SevenError({ code: "VALIDATION", message: "Release payload descriptor must be an object." });
  }
  if (!Array.isArray(input.files) || input.files.length === 0 || input.files.length > 10_000) {
    throw new SevenError({ code: "VALIDATION", message: "Release payload must contain 1-10000 files." });
  }
  const seen = new Set<string>();
  const files = input.files.map((file) => {
    if (!file || typeof file !== "object" || Array.isArray(file)) {
      throw new SevenError({ code: "VALIDATION", message: "Release payload file is malformed." });
    }
    const path = safePath(file.path);
    if (seen.has(path)) {
      throw new SevenError({ code: "VALIDATION", message: "Release payload contains duplicate paths." });
    }
    seen.add(path);
    if (!Number.isSafeInteger(file.sizeBytes) || file.sizeBytes < 0) {
      throw new SevenError({ code: "VALIDATION", message: "Release payload file size is invalid." });
    }
    return Object.freeze({
      path,
      sha256: sha256Hex(file.sha256, "Release file hash"),
      sizeBytes: file.sizeBytes,
    });
  }).sort((a, b) => a.path.localeCompare(b.path));

  return JSON.stringify({
    schemaVersion: 1,
    artifactId: canonical(input.artifactId, "Release artifact id", 512),
    version: canonical(input.version, "Release version", 256),
    files,
  });
}

export async function createReleasePayloadManifest(input: Readonly<{
  artifactId: string;
  version: string;
  files: readonly ReleasePayloadFile[];
}>): Promise<ReleasePayloadManifest> {
  const descriptor = canonicalPayloadDescriptor(input);
  const parsed = JSON.parse(descriptor) as {
    artifactId: string;
    version: string;
    files: ReleasePayloadFile[];
  };
  return Object.freeze({
    schemaVersion: 1 as const,
    artifactId: parsed.artifactId,
    version: parsed.version,
    files: Object.freeze(parsed.files.map((file) => Object.freeze({ ...file }))),
    payloadSha256: await sha256Text(descriptor),
  });
}

export function verifyInstalledArtifactIdentity(
  manifest: ReleasePayloadManifest,
  installed: InstalledArtifactIdentity,
): ReleaseGateEvidence {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest) || manifest.schemaVersion !== 1) {
    throw new SevenError({ code: "VALIDATION", message: "Release manifest is malformed." });
  }
  if (!installed || typeof installed !== "object" || Array.isArray(installed)) {
    throw new SevenError({ code: "VALIDATION", message: "Installed artifact identity is malformed." });
  }
  const artifactId = canonical(installed.artifactId, "Installed artifact id", 512);
  const version = canonical(installed.version, "Installed artifact version", 256);
  const payloadSha256 = sha256Hex(installed.payloadSha256, "Installed payload hash");

  const pass =
    artifactId === manifest.artifactId &&
    version === manifest.version &&
    payloadSha256 === manifest.payloadSha256;

  return Object.freeze({
    id: "installed-payload-identity" as const,
    state: pass ? "PASS" as const : "FAIL" as const,
    evidenceId: payloadSha256,
    detail: pass ? "Installed artifact identity matches the built payload manifest." : "Installed artifact identity does not match the built payload manifest.",
  });
}

function aggregateState(gates: readonly ReleaseGateEvidence[]): ReleaseGateState {
  if (gates.some((gate) => gate.state === "FAIL")) return "FAIL";
  if (gates.some((gate) => gate.state === "BLOCKED")) return "BLOCKED";
  if (gates.some((gate) => gate.state === "INCONCLUSIVE")) return "INCONCLUSIVE";
  return "PASS";
}

export function evaluateReleaseGates(
  evidence: readonly ReleaseGateEvidence[],
): ReleaseGateReport {
  if (!Array.isArray(evidence)) {
    throw new SevenError({ code: "VALIDATION", message: "Release evidence must be an array." });
  }
  const byId = new Map<ReleaseGateId, ReleaseGateEvidence>();
  for (const raw of evidence) {
    const item = cloneEvidence(raw);
    if (byId.has(item.id)) {
      throw new SevenError({ code: "VALIDATION", message: "Release evidence contains duplicate gate ids." });
    }
    byId.set(item.id, item);
  }

  const gates = REQUIRED_GATES.map((id) =>
    byId.get(id) ??
    Object.freeze({
      id,
      state: "INCONCLUSIVE" as const,
      evidenceId: null,
      detail: "Required release evidence is missing.",
    }),
  );
  const state = aggregateState(gates);
  return Object.freeze({
    schemaVersion: 1 as const,
    state,
    releaseReady: state === "PASS",
    gates: Object.freeze(gates.map(cloneEvidence)),
  });
}

export function passGate(
  id: ReleaseGateId,
  evidenceId: string,
  detail: string,
): ReleaseGateEvidence {
  return cloneEvidence({
    id,
    state: "PASS",
    evidenceId,
    detail,
  });
}
